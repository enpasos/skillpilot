#!/usr/bin/env bash
set -euo pipefail

# Stage only fixed, reviewed paths. Activation remains the explicit nginx reload
# in the cutover runbook, coordinated with the matching backend build.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "${ROOT_DIR}/scripts/lib/openai_v1_mtls_mode.sh"
ACTION=""
SERVICE_ENV_FILE="/etc/skillpilot/skillpilot.env"
ACME_TARGET="/etc/nginx/conf.d/skillpilot-openai-stable-acme.conf"
TLS_TARGET="/etc/nginx/skillpilot-mcp-coaches.conf"
DENY_TARGET="/etc/nginx/skillpilot-main-vhost-openai-deny-locations.conf"
ACME_ROOT="/var/lib/skillpilot-openai-acme"
BACKUP_ROOT="/var/backups/skillpilot-openai-origin"

usage() {
  cat <<'EOF'
Usage: sudo ./scripts/install_openai_stable_origin_edge.sh --bootstrap|--cutover
       [--service-environment-file /absolute/path]

--bootstrap stages the neutral HTTP-01 vhost in /etc/nginx/conf.d/.
--cutover stages neutral TLS and retires V1..V9 at the existing installed paths.
Both validate the effective nginx disk configuration and preserve backups.
Neither reloads nginx, restarts the backend, issues a certificate, or edits secrets.
See docs/deploy/openai-stable-origin.md for the coordinated activation sequence.
EOF
}

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --bootstrap|--cutover)
      [[ -z "${ACTION}" ]] || { echo "Choose one action." >&2; exit 2; }
      ACTION="$1"; shift ;;
    --service-environment-file)
      [[ "$#" -ge 2 ]] || { echo "Missing EnvironmentFile path." >&2; exit 2; }
      SERVICE_ENV_FILE="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage >&2; exit 2 ;;
  esac
done
[[ "${EUID}" -eq 0 ]] || { echo "Run this installer as root (sudo)." >&2; exit 2; }
[[ -n "${ACTION}" ]] || { usage >&2; exit 2; }
[[ "${SERVICE_ENV_FILE}" = /* ]] || { echo "EnvironmentFile path must be absolute." >&2; exit 2; }
for command_name in nginx python3 install cp cmp mktemp sha256sum git openssl; do
  command -v "${command_name}" >/dev/null || { echo "Missing command: ${command_name}" >&2; exit 1; }
done

assert_openai_v1_mtls_secure_path /etc/nginx directory "Nginx directory"
assert_openai_v1_mtls_secure_path /etc/nginx/conf.d directory "Nginx include directory"
assert_openai_v1_mtls_secure_path /var/lib directory "ACME parent"
assert_openai_v1_mtls_secure_path /var directory "Backup ancestor"
if [[ ! -e /var/backups && ! -L /var/backups ]]; then
  install -d -o root -g root -m 0755 /var/backups
fi
assert_openai_v1_mtls_secure_path /var/backups directory "Backup parent"
if [[ ! -e "${BACKUP_ROOT}" && ! -L "${BACKUP_ROOT}" ]]; then
  install -d -o root -g root -m 0700 "${BACKUP_ROOT}"
fi
assert_openai_v1_mtls_secure_path "${BACKUP_ROOT}" directory "Backup directory"

sources=()
targets=()
if [[ "${ACTION}" = --bootstrap ]]; then
  if [[ ! -e "${ACME_ROOT}" && ! -L "${ACME_ROOT}" ]]; then
    install -d -o root -g root -m 0755 "${ACME_ROOT}"
  fi
  assert_openai_v1_mtls_secure_path "${ACME_ROOT}" directory "ACME webroot"
  sources+=("${ROOT_DIR}/deploy/nginx/skillpilot-openai-stable-acme.conf")
  targets+=("${ACME_TARGET}")
else
  # Do not broaden, replace, or guess the established http/server includes.
  assert_openai_v1_mtls_secure_path "${TLS_TARGET}" file "Existing MCP include"
  assert_openai_v1_mtls_secure_path "${DENY_TARGET}" file "Existing main-origin deny include"
  assert_openai_v1_mtls_secure_path "${ACME_TARGET}" file "Installed neutral HTTP-01 include"
  cmp "${ROOT_DIR}/deploy/nginx/skillpilot-openai-stable-acme.conf" "${ACME_TARGET}"
  "${ROOT_DIR}/scripts/verify_openai_stable_origin_certificate.sh" \
    /etc/letsencrypt/live/mcp-openai.skillpilot.com/fullchain.pem
  sources+=("${ROOT_DIR}/deploy/nginx/skillpilot-mcp-coaches.conf"
    "${ROOT_DIR}/deploy/nginx/skillpilot-main-vhost-openai-deny-locations.conf")
  targets+=("${TLS_TARGET}" "${DENY_TARGET}")
fi

backup_dir="$(mktemp -d "${BACKUP_ROOT}/stage.XXXXXXXX")"
git -c safe.directory="${ROOT_DIR}" -C "${ROOT_DIR}" rev-parse HEAD >"${backup_dir}/source-commit.txt"
sha256sum "${sources[@]}" "${BASH_SOURCE[0]}" >"${backup_dir}/source-sha256.txt"
changed_targets=()
stage_complete=false
restore_failed_stage() {
  local status="$?" target name
  if [[ "${stage_complete}" != true ]]; then
    for target in "${changed_targets[@]}"; do
      name="${target##*/}"
      if [[ -f "${backup_dir}/${name}" ]]; then
        cp -a -- "${backup_dir}/${name}" "${target}"
      else
        rm -f -- "${target}"
      fi
    done
    echo "Staging failed; previous Nginx files restored. Backup: ${backup_dir}" >&2
  fi
  return "${status}"
}
trap restore_failed_stage EXIT
for index in "${!sources[@]}"; do
  source_file="${sources[${index}]}"
  target="${targets[${index}]}"
  [[ -f "${source_file}" && ! -L "${source_file}" ]] || { echo "Invalid source: ${source_file}" >&2; exit 1; }
  if [[ -e "${target}" || -L "${target}" ]]; then
    assert_openai_v1_mtls_secure_path "${target}" file "Existing Nginx target"
    cp -a -- "${target}" "${backup_dir}/${target##*/}"
  fi
  changed_targets+=("${target}")
  install -o root -g root -m 0644 "${source_file}" "${target}"
done
nginx -t
if [[ "${ACTION}" = --bootstrap ]]; then
  nginx -T 2>/dev/null | python3 -B "${ROOT_DIR}/scripts/verify_openai_v1_mtls_nginx_contract.py" \
    --bootstrap-only --expected-file "${ACME_TARGET}" --host mcp-openai.skillpilot.com
else
  "${ROOT_DIR}/scripts/verify_openai_v1_mtls_edge.sh" \
    --preflight --expected-mode observe --service-environment-file "${SERVICE_ENV_FILE}"
fi
stage_complete=true
echo "Staged ${ACTION#--}; backup and source hashes: ${backup_dir}"
echo "Nginx and backend activation remain explicit; follow docs/deploy/openai-stable-origin.md."
