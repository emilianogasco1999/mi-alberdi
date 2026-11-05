/**
 * @openapi
 * tags:
 *   name: Almacenamiento
 *   description: Servicio de carga segura de archivos (logos, banners, fotos, comprobantes y reels) mediante URLs prefirmadas S3/MinIO
 */

/**
 * @openapi
 * /api/storage/presigned-url:
 *   post:
 *     summary: Generar URL prefirmada para subida directa a S3/MinIO
 *     tags: [Almacenamiento]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipoDestino
 *               - contentType
 *             properties:
 *               tipoDestino:
 *                 type: string
 *                 enum: [logo, banner, publicacion, comprobante, reel, avatar]
 *                 description: Contexto del archivo
 *               contentType:
 *                 type: string
 *                 example: image/webp
 *                 description: MIME type del archivo
 *               negocioId:
 *                 type: string
 *                 format: uuid
 *                 description: ID del negocio (opcional para logo, banner, publicación o reel)
 *               fileSizeBytes:
 *                 type: integer
 *                 description: Tamaño en bytes para validación previa de cuota
 *     responses:
 *       200:
 *         description: URL prefirmada generada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadUrl:
 *                   type: string
 *                   description: URL temporal firmada para emitir solicitud PUT con el binario
 *                 fileKey:
 *                   type: string
 *                   description: Clave única en el bucket
 *                 publicUrl:
 *                   type: string
 *                   description: URL pública final de consulta del recurso
 *                 expiresInSeconds:
 *                   type: integer
 *                   example: 900
 *       400:
 *         description: MIME type no permitido o tamaño excedido
 *       401:
 *         description: No autenticado
 */

