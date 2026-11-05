import bcrypt from 'bcrypt';
import type { AuthUserDTO, RegisterUserInput } from '@mi-alberdi/shared';
import { ClientError } from '@core/domain/errors/appErrors.js';
import type { IAuthRepository } from '../../domain/repositories/IAuthRepository.js';

export class RegisterUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(input: RegisterUserInput): Promise<AuthUserDTO> {
    const existing = await this.authRepository.findByEmail(input.email);
    if (existing) {
      throw ClientError('El correo electrónico ya se encuentra registrado', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await this.authRepository.create({
      nombre: input.nombre,
      apellido: input.apellido ?? null,
      email: input.email,
      telefono: input.telefono ?? null,
      passwordHash,
    });

    return {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono,
      avatarUrl: user.avatarUrl,
      rol: user.rol,
      puedeProbarPremium: user.puedeProbarPremium,
    };
  }
}

