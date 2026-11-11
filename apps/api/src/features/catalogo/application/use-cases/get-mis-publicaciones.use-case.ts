import { prisma } from '@core/infrastructure/database/prisma.service.js';
import { ForbiddenError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type { PublicacionResumenDTO } from '@mi-alberdi/shared';
import type { ICatalogoRepository } from '../../domain/repositories/ICatalogoRepository.js';

export class GetMisPublicacionesUseCase {
  constructor(private readonly repository: ICatalogoRepository) {}

  async execute(
    negocioId: string,
    usuarioId: string,
    rol: string,
  ): Promise<PublicacionResumenDTO[]> {
    const negocio = await prisma.negocio.findUnique({
      where: { id: negocioId },
      select: { propietarioId: true },
    });

    if (!negocio) {
      throw NotFoundError('El perfil de negocio no existe');
    }

    if (negocio.propietarioId !== usuarioId && rol !== 'admin') {
      throw ForbiddenError('No tenés permisos para ver el catálogo de este negocio');
    }

    return this.repository.findByNegocioId(negocioId);
  }
}
