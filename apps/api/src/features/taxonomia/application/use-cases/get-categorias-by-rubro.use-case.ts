import type { CategoriaNodoDTO } from '@mi-alberdi/shared';
import type { ITaxonomiaRepository } from '../../domain/repositories/ITaxonomiaRepository.js';

export class GetCategoriasByRubroUseCase {
  constructor(private readonly repository: ITaxonomiaRepository) {}

  async execute(rubroIdOrSlug: string): Promise<CategoriaNodoDTO[]> {
    return this.repository.getCategoriasByRubro(rubroIdOrSlug);
  }
}

