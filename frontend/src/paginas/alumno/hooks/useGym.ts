import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, mensajeDeError } from '../../../api/cliente';
import type { Ejercicio, Sesion } from '../../../dominio/modelos';

interface Args {
  sesion: Sesion;
  terminado: () => void;
}

export function useGym({ sesion, terminado }: Args) {
  const [actual, setActual] = useState<Sesion>(sesion);
  const [catalogo, setCatalogo] = useState<Ejercicio[]>([]);
  const [idx, setIdx] = useState(() => {
    const muscInicial = sesion.prescripto.filter((p) => p.bloque === 'musculacion');
    const inicio = muscInicial.findIndex(
      (p) => sesion.series.filter((s) => s.ejercicioId === p.ejercicioId).length < p.series,
    );
    return inicio >= 0 ? inicio : Math.max(0, muscInicial.length - 1);
  });
  const [carga, setCarga] = useState(0);
  const [reps, setReps] = useState(0);
  const [rpe, setRpe] = useState<number | null>(null);
  const [editando, setEditando] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [finDescanso, setFinDescanso] = useState(0);
  const [ahora, setAhora] = useState(Date.now());

  const musc = useMemo(
    () => actual.prescripto.filter((p) => p.bloque === 'musculacion'),
    [actual],
  );
  const hechasDe = useCallback(
    (id: number) =>
      actual.series.filter((s) => s.ejercicioId === id).sort((a, b) => a.numero - b.numero),
    [actual],
  );

  useEffect(() => {
    api<Ejercicio[]>('/ejercicios')
      .then(setCatalogo)
      .catch(() => setCatalogo([]));
  }, []);

  const p = musc[Math.min(idx, Math.max(0, musc.length - 1))];
  const hechas = p ? hechasDe(p.ejercicioId) : [];
  const porId = useMemo(() => new Map(catalogo.map((e) => [e.id, e])), [catalogo]);
  const ejercicioActual: Ejercicio | null = p
    ? porId.get(p.ejercicioId) ?? {
        id: p.ejercicioId,
        nombre: p.nombre,
        grupoMuscular: p.grupoMuscular,
        videoUrl: null,
        zonas: [],
        incremento: p.incremento,
      }
    : null;

  const ejercicioId = p?.ejercicioId;
  const cargaObjetivo = p?.cargaObjetivo ?? 0;
  const repMax = p?.repMax ?? 0;

  useEffect(() => {
    if (ejercicioId === undefined) return;
    setCarga(cargaObjetivo);
    setReps(repMax);
    setRpe(null);
    setEditando(null);
  }, [idx, ejercicioId, cargaObjetivo, repMax]);

  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const resta = Math.max(0, Math.ceil((finDescanso - ahora) / 1000));
  const todoCompleto = musc.every((x) => hechasDe(x.ejercicioId).length >= x.series);

  const refrescarSesion = useCallback(async () => {
    const nueva = await api<Sesion | null>('/sesiones/actual');
    if (nueva) setActual(nueva);
  }, []);

  async function guardar() {
    if (!p) return;
    if (!rpe) return setError('Ingresá el RPE para guardar la serie: es obligatorio.');
    setError('');
    setGuardando(true);
    try {
      if (editando !== null) {
        await api(`/series/${editando}`, {
          method: 'PATCH',
          body: { carga, repeticiones: reps, rpe },
        });
        setEditando(null);
      } else {
        await api(`/sesiones/${actual.id}/series`, {
          method: 'POST',
          body: { ejercicioId: p.ejercicioId, carga, repeticiones: reps, rpe },
        });
        if (p.descanso > 0) setFinDescanso(Date.now() + p.descanso * 1000);
        if (hechas.length + 1 >= p.series && idx < musc.length - 1) setIdx(idx + 1);
      }
      setRpe(null);
      await refrescarSesion();
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setGuardando(false);
    }
  }

  function saltarDescanso() {
    setFinDescanso(0);
  }

  async function terminar() {
    setError('');
    setCerrando(true);
    try {
      await api(`/sesiones/${actual.id}/cerrar`, { method: 'POST' });
      terminado();
    } catch (e) {
      setError(mensajeDeError(e));
      setCerrando(false);
    }
  }

  function editarSerie(serie: { id: number; carga: number; repeticiones: number; rpe: number }) {
    setEditando(serie.id);
    setCarga(serie.carga);
    setReps(serie.repeticiones);
    setRpe(serie.rpe);
  }

  return {
    actual,
    idx,
    setIdx,
    carga,
    setCarga,
    reps,
    setReps,
    rpe,
    setRpe,
    editando,
    error,
    setError,
    guardando,
    cerrando,
    resta,
    musc,
    hechas,
    hechasDe,
    ejercicioActual,
    todoCompleto,
    guardar,
    terminar,
    saltarDescanso,
    refrescarSesion,
    editarSerie,
    p,
  };
}

export type GymEstado = ReturnType<typeof useGym>;