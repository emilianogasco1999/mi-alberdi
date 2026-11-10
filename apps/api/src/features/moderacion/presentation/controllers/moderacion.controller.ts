import type { Request, Response } from 'express';
import { UnauthorizedError } from '@core/domain/errors/appErrors.js';
import { response } from '@core/presentation/utils/response.js';
import { queryListadosModeracionSchema } from '@mi-alberdi/shared';
import { moderacionMessages } from '../../domain/constants/moderacion.messages.js';
import { ModeracionRepositoryImpl } from '../../infrastructure/repositories/moderacion.repository.impl.js';
import { SolicitarVerificacionUseCase } from '../../application/use-cases/solicitar-verificacion.use-case.js';
import { ResolverSolicitudVerificacionUseCase } from '../../application/use-cases/resolver-solicitud-verificacion.use-case.js';
import { GetSolicitudesVerificacionUseCase } from '../../application/use-cases/get-solicitudes-verificacion.use-case.js';
import { GetMisSolicitudesVerificacionUseCase } from '../../application/use-cases/get-mis-solicitudes-verificacion.use-case.js';
import { CrearReporteUseCase } from '../../application/use-cases/crear-reporte.use-case.js';
import { ResolverReporteUseCase } from '../../application/use-cases/resolver-reporte.use-case.js';
import { GetReportesUseCase } from '../../application/use-cases/get-reportes.use-case.js';
import { CrearFeedbackUseCase } from '../../application/use-cases/crear-feedback.use-case.js';
import { GetFeedbacksUseCase } from '../../application/use-cases/get-feedbacks.use-case.js';
import { MarcarFeedbackLeidoUseCase } from '../../application/use-cases/marcar-feedback-leido.use-case.js';

export class ModeracionController {
  private readonly repository = new ModeracionRepositoryImpl();

  private readonly solicitarVerificacionUseCase = new SolicitarVerificacionUseCase(
    this.repository,
  );
  private readonly resolverSolicitudVerificacionUseCase =
    new ResolverSolicitudVerificacionUseCase(this.repository);
  private readonly getSolicitudesVerificacionUseCase =
    new GetSolicitudesVerificacionUseCase(this.repository);
  private readonly getMisSolicitudesVerificacionUseCase =
    new GetMisSolicitudesVerificacionUseCase(this.repository);

  private readonly crearReporteUseCase = new CrearReporteUseCase(this.repository);
  private readonly resolverReporteUseCase = new ResolverReporteUseCase(
    this.repository,
  );
  private readonly getReportesUseCase = new GetReportesUseCase(this.repository);

  private readonly crearFeedbackUseCase = new CrearFeedbackUseCase(this.repository);
  private readonly getFeedbacksUseCase = new GetFeedbacksUseCase(this.repository);
  private readonly marcarFeedbackLeidoUseCase = new MarcarFeedbackLeidoUseCase(
    this.repository,
  );

  // Verificaciones
  solicitarVerificacion = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw UnauthorizedError('Debés iniciar sesión para solicitar verificación');
    }

    const result = await this.solicitarVerificacionUseCase.execute(
      req.body,
      req.user.id,
    );

    response(
      res,
      moderacionMessages.solicitarVerificacionSuccess.statusCode,
      moderacionMessages.solicitarVerificacionSuccess.message,
      result,
    );
  };

  resolverSolicitudVerificacion = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    if (!req.user) {
      throw UnauthorizedError('Debés iniciar sesión');
    }

    const param = req.params.id;
    const id = Array.isArray(param) ? param[0] : param;

    const result = await this.resolverSolicitudVerificacionUseCase.execute(
      id,
      req.body,
      req.user.id,
    );

    response(
      res,
      moderacionMessages.resolverVerificacionSuccess.statusCode,
      moderacionMessages.resolverVerificacionSuccess.message,
      result,
    );
  };

  getSolicitudes = async (req: Request, res: Response): Promise<void> => {
    const validatedQuery = queryListadosModeracionSchema.parse(req.query);
    const result = await this.getSolicitudesVerificacionUseCase.execute(
      validatedQuery,
    );

    response(
      res,
      moderacionMessages.getSolicitudesSuccess.statusCode,
      moderacionMessages.getSolicitudesSuccess.message,
      result,
    );
  };

  getMisSolicitudes = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw UnauthorizedError('Debés iniciar sesión');
    }

    const result = await this.getMisSolicitudesVerificacionUseCase.execute(
      req.user.id,
    );

    response(
      res,
      moderacionMessages.getSolicitudesSuccess.statusCode,
      moderacionMessages.getSolicitudesSuccess.message,
      result,
    );
  };

  // Reportes
  crearReporte = async (req: Request, res: Response): Promise<void> => {
    const reportanteId = req.user?.id ?? null;
    const dispositivoHash =
      (req.headers['x-device-id'] as string) ||
      (req.headers['x-forwarded-for'] as string) ||
      req.ip ||
      null;

    const result = await this.crearReporteUseCase.execute(req.body, {
      reportanteId,
      dispositivoHash,
    });

    response(
      res,
      moderacionMessages.crearReporteSuccess.statusCode,
      moderacionMessages.crearReporteSuccess.message,
      result,
    );
  };

  resolverReporte = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw UnauthorizedError('Debés iniciar sesión');
    }

    const param = req.params.id;
    const id = Array.isArray(param) ? param[0] : param;

    const result = await this.resolverReporteUseCase.execute(
      id,
      req.body,
      req.user.id,
    );

    response(
      res,
      moderacionMessages.resolverReporteSuccess.statusCode,
      moderacionMessages.resolverReporteSuccess.message,
      result,
    );
  };

  getReportes = async (req: Request, res: Response): Promise<void> => {
    const validatedQuery = queryListadosModeracionSchema.parse(req.query);
    const result = await this.getReportesUseCase.execute(validatedQuery);

    response(
      res,
      moderacionMessages.getReportesSuccess.statusCode,
      moderacionMessages.getReportesSuccess.message,
      result,
    );
  };

  // Feedback de plataforma
  crearFeedback = async (req: Request, res: Response): Promise<void> => {
    const usuarioId = req.user?.id ?? null;
    const ipAddress =
      (req.headers['x-forwarded-for'] as string) || req.ip || null;
    const userAgent = (req.headers['user-agent'] as string) || null;

    const result = await this.crearFeedbackUseCase.execute(req.body, {
      usuarioId,
      ipAddress,
      userAgent,
    });

    response(
      res,
      moderacionMessages.crearFeedbackSuccess.statusCode,
      moderacionMessages.crearFeedbackSuccess.message,
      result,
    );
  };

  getFeedbacks = async (req: Request, res: Response): Promise<void> => {
    const validatedQuery = queryListadosModeracionSchema.parse(req.query);
    const result = await this.getFeedbacksUseCase.execute(validatedQuery);

    response(
      res,
      moderacionMessages.getFeedbackSuccess.statusCode,
      moderacionMessages.getFeedbackSuccess.message,
      result,
    );
  };

  marcarFeedbackLeido = async (req: Request, res: Response): Promise<void> => {
    const param = req.params.id;
    const id = Array.isArray(param) ? param[0] : param;
    const notasAdmin = req.body.notasAdmin ?? null;

    const result = await this.marcarFeedbackLeidoUseCase.execute(id, notasAdmin);

    response(
      res,
      moderacionMessages.marcarLeidoFeedbackSuccess.statusCode,
      moderacionMessages.marcarLeidoFeedbackSuccess.message,
      result,
    );
  };
}

