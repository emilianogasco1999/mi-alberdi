import type {
  CrearFeedbackInput,
  CrearReporteInput,
  FeedbackPlataformaDTO,
  ListadoPaginadoDTO,
  QueryListadosModeracionInput,
  ReporteModeracionDTO,
  ResolverReporteInput,
  ResolverSolicitudVerificacionInput,
  SolicitarVerificacionInput,
  SolicitudVerificacionDTO,
} from '@mi-alberdi/shared';

export interface NegocioMetadata {
  id: string;
  nombreComercial: string;
  propietarioId: string;
  verificacion: string;
}

export interface IModeracionRepository {
  // Objetos para validar existencia y pertenencia
  findNegocioById(id: string): Promise<NegocioMetadata | null>;
  findPublicacionById(id: string): Promise<{ id: string; titulo: string } | null>;
  findOpinionById(id: string): Promise<{ id: string; negocioId: string } | null>;

  // Solicitudes de verificación
  findPendingVerificacionByNegocio(
    negocioId: string,
  ): Promise<SolicitudVerificacionDTO | null>;
  findVerificacionById(id: string): Promise<SolicitudVerificacionDTO | null>;
  crearSolicitudVerificacion(
    data: SolicitarVerificacionInput & { solicitanteId: string },
  ): Promise<SolicitudVerificacionDTO>;
  resolverSolicitudVerificacion(
    id: string,
    data: ResolverSolicitudVerificacionInput,
    revisadoPorId: string,
  ): Promise<SolicitudVerificacionDTO>;
  getSolicitudesVerificacion(
    query: QueryListadosModeracionInput,
  ): Promise<ListadoPaginadoDTO<SolicitudVerificacionDTO>>;
  getMisSolicitudesVerificacion(
    solicitanteId: string,
  ): Promise<SolicitudVerificacionDTO[]>;

  // Reportes de moderación
  crearReporte(
    data: CrearReporteInput & {
      reportanteId?: string | null;
      dispositivoHash?: string | null;
    },
  ): Promise<ReporteModeracionDTO>;
  findReporteById(id: string): Promise<ReporteModeracionDTO | null>;
  resolverReporte(
    id: string,
    data: ResolverReporteInput,
    revisadoPorId: string,
  ): Promise<ReporteModeracionDTO>;
  getReportes(
    query: QueryListadosModeracionInput,
  ): Promise<ListadoPaginadoDTO<ReporteModeracionDTO>>;

  // Feedback de plataforma
  crearFeedback(
    data: CrearFeedbackInput & {
      usuarioId?: string | null;
      ipAddress?: string | null;
      userAgent?: string | null;
    },
  ): Promise<FeedbackPlataformaDTO>;
  getFeedbacks(
    query: QueryListadosModeracionInput,
  ): Promise<ListadoPaginadoDTO<FeedbackPlataformaDTO>>;
  marcarFeedbackLeido(
    id: string,
    notasAdmin?: string | null,
  ): Promise<FeedbackPlataformaDTO>;
}

