#!/usr/bin/env python3
"""Fail-closed, network-free check of the pinned FWU OWL validation tools."""

from __future__ import annotations

import argparse
import hashlib
import importlib
import importlib.metadata
import json
import os
from pathlib import Path
import re
import shutil
import stat
import subprocess
import sys
import tempfile
from typing import Any


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ROBOT_JAR = REPOSITORY_ROOT / "tmp" / "tools" / "robot.jar"
JAVA_VERSION_PATH = REPOSITORY_ROOT / ".java-version"
CORRETTO_VERSION_PATH = REPOSITORY_ROOT / ".corretto-version"

ROBOT_VERSION = "1.9.10"
ROBOT_BYTES = 82_604_728
ROBOT_SHA256 = "16a73c074f3df359a7338a84b4e0788785fe06117f931bb9796e9619ea776105"
ROBOT_VERSION_LINE = f"ROBOT version {ROBOT_VERSION}"
PYTHON_DISTRIBUTIONS = {
    "jsonschema": "4.26.0",
    "owlrl": "7.6.2",
    "pyshacl": "0.30.1",
    "rdflib": "7.6.0",
}
VERSION_PIN_RE = re.compile(r"^[0-9]+(?:\.[0-9]+){2,4}$")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Check the already provisioned, pinned ROBOT and Python validation "
            "tools without downloading or installing anything."
        )
    )
    parser.add_argument(
        "--robot-jar",
        type=Path,
        default=DEFAULT_ROBOT_JAR,
        help=f"pinned ROBOT JAR (default: {DEFAULT_ROBOT_JAR})",
    )
    parser.add_argument(
        "--report",
        type=Path,
        help="atomically write the same structured JSON report emitted on stdout",
    )
    return parser.parse_args()


def descriptor_identity(status: os.stat_result) -> tuple[int, ...]:
    return (
        status.st_dev,
        status.st_ino,
        status.st_mode,
        status.st_nlink,
        status.st_uid,
        status.st_gid,
        status.st_size,
        status.st_mtime_ns,
        status.st_ctime_ns,
    )


def sha256_descriptor(descriptor: int, expected_size: int) -> str:
    digest = hashlib.sha256()
    offset = 0
    while offset < expected_size:
        chunk = os.pread(descriptor, min(1024 * 1024, expected_size - offset), offset)
        if not chunk:
            raise OSError("regular file ended while it was being hashed")
        digest.update(chunk)
        offset += len(chunk)
    if os.pread(descriptor, 1, expected_size):
        raise OSError("regular file grew while it was being hashed")
    return digest.hexdigest()


class PinnedRobot:
    """No-follow descriptor binding for one stable ROBOT artifact."""

    def __init__(self, path: Path) -> None:
        self.path = path
        self.descriptor = -1
        if not hasattr(os, "O_NOFOLLOW") or not hasattr(os, "pread"):
            raise OSError("this platform cannot provide no-follow descriptor binding")
        flags = os.O_RDONLY | os.O_NOFOLLOW | getattr(os, "O_CLOEXEC", 0)
        self.descriptor = os.open(path, flags)
        try:
            before = os.fstat(self.descriptor)
            if not stat.S_ISREG(before.st_mode):
                raise OSError("ROBOT JAR is not a regular file")
            self.identity = descriptor_identity(before)
            self.bytes = before.st_size
            self.sha256 = sha256_descriptor(self.descriptor, self.bytes)
            if descriptor_identity(os.fstat(self.descriptor)) != self.identity:
                raise OSError("ROBOT JAR changed while it was initially hashed")
        except BaseException:
            self.close()
            raise

    def assert_unchanged(self) -> None:
        before = descriptor_identity(os.fstat(self.descriptor))
        digest = sha256_descriptor(self.descriptor, self.bytes)
        after = descriptor_identity(os.fstat(self.descriptor))
        if before != self.identity or after != self.identity or digest != self.sha256:
            raise OSError("pinned ROBOT descriptor changed while it was being checked")

    def close(self) -> None:
        if self.descriptor >= 0:
            os.close(self.descriptor)
            self.descriptor = -1


