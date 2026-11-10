export const CODIGOS_PLAN = {
  GRATIS: 'gratis',
  PLATA: 'plata',
  ORO: 'oro',
} as const;

export const CODIGOS_PLAN_VALUES = [
  CODIGOS_PLAN.GRATIS,
  CODIGOS_PLAN.PLATA,
  CODIGOS_PLAN.ORO,
] as const;

export type CodigoPlan = (typeof CODIGOS_PLAN)[keyof typeof CODIGOS_PLAN];

export const LIMITES_PLAN_DEFAULT = {
  [CODIGOS_PLAN.GRATIS]: {
    precioMensualArs: 0,
    maxPublicaciones: 2,
    maxFotosPorPublicacion: 3,
    cuposDestacados: 0,
    maxSucursales: 1,
    maxReelsActivos: 0,
    prioridadBase: 0,
  },
  [CODIGOS_PLAN.PLATA]: {
    precioMensualArs: 1500,
    maxPublicaciones: 10,
    maxFotosPorPublicacion: 6,
    cuposDestacados: 1,
    maxSucursales: 3,
    maxReelsActivos: 1,
    prioridadBase: 10,
  },
  [CODIGOS_PLAN.ORO]: {
    precioMensualArs: 2500,
    maxPublicaciones: 999,
    maxFotosPorPublicacion: 10,
    cuposDestacados: 3,
    maxSucursales: 10,
    maxReelsActivos: 3,
    prioridadBase: 20,
  },
} as const;

export const TIPOS_PERFIL_COMERCIAL = {
  COMERCIO: 'comercio',
  OFICIO: 'oficio',
  PROFESIONAL: 'profesional',
  EMPRENDIMIENTO: 'emprendimiento',
} as const;

export const TIPOS_PERFIL_COMERCIAL_VALUES = [
  TIPOS_PERFIL_COMERCIAL.COMERCIO,
  TIPOS_PERFIL_COMERCIAL.OFICIO,
  TIPOS_PERFIL_COMERCIAL.PROFESIONAL,
  TIPOS_PERFIL_COMERCIAL.EMPRENDIMIENTO,
] as const;

export type TipoPerfilComercial =
  (typeof TIPOS_PERFIL_COMERCIAL)[keyof typeof TIPOS_PERFIL_COMERCIAL];

export const TIPOS_PUBLICACION = {
  SERVICIO: 'servicio',
  PRODUCTO: 'producto',
} as const;

export const TIPOS_PUBLICACION_VALUES = [
  TIPOS_PUBLICACION.SERVICIO,
  TIPOS_PUBLICACION.PRODUCTO,
] as const;

export type TipoPublicacion = (typeof TIPOS_PUBLICACION)[keyof typeof TIPOS_PUBLICACION];

export const MODALIDADES_ATENCION = {
  HORARIOS_FIJOS: 'horarios_fijos',
  POR_TURNOS: 'por_turnos',
  POR_PEDIDO: 'por_pedido',
  ATENCION_24HS: 'atencion_24hs',
  SOLO_WHATSAPP: 'solo_whatsapp',
} as const;

export const MODALIDADES_ATENCION_VALUES = [
  MODALIDADES_ATENCION.HORARIOS_FIJOS,
  MODALIDADES_ATENCION.POR_TURNOS,
  MODALIDADES_ATENCION.POR_PEDIDO,
  MODALIDADES_ATENCION.ATENCION_24HS,
  MODALIDADES_ATENCION.SOLO_WHATSAPP,
] as const;

export type ModalidadAtencion = (typeof MODALIDADES_ATENCION)[keyof typeof MODALIDADES_ATENCION];

export const ALCANCES_ENVIO = {
  SIN_ENVIO: 'sin_envio',
  SOLO_ALBERDI: 'solo_alberdi',
  ALBERDI_Y_ALREDEDORES: 'alberdi_y_alrededores',
  TODO_EL_PAIS: 'todo_el_pais',
} as const;

export const ALCANCES_ENVIO_VALUES = [
  ALCANCES_ENVIO.SIN_ENVIO,
  ALCANCES_ENVIO.SOLO_ALBERDI,
  ALCANCES_ENVIO.ALBERDI_Y_ALREDEDORES,
  ALCANCES_ENVIO.TODO_EL_PAIS,
] as const;

export type AlcanceEnvio = (typeof ALCANCES_ENVIO)[keyof typeof ALCANCES_ENVIO];

export const ESTADOS_NEGOCIO = {
  BORRADOR: 'borrador',
  ACTIVO: 'activo',
  PAUSADO: 'pausado',
  SUSPENDIDO: 'suspendido',
} as const;

export const ESTADOS_NEGOCIO_VALUES = [
  ESTADOS_NEGOCIO.BORRADOR,
  ESTADOS_NEGOCIO.ACTIVO,
  ESTADOS_NEGOCIO.PAUSADO,
  ESTADOS_NEGOCIO.SUSPENDIDO,
] as const;

export type EstadoNegocio = (typeof ESTADOS_NEGOCIO)[keyof typeof ESTADOS_NEGOCIO];

export const ESTADOS_VERIFICACION = {
  NO_SOLICITADA: 'no_solicitada',
  PENDIENTE: 'pendiente',
  APROBADA: 'aprobada',
  RECHAZADA: 'rechazada',
} as const;

export const ESTADOS_VERIFICACION_VALUES = [
  ESTADOS_VERIFICACION.NO_SOLICITADA,
  ESTADOS_VERIFICACION.PENDIENTE,
  ESTADOS_VERIFICACION.APROBADA,
  ESTADOS_VERIFICACION.RECHAZADA,
] as const;

