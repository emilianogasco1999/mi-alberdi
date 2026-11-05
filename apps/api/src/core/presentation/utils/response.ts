import { Response } from 'express';

export const response = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
): void => {
  res.status(statusCode).json({
    ok: true,
    message,
    data: data ?? null,
  });
};

