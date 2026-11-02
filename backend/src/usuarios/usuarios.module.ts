import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './services/usuarios.service';
import { ResumenService } from './services/resumen.service';

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService, ResumenService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
