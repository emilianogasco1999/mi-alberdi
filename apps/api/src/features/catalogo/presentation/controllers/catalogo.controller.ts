import type { Request, Response } from 'express';
import { response } from '@core/presentation/utils/response.js';
import { UnauthorizedError } from '@core/domain/errors/appErrors.js';
import { catalogoMessages } from '../../domain/constants/catalogo.messages.js';
import { CatalogoRepositoryImpl } from '../../infrastructure/repositories/catalogo.repository.impl.js';
import { CreatePublicacionUseCase } from '../../application/use-cases/create-publicacion.use-case.js';
import { GetMisPublicacionesUseCase } from '../../application/use-cases/get-mis-publicaciones.use-case.js';
import { GetPublicacionDetalleUseCase } from '../../application/use-cases/get-publicacion-detalle.use-case.js';
import { GetPublicacionPublicaUseCase } from '../../application/use-cases/get-publicacion-publica.use-case.js';
import { UpdatePublicacionUseCase } from '../../application/use-cases/update-publicacion.use-case.js';
import { ToggleDestacadaUseCase } from '../../application/use-cases/toggle-destacada.use-case.js';
import { CambiarEstadoPublicacionUseCase } from '../../application/use-cases/cambiar-estado-publicacion.use-case.js';
import { ReordenarImagenesUseCase } from '../../application/use-cases/reordenar-imagenes.use-case.js';
import { DeletePublicacionUseCase } from '../../application/use-cases/delete-publicacion.use-case.js';

export class CatalogoController {
  private readonly repository = new CatalogoRepositoryImpl();
  private readonly createUseCase = new CreatePublicacionUseCase(this.repository);
  private readonly getMisPublicacionesUseCase = new GetMisPublicacionesUseCase(this.repository);
  private readonly getDetalleUseCase = new GetPublicacionDetalleUseCase(this.repository);
  private readonly getPublicaUseCase = new GetPublicacionPublicaUseCase(this.repository);
  private readonly updateUseCase = new UpdatePublicacionUseCase(this.repository);
  private readonly toggleDestacadaUseCase = new ToggleDestacadaUseCase(this.repository);
  private readonly cambiarEstadoUseCase = new CambiarEstadoPublicacionUseCase(this.repository);
  private readonly reordenarImagenesUseCase = new ReordenarImagenesUseCase(this.repository);
  private readonly deleteUseCase = new DeletePublicacionUseCase(this.repository);

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const result = await this.createUseCase.execute(req.user.id, req.user.rol, req.body);
    response(
      res,
      catalogoMessages.createSuccess.statusCode,
      catalogoMessages.createSuccess.message,
      result,
    );
  };

  getMisPublicaciones = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const param = req.params.negocioId;
    const negocioId = Array.isArray(param) ? param[0] : param;
    const result = await this.getMisPublicacionesUseCase.execute(
      negocioId,
      req.user.id,
      req.user.rol,
    );
    response(
      res,
      catalogoMessages.getMisPublicacionesSuccess.statusCode,
      catalogoMessages.getMisPublicacionesSuccess.message,
      result,
    );
  };

  getDetalle = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const param = req.params.id;
    const id = Array.isArray(param) ? param[0] : param;
    const result = await this.getDetalleUseCase.execute(id, req.user.id, req.user.rol);
    response(
      res,
      catalogoMessages.getDetalleSuccess.statusCode,
      catalogoMessages.getDetalleSuccess.message,
      result,
    );
  };

  getPublica = async (req: Request, res: Response): Promise<void> => {
    const param = req.params.slug;
    const slug = Array.isArray(param) ? param[0] : param;
    const result = await this.getPublicaUseCase.execute(slug);
    response(
      res,
      catalogoMessages.getPublicaSuccess.statusCode,
      catalogoMessages.getPublicaSuccess.message,
      result,
    );
  };

  update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const param = req.params.id;
    const id = Array.isArray(param) ? param[0] : param;
    const result = await this.updateUseCase.execute(id, req.user.id, req.user.rol, req.body);
    response(
      res,
      catalogoMessages.updateSuccess.statusCode,
      catalogoMessages.updateSuccess.message,
      result,
    );
  };

  toggleDestacada = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const param = req.params.id;
    const id = Array.isArray(param) ? param[0] : param;
    const result = await this.toggleDestacadaUseCase.execute(
      id,
      req.user.id,
      req.user.rol,
      Boolean(req.body.esDestacada),
    );
    response(
      res,
      catalogoMessages.toggleDestacadaSuccess.statusCode,
      catalogoMessages.toggleDestacadaSuccess.message,
      result,
    );
  };

  cambiarEstado = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const param = req.params.id;
    const id = Array.isArray(param) ? param[0] : param;
    const result = await this.cambiarEstadoUseCase.execute(
      id,
      req.user.id,
      req.user.rol,
      req.body.estado,
    );
    response(
      res,
      catalogoMessages.cambiarEstadoSuccess.statusCode,
      catalogoMessages.cambiarEstadoSuccess.message,
      result,
    );
  };

  reordenarImagenes = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const param = req.params.id;
    const id = Array.isArray(param) ? param[0] : param;
    const result = await this.reordenarImagenesUseCase.execute(
      id,
      req.user.id,
      req.user.rol,
      req.body,
    );
    response(
      res,
      catalogoMessages.reordenarImagenesSuccess.statusCode,
      catalogoMessages.reordenarImagenesSuccess.message,
      result,
    );
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw UnauthorizedError();
    const param = req.params.id;
    const id = Array.isArray(param) ? param[0] : param;
    await this.deleteUseCase.execute(id, req.user.id, req.user.rol);
    response(
      res,
      catalogoMessages.deleteSuccess.statusCode,
      catalogoMessages.deleteSuccess.message,
      null,
    );
  };
}
