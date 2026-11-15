import type {
  Alumno,
  Ejercicio,
  MolestiaEntrenador,
  PlanResumen,
} from '../../dominio/modelos';
import EditorPlan from './componentes/EditorPlan';
import EleccionPlanActivo from './componentes/EleccionPlanActivo';
import ListaPlanesAlumno from './componentes/ListaPlanesAlumno';
import ResumenAlumno from './componentes/ResumenAlumno';
import SelectorAlumnos from './componentes/SelectorAlumnos';
import { usePlanificador } from './hooks/usePlanificador';

interface Props {
  alumnos: Alumno[];
  alumnoId: number | null;
  ejercicios: Ejercicio[];
  planes: PlanResumen[];
  molestias: MolestiaEntrenador[];
  onElegirAlumno: (id: number) => void;
  onIrAAlumnos: () => void;
  onRecargar: () => Promise<void> | void;
  /** Si es true, abre el plan activo del alumno (llegada desde una molestia). */
  abrirPlanActivo: boolean;
  onPlanActivoAbierto: () => void;
}

export default function PlanificadorPage({
  alumnos,
  alumnoId,
  ejercicios,
  planes,
  molestias,
  onElegirAlumno,
  onIrAAlumnos,
  onRecargar,
  abrirPlanActivo,
  onPlanActivoAbierto,
}: Props) {
  const planificador = usePlanificador({
    alumnoId,
    planes,
    onRecargar,
    abrirPlanActivo,
    onPlanActivoAbierto,
  });

  const alumnoActual = alumnos.find((a) => a.id === alumnoId);

  if (alumnos.length === 0) {
    return (
      <section className="card estado-vacio grande-vacio">
        <div className="vacio-icono">👥</div>
        <h2>Todavía no tenés alumnos vinculados</h2>
        <p className="mu">
          Vinculá a tu primer alumno con su DNI para empezar a armar planes.
        </p>
        <button className="btn" onClick={onIrAAlumnos} type="button">
          Ir a alumnos
        </button>
      </section>
    );
  }

  return (
    <div className="pagina planificador">
      <SelectorAlumnos
        alumnos={alumnos}
        alumnoId={alumnoId}
        molestias={molestias}
        onElegirAlumno={onElegirAlumno}
      />

      {planificador.errorResumen && <div className="aviso">⚑ {planificador.errorResumen}</div>}

      {alumnoId && (
        <div className="planificador-grid">
          <div className="planificador-editor">
            {!planificador.planEditando &&
              !planificador.creandoNuevo &&
              !planificador.cargandoPlan &&
              planificador.planActivo && (
                <EleccionPlanActivo
                  planActivo={planificador.planActivo}
                  cargando={planificador.cargandoPlan}
                  onEditar={planificador.editarPlan}
                  onCrearNuevo={planificador.crearPlanNuevo}
                />
              )}

            <ListaPlanesAlumno
              planes={planificador.planesDelAlumno}
              alumnoNombre={alumnoActual?.nombre ?? 'este alumno'}
              planEditandoId={planificador.planEditando?.id ?? null}
              cargando={planificador.cargandoPlan}
              error={planificador.errorPlan}
              onEditar={planificador.editarPlan}
              onAsignar={planificador.asignarPlan}
              onCrearNuevo={planificador.crearPlanNuevo}
            />

            <div className="paso-titulo">
              <span className="numero-paso">3</span>
              <div>
                <h2>{planificador.planEditando ? 'Modificá el plan' : 'Armá el plan'}</h2>
                <p className="mu">
                  Elegí ejercicios de la biblioteca, ordenalos y definí series, reps y carga.
                </p>
              </div>
            </div>
            <EditorPlan
              key={`${alumnoId}-${planificador.editorVersion}`}
              alumnoId={alumnoId}
              resumen={planificador.resumen}
              ejercicios={ejercicios}
              planInicial={planificador.planEditando}
              onGuardado={planificador.despuesDeGuardar}
              onSalirEdicion={planificador.salirEdicion}
              onCrearNuevo={planificador.crearPlanNuevo}
            />
          </div>

          <aside className="planificador-aside">
            <div className="paso-titulo">
              <span className="numero-paso">4</span>
              <div>
                <h2>Mirá antes de guardar</h2>
                <p className="mu">Resumen, molestias y récords del alumno.</p>
              </div>
            </div>
            <ResumenAlumno resumen={planificador.resumen} cargando={planificador.cargandoResumen} />
          </aside>
        </div>
      )}
    </div>
  );
}
