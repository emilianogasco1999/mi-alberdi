import { Request, Response } from 'express';
import { response } from '@core/presentation/utils/response.js';
import { taxonomiaMessages } from '../../domain/constants/taxonomia.messages.js';
import { TaxonomiaRepositoryImpl } from '../../infrastructure/repositories/taxonomia.repository.impl.js';
import { GetArbolTaxonomiaUseCase } from '../../application/use-cases/get-arbol-taxonomia.use-case.js';
import { GetRubrosUseCase } from '../../application/use-cases/get-rubros.use-case.js';
import { GetCategoriasByRubroUseCase } from '../../application/use-cases/get-categorias-by-rubro.use-case.js';
import { GetMetodosPagoUseCase } from '../../application/use-cases/get-metodos-pago.use-case.js';

export class TaxonomiaController {
  private readonly repository = new TaxonomiaRepositoryImpl();
  private readonly getArbolUseCase = new GetArbolTaxonomiaUseCase(this.repository);
  private readonly getRubrosUseCase = new GetRubrosUseCase(this.repository);
  private readonly getCategoriasByRubroUseCase = new GetCategoriasByRubroUseCase(this.repository);
  private readonly getMetodosPagoUseCase = new GetMetodosPagoUseCase(this.repository);

  getArbol = async (_req: Request, res: Response): Promise<void> => {
    const arbol = await this.getArbolUseCase.execute();
    response(
      res,
      taxonomiaMessages.getArbolSuccess.statusCode,
      taxonomiaMessages.getArbolSuccess.message,
      arbol,
    );
  };

  getRubros = async (_req: Request, res: Response): Promise<void> => {
    const rubros = await this.getRubrosUseCase.execute();
    response(
      res,
      taxonomiaMessages.getRubrosSuccess.statusCode,
      taxonomiaMessages.getRubrosSuccess.message,
      rubros,
    );
  };

  getCategoriasByRubro = async (req: Request, res: Response): Promise<void> => {
    const param = req.params.rubroIdOrSlug;
    const rubroIdOrSlug = Array.isArray(param) ? param[0] : param;
    const categorias = await this.getCategoriasByRubroUseCase.execute(rubroIdOrSlug);
    response(
      res,
      taxonomiaMessages.getCategoriasSuccess.statusCode,
      taxonomiaMessages.getCategoriasSuccess.message,
      categorias,
    );
  };

  getMetodosPago = async (_req: Request, res: Response): Promise<void> => {
    const metodos = await this.getMetodosPagoUseCase.execute();
    response(
      res,
      taxonomiaMessages.getMetodosPagoSuccess.statusCode,
      taxonomiaMessages.getMetodosPagoSuccess.message,
      metodos,
    );
  };
}

