import { z } from 'zod';
import { ESTADOS_CUENTA_VALUES } from '../constants/roles.js';
import { USUARIOS_MESSAGES } from '../constants/usuarios.messages.js';
import { rolUsuarioSchema } from './user.schema.js';

export const estadoCuentaSchema = z.enum(ESTADOS_CUENTA_VALUES);

const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)/;

export const crearUsuarioComercianteSchema = z.object({
  nombre: z
    .string({ required_error: USUARIOS_MESSAGES.VALIDACION.NOMBRE_REQUERIDO })
    .trim()
    .min(2, USUARIOS_MESSAGES.VALIDACION.NOMBRE_MIN)
    .max(80, USUARIOS_MESSAGES.VALIDACION.NOMBRE_MAX),
  email: z
    .string({ required_error: USUARIOS_MESSAGES.VALIDACION.EMAIL_REQUERIDO })
    .trim()
    .toLowerCase()
    .email(USUARIOS_MESSAGES.VALIDACION.EMAIL_INVALIDO),
  password: z
    .string({ required_error: USUARIOS_MESSAGES.VALIDACION.PASSWORD_REQUERIDO })
    .min(8, USUARIOS_MESSAGES.VALIDACION.PASSWORD_MIN)
    .regex(
      PASSWORD_COMPLEXITY_REGEX,
      USUARIOS_MESSAGES.VALIDACION.PASSWORD_COMPLEJIDAD
    ),
});

export const CrearUsuarioComercianteSchema = crearUsuarioComercianteSchema;

export const usuarioPublicoSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(2).max(80),
  apellido: z.string().max(80).nullable().optional(),
  email: z.string().email(),
  telefono: z.string().max(30).nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  rol: rolUsuarioSchema,
  estado: estadoCuentaSchema,
  puedeProbarPremium: z.boolean(),
  creadoEn: z.union([z.date(), z.string()]),
  actualizadoEn: z.union([z.date(), z.string()]),
});

export const UsuarioPublicoSchema = usuarioPublicoSchema;

export type CrearUsuarioComercianteInput = z.infer<
  typeof crearUsuarioComercianteSchema
>;
export type UsuarioPublicoDto = z.infer<typeof usuarioPublicoSchema>;
