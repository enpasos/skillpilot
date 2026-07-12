#!/usr/bin/env bash

set -euo pipefail

readonly ROBOT_VERSION="1.9.10"
readonly ROBOT_BYTES="82604728"
readonly ROBOT_SHA256="16a73c074f3df359a7338a84b4e0788785fe06117f931bb9796e9619ea776105"
readonly ROBOT_RELEASE_URL="https://github.com/ontodev/robot/releases/download/v${ROBOT_VERSION}/robot.jar"

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
REPOSITORY_ROOT="$(CDPATH= cd -- "${SCRIPT_DIR}/.." && pwd -P)"
readonly TEMPORARY_ROOT="${REPOSITORY_ROOT}/tmp"
readonly DESTINATION_DIRECTORY="${REPOSITORY_ROOT}/tmp/tools"
readonly DESTINATION="${DESTINATION_DIRECTORY}/robot.jar"

temporary_file=""
umask 077

cleanup() {
  if [[ -n "${temporary_file}" && -e "${temporary_file}" ]]; then
    rm -f -- "${temporary_file}"
  fi
}

trap cleanup EXIT HUP INT TERM

file_size() {
  wc -c < "$1" | tr -d '[:space:]'
}

file_sha256() {
  sha256sum -- "$1" | awk '{print $1}'
}

is_single_link_regular_file() {
  local candidate="$1"

  [[ -f "${candidate}" ]] \
    && [[ ! -L "${candidate}" ]] \
    && [[ -O "${candidate}" ]] \
    && [[ "$(stat -c '%h' -- "${candidate}")" == "1" ]]
}

is_expected_robot() {
  local candidate="$1"

  is_single_link_regular_file "${candidate}" \
    && [[ "$(file_size "${candidate}")" == "${ROBOT_BYTES}" ]] \
    && [[ "$(file_sha256 "${candidate}")" == "${ROBOT_SHA256}" ]]
}

assert_physical_owned_directory() {
  local directory="$1"
  local expected="$2"
  local physical=""

  if [[ ! -d "${directory}" || -L "${directory}" || ! -O "${directory}" ]]; then
    echo "Refusing unsafe provisioning directory: ${directory}" >&2
    exit 1
  fi
  physical="$(CDPATH= cd -- "${directory}" && pwd -P)"
  if [[ "${physical}" != "${expected}" ]]; then
    echo "Refusing non-physical provisioning path: ${directory} -> ${physical}" >&2
    exit 1
  fi
}

assert_safe_layout() {
  assert_physical_owned_directory "${TEMPORARY_ROOT}" "${TEMPORARY_ROOT}"
  assert_physical_owned_directory "${DESTINATION_DIRECTORY}" "${DESTINATION_DIRECTORY}"
  if [[ -L "${DESTINATION}" ]]; then
    echo "Refusing symlinked ROBOT destination: ${DESTINATION}" >&2
    exit 1
  fi
  if [[ -e "${DESTINATION}" ]] && ! is_single_link_regular_file "${DESTINATION}"; then
    echo "Refusing non-regular, unowned, or multiply-linked ROBOT destination: ${DESTINATION}" >&2
    exit 1
  fi
}

for command_name in curl sha256sum awk wc tr mktemp mv chmod mkdir rm stat; do
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    echo "Required provisioning command is unavailable: ${command_name}" >&2
    exit 1
  fi
done

if [[ -L "${TEMPORARY_ROOT}" ]] || { [[ -e "${TEMPORARY_ROOT}" ]] && [[ ! -d "${TEMPORARY_ROOT}" ]]; }; then
  echo "Refusing unsafe temporary root: ${TEMPORARY_ROOT}" >&2
  exit 1
fi
mkdir -p -- "${TEMPORARY_ROOT}"

if [[ -L "${DESTINATION_DIRECTORY}" ]] || { [[ -e "${DESTINATION_DIRECTORY}" ]] && [[ ! -d "${DESTINATION_DIRECTORY}" ]]; }; then
  echo "Refusing unsafe provisioning directory: ${DESTINATION_DIRECTORY}" >&2
  exit 1
fi
mkdir -p -- "${DESTINATION_DIRECTORY}"
assert_physical_owned_directory "${DESTINATION_DIRECTORY}" "${DESTINATION_DIRECTORY}"
chmod 0700 -- "${DESTINATION_DIRECTORY}"
assert_safe_layout


if is_expected_robot "${DESTINATION}"; then
  printf 'ROBOT %s is already provisioned and verified at %s\n' \
    "${ROBOT_VERSION}" "${DESTINATION}"
  exit 0
fi

temporary_file="$(mktemp "${DESTINATION_DIRECTORY}/.robot.jar.download.XXXXXXXX")"
if ! is_single_link_regular_file "${temporary_file}"; then
  echo "mktemp did not create a private regular download file: ${temporary_file}" >&2
  exit 1
fi

curl \
  --disable \
  --fail \
  --location \
  --silent \
  --show-error \
  --proto '=https' \
  --proto-redir '=https' \
  --tlsv1.2 \
  --connect-timeout 30 \
  --max-time 600 \
  --output "${temporary_file}" \
  "${ROBOT_RELEASE_URL}"

assert_safe_layout
if ! is_expected_robot "${temporary_file}"; then
  actual_bytes="$(file_size "${temporary_file}")"
  actual_sha256="$(file_sha256 "${temporary_file}")"
  echo "Downloaded ROBOT artifact failed verification." >&2
  echo "Expected bytes=${ROBOT_BYTES} sha256=${ROBOT_SHA256}" >&2
  echo "Observed bytes=${actual_bytes} sha256=${actual_sha256}" >&2
  exit 1
fi

chmod 0644 -- "${temporary_file}"
assert_safe_layout
mv -fT -- "${temporary_file}" "${DESTINATION}"
temporary_file=""

assert_safe_layout
if ! is_expected_robot "${DESTINATION}"; then
  echo "ROBOT artifact failed verification after atomic promotion." >&2
  exit 1
fi

printf 'Provisioned and verified ROBOT %s at %s (bytes=%s sha256=%s)\n' \
  "${ROBOT_VERSION}" "${DESTINATION}" "${ROBOT_BYTES}" "${ROBOT_SHA256}"
