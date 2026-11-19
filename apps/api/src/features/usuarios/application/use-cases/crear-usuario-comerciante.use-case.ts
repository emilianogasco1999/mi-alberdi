import type {
  CrearUsuarioComercianteInput,
  UsuarioPublicoDto,
} from '@mi-alberdi/shared';
import type { IAuthService } from '../../domain/ports/auth.service.port.js';

export class CrearUsuarioComercianteUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(input: CrearUsuarioComercianteInput): Promise<UsuarioPublicoDto> {
    return await this.authService.createMerchantUser(input);
  }
}
