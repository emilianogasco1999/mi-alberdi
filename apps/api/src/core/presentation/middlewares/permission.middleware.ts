import { Request, Response, NextFunction } from 'express';
import type { RolUsuario } from '@mi-alberdi/shared';
import { ForbiddenError, UnauthorizedError } from '@core/domain/errors/appErrors.js';

export const requireRole = (allowedRoles: RolUsuario[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw UnauthorizedError('Usuario no autenticado');
    }

    if (!allowedRoles.includes(req.user.rol)) {
      throw ForbiddenError('No tenés permisos suficientes para realizar esta acción');
    }

    next();
  };
};

