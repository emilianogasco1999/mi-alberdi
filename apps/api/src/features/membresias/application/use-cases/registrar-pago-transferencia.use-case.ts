import { ForbiddenError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type { PagoMembresiaDTO, RegistrarPagoTransferenciaInput } from '@mi-alberdi/shared';
import type { IMembresiasRepository } from '../../domain/repositories/IMembresiasRepository.js';

export class RegistrarPagoTransferenciaUseCase {
  constructor(private readonly repository: IMembresiasRepository) {}

  async execute(
    usuarioId: string,
    rol: string,
    input: RegistrarPagoTransferenciaInput,
  ): Promise<PagoMembresiaDTO> {
    const ownerId = await this.repository.getNegocioOwnerId(input.negocioId);
    if (!ownerId) {
      throw NotFoundError('Negocio no encontrado');
    }

    const esAdmin = rol === 'administrador' || rol === 'moderador';
    if (ownerId !== usuarioId && !esAdmin) {
      throw ForbiddenError('No tienes permisos para registrar pagos en este negocio');
    }

    return this.repository.registrarPagoTransferencia({
      membresiaId: input.membresiaId,
      negocioId: input.negocioId,
      usuarioId,
      montoArs: input.montoArs,
      comprobanteUrl: input.comprobanteUrl,
      referenciaExterna: input.referenciaExterna,
    });
  }
}
