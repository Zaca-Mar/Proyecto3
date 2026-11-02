import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Rol, Usuario } from '../usuarios/entities/usuario.entity';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarios: Repository<Usuario>,
    private readonly jwt: JwtService,
  ) {}

  async registrar(dto: RegistroDto, rol: Rol) {
    if (await this.usuarios.findOneBy({ email: dto.email })) {
      throw new ConflictException('Ese email ya está registrado');
    }
    if (await this.usuarios.findOneBy({ dni: dto.dni })) {
      throw new ConflictException('Ese DNI ya está registrado');
    }

    const { password, ...resto } = dto;
    const usuario = await this.usuarios.save(
      this.usuarios.create({
        ...resto,
        passwordHash: await bcrypt.hash(password, 10),
        rol,
      }),
    );
    return this.publico(usuario);
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuarios.findOneBy({ email: dto.email });
    if (!usuario || !(await bcrypt.compare(dto.password, usuario.passwordHash))) {
      throw new UnauthorizedException('Alguna o ambas de las credenciales son inválidas');
    }
    return {
      token: this.jwt.sign({ sub: usuario.id, rol: usuario.rol }),
      usuario: this.publico(usuario),
    };
  }

  async yo(id: number) {
    return this.publico(await this.usuarios.findOneByOrFail({ id }));
  }

  async listarEntrenadores() {
    const entrenadores = await this.usuarios.find({
      where: { rol: 'entrenador' },
      order: { apellido: 'ASC', nombre: 'ASC' },
    });
    return entrenadores.map((u) => this.publico(u));
  }

  private publico(usuario: Usuario) {
    const { passwordHash, ...resto } = usuario;
    return resto;
  }
}
