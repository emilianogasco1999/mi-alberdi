import { Prisma } from '@prisma/client';
import { prisma } from '@core/infrastructure/database/prisma.service.js';
import type {
  BuscarDescubrimientoInput,
  DestacadosPortadaDTO,
  ItemBusquedaNegocioDTO,
  ItemBusquedaPublicacionDTO,
  ResultadoBusquedaDTO,
} from '@mi-alberdi/shared';
import type { IDescubrimientoRepository } from '../../domain/repositories/IDescubrimientoRepository.js';

const formatPrismaTimeToStr = (date?: Date | null): string | null => {
  if (!date) return null;
  return date.toISOString().substring(11, 16);
};

export const checkAbiertoAhora = (
  horarios: Array<{
    diaSemana: number;
    cerrado: boolean;
    horarioCorrido: boolean;
    aperturaManana: Date | null;
    cierreManana: Date | null;
    aperturaTarde: Date | null;
    cierreTarde: Date | null;
  }>,
): boolean => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-GB', {
    timeZone: 'America/Argentina/Tucuman',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const alberdiDateStr = now.toLocaleDateString('en-CA', {
    timeZone: 'America/Argentina/Tucuman',
  });
  const alberdiDate = new Date(`${alberdiDateStr}T12:00:00Z`);
  const diaActual = alberdiDate.getUTCDay();

  const horarioHoy = horarios.find((h) => h.diaSemana === diaActual && !h.cerrado);
  if (!horarioHoy) return false;

  const mananaAbre = formatPrismaTimeToStr(horarioHoy.aperturaManana);
  const mananaCierra = formatPrismaTimeToStr(horarioHoy.cierreManana);
  const tardeAbre = formatPrismaTimeToStr(horarioHoy.aperturaTarde);
  const tardeCierra = formatPrismaTimeToStr(horarioHoy.cierreTarde);

  if (horarioHoy.horarioCorrido) {
    if (mananaAbre && mananaCierra) {
      return timeStr >= mananaAbre && timeStr <= mananaCierra;
    }
    return false;
  }

  const enTurnoManana = Boolean(
    mananaAbre && mananaCierra && timeStr >= mananaAbre && timeStr <= mananaCierra,
  );
  const enTurnoTarde = Boolean(
    tardeAbre && tardeCierra && timeStr >= tardeAbre && timeStr <= tardeCierra,
  );

  return enTurnoManana || enTurnoTarde;
};

export class DescubrimientoRepositoryImpl implements IDescubrimientoRepository {
  async getSemillaRotacion(): Promise<number> {
    const config = await prisma.configuracionSistema.findUnique({
      where: { id: 1 },
      select: { semillaRotacionRanking: true },
    });
    return config?.semillaRotacionRanking ?? 1;
  }

