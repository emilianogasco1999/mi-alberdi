import type { EstadoCuenta, RolUsuario } from '@mi-alberdi/shared';

export interface User {
  id: string;
  nombre: string;
  apellido: string | null;
  email: string;
  passwordHash: string;
  telefono: string | null;
  avatarUrl: string | null;
  rol: RolUsuario;
  estado: EstadoCuenta;
  puedeProbarPremium: boolean;
  tokenVersion: number;
  creadoEn: Date;
  actualizadoEn: Date;
}

