import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Molestia } from '../entities/molestia.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { VinculosService } from '../../common/services/vinculos.service';

@Injectable()
export class MolestiasQueryService {
  constructor(
    @InjectRepository(Molestia)
    private readonly molestias: Repository<Molestia>,
    @InjectRepository(Usuario)
    private readonly usuarios: Repository<Usuario>,
    private readonly vinculos: VinculosService,
  ) {}

  mias(alumnoId: number) {
    return this.molestias.find({
      where: { alumnoId },
      relations: { ejercicio: true },
      order: { id: 'DESC' },
    });
  }

  /** US14: molestias de mis alumnos, con las pendientes primero. */
  async delEntrenador(entrenadorId: number) {
    const ids = await this.vinculos.alumnosDe(entrenadorId);
    if (!ids.length) return [];

    const alumnos = new Map(
      (await this.usuarios.findBy({ id: In(ids) })).map((a) => [a.id, a]),
    );
    const lista = await this.molestias.find({
      where: { alumnoId: In(ids) },
      relations: { ejercicio: true },
      order: { id: 'DESC' },
    });

    return lista
      .map((m) => ({
        id: m.id,
        alumno: `${alumnos.get(m.alumnoId)!.nombre} ${alumnos.get(m.alumnoId)!.apellido}`,
        alumnoId: m.alumnoId,
        ejercicio: m.ejercicio.nombre,
        ejercicioId: m.ejercicioId,
        zona: m.zona,
        observacion: m.observacion,
        leida: m.leida,
        creada: m.creada,
      }))
      .sort((a, b) => Number(a.leida) - Number(b.leida));
  }
}
