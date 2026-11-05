import { z } from 'zod';
import { ROLES_USUARIO_VALUES } from '../constants/roles.js';

export const rolUsuarioSchema = z.enum(ROLES_USUARIO_VALUES);

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'El correo electrónico es obligatorio' })
    .trim()
    .email('Formato de correo electrónico inválido'),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerUserSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre es obligatorio' })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(80, 'El nombre no puede superar los 80 caracteres'),
  apellido: z
    .string()
    .trim()
    .max(80, 'El apellido no puede superar los 80 caracteres')
    .optional()
    .nullable(),
  email: z
    .string({ required_error: 'El correo electrónico es obligatorio' })
    .trim()
    .email('Formato de correo electrónico inválido'),
  telefono: z
    .string()
    .trim()
    .max(30, 'El teléfono no puede superar los 30 caracteres')
    .optional()
    .nullable(),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

