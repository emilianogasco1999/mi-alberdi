import { prisma } from '@core/infrastructure/database/prisma.service.js';
import type { Prisma } from '@prisma/client';
import type {
  CrearFeedbackInput,
  CrearReporteInput,
  EstadoModeracion,
  EstadoVerificacion,
  FeedbackPlataformaDTO,
  ListadoPaginadoDTO,
  QueryListadosModeracionInput,
  ReporteModeracionDTO,
  ResolverReporteInput,
  ResolverSolicitudVerificacionInput,
  SolicitarVerificacionInput,
  SolicitudVerificacionDTO,
} from '@mi-alberdi/shared';
import type {
  IModeracionRepository,
  NegocioMetadata,
} from '../../domain/repositories/IModeracionRepository.js';

export class ModeracionRepositoryImpl implements IModeracionRepository {
  private mapVerificacionToDTO(item: any): SolicitudVerificacionDTO {
    return {
      id: item.id,
      negocioId: item.negocioId,
      nombreNegocio: item.negocio?.nombreComercial ?? 'Negocio',
      solicitanteId: item.solicitanteId,
      documentoFrenteUrl: item.documentoFrenteUrl ?? null,
      comprobanteComercioUrl: item.comprobanteComercioUrl ?? null,
      notasSolicitante: item.notasSolicitante ?? null,
      estado: item.estado as EstadoVerificacion,
      revisadoPorId: item.revisadoPorId ?? null,
      motivoRechazo: item.motivoRechazo ?? null,
      resueltoEn: item.resueltoEn ? item.resueltoEn.toISOString() : null,
      creadoEn: item.creadoEn.toISOString(),
      actualizadoEn: item.actualizadoEn.toISOString(),
    };
  }

  private mapReporteToDTO(item: any): ReporteModeracionDTO {
    return {
      id: item.id,
      negocioId: item.negocioId ?? null,
      nombreNegocio: item.negocio?.nombreComercial ?? null,
      publicacionId: item.publicacionId ?? null,
      tituloPublicacion: item.publicacion?.titulo ?? null,
      opinionId: item.opinionId ?? null,
      reportanteId: item.reportanteId ?? null,
      motivo: item.motivo,
      detalle: item.detalle ?? null,
      estado: item.estado as EstadoModeracion,
      revisadoPorId: item.revisadoPorId ?? null,
      resolucionNota: item.resolucionNota ?? null,
      creadoEn: item.creadoEn.toISOString(),
      actualizadoEn: item.actualizadoEn.toISOString(),
    };
  }

  private mapFeedbackToDTO(item: any): FeedbackPlataformaDTO {
    return {
      id: item.id,
      usuarioId: item.usuarioId ?? null,
      nombreCompleto: item.nombreCompleto ?? null,
      email: item.email ?? null,
      mensaje: item.mensaje,
      notasAdmin: item.notasAdmin ?? null,
      leido: item.leido,
      creadoEn: item.creadoEn.toISOString(),
    };
  }

  async findNegocioById(id: string): Promise<NegocioMetadata | null> {
    const negocio = await prisma.negocio.findUnique({
      where: { id },
      select: {
        id: true,
        nombreComercial: true,
        propietarioId: true,
        verificacion: true,
      },
    });

    if (!negocio) return null;

    return {
      id: negocio.id,
      nombreComercial: negocio.nombreComercial,
      propietarioId: negocio.propietarioId,
      verificacion: negocio.verificacion,
    };
  }

  async findPublicacionById(id: string): Promise<{ id: string; titulo: string } | null> {
    return prisma.publicacion.findUnique({
      where: { id },
      select: { id: true, titulo: true },
    });
  }

  async findOpinionById(id: string): Promise<{ id: string; negocioId: string } | null> {
    return prisma.opinion.findUnique({
      where: { id },
      select: { id: true, negocioId: true },
    });
  }

  async findPendingVerificacionByNegocio(
    negocioId: string,
  ): Promise<SolicitudVerificacionDTO | null> {
    const solicitud = await prisma.solicitudVerificacion.findFirst({
      where: {
        negocioId,
        estado: 'pendiente',
      },
      include: {
        negocio: { select: { nombreComercial: true } },
      },
    });

    if (!solicitud) return null;

    return this.mapVerificacionToDTO(solicitud);
  }

  async findVerificacionById(id: string): Promise<SolicitudVerificacionDTO | null> {
    const solicitud = await prisma.solicitudVerificacion.findUnique({
      where: { id },
      include: {
        negocio: { select: { nombreComercial: true } },
      },
    });

    if (!solicitud) return null;

    return this.mapVerificacionToDTO(solicitud);
  }

