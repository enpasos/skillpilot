#!/bin/bash

set -euo pipefail
export PATH=/usr/sbin:/usr/bin:/sbin:/bin
export LC_ALL=C

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ROUTER_SOURCE="${SCRIPT_DIR}/claude_v1_warn_alert.py"
MONITOR_UNIT_SOURCE="${PROJECT_ROOT}/deploy/claude-observability/skillpilot-claude-v1-warn-alert.service"
TEST_UNIT_SOURCE="${PROJECT_ROOT}/deploy/claude-observability/skillpilot-claude-v1-warn-alert-test.service"
ROUTER_TARGET="/usr/local/libexec/skillpilot-claude-v1-warn-alert.py"
MONITOR_UNIT_TARGET="/etc/systemd/system/skillpilot-claude-v1-warn-alert.service"
TEST_UNIT_TARGET="/etc/systemd/system/skillpilot-claude-v1-warn-alert-test.service"
CREDENTIAL_PARENT="/etc/skillpilot"
CREDENTIAL_DIRECTORY="${CREDENTIAL_PARENT}/claude-v1-warn-alert"
CREDENTIAL_BACKUP_DIRECTORY="${CREDENTIAL_PARENT}/claude-v1-warn-alert.previous"
STATE_DIRECTORY="/var/lib/skillpilot-claude-v1-warn-alert"
MONITOR_SERVICE_NAME="skillpilot-claude-v1-warn-alert.service"
TEST_SERVICE_NAME="skillpilot-claude-v1-warn-alert-test.service"
BACKEND_SERVICE_NAME="skillpilot.service"
MINIMUM_SYSTEMD_VERSION=247

usage() {
  printf '%s\n' \
    "Usage: sudo scripts/install_claude_v1_warn_alert.sh <command>" \
    "" \
    "Commands:" \
    "  configure    Install the units and privately prompt for protected credentials." \
    "  rotate       Privately replace credentials while the monitor is inactive." \
    "  test-route   Run one redacted mail test through the real sandboxed systemd unit." \
    "  activate     Install, verify, enable and start the read-only monitor." \
    "  status       Check deployed-byte parity and the current monitor invocation." \
    "  deactivate   Stop and disable the monitor; credentials and state are retained." \
    "  reset-state  Deliberately reset only monitor cursor/rate/runtime state." \
    "" \
    "No credential is accepted through an argument or environment variable."
}

require_root() {
  if [ "$(id -u)" -ne 0 ]; then
    echo "Abbruch: Dieser Befehl muss als root ausgeführt werden." >&2
    exit 1
  fi
}

require_file() {
  local path="$1"
  if [ ! -f "${path}" ] || [ -L "${path}" ]; then
    echo "Abbruch: Erwartete reguläre Datei fehlt oder ist ein Symlink." >&2
    exit 1
  fi
}

require_directory() {
  local path="$1"
  if [ ! -d "${path}" ] || [ -L "${path}" ]; then
    echo "Abbruch: Erwartetes Verzeichnis fehlt oder ist ein Symlink." >&2
    exit 1
  fi
}

require_safe_credential_parent() {
  local owner_group=""
  local mode=""
  require_directory "${CREDENTIAL_PARENT}"
  owner_group="$(/usr/bin/stat -c '%U:%G' "${CREDENTIAL_PARENT}")"
  mode="$(/usr/bin/stat -c '%a' "${CREDENTIAL_PARENT}")"
  if [ "${owner_group}" != "root:root" ] \
    || ! [[ "${mode}" =~ ^7[0145][0145]$ ]]; then
    echo "Abbruch: Das Credential-Elternverzeichnis ist nicht sicher." >&2
    exit 1
  fi
}

ensure_credential_parent() {
  if [ ! -e "${CREDENTIAL_PARENT}" ]; then
    /usr/bin/install -d -o root -g root -m 0755 "${CREDENTIAL_PARENT}"
  fi
  require_safe_credential_parent
}

require_executable() {
  local path="$1"
  if [ ! -x "${path}" ]; then
    echo "Abbruch: Erforderliches Programm fehlt." >&2
    exit 1
  fi
}

