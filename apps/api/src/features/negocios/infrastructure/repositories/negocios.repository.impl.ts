import { prisma } from '@core/infrastructure/database/prisma.service.js';
import type {
  AltaNegocioWizardInput,
  ConfigurarHorariosSemanaInput,
  CreateNegocioInput,
  CreateSucursalInput,
  HorarioNegocioDTO,
  NegocioDTO,
  NegocioMetodoPagoDTO,
  NegocioPublicoDTO,
  NegocioResumenDTO,
  UbicacionNegocioDTO,
  UpdateNegocioInput,
  UpdateSucursalInput,
} from '@mi-alberdi/shared';
import type { INegociosRepository } from '../../domain/repositories/INegociosRepository.js';

const parseTimeToPrisma = (timeStr?: string | null): Date | null => {
  if (!timeStr) return null;
  return new Date(`1970-01-01T${timeStr}:00.000Z`);
};

const formatPrismaTimeToStr = (date?: Date | null): string | null => {
  if (!date) return null;
  return date.toISOString().substring(11, 16);
};

export class NegociosRepositoryImpl implements INegociosRepository {
  async slugExists(slug: string): Promise<boolean> {
    const count = await prisma.negocio.count({
      where: { slug },
    });
    return count > 0;
  }

  async createFromWizard(
    propietarioId: string,
    input: AltaNegocioWizardInput,
    slug: string,
    qrCodeToken: string,
  ): Promise<NegocioDTO> {
    return prisma.$transaction(async (tx) => {
      const { negocio: n, ubicacionPrincipal: u, horarios, metodosPagoIds } = input;

      const negocio = await tx.negocio.create({
        data: {
          propietarioId,
          tipoPerfil: n.tipoPerfil,
          rubroPrincipalId: n.rubroPrincipalId,
          slug,
          nombreComercial: n.nombreComercial,
          eslogan: n.eslogan ?? null,
          matriculaProfesional: n.matriculaProfesional ?? null,
          descripcion: n.descripcion ?? null,
          logoUrl: n.logoUrl ?? null,
          bannerUrl: n.bannerUrl ?? null,
          qrCodeToken,
          planActual: 'gratis',
          prioridadPlan: 0,
          cuposDestacadosMax: 0,
          maxSucursales: 1,
          entitlements: {},
          whatsappPrincipal: n.whatsappPrincipal,
          whatsappMensajeDefault: n.whatsappMensajeDefault ?? null,
          telefonoLinea: n.telefonoLinea ?? null,
          emailContacto: n.emailContacto ?? null,
          instagramHandle: n.instagramHandle ?? null,
          facebookUrl: n.facebookUrl ?? null,
          tiktokHandle: n.tiktokHandle ?? null,
          sitioWebUrl: n.sitioWebUrl ?? null,
          modalidadPrincipal: n.modalidadPrincipal,
          atiendeADomicilio: n.atiendeADomicilio,
          haceEnvios: n.haceEnvios,
          alcanceEnvios: n.alcanceEnvios,
          aceptaCuotas: n.aceptaCuotas,
          politicaCambios: n.politicaCambios ?? null,
        },
        include: {
          rubroPrincipal: true,
        },
      });

      // Crear sucursal principal
      await tx.ubicacionNegocio.create({
        data: {
          negocioId: negocio.id,
          nombreSucursal: u.nombreSucursal ?? 'Casa Central',
          esPrincipal: true,
          direccionEscrita: u.direccionEscrita,
          barrio: u.barrio ?? null,
          referenciaVisual: u.referenciaVisual ?? null,
          fotoFachadaUrl: u.fotoFachadaUrl ?? null,
          whatsappSucursal: u.whatsappSucursal ?? null,
          telefonoSucursal: u.telefonoSucursal ?? null,
          latitud: u.latitud ?? null,
          longitud: u.longitud ?? null,
          pinColorHex: u.pinColorHex ?? '#EF4444',
          mostrarDireccionExacta: u.mostrarDireccionExacta ?? true,
          activaPorPlan: true,
        },
      });

      // Horarios iniciales
      if (horarios && horarios.length > 0) {
        await tx.horarioNegocio.createMany({
          data: horarios.map((h) => ({
            negocioId: negocio.id,
            diaSemana: h.diaSemana,
            cerrado: h.cerrado,
            horarioCorrido: h.horarioCorrido,
            aperturaManana: parseTimeToPrisma(h.aperturaManana),
            cierreManana: parseTimeToPrisma(h.cierreManana),
            aperturaTarde: parseTimeToPrisma(h.aperturaTarde),
            cierreTarde: parseTimeToPrisma(h.cierreTarde),
            notaEspecial: h.notaEspecial ?? null,
          })),
        });
      }

      // Métodos de pago iniciales
      if (metodosPagoIds && metodosPagoIds.length > 0) {
        await tx.negocioMetodoPago.createMany({
          data: metodosPagoIds.map((metodoPagoId) => ({
            negocioId: negocio.id,
            metodoPagoId,
          })),
        });
      }

      const res = await this.findById(negocio.id, tx);
      return res!;
    });
  }

