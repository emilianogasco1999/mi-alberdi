import type { DestacadosPortadaDTO } from '@mi-alberdi/shared';
import type { IDescubrimientoRepository } from '../../domain/repositories/IDescubrimientoRepository.js';

export class GetDestacadosPortadaUseCase {
  constructor(private readonly repository: IDescubrimientoRepository) {}

  async execute(): Promise<DestacadosPortadaDTO> {
    return this.repository.getDestacadosPortada();
  }
}
