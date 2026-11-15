import type { Estadisticas } from '../../../../dominio/modelos';
import { semanaCorta } from '../../../../utils/formato';

interface Props {
  semanas: Estadisticas['volumenSemanal'];
}

export default function VolumenSemanal({ semanas }: Props) {
  const max = Math.max(1, ...semanas.map((v) => v.totalSeries));

  return (
    <section className="bloque-progreso">
      <h2>Volumen semanal</h2>
      <p className="mu">Series registradas por semana. Sirve para controlar la carga total.</p>
      {semanas.map((semana) => (
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
      ))}
    </section>
  );
}
