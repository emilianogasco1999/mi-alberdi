export interface OpinionDTO {
  id: string;
  negocioId: string;
  publicacionId: string | null;
  publicacionTitulo?: string | null;
  usuarioId: string | null;
  nombreAutorVisible: string;
  puntuacion: number;
  comentario: string | null;
  fotoEvidenciaUrl: string | null;
  respuestaComerciante: string | null;
  respondidoEn: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface DistribucionRatingDTO {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface ListadoOpinionesResponseDTO {
  opiniones: OpinionDTO[];
  ratingPromedio: number;
  totalOpiniones: number;
  distribucion: DistribucionRatingDTO;
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}
