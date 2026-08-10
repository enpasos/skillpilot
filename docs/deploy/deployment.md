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
    tests.
15. Restart the `skillpilot` system service.
16. Wait until the public readiness endpoint returns HTTP 200.
17. Verify the deployed CSS/JavaScript shell assets, coach variant, and AI-transparency copy against the public host.
18. For the `openai-mcp` variant, require the public path-based OpenAI V1 smoke;
    then run the source-rationale deployment smoke against the public host.

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

echo "Baue Anwendung..."
npm run build

echo "Pruefe KI-Transparenznachweis..."
npm run check:ai-transparency-inventory

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
    before asset copying, build and restart. The three canonical V1 public URL
    variables may be absent, in which case the versioned application defaults
    are used. An explicitly supplied value, including an empty value, must
    equal the canonical V1 value exactly; a stale alias, typo, whitespace or
    other origin fails closed.
5.  **Deck/story/whitepaper deployment** must happen before the frontend build so it receives the exact public asset set.
6.  **Frontend build before inventory verification** synchronizes the generated runtime assets into both frontend and the non-versioned backend build tree. This prevents the inventory check from comparing a current frontend asset with a stale backend copy.
7.  **AI-transparency inventory check** binds current visualization providers and C2PA container markers, illustration collections, canonical goal/card counts, and podcast hashes to the reviewed inventory under `docs/legal/`. Asset drift therefore stops deployment before backend build or restart.
8.  **Frontend artifact verification** must finish before backend build
    or restart. The shell verifier reads `index.html`, rejects cross-origin
    stylesheet/module references, and checks that every referenced local file is
    present and nonempty.
9.  **Backend build and build-identity verification** produce the updated
    server artifact. Gradle embeds the full lowercase `HEAD` commit into both
    `skillpilot.openai.coach.v1.server-build` and the MCP `server-version`; the
    deployment engine verifies the processed resource before restart.
    `SKILLPILOT_SERVER_BUILD` is not a runtime setting and cannot replace this
    artifact identity.
10. **Focused OpenAI security and contract tests** run before restart for the
    `openai-mcp` artifact.
11. **`systemctl restart`** activates the freshly built frontend/backend bundle.
12. **Public readiness wait** absorbs the normal Spring Boot and reverse-proxy
    startup window after `systemctl restart`. A temporary `502` therefore does
    not produce a false failed deployment.
13. **Public shell verification after readiness** fetches `index.html` and the
    exact referenced CSS/module assets with cache bypass headers. It requires
    successful, nonempty same-origin responses with the expected content types,
    so missing hashed assets or an HTML error page served as CSS stop deployment.
14. **Mandatory OpenAI V1 public-contract smoke** runs after readiness for
    every `openai-mcp` deployment. It verifies the dedicated
    `mcp-coach-v1.skillpilot.com` TLS certificate, direct responses without
    redirects, HTTP `200` plus the exact resource in path-specific
    protected-resource metadata, and HTTP `401` plus the exact
    `WWW-Authenticate` metadata reference at
    `https://mcp-coach-v1.skillpilot.com/mcp`. The discarded main-origin
    routes and the internal transport route must return HTTP `404`; all five
    reserved sibling hosts must remain fail-closed with HTTP `404`.
15. **Further deployment smoke tests** check that the public host serves the intended
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
  - Multilingual MCP deployment: `./deploy_skillpilot.sh`
  - Visible Session rollback:
    `./deploy_skillpilot.sh --coach-variant visible-session`
  - The `openai-mcp` build uses the same V1 App for every backend-supported
    communication locale.
