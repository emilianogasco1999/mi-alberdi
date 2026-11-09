/**
 * @openapi
 * tags:
 *   name: Opiniones
 *   description: Sistema de reseñas de vecinos (1 a 5 estrellas), cálculo automático de rating promedio y respuesta del comerciante
 */

/**
 * @openapi
 * /api/opiniones:
 *   post:
 *     summary: Crear una opinión/calificación para un negocio o servicio
 *     description: Permite a un vecino autenticado calificar de 1 a 5 estrellas, agregar un comentario y adjuntar foto como evidencia. Actualiza automáticamente el rating promedio y total de opiniones del negocio.
 *     tags: [Opiniones]
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
 *               - puntuacion
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
 *               puntuacion:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comentario:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Excelente atención y rapidez. Muy recomendable."
 *               fotoEvidenciaUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 example: null
 *               nombreAutorVisible:
 *                 type: string
 *                 maxLength: 80
 *                 example: "Juan Pérez"
 *     responses:
 *       201:
 *         description: Opinión registrada exitosamente
 *       400:
 *         description: El comerciante no puede calificarse a sí mismo o parámetros inválidos
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Negocio o publicación no encontrado
 *       409:
 *         description: El usuario ya emitió una opinión para este negocio
 */

/**
 * @openapi
 * /api/opiniones/negocio/{negocioId}:
 *   get:
 *     summary: Listar opiniones públicas de un negocio
 *     description: Consulta paginada de opiniones visibles con desglose de estrellas y métricas acumuladas.
 *     tags: [Opiniones]
 *     parameters:
 *       - in: path
 *         name: negocioId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *       - in: query
 *         name: publicacionId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: puntuacion
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *       - in: query
 *         name: orden
 *         schema:
 *           type: string
 *           enum: [recientes, mejores, peores]
 *           default: recientes
 *     responses:
 *       200:
 *         description: Listado de opiniones obtenido exitosamente
 *       404:
 *         description: Negocio no encontrado
 */

/**
 * @openapi
 * /api/opiniones/negocio/{negocioId}/mi-opinion:
 *   get:
 *     summary: Consultar la opinión propia emitida en un negocio
 *     description: Permite al usuario logueado saber si ya calificó este negocio y ver el contenido de su reseña.
 *     tags: [Opiniones]
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
 *         description: Opinión propia obtenida exitosamente (null si no opinó)
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Negocio no encontrado
 */

/**
 * @openapi
 * /api/opiniones/{id}/respuesta:
 *   patch:
 *     summary: Responder una opinión (exclusivo para el comerciante dueño del negocio o admin)
 *     description: Permite al comerciante responder cordialmente a las reseñas recibidas de los vecinos.
 *     tags: [Opiniones]
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
 *               - respuestaComerciante
 *             properties:
 *               respuestaComerciante:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 1000
 *                 example: "Muchas gracias por tu visita Juan, ¡te esperamos de nuevo!"
 *     responses:
 *       200:
 *         description: Respuesta guardada exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Solo el dueño del negocio puede responder esta opinión
 *       404:
 *         description: Opinión no encontrada
 */

/**
 * @openapi
 * /api/opiniones/{id}:
 *   delete:
 *     summary: Eliminar una opinión
 *     description: Permite al autor de la opinión o a un moderador/admin eliminar la reseña y recalcular las métricas del comercio.
 *     tags: [Opiniones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Opinión eliminada exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Opinión no encontrada
 */
