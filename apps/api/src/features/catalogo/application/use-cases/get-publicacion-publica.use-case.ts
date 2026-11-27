import { NotFoundError } from '@core/domain/errors/appErrors.js';
import type { PublicacionPublicaDTO } from '@mi-alberdi/shared';
import type { ICatalogoRepository } from '../../domain/repositories/ICatalogoRepository.js';

export class GetPublicacionPublicaUseCase {
  constructor(private readonly repository: ICatalogoRepository) {}

  async execute(slug: string): Promise<PublicacionPublicaDTO> {
    const publicacion = await this.repository.findBySlug(slug);
    if (!publicacion) {
      throw NotFoundError('La publicación no fue encontrada');
    }

    return publicacion;
  }
}
