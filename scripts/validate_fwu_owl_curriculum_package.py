#!/usr/bin/env python3
"""Independently validate one finished Core-first FWU-OWL curriculum ZIP.

The validator deliberately consumes only released bytes and repository trust
roots.  It does not import the TypeScript exporter or reuse exporter state.
Exit codes are 0 (valid), 1 (invalid input), and 2 (validator/tool error).
"""

from __future__ import annotations

import argparse
import calendar
import hashlib
import importlib
import importlib.metadata
import json
import math
import os
import re
import shutil
import stat
import struct
import subprocess
import sys
import tempfile
import unicodedata
import zipfile
from collections import Counter
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Any, BinaryIO, Iterable, Mapping, Sequence

from jsonschema import Draft202012Validator


REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

contract_audit = importlib.import_module("scripts.validate_curriculum_fwu_owl_package_contracts")

CONTRACT_ROOT = REPO_ROOT / "contracts" / "curriculum-package" / "v1"
PROFILE_PATH = CONTRACT_ROOT / "profiles" / "fwu-owl-v1.profile.json"
MANIFEST_SCHEMA_PATH = CONTRACT_ROOT / "fwu-owl-package-manifest.schema.json"
PROFILE_SCHEMA_PATH = CONTRACT_ROOT / "fwu-owl-package-profile.schema.json"
REPORT_SCHEMA_PATH = CONTRACT_ROOT / "fwu-owl-package-validation-report.schema.json"
FULL_STANDALONE_VALIDATOR = REPO_ROOT / "scripts" / "validate_full_standalone_curriculum_package.py"
JAVA_VERSION_PATH = REPO_ROOT / ".java-version"
CORRETTO_VERSION_PATH = REPO_ROOT / ".corretto-version"

GATES = (
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
)
SEGMENTS = (
    "declarations",
    "runtime",
    "landscape",
    "views",
    "mappings",
    "sources",
    "cards",
    "assets",
)
MANIFEST_REL = "metadata/manifest.json"
CHECKSUM_REL = "metadata/SHA256SUMS"
SP = "https://skillpilot.de/ns/roundtrip#"
RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
OWL_CLASS = "http://www.w3.org/2002/07/owl#Class"
OWL_OBJECT_PROPERTY = "http://www.w3.org/2002/07/owl#ObjectProperty"
OWL_DATATYPE_PROPERTY = "http://www.w3.org/2002/07/owl#DatatypeProperty"
SHA_RE = re.compile(r"^[a-f0-9]{64}$")
VERSION_PIN_RE = re.compile(r"^[0-9]+(?:\.[0-9]+){2,4}$")
PYSHACL_VERSION = "0.30.1"
ROBOT_VERSION = "1.9.10"
HERMIT_VERSION = "1.4.5.456"
ROBOT_BYTES = 82_604_728
ROBOT_SHA256 = "16a73c074f3df359a7338a84b4e0788785fe06117f931bb9796e9619ea776105"
NESTED_ARCHIVE_SUFFIXES = {
    ".zip", ".jar", ".war", ".ear", ".apk", ".7z", ".rar", ".tar", ".tgz", ".gz", ".bz2", ".xz"
}
RESERVED_PORTABLE = {
    "CON", "PRN", "AUX", "NUL", *(f"COM{i}" for i in range(1, 10)), *(f"LPT{i}" for i in range(1, 10))
}
NT_IRI = r"<([^<>\"{}|^`\\\x00-\x20]+)>"
NT_LITERAL = r'"((?:[^"\\\x00-\x1f]|\\["\\tbnrf]|\\u[0-9A-Fa-f]{4}|\\U[0-9A-Fa-f]{8})*)"(?:(@[A-Za-z]+(?:-[A-Za-z0-9]+)*)|\^\^' + NT_IRI + r")?"
NT_LINE_RE = re.compile(r"^" + NT_IRI + r" " + NT_IRI + r" (?:(" + NT_IRI + r")|(" + NT_LITERAL + r")) \.\n$")


class InvalidPackage(Exception):
    """The released input violates a normative package rule."""


class ValidatorError(Exception):
    """The validator or a mandatory external tool could not operate."""


