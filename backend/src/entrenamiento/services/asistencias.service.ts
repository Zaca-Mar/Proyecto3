import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asistencia } from '../entities/asistencia.entity';
import { fechaHoy } from '../../common/utils/fechas';

@Injectable()
export class AsistenciasService {
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

  async registrar(alumnoId: number) {
    const fecha = fechaHoy();
    if (await this.asistencias.findOneBy({ alumnoId, fecha })) {
      throw new ConflictException('Ya registraste tu asistencia hoy');
    }
    await this.asistencias.save({ alumnoId, fecha });
    return { registrada: true, mensaje: 'Asistencia registrada' };
  }

  async exigirAsistenciaHoy(alumnoId: number) {
    const registrada = await this.asistencias.findOneBy({
      alumnoId,
      fecha: fechaHoy(),
    });
    if (!registrada) {
      throw new ForbiddenException('Registrá tu asistencia antes de iniciar la sesión');
    }
  }
}
