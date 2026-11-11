# Mi Alberdi 🏙️

**Mi Alberdi** es la plataforma digital de descubrimiento comercial, oficios, profesionales y emprendimientos para los vecinos de **Juan Bautista Alberdi (Tucumán)**.

Permite encontrar comercios y especialistas locales, ver sus ubicaciones y sucursales en el mapa, consultar horarios de atención (incluyendo horario cortado) y contactarlos **100% directo por WhatsApp sin comisiones ni intermediarios**.

---

## 🚀 Cómo levantar el entorno de Desarrollo (`.dev`)

En desarrollo utilizamos un esquema híbrido: los servicios de infraestructura (**PostgreSQL**, **PgAdmin**, **MinIO S3** y **Backup**) corren en contenedores Docker, mientras que el Backend (`apps/api`) y el Frontend (`apps/web`) corren localmente en tu máquina para máxima velocidad de recarga.

### 0. Clonar el repositorio y sincronizar submódulos de agentes
Si clonás el repositorio por primera vez, hacelo con la bandera `--recurse-submodules`:
```bash
git clone --recurse-submodules https://github.com/emilianogasco1999/mi-alberdi.git
```
> [!IMPORTANT]
> **Para desarrolladores y Asistentes de IA (Antigravity, Cursor, Claude Code)**:
> Si el repositorio ya fue clonado y la carpeta `.agents/skills/pnpm-monorepo` se encuentra vacía, inicializá el submódulo ejecutando:
> ```bash
> git submodule update --init --recursive
> ```
> O mediante el script de npm: `pnpm skills:init`.

### 1. Configurar las variables de entorno
Copiá la plantilla en la raíz del proyecto:
```bash
cp .env.example .env
```

### 2. Instalar dependencias del monorepo
```bash
pnpm install
```

### 3. Levantar los contenedores de apoyo (`postgres`, `pgadmin`, `minio`, `backup`)
```bash
pnpm dev:db
```
*(Ejecuta internamente `docker compose -f .docker/dev/docker-compose.dev.yml up -d`).*

Servicios disponibles en desarrollo:
* **PostgreSQL:** `localhost:5432`
* **PgAdmin 4:** `http://localhost:5050` *(Credenciales en `.env`: `PGADMIN_EMAIL` / `PGADMIN_PASSWORD`)*
* **MinIO API S3:** `http://localhost:9000`
* **MinIO Consola Web:** `http://localhost:9001` *(Credenciales en `.env`: `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`)*

### 4. Sincronizar el esquema de la base de datos
```bash
pnpm --filter "@mi-alberdi/api" db:generate
pnpm --filter "@mi-alberdi/api" db:push
```

### 5. Iniciar las aplicaciones (API + Web)
Podés levantar ambas en paralelo desde la raíz:
```bash
pnpm dev:local
```
O en dos terminales separadas:
```bash
pnpm dev:api   # Backend en http://localhost:4000 (Swagger en /api-docs)
pnpm dev:web   # Frontend en http://localhost:3000
```

### Comandos útiles en Desarrollo
* **Ejecutar un backup manual bajo demanda:** `pnpm dev:backup` *(guarda el volcado en `./backups`)*
* **Detener los contenedores (conservando los datos):** `pnpm dev:down`

---

## 📦 Cómo levantar el entorno de Producción (`.prod`)

En producción **no se incluye PgAdmin** por seguridad y ahorro de recursos. Todo el stack (**PostgreSQL**, **MinIO**, **API**, **Web Standalone** y **Backup automatizado 24/7 por Cron**) corre contenerizado y aislado en su propia red interna, exponiendo PostgreSQL y la consola de administración de MinIO únicamente a `127.0.0.1`.

### 1. Preparar el archivo `.env` de producción
Asegurate de completar las claves reales de producción en el archivo `.env` de la raíz (`POSTGRES_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `MINIO_ROOT_PASSWORD`, `CORS_ORIGIN`).

### 2. Construir y desplegar el stack de producción
```bash
pnpm prod:up
```
*(Ejecuta internamente `docker compose --env-file .env -f .docker/prod/docker-compose.prod.yml up -d --build`).*

### 3. Aplicar migraciones en producción
```bash
docker exec -it mi_alberdi_api_prod npx prisma migrate deploy
```

### Comandos útiles en Producción
* **Detener el entorno de producción:** `pnpm prod:down`
* **Ver logs en tiempo real:** `docker compose -f .docker/prod/docker-compose.prod.yml logs -f`
* **Disparar backup manual en producción:**
  ```bash
  docker compose -f .docker/prod/docker-compose.prod.yml exec backup /scripts/backup.sh
  ```

---

## 📁 Estructura General

* `.doc/`: Documentación de producto y diagrama de base de datos ([`mi-alberdi.dbml`](./.doc/mi-alberdi.dbml)).
* `.docker/`: Archivos `docker-compose` separados por entorno (`dev/`, `prod/` y servicio `backup/`).
* `packages/config`: Configuraciones base de TypeScript.
* `packages/shared`: Contratos Zod, tipos y constantes de dominio compartidas entre API y Web.
* `apps/api`: Servidor Backend (Express + Prisma ORM + Clean Architecture).
* `apps/web`: Aplicación Web (Next.js App Router + Tailwind CSS + Clean Architecture).

