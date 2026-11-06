import { z } from 'zod';
import {
  ESTADOS_PUBLICACION_VALUES,
  MODALIDADES_ATENCION_VALUES,
  TIPOS_PUBLICACION_VALUES,
} from '../constants/domain.js';

const PHONE_REGEX = /^\+?[0-9\s\-()]{8,30}$/;

export const tipoPublicacionSchema = z.enum(TIPOS_PUBLICACION_VALUES);
export const estadoPublicacionSchema = z.enum(ESTADOS_PUBLICACION_VALUES);
export const modalidadPublicacionSchema = z.enum(MODALIDADES_ATENCION_VALUES);

// =============================================================================
// IMÁGENES DE PUBLICACIÓN
// =============================================================================

export const imagenPublicacionItemSchema = z.object({
  id: z.string().uuid('ID de imagen inválido').optional(),
  url: z.string().url('URL de imagen inválida'),
  altText: z.string().trim().max(160, 'Máximo 160 caracteres').optional().nullable(),
  esPortada: z.boolean().default(false),
  orden: z.number().int().nonnegative().default(0),
});

export type ImagenPublicacionItemInput = z.infer<typeof imagenPublicacionItemSchema>;

export const reordenarImagenesSchema = z.object({
  imagenes: z
    .array(
      z.object({
        id: z.string().uuid('ID de imagen inválido'),
        orden: z.number().int().nonnegative(),
        esPortada: z.boolean().default(false),
      }),
    )
    .min(1, 'Debés enviar al menos una imagen'),
});

export type ReordenarImagenesInput = z.infer<typeof reordenarImagenesSchema>;

// =============================================================================
// PUBLICACIONES (CREACIÓN Y ACTUALIZACIÓN)
// =============================================================================

export const baseCreatePublicacionSchema = z.object({
  negocioId: z.string().uuid('ID de negocio inválido'),
  categoriaId: z.string().uuid('ID de categoría inválido'),
  tipo: tipoPublicacionSchema,
  titulo: z
    .string({ required_error: 'El título es obligatorio' })
    .trim()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(140, 'No puede superar los 140 caracteres'),
  descripcion: z
    .string({ required_error: 'La descripción es obligatoria' })
    .trim()
    .min(10, 'Describí mejor tu servicio o producto (mínimo 10 caracteres)')
    .max(3000, 'Máximo 3000 caracteres'),
  precioReferenciaArs: z
    .number()
    .nonnegative('El precio no puede ser negativo')
    .optional()
    .nullable(),
  etiquetaPrecio: z.string().trim().max(40, 'Máximo 40 caracteres').optional().nullable(),
  modalidad: modalidadPublicacionSchema.default('horarios_fijos'),
  whatsappEspecifico: z
    .string()
    .trim()
    .regex(PHONE_REGEX, 'Número de WhatsApp inválido')
    .max(30)
    .optional()
    .nullable(),
  mensajeWhatsappCustom: z.string().trim().max(250).optional().nullable(),
  esDestacada: z.boolean().default(false),
  imagenes: z
    .array(imagenPublicacionItemSchema)
    .max(10, 'Máximo 10 imágenes por publicación')
    .optional(),
});

export const createPublicacionSchema = baseCreatePublicacionSchema;

export type CreatePublicacionInput = z.infer<typeof createPublicacionSchema>;

export const updatePublicacionSchema = baseCreatePublicacionSchema
  .omit({ negocioId: true })
  .partial()
  .extend({
    estado: estadoPublicacionSchema.optional(),
  });

export type UpdatePublicacionInput = z.infer<typeof updatePublicacionSchema>;

// =============================================================================
// ESTRELLAS DE VIDRIERA (ROTACIÓN DE DESTACADOS) Y ESTADO
// =============================================================================

export const toggleDestacadaSchema = z.object({
  esDestacada: z.boolean(),
});

export type ToggleDestacadaInput = z.infer<typeof toggleDestacadaSchema>;

export const cambiarEstadoPublicacionSchema = z.object({
  estado: z.enum(['borrador', 'activa', 'pausada']),
});

export type CambiarEstadoPublicacionInput = z.infer<typeof cambiarEstadoPublicacionSchema>;
