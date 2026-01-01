#!/bin/bash

# Bricht das Skript ab, wenn ein Befehl fehlschlägt (Wichtig für Sicherheit!)
set -e

# WICHTIG: Der erste Slash / macht den Pfad absolut
# Passen Sie diesen Pfad gegebenenfalls an Ihre Umgebung an
cd /home/enpasos/skillpilot

echo "Hole Updates..."
git pull

echo "Deploying Vocabulary Decks..."
# Führt das Python-Skript aus, um die Decks von curricula/../json nach app/public/data zu kopieren
python3 scripts/deploy_decks.py

echo "Deploying Whitepaper assets..."
# Kopiert Whitepaper-Markdown und Bilder in app/public
python3 scripts/deploy_whitepaper.py

# 'app' ist ein Unterordner, hier ist der relative Pfad okay
cd app

echo "Baue Anwendung..."
npm run build

echo "Starte Service neu..."
# Prüfen, ob wir sudo-Rechte haben oder das Passwort benötigt wird (interaktiv)
sudo systemctl restart skillpilot

echo "Fertig!"
