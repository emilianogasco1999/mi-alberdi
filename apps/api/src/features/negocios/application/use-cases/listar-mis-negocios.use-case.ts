import type { NegocioResponseDto } from '@mi-alberdi/shared';
import type { INegociosRepository } from '../../domain/repositories/INegociosRepository.js';
import { resumenToNegocioResponseDto } from '../helpers/negocio-response.mapper.js';

export class ListarMisNegociosUseCase {
  constructor(private readonly repository: INegociosRepository) {}

  async execute(usuarioId: string): Promise<NegocioResponseDto[]> {
    const negocios = await this.repository.findByPropietarioId(usuarioId);
    return negocios.map(resumenToNegocioResponseDto);
  }
}
