import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { MolestiasService } from './molestias.service';
import { CrearMolestiaDto } from './dto/crear-molestia.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Yo } from '../common/decorators/yo.decorator';
import { UsuarioToken } from '../common/interfaces/usuario-token.interface';

@Controller('molestias')
export class MolestiasController {
  constructor(private readonly molestias: MolestiasService) {}

  @Roles('alumno')
  @Post()
  crear(@Yo() usuario: UsuarioToken, @Body() dto: CrearMolestiaDto) {
    return this.molestias.crear(usuario.sub, dto);
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
    return this.molestias.marcarLeida(usuario.sub, id);
  }
}
