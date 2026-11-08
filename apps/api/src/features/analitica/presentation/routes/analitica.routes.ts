import { Router } from 'express';
import {
  registrarEventoSchema,
  registrarEventosBatchSchema,
} from '@mi-alberdi/shared';
import { catchedAsync } from '@core/presentation/utils/catchedAsync.js';
import { authMiddleware } from '@core/presentation/middlewares/auth.middleware.js';
import { validateRequest } from '@core/presentation/middlewares/validateRequest.middleware.js';
import { AnaliticaController } from '../controllers/analitica.controller.js';

export const AnaliticaRoutes = (): Router => {
  const router = Router();
  const controller = new AnaliticaController();

  // Ingesta pública y liviana de eventos
  router.post(
    '/eventos',
    validateRequest(registrarEventoSchema),
    catchedAsync(controller.registrarEvento),
  );

  router.post(
    '/eventos/batch',
    validateRequest(registrarEventosBatchSchema),
    catchedAsync(controller.registrarBatch),
  );

  // Consulta autenticada de métricas de retorno de inversión (ROI) para comerciantes
  router.get(
    '/negocio/:negocioId',
    authMiddleware,
    catchedAsync(controller.getMetricasNegocio),
  );

  return router;
};

