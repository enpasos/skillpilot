"""Tests for the fail-closed Claude v1 one-shot revocation tool."""

from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import time
import unittest
from unittest import mock
from urllib.parse import unquote, urlparse
import uuid

from scripts import claude_v1_revoke as revoke

TEST_TARGET_SHA256 = "a" * 64
DISPOSABLE_TEST_CONFIRMATION = "USE-LOCAL-DISPOSABLE-POSTGRES"
DISPOSABLE_TEST_DATABASE = "skillpilot_revoke_test"


def _disposable_test_connection_environment(
    dsn: str, confirmation: str
) -> dict[str, str]:
    """Accept only an explicitly confirmed loopback test-cluster target."""
    parsed = urlparse(dsn)
    database = unquote(parsed.path[1:]) if parsed.path.startswith("/") else ""
    if (
        confirmation != DISPOSABLE_TEST_CONFIRMATION
        or parsed.scheme not in {"postgres", "postgresql"}
        or parsed.hostname not in {"127.0.0.1", "localhost", "::1"}
        or database != DISPOSABLE_TEST_DATABASE
        or parsed.params
        or parsed.query
        or parsed.fragment
    ):
        raise ValueError("unsafe disposable PostgreSQL test target")
    return {
        "PGHOST": parsed.hostname,
        "PGPORT": str(parsed.port or 5432),
        "PGDATABASE": database,
        "PGUSER": unquote(parsed.username or ""),
        "PGPASSWORD": unquote(parsed.password or ""),
    }


