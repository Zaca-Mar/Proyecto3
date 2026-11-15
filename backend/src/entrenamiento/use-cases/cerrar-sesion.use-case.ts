import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sesion } from '../entities/sesion.entity';
import { Molestia } from '../../molestias/entities/molestia.entity';
import { Sugerencia } from '../entities/sugerencia.entity';
import { SesionesQueryService } from '../queries/sesiones-query.service';
import { sugerirCarga } from '../../progresion/engine';
import { fechaHace } from '../../common/utils/fechas';

/** Cierra la sesión (permanente) y genera una sugerencia por ejercicio de musculación. */
@Injectable()
export class CerrarSesionUseCase {
  constructor(
    @InjectRepository(Sesion)
    private readonly sesiones: Repository<Sesion>,
    @InjectRepository(Molestia)
    private readonly molestias: Repository<Molestia>,
    @InjectRepository(Sugerencia)
    private readonly sugerencias: Repository<Sugerencia>,
    private readonly sesionesQuery: SesionesQueryService,
  ) {}

  async ejecutar(alumnoId: number, sesionId: number) {
    const sesion = await this.sesionesQuery.exigirAbierta(alumnoId, sesionId);
    sesion.estado = 'cerrada';
    await this.sesiones.save({ id: sesion.id, estado: 'cerrada' });

    const hace14 = fechaHace(14);
    const creadas: Sugerencia[] = [];

    for (const ejercicio of sesion.prescripto.filter((p) => p.bloque === 'musculacion')) {
      const hechas = sesion.series.filter((s) => s.ejercicioId === ejercicio.ejercicioId);
      if (!hechas.length) continue;

      const molestias = await this.molestias.findBy({
        alumnoId,
        ejercicioId: ejercicio.ejercicioId,
      });
      const molestiaReciente = molestias.some(
        (m) => !m.leida || m.creada.toLocaleDateString('sv-SE') >= hace14,
      );

      const resultado = sugerirCarga({
        repMin: ejercicio.repMin,
        repMax: ejercicio.repMax,
        incremento: ejercicio.incremento,
        series: hechas,
        molestiaReciente,
      });

      creadas.push(
        await this.sugerencias.save(
          this.sugerencias.create({
            alumnoId,
            ejercicioId: ejercicio.ejercicioId,
            ejercicioNombre: ejercicio.nombre,
            sesionId: sesion.id,
            accion: resultado.accion,
            carga: resultado.carga,
            repsObjetivo: resultado.repsObjetivo,
            explicacion: resultado.explicacion,
            aviso: resultado.aviso ?? null,
          }),
        ),
      );
    }

    return { sesionId: sesion.id, sugerencias: creadas };
  }
}
