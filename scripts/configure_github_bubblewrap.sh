#!/usr/bin/env bash
set -euo pipefail

if [[ "${GITHUB_ACTIONS:-}" != "true" ]]; then
  echo "Refusing to change user-namespace settings outside GitHub Actions." >&2
  exit 2
fi

if [[ "${RUNNER_ENVIRONMENT:-}" != "github-hosted" ]]; then
  echo "Refusing to change user-namespace settings on a non-GitHub-hosted runner." >&2
  exit 2
fi

if ! command -v bwrap >/dev/null 2>&1; then
  echo "bubblewrap is not installed." >&2
  exit 1
fi

set_sysctl_if_present() {
  local key="$1"
  local expected="$2"
  local path="/proc/sys/${key//./\/}"
  local actual

  if [[ ! -e "${path}" ]]; then
    return
  fi
  actual="$(<"${path}")"
  if [[ "${actual}" != "${expected}" ]]; then
    sudo sysctl -q -w "${key}=${expected}"
  fi
}

# ubuntu-latest enables an AppArmor restriction that prevents bubblewrap from
# creating the unprivileged user namespace used by the hermetic consumers.
# GitHub-hosted jobs use fresh runner instances; keep the relaxation scoped to
# that documented runner environment and this job.
set_sysctl_if_present kernel.unprivileged_userns_clone 1
set_sysctl_if_present kernel.apparmor_restrict_unprivileged_userns 0

if [[ -r /proc/sys/user/max_user_namespaces ]] \
  && [[ "$(</proc/sys/user/max_user_namespaces)" == "0" ]]; then
  sudo sysctl -q -w user.max_user_namespaces=28633
fi

if ! bwrap \
  --clearenv \
  --die-with-parent \
  --new-session \
  --unshare-user \
  --unshare-pid \
  --unshare-net \
  --unshare-ipc \
  --unshare-uts \
  --cap-drop ALL \
  --ro-bind / / \
  --proc /proc \
  --dev /dev \
  -- /bin/true; then
  echo "bubblewrap cannot create the namespaces required by the hermetic tests." >&2
  exit 1
fi

echo "bubblewrap user-namespace isolation is available."
