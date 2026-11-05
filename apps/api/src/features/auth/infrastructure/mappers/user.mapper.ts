import type { PerfilUsuario as PrismaPerfilUsuario } from '@prisma/client';
import type { EstadoCuenta, RolUsuario } from '@mi-alberdi/shared';
import type { User } from '../../domain/entities/User.js';

export class UserMapper {
  static toDomain(raw: PrismaPerfilUsuario): User {
    return {
      id: raw.id,
      nombre: raw.nombre,
      apellido: raw.apellido,
      email: raw.email,
      passwordHash: raw.passwordHash,
      telefono: raw.telefono,
      avatarUrl: raw.avatarUrl,
      rol: raw.rol as RolUsuario,
      estado: raw.estado as EstadoCuenta,
      puedeProbarPremium: raw.puedeProbarPremium,
      tokenVersion: raw.tokenVersion,
      creadoEn: raw.creadoEn,
      actualizadoEn: raw.actualizadoEn,
    };
  }
}

