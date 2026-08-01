#!/bin/bash

# Bricht das Skript ab, wenn ein Befehl fehlschlägt (Wichtig für Sicherheit!)
set -e

# Robust: always deploy from the repository that contains this script.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"
source "${SCRIPT_DIR}/lib/openai_v1_service_environment.sh"

SERVICE_NAME="${SKILLPILOT_SERVICE_NAME:-skillpilot}"
SERVICE_ENV_FILE="${SKILLPILOT_SERVICE_ENV_FILE:-/etc/skillpilot/skillpilot.env}"
SMOKE_BASE_URL="${SKILLPILOT_BASE_URL:-https://skillpilot.com}"
SYSTEMCTL_BIN=""

require_explicit_coach_variant() {
  local configured_variant="${VITE_SKILLPILOT_COACH_VARIANT:-}"
  if [ -z "${configured_variant}" ]; then
    echo "Abbruch: VITE_SKILLPILOT_COACH_VARIANT muss für jedes Deployment explizit gesetzt sein." >&2
    echo "Erlaubt: visible-session, openai-mcp oder legacy." >&2
    echo "Produktion regulär über ./deploy_skillpilot.sh ausrollen." >&2
    echo "Direkter Engine-Aufruf: VITE_SKILLPILOT_COACH_VARIANT=openai-mcp scripts/deploy.sh" >&2
    exit 1
  fi

  case "${configured_variant}" in
    visible-session|openai-mcp|legacy)
      ;;
    *)
      echo "Abbruch: ungültige VITE_SKILLPILOT_COACH_VARIANT='${configured_variant}'." >&2
      echo "Erlaubt: visible-session, openai-mcp oder legacy." >&2
      exit 1
      ;;
  esac

  export VITE_SKILLPILOT_COACH_VARIANT="${configured_variant}"
  echo "Coach-Variante für diesen Build: ${VITE_SKILLPILOT_COACH_VARIANT}"
}

require_production_java() {
  local required_java_version
  local required_corretto_version
  local current_java_version_output
  required_java_version="$(tr -d '[:space:]' < "${PROJECT_ROOT}/.java-version")"
  required_corretto_version="$(tr -d '[:space:]' < "${PROJECT_ROOT}/.corretto-version")"
  current_java_version_output="$(java -version 2>&1 || true)"
  if ! printf '%s\n' "${current_java_version_output}" | grep -Fq "version \"${required_java_version}" \
    || ! printf '%s\n' "${current_java_version_output}" | grep -Fq "Corretto-${required_corretto_version}"; then
    echo "Abbruch: Amazon Corretto ${required_corretto_version} ist für Produktion erforderlich (.java-version/.corretto-version)." >&2
    echo "Aktuelle Java-Version:" >&2
    printf '%s\n' "${current_java_version_output}" >&2
    exit 1
  fi
}

ensure_restart_possible() {
  echo "Prüfe Restart-Voraussetzungen..."

  if ! command -v systemctl >/dev/null 2>&1; then
    echo "Abbruch: systemctl ist in dieser Umgebung nicht verfügbar." >&2
    exit 1
  fi
  SYSTEMCTL_BIN="$(command -v systemctl)"

  local load_state
  if ! load_state="$("${SYSTEMCTL_BIN}" show "${SERVICE_NAME}" --property=LoadState --value 2>/dev/null)"; then
    echo "Abbruch: systemctl kann den Dienst '${SERVICE_NAME}' in dieser Umgebung nicht lesen." >&2
    echo "Führe das Deployment auf dem Server aus, auf dem der systemd-Dienst läuft." >&2
    exit 1
  fi

  if [ "${load_state}" != "loaded" ]; then
    echo "Abbruch: systemd-Dienst '${SERVICE_NAME}' ist nicht geladen (LoadState=${load_state})." >&2
    exit 1
  fi

  if [ "$(id -u)" -ne 0 ] \
    && ! sudo -k -n -l -- "${SYSTEMCTL_BIN}" restart "${SERVICE_NAME}" >/dev/null 2>&1; then
    echo "Abbruch: keine passwortlose sudo-Berechtigung für den Restart." >&2
    echo "Erwartet wird eine enge NOPASSWD-Freigabe für genau diesen Befehl:" >&2
    echo "  ${SYSTEMCTL_BIN} restart ${SERVICE_NAME}" >&2
    exit 1
  fi
}

