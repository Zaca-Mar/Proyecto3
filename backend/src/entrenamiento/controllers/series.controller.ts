import { Body, Controller, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { SesionesService } from '../services/sesiones.service';
import { EditarSerieDto } from '../dto/editar-serie.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Yo } from '../../common/decorators/yo.decorator';
import { UsuarioToken } from '../../common/interfaces/usuario-token.interface';

@Controller('series')
@Roles('alumno')
export class SeriesController {
  constructor(private readonly sesiones: SesionesService) {}

  /** US5: se puede editar mientras la sesión siga abierta. */
  @Patch(':id')
  editar(
    @Yo() usuario: UsuarioToken,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditarSerieDto,
  ) {
    return this.sesiones.editarSerie(usuario.sub, id, dto);
  }
}
