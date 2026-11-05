import type { CreateNegocioInput, NegocioDTO } from '@mi-alberdi/shared';
import type { INegociosRepository } from '../../domain/repositories/INegociosRepository.js';
import { generateQrToken, generateUniqueSlug } from '../helpers/slug.helper.js';

export class AltaNegocioSimpleUseCase {
  constructor(private readonly repository: INegociosRepository) {}

  async execute(propietarioId: string, input: CreateNegocioInput): Promise<NegocioDTO> {
    const slug = await generateUniqueSlug(input.nombreComercial, this.repository);
    const qrCodeToken = generateQrToken();

    return this.repository.createSimple(propietarioId, input, slug, qrCodeToken);
  }
}

