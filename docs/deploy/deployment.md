# SkillPilot Deployment Process

This document describes the current automated deployment workflow implemented by `scripts/deploy.sh` for Linux servers.

## Overview

The deployment process currently does all of the following:
1.  Require an explicit, valid frontend coach variant for this artifact.
2.  Check that the target `systemd` service is reachable and that `sudo` can restart it.
3.  Stash local working-tree changes.
4.  Pull the latest code from Git.
5.  Deploy **curriculum decks** from `curricula/.../json/` into both frontend and backend static data folders.
6.  Deploy **whitepaper assets** into `app/public/whitepaper` and the comic folders.
7.  Deploy **quickstart/story assets** into `app/public/`.
8.  Install frontend dependencies and rebuild the React app.
9.  Verify the requested coach variant in the generated backend static `version.json` and `index.html`.
10. Build the backend jar.
11. Restart the `skillpilot` system service.
12. Verify the deployed coach variant against the public host.
13. Run the source-rationale deployment smoke test against the public host.

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

echo "Pruefe explizite Coach-Variante..."
# The script accepts only visible-session, openai-mcp, or legacy and aborts
# before Git/build/restart when VITE_SKILLPILOT_COACH_VARIANT is absent.

echo "Pruefe Restart-Voraussetzungen..."
# The script validates systemctl access and sudo before doing expensive build work.

if [ "${SKILLPILOT_SKIP_GIT_UPDATE:-0}" = "1" ]; then
  echo "Ueberspringe Git-Update (SKILLPILOT_SKIP_GIT_UPDATE=1)."
else
  echo "Stash local changes..."
  git stash

  echo "Hole Updates..."
  git pull
fi

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

echo "Pruefe Coach-Variante im Frontend-Artefakt..."
node ../scripts/verify_frontend_coach_variant.mjs \
  ../backend/src/main/resources/static \
  "${VITE_SKILLPILOT_COACH_VARIANT}"

cd ../backend
chmod +x gradlew
./gradlew clean build -x test
cd ..

echo "Starte Service neu..."
sudo systemctl restart "${SERVICE_NAME}"

SMOKE_BASE_URL="${SKILLPILOT_BASE_URL:-https://skillpilot.com}"
echo "Pruefe ausgelieferte Coach-Variante..."
node scripts/verify_frontend_coach_variant.mjs \
  "${SMOKE_BASE_URL}" \
  "${VITE_SKILLPILOT_COACH_VARIANT}"

echo "Pruefe Quellenbegruendungs-Smoke-Test..."
cd app
npm run smoke:goal-source-rationales:deployment -- --base-url="${SMOKE_BASE_URL}"
```

## Why this order?

1.  **Coach-variant preflight first**: every deploy must state the intended frontend contract; there is no production default that could silently choose Visible Session or MCP.
2.  **Restart preflight**: the script fails before stashing, copying assets, or building if the current environment cannot reach the `systemd` service or cannot authenticate `sudo`.
3.  **`git stash` + `git pull`**: the current script assumes deployment happens from a possibly dirty working tree and protects the pull by stashing first.
4.  **Deck/story/whitepaper deployment** must happen before the frontend build so those files are present in `app/public/`.
5.  **Frontend build and artifact verification** must both finish before backend build or restart. The verifier compares the requested variant with the build metadata and HTML marker.
6.  **Backend build** produces the updated server artifact.
7.  **`systemctl restart`** activates the freshly built frontend/backend bundle.
8.  **Deployment smoke tests** check that the public host serves the intended coach variant in both version metadata and HTML before checking the built source-rationale JSON asset.

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

- `VITE_SKILLPILOT_COACH_VARIANT` is mandatory for `scripts/deploy.sh` and must
  be exactly `visible-session`, `openai-mcp`, or `legacy`.
  - German MCP canary/cutover:
    `VITE_SKILLPILOT_COACH_VARIANT=openai-mcp scripts/deploy.sh`
  - Visible Session deployment/rollback:
    `VITE_SKILLPILOT_COACH_VARIANT=visible-session scripts/deploy.sh`
  - The `openai-mcp` build keeps English on its established Visible Session GPT.
- `git stash` is part of the current script behavior.
  - Operators should be aware that locally modified files will be stashed, not merged or deployed.
- The backend build currently runs with `-x test`.
  - CI is expected to catch regressions before deployment.
- The service name defaults to `skillpilot`.
  - Override with `SKILLPILOT_SERVICE_NAME=<service-name>` when deploying an environment with a different unit name.
- The script normally stashes local changes and pulls from Git before building.
  - Set `SKILLPILOT_SKIP_GIT_UPDATE=1` only when the exact desired tree is already present on the server, for example after applying a patch manually in an SSH recovery deployment.
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