  async createSimple(
    propietarioId: string,
    input: CreateNegocioInput,
    slug: string,
    qrCodeToken: string,
  ): Promise<NegocioDTO> {
    return prisma.$transaction(async (tx) => {
      const n = input;

      const negocio = await tx.negocio.create({
        data: {
          propietarioId,
          tipoPerfil: n.tipoPerfil,
          rubroPrincipalId: n.rubroPrincipalId,
          slug,
          nombreComercial: n.nombreComercial,
          eslogan: n.eslogan ?? null,
          matriculaProfesional: n.matriculaProfesional ?? null,
          descripcion: n.descripcion ?? null,
          logoUrl: n.logoUrl ?? null,
          bannerUrl: n.bannerUrl ?? null,
          qrCodeToken,
          planActual: 'gratis',
          prioridadPlan: 0,
          cuposDestacadosMax: 0,
          maxSucursales: 1,
          entitlements: {},
          whatsappPrincipal: n.whatsappPrincipal,
          whatsappMensajeDefault: n.whatsappMensajeDefault ?? null,
          telefonoLinea: n.telefonoLinea ?? null,
          emailContacto: n.emailContacto ?? null,
          instagramHandle: n.instagramHandle ?? null,
          facebookUrl: n.facebookUrl ?? null,
          tiktokHandle: n.tiktokHandle ?? null,
          sitioWebUrl: n.sitioWebUrl ?? null,
          modalidadPrincipal: n.modalidadPrincipal,
          atiendeADomicilio: n.atiendeADomicilio,
          haceEnvios: n.haceEnvios,
          alcanceEnvios: n.alcanceEnvios,
          aceptaCuotas: n.aceptaCuotas,
          politicaCambios: n.politicaCambios ?? null,
        },
      });

      // Sucursal principal por defecto
      await tx.ubicacionNegocio.create({
        data: {
          negocioId: negocio.id,
          nombreSucursal: 'Casa Central',
          esPrincipal: true,
          direccionEscrita: 'Juan Bautista Alberdi, Tucumán',
          mostrarDireccionExacta: false,
          activaPorPlan: true,
        },
      });

      if (n.metodosPagoIds && n.metodosPagoIds.length > 0) {
        await tx.negocioMetodoPago.createMany({
          data: n.metodosPagoIds.map((metodoPagoId) => ({
            negocioId: negocio.id,
            metodoPagoId,
          })),
        });
      }

      const res = await this.findById(negocio.id, tx);
      return res!;
    });
  }

