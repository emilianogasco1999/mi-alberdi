import { Router } from 'express';
import { loginSchema, registerUserSchema } from '@mi-alberdi/shared';
import { authMiddleware } from '@core/presentation/middlewares/auth.middleware.js';
import { authRateLimiter } from '@core/presentation/middlewares/rateLimiter.middleware.js';
import { validateRequest } from '@core/presentation/middlewares/validateRequest.middleware.js';
import { catchedAsync } from '@core/presentation/utils/catchedAsync.js';
import { AuthController } from '../controllers/auth.controller.js';

export const AuthRoutes = (): Router => {
  const router = Router();
  const controller = new AuthController();

  router.post(
    '/register',
    authRateLimiter,
    validateRequest(registerUserSchema),
    catchedAsync(controller.register),
  );

  router.post(
    '/login',
    authRateLimiter,
    validateRequest(loginSchema),
    catchedAsync(controller.login),
  );

  router.get('/me', authMiddleware, catchedAsync(controller.me));
  router.post('/logout', authMiddleware, catchedAsync(controller.logout));

  return router;
};

