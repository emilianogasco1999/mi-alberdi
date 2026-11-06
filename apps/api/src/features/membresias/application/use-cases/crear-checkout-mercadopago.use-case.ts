import { ForbiddenError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type { CrearPreferenciaMpInput, PreferenciaMpResponseDTO } from '@mi-alberdi/shared';
import type { IMembresiasRepository } from '../../domain/repositories/IMembresiasRepository.js';

export class CrearCheckoutMercadoPagoUseCase {
  constructor(private readonly repository: IMembresiasRepository) {}

  async execute(params: {
    usuarioId: string;
    rol: string;
    emailComprador?: string;
    input: CrearPreferenciaMpInput;
  }): Promise<PreferenciaMpResponseDTO> {
    const ownerId = await this.repository.getNegocioOwnerId(params.input.negocioId);
    if (!ownerId) {
      throw NotFoundError('Negocio no encontrado');
    }

    const esAdmin =
      params.rol === 'admin' || params.rol === 'administrador' || params.rol === 'moderador';
    if (ownerId !== params.usuarioId && !esAdmin) {
      throw ForbiddenError('No tienes permisos para contratar planes para este negocio');
    }

    return this.repository.crearPreferenciaMercadoPago({
      negocioId: params.input.negocioId,
      usuarioId: params.usuarioId,
      planCodigo: params.input.planCodigo,
      meses: params.input.periodoMeses || 1,
      emailComprador: params.emailComprador,
    });
  }
}
