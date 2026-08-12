#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "${ROOT_DIR}/scripts/lib/openai_v1_mtls_mode.sh"
SOURCE_DIR="${ROOT_DIR}/deploy/openai-mtls"
INSTALL_DIR="/etc/skillpilot/openai-mtls"
ACTIVE_NGINX_CONFIG="/etc/nginx/skillpilot-mcp-coaches.conf"
ACTIVE_MAIN_NGINX_DENY_CONFIG="/etc/nginx/skillpilot-main-vhost-openai-deny-locations.conf"
SERVICE_NAME="skillpilot-openai-v1-mtls-verifier.service"
VERIFIER_PORT="8792"
BACKEND_PORT="8787"
VERIFIER_READY_TIMEOUT_SECONDS="20"
MCP_HOST="mcp-coach-v1.skillpilot.com"
MAIN_HOST="skillpilot.com"
MCP_URL="https://${MCP_HOST}/mcp"
METADATA_URL="https://${MCP_HOST}/.well-known/oauth-protected-resource/mcp"
AUTHORIZATION_BASE_URL="${SKILLPILOT_PUBLIC_BASE_URL:-${SKILLPILOT_BASE_URL:-https://skillpilot.com}}"
SERVICE_ENV_FILE="${SKILLPILOT_SERVICE_ENV_FILE:-/etc/skillpilot/skillpilot.env}"
EXPECTED_ROOT_FILE_SHA256="3a565b5c83c83ba2de085de28733e3c6af01af9b347322b93caf3a03d42c5cbe"
EXPECTED_INTERMEDIATE_FILE_SHA256="7485f98dfbb7db119ca99d5748ac7a86baa73ddede878d3263a50cba2c4f6dd8"
EXPECTED_ROOT_CERT_SHA256="493d9a1edc48d558f5a28764b20605205a50e1df4840231e342f2e0e8cdd5be9"
EXPECTED_INTERMEDIATE_CERT_SHA256="da3d8e2e32ee4981ea1152c1456f866c863dbde2fbf4f8eba8850df74b656816"
CA_MINIMUM_REMAINING_SECONDS="7776000"
MTLS_TEMPORARY_DIR=""
cleanup_mtls_temporary_directory() {
  if [[ -n "${MTLS_TEMPORARY_DIR}" && -d "${MTLS_TEMPORARY_DIR}" ]]; then
    rm -rf -- "${MTLS_TEMPORARY_DIR}"
  fi
}
trap cleanup_mtls_temporary_directory EXIT

usage() {
  cat <<'EOF'
Usage: ./scripts/verify_openai_v1_mtls_edge.sh [MODE] [--expected-mode MODE]

Modes:
  --static          Repository CA, verifier, installer, and hermetic tests (default)
  --staged          Root-only Fresh Install check; does not require active Nginx
  --preflight       Root-only backend-mode, installed-artifact, and Nginx disk check
  --installed       Root-only installed-file, service, listener, and Nginx checks
  --runtime         Installed verifier, public edge, and loopback operator checks
  --local-operator  OAuth challenge through 127.0.0.1; never a public bypass

MODE is observe or enforce. If omitted for a live check, the exact root-owned
/etc/skillpilot/openai-mtls/mode.conf is used. An explicitly supplied mode or
SKILLPILOT_OPENAI_COACH_V1_MTLS_EDGE_MODE must match that file.
EOF
}

ACTION="--static"
EXPECTED_MODE="${SKILLPILOT_OPENAI_COACH_V1_MTLS_EDGE_MODE:-}"
while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --static|--staged|--preflight|--installed|--runtime|--local-operator)
      ACTION="$1"
      shift
      ;;
    --expected-mode)
      if [[ "$#" -lt 2 ]]; then
        echo "--expected-mode requires observe or enforce." >&2
        exit 2
      fi
      EXPECTED_MODE="$2"
      shift 2
      ;;
    --expected-mode=*)
      EXPECTED_MODE="${1#*=}"
      shift
      ;;
    --service-environment-file)
      if [[ "$#" -lt 2 ]]; then
        echo "--service-environment-file requires an absolute path." >&2
        exit 2
      fi
      SERVICE_ENV_FILE="$2"
      shift 2
      ;;
    --service-environment-file=*)
      SERVICE_ENV_FILE="${1#*=}"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

