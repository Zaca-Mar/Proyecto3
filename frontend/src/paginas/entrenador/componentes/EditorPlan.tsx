import type { Ejercicio, PlanDetalle, Resumen } from '../../../dominio/modelos';
import SelectorEjercicios from './SelectorEjercicios';
import DiaEditor from './editor-plan/DiaEditor';
import { useEditorPlan } from './editor-plan/useEditorPlan';

interface Props {
  alumnoId: number;
  resumen: Resumen | null;
  ejercicios: Ejercicio[];
  planInicial: PlanDetalle | null;
  onGuardado: () => Promise<void> | void;
  onSalirEdicion: () => void;
  onCrearNuevo: () => void;
}

export default function EditorPlan({
  alumnoId,
  resumen,
  ejercicios,
  planInicial,
  onGuardado,
  onSalirEdicion,
  onCrearNuevo,
}: Props) {
  const editor = useEditorPlan({
    alumnoId,
    resumen,
    ejercicios,
    planInicial,
    onGuardado,
    onSalirEdicion,
  });

  return (
    <div className="editor-plan">
      <section className="card">
        <div className="fila">
          <div>
            <h2>{editor.editando ? 'Modificar plan' : 'Armar plan'}</h2>
            <p className="mu">
              {resumen
                ? `Para ${resumen.alumno.nombre} ${resumen.alumno.apellido}`
                : 'Elegí un alumno para asignarlo'}
            </p>
          </div>
          <span className="pill l">
            {editor.dias.length} {editor.dias.length === 1 ? 'día' : 'días'} ·{' '}
            {editor.totalEjercicios} ejercicios
          </span>
        </div>

        {editor.editando && planInicial && (
          <div className="aviso copia-aviso">
            <b>Editando una copia de «{planInicial.nombre}»</b>
            <span>
              {planInicial.activo
                ? 'Al guardar se crea un plan nuevo con tus cambios y se activa automáticamente; el original conserva su historial.'
                : 'Al guardar se crea un plan nuevo con tus cambios, pero queda inactivo. Usá «Asignar» en la lista para activarlo.'}
            </span>
            <div className="acciones-fila">
              <button className="btn sec mini" onClick={editor.cancelarEdicion} type="button">
                Cancelar edición
              </button>
              <button className="btn sec mini" onClick={onCrearNuevo} type="button">
                Crear desde 0
              </button>
            </div>
          </div>
        )}

        <label>
          Nombre del plan
          <input
            value={editor.nombre}
            onChange={(e) => editor.setNombre(e.target.value)}
            placeholder="Ej.: Hipertrofia · 3 días"
          />
        </label>

        <DiaEditor
          dias={editor.dias}
          diaActivo={editor.diaActivo}
          onActivarDia={editor.setDiaActivo}
          onAgregarDia={editor.agregarDia}
          onQuitarDia={editor.quitarDia}
          onRenombrarDia={editor.renombrarDia}
          onActualizar={editor.actualizar}
          onQuitarEjercicio={editor.quitarEjercicio}
          onMoverEjercicio={editor.moverEjercicio}
          molestiasDelEjercicio={editor.molestiasDelEjercicio}
        />
      </section>

      <SelectorEjercicios
        ejercicios={ejercicios}
        idsConMolestia={editor.idsConMolestia}
        zonasMolestia={editor.zonasMolestia}
        onAgregar={editor.agregarEjercicio}
      />

      {editor.error && <div className="aviso">⚑ {editor.error}</div>}
      {editor.exito && <div className="exito">✓ {editor.exito}</div>}
      {editor.advertencias.length > 0 && (
        <div className="aviso">
          <b>El plan se guardó, pero revisá estas molestias:</b>
          <ul>
            {editor.advertencias.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      )}

      <div className="acciones-plan">
        <button className="btn" onClick={editor.guardar} disabled={editor.guardando || !resumen}>
          {editor.guardando
            ? 'Guardando…'
            : editor.editando
              ? 'Guardar copia modificada'
              : 'Crear y asignar plan'}
        </button>
        <span className="mu">
          {editor.editando
            ? planInicial?.activo
              ? 'Se creará una copia nueva y se activará; el plan original quedará como estaba.'
              : 'Se creará una copia nueva inactiva; usá «Asignar» para activarla.'
            : 'Al asignarlo, el plan activo anterior se desactiva y su historial se conserva.'}
        </span>
      </div>
    </div>
  );
}
