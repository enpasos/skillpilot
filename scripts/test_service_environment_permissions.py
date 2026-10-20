"""Permission-only tests for the shared backend EnvironmentFile policy."""

from __future__ import annotations

import importlib.util
import os
from pathlib import Path
import stat
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
POLICY_PATH = ROOT / "scripts" / "lib" / "service_environment_permissions.py"
SPEC = importlib.util.spec_from_file_location("service_environment_permissions", POLICY_PATH)
assert SPEC and SPEC.loader
policy = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(policy)


ADMIN_GID = 1234
CANONICAL = policy.CANONICAL_ENVIRONMENT_FILE


def metadata(kind: int, mode: int, uid: int = 0, gid: int = 0) -> os.stat_result:
    return os.stat_result((kind | mode, 0, 0, 1, uid, gid, 0, 0, 0, 0))


class ServiceEnvironmentPermissionsTest(unittest.TestCase):
    def _validate(self, path: str | Path, entries: dict[Path, os.stat_result], *, group: int | None = ADMIN_GID) -> None:
        def inspect(candidate: Path) -> os.stat_result:
            if candidate not in entries:
                raise FileNotFoundError(str(candidate))
            return entries[candidate]

        group_result = mock.Mock(gr_gid=group)
        with mock.patch.object(Path, "lstat", inspect), mock.patch.object(
            policy.grp, "getgrnam", return_value=group_result,
            side_effect=KeyError(policy.ADMIN_GROUP) if group is None else None,
        ) as lookup, mock.patch("builtins.open", side_effect=AssertionError("Must not read secrets")):
            policy.validate_environment_file(path)
            if group is not None and entries.get(Path(path), mock.Mock()).st_gid == group:
                lookup.assert_called_once_with(policy.ADMIN_GROUP)

    def _admin_entries(self) -> dict[Path, os.stat_result]:
        return {
            CANONICAL: metadata(stat.S_IFREG, 0o660, gid=ADMIN_GID),
            CANONICAL.parent: metadata(stat.S_IFDIR, 0o750, gid=ADMIN_GID),
            Path("/etc"): metadata(stat.S_IFDIR, 0o755),
            Path("/"): metadata(stat.S_IFDIR, 0o755),
        }

    def test_accepts_root_only_profile_at_canonical_and_custom_paths(self) -> None:
        for path in (CANONICAL, Path("/srv/private/backend.env")):
            with self.subTest(path=path):
                self._validate(path, {
                    path: metadata(stat.S_IFREG, 0o600),
                    path.parent: metadata(stat.S_IFDIR, 0o700),
                }, group=None)

    def test_accepts_exact_canonical_admin_profile(self) -> None:
        self._validate(CANONICAL, self._admin_entries())

    def test_rejects_admin_profile_at_other_or_noncanonical_paths(self) -> None:
        for raw_path in (
            "/etc/skillpilot/other.env", "/srv/private/skillpilot.env",
            "/etc/skillpilot/../skillpilot/skillpilot.env",
            "/etc//skillpilot/skillpilot.env",
        ):
            path = Path(raw_path)
            with self.subTest(path=raw_path), self.assertRaises(policy.PermissionPolicyError):
                self._validate(raw_path, {path: metadata(stat.S_IFREG, 0o660, gid=ADMIN_GID)})

    def test_rejects_relative_or_unavailable_paths(self) -> None:
        for path in ("skillpilot.env", CANONICAL):
            with self.subTest(path=path), self.assertRaises(policy.PermissionPolicyError):
                self._validate(path, {})

    def test_rejects_invalid_file_metadata(self) -> None:
        invalid = [
            metadata(stat.S_IFLNK, 0o660, gid=ADMIN_GID),
            metadata(stat.S_IFDIR, 0o660, gid=ADMIN_GID),
            metadata(stat.S_IFIFO, 0o660, gid=ADMIN_GID),
            metadata(stat.S_IFREG, 0o660, uid=1000, gid=ADMIN_GID),
            metadata(stat.S_IFREG, 0o660, gid=999),
            metadata(stat.S_IFREG, 0o660),
        ]
        invalid.extend(metadata(stat.S_IFREG, mode, gid=ADMIN_GID) for mode in (
            0o600, 0o640, 0o644, 0o664, 0o666, 0o770, 0o4660, 0o2660, 0o1660,
        ))
        for info in invalid:
            entries = self._admin_entries()
            entries[CANONICAL] = info
            with self.subTest(metadata=info), self.assertRaises(policy.PermissionPolicyError):
                self._validate(CANONICAL, entries)

    def test_rejects_missing_or_root_admin_group(self) -> None:
        for group in (None, 0):
            with self.subTest(group=group), self.assertRaises(policy.PermissionPolicyError):
                self._validate(CANONICAL, self._admin_entries(), group=group)

    def test_rejects_invalid_admin_parent(self) -> None:
        invalid = [
            metadata(stat.S_IFLNK, 0o750, gid=ADMIN_GID),
            metadata(stat.S_IFREG, 0o750, gid=ADMIN_GID),
            metadata(stat.S_IFDIR, 0o750, uid=1000, gid=ADMIN_GID),
            metadata(stat.S_IFDIR, 0o750, gid=999),
            metadata(stat.S_IFDIR, 0o750),
        ]
        invalid.extend(metadata(stat.S_IFDIR, mode, gid=ADMIN_GID) for mode in (
            0o700, 0o755, 0o770, 0o777, 0o2750,
        ))
        for info in invalid:
            entries = self._admin_entries()
            entries[CANONICAL.parent] = info
            with self.subTest(metadata=info), self.assertRaises(policy.PermissionPolicyError):
                self._validate(CANONICAL, entries)

    def test_rejects_unsafe_or_unavailable_admin_ancestors(self) -> None:
        for ancestor in (Path("/etc"), Path("/")):
            for info in (
                None, metadata(stat.S_IFLNK, 0o755), metadata(stat.S_IFREG, 0o755),
                metadata(stat.S_IFDIR, 0o755, uid=1000),
                metadata(stat.S_IFDIR, 0o755, gid=ADMIN_GID),
                metadata(stat.S_IFDIR, 0o775), metadata(stat.S_IFDIR, 0o757),
            ):
                entries = self._admin_entries()
                if info is None:
                    del entries[ancestor]
                else:
                    entries[ancestor] = info
                with self.subTest(ancestor=ancestor, metadata=info), self.assertRaises(policy.PermissionPolicyError):
                    self._validate(CANONICAL, entries)

    def test_preserves_strict_root_only_profile(self) -> None:
        path = Path("/srv/private/backend.env")
        invalid_pairs = [
            (metadata(stat.S_IFREG, mode), metadata(stat.S_IFDIR, 0o700))
            for mode in (0o400, 0o640, 0o644, 0o660, 0o4600)
        ]
        invalid_pairs.extend((metadata(stat.S_IFREG, 0o600), parent) for parent in (
            metadata(stat.S_IFLNK, 0o700), metadata(stat.S_IFDIR, 0o700, uid=1000),
            metadata(stat.S_IFDIR, 0o700, gid=ADMIN_GID),
            metadata(stat.S_IFDIR, 0o770), metadata(stat.S_IFDIR, 0o707),
        ))
        invalid_pairs.extend((info, metadata(stat.S_IFDIR, 0o700)) for info in (
            metadata(stat.S_IFREG, 0o600, uid=1000),
            metadata(stat.S_IFREG, 0o600, gid=ADMIN_GID),
            metadata(stat.S_IFLNK, 0o600), metadata(stat.S_IFDIR, 0o600),
        ))
        for info, parent in invalid_pairs:
            with self.subTest(file=info, parent=parent), self.assertRaises(policy.PermissionPolicyError):
                self._validate(path, {path: info, path.parent: parent})

    def test_isolated_cli_rejects_unsafe_file_without_reading_contents(self) -> None:
        script = Path(policy.__file__).resolve()
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "backend.env"
            secret = "ENVIRONMENT_SECRET_CANARY_MUST_NOT_APPEAR"
            path.write_text(f"SECRET={secret}\n", encoding="utf-8")
            path.chmod(0o644)
            result = subprocess.run(
                [sys.executable, "-I", "-B", str(script), str(path)],
                capture_output=True, text=True, check=False, timeout=10,
                cwd=temporary,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Unsafe backend EnvironmentFile", result.stderr)
            self.assertNotIn(secret, result.stdout + result.stderr)

    def test_shell_wrapper_rejects_unsafe_file_without_printing_contents(self) -> None:
        library = ROOT / "scripts" / "lib" / "openai_v1_mtls_mode.sh"
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "backend.env"
            secret = "SHELL_ENVIRONMENT_SECRET_CANARY_MUST_NOT_APPEAR"
            path.write_text(f"SECRET={secret}\n", encoding="utf-8")
            path.chmod(0o644)
            result = subprocess.run(
                ["bash", "-c", 'source "$1"; assert_openai_v1_service_environment_file "$2"',
                 "service-environment-shell-test", str(library), str(path)],
                capture_output=True, text=True, check=False, timeout=10,
                cwd=temporary,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Unsafe backend EnvironmentFile", result.stderr)
            self.assertNotIn(secret, result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
