import { prisma } from '@core/infrastructure/database/prisma.service.js';
import type { Prisma } from '@prisma/client';
import type {
  ListadoOpinionesResponseDTO,
  OpinionDTO,
  QueryOpinionesNegocioInput,
  UpdateOpinionInput,
} from '@mi-alberdi/shared';
import type {
  CreateOpinionData,
  IOpinionesRepository,
  NegocioMetadata,
} from '../../domain/repositories/IOpinionesRepository.js';

export class OpinionesRepositoryImpl implements IOpinionesRepository {
  private mapToDTO(opinion: any, publicacionTitulo?: string | null): OpinionDTO {
    return {
      id: opinion.id,
      negocioId: opinion.negocioId,
      publicacionId: opinion.publicacionId ?? null,
      publicacionTitulo: publicacionTitulo ?? opinion.publicacion?.titulo ?? null,
      usuarioId: opinion.usuarioId ?? null,
      nombreAutorVisible: opinion.nombreAutorVisible,
      puntuacion: opinion.puntuacion,
      comentario: opinion.comentario ?? null,
      fotoEvidenciaUrl: opinion.fotoEvidenciaUrl ?? null,
      respuestaComerciante: opinion.respuestaComerciante ?? null,
      respondidoEn: opinion.respondidoEn ? opinion.respondidoEn.toISOString() : null,
      creadoEn: opinion.creadoEn.toISOString(),
      actualizadoEn: opinion.actualizadoEn.toISOString(),
    };
  }

