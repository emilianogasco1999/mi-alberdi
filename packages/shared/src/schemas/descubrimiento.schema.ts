import { z } from 'zod';
import { TIPOS_PERFIL_COMERCIAL_VALUES } from '../constants/domain.js';

export const tipoBusquedaSchema = z.enum(['todos', 'negocios', 'publicaciones']).default('todos');
export type TipoBusqueda = z.infer<typeof tipoBusquedaSchema>;

const emptyToUndefined = (val: unknown) => {
  if (val === undefined || val === null || val === '') return undefined;
  return val;
};

const optionalBoolean = z.preprocess((val) => {
  if (val === undefined || val === null || val === '') return undefined;
  if (val === 'true' || val === true || val === '1' || val === 1) return true;
  if (val === 'false' || val === false || val === '0' || val === 0) return false;
  return undefined;
}, z.boolean().optional());

export const buscarDescubrimientoSchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  rubroId: z.preprocess(emptyToUndefined, z.string().uuid('ID de rubro inválido').optional()),
  rubroSlug: z.preprocess(emptyToUndefined, z.string().trim().max(80).optional()),
  categoriaId: z.preprocess(emptyToUndefined, z.string().uuid('ID de categoría inválido').optional()),
  categoriaSlug: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  tipoPerfil: z.preprocess(emptyToUndefined, z.enum(TIPOS_PERFIL_COMERCIAL_VALUES).optional()),
  atiendeADomicilio: optionalBoolean,
  haceEnvios: optionalBoolean,
  abiertoAhora: optionalBoolean,
  tipo: z.preprocess(emptyToUndefined, tipoBusquedaSchema.optional()),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type BuscarDescubrimientoInput = z.infer<typeof buscarDescubrimientoSchema>;
