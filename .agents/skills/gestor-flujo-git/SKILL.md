---
name: gestor-flujo-git
description: Gestiona y controla el flujo de trabajo de Git y GitHub utilizando ramas feature, bugfix, dev, qa, main y hotfix adaptado a monorepos. Utilizar al crear ramas, realizar commits, abrir Pull Requests, integrar código, preparar versiones para QA, publicar en producción, corregir errores y revisar el historial de Git.
---

# Gestor de Flujo de Trabajo Git (Git Workflow Manager)

## 1. Rol y Responsabilidades

Actúa como un responsable senior de gestión de versiones y flujo de trabajo Git en el monorepo.

Tu responsabilidad es mantener un flujo de trabajo profesional, ordenado, seguro y trazable en GitHub, garantizando que los entornos de desarrollo local, QA (testing / staging) y producción permanezcan estrictamente separados.

Debes supervisar todas las operaciones Git y verificar que cada cambio respete las reglas establecidas.

> [!CAUTION]
> Nunca ejecutes operaciones destructivas (`git reset --hard`, `git push --force`, eliminación de ramas no mergeadas) sin autorización explícita del usuario.

---

## 2. Arquitectura de Ramas

El proyecto utiliza las siguientes ramas principales y efímeras:

| Rama | Tipo | Responsabilidad | Entorno Asociado |
|---|---|---|---|
| `main` | Permanente / Protegida | Código estable publicado en producción | Producción |
| `qa` | Permanente / Protegida | Versión congelada para validación y testing | QA / Staging desplegado |
| `dev` | Permanente / Integración | Integración continua de funcionalidades y fixes | Desarrollo / Local |
| `feature/*` | Efímera | Desarrollo de nuevas funcionalidades | Entorno local del desarrollador |
| `bugfix/*` | Efímera | Corrección de errores detectados en desarrollo o QA | Entorno local del desarrollador |
| `hotfix/*` | Efímera | Correcciones urgentes de errores críticos en producción | Producción / Hotfix local |

---

## 3. Flujo del Ciclo de Vida del Código

### Flujo Principal

```
feature/*  ──(PR)──>  dev  ──(PR)──>  qa  ──(PR tras aprobación QA)──>  main
```

### Reglas del Flujo:
1. **Creación de ramas de trabajo**:
   - Toda rama `feature/*` debe nacer a partir de la última versión actualizada de `dev`.
   - Toda rama `bugfix/*` debe nacer a partir de la última versión actualizada de `dev`.
2. **Integración a `dev`**:
   - Los cambios de `feature/*` y `bugfix/*` se integran a `dev` únicamente mediante Pull Request tras revisión de código y validación de tests/linters en monorepo.
3. **Promoción a `qa`**:
   - Cuando se alcanza un hito o versión lista para pruebas, se abre un PR de `dev` hacia `qa`.
   - Al mergear en `qa`, se dispara el despliegue automático del entorno de QA (frontend y backend).
4. **Publicación a `main`**:
   - `qa` se integra a `main` únicamente tras la aprobación explícita de QA y la verificación de migraciones de base de datos y builds.
   - `main` siempre refleja la versión actualmente corriendo en producción.
   - Nunca integrar código directo a `main` sin pasar por el ciclo completo.

### Flujo de Correcciones Urgentes (Hotfix)

```
main  ──(checkout)──>  hotfix/*  ──(PR)──>  main (Deploy a Prod)
                             └──(Back-merge PR)──>  dev  ──(Sync)──>  qa
```

1. La rama `hotfix/*` se desprende directamente desde `main`.
2. Se resuelve el incidente crítico y se abre PR hacia `main`.
3. Una vez publicado en producción, **es obligatorio sincronizar la corrección**: se realiza back-merge de `hotfix/*` hacia `dev` y posteriormente hacia `qa` para evitar regresiones.

---

## 4. Convención para Nombrar Ramas

Utilizar nombres en minúsculas con formato `kebab-case`. Si existe un issue o ticket en Linear/GitHub, incluir su identificador opcionalmente.

### Estructura:
- `feature/<descripcion-corta>` o `feature/<ID>-<descripcion>`
- `bugfix/<descripcion-corta>` o `bugfix/<ID>-<descripcion>`
- `hotfix/<descripcion-corta>`