class ClaudeV1RevokeUnitTest(unittest.TestCase):
    def test_scope_requires_client_principal_and_provider_marker(self) -> None:
        self.assertIn("rc.client_id IN", revoke.SCOPE_PREDICATE)
        self.assertIn("left(a.principal_name, 5) = 'spca_'", revoke.SCOPE_PREDICATE)
        self.assertIn("skillpilot_provider", revoke.SCOPE_PREDICATE)
        self.assertIn("'claude-v1'", revoke.SCOPE_PREDICATE)
        self.assertIn(
            "oauth/claude-code-client-metadata", revoke.ALLOWED_CLIENT_IDS_SQL
        )
        self.assertIn("oauth/mcp-oauth-client-metadata", revoke.ALLOWED_CLIENT_IDS_SQL)

    def test_execute_sql_only_deletes_the_three_approved_tables(self) -> None:
        delete_targets = re.findall(
            r"DELETE\s+FROM\s+([a-zA-Z0-9_.]+)",
            revoke.EXECUTE_SQL,
            flags=re.IGNORECASE,
        )
        self.assertEqual(
            delete_targets,
            [
                "public.oauth2_authorization_consent",
                "public.oauth2_authorization",
                "public.claude_v1_learning_session",
            ],
        )
        forbidden = {
            "learner",
            "oauth2_registered_client",
            "claude_v1_connection",
            "claude_v1_binding_transaction",
            "claude_v1_idempotency",
        }
        self.assertTrue(
            forbidden.isdisjoint(target.rsplit(".", 1)[-1] for target in delete_targets)
        )

    def test_plan_and_execute_have_bounded_transaction_guards(self) -> None:
        for sql in (revoke.PLAN_SQL, revoke.EXECUTE_SQL):
            self.assertIn("SERIALIZABLE", sql)
            self.assertIn("search_path = pg_catalog, public, pg_temp", sql)
            self.assertIn("lock_timeout = '5s'", sql)
            self.assertIn("statement_timeout = '30s'", sql)
            self.assertIn("pg_try_advisory_xact_lock", sql)
            self.assertIn("current_setting('fsync')", sql)
            self.assertIn("024-replace-claude-v1-binding-with-learning-sessions", sql)
            self.assertIn("confdeltype = 'c'", sql)
        self.assertIn("IN SHARE ROW EXCLUSIVE MODE", revoke.EXECUTE_SQL)
        self.assertIn("synchronous_commit = on", revoke.EXECUTE_SQL)
        self.assertNotIn("IN SHARE ROW EXCLUSIVE MODE", revoke.PLAN_SQL)
        self.assertLess(
            revoke.EXECUTE_SQL.index("LOCK TABLE"),
            revoke.EXECUTE_SQL.index("skillpilot_schema_guard"),
            "the destructive transaction must lock before its first snapshot query",
        )

    def test_result_parser_accepts_only_one_bounded_count_line(self) -> None:
        self.assertEqual(
            revoke._parse_result(
                revoke.RESULT_PREFIX + f"2|3|4|5|{TEST_TARGET_SHA256}\n"
            ),
            (2, 3, 4, 5, TEST_TARGET_SHA256),
        )
        invalid = (
            f"2|3|4|5|{TEST_TARGET_SHA256}",
            revoke.RESULT_PREFIX + f"-1|3|4|5|{TEST_TARGET_SHA256}",
            revoke.RESULT_PREFIX + f"2|3|4|5|{TEST_TARGET_SHA256}\nextra",
            revoke.RESULT_PREFIX + f"2|secret|4|5|{TEST_TARGET_SHA256}",
            revoke.RESULT_PREFIX + "2|3|4|5|not-a-sha256",
            revoke.RESULT_PREFIX + f"9223372036854775808|3|4|5|{TEST_TARGET_SHA256}",
        )
        for value in invalid:
            with self.subTest(value=value), self.assertRaises(revoke.ToolError):
                revoke._parse_result(value)

    def test_database_failure_never_forwards_psql_output(self) -> None:
        leaked_secret = "test-password-that-must-not-escape"
        completed = subprocess.CompletedProcess(
            args=["psql"],
            returncode=1,
            stdout=f"row={leaked_secret}",
            stderr=f"connection failed password={leaked_secret}",
        )
        environment = {
            "POSTGRES_PASSWORD": leaked_secret,
            "POSTGRES_HOST": "db.internal",
            "POSTGRES_PORT": "5432",
            "POSTGRES_DB": "skillpilot",
            "POSTGRES_USER": "skillpilot",
            "UNRELATED_SECRET": "also-private",
        }
        with (
            mock.patch.object(revoke, "_require_command", return_value="/usr/bin/psql"),
            mock.patch.object(revoke.subprocess, "run", return_value=completed),
        ):
            with self.assertRaises(revoke.ToolError) as raised:
                revoke._run_psql(revoke.PLAN_SQL, environment)
        self.assertEqual(raised.exception.code, "database_operation_failed")
        self.assertNotIn(leaked_secret, str(raised.exception))

    def test_destructive_client_io_failure_is_an_unverified_outcome(self) -> None:
        environment = {
            "POSTGRES_PASSWORD": "secret",
            "POSTGRES_HOST": "db.internal",
            "POSTGRES_PORT": "5432",
            "POSTGRES_DB": "skillpilot",
            "POSTGRES_USER": "skillpilot",
        }
        for failure in (
            OSError("post-spawn I/O failed"),
            UnicodeDecodeError("utf-8", b"\xff", 0, 1, "invalid"),
            KeyboardInterrupt(),
        ):
            with (
                self.subTest(failure=type(failure).__name__),
                mock.patch.object(
                    revoke, "_require_command", return_value="/usr/bin/psql"
                ),
                mock.patch.object(revoke.subprocess, "run", side_effect=failure),
                self.assertRaises(revoke.DatabaseApplyOutcomeUnverified),
            ):
                revoke._run_psql(
                    revoke.EXECUTE_SQL,
                    environment,
                    destructive=True,
                )

    def test_database_subprocess_receives_only_the_minimum_environment(self) -> None:
        source = {
            "POSTGRES_HOST": "db",
            "POSTGRES_PORT": "5433",
            "POSTGRES_DB": "skillpilot",
            "POSTGRES_USER": "skillpilot",
            "POSTGRES_PASSWORD": "secret",
            "SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_SECRET": "must-not-pass",
        }
        filtered = revoke._minimal_database_environment(source)
        self.assertEqual(
            set(filtered),
            {
                "LC_ALL",
                "PGAPPNAME",
                "PGCONNECT_TIMEOUT",
                "PGHOST",
                "PGPORT",
                "PGDATABASE",
                "PGUSER",
                "PGPASSWORD",
            },
        )
        self.assertNotIn("SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_SECRET", filtered)

    def test_database_target_uses_effective_process_environment_only(self) -> None:
        process_environment = {
            "POSTGRES_HOST": "effective-db.internal",
            "POSTGRES_PORT": "5439",
            "POSTGRES_DB": "effective-db",
            "POSTGRES_USER": "effective-user",
            "POSTGRES_PASSWORD": "effective-secret",
        }
        completed = subprocess.CompletedProcess(
            args=["psql"],
            returncode=0,
            stdout=revoke.RESULT_PREFIX + f"0|0|0|0|{TEST_TARGET_SHA256}\n",
            stderr="",
        )
        with (
            mock.patch.object(revoke, "_require_command", return_value="/usr/bin/psql"),
            mock.patch.object(revoke.subprocess, "run", return_value=completed) as run,
            mock.patch.dict(
                revoke.os.environ,
                {"POSTGRES_HOST": "wrong-db", "POSTGRES_PASSWORD": "wrong-secret"},
                clear=True,
            ),
        ):
            self.assertEqual(
                revoke._run_psql(revoke.PLAN_SQL, process_environment),
                (0, 0, 0, 0, TEST_TARGET_SHA256),
            )
        database_environment = run.call_args.kwargs["env"]
        self.assertEqual(database_environment["PGHOST"], "effective-db.internal")
        self.assertEqual(database_environment["PGPASSWORD"], "effective-secret")
        self.assertNotIn("wrong-secret", database_environment.values())

    def test_database_source_rejects_override_channels_and_external_config(
        self,
    ) -> None:
        base = {
            "POSTGRES_HOST": "db",
            "POSTGRES_PORT": "5432",
            "POSTGRES_DB": "skillpilot",
            "POSTGRES_USER": "skillpilot",
            "POSTGRES_PASSWORD": "secret",
        }
        with tempfile.TemporaryDirectory() as directory:
            working_directory = Path(directory)
            revoke._validate_database_source(
                base, b"java\0-jar\0app.jar\0", working_directory
            )

            override_environments = (
                {"SPRING_DATASOURCE_URL": "jdbc:postgresql://other/db"},
                {"SPRING_APPLICATION_JSON": '{"logging":{"level":"INFO"}}'},
                {"SPRING_CONFIG_LOCATION": "/tmp/other.yml"},
                {"SPRING_PROFILES_ACTIVE": "production"},
                {"_JAVA_OPTIONS": "-Dspring.datasource.url=jdbc:postgresql://other/db"},
            )
            for override in override_environments:
                with (
                    self.subTest(override=next(iter(override))),
                    self.assertRaises(revoke.ToolError) as raised,
                ):
                    revoke._validate_database_source(
                        {**base, **override},
                        b"java\0-jar\0app.jar\0",
                        working_directory,
                    )
                self.assertEqual(raised.exception.code, "database_target_override")

            with self.assertRaises(revoke.ToolError) as database_alias:
                revoke._validate_database_source(
                    {**base, "postgres_host": "other-db"},
                    b"java\0-jar\0app.jar\0",
                    working_directory,
                )
            self.assertEqual(
                database_alias.exception.code, "database_credentials_unavailable"
            )

            with self.assertRaises(revoke.ToolError) as command_line_error:
                revoke._validate_database_source(
                    base,
                    b"java\0-Dspring.config.location=/tmp/other.yml\0-jar\0app.jar\0",
                    working_directory,
                )
            self.assertEqual(
                command_line_error.exception.code, "database_target_override"
            )

            external_config = working_directory / "config" / "application.yml"
            external_config.parent.mkdir()
            external_config.touch()
            with self.assertRaises(revoke.ToolError) as external_config_error:
                revoke._validate_database_source(
                    base, b"java\0-jar\0app.jar\0", working_directory
                )
            self.assertEqual(
                external_config_error.exception.code,
                "external_spring_config_present",
            )

            external_config.unlink()
            profile_config = (
                working_directory / "config" / "region" / "application-production.yml"
            )
            profile_config.parent.mkdir()
            profile_config.touch()
            with self.assertRaises(revoke.ToolError) as profile_config_error:
                revoke._validate_database_source(
                    base, b"java\0-jar\0app.jar\0", working_directory
                )
            self.assertEqual(
                profile_config_error.exception.code,
                "external_spring_config_present",
            )

    def test_process_environment_rejects_duplicate_or_malformed_entries(self) -> None:
        self.assertEqual(
            revoke._parse_process_environment(b"POSTGRES_HOST=db\0EMPTY=\0"),
            {"POSTGRES_HOST": "db", "EMPTY": ""},
        )
        for raw_environment in (
            b"POSTGRES_HOST=first\0POSTGRES_HOST=second\0",
            b"POSTGRES_HOST=db\0malformed\0",
            b"=value\0",
        ):
            with (
                self.subTest(raw_environment=raw_environment),
                self.assertRaises(revoke.ToolError),
            ):
                revoke._parse_process_environment(raw_environment)

    def test_only_the_exact_skillpilot_application_jvm_is_accepted(self) -> None:
        app_command = (
            b"/usr/bin/java\0-cp\0classes\0"
            + revoke.APPLICATION_MAIN_CLASS.encode("utf-8")
            + b"\0"
        )
        self.assertTrue(
            revoke._is_skillpilot_application_process(
                Path("/usr/bin/java"), app_command
            )
        )
        self.assertFalse(
            revoke._is_skillpilot_application_process(
                Path("/usr/bin/bash"), app_command
            )
        )
        self.assertFalse(
            revoke._is_skillpilot_application_process(
                Path("/usr/bin/java"), b"/usr/bin/java\0org.gradle.launcher.daemon\0"
            )
        )

    def test_service_process_is_rechecked_before_database_access(self) -> None:
        control_group = "/system.slice/skillpilot.service"
        stable = {
            "LoadState": "loaded",
            "ActiveState": "active",
            "SubState": "running",
            "MainPID": "4242",
            "ControlGroup": control_group,
        }
        with (
            mock.patch.object(revoke, "_systemctl_properties", return_value=stable),
            mock.patch.object(
                revoke,
                "_find_application_process",
                return_value=(4243, b"application"),
            ),
        ):
            revoke._validate_service_process_unchanged(
                "skillpilot", (4242, 4243, control_group)
            )
        with (
            mock.patch.object(
                revoke,
                "_systemctl_properties",
                return_value={**stable, "MainPID": "4244"},
            ),
            self.assertRaises(revoke.ToolError) as changed,
        ):
            revoke._validate_service_process_unchanged(
                "skillpilot", (4242, 4243, control_group)
            )
        self.assertEqual(changed.exception.code, "service_changed_during_operation")

        with (
            mock.patch.object(revoke, "_systemctl_properties", return_value=stable),
            mock.patch.object(
                revoke,
                "_find_application_process",
                return_value=(4245, b"replacement"),
            ),
            self.assertRaises(revoke.ToolError) as application_changed,
        ):
            revoke._validate_service_process_unchanged(
                "skillpilot", (4242, 4243, control_group)
            )
        self.assertEqual(
            application_changed.exception.code, "service_changed_during_operation"
        )

    def test_cli_contract_rejects_secret_and_incomplete_execute_arguments(self) -> None:
        with self.assertRaises(revoke.ToolError) as secret_error:
            revoke._reject_secret_arguments(["plan", "--token=do-not-log"])
        self.assertEqual(secret_error.exception.code, "secret_arguments_forbidden")

        parser = revoke._parser()
        plan = parser.parse_args(
            [
                "plan",
                "--procedure-id",
                revoke.PROCEDURE_ID,
                "--incident-id",
                "SPDRILL-20260903-001",
            ]
        )
        tool_sha256 = revoke._sha256(Path(revoke.__file__))
        revoke._validate_args(plan, tool_sha256)

        for option, value in (
            ("--service-name", "another-skillpilot"),
            ("--environment-file", "/etc/skillpilot/another.env"),
        ):
            with (
                self.subTest(option=option),
                self.assertRaises(revoke.ToolError) as override_error,
            ):
                parser.parse_args(
                    [
                        "plan",
                        "--procedure-id",
                        revoke.PROCEDURE_ID,
                        "--incident-id",
                        "SPDRILL-20260903-OVERRIDE",
                        option,
                        value,
                    ]
                )
            self.assertEqual(override_error.exception.code, "invalid_arguments")

        execute = parser.parse_args(
            [
                "execute",
                "--procedure-id",
                revoke.PROCEDURE_ID,
                "--incident-id",
                "SPINC-20260903-001",
                "--expect-oauth",
                "1",
                "--expect-consents",
                "1",
                "--expect-sessions",
                "1",
                "--expect-idempotency",
                "1",
                "--expect-target-sha256",
                TEST_TARGET_SHA256,
                "--expect-tool-sha256",
                revoke._sha256(Path(revoke.__file__)),
                "--confirm",
                "wrong",
            ]
        )
        with self.assertRaises(revoke.ToolError) as confirmation_error:
            revoke._validate_args(execute, tool_sha256)
        self.assertEqual(
            confirmation_error.exception.code, "execute_confirmation_incomplete"
        )

        mismatch = parser.parse_args(
            [
                "execute",
                "--procedure-id",
                revoke.PROCEDURE_ID,
                "--incident-id",
                "SPINC-20260903-002",
                "--expect-oauth",
                "1",
                "--expect-consents",
                "1",
                "--expect-sessions",
                "1",
                "--expect-idempotency",
                "1",
                "--expect-target-sha256",
                TEST_TARGET_SHA256,
                "--expect-tool-sha256",
                "0" * 64,
                "--confirm",
                revoke.CONFIRMATION,
            ]
        )
        with self.assertRaises(revoke.ToolError) as hash_error:
            revoke._validate_args(mismatch, tool_sha256)
        self.assertEqual(hash_error.exception.code, "tool_sha256_mismatch")

        with self.assertRaises(revoke.ToolError) as parser_error:
            parser.parse_args(["plan"])
        self.assertEqual(parser_error.exception.code, "invalid_arguments")

        self.assertEqual(
            revoke._nonnegative("9223372036854775807"), 9223372036854775807
        )
        for count in ("9223372036854775808", "1" * 20):
            with (
                self.subTest(count=count),
                self.assertRaises(argparse.ArgumentTypeError),
            ):
                revoke._nonnegative(count)

    def test_secret_argument_never_enters_the_error_payload(self) -> None:
        secret = "SUPERSECRET-MUST-NOT-APPEAR"
        with mock.patch.object(revoke, "_print_output") as output:
            return_code = revoke.main([f"--token={secret}"])
        self.assertEqual(return_code, 1)
        payload = output.call_args.args[0]
        self.assertEqual(payload["operation"], "unknown")
        self.assertNotIn(secret, str(payload))

    def test_interrupt_before_database_mutation_is_sanitized(self) -> None:
        with (
            mock.patch.object(
                revoke, "_sha256", return_value=TEST_TARGET_SHA256
            ) as sha256,
            mock.patch.object(revoke, "_run", side_effect=KeyboardInterrupt()),
            mock.patch.object(revoke, "_print_output") as output,
        ):
            return_code = revoke.main(
                [
                    "plan",
                    "--procedure-id",
                    revoke.PROCEDURE_ID,
                    "--incident-id",
                    "SPDRILL-20260903-INTERRUPT",
                ]
            )
        self.assertEqual(return_code, 1)
        payload = output.call_args.args[0]
        self.assertEqual(payload["status"], "failed")
        self.assertEqual(payload["error"], "operation_failed")
        self.assertEqual(payload["toolSha256"], TEST_TARGET_SHA256)
        sha256.assert_called_once_with(Path(revoke.__file__))

    def test_destructive_ambiguity_paths_return_machine_readable_counts(self) -> None:
        arguments = [
            "execute",
            "--procedure-id",
            revoke.PROCEDURE_ID,
            "--incident-id",
            "SPINC-20260903-099",
            "--expect-oauth",
            "1",
            "--expect-consents",
            "2",
            "--expect-sessions",
            "3",
            "--expect-idempotency",
            "4",
            "--expect-target-sha256",
            TEST_TARGET_SHA256,
            "--expect-tool-sha256",
            revoke._sha256(Path(revoke.__file__)),
            "--confirm",
            revoke.CONFIRMATION,
        ]
        with (
            mock.patch.object(
                revoke,
                "_run",
                side_effect=revoke.DatabaseApplyOutcomeUnverified(
                    "database_apply_outcome_unverified"
                ),
            ),
            mock.patch.object(revoke, "_print_output") as output,
        ):
            self.assertEqual(revoke.main(arguments), 1)
        payload = output.call_args.args[0]
        self.assertEqual(payload["status"], "apply_outcome_unverified")
        self.assertEqual(
            payload["expectedCounts"],
            {
                "oauthAuthorizations": 1,
                "oauthConsents": 2,
                "learningSessions": 3,
                "sessionIdempotency": 4,
            },
        )
        self.assertNotIn("counts", payload)
        self.assertEqual(payload["expectedTargetSha256"], TEST_TARGET_SHA256)

        with (
            mock.patch.object(
                revoke,
                "_run",
                side_effect=revoke.AppliedButContainmentUnverified(
                    (5, 6, 7, 8, TEST_TARGET_SHA256)
                ),
            ),
            mock.patch.object(revoke, "_print_output") as output,
        ):
            self.assertEqual(revoke.main(arguments), 1)
        payload = output.call_args.args[0]
        self.assertEqual(payload["status"], "applied_but_containment_unverified")
        self.assertEqual(
            payload["counts"],
            {
                "oauthAuthorizations": 5,
                "oauthConsents": 6,
                "learningSessions": 7,
                "sessionIdempotency": 8,
            },
        )
        self.assertEqual(payload["targetSha256"], TEST_TARGET_SHA256)

    def test_interrupt_after_commit_is_reported_as_containment_unverified(self) -> None:
        args = argparse.Namespace(
            operation="execute",
            service_name="skillpilot",
            environment_file="/etc/skillpilot/skillpilot.env",
            expect_oauth=1,
            expect_consents=2,
            expect_sessions=3,
            expect_idempotency=4,
            expect_target_sha256=TEST_TARGET_SHA256,
        )
        process_environment = {
            "POSTGRES_HOST": "db",
            "POSTGRES_PORT": "5432",
            "POSTGRES_DB": "skillpilot",
            "POSTGRES_USER": "skillpilot",
            "POSTGRES_PASSWORD": "secret",
        }
        with (
            mock.patch.object(revoke.os, "geteuid", return_value=0),
            mock.patch.object(revoke, "_validate_installed_tool"),
            mock.patch.object(revoke, "_validate_environment_file"),
            mock.patch.object(
                revoke,
                "_validate_service_environment",
                return_value=(
                    process_environment,
                    (4242, 4243, "/system.slice/skillpilot.service"),
                ),
            ),
            mock.patch.object(revoke, "_validate_service_process_unchanged"),
            mock.patch.object(
                revoke,
                "_validate_nginx_containment",
                side_effect=[None, KeyboardInterrupt()],
            ),
            mock.patch.object(
                revoke,
                "_run_psql",
                return_value=(1, 2, 3, 4, TEST_TARGET_SHA256),
            ),
            self.assertRaises(revoke.AppliedButContainmentUnverified) as raised,
        ):
            revoke._run(args, revoke._sha256(Path(revoke.__file__)))
        self.assertEqual(raised.exception.counts, (1, 2, 3, 4))
        self.assertEqual(raised.exception.target_sha256, TEST_TARGET_SHA256)

    def test_root_commands_use_fixed_path_independent_anchors(self) -> None:
        self.assertEqual(
            revoke.TRUSTED_COMMAND_PATHS,
            {
                "curl": Path("/usr/bin/curl"),
                "nginx": Path("/usr/sbin/nginx"),
                "psql": Path("/usr/bin/psql"),
                "systemctl": Path("/usr/bin/systemctl"),
            },
        )
        safe = mock.Mock(st_mode=stat_mode(0o755), st_uid=0, st_gid=0)
        with (
            mock.patch.object(Path, "lstat", return_value=safe),
            mock.patch.object(revoke, "_validate_secure_parent_directories"),
            mock.patch.dict(revoke.os.environ, {"PATH": "/tmp/attacker"}, clear=True),
        ):
            self.assertEqual(revoke._require_command("psql"), "/usr/bin/psql")

        unsafe = mock.Mock(st_mode=stat_mode(0o777), st_uid=0, st_gid=0)
        with (
            mock.patch.object(Path, "lstat", return_value=unsafe),
            mock.patch.object(revoke, "_validate_secure_parent_directories"),
            self.assertRaises(revoke.ToolError) as raised,
        ):
            revoke._require_command("psql")
        self.assertEqual(raised.exception.code, "unsafe_psql_command")

    def test_root_command_accepts_only_a_fully_validated_symlink_chain(self) -> None:
        anchor = Path("/usr/bin/psql")
        alternative = Path("/etc/alternatives/pgsql-psql")
        target = Path("/usr/pgsql-18/bin/psql")
        metadata = {
            anchor: mock.Mock(st_mode=symlink_stat_mode(), st_uid=0, st_gid=0),
            alternative: mock.Mock(st_mode=symlink_stat_mode(), st_uid=0, st_gid=0),
            target: mock.Mock(st_mode=stat_mode(0o755), st_uid=0, st_gid=0),
        }
        links = {
            anchor: "/etc/alternatives/pgsql-psql",
            alternative: "/usr/pgsql-18/bin/psql",
        }

        with (
            mock.patch.object(
                Path,
                "lstat",
                autospec=True,
                side_effect=lambda path: metadata[path],
            ),
            mock.patch.object(
                revoke.os,
                "readlink",
                side_effect=lambda path: links[path],
            ),
            mock.patch.object(
                revoke, "_validate_secure_parent_directories"
            ) as validate_parents,
            mock.patch.dict(revoke.os.environ, {"PATH": "/tmp/attacker"}, clear=True),
        ):
            self.assertEqual(revoke._require_command("psql"), str(target))

        self.assertEqual(
            [call.args[0] for call in validate_parents.call_args_list],
            [anchor, alternative, target],
        )

    def test_root_command_resolves_a_safe_relative_symlink(self) -> None:
        anchor = Path("/usr/bin/psql")
        target = Path("/usr/pgsql-18/bin/psql")
        metadata = {
            anchor: mock.Mock(st_mode=symlink_stat_mode(), st_uid=0, st_gid=0),
            target: mock.Mock(st_mode=stat_mode(0o755), st_uid=0, st_gid=0),
        }
        with (
            mock.patch.object(
                Path,
                "lstat",
                autospec=True,
                side_effect=lambda path: metadata[path],
            ),
            mock.patch.object(
                revoke.os,
                "readlink",
                return_value="../pgsql-18/bin/psql",
            ),
            mock.patch.object(revoke, "_validate_secure_parent_directories"),
        ):
            self.assertEqual(revoke._require_command("psql"), str(target))

    def test_root_command_rejects_unsafe_symlink_chains(self) -> None:
        anchor = Path("/usr/bin/psql")
        alternative = Path("/etc/alternatives/pgsql-psql")
        target = Path("/usr/pgsql-18/bin/psql")
        safe_link = mock.Mock(st_mode=symlink_stat_mode(), st_uid=0, st_gid=0)

        cases = (
            (
                "non-root link",
                {anchor: mock.Mock(st_mode=symlink_stat_mode(), st_uid=1000, st_gid=0)},
                {anchor: str(target)},
                False,
            ),
            (
                "non-root link group",
                {anchor: mock.Mock(st_mode=symlink_stat_mode(), st_uid=0, st_gid=1000)},
                {anchor: str(target)},
                False,
            ),
            (
                "dangling target",
                {anchor: safe_link},
                {anchor: str(target)},
                True,
            ),
            (
                "cycle",
                {anchor: safe_link, alternative: safe_link},
                {anchor: str(alternative), alternative: str(anchor)},
                False,
            ),
            (
                "unsafe final mode",
                {
                    anchor: safe_link,
                    target: mock.Mock(st_mode=stat_mode(0o775), st_uid=0, st_gid=0),
                },
                {anchor: str(target)},
                False,
            ),
            (
                "non-root final owner",
                {
                    anchor: safe_link,
                    target: mock.Mock(st_mode=stat_mode(0o755), st_uid=1000, st_gid=0),
                },
                {anchor: str(target)},
                False,
            ),
            (
                "non-executable final target",
                {
                    anchor: safe_link,
                    target: mock.Mock(st_mode=stat_mode(0o644), st_uid=0, st_gid=0),
                },
                {anchor: str(target)},
                False,
            ),
            (
                "special final mode",
                {
                    anchor: safe_link,
                    target: mock.Mock(st_mode=stat_mode(0o4755), st_uid=0, st_gid=0),
                },
                {anchor: str(target)},
                False,
            ),
            (
                "non-regular final target",
                {
                    anchor: safe_link,
                    target: mock.Mock(st_mode=0o040755, st_uid=0, st_gid=0),
                },
                {anchor: str(target)},
                False,
            ),
        )

        for label, metadata, links, dangling in cases:

            def lstat(path: Path) -> mock.Mock:
                if dangling and path == target:
                    raise FileNotFoundError(target)
                return metadata[path]

            with (
                self.subTest(label=label),
                mock.patch.object(Path, "lstat", autospec=True, side_effect=lstat),
                mock.patch.object(
                    revoke.os,
                    "readlink",
                    side_effect=lambda path: links[path],
                ),
                mock.patch.object(revoke, "_validate_secure_parent_directories"),
                self.assertRaises(revoke.ToolError) as raised,
            ):
                revoke._require_command("psql")
            self.assertEqual(raised.exception.code, "unsafe_psql_command")

        with (
            mock.patch.object(Path, "lstat", return_value=safe_link),
            mock.patch.object(revoke.os, "readlink", side_effect=OSError("unreadable")),
            mock.patch.object(revoke, "_validate_secure_parent_directories"),
            self.assertRaises(revoke.ToolError) as unreadable,
        ):
            revoke._require_command("psql")
        self.assertEqual(unreadable.exception.code, "unsafe_psql_command")

        with (
            mock.patch.object(Path, "lstat", return_value=safe_link),
            mock.patch.object(revoke.os, "readlink", return_value=str(alternative)),
            mock.patch.object(revoke, "_validate_secure_parent_directories"),
            mock.patch.object(revoke, "MAX_TRUSTED_COMMAND_SYMLINKS", 1),
            self.assertRaises(revoke.ToolError) as too_long,
        ):
            revoke._require_command("psql")
        self.assertEqual(too_long.exception.code, "unsafe_psql_command")

    def test_root_command_rejects_an_unsafe_intermediate_parent(self) -> None:
        alternative = Path("/etc/alternatives/pgsql-psql")
        safe_link = mock.Mock(st_mode=symlink_stat_mode(), st_uid=0, st_gid=0)

        def validate(path: Path, **_: str) -> None:
            if path == alternative:
                raise revoke.ToolError("unsafe_command_parent")

        with (
            mock.patch.object(Path, "lstat", return_value=safe_link),
            mock.patch.object(revoke.os, "readlink", return_value=str(alternative)),
            mock.patch.object(
                revoke, "_validate_secure_parent_directories", side_effect=validate
            ),
            self.assertRaises(revoke.ToolError) as raised,
        ):
            revoke._require_command("psql")
        self.assertEqual(raised.exception.code, "unsafe_command_parent")

    def test_database_subprocess_uses_the_resolved_command_target(self) -> None:
        resolved_target = "/usr/pgsql-18/bin/psql"
        completed = subprocess.CompletedProcess(
            args=[resolved_target],
            returncode=0,
            stdout=revoke.RESULT_PREFIX + f"0|0|0|0|{TEST_TARGET_SHA256}\n",
            stderr="",
        )
        process_environment = {
            "POSTGRES_HOST": "db.internal",
            "POSTGRES_PORT": "5432",
            "POSTGRES_DB": "skillpilot",
            "POSTGRES_USER": "skillpilot",
            "POSTGRES_PASSWORD": "secret",
        }
        with (
            mock.patch.object(revoke, "_require_command", return_value=resolved_target),
            mock.patch.object(revoke.subprocess, "run", return_value=completed) as run,
        ):
            revoke._run_psql(revoke.PLAN_SQL, process_environment)
        self.assertEqual(run.call_args.args[0][0], resolved_target)

    def test_nginx_guard_allows_acme_only_but_rejects_the_internal_proxy(self) -> None:
        acme_only = subprocess.CompletedProcess(
            args=["nginx", "-T"],
            returncode=0,
            stdout=(
                "server { server_name mcp-claude-v1.skillpilot.com; "
                f'add_header {revoke.CONTAINMENT_HEADER_NAME} "{revoke.CONTAINMENT_MARKER}" always; '
                "return 404; }"
            ),
            stderr="",
        )
        active_proxy = subprocess.CompletedProcess(
            args=["nginx", "-T"],
            returncode=0,
            stdout="proxy_pass http://127.0.0.1:8787/internal/connectors/claude/v1/mcp;",
            stderr="",
        )
        live_404 = subprocess.CompletedProcess(
            args=["curl"],
            returncode=0,
            stdout=(
                "HTTP/1.1 404 Not Found\r\n"
                f"{revoke.CONTAINMENT_HEADER_NAME}: {revoke.CONTAINMENT_MARKER}\r\n"
                "\r\n"
                f"{revoke.LIVE_STATUS_PREFIX}404"
            ),
            stderr="",
        )
        live_401 = subprocess.CompletedProcess(
            args=["curl"],
            returncode=0,
            stdout=(f"HTTP/1.1 401 Unauthorized\r\n\r\n{revoke.LIVE_STATUS_PREFIX}401"),
            stderr="",
        )
        with (
            mock.patch.object(revoke, "_validate_containment_config_file"),
            mock.patch.object(
                revoke,
                "_require_command",
                side_effect=lambda name: str(revoke.TRUSTED_COMMAND_PATHS[name]),
            ),
            mock.patch.object(
                revoke.subprocess, "run", side_effect=[acme_only, live_404]
            ) as run,
        ):
            revoke._validate_nginx_containment()
        self.assertEqual(run.call_args_list[1].kwargs["env"], {"LC_ALL": "C"})
        self.assertIn(
            f"{revoke.CLAUDE_V1_ORIGIN}:443:127.0.0.1",
            run.call_args_list[1].args[0],
        )
        with (
            mock.patch.object(revoke, "_validate_containment_config_file"),
            mock.patch.object(
                revoke,
                "_require_command",
                side_effect=lambda name: str(revoke.TRUSTED_COMMAND_PATHS[name]),
            ),
            mock.patch.object(revoke.subprocess, "run", return_value=active_proxy),
            self.assertRaises(revoke.ToolError) as raised,
        ):
            revoke._validate_nginx_containment()
        self.assertEqual(raised.exception.code, "claude_v1_proxy_still_active")

        with (
            mock.patch.object(revoke, "_validate_containment_config_file"),
            mock.patch.object(
                revoke,
                "_require_command",
                side_effect=lambda name: str(revoke.TRUSTED_COMMAND_PATHS[name]),
            ),
            mock.patch.object(
                revoke.subprocess, "run", side_effect=[acme_only, live_401]
            ),
            self.assertRaises(revoke.ToolError) as live_route,
        ):
            revoke._validate_nginx_containment()
        self.assertEqual(
            live_route.exception.code, "claude_v1_live_route_not_contained"
        )

    def test_containment_vhost_source_matches_the_embedded_hash(self) -> None:
        source = (
            Path(__file__).resolve().parent.parent
            / "deploy/nginx/skillpilot-claude-connector-v1-contained.conf"
        )
        self.assertEqual(revoke._sha256(source), revoke.CONTAINMENT_CONFIG_SHA256)
        contents = source.read_text(encoding="utf-8")
        self.assertIn(revoke.CONTAINMENT_MARKER, contents)
        self.assertNotIn("proxy_pass", contents)
        self.assertEqual(contents.count("access_log off;"), 1)

    def test_integration_harness_accepts_only_confirmed_local_test_database(
        self,
    ) -> None:
        valid = _disposable_test_connection_environment(
            "postgresql://postgres:test@127.0.0.1:5432/skillpilot_revoke_test",
            DISPOSABLE_TEST_CONFIRMATION,
        )
        self.assertEqual(valid["PGHOST"], "127.0.0.1")
        self.assertEqual(valid["PGDATABASE"], DISPOSABLE_TEST_DATABASE)

        for dsn, confirmation in (
            (
                "postgresql://postgres:test@127.0.0.1/skillpilot_revoke_test",
                "",
            ),
            (
                "postgresql://postgres:test@db.example/skillpilot_revoke_test",
                DISPOSABLE_TEST_CONFIRMATION,
            ),
            (
                "postgresql://postgres:test@127.0.0.1/skillpilot",
                DISPOSABLE_TEST_CONFIRMATION,
            ),
        ):
            with (
                self.subTest(dsn=dsn, confirmation=confirmation),
                self.assertRaisesRegex(ValueError, "unsafe disposable"),
            ):
                _disposable_test_connection_environment(dsn, confirmation)

    def test_every_command_line_enable_override_is_rejected(self) -> None:
        overrides = (
            "--skillpilot.claude.connector.v1.enabled=true",
            "--skillpilot.claude.connector.v1.enabled=false",
            "--skillpilot.claude.connector.v1.enabled=1",
            "--skillpilot.claude.connector.v1.enabled=on",
            '{"skillpilot":{"claude":{"connector":{"v1":{"enabled":true}}}}}',
            "SKILLPILOT_CLAUDE_ENABLED=yes",
        )
        for override in overrides:
            with self.subTest(override=override):
                self.assertTrue(revoke._contains_claude_enable_override(override))
        self.assertFalse(
            revoke._contains_claude_enable_override("-Dlogging.level.root=INFO")
        )

    def test_containment_rejects_boolean_aliases_and_all_override_channels(
        self,
    ) -> None:
        contained = {"SKILLPILOT_CLAUDE_CONNECTOR_V1_ENABLED": "false"}
        revoke._validate_feature_flag_containment(contained, b"java\0-jar\0app.jar\0")

        for value in ("1", "on", "yes", "true"):
            with (
                self.subTest(source="connector_env", value=value),
                self.assertRaises(revoke.ToolError),
            ):
                revoke._validate_feature_flag_containment(
                    {"SKILLPILOT_CLAUDE_CONNECTOR_V1_ENABLED": value},
                    b"java\0-jar\0app.jar\0",
                )
            with (
                self.subTest(source="legacy_env", value=value),
                self.assertRaises(revoke.ToolError),
            ):
                revoke._validate_feature_flag_containment(
                    {
                        **contained,
                        "SKILLPILOT_CLAUDE_ENABLED": value,
                    },
                    b"java\0-jar\0app.jar\0",
                )

        option_sources = (
            (b"java\0--skillpilot.claude.connector.v1.enabled=1\0", {}),
            (
                b"java\0-jar\0app.jar\0",
                {"JAVA_TOOL_OPTIONS": "-Dskillpilot.claude.enabled=on"},
            ),
            (
                b"java\0-jar\0app.jar\0",
                {"_JAVA_OPTIONS": "-Dskillpilot.claude.connector.v1.enabled=yes"},
            ),
        )
        for command_line, options in option_sources:
            with self.subTest(options=options), self.assertRaises(revoke.ToolError):
                revoke._validate_feature_flag_containment(
                    {**contained, **options}, command_line
                )

        with self.assertRaises(revoke.ToolError) as lowercase_alias:
            revoke._validate_feature_flag_containment(
                {
                    **contained,
                    "skillpilot_claude_connector_v1_enabled": "true",
                },
                b"java\0-jar\0app.jar\0",
            )
        self.assertEqual(lowercase_alias.exception.code, "claude_v1_flag_not_false")

    def test_environment_file_must_be_root_owned_regular_0600(self) -> None:
        safe = mock.Mock(st_mode=stat_mode(0o600), st_uid=0, st_gid=0)
        unsafe = mock.Mock(st_mode=stat_mode(0o644), st_uid=0, st_gid=0)
        with mock.patch.object(Path, "lstat", return_value=safe):
            revoke._validate_environment_file(Path("/etc/skillpilot/skillpilot.env"))
        with (
            mock.patch.object(Path, "lstat", return_value=unsafe),
            self.assertRaises(revoke.ToolError) as raised,
        ):
            revoke._validate_environment_file(Path("/etc/skillpilot/skillpilot.env"))
        self.assertEqual(raised.exception.code, "unsafe_environment_mode")

    def test_installed_tool_parent_chain_must_not_be_replaceable(self) -> None:
        safe = mock.Mock(st_mode=0o040755, st_uid=0, st_gid=0)
        unsafe = mock.Mock(st_mode=0o040777, st_uid=0, st_gid=0)
        with mock.patch.object(Path, "lstat", return_value=safe):
            revoke._validate_secure_parent_directories(revoke.INSTALL_PATH)
        with (
            mock.patch.object(Path, "lstat", return_value=unsafe),
            self.assertRaises(revoke.ToolError) as raised,
        ):
            revoke._validate_secure_parent_directories(revoke.INSTALL_PATH)
        self.assertEqual(raised.exception.code, "unsafe_tool_parent")


