import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ejercicio } from '../entities/ejercicio.entity';
import { CrearEjercicioDto } from '../dto/crear-ejercicio.dto';

/** US10: nombre, grupo muscular y link válido. */
@Injectable()
export class CrearEjercicioUseCase {
  constructor(
    @InjectRepository(Ejercicio)
    private readonly ejercicios: Repository<Ejercicio>,
  ) {}

  async ejecutar(dto: CrearEjercicioDto) {
    if (await this.ejercicios.findOneBy({ nombre: dto.nombre })) {
      throw new ConflictException('Ya existe un ejercicio con ese nombre');
    }
    return this.ejercicios.save(
      this.ejercicios.create({
        zonas: [],
        incremento: 2.5,
        ...dto,
      }),
    );
  }
}
