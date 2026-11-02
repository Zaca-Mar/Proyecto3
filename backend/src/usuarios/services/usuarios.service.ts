import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Vinculo } from '../entities/vinculo.entity';
import { VinculosService } from '../../common/services/vinculos.service';
import { ResumenService } from './resumen.service';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarios: Repository<Usuario>,
    @InjectRepository(Vinculo)
    private readonly vinculosRepo: Repository<Vinculo>,
    private readonly vinculos: VinculosService,
    private readonly resumenService: ResumenService,
  ) {}

  /** US11: vincula un alumno por DNI. Un alumno solo puede tener un entrenador. */
  async vincular(entrenadorId: number, dni: string) {
    const alumno = await this.usuarios.findOneBy({ dni, rol: 'alumno' });
    if (!alumno) {
      throw new NotFoundException('No existe un alumno registrado con ese DNI');
    }
    if (await this.vinculosRepo.findOneBy({ alumnoId: alumno.id })) {
      throw new ConflictException('El alumno ya tiene un entrenador vinculado');
    }
    await this.vinculosRepo.save({ entrenadorId, alumnoId: alumno.id });
    return {
      alumnoId: alumno.id,
      nombre: `${alumno.nombre} ${alumno.apellido}`,
    };
  }

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

  /** US3 y US9: resumen completo del alumno para el entrenador. */
  resumen(entrenadorId: number, alumnoId: number) {
    return this.resumenService.paraEntrenador(entrenadorId, alumnoId);
  }
}
