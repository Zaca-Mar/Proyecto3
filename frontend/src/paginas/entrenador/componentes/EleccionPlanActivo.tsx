import type { PlanResumen } from '../../../dominio/modelos';

interface Props {
  planActivo: PlanResumen;
  cargando: boolean;
  onEditar: (id: number) => void;
  onCrearNuevo: () => void;
}

export default function EleccionPlanActivo({
  planActivo,
  cargando,
  onEditar,
  onCrearNuevo,
}: Props) {
  return (
    <section className="card eleccion-plan">
      <div className="fila">
        <div className="crece">
          <h2>¿Modificás el plan actual o creás uno nuevo?</h2>
          <p className="mu">
            Plan actual: «{planActivo.nombre}». Si lo modificás, se guarda como copia y se activa.
          </p>
        </div>
        <span className="pill l">Activo</span>
      </div>
      <div className="acciones-fila">
        <button
          className="btn"
          onClick={() => onEditar(planActivo.id)}
          disabled={cargando}
          type="button"
        >
          Modificar plan actual
        </button>
        <button className="btn sec" onClick={onCrearNuevo} type="button">
          Crear desde 0
        </button>
      </div>
    </section>
  );
}
