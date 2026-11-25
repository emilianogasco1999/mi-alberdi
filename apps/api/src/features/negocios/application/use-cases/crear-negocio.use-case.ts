import type { CrearNegocioInput, CreateNegocioInput, NegocioResponseDto } from '@mi-alberdi/shared';
import type { INegociosRepository } from '../../domain/repositories/INegociosRepository.js';
import { toNegocioResponseDto } from '../helpers/negocio-response.mapper.js';
import { generateQrToken, generateUniqueSlug } from '../helpers/slug.helper.js';

export class CrearNegocioUseCase {
  constructor(private readonly repository: INegociosRepository) {}

  async execute(
    usuarioId: string,
    input: CrearNegocioInput | CreateNegocioInput,
  ): Promise<NegocioResponseDto> {
    const nombreBase =
      'nombre' in input && input.nombre ? input.nombre : input.nombreComercial;
    const slug = await generateUniqueSlug(nombreBase, this.repository);
    const qrCodeToken = generateQrToken();

    const created = await this.repository.createSimple(
      usuarioId,
      input,
      slug,
      qrCodeToken,
    );

    return toNegocioResponseDto(created);
  }
}
