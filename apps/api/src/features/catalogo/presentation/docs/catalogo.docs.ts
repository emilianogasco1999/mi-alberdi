/**
 * @openapi
 * tags:
 *   name: Catalogo
 *   description: Gestión de publicaciones (servicios y productos), imágenes y Estrellas de Vidriera
 */

/**
 * @openapi
 * /api/catalogo/publico/{slug}:
 *   get:
 *     summary: Obtener el detalle público de una publicación por su slug
 *     tags: [Catalogo]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Publicación obtenida exitosamente
 *       404:
 *         description: Publicación no encontrada
 */

/**
 * @openapi
 * /api/catalogo/negocio/{negocioId}:
 *   get:
 *     summary: Listar todas las publicaciones de un negocio propio
 *     tags: [Catalogo]
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
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [activo, pausado, agotado]
 *     responses:
 *       200:
 *         description: Lista de publicaciones obtenida exitosamente
 *       403:
 *         description: No tienes permisos para gestionar este negocio
 */

/**
 * @openapi
 * /api/catalogo/{id}:
 *   get:
 *     summary: Obtener el detalle administrativo de una publicación propia por ID
 *     tags: [Catalogo]
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
 *         description: Publicación obtenida exitosamente
 *       404:
 *         description: Publicación no encontrada
 */

/**
 * @openapi
 * /api/catalogo:
 *   post:
 *     summary: Crear una nueva publicación (valida límite de publicaciones del plan)
 *     tags: [Catalogo]
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
 *               - categoriaId
 *               - tipo
 *               - titulo
 *               - descripcion
 *             properties:
 *               negocioId:
 *                 type: string
 *                 format: uuid
 *               categoriaId:
 *                 type: string
 *                 format: uuid
 *               tipo:
 *                 type: string
 *                 enum: [producto, servicio]
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *               precioOferta:
 *                 type: number
 *               destacada:
 *                 type: boolean
 *               imagenes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     orden:
 *                       type: integer
 *                     esPortada:
 *                       type: boolean
 *     responses:
 *       201:
 *         description: Publicación creada exitosamente
 *       403:
 *         description: Límite de publicaciones del plan alcanzado
 */

/**
 * @openapi
 * /api/catalogo/{id}:
 *   put:
 *     summary: Actualizar una publicación existente
 *     tags: [Catalogo]
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
 *             properties:
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *               precioOferta:
 *                 type: number
 *               estado:
 *                 type: string
 *                 enum: [activo, pausado, agotado]
 *     responses:
 *       200:
 *         description: Publicación actualizada exitosamente
 */

/**
 * @openapi
 * /api/catalogo/{id}/destacada:
 *   patch:
 *     summary: Activar o desactivar Estrella de Vidriera (cupo de destacado según plan)
 *     tags: [Catalogo]
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
 *               - destacada
 *             properties:
 *               destacada:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Estrella de vidriera actualizada exitosamente
 *       403:
 *         description: Cupos de destacados agotados para este plan
 */

/**
 * @openapi
 * /api/catalogo/{id}/estado:
 *   patch:
 *     summary: Cambiar el estado de una publicación (activo, pausado, agotado)
 *     tags: [Catalogo]
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
 *                 enum: [activo, pausado, agotado]
 *     responses:
 *       200:
 *         description: Estado de publicación actualizado exitosamente
 */

/**
 * @openapi
 * /api/catalogo/{id}/imagenes:
 *   put:
 *     summary: Reordenar imágenes y definir portada de una publicación
 *     tags: [Catalogo]
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
 *               - imagenes
 *             properties:
 *               imagenes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - orden
 *                     - esPortada
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     orden:
 *                       type: integer
 *                     esPortada:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Imágenes reordenadas exitosamente
 */

/**
 * @openapi
 * /api/catalogo/{id}:
 *   delete:
 *     summary: Dar de baja una publicación (soft delete)
 *     tags: [Catalogo]
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
 *         description: Publicación eliminada exitosamente
 *       404:
 *         description: Publicación no encontrada
 */
