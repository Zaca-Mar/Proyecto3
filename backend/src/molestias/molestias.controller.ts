import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CrearMolestiaUseCase } from './use-cases/crear-molestia.use-case';
import { MarcarMolestiaLeidaUseCase } from './use-cases/marcar-molestia-leida.use-case';
import { MolestiasQueryService } from './queries/molestias-query.service';
import { CrearMolestiaDto } from './dto/crear-molestia.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Yo } from '../common/decorators/yo.decorator';
import { UsuarioToken } from '../common/interfaces/usuario-token.interface';

@Controller('molestias')
export class MolestiasController {
  constructor(
    private readonly crearMolestia: CrearMolestiaUseCase,
    private readonly marcarLeida: MarcarMolestiaLeidaUseCase,
    private readonly molestias: MolestiasQueryService,
  ) {}

  @Roles('alumno')
  @Post()
  crear(@Yo() usuario: UsuarioToken, @Body() dto: CrearMolestiaDto) {
    return this.crearMolestia.ejecutar(usuario.sub, dto);
  }

  @Roles('alumno')
  @Get('mias')
  mias(@Yo() usuario: UsuarioToken) {
    return this.molestias.mias(usuario.sub);
  }

  @Roles('entrenador')
  @Get()
  lista(@Yo() usuario: UsuarioToken) {
    return this.molestias.delEntrenador(usuario.sub);
  }

  @Roles('entrenador')
  @Patch(':id/leida')
  leida(@Yo() usuario: UsuarioToken, @Param('id', ParseIntPipe) id: number) {
    return this.marcarLeida.ejecutar(usuario.sub, id);
  }
}
