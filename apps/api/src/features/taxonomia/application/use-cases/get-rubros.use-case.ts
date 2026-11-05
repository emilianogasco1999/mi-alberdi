import type { RubroGrupo } from '@mi-alberdi/shared';
import type { ITaxonomiaRepository } from '../../domain/repositories/ITaxonomiaRepository.js';

export class GetRubrosUseCase {
  constructor(private readonly repository: ITaxonomiaRepository) {}

  async execute(): Promise<RubroGrupo[]> {
    return this.repository.getRubros();
  }
}

