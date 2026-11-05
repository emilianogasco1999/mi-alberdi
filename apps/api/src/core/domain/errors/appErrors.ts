export type AppError = Error & {
  statusCode: number;
};

export const createError = (
  message: string,
  statusCode: number,
  name = 'Error',
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.name = name;
  return error;
};

export const ClientError = (message = 'Error del cliente', statusCode = 400): AppError =>
  createError(message, statusCode, 'ClientError');

export const NotFoundError = (message = 'Recurso no encontrado'): AppError =>
  createError(message, 404, 'NotFoundError');

export const UnauthorizedError = (message = 'No autorizado'): AppError =>
  createError(message, 401, 'UnauthorizedError');

export const ForbiddenError = (message = 'Permiso denegado'): AppError =>
  createError(message, 403, 'ForbiddenError');

export const ValidationError = (message = 'Datos inválidos'): AppError =>
  createError(message, 422, 'ValidationError');

