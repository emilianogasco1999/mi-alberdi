import { ClientError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type {
  ReporteModeracionDTO,
  ResolverReporteInput,
} from '@mi-alberdi/shared';
import type { IModeracionRepository } from '../../domain/repositories/IModeracionRepository.js';

export class ResolverReporteUseCase {
  constructor(private readonly moderacionRepo: IModeracionRepository) {}

  async execute(
    id: string,
    input: ResolverReporteInput,
    revisadoPorId: string,
  ): Promise<ReporteModeracionDTO> {
    const reporte = await this.moderacionRepo.findReporteById(id);

    if (!reporte) {
      throw NotFoundError('El reporte de moderación no existe');
    }

    if (reporte.estado !== 'pendiente' && reporte.estado !== 'en_revision') {
      throw ClientError(
        `El reporte ya fue resuelto con estado '${reporte.estado}'`,
        400,
      );
    }

    return this.moderacionRepo.resolverReporte(id, input, revisadoPorId);
  }
}