require_public_readiness_configuration() {
  local timeout_seconds="${SKILLPILOT_DEPLOY_READINESS_TIMEOUT_SECONDS:-180}"
  local interval_seconds="${SKILLPILOT_DEPLOY_READINESS_INTERVAL_SECONDS:-5}"

  if ! command -v curl >/dev/null 2>&1; then
    echo "Abbruch: curl wird für die öffentliche Readiness-Prüfung benötigt." >&2
    exit 1
  fi
  if ! command -v python3 >/dev/null 2>&1; then
    echo "Abbruch: python3 wird für die Readiness-JSON-Prüfung benötigt." >&2
    exit 1
  fi
  if ! [[ "${timeout_seconds}" =~ ^[1-9][0-9]*$ ]]; then
    echo "Abbruch: SKILLPILOT_DEPLOY_READINESS_TIMEOUT_SECONDS muss eine positive Ganzzahl sein." >&2
    exit 1
  fi
  if ! [[ "${interval_seconds}" =~ ^[1-9][0-9]*$ ]]; then
    echo "Abbruch: SKILLPILOT_DEPLOY_READINESS_INTERVAL_SECONDS muss eine positive Ganzzahl sein." >&2
    exit 1
  fi
}

wait_for_public_readiness() {
  local base_url="$1"
  local readiness_url="${base_url%/}/actuator/health/readiness"
  local timeout_seconds="${SKILLPILOT_DEPLOY_READINESS_TIMEOUT_SECONDS:-180}"
  local interval_seconds="${SKILLPILOT_DEPLOY_READINESS_INTERVAL_SECONDS:-5}"

  echo "Warte auf öffentliche Readiness: ${readiness_url}"
  local started_at="${SECONDS}"
  local attempt=0
  local curl_exit_code=0
  local http_status="000"
  local response_body=""
  local raw_response=""
  local last_excerpt="<keine Antwort>"
  local status_marker=$'\n__SKILLPILOT_HTTP_STATUS__:'
  while (( SECONDS - started_at < timeout_seconds )); do
    attempt=$((attempt + 1))
    if raw_response="$(
      curl \
        --silent \
        --show-error \
        --write-out "${status_marker}%{http_code}" \
        --connect-timeout 5 \
        --max-time 10 \
        "${readiness_url}" \
        2>&1
    )"; then
      curl_exit_code=0
    else
      curl_exit_code=$?
    fi

    if [[ "${raw_response}" == *"${status_marker}"* ]]; then
      http_status="${raw_response##*"${status_marker}"}"
      response_body="${raw_response%"${status_marker}"*}"
    else
      http_status="000"
      response_body="${raw_response}"
    fi
    last_excerpt="$(
      printf '%s' "${response_body}" \
        | tr '\r\n' '  ' \
        | cut -c1-240
    )"
    if [ -z "${last_excerpt}" ]; then
      last_excerpt="<leere Antwort>"
    fi

    if [ "${curl_exit_code}" -eq 0 ] \
      && [ "${http_status}" = "200" ] \
      && printf '%s' "${response_body}" | python3 -c \
        'import json, sys; body = json.load(sys.stdin); raise SystemExit(0 if body.get("status") == "UP" else 1)' \
        2>/dev/null; then
      echo "CHECK public_readiness PASS HTTP 200 nach $((SECONDS - started_at))s (${attempt} Versuche)"
      return 0
    fi

    echo "Readiness noch nicht erreicht: curl=${curl_exit_code} HTTP ${http_status:-000} (${attempt}. Versuch)"

    # A backend that has already exited cannot become ready without another
    # systemd start attempt. Detect a crash loop early instead of hiding the
    # configuration error behind the full public-readiness timeout. Only
    # non-sensitive unit state is emitted; command lines and environment
    # variables (which can contain OAuth secrets) are deliberately excluded.
    if (( attempt >= 2 )); then
      local unit_state
      unit_state="$(
        "${SYSTEMCTL_BIN}" show "${SERVICE_NAME}" \
          --property=ActiveState \
          --property=SubState \
          --property=Result \
          --property=ExecMainCode \
          --property=ExecMainStatus \
          --property=NRestarts \
          --no-pager \
          2>/dev/null || true
      )"
      if printf '%s\n' "${unit_state}" \
        | grep -Eq '^(ActiveState=(failed|inactive)|SubState=(failed|dead|auto-restart))$'; then
        echo "CHECK service_runtime FAIL: systemd meldet einen beendeten Dienst oder Neustart-Loop." >&2
        printf '%s\n' "${unit_state}" >&2
        echo "Details: sudo journalctl -u ${SERVICE_NAME} --since '-5 min' --no-pager -l" >&2
        return 1
      fi
    fi

    sleep "${interval_seconds}"
  done

  echo "CHECK public_readiness FAIL nach ${timeout_seconds}s: ${readiness_url}" >&2
  echo "Letzte Antwort: curl=${curl_exit_code} HTTP ${http_status}; ${last_excerpt}" >&2
  echo "Nicht-sensitiver Dienststatus zur Diagnose:" >&2
  "${SYSTEMCTL_BIN}" show "${SERVICE_NAME}" \
    --property=ActiveState \
    --property=SubState \
    --property=Result \
    --property=ExecMainCode \
    --property=ExecMainStatus \
    --property=NRestarts \
    --no-pager >&2 || true
  echo "Details: sudo journalctl -u ${SERVICE_NAME} --since '-5 min' --no-pager -l" >&2
  return 1
}

