import { ForbiddenError } from '@core/domain/errors/appErrors.js';
import type { PagoMembresiaDTO, RevisarPagoManualInput } from '@mi-alberdi/shared';
import type { IMembresiasRepository } from '../../domain/repositories/IMembresiasRepository.js';

export class RevisarPagoManualUseCase {
  constructor(private readonly repository: IMembresiasRepository) {}

  async execute(rol: string, input: RevisarPagoManualInput): Promise<PagoMembresiaDTO> {
    const esAdmin = rol === 'admin' || rol === 'administrador' || rol === 'moderador';
    if (!esAdmin) {
      throw ForbiddenError('Solo los administradores pueden revisar y aprobar pagos manuales');
    }

    return this.repository.revisarPagoManual({
      pagoId: input.pagoId,
      accion: input.accion,
      motivoRechazo: input.motivoRechazo,
    });
  }
}