  async crearSolicitudVerificacion(
    data: SolicitarVerificacionInput & { solicitanteId: string },
  ): Promise<SolicitudVerificacionDTO> {
    return prisma.$transaction(async (tx) => {
      const created = await tx.solicitudVerificacion.create({
        data: {
          negocioId: data.negocioId,
          solicitanteId: data.solicitanteId,
          documentoFrenteUrl: data.documentoFrenteUrl ?? null,
          comprobanteComercioUrl: data.comprobanteComercioUrl ?? null,
          notasSolicitante: data.notasSolicitante ?? null,
          estado: 'pendiente',
        },
        include: {
          negocio: { select: { nombreComercial: true } },
        },
      });

      await tx.negocio.update({
        where: { id: data.negocioId },
        data: { verificacion: 'pendiente' },
      });

      return this.mapVerificacionToDTO(created);
    });
  }

  async resolverSolicitudVerificacion(
    id: string,
    data: ResolverSolicitudVerificacionInput,
    revisadoPorId: string,
  ): Promise<SolicitudVerificacionDTO> {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.solicitudVerificacion.update({
        where: { id },
        data: {
          estado: data.estado as any,
          motivoRechazo: data.estado === 'rechazada' ? data.motivoRechazo : null,
          revisadoPorId,
          resueltoEn: new Date(),
        },
        include: {
          negocio: { select: { nombreComercial: true } },
        },
      });

      if (data.estado === 'aprobada') {
        await tx.negocio.update({
          where: { id: updated.negocioId },
          data: {
            verificacion: 'aprobada',
            verificadoEn: new Date(),
            badgeTexto: data.badgeTexto || 'Comercio Verificado',
          },
        });
      } else {
        await tx.negocio.update({
          where: { id: updated.negocioId },
          data: {
            verificacion: 'rechazada',
            verificadoEn: null,
          },
        });
      }

      return this.mapVerificacionToDTO(updated);
    });
  }

  async getSolicitudesVerificacion(
    query: QueryListadosModeracionInput,
  ): Promise<ListadoPaginadoDTO<SolicitudVerificacionDTO>> {
    const skip = (query.pagina - 1) * query.limite;
    const where: Prisma.SolicitudVerificacionWhereInput = {
      ...(query.estado ? { estado: query.estado as any } : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.solicitudVerificacion.count({ where }),
      prisma.solicitudVerificacion.findMany({
        where,
        skip,
        take: query.limite,
        orderBy: { creadoEn: 'desc' },
        include: {
          negocio: { select: { nombreComercial: true } },
        },
      }),
    ]);

    return {
      items: rows.map((r) => this.mapVerificacionToDTO(r)),
      paginacion: {
        pagina: query.pagina,
        limite: query.limite,
        total,
        totalPaginas: Math.ceil(total / query.limite) || 1,
      },
    };
  }

  async getMisSolicitudesVerificacion(
    solicitanteId: string,
  ): Promise<SolicitudVerificacionDTO[]> {
    const rows = await prisma.solicitudVerificacion.findMany({
      where: { solicitanteId },
      orderBy: { creadoEn: 'desc' },
      include: {
        negocio: { select: { nombreComercial: true } },
      },
    });

    return rows.map((r) => this.mapVerificacionToDTO(r));
  }

  async crearReporte(
    data: CrearReporteInput & {
      reportanteId?: string | null;
      dispositivoHash?: string | null;
    },
  ): Promise<ReporteModeracionDTO> {
    const created = await prisma.reporteModeracion.create({
      data: {
        negocioId: data.negocioId ?? null,
        publicacionId: data.publicacionId ?? null,
        opinionId: data.opinionId ?? null,
        reportanteId: data.reportanteId ?? null,
        dispositivoHash: data.dispositivoHash ?? null,
        motivo: data.motivo,
        detalle: data.detalle ?? null,
        estado: 'pendiente',
      },
      include: {
        negocio: { select: { nombreComercial: true } },
        publicacion: { select: { titulo: true } },
      },
    });

    return this.mapReporteToDTO(created);
  }

  async findReporteById(id: string): Promise<ReporteModeracionDTO | null> {
    const reporte = await prisma.reporteModeracion.findUnique({
      where: { id },
      include: {
        negocio: { select: { nombreComercial: true } },
        publicacion: { select: { titulo: true } },
      },
    });

    if (!reporte) return null;

    return this.mapReporteToDTO(reporte);
  }

  async resolverReporte(
    id: string,
    data: ResolverReporteInput,
    revisadoPorId: string,
  ): Promise<ReporteModeracionDTO> {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.reporteModeracion.update({
        where: { id },
        data: {
          estado: data.estado as any,
          resolucionNota: data.resolucionNota ?? null,
          revisadoPorId,
        },
        include: {
          negocio: { select: { nombreComercial: true } },
          publicacion: { select: { titulo: true } },
        },
      });

      // Ejecutar acción punitiva de moderación si fue solicitada
      if (data.accionInfraccion === 'ocultar_publicacion' && updated.publicacionId) {
        await tx.publicacion.update({
          where: { id: updated.publicacionId },
          data: { estado: 'oculta_por_reportes' },
        });
      } else if (data.accionInfraccion === 'ocultar_opinion' && updated.opinionId) {
        const opinion = await tx.opinion.update({
          where: { id: updated.opinionId },
          data: { visible: false },
        });

        // Recalcular rating de negocio tras ocultar la opinión
        const aggregate = await tx.opinion.aggregate({
          where: { negocioId: opinion.negocioId, visible: true },
          _avg: { puntuacion: true },
          _count: { id: true },
        });

        await tx.negocio.update({
          where: { id: opinion.negocioId },
          data: {
            ratingPromedio: Number((aggregate._avg.puntuacion ?? 0).toFixed(2)),
            totalOpiniones: aggregate._count.id,
          },
        });
      } else if (data.accionInfraccion === 'pausar_negocio' && updated.negocioId) {
        await tx.negocio.update({
          where: { id: updated.negocioId },
          data: { estado: 'pausado' },
        });
      }

      return this.mapReporteToDTO(updated);
    });
  }

  async getReportes(
    query: QueryListadosModeracionInput,
  ): Promise<ListadoPaginadoDTO<ReporteModeracionDTO>> {
    const skip = (query.pagina - 1) * query.limite;
    const where: Prisma.ReporteModeracionWhereInput = {
      ...(query.estado ? { estado: query.estado as any } : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.reporteModeracion.count({ where }),
      prisma.reporteModeracion.findMany({
        where,
        skip,
        take: query.limite,
        orderBy: { creadoEn: 'desc' },
        include: {
          negocio: { select: { nombreComercial: true } },
          publicacion: { select: { titulo: true } },
        },
      }),
    ]);

    return {
      items: rows.map((r) => this.mapReporteToDTO(r)),
      paginacion: {
        pagina: query.pagina,
        limite: query.limite,
        total,
        totalPaginas: Math.ceil(total / query.limite) || 1,
      },
    };
  }

  async crearFeedback(
    data: CrearFeedbackInput & {
      usuarioId?: string | null;
      ipAddress?: string | null;
      userAgent?: string | null;
    },
  ): Promise<FeedbackPlataformaDTO> {
    const created = await prisma.feedbackPlataforma.create({
      data: {
        usuarioId: data.usuarioId ?? null,
        nombreCompleto: data.nombreCompleto ?? null,
        email: data.email ?? null,
        mensaje: data.mensaje,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
        leido: false,
      },
    });

    return this.mapFeedbackToDTO(created);
  }

  async getFeedbacks(
    query: QueryListadosModeracionInput,
  ): Promise<ListadoPaginadoDTO<FeedbackPlataformaDTO>> {
    const skip = (query.pagina - 1) * query.limite;
    const where: Prisma.FeedbackPlataformaWhereInput = {
      ...(query.estado === 'leido' ? { leido: true } : {}),
      ...(query.estado === 'no_leido' ? { leido: false } : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.feedbackPlataforma.count({ where }),
      prisma.feedbackPlataforma.findMany({
        where,
        skip,
        take: query.limite,
        orderBy: { creadoEn: 'desc' },
      }),
    ]);

    return {
      items: rows.map((r) => this.mapFeedbackToDTO(r)),
      paginacion: {
        pagina: query.pagina,
        limite: query.limite,
        total,
        totalPaginas: Math.ceil(total / query.limite) || 1,
      },
    };
  }

  async marcarFeedbackLeido(
    id: string,
    notasAdmin?: string | null,
  ): Promise<FeedbackPlataformaDTO> {
    const updated = await prisma.feedbackPlataforma.update({
      where: { id },
      data: {
        leido: true,
        ...(notasAdmin !== undefined ? { notasAdmin } : {}),
      },
    });

    return this.mapFeedbackToDTO(updated);
  }
}
