/**
 * @openapi
 * tags:
 *   name: Descubrimiento
 *   description: Motor de búsqueda Full-Text, filtros comerciales y Algoritmo de Ranking Justo de Juan Bautista Alberdi
 */

/**
 * @openapi
 * /api/descubrimiento/buscar:
 *   get:
 *     summary: Buscar comercios, oficios y publicaciones con Ranking Justo y soporte siesta
 *     tags: [Descubrimiento]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Término de búsqueda (búsqueda difusa y Full-Text con unaccent y pg_trgm)
 *         example: "pizza"
 *       - in: query
 *         name: rubroId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por UUID del rubro principal
 *       - in: query
 *         name: rubroSlug
 *         schema:
 *           type: string
 *         description: Filtrar por slug del rubro (ej. gastronomia)
 *         example: "gastronomia"
 *       - in: query
 *         name: categoriaId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por UUID de categoría
 *       - in: query
 *         name: categoriaSlug
 *         schema:
 *           type: string
 *         description: Filtrar por slug de la categoría
 *         example: "pizzerias-y-sandwicherias"
 *       - in: query
 *         name: tipoPerfil
 *         schema:
 *           type: string
 *           enum: [comercio, oficio_independiente, servicio_profesional, emprendimiento]
 *         description: Tipo de perfil comercial
 *       - in: query
 *         name: atiendeADomicilio
 *         schema:
 *           type: boolean
 *         description: Negocios u oficios que atienden a domicilio
 *       - in: query
 *         name: haceEnvios
 *         schema:
 *           type: boolean
 *         description: Negocios que hacen envíos o delivery
 *       - in: query
 *         name: abiertoAhora
 *         schema:
 *           type: boolean
 *         description: Comercios abiertos en tiempo real (evaluando hora local de Alberdi y corte de siesta)
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [todos, negocios, publicaciones]
 *           default: todos
 *         description: Entidad a buscar
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Cantidad de resultados por página (máx. 50)
 *     responses:
 *       200:
 *         description: Búsqueda ejecutada exitosamente con resultados ordenados por Ranking Justo
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
 *                   example: "Búsqueda ejecutada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     negocios:
 *                       type: array
 *                       items:
 *                         type: object
 *                     publicaciones:
 *                       type: array
 *                       items:
 *                         type: object
 *                     paginacion:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 */

/**
 * @openapi
 * /api/descubrimiento/destacados:
 *   get:
 *     summary: Obtener los destacados de portada de Juan Bautista Alberdi
 *     tags: [Descubrimiento]
 *     responses:
 *       200:
 *         description: Publicaciones con Estrellas de Vidriera y Comercios Destacados (Planes Oro y Plata rotados)
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
 *                   example: "Destacados de portada obtenidos exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     publicacionesDestacadas:
 *                       type: array
 *                       items:
 *                         type: object
 *                     negociosDestacados:
 *                       type: array
 *                       items:
 *                         type: object
 */
