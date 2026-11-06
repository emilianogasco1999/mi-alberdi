import type {
  CodigoPlan,
  EstadoMembresia,
  EstadoPago,
  PasarelaPago,
} from '../constants/domain.js';
import type {
  CanjearCodigoPromoInput,
  CrearCodigoPromocionalInput,
  MembresiasQueryInput,
  PagosMembresiaQueryInput,
  RegistrarPagoTransferenciaInput,
  RevisarPagoManualInput,
  SolicitarCambioPlanInput,
} from '../schemas/membresia.schema.js';

export type {
  CanjearCodigoPromoInput,
  CrearCodigoPromocionalInput,
  MembresiasQueryInput,
  PagosMembresiaQueryInput,
  RegistrarPagoTransferenciaInput,
  RevisarPagoManualInput,
  SolicitarCambioPlanInput,
};

export interface PlanCatalogoDTO {
  codigo: CodigoPlan;
  nombre: string;
  precioMensualArs: number;
  maxPublicaciones: number;
  maxFotosPorPublicacion: number;
  cuposDestacados: number;
  maxSucursales: number;
  maxReelsActivos: number;
  prioridadBase: number;
  permiteEstadisticas: boolean;
  permitePinDestacado: boolean;
  permiteBanner: boolean;
  permiteAsistenteIa: boolean;
  caracteristicasBase: Record<string, unknown>;
  activo: boolean;
}

export interface MembresiaDTO {
  id: string;
  negocioId: string;
  planCodigo: CodigoPlan;
  estado: EstadoMembresia;
  fechaInicio: string;
  fechaFin: string;
  esPrueba: boolean;
  codigoPromocionalId: string | null;
  autoRenovar: boolean;
  creadoEn: string;
  actualizadoEn: string;
  plan?: PlanCatalogoDTO;
  codigoPromocional?: {
    codigo: string;
    descripcion: string | null;
  } | null;
}

export interface PagoMembresiaDTO {
  id: string;
  membresiaId: string;
  negocioId: string;
  usuarioId: string;
  montoArs: number;
  pasarela: string;
  referenciaExterna: string | null;
  estado: EstadoPago;
  comprobanteUrl: string | null;
  metadataPasarela: Record<string, unknown> | null;
  pagadoEn: string | null;
  creadoEn: string;
  actualizadoEn: string;
  usuarioNombre?: string;
  negocioNombre?: string;
}

export interface CodigoPromocionalDTO {
  id: string;
  codigo: string;
  descripcion: string | null;
  planOtorgado: CodigoPlan;
  diasVigencia: number;
  usosMaximos: number;
  usosActuales: number;
  validoHasta: string | null;
  activo: boolean;
  creadoEn: string;
}

export interface EstadoMembresiaNegocioDTO {
  negocioId: string;
  nombreComercial: string;
  planActual: CodigoPlan;
  planVenceEn: string | null;
  prioridadPlan: number;
  cuposDestacadosMax: number;
  cuposDestacadosEnUso: number;
  maxSucursales: number;
  sucursalesActivas: number;
  entitlements: Record<string, unknown>;
  membresiaActiva: MembresiaDTO | null;
}

