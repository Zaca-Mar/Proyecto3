import { useMemo, useState } from 'react';
import { api, mensajeDeError } from '../../api';
import { fechaHora } from '../../formato';
import type { MolestiaEntrenador } from '../../tipos';

interface Props {
  molestias: MolestiaEntrenador[];
  onVerAlumno: (id: number) => void;
  onRecargar: () => Promise<void> | void;
}

export default function MolestiasPage({ molestias, onVerAlumno, onRecargar }: Props) {
  const [soloSinLeer, setSoloSinLeer] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [ocupada, setOcupada] = useState<number | null>(null);

  const sinLeer = molestias.filter((m) => !m.leida).length;
  const alumnosAfectados = new Set(molestias.filter((m) => !m.leida).map((m) => m.alumnoId)).size;

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return molestias
      .filter((m) => (soloSinLeer ? !m.leida : true))
      .filter(
        (m) =>
          !q ||
          m.alumno.toLowerCase().includes(q) ||
          m.ejercicio.toLowerCase().includes(q) ||
          m.zona.toLowerCase().includes(q) ||
          m.observacion.toLowerCase().includes(q),
      )
      .sort((a, b) => Number(a.leida) - Number(b.leida) || b.creada.localeCompare(a.creada));
  }, [molestias, soloSinLeer, busqueda]);

  async function marcarLeida(id: number) {
    setError('');
    setOcupada(id);
    try {
      await api(`/molestias/${id}/leida`, { method: 'PATCH' });
      await onRecargar();
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setOcupada(null);
    }
  }

  return (
    <div className="pagina">
      <div className="mini-stats mini-stats-3">
        <div className={sinLeer ? 'stat-alerta' : ''}>
          <b>{sinLeer}</b>
          <span>Sin leer</span>
        </div>
        <div>
          <b>{alumnosAfectados}</b>
          <span>Alumnos afectados</span>
        </div>
        <div>
          <b>{molestias.length}</b>
          <span>Reportes totales</span>
        </div>
      </div>

      <section className="card">
        <div className="fila filtros-fila">
          <div className="buscador crece">
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por alumno, ejercicio, zona u observación…"
            />
          </div>
          <button
            className={`btn sec chico ${soloSinLeer ? 'activo' : ''}`}
            onClick={() => setSoloSinLeer((v) => !v)}
            type="button"
          >
            {soloSinLeer ? 'Mostrando sin leer' : 'Mostrando todas'}
          </button>
        </div>
      </section>

      {error && <div className="aviso">⚑ {error}</div>}

      {filtradas.length === 0 && (
        <section className="card estado-vacio">
          <div className="vacio-icono">✓</div>
          <h2>Todo al día</h2>
          <p className="mu">
            {soloSinLeer
              ? 'No quedan molestias sin leer. Cambiá el filtro para ver el historial.'
              : 'Todavía no hay molestias reportadas por tus alumnos.'}
          </p>
        </section>
      )}

      <div className="lista-molestias-pagina">
        {filtradas.map((m) => (
          <article key={m.id} className={`card molestia-card ${m.leida ? '' : 'mol'}`}>
            <div className="fila">
              <div className="fila" style={{ justifyContent: 'flex-start' }}>
                <span className="avatar">{m.alumno.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
                <div>
                  <b>{m.alumno}</b>
                  <div className="mu">{fechaHora(m.creada)}</div>
                </div>
              </div>
              <span className={`pill ${m.leida ? '' : 'a'}`}>{m.leida ? 'Leída' : 'Sin leer'}</span>
            </div>

            <div className="molestia-cuerpo">
              <h2 className={m.leida ? '' : 'ambar'}>⚑ {m.ejercicio}</h2>
              <span className="pill a">{m.zona}</span>
              <p>“{m.observacion}”</p>
            </div>

            <div className="acciones-fila">
              {!m.leida && (
                <button
                  className="btn sec mini"
                  onClick={() => marcarLeida(m.id)}
                  disabled={ocupada === m.id}
                  type="button"
                >
                  {ocupada === m.id ? 'Guardando…' : 'Marcar como leída'}
                </button>
              )}
              <button className="btn mini" onClick={() => onVerAlumno(m.alumnoId)} type="button">
                Ver alumno y armar plan
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
