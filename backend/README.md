# SkillPilot Backend

Spring Boot backend for learner state, curriculum loading, UI APIs, AI APIs, and static asset delivery.

## Prerequisites

- Java toolchain compatible with the Gradle setup in this folder
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
- Static deck data is also mirrored into backend static resources during asset deployment.
