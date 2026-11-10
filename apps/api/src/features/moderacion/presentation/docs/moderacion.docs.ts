/**
 * @openapi
 * tags:
 *   name: Moderación
 *   description: Verificación de comercios, reportes de contenido ofensivo/irregular y buzón de feedback de la plataforma
 */

/**
 * @openapi
 * /api/moderacion/verificaciones:
 *   post:
 *     summary: Solicitar verificación oficial para un comercio
 *     description: Permite al dueño del comercio subir documentación de identidad y comprobante de habilitación para obtener el tilde azul de "Comercio Verificado".
 *     tags: [Moderación]
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
 *             properties:
 *               negocioId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               documentoFrenteUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 example: "https://storage.mialberdi.com/docs/dni-frente.jpg"
 *               comprobanteComercioUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 example: "https://storage.mialberdi.com/docs/habilitacion.pdf"
 *               notasSolicitante:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 example: "Adjunto constancia de AFIP y habilitación municipal del local."
 *     responses:
 *       201:
 *         description: Solicitud de verificación creada exitosamente
 *       400:
 *         description: El negocio ya está verificado o tiene una solicitud pendiente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Solo el propietario puede solicitar la verificación
 *       404:
 *         description: Comercio no encontrado
 */

/**
 * @openapi
 * /api/moderacion/verificaciones/mis-solicitudes:
 *   get:
 *     summary: Listar solicitudes de verificación del usuario autenticado
 *     description: Permite al comerciante consultar el historial y estado de sus solicitudes de verificación.
 *     tags: [Moderación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado de solicitudes de verificación del comerciante
 *       401:
 *         description: No autenticado
 */

/**
 * @openapi
 * /api/moderacion/verificaciones:
 *   get:
 *     summary: Listar todas las solicitudes de verificación (Admin / Moderador)
 *     description: Bandeja de entrada paginada de solicitudes con filtro opcional por estado.
 *     tags: [Moderación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, aprobada, rechazada]
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Listado paginado de solicitudes
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Requiere rol de administrador o moderador
 */

/**
 * @openapi
 * /api/moderacion/verificaciones/{id}/resolver:
 *   patch:
 *     summary: Resolver solicitud de verificación (Admin / Moderador)
 *     description: Aprueba la solicitud activando la insignia `badgeVerificado` en el comercio, o la rechaza con motivo explicativo.
 *     tags: [Moderación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [aprobada, rechazada]
 *               motivoRechazo:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 example: "La foto del documento es ilegible."
 *               badgeTexto:
 *                 type: string
 *                 maxLength: 40
 *                 nullable: true
 *                 example: "Comercio Verificado"
 *     responses:
 *       200:
 *         description: Solicitud resuelta exitosamente
 *       400:
 *         description: Solicitud ya procesada o falta motivo de rechazo
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Requiere rol de administrador o moderador
 *       404:
 *         description: Solicitud no encontrada
 */

/**
 * @openapi
 * /api/moderacion/reportes:
 *   post:
 *     summary: Crear reporte de moderación sobre contenido
 *     description: Permite a cualquier usuario (incluso anónimo con fingerprint) denunciar un comercio, publicación u opinión.
 *     tags: [Moderación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motivo
 *             properties:
 *               negocioId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               publicacionId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               opinionId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               motivo:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "Contenido engañoso o spam"
 *               detalle:
 *                 type: string
 *                 maxLength: 1000
 *                 nullable: true
 *                 example: "La publicación promociona un producto no disponible y precios falsos."
 *     responses:
 *       201:
 *         description: Reporte recibido exitosamente
 *       400:
 *         description: Objetivo de reporte inválido o faltante
 *       404:
 *         description: La entidad a reportar no existe
 */

/**
 * @openapi
 * /api/moderacion/reportes:
 *   get:
 *     summary: Listar reportes de moderación (Admin / Moderador)
 *     description: Bandeja de entrada de denuncias con filtrado por estado.
 *     tags: [Moderación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, en_revision, resuelto, desestimado]
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Listado paginado de reportes
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Requiere rol de administrador o moderador
 */

/**
 * @openapi
 * /api/moderacion/reportes/{id}/resolver:
 *   patch:
 *     summary: Resolver reporte de moderación (Admin / Moderador)
 *     description: Resuelve o desestima el reporte, pudiendo aplicar acciones punitivas inmediatas (ocultar publicación, ocultar opinión con recálculo de rating, o pausar comercio).
 *     tags: [Moderación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [resuelto, desestimado, en_revision]
 *               resolucionNota:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 example: "Se constata infracción en los términos. Se oculta la publicación."
 *               accionInfraccion:
 *                 type: string
 *                 enum: [ninguna, ocultar_publicacion, ocultar_opinion, pausar_negocio]
 *                 default: ninguna
 *     responses:
 *       200:
 *         description: Reporte resuelto y medidas ejecutadas
 *       400:
 *         description: Reporte ya resuelto o parámetros inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Requiere rol de administrador o moderador
 *       404:
 *         description: Reporte no encontrado
 */

/**
 * @openapi
 * /api/moderacion/feedback:
 *   post:
 *     summary: Enviar feedback o sugerencia a la plataforma
 *     description: Permite enviar comentarios generales sobre el funcionamiento de Mi Alberdi.
 *     tags: [Moderación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mensaje
 *             properties:
 *               mensaje:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 2000
 *                 example: "Estaría genial poder ordenar los comercios por horario de apertura."
 *               nombreCompleto:
 *                 type: string
 *                 maxLength: 100
 *                 nullable: true
 *               email:
 *                 type: string
 *                 format: email
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Feedback recibido con éxito
 *       400:
 *         description: Datos de feedback inválidos
 */

/**
 * @openapi
 * /api/moderacion/feedback:
 *   get:
 *     summary: Listar feedback recibido (Admin / Moderador)
 *     description: Bandeja de entrada de comentarios de usuarios y vecinos.
 *     tags: [Moderación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         description: Filtrar por leido o no_leido
 *         schema:
 *           type: string
 *           enum: [leido, no_leido]
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Listado paginado de feedback
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Requiere rol de administrador o moderador
 */

/**
 * @openapi
 * /api/moderacion/feedback/{id}/leido:
 *   patch:
 *     summary: Marcar feedback como leído (Admin / Moderador)
 *     description: Actualiza el estado del feedback a leído e incluye notas de seguimiento internas.
 *     tags: [Moderación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notasAdmin:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 example: "Sugerencia agregada al backlog de diseño."
 *     responses:
 *       200:
 *         description: Feedback marcado como leído
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Requiere rol de administrador o moderador
 *       404:
 *         description: Feedback no encontrado
 */

