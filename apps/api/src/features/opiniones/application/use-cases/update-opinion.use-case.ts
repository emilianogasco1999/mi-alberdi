import {
  ForbiddenError,
  NotFoundError,
} from '@core/domain/errors/appErrors.js';
import type { OpinionDTO, UpdateOpinionInput } from '@mi-alberdi/shared';
import type { IOpinionesRepository } from '../../domain/repositories/IOpinionesRepository.js';

export class UpdateOpinionUseCase {
  constructor(private readonly repository: IOpinionesRepository) {}

  async execute(
    opinionId: string,
    userId: string,
    input: UpdateOpinionInput,
  ): Promise<OpinionDTO> {
    const opinion = await this.repository.findOpinionById(opinionId);
    if (!opinion) {
      throw NotFoundError('La opinión especificada no existe');
    }

    if (opinion.usuarioId !== userId) {
      throw ForbiddenError('Solo el autor puede editar su opinión');
    }

    return this.repository.updateOpinion(opinionId, input);
  }
}

