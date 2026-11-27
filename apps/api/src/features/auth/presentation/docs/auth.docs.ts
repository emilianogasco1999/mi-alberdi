/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: Autenticación, registro y control de sesiones con Better Auth
 */

/**
 * @openapi
 * /api/auth/sign-in/email:
 *   post:
 *     summary: Iniciar sesión con email y contraseña (Better Auth)
 *     description: Autentica al usuario, emite la cookie segura HttpOnly `better-auth.session_token` y retorna el usuario y token de sesión.
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
 *                 example: admin@mialberdi.com.ar
 *               password:
 *                 type: string
 *                 example: AdminAlberdi2026!
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso. Retorna el usuario autenticado y emite la cookie de sesión.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token de sesión emitido por Better Auth
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: admin
 *       401:
 *         description: Credenciales inválidas o usuario inexistente
 */

/**
 * @openapi
 * /api/auth/get-session:
 *   get:
 *     summary: Obtener la sesión activa del usuario actual
 *     description: Recupera los datos del usuario y la sesión activa a partir de la cookie de sesión o cabecera Bearer.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión recuperada exitosamente (retorna null si no hay sesión activa)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               nullable: true
 *               properties:
 *                 session:
 *                   type: object
 *                 user:
 *                   type: object
 */

/**
 * @openapi
 * /api/auth/sign-out:
 *   post:
 *     summary: Cerrar sesión activa (Better Auth)
 *     description: Revoca la sesión activa en base de datos e invalida las cookies de sesión del cliente.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada e invalidada exitosamente
 */

