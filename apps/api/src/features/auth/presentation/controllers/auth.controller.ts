import { Request, Response } from 'express';
import { envs } from '@config/environment.js';
import { NotFoundError } from '@core/domain/errors/appErrors.js';
import { response } from '@core/presentation/utils/response.js';
import { authMessages } from '../../domain/constants/auth.messages.js';
import { LoginUseCase } from '../../application/use-cases/login.use-case.js';
import { RegisterUseCase } from '../../application/use-cases/register.use-case.js';
import { AuthRepositoryImpl } from '../../infrastructure/repositories/auth.repository.impl.js';

export class AuthController {
  private readonly repository = new AuthRepositoryImpl();
  private readonly registerUseCase = new RegisterUseCase(this.repository);
  private readonly loginUseCase = new LoginUseCase(this.repository);

  register = async (req: Request, res: Response): Promise<void> => {
    const user = await this.registerUseCase.execute(req.body);
    response(res, authMessages.registerSuccess.statusCode, authMessages.registerSuccess.message, user);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const { accessToken, refreshToken, user } = await this.loginUseCase.execute(req.body);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: envs.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    response(res, authMessages.loginSuccess.statusCode, authMessages.loginSuccess.message, {
      accessToken,
      user,
    });
  };

  me = async (req: Request, res: Response): Promise<void> => {
    const user = await this.repository.findById(req.user!.id);
    if (!user) {
      throw NotFoundError('Usuario no encontrado');
    }

    response(res, authMessages.meSuccess.statusCode, authMessages.meSuccess.message, {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono,
      avatarUrl: user.avatarUrl,
      rol: user.rol,
      puedeProbarPremium: user.puedeProbarPremium,
    });
  };

  logout = async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie('refreshToken');
    response(res, authMessages.logoutSuccess.statusCode, authMessages.logoutSuccess.message);
  };
}

