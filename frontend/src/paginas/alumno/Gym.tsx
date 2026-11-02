import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, mensajeDeError } from '../../api';
import { fmt, type Ejercicio, type Sesion } from '../../tipos';
import ModalMolestia from './componentes/ModalMolestia';

interface Props {
  sesion: Sesion;
  terminado: () => void;
  salir: () => void;
}

/** Modo gimnasio: una serie en pocos toques. Carga y reps precargadas; RPE obligatorio. */
export default function Gym({ sesion, terminado, salir }: Props) {
  const [actual, setActual] = useState<Sesion>(sesion);
  const [catalogo, setCatalogo] = useState<Ejercicio[]>([]);
  const [idx, setIdx] = useState(0);
  const [carga, setCarga] = useState(0);
  const [reps, setReps] = useState(0);
  const [rpe, setRpe] = useState<number | null>(null);
  const [editando, setEditando] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [finDescanso, setFinDescanso] = useState(0);
  const [ahora, setAhora] = useState(Date.now());
  const [modal, setModal] = useState<Ejercicio | null>(null);

  const musc = useMemo(
    () => actual.prescripto.filter((p) => p.bloque === 'musculacion'),
    [actual],
  );
  const hechasDe = useCallback(
    (id: number) => actual.series.filter((s) => s.ejercicioId === id).sort((a, b) => a.numero - b.numero),
    [actual],
  );

  useEffect(() => {
    api<Ejercicio[]>('/ejercicios')
      .then(setCatalogo)
      .catch(() => setCatalogo([]));
  }, []);

  useEffect(() => {
    const inicio = musc.findIndex((p) => hechasDe(p.ejercicioId).length < p.series);
    setIdx(inicio >= 0 ? inicio : Math.max(0, musc.length - 1));
    // Solo al montar: después el índice lo maneja la persona.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const p = musc[Math.min(idx, Math.max(0, musc.length - 1))];
  const hechas = p ? hechasDe(p.ejercicioId) : [];
  const porId = useMemo(() => new Map(catalogo.map((e) => [e.id, e])), [catalogo]);
  const ejercicioActual: Ejercicio | null = p
    ? porId.get(p.ejercicioId) ?? {
        id: p.ejercicioId,
        nombre: p.nombre,
        grupoMuscular: p.grupoMuscular,
        videoUrl: null,
        zonas: [],
        incremento: p.incremento,
      }
    : null;

  useEffect(() => {
    if (!p) return;
    setCarga(p.cargaObjetivo);
    setReps(p.repMax);
    setRpe(null);
    setEditando(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, p?.ejercicioId]);

  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const resta = Math.max(0, Math.ceil((finDescanso - ahora) / 1000));
  const todoCompleto = musc.every((x) => hechasDe(x.ejercicioId).length >= x.series);

  async function refrescarSesion() {
    const nueva = await api<Sesion | null>('/sesiones/actual');
    if (nueva) setActual(nueva);
  }

  async function guardar() {
    if (!p) return;
    if (!rpe) return setError('Ingresá el RPE para guardar la serie: es obligatorio.');
    setError('');
    setGuardando(true);
    try {
      if (editando !== null) {
        await api(`/series/${editando}`, {
          method: 'PATCH',
          body: { carga, repeticiones: reps, rpe },
        });
        setEditando(null);
      } else {
        await api(`/sesiones/${actual.id}/series`, {
          method: 'POST',
          body: { ejercicioId: p.ejercicioId, carga, repeticiones: reps, rpe },
        });
        if (p.descanso > 0) setFinDescanso(Date.now() + p.descanso * 1000);
        if (hechas.length + 1 >= p.series && idx < musc.length - 1) setIdx(idx + 1);
      }
      setRpe(null);
      await refrescarSesion();
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setGuardando(false);
    }
  }

  async function terminar() {
    setError('');
    setCerrando(true);
    try {
      await api(`/sesiones/${actual.id}/cerrar`, { method: 'POST' });
      terminado();
    } catch (e) {
      setError(mensajeDeError(e));
      setCerrando(false);
    }
  }

  if (!p) {
    return (
      <div className="pantalla pantalla-alumno">
        <h1>Sin ejercicios de musculación</h1>
        <p className="mu">Este día del plan no tiene ejercicios de musculación para registrar.</p>
        <button className="btn" onClick={terminar} disabled={cerrando} type="button">
          {cerrando ? 'Cerrando…' : 'Cerrar sesión'}
        </button>
        <button className="btn sec" onClick={salir} type="button">
          Volver sin cerrar
        </button>
        {error && <div className="aviso">⚑ {error}</div>}
      </div>
    );
  }

  return (
    <div className="pantalla pantalla-alumno gym">
      <div className="fila">
        <div>
          <div className="mu">Sesión #{actual.id}</div>
          <h1>{p.nombre}</h1>
        </div>
        <div className="iconos">
          <button className="icono" onClick={salir} aria-label="Salir" type="button">
            ⎋
          </button>
          {ejercicioActual?.videoUrl && (
            <a className="icono" href={ejercicioActual.videoUrl} target="_blank" rel="noreferrer" aria-label="Ver video">
              ▶
            </a>
          )}
          {ejercicioActual && (
            <button className="icono" onClick={() => setModal(ejercicioActual)} aria-label="Avisar molestia" type="button">
              ⚑
            </button>
          )}
        </div>
      </div>

      <p className="mu">
        Ejercicio {Math.min(idx + 1, musc.length)} de {musc.length} · {p.grupoMuscular}
      </p>
      <h2>
        Hoy: {p.series} × {p.repMin}–{p.repMax} · {fmt(p.cargaObjetivo)} kg
      </h2>

      {todoCompleto && (
        <div className="exito">✓ Completaste todas las series de musculación. Podés cerrar la sesión.</div>
      )}

      <div className="par">
        <Paso
          titulo="Carga"
          valor={carga}
          unidad="kg"
          menos={() => setCarga(Math.max(0, carga - (p.incremento || 2.5)))}
          mas={() => setCarga(carga + (p.incremento || 2.5))}
        />
        <Paso
          titulo="Repeticiones"
          valor={reps}
          unidad="reps"
          menos={() => setReps(Math.max(0, reps - 1))}
          mas={() => setReps(reps + 1)}
        />
      </div>

      <div className="fila" style={{ marginTop: 16 }}>
        <b>
          Esfuerzo · RPE <span className="ambar">*</span>
        </b>
        <span className="mu">6 suave / 10 máximo</span>
      </div>
      <div className="rpe">
        {[6, 7, 8, 9, 10].map((v) => (
          <button
            key={v}
            className={rpe === v ? 'on' : ''}
            onClick={() => {
              setRpe(v);
              setError('');
            }}
            type="button"
          >
            {v}
          </button>
        ))}
      </div>

      {error && <div className="aviso">⚑ {error}</div>}
      <button className="btn" onClick={guardar} disabled={guardando} type="button">
        {guardando ? 'Guardando…' : editando !== null ? 'Actualizar serie' : `Guardá la serie ${hechas.length + 1}`}
      </button>

      <div className="card descanso-card fila">
        <div>
          <div className="mu">DESCANSO</div>
          <div className="grande">
            {resta
              ? `${String(Math.floor(resta / 60)).padStart(2, '0')}:${String(resta % 60).padStart(2, '0')}`
              : '--:--'}
          </div>
        </div>
        <button className="btn sec chico" style={{ width: 'auto', margin: 0 }} onClick={terminar} disabled={cerrando} type="button">
          {cerrando ? 'Cerrando…' : 'Terminar sesión'}
        </button>
      </div>

      <h3>
        Series guardadas · {hechas.length} / {p.series}
      </h3>
      {hechas.length === 0 && <p className="mu">Tu primera serie va a aparecer acá.</p>}
      {hechas.map((s) => (
        <div className="fila mu serie-guardada" key={s.id}>
          <span>
            ✓ Serie {s.numero} · {fmt(s.carga)} kg × {s.repeticiones} · RPE {s.rpe}
          </span>
          <button
            className="btn sec mini"
            onClick={() => {
              setEditando(s.id);
              setCarga(s.carga);
              setReps(s.repeticiones);
              setRpe(s.rpe);
            }}
            type="button"
          >
            Editar
          </button>
        </div>
      ))}

      {musc.length > 1 && (
        <div className="selector-gym">
          <h3>Cambiar de ejercicio</h3>
          <div className="chips-ejercicios">
            {musc.map((x, i) => {
              const listas = hechasDe(x.ejercicioId).length;
              return (
                <button
                  key={`${x.ejercicioId}-${i}`}
                  className={`chip-ejercicio ${i === idx ? 'on' : ''} ${listas >= x.series ? 'completo' : ''}`}
                  onClick={() => setIdx(i)}
                  type="button"
                >
                  <b>{x.nombre}</b>
                  <span>
                    {listas}/{x.series}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {modal && (
        <ModalMolestia
          ejercicio={modal}
          cerrar={() => {
            setModal(null);
            refrescarSesion().catch(() => undefined);
          }}
        />
      )}
    </div>
  );
}

function Paso({
  titulo,
  valor,
  unidad,
  menos,
  mas,
}: {
  titulo: string;
  valor: number;
  unidad: string;
  menos: () => void;
  mas: () => void;
}) {
  return (
    <div className="paso">
      <span className="mu">{titulo.toUpperCase()}</span>
      <b>
        {fmt(valor)} <small className="mu">{unidad}</small>
      </b>
      <div>
        <button onClick={menos} aria-label={`Menos ${titulo}`} type="button">
          −
        </button>
        <button onClick={mas} aria-label={`Más ${titulo}`} type="button">
          +
        </button>
      </div>
    </div>
  );
}
