import { ForbiddenError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type { CanjearCodigoPromoInput, MembresiaDTO, CodigoPlan } from '@mi-alberdi/shared';
import type { IMembresiasRepository } from '../../domain/repositories/IMembresiasRepository.js';

export interface CanjearCodigoPromoResult {
  mensaje: string;
  planOtorgado: CodigoPlan;
  diasBonificados: number;
  membresia: MembresiaDTO;
}

export class CanjearCodigoPromoUseCase {
  constructor(private readonly repository: IMembresiasRepository) {}

  async execute(
    usuarioId: string,
    rol: string,
    input: CanjearCodigoPromoInput,
  ): Promise<CanjearCodigoPromoResult> {
    const ownerId = await this.repository.getNegocioOwnerId(input.negocioId);
    if (!ownerId) {
      throw NotFoundError('Negocio no encontrado');
    }

    const esAdmin = rol === 'admin' || rol === 'administrador' || rol === 'moderador';
    if (ownerId !== usuarioId && !esAdmin) {
      throw ForbiddenError('No tienes permisos para canjear promociones en este negocio');
    }

    const resultado = await this.repository.canjearCodigoPromo({
      negocioId: input.negocioId,
      usuarioId,
      codigo: input.codigo,
    });

    return {
      mensaje: `¡Código promocional canjeado con éxito! Se activó el Plan ${resultado.planOtorgado.toUpperCase()} por ${resultado.dias} días.`,
      planOtorgado: resultado.planOtorgado,
      diasBonificados: resultado.dias,
      membresia: resultado.membresia,
    };
  }
}

