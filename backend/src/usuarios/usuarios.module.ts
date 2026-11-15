import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { VincularAlumnoUseCase } from './use-cases/vincular-alumno.use-case';
import { UsuariosQueryService } from './queries/usuarios-query.service';
import { ResumenQueryService } from './queries/resumen-query.service';

@Module({
  controllers: [UsuariosController],
  providers: [VincularAlumnoUseCase, UsuariosQueryService, ResumenQueryService],
})
export class UsuariosModule {}
