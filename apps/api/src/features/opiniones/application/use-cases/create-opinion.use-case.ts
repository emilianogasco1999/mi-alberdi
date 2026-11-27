import {
  ClientError,
  NotFoundError,
  ValidationError,
} from '@core/domain/errors/appErrors.js';
import type { CreateOpinionInput, OpinionDTO } from '@mi-alberdi/shared';
import type { IOpinionesRepository } from '../../domain/repositories/IOpinionesRepository.js';

export class CreateOpinionUseCase {
  constructor(private readonly repository: IOpinionesRepository) {}

  async execute(
    userId: string,
    input: CreateOpinionInput,
    dispositivoId?: string | null,
  ): Promise<OpinionDTO> {
    const negocio = await this.repository.findNegocioById(input.negocioId);
    if (!negocio) {
      throw NotFoundError('El negocio especificado no existe');
    }

    // Regla de dominio: Antifraude - el comerciante no puede calificarse a sí mismo
    if (negocio.propietarioId === userId) {
      throw ClientError('No podés calificar ni emitir opiniones sobre tu propio negocio', 400);
    }

    // Validar publicación si fue provista
    if (input.publicacionId) {
      const pub = await this.repository.findPublicacionById(input.publicacionId);
      if (!pub || pub.negocioId !== input.negocioId) {
        throw ValidationError('La publicación indicada no pertenece a este negocio');
      }
    }

    // Regla de dominio: 1 opinión por usuario por negocio (evita spam o duplicados)
    const opinionExistente = await this.repository.findOpinionByUsuarioYNegocio(
      userId,
      input.negocioId,
    );
    if (opinionExistente) {
      throw ClientError(
        'Ya emitiste una opinión para este negocio. Podés eliminarla si deseás publicar una nueva.',
        409,
      );
    }

    let nombreAutorVisible = input.nombreAutorVisible?.trim();
    if (!nombreAutorVisible) {
      const usuario = await this.repository.findUsuarioById(userId);
      if (usuario) {
        nombreAutorVisible = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
      }
    }

    if (!nombreAutorVisible) {
      nombreAutorVisible = 'Vecino de Alberdi';
    }

    return this.repository.createOpinion({
      ...input,
      usuarioId: userId,
      nombreAutorVisible,
      dispositivoId,
    });
  }
}
