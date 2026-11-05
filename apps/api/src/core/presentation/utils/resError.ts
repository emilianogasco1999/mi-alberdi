import { Response } from 'express';

export const resError = (
  res: Response,
  statusCode: number,
  message: string,
  code = 'APP_ERROR',
  details?: unknown,
): void => {
  res.status(statusCode).json({
    ok: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
};

