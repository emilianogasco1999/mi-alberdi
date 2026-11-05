import type { MetodoPagoCatalogo } from '@mi-alberdi/shared';
import type { ITaxonomiaRepository } from '../../domain/repositories/ITaxonomiaRepository.js';

export class GetMetodosPagoUseCase {
  constructor(private readonly repository: ITaxonomiaRepository) {}

  async execute(): Promise<MetodoPagoCatalogo[]> {
    return this.repository.getMetodosPago();
  }
}

