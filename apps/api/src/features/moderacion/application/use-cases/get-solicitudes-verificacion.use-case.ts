import type {
  ListadoPaginadoDTO,
  QueryListadosModeracionInput,
  SolicitudVerificacionDTO,
} from '@mi-alberdi/shared';
import type { IModeracionRepository } from '../../domain/repositories/IModeracionRepository.js';

export class GetSolicitudesVerificacionUseCase {
  constructor(private readonly moderacionRepo: IModeracionRepository) {}

  async execute(
    query: QueryListadosModeracionInput,
  ): Promise<ListadoPaginadoDTO<SolicitudVerificacionDTO>> {
    return this.moderacionRepo.getSolicitudesVerificacion(query);
  }
}

