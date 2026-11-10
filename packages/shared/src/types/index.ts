import type { RolUsuario } from '../constants/roles.js';

export interface AuthUserDTO {
  id: string;
  nombre: string;
  apellido: string | null;
  email: string;
  telefono: string | null;
  avatarUrl: string | null;
  rol: RolUsuario;
  puedeProbarPremium: boolean;
}

export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export * from './taxonomia.types.js';
export * from './negocio.types.js';
export * from './catalogo.types.js';
export * from './descubrimiento.types.js';
export * from './membresia.types.js';
export * from './analitica.types.js';
export * from './opinion.types.js';
