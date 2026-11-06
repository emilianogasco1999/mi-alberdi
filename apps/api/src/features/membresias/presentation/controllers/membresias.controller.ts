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
    response(
      res,
      membresiasMessages.canjearPromoSuccess.statusCode,
      result.mensaje,
      result,
    );
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
}
