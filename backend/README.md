# SkillPilot Backend

Spring Boot backend for learner state, curriculum loading, UI APIs, AI APIs, and static asset delivery.

## Prerequisites

- Java 25.0.2 with Amazon Corretto build 25.0.2.10.1, matching production. The root `.java-version` and `.corretto-version` files are the shared source for local CI, GitHub Actions, Gradle toolchains, and production deployment checks.
- Node.js matching the root `.nvmrc`: `processResources` reproducibly builds the current Claude plugin download and index from the versioned package and its hash-bound release evidence.
- Spring Boot 4.1.x; OpenAPI uses the matching `springdoc-openapi` 3.x starter line.
- PostgreSQL reachable with the credentials from `src/main/resources/application.yml` or matching environment overrides

## Running locally

```bash
cd backend
./gradlew bootRun
```

Useful checks:

- Health: `curl http://localhost:8080/api/health`
- UI landscapes: `curl http://localhost:8080/api/ui/landscapes`
- UI learner API root: `POST /api/ui/learners`
- AI learner API root: `POST /api/ai/{lang}/learners`

## Current config model

### Claude plugin build resources

Every backend resource build (`test`, `bootRun`, `bootJar`, `build`) runs
`generateClaudePluginPublication` when its inputs change. It writes the current
`.plugin` archive and `/api/public/claude/plugins/index.json` into the configured
build directory, not into tracked source resources. `/plugins` continues to use
this same served index; no runtime request to GitHub or second version registry
is needed. Deploying the backend therefore updates the advertised and downloadable
version together.

The generated index uses the release baseline's `capturedAt` date at midnight UTC
as its deterministic `preparedAt`. This is build provenance, not a deployment or
client-acceptance timestamp. Version, archive SHA-256 and byte length must match
the current dossier. Existing archives remain byte-identical, and rebinding an
existing version to different bytes fails the build. Updating a candidate still
requires the normal package/evidence checks; a backend build grants no new
Marketplace publication or client acceptance.

To inspect the actual build result:

```bash
./gradlew processResources
node ../scripts/claude_direct_install_beta_release.mjs verify \
  --publication-root build/resources/main/claude-plugin-publication
```

`scripts/deploy.sh` checks that built index before service restart and checks the
public endpoint against the same bytes afterwards. The checked-in source index
remains historical evidence and must not be used to verify a newer deployment.

### Runtime properties

`src/main/resources/application.yml` is the runtime baseline:

- datasource:
  - `POSTGRES_HOST`
  - `POSTGRES_PORT`
  - `POSTGRES_DB`
  - `POSTGRES_USER`
  - `POSTGRES_PASSWORD`
- AI auth:
  - `SKILLPILOT_AI_API_KEY`
- optional GitHub OAuth for Champion flows:
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`

Landscape loading:

- default directory: `../curricula`
- config key: `skillpilot.landscapes.directory`

Persistence / migrations:

- JPA schema mode: `validate`
- Liquibase: enabled

## Important endpoint groups

- UI:
  - `/api/ui/landscapes`
  - `/api/ui/learners`
  - `/api/ui/curricula`
  - `/api/ui/updates/{skillpilotId}` (SSE)
- AI:
  - `/api/ai/{lang}/landscapes`
  - `/api/ai/{lang}/learners`

## Notes

- The backend loads curriculum JSON from `curricula/**/json/*.json`, not from a separate `landscapes/` directory.
- Static deck data is also mirrored into backend static resources during asset deployment. At runtime the backend can also resolve canonical deck sources directly from `curricula/**/memory-decks/`.
