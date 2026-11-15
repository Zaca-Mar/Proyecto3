import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Molestia } from '../entities/molestia.entity';
import { VinculosService } from '../../common/services/vinculos.service';

@Injectable()
export class MarcarMolestiaLeidaUseCase {
  constructor(
    @InjectRepository(Molestia)
    private readonly molestias: Repository<Molestia>,
    private readonly vinculos: VinculosService,
  ) {}

  async ejecutar(entrenadorId: number, id: number) {
    const molestia = await this.molestias.findOneBy({ id });
    if (!molestia) throw new NotFoundException('Molestia no encontrada');
    await this.vinculos.exigir(entrenadorId, molestia.alumnoId);
    molestia.leida = true;
    return this.molestias.save(molestia);
  }
}
