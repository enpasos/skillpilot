#!/usr/bin/env python3
"""Validate the versioned curriculum-package contract and its conformance fixtures."""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import re
import sys
import unicodedata
from collections import Counter
from dataclasses import dataclass
from importlib.metadata import PackageNotFoundError, version as distribution_version
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONTRACT_DIR = REPO_ROOT / "contracts" / "curriculum-package" / "v1"
SCHEMA_FILENAME = "package-manifest.schema.json"
PROFILE_RELATIVE_PATH = Path("profiles/full-standalone-v1.profile.json")
MANIFEST_SCHEMA_ID = "https://skillpilot.com/schemas/curriculum-package/v1/package-manifest.schema.json"
PROFILE_ID = "full-standalone-v1"
JSONSCHEMA_VERSION = "4.26.0"

SAFE_PATH_RE = re.compile(r"^[A-Za-z0-9._-]+(?:/[A-Za-z0-9._-]+)*$")
WINDOWS_RESERVED_NAMES = {
    "con",
    "prn",
    "aux",
    "nul",
    *(f"com{index}" for index in range(1, 10)),
    *(f"lpt{index}" for index in range(1, 10)),
}
ARCHIVE_MEDIA_TYPES = {
    "application/gzip",
    "application/vnd.rar",
    "application/x-7z-compressed",
    "application/x-bzip2",
    "application/x-rar-compressed",
    "application/x-tar",
    "application/zip",
}
ARCHIVE_SUFFIXES = (
    ".7z",
    ".bz2",
    ".gz",
    ".rar",
    ".tar",
    ".tar.bz2",
    ".tar.gz",
    ".tgz",
    ".zip",
)
SOFTWARE_VERSION_RANGE_RE = re.compile(
    r"^>=(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*) "
    r"<(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$"
)
LICENSE_TOKEN_RE = re.compile(r"\(|\)|[A-Za-z0-9][A-Za-z0-9.+-]*")


class ContractDefinitionError(RuntimeError):
    """Raised when the trusted contract files themselves are inconsistent."""


class DuplicateJsonKeyError(ValueError):
    """Raised before validation when a JSON object contains an ambiguous key."""

    def __init__(self, key: str) -> None:
        super().__init__(f"duplicate JSON object key {key!r}")
        self.key = key


@dataclass(frozen=True, order=True)
class Diagnostic:
    code: str
    location: str
    message: str


