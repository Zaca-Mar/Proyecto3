import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asistencia } from '../entities/asistencia.entity';
import { fechaHoy } from '../../common/utils/fechas';

@Injectable()
export class AsistenciasQueryService {
  constructor(
    @InjectRepository(Asistencia)
    private readonly asistencias: Repository<Asistencia>,
  ) {}

  /** US12: una asistencia por día. */
  async hoy(alumnoId: number) {
    const registrada = !!(await this.asistencias.findOneBy({
      alumnoId,
      fecha: fechaHoy(),
    }));
    return { registrada };
  }

  async exigirHoy(alumnoId: number) {
    const registrada = await this.asistencias.findOneBy({
      alumnoId,
      fecha: fechaHoy(),
    });
    if (!registrada) {
      throw new ForbiddenException('Registrá tu asistencia antes de iniciar la sesión');
    }
  }
}
