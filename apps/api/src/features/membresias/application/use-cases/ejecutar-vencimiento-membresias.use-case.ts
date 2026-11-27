import { ForbiddenError } from '@core/domain/errors/appErrors.js';
import type { IMembresiasRepository } from '../../domain/repositories/IMembresiasRepository.js';

export class EjecutarVencimientoMembresiasUseCase {
  constructor(private readonly repository: IMembresiasRepository) {}

  async execute(rol: string): Promise<{ membresiasVencidas: number }> {
    const esAdmin = rol === 'admin' || rol === 'administrador' || rol === 'moderador';
    if (!esAdmin) {
      throw ForbiddenError('Solo los administradores pueden ejecutar el proceso de vencimientos');
    }

    return this.repository.ejecutarVencimientoMembresias();
  }
}

