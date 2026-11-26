import type { RegisterUserInput } from '@mi-alberdi/shared';
import { prisma } from '@core/infrastructure/database/prisma.service.js';
import type { User } from '../../domain/entities/User.js';
import type { IAuthRepository } from '../../domain/repositories/IAuthRepository.js';
import { UserMapper } from '../mappers/user.mapper.js';

export class AuthRepositoryImpl implements IAuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    const raw = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return raw ? UserMapper.toDomain(raw) : null;
  }

  async findById(id: string): Promise<User | null> {
    const raw = await prisma.user.findUnique({
      where: { id },
    });
    return raw ? UserMapper.toDomain(raw) : null;
  }

  async create(
    data: Omit<RegisterUserInput, 'password'> & { passwordHash: string },
  ): Promise<User> {
    const raw = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: data.nombre + (data.apellido ? ` ${data.apellido}` : ''),
        email: data.email.toLowerCase(),
        telefono: data.telefono ?? null,
        role: 'vecino',
      },
    });
    return UserMapper.toDomain(raw);
  }
}
