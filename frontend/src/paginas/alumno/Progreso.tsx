import { useEffect, useState } from 'react';
import { api, mensajeDeError } from '../../api';
import { fechaCorta, semanaCorta } from '../../formato';
import { fmt, type Estadisticas, type PuntoCarga } from '../../tipos';

export default function Progreso() {
  const [datos, setDatos] = useState<Estadisticas | null>(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [abierto, setAbierto] = useState<number | null>(null);

  useEffect(() => {
    api<Estadisticas>('/estadisticas')
      .then(setDatos)
      .catch((e) => setError(mensajeDeError(e)))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <div className="cargando">Calculando tu progreso…</div>;

  return (
    <div className="pantalla pantalla-alumno">
      <header className="cabecera-alumno">
        <div>
          <div className="mu">Evolución</div>
          <h1>Tu progreso</h1>
        </div>
      </header>

      {error && <div className="aviso">⚑ {error}</div>}

      {datos?.mensaje && (
        <section className="card estado-vacio">
          <div className="vacio-icono">↗</div>
          <h2>Faltan datos</h2>
          <p className="mu">{datos.mensaje}</p>
        </section>
      )}

      {datos && (
        <>
          <div className="mini-stats mini-stats-3">
            <div>
              <b>{datos.sesiones}</b>
              <span>Sesiones</span>
            </div>
            <div>
              <b>{datos.series}</b>
              <span>Series totales</span>
            </div>
            <div>
              <b>{datos.asistencia.semana}</b>
              <span>Asistencias semana</span>
            </div>
          </div>

          {datos.porEjercicio.length > 0 && (
            <section className="bloque-progreso">
              <div className="fila">
                <h2>Carga por ejercicio</h2>
                <span className="pill">máximo por sesión</span>
              </div>
              <p className="mu">Tocá un ejercicio para ver el detalle de cada sesión.</p>

              {datos.porEjercicio.map((item) => {
                const puntos = item.puntos;
                const ultimo = puntos.at(-1);
                const primero = puntos[0];
                const delta = primero && ultimo ? ultimo.cargaMax - primero.cargaMax : 0;
                const expandido = abierto === item.ejercicioId;
                return (
                  <article className="card progreso-card" key={item.ejercicioId}>
                    <button
                      className="progreso-cabecera"
                      onClick={() => setAbierto(expandido ? null : item.ejercicioId)}
                      type="button"
                    >
                      <div className="crece">
                        <div className="fila" style={{ justifyContent: 'flex-start' }}>
                          <b>{item.ejercicio}</b>
                          <span className="pill">{item.grupoMuscular}</span>
                        </div>
                        <div className="mu">
                          {puntos.length} {puntos.length === 1 ? 'sesión' : 'sesiones'}
                        </div>
                      </div>
                      <div className="progreso-cifras">
                        <b>{ultimo ? `${fmt(ultimo.cargaMax)} kg` : '—'}</b>
                        <span className={delta > 0 ? 'lima' : delta < 0 ? 'ambar' : 'mu'}>
                          {delta > 0 ? '+' : ''}
                          {fmt(delta)} kg
                        </span>
                      </div>
                      <span className="chevron">{expandido ? '▾' : '▸'}</span>
                    </button>

                    <Sparkline puntos={puntos} />

                    {expandido && (
                      <div className="puntos-progreso">
                        {[...puntos].reverse().map((p) => (
                          <div className="fila punto-progreso" key={p.sesionId}>
                            <div>
                              <b>{fechaCorta(p.fecha)}</b>
                              <div className="mu">Sesión #{p.sesionId}</div>
                            </div>
                            <div className="derecha">
                              <b className="lima">{fmt(p.cargaMax)} kg</b>
                              <div className="mu">
                                {p.series} series · vol. {p.volumen} kg
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </section>
          )}

          {datos.volumenSemanal.length > 0 && (
            <section className="bloque-progreso">
              <h2>Volumen semanal</h2>
              <p className="mu">Series registradas por semana. Sirve para controlar la carga total.</p>
              {(() => {
                const max = Math.max(1, ...datos.volumenSemanal.map((v) => v.totalSeries));
                return datos.volumenSemanal.map((semana) => (
                  <div className="semana-volumen" key={semana.semana}>
                    <div className="fila">
                      <b>Semana del {semanaCorta(semana.semana)}</b>
                      <span className="mu">{semana.totalSeries} series</span>
                    </div>
                    <div className="barra-pista">
                      <div className="barra" style={{ width: `${(semana.totalSeries / max) * 100}%` }} />
                    </div>
                    <div className="zonas">
                      {Object.entries(semana.grupos).map(([grupo, cantidad]) => (
                        <span className="pill mini-pill" key={grupo}>
                          {grupo}: {cantidad}
                        </span>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </section>
          )}

          <section className="card">
            <h2>Asistencias</h2>
            <div className="mini-stats mini-stats-3">
              <div>
                <b>{datos.asistencia.semana}</b>
                <span>Últimos 7 días</span>
              </div>
              <div>
                <b>{datos.asistencia.ultimos30}</b>
                <span>Últimos 30 días</span>
              </div>
              <div>
                <b>{datos.asistencia.total}</b>
                <span>Total histórico</span>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Sparkline({ puntos }: { puntos: PuntoCarga[] }) {
  if (puntos.length === 0) return null;

  const ancho = 300;
  const alto = 72;
  const margen = 8;
  const cargas = puntos.map((p) => p.cargaMax);
  const max = Math.max(...cargas);
  const min = Math.min(...cargas);
  const rango = max - min || 1;

  const coordenadas = puntos.map((p, i) => {
    const x = puntos.length === 1 ? ancho / 2 : margen + (i / (puntos.length - 1)) * (ancho - margen * 2);
    const y = alto - margen - ((p.cargaMax - min) / rango) * (alto - margen * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <div className="sparkline-contenedor">
      <svg viewBox={`0 0 ${ancho} ${alto}`} className="sparkline" role="img" aria-label="Evolución de carga">
        <polyline
          points={coordenadas.join(' ')}
          fill="none"
          stroke="var(--lima)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {coordenadas.map((c, i) => {
          const [x, y] = c.split(',');
          return <circle key={i} cx={x} cy={y} r="3" fill="var(--lima)" />;
        })}
      </svg>
      <div className="sparkline-fechas">
        <span>{fechaCorta(puntos[0].fecha)}</span>
        <span className="mu">máx. {fmt(max)} kg</span>
        <span>{fechaCorta(puntos.at(-1)!.fecha)}</span>
      </div>
    </div>
  );
}