assert_file_hash() {
  local expected="$1"
  local file="$2"
  local actual
  actual="$(sha256sum "${file}" | awk '{print $1}')"
  if [[ "${actual}" != "${expected}" ]]; then
    echo "CHECK ca_file_hash FAIL ${file}: ${actual}" >&2
    exit 1
  fi
}

assert_certificate_fingerprint() {
  local expected="$1"
  local file="$2"
  local actual
  actual="$(openssl x509 -in "${file}" -outform DER | sha256sum | awk '{print $1}')"
  if [[ "${actual}" != "${expected}" ]]; then
    echo "CHECK ca_certificate_fingerprint FAIL ${file}: ${actual}" >&2
    exit 1
  fi
}

assert_certificate_valid_for_cutover() {
  local file="$1"
  if ! openssl x509 \
    -checkend "${CA_MINIMUM_REMAINING_SECONDS}" \
    -noout \
    -in "${file}" >/dev/null; then
    echo "CHECK ca_validity FAIL certificate expires within 90 days: ${file}" >&2
    exit 1
  fi
}

run_static_checks() {
  local root_ca="${SOURCE_DIR}/openai-root-ca.pem"
  local intermediate_ca="${SOURCE_DIR}/openai-connectors-mtls-ca.pem"
  local verifier_unit="${SOURCE_DIR}/skillpilot-openai-v1-mtls-verifier.service"
  assert_file_hash "${EXPECTED_ROOT_FILE_SHA256}" "${root_ca}"
  assert_file_hash "${EXPECTED_INTERMEDIATE_FILE_SHA256}" "${intermediate_ca}"
  assert_certificate_fingerprint "${EXPECTED_ROOT_CERT_SHA256}" "${root_ca}"
  assert_certificate_fingerprint \
    "${EXPECTED_INTERMEDIATE_CERT_SHA256}" \
    "${intermediate_ca}"
  openssl verify -trusted "${root_ca}" -no-CApath -no-CAstore -x509_strict \
    "${root_ca}" >/dev/null
  openssl verify -trusted "${root_ca}" -no-CApath -no-CAstore -x509_strict \
    "${intermediate_ca}" >/dev/null
  assert_certificate_valid_for_cutover "${root_ca}"
  assert_certificate_valid_for_cutover "${intermediate_ca}"
  PYTHONDONTWRITEBYTECODE=1 python3 -B -m unittest -v \
    "${ROOT_DIR}/scripts/test_openai_v1_mtls_edge.py"
  PYTHONDONTWRITEBYTECODE=1 python3 -B \
    "${ROOT_DIR}/scripts/verify_openai_v1_mtls_nginx_contract.py" \
    --help >/dev/null
  if ! command -v systemd-analyze >/dev/null 2>&1; then
    echo "CHECK mtls_systemd_unit FAIL systemd-analyze is unavailable" >&2
    exit 1
  fi
  local systemd_verify_output
  if ! systemd_verify_output="$(systemd-analyze verify "${verifier_unit}" 2>&1)"; then
    echo "CHECK mtls_systemd_unit FAIL invalid verifier service unit" >&2
    printf '%s\n' "${systemd_verify_output}" >&2
    exit 1
  fi
  echo "CHECK mtls_systemd_unit PASS"
  bash -n \
    "${ROOT_DIR}/scripts/install_openai_v1_mtls_edge.sh" \
    "${ROOT_DIR}/scripts/lib/openai_v1_mtls_mode.sh" \
    "${ROOT_DIR}/scripts/verify_openai_v1_mtls_edge.sh"
  echo "CHECK openai_v1_mtls_static PASS"
}

read_active_mode() {
  read_openai_v1_mtls_installed_mode "${INSTALL_DIR}/mode.conf"
}

