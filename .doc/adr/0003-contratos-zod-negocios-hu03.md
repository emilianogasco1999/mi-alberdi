# ADR 0003: Contratos Zod Unificados para Gestión de Negocios (HU-03) y Retrocompatibilidad Relacional

- **Estado:** Aceptado
- **Fecha:** 2026-11-25
- **Autores:** Emiliano Gasco (@emilianogasco1999) & AI Assistant
- **Contexto del Ticket:** `HU-03` (POW-149) / `SUB-BE-03.1` (POW-152)

---

## 1. Contexto y Problema

La épica **HU-03** ("Dashboard y Gestión de Múltiples Comercios u Oficios 1:N") y su subtarea `SUB-BE-03.1` especifican contratos compartidos en `packages/shared/src/schemas/negocio.schema.ts`:
- `CrearNegocioSchema`, `ActualizarNegocioSchema` y `NegocioResponseDto`.
- Campos planos del formulario de dashboard: `nombre` (3 a 100 caracteres), `tipo` (`COMERCIO` | `OFICIO`), `telefono` con formato válido, `direccion` (mínimo 5 caracteres), `descripcion`, `instagram`, `logoUrl` y `bannerUrl`.

Sin embargo, el modelo de dominio relacional canónico de Mi Alberdi (`apps/api/prisma/schema.prisma` y `mi-alberdi-db`) ya se encuentra en producción con 11 casos de uso que consumen `baseNegocioSchema`, `createNegocioSchema`, `updateNegocioSchema` y `NegocioDTO`, utilizando nomenclatura normalizada (`nombreComercial`, `tipoPerfil` en minúsculas, `whatsappPrincipal`, `instagramHandle`, `rubroPrincipalId`, y `ubicaciones_negocio.direccion_escrita`).

Reemplazar abruptamente los nombres de esquemas o campos rompería los casos de uso y controladores existentes en `apps/api`.

---

## 2. Decisiones de Arquitectura Tomadas

### D1: Coexistencia y Normalización Bidireccional de Payloads
Se mantienen intactos los exports canónicos (`baseNegocioSchema`, `createNegocioSchema`, `updateNegocioSchema`, `NegocioDTO`, `NegocioResumenDTO`, `NegocioPublicoDTO`) y se incorporan `CrearNegocioSchema` (`crearNegocioSchema`), `ActualizarNegocioSchema` (`actualizarNegocioSchema`) y `NegocioResponseSchema` (`NegocioResponseDto`).
Mediante `z.preprocess` y `.transform()`, los esquemas aceptan tanto las propiedades planas de la HU-03 (`nombre`, `tipo`, `telefono`, `direccion`, `instagram`) como las propiedades canónicas (`nombreComercial`, `tipoPerfil`, `whatsappPrincipal`, `direccionEscrita`, `instagramHandle`), poblando ambas en el objeto validado resultante.

### D2: Normalización Case-Insensitive del Tipo de Perfil Comercial
En línea con el **ADR 0001 (D2)**, la base de datos persiste los enums en minúsculas (`'comercio' | 'oficio' | 'profesional' | 'emprendimiento'`).
- `tipoNegocioHu03Schema` valida entradas como `'COMERCIO'` u `'OFICIO'` (normalizando a mayúsculas).
- `tipoPerfilComercialSchema` normaliza cualquier entrada a minúsculas (`'comercio' | 'oficio' | ...`) para compatibilidad directa con Prisma.

### D3: Reglas de Validación Estrictas y Centralización de Mensajes
Se crea `packages/shared/src/constants/negocios.messages.ts` (`NEGOCIOS_MESSAGES`) como única fuente de verdad para mensajes de validación:
- **Nombre**: obligatorio, `trim()`, entre 3 y 100 caracteres.
- **Teléfono / WhatsApp**: obligatorio, `trim()`, validación con expresión regular internacional/local (`PHONE_REGEX`).
- **Dirección**: obligatoria en alta (`CrearNegocioSchema`), `trim()`, entre 5 y 200 caracteres.
- **Instagram**: opcional/nullable, admite usuario (`mi_comercio`), handle con arroba (`@mi_comercio`) o URL completa (`https://(www.)instagram.com/mi_comercio`).
- **Assets (`logoUrl`, `bannerUrl`)**: admiten tanto URLs HTTP/HTTPS absolutas (S3/MinIO) como rutas relativas seguras (`/uploads/...`) sin *path traversal* (`..`).

### D4: Aislamiento de PII en `NegocioResponseDto`
Siguiendo las reglas de seguridad de `AGENTS.md` y la HU-03, `NegocioResponseSchema` (`NegocioResponseDto`) excluye explícitamente `propietarioId` (o `usuarioId`), exponiendo únicamente los atributos comerciales públicos y operativos del negocio.

---

## 3. Consecuencias y Tradeoffs

- **Positivas:**
  - Cero regresiones en los 11 casos de uso existentes de `apps/api/src/features/negocios`.
  - El frontend (`SUB-FE-03.1..3`) y los nuevos casos de uso (`SUB-BE-03.2..3`) pueden consumir `CrearNegocioSchema`, `ActualizarNegocioSchema` y `NegocioResponseDto` con los nombres exactos del ticket.
  - Mensajes de error deterministas y centralizados en `@mi-alberdi/shared`.
- **Tradeoffs:**
  - El objeto inferido de `CrearNegocioInput` expone tanto las claves cortas (`nombre`, `tipo`, `telefono`, `direccion`, `instagram`) como las canónicas (`nombreComercial`, `tipoPerfil`, `whatsappPrincipal`, `direccionEscrita`, `instagramHandle`) para facilitar la transición entre capas.
