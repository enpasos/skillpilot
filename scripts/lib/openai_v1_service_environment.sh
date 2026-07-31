#!/usr/bin/env bash

# Validate the non-secret OpenAI V1 part of a systemd service environment.
# This file is sourced by deploy.sh and deliberately does not change shell
# options or execute anything on its own.
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

  local public_url_variable
  for public_url_variable in \
    SKILLPILOT_OPENAI_DE_MCP_URL \
    SKILLPILOT_OPENAI_DE_OAUTH_RESOURCE \
    SKILLPILOT_OPENAI_DE_UI_ORIGIN \
    SKILLPILOT_OPENAI_DE_RESOURCE_METADATA; do
    local direct_assignment
    for direct_assignment in "${direct_environment_tokens[@]}"; do
      direct_assignment="${direct_assignment#\"}"
      if [[ "${direct_assignment}" == "${public_url_variable}="* ]]; then
        echo "Abbruch: ${public_url_variable} darf nicht direkt in der systemd-Unit gesetzt sein." >&2
        return 1
      fi
    done

    local passed_variable
    for passed_variable in "${passed_environment_tokens[@]}"; do
      if [ "${passed_variable}" = "${public_url_variable}" ]; then
        echo "Abbruch: ${public_url_variable} darf nicht über systemd PassEnvironment übernommen werden." >&2
        return 1
      fi
    done

    local manager_assignment
    for manager_assignment in "${manager_environment_lines[@]}"; do
      manager_assignment="${manager_assignment#\"}"
      if [[ "${manager_assignment}" == "${public_url_variable}="* ]]; then
        echo "Abbruch: ${public_url_variable} darf nicht aus der globalen systemd-Umgebung stammen." >&2
        return 1
      fi
    done
  done

  if [ ! -f "${service_env_file}" ]; then
    echo "Abbruch: Die EnvironmentFile ${service_env_file} fehlt." >&2
    return 1
  fi
  if [ ! -r "${service_env_file}" ]; then
    echo "Abbruch: Die EnvironmentFile ${service_env_file} ist für den Deploy-Benutzer nicht lesbar." >&2
    echo "Die Prüfung liest ausschließlich die vier öffentlichen OpenAI-V1-URL-Variablen und gibt keine Secrets aus." >&2
    return 1
  fi

  "${node_bin}" "${validator_path}" \
    --service-environment-file "${service_env_file}"
}