  async findUsuarioById(
    id: string,
  ): Promise<{ id: string; nombre: string; apellido: string | null } | null> {
    return prisma.perfilUsuario.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        apellido: true,
      },
    });
  }

  async findNegocioById(id: string): Promise<NegocioMetadata | null> {
    const negocio = await prisma.negocio.findUnique({
      where: { id },
      select: {
        id: true,
        nombreComercial: true,
        propietarioId: true,
        ratingPromedio: true,
        totalOpiniones: true,
      },
    });

    if (!negocio) return null;

    return {
      id: negocio.id,
      nombreComercial: negocio.nombreComercial,
      propietarioId: negocio.propietarioId,
      ratingPromedio: Number(negocio.ratingPromedio),
      totalOpiniones: negocio.totalOpiniones,
    };
  }

  async findPublicacionById(
    id: string,
  ): Promise<{ id: string; negocioId: string; titulo: string } | null> {
    return prisma.publicacion.findUnique({
      where: { id },
      select: {
        id: true,
        negocioId: true,
        titulo: true,
      },
    });
  }

  async findOpinionById(
    id: string,
  ): Promise<(OpinionDTO & { propietarioNegocioId: string }) | null> {
    const opinion = await prisma.opinion.findUnique({
      where: { id },
      include: {
        negocio: { select: { propietarioId: true } },
        publicacion: { select: { titulo: true } },
      },
    });

    if (!opinion) return null;

    return {
      ...this.mapToDTO(opinion, opinion.publicacion?.titulo),
      propietarioNegocioId: opinion.negocio.propietarioId,
    };
  }

  async findOpinionByUsuarioYNegocio(
    usuarioId: string,
    negocioId: string,
  ): Promise<OpinionDTO | null> {
    const opinion = await prisma.opinion.findFirst({
      where: {
        usuarioId,
        negocioId,
        visible: true,
      },
      include: {
        publicacion: { select: { titulo: true } },
      },
    });

    if (!opinion) return null;

    return this.mapToDTO(opinion, opinion.publicacion?.titulo);
  }

  async createOpinion(data: CreateOpinionData): Promise<OpinionDTO> {
    return prisma.$transaction(async (tx) => {
      const created = await tx.opinion.create({
        data: {
          negocioId: data.negocioId,
          publicacionId: data.publicacionId ?? null,
          usuarioId: data.usuarioId,
          dispositivoId: data.dispositivoId ?? null,
          nombreAutorVisible: data.nombreAutorVisible,
          puntuacion: data.puntuacion,
          comentario: data.comentario ?? null,
          fotoEvidenciaUrl: data.fotoEvidenciaUrl ?? null,
          visible: true,
        },
        include: {
          publicacion: { select: { titulo: true } },
        },
      });

      // Recalcular métricas en el negocio
      const aggregate = await tx.opinion.aggregate({
        where: {
          negocioId: data.negocioId,
          visible: true,
        },
        _avg: { puntuacion: true },
        _count: { id: true },
      });

      const ratingPromedio = Number((aggregate._avg.puntuacion ?? 0).toFixed(2));
      const totalOpiniones = aggregate._count.id;

      await tx.negocio.update({
        where: { id: data.negocioId },
        data: {
          ratingPromedio,
          totalOpiniones,
          ultimaActividadEn: new Date(),
        },
      });

      return this.mapToDTO(created, created.publicacion?.titulo);
    });
  }

  async updateOpinion(id: string, data: UpdateOpinionInput): Promise<OpinionDTO> {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.opinion.update({
        where: { id },
        data: {
          ...(data.puntuacion !== undefined ? { puntuacion: data.puntuacion } : {}),
          ...(data.comentario !== undefined ? { comentario: data.comentario } : {}),
          ...(data.fotoEvidenciaUrl !== undefined
            ? { fotoEvidenciaUrl: data.fotoEvidenciaUrl }
            : {}),
        },
        include: {
          publicacion: { select: { titulo: true } },
        },
      });

      if (data.puntuacion !== undefined) {
        const aggregate = await tx.opinion.aggregate({
          where: {
            negocioId: updated.negocioId,
            visible: true,
          },
          _avg: { puntuacion: true },
          _count: { id: true },
        });

        const ratingPromedio = Number((aggregate._avg.puntuacion ?? 0).toFixed(2));
        const totalOpiniones = aggregate._count.id;

        await tx.negocio.update({
          where: { id: updated.negocioId },
          data: {
            ratingPromedio,
            totalOpiniones,
            ultimaActividadEn: new Date(),
          },
        });
      }

      return this.mapToDTO(updated, updated.publicacion?.titulo);
    });
  }

  async responderOpinion(id: string, respuesta: string): Promise<OpinionDTO> {
    const updated = await prisma.opinion.update({
      where: { id },
      data: {
        respuestaComerciante: respuesta,
        respondidoEn: new Date(),
      },
      include: {
        publicacion: { select: { titulo: true } },
      },
    });

    return this.mapToDTO(updated, updated.publicacion?.titulo);
  }

  async eliminarRespuesta(id: string): Promise<OpinionDTO> {
    const updated = await prisma.opinion.update({
      where: { id },
      data: {
        respuestaComerciante: null,
        respondidoEn: null,
      },
      include: {
        publicacion: { select: { titulo: true } },
      },
    });

    return this.mapToDTO(updated, updated.publicacion?.titulo);
  }

  async deleteOpinion(id: string, negocioId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.opinion.delete({
        where: { id },
      });

      const aggregate = await tx.opinion.aggregate({
        where: {
          negocioId,
          visible: true,
        },
        _avg: { puntuacion: true },
        _count: { id: true },
      });

      const ratingPromedio = Number((aggregate._avg.puntuacion ?? 0).toFixed(2));
      const totalOpiniones = aggregate._count.id;

      await tx.negocio.update({
        where: { id: negocioId },
        data: {
          ratingPromedio,
          totalOpiniones,
        },
      });
    });
  }

  async getOpinionesNegocio(
    negocioId: string,
    query: QueryOpinionesNegocioInput,
  ): Promise<ListadoOpinionesResponseDTO> {
    const negocio = await prisma.negocio.findUnique({
      where: { id: negocioId },
      select: { ratingPromedio: true, totalOpiniones: true },
    });

    const pagina = query.pagina;
    const limite = query.limite;
    const skip = (pagina - 1) * limite;

    const where: Prisma.OpinionWhereInput = {
      negocioId,
      visible: true,
      ...(query.publicacionId ? { publicacionId: query.publicacionId } : {}),
      ...(query.puntuacion ? { puntuacion: query.puntuacion } : {}),
    };

    let orderBy: Prisma.OpinionOrderByWithRelationInput = { creadoEn: 'desc' };
    if (query.orden === 'mejores') {
      orderBy = { puntuacion: 'desc' };
    } else if (query.orden === 'peores') {
      orderBy = { puntuacion: 'asc' };
    }

    const [total, rows, distribucionRaw] = await Promise.all([
      prisma.opinion.count({ where }),
      prisma.opinion.findMany({
        where,
        skip,
        take: limite,
        orderBy: [orderBy, { creadoEn: 'desc' }],
        include: {
          publicacion: { select: { titulo: true } },
        },
      }),
      prisma.opinion.groupBy({
        by: ['puntuacion'],
        where: { negocioId, visible: true },
        _count: { id: true },
      }),
    ]);

    const distribucion = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const item of distribucionRaw) {
      if (item.puntuacion in distribucion) {
        distribucion[item.puntuacion as keyof typeof distribucion] = item._count.id;
      }
    }

    return {
      opiniones: rows.map((r) => this.mapToDTO(r, r.publicacion?.titulo)),
      ratingPromedio: Number(negocio?.ratingPromedio ?? 0),
      totalOpiniones: negocio?.totalOpiniones ?? 0,
      distribucion,
      paginacion: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite) || 1,
      },
    };
  }

  async recalcularRatingNegocio(
    negocioId: string,
  ): Promise<{ ratingPromedio: number; totalOpiniones: number }> {
    const aggregate = await prisma.opinion.aggregate({
      where: {
        negocioId,
        visible: true,
      },
      _avg: { puntuacion: true },
      _count: { id: true },
    });

    const ratingPromedio = Number((aggregate._avg.puntuacion ?? 0).toFixed(2));
    const totalOpiniones = aggregate._count.id;

    await prisma.negocio.update({
      where: { id: negocioId },
      data: {
        ratingPromedio,
        totalOpiniones,
      },
    });

    return { ratingPromedio, totalOpiniones };
  }
}