  async findById(id: string, client: any = prisma): Promise<NegocioDTO | null> {
    const raw = await client.negocio.findUnique({
      where: { id },
      include: {
        rubroPrincipal: true,
        ubicaciones: {
          orderBy: [{ esPrincipal: 'desc' }, { creadoEn: 'asc' }],
        },
        horarios: {
          orderBy: [{ diaSemana: 'asc' }],
        },
        metodosPago: {
          include: {
            metodoPago: true,
          },
        },
      },
    });

    if (!raw) return null;

    return {
      id: raw.id,
      propietarioId: raw.propietarioId,
      tipoPerfil: raw.tipoPerfil,
      rubroPrincipalId: raw.rubroPrincipalId,
      rubroPrincipal: raw.rubroPrincipal
        ? {
            id: raw.rubroPrincipal.id,
            slug: raw.rubroPrincipal.slug,
            nombre: raw.rubroPrincipal.nombre,
            icono: raw.rubroPrincipal.icono,
            colorHex: raw.rubroPrincipal.colorHex,
          }
        : undefined,
      slug: raw.slug,
      nombreComercial: raw.nombreComercial,
      eslogan: raw.eslogan,
      matriculaProfesional: raw.matriculaProfesional,
      descripcion: raw.descripcion,
      logoUrl: raw.logoUrl,
      bannerUrl: raw.bannerUrl,
      qrCodeToken: raw.qrCodeToken,
      estado: raw.estado,
      verificacion: raw.verificacion,
      verificadoEn: raw.verificadoEn ? raw.verificadoEn.toISOString() : null,
      badgeTexto: raw.badgeTexto,
      planActual: raw.planActual,
      planVenceEn: raw.planVenceEn ? raw.planVenceEn.toISOString() : null,
      prioridadPlan: raw.prioridadPlan,
      cuposDestacadosMax: raw.cuposDestacadosMax,
      maxSucursales: raw.maxSucursales,
      entitlements: (raw.entitlements as Record<string, unknown>) ?? {},
      whatsappPrincipal: raw.whatsappPrincipal,
      whatsappMensajeDefault: raw.whatsappMensajeDefault,
      telefonoLinea: raw.telefonoLinea,
      emailContacto: raw.emailContacto,
      instagramHandle: raw.instagramHandle,
      facebookUrl: raw.facebookUrl,
      tiktokHandle: raw.tiktokHandle,
      sitioWebUrl: raw.sitioWebUrl,
      modalidadPrincipal: raw.modalidadPrincipal,
      atiendeADomicilio: raw.atiendeADomicilio,
      haceEnvios: raw.haceEnvios,
      alcanceEnvios: raw.alcanceEnvios,
      aceptaCuotas: raw.aceptaCuotas,
      politicaCambios: raw.politicaCambios,
      ratingPromedio: Number(raw.ratingPromedio),
      totalOpiniones: raw.totalOpiniones,
      porcentajeCompletitud: raw.porcentajeCompletitud,
      ultimaActividadEn: raw.ultimaActividadEn.toISOString(),
      creadoEn: raw.creadoEn.toISOString(),
      actualizadoEn: raw.actualizadoEn.toISOString(),
      ubicaciones: raw.ubicaciones.map((u: any) => ({
        id: u.id,
        negocioId: u.negocioId,
        nombreSucursal: u.nombreSucursal,
        esPrincipal: u.esPrincipal,
        direccionEscrita: u.direccionEscrita,
        barrio: u.barrio,
        referenciaVisual: u.referenciaVisual,
        fotoFachadaUrl: u.fotoFachadaUrl,
        whatsappSucursal: u.whatsappSucursal,
        telefonoSucursal: u.telefonoSucursal,
        latitud: u.latitud ? Number(u.latitud) : null,
        longitud: u.longitud ? Number(u.longitud) : null,
        pinColorHex: u.pinColorHex,
        pinDestacado: u.pinDestacado,
        mostrarDireccionExacta: u.mostrarDireccionExacta,
        activaPorPlan: u.activaPorPlan,
        creadoEn: u.creadoEn.toISOString(),
      })),
      horarios: raw.horarios.map((h: any) => ({
        id: h.id,
        negocioId: h.negocioId,
        ubicacionId: h.ubicacionId,
        diaSemana: h.diaSemana,
        cerrado: h.cerrado,
        horarioCorrido: h.horarioCorrido,
        aperturaManana: formatPrismaTimeToStr(h.aperturaManana),
        cierreManana: formatPrismaTimeToStr(h.cierreManana),
        aperturaTarde: formatPrismaTimeToStr(h.aperturaTarde),
        cierreTarde: formatPrismaTimeToStr(h.cierreTarde),
        notaEspecial: h.notaEspecial,
      })),
      metodosPago: raw.metodosPago.map((m: any) => ({
        metodoPagoId: m.metodoPagoId,
        codigo: m.metodoPago.codigo,
        nombre: m.metodoPago.nombre,
        icono: m.metodoPago.icono,
        detalle: m.detalle,
      })),
    };
  }

