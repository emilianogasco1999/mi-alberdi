import type { Request, Response } from 'express';
import { createHash } from 'node:crypto';
import { UnauthorizedError } from '@core/domain/errors/appErrors.js';
import { response } from '@core/presentation/utils/response.js';
import { queryMetricasNegocioSchema } from '@mi-alberdi/shared';
import { analiticaMessages } from '../../domain/constants/analitica.messages.js';
import { AnaliticaRepositoryImpl } from '../../infrastructure/repositories/analitica.repository.impl.js';
import { RegistrarEventoUseCase } from '../../application/use-cases/registrar-evento.use-case.js';
import { RegistrarEventosBatchUseCase } from '../../application/use-cases/registrar-eventos-batch.use-case.js';
import { GetMetricasNegocioUseCase } from '../../application/use-cases/get-metricas-negocio.use-case.js';

export class AnaliticaController {
  private readonly repository = new AnaliticaRepositoryImpl();
  private readonly registrarEventoUseCase = new RegistrarEventoUseCase(this.repository);
  private readonly registrarBatchUseCase = new RegistrarEventosBatchUseCase(this.repository);
  private readonly getMetricasNegocioUseCase = new GetMetricasNegocioUseCase(this.repository);

  registrarEvento = async (req: Request, res: Response): Promise<void> => {
    const input = { ...req.body };

    // Si el cliente no envió dispositivoHash, generar un hash SHA-256 anónimo con IP + User-Agent
    if (!input.dispositivoHash) {
      const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'unknown';
      input.dispositivoHash = createHash('sha256')
        .update(`${ip}:${userAgent}`)
        .digest('hex');
    }

    const result = await this.registrarEventoUseCase.execute(input);

    response(
      res,
      analiticaMessages.registrarEventoSuccess.statusCode,
      analiticaMessages.registrarEventoSuccess.message,
      result,
    );
  };

  registrarBatch = async (req: Request, res: Response): Promise<void> => {
    const input = { ...req.body };
    const defaultHash = createHash('sha256')
      .update(`${req.ip || '127.0.0.1'}:${req.headers['user-agent'] || 'unknown'}`)
      .digest('hex');

    input.eventos = input.eventos.map((ev: any) => ({
      ...ev,
      dispositivoHash: ev.dispositivoHash || defaultHash,
    }));

    const result = await this.registrarBatchUseCase.execute(input);

    response(
      res,
      analiticaMessages.registrarBatchSuccess.statusCode,
      analiticaMessages.registrarBatchSuccess.message,
      result,
    );
  };

  getMetricasNegocio = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw UnauthorizedError('Debés iniciar sesión para acceder a las métricas del negocio');
    }

    const param = req.params.negocioId;
    const negocioId = Array.isArray(param) ? param[0] : param;
    const validatedQuery = queryMetricasNegocioSchema.parse(req.query);

    const result = await this.getMetricasNegocioUseCase.execute(
      negocioId,
      req.user.id,
      req.user.rol,
      validatedQuery,
    );

    response(
      res,
      analiticaMessages.getMetricasSuccess.statusCode,
      analiticaMessages.getMetricasSuccess.message,
      result,
    );
  };
}
