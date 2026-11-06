import type {
  AlcanceEnvio,
  CodigoPlan,
  EstadoNegocio,
  EstadoVerificacion,
  ModalidadAtencion,
  TipoPerfilComercial,
} from '../constants/domain.js';
import type {
  AltaNegocioWizardInput,
  ConfigurarHorariosSemanaInput,
  CreateNegocioInput,
  CreateSucursalInput,
  HorarioItemInput,
  UpdateNegocioInput,
  UpdateSucursalInput,
  VincularMetodosPagoInput,
} from '../schemas/negocio.schema.js';

export type {
  AltaNegocioWizardInput,
  ConfigurarHorariosSemanaInput,
  CreateNegocioInput,
  CreateSucursalInput,
  HorarioItemInput,
  UpdateNegocioInput,
  UpdateSucursalInput,
  VincularMetodosPagoInput,
};

// =============================================================================
// DTOs DE SUCURSAL Y HORARIOS
// =============================================================================

export interface UbicacionNegocioDTO {
  id: string;
  negocioId: string;
  nombreSucursal: string;
  esPrincipal: boolean;
  direccionEscrita: string;
  barrio: string | null;
  referenciaVisual: string | null;
  fotoFachadaUrl: string | null;
  whatsappSucursal: string | null;
  telefonoSucursal: string | null;
  latitud: number | null;
  longitud: number | null;
  pinColorHex: string | null;
  pinDestacado: boolean;
  mostrarDireccionExacta: boolean;
  activaPorPlan: boolean;
  creadoEn: string;
}

export interface HorarioNegocioDTO {
  id: string;
  negocioId: string;
  ubicacionId: string | null;
  diaSemana: number;
  cerrado: boolean;
  horarioCorrido: boolean;
  aperturaManana: string | null;
  cierreManana: string | null;
  aperturaTarde: string | null;
  cierreTarde: string | null;
  notaEspecial: string | null;
}

export interface NegocioMetodoPagoDTO {
  metodoPagoId: string;
  codigo: string;
  nombre: string;
  icono: string | null;
  detalle: string | null;
}

// =============================================================================
// DTOs DE PERFIL DE NEGOCIO / OFICIO
// =============================================================================

export interface NegocioResumenDTO {
  id: string;
  slug: string;
  tipoPerfil: TipoPerfilComercial;
  nombreComercial: string;
  eslogan: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  rubroPrincipalId: string;
  rubroNombre?: string;
  rubroIcono?: string;
  estado: EstadoNegocio;
  verificacion: EstadoVerificacion;
  badgeTexto: string | null;
  planActual: CodigoPlan;
  ratingPromedio: number;
  totalOpiniones: number;
  whatsappPrincipal: string;
  modalidadPrincipal: ModalidadAtencion;
  atiendeADomicilio: boolean;
  haceEnvios: boolean;
  alcanceEnvios: AlcanceEnvio;
  direccionPrincipalResumen?: string;
  barrioPrincipal?: string | null;
}

export interface NegocioDTO {
  id: string;
  propietarioId: string;
  tipoPerfil: TipoPerfilComercial;
  rubroPrincipalId: string;
  rubroPrincipal?: {
    id: string;
    slug: string;
    nombre: string;
    icono: string;
    colorHex: string;
  };
  slug: string;
  nombreComercial: string;
  eslogan: string | null;
  matriculaProfesional: string | null;
  descripcion: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  qrCodeToken: string;

  // Estado y verificación
  estado: EstadoNegocio;
  verificacion: EstadoVerificacion;
  verificadoEn: string | null;
  badgeTexto: string | null;

  // Plan y límites
  planActual: CodigoPlan;
  planVenceEn: string | null;
  prioridadPlan: number;
  cuposDestacadosMax: number;
  maxSucursales: number;
  entitlements: Record<string, unknown>;

  // Contacto y redes
  whatsappPrincipal: string;
  whatsappMensajeDefault: string | null;
  telefonoLinea: string | null;
  emailContacto: string | null;
  instagramHandle: string | null;
  facebookUrl: string | null;
  tiktokHandle: string | null;
  sitioWebUrl: string | null;

  // Operativa comercial
  modalidadPrincipal: ModalidadAtencion;
  atiendeADomicilio: boolean;
  haceEnvios: boolean;
  alcanceEnvios: AlcanceEnvio;
  aceptaCuotas: boolean;
  politicaCambios: string | null;

  // Métricas
  ratingPromedio: number;
  totalOpiniones: number;
  porcentajeCompletitud: number;
  ultimaActividadEn: string;
  creadoEn: string;
  actualizadoEn: string;

  // Relaciones
  ubicaciones?: UbicacionNegocioDTO[];
  horarios?: HorarioNegocioDTO[];
  metodosPago?: NegocioMetodoPagoDTO[];
}

export interface NegocioPublicoDTO {
  id: string;
  slug: string;
  tipoPerfil: TipoPerfilComercial;
  rubroPrincipal: {
    id: string;
    slug: string;
    nombre: string;
    icono: string;
    colorHex: string;
  };
  nombreComercial: string;
  eslogan: string | null;
  matriculaProfesional: string | null;
  descripcion: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  qrCodeToken: string;

  verificacion: EstadoVerificacion;
  badgeTexto: string | null;
  planActual: CodigoPlan;

  whatsappPrincipal: string;
  whatsappMensajeDefault: string | null;
  telefonoLinea: string | null;
  emailContacto: string | null;
  instagramHandle: string | null;
  facebookUrl: string | null;
  tiktokHandle: string | null;
  sitioWebUrl: string | null;

  modalidadPrincipal: ModalidadAtencion;
  atiendeADomicilio: boolean;
  haceEnvios: boolean;
  alcanceEnvios: AlcanceEnvio;
  aceptaCuotas: boolean;
  politicaCambios: string | null;

  ratingPromedio: number;
  totalOpiniones: number;

  ubicaciones: UbicacionNegocioDTO[];
  horarios: HorarioNegocioDTO[];
  metodosPago: NegocioMetodoPagoDTO[];
}
