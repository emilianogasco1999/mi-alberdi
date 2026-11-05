import crypto from 'node:crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { envs } from '@config/environment.js';
import { ClientError } from '@core/domain/errors/appErrors.js';
import type {

  PresignedUrlResponseDTO,
  SolicitarPresignedUrlInput,
  TipoDestinoStorage,
} from '@mi-alberdi/shared';
import type { IStorageService } from '../../domain/services/IStorageService.js';

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'application/pdf': '.pdf',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
};

const DESTINO_ALLOWED_MIMES: Record<TipoDestinoStorage, string[]> = {
  logo: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  avatar: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  banner: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  publicacion: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  comprobante: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  reel: ['video/mp4', 'video/webm', 'video/quicktime'],
};

const DESTINO_MAX_SIZE_BYTES: Record<TipoDestinoStorage, number> = {
  logo: 3 * 1024 * 1024, // 3MB
  avatar: 3 * 1024 * 1024, // 3MB
  banner: 6 * 1024 * 1024, // 6MB
  publicacion: 6 * 1024 * 1024, // 6MB
  comprobante: 10 * 1024 * 1024, // 10MB
  reel: 50 * 1024 * 1024, // 50MB
};

const PRESIGNED_EXPIRES_IN_SECONDS = 15 * 60; // 15 minutos

export class S3StorageServiceImpl implements IStorageService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = envs.S3_BUCKET;
    this.s3Client = new S3Client({
      endpoint: envs.S3_ENDPOINT,
      region: envs.S3_REGION,
      credentials: {
        accessKeyId: envs.S3_ACCESS_KEY,
        secretAccessKey: envs.S3_SECRET_KEY,
      },
      forcePathStyle: true, // Requerido para MinIO y emuladores locales S3
    });
  }

  async generatePresignedUploadUrl(
    input: SolicitarPresignedUrlInput,
    userId: string,
  ): Promise<PresignedUrlResponseDTO> {
    const { tipoDestino, contentType, negocioId, fileSizeBytes } = input;

    // 1. Validar que el MIME type esté permitido para este destino
    const allowedMimes = DESTINO_ALLOWED_MIMES[tipoDestino];
    if (!allowedMimes.includes(contentType)) {
      throw ClientError(
        `Formato de archivo "${contentType}" no permitido para ${tipoDestino}. Formatos válidos: ${allowedMimes.join(', ')}`,
        400,
      );
    }

    // 2. Validar tamaño máximo si fue provisto
    const maxAllowedSize = DESTINO_MAX_SIZE_BYTES[tipoDestino];
    if (fileSizeBytes && fileSizeBytes > maxAllowedSize) {
      const maxMb = Math.round(maxAllowedSize / (1024 * 1024));
      throw ClientError(
        `El archivo excede el tamaño máximo permitido para ${tipoDestino} (${maxMb} MB).`,
        400,
      );
    }

    // 3. Obtener extensión canónica desde el MIME type (protege contra extensiones falsificadas)
    const extension = MIME_EXTENSION_MAP[contentType];
    if (!extension) {
      throw ClientError(`MIME type no reconocido: ${contentType}`, 400);
    }

    // 4. Generación segura de FileKey y prevención de Path Traversal
    // Jamás se utiliza un nombre provisto por el cliente. Se utiliza UUID criptográfico.
    const fileUuid = crypto.randomUUID();
    const scopeFolder = negocioId ? negocioId : userId;
    const fileKey = `${tipoDestino}/${scopeFolder}/${fileUuid}${extension}`;

    // 5. Crear comando S3 PutObject con content-type restringido
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      ContentType: contentType,
    });

    // 6. Firmar URL de subida (SigV4)
    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: PRESIGNED_EXPIRES_IN_SECONDS,
    });

    // 7. Resolver URL pública de acceso una vez subido
    const publicUrl = this.getPublicUrl(fileKey);

    return {
      uploadUrl,
      fileKey,
      publicUrl,
      expiresInSeconds: PRESIGNED_EXPIRES_IN_SECONDS,
    };
  }

  getPublicUrl(fileKey: string): string {
    const baseUrl = envs.S3_ENDPOINT.replace(/\/+$/, '');
    return `${baseUrl}/${this.bucket}/${fileKey}`;
  }
}
