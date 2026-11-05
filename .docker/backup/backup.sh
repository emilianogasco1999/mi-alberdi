#!/bin/bash
set -e

# ==========================================
# SCRIPT DE BACKUP AUTOMATIZADO
# MI ALBERDI
# ==========================================

FECHA=$(date +"%Y-%m-%d_%H-%M-%S")
DESTINO="/backups/${FECHA}"
mkdir -p "${DESTINO}"

echo "=========================================="
echo "🕒 [${FECHA}] Iniciando proceso de Backup..."
echo "=========================================="

# ------------------------------------------
# 1. BACKUP DE POSTGRESQL (pg_dump)
# ------------------------------------------
echo "📦 1. Exportando base de datos PostgreSQL: ${POSTGRES_DB}..."
export PGPASSWORD="${POSTGRES_PASSWORD}"

pg_dump -h "${POSTGRES_HOST:-postgres}" \
        -p "${POSTGRES_PORT:-5432}" \
        -U "${POSTGRES_USER}" \
        -d "${POSTGRES_DB}" \
        --no-owner \
        --no-privileges | gzip > "${DESTINO}/db_${POSTGRES_DB}_${FECHA}.sql.gz"

echo "✅ Base de datos respaldada: ${DESTINO}/db_${POSTGRES_DB}_${FECHA}.sql.gz"

# ------------------------------------------
# 2. BACKUP DE MINIO (S3 Files)
# ------------------------------------------
echo "📦 2. Exportando archivos de MinIO..."

if [ -d "/minio_data" ] && [ "$(ls -A /minio_data 2>/dev/null)" ]; then
  tar -czf "${DESTINO}/archivos_minio_${FECHA}.tar.gz" -C "/minio_data" .
  echo "✅ Archivos de MinIO respaldados: ${DESTINO}/archivos_minio_${FECHA}.tar.gz"
else
  echo "ℹ️ El volumen de MinIO está vacío o no montado. Omitiendo archivos S3..."
fi

# ------------------------------------------
# 3. ENVÍO A GOOGLE DRIVE (RCLONE)
# ------------------------------------------
echo "☁️  3. Sincronizando con Google Drive..."

RCLONE_CONFIG="/root/.config/rclone/rclone.conf"

if [ -f "${RCLONE_CONFIG}" ]; then
  if rclone listremotes | grep -q "^gdrive1:"; then
    echo "  -> Subiendo a Google Drive (Cuenta 1)..."
    rclone copy "${DESTINO}" "gdrive1:Backups_MiAlberdi/${FECHA}" --fast-list --retries 3
    echo "  ✅ Cuenta 1 sincronizada exitosamente."
  else
    echo "  ⚠️ Remoto 'gdrive1' no encontrado en rclone.conf"
  fi

  if rclone listremotes | grep -q "^gdrive2:"; then
    echo "  -> Subiendo a Google Drive (Cuenta 2)..."
    rclone copy "${DESTINO}" "gdrive2:Backups_MiAlberdi/${FECHA}" --fast-list --retries 3
    echo "  ✅ Cuenta 2 sincronizada exitosamente."
  else
    echo "  ⚠️ Remoto 'gdrive2' no encontrado en rclone.conf"
  fi
else
  echo "  ⚠️ No se encontró rclone.conf montado en ${RCLONE_CONFIG}."
  echo "  ℹ️ El backup local se guardó correctamente en el volumen local."
fi

# ------------------------------------------
# 4. POLÍTICA DE RETENCIÓN (CONSERVAR SOLO LOS ÚLTIMOS 5)
# ------------------------------------------
echo "🧹 4. Aplicando retención: conservando únicamente los últimos 5 backups..."

cd /backups
TOTAL_LOCALES=$(ls -1d 20* 2>/dev/null | wc -l)
if [ "${TOTAL_LOCALES}" -gt 5 ]; then
  CANT_A_BORRAR=$((TOTAL_LOCALES - 5))
  echo "  -> Se detectaron ${TOTAL_LOCALES} backups locales. Eliminando los ${CANT_A_BORRAR} más antiguos..."
  ls -1d 20* 2>/dev/null | sort | head -n "${CANT_A_BORRAR}" | while read -r CARPETA; do
    echo "     Eliminando backup local: ${CARPETA}"
    rm -rf "${CARPETA}"
  done
else
  echo "  -> Backups locales actuales: ${TOTAL_LOCALES}/5. No se requiere borrado local."
fi

if [ -f "${RCLONE_CONFIG}" ]; then
  echo "  -> Verificando retención en Google Drive..."
  rclone delete "gdrive1:Backups_MiAlberdi" --min-age 5d --rmdirs > /dev/null 2>&1 || true
  rclone delete "gdrive2:Backups_MiAlberdi" --min-age 5d --rmdirs > /dev/null 2>&1 || true
fi

echo "=========================================="
echo "🎉 ¡Backup completado con éxito a las $(date +"%H:%M:%S")!"
echo "=========================================="

