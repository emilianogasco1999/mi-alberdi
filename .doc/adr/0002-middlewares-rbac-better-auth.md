# ADR 0002: Middlewares de Autenticación y Control de Roles (RBAC) con Better Auth

- **Estado:** Aceptado
- **Fecha:** 2026-11-19
- **Autores:** Emiliano Gasco (@emilianogasco1999) & AI Assistant
- **Contexto del Ticket:** `HU-02` (POW-140) / `SUB-BE-02.2` (POW-144)

---

## 1. Contexto y Problema

Para blindar endpoints protegidos en Express bajo la arquitectura de Better Auth, era necesario sustituir la verificación manual de tokens JWT por middlewares centralizados que extraigan la sesión activa (`session.user` y `session.session`), validen los roles autorizados y rechacen peticiones no autorizadas de forma homogénea con el estándar HTTP (401 Unauthorized y 403 Forbidden).

Además, era crítico mantener compatibilidad con las más de 10 rutas existentes en el backend que ya importaban `authMiddleware` y utilizaban `req.user.rol` e `id`.

---

## 2. Decisiones de Arquitectura Tomadas

### D1: Adopción Canónica de `requireAuth` con Alias `authMiddleware`
Se implementó el middleware principal `requireAuth` en `apps/api/src/core/presentation/middlewares/auth.middleware.ts`, extrayendo la sesión a través de:
```typescript
const sessionData = await auth.api.getSession({
  headers: fromNodeHeaders(req.headers),
});
```
Se exporta `authMiddleware = requireAuth` como alias de compatibilidad y se crea el archivo `apps/api/src/infrastructure/auth/auth.middleware.ts` re-exportando el contrato.

### D2: Soporte Dual Transparente (Cookies y Bearer Tokens)
Better Auth inspecciona de forma nativa la cabecera `Cookie` (`better-auth.session_token`) y la cabecera `Authorization: Bearer <token>`.
Se desechó la verificación manual obligatoria de JWTs en producción, reteniendo un fallback transitorio únicamente para tokens sintéticos de tests aislados.

### D3: Tipado Extendido de Express Request (`req.user` y `req.session`)
Se expandieron las interfaces globales de Express:
- `req.user`: Contiene las propiedades oficiales de Better Auth (`id`, `name`, `email`, `role`, `image`) y expone además el alias `rol: user.role as RolUsuario` para retrocompatibilidad total con la lógica de negocio previa.
- `req.session`: Contiene los metadatos de la sesión activa (`id`, `userId`, `expiresAt`, `token`).

### D4: Control de Acceso Basado en Roles (`requireRole`)
Se actualizó `requireRole` para validar que `req.user.role` pertenezca a la lista de roles permitidos:
- Si el usuario no está autenticado: responde HTTP 401 (`UnauthorizedError`).
- Si el rol no coincide: lanza `ForbiddenError('No tenés permisos suficientes para realizar esta acción')` respondiendo HTTP 403.
- La comparación se normaliza a minúsculas (`toLowerCase()`) para garantizar interoperabilidad case-insensitive.

---

## 3. Consecuencias y Tradeoffs

- **Positivas:**
  - Control de acceso desacoplado y seguro, integrado con el ciclo de vida de sesiones de Better Auth.
  - Cero regresiones en los endpoints existentes (`negocios`, `catalogo`, `membresias`, `analitica`, `usuarios`).
  - Cobertura con tests de integración (52 tests pasando en la suite total).
- **Tradeoffs:**
  - `requireAuth` es asíncrono y delega los errores capturados a `next(error)` para asegurar integración limpia con el `errorHandler` de Express.
