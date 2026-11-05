import type { RegisterUserInput } from '@mi-alberdi/shared';
import type { User } from '../entities/User.js';

export interface IAuthRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: Omit<RegisterUserInput, 'password'> & { passwordHash: string }): Promise<User>;
}