require_explicit_coach_variant
require_public_readiness_configuration
ensure_restart_possible
require_production_java

if [ "${SKILLPILOT_SKIP_GIT_UPDATE:-0}" = "1" ]; then
  echo "Überspringe Git-Update (SKILLPILOT_SKIP_GIT_UPDATE=1)."
else
  deployment_engine_commit_before_pull="$(git rev-parse HEAD)"

  echo "Stash local changes..."
  git stash

  echo "Hole Updates..."
  git pull

  deployment_engine_commit_after_pull="$(git rev-parse HEAD)"
  if [ "${deployment_engine_commit_after_pull}" != "${deployment_engine_commit_before_pull}" ]; then
    echo "Repository wurde aktualisiert; starte die frisch ausgecheckte Deployment-Engine neu."
    export SKILLPILOT_SKIP_GIT_UPDATE=1
    exec "${PROJECT_ROOT}/scripts/deploy.sh"
  fi
fi

echo "Prüfe konsistente OpenAI-Plugin-V1-Versionierung..."
node scripts/check_openai_plugin_versioning.mjs

if [ "${VITE_SKILLPILOT_COACH_VARIANT}" = "openai-mcp" ]; then
  echo "Prüfe exakte OpenAI-Plugin-V1-Runtime-Konfiguration..."
  node scripts/validate_openai_v1_runtime_config.mjs
  echo "Prüfe OpenAI-V1-Konfiguration der systemd-EnvironmentFile..."
  validate_openai_v1_service_environment \
    "${SYSTEMCTL_BIN}" \
    "${SERVICE_NAME}" \
    "${SERVICE_ENV_FILE}" \
    node \
    "${PROJECT_ROOT}/scripts/validate_openai_v1_runtime_config.mjs"
fi