  async findBySlug(slug: string): Promise<NegocioPublicoDTO | null> {
    const raw = await prisma.negocio.findUnique({
      where: { slug },
      include: {
        rubroPrincipal: true,
        ubicaciones: {
          where: { activaPorPlan: true },
          orderBy: [{ esPrincipal: 'desc' }, { creadoEn: 'asc' }],
        },
        horarios: {
          orderBy: [{ diaSemana: 'asc' }],
        },
        metodosPago: {
          include: {
            metodoPago: true,
          },
        },
      },
    });

    if (!raw || raw.estado === 'suspendido') return null;

    return {
      id: raw.id,
      slug: raw.slug,
      tipoPerfil: raw.tipoPerfil,
      rubroPrincipal: {
        id: raw.rubroPrincipal.id,
        slug: raw.rubroPrincipal.slug,
        nombre: raw.rubroPrincipal.nombre,
        icono: raw.rubroPrincipal.icono,
        colorHex: raw.rubroPrincipal.colorHex,
      },
      nombreComercial: raw.nombreComercial,
      eslogan: raw.eslogan,
      matriculaProfesional: raw.matriculaProfesional,
      descripcion: raw.descripcion,
      logoUrl: raw.logoUrl,
      bannerUrl: raw.bannerUrl,
      qrCodeToken: raw.qrCodeToken,
      verificacion: raw.verificacion,
      badgeTexto: raw.badgeTexto,
      planActual: raw.planActual,
      whatsappPrincipal: raw.whatsappPrincipal,
      whatsappMensajeDefault: raw.whatsappMensajeDefault,
      telefonoLinea: raw.telefonoLinea,
      emailContacto: raw.emailContacto,
      instagramHandle: raw.instagramHandle,
      facebookUrl: raw.facebookUrl,
      tiktokHandle: raw.tiktokHandle,
      sitioWebUrl: raw.sitioWebUrl,
      modalidadPrincipal: raw.modalidadPrincipal,
      atiendeADomicilio: raw.atiendeADomicilio,
      haceEnvios: raw.haceEnvios,
      alcanceEnvios: raw.alcanceEnvios,
      aceptaCuotas: raw.aceptaCuotas,
      politicaCambios: raw.politicaCambios,
      ratingPromedio: Number(raw.ratingPromedio),
      totalOpiniones: raw.totalOpiniones,
      ubicaciones: raw.ubicaciones.map((u) => {
        const esExacta = u.mostrarDireccionExacta;
        return {
          id: u.id,
          negocioId: u.negocioId,
          nombreSucursal: u.nombreSucursal,
          esPrincipal: u.esPrincipal,
          direccionEscrita: esExacta
            ? u.direccionEscrita
            : u.barrio
              ? `Zona Barrio ${u.barrio}`
              : 'Zona Juan Bautista Alberdi',
          barrio: u.barrio,
          referenciaVisual: esExacta ? u.referenciaVisual : null,
          fotoFachadaUrl: esExacta ? u.fotoFachadaUrl : null,
          whatsappSucursal: u.whatsappSucursal,
          telefonoSucursal: u.telefonoSucursal,
          latitud: esExacta && u.latitud ? Number(u.latitud) : null,
          longitud: esExacta && u.longitud ? Number(u.longitud) : null,
          pinColorHex: u.pinColorHex,
          pinDestacado: u.pinDestacado,
          mostrarDireccionExacta: u.mostrarDireccionExacta,
          activaPorPlan: u.activaPorPlan,
          creadoEn: u.creadoEn.toISOString(),
        };
      }),
      horarios: raw.horarios.map((h) => ({
        id: h.id,
        negocioId: h.negocioId,
        ubicacionId: h.ubicacionId,
        diaSemana: h.diaSemana,
        cerrado: h.cerrado,
        horarioCorrido: h.horarioCorrido,
        aperturaManana: formatPrismaTimeToStr(h.aperturaManana),
        cierreManana: formatPrismaTimeToStr(h.cierreManana),
        aperturaTarde: formatPrismaTimeToStr(h.aperturaTarde),
        cierreTarde: formatPrismaTimeToStr(h.cierreTarde),
        notaEspecial: h.notaEspecial,
      })),
      metodosPago: raw.metodosPago.map((m) => ({
        metodoPagoId: m.metodoPagoId,
        codigo: m.metodoPago.codigo,
        nombre: m.metodoPago.nombre,
        icono: m.metodoPago.icono,
        detalle: m.detalle,
      })),
    };
  }