assert_backend_mode_matches_edge() {
  local backend_mode
  assert_openai_v1_mtls_secure_path \
    "$(dirname -- "${SERVICE_ENV_FILE}")" \
    directory \
    "Backend EnvironmentFile directory"
  assert_openai_v1_mtls_secret_file \
    "${SERVICE_ENV_FILE}" \
    "Backend EnvironmentFile"
  backend_mode="$(read_openai_v1_mtls_backend_mode "${SERVICE_ENV_FILE}")"
  if [[ "${backend_mode}" != "${EXPECTED_MODE}" ]]; then
    echo "CHECK mtls_mode_drift FAIL backend=${backend_mode} edge=${EXPECTED_MODE}" >&2
    exit 1
  fi
  echo "CHECK mtls_mode_drift PASS backend=${backend_mode} edge=${EXPECTED_MODE}"
}

resolve_live_mode() {
  local active_mode
  active_mode="$(read_active_mode)"
  if [[ -n "${EXPECTED_MODE}" \
    && "${EXPECTED_MODE}" != "observe" \
    && "${EXPECTED_MODE}" != "enforce" ]]; then
    echo "CHECK mtls_mode FAIL expected mode must be observe or enforce, got ${EXPECTED_MODE}" >&2
    exit 1
  fi
  if [[ -n "${EXPECTED_MODE}" && "${EXPECTED_MODE}" != "${active_mode}" ]]; then
    echo "CHECK mtls_mode FAIL configured=${EXPECTED_MODE} installed=${active_mode}" >&2
    exit 1
  fi
  EXPECTED_MODE="${active_mode}"
  echo "CHECK mtls_mode PASS ${EXPECTED_MODE}" >&2
}

assert_loopback_listener() {
  local listeners
  listeners="$(ss -ltnH | awk -v suffix=":${VERIFIER_PORT}" '$4 ~ suffix "$" {print $4}')"
  if [[ -z "${listeners}" ]]; then
    echo "CHECK mtls_verifier_listener FAIL no listener on ${VERIFIER_PORT}" >&2
    exit 1
  fi
  local address
  while IFS= read -r address; do
    if ! is_openai_v1_mtls_loopback_listener "${address}" "${VERIFIER_PORT}"; then
      echo "CHECK mtls_verifier_listener FAIL non-loopback listener ${address}" >&2
      exit 1
    fi
  done <<<"${listeners}"
  echo "CHECK mtls_verifier_listener PASS loopback-only"
}

assert_backend_loopback_listener() {
  local listeners
  listeners="$(ss -ltnH | awk -v suffix=":${BACKEND_PORT}" '$4 ~ suffix "$" {print $4}')"
  if [[ -z "${listeners}" ]]; then
    echo "CHECK mtls_backend_listener FAIL no listener on ${BACKEND_PORT}" >&2
    exit 1
  fi
  local address
  while IFS= read -r address; do
    if ! is_openai_v1_mtls_loopback_listener "${address}" "${BACKEND_PORT}"; then
      echo "CHECK mtls_backend_listener FAIL non-loopback listener ${address}" >&2
      exit 1
    fi
  done <<<"${listeners}"
  echo "CHECK mtls_backend_listener PASS loopback-only"
}

assert_verifier_service() {
  local fragment_path
  local drop_in_paths
  fragment_path="$(
    systemctl show "${SERVICE_NAME}" \
      --property=FragmentPath \
      --value \
      --no-pager
  )"
  drop_in_paths="$(
    systemctl show "${SERVICE_NAME}" \
      --property=DropInPaths \
      --value \
      --no-pager
  )"
  if [[ "${fragment_path}" != "/etc/systemd/system/${SERVICE_NAME}" \
    || -n "${drop_in_paths}" ]]; then
    echo "CHECK mtls_verifier_service FAIL unexpected effective systemd unit or drop-in" >&2
    exit 1
  fi
  local deadline=$((SECONDS + VERIFIER_READY_TIMEOUT_SECONDS))
  local service_state="unknown"
  local listeners=""
  while (( SECONDS < deadline )); do
    service_state="$(
      systemctl is-active "${SERVICE_NAME}" 2>/dev/null || true
    )"
    listeners="$(
      ss -ltnH \
        | awk -v suffix=":${VERIFIER_PORT}" '$4 ~ suffix "$" {print $4}'
    )"
    if [[ "${service_state}" == "active" && -n "${listeners}" ]]; then
      break
    fi
    sleep 1
  done
  if [[ "${service_state}" != "active" || -z "${listeners}" ]]; then
    echo "CHECK mtls_verifier_service FAIL verifier not ready after ${VERIFIER_READY_TIMEOUT_SECONDS}s (state=${service_state})" >&2
    exit 1
  fi
  echo "CHECK mtls_verifier_service PASS exact unit without drop-ins, active"
  assert_loopback_listener
  assert_backend_loopback_listener
}

