import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../entities/plan.entity';
import { Sesion } from '../../entrenamiento/entities/sesion.entity';

@Injectable()
export class PlanesQueryService {
  constructor(
    @InjectRepository(Plan)
    private readonly planes: Repository<Plan>,
    @InjectRepository(Sesion)
    private readonly sesiones: Repository<Sesion>,
  ) {}

  /** Listado de planes del entrenador con un resumen de su estructura. */
  async listar(entrenadorId: number) {
    const planes = await this.planes.find({
      where: { entrenadorId },
      relations: { dias: { ejercicios: true } },
      order: { id: 'DESC' },
    });
    return planes.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      alumnoId: p.alumnoId,
      activo: p.activo,
      creado: p.creado,
      dias: p.dias.length,
      ejercicios: p.dias.reduce((total, d) => total + d.ejercicios.length, 0),
    }));
  }

  async obtener(entrenadorId: number, planId: number) {
    const plan = await this.planes.findOne({
      where: { id: planId, entrenadorId },
      relations: { dias: { ejercicios: { ejercicio: true } } },
    });
    if (!plan) throw new NotFoundException('Plan no encontrado');
    return plan;
  }

  /** US4: plan del día. El día surge de cuántas sesiones cerradas lleva el alumno con este plan. */
  async delDia(alumnoId: number) {
    const plan = await this.planes.findOne({
      where: { alumnoId, activo: true },
      relations: { dias: { ejercicios: { ejercicio: true } } },
    });
    if (!plan) return { plan: null, dia: null };

    const dias = [...plan.dias].sort((a, b) => a.orden - b.orden);
    if (!dias.length) return { plan: { id: plan.id, nombre: plan.nombre, totalDias: 0 }, dia: null };

    const hechas = await this.sesiones.countBy({
      alumnoId,
      planId: plan.id,
      estado: 'cerrada',
    });
    const dia = dias[hechas % dias.length];

    return {
      plan: { id: plan.id, nombre: plan.nombre, totalDias: dias.length },
      dia: {
        id: dia.id,
        nombre: dia.nombre,
        orden: dia.orden,
        ejercicios: [...dia.ejercicios].sort((a, b) => a.orden - b.orden),
      },
    };
  }
}
