import type { TipoPerfilComercial, TipoPublicacion } from '../constants/domain.js';

export interface ItemBusquedaNegocioDTO {
  id: string;
  slug: string;
  nombreComercial: string;
  eslogan: string | null;
  descripcion: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  rubroId: string;
  rubroNombre: string;
  rubroSlug: string;
  tipoPerfil: TipoPerfilComercial;
  whatsappPrincipal: string;
  atiendeADomicilio: boolean;
  haceEnvios: boolean;
  ratingPromedio: number;
  totalOpiniones: number;
  planActual: string;
  prioridadPlan: number;
  abiertoAhora: boolean;
  sucursalPrincipal: {
    nombreSucursal: string;
    direccionEscrita: string;
    barrio: string | null;
  } | null;
}

export interface ItemBusquedaPublicacionDTO {
  id: string;
  slug: string;
  tipo: TipoPublicacion;
  titulo: string;
  descripcion: string;
  precioReferenciaArs: number | null;
  etiquetaPrecio: string | null;
  esDestacada: boolean;
  portadaUrl: string | null;
  negocio: {
    id: string;
    slug: string;
    nombreComercial: string;
    logoUrl: string | null;
    whatsappPrincipal: string;
    planActual: string;
  };
  categoria: {
    id: string;
    slug: string;
    nombre: string;
  };
}

export interface PaginacionDTO {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ResultadoBusquedaDTO {
  negocios: ItemBusquedaNegocioDTO[];
  publicaciones: ItemBusquedaPublicacionDTO[];
  paginacion: PaginacionDTO;
}

export interface DestacadosPortadaDTO {
  publicacionesDestacadas: ItemBusquedaPublicacionDTO[];
  negociosDestacados: ItemBusquedaNegocioDTO[];
}