assert_verifier_decisions() {
  local headers_temporary
  headers_temporary="$(mktemp)"
  local status

  status="$(
    curl --silent --show-error \
      --output /dev/null \
      --write-out '%{http_code}' \
      --header "X-SkillPilot-OpenAI-mTLS-Mode: ${EXPECTED_MODE}" \
      --header 'X-SkillPilot-OpenAI-mTLS-Remote-Addr: 203.0.113.8' \
      --header 'X-SkillPilot-OpenAI-mTLS-Client-Verify: FAILED:fixture' \
      "http://127.0.0.1:${VERIFIER_PORT}/verify"
  )"
  if [[ "${status}" != "403" ]]; then
    echo "CHECK mtls_verifier_failed_cert FAIL expected 403, got ${status}" >&2
    unlink "${headers_temporary}"
    exit 1
  fi
  echo "CHECK mtls_verifier_failed_cert PASS 403"

  status="$(
    curl --silent --show-error \
      --dump-header "${headers_temporary}" \
      --output /dev/null \
      --write-out '%{http_code}' \
      --header "X-SkillPilot-OpenAI-mTLS-Mode: ${EXPECTED_MODE}" \
      --header 'X-SkillPilot-OpenAI-mTLS-Remote-Addr: 203.0.113.8' \
      --header 'X-SkillPilot-OpenAI-mTLS-Client-Verify: NONE' \
      "http://127.0.0.1:${VERIFIER_PORT}/verify"
  )"
  if [[ "${EXPECTED_MODE}" == "observe" ]]; then
    if [[ "${status}" != "204" ]] \
      || ! tr -d '\r' <"${headers_temporary}" \
        | grep -Fqx 'X-SkillPilot-OpenAI-mTLS-Classification: OBSERVE_NO_CERT'; then
      echo "CHECK mtls_verifier_observe FAIL expected bounded 204 classification" >&2
      unlink "${headers_temporary}"
      exit 1
    fi
    echo "CHECK mtls_verifier_observe PASS OBSERVE_NO_CERT"
  elif [[ "${status}" != "403" ]]; then
    echo "CHECK mtls_verifier_enforce FAIL external NONE expected 403, got ${status}" >&2
    unlink "${headers_temporary}"
    exit 1
  else
    echo "CHECK mtls_verifier_enforce PASS external NONE rejected"
  fi
  unlink "${headers_temporary}"
}

