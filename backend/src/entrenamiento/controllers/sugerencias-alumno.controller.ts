import { Controller, Get } from '@nestjs/common';
import { SugerenciasQueryService } from '../queries/sugerencias-query.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Yo } from '../../common/decorators/yo.decorator';
import { UsuarioToken } from '../../common/interfaces/usuario-token.interface';

@Controller('sugerencias')
@Roles('alumno')
export class SugerenciasAlumnoController {
  constructor(private readonly sugerencias: SugerenciasQueryService) {}

  @Get()
  mias(@Yo() usuario: UsuarioToken) {
    return this.sugerencias.misSugerencias(usuario.sub);
  }
}
