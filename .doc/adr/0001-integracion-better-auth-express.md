# ADR 0001: Integración de Better Auth en Express y Normalización de Identidad

- **Estado:** Aceptado
- **Fecha:** 2026-11-19
- **Autores:** Emiliano Gasco (@emilianogasco1999) & AI Assistant
- **Contexto del Ticket:** `HU-02` (POW-140) / `SUB-BE-02.1` (POW-143)

---

## 1. Contexto y Problema

El backend de Mi Alberdi contaba con un esquema de autenticación artesanal basado en JWTs emitidos manualmente (`AuthRoutes`, `AuthController`, `perfiles_usuarios`) sin soporte nativo para rotación de sesiones en base de datos, revocación granular, multi-factor o control RBAC centralizado con estándares modernos.

Para la épica **HU-02** ("Autenticación y Control de Sesión con Better Auth"), se definió migrar a **Better Auth** con persistencia en PostgreSQL mediante el adaptador de Prisma. Era necesario resolver el acoplamiento del pipeline HTTP en Express y asegurar la convivencia de roles y modelos de dominio.

---

## 2. Decisiones de Arquitectura Tomadas

### D1: Reemplazo Total de `/api/auth` en Express
Se elimina el montaje del router artesanal de autenticación JWT y se delega el 100% del prefijo `/api/auth/*` al handler nativo de Better Auth:
```typescript
app.all('/api/auth', toNodeHandler(auth));
app.all('/api/auth/*', toNodeHandler(auth));
```
**Justificación:** Evitar estados de *split-brain*, código muerto o dependencias duales de tokens. Better Auth asume el ciclo de vida completo de endpoints (`/sign-in/email`, `/sign-up/email`, `/sign-out`, `/get-session`, etc.).

### D2: Estandarización de Roles en Minúsculas
A pesar de que el texto descriptivo del ticket enunciaba roles en mayúsculas (`ADMIN`, `COMERCIANTE`), se resolvió priorizar la coherencia del monorepo (`@mi-alberdi/shared` y `schema.prisma`), manteniendo todos los roles estrictamente en minúsculas:
- `'admin'`
- `'comerciante'`
- `'vecino'`
- `'moderador'`

### D3: Auto-Registro Público con Rol por Defecto `'vecino'`
Al habilitar `emailAndPassword: { enabled: true }`, cualquier usuario que utilice `/sign-up/email` recibe obligatoriamente el rol `'vecino'`.
Los roles de acceso privilegiado (`'admin'` y `'comerciante'`) quedan vedados del payload público (`input: false` en `additionalFields`) y solo pueden crearse a través de:
1. El seed inicial del sistema (`auth.api.createUser`).
2. El endpoint administrativo protegido de alta de comerciantes (`POST /api/admin/usuarios` de HU-01).

### D4: Configuración de Orígenes Confiables y Cookies sin Impacto en Frontend
Se parametrizaron los `trustedOrigins` en Better Auth (`process.env.CORS_ORIGIN`, `http://localhost:3000`, `http://127.0.0.1:3000`) para garantizar compatibilidad con cookies de sesión `HttpOnly` y `SameSite: 'lax'`, sin forzar modificaciones prematuras en `apps/web`.

### D5: Smoke Test de Pipeline en Sub-BE-02.1
Se incorpora una suite de pruebas con Supertest (`better-auth.smoke.test.ts`) que valida de punta a punta:
1. `GET /api/auth/get-session` sin cookies devuelve 200 con `null`.
2. `POST /api/auth/sign-in/email` con credenciales inválidas rechaza con 401.
3. `POST /api/auth/sign-in/email` con usuario de seed autentica y emite cabecera `set-cookie`.
4. `GET /api/auth/get-session` con cookie recupera la sesión y usuario con rol `'admin'`.

---

## 3. Consecuencias y Tradeoffs

- **Positivas:**
  - Código desacoplado, robusto y testeable.
  - Compatibilidad total entre Express, Prisma y Better Auth.
  - Sesiones opacas persistidas en la tabla `session` con auditoría de expiración e impersonación.
- **Tradeoffs:**
  - Los clientes deben enviar `credentials: 'include'` en peticiones fetch/axios para que el navegador adjunte las cookies de sesión.
  - La suite de tests requiere una base de datos activa con el seed ejecutado para validar el happy path del login.
