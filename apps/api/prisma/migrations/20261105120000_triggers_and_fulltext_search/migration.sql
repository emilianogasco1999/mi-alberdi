-- =============================================================================
-- MI ALBERDI — Triggers de Dominio, Integridad y Full-Text Search
-- =============================================================================

-- 1. Extensiones necesarias para búsqueda fonética/acentos y similitud trigram
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Asegurar columnas de search_vector (si no fueron creadas en el DDL base)
ALTER TABLE "negocios" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;
ALTER TABLE "publicaciones" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;

-- 3. Índices GIN para Búsqueda Full-Text y Búsqueda Difusa (Trigram)
CREATE INDEX IF NOT EXISTS "idx_negocios_search_vector" ON "negocios" USING gin("search_vector");
CREATE INDEX IF NOT EXISTS "idx_negocios_nombre_trgm" ON "negocios" USING gin("nombre_comercial" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_negocios_eslogan_trgm" ON "negocios" USING gin("eslogan" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "idx_publicaciones_search_vector" ON "publicaciones" USING gin("search_vector");
CREATE INDEX IF NOT EXISTS "idx_publicaciones_titulo_trgm" ON "publicaciones" USING gin("titulo" gin_trgm_ops);

-- =============================================================================
-- 4. Trigger: Actualización automática de search_vector en Negocios
-- Ponderación: A = Nombre Comercial, B = Eslogan, C = Descripción
-- =============================================================================
CREATE OR REPLACE FUNCTION fn_negocios_search_vector_update()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.nombre_comercial, ''))), 'A') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.eslogan, ''))), 'B') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.descripcion, ''))), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_negocios_search_vector ON "negocios";
CREATE TRIGGER trg_negocios_search_vector
BEFORE INSERT OR UPDATE OF "nombre_comercial", "eslogan", "descripcion"
ON "negocios"
FOR EACH ROW
EXECUTE FUNCTION fn_negocios_search_vector_update();

-- =============================================================================
-- 5. Trigger: Actualización automática de search_vector en Publicaciones
-- Ponderación: A = Título, B = Descripción
-- =============================================================================
CREATE OR REPLACE FUNCTION fn_publicaciones_search_vector_update()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.titulo, ''))), 'A') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.descripcion, ''))), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_publicaciones_search_vector ON "publicaciones";
CREATE TRIGGER trg_publicaciones_search_vector
BEFORE INSERT OR UPDATE OF "titulo", "descripcion"
ON "publicaciones"
FOR EACH ROW
EXECUTE FUNCTION fn_publicaciones_search_vector_update();

-- =============================================================================
-- 6. Trigger: Validación estricta de cupos_destacados_max (Estrellas de Vidriera)
-- Impide que un comercio marque más destacadas que las permitidas por su plan.
-- =============================================================================
CREATE OR REPLACE FUNCTION fn_validar_cupos_destacados()
RETURNS trigger AS $$
DECLARE
  v_cupos_max INT;
  v_destacadas_actuales INT;
BEGIN
  IF NEW.es_destacada = true THEN
    SELECT cupos_destacados_max INTO v_cupos_max
    FROM "negocios"
    WHERE id = NEW.negocio_id;

    IF v_cupos_max IS NULL THEN
      v_cupos_max := 0;
    END IF;

    IF v_cupos_max <= 0 THEN
      RAISE EXCEPTION 'El negocio no cuenta con cupos de destacados en su plan actual (máximo permitido: 0)';
    END IF;

    SELECT COUNT(*) INTO v_destacadas_actuales
    FROM "publicaciones"
    WHERE negocio_id = NEW.negocio_id
      AND es_destacada = true
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

    IF v_destacadas_actuales >= v_cupos_max THEN
      RAISE EXCEPTION 'Límite de cupos de destacados alcanzado para este negocio. Máximo permitido: %, actualmente destacadas: %',
        v_cupos_max, v_destacadas_actuales;
    END IF;

    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (OLD.es_destacada IS DISTINCT FROM true)) THEN
      NEW.destacada_desde := NOW();
    END IF;
  ELSE
    IF TG_OP = 'UPDATE' AND OLD.es_destacada = true THEN
      NEW.destacada_desde := NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_cupos_destacados ON "publicaciones";
CREATE TRIGGER trg_validar_cupos_destacados
BEFORE INSERT OR UPDATE OF "es_destacada", "negocio_id"
ON "publicaciones"
FOR EACH ROW
EXECUTE FUNCTION fn_validar_cupos_destacados();

-- =============================================================================
-- 7. Trigger: Validación de max_sucursales y unicidad de principal
-- Gobierna el límite de ubicaciones_negocio activas según el plan del negocio.
-- =============================================================================
CREATE OR REPLACE FUNCTION fn_validar_max_sucursales()
RETURNS trigger AS $$
DECLARE
  v_max_sucursales INT;
  v_activas_actuales INT;
