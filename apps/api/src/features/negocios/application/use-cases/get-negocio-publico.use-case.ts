import type { NegocioPublicoDTO } from '@mi-alberdi/shared';
import { NotFoundError } from '@core/domain/errors/appErrors.js';
import type { INegociosRepository } from '../../domain/repositories/INegociosRepository.js';

export class GetNegocioPublicoUseCase {
  constructor(private readonly repository: INegociosRepository) {}

  async execute(slug: string): Promise<NegocioPublicoDTO> {
    const negocio = await this.repository.findBySlug(slug);
    if (!negocio) {
      throw NotFoundError('El perfil de negocio no fue encontrado');
    }

    return negocio;
  }
}

