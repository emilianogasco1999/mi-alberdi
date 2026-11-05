-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "rol_usuario" AS ENUM ('vecino', 'comerciante', 'moderador', 'admin');

-- CreateEnum
CREATE TYPE "estado_cuenta" AS ENUM ('activo', 'suspendido', 'pendiente_eliminacion');

-- CreateEnum
CREATE TYPE "codigo_plan" AS ENUM ('gratis', 'plata', 'oro');

-- CreateEnum
CREATE TYPE "tipo_perfil_comercial" AS ENUM ('comercio', 'oficio', 'profesional', 'emprendimiento');

-- CreateEnum
CREATE TYPE "estado_negocio" AS ENUM ('borrador', 'activo', 'pausado', 'suspendido');

-- CreateEnum
CREATE TYPE "estado_verificacion" AS ENUM ('no_solicitada', 'pendiente', 'aprobada', 'rechazada');

-- CreateEnum
CREATE TYPE "tipo_publicacion" AS ENUM ('servicio', 'producto');

-- CreateEnum
CREATE TYPE "estado_publicacion" AS ENUM ('borrador', 'activa', 'pausada', 'pausada_por_plan', 'oculta_por_reportes', 'suspendida');

-- CreateEnum
CREATE TYPE "modalidad_atencion" AS ENUM ('horarios_fijos', 'por_turnos', 'por_pedido', 'atencion_24hs', 'solo_whatsapp');

-- CreateEnum
CREATE TYPE "alcance_envio" AS ENUM ('sin_envio', 'solo_alberdi', 'alberdi_y_alrededores', 'todo_el_pais');

-- CreateEnum
CREATE TYPE "estado_membresia" AS ENUM ('activa', 'en_prueba', 'vencida', 'cancelada');

-- CreateEnum
CREATE TYPE "estado_pago" AS ENUM ('pendiente', 'aprobado', 'rechazado', 'reembolsado');

-- CreateEnum
CREATE TYPE "tipo_evento_analitica" AS ENUM ('vista_negocio', 'vista_publicacion', 'clic_whatsapp', 'clic_telefono', 'clic_red_social', 'escaneo_qr', 'vista_reel');

-- CreateEnum
CREATE TYPE "estado_moderacion" AS ENUM ('pendiente', 'en_revision', 'resuelto_aceptado', 'resuelto_desestimado');

