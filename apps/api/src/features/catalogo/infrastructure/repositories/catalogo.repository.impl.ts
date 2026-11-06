import { prisma } from '@core/infrastructure/database/prisma.service.js';
import type {
  CreatePublicacionInput,
  EstadoPublicacion,
  ImagenPublicacionDTO,
  ImagenPublicacionItemInput,
  PublicacionDTO,
  PublicacionPublicaDTO,
  PublicacionResumenDTO,
  UpdatePublicacionInput,
} from '@mi-alberdi/shared';
import type { ICatalogoRepository } from '../../domain/repositories/ICatalogoRepository.js';

export class CatalogoRepositoryImpl implements ICatalogoRepository {
  async slugExists(slug: string): Promise<boolean> {
    const count = await prisma.publicacion.count({
      where: { slug },
    });
    return count > 0;
  }

  async countActivasByNegocio(negocioId: string): Promise<number> {
    return prisma.publicacion.count({
      where: {
        negocioId,
        estado: 'activa',
      },
    });
  }

  async countDestacadasByNegocio(negocioId: string): Promise<number> {
    return prisma.publicacion.count({
      where: {
        negocioId,
        esDestacada: true,
      },
    });
  }

  async create(
    input: CreatePublicacionInput,
    slug: string,
    esDestacadaAuto: boolean,
  ): Promise<PublicacionDTO> {
    return prisma.$transaction(async (tx) => {
      const { imagenes, ...data } = input;

      const created = await tx.publicacion.create({
        data: {
          negocioId: data.negocioId,
          categoriaId: data.categoriaId,
          slug,
          tipo: data.tipo,
          titulo: data.titulo,
          descripcion: data.descripcion,
          precioReferenciaArs: data.precioReferenciaArs ?? null,
          etiquetaPrecio: data.etiquetaPrecio ?? null,
          modalidad: data.modalidad,
          whatsappEspecifico: data.whatsappEspecifico ?? null,
          mensajeWhatsappCustom: data.mensajeWhatsappCustom ?? null,
          esDestacada: esDestacadaAuto,
          destacadaDesde: esDestacadaAuto ? new Date() : null,
          estado: 'activa',
        },
      });

      if (imagenes && imagenes.length > 0) {
        await tx.imagenPublicacion.createMany({
          data: imagenes.map((img: ImagenPublicacionItemInput, idx: number) => ({
            publicacionId: created.id,
            url: img.url,
            altText: img.altText ?? null,
            esPortada: img.esPortada ?? idx === 0,
            orden: img.orden ?? idx,
          })),
        });
      }

      const res = await this.findById(created.id, tx);
      return res!;
    });
  }

  async findById(id: string, client: any = prisma): Promise<PublicacionDTO | null> {
    const raw = await client.publicacion.findUnique({
      where: { id },
      include: {
        categoria: true,
        imagenes: {
          orderBy: [{ esPortada: 'desc' }, { orden: 'asc' }],
        },
      },
    });

    if (!raw) return null;

    return {
      id: raw.id,
      negocioId: raw.negocioId,
      categoriaId: raw.categoriaId,
      categoria: raw.categoria
        ? {
            id: raw.categoria.id,
            nombre: raw.categoria.nombre,
            slug: raw.categoria.slug,
            icono: raw.categoria.icono,
          }
        : undefined,
      slug: raw.slug,
      tipo: raw.tipo,
      titulo: raw.titulo,
      descripcion: raw.descripcion,
      precioReferenciaArs: raw.precioReferenciaArs ? Number(raw.precioReferenciaArs) : null,
      etiquetaPrecio: raw.etiquetaPrecio,
      modalidad: raw.modalidad,
      whatsappEspecifico: raw.whatsappEspecifico,
      mensajeWhatsappCustom: raw.mensajeWhatsappCustom,
      esDestacada: raw.esDestacada,
      destacadaDesde: raw.destacadaDesde ? raw.destacadaDesde.toISOString() : null,
      ordenEnNegocio: raw.ordenEnNegocio,
      estado: raw.estado,
      reportesAcumulados: raw.reportesAcumulados,
      imagenes: raw.imagenes.map((img: any) => ({
        id: img.id,
        publicacionId: img.publicacionId,
        url: img.url,
        altText: img.altText,
        esPortada: img.esPortada,
        orden: img.orden,
      })),
      creadoEn: raw.creadoEn.toISOString(),
      actualizadoEn: raw.actualizadoEn.toISOString(),
    };
  }

