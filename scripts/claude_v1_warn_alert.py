#!/usr/bin/env python3
"""Route the existing Claude v1 provider WARN signal to a redacted email.

The process reads only the journal of the existing SkillPilot service. Raw
journal messages never cross the parser boundary: SMTP receives a typed event
containing only the trusted journal time, one canonical operation name and a
bounded duration.
"""

from __future__ import annotations

import argparse
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime, timezone
from email.message import EmailMessage
from email.utils import format_datetime
from enum import Enum
import fcntl
import json
import math
import os
from pathlib import Path
import re
import signal
import smtplib
import ssl
import stat
import subprocess
import sys
import tempfile
import time
from typing import IO, Iterator, Mapping


PROCEDURE_ID = "SP-CLAUDE-WARN-ALERT-V1"
SMTP_HOST = "smtp.ionos.de"
SMTP_PORT = 465
SMTP_TIMEOUT_SECONDS = 20
MAX_LOG_MESSAGE_BYTES = 2048
MAX_JOURNAL_RECORD_BYTES = 131072
MAX_DURATION_MILLIS = 600_000
PER_OPERATION_COOLDOWN_SECONDS = 3600
GLOBAL_HOURLY_LIMIT = 4
GLOBAL_DAILY_LIMIT = 12
GLOBAL_HOURLY_WINDOW_SECONDS = 3600
GLOBAL_DAILY_WINDOW_SECONDS = 86_400
STATE_VERSION = 2
DELIVERY_FAILURE_EXIT_STATUS = 75
DEFAULT_JOURNAL_UNIT = "skillpilot.service"
DEFAULT_JOURNALCTL = "/usr/bin/journalctl"
SMTP_USERNAME_CREDENTIAL = "smtp-username"
SMTP_PASSWORD_CREDENTIAL = "smtp-password"
RECIPIENT_CREDENTIAL = "recipient"
RUNTIME_INVOCATION_FILE = "runtime-invocation"


class Operation(str, Enum):
    GET_COACH_CONTEXT = "get_skillpilot_coach_context"
    RENDER_GOAL_VISUALIZATION = "render_skillpilot_goal_visualization"
    START_MEMORY_PRACTICE = "start_skillpilot_memory_practice"
    REVIEW_MEMORY_PRACTICE_CARD = "review_skillpilot_memory_practice_card"
    GET_NAVIGATION_OPTIONS = "get_skillpilot_navigation_options"
    SET_FOCUS = "set_skillpilot_focus"
    SET_ACTIVE_GOAL = "set_skillpilot_active_goal"
    SET_MASTERY = "set_skillpilot_mastery"
    START_VERIFIED_RECALL = "start_skillpilot_verified_recall"
    GET_VERIFIED_RECALL_ANSWERS = "get_skillpilot_verified_recall_answers"
    RECORD_VERIFIED_RECALL_RESULTS = "record_skillpilot_verified_recall_results"
    GET_EXAM_EVALUATION = "get_skillpilot_exam_evaluation"


OPERATIONS = frozenset(Operation)
UNIT_PATTERN = re.compile(r"[A-Za-z0-9_.@-]{1,120}\.service\Z", re.ASCII)
CURSOR_PATTERN = re.compile(r"[A-Za-z0-9_=;:+.-]{1,4096}\Z", re.ASCII)
INVOCATION_PATTERN = re.compile(r"[0-9a-f]{32}\Z", re.ASCII)
EMAIL_PATTERN = re.compile(
    r"[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+"
    r"@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?"
    r"(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+\Z",
    re.ASCII,
)
LOG_PATTERN = re.compile(
    r"\A"
    r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3,9}"
    r"(?:Z|[+-]\d{2}:\d{2})"
    r"\s+WARN\s+\d{1,20}\s+---\s+"
    r"\[skillpilot-backend\]\s+"
    r"\[[^\]\r\n]{1,128}\]\s+"
    r"c\.s\.b\.c\.c\.v\.o\.ClaudeV1Telemetry\s+:\s+"
    r"Claude v1 operation '(?P<operation>[a-z0-9_]+)' completed with error in "
    r"(?P<duration>0|[1-9][0-9]{0,8}) ms"
    r"\Z",
    re.ASCII,
)
BOOT_ENVELOPE_PATTERN = re.compile(
    r"\A"
    r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3,9}"
    r"(?:Z|[+-]\d{2}:\d{2})"
    r"\s+(?:TRACE|DEBUG|INFO|WARN|ERROR)\s+\d{1,20}\s+---\s+"
    r"\[skillpilot-backend\]\s+"
    r"\[[^\]\r\n]{1,128}\]\s+"
    r"[A-Za-z_$][A-Za-z0-9_$.]*\s+:\s+",
    re.ASCII,
)


