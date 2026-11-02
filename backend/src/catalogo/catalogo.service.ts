import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ejercicio } from './entities/ejercicio.entity';
import { CrearEjercicioDto } from './dto/crear-ejercicio.dto';
import { ListarEjerciciosQueryDto } from './dto/listar-ejercicios-query.dto';

@Injectable()
export class CatalogoService {
  constructor(
    @InjectRepository(Ejercicio)
    private readonly ejercicios: Repository<Ejercicio>,
  ) {}

  async listar(query: ListarEjerciciosQueryDto = {}) {
    const lista = await this.ejercicios.find({
      order: { grupoMuscular: 'ASC', nombre: 'ASC' },
    });
    const q = query.q?.trim().toLowerCase();
    return lista.filter((e) => {
      const coincideTexto = !q || e.nombre.toLowerCase().includes(q);
      const coincideGrupo =
        !query.grupoMuscular || e.grupoMuscular === query.grupoMuscular;
      return coincideTexto && coincideGrupo;
    });
  }

  /** US10: nombre, grupo muscular y link válido. */
  async crear(dto: CrearEjercicioDto) {
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
