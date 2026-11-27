import { ForbiddenError } from '@core/domain/errors/appErrors.js';
import type { PagoMembresiaDTO, PagosMembresiaQueryInput } from '@mi-alberdi/shared';
import type { IMembresiasRepository } from '../../domain/repositories/IMembresiasRepository.js';

export class GetPagosAdminUseCase {
  constructor(private readonly repository: IMembresiasRepository) {}

  async execute(
    rol: string,
    query: PagosMembresiaQueryInput,
  ): Promise<{ pagos: PagoMembresiaDTO[]; total: number; page: number; totalPages: number }> {
    const esAdmin = rol === 'admin' || rol === 'administrador' || rol === 'moderador';
    if (!esAdmin) {
      throw ForbiddenError('Solo los administradores pueden consultar el listado general de pagos');
    }

    return this.repository.getPagosAdmin({
      negocioId: query.negocioId,
      estado: query.estado,
      pasarela: query.pasarela,
      page: query.page,
      limit: query.limit,
    });
  }
}
