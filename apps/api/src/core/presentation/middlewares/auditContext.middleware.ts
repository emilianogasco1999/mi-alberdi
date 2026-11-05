import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { asyncLocalStorage } from '@core/infrastructure/context/asyncContext.js';
import { envs } from '@config/environment.js';

export const auditContextMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  let userId: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, envs.JWT_SECRET) as { id?: string };
      userId = decoded.id;
    } catch {
      // Si el token expiró o es inválido, authMiddleware lo rechazará en rutas protegidas
    }
  }

  asyncLocalStorage.run({ userId }, () => next());
};

