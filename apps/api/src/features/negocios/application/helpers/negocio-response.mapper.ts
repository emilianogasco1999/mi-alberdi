import type { NegocioDTO, NegocioResponseDto, NegocioResumenDTO } from '@mi-alberdi/shared';

type TipoUpper = NegocioResponseDto['tipo'];

const toUpperTipo = (tipoPerfil: string): TipoUpper => {
  const upper = tipoPerfil.toUpperCase();
  if (
    upper === 'COMERCIO' ||
    upper === 'OFICIO' ||
    upper === 'PROFESIONAL' ||
    upper === 'EMPRENDIMIENTO'
  ) {
    return upper;
  }
  return 'COMERCIO';
};

export const toNegocioResponseDto = (negocio: NegocioDTO): NegocioResponseDto => {
  const principal =
    negocio.ubicaciones?.find((u) => u.esPrincipal) ?? negocio.ubicaciones?.[0];
  const direccion = principal?.direccionEscrita ?? 'Juan Bautista Alberdi, Tucumán';

  return {
    id: negocio.id,
    slug: negocio.slug,
    nombre: negocio.nombreComercial,
    nombreComercial: negocio.nombreComercial,
    tipo: toUpperTipo(negocio.tipoPerfil),
    tipoPerfil: negocio.tipoPerfil,
    telefono: negocio.whatsappPrincipal,
    whatsappPrincipal: negocio.whatsappPrincipal,
    direccion,
    direccionEscrita: direccion,
    descripcion: negocio.descripcion,
    instagram: negocio.instagramHandle,
    instagramHandle: negocio.instagramHandle,
    logoUrl: negocio.logoUrl,
    bannerUrl: negocio.bannerUrl,
    rubroPrincipalId: negocio.rubroPrincipalId,
    estado: negocio.estado,
    planActual: negocio.planActual,
    creadoEn: negocio.creadoEn,
    actualizadoEn: negocio.actualizadoEn,
  };
};

export const resumenToNegocioResponseDto = (
  resumen: NegocioResumenDTO,
): NegocioResponseDto => {
  const direccion = resumen.direccionPrincipalResumen ?? 'Juan Bautista Alberdi, Tucumán';
  const now = new Date().toISOString();

  return {
    id: resumen.id,
    slug: resumen.slug,
    nombre: resumen.nombreComercial,
    nombreComercial: resumen.nombreComercial,
    tipo: toUpperTipo(resumen.tipoPerfil),
    tipoPerfil: resumen.tipoPerfil,
    telefono: resumen.whatsappPrincipal,
    whatsappPrincipal: resumen.whatsappPrincipal,
    direccion,
    direccionEscrita: direccion,
    descripcion: resumen.eslogan ?? null,
    instagram: null,
    instagramHandle: null,
    logoUrl: resumen.logoUrl,
    bannerUrl: resumen.bannerUrl,
    rubroPrincipalId: resumen.rubroPrincipalId,
    estado: resumen.estado,
    planActual: resumen.planActual,
    creadoEn: now,
    actualizadoEn: now,
  };
};
