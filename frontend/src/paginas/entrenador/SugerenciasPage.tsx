import { useState } from 'react';
import { api, mensajeDeError } from '../../api';
import { fmt, type Sugerencia } from '../../tipos';

interface Props {
  sugerencias: Sugerencia[];
  onRecargar: () => Promise<void> | void;
}

export default function SugerenciasPage({ sugerencias, onRecargar }: Props) {
  const [error, setError] = useState('');
  const [ocupada, setOcupada] = useState<number | null>(null);

  async function decidir(id: number, estado: 'aprobada' | 'rechazada') {
    setError('');
    setOcupada(id);
    try {
      await api(`/sugerencias/${id}`, { method: 'PATCH', body: { estado } });
      await onRecargar();
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setOcupada(null);
    }
  }

  return (
    <div className="pagina">
      <section className="card info-progresion">
        <h2>Cómo funciona la progresión</h2>
        <p className="mu">
          Después de cada sesión el sistema analiza carga, repeticiones y RPE. Si el esfuerzo fue
          bajo y se completaron las reps, propone subir. Si hubo molestias o RPE muy alto, frena.
          Aprobar una sugerencia la deja visible para el alumno en su próxima sesión.
        </p>
      </section>

      {error && <div className="aviso">⚑ {error}</div>}

      {sugerencias.length === 0 && (
        <section className="card estado-vacio">
          <div className="vacio-icono">↗</div>
          <h2>No hay sugerencias pendientes</h2>
          <p className="mu">Cuando tus alumnos cierren sesiones, las propuestas van a aparecer acá.</p>
        </section>
      )}

      <div className="grid-sugerencias">
        {sugerencias.map((s) => (
          <article key={s.id} className={`card ${s.aviso ? 'mol' : 'hl'}`}>
            <div className="fila">
              <span className="pill l">Sugerencia de carga</span>
              <span className="mu">Alumno #{s.alumnoId}</span>
            </div>
            <h2>{s.ejercicioNombre}</h2>
            <div className="sugerencia-carga">
              <span className="accion-sugerencia">{s.accion}</span>
              <span className="grande">{fmt(s.carga)} kg</span>
              <span className="mu">× {s.repsObjetivo}+ reps</span>
            </div>
            <p className="mu">{s.explicacion}</p>
            {s.aviso && <div className="aviso">⚑ {s.aviso}</div>}
            <div className="par">
              <button
                className="btn chico"
                onClick={() => decidir(s.id, 'aprobada')}
                disabled={ocupada === s.id}
                type="button"
              >
                Aprobar
              </button>
              <button
                className="btn sec chico"
                onClick={() => decidir(s.id, 'rechazada')}
                disabled={ocupada === s.id}
                type="button"
              >
                Rechazar
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
