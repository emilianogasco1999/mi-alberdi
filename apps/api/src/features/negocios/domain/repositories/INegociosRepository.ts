import type {
  AltaNegocioWizardInput,
  ConfigurarHorariosSemanaInput,
  CreateNegocioInput,
  CreateSucursalInput,
  HorarioNegocioDTO,
  NegocioDTO,
  NegocioMetodoPagoDTO,
  NegocioPublicoDTO,
  NegocioResumenDTO,
  UbicacionNegocioDTO,
  UpdateNegocioInput,
  UpdateSucursalInput,
} from '@mi-alberdi/shared';

export interface INegociosRepository {
  createFromWizard(
    propietarioId: string,
    input: AltaNegocioWizardInput,
    slug: string,
    qrCodeToken: string,
  ): Promise<NegocioDTO>;

  createSimple(
    propietarioId: string,
    input: CreateNegocioInput,
    slug: string,
    qrCodeToken: string,
  ): Promise<NegocioDTO>;

  findById(id: string): Promise<NegocioDTO | null>;
  findBySlug(slug: string): Promise<NegocioPublicoDTO | null>;
  findByPropietarioId(propietarioId: string): Promise<NegocioResumenDTO[]>;
  update(id: string, input: UpdateNegocioInput): Promise<NegocioDTO>;
  slugExists(slug: string): Promise<boolean>;

  // Sucursales
  countSucursales(negocioId: string): Promise<number>;
  createSucursal(negocioId: string, input: CreateSucursalInput): Promise<UbicacionNegocioDTO>;
  findSucursalById(sucursalId: string): Promise<UbicacionNegocioDTO | null>;
  updateSucursal(sucursalId: string, input: UpdateSucursalInput): Promise<UbicacionNegocioDTO>;
  deleteSucursal(sucursalId: string): Promise<void>;

  // Horarios
  configurarHorarios(
    negocioId: string,
    input: ConfigurarHorariosSemanaInput,
  ): Promise<HorarioNegocioDTO[]>;

  // Métodos de pago
  vincularMetodosPago(
    negocioId: string,
    metodos: { metodoPagoId: string; detalle?: string | null }[],
  ): Promise<NegocioMetodoPagoDTO[]>;
}

