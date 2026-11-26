import { z } from 'zod';
import {
  ALCANCES_ENVIO_VALUES,
  CODIGOS_PLAN_VALUES,
  ESTADOS_NEGOCIO_VALUES,
  ESTADOS_VERIFICACION_VALUES,
  MODALIDADES_ATENCION_VALUES,
  TIPOS_PERFIL_COMERCIAL_VALUES,
  type TipoPerfilComercial,
} from '../constants/domain.js';
import { NEGOCIOS_MESSAGES } from '../constants/negocios.messages.js';

// =============================================================================
// REGLAS Y REGEX COMUNES
// =============================================================================

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const PHONE_REGEX = /^\+?[0-9\s\-()]{8,30}$/;
const INSTAGRAM_REGEX =
  /^(?:@?[a-zA-Z0-9._]{1,30}|https?:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9._]{1,30}\/?(?:\?.*)?)$/;

const isAssetUrlOrPath = (val: string): boolean => {
  if (val.startsWith('/')) {
    return val.length > 1 && !val.includes('..');
  }
  try {
    const parsed = new URL(val);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const assetUrlOrPathSchema = (message: string) =>
  z.string().trim().refine(isAssetUrlOrPath, { message });

export const tipoPerfilComercialSchema = z.preprocess(
  (val) => (typeof val === 'string' ? val.trim().toLowerCase() : val),
  z.enum(TIPOS_PERFIL_COMERCIAL_VALUES, {
    required_error: NEGOCIOS_MESSAGES.VALIDACION.TIPO_REQUERIDO,
    invalid_type_error: NEGOCIOS_MESSAGES.VALIDACION.TIPO_INVALIDO,
  }),
);

export const tipoNegocioHu03Schema = z.preprocess(
  (val) => (typeof val === 'string' ? val.trim().toUpperCase() : val),
  z.enum(['COMERCIO', 'OFICIO', 'PROFESIONAL', 'EMPRENDIMIENTO'], {
    required_error: NEGOCIOS_MESSAGES.VALIDACION.TIPO_REQUERIDO,
    invalid_type_error: NEGOCIOS_MESSAGES.VALIDACION.TIPO_INVALIDO,
  }),
);

export const modalidadAtencionSchema = z.enum(MODALIDADES_ATENCION_VALUES);
export const alcanceEnvioSchema = z.enum(ALCANCES_ENVIO_VALUES);
export const estadoNegocioSchema = z.enum(ESTADOS_NEGOCIO_VALUES);
export const estadoVerificacionSchema = z.enum(ESTADOS_VERIFICACION_VALUES);
export const codigoPlanSchema = z.enum(CODIGOS_PLAN_VALUES);
export const diaSemanaSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

// =============================================================================
// HORARIOS DE ATENCIÓN (CON SOPORTE DE CORTE DE SIESTA)
// =============================================================================

export const baseHorarioItemSchema = z.object({
  diaSemana: diaSemanaSchema,
  cerrado: z.boolean().default(false),
  horarioCorrido: z.boolean().default(false),
  aperturaManana: z
    .string()
    .regex(TIME_REGEX, 'Formato de hora inválido (HH:mm)')
    .optional()
    .nullable(),
  cierreManana: z
    .string()
    .regex(TIME_REGEX, 'Formato de hora inválido (HH:mm)')
    .optional()
    .nullable(),
  aperturaTarde: z
    .string()
    .regex(TIME_REGEX, 'Formato de hora inválido (HH:mm)')
    .optional()
    .nullable(),
  cierreTarde: z
    .string()
    .regex(TIME_REGEX, 'Formato de hora inválido (HH:mm)')
    .optional()
    .nullable(),
  notaEspecial: z.string().trim().max(120, 'Máximo 120 caracteres').optional().nullable(),
  ubicacionId: z.string().uuid('ID de sucursal inválido').optional().nullable(),
});

export const horarioItemSchema = baseHorarioItemSchema.superRefine((data, ctx) => {
  if (data.cerrado) {
    return;
  }

  if (data.horarioCorrido) {
    if (!data.aperturaManana || !data.cierreManana) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'En horario corrido debés indicar la hora de apertura y cierre',
        path: ['aperturaManana'],
      });
      return;
    }
    if (data.aperturaManana >= data.cierreManana) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La hora de cierre debe ser posterior a la de apertura',
        path: ['cierreManana'],
      });
    }
    return;
  }

  const tieneManana = Boolean(data.aperturaManana && data.cierreManana);
  const tieneTarde = Boolean(data.aperturaTarde && data.cierreTarde);

  if (!tieneManana && !tieneTarde) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Debés cargar al menos un turno (mañana o tarde) o marcar como cerrado',
      path: ['aperturaManana'],
    });
    return;
  }

  if (Boolean(data.aperturaManana) !== Boolean(data.cierreManana)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Para el turno mañana debés ingresar apertura y cierre',
      path: [data.aperturaManana ? 'cierreManana' : 'aperturaManana'],
    });
  } else if (data.aperturaManana && data.cierreManana && data.aperturaManana >= data.cierreManana) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El cierre de mañana debe ser posterior a la apertura',
      path: ['cierreManana'],
    });
  }

  if (Boolean(data.aperturaTarde) !== Boolean(data.cierreTarde)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Para el turno tarde debés ingresar apertura y cierre',
      path: [data.aperturaTarde ? 'cierreTarde' : 'aperturaTarde'],
    });
  } else if (data.aperturaTarde && data.cierreTarde && data.aperturaTarde >= data.cierreTarde) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El cierre de tarde debe ser posterior a la apertura',
      path: ['cierreTarde'],
    });
  }

  if (
    tieneManana &&
    tieneTarde &&
    data.cierreManana &&
    data.aperturaTarde &&
    data.aperturaTarde < data.cierreManana
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El turno tarde debe comenzar luego del cierre de la mañana (corte de siesta)',
      path: ['aperturaTarde'],
    });
  }
});

