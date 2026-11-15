import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sesion } from '../entities/sesion.entity';

@Injectable()
export class SesionesQueryService {
  constructor(
    @InjectRepository(Sesion)
    private readonly sesiones: Repository<Sesion>,
  ) {}

  actual(alumnoId: number) {
    return this.sesiones.findOne({
      where: { alumnoId, estado: 'abierta' },
      relations: { series: true },
    });
  }

  async exigirAbierta(alumnoId: number, sesionId: number) {
    const sesion = await this.sesiones.findOne({
      where: { id: sesionId, alumnoId },
      relations: { series: true },
    });
    if (!sesion) throw new NotFoundException('Sesión no encontrada');
    if (sesion.estado !== 'abierta') {
      throw new ForbiddenException('La sesión está cerrada y no admite cambios');
    }
    return sesion;
  }
}
