import type { CrearUsuarioComercianteInput, UsuarioPublicoDto } from '@mi-alberdi/shared';

export interface IUsuariosAdminRepository {
  crearComerciante(input: CrearUsuarioComercianteInput): Promise<UsuarioPublicoDto>;
}
