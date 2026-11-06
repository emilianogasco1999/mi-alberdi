import type {
  CodigoPlan,
  EstadoMembresia,
  EstadoPago,
  PlanCatalogoDTO,
  MembresiaDTO,
  PagoMembresiaDTO,
  EstadoMembresiaNegocioDTO,
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

  ejecutarVencimientoMembresias(): Promise<{ membresiasVencidas: number }>;
}

