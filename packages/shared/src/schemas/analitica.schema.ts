import { z } from 'zod';
import { TIPOS_EVENTO_ANALITICA_VALUES } from '../constants/domain.js';

export const tipoEventoAnaliticaSchema = z.enum(TIPOS_EVENTO_ANALITICA_VALUES, {
  message: 'Tipo de evento de analítica inválido',
});

// =============================================================================
// INGESTA DE EVENTOS
// =============================================================================

export const registrarEventoSchema = z.object({
  negocioId: z.string().uuid('ID de negocio inválido'),
  publicacionId: z.string().uuid('ID de publicación inválido').optional().nullable(),
  ubicacionId: z.string().uuid('ID de ubicación inválido').optional().nullable(),
  reelId: z.string().uuid('ID de reel inválido').optional().nullable(),
  tipoEvento: tipoEventoAnaliticaSchema,
  origen: z
    .string()
    .trim()
    .max(40, 'El origen no puede superar los 40 caracteres')
    .optional()
    .nullable(),
  dispositivoHash: z
    .string()
    .trim()
    .max(128, 'El hash del dispositivo no puede superar 128 caracteres')
    .optional()
    .nullable(),
});

export type RegistrarEventoInput = z.infer<typeof registrarEventoSchema>;

export const registrarEventosBatchSchema = z.object({
  eventos: z
    .array(registrarEventoSchema)
    .min(1, 'Debés enviar al menos un evento')
    .max(50, 'No podés enviar más de 50 eventos en un solo lote'),
});

export type RegistrarEventosBatchInput = z.infer<typeof registrarEventosBatchSchema>;

// =============================================================================
// CONSULTA DE MÉTRICAS (DASHBOARD COMERCIANTE)
// =============================================================================

export const PERIODOS_METRICAS = [
  '7d',
  '30d',
  '90d',
  'mes_actual',
  'anio_actual',
  'historico',
] as const;
export type PeriodoMetricas = (typeof PERIODOS_METRICAS)[number];

export const queryMetricasNegocioSchema = z.object({
  desde: z
    .string()
    .datetime({ message: 'Fecha desde inválida' })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha YYYY-MM-DD requerido'))
    .optional(),
  hasta: z
    .string()
    .datetime({ message: 'Fecha hasta inválida' })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha YYYY-MM-DD requerido'))
    .optional(),
  ubicacionId: z.string().uuid('ID de ubicación inválido').optional().nullable(),
  periodo: z.enum(PERIODOS_METRICAS).default('30d').optional(),
});

export type QueryMetricasNegocioInput = z.infer<typeof queryMetricasNegocioSchema>;
