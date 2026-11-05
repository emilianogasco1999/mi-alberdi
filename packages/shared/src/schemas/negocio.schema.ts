import { z } from 'zod';
import {
  ALCANCES_ENVIO_VALUES,
  DIAS_SEMANA_VALUES,
  ESTADOS_NEGOCIO_VALUES,
  ESTADOS_VERIFICACION_VALUES,
  MODALIDADES_ATENCION_VALUES,
  TIPOS_PERFIL_COMERCIAL_VALUES,
  TIPOS_PUBLICACION_VALUES,
} from '../constants/domain.js';

// =============================================================================
// REGLAS Y REGEX COMUNES
// =============================================================================

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const PHONE_REGEX = /^\+?[0-9\s\-()]{8,30}$/;

export const tipoPerfilComercialSchema = z.enum(TIPOS_PERFIL_COMERCIAL_VALUES);
export const modalidadAtencionSchema = z.enum(MODALIDADES_ATENCION_VALUES);
export const alcanceEnvioSchema = z.enum(ALCANCES_ENVIO_VALUES);
export const tipoPublicacionSchema = z.enum(TIPOS_PUBLICACION_VALUES);
export const estadoNegocioSchema = z.enum(ESTADOS_NEGOCIO_VALUES);
export const estadoVerificacionSchema = z.enum(ESTADOS_VERIFICACION_VALUES);
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
    .string({ required_error: 'La dirección es obligatoria' })
    .trim()
    .min(3, 'Ingresá una dirección válida')
    .max(200, 'No puede superar 200 caracteres'),
  barrio: z.string().trim().max(80, 'Máximo 80 caracteres').optional().nullable(),
  referenciaVisual: z
    .string()
    .trim()
    .max(200, 'Máximo 200 caracteres')
    .optional()
    .nullable(),
  fotoFachadaUrl: z.string().url('URL de fachada inválida').optional().nullable(),
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

export const baseNegocioSchema = z.object({
  tipoPerfil: tipoPerfilComercialSchema,
  rubroPrincipalId: z.string().uuid('ID de rubro principal inválido'),
  nombreComercial: z
    .string({ required_error: 'El nombre comercial o del oficio es obligatorio' })
    .trim()
    .min(2, 'Debe tener al menos 2 caracteres')
    .max(120, 'No puede superar los 120 caracteres'),
  eslogan: z.string().trim().max(160, 'Máximo 160 caracteres').optional().nullable(),
  matriculaProfesional: z
    .string()
    .trim()
    .max(60, 'Máximo 60 caracteres')
    .optional()
    .nullable(),
  descripcion: z
    .string()
    .trim()
    .max(2000, 'La descripción no puede superar los 2000 caracteres')
    .optional()
    .nullable(),
  logoUrl: z.string().url('URL de logo inválida').optional().nullable(),
  bannerUrl: z.string().url('URL de banner inválida').optional().nullable(),
  whatsappPrincipal: z
    .string({ required_error: 'El número de WhatsApp es obligatorio para recibir consultas' })
    .trim()
    .regex(PHONE_REGEX, 'Ingresá un número de WhatsApp válido (ej: +54 9 3865 123456)')
    .max(30),
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
  instagramHandle: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9._]{1,30}$/, 'Usuario de Instagram inválido')
    .max(80)
    .optional()
    .nullable(),
  facebookUrl: z.string().trim().max(255).optional().nullable(),
  tiktokHandle: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9._]{1,30}$/, 'Usuario de TikTok inválido')
    .max(80)
    .optional()
    .nullable(),
  sitioWebUrl: z.string().trim().url('URL de sitio web inválida').optional().nullable(),
  modalidadPrincipal: modalidadAtencionSchema.default('horarios_fijos'),
  atiendeADomicilio: z.boolean().default(false),
  haceEnvios: z.boolean().default(false),
  alcanceEnvios: alcanceEnvioSchema.default('sin_envio'),
  aceptaCuotas: z.boolean().default(false),
  politicaCambios: z
    .string()
    .trim()
    .max(1000, 'Máximo 1000 caracteres')
    .optional()
    .nullable(),
  metodosPagoIds: z.array(z.string().uuid('ID de método de pago inválido')).optional(),
});

export const createNegocioSchema = baseNegocioSchema.superRefine((data, ctx) => {
  if (data.haceEnvios && data.alcanceEnvios === 'sin_envio') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Si realizás envíos, debés seleccionar el alcance (ej: Solo Alberdi)',
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
      })
    )
    .min(1, 'Debés indicar al menos un método de pago'),
});

export type VincularMetodosPagoInput = z.infer<typeof vincularMetodosPagoSchema>;

// =============================================================================
// PUBLICACIONES (CATÁLOGO Y DESTACADOS)
// =============================================================================

export const createPublicacionSchema = z.object({
  negocioId: z.string().uuid('ID de negocio inválido'),
  categoriaId: z.string().uuid('ID de categoría inválido'),
  tipo: tipoPublicacionSchema,
  titulo: z
    .string({ required_error: 'El título de la publicación es obligatorio' })
    .trim()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(140, 'No puede superar los 140 caracteres'),
  descripcion: z
    .string({ required_error: 'La descripción es obligatoria' })
    .trim()
    .min(10, 'Describí mejor tu servicio o producto (mínimo 10 caracteres)')
    .max(3000, 'Máximo 3000 caracteres'),
  precioReferenciaArs: z.number().nonnegative('El precio no puede ser negativo').optional().nullable(),
  etiquetaPrecio: z.string().trim().max(40, 'Máximo 40 caracteres').optional().nullable(),
  modalidad: modalidadAtencionSchema.default('horarios_fijos'),
  whatsappEspecifico: z
    .string()
    .trim()
    .regex(PHONE_REGEX, 'Número de WhatsApp inválido')
    .max(30)
    .optional()
    .nullable(),
  mensajeWhatsappCustom: z.string().trim().max(250).optional().nullable(),
  esDestacada: z.boolean().default(false),
});

export type CreatePublicacionInput = z.infer<typeof createPublicacionSchema>;

export const updatePublicacionSchema = createPublicacionSchema
  .omit({ negocioId: true })
  .partial();

export type UpdatePublicacionInput = z.infer<typeof updatePublicacionSchema>;
