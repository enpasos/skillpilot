#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="${ROOT_DIR}/deploy/openai-mtls"
MODE="${1:-}"
BASE_URL="${SKILLPILOT_PUBLIC_BASE_URL:-https://skillpilot.com}"
BASE_URL="${BASE_URL%/}"
EXPECTED_CLIENT_AUTHENTICATION_METHOD="${SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_AUTHENTICATION_METHOD:-client_secret_basic}"
INSTALL_DIR="/etc/skillpilot/openai-mtls"
INSTALLED_ROOT_CA="${INSTALL_DIR}/openai-root-ca.pem"
INSTALLED_INTERMEDIATE_CA="${INSTALL_DIR}/openai-connectors-mtls-ca.pem"
INSTALLED_CA_BUNDLE="${INSTALL_DIR}/openai-client-ca-bundle.pem"
INSTALLED_VERIFIER="/usr/local/libexec/skillpilot-openai-mtls-verifier.py"
INSTALLED_UNIT="/etc/systemd/system/skillpilot-openai-mtls-verifier.service"
INSTALLED_NGINX_SNIPPET="/etc/nginx/snippets/skillpilot-openai-de-mtls.conf"

case "${MODE}" in
  ""|--pre-restart|--runtime|--installed)
    ;;
  *)
    echo "Usage: $0 [--pre-restart|--runtime|--installed]" >&2
    exit 2
    ;;
esac

case "${EXPECTED_CLIENT_AUTHENTICATION_METHOD}" in
  client_secret_basic|none|private_key_jwt)
    ;;
  *)
    echo "CHECK oauth_profile FAIL unsupported client authentication method: ${EXPECTED_CLIENT_AUTHENTICATION_METHOD}" >&2
    exit 2
    ;;
esac

expected_root="3a565b5c83c83ba2de085de28733e3c6af01af9b347322b93caf3a03d42c5cbe"
expected_intermediate="7485f98dfbb7db119ca99d5748ac7a86baa73ddede878d3263a50cba2c4f6dd8"
expected_root_cert="493d9a1edc48d558f5a28764b20605205a50e1df4840231e342f2e0e8cdd5be9"
expected_intermediate_cert="da3d8e2e32ee4981ea1152c1456f866c863dbde2fbf4f8eba8850df74b656816"

assert_hash() {
  local expected="$1"
  local file="$2"
  local actual
  actual="$(sha256sum "${file}" | awk '{print $1}')"
  [[ "${actual}" == "${expected}" ]] || {
    echo "CHECK ca_hash FAIL ${file}: ${actual}" >&2
    exit 1
  }
}

assert_certificate_fingerprint() {
  local expected="$1"
  local file="$2"
  local actual
  actual="$(openssl x509 -in "${file}" -outform DER \
    | sha256sum | awk '{print $1}')"
  [[ "${actual}" == "${expected}" ]] || {
    echo "CHECK certificate_fingerprint FAIL ${file}: ${actual}" >&2
    exit 1
  }
}

assert_http() {
  local expected="$1"
  local url="$2"
  local actual
  if ! actual="$(
    curl \
      --connect-timeout 5 \
      --max-time 15 \
      --silent \
      --show-error \
      -o /dev/null \
      -w '%{http_code}' \
      "${url}"
  )"; then
    echo "CHECK http FAIL ${url}: request failed" >&2
    exit 1
  fi
  [[ "${actual}" == "${expected}" ]] || {
    echo "CHECK http FAIL ${url}: expected ${expected}, got ${actual}" >&2
    exit 1
  }
  echo "CHECK http PASS ${actual} ${url}"
}

assert_same_file() {
  local label="$1"
  local expected="$2"
  local installed="$3"
  if [[ ! -r "${installed}" ]]; then
    echo "CHECK ${label} FAIL missing or unreadable ${installed}" >&2
    exit 1
  fi
  if ! cmp -s "${expected}" "${installed}"; then
    echo "CHECK ${label} FAIL installed artifact differs from ${expected}" >&2
    exit 1
  fi
  echo "CHECK ${label} PASS ${installed}"
}

assert_installed_ca_bundle() {
  local expected_hash
  local installed_hash
  if [[ ! -r "${INSTALLED_CA_BUNDLE}" ]]; then
    echo "CHECK installed_ca_bundle FAIL missing or unreadable ${INSTALLED_CA_BUNDLE}" >&2
    exit 1
  fi
  expected_hash="$(
    {
      cat "${SOURCE_DIR}/openai-connectors-mtls-ca.pem"
      cat "${SOURCE_DIR}/openai-root-ca.pem"
    } | sha256sum | awk '{print $1}'
  )"
  installed_hash="$(
    sha256sum "${INSTALLED_CA_BUNDLE}" | awk '{print $1}'
  )"
  if [[ "${installed_hash}" != "${expected_hash}" ]]; then
    echo "CHECK installed_ca_bundle FAIL expected ${expected_hash}, got ${installed_hash}" >&2
    exit 1
  fi
  echo "CHECK installed_ca_bundle PASS ${INSTALLED_CA_BUNDLE}"
}

