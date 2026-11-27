import {
  ForbiddenError,
  NotFoundError,
} from '@core/domain/errors/appErrors.js';
import type { RolUsuario } from '@mi-alberdi/shared';
import type { IOpinionesRepository } from '../../domain/repositories/IOpinionesRepository.js';

export class DeleteOpinionUseCase {
  constructor(private readonly repository: IOpinionesRepository) {}

  async execute(
    opinionId: string,
    userId: string,
    userRole: RolUsuario,
  ): Promise<void> {
    const opinion = await this.repository.findOpinionById(opinionId);
    if (!opinion) {
      throw NotFoundError('La opinión especificada no existe');
    }

    const esAutor = opinion.usuarioId === userId;
    const esAdminOModerador = userRole === 'admin' || userRole === 'moderador';

    if (!esAutor && !esAdminOModerador) {
      throw ForbiddenError('No tenés autorización para eliminar esta opinión');
    }

    return this.repository.deleteOpinion(opinionId, opinion.negocioId);
  }
}
