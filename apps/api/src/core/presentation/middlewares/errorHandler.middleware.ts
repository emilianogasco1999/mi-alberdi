import { Request, Response, NextFunction } from 'express';
import { AppError } from '@core/domain/errors/appErrors.js';
import { resError } from '../utils/resError.js';

export const errorHandler = (
  err: AppError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = 'statusCode' in err && err.statusCode ? err.statusCode : 500;
  const message = statusCode === 500 ? 'Error interno del servidor' : err.message;

  if (statusCode === 500) {
    console.error('🔥 [Error 500]:', err);
  }

  resError(res, statusCode, message, err.name || 'INTERNAL_ERROR');
};

