#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="${ROOT_DIR}/deploy/openai-mtls"
MODE="${1:-}"
BASE_URL="${SKILLPILOT_PUBLIC_BASE_URL:-https://skillpilot.com}"

case "${MODE}" in
  ""|--runtime|--installed)
    ;;
  *)
    echo "Usage: $0 [--runtime|--installed]" >&2
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
  if ! actual="$(curl -sS -o /dev/null -w '%{http_code}' "${url}")"; then
    echo "CHECK http FAIL ${url}: request failed" >&2
    exit 1
  fi
  [[ "${actual}" == "${expected}" ]] || {
    echo "CHECK http FAIL ${url}: expected ${expected}, got ${actual}" >&2
    exit 1
  }
  echo "CHECK http PASS ${actual} ${url}"
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
    "${ROOT_DIR}/scripts/test_openai_mtls_edge.py" <<'PY'
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

assert_loopback_listener 8787 backend_loopback
assert_loopback_listener 8792 verifier_loopback

assert_http 403 "${BASE_URL}/api/openai/de/mcp"
assert_http 200 \
  "${BASE_URL}/.well-known/oauth-protected-resource/api/openai/de/mcp"
assert_http 200 \
  "${BASE_URL}/api/openai/de/.well-known/oauth-authorization-server"
echo "CHECK ${MODE#--}_edge PASS"