def stat_mode(permissions: int) -> int:
    return 0o100000 | permissions


def symlink_stat_mode() -> int:
    return 0o120000 | 0o777


class ClaudeV1RevokePostgresIntegrationTest(unittest.TestCase):
    """Exact PostgreSQL-dialect test; enabled by an explicit disposable DSN."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.dsn = os.environ.get("SKILLPILOT_CLAUDE_V1_REVOKE_TEST_DSN", "")
        confirmation = os.environ.get("SKILLPILOT_CLAUDE_V1_REVOKE_TEST_CONFIRM", "")
        cls.psql = shutil.which("psql") or ""
        if not cls.dsn or not cls.psql:
            raise unittest.SkipTest("disposable PostgreSQL DSN and psql are required")
        cls.connection_environment = _disposable_test_connection_environment(
            cls.dsn, confirmation
        )

    def setUp(self) -> None:
        suffix = uuid.uuid4().hex
        self.database = "sp_revoke_" + suffix
        self.role = "sp_revoke_role_" + suffix
        self.role_password = "skillpilot-disposable-role-only"
        self._admin_sql(
            f"CREATE ROLE {self.role} LOGIN PASSWORD '{self.role_password}';"
        )
        self.addCleanup(self._drop_disposable_database_and_role)
        self._admin_sql(f"CREATE DATABASE {self.database} OWNER {self.role};")
        self._sql(FIXTURE_SQL)
        plan = self._invoke(revoke.PLAN_SQL)
        self.assertEqual(plan.returncode, 0, "initial target plan failed")
        plan_result = revoke._parse_result(plan.stdout)
        self.assertEqual(plan_result[:4], (2, 2, 2, 3))
        self.target_sha256 = plan_result[4]

    def _drop_disposable_database_and_role(self) -> None:
        self._admin_sql(f"DROP DATABASE IF EXISTS {self.database} WITH (FORCE);")
        self._admin_sql(f"DROP ROLE IF EXISTS {self.role};")

    def _environment(self, *, admin: bool) -> dict[str, str]:
        environment = {
            "LC_ALL": "C",
            "PGCONNECT_TIMEOUT": "10",
            **self.connection_environment,
        }
        if not admin:
            environment["PGDATABASE"] = self.database
            environment["PGUSER"] = self.role
            environment["PGPASSWORD"] = self.role_password
        return environment

    def _invoke(
        self,
        sql: str,
        *,
        admin: bool = False,
        variables: dict[str, int | str] | None = None,
        extra_environment: dict[str, str] | None = None,
    ) -> subprocess.CompletedProcess[str]:
        command = [
            self.psql,
            "-X",
            "--no-password",
            "--set=ON_ERROR_STOP=1",
            "--quiet",
            "--tuples-only",
            "--no-align",
        ]
        for name, value in sorted((variables or {}).items()):
            command.append(f"--set={name}={value}")
        environment = self._environment(admin=admin)
        environment.update(extra_environment or {})
        return subprocess.run(
            command,
            input=sql,
            capture_output=True,
            text=True,
            timeout=45,
            check=False,
            env=environment,
        )

    def _admin_sql(self, sql: str) -> None:
        completed = self._invoke(sql, admin=True)
        if completed.returncode != 0:
            self.fail("disposable PostgreSQL fixture administration failed")

    def _sql(self, sql: str) -> None:
        completed = self._invoke(sql)
        if completed.returncode != 0:
            self.fail("disposable PostgreSQL fixture setup failed")

    def _query_counts(self, *, superuser: bool = False) -> tuple[int, ...]:
        completed = self._invoke(
            NEGATIVE_CONTROL_QUERY,
            admin=superuser,
            extra_environment={"PGDATABASE": self.database} if superuser else None,
        )
        self.assertEqual(completed.returncode, 0, "negative-control query failed")
        line = next(line for line in completed.stdout.splitlines() if line.strip())
        return tuple(int(value) for value in line.strip().split("|"))

    @staticmethod
    def _execute_sql(
        oauth: int,
        consents: int,
        sessions: int,
        idempotency: int,
        target_sha256: str,
    ) -> tuple[str, dict[str, int | str]]:
        args = argparse.Namespace(
            expect_oauth=oauth,
            expect_consents=consents,
            expect_sessions=sessions,
            expect_idempotency=idempotency,
            expect_target_sha256=target_sha256,
        )
        return revoke._execute_sql_with_expected(args), {
            "expect_oauth": oauth,
            "expect_consents": consents,
            "expect_sessions": sessions,
            "expect_idempotency": idempotency,
            "expect_target_sha256": target_sha256,
        }

    def _execute(
        self,
        oauth: int,
        consents: int,
        sessions: int,
        idempotency: int,
        *,
        target_sha256: str | None = None,
    ) -> subprocess.CompletedProcess[str]:
        sql, variables = self._execute_sql(
            oauth,
            consents,
            sessions,
            idempotency,
            target_sha256 or self.target_sha256,
        )
        return self._invoke(sql, variables=variables)

    def test_exact_scope_is_deleted_and_second_zero_run_is_idempotent(self) -> None:
        plan = self._invoke(revoke.PLAN_SQL)
        self.assertEqual(plan.returncode, 0, "plan failed")
        plan_result = revoke._parse_result(plan.stdout)
        self.assertEqual(plan_result[:4], (2, 2, 2, 3))
        self.assertEqual(plan_result[4], self.target_sha256)

        execute = self._execute(2, 2, 2, 3)
        self.assertEqual(execute.returncode, 0, "execute failed")
        self.assertEqual(revoke._parse_result(execute.stdout), plan_result)
        self.assertEqual(
            self._query_counts(),
            (0, 0, 0, 0, 1, 1, 1, 1, 1, 3, 1),
            "foreign provider, learner, clients, or legacy audit state changed",
        )

        second = self._execute(0, 0, 0, 0)
        self.assertEqual(second.returncode, 0, "idempotent zero execute failed")
        second_result = revoke._parse_result(second.stdout)
        self.assertEqual(second_result[:4], (0, 0, 0, 0))
        self.assertEqual(second_result[4], self.target_sha256)

    def test_wrong_target_fingerprint_fails_without_mutation(self) -> None:
        wrong_target = "0" * 64
        self.assertNotEqual(wrong_target, self.target_sha256)
        execute = self._execute(
            2,
            2,
            2,
            3,
            target_sha256=wrong_target,
        )
        self.assertNotEqual(execute.returncode, 0)
        self.assertEqual(self._query_counts()[:4], (2, 2, 2, 3))

    def test_non_public_effective_schema_fails_without_mutation(self) -> None:
        self._sql(
            """
            CREATE SCHEMA poison;
            CREATE TABLE poison.databasechangelog (id text, exectype text);
            """
        )
        plan = self._invoke(
            revoke.PLAN_SQL,
            extra_environment={"PGOPTIONS": "-c search_path=poison,public"},
        )
        self.assertNotEqual(plan.returncode, 0, "non-public schema was accepted")
        self.assertEqual(self._query_counts()[:4], (2, 2, 2, 3))

    def test_execute_table_locks_exclude_concurrent_oauth_writers(self) -> None:
        locker_sql = """
            BEGIN;
            SELECT 1
              FROM public.oauth2_authorization_consent
             WHERE principal_name = 'spca_hosted'
               FOR UPDATE;
            SELECT pg_sleep(2);
            COMMIT;
        """
        with ThreadPoolExecutor(max_workers=2) as executor:
            locker_future = executor.submit(
                self._invoke,
                locker_sql,
                extra_environment={"PGAPPNAME": "sp-revoke-row-locker"},
            )
            locker_ready = False
            for _ in range(30):
                lock_state = self._invoke(
                    """
                    SELECT count(*)
                      FROM pg_catalog.pg_locks l
                      JOIN pg_catalog.pg_stat_activity a ON a.pid = l.pid
                     WHERE a.application_name = 'sp-revoke-row-locker'
                       AND l.relation = 'public.oauth2_authorization_consent'::regclass
                       AND l.mode = 'RowShareLock'
                       AND l.granted;
                    """
                )
                if "1" in lock_state.stdout.split():
                    locker_ready = True
                    break
                time.sleep(0.1)
            self.assertTrue(locker_ready, "row-lock fixture did not acquire its lock")

            execute_future = executor.submit(self._execute, 2, 2, 2, 3)
            execute_lock_ready = False
            for _ in range(30):
                lock_state = self._invoke(
                    """
                    SELECT count(*)
                     FROM pg_catalog.pg_locks
                     WHERE relation = 'public.oauth2_authorization_consent'::regclass
                       AND mode = 'ShareRowExclusiveLock'
                       AND granted;
                    """
                )
                if "1" in lock_state.stdout.split():
                    execute_lock_ready = True
                    break
                time.sleep(0.1)
            self.assertTrue(
                execute_lock_ready,
                "execute did not acquire its writer-excluding table lock",
            )

            writer = self._invoke(
                """
                SET lock_timeout = '500ms';
                INSERT INTO public.oauth2_authorization
                    (id, registered_client_id, principal_name, attributes)
                VALUES (
                    'concurrent-v1',
                    'hosted',
                    'spca_concurrent',
                    '{"skillpilot_provider":"claude-v1"}'
                );
                """
            )
            locker = locker_future.result(timeout=10)
            execute = execute_future.result(timeout=10)
        self.assertEqual(locker.returncode, 0, "row-lock fixture failed")
        self.assertNotEqual(writer.returncode, 0, "concurrent writer bypassed lock")
        self.assertEqual(execute.returncode, 0, "locked execute failed")
        execute_result = revoke._parse_result(execute.stdout)
        self.assertEqual(execute_result[:4], (2, 2, 2, 3))
        self.assertEqual(execute_result[4], self.target_sha256)

    def test_preexisting_oauth_writer_cannot_commit_outside_execute_snapshot(
        self,
    ) -> None:
        writer_sql = """
            BEGIN;
            INSERT INTO public.oauth2_authorization
                (id, registered_client_id, principal_name, attributes)
            VALUES (
                'preexisting-v1',
                'hosted',
                'spca_preexisting',
                '{"skillpilot_provider":"claude-v1"}'
            );
            SELECT pg_sleep(2);
            COMMIT;
        """
        with ThreadPoolExecutor(max_workers=2) as executor:
            writer_future = executor.submit(
                self._invoke,
                writer_sql,
                extra_environment={"PGAPPNAME": "sp-revoke-preexisting-writer"},
            )
            writer_ready = False
            for _ in range(30):
                lock_state = self._invoke(
                    """
                    SELECT count(*)
                      FROM pg_catalog.pg_locks l
                      JOIN pg_catalog.pg_stat_activity a ON a.pid = l.pid
                     WHERE a.application_name = 'sp-revoke-preexisting-writer'
                       AND l.relation = 'public.oauth2_authorization'::regclass
                       AND l.mode = 'RowExclusiveLock'
                       AND l.granted;
                    """
                )
                if "1" in lock_state.stdout.split():
                    writer_ready = True
                    break
                time.sleep(0.1)
            self.assertTrue(
                writer_ready, "pre-existing writer did not acquire its lock"
            )
            execute_future = executor.submit(self._execute, 2, 2, 2, 3)
            writer = writer_future.result(timeout=10)
            execute = execute_future.result(timeout=10)
        self.assertEqual(writer.returncode, 0, "pre-existing writer fixture failed")
        self.assertNotEqual(
            execute.returncode,
            0,
            "execute used a snapshot from before the pre-existing writer committed",
        )
        self.assertEqual(self._query_counts()[:4], (3, 2, 2, 3))

    def test_unexpected_cascade_fails_before_mutation(self) -> None:
        self._sql(
            """
            CREATE TABLE unexpected_cascade (
                token_hash varchar(128) REFERENCES public.claude_v1_learning_session(token_hash)
                    ON DELETE CASCADE
            );
            INSERT INTO unexpected_cascade VALUES ('session-1');
            """
        )
        execute = self._execute(2, 2, 2, 3)
        self.assertNotEqual(execute.returncode, 0)
        self.assertEqual(self._query_counts()[:4], (2, 2, 2, 3))
        remaining = self._invoke("SELECT count(*) FROM unexpected_cascade;")
        self.assertIn("1", remaining.stdout)

    def test_user_delete_trigger_fails_before_mutation(self) -> None:
        self._sql(
            """
            CREATE TABLE unexpected_delete_audit (value text);
            CREATE FUNCTION audit_authorization_delete() RETURNS trigger
            LANGUAGE plpgsql AS $$
            BEGIN
                INSERT INTO unexpected_delete_audit VALUES ('unexpected');
                RETURN OLD;
            END
            $$;
            CREATE TRIGGER audit_authorization_delete
            AFTER DELETE ON public.oauth2_authorization
            FOR EACH ROW EXECUTE FUNCTION audit_authorization_delete();
            """
        )
        execute = self._execute(2, 2, 2, 3)
        self.assertNotEqual(execute.returncode, 0)
        self.assertEqual(self._query_counts()[:4], (2, 2, 2, 3))
        audit = self._invoke("SELECT count(*) FROM unexpected_delete_audit;")
        self.assertIn("0", audit.stdout)

    def test_row_level_security_fails_before_mutation(self) -> None:
        self._sql(
            """
            ALTER TABLE public.claude_v1_learning_session ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.claude_v1_learning_session FORCE ROW LEVEL SECURITY;
            """
        )
        execute = self._execute(2, 2, 2, 3)
        self.assertNotEqual(execute.returncode, 0)
        self.assertEqual(self._query_counts(superuser=True)[:4], (2, 2, 2, 3))

    def test_table_inheritance_fails_before_mutation(self) -> None:
        self._sql(
            """
            CREATE TABLE unexpected_session_child ()
                INHERITS (public.claude_v1_learning_session);
            """
        )
        execute = self._execute(2, 2, 2, 3)
        self.assertNotEqual(execute.returncode, 0)
        self.assertEqual(self._query_counts()[:4], (2, 2, 2, 3))

    def test_v1_principal_on_foreign_client_fails_before_mutation(self) -> None:
        self._sql(
            """
            INSERT INTO oauth2_authorization
                (id, registered_client_id, principal_name, attributes)
            VALUES ('foreign-spca', 'openai', 'spca_foreign', '{"legacy":true}');
            """
        )
        execute = self._execute(2, 2, 2, 3)
        self.assertNotEqual(execute.returncode, 0)
        self.assertEqual(self._query_counts()[:4], (2, 2, 2, 3))

    def test_null_principal_with_v1_marker_fails_before_mutation(self) -> None:
        self._sql(
            """
            ALTER TABLE oauth2_authorization
                ALTER COLUMN principal_name DROP NOT NULL;
            INSERT INTO oauth2_authorization
                (id, registered_client_id, principal_name, attributes)
            VALUES (
                'null-principal-v1',
                'hosted',
                NULL,
                '{"skillpilot_provider":"claude-v1"}'
            );
            """
        )
        plan = self._invoke(revoke.PLAN_SQL)
        self.assertNotEqual(plan.returncode, 0)
        execute = self._execute(2, 2, 2, 3)
        self.assertNotEqual(execute.returncode, 0)
        remaining = self._invoke(
            "SELECT count(*) FROM oauth2_authorization WHERE id = 'null-principal-v1';"
        )
        self.assertIn("1", remaining.stdout.split())

    def test_duplicate_required_migration_id_fails_before_mutation(self) -> None:
        self._sql(
            """
            INSERT INTO databasechangelog
            VALUES ('023-add-claude-connector-v1', 'EXECUTED');
            """
        )
        plan = self._invoke(revoke.PLAN_SQL)
        self.assertNotEqual(plan.returncode, 0)
        execute = self._execute(2, 2, 2, 3)
        self.assertNotEqual(execute.returncode, 0)
        self.assertEqual(self._query_counts()[:4], (2, 2, 2, 3))

    def test_expected_count_drift_rolls_back_everything(self) -> None:
        execute = self._execute(1, 2, 2, 3)
        self.assertNotEqual(execute.returncode, 0)
        self.assertEqual(self._query_counts()[:4], (2, 2, 2, 3))

    def test_wrong_marker_fails_before_mutation(self) -> None:
        self._sql(
            """
            INSERT INTO oauth2_authorization
                (id, registered_client_id, principal_name, attributes)
            VALUES ('wrong-marker', 'hosted', 'spca_wrong', '{"skillpilot_provider":"other"}');
            """
        )
        execute = self._execute(2, 2, 2, 3)
        self.assertNotEqual(execute.returncode, 0)
        self.assertEqual(self._query_counts()[:4], (2, 2, 2, 3))

    def test_missing_marker_fails_before_mutation(self) -> None:
        self._sql(
            """
            INSERT INTO oauth2_authorization
                (id, registered_client_id, principal_name, attributes)
            VALUES ('missing-marker', 'hosted', 'spca_missing', '{}');
            """
        )
        execute = self._execute(2, 2, 2, 3)
        self.assertNotEqual(execute.returncode, 0)
        self.assertEqual(self._query_counts()[:4], (2, 2, 2, 3))

    def test_late_database_failure_rolls_back_prior_deletes(self) -> None:
        self._sql(
            """
            CREATE TABLE session_delete_blocker (
                token_hash varchar(128) REFERENCES public.claude_v1_learning_session(token_hash)
                    ON DELETE RESTRICT
            );
            INSERT INTO session_delete_blocker VALUES ('session-1');
            """
        )
        execute = self._execute(2, 2, 2, 3)
        self.assertNotEqual(execute.returncode, 0)
        self.assertEqual(self._query_counts()[:4], (2, 2, 2, 3))


FIXTURE_SQL = r"""
CREATE TABLE databasechangelog (id text NOT NULL, exectype text NOT NULL);
INSERT INTO databasechangelog VALUES
    ('023-add-claude-connector-v1', 'EXECUTED'),
    ('024-replace-claude-v1-binding-with-learning-sessions', 'EXECUTED');