  async findByPropietarioId(propietarioId: string): Promise<NegocioResumenDTO[]> {
    const raw = await prisma.negocio.findMany({
      where: { propietarioId },
      include: {
        rubroPrincipal: true,
        ubicaciones: {
          where: { esPrincipal: true },
          take: 1,
        },
      },
      orderBy: { creadoEn: 'desc' },
    });

    return raw.map((n) => {
      const uPrincipal = n.ubicaciones[0];
      return {
        id: n.id,
        slug: n.slug,
        tipoPerfil: n.tipoPerfil,
        nombreComercial: n.nombreComercial,
        eslogan: n.eslogan,
        logoUrl: n.logoUrl,
        bannerUrl: n.bannerUrl,
        rubroPrincipalId: n.rubroPrincipalId,
        rubroNombre: n.rubroPrincipal.nombre,
        rubroIcono: n.rubroPrincipal.icono,
        estado: n.estado,
        verificacion: n.verificacion,
        badgeTexto: n.badgeTexto,
        planActual: n.planActual,
        ratingPromedio: Number(n.ratingPromedio),
        totalOpiniones: n.totalOpiniones,
        whatsappPrincipal: n.whatsappPrincipal,
        modalidadPrincipal: n.modalidadPrincipal,
        atiendeADomicilio: n.atiendeADomicilio,
        haceEnvios: n.haceEnvios,
        alcanceEnvios: n.alcanceEnvios,
        direccionPrincipalResumen: uPrincipal?.direccionEscrita,
        barrioPrincipal: uPrincipal?.barrio,
      };
    });
  }

  async update(id: string, input: UpdateNegocioInput): Promise<NegocioDTO> {
    const { metodosPagoIds, ...data } = input;

    await prisma.$transaction(async (tx) => {
      await tx.negocio.update({
        where: { id },
        data: {
          ...data,
          eslogan: data.eslogan !== undefined ? data.eslogan : undefined,
          matriculaProfesional:
            data.matriculaProfesional !== undefined ? data.matriculaProfesional : undefined,
          descripcion: data.descripcion !== undefined ? data.descripcion : undefined,
          logoUrl: data.logoUrl !== undefined ? data.logoUrl : undefined,
          bannerUrl: data.bannerUrl !== undefined ? data.bannerUrl : undefined,
          whatsappMensajeDefault:
            data.whatsappMensajeDefault !== undefined ? data.whatsappMensajeDefault : undefined,
          telefonoLinea: data.telefonoLinea !== undefined ? data.telefonoLinea : undefined,
          emailContacto: data.emailContacto !== undefined ? data.emailContacto : undefined,
          instagramHandle:
            data.instagramHandle !== undefined ? data.instagramHandle : undefined,
          facebookUrl: data.facebookUrl !== undefined ? data.facebookUrl : undefined,
          tiktokHandle: data.tiktokHandle !== undefined ? data.tiktokHandle : undefined,
          sitioWebUrl: data.sitioWebUrl !== undefined ? data.sitioWebUrl : undefined,
          politicaCambios:
            data.politicaCambios !== undefined ? data.politicaCambios : undefined,
        },
      });

      if (metodosPagoIds) {
        await tx.negocioMetodoPago.deleteMany({ where: { negocioId: id } });
        if (metodosPagoIds.length > 0) {
          await tx.negocioMetodoPago.createMany({
            data: metodosPagoIds.map((metodoPagoId) => ({
              negocioId: id,
              metodoPagoId,
            })),
          });
        }
      }
    });

    const updated = await this.findById(id);
    return updated!;
  }

