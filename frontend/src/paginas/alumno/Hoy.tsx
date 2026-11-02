import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, mensajeDeError } from '../../api';
import { useAuth } from '../../auth';
import { fmt, type Ejercicio, type MolestiaAlumno, type PlanDelDia, type Sesion, type Sugerencia } from '../../tipos';
import ModalMolestia from './componentes/ModalMolestia';

interface Props {
  onEntrar: (sesion: Sesion) => void;
}

const BLOQUES: { valor: string; titulo: string }[] = [
  { valor: 'movilidad', titulo: 'Movilidad' },
  { valor: 'zona_media', titulo: 'Zona media' },
  { valor: 'musculacion', titulo: 'Musculación' },
];

export default function Hoy({ onEntrar }: Props) {
  const { usuario } = useAuth();
  const [plan, setPlan] = useState<PlanDelDia | null>(null);
  const [asistio, setAsistio] = useState(false);
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [molestias, setMolestias] = useState<MolestiaAlumno[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [hechos, setHechos] = useState<number[]>([]);
  const [modal, setModal] = useState<Ejercicio | null>(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [registrando, setRegistrando] = useState(false);
  const [empezando, setEmpezando] = useState(false);

  const cargar = useCallback(async () => {
    setError('');
    try {
      const [p, a, s, g, m, e] = await Promise.all([
        api<PlanDelDia>('/planes/activo'),
        api<{ registrada: boolean }>('/asistencias/hoy'),
        api<Sesion | null>('/sesiones/actual'),
        api<Sugerencia[]>('/sugerencias'),
        api<MolestiaAlumno[]>('/molestias/mias'),
        api<Ejercicio[]>('/ejercicios'),
      ]);
      setPlan(p);
      setAsistio(a.registrada);
      setSesion(s);
      setSugerencias(g);
      setMolestias(m);
      setEjercicios(e);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const porId = useMemo(() => new Map(ejercicios.map((e) => [e.id, e])), [ejercicios]);

  const molestiaDe = (nombre: string, ejercicioId: number) =>
    [...molestias].reverse().find((m) => m.ejercicioId === ejercicioId || m.ejercicio.nombre === nombre);

  const sugerenciasVisibles = sugerencias.filter((s) => s.estado === 'pendiente' || s.estado === 'aprobada');

  async function asistir() {
    setError('');
    setRegistrando(true);
    try {
      await api('/asistencias', { method: 'POST' });
      setAsistio(true);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setRegistrando(false);
    }
  }

  async function empezar() {
    setError('');
    setEmpezando(true);
    try {
      const nueva = await api<Sesion>('/sesiones/iniciar', { method: 'POST' });
      setSesion(nueva);
      onEntrar(nueva);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setEmpezando(false);
    }
  }

  function alternarHecho(id: number) {
    setHechos((actual) => (actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id]));
  }

  if (cargando) return <div className="cargando">Cargando tu día…</div>;

  return (
    <div className="pantalla pantalla-alumno">
      <header className="cabecera-alumno">
        <div>
          <div className="mu texto-capital">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <h1>Vamos, {usuario!.nombre}.</h1>
        </div>
      </header>

      {error && <div className="aviso">⚑ {error}</div>}

      {asistio ? (
        <div className="asistencia-ok">
          <span className="check">✓</span>
          <div>
            <b>Asistencia registrada</b>
            <div className="mu">Ya podés empezar tu sesión de hoy.</div>
          </div>
        </div>
      ) : (
        <>
          <button className="btn" onClick={asistir} disabled={registrando} type="button">
            {registrando ? 'Registrando…' : 'Registrar asistencia'}
          </button>
          <p className="mu centro">Registrala antes de iniciar la rutina.</p>
        </>
      )}

      {!plan?.dia && (
        <section className="card">
          <h2>Todavía no tenés plan</h2>
          <p className="mu">Cuando tu entrenador te asigne una rutina, la vas a ver acá.</p>
        </section>
      )}

      {plan?.dia && (
        <section className="hoy-plan">
          <div className="plan-cabecera">
            <span className="pill l">{plan.plan!.nombre}</span>
            <h2>{plan.dia.nombre}</h2>
            <p className="mu">
              {plan.dia.ejercicios.length} ejercicios · día {plan.dia.orden + 1} de {plan.plan!.totalDias}
            </p>
          </div>

          {BLOQUES.map(({ valor, titulo }) => {
            const lista = plan.dia!.ejercicios.filter((p) => p.bloque === valor);
            if (lista.length === 0) return null;
            return (
              <section key={valor} className="bloque-plan">
                <h3>{titulo}</h3>
                {lista.map((p) => {
                  const molestia = molestiaDe(p.ejercicio.nombre, p.ejercicioId);
                  const hecho = hechos.includes(p.id);
                  const esMusculacion = p.bloque === 'musculacion';
                  return (
                    <article key={p.id} className={`card ejercicio-alumno ${molestia ? 'mol' : ''}`}>
                      <div className="fila">
                        <h2 className={molestia ? 'ambar' : ''}>{p.ejercicio.nombre}</h2>
                        <span className={`pill ${hecho ? 'l' : ''}`}>
                          {esMusculacion ? `${p.series} series` : hecho ? 'Hecho' : 'Pendiente'}
                        </span>
                      </div>
                      <p className="mu">
                        {esMusculacion
                          ? `${p.series} × ${p.repMin}–${p.repMax} reps · ${fmt(p.cargaObjetivo)} kg · descanso ${p.descanso} s`
                          : `${p.series} × ${p.repMax} reps`}
                      </p>

                      {molestia && (
                        <div className="aviso">
                          <b className="ambar">⚑ Molestia reportada · {molestia.zona}</b>
                          <div>{molestia.observacion}</div>
                          <span className="mu">{molestia.leida ? 'Tu entrenador ya la vio' : 'Sin leer por tu entrenador'}</span>
                        </div>
                      )}

                      <div className="acciones-ejercicio">
                        {p.ejercicio.videoUrl && (
                          <a
                            className="btn sec chico"
                            href={p.ejercicio.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            ▶ Video
                          </a>
                        )}
                        <button
                          className="btn sec chico"
                          onClick={() => setModal(porId.get(p.ejercicioId) ?? p.ejercicio)}
                          type="button"
                        >
                          ⚑ Molestia
                        </button>
                        {!esMusculacion && (
                          <button
                            className="btn sec chico"
                            disabled={!asistio}
                            onClick={() => alternarHecho(p.id)}
                            type="button"
                          >
                            {hecho ? '✓ Hecho' : 'Marcar hecho'}
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </section>
            );
          })}

          <button
            className="btn btn-flotante"
            disabled={!asistio && !sesion}
            onClick={() => (sesion ? onEntrar(sesion) : empezar())}
            type="button"
          >
            {empezando
              ? 'Preparando…'
              : sesion
                ? 'Continuar entrenamiento'
                : !asistio
                  ? 'Registrá tu asistencia para empezar'
                  : 'Empezar musculación'}
          </button>
        </section>
      )}

      {sugerenciasVisibles.length > 0 && (
        <section className="sugerencias-alumno">
          <div className="fila">
            <h2>Para la próxima</h2>
            <span className="pill l">{sugerenciasVisibles.length}</span>
          </div>
          <p className="mu">Cargas que propone tu progresión, revisadas por tu entrenador.</p>
          {sugerenciasVisibles.slice(0, 4).map((s) => (
            <article key={s.id} className={`card ${s.aviso ? 'mol' : 'hl'}`}>
              <div className="fila">
                <b>{s.ejercicioNombre}</b>
                <span className={`pill ${s.estado === 'aprobada' ? 'l' : ''}`}>
                  {s.estado === 'aprobada' ? 'Aprobada' : 'Pendiente'}
                </span>
              </div>
              <div className="fila">
                <span className="mu">{s.accion === 'subir' ? 'Subir carga' : s.accion}</span>
                <b className="lima">
                  {fmt(s.carga)} kg × {s.repsObjetivo}+
                </b>
              </div>
              <p className="mu">{s.explicacion}</p>
              {s.aviso && <div className="aviso">⚑ {s.aviso}</div>}
            </article>
          ))}
        </section>
      )}

      {modal && (
        <ModalMolestia
          ejercicio={modal}
          cerrar={() => {
            setModal(null);
            cargar();
          }}
        />
      )}
    </div>
  );
}
