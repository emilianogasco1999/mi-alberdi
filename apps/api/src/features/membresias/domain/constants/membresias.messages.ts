export const membresiasMessages = {
  getPlanesSuccess: {
    statusCode: 200,
    message: 'Catálogo de planes obtenido exitosamente',
  },
  getEstadoNegocioSuccess: {
    statusCode: 200,
    message: 'Estado de membresía del negocio obtenido exitosamente',
  },
  solicitarCambioPlanSuccess: {
    statusCode: 200,
    message: 'Solicitud de cambio de plan procesada exitosamente',
  },
  pruebaActivadaSuccess: {
    statusCode: 201,
    message: '¡Prueba gratuita de 14 días activada exitosamente!',
  },
  canjearPromoSuccess: {
    statusCode: 200,
    message: '¡Código promocional canjeado exitosamente! Tu plan ha sido actualizado.',
  },
  registrarPagoTransferenciaSuccess: {
    statusCode: 201,
    message:
      'Comprobante de transferencia registrado exitosamente. En breve será verificado por el equipo de Mi Alberdi.',
  },
  revisarPagoSuccess: {
    statusCode: 200,
    message: 'Estado del pago actualizado exitosamente',
  },
  ejecutarVencimientosSuccess: {
    statusCode: 200,
    message: 'Proceso de vencimiento de membresías ejecutado exitosamente',
  },
  getPagosSuccess: {
    statusCode: 200,
    message: 'Historial de pagos obtenido exitosamente',
  },
  crearCheckoutSuccess: {
    statusCode: 201,
    message: 'Preferencia de Mercado Pago generada exitosamente',
  },
  webhookProcessedSuccess: {
    statusCode: 200,
    message: 'Webhook recibido y procesado',
  },
  simularPagoSuccess: {
    statusCode: 200,
    message: 'Pago simulado en modo sandbox procesado exitosamente',
  },
} as const;
