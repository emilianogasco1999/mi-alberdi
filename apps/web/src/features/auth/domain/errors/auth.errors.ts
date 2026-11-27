export class InvalidCredentialsError extends Error {
  constructor() {
    super('Correo o contraseña incorrectos.');
    this.name = 'InvalidCredentialsError';
  }
}

export class AuthServiceError extends Error {
  constructor(message = 'No se pudo completar la operación de autenticación.') {
    super(message);
    this.name = 'AuthServiceError';
  }
}
