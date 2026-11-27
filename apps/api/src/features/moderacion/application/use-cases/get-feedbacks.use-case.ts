import type {
  FeedbackPlataformaDTO,
  ListadoPaginadoDTO,
  QueryListadosModeracionInput,
} from '@mi-alberdi/shared';
import type { IModeracionRepository } from '../../domain/repositories/IModeracionRepository.js';

export class GetFeedbacksUseCase {
  constructor(private readonly moderacionRepo: IModeracionRepository) {}

  async execute(
    query: QueryListadosModeracionInput,
  ): Promise<ListadoPaginadoDTO<FeedbackPlataformaDTO>> {
    return this.moderacionRepo.getFeedbacks(query);
  }
}

