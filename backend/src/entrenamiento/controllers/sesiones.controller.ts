import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { IniciarSesionUseCase } from '../use-cases/iniciar-sesion.use-case';
import { AgregarSerieUseCase } from '../use-cases/agregar-serie.use-case';
import { CerrarSesionUseCase } from '../use-cases/cerrar-sesion.use-case';
import { SesionesQueryService } from '../queries/sesiones-query.service';
import { RegistrarSerieDto } from '../dto/registrar-serie.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Yo } from '../../common/decorators/yo.decorator';
import { UsuarioToken } from '../../common/interfaces/usuario-token.interface';

@Controller('sesiones')
@Roles('alumno')
export class SesionesController {
  constructor(
    private readonly iniciarSesion: IniciarSesionUseCase,
    private readonly agregarSerie: AgregarSerieUseCase,
    private readonly cerrarSesion: CerrarSesionUseCase,
    private readonly sesiones: SesionesQueryService,
  ) {}

  /** US5: si ya hay un bloque abierto, se devuelve ese en lugar de crear otro. */
  @Post('iniciar')
  iniciar(@Yo() usuario: UsuarioToken) {
    return this.iniciarSesion.ejecutar(usuario.sub);
  }

  @Get('actual')
  actual(@Yo() usuario: UsuarioToken) {
    return this.sesiones.actual(usuario.sub);
  }

  @Post(':id/series')
  agregar(
    @Yo() usuario: UsuarioToken,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RegistrarSerieDto,
  ) {
    return this.agregarSerie.ejecutar(usuario.sub, id, dto);
  }

  @Post(':id/cerrar')
  cerrar(@Yo() usuario: UsuarioToken, @Param('id', ParseIntPipe) id: number) {
    return this.cerrarSesion.ejecutar(usuario.sub, id);
  }
}
