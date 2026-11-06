/**
 * @openapi
 * tags:
 *   name: Negocios
 *   description: Gestión de perfiles comerciales, oficios, sucursales y horarios en Mi Alberdi
 */

/**
 * @openapi
 * /api/negocios/publico/{slug}:
 *   get:
 *     summary: Obtener perfil público de un comercio u oficio por slug
 *     tags: [Negocios]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Perfil público obtenido exitosamente
 *       404:
 *         description: Negocio no encontrado
 */

/**
 * @openapi
 * /api/negocios/wizard:
 *   post:
 *     summary: Alta completa de negocio mediante el Wizard de Onboarding
 *     tags: [Negocios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *               - categoriaId
 *               - sucursal
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               categoriaId:
 *                 type: string
 *                 format: uuid
 *               metodosPagoIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               atiendeADomicilio:
 *                 type: boolean
 *               haceEnvios:
 *                 type: boolean
 *               sucursal:
 *                 type: object
 *                 required: [calle]
 *                 properties:
 *                   nombre:
 *                     type: string
 *                   calle:
 *                     type: string
 *                   numero:
 *                     type: string
 *                   barrio:
 *                     type: string
 *                   telefono:
 *                     type: string
 *                   whatsapp:
 *                     type: string
 *               horarios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     diaSemana:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                     horaApertura:
 *                       type: string
 *                       example: "08:30"
 *                     horaCierre:
 *                       type: string
 *                       example: "12:30"
 *                     turno:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Perfil comercial creado exitosamente
 *       401:
 *         description: No autorizado
 */

/**
 * @openapi
 * /api/negocios:
 *   post:
 *     summary: Alta simple de negocio (sin wizard)
 *     tags: [Negocios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *               - categoriaId
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               categoriaId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Negocio creado exitosamente
 */

/**
 * @openapi
 * /api/negocios/mis-negocios:
 *   get:
 *     summary: Listar todos los perfiles de negocios del usuario autenticado
 *     tags: [Negocios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfiles obtenidos exitosamente
 */

/**
 * @openapi
 * /api/negocios/{negocioId}:
 *   get:
 *     summary: Obtener el detalle administrativo de un negocio propio por ID
 *     tags: [Negocios]
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
 *         description: Detalle del negocio obtenido exitosamente
 *       403:
 *         description: Permisos insuficientes para ver este negocio
 */

/**
 * @openapi
 * /api/negocios/{negocioId}:
 *   put:
 *     summary: Actualizar la información principal de un negocio
 *     tags: [Negocios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: negocioId
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
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               portadaUrl:
 *                 type: string
 *               atiendeADomicilio:
 *                 type: boolean
 *               haceEnvios:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Negocio actualizado exitosamente
 */

/**
 * @openapi
 * /api/negocios/{negocioId}/sucursales:
 *   post:
 *     summary: Agregar una sucursal adicional al negocio respetando límites del plan
 *     tags: [Negocios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: negocioId
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
 *             required: [calle]
 *             properties:
 *               nombre:
 *                 type: string
 *               calle:
 *                 type: string
 *               numero:
 *                 type: string
 *               barrio:
 *                 type: string
 *               telefono:
 *                 type: string
 *               whatsapp:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sucursal agregada exitosamente
 *       403:
 *         description: Límite de sucursales alcanzado por plan o permisos insuficientes
 */

/**
 * @openapi
 * /api/negocios/{negocioId}/sucursales/{sucursalId}:
 *   put:
 *     summary: Actualizar los datos de una sucursal
 *     tags: [Negocios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: negocioId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: sucursalId
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
 *               nombre:
 *                 type: string
 *               calle:
 *                 type: string
 *               numero:
 *                 type: string
 *               barrio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sucursal actualizada exitosamente
 */

/**
 * @openapi
 * /api/negocios/{negocioId}/sucursales/{sucursalId}:
 *   delete:
 *     summary: Eliminar una sucursal secundaria (no permite borrar la casa central)
 *     tags: [Negocios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: negocioId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Sucursal eliminada exitosamente
 *       400:
 *         description: No se puede eliminar la sucursal principal
 */

/**
 * @openapi
 * /api/negocios/{negocioId}/horarios:
 *   put:
 *     summary: Configurar los horarios semanales del negocio o sucursal (soporte siesta)
 *     tags: [Negocios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: negocioId
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
 *             required: [horarios]
 *             properties:
 *               horarios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [diaSemana, horaApertura, horaCierre, turno]
 *                   properties:
 *                     diaSemana:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                     horaApertura:
 *                       type: string
 *                       example: "08:30"
 *                     horaCierre:
 *                       type: string
 *                       example: "12:30"
 *                     turno:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Horarios configurados exitosamente
 */

/**
 * @openapi
 * /api/negocios/{negocioId}/metodos-pago:
 *   put:
 *     summary: Vincular los métodos de pago aceptados por el comercio
 *     tags: [Negocios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: negocioId
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
 *             required: [metodosPagoIds]
 *             properties:
 *               metodosPagoIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Métodos de pago vinculados exitosamente
 */
