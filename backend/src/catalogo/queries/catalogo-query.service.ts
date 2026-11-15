import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ejercicio } from '../entities/ejercicio.entity';
import { ListarEjerciciosQueryDto } from '../dto/listar-ejercicios-query.dto';

@Injectable()
export class CatalogoQueryService {
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
}
