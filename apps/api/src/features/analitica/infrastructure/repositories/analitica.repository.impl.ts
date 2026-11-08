import { Prisma } from '@prisma/client';
import { prisma } from '@core/infrastructure/database/prisma.service.js';
import type {
  MetricasNegocioResponseDTO,
  MetricasNegocioResumenDTO,
  MetricasPorOrigenDTO,
  MetricasPorSucursalDTO,
  MetricasPuntoTemporalDTO,
  MetricasTopPublicacionDTO,
  TipoEventoAnalitica,
} from '@mi-alberdi/shared';
import type {
  GetMetricasParams,
  IAnaliticaRepository,
  NegocioMetadata,
  RegistrarEventoData,
} from '../../domain/repositories/IAnaliticaRepository.js';

export class AnaliticaRepositoryImpl implements IAnaliticaRepository {
  async findNegocioById(id: string): Promise<NegocioMetadata | null> {
    return prisma.negocio.findUnique({
      where: { id },
      select: {
        id: true,
        nombreComercial: true,
        propietarioId: true,
      },
    });
  }

  async findPublicacionById(id: string): Promise<{ id: string; negocioId: string } | null> {
    return prisma.publicacion.findUnique({
      where: { id },
      select: {
        id: true,
        negocioId: true,
      },
    });
  }

  async findUbicacionById(id: string): Promise<{ id: string; negocioId: string } | null> {
    return prisma.ubicacionNegocio.findUnique({
      where: { id },
      select: {
        id: true,
        negocioId: true,
      },
    });
  }

  async findReelById(id: string): Promise<{ id: string; negocioId: string } | null> {
    return prisma.reelHistoria.findUnique({
      where: { id },
      select: {
        id: true,
        negocioId: true,
      },
    });
  }

  async registrarEvento(data: RegistrarEventoData): Promise<{ id: string; creadoEn: Date }> {
    const evento = await prisma.eventoAnalitica.create({
      data: {
        negocioId: data.negocioId,
        publicacionId: data.publicacionId ?? null,
        ubicacionId: data.ubicacionId ?? null,
        reelId: data.reelId ?? null,
        tipoEvento: data.tipoEvento as any,
        origen: data.origen ?? null,
        dispositivoHash: data.dispositivoHash ?? null,
      },
      select: {
        id: true,
        creadoEn: true,
      },
    });

    // Efectos secundarios asíncronos y no bloqueantes
    if (data.reelId) {
      if (data.tipoEvento === 'vista_reel') {
        prisma.reelHistoria
          .update({
            where: { id: data.reelId },
            data: { vistasContador: { increment: 1 } },
          })
          .catch(() => undefined);
      } else if (data.tipoEvento === 'clic_whatsapp') {
        prisma.reelHistoria
          .update({
            where: { id: data.reelId },
            data: { clicsWhatsappContador: { increment: 1 } },
          })
          .catch(() => undefined);
      }
    }

    // Actualizar última actividad del negocio para ranking ponderado
    prisma.negocio
      .update({
        where: { id: data.negocioId },
        data: { ultimaActividadEn: new Date() },
      })
      .catch(() => undefined);

    return evento;
  }

  async registrarEventosBatch(eventos: RegistrarEventoData[]): Promise<{ count: number }> {
    const result = await prisma.eventoAnalitica.createMany({
      data: eventos.map((ev) => ({
        negocioId: ev.negocioId,
        publicacionId: ev.publicacionId ?? null,
        ubicacionId: ev.ubicacionId ?? null,
        reelId: ev.reelId ?? null,
        tipoEvento: ev.tipoEvento as any,
        origen: ev.origen ?? null,
        dispositivoHash: ev.dispositivoHash ?? null,
      })),
    });

    // Actualizar timestamp del negocio del primer evento si existe
    if (eventos.length > 0 && eventos[0]?.negocioId) {
      prisma.negocio
        .update({
          where: { id: eventos[0].negocioId },
          data: { ultimaActividadEn: new Date() },
        })
        .catch(() => undefined);
    }

    return { count: result.count };
  }