systemd_version() {
  local product=""
  local version=""
  IFS=' ' read -r product version _ < <(/usr/bin/systemctl --version)
  if [ "${product}" != "systemd" ] || ! [[ "${version}" =~ ^[0-9]+$ ]]; then
    echo "Abbruch: Die systemd-Version konnte nicht sicher bestimmt werden." >&2
    exit 1
  fi
  if [ "${version}" -lt "${MINIMUM_SYSTEMD_VERSION}" ]; then
    echo "Abbruch: systemd >= ${MINIMUM_SYSTEMD_VERSION} wird benötigt." >&2
    exit 1
  fi
  printf '%s' "${version}"
}

require_host_monitor_prerequisites() {
  local load_state=""
  require_executable /usr/bin/python3
  require_executable /usr/bin/journalctl
  require_executable /usr/bin/systemctl
  require_executable /usr/bin/systemd-analyze
  require_executable /usr/bin/getent
  require_executable /usr/bin/cmp
  require_executable /usr/bin/stat
  require_executable /usr/bin/install
  require_executable /usr/bin/mv
  if [ ! -d /run/systemd/system ]; then
    echo "Abbruch: Dieser Schritt muss auf dem Produktionshost mit systemd laufen." >&2
    exit 1
  fi
  systemd_version >/dev/null
  if ! /usr/bin/getent group systemd-journal >/dev/null; then
    echo "Abbruch: Die eng benötigte Gruppe systemd-journal fehlt." >&2
    exit 1
  fi
  load_state="$(/usr/bin/systemctl show "${BACKEND_SERVICE_NAME}" \
    --property=LoadState --value 2>/dev/null || true)"
  if [ "${load_state}" != "loaded" ]; then
    echo "Abbruch: Der feste Produktionsdienst skillpilot.service ist nicht geladen." >&2
    exit 1
  fi
  if ! /usr/bin/journalctl --unit "${BACKEND_SERVICE_NAME}" --lines 1 \
    --output json --no-pager --quiet >/dev/null 2>&1; then
    echo "Abbruch: Das Journal des bestehenden Backend-Dienstes ist nicht lesbar." >&2
    exit 1
  fi
}

verify_unit_files() {
  local verification_output=""
  if ! verification_output="$(/usr/bin/systemd-analyze verify "$@" 2>&1)"; then
    echo "Abbruch: Eine Alarm-Unit besteht systemd-analyze verify nicht." >&2
    printf '%s\n' "${verification_output}" >&2
    exit 1
  fi
  if [[ "${verification_output}" =~ skillpilot-claude-v1-warn-alert(-test)?\.service:[0-9]+:\ (Unknown\ key|Unknown\ lvalue) ]]; then
    echo "Abbruch: systemd hat eine Alarm-Unit-Direktive nicht erkannt." >&2
    exit 1
  fi
}

install_runtime_files() {
  require_file "${ROUTER_SOURCE}"
  require_file "${MONITOR_UNIT_SOURCE}"
  require_file "${TEST_UNIT_SOURCE}"
  verify_unit_files "${MONITOR_UNIT_SOURCE}" "${TEST_UNIT_SOURCE}"
  /usr/bin/install -D -o root -g root -m 0755 "${ROUTER_SOURCE}" "${ROUTER_TARGET}"
  /usr/bin/install -D -o root -g root -m 0644 \
    "${MONITOR_UNIT_SOURCE}" "${MONITOR_UNIT_TARGET}"
  /usr/bin/install -D -o root -g root -m 0644 \
    "${TEST_UNIT_SOURCE}" "${TEST_UNIT_TARGET}"
  verify_unit_files "${MONITOR_UNIT_TARGET}" "${TEST_UNIT_TARGET}"
}