echo "Prüfe unveränderten OpenAI-Plugin-V1-Release-/Draft-Snapshot..."
node scripts/openai_plugin_release.mjs verify

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

echo "Prüfe KI-Transparenznachweis..."
npm run check:ai-transparency-inventory

echo "Baue Anwendung..."
npm run build

echo "Prüfe Coach-Variante im Frontend-Artefakt..."
node ../scripts/verify_frontend_coach_variant.mjs \
  ../backend/src/main/resources/static \
  "${VITE_SKILLPILOT_COACH_VARIANT}"

echo "Prüfe KI-Transparenz im Frontend-Artefakt..."
node ../scripts/verify_ai_transparency_artifact.mjs \
  ../backend/src/main/resources/static

echo "Prüfe Frontend-Shell-Assets im Build-Artefakt..."
node ../scripts/verify_frontend_shell_assets.mjs \
  ../backend/src/main/resources/static

echo "Baue Backend..."
cd ../backend
chmod +x gradlew
./gradlew clean build -x test
if [ "${VITE_SKILLPILOT_COACH_VARIANT}" = "openai-mcp" ]; then
  echo "Prüfe eingebettete OpenAI-Plugin-V1-Build-ID..."
  node ../scripts/validate_openai_v1_runtime_config.mjs \
    --built-application build/resources/main/application.yml
  echo "Prüfe fokussierte OpenAI-Security-Verträge vor dem Service-Restart..."
  ./gradlew test \
    --tests com.skillpilot.backend.openai.OpenAiRuntimeEnvironmentValidationConfigurationTest \
    --tests com.skillpilot.backend.openai.de.OpenAiDeSecureModeConfigurationTest \
    --tests com.skillpilot.backend.openai.de.OpenAiDeCurriculumRevisionProviderTest \
    --tests com.skillpilot.backend.openai.de.oauth.OpenAiDeOAuthConfigurationTest \
    --tests com.skillpilot.backend.openai.de.oauth.OpenAiDeOAuthDiscoveryBootstrapIntegrationTest \
    --tests com.skillpilot.backend.openai.de.oauth.OpenAiDePublicOAuthContextIntegrationTest \
    --tests com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachMcpContractTest \
    --tests com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachEndToEndIntegrationTest \
    --tests com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpSessionCoordinatorTest \
    --tests com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1PublicContractValidationTest
fi
cd ..

echo "Starte Service neu..."
if [ "$(id -u)" -eq 0 ]; then
  "${SYSTEMCTL_BIN}" restart "${SERVICE_NAME}"
else
  sudo -n -- "${SYSTEMCTL_BIN}" restart "${SERVICE_NAME}"
fi

wait_for_public_readiness "${SMOKE_BASE_URL}"

echo "Prüfe ausgelieferte Frontend-Shell-Assets..."
node scripts/verify_frontend_shell_assets.mjs \
  "${SMOKE_BASE_URL}"

if [ "${VITE_SKILLPILOT_COACH_VARIANT}" = "openai-mcp" ]; then
  echo "Prüfe den öffentlichen OpenAI-Plugin-V1-Edge..."
  SKILLPILOT_PUBLIC_BASE_URL="${SMOKE_BASE_URL}" \
    ./scripts/verify_openai_v1_public_edge.sh
fi

echo "Prüfe ausgelieferte Coach-Variante..."
node scripts/verify_frontend_coach_variant.mjs \
  "${SMOKE_BASE_URL}" \
  "${VITE_SKILLPILOT_COACH_VARIANT}"

echo "Prüfe ausgelieferte KI-Transparenz..."
node scripts/verify_ai_transparency_artifact.mjs \
  "${SMOKE_BASE_URL}"

echo "Prüfe Quellenbegründungs-Smoke-Test..."
cd app
npm run smoke:goal-source-rationales:deployment -- --base-url="${SMOKE_BASE_URL}"
cd ..

echo "Fertig!"
