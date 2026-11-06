/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: Autenticación, registro y sesión de usuarios en Mi Alberdi
 */

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Registra un nuevo usuario (vecino o comerciante)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, email, password]
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               telefono:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       409:
 *         description: El email ya se encuentra registrado
 */

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión y retorna JWT + cookie httpOnly
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       401:
 *         description: Credenciales inválidas
 */

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Obtener el perfil del usuario autenticado actualmente
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil de usuario obtenido exitosamente
 *       401:
 *         description: No autenticado o token inválido
 */

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión e invalidar cookies
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 */
