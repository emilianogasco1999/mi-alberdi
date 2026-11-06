import { Router } from 'express';
import { catchedAsync } from '@core/presentation/utils/catchedAsync.js';
import { TaxonomiaController } from '../controllers/taxonomia.controller.js';

export const TaxonomiaRoutes = (): Router => {
  const router = Router();
  const controller = new TaxonomiaController();

  router.get('/arbol', catchedAsync(controller.getArbol));
  router.get('/rubros', catchedAsync(controller.getRubros));
  router.get('/rubros/:rubroIdOrSlug/categorias', catchedAsync(controller.getCategoriasByRubro));
  router.get('/metodos-pago', catchedAsync(controller.getMetodosPago));
  router.get('/planes', catchedAsync(controller.getPlanes));

  return router;
};
