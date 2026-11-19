import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { fromNodeHeaders } from 'better-auth/node';
import type { RolUsuario } from '@mi-alberdi/shared';
import { envs } from '@config/environment.js';
import { UnauthorizedError } from '@core/domain/errors/appErrors.js';
import { auth } from '@core/infrastructure/auth/better-auth.config.js';

export interface AuthenticatedUserPayload {
  id: string;
  name?: string | null;
  email: string;
  role?: string | null;
  rol: RolUsuario;
  image?: string | null;
  emailVerified?: boolean;
  telefono?: string | null;
  puedeProbarPremium?: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

export interface AuthenticatedSessionPayload {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  [key: string]: unknown;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUserPayload;
      session?: AuthenticatedSessionPayload;
    }
  }
}

/**
 * Middleware requireAuth:
 * Extrae y valida la sesión activa con Better Auth (leyendo cookies o cabeceras Bearer).
 * Asocia `req.user` (con `role` y alias `rol`) y `req.session`.
 * Responde 401 Unauthorized si no hay sesión válida.
 */
export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 1. Intento principal: Resolver sesión mediante Better Auth
    const sessionData = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (sessionData?.user && sessionData?.session) {
      const user = sessionData.user;
      req.user = {
        ...user,
        role: user.role ?? null,
        rol: (user.role as RolUsuario) ?? ('vecino' as RolUsuario),
      };
      req.session = sessionData.session;
      return next();
    }

    // 2. Fallback transitorio para JWT de tokens sintéticos en tests
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, envs.JWT_SECRET) as any;
        req.user = {
          id: decoded.id,
          name: decoded.nombre || decoded.name || 'Usuario',
          email: decoded.email,
          role: decoded.role || decoded.rol || 'vecino',
          rol: (decoded.rol || decoded.role || 'vecino') as RolUsuario,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return next();
      } catch {
        // Token inválido, continúa al rechazo
      }
    }

    return next(UnauthorizedError('Token de acceso no proporcionado'));
  } catch (error) {
    next(error);
  }
};

/** Alias de compatibilidad retrocompatible con rutas existentes */
export const authMiddleware = requireAuth;
