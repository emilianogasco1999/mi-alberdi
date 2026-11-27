import { Router } from 'express';
import {
  ActualizarNegocioSchema,
  CrearNegocioSchema,
  altaNegocioWizardSchema,
  configurarHorariosSemanaSchema,
  createSucursalSchema,
  updateSucursalSchema,
  vincularMetodosPagoSchema,
} from '@mi-alberdi/shared';
import { catchedAsync } from '@core/presentation/utils/catchedAsync.js';
import { authMiddleware } from '@core/presentation/middlewares/auth.middleware.js';
import { validateRequest } from '@core/presentation/middlewares/validateRequest.middleware.js';
import { NegociosController } from '../controllers/negocios.controller.js';
import { uploadNegocioAssets } from '../middlewares/upload-negocio-assets.middleware.js';
import type { INegociosRepository } from '../../domain/repositories/INegociosRepository.js';

export const NegociosRoutes = (repository?: INegociosRepository): Router => {
  const router = Router();
  const controller = new NegociosController(repository);

  // 1. Rutas públicas
  router.get('/publico/:slug', catchedAsync(controller.getPublico));

  // 2. Rutas autenticadas de administración de perfiles comerciales (HU-03 y Wizard)
  router.post(
    '/wizard',
    authMiddleware,
    validateRequest(altaNegocioWizardSchema),
    catchedAsync(controller.altaWizard),
  );

  router.post(
    '/',
    authMiddleware,
    uploadNegocioAssets,
    validateRequest(CrearNegocioSchema),
    catchedAsync(controller.altaSimple),
  );

  router.get('/mis-comercios', authMiddleware, catchedAsync(controller.getMisComercios));

  router.get('/:negocioId', authMiddleware, catchedAsync(controller.getDetalle));

  router.put(
    '/:negocioId',
    authMiddleware,
    uploadNegocioAssets,
    validateRequest(ActualizarNegocioSchema),
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
