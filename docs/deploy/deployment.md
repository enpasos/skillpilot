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
4.  Pull the latest code from Git and, if `HEAD` changed, restart the freshly
    checked-out deployment engine.
5.  Validate the OpenAI V1 release contract and any explicit public-URL
    overrides before copying assets, building, or restarting the service.
6.  Deploy **curriculum decks** from `curricula/.../json/` into both frontend and backend static data folders.
7.  Deploy **whitepaper assets** into `app/public/whitepaper` and the comic folders.
8.  Deploy **quickstart/story assets** into `app/public/`.
9.  Install frontend dependencies and verify the committed AI-transparency inventory against the exact assets to be deployed.
10. Rebuild the React app.
11. Verify the requested coach variant and the referenced CSS/JavaScript shell assets in the generated backend static artifact.
12. Build the backend jar with the exact deployed Git commit embedded as the
    OpenAI server build and MCP server version.
13. Verify that the processed backend resources contain that commit.
14. For the `openai-mcp` variant, run the focused backend security and contract
    tests and any enabled pre-restart mTLS gate.
15. Restart the `skillpilot` system service.
16. Wait until the public readiness endpoint returns HTTP 200.
17. Verify the deployed CSS/JavaScript shell assets, coach variant, and AI-transparency copy against the public host.
18. Run enabled OpenAI edge checks and the source-rationale deployment smoke
    test against the public host.

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

echo "Pruefe konsistente OpenAI-Plugin-V1-Versionierung..."
node scripts/check_openai_plugin_versioning.mjs

if [ "${VITE_SKILLPILOT_COACH_VARIANT}" = "openai-mcp" ]; then
  echo "Pruefe exakte OpenAI-Plugin-V1-Runtime-Konfiguration..."
  node scripts/validate_openai_v1_runtime_config.mjs
fi

echo "Pruefe unveraenderten OpenAI-Plugin-V1-Snapshot..."
node scripts/openai_plugin_release.mjs verify

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

echo "Pruefe Frontend-Shell-Assets im Build-Artefakt..."
node ../scripts/verify_frontend_shell_assets.mjs \
  ../backend/src/main/resources/static

cd ../backend
chmod +x gradlew
./gradlew clean build -x test

if [ "${VITE_SKILLPILOT_COACH_VARIANT}" = "openai-mcp" ]; then
  echo "Pruefe eingebettete Backend-Buildkennung..."
  node ../scripts/validate_openai_v1_runtime_config.mjs \
    --built-application build/resources/main/application.yml
fi
cd ..

echo "Starte Service neu..."
sudo -n -- "$(command -v systemctl)" restart "${SERVICE_NAME}"

SMOKE_BASE_URL="${SKILLPILOT_BASE_URL:-https://skillpilot.com}"
echo "Warte auf oeffentliche Readiness..."
# Polls /actuator/health/readiness until HTTP 200 or the configured timeout.

echo "Pruefe ausgelieferte Frontend-Shell-Assets..."
node scripts/verify_frontend_shell_assets.mjs \
  "${SMOKE_BASE_URL}"

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
3.  **`git stash` + `git pull`**: the current script assumes deployment happens
    from a possibly dirty working tree and protects the pull by stashing first.
    If the pull changes `HEAD`, it restarts the newly checked-out deployment
    engine before continuing.
4.  **OpenAI V1 preflight**: the checked-in release contract is validated
    before asset copying, build and restart. The four canonical V1 public URL
    variables may be absent, in which case the versioned application defaults
    are used. An explicitly supplied value, including an empty value, must
    equal the canonical V1 value exactly; a stale alias, typo, whitespace or
    other origin fails closed.
5.  **Deck/story/whitepaper deployment** must happen before the inventory check and frontend build so the check sees the exact public asset set.
6.  **AI-transparency inventory check** binds current visualization providers and C2PA container markers, illustration collections, canonical goal/card counts, and podcast hashes to the reviewed inventory under `docs/legal/`. Asset drift therefore stops deployment before a build or restart.
7.  **Frontend build and artifact verification** must finish before backend build
    or restart. The shell verifier reads `index.html`, rejects cross-origin
    stylesheet/module references, and checks that every referenced local file is
    present and nonempty.
