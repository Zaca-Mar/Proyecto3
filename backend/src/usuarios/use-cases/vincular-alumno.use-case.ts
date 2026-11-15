import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Vinculo } from '../entities/vinculo.entity';

/** US11: vincula un alumno por DNI. Un alumno solo puede tener un entrenador. */
@Injectable()
export class VincularAlumnoUseCase {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarios: Repository<Usuario>,
    @InjectRepository(Vinculo)
    private readonly vinculos: Repository<Vinculo>,
  ) {}

  async ejecutar(entrenadorId: number, dni: string) {
    const alumno = await this.usuarios.findOneBy({ dni, rol: 'alumno' });
    if (!alumno) {
      throw new NotFoundException('No existe un alumno registrado con ese DNI');
    }
    if (await this.vinculos.findOneBy({ alumnoId: alumno.id })) {
      throw new ConflictException('El alumno ya tiene un entrenador vinculado');
    }
    await this.vinculos.save({ entrenadorId, alumnoId: alumno.id });
    return {
      alumnoId: alumno.id,
      nombre: `${alumno.nombre} ${alumno.apellido}`,
    };
  }
}
