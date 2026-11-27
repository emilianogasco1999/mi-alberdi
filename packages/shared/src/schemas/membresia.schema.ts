import { z } from 'zod';
import {
  CODIGOS_PLAN_VALUES,
  ESTADOS_MEMBRESIA_VALUES,
  ESTADOS_PAGO_VALUES,
  PASARELAS_PAGO_VALUES,
} from '../constants/domain.js';

export const solicitarCambioPlanSchema = z.object({
  negocioId: z.string().uuid({ message: 'ID de negocio inválido' }),
  nuevoPlan: z.enum(CODIGOS_PLAN_VALUES, {
    message: 'El plan especificado no es válido (gratis, plata, oro)',
  }),
  autoRenovar: z.boolean().default(false),
  periodoMeses: z.number().int().min(1).max(12).default(1),
});

export type SolicitarCambioPlanInput = z.infer<typeof solicitarCambioPlanSchema>;

export const canjearCodigoPromoSchema = z.object({
  negocioId: z.string().uuid({ message: 'ID de negocio inválido' }),
  codigo: z
    .string({ required_error: 'El código promocional es obligatorio' })
    .trim()
    .min(3, { message: 'El código debe tener al menos 3 caracteres' })
    .max(40, { message: 'El código no puede superar los 40 caracteres' })
    .transform((val) => val.toUpperCase()),
});

export type CanjearCodigoPromoInput = z.infer<typeof canjearCodigoPromoSchema>;

export const registrarPagoTransferenciaSchema = z.object({
  membresiaId: z.string().uuid({ message: 'ID de membresía inválido' }),
  negocioId: z.string().uuid({ message: 'ID de negocio inválido' }),
  montoArs: z
    .number({ required_error: 'El monto en ARS es obligatorio' })
    .positive({ message: 'El monto debe ser mayor a 0' }),
  comprobanteUrl: z
    .string()
    .url({ message: 'La URL del comprobante debe ser válida' })
    .optional()
    .nullable(),
  referenciaExterna: z
    .string()
    .trim()
    .max(120, { message: 'La referencia externa no puede superar 120 caracteres' })
    .optional()
    .nullable(),
});

export type RegistrarPagoTransferenciaInput = z.infer<typeof registrarPagoTransferenciaSchema>;

export const revisarPagoManualSchema = z.object({
  pagoId: z.string().uuid({ message: 'ID de pago inválido' }),
  accion: z.enum(['aprobar', 'rechazar'], {
    message: 'La acción debe ser aprobar o rechazar',
  }),
  motivoRechazo: z
    .string()
    .trim()
    .max(250, { message: 'El motivo de rechazo no puede superar 250 caracteres' })
    .optional(),
});

export type RevisarPagoManualInput = z.infer<typeof revisarPagoManualSchema>;

export const crearCodigoPromocionalSchema = z.object({
  codigo: z
    .string({ required_error: 'El código es obligatorio' })
    .trim()
    .min(3, { message: 'El código debe tener al menos 3 caracteres' })
    .max(40, { message: 'El código no puede superar 40 caracteres' })
    .transform((val) => val.toUpperCase()),
  descripcion: z.string().trim().max(250).optional().nullable(),
  planOtorgado: z.enum(CODIGOS_PLAN_VALUES, {
    message: 'El plan otorgado debe ser válido',
  }),
  diasVigencia: z.number().int().positive().default(30),
  usosMaximos: z.number().int().positive().default(1),
  validoHasta: z.string().datetime({ message: 'Fecha de vigencia inválida' }).optional().nullable(),
});

export type CrearCodigoPromocionalInput = z.infer<typeof crearCodigoPromocionalSchema>;

export const pagosMembresiaQuerySchema = z.object({
  negocioId: z.string().uuid().optional(),
  membresiaId: z.string().uuid().optional(),
  estado: z.enum(ESTADOS_PAGO_VALUES).optional(),
  pasarela: z.enum(PASARELAS_PAGO_VALUES).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type PagosMembresiaQueryInput = z.infer<typeof pagosMembresiaQuerySchema>;

export const membresiasQuerySchema = z.object({
  negocioId: z.string().uuid().optional(),
  estado: z.enum(ESTADOS_MEMBRESIA_VALUES).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type MembresiasQueryInput = z.infer<typeof membresiasQuerySchema>;

export const crearPreferenciaMpSchema = z.object({
  negocioId: z.string().uuid({ message: 'ID de negocio inválido' }),
  planCodigo: z.enum(['plata', 'oro'], {
    message: 'El plan debe ser de suscripción de pago (plata u oro)',
  }),
  periodoMeses: z.number().int().min(1).max(12).default(1),
});

export type CrearPreferenciaMpInput = z.infer<typeof crearPreferenciaMpSchema>;

export const simularWebhookMpSchema = z.object({
  pagoId: z.string().uuid({ message: 'ID de pago inválido' }),
  estado: z.enum(['approved', 'rejected', 'pending']).default('approved'),
});

export type SimularWebhookMpInput = z.infer<typeof simularWebhookMpSchema>;
