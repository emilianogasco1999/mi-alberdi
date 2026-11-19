import { Router } from 'express';
import { crearUsuarioComercianteSchema, ROLES_USUARIO } from '@mi-alberdi/shared';
import { authMiddleware } from '@core/presentation/middlewares/auth.middleware.js';
import { requireRole } from '@core/presentation/middlewares/permission.middleware.js';
import { validateRequest } from '@core/presentation/middlewares/validateRequest.middleware.js';
import { catchedAsync } from '@core/presentation/utils/catchedAsync.js';
import { UsuariosController } from '../controllers/usuarios.controller.js';
import type { IAuthService } from '../../domain/ports/auth.service.port.js';

export const UsuariosRoutes = (authService?: IAuthService): Router => {
  const router = Router();
  const controller = new UsuariosController(authService);

  // POST /api/admin/usuarios
  router.post(
    '/',
    authMiddleware,
    requireRole([ROLES_USUARIO.ADMIN]),
    validateRequest(crearUsuarioComercianteSchema),
    catchedAsync(controller.crearComerciante),
  );

  return router;
};
