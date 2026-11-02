import { useEffect, useMemo, useState } from 'react';
import { api, mensajeDeError } from '../../api';
import { fechaCorta } from '../../formato';
import { fmt, type HistorialCompleto } from '../../tipos';

export default function Historial() {
  const [datos, setDatos] = useState<HistorialCompleto | null>(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [abiertos, setAbiertos] = useState<number[]>([]);

  useEffect(() => {
    api<HistorialCompleto>('/historial')
      .then(setDatos)
      .catch((e) => setError(mensajeDeError(e)))
      .finally(() => setCargando(false));
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const lista = datos?.ejercicios ?? [];
    if (!q) return lista;
    return lista.filter(
      (e) =>
        e.ejercicio.nombre.toLowerCase().includes(q) ||
        e.ejercicio.grupoMuscular.toLowerCase().includes(q),
    );
  }, [datos, busqueda]);

  function alternar(id: number) {
    setAbiertos((actual) => (actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id]));
  }

  if (cargando) return <div className="cargando">Cargando tu historial…</div>;

  return (
    <div className="pantalla pantalla-alumno">
      <header className="cabecera-alumno">
        <div>
          <div className="mu">Registro de entrenamiento</div>
          <h1>Tu historial</h1>
        </div>
      </header>

      {error && <div className="aviso">⚑ {error}</div>}

      {datos?.mensaje && (
        <section className="card estado-vacio">
          <div className="vacio-icono">⌁</div>
          <h2>Sin sesiones todavía</h2>
          <p className="mu">{datos.mensaje}. Cerrá tu primera sesión para empezar a llenar esto.</p>
        </section>
      )}

      {datos && datos.ejercicios.length > 0 && (
        <div className="buscador">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar ejercicio o grupo muscular…"
          />
        </div>
      )}

      {filtrados.map((item) => {
        const abierto = abiertos.includes(item.ejercicio.id);
        const sesiones = item.historial.length;
        return (
          <article className={`card historial-card ${abierto ? 'abierto' : ''}`} key={item.ejercicio.id}>
            <button className="historial-cabecera" onClick={() => alternar(item.ejercicio.id)} type="button">
              <div className="crece">
                <div className="fila" style={{ justifyContent: 'flex-start' }}>
                  <h2>{item.ejercicio.nombre}</h2>
                  <span className="pill">{item.ejercicio.grupoMuscular}</span>
                </div>
                <div className="mu">
                  {sesiones} {sesiones === 1 ? 'sesión' : 'sesiones'} · {item.series} series registradas
                </div>
              </div>
              <div className="historial-record">
                <span className="mu">Récord</span>
                <b className="lima">
                  {item.record ? `${fmt(item.record.carga)} kg × ${item.record.repeticiones}` : '—'}
                </b>
              </div>
              <span className="chevron">{abierto ? '▾' : '▸'}</span>
            </button>

            {abierto && (
              <div className="historial-detalle">
                {item.ejercicio.videoUrl && (
                  <a className="btn sec chico" href={item.ejercicio.videoUrl} target="_blank" rel="noreferrer">
                    ▶ Ver técnica
                  </a>
                )}
                {[...item.historial].reverse().map((s) => (
                  <div className="sesion-historial" key={s.sesionId}>
                    <div className="fila">
                      <b>{fechaCorta(s.fecha)}</b>
                      <span className="mu">Sesión #{s.sesionId}</span>
                    </div>
                    <div className="series-historial">
                      {s.series.map((serie) => (
                        <div className="serie-chip" key={serie.id}>
                          <span className="mu">S{serie.numero}</span>
                          <b>{fmt(serie.carga)} kg</b>
                          <span>× {serie.repeticiones}</span>
                          <span className="mu">RPE {serie.rpe}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        );
      })}

      {datos && datos.ejercicios.length > 0 && filtrados.length === 0 && (
        <p className="mu centro">No hay ejercicios que coincidan con “{busqueda}”.</p>
      )}
    </div>
  );
}
