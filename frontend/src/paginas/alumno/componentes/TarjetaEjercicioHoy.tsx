import { fmt, type MolestiaAlumno, type Prescripto } from '../../../dominio/modelos';

interface Props {
  prescripto: Prescripto;
  molestia: MolestiaAlumno | undefined;
  hecho: boolean;
  asistio: boolean;
  onAbrirMolestia: () => void;
  onAlternarHecho: () => void;
}

export default function TarjetaEjercicioHoy({
  prescripto: p,
  molestia,
  hecho,
  asistio,
  onAbrirMolestia,
  onAlternarHecho,
}: Props) {
  const esMusculacion = p.bloque === 'musculacion';

  return (
    <article className={`card ejercicio-alumno ${molestia ? 'mol' : ''}`}>
      <div className="fila">
        <h2 className={molestia ? 'ambar' : ''}>{p.ejercicio.nombre}</h2>
        <span className={`pill ${hecho ? 'l' : ''}`}>
          {esMusculacion ? `${p.series} series` : hecho ? 'Hecho' : 'Pendiente'}
        </span>
      </div>
      <p className="mu">
        {esMusculacion
          ? `${p.series} × ${p.repMin}–${p.repMax} reps · ${fmt(p.cargaObjetivo)} kg · descanso ${p.descanso} s`
          : `${p.series} × ${p.repMax} reps`}
      </p>

      {molestia && (
        <div className="aviso">
          <b className="ambar">⚑ Molestia reportada · {molestia.zona}</b>
          <div>{molestia.observacion}</div>
          <span className="mu">
            {molestia.leida ? 'Tu entrenador ya la vio' : 'Sin leer por tu entrenador'}
          </span>
        </div>
      )}

      <div className="acciones-ejercicio">
        {p.ejercicio.videoUrl && (
          <a className="btn sec chico" href={p.ejercicio.videoUrl} target="_blank" rel="noreferrer">
            ▶ Video
          </a>
        )}
        <button className="btn sec chico" onClick={onAbrirMolestia} type="button">
          ⚑ Molestia
        </button>
        {!esMusculacion && (
          <button
            className="btn sec chico"
            disabled={!asistio}
            onClick={onAlternarHecho}
            type="button"
          >
            {hecho ? '✓ Hecho' : 'Marcar hecho'}
          </button>
        )}
      </div>
    </article>
  );
}
