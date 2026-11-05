import type { UbicacionNegocioDTO, UpdateSucursalInput } from '@mi-alberdi/shared';
import { ForbiddenError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type { INegociosRepository } from '../../domain/repositories/INegociosRepository.js';

export class UpdateSucursalUseCase {
  constructor(private readonly repository: INegociosRepository) {}

  async execute(
    negocioId: string,
    sucursalId: string,
    usuarioId: string,
    rol: string,
    input: UpdateSucursalInput,
  ): Promise<UbicacionNegocioDTO> {
    const negocio = await this.repository.findById(negocioId);
    if (!negocio) {
      throw NotFoundError('El perfil de negocio no existe');
    }

    if (negocio.propietarioId !== usuarioId && rol !== 'admin') {
      throw ForbiddenError('No tenés permisos para modificar esta sucursal');
    }

    const sucursal = await this.repository.findSucursalById(sucursalId);
    if (!sucursal || sucursal.negocioId !== negocioId) {
      throw NotFoundError('La sucursal no pertenece a este negocio');
    }

    return this.repository.updateSucursal(sucursalId, input);
  }
}