CREATE TABLE oauth2_registered_client (
    id varchar(100) PRIMARY KEY,
    client_id varchar(100) NOT NULL UNIQUE
);
INSERT INTO oauth2_registered_client VALUES
    ('hosted', 'https://claude.ai/oauth/mcp-oauth-client-metadata'),
    ('code', 'https://claude.ai/oauth/claude-code-client-metadata'),
    ('openai', 'https://chatgpt.com/oauth/client');

CREATE TABLE oauth2_authorization (
    id varchar(100) PRIMARY KEY,
    registered_client_id varchar(100) NOT NULL,
    principal_name varchar(200) NOT NULL,
    attributes text
);
INSERT INTO oauth2_authorization VALUES
    ('v1-hosted', 'hosted', 'spca_hosted', '{"skillpilot_provider":"claude-v1"}'),
    ('v1-code', 'code', 'spca_code', '{"skillpilot_provider":"claude-v1"}'),
    ('old-beta', 'hosted', 'spc_old_beta', '{"legacy":true}'),
    ('openai-auth', 'openai', 'spoa_openai', '{"skillpilot_provider":"openai-v1"}');

CREATE TABLE oauth2_authorization_consent (
    registered_client_id varchar(100) NOT NULL,
    principal_name varchar(200) NOT NULL,
    authorities text NOT NULL,
    PRIMARY KEY (registered_client_id, principal_name)
);
INSERT INTO oauth2_authorization_consent VALUES
    ('hosted', 'spca_hosted', 'skillpilot.read'),
    ('code', 'spca_code', 'skillpilot.read'),
    ('hosted', 'spc_old_beta', 'skillpilot.read'),
    ('openai', 'spoa_openai', 'skillpilot.read');

