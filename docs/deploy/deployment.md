# SkillPilot Deployment Process

This document describes the current automated deployment workflow for Linux
servers. Operators use the stable repository-root entrypoint
`./deploy_skillpilot.sh`; it delegates to the generic deployment engine
`scripts/deploy.sh`.

## Stable production entrypoint

The normal production command is:

```bash
./deploy_skillpilot.sh
```

The root entrypoint pins `VITE_SKILLPILOT_COACH_VARIANT=openai-mcp`, which is
the current production architecture for the German coach, and then executes
`scripts/deploy.sh`. The engine continues to validate the variant before the
build and again in the local and publicly served frontend artifacts. This keeps
one operational command without removing the deployment guardrail.

An intentional rollback uses the same entrypoint with an explicit command-line
option:

```bash
./deploy_skillpilot.sh --coach-variant visible-session
```

On the production server, the historical launcher in the operator home
directory can remain the everyday entrypoint as a symlink to the versioned
script:

```bash
ln -s /home/enpasos/skillpilot/deploy_skillpilot.sh \
  /home/enpasos/deploy_skillpilot.sh
```

The versioned entrypoint resolves symlinks before locating the repository, so
running `/home/enpasos/deploy_skillpilot.sh` still executes the checked-in
deployment engine from `/home/enpasos/skillpilot`. There is no second copy of
the deployment logic to maintain.

## Overview

The deployment process currently does all of the following:
1.  Require an explicit, valid frontend coach variant for this artifact.
2.  Check that the target `systemd` service is reachable and that the exact
    restart command has a passwordless `sudo` grant.
3.  Stash local working-tree changes.
4.  Pull the latest code from Git.
5.  Deploy **curriculum decks** from `curricula/.../json/` into both frontend and backend static data folders.
6.  Deploy **whitepaper assets** into `app/public/whitepaper` and the comic folders.
7.  Deploy **quickstart/story assets** into `app/public/`.
8.  Install frontend dependencies and verify the committed AI-transparency inventory against the exact assets to be deployed.
9.  Rebuild the React app.
10. Verify the requested coach variant in the generated backend static `version.json` and `index.html`.
11. Build the backend jar.
12. Restart the `skillpilot` system service.
13. Wait until the public readiness endpoint returns HTTP 200.
14. Verify the deployed coach variant and AI-transparency copy against the public host.
15. Run the source-rationale deployment smoke test against the public host.

## The Deployment Engine (`scripts/deploy.sh`)

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
# The script validates systemctl access and the command-specific NOPASSWD grant
# before doing expensive build work.

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

echo "Pruefe KI-Transparenznachweis..."
npm run check:ai-transparency-inventory

echo "Baue Anwendung..."
npm run build

echo "Pruefe Coach-Variante im Frontend-Artefakt..."
node ../scripts/verify_frontend_coach_variant.mjs \
  ../backend/src/main/resources/static \
  "${VITE_SKILLPILOT_COACH_VARIANT}"

echo "Pruefe KI-Transparenz im Frontend-Artefakt..."
node ../scripts/verify_ai_transparency_artifact.mjs \
  ../backend/src/main/resources/static

cd ../backend
chmod +x gradlew
./gradlew clean build -x test
cd ..

echo "Starte Service neu..."
sudo -n -- "$(command -v systemctl)" restart "${SERVICE_NAME}"

SMOKE_BASE_URL="${SKILLPILOT_BASE_URL:-https://skillpilot.com}"
echo "Warte auf oeffentliche Readiness..."
# Polls /actuator/health/readiness until HTTP 200 or the configured timeout.

echo "Pruefe ausgelieferte Coach-Variante..."
node scripts/verify_frontend_coach_variant.mjs \
  "${SMOKE_BASE_URL}" \
  "${VITE_SKILLPILOT_COACH_VARIANT}"

echo "Pruefe ausgelieferte KI-Transparenz..."
node scripts/verify_ai_transparency_artifact.mjs \
  "${SMOKE_BASE_URL}"

