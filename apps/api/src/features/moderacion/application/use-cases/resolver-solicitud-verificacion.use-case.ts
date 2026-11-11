import { ClientError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type {
  ResolverSolicitudVerificacionInput,
  SolicitudVerificacionDTO,
} from '@mi-alberdi/shared';
import type { IModeracionRepository } from '../../domain/repositories/IModeracionRepository.js';

export class ResolverSolicitudVerificacionUseCase {
  constructor(private readonly moderacionRepo: IModeracionRepository) {}

  async execute(
    id: string,
    input: ResolverSolicitudVerificacionInput,
    revisadoPorId: string,
  ): Promise<SolicitudVerificacionDTO> {
    const solicitud = await this.moderacionRepo.findVerificacionById(id);

    if (!solicitud) {
      throw NotFoundError('La solicitud de verificación no existe');
    }

    if (solicitud.estado !== 'pendiente') {
      throw ClientError(
        `La solicitud ya fue procesada anteriormente con estado '${solicitud.estado}'`,
        400,
      );
    }

    if (input.estado === 'rechazada' && !input.motivoRechazo) {
      throw ClientError(
        'Debe indicar un motivo al rechazar una solicitud de verificación',
        400,
      );
    }

    return this.moderacionRepo.resolverSolicitudVerificacion(
      id,
      input,
      revisadoPorId,
    );
  }
}
