/**
 * @openapi
 * tags:
 *   name: Analitica
 *   description: Ingesta de eventos de conversión y consulta de métricas de retorno de inversión (ROI) para comerciantes
 */

/**
 * @openapi
 * /api/analitica/eventos:
 *   post:
 *     summary: Ingesta de evento de conversión (clic de WhatsApp, escaneo QR, vista de negocio o publicación)
 *     description: Endpoint público y liviano para registrar interacciones de vecinos con comercios y oficios.
 *     tags: [Analitica]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - negocioId
 *               - tipoEvento
 *             properties:
 *               negocioId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               publicacionId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: null
 *               ubicacionId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: null
 *               reelId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: null
 *               tipoEvento:
 *                 type: string
 *                 enum: [vista_negocio, vista_publicacion, clic_whatsapp, clic_telefono, clic_red_social, escaneo_qr, vista_reel]
 *                 example: "clic_whatsapp"
 *               origen:
 *                 type: string
 *                 maxLength: 40
 *                 nullable: true
 *                 example: "web_perfil"
 *               dispositivoHash:
 *                 type: string
 *                 maxLength: 128
 *                 nullable: true
 *                 description: Hash anónimo de dispositivo; si no se envía, se calcula automáticamente en el servidor.
 *     responses:
 *       201:
 *         description: Evento registrado exitosamente
 *       400:
 *         description: Parámetros inválidos
 *       404:
 *         description: El negocio especificado no existe
 */

/**
 * @openapi
 * /api/analitica/eventos/batch:
 *   post:
 *     summary: Ingesta de eventos en lote (hasta 50 eventos)
 *     description: Permite registrar múltiples eventos agrupados para reducir peticiones HTTP desde el cliente web.
 *     tags: [Analitica]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventos
 *             properties:
 *               eventos:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 50
 *                 items:
 *                   type: object
 *                   required:
 *                     - negocioId
 *                     - tipoEvento
 *                   properties:
 *                     negocioId:
 *                       type: string
 *                       format: uuid
 *                     publicacionId:
 *                       type: string
 *                       format: uuid
 *                     ubicacionId:
 *                       type: string
 *                       format: uuid
 *                     reelId:
 *                       type: string
 *                       format: uuid
 *                     tipoEvento:
 *                       type: string
 *                       enum: [vista_negocio, vista_publicacion, clic_whatsapp, clic_telefono, clic_red_social, escaneo_qr, vista_reel]
 *                     origen:
 *                       type: string
 *     responses:
 *       201:
 *         description: Lote de eventos registrado exitosamente
 *       400:
 *         description: Parámetros inválidos
 */

/**
 * @openapi
 * /api/analitica/negocio/{negocioId}:
 *   get:
 *     summary: Consultar métricas y analítica de ROI de un negocio propio
 *     description: Retorna totales de conversión, desglose por sucursal, desglose por canal de origen, serie temporal por fecha y top publicaciones.
 *     tags: [Analitica]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: negocioId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, mes_actual, anio_actual, historico]
 *           default: 30d
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           description: Fecha inicial YYYY-MM-DD o ISO8601 (anula el parámetro periodo)
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           description: Fecha final YYYY-MM-DD o ISO8601
 *       - in: query
 *         name: ubicacionId
 *         schema:
 *           type: string
 *           format: uuid
 *           description: Filtrar métricas por una sucursal específica
 *     responses:
 *       200:
 *         description: Métricas de analítica obtenidas exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado para ver este negocio
 *       404:
 *         description: Negocio no encontrado
 */
