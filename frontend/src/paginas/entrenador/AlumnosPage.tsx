import { useState } from 'react';
import { api, mensajeDeError } from '../../api';
import type { Alumno, MolestiaEntrenador, PlanResumen } from '../../tipos';

interface Props {
  alumnos: Alumno[];
  molestias: MolestiaEntrenador[];
  planes: PlanResumen[];
  onArmarPlan: (id: number) => void;
  onRecargar: () => Promise<void> | void;
}

export default function AlumnosPage({ alumnos, molestias, planes, onArmarPlan, onRecargar }: Props) {
  const [dni, setDni] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [vinculando, setVinculando] = useState(false);

  async function vincular() {
    setError('');
    setMensaje('');
    if (!dni.trim()) return setError('Ingresá el DNI del alumno.');
    if (!/^\d{7,9}$/.test(dni.trim())) return setError('El DNI debe tener entre 7 y 9 números.');

    setVinculando(true);
    try {
      const r = await api<{ nombre: string }>('/vinculos', { method: 'POST', body: { dni: dni.trim() } });
      setMensaje(`Vínculo establecido con ${r.nombre}. Ya podés armarle su primer plan.`);
      setDni('');
      await onRecargar();
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setVinculando(false);
    }
  }

  return (
    <div className="pagina alumnos-pagina">
      <div className="alumnos-grid">
        <section className="card">
          <div className="fila">
            <h2>Listado</h2>
            <span className="pill">{alumnos.length} alumnos</span>
          </div>
          <p className="mu">Seleccioná un alumno para armar o ajustar su plan.</p>
          {alumnos.length === 0 && (
            <p className="mu">Todavía no hay alumnos vinculados. Usá el panel de vinculación.</p>
          )}
          <div className="lista-alumnos">
            {alumnos.map((a) => {
              const sinLeer = molestias.filter((m) => m.alumnoId === a.id && !m.leida);
              const planAlumno = planes.find((p) => p.alumnoId === a.id && p.activo);
              return (
                <button
                  className={`alumno-fila ${sinLeer.length ? 'con-alerta' : ''}`}
                  key={a.id}
                  onClick={() => onArmarPlan(a.id)}
                  type="button"
                >
                  <span className="avatar">
                    {a.nombre[0]}
                    {a.apellido[0]}
                  </span>
                  <div className="alumno-info">
                    <div className="fila">
                      <b>
                        {a.nombre} {a.apellido}
                      </b>
                      {sinLeer.length > 0 && <span className="pill a">⚑ {sinLeer.length} sin leer</span>}
                      {planAlumno ? (
                        <span className="pill l">Plan activo</span>
                      ) : (
                        <span className="pill">Sin plan</span>
                      )}
                    </div>
                    <div className="mu">
                      DNI {a.dni} · {a.email}
                      {a.telefono ? ` · ${a.telefono}` : ''}
                    </div>
                    {planAlumno && <div className="mu">Plan actual: {planAlumno.nombre}</div>}
                    {sinLeer[0] && (
                      <div className="alerta-alumno">
                        Última molestia: {sinLeer[0].ejercicio} · {sinLeer[0].zona}
                      </div>
                    )}
                  </div>
                  <span className="flecha">→</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="card">
          <h2>Vincular nuevo alumno</h2>
          <p className="mu">
            Buscá al alumno por su DNI. Para que aparezca tiene que estar registrado con rol alumno.
          </p>
          <label>
            DNI
            <input
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
              inputMode="numeric"
              placeholder="41222333"
            />
          </label>
          {error && <div className="aviso">⚑ {error}</div>}
          {mensaje && <div className="exito">✓ {mensaje}</div>}
          <button className="btn" onClick={vincular} disabled={vinculando} type="button">
            {vinculando ? 'Vinculando…' : 'Buscar y vincular'}
          </button>
        </section>
      </div>
    </div>
  );
}