assert_local_operator_lane() {
  MTLS_TEMPORARY_DIR="$(mktemp -d)"
  local result status effective_url tls_result remote_ip
  result="$(
    curl \
      --proto '=https' \
      --tlsv1.2 \
      --connect-timeout 5 \
      --max-time 15 \
      --max-redirs 0 \
      --silent \
      --show-error \
      --noproxy '*' \
      --resolve "${MCP_HOST}:443:127.0.0.1" \
      --request POST \
      --header 'Accept: application/json, text/event-stream' \
      --header 'Content-Type: application/json' \
      --data '{"jsonrpc":"2.0","id":"local-operator-smoke","method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"skillpilot-local-operator-smoke","version":"1"}}}' \
      --dump-header "${MTLS_TEMPORARY_DIR}/headers" \
      --output "${MTLS_TEMPORARY_DIR}/body" \
      --write-out '%{http_code}|%{url_effective}|%{ssl_verify_result}|%{remote_ip}' \
      "${MCP_URL}"
  )"
  IFS='|' read -r status effective_url tls_result remote_ip <<<"${result}"
  if [[ "${remote_ip}" != "127.0.0.1" ]]; then
    echo "CHECK mtls_local_operator FAIL connection was not loopback: ${remote_ip}" >&2
    exit 1
  fi
  if [[ "${status}" != "401" \
    || "${effective_url}" != "${MCP_URL}" \
    || "${tls_result}" != "0" ]]; then
    echo "CHECK mtls_local_operator FAIL expected direct loopback HTTPS 401, got ${status}" >&2
    exit 1
  fi
  local challenge
  challenge="$(
    tr -d '\r' <"${MTLS_TEMPORARY_DIR}/headers" \
      | awk 'tolower($0) ~ /^www-authenticate:/ { sub(/^[^:]*:[[:space:]]*/, ""); value = $0 } END { print value }'
  )"
  if [[ "${challenge}" != Bearer* \
    || "${challenge}" != *"resource_metadata=\"${METADATA_URL}\""* ]]; then
    echo "CHECK mtls_local_operator FAIL OAuth challenge is not exact" >&2
    exit 1
  fi
  echo "CHECK mtls_local_operator PASS loopback-only OAuth challenge"
  cleanup_mtls_temporary_directory
  MTLS_TEMPORARY_DIR=""
}

assert_installed_security_permissions() {
  local secure_directory
  for secure_directory in \
    "${INSTALL_DIR}" \
    /usr/local/libexec \
    /etc/systemd/system; do
    assert_openai_v1_mtls_secure_path \
      "${secure_directory}" \
      directory \
      "OpenAI mTLS security directory"
  done
  local secure_file
  for secure_file in \
    "${INSTALL_DIR}/openai-root-ca.pem" \
    "${INSTALL_DIR}/openai-connectors-mtls-ca.pem" \
    "${INSTALL_DIR}/openai-client-ca-bundle.pem" \
    "${INSTALL_DIR}/PROVENANCE.md" \
    "${INSTALL_DIR}/mode.conf" \
    "${INSTALL_DIR}/mode-observe.conf" \
    "${INSTALL_DIR}/mode-enforce.conf" \
    /usr/local/libexec/skillpilot-openai-v1-mtls-verifier.py \
    /etc/systemd/system/skillpilot-openai-v1-mtls-verifier.service; do
    assert_openai_v1_mtls_secure_path \
      "${secure_file}" \
      file \
      "OpenAI mTLS security file"
  done
  echo "CHECK mtls_security_permissions PASS root-owned non-symlink artifacts"
}

