import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Serie } from '../entities/serie.entity';
import { EditarSerieDto } from '../dto/editar-serie.dto';
import { SesionesQueryService } from '../queries/sesiones-query.service';

@Injectable()
export class EditarSerieUseCase {
  constructor(
    @InjectRepository(Serie)
    private readonly series: Repository<Serie>,
    private readonly sesiones: SesionesQueryService,
  ) {}

  async ejecutar(alumnoId: number, serieId: number, dto: EditarSerieDto) {
    const serie = await this.series.findOne({
      where: { id: serieId },
      relations: { sesion: true },
    });
    if (!serie) throw new NotFoundException('Serie no encontrada');
    await this.sesiones.exigirAbierta(alumnoId, serie.sesion.id);

    Object.assign(serie, dto);
    const guardada = await this.series.save(serie);
    return {
      id: guardada.id,
      ejercicioId: guardada.ejercicioId,
      numero: guardada.numero,
      carga: guardada.carga,
      repeticiones: guardada.repeticiones,
      rpe: guardada.rpe,
    };
  }
}
