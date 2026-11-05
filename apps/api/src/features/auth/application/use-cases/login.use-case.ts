import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { AuthUserDTO, LoginInput } from '@mi-alberdi/shared';
import { envs } from '@config/environment.js';
import { ForbiddenError, UnauthorizedError } from '@core/domain/errors/appErrors.js';
import type { IAuthRepository } from '../../domain/repositories/IAuthRepository.js';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUserDTO;
}

export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const user = await this.authRepository.findByEmail(input.email);
    if (!user) {
      throw UnauthorizedError('Credenciales inválidas');
    }

    if (user.estado !== 'activo') {
      throw ForbiddenError('Tu cuenta se encuentra suspendida o inactiva');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw UnauthorizedError('Credenciales inválidas');
    }

    const payload = {
      id: user.id,
      email: user.email,
      rol: user.rol,
      tokenVersion: user.tokenVersion,
    };

    const accessToken = jwt.sign(payload, envs.JWT_SECRET, {
      expiresIn: envs.ACCESS_TOKEN_EXPIRES as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign(payload, envs.JWT_REFRESH_SECRET, {
      expiresIn: envs.REFRESH_TOKEN_EXPIRES as jwt.SignOptions['expiresIn'],
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono,
        avatarUrl: user.avatarUrl,
        rol: user.rol,
        puedeProbarPremium: user.puedeProbarPremium,
      },
    };
  }
}

