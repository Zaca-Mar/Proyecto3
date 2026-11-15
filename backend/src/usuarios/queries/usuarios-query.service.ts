import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { VinculosService } from '../../common/services/vinculos.service';

@Injectable()
export class UsuariosQueryService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarios: Repository<Usuario>,
    private readonly vinculos: VinculosService,
  ) {}

  /** Listado de alumnos vinculados al entrenador. */
  async alumnos(entrenadorId: number) {
    const ids = await this.vinculos.alumnosDe(entrenadorId);
    if (!ids.length) return [];
    const alumnos = await this.usuarios.find({
      where: { id: In(ids) },
      order: { apellido: 'ASC', nombre: 'ASC' },
    });
    return alumnos.map((a) => ({
      id: a.id,
      nombre: a.nombre,
      apellido: a.apellido,
      dni: a.dni,
      email: a.email,
      telefono: a.telefono,
    }));
  }
}
