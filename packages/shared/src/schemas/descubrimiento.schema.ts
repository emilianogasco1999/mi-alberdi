import { z } from 'zod';
import { TIPOS_PERFIL_COMERCIAL_VALUES } from '../constants/domain.js';

export const tipoBusquedaSchema = z.enum(['todos', 'negocios', 'publicaciones']).default('todos');
export type TipoBusqueda = z.infer<typeof tipoBusquedaSchema>;

export const buscarDescubrimientoSchema = z.object({
  q: z.string().trim().max(100).optional(),
  rubroId: z.string().uuid('ID de rubro inválido').optional(),
  rubroSlug: z.string().trim().max(80).optional(),
  categoriaId: z.string().uuid('ID de categoría inválido').optional(),
  categoriaSlug: z.string().trim().max(100).optional(),
  tipoPerfil: z.enum(TIPOS_PERFIL_COMERCIAL_VALUES).optional(),
  atiendeADomicilio: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  haceEnvios: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  abiertoAhora: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  tipo: tipoBusquedaSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type BuscarDescubrimientoInput = z.infer<typeof buscarDescubrimientoSchema>;

