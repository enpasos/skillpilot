# SkillPilot Deployment Process

This document describes the current automated deployment workflow implemented by `scripts/deploy.sh` for Linux servers.

## Overview

The deployment process currently does all of the following:
1.  Check that the target `systemd` service is reachable and that `sudo` can restart it.
2.  Stash local working-tree changes.
3.  Pull the latest code from Git.
4.  Deploy **curriculum decks** from `curricula/.../json/` into both frontend and backend static data folders.
5.  Deploy **whitepaper assets** into `app/public/whitepaper` and the comic folders.
6.  Deploy **quickstart/story assets** into `app/public/`.
7.  Install frontend dependencies and rebuild the React app.
8.  Build the backend jar.
9.  Restart the `skillpilot` system service.
10. Run the source-rationale deployment smoke test against the public host.

## The Deployment Script (`scripts/deploy.sh`)

This is the current automation flow:

```bash
#!/bin/bash
set -e

# Deploy from the repository that contains this script.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

SERVICE_NAME="${SKILLPILOT_SERVICE_NAME:-skillpilot}"

echo "Pruefe Restart-Voraussetzungen..."
# The script validates systemctl access and sudo before doing expensive build work.

echo "Stash local changes..."
git stash

echo "Hole Updates..."
git pull

echo "Deploying Vocabulary Decks..."
python3 scripts/deploy_decks.py

echo "Deploying Whitepaper assets..."
python3 scripts/deploy_whitepaper.py

echo "Deploying Story assets..."
python3 scripts/deploy_story.py

cd app
echo "Installiere Abhaengigkeiten..."
npm install

echo "Baue Anwendung..."
npm run build

cd ../backend
chmod +x gradlew
./gradlew clean build -x test
cd ..

echo "Starte Service neu..."
sudo systemctl restart "${SERVICE_NAME}"

echo "Pruefe Quellenbegruendungs-Smoke-Test..."
SMOKE_BASE_URL="${SKILLPILOT_BASE_URL:-https://skillpilot.com}"
cd app
npm run smoke:goal-source-rationales:deployment -- --base-url="${SMOKE_BASE_URL}"
```

## Why this order?

1.  **Restart preflight first**: The script fails before stashing, copying assets, or building if the current environment cannot reach the `systemd` service or cannot authenticate `sudo`.
2.  **`git stash` + `git pull`**: The current script assumes deployment happens from a possibly dirty working tree and protects the pull by stashing first.
3.  **Deck/story/whitepaper deployment** must happen before the frontend build so those files are present in `app/public/`.
4.  **Frontend build** must finish before restart so the web assets are ready.
5.  **Backend build** produces the updated server artifact.
6.  **`systemctl restart`** activates the freshly built frontend/backend bundle.
7.  **Deployment smoke test** checks that the public host serves the built source-rationale JSON asset referenced by the browser bundle.

## Asset deployment details

- `scripts/deploy_decks.py`
  - scans `curricula/**/json/` for files matching `_deck*.json`
  - copies them to:
    - `app/public/data/`
    - `backend/src/main/resources/static/data/`
- `scripts/deploy_whitepaper.py`
  - copies `docs/whitepaper/` into `app/public/whitepaper/`
  - copies comic assets for `comic1`, `comic2`, and `comic3`
- `scripts/deploy_story.py`
  - copies `docs/quickstart/*` into `app/public/`

## Operational notes

- `git stash` is part of the current script behavior.
  - Operators should be aware that locally modified files will be stashed, not merged or deployed.
- The backend build currently runs with `-x test`.
  - CI is expected to catch regressions before deployment.
- The service name defaults to `skillpilot`.
  - Override with `SKILLPILOT_SERVICE_NAME=<service-name>` when deploying an environment with a different unit name.
- The post-restart smoke test defaults to `https://skillpilot.com`.
  - Override with `SKILLPILOT_BASE_URL=https://staging.example.org` for another host.
- Non-interactive deployments need passwortlose `sudo` permission for the restart command.
  - Otherwise run the script from an interactive server shell so `sudo` can prompt before the build starts.

## Prerequisites on Server

- **Python 3**: Required to run `scripts/deploy_decks.py`, `scripts/deploy_whitepaper.py`, and `scripts/deploy_story.py`.
- **Node.js & npm**: Required for installing dependencies and building the frontend.
- **Java**: Required for the backend Gradle build.
- **Git**: Required for pulling updates.
- **Sudo Access**: Required for restarting the system service.
