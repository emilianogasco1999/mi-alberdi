import type { NegocioDTO, UpdateNegocioInput } from '@mi-alberdi/shared';
import { ForbiddenError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type { INegociosRepository } from '../../domain/repositories/INegociosRepository.js';

export class UpdateNegocioUseCase {
  constructor(private readonly repository: INegociosRepository) {}

  async execute(
    negocioId: string,
    usuarioId: string,
    rol: string,
    input: UpdateNegocioInput,
  ): Promise<NegocioDTO> {
    const negocio = await this.repository.findById(negocioId);
    if (!negocio) {
      throw NotFoundError('El perfil de negocio no existe');
    }

    if (negocio.propietarioId !== usuarioId && rol !== 'admin') {
      throw ForbiddenError('No tenés permisos para modificar este negocio');
    }

    return this.repository.update(negocioId, input);
  }
}

