#!/usr/bin/env python3
"""Hermetic contract tests for the database backup taken before a deployment restart."""

from __future__ import annotations

import os
from pathlib import Path
import stat
import subprocess
import tempfile
import time
import unittest


ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / "scripts" / "lib" / "deploy_database_backup.sh"
BACKUP_SCRIPT = ROOT / "scripts" / "backup_db.sh"
SECRET = "s3cret-test-value"

FAKE_PG_DUMP = r"""#!/bin/bash
printf '%s\n' "$*" >> "${FAKE_PG_DUMP_LOG}"
printf 'PGPASSWORD=%s\n' "${PGPASSWORD:-}" >> "${FAKE_PG_DUMP_LOG}"
output=""
schema_only=0
while [ "$#" -gt 0 ]; do
  case "$1" in
    -f) output="$2"; shift 2 ;;
    --schema-only) schema_only=1; shift ;;
    *) shift ;;
  esac
done
if [ "${FAKE_PG_DUMP_MODE:-ok}" = fail ]; then
  echo 'pg_dump: error: FATAL: password authentication failed for user "skillpilot"' >&2
  exit 1
fi
if [ "${schema_only}" = 1 ]; then
  echo 'CREATE TABLE public.learner ();'
  exit 0
fi
{
  echo '-- PostgreSQL database dump'
  echo 'COPY public.learner (skillpilot_id) FROM stdin;'
  if [ "${FAKE_PG_DUMP_MODE:-ok}" != incomplete ]; then
    echo '-- PostgreSQL database dump complete'
  fi
} > "${output}"
"""