echo "Pruefe Quellenbegruendungs-Smoke-Test..."
cd app
npm run smoke:goal-source-rationales:deployment -- --base-url="${SMOKE_BASE_URL}"
```

## Why this order?

1.  **Coach-variant preflight first**: every deploy must state the intended frontend contract; there is no production default that could silently choose Visible Session or MCP.
2.  **Restart preflight**: the script fails before stashing, copying assets, or
    building if the current environment cannot reach the `systemd` service or
    lacks a command-specific, passwordless restart grant. It never opens a
    general `sudo` password prompt.
3.  **`git stash` + `git pull`**: the current script assumes deployment happens from a possibly dirty working tree and protects the pull by stashing first.
4.  **Deck/story/whitepaper deployment** must happen before the inventory check and frontend build so the check sees the exact public asset set.
5.  **AI-transparency inventory check** binds current visualization providers and C2PA container markers, illustration collections, canonical goal/card counts, and podcast hashes to the reviewed inventory under `docs/legal/`. Asset drift therefore stops deployment before a build or restart.
6.  **Frontend build and artifact verification** must both finish before backend build or restart. The verifier compares the requested variant with the build metadata and HTML marker.
7.  **Backend build** produces the updated server artifact.
8.  **`systemctl restart`** activates the freshly built frontend/backend bundle.
9.  **Public readiness wait** absorbs the normal Spring Boot and reverse-proxy
    startup window after `systemctl restart`. A temporary `502` therefore does
    not produce a false failed deployment.
10. **Optional OpenAI-mTLS runtime gate** runs for the `openai-mcp` variant
    only when mTLS hardening is explicitly enabled. It verifies the separately
    installed local verifier service and loopback listeners, expects public MCP
    access without an OpenAI client certificate to fail with `403`, and expects
    both OAuth discovery endpoints to remain public with `200`. In the normal
    TLS/OAuth compatibility mode this gate is skipped; MCP access without an
    OAuth token must still fail. The normal deploy does not install or remove
    the privileged nginx boundary; see
    [openai-mcp-edge-mtls.md](openai-mcp-edge-mtls.md).
11. **Deployment smoke tests** check that the public host serves the intended
    coach variant in both version metadata and HTML and contains the reviewed
    DE/EN audio, coach, and legal transparency copy. The source-rationale smoke
    then detects the active curriculum mode: repository deployments must serve
    the two exact compatibility indexes, while package deployments must expose
    Catalog API 1.2 and working generation-bound source-evidence routes.

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

- `./deploy_skillpilot.sh` is the normal production entrypoint and always pins
  `openai-mcp`. Stale ambient `VITE_SKILLPILOT_COACH_VARIANT` values are
  intentionally ignored.
- `VITE_SKILLPILOT_COACH_VARIANT` remains mandatory for a direct
  `scripts/deploy.sh` engine call and must be exactly `visible-session`,
  `openai-mcp`, or `legacy`.
  - German MCP deployment: `./deploy_skillpilot.sh`
  - Visible Session rollback:
    `./deploy_skillpilot.sh --coach-variant visible-session`
  - The `openai-mcp` build keeps English on its established Visible Session GPT.
  - Returning to `visible-session` does not automatically uninstall the
    OpenAI-mTLS verifier, CA files, or nginx snippet. Removal is a separate,
    privileged security decision.
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
- The public readiness wait defaults to 180 seconds with a 5-second interval.
  - Override with `SKILLPILOT_DEPLOY_READINESS_TIMEOUT_SECONDS=<seconds>` and
    `SKILLPILOT_DEPLOY_READINESS_INTERVAL_SECONDS=<seconds>` when a target
    environment has a different startup profile.
- Deployments as `enpasos` need a command-specific, passwordless `sudo` grant
  for the restart. The script deliberately uses `sudo -n` and never asks for a
  Linux password:

  ```sudoers
  enpasos ALL=(root) NOPASSWD: /usr/bin/systemctl restart skillpilot
  ```

  Confirm the actual binary path on the server with `command -v systemctl`
  before creating the rule. Do not grant unrestricted passwordless `sudo`.

## Prerequisites on Server

- **Python 3**: Required to run `scripts/deploy_decks.py`, `scripts/deploy_whitepaper.py`, and `scripts/deploy_story.py`.
- **Node.js & npm**: Required for installing dependencies and building the frontend.
- **Java**: Required for the backend Gradle build.
- **Git**: Required for pulling updates.
- **Sudo Access**: A command-specific `NOPASSWD` grant is required for
  restarting the `skillpilot` system service when deploying as a non-root user.
