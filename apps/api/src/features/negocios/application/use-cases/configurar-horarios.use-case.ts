import type { ConfigurarHorariosSemanaInput, HorarioNegocioDTO } from '@mi-alberdi/shared';
import { ForbiddenError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type { INegociosRepository } from '../../domain/repositories/INegociosRepository.js';

export class ConfigurarHorariosUseCase {
  constructor(private readonly repository: INegociosRepository) {}

  async execute(
    negocioId: string,
    usuarioId: string,
    rol: string,
    input: ConfigurarHorariosSemanaInput,
  ): Promise<HorarioNegocioDTO[]> {
    const negocio = await this.repository.findById(negocioId);
    if (!negocio) {
      throw NotFoundError('El perfil de negocio no existe');
    }

    if (negocio.propietarioId !== usuarioId && rol !== 'admin') {
      throw ForbiddenError('No tenés permisos para configurar horarios de este negocio');
    }

    if (input.ubicacionId) {
      const sucursal = await this.repository.findSucursalById(input.ubicacionId);
      if (!sucursal || sucursal.negocioId !== negocioId) {
        throw NotFoundError('La sucursal indicada no pertenece a este negocio');
      }
    }

    return this.repository.configurarHorarios(negocioId, input);
  }
}