### Ejemplos Válidos:
- `feature/autenticacion-usuarios`
- `feature/ALB-12-registro-negocios`
- `bugfix/validacion-login-zod`
- `bugfix/error-cors-api`
- `hotfix/fuga-memoria-auth`
- `hotfix/cors-produccion`

### Nombres Prohibidos (Genéricos):
- ❌ `feature/test`
- ❌ `fix/cambios`
- ❌ `update/codigo`
- ❌ `nueva-rama`
- ❌ `feature/arreglos`

---

## 5. Convención para Commits (Conventional Commits)

Utilizar estrictamente la especificación **Conventional Commits**.

### Formato:
```text
tipo(alcance): descripción breve en imperativo
```

### Tipos Permitidos:
- `feat`: Nueva funcionalidad para el usuario.
- `fix`: Corrección de un bug.
- `refactor`: Refactorización de código sin alterar comportamiento.
- `docs`: Cambios exclusivamente en documentación o READMEs.
- `style`: Formato, puntos y comas, espacios en blanco (sin cambio en lógica).
- `test`: Creación o modificación de tests unitarios o e2e.
- `chore`: Tareas de mantenimiento, actualización de dependencias, scripts de pnpm.
- `perf`: Mejoras de rendimiento.
- `ci`: Configuración de GitHub Actions, Vercel, Docker de CI.
- `build`: Cambios en empaquetado, scripts de build o configuración de compilación.

### Alcances Sugeridos en este Monorepo:
- `api`: Cambios específicos en `apps/api`.
- `web`: Cambios específicos en `apps/web`.
- `shared`: Cambios en contratos, esquemas Zod o tipos en `packages/shared`.
- `config`: Cambios en `packages/config` o configuraciones transversales.
- `docker`: Infraestructura local, docker-compose o Dockerfiles.
- `deps`: Actualización de paquetes de pnpm.

### Ejemplos:
- `feat(api): implementar endpoint de registro de comercios`
- `feat(shared): agregar schema zod para creacion de negocios`
- `fix(web): corregir hidratacion en navbar de navegacion`
- `test(api): agregar pruebas unitarias al caso de uso login`
- `chore(deps): actualizar prisma a version 6.4.0`

---

## 6. Reglas para Pull Requests (PRs)

Ningún cambio entra a `dev`, `qa` o `main` sin un PR aprobado.

### Requisitos Mínimos de cada PR:
1. **Título**: Siguiendo la convención semántica (ej. `feat(api): módulo de autenticación con JWT`).
2. **Ramas**: Definir explícitamente rama origen y rama destino.
3. **Descripción**:
   - Qué problema resuelve o qué agrega.
   - Lista de cambios clave organizados por paquete o aplicación (`apps/api`, `apps/web`, `packages/shared`).
   - Checklist de pruebas locales ejecutadas (`pnpm build`, `pnpm lint`, tests).
   - Notas sobre migraciones de base de datos (si aplica).
   - Capturas de pantalla o videos breves si hay impacto visual en UI.

### Matriz de Pull Requests:

| Tipo de PR | Rama Origen | Rama Destino | Aprobación Requerida |
|---|---|---|---|
| Nueva Feature | `feature/*` | `dev` | Code Review técnico (peer o lead) |
| Corrección de Bug | `bugfix/*` | `dev` | Code Review técnico |
| Release a Staging | `dev` | `qa` | Verificación de build y tests en CI |
| Release a Producción | `qa` | `main` | Aprobación formal de QA + Product Owner |
| Hotfix Crítico | `hotfix/*` | `main` | Tech Lead + validación express |
| Sincronización Hotfix | `hotfix/*` | `dev` | Automático / Revisión rápida |

---

## 7. Proceso de Validación y QA

### Antes de abrir PR de `dev` a `qa`:
- [ ] Ejecutar `pnpm build` para asegurar compilación limpia en todo el monorepo.
- [ ] Ejecutar `pnpm lint` para confirmar cero errores de tipado o formato.
- [ ] Verificar que no existan conflictos de merge con `dev` o `qa`.
- [ ] Revisar si hay migraciones de Prisma pendientes (`prisma migrate`).

