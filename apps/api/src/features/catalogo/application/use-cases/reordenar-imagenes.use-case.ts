import { prisma } from '@core/infrastructure/database/prisma.service.js';
import { ForbiddenError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type { ImagenPublicacionDTO, ReordenarImagenesInput } from '@mi-alberdi/shared';
import type { ICatalogoRepository } from '../../domain/repositories/ICatalogoRepository.js';

export class ReordenarImagenesUseCase {
  constructor(private readonly repository: ICatalogoRepository) {}

  async execute(
    publicacionId: string,
    usuarioId: string,
    rol: string,
    input: ReordenarImagenesInput,
  ): Promise<ImagenPublicacionDTO[]> {
    const publicacion = await this.repository.findById(publicacionId);
    if (!publicacion) {
      throw NotFoundError('La publicación no existe');
    }

    const negocio = await prisma.negocio.findUnique({
      where: { id: publicacion.negocioId },
      select: { propietarioId: true },
    });

    if (!negocio || (negocio.propietarioId !== usuarioId && rol !== 'admin')) {
      throw ForbiddenError('No tenés permisos para gestionar las fotos de esta publicación');
    }

    return this.repository.reordenarImagenes(publicacionId, input.imagenes);
  }
}
