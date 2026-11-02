import { useCallback, useEffect, useState } from 'react';
import { api, mensajeDeError } from '../../api';
import { useAuth } from '../../auth';
import type {
  Alumno,
  Ejercicio,
  MolestiaEntrenador,
  PlanResumen,
  Sugerencia,
} from '../../tipos';
import AlumnosPage from './AlumnosPage';
import CatalogoPage from './CatalogoPage';
import MolestiasPage from './MolestiasPage';
import PlanificadorPage from './PlanificadorPage';
import SugerenciasPage from './SugerenciasPage';

type Pagina = 'planificador' | 'alumnos' | 'molestias' | 'catalogo' | 'sugerencias';

const NAV: { id: Pagina; icono: string; titulo: string }[] = [
  { id: 'planificador', icono: '◫', titulo: 'Planificador' },
  { id: 'alumnos', icono: '👥', titulo: 'Alumnos' },
  { id: 'molestias', icono: '⚑', titulo: 'Molestias' },
  { id: 'catalogo', icono: '⌁', titulo: 'Catálogo' },
  { id: 'sugerencias', icono: '↗', titulo: 'Sugerencias' },
];

const TITULOS: Record<Pagina, { titulo: string; bajada: string }> = {
  planificador: {
    titulo: 'Planificador',
    bajada: 'Armá el próximo plan mirando el resumen y las molestias del alumno.',
  },
  alumnos: {
    titulo: 'Mis alumnos',
    bajada: 'Fichas, asistencias y evolución de cada persona que entrenás.',
  },
  molestias: {
    titulo: 'Molestias',
    bajada: 'Todo lo que reportaron tus alumnos, ordenado por urgencia.',
  },
  catalogo: {
    titulo: 'Catálogo de ejercicios',
    bajada: 'La biblioteca que alimenta los planes. Sumá ejercicios nuevos.',
  },
  sugerencias: {
    titulo: 'Sugerencias de carga',
    bajada: 'La progresión propone; el entrenador decide.',
  },
};

export default function EntrenadorApp() {
  const { usuario, salir } = useAuth();
  const [pagina, setPagina] = useState<Pagina>('planificador');
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [molestias, setMolestias] = useState<MolestiaEntrenador[]>([]);
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [planes, setPlanes] = useState<PlanResumen[]>([]);
  const [alumnoId, setAlumnoId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try {
      const [a, m, s, e, p] = await Promise.all([
        api<Alumno[]>('/alumnos'),
        api<MolestiaEntrenador[]>('/molestias'),
        api<Sugerencia[]>('/sugerencias/pendientes'),
        api<Ejercicio[]>('/ejercicios'),
        api<PlanResumen[]>('/planes'),
      ]);
      setAlumnos(a);
      setMolestias(m);
      setSugerencias(s);
      setEjercicios(e);
      setPlanes(p);
      setAlumnoId((actual) => (actual && a.some((x) => x.id === actual) ? actual : a[0]?.id ?? null));
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const sinLeer = molestias.filter((m) => !m.leida).length;

  const contadores: Partial<Record<Pagina, number>> = {
    molestias: sinLeer,
    sugerencias: sugerencias.length,
  };

  function irA(nueva: Pagina, alumno?: number) {
    if (alumno) setAlumnoId(alumno);
    setPagina(nueva);
    setError('');
  }

  return (
    <div className="escritorio">
      <aside className="lateral">
        <div className="marca">⌁ FitTracker</div>
        <div className="lateral-perfil">
          <span className="avatar">
            {usuario!.nombre[0]}
            {usuario!.apellido[0]}
          </span>
          <div className="crece">
            <b>
              {usuario!.nombre} {usuario!.apellido}
            </b>
            <div className="mu">Entrenador</div>
          </div>
        </div>

        <nav className="lateral-nav">
          <span className="lateral-titulo">Gestión</span>
          {NAV.map((item) => {
            const contador = contadores[item.id] ?? 0;
            return (
              <button
                key={item.id}
                className={`lateral-item ${pagina === item.id ? 'on' : ''}`}
                onClick={() => irA(item.id)}
                type="button"
              >
                <span className="lateral-icono">{item.icono}</span>
                <span className="crece">{item.titulo}</span>
                {contador > 0 && <span className="badge">{contador}</span>}
              </button>
            );
          })}
        </nav>

        <div className="lateral-pie">
          <div className="lateral-dato">
            <b>{alumnos.length}</b>
            <span>alumnos</span>
          </div>
          <div className="lateral-dato">
            <b>{planes.filter((p) => p.activo).length}</b>
            <span>planes activos</span>
          </div>
          <button className="btn sec chico" onClick={salir} type="button">
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="contenido-escritorio">
        <header className="topbar">
          <div className="crece">
            <div className="eyebrow">{TITULOS[pagina].titulo}</div>
            <h1>{TITULOS[pagina].bajada}</h1>
          </div>
          <div className="topbar-acciones">
            <button className="icono" onClick={() => cargar()} title="Actualizar datos" type="button">
              ⟳
            </button>
            <span className="avatar">{usuario!.nombre[0]}{usuario!.apellido[0]}</span>
          </div>
        </header>

        {error && <div className="aviso">⚑ {error}</div>}
        {cargando && <div className="cargando">Cargando panel…</div>}

        {!cargando && pagina === 'planificador' && (
          <PlanificadorPage
            alumnos={alumnos}
            alumnoId={alumnoId}
            ejercicios={ejercicios}
            planes={planes}
            molestias={molestias}
            onElegirAlumno={setAlumnoId}
            onIrAAlumnos={() => irA('alumnos')}
            onRecargar={cargar}
          />
        )}

        {!cargando && pagina === 'alumnos' && (
          <AlumnosPage
            alumnos={alumnos}
            molestias={molestias}
            planes={planes}
            onArmarPlan={(id) => irA('planificador', id)}
            onRecargar={cargar}
          />
        )}

        {!cargando && pagina === 'molestias' && (
          <MolestiasPage
            molestias={molestias}
            onVerAlumno={(id) => irA('planificador', id)}
            onRecargar={cargar}
          />
        )}

        {!cargando && pagina === 'catalogo' && (
          <CatalogoPage ejercicios={ejercicios} onRecargar={cargar} />
        )}

        {!cargando && pagina === 'sugerencias' && (
          <SugerenciasPage sugerencias={sugerencias} onRecargar={cargar} />
        )}
      </main>
    </div>
  );
}
