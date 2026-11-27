import type {
  EstadoModeracion,
  EstadoVerificacion,
} from '../constants/domain.js';

export interface SolicitudVerificacionDTO {
  id: string;
  negocioId: string;
  nombreNegocio: string;
  solicitanteId: string;
  documentoFrenteUrl: string | null;
  comprobanteComercioUrl: string | null;
  notasSolicitante: string | null;
  estado: EstadoVerificacion;
  revisadoPorId: string | null;
  motivoRechazo: string | null;
  resueltoEn: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface ReporteModeracionDTO {
  id: string;
  negocioId: string | null;
  nombreNegocio: string | null;
  publicacionId: string | null;
  tituloPublicacion: string | null;
  opinionId: string | null;
  reportanteId: string | null;
  motivo: string;
  detalle: string | null;
  estado: EstadoModeracion;
  revisadoPorId: string | null;
  resolucionNota: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface FeedbackPlataformaDTO {
  id: string;
  usuarioId: string | null;
  nombreCompleto: string | null;
  email: string | null;
  mensaje: string;
  notasAdmin: string | null;
  leido: boolean;
  creadoEn: string;
}

export interface ListadoPaginadoDTO<T> {
  items: T[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

