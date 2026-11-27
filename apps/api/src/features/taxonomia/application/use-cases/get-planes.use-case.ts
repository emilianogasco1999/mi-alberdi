import type { PlanCatalogo } from '@mi-alberdi/shared';
import type { ITaxonomiaRepository } from '../../domain/repositories/ITaxonomiaRepository.js';

export class GetPlanesUseCase {
  constructor(private readonly repository: ITaxonomiaRepository) {}

  async execute(): Promise<PlanCatalogo[]> {
    return this.repository.getPlanes();
  }
}
