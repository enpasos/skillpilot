#!/bin/bash

# Bricht das Skript ab, wenn ein Befehl fehlschlägt (Wichtig für Sicherheit!)
set -e

# Robust: always deploy from the repository that contains this script.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

SERVICE_NAME="${SKILLPILOT_SERVICE_NAME:-skillpilot}"

require_explicit_coach_variant() {
  local configured_variant="${VITE_SKILLPILOT_COACH_VARIANT:-}"
  if [ -z "${configured_variant}" ]; then
    echo "Abbruch: VITE_SKILLPILOT_COACH_VARIANT muss für jedes Deployment explizit gesetzt sein." >&2
    echo "Erlaubt: visible-session, openai-mcp oder legacy." >&2
    echo "Für den geplanten deutschen MCP-Cutover: VITE_SKILLPILOT_COACH_VARIANT=openai-mcp scripts/deploy.sh" >&2
    exit 1
  fi

  case "${configured_variant}" in
    visible-session|openai-mcp|legacy)
      ;;
    *)
      echo "Abbruch: ungültige VITE_SKILLPILOT_COACH_VARIANT='${configured_variant}'." >&2
      echo "Erlaubt: visible-session, openai-mcp oder legacy." >&2
      exit 1
      ;;
  esac

  export VITE_SKILLPILOT_COACH_VARIANT="${configured_variant}"
  echo "Coach-Variante für diesen Build: ${VITE_SKILLPILOT_COACH_VARIANT}"
}

require_production_java() {
  local required_java_version
  local required_corretto_version
  local current_java_version_output
  required_java_version="$(tr -d '[:space:]' < "${PROJECT_ROOT}/.java-version")"
  required_corretto_version="$(tr -d '[:space:]' < "${PROJECT_ROOT}/.corretto-version")"
  current_java_version_output="$(java -version 2>&1 || true)"
  if ! printf '%s\n' "${current_java_version_output}" | grep -Fq "version \"${required_java_version}" \
    || ! printf '%s\n' "${current_java_version_output}" | grep -Fq "Corretto-${required_corretto_version}"; then
    echo "Abbruch: Amazon Corretto ${required_corretto_version} ist für Produktion erforderlich (.java-version/.corretto-version)." >&2
    echo "Aktuelle Java-Version:" >&2
    printf '%s\n' "${current_java_version_output}" >&2
    exit 1
  fi
}

ensure_restart_possible() {
  echo "Prüfe Restart-Voraussetzungen..."

  if ! command -v systemctl >/dev/null 2>&1; then
    echo "Abbruch: systemctl ist in dieser Umgebung nicht verfügbar." >&2
    exit 1
  fi

  local load_state
  if ! load_state="$(systemctl show "${SERVICE_NAME}" --property=LoadState --value 2>/dev/null)"; then
    echo "Abbruch: systemctl kann den Dienst '${SERVICE_NAME}' in dieser Umgebung nicht lesen." >&2
    echo "Führe das Deployment auf dem Server aus, auf dem der systemd-Dienst läuft." >&2
    exit 1
  fi

  if [ "${load_state}" != "loaded" ]; then
    echo "Abbruch: systemd-Dienst '${SERVICE_NAME}' ist nicht geladen (LoadState=${load_state})." >&2
    exit 1
  fi

  if [ -t 0 ]; then
    if ! sudo -v; then
      echo "Abbruch: sudo-Authentifizierung für den späteren Restart fehlgeschlagen." >&2
      exit 1
    fi
  elif ! sudo -n true 2>/dev/null; then
    echo "Abbruch: kein interaktives Terminal und keine passwortlose sudo-Berechtigung für den Restart." >&2
    echo "Starte das Deployment in einer interaktiven Server-Shell oder richte NOPASSWD für systemctl restart ${SERVICE_NAME} ein." >&2
    exit 1
  fi
}

require_explicit_coach_variant
ensure_restart_possible
require_production_java

if [ "${SKILLPILOT_SKIP_GIT_UPDATE:-0}" = "1" ]; then
  echo "Überspringe Git-Update (SKILLPILOT_SKIP_GIT_UPDATE=1)."
else
  echo "Stash local changes..."
  git stash

  echo "Hole Updates..."
  git pull
fi

echo "Deploying Vocabulary Decks..."
# Führt das Python-Skript aus, um die Decks von curricula/../json nach app/public/data zu kopieren
python3 scripts/deploy_decks.py

echo "Deploying Whitepaper assets..."
# Kopiert Whitepaper-Markdown und Bilder in app/public
python3 scripts/deploy_whitepaper.py

echo "Deploying Story assets..."
# Kopiert Story-Markdown und Bilder in app/public
python3 scripts/deploy_story.py

# 'app' ist ein Unterordner, hier ist der relative Pfad okay
cd app

echo "Installiere Abhängigkeiten..."
npm install

echo "Baue Anwendung..."
npm run build

echo "Prüfe Coach-Variante im Frontend-Artefakt..."
node ../scripts/verify_frontend_coach_variant.mjs \
  ../backend/src/main/resources/static \
  "${VITE_SKILLPILOT_COACH_VARIANT}"

echo "Baue Backend..."
cd ../backend
chmod +x gradlew
./gradlew clean build -x test
cd ..

echo "Starte Service neu..."
# sudo timestamp may expire during long builds, so refresh it directly before restart.
if [ -t 0 ]; then
  sudo -v
fi
sudo systemctl restart "${SERVICE_NAME}"

SMOKE_BASE_URL="${SKILLPILOT_BASE_URL:-https://skillpilot.com}"
echo "Prüfe ausgelieferte Coach-Variante..."
node scripts/verify_frontend_coach_variant.mjs \
  "${SMOKE_BASE_URL}" \
  "${VITE_SKILLPILOT_COACH_VARIANT}"

echo "Prüfe Quellenbegründungs-Smoke-Test..."
cd app
npm run smoke:goal-source-rationales:deployment -- --base-url="${SMOKE_BASE_URL}"
cd ..

echo "Fertig!"
