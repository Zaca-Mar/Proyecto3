import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { UsuariosService } from './services/usuarios.service';
import { VincularAlumnoDto } from './dto/vincular-alumno.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Yo } from '../common/decorators/yo.decorator';
import { UsuarioToken } from '../common/interfaces/usuario-token.interface';

@Controller()
@Roles('entrenador')
export class UsuariosController {
  constructor(private readonly usuarios: UsuariosService) {}

  @Post('vinculos')
  vincular(@Yo() usuario: UsuarioToken, @Body() dto: VincularAlumnoDto) {
    return this.usuarios.vincular(usuario.sub, dto.dni);
  }

  @Get('alumnos')
  alumnos(@Yo() usuario: UsuarioToken) {
    return this.usuarios.alumnos(usuario.sub);
  }

  @Get('alumnos/:id/resumen')
  resumen(@Yo() usuario: UsuarioToken, @Param('id', ParseIntPipe) id: number) {
    return this.usuarios.resumen(usuario.sub, id);
  }
}
