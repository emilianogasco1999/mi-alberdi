import { ClientError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type { CrearReporteInput, ReporteModeracionDTO } from '@mi-alberdi/shared';
import type { IModeracionRepository } from '../../domain/repositories/IModeracionRepository.js';

export class CrearReporteUseCase {
  constructor(private readonly moderacionRepo: IModeracionRepository) {}

  async execute(
    input: CrearReporteInput,
    metadata: {
      reportanteId?: string | null;
      dispositivoHash?: string | null;
    },
  ): Promise<ReporteModeracionDTO> {
    const targets = [input.negocioId, input.publicacionId, input.opinionId].filter(
      Boolean,
    );

    if (targets.length === 0) {
      throw ClientError(
        'Debe especificar al menos un objetivo de reporte (negocioId, publicacionId u opinionId)',
        400,
      );
    }

    if (targets.length > 1) {
      throw ClientError(
        'Solo puede reportar una entidad por reporte (negocioId, publicacionId u opinionId)',
        400,
      );
    }

    if (input.negocioId) {
      const negocio = await this.moderacionRepo.findNegocioById(input.negocioId);
      if (!negocio) {
        throw NotFoundError('El comercio a reportar no existe');
      }
    }

    if (input.publicacionId) {
      const publicacion = await this.moderacionRepo.findPublicacionById(
        input.publicacionId,
      );
      if (!publicacion) {
        throw NotFoundError('La publicación a reportar no existe');
      }
    }

    if (input.opinionId) {
      const opinion = await this.moderacionRepo.findOpinionById(input.opinionId);
      if (!opinion) {
        throw NotFoundError('La opinión a reportar no existe');
      }
    }

    return this.moderacionRepo.crearReporte({
      ...input,
      reportanteId: metadata.reportanteId ?? null,
      dispositivoHash: metadata.dispositivoHash ?? null,
    });
  }
}
