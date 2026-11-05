import type { RubroGrupoArbolDTO } from '@mi-alberdi/shared';
import type { ITaxonomiaRepository } from '../../domain/repositories/ITaxonomiaRepository.js';

export class GetArbolTaxonomiaUseCase {
  constructor(private readonly repository: ITaxonomiaRepository) {}

  async execute(): Promise<RubroGrupoArbolDTO[]> {
    return this.repository.getArbolTaxonomia();
  }
}

