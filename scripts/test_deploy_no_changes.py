#!/usr/bin/env python3
"""Exercise the production entrypoint through Git update without deploying anything."""

from __future__ import annotations

from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]


class DeployNoChangesTest(unittest.TestCase):
    def setUp(self) -> None:
        self.directory = tempfile.TemporaryDirectory()
        self.root = Path(self.directory.name)
        (self.root / "scripts/lib").mkdir(parents=True)
        self.bin = self.root / "bin"
        self.bin.mkdir()
        for name in ("deploy_skillpilot.sh", "scripts/deploy.sh", ".java-version", ".corretto-version"):
            shutil.copy2(ROOT / name, self.root / name)
        # Only the deployment entrypoint and engine are under test. External
        # prerequisites are inert; no database, network or service is contacted.
        (self.root / "scripts/lib/openai_v1_service_environment.sh").write_text("# inert test dependency\n")
        (self.root / "scripts/lib/deploy_database_backup.sh").write_text(
            "require_database_backup_prerequisites() { return 0; }\n")
        self.command("systemctl", "echo loaded\n")
        self.command("sudo", "exit 0\n")
        for name in ("pdfinfo", "pdftohtml", "fc-list", "fc-match"):
            self.command(name, "exit 0\n")
        java = (self.root / ".java-version").read_text().strip()
        corretto = (self.root / ".corretto-version").read_text().strip()
        self.command("java", f"echo 'openjdk version \"{java}\" Corretto-{corretto}' >&2\n")
        self.command("git", r'''
printf '%s\n' "$*" >> "$DEPLOY_TEST_LOG"
case "$1" in
  stash) exit 0 ;;
  pull)
    [ "$DEPLOY_TEST_MODE" != pull-fails ] || exit 42
    touch "$DEPLOY_TEST_PULLED"
    ;;
  rev-parse)
    if [ "$DEPLOY_TEST_MODE" = changed ] && [ -e "$DEPLOY_TEST_PULLED" ]; then
      echo new-commit
    else
      echo same-commit
    fi
    ;;
  *) exit 99 ;;
esac
''')
        # Stop at the first post-Git release check. A successful choice must
        # reach this exact command; never run a build or a real deployment.
        self.command("node", 'echo "post-git:$*" >> "$DEPLOY_TEST_LOG"\nexit 73\n')

    def tearDown(self) -> None:
        self.directory.cleanup()

    def command(self, name: str, body: str) -> None:
        path = self.bin / name
        path.write_text("#!/bin/bash\nset -e\n" + body)
        path.chmod(0o755)

    def run_entrypoint(self, answer: str, *, mode: str = "unchanged", skip_git: bool = False):
        log = self.root / "commands.log"
        log.unlink(missing_ok=True)
        pulled = self.root / "pulled"
        pulled.unlink(missing_ok=True)
        # Do not inherit a real deployment's skip/cutover/service settings.
        env = {
            "PATH": f"{self.bin}:/usr/bin:/bin",
            "LANG": "C.UTF-8",
            "SKILLPILOT_DB_BACKUP_ENV_FILE": str(self.root / "db-backup.env"),
            "SKILLPILOT_DB_BACKUP_DIR": str(self.root / "db-backups"),
            "DEPLOY_TEST_LOG": str(log),
            "DEPLOY_TEST_PULLED": str(pulled),
            "DEPLOY_TEST_MODE": mode,
        }
        if skip_git:
            env["SKILLPILOT_SKIP_GIT_UPDATE"] = "1"
        result = subprocess.run(
            [str(self.root / "deploy_skillpilot.sh")], input=answer,
            text=True, capture_output=True, env=env, cwd=self.root, timeout=10)
        return result, log.read_text().splitlines() if log.exists() else []

    def test_unchanged_commit_decline_empty_answer_or_eof_stops_before_rollout(self) -> None:
        for answer in ("n\n", "nein\n", "\n", ""):
            with self.subTest(answer=repr(answer)):
                result, commands = self.run_entrypoint(answer)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertIn("Trotzdem erneut ausrollen? [j/N]", result.stdout)
                self.assertIn("Rollout abgebrochen", result.stdout)
                self.assertFalse(any(c.startswith("post-git:") for c in commands))

    def test_explicit_yes_redeploys_the_unchanged_commit(self) -> None:
        for answer in ("j\n", "ja\n", "J\n", "yes\n"):
            with self.subTest(answer=answer.strip()):
                result, commands = self.run_entrypoint(answer)
                self.assertEqual(result.returncode, 73, result.stderr)
                self.assertEqual(commands.count("pull"), 1)
                self.assertIn("post-git:scripts/check_openai_plugin_versioning.mjs", commands)

    def test_unknown_input_reprompts_and_can_then_abort(self) -> None:
        result, commands = self.run_entrypoint("vielleicht\nn\n")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.count("Trotzdem erneut ausrollen? [j/N]"), 2)
        self.assertFalse(any(c.startswith("post-git:") for c in commands))

    def test_new_commit_reexecutes_the_engine_without_no_change_prompt(self) -> None:
        result, commands = self.run_entrypoint("", mode="changed")
        self.assertEqual(result.returncode, 73, result.stderr)
        self.assertIn("frisch ausgecheckte Deployment-Engine", result.stdout)
        self.assertNotIn("Trotzdem erneut ausrollen?", result.stdout)
        self.assertEqual(commands.count("pull"), 1)
        self.assertEqual(result.stdout.count("Coach-Variante für diesen Build:"), 2)
        self.assertIn("post-git:scripts/check_openai_plugin_versioning.mjs", commands)

    def test_failed_pull_never_prompts_or_redeploys(self) -> None:
        result, commands = self.run_entrypoint("j\n", mode="pull-fails")
        self.assertEqual(result.returncode, 42, result.stderr)
        self.assertNotIn("Trotzdem erneut ausrollen?", result.stdout)
        self.assertFalse(any(c.startswith("post-git:") for c in commands))

    def test_explicit_existing_skip_git_route_remains_noninteractive(self) -> None:
        result, commands = self.run_entrypoint("", skip_git=True)
        self.assertEqual(result.returncode, 73, result.stderr)
        self.assertNotIn("pull", commands)
        self.assertNotIn("Trotzdem erneut ausrollen?", result.stdout)
        self.assertIn("post-git:scripts/check_openai_plugin_versioning.mjs", commands)


if __name__ == "__main__":
    unittest.main()
