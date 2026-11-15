import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asistencia } from '../entities/asistencia.entity';
import { fechaHoy } from '../../common/utils/fechas';

@Injectable()
export class RegistrarAsistenciaUseCase {
  constructor(
    @InjectRepository(Asistencia)
    private readonly asistencias: Repository<Asistencia>,
  ) {}

  async ejecutar(alumnoId: number) {
    const fecha = fechaHoy();
    if (await this.asistencias.findOneBy({ alumnoId, fecha })) {
      throw new ConflictException('Ya registraste tu asistencia hoy');
    }
    await this.asistencias.save({ alumnoId, fecha });
    return { registrada: true, mensaje: 'Asistencia registrada' };
  }
}
