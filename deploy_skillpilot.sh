#!/usr/bin/env bash
set -euo pipefail

# Stable production entrypoint. The generic deployment engine still requires
# an explicit variant; this wrapper owns the production policy and pins the
# current German coach architecture. A rollback must be requested visibly on
# the command line; stale ambient VITE variables are intentionally ignored.
SCRIPT_PATH="$(readlink -f "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(cd "$(dirname "${SCRIPT_PATH}")" && pwd)"

coach_variant="openai-mcp"
stable_origin_cutover=0

usage() {
  cat <<'EOF'
Usage: ./deploy_skillpilot.sh [--coach-variant <openai-mcp|visible-session|legacy>]
       [--openai-stable-origin-cutover]

Without arguments, production is deployed with the openai-mcp coach.
Use --coach-variant only for an intentional canary or rollback.
The one-time --openai-stable-origin-cutover validates staged neutral Nginx,
then reloads it after backend readiness and before the public edge checks.
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --openai-stable-origin-cutover)
      stable_origin_cutover=1
      shift
      ;;
    --coach-variant)
      if [ "$#" -lt 2 ]; then
        echo "Abbruch: --coach-variant benötigt einen Wert." >&2
        usage >&2
        exit 2
      fi
      coach_variant="$2"
      shift 2
      ;;
    --coach-variant=*)
      coach_variant="${1#*=}"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Abbruch: unbekanntes Argument '$1'." >&2
      usage >&2
      exit 2
      ;;
  esac
done

case "${coach_variant}" in
  openai-mcp|visible-session|legacy)
    ;;
  *)
    echo "Abbruch: ungültige Coach-Variante '${coach_variant}'." >&2
    usage >&2
    exit 2
    ;;
esac

if [[ "${stable_origin_cutover}" = 1 && "${coach_variant}" != openai-mcp ]]; then
  echo "Abbruch: --openai-stable-origin-cutover erfordert openai-mcp." >&2
  exit 2
fi

export VITE_SKILLPILOT_COACH_VARIANT="${coach_variant}"
export SKILLPILOT_OPENAI_STABLE_ORIGIN_CUTOVER="${stable_origin_cutover}"

exec "${SCRIPT_DIR}/scripts/deploy.sh"
