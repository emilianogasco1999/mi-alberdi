import type { PlanCatalogoDTO } from '@mi-alberdi/shared';
import type { IMembresiasRepository } from '../../domain/repositories/IMembresiasRepository.js';

export class GetPlanesCatalogoUseCase {
  constructor(private readonly repository: IMembresiasRepository) {}

  async execute(): Promise<PlanCatalogoDTO[]> {
    return this.repository.getPlanesCatalogo();
  }
}
