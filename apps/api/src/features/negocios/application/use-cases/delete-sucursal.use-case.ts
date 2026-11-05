import { ClientError, ForbiddenError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type { INegociosRepository } from '../../domain/repositories/INegociosRepository.js';

export class DeleteSucursalUseCase {
  constructor(private readonly repository: INegociosRepository) {}

  async execute(
    negocioId: string,
    sucursalId: string,
    usuarioId: string,
    rol: string,
  ): Promise<void> {
    const negocio = await this.repository.findById(negocioId);
    if (!negocio) {
      throw NotFoundError('El perfil de negocio no existe');
    }

    if (negocio.propietarioId !== usuarioId && rol !== 'admin') {
      throw ForbiddenError('No tenés permisos para eliminar esta sucursal');
    }

    const sucursal = await this.repository.findSucursalById(sucursalId);
    if (!sucursal || sucursal.negocioId !== negocioId) {
      throw NotFoundError('La sucursal no pertenece a este negocio');
    }

    if (sucursal.esPrincipal) {
      throw ClientError('No podés eliminar la sucursal principal de tu negocio', 400);
    }

    await this.repository.deleteSucursal(sucursalId);
  }
}