-- CreateTable
CREATE TABLE "perfiles_usuarios" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "apellido" VARCHAR(80),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "telefono" VARCHAR(30),
    "avatar_url" TEXT,
    "rol" "rol_usuario" NOT NULL DEFAULT 'vecino',
    "estado" "estado_cuenta" NOT NULL DEFAULT 'activo',
    "puede_probar_premium" BOOLEAN NOT NULL DEFAULT true,
    "token_version" INTEGER NOT NULL DEFAULT 0,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "perfiles_usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_accesos" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "ip_address" VARCHAR(64),
    "user_agent" TEXT,
    "dispositivo_hash" VARCHAR(128),
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_accesos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planes_catalogo" (
    "codigo" "codigo_plan" NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "precio_mensual_ars" DECIMAL(10,2) NOT NULL,
    "max_publicaciones" INTEGER NOT NULL,
    "max_fotos_por_publicacion" INTEGER NOT NULL DEFAULT 5,
    "cupos_destacados" INTEGER NOT NULL DEFAULT 0,
    "max_sucursales" INTEGER NOT NULL DEFAULT 1,
    "max_reels_activos" INTEGER NOT NULL DEFAULT 0,
    "prioridad_base" INTEGER NOT NULL DEFAULT 0,
    "permite_estadisticas" BOOLEAN NOT NULL DEFAULT false,
    "permite_pin_destacado" BOOLEAN NOT NULL DEFAULT false,
    "permite_banner" BOOLEAN NOT NULL DEFAULT false,
    "permite_asistente_ia" BOOLEAN NOT NULL DEFAULT false,
    "caracteristicas_base" JSONB NOT NULL DEFAULT '{}',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "planes_catalogo_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "membresias" (
    "id" UUID NOT NULL,
    "negocio_id" UUID NOT NULL,
    "plan_codigo" "codigo_plan" NOT NULL,
    "estado" "estado_membresia" NOT NULL DEFAULT 'activa',
    "fecha_inicio" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMPTZ(6) NOT NULL,
    "es_prueba" BOOLEAN NOT NULL DEFAULT false,
    "codigo_promocional_id" UUID,
    "auto_renovar" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "membresias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_membresia" (
    "id" UUID NOT NULL,
    "membresia_id" UUID NOT NULL,
    "negocio_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "monto_ars" DECIMAL(10,2) NOT NULL,
    "pasarela" VARCHAR(30) NOT NULL DEFAULT 'mercadopago',
    "referencia_externa" VARCHAR(120),
    "estado" "estado_pago" NOT NULL DEFAULT 'pendiente',
    "comprobante_url" TEXT,
    "metadata_pasarela" JSONB,
    "pagado_en" TIMESTAMPTZ(6),
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pagos_membresia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codigos_promocionales" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(40) NOT NULL,
    "descripcion" TEXT,
    "plan_otorgado" "codigo_plan" NOT NULL,
    "dias_vigencia" INTEGER NOT NULL DEFAULT 30,
    "usos_maximos" INTEGER NOT NULL DEFAULT 1,
    "usos_actuales" INTEGER NOT NULL DEFAULT 0,
    "valido_hasta" TIMESTAMPTZ(6),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "codigos_promocionales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubros_grupos" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "icono" VARCHAR(60) NOT NULL,
    "color_hex" VARCHAR(7) NOT NULL DEFAULT '#2563EB',
    "destacado_portada" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "rubros_grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" UUID NOT NULL,
    "grupo_id" UUID NOT NULL,
    "parent_id" UUID,
    "slug" VARCHAR(100) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "tipo_permitido" "tipo_publicacion",
    "icono" VARCHAR(60),
    "color_hex" VARCHAR(7),
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metodos_pago_catalogo" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(40) NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,
    "icono" VARCHAR(60),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "metodos_pago_catalogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "negocios" (
    "id" UUID NOT NULL,
    "propietario_id" UUID NOT NULL,
    "tipo_perfil" "tipo_perfil_comercial" NOT NULL DEFAULT 'comercio',
    "rubro_principal_id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "nombre_comercial" VARCHAR(120) NOT NULL,
    "eslogan" VARCHAR(160),
    "matricula_profesional" VARCHAR(60),
    "descripcion" TEXT,
    "logo_url" TEXT,
    "banner_url" TEXT,
    "qr_code_token" VARCHAR(40) NOT NULL,
    "estado" "estado_negocio" NOT NULL DEFAULT 'activo',
    "verificacion" "estado_verificacion" NOT NULL DEFAULT 'no_solicitada',
    "verificado_en" TIMESTAMPTZ(6),
    "badge_texto" VARCHAR(40),
    "plan_actual" "codigo_plan" NOT NULL DEFAULT 'gratis',
    "plan_vence_en" TIMESTAMPTZ(6),
    "prioridad_plan" INTEGER NOT NULL DEFAULT 0,
    "cupos_destacados_max" INTEGER NOT NULL DEFAULT 0,
    "max_sucursales" INTEGER NOT NULL DEFAULT 1,
    "entitlements" JSONB NOT NULL DEFAULT '{}',
    "whatsapp_principal" VARCHAR(30) NOT NULL,
    "whatsapp_mensaje_default" VARCHAR(250) DEFAULT 'Hola, te vi en Mi Alberdi y quer├¡a hacerte una consulta.',
    "telefono_linea" VARCHAR(30),
    "email_contacto" VARCHAR(255),
    "instagram_handle" VARCHAR(80),
    "facebook_url" TEXT,
    "tiktok_handle" VARCHAR(80),
    "sitio_web_url" TEXT,
    "modalidad_principal" "modalidad_atencion" NOT NULL DEFAULT 'horarios_fijos',
    "atiende_a_domicilio" BOOLEAN NOT NULL DEFAULT false,
    "hace_envios" BOOLEAN NOT NULL DEFAULT false,
    "alcance_envios" "alcance_envio" NOT NULL DEFAULT 'sin_envio',
    "acepta_cuotas" BOOLEAN NOT NULL DEFAULT false,
    "politica_cambios" TEXT,
    "rating_promedio" DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    "total_opiniones" INTEGER NOT NULL DEFAULT 0,
    "porcentaje_completitud" INTEGER NOT NULL DEFAULT 50,
    "ultima_actividad_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "search_vector" tsvector,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "negocios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ubicaciones_negocio" (
    "id" UUID NOT NULL,
    "negocio_id" UUID NOT NULL,
    "nombre_sucursal" VARCHAR(80) NOT NULL DEFAULT 'Casa Central',
    "es_principal" BOOLEAN NOT NULL DEFAULT true,
    "direccion_escrita" VARCHAR(200) NOT NULL,
    "barrio" VARCHAR(80),
    "referencia_visual" VARCHAR(200),
    "foto_fachada_url" TEXT,
    "whatsapp_sucursal" VARCHAR(30),
    "telefono_sucursal" VARCHAR(30),
    "latitud" DECIMAL(9,6),
    "longitud" DECIMAL(9,6),
    "pin_color_hex" VARCHAR(7) DEFAULT '#EF4444',
    "pin_destacado" BOOLEAN NOT NULL DEFAULT false,
    "mostrar_direccion_exacta" BOOLEAN NOT NULL DEFAULT true,
    "activa_por_plan" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ubicaciones_negocio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios_negocio" (
    "id" UUID NOT NULL,
    "negocio_id" UUID NOT NULL,
    "ubicacion_id" UUID,
    "dia_semana" SMALLINT NOT NULL,
    "cerrado" BOOLEAN NOT NULL DEFAULT false,
    "horario_corrido" BOOLEAN NOT NULL DEFAULT false,
    "apertura_manana" TIME(6),
    "cierre_manana" TIME(6),
    "apertura_tarde" TIME(6),
    "cierre_tarde" TIME(6),
    "nota_especial" VARCHAR(120),

    CONSTRAINT "horarios_negocio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "negocios_metodos_pago" (
    "negocio_id" UUID NOT NULL,
    "metodo_pago_id" UUID NOT NULL,
    "detalle" VARCHAR(100),

    CONSTRAINT "negocios_metodos_pago_pkey" PRIMARY KEY ("negocio_id","metodo_pago_id")
);

