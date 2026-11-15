import { useEffect, useState } from 'react';
import { api, mensajeDeError } from '../../api/cliente';
import type { Estadisticas } from '../../dominio/modelos';
import TarjetaProgreso from './componentes/progreso/TarjetaProgreso';
import VolumenSemanal from './componentes/progreso/VolumenSemanal';

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

              {datos.porEjercicio.map((item) => (
                <TarjetaProgreso
                  key={item.ejercicioId}
                  item={item}
                  expandido={abierto === item.ejercicioId}
                  onToggle={() =>
                    setAbierto((actual) =>
                      actual === item.ejercicioId ? null : item.ejercicioId,
                    )
                  }
                />
              ))}
            </section>
          )}

          {datos.volumenSemanal.length > 0 && (
            <VolumenSemanal semanas={datos.volumenSemanal} />
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
