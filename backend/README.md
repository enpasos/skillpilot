# SkillPilot Spring Boot Service (local dev)

Minimal Spring Boot 4.0.0 service targeting Postgres 18 on WSL2. JDK 25 (Corretto) for the app/toolchain.

## Prereqs
- Java: `$HOME/.local/share/amazon-corretto-25` (export as `AMAZON_CORRETTO_25` so Gradle toolchains see it)
- Gradle wrapper: uses system JDK 21 to run (configured in `gradle.properties`), but compiles/runs the app on Corretto 25. The toolchain path is set to `/home/enpasos/.local/share/amazon-corretto-25`—adjust `gradle.properties` if your path differs.
- Postgres: running on `127.0.0.1:5432` with user/pass `skillpilot` (adjust via env)

## Running locally
```bash
export AMAZON_CORRETTO_25=$HOME/.local/share/amazon-corretto-25
# allow Gradle wrapper to use system JDK 21 to run, while compiling on Corretto 25
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH="$JAVA_HOME/bin:$PATH"
cd spring-server
./gradlew bootRun
```
Health check: `curl http://localhost:8080/api/health` or `http://localhost:8080/actuator/health`.
Landscapes: `GET /api/landscapes` or `/api/landscapes/{id}` (defaults to `../landscapes` directory; override via `skillpilot.landscapes.directory`).

## Config
- `src/main/resources/application.yml` uses env overrides:
  - `SPRING_DATASOURCE_URL` (default `jdbc:postgresql://127.0.0.1:5432/skillpilot`)
  - `SPRING_DATASOURCE_USERNAME`/`SPRING_DATASOURCE_PASSWORD`
  - `SERVER_PORT` for port override
  - `SKILLPILOT_LANDSCAPES_DIRECTORY` can override landscape directory (maps to `skillpilot.landscapes.directory`)
- Hibernate DDL is set to `update` for prototyping; Liquibase is off by default (enable and set DDL to `none` before production).
