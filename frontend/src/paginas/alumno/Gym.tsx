import { useState } from 'react';
import { fmt, type Ejercicio, type Sesion } from '../../dominio/modelos';
import ModalMolestia from './componentes/ModalMolestia';
import Paso from './componentes/Paso';
import { useGym } from './hooks/useGym';

interface Props {
  sesion: Sesion;
  terminado: () => void;
  salir: () => void;
}

/** Modo gimnasio: una serie en pocos toques. Carga y reps precargadas; RPE obligatorio. */
export default function Gym({ sesion, terminado, salir }: Props) {
  const gym = useGym({ sesion, terminado });
  const [modal, setModal] = useState<Ejercicio | null>(null);
  const { p } = gym;

  if (!p) {
    return (
      <div className="pantalla pantalla-alumno">
        <h1>Sin ejercicios de musculación</h1>
        <p className="mu">Este día del plan no tiene ejercicios de musculación para registrar.</p>
        <button className="btn" onClick={gym.terminar} disabled={gym.cerrando} type="button">
          {gym.cerrando ? 'Cerrando…' : 'Cerrar sesión'}
        </button>
        <button className="btn sec" onClick={salir} type="button">
          Volver sin cerrar
        </button>
        {gym.error && <div className="aviso">⚑ {gym.error}</div>}
      </div>
    );
  }

  return (
    <div className="pantalla pantalla-alumno gym">
      <div className="fila">
        <div className="cabecera-gym">
          <button
            className="icono volver"
            onClick={salir}
            aria-label="Volver al plan"
            type="button"
          >
            ←
          </button>
          <div>
            <div className="mu">Sesión #{gym.actual.id}</div>
            <h1>{p.nombre}</h1>
          </div>
        </div>
        <div className="iconos">
          {gym.ejercicioActual?.videoUrl && (
            <a
              className="icono"
              href={gym.ejercicioActual.videoUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Ver video"
            >
              ▶
            </a>
          )}
        </div>
      </div>

      <p className="mu">
        Ejercicio {Math.min(gym.idx + 1, gym.musc.length)} de {gym.musc.length} · {p.grupoMuscular}
      </p>
      <h2>
        Hoy: {p.series} × {p.repMin}–{p.repMax} · {fmt(p.cargaObjetivo)} kg
      </h2>

      {gym.ejercicioActual && (
        <button
          className="btn-molestia"
          onClick={() => setModal(gym.ejercicioActual)}
          type="button"
        >
          <span aria-hidden="true">⚠</span> Reportar molestia
        </button>
      )}

      {gym.todoCompleto && (
        <div className="exito">
          ✓ Completaste todas las series de musculación. Podés cerrar la sesión.
        </div>
      )}

      <div className="par">
        <Paso
          titulo="Carga"
          valor={gym.carga}
          unidad="kg"
          menos={() => gym.setCarga(Math.max(0, gym.carga - (p.incremento || 2.5)))}
          mas={() => gym.setCarga(gym.carga + (p.incremento || 2.5))}
        />
        <Paso
          titulo="Repeticiones"
          valor={gym.reps}
          unidad="reps"
          menos={() => gym.setReps(Math.max(0, gym.reps - 1))}
          mas={() => gym.setReps(gym.reps + 1)}
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
            className={gym.rpe === v ? 'on' : ''}
            onClick={() => {
              gym.setRpe(v);
              gym.setError('');
            }}
            type="button"
          >
            {v}
          </button>
        ))}
      </div>

      {gym.error && <div className="aviso">⚑ {gym.error}</div>}
      <button className="btn" onClick={gym.guardar} disabled={gym.guardando} type="button">
        {gym.guardando
          ? 'Guardando…'
          : gym.editando !== null
            ? 'Actualizar serie'
            : `Guardá la serie ${gym.hechas.length + 1}`}
      </button>

      <div className="card descanso-card fila">
        <div>
          <div className="mu">DESCANSO</div>
          <div className="grande">
            {gym.resta
              ? `${String(Math.floor(gym.resta / 60)).padStart(2, '0')}:${String(gym.resta % 60).padStart(2, '0')}`
              : '--:--'}
          </div>
        </div>
        {gym.resta > 0 && (
          <button
            className="btn sec chico"
            style={{ width: 'auto', margin: 0 }}
            onClick={gym.saltarDescanso}
            type="button"
          >
            Saltar descanso
          </button>
        )}
      </div>

      <h3>
        Series guardadas · {gym.hechas.length} / {p.series}
      </h3>
      {gym.hechas.length === 0 && <p className="mu">Tu primera serie va a aparecer acá.</p>}
      {gym.hechas.map((s) => (
        <div className="fila mu serie-guardada" key={s.id}>
          <span>
            ✓ Serie {s.numero} · {fmt(s.carga)} kg × {s.repeticiones} · RPE {s.rpe}
          </span>
          <button
            className="btn sec mini"
            onClick={() => gym.editarSerie(s)}
            type="button"
          >
            Editar
          </button>
        </div>
      ))}

      {gym.musc.length > 1 && (
        <div className="selector-gym">
          <h3>Cambiar de ejercicio</h3>
          <div className="chips-ejercicios">
            {gym.musc.map((x, i) => {
              const listas = gym.hechasDe(x.ejercicioId).length;
              return (
                <button
                  key={`${x.ejercicioId}-${i}`}
                  className={`chip-ejercicio ${i === gym.idx ? 'on' : ''} ${listas >= x.series ? 'completo' : ''}`}
                  onClick={() => gym.setIdx(i)}
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

      <button
        className={`btn terminar-sesion ${gym.todoCompleto ? '' : 'sec'}`}
        onClick={gym.terminar}
        disabled={gym.cerrando}
        type="button"
      >
        {gym.cerrando ? 'Cerrando…' : 'Terminar entrenamiento'}
      </button>

      {modal && (
        <ModalMolestia
          ejercicio={modal}
          cerrar={() => {
            setModal(null);
            gym.refrescarSesion().catch(() => undefined);
          }}
        />
      )}
    </div>
  );
}