export type BaseHorarioItemInput = z.infer<typeof baseHorarioItemSchema>;
export type HorarioItemInput = z.infer<typeof horarioItemSchema>;

export const configurarHorariosSemanaSchema = z.object({
  ubicacionId: z.string().uuid('ID de sucursal inválido').optional().nullable(),
  horarios: z
    .array(horarioItemSchema)
    .min(1, 'Debés enviar al menos un horario')
    .max(7, 'Máximo 7 días por semana'),
});

export type ConfigurarHorariosSemanaInput = z.infer<typeof configurarHorariosSemanaSchema>;

// =============================================================================
// SUCURSALES Y UBICACIONES (MULTI-SUCURSAL Y PRIVACIDAD)
// =============================================================================

export const createSucursalSchema = z.object({
  negocioId: z.string().uuid('ID de negocio inválido').optional(),
  nombreSucursal: z
    .string()
    .trim()
    .min(2, 'El nombre de sucursal debe tener al menos 2 caracteres')
    .max(80, 'No puede superar 80 caracteres')
    .default('Casa Central'),
  esPrincipal: z.boolean().default(false),
  direccionEscrita: z
    .string({ required_error: NEGOCIOS_MESSAGES.VALIDACION.DIRECCION_REQUERIDA })
    .trim()
    .min(5, NEGOCIOS_MESSAGES.VALIDACION.DIRECCION_MIN)
    .max(200, NEGOCIOS_MESSAGES.VALIDACION.DIRECCION_MAX),
  barrio: z.string().trim().max(80, 'Máximo 80 caracteres').optional().nullable(),
  referenciaVisual: z.string().trim().max(200, 'Máximo 200 caracteres').optional().nullable(),
  fotoFachadaUrl: assetUrlOrPathSchema('URL de fachada inválida').optional().nullable(),
  whatsappSucursal: z
    .string()
    .trim()
    .regex(PHONE_REGEX, 'Número de WhatsApp inválido')
    .max(30)
    .optional()
    .nullable(),
  telefonoSucursal: z
    .string()
    .trim()
    .regex(PHONE_REGEX, 'Teléfono inválido')
    .max(30)
    .optional()
    .nullable(),
  latitud: z
    .number()
    .min(-90, 'Latitud inválida')
    .max(90, 'Latitud inválida')
    .optional()
    .nullable(),
  longitud: z
    .number()
    .min(-180, 'Longitud inválida')
    .max(180, 'Longitud inválida')
    .optional()
    .nullable(),
  pinColorHex: z
    .string()
    .regex(HEX_COLOR_REGEX, 'Color hexadecimal inválido (ej: #EF4444)')
    .default('#EF4444'),
  mostrarDireccionExacta: z.boolean().default(true),
});