class AlertError(RuntimeError):
    """Expected fail-closed error carrying only a fixed diagnostic code."""

    def __init__(self, code: str):
        super().__init__(code)
        self.code = code


class DeliveryFailure(AlertError):
    """SMTP delivery failed after the persistent attempt reservation."""


@dataclass(frozen=True)
class AlertEvent:
    observed_at: datetime
    operation: Operation
    duration_millis: int
    route_test: bool = False


@dataclass(frozen=True)
class Credentials:
    smtp_username: str
    smtp_password: str
    recipient: str


@dataclass
class RateState:
    last_attempt_by_operation: dict[str, float]
    attempted_at: list[float]


def safe_log(level: str, code: str) -> None:
    """Emit only fixed diagnostics; never pass exception or input text here."""

    stream = sys.stderr if level in {"WARN", "ERROR"} else sys.stdout
    print(f"{level} claude_v1_warn_alert {code}", file=stream, flush=True)


def validate_email(value: str) -> str:
    if len(value) > 254 or not EMAIL_PATTERN.fullmatch(value):
        raise AlertError("credential_email_invalid")
    return value


def _read_private_file(path: Path, maximum_bytes: int) -> bytes:
    flags = os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0)
    try:
        descriptor = os.open(path, flags)
    except OSError:
        raise AlertError("credential_unreadable") from None
    try:
        metadata = os.fstat(descriptor)
        if not stat.S_ISREG(metadata.st_mode):
            raise AlertError("credential_not_regular")
        if stat.S_IMODE(metadata.st_mode) & 0o077:
            raise AlertError("credential_permissions_unsafe")
        value = os.read(descriptor, maximum_bytes + 2)
        if len(value) > maximum_bytes + 1:
            raise AlertError("credential_too_long")
        return value
    finally:
        os.close(descriptor)


def _read_credential(directory: Path, name: str, maximum_bytes: int) -> str:
    value = _read_private_file(directory / name, maximum_bytes)
    if value.endswith(b"\n"):
        value = value[:-1]
    if not value or b"\n" in value or b"\r" in value or b"\x00" in value:
        raise AlertError("credential_content_invalid")
    try:
        return value.decode("utf-8", errors="strict")
    except UnicodeDecodeError:
        raise AlertError("credential_encoding_invalid") from None


def load_credentials(directory: Path) -> Credentials:
    try:
        directory_metadata = directory.lstat()
    except OSError:
        raise AlertError("credential_directory_missing") from None
    if (
        not stat.S_ISDIR(directory_metadata.st_mode)
        or directory.is_symlink()
        or stat.S_IMODE(directory_metadata.st_mode) & 0o077
    ):
        raise AlertError("credential_directory_missing")
    username = validate_email(
        _read_credential(directory, SMTP_USERNAME_CREDENTIAL, 254)
    )
    password = _read_credential(directory, SMTP_PASSWORD_CREDENTIAL, 1024)
    recipient = validate_email(_read_credential(directory, RECIPIENT_CREDENTIAL, 254))
    return Credentials(username, password, recipient)


def parse_signal(message: str, observed_at: datetime) -> AlertEvent | None:
    if observed_at.tzinfo is None:
        raise AlertError("journal_time_untrusted")
    try:
        encoded = message.encode("utf-8", errors="strict")
    except UnicodeEncodeError:
        return None
    if len(encoded) > MAX_LOG_MESSAGE_BYTES:
        return None
    if any(marker in message for marker in ("\r", "\n", "\x00", "\x1b")):
        return None
    match = LOG_PATTERN.fullmatch(message)
    if match is None:
        return None
    try:
        operation = Operation(match.group("operation"))
        duration_millis = int(match.group("duration"), 10)
    except (ValueError, KeyError):
        return None
    if operation not in OPERATIONS or not 0 <= duration_millis <= MAX_DURATION_MILLIS:
        return None
    return AlertEvent(observed_at.astimezone(timezone.utc), operation, duration_millis)


