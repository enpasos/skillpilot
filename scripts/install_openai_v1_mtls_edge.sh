#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "${ROOT_DIR}/scripts/lib/openai_v1_mtls_mode.sh"
SOURCE_DIR="${ROOT_DIR}/deploy/openai-mtls"
NGINX_SOURCE_DIR="${ROOT_DIR}/deploy/nginx"
INSTALL_DIR="/etc/skillpilot/openai-mtls"
VERIFIER_TARGET="/usr/local/libexec/skillpilot-openai-v1-mtls-verifier.py"
UNIT_TARGET="/etc/systemd/system/skillpilot-openai-v1-mtls-verifier.service"
SERVICE_NAME="skillpilot-openai-v1-mtls-verifier.service"
SERVICE_ENV_FILE="${SKILLPILOT_SERVICE_ENV_FILE:-/etc/skillpilot/skillpilot.env}"

EXPECTED_ROOT_FILE_SHA256="3a565b5c83c83ba2de085de28733e3c6af01af9b347322b93caf3a03d42c5cbe"
EXPECTED_INTERMEDIATE_FILE_SHA256="7485f98dfbb7db119ca99d5748ac7a86baa73ddede878d3263a50cba2c4f6dd8"
EXPECTED_ROOT_CERT_SHA256="493d9a1edc48d558f5a28764b20605205a50e1df4840231e342f2e0e8cdd5be9"
EXPECTED_INTERMEDIATE_CERT_SHA256="da3d8e2e32ee4981ea1152c1456f866c863dbde2fbf4f8eba8850df74b656816"
CA_MINIMUM_REMAINING_SECONDS="7776000"

usage() {
  cat <<'EOF'
Usage: sudo ./scripts/install_openai_v1_mtls_edge.sh --mode <observe|enforce>
       [--service-environment-file /absolute/path]

Installs the reviewed OpenAI CA bundle, loopback certificate verifier, systemd
unit, and the explicitly selected root-owned Nginx mode file. It never edits,
tests, or reloads the active Nginx configuration.
EOF
}

MODE=""
while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --mode)
      if [[ "$#" -lt 2 ]]; then
        echo "--mode requires observe or enforce." >&2
        usage >&2
        exit 2
      fi
      MODE="$2"
      shift 2
      ;;
    --mode=*)
      MODE="${1#*=}"
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

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this installer as root (sudo)." >&2
  exit 2
fi
if [[ "${MODE}" != "observe" && "${MODE}" != "enforce" ]]; then
  echo "An explicit --mode observe or --mode enforce is required." >&2
  exit 2
