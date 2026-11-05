import type { PresignedUrlResponseDTO, SolicitarPresignedUrlInput } from '@mi-alberdi/shared';

export interface IStorageService {
  generatePresignedUploadUrl(
    input: SolicitarPresignedUrlInput,
    userId: string,
  ): Promise<PresignedUrlResponseDTO>;
  getPublicUrl(fileKey: string): string;
}

