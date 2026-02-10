#!/bin/bash

# Bricht das Skript ab, wenn ein Befehl fehlschlägt (Wichtig für Sicherheit!)
set -e

# Robust: always deploy from the repository that contains this script.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

echo "Hole Updates..."
git pull

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
# Prüfen, ob wir sudo-Rechte haben oder das Passwort benötigt wird (interaktiv)
sudo systemctl restart skillpilot

echo "Fertig!"
