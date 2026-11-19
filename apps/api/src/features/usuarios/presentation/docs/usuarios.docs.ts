/**
 * @openapi
 * tags:
 *   name: Usuarios
 *   description: Gestión administrativa de usuarios y comerciantes en Mi Alberdi
 */

/**
 * @openapi
 * /api/admin/usuarios:
 *   post:
 *     summary: Alta manual de usuario comerciante por Administrador
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
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
 *                 minLength: 2
 *                 maxLength: 80
 *                 example: Don Carlos Ferretería
 *               email:
 *                 type: string
 *                 format: email
 *                 example: carlos@ferreteria.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Password123
 *     responses:
 *       201:
 *         description: Usuario comerciante creado exitosamente
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
 *                   example: Usuario comerciante creado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     nombre:
 *                       type: string
 *                     apellido:
 *                       type: string
 *                       nullable: true
 *                     email:
 *                       type: string
 *                     telefono:
 *                       type: string
 *                       nullable: true
 *                     avatarUrl:
 *                       type: string
 *                       nullable: true
 *                     rol:
 *                       type: string
 *                       example: comerciante
 *                     estado:
 *                       type: string
 *                       example: activo
 *                     puedeProbarPremium:
 *                       type: boolean
 *                       example: true
 *                     creadoEn:
 *                       type: string
 *                       format: date-time
 *                     actualizadoEn:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Datos de entrada inválidos (Error de validación Zod)
 *       401:
 *         description: No autenticado / Token de acceso no proporcionado o inválido
 *       403:
 *         description: No autorizado / Requiere rol de Administrador
 *       409:
 *         description: El correo electrónico ya se encuentra registrado en el sistema
 */
