import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { Plan } from '../entities/plan.entity';
import { Molestia } from '../../molestias/entities/molestia.entity';
import { Ejercicio } from '../../catalogo/entities/ejercicio.entity';
import { CrearPlanDto } from '../dto/crear-plan.dto';
import { VinculosService } from '../../common/services/vinculos.service';
import { advertenciasDeMolestias } from '../dominio/advertencias';

/**
 * US3: se crea solo para alumnos vinculados. Si hay molestias en alguno de los
 * ejercicios elegidos, se devuelve una advertencia sin impedir la creación.
 */
@Injectable()
export class CrearPlanUseCase {
  constructor(
    @InjectRepository(Plan)
    private readonly planes: Repository<Plan>,
    @InjectRepository(Molestia)
    private readonly molestias: Repository<Molestia>,
    @InjectRepository(Ejercicio)
    private readonly ejercicios: Repository<Ejercicio>,
    private readonly vinculos: VinculosService,
  ) {}

  async ejecutar(entrenadorId: number, dto: CrearPlanDto) {
    if (dto.alumnoId) await this.vinculos.exigir(entrenadorId, dto.alumnoId);

    const plan = await this.planes.save(
      this.planes.create({
        nombre: dto.nombre,
        entrenadorId,
        alumnoId: dto.alumnoId,
        activo: false,
        dias: dto.dias.map((dia, indiceDia) => ({
          orden: indiceDia,
          nombre: dia.nombre,
          ejercicios: dia.ejercicios.map((ejercicio, indiceEjercicio) => ({
            ...ejercicio,
            orden: indiceEjercicio,
          })),
        })),
      } as DeepPartial<Plan>),
    );

    return {
      plan: { id: plan.id, nombre: plan.nombre },
      advertencias: await this.advertencias(dto),
    };
  }

  private async advertencias(dto: CrearPlanDto): Promise<string[]> {
    if (!dto.alumnoId) return [];

    const idsElegidos = [
      ...new Set(dto.dias.flatMap((d) => d.ejercicios.map((e) => e.ejercicioId))),
    ];
    if (!idsElegidos.length) return [];

    const [molestias, elegidos] = await Promise.all([
      this.molestias.find({
        where: { alumnoId: dto.alumnoId },
        relations: { ejercicio: true },
      }),
      this.ejercicios.findBy({ id: In(idsElegidos) }),
    ]);

    return advertenciasDeMolestias(molestias, elegidos, idsElegidos);
  }
}