  // =============================================================================
  // SUCURSALES
  // =============================================================================

  async countSucursales(negocioId: string): Promise<number> {
    return prisma.ubicacionNegocio.count({
      where: { negocioId },
    });
  }

  async createSucursal(
    negocioId: string,
    input: CreateSucursalInput,
  ): Promise<UbicacionNegocioDTO> {
    const u = await prisma.ubicacionNegocio.create({
      data: {
        negocioId,
        nombreSucursal: input.nombreSucursal ?? 'Sucursal',
        esPrincipal: false,
        direccionEscrita: input.direccionEscrita,
        barrio: input.barrio ?? null,
        referenciaVisual: input.referenciaVisual ?? null,
        fotoFachadaUrl: input.fotoFachadaUrl ?? null,
        whatsappSucursal: input.whatsappSucursal ?? null,
        telefonoSucursal: input.telefonoSucursal ?? null,
        latitud: input.latitud ?? null,
        longitud: input.longitud ?? null,
        pinColorHex: input.pinColorHex ?? '#EF4444',
        mostrarDireccionExacta: input.mostrarDireccionExacta ?? true,
        activaPorPlan: true,
      },
    });

    return {
      id: u.id,
      negocioId: u.negocioId,
      nombreSucursal: u.nombreSucursal,
      esPrincipal: u.esPrincipal,
      direccionEscrita: u.direccionEscrita,
      barrio: u.barrio,
      referenciaVisual: u.referenciaVisual,
      fotoFachadaUrl: u.fotoFachadaUrl,
      whatsappSucursal: u.whatsappSucursal,
      telefonoSucursal: u.telefonoSucursal,
      latitud: u.latitud ? Number(u.latitud) : null,
      longitud: u.longitud ? Number(u.longitud) : null,
      pinColorHex: u.pinColorHex,
      pinDestacado: u.pinDestacado,
      mostrarDireccionExacta: u.mostrarDireccionExacta,
      activaPorPlan: u.activaPorPlan,
      creadoEn: u.creadoEn.toISOString(),
    };
  }

  async findSucursalById(sucursalId: string): Promise<UbicacionNegocioDTO | null> {
    const u = await prisma.ubicacionNegocio.findUnique({
      where: { id: sucursalId },
    });

    if (!u) return null;

    return {
      id: u.id,
      negocioId: u.negocioId,
      nombreSucursal: u.nombreSucursal,
      esPrincipal: u.esPrincipal,
      direccionEscrita: u.direccionEscrita,
      barrio: u.barrio,
      referenciaVisual: u.referenciaVisual,
      fotoFachadaUrl: u.fotoFachadaUrl,
      whatsappSucursal: u.whatsappSucursal,
      telefonoSucursal: u.telefonoSucursal,
      latitud: u.latitud ? Number(u.latitud) : null,
      longitud: u.longitud ? Number(u.longitud) : null,
      pinColorHex: u.pinColorHex,
      pinDestacado: u.pinDestacado,
      mostrarDireccionExacta: u.mostrarDireccionExacta,
      activaPorPlan: u.activaPorPlan,
      creadoEn: u.creadoEn.toISOString(),
    };
  }

