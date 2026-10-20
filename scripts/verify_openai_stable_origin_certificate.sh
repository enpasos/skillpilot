#!/usr/bin/env bash
set -euo pipefail

if [[ "$#" -ne 1 ]]; then
  echo "Usage: $0 /path/to/fullchain.pem" >&2
  exit 2
fi
certificate_file="$1"
expected_host="mcp-openai.skillpilot.com"

# OpenSSL x509 -checkhost also exits zero for a mismatch. Require its explicit
# positive result, and keep -checkend separate because it suppresses -checkhost.
if ! hostname_result="$(openssl x509 -in "${certificate_file}" -noout -checkhost "${expected_host}")" \
  || [[ "${hostname_result}" != "Hostname ${expected_host} does match certificate" ]]; then
  echo "CHECK stable_origin_certificate FAIL certificate does not match ${expected_host}" >&2
  exit 1
fi
if ! openssl x509 -in "${certificate_file}" -noout -checkend 86400 >/dev/null; then
  echo "CHECK stable_origin_certificate FAIL certificate expires within 24 hours" >&2
  exit 1
fi
echo "CHECK stable_origin_certificate PASS hostname ${expected_host} and more than 24 hours remaining"
