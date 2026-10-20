#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Validate backend EnvironmentFile permissions without opening its contents."""

from __future__ import annotations

import argparse
import grp
import os
from pathlib import Path
import stat
import sys


CANONICAL_ENVIRONMENT_FILE = Path("/etc/skillpilot/skillpilot.env")
ADMIN_GROUP = "skillpilot-admin"


class PermissionPolicyError(ValueError):
    pass


def _metadata(path: Path) -> os.stat_result:
    try:
        return path.lstat()
    except OSError as exc:
        raise PermissionPolicyError(f"Cannot inspect path metadata: {path}") from exc


def _validate_directory(path: Path, *, gid: int = 0, mode: int | None = None) -> None:
    metadata = _metadata(path)
    if not stat.S_ISDIR(metadata.st_mode):
        raise PermissionPolicyError(f"Parent must be a non-symlink directory: {path}")
    if metadata.st_uid != 0 or metadata.st_gid != gid:
        raise PermissionPolicyError(f"Parent must be owned by root with group ID {gid}: {path}")
    permissions = stat.S_IMODE(metadata.st_mode)
    if mode is not None:
        if permissions != mode:
            raise PermissionPolicyError(f"Parent must have mode {mode:04o}: {path}")
    elif permissions & 0o022:
        raise PermissionPolicyError(f"Parent must not be writable by group or others: {path}")


def validate_environment_file(path: str | Path) -> None:
    """Accept the root-only profile or the exact canonical admin profile."""
    raw_path = os.fspath(path)
    candidate = Path(raw_path)
    if not candidate.is_absolute():
        raise PermissionPolicyError("EnvironmentFile must have an absolute path")
    metadata = _metadata(candidate)
    if not stat.S_ISREG(metadata.st_mode):
        raise PermissionPolicyError(f"EnvironmentFile must be a non-symlink regular file: {candidate}")
    permissions = stat.S_IMODE(metadata.st_mode)
    if metadata.st_uid == 0 and metadata.st_gid == 0 and permissions == 0o600:
        _validate_directory(candidate.parent)
        return

    if raw_path != str(CANONICAL_ENVIRONMENT_FILE):
        raise PermissionPolicyError(f"EnvironmentFile must be root:root with mode 0600: {candidate}")
    try:
        admin_gid = grp.getgrnam(ADMIN_GROUP).gr_gid
    except KeyError as exc:
        raise PermissionPolicyError(f"Canonical admin access requires group {ADMIN_GROUP}") from exc
    if admin_gid <= 0:
        raise PermissionPolicyError(f"Group {ADMIN_GROUP} must have a non-root group ID")
    if metadata.st_uid != 0 or metadata.st_gid != admin_gid or permissions != 0o660:
        raise PermissionPolicyError(
            f"Canonical EnvironmentFile must be root:root mode 0600 or root:{ADMIN_GROUP} mode 0660: {candidate}"
        )
    _validate_directory(candidate.parent, gid=admin_gid, mode=0o750)
    for ancestor in candidate.parent.parents:
        _validate_directory(ancestor)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("environment_file")
    args = parser.parse_args()
    try:
        validate_environment_file(args.environment_file)
    except (PermissionPolicyError, OSError) as exc:
        print(f"Unsafe backend EnvironmentFile: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
