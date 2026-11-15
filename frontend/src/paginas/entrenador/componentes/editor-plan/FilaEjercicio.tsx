import type { Bloque, EjercicioDraft } from '../../../../dominio/modelos';
import { BLOQUES } from '../../../../dominio/modelos';
import type { MolestiaResumen } from './useEditorPlan';

interface Props {
  ejercicio: EjercicioDraft;
  index: number;
  total: number;
  molestias: MolestiaResumen[];
  onActualizar: (key: string, cambios: Partial<EjercicioDraft>) => void;
  onQuitar: (key: string) => void;
  onMover: (index: number, direccion: -1 | 1) => void;
}

export default function FilaEjercicio({
  ejercicio: e,
  index,
  total,
  molestias,
  onActualizar,
  onQuitar,
  onMover,
}: Props) {
  const zonasAfectadas = [...new Set(molestias.map((m) => m.zona))];

  return (
    <div className={`fila-ejercicio ${molestias.length ? 'con-alerta' : ''}`}>
      <div className="ejercicio-info">
        <div className="fila">
          <b>{e.nombre}</b>
          <span className="pill">{e.grupoMuscular}</span>
        </div>
        {molestias.length > 0 ? (
          <div className="aviso inline">
            <b>⚑ Puede afectar una molestia · {zonasAfectadas.join(', ')}</b>
            {molestias.slice(0, 2).map((m) => (
              <span key={m.id}>“{m.observacion}”</span>
            ))}
            {molestias.length > 2 && (
              <span className="mu">+{molestias.length - 2} más…</span>
            )}
          </div>
        ) : (
          <span className="mu">Sin molestias relacionadas</span>
        )}
      </div>

      <div className="campos-ejercicio">
        <label className="campo-mini">
          Bloque
          <select
            value={e.bloque}
            onChange={(ev) => onActualizar(e.key, { bloque: ev.target.value as Bloque })}
          >
            {BLOQUES.map((b) => (
              <option key={b.valor} value={b.valor}>{b.titulo}</option>
            ))}
          </select>
        </label>
        <label className="campo-mini">
          Series
          <input
            type="number"
            min={1}
            value={e.series}
            onChange={(ev) => onActualizar(e.key, { series: Number(ev.target.value) })}
          />
        </label>
        <label className="campo-mini">
          Rep. mín.
          <input
            type="number"
            min={1}
            value={e.repMin}
            onChange={(ev) => onActualizar(e.key, { repMin: Number(ev.target.value) })}
          />
        </label>
        <label className="campo-mini">
          Rep. máx.
          <input
            type="number"
            min={1}
            value={e.repMax}
            onChange={(ev) => onActualizar(e.key, { repMax: Number(ev.target.value) })}
          />
        </label>
        <label className="campo-mini">
          Carga (kg)
          <input
            type="number"
            min={0}
            step={0.5}
            value={e.cargaObjetivo}
            onChange={(ev) => onActualizar(e.key, { cargaObjetivo: Number(ev.target.value) })}
          />
        </label>
        <label className="campo-mini">
          Descanso (s)
          <input
            type="number"
            min={0}
            step={15}
            value={e.descanso}
            onChange={(ev) => onActualizar(e.key, { descanso: Number(ev.target.value) })}
          />
        </label>
      </div>

      <div className="acciones-fila">
        <button
          className="icono-mini"
          onClick={() => onMover(index, -1)}
          disabled={index === 0}
          title="Subir"
          type="button"
        >
          ↑
        </button>
        <button
          className="icono-mini"
          onClick={() => onMover(index, 1)}
          disabled={index === total - 1}
          title="Bajar"
          type="button"
        >
          ↓
        </button>
        <button
          className="icono-mini peligro"
          onClick={() => onQuitar(e.key)}
          title="Quitar"
          type="button"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
