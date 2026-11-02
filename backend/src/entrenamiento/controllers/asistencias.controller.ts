import { Controller, Get, Post } from '@nestjs/common';
import { AsistenciasService } from '../services/asistencias.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Yo } from '../../common/decorators/yo.decorator';
import { UsuarioToken } from '../../common/interfaces/usuario-token.interface';

@Controller('asistencias')
@Roles('alumno')
export class AsistenciasController {
  constructor(private readonly asistencias: AsistenciasService) {}

  /** US12 */
  @Get('hoy')
  hoy(@Yo() usuario: UsuarioToken) {
    return this.asistencias.hoy(usuario.sub);
  }

  @Post()
  registrar(@Yo() usuario: UsuarioToken) {
    return this.asistencias.registrar(usuario.sub);
  }
}
