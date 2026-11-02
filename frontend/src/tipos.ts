export type Rol = 'alumno' | 'entrenador' | 'admin';
export type Bloque = 'movilidad' | 'zona_media' | 'musculacion';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  telefono: string | null;
  rol: Rol;
}

export interface RegistroDatos {
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  telefono: string;
  password: string;
}

export interface Ejercicio {
  id: number;
  nombre: string;
  grupoMuscular: string;
  videoUrl: string | null;
  zonas: string[];
  incremento: number;
}

export interface Prescripto {
  id: number;
  bloque: Bloque;
  series: number;
  repMin: number;
  repMax: number;
  cargaObjetivo: number;
  descanso: number;
  ejercicioId: number;
  ejercicio: Ejercicio;
}

export interface PlanDelDia {
  plan: { id: number; nombre: string; totalDias: number } | null;
  dia: { id: number; nombre: string; orden: number; ejercicios: Prescripto[] } | null;
}

export interface Snapshot {
  ejercicioId: number;
  nombre: string;
  grupoMuscular: string;
  bloque: Bloque;
  series: number;
  repMin: number;
  repMax: number;
  cargaObjetivo: number;
  descanso: number;
  incremento: number;
}

export interface Serie {
  id: number;
  ejercicioId: number;
  numero: number;
  carga: number;
  repeticiones: number;
  rpe: number;
}

export interface Sesion {
  id: number;
  estado: 'abierta' | 'cerrada';
  prescripto: Snapshot[];
  series: Serie[];
}

export interface Sugerencia {
  id: number;
  ejercicioNombre: string;
  accion: string;
  carga: number;
  repsObjetivo: number;
  explicacion: string;
  aviso: string | null;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  alumnoId: number;
}

export interface MolestiaEntrenador {
  id: number;
  alumno: string;
  alumnoId: number;
  ejercicio: string;
  ejercicioId: number;
  zona: string;
  observacion: string;
  leida: boolean;
  creada: string;
}

export interface MolestiaAlumno {
  id: number;
  alumnoId: number;
  ejercicioId: number;
  zona: string;
  observacion: string;
  leida: boolean;
  creada: string;
  ejercicio: Ejercicio;
}

export interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string | null;
}

export interface CargaEjercicio {
  ejercicioId: number;
  ejercicio: string;
  grupoMuscular: string;
  ultimaCarga: number;
  mejorCarga: number;
  series: number;
  ultimaFecha: string;
}

export interface RecordPersonal {
  carga: number;
  repeticiones: number;
  fecha: string;
}

export interface Resumen {
  alumno: Alumno;
  esNuevo: boolean;
  planActivo: { id: number; nombre: string } | null;
  asistenciaSemana: number;
  asistenciaTotal: number;
  ultimaSesion: { id: number; fecha: string; series: number; diaId: number } | null;
  ultimasSesiones: { id: number; fecha: string; series: number; diaId: number }[];
  records: Record<string, RecordPersonal>;
  cargasPorEjercicio: CargaEjercicio[];
  volumenSemanal: Record<string, number>;
  molestias: {
    id: number;
    ejercicioId: number;
    ejercicio: string;
    zona: string;
    observacion: string;
    leida: boolean;
    creada: string;
  }[];
}

export interface PlanResumen {
  id: number;
  nombre: string;
  alumnoId: number | null;
  activo: boolean;
  creado: string;
  dias: number;
  ejercicios: number;
}

export interface HistorialSerie {
  id: number;
  ejercicioId: number;
  numero: number;
  carga: number;
  repeticiones: number;
  rpe: number;
}

export interface HistorialEjercicio {
  ejercicio: {
    id: number;
    nombre: string;
    grupoMuscular: string;
    zonas: string[];
    videoUrl: string | null;
  };
  historial: { sesionId: number; fecha: string; series: HistorialSerie[] }[];
  record: { carga: number; repeticiones: number; fecha: string } | null;
  series: number;
}

export interface HistorialCompleto {
  ejercicios: HistorialEjercicio[];
  mensaje: string | null;
}

export interface PuntoCarga {
  sesionId: number;
  fecha: string;
  cargaMax: number;
  volumen: number;
  series: number;
}

export interface ProgresoEjercicio {
  ejercicioId: number;
  ejercicio: string;
  grupoMuscular: string;
  puntos: PuntoCarga[];
}

export interface Estadisticas {
  sesiones: number;
  series: number;
  porEjercicio: ProgresoEjercicio[];
  volumenSemanal: {
    semana: string;
    totalSeries: number;
    grupos: Record<string, number>;
  }[];
  asistencia: { total: number; semana: number; ultimos30: number };
  mensaje: string | null;
}

export interface EjercicioDraft {
  key: string;
  ejercicioId: number;
  nombre: string;
  grupoMuscular: string;
  bloque: Bloque;
  series: number;
  repMin: number;
  repMax: number;
  cargaObjetivo: number;
  descanso: number;
}

export interface DiaDraft {
  key: string;
  nombre: string;
  ejercicios: EjercicioDraft[];
}

export const ZONAS = [
  'rodilla',
  'hombro',
  'lumbar',
  'cadera',
  'codo',
  'muñeca',
  'cuello',
  'tobillo',
];

export const BLOQUES: { valor: Bloque; titulo: string }[] = [
  { valor: 'movilidad', titulo: 'Movilidad' },
  { valor: 'zona_media', titulo: 'Zona media' },
  { valor: 'musculacion', titulo: 'Musculación' },
];

export const fmt = (n: number) => String(n).replace('.', ',');
