/**
 * @openapi
 * tags:
 *   name: Membresias
 *   description: Motor de planes de suscripción (Gratis, Plata, Oro), cupos de destacados, sucursales y códigos promocionales
 */

/**
 * @openapi
 * /api/membresias/planes:
 *   get:
 *     summary: Obtener el catálogo público de planes con sus precios y características
 *     tags: [Membresias]
 *     responses:
 *       200:
 *         description: Catálogo de planes obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Catálogo de planes obtenido exitosamente
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       codigo:
 *                         type: string
 *                         enum: [gratis, plata, oro]
 *                       nombre:
 *                         type: string
 *                       precioMensualArs:
 *                         type: number
 *                       maxPublicaciones:
 *                         type: integer
 *                       cuposDestacados:
 *                         type: integer
 *                       maxSucursales:
 *                         type: integer
 *                       prioridadBase:
 *                         type: integer
 */

/**
 * @openapi
 * /api/membresias/negocio/{negocioId}:
 *   get:
 *     summary: Consultar el estado de membresía, plan actual, cupos en uso y sucursales activas de un negocio
 *     tags: [Membresias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: negocioId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Estado de membresía del negocio obtenido exitosamente
 *       403:
 *         description: No tienes permisos para consultar este negocio
 *       404:
 *         description: Negocio no encontrado
 */

/**
 * @openapi
 * /api/membresias/cambio-plan:
 *   post:
 *     summary: Solicitar cambio de plan o activar la prueba gratuita de 14 días
 *     tags: [Membresias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - negocioId
 *               - nuevoPlan
 *             properties:
 *               negocioId:
 *                 type: string
 *                 format: uuid
 *                 description: ID del negocio a actualizar
 *               nuevoPlan:
 *                 type: string
 *                 enum: [gratis, plata, oro]
 *               autoRenovar:
 *                 type: boolean
 *                 default: false
 *               periodoMeses:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *                 default: 1
 *     responses:
 *       200:
 *         description: Solicitud de cambio de plan procesada exitosamente
 *       201:
 *         description: Prueba gratuita de 14 días activada exitosamente
 *       403:
 *         description: No tienes permisos para gestionar este negocio
 */

/**
 * @openapi
 * /api/membresias/canjear-promo:
 *   post:
 *     summary: Canjear un código promocional para activar o extender una membresía bonificada
 *     tags: [Membresias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - negocioId
 *               - codigo
 *             properties:
 *               negocioId:
 *                 type: string
 *                 format: uuid
 *               codigo:
 *                 type: string
 *                 example: ALBERDI-ORO-2026
 *     responses:
 *       200:
 *         description: Código promocional canjeado exitosamente
 *       400:
 *         description: Código inválido, expirado o con cupo agotado
 */

/**
 * @openapi
 * /api/membresias/pago-transferencia:
 *   post:
 *     summary: Registrar un comprobante de pago por transferencia manual para su revisión
 *     tags: [Membresias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - membresiaId
 *               - negocioId
 *               - montoArs
 *             properties:
 *               membresiaId:
 *                 type: string
 *                 format: uuid
 *               negocioId:
 *                 type: string
 *                 format: uuid
 *               montoArs:
 *                 type: number
 *                 example: 1500
 *               comprobanteUrl:
 *                 type: string
 *                 format: uri
 *               referenciaExterna:
 *                 type: string
 *                 example: TRANSF-BCRA-88941
 *     responses:
 *       201:
 *         description: Comprobante registrado exitosamente
 */

/**
 * @openapi
 * /api/membresias/admin/revisar-pago:
 *   post:
 *     summary: (Admin) Aprobar o rechazar un pago manual registrado por un comerciante
 *     tags: [Membresias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pagoId
 *               - accion
 *             properties:
 *               pagoId:
 *                 type: string
 *                 format: uuid
 *               accion:
 *                 type: string
 *                 enum: [aprobar, rechazar]
 *               motivoRechazo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pago revisado y procesado exitosamente
 *       403:
 *         description: Solo administradores pueden revisar pagos
 */

/**
 * @openapi
 * /api/membresias/admin/ejecutar-vencimientos:
 *   post:
 *     summary: (Admin) Conciliar y ejecutar la degradación automática de membresías vencidas
 *     tags: [Membresias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Proceso de vencimiento ejecutado exitosamente
 *       403:
 *         description: Solo administradores pueden ejecutar este proceso
 */

