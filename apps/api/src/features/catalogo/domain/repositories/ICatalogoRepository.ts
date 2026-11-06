import type {
  CreatePublicacionInput,
  EstadoPublicacion,
  ImagenPublicacionDTO,
  PublicacionDTO,
  PublicacionPublicaDTO,
  PublicacionResumenDTO,
  UpdatePublicacionInput,
} from '@mi-alberdi/shared';

export interface ICatalogoRepository {
  create(
    input: CreatePublicacionInput,
    slug: string,
    esDestacadaAuto: boolean,
  ): Promise<PublicacionDTO>;

  findById(id: string): Promise<PublicacionDTO | null>;
  findBySlug(slug: string): Promise<PublicacionPublicaDTO | null>;
  findByNegocioId(negocioId: string): Promise<PublicacionResumenDTO[]>;
  update(id: string, input: UpdatePublicacionInput): Promise<PublicacionDTO>;
  delete(id: string): Promise<void>;

  countActivasByNegocio(negocioId: string): Promise<number>;
  countDestacadasByNegocio(negocioId: string): Promise<number>;
  toggleDestacada(id: string, esDestacada: boolean): Promise<PublicacionDTO>;
  cambiarEstado(id: string, estado: EstadoPublicacion): Promise<PublicacionDTO>;
  reordenarImagenes(
    publicacionId: string,
    imagenes: { id: string; orden: number; esPortada: boolean }[],
  ): Promise<ImagenPublicacionDTO[]>;

  slugExists(slug: string): Promise<boolean>;
}
