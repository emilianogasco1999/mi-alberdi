import type { Request, Response } from 'express';
import { response } from '@core/presentation/utils/response.js';
import { UnauthorizedError } from '@core/domain/errors/appErrors.js';
import { membresiasMessages } from '../../domain/constants/membresias.messages.js';
import { MembresiasRepositoryImpl } from '../../infrastructure/repositories/membresias.repository.impl.js';
import { GetPlanesCatalogoUseCase } from '../../application/use-cases/get-planes-catalogo.use-case.js';
import { GetEstadoMembresiaNegocioUseCase } from '../../application/use-cases/get-estado-membresia-negocio.use-case.js';
import { SolicitarCambioPlanUseCase } from '../../application/use-cases/solicitar-cambio-plan.use-case.js';
import { CanjearCodigoPromoUseCase } from '../../application/use-cases/canjear-codigo-promo.use-case.js';
import { RegistrarPagoTransferenciaUseCase } from '../../application/use-cases/registrar-pago-transferencia.use-case.js';
import { RevisarPagoManualUseCase } from '../../application/use-cases/revisar-pago-manual.use-case.js';
import { EjecutarVencimientoMembresiasUseCase } from '../../application/use-cases/ejecutar-vencimiento-membresias.use-case.js';
import { GetHistorialPagosNegocioUseCase } from '../../application/use-cases/get-historial-pagos-negocio.use-case.js';
import { GetPagosAdminUseCase } from '../../application/use-cases/get-pagos-admin.use-case.js';
import { CrearCheckoutMercadoPagoUseCase } from '../../application/use-cases/crear-checkout-mercadopago.use-case.js';
import { ProcesarWebhookMercadoPagoUseCase } from '../../application/use-cases/procesar-webhook-mercadopago.use-case.js';
import { SimularPagoWebhookUseCase } from '../../application/use-cases/simular-pago-webhook.use-case.js';
import { type PagosMembresiaQueryInput, pagosMembresiaQuerySchema } from '@mi-alberdi/shared';

export class MembresiasController {
  private readonly repository = new MembresiasRepositoryImpl();
  private readonly getPlanesUseCase = new GetPlanesCatalogoUseCase(this.repository);
  private readonly getEstadoUseCase = new GetEstadoMembresiaNegocioUseCase(this.repository);
  private readonly solicitarCambioPlanUseCase = new SolicitarCambioPlanUseCase(this.repository);
  private readonly canjearPromoUseCase = new CanjearCodigoPromoUseCase(this.repository);
  private readonly registrarPagoTransferenciaUseCase = new RegistrarPagoTransferenciaUseCase(
    this.repository,
  );
  private readonly revisarPagoManualUseCase = new RevisarPagoManualUseCase(this.repository);
  private readonly ejecutarVencimientosUseCase = new EjecutarVencimientoMembresiasUseCase(
    this.repository,
  );
  private readonly getHistorialPagosNegocioUseCase = new GetHistorialPagosNegocioUseCase(
    this.repository,
  );
  private readonly getPagosAdminUseCase = new GetPagosAdminUseCase(this.repository);
  private readonly crearCheckoutMpUseCase = new CrearCheckoutMercadoPagoUseCase(this.repository);
  private readonly webhookMpUseCase = new ProcesarWebhookMercadoPagoUseCase(this.repository);
  private readonly simularPagoUseCase = new SimularPagoWebhookUseCase(this.repository);

  getPlanes = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.getPlanesUseCase.execute();
    response(
      res,
      membresiasMessages.getPlanesSuccess.statusCode,
      membresiasMessages.getPlanesSuccess.message,
      result,
    );
  };

  getEstadoNegocio = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const param = req.params.negocioId;
    const negocioId = Array.isArray(param) ? param[0] : param;
    const result = await this.getEstadoUseCase.execute(negocioId, req.user.id, req.user.rol);
    response(
      res,
      membresiasMessages.getEstadoNegocioSuccess.statusCode,
      membresiasMessages.getEstadoNegocioSuccess.message,
      result,
    );
  };

  solicitarCambioPlan = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const result = await this.solicitarCambioPlanUseCase.execute(
      req.user.id,
      req.user.rol,
      req.body,
    );
    const statusCode =
      result.tipo === 'prueba_activada'
        ? membresiasMessages.pruebaActivadaSuccess.statusCode
        : membresiasMessages.solicitarCambioPlanSuccess.statusCode;

    response(res, statusCode, result.mensaje, result);
  };

  canjearCodigoPromo = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const result = await this.canjearPromoUseCase.execute(req.user.id, req.user.rol, req.body);
    response(res, membresiasMessages.canjearPromoSuccess.statusCode, result.mensaje, result);
  };

  registrarPagoTransferencia = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const result = await this.registrarPagoTransferenciaUseCase.execute(
      req.user.id,
      req.user.rol,
      req.body,
    );
    response(
      res,
      membresiasMessages.registrarPagoTransferenciaSuccess.statusCode,
      membresiasMessages.registrarPagoTransferenciaSuccess.message,
      result,
    );
  };

  revisarPagoManual = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const result = await this.revisarPagoManualUseCase.execute(req.user.rol, req.body);
    response(
      res,
      membresiasMessages.revisarPagoSuccess.statusCode,
      membresiasMessages.revisarPagoSuccess.message,
      result,
    );
  };

  ejecutarVencimientos = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const result = await this.ejecutarVencimientosUseCase.execute(req.user.rol);
    response(
      res,
      membresiasMessages.ejecutarVencimientosSuccess.statusCode,
      membresiasMessages.ejecutarVencimientosSuccess.message,
      result,
    );
  };

  getHistorialPagosNegocio = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const param = req.params.negocioId;
    const negocioId = Array.isArray(param) ? param[0] : param;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await this.getHistorialPagosNegocioUseCase.execute({
      negocioId,
      usuarioId: req.user.id,
      rol: req.user.rol,
      page,
      limit,
    });

    response(
      res,
      membresiasMessages.getPagosSuccess.statusCode,
      membresiasMessages.getPagosSuccess.message,
      result,
    );
  };

  getPagosAdmin = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const query = pagosMembresiaQuerySchema.parse(req.query);
    const result = await this.getPagosAdminUseCase.execute(req.user.rol, query);

    response(
      res,
      membresiasMessages.getPagosSuccess.statusCode,
      membresiasMessages.getPagosSuccess.message,
      result,
    );
  };

  crearCheckoutMp = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const result = await this.crearCheckoutMpUseCase.execute({
      usuarioId: req.user.id,
      rol: req.user.rol,
      emailComprador: req.user.email,
      input: req.body,
    });

    response(
      res,
      membresiasMessages.crearCheckoutSuccess.statusCode,
      membresiasMessages.crearCheckoutSuccess.message,
      result,
    );
  };

  webhookMp = async (req: Request, res: Response): Promise<void> => {
    // Los webhooks pueden venir por body (POST) o query params (GET/IPN)
    const payload = { ...req.query, ...req.body };
    const result = await this.webhookMpUseCase.execute(payload);

    response(res, membresiasMessages.webhookProcessedSuccess.statusCode, result.mensaje, result);
  };

  simularPagoSandbox = async (req: Request, res: Response): Promise<void> => {
    const result = await this.simularPagoUseCase.execute(req.body);

    response(
      res,
      membresiasMessages.simularPagoSuccess.statusCode,
      membresiasMessages.simularPagoSuccess.message,
      result,
    );
  };
}


