import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { usuarioPublico } from '../mappers/usuario.mapper';

@Injectable()
export class AuthQueryService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarios: Repository<Usuario>,
  ) {}

  async yo(id: number) {
    return usuarioPublico(await this.usuarios.findOneByOrFail({ id }));
  }

  async listarEntrenadores() {
    const entrenadores = await this.usuarios.find({
      where: { rol: 'entrenador' },
      order: { apellido: 'ASC', nombre: 'ASC' },
    });
    return entrenadores.map(usuarioPublico);
  }
}
