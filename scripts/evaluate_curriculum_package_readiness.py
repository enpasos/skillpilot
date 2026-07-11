#!/usr/bin/env python3
"""Evaluate JSON curriculum-package readiness without upgrading legacy exports.

The evaluator is deliberately conservative.  It establishes input,
manifest-contract, and finished-ZIP inventory facts itself.  For a safe,
contract-conformant full-standalone ZIP it delegates the catalog, semantic
closure, and content-digest gates to the independent package validator in a
separate bounded process.  The hermetic-consumer gate remains unevaluated, so
this evaluator version can never emit ``ready``.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
import re
import stat
import struct
import subprocess
import sys
import tempfile
import zipfile
from dataclasses import dataclass
from importlib.metadata import PackageNotFoundError, version as distribution_version
from itertools import islice
from pathlib import Path
from typing import Any

# Importing the shared DPK-001 validator must not dirty the worktree with pyc
# files, even when callers omit Python's -B switch.
sys.dont_write_bytecode = True
SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

import validate_curriculum_package_contracts as package_contracts  # noqa: E402
from jsonschema import Draft202012Validator  # noqa: E402


REPO_ROOT = Path(__file__).resolve().parents[1]
CONTRACT_DIR = REPO_ROOT / "contracts" / "curriculum-package" / "v1"
MANIFEST_SCHEMA_PATH = CONTRACT_DIR / "package-manifest.schema.json"
PROFILE_PATH = CONTRACT_DIR / "profiles" / "full-standalone-v1.profile.json"
POLICY_PATH = CONTRACT_DIR / "profiles" / "full-standalone-v1.readiness-policy.json"
REPORT_SCHEMA_PATH = CONTRACT_DIR / "package-readiness-report.schema.json"
FIXTURE_DIR = CONTRACT_DIR / "fixtures" / "readiness"

REPORT_SCHEMA_ID = (
    "https://skillpilot.com/schemas/curriculum-package/v1/"
    "package-readiness-report.schema.json"
)
EVALUATOR_NAME = "skillpilot-json-package-readiness"
EVALUATOR_VERSION = "1.1.0"
JSONSCHEMA_VERSION = "4.26.0"
POLICY_ID = "full-standalone-v1-readiness-v1"
POLICY_SCOPE = "json-full-standalone-v1"

CHECK_RESULT_VOCABULARY = ["pass", "fail", "not-applicable", "not-evaluated"]
STATUS_VOCABULARY = [
    "ready",
    "not-ready-legacy",
    "not-ready-incomplete",
    "invalid",
    "unsupported",
]

INPUT_CHECK_IDS = ["input.parse-and-container-safe"]
IDENTITY_CHECK_IDS = ["identity.target-contract-declared"]
CONTRACT_CHECK_IDS = [
    "contract.manifest-schema",
    "contract.target-values",
    "contract.trusted-bindings",
    "contract.profile-roles",
    "contract.inventory-bytes",
]
CATALOG_CHECK_IDS = [
    "catalog.runtime-catalog",
    "catalog.offline-schema-catalog",
]
STANDALONE_CHECK_IDS = [
    "standalone.hard-reference-closure",
    "standalone.content-digest",
]
PUBLICATION_CHECK_IDS = ["publication.redistribution-cleared"]
CONSUMER_CHECK_IDS = ["consumer.hermetic-package-only"]
REQUIRED_CHECK_IDS = [
    *INPUT_CHECK_IDS,
    *IDENTITY_CHECK_IDS,
    *CONTRACT_CHECK_IDS,
    *CATALOG_CHECK_IDS,
    *STANDALONE_CHECK_IDS,
    *PUBLICATION_CHECK_IDS,
    *CONSUMER_CHECK_IDS,
]
IMPLEMENTED_CHECK_IDS = [
    *INPUT_CHECK_IDS,
    *IDENTITY_CHECK_IDS,
    *CONTRACT_CHECK_IDS,
    *CATALOG_CHECK_IDS,
    *STANDALONE_CHECK_IDS,
    *PUBLICATION_CHECK_IDS,
]
EVALUATOR_COMPLETE_FOR_POLICY = IMPLEMENTED_CHECK_IDS == REQUIRED_CHECK_IDS

# Stable process semantics. argparse retains its conventional exit code 2 for
# CLI usage errors; every evaluator outcome has a disjoint code.
EXIT_READY = 0
EXIT_INVALID = 10
EXIT_NOT_READY = 20
EXIT_UNSUPPORTED = 30
EXIT_EXPECTATION_MISMATCH = 40
EXIT_INTERNAL_ERROR = 70

TARGET_MARKERS = {
    "$schema",
    "packageFormatVersion",
    "runtimeContractVersion",
    "releaseProfile",
    "variant",
    "releaseId",
    "contentDigest",
    "contractBindings",
}
TARGET_IDENTITY_MARKERS = set(TARGET_MARKERS)

MAX_TRUSTED_JSON_BYTES = 16 * 1024 * 1024
MAX_CENTRAL_DIRECTORY_BYTES = 64 * 1024 * 1024
MAX_SCHEMA_DIAGNOSTICS = 50
MAX_REPORTED_DIAGNOSTICS = 5
MAX_DIAGNOSTIC_FRAGMENT = 320
MAX_JSON_DEPTH = 64
MAX_JSON_OBJECT_MEMBERS = 256
MAX_JSON_CONTAINER_ITEMS = 1_000_000
ZIP_EOCD_SIGNATURE = b"PK\x05\x06"
ZIP64_EOCD_SIGNATURE = b"PK\x06\x06"
ZIP64_LOCATOR_SIGNATURE = b"PK\x06\x07"

FULL_VALIDATOR_PATH = SCRIPT_DIR / "validate_full_standalone_curriculum_package.py"
FULL_VALIDATOR_ID = "skillpilot-full-standalone-package-validator-v1"
FULL_VALIDATOR_REPORT_FORMAT_VERSION = 1
FULL_VALIDATOR_GATE_IDS = [
    "inventory",
    "runtimeCatalog",
    "offlineSchemaCatalog",
    "hardReferenceClosure",
    "contentDigest",
    "assetBytes",
]
FULL_VALIDATOR_GATE_TO_CHECK = {
    "runtimeCatalog": "catalog.runtime-catalog",
    "offlineSchemaCatalog": "catalog.offline-schema-catalog",
    "hardReferenceClosure": "standalone.hard-reference-closure",
    "contentDigest": "standalone.content-digest",
}
FULL_VALIDATOR_EXIT_BY_STATUS = {"valid": 0, "invalid": 1, "error": 2}
FULL_VALIDATOR_TIMEOUT_SECONDS = 30 * 60
MAX_FULL_VALIDATOR_REPORT_BYTES = 2 * 1024 * 1024


class ReadinessError(RuntimeError):
    """Raised when trusted contracts or derived report semantics are invalid."""


class DuplicateJsonKeyError(ValueError):
    """Raised when JSON contains an ambiguous duplicate object key."""


class FullValidatorProcessError(RuntimeError):
    """Raised when the independent validator cannot yield trustworthy evidence."""


@dataclass
class LoadedInput:
    kind: str
    name: str
    path: Path
    bytes: int
    sha256: str | None
    manifest: dict[str, Any] | None
    manifest_bytes: bytes | None
    archive_root: str | None
    errors: list[str]


@dataclass(frozen=True)
class TrustedContracts:
    manifest_schema: dict[str, Any]
    profile: dict[str, Any]
    roles: dict[str, dict[str, Any]]
    policy: dict[str, Any]
    report_schema: dict[str, Any]
    manifest_schema_sha256: str
    profile_sha256: str
    report_schema_sha256: str
    trusted_schema_metadata: dict[str, tuple[str, str, int]]
    manifest_schema_bytes: int
    profile_bytes: int


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def sha256_file_bounded(path: Path, limit: int) -> tuple[int, str]:
    digest = hashlib.sha256()
    count = 0
    with path.open("rb") as handle:
        while True:
            chunk = handle.read(min(1024 * 1024, limit + 1 - count))
            if not chunk:
                break
            count += len(chunk)
            if count > limit:
                raise ReadinessError(f"Input grew beyond the {limit}-byte limit")
            digest.update(chunk)
    return count, digest.hexdigest()


def reject_duplicate_keys(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise DuplicateJsonKeyError(f"duplicate object key {key!r}")
        result[key] = value
    return result


def reject_nonfinite_constant(value: str) -> None:
    raise ValueError(f"non-finite JSON constant {value!r}")


def parse_json_bytes(raw: bytes, context: str) -> Any:
    try:
        return json.loads(
            raw.decode("utf-8"),
            object_pairs_hook=reject_duplicate_keys,
            parse_constant=reject_nonfinite_constant,
        )
    except (
        UnicodeDecodeError,
        json.JSONDecodeError,
        DuplicateJsonKeyError,
        RecursionError,
        ValueError,
    ) as error:
        raise ReadinessError(
            f"Cannot parse duplicate-safe bounded JSON for {context}: {error}"
        ) from error


def validate_json_shape(value: Any, context: str) -> None:
    stack: list[tuple[Any, int]] = [(value, 0)]
    container_items = 0
    while stack:
        current, depth = stack.pop()
        if depth > MAX_JSON_DEPTH:
            raise ReadinessError(f"JSON nesting exceeds {MAX_JSON_DEPTH} in {context}")
        if isinstance(current, dict):
            if len(current) > MAX_JSON_OBJECT_MEMBERS:
                raise ReadinessError(
                    f"JSON object exceeds {MAX_JSON_OBJECT_MEMBERS} members in {context}"
                )
            container_items += len(current)
            stack.extend((item, depth + 1) for item in current.values())
        elif isinstance(current, list):
            container_items += len(current)
            stack.extend((item, depth + 1) for item in current)
        if container_items > MAX_JSON_CONTAINER_ITEMS:
            raise ReadinessError(
                f"JSON container item budget exceeds {MAX_JSON_CONTAINER_ITEMS} in {context}"
            )


def load_trusted_json(path: Path) -> dict[str, Any]:
    try:
        size = path.stat().st_size
        if size > MAX_TRUSTED_JSON_BYTES:
            raise ReadinessError(f"Trusted contract exceeds bounded size: {path}")
        raw = path.read_bytes()
    except OSError as error:
        raise ReadinessError(f"Cannot read trusted contract {path}: {error}") from error
    value = parse_json_bytes(raw, str(path))
    validate_json_shape(value, str(path))
    if not isinstance(value, dict):
        raise ReadinessError(f"Trusted contract must be a JSON object: {path}")
    return value


def exact_keys(value: dict[str, Any], expected: set[str], context: str) -> None:
    actual = set(value)
    if actual != expected:
        raise ReadinessError(
            f"{context} fields differ; missing={sorted(expected - actual)}, "
            f"unknown={sorted(actual - expected)}"
        )


def validate_policy_contract(
    manifest_schema: dict[str, Any],
    profile: dict[str, Any],
    policy: dict[str, Any],
    report_schema: dict[str, Any],
    *,
    manifest_schema_sha256: str,
    profile_sha256: str,
    report_schema_sha256: str,
) -> None:
    exact_keys(
        policy,
        {
            "policyFormatVersion",
            "policyId",
            "scope",
            "target",
            "reportSchema",
            "evaluator",
            "statusVocabulary",
            "checkResultVocabulary",
            "requiredChecks",
        },
        "readiness policy",
    )
    if (
        policy.get("policyFormatVersion") != 1
        or policy.get("policyId") != POLICY_ID
        or policy.get("scope") != POLICY_SCOPE
    ):
        raise ReadinessError("Unexpected readiness-policy identity")

    target = policy.get("target")
    if not isinstance(target, dict):
        raise ReadinessError("readiness policy target must be an object")
    exact_keys(
        target,
        {
            "variant",
            "packageFormatVersion",
            "runtimeContractVersion",
            "releaseProfile",
            "manifestSchema",
            "releaseProfileContract",
        },
        "readiness policy target",
    )
    compatibility = profile.get("compatibility")
    if not isinstance(compatibility, dict):
        raise ReadinessError("Trusted profile compatibility is malformed")
    expected_target = {
        **compatibility,
        "releaseProfile": profile.get("profileId"),
        "manifestSchema": {
            "id": manifest_schema.get("$id"),
            "sha256": manifest_schema_sha256,
        },
        "releaseProfileContract": {
            "id": profile.get("profileId"),
            "sha256": profile_sha256,
        },
    }
    if target != expected_target:
        raise ReadinessError(
            "Readiness policy target does not exactly match manifest schema/profile compatibility"
        )

    report_binding = policy.get("reportSchema")
    if report_binding != {
        "id": REPORT_SCHEMA_ID,
        "sha256": report_schema_sha256,
    }:
        raise ReadinessError("Readiness policy report-schema binding is stale")
    if report_schema.get("$id") != REPORT_SCHEMA_ID:
        raise ReadinessError("Unexpected readiness-report schema $id")

    expected_evaluator = {
        "name": EVALUATOR_NAME,
        "version": EVALUATOR_VERSION,
        "jsonschemaVersion": JSONSCHEMA_VERSION,
    }
    if policy.get("evaluator") != expected_evaluator:
        raise ReadinessError("Readiness policy evaluator binding is stale")
    if policy.get("statusVocabulary") != STATUS_VOCABULARY:
        raise ReadinessError("Readiness policy status vocabulary differs")
    if policy.get("checkResultVocabulary") != CHECK_RESULT_VOCABULARY:
        raise ReadinessError("Readiness policy check-result vocabulary differs")

    expected_checks = [{"id": check_id, "blocking": True} for check_id in REQUIRED_CHECK_IDS]
    if policy.get("requiredChecks") != expected_checks:
        raise ReadinessError("Readiness policy check set/order differs from evaluator v1")

    try:
        report_statuses = report_schema["properties"]["decision"]["properties"]["status"]["enum"]
        report_results = report_schema["$defs"]["checkResult"]["enum"]
        report_evaluator = report_schema["properties"]["evaluator"]["properties"]
    except (KeyError, TypeError) as error:
        raise ReadinessError("Readiness-report schema lacks policy-bound fields") from error
    if report_statuses != STATUS_VOCABULARY or report_results != CHECK_RESULT_VOCABULARY:
        raise ReadinessError("Readiness-report schema vocabulary differs from policy")
    if (
        report_evaluator.get("name", {}).get("const") != EVALUATOR_NAME
        or report_evaluator.get("version", {}).get("const") != EVALUATOR_VERSION
        or report_evaluator.get("jsonschemaVersion", {}).get("const")
        != JSONSCHEMA_VERSION
        or report_evaluator.get("implementedCheckIds", {}).get("const")
        != IMPLEMENTED_CHECK_IDS
        or report_evaluator.get("completeForPolicy", {}).get("const")
        is not EVALUATOR_COMPLETE_FOR_POLICY
    ):
        raise ReadinessError("Readiness-report schema evaluator binding differs")


def trusted_contracts() -> TrustedContracts:
    try:
        installed_jsonschema_version = distribution_version("jsonschema")
    except PackageNotFoundError as error:
        raise ReadinessError("Pinned jsonschema dependency is not installed") from error
    if installed_jsonschema_version != JSONSCHEMA_VERSION:
        raise ReadinessError(
            f"Expected jsonschema {JSONSCHEMA_VERSION}, found {installed_jsonschema_version}"
        )

    manifest_schema = load_trusted_json(MANIFEST_SCHEMA_PATH)
    profile = load_trusted_json(PROFILE_PATH)
    policy = load_trusted_json(POLICY_PATH)
    report_schema = load_trusted_json(REPORT_SCHEMA_PATH)
    Draft202012Validator.check_schema(manifest_schema)
    Draft202012Validator.check_schema(report_schema)

    try:
        trusted_schema_paths = {
            binding_name: CONTRACT_DIR / filename
            for binding_name, (_schema_id, filename) in package_contracts.TRUSTED_SCHEMA_BINDINGS.items()
        }
        roles = package_contracts.validate_trusted_contract(
            manifest_schema,
            profile,
            MANIFEST_SCHEMA_PATH,
            PROFILE_PATH,
            trusted_schema_paths,
        )
    except (package_contracts.ContractDefinitionError, KeyError, TypeError, ValueError) as error:
        raise ReadinessError(f"Trusted package contract is inconsistent: {error}") from error

    manifest_schema_sha256 = sha256_file(MANIFEST_SCHEMA_PATH)
    profile_sha256 = sha256_file(PROFILE_PATH)
    report_schema_sha256 = sha256_file(REPORT_SCHEMA_PATH)
    trusted_schema_metadata = {
        binding_name: (
            package_contracts.TRUSTED_SCHEMA_BINDINGS[binding_name][0],
            sha256_file(path),
            path.stat().st_size,
        )
        for binding_name, path in trusted_schema_paths.items()
    }
    validate_policy_contract(
        manifest_schema,
        profile,
        policy,
        report_schema,
        manifest_schema_sha256=manifest_schema_sha256,
        profile_sha256=profile_sha256,
        report_schema_sha256=report_schema_sha256,
    )
    return TrustedContracts(
        manifest_schema=manifest_schema,
        profile=profile,
        roles=roles,
        policy=policy,
        report_schema=report_schema,
        manifest_schema_sha256=manifest_schema_sha256,
        profile_sha256=profile_sha256,
        report_schema_sha256=report_schema_sha256,
        trusted_schema_metadata=trusted_schema_metadata,
        manifest_schema_bytes=MANIFEST_SCHEMA_PATH.stat().st_size,
        profile_bytes=PROFILE_PATH.stat().st_size,
    )


def unavailable_input(
    *, kind: str, path: Path, size: int, error: str
) -> LoadedInput:
    return LoadedInput(
        kind=kind,
        name=path.name,
        path=path,
        bytes=size,
        sha256=None,
        manifest=None,
        manifest_bytes=None,
        archive_root=None,
        errors=[error],
    )


def load_manifest_input(path: Path, manifest_limit: int) -> LoadedInput:
    size = path.stat().st_size
    if size > manifest_limit:
        return unavailable_input(
            kind="manifest",
            path=path,
            size=size,
            error=f"manifest exceeds {manifest_limit} bytes",
        )
    with path.open("rb") as handle:
        raw = handle.read(manifest_limit + 1)
    if len(raw) > manifest_limit:
        return unavailable_input(
            kind="manifest",
            path=path,
            size=len(raw),
            error=f"manifest exceeds {manifest_limit} bytes after bounded stat",
        )
    errors: list[str] = []
    manifest: dict[str, Any] | None = None
    try:
        parsed = parse_json_bytes(raw, path.name)
        validate_json_shape(parsed, path.name)
        if isinstance(parsed, dict):
            manifest = parsed
        else:
            errors.append("manifest JSON root is not an object")
    except ReadinessError as error:
        errors.append(str(error))
    archive_root = manifest.get("archiveRoot") if isinstance(manifest, dict) else None
    return LoadedInput(
        kind="manifest",
        name=path.name,
        path=path,
        bytes=len(raw),
        sha256=sha256_bytes(raw),
        manifest=manifest,
        manifest_bytes=raw,
        archive_root=archive_root if isinstance(archive_root, str) else None,
        errors=errors,
    )


def read_zip_directory_metadata(path: Path) -> tuple[int, int]:
    size = path.stat().st_size
    tail_size = min(size, 65_557)
    with path.open("rb") as handle:
        handle.seek(size - tail_size)
        tail = handle.read(tail_size)
        eocd_index = tail.rfind(ZIP_EOCD_SIGNATURE)
        if eocd_index < 0 or len(tail) - eocd_index < 22:
            raise ReadinessError("ZIP end-of-central-directory record is unavailable")
        fields = struct.unpack_from("<4s4H2LH", tail, eocd_index)
        total_entries = fields[4]
        central_size = fields[5]
        comment_length = fields[7]
        if eocd_index + 22 + comment_length != len(tail):
            raise ReadinessError("ZIP end record/comment length is inconsistent")
        if total_entries != 0xFFFF and central_size != 0xFFFFFFFF:
            return total_entries, central_size

        eocd_absolute = size - tail_size + eocd_index
        locator_offset = eocd_absolute - 20
        if locator_offset < 0:
            raise ReadinessError("ZIP64 locator is unavailable")
        handle.seek(locator_offset)
        locator = handle.read(20)
        if len(locator) != 20 or locator[:4] != ZIP64_LOCATOR_SIGNATURE:
            raise ReadinessError("ZIP64 locator is malformed")
        _, _, zip64_offset, _ = struct.unpack("<4sLQL", locator)
        handle.seek(zip64_offset)
        zip64 = handle.read(56)
        if len(zip64) < 56 or zip64[:4] != ZIP64_EOCD_SIGNATURE:
            raise ReadinessError("ZIP64 end record is malformed")
        values = struct.unpack("<4sQ2H2L4Q", zip64)
        return int(values[7]), int(values[8])


def zip_entry_is_regular(info: zipfile.ZipInfo) -> bool:
    mode = (info.external_attr >> 16) & 0xFFFF
    return not info.is_dir() and (mode == 0 or stat.S_ISREG(mode))


def entry_ratio(info: zipfile.ZipInfo) -> float:
    return info.file_size / max(info.compress_size, 1)


def prefix_collision(paths: list[str]) -> tuple[str, str] | None:
    by_key = {package_contracts.portable_path_key(path): path for path in paths}
    for key, path in sorted(by_key.items()):
        segments = key.split("/")
        for length in range(1, len(segments)):
            parent_key = "/".join(segments[:length])
            if parent_key in by_key:
                return by_key[parent_key], path
    return None


def read_zip_entry_bounded(
    archive: zipfile.ZipFile,
    info: zipfile.ZipInfo,
    limit: int,
) -> bytes:
    if info.file_size > limit:
        raise ReadinessError(f"ZIP entry {info.filename!r} exceeds {limit} bytes")
    chunks: list[bytes] = []
    count = 0
    with archive.open(info, "r") as handle:
        while True:
            chunk = handle.read(min(1024 * 1024, limit + 1 - count))
            if not chunk:
                break
            count += len(chunk)
            if count > limit:
                raise ReadinessError(f"ZIP entry {info.filename!r} exceeded bounded read")
            chunks.append(chunk)
    return b"".join(chunks)


def load_zip_input(path: Path, profile: dict[str, Any]) -> LoadedInput:
    outer_bytes = path.stat().st_size
    limits = profile["archiveLimits"]
    manifest_limits = profile["manifestLimits"]
    if outer_bytes > limits["outerZipBytes"]:
        return unavailable_input(
            kind="zip",
            path=path,
            size=outer_bytes,
            error=f"outer ZIP exceeds {limits['outerZipBytes']} bytes",
        )
    try:
        declared_entries, central_size = read_zip_directory_metadata(path)
    except ReadinessError as error:
        return unavailable_input(
            kind="zip", path=path, size=outer_bytes, error=str(error)
        )
    if declared_entries > limits["entryCount"]:
        return unavailable_input(
            kind="zip",
            path=path,
            size=outer_bytes,
            error=f"ZIP declares more than {limits['entryCount']} entries",
        )
    if central_size > MAX_CENTRAL_DIRECTORY_BYTES:
        return unavailable_input(
            kind="zip",
            path=path,
            size=outer_bytes,
            error="ZIP central directory exceeds the evaluator safety limit",
        )

    try:
        hashed_bytes, outer_sha256 = sha256_file_bounded(
            path, limits["outerZipBytes"]
        )
    except ReadinessError as error:
        return unavailable_input(
            kind="zip", path=path, size=path.stat().st_size, error=str(error)
        )
    if hashed_bytes != outer_bytes:
        return unavailable_input(
            kind="zip",
            path=path,
            size=hashed_bytes,
            error="ZIP size changed during bounded hashing",
        )
    errors: list[str] = []
    manifest_raw: bytes | None = None
    manifest: dict[str, Any] | None = None
    archive_root: str | None = None
    try:
        with zipfile.ZipFile(path) as archive:
            infos = archive.infolist()
            names = [info.filename for info in infos]
            if len(infos) != declared_entries:
                errors.append("ZIP central-directory entry count is inconsistent")
            if len(infos) > limits["entryCount"]:
                errors.append(f"ZIP contains more than {limits['entryCount']} entries")
            if len(names) != len(set(names)):
                errors.append("ZIP contains duplicate entry names")
            portable_names = [package_contracts.portable_path_key(name) for name in names]
            if len(portable_names) != len(set(portable_names)):
                errors.append("ZIP contains portable path collisions")
            if any(not package_contracts.path_is_safe(name) for name in names):
                errors.append("ZIP contains unsafe or non-portable entry paths")
            collision = prefix_collision(names)
            if collision is not None:
                errors.append(
                    f"ZIP contains file/directory prefix collision: {collision[0]!r}, {collision[1]!r}"
                )
            if any(not zip_entry_is_regular(info) for info in infos):
                errors.append("ZIP contains non-regular or directory entries")
            if any(info.flag_bits & 0x1 for info in infos):
                errors.append("ZIP contains encrypted entries")
            if any(
                len(info.filename.encode("utf-8")) > limits["archivePathBytes"]
                for info in infos
            ):
                errors.append("ZIP contains an entry path above the portable byte limit")
            if any(info.file_size > limits["genericEntryBytes"] for info in infos):
                errors.append("ZIP contains an entry above the generic uncompressed limit")
            total_uncompressed = sum(info.file_size for info in infos)
            total_compressed = sum(info.compress_size for info in infos)
            if total_uncompressed > limits["totalUncompressedBytes"]:
                errors.append("ZIP exceeds the total uncompressed byte limit")
            excessive_entry = next(
                (
                    info.filename
                    for info in infos
                    if entry_ratio(info) > limits["maxEntryCompressionRatio"]
                ),
                None,
            )
            if excessive_entry is not None:
                errors.append(
                    f"ZIP entry exceeds compression-ratio limit: {excessive_entry}"
                )
            if (
                total_uncompressed / max(total_compressed, 1)
                > limits["maxTotalCompressionRatio"]
            ):
                errors.append("ZIP exceeds the total compression-ratio limit")
            if limits["nestedArchivesAllowed"] is False and any(
                info.filename.casefold().endswith(package_contracts.ARCHIVE_SUFFIXES)
                for info in infos
            ):
                errors.append("ZIP contains a nested-archive path")

            roots = {name.split("/", 1)[0] for name in names if name}
            if len(roots) != 1:
                errors.append("ZIP must contain exactly one archive root")
            else:
                archive_root = next(iter(roots))
                if not package_contracts.path_is_safe(archive_root) or "/" in archive_root:
                    errors.append("ZIP archive root is not portable")
            manifest_names = [
                name for name in names if name.endswith("/metadata/manifest.json")
            ]
            expected_manifest_name = (
                f"{archive_root}/metadata/manifest.json" if archive_root else None
            )
            if len(manifest_names) != 1 or manifest_names[0] != expected_manifest_name:
                errors.append("ZIP must contain exactly one manifest below its archive root")
            else:
                manifest_info = archive.getinfo(manifest_names[0])
                if manifest_info.file_size > manifest_limits["manifestBytes"]:
                    errors.append("ZIP manifest exceeds the raw manifest-byte limit")
                elif entry_ratio(manifest_info) > limits["maxEntryCompressionRatio"]:
                    errors.append("ZIP manifest exceeds the compression-ratio limit")
                else:
                    try:
                        manifest_raw = read_zip_entry_bounded(
                            archive, manifest_info, manifest_limits["manifestBytes"]
                        )
                        parsed = parse_json_bytes(manifest_raw, manifest_names[0])
                        validate_json_shape(parsed, manifest_names[0])
                        if isinstance(parsed, dict):
                            manifest = parsed
                        else:
                            errors.append("ZIP manifest JSON root is not an object")
                    except ReadinessError as error:
                        errors.append(str(error))
    except (OSError, zipfile.BadZipFile, RuntimeError, ValueError) as error:
        errors.append(f"Cannot inspect ZIP safely: {error}")

    if isinstance(manifest, dict):
        declared_root = manifest.get("archiveRoot")
        if not isinstance(declared_root, str) or declared_root != archive_root:
            errors.append("manifest archiveRoot does not match the ZIP root")
    return LoadedInput(
        kind="zip",
        name=path.name,
        path=path,
        bytes=outer_bytes,
        sha256=outer_sha256,
        manifest=manifest,
        manifest_bytes=manifest_raw,
        archive_root=archive_root,
        errors=errors,
    )


def target_markers(manifest: dict[str, Any]) -> list[str]:
    return sorted(TARGET_MARKERS.intersection(manifest))


def explicit_legacy_annotation_valid(manifest: dict[str, Any]) -> bool:
    if (
        "manifestDialect" in manifest
        and manifest["manifestDialect"] != "legacy-subject-export-v1"
    ):
        return False
    if "targetRuntimeReadiness" in manifest:
        return manifest["targetRuntimeReadiness"] == {
            "targetProfile": "full-standalone-v1",
            "status": "not-ready-legacy",
            "standaloneProfileReady": False,
            "reasonCode": "TARGET_PROFILE_NOT_DECLARED",
        }
    return True


def classify_manifest(
    manifest: dict[str, Any] | None, policy: dict[str, Any]
) -> tuple[str, list[str]]:
    if manifest is None:
        return "unclassified", []
    markers = target_markers(manifest)
    target = policy["target"]
    complete_marker_set = TARGET_IDENTITY_MARKERS.issubset(manifest)
    exact_identity = (
        manifest.get("$schema") == target["manifestSchema"]["id"]
        and manifest.get("packageFormatVersion") == target["packageFormatVersion"]
        and manifest.get("runtimeContractVersion") == target["runtimeContractVersion"]
        and manifest.get("releaseProfile") == target["releaseProfile"]
        and manifest.get("variant") == target["variant"]
    )
    if complete_marker_set and exact_identity:
        return "full-standalone-v1-candidate", markers
    if markers:
        claims_known_target = (
            manifest.get("$schema") == target["manifestSchema"]["id"]
            or manifest.get("releaseProfile") == target["releaseProfile"]
        )
        if claims_known_target or not complete_marker_set:
            return "partial-target-claim", markers
        return "unsupported", markers
    legacy_shape = (
        manifest.get("publicationProfile") in {"release", "public"}
        and isinstance(manifest.get("packageId"), str)
        and isinstance(manifest.get("archiveRoot"), str)
        and isinstance(manifest.get("subject"), str)
        and isinstance(manifest.get("subjectSlug"), str)
        and isinstance(manifest.get("files"), list)
    )
    if legacy_shape and explicit_legacy_annotation_valid(manifest):
        return "legacy-subject-export", markers
    if legacy_shape:
        return "partial-target-claim", markers
    return "unsupported", markers


def truncate_fragment(value: str, limit: int = MAX_DIAGNOSTIC_FRAGMENT) -> str:
    normalized = " ".join(value.split())
    return normalized if len(normalized) <= limit else normalized[: limit - 3] + "..."


def bounded_schema_diagnostics(
    validator: Draft202012Validator,
    manifest: dict[str, Any],
) -> list[package_contracts.Diagnostic]:
    errors = list(islice(validator.iter_errors(manifest), MAX_SCHEMA_DIAGNOSTICS + 1))
    diagnostics = [
        package_contracts.Diagnostic(
            "MANIFEST_SCHEMA",
            package_contracts.schema_location(error),
            truncate_fragment(error.message),
        )
        for error in errors[:MAX_SCHEMA_DIAGNOSTICS]
    ]
    if len(errors) > MAX_SCHEMA_DIAGNOSTICS:
        diagnostics.append(
            package_contracts.Diagnostic(
                "MANIFEST_SCHEMA_ERROR_LIMIT",
                "/",
                f"More than {MAX_SCHEMA_DIAGNOSTICS} schema diagnostics; validation stopped safely",
            )
        )
    return diagnostics


def canonical_contract_diagnostics(
    manifest: dict[str, Any],
    contracts: TrustedContracts,
) -> tuple[
    list[package_contracts.Diagnostic],
    list[package_contracts.Diagnostic],
    list[package_contracts.Diagnostic],
    list[package_contracts.Diagnostic],
]:
    schema_validator = Draft202012Validator(contracts.manifest_schema)
    schema_diagnostics = bounded_schema_diagnostics(schema_validator, manifest)
    if schema_diagnostics:
        return schema_diagnostics, [], [], []
    diagnostics = package_contracts.validate_manifest(
        manifest,
        schema_validator,
        contracts.profile,
        contracts.roles,
        contracts.trusted_schema_metadata,
        contracts.profile_sha256,
        contracts.profile_bytes,
    )
    target_codes = {"RELEASE_ID_MISMATCH", "SOFTWARE_RANGE_INVALID", "PROFILE_MISMATCH"}
    target = [item for item in diagnostics if item.code in target_codes]
    bindings = [item for item in diagnostics if item.code.startswith("CONTRACT_BINDING_")]
    profile = [
        item
        for item in diagnostics
        if item.code not in target_codes and not item.code.startswith("CONTRACT_BINDING_")
    ]
    return [], target, bindings, profile


def format_diagnostics(diagnostics: list[package_contracts.Diagnostic]) -> str:
    fragments = [
        truncate_fragment(f"{item.code} at {item.location}: {item.message}")
        for item in diagnostics[:MAX_REPORTED_DIAGNOSTICS]
    ]
    if len(diagnostics) > MAX_REPORTED_DIAGNOSTICS:
        fragments.append(
            f"{len(diagnostics) - MAX_REPORTED_DIAGNOSTICS} additional diagnostic(s) omitted"
        )
    return "; ".join(fragments)


def archive_magic(prefix: bytes) -> bool:
    return (
        prefix.startswith((b"PK\x03\x04", b"PK\x05\x06", b"PK\x07\x08"))
        or prefix.startswith(b"\x1f\x8b")
        or prefix.startswith(b"7z\xbc\xaf\x27\x1c")
        or prefix.startswith((b"Rar!\x1a\x07\x00", b"Rar!\x1a\x07\x01\x00"))
        or prefix.startswith(b"BZh")
        or (len(prefix) >= 262 and prefix[257:262] == b"ustar")
    )


def stream_zip_entry_hash(
    archive: zipfile.ZipFile,
    info: zipfile.ZipInfo,
) -> tuple[int, str, bytes]:
    digest = hashlib.sha256()
    byte_count = 0
    prefix = bytearray()
    with archive.open(info, "r") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            byte_count += len(chunk)
            digest.update(chunk)
            if len(prefix) < 512:
                prefix.extend(chunk[: 512 - len(prefix)])
    return byte_count, digest.hexdigest(), bytes(prefix)


def parse_checksum_lines(
    raw: bytes,
    archive_root: str,
    max_lines: int,
) -> tuple[dict[str, str], list[str]]:
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        return {}, ["SHA256SUMS is not UTF-8"]
    lines = text.splitlines()
    issues: list[str] = []
    if len(lines) > max_lines:
        issues.append(f"SHA256SUMS contains more than {max_lines} lines")
    normalized_checksums: dict[str, str] = {}
    for index, line in enumerate(lines[: max_lines + 1], start=1):
        match = re.fullmatch(r"([a-f0-9]{64})  (.+)", line)
        if not match:
            if len(issues) < MAX_REPORTED_DIAGNOSTICS:
                issues.append(f"invalid SHA256SUMS line {index}")
            continue
        digest, raw_path = match.groups()
        normalized_path = (
            raw_path
            if raw_path.startswith(f"{archive_root}/")
            else f"{archive_root}/{raw_path}"
        )
        if not package_contracts.path_is_safe(normalized_path):
            if len(issues) < MAX_REPORTED_DIAGNOSTICS:
                issues.append(f"unsafe SHA256SUMS path on line {index}")
            continue
        if normalized_path in normalized_checksums:
            if len(issues) < MAX_REPORTED_DIAGNOSTICS:
                issues.append(
                    f"duplicate normalized SHA256SUMS path {normalized_path!r}"
                )
            continue
        normalized_checksums[normalized_path] = digest
    return normalized_checksums, issues


def check_zip_inventory(
    loaded: LoadedInput,
    profile: dict[str, Any],
) -> list[str] | None:
    if loaded.kind != "zip":
        return None
    if loaded.manifest is None or loaded.archive_root is None or loaded.errors:
        return ["ZIP input did not pass safe manifest preflight"]
    manifest = loaded.manifest
    root = loaded.archive_root
    raw_records = manifest.get("files")
    if not isinstance(raw_records, list) or any(
        not isinstance(record, dict) or not isinstance(record.get("path"), str)
        for record in raw_records
    ):
        return ["Manifest inventory is not structurally safe"]
    records: list[dict[str, Any]] = raw_records
    record_by_path = {record["path"]: record for record in records}
    if len(record_by_path) != len(records):
        return ["Manifest inventory paths are not unique"]
    excluded = set(profile["inventoryPolicy"]["excludedPaths"])
    limits = profile["archiveLimits"]
    issues: list[str] = []
    try:
        with zipfile.ZipFile(loaded.path) as archive:
            actual_relative: dict[str, zipfile.ZipInfo] = {}
            prefix = f"{root}/"
            for info in archive.infolist():
                if not info.filename.startswith(prefix):
                    issues.append(f"entry outside archive root: {info.filename}")
                    continue
                relative = info.filename[len(prefix) :]
                if relative in actual_relative:
                    issues.append(f"duplicate relative inventory path: {relative}")
                actual_relative[relative] = info
            if not excluded.issubset(actual_relative):
                issues.append("ZIP is missing manifest or SHA256SUMS exclusion entries")
            expected_paths = set(record_by_path)
            actual_inventory_paths = set(actual_relative) - excluded
            if expected_paths != actual_inventory_paths:
                missing = sorted(expected_paths - actual_inventory_paths)[:5]
                unexpected = sorted(actual_inventory_paths - expected_paths)[:5]
                issues.append(
                    f"inventory differs; missing={missing}, unexpected={unexpected}"
                )

            actual_hashes: dict[str, str] = {}
            actual_image_bytes = 0
            for path in sorted(expected_paths.intersection(actual_inventory_paths)):
                byte_count, digest, content_prefix = stream_zip_entry_hash(
                    archive, actual_relative[path]
                )
                actual_hashes[path] = digest
                record = record_by_path[path]
                if byte_count != record.get("bytes"):
                    issues.append(f"{path}: byte count differs from manifest")
                if digest != record.get("sha256"):
                    issues.append(f"{path}: SHA-256 differs from manifest")
                if limits["nestedArchivesAllowed"] is False and archive_magic(content_prefix):
                    issues.append(f"{path}: nested archive content is forbidden")
                if record.get("role") == "binary-asset":
                    actual_image_bytes += byte_count
                    if byte_count > limits["goalVisualizationBytes"]:
                        issues.append(f"{path}: visualization exceeds its byte limit")
            if actual_image_bytes > limits["imageLaneBytes"]:
                issues.append("ZIP image lane exceeds its byte limit")

            bindings = manifest.get("contractBindings")
            if isinstance(bindings, dict):
                for binding_name, binding in bindings.items():
                    if not isinstance(binding, dict):
                        issues.append(f"missing {binding_name} package binding")
                        continue
                    path = binding.get("path")
                    if not isinstance(path, str) or actual_hashes.get(path) != binding.get(
                        "sha256"
                    ):
                        issues.append(
                            f"{binding_name} package-local bytes differ from trusted binding"
                        )

            checksum_info = actual_relative.get("metadata/SHA256SUMS")
            if checksum_info is not None:
                checksum_limit = (limits["entryCount"] + 1) * (
                    64 + 2 + limits["archivePathBytes"] + 1
                )
                try:
                    checksum_raw = read_zip_entry_bounded(
                        archive, checksum_info, checksum_limit
                    )
                    checksums, checksum_issues = parse_checksum_lines(
                        checksum_raw,
                        root,
                        len(records) + 1,
                    )
                    issues.extend(checksum_issues)
                    manifest_name = f"{root}/metadata/manifest.json"
                    expected_checksums = {
                        f"{root}/{path}": digest for path, digest in actual_hashes.items()
                    }
                    expected_checksums[manifest_name] = sha256_bytes(
                        loaded.manifest_bytes or b""
                    )
                    if checksums != expected_checksums:
                        issues.append(
                            "SHA256SUMS does not bind exactly the manifest and payload"
                        )
                except ReadinessError as error:
                    issues.append(str(error))
    except (
        OSError,
        zipfile.BadZipFile,
        RuntimeError,
        KeyError,
        TypeError,
        ValueError,
    ) as error:
        issues.append(f"cannot verify ZIP inventory: {error}")
    return issues


def nonnegative_integer(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool) and value >= 0


def validate_full_validator_report(
    report: dict[str, Any],
    loaded: LoadedInput,
    returncode: int,
) -> None:
    """Reject forged, stale, or structurally ambiguous validator evidence."""

    exact_keys(
        report,
        {
            "reportFormatVersion",
            "validatorId",
            "status",
            "input",
            "package",
            "counts",
            "gates",
            "diagnostics",
            "diagnosticsTruncated",
        },
        "independent validator report",
    )
    if (
        report.get("reportFormatVersion") != FULL_VALIDATOR_REPORT_FORMAT_VERSION
        or report.get("validatorId") != FULL_VALIDATOR_ID
    ):
        raise FullValidatorProcessError(
            "Independent validator report identity/version differs"
        )
    status_value = report.get("status")
    if not isinstance(status_value, str) or status_value not in {"valid", "invalid"}:
        raise FullValidatorProcessError(
            "Independent validator did not return a validation outcome"
        )
    if FULL_VALIDATOR_EXIT_BY_STATUS[status_value] != returncode:
        raise FullValidatorProcessError(
            "Independent validator exit code and report status differ"
        )

    input_value = report.get("input")
    if not isinstance(input_value, dict):
        raise FullValidatorProcessError("Independent validator input binding is malformed")
    exact_keys(input_value, {"path", "bytes", "sha256"}, "validator input binding")
    if input_value != {
        "path": str(loaded.path.resolve()),
        "bytes": loaded.bytes,
        "sha256": loaded.sha256,
    }:
        raise FullValidatorProcessError(
            "Independent validator report is not bound to the evaluated ZIP bytes"
        )

    manifest = loaded.manifest or {}
    package_value = report.get("package")
    if not isinstance(package_value, dict):
        raise FullValidatorProcessError("Independent validator package binding is malformed")
    exact_keys(
        package_value,
        {"archiveRoot", "releaseId", "packageId", "packageVersion", "contentDigest"},
        "validator package binding",
    )
    expected_package = {
        "archiveRoot": loaded.archive_root,
        "releaseId": manifest.get("releaseId"),
        "packageId": manifest.get("packageId"),
        "packageVersion": manifest.get("packageVersion"),
        "contentDigest": manifest.get("contentDigest"),
    }
    if package_value != expected_package:
        raise FullValidatorProcessError(
            "Independent validator report is not bound to the evaluated manifest identity"
        )

    counts = report.get("counts")
    if not isinstance(counts, dict):
        raise FullValidatorProcessError("Independent validator counts are malformed")
    exact_keys(
        counts,
        {"archiveEntries", "manifestFiles", "logicalArtifacts", "binaryResources"},
        "validator counts",
    )
    if any(not nonnegative_integer(value) for value in counts.values()):
        raise FullValidatorProcessError(
            "Independent validator counts must be non-negative integers"
        )

    diagnostics_truncated = report.get("diagnosticsTruncated")
    if not isinstance(diagnostics_truncated, bool):
        raise FullValidatorProcessError(
            "Independent validator diagnosticsTruncated flag is malformed"
        )
    diagnostics = report.get("diagnostics")
    if not isinstance(diagnostics, list) or len(diagnostics) > 500:
        raise FullValidatorProcessError(
            "Independent validator diagnostics are malformed or unbounded"
        )
    diagnostic_tuples: list[tuple[str, str, str, str]] = []
    displayed_by_gate: dict[str, list[str]] = {
        gate: [] for gate in FULL_VALIDATOR_GATE_IDS
    }
    for index, diagnostic in enumerate(diagnostics):
        if not isinstance(diagnostic, dict):
            raise FullValidatorProcessError(
                f"Independent validator diagnostic {index} is not an object"
            )
        exact_keys(
            diagnostic,
            {"gate", "code", "location", "message"},
            f"validator diagnostic {index}",
        )
        gate = diagnostic.get("gate")
        code = diagnostic.get("code")
        location = diagnostic.get("location")
        message = diagnostic.get("message")
        if (
            gate not in FULL_VALIDATOR_GATE_IDS
            or not isinstance(code, str)
            or not code
            or len(code) > 200
            or not isinstance(location, str)
            or not location
            or len(location) > 2000
            or not isinstance(message, str)
            or not message
            or len(message) > 800
        ):
            raise FullValidatorProcessError(
                f"Independent validator diagnostic {index} has invalid fields"
            )
        diagnostic_tuples.append((gate, code, location, message))
        displayed_by_gate[gate].append(code)
    if diagnostic_tuples != sorted(diagnostic_tuples):
        raise FullValidatorProcessError(
            "Independent validator diagnostics are not in canonical order"
        )

    gates = report.get("gates")
    if (
        not isinstance(gates, dict)
        or len(gates) != len(FULL_VALIDATOR_GATE_IDS)
        or set(gates) != set(FULL_VALIDATOR_GATE_IDS)
    ):
        raise FullValidatorProcessError(
            "Independent validator gate set/order differs from the bound protocol"
        )
    all_gates_passed = True
    for gate in FULL_VALIDATOR_GATE_IDS:
        gate_value = gates.get(gate)
        if not isinstance(gate_value, dict):
            raise FullValidatorProcessError(
                f"Independent validator gate {gate} is malformed"
            )
        exact_keys(
            gate_value,
            {"status", "diagnosticCount", "diagnosticCodes"},
            f"validator gate {gate}",
        )
        gate_status = gate_value.get("status")
        diagnostic_count = gate_value.get("diagnosticCount")
        diagnostic_codes = gate_value.get("diagnosticCodes")
        if not isinstance(gate_status, str) or gate_status not in {
            "passed",
            "failed",
            "not-evaluated",
        }:
            raise FullValidatorProcessError(
                f"Independent validator gate {gate} has an unknown status"
            )
        if not nonnegative_integer(diagnostic_count):
            raise FullValidatorProcessError(
                f"Independent validator gate {gate} has an invalid diagnostic count"
            )
        if not isinstance(diagnostic_codes, list) or any(
            not isinstance(code, str) or not code or len(code) > 200
            for code in diagnostic_codes
        ):
            raise FullValidatorProcessError(
                f"Independent validator gate {gate} has malformed diagnostic codes"
            )
        if diagnostic_codes != sorted(set(diagnostic_codes)):
            raise FullValidatorProcessError(
                f"Independent validator gate {gate} diagnostic codes are not canonical"
            )
        displayed_codes = sorted(set(displayed_by_gate[gate]))
        if diagnostic_codes != displayed_codes:
            raise FullValidatorProcessError(
                f"Independent validator gate {gate} diagnostic codes differ from evidence"
            )
        displayed_count = len(displayed_by_gate[gate])
        if diagnostics_truncated:
            if diagnostic_count < displayed_count:
                raise FullValidatorProcessError(
                    f"Independent validator gate {gate} undercounts displayed diagnostics"
                )
        elif diagnostic_count != displayed_count:
            raise FullValidatorProcessError(
                f"Independent validator gate {gate} diagnostic count differs from evidence"
            )
        if gate_status == "failed" and diagnostic_count == 0:
            raise FullValidatorProcessError(
                f"Independent validator gate {gate} failed without diagnostics"
            )
        if gate_status in {"passed", "not-evaluated"} and (
            diagnostic_count != 0 or diagnostic_codes
        ):
            raise FullValidatorProcessError(
                f"Independent validator gate {gate} has diagnostics despite {gate_status}"
            )
        all_gates_passed = all_gates_passed and gate_status == "passed"
    expected_status = "valid" if all_gates_passed else "invalid"
    if status_value != expected_status:
        raise FullValidatorProcessError(
            "Independent validator package status is not derived from its gates"
        )


def read_full_validator_report(path: Path) -> dict[str, Any]:
    try:
        metadata = path.lstat()
        if not stat.S_ISREG(metadata.st_mode) or stat.S_ISLNK(metadata.st_mode):
            raise FullValidatorProcessError(
                "Independent validator report is not a regular non-symlink file"
            )
        if metadata.st_size > MAX_FULL_VALIDATOR_REPORT_BYTES:
            raise FullValidatorProcessError(
                "Independent validator report exceeds its byte limit"
            )
        with path.open("rb") as handle:
            raw = handle.read(MAX_FULL_VALIDATOR_REPORT_BYTES + 1)
    except OSError as error:
        raise FullValidatorProcessError(
            f"Cannot read independent validator report: {error}"
        ) from error
    if len(raw) > MAX_FULL_VALIDATOR_REPORT_BYTES or len(raw) != metadata.st_size:
        raise FullValidatorProcessError(
            "Independent validator report changed during bounded reading"
        )
    try:
        value = parse_json_bytes(raw, "independent full-standalone validator report")
        validate_json_shape(value, "independent full-standalone validator report")
    except ReadinessError as error:
        raise FullValidatorProcessError(str(error)) from error
    if not isinstance(value, dict):
        raise FullValidatorProcessError(
            "Independent validator report JSON root is not an object"
        )
    return value


def run_full_validator_process(
    loaded: LoadedInput,
    *,
    validator_path: Path = FULL_VALIDATOR_PATH,
    timeout_seconds: float = FULL_VALIDATOR_TIMEOUT_SECONDS,
) -> dict[str, Any]:
    """Run the independent validator without importing it or trusting stdout."""

    if (
        loaded.kind != "zip"
        or loaded.sha256 is None
        or loaded.manifest is None
        or loaded.archive_root is None
        or loaded.errors
    ):
        raise FullValidatorProcessError(
            "Independent validator requires a safely preflighted ZIP candidate"
        )
    if timeout_seconds <= 0:
        raise FullValidatorProcessError("Independent validator timeout must be positive")
    validator_path = validator_path.absolute()
    try:
        validator_metadata = validator_path.lstat()
    except OSError as error:
        raise FullValidatorProcessError(
            f"Independent validator is unavailable: {error}"
        ) from error
    if not stat.S_ISREG(validator_metadata.st_mode) or stat.S_ISLNK(
        validator_metadata.st_mode
    ):
        raise FullValidatorProcessError(
            "Independent validator must be a regular non-symlink file"
        )
    validator_path = validator_path.resolve()

    validator_environment = os.environ.copy()
    for variable in ("PYTHONHOME", "PYTHONPATH", "PYTHONSTARTUP"):
        validator_environment.pop(variable, None)
    validator_environment["PYTHONDONTWRITEBYTECODE"] = "1"
    with tempfile.TemporaryDirectory(
        prefix="skillpilot-full-validator-report."
    ) as temporary_name:
        report_path = Path(temporary_name) / "validator-report.json"
        command = [
            sys.executable,
            "-B",
            str(validator_path),
            "--zip",
            str(loaded.path.resolve()),
            "--contracts-dir",
            str(CONTRACT_DIR.resolve()),
            "--report",
            str(report_path),
        ]
        try:
            completed = subprocess.run(
                command,
                cwd=REPO_ROOT,
                env=validator_environment,
                stdin=subprocess.DEVNULL,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=False,
                timeout=timeout_seconds,
            )
        except subprocess.TimeoutExpired as error:
            raise FullValidatorProcessError(
                f"Independent validator exceeded {timeout_seconds:g} seconds"
            ) from error
        except OSError as error:
            raise FullValidatorProcessError(
                f"Cannot start independent validator: {error}"
            ) from error
        if completed.returncode == FULL_VALIDATOR_EXIT_BY_STATUS["error"]:
            raise FullValidatorProcessError(
                "Independent validator reported an operational error"
            )
        if completed.returncode not in {
            FULL_VALIDATOR_EXIT_BY_STATUS["valid"],
            FULL_VALIDATOR_EXIT_BY_STATUS["invalid"],
        }:
            raise FullValidatorProcessError(
                f"Independent validator returned unexpected exit code {completed.returncode}"
            )
        report = read_full_validator_report(report_path)
        validate_full_validator_report(report, loaded, completed.returncode)

    try:
        final_metadata = loaded.path.lstat()
        if not stat.S_ISREG(final_metadata.st_mode) or stat.S_ISLNK(final_metadata.st_mode):
            raise FullValidatorProcessError(
                "Evaluated ZIP is no longer a regular non-symlink file"
            )
        final_bytes, final_sha256 = sha256_file_bounded(loaded.path, loaded.bytes)
    except (OSError, ReadinessError) as error:
        raise FullValidatorProcessError(
            f"Cannot rebind evaluated ZIP after validation: {error}"
        ) from error
    if (
        final_bytes != loaded.bytes
        or final_metadata.st_size != loaded.bytes
        or final_sha256 != loaded.sha256
    ):
        raise FullValidatorProcessError(
            "Evaluated ZIP bytes changed during independent validation"
        )
    return report


def map_full_validator_gates(
    report: dict[str, Any],
) -> dict[str, tuple[str, str, str]]:
    mapped: dict[str, tuple[str, str, str]] = {}
    gates = report["gates"]
    failure_codes = {
        "runtimeCatalog": "RUNTIME_CATALOG_INVALID",
        "offlineSchemaCatalog": "OFFLINE_SCHEMA_CATALOG_INVALID",
        "hardReferenceClosure": "HARD_REFERENCE_CLOSURE_INVALID",
        "contentDigest": "CONTENT_DIGEST_INVALID",
    }
    not_evaluated_codes = {
        "runtimeCatalog": "RUNTIME_CATALOG_NOT_EVALUATED",
        "offlineSchemaCatalog": "OFFLINE_SCHEMA_CATALOG_NOT_EVALUATED",
        "hardReferenceClosure": "HARD_REFERENCE_CLOSURE_NOT_EVALUATED",
        "contentDigest": "CONTENT_DIGEST_NOT_EVALUATED",
    }
    for validator_gate, check_id in FULL_VALIDATOR_GATE_TO_CHECK.items():
        gate = gates[validator_gate]
        status_value = gate["status"]
        if status_value == "passed":
            mapped[check_id] = (
                "pass",
                "CHECK_PASSED",
                f"Independent full-standalone validator gate {validator_gate} passed.",
            )
        elif status_value == "failed":
            diagnostic_codes = ", ".join(gate["diagnosticCodes"][:10]) or "unlisted"
            mapped[check_id] = (
                "fail",
                failure_codes[validator_gate],
                f"Independent validator gate {validator_gate} failed with "
                f"{gate['diagnosticCount']} diagnostic(s): {diagnostic_codes}.",
            )
        else:
            mapped[check_id] = (
                "not-evaluated",
                not_evaluated_codes[validator_gate],
                f"Independent validator gate {validator_gate} was not evaluated.",
            )
    return mapped


def evaluate_full_validator_gates(
    loaded: LoadedInput,
    *,
    validator_path: Path = FULL_VALIDATOR_PATH,
    timeout_seconds: float = FULL_VALIDATOR_TIMEOUT_SECONDS,
) -> dict[str, tuple[str, str, str]]:
    try:
        report = run_full_validator_process(
            loaded,
            validator_path=validator_path,
            timeout_seconds=timeout_seconds,
        )
        return map_full_validator_gates(report)
    except (FullValidatorProcessError, ReadinessError) as error:
        message = (
            "Independent full-standalone validation produced no trustworthy "
            "evidence: "
            + truncate_fragment(str(error), 1200)
        )
        return {
            check_id: (
                "not-evaluated",
                "INDEPENDENT_VALIDATOR_UNAVAILABLE",
                message,
            )
            for check_id in FULL_VALIDATOR_GATE_TO_CHECK.values()
        }


def make_check(
    check_id: str,
    result: str,
    code: str,
    message: str,
    blocking_by_id: dict[str, bool],
) -> dict[str, Any]:
    if check_id not in blocking_by_id:
        raise ReadinessError(f"Evaluator attempted unknown check {check_id!r}")
    return {
        "id": check_id,
        "result": result,
        "blocking": blocking_by_id[check_id],
        "code": code,
        "message": truncate_fragment(message, 1900),
    }


def aggregate_dimension(checks_by_id: dict[str, dict[str, Any]], ids: list[str]) -> str:
    results = [checks_by_id[check_id]["result"] for check_id in ids]
    applicable = [result for result in results if result != "not-applicable"]
    if not applicable:
        return "not-applicable"
    if "fail" in applicable:
        return "fail"
    if "not-evaluated" in applicable:
        return "not-evaluated"
    return "pass"


def derive_blockers(checks: list[dict[str, Any]]) -> list[str]:
    return [
        check["id"]
        for check in checks
        if check["blocking"] and check["result"] != "pass"
    ]


def derive_decision(
    dialect: str,
    checks: list[dict[str, Any]],
) -> dict[str, Any]:
    checks_by_id = {check["id"]: check for check in checks}
    input_result = checks_by_id[INPUT_CHECK_IDS[0]]["result"]
    if input_result != "pass":
        status, reason = "invalid", "INPUT_INVALID"
    elif dialect == "legacy-subject-export":
        status, reason = "not-ready-legacy", "TARGET_PROFILE_NOT_DECLARED"
    elif dialect == "partial-target-claim":
        status, reason = "invalid", "PARTIAL_TARGET_CLAIM"
    elif dialect == "unsupported":
        status, reason = "unsupported", "UNSUPPORTED_TARGET_CONTRACT"
    elif dialect != "full-standalone-v1-candidate":
        status, reason = "invalid", "INPUT_INVALID"
    elif any(
        checks_by_id[check_id]["result"] == "fail"
        for check_id in [*IDENTITY_CHECK_IDS, *CONTRACT_CHECK_IDS]
    ):
        status, reason = "invalid", "TARGET_CONTRACT_INVALID"
    elif any(
        checks_by_id[check_id]["result"] == "fail"
        for check_id in PUBLICATION_CHECK_IDS
    ):
        status, reason = "not-ready-incomplete", "REDISTRIBUTION_REVIEW_REQUIRED"
    elif any(check["result"] == "fail" for check in checks):
        status, reason = "not-ready-incomplete", "REQUIRED_GATES_FAILED"
    elif any(check["result"] != "pass" for check in checks):
        status, reason = "not-ready-incomplete", "REQUIRED_GATES_NOT_EVALUATED"
    elif EVALUATOR_COMPLETE_FOR_POLICY:
        status, reason = "ready", "CHECK_PASSED"
    else:
        status, reason = "not-ready-incomplete", "REQUIRED_GATES_NOT_EVALUATED"
    return {
        "status": status,
        "standaloneProfileReady": status == "ready",
        "primaryReasonCode": reason,
        "blockingCheckIds": derive_blockers(checks),
    }


def evaluate_loaded_input(
    loaded: LoadedInput,
    contracts: TrustedContracts,
) -> dict[str, Any]:
    manifest = loaded.manifest
    policy = contracts.policy
    dialect, markers = classify_manifest(manifest, policy)
    blocking_by_id = {
        item["id"]: item["blocking"] for item in policy["requiredChecks"]
    }
    checks_by_id: dict[str, dict[str, Any]] = {}

    def record(check_id: str, result: str, code: str, message: str) -> None:
        if check_id in checks_by_id:
            raise ReadinessError(f"Evaluator recorded check twice: {check_id}")
        checks_by_id[check_id] = make_check(
            check_id, result, code, message, blocking_by_id
        )

    def mark_checks(
        check_ids: list[str], result: str, code: str, message: str
    ) -> None:
        for check_id in check_ids:
            record(check_id, result, code, message)

    input_safe = not loaded.errors and manifest is not None
    record(
        INPUT_CHECK_IDS[0],
        "pass" if input_safe else "fail",
        "INPUT_SAFE" if input_safe else "INPUT_INVALID",
        "Input passed bounded duplicate-safe parsing and container preflight."
        if input_safe
        else "; ".join(truncate_fragment(item) for item in loaded.errors[:5])
        or "Input manifest is unavailable.",
    )

    if not input_safe:
        mark_checks(
            [*IDENTITY_CHECK_IDS, *CONTRACT_CHECK_IDS, *CATALOG_CHECK_IDS, *STANDALONE_CHECK_IDS, *PUBLICATION_CHECK_IDS, *CONSUMER_CHECK_IDS],
            "not-applicable",
            "INPUT_INVALID",
            "No readiness interpretation is permitted after input-safety failure.",
        )
    elif dialect == "legacy-subject-export":
        record(
            IDENTITY_CHECK_IDS[0],
            "fail",
            "TARGET_PROFILE_NOT_DECLARED",
            "Recognized legacy subject export; legacy validity cannot establish full-standalone-v1 readiness.",
        )
        mark_checks(
            [*CONTRACT_CHECK_IDS, *CATALOG_CHECK_IDS, *STANDALONE_CHECK_IDS, *PUBLICATION_CHECK_IDS, *CONSUMER_CHECK_IDS],
            "not-applicable",
            "LEGACY_TARGET_CHECK_NOT_APPLICABLE",
            "Target-contract check is not applied to a recognized legacy artifact.",
        )
    elif dialect == "partial-target-claim":
        record(
            IDENTITY_CHECK_IDS[0],
            "fail",
            "PARTIAL_TARGET_CLAIM",
            "One or more target markers or malformed legacy readiness annotations are present without a coherent exact target contract.",
        )
        assert manifest is not None
        schema_diagnostics = bounded_schema_diagnostics(
            Draft202012Validator(contracts.manifest_schema), manifest
        )
        record(
            "contract.manifest-schema",
            "fail" if schema_diagnostics else "not-applicable",
            "MANIFEST_SCHEMA_INVALID" if schema_diagnostics else "INCOHERENT_TARGET_CONTRACT",
            format_diagnostics(schema_diagnostics)
            if schema_diagnostics
            else "Target schema is not applied as an identity upgrade.",
        )
        mark_checks(
            CONTRACT_CHECK_IDS[1:],
            "not-applicable",
            "INCOHERENT_TARGET_CONTRACT",
            "Later contract checks are not applied to an incoherent target claim.",
        )
        mark_checks(
            [*CATALOG_CHECK_IDS, *STANDALONE_CHECK_IDS, *PUBLICATION_CHECK_IDS, *CONSUMER_CHECK_IDS],
            "not-applicable",
            "INCOHERENT_TARGET_CONTRACT",
            "Later readiness gates are not applied to an incoherent target claim.",
        )
    elif dialect == "unsupported":
        record(
            IDENTITY_CHECK_IDS[0],
            "fail",
            "UNSUPPORTED_TARGET_CONTRACT",
            "Input does not declare the supported full-standalone-v1 target contract.",
        )
        mark_checks(
            [*CONTRACT_CHECK_IDS, *CATALOG_CHECK_IDS, *STANDALONE_CHECK_IDS, *PUBLICATION_CHECK_IDS, *CONSUMER_CHECK_IDS],
            "not-applicable",
            "UNSUPPORTED_TARGET_CONTRACT",
            "Target-contract check is not applicable to an unsupported contract.",
        )
    elif dialect == "full-standalone-v1-candidate" and manifest is not None:
        record(
            IDENTITY_CHECK_IDS[0],
            "pass",
            "TARGET_CONTRACT_DECLARED",
            "Manifest declares the exact supported JSON target identity.",
        )
        schema_issues, target_issues, binding_issues, profile_issues = (
            canonical_contract_diagnostics(manifest, contracts)
        )
        if schema_issues:
            record(
                "contract.manifest-schema",
                "fail",
                "MANIFEST_SCHEMA_INVALID",
                format_diagnostics(schema_issues),
            )
            mark_checks(
                CONTRACT_CHECK_IDS[1:],
                "not-evaluated",
                "MANIFEST_SCHEMA_BLOCKED",
                "Schema-invalid target data is not passed to dependent contract or inventory checks.",
            )
        else:
            record(
                "contract.manifest-schema",
                "pass",
                "CHECK_PASSED",
                "Manifest passes the trusted bounded Draft 2020-12 schema.",
            )
            for check_id, issues, failure_code, success_message in (
                (
                    "contract.target-values",
                    target_issues,
                    "TARGET_VALUES_INVALID",
                    "Target identity, compatibility range, and release identity are coherent.",
                ),
                (
                    "contract.trusted-bindings",
                    binding_issues,
                    "TRUSTED_BINDINGS_INVALID",
                    "Manifest binds exact trusted schema/profile IDs, hashes, roles, and byte sizes.",
                ),
                (
                    "contract.profile-roles",
                    profile_issues,
                    "PROFILE_RULES_INVALID",
                    "Profile roles, portable paths, licensing, redistribution, and declared archive limits pass.",
                ),
            ):
                record(
                    check_id,
                    "fail" if issues else "pass",
                    failure_code if issues else "CHECK_PASSED",
                    format_diagnostics(issues) if issues else success_message,
                )
            inventory_issues = check_zip_inventory(loaded, contracts.profile)
            if inventory_issues is None:
                record(
                    "contract.inventory-bytes",
                    "not-evaluated",
                    "PAYLOAD_NOT_PROVIDED",
                    "A standalone manifest cannot prove the finished ZIP payload inventory.",
                )
            else:
                record(
                    "contract.inventory-bytes",
                    "fail" if inventory_issues else "pass",
                    "INVENTORY_BYTES_INVALID" if inventory_issues else "CHECK_PASSED",
                    "; ".join(truncate_fragment(item) for item in inventory_issues[:5])
                    if inventory_issues
                    else "Finished ZIP inventory, contract copies, hashes, checksums, and actual archive limits match.",
                )

        if schema_issues:
            record(
                PUBLICATION_CHECK_IDS[0],
                "not-evaluated",
                "MANIFEST_SCHEMA_BLOCKED",
                "Redistribution clearance is not evaluated for a schema-invalid manifest.",
            )
        else:
            uncleared_paths = sorted(
                record_value.get("path", "<unknown>")
                for record_value in manifest.get("files", [])
                if isinstance(record_value, dict)
                and record_value.get("redistributionStatus") != "allowed"
            )
            record(
                PUBLICATION_CHECK_IDS[0],
                "fail" if uncleared_paths else "pass",
                "REDISTRIBUTION_REVIEW_REQUIRED"
                if uncleared_paths
                else "CHECK_PASSED",
                (
                    "Redistribution is not cleared for: "
                    + ", ".join(uncleared_paths[:5])
                )
                if uncleared_paths
                else "Every distributed file is explicitly cleared for redistribution.",
            )

        validator_check_ids = [
            *CATALOG_CHECK_IDS,
            *STANDALONE_CHECK_IDS,
        ]
        if loaded.kind != "zip":
            mark_checks(
                validator_check_ids,
                "not-evaluated",
                "PAYLOAD_NOT_PROVIDED",
                "A standalone manifest cannot prove package-local catalog, closure, or content-digest gates.",
            )
        elif any(
            checks_by_id[check_id]["result"] != "pass"
            for check_id in [*IDENTITY_CHECK_IDS, *CONTRACT_CHECK_IDS]
        ):
            mark_checks(
                validator_check_ids,
                "not-evaluated",
                "INDEPENDENT_VALIDATOR_BLOCKED",
                "The independent validator is not run until target-contract and finished-ZIP inventory checks pass.",
            )
        else:
            mapped_gates = evaluate_full_validator_gates(loaded)
            for check_id in validator_check_ids:
                result, code, message = mapped_gates[check_id]
                record(check_id, result, code, message)
        record(
            "consumer.hermetic-package-only",
            "not-evaluated",
            "HERMETIC_CONSUMER_GATE_NOT_IMPLEMENTED",
            "The package-only SkillPilot consumer smoke test is not yet implemented.",
        )
    else:
        raise ReadinessError(f"Unhandled safe manifest dialect {dialect!r}")

    if set(checks_by_id) != set(REQUIRED_CHECK_IDS):
        raise ReadinessError(
            f"Evaluator check coverage differs; missing={sorted(set(REQUIRED_CHECK_IDS) - set(checks_by_id))}"
        )
    checks = [checks_by_id[check_id] for check_id in REQUIRED_CHECK_IDS]
    report = {
        "$schema": REPORT_SCHEMA_ID,
        "reportFormatVersion": "1.0",
        "scope": policy["scope"],
        "policy": {
            "id": policy["policyId"],
            "sha256": sha256_file(POLICY_PATH),
            "requiredCheckIds": REQUIRED_CHECK_IDS,
        },
        "evaluator": {
            "name": EVALUATOR_NAME,
            "version": EVALUATOR_VERSION,
            "jsonschemaVersion": JSONSCHEMA_VERSION,
            "implementedCheckIds": IMPLEMENTED_CHECK_IDS,
            "completeForPolicy": EVALUATOR_COMPLETE_FOR_POLICY,
        },
        "input": {
            "kind": loaded.kind,
            "name": loaded.name,
            "bytes": loaded.bytes,
            "sha256": loaded.sha256,
            "manifestSha256": sha256_bytes(loaded.manifest_bytes)
            if loaded.manifest_bytes is not None
            else None,
            "archiveRoot": loaded.archive_root,
        },
        "classification": {
            "manifestDialect": dialect,
            "targetMarkers": markers,
        },
        "dimensions": {
            "inputIntegrity": aggregate_dimension(checks_by_id, INPUT_CHECK_IDS),
            "contractConformance": aggregate_dimension(
                checks_by_id, CONTRACT_CHECK_IDS
            ),
            "catalogCompleteness": aggregate_dimension(
                checks_by_id, CATALOG_CHECK_IDS
            ),
            "standaloneCompleteness": aggregate_dimension(
                checks_by_id, STANDALONE_CHECK_IDS
            ),
            "publicationReadiness": aggregate_dimension(
                checks_by_id, PUBLICATION_CHECK_IDS
            ),
            "consumerOperability": aggregate_dimension(
                checks_by_id, CONSUMER_CHECK_IDS
            ),
        },
        "decision": derive_decision(dialect, checks),
        "checks": checks,
    }
    validate_report_semantics(report, contracts)
    return report


def validate_report_semantics(
    report: dict[str, Any],
    contracts: TrustedContracts,
) -> None:
    errors = list(
        islice(
            Draft202012Validator(contracts.report_schema).iter_errors(report),
            MAX_SCHEMA_DIAGNOSTICS,
        )
    )
    if errors:
        error = errors[0]
        location = "/" + "/".join(str(item) for item in error.absolute_path)
        raise ReadinessError(
            f"Readiness report schema failure at {location}: {truncate_fragment(error.message)}"
        )

    expected_policy = {
        "id": POLICY_ID,
        "sha256": sha256_file(POLICY_PATH),
        "requiredCheckIds": REQUIRED_CHECK_IDS,
    }
    if report["policy"] != expected_policy:
        raise ReadinessError("Readiness report policy binding is stale or forged")
    expected_evaluator = {
        "name": EVALUATOR_NAME,
        "version": EVALUATOR_VERSION,
        "jsonschemaVersion": JSONSCHEMA_VERSION,
        "implementedCheckIds": IMPLEMENTED_CHECK_IDS,
        "completeForPolicy": EVALUATOR_COMPLETE_FOR_POLICY,
    }
    if report["evaluator"] != expected_evaluator:
        raise ReadinessError("Readiness report evaluator binding is stale or forged")

    checks = report["checks"]
    check_ids = [check["id"] for check in checks]
    if check_ids != REQUIRED_CHECK_IDS:
        raise ReadinessError("Readiness report check multiset/order differs from policy")
    if any(check["blocking"] is not True for check in checks):
        raise ReadinessError("Readiness report changed policy blocking semantics")
    if any(
        check["id"] not in IMPLEMENTED_CHECK_IDS and check["result"] == "pass"
        for check in checks
    ):
        raise ReadinessError("Unimplemented readiness check cannot claim pass")
    if checks[0]["result"] == "pass" and (
        report["input"]["sha256"] is None
        or report["input"]["manifestSha256"] is None
    ):
        raise ReadinessError("Input-integrity pass requires artifact and manifest hashes")

    checks_by_id = {check["id"]: check for check in checks}
    expected_dimensions = {
        "inputIntegrity": aggregate_dimension(checks_by_id, INPUT_CHECK_IDS),
        "contractConformance": aggregate_dimension(checks_by_id, CONTRACT_CHECK_IDS),
        "catalogCompleteness": aggregate_dimension(checks_by_id, CATALOG_CHECK_IDS),
        "standaloneCompleteness": aggregate_dimension(
            checks_by_id, STANDALONE_CHECK_IDS
        ),
        "publicationReadiness": aggregate_dimension(
            checks_by_id, PUBLICATION_CHECK_IDS
        ),
        "consumerOperability": aggregate_dimension(checks_by_id, CONSUMER_CHECK_IDS),
    }
    if report["dimensions"] != expected_dimensions:
        raise ReadinessError("Readiness dimensions are not derived from bound checks")
    expected_decision = derive_decision(
        report["classification"]["manifestDialect"], checks
    )
    if report["decision"] != expected_decision:
        raise ReadinessError("Readiness decision is not derived exactly from checks/dialect")
    if report["decision"]["status"] == "ready" or report["decision"][
        "standaloneProfileReady"
    ]:
        raise ReadinessError("This incomplete evaluator version cannot emit ready")


def evaluate_path(path: Path, kind: str) -> dict[str, Any]:
    contracts = trusted_contracts()
    if not path.is_file():
        raise ReadinessError(f"Input is not a regular file: {path}")
    if kind == "manifest":
        loaded = load_manifest_input(
            path, contracts.profile["manifestLimits"]["manifestBytes"]
        )
    else:
        loaded = load_zip_input(path, contracts.profile)
    return evaluate_loaded_input(loaded, contracts)


def stable_json(value: Any, pretty: bool = True) -> str:
    if pretty:
        return json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    return json.dumps(
        value, ensure_ascii=False, separators=(",", ":"), sort_keys=True
    ) + "\n"


def assert_semantic_rejection(
    report: dict[str, Any],
    contracts: TrustedContracts,
    label: str,
) -> None:
    try:
        validate_report_semantics(report, contracts)
    except ReadinessError:
        print(f"PASS readiness semantic guard rejects {label}")
    else:
        raise ReadinessError(f"Semantic guard accepted {label}")


def assert_full_validator_report_rejection(
    report: dict[str, Any],
    loaded: LoadedInput,
    returncode: int,
    label: str,
) -> None:
    try:
        validate_full_validator_report(report, loaded, returncode)
    except (FullValidatorProcessError, ReadinessError):
        print(f"PASS independent validator report guard rejects {label}")
    else:
        raise ReadinessError(
            f"Independent validator report guard accepted {label}"
        )


def assert_full_validator_process_not_evaluated(
    loaded: LoadedInput,
    validator_path: Path,
    label: str,
    *,
    timeout_seconds: float = 5,
) -> None:
    mapped = evaluate_full_validator_gates(
        loaded,
        validator_path=validator_path,
        timeout_seconds=timeout_seconds,
    )
    if set(mapped) != set(FULL_VALIDATOR_GATE_TO_CHECK.values()) or any(
        result != "not-evaluated" or code != "INDEPENDENT_VALIDATOR_UNAVAILABLE"
        for result, code, _message in mapped.values()
    ):
        raise ReadinessError(
            f"Independent validator process failure was not mapped safely: {label}"
        )
    print(f"PASS independent validator process maps to not-evaluated: {label}")


def assert_policy_rejection(
    contracts: TrustedContracts,
    policy: dict[str, Any],
    label: str,
) -> None:
    try:
        validate_policy_contract(
            contracts.manifest_schema,
            contracts.profile,
            policy,
            contracts.report_schema,
            manifest_schema_sha256=contracts.manifest_schema_sha256,
            profile_sha256=contracts.profile_sha256,
            report_schema_sha256=contracts.report_schema_sha256,
        )
    except ReadinessError:
        print(f"PASS readiness policy guard rejects {label}")
    else:
        raise ReadinessError(f"Readiness policy guard accepted {label}")


def regular_zip_info(name: str) -> zipfile.ZipInfo:
    info = zipfile.ZipInfo(name)
    info.create_system = 3
    info.external_attr = (stat.S_IFREG | 0o644) << 16
    info.compress_type = zipfile.ZIP_DEFLATED
    return info


def write_zip(path: Path, entries: dict[str, bytes]) -> None:
    with zipfile.ZipFile(path, "w") as archive:
        for name, payload in entries.items():
            archive.writestr(regular_zip_info(name), payload)


def legacy_manifest() -> dict[str, Any]:
    return load_trusted_json(FIXTURE_DIR / "legacy.manifest.json")


def build_legacy_zip(path: Path, extra_entries: dict[str, bytes]) -> None:
    manifest = legacy_manifest()
    root = manifest["archiveRoot"]
    entries = {
        f"{root}/metadata/manifest.json": stable_json(manifest).encode("utf-8"),
        **extra_entries,
    }
    write_zip(path, entries)


def build_target_zip(
    path: Path,
    contracts: TrustedContracts,
    *,
    nested_magic_role: str | None = None,
    duplicate_normalized_checksum: bool = False,
) -> None:
    manifest = load_trusted_json(FIXTURE_DIR / "target-contract-only.manifest.json")
    root = manifest["archiveRoot"]
    trusted_payloads_by_path = {
        manifest["contractBindings"][binding_name]["path"]: (
            CONTRACT_DIR / package_contracts.TRUSTED_SCHEMA_BINDINGS[binding_name][1]
        ).read_bytes()
        for binding_name in package_contracts.TRUSTED_SCHEMA_BINDINGS
    }
    payloads: dict[str, bytes] = {}
    for record in manifest["files"]:
        relative = record["path"]
        if relative in trusted_payloads_by_path:
            payload = trusted_payloads_by_path[relative]
        elif relative == manifest["contractBindings"]["releaseProfile"]["path"]:
            payload = PROFILE_PATH.read_bytes()
        elif record["role"] == "license":
            payload = b"Apache License 2.0 fixture\n"
        else:
            payload = stable_json({"fixtureRole": record["role"]}).encode("utf-8")
        if nested_magic_role == record["role"]:
            payload = b"PK\x03\x04nested archive fixture"
        payloads[relative] = payload
        record["bytes"] = len(payload)
        record["sha256"] = sha256_bytes(payload)

    for binding in manifest["contractBindings"].values():
        binding_path = binding["path"]
        binding["sha256"] = sha256_bytes(payloads[binding_path])
    manifest_bytes = stable_json(manifest).encode("utf-8")
    checksum_lines = [
        f"{sha256_bytes(payload)}  {root}/{relative}"
        for relative, payload in sorted(payloads.items())
    ]
    checksum_lines.append(
        f"{sha256_bytes(manifest_bytes)}  {root}/metadata/manifest.json"
    )
    if duplicate_normalized_checksum:
        first_relative = sorted(payloads)[0]
        checksum_lines.append(
            f"{sha256_bytes(payloads[first_relative])}  {first_relative}"
        )
    entries = {
        **{f"{root}/{relative}": payload for relative, payload in payloads.items()},
        f"{root}/metadata/manifest.json": manifest_bytes,
        f"{root}/metadata/SHA256SUMS": ("\n".join(checksum_lines) + "\n").encode(
            "utf-8"
        ),
    }
    write_zip(path, entries)


def run_fixture_suite() -> None:
    contracts = trusted_contracts()
    expectations = load_trusted_json(FIXTURE_DIR / "expectations.json")
    if expectations.get("fixtureFormatVersion") != 1 or not isinstance(
        expectations.get("cases"), list
    ):
        raise ReadinessError("Readiness fixture expectation suite is malformed")
    seen_ids: set[str] = set()
    reports_by_id: dict[str, dict[str, Any]] = {}
    for raw_case in expectations["cases"]:
        if not isinstance(raw_case, dict):
            raise ReadinessError("Readiness fixture case must be an object")
        exact_keys(
            raw_case,
            {
                "id",
                "input",
                "expectedStatus",
                "expectedDialect",
                "expectedPrimaryReasonCode",
                "expectedResults",
                "expectedBlockingCheckIds",
            },
            "readiness fixture case",
        )
        case_id = raw_case.get("id")
        input_name = raw_case.get("input")
        if (
            not isinstance(case_id, str)
            or case_id in seen_ids
            or not isinstance(input_name, str)
        ):
            raise ReadinessError(
                "Readiness fixture case ID/input is malformed or duplicate"
            )
        seen_ids.add(case_id)
        path = (FIXTURE_DIR / input_name).resolve()
        if FIXTURE_DIR.resolve() not in path.parents:
            raise ReadinessError(f"Fixture escapes readiness directory: {input_name}")
        loaded = load_manifest_input(
            path, contracts.profile["manifestLimits"]["manifestBytes"]
        )
        report = evaluate_loaded_input(loaded, contracts)
        reports_by_id[case_id] = report
        if report["decision"]["status"] != raw_case.get("expectedStatus"):
            raise ReadinessError(f"Fixture {case_id} status differs")
        if report["classification"]["manifestDialect"] != raw_case.get(
            "expectedDialect"
        ):
            raise ReadinessError(f"Fixture {case_id} dialect differs")
        if report["decision"]["primaryReasonCode"] != raw_case.get(
            "expectedPrimaryReasonCode"
        ):
            raise ReadinessError(f"Fixture {case_id} primary reason differs")
        expected_results = raw_case.get("expectedResults")
        if not isinstance(expected_results, dict) or list(expected_results) != REQUIRED_CHECK_IDS:
            raise ReadinessError(
                f"Fixture {case_id} must pin every check result in policy order"
            )
        actual_results = {
            check["id"]: check["result"] for check in report["checks"]
        }
        if actual_results != expected_results:
            raise ReadinessError(
                f"Fixture {case_id} check results differ: {actual_results!r}"
            )
        if report["decision"]["blockingCheckIds"] != raw_case.get(
            "expectedBlockingCheckIds"
        ):
            raise ReadinessError(f"Fixture {case_id} blocking checks differ")
        print(f"PASS readiness fixture {case_id}: {report['decision']['status']}")

    target_report = reports_by_id.get("formal-contract-is-still-incomplete")
    if target_report is None:
        raise ReadinessError("Readiness fixtures must include exact target candidate")

    review_required_manifest = copy.deepcopy(
        load_trusted_json(FIXTURE_DIR / "target-contract-only.manifest.json")
    )
    review_required_record = review_required_manifest["files"][3]
    review_required_record["redistributionStatus"] = "review-required"
    review_required_record["licenseExpression"] = None
    review_required_bytes = stable_json(review_required_manifest).encode("utf-8")
    review_required_report = evaluate_loaded_input(
        LoadedInput(
            kind="manifest",
            name="review-required-target.manifest.json",
            path=FIXTURE_DIR / "target-contract-only.manifest.json",
            bytes=len(review_required_bytes),
            sha256=sha256_bytes(review_required_bytes),
            manifest=review_required_manifest,
            manifest_bytes=review_required_bytes,
            archive_root=review_required_manifest["archiveRoot"],
            errors=[],
        ),
        contracts,
    )
    review_checks = {
        check["id"]: check for check in review_required_report["checks"]
    }
    if (
        review_required_report["decision"]["status"] != "not-ready-incomplete"
        or review_required_report["decision"]["primaryReasonCode"]
        != "REDISTRIBUTION_REVIEW_REQUIRED"
        or review_checks["contract.manifest-schema"]["result"] != "pass"
        or review_checks["contract.profile-roles"]["result"] != "pass"
        or review_checks[PUBLICATION_CHECK_IDS[0]]["result"] != "fail"
    ):
        raise ReadinessError(
            "Review-required redistribution was misclassified as a contract error"
        )
    print("PASS redistribution review is valid-but-not-ready")

    forged_ready = copy.deepcopy(target_report)
    forged_ready["decision"]["status"] = "ready"
    forged_ready["decision"]["standaloneProfileReady"] = True
    assert_semantic_rejection(forged_ready, contracts, "forged ready decision")

    forged_complete = copy.deepcopy(target_report)
    forged_complete["evaluator"]["implementedCheckIds"] = REQUIRED_CHECK_IDS
    forged_complete["evaluator"]["completeForPolicy"] = True
    for check in forged_complete["checks"]:
        check["result"] = "pass"
        check["code"] = "CHECK_PASSED"
        check["message"] = "forged pass"
    forged_complete["dimensions"] = {
        key: "pass" for key in forged_complete["dimensions"]
    }
    forged_complete["decision"] = {
        "status": "ready",
        "standaloneProfileReady": True,
        "primaryReasonCode": "CHECK_PASSED",
        "blockingCheckIds": [],
    }
    assert_semantic_rejection(
        forged_complete, contracts, "self-declared complete evaluator"
    )
    forged_status = copy.deepcopy(target_report)
    forged_status["decision"]["status"] = "unsupported"
    forged_status["decision"]["primaryReasonCode"] = "UNSUPPORTED_TARGET_CONTRACT"
    assert_semantic_rejection(
        forged_status, contracts, "candidate/unsupported decision"
    )
    missing_check = copy.deepcopy(target_report)
    missing_check["checks"] = missing_check["checks"][:-1]
    assert_semantic_rejection(missing_check, contracts, "incomplete check set")
    forged_input_hash = copy.deepcopy(target_report)
    forged_input_hash["input"]["sha256"] = None
    assert_semantic_rejection(
        forged_input_hash, contracts, "input-integrity pass without artifact hash"
    )

    for field in ("manifestDialect", "targetRuntimeReadiness"):
        malformed_legacy = legacy_manifest()
        malformed_legacy[field] = None
        loaded = LoadedInput(
            kind="manifest",
            name=f"legacy-null-{field}.json",
            path=FIXTURE_DIR / "legacy.manifest.json",
            bytes=1,
            sha256="0" * 64,
            manifest=malformed_legacy,
            manifest_bytes=b"{}",
            archive_root=malformed_legacy["archiveRoot"],
            errors=[],
        )
        report = evaluate_loaded_input(loaded, contracts)
        if (
            report["classification"]["manifestDialect"] != "partial-target-claim"
            or report["decision"]["status"] != "invalid"
        ):
            raise ReadinessError(f"Null legacy annotation was accepted: {field}")
        print(f"PASS readiness rejects null legacy annotation {field}")

    malformed_target = load_trusted_json(
        FIXTURE_DIR / "target-contract-only.manifest.json"
    )
    malformed_target["files"][0]["role"] = []
    loaded = LoadedInput(
        kind="manifest",
        name="malformed-target.json",
        path=FIXTURE_DIR / "target-contract-only.manifest.json",
        bytes=1,
        sha256="0" * 64,
        manifest=malformed_target,
        manifest_bytes=b"{}",
        archive_root=malformed_target["archiveRoot"],
        errors=[],
    )
    malformed_report = evaluate_loaded_input(loaded, contracts)
    if malformed_report["decision"]["status"] != "invalid":
        raise ReadinessError("Malformed target did not produce structured invalid report")
    print("PASS malformed target produces structured invalid report")

    for label, mutation in (
        (
            "report-schema hash drift",
            lambda policy: policy["reportSchema"].update({"sha256": "0" * 64}),
        ),
        (
            "evaluator version drift",
            lambda policy: policy["evaluator"].update({"version": "9.9.9"}),
        ),
        (
            "target/profile drift",
            lambda policy: policy["target"].update({"runtimeContractVersion": "9.9"}),
        ),
        (
            "check-order drift",
            lambda policy: policy["requiredChecks"].reverse(),
        ),
    ):
        mutated_policy = copy.deepcopy(contracts.policy)
        mutation(mutated_policy)
        assert_policy_rejection(contracts, mutated_policy, label)

    with tempfile.TemporaryDirectory(prefix="skillpilot-readiness-") as temp_name:
        temp_dir = Path(temp_name)
        raw_invalid_cases = {
            "duplicate-key": b'{"packageId":"a","packageId":"b"}\n',
            "nonfinite": b'{"value":NaN}\n',
            "deep-recursion": (b"[" * 2000) + b"0" + (b"]" * 2000),
        }
        for label, raw in raw_invalid_cases.items():
            raw_path = temp_dir / f"{label}.json"
            raw_path.write_bytes(raw)
            raw_report = evaluate_loaded_input(
                load_manifest_input(
                    raw_path, contracts.profile["manifestLimits"]["manifestBytes"]
                ),
                contracts,
            )
            if (
                raw_report["decision"]["status"] != "invalid"
                or raw_report["checks"][0]["result"] != "fail"
            ):
                raise ReadinessError(f"Unsafe raw JSON was accepted: {label}")
        print(f"PASS bounded raw JSON parser rejects {len(raw_invalid_cases)} cases")

        target_zip = temp_dir / "target.zip"
        build_target_zip(target_zip, contracts)
        target_loaded = load_zip_input(target_zip, contracts.profile)
        target_zip_report = evaluate_loaded_input(target_loaded, contracts)
        target_checks = {
            check["id"]: check for check in target_zip_report["checks"]
        }
        if (
            target_zip_report["decision"]["status"] != "not-ready-incomplete"
            or target_checks["contract.inventory-bytes"]["result"] != "pass"
        ):
            raise ReadinessError("Generated safe target ZIP failed inventory validation")
        print("PASS generated safe target ZIP inventory")

        validator_report = {
            "reportFormatVersion": FULL_VALIDATOR_REPORT_FORMAT_VERSION,
            "validatorId": FULL_VALIDATOR_ID,
            "status": "invalid",
            "input": {
                "path": str(target_loaded.path.resolve()),
                "bytes": target_loaded.bytes,
                "sha256": target_loaded.sha256,
            },
            "package": {
                "archiveRoot": target_loaded.archive_root,
                "releaseId": target_loaded.manifest.get("releaseId"),
                "packageId": target_loaded.manifest.get("packageId"),
                "packageVersion": target_loaded.manifest.get("packageVersion"),
                "contentDigest": target_loaded.manifest.get("contentDigest"),
            },
            "counts": {
                "archiveEntries": len(target_loaded.manifest["files"]) + 2,
                "manifestFiles": len(target_loaded.manifest["files"]),
                "logicalArtifacts": 0,
                "binaryResources": 0,
            },
            "gates": {
                "inventory": {
                    "status": "passed",
                    "diagnosticCount": 0,
                    "diagnosticCodes": [],
                },
                "runtimeCatalog": {
                    "status": "failed",
                    "diagnosticCount": 1,
                    "diagnosticCodes": ["SELF_TEST_RUNTIME_INVALID"],
                },
                "offlineSchemaCatalog": {
                    "status": "passed",
                    "diagnosticCount": 0,
                    "diagnosticCodes": [],
                },
                "hardReferenceClosure": {
                    "status": "not-evaluated",
                    "diagnosticCount": 0,
                    "diagnosticCodes": [],
                },
                "contentDigest": {
                    "status": "failed",
                    "diagnosticCount": 1,
                    "diagnosticCodes": ["SELF_TEST_DIGEST_INVALID"],
                },
                "assetBytes": {
                    "status": "passed",
                    "diagnosticCount": 0,
                    "diagnosticCodes": [],
                },
            },
            "diagnostics": [
                {
                    "gate": "contentDigest",
                    "code": "SELF_TEST_DIGEST_INVALID",
                    "location": "/contentDigest",
                    "message": "self-test digest failure",
                },
                {
                    "gate": "runtimeCatalog",
                    "code": "SELF_TEST_RUNTIME_INVALID",
                    "location": "/runtimeCatalog",
                    "message": "self-test runtime-catalog failure",
                },
            ],
            "diagnosticsTruncated": False,
        }
        validator_returncode = FULL_VALIDATOR_EXIT_BY_STATUS["invalid"]
        validate_full_validator_report(
            validator_report, target_loaded, validator_returncode
        )
        structured_validator = temp_dir / "validator-structured-report.py"
        structured_validator.write_text(
            "import pathlib, sys\n"
            "report = pathlib.Path(sys.argv[sys.argv.index('--report') + 1])\n"
            f"report.write_text({stable_json(validator_report)!r}, encoding='utf-8')\n"
            "raise SystemExit(1)\n",
            encoding="utf-8",
        )
        mapped_validator_checks = evaluate_full_validator_gates(
            target_loaded, validator_path=structured_validator
        )
        if {
            check_id: result
            for check_id, (result, _code, _message) in mapped_validator_checks.items()
        } != {
            "catalog.runtime-catalog": "fail",
            "catalog.offline-schema-catalog": "pass",
            "standalone.hard-reference-closure": "not-evaluated",
            "standalone.content-digest": "fail",
        }:
            raise ReadinessError(
                "Independent validator gate statuses were not mapped exactly"
            )
        print("PASS independent validator structured gate mapping")

        forged_validator_reports: list[tuple[str, dict[str, Any], int]] = []
        forged_identity = copy.deepcopy(validator_report)
        forged_identity["validatorId"] = "forged-validator"
        forged_validator_reports.append(
            ("validator identity", forged_identity, validator_returncode)
        )
        forged_artifact_binding = copy.deepcopy(validator_report)
        forged_artifact_binding["input"]["sha256"] = "0" * 64
        forged_validator_reports.append(
            ("artifact hash binding", forged_artifact_binding, validator_returncode)
        )
        forged_gate_set = copy.deepcopy(validator_report)
        forged_gate_set["gates"].pop("contentDigest")
        forged_validator_reports.append(
            ("incomplete gate set", forged_gate_set, validator_returncode)
        )
        forged_gate_evidence = copy.deepcopy(validator_report)
        forged_gate_evidence["gates"]["runtimeCatalog"] = {
            "status": "failed",
            "diagnosticCount": 0,
            "diagnosticCodes": [],
        }
        forged_validator_reports.append(
            ("failure without diagnostics", forged_gate_evidence, validator_returncode)
        )
        forged_exit_binding = copy.deepcopy(validator_report)
        forged_validator_reports.append(
            (
                "exit/report mismatch",
                forged_exit_binding,
                1 if validator_returncode == 0 else 0,
            )
        )
        for label, forged_report, returncode in forged_validator_reports:
            assert_full_validator_report_rejection(
                forged_report,
                target_loaded,
                returncode,
                label,
            )

        no_report_validator = temp_dir / "validator-no-report.py"
        no_report_validator.write_text("raise SystemExit(0)\n", encoding="utf-8")
        assert_full_validator_process_not_evaluated(
            target_loaded, no_report_validator, "successful exit without report"
        )
        unexpected_exit_validator = temp_dir / "validator-unexpected-exit.py"
        unexpected_exit_validator.write_text(
            "raise SystemExit(17)\n", encoding="utf-8"
        )
        assert_full_validator_process_not_evaluated(
            target_loaded, unexpected_exit_validator, "unexpected exit code"
        )
        timeout_validator = temp_dir / "validator-timeout.py"
        timeout_validator.write_text(
            "import time\ntime.sleep(30)\n", encoding="utf-8"
        )
        assert_full_validator_process_not_evaluated(
            target_loaded,
            timeout_validator,
            "bounded timeout",
            timeout_seconds=0.05,
        )

        unsafe_legacy_zip = temp_dir / "unsafe-legacy.zip"
        root = legacy_manifest()["archiveRoot"]
        build_legacy_zip(unsafe_legacy_zip, {f"{root}/../escape.txt": b"x"})
        unsafe_report = evaluate_loaded_input(
            load_zip_input(unsafe_legacy_zip, contracts.profile), contracts
        )
        if unsafe_report["decision"]["status"] != "invalid":
            raise ReadinessError("Unsafe legacy ZIP was downgraded to not-ready-legacy")
        print("PASS unsafe legacy ZIP is invalid before dialect readiness")

        reserved_zip = temp_dir / "reserved.zip"
        build_legacy_zip(reserved_zip, {f"{root}/CON.txt": b"x"})
        if evaluate_loaded_input(
            load_zip_input(reserved_zip, contracts.profile), contracts
        )["decision"]["status"] != "invalid":
            raise ReadinessError("Reserved ZIP path was accepted")
        print("PASS reserved ZIP path rejected")

        prefix_zip = temp_dir / "prefix.zip"
        build_legacy_zip(
            prefix_zip,
            {f"{root}/data/file": b"x", f"{root}/data/file/child": b"y"},
        )
        if evaluate_loaded_input(
            load_zip_input(prefix_zip, contracts.profile), contracts
        )["decision"]["status"] != "invalid":
            raise ReadinessError("ZIP prefix collision was accepted")
        print("PASS ZIP file/directory prefix collision rejected")

        nested_path_zip = temp_dir / "nested-path.zip"
        build_legacy_zip(nested_path_zip, {f"{root}/data/archive.zip": b"not a zip"})
        if evaluate_loaded_input(
            load_zip_input(nested_path_zip, contracts.profile), contracts
        )["decision"]["status"] != "invalid":
            raise ReadinessError("Nested archive path was accepted")
        print("PASS nested archive path rejected")

        nested_magic_zip = temp_dir / "nested-magic.zip"
        build_target_zip(
            nested_magic_zip, contracts, nested_magic_role="runtime-catalog"
        )
        nested_magic_report = evaluate_loaded_input(
            load_zip_input(nested_magic_zip, contracts.profile), contracts
        )
        if nested_magic_report["decision"]["status"] != "invalid":
            raise ReadinessError("Nested archive magic was accepted")
        print("PASS nested archive magic rejected")

        duplicate_checksum_zip = temp_dir / "duplicate-checksum.zip"
        build_target_zip(
            duplicate_checksum_zip,
            contracts,
            duplicate_normalized_checksum=True,
        )
        checksum_report = evaluate_loaded_input(
            load_zip_input(duplicate_checksum_zip, contracts.profile), contracts
        )
        if checksum_report["decision"]["status"] != "invalid":
            raise ReadinessError("Normalized duplicate checksum path was accepted")
        print("PASS normalized duplicate SHA256SUMS path rejected")

        ratio_zip = temp_dir / "ratio.zip"
        build_legacy_zip(ratio_zip, {f"{root}/data/zeros.bin": b"0" * (1024 * 1024)})
        if evaluate_loaded_input(
            load_zip_input(ratio_zip, contracts.profile), contracts
        )["decision"]["status"] != "invalid":
            raise ReadinessError("Compression-ratio bomb was accepted")
        print("PASS compression-ratio bomb rejected")

        tiny_limit_profile = copy.deepcopy(contracts.profile)
        tiny_limit_profile["archiveLimits"]["outerZipBytes"] = target_zip.stat().st_size - 1
        oversized = load_zip_input(target_zip, tiny_limit_profile)
        if not oversized.errors or oversized.sha256 is not None:
            raise ReadinessError("Outer ZIP size did not fail before hashing")
        oversized_manifest = load_manifest_input(
            FIXTURE_DIR / "target-contract-only.manifest.json", 1
        )
        if not oversized_manifest.errors or oversized_manifest.sha256 is not None:
            raise ReadinessError("Manifest size did not fail before full read/hash")
        print("PASS stat limits precede expensive input hashing")

        run_exit_matrix(temp_dir, unsafe_legacy_zip)

    print(
        "Curriculum package readiness self-test passed: "
        f"{len(seen_ids)} manifest fixture(s), 4 policy-tamper cases, "
        "5 readiness-report forgeries, 5 validator-report forgeries, "
        "3 validator-process failures, 3 raw JSON cases, 7 adversarial ZIPs, "
        "2 early-limit inputs, and exit matrix."
    )


def status_exit_code(status_value: str) -> int:
    if status_value == "ready":
        return EXIT_READY
    if status_value in {"not-ready-legacy", "not-ready-incomplete"}:
        return EXIT_NOT_READY
    if status_value == "unsupported":
        return EXIT_UNSUPPORTED
    if status_value == "invalid":
        return EXIT_INVALID
    raise ReadinessError(f"Unknown readiness status {status_value!r}")


def run_exit_matrix(temp_dir: Path, unsafe_legacy_zip: Path) -> None:
    script = Path(__file__).resolve()
    cases = [
        (
            "legacy-default",
            ["--manifest", str(FIXTURE_DIR / "legacy.manifest.json"), "--compact"],
            EXIT_NOT_READY,
        ),
        (
            "legacy-expected",
            [
                "--manifest",
                str(FIXTURE_DIR / "legacy.manifest.json"),
                "--expect-status",
                "not-ready-legacy",
                "--compact",
            ],
            EXIT_READY,
        ),
        (
            "expectation-mismatch",
            [
                "--manifest",
                str(FIXTURE_DIR / "legacy.manifest.json"),
                "--expect-status",
                "invalid",
                "--compact",
            ],
            EXIT_EXPECTATION_MISMATCH,
        ),
        (
            "partial-invalid",
            ["--manifest", str(FIXTURE_DIR / "partial-target.manifest.json"), "--compact"],
            EXIT_INVALID,
        ),
        (
            "target-incomplete-default",
            [
                "--manifest",
                str(FIXTURE_DIR / "target-contract-only.manifest.json"),
                "--compact",
            ],
            EXIT_NOT_READY,
        ),
        (
            "target-incomplete-expected",
            [
                "--manifest",
                str(FIXTURE_DIR / "target-contract-only.manifest.json"),
                "--expect-status",
                "not-ready-incomplete",
                "--compact",
            ],
            EXIT_READY,
        ),
        (
            "unsupported",
            ["--manifest", str(FIXTURE_DIR / "unsupported.manifest.json"), "--compact"],
            EXIT_UNSUPPORTED,
        ),
        (
            "unsafe-legacy-expectation-mismatch",
            [
                "--zip",
                str(unsafe_legacy_zip),
                "--expect-status",
                "not-ready-legacy",
                "--compact",
            ],
            EXIT_EXPECTATION_MISMATCH,
        ),
        (
            "internal-missing-input",
            ["--manifest", str(temp_dir / "missing.json"), "--compact"],
            EXIT_INTERNAL_ERROR,
        ),
        ("cli-usage", [], 2),
    ]
    for label, arguments, expected in cases:
        completed = subprocess.run(
            [sys.executable, "-B", str(script), *arguments],
            cwd=REPO_ROOT,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
        )
        if completed.returncode != expected:
            raise ReadinessError(
                f"Exit matrix {label}: {completed.returncode} != {expected}"
            )
    print(f"PASS readiness exit matrix ({len(cases)} cases)")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    inputs = parser.add_mutually_exclusive_group(required=True)
    inputs.add_argument("--manifest", type=Path, help="Evaluate a manifest JSON file")
    inputs.add_argument("--zip", dest="zip_path", type=Path, help="Evaluate a finished ZIP")
    inputs.add_argument("--self-test", action="store_true", help="Run readiness fixtures")
    parser.add_argument("--report", type=Path, help="Also write the JSON report to this path")
    parser.add_argument(
        "--expect-status",
        choices=STATUS_VOCABULARY,
        help="Return success only when the exact status is produced (for CI fixtures)",
    )
    parser.add_argument("--compact", action="store_true", help="Print compact JSON")
    args = parser.parse_args()
    if args.self_test and (args.report is not None or args.expect_status is not None or args.compact):
        parser.error("--self-test cannot be combined with report/status/output options")
    return args


def main() -> int:
    args = parse_args()
    try:
        if args.self_test:
            run_fixture_suite()
            return EXIT_READY
        kind = "manifest" if args.manifest is not None else "zip"
        path = (args.manifest or args.zip_path).resolve()
        report = evaluate_path(path, kind)
        output = stable_json(report, pretty=not args.compact)
        if args.report is not None:
            args.report.parent.mkdir(parents=True, exist_ok=True)
            args.report.write_text(output, encoding="utf-8")
        sys.stdout.write(output)
        status_value = report["decision"]["status"]
        if args.expect_status is not None:
            return (
                EXIT_READY
                if status_value == args.expect_status
                else EXIT_EXPECTATION_MISMATCH
            )
        return status_exit_code(status_value)
    except (
        OSError,
        ReadinessError,
        package_contracts.ContractDefinitionError,
        KeyError,
        TypeError,
        ValueError,
    ) as error:
        print(
            f"FAIL curriculum package readiness evaluator: {truncate_fragment(str(error), 1000)}",
            file=sys.stderr,
        )
        return EXIT_INTERNAL_ERROR
    except Exception as error:  # fail closed with the dedicated evaluator-error code
        print(
            "FAIL curriculum package readiness evaluator: unexpected internal error: "
            f"{truncate_fragment(str(error), 1000)}",
            file=sys.stderr,
        )
        return EXIT_INTERNAL_ERROR


if __name__ == "__main__":
    raise SystemExit(main())
