import { Body, Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { DecidirSugerenciaUseCase } from '../use-cases/decidir-sugerencia.use-case';
import { SugerenciasQueryService } from '../queries/sugerencias-query.service';
import { DecidirSugerenciaDto } from '../dto/decidir-sugerencia.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Yo } from '../../common/decorators/yo.decorator';
import { UsuarioToken } from '../../common/interfaces/usuario-token.interface';

@Controller('sugerencias')
@Roles('entrenador')
export class SugerenciasEntrenadorController {
  constructor(
    private readonly decidirSugerencia: DecidirSugerenciaUseCase,
    private readonly sugerencias: SugerenciasQueryService,
  ) {}

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
    return this.decidirSugerencia.ejecutar(usuario.sub, id, dto.estado);
  }
}
