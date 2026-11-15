import { Controller, Get, Post } from '@nestjs/common';
import { RegistrarAsistenciaUseCase } from '../use-cases/registrar-asistencia.use-case';
import { AsistenciasQueryService } from '../queries/asistencias-query.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Yo } from '../../common/decorators/yo.decorator';
import { UsuarioToken } from '../../common/interfaces/usuario-token.interface';

@Controller('asistencias')
@Roles('alumno')
export class AsistenciasController {
  constructor(
    private readonly registrarAsistencia: RegistrarAsistenciaUseCase,
    private readonly asistencias: AsistenciasQueryService,
  ) {}

  /** US12 */
  @Get('hoy')
  hoy(@Yo() usuario: UsuarioToken) {
    return this.asistencias.hoy(usuario.sub);
  }

  @Post()
  registrar(@Yo() usuario: UsuarioToken) {
    return this.registrarAsistencia.ejecutar(usuario.sub);
  }
}
