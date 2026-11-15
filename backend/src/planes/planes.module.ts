import { Module } from '@nestjs/common';
import { PlanesController } from './planes.controller';
import { CrearPlanUseCase } from './use-cases/crear-plan.use-case';
import { AsignarPlanUseCase } from './use-cases/asignar-plan.use-case';
import { PlanesQueryService } from './queries/planes-query.service';

@Module({
  controllers: [PlanesController],
  providers: [CrearPlanUseCase, AsignarPlanUseCase, PlanesQueryService],
})
export class PlanesModule {}