def reject_duplicate_json_keys(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise DuplicateJsonKeyError(key)
        result[key] = value
    return result


def parse_json_text(text: str) -> Any:
    return json.loads(text, object_pairs_hook=reject_duplicate_json_keys)


def load_json(path: Path, *, max_bytes: int | None = None) -> Any:
    try:
        if max_bytes is not None and path.stat().st_size > max_bytes:
            raise ContractDefinitionError(
                f"JSON document {path} exceeds the {max_bytes}-byte manifest limit"
            )
        return parse_json_text(path.read_text(encoding="utf-8"))
    except ContractDefinitionError:
        raise
    except (OSError, UnicodeError, json.JSONDecodeError, DuplicateJsonKeyError) as error:
        raise ContractDefinitionError(f"Cannot read JSON from {path}: {error}") from error


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def expect_object(value: Any, location: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ContractDefinitionError(f"{location} must be an object")
    return value


def expect_exact_keys(value: dict[str, Any], expected: set[str], location: str) -> None:
    actual = set(value)
    if actual != expected:
        missing = sorted(expected - actual)
        unknown = sorted(actual - expected)
        raise ContractDefinitionError(
            f"{location} fields differ; missing={missing or '-'}, unknown={unknown or '-'}"
        )


def validate_trusted_contract(
    schema: dict[str, Any],
    profile: dict[str, Any],
    schema_path: Path,
    profile_path: Path,
) -> dict[str, dict[str, Any]]:
    Draft202012Validator.check_schema(schema)
    if schema.get("$id") != MANIFEST_SCHEMA_ID:
        raise ContractDefinitionError(f"Unexpected manifest schema $id: {schema.get('$id')!r}")

    expect_exact_keys(
        profile,
        {
            "profileFormatVersion",
            "profileId",
            "description",
            "manifestSchema",
            "compatibility",
            "inventoryPolicy",
            "archiveLimits",
            "manifestLimits",
            "redistributionPolicy",
            "licensePolicy",
            "roles",
        },
        "profile",
    )
    if profile.get("profileFormatVersion") != 1 or profile.get("profileId") != PROFILE_ID:
        raise ContractDefinitionError("Profile identity must be full-standalone-v1 with format version 1")

    manifest_schema = expect_object(profile.get("manifestSchema"), "profile.manifestSchema")
    expect_exact_keys(manifest_schema, {"id", "sha256"}, "profile.manifestSchema")
    schema_hash = file_sha256(schema_path)
    if manifest_schema != {"id": MANIFEST_SCHEMA_ID, "sha256": schema_hash}:
        raise ContractDefinitionError(
            "Profile manifestSchema binding does not match the trusted repository schema"
        )

    compatibility = expect_object(profile.get("compatibility"), "profile.compatibility")
    expect_exact_keys(
        compatibility,
        {"packageFormatVersion", "runtimeContractVersion", "variant"},
        "profile.compatibility",
    )
    if compatibility != {
        "packageFormatVersion": "1.0",
        "runtimeContractVersion": "1.0",
        "variant": "json",
    }:
        raise ContractDefinitionError("Unexpected full-standalone-v1 compatibility declaration")

    inventory_policy = expect_object(profile.get("inventoryPolicy"), "profile.inventoryPolicy")
    expect_exact_keys(
        inventory_policy,
        {"pathBase", "allowUnknownRoles", "excludedPaths"},
        "profile.inventoryPolicy",
    )
    if inventory_policy.get("pathBase") != "archive-root-relative":
        raise ContractDefinitionError("Profile paths must be archive-root-relative")
    if inventory_policy.get("allowUnknownRoles") is not False:
        raise ContractDefinitionError("full-standalone-v1 must reject unknown roles")
    excluded_paths = inventory_policy.get("excludedPaths")
    if not isinstance(excluded_paths, list) or not all(isinstance(path, str) for path in excluded_paths):
        raise ContractDefinitionError("profile.inventoryPolicy.excludedPaths must be a string array")
    if set(excluded_paths) != {"metadata/manifest.json", "metadata/SHA256SUMS"}:
        raise ContractDefinitionError("Unexpected manifest inventory exclusions")

    expected_limits = {
        "outerZipBytes": 3_500_000_000,
        "entryCount": 60_000,
        "genericEntryBytes": 1_000_000_000,
        "goalVisualizationBytes": 64 * 1024 * 1024,
        "imageLaneBytes": 3_000_000_000,
        "totalUncompressedBytes": 8_000_000_000,
        "archivePathBytes": 240,
        "maxEntryCompressionRatio": 100,
        "maxTotalCompressionRatio": 25,
        "nestedArchivesAllowed": False,
    }
    archive_limits = expect_object(profile.get("archiveLimits"), "profile.archiveLimits")
    expect_exact_keys(archive_limits, set(expected_limits), "profile.archiveLimits")
    if archive_limits != expected_limits:
        raise ContractDefinitionError("Package-format v1 archive limits differ from the approved limits")

    expected_manifest_limits = {
        "manifestBytes": 64 * 1024 * 1024,
        "fileRecords": 59_998,
        "licenseDocuments": 1_024,
    }
    manifest_limits = expect_object(profile.get("manifestLimits"), "profile.manifestLimits")
    expect_exact_keys(manifest_limits, set(expected_manifest_limits), "profile.manifestLimits")
    if manifest_limits != expected_manifest_limits:
        raise ContractDefinitionError("Package-format v1 manifest limits differ from the approved limits")
    try:
        schema_file_limit = schema["properties"]["files"]["maxItems"]
        schema_license_limit = schema["properties"]["licenseDocuments"]["maxItems"]
    except (KeyError, TypeError) as error:
        raise ContractDefinitionError("Manifest schema does not expose the profile array limits") from error
    if (
        schema_file_limit != manifest_limits["fileRecords"]
        or schema_license_limit != manifest_limits["licenseDocuments"]
    ):
        raise ContractDefinitionError("Manifest schema and release-profile array limits differ")

    redistribution_policy = expect_object(
        profile.get("redistributionPolicy"), "profile.redistributionPolicy"
    )
    if redistribution_policy != {"allFilesMustBeAllowed": True}:
        raise ContractDefinitionError("full-standalone-v1 must clear every distributed file")

    license_policy = expect_object(profile.get("licensePolicy"), "profile.licensePolicy")
    if license_policy != {
        "requireDocumentForEveryIdentifier": True,
        "disallowedIdentifiers": ["NONE", "NOASSERTION"],
    }:
        raise ContractDefinitionError("Unexpected full-standalone-v1 license policy")

    raw_roles = profile.get("roles")
    if not isinstance(raw_roles, list) or not raw_roles:
        raise ContractDefinitionError("profile.roles must be a non-empty array")
    roles: dict[str, dict[str, Any]] = {}
    for index, raw_rule in enumerate(raw_roles):
        rule = expect_object(raw_rule, f"profile.roles[{index}]")
        allowed_keys = {"role", "minimum", "maximum", "runtimeRequired", "mediaTypes"}
        unknown_keys = set(rule) - allowed_keys
        missing_keys = {"role", "minimum", "runtimeRequired", "mediaTypes"} - set(rule)
        if unknown_keys or missing_keys:
            raise ContractDefinitionError(
                f"profile.roles[{index}] malformed; missing={sorted(missing_keys)}, "
                f"unknown={sorted(unknown_keys)}"
            )
        role = rule.get("role")
        minimum = rule.get("minimum")
        maximum = rule.get("maximum")
        runtime_required = rule.get("runtimeRequired")
        media_types = rule.get("mediaTypes")
        if not isinstance(role, str) or not role:
            raise ContractDefinitionError(f"profile.roles[{index}].role must be a string")
        if role in roles:
            raise ContractDefinitionError(f"Duplicate profile role: {role}")
        if not isinstance(minimum, int) or isinstance(minimum, bool) or minimum < 0:
            raise ContractDefinitionError(f"Invalid minimum for profile role {role}")
        if maximum is not None and (
            not isinstance(maximum, int)
            or isinstance(maximum, bool)
            or maximum < minimum
        ):
            raise ContractDefinitionError(f"Invalid maximum for profile role {role}")
        if runtime_required not in {"required", "forbidden", "either"}:
            raise ContractDefinitionError(f"Invalid runtimeRequired policy for profile role {role}")
        if not isinstance(media_types, list) or not media_types or not all(
            isinstance(media_type, str) and media_type for media_type in media_types
        ):
            raise ContractDefinitionError(f"Invalid mediaTypes for profile role {role}")
        roles[role] = rule

    release_profile_rule = roles.get("release-profile")
    if release_profile_rule is None or (
        release_profile_rule.get("minimum") != 1
        or release_profile_rule.get("maximum") != 1
        or release_profile_rule.get("runtimeRequired") != "required"
    ):
        raise ContractDefinitionError("The release-profile role must be required exactly once")

    return roles


def portable_path_key(path: str) -> str:
    return unicodedata.normalize("NFC", path).casefold()


def path_is_safe(path: str) -> bool:
    if not path or path.startswith("/") or "\\" in path or not SAFE_PATH_RE.fullmatch(path):
        return False
    for segment in path.split("/"):
        if segment in {"", ".", ".."} or segment.endswith((".", " ")):
            return False
        stem = segment.split(".", 1)[0].casefold()
        if stem in WINDOWS_RESERVED_NAMES:
            return False
    return True


def parse_license_expression(expression: str) -> set[str]:
    tokens: list[str] = []
    position = 0
    while position < len(expression):
        if expression[position].isspace():
            position += 1
            continue
        match = LICENSE_TOKEN_RE.match(expression, position)
        if match is None:
            raise ValueError(f"unsupported token at offset {position}")
        tokens.append(match.group(0))
        position = match.end()
    if not tokens:
        raise ValueError("empty expression")

    referenced_ids: set[str] = set()
    cursor = 0

    def parse_factor() -> None:
        nonlocal cursor
        if cursor >= len(tokens):
            raise ValueError("expected license identifier")
        if tokens[cursor] == "(":
            cursor += 1
            parse_or_expression()
            if cursor >= len(tokens) or tokens[cursor] != ")":
                raise ValueError("unclosed parenthesis")
            cursor += 1
            return
        token = tokens[cursor]
        if token in {"AND", "OR", "WITH", ")"}:
            raise ValueError(f"expected license identifier, found {token!r}")
        referenced_ids.add(token)
        cursor += 1
        if cursor < len(tokens) and tokens[cursor] == "WITH":
            cursor += 1
            if cursor >= len(tokens) or tokens[cursor] in {"AND", "OR", "WITH", "(", ")"}:
                raise ValueError("WITH must be followed by an exception identifier")
            referenced_ids.add(tokens[cursor])
            cursor += 1

    def parse_and_expression() -> None:
        nonlocal cursor
        parse_factor()
        while cursor < len(tokens) and tokens[cursor] == "AND":
            cursor += 1
            parse_factor()

    def parse_or_expression() -> None:
        nonlocal cursor
        parse_and_expression()
        while cursor < len(tokens) and tokens[cursor] == "OR":
            cursor += 1
            parse_and_expression()

    parse_or_expression()
    if cursor != len(tokens):
        raise ValueError(f"unexpected token {tokens[cursor]!r}")
    return referenced_ids


def schema_location(error: Any) -> str:
    return "/" + "/".join(str(part) for part in error.absolute_path)


def validate_contract_binding(
    binding_name: str,
    expected_id: str,
    expected_hash: str,
    expected_bytes: int,
    expected_role: str,
    manifest: dict[str, Any],
    files_by_path: dict[str, list[dict[str, Any]]],
) -> list[Diagnostic]:
    diagnostics: list[Diagnostic] = []
    bindings = manifest.get("contractBindings")
    if not isinstance(bindings, dict):
        return diagnostics
    binding = bindings.get(binding_name)
    if not isinstance(binding, dict):
        return diagnostics
    location = f"/contractBindings/{binding_name}"
    if binding.get("id") != expected_id:
        diagnostics.append(
            Diagnostic(
                "CONTRACT_BINDING_ID_MISMATCH",
                f"{location}/id",
                f"Expected trusted contract ID {expected_id!r}",
            )
        )
    if binding.get("sha256") != expected_hash:
        diagnostics.append(
            Diagnostic(
                "CONTRACT_BINDING_TRUSTED_HASH_MISMATCH",
                f"{location}/sha256",
                "Declared contract hash differs from the trusted repository file",
            )
        )
    binding_path = binding.get("path")
    matching_files = files_by_path.get(binding_path, []) if isinstance(binding_path, str) else []
    if len(matching_files) != 1:
        diagnostics.append(
            Diagnostic(
                "CONTRACT_BINDING_FILE_MISSING",
                f"{location}/path",
                f"Binding path must resolve to exactly one file record, found {len(matching_files)}",
            )
        )
        return diagnostics
    record = matching_files[0]
    if record.get("sha256") != binding.get("sha256"):
        diagnostics.append(
            Diagnostic(
                "CONTRACT_BINDING_FILE_HASH_MISMATCH",
                f"{location}/sha256",
                "Binding hash differs from the bound file record",
            )
        )
    if record.get("bytes") != expected_bytes:
        diagnostics.append(
            Diagnostic(
                "CONTRACT_BINDING_FILE_SIZE_MISMATCH",
                f"{location}/path",
                f"Bound file record must declare {expected_bytes} bytes",
            )
        )
    if record.get("role") != expected_role:
        diagnostics.append(
            Diagnostic(
                "CONTRACT_BINDING_FILE_ROLE_MISMATCH",
                f"{location}/path",
                f"Bound file must use role {expected_role!r}",
            )
        )
    return diagnostics


def validate_manifest(
    manifest: Any,
    schema_validator: Draft202012Validator,
    profile: dict[str, Any],
    roles: dict[str, dict[str, Any]],
    schema_hash: str,
    profile_hash: str,
    schema_bytes: int,
    profile_bytes: int,
) -> list[Diagnostic]:
    diagnostics: list[Diagnostic] = []
    if isinstance(manifest, dict):
        manifest_limits = profile["manifestLimits"]
        raw_files = manifest.get("files")
        if isinstance(raw_files, list) and len(raw_files) > manifest_limits["fileRecords"]:
            diagnostics.append(
                Diagnostic(
                    "MANIFEST_FILE_COUNT_LIMIT",
                    "/files",
                    f"Manifest contains more than {manifest_limits['fileRecords']} file records",
                )
            )
        raw_license_documents = manifest.get("licenseDocuments")
        if (
            isinstance(raw_license_documents, list)
            and len(raw_license_documents) > manifest_limits["licenseDocuments"]
        ):
            diagnostics.append(
                Diagnostic(
                    "MANIFEST_LICENSE_DOCUMENT_COUNT_LIMIT",
                    "/licenseDocuments",
                    "Manifest contains more than "
                    f"{manifest_limits['licenseDocuments']} license documents",
                )
            )
        if diagnostics:
            return sorted(diagnostics)

    for error in sorted(
        schema_validator.iter_errors(manifest),
        key=lambda item: tuple(str(part) for part in item.absolute_path),
    ):
        diagnostics.append(Diagnostic("MANIFEST_SCHEMA", schema_location(error), error.message))
    if not isinstance(manifest, dict):
        return sorted(diagnostics)

    package_id = manifest.get("packageId")
    package_version = manifest.get("packageVersion")
    if isinstance(package_id, str) and isinstance(package_version, str):
        expected_release_id = f"{package_id}@{package_version}"
        if manifest.get("releaseId") != expected_release_id:
            diagnostics.append(
                Diagnostic(
                    "RELEASE_ID_MISMATCH",
                    "/releaseId",
                    f"Expected {expected_release_id!r}",
                )
            )

    software_range = manifest.get("supportedSkillpilotSoftware")
    if isinstance(software_range, str):
        range_match = SOFTWARE_VERSION_RANGE_RE.fullmatch(software_range)
        if range_match is not None:
            values = tuple(int(value) for value in range_match.groups())
            if values[:3] >= values[3:]:
                diagnostics.append(
                    Diagnostic(
                        "SOFTWARE_RANGE_INVALID",
                        "/supportedSkillpilotSoftware",
                        "The inclusive lower bound must be smaller than the exclusive upper bound",
                    )
                )

    compatibility = profile["compatibility"]
    manifest_profile_values = {
        "packageFormatVersion": manifest.get("packageFormatVersion"),
        "runtimeContractVersion": manifest.get("runtimeContractVersion"),
        "variant": manifest.get("variant"),
        "releaseProfile": manifest.get("releaseProfile"),
    }
    expected_profile_values = {
        **compatibility,
        "releaseProfile": profile["profileId"],
    }
    for field, expected in expected_profile_values.items():
        if manifest_profile_values.get(field) != expected:
            diagnostics.append(
                Diagnostic(
                    "PROFILE_MISMATCH",
                    f"/{field}",
                    f"Expected profile value {expected!r}",
                )
            )

    raw_files = manifest.get("files")
    files = [record for record in raw_files if isinstance(record, dict)] if isinstance(raw_files, list) else []
    files_by_path: dict[str, list[dict[str, Any]]] = {}
    for record in files:
        path = record.get("path")
        if isinstance(path, str):
            files_by_path.setdefault(path, []).append(record)
    paths = [record.get("path") for record in files if isinstance(record.get("path"), str)]
    limits = profile["archiveLimits"]
    archive_root = manifest.get("archiveRoot")
    archive_root_safe = isinstance(archive_root, str) and "/" not in archive_root and path_is_safe(archive_root)
    if isinstance(archive_root, str) and not archive_root_safe:
        diagnostics.append(
            Diagnostic(
                "ARCHIVE_ROOT_UNSAFE",
                "/archiveRoot",
                f"Unsafe or non-portable archive root {archive_root!r}",
            )
        )
    for index, record in enumerate(files):
        path = record.get("path")
        if isinstance(path, str):
            if not path_is_safe(path):
                diagnostics.append(
                    Diagnostic("FILE_PATH_UNSAFE", f"/files/{index}/path", f"Unsafe package path {path!r}")
                )
            if isinstance(archive_root, str) and (
                path == archive_root or path.startswith(f"{archive_root}/")
            ):
                diagnostics.append(
                    Diagnostic(
                        "FILE_PATH_ARCHIVE_ROOT_PREFIX",
                        f"/files/{index}/path",
                        "File paths must not repeat the archive root",
                    )
                )
            if archive_root_safe and len(f"{archive_root}/{path}".encode("utf-8")) > limits["archivePathBytes"]:
                diagnostics.append(
                    Diagnostic(
                        "ARCHIVE_PATH_LIMIT",
                        f"/files/{index}/path",
                        f"Full archive path exceeds {limits['archivePathBytes']} UTF-8 bytes",
                    )
                )

    duplicate_paths = sorted(path for path, count in Counter(paths).items() if count > 1)
    for path in duplicate_paths:
        diagnostics.append(
            Diagnostic("FILE_PATH_DUPLICATE", "/files", f"Duplicate manifest path {path!r}")
        )
    excluded_paths = set(profile["inventoryPolicy"]["excludedPaths"])
    portable_paths: dict[str, set[str]] = {}
    for path in [*paths, *sorted(excluded_paths)]:
        portable_paths.setdefault(portable_path_key(path), set()).add(path)
    for colliding_paths in portable_paths.values():
        if len(colliding_paths) > 1:
            diagnostics.append(
                Diagnostic(
                    "FILE_PATH_PORTABLE_COLLISION",
                    "/files",
                    f"Portable path collision: {sorted(colliding_paths)}",
                )
            )

    prefix_collisions: set[tuple[str, str]] = set()
    for child_key, child_paths in portable_paths.items():
        segments = child_key.split("/")
        for length in range(1, len(segments)):
            parent_key = "/".join(segments[:length])
            for parent_path in portable_paths.get(parent_key, set()):
                for child_path in child_paths:
                    prefix_collisions.add((parent_path, child_path))
    for parent_path, child_path in sorted(prefix_collisions):
        diagnostics.append(
            Diagnostic(
                "FILE_PATH_PREFIX_COLLISION",
                "/files",
                f"File path {parent_path!r} is an ancestor of {child_path!r}",
            )
        )

    for index, record in enumerate(files):
        if record.get("path") in excluded_paths:
            diagnostics.append(
                Diagnostic(
                    "INVENTORY_EXCLUDED_PATH",
                    f"/files/{index}/path",
                    "This file is intentionally outside the manifest's self-inventory",
                )
            )

    role_counts = Counter(record.get("role") for record in files if isinstance(record.get("role"), str))
    for role, count in sorted(role_counts.items()):
        if role not in roles:
            diagnostics.append(
                Diagnostic("PROFILE_UNKNOWN_ROLE", "/files", f"Unknown artifact role {role!r}")
            )
    for role, rule in sorted(roles.items()):
        count = role_counts.get(role, 0)
        minimum = rule["minimum"]
        maximum = rule.get("maximum")
        if count < minimum or (maximum is not None and count > maximum):
            expected = f"{minimum}..{maximum if maximum is not None else '*'}"
            diagnostics.append(
                Diagnostic(
                    "PROFILE_ROLE_CARDINALITY",
                    "/files",
                    f"Role {role!r} occurs {count} time(s), expected {expected}",
                )
            )

    for index, record in enumerate(files):
        role = record.get("role")
        rule = roles.get(role) if isinstance(role, str) else None
        if rule is None:
            continue
        runtime_policy = rule["runtimeRequired"]
        runtime_required = record.get("runtimeRequired")
        if (
            (runtime_policy == "required" and runtime_required is not True)
            or (runtime_policy == "forbidden" and runtime_required is not False)
        ):
            diagnostics.append(
                Diagnostic(
                    "PROFILE_RUNTIME_REQUIRED",
                    f"/files/{index}/runtimeRequired",
                    f"Role {role!r} requires policy {runtime_policy!r}",
                )
            )
        if record.get("mediaType") not in rule["mediaTypes"]:
            diagnostics.append(
                Diagnostic(
                    "PROFILE_MEDIA_TYPE",
                    f"/files/{index}/mediaType",
                    f"Role {role!r} allows {rule['mediaTypes']}",
                )
            )
        if (
            profile["redistributionPolicy"]["allFilesMustBeAllowed"]
            and record.get("redistributionStatus") != "allowed"
        ):
            diagnostics.append(
                Diagnostic(
                    "REDISTRIBUTION_NOT_ALLOWED",
                    f"/files/{index}/redistributionStatus",
                    "Every distributed file must have redistributionStatus 'allowed'",
                )
            )

    license_documents_value = manifest.get("licenseDocuments")
    license_documents = (
        [entry for entry in license_documents_value if isinstance(entry, dict)]
        if isinstance(license_documents_value, list)
        else []
    )
    license_ids: dict[str, str] = {}
    license_paths: dict[str, str] = {}
    for index, entry in enumerate(license_documents):
        license_id = entry.get("licenseId")
        license_path = entry.get("path")
        if isinstance(license_id, str) and isinstance(license_path, str):
            if license_id in license_ids:
                diagnostics.append(
                    Diagnostic(
                        "LICENSE_DOCUMENT_DUPLICATE_ID",
                        f"/licenseDocuments/{index}/licenseId",
                        f"License ID {license_id!r} is already mapped",
                    )
                )
            else:
                license_ids[license_id] = license_path
            if license_path in license_paths:
                diagnostics.append(
                    Diagnostic(
                        "LICENSE_DOCUMENT_DUPLICATE_PATH",
                        f"/licenseDocuments/{index}/path",
                        f"License document path {license_path!r} is already mapped",
                    )
                )
            else:
                license_paths[license_path] = license_id
            matching_files = files_by_path.get(license_path, [])
            if len(matching_files) != 1:
                diagnostics.append(
                    Diagnostic(
                        "LICENSE_DOCUMENT_FILE_MISSING",
                        f"/licenseDocuments/{index}/path",
                        f"License document must resolve to exactly one file record, found {len(matching_files)}",
                    )
                )
            elif matching_files[0].get("role") != "license":
                diagnostics.append(
                    Diagnostic(
                        "LICENSE_DOCUMENT_FILE_ROLE_MISMATCH",
                        f"/licenseDocuments/{index}/path",
                        "License document path must use the 'license' artifact role",
                    )
                )

    documented_license_paths = set(license_paths)
    for index, record in enumerate(files):
        if record.get("role") == "license" and record.get("path") not in documented_license_paths:
            diagnostics.append(
                Diagnostic(
                    "LICENSE_DOCUMENT_ORPHAN",
                    f"/files/{index}/path",
                    "Every license artifact must be referenced by licenseDocuments",
                )
            )
        expression = record.get("licenseExpression")
        if not isinstance(expression, str):
            continue
        try:
            referenced_license_ids = parse_license_expression(expression)
        except ValueError as error:
            diagnostics.append(
                Diagnostic(
                    "LICENSE_EXPRESSION_INVALID",
                    f"/files/{index}/licenseExpression",
                    str(error),
                )
            )
            continue
        disallowed_ids = set(profile["licensePolicy"]["disallowedIdentifiers"])
        for license_id in sorted(referenced_license_ids):
            if license_id in disallowed_ids:
                diagnostics.append(
                    Diagnostic(
                        "LICENSE_IDENTIFIER_DISALLOWED",
                        f"/files/{index}/licenseExpression",
                        f"License identifier {license_id!r} is not releaseable",
                    )
                )
            elif (
                profile["licensePolicy"]["requireDocumentForEveryIdentifier"]
                and license_id not in license_ids
            ):
                diagnostics.append(
                    Diagnostic(
                        "LICENSE_DOCUMENT_MISSING",
                        f"/files/{index}/licenseExpression",
                        f"No license document is mapped for {license_id!r}",
                    )
                )

    declared_entry_floor = len(files) + len(excluded_paths)
    if declared_entry_floor > limits["entryCount"]:
        diagnostics.append(
            Diagnostic(
                "ARCHIVE_ENTRY_COUNT_LIMIT",
                "/files",
                f"At least {declared_entry_floor} archive entries exceed the v1 limit",
            )
        )
    declared_total_bytes = 0
    declared_image_bytes = 0
    for index, record in enumerate(files):
        size = record.get("bytes")
        if isinstance(size, int) and not isinstance(size, bool) and size >= 0:
            declared_total_bytes += size
            if size > limits["genericEntryBytes"]:
                diagnostics.append(
                    Diagnostic(
                        "ARCHIVE_GENERIC_ENTRY_LIMIT",
                        f"/files/{index}/bytes",
                        f"Entry exceeds {limits['genericEntryBytes']} bytes",
                    )
                )
            if record.get("role") == "binary-asset":
                declared_image_bytes += size
                if size > limits["goalVisualizationBytes"]:
                    diagnostics.append(
                        Diagnostic(
                            "ARCHIVE_VISUALIZATION_LIMIT",
                            f"/files/{index}/bytes",
                            f"Image exceeds {limits['goalVisualizationBytes']} bytes",
                        )
                    )
        path = record.get("path")
        media_type = record.get("mediaType")
        if limits["nestedArchivesAllowed"] is False and (
            media_type in ARCHIVE_MEDIA_TYPES
            or (isinstance(path, str) and path.casefold().endswith(ARCHIVE_SUFFIXES))
        ):
            diagnostics.append(
                Diagnostic(
                    "ARCHIVE_NESTED_FORBIDDEN",
                    f"/files/{index}",
                    "Nested archive artifacts are prohibited by package-format v1",
                )
            )
    if declared_image_bytes > limits["imageLaneBytes"]:
        diagnostics.append(
            Diagnostic(
                "ARCHIVE_IMAGE_LANE_LIMIT",
                "/files",
                f"Declared image lane exceeds {limits['imageLaneBytes']} bytes",
            )
        )
    if declared_total_bytes > limits["totalUncompressedBytes"]:
        diagnostics.append(
            Diagnostic(
                "ARCHIVE_TOTAL_UNCOMPRESSED_LIMIT",
                "/files",
                f"Declared inventory exceeds {limits['totalUncompressedBytes']} uncompressed bytes",
            )
        )

    diagnostics.extend(
        validate_contract_binding(
            "manifestSchema",
            MANIFEST_SCHEMA_ID,
            schema_hash,
            schema_bytes,
            "schema",
            manifest,
            files_by_path,
        )
    )
    diagnostics.extend(
        validate_contract_binding(
            "releaseProfile",
            PROFILE_ID,
            profile_hash,
            profile_bytes,
            "release-profile",
            manifest,
            files_by_path,
        )
    )
    return sorted(diagnostics)


def decode_json_pointer_token(token: str) -> str:
    return token.replace("~1", "/").replace("~0", "~")


def pointer_parent(document: Any, pointer: str) -> tuple[Any, str]:
    if not pointer.startswith("/"):
        raise ContractDefinitionError(f"Fixture JSON pointer must start with '/': {pointer!r}")
    tokens = [decode_json_pointer_token(token) for token in pointer[1:].split("/")]
    if not tokens or tokens == [""]:
        raise ContractDefinitionError("Fixture mutation cannot replace the document root")
    current = document
    for token in tokens[:-1]:
        if isinstance(current, list):
            current = current[int(token)]
        elif isinstance(current, dict):
            current = current[token]
        else:
            raise ContractDefinitionError(f"Fixture pointer cannot traverse {token!r}")
    return current, tokens[-1]


def file_by_role(manifest: dict[str, Any], role: str) -> dict[str, Any]:
    files = manifest.get("files")
    if not isinstance(files, list):
        raise ContractDefinitionError("Fixture base manifest has no files array")
    matches = [record for record in files if isinstance(record, dict) and record.get("role") == role]
    if not matches:
        raise ContractDefinitionError(f"Fixture mutation cannot find file role {role!r}")
    return matches[0]


def apply_mutation(manifest: dict[str, Any], mutation: Any) -> None:
    data = expect_object(mutation, "fixture mutation")
    operation = data.get("operation")
    if operation in {"remove-pointer", "set-pointer"}:
        pointer = data.get("pointer")
        if not isinstance(pointer, str):
            raise ContractDefinitionError(f"{operation} requires a string pointer")
        parent, token = pointer_parent(manifest, pointer)
        if operation == "remove-pointer":
            if isinstance(parent, list):
                del parent[int(token)]
            else:
                del parent[token]
        elif isinstance(parent, list):
            parent[int(token)] = copy.deepcopy(data.get("value"))
        else:
            parent[token] = copy.deepcopy(data.get("value"))
        return
    if operation == "remove-files-by-role":
        role = data.get("role")
        manifest["files"] = [record for record in manifest["files"] if record.get("role") != role]
        return
    if operation == "set-file-field":
        role = data.get("role")
        field = data.get("field")
        if not isinstance(role, str) or not isinstance(field, str):
            raise ContractDefinitionError("set-file-field requires string role and field")
        file_by_role(manifest, role)[field] = copy.deepcopy(data.get("value"))
        return
    if operation == "copy-file-field":
        from_role = data.get("fromRole")
        to_role = data.get("toRole")
        field = data.get("field")
        if not all(isinstance(value, str) for value in (from_role, to_role, field)):
            raise ContractDefinitionError("copy-file-field requires fromRole, toRole, and field")
        source = file_by_role(manifest, from_role)
        file_by_role(manifest, to_role)[field] = copy.deepcopy(source[field])
        return
    if operation == "append-file":
        manifest["files"].append(copy.deepcopy(expect_object(data.get("file"), "append-file.file")))
        return
    if operation == "append-numbered-files":
        count = data.get("count")
        path_prefix = data.get("pathPrefix")
        path_suffix = data.get("pathSuffix")
        template = expect_object(data.get("file"), "append-numbered-files.file")
        if (
            not isinstance(count, int)
            or isinstance(count, bool)
            or count < 1
            or count > 60000
            or not isinstance(path_prefix, str)
            or not isinstance(path_suffix, str)
        ):
            raise ContractDefinitionError(
                "append-numbered-files requires count 1..60000 and string pathPrefix/pathSuffix"
            )
        for index in range(count):
            record = copy.deepcopy(template)
            record["path"] = f"{path_prefix}{index:04d}{path_suffix}"
            manifest["files"].append(record)
        return
    if operation == "append-numbered-license-documents":
        count = data.get("count")
        id_prefix = data.get("idPrefix")
        path_prefix = data.get("pathPrefix")
        if (
            not isinstance(count, int)
            or isinstance(count, bool)
            or count < 1
            or count > 1025
            or not isinstance(id_prefix, str)
            or not isinstance(path_prefix, str)
        ):
            raise ContractDefinitionError(
                "append-numbered-license-documents requires count 1..1025 and string prefixes"
            )
        for index in range(count):
            manifest["licenseDocuments"].append(
                {
                    "licenseId": f"{id_prefix}{index:04d}",
                    "path": f"{path_prefix}{index:04d}.txt",
                }
            )
        return
    raise ContractDefinitionError(f"Unknown fixture mutation operation: {operation!r}")


def validate_raw_json_fixture_suite(contract_dir: Path, verbose: bool) -> tuple[int, list[str]]:
    raw_dir = contract_dir / "fixtures" / "invalid" / "raw"
    expectations_path = raw_dir / "expectations.json"
    expectations = expect_object(load_json(expectations_path), str(expectations_path))
    expect_exact_keys(expectations, {"fixtureFormatVersion", "cases"}, str(expectations_path))
    if expectations.get("fixtureFormatVersion") != 1:
        raise ContractDefinitionError(f"Unsupported raw fixture format in {expectations_path}")
    cases = expectations.get("cases")
    if not isinstance(cases, list) or not cases:
        raise ContractDefinitionError(f"Raw fixture suite {expectations_path} must contain cases")

    failures: list[str] = []
    passed = 0
    referenced_paths: set[Path] = set()
    seen_ids: set[str] = set()
    for index, raw_case in enumerate(cases):
        case = expect_object(raw_case, f"{expectations_path}.cases[{index}]")
        expect_exact_keys(
            case,
            {"id", "path", "expectedErrorCode", "expectedDuplicateKey"},
            f"{expectations_path}.cases[{index}]",
        )
        case_id = case.get("id")
        relative_path = case.get("path")
        expected_code = case.get("expectedErrorCode")
        expected_key = case.get("expectedDuplicateKey")
        if (
            not isinstance(case_id, str)
            or not case_id
            or case_id in seen_ids
            or not isinstance(relative_path, str)
            or not path_is_safe(relative_path)
            or "/" in relative_path
            or expected_code != "JSON_DUPLICATE_KEY"
            or not isinstance(expected_key, str)
            or not expected_key
        ):
            raise ContractDefinitionError(f"Malformed or duplicate raw fixture case at index {index}")
        seen_ids.add(case_id)
        fixture_path = (raw_dir / relative_path).resolve()
        if fixture_path.parent != raw_dir.resolve():
            raise ContractDefinitionError(f"Raw fixture escapes its directory: {relative_path!r}")
        referenced_paths.add(fixture_path)
        try:
            parse_json_text(fixture_path.read_text(encoding="utf-8"))
        except DuplicateJsonKeyError as error:
            actual_code = "JSON_DUPLICATE_KEY"
            actual_key = error.key
        except (OSError, UnicodeError, json.JSONDecodeError) as error:
            failures.append(f"Raw invalid fixture {case_id!r} failed unexpectedly: {error}")
            continue
        else:
            failures.append(f"Raw invalid fixture {case_id!r} unexpectedly parsed successfully")
            continue
        if actual_code != expected_code or actual_key != expected_key:
            failures.append(
                f"Raw invalid fixture {case_id!r} expected {expected_code} for {expected_key!r}, "
                f"got {actual_code} for {actual_key!r}"
            )
        else:
            passed += 1
            if verbose:
                print(f"PASS invalid {case_id}: {actual_code} ({actual_key})")

    actual_paths = {path.resolve() for path in raw_dir.glob("*.manifest.json")}
    if actual_paths != referenced_paths:
        failures.append(
            "Raw fixture inventory differs from expectations: "
            f"unreferenced={sorted(str(path.name) for path in actual_paths - referenced_paths)}, "
            f"missing={sorted(str(path.name) for path in referenced_paths - actual_paths)}"
        )
    return passed, failures


def validate_fixture_suite(
    contract_dir: Path,
    schema_validator: Draft202012Validator,
    profile: dict[str, Any],
    roles: dict[str, dict[str, Any]],
    schema_hash: str,
    profile_hash: str,
    schema_bytes: int,
    profile_bytes: int,
    verbose: bool,
) -> tuple[int, int, list[str]]:
    valid_dir = contract_dir / "fixtures" / "valid"
    invalid_dir = contract_dir / "fixtures" / "invalid"
    valid_paths = sorted(valid_dir.glob("*.manifest.json"))
    invalid_paths = sorted(invalid_dir.glob("*.json"))
    if not valid_paths or not invalid_paths:
        raise ContractDefinitionError("Contract fixtures must include valid and invalid cases")

    failures: list[str] = []
    valid_count = 0
    invalid_count = 0
    valid_documents: dict[Path, dict[str, Any]] = {}
    for path in valid_paths:
        manifest = expect_object(
            load_json(path, max_bytes=profile["manifestLimits"]["manifestBytes"]),
            str(path),
        )
        diagnostics = validate_manifest(
            manifest,
            schema_validator,
            profile,
            roles,
            schema_hash,
            profile_hash,
            schema_bytes,
            profile_bytes,
        )
        if diagnostics:
            failures.append(
                f"Valid fixture {path.relative_to(contract_dir)} failed: "
                + "; ".join(f"{item.code} {item.location}: {item.message}" for item in diagnostics)
            )
        else:
            valid_count += 1
            valid_documents[path.resolve()] = manifest
            if verbose:
                print(f"PASS valid {path.relative_to(contract_dir)}")

    for suite_path in invalid_paths:
        suite = expect_object(load_json(suite_path), str(suite_path))
        if suite.get("fixtureFormatVersion") != 1:
            raise ContractDefinitionError(f"Unsupported fixture format in {suite_path}")
        base_manifest_value = suite.get("baseManifest")
        cases = suite.get("cases")
        if not isinstance(base_manifest_value, str) or not isinstance(cases, list):
            raise ContractDefinitionError(f"Invalid fixture suite structure in {suite_path}")
        base_path = (suite_path.parent / base_manifest_value).resolve()
        base_manifest = valid_documents.get(base_path)
        if base_manifest is None:
            base_manifest = expect_object(
                load_json(base_path, max_bytes=profile["manifestLimits"]["manifestBytes"]),
                str(base_path),
            )
            base_diagnostics = validate_manifest(
                base_manifest,
                schema_validator,
                profile,
                roles,
                schema_hash,
                profile_hash,
                schema_bytes,
                profile_bytes,
            )
            if base_diagnostics:
                raise ContractDefinitionError(f"Invalid base manifest for fixture suite {suite_path}")
        seen_case_ids: set[str] = set()
        for case_index, raw_case in enumerate(cases):
            case = expect_object(raw_case, f"{suite_path}.cases[{case_index}]")
            case_id = case.get("id")
            mutations = case.get("mutations")
            expected_codes = case.get("expectedErrorCodes")
            expected_locations = case.get("expectedLocations", {})
            if (
                not isinstance(case_id, str)
                or not case_id
                or case_id in seen_case_ids
                or not isinstance(mutations, list)
                or not mutations
                or not isinstance(expected_codes, list)
                or not expected_codes
                or not all(isinstance(code, str) for code in expected_codes)
                or not isinstance(expected_locations, dict)
                or not all(
                    isinstance(code, str)
                    and isinstance(locations, list)
                    and all(isinstance(location, str) for location in locations)
                    for code, locations in expected_locations.items()
                )
                or not set(expected_locations).issubset(expected_codes)
            ):
                raise ContractDefinitionError(f"Malformed or duplicate invalid fixture case at index {case_index}")
            seen_case_ids.add(case_id)
            candidate = copy.deepcopy(base_manifest)
            for mutation in mutations:
                apply_mutation(candidate, mutation)
            diagnostics = validate_manifest(
                candidate,
                schema_validator,
                profile,
                roles,
                schema_hash,
                profile_hash,
                schema_bytes,
                profile_bytes,
            )
            actual_code_counts = Counter(item.code for item in diagnostics)
            expected_code_counts = Counter(expected_codes)
            location_mismatches: list[str] = []
            for code, expected_code_locations in expected_locations.items():
                actual_code_locations = sorted(
                    item.location for item in diagnostics if item.code == code
                )
                if actual_code_locations != sorted(expected_code_locations):
                    location_mismatches.append(
                        f"{code}: expected locations {sorted(expected_code_locations)}, "
                        f"got {actual_code_locations}"
                    )
            if actual_code_counts != expected_code_counts or location_mismatches:
                failures.append(
                    f"Invalid fixture {case_id!r} expected {dict(sorted(expected_code_counts.items()))}, "
                    f"got {dict(sorted(actual_code_counts.items()))}: "
                    + ("; ".join(location_mismatches) + "; " if location_mismatches else "")
                    + "; ".join(f"{item.code} {item.location}: {item.message}" for item in diagnostics)
                )
            else:
                invalid_count += 1
                if verbose:
                    print(f"PASS invalid {case_id}: {', '.join(sorted(actual_code_counts.elements()))}")
    raw_invalid_count, raw_failures = validate_raw_json_fixture_suite(contract_dir, verbose)
    invalid_count += raw_invalid_count
    failures.extend(raw_failures)
    return valid_count, invalid_count, failures


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--contracts-dir",
        type=Path,
        default=DEFAULT_CONTRACT_DIR,
        help="Versioned curriculum-package contract directory",
    )
    parser.add_argument("--verbose", action="store_true", help="Print every passing fixture")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    contract_dir = args.contracts_dir.resolve()
    schema_path = contract_dir / SCHEMA_FILENAME
    profile_path = contract_dir / PROFILE_RELATIVE_PATH
    try:
        try:
            installed_jsonschema_version = distribution_version("jsonschema")
        except PackageNotFoundError as error:
            raise ContractDefinitionError("Pinned jsonschema dependency is not installed") from error
        if installed_jsonschema_version != JSONSCHEMA_VERSION:
            raise ContractDefinitionError(
                f"Expected jsonschema {JSONSCHEMA_VERSION}, found {installed_jsonschema_version}"
            )
        schema = expect_object(load_json(schema_path), str(schema_path))
        profile = expect_object(load_json(profile_path), str(profile_path))
        roles = validate_trusted_contract(schema, profile, schema_path, profile_path)
        schema_hash = file_sha256(schema_path)
        profile_hash = file_sha256(profile_path)
        schema_bytes = schema_path.stat().st_size
        profile_bytes = profile_path.stat().st_size
        schema_validator = Draft202012Validator(schema)
        valid_count, invalid_count, failures = validate_fixture_suite(
            contract_dir,
            schema_validator,
            profile,
            roles,
            schema_hash,
            profile_hash,
            schema_bytes,
            profile_bytes,
            args.verbose,
        )
    except ContractDefinitionError as error:
        print(f"FAIL curriculum package contract definition: {error}", file=sys.stderr)
        return 1
    except Exception as error:  # keep CI output concise while still failing closed
        print(f"FAIL curriculum package contract validator: {error}", file=sys.stderr)
        return 1

    if failures:
        for failure in failures:
            print(f"FAIL {failure}", file=sys.stderr)
        print(
            f"Curriculum package contract validation failed: {len(failures)} fixture issue(s).",
            file=sys.stderr,
        )
        return 1
    print(
        "Curriculum package contract validation passed: "
        f"trusted schema/profile, {valid_count} valid fixture(s), "
        f"{invalid_count} invalid fixture case(s)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
