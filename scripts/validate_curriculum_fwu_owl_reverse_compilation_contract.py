#!/usr/bin/env python3
"""Validate the external FWU-OWL reverse-compilation receipt contract.

This validator is deliberately independent of the TypeScript forward exporter and
reverse compiler.  It validates the closed report schema, cross-field bindings,
the positive contract fixture, raw JSON rejection, and a fail-closed mutation
matrix.  It does not compare the reconstructed package with the original JSON
package; that belongs to the later dual-release equivalence gate.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import math
import os
import re
import stat
import sys
import tempfile
import zipfile
from dataclasses import dataclass
from importlib.metadata import version as distribution_version
from pathlib import Path
from typing import Any, Callable

from jsonschema import Draft202012Validator


sys.dont_write_bytecode = True

REPO_ROOT = Path(__file__).resolve().parents[1]
CONTRACT_ROOT = REPO_ROOT / "contracts" / "curriculum-package" / "v1"
SCHEMA_PATH = CONTRACT_ROOT / "fwu-owl-reverse-compilation-report.schema.json"
FWU_RECEIPT_SCHEMA_PATH = CONTRACT_ROOT / "fwu-owl-package-validation-report.schema.json"
FULL_RECEIPT_SCHEMA_PATH = CONTRACT_ROOT / "full-package-validation-report.schema.json"
JSON_MANIFEST_SCHEMA_PATH = CONTRACT_ROOT / "package-manifest.schema.json"
FWU_MANIFEST_SCHEMA_PATH = CONTRACT_ROOT / "fwu-owl-package-manifest.schema.json"
SEMANTIC_INDEX_SCHEMA_PATH = CONTRACT_ROOT / "semantic-content-index.schema.json"
FIXTURE_PATH = (
    CONTRACT_ROOT
    / "fixtures"
    / "fwu-owl-reverse-compilation"
    / "valid-report.json"
)
EARLY_FIXTURE_PATHS = [
    FIXTURE_PATH.parent / "early-invalid-report.json",
    FIXTURE_PATH.parent / "early-error-report.json",
]
SCHEMA_ID = (
    "https://skillpilot.com/schemas/curriculum-package/v1/"
    "fwu-owl-reverse-compilation-report.schema.json"
)
JSONSCHEMA_VERSION = "4.26.0"
MAX_JSON_BYTES = 16 * 1024 * 1024
MAX_JSON_DEPTH = 128
MAX_JSON_NODES = 1_000_000
EXPECTED_GATE_IDS = [
    "archive-security",
    "manifest-schema",
    "profile-contract",
    "inventory",
    "contract-bindings",
    "offline-schema-catalog",
    "semantic-content-index",
    "field-registry-coverage",
    "rdf-syntax",
    "rdf-segment-order",
    "rdf-bundle",
    "core-binding",
    "ontology-profile",
    "shacl",
    "owl2-dl",
    "reasoner",
    "binary-sidecars",
    "reproducibility",
]
EXPECTED_FULL_GATE_IDS = (
    "assetBytes",
    "contentDigest",
    "hardReferenceClosure",
    "inventory",
    "offlineSchemaCatalog",
    "runtimeCatalog",
)
HOST_ROOT_SENTINELS = (
    "/boot",
    "/data",
    "/etc",
    "/home",
    "/media",
    "/mnt",
    "/root",
    "/run",
    "/srv",
    "/var",
)
EXPECTED_SANDBOX_INPUT_NAMES = (
    "candidate.fwu-owl.zip",
    "validation-report.json",
)
EXPECTED_SANDBOX_OPT_NAMES = (
    "evidence",
    "input",
    "output",
    "reverse-runner",
    "tools",
)
NETWORK_SYSCALL_RE = re.compile(
    r"\b(?:accept4?|bind|connect|getpeername|getsockname|getsockopt|listen|recvfrom|"
    r"recvmmsg|recvmsg|sendmmsg|sendmsg|sendto|setsockopt|shutdown|socket|socketpair)\("
)
SUCCESSFUL_OPEN_RE = re.compile(
    r'\bopen(?:at2|at)?\([^\n]*?"(/[^"\\]*(?:\\.[^"\\]*)*)"[^\n]*\)\s+=\s+[0-9]+'
)
OPEN_CALL_PATH_RE = re.compile(
    r'\bopen(?:at2|at)?\([^\n]*?"(/[^"\\]*(?:\\.[^"\\]*)*)"'
)
EXPECTED_EVIDENCE_KEYS = (
    "compilerReport",
    "isolationProbe",
    "sandboxLog",
    "outputTreeManifest",
    "fullValidatorLog",
    "hostRawTrace",
    "traceProcessTreeManifest",
)
READ_CHUNK_BYTES = 8 * 1024 * 1024
MAX_EVIDENCE_JSON_BYTES = 67_108_864
MAX_TRACE_BYTES = 536_870_912
TRACE_PID_RE = re.compile(rb"^(?:\[pid\s+)?([0-9]+)\]?\s+")
TRACE_PROCESS_EDGE_RE = re.compile(
    rb"\b(?:clone|clone3|fork|vfork)\([^\n]*\)\s+=\s+([0-9]+)(?:\s|$)"
)
SANDBOX_ENTRY_EXEC_PREFIX = (
    b'execve("/opt/tools/python3", ["/opt/tools/python3", "-I", "-S", "-B", '
    b'"/opt/reverse-runner/sandbox-entry.py"'
)
SANDBOX_CORE_EXEC_PREFIX = (
    b'execve("/opt/tools/python3", ["/opt/tools/python3", "-I", "-S", "-B", '
    b'"/opt/reverse-runner/reconstruct.py"'
)
EXPECTED_MATHEMATICS_COUNTS = {
    "zipEntries": 911,
    "manifestFiles": 909,
    "checksumRows": 910,
    "logicalArtifacts": 111,
    "binaryResources": 757,
    "binaryBytes": 1_696_390_279,
}


class ContractError(RuntimeError):
    """The trusted contract or a report is not unambiguous RFC-8259 JSON."""


@dataclass(frozen=True, order=True)
class Diagnostic:
    code: str
    location: str
    message: str


@dataclass(frozen=True)
class MutationCase:
    case_id: str
    expected_code: str
    mutate: Callable[[dict[str, Any]], None]


@dataclass
class SecureFile:
    """One file opened through a held, no-follow directory-descriptor chain."""

    label: str
    descriptor: int
    directory_descriptors: list[int]
    edges: list[tuple[int, str, tuple[int, int, int]]]
    identity: tuple[int, int, int, int, int, int, int]
    raw_path: str

    def read(self, maximum: int = MAX_EVIDENCE_JSON_BYTES) -> bytes:
        size = self.identity[3]
        if size > maximum:
            raise ContractError(
                f"{self.label} exceeds the {maximum}-byte read bound: {size}"
            )
        chunks: list[bytes] = []
        offset = 0
        while offset < size:
            chunk = os.pread(self.descriptor, min(READ_CHUNK_BYTES, size - offset), offset)
            if not chunk:
                raise ContractError(f"short read from {self.label}")
            chunks.append(chunk)
            offset += len(chunk)
        self.assert_unchanged()
        return b"".join(chunks)

    def sha256(self) -> str:
        digest = hashlib.sha256()
        offset = 0
        size = self.identity[3]
        while offset < size:
            chunk = os.pread(self.descriptor, min(READ_CHUNK_BYTES, size - offset), offset)
            if not chunk:
                raise ContractError(f"short read while hashing {self.label}")
            digest.update(chunk)
            offset += len(chunk)
        self.assert_unchanged()
        return digest.hexdigest()

    def duplicate(self) -> Any:
        return os.fdopen(os.dup(self.descriptor), "rb", closefd=True)

    def assert_unchanged(self) -> None:
        current = _file_identity(os.fstat(self.descriptor))
        if current != self.identity:
            raise ContractError(f"bound evidence changed while held: {self.label}")
        for parent, name, expected in self.edges:
            try:
                metadata = os.stat(name, dir_fd=parent, follow_symlinks=False)
            except OSError as error:
                raise ContractError(
                    f"bound evidence path edge disappeared for {self.label}: {name}: {error}"
                ) from error
            observed = (metadata.st_dev, metadata.st_ino, metadata.st_mode)
            if observed != expected or stat.S_ISLNK(metadata.st_mode):
                raise ContractError(
                    f"bound evidence path edge changed for {self.label}: {name}"
                )

    def close(self) -> None:
        os.close(self.descriptor)
        for descriptor in reversed(self.directory_descriptors):
            os.close(descriptor)


@dataclass(frozen=True)
class ArchiveSummary:
    outer_bytes: int
    outer_sha256: str
    archive_root: str
    manifest_sha256: str
    content_digest: str
    release_id: str
    package_id: str
    package_version: str
    counts: dict[str, int]
    closure_digest: str | None
    definition_index_digest: str | None
    registry: dict[str, Any]


def _file_identity(metadata: os.stat_result) -> tuple[int, int, int, int, int, int, int]:
    return (
        metadata.st_dev,
        metadata.st_ino,
        metadata.st_mode,
        metadata.st_size,
        metadata.st_mtime_ns,
        metadata.st_ctime_ns,
        metadata.st_nlink,
    )


def preflight_json(raw: bytes, source: str) -> None:
    if len(raw) > MAX_JSON_BYTES:
        raise ContractError(f"JSON exceeds {MAX_JSON_BYTES} bytes: {source}")
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as error:
        raise ContractError(f"JSON is not UTF-8: {source}: {error}") from error

    depth = 0
    nodes = 0
    in_string = False
    escaped = False
    for character in text:
        if in_string:
            if escaped:
                escaped = False
            elif character == "\\":
                escaped = True
            elif character == '"':
                in_string = False
            continue
        if character == '"':
            in_string = True
        elif character in "[{":
            depth += 1
            nodes += 1
            if depth > MAX_JSON_DEPTH:
                raise ContractError(
                    f"JSON nesting exceeds {MAX_JSON_DEPTH}: {source}"
                )
        elif character in "]}":
            depth -= 1
            if depth < 0:
                break
        elif character in ",:":
            nodes += 1
        if nodes > MAX_JSON_NODES:
            raise ContractError(f"JSON node bound exceeds {MAX_JSON_NODES}: {source}")


def validate_json_scalars(value: Any, source: str) -> None:
    if isinstance(value, float) and not math.isfinite(value):
        raise ContractError(f"Non-finite decoded number in {source}")
    if isinstance(value, str):
        for character in value:
            codepoint = ord(character)
            if 0xD800 <= codepoint <= 0xDFFF:
                raise ContractError(f"Unpaired surrogate in {source}")
            if codepoint in {0xFFFE, 0xFFFF}:
                raise ContractError(f"Forbidden Unicode noncharacter in {source}")
            if codepoint < 0x20 and codepoint not in {0x09, 0x0A, 0x0D}:
                raise ContractError(f"Unsafe control character in {source}")
    elif isinstance(value, dict):
        for key, child in value.items():
            validate_json_scalars(key, source)
            validate_json_scalars(child, source)
    elif isinstance(value, list):
        for child in value:
            validate_json_scalars(child, source)


def strict_json_loads(raw: bytes, source: str) -> Any:
    preflight_json(raw, source)

    def object_pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
        result: dict[str, Any] = {}
        for key, value in pairs:
            if key in result:
                raise ContractError(f"Duplicate JSON key {key!r} in {source}")
            result[key] = value
        return result

    def reject_constant(value: str) -> Any:
        raise ContractError(f"Non-RFC-8259 number {value!r} in {source}")

    try:
        value = json.loads(
            raw.decode("utf-8"),
            object_pairs_hook=object_pairs,
            parse_constant=reject_constant,
        )
    except ContractError:
        raise
    except (UnicodeError, json.JSONDecodeError) as error:
        raise ContractError(f"Cannot parse {source}: {error}") from error
    validate_json_scalars(value, source)
    return value


def load_json(path: Path) -> Any:
    try:
        return strict_json_loads(path.read_bytes(), str(path))
    except OSError as error:
        raise ContractError(f"Cannot read {path}: {error}") from error


def schema_diagnostics(
    value: Any,
    validator: Draft202012Validator,
) -> list[Diagnostic]:
    diagnostics: list[Diagnostic] = []
    errors = sorted(
        validator.iter_errors(value),
        key=lambda error: (
            tuple(str(part) for part in error.absolute_path),
            error.message,
        ),
    )
    for error in errors:
        location = "/" + "/".join(str(part) for part in error.absolute_path)
        diagnostics.append(Diagnostic("REVERSE_SCHEMA", location, error.message))
    return diagnostics


def object_at(value: Any, key: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        return {}
    child = value.get(key)
    return child if isinstance(child, dict) else {}


def semantic_diagnostics(report: Any) -> list[Diagnostic]:
    diagnostics: list[Diagnostic] = []
    if not isinstance(report, dict):
        return diagnostics
    if report.get("status") != "valid":
        return diagnostics

    input_value = object_at(report, "input")
    fwu = object_at(input_value, "fwuOwlPackage")
    fwu_receipt = object_at(input_value, "validationReceipt")
    gates = fwu_receipt.get("gates")
    gate_ids = [gate.get("id") for gate in gates if isinstance(gate, dict)] \
        if isinstance(gates, list) else []
    gate_statuses = [gate.get("status") for gate in gates if isinstance(gate, dict)] \
        if isinstance(gates, list) else []
    if gate_ids != EXPECTED_GATE_IDS:
        diagnostics.append(
            Diagnostic(
                "REVERSE_FWU_GATE_SET",
                "/input/validationReceipt/gates",
                "The finished FWU receipt must carry the exact ordered 18-gate set.",
            )
        )
    if fwu_receipt.get("status") != "valid" or gate_statuses != ["passed"] * 18:
        diagnostics.append(
            Diagnostic(
                "REVERSE_FWU_VALIDATION_FAILED",
                "/input/validationReceipt",
                "The bound finished FWU package validation did not pass all gates.",
            )
        )
    if (
        fwu_receipt.get("packageZipSha256") != fwu.get("sha256")
        or fwu_receipt.get("manifestSha256") != fwu.get("manifestSha256")
    ):
        diagnostics.append(
            Diagnostic(
                "REVERSE_FWU_RECEIPT_UNBOUND",
                "/input/validationReceipt",
                "The finished FWU receipt does not bind the declared input ZIP and manifest.",
            )
        )

    isolation = object_at(report, "isolation")
    isolation_flags = [
        isolation.get("originalJsonPackageAccessible"),
        isolation.get("authoringCheckoutAccessible"),
        isolation.get("forwardExporterAccessible"),
        isolation.get("networkAccessible"),
    ]
    if isolation.get("status") != "passed" or isolation_flags != [False] * 4:
        diagnostics.append(
            Diagnostic(
                "REVERSE_NOT_ISOLATED",
                "/isolation",
                "The reverse compiler was not isolated from forbidden inputs or the network.",
            )
        )
    traces = [object_at(isolation, "runA"), object_at(isolation, "runB")]
    if any(
        trace.get("forbiddenReadCount") != 0
        or trace.get("networkAttemptCount") != 0
        for trace in traces
    ):
        diagnostics.append(
            Diagnostic(
                "REVERSE_TRACE_NOT_CLEAN",
                "/isolation",
                "A trace contains a forbidden read or network attempt.",
            )
        )
    trace_paths = [trace.get("path") for trace in traces]
    if None not in trace_paths and len(set(trace_paths)) != 2:
        diagnostics.append(
            Diagnostic(
                "REVERSE_TRACE_COLLISION",
                "/isolation",
                "Run A and run B must have separate trace evidence.",
            )
        )

    runs = object_at(report, "runs")
    run_values = [object_at(runs, "runA"), object_at(runs, "runB")]
    outputs = [object_at(run, "output") for run in run_values]
    validations = [object_at(run, "validationReceipt") for run in run_values]
    for index, (output, validation) in enumerate(zip(outputs, validations)):
        label = "runA" if index == 0 else "runB"
        if output.get("contentDigest") != fwu.get("contentDigest"):
            diagnostics.append(
                Diagnostic(
                    "REVERSE_CONTENT_DIGEST_MISMATCH",
                    f"/runs/{label}/output/contentDigest",
                    "The reconstructed JSON package does not retain the FWU semantic content digest.",
                )
            )
        counts = object_at(output, "counts")
        archive_entries = counts.get("zipEntries")
        manifest_files = counts.get("manifestFiles")
        checksum_rows = counts.get("checksumRows")
        if (
            not isinstance(archive_entries, int)
            or not isinstance(manifest_files, int)
            or not isinstance(checksum_rows, int)
            or archive_entries != manifest_files + 2
            or checksum_rows != archive_entries - 1
        ):
            diagnostics.append(
                Diagnostic(
                    "REVERSE_INVENTORY_ARITHMETIC",
                    f"/runs/{label}/output/counts",
                    "ZIP, manifest, and checksum inventories do not form one closed package.",
                )
            )
        binary_resources = counts.get("binaryResources")
        binary_bytes = counts.get("binaryBytes")
        if (
            isinstance(binary_resources, int)
            and isinstance(binary_bytes, int)
            and ((binary_resources == 0) != (binary_bytes == 0))
        ):
            diagnostics.append(
                Diagnostic(
                    "REVERSE_BINARY_INVENTORY_MISMATCH",
                    f"/runs/{label}/output/counts",
                    "Binary count and total byte count disagree.",
                )
            )
        if validation.get("status") != "valid" or validation.get("errorCount") != 0:
            diagnostics.append(
                Diagnostic(
                    "REVERSE_OUTPUT_VALIDATION_FAILED",
                    f"/runs/{label}/validationReceipt",
                    "The independently validated reconstructed JSON package is not valid and clean.",
                )
            )
        if (
            validation.get("packageZipSha256") != output.get("sha256")
            or validation.get("manifestSha256") != output.get("manifestSha256")
        ):
            diagnostics.append(
                Diagnostic(
                    "REVERSE_OUTPUT_VALIDATION_UNBOUND",
                    f"/runs/{label}/validationReceipt",
                    "The JSON validator receipt does not bind the reconstructed ZIP and manifest.",
                )
            )

    output_paths = [output.get("path") for output in outputs]
    if None not in output_paths and len(set(output_paths)) != 2:
        diagnostics.append(
            Diagnostic(
                "REVERSE_OUTPUT_COLLISION",
                "/runs",
                "Run A and run B must write separate output paths.",
            )
        )
    validation_paths = [validation.get("path") for validation in validations]
    if None not in validation_paths and len(set(validation_paths)) != 2:
        diagnostics.append(
            Diagnostic(
                "REVERSE_VALIDATION_RECEIPT_COLLISION",
                "/runs",
                "Run A and run B must have separate JSON validation receipts.",
            )
        )

    evidence_paths: list[Any] = []
    runtime_bindings: list[dict[str, Any]] = []
    for run in run_values:
        evidence = object_at(run, "evidence")
        for evidence_name in (*EXPECTED_EVIDENCE_KEYS, "runtimeClosureManifest"):
            binding = object_at(evidence, evidence_name)
            evidence_paths.append(binding.get("path"))
        runtime_bindings.append(object_at(evidence, "runtimeClosureManifest"))
    trace_bindings = [object_at(isolation, "runA"), object_at(isolation, "runB")]
    evidence_paths.extend(binding.get("path") for binding in trace_bindings)
    evidence_paths.extend(validation_paths)
    if None not in evidence_paths and len(evidence_paths) != len(set(evidence_paths)):
        diagnostics.append(
            Diagnostic(
                "REVERSE_EVIDENCE_PATH_COLLISION",
                "/runs",
                "Every evidence artifact and nested receipt must use a distinct path.",
            )
        )
    runtime_projections = [
        {"bytes": binding.get("bytes"), "sha256": binding.get("sha256")}
        for binding in runtime_bindings
    ]
    if runtime_projections[0] != runtime_projections[1]:
        diagnostics.append(
            Diagnostic(
                "REVERSE_RUNTIME_CLOSURE_REPRODUCIBILITY",
                "/runs",
                "Run A and run B must bind byte-identical Python runtime-closure manifests.",
            )
        )

    reproducibility = object_at(report, "reproducibility")
    output_projections = [
        {
            "bytes": output.get("bytes"),
            "sha256": output.get("sha256"),
            "manifestSha256": output.get("manifestSha256"),
            "contentDigest": output.get("contentDigest"),
            "counts": output.get("counts"),
        }
        for output in outputs
    ]
    if (
        reproducibility.get("status") != "passed"
        or reproducibility.get("zipByteIdentical") is not True
        or reproducibility.get("manifestByteIdentical") is not True
        or output_projections[0] != output_projections[1]
    ):
        diagnostics.append(
            Diagnostic(
                "REVERSE_REPRODUCIBILITY_FAILED",
                "/reproducibility",
                "The two isolated reconstructed package builds are not byte-identical.",
            )
        )

    if report.get("status") == "valid" and diagnostics:
        diagnostics.append(
            Diagnostic(
                "REVERSE_FALSE_PASS",
                "/status",
                "The report claims valid despite failed reverse-compilation invariants.",
            )
        )
    return sorted(set(diagnostics))


def validate_report(
    report: Any,
    validator: Draft202012Validator,
) -> list[Diagnostic]:
    return sorted(set(schema_diagnostics(report, validator) + semantic_diagnostics(report)))


def _safe_path_parts(raw_path: Any, *, absolute_allowed: bool) -> tuple[bool, list[str]]:
    if (
        not isinstance(raw_path, str)
        or not raw_path
        or "\\" in raw_path
        or any(ord(character) < 0x20 or ord(character) == 0x7F for character in raw_path)
    ):
        raise ContractError("bound evidence path is not a canonical POSIX path")
    absolute = raw_path.startswith("/")
    if absolute and not absolute_allowed:
        raise ContractError("report-local evidence path must be relative")
    parts = raw_path.split("/")[1:] if absolute else raw_path.split("/")
    if not parts or any(part in {"", ".", ".."} for part in parts):
        raise ContractError("bound evidence path has an unsafe segment")
    return absolute, parts


def _open_secure_file(
    raw_path: Any,
    *,
    label: str,
    report_parent_descriptor: int | None,
    absolute_allowed: bool,
) -> SecureFile:
    """Open without any lstat/open gap and retain every traversed directory FD."""

    absolute, parts = _safe_path_parts(raw_path, absolute_allowed=absolute_allowed)
    if not absolute and report_parent_descriptor is None:
        raise ContractError(f"relative path has no pinned report root: {label}")
    directory_flags = (
        os.O_RDONLY
        | getattr(os, "O_CLOEXEC", 0)
        | getattr(os, "O_DIRECTORY", 0)
        | getattr(os, "O_NOFOLLOW", 0)
    )
    file_flags = os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0)
    descriptors: list[int] = []
    edges: list[tuple[int, str, tuple[int, int, int]]] = []
    file_descriptor: int | None = None
    try:
        start = os.open("/", directory_flags) if absolute else os.dup(report_parent_descriptor)
        descriptors.append(start)
        if not stat.S_ISDIR(os.fstat(start).st_mode):
            raise ContractError(f"secure path root is not a directory: {label}")
        current = start
        for component in parts[:-1]:
            child = os.open(component, directory_flags, dir_fd=current)
            metadata = os.fstat(child)
            if not stat.S_ISDIR(metadata.st_mode):
                os.close(child)
                raise ContractError(f"non-directory path component for {label}: {component}")
            edges.append(
                (current, component, (metadata.st_dev, metadata.st_ino, metadata.st_mode))
            )
            descriptors.append(child)
            current = child
        file_descriptor = os.open(parts[-1], file_flags, dir_fd=current)
        metadata = os.fstat(file_descriptor)
        if not stat.S_ISREG(metadata.st_mode):
            raise ContractError(f"bound evidence is not a regular file: {label}")
        edges.append(
            (current, parts[-1], (metadata.st_dev, metadata.st_ino, metadata.st_mode))
        )
        return SecureFile(
            label=label,
            descriptor=file_descriptor,
            directory_descriptors=descriptors,
            edges=edges,
            identity=_file_identity(metadata),
            raw_path=str(raw_path),
        )
    except OSError as error:
        if file_descriptor is not None:
            os.close(file_descriptor)
        for descriptor in reversed(descriptors):
            os.close(descriptor)
        raise ContractError(f"cannot securely open {label}: {error}") from error
    except Exception:
        if file_descriptor is not None:
            os.close(file_descriptor)
        for descriptor in reversed(descriptors):
            os.close(descriptor)
        raise


def open_report_securely(path: Path) -> SecureFile:
    absolute = os.path.abspath(os.fspath(path))
    return _open_secure_file(
        absolute,
        label="reverse-compilation report",
        report_parent_descriptor=None,
        absolute_allowed=True,
    )


def _open_and_verify_binding(
    location: str,
    binding: dict[str, Any],
    report_file: SecureFile,
    *,
    absolute_allowed: bool,
) -> SecureFile:
    report_parent = report_file.directory_descriptors[-1]
    opened = _open_secure_file(
        binding.get("path"),
        label=location,
        report_parent_descriptor=report_parent,
        absolute_allowed=absolute_allowed,
    )
    try:
        if opened.identity[3] != binding.get("bytes"):
            raise ContractError(
                f"bound evidence byte count differs for {location}: "
                f"{opened.identity[3]} != {binding.get('bytes')!r}"
            )
        if opened.sha256() != binding.get("sha256"):
            raise ContractError(f"bound evidence SHA-256 differs for {location}")
        return opened
    except Exception:
        opened.close()
        raise


def _strict_bound_json(opened: SecureFile, label: str) -> Any:
    return strict_json_loads(opened.read(), label)


def _schema_assert(value: Any, schema_path: Path, label: str) -> None:
    schema = load_json(schema_path)
    validator = Draft202012Validator(schema)
    errors = sorted(
        validator.iter_errors(value),
        key=lambda error: (tuple(str(part) for part in error.absolute_path), error.message),
    )
    if errors:
        first = errors[0]
        location = "/" + "/".join(str(part) for part in first.absolute_path)
        raise ContractError(f"{label} fails its trusted schema at {location}: {first.message}")


def _safe_archive_relative_path(value: Any) -> str:
    if not isinstance(value, str) or not value or value.startswith("/") or "\\" in value:
        raise ContractError("archive contains a non-canonical relative path")
    parts = value.split("/")
    if any(part in {"", ".", ".."} for part in parts):
        raise ContractError(f"archive contains an unsafe path: {value!r}")
    if any(ord(character) < 0x20 or ord(character) == 0x7F for character in value):
        raise ContractError(f"archive contains a control character in a path: {value!r}")
    return value


def _archive_member_bytes(
    archive: zipfile.ZipFile,
    name: str,
    *,
    maximum: int = MAX_EVIDENCE_JSON_BYTES,
) -> bytes:
    try:
        info = archive.getinfo(name)
    except KeyError as error:
        raise ContractError(f"required archive member is absent: {name}") from error
    if info.file_size > maximum:
        raise ContractError(f"archive member exceeds read bound: {name}")
    try:
        raw = archive.read(info)
    except (OSError, RuntimeError, zipfile.BadZipFile) as error:
        raise ContractError(f"cannot read archive member {name}: {error}") from error
    if len(raw) != info.file_size:
        raise ContractError(f"archive member has a short read: {name}")
    return raw


def _parse_checksum_inventory(raw: bytes) -> dict[str, str]:
    try:
        text = raw.decode("utf-8", "strict")
    except UnicodeError as error:
        raise ContractError("archive SHA256SUMS is not UTF-8") from error
    if not text.endswith("\n") or "\r" in text:
        raise ContractError("archive SHA256SUMS is not canonical LF text")
    result: dict[str, str] = {}
    for line in text.splitlines():
        match = re.fullmatch(r"([a-f0-9]{64})  ([^\r\n]+)", line)
        if match is None:
            raise ContractError("archive SHA256SUMS contains a malformed row")
        path = _safe_archive_relative_path(match.group(2))
        if path in result:
            raise ContractError(f"archive SHA256SUMS duplicates {path}")
        result[path] = match.group(1)
    if list(result) != sorted(result):
        raise ContractError("archive SHA256SUMS is not path-sorted")
    return result


def _frame(value: str) -> bytes:
    raw = value.encode("utf-8")
    return len(raw).to_bytes(8, "big") + raw


def _framed_digest(values: list[str], *, prefixed: bool = False) -> str:
    digest = hashlib.sha256(b"".join(_frame(value) for value in values)).hexdigest()
    return f"sha256:{digest}" if prefixed else digest


def _inspect_semantic_index(
    index: dict[str, Any],
    normalization: dict[str, Any],
    manifest: dict[str, Any],
    *,
    logical_manifest_bindings_required: bool,
) -> tuple[int, int, int, str]:
    logical = index.get("logicalArtifacts")
    binary = index.get("binaryResources")
    if not isinstance(logical, list) or not isinstance(binary, list):
        raise ContractError("semantic content index lacks its closed record arrays")
    logical_keys: list[tuple[str, str]] = []
    for record in logical:
        if not isinstance(record, dict):
            raise ContractError("semantic logical record is not an object")
        try:
            key = (str(record["role"]), str(record["logicalId"]))
            calculated = _framed_digest(
                [
                    str(normalization["semanticArtifactDigest"]["domain"]),
                    key[0],
                    key[1],
                    str(record["mediaType"]),
                    str(record["normalizedBytes"]),
                    str(record["normalizedSha256"]),
                ]
            )
        except (KeyError, TypeError) as error:
            raise ContractError("semantic logical record is incomplete") from error
        if record.get("recordSha256") != calculated:
            raise ContractError(f"semantic logical record digest differs: {key!r}")
        logical_keys.append(key)
    if len(logical_keys) != len(set(logical_keys)):
        raise ContractError("semantic content index has duplicate logical identities")

    binary_ids: list[str] = []
    binary_bytes = 0
    for record in binary:
        if not isinstance(record, dict):
            raise ContractError("semantic binary record is not an object")
        try:
            resource_id = str(record["resourceId"])
            size = int(record["bytes"])
            calculated = _framed_digest(
                [
                    str(normalization["binaryAssetDigest"]["domain"]),
                    resource_id,
                    str(record["canonicalReference"]),
                    str(record["mediaType"]),
                    str(size),
                    str(record["sha256"]),
                ]
            )
        except (KeyError, TypeError, ValueError) as error:
            raise ContractError("semantic binary record is incomplete") from error
        if size < 0 or record.get("recordSha256") != calculated:
            raise ContractError(f"semantic binary record digest differs: {resource_id!r}")
        binary_ids.append(resource_id)
        binary_bytes += size
    if len(binary_ids) != len(set(binary_ids)):
        raise ContractError("semantic content index has duplicate binary identities")

    logical_bindings: set[tuple[str, str]] = set()
    binary_bindings: dict[str, dict[str, Any]] = {}
    files = manifest.get("files")
    if not isinstance(files, list):
        raise ContractError("package manifest has no file inventory")
    for record in files:
        if not isinstance(record, dict):
            continue
        binding = record.get("semanticBinding")
        if not isinstance(binding, dict):
            continue
        if binding.get("kind") == "logical-artifact":
            logical_bindings.add((str(record.get("role")), str(binding.get("logicalId"))))
        elif binding.get("kind") == "binary-resource":
            resource_id = str(binding.get("resourceId"))
            if resource_id in binary_bindings:
                raise ContractError(f"manifest duplicates binary binding {resource_id!r}")
            binary_bindings[resource_id] = record
    if logical_manifest_bindings_required and set(logical_keys) != logical_bindings:
        raise ContractError("semantic logical identities differ from manifest bindings")
    if not logical_manifest_bindings_required and logical_bindings:
        raise ContractError("FWU package unexpectedly duplicates logical artifacts outside RDF")
    if set(binary_ids) != set(binary_bindings):
        raise ContractError("semantic binary identities differ from manifest bindings")
    for record in binary:
        manifest_record = binary_bindings[str(record["resourceId"])]
        expected_path = str(record["canonicalReference"])
        if expected_path.startswith("/"):
            expected_path = expected_path[1:]
        if not (
            manifest_record.get("path") == expected_path
            and manifest_record.get("bytes") == record.get("bytes")
            and manifest_record.get("sha256") == record.get("sha256")
            and manifest_record.get("mediaType") == record.get("mediaType")
        ):
            raise ContractError(
                f"semantic binary binding differs from manifest: {record['resourceId']!r}"
            )

    values = [str(normalization["contentDigest"]["domain"])]
    for key in ("normalizationProfile", "fieldSemanticsRegistry"):
        binding = index.get(key)
        if not isinstance(binding, dict):
            raise ContractError(f"semantic content index lacks {key}")
        values.extend(
            [str(binding.get("id")), str(binding.get("version")), str(binding.get("sha256"))]
        )
    values.append("semantic-artifact-records")
    for record in sorted(logical, key=lambda item: (item["role"], item["logicalId"])):
        values.append(str(record["recordSha256"]))
    values.append("binary-asset-records")
    for record in sorted(binary, key=lambda item: item["resourceId"]):
        values.append(str(record["recordSha256"]))
    content_digest = _framed_digest(values, prefixed=True)
    if index.get("contentDigest") != content_digest or manifest.get("contentDigest") != content_digest:
        raise ContractError("recomputed semantic content digest differs from package declarations")
    return len(logical), len(binary), binary_bytes, content_digest


def _inspect_package_archive(
    opened: SecureFile,
    *,
    variant: str,
    expected_outer_sha256: str,
) -> ArchiveSummary:
    schema_path = FWU_MANIFEST_SCHEMA_PATH if variant == "fwu-owl" else JSON_MANIFEST_SCHEMA_PATH
    try:
        with opened.duplicate() as handle, zipfile.ZipFile(handle, "r", allowZip64=False) as archive:
            infos = archive.infolist()
            if not infos or len(infos) > 60_000:
                raise ContractError("package ZIP has an empty or excessive central directory")
            names = [info.filename for info in infos]
            if names != sorted(names) or len(names) != len(set(names)):
                raise ContractError("package ZIP central directory is unsorted or duplicated")
            if len({info.header_offset for info in infos}) != len(infos):
                raise ContractError("package ZIP central directory aliases local headers")
            roots: set[str] = set()
            total_uncompressed = 0
            for info in infos:
                name = _safe_archive_relative_path(info.filename)
                if info.is_dir() or name.endswith("/") or info.flag_bits & 0x1:
                    raise ContractError("package ZIP contains a directory or encrypted member")
                if info.file_size < 0 or info.file_size > 3_500_000_000:
                    raise ContractError("package ZIP member exceeds its byte bound")
                total_uncompressed += info.file_size
                if total_uncompressed > 3_500_000_000:
                    raise ContractError("package ZIP exceeds its total uncompressed byte bound")
                parts = name.split("/", 1)
                if len(parts) != 2:
                    raise ContractError("package ZIP member is outside its archive root")
                roots.add(parts[0])
                unix_mode = info.external_attr >> 16
                if unix_mode and stat.S_ISLNK(unix_mode):
                    raise ContractError("package ZIP contains a symlink member")
            if len(roots) != 1:
                raise ContractError("package ZIP does not have exactly one archive root")
            archive_root = next(iter(roots))
            expected_suffix = ".fwu-owl" if variant == "fwu-owl" else ".json"
            if not archive_root.endswith(expected_suffix):
                raise ContractError(f"package archive root does not end in {expected_suffix}")
            manifest_name = f"{archive_root}/metadata/manifest.json"
            checksums_name = f"{archive_root}/metadata/SHA256SUMS"
            manifest_raw = _archive_member_bytes(archive, manifest_name)
            manifest = strict_json_loads(manifest_raw, f"{variant} package manifest")
            if not isinstance(manifest, dict):
                raise ContractError("package manifest is not an object")
            _schema_assert(manifest, schema_path, f"{variant} package manifest")
            if manifest.get("archiveRoot") != archive_root or manifest.get("variant") != variant:
                raise ContractError("package manifest archiveRoot/variant differs from central directory")
            manifest_sha = hashlib.sha256(manifest_raw).hexdigest()
            records = manifest.get("files")
            if not isinstance(records, list):
                raise ContractError("package manifest lacks its file records")
            record_paths = [record.get("path") for record in records if isinstance(record, dict)]
            if len(record_paths) != len(records) or record_paths != sorted(record_paths):
                raise ContractError("package manifest file inventory is incomplete or unsorted")
            if len(record_paths) != len(set(record_paths)):
                raise ContractError("package manifest file inventory is duplicated")
            expected_relative = {
                name.split("/", 1)[1]
                for name in names
                if name not in {manifest_name, checksums_name}
            }
            if set(record_paths) != expected_relative:
                raise ContractError("package manifest does not exactly cover central-directory members")

            checksums_raw = _archive_member_bytes(archive, checksums_name)
            checksums = _parse_checksum_inventory(checksums_raw)
            if set(checksums) != expected_relative | {"metadata/manifest.json"}:
                raise ContractError("SHA256SUMS does not exactly cover the package except itself")
            if checksums.get("metadata/manifest.json") != manifest_sha:
                raise ContractError("SHA256SUMS does not bind the package manifest")

            by_path = {
                str(record["path"]): record for record in records if isinstance(record, dict)
            }
            for relative in sorted(expected_relative):
                record = by_path[relative]
                member_name = f"{archive_root}/{relative}"
                info = archive.getinfo(member_name)
                digest = hashlib.sha256()
                total = 0
                with archive.open(info, "r") as source:
                    while chunk := source.read(READ_CHUNK_BYTES):
                        total += len(chunk)
                        digest.update(chunk)
                actual_sha = digest.hexdigest()
                if (
                    total != info.file_size
                    or record.get("bytes") != total
                    or record.get("sha256") != actual_sha
                    or checksums.get(relative) != actual_sha
                ):
                    raise ContractError(f"manifest/checksum/member bytes differ for {relative}")

            semantic_records = [record for record in records if record.get("role") == "semantic-content-index"]
            if len(semantic_records) != 1:
                raise ContractError("package has no unique semantic-content-index record")
            semantic_path = str(semantic_records[0]["path"])
            index_raw = _archive_member_bytes(archive, f"{archive_root}/{semantic_path}")
            index = strict_json_loads(index_raw, f"{variant} semantic content index")
            if not isinstance(index, dict):
                raise ContractError("semantic content index is not an object")
            _schema_assert(index, SEMANTIC_INDEX_SCHEMA_PATH, "semantic content index")

            bindings = manifest.get("contractBindings")
            if not isinstance(bindings, dict):
                raise ContractError("package manifest lacks contract bindings")
            normal_binding = bindings.get("semanticNormalForm")
            registry_binding = bindings.get("fieldSemanticsRegistry")
            if not isinstance(normal_binding, dict) or not isinstance(registry_binding, dict):
                raise ContractError("package manifest lacks semantic contract bindings")
            normal_raw = _archive_member_bytes(
                archive, f"{archive_root}/{_safe_archive_relative_path(normal_binding.get('path'))}"
            )
            registry_raw = _archive_member_bytes(
                archive, f"{archive_root}/{_safe_archive_relative_path(registry_binding.get('path'))}"
            )
            if (
                hashlib.sha256(normal_raw).hexdigest() != normal_binding.get("sha256")
                or hashlib.sha256(registry_raw).hexdigest() != registry_binding.get("sha256")
            ):
                raise ContractError("semantic contract bytes differ from manifest bindings")
            normalization = strict_json_loads(normal_raw, "embedded semantic normal form")
            registry_value = strict_json_loads(registry_raw, "embedded field registry")
            if not isinstance(normalization, dict) or not isinstance(registry_value, dict):
                raise ContractError("embedded semantic contracts are not objects")
            logical_count, binary_count, binary_bytes, content_digest = _inspect_semantic_index(
                index,
                normalization,
                manifest,
                logical_manifest_bindings_required=variant == "json",
            )
            expected_index_bindings = {
                "normalizationProfile": {
                    "id": normalization.get("profileId"),
                    "version": normalization.get("version"),
                    "sha256": normal_binding.get("sha256"),
                },
                "fieldSemanticsRegistry": {
                    "id": registry_value.get("registryId"),
                    "version": registry_value.get("version"),
                    "sha256": registry_binding.get("sha256"),
                },
            }
            if any(index.get(key) != value for key, value in expected_index_bindings.items()):
                raise ContractError("semantic index does not bind the embedded contracts")

            closure_digest: str | None = None
            definition_index_digest: str | None = None
            if variant == "json":
                closure_records = [record for record in records if record.get("role") == "dependency-closure"]
                if len(closure_records) != 1:
                    raise ContractError("JSON package has no unique dependency closure")
                closure_raw = _archive_member_bytes(
                    archive, f"{archive_root}/{closure_records[0]['path']}"
                )
                closure = strict_json_loads(closure_raw, "dependency closure")
                if not isinstance(closure, dict):
                    raise ContractError("dependency closure is not an object")
                closure_digest = closure.get("closureDigest")
                definition_index_digest = closure.get("definitionIndexDigest")
                if not all(
                    isinstance(value, str) and re.fullmatch(r"sha256:[a-f0-9]{64}", value)
                    for value in (closure_digest, definition_index_digest)
                ):
                    raise ContractError("dependency closure lacks its digest bindings")

            opened.assert_unchanged()
            return ArchiveSummary(
                outer_bytes=opened.identity[3],
                outer_sha256=expected_outer_sha256,
                archive_root=archive_root,
                manifest_sha256=manifest_sha,
                content_digest=content_digest,
                release_id=str(manifest.get("releaseId")),
                package_id=str(manifest.get("packageId")),
                package_version=str(manifest.get("packageVersion")),
                counts={
                    "zipEntries": len(infos),
                    "manifestFiles": len(records),
                    "checksumRows": len(checksums),
                    "logicalArtifacts": logical_count,
                    "binaryResources": binary_count,
                    "binaryBytes": binary_bytes,
                },
                closure_digest=closure_digest,
                definition_index_digest=definition_index_digest,
                registry={
                    "id": registry_value.get("registryId"),
                    "version": registry_value.get("version"),
                    "sha256": hashlib.sha256(registry_raw).hexdigest(),
                    "entryCount": len(registry_value.get("entries", []))
                    if isinstance(registry_value.get("entries"), list)
                    else -1,
                },
            )
    except (zipfile.BadZipFile, zipfile.LargeZipFile, OSError, RuntimeError) as error:
        raise ContractError(f"cannot inspect {variant} package ZIP: {error}") from error


def _assert_fwu_receipt(
    value: Any,
    compact: dict[str, Any],
    fwu_binding: dict[str, Any],
    summary: ArchiveSummary,
) -> None:
    _schema_assert(value, FWU_RECEIPT_SCHEMA_PATH, "DPK-008c receipt")
    if not isinstance(value, dict):
        raise ContractError("DPK-008c receipt is not an object")
    gates = value.get("gates")
    if (
        value.get("validatorId") != "skillpilot-fwu-owl-package-validator-v1"
        or value.get("reportFormatVersion") != 1
        or value.get("status") != "valid"
        or value.get("diagnostics") != []
        or value.get("diagnosticsTruncated") is not False
        or not isinstance(gates, list)
        or [gate.get("id") for gate in gates if isinstance(gate, dict)] != EXPECTED_GATE_IDS
        or any(not isinstance(gate, dict) or gate.get("status") != "passed" for gate in gates)
    ):
        raise ContractError("DPK-008c receipt is not an exact clean 18-gate success")
    receipt_input = object_at(value, "input")
    package = object_at(value, "package")
    counts = object_at(value, "counts")
    expected_input = {
        "bytes": summary.outer_bytes,
        "sha256": summary.outer_sha256,
        "manifestSha256": summary.manifest_sha256,
    }
    if any(receipt_input.get(key) != expected for key, expected in expected_input.items()):
        raise ContractError("DPK-008c receipt input differs from the securely opened FWU ZIP")
    if Path(str(receipt_input.get("file"))).name != Path(str(fwu_binding.get("path"))).name:
        raise ContractError("DPK-008c receipt filename differs from the FWU ZIP binding")
    if not (
        package.get("archiveRoot") == summary.archive_root
        and package.get("manifestSha256") == summary.manifest_sha256
        and package.get("contentDigest") == summary.content_digest
        and package.get("releaseId") == summary.release_id
        and package.get("packageId") == summary.package_id
        and package.get("packageVersion") == summary.package_version
    ):
        raise ContractError("DPK-008c receipt package summary differs from FWU manifest/SCI")
    expected_counts = {
        "zipEntries": summary.counts["zipEntries"],
        "manifestFiles": summary.counts["manifestFiles"],
        "logicalArtifacts": summary.counts["logicalArtifacts"],
        "binaryResources": summary.counts["binaryResources"],
        "binaryBytes": summary.counts["binaryBytes"],
    }
    if any(counts.get(key) != expected for key, expected in expected_counts.items()):
        raise ContractError("DPK-008c receipt counts differ from FWU central directory/manifest/SCI")
    expected_compact = {
        "validatorId": value.get("validatorId"),
        "reportFormatVersion": value.get("reportFormatVersion"),
        "status": value.get("status"),
        "packageZipSha256": summary.outer_sha256,
        "manifestSha256": summary.manifest_sha256,
        "gates": [{"id": gate_id, "status": "passed"} for gate_id in EXPECTED_GATE_IDS],
    }
    if any(compact.get(key) != expected for key, expected in expected_compact.items()):
        raise ContractError("outer reverse report does not exactly project the DPK-008c receipt")


def _assert_full_receipt(
    value: Any,
    compact: dict[str, Any],
    summary: ArchiveSummary,
) -> None:
    _schema_assert(value, FULL_RECEIPT_SCHEMA_PATH, "full standalone validator-v2 receipt")
    if not isinstance(value, dict):
        raise ContractError("full standalone receipt is not an object")
    gates = value.get("gates")
    if (
        value.get("validatorId") != "skillpilot-full-standalone-package-validator-v2"
        or value.get("reportFormatVersion") != 2
        or value.get("status") != "valid"
        or value.get("diagnostics") != []
        or value.get("diagnosticsTruncated") is not False
        or not isinstance(gates, dict)
        or tuple(sorted(gates)) != EXPECTED_FULL_GATE_IDS
        or any(
            not isinstance(gate, dict)
            or gate.get("status") != "passed"
            or gate.get("diagnosticCount") != 0
            or gate.get("diagnosticCodes") != []
            for gate in gates.values()
        )
    ):
        raise ContractError("full standalone receipt is not an exact clean six-gate success")
    receipt_input = object_at(value, "input")
    package = object_at(value, "package")
    counts = object_at(value, "counts")
    if not (
        receipt_input.get("bytes") == summary.outer_bytes
        and receipt_input.get("sha256") == summary.outer_sha256
        and package.get("archiveRoot") == summary.archive_root
        and package.get("releaseId") == summary.release_id
        and package.get("packageId") == summary.package_id
        and package.get("packageVersion") == summary.package_version
        and package.get("contentDigest") == summary.content_digest
        and package.get("manifestSha256") == summary.manifest_sha256
        and package.get("closureDigest") == summary.closure_digest
        and package.get("definitionIndexDigest") == summary.definition_index_digest
    ):
        raise ContractError("full standalone receipt input/package differs from reconstructed ZIP")
    expected_counts = {
        "archiveEntries": summary.counts["zipEntries"],
        "manifestFiles": summary.counts["manifestFiles"],
        "logicalArtifacts": summary.counts["logicalArtifacts"],
        "binaryResources": summary.counts["binaryResources"],
    }
    if counts != expected_counts:
        raise ContractError("full standalone receipt counts differ from reconstructed ZIP")
    expected_compact = {
        "validatorId": value.get("validatorId"),
        "status": value.get("status"),
        "errorCount": 0,
        "packageZipSha256": summary.outer_sha256,
        "manifestSha256": summary.manifest_sha256,
    }
    if any(compact.get(key) != expected for key, expected in expected_compact.items()):
        raise ContractError("outer reverse report does not exactly project validator-v2 receipt")


def _assert_compiler_report(
    value: Any,
    report: dict[str, Any],
    fwu: ArchiveSummary,
    output: ArchiveSummary,
) -> None:
    if not isinstance(value, dict) or set(value) != {
        "normalizedOracle",
        "output",
        "registry",
        "reverseCompilerId",
        "reverseCompilerVersion",
        "sourceFwuOwl",
        "status",
    }:
        raise ContractError("reverse compiler report is not a closed v1 object")
    compiler = object_at(report, "compiler")
    if not (
        value.get("reverseCompilerId") == compiler.get("id")
        and value.get("reverseCompilerVersion") == compiler.get("version")
        and value.get("status") == "passed"
    ):
        raise ContractError("reverse compiler report identity/status differs")
    expected_source = {
        "bytes": fwu.outer_bytes,
        "sha256": fwu.outer_sha256,
        "manifestSha256": fwu.manifest_sha256,
        "releaseId": fwu.release_id,
        "contentDigest": fwu.content_digest,
    }
    if value.get("sourceFwuOwl") != expected_source or value.get("registry") != fwu.registry:
        raise ContractError("reverse compiler report source/registry binding differs")
    core_output = object_at(value, "output")
    expected_output = {
        "archiveRoot": output.archive_root,
        "bytes": output.outer_bytes,
        "sha256": output.outer_sha256,
        "manifestSha256": output.manifest_sha256,
        "contentDigest": output.content_digest,
        "counts": output.counts,
    }
    if any(core_output.get(key) != expected for key, expected in expected_output.items()):
        raise ContractError("reverse compiler report output differs from reconstructed ZIP")
    output_path = core_output.get("path")
    if not isinstance(output_path, str) or Path(output_path).name != Path(
        str(object_at(object_at(object_at(report, "runs"), "runA"), "output").get("path"))
    ).name:
        # Run B has the same output filename; only the isolated absolute prefix differs.
        raise ContractError("reverse compiler report output path does not name the reconstructed ZIP")
    oracle = value.get("normalizedOracle")
    expected_oracle = {
        "status": "passed",
        "expectedCount": output.counts["logicalArtifacts"],
        "verifiedCount": output.counts["logicalArtifacts"],
        "mismatchCount": 0,
    }
    if oracle != expected_oracle:
        raise ContractError("reverse compiler normalized oracle is not an exact complete success")


def _trace_mentions_path(line: str, path: str) -> bool:
    return re.search(r'"' + re.escape(path) + r'(?:/|")', line) is not None


def _trace_audit(raw: bytes, forbidden_paths: tuple[str, ...]) -> tuple[int, int, str]:
    try:
        text = raw.decode("utf-8", "strict")
    except UnicodeError as error:
        raise ContractError(f"bound strace output is not UTF-8: {error}") from error
    network_attempts = sum(
        1 for line in text.splitlines() if NETWORK_SYSCALL_RE.search(line)
    )
    forbidden_reads = 0
    pending_forbidden: set[int] = set()
    for line in text.splitlines():
        pid_match = re.match(r"^(?:\[pid\s+)?([0-9]+)\]?\s+", line)
        pid = int(pid_match.group(1)) if pid_match is not None else None
        if "<... " in line and " resumed>" in line:
            if pid is not None and pid in pending_forbidden:
                pending_forbidden.remove(pid)
                if "= -1 ENOENT" not in line and "= -1 ENOTDIR" not in line:
                    forbidden_reads += 1
            continue
        mentions_forbidden = any(
            _trace_mentions_path(line, path) for path in forbidden_paths
        )
        if not mentions_forbidden:
            continue
        if "execve(" in line:
            continue
        if "<unfinished ...>" in line:
            if pid is None:
                forbidden_reads += 1
            else:
                if pid in pending_forbidden:
                    forbidden_reads += 1
                pending_forbidden.add(pid)
            continue
        if "= -1 ENOENT" not in line and "= -1 ENOTDIR" not in line:
            forbidden_reads += 1
    forbidden_reads += len(pending_forbidden)
    return network_attempts, forbidden_reads, text


def _assert_trace_evidence(
    raw: bytes,
    binding: dict[str, Any],
    forbidden_paths: tuple[str, ...],
) -> str:
    network_attempts, forbidden_reads, text = _trace_audit(raw, forbidden_paths)
    if (
        binding.get("networkAttemptCount") != network_attempts
        or binding.get("forbiddenReadCount") != forbidden_reads
        or network_attempts != 0
        or forbidden_reads != 0
    ):
        raise ContractError(
            "outer trace counts differ from independently parsed trace bytes"
        )
    return text


def _derive_filtered_trace(raw: bytes) -> tuple[bytes, list[dict[str, Any]]]:
    if not raw or not raw.endswith(b"\n"):
        raise ContractError("host raw trace is not canonical LF-terminated text")
    try:
        text = raw.decode("utf-8", "strict")
    except UnicodeError as error:
        raise ContractError(f"host raw trace is not UTF-8: {error}") from error
    active: set[int] = set()
    parents: dict[int, int | None] = {}
    process_records: dict[int, dict[str, Any]] = {}
    selected: list[bytes] = []
    for line_text in text.splitlines():
        line = line_text.encode("utf-8")
        match = TRACE_PID_RE.match(line)
        if match is None:
            continue
        pid = int(match.group(1))
        entry_exec = SANDBOX_ENTRY_EXEC_PREFIX in line
        core_exec = SANDBOX_CORE_EXEC_PREFIX in line
        if entry_exec:
            active.add(pid)
            parents.setdefault(pid, None)
            process_records[pid] = {
                "tracePid": pid,
                "parentTracePid": parents[pid],
                "role": "entry",
                "execveLineSha256": hashlib.sha256(line).hexdigest(),
            }
        if core_exec and pid not in active:
            entry_records = [
                record
                for record in process_records.values()
                if record.get("role") == "entry"
            ]
            if len(entry_records) != 1:
                raise ContractError(
                    "host raw trace Core exec cannot be bound to one Entry process"
                )
            entry_pid = int(entry_records[0]["tracePid"])
            active.add(pid)
            parents[pid] = entry_pid
        if pid not in active:
            continue
        selected.append(line)
        child_match = TRACE_PROCESS_EDGE_RE.search(line)
        if child_match is not None:
            child = int(child_match.group(1))
            active.add(child)
            parents[child] = pid
        if core_exec:
            process_records[pid] = {
                "tracePid": pid,
                "parentTracePid": parents.get(pid),
                "role": "core",
                "execveLineSha256": hashlib.sha256(line).hexdigest(),
            }
    roles = [record["role"] for record in process_records.values()]
    if roles.count("entry") != 1 or roles.count("core") != 1 or not selected:
        raise ContractError("host raw trace did not recover exactly one sandbox Entry/Core tree")
    return b"\n".join(selected) + b"\n", sorted(
        process_records.values(), key=lambda item: item["tracePid"]
    )


def _assert_trace_process_tree(
    raw_trace: bytes,
    filtered_trace: bytes,
    value: Any,
) -> str:
    if not isinstance(value, dict) or set(value) != {
        "manifestId",
        "formatVersion",
        "sourceTrace",
        "entrypoint",
        "processes",
        "filteredTrace",
    }:
        raise ContractError("trace process-tree manifest is not a closed v1 object")
    derived_filtered, processes = _derive_filtered_trace(raw_trace)
    expected = {
        "manifestId": "skillpilot-sandbox-trace-process-tree-v1",
        "formatVersion": 1,
        "sourceTrace": {
            "bytes": len(raw_trace),
            "sha256": hashlib.sha256(raw_trace).hexdigest(),
        },
        "entrypoint": {
            "executable": "/opt/tools/python3",
            "script": "/opt/reverse-runner/sandbox-entry.py",
        },
        "processes": processes,
        "filteredTrace": {
            "bytes": len(derived_filtered),
            "sha256": hashlib.sha256(derived_filtered).hexdigest(),
            "lineCount": len(derived_filtered.splitlines()),
        },
    }
    if value != expected:
        raise ContractError("trace process-tree manifest differs from independently derived raw trace")
    if filtered_trace != derived_filtered:
        raise ContractError("bound filtered trace differs from independently filtered host raw trace")
    try:
        return derived_filtered.decode("utf-8", "strict")
    except UnicodeError as error:
        raise ContractError(f"filtered entry/core trace is not UTF-8: {error}") from error


def _expected_masked_paths(fwu_receipt: dict[str, Any]) -> tuple[str, ...]:
    try:
        source_name = fwu_receipt["package"]["sourceJsonPackage"]["file"]
    except (KeyError, TypeError) as error:
        raise ContractError("DPK-008c receipt lacks source JSON filename") from error
    if (
        not isinstance(source_name, str)
        or not source_name.endswith(".json.zip")
        or Path(source_name).name != source_name
    ):
        raise ContractError("DPK-008c source JSON filename is unsafe")
    return (
        str(REPO_ROOT / ".git"),
        str(REPO_ROOT / "curricula"),
        str(REPO_ROOT / "app/scripts/buildFwuOwlCurriculumPackage.ts"),
        str(REPO_ROOT / "tmp/lehrplan-ontologie"),
        str(
            REPO_ROOT
            / "tmp/curriculum-release-model/full-standalone-package"
            / source_name
        ),
    )


def _assert_isolation_probe(
    value: Any,
    *,
    expected_masked_paths: tuple[str, ...],
    python_runtime: dict[str, Any],
    runtime_manifest: dict[str, Any],
) -> None:
    if not isinstance(value, dict) or set(value) != {
        "schemaVersion",
        "status",
        "compilerExitCode",
        "checks",
        "diagnostic",
    }:
        raise ContractError("isolation probe is not a closed v1 object")
    if not (
        value.get("schemaVersion") == "skillpilot.fwu-owl-reverse-isolation-probe.v1"
        and value.get("status") == "passed"
        and value.get("compilerExitCode") == 0
        and value.get("diagnostic") is None
    ):
        raise ContractError("isolation probe did not report a clean compiler success")
    checks = value.get("checks")
    if not isinstance(checks, dict):
        raise ContractError("isolation probe lacks namespace checks")
    required_true = (
        "compilerReadOnly",
        "fwuOwlReadOnly",
        "validationReportReadOnly",
        "outputTargetAbsent",
        "outputWritable",
        "networkNamespaceIsolated",
        "pythonIsolated",
        "pythonNoSite",
    )
    if any(checks.get(key) is not True for key in required_true):
        raise ContractError("isolation probe lacks a required positive closed-input claim")
    if checks.get("originalJsonProvided") is not False:
        raise ContractError("isolation probe observed an original JSON package")
    if checks.get("inputNames") != list(EXPECTED_SANDBOX_INPUT_NAMES):
        raise ContractError("isolation probe input directory is not closed")
    if (
        checks.get("temporaryNames") != []
        or checks.get("optNames") != list(EXPECTED_SANDBOX_OPT_NAMES)
        or checks.get("pythonExecutable") != "/opt/tools/python3"
        or checks.get("traceFdClosed") is not True
    ):
        raise ContractError("isolation probe temporary root/Python claim differs")
    closed_descriptors = checks.get("closedInheritedDescriptors")
    if (
        not isinstance(closed_descriptors, list)
        or not closed_descriptors
        or closed_descriptors != sorted(closed_descriptors)
        or len(closed_descriptors) != len(set(closed_descriptors))
        or any(not isinstance(item, int) or item <= 2 for item in closed_descriptors)
    ):
        raise ContractError("isolation probe does not bind closed inherited descriptors")
    root_entries = checks.get("rootEntries")
    symlinks = runtime_manifest.get("symlinks")
    if not isinstance(symlinks, list):
        raise ContractError("runtime closure lacks namespace symlinks for probe binding")
    expected_root_entries = sorted(
        {"dev", "opt", "proc", "tmp", "usr"}
        | {
            Path(str(item.get("path"))).name
            for item in symlinks
            if isinstance(item, dict)
        }
    )
    if (
        not isinstance(root_entries, list)
        or root_entries != expected_root_entries
    ):
        raise ContractError("isolation probe does not describe the minimal namespace root")
    expected_host_records = [
        {"path": path, "accessible": False} for path in HOST_ROOT_SENTINELS
    ]
    expected_masked_records = [
        {"path": path, "accessible": False} for path in expected_masked_paths
    ]
    if checks.get("hostRootSentinels") != expected_host_records:
        raise ContractError("isolation probe host-root sentinel set differs")
    if not expected_masked_records or checks.get("maskedPaths") != expected_masked_records:
        raise ContractError("isolation probe masked-path set differs or is empty")
    mounted_roots = python_runtime.get("mountedRoots")
    mounts = runtime_manifest.get("mounts")
    if (
        not isinstance(mounted_roots, list)
        or not isinstance(mounts, list)
        or [item.get("target") for item in mounts if isinstance(item, dict)]
        != mounted_roots
    ):
        raise ContractError("isolation probe/runtime roots are not cross-bound")


def _assert_output_tree_manifest(
    value: Any,
    output: ArchiveSummary,
    output_path: str,
    run_name: str,
) -> None:
    run_directory = {"runA": "run-a", "runB": "run-b"}.get(run_name)
    path_parts = Path(output_path).parts
    if (
        run_directory is None
        or len(path_parts) < 3
        or path_parts[-3] != run_directory
        or path_parts[-2] != "package"
    ):
        raise ContractError("output ZIP path does not match the closed runner layout")
    relative_output_path = Path(*path_parts[-2:]).as_posix()
    expected_file = {
        "path": relative_output_path,
        "bytes": output.outer_bytes,
        "sha256": output.outer_sha256,
    }
    digest = hashlib.sha256()
    digest.update(expected_file["path"].encode("utf-8"))
    digest.update(b"\0")
    digest.update(str(expected_file["bytes"]).encode("ascii"))
    digest.update(b"\0")
    digest.update(expected_file["sha256"].encode("ascii"))
    digest.update(b"\n")
    expected = {
        "formatVersion": 1,
        "bytes": output.outer_bytes,
        "sha256": digest.hexdigest(),
        "files": [expected_file],
    }
    if value != expected:
        raise ContractError("output-tree manifest does not exactly bind the single output ZIP")


def _elf_layout(opened: SecureFile) -> tuple[str, int, int, int, int]:
    header = os.pread(opened.descriptor, 64, 0)
    if len(header) < 52 or header[:4] != b"\x7fELF":
        raise ContractError(f"runtime executable is not ELF: {opened.label}")
    elf_class = header[4]
    data = header[5]
    if elf_class not in {1, 2} or data not in {1, 2}:
        raise ContractError(f"runtime ELF class/endianness is unsupported: {opened.label}")
    byteorder = "little" if data == 1 else "big"
    if elf_class == 2:
        phoff = int.from_bytes(header[32:40], byteorder)
        phentsize = int.from_bytes(header[54:56], byteorder)
        phnum = int.from_bytes(header[56:58], byteorder)
        minimum = 56
    else:
        phoff = int.from_bytes(header[28:32], byteorder)
        phentsize = int.from_bytes(header[42:44], byteorder)
        phnum = int.from_bytes(header[44:46], byteorder)
        minimum = 32
    if phentsize < minimum or phnum < 1 or phnum > 4096:
        raise ContractError(f"runtime ELF program-header table is malformed: {opened.label}")
    if phoff + phentsize * phnum > opened.identity[3]:
        raise ContractError(f"runtime ELF program-header table is out of bounds: {opened.label}")
    return byteorder, elf_class, phoff, phentsize, phnum


def _elf_program_headers(opened: SecureFile) -> list[dict[str, int]]:
    byteorder, elf_class, phoff, phentsize, phnum = _elf_layout(opened)
    result: list[dict[str, int]] = []
    for index in range(phnum):
        raw = os.pread(opened.descriptor, phentsize, phoff + index * phentsize)
        if len(raw) != phentsize:
            raise ContractError(f"short ELF program-header read: {opened.label}")
        if elf_class == 2:
            result.append(
                {
                    "type": int.from_bytes(raw[0:4], byteorder),
                    "offset": int.from_bytes(raw[8:16], byteorder),
                    "vaddr": int.from_bytes(raw[16:24], byteorder),
                    "filesz": int.from_bytes(raw[32:40], byteorder),
                    "memsz": int.from_bytes(raw[40:48], byteorder),
                }
            )
        else:
            result.append(
                {
                    "type": int.from_bytes(raw[0:4], byteorder),
                    "offset": int.from_bytes(raw[4:8], byteorder),
                    "vaddr": int.from_bytes(raw[8:12], byteorder),
                    "filesz": int.from_bytes(raw[16:20], byteorder),
                    "memsz": int.from_bytes(raw[20:24], byteorder),
                }
            )
    return result


def _elf_interpreter(opened: SecureFile) -> str:
    interpreters = [header for header in _elf_program_headers(opened) if header["type"] == 3]
    if len(interpreters) != 1:
        raise ContractError(f"runtime ELF does not have exactly one PT_INTERP: {opened.label}")
    header = interpreters[0]
    size = header["filesz"]
    if size < 2 or size > 4096 or header["offset"] + size > opened.identity[3]:
        raise ContractError(f"runtime ELF PT_INTERP is out of bounds: {opened.label}")
    raw = os.pread(opened.descriptor, size, header["offset"])
    if len(raw) != size or not raw.endswith(b"\0") or b"\0" in raw[:-1]:
        raise ContractError(f"runtime ELF PT_INTERP is malformed: {opened.label}")
    try:
        path = raw[:-1].decode("utf-8", "strict")
    except UnicodeError as error:
        raise ContractError(f"runtime ELF PT_INTERP is not UTF-8: {opened.label}") from error
    _safe_path_parts(path, absolute_allowed=True)
    try:
        return str(Path(path).resolve(strict=True))
    except OSError as error:
        raise ContractError(f"runtime ELF PT_INTERP target is unavailable: {path}") from error


def _elf_dynamic_names(opened: SecureFile) -> tuple[tuple[str, ...], str | None]:
    byteorder, elf_class, _, _, _ = _elf_layout(opened)
    headers = _elf_program_headers(opened)
    dynamic = [header for header in headers if header["type"] == 2]
    loads = [header for header in headers if header["type"] == 1]
    if not dynamic:
        return (), None
    if len(dynamic) != 1:
        raise ContractError(f"runtime ELF has multiple PT_DYNAMIC segments: {opened.label}")
    entry_size = 16 if elf_class == 2 else 8
    segment = dynamic[0]
    if segment["filesz"] % entry_size or segment["offset"] + segment["filesz"] > opened.identity[3]:
        raise ContractError(f"runtime ELF PT_DYNAMIC is malformed: {opened.label}")
    raw = os.pread(opened.descriptor, segment["filesz"], segment["offset"])
    needed_offsets: list[int] = []
    soname_offset: int | None = None
    string_vaddr: int | None = None
    string_size: int | None = None
    word = 8 if elf_class == 2 else 4
    for offset in range(0, len(raw), entry_size):
        tag = int.from_bytes(raw[offset : offset + word], byteorder, signed=True)
        value = int.from_bytes(raw[offset + word : offset + 2 * word], byteorder)
        if tag == 0:
            break
        if tag == 1:
            needed_offsets.append(value)
        elif tag == 14:
            soname_offset = value
        elif tag == 5:
            string_vaddr = value
        elif tag == 10:
            string_size = value
    if string_vaddr is None or string_size is None or string_size < 1 or string_size > 64_000_000:
        raise ContractError(f"runtime ELF lacks a bounded dynamic string table: {opened.label}")
    candidates = [
        header
        for header in loads
        if header["vaddr"] <= string_vaddr < header["vaddr"] + header["memsz"]
    ]
    if len(candidates) != 1:
        raise ContractError(f"runtime ELF dynamic string table has no unique PT_LOAD: {opened.label}")
    load = candidates[0]
    string_offset = load["offset"] + string_vaddr - load["vaddr"]
    if string_offset + string_size > opened.identity[3]:
        raise ContractError(f"runtime ELF dynamic string table is out of bounds: {opened.label}")
    strings = os.pread(opened.descriptor, string_size, string_offset)
    names: list[str] = []
    decoded: dict[int, str] = {}
    for offset in [*needed_offsets, *([] if soname_offset is None else [soname_offset])]:
        if offset >= len(strings):
            raise ContractError(f"runtime ELF DT_NEEDED offset is out of bounds: {opened.label}")
        end = strings.find(b"\0", offset)
        if end < 0:
            raise ContractError(f"runtime ELF DT_NEEDED is unterminated: {opened.label}")
        try:
            name = strings[offset:end].decode("utf-8", "strict")
        except UnicodeError as error:
            raise ContractError(f"runtime ELF DT_NEEDED is not UTF-8: {opened.label}") from error
        if not name or "/" in name or "\\" in name:
            raise ContractError(f"runtime ELF DT_NEEDED name is unsafe: {opened.label}")
        decoded[offset] = name
    names.extend(decoded[offset] for offset in needed_offsets)
    return tuple(names), decoded.get(soname_offset) if soname_offset is not None else None


def _assert_absolute_file_binding_path(binding: dict[str, Any], label: str) -> None:
    raw_path = binding.get("path")
    absolute, parts = _safe_path_parts(raw_path, absolute_allowed=True)
    if not absolute or str(raw_path).endswith("/") or any(part in {".", ".."} for part in parts):
        raise ContractError(f"{label} path is not canonical absolute")


def _assert_runtime_closure_manifest(
    value: Any,
    python_runtime: dict[str, Any],
    trace_tool: dict[str, Any],
    report_file: SecureFile,
    trace_text: str,
) -> None:
    if not isinstance(value, dict) or set(value) != {
        "manifestId",
        "formatVersion",
        "python",
        "pythonElfInterpreter",
        "traceToolRuntime",
        "mounts",
        "symlinks",
        "files",
    }:
        raise ContractError("runtime-closure manifest is not a closed v1 object")
    if (
        value.get("manifestId") != "skillpilot-sandbox-python-runtime-closure-v1"
        or value.get("formatVersion") != 1
    ):
        raise ContractError("runtime-closure manifest identity/version differs")
    early_mounts = value.get("mounts")
    if not isinstance(early_mounts, list) or any(
        not isinstance(item, dict) or item.get("source") != item.get("target")
        for item in early_mounts
    ):
        raise ContractError("runtime-closure mount source must equal its sandbox target")
    python = value.get("python")
    executable = object_at(python_runtime, "executable")
    if not isinstance(python, dict) or python != {
        "path": executable.get("path"),
        "bytes": executable.get("bytes"),
        "sha256": executable.get("sha256"),
        "version": python_runtime.get("version"),
    }:
        raise ContractError("runtime-closure Python binding differs from outer report")
    python_interpreter = value.get("pythonElfInterpreter")
    trace_runtime = value.get("traceToolRuntime")
    if not isinstance(python_interpreter, dict) or not isinstance(trace_runtime, dict):
        raise ContractError("runtime closure lacks ELF interpreter/tool runtime bindings")
    if set(trace_runtime) != {"executable", "elfInterpreter", "libraries"}:
        raise ContractError("trace-tool runtime is not a closed binding object")
    if trace_runtime.get("executable") != trace_tool:
        raise ContractError("trace-tool runtime executable differs from outer trace tool")
    trace_interpreter = trace_runtime.get("elfInterpreter")
    libraries = trace_runtime.get("libraries")
    if not isinstance(trace_interpreter, dict) or not isinstance(libraries, list) or not libraries:
        raise ContractError("trace-tool runtime lacks interpreter or libraries")
    runtime_bindings = [python_interpreter, trace_interpreter, *libraries]
    for index, binding in enumerate(runtime_bindings):
        if not isinstance(binding, dict) or set(binding) != {"path", "bytes", "sha256"}:
            raise ContractError("ELF runtime file binding is malformed")
        _assert_absolute_file_binding_path(binding, f"ELF runtime binding {index}")
    library_paths = [str(binding["path"]) for binding in libraries]
    if library_paths != sorted(library_paths) or len(library_paths) != len(set(library_paths)):
        raise ContractError("trace-tool runtime libraries are duplicated or unsorted")

    python_executable_opened = _open_and_verify_binding(
        "runtimeClosure/python",
        executable,
        report_file,
        absolute_allowed=True,
    )
    python_interpreter_opened = _open_and_verify_binding(
        "runtimeClosure/pythonElfInterpreter",
        python_interpreter,
        report_file,
        absolute_allowed=True,
    )
    trace_executable_opened = _open_and_verify_binding(
        "runtimeClosure/traceToolRuntime/executable",
        trace_tool,
        report_file,
        absolute_allowed=True,
    )
    trace_interpreter_opened = _open_and_verify_binding(
        "runtimeClosure/traceToolRuntime/elfInterpreter",
        trace_interpreter,
        report_file,
        absolute_allowed=True,
    )
    library_opened: list[SecureFile] = []
    try:
        if _elf_interpreter(python_executable_opened) != python_interpreter.get("path"):
            raise ContractError("Python PT_INTERP differs from runtime-closure binding")
        if _elf_interpreter(trace_executable_opened) != trace_interpreter.get("path"):
            raise ContractError("strace PT_INTERP differs from runtime-closure binding")
        python_interpreter_opened.assert_unchanged()
        trace_interpreter_opened.assert_unchanged()
        for index, binding in enumerate(libraries):
            library_opened.append(
                _open_and_verify_binding(
                    f"runtimeClosure/traceToolRuntime/libraries/{index}",
                    binding,
                    report_file,
                    absolute_allowed=True,
                )
            )
        by_name: dict[str, SecureFile] = {}
        for opened in library_opened:
            _, soname = _elf_dynamic_names(opened)
            name = soname or Path(opened.raw_path).name
            if name in by_name:
                raise ContractError(f"trace-tool runtime duplicates library SONAME {name}")
            by_name[name] = opened
        _, interpreter_soname = _elf_dynamic_names(trace_interpreter_opened)
        interpreter_name = interpreter_soname or Path(
            trace_interpreter_opened.raw_path
        ).name
        if interpreter_name in by_name:
            raise ContractError("trace-tool ELF interpreter is duplicated in libraries")
        pending = [trace_executable_opened]
        reached: set[str] = set()
        while pending:
            current = pending.pop()
            needed_names, _ = _elf_dynamic_names(current)
            for needed in needed_names:
                if needed == interpreter_name:
                    continue
                dependency = by_name.get(needed)
                if dependency is None:
                    raise ContractError(f"trace-tool runtime omits DT_NEEDED library {needed}")
                if needed not in reached:
                    reached.add(needed)
                    pending.append(dependency)
        if reached != set(by_name):
            raise ContractError("trace-tool runtime contains a library outside DT_NEEDED closure")
    finally:
        for opened in reversed(library_opened):
            opened.close()
        trace_interpreter_opened.close()
        trace_executable_opened.close()
        python_interpreter_opened.close()
        python_executable_opened.close()
    mounts = value.get("mounts")
    if not isinstance(mounts, list) or mounts != sorted(mounts, key=lambda item: item.get("target", "")):
        raise ContractError("runtime-closure mounts are not target-sorted")
    if any(
        not isinstance(item, dict)
        or set(item) != {"source", "target", "readOnly"}
        or not isinstance(item.get("source"), str)
        or not isinstance(item.get("target"), str)
        or item.get("source") != item.get("target")
        or item.get("readOnly") is not True
        for item in mounts
    ):
        raise ContractError("runtime-closure mounts are malformed or writable")
    mounted_roots = python_runtime.get("mountedRoots")
    if not isinstance(mounted_roots, list) or [item["target"] for item in mounts] != mounted_roots:
        raise ContractError("runtime-closure mount targets differ from outer report")
    for root in mounted_roots:
        if (
            not isinstance(root, str)
            or not root.startswith("/")
            or root.endswith("/")
            or any(part in {"", ".", ".."} for part in root.split("/")[1:])
            or root in {"/usr", "/lib", "/lib64"}
            or not (root.startswith("/usr/lib/") or root == "/usr/lib64")
        ):
            raise ContractError("runtime-closure has a non-canonical or broad mount root")
    for index, root in enumerate(mounted_roots):
        if any(
            root == other or root.startswith(other.rstrip("/") + "/")
            for other in mounted_roots[:index]
        ):
            raise ContractError("runtime-closure mount roots overlap or duplicate")
    symlinks = value.get("symlinks")
    if (
        not isinstance(symlinks, list)
        or symlinks != sorted(symlinks, key=lambda item: item.get("path", ""))
        or any(
            not isinstance(item, dict)
            or set(item) != {"path", "target"}
            or not isinstance(item.get("path"), str)
            or not isinstance(item.get("target"), str)
            for item in symlinks
        )
    ):
        raise ContractError("runtime-closure namespace symlinks are malformed or unsorted")
    expected_symlinks = [{"path": "/lib", "target": "usr/lib"}]
    if "/usr/lib64" in mounted_roots:
        expected_symlinks.append({"path": "/lib64", "target": "usr/lib64"})
    if symlinks != expected_symlinks:
        raise ContractError("runtime-closure namespace symlinks differ from mounted roots")
    files = value.get("files")
    if (
        not isinstance(files, list)
        or not files
        or files != sorted(files, key=lambda item: item.get("path", ""))
        or len({item.get("path") for item in files if isinstance(item, dict)}) != len(files)
    ):
        raise ContractError("runtime-closure files are empty, duplicated, or unsorted")
    traced_paths: set[str] = set()
    pending_paths: dict[int, str] = {}
    for line in trace_text.splitlines():
        match = SUCCESSFUL_OPEN_RE.search(line)
        if match is not None:
            traced_paths.add(match.group(1))
            continue
        pid_match = re.match(r"^(?:\[pid\s+)?([0-9]+)\]?\s+", line)
        pid = int(pid_match.group(1)) if pid_match is not None else -1
        call_match = OPEN_CALL_PATH_RE.search(line)
        if call_match is not None and "<unfinished ...>" in line:
            pending_paths[pid] = call_match.group(1)
            continue
        if pid in pending_paths and "<... " in line and " resumed>" in line:
            raw_result = line.rsplit("=", 1)[-1].strip()
            if re.match(r"[0-9]+(?:<|\s|$)", raw_result):
                traced_paths.add(pending_paths[pid])
            pending_paths.pop(pid, None)

    derived_paths: set[str] = set()
    for traced_path in traced_paths:
        try:
            raw_path = bytes(traced_path, "utf-8").decode("unicode_escape")
        except UnicodeError as error:
            raise ContractError(f"runtime trace has an invalid escaped path: {error}") from error
        try:
            resolved = str(Path(raw_path).resolve(strict=True))
            metadata = os.stat(resolved, follow_symlinks=False)
        except OSError:
            continue
        if not stat.S_ISREG(metadata.st_mode):
            continue
        if any(
            resolved == root or resolved.startswith(root.rstrip("/") + "/")
            for root in mounted_roots
        ):
            derived_paths.add(resolved)
    manifest_paths = [item.get("path") for item in files if isinstance(item, dict)]
    if manifest_paths != sorted(derived_paths):
        raise ContractError(
            "runtime-closure files do not exactly equal successful mounted-root opens from trace"
        )
    allowed_roots = tuple(str(root).rstrip("/") + "/" for root in mounted_roots)
    for index, binding in enumerate(files):
        if (
            not isinstance(binding, dict)
            or set(binding) != {"path", "bytes", "sha256"}
            or not isinstance(binding.get("path"), str)
            or not binding["path"].startswith(allowed_roots)
        ):
            raise ContractError("runtime-closure file is outside exact mounted roots")
        opened = _open_and_verify_binding(
            f"runtimeClosure/files/{index}",
            binding,
            report_file,
            absolute_allowed=True,
        )
        opened.close()


def _assert_evidence_manifest(
    value: Any,
    evidence_manifest_binding: dict[str, Any],
    local_bindings: list[dict[str, Any]],
) -> None:
    if not isinstance(value, dict) or set(value) != {"formatVersion", "bytes", "sha256", "files"}:
        raise ContractError("evidence manifest is not a closed v1 object")
    files = value.get("files")
    if not isinstance(files, list):
        raise ContractError("evidence manifest lacks files")
    manifest_path = Path(str(evidence_manifest_binding.get("path")))
    evidence_root = manifest_path.parent
    expected: list[dict[str, Any]] = []
    for binding in local_bindings:
        path = Path(str(binding.get("path")))
        try:
            relative = path.relative_to(evidence_root).as_posix()
        except ValueError as error:
            raise ContractError("report evidence binding is outside evidence-manifest root") from error
        expected.append(
            {"path": relative, "bytes": binding.get("bytes"), "sha256": binding.get("sha256")}
        )
    expected.sort(key=lambda item: item["path"])
    if files != expected:
        raise ContractError("evidence manifest does not exactly equal all report evidence bindings")
    total = sum(int(item["bytes"]) for item in expected)
    digest = hashlib.sha256()
    for item in expected:
        digest.update(item["path"].encode("utf-8"))
        digest.update(b"\0")
        digest.update(str(item["bytes"]).encode("ascii"))
        digest.update(b"\0")
        digest.update(str(item["sha256"]).encode("ascii"))
        digest.update(b"\n")
    if value.get("formatVersion") != 1 or value.get("bytes") != total or value.get("sha256") != digest.hexdigest():
        raise ContractError("evidence manifest aggregate bytes/digest differ")


def evidence_binding_diagnostics(
    report: Any,
    report_file: SecureFile,
) -> list[Diagnostic]:
    """Re-open, rehash, parse, and cross-bind every assertion in a valid receipt."""

    if not isinstance(report, dict) or report.get("status") != "valid":
        return []
    opened: dict[str, SecureFile] = {}
    bindings: dict[str, dict[str, Any]] = {}
    local_evidence_bindings: list[dict[str, Any]] = []

    def add(
        location: str,
        value: Any,
        *,
        absolute_allowed: bool,
        evidence_member: bool = False,
    ) -> None:
        binding = value if isinstance(value, dict) else {}
        bindings[location] = binding
        opened[location] = _open_and_verify_binding(
            location,
            binding,
            report_file,
            absolute_allowed=absolute_allowed,
        )
        if evidence_member:
            local_evidence_bindings.append(binding)

    try:
        input_value = object_at(report, "input")
        add("/input/fwuOwlPackage", object_at(input_value, "fwuOwlPackage"), absolute_allowed=True)
        add("/input/validationReceipt", object_at(input_value, "validationReceipt"), absolute_allowed=True)
        for name in ("runner", "sandboxEntry", "compiler", "packageValidator"):
            add(
                f"/{name}/executable",
                object_at(object_at(report, name), "executable"),
                absolute_allowed=True,
            )
        isolation = object_at(report, "isolation")
        add("/isolation/sandboxTool", object_at(isolation, "sandboxTool"), absolute_allowed=True)
        add("/isolation/traceTool", object_at(isolation, "traceTool"), absolute_allowed=True)
        python_runtime = object_at(isolation, "pythonRuntime")
        add(
            "/isolation/pythonRuntime/executable",
            object_at(python_runtime, "executable"),
            absolute_allowed=True,
        )
        runs = object_at(report, "runs")
        for run_name in ("runA", "runB"):
            add(
                f"/isolation/{run_name}",
                object_at(isolation, run_name),
                absolute_allowed=False,
                evidence_member=True,
            )
            run = object_at(runs, run_name)
            add(
                f"/runs/{run_name}/output",
                object_at(run, "output"),
                absolute_allowed=False,
            )
            add(
                f"/runs/{run_name}/validationReceipt",
                object_at(run, "validationReceipt"),
                absolute_allowed=False,
                evidence_member=True,
            )
            evidence = object_at(run, "evidence")
            for evidence_name in (*EXPECTED_EVIDENCE_KEYS, "runtimeClosureManifest"):
                add(
                    f"/runs/{run_name}/evidence/{evidence_name}",
                    object_at(evidence, evidence_name),
                    absolute_allowed=False,
                    evidence_member=True,
                )
        add("/evidenceManifest", object_at(report, "evidenceManifest"), absolute_allowed=False)

        identities: dict[tuple[int, int], str] = {}
        for location, item in opened.items():
            identity = (item.identity[0], item.identity[1])
            if identity in identities:
                raise ContractError(f"evidence aliases another binding: {location} / {identities[identity]}")
            identities[identity] = location

        fwu_binding = bindings["/input/fwuOwlPackage"]
        fwu_summary = _inspect_package_archive(
            opened["/input/fwuOwlPackage"],
            variant="fwu-owl",
            expected_outer_sha256=str(fwu_binding.get("sha256")),
        )
        if not (
            fwu_binding.get("bytes") == fwu_summary.outer_bytes
            and fwu_binding.get("sha256") == fwu_summary.outer_sha256
            and fwu_binding.get("manifestSha256") == fwu_summary.manifest_sha256
            and fwu_binding.get("contentDigest") == fwu_summary.content_digest
        ):
            raise ContractError("outer FWU binding differs from central directory/manifest/SCI")
        fwu_receipt = _strict_bound_json(
            opened["/input/validationReceipt"], "bound DPK-008c receipt"
        )
        _assert_fwu_receipt(
            fwu_receipt,
            object_at(input_value, "validationReceipt"),
            fwu_binding,
            fwu_summary,
        )
        expected_masked_paths = _expected_masked_paths(fwu_receipt)

        output_summaries: dict[str, ArchiveSummary] = {}
        for run_name in ("runA", "runB"):
            output_location = f"/runs/{run_name}/output"
            output_binding = bindings[output_location]
            summary = _inspect_package_archive(
                opened[output_location],
                variant="json",
                expected_outer_sha256=str(output_binding.get("sha256")),
            )
            output_summaries[run_name] = summary
            expected_projection = {
                "bytes": summary.outer_bytes,
                "sha256": summary.outer_sha256,
                "manifestSha256": summary.manifest_sha256,
                "contentDigest": summary.content_digest,
                "counts": summary.counts,
            }
            if any(output_binding.get(key) != expected for key, expected in expected_projection.items()):
                raise ContractError(f"outer output binding differs from {run_name} ZIP inspection")
            if summary.content_digest != fwu_summary.content_digest:
                raise ContractError(f"{run_name} content digest differs from FWU semantic index")
            receipt_location = f"/runs/{run_name}/validationReceipt"
            receipt = _strict_bound_json(opened[receipt_location], f"{run_name} validator-v2 receipt")
            _assert_full_receipt(receipt, bindings[receipt_location], summary)
            compiler_location = f"/runs/{run_name}/evidence/compilerReport"
            compiler_report = _strict_bound_json(
                opened[compiler_location], f"{run_name} reverse compiler report"
            )
            _assert_compiler_report(compiler_report, report, fwu_summary, summary)
            output_tree_location = f"/runs/{run_name}/evidence/outputTreeManifest"
            _assert_output_tree_manifest(
                _strict_bound_json(opened[output_tree_location], f"{run_name} output-tree manifest"),
                summary,
                str(output_binding.get("path")),
                run_name,
            )
            runtime_location = f"/runs/{run_name}/evidence/runtimeClosureManifest"
            runtime_manifest = _strict_bound_json(
                opened[runtime_location], f"{run_name} runtime-closure manifest"
            )
            trace_location = f"/isolation/{run_name}"
            filtered_trace_raw = opened[trace_location].read(MAX_TRACE_BYTES)
            host_trace_location = f"/runs/{run_name}/evidence/hostRawTrace"
            host_trace_raw = opened[host_trace_location].read(MAX_TRACE_BYTES)
            process_tree_location = (
                f"/runs/{run_name}/evidence/traceProcessTreeManifest"
            )
            trace_text = _assert_trace_process_tree(
                host_trace_raw,
                filtered_trace_raw,
                _strict_bound_json(
                    opened[process_tree_location],
                    f"{run_name} trace process-tree manifest",
                ),
            )
            _assert_trace_evidence(
                filtered_trace_raw,
                bindings[trace_location],
                (*HOST_ROOT_SENTINELS, *expected_masked_paths),
            )
            _assert_runtime_closure_manifest(
                runtime_manifest,
                python_runtime,
                object_at(isolation, "traceTool"),
                report_file,
                trace_text,
            )
            probe_location = f"/runs/{run_name}/evidence/isolationProbe"
            _assert_isolation_probe(
                _strict_bound_json(opened[probe_location], f"{run_name} isolation probe"),
                expected_masked_paths=expected_masked_paths,
                python_runtime=python_runtime,
                runtime_manifest=runtime_manifest,
            )

        if output_summaries["runA"] != output_summaries["runB"]:
            raise ContractError("independently inspected output ZIP summaries differ")
        runtime_a = bindings["/runs/runA/evidence/runtimeClosureManifest"]
        runtime_b = bindings["/runs/runB/evidence/runtimeClosureManifest"]
        if (runtime_a.get("bytes"), runtime_a.get("sha256")) != (
            runtime_b.get("bytes"),
            runtime_b.get("sha256"),
        ):
            raise ContractError("run A/B runtime-closure manifests are not byte-identical")
        mounted_roots = python_runtime.get("mountedRoots")
        if (
            not isinstance(mounted_roots, list)
            or mounted_roots != sorted(mounted_roots)
            or any(root in {"/usr", "/lib", "/lib64"} for root in mounted_roots)
        ):
            raise ContractError("pythonRuntime mountedRoots are broad, empty, or unsorted")
        version = python_runtime.get("version")
        if (
            not isinstance(version, str)
            or tuple(int(part) for part in version.split(".")) < (3, 10, 0)
            or python_runtime.get("minimumVersion") != "3.10"
            or python_runtime.get("siteEnabled") is not False
        ):
            raise ContractError("pythonRuntime version/site contract differs")

        evidence_value = _strict_bound_json(opened["/evidenceManifest"], "evidence manifest")
        _assert_evidence_manifest(
            evidence_value,
            bindings["/evidenceManifest"],
            local_evidence_bindings,
        )
        for item in opened.values():
            item.assert_unchanged()
        report_file.assert_unchanged()
        return []
    except (ContractError, OSError, ValueError, KeyError, TypeError) as error:
        return [Diagnostic("REVERSE_EVIDENCE_CONTENT", "/", str(error))]
    finally:
        for item in reversed(list(opened.values())):
            item.close()


def mathematics_fixture_diagnostics(report: Any) -> list[Diagnostic]:
    if not isinstance(report, dict):
        return []
    runs = object_at(report, "runs")
    diagnostics: list[Diagnostic] = []
    for run_name in ("runA", "runB"):
        counts = object_at(object_at(object_at(runs, run_name), "output"), "counts")
        if counts != EXPECTED_MATHEMATICS_COUNTS:
            diagnostics.append(
                Diagnostic(
                    "FIXTURE_EXPECTED_COUNTS",
                    f"/runs/{run_name}/output/counts",
                    "The DPK-008d Mathematik fixture inventory differs from its frozen expectation.",
                )
            )
    return diagnostics


def set_path(value: dict[str, Any], path: tuple[str | int, ...], replacement: Any) -> None:
    cursor: Any = value
    for segment in path[:-1]:
        cursor = cursor[segment]
    cursor[path[-1]] = replacement


def mutation_cases() -> list[MutationCase]:
    cases: list[MutationCase] = []

    def case(
        case_id: str,
        expected_code: str,
        mutate: Callable[[dict[str, Any]], None],
    ) -> None:
        cases.append(MutationCase(case_id, expected_code, mutate))

    case(
        "input-zip-substitution",
        "REVERSE_FWU_RECEIPT_UNBOUND",
        lambda value: set_path(value, ("input", "fwuOwlPackage", "sha256"), "0" * 64),
    )
    case(
        "input-manifest-substitution",
        "REVERSE_FWU_RECEIPT_UNBOUND",
        lambda value: set_path(
            value, ("input", "fwuOwlPackage", "manifestSha256"), "0" * 64
        ),
    )
    case(
        "fwu-validation-failed",
        "REVERSE_FWU_VALIDATION_FAILED",
        lambda value: set_path(value, ("input", "validationReceipt", "status"), "invalid"),
    )
    case(
        "fwu-gate-failed",
        "REVERSE_FWU_VALIDATION_FAILED",
        lambda value: set_path(
            value, ("input", "validationReceipt", "gates", 13, "status"), "failed"
        ),
    )
    case(
        "fwu-gate-order",
        "REVERSE_FWU_GATE_SET",
        lambda value: value["input"]["validationReceipt"]["gates"].reverse(),
    )
    for field in (
        "originalJsonPackageAccessible",
        "authoringCheckoutAccessible",
        "forwardExporterAccessible",
        "networkAccessible",
    ):
        case(
            f"isolation-{field}",
            "REVERSE_NOT_ISOLATED",
            lambda value, field=field: set_path(value, ("isolation", field), True),
        )
    case(
        "trace-forbidden-read",
        "REVERSE_TRACE_NOT_CLEAN",
        lambda value: set_path(value, ("isolation", "runA", "forbiddenReadCount"), 1),
    )
    case(
        "trace-network-attempt",
        "REVERSE_TRACE_NOT_CLEAN",
        lambda value: set_path(value, ("isolation", "runB", "networkAttemptCount"), 1),
    )
    case(
        "trace-collision",
        "REVERSE_TRACE_COLLISION",
        lambda value: set_path(
            value,
            ("isolation", "runB", "path"),
            value["isolation"]["runA"]["path"],
        ),
    )
    case(
        "compiler-hash-malformed",
        "REVERSE_SCHEMA",
        lambda value: set_path(value, ("compiler", "executable", "sha256"), "not-a-hash"),
    )
    case(
        "runner-hash-malformed",
        "REVERSE_SCHEMA",
        lambda value: set_path(value, ("runner", "executable", "sha256"), "not-a-hash"),
    )
    case(
        "runner-id",
        "REVERSE_SCHEMA",
        lambda value: set_path(value, ("runner", "id"), "untrusted-runner"),
    )
    case(
        "sandbox-entry-hash-malformed",
        "REVERSE_SCHEMA",
        lambda value: set_path(
            value, ("sandboxEntry", "executable", "sha256"), "not-a-hash"
        ),
    )
    case(
        "sandbox-entry-id",
        "REVERSE_SCHEMA",
        lambda value: set_path(value, ("sandboxEntry", "id"), "untrusted-sandbox-entry"),
    )
    case(
        "evidence-manifest-missing",
        "REVERSE_SCHEMA",
        lambda value: value.pop("evidenceManifest"),
    )
    case(
        "python-runtime-missing",
        "REVERSE_SCHEMA",
        lambda value: value["isolation"].pop("pythonRuntime"),
    )
    case(
        "python-site-enabled",
        "REVERSE_SCHEMA",
        lambda value: set_path(value, ("isolation", "pythonRuntime", "siteEnabled"), True),
    )
    case(
        "compiler-report-missing",
        "REVERSE_SCHEMA",
        lambda value: value["runs"]["runA"]["evidence"].pop("compilerReport"),
    )
    case(
        "isolation-probe-missing",
        "REVERSE_SCHEMA",
        lambda value: value["runs"]["runA"]["evidence"].pop("isolationProbe"),
    )
    case(
        "sandbox-log-missing",
        "REVERSE_SCHEMA",
        lambda value: value["runs"]["runA"]["evidence"].pop("sandboxLog"),
    )
    case(
        "output-tree-manifest-missing",
        "REVERSE_SCHEMA",
        lambda value: value["runs"]["runA"]["evidence"].pop("outputTreeManifest"),
    )
    case(
        "full-validator-log-missing",
        "REVERSE_SCHEMA",
        lambda value: value["runs"]["runA"]["evidence"].pop("fullValidatorLog"),
    )
    case(
        "runtime-closure-manifest-missing",
        "REVERSE_SCHEMA",
        lambda value: value["runs"]["runA"]["evidence"].pop("runtimeClosureManifest"),
    )
    case(
        "host-raw-trace-missing",
        "REVERSE_SCHEMA",
        lambda value: value["runs"]["runA"]["evidence"].pop("hostRawTrace"),
    )
    case(
        "trace-process-tree-manifest-missing",
        "REVERSE_SCHEMA",
        lambda value: value["runs"]["runA"]["evidence"].pop(
            "traceProcessTreeManifest"
        ),
    )
    case(
        "runtime-closure-not-reproducible",
        "REVERSE_RUNTIME_CLOSURE_REPRODUCIBILITY",
        lambda value: set_path(
            value,
            ("runs", "runB", "evidence", "runtimeClosureManifest", "sha256"),
            "9" * 64,
        ),
    )
    case(
        "evidence-path-collision",
        "REVERSE_EVIDENCE_PATH_COLLISION",
        lambda value: set_path(
            value,
            ("runs", "runB", "evidence", "sandboxLog", "path"),
            value["runs"]["runA"]["evidence"]["sandboxLog"]["path"],
        ),
    )
    case(
        "package-validator-hash-malformed",
        "REVERSE_SCHEMA",
        lambda value: set_path(
            value, ("packageValidator", "executable", "sha256"), "not-a-hash"
        ),
    )
    case(
        "package-validator-id",
        "REVERSE_SCHEMA",
        lambda value: set_path(value, ("packageValidator", "id"), "untrusted-validator"),
    )
    case(
        "output-content-digest",
        "REVERSE_CONTENT_DIGEST_MISMATCH",
        lambda value: set_path(
            value, ("runs", "runA", "output", "contentDigest"), "sha256:" + "0" * 64
        ),
    )
    case(
        "output-validation-hash",
        "REVERSE_OUTPUT_VALIDATION_UNBOUND",
        lambda value: set_path(
            value,
            ("runs", "runA", "validationReceipt", "packageZipSha256"),
            "0" * 64,
        ),
    )
    case(
        "output-validation-manifest",
        "REVERSE_OUTPUT_VALIDATION_UNBOUND",
        lambda value: set_path(
            value,
            ("runs", "runB", "validationReceipt", "manifestSha256"),
            "0" * 64,
        ),
    )
    case(
        "output-validation-status",
        "REVERSE_OUTPUT_VALIDATION_FAILED",
        lambda value: set_path(
            value, ("runs", "runA", "validationReceipt", "status"), "invalid"
        ),
    )
    case(
        "output-validation-error-count",
        "REVERSE_OUTPUT_VALIDATION_FAILED",
        lambda value: set_path(
            value, ("runs", "runB", "validationReceipt", "errorCount"), 1
        ),
    )
    case(
        "output-path-collision",
        "REVERSE_OUTPUT_COLLISION",
        lambda value: set_path(
            value,
            ("runs", "runB", "output", "path"),
            value["runs"]["runA"]["output"]["path"],
        ),
    )
    case(
        "validation-receipt-collision",
        "REVERSE_VALIDATION_RECEIPT_COLLISION",
        lambda value: set_path(
            value,
            ("runs", "runB", "validationReceipt", "path"),
            value["runs"]["runA"]["validationReceipt"]["path"],
        ),
    )
    case(
        "zip-reproducibility",
        "REVERSE_REPRODUCIBILITY_FAILED",
        lambda value: set_path(value, ("runs", "runB", "output", "sha256"), "0" * 64),
    )
    case(
        "manifest-reproducibility",
        "REVERSE_REPRODUCIBILITY_FAILED",
        lambda value: set_path(
            value, ("runs", "runB", "output", "manifestSha256"), "0" * 64
        ),
    )
    case(
        "byte-reproducibility",
        "REVERSE_REPRODUCIBILITY_FAILED",
        lambda value: set_path(value, ("runs", "runB", "output", "bytes"), 1),
    )
    case(
        "count-reproducibility",
        "REVERSE_REPRODUCIBILITY_FAILED",
        lambda value: set_path(
            value, ("runs", "runB", "output", "counts", "logicalArtifacts"), 110
        ),
    )
    case(
        "inventory-arithmetic",
        "REVERSE_INVENTORY_ARITHMETIC",
        lambda value: set_path(
            value, ("runs", "runA", "output", "counts", "checksumRows"), 909
        ),
    )
    case(
        "binary-inventory",
        "REVERSE_BINARY_INVENTORY_MISMATCH",
        lambda value: (
            set_path(value, ("runs", "runA", "output", "counts", "binaryResources"), 0),
            set_path(value, ("runs", "runB", "output", "counts", "binaryResources"), 0),
        ),
    )
    case(
        "fixture-coherent-package-count-drift",
        "FIXTURE_EXPECTED_COUNTS",
        lambda value: [
            object_at(object_at(object_at(value["runs"], run_name), "output"), "counts").update(
                {"zipEntries": 912, "manifestFiles": 910, "checksumRows": 911}
            )
            for run_name in ("runA", "runB")
        ],
    )
    case(
        "fixture-coherent-logical-count-drift",
        "FIXTURE_EXPECTED_COUNTS",
        lambda value: [
            set_path(
                value,
                ("runs", run_name, "output", "counts", "logicalArtifacts"),
                112,
            )
            for run_name in ("runA", "runB")
        ],
    )
    case(
        "reproducibility-claim",
        "REVERSE_REPRODUCIBILITY_FAILED",
        lambda value: set_path(value, ("reproducibility", "zipByteIdentical"), False),
    )
    case(
        "unexpected-property",
        "REVERSE_SCHEMA",
        lambda value: value.update({"originalJsonPackageSha256": "0" * 64}),
    )
    case(
        "compiler-id",
        "REVERSE_SCHEMA",
        lambda value: set_path(value, ("compiler", "id"), "forward-exporter"),
    )
    case(
        "report-version",
        "REVERSE_SCHEMA",
        lambda value: set_path(value, ("reportFormatVersion",), 2),
    )
    case(
        "valid-with-diagnostic",
        "REVERSE_SCHEMA",
        lambda value: value["diagnostics"].append(
            {"code": "TEST_FAILURE", "location": "/", "message": "failure"}
        ),
    )
    case(
        "invalid-without-diagnostic",
        "REVERSE_SCHEMA",
        lambda value: set_path(value, ("status",), "invalid"),
    )
    return cases


def raw_cases(fixture: dict[str, Any]) -> list[tuple[str, bytes]]:
    rendered = json.dumps(fixture, ensure_ascii=False, separators=(",", ":"))
    duplicate = rendered.replace(
        '"status":"valid"',
        '"status":"valid","status":"valid"',
        1,
    )
    nonfinite = re.sub(r'"bytes":\d+', '"bytes":NaN', rendered, count=1)
    overdepth = b"[" * (MAX_JSON_DEPTH + 1) + b"0" + b"]" * (MAX_JSON_DEPTH + 1)
    return [
        ("duplicate-key", duplicate.encode("utf-8")),
        ("nonfinite-number", nonfinite.encode("utf-8")),
        ("trailing-token", f"{rendered} true".encode("utf-8")),
        ("unpaired-surrogate", b'{"value":"\\ud800"}'),
        ("depth-limit", overdepth),
        ("invalid-utf8", b"{\"value\":\"\xff\"}"),
    ]


def _test_file_binding(path: Path, relative_to: Path) -> dict[str, Any]:
    raw = path.read_bytes()
    return {
        "path": path.relative_to(relative_to).as_posix(),
        "bytes": len(raw),
        "sha256": hashlib.sha256(raw).hexdigest(),
    }


def run_external_content_self_tests(verbose: bool) -> tuple[int, list[str]]:
    """Exercise rehashed malicious files, not merely mutated outer JSON fields."""

    failures: list[str] = []
    passed = 0
    temporary_parent = REPO_ROOT / "tmp"
    temporary_parent.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(
        prefix="reverse-contract-selftest-", dir=temporary_parent
    ) as raw_root:
        root = Path(raw_root)
        report_path = root / "report.json"
        report_path.write_bytes(b"{}\n")
        evidence = root / "evidence"
        evidence.mkdir()
        report_file = open_report_securely(report_path)
        try:
            # A content-forged validator receipt is hashed *after* tampering.  Its
            # file binding passes, while strict nested receipt/output binding must fail.
            receipt = load_json(
                CONTRACT_ROOT
                / "fixtures"
                / "package-provisioner"
                / "valid"
                / "full-package-validation-report.json"
            )
            if not isinstance(receipt, dict):
                raise ContractError("trusted full receipt fixture is not an object")
            original_input = object_at(receipt, "input")
            package = object_at(receipt, "package")
            counts = object_at(receipt, "counts")
            summary = ArchiveSummary(
                outer_bytes=int(original_input["bytes"]),
                outer_sha256=str(original_input["sha256"]),
                archive_root=str(package["archiveRoot"]),
                manifest_sha256=str(package["manifestSha256"]),
                content_digest=str(package["contentDigest"]),
                release_id=str(package["releaseId"]),
                package_id=str(package["packageId"]),
                package_version=str(package["packageVersion"]),
                counts={
                    "zipEntries": int(counts["archiveEntries"]),
                    "manifestFiles": int(counts["manifestFiles"]),
                    "checksumRows": int(counts["archiveEntries"]) - 1,
                    "logicalArtifacts": int(counts["logicalArtifacts"]),
                    "binaryResources": int(counts["binaryResources"]),
                    "binaryBytes": 0,
                },
                closure_digest=str(package["closureDigest"]),
                definition_index_digest=str(package["definitionIndexDigest"]),
                registry={},
            )
            receipt["input"]["sha256"] = "0" * 64
            receipt_path = evidence / "forged-validator-receipt.json"
            receipt_path.write_bytes(
                (json.dumps(receipt, sort_keys=True) + "\n").encode("utf-8")
            )
            receipt_binding = _test_file_binding(receipt_path, root)
            opened = _open_and_verify_binding(
                "selftest/forgedReceipt",
                receipt_binding,
                report_file,
                absolute_allowed=False,
            )
            try:
                compact = {
                    "validatorId": "skillpilot-full-standalone-package-validator-v2",
                    "status": "valid",
                    "errorCount": 0,
                    "packageZipSha256": summary.outer_sha256,
                    "manifestSha256": summary.manifest_sha256,
                }
                try:
                    _assert_full_receipt(
                        _strict_bound_json(opened, "rehash-forged validator receipt"),
                        compact,
                        summary,
                    )
                except ContractError:
                    passed += 1
                    if verbose:
                        print("PASS external content forgery rehashed-validator-receipt")
                else:
                    failures.append("rehashed content-forged validator receipt was accepted")
            finally:
                opened.close()

            # A forged evidence inventory is likewise hashed after its internal
            # substitution, but must still equal the exact report binding set.
            expected_binding = {
                "path": "evidence/a.log",
                "bytes": 4,
                "sha256": hashlib.sha256(b"good").hexdigest(),
            }
            forged_binding = {
                "path": "a.log",
                "bytes": 4,
                "sha256": hashlib.sha256(b"evil").hexdigest(),
            }
            digest = hashlib.sha256()
            digest.update(b"a.log\0" + b"4\0" + forged_binding["sha256"].encode("ascii") + b"\n")
            forged_manifest = {
                "formatVersion": 1,
                "bytes": 4,
                "sha256": digest.hexdigest(),
                "files": [forged_binding],
            }
            manifest_path = evidence / "evidence-manifest.json"
            manifest_path.write_bytes(
                (json.dumps(forged_manifest, sort_keys=True) + "\n").encode("utf-8")
            )
            manifest_binding = _test_file_binding(manifest_path, root)
            opened = _open_and_verify_binding(
                "selftest/forgedEvidenceManifest",
                manifest_binding,
                report_file,
                absolute_allowed=False,
            )
            try:
                try:
                    _assert_evidence_manifest(
                        _strict_bound_json(opened, "rehash-forged evidence manifest"),
                        manifest_binding,
                        [expected_binding],
                    )
                except ContractError:
                    passed += 1
                    if verbose:
                        print("PASS external content forgery rehashed-evidence-manifest")
                else:
                    failures.append("rehashed content-forged evidence manifest was accepted")
            finally:
                opened.close()

            # A freshly hashed ZIP with a plausible suffix/root cannot satisfy a
            # fabricated outer summary without manifest/SCI/inventory evidence.
            output = root / "forged.reconstructed.json.zip"
            info = zipfile.ZipInfo("fixture.json/data.json", (1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_STORED
            info.external_attr = (stat.S_IFREG | 0o644) << 16
            with zipfile.ZipFile(output, "w", allowZip64=False) as archive:
                archive.writestr(info, b"{}\n")
            output_binding = _test_file_binding(output, root)
            opened = _open_and_verify_binding(
                "selftest/forgedZip",
                output_binding,
                report_file,
                absolute_allowed=False,
            )
            try:
                try:
                    _inspect_package_archive(
                        opened,
                        variant="json",
                        expected_outer_sha256=str(output_binding["sha256"]),
                    )
                except ContractError:
                    passed += 1
                    if verbose:
                        print("PASS external content forgery rehashed-zip-summary")
                else:
                    failures.append("freshly hashed ZIP without manifest/SCI was accepted")
            finally:
                opened.close()

            target = evidence / "target.json"
            target.write_bytes(b"{}\n")
            symlink = evidence / "link.json"
            symlink.symlink_to(target.name)
            binding = {
                "path": "evidence/link.json",
                "bytes": 3,
                "sha256": hashlib.sha256(b"{}\n").hexdigest(),
            }
            try:
                _open_and_verify_binding(
                    "selftest/symlink",
                    binding,
                    report_file,
                    absolute_allowed=False,
                )
            except ContractError:
                passed += 1
                if verbose:
                    print("PASS external path attack nofollow-symlink")
            else:
                failures.append("nofollow evidence opener accepted a symlink")

            forged_trace_raw = b'1 socket(AF_UNIX, SOCK_STREAM, 0) = 3\n'
            forged_trace_path = evidence / "forged.strace"
            forged_trace_path.write_bytes(forged_trace_raw)
            forged_trace_binding = {
                **_test_file_binding(forged_trace_path, root),
                "forbiddenReadCount": 0,
                "networkAttemptCount": 0,
            }
            opened = _open_and_verify_binding(
                "selftest/forgedTrace",
                forged_trace_binding,
                report_file,
                absolute_allowed=False,
            )
            try:
                try:
                    _assert_trace_evidence(
                        opened.read(), forged_trace_binding, HOST_ROOT_SENTINELS
                    )
                except ContractError:
                    passed += 1
                    if verbose:
                        print("PASS external content forgery rehashed-trace")
                else:
                    failures.append("rehashed trace with a network syscall was accepted")
            finally:
                opened.close()

            split_allowed = (
                b'1 newfstatat(AT_FDCWD, "/home", 0x0, 0) <unfinished ...>\n'
                b"1 <... newfstatat resumed>) = -1 ENOENT (No such file or directory)\n"
            )
            if _trace_audit(split_allowed, HOST_ROOT_SENTINELS)[:2] != (0, 0):
                failures.append("split ENOENT sentinel probe was not reconstructed")
            unfinished_trace = (
                b'1 newfstatat(AT_FDCWD, "/home", 0x0, 0) <unfinished ...>\n'
            )
            unfinished_path = evidence / "forged-unfinished.strace"
            unfinished_path.write_bytes(unfinished_trace)
            unfinished_binding = {
                **_test_file_binding(unfinished_path, root),
                "forbiddenReadCount": 0,
                "networkAttemptCount": 0,
            }
            opened = _open_and_verify_binding(
                "selftest/forgedUnfinishedTrace",
                unfinished_binding,
                report_file,
                absolute_allowed=False,
            )
            try:
                try:
                    _assert_trace_evidence(
                        opened.read(), unfinished_binding, HOST_ROOT_SENTINELS
                    )
                except ContractError:
                    passed += 1
                    if verbose:
                        print("PASS external content forgery rehashed-unfinished-trace")
                else:
                    failures.append("rehashed unfinished forbidden trace was accepted")
            finally:
                opened.close()

            raw_process_trace = (
                b'100 execve("/opt/tools/python3", ["/opt/tools/python3", "-I", '
                b'"-S", "-B", "/opt/reverse-runner/sandbox-entry.py", "--compiler", '
                b'"/opt/reverse-runner/reconstruct.py"], 0x0) = 0\n'
                b"100 clone(child_stack=NULL, flags=SIGCHLD) = 101\n"
                b'101 execve("/opt/tools/python3", ["/opt/tools/python3", "-I", '
                b'"-S", "-B", "/opt/reverse-runner/reconstruct.py"], 0x0) '
                b"<unfinished ...>\n"
                b'101 openat(AT_FDCWD, "/usr/lib/python3.10/os.py", O_RDONLY) = 3\n'
            )
            derived_filtered, derived_processes = _derive_filtered_trace(
                raw_process_trace
            )
            forged_process_manifest = {
                "manifestId": "skillpilot-sandbox-trace-process-tree-v1",
                "formatVersion": 1,
                "sourceTrace": {
                    "bytes": len(raw_process_trace),
                    "sha256": hashlib.sha256(raw_process_trace).hexdigest(),
                },
                "entrypoint": {
                    "executable": "/opt/tools/python3",
                    "script": "/opt/reverse-runner/sandbox-entry.py",
                },
                "processes": derived_processes,
                "filteredTrace": {
                    "bytes": len(derived_filtered),
                    "sha256": hashlib.sha256(derived_filtered).hexdigest(),
                    "lineCount": len(derived_filtered.splitlines()) + 1,
                },
            }
            process_path = evidence / "forged-trace-process-tree-manifest.json"
            process_path.write_bytes(
                (json.dumps(forged_process_manifest, sort_keys=True) + "\n").encode(
                    "utf-8"
                )
            )
            process_binding = _test_file_binding(process_path, root)
            opened = _open_and_verify_binding(
                "selftest/forgedTraceProcessTree",
                process_binding,
                report_file,
                absolute_allowed=False,
            )
            try:
                try:
                    _assert_trace_process_tree(
                        raw_process_trace,
                        derived_filtered,
                        _strict_bound_json(opened, "rehash-forged process tree"),
                    )
                except ContractError:
                    passed += 1
                    if verbose:
                        print("PASS external content forgery rehashed-process-tree")
                else:
                    failures.append("rehashed forged trace process-tree was accepted")
            finally:
                opened.close()

            python_path = Path("/usr/bin/python3").resolve(strict=True)
            python_raw = python_path.read_bytes()
            python_binding = {
                "path": str(python_path),
                "bytes": len(python_raw),
                "sha256": hashlib.sha256(python_raw).hexdigest(),
            }
            forged_runtime = {
                "manifestId": "skillpilot-sandbox-python-runtime-closure-v1",
                "formatVersion": 1,
                "python": {**python_binding, "version": "3.10.12"},
                "pythonElfInterpreter": python_binding,
                "traceToolRuntime": {
                    "executable": python_binding,
                    "elfInterpreter": python_binding,
                    "libraries": [python_binding],
                },
                "mounts": [
                    {
                        "source": "/home",
                        "target": "/usr/lib/python3.10",
                        "readOnly": True,
                    }
                ],
                "symlinks": [{"path": "/lib", "target": "usr/lib"}],
                "files": [
                    {
                        "path": "/usr/lib/python3.10/os.py",
                        "bytes": 1,
                        "sha256": "0" * 64,
                    }
                ],
            }
            runtime_path = evidence / "forged-runtime-closure-manifest.json"
            runtime_path.write_bytes(
                (json.dumps(forged_runtime, sort_keys=True) + "\n").encode("utf-8")
            )
            runtime_binding = _test_file_binding(runtime_path, root)
            opened = _open_and_verify_binding(
                "selftest/forgedRuntimeClosure",
                runtime_binding,
                report_file,
                absolute_allowed=False,
            )
            try:
                try:
                    _assert_runtime_closure_manifest(
                        _strict_bound_json(opened, "rehash-forged runtime closure"),
                        {
                            "executable": python_binding,
                            "version": "3.10.12",
                            "minimumVersion": "3.10",
                            "siteEnabled": False,
                            "mountedRoots": ["/usr/lib/python3.10"],
                        },
                        python_binding,
                        report_file,
                        "",
                    )
                except ContractError:
                    passed += 1
                    if verbose:
                        print("PASS external content forgery rehashed-runtime-closure")
                else:
                    failures.append("rehashed runtime closure with source=/home was accepted")
            finally:
                opened.close()

            def absolute_binding(path: Path) -> dict[str, Any]:
                resolved = path.resolve(strict=True)
                raw = resolved.read_bytes()
                return {
                    "path": str(resolved),
                    "bytes": len(raw),
                    "sha256": hashlib.sha256(raw).hexdigest(),
                }

            def interpreter_binding(executable_binding: dict[str, Any]) -> dict[str, Any]:
                executable = _open_secure_file(
                    executable_binding["path"],
                    label="selftest ELF executable",
                    report_parent_descriptor=None,
                    absolute_allowed=True,
                )
                try:
                    return absolute_binding(Path(_elf_interpreter(executable)))
                finally:
                    executable.close()

            python_interpreter_binding = interpreter_binding(python_binding)
            mounted_root = "/usr/lib/x86_64-linux-gnu"
            runtime_base = {
                "manifestId": "skillpilot-sandbox-python-runtime-closure-v1",
                "formatVersion": 1,
                "python": {**python_binding, "version": "3.10.12"},
                "mounts": [
                    {
                        "source": mounted_root,
                        "target": mounted_root,
                        "readOnly": True,
                    }
                ],
                "symlinks": [{"path": "/lib", "target": "usr/lib"}],
                "files": [
                    {
                        "path": f"{mounted_root}/libc.so.6",
                        "bytes": 1,
                        "sha256": "0" * 64,
                    }
                ],
            }
            runtime_outer_python = {
                "executable": python_binding,
                "version": "3.10.12",
                "minimumVersion": "3.10",
                "siteEnabled": False,
                "mountedRoots": [mounted_root],
            }

            forged_pt_interp = {
                **runtime_base,
                "pythonElfInterpreter": python_binding,
                "traceToolRuntime": {
                    "executable": python_binding,
                    "elfInterpreter": python_interpreter_binding,
                    "libraries": [python_binding],
                },
            }
            pt_path = evidence / "forged-pt-interp-runtime.json"
            pt_path.write_bytes(
                (json.dumps(forged_pt_interp, sort_keys=True) + "\n").encode("utf-8")
            )
            opened = _open_and_verify_binding(
                "selftest/forgedPtInterp",
                _test_file_binding(pt_path, root),
                report_file,
                absolute_allowed=False,
            )
            try:
                try:
                    _assert_runtime_closure_manifest(
                        _strict_bound_json(opened, "rehash-forged PT_INTERP"),
                        runtime_outer_python,
                        python_binding,
                        report_file,
                        "",
                    )
                except ContractError:
                    passed += 1
                    if verbose:
                        print("PASS external content forgery rehashed-pt-interp")
                else:
                    failures.append("rehashed wrong Python PT_INTERP was accepted")
            finally:
                opened.close()

            strace_binding = absolute_binding(Path("/usr/bin/strace"))
            strace_interpreter_binding = interpreter_binding(strace_binding)
            forged_strace_runtime = {
                **runtime_base,
                "pythonElfInterpreter": python_interpreter_binding,
                "traceToolRuntime": {
                    "executable": strace_binding,
                    "elfInterpreter": strace_interpreter_binding,
                    "libraries": [python_binding],
                },
            }
            strace_runtime_path = evidence / "forged-strace-runtime.json"
            strace_runtime_path.write_bytes(
                (json.dumps(forged_strace_runtime, sort_keys=True) + "\n").encode(
                    "utf-8"
                )
            )
            opened = _open_and_verify_binding(
                "selftest/forgedStraceRuntime",
                _test_file_binding(strace_runtime_path, root),
                report_file,
                absolute_allowed=False,
            )
            try:
                try:
                    _assert_runtime_closure_manifest(
                        _strict_bound_json(opened, "rehash-forged strace runtime"),
                        runtime_outer_python,
                        strace_binding,
                        report_file,
                        "",
                    )
                except ContractError:
                    passed += 1
                    if verbose:
                        print("PASS external content forgery rehashed-strace-runtime")
                else:
                    failures.append("rehashed incomplete strace runtime was accepted")
            finally:
                opened.close()
        finally:
            report_file.close()
    return passed, failures


def assert_output_tree_manifest_regression() -> None:
    output = ArchiveSummary(
        outer_bytes=7,
        outer_sha256="a" * 64,
        archive_root="fixture.json",
        manifest_sha256="b" * 64,
        content_digest="sha256:" + "c" * 64,
        release_id="fixture@1",
        package_id="fixture",
        package_version="1",
        counts={},
        closure_digest=None,
        definition_index_digest=None,
        registry={},
    )
    filename = "candidate.reconstructed.json.zip"
    relative_path = f"package/{filename}"

    def manifest(path: str) -> dict[str, Any]:
        digest = hashlib.sha256()
        digest.update(path.encode("utf-8"))
        digest.update(b"\0")
        digest.update(str(output.outer_bytes).encode("ascii"))
        digest.update(b"\0")
        digest.update(output.outer_sha256.encode("ascii"))
        digest.update(b"\n")
        return {
            "formatVersion": 1,
            "bytes": output.outer_bytes,
            "sha256": digest.hexdigest(),
            "files": [
                {
                    "path": path,
                    "bytes": output.outer_bytes,
                    "sha256": output.outer_sha256,
                }
            ],
        }

    _assert_output_tree_manifest(
        manifest(relative_path),
        output,
        f"output/run-a/{relative_path}",
        "runA",
    )
    try:
        _assert_output_tree_manifest(
            manifest(filename),
            output,
            f"output/run-a/{relative_path}",
            "runA",
        )
    except ContractError:
        pass
    else:
        raise ContractError("flat output-tree manifest path bypassed the run root")


def run_self_test(verbose: bool) -> tuple[int, list[str]]:
    failures: list[str] = []
    if distribution_version("jsonschema") != JSONSCHEMA_VERSION:
        failures.append(
            f"jsonschema must be {JSONSCHEMA_VERSION}, found "
            f"{distribution_version('jsonschema')}"
        )
        return 0, failures
    schema = load_json(SCHEMA_PATH)
    fixture = load_json(FIXTURE_PATH)
    if not isinstance(schema, dict) or schema.get("$id") != SCHEMA_ID:
        failures.append("trusted reverse-compilation schema ID differs")
        return 0, failures
    try:
        Draft202012Validator.check_schema(schema)
    except Exception as error:  # jsonschema exposes several schema-error subclasses
        failures.append(f"reverse-compilation schema is invalid: {error}")
        return 0, failures
    validator = Draft202012Validator(schema)
    positive = validate_report(fixture, validator)
    positive.extend(mathematics_fixture_diagnostics(fixture))
    if positive:
        failures.append(
            "positive reverse-compilation fixture failed: "
            + "; ".join(f"{item.code}@{item.location}" for item in positive)
        )
    elif verbose:
        print("PASS complete reverse-compilation report")

    for early_path in EARLY_FIXTURE_PATHS:
        early = load_json(early_path)
        early_diagnostics = validate_report(early, validator)
        if early_diagnostics:
            failures.append(
                f"{early_path.name} failed: "
                + "; ".join(
                    f"{item.code}@{item.location}" for item in early_diagnostics
                )
            )
        elif verbose:
            print(f"PASS truthful early receipt {early_path.name}")

    mutations = mutation_cases()
    for mutation in mutations:
        candidate = copy.deepcopy(fixture)
        mutation.mutate(candidate)
        codes = {
            item.code
            for item in (
                validate_report(candidate, validator)
                + mathematics_fixture_diagnostics(candidate)
            )
        }
        if mutation.expected_code not in codes:
            failures.append(
                f"{mutation.case_id}: expected {mutation.expected_code}, "
                f"got {sorted(codes) or 'no diagnostics'}"
            )
        elif verbose:
            print(f"PASS mutation {mutation.case_id} -> {mutation.expected_code}")

    for case_id, raw in raw_cases(fixture):
        try:
            strict_json_loads(raw, f"raw:{case_id}")
        except ContractError:
            if verbose:
                print(f"PASS raw JSON rejection {case_id}")
        else:
            failures.append(f"raw JSON case {case_id} was accepted")
    try:
        assert_output_tree_manifest_regression()
        if verbose:
            print("PASS nested output-tree manifest path binding")
    except ContractError as error:
        failures.append(f"output-tree manifest regression failed: {error}")
    external_count, external_failures = run_external_content_self_tests(verbose)
    failures.extend(external_failures)
    if external_count != 10:
        failures.append(
            f"external content/path self-tests passed {external_count}, expected 10"
        )
    return len(mutations), failures


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate the external FWU-OWL reverse-compilation receipt contract."
    )
    parser.add_argument("--report", type=Path, help="Validate one report instead of the fixture suite.")
    parser.add_argument("--self-test", action="store_true", help="Run fixture, mutation, and raw-JSON tests.")
    parser.add_argument("--verbose", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.report is not None and args.self_test:
        print("--report and --self-test are mutually exclusive", file=sys.stderr)
        return 2
    try:
        if distribution_version("jsonschema") != JSONSCHEMA_VERSION:
            raise ContractError(
                f"jsonschema must be {JSONSCHEMA_VERSION}, "
                f"found {distribution_version('jsonschema')}"
            )
        schema = load_json(SCHEMA_PATH)
        if not isinstance(schema, dict) or schema.get("$id") != SCHEMA_ID:
            raise ContractError("Trusted reverse-compilation schema ID differs.")
        Draft202012Validator.check_schema(schema)
        validator = Draft202012Validator(schema)
        if args.report is not None:
            report_file = open_report_securely(args.report)
            try:
                report = strict_json_loads(
                    report_file.read(), "securely opened reverse-compilation report"
                )
                diagnostics = validate_report(report, validator)
                if not diagnostics:
                    diagnostics.extend(evidence_binding_diagnostics(report, report_file))
                report_file.assert_unchanged()
                if diagnostics:
                    for item in diagnostics:
                        print(f"{item.code}\t{item.location}\t{item.message}", file=sys.stderr)
                    return 1
                print(f"FWU-OWL reverse-compilation report is valid: {args.report}")
                return 0
            finally:
                report_file.close()

        mutation_count, failures = run_self_test(args.verbose)
        if failures:
            for failure in failures:
                print(f"FAIL {failure}", file=sys.stderr)
            return 1
        print(
            "FWU-OWL reverse-compilation contract passed "
            f"(1 valid and 2 truthful early fixtures, {mutation_count} semantic mutations, "
            f"{len(raw_cases(load_json(FIXTURE_PATH)))} raw-JSON cases, "
            "10 rehashed-content/path attacks)."
        )
        return 0
    except (ContractError, OSError, ValueError) as error:
        print(f"FWU-OWL reverse-compilation contract error: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