export type CreateSucursalInput = z.infer<typeof createSucursalSchema>;

export const updateSucursalSchema = createSucursalSchema
  .omit({ negocioId: true, esPrincipal: true })
  .partial();

export type UpdateSucursalInput = z.infer<typeof updateSucursalSchema>;

// =============================================================================
// NEGOCIO / PERFIL COMERCIAL (ADAPTADO A COMERCIO, OFICIO, PROFESIONAL, ETC)
// =============================================================================

export const nombreNegocioFieldSchema = z
  .string({ required_error: NEGOCIOS_MESSAGES.VALIDACION.NOMBRE_REQUERIDO })
  .trim()
  .min(3, NEGOCIOS_MESSAGES.VALIDACION.NOMBRE_MIN)
  .max(100, NEGOCIOS_MESSAGES.VALIDACION.NOMBRE_MAX);

export const telefonoNegocioFieldSchema = z
  .string({ required_error: NEGOCIOS_MESSAGES.VALIDACION.TELEFONO_REQUERIDO })
  .trim()
  .regex(PHONE_REGEX, NEGOCIOS_MESSAGES.VALIDACION.TELEFONO_INVALIDO)
  .max(30);

export const direccionNegocioFieldSchema = z
  .string({ required_error: NEGOCIOS_MESSAGES.VALIDACION.DIRECCION_REQUERIDA })
  .trim()
  .min(5, NEGOCIOS_MESSAGES.VALIDACION.DIRECCION_MIN)
  .max(200, NEGOCIOS_MESSAGES.VALIDACION.DIRECCION_MAX);

export const instagramNegocioFieldSchema = z
  .string()
  .trim()
  .regex(INSTAGRAM_REGEX, NEGOCIOS_MESSAGES.VALIDACION.INSTAGRAM_INVALIDO)
  .max(150)
  .optional()
  .nullable();

export const baseNegocioSchema = z.object({
  tipoPerfil: tipoPerfilComercialSchema,
  rubroPrincipalId: z.string().uuid(NEGOCIOS_MESSAGES.VALIDACION.RUBRO_INVALIDO),
  nombreComercial: nombreNegocioFieldSchema,
  eslogan: z.string().trim().max(160, 'Máximo 160 caracteres').optional().nullable(),
  matriculaProfesional: z.string().trim().max(60, 'Máximo 60 caracteres').optional().nullable(),
  descripcion: z
    .string()
    .trim()
    .max(2000, NEGOCIOS_MESSAGES.VALIDACION.DESCRIPCION_MAX)
    .optional()
    .nullable(),
  logoUrl: assetUrlOrPathSchema(NEGOCIOS_MESSAGES.VALIDACION.LOGO_URL_INVALIDA)
    .optional()
    .nullable(),
  bannerUrl: assetUrlOrPathSchema(NEGOCIOS_MESSAGES.VALIDACION.BANNER_URL_INVALIDA)
    .optional()
    .nullable(),
  whatsappPrincipal: telefonoNegocioFieldSchema,
  whatsappMensajeDefault: z
    .string()
    .trim()
    .max(250, 'Máximo 250 caracteres')
    .default('Hola, te vi en Mi Alberdi y quería hacerte una consulta.')
    .optional()
    .nullable(),
  telefonoLinea: z
    .string()
    .trim()
    .regex(PHONE_REGEX, 'Teléfono inválido')
    .max(30)
    .optional()
    .nullable(),
  emailContacto: z
    .string()
    .trim()
    .email('Email de contacto inválido')
    .max(255)
    .optional()
    .nullable(),
  instagramHandle: instagramNegocioFieldSchema,
  facebookUrl: z.string().trim().max(255).optional().nullable(),
  tiktokHandle: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9._]{1,30}$/, 'Usuario de TikTok inválido')
    .max(80)
    .optional()
    .nullable(),
  sitioWebUrl: z.string().trim().url('URL de sitio web inválida').optional().nullable(),
  direccionEscrita: direccionNegocioFieldSchema.optional(),
  modalidadPrincipal: modalidadAtencionSchema.default('horarios_fijos'),
  atiendeADomicilio: z.boolean().default(false),
  haceEnvios: z.boolean().default(false),
  alcanceEnvios: alcanceEnvioSchema.default('sin_envio'),
  aceptaCuotas: z.boolean().default(false),
  politicaCambios: z.string().trim().max(1000, 'Máximo 1000 caracteres').optional().nullable(),
  metodosPagoIds: z.array(z.string().uuid('ID de método de pago inválido')).optional(),
});

