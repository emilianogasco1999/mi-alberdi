import type { CreateSucursalInput, UbicacionNegocioDTO } from '@mi-alberdi/shared';
import { ClientError, ForbiddenError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type { INegociosRepository } from '../../domain/repositories/INegociosRepository.js';

export class CreateSucursalUseCase {
  constructor(private readonly repository: INegociosRepository) {}

  async execute(
    negocioId: string,
    usuarioId: string,
    rol: string,
    input: CreateSucursalInput,
  ): Promise<UbicacionNegocioDTO> {
    const negocio = await this.repository.findById(negocioId);
    if (!negocio) {
      throw NotFoundError('El perfil de negocio no existe');
    }

    if (negocio.propietarioId !== usuarioId && rol !== 'admin') {
      throw ForbiddenError('No tenés permisos para agregar sucursales en este negocio');
    }

    const sucursalesActuales = await this.repository.countSucursales(negocioId);
    if (sucursalesActuales >= negocio.maxSucursales) {
      throw ClientError(
        `Límite de sucursales alcanzado (${sucursalesActuales}/${negocio.maxSucursales}). Tu plan actual (${negocio.planActual.toUpperCase()}) no permite agregar más sucursales. Mejorá tu plan para desbloquear nuevas ubicaciones en el mapa.`,
        403,
      );
    }

    return this.repository.createSucursal(negocioId, input);
  }
}

