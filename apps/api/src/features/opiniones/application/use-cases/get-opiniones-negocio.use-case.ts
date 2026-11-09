import { NotFoundError } from '@core/domain/errors/appErrors.js';
import type {
  ListadoOpinionesResponseDTO,
  QueryOpinionesNegocioInput,
} from '@mi-alberdi/shared';
import type { IOpinionesRepository } from '../../domain/repositories/IOpinionesRepository.js';

export class GetOpinionesNegocioUseCase {
  constructor(private readonly repository: IOpinionesRepository) {}

  async execute(
    negocioId: string,
    query: QueryOpinionesNegocioInput,
  ): Promise<ListadoOpinionesResponseDTO> {
    const negocio = await this.repository.findNegocioById(negocioId);
    if (!negocio) {
      throw NotFoundError('El negocio especificado no existe');
    }

    return this.repository.getOpinionesNegocio(negocioId, query);
  }
}
