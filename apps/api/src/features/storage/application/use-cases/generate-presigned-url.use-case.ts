import type { PresignedUrlResponseDTO, SolicitarPresignedUrlInput } from '@mi-alberdi/shared';
import type { IStorageService } from '../../domain/services/IStorageService.js';

export class GeneratePresignedUrlUseCase {
  constructor(private readonly storageService: IStorageService) {}

  async execute(
    input: SolicitarPresignedUrlInput,
    userId: string,
  ): Promise<PresignedUrlResponseDTO> {
    return this.storageService.generatePresignedUploadUrl(input, userId);
  }
}

