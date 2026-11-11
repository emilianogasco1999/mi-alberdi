import type {
  CodigoPlan,
  EstadoMembresia,
  EstadoPago,
  PlanCatalogoDTO,
  MembresiaDTO,
  PagoMembresiaDTO,
  EstadoMembresiaNegocioDTO,
  PreferenciaMpResponseDTO,
} from '@mi-alberdi/shared';

export interface IMembresiasRepository {
  getPlanesCatalogo(): Promise<PlanCatalogoDTO[]>;
  getPlanPorCodigo(codigo: CodigoPlan): Promise<PlanCatalogoDTO | null>;
  getEstadoNegocio(negocioId: string): Promise<EstadoMembresiaNegocioDTO | null>;
  getNegocioOwnerId(negocioId: string): Promise<string | null>;
  getUsuarioPuedeProbarPremium(usuarioId: string): Promise<boolean>;

  crearMembresiaPrueba(params: {
    negocioId: string;
    usuarioId: string;
    planCodigo: CodigoPlan;
    diasPrueba: number;
  }): Promise<MembresiaDTO>;

  cambiarAPlanGratis(negocioId: string): Promise<void>;

  crearSolicitudPago(params: {
    negocioId: string;
    usuarioId: string;
    planCodigo: CodigoPlan;
    meses: number;
    autoRenovar: boolean;
    pasarela: string;
    montoArs: number;
    comprobanteUrl?: string | null;
    referenciaExterna?: string | null;
  }): Promise<{ membresia: MembresiaDTO; pago: PagoMembresiaDTO }>;

  canjearCodigoPromo(params: {
    negocioId: string;
    usuarioId: string;
    codigo: string;
  }): Promise<{ membresia: MembresiaDTO; planOtorgado: CodigoPlan; dias: number }>;

  registrarPagoTransferencia(params: {
    membresiaId: string;
    negocioId: string;
    usuarioId: string;
    montoArs: number;
    comprobanteUrl?: string | null;
    referenciaExterna?: string | null;
  }): Promise<PagoMembresiaDTO>;

  revisarPagoManual(params: {
    pagoId: string;
    accion: 'aprobar' | 'rechazar';
    motivoRechazo?: string;
  }): Promise<PagoMembresiaDTO>;

  getPagosByNegocio(params: {
    negocioId: string;
    page: number;
    limit: number;
  }): Promise<{ pagos: PagoMembresiaDTO[]; total: number; page: number; totalPages: number }>;

  getPagosAdmin(params: {
    negocioId?: string;
    estado?: string;
    pasarela?: string;
    page: number;
    limit: number;
  }): Promise<{ pagos: PagoMembresiaDTO[]; total: number; page: number; totalPages: number }>;

  ejecutarVencimientoMembresias(): Promise<{ membresiasVencidas: number }>;

  crearPreferenciaMercadoPago(params: {
    negocioId: string;
    usuarioId: string;
    planCodigo: CodigoPlan;
    meses: number;
    emailComprador?: string;
  }): Promise<PreferenciaMpResponseDTO>;

  procesarPagoMercadoPago(params: {
    pagoId: string;
    estadoMp: 'approved' | 'rejected' | 'pending';
    metadata?: Record<string, unknown>;
  }): Promise<PagoMembresiaDTO>;
}

