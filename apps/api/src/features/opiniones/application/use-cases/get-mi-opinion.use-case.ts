import { NotFoundError } from '@core/domain/errors/appErrors.js';
import type { OpinionDTO } from '@mi-alberdi/shared';
import type { IOpinionesRepository } from '../../domain/repositories/IOpinionesRepository.js';

export class GetMiOpinionUseCase {
  constructor(private readonly repository: IOpinionesRepository) {}

  async execute(userId: string, negocioId: string): Promise<OpinionDTO | null> {
    const negocio = await this.repository.findNegocioById(negocioId);
    if (!negocio) {
      throw NotFoundError('El negocio especificado no existe');
    }

    return this.repository.findOpinionByUsuarioYNegocio(userId, negocioId);
  }
}