def read_repository_version_pin(path: Path) -> str:
    if not hasattr(os, "O_NOFOLLOW"):
        raise OSError("this platform cannot read version pins without following links")
    flags = os.O_RDONLY | os.O_NOFOLLOW | getattr(os, "O_CLOEXEC", 0)
    descriptor = os.open(path, flags)
    try:
        status = os.fstat(descriptor)
        if not stat.S_ISREG(status.st_mode) or status.st_size > 128:
            raise OSError(f"version pin is not a bounded regular file: {path}")
        raw = os.read(descriptor, 129)
    finally:
        os.close(descriptor)
    if len(raw) > 128 or not raw.endswith(b"\n") or raw.count(b"\n") != 1:
        raise ValueError(f"version pin must contain one LF-terminated line: {path}")
    try:
        value = raw[:-1].decode("ascii", "strict")
    except UnicodeError as error:
        raise ValueError(f"version pin is not ASCII: {path}") from error
    if VERSION_PIN_RE.fullmatch(value) is None:
        raise ValueError(f"version pin has an unsupported value: {path}")
    return value


def clipped(value: str, limit: int = 8_192) -> str:
    value = value.strip()
    return value if len(value) <= limit else value[:limit] + "...[truncated]"


def command_result(
    command: list[str], *, timeout_seconds: int
) -> tuple[int | None, str, str, str | None]:
    try:
        completed = subprocess.run(
            command,
            check=False,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
        )
    except (OSError, subprocess.SubprocessError) as error:
        return None, "", "", f"{type(error).__name__}: {error}"
    return (
        completed.returncode,
        clipped(completed.stdout),
        clipped(completed.stderr),
        None,
    )


def check_java() -> tuple[dict[str, Any], str | None]:
    try:
        expected_java = read_repository_version_pin(JAVA_VERSION_PATH)
        expected_corretto = read_repository_version_pin(CORRETTO_VERSION_PATH)
    except (OSError, ValueError) as error:
        return (
            {
                "id": "java-runtime",
                "status": "fail",
                "executable": None,
                "expected": {"javaVersion": None, "correttoVersion": None},
                "observed": {"javaVersion": None, "correttoVersion": None},
                "error": f"could not load repository Java pins: {error}",
            },
            None,
        )

    executable = shutil.which("java")
    result: dict[str, Any] = {
        "id": "java-runtime",
        "status": "fail",
        "executable": executable,
        "expected": {
            "javaVersion": expected_java,
            "correttoVersion": expected_corretto,
        },
        "observed": {"javaVersion": None, "correttoVersion": None},
    }
    if executable is None:
        result["error"] = "java executable not found on PATH"
        return result, None

    return_code, stdout, stderr, error = command_result(
        [executable, "-version"], timeout_seconds=30
    )
    combined = "\n".join(part for part in (stdout, stderr) if part)
    version_match = re.search(r'version\s+"([^"]+)"', combined)
    corretto_match = re.search(
        r"\bCorretto-([0-9]+(?:\.[0-9]+){2,4})(?=[\s)])", combined
    )
    observed_java = version_match.group(1) if version_match else None
    observed_corretto = corretto_match.group(1) if corretto_match else None
    result.update(
        {
            "returnCode": return_code,
            "observed": {
                "javaVersion": observed_java,
                "correttoVersion": observed_corretto,
            },
        }
    )
    if error is not None:
        result["error"] = error
    elif return_code != 0:
        result["error"] = "java -version returned a non-zero status"
    elif version_match is None:
        result["error"] = "could not parse java -version output"
    elif corretto_match is None:
        result["error"] = "Java runtime is not the repository-pinned Amazon Corretto build"
    elif observed_java != expected_java or observed_corretto != expected_corretto:
        result["error"] = "Java runtime differs from repository version pins"
    else:
        result["status"] = "pass"
    return result, executable