require_deployed_byte_parity() {
  local metadata=""
  require_file "${ROUTER_TARGET}"
  require_file "${MONITOR_UNIT_TARGET}"
  require_file "${TEST_UNIT_TARGET}"
  if ! /usr/bin/cmp --silent "${ROUTER_SOURCE}" "${ROUTER_TARGET}" \
    || ! /usr/bin/cmp --silent "${MONITOR_UNIT_SOURCE}" "${MONITOR_UNIT_TARGET}" \
    || ! /usr/bin/cmp --silent "${TEST_UNIT_SOURCE}" "${TEST_UNIT_TARGET}"; then
    echo "Abbruch: Installierte Alarmdateien weichen vom aktuellen Repository ab." >&2
    exit 1
  fi
  metadata="$(/usr/bin/stat -c '%U:%G:%a' "${ROUTER_TARGET}")"
  if [ "${metadata}" != "root:root:755" ]; then
    echo "Abbruch: Der installierte Alarmrouter hat unsichere Metadaten." >&2
    exit 1
  fi
  for unit_path in "${MONITOR_UNIT_TARGET}" "${TEST_UNIT_TARGET}"; do
    metadata="$(/usr/bin/stat -c '%U:%G:%a' "${unit_path}")"
    if [ "${metadata}" != "root:root:644" ]; then
      echo "Abbruch: Eine installierte Alarm-Unit hat unsichere Metadaten." >&2
      exit 1
    fi
  done
}

verify_effective_unit_origin() {
  local service_name="$1"
  local expected_fragment="$2"
  local fragment_path=""
  local drop_in_paths=""
  local need_daemon_reload=""
  fragment_path="$(/usr/bin/systemctl show "${service_name}" \
    --property=FragmentPath --value)"
  drop_in_paths="$(/usr/bin/systemctl show "${service_name}" \
    --property=DropInPaths --value)"
  need_daemon_reload="$(/usr/bin/systemctl show "${service_name}" \
    --property=NeedDaemonReload --value)"
  if [ "${fragment_path}" != "${expected_fragment}" ] \
    || [ -n "${drop_in_paths}" ] \
    || [ "${need_daemon_reload}" != "no" ]; then
    echo "Abbruch: Eine Alarm-Unit wird nicht unverändert aus /etc geladen." >&2
    exit 1
  fi
}

verify_effective_unit_origins() {
  verify_effective_unit_origin "${MONITOR_SERVICE_NAME}" "${MONITOR_UNIT_TARGET}"
  verify_effective_unit_origin "${TEST_SERVICE_NAME}" "${TEST_UNIT_TARGET}"
}

credential_files_exist() {
  [ -e "${CREDENTIAL_DIRECTORY}/smtp-username" ] \
    || [ -e "${CREDENTIAL_DIRECTORY}/smtp-password" ] \
    || [ -e "${CREDENTIAL_DIRECTORY}/recipient" ]
}

require_safe_credentials() {
  local name=""
  local path=""
  local metadata=""
  require_safe_credential_parent
  require_directory "${CREDENTIAL_DIRECTORY}"
  metadata="$(/usr/bin/stat -c '%U:%G:%a' "${CREDENTIAL_DIRECTORY}")"
  if [ "${metadata}" != "root:root:700" ]; then
    echo "Abbruch: Das Credential-Verzeichnis muss root:root und Modus 0700 haben." >&2
    exit 1
  fi
  for name in smtp-username smtp-password recipient; do
    path="${CREDENTIAL_DIRECTORY}/${name}"
    require_file "${path}"
    metadata="$(/usr/bin/stat -c '%U:%G:%a' "${path}")"
    if [ "${metadata}" != "root:root:600" ]; then
      echo "Abbruch: Alarm-Credentials müssen root:root und Modus 0600 haben." >&2
      exit 1
    fi
  done
  /usr/bin/python3 -B "${ROUTER_TARGET}" validate-config \
    --credential-source-directory "${CREDENTIAL_DIRECTORY}"
}

monitor_is_active() {
  /usr/bin/systemctl is-active --quiet "${MONITOR_SERVICE_NAME}" 2>/dev/null
}

refuse_while_monitor_active() {
  if monitor_is_active; then
    echo "Abbruch: Zuerst den aktiven Alarmmonitor kontrolliert deaktivieren." >&2
    exit 1
  fi
}

