import type { ApiSuccessResponse, AuthUserDTO, LoginInput } from '@mi-alberdi/shared';
import { apiClient } from '@/core/api/api.client';
import { User } from '../../domain/entities/user.entity';
import type {
  AuthSession,
  IAuthRepository,
} from '../../domain/repositories/auth.repository.interface';

interface LoginResponseData {
  accessToken: string;
  user: AuthUserDTO;
}

export class AuthRepositoryImpl implements IAuthRepository {
  async login(credentials: LoginInput): Promise<AuthSession> {
    const { data } = await apiClient.post<ApiSuccessResponse<LoginResponseData>>(
      '/auth/login',
      credentials,
    );

    return {
      user: new User(data.data.user),
      accessToken: data.data.accessToken,
    };
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<ApiSuccessResponse<AuthUserDTO>>('/auth/me');
    return new User(data.data);
  }
}
