import { Router } from 'express';
import { solicitarPresignedUrlSchema } from '@mi-alberdi/shared';
import { authMiddleware } from '@core/presentation/middlewares/auth.middleware.js';
import { validateRequest } from '@core/presentation/middlewares/validateRequest.middleware.js';
import { catchedAsync } from '@core/presentation/utils/catchedAsync.js';
import { StorageController } from '../controllers/storage.controller.js';

export const StorageRoutes = (): Router => {
  const router = Router();
  const controller = new StorageController();

  router.post(
    '/presigned-url',
    authMiddleware,
    validateRequest(solicitarPresignedUrlSchema),
    catchedAsync(controller.generatePresignedUrl),
  );

  return router;
};