require_monitor_disabled() {
  if /usr/bin/systemctl is-enabled --quiet "${MONITOR_SERVICE_NAME}" 2>/dev/null; then
    echo "Abbruch: Zuerst den Alarmmonitor mit deactivate deaktivieren." >&2
    exit 1
  fi
}

configure_credentials() {
  local mode="${1:-initial}"
  local smtp_username=""
  local smtp_password=""
  local smtp_password_confirmation=""
  local recipient=""
  local temporary_directory=""
  local backup_active=false
  local completed=false

  if [ "${mode}" = "initial" ] && credential_files_exist; then
    echo "Abbruch: Credentials existieren bereits und werden nicht still überschrieben." >&2
    exit 1
  fi
  if [ "${mode}" = "rotate" ]; then
    require_safe_credentials
    if [ -e "${CREDENTIAL_BACKUP_DIRECTORY}" ]; then
      echo "Abbruch: Ein früheres Credential-Backup erfordert manuelle Prüfung." >&2
      exit 1
    fi
  elif [ "${mode}" != "initial" ]; then
    echo "Abbruch: Unbekannter Credential-Modus." >&2
    exit 1
  fi
  if [ ! -r /dev/tty ]; then
    echo "Abbruch: Für die geheime Eingabe wird ein interaktives Terminal benötigt." >&2
    exit 1
  fi

  ensure_credential_parent
  temporary_directory="$(/usr/bin/mktemp -d \
    "${CREDENTIAL_PARENT}/.claude-v1-warn-alert.new.XXXXXX")"
  /usr/bin/chmod 0700 "${temporary_directory}"
  cleanup_credentials() {
    smtp_password=""
    smtp_password_confirmation=""
    if [ "${completed}" != "true" ] && [ "${backup_active}" = "true" ]; then
      if [ -d "${CREDENTIAL_DIRECTORY}" ]; then
        /usr/bin/rm -f -- \
          "${CREDENTIAL_DIRECTORY}/smtp-username" \
          "${CREDENTIAL_DIRECTORY}/smtp-password" \
          "${CREDENTIAL_DIRECTORY}/recipient"
        /usr/bin/rmdir -- "${CREDENTIAL_DIRECTORY}" 2>/dev/null || true
      fi
      if [ ! -e "${CREDENTIAL_DIRECTORY}" ] \
        && [ -d "${CREDENTIAL_BACKUP_DIRECTORY}" ]; then
        /usr/bin/mv -T -- \
          "${CREDENTIAL_BACKUP_DIRECTORY}" "${CREDENTIAL_DIRECTORY}"
      fi
    fi
    if [ -n "${temporary_directory}" ] && [ -d "${temporary_directory}" ]; then
      /usr/bin/rm -f -- \
        "${temporary_directory}/smtp-username" \
        "${temporary_directory}/smtp-password" \
        "${temporary_directory}/recipient"
      /usr/bin/rmdir -- "${temporary_directory}" 2>/dev/null || true
    fi
    if [ "${completed}" = "true" ] \
      && [ -d "${CREDENTIAL_BACKUP_DIRECTORY}" ]; then
      /usr/bin/rm -f -- \
        "${CREDENTIAL_BACKUP_DIRECTORY}/smtp-username" \
        "${CREDENTIAL_BACKUP_DIRECTORY}/smtp-password" \
        "${CREDENTIAL_BACKUP_DIRECTORY}/recipient"
      /usr/bin/rmdir -- "${CREDENTIAL_BACKUP_DIRECTORY}"
    fi
  }
  trap cleanup_credentials EXIT

  IFS= read -r -p "SMTP-Benutzeradresse des technischen Postfachs: " smtp_username </dev/tty
  IFS= read -r -p "Private interne Zieladresse: " recipient </dev/tty
  IFS= read -r -s -p "Kennwort des dedizierten IONOS-Alarm-Postfachs: " smtp_password </dev/tty
  printf '\n' >/dev/tty
  IFS= read -r -s -p "Postfachkennwort wiederholen: " smtp_password_confirmation </dev/tty
  printf '\n' >/dev/tty
  if [ "${smtp_password}" != "${smtp_password_confirmation}" ]; then
    echo "Abbruch: Die Postfachkennwörter stimmen nicht überein." >&2
    exit 1
  fi

  umask 077
  printf '%s\n' "${smtp_username}" >"${temporary_directory}/smtp-username"
  printf '%s\n' "${smtp_password}" >"${temporary_directory}/smtp-password"
  printf '%s\n' "${recipient}" >"${temporary_directory}/recipient"
  /usr/bin/chmod 0600 \
    "${temporary_directory}/smtp-username" \
    "${temporary_directory}/smtp-password" \
    "${temporary_directory}/recipient"

  /usr/bin/python3 -B "${ROUTER_TARGET}" validate-config \
    --credential-source-directory "${temporary_directory}"
  if [ "${mode}" = "rotate" ]; then
    /usr/bin/mv -T -- "${CREDENTIAL_DIRECTORY}" "${CREDENTIAL_BACKUP_DIRECTORY}"
    backup_active=true
  fi
  /usr/bin/mv -T -- "${temporary_directory}" "${CREDENTIAL_DIRECTORY}"
  temporary_directory=""
  require_safe_credentials
  completed=true
  cleanup_credentials
  trap - EXIT
  echo "CHECK claude_v1_warn_alert_credentials PASS"
}