@dataclass(frozen=True)
class Diagnostic:
    code: str
    path: str
    message: str

    def json(self) -> dict[str, str]:
        return {"code": self.code, "path": self.path, "message": self.message}


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(8 * 1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def sha256_descriptor(descriptor: int, size: int) -> str:
    digest = hashlib.sha256()
    offset = 0
    while offset < size:
        chunk = os.pread(descriptor, min(8 * 1024 * 1024, size - offset), offset)
        if not chunk:
            raise ValidatorError("file became unreadable while hashing its pinned descriptor")
        digest.update(chunk)
        offset += len(chunk)
    if os.pread(descriptor, 1, size):
        raise ValidatorError("file grew while hashing its pinned descriptor")
    return digest.hexdigest()


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


def path_identity(status: os.stat_result) -> tuple[int, int, int]:
    return (status.st_dev, status.st_ino, status.st_mode)


def hash_stream(handle: BinaryIO) -> tuple[int, str]:
    size = 0
    digest = hashlib.sha256()
    for chunk in iter(lambda: handle.read(8 * 1024 * 1024), b""):
        size += len(chunk)
        digest.update(chunk)
    return size, digest.hexdigest()


def reject_constant(value: str) -> None:
    raise InvalidPackage(f"non-finite JSON number {value!r}")


def reject_duplicate_keys(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise InvalidPackage(f"duplicate JSON key {key!r}")
        result[key] = value
    return result


def validate_json_shape(value: Any, *, max_depth: int, max_nodes: int) -> None:
    nodes = 0
    stack: list[tuple[Any, int]] = [(value, 0)]
    while stack:
        current, depth = stack.pop()
        nodes += 1
        if nodes > max_nodes:
            raise InvalidPackage(f"JSON exceeds {max_nodes} nodes")
        if depth > max_depth:
            raise InvalidPackage(f"JSON exceeds depth {max_depth}")
        if isinstance(current, str):
            for char in current:
                point = ord(char)
                if 0xD800 <= point <= 0xDFFF or point in {0xFFFE, 0xFFFF} or (point < 0x20 and point not in {9, 10, 13}):
                    raise InvalidPackage("JSON contains a forbidden Unicode code point")
        elif isinstance(current, float) and not math.isfinite(current):
            raise InvalidPackage("JSON contains a non-finite number")
        elif isinstance(current, dict):
            for key, child in current.items():
                if not isinstance(key, str):
                    raise InvalidPackage("JSON object key is not a string")
                stack.append((key, depth + 1))
                stack.append((child, depth + 1))
        elif isinstance(current, list):
            stack.extend((child, depth + 1) for child in current)


def validate_json_lexical_limits(raw: bytes, *, max_depth: int, max_nodes: int) -> None:
    """Bound JSON nesting and tokens before json.loads allocates an object graph."""
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
        elif byte in {0x7B, 0x5B}:
            depth += 1
            nodes += 1
            in_scalar = False
            if depth > max_depth:
                raise InvalidPackage(f"JSON lexical nesting exceeds {max_depth}")
        elif byte in {0x7D, 0x5D}:
            depth -= 1
            in_scalar = False
            if depth < 0:
                break
        elif byte in b"-0123456789tfn":
            if not in_scalar:
                nodes += 1
                in_scalar = True
        elif byte in {0x2C, 0x3A} or chr(byte).isspace():
            in_scalar = False
        if nodes > max_nodes:
            raise InvalidPackage(f"JSON lexical node count exceeds {max_nodes}")


def loads_strict(raw: bytes, *, max_depth: int = 128, max_nodes: int = 5_000_000) -> Any:
    validate_json_lexical_limits(raw, max_depth=max_depth, max_nodes=max_nodes)
    try:
        text = raw.decode("utf-8", "strict")
        value = json.loads(
            text,
            object_pairs_hook=reject_duplicate_keys,
            parse_constant=reject_constant,
        )
    except (UnicodeError, json.JSONDecodeError) as error:
        raise InvalidPackage(f"invalid strict UTF-8 JSON: {error}") from error
    validate_json_shape(value, max_depth=max_depth, max_nodes=max_nodes)
    return value


def load_trusted_json(path: Path) -> Any:
    try:
        return loads_strict(path.read_bytes())
    except (OSError, InvalidPackage) as error:
        raise ValidatorError(f"cannot load repository trust root {path}: {error}") from error


def schema_errors(schema: Mapping[str, Any], value: Any) -> list[str]:
    try:
        validator = Draft202012Validator(schema)
        return [
            f"/{'/'.join(str(part) for part in error.absolute_path)}: {error.message}"
            for error in sorted(validator.iter_errors(value), key=lambda item: list(item.absolute_path))
        ]
    except Exception as error:  # jsonschema raises several schema/ref subclasses
        raise ValidatorError(f"JSON Schema engine failed: {error}") from error


def require_schema(schema: Mapping[str, Any], value: Any, label: str) -> None:
    errors = schema_errors(schema, value)
    if errors:
        raise InvalidPackage(f"{label} violates Draft 2020-12 schema: {'; '.join(errors[:20])}")


def require_contract_clean(diagnostics: Sequence[Any], label: str, *, trust_error: bool = False) -> None:
    if not diagnostics:
        return
    rendered = "; ".join(f"{item.code} {item.path}: {item.message}" for item in diagnostics[:20])
    if trust_error:
        raise ValidatorError(f"{label}: {rendered}")
    raise InvalidPackage(f"{label}: {rendered}")


def frame(value: str) -> bytes:
    raw = value.encode("utf-8")
    return len(raw).to_bytes(8, "big") + raw


def framed_digest(values: Iterable[str], *, prefixed: bool = False) -> str:
    digest = hashlib.sha256()
    for value in values:
        digest.update(frame(value))
    result = digest.hexdigest()
    return f"sha256:{result}" if prefixed else result


def logical_record_digest(record: Mapping[str, Any], normalization: Mapping[str, Any]) -> str:
    return framed_digest((
        str(normalization["semanticArtifactDigest"]["domain"]),
        str(record["role"]), str(record["logicalId"]), str(record["mediaType"]),
        str(record["normalizedBytes"]), str(record["normalizedSha256"]),
    ))


def binary_record_digest(record: Mapping[str, Any], normalization: Mapping[str, Any]) -> str:
    return framed_digest((
        str(normalization["binaryAssetDigest"]["domain"]),
        str(record["resourceId"]), str(record["canonicalReference"]), str(record["mediaType"]),
        str(record["bytes"]), str(record["sha256"]),
    ))


def semantic_content_digest(index: Mapping[str, Any], normalization: Mapping[str, Any]) -> str:
    values: list[str] = [str(normalization["contentDigest"]["domain"])]
    for key in ("normalizationProfile", "fieldSemanticsRegistry"):
        binding = index[key]
        values.extend((str(binding["id"]), str(binding["version"]), str(binding["sha256"])))
    values.append("semantic-artifact-records")
    values.extend(str(item["recordSha256"]) for item in sorted(index["logicalArtifacts"], key=lambda item: (item["role"], item["logicalId"])))
    values.append("binary-asset-records")
    values.extend(str(item["recordSha256"]) for item in sorted(index["binaryResources"], key=lambda item: item["resourceId"]))
    return framed_digest(values, prefixed=True)


def binary_resource_bijection(
    manifest_records: Sequence[Mapping[str, Any]],
    index_records: Sequence[Mapping[str, Any]],
    declared_count: int,
) -> tuple[dict[str, Mapping[str, Any]], dict[str, Mapping[str, Any]]]:
    manifest_ids = [
        binding.get("resourceId") if isinstance(binding, Mapping) else None
        for record in manifest_records
        for binding in (record.get("semanticBinding"),)
    ]
    index_ids = [record.get("resourceId") for record in index_records]
    if any(not isinstance(resource_id, str) for resource_id in (*manifest_ids, *index_ids)):
        raise InvalidPackage("binary resource IDs must be strings in both manifest and semantic index")
    if len(set(manifest_ids)) != len(manifest_ids):
        raise InvalidPackage("manifest binary-resource semantic IDs are duplicated")
    if len(set(index_ids)) != len(index_ids):
        raise InvalidPackage("semantic-content-index binary resource IDs are duplicated")
    if not (
        len(manifest_records)
        == len(index_records)
        == declared_count
        == len(manifest_ids)
        == len(index_ids)
    ):
        raise InvalidPackage("binary resource cardinality differs across manifest, index, and binding")
    if set(manifest_ids) != set(index_ids):
        raise InvalidPackage("binary sidecars and semantic index resource IDs differ")
    return (
        {str(resource_id): record for resource_id, record in zip(manifest_ids, manifest_records)},
        {str(resource_id): record for resource_id, record in zip(index_ids, index_records)},
    )


def safe_relative_path(path: str, limit: int) -> None:
    if not path or path.startswith("/") or "\\" in path or "\x00" in path or len(path.encode("utf-8")) > limit:
        raise InvalidPackage(f"unsafe or overlong archive path {path!r}")
    parts = path.split("/")
    if any(part in {"", ".", ".."} for part in parts):
        raise InvalidPackage(f"archive path contains an empty/dot segment: {path!r}")
    for part in parts:
        if part.endswith((".", " ")):
            raise InvalidPackage(f"archive path has a trailing dot/space: {path!r}")
        stem = part.split(".", 1)[0].upper()
        if stem in RESERVED_PORTABLE:
            raise InvalidPackage(f"archive path uses reserved portable name {part!r}")


class PinnedFile:
    """One no-follow regular-file descriptor with stable identity and bytes."""

    def __init__(self, path: Path, maximum: int | None = None) -> None:
        self.path = Path(os.path.abspath(os.fspath(path)))
        if not hasattr(os, "O_NOFOLLOW") or not hasattr(os, "pread"):
            raise ValidatorError("no-follow descriptor binding is unavailable")
        flags = os.O_RDONLY | os.O_NOFOLLOW | getattr(os, "O_CLOEXEC", 0)
        try:
            lexical = os.lstat(self.path)
            if not stat.S_ISREG(lexical.st_mode):
                raise InvalidPackage(f"input is not a regular non-symlink file: {self.path}")
            self.descriptor = os.open(self.path, flags)
        except OSError as error:
            raise InvalidPackage(f"cannot open no-follow regular file {self.path}: {error}") from error
        try:
            before = os.fstat(self.descriptor)
            if not stat.S_ISREG(before.st_mode):
                raise InvalidPackage(f"input is not a regular file: {self.path}")
            if (lexical.st_dev, lexical.st_ino) != (before.st_dev, before.st_ino):
                raise InvalidPackage(f"input path identity changed while opening: {self.path}")
            if maximum is not None and (before.st_size <= 0 or before.st_size > maximum):
                raise InvalidPackage(f"input size {before.st_size} is outside its limit: {self.path}")
            self.identity = descriptor_identity(before)
            self.path_identity = path_identity(lexical)
            self.size = before.st_size
            self.sha256 = sha256_descriptor(self.descriptor, self.size)
            after = os.fstat(self.descriptor)
            lexical_after = os.lstat(self.path)
            if (
                descriptor_identity(after) != self.identity
                or path_identity(lexical_after) != self.path_identity
            ):
                raise InvalidPackage(f"input changed during initial hashing: {self.path}")
        except Exception:
            os.close(self.descriptor)
            raise

    def duplicate(self) -> BinaryIO:
        return os.fdopen(os.dup(self.descriptor), "rb")

    def assert_unchanged(self) -> None:
        before = descriptor_identity(os.fstat(self.descriptor))
        digest = sha256_descriptor(self.descriptor, self.size)
        after = descriptor_identity(os.fstat(self.descriptor))
        try:
            lexical = os.lstat(self.path)
        except OSError as error:
            raise InvalidPackage(f"pinned input path disappeared: {self.path}") from error
        if (
            before != self.identity
            or after != self.identity
            or path_identity(lexical) != self.path_identity
            or digest != self.sha256
        ):
            raise InvalidPackage(f"pinned input changed during validation: {self.path}")

    def close(self) -> None:
        if self.descriptor >= 0:
            os.close(self.descriptor)
            self.descriptor = -1

    def __enter__(self) -> "PinnedFile":
        return self

    def __exit__(self, *_: object) -> None:
        self.close()


class SecureZip:
    """ZIP32 reader with central/local-header and deterministic-layout checks."""

    def __init__(self, path: Path, limits: Mapping[str, Any]) -> None:
        self.pinned = PinnedFile(path, int(limits["outerZipBytes"]))
        self.path = self.pinned.path
        self.size = self.pinned.size
        self.sha256 = self.pinned.sha256
        self._zip_file = self.pinned.duplicate()
        try:
            self.zip = zipfile.ZipFile(self._zip_file, "r", allowZip64=False)
            self.infos = self.zip.infolist()
            self._validate_eocd_and_entries(limits)
        except Exception:
            self._zip_file.close()
            self.pinned.close()
            raise
        try:
            first = self.infos[0].filename.split("/", 1)
            if len(first) != 2 or not first[0].endswith(".fwu-owl"):
                raise InvalidPackage("archive must have exactly one *.fwu-owl root")
            self.root = first[0]
            for info in self.infos:
                if not info.filename.startswith(self.root + "/"):
                    raise InvalidPackage("archive contains more than one root")
            self.by_relative = {info.filename[len(self.root) + 1:]: info for info in self.infos}
        except Exception:
            self.zip.close()
            self._zip_file.close()
            self.pinned.close()
            raise

    def close(self) -> None:
        self.zip.close()
        self._zip_file.close()
        self.pinned.close()

    def assert_unchanged(self) -> None:
        self.pinned.assert_unchanged()

    def __enter__(self) -> "SecureZip":
        return self

    def __exit__(self, *_: object) -> None:
        self.close()

    def _validate_eocd_and_entries(self, limits: Mapping[str, Any]) -> None:
        if not self.infos or len(self.infos) > int(limits["entryCount"]):
            raise InvalidPackage("archive entry count is outside the profile limit")
        if self.zip.comment:
            raise InvalidPackage("archive comments are forbidden")
        raw = self.pinned.descriptor
        tail_size = min(self.size, 65_557)
        tail = os.pread(raw, tail_size, self.size - tail_size)
        if True:
            marker = tail.rfind(b"PK\x05\x06")
            if marker < 0:
                raise InvalidPackage("ZIP32 EOCD is missing")
            eocd_offset = self.size - tail_size + marker
            if marker + 22 != len(tail):
                raise InvalidPackage("archive comments or trailing bytes are forbidden")
            signature, disk, central_disk, disk_count, total_count, central_size, central_offset, comment_len = struct.unpack(
                "<4s4H2LH", tail[marker:marker + 22]
            )
            if signature != b"PK\x05\x06" or any((disk, central_disk, comment_len)) or disk_count != total_count or total_count != len(self.infos):
                raise InvalidPackage("multi-disk/commented/inconsistent ZIP is forbidden")
            if total_count == 0xFFFF or central_size == 0xFFFFFFFF or central_offset == 0xFFFFFFFF:
                raise InvalidPackage("ZIP64 is forbidden")
            if central_offset + central_size != eocd_offset:
                raise InvalidPackage("central directory boundary is inconsistent")

            names = [info.filename for info in self.infos]
            if names != sorted(names):
                raise InvalidPackage("ZIP entries are not in Unicode code-point path order")
            if len(names) != len(set(names)):
                raise InvalidPackage("duplicate ZIP paths are forbidden")
            folded: set[str] = set()
            normalized: set[str] = set()
            relative_parts: list[tuple[str, ...]] = []
            total_uncompressed = 0
            spans: list[tuple[int, int, str]] = []
            timestamps: set[tuple[int, int, int, int, int, int]] = set()
            for info in self.infos:
                safe_relative_path(info.filename, int(limits["archivePathBytes"]) + 181)
                relative = info.filename.split("/", 1)[1] if "/" in info.filename else ""
                safe_relative_path(relative, int(limits["archivePathBytes"]))
                if info.filename.endswith("/") or info.is_dir():
                    raise InvalidPackage("directory ZIP entries are forbidden")
                if PurePosixPath(relative).suffix.lower() in NESTED_ARCHIVE_SUFFIXES:
                    raise InvalidPackage(f"nested archive is forbidden: {relative}")
                folded_name = unicodedata.normalize("NFC", info.filename).casefold()
                normalized_name = unicodedata.normalize("NFC", info.filename)
                if folded_name in folded or normalized_name in normalized:
                    raise InvalidPackage("case-fold or Unicode-normalization path collision")
                folded.add(folded_name)
                normalized.add(normalized_name)
                relative_parts.append(tuple(relative.split("/")))
                if info.comment or info.extra:
                    raise InvalidPackage("entry comments and extra fields are forbidden")
                if info.flag_bits & (0x1 | 0x8):
                    raise InvalidPackage("encrypted entries and data descriptors are forbidden")
                if info.compress_type != zipfile.ZIP_STORED or info.compress_size != info.file_size:
                    raise InvalidPackage("only stored, size-preserving ZIP entries are allowed")
                if info.extract_version > 20 or info.create_version > 20 or info.file_size > int(limits["genericEntryBytes"]):
                    raise InvalidPackage("ZIP64/version or generic entry size limit violated")
                mode = (info.external_attr >> 16) & 0xFFFF
                # The deterministic TypeScript writer records the complete
                # Unix mode in external_attr while retaining ZIP's DOS host
                # marker.  The security decision therefore uses the bound
                # mode bits themselves, not the informational host byte.
                if info.create_system not in {0, 3} or not stat.S_ISREG(mode) or stat.S_IMODE(mode) != 0o644:
                    raise InvalidPackage("every entry must bind a regular-file mode of 0644")
                total_uncompressed += info.file_size
                timestamps.add(info.date_time)
                header = os.pread(raw, 30, info.header_offset)
                if len(header) != 30:
                    raise InvalidPackage("truncated local ZIP header")
                fields = struct.unpack("<I5H3I2H", header)
                sig, _version, flags, method, mtime, mdate, crc, compressed, uncompressed, name_len, extra_len = fields
                local_name = os.pread(raw, name_len, info.header_offset + 30)
                local_extra = os.pread(raw, extra_len, info.header_offset + 30 + name_len)
                expected_name = info.filename.encode("utf-8" if flags & 0x800 else "cp437")
                year, month, day, hour, minute, second = info.date_time
                expected_time = (hour << 11) | (minute << 5) | (second // 2)
                expected_date = ((year - 1980) << 9) | (month << 5) | day
                if sig != 0x04034B50 or _version != info.extract_version or flags != info.flag_bits or method != info.compress_type or mtime != expected_time or mdate != expected_date or crc != info.CRC or compressed != info.compress_size or uncompressed != info.file_size:
                    raise InvalidPackage(f"local/central ZIP header mismatch for {info.filename}")
                if local_name != expected_name or local_extra or extra_len:
                    raise InvalidPackage(f"local filename/extra mismatch for {info.filename}")
                data_start = info.header_offset + 30 + name_len
                spans.append((info.header_offset, data_start + info.compress_size, info.filename))
            if total_uncompressed > int(limits["totalUncompressedBytes"]):
                raise InvalidPackage("total uncompressed size limit exceeded")
            if len(timestamps) != 1:
                raise InvalidPackage("deterministic ZIP requires one shared timestamp")
            spans.sort()
            expected_start = 0
            for start, end, name in spans:
                if start != expected_start or end > central_offset:
                    raise InvalidPackage(f"hidden gap, overlap, or invalid data span near {name}")
                expected_start = end
            if expected_start != central_offset:
                raise InvalidPackage("hidden bytes before central directory")
            paths = set(relative_parts)
            for parts in relative_parts:
                for index in range(1, len(parts)):
                    if parts[:index] in paths:
                        raise InvalidPackage("file/directory-prefix collision")
            self.timestamp = next(iter(timestamps))

    def read(self, relative: str, limit: int | None = None) -> bytes:
        info = self.by_relative.get(relative)
        if info is None:
            raise InvalidPackage(f"required package entry is missing: {relative}")
        if limit is not None and info.file_size > limit:
            raise InvalidPackage(f"entry exceeds byte limit: {relative}")
        try:
            with self.zip.open(info, "r") as handle:
                raw = handle.read((limit + 1) if limit is not None else -1)
        except (OSError, zipfile.BadZipFile) as error:
            raise InvalidPackage(f"cannot read {relative}: {error}") from error
        if limit is not None and len(raw) > limit:
            raise InvalidPackage(f"entry exceeds byte limit: {relative}")
        return raw

    def open(self, relative: str) -> BinaryIO:
        info = self.by_relative.get(relative)
        if info is None:
            raise InvalidPackage(f"required package entry is missing: {relative}")
        return self.zip.open(info, "r")

    def extract_to(self, relative: str, destination: Path) -> None:
        destination.parent.mkdir(parents=True, exist_ok=True)
        temporary = destination.with_name(f".{destination.name}.tmp-{os.getpid()}")
        try:
            with self.open(relative) as source, temporary.open("xb") as target:
                shutil.copyfileobj(source, target, 8 * 1024 * 1024)
                target.flush()
                os.fsync(target.fileno())
            os.replace(temporary, destination)
        finally:
            temporary.unlink(missing_ok=True)


def parse_checksums(raw: bytes) -> dict[str, str]:
    if not raw.endswith(b"\n") or b"\r" in raw:
        raise InvalidPackage("SHA256SUMS must be LF terminated")
    try:
        lines = raw.decode("utf-8", "strict").splitlines()
    except UnicodeError as error:
        raise InvalidPackage("SHA256SUMS is not UTF-8") from error
    result: dict[str, str] = {}
    for line in lines:
        match = re.fullmatch(r"([a-f0-9]{64})  ([^\r\n]+)", line)
        if not match:
            raise InvalidPackage(f"malformed SHA256SUMS line: {line[:120]!r}")
        digest, path = match.groups()
        safe_relative_path(path, 240)
        if path in result:
            raise InvalidPackage("duplicate SHA256SUMS path")
        result[path] = digest
    if list(result) != sorted(result):
        raise InvalidPackage("SHA256SUMS is not path-sorted")
    return result


def binding_matches(binding: Mapping[str, Any], raw: bytes, path: str) -> bool:
    return binding.get("path") == path and binding.get("bytes") == len(raw) and binding.get("sha256") == sha256_bytes(raw)


def get_binding_file(manifest: Mapping[str, Any], name: str) -> Mapping[str, Any]:
    value = manifest.get("contractBindings", {}).get(name)
    if not isinstance(value, dict):
        raise InvalidPackage(f"manifest contract binding {name!r} is missing")
    return value


def derive_registry_vocabulary(registry: Mapping[str, Any]) -> dict[str, list[str]]:
    namespace = registry.get("namespaceBindings", {}).get("sp")
    if namespace != SP:
        raise InvalidPackage("field registry has an unexpected application namespace")
    classes: set[str] = set()
    objects: set[str] = set()
    data: set[str] = set()
    observed: set[str] = set()

    def add(target: set[str], value: Any) -> None:
        if isinstance(value, str) and value.startswith("sp:"):
            target.add(SP + value[3:])

    def observe(value: Any) -> None:
        if isinstance(value, str) and value.startswith("sp:"):
            observed.add(SP + value[3:])
        elif isinstance(value, dict):
            for child in value.values():
                observe(child)
        elif isinstance(value, list):
            for child in value:
                observe(child)

    def construction_terms(construction: Any) -> None:
        if construction is None:
            return
        if not isinstance(construction, dict):
            raise InvalidPackage("registry RDF construction is malformed")
        add(classes, construction.get("resourceClass"))
        add(classes, construction.get("recordClass"))
        add(objects, construction.get("ownerPredicate"))
        mapping = construction.get("objectMapping")
        if mapping in {"typed-literal", "language-literal"}:
            add(data, construction.get("predicate"))
        elif mapping in {"iri-reference", "resource"}:
            add(objects, construction.get("predicate"))
        elif mapping in {"positioned-membership", "rdf-list"}:
            add(objects, construction.get("predicate"))
            membership = construction.get("membership")
            if not isinstance(membership, dict):
                raise InvalidPackage("registry membership construction is missing")
            add(classes, membership.get("membershipClass"))
            add(objects, membership.get("ownerPredicate"))
            add(objects, membership.get("valuePredicate"))
            add(data, membership.get("positionPredicate"))
            projection = membership.get("coreProjection")
            if isinstance(projection, dict):
                add(classes, projection.get("resourceClass"))
                add(objects, projection.get("ownerPredicate"))
                add(objects, projection.get("valuePredicate"))
        else:
            raise InvalidPackage(f"unsupported registry objectMapping {mapping!r}")

    entries = registry.get("entries")
    if not isinstance(entries, list):
        raise InvalidPackage("field registry entries are missing")
    ids: set[str] = set()
    for entry in entries:
        if not isinstance(entry, dict) or not isinstance(entry.get("entryId"), str) or entry["entryId"] in ids:
            raise InvalidPackage("field registry entry IDs are malformed or duplicated")
        ids.add(entry["entryId"])
        mapping = entry.get("rdfMapping", {})
        observe(mapping)
        construction_terms(mapping.get("construction"))
        construction_terms(mapping.get("fallbackConstruction"))
        canonical = mapping.get("canonicalJsonLiteral")
        if isinstance(canonical, dict):
            add(data, canonical.get("predicate"))
    if observed != classes | objects | data:
        raise InvalidPackage("field registry contains unclassified application vocabulary")
    if classes & (objects | data) or objects & data:
        raise InvalidPackage("field registry has cross-kind vocabulary punning")
    return {"classes": sorted(classes), "objectProperties": sorted(objects), "datatypeProperties": sorted(data)}


def nt_terms(raw_line: bytes) -> tuple[str, str, str | None, str | None]:
    if not raw_line.endswith(b"\n") or b"\r" in raw_line or len(raw_line) > 67_108_864:
        raise InvalidPackage("non-canonical or overlong N-Triples line")
    try:
        text = raw_line.decode("utf-8", "strict")
    except UnicodeError as error:
        raise InvalidPackage("N-Triples is not strict UTF-8") from error
    match = NT_LINE_RE.fullmatch(text)
    if not match:
        raise InvalidPackage(f"invalid canonical N-Triples line: {text[:200]!r}")
    subject = match.group(1)
    predicate = match.group(2)
    object_iri = match.group(4)
    literal_lexical = match.group(6)
    datatype_iri = match.group(8)
    if literal_lexical is not None:
        for escaped in re.finditer(r"\\(?:u([0-9A-Fa-f]{4})|U([0-9A-Fa-f]{8}))", literal_lexical):
            codepoint = int(escaped.group(1) or escaped.group(2), 16)
            if codepoint > 0x10FFFF or 0xD800 <= codepoint <= 0xDFFF:
                raise InvalidPackage("N-Triples literal escape is not a Unicode scalar value")
    return subject, predicate, object_iri, datatype_iri


def validate_nt_stream(handle: BinaryIO, *, collect_terms: bool) -> tuple[int, set[str], dict[str, str]]:
    previous: bytes | None = None
    count = 0
    application_terms: set[str] = set()
    declarations: dict[str, str] = {}
    for raw_line in handle:
        if previous is not None and raw_line <= previous:
            raise InvalidPackage("N-Triples lines must be strictly byte-sorted and duplicate-free")
        previous = raw_line
        subject, predicate, object_iri, datatype_iri = nt_terms(raw_line)
        count += 1
        if collect_terms:
            for term in (subject, predicate, object_iri, datatype_iri):
                if term is not None and term.startswith(SP):
                    application_terms.add(term)
        if predicate == RDF_TYPE and object_iri in {OWL_CLASS, OWL_OBJECT_PROPERTY, OWL_DATATYPE_PROPERTY}:
            if subject in declarations and declarations[subject] != object_iri:
                raise InvalidPackage("declaration segment contains cross-kind punning")
            declarations[subject] = object_iri
    return count, application_terms, declarations


def compare_bundle(archive: SecureZip, segment_paths: Sequence[str], bundle_path: str) -> None:
    with archive.open(bundle_path) as bundle:
        for segment_path in segment_paths:
            with archive.open(segment_path) as segment:
                while True:
                    expected = segment.read(8 * 1024 * 1024)
                    if not expected:
                        break
                    actual = bundle.read(len(expected))
                    if actual != expected:
                        raise InvalidPackage("rdf/bundle.nt is not the exact ordered segment concatenation")
        if bundle.read(1):
            raise InvalidPackage("rdf/bundle.nt has trailing bytes after segment concatenation")


def atomic_write(path: Path, raw: bytes) -> None:
    path = Path(os.path.abspath(os.fspath(path)))
    ensure_output_directory(path.parent, "output parent")
    if path.is_symlink() or (path.exists() and not path.is_file()):
        raise OSError(f"refusing unsafe output file: {path}")
    temporary = path.with_name(f".{path.name}.tmp-{os.getpid()}")
    try:
        with temporary.open("xb") as handle:
            handle.write(raw)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def absolute_without_resolving(path: Path) -> Path:
    expanded = path.expanduser()
    if ".." in expanded.parts:
        raise ValidatorError(f"path must not contain '..': {path}")
    return Path(os.path.abspath(os.fspath(expanded)))


def assert_no_symlink_components(path: Path, label: str) -> None:
    absolute = absolute_without_resolving(path)
    cursor = Path(absolute.anchor)
    for component in absolute.parts[1:]:
        cursor /= component
        try:
            metadata = os.lstat(cursor)
        except FileNotFoundError:
            return
        except OSError as error:
            raise ValidatorError(f"cannot inspect {label} path component {cursor}: {error}") from error
        if stat.S_ISLNK(metadata.st_mode):
            raise ValidatorError(f"{label} has a symlink path component: {cursor}")


def ensure_output_directory(path: Path, label: str) -> Path:
    absolute = absolute_without_resolving(path)
    cursor = Path(absolute.anchor)
    for component in absolute.parts[1:]:
        cursor /= component
        try:
            status = os.lstat(cursor)
        except FileNotFoundError:
            try:
                os.mkdir(cursor, 0o700)
            except FileExistsError:
                pass
            status = os.lstat(cursor)
        except OSError as error:
            raise ValidatorError(f"cannot inspect {label} path component {cursor}: {error}") from error
        if not stat.S_ISDIR(status.st_mode):
            raise ValidatorError(f"{label} must have only non-symlink directory components: {cursor}")
    return absolute


def create_fresh_output_directory(path: Path, label: str) -> Path:
    absolute = absolute_without_resolving(path)
    ensure_output_directory(absolute.parent, f"{label} parent")
    try:
        os.mkdir(absolute, 0o700)
    except FileExistsError as error:
        raise ValidatorError(f"{label} must be a fresh, previously absent directory: {absolute}") from error
    except OSError as error:
        raise ValidatorError(f"cannot create fresh {label} {absolute}: {error}") from error
    status = os.lstat(absolute)
    if not stat.S_ISDIR(status.st_mode):
        raise ValidatorError(f"could not create safe {label}: {absolute}")
    os.chmod(absolute, 0o700)
    return absolute


def same_inode(first: Path, second: Path) -> bool:
    try:
        first_status = os.stat(first, follow_symlinks=False)
        second_status = os.stat(second, follow_symlinks=False)
    except FileNotFoundError:
        return False
    return (first_status.st_dev, first_status.st_ino) == (
        second_status.st_dev,
        second_status.st_ino,
    )


def paths_overlap(first: Path, second: Path) -> bool:
    return first == second or first in second.parents or second in first.parents


def validate_path_layout(args: argparse.Namespace) -> None:
    input_names = ("zip", "source_json", "reproducibility_peer", "robot_jar")
    inputs: dict[str, Path] = {}
    for name in input_names:
        path = absolute_without_resolving(getattr(args, name))
        assert_no_symlink_components(path, name.replace("_", " "))
        try:
            status = os.lstat(path)
        except OSError as error:
            raise ValidatorError(f"required input {name} is unavailable: {path}: {error}") from error
        if not stat.S_ISREG(status.st_mode):
            raise ValidatorError(f"required input {name} is not a regular file: {path}")
        inputs[name] = path
        setattr(args, name, path)

    for index, (first_name, first) in enumerate(inputs.items()):
        for second_name, second in list(inputs.items())[index + 1 :]:
            if first.resolve(strict=True) == second.resolve(strict=True) or same_inode(first, second):
                raise ValidatorError(
                    f"input aliases are forbidden ({first_name}, {second_name}): {first} / {second}"
                )

    report = absolute_without_resolving(args.report)
    work = absolute_without_resolving(args.work_dir)
    evidence = absolute_without_resolving(args.evidence_dir)
    for path, label in ((report, "validation report"), (work, "ontology work root"), (evidence, "evidence root")):
        assert_no_symlink_components(path, label)
    if report.exists() and not stat.S_ISREG(os.lstat(report).st_mode):
        raise ValidatorError(f"validation report target is not a regular file: {report}")

    resolved_report = report.resolve(strict=False)
    resolved_work = work.resolve(strict=False)
    resolved_evidence = evidence.resolve(strict=False)
    for name, input_path in inputs.items():
        resolved_input = input_path.resolve(strict=True)
        if resolved_report == resolved_input or same_inode(report, input_path):
            raise ValidatorError(f"validation report aliases input {name}: {input_path}")
        if paths_overlap(resolved_work, resolved_input):
            raise ValidatorError(f"ontology work root overlaps input {name}: {input_path}")
        if paths_overlap(resolved_evidence, resolved_input):
            raise ValidatorError(f"evidence root overlaps input {name}: {input_path}")
    if paths_overlap(resolved_work, resolved_evidence):
        raise ValidatorError("ontology work and evidence roots must be disjoint")
    if resolved_report == resolved_work or resolved_work in resolved_report.parents:
        raise ValidatorError("validation report must be outside the ontology work root")
    if resolved_report == resolved_evidence or resolved_evidence in resolved_report.parents:
        raise ValidatorError("validation report must be outside the evidence root")
    try:
        resolved_evidence.relative_to(resolved_report.parent)
    except ValueError as error:
        raise ValidatorError("evidence root must be below the validation report directory") from error

    args.report = report
    args.work_dir = work
    args.evidence_dir = evidence


def run_command(command: Sequence[str], *, cwd: Path, log_path: Path, timeout: int = 3600) -> subprocess.CompletedProcess[str]:
    try:
        result = subprocess.run(command, cwd=cwd, stdin=subprocess.DEVNULL, capture_output=True, text=True, timeout=timeout, check=False)
    except (OSError, subprocess.TimeoutExpired) as error:
        raise ValidatorError(f"cannot run mandatory tool {command[0]}: {error}") from error
    rendered = ("COMMAND " + " ".join(command) + "\nEXIT " + str(result.returncode) + "\nSTDOUT\n" + result.stdout + "\nSTDERR\n" + result.stderr).encode("utf-8")
    atomic_write(log_path, rendered)
    return result


def read_repository_version_pin(path: Path) -> str:
    try:
        with PinnedFile(path, 128) as pinned:
            raw = os.pread(pinned.descriptor, pinned.size, 0)
            pinned.assert_unchanged()
    except InvalidPackage as error:
        raise ValidatorError(f"cannot bind repository version pin {path}: {error}") from error
    if not raw.endswith(b"\n") or raw.count(b"\n") != 1:
        raise ValidatorError(f"repository version pin must be one LF-terminated line: {path}")
    try:
        value = raw[:-1].decode("ascii", "strict")
    except UnicodeError as error:
        raise ValidatorError(f"repository version pin is not ASCII: {path}") from error
    if VERSION_PIN_RE.fullmatch(value) is None:
        raise ValidatorError(f"repository version pin has an unsupported value: {path}")
    return value


def validate_pinned_java_runtime(executable: Path | None = None) -> tuple[Path, dict[str, str]]:
    expected_java = read_repository_version_pin(JAVA_VERSION_PATH)
    expected_corretto = read_repository_version_pin(CORRETTO_VERSION_PATH)
    candidate = os.fspath(executable) if executable is not None else shutil.which("java")
    if not candidate:
        raise ValidatorError("java executable is unavailable")
    try:
        resolved = Path(candidate).resolve(strict=True)
        with PinnedFile(resolved, 1_000_000_000) as pinned:
            result = subprocess.run(
                [str(resolved), "-version"],
                stdin=subprocess.DEVNULL,
                capture_output=True,
                text=True,
                timeout=30,
                check=False,
            )
            pinned.assert_unchanged()
    except (OSError, subprocess.SubprocessError, InvalidPackage) as error:
        raise ValidatorError(f"cannot execute pinned Java runtime: {error}") from error
    combined = "\n".join(part for part in (result.stdout, result.stderr) if part)
    java_match = re.search(r'version\s+"([^"]+)"', combined)
    corretto_match = re.search(
        r"\bCorretto-([0-9]+(?:\.[0-9]+){2,4})(?=[\s)])",
        combined,
    )
    observed_java = java_match.group(1) if java_match else None
    observed_corretto = corretto_match.group(1) if corretto_match else None
    if (
        result.returncode != 0
        or observed_java != expected_java
        or observed_corretto != expected_corretto
    ):
        raise ValidatorError(
            "Java runtime differs from repository pins: "
            f"expected Java {expected_java} / Corretto {expected_corretto}, "
            f"observed Java {observed_java!r} / Corretto {observed_corretto!r}"
        )
    return resolved, {
        "javaVersion": expected_java,
        "correttoVersion": expected_corretto,
    }


def parse_hermit_semantic_failure(output: str) -> tuple[bool, int] | None:
    """Return (consistent, unsatisfiable count) only for exact ROBOT semantics."""
    if "The ontology is inconsistent. TIP: use a tool like Protege to find explanations" in output:
        return False, 0
    matches = re.findall(r"There are ([1-9][0-9]*) unsatisfiable (?:classes|properties) in the ontology\.", output)
    if matches:
        return True, sum(int(value) for value in matches)
    return None


class Validation:
    def __init__(self, args: argparse.Namespace, trusted: Mapping[str, Any]) -> None:
        self.args = args
        self.trusted = trusted
        self.java_binding = dict(args.java_binding)
        self.gates = {gate: {"id": gate, "status": "not-evaluated", "summary": "Not evaluated."} for gate in GATES}
        self.diagnostics: list[Diagnostic] = []
        self.archive: SecureZip | None = None
        self.manifest: dict[str, Any] | None = None
        self.entry_hashes: dict[str, tuple[int, str]] = {}
        self.source_manifest: dict[str, Any] | None = None
        self.semantic_index: dict[str, Any] | None = None
        self.registry: dict[str, Any] | None = None
        self.normalization: dict[str, Any] | None = None
        self.counts: dict[str, int] | None = None
        self.ontology = {
            "rdfSyntax": self.tool_evidence(), "shacl": self.shacl_evidence(),
            "owl2Dl": self.tool_evidence(), "reasoner": self.reasoner_evidence(),
        }
        self.reproducibility = {
            "status": "not-evaluated", "sourceDateEpoch": None, "locale": "C.UTF-8", "timezone": "UTC",
            "runA": None, "runB": None, "byteIdentical": None,
        }
        self.error = False

    @staticmethod
    def tool_evidence() -> dict[str, Any]:
        return {"status": "not-evaluated", "tool": None, "version": None, "report": None, "reportSha256": None}

    @staticmethod
    def shacl_evidence() -> dict[str, Any]:
        return {**Validation.tool_evidence(), "violationCount": None, "warningCount": None}

    @staticmethod
    def reasoner_evidence() -> dict[str, Any]:
        return {**Validation.tool_evidence(), "consistent": None, "unsatisfiableClassCount": None}

    def evidence_path(self, path: Path) -> str:
        report_parent = Path(os.path.abspath(os.fspath(self.args.report))).parent.resolve()
        resolved = path.resolve()
        try:
            relative = resolved.relative_to(report_parent)
        except ValueError as error:
            raise ValidatorError("evidence directory must be inside the validation report directory") from error
        value = relative.as_posix()
        safe_relative_path(value, 4096)
        return value

    def verify_report_evidence(self, report: Mapping[str, Any]) -> None:
        report_parent = Path(os.path.abspath(os.fspath(self.args.report))).parent.resolve()
        evidence = report["ontologyEvidence"]
        for name in ("rdfSyntax", "shacl", "owl2Dl", "reasoner"):
            binding = evidence[name]
            if binding["status"] == "not-evaluated":
                continue
            relative = binding.get("report")
            if not isinstance(relative, str):
                raise ValidatorError(f"ontology evidence path is absent for {name}")
            safe_relative_path(relative, 4096)
            path = (report_parent / relative).resolve()
            try:
                path.relative_to(report_parent)
            except ValueError as error:
                raise ValidatorError(f"ontology evidence escapes the report directory: {name}") from error
            with PinnedFile(path, 1_000_000_000) as pinned:
                if pinned.sha256 != binding.get("reportSha256"):
                    raise ValidatorError(f"ontology evidence hash differs for {name}")
                pinned.assert_unchanged()

    def pass_gate(self, gate: str, summary: str) -> None:
        self.gates[gate] = {"id": gate, "status": "passed", "summary": summary}

    def fail_gate(self, gate: str, code: str, path: str, message: str) -> None:
        self.gates[gate] = {"id": gate, "status": "failed", "summary": message[:1000].strip() or "Validation failed."}
        if len(self.diagnostics) < 500:
            self.diagnostics.append(Diagnostic(code, path, message[:4000].strip() or "Validation failed."))

    def evaluate(self, gate: str, function: Any) -> bool:
        try:
            summary = function()
            self.pass_gate(gate, summary)
            return True
        except InvalidPackage as error:
            self.fail_gate(gate, "PACKAGE_INVALID", f"/{gate}", str(error))
            return False
        except ValidatorError as error:
            self.error = True
            self.diagnostics.append(Diagnostic("VALIDATOR_ERROR", f"/{gate}", str(error)))
            return False
        except Exception as error:
            self.error = True
            self.diagnostics.append(Diagnostic("VALIDATOR_INTERNAL_ERROR", f"/{gate}", f"{type(error).__name__}: {error}"))
            return False

    def validate(self) -> dict[str, Any]:
        try:
            if not self.evaluate("archive-security", self.archive_security):
                return self.finish()
            if not self.evaluate("manifest-schema", self.manifest_schema):
                return self.finish()
            for gate, method in (
                ("profile-contract", self.profile_contract), ("inventory", self.inventory),
                ("contract-bindings", self.contract_bindings), ("offline-schema-catalog", self.schema_catalog),
                ("semantic-content-index", self.semantic_content), ("field-registry-coverage", self.registry_coverage),
                ("rdf-syntax", self.rdf_syntax), ("rdf-segment-order", self.rdf_order),
                ("rdf-bundle", self.rdf_bundle), ("core-binding", self.core_binding),
                ("ontology-profile", self.ontology_profile), ("binary-sidecars", self.binary_sidecars),
                ("reproducibility", self.reproducibility_gate),
            ):
                if not self.evaluate(gate, method):
                    return self.finish()
            if self.args.skip_ontology_tools:
                self.error = True
                self.diagnostics.append(Diagnostic("ONTOLOGY_TOOLS_SKIPPED", "/shacl", "Mandatory SHACL, OWL 2 DL, and HermiT gates were explicitly skipped."))
                return self.finish()
            for gate, method in (("shacl", self.shacl), ("owl2-dl", self.owl2_dl), ("reasoner", self.reasoner)):
                if not self.evaluate(gate, method):
                    return self.finish()
            return self.finish()
        finally:
            if self.archive is not None:
                self.archive.close()

    def finish(self) -> dict[str, Any]:
        if self.archive is not None:
            try:
                self.archive.assert_unchanged()
            except InvalidPackage as error:
                self.fail_gate("archive-security", "INPUT_CHANGED", "/input", str(error))
        return self.report()

    def archive_security(self) -> str:
        path = self.args.zip
        if not path.name.endswith(".fwu-owl.zip"):
            raise InvalidPackage("input filename must end in .fwu-owl.zip")
        self.archive = SecureZip(path, self.trusted["profile"]["archiveLimits"])
        return f"Secure deterministic ZIP32 structure passed for {len(self.archive.infos)} entries."

    def manifest_schema(self) -> str:
        assert self.archive is not None
        raw = self.archive.read(MANIFEST_REL, int(self.trusted["profile"]["manifestLimits"]["manifestBytes"]))
        value = loads_strict(raw, max_depth=int(self.trusted["profile"]["archiveLimits"]["jsonMaxDepth"]), max_nodes=int(self.trusted["profile"]["archiveLimits"]["jsonMaxNodes"]))
        if not isinstance(value, dict):
            raise InvalidPackage("manifest must be a JSON object")
        require_schema(self.trusted["manifestSchema"], value, "manifest")
        if value.get("archiveRoot") != self.archive.root:
            raise InvalidPackage("manifest archiveRoot differs from the ZIP root")
        self.manifest = value
        return "Manifest is strict JSON and valid against the repository Draft 2020-12 trust root."

    def profile_contract(self) -> str:
        assert self.archive is not None and self.manifest is not None
        local_raw = self.trusted["profileRaw"]
        embedded = self.archive.read("profiles/fwu-owl-v1.profile.json", int(self.trusted["profile"]["archiveLimits"]["jsonEntryBytes"]))
        if embedded != local_raw:
            raise InvalidPackage("embedded package profile differs from the repository trust root")
        embedded_value = loads_strict(embedded)
        require_schema(self.trusted["profileSchema"], embedded_value, "package profile")
        binding = get_binding_file(self.manifest, "packageProfile")
        if not binding_matches(binding, embedded, "profiles/fwu-owl-v1.profile.json") or binding.get("id") != "fwu-owl-v1":
            raise InvalidPackage("manifest packageProfile binding does not bind the trusted bytes")
        compatibility = self.trusted["profile"]["compatibility"]
        for field in ("packageFormatVersion", "variant"):
            if self.manifest.get(field) != compatibility.get(field):
                raise InvalidPackage(f"manifest/profile compatibility mismatch for {field}")
        if self.manifest.get("releaseProfile") != self.trusted["profile"].get("profileId"):
            raise InvalidPackage("manifest releaseProfile differs from trusted profileId")
        return "Embedded profile is byte-identical to the schema-valid repository trust root."

    def inventory(self) -> str:
        assert self.archive is not None and self.manifest is not None
        files = self.manifest.get("files")
        if not isinstance(files, list):
            raise InvalidPackage("manifest files inventory is missing")
        records: dict[str, Mapping[str, Any]] = {}
        roles = Counter()
        for record in files:
            if not isinstance(record, dict) or not isinstance(record.get("path"), str) or record["path"] in records:
                raise InvalidPackage("manifest file paths are malformed or duplicated")
            records[record["path"]] = record
            roles[str(record.get("role"))] += 1
        actual = set(self.archive.by_relative)
        excluded = set(self.trusted["profile"]["inventoryPolicy"]["excludedPaths"])
        if actual - excluded != set(records) or actual & excluded != excluded:
            raise InvalidPackage("manifest inventory is not the exact archive file set")
        policy_by_role = {item["role"]: item for item in self.trusted["profile"]["roles"]}
        if set(roles) != set(policy_by_role):
            raise InvalidPackage("manifest uses an unknown role or omits a required role")
        for role, policy in policy_by_role.items():
            if not int(policy["minimum"]) <= roles[role] <= int(policy["maximum"]):
                raise InvalidPackage(f"role cardinality violated for {role}")
        checksums = parse_checksums(self.archive.read(CHECKSUM_REL, 67_108_864))
        expected_checksum_paths = actual - {CHECKSUM_REL}
        if set(checksums) != expected_checksum_paths:
            raise InvalidPackage("SHA256SUMS does not cover every other archive entry exactly once")
        for relative, info in self.archive.by_relative.items():
            with self.archive.open(relative) as handle:
                size, digest = hash_stream(handle)
            self.entry_hashes[relative] = (size, digest)
            if relative != CHECKSUM_REL and checksums.get(relative) != digest:
                raise InvalidPackage(f"SHA256SUMS mismatch for {relative}")
            record = records.get(relative)
            if record is not None:
                if record.get("bytes") != size or record.get("sha256") != digest:
                    raise InvalidPackage(f"manifest byte/hash mismatch for {relative}")
                policy = policy_by_role[str(record.get("role"))]
                if record.get("mediaType") not in policy["mediaTypes"] or record.get("semanticBinding", {}).get("kind") not in policy["semanticBindingKinds"]:
                    raise InvalidPackage(f"manifest role/media/semantic binding mismatch for {relative}")
        self.counts = {
            "zipEntries": len(actual), "manifestFiles": len(files), "rdfSegments": 0, "rdfTriples": 0,
            "logicalArtifacts": 0, "fieldRegistryEntries": 0, "binaryResources": roles["binary-resource"],
            "binaryBytes": sum(int(item["bytes"]) for item in files if item.get("role") == "binary-resource"),
        }
        return f"Exact {len(files)}-record inventory, role policy, CRC, SHA256SUMS, and manifest hashes passed."

    def _source_zip_data(self) -> tuple[dict[str, Any], bytes, bytes, dict[str, bytes]]:
        source = Path(os.path.abspath(os.fspath(self.args.source_json)))
        with PinnedFile(source, 3_500_000_000) as pinned:
            before = pinned.sha256
            source_size = pinned.size
            command = [sys.executable, str(FULL_STANDALONE_VALIDATOR), "--zip", str(source), "--json"]
            try:
                result = subprocess.run(command, cwd=REPO_ROOT, stdin=subprocess.DEVNULL, capture_output=True, text=True, timeout=3600, check=False)
            except (OSError, subprocess.TimeoutExpired) as error:
                raise ValidatorError(f"independent JSON-package validator could not run: {error}") from error
            if result.returncode != 0:
                detail = result.stderr.strip() or result.stdout.strip()
                raise InvalidPackage(f"source JSON package failed its independent validator: {detail[:2000]}")
            try:
                source_report = json.loads(result.stdout)
            except json.JSONDecodeError as error:
                raise ValidatorError("independent JSON-package validator emitted malformed JSON") from error
            if source_report.get("status") != "valid":
                raise InvalidPackage("source JSON package validator did not report valid")
            source_report_input = source_report.get("input", {})
            if source_report_input.get("bytes") != source_size or source_report_input.get("sha256") != before:
                raise InvalidPackage("independent source validator did not validate the pinned JSON ZIP bytes")
            pinned.assert_unchanged()
            with pinned.duplicate() as source_file, zipfile.ZipFile(source_file, "r", allowZip64=False) as archive:
                names = archive.namelist()
                roots = {name.split("/", 1)[0] for name in names if "/" in name}
                if len(roots) != 1:
                    raise InvalidPackage("source JSON ZIP root is ambiguous")
                root = next(iter(roots))

                def read(relative: str, limit: int = 67_108_864) -> bytes:
                    full = f"{root}/{relative}"
                    try:
                        info = archive.getinfo(full)
                    except KeyError as error:
                        raise InvalidPackage(f"source JSON package lacks {relative}") from error
                    if info.file_size > limit:
                        raise InvalidPackage(f"source JSON entry too large: {relative}")
                    return archive.read(info)

                manifest_raw = read(MANIFEST_REL)
                manifest = loads_strict(manifest_raw)
                index_raw = read("metadata/semantic-content-index.json")
                contracts: dict[str, bytes] = {}
                assert self.manifest is not None
                expected_semantic = self.manifest["sourceJsonPackage"]["semanticContracts"]
                source_contract_bindings = manifest.get("contractBindings", {})
                for name in expected_semantic:
                    binding = source_contract_bindings.get(name)
                    if not isinstance(binding, dict) or not isinstance(binding.get("path"), str):
                        raise InvalidPackage(f"source JSON manifest lacks semantic contract binding {name}")
                    contracts[name] = read(binding["path"])
                source_release_binding = manifest.get("contractBindings", {}).get("releaseProfile")
                if not isinstance(source_release_binding, dict) or not isinstance(source_release_binding.get("path"), str):
                    raise InvalidPackage("source JSON manifest lacks releaseProfile contract binding")
                release_raw = read(source_release_binding["path"])
            pinned.assert_unchanged()
        source_report_package = source_report.get("package", {})
        if source_report_package.get("manifestSha256") != sha256_bytes(manifest_raw):
            raise InvalidPackage("independent source validator manifest hash differs from the pinned JSON ZIP")
        expected = self.manifest["sourceJsonPackage"]
        actual_identity = {
            "file": source.name, "bytes": source_size, "sha256": before,
            "manifestSha256": sha256_bytes(manifest_raw),
        }
        for field, value in actual_identity.items():
            if expected.get(field) != value:
                raise InvalidPackage(f"sourceJsonPackage identity mismatch for {field}")
        for field in ("releaseId", "curriculumEdition", "contentDigest", "runtimeContractVersion", "releaseProfile", "supportedSkillpilotSoftware"):
            if expected.get(field) != manifest.get(field):
                raise InvalidPackage(f"sourceJsonPackage manifest mismatch for {field}")
        derived_release_binding = {
            "id": source_release_binding.get("id"), "path": source_release_binding.get("path"),
            "bytes": len(release_raw), "sha256": sha256_bytes(release_raw),
        }
        if expected.get("releaseProfileBinding") != derived_release_binding:
            raise InvalidPackage("sourceJsonPackage releaseProfileBinding differs from source bytes")
        for name, expected_binding in expected["semanticContracts"].items():
            source_binding = manifest.get("contractBindings", {}).get(name)
            if not isinstance(source_binding, dict):
                raise InvalidPackage(f"source JSON manifest lacks contract binding {name}")
            derived = {field: source_binding.get(field) for field in ("id", "path", "sha256")}
            if expected_binding != derived or sha256_bytes(contracts[name]) != source_binding.get("sha256"):
                raise InvalidPackage(f"sourceJsonPackage semantic contract binding differs for {name}")
        self._source_validation = {
            "status": "valid",
            "input": {
                "file": source.name, "bytes": source_size, "sha256": before,
                "manifestSha256": sha256_bytes(manifest_raw),
            },
            "manifest": manifest,
        }
        return manifest, index_raw, manifest_raw, contracts

    def contract_bindings(self) -> str:
        assert self.archive is not None and self.manifest is not None
        policy = self.trusted["profile"]["contractPolicy"]
        bindings = self.manifest.get("contractBindings", {})
        if list(bindings) != list(policy["requiredBindings"]):
            raise InvalidPackage("contract binding names/order differ from trusted policy")
        for spec in [*policy["trustedBootstrapSchemas"], *policy["trustedGlobalContracts"]]:
            local_path = REPO_ROOT / spec["sourcePath"]
            try:
                local_raw = local_path.read_bytes()
            except OSError as error:
                raise ValidatorError(f"cannot read trust root {local_path}: {error}") from error
            if len(local_raw) != spec["bytes"] or sha256_bytes(local_raw) != spec["sha256"]:
                raise ValidatorError(f"repository trust root drifted: {spec['sourcePath']}")
            package_raw = self.archive.read(spec["packagePath"], int(self.trusted["profile"]["archiveLimits"]["jsonEntryBytes"]))
            if package_raw != local_raw:
                raise InvalidPackage(f"package contract differs from trust root: {spec['bindingName']}")
            binding = get_binding_file(self.manifest, spec["bindingName"])
            if binding.get("id") != spec["id"] or not binding_matches(binding, package_raw, spec["packagePath"]):
                raise InvalidPackage(f"manifest trust binding mismatch: {spec['bindingName']}")
        self.source_manifest, source_index_raw, _source_manifest_raw, source_contracts = self._source_zip_data()
        self._source_index_raw = source_index_raw
        source_bindings = self.manifest["sourceJsonPackage"]["semanticContracts"]
        for name, source_raw in source_contracts.items():
            if name not in source_bindings:
                continue
            target = get_binding_file(self.manifest, name)
            package_raw = self.archive.read(str(target["path"]), 67_108_864)
            if package_raw != source_raw or sha256_bytes(source_raw) != source_bindings[name]["sha256"]:
                raise InvalidPackage(f"source/FWU semantic contract bytes differ for {name}")
        require_contract_clean(
            contract_audit.validate_manifest(self.manifest, self.trusted["profile"], self._source_validation),
            "closed FWU manifest contract validation failed",
        )
        return "Repository trust roots and independently validated source-JSON identity/contracts are exactly bound."

    def schema_catalog(self) -> str:
        assert self.archive is not None and self.manifest is not None
        raw = self.archive.read("schemas/catalog.json", 67_108_864)
        catalog = loads_strict(raw)
        schema = loads_strict(self.archive.read("schemas/schema-catalog.schema.json", 67_108_864))
        require_schema(schema, catalog, "offline schema catalog")
        entries = catalog.get("entries", [])
        ids = [item.get("id") for item in entries]
        paths = [item.get("path") for item in entries]
        policy = self.trusted["profile"]["schemaCatalogPolicy"]
        if ids != sorted(policy["requiredSchemaIds"]) or len(ids) != len(set(ids)) or len(paths) != len(set(paths)):
            raise InvalidPackage("schema catalog is not the exact sorted closed schema-ID set")
        for item in entries:
            package_raw = self.archive.read(item["path"], 67_108_864)
            if len(package_raw) != item["bytes"] or sha256_bytes(package_raw) != item["sha256"]:
                raise InvalidPackage(f"schema catalog hash mismatch: {item['id']}")
            value = loads_strict(package_raw)
            if value.get("$id") != item["id"] or value.get("$schema") != policy["dialect"]:
                raise InvalidPackage(f"schema identity/dialect mismatch: {item['id']}")
            Draft202012Validator.check_schema(value)
        binding = self.manifest["schemaCatalog"]
        if binding.get("entries") != len(entries) or not binding_matches(binding, raw, "schemas/catalog.json"):
            raise InvalidPackage("manifest schemaCatalog binding mismatch")
        return f"Closed offline catalog binds and meta-validates exactly {len(entries)} Draft 2020-12 schemas."

    def semantic_content(self) -> str:
        assert self.archive is not None and self.manifest is not None and self.counts is not None
        raw = self.archive.read("metadata/semantic-content-index.json", 67_108_864)
        if raw != self._source_index_raw:
            raise InvalidPackage("FWU and independently validated JSON packages carry different semantic content indexes")
        index = loads_strict(raw)
        schema = loads_strict(self.archive.read("schemas/semantic-content-index.schema.json", 67_108_864))
        require_schema(schema, index, "semantic content index")
        normalization_raw = self.archive.read(get_binding_file(self.manifest, "semanticNormalForm")["path"], 67_108_864)
        normalization = loads_strict(normalization_raw)
        logical = index["logicalArtifacts"]
        binary = index["binaryResources"]
        if logical != sorted(logical, key=lambda item: (item["role"], item["logicalId"])) or binary != sorted(binary, key=lambda item: item["resourceId"]):
            raise InvalidPackage("semantic content records are not deterministically sorted")
        if len({(item["role"], item["logicalId"]) for item in logical}) != len(logical) or len({item["resourceId"] for item in binary}) != len(binary):
            raise InvalidPackage("semantic content index identities are duplicated")
        for item in logical:
            if item["recordSha256"] != logical_record_digest(item, normalization):
                raise InvalidPackage(f"logical record digest mismatch: {item['role']}:{item['logicalId']}")
        for item in binary:
            if item["recordSha256"] != binary_record_digest(item, normalization):
                raise InvalidPackage(f"binary record digest mismatch: {item['resourceId']}")
        calculated = semantic_content_digest(index, normalization)
        if calculated != index["contentDigest"] or calculated != self.manifest["contentDigest"] or calculated != self.manifest["sourceJsonPackage"]["contentDigest"]:
            raise InvalidPackage("semantic content digest recomputation differs from package bindings")
        binding = self.manifest["semanticContentIndex"]
        if not binding_matches(binding, raw, "metadata/semantic-content-index.json") or binding["contentDigest"] != calculated or binding["logicalArtifactCount"] != len(logical) or binding["binaryResourceCount"] != len(binary):
            raise InvalidPackage("manifest semanticContentIndex binding/count mismatch")
        self.semantic_index = index
        self.normalization = normalization
        self.counts["logicalArtifacts"] = len(logical)
        return f"Recomputed shared content digest from {len(logical)} logical and {len(binary)} binary records."

    def registry_coverage(self) -> str:
        assert self.archive is not None and self.manifest is not None and self.semantic_index is not None and self.counts is not None
        binding = get_binding_file(self.manifest, "fieldSemanticsRegistry")
        raw = self.archive.read(binding["path"], 67_108_864)
        registry = loads_strict(raw)
        schema_entry = next(item for item in loads_strict(self.archive.read("schemas/catalog.json", 67_108_864))["entries"] if item["id"].endswith("field-semantics-registry.schema.json"))
        require_schema(loads_strict(self.archive.read(schema_entry["path"], 67_108_864)), registry, "field semantics registry")
        vocab = derive_registry_vocabulary(registry)
        policy = self.trusted["profile"]["declarationPolicy"]["fieldSemanticsRegistryVocabulary"]
        for key, count_key in (("classes", "expectedClassCount"), ("objectProperties", "expectedObjectPropertyCount"), ("datatypeProperties", "expectedDatatypePropertyCount")):
            if len(vocab[key]) != policy[count_key]:
                raise InvalidPackage(f"derived registry vocabulary count differs for {key}")
        index_binding = self.semantic_index["fieldSemanticsRegistry"]
        if index_binding.get("id") != registry.get("registryId") or index_binding.get("version") != registry.get("version") or index_binding.get("sha256") != sha256_bytes(raw):
            raise InvalidPackage("semantic index does not bind the exact field registry")
        self.registry = registry
        self.counts["fieldRegistryEntries"] = len(registry["entries"])
        if self.manifest["semanticContentIndex"]["fieldRegistryEntryCount"] != len(registry["entries"]):
            raise InvalidPackage("manifest fieldRegistryEntryCount differs")
        return f"Schema-valid registry has {len(registry['entries'])} unique entries and a closed, correctly classified vocabulary."

    def rdf_syntax(self) -> str:
        assert self.archive is not None and self.manifest is not None and self.counts is not None and self.registry is not None
        segments = self.manifest["rdfSegments"]
        all_terms: set[str] = set()
        declaration_map: dict[str, str] = {}
        total = 0
        for segment in segments:
            path = segment["path"]
            with self.archive.open(path) as handle:
                count, terms, declarations = validate_nt_stream(handle, collect_terms=True)
            if count != segment["triples"]:
                raise InvalidPackage(f"N-Triples count mismatch for {path}")
            total += count
            all_terms.update(terms)
            if segment["segmentId"] == "declarations":
                declaration_map = declarations
        declaration_policy = self.trusted["profile"]["declarationPolicy"]
        registry_vocab = derive_registry_vocabulary(self.registry)
        ontology_vocab = declaration_policy["applicationOntologyVocabulary"]
        expected: dict[str, str] = {}
        for key, owl_type in (("classes", OWL_CLASS), ("objectProperties", OWL_OBJECT_PROPERTY), ("datatypeProperties", OWL_DATATYPE_PROPERTY)):
            for iri in set(registry_vocab[key]) | set(ontology_vocab[key]):
                if iri in expected and expected[iri] != owl_type:
                    raise InvalidPackage("expected application vocabulary has cross-kind punning")
                expected[iri] = owl_type
        bootstrap = declaration_policy["parserBootstrapProperties"]
        for iri in bootstrap["objectProperties"]:
            expected[iri] = OWL_OBJECT_PROPERTY
        for iri in bootstrap["datatypeProperties"]:
            if iri in expected and expected[iri] != OWL_DATATYPE_PROPERTY:
                raise InvalidPackage("bootstrap/application property punning")
            expected[iri] = OWL_DATATYPE_PROPERTY
        if declaration_map != expected or len(declaration_map) != declaration_policy["expectedDeclarationTripleCount"]:
            raise InvalidPackage("declaration segment is not the exact registry/application/bootstrap declaration set")
        undeclared = sorted(term for term in all_terms if term.startswith(SP) and term not in expected)
        if undeclared:
            raise InvalidPackage(f"used application terms are undeclared: {undeclared[:10]}")
        self._segment_paths = [item["path"] for item in segments]
        self._rdf_total = total
        self.counts["rdfSegments"] = len(segments)
        self.counts["rdfTriples"] = total
        evidence = self.args.evidence_dir / "rdf-syntax.txt"
        atomic_write(evidence, f"passed\nsegments={len(segments)}\ntriples={total}\ndeclarations={len(declaration_map)}\n".encode())
        self.ontology["rdfSyntax"] = {"status": "passed", "tool": "skillpilot-ntriples-stream-validator", "version": "1.0.0", "report": self.evidence_path(evidence), "reportSha256": sha256_file(evidence)}
        return f"All {total} positioned triples are strict UTF-8, canonical, sorted N-Triples with closed declarations."

    def rdf_order(self) -> str:
        assert self.manifest is not None
        segments = self.manifest["rdfSegments"]
        if len(segments) != 8 or [(item["position"], item["segmentId"]) for item in segments] != list(enumerate(SEGMENTS)):
            raise InvalidPackage("RDF segment positions/order differ from the closed profile")
        if self.manifest["rdfBundle"]["segmentOrder"] != list(SEGMENTS):
            raise InvalidPackage("RDF bundle segmentOrder differs")
        return "Eight normative RDF segments have exact positions 0..7 in the closed profile order."

    def rdf_bundle(self) -> str:
        assert self.archive is not None and self.manifest is not None
        bundle = self.manifest["rdfBundle"]
        compare_bundle(self.archive, self._segment_paths, bundle["path"])
        if bundle["triples"] != self._rdf_total or bundle["construction"] != "ordered-rdf-segment-byte-concatenation-v1":
            raise InvalidPackage("RDF bundle count/construction binding differs")
        return "RDF bundle is byte-identical to the ordered concatenation of all eight segments."

    def core_binding(self) -> str:
        assert self.archive is not None and self.manifest is not None
        policy = self.trusted["profile"]["coreBindingPolicy"]
        manifest_core = self.manifest["fwuCore"]
        mapping = {"canonicalOntologyIri": "ontologyIri", "sourceCommit": "commit", "bundledPath": "bundledPath"}
        for key, expected in policy.items():
            target = mapping.get(key, key)
            if key in {"catalogSourcePath", "catalogResolutionPolicy", "requireCommit", "requireSourcePath", "requireByteHash", "remoteResolutionAllowed"}:
                continue
            if manifest_core.get(target) != expected:
                raise InvalidPackage(f"FWU Core manifest/profile mismatch for {target}")
        core_raw = self.archive.read(policy["bundledPath"], 134_217_728)
        catalog_raw = self.archive.read(policy["catalogPath"], 1_048_576)
        if len(core_raw) != policy["bytes"] or sha256_bytes(core_raw) != policy["sha256"] or len(catalog_raw) != policy["catalogBytes"] or sha256_bytes(catalog_raw) != policy["catalogSha256"]:
            raise InvalidPackage("pinned Core or XML catalog byte binding differs")
        return f"Pinned FWU Core commit {policy['sourceCommit']} and exact offline catalog bytes are bound."

    def ontology_profile(self) -> str:
        assert self.archive is not None and self.manifest is not None
        for policy_name, manifest_name in (("applicationProfilePolicy", "applicationProfile"), ("shapesPolicy", "shapes")):
            policy = self.trusted["profile"][policy_name]
            raw = self.archive.read(policy["packagePath"], 67_108_864)
            local_path = REPO_ROOT / policy["sourcePath"]
            try:
                local = local_path.read_bytes()
            except OSError as error:
                raise ValidatorError(f"cannot read ontology trust root {local_path}: {error}") from error
            if raw != local or len(raw) != policy["bytes"] or sha256_bytes(raw) != policy["sha256"]:
                raise InvalidPackage(f"{policy_name} differs from repository trust root")
            binding = self.manifest[manifest_name]
            if not binding_matches(binding, raw, policy["packagePath"]):
                raise InvalidPackage(f"manifest {manifest_name} hash binding differs")
        profile_text = self.archive.read(self.trusted["profile"]["applicationProfilePolicy"]["packagePath"], 67_108_864).decode("utf-8")
        imports = re.findall(r"\bowl:imports\s+<([^>]+)>", profile_text)
        if imports != self.trusted["profile"]["applicationProfilePolicy"]["requiredImports"]:
            raise InvalidPackage("application profile does not import exactly the pinned Core IRI")
        shapes_text = self.archive.read(self.trusted["profile"]["shapesPolicy"]["packagePath"], 67_108_864).decode("utf-8")
        if re.search(r"\bsh:(?:SPARQLConstraint|JSConstraint|sparql|js|select|ask|construct)\b", shapes_text, re.IGNORECASE):
            raise InvalidPackage("executable SHACL constraints are forbidden")
        catalog_text = self.archive.read("catalog-v001.xml", 1_048_576).decode("utf-8")
        core_iri = self.trusted["profile"]["coreBindingPolicy"]["canonicalOntologyIri"]
        expected = f'<uri name="{core_iri}" uri="ontology/lehrplan-core.owl"/>'
        if "<!DOCTYPE" in catalog_text.upper() or "<!ENTITY" in catalog_text.upper() or catalog_text.count("<uri ") != 1 or expected not in catalog_text:
            raise InvalidPackage("offline XML catalog is not the exact single safe Core mapping")
        return "Static application ontology and non-executable SHACL shapes equal repository trust roots."

    def binary_sidecars(self) -> str:
        assert self.archive is not None and self.manifest is not None and self.semantic_index is not None and self.counts is not None
        manifest_records = [
            item for item in self.manifest["files"] if item["role"] == "binary-resource"
        ]
        index_records = self.semantic_index["binaryResources"]
        declared_count = int(self.manifest["semanticContentIndex"]["binaryResourceCount"])
        records, indexed = binary_resource_bijection(
            manifest_records,
            index_records,
            declared_count,
        )
        if self.counts["binaryResources"] != declared_count:
            raise InvalidPackage("reported binary-resource inventory count differs from its semantic binding")
        total = 0
        for resource_id, record in records.items():
            item = indexed[resource_id]
            expected = (record["semanticBinding"]["publicReference"], record["mediaType"], record["bytes"], record["sha256"])
            actual = (item["canonicalReference"], item["mediaType"], item["bytes"], item["sha256"])
            if expected != actual or item["recordSha256"] != binary_record_digest(item, self.normalization):
                raise InvalidPackage(f"binary sidecar semantic binding mismatch: {resource_id}")
            with self.archive.open(record["path"]) as handle:
                magic = handle.read(8)
            if record["mediaType"] == "image/jpeg" and not magic.startswith(b"\xff\xd8\xff"):
                raise InvalidPackage(f"JPEG magic mismatch: {record['path']}")
            if record["mediaType"] == "image/png" and magic != b"\x89PNG\r\n\x1a\n":
                raise InvalidPackage(f"PNG magic mismatch: {record['path']}")
            total += int(record["bytes"])
        if total > int(self.trusted["profile"]["archiveLimits"]["binaryLaneBytes"]):
            raise InvalidPackage("binary sidecar lane exceeds profile byte limit")
        self.counts["binaryBytes"] = total
        return f"All {len(records)} image sidecars have exact resource identity, hashes, sizes, media types, and magic bytes."

    def reproducibility_gate(self) -> str:
        assert self.archive is not None
        peer = Path(os.path.abspath(os.fspath(self.args.reproducibility_peer)))
        with PinnedFile(peer, int(self.trusted["profile"]["archiveLimits"]["outerZipBytes"])) as pinned:
            peer_size = pinned.size
            peer_sha = pinned.sha256
            if peer_size != self.archive.size or peer_sha != self.archive.sha256:
                raise InvalidPackage("double-build peer is not byte-identical")
            with pinned.duplicate() as peer_file, zipfile.ZipFile(peer_file, "r", allowZip64=False) as archive:
                manifest_names = [name for name in archive.namelist() if name.endswith("/metadata/manifest.json")]
                if len(manifest_names) != 1:
                    raise InvalidPackage("peer manifest is missing or ambiguous")
                peer_manifest_sha = sha256_bytes(archive.read(manifest_names[0]))
            pinned.assert_unchanged()
        manifest_sha = self.entry_hashes[MANIFEST_REL][1]
        if peer_manifest_sha != manifest_sha:
            raise InvalidPackage("double-build manifests differ")
        epoch = calendar.timegm((*self.archive.timestamp, 0, 0, 0))
        self.reproducibility = {
            "status": "passed", "sourceDateEpoch": epoch, "locale": "C.UTF-8", "timezone": "UTC",
            "runA": {"zipSha256": self.archive.sha256, "manifestSha256": manifest_sha},
            "runB": {"zipSha256": peer_sha, "manifestSha256": peer_manifest_sha}, "byteIdentical": True,
        }
        return "Independent second build is byte-identical, including the exact manifest."

    def _stage_ontology(self) -> Path:
        assert self.archive is not None and self.manifest is not None
        work_base = Path(os.path.abspath(os.fspath(self.args.work_dir)))
        try:
            base_status = os.lstat(work_base)
        except OSError as error:
            raise ValidatorError(f"ontology work root is unavailable: {error}") from error
        if not stat.S_ISDIR(base_status.st_mode):
            raise ValidatorError("ontology work root must be a non-symlink directory")
        work = Path(
            tempfile.mkdtemp(
                prefix=f"fwu-owl-{self.archive.sha256[:16]}-",
                dir=work_base,
            )
        )
        os.chmod(work, 0o700)
        (work / "ontology").mkdir(parents=True)
        (work / "rdf").mkdir(parents=True)
        for source, destination in (
            ("rdf/bundle.nt", "rdf/bundle.nt"), ("skillpilot-curriculum-profile.ttl", "skillpilot-curriculum-profile.ttl"),
            ("ontology/lehrplan-core.owl", "ontology/lehrplan-core.owl"), ("ontology/shapes.ttl", "shapes.ttl"),
            ("catalog-v001.xml", "catalog-v001.xml"),
        ):
            self.archive.extract_to(source, work / destination)
        staged = {
            "bundle": work / "rdf" / "bundle.nt",
            "profile": work / "skillpilot-curriculum-profile.ttl",
            "core": work / "ontology" / "lehrplan-core.owl",
            "shapes": work / "shapes.ttl",
            "catalog": work / "catalog-v001.xml",
        }
        expected = {
            "bundle": self.manifest["rdfBundle"]["sha256"],
            "profile": self.manifest["applicationProfile"]["sha256"],
            "core": self.manifest["fwuCore"]["sha256"],
            "shapes": self.manifest["shapes"]["sha256"],
            "catalog": self.manifest["fwuCore"]["catalogSha256"],
        }
        actual = {name: sha256_file(path) for name, path in staged.items()}
        if actual != expected:
            raise ValidatorError("privately staged ontology inputs differ from manifest hashes")
        self._ontology_input_paths = staged
        self._ontology_input_hashes = actual
        return work

    def _assert_staged_ontology_unchanged(self) -> None:
        current = {name: sha256_file(path) for name, path in self._ontology_input_paths.items()}
        if current != self._ontology_input_hashes:
            raise ValidatorError("ontology inputs changed while an external tool was running")

    def _ontology_hash_lines(self) -> str:
        return "".join(f"input.{name}.sha256={digest}\n" for name, digest in sorted(self._ontology_input_hashes.items()))

    def _pyshacl(self) -> tuple[str, str]:
        for distribution, expected in (("pyshacl", PYSHACL_VERSION), ("rdflib", "7.6.0"), ("owlrl", "7.6.2")):
            try:
                observed = importlib.metadata.version(distribution)
            except importlib.metadata.PackageNotFoundError as error:
                raise ValidatorError(f"pinned Python ontology distribution is missing: {distribution}") from error
            if observed != expected:
                raise ValidatorError(f"{distribution} version must be exactly {expected}, found {observed}")
        try:
            distribution_version = importlib.metadata.version("pyshacl")
        except importlib.metadata.PackageNotFoundError as error:
            raise ValidatorError("pySHACL 0.30.1 is not installed in the validator interpreter") from error
        if distribution_version != PYSHACL_VERSION:
            raise ValidatorError(f"pySHACL version must be exactly {PYSHACL_VERSION}, found {distribution_version}")
        python_path = Path(sys.executable)
        python_sha = sha256_file(python_path)
        result = subprocess.run([sys.executable, "-m", "pyshacl", "--version"], capture_output=True, text=True, check=False)
        observed = "\n".join(part.strip() for part in (result.stdout, result.stderr) if part.strip())
        if result.returncode != 0 or observed != f"PySHACL Version: {PYSHACL_VERSION}" or sha256_file(python_path) != python_sha:
            raise ValidatorError("python -m pyshacl did not report the exact pinned version")
        return distribution_version, python_sha

    def shacl(self) -> str:
        work = self._stage_ontology()
        version, python_sha = self._pyshacl()
        evidence = self.args.evidence_dir / "shacl-report.ttl"
        log = self.args.evidence_dir / "shacl-tool.log"
        result = run_command([sys.executable, "-m", "pyshacl", "-s", str(work / "shapes.ttl"), "-i", "none", "-f", "turtle", "-o", str(evidence), str(work / "rdf" / "bundle.nt")], cwd=work, log_path=log)
        self._assert_staged_ontology_unchanged()
        if sha256_file(Path(sys.executable)) != python_sha or importlib.metadata.version("pyshacl") != PYSHACL_VERSION:
            raise ValidatorError("validator interpreter or pySHACL distribution changed while validation was running")
        if not evidence.is_file():
            raise ValidatorError("pySHACL produced no report")
        try:
            from rdflib import Graph, Literal, Namespace
            from rdflib.namespace import RDF

            graph = Graph().parse(evidence, format="turtle")
            shacl_namespace = Namespace("http://www.w3.org/ns/shacl#")
            reports = set(graph.subjects(RDF.type, shacl_namespace.ValidationReport))
            if len(reports) != 1:
                raise ValueError("expected exactly one sh:ValidationReport")
            report_node = next(iter(reports))
            conforms_values = list(graph.objects(report_node, shacl_namespace.conforms))
            if len(conforms_values) != 1:
                raise ValueError("expected exactly one sh:conforms result")
            conforms = conforms_values[0] == Literal(True)
            violations = 0
            warnings = 0
            for result_node in graph.objects(report_node, shacl_namespace.result):
                severities = list(graph.objects(result_node, shacl_namespace.resultSeverity))
                if len(severities) != 1:
                    raise ValueError("SHACL result has no unique severity")
                if severities[0] == shacl_namespace.Violation:
                    violations += 1
                elif severities[0] == shacl_namespace.Warning:
                    warnings += 1
        except Exception as error:
            raise ValidatorError(f"cannot parse pySHACL result as RDF: {error}") from error
        status = "passed" if result.returncode == 0 and conforms and violations == 0 and warnings == 0 else "failed"
        wrapper = self.args.evidence_dir / "shacl-evidence.txt"
        atomic_write(wrapper, (
            f"tool=pySHACL\nversion={version}\npythonSha256={python_sha}\ninvocation=python -m pyshacl\n"
            f"inference=none\nexit={result.returncode}\nconforms={str(conforms).lower()}\n"
            f"violations={violations}\nwarnings={warnings}\nreport={evidence.name}\n"
            f"reportSha256={sha256_file(evidence)}\nlogSha256={sha256_file(log)}\n"
            + self._ontology_hash_lines()
        ).encode())
        self.ontology["shacl"] = {"status": status, "tool": "pySHACL", "version": version, "report": self.evidence_path(wrapper), "reportSha256": sha256_file(wrapper), "violationCount": violations, "warningCount": warnings}
        if result.returncode not in {0, 1}:
            self.ontology["shacl"] = self.shacl_evidence()
            raise ValidatorError(f"pySHACL failed as a tool with exit code {result.returncode}")
        if status != "passed":
            raise InvalidPackage(f"SHACL inference=none failed: exit={result.returncode}, violations={violations}, warnings={warnings}")
        self._ontology_work = work
        return "pySHACL inference=none conforms with zero violations and zero warnings."

    def _robot(self) -> tuple[Path, str]:
        java_executable, java_binding = validate_pinned_java_runtime(self.args.java_executable)
        if java_executable != self.args.java_executable or java_binding != self.java_binding:
            raise ValidatorError("pinned Java runtime identity changed during validation")
        private = getattr(self, "_private_robot_jar", None)
        if private is None:
            source = Path(os.path.abspath(os.fspath(self.args.robot_jar)))
            with PinnedFile(source, ROBOT_BYTES) as pinned:
                if pinned.size != ROBOT_BYTES or pinned.sha256 != ROBOT_SHA256:
                    raise ValidatorError("ROBOT JAR differs from the pinned 1.9.10 artifact")
                tool_dir = self._ontology_work / "private-tool"
                tool_dir.mkdir(mode=0o700)
                os.chmod(tool_dir, 0o700)
                private = tool_dir / "robot-1.9.10.jar"
                descriptor = os.open(
                    private,
                    os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0),
                    0o400,
                )
                try:
                    with pinned.duplicate() as source_handle, os.fdopen(descriptor, "wb", closefd=False) as target:
                        shutil.copyfileobj(source_handle, target, 8 * 1024 * 1024)
                        target.flush()
                        os.fsync(target.fileno())
                finally:
                    os.close(descriptor)
                pinned.assert_unchanged()
            self._private_robot_jar = private
        status = os.lstat(private)
        if not stat.S_ISREG(status.st_mode) or status.st_size != ROBOT_BYTES or stat.S_IMODE(status.st_mode) != 0o400:
            raise ValidatorError("private ROBOT copy has unsafe metadata")
        jar_sha = sha256_file(private)
        if jar_sha != ROBOT_SHA256:
            raise ValidatorError("private ROBOT copy hash differs")
        result = subprocess.run(
            [str(self.args.java_executable), "-jar", str(private), "--version"],
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode != 0 or sha256_file(private) != jar_sha:
            raise ValidatorError("ROBOT --version failed or JAR changed")
        combined_lines = [line.strip() for output in (result.stdout, result.stderr) for line in output.splitlines() if line.strip()]
        version_lines = [line for line in combined_lines if line.startswith("ROBOT version ")]
        if version_lines != [f"ROBOT version {ROBOT_VERSION}"]:
            raise ValidatorError("ROBOT CLI did not report exactly version 1.9.10")
        version = ROBOT_VERSION
        self._robot_jar_sha = jar_sha
        return private, version

    def _assert_robot_unchanged(self, jar: Path) -> None:
        status = os.lstat(jar)
        if (
            not stat.S_ISREG(status.st_mode)
            or stat.S_IMODE(status.st_mode) != 0o400
            or status.st_size != ROBOT_BYTES
            or sha256_file(jar) != self._robot_jar_sha
            or self._robot_jar_sha != ROBOT_SHA256
        ):
            raise ValidatorError("ROBOT JAR changed while validation was running")

    def _assert_java_runtime_pinned(self) -> None:
        executable, binding = validate_pinned_java_runtime(self.args.java_executable)
        if executable != self.args.java_executable or binding != self.java_binding:
            raise ValidatorError("pinned Java runtime identity changed while a tool was running")

    def _robot_merge_prefix(self, jar: Path, heap: str) -> list[str]:
        return [str(self.args.java_executable), f"-Xmx{heap}", "-Djava.net.useSystemProxies=false", "-jar", str(jar), "merge", "--catalog", "catalog-v001.xml", "--input", "skillpilot-curriculum-profile.ttl", "--input", "rdf/bundle.nt", "--collapse-import-closure", "true"]

    def owl2_dl(self) -> str:
        jar, version = self._robot()
        work = self._ontology_work
        robot_report = self.args.evidence_dir / "owl2-dl-robot-report.txt"
        log = self.args.evidence_dir / "owl2-dl-tool.log"
        command = [*self._robot_merge_prefix(jar, "4g"), "validate-profile", "--profile", "DL", "--output", str(robot_report)]
        result = run_command(command, cwd=work, log_path=log)
        self._assert_staged_ontology_unchanged()
        self._assert_robot_unchanged(jar)
        self._assert_java_runtime_pinned()
        if not robot_report.is_file():
            raise ValidatorError("ROBOT produced no OWL 2 DL report")
        passed = result.returncode == 0 and "Ontology and imports closure in profile" in robot_report.read_text(encoding="utf-8", errors="replace")
        evidence = self.args.evidence_dir / "owl2-dl-evidence.txt"
        atomic_write(evidence, (
            f"tool=ROBOT\nversion={version}\nrobotJarSha256={self._robot_jar_sha}\nexit={result.returncode}\n"
            f"javaVersion={self.java_binding['javaVersion']}\ncorrettoVersion={self.java_binding['correttoVersion']}\n"
            f"profile=DL\nrobotReport={robot_report.name}\nrobotReportSha256={sha256_file(robot_report)}\n"
            f"logSha256={sha256_file(log)}\n"
            + self._ontology_hash_lines()
        ).encode())
        self.ontology["owl2Dl"] = {"status": "passed" if passed else "failed", "tool": "ROBOT", "version": version, "report": self.evidence_path(evidence), "reportSha256": sha256_file(evidence)}
        if result.returncode != 0 and not robot_report.read_text(encoding="utf-8", errors="replace").strip():
            self.ontology["owl2Dl"] = self.tool_evidence()
            raise ValidatorError("ROBOT OWL-profile tool failed without a semantic profile report")
        if not passed:
            raise InvalidPackage("ROBOT did not confirm the merged offline import closure as OWL 2 DL")
        return "ROBOT confirms the merged application profile, data, and offline Core import closure are OWL 2 DL."

    def reasoner(self) -> str:
        jar, version = self._robot()
        work = self._ontology_work
        reasoned = work / "hermit-reasoned.owl"
        tool_log = self.args.evidence_dir / "hermit-tool.log"
        unsatisfiable_dump = work / "hermit-unsatisfiable.owl"
        command = [*self._robot_merge_prefix(jar, "6g"), "reason", "--reasoner", "HermiT", "--equivalent-classes-allowed", "all", "--dump-unsatisfiable", str(unsatisfiable_dump), "--output", str(reasoned)]
        result = run_command(command, cwd=work, log_path=tool_log, timeout=7200)
        self._assert_staged_ontology_unchanged()
        self._assert_robot_unchanged(jar)
        self._assert_java_runtime_pinned()
        if result.returncode != 0:
            semantic_failure = parse_hermit_semantic_failure(result.stdout + "\n" + result.stderr)
            if semantic_failure is None:
                raise ValidatorError(f"HermiT/ROBOT tool failed with exit code {result.returncode}")
            consistent, unsatisfiable_count = semantic_failure
            evidence = self.args.evidence_dir / "hermit-report.txt"
            atomic_write(evidence, (
                f"tool=HermiT\nversion={HERMIT_VERSION}\nrobotVersion={version}\nrobotJarSha256={self._robot_jar_sha}\n"
                f"javaVersion={self.java_binding['javaVersion']}\ncorrettoVersion={self.java_binding['correttoVersion']}\n"
                f"exit={result.returncode}\nconsistent={str(consistent).lower()}\n"
                f"unsatisfiableClassCount={unsatisfiable_count}\n"
                f"reasonLogSha256={sha256_file(tool_log)}\n" + self._ontology_hash_lines()
            ).encode())
            self.ontology["reasoner"] = {"status": "failed", "tool": "HermiT", "version": HERMIT_VERSION, "report": self.evidence_path(evidence), "reportSha256": sha256_file(evidence), "consistent": consistent, "unsatisfiableClassCount": unsatisfiable_count}
            raise InvalidPackage("HermiT rejected an inconsistent or incoherent ontology")
        try:
            reasoned_status = os.lstat(reasoned)
        except OSError as error:
            raise ValidatorError("HermiT/ROBOT reported success but produced no reasoned ontology") from error
        if not stat.S_ISREG(reasoned_status.st_mode) or reasoned_status.st_size <= 0:
            raise ValidatorError("HermiT/ROBOT reported success but produced no reasoned ontology")
        reasoned.unlink()
        unsatisfiable_dump.unlink(missing_ok=True)
        evidence = self.args.evidence_dir / "hermit-report.txt"
        atomic_write(evidence, (
            f"tool=HermiT\nversion={HERMIT_VERSION}\nrobotVersion={version}\nrobotJarSha256={self._robot_jar_sha}\n"
            f"javaVersion={self.java_binding['javaVersion']}\ncorrettoVersion={self.java_binding['correttoVersion']}\n"
            f"exit={result.returncode}\nconsistent=true\nunsatisfiableClassCount=0\n"
            f"reasonedOutputProduced=true\nreasonedOutputDeleted=true\n"
            f"reasonLogSha256={sha256_file(tool_log)}\n"
            + self._ontology_hash_lines()
        ).encode())
        self.ontology["reasoner"] = {"status": "passed", "tool": "HermiT", "version": HERMIT_VERSION, "report": self.evidence_path(evidence), "reportSha256": sha256_file(evidence), "consistent": True, "unsatisfiableClassCount": 0}
        return "HermiT confirms consistency and zero unsatisfiable named classes."

    def package_binding(self) -> dict[str, Any] | None:
        if self.manifest is None:
            return None
        manifest = self.manifest
        def hash_binding(value: Mapping[str, Any], path_field: str = "path") -> dict[str, Any]:
            return {"path": value[path_field], "bytes": value["bytes"], "sha256": value["sha256"]}
        source = dict(manifest["sourceJsonPackage"])
        return {
            "releaseId": manifest["releaseId"], "packageId": manifest["packageId"], "packageVersion": manifest["packageVersion"],
            "contentDigest": manifest["contentDigest"], "archiveRoot": manifest["archiveRoot"],
            "manifestSha256": self.entry_hashes.get(MANIFEST_REL, (0, sha256_bytes(self.archive.read(MANIFEST_REL))))[1] if self.archive else "0" * 64,
            "sourceJsonPackage": source,
            "packageProfile": hash_binding(get_binding_file(manifest, "packageProfile")),
            "schemaCatalog": hash_binding(manifest["schemaCatalog"]),
            "fieldSemanticsRegistry": hash_binding(get_binding_file(manifest, "fieldSemanticsRegistry")),
            "definitionDigestProfile": hash_binding(get_binding_file(manifest, "definitionDigestProfile")),
            "semanticContentIndex": hash_binding(manifest["semanticContentIndex"]),
            "applicationProfile": hash_binding(manifest["applicationProfile"]), "shapes": hash_binding(manifest["shapes"]),
            "fwuCore": {
                "ontologyIri": manifest["fwuCore"]["ontologyIri"], "commit": manifest["fwuCore"]["commit"], "sourcePath": manifest["fwuCore"]["sourcePath"],
                "path": manifest["fwuCore"]["bundledPath"], "catalogPath": manifest["fwuCore"]["catalogPath"],
                "catalogBytes": manifest["fwuCore"]["catalogBytes"], "catalogSha256": manifest["fwuCore"]["catalogSha256"],
                "bytes": manifest["fwuCore"]["bytes"], "sha256": manifest["fwuCore"]["sha256"],
            },
            "rdfBundle": hash_binding(manifest["rdfBundle"]),
        }

    def report(self) -> dict[str, Any]:
        archive = self.archive
        invalid = any(item["status"] == "failed" for item in self.gates.values())
        status = "error" if self.error else ("invalid" if invalid else ("valid" if all(item["status"] == "passed" for item in self.gates.values()) else "error"))
        if status == "error" and not self.diagnostics:
            self.diagnostics.append(Diagnostic("VALIDATION_INCOMPLETE", "/", "Validation did not evaluate every mandatory gate."))
        input_value = {
            "file": self.args.zip.name, "bytes": archive.size if archive else (self.args.zip.stat().st_size if self.args.zip.exists() else 0),
            "sha256": archive.sha256 if archive else None,
            "manifestSha256": self.entry_hashes.get(MANIFEST_REL, (0, None))[1],
        }
        report = {
            "$schema": "https://skillpilot.com/schemas/curriculum-package/v1/fwu-owl-package-validation-report.schema.json",
            "reportFormatVersion": 1, "validatorId": "skillpilot-fwu-owl-package-validator-v1", "status": status,
            "input": input_value, "package": self.package_binding(), "counts": self.counts,
            "gates": [self.gates[gate] for gate in GATES], "ontologyEvidence": self.ontology,
            "reproducibility": self.reproducibility,
            "diagnostics": [item.json() for item in self.diagnostics[:500]], "diagnosticsTruncated": len(self.diagnostics) > 500,
        }
        self.verify_report_evidence(report)
        if self.manifest is not None:
            require_contract_clean(
                contract_audit.validate_report(report, self.manifest, self.trusted["profile"]),
                "closed external validation-report contract failed",
                trust_error=True,
            )
        errors = schema_errors(self.trusted["reportSchema"], report)
        if errors:
            raise ValidatorError("validator produced a report that violates its trust-root schema: " + "; ".join(errors[:20]))
        return report


def load_trust() -> dict[str, Any]:
    profile_raw = PROFILE_PATH.read_bytes()
    profile = load_trusted_json(PROFILE_PATH)
    manifest_schema = load_trusted_json(MANIFEST_SCHEMA_PATH)
    profile_schema = load_trusted_json(PROFILE_SCHEMA_PATH)
    report_schema = load_trusted_json(REPORT_SCHEMA_PATH)
    try:
        Draft202012Validator.check_schema(manifest_schema)
        Draft202012Validator.check_schema(profile_schema)
        Draft202012Validator.check_schema(report_schema)
    except Exception as error:
        raise ValidatorError(f"repository schema trust root is invalid: {error}") from error
    require_schema(profile_schema, profile, "repository FWU-OWL profile")
    try:
        require_contract_clean(
            contract_audit.validate_static_trust_roots(),
            "static FWU-OWL repository trust-root validation failed",
            trust_error=True,
        )
        require_contract_clean(
            contract_audit.validate_profile(profile),
            "closed FWU-OWL profile validation failed",
            trust_error=True,
        )
    except (OSError, ValueError) as error:
        raise ValidatorError(f"cannot validate static FWU-OWL trust roots: {error}") from error
    return {"profileRaw": profile_raw, "profile": profile, "manifestSchema": manifest_schema, "profileSchema": profile_schema, "reportSchema": report_schema}


def make_test_zip(path: Path, entries: Sequence[tuple[str, bytes]], *, compression: int = zipfile.ZIP_STORED, extra: bytes = b"") -> None:
    with zipfile.ZipFile(path, "w", compression=compression, allowZip64=False) as archive:
        for name, raw in entries:
            info = zipfile.ZipInfo(name, (2026, 1, 1, 0, 0, 0))
            info.compress_type = compression
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            info.extra = extra
            archive.writestr(info, raw)


def run_self_test() -> None:
    limits = {
        "outerZipBytes": 10_000_000, "entryCount": 100, "genericEntryBytes": 1_000_000,
        "archivePathBytes": 240, "totalUncompressedBytes": 10_000_000,
    }
    passed = 0
    with tempfile.TemporaryDirectory(prefix="fwu-owl-validator-selftest-") as directory:
        root = Path(directory)
        valid = root / "valid.fwu-owl.zip"
        make_test_zip(valid, [("x.fwu-owl/a.txt", b"a"), ("x.fwu-owl/b.txt", b"b")])
        with SecureZip(valid, limits):
            passed += 1
        symlink = root / "symlink.fwu-owl.zip"
        symlink.symlink_to(valid)
        try:
            with SecureZip(symlink, limits):
                pass
        except InvalidPackage:
            passed += 1
        else:
            raise ValidatorError("self-test followed a symlinked ZIP")
        stable = root / "stable.bin"
        stable.write_bytes(b"stable")
        with PinnedFile(stable) as pinned:
            current_mtime = os.fstat(pinned.descriptor).st_mtime_ns
            os.utime(stable, ns=(current_mtime, current_mtime + 1_000_000))
            try:
                pinned.assert_unchanged()
            except InvalidPackage:
                passed += 1
            else:
                raise ValidatorError("self-test missed pinned-file metadata drift")
        ctime_stable = root / "stable-ctime.bin"
        ctime_stable.write_bytes(b"stable")
        os.chmod(ctime_stable, 0o644)
        with PinnedFile(ctime_stable) as pinned:
            os.chmod(ctime_stable, 0o600)
            os.chmod(ctime_stable, 0o644)
            try:
                pinned.assert_unchanged()
            except InvalidPackage:
                passed += 1
            else:
                raise ValidatorError("self-test missed restored-metadata ctime drift")
        path_stable = root / "stable-path.bin"
        moved_stable = root / "stable-path-moved.bin"
        path_stable.write_bytes(b"stable")
        with PinnedFile(path_stable) as pinned:
            path_stable.rename(moved_stable)
            path_stable.write_bytes(b"stable")
            try:
                pinned.assert_unchanged()
            except InvalidPackage:
                passed += 1
            else:
                raise ValidatorError("self-test missed pinned-file path identity drift")
        mutations = [
            ("traversal", [("x.fwu-owl/../a", b"a")], zipfile.ZIP_STORED, b""),
            ("backslash", [("x.fwu-owl/a\\b", b"a")], zipfile.ZIP_STORED, b""),
            ("case collision", [("x.fwu-owl/A", b"a"), ("x.fwu-owl/a", b"b")], zipfile.ZIP_STORED, b""),
            ("compression", [("x.fwu-owl/a", b"a" * 100)], zipfile.ZIP_DEFLATED, b""),
            ("extra field", [("x.fwu-owl/a", b"a")], zipfile.ZIP_STORED, b"\xfe\xca\x00\x00"),
            ("nested archive", [("x.fwu-owl/a.zip", b"a")], zipfile.ZIP_STORED, b""),
        ]
        for label, entries, compression, extra in mutations:
            path = root / f"{label}.zip"
            make_test_zip(path, entries, compression=compression, extra=extra)
            try:
                with SecureZip(path, limits):
                    pass
            except InvalidPackage:
                passed += 1
            else:
                raise ValidatorError(f"self-test mutation was accepted: {label}")
        for raw in (b'{"a":1,"a":2}', b'{"a":NaN}', b'\xff'):
            try:
                loads_strict(raw)
            except InvalidPackage:
                passed += 1
            else:
                raise ValidatorError("self-test accepted adversarial JSON")
        for raw, depth, nodes in ((b"[[[]]]", 2, 100), (b"[1,2,3]", 20, 2)):
            try:
                loads_strict(raw, max_depth=depth, max_nodes=nodes)
            except InvalidPackage:
                passed += 1
            else:
                raise ValidatorError("self-test accepted lexically over-limit JSON")
        good_nt = b"<https://e/s> <https://e/p> <https://e/o> .\n"
        count, _, _ = validate_nt_stream(iter([good_nt]), collect_terms=True)  # type: ignore[arg-type]
        if count != 1:
            raise ValidatorError("self-test N-Triples count differs")
        passed += 1
        for lines in ([b"not ntriples\n"], [good_nt, good_nt]):
            try:
                validate_nt_stream(iter(lines), collect_terms=True)  # type: ignore[arg-type]
            except InvalidPackage:
                passed += 1
            else:
                raise ValidatorError("self-test accepted adversarial N-Triples")
        datatype_nt = (
            b'<https://e/s> <https://e/p> "v"^^'
            b'<https://skillpilot.de/ns/roundtrip#UndeclaredDatatype> .\n'
        )
        _, datatype_terms, _ = validate_nt_stream(iter([datatype_nt]), collect_terms=True)  # type: ignore[arg-type]
        if SP + "UndeclaredDatatype" not in datatype_terms:
            raise ValidatorError("self-test missed an N-Triples datatype IRI")
        passed += 1
        for invalid_scalar in (b"\\uD800", b"\\U00110000"):
            line = b'<https://e/s> <https://e/p> "' + invalid_scalar + b'" .\n'
            try:
                validate_nt_stream(iter([line]), collect_terms=True)  # type: ignore[arg-type]
            except InvalidPackage:
                passed += 1
            else:
                raise ValidatorError("self-test accepted a non-scalar N-Triples escape")
        try:
            parse_checksums(("0" * 64 + "  b\n" + "1" * 64 + "  a\n").encode())
        except InvalidPackage:
            passed += 1
        else:
            raise ValidatorError("self-test accepted unsorted checksums")
        manifest_binary = [{"semanticBinding": {"resourceId": "resource-a"}}]
        indexed_binary = [{"resourceId": "resource-a"}]
        manifest_map, index_map = binary_resource_bijection(
            manifest_binary,
            indexed_binary,
            1,
        )
        if set(manifest_map) != {"resource-a"} or set(index_map) != {"resource-a"}:
            raise ValidatorError("self-test binary resource bijection differs")
        passed += 1
        binary_mutations = (
            (
                [*manifest_binary, {"semanticBinding": {"resourceId": "resource-a"}}],
                indexed_binary,
                1,
            ),
            (
                manifest_binary,
                [*indexed_binary, {"resourceId": "resource-a"}],
                1,
            ),
            (manifest_binary, indexed_binary, 2),
        )
        for manifest_records, index_records, declared_count in binary_mutations:
            try:
                binary_resource_bijection(
                    manifest_records,
                    index_records,
                    declared_count,
                )
            except InvalidPackage:
                passed += 1
            else:
                raise ValidatorError("self-test accepted a non-bijective binary resource lane")

        fresh_evidence = root / "fresh-evidence"
        created_evidence = create_fresh_output_directory(fresh_evidence, "self-test evidence")
        if stat.S_IMODE(os.lstat(created_evidence).st_mode) != 0o700:
            raise ValidatorError("self-test evidence directory is not private")
        passed += 1
        try:
            create_fresh_output_directory(fresh_evidence, "self-test evidence")
        except ValidatorError:
            passed += 1
        else:
            raise ValidatorError("self-test reused a preexisting evidence directory")
        evidence_victim = root / "evidence-victim"
        evidence_victim.mkdir()
        evidence_link = root / "evidence-link"
        evidence_link.symlink_to(evidence_victim, target_is_directory=True)
        try:
            create_fresh_output_directory(evidence_link, "self-test evidence")
        except ValidatorError:
            passed += 1
        else:
            raise ValidatorError("self-test followed a symlinked evidence target")

        layout_root = root / "layout"
        layout_root.mkdir()
        layout_zip = layout_root / "primary.fwu-owl.zip"
        layout_source = layout_root / "source.json.zip"
        layout_peer = layout_root / "peer.fwu-owl.zip"
        layout_robot = layout_root / "robot.jar"
        for path, content in (
            (layout_zip, b"primary"),
            (layout_source, b"source"),
            (layout_peer, b"peer"),
            (layout_robot, b"robot"),
        ):
            path.write_bytes(content)

        def layout_args(**overrides: Path) -> argparse.Namespace:
            values = {
                "zip": layout_zip,
                "source_json": layout_source,
                "reproducibility_peer": layout_peer,
                "robot_jar": layout_robot,
                "report": layout_root / "output" / "report.json",
                "work_dir": layout_root / "output" / "work",
                "evidence_dir": layout_root / "output" / "evidence",
            }
            values.update(overrides)
            return argparse.Namespace(**values)

        validate_path_layout(layout_args())
        passed += 1
        peer_hardlink = layout_root / "peer-hardlink.fwu-owl.zip"
        os.link(layout_zip, peer_hardlink)
        report_hardlink = layout_root / "report-hardlink.json"
        os.link(layout_zip, report_hardlink)
        layout_mutations = (
            {"reproducibility_peer": layout_zip},
            {"reproducibility_peer": peer_hardlink},
            {"report": layout_zip},
            {"report": report_hardlink},
            {
                "work_dir": layout_root / "output" / "shared",
                "evidence_dir": layout_root / "output" / "shared",
            },
        )
        for overrides in layout_mutations:
            try:
                validate_path_layout(layout_args(**overrides))
            except ValidatorError:
                passed += 1
            else:
                raise ValidatorError("self-test accepted an unsafe validator path layout")
        if parse_hermit_semantic_failure(
            "The ontology is inconsistent. TIP: use a tool like Protege to find explanations"
        ) != (False, 0):
            raise ValidatorError("self-test missed a HermiT semantic failure")
        if parse_hermit_semantic_failure(
            "Checking for unsatisfiable classes...\njava.lang.OutOfMemoryError"
        ) is not None:
            raise ValidatorError("self-test misclassified a HermiT tool failure as semantic")
        if parse_hermit_semantic_failure(
            "There are 3 unsatisfiable classes in the ontology."
        ) != (True, 3):
            raise ValidatorError("self-test did not parse the HermiT unsatisfiable-class count")
        passed += 3
        load_trust()
        passed += 1
    print(f"FWU-OWL package validator self-test passed: {passed} bounded guarantees.")


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--zip", type=Path, help="finished *.fwu-owl.zip")
    mode.add_argument("--self-test", action="store_true", help="run bounded adversarial tests")
    parser.add_argument("--source-json", type=Path, help="independent full-standalone JSON source ZIP")
    parser.add_argument("--reproducibility-peer", type=Path, help="byte-identical independent second FWU build")
    parser.add_argument("--robot-jar", type=Path, help="pinned ROBOT JAR")
    parser.add_argument("--work-dir", type=Path, default=REPO_ROOT / "tmp" / "fwu-owl-validation-work")
    parser.add_argument("--evidence-dir", type=Path, default=REPO_ROOT / "tmp" / "fwu-owl-validation-evidence")
    parser.add_argument("--report", type=Path, help="external schema-valid JSON receipt")
    parser.add_argument("--skip-ontology-tools", action="store_true", help="only for structural/adversarial test runs")
    args = parser.parse_args(argv)
    if not args.self_test:
        missing = [flag for flag, value in (("--source-json", args.source_json), ("--reproducibility-peer", args.reproducibility_peer), ("--robot-jar", args.robot_jar), ("--report", args.report)) if value is None]
        if missing:
            parser.error("required with --zip: " + ", ".join(missing))
    return args


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        if args.self_test:
            run_self_test()
            return 0
        validate_path_layout(args)
        args.java_executable, args.java_binding = validate_pinned_java_runtime()
        ensure_output_directory(args.report.parent, "validation report parent")
        args.work_dir = ensure_output_directory(args.work_dir, "ontology work root")
        args.evidence_dir = create_fresh_output_directory(args.evidence_dir, "evidence root")
        trusted = load_trust()
        report = Validation(args, trusted).validate()
        rendered = (json.dumps(report, ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode("utf-8")
        atomic_write(args.report, rendered)
        print(f"FWU-OWL package validation {report['status']}: {args.report}")
        return 0 if report["status"] == "valid" else (1 if report["status"] == "invalid" else 2)
    except InvalidPackage as error:
        print(f"FWU-OWL package invalid: {error}", file=sys.stderr)
        return 1
    except (ValidatorError, OSError) as error:
        print(f"FWU-OWL validator error: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
