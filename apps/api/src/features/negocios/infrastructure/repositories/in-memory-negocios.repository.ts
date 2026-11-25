import crypto from 'node:crypto';
import type {
  ActualizarNegocioInput,
  AltaNegocioWizardInput,
  ConfigurarHorariosSemanaInput,
  CrearNegocioInput,
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

const DEFAULT_RUBRO_ID = 'e4b6c1a0-1234-4567-89ab-cdef01234567';

export class InMemoryNegociosRepository implements INegociosRepository {
  private readonly negocios = new Map<string, NegocioDTO>();

  async slugExists(slug: string): Promise<boolean> {
    for (const negocio of this.negocios.values()) {
      if (negocio.slug === slug) return true;
    }
    return false;
  }

  async createFromWizard(
    propietarioId: string,
    input: AltaNegocioWizardInput,
    slug: string,
    qrCodeToken: string,
  ): Promise<NegocioDTO> {
    return this.createSimple(
      propietarioId,
      {
        ...input.negocio,
        direccionEscrita: input.ubicacionPrincipal.direccionEscrita,
        metodosPagoIds: input.metodosPagoIds,
      },
      slug,
      qrCodeToken,
    );
  }

  async createSimple(
    propietarioId: string,
    input: CreateNegocioInput | CrearNegocioInput,
    slug: string,
    qrCodeToken: string,
  ): Promise<NegocioDTO> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const raw = input as CreateNegocioInput & Partial<CrearNegocioInput>;
    const nombreComercial = raw.nombreComercial ?? raw.nombre ?? 'Negocio';
    const tipoPerfil =
      raw.tipoPerfil ??
      (typeof raw.tipo === 'string'
        ? (raw.tipo.toLowerCase() as NegocioDTO['tipoPerfil'])
        : 'comercio');
    const whatsappPrincipal = raw.whatsappPrincipal ?? raw.telefono ?? '';
    const direccionEscrita =
      raw.direccionEscrita ?? raw.direccion ?? 'Juan Bautista Alberdi, Tucumán';
    const instagramHandle = raw.instagramHandle ?? raw.instagram ?? null;

    const ubicacionPrincipal: UbicacionNegocioDTO = {
      id: crypto.randomUUID(),
      negocioId: id,
      nombreSucursal: 'Casa Central',
      esPrincipal: true,
      direccionEscrita,
      barrio: null,
      referenciaVisual: null,
      fotoFachadaUrl: null,
      whatsappSucursal: null,
      telefonoSucursal: null,
      latitud: null,
      longitud: null,
      pinColorHex: '#EF4444',
      pinDestacado: false,
      mostrarDireccionExacta: tipoPerfil === 'comercio',
      activaPorPlan: true,
      creadoEn: now,
    };

    const record: NegocioDTO = {
      id,
      propietarioId,
      tipoPerfil,
      rubroPrincipalId: input.rubroPrincipalId ?? DEFAULT_RUBRO_ID,
      slug,
      nombreComercial,
      eslogan: input.eslogan ?? null,
      matriculaProfesional: input.matriculaProfesional ?? null,
      descripcion: input.descripcion ?? null,
      logoUrl: input.logoUrl ?? null,
      bannerUrl: input.bannerUrl ?? null,
      qrCodeToken,
      estado: 'activo',
      verificacion: 'no_solicitada',
      verificadoEn: null,
      badgeTexto: null,
      planActual: 'gratis',
      planVenceEn: null,
      prioridadPlan: 0,
      cuposDestacadosMax: 0,
      maxSucursales: 1,
      entitlements: {},
      whatsappPrincipal,
      whatsappMensajeDefault:
        'whatsappMensajeDefault' in input
          ? (input.whatsappMensajeDefault ?? null)
          : 'Hola, te vi en Mi Alberdi y quería hacerte una consulta.',
      telefonoLinea: 'telefonoLinea' in input ? (input.telefonoLinea ?? null) : null,
      emailContacto: 'emailContacto' in input ? (input.emailContacto ?? null) : null,
      instagramHandle: instagramHandle ?? null,
      facebookUrl: 'facebookUrl' in input ? (input.facebookUrl ?? null) : null,
      tiktokHandle: 'tiktokHandle' in input ? (input.tiktokHandle ?? null) : null,
      sitioWebUrl: 'sitioWebUrl' in input ? (input.sitioWebUrl ?? null) : null,
      modalidadPrincipal: input.modalidadPrincipal ?? 'horarios_fijos',
      atiendeADomicilio: input.atiendeADomicilio ?? false,
      haceEnvios: input.haceEnvios ?? false,
      alcanceEnvios: input.alcanceEnvios ?? 'sin_envio',
      aceptaCuotas: input.aceptaCuotas ?? false,
      politicaCambios: input.politicaCambios ?? null,
      ratingPromedio: 0,
      totalOpiniones: 0,
      porcentajeCompletitud: 50,
      ultimaActividadEn: now,
      creadoEn: now,
      actualizadoEn: now,
      ubicaciones: [ubicacionPrincipal],
      horarios: [],
      metodosPago: [],
    };

    this.negocios.set(id, record);
    return record;
  }

  async findById(id: string): Promise<NegocioDTO | null> {
    return this.negocios.get(id) ?? null;
  }

  async findBySlug(slug: string): Promise<NegocioPublicoDTO | null> {
    for (const n of this.negocios.values()) {
      if (n.slug === slug && n.estado !== 'suspendido') {
        return {
          id: n.id,
          slug: n.slug,
          tipoPerfil: n.tipoPerfil,
          rubroPrincipal: n.rubroPrincipal ?? {
            id: n.rubroPrincipalId,
            slug: 'general',
            nombre: 'General',
            icono: 'store',
            colorHex: '#2563EB',
          },
          nombreComercial: n.nombreComercial,
          eslogan: n.eslogan,
          matriculaProfesional: n.matriculaProfesional,
          descripcion: n.descripcion,
          logoUrl: n.logoUrl,
          bannerUrl: n.bannerUrl,
          qrCodeToken: n.qrCodeToken,
          verificacion: n.verificacion,
          badgeTexto: n.badgeTexto,
          planActual: n.planActual,
          whatsappPrincipal: n.whatsappPrincipal,
          whatsappMensajeDefault: n.whatsappMensajeDefault,
          telefonoLinea: n.telefonoLinea,
          emailContacto: n.emailContacto,
          instagramHandle: n.instagramHandle,
          facebookUrl: n.facebookUrl,
          tiktokHandle: n.tiktokHandle,
          sitioWebUrl: n.sitioWebUrl,
          modalidadPrincipal: n.modalidadPrincipal,
          atiendeADomicilio: n.atiendeADomicilio,
          haceEnvios: n.haceEnvios,
          alcanceEnvios: n.alcanceEnvios,
          aceptaCuotas: n.aceptaCuotas,
          politicaCambios: n.politicaCambios,
          ratingPromedio: n.ratingPromedio,
          totalOpiniones: n.totalOpiniones,
          ubicaciones: n.ubicaciones ?? [],
          horarios: n.horarios ?? [],
          metodosPago: n.metodosPago ?? [],
        };
      }
    }
    return null;
  }

  async findByPropietarioId(propietarioId: string): Promise<NegocioResumenDTO[]> {
    const list: NegocioResumenDTO[] = [];
    for (const n of this.negocios.values()) {
      if (n.propietarioId === propietarioId) {
        const principal = n.ubicaciones?.find((u) => u.esPrincipal) ?? n.ubicaciones?.[0];
        list.push({
          id: n.id,
          slug: n.slug,
          tipoPerfil: n.tipoPerfil,
          nombreComercial: n.nombreComercial,
          eslogan: n.eslogan,
          logoUrl: n.logoUrl,
          bannerUrl: n.bannerUrl,
          rubroPrincipalId: n.rubroPrincipalId,
          estado: n.estado,
          verificacion: n.verificacion,
          badgeTexto: n.badgeTexto,
          planActual: n.planActual,
          ratingPromedio: n.ratingPromedio,
          totalOpiniones: n.totalOpiniones,
          whatsappPrincipal: n.whatsappPrincipal,
          modalidadPrincipal: n.modalidadPrincipal,
          atiendeADomicilio: n.atiendeADomicilio,
          haceEnvios: n.haceEnvios,
          alcanceEnvios: n.alcanceEnvios,
          direccionPrincipalResumen: principal?.direccionEscrita,
          barrioPrincipal: principal?.barrio ?? null,
        });
      }
    }
    return list;
  }

  async update(
    id: string,
    input: UpdateNegocioInput | ActualizarNegocioInput,
  ): Promise<NegocioDTO> {
    const current = this.negocios.get(id);
    if (!current) {
      throw new Error('Negocio not found');
    }

    const raw = input as UpdateNegocioInput & Partial<ActualizarNegocioInput>;
    const nombreComercial = raw.nombreComercial ?? raw.nombre ?? current.nombreComercial;
    const tipoPerfil =
      raw.tipoPerfil ??
      (typeof raw.tipo === 'string'
        ? (raw.tipo.toLowerCase() as NegocioDTO['tipoPerfil'])
        : current.tipoPerfil);
    const whatsappPrincipal =
      raw.whatsappPrincipal ?? raw.telefono ?? current.whatsappPrincipal;
    const nuevaDireccion = raw.direccionEscrita ?? raw.direccion;
    const instagramHandle =
      raw.instagramHandle !== undefined
        ? raw.instagramHandle
        : raw.instagram !== undefined
          ? raw.instagram
          : current.instagramHandle;

    const ubicaciones = (current.ubicaciones ?? []).map((u) =>
      u.esPrincipal && nuevaDireccion !== undefined
        ? { ...u, direccionEscrita: nuevaDireccion }
        : u,
    );

    const updated: NegocioDTO = {
      ...current,
      nombreComercial,
      tipoPerfil,
      whatsappPrincipal,
      instagramHandle: instagramHandle ?? null,
      descripcion: input.descripcion !== undefined ? input.descripcion : current.descripcion,
      logoUrl: input.logoUrl !== undefined ? input.logoUrl : current.logoUrl,
      bannerUrl: input.bannerUrl !== undefined ? input.bannerUrl : current.bannerUrl,
      eslogan: input.eslogan !== undefined ? input.eslogan : current.eslogan,
      matriculaProfesional:
        input.matriculaProfesional !== undefined
          ? input.matriculaProfesional
          : current.matriculaProfesional,
      estado: input.estado ?? current.estado,
      ubicaciones,
      actualizadoEn: new Date().toISOString(),
    };

    this.negocios.set(id, updated);
    return updated;
  }

  async countSucursales(negocioId: string): Promise<number> {
    return this.negocios.get(negocioId)?.ubicaciones?.length ?? 0;
  }

  async createSucursal(
    negocioId: string,
    input: CreateSucursalInput,
  ): Promise<UbicacionNegocioDTO> {
    const negocio = this.negocios.get(negocioId);
    if (!negocio) throw new Error('Negocio not found');

    const sucursal: UbicacionNegocioDTO = {
      id: crypto.randomUUID(),
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
      pinDestacado: false,
      mostrarDireccionExacta: input.mostrarDireccionExacta ?? true,
      activaPorPlan: true,
      creadoEn: new Date().toISOString(),
    };

    negocio.ubicaciones = [...(negocio.ubicaciones ?? []), sucursal];
    return sucursal;
  }

  async findSucursalById(sucursalId: string): Promise<UbicacionNegocioDTO | null> {
    for (const n of this.negocios.values()) {
      const found = n.ubicaciones?.find((u) => u.id === sucursalId);
      if (found) return found;
    }
    return null;
  }

  async updateSucursal(
    sucursalId: string,
    input: UpdateSucursalInput,
  ): Promise<UbicacionNegocioDTO> {
    for (const n of this.negocios.values()) {
      const idx = n.ubicaciones?.findIndex((u) => u.id === sucursalId) ?? -1;
      if (idx >= 0 && n.ubicaciones) {
        const updated: UbicacionNegocioDTO = {
          ...n.ubicaciones[idx],
          ...input,
        };
        n.ubicaciones[idx] = updated;
        return updated;
      }
    }
    throw new Error('Sucursal not found');
  }

  async deleteSucursal(sucursalId: string): Promise<void> {
    for (const n of this.negocios.values()) {
      if (n.ubicaciones) {
        n.ubicaciones = n.ubicaciones.filter((u) => u.id !== sucursalId);
      }
    }
  }

  async configurarHorarios(
    _negocioId: string,
    _input: ConfigurarHorariosSemanaInput,
  ): Promise<HorarioNegocioDTO[]> {
    return [];
  }

  async vincularMetodosPago(
    _negocioId: string,
    _metodos: { metodoPagoId: string; detalle?: string | null }[],
  ): Promise<NegocioMetodoPagoDTO[]> {
    return [];
  }
}