- The canonical OpenAI V1 public values are safe, versioned application
  defaults:
  - MCP endpoint: `https://mcp-coach-v1.skillpilot.com/mcp`
  - OAuth resource: `https://mcp-coach-v1.skillpilot.com/mcp`
  - protected-resource metadata:
    `https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp`
  V1 binds three distinct active content-addressed MCP Apps UI resources on the
  fixed widget domain `https://mcp-coach-v1.skillpilot.com`; previously
  advertised version-addressed and hash URIs remain passive and byte-identically
  readable.
  ChatGPT Web currently executes that hosted component on an isolated
  `https://*.web-sandbox.oaiusercontent.com` browser origin. Only the private
  `/bootstrap/v1/launch` endpoint accepts that HTTPS sandbox family for CORS,
  echoes the concrete allowed origin, and still rejects wildcard, `null`, HTTP,
  and unrelated domains. CORS is only an extra browser boundary; OAuth plus the
  short-lived setup capability remain authoritative.
  `open_skillpilot_start` binds the private Direct-Start resource,
  `render_skillpilot_goal_visualization` the image-only resource and
  `start_skillpilot_memory_practice` the interactive card-learning resource
  through `ui.resourceUri` and `openai/outputTemplate`. The ID-free capability
  issuer and the card-review tool are app-only and unbound; ordinary tools
  remain UI-free. The private Direct Bootstrap is approved only for the
  internal canary. Public submission remains blocked until OpenAI has accepted
  the concrete processing of the bearer-like SkillPilot ID in writing or an
  architecture without ID entry has been implemented. Bare MCP `ImageContent`
  is not the visibility contract, and
  the runtime applies no `openai/userAgent` or client-surface gate.
  These URLs are immutable contract values rather than environment settings.
  Obsolete `SKILLPILOT_OPENAI_DE_*` URL names and newly invented
  `SKILLPILOT_OPENAI_COACH_V1_*` URL overrides fail closed.
  Remove stale `SKILLPILOT_OPENAI_DE_UI_ORIGIN`, obsolete V1-origin,
  mTLS-edge, and mTLS-smoke variables before the first subdomain deployment;
  they are not part of the `1.0.0` runtime contract.
- Treat MCP tool descriptions, input/output schemas, annotations, server
  instructions, and skills as versioned model-facing metadata. A server deploy
  updates compatible live result behavior, but it does not rewrite an existing
  ChatGPT conversation or its earlier tool results. For a developer-mode
  connection, select **Refresh** on the connection after deployment, verify the
  discovered metadata, and test in a new conversation. For a published plugin,
  scan, review, and publish a new metadata snapshot. A browser-page reload is
  not a substitute. See OpenAI's
  [metadata refresh procedure](https://developers.openai.com/plugins/deploy/connect-chatgpt#refresh-metadata)
  and
  [published MCP metadata versioning](https://developers.openai.com/plugins/deploy/app-review#how-published-mcp-metadata-versions-work).
- One `skillpilot-server` Spring Boot artifact hosts every coach line. Values
  belonging to V1 use `SKILLPILOT_OPENAI_COACH_V1_*`; genuine shared
  process policies use `SKILLPILOT_OPENAI_*` without locale/version segments.
- The additive Nginx templates are
  `deploy/nginx/skillpilot-mcp-coaches.conf` for inclusion inside `http {}` and
  `deploy/nginx/skillpilot-main-vhost-openai-deny-locations.conf` for inclusion
  only inside the existing `skillpilot.com` HTTPS `server {}` block before its
  general `location /`. The first file activates only neutral V1 and keeps
  neutral V2 through V9 at `404`; the second prevents a main-origin or internal-path
  alias. Neither template enables client-TLS or replaces existing vHosts.
- Production uses exactly one systemd `EnvironmentFile`, normally
  `/etc/skillpilot/skillpilot.env`. Before copying assets or building,
  `./deploy_skillpilot.sh` verifies that this is the file configured for the
  service and rejects removed OpenAI names as well as attempted public-URL
  overrides. It inspects variable names only; OAuth, database, and other secret
  values are not logged or printed. The same forbidden names must not be
  supplied by unit-level `Environment=` or `PassEnvironment=` settings. A stale
  global systemd manager environment is rejected as well. A nonstandard file
  path must be selected explicitly with
  `SKILLPILOT_SERVICE_ENV_FILE`.
- If systemd marks that one file as optional (`ignore_errors=yes`) and it is
  absent, the preflight accepts the canonical application defaults after the
  other environment channels have been checked. A missing required file
  (`ignore_errors=no`) remains a deployment error.
- Keep an environment file containing OAuth or database secrets root-owned and
  mode `0600`. Do not weaken it to make the deployment preflight read it. When
  the deploy user cannot traverse or read the root-protected file, the
  allowlisted content check is reported as `SKIP`; Spring's exact V1 startup
  validation remains the final fail-closed boundary. Unit-level and global
  systemd sources are still checked before the build.
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
