import type { BuscarDescubrimientoInput, ResultadoBusquedaDTO } from '@mi-alberdi/shared';
import type { IDescubrimientoRepository } from '../../domain/repositories/IDescubrimientoRepository.js';

export class BuscarDescubrimientoUseCase {
  constructor(private readonly repository: IDescubrimientoRepository) {}

  async execute(input: BuscarDescubrimientoInput): Promise<ResultadoBusquedaDTO> {
    return this.repository.buscar(input);
  }
}
