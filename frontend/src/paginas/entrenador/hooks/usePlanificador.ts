import { useCallback, useEffect, useState } from 'react';
import { api, mensajeDeError } from '../../../api/cliente';
import type { PlanDetalle, PlanResumen, Resumen } from '../../../dominio/modelos';

interface Args {
  alumnoId: number | null;
  planes: PlanResumen[];
  onRecargar: () => Promise<void> | void;
  abrirPlanActivo: boolean;
  onPlanActivoAbierto: () => void;
}

export function usePlanificador({
  alumnoId,
  planes,
  onRecargar,
  abrirPlanActivo,
  onPlanActivoAbierto,
}: Args) {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [cargandoResumen, setCargandoResumen] = useState(false);
  const [errorResumen, setErrorResumen] = useState('');
  const [planEditando, setPlanEditando] = useState<PlanDetalle | null>(null);
  const [editorVersion, setEditorVersion] = useState(0);
  const [cargandoPlan, setCargandoPlan] = useState(false);
  const [errorPlan, setErrorPlan] = useState('');
  const [creandoNuevo, setCreandoNuevo] = useState(false);

  const cargarResumen = useCallback(async () => {
    if (!alumnoId) {
      setResumen(null);
      return;
    }
    setCargandoResumen(true);
    setErrorResumen('');
    try {
      setResumen(await api<Resumen>(`/alumnos/${alumnoId}/resumen`));
    } catch (e) {
      setResumen(null);
      setErrorResumen(mensajeDeError(e));
    } finally {
      setCargandoResumen(false);
    }
  }, [alumnoId]);

  useEffect(() => {
    cargarResumen();
  }, [cargarResumen]);

  useEffect(() => {
    setPlanEditando(null);
    setCreandoNuevo(false);
    setErrorPlan('');
    setEditorVersion((v) => v + 1);
  }, [alumnoId]);

  const despuesDeGuardar = useCallback(async () => {
    await Promise.all([onRecargar(), cargarResumen()]);
  }, [onRecargar, cargarResumen]);

  const editarPlan = useCallback(async (id: number) => {
    setCargandoPlan(true);
    setErrorPlan('');
    try {
      setPlanEditando(await api<PlanDetalle>(`/planes/${id}`));
      setCreandoNuevo(false);
      setEditorVersion((v) => v + 1);
    } catch (e) {
      setErrorPlan(mensajeDeError(e));
    } finally {
      setCargandoPlan(false);
    }
  }, []);

  const crearPlanNuevo = useCallback(() => {
    setPlanEditando(null);
    setCreandoNuevo(true);
    setErrorPlan('');
    setEditorVersion((v) => v + 1);
  }, []);

  const asignarPlan = useCallback(
    async (id: number) => {
      if (!alumnoId) return;
      setCargandoPlan(true);
      setErrorPlan('');
      try {
        await api(`/planes/${id}/asignar`, { method: 'POST', body: { alumnoId } });
        await despuesDeGuardar();
      } catch (e) {
        setErrorPlan(mensajeDeError(e));
      } finally {
        setCargandoPlan(false);
      }
    },
    [alumnoId, despuesDeGuardar],
  );

  const planesDelAlumno = planes.filter((p) => p.alumnoId === alumnoId);
  const planActivo = planesDelAlumno.find((p) => p.activo) ?? null;

  useEffect(() => {
    if (!abrirPlanActivo) return;
    if (alumnoId && planActivo) void editarPlan(planActivo.id);
    onPlanActivoAbierto();
  }, [abrirPlanActivo, alumnoId, planActivo, onPlanActivoAbierto, editarPlan]);

  const salirEdicion = useCallback(() => setPlanEditando(null), []);

  return {
    resumen,
    cargandoResumen,
    errorResumen,
    planEditando,
    editorVersion,
    cargandoPlan,
    errorPlan,
    creandoNuevo,
    planesDelAlumno,
    planActivo,
    despuesDeGuardar,
    editarPlan,
    crearPlanNuevo,
    asignarPlan,
    salirEdicion,
  };
}