export const createNegocioSchema = baseNegocioSchema.superRefine((data, ctx) => {
  if (data.haceEnvios && data.alcanceEnvios === 'sin_envio') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: NEGOCIOS_MESSAGES.VALIDACION.ALCANCE_ENVIO_REQUERIDO,
      path: ['alcanceEnvios'],
    });
  }
});

export type BaseNegocioInput = z.infer<typeof baseNegocioSchema>;
export type CreateNegocioInput = z.infer<typeof createNegocioSchema>;

export const updateNegocioSchema = baseNegocioSchema.partial().extend({
  estado: estadoNegocioSchema.optional(),
});

export type UpdateNegocioInput = z.infer<typeof updateNegocioSchema>;

// =============================================================================
// CONTRATOS HU-03 (SUB-BE-03.1): CrearNegocioSchema, ActualizarNegocioSchema y NegocioResponseDto
// =============================================================================

const normalizeNegocioPayload = (raw: unknown): unknown => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
  const obj = raw as Record<string, unknown>;
  const normalized: Record<string, unknown> = { ...obj };

  if (normalized.nombre === undefined && normalized.nombreComercial !== undefined) {
    normalized.nombre = normalized.nombreComercial;
  }
  if (normalized.nombreComercial === undefined && normalized.nombre !== undefined) {
    normalized.nombreComercial = normalized.nombre;
  }

  if (normalized.tipo === undefined && normalized.tipoPerfil !== undefined) {
    normalized.tipo = normalized.tipoPerfil;
  }
  if (normalized.tipoPerfil === undefined && normalized.tipo !== undefined) {
    normalized.tipoPerfil = normalized.tipo;
  }

  if (normalized.telefono === undefined && normalized.whatsappPrincipal !== undefined) {
    normalized.telefono = normalized.whatsappPrincipal;
  }
  if (normalized.whatsappPrincipal === undefined && normalized.telefono !== undefined) {
    normalized.whatsappPrincipal = normalized.telefono;
  }

  if (normalized.direccion === undefined && normalized.direccionEscrita !== undefined) {
    normalized.direccion = normalized.direccionEscrita;
  }
  if (normalized.direccionEscrita === undefined && normalized.direccion !== undefined) {
    normalized.direccionEscrita = normalized.direccion;
  }

  if (normalized.instagram === undefined && normalized.instagramHandle !== undefined) {
    normalized.instagram = normalized.instagramHandle;
  }
  if (normalized.instagramHandle === undefined && normalized.instagram !== undefined) {
    normalized.instagramHandle = normalized.instagram;
  }

  return normalized;
};

