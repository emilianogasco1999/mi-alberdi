import { Router } from 'express';
import {
  altaNegocioWizardSchema,
  configurarHorariosSemanaSchema,
  createNegocioSchema,
  createSucursalSchema,
  updateNegocioSchema,
  updateSucursalSchema,
  vincularMetodosPagoSchema,
} from '@mi-alberdi/shared';
import { catchedAsync } from '@core/presentation/utils/catchedAsync.js';
import { authMiddleware } from '@core/presentation/middlewares/auth.middleware.js';
import { validateRequest } from '@core/presentation/middlewares/validateRequest.middleware.js';
import { NegociosController } from '../controllers/negocios.controller.js';

export const NegociosRoutes = (): Router => {
  const router = Router();
  const controller = new NegociosController();

  // 1. Rutas públicas
  router.get('/publico/:slug', catchedAsync(controller.getPublico));

  // 2. Rutas autenticadas de administración de perfiles comerciales
  router.post(
    '/wizard',
    authMiddleware,
    validateRequest(altaNegocioWizardSchema),
    catchedAsync(controller.altaWizard),
  );

  router.post(
    '/',
    authMiddleware,
    validateRequest(createNegocioSchema),
    catchedAsync(controller.altaSimple),
  );

  router.get('/mis-negocios', authMiddleware, catchedAsync(controller.getMisNegocios));

  router.get('/:negocioId', authMiddleware, catchedAsync(controller.getDetalle));

  router.put(
    '/:negocioId',
    authMiddleware,
    validateRequest(updateNegocioSchema),
    catchedAsync(controller.update),
  );

  // 3. Gestión de Sucursales
  router.post(
    '/:negocioId/sucursales',
    authMiddleware,
    validateRequest(createSucursalSchema.omit({ negocioId: true, esPrincipal: true })),
    catchedAsync(controller.createSucursal),
  );

  router.put(
    '/:negocioId/sucursales/:sucursalId',
    authMiddleware,
    validateRequest(updateSucursalSchema),
    catchedAsync(controller.updateSucursal),
  );

  router.delete(
    '/:negocioId/sucursales/:sucursalId',
    authMiddleware,
    catchedAsync(controller.deleteSucursal),
  );

  // 4. Gestión de Horarios
  router.put(
    '/:negocioId/horarios',
    authMiddleware,
    validateRequest(configurarHorariosSemanaSchema),
    catchedAsync(controller.configurarHorarios),
  );

  // 5. Métodos de Pago
  router.put(
    '/:negocioId/metodos-pago',
    authMiddleware,
    validateRequest(vincularMetodosPagoSchema),
    catchedAsync(controller.vincularMetodosPago),
  );

  return router;
};