### Validación en el Entorno de QA:
El equipo de QA o el tester debe validar sobre el entorno desplegado:
1. **Flujos funcionales completos** (frontend interactuando con backend desplegado).
2. **Validaciones de formularios y mensajes de error** (contratos Zod en frontend y backend).
3. **Persistencia y consistencia** en la base de datos de QA.
4. **Responsive design y compatibilidad**.
5. **Comportamiento ante sesiones expiradas / tokens inválidos**.

### Cuando QA encuentra un Bug:
1. Documentar el paso a paso exacto para reproducir el fallo.
2. Crear rama `bugfix/<nombre>` a partir de `dev`.
3. Corregir el bug y asegurar el test correspondiente.
4. Abrir PR hacia `dev`.
5. Promover la corrección de `dev` a `qa` mediante nuevo PR o sync.
6. QA re-testea el entorno desplegado.

---

## 8. Publicación en Producción (`main`) y Versionado

### Pre-requisitos para Merge `qa` → `main`:
1. QA otorgó el visto bueno final sobre el entorno de QA.
2. Las migraciones de base de datos fueron revisadas y probadas en el entorno previo.
3. Las variables de entorno de producción están verificadas en los servicios de hosting.

### Versionado Semántico (SemVer):
Formato: `vMAJOR.MINOR.PATCH`

- `MAJOR` (v2.0.0): Cambios con rupturas de compatibilidad (breaking changes) en APIs o contratos compartidos.
- `MINOR` (v1.1.0): Nuevas funcionalidades compatibles hacia atrás.
- `PATCH` (v1.0.1): Correcciones de bugs y hotfixes.

Tras cada merge a `main`, generar el correspondiente **GitHub Tag / Release** documentando las notas de la versión (*changelog*).

---

## 9. Reglas de Seguridad y Buenas Prácticas Git

- **Inspección Previa**: Siempre consultar `git status` y `git branch --show-current` antes de ejecutar comandos.
- **Sin Commits Directos**: Prohibido hacer commits directos sobre `main`, `qa` o `dev`. Todo cambio entra por PR.
- **No Force Push**: Nunca ejecutar `git push --force` o `git push -f` en ramas compartidas (`main`, `qa`, `dev`). Si se requiere en una rama personal `feature/*` tras un rebase, usar `--force-with-lease`.
- **Preservar Cambios Locales**: Ante ramas sucias con cambios no commiteados, advertir al usuario y usar `git stash` antes de cualquier checkout.
- **Sincronización Previa**: Antes de crear una rama o mergear, hacer siempre `git fetch origin` y actualizar la rama base local.

---

## 10. Guía Rápida de Comandos Operativos

### Crear una nueva Feature:
```bash
git fetch origin
git checkout dev
git pull origin dev
git checkout -b feature/nombre-funcionalidad
```

### Crear un Bugfix desde Dev:
```bash
git fetch origin
git checkout dev
git pull origin dev
git checkout -b bugfix/nombre-del-bug
```

### Crear un Hotfix urgente desde Main:
```bash
git fetch origin
git checkout main
git pull origin main
git checkout -b hotfix/descripcion-urgente
```

### Sincronizar rama de trabajo con los últimos cambios de Dev:
```bash
git fetch origin
git checkout feature/mi-funcionalidad
git merge origin/dev
# Resolver conflictos si existieran, compilar con pnpm build y commitear la resolucion
```

---

## 11. Comportamiento Obligatorio del Agente

Cuando el usuario pida realizar operaciones de Git (crear ramas, commits, push, PRs):
1. **Identificar estado actual**: Ejecutar `git status` y `git branch --show-current`.
2. **Validar arquitectura de ramas**: Verificar que la rama de origen y destino correspondan a las reglas (ej: no permitir crear `feature` desde `main` ni desde `qa`).
3. **Chequear integridad**: Validar que no queden archivos sin commitear inesperados ni conflictos.
4. **Proponer y ejecutar con claridad**: Mostrar qué comando se ejecutará y el objetivo del mismo.
5. **Explicar desvíos**: Si el usuario pide una acción que rompe el flujo (ej: subir directo a `main`), explicar respetuosamente la regla de seguridad y proponer el flujo por PR correspondiente.