BEGIN
  -- Si la sucursal se marca como principal, desmarcar cualquier otra del mismo negocio
  IF NEW.es_principal = true THEN
    UPDATE "ubicaciones_negocio"
    SET es_principal = false
    WHERE negocio_id = NEW.negocio_id
      AND es_principal = true
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;

  -- Validar cupo de sucursales activas según el plan activo
  IF NEW.activa_por_plan = true THEN
    SELECT max_sucursales INTO v_max_sucursales
    FROM "negocios"
    WHERE id = NEW.negocio_id;

    IF v_max_sucursales IS NULL THEN
      v_max_sucursales := 1;
    END IF;

    SELECT COUNT(*) INTO v_activas_actuales
    FROM "ubicaciones_negocio"
    WHERE negocio_id = NEW.negocio_id
      AND activa_por_plan = true
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

    IF v_activas_actuales >= v_max_sucursales THEN
      RAISE EXCEPTION 'El negocio ha alcanzado el límite máximo de sucursales activas permitidas por su plan (máximo: %, activas actuales: %)',
        v_max_sucursales, v_activas_actuales;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_max_sucursales ON "ubicaciones_negocio";
CREATE TRIGGER trg_validar_max_sucursales
BEFORE INSERT OR UPDATE OF "activa_por_plan", "es_principal", "negocio_id"
ON "ubicaciones_negocio"
FOR EACH ROW
EXECUTE FUNCTION fn_validar_max_sucursales();

-- =============================================================================
-- 8. Trigger: Sincronización de Entitlements y Degradación Limpia
-- Al vencer una membresía o cambiar de plan, sincroniza atributos materializados
-- y degrada ordenadamente el excedente sin borrar información del comerciante.
-- =============================================================================
CREATE OR REPLACE FUNCTION fn_sincronizar_entitlements_negocio()
RETURNS trigger AS $$
DECLARE
  v_plan RECORD;
  v_pub_max INT;
BEGIN
  IF TG_OP = 'UPDATE' AND (
      OLD.plan_actual IS DISTINCT FROM NEW.plan_actual OR
      OLD.cupos_destacados_max IS DISTINCT FROM NEW.cupos_destacados_max OR
      OLD.max_sucursales IS DISTINCT FROM NEW.max_sucursales
  ) THEN
    -- Si el plan cambió, sincronizar entitlements y límites desde el catálogo
    IF OLD.plan_actual IS DISTINCT FROM NEW.plan_actual THEN
      SELECT * INTO v_plan
      FROM "planes_catalogo"
      WHERE codigo = NEW.plan_actual;

      IF FOUND THEN
        NEW.prioridad_plan := v_plan.prioridad_base;
        NEW.cupos_destacados_max := v_plan.cupos_destacados;
        NEW.max_sucursales := v_plan.max_sucursales;
        NEW.entitlements := v_plan.caracteristicas_base;
      END IF;
    END IF;

    -- 1. Degradación de publicaciones destacadas: desmarcar excedente conservando las más recientes
    IF NEW.cupos_destacados_max < OLD.cupos_destacados_max THEN
      UPDATE "publicaciones"
      SET es_destacada = false,
          destacada_desde = NULL
      WHERE id IN (
        SELECT id
        FROM "publicaciones"
        WHERE negocio_id = NEW.id
          AND es_destacada = true
        ORDER BY destacada_desde DESC NULLS LAST, creado_en DESC
        OFFSET NEW.cupos_destacados_max
      );
    END IF;

    -- 2. Degradación de sucursales: desactivar secundarias que excedan el nuevo límite
    IF NEW.max_sucursales < OLD.max_sucursales THEN
      UPDATE "ubicaciones_negocio"
      SET activa_por_plan = false
      WHERE id IN (
        SELECT id
        FROM "ubicaciones_negocio"
        WHERE negocio_id = NEW.id
          AND es_principal = false
          AND activa_por_plan = true
        ORDER BY creado_en ASC
        OFFSET GREATEST(0, NEW.max_sucursales - 1)
      );
    END IF;

    -- 3. Degradación de publicaciones activas si superan el cupo total del plan
    IF OLD.plan_actual IS DISTINCT FROM NEW.plan_actual THEN
      SELECT max_publicaciones INTO v_pub_max
      FROM "planes_catalogo"
      WHERE codigo = NEW.plan_actual;

      IF v_pub_max IS NOT NULL AND v_pub_max > 0 THEN
        UPDATE "publicaciones"
        SET estado = 'pausada_por_plan'
        WHERE id IN (
          SELECT id
          FROM "publicaciones"
          WHERE negocio_id = NEW.id
            AND estado = 'activa'
          ORDER BY creado_en ASC
          OFFSET v_pub_max
        );
      END IF;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sincronizar_entitlements_negocio ON "negocios";
CREATE TRIGGER trg_sincronizar_entitlements_negocio
BEFORE UPDATE OF "plan_actual", "cupos_destacados_max", "max_sucursales"
ON "negocios"
FOR EACH ROW
EXECUTE FUNCTION fn_sincronizar_entitlements_negocio();

