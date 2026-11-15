import { useEffect, useMemo, useState } from 'react';
import { api, mensajeDeError } from '../../../../api/cliente';
import type {
  Bloque,
  DiaDraft,
  Ejercicio,
  EjercicioDraft,
  PlanDetalle,
  Resumen,
} from '../../../../dominio/modelos';
import { normalizarZona } from '../../../../dominio/modelos';
import { zonasQueAfecta } from '../../../../dominio/lesiones';
import { planDraftSchema } from '../../../../esquemas/plan.schema';

export type MolestiaResumen = Resumen['molestias'][number];

interface Args {
  alumnoId: number;
  resumen: Resumen | null;
  ejercicios: Ejercicio[];
  planInicial: PlanDetalle | null;
  onGuardado: () => Promise<void> | void;
  onSalirEdicion: () => void;
}

const clave = () => Math.random().toString(36).slice(2, 10);
const SUFIJO_COPIA = ' · copia por molestia';

function nombreCopia(base: string): string {
  const limpio = base.endsWith(SUFIJO_COPIA) ? base.slice(0, -SUFIJO_COPIA.length) : base;
  return `${limpio}${SUFIJO_COPIA}`;
}

function bloqueDeGrupo(grupo: string): Bloque {
  if (grupo === 'Movilidad') return 'movilidad';
  if (grupo === 'Zona media') return 'zona_media';
  return 'musculacion';
}

function nuevoDia(nombre: string): DiaDraft {
  return { key: clave(), nombre, ejercicios: [] };
}

