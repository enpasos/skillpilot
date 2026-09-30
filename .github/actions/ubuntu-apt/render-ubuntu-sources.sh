#!/usr/bin/env bash
# Derive the CI Ubuntu source list from the runner image's ubuntu.sources.
# Hosted runners route Ubuntu downloads through mirror+file:/etc/apt/apt-mirrors.txt,
# whose first entry is azure.archive.ubuntu.com. When that mirror stalls, APT keeps
# retrying it, so mirror-list and Azure URIs are replaced by the direct Ubuntu
# endpoints. Types, suites (including security), components and Signed-By stay as-is.
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "usage: $0 <ubuntu.sources> <output.sources>" >&2
  exit 2
fi
input=$1
output=$2
archive_uri=${SKILLPILOT_UBUNTU_ARCHIVE_URI:-https://archive.ubuntu.com/ubuntu/}
security_uri=${SKILLPILOT_UBUNTU_SECURITY_URI:-https://security.ubuntu.com/ubuntu/}

test -s "$input"
rendered=$(mktemp)
trap 'rm -f "$rendered"' EXIT

# Paragraph mode: each deb822 stanza is one record. A stanza whose suites are
# all *-security uses the security endpoint, every other stanza the archive.
awk -v archive_uri="$archive_uri" -v security_uri="$security_uri" '
  BEGIN { RS = ""; FS = "\n" }
  {
    security = 0
    for (i = 1; i <= NF; i++) {
      if ($i !~ /^Suites:/) continue
      count = split(substr($i, 8), suites, /[ \t]+/)
      security = 1
      seen = 0
      for (j = 1; j <= count; j++) {
        if (suites[j] == "") continue
        seen++
        if (suites[j] !~ /-security$/) security = 0
      }
      if (seen == 0) security = 0
    }
    if (NR > 1) printf "\n"
    for (i = 1; i <= NF; i++) {
      line = $i
      if (line ~ /^URIs:/ && (line ~ /mirror(\+[a-z]+)*\+file:/ || line ~ /azure\.archive\.ubuntu\.com/)) {
        line = "URIs: " (security ? security_uri : archive_uri)
      }
      print line
    }
  }
' "$input" > "$rendered"

grep -q '^URIs:' "$rendered" || { echo "No URIs found in $input" >&2; exit 1; }
if grep -Eq '^URIs:.*(mirror(\+[a-z]+)*\+file:|azure\.archive\.ubuntu\.com)' "$rendered"; then
  echo "Mirror-list or Azure URIs remain in the rendered sources" >&2
  exit 1
fi
install -m 644 "$rendered" "$output"