def check_robot_artifact(path: Path) -> tuple[dict[str, Any], PinnedRobot | None]:
    result: dict[str, Any] = {
        "id": "robot-artifact",
        "status": "fail",
        "path": str(path),
        "expected": {
            "bytes": ROBOT_BYTES,
            "sha256": ROBOT_SHA256,
            "version": ROBOT_VERSION,
        },
        "observed": {"bytes": None, "sha256": None},
    }
    try:
        pinned = PinnedRobot(path)
    except OSError as error:
        result["error"] = f"{type(error).__name__}: {error}"
        return result, None

    result["observed"] = {
        "bytes": pinned.bytes,
        "sha256": pinned.sha256,
    }
    if pinned.bytes != ROBOT_BYTES or pinned.sha256 != ROBOT_SHA256:
        result["error"] = "ROBOT JAR does not match the pinned artifact"
        pinned.close()
        return result, None

    result["status"] = "pass"
    return result, pinned


def copy_descriptor_to_private_file(source: PinnedRobot, destination: Path) -> None:
    flags = (
        os.O_WRONLY
        | os.O_CREAT
        | os.O_EXCL
        | os.O_NOFOLLOW
        | getattr(os, "O_CLOEXEC", 0)
    )
    descriptor = os.open(destination, flags, 0o600)
    try:
        offset = 0
        while offset < source.bytes:
            chunk = os.pread(
                source.descriptor, min(1024 * 1024, source.bytes - offset), offset
            )
            if not chunk:
                raise OSError("pinned ROBOT ended while its private copy was written")
            pending = memoryview(chunk)
            while pending:
                written = os.write(descriptor, pending)
                if written <= 0:
                    raise OSError("could not finish writing the private ROBOT copy")
                pending = pending[written:]
            offset += len(chunk)
        os.fsync(descriptor)
        os.fchmod(descriptor, 0o400)
    finally:
        os.close(descriptor)
    source.assert_unchanged()


def check_robot_cli(
    pinned: PinnedRobot | None, *, java_executable: str | None
) -> dict[str, Any]:
    result: dict[str, Any] = {
        "id": "robot-cli",
        "status": "fail",
        "expectedVersionLine": ROBOT_VERSION_LINE,
        "observedVersionLine": None,
        "executionBinding": {
            "strategy": "verified-private-copy",
            "bytes": None,
            "sha256": None,
        },
    }
    if java_executable is None:
        result["error"] = "ROBOT CLI was not executed because Java is unavailable"
        return result
    if pinned is None:
        result["error"] = (
            "ROBOT CLI was not executed because the artifact is not pinned and verified"
        )
        return result

    try:
        with tempfile.TemporaryDirectory(prefix="skillpilot-pinned-robot-") as directory:
            private_directory = Path(directory)
            os.chmod(private_directory, 0o700)
            if stat.S_IMODE(private_directory.stat().st_mode) != 0o700:
                raise OSError("private ROBOT execution directory is not mode 0700")
            private_path = private_directory / "robot.jar"
            copy_descriptor_to_private_file(pinned, private_path)
            private = PinnedRobot(private_path)
            try:
                if private.bytes != ROBOT_BYTES or private.sha256 != ROBOT_SHA256:
                    raise OSError("private ROBOT copy differs from the pinned artifact")
                result["executionBinding"] = {
                    "strategy": "verified-private-copy",
                    "bytes": private.bytes,
                    "sha256": private.sha256,
                }
                return_code, stdout, stderr, error = command_result(
                    [java_executable, "-jar", str(private_path), "--version"],
                    timeout_seconds=60,
                )
                private.assert_unchanged()
                pinned.assert_unchanged()
            finally:
                private.close()
    except OSError as file_error:
        result["error"] = f"private ROBOT execution binding failed: {file_error}"
        return result

    combined_lines = [
        line.strip()
        for output in (stdout, stderr)
        for line in output.splitlines()
        if line.strip()
    ]
    observed_version_line = next(
        (line for line in combined_lines if line.startswith("ROBOT version ")), None
    )
    result.update(
        {
            "returnCode": return_code,
            "observedVersionLine": observed_version_line,
        }
    )
    if error is not None:
        result["error"] = error
        return result
    if return_code != 0:
        result["error"] = "ROBOT --version returned a non-zero status"
        return result
    if observed_version_line != ROBOT_VERSION_LINE:
        result["error"] = "ROBOT reported an unexpected version"
        return result

    result["status"] = "pass"
    return result


