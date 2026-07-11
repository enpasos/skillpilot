#!/usr/bin/env python3
"""Independently validate one full-standalone-v1 curriculum ZIP.

The validator deliberately does not import the package builder. Repository contract
files are used only as the software trust root; every curriculum document, schema,
semantic contract, and binary payload is read from the ZIP itself.
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
import struct
import sys
import tempfile
import warnings
import zipfile
from collections import Counter, defaultdict, deque
from dataclasses import dataclass, field
from decimal import Decimal
from itertools import islice
from pathlib import Path
from typing import Any, Iterable, Mapping, Sequence

sys.dont_write_bytecode = True

from jsonschema import Draft202012Validator, FormatChecker  # noqa: E402
from referencing import Registry, Resource  # noqa: E402
from referencing.exceptions import NoSuchResource  # noqa: E402

import validate_curriculum_package_contracts as package_contracts  # noqa: E402
import validate_curriculum_runtime_catalog_contract as runtime_catalog_contracts  # noqa: E402
import validate_curriculum_schema_catalog_contract as schema_catalog_contracts  # noqa: E402


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONTRACT_DIR = REPO_ROOT / "contracts" / "curriculum-package" / "v1"
DEFAULT_FIXTURE_PATH = (
    DEFAULT_CONTRACT_DIR
    / "fixtures"
    / "full-standalone-package"
    / "adversarial-cases.json"
)

REPORT_FORMAT_VERSION = 2
VALIDATOR_ID = "skillpilot-full-standalone-package-validator-v2"
GATE_IDS = (
    "inventory",
    "runtimeCatalog",
    "offlineSchemaCatalog",
    "hardReferenceClosure",
    "contentDigest",
    "assetBytes",
)

MAX_CENTRAL_DIRECTORY_BYTES = 64 * 1024 * 1024
MAX_JSON_BYTES = 64 * 1024 * 1024
MAX_JSON_DEPTH = 128
MAX_JSON_NODES = 5_000_000
MAX_DIAGNOSTICS = 500
MAX_DIAGNOSTIC_MESSAGE = 800
READ_CHUNK_BYTES = 4 * 1024 * 1024
ZIP_EOCD_SIGNATURE = b"PK\x05\x06"
ZIP_LOCAL_HEADER_SIGNATURE = b"PK\x03\x04"
ZIP64_EXTRA_FIELD_ID = 0x0001
ALLOWED_COMPRESSION_METHODS = {zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED}
ALLOWED_GENERAL_PURPOSE_FLAGS = {0, 0x0800}

SEMANTIC_BINDING_NAMES = tuple(
    name for name, _schema_id in package_contracts.SEMANTIC_CONTRACT_BINDINGS
)
SEMANTIC_BINDING_SCHEMA_IDS = dict(package_contracts.SEMANTIC_CONTRACT_BINDINGS)


class ValidationFailure(RuntimeError):
    """A bounded package-validation operation could not continue safely."""


class TrustRootError(RuntimeError):
    """The external software trust root is unavailable or inconsistent."""


class DuplicateJsonKeyError(ValueError):
    def __init__(self, key: str) -> None:
        super().__init__(f"duplicate JSON object key {key!r}")
        self.key = key


@dataclass(frozen=True, order=True)
class Diagnostic:
    gate: str
    code: str
    location: str
    message: str

    def as_json(self) -> dict[str, str]:
        return {
            "gate": self.gate,
            "code": self.code,
            "location": self.location,
            "message": self.message,
        }


@dataclass
class DiagnosticCollector:
    diagnostics: list[Diagnostic] = field(default_factory=list)
    total_by_gate: Counter[str] = field(default_factory=Counter)
    codes_by_gate: dict[str, set[str]] = field(
        default_factory=lambda: {gate: set() for gate in GATE_IDS}
    )
    truncated: bool = False
    evaluated: set[str] = field(default_factory=set)

    def mark_evaluated(self, *gates: str) -> None:
        for gate in gates:
            if gate not in GATE_IDS:
                raise ValueError(f"Unknown validation gate {gate!r}")
            self.evaluated.add(gate)

    def add(self, gate: str, code: str, location: str, message: str) -> None:
        if gate not in GATE_IDS:
            raise ValueError(f"Unknown validation gate {gate!r}")
        self.evaluated.add(gate)
        self.total_by_gate[gate] += 1
        self.codes_by_gate[gate].add(code)
        if len(self.diagnostics) >= MAX_DIAGNOSTICS:
            self.truncated = True
            return
        compact = re.sub(r"\s+", " ", str(message)).strip()
        if len(compact) > MAX_DIAGNOSTIC_MESSAGE:
            compact = compact[: MAX_DIAGNOSTIC_MESSAGE - 1] + "…"
        self.diagnostics.append(Diagnostic(gate, code, location, compact))

    def extend_contract_diagnostics(
        self,
        gate: str,
        prefix: str,
        diagnostics: Iterable[Any],
    ) -> None:
        for item in diagnostics:
            location = str(getattr(item, "location", "/"))
            if prefix:
                location = prefix.rstrip("/") + (location if location.startswith("/") else f"/{location}")
            self.add(
                gate,
                str(getattr(item, "code", "CONTRACT_DIAGNOSTIC")),
                location,
                str(getattr(item, "message", item)),
            )

    def gate_report(self, gate: str) -> dict[str, Any]:
        if gate not in self.evaluated:
            status = "not-evaluated"
        elif self.total_by_gate[gate]:
            status = "failed"
        else:
            status = "passed"
        codes = sorted(self.codes_by_gate[gate])
        return {
            "status": status,
            "diagnosticCount": self.total_by_gate[gate],
            "diagnosticCodes": codes,
        }


@dataclass(frozen=True)
class TrustedContext:
    contract_dir: Path
    profile: dict[str, Any]
    profile_bytes: bytes
    profile_sha256: str
    roles: dict[str, dict[str, Any]]
    manifest_validator: Draft202012Validator
    trusted_schema_bytes: dict[str, bytes]
    trusted_schema_documents: dict[str, dict[str, Any]]
    trusted_schema_metadata: dict[str, tuple[str, str, int]]
    schema_catalog_validator: Draft202012Validator


@dataclass
class ArchiveSnapshot:
    path: Path
    outer_bytes: int
    outer_sha256: str
    archive_root: str | None
    infos_by_relative_path: dict[str, zipfile.ZipInfo]
    raw_documents: dict[str, bytes]
    actual_bytes: dict[str, int]
    actual_sha256: dict[str, str]
    content_prefixes: dict[str, bytes]
    manifest_raw: bytes | None = None
    manifest: dict[str, Any] | None = None


@dataclass
class PackageDocuments:
    values: dict[str, Any] = field(default_factory=dict)
    schema_registry: Registry[Any] | None = None
    semantic_contracts: dict[str, dict[str, Any]] = field(default_factory=dict)


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file_bounded(path: Path, limit: int) -> tuple[int, str]:
    digest = hashlib.sha256()
    count = 0
    with path.open("rb") as handle:
        while True:
            chunk = handle.read(min(READ_CHUNK_BYTES, limit + 1 - count))
            if not chunk:
                break
            count += len(chunk)
            if count > limit:
                raise ValidationFailure(f"input ZIP exceeds {limit} bytes during hashing")
            digest.update(chunk)
    return count, digest.hexdigest()


def sha256_descriptor_bounded(descriptor: int, limit: int) -> tuple[int, str]:
    digest = hashlib.sha256()
    count = 0
    offset = 0
    while True:
        chunk = os.pread(descriptor, min(READ_CHUNK_BYTES, limit + 1 - count), offset)
        if not chunk:
            break
        count += len(chunk)
        offset += len(chunk)
        if count > limit:
            raise ValidationFailure(f"input ZIP exceeds {limit} bytes during hashing")
        digest.update(chunk)
    return count, digest.hexdigest()


def reject_duplicate_keys(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise DuplicateJsonKeyError(key)
        result[key] = value
    return result


def reject_nonfinite(value: str) -> None:
    raise ValueError(f"non-RFC-8259 numeric constant {value!r}")


def validate_json_shape(
    value: Any,
    source: str,
    *,
    max_depth: int = MAX_JSON_DEPTH,
    max_nodes: int = MAX_JSON_NODES,
) -> None:
    nodes = 0
    stack: list[tuple[Any, int]] = [(value, 1)]
    while stack:
        current, depth = stack.pop()
        nodes += 1
        if nodes > max_nodes:
            raise ValidationFailure(f"JSON node count exceeds {max_nodes}: {source}")
        if depth > max_depth:
            raise ValidationFailure(f"JSON nesting exceeds {max_depth}: {source}")
        if isinstance(current, str):
            for character in current:
                codepoint = ord(character)
                if 0xD800 <= codepoint <= 0xDFFF:
                    raise ValidationFailure(f"unpaired surrogate in JSON string: {source}")
                if codepoint in {0xFFFE, 0xFFFF}:
                    raise ValidationFailure(f"forbidden Unicode noncharacter in JSON: {source}")
                if codepoint < 0x20 and codepoint not in {0x09, 0x0A, 0x0D}:
                    raise ValidationFailure(f"XML/RDF-unsafe control in JSON: {source}")
        elif isinstance(current, float) and not math.isfinite(current):
            raise ValidationFailure(f"non-finite JSON number: {source}")
        elif isinstance(current, dict):
            stack.extend((key, depth + 1) for key in current)
            stack.extend((child, depth + 1) for child in current.values())
        elif isinstance(current, list):
            stack.extend((child, depth + 1) for child in current)


def validate_json_lexical_limits(
    raw: bytes,
    source: str,
    *,
    max_depth: int,
    max_nodes: int,
) -> None:
    """Bound nesting/tokens before json.loads allocates the decoded object graph."""

    depth = 0
    nodes = 0
    in_string = False
    escaped = False
    in_scalar = False
    for byte in raw:
        if in_string:
            if escaped:
                escaped = False
            elif byte == 0x5C:
                escaped = True
            elif byte == 0x22:
                in_string = False
            continue
        if byte == 0x22:
            in_string = True
            in_scalar = False
            nodes += 1
        elif byte in {0x7B, 0x5B}:  # { [
            depth += 1
            nodes += 1
            in_scalar = False
            if depth > max_depth:
                raise ValidationFailure(f"JSON nesting exceeds {max_depth}: {source}")
        elif byte in {0x7D, 0x5D}:  # } ]
            depth -= 1
            in_scalar = False
            if depth < 0:
                break  # syntax parser will provide the precise failure
        elif byte in b"-0123456789tfn":
            if not in_scalar:
                nodes += 1
                in_scalar = True
        elif byte in {0x2C, 0x3A} or chr(byte).isspace():
            in_scalar = False
        if nodes > max_nodes:
            raise ValidationFailure(f"JSON lexical node count exceeds {max_nodes}: {source}")


def parse_json_bytes(
    raw: bytes,
    source: str,
    *,
    limit: int = MAX_JSON_BYTES,
    max_depth: int = MAX_JSON_DEPTH,
    max_nodes: int = MAX_JSON_NODES,
) -> Any:
    if len(raw) > limit:
        raise ValidationFailure(f"raw JSON exceeds {limit} bytes: {source}")
    validate_json_lexical_limits(
        raw,
        source,
        max_depth=max_depth,
        max_nodes=max_nodes,
    )
    try:
        value = json.loads(
            raw.decode("utf-8"),
            object_pairs_hook=reject_duplicate_keys,
            parse_constant=reject_nonfinite,
        )
    except DuplicateJsonKeyError:
        raise
    except (UnicodeError, json.JSONDecodeError, ValueError, RecursionError) as error:
        raise ValidationFailure(f"cannot parse strict JSON {source}: {error}") from error
    validate_json_shape(value, source, max_depth=max_depth, max_nodes=max_nodes)
    return value


def object_value(value: Any, source: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ValidationFailure(f"{source} must be a JSON object")
    return value


def load_trusted_context(contract_dir: Path) -> TrustedContext:
    contract_dir = contract_dir.resolve()
    try:
        profile_path = contract_dir / package_contracts.PROFILE_RELATIVE_PATH
        manifest_schema_path = contract_dir / package_contracts.SCHEMA_FILENAME
        profile_bytes = profile_path.read_bytes()
        manifest_schema_bytes = manifest_schema_path.read_bytes()
        profile = object_value(parse_json_bytes(profile_bytes, str(profile_path)), str(profile_path))
        manifest_schema = object_value(
            parse_json_bytes(manifest_schema_bytes, str(manifest_schema_path)),
            str(manifest_schema_path),
        )
        trusted_schema_paths = {
            binding_name: contract_dir / filename
            for binding_name, (_schema_id, filename) in package_contracts.TRUSTED_SCHEMA_BINDINGS.items()
        }
        roles = package_contracts.validate_trusted_contract(
            manifest_schema,
            profile,
            manifest_schema_path,
            profile_path,
            trusted_schema_paths,
        )
        trusted_schema_bytes: dict[str, bytes] = {}
        trusted_schema_documents: dict[str, dict[str, Any]] = {}
        for schema_id, filename in package_contracts.NORMATIVE_SCHEMA_FILES:
            path = contract_dir / filename
            raw = path.read_bytes()
            document = object_value(parse_json_bytes(raw, str(path)), str(path))
            if document.get("$id") != schema_id:
                raise TrustRootError(f"trusted schema ID mismatch: {path}")
            trusted_schema_bytes[schema_id] = raw
            trusted_schema_documents[schema_id] = document
        trusted_schema_metadata = {
            binding_name: (
                schema_id,
                sha256_bytes(trusted_schema_bytes[schema_id]),
                len(trusted_schema_bytes[schema_id]),
            )
            for binding_name, (schema_id, _filename) in package_contracts.TRUSTED_SCHEMA_BINDINGS.items()
        }
        catalog_schema = trusted_schema_documents[schema_catalog_contracts.CATALOG_SCHEMA_ID]
        return TrustedContext(
            contract_dir=contract_dir,
            profile=profile,
            profile_bytes=profile_bytes,
            profile_sha256=sha256_bytes(profile_bytes),
            roles=roles,
            manifest_validator=Draft202012Validator(manifest_schema, format_checker=FormatChecker()),
            trusted_schema_bytes=trusted_schema_bytes,
            trusted_schema_documents=trusted_schema_documents,
            trusted_schema_metadata=trusted_schema_metadata,
            schema_catalog_validator=Draft202012Validator(catalog_schema, format_checker=FormatChecker()),
        )
    except TrustRootError:
        raise
    except (OSError, ValidationFailure, package_contracts.ContractDefinitionError) as error:
        raise TrustRootError(f"cannot load trusted curriculum-package contracts: {error}") from error


def read_eocd(descriptor: int, size: int) -> tuple[int, int, int]:
    tail_size = min(size, 65_557)
    tail = os.pread(descriptor, tail_size, size - tail_size)
    index = tail.rfind(ZIP_EOCD_SIGNATURE)
    if index < 0 or len(tail) - index < 22:
        raise ValidationFailure("ZIP end-of-central-directory record is unavailable")
    signature, disk, central_disk, disk_entries, total_entries, central_size, central_offset, comment_length = struct.unpack_from(
        "<4s4H2LH", tail, index
    )
    del signature
    if index + 22 + comment_length != len(tail):
        raise ValidationFailure("ZIP EOCD/comment length is inconsistent or trailing bytes exist")
    if disk != 0 or central_disk != 0 or disk_entries != total_entries:
        raise ValidationFailure("multi-disk ZIP archives are forbidden")
    if total_entries == 0xFFFF or central_size == 0xFFFFFFFF or central_offset == 0xFFFFFFFF:
        raise ValidationFailure("ZIP64 archives are forbidden by the ZIP32 package profile")
    eocd_offset = size - tail_size + index
    if central_offset + central_size != eocd_offset:
        raise ValidationFailure("ZIP central-directory bounds are inconsistent")
    return total_entries, central_size, central_offset


def parse_extra_fields(raw: bytes, source: str) -> list[int]:
    identifiers: list[int] = []
    offset = 0
    while offset < len(raw):
        if len(raw) - offset < 4:
            raise ValidationFailure(f"truncated ZIP extra field: {source}")
        identifier, length = struct.unpack_from("<HH", raw, offset)
        offset += 4
        if offset + length > len(raw):
            raise ValidationFailure(f"ZIP extra-field length overflow: {source}")
        identifiers.append(identifier)
        offset += length
    return identifiers


@dataclass(frozen=True)
class LocalHeader:
    flags: int
    compression_method: int
    crc32: int
    compressed_bytes: int
    uncompressed_bytes: int
    filename: bytes
    extra: bytes
    payload_offset: int
    payload_end: int


def read_local_header(descriptor: int, info: zipfile.ZipInfo) -> LocalHeader:
    try:
        fixed = os.pread(descriptor, 30, info.header_offset)
        if len(fixed) != 30:
            raise ValidationFailure(f"truncated local ZIP header for {info.filename!r}")
        (
            signature,
            extract_version,
            flags,
            method,
            _modified_time,
            _modified_date,
            crc32,
            compressed_bytes,
            uncompressed_bytes,
            filename_bytes,
            extra_bytes,
        ) = struct.unpack("<4s5H3L2H", fixed)
        if signature != ZIP_LOCAL_HEADER_SIGNATURE:
            raise ValidationFailure(f"invalid local ZIP signature for {info.filename!r}")
        if extract_version > 20:
            raise ValidationFailure(
                f"local ZIP header requires version {extract_version / 10:.1f} for {info.filename!r}"
            )
        variable = os.pread(
            descriptor,
            filename_bytes + extra_bytes,
            info.header_offset + 30,
        )
        filename = variable[:filename_bytes]
        extra = variable[filename_bytes:]
        if len(filename) != filename_bytes or len(extra) != extra_bytes:
            raise ValidationFailure(f"truncated local ZIP name/extra field for {info.filename!r}")
    except OSError as error:
        raise ValidationFailure(f"cannot inspect local ZIP header {info.filename!r}: {error}") from error
    payload_offset = info.header_offset + 30 + filename_bytes + extra_bytes
    return LocalHeader(
        flags=flags,
        compression_method=method,
        crc32=crc32,
        compressed_bytes=compressed_bytes,
        uncompressed_bytes=uncompressed_bytes,
        filename=filename,
        extra=extra,
        payload_offset=payload_offset,
        payload_end=payload_offset + compressed_bytes,
    )


def archive_magic(prefix: bytes) -> bool:
    return (
        prefix.startswith((b"PK\x03\x04", b"PK\x05\x06", b"PK\x07\x08"))
        or prefix.startswith(b"\x1f\x8b")
        or prefix.startswith(b"7z\xbc\xaf\x27\x1c")
        or prefix.startswith((b"Rar!\x1a\x07\x00", b"Rar!\x1a\x07\x01\x00"))
        or prefix.startswith(b"BZh")
        or (len(prefix) >= 262 and prefix[257:262] == b"ustar")
    )


def prefix_collision(paths: Sequence[str]) -> tuple[str, str] | None:
    by_key = {package_contracts.portable_path_key(path): path for path in paths}
    for key, path in sorted(by_key.items()):
        segments = key.split("/")
        for length in range(1, len(segments)):
            parent = "/".join(segments[:length])
            if parent in by_key:
                return by_key[parent], path
    return None


def stream_zip_entry(
    archive: zipfile.ZipFile,
    info: zipfile.ZipInfo,
    *,
    capture: bool,
    capture_limit: int = MAX_JSON_BYTES,
) -> tuple[int, str, bytes, bytes | None]:
    digest = hashlib.sha256()
    count = 0
    prefix = bytearray()
    captured = bytearray() if capture else None
    with archive.open(info, "r") as handle:
        while True:
            chunk = handle.read(READ_CHUNK_BYTES)
            if not chunk:
                break
            count += len(chunk)
            digest.update(chunk)
            if len(prefix) < 512:
                prefix.extend(chunk[: 512 - len(prefix)])
            if captured is not None:
                if count > capture_limit:
                    captured = None
                else:
                    captured.extend(chunk)
    return count, digest.hexdigest(), bytes(prefix), bytes(captured) if captured is not None else None


def inspect_archive(
    path: Path,
    trusted: TrustedContext,
    collector: DiagnosticCollector,
) -> ArchiveSnapshot:
    collector.mark_evaluated("inventory")
    limits = trusted.profile["archiveLimits"]
    snapshot = ArchiveSnapshot(
        path=path,
        outer_bytes=0,
        outer_sha256="",
        archive_root=None,
        infos_by_relative_path={},
        raw_documents={},
        actual_bytes={},
        actual_sha256={},
        content_prefixes={},
    )
    descriptor = -1
    initial_metadata: os.stat_result | None = None
    try:
        lexical_metadata = path.lstat()
        if not stat.S_ISREG(lexical_metadata.st_mode) or stat.S_ISLNK(lexical_metadata.st_mode):
            raise ValidationFailure("input ZIP must be a regular non-symlink file")
        open_flags = os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0)
        descriptor = os.open(path, open_flags)
        initial_metadata = os.fstat(descriptor)
        if not stat.S_ISREG(initial_metadata.st_mode):
            raise ValidationFailure("opened input ZIP is not a regular file")
        if (lexical_metadata.st_dev, lexical_metadata.st_ino) != (
            initial_metadata.st_dev,
            initial_metadata.st_ino,
        ):
            raise ValidationFailure("input ZIP identity changed while opening")
        snapshot.outer_bytes = initial_metadata.st_size
        if snapshot.outer_bytes > limits["outerZipBytes"]:
            raise ValidationFailure(f"outer ZIP exceeds {limits['outerZipBytes']} bytes")
        declared_entries, central_size, central_offset = read_eocd(
            descriptor, snapshot.outer_bytes
        )
        if declared_entries > limits["entryCount"]:
            raise ValidationFailure(f"ZIP declares more than {limits['entryCount']} entries")
        if central_size > MAX_CENTRAL_DIRECTORY_BYTES:
            raise ValidationFailure(
                f"ZIP central directory exceeds {MAX_CENTRAL_DIRECTORY_BYTES} bytes"
            )
        hashed_bytes, snapshot.outer_sha256 = sha256_descriptor_bounded(
            descriptor, limits["outerZipBytes"]
        )
        if hashed_bytes != snapshot.outer_bytes or os.fstat(descriptor).st_size != snapshot.outer_bytes:
            raise ValidationFailure("input ZIP changed during bounded hashing")

        with os.fdopen(os.dup(descriptor), "rb") as archive_input, zipfile.ZipFile(
            archive_input, "r", allowZip64=False
        ) as archive:
            infos = archive.infolist()
            if archive.comment:
                collector.add(
                    "inventory",
                    "ZIP_COMMENT_FORBIDDEN",
                    "/zip",
                    "archive comments are forbidden by the deterministic ZIP32 profile",
                )
            if len(infos) != declared_entries:
                collector.add(
                    "inventory",
                    "ZIP_ENTRY_COUNT_MISMATCH",
                    "/zip",
                    f"EOCD declares {declared_entries} entries but parser found {len(infos)}",
                )
            names = [info.filename for info in infos]
            if len(names) != len(set(names)):
                collector.add("inventory", "ZIP_PATH_DUPLICATE", "/zip", "duplicate entry names")
            portable_names = [package_contracts.portable_path_key(name) for name in names]
            if len(portable_names) != len(set(portable_names)):
                collector.add(
                    "inventory", "ZIP_PORTABLE_PATH_COLLISION", "/zip", "portable path collision"
                )
            collision = prefix_collision(names)
            if collision is not None:
                collector.add(
                    "inventory",
                    "ZIP_PREFIX_COLLISION",
                    "/zip",
                    f"file/directory prefix collision: {collision[0]!r}, {collision[1]!r}",
                )

            total_uncompressed = 0
            total_compressed = 0
            local_layout: list[tuple[int, int, str]] = []
            for index, info in enumerate(infos):
                location = f"/zip/entries/{index}"
                if not package_contracts.path_is_safe(info.filename):
                    collector.add(
                        "inventory", "ZIP_PATH_UNSAFE", location, f"unsafe path {info.filename!r}"
                    )
                try:
                    encoded_path = info.filename.encode("utf-8")
                except UnicodeError:
                    encoded_path = b""
                    collector.add(
                        "inventory", "ZIP_PATH_NOT_UTF8", location, "path is not lossless UTF-8"
                    )
                if len(encoded_path) > limits["archivePathBytes"]:
                    collector.add(
                        "inventory",
                        "ZIP_PATH_BYTES_LIMIT",
                        location,
                        f"path exceeds {limits['archivePathBytes']} UTF-8 bytes",
                    )
                mode = (info.external_attr >> 16) & 0xFFFF
                if info.is_dir() or (info.external_attr & 0x10) or (mode and not stat.S_ISREG(mode)):
                    collector.add(
                        "inventory",
                        "ZIP_NON_REGULAR_ENTRY",
                        location,
                        "directory, symlink, or special entry is forbidden",
                    )
                if info.flag_bits & 0x1:
                    collector.add("inventory", "ZIP_ENCRYPTED_ENTRY", location, "encryption is forbidden")
                if info.flag_bits not in ALLOWED_GENERAL_PURPOSE_FLAGS:
                    collector.add(
                        "inventory",
                        "ZIP_FLAGS_FORBIDDEN",
                        location,
                        f"general-purpose flags 0x{info.flag_bits:04x} are not permitted; data descriptors are forbidden",
                    )
                if info.compress_type not in ALLOWED_COMPRESSION_METHODS:
                    collector.add(
                        "inventory",
                        "ZIP_COMPRESSION_METHOD_FORBIDDEN",
                        location,
                        f"compression method {info.compress_type} is unsupported",
                    )
                if info.file_size > limits["genericEntryBytes"]:
                    collector.add(
                        "inventory",
                        "ZIP_ENTRY_BYTES_LIMIT",
                        location,
                        f"entry exceeds {limits['genericEntryBytes']} bytes",
                    )
                if info.file_size / max(info.compress_size, 1) > limits["maxEntryCompressionRatio"]:
                    collector.add(
                        "inventory",
                        "ZIP_ENTRY_RATIO_LIMIT",
                        location,
                        f"compression ratio exceeds {limits['maxEntryCompressionRatio']}",
                    )
                if info.header_offset >= central_offset:
                    collector.add(
                        "inventory", "ZIP_LOCAL_HEADER_BOUNDS", location, "local header overlaps central directory"
                    )
                if info.extract_version > 20:
                    collector.add(
                        "inventory",
                        "ZIP_VERSION_FORBIDDEN",
                        location,
                        f"central entry requires ZIP version {info.extract_version / 10:.1f}",
                    )
                if info.comment:
                    collector.add(
                        "inventory", "ZIP_ENTRY_COMMENT_FORBIDDEN", location, "entry comments are forbidden"
                    )
                if info.extra:
                    try:
                        extras = parse_extra_fields(info.extra, info.filename)
                        code = "ZIP64_FORBIDDEN" if ZIP64_EXTRA_FIELD_ID in extras else "ZIP_EXTRA_FIELD_FORBIDDEN"
                        collector.add(
                            "inventory", code, location, "central-directory extra fields are forbidden"
                        )
                    except ValidationFailure as error:
                        collector.add("inventory", "ZIP_EXTRA_FIELD_INVALID", location, str(error))
                try:
                    local = read_local_header(descriptor, info)
                    expected_filename = info.filename.encode(
                        "utf-8" if info.flag_bits & 0x0800 else "cp437"
                    )
                    comparisons = (
                        ("flags", local.flags, info.flag_bits),
                        ("compression method", local.compression_method, info.compress_type),
                        ("CRC-32", local.crc32, info.CRC),
                        ("compressed bytes", local.compressed_bytes, info.compress_size),
                        ("uncompressed bytes", local.uncompressed_bytes, info.file_size),
                        ("filename", local.filename, expected_filename),
                    )
                    mismatches = [
                        f"{label}: local={actual!r}, central={expected!r}"
                        for label, actual, expected in comparisons
                        if actual != expected
                    ]
                    if mismatches:
                        collector.add(
                            "inventory",
                            "ZIP_LOCAL_CENTRAL_MISMATCH",
                            location,
                            "; ".join(mismatches),
                        )
                    if local.flags not in ALLOWED_GENERAL_PURPOSE_FLAGS:
                        collector.add(
                            "inventory",
                            "ZIP_LOCAL_FLAGS_FORBIDDEN",
                            location,
                            f"local general-purpose flags 0x{local.flags:04x} are forbidden",
                        )
                    if local.extra:
                        collector.add(
                            "inventory",
                            "ZIP_LOCAL_EXTRA_FIELD_FORBIDDEN",
                            location,
                            "local-header extra fields are forbidden",
                        )
                    if local.payload_end > central_offset:
                        collector.add(
                            "inventory",
                            "ZIP_LOCAL_PAYLOAD_BOUNDS",
                            location,
                            "local payload overlaps the central directory",
                        )
                    local_layout.append((info.header_offset, local.payload_end, info.filename))
                except (UnicodeError, ValidationFailure) as error:
                    collector.add("inventory", "ZIP_LOCAL_HEADER_INVALID", location, str(error))
                total_uncompressed += info.file_size
                total_compressed += info.compress_size

            ordered_layout = sorted(local_layout)
            expected_offset = 0
            for header_offset, payload_end, filename in ordered_layout:
                if header_offset != expected_offset:
                    collector.add(
                        "inventory",
                        "ZIP_LOCAL_LAYOUT_GAP_OR_OVERLAP",
                        "/zip",
                        f"expected local header at {expected_offset}, found {header_offset} for {filename!r}",
                    )
                expected_offset = payload_end
            if ordered_layout and expected_offset != central_offset:
                collector.add(
                    "inventory",
                    "ZIP_LOCAL_LAYOUT_CENTRAL_GAP",
                    "/zip",
                    f"local payload ends at {expected_offset}, central directory starts at {central_offset}",
                )

            if total_uncompressed > limits["totalUncompressedBytes"]:
                collector.add(
                    "inventory",
                    "ZIP_TOTAL_UNCOMPRESSED_LIMIT",
                    "/zip",
                    f"payload exceeds {limits['totalUncompressedBytes']} bytes",
                )
            if total_uncompressed / max(total_compressed, 1) > limits["maxTotalCompressionRatio"]:
                collector.add(
                    "inventory",
                    "ZIP_TOTAL_RATIO_LIMIT",
                    "/zip",
                    f"aggregate compression ratio exceeds {limits['maxTotalCompressionRatio']}",
                )

            roots = {name.split("/", 1)[0] for name in names if name}
            if len(roots) != 1:
                collector.add(
                    "inventory", "ZIP_ARCHIVE_ROOT_COUNT", "/zip", "exactly one archive root is required"
                )
            else:
                root = next(iter(roots))
                if not package_contracts.path_is_safe(root) or "/" in root:
                    collector.add(
                        "inventory", "ZIP_ARCHIVE_ROOT_UNSAFE", "/zip", f"unsafe archive root {root!r}"
                    )
                else:
                    snapshot.archive_root = root

            if snapshot.archive_root is None:
                os.close(descriptor)
                descriptor = -1
                return snapshot
            root_prefix = f"{snapshot.archive_root}/"
            relative_infos: dict[str, zipfile.ZipInfo] = {}
            for info in infos:
                if not info.filename.startswith(root_prefix):
                    collector.add(
                        "inventory",
                        "ZIP_ENTRY_OUTSIDE_ROOT",
                        "/zip",
                        f"entry is outside archive root: {info.filename!r}",
                    )
                    continue
                relative = info.filename[len(root_prefix) :]
                if not relative or not package_contracts.path_is_safe(relative):
                    collector.add(
                        "inventory",
                        "ZIP_RELATIVE_PATH_UNSAFE",
                        "/zip",
                        f"unsafe root-relative path {relative!r}",
                    )
                    continue
                if relative in relative_infos:
                    collector.add(
                        "inventory",
                        "ZIP_RELATIVE_PATH_DUPLICATE",
                        "/zip",
                        f"duplicate root-relative path {relative!r}",
                    )
                relative_infos[relative] = info
            snapshot.infos_by_relative_path = relative_infos

            manifest_path = "metadata/manifest.json"
            manifest_info = relative_infos.get(manifest_path)
            if manifest_info is None:
                collector.add(
                    "inventory", "MANIFEST_MISSING", f"/{manifest_path}", "package manifest is missing"
                )
                os.close(descriptor)
                descriptor = -1
                return snapshot
            try:
                _, _, _, snapshot.manifest_raw = stream_zip_entry(
                    archive,
                    manifest_info,
                    capture=True,
                    capture_limit=trusted.profile["manifestLimits"]["manifestBytes"],
                )
                if snapshot.manifest_raw is None:
                    raise ValidationFailure("manifest exceeds its bounded raw JSON limit")
                parsed = parse_json_bytes(
                    snapshot.manifest_raw,
                    manifest_path,
                    limit=trusted.profile["manifestLimits"]["manifestBytes"],
                    max_depth=limits["jsonMaxDepth"],
                    max_nodes=limits["jsonMaxNodes"],
                )
                snapshot.manifest = object_value(parsed, manifest_path)
            except DuplicateJsonKeyError as error:
                collector.add("inventory", "JSON_DUPLICATE_KEY", f"/{manifest_path}", str(error))
                os.close(descriptor)
                descriptor = -1
                return snapshot
            except (ValidationFailure, OSError, zipfile.BadZipFile, RuntimeError) as error:
                collector.add("inventory", "MANIFEST_READ_INVALID", f"/{manifest_path}", str(error))
                os.close(descriptor)
                descriptor = -1
                return snapshot

            if snapshot.manifest.get("archiveRoot") != snapshot.archive_root:
                collector.add(
                    "inventory",
                    "MANIFEST_ARCHIVE_ROOT_MISMATCH",
                    "/metadata/manifest.json/archiveRoot",
                    "manifest archiveRoot differs from the ZIP root",
                )

            manifest_diagnostics = package_contracts.validate_manifest(
                snapshot.manifest,
                trusted.manifest_validator,
                trusted.profile,
                trusted.roles,
                trusted.trusted_schema_metadata,
                trusted.profile_sha256,
                len(trusted.profile_bytes),
            )
            collector.extend_contract_diagnostics(
                "inventory", "/metadata/manifest.json", manifest_diagnostics
            )

            files_value = snapshot.manifest.get("files")
            records = [item for item in files_value if isinstance(item, dict)] if isinstance(files_value, list) else []
            record_by_path = {
                item["path"]: item
                for item in records
                if isinstance(item.get("path"), str)
            }
            excluded = set(trusted.profile["inventoryPolicy"]["excludedPaths"])
            actual_paths = set(relative_infos)
            expected_paths = set(record_by_path) | excluded
            if actual_paths != expected_paths:
                collector.add(
                    "inventory",
                    "INVENTORY_PATH_SET_MISMATCH",
                    "/metadata/manifest.json/files",
                    f"missing={sorted(expected_paths-actual_paths)[:10]}, unexpected={sorted(actual_paths-expected_paths)[:10]}",
                )

            for relative, info in sorted(relative_infos.items()):
                record = record_by_path.get(relative)
                media_type = record.get("mediaType") if isinstance(record, dict) else None
                is_json = relative.endswith(".json") or media_type in {
                    "application/json",
                    "application/schema+json",
                }
                if is_json and info.file_size > limits["jsonEntryBytes"]:
                    collector.add(
                        "offlineSchemaCatalog",
                        "JSON_BYTES_LIMIT",
                        f"/{relative}",
                        f"JSON artifact exceeds the profile limit {limits['jsonEntryBytes']} bytes",
                    )
                try:
                    byte_count, digest, prefix, raw = stream_zip_entry(
                        archive,
                        info,
                        capture=is_json or relative == "metadata/SHA256SUMS",
                        capture_limit=(
                            (limits["entryCount"] + 1)
                            * (64 + 2 + limits["archivePathBytes"] + 1)
                            if relative == "metadata/SHA256SUMS"
                            else limits["jsonEntryBytes"]
                        ),
                    )
                except (OSError, RuntimeError, zipfile.BadZipFile, EOFError) as error:
                    collector.add(
                        "inventory", "ZIP_ENTRY_READ_FAILED", f"/{relative}", f"cannot stream entry: {error}"
                    )
                    continue
                snapshot.actual_bytes[relative] = byte_count
                snapshot.actual_sha256[relative] = digest
                snapshot.content_prefixes[relative] = prefix
                if raw is not None:
                    snapshot.raw_documents[relative] = raw
                elif is_json:
                    collector.add(
                        "offlineSchemaCatalog",
                        "JSON_BYTES_LIMIT",
                        f"/{relative}",
                        f"JSON artifact exceeds {limits['jsonEntryBytes']} bytes",
                    )
                if byte_count != info.file_size:
                    collector.add(
                        "inventory",
                        "ZIP_STREAM_SIZE_MISMATCH",
                        f"/{relative}",
                        f"streamed {byte_count} bytes, central directory declares {info.file_size}",
                    )
                if archive_magic(prefix):
                    collector.add(
                        "inventory",
                        "NESTED_ARCHIVE_MAGIC",
                        f"/{relative}",
                        "nested archive payload magic is forbidden",
                    )
                if relative.casefold().endswith(package_contracts.ARCHIVE_SUFFIXES):
                    collector.add(
                        "inventory",
                        "NESTED_ARCHIVE_PATH",
                        f"/{relative}",
                        "nested archive path is forbidden",
                    )
                if record is not None:
                    if record.get("bytes") != byte_count:
                        collector.add(
                            "inventory",
                            "MANIFEST_FILE_BYTES_MISMATCH",
                            f"/metadata/manifest.json/files/{relative}/bytes",
                            f"manifest {record.get('bytes')!r}, actual {byte_count}",
                        )
                    if record.get("sha256") != digest:
                        collector.add(
                            "inventory",
                            "MANIFEST_FILE_HASH_MISMATCH",
                            f"/metadata/manifest.json/files/{relative}/sha256",
                            "manifest SHA-256 differs from package bytes",
                        )

            checksum_path = "metadata/SHA256SUMS"
            checksum_raw = snapshot.raw_documents.get(checksum_path)
            if checksum_raw is None:
                collector.add(
                    "inventory", "SHA256SUMS_MISSING", f"/{checksum_path}", "checksum inventory is missing"
                )
            else:
                expected_checksum = "".join(
                    f"{snapshot.actual_sha256[relative]}  {relative}\n"
                    for relative in sorted(snapshot.actual_sha256)
                    if relative != checksum_path
                ).encode("utf-8")
                if checksum_raw != expected_checksum:
                    collector.add(
                        "inventory",
                        "SHA256SUMS_MISMATCH",
                        f"/{checksum_path}",
                        "checksum file is not the exact sorted inventory of every other ZIP entry",
                    )
        final_bytes, final_sha256 = sha256_descriptor_bounded(
            descriptor, limits["outerZipBytes"]
        )
        final_metadata = os.fstat(descriptor)
        try:
            final_path_metadata = path.lstat()
        except OSError as error:
            raise ValidationFailure(f"input ZIP path disappeared during validation: {error}") from error
        if (
            final_bytes != snapshot.outer_bytes
            or final_sha256 != snapshot.outer_sha256
            or initial_metadata is None
            or (
                final_metadata.st_dev,
                final_metadata.st_ino,
                final_metadata.st_size,
                final_metadata.st_mtime_ns,
            )
            != (
                initial_metadata.st_dev,
                initial_metadata.st_ino,
                initial_metadata.st_size,
                initial_metadata.st_mtime_ns,
            )
            or (final_path_metadata.st_dev, final_path_metadata.st_ino)
            != (initial_metadata.st_dev, initial_metadata.st_ino)
        ):
            raise ValidationFailure("input ZIP changed during validation or path identity drifted")
        os.close(descriptor)
        descriptor = -1
    except (
        OSError,
        zipfile.BadZipFile,
        zipfile.LargeZipFile,
        RuntimeError,
        ValueError,
        ValidationFailure,
    ) as error:
        collector.add("inventory", "ZIP_PREFLIGHT_FAILED", "/zip", str(error))
    finally:
        if descriptor >= 0:
            os.close(descriptor)
    return snapshot


def json_error_location(error: Any, path: str) -> str:
    pointer = "/".join(str(part) for part in error.absolute_path)
    return f"/{path}" + (f"/{pointer}" if pointer else "")


def build_package_schema_registry(
    catalog: Mapping[str, Any],
    documents: Mapping[str, Any],
) -> Registry[Any]:
    def reject_retrieval(uri: str) -> NoSuchResource:
        raise NoSuchResource(ref=uri)

    registry: Registry[Any] = Registry(retrieve=reject_retrieval)
    entries = catalog.get("entries")
    if not isinstance(entries, list):
        raise ValidationFailure("schema catalog entries are unavailable")
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        schema_id = entry.get("id")
        path = entry.get("path")
        if not isinstance(schema_id, str) or not isinstance(path, str):
            continue
        document = documents.get(path)
        if not isinstance(document, dict):
            raise ValidationFailure(f"schema catalog path has no parsed document: {path}")
        registry = registry.with_resource(schema_id, Resource.from_contents(document))
    return registry


def parse_and_validate_package_documents(
    snapshot: ArchiveSnapshot,
    trusted: TrustedContext,
    collector: DiagnosticCollector,
) -> PackageDocuments:
    collector.mark_evaluated("offlineSchemaCatalog")
    result = PackageDocuments()
    manifest = snapshot.manifest
    if manifest is None:
        collector.add(
            "offlineSchemaCatalog",
            "SCHEMA_VALIDATION_PREREQUISITE_UNAVAILABLE",
            "/metadata/manifest.json",
            "a valid manifest is required before package-local schema validation",
        )
        return result
    files = manifest.get("files")
    records = [item for item in files if isinstance(item, dict)] if isinstance(files, list) else []
    json_paths = {
        record["path"]
        for record in records
        if isinstance(record.get("path"), str)
        and record.get("mediaType") in {"application/json", "application/schema+json"}
    }
    for path in sorted(json_paths):
        raw = snapshot.raw_documents.get(path)
        if raw is None:
            collector.add(
                "offlineSchemaCatalog", "JSON_PAYLOAD_UNAVAILABLE", f"/{path}", "bounded JSON bytes unavailable"
            )
            continue
        try:
            result.values[path] = parse_json_bytes(
                raw,
                path,
                limit=trusted.profile["archiveLimits"]["jsonEntryBytes"],
                max_depth=trusted.profile["archiveLimits"]["jsonMaxDepth"],
                max_nodes=trusted.profile["archiveLimits"]["jsonMaxNodes"],
            )
        except DuplicateJsonKeyError as error:
            collector.add("offlineSchemaCatalog", "JSON_DUPLICATE_KEY", f"/{path}", str(error))
        except ValidationFailure as error:
            collector.add("offlineSchemaCatalog", "JSON_PARSE_INVALID", f"/{path}", str(error))

    catalog_path = "schemas/catalog.json"
    catalog_raw = snapshot.raw_documents.get(catalog_path)
    catalog = result.values.get(catalog_path)
    if not isinstance(catalog_raw, bytes) or not isinstance(catalog, dict):
        collector.add(
            "offlineSchemaCatalog",
            "SCHEMA_CATALOG_UNAVAILABLE",
            f"/{catalog_path}",
            "package-local schema catalog is unavailable",
        )
        return result

    catalog_package_paths = {
        entry.get("path")
        for entry in catalog.get("entries", [])
        if isinstance(entry, dict) and isinstance(entry.get("path"), str)
    }
    package_files = {
        path: raw
        for path, raw in snapshot.raw_documents.items()
        if path in catalog_package_paths
    }
    catalog_diagnostics = schema_catalog_contracts.validate_catalog(
        catalog,
        catalog_raw,
        package_files,
        trusted.schema_catalog_validator,
        trusted.trusted_schema_bytes,
    )
    collector.extend_contract_diagnostics(
        "offlineSchemaCatalog", f"/{catalog_path}", catalog_diagnostics
    )
    manifest_binding_diagnostics = schema_catalog_contracts.validate_catalog_against_manifest(
        catalog,
        catalog_raw,
        manifest,
        trusted.trusted_schema_bytes,
        catalog_path,
    )
    collector.extend_contract_diagnostics(
        "offlineSchemaCatalog", f"/{catalog_path}", manifest_binding_diagnostics
    )

    try:
        result.schema_registry = build_package_schema_registry(catalog, result.values)
    except (ValidationFailure, NoSuchResource, ValueError) as error:
        collector.add(
            "offlineSchemaCatalog", "SCHEMA_REGISTRY_BUILD_FAILED", f"/{catalog_path}", str(error)
        )
        return result

    for record in records:
        path = record.get("path")
        schema_id = record.get("validationSchemaId")
        if not isinstance(path, str) or not isinstance(schema_id, str):
            continue
        document = result.values.get(path)
        schema = result.values.get(next(
            (
                item.get("path")
                for item in catalog.get("entries", [])
                if isinstance(item, dict) and item.get("id") == schema_id
            ),
            "",
        ))
        if document is None or not isinstance(schema, dict):
            collector.add(
                "offlineSchemaCatalog",
                "VALIDATION_SCHEMA_UNAVAILABLE",
                f"/{path}",
                f"cannot resolve package-local validation schema {schema_id!r}",
            )
            continue
        try:
            validator = Draft202012Validator(
                schema,
                registry=result.schema_registry,
                format_checker=FormatChecker(),
            )
            errors = list(islice(validator.iter_errors(document), 101))
            errors.sort(key=lambda item: tuple(str(part) for part in item.absolute_path))
            for error in errors[:100]:
                collector.add(
                    "offlineSchemaCatalog",
                    "PACKAGE_DOCUMENT_SCHEMA",
                    json_error_location(error, path),
                    error.message,
                )
            if len(errors) == 101:
                collector.add(
                    "offlineSchemaCatalog",
                    "PACKAGE_DOCUMENT_SCHEMA_TRUNCATED",
                    f"/{path}",
                    "more than 100 schema diagnostics; further iteration stopped",
                )
        except Exception as error:  # resolver failures must never trigger network access
            collector.add(
                "offlineSchemaCatalog",
                "PACKAGE_DOCUMENT_VALIDATION_FAILED",
                f"/{path}",
                f"offline schema validation failed: {error}",
            )

    bindings = manifest.get("contractBindings")
    bindings = bindings if isinstance(bindings, dict) else {}
    semantic_records = [record for record in records if record.get("role") == "semantic-contract"]
    bound_paths: set[str] = set()
    for binding_name in SEMANTIC_BINDING_NAMES:
        binding = bindings.get(binding_name)
        if not isinstance(binding, dict):
            collector.add(
                "offlineSchemaCatalog",
                "SEMANTIC_CONTRACT_BINDING_MISSING",
                f"/metadata/manifest.json/contractBindings/{binding_name}",
                "named semantic contract binding is missing",
            )
            continue
        path = binding.get("path")
        if not isinstance(path, str):
            continue
        bound_paths.add(path)
        document = result.values.get(path)
        if not isinstance(document, dict):
            continue
        identity_field = "registryId" if binding_name == "fieldSemanticsRegistry" else "profileId"
        if document.get(identity_field) != binding.get("id"):
            collector.add(
                "offlineSchemaCatalog",
                "SEMANTIC_CONTRACT_IDENTITY_MISMATCH",
                f"/{path}/{identity_field}",
                f"document identity must equal manifest binding {binding.get('id')!r}",
            )
        if document.get("$schema") != SEMANTIC_BINDING_SCHEMA_IDS[binding_name]:
            collector.add(
                "offlineSchemaCatalog",
                "SEMANTIC_CONTRACT_SCHEMA_MISMATCH",
                f"/{path}/$schema",
                "semantic contract uses the wrong validation schema",
            )
        if snapshot.actual_sha256.get(path) != binding.get("sha256"):
            collector.add(
                "offlineSchemaCatalog",
                "SEMANTIC_CONTRACT_HASH_MISMATCH",
                f"/{path}",
                "semantic contract bytes differ from the manifest binding",
            )
        result.semantic_contracts[binding_name] = document
    record_paths = {
        record.get("path") for record in semantic_records if isinstance(record.get("path"), str)
    }
    if record_paths != bound_paths or len(semantic_records) != len(SEMANTIC_BINDING_NAMES):
        collector.add(
            "offlineSchemaCatalog",
            "SEMANTIC_CONTRACT_SET_MISMATCH",
            "/metadata/manifest.json/contractBindings",
            f"bound={sorted(bound_paths)}, roleFiles={sorted(record_paths)}",
        )
    return result


def canonical_float(value: float) -> str:
    if not math.isfinite(value):
        raise ValidationFailure("canonical JSON permits finite numbers only")
    if value == 0:
        return "0"
    decimal = Decimal(repr(value))
    magnitude = abs(decimal)
    if Decimal("1e-6") <= magnitude < Decimal("1e21"):
        rendered = format(decimal, "f")
        if "." in rendered:
            rendered = rendered.rstrip("0").rstrip(".")
        return rendered
    sign = "-" if decimal.is_signed() else ""
    parts = decimal.copy_abs().as_tuple()
    digits = "".join(str(digit) for digit in parts.digits)
    exponent = len(digits) + parts.exponent - 1
    coefficient = digits[0] + (("." + digits[1:]) if len(digits) > 1 else "")
    return f"{sign}{coefficient}e{'+' if exponent >= 0 else ''}{exponent}"


def canonical_json_text(value: Any) -> str:
    if value is None:
        return "null"
    if value is True:
        return "true"
    if value is False:
        return "false"
    if isinstance(value, int):
        return str(value)
    if isinstance(value, float):
        return canonical_float(value)
    if isinstance(value, str):
        return json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":"))
    if isinstance(value, list):
        return "[" + ",".join(canonical_json_text(item) for item in value) + "]"
    if isinstance(value, dict):
        if not all(isinstance(key, str) for key in value):
            raise ValidationFailure("canonical JSON object keys must be strings")
        return "{" + ",".join(
            canonical_json_text(key) + ":" + canonical_json_text(value[key])
            for key in sorted(value)
        ) + "}"
    raise ValidationFailure(f"unsupported canonical JSON value {type(value).__name__}")


def canonical_json_bytes(value: Any) -> bytes:
    validate_json_shape(value, "canonical JSON input")
    return canonical_json_text(value).encode("utf-8")


def frame(value: str) -> bytes:
    raw = value.encode("utf-8")
    return len(raw).to_bytes(8, "big") + raw


def framed_digest(values: Iterable[str], *, prefixed: bool = False) -> str:
    digest = hashlib.sha256(b"".join(frame(value) for value in values)).hexdigest()
    return f"sha256:{digest}" if prefixed else digest


def escape_pointer_segment(value: str) -> str:
    return value.replace("~", "~0").replace("/", "~1")


def pointer(*segments: object) -> str:
    return "" if not segments else "/" + "/".join(
        escape_pointer_segment(str(segment)) for segment in segments
    )


def pointer_segments(value: str) -> tuple[str, ...]:
    if value == "":
        return ()
    if not value.startswith("/"):
        raise ValidationFailure(f"invalid JSON Pointer {value!r}")
    result: list[str] = []
    for raw in value[1:].split("/"):
        decoded = ""
        index = 0
        while index < len(raw):
            if raw[index] != "~":
                decoded += raw[index]
                index += 1
            elif index + 1 < len(raw) and raw[index + 1] in {"0", "1"}:
                decoded += "~" if raw[index + 1] == "0" else "/"
                index += 2
            else:
                raise ValidationFailure(f"invalid RFC-6901 escape in {value!r}")
        result.append(decoded)
    return tuple(result)


def resolve_pointer(value: Any, json_pointer: str) -> Any:
    current = value
    for segment in pointer_segments(json_pointer):
        if isinstance(current, dict):
            if segment not in current:
                raise ValidationFailure(f"JSON Pointer does not exist: {json_pointer}")
            current = current[segment]
        elif isinstance(current, list):
            if not segment.isdigit() or (segment.startswith("0") and segment != "0"):
                raise ValidationFailure(f"invalid array index in JSON Pointer: {json_pointer}")
            index = int(segment)
            if index >= len(current):
                raise ValidationFailure(f"JSON Pointer index out of bounds: {json_pointer}")
            current = current[index]
        else:
            raise ValidationFailure(f"JSON Pointer traverses a scalar: {json_pointer}")
    return current


def match_pattern(pattern: tuple[str, ...], concrete: tuple[str, ...]) -> bool:
    cache: dict[tuple[int, int], bool] = {}

    def visit(left: int, right: int) -> bool:
        state = (left, right)
        if state in cache:
            return cache[state]
        if left == len(pattern):
            answer = right == len(concrete)
        elif pattern[left] == "**":
            answer = visit(left + 1, right) or (
                right < len(concrete) and visit(left, right + 1)
            )
        elif right == len(concrete):
            answer = False
        else:
            answer = pattern[left] in {"*", concrete[right]} and visit(left + 1, right + 1)
        cache[state] = answer
        return answer

    return visit(0, 0)


def pattern_specificity(pattern: tuple[str, ...]) -> tuple[int, int, int]:
    return (
        sum(segment not in {"*", "**"} for segment in pattern),
        -sum(segment == "**" for segment in pattern),
        len(pattern),
    )


@dataclass(frozen=True)
class RegistryEntry:
    data: Mapping[str, Any]
    pattern: tuple[str, ...]

    @property
    def entry_id(self) -> str:
        return str(self.data["entryId"])

    @property
    def role(self) -> str:
        return str(self.data["artifactRole"])


class FieldRegistry:
    def __init__(self, value: Mapping[str, Any]) -> None:
        raw_entries = value.get("entries")
        if not isinstance(raw_entries, list):
            raise ValidationFailure("field-registry entries are missing")
        self.entries: list[RegistryEntry] = []
        self.by_role: dict[str, list[RegistryEntry]] = defaultdict(list)
        self.by_id: dict[str, RegistryEntry] = {}
        self._direct_cache: dict[tuple[str, str], RegistryEntry | None] = {}
        self._effective_cache: dict[tuple[str, str], RegistryEntry] = {}
        for raw in raw_entries:
            if not isinstance(raw, dict):
                raise ValidationFailure("malformed field-registry entry")
            entry = RegistryEntry(raw, pointer_segments(str(raw["pathPattern"])))
            if entry.entry_id in self.by_id:
                raise ValidationFailure(f"duplicate registry entryId {entry.entry_id!r}")
            self.entries.append(entry)
            self.by_role[entry.role].append(entry)
            self.by_id[entry.entry_id] = entry
        numeric_literals = sorted(
            {
                segment
                for entry in self.entries
                for segment in entry.pattern
                if segment not in {"*", "**"} and segment.isdigit()
            }
        )
        if numeric_literals:
            raise ValidationFailure(
                "field registry has cache-unsafe literal numeric paths: " + ", ".join(numeric_literals)
            )

    @staticmethod
    def cache_key(role: str, path: str) -> tuple[str, str]:
        segments = tuple("*" if segment.isdigit() else segment for segment in pointer_segments(path))
        return role, pointer(*segments)

    def direct(self, role: str, path: str) -> RegistryEntry | None:
        key = self.cache_key(role, path)
        if key in self._direct_cache:
            return self._direct_cache[key]
        concrete = pointer_segments(path)
        matches = [
            entry for entry in self.by_role.get(role, []) if match_pattern(entry.pattern, concrete)
        ]
        if not matches:
            self._direct_cache[key] = None
            return None
        best = max(pattern_specificity(entry.pattern) for entry in matches)
        selected = [entry for entry in matches if pattern_specificity(entry.pattern) == best]
        if len(selected) != 1:
            raise ValidationFailure(
                f"ambiguous field-registry match for {role}:{path}: "
                + ", ".join(entry.entry_id for entry in selected)
            )
        self._direct_cache[key] = selected[0]
        return selected[0]

    def effective(self, role: str, path: str) -> RegistryEntry:
        key = self.cache_key(role, path)
        cached = self._effective_cache.get(key)
        if cached is not None:
            return cached
        direct = self.direct(role, path)
        if direct is not None:
            self._effective_cache[key] = direct
            return direct
        segments = pointer_segments(path)
        for length in range(len(segments) - 1, 0, -1):
            ancestor = self.direct(role, pointer(*segments[:length]))
            if ancestor is None:
                continue
            mapping = ancestor.data.get("rdfMapping")
            if isinstance(mapping, dict) and mapping.get("strategy") == "registered-canonical-json-literal":
                self._effective_cache[key] = ancestor
                return ancestor
        raise ValidationFailure(f"unregistered package field {role}:{path}")


class Normalizer:
    def __init__(self, registry: FieldRegistry) -> None:
        self.registry = registry

    def normalize(self, role: str, value: Any, path: str = "") -> Any:
        if isinstance(value, dict):
            result: dict[str, Any] = {}
            for key in sorted(value):
                child_path = f"{path}/{escape_pointer_segment(key)}" if path else f"/{escape_pointer_segment(key)}"
                entry = self.registry.effective(role, child_path)
                if entry.data.get("classification") == "generated-non-semantic":
                    continue
                result[key] = self.normalize(role, value[key], child_path)
            return result
        if isinstance(value, list):
            entry = self.registry.direct(role, path)
            normalized = [
                self.normalize(role, child, f"{path}/{index}") for index, child in enumerate(value)
            ]
            if entry is not None and entry.data.get("classification") == "set":
                encoded = [canonical_json_bytes(child) for child in normalized]
                if len(encoded) != len(set(encoded)):
                    raise ValidationFailure(f"duplicate item in registry-declared set {role}:{path}")
                normalized = [child for _, child in sorted(zip(encoded, normalized), key=lambda item: item[0])]
            return normalized
        return value


def logical_record_digest(artifact: Mapping[str, Any], normalization: Mapping[str, Any]) -> str:
    return framed_digest(
        [
            str(normalization["semanticArtifactDigest"]["domain"]),
            str(artifact["role"]),
            str(artifact["logicalId"]),
            str(artifact["mediaType"]),
            str(artifact["normalizedBytes"]),
            str(artifact["normalizedSha256"]),
        ]
    )


def binary_record_digest(resource: Mapping[str, Any], normalization: Mapping[str, Any]) -> str:
    return framed_digest(
        [
            str(normalization["binaryAssetDigest"]["domain"]),
            str(resource["resourceId"]),
            str(resource["canonicalReference"]),
            str(resource["mediaType"]),
            str(resource["bytes"]),
            str(resource["sha256"]),
        ]
    )


def semantic_content_digest(index: Mapping[str, Any], normalization: Mapping[str, Any]) -> str:
    values: list[str] = [str(normalization["contentDigest"]["domain"])]
    for key in ("normalizationProfile", "fieldSemanticsRegistry"):
        binding = index[key]
        values.extend([str(binding["id"]), str(binding["version"]), str(binding["sha256"])])
    values.append("semantic-artifact-records")
    for artifact in sorted(index["logicalArtifacts"], key=lambda item: (item["role"], item["logicalId"])):
        values.append(str(artifact["recordSha256"]))
    values.append("binary-asset-records")
    for resource in sorted(index["binaryResources"], key=lambda item: item["resourceId"]):
        values.append(str(resource["recordSha256"]))
    return framed_digest(values, prefixed=True)


def definition_digest(
    key: Mapping[str, Any], normalized_body: Any, profile: Mapping[str, Any]
) -> str:
    payload = canonical_json_bytes({"body": normalized_body, "key": key}).decode("utf-8")
    return framed_digest([str(profile["definitionDigest"]["domain"]), payload], prefixed=True)


def definition_index_digest(
    definitions: Sequence[Mapping[str, Any]], profile: Mapping[str, Any]
) -> str:
    ordered = sorted(definitions, key=lambda item: canonical_json_bytes(item["key"]))
    values = [str(profile["definitionIndexDigest"]["domain"])]
    for definition in ordered:
        values.extend(
            [
                canonical_json_bytes(definition["key"]).decode("utf-8"),
                str(definition["ownerPackageId"]),
                str(definition["definitionDigest"]),
            ]
        )
    return framed_digest(values, prefixed=True)


def generated_document_digest(
    value: Mapping[str, Any],
    role: str,
    normalizer: Normalizer,
    profile: Mapping[str, Any],
) -> str:
    projection = normalizer.normalize(role, value)
    return framed_digest(
        [str(profile["domain"]), canonical_json_bytes(projection).decode("utf-8")],
        prefixed=True,
    )


def semantic_binding_records(manifest: Mapping[str, Any], kind: str) -> list[dict[str, Any]]:
    files = manifest.get("files")
    return [
        record
        for record in files
        if isinstance(record, dict)
        and isinstance(record.get("semanticBinding"), dict)
        and record["semanticBinding"].get("kind") == kind
    ] if isinstance(files, list) else []


def validate_content_and_assets(
    snapshot: ArchiveSnapshot,
    documents: PackageDocuments,
    trusted: TrustedContext,
    collector: DiagnosticCollector,
) -> tuple[FieldRegistry | None, dict[tuple[str, str], tuple[str, Any]]]:
    collector.mark_evaluated("contentDigest", "assetBytes")
    manifest = snapshot.manifest
    if manifest is None:
        collector.add(
            "contentDigest",
            "CONTENT_DIGEST_PREREQUISITE_UNAVAILABLE",
            "/metadata/manifest.json",
            "a valid manifest is required before semantic digest validation",
        )
        collector.add(
            "assetBytes",
            "ASSET_BYTES_PREREQUISITE_UNAVAILABLE",
            "/metadata/manifest.json",
            "a valid manifest is required before binary asset validation",
        )
        return None, {}
    semantic_index_records = [
        record
        for record in manifest.get("files", [])
        if isinstance(record, dict) and record.get("role") == "semantic-content-index"
    ]
    if len(semantic_index_records) != 1:
        collector.add(
            "contentDigest",
            "SEMANTIC_INDEX_SINGLETON",
            "/metadata/manifest.json/files",
            f"expected exactly one semantic-content-index, found {len(semantic_index_records)}",
        )
        return None, {}
    index_path = semantic_index_records[0].get("path")
    index = documents.values.get(index_path) if isinstance(index_path, str) else None
    normalization = documents.semantic_contracts.get("semanticNormalForm")
    registry_document = documents.semantic_contracts.get("fieldSemanticsRegistry")
    if not isinstance(index, dict) or not isinstance(normalization, dict) or not isinstance(registry_document, dict):
        collector.add(
            "contentDigest",
            "SEMANTIC_DIGEST_INPUT_UNAVAILABLE",
            "/metadata/semantic-content-index.json",
            "semantic index, normal-form profile, or field registry is unavailable",
        )
        collector.add(
            "assetBytes",
            "ASSET_BYTES_PREREQUISITE_UNAVAILABLE",
            "/metadata/semantic-content-index.json",
            "semantic index and normalization contracts are required before binary asset validation",
        )
        return None, {}
    try:
        registry = FieldRegistry(registry_document)
        normalizer = Normalizer(registry)
    except ValidationFailure as error:
        collector.add("contentDigest", "FIELD_REGISTRY_INVALID", "/schemas/profiles", str(error))
        return None, {}

    bindings = manifest.get("contractBindings")
    bindings = bindings if isinstance(bindings, dict) else {}
    for index_key, binding_name, identity_field in (
        ("normalizationProfile", "semanticNormalForm", "profileId"),
        ("fieldSemanticsRegistry", "fieldSemanticsRegistry", "registryId"),
    ):
        contract_binding = bindings.get(binding_name)
        document = documents.semantic_contracts.get(binding_name)
        index_binding = index.get(index_key)
        if not isinstance(contract_binding, dict) or not isinstance(document, dict) or not isinstance(index_binding, dict):
            continue
        expected = {
            "id": document.get(identity_field),
            "version": document.get("version"),
            "sha256": contract_binding.get("sha256"),
        }
        if index_binding != expected:
            collector.add(
                "contentDigest",
                "SEMANTIC_INDEX_CONTRACT_MISMATCH",
                f"/{index_path}/{index_key}",
                f"expected {expected!r}, found {index_binding!r}",
            )

    logical_records = semantic_binding_records(manifest, "logical-artifact")
    logical_by_identity: dict[tuple[str, str], dict[str, Any]] = {}
    logical_documents: dict[tuple[str, str], tuple[str, Any]] = {}
    for record in logical_records:
        binding = record["semanticBinding"]
        identity = (str(record.get("role")), str(binding.get("logicalId")))
        if identity in logical_by_identity:
            collector.add(
                "contentDigest", "LOGICAL_BINDING_DUPLICATE", "/metadata/manifest.json/files", repr(identity)
            )
        logical_by_identity[identity] = record
        path = record.get("path")
        document = documents.values.get(path) if isinstance(path, str) else None
        if isinstance(path, str) and document is not None:
            logical_documents[identity] = (path, document)

    raw_artifacts = index.get("logicalArtifacts")
    artifacts = [item for item in raw_artifacts if isinstance(item, dict)] if isinstance(raw_artifacts, list) else []
    index_identities = [(str(item.get("role")), str(item.get("logicalId"))) for item in artifacts]
    if len(index_identities) != len(set(index_identities)):
        collector.add(
            "contentDigest", "SEMANTIC_LOGICAL_RECORD_DUPLICATE", f"/{index_path}/logicalArtifacts", "duplicate role/logicalId"
        )
    if set(index_identities) != set(logical_by_identity):
        collector.add(
            "contentDigest",
            "SEMANTIC_LOGICAL_BINDING_SET_MISMATCH",
            f"/{index_path}/logicalArtifacts",
            f"missingBindings={sorted(set(index_identities)-set(logical_by_identity))[:10]}, extraBindings={sorted(set(logical_by_identity)-set(index_identities))[:10]}",
        )
    for artifact in artifacts:
        identity = (str(artifact.get("role")), str(artifact.get("logicalId")))
        record = logical_by_identity.get(identity)
        if record is None:
            continue
        path = record.get("path")
        document = documents.values.get(path) if isinstance(path, str) else None
        normalization_role = record["semanticBinding"].get("normalizationRole")
        if document is None or not isinstance(normalization_role, str):
            collector.add(
                "contentDigest", "LOGICAL_DOCUMENT_UNAVAILABLE", f"/{path}", f"cannot normalize {identity!r}"
            )
            continue
        try:
            normalized = canonical_json_bytes(normalizer.normalize(normalization_role, document))
            actual_bytes = len(normalized)
            actual_sha = sha256_bytes(normalized)
            if artifact.get("normalizedBytes") != actual_bytes:
                collector.add(
                    "contentDigest",
                    "LOGICAL_NORMALIZED_BYTES_MISMATCH",
                    f"/{index_path}/logicalArtifacts/{identity[0]}:{identity[1]}",
                    f"declared {artifact.get('normalizedBytes')!r}, actual {actual_bytes}",
                )
            if artifact.get("normalizedSha256") != actual_sha:
                collector.add(
                    "contentDigest",
                    "LOGICAL_NORMALIZED_HASH_MISMATCH",
                    f"/{index_path}/logicalArtifacts/{identity[0]}:{identity[1]}",
                    "normalized payload SHA-256 mismatch",
                )
            if artifact.get("mediaType") != record.get("mediaType"):
                collector.add(
                    "contentDigest", "LOGICAL_MEDIA_TYPE_MISMATCH", f"/{path}", "index and manifest media types differ"
                )
            expected_record = dict(artifact)
            expected_record["normalizedBytes"] = actual_bytes
            expected_record["normalizedSha256"] = actual_sha
            if artifact.get("recordSha256") != logical_record_digest(expected_record, normalization):
                collector.add(
                    "contentDigest",
                    "LOGICAL_RECORD_DIGEST_MISMATCH",
                    f"/{index_path}/logicalArtifacts/{identity[0]}:{identity[1]}",
                    "semantic artifact record digest mismatch",
                )
        except ValidationFailure as error:
            collector.add(
                "contentDigest", "LOGICAL_NORMALIZATION_FAILED", f"/{path}", str(error)
            )

    binary_records = semantic_binding_records(manifest, "binary-resource")
    manifest_binary: dict[str, dict[str, Any]] = {}
    for record in binary_records:
        resource_id = record["semanticBinding"].get("resourceId")
        if isinstance(resource_id, str):
            if resource_id in manifest_binary:
                collector.add(
                    "assetBytes", "BINARY_BINDING_DUPLICATE", "/metadata/manifest.json/files", resource_id
                )
            manifest_binary[resource_id] = record
    raw_resources = index.get("binaryResources")
    binary_resources = [item for item in raw_resources if isinstance(item, dict)] if isinstance(raw_resources, list) else []
    binary_ids = [str(item.get("resourceId")) for item in binary_resources]
    if len(binary_ids) != len(set(binary_ids)):
        collector.add(
            "assetBytes", "SEMANTIC_BINARY_RECORD_DUPLICATE", f"/{index_path}/binaryResources", "duplicate resourceId"
        )
    if set(binary_ids) != set(manifest_binary):
        collector.add(
            "assetBytes",
            "SEMANTIC_BINARY_BINDING_SET_MISMATCH",
            f"/{index_path}/binaryResources",
            f"missingBindings={sorted(set(binary_ids)-set(manifest_binary))[:10]}, extraBindings={sorted(set(manifest_binary)-set(binary_ids))[:10]}",
        )

    resource_index_records = [
        record for record in logical_records if record.get("role") == "resource-index"
    ]
    resource_index = None
    if len(resource_index_records) == 1:
        resource_index = documents.values.get(resource_index_records[0].get("path"))
    embedded_resources: dict[str, dict[str, Any]] = {}
    if isinstance(resource_index, dict) and isinstance(resource_index.get("resources"), list):
        for raw in resource_index["resources"]:
            if not isinstance(raw, dict) or raw.get("delivery") != "embedded":
                continue
            resource_id = raw.get("resourceId")
            if isinstance(resource_id, str):
                if resource_id in embedded_resources:
                    collector.add(
                        "assetBytes", "RESOURCE_INDEX_ID_DUPLICATE", "/data/resources/resource-index.json", resource_id
                    )
                embedded_resources[resource_id] = raw
    else:
        collector.add(
            "assetBytes", "RESOURCE_INDEX_UNAVAILABLE", "/data/resources", "resource index is unavailable"
        )
    if set(embedded_resources) != set(binary_ids):
        collector.add(
            "assetBytes",
            "RESOURCE_INDEX_BINARY_SET_MISMATCH",
            "/data/resources/resource-index.json/resources",
            f"indexOnly={sorted(set(embedded_resources)-set(binary_ids))[:10]}, semanticOnly={sorted(set(binary_ids)-set(embedded_resources))[:10]}",
        )

    total_image_bytes = 0
    for resource in binary_resources:
        resource_id = str(resource.get("resourceId"))
        record = manifest_binary.get(resource_id)
        indexed = embedded_resources.get(resource_id)
        if record is None:
            continue
        path = record.get("path")
        actual_bytes = snapshot.actual_bytes.get(path) if isinstance(path, str) else None
        actual_sha = snapshot.actual_sha256.get(path) if isinstance(path, str) else None
        prefix = snapshot.content_prefixes.get(path, b"") if isinstance(path, str) else b""
        canonical_reference = resource.get("canonicalReference")
        expected_path = canonical_reference[1:] if isinstance(canonical_reference, str) and canonical_reference.startswith("/") else None
        checks = {
            "manifestPath": path,
            "canonicalPath": expected_path,
            "semanticBytes": resource.get("bytes"),
            "manifestBytes": record.get("bytes"),
            "actualBytes": actual_bytes,
            "semanticSha256": resource.get("sha256"),
            "manifestSha256": record.get("sha256"),
            "actualSha256": actual_sha,
            "semanticMediaType": resource.get("mediaType"),
            "manifestMediaType": record.get("mediaType"),
        }
        if indexed is not None:
            checks.update(
                {
                    "resourceIndexPath": indexed.get("artifactPath"),
                    "resourceIndexPublicUrl": indexed.get("publicUrl"),
                    "resourceIndexBytes": indexed.get("bytes"),
                    "resourceIndexSha256": indexed.get("sha256"),
                    "resourceIndexMediaType": indexed.get("mediaType"),
                }
            )
        expected_public = f"/{path}" if isinstance(path, str) else None
        if not (
            isinstance(path, str)
            and path == expected_path
            and resource.get("bytes") == record.get("bytes") == actual_bytes
            and resource.get("sha256") == record.get("sha256") == actual_sha
            and resource.get("mediaType") == record.get("mediaType")
            and (
                indexed is None
                or (
                    indexed.get("artifactPath") == path
                    and indexed.get("publicUrl") == expected_public
                    and indexed.get("bytes") == actual_bytes
                    and indexed.get("sha256") == actual_sha
                    and indexed.get("mediaType") == resource.get("mediaType")
                )
            )
        ):
            collector.add(
                "assetBytes",
                "BINARY_RESOURCE_BINDING_MISMATCH",
                f"/{path or resource_id}",
                json.dumps(checks, ensure_ascii=False, sort_keys=True),
            )
        if isinstance(actual_bytes, int):
            total_image_bytes += actual_bytes
            if actual_bytes > trusted.profile["archiveLimits"]["goalVisualizationBytes"]:
                collector.add(
                    "assetBytes", "VISUALIZATION_BYTES_LIMIT", f"/{path}", f"image has {actual_bytes} bytes"
                )
        media_type = resource.get("mediaType")
        if media_type == "image/jpeg" and not prefix.startswith(b"\xff\xd8\xff"):
            collector.add("assetBytes", "JPEG_MAGIC_MISMATCH", f"/{path}", "invalid JPEG signature")
        if media_type == "image/png" and prefix[:8] != b"\x89PNG\r\n\x1a\n":
            collector.add("assetBytes", "PNG_MAGIC_MISMATCH", f"/{path}", "invalid PNG signature")
        try:
            expected_record = dict(resource)
            if resource.get("recordSha256") != binary_record_digest(expected_record, normalization):
                collector.add(
                    "contentDigest",
                    "BINARY_RECORD_DIGEST_MISMATCH",
                    f"/{index_path}/binaryResources/{resource_id}",
                    "binary asset record digest mismatch",
                )
        except (KeyError, TypeError, ValidationFailure) as error:
            collector.add(
                "contentDigest", "BINARY_RECORD_DIGEST_FAILED", f"/{index_path}/binaryResources/{resource_id}", str(error)
            )
    if total_image_bytes > trusted.profile["archiveLimits"]["imageLaneBytes"]:
        collector.add(
            "assetBytes",
            "IMAGE_LANE_BYTES_LIMIT",
            "/assets",
            f"image lane has {total_image_bytes} bytes",
        )

    try:
        calculated = semantic_content_digest(index, normalization)
        declared = index.get("contentDigest")
        for location, value in (
            (f"/{index_path}/contentDigest", declared),
            ("/metadata/manifest.json/contentDigest", manifest.get("contentDigest")),
        ):
            if value != calculated:
                collector.add(
                    "contentDigest",
                    "CONTENT_DIGEST_MISMATCH",
                    location,
                    f"declared {value!r}, calculated {calculated!r}",
                )
    except (KeyError, TypeError, ValidationFailure) as error:
        collector.add(
            "contentDigest", "CONTENT_DIGEST_CALCULATION_FAILED", f"/{index_path}", str(error)
        )
    return registry, logical_documents


def mapping_subset(value: Mapping[str, Any], keys: Sequence[str]) -> dict[str, Any]:
    return {key: value.get(key) for key in keys}


def validate_runtime_catalog(
    snapshot: ArchiveSnapshot,
    documents: PackageDocuments,
    collector: DiagnosticCollector,
) -> None:
    collector.mark_evaluated("runtimeCatalog")
    manifest = snapshot.manifest
    if manifest is None:
        collector.add(
            "runtimeCatalog",
            "RUNTIME_CATALOG_PREREQUISITE_UNAVAILABLE",
            "/metadata/manifest.json",
            "a valid manifest is required before runtime-catalog validation",
        )
        return
    records = [
        record
        for record in manifest.get("files", [])
        if isinstance(record, dict) and record.get("role") == "runtime-catalog"
    ]
    if len(records) != 1:
        collector.add(
            "runtimeCatalog", "RUNTIME_CATALOG_SINGLETON", "/metadata/manifest.json/files", str(len(records))
        )
        return
    path = records[0].get("path")
    catalog = documents.values.get(path) if isinstance(path, str) else None
    if not isinstance(catalog, dict):
        collector.add("runtimeCatalog", "RUNTIME_CATALOG_UNAVAILABLE", f"/{path}", "catalog is unavailable")
        return
    schema_id = records[0].get("validationSchemaId")
    schema = None
    if isinstance(schema_id, str):
        schema = next(
            (
                document
                for document in documents.values.values()
                if isinstance(document, dict) and document.get("$id") == schema_id
            ),
            None,
        )
    if isinstance(schema, dict):
        runtime_schema_validator = Draft202012Validator(
            schema,
            registry=documents.schema_registry,
            format_checker=FormatChecker(),
        )
        first_schema_error = next(runtime_schema_validator.iter_errors(catalog), None)
        if first_schema_error is not None:
            collector.add(
                "runtimeCatalog",
                "RUNTIME_CATALOG_SCHEMA_PREREQUISITE_FAILED",
                json_error_location(first_schema_error, str(path)),
                first_schema_error.message,
            )
            return
        try:
            diagnostics = runtime_catalog_contracts.validate_catalog(
                catalog,
                runtime_schema_validator,
            )
            diagnostics = [item for item in diagnostics if item.code != "EXAM_NODES_UNVERIFIED"]
            collector.extend_contract_diagnostics("runtimeCatalog", f"/{path}", diagnostics)
            binding_diagnostics = runtime_catalog_contracts.validate_catalog_against_manifest(
                catalog, manifest, str(path)
            )
            collector.extend_contract_diagnostics("runtimeCatalog", f"/{path}", binding_diagnostics)
        except (KeyError, TypeError, ValueError, runtime_catalog_contracts.ContractError) as error:
            collector.add(
                "runtimeCatalog",
                "RUNTIME_CATALOG_SEMANTIC_VALIDATION_FAILED",
                f"/{path}",
                str(error),
            )
            return
    else:
        collector.add(
            "runtimeCatalog",
            "RUNTIME_CATALOG_SCHEMA_UNAVAILABLE",
            f"/{path}",
            "package-local runtime-catalog schema is unavailable",
        )
        return

    def singleton_document(role: str) -> tuple[str | None, dict[str, Any] | None]:
        candidates = [
            record
            for record in manifest.get("files", [])
            if isinstance(record, dict) and record.get("role") == role
        ]
        if len(candidates) != 1:
            collector.add(
                "runtimeCatalog", "RUNTIME_INDEX_SINGLETON", "/metadata/manifest.json/files", f"{role}: {len(candidates)}"
            )
            return None, None
        candidate_path = candidates[0].get("path")
        value = documents.values.get(candidate_path) if isinstance(candidate_path, str) else None
        return candidate_path if isinstance(candidate_path, str) else None, value if isinstance(value, dict) else None

    view_index_path, view_index = singleton_document("composition-view-index")
    card_index_path, card_index = singleton_document("card-index")
    resource_index_path, resource_index = singleton_document("resource-index")
    artifact_indexes = catalog.get("artifactIndexes") if isinstance(catalog.get("artifactIndexes"), dict) else {}
    for key, expected in (
        ("compositionViewsPath", view_index_path),
        ("cardsPath", card_index_path),
        ("resourcesPath", resource_index_path),
    ):
        if artifact_indexes.get(key) != expected:
            collector.add(
                "runtimeCatalog", "RUNTIME_INDEX_PATH_MISMATCH", f"/{path}/artifactIndexes/{key}", f"expected {expected!r}"
            )

    manifest_records = [
        record for record in manifest.get("files", []) if isinstance(record, dict)
    ]

    def role_payloads(role: str) -> list[tuple[str, dict[str, Any]]]:
        payloads: list[tuple[str, dict[str, Any]]] = []
        for record in manifest_records:
            if record.get("role") != role or not isinstance(record.get("path"), str):
                continue
            payload = documents.values.get(record["path"])
            if not isinstance(payload, dict):
                collector.add(
                    "runtimeCatalog",
                    "RUNTIME_PAYLOAD_UNAVAILABLE",
                    f"/{record['path']}",
                    f"{role} payload is unavailable",
                )
                continue
            payloads.append((record["path"], payload))
        return payloads

    expected_view_index = sorted(
        [
            {
                "viewId": payload.get("viewId"),
                "landscapeId": payload.get("landscapeId"),
                "language": payload.get("language"),
                "scope": payload.get("scope"),
                "artifactPath": artifact_path,
            }
            for artifact_path, payload in role_payloads("composition-view")
        ],
        key=lambda item: str(item["viewId"]),
    )
    actual_view_index = (
        view_index.get("views") if isinstance(view_index, dict) else None
    )
    if actual_view_index != expected_view_index:
        collector.add(
            "runtimeCatalog",
            "VIEW_INDEX_EXACT_MISMATCH",
            f"/{view_index_path}/views",
            "view index must be the exact sorted projection of packaged view payloads, including language",
        )
    actual_view_records = [
        item for item in actual_view_index if isinstance(item, dict)
    ] if isinstance(actual_view_index, list) else []
    view_ids = [item.get("viewId") for item in actual_view_records]
    view_paths = [item.get("artifactPath") for item in actual_view_records]
    if len(view_ids) != len(set(view_ids)) or len(view_paths) != len(set(view_paths)):
        collector.add(
            "runtimeCatalog",
            "VIEW_INDEX_DUPLICATE",
            f"/{view_index_path}/views",
            "view IDs and artifact paths must be unique",
        )
    expected_runtime_views = [
        {
            "viewId": item["viewId"],
            "landscapeId": item["landscapeId"],
            "artifactPath": item["artifactPath"],
            "scope": item["scope"],
        }
        for item in expected_view_index
    ]
    if catalog.get("views") != expected_runtime_views:
        collector.add(
            "runtimeCatalog",
            "RUNTIME_VIEW_EXACT_MISMATCH",
            f"/{path}/views",
            "runtime views must be the exact packaged-view projection",
        )

    expected_card_index = sorted(
        [
            {
                "deckId": payload.get("deckId"),
                "landscapeId": payload.get("landscapeId"),
                "language": payload.get("language"),
                "title": payload.get("title"),
                "cardCount": len(payload.get("cards", [])) if isinstance(payload.get("cards"), list) else None,
                "artifactPath": artifact_path,
            }
            for artifact_path, payload in role_payloads("card-deck")
        ],
        key=lambda item: (str(item["deckId"]), str(item["language"])),
    )
    actual_card_index = card_index.get("decks") if isinstance(card_index, dict) else None
    if actual_card_index != expected_card_index:
        collector.add(
            "runtimeCatalog",
            "CARD_INDEX_EXACT_MISMATCH",
            f"/{card_index_path}/decks",
            "card index must exactly project deck identity, language, title, count, and path",
        )
    actual_deck_records = [
        item for item in actual_card_index if isinstance(item, dict)
    ] if isinstance(actual_card_index, list) else []
    deck_keys = [(item.get("deckId"), item.get("language")) for item in actual_deck_records]
    deck_paths = [item.get("artifactPath") for item in actual_deck_records]
    if len(deck_keys) != len(set(deck_keys)) or len(deck_paths) != len(set(deck_paths)):
        collector.add(
            "runtimeCatalog",
            "CARD_INDEX_DUPLICATE",
            f"/{card_index_path}/decks",
            "deck identity/locale pairs and artifact paths must be unique",
        )
    expected_runtime_decks = [
        {
            "deckId": item["deckId"],
            "locale": item["language"],
            "landscapeId": item["landscapeId"],
            "artifactPath": item["artifactPath"],
        }
        for item in expected_card_index
    ]
    if catalog.get("decks") != expected_runtime_decks:
        collector.add(
            "runtimeCatalog",
            "RUNTIME_DECK_EXACT_MISMATCH",
            f"/{path}/decks",
            "runtime decks must be the exact packaged-deck projection",
        )

    for runtime_item in [item for item in catalog.get("landscapes", []) if isinstance(item, dict)]:
        artifact_path = runtime_item.get("artifactPath")
        payload = documents.values.get(artifact_path) if isinstance(artifact_path, str) else None
        if not isinstance(payload, dict):
            continue
        expected = mapping_subset(
            runtime_item,
            ("landscapeId", "locale", "frameworkId", "subject", "country", "region"),
        )
        actual = mapping_subset(payload, tuple(expected))
        if expected != actual:
            collector.add(
                "runtimeCatalog", "LANDSCAPE_CATALOG_PAYLOAD_MISMATCH", f"/{artifact_path}", f"catalog={expected!r}, payload={actual!r}"
            )
    indexed_resources = (
        resource_index.get("resources") if isinstance(resource_index, dict) else None
    )
    if not isinstance(indexed_resources, list):
        collector.add(
            "runtimeCatalog",
            "RESOURCE_INDEX_PREREQUISITE_UNAVAILABLE",
            f"/{resource_index_path}",
            "resource index resources are unavailable",
        )
        indexed_resources = []
    resource_ids = [
        item.get("resourceId") for item in indexed_resources if isinstance(item, dict)
    ]
    if len(resource_ids) != len(set(resource_ids)):
        collector.add(
            "runtimeCatalog",
            "RESOURCE_INDEX_DUPLICATE",
            f"/{resource_index_path}/resources",
            "resource IDs must be unique",
        )
    expected_runtime_resources: list[dict[str, Any]] = []
    for indexed in indexed_resources:
        if not isinstance(indexed, dict):
            continue
        expected_runtime_resources.append(
            {
                "resourceId": indexed.get("resourceId"),
                "resourceKind": (
                    "goal-visualization"
                    if indexed.get("resourceKind") == "goal-visualization"
                    else "external-tool"
                ),
                "landscapeId": indexed.get("landscapeId"),
                "goalId": indexed.get("ownerGoalId"),
                "delivery": indexed.get("delivery"),
                "runtimeRequired": indexed.get("runtimeRequired"),
                "mediaType": indexed.get("mediaType"),
                **(
                    {"artifactPath": indexed.get("artifactPath")}
                    if indexed.get("delivery") == "embedded"
                    else {"externalUrl": indexed.get("externalUrl")}
                ),
            }
        )
    if catalog.get("resources") != expected_runtime_resources:
        collector.add(
            "runtimeCatalog",
            "RUNTIME_RESOURCE_EXACT_MISMATCH",
            f"/{path}/resources",
            "runtime resources must exactly project resource ownerGoalId as goalId and all delivery fields",
        )

    landscape_payloads = [
        payload for _artifact_path, payload in role_payloads("canonical-landscape")
    ]
    has_exam_nodes = any(
        isinstance(goal, dict) and isinstance(goal.get("examData"), dict)
        for landscape in landscape_payloads
        for goal in (landscape.get("goals", []) if isinstance(landscape.get("goals"), list) else [])
    )
    capabilities = catalog.get("capabilities")
    has_exam_capability = isinstance(capabilities, list) and "examNodes" in capabilities
    if has_exam_capability != has_exam_nodes:
        collector.add(
            "runtimeCatalog",
            "EXAM_NODES_CAPABILITY_MISMATCH",
            f"/{path}/capabilities",
            f"capability={has_exam_capability}, schema-valid examData payloads={has_exam_nodes}",
        )


def entity_key_id(value: Mapping[str, Any]) -> str:
    return canonical_json_bytes(value).decode("utf-8")


def validate_reference_registry_contract(registry: FieldRegistry, reference: Mapping[str, Any]) -> None:
    entry_id = str(reference["registryEntryId"])
    if entry_id not in registry.by_id:
        raise ValidationFailure(f"reference uses unknown registry entry {entry_id!r}")
    dependency = registry.by_id[entry_id].data.get("dependencySemantics")
    if not isinstance(dependency, dict):
        raise ValidationFailure(f"registry entry {entry_id!r} lacks dependency semantics")
    expected_mode = "hard-reference" if reference.get("strength") == "hard" else "soft-reference"
    if dependency.get("mode") != expected_mode:
        raise ValidationFailure(f"registry entry {entry_id!r} is not {expected_mode}")
    target = reference.get("target")
    target_kind = target.get("kind") if isinstance(target, dict) else None
    if dependency.get("targetKind") != target_kind:
        raise ValidationFailure(
            f"registry entry {entry_id!r} expects target {dependency.get('targetKind')!r}, found {target_kind!r}"
        )


@dataclass(frozen=True)
class DerivedClosure:
    document: dict[str, Any]
    definition_bodies: dict[str, Any]


CLOSURE_DERIVED_FIELD_CODES = {
    "definitions": "CLOSURE_DERIVED_DEFINITIONS_MISMATCH",
    "references": "CLOSURE_DERIVED_REFERENCES_MISMATCH",
    "seeds": "CLOSURE_DERIVED_SEEDS_MISMATCH",
    "embeddedFragments": "CLOSURE_DERIVED_FRAGMENTS_MISMATCH",
    "definitionIndexDigest": "DEFINITION_INDEX_DIGEST_MISMATCH",
    "closureDigest": "CLOSURE_DIGEST_MISMATCH",
}


def derived_closure_mismatch_codes(
    actual: Mapping[str, Any], expected: Mapping[str, Any]
) -> set[str]:
    codes = {
        code
        for field_name, code in CLOSURE_DERIVED_FIELD_CODES.items()
        if actual.get(field_name) != expected.get(field_name)
    }
    if actual != expected:
        codes.add("CLOSURE_EXACT_RECONSTRUCTION_MISMATCH")
    return codes


def collect_active_dependency_entries(
    registry: FieldRegistry,
    role: str,
    value: Any,
    path: str = "",
) -> set[str]:
    active: set[str] = set()
    if isinstance(value, dict):
        for key, child in value.items():
            child_path = (
                f"{path}/{escape_pointer_segment(key)}"
                if path
                else f"/{escape_pointer_segment(key)}"
            )
            entry = registry.effective(role, child_path)
            dependency = entry.data.get("dependencySemantics")
            if isinstance(dependency, dict) and dependency.get("mode") in {
                "hard-reference",
                "soft-reference",
            }:
                active.add(entry.entry_id)
            active.update(
                collect_active_dependency_entries(registry, role, child, child_path)
            )
    elif isinstance(value, list):
        for index, child in enumerate(value):
            active.update(
                collect_active_dependency_entries(
                    registry, role, child, f"{path}/{index}"
                )
            )
    return active


def derive_expected_closure(
    manifest: Mapping[str, Any],
    documents: PackageDocuments,
    registry: FieldRegistry,
    definition_profile: Mapping[str, Any],
) -> DerivedClosure:
    files = [item for item in manifest.get("files", []) if isinstance(item, dict)]
    logical_records = [
        record
        for record in files
        if isinstance(record.get("semanticBinding"), dict)
        and record["semanticBinding"].get("kind") == "logical-artifact"
    ]
    logical_by_path: dict[str, tuple[str, str, Any]] = {}
    for record in logical_records:
        path = record.get("path")
        binding = record["semanticBinding"]
        if not isinstance(path, str) or path in logical_by_path:
            raise ValidationFailure(f"ambiguous logical artifact path {path!r}")
        document = documents.values.get(path)
        if document is None:
            raise ValidationFailure(f"logical artifact payload unavailable: {path}")
        logical_by_path[path] = (
            str(record.get("role")),
            str(binding.get("logicalId")),
            document,
        )

    runtime_records = [record for record in logical_records if record.get("role") == "runtime-catalog"]
    resource_records = [record for record in logical_records if record.get("role") == "resource-index"]
    if len(runtime_records) != 1 or len(resource_records) != 1:
        raise ValidationFailure("closure derivation requires singleton runtime and resource indexes")
    runtime_path = str(runtime_records[0]["path"])
    resource_path = str(resource_records[0]["path"])
    runtime_catalog = documents.values.get(runtime_path)
    resource_index = documents.values.get(resource_path)
    if not isinstance(runtime_catalog, dict) or not isinstance(resource_index, dict):
        raise ValidationFailure("runtime catalog or resource index is unavailable")
    embedded_catalog_entries = [
        item
        for item in runtime_catalog.get("landscapes", [])
        if isinstance(item, dict) and item.get("role") == "embedded-fragment"
    ]
    embedded_records = [
        record for record in logical_records if record.get("role") == "embedded-goal-dependency"
    ]
    if embedded_catalog_entries or embedded_records:
        raise ValidationFailure(
            "embedded dependency closure reconstruction is not implemented; validation fails closed"
        )

    normalizer = Normalizer(registry)
    package_id = str(manifest.get("packageId"))
    definitions: list[dict[str, Any]] = []
    definition_by_id: dict[str, dict[str, Any]] = {}
    definition_bodies: dict[str, Any] = {}

    def add_definition(
        key: dict[str, Any],
        role: str,
        logical_id: str,
        artifact_path: str,
        json_pointer: str,
        body: Any,
        body_path: str,
    ) -> None:
        encoded = entity_key_id(key)
        if encoded in definition_by_id:
            raise ValidationFailure(f"duplicate derived typed definition key {encoded}")
        normalized = normalizer.normalize(role, body, body_path)
        definition = {
            "key": key,
            "provision": "owned",
            "artifactBinding": {
                "role": role,
                "logicalId": logical_id,
                "path": artifact_path,
                "jsonPointer": json_pointer,
            },
            "ownerPackageId": package_id,
            "definitionDigest": definition_digest(key, normalized, definition_profile),
        }
        definitions.append(definition)
        definition_by_id[encoded] = definition
        definition_bodies[encoded] = body

    landscape_keys: dict[str, dict[str, Any]] = {}
    goal_keys: dict[str, dict[str, Any]] = {}
    goal_landscape: dict[str, str] = {}
    unit_keys: dict[tuple[str, str], dict[str, Any]] = {}
    placement_keys: dict[tuple[str, int], dict[str, Any]] = {}
    competency_keys: dict[tuple[str, str], dict[str, Any]] = {}
    landscape_documents: list[tuple[str, str, dict[str, Any]]] = []

    for catalog_entry in runtime_catalog.get("landscapes", []):
        if not isinstance(catalog_entry, dict) or catalog_entry.get("role") == "embedded-fragment":
            continue
        artifact_path = catalog_entry.get("artifactPath")
        landscape_id = catalog_entry.get("landscapeId")
        if not isinstance(artifact_path, str) or not isinstance(landscape_id, str):
            raise ValidationFailure("runtime landscape identity/path is malformed")
        logical = logical_by_path.get(artifact_path)
        if logical is None or logical[0] != "canonical-landscape" or not isinstance(logical[2], dict):
            raise ValidationFailure(f"runtime landscape does not bind a canonical payload: {artifact_path}")
        role, logical_id, landscape = logical
        if landscape.get("landscapeId") != landscape_id or logical_id != landscape_id:
            raise ValidationFailure(f"canonical landscape identity mismatch: {artifact_path}")
        if landscape_id in landscape_keys:
            raise ValidationFailure(f"duplicate landscape ID {landscape_id!r}")
        landscape_key = {"kind": "landscape", "id": landscape_id}
        landscape_keys[landscape_id] = landscape_key
        landscape_documents.append((artifact_path, logical_id, landscape))
        add_definition(
            landscape_key,
            role,
            logical_id,
            artifact_path,
            "",
            landscape,
            "",
        )
        goals = landscape.get("goals", [])
        if not isinstance(goals, list):
            raise ValidationFailure(f"landscape goals are malformed: {artifact_path}")
        for index, goal in enumerate(goals):
            if not isinstance(goal, dict) or not isinstance(goal.get("id"), str):
                raise ValidationFailure(f"malformed goal at {artifact_path}/goals/{index}")
            goal_id = goal["id"]
            if goal_id in goal_keys:
                raise ValidationFailure(f"duplicate global goal ID {goal_id!r}")
            key = {"kind": "goal", "id": goal_id}
            goal_keys[goal_id] = key
            goal_landscape[goal_id] = landscape_id
            add_definition(
                key,
                role,
                logical_id,
                artifact_path,
                pointer("goals", index),
                goal,
                pointer("goals", index),
            )
        for index, unit in enumerate(landscape.get("programUnits", [])):
            if not isinstance(unit, dict) or not isinstance(unit.get("id"), str):
                raise ValidationFailure(f"malformed program unit in {artifact_path}")
            identity = (landscape_id, unit["id"])
            if identity in unit_keys:
                raise ValidationFailure(f"duplicate program-unit identity {identity!r}")
            key = {"kind": "program-unit", "landscapeId": landscape_id, "id": unit["id"]}
            unit_keys[identity] = key
            add_definition(
                key,
                role,
                logical_id,
                artifact_path,
                pointer("programUnits", index),
                unit,
                pointer("programUnits", index),
            )
        for index, placement in enumerate(landscape.get("goalPlacements", [])):
            if not isinstance(placement, dict):
                raise ValidationFailure(f"malformed placement in {artifact_path}")
            identity_profile = definition_profile.get("derivedIdentities", {}).get("placement")
            if not isinstance(identity_profile, dict):
                raise ValidationFailure("definition profile lacks placement identity semantics")
            normalized_placement = normalizer.normalize(
                role, placement, pointer("goalPlacements", index)
            )
            placement_hash = framed_digest(
                [
                    str(identity_profile["domain"]),
                    canonical_json_bytes(normalized_placement).decode("utf-8"),
                ]
            )
            placement_id = str(identity_profile["outputPrefix"]) + placement_hash[
                : int(identity_profile["hexLength"])
            ]
            key = {"kind": "placement", "landscapeId": landscape_id, "id": placement_id}
            placement_keys[(landscape_id, index)] = key
            add_definition(
                key,
                role,
                logical_id,
                artifact_path,
                pointer("goalPlacements", index),
                placement,
                pointer("goalPlacements", index),
            )
        for index, competency in enumerate(landscape.get("competencyCatalog", [])):
            if not isinstance(competency, dict) or not isinstance(competency.get("id"), str):
                raise ValidationFailure(f"malformed competency entry in {artifact_path}")
            identity = (landscape_id, competency["id"])
            if identity in competency_keys:
                raise ValidationFailure(f"duplicate competency identity {identity!r}")
            key = {
                "kind": "competency-entry",
                "landscapeId": landscape_id,
                "id": competency["id"],
            }
            competency_keys[identity] = key
            add_definition(
                key,
                role,
                logical_id,
                artifact_path,
                pointer("competencyCatalog", index),
                competency,
                pointer("competencyCatalog", index),
            )

    view_keys: dict[str, dict[str, Any]] = {}
    view_documents: list[tuple[str, dict[str, Any]]] = []
    for record in logical_records:
        if record.get("role") != "composition-view":
            continue
        artifact_path = str(record["path"])
        logical_id = str(record["semanticBinding"]["logicalId"])
        view = documents.values.get(artifact_path)
        if not isinstance(view, dict) or not isinstance(view.get("viewId"), str):
            raise ValidationFailure(f"composition view unavailable: {artifact_path}")
        view_id = view["viewId"]
        if logical_id != view_id or view_id in view_keys:
            raise ValidationFailure(f"composition-view identity mismatch or duplicate: {view_id}")
        key = {"kind": "view", "id": view_id}
        view_keys[view_id] = key
        view_documents.append((artifact_path, view))
        add_definition(key, "composition-view", logical_id, artifact_path, "", view, "")

    deck_keys_by_path: dict[str, dict[str, Any]] = {}
    card_keys: dict[tuple[str, str, str], dict[str, Any]] = {}
    deck_documents: list[tuple[str, dict[str, Any]]] = []
    for record in logical_records:
        if record.get("role") != "card-deck":
            continue
        artifact_path = str(record["path"])
        logical_id = str(record["semanticBinding"]["logicalId"])
        deck = documents.values.get(artifact_path)
        if not isinstance(deck, dict):
            raise ValidationFailure(f"card deck unavailable: {artifact_path}")
        deck_id = deck.get("deckId")
        locale = deck.get("language")
        if not isinstance(deck_id, str) or not isinstance(locale, str) or logical_id != f"{deck_id}@{locale}":
            raise ValidationFailure(f"card-deck identity mismatch: {artifact_path}")
        key = {"kind": "deck", "id": deck_id, "locale": locale}
        encoded = entity_key_id(key)
        if encoded in definition_by_id:
            raise ValidationFailure(f"duplicate deck identity {encoded}")
        deck_keys_by_path[artifact_path] = key
        deck_documents.append((artifact_path, deck))
        add_definition(key, "card-deck", logical_id, artifact_path, "", deck, "")
        cards = deck.get("cards", [])
        if not isinstance(cards, list):
            raise ValidationFailure(f"card collection malformed: {artifact_path}")
        for index, card in enumerate(cards):
            if not isinstance(card, dict) or not isinstance(card.get("id"), str):
                raise ValidationFailure(f"malformed card at {artifact_path}/cards/{index}")
            card_key = {
                "kind": "card",
                "deckId": deck_id,
                "locale": locale,
                "id": card["id"],
            }
            card_identity = (deck_id, locale, card["id"])
            if card_identity in card_keys:
                raise ValidationFailure(f"duplicate card identity {card_identity!r}")
            card_keys[card_identity] = card_key
            add_definition(
                card_key,
                "card-deck",
                logical_id,
                artifact_path,
                pointer("cards", index),
                card,
                pointer("cards", index),
            )

    resource_logical = logical_by_path[resource_path]
    resource_logical_id = resource_logical[1]
    resources = resource_index.get("resources", [])
    if not isinstance(resources, list):
        raise ValidationFailure("resource-index resources are malformed")
    resource_keys: dict[str, dict[str, Any]] = {}
    resource_by_owner_order: dict[tuple[str, int], dict[str, Any]] = {}
    for index, resource in enumerate(resources):
        if not isinstance(resource, dict) or not isinstance(resource.get("resourceId"), str):
            raise ValidationFailure(f"malformed resource at {resource_path}/resources/{index}")
        resource_id = resource["resourceId"]
        if resource_id in resource_keys:
            raise ValidationFailure(f"duplicate resource ID {resource_id!r}")
        key = {"kind": "resource", "id": resource_id}
        resource_keys[resource_id] = key
        owner_order = (str(resource.get("ownerGoalId")), int(resource.get("order", -1)))
        if owner_order in resource_by_owner_order:
            raise ValidationFailure(f"duplicate resource owner/order {owner_order!r}")
        resource_by_owner_order[owner_order] = resource
        add_definition(
            key,
            "resource-index",
            resource_logical_id,
            resource_path,
            pointer("resources", index),
            resource,
            pointer("resources", index),
        )

    references: list[dict[str, Any]] = []
    emitted_dependency_entries: set[str] = set()

    def validate_resolved_value(
        source: Mapping[str, Any],
        source_pointer: str,
        registry_entry_id: str,
        target: Mapping[str, Any],
    ) -> None:
        source_id = entity_key_id(source)
        target_id = entity_key_id(target)
        source_body = definition_bodies.get(source_id)
        target_body = definition_bodies.get(target_id)
        if source_body is None or target_body is None:
            raise ValidationFailure("derived reference source/target definition is unavailable")
        resolved = resolve_pointer(source_body, source_pointer)
        entry = registry.by_id.get(registry_entry_id)
        dependency = entry.data.get("dependencySemantics") if entry is not None else None
        if not isinstance(dependency, dict):
            raise ValidationFailure(f"registry dependency entry unavailable: {registry_entry_id}")
        value_mode = dependency.get("valueMode")
        if value_mode == "scalar":
            expected_scalar = target.get("uri") if target.get("kind") == "external-uri" else target.get("id")
            if resolved != expected_scalar:
                raise ValidationFailure(
                    f"source pointer value {resolved!r} does not identify target {expected_scalar!r}"
                )
        elif value_mode == "list-items":
            expected_item = target_body if isinstance(resolved, dict) else target.get("id")
            if resolved != expected_item:
                raise ValidationFailure(
                    f"source pointer record does not equal target definition for {registry_entry_id}"
                )
        elif value_mode == "record-membership":
            if resolved != target_body:
                raise ValidationFailure(
                    f"source pointer record does not equal target definition for {registry_entry_id}"
                )
        elif value_mode == "artifact-path-lookup":
            target_path = definition_by_id[target_id]["artifactBinding"]["path"]
            if resolved != target_path:
                raise ValidationFailure(
                    f"artifact-path reference {resolved!r} does not equal target path {target_path!r}"
                )
        elif value_mode == "owner-and-position":
            segments = pointer_segments(source_pointer)
            if not segments or not segments[-1].isdigit():
                raise ValidationFailure("owner-and-position reference lacks a numeric position")
            if not isinstance(resolved, dict):
                raise ValidationFailure("owner-and-position source value is not a record")
            if not (
                target_body.get("ownerGoalId") == source.get("id")
                and target_body.get("order") == int(segments[-1])
            ):
                raise ValidationFailure("resource target does not match source owner and link position")
        else:
            raise ValidationFailure(
                f"unsupported dependency valueMode {value_mode!r} for {registry_entry_id}"
            )

    def hard(
        source: Mapping[str, Any],
        source_pointer: str,
        registry_entry_id: str,
        target: Mapping[str, Any],
    ) -> None:
        target_definition = definition_by_id.get(entity_key_id(target))
        if target_definition is None:
            raise ValidationFailure(f"hard-reference target has no derived definition: {target}")
        validate_resolved_value(source, source_pointer, registry_entry_id, target)
        reference = {
            "source": dict(source),
            "sourcePointer": source_pointer,
            "registryEntryId": registry_entry_id,
            "strength": "hard",
            "target": dict(target),
            "resolution": target_definition["provision"],
        }
        validate_reference_registry_contract(registry, reference)
        emitted_dependency_entries.add(registry_entry_id)
        references.append(reference)

    def soft_uri(
        source: Mapping[str, Any],
        source_pointer: str,
        registry_entry_id: str,
        uri: str,
    ) -> None:
        target = {"kind": "external-uri", "uri": uri}
        source_body = definition_bodies[entity_key_id(source)]
        if resolve_pointer(source_body, source_pointer) != uri:
            raise ValidationFailure("soft URI sourcePointer does not bind the emitted URI")
        reference = {
            "source": dict(source),
            "sourcePointer": source_pointer,
            "registryEntryId": registry_entry_id,
            "strength": "soft",
            "target": target,
            "resolution": "not-followed-soft",
            "reason": "External optional resource bytes are intentionally outside standalone runtime closure.",
        }
        validate_reference_registry_contract(registry, reference)
        emitted_dependency_entries.add(registry_entry_id)
        references.append(reference)

    for artifact_path, _logical_id, landscape in landscape_documents:
        landscape_id = str(landscape["landscapeId"])
        landscape_key = landscape_keys[landscape_id]
        for index, goal in enumerate(landscape.get("goals", [])):
            hard(landscape_key, pointer("goals", index), "landscape.goals", goal_keys[goal["id"]])
        for index, unit in enumerate(landscape.get("programUnits", [])):
            unit_key = unit_keys[(landscape_id, unit["id"])]
            hard(landscape_key, pointer("programUnits", index), "landscape.program-units", unit_key)
            parent = unit.get("parentUnitId")
            if isinstance(parent, str):
                hard(unit_key, pointer("parentUnitId"), "program-unit.parent", unit_keys[(landscape_id, parent)])
        for index, placement in enumerate(landscape.get("goalPlacements", [])):
            placement_key = placement_keys[(landscape_id, index)]
            hard(landscape_key, pointer("goalPlacements", index), "landscape.goal-placements", placement_key)
            hard(placement_key, pointer("goalId"), "placement.goal", goal_keys[str(placement["goalId"])])
            hard(placement_key, pointer("unitId"), "placement.unit", unit_keys[(landscape_id, str(placement["unitId"]))])
        for index, competency in enumerate(landscape.get("competencyCatalog", [])):
            hard(
                landscape_key,
                pointer("competencyCatalog", index),
                "landscape.competency-catalog",
                competency_keys[(landscape_id, competency["id"])],
            )
        for goal in landscape.get("goals", []):
            source_key = goal_keys[goal["id"]]
            for relation, registry_id in (("contains", "goal.contains"), ("requires", "goal.requires")):
                for index, target_id in enumerate(goal.get(relation, [])):
                    hard(source_key, pointer(relation, index), registry_id, goal_keys[str(target_id)])
            for field_name, registry_id in (("competencyRefs", "goal.competency-refs"), ("kompetenzen", "goal.kompetenzen")):
                for index, target_id in enumerate(goal.get(field_name, [])):
                    hard(
                        source_key,
                        pointer(field_name, index),
                        registry_id,
                        competency_keys[(landscape_id, str(target_id))],
                    )
            exam_data = goal.get("examData")
            if isinstance(exam_data, dict):
                for index, target_id in enumerate(exam_data.get("coveredGoalIds", [])):
                    hard(
                        source_key,
                        pointer("examData", "coveredGoalIds", index),
                        "goal.exam-covered-goals",
                        goal_keys[str(target_id)],
                    )
            extended = goal.get("extendedData")
            if isinstance(extended, dict):
                for field_name, registry_id in (
                    ("vocabularySource", "goal.vocabulary-source"),
                    ("vocabularySourceEn", "goal.vocabulary-source-en"),
                ):
                    target_path = extended.get(field_name)
                    if isinstance(target_path, str):
                        hard(
                            source_key,
                            pointer("extendedData", field_name),
                            registry_id,
                            deck_keys_by_path[target_path],
                        )
            for index, _link in enumerate(goal.get("resourceLinks", [])):
                resource = resource_by_owner_order[(goal["id"], index)]
                hard(
                    source_key,
                    pointer("resourceLinks", index),
                    "goal.resource-links",
                    resource_keys[resource["resourceId"]],
                )

    def emit_view_nodes(
        view_key: Mapping[str, Any], nodes: Sequence[Any], prefix: tuple[object, ...] = ("rootNodes",)
    ) -> None:
        for index, raw in enumerate(nodes):
            if not isinstance(raw, dict):
                raise ValidationFailure("composition-view node is malformed")
            current = (*prefix, index)
            landscape_id = raw.get("landscapeId")
            if isinstance(landscape_id, str):
                hard(view_key, pointer(*current, "landscapeId"), "view.node-landscape-id", landscape_keys[landscape_id])
            goal_id = raw.get("goalId")
            if isinstance(goal_id, str):
                hard(view_key, pointer(*current, "goalId"), "view.node-goal-id", goal_keys[goal_id])
            children = raw.get("children")
            if isinstance(children, list):
                emit_view_nodes(view_key, children, (*current, "children"))

    for _artifact_path, view in view_documents:
        view_key = view_keys[view["viewId"]]
        hard(view_key, pointer("landscapeId"), "view.landscape-id", landscape_keys[view["landscapeId"]])
        emit_view_nodes(view_key, view.get("rootNodes", []))
    for artifact_path, deck in deck_documents:
        deck_key = deck_keys_by_path[artifact_path]
        hard(deck_key, pointer("landscapeId"), "deck.landscape-id", landscape_keys[deck["landscapeId"]])
        for index, card in enumerate(deck.get("cards", [])):
            hard(
                deck_key,
                pointer("cards", index),
                "card-deck.cards",
                card_keys[(deck["deckId"], deck["language"], card["id"])],
            )
    for resource in resources:
        resource_key = resource_keys[resource["resourceId"]]
        hard(resource_key, pointer("landscapeId"), "resource.landscape-id", landscape_keys[resource["landscapeId"]])
        hard(resource_key, pointer("ownerGoalId"), "resource.owner-goal-id", goal_keys[resource["ownerGoalId"]])
        if resource.get("delivery") == "external":
            soft_uri(resource_key, pointer("externalUrl"), "resource.external-url", str(resource["externalUrl"]))

    active_dependency_entries: set[str] = set()
    for _path, _logical_id, landscape in landscape_documents:
        active_dependency_entries.update(
            collect_active_dependency_entries(registry, "canonical-landscape", landscape)
        )
    for _path, view in view_documents:
        active_dependency_entries.update(
            collect_active_dependency_entries(registry, "composition-view", view)
        )
    for _path, deck in deck_documents:
        active_dependency_entries.update(
            collect_active_dependency_entries(registry, "card-deck", deck)
        )
    active_dependency_entries.update(
        collect_active_dependency_entries(registry, "resource-index", resource_index)
    )
    if emitted_dependency_entries != active_dependency_entries:
        raise ValidationFailure(
            "derived closure does not cover every active registry dependency: "
            f"missing={sorted(active_dependency_entries-emitted_dependency_entries)}, "
            f"unexpected={sorted(emitted_dependency_entries-active_dependency_entries)}"
        )

    definitions.sort(key=lambda item: canonical_json_bytes(item["key"]))
    references.sort(
        key=lambda item: (
            canonical_json_bytes(item["source"]),
            item["sourcePointer"],
            item["registryEntryId"],
            canonical_json_bytes(item["target"]),
        )
    )
    reference_encodings = [canonical_json_bytes(item) for item in references]
    if len(reference_encodings) != len(set(reference_encodings)):
        raise ValidationFailure("derived closure contains duplicate references")
    root_ids = runtime_catalog.get("rootLandscapeIds", [])
    if not isinstance(root_ids, list):
        raise ValidationFailure("runtime rootLandscapeIds are malformed")
    seeds = [landscape_keys[str(landscape_id)] for landscape_id in root_ids]
    seeds.extend(view_keys[view_id] for view_id in sorted(view_keys))
    seeds.sort(key=canonical_json_bytes)

    adjacency: dict[str, set[str]] = defaultdict(set)
    for reference in references:
        if reference["strength"] == "hard":
            adjacency[entity_key_id(reference["source"])].add(entity_key_id(reference["target"]))
    reachable: set[str] = set()
    queue = deque(entity_key_id(seed) for seed in seeds)
    while queue:
        current = queue.popleft()
        if current in reachable:
            continue
        reachable.add(current)
        queue.extend(sorted(adjacency.get(current, set())))
    if reachable != set(definition_by_id):
        raise ValidationFailure(
            "derived definitions do not form the complete seed hard-reference fixed point: "
            f"unreachable={len(set(definition_by_id)-reachable)}, unknown={len(reachable-set(definition_by_id))}"
        )

    bindings = manifest.get("contractBindings")
    if not isinstance(bindings, dict):
        raise ValidationFailure("manifest contract bindings are unavailable")
    registry_binding = bindings.get("fieldSemanticsRegistry")
    definition_binding = bindings.get("definitionDigestProfile")
    registry_document = documents.semantic_contracts.get("fieldSemanticsRegistry")
    if not all(isinstance(item, dict) for item in (registry_binding, definition_binding, registry_document)):
        raise ValidationFailure("closure semantic-contract bindings are unavailable")
    expected_registry_binding = {
        "id": registry_document["registryId"],
        "version": registry_document["version"],
        "sha256": registry_binding["sha256"],
    }
    expected_definition_binding = {
        "id": definition_profile["profileId"],
        "version": definition_profile["version"],
        "sha256": definition_binding["sha256"],
    }
    definition_index = definition_index_digest(definitions, definition_profile)
    closure: dict[str, Any] = {
        "$schema": "https://skillpilot.com/schemas/curriculum-package/v1/dependency-closure.schema.json",
        "closureFormatVersion": "1.0",
        "releaseBinding": {
            "releaseId": manifest.get("releaseId"),
            "packageId": manifest.get("packageId"),
            "packageVersion": manifest.get("packageVersion"),
            "contentDigest": manifest.get("contentDigest"),
        },
        "algorithm": "schema-hard-reference-fixed-point-v1",
        "fieldSemanticsRegistry": expected_registry_binding,
        "definitionDigestProfile": expected_definition_binding,
        "conflictPolicy": {
            "policyId": "stable-definition-identity-v1",
            "identityKey": "typed-entity-key",
            "sameKeySameOwnerSameDigest": "deduplicate",
            "sameKeyDifferentOwnerOrDigest": "reject-atomically",
            "installOrderTieBreak": "forbidden",
            "activeLockOnConflict": "unchanged",
        },
        "seeds": seeds,
        "definitions": definitions,
        "references": references,
        "embeddedFragments": [],
        "externalRuntimeDependencies": [],
        "unresolvedHardReferences": [],
        "definitionIndexDigest": definition_index,
        "closureDigest": "sha256:" + "0" * 64,
        "conflictCheck": {
            "candidateDefinitionCount": len(definitions),
            "deduplicatedDefinitionCount": 0,
            "conflicts": [],
            "result": "compatible",
        },
        "closureStatus": "complete",
    }
    closure["closureDigest"] = generated_document_digest(
        closure,
        "dependency-closure",
        Normalizer(registry),
        definition_profile["closureDigest"],
    )
    return DerivedClosure(closure, definition_bodies)


def validate_hard_reference_closure(
    snapshot: ArchiveSnapshot,
    documents: PackageDocuments,
    registry: FieldRegistry | None,
    logical_documents: Mapping[tuple[str, str], tuple[str, Any]],
    collector: DiagnosticCollector,
) -> None:
    collector.mark_evaluated("hardReferenceClosure")
    manifest = snapshot.manifest
    definition_profile = documents.semantic_contracts.get("definitionDigestProfile")
    if manifest is None or registry is None or not isinstance(definition_profile, dict):
        collector.add(
            "hardReferenceClosure",
            "CLOSURE_INPUT_UNAVAILABLE",
            "/data/runtime/dependency-closure.json",
            "manifest, registry, or definition profile is unavailable",
        )
        return
    records = [
        record
        for record in manifest.get("files", [])
        if isinstance(record, dict) and record.get("role") == "dependency-closure"
    ]
    if len(records) != 1:
        collector.add(
            "hardReferenceClosure", "CLOSURE_SINGLETON", "/metadata/manifest.json/files", str(len(records))
        )
        return
    path = records[0].get("path")
    closure = documents.values.get(path) if isinstance(path, str) else None
    if not isinstance(closure, dict):
        collector.add("hardReferenceClosure", "CLOSURE_UNAVAILABLE", f"/{path}", "closure is unavailable")
        return
    del logical_documents  # derivation intentionally starts from manifest-bound package artifacts
    try:
        expected = derive_expected_closure(
            manifest,
            documents,
            registry,
            definition_profile,
        ).document
        mismatch_codes = derived_closure_mismatch_codes(closure, expected)
        for field_name, code in CLOSURE_DERIVED_FIELD_CODES.items():
            if code in mismatch_codes:
                collector.add(
                    "hardReferenceClosure",
                    code,
                    f"/{path}/{field_name}",
                    "published value differs from independently re-derived package semantics",
                )
        if "CLOSURE_EXACT_RECONSTRUCTION_MISMATCH" in mismatch_codes:
            collector.add(
                "hardReferenceClosure",
                "CLOSURE_EXACT_RECONSTRUCTION_MISMATCH",
                f"/{path}",
                "dependency closure is not the exact independently reconstructed document",
            )
    except (KeyError, TypeError, ValueError, ValidationFailure) as error:
        collector.add(
            "hardReferenceClosure",
            "CLOSURE_DERIVATION_FAILED",
            f"/{path}",
            str(error),
        )


def build_report(
    snapshot: ArchiveSnapshot,
    documents: PackageDocuments,
    collector: DiagnosticCollector,
) -> dict[str, Any]:
    manifest = snapshot.manifest or {}
    gate_reports = {gate: collector.gate_report(gate) for gate in GATE_IDS}
    valid = all(report["status"] == "passed" for report in gate_reports.values())
    logical_count = 0
    binary_count = 0
    manifest_files = [
        record for record in manifest.get("files", []) if isinstance(record, dict)
    ] if isinstance(manifest.get("files"), list) else []
    semantic_index_records = [
        record for record in manifest_files if record.get("role") == "semantic-content-index"
    ]
    semantic_index_path = (
        semantic_index_records[0].get("path") if len(semantic_index_records) == 1 else None
    )
    index = (
        documents.values.get(semantic_index_path)
        if isinstance(semantic_index_path, str)
        else None
    )
    if isinstance(index, dict):
        logical_count = len(index.get("logicalArtifacts", [])) if isinstance(index.get("logicalArtifacts"), list) else 0
        binary_count = len(index.get("binaryResources", [])) if isinstance(index.get("binaryResources"), list) else 0
    closure_records = [
        record for record in manifest_files if record.get("role") == "dependency-closure"
    ]
    closure_path = closure_records[0].get("path") if len(closure_records) == 1 else None
    closure = documents.values.get(closure_path) if isinstance(closure_path, str) else None
    closure_digest = closure.get("closureDigest") if isinstance(closure, dict) else None
    definition_index_digest = (
        closure.get("definitionIndexDigest") if isinstance(closure, dict) else None
    )
    return {
        "reportFormatVersion": REPORT_FORMAT_VERSION,
        "validatorId": VALIDATOR_ID,
        "status": "valid" if valid else "invalid",
        "input": {
            "path": str(snapshot.path),
            "bytes": snapshot.outer_bytes,
            "sha256": snapshot.outer_sha256 or None,
        },
        "package": {
            "archiveRoot": snapshot.archive_root,
            "releaseId": manifest.get("releaseId"),
            "packageId": manifest.get("packageId"),
            "packageVersion": manifest.get("packageVersion"),
            "contentDigest": manifest.get("contentDigest"),
            "manifestSha256": (
                sha256_bytes(snapshot.manifest_raw)
                if snapshot.manifest_raw is not None
                else None
            ),
            "closureDigest": closure_digest,
            "definitionIndexDigest": definition_index_digest,
        },
        "counts": {
            "archiveEntries": len(snapshot.infos_by_relative_path),
            "manifestFiles": len(manifest_files),
            "logicalArtifacts": logical_count,
            "binaryResources": binary_count,
        },
        "gates": gate_reports,
        "diagnostics": [item.as_json() for item in sorted(collector.diagnostics)],
        "diagnosticsTruncated": collector.truncated,
    }


def validate_package(path: Path, trusted: TrustedContext) -> dict[str, Any]:
    lexical_path = Path(os.path.abspath(path))
    try:
        lexical_path.lstat()
    except OSError as error:
        raise ValidationFailure(f"cannot inspect input ZIP {lexical_path}: {error}") from error
    collector = DiagnosticCollector()
    snapshot = inspect_archive(lexical_path, trusted, collector)
    documents = parse_and_validate_package_documents(snapshot, trusted, collector)
    validate_runtime_catalog(snapshot, documents, collector)
    registry, logical_documents = validate_content_and_assets(
        snapshot, documents, trusted, collector
    )
    validate_hard_reference_closure(
        snapshot, documents, registry, logical_documents, collector
    )
    return build_report(snapshot, documents, collector)


def regular_zip_info(name: str, *, mode: int = 0o100644) -> zipfile.ZipInfo:
    info = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
    info.create_system = 3
    info.external_attr = mode << 16
    info.compress_type = zipfile.ZIP_STORED
    return info


def write_test_zip(path: Path, entries: Sequence[tuple[zipfile.ZipInfo, bytes]]) -> None:
    with warnings.catch_warnings():
        warnings.filterwarnings("ignore", message="Duplicate name: .*", category=UserWarning)
        with zipfile.ZipFile(path, "w", allowZip64=False) as archive:
            for info, content in entries:
                archive.writestr(info, content)


def load_self_test_cases(path: Path) -> list[dict[str, Any]]:
    document = object_value(parse_json_bytes(path.read_bytes(), str(path)), str(path))
    if document.get("fixtureFormatVersion") != 1 or not isinstance(document.get("cases"), list):
        raise ValidationFailure(f"malformed self-test fixture {path}")
    cases = [item for item in document["cases"] if isinstance(item, dict)]
    if len(cases) != len(document["cases"]):
        raise ValidationFailure(f"malformed self-test case in {path}")
    return cases


def run_self_test(trusted: TrustedContext, fixture_path: Path, verbose: bool) -> dict[str, Any]:
    cases = load_self_test_cases(fixture_path)
    passed = 0
    failures: list[str] = []
    with tempfile.TemporaryDirectory(prefix="full-standalone-validator-self-test.") as temporary:
        root = Path(temporary)
        for case in cases:
            case_id = case.get("id")
            kind = case.get("kind")
            expected_code = case.get("expectedCode")
            if not all(isinstance(value, str) for value in (case_id, kind, expected_code)):
                failures.append(f"malformed case: {case!r}")
                continue
            path = root / f"{case_id}.zip"
            profile_context = trusted
            entries: list[tuple[zipfile.ZipInfo, bytes]] = []
            base_manifest = b'{"archiveRoot":"fixture"}\n'
            if kind == "unsafe-path":
                entries = [(regular_zip_info("fixture/../escape.txt"), b"x")]
            elif kind == "duplicate-path":
                entries = [
                    (regular_zip_info("fixture/a.txt"), b"a"),
                    (regular_zip_info("fixture/a.txt"), b"b"),
                ]
            elif kind == "portable-collision":
                entries = [
                    (regular_zip_info("fixture/A.txt"), b"a"),
                    (regular_zip_info("fixture/a.txt"), b"b"),
                ]
            elif kind == "prefix-collision":
                entries = [
                    (regular_zip_info("fixture/a"), b"a"),
                    (regular_zip_info("fixture/a/b.txt"), b"b"),
                ]
            elif kind == "symlink":
                entries = [(regular_zip_info("fixture/link", mode=stat.S_IFLNK | 0o777), b"target")]
            elif kind == "special-file":
                entries = [(regular_zip_info("fixture/fifo", mode=stat.S_IFIFO | 0o644), b"")]
            elif kind == "nested-path":
                entries = [
                    (regular_zip_info("fixture/metadata/manifest.json"), base_manifest),
                    (regular_zip_info("fixture/payload.zip"), b"not actually zip"),
                ]
            elif kind == "nested-magic":
                entries = [
                    (regular_zip_info("fixture/metadata/manifest.json"), base_manifest),
                    (regular_zip_info("fixture/payload.bin"), b"PK\x03\x04payload"),
                ]
            elif kind == "compression-ratio":
                info = regular_zip_info("fixture/bomb.txt")
                info.compress_type = zipfile.ZIP_DEFLATED
                entries = [(info, b"0" * (1024 * 1024))]
            elif kind == "multiple-roots":
                entries = [
                    (regular_zip_info("one/a.txt"), b"a"),
                    (regular_zip_info("two/b.txt"), b"b"),
                ]
            elif kind == "duplicate-manifest-key":
                entries = [
                    (
                        regular_zip_info("fixture/metadata/manifest.json"),
                        b'{"archiveRoot":"fixture","archiveRoot":"fixture"}\n',
                    )
                ]
            elif kind == "checksum-mismatch":
                entries = [
                    (regular_zip_info("fixture/metadata/manifest.json"), base_manifest),
                    (regular_zip_info("fixture/metadata/SHA256SUMS"), b"0" * 64 + b"  nope\n"),
                ]
            elif kind == "zip64-extra":
                info = regular_zip_info("fixture/a.txt")
                info.extra = struct.pack("<HH", ZIP64_EXTRA_FIELD_ID, 0)
                entries = [(info, b"x")]
            elif kind == "entry-count-limit":
                profile = copy.deepcopy(trusted.profile)
                profile["archiveLimits"]["entryCount"] = 1
                profile_context = TrustedContext(
                    contract_dir=trusted.contract_dir,
                    profile=profile,
                    profile_bytes=trusted.profile_bytes,
                    profile_sha256=trusted.profile_sha256,
                    roles=trusted.roles,
                    manifest_validator=trusted.manifest_validator,
                    trusted_schema_bytes=trusted.trusted_schema_bytes,
                    trusted_schema_documents=trusted.trusted_schema_documents,
                    trusted_schema_metadata=trusted.trusted_schema_metadata,
                    schema_catalog_validator=trusted.schema_catalog_validator,
                )
                entries = [
                    (regular_zip_info("fixture/a.txt"), b"a"),
                    (regular_zip_info("fixture/b.txt"), b"b"),
                ]
            elif kind == "outer-size-limit":
                profile = copy.deepcopy(trusted.profile)
                profile["archiveLimits"]["outerZipBytes"] = 1
                profile_context = TrustedContext(
                    contract_dir=trusted.contract_dir,
                    profile=profile,
                    profile_bytes=trusted.profile_bytes,
                    profile_sha256=trusted.profile_sha256,
                    roles=trusted.roles,
                    manifest_validator=trusted.manifest_validator,
                    trusted_schema_bytes=trusted.trusted_schema_bytes,
                    trusted_schema_documents=trusted.trusted_schema_documents,
                    trusted_schema_metadata=trusted.trusted_schema_metadata,
                    schema_catalog_validator=trusted.schema_catalog_validator,
                )
                entries = [(regular_zip_info("fixture/a.txt"), b"a")]
            elif kind in {"local-central-mismatch", "symlink-input", "missing-manifest-prerequisites"}:
                entries = [(regular_zip_info("fixture/a.txt"), b"a")]
            elif kind == "json-depth-limit":
                nested = b"[" * (trusted.profile["archiveLimits"]["jsonMaxDepth"] + 1)
                nested += b"0" + b"]" * (trusted.profile["archiveLimits"]["jsonMaxDepth"] + 1)
                entries = [
                    (
                        regular_zip_info("fixture/metadata/manifest.json"),
                        b'{"archiveRoot":"fixture","nested":' + nested + b"}\n",
                    )
                ]
            else:
                failures.append(f"{case_id}: unsupported fixture kind {kind!r}")
                continue
            try:
                write_test_zip(path, entries)
                if kind == "local-central-mismatch":
                    descriptor = os.open(path, os.O_RDWR)
                    try:
                        # Local method field at byte 8; central directory remains ZIP_STORED.
                        os.pwrite(descriptor, struct.pack("<H", zipfile.ZIP_DEFLATED), 8)
                    finally:
                        os.close(descriptor)
                elif kind == "symlink-input":
                    target = path.with_suffix(".target.zip")
                    path.replace(target)
                    path.symlink_to(target.name)
                report = validate_package(path, profile_context)
                codes = {item["code"] for item in report["diagnostics"]}
                if expected_code not in codes:
                    failures.append(
                        f"{case_id}: expected {expected_code}, got {sorted(codes)}"
                    )
                else:
                    if kind == "missing-manifest-prerequisites" and any(
                        gate["status"] == "passed" for gate in report["gates"].values()
                    ):
                        failures.append(
                            f"{case_id}: missing manifest left a gate passed: {report['gates']!r}"
                        )
                    else:
                        passed += 1
                        if verbose:
                            print(f"PASS {case_id}: {expected_code}")
            except Exception as error:
                failures.append(f"{case_id}: self-test crashed: {error}")

    # Pure digest vectors catch record-order and framing regressions without a builder.
    normalization = {
        "semanticArtifactDigest": {"domain": "semantic-domain"},
        "binaryAssetDigest": {"domain": "binary-domain"},
        "contentDigest": {"domain": "content-domain"},
    }
    artifact = {
        "role": "runtime-catalog",
        "logicalId": "fixture",
        "mediaType": "application/json",
        "normalizedBytes": 2,
        "normalizedSha256": sha256_bytes(b"{}"),
    }
    resource = {
        "resourceId": "resource:fixture",
        "canonicalReference": "/assets/fixture.png",
        "mediaType": "image/png",
        "bytes": 8,
        "sha256": sha256_bytes(b"fixture!"),
    }
    artifact["recordSha256"] = logical_record_digest(artifact, normalization)
    resource["recordSha256"] = binary_record_digest(resource, normalization)
    index = {
        "normalizationProfile": {"id": "n", "version": "1.0.0", "sha256": "a" * 64},
        "fieldSemanticsRegistry": {"id": "r", "version": "1.0.0", "sha256": "b" * 64},
        "logicalArtifacts": [artifact],
        "binaryResources": [resource],
    }
    first = semantic_content_digest(index, normalization)
    golden = {
        "logical": "73c97c1c0d32af9c43d00c2f0859c6d5033547e39fc0307f6aeb73f6a081dacd",
        "binary": "06b64d3bf45ce3d6b993dc47ae8808b556850451dfc3db7ca51e8a813fe60e55",
        "content": "sha256:88054d11fd216d05f7b33437a6c2b6595f85f0fbd37f846a1e99fa7672c9b141",
    }
    actual_golden = {
        "logical": artifact["recordSha256"],
        "binary": resource["recordSha256"],
        "content": first,
    }
    if actual_golden != golden:
        failures.append(
            f"digest-golden-v1: expected {golden!r}, got {actual_golden!r}"
        )
    else:
        passed += 1
        if verbose:
            print("PASS digest-golden-v1: three pinned digest vectors")
    mutated = copy.deepcopy(index)
    mutated["logicalArtifacts"][0]["normalizedSha256"] = "c" * 64
    mutated["logicalArtifacts"][0]["recordSha256"] = logical_record_digest(
        mutated["logicalArtifacts"][0], normalization
    )
    second = semantic_content_digest(mutated, normalization)
    if first == second:
        failures.append("digest-mutation: semantic content digest did not change")
    else:
        passed += 1
        if verbose:
            print("PASS digest-mutation: CONTENT_DIGEST_CHANGED")

    # Pure closure reconstruction fixture: published closure fields are never the oracle.
    try:
        registry_path = trusted.contract_dir / "profiles" / "skillpilot-fwu-field-semantics-v1.registry.json"
        definition_path = trusted.contract_dir / "profiles" / "canonical-definition-record-v1.profile.json"
        registry_document = object_value(
            parse_json_bytes(registry_path.read_bytes(), str(registry_path)),
            str(registry_path),
        )
        definition_document = object_value(
            parse_json_bytes(definition_path.read_bytes(), str(definition_path)),
            str(definition_path),
        )
        landscape_path = "data/canonical/fixture.landscape.json"
        runtime_path = "data/runtime/catalog.json"
        resource_path = "data/resources/resource-index.json"
        landscape = {
            "$schema": "https://skillpilot.com/schemas/curriculum-package/v1/compiled-landscape.schema.json",
            "landscapeFormatVersion": "1.0",
            "landscapeId": "fixture-landscape",
            "locale": "de-DE",
            "title": "Fixture",
            "description": "Closure fixture",
            "goals": [
                {
                    "id": "fixture-root",
                    "semanticKind": "curricularCluster",
                    "title": "Root",
                    "description": "Root goal",
                    "weight": 1,
                    "tags": [],
                    "contains": ["fixture-child"],
                    "requires": [],
                    "dimensionTags": {},
                    "type": "cluster",
                },
                {
                    "id": "fixture-child",
                    "semanticKind": "curricularAtomic",
                    "title": "Child",
                    "description": "Child goal",
                    "weight": 1,
                    "tags": [],
                    "contains": [],
                    "requires": ["fixture-root"],
                    "dimensionTags": {},
                    "type": "atomic",
                },
            ],
        }
        runtime_catalog = {
            "rootLandscapeIds": ["fixture-landscape"],
            "landscapes": [
                {
                    "landscapeId": "fixture-landscape",
                    "role": "root",
                    "artifactPath": landscape_path,
                }
            ],
            "views": [],
        }
        resource_index = {"resources": []}
        registry_sha = sha256_bytes(registry_path.read_bytes())
        definition_sha = sha256_bytes(definition_path.read_bytes())
        closure_manifest = {
            "releaseId": "org.skillpilot.fixture@1.0.0",
            "packageId": "org.skillpilot.fixture",
            "packageVersion": "1.0.0",
            "contentDigest": "sha256:" + "1" * 64,
            "contractBindings": {
                "fieldSemanticsRegistry": {"sha256": registry_sha},
                "definitionDigestProfile": {"sha256": definition_sha},
            },
            "files": [
                {
                    "path": landscape_path,
                    "role": "canonical-landscape",
                    "semanticBinding": {
                        "kind": "logical-artifact",
                        "logicalId": "fixture-landscape",
                        "normalizationRole": "canonical-landscape",
                    },
                },
                {
                    "path": runtime_path,
                    "role": "runtime-catalog",
                    "semanticBinding": {
                        "kind": "logical-artifact",
                        "logicalId": "org.skillpilot.fixture@1.0.0:catalog",
                        "normalizationRole": "runtime-catalog",
                    },
                },
                {
                    "path": resource_path,
                    "role": "resource-index",
                    "semanticBinding": {
                        "kind": "logical-artifact",
                        "logicalId": "fixture-landscape:resources",
                        "normalizationRole": "resource-index",
                    },
                },
            ],
        }
        closure_documents = PackageDocuments(
            values={
                landscape_path: landscape,
                runtime_path: runtime_catalog,
                resource_path: resource_index,
            },
            semantic_contracts={
                "fieldSemanticsRegistry": registry_document,
                "definitionDigestProfile": definition_document,
            },
        )
        derived = derive_expected_closure(
            closure_manifest,
            closure_documents,
            FieldRegistry(registry_document),
            definition_document,
        ).document
        removed_references = copy.deepcopy(derived)
        removed_references["references"] = []
        removed_references["seeds"] = [item["key"] for item in derived["definitions"]]
        codes = derived_closure_mismatch_codes(removed_references, derived)
        expected_codes = {
            "CLOSURE_DERIVED_REFERENCES_MISMATCH",
            "CLOSURE_DERIVED_SEEDS_MISMATCH",
            "CLOSURE_EXACT_RECONSTRUCTION_MISMATCH",
        }
        if not expected_codes.issubset(codes):
            failures.append(
                f"closure-reference-elision: expected {sorted(expected_codes)}, got {sorted(codes)}"
            )
        else:
            passed += 1
            if verbose:
                print("PASS closure-reference-elision: independently derived references and seeds")
    except Exception as error:
        failures.append(f"closure-reference-elision: self-test crashed: {error}")

    # Pure runtime projections prove exact view/deck/resource bindings and safe schema short-circuiting.
    try:
        runtime_fixture_path = (
            trusted.contract_dir
            / "fixtures"
            / "runtime-catalog"
            / "valid"
            / "minimal-mathematik.catalog.json"
        )
        base_runtime = object_value(
            parse_json_bytes(runtime_fixture_path.read_bytes(), str(runtime_fixture_path)),
            str(runtime_fixture_path),
        )
        fixture_landscape_id = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced"
        landscape_path = "data/canonical/mathematik.landscape.json"
        fixture_values: dict[str, Any] = {
            "data/runtime/catalog.json": base_runtime,
            landscape_path: {
                "landscapeId": fixture_landscape_id,
                "locale": "de-DE",
                "frameworkId": "canonical-gymnasium-math",
                "subject": "Mathematik",
                "country": "DE",
                "region": "DEU",
                "schoolType": "Gymnasium",
                "goals": [],
            },
        }
        fixture_values.update(
            {
                f"schemas/pure/{index}.schema.json": copy.deepcopy(schema_document)
                for index, schema_document in enumerate(
                    trusted.trusted_schema_documents.values()
                )
            }
        )
        for runtime_view in base_runtime["views"]:
            fixture_values[runtime_view["artifactPath"]] = {
                "viewId": runtime_view["viewId"],
                "landscapeId": runtime_view["landscapeId"],
                "language": "de-DE",
                "scope": runtime_view["scope"],
                "rootNodes": [],
            }
        deck_runtime = base_runtime["decks"][0]
        fixture_values[deck_runtime["artifactPath"]] = {
            "deckId": deck_runtime["deckId"],
            "landscapeId": deck_runtime["landscapeId"],
            "language": deck_runtime["locale"],
            "title": "Fixture deck",
            "cards": [],
        }
        fixture_values["data/views/index.json"] = {
            "views": sorted(
                [
                    {
                        "viewId": item["viewId"],
                        "landscapeId": item["landscapeId"],
                        "language": "de-DE",
                        "scope": item["scope"],
                        "artifactPath": item["artifactPath"],
                    }
                    for item in base_runtime["views"]
                ],
                key=lambda item: item["viewId"],
            )
        }
        fixture_values["data/cards/card-index.json"] = {
            "decks": [
                {
                    "deckId": deck_runtime["deckId"],
                    "landscapeId": deck_runtime["landscapeId"],
                    "language": deck_runtime["locale"],
                    "title": "Fixture deck",
                    "cardCount": 0,
                    "artifactPath": deck_runtime["artifactPath"],
                }
            ]
        }
        runtime_resource = base_runtime["resources"][0]
        fixture_resource = {
            "resourceId": runtime_resource["resourceId"],
            "resourceKind": "goal-visualization",
            "landscapeId": runtime_resource["landscapeId"],
            "ownerGoalId": runtime_resource["goalId"],
            "delivery": "embedded",
            "runtimeRequired": True,
            "mediaType": "image/png",
            "artifactPath": runtime_resource["artifactPath"],
        }
        fixture_values["data/resources/resource-index.json"] = {
            "resources": [fixture_resource]
        }
        runtime_manifest = {
            "releaseId": base_runtime["releaseBinding"]["releaseId"],
            "contentDigest": base_runtime["releaseBinding"]["contentDigest"],
            "runtimeContractVersion": base_runtime["runtimeContractVersion"],
            "archiveRoot": "fixture",
            "files": [
                {
                    "path": "data/runtime/catalog.json",
                    "role": "runtime-catalog",
                    "validationSchemaId": "https://skillpilot.com/schemas/curriculum-package/v1/runtime-catalog.schema.json",
                },
                {"path": landscape_path, "role": "canonical-landscape"},
                *[
                    {"path": item["artifactPath"], "role": "composition-view"}
                    for item in base_runtime["views"]
                ],
                {"path": deck_runtime["artifactPath"], "role": "card-deck"},
                {"path": runtime_resource["artifactPath"], "role": "binary-asset"},
                {"path": "data/views/index.json", "role": "composition-view-index"},
                {"path": "data/cards/card-index.json", "role": "card-index"},
                {"path": "data/resources/resource-index.json", "role": "resource-index"},
                {"path": "data/runtime/migration-aliases.json", "role": "migration-aliases"},
                {"path": "data/runtime/dependency-closure.json", "role": "dependency-closure"},
            ],
        }
        package_registry: Registry[Any] = Registry(
            retrieve=lambda uri: (_ for _ in ()).throw(NoSuchResource(ref=uri))
        )
        for schema_id, schema_document in trusted.trusted_schema_documents.items():
            package_registry = package_registry.with_resource(
                schema_id, Resource.from_contents(schema_document)
            )

        def runtime_mutation_codes(
            mutate: Any,
        ) -> set[str]:
            candidate_values = copy.deepcopy(fixture_values)
            candidate_manifest = copy.deepcopy(runtime_manifest)
            mutate(candidate_values, candidate_manifest)
            snapshot = ArchiveSnapshot(
                path=Path("runtime-pure-fixture.zip"),
                outer_bytes=0,
                outer_sha256="",
                archive_root="fixture",
                infos_by_relative_path={},
                raw_documents={},
                actual_bytes={},
                actual_sha256={},
                content_prefixes={},
                manifest=candidate_manifest,
            )
            candidate_documents = PackageDocuments(
                values=candidate_values,
                schema_registry=package_registry,
            )
            runtime_collector = DiagnosticCollector()
            validate_runtime_catalog(snapshot, candidate_documents, runtime_collector)
            return runtime_collector.codes_by_gate["runtimeCatalog"]

        runtime_cases = [
            (
                "runtime-view-language",
                lambda values, _manifest: values["data/views/index.json"]["views"][0].__setitem__("language", "en"),
                "VIEW_INDEX_EXACT_MISMATCH",
            ),
            (
                "runtime-view-duplicate",
                lambda values, _manifest: values["data/views/index.json"]["views"].append(
                    copy.deepcopy(values["data/views/index.json"]["views"][0])
                ),
                "VIEW_INDEX_DUPLICATE",
            ),
            (
                "runtime-deck-title",
                lambda values, _manifest: values["data/cards/card-index.json"]["decks"][0].__setitem__("title", "Drift"),
                "CARD_INDEX_EXACT_MISMATCH",
            ),
            (
                "runtime-resource-owner",
                lambda values, _manifest: values["data/runtime/catalog.json"]["resources"][0].__setitem__("goalId", "wrong-goal"),
                "RUNTIME_RESOURCE_EXACT_MISMATCH",
            ),
            (
                "runtime-schema-invalid-type",
                lambda values, _manifest: values["data/runtime/catalog.json"].__setitem__("views", "not-an-array"),
                "RUNTIME_CATALOG_SCHEMA_PREREQUISITE_FAILED",
            ),
        ]
        for case_id, mutation, expected_code in runtime_cases:
            codes = runtime_mutation_codes(mutation)
            if expected_code not in codes:
                failures.append(
                    f"{case_id}: expected {expected_code}, got {sorted(codes)}"
                )
            else:
                passed += 1
                if verbose:
                    print(f"PASS {case_id}: {expected_code}")
    except Exception as error:
        failures.append(f"runtime-projection-fixtures: self-test crashed: {error}")

    # Report protocol v2 closes the extracted-payload replay gap by binding the
    # independently read manifest and its closure identities directly.
    try:
        report_manifest_raw = b'{"releaseId":"org.example.fixture@1.0.0"}\n'
        report_closure = {
            "closureDigest": "sha256:" + "a" * 64,
            "definitionIndexDigest": "sha256:" + "b" * 64,
        }
        report_snapshot = ArchiveSnapshot(
            path=Path("report-v2-fixture.zip"),
            outer_bytes=123,
            outer_sha256="c" * 64,
            archive_root="fixture",
            infos_by_relative_path={},
            raw_documents={},
            actual_bytes={},
            actual_sha256={},
            content_prefixes={},
            manifest_raw=report_manifest_raw,
            manifest={
                "archiveRoot": "fixture",
                "releaseId": "org.example.fixture@1.0.0",
                "packageId": "org.example.fixture",
                "packageVersion": "1.0.0",
                "contentDigest": "sha256:" + "d" * 64,
                "files": [
                    {
                        "path": "data/runtime/dependency-closure.json",
                        "role": "dependency-closure",
                    }
                ],
            },
        )
        report_collector = DiagnosticCollector()
        report_collector.mark_evaluated(*GATE_IDS)
        report = build_report(
            report_snapshot,
            PackageDocuments(
                values={"data/runtime/dependency-closure.json": report_closure}
            ),
            report_collector,
        )
        expected_binding = {
            "manifestSha256": sha256_bytes(report_manifest_raw),
            **report_closure,
        }
        actual_binding = {
            key: report["package"].get(key) for key in expected_binding
        }
        if (
            report.get("reportFormatVersion") != 2
            or report.get("validatorId") != VALIDATOR_ID
            or actual_binding != expected_binding
        ):
            failures.append(
                f"report-v2-package-binding: expected {expected_binding!r}, got {actual_binding!r}"
            )
        else:
            passed += 1
            if verbose:
                print("PASS report-v2-package-binding: manifest and closure identities bound")
    except Exception as error:
        failures.append(f"report-v2-package-binding: self-test crashed: {error}")

    return {
        "selfTestFormatVersion": 1,
        "status": "passed" if not failures else "failed",
        "passed": passed,
        "failed": len(failures),
        "failures": failures,
    }


def stable_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n"


def atomic_write_report(path: Path, content: str) -> None:
    path = path.resolve()
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.tmp-{os.getpid()}")
    try:
        with temporary.open("x", encoding="utf-8", newline="\n") as handle:
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--zip", type=Path, help="full-standalone-v1 ZIP to validate")
    mode.add_argument("--self-test", action="store_true", help="run the bounded adversarial corpus")
    parser.add_argument("--contracts-dir", type=Path, default=DEFAULT_CONTRACT_DIR)
    parser.add_argument("--fixtures", type=Path, default=DEFAULT_FIXTURE_PATH)
    parser.add_argument("--json", action="store_true", help="write the structured report to stdout")
    parser.add_argument("--report", type=Path, help="atomically write the structured JSON report")
    parser.add_argument("--verbose", action="store_true")
    return parser.parse_args(argv)


def unavailable_report(path: Path | None, message: str) -> dict[str, Any]:
    return {
        "reportFormatVersion": REPORT_FORMAT_VERSION,
        "validatorId": VALIDATOR_ID,
        "status": "error",
        "input": {"path": str(path) if path else None, "bytes": None, "sha256": None},
        "package": {
            "archiveRoot": None,
            "releaseId": None,
            "packageId": None,
            "packageVersion": None,
            "contentDigest": None,
            "manifestSha256": None,
            "closureDigest": None,
            "definitionIndexDigest": None,
        },
        "counts": {
            "archiveEntries": 0,
            "manifestFiles": 0,
            "logicalArtifacts": 0,
            "binaryResources": 0,
        },
        "gates": {
            gate: {"status": "not-evaluated", "diagnosticCount": 0, "diagnosticCodes": []}
            for gate in GATE_IDS
        },
        "diagnostics": [
            {
                "gate": "inventory",
                "code": "VALIDATOR_UNAVAILABLE",
                "location": "/",
                "message": message,
            }
        ],
        "diagnosticsTruncated": False,
    }


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        trusted = load_trusted_context(args.contracts_dir)
        if args.self_test:
            report = run_self_test(trusted, args.fixtures.resolve(), args.verbose)
            exit_code = 0 if report["status"] == "passed" else 1
        else:
            report = validate_package(args.zip, trusted)
            exit_code = 0 if report["status"] == "valid" else 1
    except (TrustRootError, ValidationFailure, OSError) as error:
        report = unavailable_report(args.zip, str(error))
        exit_code = 2
    rendered = stable_json(report)
    if args.report:
        try:
            atomic_write_report(args.report, rendered)
        except OSError as error:
            print(f"cannot write validation report: {error}", file=sys.stderr)
            return 2
    if args.json:
        sys.stdout.write(rendered)
    elif args.self_test:
        if report["status"] == "passed":
            print(f"Full standalone package validator self-test passed: {report['passed']} guarantees.")
        else:
            for failure in report.get("failures", []):
                print(f"FAIL {failure}", file=sys.stderr)
    else:
        gates = ", ".join(
            f"{gate}={data['status']}" for gate, data in report["gates"].items()
        )
        print(f"Full standalone package validation {report['status']}: {gates}.")
        if exit_code != 0:
            for diagnostic in report["diagnostics"][:20]:
                print(
                    f"{diagnostic['gate']} {diagnostic['code']} {diagnostic['location']}: {diagnostic['message']}",
                    file=sys.stderr,
                )
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
