import { Entrada, sugerirCarga } from './engine';

const base = { repMin: 8, repMax: 12, incremento: 2.5 };
const s = (reps: number[], carga = 40, rpe = 7) => reps.map((repeticiones) => ({ carga, repeticiones, rpe }));

describe('motor de doble progresión', () => {
  const casos: [string, Entrada, string, number][] = [
    ['tope con RPE ≤ 8 sube la carga', { ...base, series: s([12, 12, 12]) }, 'subir', 42.5],
    ['dentro del rango mantiene', { ...base, series: s([10, 9, 9], 40, 8) }, 'mantener', 40],
    ['RPE 10 mantiene', { ...base, series: s([10, 10, 10], 40, 10) }, 'mantener', 40],
    ['una serie bajo el piso mantiene', { ...base, series: s([10, 10, 6]) }, 'mantener', 40],
    ['dos series bajo el piso reduce', { ...base, series: s([7, 6, 8]) }, 'reducir', 37.5],
    ['tope con RPE 9 no sube', { ...base, series: s([12, 12, 12], 40, 9) }, 'mantener', 40],
    ['primera sesión sin historial', { ...base, series: [] }, 'mantener', 0],
    ['molestia reciente bloquea la subida', { ...base, series: s([12, 12, 12]), molestiaReciente: true }, 'mantener', 40],
  ];
  it.each(casos)('%s', (_n, entrada, accion, carga) => {
    const r = sugerirCarga(entrada);
    expect(r.accion).toBe(accion);
    expect(r.carga).toBe(carga);
    expect(r.explicacion.length).toBeGreaterThan(10);
  });
  it('la explicación cita los datos (ejemplo del documento)', () => {
    expect(sugerirCarga({ ...base, series: s([12, 12, 12]) }).explicacion).toBe('Hiciste 3 × 12 con 40 kg y RPE 7, por eso proponemos 42,5 kg y volver a 8 repeticiones.');
  });
  it('con molestia agrega aviso', () => {
    expect(sugerirCarga({ ...base, series: s([10, 10, 10], 40, 8), molestiaReciente: true }).aviso).toBeDefined();
  });
});
