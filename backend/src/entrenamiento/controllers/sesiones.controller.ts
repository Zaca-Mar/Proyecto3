import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { SesionesService } from '../services/sesiones.service';
import { RegistrarSerieDto } from '../dto/registrar-serie.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Yo } from '../../common/decorators/yo.decorator';
import { UsuarioToken } from '../../common/interfaces/usuario-token.interface';

@Controller('sesiones')
@Roles('alumno')
export class SesionesController {
  constructor(private readonly sesiones: SesionesService) {}

  /** US5: si ya hay un bloque abierto, se devuelve ese en lugar de crear otro. */
  @Post('iniciar')
  iniciar(@Yo() usuario: UsuarioToken) {
    return this.sesiones.iniciar(usuario.sub);
  }

  @Get('actual')
  actual(@Yo() usuario: UsuarioToken) {
    return this.sesiones.actual(usuario.sub);
  }

  @Post(':id/series')
  agregarSerie(
    @Yo() usuario: UsuarioToken,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RegistrarSerieDto,
  ) {
    return this.sesiones.agregarSerie(usuario.sub, id, dto);
  }

  @Post(':id/cerrar')
  cerrar(@Yo() usuario: UsuarioToken, @Param('id', ParseIntPipe) id: number) {
    return this.sesiones.cerrar(usuario.sub, id);
  }
}