  async updateSucursal(
    sucursalId: string,
    input: UpdateSucursalInput,
  ): Promise<UbicacionNegocioDTO> {
    const u = await prisma.ubicacionNegocio.update({
      where: { id: sucursalId },
      data: {
        ...input,
        barrio: input.barrio !== undefined ? input.barrio : undefined,
        referenciaVisual:
          input.referenciaVisual !== undefined ? input.referenciaVisual : undefined,
        fotoFachadaUrl:
          input.fotoFachadaUrl !== undefined ? input.fotoFachadaUrl : undefined,
        whatsappSucursal:
          input.whatsappSucursal !== undefined ? input.whatsappSucursal : undefined,
        telefonoSucursal:
          input.telefonoSucursal !== undefined ? input.telefonoSucursal : undefined,
        latitud: input.latitud !== undefined ? input.latitud : undefined,
        longitud: input.longitud !== undefined ? input.longitud : undefined,
      },
    });

    return {
      id: u.id,
      negocioId: u.negocioId,
      nombreSucursal: u.nombreSucursal,
      esPrincipal: u.esPrincipal,
      direccionEscrita: u.direccionEscrita,
      barrio: u.barrio,
      referenciaVisual: u.referenciaVisual,
      fotoFachadaUrl: u.fotoFachadaUrl,
      whatsappSucursal: u.whatsappSucursal,
      telefonoSucursal: u.telefonoSucursal,
      latitud: u.latitud ? Number(u.latitud) : null,
      longitud: u.longitud ? Number(u.longitud) : null,
      pinColorHex: u.pinColorHex,
      pinDestacado: u.pinDestacado,
      mostrarDireccionExacta: u.mostrarDireccionExacta,
      activaPorPlan: u.activaPorPlan,
      creadoEn: u.creadoEn.toISOString(),
    };
  }

  async deleteSucursal(sucursalId: string): Promise<void> {
    await prisma.ubicacionNegocio.delete({
      where: { id: sucursalId },
    });
  }

  // =============================================================================
  // HORARIOS
  // =============================================================================

  async configurarHorarios(
    negocioId: string,
    input: ConfigurarHorariosSemanaInput,
  ): Promise<HorarioNegocioDTO[]> {
    const ubicacionId = input.ubicacionId ?? null;

    return prisma.$transaction(async (tx) => {
      // Eliminar horarios anteriores para ese scope (negocio general o sucursal específica)
      await tx.horarioNegocio.deleteMany({
        where: {
          negocioId,
          ubicacionId,
        },
      });

      // Crear nuevos horarios
      await tx.horarioNegocio.createMany({
        data: input.horarios.map((h) => ({
          negocioId,
          ubicacionId,
          diaSemana: h.diaSemana,
          cerrado: h.cerrado,
          horarioCorrido: h.horarioCorrido,
          aperturaManana: parseTimeToPrisma(h.aperturaManana),
          cierreManana: parseTimeToPrisma(h.cierreManana),
          aperturaTarde: parseTimeToPrisma(h.aperturaTarde),
          cierreTarde: parseTimeToPrisma(h.cierreTarde),
          notaEspecial: h.notaEspecial ?? null,
        })),
      });

      const items = await tx.horarioNegocio.findMany({
        where: { negocioId, ubicacionId },
        orderBy: { diaSemana: 'asc' },
      });

      return items.map((h) => ({
        id: h.id,
        negocioId: h.negocioId,
        ubicacionId: h.ubicacionId,
        diaSemana: h.diaSemana,
        cerrado: h.cerrado,
        horarioCorrido: h.horarioCorrido,
        aperturaManana: formatPrismaTimeToStr(h.aperturaManana),
        cierreManana: formatPrismaTimeToStr(h.cierreManana),
        aperturaTarde: formatPrismaTimeToStr(h.aperturaTarde),
        cierreTarde: formatPrismaTimeToStr(h.cierreTarde),
        notaEspecial: h.notaEspecial,
      }));
    });
  }

  // =============================================================================
  // MÉTODOS DE PAGO
  // =============================================================================

  async vincularMetodosPago(
    negocioId: string,
    metodos: { metodoPagoId: string; detalle?: string | null }[],
  ): Promise<NegocioMetodoPagoDTO[]> {
    return prisma.$transaction(async (tx) => {
      await tx.negocioMetodoPago.deleteMany({
        where: { negocioId },
      });

      await tx.negocioMetodoPago.createMany({
        data: metodos.map((m) => ({
          negocioId,
          metodoPagoId: m.metodoPagoId,
          detalle: m.detalle ?? null,
        })),
      });

      const actualizados = await tx.negocioMetodoPago.findMany({
        where: { negocioId },
        include: { metodoPago: true },
      });

      return actualizados.map((m) => ({
        metodoPagoId: m.metodoPagoId,
        codigo: m.metodoPago.codigo,
        nombre: m.metodoPago.nombre,
        icono: m.metodoPago.icono,
        detalle: m.detalle,
      }));
    });
  }
}

