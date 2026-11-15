import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sesion } from '../entities/sesion.entity';
import { Serie } from '../entities/serie.entity';
import { RegistrarSerieDto } from '../dto/registrar-serie.dto';
import { SesionesQueryService } from '../queries/sesiones-query.service';

@Injectable()
export class AgregarSerieUseCase {
  constructor(
    @InjectRepository(Serie)
    private readonly series: Repository<Serie>,
    private readonly sesiones: SesionesQueryService,
  ) {}

  async ejecutar(alumnoId: number, sesionId: number, dto: RegistrarSerieDto) {
    const sesion = await this.sesiones.exigirAbierta(alumnoId, sesionId);
    if (!sesion.prescripto.some((p) => p.ejercicioId === dto.ejercicioId)) {
      throw new BadRequestException('Ese ejercicio no es parte de la sesión');
    }
    const numero =
      sesion.series.filter((s) => s.ejercicioId === dto.ejercicioId).length + 1;
    return this.series.save(
      this.series.create({
        ...dto,
        numero,
        sesion: { id: sesion.id } as Sesion,
      }),
    );
  }
}
