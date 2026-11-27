import type { LoginInput } from '@mi-alberdi/shared';
import type { User } from '../entities/user.entity';

export interface AuthSession {
  user: User;
  accessToken: string;
}

export interface IAuthRepository {
  login(credentials: LoginInput): Promise<AuthSession>;
  logout(): Promise<void>;
  getMe(): Promise<User>;
}
