import { prisma } from '@core/infrastructure/database/prisma.service.js';
import { ForbiddenError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type { PublicacionDTO, UpdatePublicacionInput } from '@mi-alberdi/shared';
import type { ICatalogoRepository } from '../../domain/repositories/ICatalogoRepository.js';

export class UpdatePublicacionUseCase {
  constructor(private readonly repository: ICatalogoRepository) {}

  async execute(
    id: string,
    usuarioId: string,
    rol: string,
    input: UpdatePublicacionInput,
  ): Promise<PublicacionDTO> {
    const publicacion = await this.repository.findById(id);
    if (!publicacion) {
      throw NotFoundError('La publicación no existe');
    }

    const negocio = await prisma.negocio.findUnique({
      where: { id: publicacion.negocioId },
      select: { propietarioId: true },
    });

    if (!negocio || (negocio.propietarioId !== usuarioId && rol !== 'admin')) {
      throw ForbiddenError('No tenés permisos para modificar esta publicación');
    }

    return this.repository.update(id, input);
  }
}
