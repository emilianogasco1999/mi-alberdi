import { z } from 'zod';
import {
  ESTADOS_MODERACION_VALUES,
  ESTADOS_VERIFICACION_VALUES,
} from '../constants/domain.js';

// =============================================================================
// SOLICITUDES DE VERIFICACIÓN
// =============================================================================

export const solicitarVerificacionSchema = z.object({
  negocioId: z.string().uuid('ID de negocio inválido'),
  documentoFrenteUrl: z.string().url('URL de documento inválida').optional().nullable(),
  comprobanteComercioUrl: z.string().url('URL de comprobante de comercio inválida').optional().nullable(),
  notasSolicitante: z.string().trim().max(500, 'Las notas no pueden superar los 500 caracteres').optional().nullable(),
});

export type SolicitarVerificacionInput = z.infer<typeof solicitarVerificacionSchema>;

export const resolverSolicitudVerificacionSchema = z
  .object({
    estado: z.enum(['aprobada', 'rechazada'], {
      message: 'El estado debe ser aprobada o rechazada',
    }),
    motivoRechazo: z
      .string()
      .trim()
      .max(500, 'El motivo de rechazo no puede superar 500 caracteres')
      .optional()
      .nullable(),
    badgeTexto: z
      .string()
      .trim()
      .max(40, 'El texto del badge no puede superar 40 caracteres')
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.estado === 'rechazada') {
        return Boolean(data.motivoRechazo && data.motivoRechazo.trim().length >= 3);
      }
      return true;
    },
    {
      message: 'Debés ingresar un motivo si rechazás la verificación',
      path: ['motivoRechazo'],
    },
  );

export type ResolverSolicitudVerificacionInput = z.infer<
  typeof resolverSolicitudVerificacionSchema
>;

// =============================================================================
// REPORTES DE MODERACIÓN
// =============================================================================

export const crearReporteSchema = z
  .object({
    negocioId: z.string().uuid('ID de negocio inválido').optional().nullable(),
    publicacionId: z.string().uuid('ID de publicación inválido').optional().nullable(),
    opinionId: z.string().uuid('ID de opinión inválido').optional().nullable(),
    motivo: z
      .string({ required_error: 'El motivo del reporte es obligatorio' })
      .trim()
      .min(3, 'El motivo debe tener al menos 3 caracteres')
      .max(80, 'El motivo no puede superar 80 caracteres'),
    detalle: z
      .string()
      .trim()
      .max(1000, 'El detalle no puede superar 1000 caracteres')
      .optional()
      .nullable(),
  })
  .refine(
    (data) => Boolean(data.negocioId || data.publicacionId || data.opinionId),
    {
      message: 'Debés indicar al menos un negocio, publicación u opinión a reportar',
      path: ['negocioId'],
    },
  );

export type CrearReporteInput = z.infer<typeof crearReporteSchema>;

export const ACCIONES_INFRACCION = [
  'ninguna',
  'ocultar_publicacion',
  'ocultar_opinion',
  'pausar_negocio',
] as const;

export type AccionInfraccion = (typeof ACCIONES_INFRACCION)[number];

export const resolverReporteSchema = z.object({
  estado: z.enum(ESTADOS_MODERACION_VALUES, {
    message: 'Estado de moderación inválido',
  }),
  resolucionNota: z
    .string()
    .trim()
    .max(500, 'La nota de resolución no puede superar 500 caracteres')
    .optional()
    .nullable(),
  accionInfraccion: z.enum(ACCIONES_INFRACCION).default('ninguna').optional(),
});

export type ResolverReporteInput = z.infer<typeof resolverReporteSchema>;

// =============================================================================
// FEEDBACK DE LA PLATAFORMA
// =============================================================================

export const crearFeedbackSchema = z.object({
  nombreCompleto: z
    .string()
    .trim()
    .max(120, 'El nombre no puede superar 120 caracteres')
    .optional()
    .nullable(),
  email: z
    .string()
    .trim()
    .email('Email inválido')
    .optional()
    .nullable(),
  mensaje: z
    .string({ required_error: 'El mensaje es obligatorio' })
    .trim()
    .min(5, 'El mensaje debe tener al menos 5 caracteres')
    .max(2000, 'El mensaje no puede superar 2000 caracteres'),
});

export type CrearFeedbackInput = z.infer<typeof crearFeedbackSchema>;

export const marcarFeedbackLeidoSchema = z.object({
  notasAdmin: z
    .string()
    .trim()
    .max(500, 'Las notas de administración no pueden superar 500 caracteres')
    .optional()
    .nullable(),
});

export type MarcarFeedbackLeidoInput = z.infer<typeof marcarFeedbackLeidoSchema>;

// =============================================================================
// CONSULTA / FILTRADO (ADMIN / MODERADOR)
// =============================================================================

export const queryListadosModeracionSchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(50).default(10),
  estado: z.string().optional(),
});

export type QueryListadosModeracionInput = z.infer<
  typeof queryListadosModeracionSchema
>;