class DeployDatabaseBackupTest(unittest.TestCase):
    def setUp(self) -> None:
        self._directory = tempfile.TemporaryDirectory()
        self.home = Path(self._directory.name)
        self.bin = self.home / "bin"
        self.bin.mkdir()
        fake = self.bin / "pg_dump"
        fake.write_text(FAKE_PG_DUMP, encoding="utf-8")
        fake.chmod(0o755)
        self.log = self.home / "pg_dump.log"
        self.environment_file = self.home / "db-backup.env"
        self.backup_directory = self.home / "db-backups"
        self.write_environment(f"POSTGRES_PASSWORD={SECRET}\n")

    def tearDown(self) -> None:
        self._directory.cleanup()

    def write_environment(self, content: str, mode: int = 0o600) -> None:
        self.environment_file.write_text(content, encoding="utf-8")
        self.environment_file.chmod(mode)

    def run_shell(self, command: str, *arguments: str, mode: str = "ok",
                  path_with_pg_dump: bool = True, cwd: Path | None = None) -> subprocess.CompletedProcess[str]:
        environment = {
            "HOME": str(self.home),
            "PATH": (f"{self.bin}:" if path_with_pg_dump else "") + "/usr/bin:/bin",
            "FAKE_PG_DUMP_LOG": str(self.log),
            "FAKE_PG_DUMP_MODE": mode,
            "LANG": "C.UTF-8",
        }
        return subprocess.run(
            ["bash", "-c", f'set -e; source "{LIBRARY}"; {command}', "deploy-test", *arguments],
            capture_output=True, text=True, env=environment, cwd=cwd or self.home)

    def prerequisites(self, skip: str = "0", **options) -> subprocess.CompletedProcess[str]:
        return self.run_shell('require_database_backup_prerequisites "$@"', skip,
                              str(self.environment_file), str(self.backup_directory), **options)

    def backup(self, skip: str = "0", **options) -> subprocess.CompletedProcess[str]:
        return self.run_shell('run_database_backup "$@"', skip, str(self.environment_file),
                              str(self.backup_directory), str(BACKUP_SCRIPT), **options)

    def published_dumps(self) -> list[Path]:
        return sorted(self.backup_directory.glob("*.sql")) if self.backup_directory.exists() else []

    def test_deployment_takes_the_backup_after_the_build_and_before_the_restart(self) -> None:
        script = (ROOT / "scripts" / "deploy.sh").read_text(encoding="utf-8")
        self.assertIn('source "${SCRIPT_DIR}/lib/deploy_database_backup.sh"', script)
        self.assertIn('SKIP_DB_BACKUP="${SKILLPILOT_DEPLOY_SKIP_DB_BACKUP:-0}"', script)
        preflight = script.index('require_database_backup_prerequisites "${SKIP_DB_BACKUP}"')
        git_update = script.index("git stash\n")
        backend_build = script.index("./gradlew clean build -x test")
        security_tests = script.index("OpenAiDeSecureModeConfigurationTest")
        backup = script.index('run_database_backup "${SKIP_DB_BACKUP}"')
        restart = script.index('echo "Starte Service neu..."')
        self.assertLess(preflight, git_update, "A missing backup prerequisite must end the deployment before any work")
        self.assertLess(backend_build, backup)
        self.assertLess(security_tests, backup)
        self.assertLess(backup, restart)
        between = script[backup:restart]
        self.assertNotIn("systemctl", between.lower(), "Nothing may restart the service between dump and restart")
        self.assertEqual(script.count("run_database_backup "), 1)
        wrapper = (ROOT / "deploy_skillpilot.sh").read_text(encoding="utf-8")
        self.assertNotIn("SKIP_DB_BACKUP", wrapper, "The production entrypoint never skips the backup on its own")

    def test_backup_publishes_one_complete_private_dump(self) -> None:
        result = self.backup()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("CHECK database_backup PASS", result.stdout)
        dumps = self.published_dumps()
        self.assertEqual(len(dumps), 1)
        content = dumps[0].read_text(encoding="utf-8")
        self.assertIn("-- PostgreSQL database dump complete", content)
        self.assertIn("INSERT INTO goal_feedback_inbox_capacity", content)
        self.assertEqual(stat.S_IMODE(dumps[0].stat().st_mode), 0o600)
        self.assertEqual(stat.S_IMODE(self.backup_directory.stat().st_mode), 0o700)
        self.assertEqual([path.name for path in self.backup_directory.iterdir()], [dumps[0].name])
        log = self.log.read_text(encoding="utf-8")
        self.assertIn(f"PGPASSWORD={SECRET}", log, "The dump authenticates with the configured password")
        self.assertIn("--exclude-table-data=goal_feedback_submission", log)
        self.assertNotIn(SECRET, result.stdout + result.stderr)

    def test_incomplete_or_failed_dump_stops_the_deployment_without_a_backup_file(self) -> None:
        for mode in ("incomplete", "fail"):
            with self.subTest(mode=mode):
                result = self.backup(mode=mode)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("Der laufende Backend-Dienst wurde nicht neu gestartet.", result.stderr)
                self.assertEqual(self.published_dumps(), [])
                leftovers = list(self.backup_directory.iterdir()) if self.backup_directory.exists() else []
                self.assertEqual(leftovers, [], "A partial dump must not remain")
                self.assertNotIn(SECRET, result.stdout + result.stderr)

    def test_skipping_needs_the_explicit_switch_and_is_announced(self) -> None:
        skipped = self.backup(skip="1", mode="fail")
        self.assertEqual(skipped.returncode, 0)
        self.assertIn("WARNUNG", skipped.stderr)
        self.assertEqual(self.published_dumps(), [])
        self.assertFalse(self.log.exists(), "A skipped backup never contacts the database")
        preflight = self.prerequisites(skip="1", path_with_pg_dump=False)
        self.assertEqual(preflight.returncode, 0)
        self.assertIn("OHNE Datenbank-Backup", preflight.stderr)
        invalid = self.prerequisites(skip="yes")
        self.assertNotEqual(invalid.returncode, 0)
        self.assertIn("muss 0 oder 1 sein", invalid.stderr)

    def test_prerequisites_pass_with_a_protected_file_and_a_readable_database(self) -> None:
        result = self.prerequisites()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("CHECK database_backup_prerequisites PASS", result.stdout)
        log = self.log.read_text(encoding="utf-8")
        self.assertIn("--schema-only --table=learner", log, "The probe reads no learner rows")
        self.assertEqual(self.published_dumps(), [], "The preflight never writes a dump")

    def test_prerequisites_reject_every_unusable_setup_before_any_work(self) -> None:
        cases = {
            "missing pg_dump": (lambda: None, {"path_with_pg_dump": False}, "pg_dump wird"),
            "missing file": (self.environment_file.unlink, {}, "fehlt oder ist keine reguläre Datei"),
            "group readable": (lambda: self.environment_file.chmod(0o640), {}, "nicht ausreichend geschützt"),
            "world readable": (lambda: self.environment_file.chmod(0o604), {}, "nicht ausreichend geschützt"),
            "no password": (lambda: self.write_environment("POSTGRES_USER=skillpilot\n"), {}, "kein POSTGRES_PASSWORD"),
            "database unreadable": (lambda: None, {"mode": "fail"}, "nicht lesbar"),
        }
        for name, (prepare, options, message) in cases.items():
            with self.subTest(name=name):
                self.write_environment(f"POSTGRES_PASSWORD={SECRET}\n")
                prepare()
                result = self.prerequisites(**options)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(message, result.stderr)
                self.assertNotIn(SECRET, result.stdout + result.stderr)

    def test_prerequisites_reject_symbolic_links(self) -> None:
        target = self.home / "real.env"
        self.environment_file.rename(target)
        self.environment_file.symlink_to(target)
        linked_file = self.prerequisites()
        self.assertNotEqual(linked_file.returncode, 0)
        self.assertIn("keine reguläre Datei", linked_file.stderr)
        self.environment_file.unlink()
        target.rename(self.environment_file)
        elsewhere = self.home / "elsewhere"
        elsewhere.mkdir()
        self.backup_directory.symlink_to(elsewhere)
        linked_directory = self.prerequisites()
        self.assertNotEqual(linked_directory.returncode, 0)
        self.assertIn("Unsicheres Backup-Verzeichnis", linked_directory.stderr)

    def test_credentials_are_parsed_and_never_executed(self) -> None:
        marker = self.home / "executed"
        self.write_environment(
            "# service environment\n"
            f"SKILLPILOT_SIGNING_SECRET=not-for-the-backup\n"
            f'POSTGRES_PASSWORD="$(touch {marker})"\n'
            "export POSTGRES_USER='reader'\n"
            "POSTGRES_DB=learners\r\n"
            f"touch {marker}\n")
        result = self.run_shell(
            '_skillpilot_load_database_backup_environment "$1"; '
            'printf "%s|%s|%s|%s\\n" "${POSTGRES_PASSWORD}" "${POSTGRES_USER}" "${POSTGRES_DB}" '
            '"${SKILLPILOT_SIGNING_SECRET:-unset}"', str(self.environment_file))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.strip(), f"$(touch {marker})|reader|learners|unset")
        self.assertFalse(marker.exists(), "The credential file must never be executed")

    def test_backup_script_keeps_its_default_directory_and_retention(self) -> None:
        work = self.home / "work"
        (work / "backups").mkdir(parents=True)
        expired = work / "backups" / "skillpilot_2026-01-01_00-00-00.sql"
        expired.write_text("old", encoding="utf-8")
        long_ago = time.time() - 40 * 86400
        os.utime(expired, (long_ago, long_ago))
        foreign = work / "backups" / "notes.txt"
        foreign.write_text("keep", encoding="utf-8")
        os.utime(foreign, (long_ago, long_ago))
        result = subprocess.run(
            ["bash", str(BACKUP_SCRIPT)], capture_output=True, text=True, cwd=work,
            env={"PATH": f"{self.bin}:/usr/bin:/bin", "POSTGRES_PASSWORD": SECRET,
                 "FAKE_PG_DUMP_LOG": str(self.log), "FAKE_PG_DUMP_MODE": "ok", "LANG": "C.UTF-8"})
        self.assertEqual(result.returncode, 0, result.stderr)
        remaining = sorted(path.name for path in (work / "backups").iterdir())
        self.assertEqual(len(remaining), 2)
        self.assertIn("notes.txt", remaining, "Retention only removes its own dumps")
        self.assertNotIn(expired.name, remaining, "Dumps older than the retention period are removed")
        self.assertNotIn(SECRET, result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
