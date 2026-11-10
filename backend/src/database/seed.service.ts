import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { DeepPartial, Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Vinculo } from '../usuarios/entities/vinculo.entity';
import { Ejercicio } from '../catalogo/entities/ejercicio.entity';
import { Plan } from '../planes/entities/plan.entity';
import { Sesion } from '../entrenamiento/entities/sesion.entity';
import { Serie } from '../entrenamiento/entities/serie.entity';
import { Asistencia } from '../entrenamiento/entities/asistencia.entity';
import { Molestia } from '../molestias/entities/molestia.entity';
import { fechaHace } from '../common/utils/fechas';
import { CATALOGO, videoDe } from './seed.data';

/** Datos de prueba para desarrollo. Solo corre si la base está vacía. */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarios: Repository<Usuario>,
    @InjectRepository(Ejercicio)
    private readonly ejercicios: Repository<Ejercicio>,
    @InjectRepository(Vinculo)
    private readonly vinculos: Repository<Vinculo>,
    @InjectRepository(Plan)
    private readonly planes: Repository<Plan>,
    @InjectRepository(Sesion)
    private readonly sesiones: Repository<Sesion>,
    @InjectRepository(Serie)
    private readonly series: Repository<Serie>,
    @InjectRepository(Asistencia)
    private readonly asistencias: Repository<Asistencia>,
    @InjectRepository(Molestia)
    private readonly molestias: Repository<Molestia>,
  ) {}

  async onApplicationBootstrap() {
    if (await this.usuarios.count()) return;

    const hash = await bcrypt.hash('1234', 10);
    const crearUsuario = (
      email: string,
      nombre: string,
      apellido: string,
      dni: string,
      rol: Usuario['rol'],
    ) =>
      this.usuarios.save(
        this.usuarios.create({
          email,
          nombre,
          apellido,
          dni,
          telefono: '3535000000',
          rol,
          passwordHash: hash,
        }),
      );

    await crearUsuario('admin@fittracker.com', 'Admin', 'Gimnasio', '10000000', 'admin');
    const nico = await crearUsuario(
      'nicolas.romero@email.com',
      'Nicolás',
      'Romero',
      '30111222',
      'entrenador',
    );
    const lucas = await crearUsuario(
      'lucas.fernandez@email.com',
      'Lucas',
      'Fernández',
      '40111222',
      'alumno',
    );
    await crearUsuario('martina.gomez@email.com', 'Martina', 'Gómez', '41222333', 'alumno');
    await this.vinculos.save({ entrenadorId: nico.id, alumnoId: lucas.id });

    const ejercicios: Record<string, Ejercicio> = {};
    for (const [nombre, grupo, zonas, incremento] of CATALOGO) {
      const existente = await this.ejercicios.findOneBy({ nombre });
      ejercicios[nombre] =
        existente ??
        (await this.ejercicios.save(
          this.ejercicios.create({
            nombre,
            grupoMuscular: grupo,
            zonas,
            incremento: incremento || 2.5,
            videoUrl: videoDe(nombre),
          }),
        ));
    }

    const infoEjercicio = new Map(
      Object.entries(ejercicios).map(([nombre, e]) => [
        e.id,
        { nombre, grupoMuscular: e.grupoMuscular, incremento: e.incremento },
      ]),
    );

    const prescribir = (
      nombre: string,
      bloque: 'movilidad' | 'zona_media' | 'musculacion',
      orden: number,
      series: number,
      repMin: number,
      repMax: number,
      carga: number,
      descanso: number,
    ) => ({
      orden,
      bloque,
      series,
      repMin,
      repMax,
      cargaObjetivo: carga,
      descanso,
      ejercicioId: ejercicios[nombre].id,
    });

    const planGuardado = await this.planes.save(
      this.planes.create({
        nombre: 'Hipertrofia · 2 días',
        entrenadorId: nico.id,
        alumnoId: lucas.id,
        activo: true,
        dias: [
          {
            orden: 0,
            nombre: 'Día A',
            ejercicios: [
              prescribir('Movilidad de cadera en cuadrupedia', 'movilidad', 0, 2, 10, 10, 0, 0),
              prescribir('Dead bug', 'zona_media', 1, 3, 10, 10, 0, 0),
              prescribir('Press banca', 'musculacion', 2, 3, 8, 12, 40, 90),
              prescribir('Remo con barra', 'musculacion', 3, 3, 8, 12, 35, 90),
            ],
          },
          {
            orden: 1,
            nombre: 'Día B',
            ejercicios: [
              prescribir('Rotación torácica en cuadrupedia', 'movilidad', 0, 2, 8, 8, 0, 0),
              prescribir('Pallof press en polea', 'zona_media', 1, 3, 12, 12, 0, 0),
              prescribir('Hip thrust', 'musculacion', 2, 3, 8, 12, 60, 90),
              prescribir('Jalón al pecho', 'musculacion', 3, 3, 8, 12, 45, 90),
            ],
          },
        ],
      } as DeepPartial<Plan>),
    );

    const plan = await this.planes.findOneOrFail({
      where: { id: planGuardado.id },
      relations: { dias: { ejercicios: true } },
    });
    const diaA = [...plan.dias].sort((a, b) => a.orden - b.orden)[0];
    const ayer = fechaHace(1);

    await this.asistencias.save({ alumnoId: lucas.id, fecha: ayer });

    const prescripto = [...diaA.ejercicios]
      .sort((a, b) => a.orden - b.orden)
      .map((e) => {
        const info = infoEjercicio.get(e.ejercicioId);
        return {
          ejercicioId: e.ejercicioId,
          nombre: info?.nombre ?? '',
          grupoMuscular: info?.grupoMuscular ?? '',
          bloque: e.bloque,
          series: e.series,
          repMin: e.repMin,
          repMax: e.repMax,
          cargaObjetivo: e.cargaObjetivo,
          descanso: e.descanso,
          incremento: info?.incremento ?? 2.5,
        };
      });

    const sesion = await this.sesiones.save(
      this.sesiones.create({
        alumnoId: lucas.id,
        planId: plan.id,
        diaId: diaA.id,
        fecha: ayer,
        estado: 'cerrada',
        prescripto,
      }),
    );

    const banca = ejercicios['Press banca'];
    const remo = ejercicios['Remo con barra'];
    await this.series.save([
      { sesion: { id: sesion.id } as Sesion, ejercicioId: banca.id, numero: 1, carga: 40, repeticiones: 10, rpe: 8 },
      { sesion: { id: sesion.id } as Sesion, ejercicioId: banca.id, numero: 2, carga: 40, repeticiones: 9, rpe: 8 },
      { sesion: { id: sesion.id } as Sesion, ejercicioId: banca.id, numero: 3, carga: 40, repeticiones: 8, rpe: 9 },
      { sesion: { id: sesion.id } as Sesion, ejercicioId: remo.id, numero: 1, carga: 35, repeticiones: 10, rpe: 7 },
      { sesion: { id: sesion.id } as Sesion, ejercicioId: remo.id, numero: 2, carga: 35, repeticiones: 10, rpe: 8 },
      { sesion: { id: sesion.id } as Sesion, ejercicioId: remo.id, numero: 3, carga: 35, repeticiones: 9, rpe: 8 },
    ]);

    await this.molestias.save({
      alumnoId: lucas.id,
      ejercicioId: banca.id,
      zona: 'hombro',
      observacion: 'Siento una molestia en el hombro derecho al bajar la barra.',
      leida: false,
    });

    console.log('Datos de prueba cargados (contraseña de todos: 1234)');
  }
}
