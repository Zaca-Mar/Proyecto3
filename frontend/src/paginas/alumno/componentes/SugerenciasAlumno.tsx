import { fmt, type Sugerencia } from '../../../dominio/modelos';

interface Props {
  sugerencias: Sugerencia[];
}

export default function SugerenciasAlumno({ sugerencias }: Props) {
  if (sugerencias.length === 0) return null;

  return (
    <section className="sugerencias-alumno">
      <div className="fila">
        <h2>Para la próxima</h2>
        <span className="pill l">{sugerencias.length}</span>
      </div>
      <p className="mu">Cargas que propone tu progresión, revisadas por tu entrenador.</p>
      {sugerencias.slice(0, 4).map((s) => (
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
  );
}
