import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sesion } from '../entities/sesion.entity';
import { Asistencia } from '../entities/asistencia.entity';
import { Ejercicio } from '../../catalogo/entities/ejercicio.entity';
import { fechaHace } from '../../common/utils/fechas';

/** Devuelve el lunes de la semana de una fecha YYYY-MM-DD. */
function semanaDe(fecha: string) {
  const d = new Date(`${fecha}T00:00:00`);
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return d.toLocaleDateString('sv-SE');
}

interface PuntoCarga {
  sesionId: number;
  fecha: string;
  cargaMax: number;
  volumen: number;
  series: number;
}

interface ProgresoEjercicio {
  ejercicioId: number;
  ejercicio: string;
  grupoMuscular: string;
  puntos: PuntoCarga[];
}

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectRepository(Sesion)
    private readonly sesiones: Repository<Sesion>,
    @InjectRepository(Asistencia)
    private readonly asistencias: Repository<Asistencia>,
    @InjectRepository(Ejercicio)
    private readonly ejercicios: Repository<Ejercicio>,
  ) {}

  /** US7: evolución de carga por ejercicio y volumen semanal por grupo muscular. */
  async calcular(alumnoId: number) {
    const [sesiones, ejercicios, asistenciaTotal, asistenciaSemana, asistencia30] =
      await Promise.all([
        this.sesiones.find({
          where: { alumnoId, estado: 'cerrada' },
          relations: { series: true },
          order: { id: 'ASC' },
        }),
        this.ejercicios.find(),
        this.asistencias.countBy({ alumnoId }),
        this.asistencias
          .createQueryBuilder('a')
          .where('a.alumnoId = :alumnoId AND a.fecha >= :desde', {
            alumnoId,
            desde: fechaHace(6),
          })
          .getCount(),
        this.asistencias
          .createQueryBuilder('a')
          .where('a.alumnoId = :alumnoId AND a.fecha >= :desde', {
            alumnoId,
            desde: fechaHace(29),
          })
          .getCount(),
      ]);

    const porId = new Map(ejercicios.map((e) => [e.id, e]));
    const progreso = new Map<number, ProgresoEjercicio>();
    const semanas = new Map<string, { totalSeries: number; grupos: Record<string, number> }>();
    let totalSeries = 0;

    for (const sesion of sesiones) {
      const agrupadas = new Map<number, { cargaMax: number; volumen: number; series: number }>();

      for (const serie of sesion.series) {
        const ejercicio = porId.get(serie.ejercicioId);
        if (!ejercicio) continue;

        totalSeries += 1;
        const actual = agrupadas.get(serie.ejercicioId) ?? {
          cargaMax: 0,
          volumen: 0,
          series: 0,
        };
        actual.cargaMax = Math.max(actual.cargaMax, serie.carga);
        actual.volumen += serie.carga * serie.repeticiones;
        actual.series += 1;
        agrupadas.set(serie.ejercicioId, actual);

        const semana = semanaDe(sesion.fecha);
        const volumenSemana = semanas.get(semana) ?? { totalSeries: 0, grupos: {} };
        volumenSemana.totalSeries += 1;
        volumenSemana.grupos[ejercicio.grupoMuscular] =
          (volumenSemana.grupos[ejercicio.grupoMuscular] || 0) + 1;
        semanas.set(semana, volumenSemana);
      }

      for (const [ejercicioId, datos] of agrupadas) {
        const ejercicio = porId.get(ejercicioId)!;
        let item = progreso.get(ejercicioId);
        if (!item) {
          item = {
            ejercicioId,
            ejercicio: ejercicio.nombre,
            grupoMuscular: ejercicio.grupoMuscular,
            puntos: [],
          };
          progreso.set(ejercicioId, item);
        }
        item.puntos.push({
          sesionId: sesion.id,
          fecha: sesion.fecha,
          cargaMax: datos.cargaMax,
          volumen: Math.round(datos.volumen),
          series: datos.series,
        });
      }
    }

    const porEjercicio = [...progreso.values()].sort(
      (a, b) =>
        a.grupoMuscular.localeCompare(b.grupoMuscular) ||
        a.ejercicio.localeCompare(b.ejercicio),
    );
    const volumenSemanal = [...semanas.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([semana, datos]) => ({
        semana,
        totalSeries: datos.totalSeries,
        grupos: datos.grupos,
      }));

    return {
      sesiones: sesiones.length,
      series: totalSeries,
      porEjercicio,
      volumenSemanal,
      asistencia: {
        total: asistenciaTotal,
        semana: asistenciaSemana,
        ultimos30: asistencia30,
      },
      mensaje: sesiones.length
        ? null
        : 'Todavía no hay datos suficientes. Completá tu primera sesión para ver tu progreso.',
    };
  }
}