fi
if [[ "${SERVICE_ENV_FILE}" != /* ]]; then
  echo "--service-environment-file must be absolute." >&2
  exit 2
fi

for command_name in curl install mv openssl python3 sha256sum ss stat systemctl; do
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    echo "Required command is unavailable: ${command_name}" >&2
    exit 1
  fi
done

ROOT_CA="${SOURCE_DIR}/openai-root-ca.pem"
INTERMEDIATE_CA="${SOURCE_DIR}/openai-connectors-mtls-ca.pem"
MODE_SOURCE="${NGINX_SOURCE_DIR}/skillpilot-openai-mtls-mode-${MODE}.conf"

assert_regular_source() {
  local file="$1"
  if [[ ! -f "${file}" || -L "${file}" ]]; then
    echo "Required reviewed source is missing or not a regular file: ${file}" >&2
    exit 1
  fi
}

assert_file_hash() {
  local expected="$1"
  local file="$2"
  local actual
  actual="$(sha256sum "${file}" | awk '{print $1}')"
  if [[ "${actual}" != "${expected}" ]]; then
    echo "Unexpected SHA-256 for ${file}: ${actual}" >&2
    exit 1
  fi
}

assert_certificate_fingerprint() {
  local expected="$1"
  local file="$2"
  local actual
  actual="$(openssl x509 -in "${file}" -outform DER | sha256sum | awk '{print $1}')"
  if [[ "${actual}" != "${expected}" ]]; then
    echo "Unexpected X.509 SHA-256 fingerprint for ${file}: ${actual}" >&2
    exit 1
  fi
}

assert_certificate_valid_for_cutover() {
  local file="$1"
  if ! openssl x509 \
    -checkend "${CA_MINIMUM_REMAINING_SECONDS}" \
    -noout \
    -in "${file}" >/dev/null; then
    echo "Certificate expires within 90 days: ${file}" >&2
    exit 1
  fi
}

assert_existing_secure_target() {
  local path="$1"
  local expected_kind="$2"
  local label="$3"
  if [[ -e "${path}" || -L "${path}" ]]; then
    assert_openai_v1_mtls_secure_path "${path}" "${expected_kind}" "${label}"
  fi
}

assert_regular_source "${ROOT_CA}"
assert_regular_source "${INTERMEDIATE_CA}"
assert_regular_source "${SOURCE_DIR}/PROVENANCE.md"
assert_regular_source "${SOURCE_DIR}/skillpilot-openai-v1-mtls-verifier.service"
assert_regular_source "${ROOT_DIR}/scripts/openai_v1_mtls_verifier.py"
assert_regular_source "${MODE_SOURCE}"
assert_regular_source "${NGINX_SOURCE_DIR}/skillpilot-openai-mtls-mode-observe.conf"
assert_regular_source "${NGINX_SOURCE_DIR}/skillpilot-openai-mtls-mode-enforce.conf"

assert_file_hash "${EXPECTED_ROOT_FILE_SHA256}" "${ROOT_CA}"
assert_file_hash "${EXPECTED_INTERMEDIATE_FILE_SHA256}" "${INTERMEDIATE_CA}"
assert_certificate_fingerprint "${EXPECTED_ROOT_CERT_SHA256}" "${ROOT_CA}"
assert_certificate_fingerprint \
  "${EXPECTED_INTERMEDIATE_CERT_SHA256}" \
  "${INTERMEDIATE_CA}"
openssl verify -trusted "${ROOT_CA}" -no-CApath -no-CAstore -x509_strict \
  "${ROOT_CA}" >/dev/null
openssl verify -trusted "${ROOT_CA}" -no-CApath -no-CAstore -x509_strict \
  "${INTERMEDIATE_CA}" >/dev/null
assert_certificate_valid_for_cutover "${ROOT_CA}"
assert_certificate_valid_for_cutover "${INTERMEDIATE_CA}"

assert_openai_v1_mtls_secure_path \
  "$(dirname -- "${SERVICE_ENV_FILE}")" \
  directory \
  "Backend EnvironmentFile directory"
assert_openai_v1_mtls_secret_file \
  "${SERVICE_ENV_FILE}" \
  "Backend EnvironmentFile"
assert_existing_secure_target \
  "${INSTALL_DIR}" \
  directory \
  "OpenAI mTLS security directory"
for secure_target in \
  "${INSTALL_DIR}/openai-root-ca.pem" \
  "${INSTALL_DIR}/openai-connectors-mtls-ca.pem" \
  "${INSTALL_DIR}/openai-client-ca-bundle.pem" \
  "${INSTALL_DIR}/PROVENANCE.md" \
  "${INSTALL_DIR}/mode.conf" \
  "${INSTALL_DIR}/mode-observe.conf" \
  "${INSTALL_DIR}/mode-enforce.conf" \
  "${VERIFIER_TARGET}" \
  "${UNIT_TARGET}"; do
  assert_existing_secure_target \
    "${secure_target}" \
    file \
    "Existing OpenAI mTLS security file"
done

backend_mode="$(read_openai_v1_mtls_backend_mode "${SERVICE_ENV_FILE}")"
if [[ "${backend_mode}" != "${MODE}" ]]; then
  echo "Backend/Nginx mTLS mode drift: EnvironmentFile=${backend_mode}, requested edge=${MODE}" >&2
  exit 1
fi
echo "CHECK mtls_mode_preinstall PASS backend=${backend_mode} requested_edge=${MODE}"

expected_mode_directive='set $skillpilot_openai_mtls_mode '"${MODE}"';'
if [[ "$(grep -Ec '^[[:space:]]*set[[:space:]]+\$skillpilot_openai_mtls_mode[[:space:]]+(observe|enforce);[[:space:]]*$' "${MODE_SOURCE}")" != "1" ]] \
  || ! grep -Fqx "${expected_mode_directive}" "${MODE_SOURCE}"; then
  echo "Nginx mode source does not contain the exact ${MODE} directive: ${MODE_SOURCE}" >&2
  exit 1
fi

install -d -o root -g root -m 0755 \
  "${INSTALL_DIR}" \
  /usr/local/libexec \
  /etc/systemd/system
install -o root -g root -m 0644 "${ROOT_CA}" "${INSTALL_DIR}/openai-root-ca.pem"
install -o root -g root -m 0644 \
  "${INTERMEDIATE_CA}" \
  "${INSTALL_DIR}/openai-connectors-mtls-ca.pem"
install -o root -g root -m 0644 \
  "${SOURCE_DIR}/PROVENANCE.md" \
  "${INSTALL_DIR}/PROVENANCE.md"

bundle_temporary="$(mktemp "${INSTALL_DIR}/.openai-client-ca-bundle.pem.XXXXXX")"
mode_temporary="$(mktemp "${INSTALL_DIR}/.mode.conf.XXXXXX")"
cleanup_temporary() {
  if [[ -n "${bundle_temporary:-}" && -e "${bundle_temporary}" ]]; then
    unlink "${bundle_temporary}"
  fi
  if [[ -n "${mode_temporary:-}" && -e "${mode_temporary}" ]]; then
    unlink "${mode_temporary}"
  fi
}
trap cleanup_temporary EXIT

{
  sed -n '1,$p' "${INTERMEDIATE_CA}"
  sed -n '1,$p' "${ROOT_CA}"
} >"${bundle_temporary}"
chown root:root "${bundle_temporary}"
chmod 0644 "${bundle_temporary}"
mv -f "${bundle_temporary}" "${INSTALL_DIR}/openai-client-ca-bundle.pem"
bundle_temporary=""

install -o root -g root -m 0644 "${MODE_SOURCE}" "${mode_temporary}"
mv -f "${mode_temporary}" "${INSTALL_DIR}/mode.conf"
mode_temporary=""
install -o root -g root -m 0644 \
  "${NGINX_SOURCE_DIR}/skillpilot-openai-mtls-mode-observe.conf" \
  "${INSTALL_DIR}/mode-observe.conf"
install -o root -g root -m 0644 \
  "${NGINX_SOURCE_DIR}/skillpilot-openai-mtls-mode-enforce.conf" \
  "${INSTALL_DIR}/mode-enforce.conf"

install -o root -g root -m 0755 \
  "${ROOT_DIR}/scripts/openai_v1_mtls_verifier.py" \
  "${VERIFIER_TARGET}"
install -o root -g root -m 0644 \
  "${SOURCE_DIR}/skillpilot-openai-v1-mtls-verifier.service" \
  "${UNIT_TARGET}"

systemctl daemon-reload
systemctl enable "${SERVICE_NAME}"
systemctl restart "${SERVICE_NAME}"

"${ROOT_DIR}/scripts/verify_openai_v1_mtls_edge.sh" \
  --staged \
  --expected-mode "${MODE}" \
  --service-environment-file "${SERVICE_ENV_FILE}"

cat <<EOF

Installed the OpenAI Coach V1 mTLS verifier in ${MODE} mode.

No active Nginx file was edited or reloaded. The dedicated V1 TLS server must:
  include ${INSTALL_DIR}/mode.conf;
  trust ${INSTALL_DIR}/openai-client-ca-bundle.pem;
  call http://127.0.0.1:8792/verify only through an internal auth_request;
  protect exactly https://mcp-coach-v1.skillpilot.com/mcp.

Next, validate the reviewed Nginx configuration, reload it, and run:
  sudo ./scripts/verify_openai_v1_mtls_edge.sh --preflight
  sudo ./scripts/verify_openai_v1_mtls_edge.sh --installed --expected-mode ${MODE}
  ./scripts/verify_openai_v1_mtls_edge.sh --runtime --expected-mode ${MODE}

The only positive certificate smoke uses a real ChatGPT connection. The local
no-certificate OAuth smoke is restricted to a direct loopback operator request:
  ./scripts/verify_openai_v1_mtls_edge.sh --local-operator --expected-mode ${MODE}
EOF