  async findBySlug(slug: string): Promise<PublicacionPublicaDTO | null> {
    const raw = await prisma.publicacion.findUnique({
      where: { slug },
      include: {
        categoria: true,
        negocio: {
          select: {
            id: true,
            nombreComercial: true,
            slug: true,
            logoUrl: true,
            whatsappPrincipal: true,
            estado: true,
          },
        },
        imagenes: {
          orderBy: [{ esPortada: 'desc' }, { orden: 'asc' }],
        },
      },
    });

    if (!raw || raw.estado !== 'activa' || raw.negocio.estado === 'suspendido') {
      return null;
    }

    const whatsappContacto = raw.whatsappEspecifico || raw.negocio.whatsappPrincipal;
    const mensajeWhatsapp =
      raw.mensajeWhatsappCustom ||
      `Hola, te vi en Mi Alberdi y quería consultar por "${raw.titulo}".`;

    return {
      id: raw.id,
      slug: raw.slug,
      negocioId: raw.negocio.id,
      negocioNombre: raw.negocio.nombreComercial,
      negocioSlug: raw.negocio.slug,
      negocioLogoUrl: raw.negocio.logoUrl,
      categoriaId: raw.categoria.id,
      categoriaNombre: raw.categoria.nombre,
      categoriaSlug: raw.categoria.slug,
      tipo: raw.tipo,
      titulo: raw.titulo,
      descripcion: raw.descripcion,
      precioReferenciaArs: raw.precioReferenciaArs ? Number(raw.precioReferenciaArs) : null,
      etiquetaPrecio: raw.etiquetaPrecio,
      modalidad: raw.modalidad,
      whatsappContacto,
      mensajeWhatsapp,
      esDestacada: raw.esDestacada,
      imagenes: raw.imagenes.map((img: any) => ({
        id: img.id,
        publicacionId: img.publicacionId,
        url: img.url,
        altText: img.altText,
        esPortada: img.esPortada,
        orden: img.orden,
      })),
      creadoEn: raw.creadoEn.toISOString(),
    };
  }

  async findByNegocioId(negocioId: string): Promise<PublicacionResumenDTO[]> {
    const raw = await prisma.publicacion.findMany({
      where: { negocioId },
      include: {
        imagenes: {
          where: { esPortada: true },
          take: 1,
        },
      },
      orderBy: [{ esDestacada: 'desc' }, { ordenEnNegocio: 'asc' }, { creadoEn: 'desc' }],
    });

    return raw.map((p) => ({
      id: p.id,
      slug: p.slug,
      tipo: p.tipo,
      titulo: p.titulo,
      precioReferenciaArs: p.precioReferenciaArs ? Number(p.precioReferenciaArs) : null,
      etiquetaPrecio: p.etiquetaPrecio,
      esDestacada: p.esDestacada,
      estado: p.estado,
      portadaUrl: p.imagenes[0]?.url ?? null,
      ordenEnNegocio: p.ordenEnNegocio,
      creadoEn: p.creadoEn.toISOString(),
    }));
  }

  async update(id: string, input: UpdatePublicacionInput): Promise<PublicacionDTO> {
    const { imagenes, ...data } = input;

    await prisma.$transaction(async (tx) => {
      await tx.publicacion.update({
        where: { id },
        data: {
          ...data,
          precioReferenciaArs:
            data.precioReferenciaArs !== undefined ? data.precioReferenciaArs : undefined,
          etiquetaPrecio: data.etiquetaPrecio !== undefined ? data.etiquetaPrecio : undefined,
          whatsappEspecifico:
            data.whatsappEspecifico !== undefined ? data.whatsappEspecifico : undefined,
          mensajeWhatsappCustom:
            data.mensajeWhatsappCustom !== undefined ? data.mensajeWhatsappCustom : undefined,
        },
      });

      if (imagenes) {
        await tx.imagenPublicacion.deleteMany({ where: { publicacionId: id } });
        if (imagenes.length > 0) {
          await tx.imagenPublicacion.createMany({
            data: imagenes.map((img: ImagenPublicacionItemInput, idx: number) => ({
              publicacionId: id,
              url: img.url,
              altText: img.altText ?? null,
              esPortada: img.esPortada ?? idx === 0,
              orden: img.orden ?? idx,
            })),
          });
        }
      }
    });

    const res = await this.findById(id);
    return res!;
  }

  async toggleDestacada(id: string, esDestacada: boolean): Promise<PublicacionDTO> {
    const updated = await prisma.publicacion.update({
      where: { id },
      data: {
        esDestacada,
        destacadaDesde: esDestacada ? new Date() : null,
      },
    });

    const res = await this.findById(updated.id);
    return res!;
  }

  async cambiarEstado(id: string, estado: EstadoPublicacion): Promise<PublicacionDTO> {
    const updated = await prisma.publicacion.update({
      where: { id },
      data: { estado },
    });

    const res = await this.findById(updated.id);
    return res!;
  }

  async reordenarImagenes(
    publicacionId: string,
    imagenes: { id: string; orden: number; esPortada: boolean }[],
  ): Promise<ImagenPublicacionDTO[]> {
    return prisma.$transaction(async (tx) => {
      for (const img of imagenes) {
        await tx.imagenPublicacion.update({
          where: { id: img.id },
          data: {
            orden: img.orden,
            esPortada: img.esPortada,
          },
        });
      }

      const raw = await tx.imagenPublicacion.findMany({
        where: { publicacionId },
        orderBy: [{ esPortada: 'desc' }, { orden: 'asc' }],
      });

      return raw.map((img) => ({
        id: img.id,
        publicacionId: img.publicacionId,
        url: img.url,
        altText: img.altText,
        esPortada: img.esPortada,
        orden: img.orden,
      }));
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.publicacion.delete({
      where: { id },
    });
  }
}
