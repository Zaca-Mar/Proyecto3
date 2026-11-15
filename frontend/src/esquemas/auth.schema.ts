import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Completá el email y la contraseña.'),
  password: z.string().min(1, 'Completá el email y la contraseña.'),
});

export const registroSchema = loginSchema
  .extend({
    nombre: z.string().trim().min(1, 'Completá todos los datos personales obligatorios.'),
    apellido: z.string().trim().min(1, 'Completá todos los datos personales obligatorios.'),
    dni: z
      .string()
      .trim()
      .min(1, 'Completá todos los datos personales obligatorios.')
      .regex(/^\d{7,9}$/, 'El DNI debe tener entre 7 y 9 números.'),
    telefono: z.string().trim().min(1, 'Completá todos los datos personales obligatorios.'),
    repetir: z.string(),
  })
  .refine((datos) => datos.password === datos.repetir, {
    message: 'Las contraseñas no coinciden.',
    path: ['repetir'],
  });

export type LoginDatos = z.infer<typeof loginSchema>;
export type RegistroFormulario = z.infer<typeof registroSchema>;
