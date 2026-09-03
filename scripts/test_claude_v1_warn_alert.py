#!/usr/bin/env python3
"""Hermetic security tests for the Claude v1 redacted WARN alert router."""

from __future__ import annotations

from datetime import datetime, timezone
from email.policy import default
import importlib.util
import io
import json
from pathlib import Path
import re
import smtplib
import ssl
import sys
import tempfile
import unittest
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
ROUTER_PATH = ROOT / "scripts" / "claude_v1_warn_alert.py"
UNIT_PATH = (
    ROOT / "deploy" / "claude-observability" / "skillpilot-claude-v1-warn-alert.service"
)
TEST_UNIT_PATH = (
    ROOT
    / "deploy"
    / "claude-observability"
    / "skillpilot-claude-v1-warn-alert-test.service"
)
INSTALLER_PATH = ROOT / "scripts" / "install_claude_v1_warn_alert.sh"
RUNBOOK_PATH = ROOT / "docs" / "deploy" / "claude-support-readiness-runbook.md"
CONTRACT_PATH = (
    ROOT
    / "backend"
    / "src"
    / "main"
    / "java"
    / "com"
    / "skillpilot"
    / "backend"
    / "connectors"
    / "claude"
    / "v1"
    / "ClaudeV1Contract.java"
)
SPEC = importlib.util.spec_from_file_location("claude_v1_warn_alert", ROUTER_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)


OBSERVED_AT = datetime(2026, 9, 3, 7, 8, 9, tzinfo=timezone.utc)
JOURNAL_TIMESTAMP = str(int(OBSERVED_AT.timestamp() * 1_000_000))


def log_line(
    operation: str,
    duration: str = "123",
    *,
    level: str = "WARN",
    application: str = "skillpilot-backend",
    logger: str = "c.s.b.c.c.v.o.ClaudeV1Telemetry",
) -> str:
    return (
        "2026-09-03T09:08:09.123+02:00 "
        f"{level:>5} 12345 --- [{application}] [nio-8080-exec-1] "
        f"{logger:<40} : Claude v1 operation '{operation}' "
        f"completed with error in {duration} ms"
    )


def journal_record(
    message: object, unit: str = "skillpilot.service"
) -> dict[str, object]:
    return {
        "__CURSOR": "s=abc;i=1;b=def;m=2;t=3;x=4",
        "__REALTIME_TIMESTAMP": JOURNAL_TIMESTAMP,
        "_SYSTEMD_UNIT": unit,
        "MESSAGE": message,
    }


def write_credentials(directory: Path) -> MODULE.Credentials:
    values = {
        MODULE.SMTP_USERNAME_CREDENTIAL: "technical-sender@example.com",
        MODULE.SMTP_PASSWORD_CREDENTIAL: "AppPassword-SENTINEL-123",
        MODULE.RECIPIENT_CREDENTIAL: "private-recipient@example.net",
    }
    for name, value in values.items():
        path = directory / name
        path.write_text(value + "\n", encoding="utf-8")
        path.chmod(0o600)
    return MODULE.load_credentials(directory)


