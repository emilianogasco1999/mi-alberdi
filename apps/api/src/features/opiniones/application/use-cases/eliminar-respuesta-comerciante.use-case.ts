import {
  ForbiddenError,
  NotFoundError,
} from '@core/domain/errors/appErrors.js';
import type { OpinionDTO, RolUsuario } from '@mi-alberdi/shared';
import type { IOpinionesRepository } from '../../domain/repositories/IOpinionesRepository.js';

export class EliminarRespuestaComercianteUseCase {
  constructor(private readonly repository: IOpinionesRepository) {}

  async execute(
    opinionId: string,
    userId: string,
    userRole: RolUsuario,
  ): Promise<OpinionDTO> {
    const opinion = await this.repository.findOpinionById(opinionId);
    if (!opinion) {
      throw NotFoundError('La opinión especificada no existe');
    }

    const esDuenio = opinion.propietarioNegocioId === userId;
    const esAdmin = userRole === 'admin';

    if (!esDuenio && !esAdmin) {
      throw ForbiddenError('Solo el dueño del comercio puede eliminar esta respuesta');
    }

    return this.repository.eliminarRespuesta(opinionId);
  }
}
