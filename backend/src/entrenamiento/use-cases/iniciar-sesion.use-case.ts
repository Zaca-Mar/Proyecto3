import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sesion } from '../entities/sesion.entity';
import { Plan } from '../../planes/entities/plan.entity';
import { AsistenciasQueryService } from '../queries/asistencias-query.service';
import { fechaHoy } from '../../common/utils/fechas';

/** US5: una sola sesión abierta; si ya existe, se devuelve esa. */
@Injectable()
export class IniciarSesionUseCase {
  constructor(
    @InjectRepository(Sesion)
    private readonly sesiones: Repository<Sesion>,
    @InjectRepository(Plan)
    private readonly planes: Repository<Plan>,
    private readonly asistencias: AsistenciasQueryService,
  ) {}

  async ejecutar(alumnoId: number) {
    await this.asistencias.exigirHoy(alumnoId);

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
}
