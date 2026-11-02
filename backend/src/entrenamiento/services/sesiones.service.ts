import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sesion } from '../entities/sesion.entity';
import { Serie } from '../entities/serie.entity';
import { Plan } from '../../planes/entities/plan.entity';
import { Molestia } from '../../molestias/entities/molestia.entity';
import { Sugerencia } from '../entities/sugerencia.entity';
import { RegistrarSerieDto } from '../dto/registrar-serie.dto';
import { EditarSerieDto } from '../dto/editar-serie.dto';
import { AsistenciasService } from './asistencias.service';
import { sugerirCarga } from '../../progresion/engine';
import { fechaHace, fechaHoy } from '../../common/utils/fechas';

@Injectable()
export class SesionesService {
  constructor(
    @InjectRepository(Sesion)
    private readonly sesiones: Repository<Sesion>,
    @InjectRepository(Serie)
    private readonly series: Repository<Serie>,
    @InjectRepository(Plan)
    private readonly planes: Repository<Plan>,
    @InjectRepository(Molestia)
    private readonly molestias: Repository<Molestia>,
    @InjectRepository(Sugerencia)
    private readonly sugerencias: Repository<Sugerencia>,
    private readonly asistencias: AsistenciasService,
  ) {}

  /** US5: una sola sesión abierta; si ya existe, se devuelve esa. */
  async iniciar(alumnoId: number) {
    await this.asistencias.exigirAsistenciaHoy(alumnoId);

    const abierta = await this.sesiones.findOne({
      where: { alumnoId, estado: 'abierta' },
      relations: { series: true },
    });
    if (abierta) return abierta;

    const plan = await this.planes.findOne({
      where: { alumnoId, activo: true },
      relations: { dias: { ejercicios: { ejercicio: true } } },
    });
    if (!plan) throw new NotFoundException('No tenés un plan activo');

    const dias = [...plan.dias].sort((a, b) => a.orden - b.orden);
    if (!dias.length) throw new NotFoundException('Tu plan no tiene días configurados');

    const hechas = await this.sesiones.countBy({
      alumnoId,
      planId: plan.id,
      estado: 'cerrada',
    });
    const dia = dias[hechas % dias.length];

    const prescripto = [...dia.ejercicios]
      .sort((a, b) => a.orden - b.orden)
      .map((e) => ({
        ejercicioId: e.ejercicioId,
        nombre: e.ejercicio.nombre,
        grupoMuscular: e.ejercicio.grupoMuscular,
        bloque: e.bloque,
        series: e.series,
        repMin: e.repMin,
        repMax: e.repMax,
        cargaObjetivo: e.cargaObjetivo,
        descanso: e.descanso,
        incremento: e.ejercicio.incremento,
      }));

    const sesion = await this.sesiones.save(
      this.sesiones.create({
        alumnoId,
        planId: plan.id,
        diaId: dia.id,
        fecha: fechaHoy(),
        estado: 'abierta',
        prescripto,
      }),
    );
    return { ...sesion, series: [] };
  }

  actual(alumnoId: number) {
    return this.sesiones.findOne({
      where: { alumnoId, estado: 'abierta' },
      relations: { series: true },
    });
  }

  private async abierta(alumnoId: number, sesionId: number) {
    const sesion = await this.sesiones.findOne({
      where: { id: sesionId, alumnoId },
      relations: { series: true },
    });
    if (!sesion) throw new NotFoundException('Sesión no encontrada');
    if (sesion.estado !== 'abierta') {
      throw new ForbiddenException('La sesión está cerrada y no admite cambios');
    }
    return sesion;
  }

  async agregarSerie(alumnoId: number, sesionId: number, dto: RegistrarSerieDto) {
    const sesion = await this.abierta(alumnoId, sesionId);
    if (!sesion.prescripto.some((p) => p.ejercicioId === dto.ejercicioId)) {
      throw new BadRequestException('Ese ejercicio no es parte de la sesión');
    }
    const numero =
      sesion.series.filter((s) => s.ejercicioId === dto.ejercicioId).length + 1;
    return this.series.save(
      this.series.create({
        ...dto,
        numero,
        sesion: { id: sesion.id } as Sesion,
      }),
    );
  }

  async editarSerie(alumnoId: number, serieId: number, dto: EditarSerieDto) {
    const serie = await this.series.findOne({
      where: { id: serieId },
      relations: { sesion: true },
    });
    if (!serie) throw new NotFoundException('Serie no encontrada');
    await this.abierta(alumnoId, serie.sesion.id);

    Object.assign(serie, dto);
    const guardada = await this.series.save(serie);
    return {
      id: guardada.id,
      ejercicioId: guardada.ejercicioId,
      numero: guardada.numero,
      carga: guardada.carga,
      repeticiones: guardada.repeticiones,
      rpe: guardada.rpe,
    };
  }

  /** Cierra la sesión (permanente) y genera una sugerencia por ejercicio de musculación. */
  async cerrar(alumnoId: number, sesionId: number) {
    const sesion = await this.abierta(alumnoId, sesionId);
    sesion.estado = 'cerrada';
    await this.sesiones.save({ id: sesion.id, estado: 'cerrada' });

    const hace14 = fechaHace(14);
    const creadas: Sugerencia[] = [];

    for (const ejercicio of sesion.prescripto.filter((p) => p.bloque === 'musculacion')) {
      const hechas = sesion.series.filter((s) => s.ejercicioId === ejercicio.ejercicioId);
      if (!hechas.length) continue;

      const molestias = await this.molestias.findBy({
        alumnoId,
        ejercicioId: ejercicio.ejercicioId,
      });
      const molestiaReciente = molestias.some(
        (m) => !m.leida || m.creada.toLocaleDateString('sv-SE') >= hace14,
      );

      const resultado = sugerirCarga({
        repMin: ejercicio.repMin,
        repMax: ejercicio.repMax,
        incremento: ejercicio.incremento,
        series: hechas,
        molestiaReciente,
      });

      creadas.push(
        await this.sugerencias.save(
          this.sugerencias.create({
            alumnoId,
            ejercicioId: ejercicio.ejercicioId,
            ejercicioNombre: ejercicio.nombre,
            sesionId: sesion.id,
            accion: resultado.accion,
            carga: resultado.carga,
            repsObjetivo: resultado.repsObjetivo,
            explicacion: resultado.explicacion,
            aviso: resultado.aviso ?? null,
          }),
        ),
      );
    }

    return { sesionId: sesion.id, sugerencias: creadas };
  }
}
