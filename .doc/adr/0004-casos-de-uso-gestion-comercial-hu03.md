# ADR 0004: Casos de Uso de Gestión Comercial (HU-03) y Aislamiento de Propiedad 1:N

- **Estado:** Aceptado
- **Fecha:** 2026-11-25
- **Autores:** Emiliano Gasco (@emilianogasco1999) & AI Assistant
- **Contexto del Ticket:** `HU-03` (POW-149) / `SUB-BE-03.2` (POW-153)

---

## 1. Contexto y Problema

En la épica **HU-03** ("Dashboard y Gestión de Múltiples Comercios u Oficios 1:N"), un comerciante autenticado con Better Auth puede dar de alta, listar y actualizar múltiples locales u oficios asociados a su cuenta (`propietarioId` / `usuarioId`).

El ticket `SUB-BE-03.2` exige la implementación en Clean Architecture (`apps/api/src/features/negocios/application/`) de:
- `CrearNegocioUseCase`
- `ListarMisNegociosUseCase`
- `ActualizarNegocioUseCase`
- Validación estricta de propiedad (`negocio.propietarioId === usuarioId`) y tests unitarios aislados mediante un repositorio en memoria (`InMemoryNegociosRepository`).

Además, era necesario garantizar cero regresiones en los casos de uso previamente existentes (`AltaNegocioSimpleUseCase`, `GetMisNegociosUseCase`, `UpdateNegocioUseCase`) y sincronizar la dirección principal del formulario plano de HU-03 con la entidad `UbicacionNegocio` (`esPrincipal = true`).

---

## 2. Decisiones de Arquitectura Tomadas

### D1: Casos de Uso Dedicados con Proyección a `NegocioResponseDto`
Se implementan `CrearNegocioUseCase`, `ListarMisNegociosUseCase` y `ActualizarNegocioUseCase` apoyados en el mapper puro `toNegocioResponseDto` (`negocio-response.mapper.ts`).
- Toda salida omite `propietarioId` para impedir fugas de PII en la frontera de aplicación/presentación.
- El DTO resultante expone tanto las propiedades del contrato HU-03 (`nombre`, `tipo`, `telefono`, `direccion`, `instagram`) como las canónicas (`nombreComercial`, `tipoPerfil`, `whatsappPrincipal`, `direccionEscrita`, `instagramHandle`).

### D2: Validación Estricta de Propiedad en `ActualizarNegocioUseCase`
En `ActualizarNegocioUseCase.execute(negocioId, usuarioId, input)`:
1. Si `repository.findById(negocioId)` retorna `null`, arroja `NotFoundError` (HTTP 404).
2. Si `negocio.propietarioId !== usuarioId`, arroja `ForbiddenError` (HTTP 403), garantizando aislamiento estricto entre comerciantes (un comerciante jamás puede editar el comercio de otro).

### D3: Persistencia de Dirección en Sucursal Principal y Rubro por Defecto
En `NegociosRepositoryImpl.createSimple` y `update` (así como en `InMemoryNegociosRepository`):
- Al crear un negocio desde el flujo simple de HU-03, la `direccion` / `direccionEscrita` se guarda en la sucursal principal (`Casa Central`, `esPrincipal: true`), y al actualizar el negocio con una nueva dirección, se actualiza dicha sucursal principal dentro de la misma transacción.
- Si el payload de HU-03 no incluye `rubroPrincipalId`, `createSimple` resuelve el primer rubro activo ordenado del catálogo.

### D4: Test Double en Memoria (`InMemoryNegociosRepository`)
Se implementa `InMemoryNegociosRepository` cumpliendo el contrato completo de `INegociosRepository` para ejecutar pruebas unitarias deterministas en milisegundos sin acoplamiento a PostgreSQL.

---

## 3. Consecuencias y Tradeoffs

- **Positivas:**
  - Cumplimiento estricto de Clean Architecture (dependencia hacia `INegociosRepository` e independencia del ORM en la capa `application`).
  - Velocidad de ejecución de tests unitarios (< 10ms) con verificación exhaustiva de relación 1:N, generación de slugs únicos y bloqueo 403/404.
  - Retrocompatibilidad intacta con `NegociosController`.
- **Tradeoffs:**
  - Mantenimiento de `InMemoryNegociosRepository` alineado cuando se agreguen nuevos métodos a `INegociosRepository`.
