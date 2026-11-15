import type { DiaDraft, EjercicioDraft } from '../../../../dominio/modelos';
import FilaEjercicio from './FilaEjercicio';
import type { MolestiaResumen } from './useEditorPlan';

interface Props {
  dias: DiaDraft[];
  diaActivo: number;
  onActivarDia: (indice: number) => void;
  onAgregarDia: () => void;
  onQuitarDia: (indice: number) => void;
  onRenombrarDia: (nombre: string) => void;
  onActualizar: (key: string, cambios: Partial<EjercicioDraft>) => void;
  onQuitarEjercicio: (key: string) => void;
  onMoverEjercicio: (index: number, direccion: -1 | 1) => void;
  molestiasDelEjercicio: (ejercicio: EjercicioDraft) => MolestiaResumen[];
}

export default function DiaEditor({
  dias,
  diaActivo,
  onActivarDia,
  onAgregarDia,
  onQuitarDia,
  onRenombrarDia,
  onActualizar,
  onQuitarEjercicio,
  onMoverEjercicio,
  molestiasDelEjercicio,
}: Props) {
  const dia = dias[Math.min(diaActivo, dias.length - 1)];

  return (
    <>
      <div className="tabs-dias">
        {dias.map((d, i) => (
          <button
            key={d.key}
            className={i === diaActivo ? 'on' : ''}
            onClick={() => onActivarDia(i)}
            type="button"
          >
            {d.nombre || `Día ${i + 1}`}
            <span className="contador">{d.ejercicios.length}</span>
          </button>
        ))}
        <button className="agregar-dia" onClick={onAgregarDia} type="button">
          ＋ Día
        </button>
      </div>

      {dia && (
        <div className="dia-activo">
          <div className="fila">
            <label className="crece">
              Nombre del día
              <input value={dia.nombre} onChange={(e) => onRenombrarDia(e.target.value)} />
            </label>
            <button
              className="btn sec mini"
              onClick={() => onQuitarDia(diaActivo)}
              type="button"
              disabled={dias.length === 1}
            >
              Quitar día
            </button>
          </div>

          {dia.ejercicios.length === 0 && (
            <div className="estado-vacio">
              <b>Este día todavía no tiene ejercicios.</b>
              <p className="mu">Usá la biblioteca de abajo para sumar movilidad, zona media o musculación.</p>
            </div>
          )}

          <div className="filas-ejercicio">
            {dia.ejercicios.map((e, index) => (
              <FilaEjercicio
                key={e.key}
                ejercicio={e}
                index={index}
                total={dia.ejercicios.length}
                molestias={molestiasDelEjercicio(e)}
                onActualizar={onActualizar}
                onQuitar={onQuitarEjercicio}
                onMover={onMoverEjercicio}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
