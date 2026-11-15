import type { PlanResumen } from '../../../dominio/modelos';
import { fechaCorta } from '../../../utils/formato';

interface Props {
  planes: PlanResumen[];
  alumnoNombre: string;
  planEditandoId: number | null;
  cargando: boolean;
  error: string;
  onEditar: (id: number) => void;
  onAsignar: (id: number) => void;
  onCrearNuevo: () => void;
}

export default function ListaPlanesAlumno({
  planes,
  alumnoNombre,
  planEditandoId,
  cargando,
  error,
  onEditar,
  onAsignar,
  onCrearNuevo,
}: Props) {
  return (
    <section className="card planes-alumno">
      <div className="fila">
        <div>
          <div className="paso-titulo">
            <span className="numero-paso">2</span>
            <div>
              <h2>Planes de {alumnoNombre}</h2>
              <p className="mu">
                Elegí uno para modificarlo como copia, o creá un plan nuevo desde 0.
              </p>
            </div>
          </div>
        </div>
        <button className="btn sec mini" onClick={onCrearNuevo} type="button">
          ＋ Plan nuevo
        </button>
      </div>

      {error && <div className="aviso">⚑ {error}</div>}

      {planes.length === 0 ? (
        <p className="mu">Todavía no le creaste ningún plan. El primero se guarda acá.</p>
      ) : (
        <div className="lista-simple">
          {planes.map((p) => {
            const enEdicion = planEditandoId === p.id;
            return (
              <div className={`fila-item plan-item ${p.activo ? 'activo' : ''}`} key={p.id}>
                <div className="crece">
                  <b>{p.nombre}</b>
                  <div className="mu">
                    {fechaCorta(p.creado.slice(0, 10))} · {p.dias} días · {p.ejercicios} ejercicios
                  </div>
                </div>
                <span className={`pill ${p.activo ? 'l' : ''}`}>
                  {p.activo ? 'Activo' : 'Inactivo'}
                </span>
                {enEdicion && <span className="pill a">Editando</span>}
                <div className="acciones-fila plan-acciones">
                  <button
                    className="btn sec mini"
                    onClick={() => onEditar(p.id)}
                    disabled={cargando}
                    type="button"
                  >
                    Editar
                  </button>
                  {!p.activo && (
                    <button
                      className="btn mini"
                      onClick={() => onAsignar(p.id)}
                      disabled={cargando}
                      type="button"
                    >
                      Asignar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
