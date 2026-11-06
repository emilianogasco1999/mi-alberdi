import { z } from 'zod';

// =============================================================================
// ESQUEMAS: RUBROS / GRUPOS PRINCIPALES
// =============================================================================

export const rubroGrupoSchema = z.object({
  id: z.string().uuid('ID de rubro inválido'),
  nombre: z
    .string({ required_error: 'El nombre del rubro es obligatorio' })
    .trim()
    .min(2, 'Debe tener al menos 2 caracteres')
    .max(80, 'No puede superar los 80 caracteres'),
  slug: z
    .string({ required_error: 'El slug es obligatorio' })
    .trim()
    .min(2)
    .max(80)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'El slug solo puede contener letras minúsculas, números y guiones',
    ),
  icono: z.string({ required_error: 'El icono es obligatorio' }).trim().min(1).max(60),
  colorHex: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color hexadecimal inválido (#RRGGBB)')
    .default('#2563EB'),
  destacadoPortada: z.boolean().default(false),
  orden: z.number().int().min(0).default(0),
  activo: z.boolean().default(true),
});

export const createRubroGrupoSchema = rubroGrupoSchema.omit({
  id: true,
});

export const updateRubroGrupoSchema = createRubroGrupoSchema.partial();

export type RubroGrupo = z.infer<typeof rubroGrupoSchema>;
export type CreateRubroGrupoInput = z.infer<typeof createRubroGrupoSchema>;
export type UpdateRubroGrupoInput = z.infer<typeof updateRubroGrupoSchema>;

// =============================================================================
// ESQUEMAS: CATEGORÍAS Y SUBCATEGORÍAS (JERÁRQUICAS)
// =============================================================================

export const tipoPermitidoSchema = z.enum(['servicio', 'producto']);
export type TipoPermitido = z.infer<typeof tipoPermitidoSchema>;

export const categoriaSchema = z.object({
  id: z.string().uuid('ID de categoría inválido'),
  grupoId: z.string().uuid('ID de rubro/grupo inválido'),
  parentId: z.string().uuid('ID de categoría padre inválido').optional().nullable(),
  nombre: z
    .string({ required_error: 'El nombre de la categoría es obligatorio' })
    .trim()
    .min(2, 'Debe tener al menos 2 caracteres')
    .max(100, 'No puede superar los 100 caracteres'),
  slug: z
    .string({ required_error: 'El slug es obligatorio' })
    .trim()
    .min(2)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'El slug solo puede contener letras minúsculas, números y guiones',
    ),
  tipoPermitido: tipoPermitidoSchema.optional().nullable(),
  icono: z.string().trim().max(60).optional().nullable(),
  colorHex: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color hexadecimal inválido (#RRGGBB)')
    .optional()
    .nullable(),
  orden: z.number().int().min(0).default(0),
  activa: z.boolean().default(true),
});

export const createCategoriaSchema = categoriaSchema.omit({
  id: true,
});

export const updateCategoriaSchema = createCategoriaSchema.partial();

export type Categoria = z.infer<typeof categoriaSchema>;
export type CreateCategoriaInput = z.infer<typeof createCategoriaSchema>;
export type UpdateCategoriaInput = z.infer<typeof updateCategoriaSchema>;

// =============================================================================
// ESQUEMAS: CATÁLOGO DE MÉTODOS DE PAGO
// =============================================================================

export const metodoPagoCatalogoSchema = z.object({
  id: z.string().uuid('ID de método de pago inválido'),
  codigo: z
    .string({ required_error: 'El código identificador es obligatorio' })
    .trim()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9_]+$/, 'El código debe estar en minúsculas y snake_case'),
  nombre: z.string({ required_error: 'El nombre visible es obligatorio' }).trim().min(2).max(60),
  icono: z.string().trim().max(60).optional().nullable(),
  activo: z.boolean().default(true),
});

export const createMetodoPagoCatalogoSchema = metodoPagoCatalogoSchema.omit({
  id: true,
});

export const updateMetodoPagoCatalogoSchema = createMetodoPagoCatalogoSchema.partial();

export type MetodoPagoCatalogo = z.infer<typeof metodoPagoCatalogoSchema>;
export type CreateMetodoPagoCatalogoInput = z.infer<typeof createMetodoPagoCatalogoSchema>;
export type UpdateMetodoPagoCatalogoInput = z.infer<typeof updateMetodoPagoCatalogoSchema>;

// =============================================================================
// ESQUEMAS: CATÁLOGO DE PLANES
// =============================================================================

export const planCatalogoSchema = z.object({
  codigo: z.enum(['gratis', 'plata', 'oro']),
  nombre: z.string().min(1).max(50),
  precioMensualArs: z.number().nonnegative(),
  maxPublicaciones: z.number().int().nonnegative(),
  maxFotosPorPublicacion: z.number().int().nonnegative(),
  cuposDestacados: z.number().int().nonnegative(),
  maxSucursales: z.number().int().nonnegative(),
  maxReelsActivos: z.number().int().nonnegative(),
  prioridadBase: z.number().int(),
  permiteEstadisticas: z.boolean(),
  permitePinDestacado: z.boolean(),
  permiteBanner: z.boolean(),
  permiteAsistenteIa: z.boolean(),
  caracteristicasBase: z.record(z.unknown()),
  activo: z.boolean().default(true),
});

export type PlanCatalogo = z.infer<typeof planCatalogoSchema>;
