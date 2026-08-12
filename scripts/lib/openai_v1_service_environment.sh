#!/usr/bin/env bash

# Validate the OpenAI V1 systemd environment namespace. Diagnostics report
# forbidden variable names only and never echo their values. This file is
# sourced by deploy.sh and deliberately does not change shell options or
# execute anything on its own.
_skillpilot_openai_v1_forbidden_environment_name() {
  case "$1" in
    SKILLPILOT_OPENAI_DE_*|\
    SKILLPILOT_OPENAI_COACH_DE_*|\
    SKILLPILOT_OPENAI_COACH_EN_*|\
    SKILLPILOT_OPENAI_APPS_CHALLENGE|\
    SKILLPILOT_OPENAI_COACH_V1_MCP_URL|\
    SKILLPILOT_OPENAI_COACH_V1_OAUTH_RESOURCE|\
    SKILLPILOT_OPENAI_COACH_V1_RESOURCE_METADATA|\
    SKILLPILOT_OPENAI_COACH_V1_RESOURCE_METADATA_URL|\
    SKILLPILOT_OPENAI_COACH_V1_PROTECTED_RESOURCE_METADATA|\
    SKILLPILOT_OPENAI_COACH_V1_PROTECTED_RESOURCE_METADATA_URL|\
    SKILLPILOT_OPENAI_COACH_V1_UI_ORIGIN|\
    SKILLPILOT_OPENAI_MCP_URL|\
    SKILLPILOT_OPENAI_OAUTH_RESOURCE|\
    SKILLPILOT_OPENAI_RESOURCE_METADATA|\
    SKILLPILOT_OPENAI_RESOURCE_METADATA_URL|\
    SKILLPILOT_OPENAI_PROTECTED_RESOURCE_METADATA|\
    SKILLPILOT_OPENAI_PROTECTED_RESOURCE_METADATA_URL|\
    SKILLPILOT_OPENAI_UI_ORIGIN)
      return 0
      ;;
    *)
      ;;
  esac

  case "$1" in
    SKILLPILOT_OPENAI_COACH_V1_ENABLED|\
    SKILLPILOT_OPENAI_COACH_V1_BOOTSTRAP_ENABLED|\
    SKILLPILOT_OPENAI_COACH_V1_DIAGNOSTIC_SESSION_TTL_ENABLED|\
    SKILLPILOT_OPENAI_COACH_V1_MTLS_EDGE_MODE|\
    SKILLPILOT_OPENAI_COACH_V1_WRITES_ENABLED|\
    SKILLPILOT_OPENAI_COACH_V1_WORKFLOW_VERSION|\
    SKILLPILOT_OPENAI_COACH_V1_OPENAI_APPS_CHALLENGE|\
    SKILLPILOT_OPENAI_COACH_V1_MCP_ENABLED|\
    SKILLPILOT_OPENAI_COACH_V1_OAUTH_ENABLED|\
    SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_ID|\
    SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_SECRET|\
    SKILLPILOT_OPENAI_COACH_V1_OAUTH_REDIRECT_URIS|\
    SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_AUTHENTICATION_METHOD|\
    SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_JWK_SET_URI|\
    SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_ASSERTION_SIGNING_ALGORITHM|\
    SKILLPILOT_OPENAI_COACH_V1_OAUTH_LEGACY_CLIENT_IDS)
      return 1
      ;;
    SKILLPILOT_OPENAI_COACH_V[1-9]*_*)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

