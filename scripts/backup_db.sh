#!/bin/bash
set -e

# Configuration
# Default values match application.yml defaults
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-skillpilot}"
DB_USER="${POSTGRES_USER:-skillpilot}"
# Note: For password, it's better to use .pgpass file or PGPASSWORD env var, but for simplicity here we assume trust or pre-set env var
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="backups"
FILENAME="${BACKUP_DIR}/${DB_NAME}_${DATE}.sql"

mkdir -p "$BACKUP_DIR"

echo "Creating backup of ${DB_NAME} from ${DB_HOST}..."
PGPASSWORD="${POSTGRES_PASSWORD:-skillpilot}" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -F p -f "$FILENAME"

echo "Backup created successfully at: $FILENAME"
