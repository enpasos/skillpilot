#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MCP_ORIGIN="https://mcp-coach-v1.skillpilot.com"
AUTHORIZATION_ORIGIN="${SKILLPILOT_PUBLIC_BASE_URL:-https://skillpilot.com}"
AUTHORIZATION_ORIGIN="${AUTHORIZATION_ORIGIN%/}"
MCP_URL="${MCP_ORIGIN}/mcp"
EXPECTED_RESOURCE="${MCP_URL}"
METADATA_URL="${MCP_ORIGIN}/.well-known/oauth-protected-resource/mcp"
CHALLENGE_URL="${MCP_ORIGIN}/.well-known/openai-apps-challenge"
LEGACY_MCP_URL="${AUTHORIZATION_ORIGIN}/api/openai/de/mcp"
ABANDONED_VERSIONED_MCP_URL="${AUTHORIZATION_ORIGIN}/api/openai/de/v1/mcp"
INTERNAL_MCP_URL="${AUTHORIZATION_ORIGIN}/internal/openai/v1/mcp"
INTERNAL_METADATA_URL="${AUTHORIZATION_ORIGIN}/internal/openai/v1/protected-resource-metadata"
INTERNAL_CHALLENGE_URL="${AUTHORIZATION_ORIGIN}/internal/openai/v1/openai-apps-challenge"
REMOVED_COMMON_METADATA_URL="${AUTHORIZATION_ORIGIN}/.well-known/oauth-protected-resource"
REMOVED_COMMON_CHALLENGE_URL="${AUTHORIZATION_ORIGIN}/.well-known/openai-apps-challenge"
RESERVED_MCP_ORIGINS=(
  "https://mcp-coach-v2.skillpilot.com"
  "https://mcp-coach-v3.skillpilot.com"
  "https://mcp-coach-v4.skillpilot.com"
  "https://mcp-coach-v5.skillpilot.com"
  "https://mcp-coach-v6.skillpilot.com"
  "https://mcp-coach-v7.skillpilot.com"
  "https://mcp-coach-v8.skillpilot.com"
  "https://mcp-coach-v9.skillpilot.com"
)
EXPECTED_CHALLENGE="${SKILLPILOT_OPENAI_COACH_V1_OPENAI_APPS_CHALLENGE:-}"
GOAL_VISUALIZATION_ASSET_ROOT="${ROOT_DIR}/app/public/assets/goal-visualizations"

validate_https_url() {
  local label="$1"
  local value="$2"
  local allow_path="$3"
  PYTHONDONTWRITEBYTECODE=1 python3 -B - "${label}" "${value}" "${allow_path}" <<'PY'
import sys
from urllib.parse import urlsplit

label, value, allow_path = sys.argv[1:]
parsed = urlsplit(value)
if (
    parsed.scheme != "https"
    or not parsed.hostname
    or parsed.query
    or parsed.fragment
    or parsed.username
    or parsed.password
    or (allow_path != "true" and parsed.path)
):
    suffix = "URL" if allow_path == "true" else "origin"
    raise SystemExit(
        f"{label} must be an HTTPS {suffix} without credentials, query, or fragment: {value}"
    )
PY
}

validate_https_url "MCP origin" "${MCP_ORIGIN}" false
validate_https_url "authorization origin" "${AUTHORIZATION_ORIGIN}" false
validate_https_url "MCP URL" "${MCP_URL}" true
validate_https_url "OAuth resource" "${EXPECTED_RESOURCE}" true
validate_https_url "protected-resource metadata URL" "${METADATA_URL}" true
for reserved_origin in "${RESERVED_MCP_ORIGINS[@]}"; do
  validate_https_url "reserved MCP origin" "${reserved_origin}" false
done

if [[ "${MCP_ORIGIN}" != "https://mcp-coach-v1.skillpilot.com" ]]; then
  echo "CHECK public_edge_configuration FAIL MCP origin must equal https://mcp-coach-v1.skillpilot.com" >&2
  exit 2
fi
if [[ "${AUTHORIZATION_ORIGIN}" != "https://skillpilot.com" ]]; then
  echo "CHECK public_edge_configuration FAIL authorization origin must equal https://skillpilot.com" >&2
  exit 2
fi
if [[ "${EXPECTED_RESOURCE}" != "${MCP_URL}" ]]; then
  echo "CHECK public_edge_configuration FAIL OAuth resource must equal the exact V1 MCP URL" >&2
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
echo "CHECK public_edge_tls PASS ${MCP_ORIGIN}"
echo "CHECK public_edge_no_redirect PASS ${METADATA_URL}"

