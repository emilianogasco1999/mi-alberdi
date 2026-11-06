import { Router } from 'express';
import {
  cambiarEstadoPublicacionSchema,
  createPublicacionSchema,
  reordenarImagenesSchema,
  toggleDestacadaSchema,
  updatePublicacionSchema,
} from '@mi-alberdi/shared';
import { catchedAsync } from '@core/presentation/utils/catchedAsync.js';
import { authMiddleware } from '@core/presentation/middlewares/auth.middleware.js';
import { validateRequest } from '@core/presentation/middlewares/validateRequest.middleware.js';
import { CatalogoController } from '../controllers/catalogo.controller.js';

export const CatalogoRoutes = (): Router => {
  const router = Router();
  const controller = new CatalogoController();

  // 1. Consulta pública
  router.get('/publico/:slug', catchedAsync(controller.getPublica));

  // 2. Gestión autenticada de catálogo
  router.get('/negocio/:negocioId', authMiddleware, catchedAsync(controller.getMisPublicaciones));

  router.get('/:id', authMiddleware, catchedAsync(controller.getDetalle));

  router.post(
    '/',
    authMiddleware,
    validateRequest(createPublicacionSchema),
    catchedAsync(controller.create),
  );

  router.put(
    '/:id',
    authMiddleware,
    validateRequest(updatePublicacionSchema),
    catchedAsync(controller.update),
  );

  router.patch(
    '/:id/destacada',
    authMiddleware,
    validateRequest(toggleDestacadaSchema),
    catchedAsync(controller.toggleDestacada),
  );

  router.patch(
    '/:id/estado',
    authMiddleware,
    validateRequest(cambiarEstadoPublicacionSchema),
    catchedAsync(controller.cambiarEstado),
  );

  router.put(
    '/:id/imagenes',
    authMiddleware,
    validateRequest(reordenarImagenesSchema),
    catchedAsync(controller.reordenarImagenes),
  );

  router.delete('/:id', authMiddleware, catchedAsync(controller.delete));

  return router;
};
