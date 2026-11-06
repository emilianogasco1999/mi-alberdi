import type { PagoMembresiaDTO, SimularWebhookMpInput } from '@mi-alberdi/shared';
import type { IMembresiasRepository } from '../../domain/repositories/IMembresiasRepository.js';

export class SimularPagoWebhookUseCase {
  constructor(private readonly repository: IMembresiasRepository) {}

  async execute(input: SimularWebhookMpInput): Promise<PagoMembresiaDTO> {
    return this.repository.procesarPagoMercadoPago({
      pagoId: input.pagoId,
      estadoMp: input.estado,
      metadata: { simuladoEnSandbox: true },
    });
  }
}