  async buscar(input: BuscarDescubrimientoInput): Promise<ResultadoBusquedaDTO> {
    const semilla = await this.getSemillaRotacion();
    const tipo = input.tipo ?? 'todos';
    const offset = (input.page - 1) * input.limit;
    const q = input.q && input.q.trim().length > 0 ? input.q.trim() : null;

    let negocios: ItemBusquedaNegocioDTO[] = [];
    let publicaciones: ItemBusquedaPublicacionDTO[] = [];
    let totalItems = 0;

    // 1. Búsqueda de Negocios
    if (tipo === 'todos' || tipo === 'negocios') {
      const conditions: Prisma.Sql[] = [Prisma.sql`n.estado = 'activo'`];

      if (input.rubroId) {
        conditions.push(Prisma.sql`n.rubro_principal_id = ${input.rubroId}::uuid`);
      }
      if (input.rubroSlug) {
        conditions.push(Prisma.sql`rg.slug = ${input.rubroSlug}`);
      }
      if (input.tipoPerfil) {
        conditions.push(Prisma.sql`n.tipo_perfil = ${input.tipoPerfil}::"TipoPerfilComercial"`);
      }
      if (input.atiendeADomicilio !== undefined) {
        conditions.push(Prisma.sql`n.atiende_a_domicilio = ${input.atiendeADomicilio}`);
      }
      if (input.haceEnvios !== undefined) {
        conditions.push(Prisma.sql`n.hace_envios = ${input.haceEnvios}`);
      }
      if (q) {
        const likePattern = `%${q}%`;
        conditions.push(Prisma.sql`(
          n.search_vector @@ plainto_tsquery('spanish', unaccent(${q})) OR
          n.nombre_comercial ILIKE ${likePattern} OR
          similarity(n.nombre_comercial, ${q}) > 0.2
        )`);
      }

      const whereSql = Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;

      const orderSql = Prisma.sql`
        ORDER BY
          n.prioridad_plan DESC,
          ${q ? Prisma.sql`ts_rank_cd(n.search_vector, plainto_tsquery('spanish', unaccent(${q}))) DESC,` : Prisma.empty}
          (abs(hashtext(n.id::text)) + ${semilla}) % 1000000 ASC,
          n.porcentaje_completitud DESC,
          n.rating_promedio DESC,
          n.ultima_actividad_en DESC
      `;

      const rawNegocios = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT n.id
        FROM negocios n
        LEFT JOIN rubros_grupos rg ON n.rubro_principal_id = rg.id
        ${whereSql}
        ${orderSql}
        LIMIT ${input.limit} OFFSET ${offset};
      `;

      const countRes = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(n.id) as count
        FROM negocios n
        LEFT JOIN rubros_grupos rg ON n.rubro_principal_id = rg.id
        ${whereSql};
      `;

      const totalNegocios = Number(countRes[0]?.count ?? 0);
      if (tipo === 'negocios') totalItems = totalNegocios;

      if (rawNegocios.length > 0) {
        const ids = rawNegocios.map((r) => r.id);
        const detailed = await prisma.negocio.findMany({
          where: { id: { in: ids } },
          include: {
            rubroPrincipal: true,
            ubicaciones: {
              where: { esPrincipal: true },
              take: 1,
            },
            horarios: {
              where: { cerrado: false },
            },
          },
        });

        // Ordenar según el resultado del ranking de la query SQL
        const orderMap = new Map<string, number>();
        ids.forEach((id, idx) => orderMap.set(id, idx));

        negocios = detailed
          .map((n) => {
            const estaAbierto = checkAbiertoAhora(n.horarios);
            const sucursal = n.ubicaciones[0] ?? null;

            return {
              id: n.id,
              slug: n.slug,
              nombreComercial: n.nombreComercial,
              eslogan: n.eslogan,
              descripcion: n.descripcion,
              logoUrl: n.logoUrl,
              bannerUrl: n.bannerUrl,
              rubroId: n.rubroPrincipal.id,
              rubroNombre: n.rubroPrincipal.nombre,
              rubroSlug: n.rubroPrincipal.slug,
              tipoPerfil: n.tipoPerfil,
              whatsappPrincipal: n.whatsappPrincipal,
              atiendeADomicilio: n.atiendeADomicilio,
              haceEnvios: n.haceEnvios,
              ratingPromedio: Number(n.ratingPromedio),
              totalOpiniones: n.totalOpiniones,
              planActual: n.planActual,
              prioridadPlan: n.prioridadPlan,
              abiertoAhora: estaAbierto,
              sucursalPrincipal: sucursal
                ? {
                    nombreSucursal: sucursal.nombreSucursal,
                    direccionEscrita: sucursal.direccionEscrita,
                    barrio: sucursal.barrio,
                  }
                : null,
            };
          })
          .sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));

        // Filtrado en memoria si pidieron estrictamente abiertoAhora
        if (input.abiertoAhora) {
          negocios = negocios.filter((n) => n.abiertoAhora);
        }
      }
    }

    // 2. Búsqueda de Publicaciones
    if (tipo === 'todos' || tipo === 'publicaciones') {
      const pubConditions: Prisma.Sql[] = [
        Prisma.sql`p.estado = 'activa'`,
        Prisma.sql`n.estado = 'activo'`,
      ];

      if (input.categoriaId) {
        pubConditions.push(Prisma.sql`p.categoria_id = ${input.categoriaId}::uuid`);
      }
      if (input.categoriaSlug) {
        pubConditions.push(Prisma.sql`c.slug = ${input.categoriaSlug}`);
      }
      if (input.rubroId) {
        pubConditions.push(Prisma.sql`n.rubro_principal_id = ${input.rubroId}::uuid`);
      }
      if (input.rubroSlug) {
        pubConditions.push(Prisma.sql`rg.slug = ${input.rubroSlug}`);
      }
      if (q) {
        const likePattern = `%${q}%`;
        pubConditions.push(Prisma.sql`(
          p.search_vector @@ plainto_tsquery('spanish', unaccent(${q})) OR
          p.titulo ILIKE ${likePattern} OR
          similarity(p.titulo, ${q}) > 0.2
        )`);
      }

      const pubWhereSql = Prisma.sql`WHERE ${Prisma.join(pubConditions, ' AND ')}`;

      const pubOrderSql = Prisma.sql`
        ORDER BY
          p.es_destacada DESC,
          n.prioridad_plan DESC,
          ${q ? Prisma.sql`ts_rank_cd(p.search_vector, plainto_tsquery('spanish', unaccent(${q}))) DESC,` : Prisma.empty}
          (abs(hashtext(p.id::text)) + ${semilla}) % 1000000 ASC,
          p.creado_en DESC
      `;

      const rawPubs = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT p.id
        FROM publicaciones p
        JOIN negocios n ON p.negocio_id = n.id
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LEFT JOIN rubros_grupos rg ON n.rubro_principal_id = rg.id
        ${pubWhereSql}
        ${pubOrderSql}
        LIMIT ${input.limit} OFFSET ${offset};
      `;

      const pubCountRes = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(p.id) as count
        FROM publicaciones p
        JOIN negocios n ON p.negocio_id = n.id
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LEFT JOIN rubros_grupos rg ON n.rubro_principal_id = rg.id
        ${pubWhereSql};
      `;

      const totalPublicaciones = Number(pubCountRes[0]?.count ?? 0);
      if (tipo === 'publicaciones') {
        totalItems = totalPublicaciones;
      } else if (tipo === 'todos') {
        totalItems += totalPublicaciones;
      }

      if (rawPubs.length > 0) {
        const pubIds = rawPubs.map((r) => r.id);
        const detailedPubs = await prisma.publicacion.findMany({
          where: { id: { in: pubIds } },
          include: {
            categoria: true,
            negocio: {
              select: {
                id: true,
                slug: true,
                nombreComercial: true,
                logoUrl: true,
                whatsappPrincipal: true,
                planActual: true,
              },
            },
            imagenes: {
              where: { esPortada: true },
              take: 1,
            },
          },
        });

        const pubOrderMap = new Map<string, number>();
        pubIds.forEach((id, idx) => pubOrderMap.set(id, idx));

        publicaciones = detailedPubs
          .map((p) => ({
            id: p.id,
            slug: p.slug,
            tipo: p.tipo,
            titulo: p.titulo,
            descripcion: p.descripcion,
            precioReferenciaArs: p.precioReferenciaArs ? Number(p.precioReferenciaArs) : null,
            etiquetaPrecio: p.etiquetaPrecio,
            esDestacada: p.esDestacada,
            portadaUrl: p.imagenes[0]?.url ?? null,
            negocio: {
              id: p.negocio.id,
              slug: p.negocio.slug,
              nombreComercial: p.negocio.nombreComercial,
              logoUrl: p.negocio.logoUrl,
              whatsappPrincipal: p.negocio.whatsappPrincipal,
              planActual: p.negocio.planActual,
            },
            categoria: {
              id: p.categoria.id,
              slug: p.categoria.slug,
              nombre: p.categoria.nombre,
            },
          }))
          .sort((a, b) => (pubOrderMap.get(a.id) ?? 0) - (pubOrderMap.get(b.id) ?? 0));
      }
    }

    const totalPages = Math.ceil(totalItems / input.limit) || 1;

    return {
      negocios,
      publicaciones,
      paginacion: {
        total: totalItems,
        page: input.page,
        limit: input.limit,
        totalPages,
      },
    };
  }

  async getDestacadosPortada(): Promise<DestacadosPortadaDTO> {
    const semilla = await this.getSemillaRotacion();

    // 1. Publicaciones Destacadas (Estrellas de Vidriera)
    const rawPubs = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT p.id
      FROM publicaciones p
      JOIN negocios n ON p.negocio_id = n.id
      WHERE p.es_destacada = true
        AND p.estado = 'activa'
        AND n.estado = 'activo'
      ORDER BY
        n.prioridad_plan DESC,
        (abs(hashtext(p.id::text)) + ${semilla}) % 1000000 ASC,
        p.destacada_desde DESC NULLS LAST
      LIMIT 10;
    `;

    let publicacionesDestacadas: ItemBusquedaPublicacionDTO[] = [];
    if (rawPubs.length > 0) {
      const pubIds = rawPubs.map((r) => r.id);
      const detailed = await prisma.publicacion.findMany({
        where: { id: { in: pubIds } },
        include: {
          categoria: true,
          negocio: {
            select: {
              id: true,
              slug: true,
              nombreComercial: true,
              logoUrl: true,
              whatsappPrincipal: true,
              planActual: true,
            },
          },
          imagenes: {
            where: { esPortada: true },
            take: 1,
          },
        },
      });

      const orderMap = new Map<string, number>();
      pubIds.forEach((id, idx) => orderMap.set(id, idx));

      publicacionesDestacadas = detailed
        .map((p) => ({
          id: p.id,
          slug: p.slug,
          tipo: p.tipo,
          titulo: p.titulo,
          descripcion: p.descripcion,
          precioReferenciaArs: p.precioReferenciaArs ? Number(p.precioReferenciaArs) : null,
          etiquetaPrecio: p.etiquetaPrecio,
          esDestacada: p.esDestacada,
          portadaUrl: p.imagenes[0]?.url ?? null,
          negocio: {
            id: p.negocio.id,
            slug: p.negocio.slug,
            nombreComercial: p.negocio.nombreComercial,
            logoUrl: p.negocio.logoUrl,
            whatsappPrincipal: p.negocio.whatsappPrincipal,
            planActual: p.negocio.planActual,
          },
          categoria: {
            id: p.categoria.id,
            slug: p.categoria.slug,
            nombre: p.categoria.nombre,
          },
        }))
        .sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
    }

    // 2. Negocios Destacados (Planes Oro y Plata)
    const rawNegocios = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT n.id
      FROM negocios n
      WHERE n.estado = 'activo'
        AND n.plan_actual IN ('oro', 'plata')
      ORDER BY
        n.prioridad_plan DESC,
        (abs(hashtext(n.id::text)) + ${semilla}) % 1000000 ASC,
        n.rating_promedio DESC,
        n.ultima_actividad_en DESC
      LIMIT 8;
    `;

    let negociosDestacados: ItemBusquedaNegocioDTO[] = [];
    if (rawNegocios.length > 0) {
      const negIds = rawNegocios.map((r) => r.id);
      const detailed = await prisma.negocio.findMany({
        where: { id: { in: negIds } },
        include: {
          rubroPrincipal: true,
          ubicaciones: {
            where: { esPrincipal: true },
            take: 1,
          },
          horarios: {
            where: { cerrado: false },
          },
        },
      });

      const negOrderMap = new Map<string, number>();
      negIds.forEach((id, idx) => negOrderMap.set(id, idx));

      negociosDestacados = detailed
        .map((n) => ({
          id: n.id,
          slug: n.slug,
          nombreComercial: n.nombreComercial,
          eslogan: n.eslogan,
          descripcion: n.descripcion,
          logoUrl: n.logoUrl,
          bannerUrl: n.bannerUrl,
          rubroId: n.rubroPrincipal.id,
          rubroNombre: n.rubroPrincipal.nombre,
          rubroSlug: n.rubroPrincipal.slug,
          tipoPerfil: n.tipoPerfil,
          whatsappPrincipal: n.whatsappPrincipal,
          atiendeADomicilio: n.atiendeADomicilio,
          haceEnvios: n.haceEnvios,
          ratingPromedio: Number(n.ratingPromedio),
          totalOpiniones: n.totalOpiniones,
          planActual: n.planActual,
          prioridadPlan: n.prioridadPlan,
          abiertoAhora: checkAbiertoAhora(n.horarios),
          sucursalPrincipal: n.ubicaciones[0]
            ? {
                nombreSucursal: n.ubicaciones[0].nombreSucursal,
                direccionEscrita: n.ubicaciones[0].direccionEscrita,
                barrio: n.ubicaciones[0].barrio,
              }
            : null,
        }))
        .sort((a, b) => (negOrderMap.get(a.id) ?? 0) - (negOrderMap.get(b.id) ?? 0));
    }

    return {
      publicacionesDestacadas,
      negociosDestacados,
    };
  }
}
