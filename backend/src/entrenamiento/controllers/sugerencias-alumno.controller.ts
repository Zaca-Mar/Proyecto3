import { Controller, Get } from '@nestjs/common';
import { SugerenciasService } from '../services/sugerencias.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Yo } from '../../common/decorators/yo.decorator';
import { UsuarioToken } from '../../common/interfaces/usuario-token.interface';

@Controller('sugerencias')
@Roles('alumno')
export class SugerenciasAlumnoController {
  constructor(private readonly sugerencias: SugerenciasService) {}

  @Get()
  mias(@Yo() usuario: UsuarioToken) {
    return this.sugerencias.misSugerencias(usuario.sub);
  }
}
