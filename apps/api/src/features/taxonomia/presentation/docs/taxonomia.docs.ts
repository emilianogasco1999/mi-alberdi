/**
 * @openapi
 * tags:
 *   name: Taxonomía
 *   description: Catálogo jerárquico de rubros, categorías, medios de pago y planes de suscripción de Juan Bautista Alberdi
 */

/**
 * @openapi
 * /api/taxonomia/arbol:
 *   get:
 *     summary: Obtener el árbol taxonómico completo
 *     tags: [Taxonomía]
 *     responses:
 *       200:
 *         description: Lista jerárquica de rubros con sus categorías y subcategorías
 */

/**
 * @openapi
 * /api/taxonomia/rubros:
 *   get:
 *     summary: Obtener todos los rubros principales
 *     tags: [Taxonomía]
 *     responses:
 *       200:
 *         description: Lista plana de rubros ordenados
 */

/**
 * @openapi
 * /api/taxonomia/rubros/{rubroIdOrSlug}/categorias:
 *   get:
 *     summary: Obtener las categorías de un rubro
 *     tags: [Taxonomía]
 *     parameters:
 *       - in: path
 *         name: rubroIdOrSlug
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID o slug del rubro
 *     responses:
 *       200:
 *         description: Categorías principales y subcategorías del rubro solicitado
 */

/**
 * @openapi
 * /api/taxonomia/metodos-pago:
 *   get:
 *     summary: Obtener los métodos de pago disponibles en el catálogo
 *     tags: [Taxonomía]
 *     responses:
 *       200:
 *         description: Lista de métodos de pago activos (Efectivo, Transferencia, MercadoPago, etc.)
 */

/**
 * @openapi
 * /api/taxonomia/planes:
 *   get:
 *     summary: Obtener los planes de suscripción disponibles (Gratis, Plata, Oro)
 *     tags: [Taxonomía]
 *     responses:
 *       200:
 *         description: Lista de planes con sus características, límites y cupos de destacados
 */
