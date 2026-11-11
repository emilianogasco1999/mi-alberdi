import { Request, Response } from 'express';
import { response } from '@core/presentation/utils/response.js';
import { buscarDescubrimientoSchema } from '@mi-alberdi/shared';
import { descubrimientoMessages } from '../../domain/constants/descubrimiento.messages.js';
import { DescubrimientoRepositoryImpl } from '../../infrastructure/repositories/descubrimiento.repository.impl.js';
import { BuscarDescubrimientoUseCase } from '../../application/use-cases/buscar-descubrimiento.use-case.js';
import { GetDestacadosPortadaUseCase } from '../../application/use-cases/get-destacados-portada.use-case.js';

export class DescubrimientoController {
  private readonly repository = new DescubrimientoRepositoryImpl();
  private readonly buscarUseCase = new BuscarDescubrimientoUseCase(this.repository);
  private readonly destacadosUseCase = new GetDestacadosPortadaUseCase(this.repository);

  buscar = async (req: Request, res: Response): Promise<void> => {
    const validatedInput = buscarDescubrimientoSchema.parse(req.query);
    const result = await this.buscarUseCase.execute(validatedInput);

    response(
      res,
      descubrimientoMessages.buscarSuccess.statusCode,
      descubrimientoMessages.buscarSuccess.message,
      result,
    );
  };

  getDestacadosPortada = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.destacadosUseCase.execute();

    response(
      res,
      descubrimientoMessages.destacadosSuccess.statusCode,
      descubrimientoMessages.destacadosSuccess.message,
      result,
    );
  };
}

