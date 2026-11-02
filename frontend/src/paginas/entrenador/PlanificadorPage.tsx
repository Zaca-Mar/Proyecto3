import { useCallback, useEffect, useState } from 'react';
import { api, mensajeDeError } from '../../api';
import { fechaCorta } from '../../formato';
import type {
  Alumno,
  Ejercicio,
  MolestiaEntrenador,
  PlanResumen,
  Resumen,
} from '../../tipos';
import EditorPlan from './componentes/EditorPlan';
import ResumenAlumno from './componentes/ResumenAlumno';

interface Props {
  alumnos: Alumno[];
  alumnoId: number | null;
  ejercicios: Ejercicio[];
  planes: PlanResumen[];
  molestias: MolestiaEntrenador[];
  onElegirAlumno: (id: number) => void;
  onIrAAlumnos: () => void;
  onRecargar: () => Promise<void> | void;
}

export default function PlanificadorPage({
  alumnos,
  alumnoId,
  ejercicios,
  planes,
  molestias,
  onElegirAlumno,
  onIrAAlumnos,
  onRecargar,
}: Props) {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [cargandoResumen, setCargandoResumen] = useState(false);
  const [errorResumen, setErrorResumen] = useState('');

  const cargarResumen = useCallback(async () => {
    if (!alumnoId) {
      setResumen(null);
      return;
    }
    setCargandoResumen(true);
    setErrorResumen('');
    try {
      setResumen(await api<Resumen>(`/alumnos/${alumnoId}/resumen`));
    } catch (e) {
      setResumen(null);
      setErrorResumen(mensajeDeError(e));
    } finally {
      setCargandoResumen(false);
    }
  }, [alumnoId]);

  useEffect(() => {
    cargarResumen();
  }, [cargarResumen]);

  async function despuesDeGuardar() {
    await Promise.all([onRecargar(), cargarResumen()]);
  }

  const planesDelAlumno = planes.filter((p) => p.alumnoId === alumnoId).slice(0, 6);
  const alumnoActual = alumnos.find((a) => a.id === alumnoId);

  if (alumnos.length === 0) {
    return (
      <section className="card estado-vacio grande-vacio">
        <div className="vacio-icono">👥</div>
        <h2>Todavía no tenés alumnos vinculados</h2>
        <p className="mu">
          Vinculá a tu primer alumno con su DNI para empezar a armar planes.
        </p>
        <button className="btn" onClick={onIrAAlumnos} type="button">
          Ir a alumnos
        </button>
      </section>
    );
  }

  return (
    <div className="pagina planificador">
      <section className="card selector-alumnos">
        <div className="fila">
          <div>
            <h2>1 · Elegí el alumno</h2>
            <p className="mu">El panel derecho se actualiza con su historial y molestias.</p>
          </div>
          <span className="pill">{alumnos.length} disponibles</span>
        </div>
        <div className="chips-alumnos">
          {alumnos.map((a) => {
            const sinLeer = molestias.filter((m) => m.alumnoId === a.id && !m.leida).length;
            return (
              <button
                key={a.id}
                className={`chip-alumno ${a.id === alumnoId ? 'on' : ''}`}
                onClick={() => onElegirAlumno(a.id)}
                type="button"
              >
                <span className="avatar chico-avatar">
                  {a.nombre[0]}
                  {a.apellido[0]}
                </span>
                <span className="chip-texto">
                  <b>
                    {a.nombre} {a.apellido}
                  </b>
                  <span className="mu">DNI {a.dni}</span>
                </span>
                {sinLeer > 0 && <span className="punto-alerta">{sinLeer}</span>}
              </button>
            );
          })}
        </div>
      </section>

      {errorResumen && <div className="aviso">⚑ {errorResumen}</div>}

      {alumnoId && (
        <div className="planificador-grid">
          <div className="planificador-editor">
            <div className="paso-titulo">
              <span className="numero-paso">2</span>
              <div>
                <h2>Armá el plan</h2>
                <p className="mu">
                  Elegí ejercicios de la biblioteca, ordenalos y definí series, reps y carga.
                </p>
              </div>
            </div>
            <EditorPlan
              alumnoId={alumnoId}
              resumen={resumen}
              ejercicios={ejercicios}
              onGuardado={despuesDeGuardar}
            />
          </div>

          <aside className="planificador-aside">
            <div className="paso-titulo">
              <span className="numero-paso">3</span>
              <div>
                <h2>Mirá antes de guardar</h2>
                <p className="mu">Resumen, molestias y récords del alumno.</p>
              </div>
            </div>
            <ResumenAlumno resumen={resumen} cargando={cargandoResumen} />

            <section className="card">
              <div className="fila">
                <h2>Planes de {alumnoActual?.nombre ?? 'este alumno'}</h2>
                <span className="pill">{planesDelAlumno.length}</span>
              </div>
              {planesDelAlumno.length === 0 && (
                <p className="mu">Todavía no le creaste ningún plan. El primero se guarda acá.</p>
              )}
              <div className="lista-simple">
                {planesDelAlumno.map((p) => (
                  <div className="fila-item" key={p.id}>
                    <div className="crece">
                      <b>{p.nombre}</b>
                      <div className="mu">
                        {fechaCorta(p.creado.slice(0, 10))} · {p.dias} días · {p.ejercicios} ejercicios
                      </div>
                    </div>
                    <span className={`pill ${p.activo ? 'l' : ''}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
