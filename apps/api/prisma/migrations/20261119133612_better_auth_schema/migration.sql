/*
  Warnings:

  - You are about to drop the `perfiles_usuarios` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "auditoria_accesos" DROP CONSTRAINT "auditoria_accesos_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "feedback_plataforma" DROP CONSTRAINT "feedback_plataforma_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "negocios" DROP CONSTRAINT "negocios_propietario_id_fkey";

-- DropForeignKey
ALTER TABLE "opiniones" DROP CONSTRAINT "opiniones_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "pagos_membresia" DROP CONSTRAINT "pagos_membresia_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "reportes_moderacion" DROP CONSTRAINT "reportes_moderacion_reportante_id_fkey";

-- DropForeignKey
ALTER TABLE "reportes_moderacion" DROP CONSTRAINT "reportes_moderacion_revisado_por_fkey";

-- DropForeignKey
ALTER TABLE "solicitudes_verificacion" DROP CONSTRAINT "solicitudes_verificacion_revisado_por_fkey";

-- DropForeignKey
ALTER TABLE "solicitudes_verificacion" DROP CONSTRAINT "solicitudes_verificacion_solicitante_id_fkey";

-- DropIndex
DROP INDEX "idx_negocios_eslogan_trgm";

-- DropIndex
DROP INDEX "idx_negocios_nombre_trgm";

-- DropIndex
DROP INDEX "idx_negocios_search_vector";

-- DropIndex
DROP INDEX "idx_publicaciones_search_vector";

-- DropIndex
DROP INDEX "idx_publicaciones_titulo_trgm";

-- AlterTable
ALTER TABLE "auditoria_accesos" ALTER COLUMN "usuario_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "configuracion_sistema" ALTER COLUMN "usuarios_excluidos_mantenimiento" SET DATA TYPE TEXT[];

-- AlterTable
ALTER TABLE "feedback_plataforma" ALTER COLUMN "usuario_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "negocios" ALTER COLUMN "propietario_id" SET DATA TYPE TEXT,
ALTER COLUMN "whatsapp_mensaje_default" SET DEFAULT 'Hola, te vi en Mi Alberdi y quería hacerte una consulta.';

-- AlterTable
ALTER TABLE "opiniones" ALTER COLUMN "usuario_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "pagos_membresia" ALTER COLUMN "usuario_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "reportes_moderacion" ALTER COLUMN "reportante_id" SET DATA TYPE TEXT,
ALTER COLUMN "revisado_por" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "solicitudes_verificacion" ALTER COLUMN "solicitante_id" SET DATA TYPE TEXT,
ALTER COLUMN "revisado_por" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "perfiles_usuarios";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" VARCHAR(30) DEFAULT 'vecino',
    "banned" BOOLEAN DEFAULT false,
    "ban_reason" TEXT,
    "ban_expires" TIMESTAMP(3),
    "telefono" VARCHAR(30),
    "puede_probar_premium" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "ip_address" VARCHAR(64),
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,
    "impersonated_by" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMPTZ(6),
    "refresh_token_expires_at" TIMESTAMPTZ(6),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_role_idx" ON "user"("role");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_user_id_idx" ON "session"("user_id");

-- CreateIndex
CREATE INDEX "account_user_id_idx" ON "account"("user_id");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_accesos" ADD CONSTRAINT "auditoria_accesos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_membresia" ADD CONSTRAINT "pagos_membresia_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negocios" ADD CONSTRAINT "negocios_propietario_id_fkey" FOREIGN KEY ("propietario_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opiniones" ADD CONSTRAINT "opiniones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_verificacion" ADD CONSTRAINT "solicitudes_verificacion_solicitante_id_fkey" FOREIGN KEY ("solicitante_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_verificacion" ADD CONSTRAINT "solicitudes_verificacion_revisado_por_fkey" FOREIGN KEY ("revisado_por") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes_moderacion" ADD CONSTRAINT "reportes_moderacion_reportante_id_fkey" FOREIGN KEY ("reportante_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes_moderacion" ADD CONSTRAINT "reportes_moderacion_revisado_por_fkey" FOREIGN KEY ("revisado_por") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_plataforma" ADD CONSTRAINT "feedback_plataforma_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