validate_openai_v1_service_environment() {
  local systemctl_bin="$1"
  local service_name="$2"
  local service_env_file="$3"
  local node_bin="$4"
  local validator_path="$5"

  if [[ "${service_env_file}" != /* ]] || [[ "${service_env_file}" =~ [[:space:]] ]]; then
    echo "Abbruch: SKILLPILOT_SERVICE_ENV_FILE muss ein absoluter Pfad ohne Leerzeichen sein." >&2
    return 1
  fi

  local configured_environment_files
  if ! configured_environment_files="$(
    "${systemctl_bin}" show "${service_name}" \
      --property=EnvironmentFiles \
      --value \
      --no-pager 2>/dev/null
  )"; then
    echo "Abbruch: EnvironmentFiles des Dienstes '${service_name}' konnten nicht gelesen werden." >&2
    return 1
  fi

  local -a environment_file_tokens=()
  read -r -a environment_file_tokens <<< "${configured_environment_files}"
  if [ "${#environment_file_tokens[@]}" -ne 2 ] \
    || [ "${environment_file_tokens[0]:-}" != "${service_env_file}" ] \
    || [[ "${environment_file_tokens[1]:-}" != \(ignore_errors=*\) ]]; then
    echo "Abbruch: Der Dienst '${service_name}' muss genau die erwartete EnvironmentFile ${service_env_file} verwenden." >&2
    echo "Für einen abweichenden Pfad SKILLPILOT_SERVICE_ENV_FILE ausdrücklich setzen." >&2
    return 1
  fi
  local environment_file_ignore_errors="${environment_file_tokens[1]#\(ignore_errors=}"
  environment_file_ignore_errors="${environment_file_ignore_errors%\)}"
  if [ "${environment_file_ignore_errors}" != "yes" ] \
    && [ "${environment_file_ignore_errors}" != "no" ]; then
    echo "Abbruch: Unbekannte systemd-EnvironmentFile-Semantik für ${service_env_file}." >&2
    return 1
  fi

  local direct_environment
  if ! direct_environment="$(
    "${systemctl_bin}" show "${service_name}" \
      --property=Environment \
      --value \
      --no-pager 2>/dev/null
  )"; then
    echo "Abbruch: Direkte Environment-Einträge des Dienstes '${service_name}' konnten nicht geprüft werden." >&2
    return 1
  fi
  local -a direct_environment_tokens=()
  read -r -a direct_environment_tokens <<< "${direct_environment}"

  local passed_environment
  if ! passed_environment="$(
    "${systemctl_bin}" show "${service_name}" \
      --property=PassEnvironment \
      --value \
      --no-pager 2>/dev/null
  )"; then
    echo "Abbruch: PassEnvironment des Dienstes '${service_name}' konnte nicht geprüft werden." >&2
    return 1
  fi
  local -a passed_environment_tokens=()
  read -r -a passed_environment_tokens <<< "${passed_environment}"

  local manager_environment
  if ! manager_environment="$(
    "${systemctl_bin}" show-environment 2>/dev/null
  )"; then
    echo "Abbruch: Die globale systemd-Umgebung konnte nicht geprüft werden." >&2
    return 1
  fi
  local -a manager_environment_lines=()
  mapfile -t manager_environment_lines <<< "${manager_environment}"

  local direct_assignment
  for direct_assignment in "${direct_environment_tokens[@]}"; do
    direct_assignment="${direct_assignment#\"}"
    local direct_name="${direct_assignment%%=*}"
    if _skillpilot_openai_v1_forbidden_environment_name "${direct_name}"; then
      echo "Abbruch: ${direct_name} darf nicht direkt in der systemd-Unit gesetzt sein." >&2
      return 1
    fi
  done

  local passed_variable
  for passed_variable in "${passed_environment_tokens[@]}"; do
    if _skillpilot_openai_v1_forbidden_environment_name "${passed_variable}"; then
      echo "Abbruch: ${passed_variable} darf nicht über systemd PassEnvironment übernommen werden." >&2
      return 1
    fi
  done

  local manager_assignment
  for manager_assignment in "${manager_environment_lines[@]}"; do
    manager_assignment="${manager_assignment#\"}"
    local manager_name="${manager_assignment%%=*}"
    if _skillpilot_openai_v1_forbidden_environment_name "${manager_name}"; then
      echo "Abbruch: ${manager_name} darf nicht aus der globalen systemd-Umgebung stammen." >&2
      return 1
    fi
  done

  local parent_directory
  parent_directory="$(dirname -- "${service_env_file}")"
  while [ "${parent_directory}" != "/" ]; do
    if [ ! -x "${parent_directory}" ]; then
      echo "CHECK openai_v1_service_environment SKIP: EnvironmentFile ist root-geschützt; Spring prüft die V1-Werte beim Start fail-closed."
      return 0
    fi
    parent_directory="$(dirname -- "${parent_directory}")"
  done

  if [ ! -e "${service_env_file}" ]; then
    if [ "${environment_file_ignore_errors}" = "yes" ]; then
      echo "CHECK openai_v1_service_environment PASS: optionale EnvironmentFile fehlt; kanonische V1-Defaults gelten."
      return 0
    fi
    echo "Abbruch: Die verpflichtende EnvironmentFile ${service_env_file} fehlt." >&2
    return 1
  fi
  if [ ! -f "${service_env_file}" ]; then
    echo "Abbruch: Die EnvironmentFile ${service_env_file} ist keine reguläre Datei." >&2
    return 1
  fi
  if [ ! -r "${service_env_file}" ]; then
    echo "CHECK openai_v1_service_environment SKIP: EnvironmentFile ist root-geschützt; Spring prüft die V1-Werte beim Start fail-closed."
    return 0
  fi

  "${node_bin}" "${validator_path}" \
    --service-environment-file "${service_env_file}"
}