-- CreateTable
CREATE TABLE "publicaciones" (
    "id" UUID NOT NULL,
    "negocio_id" UUID NOT NULL,
    "categoria_id" UUID NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "tipo" "tipo_publicacion" NOT NULL,
    "titulo" VARCHAR(140) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio_referencia_ars" DECIMAL(12,2),
    "etiqueta_precio" VARCHAR(40),
    "modalidad" "modalidad_atencion" NOT NULL DEFAULT 'horarios_fijos',
    "whatsapp_especifico" VARCHAR(30),
    "mensaje_whatsapp_custom" VARCHAR(250),
    "es_destacada" BOOLEAN NOT NULL DEFAULT false,
    "destacada_desde" TIMESTAMPTZ(6),
    "orden_en_negocio" INTEGER NOT NULL DEFAULT 0,
    "estado" "estado_publicacion" NOT NULL DEFAULT 'activa',
    "reportes_acumulados" INTEGER NOT NULL DEFAULT 0,
    "search_vector" tsvector,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "publicaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagenes_publicacion" (
    "id" UUID NOT NULL,
    "publicacion_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "alt_text" VARCHAR(160),
    "es_portada" BOOLEAN NOT NULL DEFAULT false,
    "orden" SMALLINT NOT NULL DEFAULT 0,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagenes_publicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reels_historias" (
    "id" UUID NOT NULL,
    "negocio_id" UUID NOT NULL,
    "publicacion_id" UUID,
    "media_url" TEXT NOT NULL,
    "miniatura_url" TEXT,
    "caption" VARCHAR(280),
    "boton_accion_texto" VARCHAR(40) DEFAULT 'Consultar por WhatsApp',
    "duracion_seg" SMALLINT NOT NULL DEFAULT 30,
    "expira_en" TIMESTAMPTZ(6) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "vistas_contador" INTEGER NOT NULL DEFAULT 0,
    "clics_whatsapp_contador" INTEGER NOT NULL DEFAULT 0,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reels_historias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opiniones" (
    "id" UUID NOT NULL,
    "negocio_id" UUID NOT NULL,
    "publicacion_id" UUID,
    "usuario_id" UUID,
    "dispositivo_id" VARCHAR(128),
    "nombre_autor_visible" VARCHAR(80) NOT NULL,
    "puntuacion" SMALLINT NOT NULL,
    "comentario" TEXT,
    "foto_evidencia_url" TEXT,
    "respuesta_comerciante" TEXT,
    "respondido_en" TIMESTAMPTZ(6),
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "opiniones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_analitica" (
    "id" UUID NOT NULL,
    "negocio_id" UUID NOT NULL,
    "publicacion_id" UUID,
    "ubicacion_id" UUID,
    "reel_id" UUID,
    "tipo_evento" "tipo_evento_analitica" NOT NULL,
    "origen" VARCHAR(40),
    "dispositivo_hash" VARCHAR(128),
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_analitica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_verificacion" (
    "id" UUID NOT NULL,
    "negocio_id" UUID NOT NULL,
    "solicitante_id" UUID NOT NULL,
    "documento_frente_url" TEXT,
    "comprobante_comercio_url" TEXT,
    "notas_solicitante" TEXT,
    "estado" "estado_verificacion" NOT NULL DEFAULT 'pendiente',
    "revisado_por" UUID,
    "motivo_rechazo" TEXT,
    "resuelto_en" TIMESTAMPTZ(6),
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "solicitudes_verificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reportes_moderacion" (
    "id" UUID NOT NULL,
    "negocio_id" UUID,
    "publicacion_id" UUID,
    "opinion_id" UUID,
    "reportante_id" UUID,
    "dispositivo_hash" VARCHAR(128),
    "motivo" VARCHAR(80) NOT NULL,
    "detalle" TEXT,
    "estado" "estado_moderacion" NOT NULL DEFAULT 'pendiente',
    "revisado_por" UUID,
    "resolucion_nota" TEXT,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "reportes_moderacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_plataforma" (
    "id" UUID NOT NULL,
    "usuario_id" UUID,
    "nombre_completo" VARCHAR(120),
    "email" VARCHAR(255),
    "mensaje" TEXT NOT NULL,
    "ip_address" VARCHAR(64),
    "user_agent" TEXT,
    "notas_admin" TEXT,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_plataforma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_sistema" (
    "id" SMALLINT NOT NULL DEFAULT 1,
    "modo_mantenimiento" BOOLEAN NOT NULL DEFAULT false,
    "mensaje_mantenimiento" TEXT,
    "usuarios_excluidos_mantenimiento" UUID[] DEFAULT ARRAY[]::UUID[],
    "semilla_rotacion_ranking" INTEGER NOT NULL DEFAULT 1,
    "version_minima_pwa" VARCHAR(20),
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "configuracion_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "perfiles_usuarios_email_key" ON "perfiles_usuarios"("email");

-- CreateIndex
CREATE INDEX "perfiles_usuarios_rol_idx" ON "perfiles_usuarios"("rol");

-- CreateIndex
CREATE INDEX "perfiles_usuarios_estado_idx" ON "perfiles_usuarios"("estado");

-- CreateIndex
CREATE INDEX "auditoria_accesos_usuario_id_creado_en_idx" ON "auditoria_accesos"("usuario_id", "creado_en");

-- CreateIndex
CREATE INDEX "membresias_negocio_id_estado_idx" ON "membresias"("negocio_id", "estado");

-- CreateIndex
CREATE INDEX "membresias_fecha_fin_idx" ON "membresias"("fecha_fin");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_membresia_referencia_externa_key" ON "pagos_membresia"("referencia_externa");

-- CreateIndex
CREATE INDEX "pagos_membresia_negocio_id_estado_idx" ON "pagos_membresia"("negocio_id", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "codigos_promocionales_codigo_key" ON "codigos_promocionales"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "rubros_grupos_slug_key" ON "rubros_grupos"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_slug_key" ON "categorias"("slug");

-- CreateIndex
CREATE INDEX "categorias_grupo_id_activa_idx" ON "categorias"("grupo_id", "activa");

-- CreateIndex
CREATE INDEX "categorias_parent_id_idx" ON "categorias"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "metodos_pago_catalogo_codigo_key" ON "metodos_pago_catalogo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "negocios_slug_key" ON "negocios"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "negocios_qr_code_token_key" ON "negocios"("qr_code_token");

-- CreateIndex
CREATE INDEX "negocios_propietario_id_idx" ON "negocios"("propietario_id");

-- CreateIndex
CREATE INDEX "negocios_tipo_perfil_estado_idx" ON "negocios"("tipo_perfil", "estado");

-- CreateIndex
CREATE INDEX "idx_negocios_ranking" ON "negocios"("estado", "prioridad_plan", "rating_promedio");

-- CreateIndex
CREATE INDEX "negocios_rubro_principal_id_estado_idx" ON "negocios"("rubro_principal_id", "estado");

-- CreateIndex
CREATE INDEX "ubicaciones_negocio_negocio_id_es_principal_idx" ON "ubicaciones_negocio"("negocio_id", "es_principal");

-- CreateIndex
CREATE INDEX "ubicaciones_negocio_negocio_id_activa_por_plan_idx" ON "ubicaciones_negocio"("negocio_id", "activa_por_plan");

-- CreateIndex
CREATE INDEX "ubicaciones_negocio_latitud_longitud_idx" ON "ubicaciones_negocio"("latitud", "longitud");

-- CreateIndex
CREATE INDEX "horarios_negocio_negocio_id_ubicacion_id_dia_semana_idx" ON "horarios_negocio"("negocio_id", "ubicacion_id", "dia_semana");

-- CreateIndex
CREATE UNIQUE INDEX "publicaciones_slug_key" ON "publicaciones"("slug");

-- CreateIndex
CREATE INDEX "publicaciones_negocio_id_estado_idx" ON "publicaciones"("negocio_id", "estado");

-- CreateIndex
CREATE INDEX "idx_publicaciones_busqueda" ON "publicaciones"("categoria_id", "estado", "es_destacada");

-- CreateIndex
CREATE INDEX "imagenes_publicacion_publicacion_id_orden_idx" ON "imagenes_publicacion"("publicacion_id", "orden");

-- CreateIndex
CREATE INDEX "idx_reels_vigentes" ON "reels_historias"("activo", "expira_en");

-- CreateIndex
CREATE INDEX "reels_historias_negocio_id_idx" ON "reels_historias"("negocio_id");

-- CreateIndex
CREATE INDEX "opiniones_negocio_id_visible_creado_en_idx" ON "opiniones"("negocio_id", "visible", "creado_en");

-- CreateIndex
CREATE INDEX "opiniones_negocio_id_dispositivo_id_idx" ON "opiniones"("negocio_id", "dispositivo_id");

-- CreateIndex
CREATE INDEX "idx_metricas_comerciante" ON "eventos_analitica"("negocio_id", "tipo_evento", "creado_en");

-- CreateIndex
CREATE INDEX "eventos_analitica_publicacion_id_tipo_evento_idx" ON "eventos_analitica"("publicacion_id", "tipo_evento");

-- CreateIndex
CREATE INDEX "solicitudes_verificacion_estado_creado_en_idx" ON "solicitudes_verificacion"("estado", "creado_en");

-- CreateIndex
CREATE INDEX "solicitudes_verificacion_negocio_id_idx" ON "solicitudes_verificacion"("negocio_id");

-- CreateIndex
CREATE INDEX "reportes_moderacion_estado_creado_en_idx" ON "reportes_moderacion"("estado", "creado_en");

-- AddForeignKey
ALTER TABLE "auditoria_accesos" ADD CONSTRAINT "auditoria_accesos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "perfiles_usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_negocio_id_fkey" FOREIGN KEY ("negocio_id") REFERENCES "negocios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_plan_codigo_fkey" FOREIGN KEY ("plan_codigo") REFERENCES "planes_catalogo"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_codigo_promocional_id_fkey" FOREIGN KEY ("codigo_promocional_id") REFERENCES "codigos_promocionales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_membresia" ADD CONSTRAINT "pagos_membresia_membresia_id_fkey" FOREIGN KEY ("membresia_id") REFERENCES "membresias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_membresia" ADD CONSTRAINT "pagos_membresia_negocio_id_fkey" FOREIGN KEY ("negocio_id") REFERENCES "negocios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_membresia" ADD CONSTRAINT "pagos_membresia_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "perfiles_usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codigos_promocionales" ADD CONSTRAINT "codigos_promocionales_plan_otorgado_fkey" FOREIGN KEY ("plan_otorgado") REFERENCES "planes_catalogo"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "rubros_grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negocios" ADD CONSTRAINT "negocios_propietario_id_fkey" FOREIGN KEY ("propietario_id") REFERENCES "perfiles_usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negocios" ADD CONSTRAINT "negocios_rubro_principal_id_fkey" FOREIGN KEY ("rubro_principal_id") REFERENCES "rubros_grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negocios" ADD CONSTRAINT "negocios_plan_actual_fkey" FOREIGN KEY ("plan_actual") REFERENCES "planes_catalogo"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ubicaciones_negocio" ADD CONSTRAINT "ubicaciones_negocio_negocio_id_fkey" FOREIGN KEY ("negocio_id") REFERENCES "negocios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_negocio" ADD CONSTRAINT "horarios_negocio_negocio_id_fkey" FOREIGN KEY ("negocio_id") REFERENCES "negocios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_negocio" ADD CONSTRAINT "horarios_negocio_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones_negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negocios_metodos_pago" ADD CONSTRAINT "negocios_metodos_pago_negocio_id_fkey" FOREIGN KEY ("negocio_id") REFERENCES "negocios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negocios_metodos_pago" ADD CONSTRAINT "negocios_metodos_pago_metodo_pago_id_fkey" FOREIGN KEY ("metodo_pago_id") REFERENCES "metodos_pago_catalogo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_negocio_id_fkey" FOREIGN KEY ("negocio_id") REFERENCES "negocios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagenes_publicacion" ADD CONSTRAINT "imagenes_publicacion_publicacion_id_fkey" FOREIGN KEY ("publicacion_id") REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reels_historias" ADD CONSTRAINT "reels_historias_negocio_id_fkey" FOREIGN KEY ("negocio_id") REFERENCES "negocios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reels_historias" ADD CONSTRAINT "reels_historias_publicacion_id_fkey" FOREIGN KEY ("publicacion_id") REFERENCES "publicaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opiniones" ADD CONSTRAINT "opiniones_negocio_id_fkey" FOREIGN KEY ("negocio_id") REFERENCES "negocios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opiniones" ADD CONSTRAINT "opiniones_publicacion_id_fkey" FOREIGN KEY ("publicacion_id") REFERENCES "publicaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opiniones" ADD CONSTRAINT "opiniones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "perfiles_usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_analitica" ADD CONSTRAINT "eventos_analitica_negocio_id_fkey" FOREIGN KEY ("negocio_id") REFERENCES "negocios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_analitica" ADD CONSTRAINT "eventos_analitica_publicacion_id_fkey" FOREIGN KEY ("publicacion_id") REFERENCES "publicaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_analitica" ADD CONSTRAINT "eventos_analitica_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones_negocio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_analitica" ADD CONSTRAINT "eventos_analitica_reel_id_fkey" FOREIGN KEY ("reel_id") REFERENCES "reels_historias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_verificacion" ADD CONSTRAINT "solicitudes_verificacion_negocio_id_fkey" FOREIGN KEY ("negocio_id") REFERENCES "negocios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_verificacion" ADD CONSTRAINT "solicitudes_verificacion_solicitante_id_fkey" FOREIGN KEY ("solicitante_id") REFERENCES "perfiles_usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_verificacion" ADD CONSTRAINT "solicitudes_verificacion_revisado_por_fkey" FOREIGN KEY ("revisado_por") REFERENCES "perfiles_usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes_moderacion" ADD CONSTRAINT "reportes_moderacion_negocio_id_fkey" FOREIGN KEY ("negocio_id") REFERENCES "negocios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes_moderacion" ADD CONSTRAINT "reportes_moderacion_publicacion_id_fkey" FOREIGN KEY ("publicacion_id") REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes_moderacion" ADD CONSTRAINT "reportes_moderacion_opinion_id_fkey" FOREIGN KEY ("opinion_id") REFERENCES "opiniones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes_moderacion" ADD CONSTRAINT "reportes_moderacion_reportante_id_fkey" FOREIGN KEY ("reportante_id") REFERENCES "perfiles_usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes_moderacion" ADD CONSTRAINT "reportes_moderacion_revisado_por_fkey" FOREIGN KEY ("revisado_por") REFERENCES "perfiles_usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_plataforma" ADD CONSTRAINT "feedback_plataforma_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "perfiles_usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