CREATE TABLE learner (skillpilot_id varchar(80) PRIMARY KEY);
INSERT INTO learner VALUES ('learner-1');

CREATE TABLE claude_v1_learning_session (
    token_hash varchar(128) PRIMARY KEY,
    learner_id varchar(80) NOT NULL REFERENCES learner(skillpilot_id),
    started_at timestamptz NOT NULL,
    expires_at timestamptz NOT NULL,
    communication_locale varchar(35) NOT NULL,
    state_version bigint NOT NULL
);
INSERT INTO claude_v1_learning_session VALUES
    ('session-1', 'learner-1', now(), now() + interval '1 hour', 'de', 1),
    ('session-2', 'learner-1', now(), now() + interval '1 hour', 'en', 1);

CREATE TABLE claude_v1_session_idempotency (
    token_hash varchar(128) NOT NULL,
    client_request_id varchar(64) NOT NULL,
    PRIMARY KEY (token_hash, client_request_id),
    CONSTRAINT fk_claude_v1_session_idempotency_session
        FOREIGN KEY (token_hash)
        REFERENCES claude_v1_learning_session(token_hash)
        ON DELETE CASCADE
);
INSERT INTO claude_v1_session_idempotency VALUES
    ('session-1', 'request-1'),
    ('session-1', 'request-2'),
    ('session-2', 'request-3');

