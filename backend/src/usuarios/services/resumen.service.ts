import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Plan } from '../../planes/entities/plan.entity';
import { Sesion } from '../../entrenamiento/entities/sesion.entity';
import { Asistencia } from '../../entrenamiento/entities/asistencia.entity';
import { Molestia } from '../../molestias/entities/molestia.entity';
import { Ejercicio } from '../../catalogo/entities/ejercicio.entity';
import { VinculosService } from '../../common/services/vinculos.service';
import { fechaHace } from '../../common/utils/fechas';

interface CargaEjercicio {
  ejercicioId: number;
  ejercicio: string;
  grupoMuscular: string;
  ultimaCarga: number;
  mejorCarga: number;
  series: number;
  ultimaFecha: string;
}

@Injectable()
export class ResumenService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarios: Repository<Usuario>,
    @InjectRepository(Plan)
    private readonly planes: Repository<Plan>,
    @InjectRepository(Sesion)
    private readonly sesiones: Repository<Sesion>,
    @InjectRepository(Asistencia)
    private readonly asistencias: Repository<Asistencia>,
    @InjectRepository(Molestia)
    private readonly molestias: Repository<Molestia>,
    @InjectRepository(Ejercicio)
    private readonly ejercicios: Repository<Ejercicio>,
    private readonly vinculos: VinculosService,
  ) {}

  async paraEntrenador(entrenadorId: number, alumnoId: number) {
    await this.vinculos.exigir(entrenadorId, alumnoId);

    const alumno = await this.usuarios.findOneByOrFail({ id: alumnoId });
    const plan = await this.planes.findOne({ where: { alumnoId, activo: true } });
    const sesiones = await this.sesiones.find({
      where: { alumnoId, estado: 'cerrada' },
      relations: { series: true },
      order: { id: 'DESC' },
    });
    const hace7 = fechaHace(6);

    const asistenciaSemana = await this.asistencias
      .createQueryBuilder('a')
      .where('a.alumnoId = :alumnoId AND a.fecha >= :hace7', { alumnoId, hace7 })
      .getCount();
    const asistenciaTotal = await this.asistencias.countBy({ alumnoId });

    const molestias = await this.molestias.find({
      where: { alumnoId },
      relations: { ejercicio: true },
      order: { id: 'DESC' },
    });

    const ejercicios = new Map(
      (await this.ejercicios.find()).map((e) => [e.id, e]),
    );

    const records: Record<string, { carga: number; repeticiones: number; fecha: string }> = {};
    const volumenSemanal: Record<string, number> = {};
    const cargas = new Map<number, CargaEjercicio>();

    for (const sesion of sesiones) {
      for (const serie of sesion.series) {
        const ejercicio = ejercicios.get(serie.ejercicioId);
        if (!ejercicio) continue;

        const record = records[ejercicio.nombre];
        if (
          !record ||
          serie.carga > record.carga ||
          (serie.carga === record.carga && serie.repeticiones > record.repeticiones)
        ) {
          records[ejercicio.nombre] = {
            carga: serie.carga,
            repeticiones: serie.repeticiones,
            fecha: sesion.fecha,
          };
        }

        if (sesion.fecha >= hace7) {
          volumenSemanal[ejercicio.grupoMuscular] =
            (volumenSemanal[ejercicio.grupoMuscular] || 0) + 1;
        }

        const carga = cargas.get(serie.ejercicioId);
        if (!carga) {
          cargas.set(serie.ejercicioId, {
            ejercicioId: ejercicio.id,
            ejercicio: ejercicio.nombre,
            grupoMuscular: ejercicio.grupoMuscular,
            ultimaCarga: serie.carga,
            mejorCarga: serie.carga,
            series: 1,
            ultimaFecha: sesion.fecha,
          });
        } else {
          carga.series += 1;
          carga.mejorCarga = Math.max(carga.mejorCarga, serie.carga);
        }
      }
    }

    // Las sesiones vienen de la más nueva a la más vieja: la primera aparición
    // de cada ejercicio es su última carga registrada.
    const cargasPorEjercicio = [...cargas.values()].sort((a, b) =>
      a.grupoMuscular.localeCompare(b.grupoMuscular) || a.ejercicio.localeCompare(b.ejercicio),
    );

    const ultimasSesiones = sesiones.slice(0, 6).map((s) => ({
      id: s.id,
      fecha: s.fecha,
      series: s.series.length,
      diaId: s.diaId,
    }));

    return {
      alumno: {
        id: alumno.id,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        dni: alumno.dni,
        email: alumno.email,
        telefono: alumno.telefono,
      },
      esNuevo: sesiones.length === 0,
      planActivo: plan ? { id: plan.id, nombre: plan.nombre } : null,
      asistenciaSemana,
      asistenciaTotal,
      ultimaSesion: ultimasSesiones[0] ?? null,
      ultimasSesiones,
      records,
      cargasPorEjercicio,
      volumenSemanal,
      molestias: molestias.map((m) => ({
        id: m.id,
        ejercicioId: m.ejercicioId,
        ejercicio: m.ejercicio.nombre,
        zona: m.zona,
        observacion: m.observacion,
        leida: m.leida,
        creada: m.creada,
      })),
    };
  }
}
