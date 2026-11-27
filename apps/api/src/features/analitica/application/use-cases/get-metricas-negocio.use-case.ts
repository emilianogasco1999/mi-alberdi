import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '@core/domain/errors/appErrors.js';
import type {
  MetricasNegocioResponseDTO,
  PeriodoMetricas,
  QueryMetricasNegocioInput,
  RolUsuario,
} from '@mi-alberdi/shared';
import type { IAnaliticaRepository } from '../../domain/repositories/IAnaliticaRepository.js';

export class GetMetricasNegocioUseCase {
  constructor(private readonly repository: IAnaliticaRepository) {}

  async execute(
    negocioId: string,
    userId: string,
    userRole: RolUsuario,
    query: QueryMetricasNegocioInput,
  ): Promise<MetricasNegocioResponseDTO> {
    const negocio = await this.repository.findNegocioById(negocioId);
    if (!negocio) {
      throw NotFoundError('El negocio especificado no existe');
    }

    // Solo el dueño o un administrador pueden ver la analítica comercial
    const esDuenio = negocio.propietarioId === userId;
    const esAdmin = userRole === 'admin';
    if (!esDuenio && !esAdmin) {
      throw ForbiddenError('No tenés autorización para consultar las métricas de este negocio');
    }

    if (query.ubicacionId) {
      const ub = await this.repository.findUbicacionById(query.ubicacionId);
      if (!ub || ub.negocioId !== negocioId) {
        throw ValidationError('La sucursal especificada no pertenece a este negocio');
      }
    }

    // Calcular fechas según período o parámetros custom
    const now = new Date();
    let desde = new Date();
    let hasta = new Date(now);
    let periodoNombre = (query.periodo ?? '30d') as PeriodoMetricas;

    if (query.desde || query.hasta) {
      periodoNombre = 'custom' as any;
      if (query.desde) {
        desde = new Date(query.desde);
        if (isNaN(desde.getTime())) {
          throw ValidationError('Fecha desde inválida');
        }
      } else {
        desde = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      if (query.hasta) {
        hasta = new Date(query.hasta);
        if (isNaN(hasta.getTime())) {
          throw ValidationError('Fecha hasta inválida');
        }
        // Asegurar fin del día si viene en formato YYYY-MM-DD
        if (query.hasta.length === 10) {
          hasta.setHours(23, 59, 59, 999);
        }
      }
    } else {
      switch (periodoNombre) {
        case '7d':
          desde = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          desde = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          desde = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'mes_actual':
          desde = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
          break;
        case 'anio_actual':
          desde = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
          break;
        case 'historico':
          desde = new Date(2020, 0, 1, 0, 0, 0, 0);
          break;
        default:
          desde = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    if (desde > hasta) {
      throw ValidationError('La fecha desde no puede ser posterior a la fecha hasta');
    }

    return this.repository.getMetricasNegocio({
      negocioId,
      desde,
      hasta,
      ubicacionId: query.ubicacionId ?? null,
      periodoNombre,
    });
  }
}

