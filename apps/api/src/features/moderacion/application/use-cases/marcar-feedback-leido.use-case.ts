import { NotFoundError } from '@core/domain/errors/appErrors.js';
import type { FeedbackPlataformaDTO } from '@mi-alberdi/shared';
import type { IModeracionRepository } from '../../domain/repositories/IModeracionRepository.js';

export class MarcarFeedbackLeidoUseCase {
  constructor(private readonly moderacionRepo: IModeracionRepository) {}

  async execute(
    id: string,
    notasAdmin?: string | null,
  ): Promise<FeedbackPlataformaDTO> {
    try {
      return await this.moderacionRepo.marcarFeedbackLeido(id, notasAdmin);
    } catch {
      throw NotFoundError('El mensaje de feedback no existe');
    }
  }
}
