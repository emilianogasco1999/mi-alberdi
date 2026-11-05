FROM alpine:3.20

# Herramientas necesarias: bash, curl, gzip, tar, cliente PostgreSQL 16 y Rclone
RUN apk add --no-cache \
    bash \
    curl \
    gzip \
    tar \
    findutils \
    postgresql16-client \
    rclone

# Crear directorios necesarios para evitar errores de montaje en Docker
RUN mkdir -p /root/.config/rclone /backups

WORKDIR /scripts

COPY backup.sh /scripts/backup.sh
COPY entrypoint.sh /scripts/entrypoint.sh
RUN chmod +x /scripts/backup.sh /scripts/entrypoint.sh

ENTRYPOINT ["/scripts/entrypoint.sh"]

