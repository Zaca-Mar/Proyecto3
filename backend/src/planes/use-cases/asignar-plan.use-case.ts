import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../entities/plan.entity';
import { VinculosService } from '../../common/services/vinculos.service';
import { conClave } from '../../common/utils/mutex';

/** US13: al asignar un plan nuevo, el anterior se desactiva y el historial se conserva. */
@Injectable()
export class AsignarPlanUseCase {
  constructor(
    @InjectRepository(Plan)
    private readonly planes: Repository<Plan>,
    private readonly vinculos: VinculosService,
  ) {}

  async ejecutar(entrenadorId: number, planId: number, alumnoId: number) {
    await this.vinculos.exigir(entrenadorId, alumnoId);

    return conClave(`asignar-plan:${alumnoId}`, async () => {
      const plan = await this.planes.findOneBy({ id: planId, entrenadorId });
      if (!plan) throw new NotFoundException('Plan no encontrado');

      await this.planes.update({ alumnoId, activo: true }, { activo: false });
      plan.alumnoId = alumnoId;
      plan.activo = true;
      await this.planes.save(plan);

      return { mensaje: 'Plan asignado. El anterior quedó inactivo.' };
    });
  }
}
