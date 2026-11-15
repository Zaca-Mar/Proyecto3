import { z } from 'zod';

const esUrl = (valor: string) => {
  try {
    new URL(valor);
    return true;
  } catch {
    return false;
  }
};

export const crearEjercicioSchema = z.object({
  nombre: z.string().trim().min(1, 'Nombre y grupo muscular son obligatorios.'),
  grupoMuscular: z.string().trim().min(1, 'Nombre y grupo muscular son obligatorios.'),
  videoUrl: z
    .string()
    .trim()
    .refine((valor) => !valor || esUrl(valor), 'El link del video debe ser una URL válida.'),
  zonas: z.string(),
});

export const crearEntrenadorSchema = z.object({
  nombre: z.string().trim().min(1, 'Completá todos los campos para dar de alta al entrenador.'),
  apellido: z.string().trim().min(1, 'Completá todos los campos para dar de alta al entrenador.'),
  email: z.string().trim().min(1, 'Completá todos los campos para dar de alta al entrenador.'),
  dni: z
    .string()
    .trim()
    .min(1, 'Completá todos los campos para dar de alta al entrenador.')
    .regex(/^\d{7,9}$/, 'El DNI debe tener entre 7 y 9 números.'),
  telefono: z.string().trim().min(1, 'Completá todos los campos para dar de alta al entrenador.'),
  password: z.string().min(1, 'Completá todos los campos para dar de alta al entrenador.'),
});

export type CrearEjercicioFormulario = z.infer<typeof crearEjercicioSchema>;
export type CrearEntrenadorFormulario = z.infer<typeof crearEntrenadorSchema>;
