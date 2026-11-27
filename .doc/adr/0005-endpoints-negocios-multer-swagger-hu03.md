# ADR 0005: Endpoints de Gestión Comercial (HU-03), Middleware Multer 2MB y Swagger Dual

- **Estado:** Aceptado
- **Fecha:** 2026-11-25
- **Autores:** Emiliano Gasco (@emilianogasco1999) & AI Assistant
- **Contexto del Ticket:** `HU-03` (POW-149) / `SUB-BE-03.3` (POW-154)

---

## 1. Contexto y Problema

La subtarea `SUB-BE-03.3` requiere exponer en la capa de presentación de `apps/api/src/features/negocios/presentation/`:
- `GET /api/negocios/mis-comercios`
- `POST /api/negocios`
- `PUT /api/negocios/:id`
- Un middleware de carga de imágenes (`logo` y `banner`) que valide estrictamente las extensiones permitidas (`.jpg`, `.jpeg`, `.png`, `.webp`) y un peso máximo de **2MB** por archivo, además de mantener actualizada la especificación OpenAPI Swagger (`negocios.docs.ts`).

---

## 2. Decisiones de Arquitectura Tomadas

### D1: Middleware Dual `uploadNegocioAssets` (Multipart + JSON)
Se implementó `uploadNegocioAssets` en `apps/api/src/features/negocios/presentation/middlewares/upload-negocio-assets.middleware.ts` con `multer`:
- Si la petición llega con `Content-Type: multipart/form-data`, procesa hasta 1 archivo `logo` y 1 archivo `banner` en memoria (`limits: { fileSize: 2 * 1024 * 1024 }`).
- El `fileFilter` verifica tanto la extensión (`.jpg`, `.jpeg`, `.png`, `.webp`) como el MIME type (`image/jpeg`, `image/png`, `image/webp`).
- Cualquier violación de tamaño (`LIMIT_FILE_SIZE`) o formato (`INVALID_FILE_TYPE`) retorna inmediatamente **HTTP 400 Bad Request** con la estructura estándar de error.
- Si los archivos son válidos, genera las rutas sanitizadas (`/uploads/negocios/logos/<uuid>.<ext>` y `/uploads/negocios/banners/<uuid>.<ext>`) y las inyecta en `req.body.logoUrl` / `req.body.bannerUrl` antes de que actúe `validateRequest(CrearNegocioSchema / ActualizarNegocioSchema)`.
- Si la petición es `application/json`, el middleware hace bypass sin overhead.

### D2: Endpoints de Gestión Comercial Unificados
- Se monta únicamente `GET /api/negocios/mis-comercios` conectado a `ListarMisNegociosUseCase`, eliminando la ruta duplicada heredada `/mis-negocios` para evitar ambigüedad en la frontera HTTP y en Swagger.
- Se conectan `POST /api/negocios` y `PUT /api/negocios/:negocioId` a `CrearNegocioUseCase` y `ActualizarNegocioUseCase` respectivamente, bajo el middleware `authMiddleware` (`requireAuth` de Better Auth).

### D3: Especificación OpenAPI Swagger (`negocios.docs.ts`)
Se actualizó `negocios.docs.ts` incorporando:
- Seguridad dual (`cookieAuth` y `bearerAuth`) en todos los endpoints protegidos del tag `Negocios`.
- Documentación de `GET /api/negocios/mis-comercios`.
- Soporte en Swagger UI tanto para `multipart/form-data` (con inputs `type: string, format: binary` para `logo` y `banner`) como para `application/json` en `POST /api/negocios` y `PUT /api/negocios/{negocioId}`.

---

## 3. Consecuencias y Tradeoffs

- **Positivas:**
  - Los clientes (`apps/web`, Swagger UI, Postman o Supertest) pueden crear y editar comercios enviando `FormData` con archivos adjuntos o JSON puro indistintamente.
  - Protección en frontera HTTP contra archivos ejecutables o mayores a 2MB antes de tocar la capa de aplicación o base de datos.
- **Tradeoffs:**
  - En entorno local/test `multer.memoryStorage()` valida y genera las rutas de assets sin escribir archivos huérfanos en el disco del repositorio durante las corridas de Supertest.
