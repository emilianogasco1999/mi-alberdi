import type { NegocioResumenDTO } from '@mi-alberdi/shared';
import type { INegociosRepository } from '../../domain/repositories/INegociosRepository.js';

export class GetMisNegociosUseCase {
  constructor(private readonly repository: INegociosRepository) {}

  async execute(propietarioId: string): Promise<NegocioResumenDTO[]> {
    return this.repository.findByPropietarioId(propietarioId);
  }
}

