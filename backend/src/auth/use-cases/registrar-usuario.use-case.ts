import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Rol, Usuario } from '../../usuarios/entities/usuario.entity';
import { RegistroDto } from '../dto/registro.dto';
import { usuarioPublico } from '../mappers/usuario.mapper';

@Injectable()
export class RegistrarUsuarioUseCase {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarios: Repository<Usuario>,
  ) {}

  async ejecutar(dto: RegistroDto, rol: Rol) {
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
    return usuarioPublico(usuario);
  }
}
