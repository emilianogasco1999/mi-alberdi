import type {
  CreateOpinionInput,
  ListadoOpinionesResponseDTO,
  OpinionDTO,
  QueryOpinionesNegocioInput,
  UpdateOpinionInput,
} from '@mi-alberdi/shared';

export interface NegocioMetadata {
  id: string;
  nombreComercial: string;
  propietarioId: string;
  ratingPromedio: number;
  totalOpiniones: number;
}

export interface CreateOpinionData extends CreateOpinionInput {
  usuarioId: string;
  nombreAutorVisible: string;
  dispositivoId?: string | null;
}

export interface IOpinionesRepository {
  findUsuarioById(
    id: string,
  ): Promise<{ id: string; nombre: string; apellido: string | null } | null>;
  findNegocioById(id: string): Promise<NegocioMetadata | null>;
  findPublicacionById(
    id: string,
  ): Promise<{ id: string; negocioId: string; titulo: string } | null>;
  findOpinionById(
    id: string,
  ): Promise<(OpinionDTO & { propietarioNegocioId: string }) | null>;
  findOpinionByUsuarioYNegocio(
    usuarioId: string,
    negocioId: string,
  ): Promise<OpinionDTO | null>;
  createOpinion(data: CreateOpinionData): Promise<OpinionDTO>;
  updateOpinion(id: string, data: UpdateOpinionInput): Promise<OpinionDTO>;
  responderOpinion(id: string, respuesta: string): Promise<OpinionDTO>;
  eliminarRespuesta(id: string): Promise<OpinionDTO>;
  deleteOpinion(id: string, negocioId: string): Promise<void>;
  getOpinionesNegocio(
    negocioId: string,
    query: QueryOpinionesNegocioInput,
  ): Promise<ListadoOpinionesResponseDTO>;
  recalcularRatingNegocio(
    negocioId: string,
  ): Promise<{ ratingPromedio: number; totalOpiniones: number }>;
}
