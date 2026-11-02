import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { Publica } from '../common/decorators/publica.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Yo } from '../common/decorators/yo.decorator';
import { UsuarioToken } from '../common/interfaces/usuario-token.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** US17: registro público de alumnos. */
  @Publica()
  @Post('registro')
  registro(@Body() dto: RegistroDto) {
    return this.auth.registrar(dto, 'alumno');
  }

  /** US1: el administrador da de alta entrenadores con su rol. */
  @Roles('admin')
  @Post('entrenadores')
  nuevoEntrenador(@Body() dto: RegistroDto) {
    return this.auth.registrar(dto, 'entrenador');
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
    return this.auth.login(dto);
  }

  @Get('yo')
  yo(@Yo() usuario: UsuarioToken) {
    return this.auth.yo(usuario.sub);
  }
}
