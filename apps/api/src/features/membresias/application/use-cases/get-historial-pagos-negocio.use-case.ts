import { ForbiddenError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type { PagoMembresiaDTO } from '@mi-alberdi/shared';
import type { IMembresiasRepository } from '../../domain/repositories/IMembresiasRepository.js';

export class GetHistorialPagosNegocioUseCase {
  constructor(private readonly repository: IMembresiasRepository) {}

  async execute(params: {
    negocioId: string;
    usuarioId: string;
    rol: string;
    page: number;
    limit: number;
  }): Promise<{ pagos: PagoMembresiaDTO[]; total: number; page: number; totalPages: number }> {
    const ownerId = await this.repository.getNegocioOwnerId(params.negocioId);
    if (!ownerId) {
      throw NotFoundError('Negocio no encontrado');
    }

    const esAdmin = params.rol === 'admin' || params.rol === 'administrador' || params.rol === 'moderador';
    if (ownerId !== params.usuarioId && !esAdmin) {
      throw ForbiddenError('No tienes permisos para consultar los pagos de este negocio');
    }

    return this.repository.getPagosByNegocio({
      negocioId: params.negocioId,
      page: params.page,
      limit: params.limit,
    });
  }
}
