#!/usr/bin/env python3
"""Small fail-closed entry point for one isolated FWU-to-JSON build.

The host runner mounts this file, the reverse compiler, the validated FWU ZIP,
and its external validation receipt through already-open descriptors.  This
entry point verifies the namespace view before it starts the compiler and
records the observation independently of compiler output.
"""

from __future__ import annotations

import argparse
import errno
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
from typing import Sequence


EXPECTED_ENVIRONMENT_KEYS = (
    "HOME",
    "LANG",
    "LC_ALL",
    "LOGNAME",
    "PATH",
    "PWD",
    "PYTHONHASHSEED",
    "PYTHONNOUSERSITE",
    "SOURCE_DATE_EPOCH",
    "TZ",
    "USER",
)
EXPECTED_INPUT_NAMES = (
    "candidate.fwu-owl.zip",
    "validation-report.json",
)
EXPECTED_OPT_NAMES = ("evidence", "input", "output", "reverse-runner", "tools")


class EntryFailure(Exception):
    """The sandbox view does not satisfy the closed execution contract."""


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--compiler", type=Path, required=True)
    parser.add_argument("--fwu-owl-zip", type=Path, required=True)
    parser.add_argument("--validation-report", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--compiler-report", type=Path, required=True)
    parser.add_argument("--isolation-probe", type=Path, required=True)
    parser.add_argument("--host-network-namespace", required=True)
    parser.add_argument("--expected-root-entry", action="append", default=[])
    parser.add_argument("--host-root-sentinel", action="append", default=[])
    parser.add_argument("--masked-path", action="append", default=[])
    return parser.parse_args(argv)


def regular_read_only_file(path: Path) -> bool:
    try:
        metadata = path.stat(follow_symlinks=False)
    except OSError:
        return False
    if not stat.S_ISREG(metadata.st_mode):
        return False
    try:
        descriptor = os.open(path, os.O_WRONLY | getattr(os, "O_NOFOLLOW", 0))
    except OSError as error:
        return error.errno in {errno.EACCES, errno.EPERM, errno.EROFS}
    else:
        os.close(descriptor)
        return False


def atomic_json(path: Path, value: object) -> None:
    raw = (
        json.dumps(value, ensure_ascii=False, allow_nan=False, indent=2, sort_keys=True)
        + "\n"
    ).encode("utf-8")
    temporary = path.with_name(f".{path.name}.tmp-{os.getpid()}")
    descriptor = os.open(
        temporary,
        os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0),
        0o600,
    )
    try:
        with os.fdopen(descriptor, "wb", closefd=False) as handle:
            handle.write(raw)
            handle.flush()
            os.fsync(handle.fileno())
    finally:
        os.close(descriptor)
    os.replace(temporary, path)


def close_inherited_descriptors() -> list[int]:
    try:
        names = list(os.listdir("/proc/self/fd"))
    except OSError as error:
        raise EntryFailure(
            f"cannot enumerate inherited descriptors: {error}"
        ) from error
    closed: list[int] = []
    for name in names:
        try:
            descriptor = int(name)
        except ValueError:
            continue
        if descriptor <= 2:
            continue
        try:
            os.close(descriptor)
        except OSError as error:
            if error.errno != errno.EBADF:
                raise EntryFailure(
                    f"cannot close inherited descriptor {descriptor}: {error}"
                ) from error
        else:
            closed.append(descriptor)
    return sorted(closed)