assert_installed_files() {
  assert_file_hash \
    "${EXPECTED_ROOT_FILE_SHA256}" \
    "${INSTALL_DIR}/openai-root-ca.pem"
  assert_file_hash \
    "${EXPECTED_INTERMEDIATE_FILE_SHA256}" \
    "${INSTALL_DIR}/openai-connectors-mtls-ca.pem"
  assert_certificate_fingerprint \
    "${EXPECTED_ROOT_CERT_SHA256}" \
    "${INSTALL_DIR}/openai-root-ca.pem"
  assert_certificate_fingerprint \
    "${EXPECTED_INTERMEDIATE_CERT_SHA256}" \
    "${INSTALL_DIR}/openai-connectors-mtls-ca.pem"
  assert_certificate_valid_for_cutover "${INSTALL_DIR}/openai-root-ca.pem"
  assert_certificate_valid_for_cutover \
    "${INSTALL_DIR}/openai-connectors-mtls-ca.pem"
  openssl verify \
    -trusted "${INSTALL_DIR}/openai-root-ca.pem" \
    -no-CApath -no-CAstore -x509_strict \
    "${INSTALL_DIR}/openai-root-ca.pem" >/dev/null
  openssl verify \
    -trusted "${INSTALL_DIR}/openai-root-ca.pem" \
    -no-CApath -no-CAstore -x509_strict \
    "${INSTALL_DIR}/openai-connectors-mtls-ca.pem" >/dev/null

  local source_file
  local installed_file
  while IFS='|' read -r source_file installed_file; do
    if ! cmp -s "${source_file}" "${installed_file}"; then
      echo "CHECK mtls_installed_files FAIL artifact drift: ${installed_file}" >&2
      exit 1
    fi
  done <<EOF
${ROOT_DIR}/scripts/openai_v1_mtls_verifier.py|/usr/local/libexec/skillpilot-openai-v1-mtls-verifier.py
${SOURCE_DIR}/skillpilot-openai-v1-mtls-verifier.service|/etc/systemd/system/skillpilot-openai-v1-mtls-verifier.service
${ROOT_DIR}/deploy/nginx/skillpilot-openai-mtls-mode-${EXPECTED_MODE}.conf|${INSTALL_DIR}/mode.conf
${ROOT_DIR}/deploy/nginx/skillpilot-openai-mtls-mode-observe.conf|${INSTALL_DIR}/mode-observe.conf
${ROOT_DIR}/deploy/nginx/skillpilot-openai-mtls-mode-enforce.conf|${INSTALL_DIR}/mode-enforce.conf
${SOURCE_DIR}/PROVENANCE.md|${INSTALL_DIR}/PROVENANCE.md
EOF
  local bundle_expected
  bundle_expected="$(mktemp)"
  {
    sed -n '1,$p' "${SOURCE_DIR}/openai-connectors-mtls-ca.pem"
    sed -n '1,$p' "${SOURCE_DIR}/openai-root-ca.pem"
  } >"${bundle_expected}"
  if ! cmp -s "${bundle_expected}" "${INSTALL_DIR}/openai-client-ca-bundle.pem"; then
    unlink "${bundle_expected}"
    echo "CHECK mtls_installed_files FAIL installed CA bundle drift" >&2
    exit 1
  fi
  unlink "${bundle_expected}"
  echo "CHECK mtls_installed_files PASS exact reviewed artifacts"
}

assert_installed_nginx_files() {
  assert_openai_v1_mtls_secure_path \
    "$(dirname -- "${ACTIVE_NGINX_CONFIG}")" \
    directory \
    "Active Nginx configuration directory"
  local source_file
  local installed_file
  while IFS='|' read -r source_file installed_file; do
    assert_openai_v1_mtls_secure_path \
      "${installed_file}" \
      file \
      "Active OpenAI Nginx configuration"
    if ! cmp -s "${source_file}" "${installed_file}"; then
      echo "CHECK mtls_nginx_files FAIL artifact drift: ${installed_file}" >&2
      exit 1
    fi
  done <<EOF
${ROOT_DIR}/deploy/nginx/skillpilot-mcp-coaches.conf|${ACTIVE_NGINX_CONFIG}
${ROOT_DIR}/deploy/nginx/skillpilot-main-vhost-openai-deny-locations.conf|${ACTIVE_MAIN_NGINX_DENY_CONFIG}
EOF
  echo "CHECK mtls_nginx_files PASS exact reviewed Nginx artifacts"
}

assert_nginx_contract() {
  assert_installed_nginx_files
  nginx -t
  local nginx_configuration
  nginx_configuration="$(nginx -T 2>&1)"
  if ! printf '%s\n' "${nginx_configuration}" \
    | PYTHONDONTWRITEBYTECODE=1 python3 -B \
      "${ROOT_DIR}/scripts/verify_openai_v1_mtls_nginx_contract.py" \
      --expected-file "${ACTIVE_NGINX_CONFIG}" \
      --host "${MCP_HOST}" \
      --main-deny-file "${ACTIVE_MAIN_NGINX_DENY_CONFIG}" \
      --main-host "${MAIN_HOST}"; then
    echo "CHECK mtls_nginx_contract FAIL active TLS vHosts are missing, foreign, duplicated, or unprotected" >&2
    exit 1
  fi
  local required_fragment
  for required_fragment in \
    'server_name mcp-coach-v1.skillpilot.com' \
    'ssl_verify_client optional;' \
    'include /etc/skillpilot/openai-mtls/mode.conf;' \
    'proxy_pass http://127.0.0.1:8792/verify;' \
    'auth_request /_skillpilot_openai_mtls_verify;' \
    'X-SkillPilot-OpenAI-mTLS-Mode $skillpilot_openai_mtls_mode' \
    'X-SkillPilot-OpenAI-mTLS-Remote-Addr $realip_remote_addr' \
    'X-SkillPilot-OpenAI-mTLS-Client-Verify $ssl_client_verify' \
    'X-SkillPilot-OpenAI-mTLS-Client-Cert $ssl_client_escaped_cert' \
    'X-SkillPilot-OpenAI-mTLS-Classification'; do
    if ! grep -Fq "${required_fragment}" <<<"${nginx_configuration}"; then
      echo "CHECK mtls_nginx_contract FAIL missing ${required_fragment}" >&2
      exit 1
    fi
  done
  echo "CHECK mtls_nginx_contract PASS exact V1 auth_request boundary"
}