export function useEditorPlan({
  alumnoId,
  resumen,
  ejercicios,
  planInicial,
  onGuardado,
  onSalirEdicion,
}: Args) {
  const [nombre, setNombre] = useState('');
  const [dias, setDias] = useState<DiaDraft[]>([nuevoDia('Día A')]);
  const [diaActivo, setDiaActivo] = useState(0);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [advertencias, setAdvertencias] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);

  const editando = Boolean(planInicial);

  useEffect(() => {
    setError('');
    setExito('');
    setAdvertencias([]);
  }, [alumnoId]);

  useEffect(() => {
    setDiaActivo(0);
    if (!planInicial) {
      setNombre('');
      setDias([nuevoDia('Día A')]);
      return;
    }
    setNombre(nombreCopia(planInicial.nombre));
    const diasOrdenados = [...planInicial.dias].sort((a, b) => a.orden - b.orden);
    setDias(
      diasOrdenados.map((d) => ({
        key: clave(),
        nombre: d.nombre,
        ejercicios: [...d.ejercicios]
          .sort((a, b) => a.orden - b.orden)
          .map((e) => ({
            key: clave(),
            ejercicioId: e.ejercicioId,
            nombre: e.ejercicio.nombre,
            grupoMuscular: e.ejercicio.grupoMuscular,
            zonas: e.ejercicio.zonas ?? [],
            bloque: e.bloque,
            series: e.series,
            repMin: e.repMin,
            repMax: e.repMax,
            cargaObjetivo: e.cargaObjetivo,
            descanso: e.descanso,
          })),
      })),
    );
  }, [planInicial]);

  const molestias = useMemo(() => resumen?.molestias ?? [], [resumen]);
  const idsConMolestia = useMemo(
    () => new Set(molestias.map((m) => m.ejercicioId)),
    [molestias],
  );
  const zonasMolestia = useMemo(
    () => new Set(molestias.map((m) => normalizarZona(m.zona))),
    [molestias],
  );
  const ejerciciosPorId = useMemo(
    () => new Map(ejercicios.map((e) => [e.id, e])),
    [ejercicios],
  );

  function molestiasDelEjercicio(e: EjercicioDraft): MolestiaResumen[] {
    const catalogo = ejerciciosPorId.get(e.ejercicioId);
    const zonas = catalogo
      ? zonasQueAfecta(catalogo)
      : new Set((e.zonas ?? []).map(normalizarZona));
    return molestias.filter(
      (m) => m.ejercicioId === e.ejercicioId || zonas.has(normalizarZona(m.zona)),
    );
  }

  const dia = dias[Math.min(diaActivo, dias.length - 1)];

  function agregarEjercicio(ejercicio: Ejercicio) {
    if (!dia) return;
    if (dia.ejercicios.some((e) => e.ejercicioId === ejercicio.id)) {
      return setError(`“${ejercicio.nombre}” ya está en ${dia.nombre}.`);
    }
    setError('');
    const bloque = bloqueDeGrupo(ejercicio.grupoMuscular);
    const musculacion = bloque === 'musculacion';
    const nuevo: EjercicioDraft = {
      key: clave(),
      ejercicioId: ejercicio.id,
      nombre: ejercicio.nombre,
      grupoMuscular: ejercicio.grupoMuscular,
      zonas: ejercicio.zonas ?? [],
      bloque,
      series: musculacion ? 3 : 2,
      repMin: musculacion ? 8 : 10,
      repMax: musculacion ? 12 : 10,
      cargaObjetivo: 0,
      descanso: musculacion ? 90 : 0,
    };
    setDias((actuales) =>
      actuales.map((d, i) =>
        i === diaActivo ? { ...d, ejercicios: [...d.ejercicios, nuevo] } : d,
      ),
    );
  }

  function actualizar(key: string, cambios: Partial<EjercicioDraft>) {
    setDias((actuales) =>
      actuales.map((d, i) =>
        i === diaActivo
          ? {
              ...d,
              ejercicios: d.ejercicios.map((e) => (e.key === key ? { ...e, ...cambios } : e)),
            }
          : d,
      ),
    );
  }

  function quitarEjercicio(key: string) {
    setDias((actuales) =>
      actuales.map((d, i) =>
        i === diaActivo
          ? { ...d, ejercicios: d.ejercicios.filter((e) => e.key !== key) }
          : d,
      ),
    );
  }

  function moverEjercicio(index: number, direccion: -1 | 1) {
    const destino = index + direccion;
    if (destino < 0) return;
    setDias((actuales) =>
      actuales.map((d, i) => {
        if (i !== diaActivo || destino >= d.ejercicios.length) return d;
        const lista = [...d.ejercicios];
        [lista[index], lista[destino]] = [lista[destino], lista[index]];
        return { ...d, ejercicios: lista };
      }),
    );
  }

  function agregarDia() {
    const letra = String.fromCharCode(65 + dias.length);
    const nombreNuevo = dias.length < 26 ? `Día ${letra}` : `Día ${dias.length + 1}`;
    setDias((actuales) => [...actuales, nuevoDia(nombreNuevo)]);
    setDiaActivo(dias.length);
  }

  function quitarDia(index: number) {
    if (dias.length === 1) return setError('El plan necesita al menos un día.');
    setDias((actuales) => actuales.filter((_, i) => i !== index));
    setDiaActivo((actual) => Math.max(0, actual >= index ? actual - 1 : actual));
  }

  function renombrarDia(nombreDia: string) {
    setDias((actuales) =>
      actuales.map((d, i) => (i === diaActivo ? { ...d, nombre: nombreDia } : d)),
    );
  }

  function cancelarEdicion() {
    setError('');
    setExito('');
    setAdvertencias([]);
    onSalirEdicion();
  }

  async function guardar() {
    setError('');
    setExito('');
    setAdvertencias([]);

    const validado = planDraftSchema.safeParse({ nombre, dias });
    if (!validado.success) {
      return setError(validado.error.issues[0].message);
    }

    setGuardando(true);
    try {
      const respuesta = await api<{ plan: { id: number; nombre: string }; advertencias: string[] }>(
        '/planes',
        {
          method: 'POST',
          body: {
            nombre: validado.data.nombre,
            alumnoId,
            dias: validado.data.dias.map((d) => ({
              nombre: d.nombre,
              ejercicios: d.ejercicios.map((e) => ({
                ejercicioId: e.ejercicioId,
                bloque: e.bloque,
                series: e.series,
                repMin: e.repMin,
                repMax: e.repMax,
                cargaObjetivo: e.cargaObjetivo,
                descanso: e.descanso,
              })),
            })),
          },
        },
      );

      if (!editando || planInicial?.activo) {
        await api(`/planes/${respuesta.plan.id}/asignar`, {
          method: 'POST',
          body: { alumnoId },
        });
      }

      const mensaje = editando
        ? planInicial?.activo
          ? `Copia modificada “${respuesta.plan.nombre}” creada y activada. El plan anterior quedó inactivo.`
          : `Copia modificada “${respuesta.plan.nombre}” guardada como inactiva. Usá «Asignar» para activarla.`
        : `Plan “${respuesta.plan.nombre}” creado y asignado. El plan anterior quedó inactivo.`;

      setExito(mensaje);
      setAdvertencias(respuesta.advertencias);
      setNombre('');
      setDias([nuevoDia('Día A')]);
      setDiaActivo(0);
      onSalirEdicion();
      await onGuardado();
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setGuardando(false);
    }
  }

  const totalEjercicios = dias.reduce((total, d) => total + d.ejercicios.length, 0);

  return {
    nombre,
    setNombre,
    dias,
    diaActivo,
    setDiaActivo,
    dia,
    error,
    exito,
    advertencias,
    guardando,
    editando,
    totalEjercicios,
    idsConMolestia,
    zonasMolestia,
    molestiasDelEjercicio,
    agregarEjercicio,
    actualizar,
    quitarEjercicio,
    moverEjercicio,
    agregarDia,
    quitarDia,
    renombrarDia,
    cancelarEdicion,
    guardar,
  };
}

export type EditorPlanEstado = ReturnType<typeof useEditorPlan>;