def inspect_namespace(
    args: argparse.Namespace,
    closed_descriptors: Sequence[int],
    inherited_descriptors_closed: bool,
) -> dict[str, object]:
    input_root = args.fwu_owl_zip.parent
    try:
        input_names = sorted(path.name for path in input_root.iterdir())
    except OSError as error:
        raise EntryFailure(
            f"cannot enumerate the isolated input directory: {error}"
        ) from error

    environment_keys = sorted(os.environ)
    root_entries = sorted(path.name for path in Path("/").iterdir())
    temporary_names = sorted(path.name for path in Path("/tmp").iterdir())
    opt_names = sorted(path.name for path in Path("/opt").iterdir())
    masked = [
        {"path": path, "accessible": os.path.lexists(path)} for path in args.masked_path
    ]
    host_root_sentinels = [
        {"path": path, "accessible": os.path.lexists(path)}
        for path in args.host_root_sentinel
    ]
    try:
        sandbox_network_namespace = os.readlink("/proc/self/ns/net")
    except OSError as error:
        raise EntryFailure(
            f"cannot inspect sandbox network namespace: {error}"
        ) from error
    checks = {
        "compilerReadOnly": regular_read_only_file(args.compiler),
        "fwuOwlReadOnly": regular_read_only_file(args.fwu_owl_zip),
        "validationReportReadOnly": regular_read_only_file(args.validation_report),
        "inputNames": input_names,
        "environmentKeys": environment_keys,
        "rootEntries": root_entries,
        "temporaryNames": temporary_names,
        "optNames": opt_names,
        "hostRootSentinels": host_root_sentinels,
        "maskedPaths": masked,
        "networkNamespaceIsolated": sandbox_network_namespace
        != args.host_network_namespace,
        "pythonExecutable": sys.executable,
        "pythonIsolated": sys.flags.isolated == 1,
        "pythonNoSite": sys.flags.no_site == 1,
        "traceFdClosed": inherited_descriptors_closed,
        "closedInheritedDescriptors": list(closed_descriptors),
        "originalJsonProvided": any(name.endswith(".json.zip") for name in input_names),
        "outputTargetAbsent": not args.output_dir.exists(),
        "outputWritable": False,
    }

    probe = args.output_dir.parent / ".write-probe"
    try:
        probe.write_bytes(b"private-output\n")
        checks["outputWritable"] = probe.read_bytes() == b"private-output\n"
    finally:
        probe.unlink(missing_ok=True)

    if input_names != list(EXPECTED_INPUT_NAMES):
        raise EntryFailure(f"isolated input set is not closed: {input_names!r}")
    if environment_keys != list(EXPECTED_ENVIRONMENT_KEYS):
        raise EntryFailure(f"sandbox environment is not closed: {environment_keys!r}")
    if root_entries != sorted(args.expected_root_entry):
        raise EntryFailure(f"sandbox root set is not closed: {root_entries!r}")
    if temporary_names:
        raise EntryFailure(
            f"sandbox temporary directory is not initially empty: {temporary_names!r}"
        )
    if opt_names != list(EXPECTED_OPT_NAMES):
        raise EntryFailure(f"sandbox /opt set is not closed: {opt_names!r}")
    if checks["originalJsonProvided"]:
        raise EntryFailure(
            "an original JSON package was exposed to the reverse compiler"
        )
    if any(item["accessible"] for item in masked):
        raise EntryFailure("a masked authoring/original-input path remained accessible")
    if any(item["accessible"] for item in host_root_sentinels):
        raise EntryFailure("a forbidden host-root sentinel remained accessible")
    if not checks["networkNamespaceIsolated"]:
        raise EntryFailure("sandbox retained the host network namespace")
    if not all(
        checks[key]
        for key in (
            "compilerReadOnly",
            "fwuOwlReadOnly",
            "validationReportReadOnly",
            "outputTargetAbsent",
            "outputWritable",
            "pythonIsolated",
            "pythonNoSite",
            "traceFdClosed",
        )
    ):
        raise EntryFailure(
            "sandbox input/output permissions differ from the closed contract"
        )
    return checks


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        closed_descriptors = close_inherited_descriptors()
    except EntryFailure as error:
        print(f"cannot close inherited descriptors: {error}", file=sys.stderr)
        return 127
    inherited_descriptors_closed = True
    for descriptor in closed_descriptors:
        try:
            os.fstat(descriptor)
        except OSError as error:
            if error.errno != errno.EBADF:
                inherited_descriptors_closed = False
        else:
            inherited_descriptors_closed = False
    probe: dict[str, object] = {
        "schemaVersion": "skillpilot.fwu-owl-reverse-isolation-probe.v1",
        "status": "error",
        "compilerExitCode": None,
        "checks": None,
        "diagnostic": None,
    }
    exit_code = 125
    try:
        probe["checks"] = inspect_namespace(
            args, closed_descriptors, inherited_descriptors_closed
        )
        command = [
            sys.executable,
            "-I",
            "-S",
            "-B",
            str(args.compiler),
            "--fwu-owl-zip",
            str(args.fwu_owl_zip),
            "--validation-report",
            str(args.validation_report),
            "--output-dir",
            str(args.output_dir),
            "--report",
            str(args.compiler_report),
        ]
        result = subprocess.run(
            command,
            stdin=subprocess.DEVNULL,
            check=False,
            env=dict(os.environ),
        )
        exit_code = result.returncode
        probe["compilerExitCode"] = exit_code
        probe["status"] = "passed" if exit_code == 0 else "failed"
    except (EntryFailure, OSError, subprocess.SubprocessError) as error:
        probe["diagnostic"] = f"{type(error).__name__}: {error}"
    try:
        atomic_json(args.isolation_probe, probe)
    except OSError as error:
        print(f"cannot persist isolation probe: {error}", file=sys.stderr)
        return 126
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
