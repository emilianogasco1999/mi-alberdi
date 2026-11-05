import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { RolUsuario } from '@mi-alberdi/shared';
import { envs } from '@config/environment.js';
import { UnauthorizedError } from '@core/domain/errors/appErrors.js';

export interface AuthenticatedUserPayload {
  id: string;
  email: string;
  rol: RolUsuario;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUserPayload;
    }
  }
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw UnauthorizedError('Token de acceso no proporcionado');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, envs.JWT_SECRET) as AuthenticatedUserPayload;
    req.user = decoded;
    next();
  } catch {
    throw UnauthorizedError('Token de acceso inválido o expirado');
  }
};

