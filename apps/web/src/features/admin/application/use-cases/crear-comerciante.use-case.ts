import type { CrearUsuarioComercianteInput, UsuarioPublicoDto } from '@mi-alberdi/shared';
import type { IUsuariosAdminRepository } from '../../domain/repositories/usuarios-admin.repository.interface';

export class CrearComercianteUseCase {
  constructor(private readonly repository: IUsuariosAdminRepository) {}

  execute(input: CrearUsuarioComercianteInput): Promise<UsuarioPublicoDto> {
    return this.repository.crearComerciante(input);
  }
}
