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
 *             properties:
 *               negocio:
 *                 type: object
 *                 required:
 *                   - tipoPerfil
 *                   - rubroPrincipalId
 *                   - nombreComercial
 *                   - whatsappPrincipal
 *                 properties:
 *                   tipoPerfil:
 *                     type: string
 *                     enum: [comercio, oficio_independiente, servicio_profesional, emprendimiento]
 *                     example: comercio
 *                   rubroPrincipalId:
 *                     type: string
 *                     format: uuid
 *                     example: "2b7e1fe4-349a-4643-8ffd-7d47e9e0f398"
 *                   nombreComercial:
 *                     type: string
 *                     example: "Pizzería San Martín"
 *                   eslogan:
 *                     type: string
 *                     example: "Las mejores pizzas a la leña"
 *                   descripcion:
 *                     type: string
 *                     example: "Pizzas artesanales, empanadas tucumanas y sándwiches de milanesa."
 *                   whatsappPrincipal:
 *                     type: string
 *                     example: "+5493865123456"
 *                   whatsappMensajeDefault:
 *                     type: string
 *                     example: "Hola, te vi en Mi Alberdi y quería consultar por..."
 *                   modalidadPrincipal:
 *                     type: string
 *                     enum: [horarios_fijos, cita_previa, urgencias_24hs]
 *                     example: horarios_fijos
 *                   atiendeADomicilio:
 *                     type: boolean
 *                     example: true
 *                   haceEnvios:
 *                     type: boolean
 *                     example: true
 *                   alcanceEnvios:
 *                     type: string
 *                     enum: [sin_envio, solo_alberdi, alberdi_y_zonas_cercanas, todo_el_pais]
 *                     example: solo_alberdi
 *               ubicacionPrincipal:
 *                 type: object
 *                 required:
 *                   - direccionEscrita
 *                 properties:
 *                   nombreSucursal:
 *                     type: string
 *                     example: "Casa Central"
 *                   direccionEscrita:
 *                     type: string
 *                     example: "Av. San Martín 450"
 *                   barrio:
 *                     type: string
 *                     example: "Centro"
 *                   referenciaVisual:
 *                     type: string
 *                     example: "Frente a la plaza principal"
 *                   whatsappSucursal:
 *                     type: string
 *                     example: "+5493865123456"
 *                   mostrarDireccionExacta:
 *                     type: boolean
 *                     example: true
 *               horarios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - diaSemana
 *                   properties:
 *                     diaSemana:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                       description: "0 = Domingo, 1 = Lunes, ..., 6 = Sábado"
 *                       example: 1
 *                     cerrado:
 *                       type: boolean
 *                       example: false
 *                     horarioCorrido:
 *                       type: boolean
 *                       example: false
 *                     aperturaManana:
 *                       type: string
 *                       example: "08:30"
 *                     cierreManana:
 *                       type: string
 *                       example: "12:30"
 *                     aperturaTarde:
 *                       type: string
 *                       example: "17:30"
 *                     cierreTarde:
 *                       type: string
 *                       example: "22:00"
 *               metodosPagoIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: Perfil comercial creado exitosamente
 *       400:
 *         description: Validación fallida
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
 *               - tipoPerfil
 *               - rubroPrincipalId
 *               - nombreComercial
 *               - whatsappPrincipal
 *             properties:
 *               tipoPerfil:
 *                 type: string
 *                 enum: [comercio, oficio_independiente, servicio_profesional, emprendimiento]
 *                 example: comercio
 *               rubroPrincipalId:
 *                 type: string
 *                 format: uuid
 *                 example: "2b7e1fe4-349a-4643-8ffd-7d47e9e0f398"
 *               nombreComercial:
 *                 type: string
 *                 example: "Rotisería Alberdi"
 *               descripcion:
 *                 type: string
 *                 example: "Comidas caseras para llevar y delivery en Alberdi."
 *               eslogan:
 *                 type: string
 *                 example: "El sabor de casa todos los días"
 *               whatsappPrincipal:
 *                 type: string
 *                 example: "+5493865123456"
 *               atiendeADomicilio:
 *                 type: boolean
 *                 example: false
 *               haceEnvios:
 *                 type: boolean
 *                 example: true
 *               alcanceEnvios:
 *                 type: string
 *                 enum: [sin_envio, solo_alberdi, alberdi_y_zonas_cercanas, todo_el_pais]
 *                 example: solo_alberdi
 *               metodosPagoIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: Negocio creado exitosamente
 *       400:
 *         description: Validación fallida
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
 *               nombreComercial:
 *                 type: string
 *                 example: "Rotisería Alberdi Centro"
 *               descripcion:
 *                 type: string
 *                 example: "Viandas diarias y platos especiales de fin de semana."
 *               eslogan:
 *                 type: string
 *                 example: "Sabor tradicional"
 *               logoUrl:
 *                 type: string
 *               bannerUrl:
 *                 type: string
 *               whatsappPrincipal:
 *                 type: string
 *                 example: "+5493865123456"
 *               atiendeADomicilio:
 *                 type: boolean
 *               haceEnvios:
 *                 type: boolean
 *               alcanceEnvios:
 *                 type: string
 *                 enum: [sin_envio, solo_alberdi, alberdi_y_zonas_cercanas, todo_el_pais]
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
 *             required:
 *               - direccionEscrita
 *             properties:
 *               nombreSucursal:
 *                 type: string
 *                 example: "Sucursal Barrio Norte"
 *               direccionEscrita:
 *                 type: string
 *                 example: "Belgrano 120"
 *               barrio:
 *                 type: string
 *                 example: "Norte"
 *               referenciaVisual:
 *                 type: string
 *                 example: "A media cuadra de la escuela"
 *               whatsappSucursal:
 *                 type: string
 *                 example: "+5493865998877"
 *               telefonoSucursal:
 *                 type: string
 *               mostrarDireccionExacta:
 *                 type: boolean
 *                 example: true
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
 *               nombreSucursal:
 *                 type: string
 *               direccionEscrita:
 *                 type: string
 *               barrio:
 *                 type: string
 *               referenciaVisual:
 *                 type: string
 *               whatsappSucursal:
 *                 type: string
 *               mostrarDireccionExacta:
 *                 type: boolean
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
 *             required:
 *               - horarios
 *             properties:
 *               horarios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - diaSemana
 *                   properties:
 *                     diaSemana:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                       description: "0 = Domingo, 1 = Lunes, ..., 6 = Sábado"
 *                       example: 1
 *                     cerrado:
 *                       type: boolean
 *                       example: false
 *                     horarioCorrido:
 *                       type: boolean
 *                       example: false
 *                     aperturaManana:
 *                       type: string
 *                       example: "08:30"
 *                     cierreManana:
 *                       type: string
 *                       example: "12:30"
 *                     aperturaTarde:
 *                       type: string
 *                       example: "17:30"
 *                     cierreTarde:
 *                       type: string
 *                       example: "22:00"
 *                     notaEspecial:
 *                       type: string
 *                       example: "Atención solo por ventanilla a la noche"
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
 *             required:
 *               - metodosPago
 *             properties:
 *               metodosPago:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - metodoPagoId
 *                   properties:
 *                     metodoPagoId:
 *                       type: string
 *                       format: uuid
 *                       example: "d41d8cd9-8f00-4b20-8000-000000000001"
 *                     detalle:
 *                       type: string
 *                       example: "Alias: pizzeriasanmartin.mp"
 *     responses:
 *       200:
 *         description: Métodos de pago vinculados exitosamente
 */
