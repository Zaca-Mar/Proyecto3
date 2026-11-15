import { Module } from '@nestjs/common';
import { MolestiasController } from './molestias.controller';
import { CrearMolestiaUseCase } from './use-cases/crear-molestia.use-case';
import { MarcarMolestiaLeidaUseCase } from './use-cases/marcar-molestia-leida.use-case';
import { MolestiasQueryService } from './queries/molestias-query.service';

@Module({
  controllers: [MolestiasController],
  providers: [CrearMolestiaUseCase, MarcarMolestiaLeidaUseCase, MolestiasQueryService],
})
export class MolestiasModule {}
