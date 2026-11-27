import type {
  ApiSuccessResponse,
  CrearUsuarioComercianteInput,
  UsuarioPublicoDto,
} from '@mi-alberdi/shared';
import { apiClient } from '@/core/api/api.client';
import type { IUsuariosAdminRepository } from '../../domain/repositories/usuarios-admin.repository.interface';

export class UsuariosAdminRepositoryImpl implements IUsuariosAdminRepository {
  async crearComerciante(input: CrearUsuarioComercianteInput): Promise<UsuarioPublicoDto> {
    const { data } = await apiClient.post<ApiSuccessResponse<UsuarioPublicoDto>>(
      '/admin/usuarios',
      input,
    );
    return data.data;
  }
}
