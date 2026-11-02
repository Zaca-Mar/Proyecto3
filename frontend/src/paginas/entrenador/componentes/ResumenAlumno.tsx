import { fechaCorta, fechaHora } from '../../../formato';
import { fmt, type Resumen } from '../../../tipos';

interface Props {
  resumen: Resumen | null;
  cargando: boolean;
}

export default function ResumenAlumno({ resumen, cargando }: Props) {
  if (cargando) {
    return (
      <div className="panel-resumen card">
        <p className="mu">Cargando resumen del alumno…</p>
      </div>
    );
  }

  if (!resumen) {
    return (
      <div className="panel-resumen card">
        <p className="mu">Elegí un alumno para ver su resumen antes de armar el plan.</p>
      </div>
    );
  }

  const molestiasOrdenadas = [...resumen.molestias].sort(
    (a, b) => Number(a.leida) - Number(b.leida),
  );
  const sinLeer = resumen.molestias.filter((m) => !m.leida).length;
  const maxVolumen = Math.max(1, ...Object.values(resumen.volumenSemanal));

  return (
    <div className="panel-resumen">
      <section className="card">
        <div className="fila">
          <div className="fila" style={{ justifyContent: 'flex-start' }}>
            <span className="avatar avatar-gr">
              {resumen.alumno.nombre[0]}
              {resumen.alumno.apellido[0]}
            </span>
            <div>
              <h2>{resumen.alumno.nombre} {resumen.alumno.apellido}</h2>
              <div className="mu">DNI {resumen.alumno.dni}</div>
            </div>
          </div>
          {resumen.planActivo ? (
            <span className="pill l">Plan activo</span>
          ) : (
            <span className="pill">Sin plan</span>
          )}
        </div>
        <p className="mu">{resumen.alumno.email}{resumen.alumno.telefono ? ` · ${resumen.alumno.telefono}` : ''}</p>

        <div className="mini-stats">
          <div>
            <b>{resumen.asistenciaSemana}</b>
            <span>Asistencias semana</span>
          </div>
          <div>
            <b>{resumen.asistenciaTotal}</b>
            <span>Asistencias totales</span>
          </div>
          <div>
            <b>{resumen.ultimaSesion ? fechaCorta(resumen.ultimaSesion.fecha) : '—'}</b>
            <span>Última sesión</span>
          </div>
        </div>

        {resumen.planActivo && (
          <div className="plan-activo">
            <span className="mu">Plan actual</span>
            <b>{resumen.planActivo.nombre}</b>
          </div>
        )}

        {resumen.esNuevo && (
          <div className="aviso info">
            Es un alumno nuevo: todavía no tiene sesiones. Puede armar su primer plan igual.
          </div>
        )}
      </section>

      <section className={`card ${sinLeer ? 'mol' : ''}`}>
        <div className="fila">
          <h2 className={sinLeer ? 'ambar' : ''}>⚑ Molestias</h2>
          <span className={`pill ${sinLeer ? 'a' : ''}`}>
            {sinLeer ? `${sinLeer} sin leer` : 'Al día'}
          </span>
        </div>
        {molestiasOrdenadas.length === 0 && (
          <p className="mu">Sin molestias reportadas por este alumno.</p>
        )}
        <div className="lista-molestias">
          {molestiasOrdenadas.map((m) => (
            <div className={`molestia-item ${m.leida ? '' : 'sin-leer'}`} key={m.id}>
              <div className="fila">
                <b className={m.leida ? '' : 'ambar'}>{m.ejercicio}</b>
                <span className={`pill ${m.leida ? '' : 'a'}`}>
                  {m.leida ? 'Leída' : 'Sin leer'}
                </span>
              </div>
              <div className="mu">
                {m.zona} · {fechaHora(m.creada)}
              </div>
              <p>“{m.observacion}”</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Cargas por ejercicio</h2>
        {resumen.cargasPorEjercicio.length === 0 && (
          <p className="mu">Todavía no registró cargas.</p>
        )}
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                <th>Ejercicio</th>
                <th>Última</th>
                <th>Mejor</th>
                <th>Series</th>
              </tr>
            </thead>
            <tbody>
              {resumen.cargasPorEjercicio.map((c) => (
                <tr key={c.ejercicioId}>
                  <td>
                    <b>{c.ejercicio}</b>
                    <div className="mu">{c.grupoMuscular}</div>
                  </td>
                  <td>{fmt(c.ultimaCarga)} kg</td>
                  <td>{fmt(c.mejorCarga)} kg</td>
                  <td>{c.series}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Récords personales</h2>
        {Object.keys(resumen.records).length === 0 && (
          <p className="mu">Todavía no hay récords registrados.</p>
        )}
        <div className="lista-simple">
          {Object.entries(resumen.records).map(([nombre, record]) => (
            <div className="fila-item" key={nombre}>
              <div className="crece">
                <b>{nombre}</b>
                <div className="mu">{fechaCorta(record.fecha)}</div>
              </div>
              <b className="lima">{fmt(record.carga)} kg × {record.repeticiones}</b>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Volumen semanal</h2>
        <p className="mu">Series registradas por grupo muscular en los últimos 7 días.</p>
        {Object.keys(resumen.volumenSemanal).length === 0 && (
          <p className="mu">Sin series esta semana.</p>
        )}
        <div className="barras">
          {Object.entries(resumen.volumenSemanal).map(([grupo, cantidad]) => (
            <div className="barra-fila" key={grupo}>
              <span>{grupo}</span>
              <div className="barra-pista">
                <div className="barra" style={{ width: `${(cantidad / maxVolumen) * 100}%` }} />
              </div>
              <b>{cantidad}</b>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Últimas sesiones</h2>
        {resumen.ultimasSesiones.length === 0 && (
          <p className="mu">Todavía no tiene sesiones cerradas.</p>
        )}
        <div className="lista-simple">
          {resumen.ultimasSesiones.map((s) => (
            <div className="fila-item" key={s.id}>
              <div className="crece">
                <b>{fechaCorta(s.fecha)}</b>
                <div className="mu">Sesión #{s.id}</div>
              </div>
              <span className="pill">{s.series} series</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
