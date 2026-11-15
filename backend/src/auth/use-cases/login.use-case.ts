import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { LoginDto } from '../dto/login.dto';
import { usuarioPublico } from '../mappers/usuario.mapper';

@Injectable()
export class LoginUseCase {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarios: Repository<Usuario>,
    private readonly jwt: JwtService,
  ) {}

  async ejecutar(dto: LoginDto) {
    const usuario = await this.usuarios.findOneBy({ email: dto.email });
    if (!usuario || !(await bcrypt.compare(dto.password, usuario.passwordHash))) {
      throw new UnauthorizedException('Alguna o ambas de las credenciales son inválidas');
    }
    return {
      token: this.jwt.sign({ sub: usuario.id, rol: usuario.rol }),
      usuario: usuarioPublico(usuario),
    };
  }
}
