import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sesion } from '../entities/sesion.entity';
import { Ejercicio } from '../../catalogo/entities/ejercicio.entity';
import { Serie } from '../entities/serie.entity';

interface PuntoHistorial {
  sesionId: number;
  fecha: string;
  series: Serie[];
}

interface EjercicioHistorial {
  ejercicio: {
    id: number;
    nombre: string;
    grupoMuscular: string;
    zonas: string[];
    videoUrl: string | null;
  };
  historial: PuntoHistorial[];
  record: { carga: number; repeticiones: number; fecha: string } | null;
  series: number;
}

@Injectable()
export class HistorialService {
  constructor(
    @InjectRepository(Sesion)
    private readonly sesiones: Repository<Sesion>,
    @InjectRepository(Ejercicio)
    private readonly ejercicios: Repository<Ejercicio>,
  ) {}

  /** US6: historial cronológico por ejercicio y récord. */
  async porEjercicio(alumnoId: number, ejercicioId: number) {
    const sesiones = await this.sesiones.find({
      where: { alumnoId, estado: 'cerrada' },
      relations: { series: true },
      order: { id: 'ASC' },
    });

    const dias = sesiones
      .map((s) => ({
        fecha: s.fecha,
        series: s.series
          .filter((x) => x.ejercicioId === ejercicioId)
          .sort((a, b) => a.numero - b.numero),
      }))
      .filter((d) => d.series.length);

    const todas = dias.flatMap((d) => d.series);
    const record = todas.length
      ? todas.reduce((mejor, x) =>
          x.carga > mejor.carga ||
          (x.carga === mejor.carga && x.repeticiones > mejor.repeticiones)
            ? x
            : mejor,
        )
      : null;

    return {
      historial: dias,
      record: record && { carga: record.carga, repeticiones: record.repeticiones },
      mensaje: dias.length ? null : 'Todavía no tenés sesiones de este ejercicio',
    };
  }

  /** Historial completo del alumno agrupado por ejercicio. */
  async todos(alumnoId: number) {
    const [sesiones, ejercicios] = await Promise.all([
      this.sesiones.find({
        where: { alumnoId, estado: 'cerrada' },
        relations: { series: true },
        order: { id: 'ASC' },
      }),
      this.ejercicios.find(),
    ]);

    const porId = new Map(ejercicios.map((e) => [e.id, e]));
    const mapa = new Map<number, EjercicioHistorial>();

    for (const sesion of sesiones) {
      const seriesPorEjercicio = new Map<number, Serie[]>();
      for (const serie of sesion.series) {
        const lista = seriesPorEjercicio.get(serie.ejercicioId) ?? [];
        lista.push(serie);
        seriesPorEjercicio.set(serie.ejercicioId, lista);
      }

      for (const [ejercicioId, series] of seriesPorEjercicio) {
        const ejercicio = porId.get(ejercicioId);
        if (!ejercicio) continue;

        let item = mapa.get(ejercicioId);
        if (!item) {
          item = {
            ejercicio: {
              id: ejercicio.id,
              nombre: ejercicio.nombre,
              grupoMuscular: ejercicio.grupoMuscular,
              zonas: ejercicio.zonas,
              videoUrl: ejercicio.videoUrl,
            },
            historial: [],
            record: null,
            series: 0,
          };
          mapa.set(ejercicioId, item);
        }

        series.sort((a, b) => a.numero - b.numero);
        item.historial.push({ sesionId: sesion.id, fecha: sesion.fecha, series });
        item.series += series.length;

        for (const serie of series) {
          if (
            !item.record ||
            serie.carga > item.record.carga ||
            (serie.carga === item.record.carga &&
              serie.repeticiones > item.record.repeticiones)
          ) {
            item.record = {
              carga: serie.carga,
              repeticiones: serie.repeticiones,
              fecha: sesion.fecha,
            };
          }
        }
      }
    }

    const lista = [...mapa.values()].sort(
      (a, b) =>
        a.ejercicio.grupoMuscular.localeCompare(b.ejercicio.grupoMuscular) ||
        a.ejercicio.nombre.localeCompare(b.ejercicio.nombre),
    );

    return {
      ejercicios: lista,
      mensaje: lista.length ? null : 'Todavía no tenés sesiones registradas',
    };
  }
}