assert_invalid_public_client_certificate_rejected() {
  local temporary
  temporary="$(mktemp -d)"
  if ! openssl req \
    -x509 \
    -newkey rsa:2048 \
    -sha256 \
    -nodes \
    -days 1 \
    -subj '/CN=skillpilot-invalid-client-smoke' \
    -keyout "${temporary}/client.key" \
    -out "${temporary}/client.crt" \
    >/dev/null 2>&1; then
    rm -rf -- "${temporary}"
    echo "CHECK mtls_invalid_client_certificate FAIL fixture generation failed" >&2
    exit 1
  fi

  local result=""
  local curl_exit_code=0
  if result="$(
    curl \
      --proto '=https' \
      --tlsv1.2 \
      --connect-timeout 5 \
      --max-time 15 \
      --max-redirs 0 \
      --silent \
      --show-error \
      --cert "${temporary}/client.crt" \
      --key "${temporary}/client.key" \
      --request POST \
      --header 'Accept: application/json, text/event-stream' \
      --header 'Content-Type: application/json' \
      --data '{"jsonrpc":"2.0","id":"invalid-client-smoke","method":"initialize","params":{}}' \
      --output "${temporary}/body" \
      --write-out '%{http_code}|%{url_effective}|%{ssl_verify_result}' \
      "${MCP_URL}" 2>"${temporary}/curl.stderr"
  )"; then
    curl_exit_code=0
  else
    curl_exit_code=$?
  fi

  if [[ "${curl_exit_code}" == "0" ]]; then
    local status effective_url tls_result
    IFS='|' read -r status effective_url tls_result <<<"${result}"
    if [[ "${status}" != "403" \
      || "${effective_url}" != "${MCP_URL}" \
      || "${tls_result}" != "0" ]]; then
      rm -rf -- "${temporary}"
      echo "CHECK mtls_invalid_client_certificate FAIL expected direct HTTP 403" >&2
      exit 1
    fi
    echo "CHECK mtls_invalid_client_certificate PASS normalized HTTP 403"
  elif [[ "${curl_exit_code}" == "35" || "${curl_exit_code}" == "56" ]]; then
    echo "CHECK mtls_invalid_client_certificate PASS TLS peer rejected untrusted client certificate"
  else
    rm -rf -- "${temporary}"
    echo "CHECK mtls_invalid_client_certificate FAIL unexpected curl exit ${curl_exit_code}" >&2
    exit 1
  fi
  rm -rf -- "${temporary}"
}

