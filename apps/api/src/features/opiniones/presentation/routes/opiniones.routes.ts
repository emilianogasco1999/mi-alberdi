import { Router } from 'express';
import {
  createOpinionSchema,
  responderOpinionSchema,
} from '@mi-alberdi/shared';
import { catchedAsync } from '@core/presentation/utils/catchedAsync.js';
import { authMiddleware } from '@core/presentation/middlewares/auth.middleware.js';
import { validateRequest } from '@core/presentation/middlewares/validateRequest.middleware.js';
import { OpinionesController } from '../controllers/opiniones.controller.js';

export const OpinionesRoutes = (): Router => {
  const router = Router();
  const controller = new OpinionesController();

  // 1. Consulta pública de opiniones por negocio
  router.get('/negocio/:negocioId', catchedAsync(controller.getOpinionesNegocio));

  // 2. Consulta de opinión propia por negocio
  router.get('/negocio/:negocioId/mi-opinion', authMiddleware, catchedAsync(controller.getMiOpinion));

  // 3. Crear opinión (vecino autenticado)
  router.post(
    '/',
    authMiddleware,
    validateRequest(createOpinionSchema),
    catchedAsync(controller.create),
  );

  // 4. Responder opinión (comerciante dueño del negocio o admin)
  router.patch(
    '/:id/respuesta',
    authMiddleware,
    validateRequest(responderOpinionSchema),
    catchedAsync(controller.responder),
  );

  // 5. Eliminar respuesta de comerciante (dueño del negocio o admin)
  router.delete(
    '/:id/respuesta',
    authMiddleware,
    catchedAsync(controller.eliminarRespuesta),
  );

  // 6. Eliminar opinión completa (autor o admin/moderador)
  router.delete('/:id', authMiddleware, catchedAsync(controller.delete));

  return router;
};