if ! PYTHONDONTWRITEBYTECODE=1 python3 -B \
  "${ROOT_DIR}/scripts/validate_openai_oauth_metadata.py" \
  --kind protected-resource \
  --base-url "${MCP_ORIGIN}" \
  --expected-resource "${EXPECTED_RESOURCE}" \
  --authorization-base-url "${AUTHORIZATION_ORIGIN}" \
  <"${temporary_dir}/metadata.json"; then
  echo "CHECK public_edge_metadata FAIL invalid protected-resource document" >&2
  exit 1
fi
echo "CHECK public_edge_metadata PASS ${METADATA_URL}"

goal_visualization_asset="$({
  find "${GOAL_VISUALIZATION_ASSET_ROOT}" -type f \
    \( -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' -o -name '*.webp' \) \
    -print -quit
} 2>/dev/null || true)"
if [[ -z "${goal_visualization_asset}" ]]; then
  echo "CHECK public_goal_visualization_cors FAIL no published visualization asset found" >&2
  exit 1
fi
goal_visualization_relative="${goal_visualization_asset#"${ROOT_DIR}/app/public"}"
goal_visualization_url="${AUTHORIZATION_ORIGIN}${goal_visualization_relative}"
goal_visualization_result="$(
  "${curl_common[@]}" \
    --header "Origin: ${MCP_ORIGIN}" \
    --dump-header "${temporary_dir}/goal-visualization.headers" \
    --output /dev/null \
    --write-out '%{http_code}|%{url_effective}|%{ssl_verify_result}' \
    "${goal_visualization_url}"
)"
IFS='|' read -r goal_visualization_status goal_visualization_effective_url \
  goal_visualization_tls_verify_result <<<"${goal_visualization_result}"
if [[ "${goal_visualization_status}" != "200" ]]; then
  echo "CHECK public_goal_visualization_cors FAIL expected HTTP 200, got ${goal_visualization_status}" >&2
  exit 1
fi
if [[ "${goal_visualization_effective_url}" != "${goal_visualization_url}" ]]; then
  echo "CHECK public_goal_visualization_cors FAIL unexpected redirect to ${goal_visualization_effective_url}" >&2
  exit 1
fi
if [[ "${goal_visualization_tls_verify_result}" != "0" ]]; then
  echo "CHECK public_goal_visualization_cors FAIL certificate verification result ${goal_visualization_tls_verify_result}" >&2
  exit 1
fi
goal_visualization_allow_origin="$(
  tr -d '\r' <"${temporary_dir}/goal-visualization.headers" \
    | awk 'tolower($0) ~ /^access-control-allow-origin:/ { sub(/^[^:]*:[[:space:]]*/, ""); value = $0 } END { print value }'
)"
goal_visualization_allow_credentials="$(
  tr -d '\r' <"${temporary_dir}/goal-visualization.headers" \
    | awk 'tolower($0) ~ /^access-control-allow-credentials:/ { sub(/^[^:]*:[[:space:]]*/, ""); value = $0 } END { print value }'
)"
if [[ "${goal_visualization_allow_origin}" != "${MCP_ORIGIN}" ]]; then
  echo "CHECK public_goal_visualization_cors FAIL expected exact Access-Control-Allow-Origin ${MCP_ORIGIN}" >&2
  exit 1
fi
if [[ -n "${goal_visualization_allow_credentials}" ]]; then
  echo "CHECK public_goal_visualization_cors FAIL public image response must not allow credentials" >&2
  exit 1
fi
echo "CHECK public_goal_visualization_cors PASS read-only image accessible from ${MCP_ORIGIN}"

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

mcp_result="$(
  "${curl_common[@]}" \
    --request POST \
    --header 'Accept: application/json, text/event-stream' \
    --header 'Content-Type: application/json' \
    --data '{"jsonrpc":"2.0","id":"public-edge-smoke","method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"skillpilot-public-edge-smoke","version":"1"}}}' \
    --dump-header "${temporary_dir}/mcp.headers" \
    --output "${temporary_dir}/mcp.body" \
    --write-out '%{http_code}|%{url_effective}|%{ssl_verify_result}' \
    "${MCP_URL}"
)"
IFS='|' read -r mcp_status mcp_effective_url mcp_tls_verify_result \
  <<<"${mcp_result}"
