import type {
  CrearUsuarioComercianteInput,
  UsuarioPublicoDto,
} from '@mi-alberdi/shared';

export interface IAuthService {
  createMerchantUser(
    input: CrearUsuarioComercianteInput,
  ): Promise<UsuarioPublicoDto>;
}