class SignalParserTest(unittest.TestCase):
    def test_accepts_every_canonical_operation_and_reserializes_duration(self) -> None:
        for operation in MODULE.Operation:
            with self.subTest(operation=operation.value):
                event = MODULE.parse_signal(log_line(operation.value), OBSERVED_AT)
                self.assertIsNotNone(event)
                assert event is not None
                self.assertIs(event.operation, operation)
                self.assertEqual(event.duration_millis, 123)
                self.assertEqual(event.observed_at, OBSERVED_AT)

    def test_rejects_every_noncanonical_logger_name(self) -> None:
        operation = MODULE.Operation.GET_COACH_CONTEXT.value
        for logger in (
            "ClaudeV1Telemetry",
            "evil.ClaudeV1Telemetry",
            "a.b.c.ClaudeV1Telemetry",
            (
                "com.skillpilot.backend.connectors.claude.v1.observability."
                "ClaudeV1Telemetry"
            ),
        ):
            with self.subTest(logger=logger):
                self.assertIsNone(
                    MODULE.parse_signal(log_line(operation, logger=logger), OBSERVED_AT)
                )

    def test_rejects_unknown_or_unicode_lookalike_operations(self) -> None:
        for operation in (
            "get_skillpilot_unknown",
            "get_skillpilot_coach_contexт",
            "GET_SKILLPILOT_COACH_CONTEXT",
            "get_skillpilot_coach_context_extra",
        ):
            with self.subTest(operation=operation):
                self.assertIsNone(MODULE.parse_signal(log_line(operation), OBSERVED_AT))

    def test_rejects_noncanonical_durations(self) -> None:
        operation = MODULE.Operation.GET_COACH_CONTEXT.value
        for duration in ("-1", "1.0", "1e3", "01", "999999999", "600001"):
            with self.subTest(duration=duration):
                self.assertIsNone(
                    MODULE.parse_signal(log_line(operation, duration), OBSERVED_AT)
                )
        self.assertIsNotNone(
            MODULE.parse_signal(log_line(operation, "600000"), OBSERVED_AT)
        )

    def test_rejects_wrong_envelope_and_injection_attempts(self) -> None:
        operation = MODULE.Operation.GET_COACH_CONTEXT.value
        valid = log_line(operation)
        cases = (
            valid.replace(" WARN ", "  INFO "),
            log_line(operation, application="other-application"),
            log_line(operation, logger="OtherLogger"),
            "prefix " + valid,
            valid + " suffix",
            valid + "\nBearer spc_SECRET",
            "request-body\n" + valid,
            valid.replace("Claude v1", "\x1b[31mClaude v1"),
            f"Claude v1 operation '{operation}' completed with error in 123 ms",
        )
        for value in cases:
            with self.subTest(value=value[:40]):
                self.assertIsNone(MODULE.parse_signal(value, OBSERVED_AT))

    def test_rejects_overlong_message(self) -> None:
        valid = log_line(MODULE.Operation.GET_COACH_CONTEXT.value)
        self.assertIsNone(
            MODULE.parse_signal(" " * MODULE.MAX_LOG_MESSAGE_BYTES + valid, OBSERVED_AT)
        )

    def test_generic_boot_envelope_matches_only_expected_application_shape(
        self,
    ) -> None:
        valid = log_line(MODULE.Operation.GET_COACH_CONTEXT.value)
        self.assertIsNotNone(MODULE.BOOT_ENVELOPE_PATTERN.match(valid))
        self.assertIsNone(
            MODULE.BOOT_ENVELOPE_PATTERN.match(
                log_line(
                    MODULE.Operation.GET_COACH_CONTEXT.value,
                    application="other-application",
                )
            )
        )

    def test_requires_trusted_timezone(self) -> None:
        with self.assertRaisesRegex(MODULE.AlertError, "journal_time_untrusted"):
            MODULE.parse_signal(
                log_line(MODULE.Operation.GET_COACH_CONTEXT.value),
                datetime(2026, 9, 3),
            )


