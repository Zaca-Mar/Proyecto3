import { fmt } from '../../../dominio/modelos';

interface Props {
  titulo: string;
  valor: number;
  unidad: string;
  menos: () => void;
  mas: () => void;
}

export default function Paso({ titulo, valor, unidad, menos, mas }: Props) {
  return (
    <div className="paso">
      <span className="mu">{titulo.toUpperCase()}</span>
      <b>
        {fmt(valor)} <small className="mu">{unidad}</small>
      </b>
      <div>
        <button onClick={menos} aria-label={`Menos ${titulo}`} type="button">
          −
        </button>
        <button onClick={mas} aria-label={`Más ${titulo}`} type="button">
          +
        </button>
      </div>
    </div>
  );
}
