import { Body, Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { SugerenciasService } from '../services/sugerencias.service';
import { DecidirSugerenciaDto } from '../dto/decidir-sugerencia.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Yo } from '../../common/decorators/yo.decorator';
import { UsuarioToken } from '../../common/interfaces/usuario-token.interface';

@Controller('sugerencias')
@Roles('entrenador')
export class SugerenciasEntrenadorController {
  constructor(private readonly sugerencias: SugerenciasService) {}

  @Get('pendientes')
  pendientes(@Yo() usuario: UsuarioToken) {
    return this.sugerencias.pendientes(usuario.sub);
  }

  @Patch(':id')
  decidir(
    @Yo() usuario: UsuarioToken,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DecidirSugerenciaDto,
  ) {
    return this.sugerencias.decidir(usuario.sub, id, dto.estado);
  }
}
