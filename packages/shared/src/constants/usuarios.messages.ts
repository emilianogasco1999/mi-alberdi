export const USUARIOS_MESSAGES = {
  VALIDACION: {
    NOMBRE_REQUERIDO: 'El nombre es obligatorio',
    NOMBRE_MIN: 'El nombre debe tener al menos 2 caracteres',
    NOMBRE_MAX: 'El nombre no puede superar los 80 caracteres',
    EMAIL_REQUERIDO: 'El correo electrónico es obligatorio',
    EMAIL_INVALIDO: 'Formato de correo electrónico inválido',
    PASSWORD_REQUERIDO: 'La contraseña es obligatoria',
    PASSWORD_MIN: 'La contraseña debe tener al menos 8 caracteres',
    PASSWORD_COMPLEJIDAD:
      'La contraseña debe contener al menos una letra y un número',
  },
} as const;