exact_invocation_marker() {
  local service_name="$1"
  local invocation_id="$2"
  local marker="$3"
  local marker_output=""
  if ! [[ "${invocation_id}" =~ ^[0-9a-f]{32}$ ]]; then
    return 1
  fi
  marker_output="$(/usr/bin/journalctl \
    "_SYSTEMD_INVOCATION_ID=${invocation_id}" \
    --grep="^${marker}$" --lines=1 --output=cat --no-pager --quiet \
    2>/dev/null || true)"
  [ "${marker_output}" = "${marker}" ] \
    && [ "$(/usr/bin/systemctl show "${service_name}" --property=InvocationID --value)" = "${invocation_id}" ]
}

test_route() {
  local invocation_id=""
  local result=""
  refuse_while_monitor_active
  require_monitor_disabled
  require_host_monitor_prerequisites
  require_deployed_byte_parity
  require_safe_credentials
  /usr/bin/systemctl daemon-reload
  verify_effective_unit_origins
  /usr/bin/systemctl stop "${TEST_SERVICE_NAME}" >/dev/null 2>&1 || true
  /usr/bin/systemctl reset-failed "${TEST_SERVICE_NAME}" >/dev/null 2>&1 || true
  echo "Sende genau eine als Test gekennzeichnete, redigierte Alarmmail ..."
  if ! /usr/bin/systemctl start "${TEST_SERVICE_NAME}" >/dev/null; then
    echo "CHECK claude_v1_warn_alert_route_test FAIL" >&2
    exit 1
  fi
  invocation_id="$(/usr/bin/systemctl show "${TEST_SERVICE_NAME}" \
    --property=InvocationID --value)"
  result="$(/usr/bin/systemctl show "${TEST_SERVICE_NAME}" --property=Result --value)"
  if [ "${result}" != "success" ] \
    || ! exact_invocation_marker "${TEST_SERVICE_NAME}" "${invocation_id}" \
      "INFO claude_v1_warn_alert configuration_valid" \
    || ! exact_invocation_marker "${TEST_SERVICE_NAME}" "${invocation_id}" \
      "INFO claude_v1_warn_alert journal_source_verified" \
    || ! exact_invocation_marker "${TEST_SERVICE_NAME}" "${invocation_id}" \
      "INFO claude_v1_warn_alert route_test_accepted"; then
    /usr/bin/systemctl stop "${TEST_SERVICE_NAME}" >/dev/null 2>&1 || true
    echo "CHECK claude_v1_warn_alert_route_test FAIL" >&2
    exit 1
  fi
  /usr/bin/systemctl stop "${TEST_SERVICE_NAME}" >/dev/null
  echo "CHECK claude_v1_warn_alert_route_test SMTP_ACCEPTED"
  echo "Der tatsächliche Empfang muss separat bestätigt und privat evidenziert werden."
}

