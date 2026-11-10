import type { SolicitudVerificacionDTO } from '@mi-alberdi/shared';
import type { IModeracionRepository } from '../../domain/repositories/IModeracionRepository.js';

export class GetMisSolicitudesVerificacionUseCase {
  constructor(private readonly moderacionRepo: IModeracionRepository) {}

  async execute(solicitanteId: string): Promise<SolicitudVerificacionDTO[]> {
    return this.moderacionRepo.getMisSolicitudesVerificacion(solicitanteId);
  }
}

