import type {
  ActualizarNegocioInput,
  NegocioResponseDto,
  UpdateNegocioInput,
} from '@mi-alberdi/shared';
import { ForbiddenError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type { INegociosRepository } from '../../domain/repositories/INegociosRepository.js';
import { toNegocioResponseDto } from '../helpers/negocio-response.mapper.js';

export class ActualizarNegocioUseCase {
  constructor(private readonly repository: INegociosRepository) {}

  async execute(
    negocioId: string,
    usuarioId: string,
    input: ActualizarNegocioInput | UpdateNegocioInput,
  ): Promise<NegocioResponseDto> {
    const negocio = await this.repository.findById(negocioId);
    if (!negocio) {
      throw NotFoundError('El perfil de negocio no existe');
    }

    if (negocio.propietarioId !== usuarioId) {
      throw ForbiddenError('No tenés permisos para modificar este negocio');
    }

    const updated = await this.repository.update(negocioId, input);
    return toNegocioResponseDto(updated);
  }
}
