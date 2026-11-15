import { fmt, type ProgresoEjercicio } from '../../../../dominio/modelos';
import { fechaCorta } from '../../../../utils/formato';
import Sparkline from './Sparkline';

interface Props {
  item: ProgresoEjercicio;
  expandido: boolean;
  onToggle: () => void;
}

export default function TarjetaProgreso({ item, expandido, onToggle }: Props) {
  const puntos = item.puntos;
  const ultimo = puntos.at(-1);
  const primero = puntos[0];
  const delta = primero && ultimo ? ultimo.cargaMax - primero.cargaMax : 0;

  return (
    <article className="card progreso-card">
      <button className="progreso-cabecera" onClick={onToggle} type="button">
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
}
