import { ForbiddenError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type { EstadoMembresiaNegocioDTO } from '@mi-alberdi/shared';
import type { IMembresiasRepository } from '../../domain/repositories/IMembresiasRepository.js';

export class GetEstadoMembresiaNegocioUseCase {
  constructor(private readonly repository: IMembresiasRepository) {}

  async execute(
    negocioId: string,
    usuarioId: string,
    rol: string,
  ): Promise<EstadoMembresiaNegocioDTO> {
    const ownerId = await this.repository.getNegocioOwnerId(negocioId);
    if (!ownerId) {
      throw NotFoundError('Negocio no encontrado');
    }

    const esAdmin = rol === 'admin' || rol === 'administrador' || rol === 'moderador';
    if (ownerId !== usuarioId && !esAdmin) {
      throw ForbiddenError('No tienes permisos para ver el estado de membresía de este negocio');
    }

    const estado = await this.repository.getEstadoNegocio(negocioId);
    if (!estado) {
      throw NotFoundError('Estado del negocio no encontrado');
    }

    return estado;
  }
}

