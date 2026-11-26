import { Request, Response } from 'express';
import { response } from '@core/presentation/utils/response.js';
import { usuariosMessages } from '../../domain/constants/usuarios.messages.js';
import { CrearUsuarioComercianteUseCase } from '../../application/use-cases/crear-usuario-comerciante.use-case.js';
import { BetterAuthService } from '../../infrastructure/adapters/better-auth-auth.service.js';
import type { IAuthService } from '../../domain/ports/auth.service.port.js';

export class UsuariosController {
  private readonly useCase: CrearUsuarioComercianteUseCase;

  constructor(authService?: IAuthService) {
    const service = authService ?? new BetterAuthService();
    this.useCase = new CrearUsuarioComercianteUseCase(service);
  }

  crearComerciante = async (req: Request, res: Response): Promise<void> => {
    const usuario = await this.useCase.execute(req.body);
    response(
      res,
      usuariosMessages.crearExitoso.statusCode,
      usuariosMessages.crearExitoso.message,
      usuario,
    );
  };
}
