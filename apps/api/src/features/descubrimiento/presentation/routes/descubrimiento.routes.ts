import { Router } from 'express';
import { catchedAsync } from '@core/presentation/utils/catchedAsync.js';
import { DescubrimientoController } from '../controllers/descubrimiento.controller.js';

export const DescubrimientoRoutes = (): Router => {
  const router = Router();
  const controller = new DescubrimientoController();

  router.get('/buscar', catchedAsync(controller.buscar));
  router.get('/destacados', catchedAsync(controller.getDestacadosPortada));

  return router;
};

