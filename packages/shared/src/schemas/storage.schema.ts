import { z } from 'zod';

export const TIPOS_DESTINO_STORAGE = [
  'logo',
  'banner',
  'publicacion',
  'comprobante',
  'reel',
  'avatar',
] as const;

export type TipoDestinoStorage = (typeof TIPOS_DESTINO_STORAGE)[number];


export const solicitarPresignedUrlSchema = z.object({
  tipoDestino: z.enum(TIPOS_DESTINO_STORAGE, {
    required_error: 'El tipo de destino es obligatorio',
  }),
  contentType: z
    .string({ required_error: 'El tipo de contenido (MIME type) es obligatorio' })
    .trim()
    .toLowerCase(),
  negocioId: z.string().uuid('ID de negocio inválido').optional().nullable(),
  fileSizeBytes: z.number().int().positive('El tamaño debe ser mayor a 0').optional().nullable(),
});

export type SolicitarPresignedUrlInput = z.infer<typeof solicitarPresignedUrlSchema>;

export interface PresignedUrlResponseDTO {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
  expiresInSeconds: number;
}
