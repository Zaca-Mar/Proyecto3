import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Sugerencia } from '../entities/sugerencia.entity';
import { VinculosService } from '../../common/services/vinculos.service';

@Injectable()
export class SugerenciasQueryService {
  constructor(
    @InjectRepository(Sugerencia)
    private readonly sugerencias: Repository<Sugerencia>,
    private readonly vinculos: VinculosService,
  ) {}

  misSugerencias(alumnoId: number) {
    return this.sugerencias.find({
      where: { alumnoId },
      order: { id: 'DESC' },
      take: 20,
    });
  }

  async pendientes(entrenadorId: number) {
    const ids = await this.vinculos.alumnosDe(entrenadorId);
    if (!ids.length) return [];
    return this.sugerencias.find({
      where: { alumnoId: In(ids), estado: 'pendiente' },
      order: { id: 'DESC' },
    });
  }
}