if [[ "${mcp_effective_url}" != "${MCP_URL}" ]]; then
  echo "CHECK public_mcp_no_redirect FAIL expected ${MCP_URL}, got ${mcp_effective_url}" >&2
  exit 1
fi
if [[ "${mcp_tls_verify_result}" != "0" ]]; then
  echo "CHECK public_mcp_tls FAIL certificate verification result ${mcp_tls_verify_result}" >&2
  exit 1
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
echo "CHECK public_mcp_no_redirect PASS ${MCP_URL}"
echo "CHECK public_mcp_oauth_challenge PASS HTTP 401 with exact protected-resource metadata"

assert_removed_route() {
  local label="$1"
  local url="$2"
  local output_file="${temporary_dir}/${label}.body"
  local result
  local status
  local effective_url
  result="$(
    "${curl_common[@]}" \
      --request POST \
      --header 'Accept: application/json, text/event-stream' \
      --header 'Content-Type: application/json' \
      --data '{"jsonrpc":"2.0","id":"removed-route-smoke","method":"initialize","params":{}}' \
      --output "${output_file}" \
      --write-out '%{http_code}|%{url_effective}' \
      "${url}"
  )"
  IFS='|' read -r status effective_url <<<"${result}"
  if [[ "${status}" != "404" || "${effective_url}" != "${url}" ]]; then
    echo "CHECK ${label} FAIL expected direct HTTP 404, got ${status} at ${effective_url}" >&2
    exit 1
  fi
  echo "CHECK ${label} PASS HTTP 404"
}

assert_removed_route legacy_main_origin_mcp_route "${LEGACY_MCP_URL}"
assert_removed_route abandoned_versioned_main_origin_mcp_route \
  "${ABANDONED_VERSIONED_MCP_URL}"
assert_removed_route internal_openai_mcp_route "${INTERNAL_MCP_URL}"

assert_removed_get_route() {
  local label="$1"
  local url="$2"
  local output_file="${temporary_dir}/${label}.body"
  local result
  local status
  local effective_url
  result="$(
    "${curl_common[@]}" \
      --output "${output_file}" \
      --write-out '%{http_code}|%{url_effective}' \
      "${url}"
  )"
  IFS='|' read -r status effective_url <<<"${result}"
  if [[ "${status}" != "404" || "${effective_url}" != "${url}" ]]; then
    echo "CHECK ${label} FAIL expected direct GET HTTP 404, got ${status} at ${effective_url}" >&2
    exit 1
  fi
  echo "CHECK ${label} PASS direct GET HTTP 404"
}

assert_removed_get_route internal_protected_resource_metadata_route \
  "${INTERNAL_METADATA_URL}"
assert_removed_get_route internal_openai_apps_challenge_route \
  "${INTERNAL_CHALLENGE_URL}"
assert_removed_get_route removed_common_protected_resource_metadata_route \
  "${REMOVED_COMMON_METADATA_URL}"
assert_removed_get_route removed_common_openai_apps_challenge_route \
  "${REMOVED_COMMON_CHALLENGE_URL}"

assert_reserved_origin() {
  local origin="$1"
  local host="${origin#https://}"
  local url="${origin}/mcp"
  local output_file="${temporary_dir}/reserved-${host}.body"
  local result
  local status
  local effective_url
  local tls_verify_result
  result="$(
    "${curl_common[@]}" \
      --request POST \
      --header 'Accept: application/json, text/event-stream' \
      --header 'Content-Type: application/json' \
      --data '{"jsonrpc":"2.0","id":"reserved-origin-smoke","method":"initialize","params":{}}' \
      --output "${output_file}" \
      --write-out '%{http_code}|%{url_effective}|%{ssl_verify_result}' \
      "${url}"
  )"
  IFS='|' read -r status effective_url tls_verify_result <<<"${result}"
  if [[ "${tls_verify_result}" != "0" ]]; then
    echo "CHECK reserved_origin_tls FAIL ${host} certificate verification result ${tls_verify_result}" >&2
    exit 1
  fi
  if [[ "${status}" != "404" || "${effective_url}" != "${url}" ]]; then
    echo "CHECK reserved_origin_fail_closed FAIL expected direct HTTP 404 for ${url}, got ${status} at ${effective_url}" >&2
    exit 1
  fi
  echo "CHECK reserved_origin_fail_closed PASS ${host} HTTPS/TLS and HTTP 404"
}

for reserved_origin in "${RESERVED_MCP_ORIGINS[@]}"; do
  assert_reserved_origin "${reserved_origin}"
done
