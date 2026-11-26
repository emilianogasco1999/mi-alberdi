import crypto from 'node:crypto';
import path from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import multer, { MulterError } from 'multer';
import { resError } from '@core/presentation/utils/resError.js';

export const MAX_ASSET_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

class InvalidAssetFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'INVALID_FILE_TYPE';
  }
}

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_ASSET_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype.toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(mime)) {
      cb(
        new InvalidAssetFormatError(
          'Formato de archivo no permitido. Solo se aceptan imágenes .jpg, .jpeg, .png o .webp',
        ),
      );
      return;
    }

    cb(null, true);
  },
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);

const coerceMultipartBooleans = (body: Record<string, unknown>): void => {
  const booleanFields = ['atiendeADomicilio', 'haceEnvios', 'aceptaCuotas'];
  for (const field of booleanFields) {
    if (body[field] === 'true') body[field] = true;
    else if (body[field] === 'false') body[field] = false;
  }
};

export const uploadNegocioAssets = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const contentType = req.headers['content-type'] ?? '';
  if (!contentType.includes('multipart/form-data')) {
    next();
    return;
  }

  upload(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          resError(
            res,
            400,
            'El archivo supera el límite máximo permitido de 2MB',
            'FILE_TOO_LARGE',
          );
          return;
        }
        resError(res, 400, `Error al procesar archivo: ${err.message}`, 'UPLOAD_ERROR');
        return;
      }

      if (err instanceof InvalidAssetFormatError) {
        resError(res, 400, err.message, err.name);
        return;
      }

      next(err);
      return;
    }

    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    if (!req.body || typeof req.body !== 'object') {
      req.body = {};
    }

    coerceMultipartBooleans(req.body as Record<string, unknown>);

    if (files?.logo?.[0]) {
      const ext = path.extname(files.logo[0].originalname).toLowerCase() || '.webp';
      req.body.logoUrl = `/uploads/negocios/logos/${crypto.randomUUID()}${ext}`;
    }

    if (files?.banner?.[0]) {
      const ext = path.extname(files.banner[0].originalname).toLowerCase() || '.webp';
      req.body.bannerUrl = `/uploads/negocios/banners/${crypto.randomUUID()}${ext}`;
    }

    next();
  });
};
