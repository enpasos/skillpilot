#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
V1_ORIGIN="${SKILLPILOT_OPENAI_DE_V1_ORIGIN:-https://mcp-v1.skillpilot.com}"
V1_ORIGIN="${V1_ORIGIN%/}"
AUTHORIZATION_ORIGIN="${SKILLPILOT_PUBLIC_BASE_URL:-https://skillpilot.com}"
AUTHORIZATION_ORIGIN="${AUTHORIZATION_ORIGIN%/}"
EXPECTED_RESOURCE="${SKILLPILOT_OPENAI_DE_OAUTH_RESOURCE:-${V1_ORIGIN}}"
EXPECTED_RESOURCE="${EXPECTED_RESOURCE%/}"
EXPECTED_CHALLENGE="${SKILLPILOT_OPENAI_APPS_CHALLENGE:-}"
MTLS_ENABLED="${SKILLPILOT_OPENAI_DE_MTLS_EDGE_ENABLED:-false}"
MTLS_CERT="${SKILLPILOT_OPENAI_DE_PUBLIC_SMOKE_MTLS_CERT:-}"
MTLS_KEY="${SKILLPILOT_OPENAI_DE_PUBLIC_SMOKE_MTLS_KEY:-}"
METADATA_URL="${V1_ORIGIN}/.well-known/oauth-protected-resource"
CHALLENGE_URL="${V1_ORIGIN}/.well-known/openai-apps-challenge"
MCP_URL="${V1_ORIGIN}/mcp"

validate_https_origin() {
  local label="$1"
  local value="$2"
  PYTHONDONTWRITEBYTECODE=1 python3 -B - "${label}" "${value}" <<'PY'
import sys
from urllib.parse import urlsplit

label, value = sys.argv[1:]
parsed = urlsplit(value)
if (
    parsed.scheme != "https"
    or not parsed.hostname
    or parsed.path
    or parsed.query
    or parsed.fragment
    or parsed.username
    or parsed.password
):
    raise SystemExit(f"{label} must be an HTTPS origin without path or credentials: {value}")
PY
}

case "${MTLS_ENABLED}" in
  true|false)
    ;;
  *)
    echo "CHECK public_edge_configuration FAIL SKILLPILOT_OPENAI_DE_MTLS_EDGE_ENABLED must be true or false" >&2
    exit 2
    ;;
esac

if [[ -n "${MTLS_CERT}" || -n "${MTLS_KEY}" ]]; then
  if [[ -z "${MTLS_CERT}" || -z "${MTLS_KEY}" ]]; then
    echo "CHECK public_edge_configuration FAIL both public-smoke mTLS paths are required" >&2
    exit 2
  fi
  if [[ ! -r "${MTLS_CERT}" || ! -r "${MTLS_KEY}" ]]; then
    echo "CHECK public_edge_configuration FAIL public-smoke mTLS files are not readable" >&2
    exit 2
  fi
fi

validate_https_origin "V1 origin" "${V1_ORIGIN}"
validate_https_origin "OAuth resource" "${EXPECTED_RESOURCE}"
validate_https_origin "authorization origin" "${AUTHORIZATION_ORIGIN}"
if [[ "${EXPECTED_RESOURCE}" != "${V1_ORIGIN}" ]]; then
  echo "CHECK public_edge_configuration FAIL OAuth resource must equal the V1 MCP origin" >&2
  exit 2
fi

temporary_dir="$(mktemp -d)"
trap 'rm -rf "${temporary_dir}"' EXIT

curl_common=(
  curl
  --proto '=https'
  --tlsv1.2
  --connect-timeout 5
  --max-time 15
  --max-redirs 0
  --silent
  --show-error
)

request_result="$(
  "${curl_common[@]}" \
    --dump-header "${temporary_dir}/metadata.headers" \
    --output "${temporary_dir}/metadata.json" \
    --write-out '%{http_code}|%{url_effective}|%{ssl_verify_result}' \
    "${METADATA_URL}"
)"
IFS='|' read -r metadata_status metadata_effective_url tls_verify_result \
  <<<"${request_result}"
if [[ "${metadata_status}" != "200" ]]; then
  echo "CHECK public_edge_metadata FAIL expected HTTP 200, got ${metadata_status}" >&2
  exit 1
fi
if [[ "${metadata_effective_url}" != "${METADATA_URL}" ]]; then
  echo "CHECK public_edge_no_redirect FAIL expected ${METADATA_URL}, got ${metadata_effective_url}" >&2
  exit 1