CREATE TABLE claude_v1_connection (id varchar(128) PRIMARY KEY);
INSERT INTO claude_v1_connection VALUES ('legacy-audit-row');
"""

NEGATIVE_CONTROL_QUERY = r"""
SELECT concat_ws('|',
    (SELECT count(*)
       FROM oauth2_authorization a JOIN oauth2_registered_client rc
         ON rc.id = a.registered_client_id
      WHERE rc.client_id IN (
          'https://claude.ai/oauth/mcp-oauth-client-metadata',
          'https://claude.ai/oauth/claude-code-client-metadata'
      ) AND left(a.principal_name, 5) = 'spca_'
        AND a.attributes::jsonb ->> 'skillpilot_provider' = 'claude-v1'),
    (SELECT count(*) FROM oauth2_authorization_consent WHERE left(principal_name, 5) = 'spca_'),
    (SELECT count(*) FROM claude_v1_learning_session),
    (SELECT count(*) FROM claude_v1_session_idempotency),
    (SELECT count(*) FROM oauth2_authorization WHERE id = 'old-beta'),
    (SELECT count(*) FROM oauth2_authorization WHERE id = 'openai-auth'),
    (SELECT count(*) FROM oauth2_authorization_consent
      WHERE registered_client_id = 'hosted' AND principal_name = 'spc_old_beta'),
    (SELECT count(*) FROM oauth2_authorization_consent
      WHERE registered_client_id = 'openai' AND principal_name = 'spoa_openai'),
    (SELECT count(*) FROM learner),
    (SELECT count(*) FROM oauth2_registered_client),
    (SELECT count(*) FROM claude_v1_connection)
);
"""


if __name__ == "__main__":
    unittest.main()
