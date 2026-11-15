import { Body, Controller, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { EditarSerieUseCase } from '../use-cases/editar-serie.use-case';
import { EditarSerieDto } from '../dto/editar-serie.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Yo } from '../../common/decorators/yo.decorator';
import { UsuarioToken } from '../../common/interfaces/usuario-token.interface';

@Controller('series')
@Roles('alumno')
export class SeriesController {
  constructor(private readonly editarSerie: EditarSerieUseCase) {}

  /** US5: se puede editar mientras la sesión siga abierta. */
  @Patch(':id')
  editar(
    @Yo() usuario: UsuarioToken,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditarSerieDto,
  ) {
    return this.editarSerie.ejecutar(usuario.sub, id, dto);
  }
}