  async getMetricasNegocio(params: GetMetricasParams): Promise<MetricasNegocioResponseDTO> {
    const negocio = await this.findNegocioById(params.negocioId);
    if (!negocio) {
      throw new Error('Negocio no encontrado');
    }

    const whereBase: Prisma.EventoAnaliticaWhereInput = {
      negocioId: params.negocioId,
      creadoEn: {
        gte: params.desde,
        lte: params.hasta,
      },
      ...(params.ubicacionId ? { ubicacionId: params.ubicacionId } : {}),
    };

    // 1. Resumen por tipo de evento
    const conteosPorTipo = await prisma.eventoAnalitica.groupBy({
      by: ['tipoEvento'],
      where: whereBase,
      _count: { id: true },
    });

    const mapaConteo: Record<string, number> = {};
    let totalInteracciones = 0;

    for (const item of conteosPorTipo) {
      const count = item._count.id;
      mapaConteo[item.tipoEvento] = count;
      totalInteracciones += count;
    }

    const totalVistasNegocio = mapaConteo['vista_negocio'] ?? 0;
    const totalVistasPublicaciones = mapaConteo['vista_publicacion'] ?? 0;
    const totalClicsWhatsapp = mapaConteo['clic_whatsapp'] ?? 0;
    const totalClicsTelefono = mapaConteo['clic_telefono'] ?? 0;
    const totalClicsRedSocial = mapaConteo['clic_red_social'] ?? 0;
    const totalEscaneosQr = mapaConteo['escaneo_qr'] ?? 0;
    const totalVistasReel = mapaConteo['vista_reel'] ?? 0;
    const totalConversiones = totalClicsWhatsapp + totalClicsTelefono + totalEscaneosQr;

    const resumen: MetricasNegocioResumenDTO = {
      totalVistasNegocio,
      totalVistasPublicaciones,
      totalClicsWhatsapp,
      totalClicsTelefono,
      totalClicsRedSocial,
      totalEscaneosQr,
      totalVistasReel,
      totalConversiones,
      totalInteracciones,
    };

    // 2. Desglose por sucursal
    const sucursales = await prisma.ubicacionNegocio.findMany({
      where: { negocioId: params.negocioId },
      select: { id: true, nombreSucursal: true, esPrincipal: true },
      orderBy: [{ esPrincipal: 'desc' }, { nombreSucursal: 'asc' }],
    });

    const eventosPorSucursalYTipo = await prisma.eventoAnalitica.groupBy({
      by: ['ubicacionId', 'tipoEvento'],
      where: whereBase,
      _count: { id: true },
    });

    const sucursalesMap = new Map<string | null, MetricasPorSucursalDTO>();

    // Inicializar mapa con todas las sucursales del negocio
    for (const suc of sucursales) {
      sucursalesMap.set(suc.id, {
        ubicacionId: suc.id,
        nombreSucursal: suc.nombreSucursal ?? (suc.esPrincipal ? 'Casa Central' : 'Sucursal'),
        totalVistas: 0,
        totalClicsWhatsapp: 0,
        totalEscaneosQr: 0,
        totalEventos: 0,
      });
    }

    // Agregar bucket para eventos sin ubicación específica
    sucursalesMap.set(null, {
      ubicacionId: null,
      nombreSucursal: 'General / Perfil principal',
      totalVistas: 0,
      totalClicsWhatsapp: 0,
      totalEscaneosQr: 0,
      totalEventos: 0,
    });

    for (const row of eventosPorSucursalYTipo) {
      const uId = row.ubicacionId;
      let sucStat = sucursalesMap.get(uId);
      if (!sucStat) {
        sucStat = {
          ubicacionId: uId,
          nombreSucursal: 'Sucursal no registrada',
          totalVistas: 0,
          totalClicsWhatsapp: 0,
          totalEscaneosQr: 0,
          totalEventos: 0,
        };
        sucursalesMap.set(uId, sucStat);
      }

      const count = row._count.id;
      sucStat.totalEventos += count;

      if (row.tipoEvento === 'vista_negocio' || row.tipoEvento === 'vista_publicacion') {
        sucStat.totalVistas += count;
      } else if (row.tipoEvento === 'clic_whatsapp') {
        sucStat.totalClicsWhatsapp += count;
      } else if (row.tipoEvento === 'escaneo_qr') {
        sucStat.totalEscaneosQr += count;
      }
    }

    const porSucursal = Array.from(sucursalesMap.values()).filter(
      (s) => s.totalEventos > 0 || s.ubicacionId !== null,
    );

    // 3. Desglose por origen
    const origenRows = await prisma.eventoAnalitica.groupBy({
      by: ['origen'],
      where: {
        ...whereBase,
        origen: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const porOrigen: MetricasPorOrigenDTO[] = origenRows.map((r) => ({
      origen: r.origen ?? 'directo',
      total: r._count.id,
    }));

    // 4. Serie temporal agrupada por fecha (YYYY-MM-DD en hora de Argentina)
    const ubicacionFilterSql = params.ubicacionId
      ? Prisma.sql`AND ubicacion_id = ${params.ubicacionId}::uuid`
      : Prisma.empty;

    const temporalRaw = await prisma.$queryRaw<
      Array<{
        fecha: string;
        tipo_evento: string;
        total: number;
      }>
    >`
      SELECT TO_CHAR(creado_en AT TIME ZONE 'America/Argentina/Buenos_Aires', 'YYYY-MM-DD') AS fecha,
             tipo_evento,
             COUNT(*)::int AS total
      FROM eventos_analitica
      WHERE negocio_id = ${params.negocioId}::uuid
        AND creado_en >= ${params.desde}
        AND creado_en <= ${params.hasta}
        ${ubicacionFilterSql}
      GROUP BY 1, 2
      ORDER BY 1 ASC
    `;

    const serieTemporalMap = new Map<string, MetricasPuntoTemporalDTO>();

    for (const row of temporalRaw) {
      if (!serieTemporalMap.has(row.fecha)) {
        serieTemporalMap.set(row.fecha, {
          fecha: row.fecha,
          vistas: 0,
          clicsWhatsapp: 0,
          escaneosQr: 0,
          otros: 0,
        });
      }

      const punto = serieTemporalMap.get(row.fecha)!;
      const count = Number(row.total);

      if (row.tipo_evento === 'vista_negocio' || row.tipo_evento === 'vista_publicacion') {
        punto.vistas += count;
      } else if (row.tipo_evento === 'clic_whatsapp') {
        punto.clicsWhatsapp += count;
      } else if (row.tipo_evento === 'escaneo_qr') {
        punto.escaneosQr += count;
      } else {
        punto.otros += count;
      }
    }

    const serieTemporal = Array.from(serieTemporalMap.values());

    // 5. Top 5 publicaciones con más vistas y clics
    const topPublicacionesRaw = await prisma.$queryRaw<
      Array<{
        publicacionId: string;
        titulo: string;
        vistas: number;
        clicsWhatsapp: number;
      }>
    >`
      SELECT p.id AS "publicacionId",
             p.titulo,
             COUNT(CASE WHEN e.tipo_evento = 'vista_publicacion' THEN 1 END)::int AS vistas,
             COUNT(CASE WHEN e.tipo_evento = 'clic_whatsapp' THEN 1 END)::int AS "clicsWhatsapp"
      FROM eventos_analitica e
      JOIN publicaciones p ON p.id = e.publicacion_id
      WHERE e.negocio_id = ${params.negocioId}::uuid
        AND e.creado_en >= ${params.desde}
        AND e.creado_en <= ${params.hasta}
        ${params.ubicacionId ? Prisma.sql`AND e.ubicacion_id = ${params.ubicacionId}::uuid` : Prisma.empty}
      GROUP BY p.id, p.titulo
      ORDER BY vistas DESC, "clicsWhatsapp" DESC
      LIMIT 5
    `;

    const topPublicaciones: MetricasTopPublicacionDTO[] = topPublicacionesRaw.map((p) => ({
      publicacionId: p.publicacionId,
      titulo: p.titulo,
      vistas: Number(p.vistas),
      clicsWhatsapp: Number(p.clicsWhatsapp),
    }));

    return {
      negocioId: negocio.id,
      nombreComercial: negocio.nombreComercial,
      periodo: params.periodoNombre,
      rango: {
        desde: params.desde.toISOString(),
        hasta: params.hasta.toISOString(),
      },
      resumen,
      porSucursal,
      porOrigen,
      serieTemporal,
      topPublicaciones,
    };
  }
}
