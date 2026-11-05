import type { Request, Response } from 'express';
import { response } from '@core/presentation/utils/response.js';
import { UnauthorizedError } from '@core/domain/errors/appErrors.js';
import { negociosMessages } from '../../domain/constants/negocios.messages.js';
import { NegociosRepositoryImpl } from '../../infrastructure/repositories/negocios.repository.impl.js';
import { AltaNegocioWizardUseCase } from '../../application/use-cases/alta-negocio-wizard.use-case.js';
import { AltaNegocioSimpleUseCase } from '../../application/use-cases/alta-negocio-simple.use-case.js';
import { GetMisNegociosUseCase } from '../../application/use-cases/get-mis-negocios.use-case.js';
import { GetNegocioDetalleUseCase } from '../../application/use-cases/get-negocio-detalle.use-case.js';
import { GetNegocioPublicoUseCase } from '../../application/use-cases/get-negocio-publico.use-case.js';
import { UpdateNegocioUseCase } from '../../application/use-cases/update-negocio.use-case.js';
import { CreateSucursalUseCase } from '../../application/use-cases/create-sucursal.use-case.js';
import { UpdateSucursalUseCase } from '../../application/use-cases/update-sucursal.use-case.js';
import { DeleteSucursalUseCase } from '../../application/use-cases/delete-sucursal.use-case.js';
import { ConfigurarHorariosUseCase } from '../../application/use-cases/configurar-horarios.use-case.js';
import { VincularMetodosPagoUseCase } from '../../application/use-cases/vincular-metodos-pago.use-case.js';

export class NegociosController {
  private readonly repository = new NegociosRepositoryImpl();
  private readonly altaWizardUseCase = new AltaNegocioWizardUseCase(this.repository);
  private readonly altaSimpleUseCase = new AltaNegocioSimpleUseCase(this.repository);
  private readonly getMisNegociosUseCase = new GetMisNegociosUseCase(this.repository);
  private readonly getDetalleUseCase = new GetNegocioDetalleUseCase(this.repository);
  private readonly getPublicoUseCase = new GetNegocioPublicoUseCase(this.repository);
  private readonly updateUseCase = new UpdateNegocioUseCase(this.repository);
  private readonly createSucursalUseCase = new CreateSucursalUseCase(this.repository);
  private readonly updateSucursalUseCase = new UpdateSucursalUseCase(this.repository);
  private readonly deleteSucursalUseCase = new DeleteSucursalUseCase(this.repository);
  private readonly configurarHorariosUseCase = new ConfigurarHorariosUseCase(this.repository);
  private readonly vincularMetodosPagoUseCase = new VincularMetodosPagoUseCase(this.repository);

  altaWizard = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const result = await this.altaWizardUseCase.execute(req.user.id, req.body);
    response(
      res,
      negociosMessages.altaSuccess.statusCode,
      negociosMessages.altaSuccess.message,
      result,
    );
  };

  altaSimple = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const result = await this.altaSimpleUseCase.execute(req.user.id, req.body);
    response(
      res,
      negociosMessages.altaSuccess.statusCode,
      negociosMessages.altaSuccess.message,
      result,
    );
  };

  getMisNegocios = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const result = await this.getMisNegociosUseCase.execute(req.user.id);
    response(
      res,
      negociosMessages.getMisNegociosSuccess.statusCode,
      negociosMessages.getMisNegociosSuccess.message,
      result,
    );
  };

  getDetalle = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const param = req.params.negocioId;
    const negocioId = Array.isArray(param) ? param[0] : param;
    const result = await this.getDetalleUseCase.execute(negocioId, req.user.id, req.user.rol);
    response(
      res,
      negociosMessages.getDetalleSuccess.statusCode,
      negociosMessages.getDetalleSuccess.message,
      result,
    );
  };

  getPublico = async (req: Request, res: Response): Promise<void> => {
    const param = req.params.slug;
    const slug = Array.isArray(param) ? param[0] : param;
    const result = await this.getPublicoUseCase.execute(slug);
    response(
      res,
      negociosMessages.getPublicoSuccess.statusCode,
      negociosMessages.getPublicoSuccess.message,
      result,
    );
  };

  update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const param = req.params.negocioId;
    const negocioId = Array.isArray(param) ? param[0] : param;
    const result = await this.updateUseCase.execute(
      negocioId,
      req.user.id,
      req.user.rol,
      req.body,
    );
    response(
      res,
      negociosMessages.updateSuccess.statusCode,
      negociosMessages.updateSuccess.message,
      result,
    );
  };

  createSucursal = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const param = req.params.negocioId;
    const negocioId = Array.isArray(param) ? param[0] : param;
    const result = await this.createSucursalUseCase.execute(
      negocioId,
      req.user.id,
      req.user.rol,
      req.body,
    );
    response(
      res,
      negociosMessages.createSucursalSuccess.statusCode,
      negociosMessages.createSucursalSuccess.message,
      result,
    );
  };

  updateSucursal = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const nParam = req.params.negocioId;
    const negocioId = Array.isArray(nParam) ? nParam[0] : nParam;
    const sParam = req.params.sucursalId;
    const sucursalId = Array.isArray(sParam) ? sParam[0] : sParam;

    const result = await this.updateSucursalUseCase.execute(
      negocioId,
      sucursalId,
      req.user.id,
      req.user.rol,
      req.body,
    );
    response(
      res,
      negociosMessages.updateSucursalSuccess.statusCode,
      negociosMessages.updateSucursalSuccess.message,
      result,
    );
  };

  deleteSucursal = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const nParam = req.params.negocioId;
    const negocioId = Array.isArray(nParam) ? nParam[0] : nParam;
    const sParam = req.params.sucursalId;
    const sucursalId = Array.isArray(sParam) ? sParam[0] : sParam;

    await this.deleteSucursalUseCase.execute(negocioId, sucursalId, req.user.id, req.user.rol);
    response(
      res,
      negociosMessages.deleteSucursalSuccess.statusCode,
      negociosMessages.deleteSucursalSuccess.message,
      null,
    );
  };

  configurarHorarios = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const param = req.params.negocioId;
    const negocioId = Array.isArray(param) ? param[0] : param;

    const result = await this.configurarHorariosUseCase.execute(
      negocioId,
      req.user.id,
      req.user.rol,
      req.body,
    );
    response(
      res,
      negociosMessages.configurarHorariosSuccess.statusCode,
      negociosMessages.configurarHorariosSuccess.message,
      result,
    );
  };

  vincularMetodosPago = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const param = req.params.negocioId;
    const negocioId = Array.isArray(param) ? param[0] : param;

    const result = await this.vincularMetodosPagoUseCase.execute(
      negocioId,
      req.user.id,
      req.user.rol,
      req.body,
    );
    response(
      res,
      negociosMessages.vincularMetodosPagoSuccess.statusCode,
      negociosMessages.vincularMetodosPagoSuccess.message,
      result,
    );
  };
}

