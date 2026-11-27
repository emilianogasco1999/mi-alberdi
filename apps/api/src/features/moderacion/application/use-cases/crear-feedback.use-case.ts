import type {
  CrearFeedbackInput,
  FeedbackPlataformaDTO,
} from '@mi-alberdi/shared';
import type { IModeracionRepository } from '../../domain/repositories/IModeracionRepository.js';

export class CrearFeedbackUseCase {
  constructor(private readonly moderacionRepo: IModeracionRepository) {}

  async execute(
    input: CrearFeedbackInput,
    metadata: {
      usuarioId?: string | null;
      ipAddress?: string | null;
      userAgent?: string | null;
    },
  ): Promise<FeedbackPlataformaDTO> {
    return this.moderacionRepo.crearFeedback({
      ...input,
      usuarioId: metadata.usuarioId ?? null,
      ipAddress: metadata.ipAddress ?? null,
      userAgent: metadata.userAgent ?? null,
    });
  }
}

