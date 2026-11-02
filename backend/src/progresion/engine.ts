/**
 * Motor de doble progresión. Función pura: sin base de datos, fácil de testear
 * y de reemplazar por otra estrategia más adelante (misma firma).
 */
export interface SerieIn { carga: number; repeticiones: number; rpe: number }
export interface Entrada {
  repMin: number;
  repMax: number;
  incremento: number;
  series: SerieIn[];
  molestiaReciente?: boolean;
}
export type Accion = 'subir' | 'mantener' | 'reducir';
export interface Resultado { accion: Accion; carga: number; repsObjetivo: number; explicacion: string; aviso?: string }

const fmt = (n: number) => String(Math.round(n * 100) / 100).replace('.', ',');

export function sugerirCarga(e: Entrada): Resultado {
  const { repMin, repMax, incremento, series } = e;
  if (!series.length) {
    return { accion: 'mantener', carga: 0, repsObjetivo: repMin, explicacion: 'Primera sesión sin historial: mantené la carga objetivo del plan.' };
  }
  const carga = Math.max(...series.map((s) => s.carga));
  const rpe = Math.max(...series.map((s) => s.rpe));
  const bajo = series.filter((s) => s.repeticiones < repMin).length;
  const tope = series.every((s) => s.repeticiones >= repMax);
  const igual = series.every((s) => s.repeticiones === series[0].repeticiones && s.carga === series[0].carga && s.rpe === series[0].rpe);
  const hecho = igual
    ? `Hiciste ${series.length} × ${series[0].repeticiones} con ${fmt(carga)} kg y RPE ${series[0].rpe}`
    : `Hiciste ${series.map((s) => `${s.repeticiones} × ${fmt(s.carga)} kg (RPE ${s.rpe})`).join(', ')}`;

  let r: Resultado;
  if (bajo >= 2) {
    r = { accion: 'reducir', carga: Math.max(incremento, carga - incremento), repsObjetivo: repMin,
      explicacion: `${hecho}. ${bajo} series quedaron por debajo del piso de ${repMin} repeticiones, por eso bajamos ${fmt(incremento)} kg.` };
  } else if (rpe >= 10 || bajo === 1) {
    r = { accion: 'mantener', carga, repsObjetivo: repMin,
      explicacion: `${hecho}. ${bajo ? `Una serie no llegó al piso de ${repMin} repeticiones` : 'Reportaste RPE 10, al límite'}, por eso mantenemos ${fmt(carga)} kg.` };
  } else if (tope && rpe <= 8) {
    r = { accion: 'subir', carga: carga + incremento, repsObjetivo: repMin,
      explicacion: `${hecho}, por eso proponemos ${fmt(carga + incremento)} kg y volver a ${repMin} repeticiones.` };
  } else if (tope) {
    r = { accion: 'mantener', carga, repsObjetivo: repMax,
      explicacion: `${hecho}. Llegaste al tope pero con RPE ${rpe}: todavía no hay margen para subir, mantenemos ${fmt(carga)} kg.` };
  } else {
    const mejor = Math.max(...series.map((s) => s.repeticiones));
    r = { accion: 'mantener', carga, repsObjetivo: Math.min(repMax, mejor + 1),
      explicacion: `${hecho}. Estás dentro del rango ${repMin}–${repMax}: mantenemos ${fmt(carga)} kg y apuntamos a una repetición más.` };
  }

  if (e.molestiaReciente) {
    const aviso = 'Hay una molestia reciente en este ejercicio: consultá con tu entrenador.';
    if (r.accion === 'subir') {
      r = { accion: 'mantener', carga, repsObjetivo: repMax, aviso,
        explicacion: `${hecho}. No subimos la carga porque hay una molestia reportada en este ejercicio.` };
    } else {
      r.aviso = aviso;
    }
  }
  return r;
}
