import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Molestia } from '../entities/molestia.entity';
import { Ejercicio } from '../../catalogo/entities/ejercicio.entity';
import { CrearMolestiaDto } from '../dto/crear-molestia.dto';

/** US8: queda asociada al ejercicio, sin leer, y el entrenador la ve en la app. */
@Injectable()
export class CrearMolestiaUseCase {
  constructor(
    @InjectRepository(Molestia)
    private readonly molestias: Repository<Molestia>,
    @InjectRepository(Ejercicio)
    private readonly ejercicios: Repository<Ejercicio>,
  ) {}

  async ejecutar(alumnoId: number, dto: CrearMolestiaDto) {
    const ejercicio = await this.ejercicios.findOneBy({ id: dto.ejercicioId });
    if (!ejercicio) throw new NotFoundException('Ejercicio no encontrado');
    return this.molestias.save(
      this.molestias.create({ ...dto, alumnoId, leida: false }),
    );
  }
}