def event_from_journal_record(
    record: Mapping[str, object], expected_unit: str
) -> AlertEvent | None:
    if record.get("_SYSTEMD_UNIT") != expected_unit:
        return None
    message = record.get("MESSAGE")
    timestamp = record.get("__REALTIME_TIMESTAMP")
    if not isinstance(message, str) or not isinstance(timestamp, str):
        return None
    try:
        microseconds = int(timestamp, 10)
        if microseconds < 0:
            return None
        observed_at = datetime.fromtimestamp(microseconds / 1_000_000, timezone.utc)
    except (ValueError, OverflowError, OSError):
        return None
    return parse_signal(message, observed_at)


def build_message(event: AlertEvent, credentials: Credentials) -> EmailMessage:
    sender = validate_email(credentials.smtp_username)
    recipient = validate_email(credentials.recipient)
    signal = "route_test" if event.route_test else "provider_warn"
    message = EmailMessage()
    message["Subject"] = (
        "[SkillPilot] Claude v1 WARN route test"
        if event.route_test
        else "[SkillPilot] Claude v1 provider WARN"
    )
    message["From"] = sender
    message["To"] = recipient
    message["Date"] = format_datetime(event.observed_at.astimezone(timezone.utc))
    message["Auto-Submitted"] = "auto-generated"
    message["X-Auto-Response-Suppress"] = "All"
    message["X-SkillPilot-Alert-Procedure"] = PROCEDURE_ID
    message.set_content(
        "SkillPilot Claude v1 alert\n\n"
        f"Signal: {signal}\n"
        f"UTC: {event.observed_at.astimezone(timezone.utc).isoformat()}\n"
        f"Operation: {event.operation.value}\n"
        f"DurationMs: {event.duration_millis}\n"
        f"Procedure: {PROCEDURE_ID}\n\n"
        "No request, response, learner, session, OAuth or token data is included.\n",
        charset="utf-8",
    )
    return message


def send_message(message: EmailMessage, credentials: Credentials) -> None:
    context = ssl.create_default_context()
    context.minimum_version = ssl.TLSVersion.TLSv1_2
    context.check_hostname = True
    context.verify_mode = ssl.CERT_REQUIRED
    try:
        with smtplib.SMTP_SSL(
            SMTP_HOST,
            SMTP_PORT,
            timeout=SMTP_TIMEOUT_SECONDS,
            context=context,
        ) as client:
            client.login(credentials.smtp_username, credentials.smtp_password)
            refused = client.send_message(
                message,
                from_addr=credentials.smtp_username,
                to_addrs=[credentials.recipient],
            )
            if refused:
                raise DeliveryFailure("smtp_recipient_refused")
    except DeliveryFailure:
        raise
    except (OSError, smtplib.SMTPException, ssl.SSLError):
        raise DeliveryFailure("smtp_delivery_failed") from None


