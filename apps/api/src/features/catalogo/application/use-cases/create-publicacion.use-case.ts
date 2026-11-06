import { prisma } from '@core/infrastructure/database/prisma.service.js';
import { ClientError, ForbiddenError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type { CreatePublicacionInput, PublicacionDTO } from '@mi-alberdi/shared';
import type { ICatalogoRepository } from '../../domain/repositories/ICatalogoRepository.js';
import { generateUniquePublicacionSlug } from '../helpers/slug.helper.js';

export class CreatePublicacionUseCase {
  constructor(private readonly repository: ICatalogoRepository) {}

  async execute(
    usuarioId: string,
    rol: string,
    input: CreatePublicacionInput,
  ): Promise<PublicacionDTO> {
    const negocio = await prisma.negocio.findUnique({
      where: { id: input.negocioId },
      include: { plan: true },
    });

    if (!negocio) {
      throw NotFoundError('El perfil de negocio no existe');
    }

    if (negocio.propietarioId !== usuarioId && rol !== 'admin') {
      throw ForbiddenError('No tenés permisos para publicar en este negocio');
    }

    // 1. Validar límite de publicaciones activas según el plan
    const totalActivas = await this.repository.countActivasByNegocio(input.negocioId);
    if (totalActivas >= negocio.plan.maxPublicaciones) {
      throw ClientError(
        `Límite de publicaciones alcanzado (${totalActivas}/${negocio.plan.maxPublicaciones}). Tu plan actual (${negocio.planActual.toUpperCase()}) no permite agregar más ítems. Mejorá tu plan para ampliar tu catálogo.`,
        403,
      );
    }

    // 2. Validar límite de imágenes por publicación según el plan
    if (input.imagenes && input.imagenes.length > negocio.plan.maxFotosPorPublicacion) {
      throw ClientError(
        `Tu plan actual (${negocio.planActual.toUpperCase()}) permite un máximo de ${negocio.plan.maxFotosPorPublicacion} fotos por publicación. Has enviado ${input.imagenes.length}.`,
        400,
      );
    }

    // 3. Lógica de Cupos de Destacados (Opción B Híbrida)
    let esDestacadaFinal = false;
    if (negocio.cuposDestacadosMax > 0) {
      const totalDestacadas = await this.repository.countDestacadasByNegocio(input.negocioId);
      if (totalDestacadas < negocio.cuposDestacadosMax) {
        // Si el usuario lo pidió o si tiene cupos libres, auto-asignamos la estrella
        esDestacadaFinal = input.esDestacada ?? true;
      }
    }

    const slug = await generateUniquePublicacionSlug(input.titulo, this.repository);

    return this.repository.create(input, slug, esDestacadaFinal);
  }
}
