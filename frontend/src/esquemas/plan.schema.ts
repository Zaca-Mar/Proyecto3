import { z } from 'zod';

const ejercicioDraftSchema = z.object({
  ejercicioId: z.number().int(),
  nombre: z.string(),
  bloque: z.enum(['movilidad', 'zona_media', 'musculacion']),
  series: z.number(),
  repMin: z.number(),
  repMax: z.number(),
  cargaObjetivo: z.number(),
  descanso: z.number(),
});

export const planDraftSchema = z
  .object({
    nombre: z.string().trim().min(1, 'Poné un nombre al plan.'),
    dias: z
      .array(
        z.object({
          nombre: z.string().trim().min(1, 'Todos los días necesitan un nombre.'),
          ejercicios: z
            .array(ejercicioDraftSchema)
            .min(1, 'Cada día del plan necesita al menos un ejercicio.'),
        }),
      )
      .min(1, 'El plan necesita al menos un día.'),
  })
  .superRefine((plan, ctx) => {
    plan.dias.forEach((dia, indiceDia) => {
      dia.ejercicios.forEach((ejercicio, indiceEjercicio) => {
        const invalido =
          ejercicio.series < 1 ||
          ejercicio.repMin < 1 ||
          ejercicio.repMax < 1 ||
          ejercicio.repMax < ejercicio.repMin ||
          ejercicio.cargaObjetivo < 0 ||
          ejercicio.descanso < 0;
        if (invalido) {
          ctx.addIssue({
            code: 'custom',
            path: ['dias', indiceDia, 'ejercicios', indiceEjercicio],
            message: `Revisá los valores de “${ejercicio.nombre}” en ${dia.nombre}.`,
          });
        }
      });
    });
  });

export type PlanDraft = z.infer<typeof planDraftSchema>;
