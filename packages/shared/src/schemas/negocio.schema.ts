import { z } from 'zod';
import {
  ALCANCES_ENVIO_VALUES,
  MODALIDADES_ATENCION_VALUES,
  TIPOS_PERFIL_COMERCIAL_VALUES,
  TIPOS_PUBLICACION_VALUES,
} from '../constants/domain.js';

export const tipoPerfilComercialSchema = z.enum(TIPOS_PERFIL_COMERCIAL_VALUES);
export const modalidadAtencionSchema = z.enum(MODALIDADES_ATENCION_VALUES);
export const alcanceEnvioSchema = z.enum(ALCANCES_ENVIO_VALUES);
export const tipoPublicacionSchema = z.enum(TIPOS_PUBLICACION_VALUES);

export const createNegocioSchema = z.object({
  tipoPerfil: tipoPerfilComercialSchema,
  rubroPrincipalId: z.string().uuid('ID de rubro inválido'),
  nombreComercial: z
    .string({ required_error: 'El nombre comercial o del oficio es obligatorio' })
    .trim()
    .min(2, 'Debe tener al menos 2 caracteres')
    .max(120, 'No puede superar los 120 caracteres'),
  eslogan: z.string().trim().max(160).optional().nullable(),
  matriculaProfesional: z.string().trim().max(60).optional().nullable(),
  descripcion: z.string().trim().max(2000).optional().nullable(),
  whatsappPrincipal: z
    .string({ required_error: 'El número de WhatsApp es obligatorio para recibir consultas' })
    .trim()
    .min(8, 'Ingresá un número de WhatsApp válido')
    .max(30),
  whatsappMensajeDefault: z.string().trim().max(250).optional().nullable(),
  modalidadPrincipal: modalidadAtencionSchema.default('horarios_fijos'),
  atiendeADomicilio: z.boolean().default(false),
  haceEnvios: z.boolean().default(false),
  alcanceEnvios: alcanceEnvioSchema.default('sin_envio'),
  aceptaCuotas: z.boolean().default(false),
});

export type CreateNegocioInput = z.infer<typeof createNegocioSchema>;

export const createSucursalSchema = z.object({
  negocioId: z.string().uuid('ID de negocio inválido'),
  nombreSucursal: z.string().trim().min(2).max(80).default('Casa Central'),
  esPrincipal: z.boolean().default(false),
  direccionEscrita: z.string().trim().min(3, 'La dirección es obligatoria').max(200),
  barrio: z.string().trim().max(80).optional().nullable(),
  referenciaVisual: z.string().trim().max(200).optional().nullable(),
  whatsappSucursal: z.string().trim().max(30).optional().nullable(),
  telefonoSucursal: z.string().trim().max(30).optional().nullable(),
  latitud: z.number().min(-90).max(90).optional().nullable(),
  longitud: z.number().min(-180).max(180).optional().nullable(),
  mostrarDireccionExacta: z.boolean().default(true),
});

export type CreateSucursalInput = z.infer<typeof createSucursalSchema>;

export const createPublicacionSchema = z.object({
  negocioId: z.string().uuid('ID de negocio inválido'),
  categoriaId: z.string().uuid('ID de categoría inválido'),
  tipo: tipoPublicacionSchema,
  titulo: z
    .string({ required_error: 'El título de la publicación es obligatorio' })
    .trim()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(140),
  descripcion: z
    .string({ required_error: 'La descripción es obligatoria' })
    .trim()
    .min(10, 'Describí mejor tu servicio o producto (mínimo 10 caracteres)'),
  precioReferenciaArs: z.number().nonnegative().optional().nullable(),
  etiquetaPrecio: z.string().trim().max(40).optional().nullable(),
  modalidad: modalidadAtencionSchema.default('horarios_fijos'),
  whatsappEspecifico: z.string().trim().max(30).optional().nullable(),
  mensajeWhatsappCustom: z.string().trim().max(250).optional().nullable(),
  esDestacada: z.boolean().default(false),
});

export type CreatePublicacionInput = z.infer<typeof createPublicacionSchema>;

