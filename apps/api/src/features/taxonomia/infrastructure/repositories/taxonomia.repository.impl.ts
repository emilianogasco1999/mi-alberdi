import { prisma } from '@core/infrastructure/database/prisma.service.js';
import type {
  RubroGrupo,
  MetodoPagoCatalogo,
  RubroGrupoArbolDTO,
  CategoriaNodoDTO,
  TipoPermitido,
  PlanCatalogo,
} from '@mi-alberdi/shared';
import type { ITaxonomiaRepository } from '../../domain/repositories/ITaxonomiaRepository.js';

export class TaxonomiaRepositoryImpl implements ITaxonomiaRepository {
  async getArbolTaxonomia(): Promise<RubroGrupoArbolDTO[]> {
    const rawGrupos = await prisma.rubroGrupo.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' },
      include: {
        categorias: {
          where: { activa: true, parentId: null },
          orderBy: { orden: 'asc' },
          include: {
            subcategorias: {
              where: { activa: true },
              orderBy: { orden: 'asc' },
            },
            _count: {
              select: { publicaciones: true },
            },
          },
        },
        _count: {
          select: { negocios: true },
        },
      },
    });

    return rawGrupos.map((g) => ({
      id: g.id,
      nombre: g.nombre,
      slug: g.slug,
      icono: g.icono,
      colorHex: g.colorHex,
      destacadoPortada: g.destacadoPortada,
      orden: g.orden,
      activo: g.activo,
      _count: g._count,
      categorias: g.categorias.map((c) => ({
        id: c.id,
        grupoId: c.grupoId,
        parentId: c.parentId,
        nombre: c.nombre,
        slug: c.slug,
        tipoPermitido: c.tipoPermitido as TipoPermitido | null,
        icono: c.icono,
        colorHex: c.colorHex,
        orden: c.orden,
        activa: c.activa,
        _count: c._count,
        subcategorias: c.subcategorias.map((s) => ({
          id: s.id,
          grupoId: s.grupoId,
          parentId: s.parentId,
          nombre: s.nombre,
          slug: s.slug,
          tipoPermitido: s.tipoPermitido as TipoPermitido | null,
          icono: s.icono,
          colorHex: s.colorHex,
          orden: s.orden,
          activa: s.activa,
        })),
      })),
    }));
  }

  async getRubros(): Promise<RubroGrupo[]> {
    const grupos = await prisma.rubroGrupo.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' },
    });

    return grupos.map((g) => ({
      id: g.id,
      nombre: g.nombre,
      slug: g.slug,
      icono: g.icono,
      colorHex: g.colorHex,
      destacadoPortada: g.destacadoPortada,
      orden: g.orden,
      activo: g.activo,
    }));
  }

  async getRubroBySlug(slug: string): Promise<RubroGrupo | null> {
    const g = await prisma.rubroGrupo.findUnique({
      where: { slug },
    });

    if (!g) return null;

    return {
      id: g.id,
      nombre: g.nombre,
      slug: g.slug,
      icono: g.icono,
      colorHex: g.colorHex,
      destacadoPortada: g.destacadoPortada,
      orden: g.orden,
      activo: g.activo,
    };
  }

  async getCategoriasByRubro(rubroIdOrSlug: string): Promise<CategoriaNodoDTO[]> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      rubroIdOrSlug,
    );

    let grupoId = rubroIdOrSlug;

    if (!isUuid) {
      const grupo = await prisma.rubroGrupo.findUnique({
        where: { slug: rubroIdOrSlug },
        select: { id: true },
      });
      if (!grupo) return [];
      grupoId = grupo.id;
    }

    const categorias = await prisma.categoria.findMany({
      where: {
        grupoId,
        activa: true,
        parentId: null,
      },
      orderBy: { orden: 'asc' },
      include: {
        subcategorias: {
          where: { activa: true },
          orderBy: { orden: 'asc' },
        },
        _count: {
          select: { publicaciones: true },
        },
      },
    });

    return categorias.map((c) => ({
      id: c.id,
      grupoId: c.grupoId,
      parentId: c.parentId,
      nombre: c.nombre,
      slug: c.slug,
      tipoPermitido: c.tipoPermitido as TipoPermitido | null,
      icono: c.icono,
      colorHex: c.colorHex,
      orden: c.orden,
      activa: c.activa,
      _count: c._count,
      subcategorias: c.subcategorias.map((s) => ({
        id: s.id,
        grupoId: s.grupoId,
        parentId: s.parentId,
        nombre: s.nombre,
        slug: s.slug,
        tipoPermitido: s.tipoPermitido as TipoPermitido | null,
        icono: s.icono,
        colorHex: s.colorHex,
        orden: s.orden,
        activa: s.activa,
      })),
    }));
  }

  async getMetodosPago(): Promise<MetodoPagoCatalogo[]> {
    const metodos = await prisma.metodoPagoCatalogo.findMany({
      where: { activo: true },
    });

    return metodos.map((m) => ({
      id: m.id,
      codigo: m.codigo,
      nombre: m.nombre,
      icono: m.icono,
      activo: m.activo,
    }));
  }

  async getPlanes(): Promise<PlanCatalogo[]> {
    const planes = await prisma.planCatalogo.findMany({
      where: { activo: true },
      orderBy: { prioridadBase: 'asc' },
    });

    return planes.map((p) => ({
      codigo: p.codigo as 'gratis' | 'plata' | 'oro',
      nombre: p.nombre,
      precioMensualArs: Number(p.precioMensualArs),
      maxPublicaciones: p.maxPublicaciones,
      maxFotosPorPublicacion: p.maxFotosPorPublicacion,
      cuposDestacados: p.cuposDestacados,
      maxSucursales: p.maxSucursales,
      maxReelsActivos: p.maxReelsActivos,
      prioridadBase: p.prioridadBase,
      permiteEstadisticas: p.permiteEstadisticas,
      permitePinDestacado: p.permitePinDestacado,
      permiteBanner: p.permiteBanner,
      permiteAsistenteIa: p.permiteAsistenteIa,
      caracteristicasBase: (p.caracteristicasBase ?? {}) as Record<string, unknown>,
      activo: p.activo,
    }));
  }
}
