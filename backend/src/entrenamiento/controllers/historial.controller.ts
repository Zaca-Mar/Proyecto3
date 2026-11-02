import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HistorialService } from '../services/historial.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Yo } from '../../common/decorators/yo.decorator';
import { UsuarioToken } from '../../common/interfaces/usuario-token.interface';

@Controller('historial')
@Roles('alumno')
export class HistorialController {
  constructor(private readonly historial: HistorialService) {}

  /** US6: historial completo agrupado por ejercicio. */
  @Get()
  todos(@Yo() usuario: UsuarioToken) {
    return this.historial.todos(usuario.sub);
  }

  @Get(':ejercicioId')
  porEjercicio(
    @Yo() usuario: UsuarioToken,
    @Param('ejercicioId', ParseIntPipe) ejercicioId: number,
  ) {
    return this.historial.porEjercicio(usuario.sub, ejercicioId);
  }
}
