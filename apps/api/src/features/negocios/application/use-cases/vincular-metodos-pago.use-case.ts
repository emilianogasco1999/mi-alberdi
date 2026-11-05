import type { NegocioMetodoPagoDTO, VincularMetodosPagoInput } from '@mi-alberdi/shared';
import { ForbiddenError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type { INegociosRepository } from '../../domain/repositories/INegociosRepository.js';

export class VincularMetodosPagoUseCase {
  constructor(private readonly repository: INegociosRepository) {}

  async execute(
    negocioId: string,
    usuarioId: string,
    rol: string,
    input: VincularMetodosPagoInput,
  ): Promise<NegocioMetodoPagoDTO[]> {
    const negocio = await this.repository.findById(negocioId);
    if (!negocio) {
      throw NotFoundError('El perfil de negocio no existe');
    }

    if (negocio.propietarioId !== usuarioId && rol !== 'admin') {
      throw ForbiddenError('No tenés permisos para gestionar los medios de pago de este negocio');
    }

    return this.repository.vincularMetodosPago(negocioId, input.metodosPago);
  }
}

