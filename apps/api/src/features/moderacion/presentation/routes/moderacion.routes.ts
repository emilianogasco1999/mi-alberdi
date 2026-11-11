import { Router } from 'express';
import {
  crearFeedbackSchema,
  crearReporteSchema,
  marcarFeedbackLeidoSchema,
  resolverReporteSchema,
  resolverSolicitudVerificacionSchema,
  solicitarVerificacionSchema,
} from '@mi-alberdi/shared';
import { catchedAsync } from '@core/presentation/utils/catchedAsync.js';
import { authMiddleware } from '@core/presentation/middlewares/auth.middleware.js';
import { requireRole } from '@core/presentation/middlewares/permission.middleware.js';
import { validateRequest } from '@core/presentation/middlewares/validateRequest.middleware.js';
import { ModeracionController } from '../controllers/moderacion.controller.js';

export const ModeracionRoutes = (): Router => {
  const router = Router();
  const controller = new ModeracionController();

  // ==========================================
  // 1. Solicitudes de Verificación de Comercios
  // ==========================================

  // Comerciante solicita verificación de su comercio
  router.post(
    '/verificaciones',
    authMiddleware,
    validateRequest(solicitarVerificacionSchema),
    catchedAsync(controller.solicitarVerificacion),
  );

  // Comerciante consulta sus propias solicitudes
  router.get(
    '/verificaciones/mis-solicitudes',
    authMiddleware,
    catchedAsync(controller.getMisSolicitudes),
  );

  // Admin / Moderador lista todas las solicitudes
  router.get(
    '/verificaciones',
    authMiddleware,
    requireRole(['admin', 'moderador']),
    catchedAsync(controller.getSolicitudes),
  );

  // Admin / Moderador resuelve solicitud (aprueba o rechaza)
  router.patch(
    '/verificaciones/:id/resolver',
    authMiddleware,
    requireRole(['admin', 'moderador']),
    validateRequest(resolverSolicitudVerificacionSchema),
    catchedAsync(controller.resolverSolicitudVerificacion),
  );

  // ==========================================
  // 2. Reportes de Contenido / Moderación
  // ==========================================

  // Cualquier usuario (anónimo o autenticado) envía un reporte
  router.post(
    '/reportes',
    validateRequest(crearReporteSchema),
    catchedAsync(controller.crearReporte),
  );

  // Admin / Moderador lista los reportes
  router.get(
    '/reportes',
    authMiddleware,
    requireRole(['admin', 'moderador']),
    catchedAsync(controller.getReportes),
  );

  // Admin / Moderador resuelve un reporte y aplica medidas
  router.patch(
    '/reportes/:id/resolver',
    authMiddleware,
    requireRole(['admin', 'moderador']),
    validateRequest(resolverReporteSchema),
    catchedAsync(controller.resolverReporte),
  );

  // ==========================================
  // 3. Feedback de la Plataforma
  // ==========================================

  // Cualquier usuario (anónimo o autenticado) envía sugerencia/reclamo de plataforma
  router.post(
    '/feedback',
    validateRequest(crearFeedbackSchema),
    catchedAsync(controller.crearFeedback),
  );

  // Admin / Moderador lista feedback
  router.get(
    '/feedback',
    authMiddleware,
    requireRole(['admin', 'moderador']),
    catchedAsync(controller.getFeedbacks),
  );

  // Admin / Moderador marca feedback como leído
  router.patch(
    '/feedback/:id/leido',
    authMiddleware,
    requireRole(['admin', 'moderador']),
    validateRequest(marcarFeedbackLeidoSchema),
    catchedAsync(controller.marcarFeedbackLeido),
  );

  return router;
};

