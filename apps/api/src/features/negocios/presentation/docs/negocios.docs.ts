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
 *               - negocio
 *               - ubicacionPrincipal
 *     responses:
 *       201:
 *         description: Perfil comercial creado exitosamente
 *       401:
 *         description: No autorizado
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
 *     responses:
 *       201:
 *         description: Sucursal agregada exitosamente
 *       403:
 *         description: Límite de sucursales alcanzado por plan o permisos insuficientes
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
 *     responses:
 *       200:
 *         description: Horarios configurados exitosamente
 */

