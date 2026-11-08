import { NotFoundError, ValidationError } from '@core/domain/errors/appErrors.js';
import type { RegistrarEventosBatchInput } from '@mi-alberdi/shared';
import type { IAnaliticaRepository } from '../../domain/repositories/IAnaliticaRepository.js';

export class RegistrarEventosBatchUseCase {
  constructor(private readonly repository: IAnaliticaRepository) {}

  async execute(input: RegistrarEventosBatchInput): Promise<{ count: number }> {
    if (!input.eventos || input.eventos.length === 0) {
      return { count: 0 };
    }

    // Validar negocios únicos en el batch
    const distinctNegocioIds = Array.from(new Set(input.eventos.map((e) => e.negocioId)));
    for (const nId of distinctNegocioIds) {
      const exists = await this.repository.findNegocioById(nId);
      if (!exists) {
        throw NotFoundError(`Uno de los negocios especificados (${nId}) no existe`);
      }
    }

    return this.repository.registrarEventosBatch(input.eventos);
  }
}