8.  **Backend build and build-identity verification** produce the updated
    server artifact. Gradle embeds the full lowercase `HEAD` commit into both
    `skillpilot.openai.de.server-build` and the MCP `server-version`; the
    deployment engine verifies the processed resource before restart.
    `SKILLPILOT_SERVER_BUILD` is not a runtime setting and cannot replace this
    artifact identity.
9.  **Focused OpenAI security and contract tests** run before restart for the
    `openai-mcp` artifact. If optional mTLS hardening is enabled, its
    pre-restart boundary check also has to pass.
10. **`systemctl restart`** activates the freshly built frontend/backend bundle.
11. **Public readiness wait** absorbs the normal Spring Boot and reverse-proxy
    startup window after `systemctl restart`. A temporary `502` therefore does
    not produce a false failed deployment.
12. **Public shell verification after readiness** fetches `index.html` and the
    exact referenced CSS/module assets with cache bypass headers. It requires
    successful, nonempty same-origin responses with the expected content types,
    so missing hashed assets or an HTML error page served as CSS stop deployment.
13. **Optional OpenAI-mTLS runtime gate** runs for the `openai-mcp` variant
    only when mTLS hardening is explicitly enabled. It verifies the separately
    installed local verifier service and loopback listeners, expects public MCP
    access without an OpenAI client certificate to fail with `403`, and expects
    both OAuth discovery endpoints to remain public with `200`. In the normal
    TLS/OAuth compatibility mode this gate is skipped; MCP access without an
    OAuth token must still fail. The normal deploy does not install or remove
    the privileged nginx boundary; see
    [openai-mcp-edge-mtls.md](openai-mcp-edge-mtls.md).
14. **Deployment smoke tests** check that the public host serves the intended
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
- The canonical OpenAI V1 public values are safe, versioned application
  defaults:
  - `https://mcp-v1.skillpilot.com/mcp`
  - `https://mcp-v1.skillpilot.com`
  - `https://ui-v1.skillpilot.com`
  - `https://mcp-v1.skillpilot.com/.well-known/oauth-protected-resource`
  The corresponding `SKILLPILOT_OPENAI_DE_*` URL variables should normally be
  omitted from `/etc/skillpilot/skillpilot.env`. If an environment deliberately
  sets one, it must match the canonical value exactly or deployment and
  application startup fail closed.
- Production uses exactly one systemd `EnvironmentFile`, normally
  `/etc/skillpilot/skillpilot.env`. Before copying assets or building,
  `./deploy_skillpilot.sh` verifies that this is the file configured for the
  service and validates only the four public OpenAI V1 URL variables in it.
  Other values, including OAuth and database secrets, are not interpreted,
  logged, or printed. The four public URL variables must not additionally be
  supplied by unit-level `Environment=` or `PassEnvironment=` settings. A
  stale global systemd manager environment is rejected as well. A nonstandard
  file path must be selected explicitly with
  `SKILLPILOT_SERVICE_ENV_FILE`.
- The deployment user needs read access to that one environment file for the
  allowlisted preflight. Do not solve missing access with a general `sudo cat`
  permission: use narrowly scoped ownership/group permissions appropriate for
  the service operator.
- Do not maintain `SKILLPILOT_SERVER_BUILD` in
  `/etc/skillpilot/skillpilot.env`. The backend build embeds the full Git commit
  into the jar and the deploy verifies it before restart. Rebuilding a commit
  therefore carries the correct build identity without an operator editing the
  service environment.
- `git stash` is part of the current script behavior.
  - Operators should be aware that locally modified files will be stashed, not merged or deployed.
- The initial backend build runs with `-x test`; an `openai-mcp` deployment
  then runs the focused OpenAI security, OAuth, contract and end-to-end tests
  before restart.
  - CI remains responsible for the complete backend regression suite.
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
