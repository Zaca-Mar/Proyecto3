import { Body, Controller, Get, Post } from '@nestjs/common';
import { RegistrarUsuarioUseCase } from './use-cases/registrar-usuario.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { AuthQueryService } from './queries/auth-query.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { Publica } from '../common/decorators/publica.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Yo } from '../common/decorators/yo.decorator';
import { UsuarioToken } from '../common/interfaces/usuario-token.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registrarUsuario: RegistrarUsuarioUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly auth: AuthQueryService,
  ) {}

  /** US17: registro público de alumnos. */
  @Publica()
  @Post('registro')
  registro(@Body() dto: RegistroDto) {
    return this.registrarUsuario.ejecutar(dto, 'alumno');
  }

  /** US1: el administrador da de alta entrenadores con su rol. */
  @Roles('admin')
  @Post('entrenadores')
  nuevoEntrenador(@Body() dto: RegistroDto) {
    return this.registrarUsuario.ejecutar(dto, 'entrenador');
  }

  @Roles('admin')
  @Get('entrenadores')
  entrenadores() {
    return this.auth.listarEntrenadores();
  }

  /** US2: inicio de sesión para cualquier rol. */
  @Publica()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.ejecutar(dto);
  }

  @Get('yo')
  yo(@Yo() usuario: UsuarioToken) {
    return this.auth.yo(usuario.sub);
  }
}
