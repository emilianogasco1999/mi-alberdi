import type { AppError } from '@core/domain/errors/appErrors.js';
import { usuariosMessages } from '../constants/usuarios.messages.js';

export class UsuarioYaExisteException extends Error implements AppError {
  readonly statusCode = usuariosMessages.usuarioDuplicado.statusCode;

  constructor(message: string = usuariosMessages.usuarioDuplicado.message) {
    super(message);
    this.name = 'UsuarioYaExisteException';
  }
}
