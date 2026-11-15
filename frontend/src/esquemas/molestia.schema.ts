import { z } from 'zod';

export const molestiaSchema = z.object({
  zona: z.string().min(1, 'Elegí la zona del cuerpo donde sentiste la molestia.'),
  observacion: z
    .string()
    .trim()
    .min(1, 'Contanos brevemente qué sentiste.')
    .max(140, 'La observación no puede superar los 140 caracteres.'),
});

export type MolestiaFormulario = z.infer<typeof molestiaSchema>;
