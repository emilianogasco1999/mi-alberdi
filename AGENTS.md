# Code Review Rules - Mi Alberdi

## Clean Architecture & Monorepo
- Apps: `apps/api` (Express backend) and `apps/web` (Next.js 16 frontend).
- Shared contracts: all DTOs and Zod schemas must live in `packages/shared`.
- In `apps/api`, maintain layer separation: domain -> application -> infrastructure -> presentation.
- Response messages and HTTP status codes in `apps/api` must be centralized in `domain/constants/{feature}.messages.ts`.
- Never use direct database models in public responses; always map to DTOs and omit sensitive fields (e.g. `passwordHash`, `propietarioId`).

## TypeScript & Code Quality
- Strict TypeScript: no `any` types unless strictly necessary for dynamic database drivers.
- Use `const` and `let`, never `var`.
- Prefer named exports.

## Git & Commits
- Follow Conventional Commits: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `build`.
- No direct commits to `main`, `qa`, or `dev`.
- Branches must follow `feature/*`, `bugfix/*`, or `hotfix/*`.

## Cierre de Tareas y Comentarios de Linear (Definition of Done)
Siempre que se dé por finalizada una tarea, feature o bugfix, es **obligatorio** generar el reporte para el ticket de Linear con la siguiente estructura completa:

```markdown
### 📌 Resumen de la Tarea
- **Descripción**: [Qué se implementó o corrigió de forma concisa]
- **Rama / PR**: `feature/...` o `bugfix/...` | [PR #XX si fue abierto]
- **Requiere Migración / Env**: [No | Sí: detallar migraciones de Prisma o nuevas variables requeridas en .env]

---

### 📂 Archivos Modificados
- `apps/api/src/...`
- `apps/web/src/...`
- `packages/shared/src/...`

---

### 🔌 Endpoints & Contratos (si aplica al backend/API)
> [!IMPORTANT]
> - Validar las rutas contra el archivo de montaje real en Express (`src/index.ts`) para garantizar que el prefijo base sea el exacto implementado en el backend (ej. `/api/...` sin asumir prefijos no configurados).
> - Si la tarea o feature involucra **múltiples endpoints**, es **estrictamente obligatorio** desglosar **CADA UNO de ellos en su propia subsección** con su método, ruta, payload, response y errores específicos. No omitir ninguno ni resumir en uno solo.

#### 1. `[VERBO] /api/...`
- **Descripción**: [Propósito del endpoint]
- **Payload (Request)** (si aplica):
  ```json
  {}
  ```
- **Response Exitoso (HTTP 200/201)**:
  ```json
  {}
  ```
- **Casos de Error Mapeados**:
  - `400 Bad Request`: [Descripción y código de error centralizado]
  - `401 Unauthorized / 403 Forbidden`: [Descripción]
  - `404 Not Found / 409 Conflict`: [Descripción]

#### 2. `[VERBO] /api/...`
- **Descripción**: [Propósito del endpoint]
- **Payload (Request)** (si aplica):
  ```json
  {}
  ```
- **Response Exitoso (HTTP 200/201)**:
  ```json
  {}
  ```
- **Casos de Error Mapeados**:
  - `400 Bad Request`: [Descripción]
  - `404 Not Found`: [Descripción]

---

### 🧪 Guía de Pruebas (QA / Review)

#### 1. Happy Path (Verificación de funcionamiento exitoso)
1. [Paso 1: Levantar servicios / estado inicial]
2. [Paso 2: Ejecución de la acción / petición curl / interacción UI]
3. [Paso 3: Resultado esperado y validación de persistencia/respuesta]

#### 2. Unhappy Paths (Verificación de errores esperados)
- **Caso A ([Ej. Contraseña inválida / Registro duplicado])**: [Acción disparadora] -> Debe responder [Status HTTP] con mensaje de error específico.
- **Caso B ([Ej. Faltan campos requeridos en Zod])**: [Acción disparadora] -> Debe responder 400 Bad Request con detalle de validación.
```

