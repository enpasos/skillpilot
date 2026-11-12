#!/usr/bin/env bash

# Database backup for the deployment engine. A deployment restarts the backend,
# which applies pending Liquibase changes and runs new code against the only
# copy of the learner state. No restart may therefore happen without a fresh,
# complete dump. This file is sourced by deploy.sh and deliberately does not
# change shell options or execute anything on its own. Diagnostics name
# variables and files only and never echo credential values.

# Exports the PostgreSQL connection settings from a protected KEY=value file.
# The file is parsed, never executed; every other assignment in it is ignored,
# so the systemd EnvironmentFile of the service can be used where it is readable.
_skillpilot_load_database_backup_environment() {
  local environment_file="$1"
  local line
  local name
  local value
  while IFS= read -r line || [ -n "${line}" ]; do
    line="${line%$'\r'}"
    if ! [[ "${line}" =~ ^[[:space:]]*(export[[:space:]]+)?(POSTGRES_HOST|POSTGRES_PORT|POSTGRES_DB|POSTGRES_USER|POSTGRES_PASSWORD|SKILLPILOT_BACKUP_RETENTION_DAYS)=(.*)$ ]]; then
      continue
    fi
    name="${BASH_REMATCH[2]}"
    value="${BASH_REMATCH[3]}"
    if [[ "${value}" =~ ^\"(.*)\"$ ]] || [[ "${value}" =~ ^\'(.*)\'$ ]]; then
      value="${BASH_REMATCH[1]}"
    fi
    export "${name}=${value}"
  done < "${environment_file}"
}

# The credential file may belong to the deploying user (then without any group
# access) or to root; nobody else may have access in either case.
_skillpilot_database_backup_environment_protected() {
  local environment_file="$1"
  local owner
  local mode
  owner="$(stat -c '%u' -- "${environment_file}")" || return 1
  mode="$(stat -c '%a' -- "${environment_file}")" || return 1
  if [ "${owner}" != "$(id -u)" ] && [ "${owner}" != "0" ]; then
    return 1
  fi
  if (( (8#${mode} & 8#007) != 0 )); then
    return 1
  fi
  if [ "${owner}" = "$(id -u)" ] && (( (8#${mode} & 8#070) != 0 )); then
    return 1
  fi
  return 0
}

_skillpilot_database_backup_setup_hint() {
  local environment_file="$1"
  echo "Einmalige Einrichtung für den deployenden Benutzer:" >&2
  echo "  install -d -m 700 \"$(dirname -- "${environment_file}")\"" >&2
  echo "  install -m 600 /dev/null \"${environment_file}\"" >&2
  echo "  Danach POSTGRES_PASSWORD=<Datenbank-Passwort> eintragen (optional POSTGRES_HOST," >&2
  echo "  POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, SKILLPILOT_BACKUP_RETENTION_DAYS)." >&2
  echo "Notfall ohne Backup, nur bewusst und sichtbar: SKILLPILOT_DEPLOY_SKIP_DB_BACKUP=1" >&2
}

# Runs with the other preflights, before the Git update and every build step,
# so a missing prerequisite ends the deployment within seconds.
require_database_backup_prerequisites() {
  local skip_backup="$1"
  local environment_file="$2"
  local backup_directory="$3"

  case "${skip_backup}" in
    0)
      ;;
    1)
      echo "WARNUNG: Deployment OHNE Datenbank-Backup (SKILLPILOT_DEPLOY_SKIP_DB_BACKUP=1)." >&2
      echo "WARNUNG: Der Zustand vor diesem Neustart ist danach nicht wiederherstellbar." >&2
      return 0
      ;;
    *)
      echo "Abbruch: SKILLPILOT_DEPLOY_SKIP_DB_BACKUP muss 0 oder 1 sein." >&2
      return 1
      ;;
  esac

  echo "Prüfe Voraussetzungen für das Datenbank-Backup..."
  if ! command -v pg_dump >/dev/null 2>&1; then
    echo "Abbruch: pg_dump wird für das Datenbank-Backup vor dem Neustart benötigt." >&2
    return 1
  fi
  if [ -L "${environment_file}" ] || [ ! -f "${environment_file}" ]; then
    echo "Abbruch: Die Zugangsdatei für das Datenbank-Backup fehlt oder ist keine reguläre Datei: ${environment_file}" >&2
    _skillpilot_database_backup_setup_hint "${environment_file}"
    return 1
  fi
  if [ ! -r "${environment_file}" ]; then
    echo "Abbruch: Die Zugangsdatei für das Datenbank-Backup ist nicht lesbar: ${environment_file}" >&2
    _skillpilot_database_backup_setup_hint "${environment_file}"
    return 1
  fi
  if ! _skillpilot_database_backup_environment_protected "${environment_file}"; then
    echo "Abbruch: Die Zugangsdatei für das Datenbank-Backup ist nicht ausreichend geschützt: ${environment_file}" >&2
    echo "Erwartet: Eigentümer ist der deployende Benutzer (Modus 600) oder root, ohne Rechte für andere." >&2
    return 1
  fi
  if ! (
    _skillpilot_load_database_backup_environment "${environment_file}"
    [ -n "${POSTGRES_PASSWORD:-}" ]
  ); then
    echo "Abbruch: ${environment_file} enthält kein POSTGRES_PASSWORD." >&2
    return 1
  fi
  if [ -L "${backup_directory}" ] \
    || { [ -e "${backup_directory}" ] && [ ! -d "${backup_directory}" ]; }; then
    echo "Abbruch: Unsicheres Backup-Verzeichnis: ${backup_directory}" >&2
    return 1
  fi

  # A schema-only dump of one table proves credentials, reachability and a
  # compatible pg_dump version in well under a second; it reads no learner rows.
  local probe_error
  if ! probe_error="$(
    _skillpilot_load_database_backup_environment "${environment_file}"
    PGPASSWORD="${POSTGRES_PASSWORD}" PGCONNECT_TIMEOUT=10 pg_dump \
      -h "${POSTGRES_HOST:-localhost}" \
      -p "${POSTGRES_PORT:-5432}" \
      -U "${POSTGRES_USER:-skillpilot}" \
      -d "${POSTGRES_DB:-skillpilot}" \
      --schema-only \
      --table=learner \
      2>&1 >/dev/null
  )"; then
    echo "Abbruch: Die Datenbank ist mit den Backup-Zugangsdaten nicht lesbar." >&2
    printf '%s\n' "${probe_error}" | cut -c1-400 >&2
    return 1
  fi

  echo "CHECK database_backup_prerequisites PASS"
}

# Runs immediately before the service restart. A failed or incomplete dump
# aborts the deployment while the previous backend is still serving.
run_database_backup() {
  local skip_backup="$1"
  local environment_file="$2"
  local backup_directory="$3"
  local backup_script="$4"

  if [ "${skip_backup}" = 1 ]; then
    echo "WARNUNG: Datenbank-Backup übersprungen (SKILLPILOT_DEPLOY_SKIP_DB_BACKUP=1)." >&2
    return 0
  fi

  echo "Sichere die Datenbank vor dem Neustart..."
  if ! (
    _skillpilot_load_database_backup_environment "${environment_file}"
    export SKILLPILOT_BACKUP_DIR="${backup_directory}"
    exec bash "${backup_script}"
  ); then
    echo "Abbruch: Das Datenbank-Backup ist fehlgeschlagen." >&2
    echo "Der laufende Backend-Dienst wurde nicht neu gestartet." >&2
    return 1
  fi
  echo "CHECK database_backup PASS"
}
