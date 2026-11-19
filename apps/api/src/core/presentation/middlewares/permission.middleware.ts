import { Request, Response, NextFunction } from 'express';
import type { RolUsuario } from '@mi-alberdi/shared';
import { ForbiddenError, UnauthorizedError } from '@core/domain/errors/appErrors.js';

/**
 * Middleware requireRole:
 * Valida que el usuario autenticado (asociado previamente por requireAuth) posea uno de los roles permitidos.
 * - HTTP 401 si no está autenticado.
 * - HTTP 403 si el rol no coincide con los autorizados.
 */
export const requireRole = (allowedRoles: (string | RolUsuario)[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(UnauthorizedError('Usuario no autenticado'));
    }

    const userRole = (req.user.role || req.user.rol || '').toLowerCase();
    const isAllowed = allowedRoles.some((r) => r.toLowerCase() === userRole);

    if (!isAllowed) {
      return next(ForbiddenError('No tenés permisos suficientes para realizar esta acción'));
    }

    next();
  };
};