verify_effective_monitor_properties() {
  local dynamic_user=""
  local state_directory=""
  local supplementary_groups=""
  local need_daemon_reload=""
  dynamic_user="$(/usr/bin/systemctl show "${MONITOR_SERVICE_NAME}" \
    --property=DynamicUser --value)"
  state_directory="$(/usr/bin/systemctl show "${MONITOR_SERVICE_NAME}" \
    --property=StateDirectory --value)"
  supplementary_groups="$(/usr/bin/systemctl show "${MONITOR_SERVICE_NAME}" \
    --property=SupplementaryGroups --value)"
  need_daemon_reload="$(/usr/bin/systemctl show "${MONITOR_SERVICE_NAME}" \
    --property=NeedDaemonReload --value)"
  if [ "${dynamic_user}" != "yes" ] \
    || [[ " ${state_directory} " != *" skillpilot-claude-v1-warn-alert "* ]] \
    || [[ " ${supplementary_groups} " != *" systemd-journal "* ]] \
    || [ "${need_daemon_reload}" != "no" ]; then
    echo "Abbruch: Effektive Sandbox- oder Journal-Eigenschaften weichen ab." >&2
    exit 1
  fi
}

verify_running_invocation() {
  local invocation_id=""
  local restart_count=""
  local sub_state=""
  invocation_id="$(/usr/bin/systemctl show "${MONITOR_SERVICE_NAME}" \
    --property=InvocationID --value)"
  restart_count="$(/usr/bin/systemctl show "${MONITOR_SERVICE_NAME}" \
    --property=NRestarts --value)"
  sub_state="$(/usr/bin/systemctl show "${MONITOR_SERVICE_NAME}" \
    --property=SubState --value)"
  if [ "${sub_state}" != "running" ] || [ "${restart_count}" != "0" ] \
    || ! /usr/bin/python3 -B "${ROUTER_TARGET}" verify-runtime \
      --state-directory "${STATE_DIRECTORY}" \
      --expected-invocation-id "${invocation_id}" >/dev/null; then
    echo "CHECK claude_v1_warn_alert_monitor FAIL" >&2
    exit 1
  fi
}

activate_monitor() {
  local activation_complete=false
  local marker_seen=false
  local invocation_id=""
  refuse_while_monitor_active
  require_monitor_disabled
  require_host_monitor_prerequisites
  require_file "${ROUTER_SOURCE}"
  /usr/bin/python3 -B "${ROUTER_SOURCE}" validate-config \
    --credential-source-directory "${CREDENTIAL_DIRECTORY}"
  /usr/bin/systemctl stop "${TEST_SERVICE_NAME}" >/dev/null 2>&1 || true
  install_runtime_files
  /usr/bin/systemctl daemon-reload
  require_deployed_byte_parity
  verify_effective_unit_origins
  require_safe_credentials
  /usr/bin/systemctl reset-failed "${MONITOR_SERVICE_NAME}" >/dev/null 2>&1 || true

  cleanup_activation() {
    if [ "${activation_complete}" != "true" ]; then
      /usr/bin/systemctl disable --now "${MONITOR_SERVICE_NAME}" \
        >/dev/null 2>&1 || true
    fi
  }
  trap cleanup_activation EXIT

  if ! /usr/bin/systemctl start "${MONITOR_SERVICE_NAME}" >/dev/null; then
    echo "CHECK claude_v1_warn_alert_monitor FAIL" >&2
    exit 1
  fi
  invocation_id="$(/usr/bin/systemctl show "${MONITOR_SERVICE_NAME}" \
    --property=InvocationID --value)"
  for _ in {1..10}; do
    if exact_invocation_marker "${MONITOR_SERVICE_NAME}" "${invocation_id}" \
      "INFO claude_v1_warn_alert monitor_started"; then
      marker_seen=true
      break
    fi
    if ! monitor_is_active; then
      break
    fi
    /usr/bin/sleep 1
  done
  if [ "${marker_seen}" != "true" ]; then
    echo "CHECK claude_v1_warn_alert_monitor FAIL" >&2
    exit 1
  fi
  /usr/bin/sleep 5
  verify_effective_monitor_properties
  verify_running_invocation
  /usr/bin/systemctl enable "${MONITOR_SERVICE_NAME}" >/dev/null
  if ! /usr/bin/systemctl is-enabled --quiet "${MONITOR_SERVICE_NAME}"; then
    echo "CHECK claude_v1_warn_alert_monitor FAIL" >&2
    exit 1
  fi
  verify_running_invocation
  activation_complete=true
  trap - EXIT
  echo "CHECK claude_v1_warn_alert_monitor ACTIVE"
}

