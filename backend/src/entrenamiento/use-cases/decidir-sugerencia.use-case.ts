import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sugerencia } from '../entities/sugerencia.entity';
import { VinculosService } from '../../common/services/vinculos.service';

@Injectable()
export class DecidirSugerenciaUseCase {
  constructor(
    @InjectRepository(Sugerencia)
    private readonly sugerencias: Repository<Sugerencia>,
    private readonly vinculos: VinculosService,
  ) {}

  async ejecutar(
    entrenadorId: number,
    id: number,
    estado: 'aprobada' | 'rechazada',
  ) {
    const sugerencia = await this.sugerencias.findOneBy({ id });
    if (!sugerencia) throw new NotFoundException('Sugerencia no encontrada');
    await this.vinculos.exigir(entrenadorId, sugerencia.alumnoId);
    sugerencia.estado = estado;
    return this.sugerencias.save(sugerencia);
  }
}