class JournalBoundaryTest(unittest.TestCase):
    def test_extracts_only_typed_fields_from_exact_unit(self) -> None:
        record = journal_record(log_line(MODULE.Operation.SET_MASTERY.value))
        record["UNTRUSTED_EXTRA"] = "Bearer spc_SENTINEL private@example.org"
        event = MODULE.event_from_journal_record(record, "skillpilot.service")
        self.assertEqual(
            event,
            MODULE.AlertEvent(OBSERVED_AT, MODULE.Operation.SET_MASTERY, 123),
        )
        self.assertNotIn("SENTINEL", repr(event))

    def test_rejects_wrong_unit_non_string_message_and_bad_timestamp(self) -> None:
        valid = log_line(MODULE.Operation.SET_MASTERY.value)
        self.assertIsNone(
            MODULE.event_from_journal_record(
                journal_record(valid, "other.service"), "skillpilot.service"
            )
        )
        self.assertIsNone(
            MODULE.event_from_journal_record(
                journal_record([valid]), "skillpilot.service"
            )
        )
        record = journal_record(valid)
        record["__REALTIME_TIMESTAMP"] = "not-a-number"
        self.assertIsNone(
            MODULE.event_from_journal_record(record, "skillpilot.service")
        )

    def test_journal_command_uses_fixed_argv_without_shell(self) -> None:
        cursor = "s=abc;i=1;b=def;m=2;t=3;x=4"
        command = MODULE.journal_command(
            "/usr/bin/journalctl", "skillpilot.service", cursor
        )
        self.assertEqual(command[0], "/usr/bin/journalctl")
        self.assertIn("--after-cursor", command)
        self.assertIn(cursor, command)
        self.assertNotIn("sh", command)
        for invalid in ("skillpilot", "../skillpilot.service", "x.service\n--all"):
            with self.subTest(invalid=invalid):
                with self.assertRaisesRegex(MODULE.AlertError, "journal_unit_invalid"):
                    MODULE.validate_journal_unit(invalid)

    def test_bounded_reader_discards_one_oversized_record(self) -> None:
        oversized = b"x" * (MODULE.MAX_JOURNAL_RECORD_BYTES + 10) + b"\n"
        valid = json.dumps(journal_record("not a signal")).encode() + b"\n"
        values = list(MODULE.bounded_lines(io.BytesIO(oversized + valid)))
        self.assertIsNone(values[0])
        self.assertEqual(values[1], valid)

    def test_runtime_invocation_marker_is_typed_and_persistent(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            invocation_id = "0123456789abcdef0123456789abcdef"
            with mock.patch.dict(
                MODULE.os.environ, {"INVOCATION_ID": invocation_id}, clear=False
            ):
                MODULE.record_runtime_invocation(directory)
            MODULE.verify_runtime_invocation(directory, invocation_id)
            with self.assertRaisesRegex(MODULE.AlertError, "runtime_invocation_stale"):
                MODULE.verify_runtime_invocation(
                    directory, "fedcba9876543210fedcba9876543210"
                )


class CredentialTest(unittest.TestCase):
    def test_loads_owner_only_credential_files(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            credentials = write_credentials(Path(temporary))
        self.assertEqual(credentials.smtp_username, "technical-sender@example.com")
        self.assertEqual(credentials.recipient, "private-recipient@example.net")

    def test_rejects_header_injection_and_unsafe_permissions(self) -> None:
        with self.assertRaisesRegex(MODULE.AlertError, "credential_email_invalid"):
            MODULE.validate_email("sender@example.com\nBcc: attacker@example.net")
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            write_credentials(directory)
            (directory / MODULE.SMTP_PASSWORD_CREDENTIAL).chmod(0o640)
            with self.assertRaisesRegex(
                MODULE.AlertError, "credential_permissions_unsafe"
            ):
                MODULE.load_credentials(directory)

    def test_rejects_embedded_newline_and_symlink(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            write_credentials(directory)
            password = directory / MODULE.SMTP_PASSWORD_CREDENTIAL
            password.write_text("first\nsecond\n", encoding="utf-8")
            password.chmod(0o600)
            with self.assertRaisesRegex(
                MODULE.AlertError, "credential_content_invalid"
            ):
                MODULE.load_credentials(directory)
            password.unlink()
            password.symlink_to(directory / MODULE.SMTP_USERNAME_CREDENTIAL)
            with self.assertRaisesRegex(MODULE.AlertError, "credential_unreadable"):
                MODULE.load_credentials(directory)


class EmailBoundaryTest(unittest.TestCase):
    def setUp(self) -> None:
        self.credentials = MODULE.Credentials(
            "technical-sender@example.com",
            "AppPassword-Bearer-spc_SECRET",
            "private-recipient@example.net",
        )
        self.event = MODULE.AlertEvent(
            OBSERVED_AT, MODULE.Operation.GET_COACH_CONTEXT, 123
        )

    def test_golden_alert_has_only_fixed_copy_and_three_typed_fields(self) -> None:
        message = MODULE.build_message(self.event, self.credentials)
        self.assertEqual(message["Subject"], "[SkillPilot] Claude v1 provider WARN")
        self.assertEqual(message["X-SkillPilot-Alert-Procedure"], MODULE.PROCEDURE_ID)
        self.assertEqual(
            message.get_body(preferencelist=("plain",)).get_content(),
            "SkillPilot Claude v1 alert\n\n"
            "Signal: provider_warn\n"
            "UTC: 2026-09-03T07:08:09+00:00\n"
            "Operation: get_skillpilot_coach_context\n"
            "DurationMs: 123\n"
            f"Procedure: {MODULE.PROCEDURE_ID}\n\n"
            "No request, response, learner, session, OAuth or token data is included.\n",
        )
        serialized = message.as_string(policy=default)
        for forbidden in ("AppPassword", "Bearer", "spc_SECRET", "journal", "cursor"):
            self.assertNotIn(forbidden, serialized)

    def test_route_test_is_unambiguously_labelled(self) -> None:
        event = MODULE.AlertEvent(
            OBSERVED_AT,
            MODULE.Operation.GET_COACH_CONTEXT,
            0,
            route_test=True,
        )
        message = MODULE.build_message(event, self.credentials)
        self.assertIn("route test", message["Subject"])
        self.assertIn("Signal: route_test", message.get_content())

    def test_smtp_uses_verified_tls_and_explicit_envelope(self) -> None:
        calls: dict[str, object] = {}

        class FakeSmtp:
            def __init__(self, host, port, *, timeout, context):
                calls.update(host=host, port=port, timeout=timeout, context=context)

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

            def login(self, username, password):
                calls.update(username=username, password=password)

            def send_message(self, message, *, from_addr, to_addrs):
                calls.update(message=message, from_addr=from_addr, to_addrs=to_addrs)
                return {}

        with mock.patch.object(MODULE.smtplib, "SMTP_SSL", FakeSmtp):
            MODULE.send_message(
                MODULE.build_message(self.event, self.credentials), self.credentials
            )
        self.assertEqual(calls["host"], "smtp.ionos.de")
        self.assertEqual(calls["port"], 465)
        self.assertEqual(calls["from_addr"], self.credentials.smtp_username)
        self.assertEqual(calls["to_addrs"], [self.credentials.recipient])
        context = calls["context"]
        self.assertIsInstance(context, ssl.SSLContext)
        self.assertGreaterEqual(context.minimum_version, ssl.TLSVersion.TLSv1_2)
        self.assertTrue(context.check_hostname)
        self.assertEqual(context.verify_mode, ssl.CERT_REQUIRED)

    def test_smtp_error_does_not_propagate_provider_text_or_secret(self) -> None:
        class FailingSmtp:
            def __init__(self, *_args, **_kwargs):
                pass

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

            def login(self, *_args):
                raise smtplib.SMTPAuthenticationError(
                    535, b"Bearer spc_SENTINEL AppPassword"
                )

        with mock.patch.object(MODULE.smtplib, "SMTP_SSL", FailingSmtp):
            with self.assertRaises(MODULE.AlertError) as raised:
                MODULE.send_message(
                    MODULE.build_message(self.event, self.credentials),
                    self.credentials,
                )
        self.assertEqual(str(raised.exception), "smtp_delivery_failed")
        self.assertNotIn("SENTINEL", str(raised.exception))


class RouteEventTest(unittest.TestCase):
    def setUp(self) -> None:
        self.credentials = MODULE.Credentials(
            "technical-sender@example.com",
            "AppPassword-SENTINEL",
            "private-recipient@example.net",
        )
        self.event = MODULE.AlertEvent(
            OBSERVED_AT, MODULE.Operation.GET_COACH_CONTEXT, 123
        )
        self.cursor = "s=abc;i=1;b=def;m=2;t=3;x=4"

    def test_persists_attempt_before_smtp_and_cursor_after_smtp(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            limiter = MODULE.RateLimiter(directory / "rate-state.json")
            cursor_path = directory / "journal.cursor"
            order: list[str] = []
            original_atomic_write = MODULE._atomic_write

            def traced_write(path, payload):
                order.append("attempt" if path.name == "rate-state.json" else "cursor")
                original_atomic_write(path, payload)

            def accepted(_message, _credentials):
                order.append("smtp")

            with (
                mock.patch.object(MODULE, "_atomic_write", traced_write),
                mock.patch.object(MODULE, "send_message", accepted),
            ):
                result = MODULE.route_event(
                    self.event,
                    self.cursor,
                    limiter,
                    self.credentials,
                    cursor_path,
                    1_800_000_000.0,
                )

            self.assertEqual(result, "accepted")
            self.assertEqual(order, ["attempt", "smtp", "cursor"])
            self.assertEqual(MODULE.load_cursor(cursor_path), self.cursor)

    def test_lost_smtp_reply_is_attempted_once_and_replay_is_suppressed(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            rate_path = directory / "rate-state.json"
            cursor_path = directory / "journal.cursor"
            limiter = MODULE.RateLimiter(rate_path)
            smtp = mock.Mock(side_effect=MODULE.DeliveryFailure("smtp_delivery_failed"))
            with mock.patch.object(MODULE, "send_message", smtp):
                with self.assertRaisesRegex(
                    MODULE.DeliveryFailure, "smtp_delivery_failed"
                ):
                    MODULE.route_event(
                        self.event,
                        self.cursor,
                        limiter,
                        self.credentials,
                        cursor_path,
                        1_800_000_000.0,
                    )
            self.assertEqual(smtp.call_count, 1)
            self.assertEqual(MODULE.load_cursor(cursor_path), self.cursor)

            reloaded = MODULE.RateLimiter(rate_path)
            with mock.patch.object(MODULE, "send_message") as replay_smtp:
                result = MODULE.route_event(
                    self.event,
                    self.cursor,
                    reloaded,
                    self.credentials,
                    cursor_path,
                    1_800_000_001.0,
                )
            self.assertEqual(result, "suppressed_operation")
            replay_smtp.assert_not_called()

    def test_failed_attempt_reservation_prevents_network_access(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            limiter = MODULE.RateLimiter(directory / "rate-state.json")
            with (
                mock.patch.object(
                    MODULE,
                    "_atomic_write",
                    side_effect=MODULE.AlertError("state_write_failed"),
                ),
                mock.patch.object(MODULE, "send_message") as smtp,
            ):
                with self.assertRaisesRegex(MODULE.AlertError, "state_write_failed"):
                    MODULE.route_event(
                        self.event,
                        self.cursor,
                        limiter,
                        self.credentials,
                        directory / "journal.cursor",
                        1_800_000_000.0,
                    )
            smtp.assert_not_called()

    def test_cursor_failure_after_acceptance_cannot_duplicate_on_replay(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            rate_path = directory / "rate-state.json"
            limiter = MODULE.RateLimiter(rate_path)
            smtp = mock.Mock()
            with (
                mock.patch.object(MODULE, "send_message", smtp),
                mock.patch.object(
                    MODULE,
                    "save_cursor",
                    side_effect=MODULE.AlertError("state_write_failed"),
                ),
            ):
                with self.assertRaisesRegex(MODULE.AlertError, "state_write_failed"):
                    MODULE.route_event(
                        self.event,
                        self.cursor,
                        limiter,
                        self.credentials,
                        directory / "journal.cursor",
                        1_800_000_000.0,
                    )
            self.assertEqual(smtp.call_count, 1)

            reloaded = MODULE.RateLimiter(rate_path)
            with mock.patch.object(MODULE, "send_message") as replay_smtp:
                result = MODULE.route_event(
                    self.event,
                    self.cursor,
                    reloaded,
                    self.credentials,
                    directory / "journal.cursor",
                    1_800_000_001.0,
                )
            self.assertEqual(result, "suppressed_operation")
            replay_smtp.assert_not_called()


class RateLimiterTest(unittest.TestCase):
    def test_persists_per_operation_hourly_and_daily_limits(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "rate-state.json"
            limiter = MODULE.RateLimiter(path)
            now = 1_800_000_000.0
            first = MODULE.Operation.GET_COACH_CONTEXT
            self.assertEqual(limiter.decision(first, now), "attempt")
            limiter.reserve_attempt(first, now)
            self.assertEqual(
                limiter.decision(first, now + 3599), "suppressed_operation"
            )
            for operation in list(MODULE.Operation)[1:4]:
                self.assertEqual(limiter.decision(operation, now), "attempt")
                limiter.reserve_attempt(operation, now)
            self.assertEqual(
                limiter.decision(list(MODULE.Operation)[4], now),
                "suppressed_hourly",
            )
            reloaded = MODULE.RateLimiter(path)
            self.assertEqual(reloaded.decision(first, now + 10), "suppressed_operation")
            self.assertEqual(path.stat().st_mode & 0o777, 0o600)

            daily = MODULE.RateLimiter(Path(temporary) / "daily.json")
            for index, operation in enumerate(MODULE.Operation):
                event_time = now + index * 3700
                self.assertEqual(daily.decision(operation, event_time), "attempt")
                daily.reserve_attempt(operation, event_time)
            self.assertEqual(
                daily.decision(first, now + len(MODULE.Operation) * 3700),
                "suppressed_daily",
            )

    def test_hundred_thousand_attempts_cannot_exceed_hourly_limit(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            limiter = MODULE.RateLimiter(Path(temporary) / "rate.json")
            operations = list(MODULE.Operation)
            attempts = 0
            now = 1_800_000_000.0
            for index in range(100_000):
                operation = operations[index % len(operations)]
                if limiter.decision(operation, now) == "attempt":
                    limiter.reserve_attempt(operation, now)
                    attempts += 1
            self.assertEqual(attempts, MODULE.GLOBAL_HOURLY_LIMIT)

    def test_corrupt_state_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "rate.json"
            path.write_text('{"version":2,"attemptedAt":["secret"]}', encoding="utf-8")
            path.chmod(0o600)
            with self.assertRaisesRegex(MODULE.AlertError, "rate_state_invalid"):
                MODULE.RateLimiter(path)

    def test_exclusive_lock_rejects_parallel_monitor(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            state = Path(temporary)
            with MODULE.exclusive_monitor_lock(state):
                with self.assertRaisesRegex(
                    MODULE.AlertError, "monitor_already_running"
                ):
                    with MODULE.exclusive_monitor_lock(state):
                        pass


class DeploymentContractTest(unittest.TestCase):
    def test_router_allowlist_matches_java_contract_literals(self) -> None:
        source = CONTRACT_PATH.read_text(encoding="utf-8")
        constants = dict(
            re.findall(
                r"public static final String (TOOL_[A-Z0-9_]+)\s*=\s*\"([^\"]+)\";",
                source,
            )
        )
        all_tools_match = re.search(
            r"ALL_TOOL_NAMES\s*=\s*List\.of\((?P<body>.*?)\);",
            source,
            flags=re.DOTALL,
        )
        self.assertIsNotNone(all_tools_match)
        assert all_tools_match is not None
        references = re.findall(r"TOOL_[A-Z0-9_]+", all_tools_match.group("body"))
        self.assertEqual(
            tuple(constants[reference] for reference in references),
            tuple(operation.value for operation in MODULE.Operation),
        )
        self.assertEqual(set(constants), set(references))

    def test_unit_is_read_only_hardened_and_credential_backed(self) -> None:
        unit = UNIT_PATH.read_text(encoding="utf-8")
        for expected in (
            "DynamicUser=yes",
            "SupplementaryGroups=systemd-journal",
            "LoadCredential=smtp-username:",
            "LoadCredential=smtp-password:",
            "LoadCredential=recipient:",
            "StateDirectory=skillpilot-claude-v1-warn-alert",
            "ProtectSystem=strict",
            "ProtectHome=yes",
            "NoNewPrivileges=yes",
            "CapabilityBoundingSet=",
            "RestrictAddressFamilies=AF_UNIX AF_INET AF_INET6",
            "StartLimitIntervalSec=3600s",
            "StartLimitBurst=4",
            "RestartPreventExitStatus=75",
            "TimeoutStopSec=45s",
            "LimitCORE=0",
            "MemorySwapMax=0",
            "ProtectProc=invisible",
        ):
            self.assertIn(expected, unit)
        self.assertNotIn("StartLimitIntervalSec=0", unit)
        self.assertNotIn("EnvironmentFile=", unit)
        self.assertNotIn("alerts@", unit)

    def test_route_test_uses_the_same_sandbox_and_loaded_credentials(self) -> None:
        unit = TEST_UNIT_PATH.read_text(encoding="utf-8")
        for expected in (
            "Type=oneshot",
            "RemainAfterExit=yes",
            "DynamicUser=yes",
            "SupplementaryGroups=systemd-journal",
            "LoadCredential=smtp-username:",
            "LoadCredential=smtp-password:",
            "LoadCredential=recipient:",
            " verify-journal ",
            " test-route",
            "ProtectSystem=strict",
            "LimitCORE=0",
        ):
            self.assertIn(expected, unit)
        self.assertNotIn("EnvironmentFile=", unit)

    def test_installer_never_accepts_secret_as_argument_or_environment(self) -> None:
        installer = INSTALLER_PATH.read_text(encoding="utf-8")
        self.assertIn("/dev/tty", installer)
        self.assertIn("read -r -s", installer)
        self.assertIn("root:root:600", installer)
        self.assertNotIn("set -x", installer)
        self.assertNotIn("SKILLPILOT_CLAUDE_SMTP_PASSWORD", installer)
        self.assertNotIn("alerts@", installer)

    def test_credential_consumers_recheck_the_secure_parent_path(self) -> None:
        installer = INSTALLER_PATH.read_text(encoding="utf-8")
        match = re.search(
            r"require_safe_credentials\(\) \{(?P<body>.*?)\n\}",
            installer,
            flags=re.DOTALL,
        )
        self.assertIsNotNone(match)
        assert match is not None
        self.assertIn("require_safe_credential_parent", match.group("body"))
        self.assertIn("owner_group=\"$(/usr/bin/stat -c '%U:%G' ", installer)
        self.assertIn("mode=\"$(/usr/bin/stat -c '%a' ", installer)

    def test_installer_is_fail_closed_and_test_route_is_not_root_python(self) -> None:
        installer = INSTALLER_PATH.read_text(encoding="utf-8")
        self.assertIn("export PATH=/usr/sbin:/usr/bin:/sbin:/bin", installer)
        self.assertIn("MINIMUM_SYSTEMD_VERSION=247", installer)
        self.assertIn("require_deployed_byte_parity", installer)
        self.assertIn("/usr/bin/cmp --silent", installer)
        self.assertIn("verify-runtime", installer)
        self.assertIn('systemctl start "${TEST_SERVICE_NAME}"', installer)
        self.assertNotIn('"${ROUTER_TARGET}" test-route', installer)
        test_route = re.search(
            r"test_route\(\) \{(?P<body>.*?)\n\}", installer, flags=re.DOTALL
        )
        self.assertIsNotNone(test_route)
        assert test_route is not None
        self.assertIn("require_monitor_disabled", test_route.group("body"))

    def test_effective_units_must_be_exact_etc_fragments_without_dropins(self) -> None:
        installer = INSTALLER_PATH.read_text(encoding="utf-8")
        self.assertIn("verify_effective_unit_origins", installer)
        self.assertIn("--property=FragmentPath", installer)
        self.assertIn("--property=DropInPaths", installer)
        self.assertIn('[ "${fragment_path}" != "${expected_fragment}" ]', installer)
        self.assertIn('[ -n "${drop_in_paths}" ]', installer)
        for service, target in (
            ("MONITOR_SERVICE_NAME", "MONITOR_UNIT_TARGET"),
            ("TEST_SERVICE_NAME", "TEST_UNIT_TARGET"),
        ):
            self.assertIn(
                f'verify_effective_unit_origin "${{{service}}}" "${{{target}}}"',
                installer,
            )

    def test_activation_is_transactional_and_enables_only_after_checks(self) -> None:
        installer = INSTALLER_PATH.read_text(encoding="utf-8")
        match = re.search(
            r"activate_monitor\(\) \{(?P<body>.*?)\n\}",
            installer,
            flags=re.DOTALL,
        )
        self.assertIsNotNone(match)
        assert match is not None
        body = match.group("body")
        start = '/usr/bin/systemctl start "${MONITOR_SERVICE_NAME}"'
        enable = '/usr/bin/systemctl enable "${MONITOR_SERVICE_NAME}"'
        self.assertIn("require_monitor_disabled", body)
        self.assertIn("trap cleanup_activation EXIT", body)
        self.assertIn(
            '/usr/bin/systemctl disable --now "${MONITOR_SERVICE_NAME}"',
            body,
        )
        self.assertLess(body.index(start), body.index(enable))
        self.assertLess(body.index("verify_running_invocation"), body.index(enable))
        self.assertLess(body.index(enable), body.index("activation_complete=true"))

    def test_rotation_and_explicit_state_reset_are_supported(self) -> None:
        installer = INSTALLER_PATH.read_text(encoding="utf-8")
        self.assertIn("configure_credentials rotate", installer)
        self.assertIn("CREDENTIAL_BACKUP_DIRECTORY", installer)
        self.assertIn('/usr/bin/mv -T -- "${CREDENTIAL_DIRECTORY}"', installer)
        self.assertIn("RESET-CLAUDE-ALERT-STATE", installer)
        for state_name in (
            "journal.cursor",
            "rate-state.json",
            "runtime-invocation",
            "monitor.lock",
        ):
            self.assertIn(f'"${{STATE_DIRECTORY}}/{state_name}"', installer)

    def test_runbook_never_prints_an_unfiltered_backend_journal_record(self) -> None:
        runbook = RUNBOOK_PATH.read_text(encoding="utf-8")
        self.assertNotIn("journalctl -u skillpilot --lines=1 --output=cat", runbook)


if __name__ == "__main__":
    unittest.main()
