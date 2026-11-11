import { prisma } from '@core/infrastructure/database/prisma.service.js';
import { ClientError, ForbiddenError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type { EstadoPublicacion, PublicacionDTO } from '@mi-alberdi/shared';
import type { ICatalogoRepository } from '../../domain/repositories/ICatalogoRepository.js';

export class CambiarEstadoPublicacionUseCase {
  constructor(private readonly repository: ICatalogoRepository) {}

  async execute(
    id: string,
    usuarioId: string,
    rol: string,
    nuevoEstado: 'borrador' | 'activa' | 'pausada',
  ): Promise<PublicacionDTO> {
    const publicacion = await this.repository.findById(id);
    if (!publicacion) {
      throw NotFoundError('La publicación no existe');
    }

    const negocio = await prisma.negocio.findUnique({
      where: { id: publicacion.negocioId },
      include: { plan: true },
    });

    if (!negocio) {
      throw NotFoundError('El perfil de negocio no existe');
    }

    if (negocio.propietarioId !== usuarioId && rol !== 'admin') {
      throw ForbiddenError('No tenés permisos para cambiar el estado de esta publicación');
    }

    if (nuevoEstado === 'activa' && publicacion.estado !== 'activa') {
      const totalActivas = await this.repository.countActivasByNegocio(negocio.id);
      if (totalActivas >= negocio.plan.maxPublicaciones) {
        throw ClientError(
          `No podés activar esta publicación. Has alcanzado el límite de publicaciones activas de tu plan (${totalActivas}/${negocio.plan.maxPublicaciones}). Pausá otra publicación o mejorá tu plan.`,
          403,
        );
      }
    }

    return this.repository.cambiarEstado(id, nuevoEstado as EstadoPublicacion);
  }
}
