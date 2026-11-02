/** Fecha de hoy en formato YYYY-MM-DD (hora local). */
export const fechaHoy = () => new Date().toLocaleDateString('sv-SE');

/** Fecha de hace N días en formato YYYY-MM-DD (hora local). */
export const fechaHace = (dias: number) =>
  new Date(Date.now() - dias * 864e5).toLocaleDateString('sv-SE');