const crearNegocioObjectSchema = z
  .object({
    nombre: nombreNegocioFieldSchema,
    nombreComercial: nombreNegocioFieldSchema.optional(),
    tipo: tipoNegocioHu03Schema,
    tipoPerfil: tipoPerfilComercialSchema.optional(),
    telefono: telefonoNegocioFieldSchema,
    whatsappPrincipal: telefonoNegocioFieldSchema.optional(),
    direccion: direccionNegocioFieldSchema,
    direccionEscrita: direccionNegocioFieldSchema.optional(),
    descripcion: z
      .string()
      .trim()
      .max(2000, NEGOCIOS_MESSAGES.VALIDACION.DESCRIPCION_MAX)
      .optional()
      .nullable(),
    instagram: instagramNegocioFieldSchema,
    instagramHandle: instagramNegocioFieldSchema,
    logoUrl: assetUrlOrPathSchema(NEGOCIOS_MESSAGES.VALIDACION.LOGO_URL_INVALIDA)
      .optional()
      .nullable(),
    bannerUrl: assetUrlOrPathSchema(NEGOCIOS_MESSAGES.VALIDACION.BANNER_URL_INVALIDA)
      .optional()
      .nullable(),
    rubroPrincipalId: z.string().uuid(NEGOCIOS_MESSAGES.VALIDACION.RUBRO_INVALIDO).optional(),
    eslogan: z.string().trim().max(160, 'Máximo 160 caracteres').optional().nullable(),
    matriculaProfesional: z.string().trim().max(60, 'Máximo 60 caracteres').optional().nullable(),
    modalidadPrincipal: modalidadAtencionSchema.default('horarios_fijos'),
    atiendeADomicilio: z.boolean().default(false),
    haceEnvios: z.boolean().default(false),
    alcanceEnvios: alcanceEnvioSchema.default('sin_envio'),
    aceptaCuotas: z.boolean().default(false),
    politicaCambios: z.string().trim().max(1000, 'Máximo 1000 caracteres').optional().nullable(),
    metodosPagoIds: z.array(z.string().uuid('ID de método de pago inválido')).optional(),
  })
  .transform((data) => {
    const tipoPerfil = (data.tipoPerfil ?? data.tipo.toLowerCase()) as TipoPerfilComercial;
    const instagram = data.instagram ?? data.instagramHandle ?? null;
    return {
      ...data,
      nombre: data.nombre,
      nombreComercial: data.nombreComercial ?? data.nombre,
      tipo: data.tipo,
      tipoPerfil,
      telefono: data.telefono,
      whatsappPrincipal: data.whatsappPrincipal ?? data.telefono,
      direccion: data.direccion,
      direccionEscrita: data.direccionEscrita ?? data.direccion,
      instagram,
      instagramHandle: instagram,
    };
  });

export const crearNegocioSchema = z.preprocess(
  normalizeNegocioPayload,
  crearNegocioObjectSchema,
);

export const CrearNegocioSchema = crearNegocioSchema;