assert_installed_artifacts() {
  assert_same_file \
    installed_root_ca \
    "${SOURCE_DIR}/openai-root-ca.pem" \
    "${INSTALLED_ROOT_CA}"
  assert_same_file \
    installed_intermediate_ca \
    "${SOURCE_DIR}/openai-connectors-mtls-ca.pem" \
    "${INSTALLED_INTERMEDIATE_CA}"
  assert_installed_ca_bundle
  assert_same_file \
    installed_verifier \
    "${ROOT_DIR}/scripts/openai_mtls_verifier.py" \
    "${INSTALLED_VERIFIER}"
  assert_same_file \
    installed_verifier_unit \
    "${SOURCE_DIR}/skillpilot-openai-mtls-verifier.service" \
    "${INSTALLED_UNIT}"
  assert_same_file \
    installed_nginx_snippet \
    "${SOURCE_DIR}/skillpilot-openai-de-mtls.nginx.conf" \
    "${INSTALLED_NGINX_SNIPPET}"
  echo "CHECK installed_artifacts PASS"
}

assert_discovery_document() {
  local kind="$1"
  local url="$2"
  local response
  if ! response="$(
    curl \
      --fail \
      --silent \
      --show-error \
      --connect-timeout 5 \
      --max-time 15 \
      "${url}"
  )"; then
    echo "CHECK oauth_metadata FAIL ${url}: request failed" >&2
    exit 1
  fi

  if [[ "${kind}" == "authorization-server" ]]; then
    if ! printf '%s' "${response}" \
      | PYTHONDONTWRITEBYTECODE=1 python3 -B \
        "${ROOT_DIR}/scripts/validate_openai_oauth_metadata.py" \
        --kind "${kind}" \
        --base-url "${BASE_URL}" \
        --required-client-authentication-method \
        "${EXPECTED_CLIENT_AUTHENTICATION_METHOD}"; then
      echo "CHECK oauth_metadata FAIL ${url}: invalid semantics" >&2
      exit 1
    fi
  elif ! printf '%s' "${response}" \
    | PYTHONDONTWRITEBYTECODE=1 python3 -B \
      "${ROOT_DIR}/scripts/validate_openai_oauth_metadata.py" \
      --kind "${kind}" \
      --base-url "${BASE_URL}"; then
    echo "CHECK oauth_metadata FAIL ${url}: invalid semantics" >&2
    exit 1
  fi
  echo "CHECK oauth_metadata PASS ${url}"
}

assert_loopback_listener() {
  local port="$1"
  local label="$2"
  local listeners
  listeners="$(ss -ltnH | awk -v suffix=":${port}" '$4 ~ suffix "$" {print $4}')"
  [[ -n "${listeners}" ]] || {
    echo "CHECK ${label} FAIL no listener on port ${port}" >&2
    exit 1
  }
  while IFS= read -r address; do
    case "${address}" in
      "127.0.0.1:${port}"|"[::1]:${port}"|"::1:${port}")
        ;;
      *)
        echo "CHECK ${label} FAIL non-loopback listener ${address}" >&2
        exit 1
        ;;
    esac
  done <<<"${listeners}"
  echo "CHECK ${label} PASS ${listeners//$'\n'/,}"
}

if [[ "${MODE}" != "--runtime" ]]; then
  assert_hash "${expected_root}" "${SOURCE_DIR}/openai-root-ca.pem"
  assert_hash "${expected_intermediate}" "${SOURCE_DIR}/openai-connectors-mtls-ca.pem"
  assert_certificate_fingerprint \
    "${expected_root_cert}" \
    "${SOURCE_DIR}/openai-root-ca.pem"
  assert_certificate_fingerprint \
    "${expected_intermediate_cert}" \
    "${SOURCE_DIR}/openai-connectors-mtls-ca.pem"
  openssl verify \
    -CAfile "${SOURCE_DIR}/openai-root-ca.pem" \
    "${SOURCE_DIR}/openai-connectors-mtls-ca.pem" >/dev/null
  PYTHONDONTWRITEBYTECODE=1 python3 -B -m unittest -v \
    "${ROOT_DIR}/scripts/test_openai_mtls_edge.py"
  PYTHONDONTWRITEBYTECODE=1 python3 -B - \
    "${ROOT_DIR}/scripts/openai_mtls_verifier.py" \
    "${ROOT_DIR}/scripts/test_openai_mtls_edge.py" \
    "${ROOT_DIR}/scripts/validate_openai_oauth_metadata.py" <<'PY'
from pathlib import Path
import sys

for raw_path in sys.argv[1:]:
    path = Path(raw_path)
    compile(path.read_text(encoding="utf-8"), str(path), "exec")
PY
  echo "CHECK static_contract PASS"
fi

if [[ -z "${MODE}" ]]; then
  exit 0
fi

if [[ "${MODE}" == "--pre-restart" || "${MODE}" == "--installed" ]]; then
  assert_installed_artifacts
fi

systemctl is-active --quiet skillpilot-openai-mtls-verifier.service
echo "CHECK verifier_service PASS active"

if [[ "${MODE}" == "--installed" ]]; then
  nginx -t
  nginx_config="$(nginx -T 2>&1)"
  grep -Fq "skillpilot-openai-de-mtls.conf" <<<"${nginx_config}" || {
    echo "CHECK nginx_include FAIL mTLS snippet is not active" >&2
    exit 1
  }
  echo "CHECK nginx_include PASS active"
fi

assert_loopback_listener 8792 verifier_loopback

assert_http 403 "${BASE_URL}/api/openai/de/mcp"

if [[ "${MODE}" == "--pre-restart" ]]; then
  echo "CHECK pre-restart_edge PASS"
  exit 0
fi

assert_loopback_listener 8787 backend_loopback
assert_discovery_document protected-resource \
  "${BASE_URL}/.well-known/oauth-protected-resource/api/openai/de/mcp"
assert_discovery_document authorization-server \
  "${BASE_URL}/.well-known/oauth-authorization-server/api/openai/de"
echo "CHECK ${MODE#--}_edge PASS"
