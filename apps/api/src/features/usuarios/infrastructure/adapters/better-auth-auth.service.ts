import { APIError } from 'better-auth/api';
import {
  ESTADOS_CUENTA,
  ROLES_USUARIO,
  type CrearUsuarioComercianteInput,
  type RolUsuario,
  type UsuarioPublicoDto,
} from '@mi-alberdi/shared';
import { auth } from '@core/infrastructure/auth/better-auth.config.js';
import type { IAuthService } from '../../domain/ports/auth.service.port.js';
import { UsuarioYaExisteException } from '../../domain/exceptions/usuario-ya-existe.exception.js';

const USER_ALREADY_EXISTS_CODE_PREFIX = 'USER_ALREADY_EXISTS';

interface BetterAuthExtraFields {
  telefono?: string | null;
  puedeProbarPremium?: boolean | null;
}

const isDuplicateUserError = (error: unknown): boolean => {
  if (!(error instanceof APIError)) return false;
  const code = (error.body as { code?: string } | undefined)?.code ?? '';
  return code.startsWith(USER_ALREADY_EXISTS_CODE_PREFIX);
};

/**
 * Adaptador de IAuthService sobre la API de servidor de Better Auth.
 * Better Auth se encarga del hashing de la contraseña y de la unicidad del email.
 */
export class BetterAuthService implements IAuthService {
  async createMerchantUser(
    input: CrearUsuarioComercianteInput,
  ): Promise<UsuarioPublicoDto> {
    try {
      const { user: created } = await auth.api.createUser({
        body: {
          name: input.nombre,
          email: input.email,
          password: input.password,
          // El plugin admin tipa `role` como 'admin' | 'user'; el rol real
          // del sistema se valida en packages/shared (ROLES_USUARIO).
          role: ROLES_USUARIO.COMERCIANTE as never,
        },
      });

      // Campos adicionales definidos en better-auth.config.ts (user.additionalFields)
      const user = created as typeof created & BetterAuthExtraFields;

      return {
        id: user.id,
        nombre: user.name,
        apellido: null,
        email: user.email,
        telefono: user.telefono ?? null,
        avatarUrl: user.image ?? null,
        rol: (user.role ?? ROLES_USUARIO.COMERCIANTE) as RolUsuario,
        estado: user.banned ? ESTADOS_CUENTA.SUSPENDIDO : ESTADOS_CUENTA.ACTIVO,
        puedeProbarPremium: user.puedeProbarPremium ?? true,
        creadoEn: user.createdAt,
        actualizadoEn: user.updatedAt,
      };
    } catch (error) {
      if (isDuplicateUserError(error)) {
        throw new UsuarioYaExisteException();
      }
      throw error;
    }
  }
}
