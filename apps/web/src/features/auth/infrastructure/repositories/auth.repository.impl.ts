import type { AuthUserDTO, LoginInput, RolUsuario } from '@mi-alberdi/shared';
import { apiClient } from '@/core/api/api.client';
import { User } from '../../domain/entities/user.entity';
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

interface SignInResponse {
  user: BetterAuthUser;
}

interface GetSessionResponse {
  user: BetterAuthUser;
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

/**
 * Repositorio de autenticación sobre Better Auth (/api/auth/*).
 * La sesión viaja en la cookie HttpOnly que emite el servidor (withCredentials).
 */
export class AuthRepositoryImpl implements IAuthRepository {
  async login(credentials: LoginInput): Promise<AuthSession> {
    const { data } = await apiClient.post<SignInResponse>('/auth/sign-in/email', credentials);
    return { user: new User(toAuthUserDTO(data.user)) };
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/sign-out', {});
  }

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<GetSessionResponse | null>('/auth/get-session');
    if (!data?.user) {
      throw new Error('No hay una sesión activa');
    }
    return new User(toAuthUserDTO(data.user));
  }
}
