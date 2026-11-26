import type {
  CrearUsuarioComercianteInput,
  UsuarioPublicoDto,
} from '@mi-alberdi/shared';
import { ROLES_USUARIO, ESTADOS_CUENTA } from '@mi-alberdi/shared';
import type { IAuthService } from '../../domain/ports/auth.service.port.js';
import { UsuarioYaExisteException } from '../../domain/exceptions/usuario-ya-existe.exception.js';

export class InMemoryAuthService implements IAuthService {
  private users: Array<UsuarioPublicoDto & { email: string }> = [];

  async createMerchantUser(
    input: CrearUsuarioComercianteInput,
  ): Promise<UsuarioPublicoDto> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const exists = this.users.some(
      (u) => u.email.toLowerCase() === normalizedEmail,
    );

    if (exists) {
      throw new UsuarioYaExisteException();
    }

    const newUser: UsuarioPublicoDto = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      nombre: input.nombre.trim(),
      apellido: null,
      email: normalizedEmail,
      telefono: null,
      avatarUrl: null,
      rol: ROLES_USUARIO.COMERCIANTE,
      estado: ESTADOS_CUENTA.ACTIVO,
      puedeProbarPremium: true,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    };

    this.users.push(newUser);
    return newUser;
  }

  seedUser(user: UsuarioPublicoDto): void {
    this.users.push(user);
  }

  clear(): void {
    this.users = [];
  }
}
