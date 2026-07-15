#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
CORE_REPOSITORY="https://github.com/FWU-DE/lehrplan-ontologie.git"
CORE_COMMIT="8aa5bce4a5366807d46f18650e31db98f9bfe35d"
CORE_PARENT="${ROOT_DIR}/tmp"
CORE_CHECKOUT="${CORE_PARENT}/lehrplan-ontologie"
CORE_FILE="${CORE_CHECKOUT}/src/ontology/components/lehrplan-core.owl"
CORE_SHA256="267838b2dd9625d84b57039028004c4d9fa3edf623336f47d3a922189d4230df"

if [[ -L "${CORE_PARENT}" || ( -e "${CORE_PARENT}" && ! -d "${CORE_PARENT}" ) ]]; then
  echo "Refusing unsafe FWU ontology parent path: ${CORE_PARENT}" >&2
  exit 1
fi
mkdir -m 0700 -p -- "${CORE_PARENT}"

if [[ -L "${CORE_CHECKOUT}" || ( -e "${CORE_CHECKOUT}" && ! -d "${CORE_CHECKOUT}" ) ]]; then
  echo "Refusing unsafe FWU ontology checkout path: ${CORE_CHECKOUT}" >&2
  exit 1
fi

if [[ ! -e "${CORE_CHECKOUT}" ]]; then
  git clone --no-checkout --quiet "${CORE_REPOSITORY}" "${CORE_CHECKOUT}"
  git -C "${CORE_CHECKOUT}" checkout --detach --quiet "${CORE_COMMIT}"
fi

observed_commit="$(git -C "${CORE_CHECKOUT}" rev-parse HEAD)"
if [[ "${observed_commit}" != "${CORE_COMMIT}" ]]; then
  echo "FWU ontology checkout is not at the pinned commit: ${observed_commit}" >&2
  exit 1
fi
if [[ -n "$(git -C "${CORE_CHECKOUT}" status --porcelain --untracked-files=no)" ]]; then
  echo "FWU ontology checkout contains tracked modifications." >&2
  exit 1
fi
if [[ ! -f "${CORE_FILE}" || -L "${CORE_FILE}" ]]; then
  echo "Pinned FWU ontology core is missing or unsafe: ${CORE_FILE}" >&2
  exit 1
fi
observed_sha256="$(sha256sum "${CORE_FILE}" | awk '{print $1}')"
if [[ "${observed_sha256}" != "${CORE_SHA256}" ]]; then
  echo "Pinned FWU ontology core hash mismatch: ${observed_sha256}" >&2
  exit 1
fi

echo "Pinned FWU ontology ready: ${CORE_COMMIT}"
