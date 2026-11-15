import { fmt, type PuntoCarga } from '../../../../dominio/modelos';
import { fechaCorta } from '../../../../utils/formato';

export default function Sparkline({ puntos }: { puntos: PuntoCarga[] }) {
  if (puntos.length === 0) return null;

  const ancho = 300;
  const alto = 72;
  const margen = 8;
  const cargas = puntos.map((p) => p.cargaMax);
  const max = Math.max(...cargas);
  const min = Math.min(...cargas);
  const rango = max - min || 1;

  const coordenadas = puntos.map((p, i) => {
    const x =
      puntos.length === 1
        ? ancho / 2
        : margen + (i / (puntos.length - 1)) * (ancho - margen * 2);
    const y = alto - margen - ((p.cargaMax - min) / rango) * (alto - margen * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <div className="sparkline-contenedor">
      <svg
        viewBox={`0 0 ${ancho} ${alto}`}
        className="sparkline"
        role="img"
        aria-label="Evolución de carga"
      >
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
