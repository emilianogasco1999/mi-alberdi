import type {
  ListadoPaginadoDTO,
  QueryListadosModeracionInput,
  ReporteModeracionDTO,
} from '@mi-alberdi/shared';
import type { IModeracionRepository } from '../../domain/repositories/IModeracionRepository.js';

export class GetReportesUseCase {
  constructor(private readonly moderacionRepo: IModeracionRepository) {}

  async execute(
    query: QueryListadosModeracionInput,
  ): Promise<ListadoPaginadoDTO<ReporteModeracionDTO>> {
    return this.moderacionRepo.getReportes(query);
  }
}

