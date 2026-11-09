import { z } from 'zod';

export const createOpinionSchema = z.object({
  negocioId: z.string().uuid('ID de negocio inválido'),
  publicacionId: z.string().uuid('ID de publicación inválido').optional().nullable(),
  puntuacion: z
    .number({ required_error: 'La puntuación es obligatoria' })
    .int('La puntuación debe ser un número entero')
    .min(1, 'La puntuación mínima es 1 estrella')
    .max(5, 'La puntuación máxima es 5 estrellas'),
  comentario: z
    .string()
    .trim()
    .max(1000, 'El comentario no puede superar los 1000 caracteres')
    .optional()
    .nullable(),
  fotoEvidenciaUrl: z.string().url('URL de foto inválida').optional().nullable(),
  nombreAutorVisible: z
    .string()
    .trim()
    .max(80, 'El nombre visible no puede superar los 80 caracteres')
    .optional(),
});

export type CreateOpinionInput = z.infer<typeof createOpinionSchema>;

export const responderOpinionSchema = z.object({
  respuestaComerciante: z
    .string({ required_error: 'La respuesta es obligatoria' })
    .trim()
    .min(2, 'La respuesta debe tener al menos 2 caracteres')
    .max(1000, 'La respuesta no puede superar los 1000 caracteres'),
});

export type ResponderOpinionInput = z.infer<typeof responderOpinionSchema>;

export const queryOpinionesNegocioSchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(50).default(10),
  publicacionId: z.string().uuid('ID de publicación inválido').optional(),
  puntuacion: z.coerce.number().int().min(1).max(5).optional(),
  orden: z.enum(['recientes', 'mejores', 'peores']).default('recientes'),
});

export type QueryOpinionesNegocioInput = z.infer<typeof queryOpinionesNegocioSchema>;
