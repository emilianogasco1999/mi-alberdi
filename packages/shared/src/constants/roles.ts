export const ROLES_USUARIO = {
  VECINO: 'vecino',
  COMERCIANTE: 'comerciante',
  MODERADOR: 'moderador',
  ADMIN: 'admin',
} as const;

export const ROLES_USUARIO_VALUES = [
  ROLES_USUARIO.VECINO,
  ROLES_USUARIO.COMERCIANTE,
  ROLES_USUARIO.MODERADOR,
  ROLES_USUARIO.ADMIN,
] as const;

export type RolUsuario = (typeof ROLES_USUARIO)[keyof typeof ROLES_USUARIO];

export const ESTADOS_CUENTA = {
  ACTIVO: 'activo',
  SUSPENDIDO: 'suspendido',
  PENDIENTE_ELIMINACION: 'pendiente_eliminacion',
} as const;

export const ESTADOS_CUENTA_VALUES = [
  ESTADOS_CUENTA.ACTIVO,
  ESTADOS_CUENTA.SUSPENDIDO,
  ESTADOS_CUENTA.PENDIENTE_ELIMINACION,
] as const;

export type EstadoCuenta = (typeof ESTADOS_CUENTA)[keyof typeof ESTADOS_CUENTA];

