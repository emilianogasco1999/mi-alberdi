import { prisma } from '@core/infrastructure/database/prisma.service.js';
import { ForbiddenError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type { ICatalogoRepository } from '../../domain/repositories/ICatalogoRepository.js';

export class DeletePublicacionUseCase {
  constructor(private readonly repository: ICatalogoRepository) {}

  async execute(id: string, usuarioId: string, rol: string): Promise<void> {
    const publicacion = await this.repository.findById(id);
    if (!publicacion) {
      throw NotFoundError('La publicación no existe');
    }

    const negocio = await prisma.negocio.findUnique({
      where: { id: publicacion.negocioId },
      select: { propietarioId: true },
    });

    if (!negocio || (negocio.propietarioId !== usuarioId && rol !== 'admin')) {
      throw ForbiddenError('No tenés permisos para eliminar esta publicación');
    }

    await this.repository.delete(id);
  }
}
