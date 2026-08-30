#!/bin/bash
set -euo pipefail

umask 077

# Configuration
# Default values match application.yml defaults
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-skillpilot}"
DB_USER="${POSTGRES_USER:-skillpilot}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD must be provided by a protected environment file}"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="backups"
BACKUP_RETENTION_DAYS="${SKILLPILOT_BACKUP_RETENTION_DAYS:-30}"
FILENAME="${BACKUP_DIR}/${DB_NAME}_${DATE}.sql"
PARTIAL_FILENAME="${BACKUP_DIR}/.${DB_NAME}_${DATE}.$$.partial"

if [[ ! "$DB_NAME" =~ ^[A-Za-z0-9_.-]+$ ]]; then
  echo "POSTGRES_DB contains characters that are unsafe for a backup filename." >&2
  exit 1
fi
if [[ ! "$BACKUP_RETENTION_DAYS" =~ ^[1-9][0-9]{0,2}$ ]] || (( BACKUP_RETENTION_DAYS > 365 )); then
  echo "SKILLPILOT_BACKUP_RETENTION_DAYS must be an integer between 1 and 365." >&2
  exit 1
fi
if [ -L "$BACKUP_DIR" ] || { [ -e "$BACKUP_DIR" ] && [ ! -d "$BACKUP_DIR" ]; }; then
  echo "Refusing unsafe backup directory: $BACKUP_DIR" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
trap 'rm -f -- "$PARTIAL_FILENAME"' EXIT

echo "Creating backup of ${DB_NAME} from ${DB_HOST}..."
# Feedback prose is an ephemeral custody-transfer inbox. Publication metadata
# remains recoverable, but content-bearing submission/export rows must not be
# copied into application-level SQL backups.
PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -F p \
  --exclude-table-data=goal_feedback_submission \
  --exclude-table-data=goal_feedback_export_batch \
  --exclude-table-data=goal_feedback_inbox_capacity \
  -f "$PARTIAL_FILENAME"

# A restore must never retain a capacity receipt for content that was
# intentionally excluded above. Recreate the required singleton as an empty,
# internally consistent inbox after the schema has been restored.
printf '%s\n' \
  '' \
  '-- SkillPilot feedback inbox content is deliberately absent from this backup.' \
  'INSERT INTO goal_feedback_inbox_capacity' \
  '    (id, pending_rows, pending_bytes, updated_at)' \
  'VALUES (1, 0, 0, CURRENT_TIMESTAMP)' \
  'ON CONFLICT (id) DO UPDATE' \
  'SET pending_rows = 0,' \
  '    pending_bytes = 0,' \
  '    updated_at = CURRENT_TIMESTAMP;' \
  >> "$PARTIAL_FILENAME"

mv -- "$PARTIAL_FILENAME" "$FILENAME"
trap - EXIT

find "$BACKUP_DIR" \
  -maxdepth 1 \
  -type f \
  -name "${DB_NAME}_*.sql" \
  -mtime "+${BACKUP_RETENTION_DAYS}" \
  -print \
  -delete

echo "Backup created successfully at: $FILENAME"
