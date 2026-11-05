import type { LoginInput } from '@mi-alberdi/shared';
import type {
  AuthSession,
  IAuthRepository,
} from '../../domain/repositories/auth.repository.interface';

export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(credentials: LoginInput): Promise<AuthSession> {
    const normalizedInput: LoginInput = {
      ...credentials,
      email: credentials.email.trim().toLowerCase(),
    };

    return this.authRepository.login(normalizedInput);
  }
}
