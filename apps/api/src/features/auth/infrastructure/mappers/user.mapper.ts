import type { User as PrismaUser } from '@prisma/client';
import type { EstadoCuenta, RolUsuario } from '@mi-alberdi/shared';
import type { User } from '../../domain/entities/User.js';

export class UserMapper {
  static toDomain(raw: PrismaUser): User {
    return {
      id: raw.id,
      nombre: raw.name,
      apellido: null,
      email: raw.email,
      passwordHash: '',
      telefono: raw.telefono,
      avatarUrl: raw.image,
      rol: (raw.role || 'vecino') as RolUsuario,
      estado: (raw.banned ? 'bloqueado' : 'activo') as EstadoCuenta,
      puedeProbarPremium: raw.puedeProbarPremium,
      tokenVersion: 0,
      creadoEn: raw.createdAt,
      actualizadoEn: raw.updatedAt,
    };
  }
}