assert_invalid_public_client_certificate_accepted_by_legacy_edge() {
  local temporary
  temporary="$(mktemp -d)"
  openssl req \
    -x509 -newkey rsa:2048 -sha256 -nodes -days 1 \
    -subj '/CN=skillpilot-disabled-edge-smoke' \
    -keyout "${temporary}/client.key" \
    -out "${temporary}/client.crt" >/dev/null 2>&1
  local result status effective_url tls_result
  result="$(
    curl \
      --proto '=https' --tlsv1.2 \
      --connect-timeout 5 --max-time 15 --max-redirs 0 \
      --silent --show-error \
      --cert "${temporary}/client.crt" \
      --key "${temporary}/client.key" \
      --request POST \
      --header 'Accept: application/json, text/event-stream' \
      --header 'Content-Type: application/json' \
      --data '{"jsonrpc":"2.0","id":"disabled-client-smoke","method":"initialize","params":{}}' \
      --output "${temporary}/body" \
      --write-out '%{http_code}|%{url_effective}|%{ssl_verify_result}' \
      "${MCP_URL}"
  )"
  IFS='|' read -r status effective_url tls_result <<<"${result}"
  rm -rf -- "${temporary}"
  if [[ "${status}" != "401" \
    || "${effective_url}" != "${MCP_URL}" \
    || "${tls_result}" != "0" ]]; then
    echo "CHECK mtls_disabled_edge_identity FAIL expected legacy OAuth 401 with an untrusted client cert" >&2
    exit 1
  fi
  echo "CHECK mtls_disabled_edge_identity PASS no active optional-client-cert edge"
}

if [[ "${ACTION}" == "--static" ]]; then
  run_static_checks
  exit 0
fi

if [[ "${ACTION}" == "--runtime" \
  && ! -e "${INSTALL_DIR}/mode.conf" \
  && ! -L "${INSTALL_DIR}/mode.conf" ]]; then
  if [[ "${EXPECTED_MODE}" != "disabled" ]]; then
    echo "CHECK mtls_mode FAIL an explicit disabled mode is required when no installed edge exists" >&2
    exit 1
  fi
  echo "Checking disabled pre-cutover candidate with the legacy public-edge smoke..."
  assert_backend_loopback_listener
  SKILLPILOT_PUBLIC_BASE_URL="${AUTHORIZATION_BASE_URL}" \
  SKILLPILOT_OPENAI_COACH_V1_MTLS_EDGE_MODE=disabled \
    "${ROOT_DIR}/scripts/verify_openai_v1_public_edge.sh"
  assert_invalid_public_client_certificate_accepted_by_legacy_edge
  echo "CHECK mtls_mode PASS disabled pre-cutover without an installed mTLS edge"
  exit 0
fi

resolve_live_mode
assert_installed_security_permissions
assert_installed_files
if [[ "${ACTION}" != "--staged" ]]; then
  assert_installed_nginx_files
fi

if [[ "${ACTION}" == "--staged" \
  || "${ACTION}" == "--preflight" \
  || "${ACTION}" == "--installed" ]]; then
  if [[ "${EUID}" -ne 0 ]]; then
    echo "${ACTION} must run as root to read the protected backend configuration." >&2
    exit 2
  fi
  assert_backend_mode_matches_edge
fi

assert_verifier_service
assert_verifier_decisions

if [[ "${ACTION}" == "--staged" ]]; then
  echo "CHECK mtls_staged PASS installed edge is ready; active Nginx was not required or inspected"
  exit 0
fi
if [[ "${ACTION}" == "--preflight" || "${ACTION}" == "--installed" ]]; then
  assert_nginx_contract
  if [[ "${ACTION}" == "--preflight" ]]; then
    echo "CHECK mtls_pre_reload PASS repository-bound Nginx disk contract is mode-consistent; Nginx was not reloaded"
    exit 0
  fi
fi

case "${ACTION}" in
  --local-operator)
    assert_local_operator_lane
    ;;
  --runtime)
    SKILLPILOT_PUBLIC_BASE_URL="${AUTHORIZATION_BASE_URL}" \
      SKILLPILOT_OPENAI_COACH_V1_MTLS_EDGE_MODE="${EXPECTED_MODE}" \
      "${ROOT_DIR}/scripts/verify_openai_v1_public_edge.sh"
    assert_invalid_public_client_certificate_rejected
    assert_local_operator_lane
    ;;
  --installed)
    SKILLPILOT_PUBLIC_BASE_URL="${AUTHORIZATION_BASE_URL}" \
      SKILLPILOT_OPENAI_COACH_V1_MTLS_EDGE_MODE="${EXPECTED_MODE}" \
      "${ROOT_DIR}/scripts/verify_openai_v1_public_edge.sh"
    assert_invalid_public_client_certificate_rejected
    assert_local_operator_lane
    ;;
esac
