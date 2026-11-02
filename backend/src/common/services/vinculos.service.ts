import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vinculo } from '../../usuarios/entities/vinculo.entity';

/**
 * Servicio compartido para verificar vínculos entre entrenador y alumno.
 * Un alumno solo puede tener un entrenador vinculado.
 */
@Injectable()
export class VinculosService {
  constructor(
    @InjectRepository(Vinculo)
    private readonly repo: Repository<Vinculo>,
  ) {}

  async alumnosDe(entrenadorId: number): Promise<number[]> {
    const vinculos = await this.repo.findBy({ entrenadorId });
    return vinculos.map((v) => v.alumnoId);
  }

  async exigir(entrenadorId: number, alumnoId: number): Promise<void> {
    const vinculo = await this.repo.findOneBy({ entrenadorId, alumnoId });
    if (!vinculo) {
      throw new ForbiddenException('No estás vinculado con ese alumno');
    }
  }
}
