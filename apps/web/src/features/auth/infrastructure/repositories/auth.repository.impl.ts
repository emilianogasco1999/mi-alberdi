import type { AuthUserDTO, LoginInput, RolUsuario } from '@mi-alberdi/shared';
import { authClient } from '@/lib/auth-client';
import { User } from '../../domain/entities/user.entity';
import { AuthServiceError, InvalidCredentialsError } from '../../domain/errors/auth.errors';
import type {
  AuthSession,
  IAuthRepository,
} from '../../domain/repositories/auth.repository.interface';

/** Usuario tal como lo devuelve Better Auth (incluye additionalFields). */
interface BetterAuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
  telefono?: string | null;
  puedeProbarPremium?: boolean | null;
}

const toAuthUserDTO = (raw: BetterAuthUser): AuthUserDTO => ({
  id: raw.id,
  nombre: raw.name,
  apellido: null,
  email: raw.email,
  telefono: raw.telefono ?? null,
  avatarUrl: raw.image ?? null,
  rol: (raw.role ?? 'vecino') as RolUsuario,
  puedeProbarPremium: raw.puedeProbarPremium ?? true,
});

const INVALID_CREDENTIALS_STATUSES = new Set([400, 401]);

/**
 * Repositorio de autenticación sobre Better Auth (authClient -> /api/auth/*).
 * La sesión viaja en la cookie HttpOnly que emite el servidor.
 */
export class AuthRepositoryImpl implements IAuthRepository {
  async login(credentials: LoginInput): Promise<AuthSession> {
    const { data, error } = await authClient.signIn.email({
      email: credentials.email,
      password: credentials.password,
    });

    if (error || !data) {
      if (error?.status && INVALID_CREDENTIALS_STATUSES.has(error.status)) {
        throw new InvalidCredentialsError();
      }
      throw new AuthServiceError();
    }

    return { user: new User(toAuthUserDTO(data.user)) };
  }

  async logout(): Promise<void> {
    const { error } = await authClient.signOut();
    if (error) {
      throw new AuthServiceError();
    }
  }

  async getMe(): Promise<User> {
    const { data, error } = await authClient.getSession();
    if (error || !data?.user) {
      throw new AuthServiceError('No hay una sesión activa');
    }
    return new User(toAuthUserDTO(data.user));
  }
}