export type EstadoVerificacion = (typeof ESTADOS_VERIFICACION)[keyof typeof ESTADOS_VERIFICACION];

export const ESTADOS_MODERACION = {
  PENDIENTE: 'pendiente',
  EN_REVISION: 'en_revision',
  RESUELTO_ACEPTADO: 'resuelto_aceptado',
  RESUELTO_DESESTIMADO: 'resuelto_desestimado',
} as const;

export const ESTADOS_MODERACION_VALUES = [
  ESTADOS_MODERACION.PENDIENTE,
  ESTADOS_MODERACION.EN_REVISION,
  ESTADOS_MODERACION.RESUELTO_ACEPTADO,
  ESTADOS_MODERACION.RESUELTO_DESESTIMADO,
] as const;

export type EstadoModeracion = (typeof ESTADOS_MODERACION)[keyof typeof ESTADOS_MODERACION];

export const DIAS_SEMANA = {
  DOMINGO: 0,
  LUNES: 1,
  MARTES: 2,
  MIERCOLES: 3,
  JUEVES: 4,
  VIERNES: 5,
  SABADO: 6,
} as const;

export const DIAS_SEMANA_VALUES = [0, 1, 2, 3, 4, 5, 6] as const;

export type DiaSemana = (typeof DIAS_SEMANA_VALUES)[number];

export const ESTADOS_PUBLICACION = {
  BORRADOR: 'borrador',
  ACTIVA: 'activa',
  PAUSADA: 'pausada',
  PAUSADA_POR_PLAN: 'pausada_por_plan',
  OCULTA_POR_REPORTES: 'oculta_por_reportes',
  SUSPENDIDA: 'suspendida',
} as const;

export const ESTADOS_PUBLICACION_VALUES = [
  ESTADOS_PUBLICACION.BORRADOR,
  ESTADOS_PUBLICACION.ACTIVA,
  ESTADOS_PUBLICACION.PAUSADA,
  ESTADOS_PUBLICACION.PAUSADA_POR_PLAN,
  ESTADOS_PUBLICACION.OCULTA_POR_REPORTES,
  ESTADOS_PUBLICACION.SUSPENDIDA,
] as const;

export type EstadoPublicacion = (typeof ESTADOS_PUBLICACION)[keyof typeof ESTADOS_PUBLICACION];

export const ESTADOS_MEMBRESIA = {
  ACTIVA: 'activa',
  EN_PRUEBA: 'en_prueba',
  VENCIDA: 'vencida',
  CANCELADA: 'cancelada',
} as const;

export const ESTADOS_MEMBRESIA_VALUES = [
  ESTADOS_MEMBRESIA.ACTIVA,
  ESTADOS_MEMBRESIA.EN_PRUEBA,
  ESTADOS_MEMBRESIA.VENCIDA,
  ESTADOS_MEMBRESIA.CANCELADA,
] as const;

export type EstadoMembresia = (typeof ESTADOS_MEMBRESIA)[keyof typeof ESTADOS_MEMBRESIA];

export const ESTADOS_PAGO = {
  PENDIENTE: 'pendiente',
  APROBADO: 'aprobado',
  RECHAZADO: 'rechazado',
  REEMBOLSADO: 'reembolsado',
} as const;

export const ESTADOS_PAGO_VALUES = [
  ESTADOS_PAGO.PENDIENTE,
  ESTADOS_PAGO.APROBADO,
  ESTADOS_PAGO.RECHAZADO,
  ESTADOS_PAGO.REEMBOLSADO,
] as const;

export type EstadoPago = (typeof ESTADOS_PAGO)[keyof typeof ESTADOS_PAGO];

export const PASARELAS_PAGO = {
  MERCADOPAGO: 'mercadopago',
  TRANSFERENCIA_MANUAL: 'transferencia_manual',
  PROMO: 'promo',
} as const;

export const PASARELAS_PAGO_VALUES = [
  PASARELAS_PAGO.MERCADOPAGO,
  PASARELAS_PAGO.TRANSFERENCIA_MANUAL,
  PASARELAS_PAGO.PROMO,
] as const;

export type PasarelaPago = (typeof PASARELAS_PAGO)[keyof typeof PASARELAS_PAGO];

export const TIPOS_EVENTO_ANALITICA = {
  VISTA_NEGOCIO: 'vista_negocio',
  VISTA_PUBLICACION: 'vista_publicacion',
  CLIC_WHATSAPP: 'clic_whatsapp',
  CLIC_TELEFONO: 'clic_telefono',
  CLIC_RED_SOCIAL: 'clic_red_social',
  ESCANEO_QR: 'escaneo_qr',
  VISTA_REEL: 'vista_reel',
} as const;

export const TIPOS_EVENTO_ANALITICA_VALUES = [
  TIPOS_EVENTO_ANALITICA.VISTA_NEGOCIO,
  TIPOS_EVENTO_ANALITICA.VISTA_PUBLICACION,
  TIPOS_EVENTO_ANALITICA.CLIC_WHATSAPP,
  TIPOS_EVENTO_ANALITICA.CLIC_TELEFONO,
  TIPOS_EVENTO_ANALITICA.CLIC_RED_SOCIAL,
  TIPOS_EVENTO_ANALITICA.ESCANEO_QR,
  TIPOS_EVENTO_ANALITICA.VISTA_REEL,
] as const;

export type TipoEventoAnalitica =
  (typeof TIPOS_EVENTO_ANALITICA)[keyof typeof TIPOS_EVENTO_ANALITICA];
