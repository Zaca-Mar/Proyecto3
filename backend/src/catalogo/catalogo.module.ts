import { Module } from '@nestjs/common';
import { CatalogoController } from './catalogo.controller';
import { CrearEjercicioUseCase } from './use-cases/crear-ejercicio.use-case';
import { CatalogoQueryService } from './queries/catalogo-query.service';

@Module({
  controllers: [CatalogoController],
  providers: [CrearEjercicioUseCase, CatalogoQueryService],
})
export class CatalogoModule {}
