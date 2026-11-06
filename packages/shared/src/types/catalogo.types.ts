import type { EstadoPublicacion, ModalidadAtencion, TipoPublicacion } from '../constants/domain.js';
import type {
  CambiarEstadoPublicacionInput,
  CreatePublicacionInput,
  ImagenPublicacionItemInput,
  ReordenarImagenesInput,
  ToggleDestacadaInput,
  UpdatePublicacionInput,
} from '../schemas/catalogo.schema.js';

export type {
  CambiarEstadoPublicacionInput,
  CreatePublicacionInput,
  ImagenPublicacionItemInput,
  ReordenarImagenesInput,
  ToggleDestacadaInput,
  UpdatePublicacionInput,
};

export interface ImagenPublicacionDTO {
  id: string;
  publicacionId: string;
  url: string;
  altText: string | null;
  esPortada: boolean;
  orden: number;
}

export interface PublicacionDTO {
  id: string;
  negocioId: string;
  categoriaId: string;
  categoria?: {
    id: string;
    nombre: string;
    slug: string;
    icono: string | null;
  };
  slug: string;
  tipo: TipoPublicacion;
  titulo: string;
  descripcion: string;
  precioReferenciaArs: number | null;
  etiquetaPrecio: string | null;
  modalidad: ModalidadAtencion;
  whatsappEspecifico: string | null;
  mensajeWhatsappCustom: string | null;

  // Cupos de Destacados (Opción B)
  esDestacada: boolean;
  destacadaDesde: string | null;
  ordenEnNegocio: number;

  estado: EstadoPublicacion;
  reportesAcumulados: number;

  imagenes: ImagenPublicacionDTO[];
  creadoEn: string;
  actualizadoEn: string;
}

export interface PublicacionPublicaDTO {
  id: string;
  slug: string;
  negocioId: string;
  negocioNombre: string;
  negocioSlug: string;
  negocioLogoUrl: string | null;
  categoriaId: string;
  categoriaNombre: string;
  categoriaSlug: string;
  tipo: TipoPublicacion;
  titulo: string;
  descripcion: string;
  precioReferenciaArs: number | null;
  etiquetaPrecio: string | null;
  modalidad: ModalidadAtencion;

  // WhatsApp resuelto (específico o hereda el del negocio)
  whatsappContacto: string;
  mensajeWhatsapp: string;

  esDestacada: boolean;
  imagenes: ImagenPublicacionDTO[];
  creadoEn: string;
}

export interface PublicacionResumenDTO {
  id: string;
  slug: string;
  tipo: TipoPublicacion;
  titulo: string;
  precioReferenciaArs: number | null;
  etiquetaPrecio: string | null;
  esDestacada: boolean;
  estado: EstadoPublicacion;
  portadaUrl: string | null;
  ordenEnNegocio: number;
  creadoEn: string;
}
