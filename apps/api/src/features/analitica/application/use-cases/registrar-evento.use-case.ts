import { NotFoundError, ValidationError } from '@core/domain/errors/appErrors.js';
import type { RegistrarEventoInput } from '@mi-alberdi/shared';
import type {
  IAnaliticaRepository,
  RegistrarEventoData,
} from '../../domain/repositories/IAnaliticaRepository.js';

export class RegistrarEventoUseCase {
  constructor(private readonly repository: IAnaliticaRepository) {}

  async execute(input: RegistrarEventoInput): Promise<{ id: string; creadoEn: Date }> {
    const negocio = await this.repository.findNegocioById(input.negocioId);
    if (!negocio) {
      throw NotFoundError('El negocio especificado no existe');
    }

    if (input.publicacionId) {
      const pub = await this.repository.findPublicacionById(input.publicacionId);
      if (!pub || pub.negocioId !== input.negocioId) {
        throw ValidationError('La publicación indicada no pertenece a este negocio');
      }
    }

    if (input.ubicacionId) {
      const ub = await this.repository.findUbicacionById(input.ubicacionId);
      if (!ub || ub.negocioId !== input.negocioId) {
        throw ValidationError('La sucursal/ubicación indicada no pertenece a este negocio');
      }
    }

    if (input.reelId) {
      const reel = await this.repository.findReelById(input.reelId);
      if (!reel || reel.negocioId !== input.negocioId) {
        throw ValidationError('El reel/historia indicado no pertenece a este negocio');
      }
    }

    const data: RegistrarEventoData = {
      ...input,
    };

    return this.repository.registrarEvento(data);
  }
}

