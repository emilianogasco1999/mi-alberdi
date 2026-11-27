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
 *       - cookieAuth: []
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
 *                     enum: [comercio, oficio, profesional, emprendimiento]
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
 *                     enum: [horarios_fijos, por_turnos, por_pedido, atencion_24hs, solo_whatsapp]
 *                     example: horarios_fijos
 *                   atiendeADomicilio:
 *                     type: boolean
 *                     example: true
 *                   haceEnvios:
 *                     type: boolean
 *                     example: true
 *                   alcanceEnvios:
 *                     type: string
 *                     enum: [sin_envio, solo_alberdi, alberdi_y_alrededores, todo_el_pais]
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
 *     summary: Alta de comercio u oficio (HU-03, soporta JSON y multipart/form-data con logo y banner)
 *     tags: [Negocios]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - tipo
 *               - telefono
 *               - direccion
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "Ferretería San Martín"
 *               tipo:
 *                 type: string
 *                 enum: [COMERCIO, OFICIO]
 *                 example: COMERCIO
 *               telefono:
 *                 type: string
 *                 example: "+5493865123456"
 *               direccion:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 example: "Av. Campero 450, Alberdi"
 *               descripcion:
 *                 type: string
 *                 example: "Herramientas, electricidad y materiales para el hogar."
 *               instagram:
 *                 type: string
 *                 example: "@ferreteria.sanmartin"
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Imagen de logo (.jpg, .jpeg, .png, .webp - máx. 2MB)
 *               banner:
 *                 type: string
 *                 format: binary
 *                 description: Imagen de banner (.jpg, .jpeg, .png, .webp - máx. 2MB)
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - tipo
 *               - telefono
 *               - direccion
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Rotisería Alberdi"
 *               tipo:
 *                 type: string
 *                 enum: [COMERCIO, OFICIO]
 *                 example: COMERCIO
 *               telefono:
 *                 type: string
 *                 example: "+5493865123456"
 *               direccion:
 *                 type: string
 *                 example: "Av. San Martín 320"
 *               descripcion:
 *                 type: string
 *                 example: "Comidas caseras para llevar y delivery en Alberdi."
 *               instagram:
 *                 type: string
 *                 example: "@rotiseria.alberdi"
 *               logoUrl:
 *                 type: string
 *                 example: "/uploads/negocios/logos/ejemplo.webp"
 *               bannerUrl:
 *                 type: string
 *                 example: "/uploads/negocios/banners/ejemplo.webp"
 *               rubroPrincipalId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Perfil comercial creado exitosamente (retorna NegocioResponseDto sanitizado)
 *       400:
 *         description: Error de validación Zod, extensión de archivo no permitida o archivo mayor a 2MB
 *       401:
 *         description: No autenticado
 */

/**
 * @openapi
 * /api/negocios/mis-comercios:
 *   get:
 *     summary: Listar todos los comercios u oficios pertenecientes al comerciante autenticado (HU-03 1:N)
 *     tags: [Negocios]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de comercios propios (NegocioResponseDto[]) obtenida exitosamente
 *       401:
 *         description: No autenticado
 */

/**
 * @openapi
 * /api/negocios/{negocioId}:
 *   get:
 *     summary: Obtener el detalle administrativo de un negocio propio por ID
 *     tags: [Negocios]
 *     security:
 *       - cookieAuth: []
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
 *     summary: Actualizar la información y assets de un comercio u oficio propio (HU-03, soporta JSON y multipart/form-data)
 *     tags: [Negocios]
 *     security:
 *       - cookieAuth: []
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Rotisería Alberdi Centro"
 *               tipo:
 *                 type: string
 *                 enum: [COMERCIO, OFICIO]
 *               telefono:
 *                 type: string
 *                 example: "+5493865123456"
 *               direccion:
 *                 type: string
 *                 example: "Av. Campero 510"
 *               descripcion:
 *                 type: string
 *                 example: "Viandas diarias y platos especiales de fin de semana."
 *               instagram:
 *                 type: string
 *                 example: "@rotiseria.alberdi"
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Imagen de logo (.jpg, .jpeg, .png, .webp - máx. 2MB)
 *               banner:
 *                 type: string
 *                 format: binary
 *                 description: Imagen de banner (.jpg, .jpeg, .png, .webp - máx. 2MB)
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Rotisería Alberdi Centro"
 *               tipo:
 *                 type: string
 *                 enum: [COMERCIO, OFICIO]
 *               telefono:
 *                 type: string
 *                 example: "+5493865123456"
 *               direccion:
 *                 type: string
 *                 example: "Av. Campero 510"
 *               descripcion:
 *                 type: string
 *                 example: "Viandas diarias y platos especiales de fin de semana."
 *               instagram:
 *                 type: string
 *                 example: "@rotiseria.alberdi"
 *               logoUrl:
 *                 type: string
 *               bannerUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Negocio actualizado exitosamente
 *       400:
 *         description: Error de validación o formato/tamaño de archivo inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Intento de editar un negocio perteneciente a otro usuario
 *       404:
 *         description: Negocio no encontrado
 */

/**
 * @openapi
 * /api/negocios/{negocioId}/sucursales:
 *   post:
 *     summary: Agregar una sucursal adicional al negocio respetando límites del plan
 *     tags: [Negocios]
 *     security:
 *       - cookieAuth: []
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
 *       - cookieAuth: []
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
 *       - cookieAuth: []
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
 *       - cookieAuth: []
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
 *       - cookieAuth: []
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