show_status() {
  require_host_monitor_prerequisites
  require_deployed_byte_parity
  verify_effective_unit_origins
  require_safe_credentials
  verify_effective_monitor_properties
  if ! /usr/bin/systemctl is-enabled --quiet "${MONITOR_SERVICE_NAME}" \
    || ! monitor_is_active; then
    echo "CHECK claude_v1_warn_alert_monitor INACTIVE" >&2
    exit 1
  fi
  verify_running_invocation
  echo "CHECK claude_v1_warn_alert_installation PASS"
  echo "CHECK claude_v1_warn_alert_monitor ACTIVE"
}

deactivate_monitor() {
  require_executable /usr/bin/systemctl
  /usr/bin/systemctl stop "${TEST_SERVICE_NAME}" >/dev/null 2>&1 || true
  /usr/bin/systemctl disable --now "${MONITOR_SERVICE_NAME}" >/dev/null
  echo "CHECK claude_v1_warn_alert_monitor DEACTIVATED"
  echo "Geschützte Credentials und Rate-/Cursor-Zustand wurden nicht gelöscht."
}

reset_monitor_state() {
  local confirmation=""
  refuse_while_monitor_active
  require_monitor_disabled
  require_host_monitor_prerequisites
  require_deployed_byte_parity
  if [ ! -r /dev/tty ]; then
    echo "Abbruch: Die Zustandsfreigabe erfordert ein interaktives Terminal." >&2
    exit 1
  fi
  IFS= read -r -p \
    "Nach Ursachenprüfung RESET-CLAUDE-ALERT-STATE eingeben: " confirmation </dev/tty
  if [ "${confirmation}" != "RESET-CLAUDE-ALERT-STATE" ]; then
    echo "Abbruch: Der Alarmzustand wurde nicht verändert." >&2
    exit 1
  fi
  /usr/bin/systemctl stop "${TEST_SERVICE_NAME}" >/dev/null 2>&1 || true
  /usr/bin/rm -f -- \
    "${STATE_DIRECTORY}/journal.cursor" \
    "${STATE_DIRECTORY}/rate-state.json" \
    "${STATE_DIRECTORY}/runtime-invocation" \
    "${STATE_DIRECTORY}/monitor.lock"
  echo "CHECK claude_v1_warn_alert_state RESET"
  echo "Cursor, Versandbudget und Laufzeitmarker wurden gelöscht und sind nicht wiederherstellbar."
}

command_name="${1:-}"
case "${command_name}" in
  -h|--help|help)
    usage
    exit 0
    ;;
  configure|rotate|test-route|activate|status|deactivate|reset-state)
    require_root
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac

case "${command_name}" in
  configure)
    refuse_while_monitor_active
    require_monitor_disabled
    if credential_files_exist; then
      echo "Abbruch: Credentials existieren bereits und werden nicht still überschrieben." >&2
      exit 1
    fi
    require_host_monitor_prerequisites
    install_runtime_files
    /usr/bin/systemctl daemon-reload
    configure_credentials initial
    ;;
  rotate)
    refuse_while_monitor_active
    require_monitor_disabled
    require_host_monitor_prerequisites
    require_deployed_byte_parity
    require_safe_credentials
    /usr/bin/systemctl stop "${TEST_SERVICE_NAME}" >/dev/null 2>&1 || true
    configure_credentials rotate
    ;;
  test-route)
    test_route
    ;;
  activate)
    activate_monitor
    ;;
  status)
    show_status
    ;;
  deactivate)
    deactivate_monitor
    ;;
  reset-state)
    reset_monitor_state
    ;;
esac
