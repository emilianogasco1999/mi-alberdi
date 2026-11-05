#!/bin/bash
set -e

# Horario por defecto: todos los días a las 03:00 AM
CRON_HORARIO="${BACKUP_CRON:-0 3 * * *}"

echo "=========================================="
echo "⏰ Servicio de Backup Automatizado Iniciado"
echo "📅 Programación Cron: ${CRON_HORARIO}"
echo "=========================================="

# Configurar el reloj cron en Alpine.
# Redirigimos la salida a /proc/1/fd/1 y /proc/1/fd/2 para que los logs
# se vean en tiempo real directamente en Portainer y en 'docker compose logs'
echo "${CRON_HORARIO} /scripts/backup.sh > /proc/1/fd/1 2>/proc/1/fd/2" | crontab -

# Opcional: Ejecutar un backup de prueba al arrancar el contenedor
if [ "${BACKUP_ON_STARTUP}" = "true" ]; then
  echo "🚀 Ejecutando backup inicial de arranque..."
  /scripts/backup.sh || true
fi

echo "💤 Contenedor en espera. Se ejecutará automáticamente según cron (${CRON_HORARIO})."

# Iniciar crond en primer plano para mantener el contenedor vivo (running)
exec crond -f -l 2

