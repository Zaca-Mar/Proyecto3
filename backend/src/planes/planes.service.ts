import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { Sesion } from '../entrenamiento/entities/sesion.entity';
import { Molestia } from '../molestias/entities/molestia.entity';
import { CrearPlanDto } from './dto/crear-plan.dto';
import { VinculosService } from '../common/services/vinculos.service';

@Injectable()
export class PlanesService {
  constructor(
    @InjectRepository(Plan)
    private readonly planes: Repository<Plan>,
    @InjectRepository(Molestia)
    private readonly molestias: Repository<Molestia>,
    @InjectRepository(Sesion)
    private readonly sesiones: Repository<Sesion>,
    private readonly vinculos: VinculosService,
  ) {}

  /**
   * US3: se crea solo para alumnos vinculados. Si hay molestias sin leer en
   * alguno de los ejercicios elegidos, se devuelve una advertencia sin impedir
   * la creación del plan.
   */
  async crear(entrenadorId: number, dto: CrearPlanDto) {
    if (dto.alumnoId) await this.vinculos.exigir(entrenadorId, dto.alumnoId);

    const plan = await this.planes.save(
      this.planes.create({
        nombre: dto.nombre,
        entrenadorId,
        alumnoId: dto.alumnoId,
        activo: false,
        dias: dto.dias.map((dia, indiceDia) => ({
          orden: indiceDia,
          nombre: dia.nombre,
          ejercicios: dia.ejercicios.map((ejercicio, indiceEjercicio) => ({
            ...ejercicio,
            orden: indiceEjercicio,
          })),
        })),
      } as DeepPartial<Plan>),
    );

    const advertencias: string[] = [];
    if (dto.alumnoId) {
      const sinLeer = await this.molestias.find({
        where: { alumnoId: dto.alumnoId, leida: false },
        relations: { ejercicio: true },
      });
      const idsElegidos = new Set(
        dto.dias.flatMap((d) => d.ejercicios.map((e) => e.ejercicioId)),
      );
      for (const molestia of sinLeer) {
        if (idsElegidos.has(molestia.ejercicioId)) {
          advertencias.push(
            `El alumno tiene una molestia sin leer en ${molestia.ejercicio.nombre} (${molestia.zona})`,
          );
        }
      }
    }

    return { plan: { id: plan.id, nombre: plan.nombre }, advertencias };
  }

  /** US13: al asignar un plan nuevo, el anterior se desactiva y el historial se conserva. */
  async asignar(entrenadorId: number, planId: number, alumnoId: number) {
    await this.vinculos.exigir(entrenadorId, alumnoId);
    const plan = await this.planes.findOneBy({ id: planId, entrenadorId });
    if (!plan) throw new NotFoundException('Plan no encontrado');

    await this.planes.update({ alumnoId, activo: true }, { activo: false });
    plan.alumnoId = alumnoId;
    plan.activo = true;
    await this.planes.save(plan);

    return { mensaje: 'Plan asignado. El anterior quedó inactivo.' };
  }

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
