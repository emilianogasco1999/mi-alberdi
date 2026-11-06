import { prisma } from '@core/infrastructure/database/prisma.service.js';
import { ClientError, ForbiddenError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type { PublicacionDTO } from '@mi-alberdi/shared';
import type { ICatalogoRepository } from '../../domain/repositories/ICatalogoRepository.js';

export class ToggleDestacadaUseCase {
  constructor(private readonly repository: ICatalogoRepository) {}

  async execute(
    id: string,
    usuarioId: string,
    rol: string,
    esDestacada: boolean,
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
      throw ForbiddenError('No tenés permisos para gestionar este catálogo');
    }

    if (esDestacada) {
      if (negocio.cuposDestacadosMax === 0) {
        throw ClientError(
          `Tu plan actual (${negocio.planActual.toUpperCase()}) no incluye Estrellas de Vidriera para destacar productos o servicios. Mejorá a Plan Plata (1 estrella) u Oro (3 estrellas) para aparecer en lo más alto.`,
          403,
        );
      }

      // Contar cuántas publicaciones ya están destacadas (excluyendo la actual)
      const destacadasActuales = await prisma.publicacion.count({
        where: {
          negocioId: negocio.id,
          esDestacada: true,
          id: { not: id },
        },
      });

      if (destacadasActuales >= negocio.cuposDestacadosMax) {
        throw ClientError(
          `Cupos de destacados agotados (${destacadasActuales}/${negocio.cuposDestacadosMax}). Tu plan actual permite hasta ${negocio.cuposDestacadosMax} publicación(es) destacada(s) simultáneamente. Desmarcá otra publicación para liberar una estrella o mejorá al Plan Oro.`,
          403,
        );
      }
    }

    return this.repository.toggleDestacada(id, esDestacada);
  }
}
