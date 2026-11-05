import type { AltaNegocioWizardInput, NegocioDTO } from '@mi-alberdi/shared';
import type { INegociosRepository } from '../../domain/repositories/INegociosRepository.js';
import { generateQrToken, generateUniqueSlug } from '../helpers/slug.helper.js';

export class AltaNegocioWizardUseCase {
  constructor(private readonly repository: INegociosRepository) {}

  async execute(propietarioId: string, input: AltaNegocioWizardInput): Promise<NegocioDTO> {
    const slug = await generateUniqueSlug(input.negocio.nombreComercial, this.repository);
    const qrCodeToken = generateQrToken();

    return this.repository.createFromWizard(propietarioId, input, slug, qrCodeToken);
  }
}