fi
if [[ "${tls_verify_result}" != "0" ]]; then
  echo "CHECK public_edge_tls FAIL certificate verification result ${tls_verify_result}" >&2
  exit 1
fi
echo "CHECK public_edge_tls PASS ${V1_ORIGIN}"
echo "CHECK public_edge_no_redirect PASS ${METADATA_URL}"

if ! PYTHONDONTWRITEBYTECODE=1 python3 -B \
  "${ROOT_DIR}/scripts/validate_openai_oauth_metadata.py" \
  --kind protected-resource \
  --base-url "${V1_ORIGIN}" \
  --expected-resource "${EXPECTED_RESOURCE}" \
  --authorization-base-url "${AUTHORIZATION_ORIGIN}" \
  <"${temporary_dir}/metadata.json"; then
  echo "CHECK public_edge_metadata FAIL invalid protected-resource document" >&2
  exit 1
fi
echo "CHECK public_edge_metadata PASS ${METADATA_URL}"

if [[ -n "${EXPECTED_CHALLENGE}" ]]; then
  challenge_result="$(
    "${curl_common[@]}" \
      --output "${temporary_dir}/challenge.txt" \
      --write-out '%{http_code}|%{url_effective}' \
      "${CHALLENGE_URL}"
  )"
  IFS='|' read -r challenge_status challenge_effective_url \
    <<<"${challenge_result}"
  if [[ "${challenge_status}" != "200" \
    || "${challenge_effective_url}" != "${CHALLENGE_URL}" ]]; then
    echo "CHECK openai_apps_challenge FAIL expected direct HTTP 200" >&2
    exit 1
  fi
  challenge_body="$(<"${temporary_dir}/challenge.txt")"
  if [[ "${challenge_body}" != "${EXPECTED_CHALLENGE}" ]]; then
    echo "CHECK openai_apps_challenge FAIL response does not match configured value" >&2
    exit 1
  fi
  echo "CHECK openai_apps_challenge PASS configured value matches"
else
  echo "CHECK openai_apps_challenge SKIP no expected challenge configured"
fi

mcp_curl=("${curl_common[@]}")
if [[ -n "${MTLS_CERT}" ]]; then
  mcp_curl+=(--cert "${MTLS_CERT}" --key "${MTLS_KEY}")
fi
mcp_result="$(
  "${mcp_curl[@]}" \
    --request POST \
    --header 'Accept: application/json, text/event-stream' \
    --header 'Content-Type: application/json' \
    --data '{"jsonrpc":"2.0","id":"public-edge-smoke","method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"skillpilot-public-edge-smoke","version":"1"}}}' \
    --dump-header "${temporary_dir}/mcp.headers" \
    --output "${temporary_dir}/mcp.body" \
    --write-out '%{http_code}|%{url_effective}' \
    "${MCP_URL}"
)"
IFS='|' read -r mcp_status mcp_effective_url <<<"${mcp_result}"
if [[ "${mcp_effective_url}" != "${MCP_URL}" ]]; then
  echo "CHECK public_mcp_no_redirect FAIL expected ${MCP_URL}, got ${mcp_effective_url}" >&2
  exit 1
fi
echo "CHECK public_mcp_no_redirect PASS ${MCP_URL}"

if [[ "${MTLS_ENABLED}" == "true" && -z "${MTLS_CERT}" ]]; then
  if [[ "${mcp_status}" != "403" ]]; then
    echo "CHECK public_mcp_mtls_gate FAIL expected HTTP 403 without client certificate, got ${mcp_status}" >&2
    exit 1
  fi
  echo "CHECK public_mcp_mtls_gate PASS HTTP 403 without client certificate"
  echo "CHECK public_mcp_oauth_challenge SKIP provide public-smoke mTLS certificate paths to cross the mTLS gate"
  exit 0
fi

if [[ "${mcp_status}" != "401" ]]; then
  echo "CHECK public_mcp_oauth_challenge FAIL expected HTTP 401, got ${mcp_status}" >&2
  exit 1
fi
www_authenticate="$(
  tr -d '\r' <"${temporary_dir}/mcp.headers" \
    | awk 'tolower($0) ~ /^www-authenticate:/ { sub(/^[^:]*:[[:space:]]*/, ""); value = $0 } END { print value }'
)"
if [[ "${www_authenticate}" != Bearer* \
  || "${www_authenticate}" != *"resource_metadata=\"${METADATA_URL}\""* ]]; then
  echo "CHECK public_mcp_oauth_challenge FAIL missing exact Bearer resource metadata" >&2
  exit 1
fi
echo "CHECK public_mcp_oauth_challenge PASS HTTP 401 with exact protected-resource metadata"
