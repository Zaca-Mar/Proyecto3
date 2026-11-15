import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { VincularAlumnoUseCase } from './use-cases/vincular-alumno.use-case';
import { UsuariosQueryService } from './queries/usuarios-query.service';
import { ResumenQueryService } from './queries/resumen-query.service';
import { VincularAlumnoDto } from './dto/vincular-alumno.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Yo } from '../common/decorators/yo.decorator';
import { UsuarioToken } from '../common/interfaces/usuario-token.interface';

@Controller()
@Roles('entrenador')
export class UsuariosController {
  constructor(
    private readonly vincularAlumno: VincularAlumnoUseCase,
    private readonly usuarios: UsuariosQueryService,
    private readonly resumen: ResumenQueryService,
  ) {}

  @Post('vinculos')
  vincular(@Yo() usuario: UsuarioToken, @Body() dto: VincularAlumnoDto) {
    return this.vincularAlumno.ejecutar(usuario.sub, dto.dni);
  }

  @Get('alumnos')
  alumnos(@Yo() usuario: UsuarioToken) {
    return this.usuarios.alumnos(usuario.sub);
  }

  @Get('alumnos/:id/resumen')
  resumenAlumno(@Yo() usuario: UsuarioToken, @Param('id', ParseIntPipe) id: number) {
    return this.resumen.paraEntrenador(usuario.sub, id);
  }
}
