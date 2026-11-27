import {
  ClientError,
  ForbiddenError,
  NotFoundError,
} from '@core/domain/errors/appErrors.js';
import type {
  SolicitarVerificacionInput,
  SolicitudVerificacionDTO,
} from '@mi-alberdi/shared';
import type { IModeracionRepository } from '../../domain/repositories/IModeracionRepository.js';

export class SolicitarVerificacionUseCase {
  constructor(private readonly moderacionRepo: IModeracionRepository) {}

  async execute(
    input: SolicitarVerificacionInput,
    solicitanteId: string,
  ): Promise<SolicitudVerificacionDTO> {
    const negocio = await this.moderacionRepo.findNegocioById(input.negocioId);

    if (!negocio) {
      throw NotFoundError('El comercio especificado no existe');
    }

    if (negocio.propietarioId !== solicitanteId) {
      throw ForbiddenError(
        'Solo el propietario del comercio puede solicitar su verificación',
      );
    }

    if (negocio.verificacion === 'aprobada') {
      throw ClientError('El comercio ya se encuentra verificado', 400);
    }

    const pending = await this.moderacionRepo.findPendingVerificacionByNegocio(
      input.negocioId,
    );

    if (pending) {
      throw ClientError(
        'Ya existe una solicitud de verificación pendiente para este comercio',
        400,
      );
    }

    return this.moderacionRepo.crearSolicitudVerificacion({
      ...input,
      solicitanteId,
    });
  }
}
