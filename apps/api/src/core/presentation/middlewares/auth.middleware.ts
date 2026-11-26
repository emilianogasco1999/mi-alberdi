import { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import type { RolUsuario } from '@mi-alberdi/shared';
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
 * Extrae y valida la sesión activa 100% con Better Auth (leyendo cookies o cabeceras Bearer).
 * Asocia `req.user` (con `role` y alias `rol`) y `req.session`.
 * Responde 401 Unauthorized si no hay sesión válida.
 */
export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const sessionData = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionData?.user || !sessionData?.session) {
      return next(UnauthorizedError('Token de acceso no proporcionado'));
    }

    const user = sessionData.user;
    req.user = {
      ...user,
      role: user.role ?? null,
      rol: (user.role as RolUsuario) ?? ('vecino' as RolUsuario),
    };
    req.session = sessionData.session;
    return next();
  } catch (error) {
    next(error);
  }
};

/** Alias de compatibilidad retrocompatible con rutas existentes */
export const authMiddleware = requireAuth;
