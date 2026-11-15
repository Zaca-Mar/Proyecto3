import { Controller, Get } from '@nestjs/common';
import { EstadisticasQueryService } from '../queries/estadisticas-query.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Yo } from '../../common/decorators/yo.decorator';
import { UsuarioToken } from '../../common/interfaces/usuario-token.interface';

@Controller('estadisticas')
@Roles('alumno')
export class EstadisticasController {
  constructor(private readonly estadisticas: EstadisticasQueryService) {}

  /** US7 */
  @Get()
  calcular(@Yo() usuario: UsuarioToken) {
    return this.estadisticas.calcular(usuario.sub);
  }
}
