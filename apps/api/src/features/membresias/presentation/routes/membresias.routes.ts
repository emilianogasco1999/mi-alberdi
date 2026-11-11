import { Router } from 'express';
import {
  canjearCodigoPromoSchema,
  crearPreferenciaMpSchema,
  registrarPagoTransferenciaSchema,
  revisarPagoManualSchema,
  simularWebhookMpSchema,
  solicitarCambioPlanSchema,
} from '@mi-alberdi/shared';
import { catchedAsync } from '@core/presentation/utils/catchedAsync.js';
import { authMiddleware } from '@core/presentation/middlewares/auth.middleware.js';
import { validateRequest } from '@core/presentation/middlewares/validateRequest.middleware.js';
import { MembresiasController } from '../controllers/membresias.controller.js';

export const MembresiasRoutes = (): Router => {
  const router = Router();
  const controller = new MembresiasController();

  // 1. Consulta pública de planes disponibles
  router.get('/planes', catchedAsync(controller.getPlanes));

  // 2. Estado de membresía de un negocio (autenticado)
  router.get('/negocio/:negocioId', authMiddleware, catchedAsync(controller.getEstadoNegocio));

  // 3. Solicitar cambio de plan / activar prueba gratuita
  router.post(
    '/cambio-plan',
    authMiddleware,
    validateRequest(solicitarCambioPlanSchema),
    catchedAsync(controller.solicitarCambioPlan),
  );

  // 4. Canjear código promocional
  router.post(
    '/canjear-promo',
    authMiddleware,
    validateRequest(canjearCodigoPromoSchema),
    catchedAsync(controller.canjearCodigoPromo),
  );

  // 5. Registrar pago manual por transferencia
  router.post(
    '/pago-transferencia',
    authMiddleware,
    validateRequest(registrarPagoTransferenciaSchema),
    catchedAsync(controller.registrarPagoTransferencia),
  );

  // 6. Pasarela Mercado Pago: Crear Checkout / Preferencia
  router.post(
    '/pagos/mercadopago/checkout',
    authMiddleware,
    validateRequest(crearPreferenciaMpSchema),
    catchedAsync(controller.crearCheckoutMp),
  );

  // 7. Webhook de Mercado Pago (público para recepción de eventos de MP)
  router.post('/pagos/webhook/mercadopago', catchedAsync(controller.webhookMp));
  router.get('/pagos/webhook/mercadopago', catchedAsync(controller.webhookMp));

  // 8. Simulador Sandbox (para tests de desarrollo sin túnel ngrok)
  router.post(
    '/pagos/sandbox/simular',
    validateRequest(simularWebhookMpSchema),
    catchedAsync(controller.simularPagoSandbox),
  );

  // 9. Historial de pagos de un negocio (autenticado para el dueño o admin)
  router.get(
    '/pagos/negocio/:negocioId',
    authMiddleware,
    catchedAsync(controller.getHistorialPagosNegocio),
  );

  // 10. Rutas de administración
  router.get('/admin/pagos', authMiddleware, catchedAsync(controller.getPagosAdmin));

  router.post(
    '/admin/revisar-pago',
    authMiddleware,
    validateRequest(revisarPagoManualSchema),
    catchedAsync(controller.revisarPagoManual),
  );

  router.post(
    '/admin/ejecutar-vencimientos',
    authMiddleware,
    catchedAsync(controller.ejecutarVencimientos),
  );

  return router;
};