def check_python_distributions() -> dict[str, Any]:
    observed: dict[str, dict[str, Any]] = {}
    valid = True
    for distribution, expected_version in sorted(PYTHON_DISTRIBUTIONS.items()):
        distribution_result: dict[str, Any] = {
            "expectedVersion": expected_version,
            "observedVersion": None,
            "imported": False,
            "status": "fail",
        }
        try:
            observed_version = importlib.metadata.version(distribution)
            distribution_result["observedVersion"] = observed_version
        except importlib.metadata.PackageNotFoundError:
            distribution_result["error"] = "distribution metadata not found"
            observed[distribution] = distribution_result
            valid = False
            continue

        try:
            importlib.import_module(distribution)
            distribution_result["imported"] = True
        except Exception as error:  # noqa: BLE001 - report import failures fail-closed
            distribution_result["error"] = (
                f"module import failed: {type(error).__name__}: {error}"
            )
            observed[distribution] = distribution_result
            valid = False
            continue

        if observed_version != expected_version:
            distribution_result["error"] = "distribution version is not pinned"
            observed[distribution] = distribution_result
            valid = False
            continue

        distribution_result["status"] = "pass"
        observed[distribution] = distribution_result

    return {
        "id": "python-modules",
        "status": "pass" if valid else "fail",
        "pythonExecutable": sys.executable,
        "pythonVersion": sys.version.split()[0],
        "distributions": observed,
    }


def atomic_write(path: Path, payload: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{path.name}.", suffix=".tmp", dir=path.parent
    )
    temporary_path = Path(temporary_name)
    try:
        with os.fdopen(descriptor, "wb") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(temporary_path, 0o644)
        os.replace(temporary_path, path)
    except BaseException:
        temporary_path.unlink(missing_ok=True)
        raise


def main() -> int:
    args = parse_args()
    # Keep the final path component unresolved so the artifact check can reject
    # symlinks instead of silently accepting their targets.
    robot_jar = args.robot_jar.expanduser().absolute()

    java_check, java_executable = check_java()
    robot_artifact_check, pinned_robot = check_robot_artifact(robot_jar)
    try:
        robot_cli_check = check_robot_cli(
            pinned_robot,
            java_executable=(
                java_executable if java_check["status"] == "pass" else None
            ),
        )
    finally:
        if pinned_robot is not None:
            pinned_robot.close()
    python_check = check_python_distributions()
    checks = [java_check, robot_artifact_check, robot_cli_check, python_check]
    status = "pass" if all(check["status"] == "pass" for check in checks) else "fail"
    report = {
        "schemaVersion": "skillpilot.curriculum-fwu-owl-validation-tools-report.v1",
        "status": status,
        "networkAccessAttempted": False,
        "checks": checks,
    }
    payload = (
        json.dumps(
            report,
            ensure_ascii=False,
            allow_nan=False,
            indent=2,
            sort_keys=True,
        )
        + "\n"
    ).encode("utf-8")

    if args.report is not None:
        try:
            atomic_write(args.report.expanduser().resolve(strict=False), payload)
        except OSError as error:
            print(payload.decode("utf-8"), end="")
            print(f"Could not write tool report: {error}", file=sys.stderr)
            return 2

    print(payload.decode("utf-8"), end="")
    return 0 if status == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
