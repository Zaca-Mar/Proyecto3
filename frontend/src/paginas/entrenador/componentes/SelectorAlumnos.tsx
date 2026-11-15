import type { Alumno, MolestiaEntrenador } from '../../../dominio/modelos';

interface Props {
  alumnos: Alumno[];
  alumnoId: number | null;
  molestias: MolestiaEntrenador[];
  onElegirAlumno: (id: number) => void;
}

export default function SelectorAlumnos({
  alumnos,
  alumnoId,
  molestias,
  onElegirAlumno,
}: Props) {
  return (
    <section className="card selector-alumnos">
      <div className="fila">
        <div>
          <h2>1 · Elegí el alumno</h2>
          <p className="mu">El panel derecho se actualiza con su historial y molestias.</p>
        </div>
        <span className="pill">{alumnos.length} disponibles</span>
      </div>
      <div className="chips-alumnos">
        {alumnos.map((a) => {
          const sinLeer = molestias.filter((m) => m.alumnoId === a.id && !m.leida).length;
          return (
            <button
              key={a.id}
              className={`chip-alumno ${a.id === alumnoId ? 'on' : ''}`}
              onClick={() => onElegirAlumno(a.id)}
              type="button"
            >
              <span className="avatar chico-avatar">
                {a.nombre[0]}
                {a.apellido[0]}
              </span>
              <span className="chip-texto">
                <b>
                  {a.nombre} {a.apellido}
                </b>
                <span className="mu">DNI {a.dni}</span>
              </span>
              {sinLeer > 0 && <span className="punto-alerta">{sinLeer}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
