#!/bin/bash

# Bricht das Skript ab, wenn ein Befehl fehlschlägt (Wichtig für Sicherheit!)
set -e

# Robust: always deploy from the repository that contains this script.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

SERVICE_NAME="${SKILLPILOT_SERVICE_NAME:-skillpilot}"

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

ensure_restart_possible

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

echo "Prüfe Quellenbegründungs-Smoke-Test..."
SMOKE_BASE_URL="${SKILLPILOT_BASE_URL:-https://skillpilot.com}"
cd app
npm run smoke:goal-source-rationales:deployment -- --base-url="${SMOKE_BASE_URL}"
cd ..

echo "Fertig!"