const actualizarNegocioObjectSchema = z
  .object({
    nombre: nombreNegocioFieldSchema.optional(),
    nombreComercial: nombreNegocioFieldSchema.optional(),
    tipo: tipoNegocioHu03Schema.optional(),
    tipoPerfil: tipoPerfilComercialSchema.optional(),
    telefono: telefonoNegocioFieldSchema.optional(),
    whatsappPrincipal: telefonoNegocioFieldSchema.optional(),
    direccion: direccionNegocioFieldSchema.optional(),
    direccionEscrita: direccionNegocioFieldSchema.optional(),
    descripcion: z
      .string()
      .trim()
      .max(2000, NEGOCIOS_MESSAGES.VALIDACION.DESCRIPCION_MAX)
      .optional()
      .nullable(),
    instagram: instagramNegocioFieldSchema,
    instagramHandle: instagramNegocioFieldSchema,
    logoUrl: assetUrlOrPathSchema(NEGOCIOS_MESSAGES.VALIDACION.LOGO_URL_INVALIDA)
      .optional()
      .nullable(),
    bannerUrl: assetUrlOrPathSchema(NEGOCIOS_MESSAGES.VALIDACION.BANNER_URL_INVALIDA)
      .optional()
      .nullable(),
    rubroPrincipalId: z.string().uuid(NEGOCIOS_MESSAGES.VALIDACION.RUBRO_INVALIDO).optional(),
    eslogan: z.string().trim().max(160, 'Máximo 160 caracteres').optional().nullable(),
    matriculaProfesional: z.string().trim().max(60, 'Máximo 60 caracteres').optional().nullable(),
    estado: estadoNegocioSchema.optional(),
    modalidadPrincipal: modalidadAtencionSchema.optional(),
    atiendeADomicilio: z.boolean().optional(),
    haceEnvios: z.boolean().optional(),
    alcanceEnvios: alcanceEnvioSchema.optional(),
    aceptaCuotas: z.boolean().optional(),
    politicaCambios: z.string().trim().max(1000, 'Máximo 1000 caracteres').optional().nullable(),
    metodosPagoIds: z.array(z.string().uuid('ID de método de pago inválido')).optional(),
  })
  .transform((data) => {
    const out: Record<string, unknown> = { ...data };
    if (data.nombre !== undefined) {
      out.nombreComercial = data.nombreComercial ?? data.nombre;
    }
    if (data.tipo !== undefined || data.tipoPerfil !== undefined) {
      out.tipoPerfil = (data.tipoPerfil ?? data.tipo?.toLowerCase()) as TipoPerfilComercial;
    }
    if (data.telefono !== undefined) {
      out.whatsappPrincipal = data.whatsappPrincipal ?? data.telefono;
    }
    if (data.direccion !== undefined) {
      out.direccionEscrita = data.direccionEscrita ?? data.direccion;
    }
    if (data.instagram !== undefined || data.instagramHandle !== undefined) {
      const ig = data.instagram !== undefined ? data.instagram : data.instagramHandle;
      out.instagram = ig;
      out.instagramHandle = ig;
    }
    return out as typeof data;
  });

export const actualizarNegocioSchema = z.preprocess(
  normalizeNegocioPayload,
  actualizarNegocioObjectSchema,
);

export const ActualizarNegocioSchema = actualizarNegocioSchema;

export const negocioResponseSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  nombre: z.string(),
  nombreComercial: z.string(),
  tipo: z.enum(['COMERCIO', 'OFICIO', 'PROFESIONAL', 'EMPRENDIMIENTO']),
  tipoPerfil: tipoPerfilComercialSchema,
  telefono: z.string(),
  whatsappPrincipal: z.string(),
  direccion: z.string(),
  direccionEscrita: z.string(),
  descripcion: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  instagramHandle: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  rubroPrincipalId: z.string().uuid().optional(),
  estado: estadoNegocioSchema,
  planActual: codigoPlanSchema.optional(),
  creadoEn: z.union([z.date(), z.string()]),
  actualizadoEn: z.union([z.date(), z.string()]),
});

export const NegocioResponseSchema = negocioResponseSchema;

export type CrearNegocioInput = z.infer<typeof crearNegocioSchema>;
export type ActualizarNegocioInput = z.infer<typeof actualizarNegocioSchema>;
export type NegocioResponseDto = z.infer<typeof negocioResponseSchema>;

// =============================================================================
// WIZARD COMPUESTO DE ONBOARDING
// =============================================================================

export const altaNegocioWizardSchema = z.object({
  negocio: baseNegocioSchema.omit({ metodosPagoIds: true }),
  ubicacionPrincipal: createSucursalSchema.omit({ negocioId: true, esPrincipal: true }),
  horarios: z.array(baseHorarioItemSchema.omit({ ubicacionId: true })).optional(),
  metodosPagoIds: z
    .array(z.string().uuid('ID de método de pago inválido'))
    .min(1, 'Seleccioná al menos un método de pago aceptado')
    .optional(),
});

export type AltaNegocioWizardInput = z.infer<typeof altaNegocioWizardSchema>;

// =============================================================================
// VINCULACIÓN DE MÉTODOS DE PAGO
// =============================================================================

export const vincularMetodosPagoSchema = z.object({
  metodosPago: z
    .array(
      z.object({
        metodoPagoId: z.string().uuid('ID de método de pago inválido'),
        detalle: z.string().trim().max(100).optional().nullable(),
      }),
    )
    .min(1, 'Debés indicar al menos un método de pago'),
});

export type VincularMetodosPagoInput = z.infer<typeof vincularMetodosPagoSchema>;