def _atomic_write(path: Path, payload: bytes) -> None:
    path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    temporary_name: str | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="wb", dir=path.parent, prefix=f".{path.name}.", delete=False
        ) as temporary:
            temporary_name = temporary.name
            os.fchmod(temporary.fileno(), 0o600)
            temporary.write(payload)
            temporary.flush()
            os.fsync(temporary.fileno())
        os.replace(temporary_name, path)
        directory_fd = os.open(path.parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
        try:
            os.fsync(directory_fd)
        finally:
            os.close(directory_fd)
    except OSError:
        if temporary_name is not None:
            try:
                os.unlink(temporary_name)
            except OSError:
                pass
        raise AlertError("state_write_failed") from None


def _read_state_file(path: Path, maximum_bytes: int) -> bytes | None:
    if not path.exists():
        return None
    try:
        return _read_private_file(path, maximum_bytes)
    except AlertError as error:
        raise AlertError("state_unreadable") from error


class RateLimiter:
    def __init__(self, path: Path):
        self.path = path
        self.state = self._load()

    def _load(self) -> RateState:
        raw = _read_state_file(self.path, 32_768)
        if raw is None:
            return RateState({}, [])
        try:
            payload = json.loads(raw.decode("utf-8", errors="strict"))
            if not isinstance(payload, dict) or payload.get("version") != STATE_VERSION:
                raise ValueError
            raw_last = payload.get("lastAttemptByOperation")
            raw_attempted = payload.get("attemptedAt")
            if not isinstance(raw_last, dict) or not isinstance(raw_attempted, list):
                raise ValueError
            if len(raw_last) > len(OPERATIONS) or len(raw_attempted) > 256:
                raise ValueError
            last: dict[str, float] = {}
            for operation, value in raw_last.items():
                if operation not in {entry.value for entry in OPERATIONS}:
                    raise ValueError
                timestamp = float(value)
                if not math.isfinite(timestamp) or timestamp < 0:
                    raise ValueError
                last[operation] = timestamp
            attempted = [float(value) for value in raw_attempted]
            if any(not math.isfinite(value) or value < 0 for value in attempted):
                raise ValueError
            return RateState(last, attempted)
        except (UnicodeDecodeError, ValueError, TypeError, json.JSONDecodeError):
            raise AlertError("rate_state_invalid") from None

    def _prune(self, now: float) -> None:
        threshold = now - GLOBAL_DAILY_WINDOW_SECONDS
        self.state.attempted_at = [
            value for value in self.state.attempted_at if value >= threshold
        ]

    def decision(self, operation: Operation, now: float) -> str:
        if not math.isfinite(now) or now < 0:
            raise AlertError("clock_invalid")
        self._prune(now)
        last = self.state.last_attempt_by_operation.get(operation.value)
        if last is not None and now - last < PER_OPERATION_COOLDOWN_SECONDS:
            return "suppressed_operation"
        hourly_threshold = now - GLOBAL_HOURLY_WINDOW_SECONDS
        if (
            sum(value >= hourly_threshold for value in self.state.attempted_at)
            >= GLOBAL_HOURLY_LIMIT
        ):
            return "suppressed_hourly"
        if len(self.state.attempted_at) >= GLOBAL_DAILY_LIMIT:
            return "suppressed_daily"
        return "attempt"

    def reserve_attempt(self, operation: Operation, now: float) -> None:
        if self.decision(operation, now) != "attempt":
            raise AlertError("rate_reservation_rejected")
        self._prune(now)
        self.state.last_attempt_by_operation[operation.value] = now
        self.state.attempted_at.append(now)
        payload = (
            json.dumps(
                {
                    "version": STATE_VERSION,
                    "lastAttemptByOperation": self.state.last_attempt_by_operation,
                    "attemptedAt": self.state.attempted_at,
                },
                sort_keys=True,
                separators=(",", ":"),
            ).encode("utf-8")
            + b"\n"
        )
        _atomic_write(self.path, payload)


def load_cursor(path: Path) -> str | None:
    raw = _read_state_file(path, 8192)
    if raw is None:
        return None
    try:
        cursor = raw.decode("ascii", errors="strict").strip()
    except UnicodeDecodeError:
        raise AlertError("cursor_invalid") from None
    if not CURSOR_PATTERN.fullmatch(cursor):
        raise AlertError("cursor_invalid")
    return cursor


def save_cursor(path: Path, cursor: str) -> None:
    if not CURSOR_PATTERN.fullmatch(cursor):
        raise AlertError("cursor_invalid")
    _atomic_write(path, cursor.encode("ascii") + b"\n")


def record_runtime_invocation(state_directory: Path) -> None:
    invocation_id = os.environ.get("INVOCATION_ID", "")
    if not INVOCATION_PATTERN.fullmatch(invocation_id):
        raise AlertError("invocation_id_missing")
    _atomic_write(
        state_directory / RUNTIME_INVOCATION_FILE,
        invocation_id.encode("ascii") + b"\n",
    )


def verify_runtime_invocation(state_directory: Path, expected: str) -> None:
    if not INVOCATION_PATTERN.fullmatch(expected):
        raise AlertError("invocation_id_invalid")
    raw = _read_state_file(state_directory / RUNTIME_INVOCATION_FILE, 64)
    if raw is None:
        raise AlertError("runtime_invocation_missing")
    try:
        actual = raw.decode("ascii", errors="strict").strip()
    except UnicodeDecodeError:
        raise AlertError("runtime_invocation_invalid") from None
    if actual != expected:
        raise AlertError("runtime_invocation_stale")


@contextmanager
def exclusive_monitor_lock(state_directory: Path) -> Iterator[None]:
    lock_path = state_directory / "monitor.lock"
    flags = (
        os.O_RDWR
        | os.O_CREAT
        | getattr(os, "O_CLOEXEC", 0)
        | getattr(os, "O_NOFOLLOW", 0)
    )
    descriptor: int | None = None
    try:
        descriptor = os.open(lock_path, flags, 0o600)
        if not stat.S_ISREG(os.fstat(descriptor).st_mode):
            raise OSError
        os.fchmod(descriptor, 0o600)
        fcntl.flock(descriptor, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        if descriptor is not None:
            os.close(descriptor)
        raise AlertError("monitor_already_running") from None
    try:
        yield
    finally:
        assert descriptor is not None
        fcntl.flock(descriptor, fcntl.LOCK_UN)
        os.close(descriptor)


def validate_journal_unit(value: str) -> str:
    if not UNIT_PATTERN.fullmatch(value):
        raise AlertError("journal_unit_invalid")
    return value


def validate_journalctl(path: str) -> str:
    candidate = Path(path)
    if (
        not candidate.is_absolute()
        or not candidate.is_file()
        or not os.access(candidate, os.X_OK)
    ):
        raise AlertError("journalctl_invalid")
    return str(candidate)


def initial_cursor(journalctl: str, unit: str) -> str:
    command = [
        journalctl,
        "--unit",
        unit,
        "--lines",
        "1",
        "--output",
        "json",
        "--no-pager",
        "--quiet",
    ]
    try:
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
    except OSError:
        raise AlertError("journal_initialization_failed") from None
    if process.stdout is None:
        process.kill()
        raise AlertError("journal_initialization_failed")
    candidates: list[bytes] = []
    try:
        for raw_line in bounded_lines(process.stdout):
            if raw_line is None:
                process.kill()
                raise AlertError("journal_initialization_failed")
            if not raw_line.strip():
                continue
            if candidates:
                process.kill()
                raise AlertError("journal_initialization_failed")
            candidates.append(raw_line)
        return_code = process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()
        raise AlertError("journal_initialization_failed") from None
    finally:
        if process.poll() is None:
            process.terminate()
    if return_code != 0 or len(candidates) != 1:
        raise AlertError("journal_has_no_service_records")
    try:
        record = json.loads(candidates[0].decode("utf-8", errors="strict"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise AlertError("journal_initialization_failed") from None
    cursor = record.get("__CURSOR") if isinstance(record, dict) else None
    if not isinstance(cursor, str) or not CURSOR_PATTERN.fullmatch(cursor):
        raise AlertError("journal_initialization_failed")
    return cursor


def journal_command(journalctl: str, unit: str, cursor: str) -> list[str]:
    if not CURSOR_PATTERN.fullmatch(cursor):
        raise AlertError("cursor_invalid")
    return [
        journalctl,
        "--unit",
        unit,
        "--after-cursor",
        cursor,
        "--follow",
        "--output",
        "json",
        "--no-pager",
        "--quiet",
    ]


def bounded_lines(stream: IO[bytes]) -> Iterator[bytes | None]:
    while True:
        line = stream.readline(MAX_JOURNAL_RECORD_BYTES + 1)
        if not line:
            return
        if len(line) > MAX_JOURNAL_RECORD_BYTES:
            if not line.endswith(b"\n"):
                while line and not line.endswith(b"\n"):
                    line = stream.readline(MAX_JOURNAL_RECORD_BYTES + 1)
            yield None
            continue
        yield line


def verify_journal_source(journalctl: str, unit: str) -> None:
    command = [
        journalctl,
        "--unit",
        unit,
        "--lines",
        "500",
        "--output",
        "json",
        "--no-pager",
        "--quiet",
    ]
    try:
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
    except OSError:
        raise AlertError("journal_source_unavailable") from None
    if process.stdout is None:
        process.kill()
        raise AlertError("journal_source_unavailable")
    envelope_found = False
    try:
        for raw_line in bounded_lines(process.stdout):
            if raw_line is None:
                continue
            try:
                record = json.loads(raw_line.decode("utf-8", errors="strict"))
            except (UnicodeDecodeError, json.JSONDecodeError):
                continue
            if not isinstance(record, dict) or record.get("_SYSTEMD_UNIT") != unit:
                continue
            message = record.get("MESSAGE")
            if isinstance(message, str):
                try:
                    encoded_message = message.encode("utf-8", errors="strict")
                except UnicodeEncodeError:
                    continue
                if (
                    len(encoded_message) <= MAX_LOG_MESSAGE_BYTES
                    and "\r" not in message
                    and "\n" not in message
                    and BOOT_ENVELOPE_PATTERN.match(message)
                ):
                    envelope_found = True
        return_code = process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()
        raise AlertError("journal_source_unavailable") from None
    finally:
        if process.poll() is None:
            process.terminate()
    if return_code != 0 or not envelope_found:
        raise AlertError("journal_source_unverified")


def route_event(
    event: AlertEvent,
    record_cursor: str,
    limiter: RateLimiter,
    credentials: Credentials,
    cursor_path: Path,
    now: float,
) -> str:
    """Reserve a hard rate-limit slot, then make at most one SMTP attempt."""

    decision = limiter.decision(event.operation, now)
    if decision != "attempt":
        save_cursor(cursor_path, record_cursor)
        return decision

    # The durable reservation deliberately precedes every network byte. If the
    # process is killed after SMTP accepted the mail, replay sees this slot and
    # cannot send a duplicate or exceed the global attempt caps.
    limiter.reserve_attempt(event.operation, now)
    try:
        send_message(build_message(event, credentials), credentials)
    except DeliveryFailure as error:
        try:
            save_cursor(cursor_path, record_cursor)
        except AlertError:
            raise DeliveryFailure("smtp_delivery_cursor_failed") from None
        raise error
    save_cursor(cursor_path, record_cursor)
    return "accepted"


def watch(
    credentials: Credentials,
    state_directory: Path,
    journalctl: str,
    unit: str,
) -> None:
    state_directory.mkdir(mode=0o700, parents=True, exist_ok=True)
    cursor_path = state_directory / "journal.cursor"
    rate_path = state_directory / "rate-state.json"
    with exclusive_monitor_lock(state_directory):
        limiter = RateLimiter(rate_path)
        cursor = load_cursor(cursor_path)
        if cursor is None:
            cursor = initial_cursor(journalctl, unit)
            save_cursor(cursor_path, cursor)
            safe_log("INFO", "cursor_initialized")
        command = journal_command(journalctl, unit, cursor)
        try:
            process = subprocess.Popen(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL,
            )
        except OSError:
            raise AlertError("journal_start_failed") from None
        if process.stdout is None:
            process.kill()
            raise AlertError("journal_start_failed")
        pending_cursor = cursor
        records_since_checkpoint = 0
        checkpoint_started = time.monotonic()
        stop_requested = False

        def request_stop(_signal_number: int, _frame: object) -> None:
            nonlocal stop_requested
            stop_requested = True
            if process.poll() is None:
                try:
                    process.terminate()
                except OSError:
                    pass

        previous_sigterm = signal.signal(signal.SIGTERM, request_stop)
        previous_sigint = signal.signal(signal.SIGINT, request_stop)
        try:
            record_runtime_invocation(state_directory)
            safe_log("INFO", "monitor_started")
            for raw_line in bounded_lines(process.stdout):
                if raw_line is None:
                    safe_log("WARN", "journal_record_oversized")
                    continue
                try:
                    record = json.loads(raw_line.decode("utf-8", errors="strict"))
                except (UnicodeDecodeError, json.JSONDecodeError):
                    safe_log("WARN", "journal_record_invalid")
                    continue
                if not isinstance(record, dict):
                    continue
                record_cursor = record.get("__CURSOR")
                if not isinstance(record_cursor, str) or not CURSOR_PATTERN.fullmatch(
                    record_cursor
                ):
                    safe_log("WARN", "journal_cursor_missing")
                    continue
                pending_cursor = record_cursor
                event = event_from_journal_record(record, unit)
                if event is not None:
                    result = route_event(
                        event,
                        record_cursor,
                        limiter,
                        credentials,
                        cursor_path,
                        time.time(),
                    )
                    if result == "accepted":
                        safe_log("INFO", "alert_smtp_accepted")
                    else:
                        safe_log("INFO", result)
                    records_since_checkpoint = 0
                    checkpoint_started = time.monotonic()
                    if stop_requested:
                        break
                    continue
                records_since_checkpoint += 1
                if (
                    records_since_checkpoint >= 250
                    or time.monotonic() - checkpoint_started >= 30
                ):
                    save_cursor(cursor_path, pending_cursor)
                    records_since_checkpoint = 0
                    checkpoint_started = time.monotonic()
            if pending_cursor != cursor:
                save_cursor(cursor_path, pending_cursor)
            if stop_requested:
                safe_log("INFO", "monitor_stopped")
                return
            return_code = process.wait(timeout=5)
            if return_code != 0:
                raise AlertError("journal_stopped")
            raise AlertError("journal_ended")
        finally:
            signal.signal(signal.SIGTERM, previous_sigterm)
            signal.signal(signal.SIGINT, previous_sigint)
            if process.poll() is None:
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()


def credential_directory(argument: str | None) -> Path:
    value = argument or os.environ.get("CREDENTIALS_DIRECTORY")
    if not value:
        raise AlertError("credential_directory_missing")
    return Path(value)


def state_directory(argument: str | None) -> Path:
    value = argument or os.environ.get("STATE_DIRECTORY")
    if not value:
        raise AlertError("state_directory_missing")
    return Path(value)


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(description=__doc__)
    subparsers = root.add_subparsers(dest="command", required=True)

    validate = subparsers.add_parser("validate-config")
    validate.add_argument("--credential-source-directory")

    test_route = subparsers.add_parser("test-route")
    test_route.add_argument("--credential-source-directory")

    verify_journal = subparsers.add_parser("verify-journal")
    verify_journal.add_argument("--journal-unit", default=DEFAULT_JOURNAL_UNIT)
    verify_journal.add_argument("--journalctl", default=DEFAULT_JOURNALCTL)

    monitor = subparsers.add_parser("watch")
    monitor.add_argument("--credential-source-directory")
    monitor.add_argument("--state-directory")
    monitor.add_argument("--journal-unit", default=DEFAULT_JOURNAL_UNIT)
    monitor.add_argument("--journalctl", default=DEFAULT_JOURNALCTL)

    verify_runtime = subparsers.add_parser("verify-runtime")
    verify_runtime.add_argument("--state-directory", required=True)
    verify_runtime.add_argument("--expected-invocation-id", required=True)
    return root


def main(arguments: list[str] | None = None) -> int:
    args = parser().parse_args(arguments)
    try:
        if args.command == "validate-config":
            load_credentials(credential_directory(args.credential_source_directory))
            safe_log("INFO", "configuration_valid")
            return 0
        if args.command == "test-route":
            credentials = load_credentials(
                credential_directory(args.credential_source_directory)
            )
            event = AlertEvent(
                datetime.now(timezone.utc),
                Operation.GET_COACH_CONTEXT,
                0,
                route_test=True,
            )
            send_message(build_message(event, credentials), credentials)
            safe_log("INFO", "route_test_accepted")
            return 0
        if args.command == "verify-journal":
            unit = validate_journal_unit(args.journal_unit)
            journalctl = validate_journalctl(args.journalctl)
            verify_journal_source(journalctl, unit)
            safe_log("INFO", "journal_source_verified")
            return 0
        if args.command == "watch":
            credentials = load_credentials(
                credential_directory(args.credential_source_directory)
            )
            unit = validate_journal_unit(args.journal_unit)
            journalctl = validate_journalctl(args.journalctl)
            watch(credentials, state_directory(args.state_directory), journalctl, unit)
            return 0
        if args.command == "verify-runtime":
            verify_runtime_invocation(
                state_directory(args.state_directory), args.expected_invocation_id
            )
            safe_log("INFO", "runtime_invocation_verified")
            return 0
        raise AlertError("command_invalid")
    except DeliveryFailure as error:
        safe_log("ERROR", error.code)
        return DELIVERY_FAILURE_EXIT_STATUS
    except AlertError as error:
        safe_log("ERROR", error.code)
        return 1
    except Exception:
        safe_log("ERROR", "internal_failure")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
