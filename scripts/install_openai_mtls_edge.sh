#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this installer as root (sudo)." >&2
  exit 2
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="${ROOT_DIR}/deploy/openai-mtls"
INSTALL_DIR="/etc/skillpilot/openai-mtls"
V1_NGINX_SNIPPET="/etc/nginx/snippets/skillpilot-openai-de-v1-edge.conf"
OBSOLETE_NGINX_SNIPPET="/etc/nginx/snippets/skillpilot-openai-de-mtls.conf"
VERIFIER="/usr/local/libexec/skillpilot-openai-mtls-verifier.py"
UNIT="/etc/systemd/system/skillpilot-openai-mtls-verifier.service"

expected_root="3a565b5c83c83ba2de085de28733e3c6af01af9b347322b93caf3a03d42c5cbe"
expected_intermediate="7485f98dfbb7db119ca99d5748ac7a86baa73ddede878d3263a50cba2c4f6dd8"
expected_root_cert="493d9a1edc48d558f5a28764b20605205a50e1df4840231e342f2e0e8cdd5be9"
expected_intermediate_cert="da3d8e2e32ee4981ea1152c1456f866c863dbde2fbf4f8eba8850df74b656816"

verify_hash() {
  local expected="$1"
  local file="$2"
  local actual
  actual="$(sha256sum "${file}" | awk '{print $1}')"
  if [[ "${actual}" != "${expected}" ]]; then
    echo "Unexpected SHA-256 for ${file}: ${actual}" >&2
    exit 1
  fi
}

verify_certificate_fingerprint() {
  local expected="$1"
  local file="$2"
  local actual
  actual="$(openssl x509 -in "${file}" -outform DER \
    | sha256sum | awk '{print $1}')"
  if [[ "${actual}" != "${expected}" ]]; then
    echo "Unexpected X.509 SHA-256 fingerprint for ${file}: ${actual}" >&2
    exit 1
  fi
}

verify_hash "${expected_root}" "${SOURCE_DIR}/openai-root-ca.pem"
verify_hash "${expected_intermediate}" "${SOURCE_DIR}/openai-connectors-mtls-ca.pem"
verify_certificate_fingerprint \
  "${expected_root_cert}" \
  "${SOURCE_DIR}/openai-root-ca.pem"
verify_certificate_fingerprint \
  "${expected_intermediate_cert}" \
  "${SOURCE_DIR}/openai-connectors-mtls-ca.pem"
openssl verify \
  -CAfile "${SOURCE_DIR}/openai-root-ca.pem" \
  "${SOURCE_DIR}/openai-connectors-mtls-ca.pem"

if nginx -T 2>&1 | grep -Fq "${OBSOLETE_NGINX_SNIPPET}"; then
  echo "Remove the obsolete include ${OBSOLETE_NGINX_SNIPPET} from the skillpilot.com TLS server block, validate nginx, and rerun this installer." >&2
  exit 1
fi
if [[ -e "${OBSOLETE_NGINX_SNIPPET}" ]]; then
  rm -f -- "${OBSOLETE_NGINX_SNIPPET}"
  echo "Removed obsolete MCP compatibility snippet ${OBSOLETE_NGINX_SNIPPET}."
fi

install -d -m 0755 "${INSTALL_DIR}" /etc/nginx/snippets /usr/local/libexec
install -m 0644 "${SOURCE_DIR}/openai-root-ca.pem" "${INSTALL_DIR}/"
install -m 0644 \
  "${SOURCE_DIR}/openai-connectors-mtls-ca.pem" \
  "${INSTALL_DIR}/"
install -m 0644 "${SOURCE_DIR}/PROVENANCE.md" "${INSTALL_DIR}/"
PYTHONDONTWRITEBYTECODE=1 python3 -B - "${INSTALL_DIR}" <<'PY'
from pathlib import Path
import os
import sys

directory = Path(sys.argv[1])
bundle = directory / "openai-client-ca-bundle.pem"
temporary = directory / ".openai-client-ca-bundle.pem.tmp"
temporary.write_text(
    (directory / "openai-connectors-mtls-ca.pem").read_text(encoding="utf-8")
    + (directory / "openai-root-ca.pem").read_text(encoding="utf-8"),
    encoding="utf-8",
)
os.chmod(temporary, 0o644)
temporary.replace(bundle)
PY

install -m 0755 "${ROOT_DIR}/scripts/openai_mtls_verifier.py" "${VERIFIER}"
install -m 0644 \
  "${SOURCE_DIR}/skillpilot-openai-mtls-verifier.service" \
  "${UNIT}"
install -m 0644 \
  "${SOURCE_DIR}/skillpilot-openai-de-v1-edge.nginx.conf" \
  "${V1_NGINX_SNIPPET}"
systemctl daemon-reload
systemctl enable skillpilot-openai-mtls-verifier.service
systemctl restart skillpilot-openai-mtls-verifier.service

echo
echo "Installed and started the local verifier."
echo "Next: configure DNS and TLS for mcp-v1.skillpilot.com, then include this"
echo "line inside that host's TLS server block:"
echo "  include ${V1_NGINX_SNIPPET};"
echo
echo "Also set in /etc/skillpilot/skillpilot.env:"
echo "  SERVER_ADDRESS=127.0.0.1"
echo "  SKILLPILOT_OPENAI_DE_MTLS_EDGE_ENABLED=true"
echo "  SKILLPILOT_OPENAI_APPS_CHALLENGE=<value from OpenAI app management>"
echo "  SKILLPILOT_OPENAI_DE_V1_PUBLIC_EDGE_SMOKE_ENABLED=true"
echo
echo "The canonical V1 public URLs are built-in defaults; do not duplicate them"
echo "in skillpilot.env. The Git commit is embedded in the backend artifact."
echo
echo "Then run: nginx -t && systemctl reload nginx && systemctl restart skillpilot"
echo "Finally run: scripts/verify_openai_mtls_edge.sh --installed"
