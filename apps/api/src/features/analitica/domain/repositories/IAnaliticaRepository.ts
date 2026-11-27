import type {
  MetricasNegocioResponseDTO,
  RegistrarEventoInput,
} from '@mi-alberdi/shared';

export interface NegocioMetadata {
  id: string;
  nombreComercial: string;
  propietarioId: string;
}

export interface RegistrarEventoData extends RegistrarEventoInput {
  dispositivoHash?: string | null;
}

export interface GetMetricasParams {
  negocioId: string;
  desde: Date;
  hasta: Date;
  ubicacionId?: string | null;
  periodoNombre: string;
}

export interface IAnaliticaRepository {
  findNegocioById(id: string): Promise<NegocioMetadata | null>;
  findPublicacionById(id: string): Promise<{ id: string; negocioId: string } | null>;
  findUbicacionById(id: string): Promise<{ id: string; negocioId: string } | null>;
  findReelById(id: string): Promise<{ id: string; negocioId: string } | null>;
  registrarEvento(data: RegistrarEventoData): Promise<{ id: string; creadoEn: Date }>;
  registrarEventosBatch(eventos: RegistrarEventoData[]): Promise<{ count: number }>;
  getMetricasNegocio(params: GetMetricasParams): Promise<MetricasNegocioResponseDTO>;
}

