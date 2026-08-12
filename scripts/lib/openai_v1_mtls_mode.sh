#!/usr/bin/env bash

# Read only the non-secret OpenAI V1 mTLS mode from a systemd EnvironmentFile.
# The file is never sourced and no other assignment or value is emitted.
is_openai_v1_mtls_loopback_listener() {
  local address="$1"
  local port="$2"

  case "${address}" in
    "127.0.0.1:${port}"|\
    "[::1]:${port}"|\
    "::1:${port}"|\
    "[::ffff:127.0.0.1]:${port}"|\
    "::ffff:127.0.0.1:${port}")
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

assert_openai_v1_mtls_secure_path() {
  local path="$1"
  local expected_kind="$2"
  local label="$3"

  if [[ "${path}" != /* || -L "${path}" ]]; then
    echo "${label} must be an absolute non-symlink path: ${path}" >&2
    return 1
  fi
  case "${expected_kind}" in
    directory)
      if [[ ! -d "${path}" ]]; then
        echo "${label} is not a directory: ${path}" >&2
        return 1
      fi
      ;;
    file)
      if [[ ! -f "${path}" ]]; then
        echo "${label} is not a regular file: ${path}" >&2
        return 1
      fi
      ;;
    *)
      echo "Unknown secure-path kind '${expected_kind}' for ${label}" >&2
      return 1
      ;;
  esac

  local owner
  local permissions
  owner="$(stat -c '%u:%g' -- "${path}")"
  permissions="$(stat -c '%a' -- "${path}")"
  if [[ "${owner}" != "0:0" ]]; then
    echo "${label} must be owned by root:root: ${path}" >&2
    return 1
  fi
  if (( (8#${permissions} & 8#22) != 0 )); then
    echo "${label} must not be writable by group or others (mode ${permissions}): ${path}" >&2
    return 1
  fi
}

# Backend EnvironmentFiles contain secrets. Unlike public CA/config artifacts,
# they must be readable and writable by root only.
assert_openai_v1_mtls_secret_file() {
  local path="$1"
  local label="$2"

  assert_openai_v1_mtls_secure_path "${path}" file "${label}" || return 1
  local permissions
  permissions="$(stat -c '%a' -- "${path}")"
  if [[ "${permissions}" != "600" ]]; then
    echo "${label} must have mode 0600 (got ${permissions}): ${path}" >&2
    return 1
  fi
}

read_openai_v1_mtls_backend_mode() {
  local environment_file="$1"
  if [[ "${environment_file}" != /* \
    || ! -f "${environment_file}" \
    || -L "${environment_file}" \
    || ! -r "${environment_file}" ]]; then
    echo "Cannot safely read the regular backend EnvironmentFile: ${environment_file}" >&2
    return 1
  fi

  PYTHONDONTWRITEBYTECODE=1 python3 -B - "${environment_file}" <<'PY'
from pathlib import Path
import re
import shlex
import sys

target = "SKILLPILOT_OPENAI_COACH_V1_MTLS_EDGE_MODE"
path = Path(sys.argv[1])
values: list[str] = []

try:
    lines = path.read_text(encoding="utf-8").splitlines()
except (OSError, UnicodeError) as exception:
    raise SystemExit(f"Cannot parse the backend EnvironmentFile: {exception}")

for line_number, raw_line in enumerate(lines, start=1):
    stripped = raw_line.strip()
    if not stripped or stripped.startswith(("#", ";")):
        continue
    match = re.match(r"^([A-Za-z_][A-Za-z0-9_]*)[ \t]*=[ \t]*(.*)$", stripped)
    if match is None or match.group(1) != target:
        continue
    lexer = shlex.shlex(match.group(2), posix=True)
    lexer.whitespace_split = True
    lexer.commenters = "#"
    try:
        tokens = list(lexer)
    except ValueError as exception:
        raise SystemExit(f"Malformed {target} assignment at line {line_number}: {exception}")
    if len(tokens) != 1 or tokens[0] not in {"disabled", "observe", "enforce"}:
        raise SystemExit(
            f"{target} at line {line_number} must be disabled, observe, or enforce"
        )
    values.append(tokens[0])

if len(values) > 1:
    raise SystemExit(f"{target} must be assigned at most once")
print(values[0] if values else "disabled")
PY
}

read_openai_v1_mtls_installed_mode() {
  local mode_file="$1"
  if ! assert_openai_v1_mtls_secure_path \
    "${mode_file}" \
    file \
    "Root-owned mTLS mode file" \
    || [[ ! -r "${mode_file}" ]]; then
    echo "Missing, insecure, or unreadable root-owned mTLS mode file: ${mode_file}" >&2
    return 1
  fi

  local -a modes=()
  mapfile -t modes < <(
    sed -n -E \
      's/^[[:space:]]*set[[:space:]]+\$skillpilot_openai_mtls_mode[[:space:]]+(observe|enforce);[[:space:]]*$/\1/p' \
      "${mode_file}"
  )
  if [[ "${#modes[@]}" -ne 1 ]]; then
    echo "Expected exactly one root-owned observe/enforce mode directive" >&2
    return 1
  fi
  printf '%s\n' "${modes[0]}"
}
