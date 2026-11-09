import type { Request, Response } from 'express';
import { UnauthorizedError } from '@core/domain/errors/appErrors.js';
import { response } from '@core/presentation/utils/response.js';
import { queryOpinionesNegocioSchema } from '@mi-alberdi/shared';
import { opinionesMessages } from '../../domain/constants/opiniones.messages.js';
import { OpinionesRepositoryImpl } from '../../infrastructure/repositories/opiniones.repository.impl.js';
import { CreateOpinionUseCase } from '../../application/use-cases/create-opinion.use-case.js';
import { ResponderOpinionUseCase } from '../../application/use-cases/responder-opinion.use-case.js';
import { GetOpinionesNegocioUseCase } from '../../application/use-cases/get-opiniones-negocio.use-case.js';
import { GetMiOpinionUseCase } from '../../application/use-cases/get-mi-opinion.use-case.js';
import { DeleteOpinionUseCase } from '../../application/use-cases/delete-opinion.use-case.js';

export class OpinionesController {
  private readonly repository = new OpinionesRepositoryImpl();
  private readonly createOpinionUseCase = new CreateOpinionUseCase(this.repository);
  private readonly responderOpinionUseCase = new ResponderOpinionUseCase(this.repository);
  private readonly getOpinionesNegocioUseCase = new GetOpinionesNegocioUseCase(this.repository);
  private readonly getMiOpinionUseCase = new GetMiOpinionUseCase(this.repository);
  private readonly deleteOpinionUseCase = new DeleteOpinionUseCase(this.repository);

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw UnauthorizedError('Debés iniciar sesión para calificar este negocio');
    }

    const dispositivoId = (req.headers['x-device-id'] as string) || null;

    const result = await this.createOpinionUseCase.execute(
      req.user.id,
      req.body,
      dispositivoId,
    );

    response(
      res,
      opinionesMessages.createSuccess.statusCode,
      opinionesMessages.createSuccess.message,
      result,
    );
  };

  responder = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw UnauthorizedError('Debés iniciar sesión para responder opiniones');
    }

    const param = req.params.id;
    const opinionId = Array.isArray(param) ? param[0] : param;

    const result = await this.responderOpinionUseCase.execute(
      opinionId,
      req.user.id,
      req.user.rol,
      req.body,
    );

    response(
      res,
      opinionesMessages.responderSuccess.statusCode,
      opinionesMessages.responderSuccess.message,
      result,
    );
  };

  getOpinionesNegocio = async (req: Request, res: Response): Promise<void> => {
    const param = req.params.negocioId;
    const negocioId = Array.isArray(param) ? param[0] : param;
    const validatedQuery = queryOpinionesNegocioSchema.parse(req.query);

    const result = await this.getOpinionesNegocioUseCase.execute(negocioId, validatedQuery);

    response(
      res,
      opinionesMessages.getOpinionesSuccess.statusCode,
      opinionesMessages.getOpinionesSuccess.message,
      result,
    );
  };

  getMiOpinion = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw UnauthorizedError('Debés iniciar sesión para ver tu opinión');
    }

    const param = req.params.negocioId;
    const negocioId = Array.isArray(param) ? param[0] : param;

    const result = await this.getMiOpinionUseCase.execute(req.user.id, negocioId);

    response(
      res,
      opinionesMessages.getMiOpinionSuccess.statusCode,
      opinionesMessages.getMiOpinionSuccess.message,
      result,
    );
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw UnauthorizedError('Debés iniciar sesión para eliminar una opinión');
    }

    const param = req.params.id;
    const opinionId = Array.isArray(param) ? param[0] : param;

    await this.deleteOpinionUseCase.execute(opinionId, req.user.id, req.user.rol);

    response(
      res,
      opinionesMessages.deleteSuccess.statusCode,
      opinionesMessages.deleteSuccess.message,
      null,
    );
  };
}
