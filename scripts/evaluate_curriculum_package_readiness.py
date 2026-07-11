#!/usr/bin/env python3
"""Evaluate JSON curriculum-package readiness without upgrading legacy exports.

The evaluator is deliberately conservative.  It establishes input,
manifest-contract, and finished-ZIP inventory facts itself.  For a safe,
contract-conformant full-standalone ZIP it delegates the catalog, semantic
closure, and content-digest gates to the independent package validator in a
separate bounded process.  The package-only consumer gate is established only
when this evaluator executes the repository-pinned smoke runner itself.  A
caller-supplied report path is an optional persistence destination, never a
trust source.  External reports remain visible as unattested metadata but
cannot make the consumer gate pass.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
import re
import secrets
import signal
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
CONSUMER_REPORT_SCHEMA_PATH = CONTRACT_DIR / "package-consumer-smoke-report.schema.json"
FIXTURE_DIR = CONTRACT_DIR / "fixtures" / "readiness"

REPORT_SCHEMA_ID = (
    "https://skillpilot.com/schemas/curriculum-package/v1/"
    "package-readiness-report.schema.json"
)
CONSUMER_REPORT_SCHEMA_ID = (
    "https://skillpilot.com/schemas/curriculum-package/v1/"
    "package-consumer-smoke-report.schema.json"
)
EVALUATOR_NAME = "skillpilot-json-package-readiness"
EVALUATOR_VERSION = "1.3.0"
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
    *CONSUMER_CHECK_IDS,
]
EVALUATOR_IMPLEMENTATION_COMPLETE = IMPLEMENTED_CHECK_IDS == REQUIRED_CHECK_IDS

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
FULL_VALIDATOR_ID = "skillpilot-full-standalone-package-validator-v2"
FULL_VALIDATOR_REPORT_FORMAT_VERSION = 2
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
MAX_FULL_VALIDATOR_BINDING_JSON_BYTES = 64 * 1024 * 1024
MAX_CONSUMER_REPORT_BYTES = 16 * 1024 * 1024
CONSUMER_RUNNER_PATH = SCRIPT_DIR / "run_package_consumer_smoke.py"
CONSUMER_RUNNER_TIMEOUT_SECONDS = 30 * 60
CONSUMER_RUNNER_ID = "skillpilot-package-consumer-smoke"
CONSUMER_RUNNER_VERSION = "1.0.0"
CONSUMER_API_VERSION = "0.1.0"
FUNCTIONAL_CHECK_IDS = [
    "app-shell.served",
    "catalog.package-discovery",
    "catalog.root-landscape-resolved",
    "landscape.transitive-runtime-closure",
    "offering.default-resolved",
    "composition-view.resolved",
    "learning.frontier-computed",
    "cards.deck-loaded",
    "cards.verified-recall-loaded",
    "resources.goal-visualization-bytes",
    "migration.aliases-loaded",
    "source-evidence.goal-lookup",
    "fallback.legacy-route-rejected",
    "fallback.repository-data-unavailable",
    "fallback.raw-data-route-rejected",
]
POISON_SENTINEL_IDS = [
    "repository.curricula",
    "repository.app-public-data",
    "repository.app-source-data",
    "repository.docs-quality-status",
    "repository.backend-static-data",
]


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


@dataclass
class LoadedConsumerReport:
    name: str
    bytes: int | None
    sha256: str | None
    report: dict[str, Any] | None
    errors: list[str]


@dataclass
class ConsumerEvidenceContext:
    provenance: str
    loaded_report: LoadedConsumerReport | None
    runner_script_bytes: int | None
    runner_script_sha256: str | None
    runner_exit_code: int | None
    runner_timed_out: bool
    fresh_report: bool
    assembly_bytes: int | None
    assembly_sha256: str | None
    evidence_bundle_bytes: int | None
    evidence_bundle_sha256: str | None
    execution_errors: list[str]

    @property
    def complete_for_policy(self) -> bool:
        return bool(
            EVALUATOR_IMPLEMENTATION_COMPLETE
            and self.provenance == "self-executed"
            and self.loaded_report is not None
            and self.loaded_report.report is not None
            and not self.loaded_report.errors
            and self.runner_script_bytes is not None
            and self.runner_script_sha256 is not None
            and self.runner_exit_code is not None
            and not self.runner_timed_out
            and self.fresh_report
            and self.assembly_bytes is not None
            and self.assembly_sha256 is not None
            and self.evidence_bundle_bytes is not None
            and self.evidence_bundle_sha256 is not None
        )


@dataclass(frozen=True)
class TrustedContracts:
    manifest_schema: dict[str, Any]
    profile: dict[str, Any]
    roles: dict[str, dict[str, Any]]
    policy: dict[str, Any]
    report_schema: dict[str, Any]
    consumer_report_schema: dict[str, Any]
    manifest_schema_sha256: str
    profile_sha256: str
    report_schema_sha256: str
    consumer_report_schema_sha256: str
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


def digest_consumer_tree(root: Path) -> tuple[int, str]:
    """Digest a report-external runner tree without absolute path material."""

    if root.is_symlink() or not root.is_dir():
        raise ReadinessError(f"Consumer evidence tree is unavailable: {root.name}")
    files: list[Path] = []
    for path in sorted(
        root.rglob("*"), key=lambda item: item.relative_to(root).as_posix()
    ):
        if path.is_symlink():
            raise ReadinessError(
                f"Consumer evidence tree contains a symlink: {path.relative_to(root)}"
            )
        if path.is_file():
            files.append(path)
        elif not path.is_dir():
            raise ReadinessError(
                f"Consumer evidence tree contains a non-regular entry: {path.relative_to(root)}"
            )
    if not files:
        raise ReadinessError(f"Consumer evidence tree is empty: {root.name}")
    digest = hashlib.sha256()
    total_bytes = 0
    for path in files:
        relative = path.relative_to(root).as_posix()
        file_bytes = path.stat().st_size
        file_sha256 = sha256_file(path)
        total_bytes += file_bytes
        digest.update(relative.encode("utf-8"))
        digest.update(b"\0")
        digest.update(str(file_bytes).encode("ascii"))
        digest.update(b"\0")
        digest.update(file_sha256.encode("ascii"))
        digest.update(b"\n")
    return total_bytes, digest.hexdigest()


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
    consumer_report_schema: dict[str, Any],
    *,
    manifest_schema_sha256: str,
    profile_sha256: str,
    report_schema_sha256: str,
    consumer_report_schema_sha256: str,
) -> None:
    exact_keys(
        policy,
        {
            "policyFormatVersion",
            "policyId",
            "scope",
            "target",
            "reportSchema",
            "consumerSmokeReportSchema",
            "consumerSmokeRunner",
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
    consumer_report_binding = policy.get("consumerSmokeReportSchema")
    if consumer_report_binding != {
        "id": CONSUMER_REPORT_SCHEMA_ID,
        "sha256": consumer_report_schema_sha256,
    }:
        raise ReadinessError("Readiness policy consumer-report schema binding is stale")
    if consumer_report_schema.get("$id") != CONSUMER_REPORT_SCHEMA_ID:
        raise ReadinessError("Unexpected consumer-smoke-report schema $id")
    consumer_runner_binding = policy.get("consumerSmokeRunner")
    expected_runner_binding = {
        "id": CONSUMER_RUNNER_ID,
        "version": CONSUMER_RUNNER_VERSION,
        "path": "scripts/run_package_consumer_smoke.py",
        "bytes": CONSUMER_RUNNER_PATH.stat().st_size,
        "sha256": sha256_file(CONSUMER_RUNNER_PATH),
    }
    if consumer_runner_binding != expected_runner_binding:
        raise ReadinessError(
            "Readiness policy consumer runner binding is stale or the pinned runner changed"
        )

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

    expected_checks = [
        {"id": check_id, "blocking": True} for check_id in REQUIRED_CHECK_IDS
    ]
    if policy.get("requiredChecks") != expected_checks:
        raise ReadinessError(
            "Readiness policy check set/order differs from evaluator v1"
        )

    try:
        report_statuses = report_schema["properties"]["decision"]["properties"][
            "status"
        ]["enum"]
        report_results = report_schema["$defs"]["checkResult"]["enum"]
        report_evaluator = report_schema["properties"]["evaluator"]["properties"]
    except (KeyError, TypeError) as error:
        raise ReadinessError(
            "Readiness-report schema lacks policy-bound fields"
        ) from error
    if (
        report_statuses != STATUS_VOCABULARY
        or report_results != CHECK_RESULT_VOCABULARY
    ):
        raise ReadinessError("Readiness-report schema vocabulary differs from policy")
    if (
        report_evaluator.get("name", {}).get("const") != EVALUATOR_NAME
        or report_evaluator.get("version", {}).get("const") != EVALUATOR_VERSION
        or report_evaluator.get("jsonschemaVersion", {}).get("const")
        != JSONSCHEMA_VERSION
        or report_evaluator.get("implementedCheckIds", {}).get("const")
        != IMPLEMENTED_CHECK_IDS
        or report_evaluator.get("completeForPolicy") != {"type": "boolean"}
    ):
        raise ReadinessError("Readiness-report schema evaluator binding differs")
    try:
        consumer_runner_schema = consumer_report_schema["properties"]["runner"]
        consumer_runner = consumer_runner_schema["properties"]
        consumer_report_version = consumer_report_schema["properties"][
            "reportFormatVersion"
        ]
        consumer_application_schema = consumer_report_schema["$defs"][
            "applicationBinding"
        ]
        consumer_application = consumer_application_schema["properties"]
        consumer_evidence_bundle_schema = consumer_report_schema["$defs"][
            "evidenceBundleBinding"
        ]
        consumer_evidence_bundle = consumer_evidence_bundle_schema["properties"]
        functional_prefix = consumer_report_schema["properties"]["functionalChecks"][
            "prefixItems"
        ]
        poison_prefix = consumer_report_schema["$defs"]["isolationEvidence"][
            "properties"
        ]["poisonSentinels"]["prefixItems"]
    except (KeyError, TypeError) as error:
        raise ReadinessError(
            "Consumer-smoke-report schema lacks policy-bound identities"
        ) from error
    if (
        consumer_runner.get("id", {}).get("const") != CONSUMER_RUNNER_ID
        or consumer_runner.get("version", {}).get("const") != CONSUMER_RUNNER_VERSION
        or consumer_report_version.get("const") != 1
        or consumer_application.get("consumerApiVersion", {}).get("const")
        != CONSUMER_API_VERSION
        or set(consumer_evidence_bundle) != {"bytes", "sha256"}
        or not {"scriptBytes", "scriptSha256"}.issubset(
            set(consumer_runner_schema.get("required", []))
        )
        or not {"assemblyBytes", "assemblySha256"}.issubset(
            set(consumer_application_schema.get("required", []))
        )
        or set(consumer_evidence_bundle_schema.get("required", []))
        != {"bytes", "sha256"}
    ):
        raise ReadinessError("Consumer-smoke-report identity binding differs")

    def closed_prefix_ids(
        prefix: Any,
        definitions: dict[str, Any],
        description: str,
    ) -> list[str]:
        if not isinstance(prefix, list):
            raise ReadinessError(f"{description} is not a closed prefix array")
        identifiers: list[str] = []
        for item in prefix:
            if not isinstance(item, dict) or set(item) != {"$ref"}:
                raise ReadinessError(f"{description} contains an unbound prefix item")
            reference = item["$ref"]
            if not isinstance(reference, str) or not reference.startswith("#/$defs/"):
                raise ReadinessError(
                    f"{description} contains an external prefix reference"
                )
            definition = definitions.get(reference.removeprefix("#/$defs/"))
            if not isinstance(definition, dict):
                raise ReadinessError(f"{description} references an unknown definition")
            identifier = (
                definition.get("properties", {}).get("id", {}).get("const")
                if isinstance(definition.get("properties"), dict)
                else None
            )
            if not isinstance(identifier, str):
                raise ReadinessError(f"{description} lacks an exact ID binding")
            identifiers.append(identifier)
        return identifiers

    definitions = consumer_report_schema.get("$defs")
    if not isinstance(definitions, dict):
        raise ReadinessError("Consumer-smoke-report schema definitions are malformed")
    if (
        closed_prefix_ids(
            functional_prefix,
            definitions,
            "Consumer functional-check schema",
        )
        != FUNCTIONAL_CHECK_IDS
    ):
        raise ReadinessError("Consumer functional-check schema differs from evaluator")
    if (
        closed_prefix_ids(
            poison_prefix,
            definitions,
            "Consumer poison-sentinel schema",
        )
        != POISON_SENTINEL_IDS
    ):
        raise ReadinessError("Consumer poison-sentinel schema differs from evaluator")


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
    consumer_report_schema = load_trusted_json(CONSUMER_REPORT_SCHEMA_PATH)
    Draft202012Validator.check_schema(manifest_schema)
    Draft202012Validator.check_schema(report_schema)
    Draft202012Validator.check_schema(consumer_report_schema)

    try:
        trusted_schema_paths = {
            binding_name: CONTRACT_DIR / filename
            for binding_name, (
                _schema_id,
                filename,
            ) in package_contracts.TRUSTED_SCHEMA_BINDINGS.items()
        }
        roles = package_contracts.validate_trusted_contract(
            manifest_schema,
            profile,
            MANIFEST_SCHEMA_PATH,
            PROFILE_PATH,
            trusted_schema_paths,
        )
    except (
        package_contracts.ContractDefinitionError,
        KeyError,
        TypeError,
        ValueError,
    ) as error:
        raise ReadinessError(
            f"Trusted package contract is inconsistent: {error}"
        ) from error

    manifest_schema_sha256 = sha256_file(MANIFEST_SCHEMA_PATH)
    profile_sha256 = sha256_file(PROFILE_PATH)
    report_schema_sha256 = sha256_file(REPORT_SCHEMA_PATH)
    consumer_report_schema_sha256 = sha256_file(CONSUMER_REPORT_SCHEMA_PATH)
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
        consumer_report_schema,
        manifest_schema_sha256=manifest_schema_sha256,
        profile_sha256=profile_sha256,
        report_schema_sha256=report_schema_sha256,
        consumer_report_schema_sha256=consumer_report_schema_sha256,
    )
    return TrustedContracts(
        manifest_schema=manifest_schema,
        profile=profile,
        roles=roles,
        policy=policy,
        report_schema=report_schema,
        consumer_report_schema=consumer_report_schema,
        manifest_schema_sha256=manifest_schema_sha256,
        profile_sha256=profile_sha256,
        report_schema_sha256=report_schema_sha256,
        consumer_report_schema_sha256=consumer_report_schema_sha256,
        trusted_schema_metadata=trusted_schema_metadata,
        manifest_schema_bytes=MANIFEST_SCHEMA_PATH.stat().st_size,
        profile_bytes=PROFILE_PATH.stat().st_size,
    )


def unavailable_input(*, kind: str, path: Path, size: int, error: str) -> LoadedInput:
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


def load_consumer_report(path: Path) -> LoadedConsumerReport:
    observed_bytes: int | None = None
    observed_sha256: str | None = None
    try:
        metadata = path.lstat()
        if not stat.S_ISREG(metadata.st_mode) or stat.S_ISLNK(metadata.st_mode):
            return LoadedConsumerReport(
                path.name,
                None,
                None,
                None,
                ["consumer smoke report is not a regular non-symlink file"],
            )
        if metadata.st_size > MAX_CONSUMER_REPORT_BYTES:
            return LoadedConsumerReport(
                path.name,
                metadata.st_size,
                None,
                None,
                [f"consumer smoke report exceeds {MAX_CONSUMER_REPORT_BYTES} bytes"],
            )
        raw = path.read_bytes()
        if len(raw) != metadata.st_size:
            raise ReadinessError("Consumer smoke report changed while being read")
        observed_bytes = len(raw)
        observed_sha256 = sha256_bytes(raw)
        parsed = parse_json_bytes(raw, str(path))
        validate_json_shape(parsed, str(path))
        if not isinstance(parsed, dict):
            raise ReadinessError("Consumer smoke report must be a JSON object")
        canonical = (
            json.dumps(parsed, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
        ).encode("utf-8")
        if canonical != raw:
            raise ReadinessError("Consumer smoke report is not canonical JSON")
        final = path.lstat()
        if (
            not stat.S_ISREG(final.st_mode)
            or stat.S_ISLNK(final.st_mode)
            or final.st_size != metadata.st_size
        ):
            raise ReadinessError(
                "Consumer smoke report metadata changed while being read"
            )
        return LoadedConsumerReport(
            path.name,
            observed_bytes,
            observed_sha256,
            parsed,
            [],
        )
    except (OSError, ReadinessError, ValueError) as error:
        return LoadedConsumerReport(
            path.name,
            observed_bytes,
            observed_sha256,
            None,
            [str(error)],
        )


def no_consumer_evidence() -> ConsumerEvidenceContext:
    return ConsumerEvidenceContext(
        provenance="none",
        loaded_report=None,
        runner_script_bytes=None,
        runner_script_sha256=None,
        runner_exit_code=None,
        runner_timed_out=False,
        fresh_report=False,
        assembly_bytes=None,
        assembly_sha256=None,
        evidence_bundle_bytes=None,
        evidence_bundle_sha256=None,
        execution_errors=[],
    )


def external_consumer_evidence(path: Path) -> ConsumerEvidenceContext:
    return ConsumerEvidenceContext(
        provenance="external-unattested",
        loaded_report=load_consumer_report(path),
        runner_script_bytes=None,
        runner_script_sha256=None,
        runner_exit_code=None,
        runner_timed_out=False,
        fresh_report=False,
        assembly_bytes=None,
        assembly_sha256=None,
        evidence_bundle_bytes=None,
        evidence_bundle_sha256=None,
        execution_errors=[],
    )


def lexical_absolute_output_path(destination: Path, description: str) -> Path:
    raw_path = Path(destination)
    if ".." in raw_path.parts:
        raise ReadinessError(f"{description} path must not contain '..'")
    absolute = Path(os.path.abspath(os.fspath(raw_path)))
    if not absolute.is_absolute() or absolute.name in {"", ".", ".."}:
        raise ReadinessError(f"{description} path is invalid")
    return absolute


def preflight_atomic_output_path(destination: Path, description: str) -> Path:
    """Reject lexical parent/final symlinks before any expensive work starts."""

    absolute = lexical_absolute_output_path(destination, description)
    no_follow = getattr(os, "O_NOFOLLOW", None)
    directory_flag = getattr(os, "O_DIRECTORY", None)
    if no_follow is None or directory_flag is None:
        raise ReadinessError(
            f"{description} requires no-follow directory-descriptor support"
        )

    directory_flags = (
        os.O_RDONLY
        | no_follow
        | directory_flag
        | getattr(os, "O_CLOEXEC", 0)
    )
    parent_fd = os.open(absolute.anchor, directory_flags)
    try:
        for component in absolute.parts[1:-1]:
            try:
                metadata = os.stat(
                    component,
                    dir_fd=parent_fd,
                    follow_symlinks=False,
                )
            except FileNotFoundError:
                return absolute
            if stat.S_ISLNK(metadata.st_mode):
                raise ReadinessError(
                    f"{description} parent has a symlink component: {component}"
                )
            if not stat.S_ISDIR(metadata.st_mode):
                raise ReadinessError(
                    f"{description} parent component is not a directory: {component}"
                )
            next_fd = os.open(component, directory_flags, dir_fd=parent_fd)
            os.close(parent_fd)
            parent_fd = next_fd
        try:
            metadata = os.stat(
                absolute.name,
                dir_fd=parent_fd,
                follow_symlinks=False,
            )
        except FileNotFoundError:
            return absolute
        if stat.S_ISLNK(metadata.st_mode) or not stat.S_ISREG(metadata.st_mode):
            raise ReadinessError(
                f"{description} destination must be a regular non-symlink file"
            )
        return absolute
    finally:
        os.close(parent_fd)


def paths_share_inode(first: Path, second: Path) -> bool:
    try:
        first_metadata = first.stat(follow_symlinks=False)
        second_metadata = second.stat(follow_symlinks=False)
    except FileNotFoundError:
        return False
    return (
        first_metadata.st_dev == second_metadata.st_dev
        and first_metadata.st_ino == second_metadata.st_ino
    )


def validate_output_disjointness(
    destination: Path,
    description: str,
    *,
    input_zip: Path | None,
    package_store: Path | None,
    other_outputs: tuple[Path, ...] = (),
) -> Path:
    candidate = preflight_atomic_output_path(destination, description)
    if input_zip is not None:
        input_actual = input_zip.resolve(strict=True)
        if candidate == input_actual or paths_share_inode(candidate, input_actual):
            raise ReadinessError(f"{description} must differ from the input ZIP")
    if package_store is not None:
        store_actual = package_store.resolve(strict=True)
        if candidate == store_actual or store_actual in candidate.parents:
            raise ReadinessError(f"{description} must be outside the package store")
    for other in other_outputs:
        other_candidate = preflight_atomic_output_path(other, "Other report output")
        if candidate == other_candidate or paths_share_inode(candidate, other_candidate):
            raise ReadinessError(f"{description} must differ from other report outputs")
    return candidate


def atomic_write_output_bytes(
    destination: Path,
    payload: bytes,
    description: str,
) -> None:
    """Atomically write below a no-follow dirfd chain, creating safe parents."""

    if not isinstance(payload, bytes):
        raise ReadinessError(f"{description} payload must be bytes")
    absolute = lexical_absolute_output_path(destination, description)
    no_follow = getattr(os, "O_NOFOLLOW", None)
    directory_flag = getattr(os, "O_DIRECTORY", None)
    if no_follow is None or directory_flag is None:
        raise ReadinessError(
            f"{description} requires no-follow directory-descriptor support"
        )
    directory_flags = (
        os.O_RDONLY
        | no_follow
        | directory_flag
        | getattr(os, "O_CLOEXEC", 0)
    )
    parent_fd = os.open(absolute.anchor, directory_flags)
    temporary_name: str | None = None
    try:
        for component in absolute.parts[1:-1]:
            if component in {"", ".", ".."}:
                raise ReadinessError(
                    f"{description} has an unsafe lexical parent component"
                )
            try:
                metadata = os.stat(
                    component,
                    dir_fd=parent_fd,
                    follow_symlinks=False,
                )
            except FileNotFoundError:
                try:
                    os.mkdir(component, mode=0o755, dir_fd=parent_fd)
                except FileExistsError:
                    pass
                metadata = os.stat(
                    component,
                    dir_fd=parent_fd,
                    follow_symlinks=False,
                )
            if stat.S_ISLNK(metadata.st_mode):
                raise ReadinessError(
                    f"{description} parent has a symlink component: {component}"
                )
            if not stat.S_ISDIR(metadata.st_mode):
                raise ReadinessError(
                    f"{description} parent component is not a directory: {component}"
                )
            next_fd = os.open(component, directory_flags, dir_fd=parent_fd)
            os.close(parent_fd)
            parent_fd = next_fd

        final_name = absolute.name
        try:
            final_metadata = os.stat(
                final_name,
                dir_fd=parent_fd,
                follow_symlinks=False,
            )
        except FileNotFoundError:
            final_metadata = None
        if final_metadata is not None and (
            stat.S_ISLNK(final_metadata.st_mode)
            or not stat.S_ISREG(final_metadata.st_mode)
        ):
            raise ReadinessError(
                f"{description} destination must be a regular non-symlink file"
            )

        temporary_fd: int | None = None
        for _attempt in range(20):
            candidate = f".{final_name}.{secrets.token_hex(12)}.tmp"
            try:
                temporary_fd = os.open(
                    candidate,
                    os.O_WRONLY
                    | os.O_CREAT
                    | os.O_EXCL
                    | no_follow
                    | getattr(os, "O_CLOEXEC", 0),
                    0o600,
                    dir_fd=parent_fd,
                )
            except FileExistsError:
                continue
            temporary_name = candidate
            break
        if temporary_fd is None or temporary_name is None:
            raise ReadinessError(f"Cannot allocate temporary {description} file")
        try:
            with os.fdopen(temporary_fd, "wb") as handle:
                temporary_fd = None
                handle.write(payload)
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(
                temporary_name,
                final_name,
                src_dir_fd=parent_fd,
                dst_dir_fd=parent_fd,
            )
            temporary_name = None
            os.fsync(parent_fd)
        finally:
            if temporary_fd is not None:
                os.close(temporary_fd)
    finally:
        if temporary_name is not None:
            try:
                os.unlink(temporary_name, dir_fd=parent_fd)
            except FileNotFoundError:
                pass
        os.close(parent_fd)


def atomic_persist_consumer_report(source: Path, destination: Path) -> None:
    atomic_write_output_bytes(
        destination,
        source.read_bytes(),
        "Consumer smoke report",
    )


def validate_consumer_work_directory(path: Path) -> Path:
    """Return one normalized, non-symlink work path strictly below repo tmp/."""

    tmp_root = (REPO_ROOT / "tmp").absolute()
    try:
        tmp_metadata = tmp_root.lstat()
    except FileNotFoundError as error:
        raise ReadinessError("Repository tmp/ directory is unavailable") from error
    if stat.S_ISLNK(tmp_metadata.st_mode) or not stat.S_ISDIR(tmp_metadata.st_mode):
        raise ReadinessError("Repository tmp/ must be a non-symlink directory")
    candidate = Path(os.path.abspath(os.fspath(path)))
    try:
        relative = candidate.relative_to(tmp_root)
    except ValueError as error:
        raise ReadinessError(
            "Consumer smoke work directory must be below repository tmp/"
        ) from error
    if not relative.parts:
        raise ReadinessError(
            "Repository tmp/ itself cannot be the consumer smoke work directory"
        )

    cursor = tmp_root
    for index, segment in enumerate(relative.parts):
        cursor = cursor / segment
        try:
            metadata = cursor.lstat()
        except FileNotFoundError:
            continue
        if stat.S_ISLNK(metadata.st_mode):
            raise ReadinessError(
                f"Consumer smoke work directory has a symlink component: {cursor}"
            )
        if not stat.S_ISDIR(metadata.st_mode):
            description = "path" if index == len(relative.parts) - 1 else "parent"
            raise ReadinessError(
                f"Consumer smoke work directory {description} is not a directory: {cursor}"
            )
    return candidate


def execute_consumer_runner(
    zip_path: Path,
    store_path: Path,
    contracts: TrustedContracts,
    persist_report_path: Path | None,
    *,
    runner_path: Path = CONSUMER_RUNNER_PATH,
    timeout_seconds: float = CONSUMER_RUNNER_TIMEOUT_SECONDS,
    expected_runner_binding: dict[str, Any] | None = None,
    persistent_work_dir: Path | None = None,
) -> ConsumerEvidenceContext:
    """Execute one exactly pinned runner and capture only its fresh private report."""

    runner_metadata = runner_path.lstat()
    if stat.S_ISLNK(runner_metadata.st_mode) or not stat.S_ISREG(runner_metadata.st_mode):
        raise ReadinessError("Pinned consumer runner is not a regular file")
    runner = runner_path.resolve(strict=True)
    runner_binding = {
        "id": CONSUMER_RUNNER_ID,
        "version": CONSUMER_RUNNER_VERSION,
        "path": "scripts/run_package_consumer_smoke.py",
        "bytes": runner_metadata.st_size,
        "sha256": sha256_file(runner),
    }
    expected = expected_runner_binding or contracts.policy.get("consumerSmokeRunner")
    if runner_binding != expected:
        raise ReadinessError("Consumer smoke runner differs from its trusted pin")

    store_metadata = store_path.lstat()
    if stat.S_ISLNK(store_metadata.st_mode) or not stat.S_ISDIR(store_metadata.st_mode):
        raise ReadinessError("Consumer smoke store must be a regular directory")
    store = store_path.resolve(strict=True)

    private_root = REPO_ROOT / "tmp"
    private_root.mkdir(parents=True, exist_ok=True)
    private_root_metadata = private_root.lstat()
    if stat.S_ISLNK(private_root_metadata.st_mode) or not stat.S_ISDIR(
        private_root_metadata.st_mode
    ):
        raise ReadinessError("Repository tmp/ must be a non-symlink directory")
    with tempfile.TemporaryDirectory(
        prefix="readiness-consumer-", dir=private_root
    ) as temp_name:
        private = Path(temp_name)
        os.chmod(private, 0o700)
        fresh_report_path = private / "fresh-consumer-smoke-report.json"
        work_dir = (
            validate_consumer_work_directory(persistent_work_dir)
            if persistent_work_dir is not None
            else private / "runner-work"
        )
        if persistent_work_dir is not None:
            zip_absolute = Path(os.path.abspath(os.fspath(zip_path)))
            store_absolute = Path(os.path.abspath(os.fspath(store)))
            if work_dir == store_absolute or (
                work_dir in store_absolute.parents
                or store_absolute in work_dir.parents
            ):
                raise ReadinessError(
                    "Consumer smoke work directory must not overlap the package store"
                )
            if work_dir == zip_absolute or work_dir in zip_absolute.parents:
                raise ReadinessError(
                    "Consumer smoke work directory must not contain the input ZIP"
                )
            if persist_report_path is not None:
                persisted_absolute = Path(
                    os.path.abspath(os.fspath(persist_report_path))
                )
                if work_dir == persisted_absolute or work_dir in persisted_absolute.parents:
                    raise ReadinessError(
                        "Persisted consumer report must be outside the retained runner work directory"
                    )
        log_path = private / "runner.log"
        command = [
            sys.executable,
            "-B",
            str(runner),
            "--zip",
            str(zip_path.resolve(strict=True)),
            "--store",
            str(store),
            "--report",
            str(fresh_report_path),
            "--work-dir",
            str(work_dir),
        ]
        environment = dict(os.environ)
        environment["PYTHONDONTWRITEBYTECODE"] = "1"
        timed_out = False
        exit_code: int | None = None
        execution_errors: list[str] = []
        with log_path.open("wb") as log_handle:
            process = subprocess.Popen(
                command,
                cwd=REPO_ROOT,
                env=environment,
                stdin=subprocess.DEVNULL,
                stdout=log_handle,
                stderr=subprocess.STDOUT,
                start_new_session=True,
            )
            try:
                exit_code = process.wait(timeout=timeout_seconds)
            except subprocess.TimeoutExpired:
                timed_out = True
                execution_errors.append(
                    f"Pinned consumer runner exceeded {timeout_seconds:g} seconds"
                )
                try:
                    os.killpg(process.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
                process.wait()

        assembly_binding: tuple[int, str] | None = None
        evidence_bundle_binding: tuple[int, str] | None = None
        try:
            assembly_binding = digest_consumer_tree(work_dir / "assembly")
        except ReadinessError as error:
            execution_errors.append(str(error))
        try:
            evidence_bundle_binding = digest_consumer_tree(
                work_dir / "evidence-bundle"
            )
        except ReadinessError as error:
            execution_errors.append(str(error))

        loaded_report = (
            load_consumer_report(fresh_report_path)
            if fresh_report_path.exists()
            else None
        )
        fresh = bool(
            loaded_report is not None
            and loaded_report.report is not None
            and not loaded_report.errors
        )
        if loaded_report is None:
            execution_errors.append("Pinned consumer runner emitted no report")
        elif loaded_report.errors:
            execution_errors.extend(loaded_report.errors[:5])
        if exit_code not in {0, 1} and not timed_out:
            execution_errors.append(
                f"Pinned consumer runner exited with unexpected status {exit_code}"
            )
        if (
            fresh
            and loaded_report is not None
            and loaded_report.report is not None
            and not loaded_report.errors
            and persist_report_path is not None
        ):
            atomic_persist_consumer_report(fresh_report_path, persist_report_path)
            assert loaded_report is not None
            loaded_report.name = persist_report_path.name

        return ConsumerEvidenceContext(
            provenance="self-executed",
            loaded_report=loaded_report,
            runner_script_bytes=runner_binding["bytes"],
            runner_script_sha256=runner_binding["sha256"],
            runner_exit_code=exit_code,
            runner_timed_out=timed_out,
            fresh_report=fresh,
            assembly_bytes=(
                assembly_binding[0] if assembly_binding is not None else None
            ),
            assembly_sha256=(
                assembly_binding[1] if assembly_binding is not None else None
            ),
            evidence_bundle_bytes=(
                evidence_bundle_binding[0]
                if evidence_bundle_binding is not None
                else None
            ),
            evidence_bundle_sha256=(
                evidence_bundle_binding[1]
                if evidence_bundle_binding is not None
                else None
            ),
            execution_errors=execution_errors,
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
                raise ReadinessError(
                    f"ZIP entry {info.filename!r} exceeded bounded read"
                )
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
        hashed_bytes, outer_sha256 = sha256_file_bounded(path, limits["outerZipBytes"])
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
            portable_names = [
                package_contracts.portable_path_key(name) for name in names
            ]
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
                errors.append(
                    "ZIP contains an entry path above the portable byte limit"
                )
            if any(info.file_size > limits["genericEntryBytes"] for info in infos):
                errors.append(
                    "ZIP contains an entry above the generic uncompressed limit"
                )
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
                if (
                    not package_contracts.path_is_safe(archive_root)
                    or "/" in archive_root
                ):
                    errors.append("ZIP archive root is not portable")
            manifest_names = [
                name for name in names if name.endswith("/metadata/manifest.json")
            ]
            expected_manifest_name = (
                f"{archive_root}/metadata/manifest.json" if archive_root else None
            )
            if len(manifest_names) != 1 or manifest_names[0] != expected_manifest_name:
                errors.append(
                    "ZIP must contain exactly one manifest below its archive root"
                )
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
    bindings = [
        item for item in diagnostics if item.code.startswith("CONTRACT_BINDING_")
    ]
    profile = [
        item
        for item in diagnostics
        if item.code not in target_codes
        and not item.code.startswith("CONTRACT_BINDING_")
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
                if limits["nestedArchivesAllowed"] is False and archive_magic(
                    content_prefix
                ):
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
                    if not isinstance(path, str) or actual_hashes.get(
                        path
                    ) != binding.get("sha256"):
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
                        f"{root}/{path}": digest
                        for path, digest in actual_hashes.items()
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


def expected_full_validator_package_binding(loaded: LoadedInput) -> dict[str, Any]:
    """Independently derive the report-v2 package binding from evaluated ZIP bytes."""

    manifest = loaded.manifest or {}
    closure_digest: str | None = None
    definition_index_digest: str | None = None
    files = manifest.get("files")
    closure_records = (
        [
            record
            for record in files
            if isinstance(record, dict) and record.get("role") == "dependency-closure"
        ]
        if isinstance(files, list)
        else []
    )
    if loaded.kind == "zip" and len(closure_records) == 1:
        relative_path = closure_records[0].get("path")
        if not isinstance(relative_path, str) or not loaded.archive_root:
            raise FullValidatorProcessError(
                "Cannot derive independent dependency-closure report binding"
            )
        archive_path = f"{loaded.archive_root}/{relative_path}"
        try:
            with zipfile.ZipFile(loaded.path) as archive:
                info = archive.getinfo(archive_path)
                raw = read_zip_entry_bounded(
                    archive,
                    info,
                    MAX_FULL_VALIDATOR_BINDING_JSON_BYTES,
                )
            parsed = parse_json_bytes(raw, archive_path)
            validate_json_shape(parsed, archive_path)
        except (
            OSError,
            KeyError,
            RuntimeError,
            ValueError,
            zipfile.BadZipFile,
            ReadinessError,
        ) as error:
            raise FullValidatorProcessError(
                f"Cannot derive independent dependency-closure report binding: {error}"
            ) from error
        if isinstance(parsed, dict):
            raw_closure_digest = parsed.get("closureDigest")
            raw_definition_index_digest = parsed.get("definitionIndexDigest")
            closure_digest = (
                raw_closure_digest if isinstance(raw_closure_digest, str) else None
            )
            definition_index_digest = (
                raw_definition_index_digest
                if isinstance(raw_definition_index_digest, str)
                else None
            )
    return {
        "archiveRoot": loaded.archive_root,
        "releaseId": manifest.get("releaseId"),
        "packageId": manifest.get("packageId"),
        "packageVersion": manifest.get("packageVersion"),
        "contentDigest": manifest.get("contentDigest"),
        "manifestSha256": (
            sha256_bytes(loaded.manifest_bytes)
            if loaded.manifest_bytes is not None
            else None
        ),
        "closureDigest": closure_digest,
        "definitionIndexDigest": definition_index_digest,
    }


def consumer_report_binding(
    evidence: ConsumerEvidenceContext,
    contracts: TrustedContracts,
    status: str,
) -> dict[str, Any]:
    loaded_report = evidence.loaded_report
    return {
        "reportName": loaded_report.name if loaded_report is not None else None,
        "bytes": loaded_report.bytes if loaded_report is not None else None,
        "sha256": loaded_report.sha256 if loaded_report is not None else None,
        "schemaSha256": contracts.consumer_report_schema_sha256,
        "status": status,
        "provenance": evidence.provenance,
        "runnerScriptBytes": evidence.runner_script_bytes,
        "runnerScriptSha256": evidence.runner_script_sha256,
        "runnerExitCode": evidence.runner_exit_code,
        "runnerTimedOut": evidence.runner_timed_out,
        "freshReport": evidence.fresh_report,
        "assemblyBytes": evidence.assembly_bytes,
        "assemblySha256": evidence.assembly_sha256,
        "evidenceBundleBytes": evidence.evidence_bundle_bytes,
        "evidenceBundleSha256": evidence.evidence_bundle_sha256,
    }


def validate_consumer_report_semantics(
    report: dict[str, Any],
    loaded: LoadedInput,
    contracts: TrustedContracts,
) -> None:
    errors = list(
        islice(
            Draft202012Validator(contracts.consumer_report_schema).iter_errors(report),
            MAX_SCHEMA_DIAGNOSTICS,
        )
    )
    if errors:
        error = errors[0]
        location = "/" + "/".join(str(item) for item in error.absolute_path)
        raise ReadinessError(
            "Consumer smoke report schema failure at "
            f"{location}: {truncate_fragment(error.message)}"
        )

    input_binding = report["input"]
    package_binding = expected_full_validator_package_binding(loaded)
    expected_input = {
        "name": loaded.name,
        "bytes": loaded.bytes,
        "sha256": loaded.sha256,
        **package_binding,
    }
    if input_binding != expected_input:
        raise ReadinessError(
            "Consumer smoke report is not exactly bound to the evaluated ZIP and package"
        )
    if input_binding["releaseId"] != (
        f"{input_binding['packageId']}@{input_binding['packageVersion']}"
    ):
        raise ReadinessError("Consumer smoke report releaseId binding is incoherent")

    activation = report["activation"]
    if activation["packageCount"] != 1:
        raise ReadinessError(
            "Single-package consumer evidence must bind exactly one active lock entry"
        )
    if activation["activeLockSha256"] == "0" * 64:
        raise ReadinessError("Consumer smoke active-lock hash is a placeholder")
    active_lock_bytes = (
        json.dumps(
            activation["activeLock"],
            ensure_ascii=False,
            indent=2,
            sort_keys=True,
        )
        + "\n"
    ).encode("utf-8")
    if activation["activeLockBytes"] != len(active_lock_bytes) or activation[
        "activeLockSha256"
    ] != sha256_bytes(active_lock_bytes):
        raise ReadinessError(
            "Consumer smoke active-lock byte length/hash differs from the inline canonical lock"
        )
    if activation["activeLockSha256"] != activation["generationSha256"]:
        raise ReadinessError(
            "Consumer smoke generation must equal the exact active package-lock SHA-256"
        )
    selected = activation["selectedPackage"]
    if activation["activeLock"]["packages"] != [selected]:
        raise ReadinessError(
            "Consumer smoke selected package differs from the exact inline active lock"
        )
    expected_selected = {
        "packageId": input_binding["packageId"],
        "packageVersion": input_binding["packageVersion"],
        "releaseId": input_binding["releaseId"],
        "outerZipSha256": input_binding["sha256"],
        "manifestSha256": input_binding["manifestSha256"],
        "contentDigest": input_binding["contentDigest"],
        "archiveRoot": input_binding["archiveRoot"],
        "closureDigest": input_binding["closureDigest"],
        "definitionIndexDigest": input_binding["definitionIndexDigest"],
    }
    for field, expected in expected_selected.items():
        if selected.get(field) != expected:
            raise ReadinessError(
                f"Consumer smoke active-lock package binding differs for {field}"
            )
    if selected["releaseId"] != f"{selected['packageId']}@{selected['packageVersion']}":
        raise ReadinessError("Consumer smoke selected lock releaseId is incoherent")
    if selected["installRecordSha256"] == "0" * 64:
        raise ReadinessError("Consumer smoke install-record hash is a placeholder")

    application = report["application"]
    if application["consumerApiVersion"] != CONSUMER_API_VERSION:
        raise ReadinessError(
            "Consumer smoke report uses an unexpected curriculum-consumer API version"
        )
    application_hashes = [
        report["runner"]["scriptSha256"],
        application["frontendSha256"],
        application["backendSha256"],
        application["configurationSha256"],
        application["assemblySha256"],
        report["evidenceBundle"]["sha256"],
    ]
    if len(set(application_hashes)) != len(application_hashes) or any(
        value == "0" * 64 for value in application_hashes
    ):
        raise ReadinessError(
            "Consumer smoke runner/application/evidence artifacts need distinct non-placeholder hashes"
        )
    functional_checks = report["functionalChecks"]
    if [item["id"] for item in functional_checks] != FUNCTIONAL_CHECK_IDS:
        raise ReadinessError(
            "Consumer smoke functional checks differ from the closed required order"
        )
    if report["status"] == "passed" and any(
        item["evidenceSha256"] == "0" * 64 for item in functional_checks
    ):
        raise ReadinessError(
            "Consumer smoke functional evidence contains a placeholder hash"
        )
    summary = report["summary"]
    expected_summary = {
        "required": len(FUNCTIONAL_CHECK_IDS),
        "passed": sum(item["result"] == "passed" for item in functional_checks),
        "failed": sum(item["result"] == "failed" for item in functional_checks),
        "notRun": sum(item["result"] == "not-run" for item in functional_checks),
    }
    if summary != expected_summary:
        raise ReadinessError(
            "Consumer smoke summary is not derived from functional checks"
        )
    poison_sentinels = report["isolation"]["poisonSentinels"]
    if report["isolation"]["filesystemTraceSha256"] == "0" * 64:
        raise ReadinessError("Consumer smoke filesystem trace hash is a placeholder")
    if [item["id"] for item in poison_sentinels] != POISON_SENTINEL_IDS:
        raise ReadinessError(
            "Consumer smoke poison sentinels differ from the closed required order"
        )
    diagnostics = report["diagnostics"]
    if diagnostics != sorted(
        diagnostics, key=lambda item: (item["code"], item["message"])
    ):
        raise ReadinessError("Consumer smoke diagnostics are not canonically ordered")


def evaluate_consumer_report(
    evidence: ConsumerEvidenceContext,
    loaded: LoadedInput,
    contracts: TrustedContracts,
) -> tuple[str, str, str, dict[str, Any]]:
    loaded_report = evidence.loaded_report
    if evidence.provenance == "external-unattested":
        return (
            "not-evaluated",
            "CONSUMER_SMOKE_REPORT_UNATTESTED",
            "An external consumer smoke report is not a trust source. Provide "
            "--consumer-smoke-store so the evaluator executes its pinned runner.",
            consumer_report_binding(evidence, contracts, "external-unattested"),
        )
    if evidence.provenance != "self-executed":
        return (
            "not-evaluated",
            "CONSUMER_SMOKE_REPORT_NOT_PROVIDED",
            "No package-only SkillPilot consumer smoke run was requested.",
            consumer_report_binding(evidence, contracts, "not-provided"),
        )
    if evidence.runner_timed_out or loaded_report is None:
        detail = "; ".join(evidence.execution_errors[:5]) or "no fresh report"
        return (
            "not-evaluated",
            "CONSUMER_SMOKE_RUNNER_UNAVAILABLE",
            "The pinned consumer smoke runner yielded no attested report: " + detail,
            consumer_report_binding(evidence, contracts, "not-evaluated"),
        )
    policy_runner = contracts.policy["consumerSmokeRunner"]
    if (
        evidence.runner_script_bytes != policy_runner["bytes"]
        or evidence.runner_script_sha256 != policy_runner["sha256"]
    ):
        return (
            "fail",
            "CONSUMER_SMOKE_RUNNER_UNTRUSTED",
            "The executed consumer smoke runner differs from the trusted policy pin.",
            consumer_report_binding(evidence, contracts, "rejected"),
        )
    if loaded_report is None:
        return (
            "not-evaluated",
            "CONSUMER_SMOKE_REPORT_NOT_PROVIDED",
            "No package-only SkillPilot consumer smoke report was provided.",
            consumer_report_binding(evidence, contracts, "not-provided"),
        )
    if loaded_report.errors or loaded_report.report is None:
        return (
            "fail",
            "CONSUMER_SMOKE_REPORT_INVALID",
            "Consumer smoke evidence could not be loaded safely: "
            + "; ".join(loaded_report.errors[:5]),
            consumer_report_binding(evidence, contracts, "rejected"),
        )
    try:
        validate_consumer_report_semantics(
            loaded_report.report,
            loaded,
            contracts,
        )
    except (ReadinessError, FullValidatorProcessError) as error:
        return (
            "fail",
            "CONSUMER_SMOKE_REPORT_INVALID",
            "Consumer smoke evidence failed closed validation: "
            + truncate_fragment(str(error), 1200),
            consumer_report_binding(evidence, contracts, "rejected"),
        )
    if (
        loaded_report.report["runner"]["scriptBytes"]
        != evidence.runner_script_bytes
        or loaded_report.report["runner"]["scriptSha256"]
        != evidence.runner_script_sha256
    ):
        return (
            "fail",
            "CONSUMER_SMOKE_RUNNER_BINDING_INVALID",
            "The fresh report does not bind the exact pinned runner bytes.",
            consumer_report_binding(evidence, contracts, "rejected"),
        )
    application = loaded_report.report["application"]
    evidence_bundle = loaded_report.report["evidenceBundle"]
    if (
        application["assemblyBytes"] != evidence.assembly_bytes
        or application["assemblySha256"] != evidence.assembly_sha256
    ):
        return (
            "fail",
            "CONSUMER_SMOKE_ASSEMBLY_BINDING_INVALID",
            "The fresh report differs from the evaluator-recomputed final assembly tree.",
            consumer_report_binding(evidence, contracts, "rejected"),
        )
    if (
        evidence_bundle["bytes"] != evidence.evidence_bundle_bytes
        or evidence_bundle["sha256"] != evidence.evidence_bundle_sha256
    ):
        return (
            "fail",
            "CONSUMER_SMOKE_EVIDENCE_BUNDLE_BINDING_INVALID",
            "The fresh report differs from the evaluator-recomputed evidence tree.",
            consumer_report_binding(evidence, contracts, "rejected"),
        )
    expected_exit = 0 if loaded_report.report["status"] == "passed" else 1
    if evidence.runner_exit_code != expected_exit:
        return (
            "fail",
            "CONSUMER_SMOKE_RUNNER_EXIT_MISMATCH",
            "Pinned runner exit status and fresh report status differ.",
            consumer_report_binding(evidence, contracts, "rejected"),
        )
    if loaded_report.report["status"] != "passed":
        return (
            "fail",
            "HERMETIC_CONSUMER_SMOKE_FAILED",
            "The bound package-only consumer smoke report did not pass.",
            consumer_report_binding(evidence, contracts, "accepted"),
        )
    isolation = loaded_report.report["isolation"]
    application = loaded_report.report["application"]
    return (
        "pass",
        "CHECK_PASSED",
        "Bound package-only consumer smoke passed all 15 functional checks; "
        f"generation={loaded_report.report['activation']['generationSha256']}, "
        f"frontend={application['frontendSha256']}, "
        f"trace={isolation['filesystemTraceSha256']}.",
        consumer_report_binding(evidence, contracts, "accepted"),
    )


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
        raise FullValidatorProcessError(
            "Independent validator input binding is malformed"
        )
    exact_keys(input_value, {"path", "bytes", "sha256"}, "validator input binding")
    if input_value != {
        "path": str(loaded.path.resolve()),
        "bytes": loaded.bytes,
        "sha256": loaded.sha256,
    }:
        raise FullValidatorProcessError(
            "Independent validator report is not bound to the evaluated ZIP bytes"
        )

    package_value = report.get("package")
    if not isinstance(package_value, dict):
        raise FullValidatorProcessError(
            "Independent validator package binding is malformed"
        )
    exact_keys(
        package_value,
        {
            "archiveRoot",
            "releaseId",
            "packageId",
            "packageVersion",
            "contentDigest",
            "manifestSha256",
            "closureDigest",
            "definitionIndexDigest",
        },
        "validator package binding",
    )
    expected_package = expected_full_validator_package_binding(loaded)
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
        raise FullValidatorProcessError(
            "Independent validator timeout must be positive"
        )
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
        if not stat.S_ISREG(final_metadata.st_mode) or stat.S_ISLNK(
            final_metadata.st_mode
        ):
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
            "evidence: " + truncate_fragment(str(error), 1200)
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
    complete_for_policy: bool,
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
        checks_by_id[check_id]["result"] == "fail" for check_id in PUBLICATION_CHECK_IDS
    ):
        status, reason = "not-ready-incomplete", "REDISTRIBUTION_REVIEW_REQUIRED"
    elif any(check["result"] == "fail" for check in checks):
        status, reason = "not-ready-incomplete", "REQUIRED_GATES_FAILED"
    elif any(check["result"] != "pass" for check in checks):
        status, reason = "not-ready-incomplete", "REQUIRED_GATES_NOT_EVALUATED"
    elif complete_for_policy:
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
    consumer_evidence: ConsumerEvidenceContext | None = None,
) -> dict[str, Any]:
    manifest = loaded.manifest
    policy = contracts.policy
    dialect, markers = classify_manifest(manifest, policy)
    blocking_by_id = {item["id"]: item["blocking"] for item in policy["requiredChecks"]}
    checks_by_id: dict[str, dict[str, Any]] = {}
    evidence = consumer_evidence or no_consumer_evidence()
    complete_for_policy = evidence.complete_for_policy
    consumer_binding = consumer_report_binding(
        evidence,
        contracts,
        "not-provided"
        if evidence.provenance == "none"
        else (
            "external-unattested"
            if evidence.provenance == "external-unattested"
            else "not-evaluated"
        ),
    )

    def record(check_id: str, result: str, code: str, message: str) -> None:
        if check_id in checks_by_id:
            raise ReadinessError(f"Evaluator recorded check twice: {check_id}")
        checks_by_id[check_id] = make_check(
            check_id, result, code, message, blocking_by_id
        )

    def mark_checks(check_ids: list[str], result: str, code: str, message: str) -> None:
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
            [
                *IDENTITY_CHECK_IDS,
                *CONTRACT_CHECK_IDS,
                *CATALOG_CHECK_IDS,
                *STANDALONE_CHECK_IDS,
                *PUBLICATION_CHECK_IDS,
                *CONSUMER_CHECK_IDS,
            ],
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
            [
                *CONTRACT_CHECK_IDS,
                *CATALOG_CHECK_IDS,
                *STANDALONE_CHECK_IDS,
                *PUBLICATION_CHECK_IDS,
                *CONSUMER_CHECK_IDS,
            ],
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
            "MANIFEST_SCHEMA_INVALID"
            if schema_diagnostics
            else "INCOHERENT_TARGET_CONTRACT",
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
            [
                *CATALOG_CHECK_IDS,
                *STANDALONE_CHECK_IDS,
                *PUBLICATION_CHECK_IDS,
                *CONSUMER_CHECK_IDS,
            ],
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
            [
                *CONTRACT_CHECK_IDS,
                *CATALOG_CHECK_IDS,
                *STANDALONE_CHECK_IDS,
                *PUBLICATION_CHECK_IDS,
                *CONSUMER_CHECK_IDS,
            ],
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
                "REDISTRIBUTION_REVIEW_REQUIRED" if uncleared_paths else "CHECK_PASSED",
                ("Redistribution is not cleared for: " + ", ".join(uncleared_paths[:5]))
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
        if loaded.kind != "zip":
            record(
                "consumer.hermetic-package-only",
                "not-evaluated",
                "PAYLOAD_NOT_PROVIDED",
                "A standalone manifest cannot prove package-only consumer operability.",
            )
        elif any(
            checks_by_id[check_id]["result"] != "pass"
            for check_id in [*IDENTITY_CHECK_IDS, *CONTRACT_CHECK_IDS]
        ):
            record(
                "consumer.hermetic-package-only",
                "not-evaluated",
                "CONSUMER_SMOKE_BLOCKED",
                "Consumer evidence is not applied until target-contract and finished-ZIP inventory checks pass.",
            )
        else:
            result, code, message, consumer_binding = evaluate_consumer_report(
                evidence,
                loaded,
                contracts,
            )
            record("consumer.hermetic-package-only", result, code, message)
    else:
        raise ReadinessError(f"Unhandled safe manifest dialect {dialect!r}")

    if set(checks_by_id) != set(REQUIRED_CHECK_IDS):
        raise ReadinessError(
            f"Evaluator check coverage differs; missing={sorted(set(REQUIRED_CHECK_IDS) - set(checks_by_id))}"
        )
    checks = [checks_by_id[check_id] for check_id in REQUIRED_CHECK_IDS]
    complete_for_policy = bool(
        complete_for_policy
        and consumer_binding["status"] in {"accepted", "rejected"}
        and checks_by_id[CONSUMER_CHECK_IDS[0]]["result"] in {"pass", "fail"}
    )
    report = {
        "$schema": REPORT_SCHEMA_ID,
        "reportFormatVersion": "1.1",
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
            "completeForPolicy": complete_for_policy,
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
        "consumerEvidence": consumer_binding,
        "classification": {
            "manifestDialect": dialect,
            "targetMarkers": markers,
        },
        "dimensions": {
            "inputIntegrity": aggregate_dimension(checks_by_id, INPUT_CHECK_IDS),
            "contractConformance": aggregate_dimension(
                checks_by_id, CONTRACT_CHECK_IDS
            ),
            "catalogCompleteness": aggregate_dimension(checks_by_id, CATALOG_CHECK_IDS),
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
        "decision": derive_decision(dialect, checks, complete_for_policy),
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
    consumer_evidence = report["consumerEvidence"]
    expected_complete_for_policy = bool(
        EVALUATOR_IMPLEMENTATION_COMPLETE
        and consumer_evidence["provenance"] == "self-executed"
        and consumer_evidence["freshReport"]
        and not consumer_evidence["runnerTimedOut"]
        and consumer_evidence["runnerScriptBytes"] is not None
        and consumer_evidence["runnerScriptSha256"] is not None
        and consumer_evidence["runnerExitCode"] is not None
        and consumer_evidence["assemblyBytes"] is not None
        and consumer_evidence["assemblySha256"] is not None
        and consumer_evidence["evidenceBundleBytes"] is not None
        and consumer_evidence["evidenceBundleSha256"] is not None
        and consumer_evidence["status"] in {"accepted", "rejected"}
    )
    expected_evaluator = {
        "name": EVALUATOR_NAME,
        "version": EVALUATOR_VERSION,
        "jsonschemaVersion": JSONSCHEMA_VERSION,
        "implementedCheckIds": IMPLEMENTED_CHECK_IDS,
        "completeForPolicy": expected_complete_for_policy,
    }
    if report["evaluator"] != expected_evaluator:
        raise ReadinessError("Readiness report evaluator binding is stale or forged")

    checks = report["checks"]
    check_ids = [check["id"] for check in checks]
    if check_ids != REQUIRED_CHECK_IDS:
        raise ReadinessError(
            "Readiness report check multiset/order differs from policy"
        )
    if any(check["blocking"] is not True for check in checks):
        raise ReadinessError("Readiness report changed policy blocking semantics")
    if any(
        check["id"] not in IMPLEMENTED_CHECK_IDS and check["result"] == "pass"
        for check in checks
    ):
        raise ReadinessError("Unimplemented readiness check cannot claim pass")
    if checks[0]["result"] == "pass" and (
        report["input"]["sha256"] is None or report["input"]["manifestSha256"] is None
    ):
        raise ReadinessError(
            "Input-integrity pass requires artifact and manifest hashes"
        )

    checks_by_id = {check["id"]: check for check in checks}
    if consumer_evidence["schemaSha256"] != contracts.consumer_report_schema_sha256:
        raise ReadinessError("Readiness report consumer schema binding is stale")
    consumer_result = checks_by_id[CONSUMER_CHECK_IDS[0]]["result"]
    evidence_status = consumer_evidence["status"]
    provenance = consumer_evidence["provenance"]
    if provenance in {"none", "external-unattested"} and any(
        consumer_evidence[field] is not None
        for field in (
            "runnerScriptBytes",
            "runnerScriptSha256",
            "runnerExitCode",
            "assemblyBytes",
            "assemblySha256",
            "evidenceBundleBytes",
            "evidenceBundleSha256",
        )
    ):
        raise ReadinessError("Unattested consumer evidence carries runner execution claims")
    if provenance in {"none", "external-unattested"} and (
        consumer_evidence["runnerTimedOut"] or consumer_evidence["freshReport"]
    ):
        raise ReadinessError("Unattested consumer evidence carries fresh-run claims")
    if provenance == "self-executed" and (
        consumer_evidence["runnerScriptBytes"]
        != contracts.policy["consumerSmokeRunner"]["bytes"]
        or consumer_evidence["runnerScriptSha256"]
        != contracts.policy["consumerSmokeRunner"]["sha256"]
    ):
        raise ReadinessError("Self-executed consumer evidence differs from runner pin")
    if evidence_status in {"accepted", "rejected"} and provenance != "self-executed":
        raise ReadinessError("Evaluated consumer evidence is not self-executed")
    if evidence_status == "accepted" and not consumer_evidence["freshReport"]:
        raise ReadinessError("Accepted consumer evidence is not a fresh canonical report")
    if evidence_status == "external-unattested" and provenance != "external-unattested":
        raise ReadinessError("External evidence status/provenance differs")
    if evidence_status == "not-provided" and any(
        consumer_evidence[field] is not None
        for field in ("reportName", "bytes", "sha256")
    ):
        raise ReadinessError("Missing consumer evidence carries forged report metadata")
    if evidence_status == "accepted" and any(
        consumer_evidence[field] is None for field in ("reportName", "bytes", "sha256")
    ):
        raise ReadinessError(
            "Accepted consumer evidence lacks exact report-byte bindings"
        )
    if evidence_status == "accepted" and consumer_result not in {"pass", "fail"}:
        raise ReadinessError(
            "Accepted consumer evidence is not reflected as an evaluated gate"
        )
    if consumer_result == "pass" and evidence_status != "accepted":
        raise ReadinessError("Consumer pass lacks accepted self-executed evidence")
    if consumer_result == "pass" and not expected_complete_for_policy:
        raise ReadinessError("Consumer pass lacks complete self-executed tree evidence")
    if evidence_status == "rejected" and consumer_result != "fail":
        raise ReadinessError(
            "Rejected consumer evidence is not reflected as a failed gate"
        )
    if evidence_status == "not-provided" and consumer_result not in {
        "not-applicable",
        "not-evaluated",
    }:
        raise ReadinessError(
            "Missing consumer evidence is reflected as an evaluated gate"
        )
    if evidence_status == "external-unattested" and consumer_result != "not-evaluated":
        raise ReadinessError("External unattested evidence affected the consumer gate")
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
        report["classification"]["manifestDialect"],
        checks,
        report["evaluator"]["completeForPolicy"],
    )
    if report["decision"] != expected_decision:
        raise ReadinessError(
            "Readiness decision is not derived exactly from checks/dialect"
        )


def evaluate_path(
    path: Path,
    kind: str,
    consumer_report_path: Path | None = None,
    consumer_store_path: Path | None = None,
    consumer_work_dir: Path | None = None,
) -> dict[str, Any]:
    contracts = trusted_contracts()
    if not path.is_file():
        raise ReadinessError(f"Input is not a regular file: {path}")
    if kind == "manifest":
        loaded = load_manifest_input(
            path, contracts.profile["manifestLimits"]["manifestBytes"]
        )
    else:
        loaded = load_zip_input(path, contracts.profile)
    if consumer_work_dir is not None and consumer_store_path is None:
        raise ReadinessError(
            "Consumer smoke work directory requires evaluator-managed runner execution"
        )
    if consumer_store_path is not None:
        if kind != "zip":
            raise ReadinessError("Consumer smoke runner requires a finished ZIP")
        if consumer_report_path is not None:
            validate_output_disjointness(
                consumer_report_path,
                "Consumer smoke report",
                input_zip=path,
                package_store=consumer_store_path,
            )
        evidence = execute_consumer_runner(
            path,
            consumer_store_path,
            contracts,
            consumer_report_path,
            persistent_work_dir=consumer_work_dir,
        )
    elif consumer_report_path is not None:
        evidence = external_consumer_evidence(consumer_report_path)
    else:
        evidence = no_consumer_evidence()
    return evaluate_loaded_input(loaded, contracts, evidence)


def stable_json(value: Any, pretty: bool = True) -> str:
    if pretty:
        return json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    return (
        json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
        + "\n"
    )


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
        raise ReadinessError(f"Independent validator report guard accepted {label}")


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
            contracts.consumer_report_schema,
            manifest_schema_sha256=contracts.manifest_schema_sha256,
            profile_sha256=contracts.profile_sha256,
            report_schema_sha256=contracts.report_schema_sha256,
            consumer_report_schema_sha256=contracts.consumer_report_schema_sha256,
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
    review_required: bool = False,
) -> None:
    manifest = load_trusted_json(FIXTURE_DIR / "target-contract-only.manifest.json")
    if review_required:
        manifest["files"][3]["redistributionStatus"] = "review-required"
        manifest["files"][3]["licenseExpression"] = None
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
        elif record["role"] == "dependency-closure":
            payload = stable_json(
                {
                    "closureDigest": "sha256:" + "1" * 64,
                    "definitionIndexDigest": "sha256:" + "2" * 64,
                }
            ).encode("utf-8")
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


def passing_consumer_report(
    loaded: LoadedInput,
    runner_binding: dict[str, Any],
) -> dict[str, Any]:
    package_binding = expected_full_validator_package_binding(loaded)
    input_binding = {
        "name": loaded.name,
        "bytes": loaded.bytes,
        "sha256": loaded.sha256,
        **package_binding,
    }
    selected_package = {
        "packageId": input_binding["packageId"],
        "packageVersion": input_binding["packageVersion"],
        "releaseId": input_binding["releaseId"],
        "outerZipSha256": input_binding["sha256"],
        "manifestSha256": input_binding["manifestSha256"],
        "contentDigest": input_binding["contentDigest"],
        "archiveRoot": input_binding["archiveRoot"],
        "closureDigest": input_binding["closureDigest"],
        "definitionIndexDigest": input_binding["definitionIndexDigest"],
        "installRecordSha256": "4" * 64,
    }
    active_lock = {
        "lockFormatVersion": "1.0",
        "packages": [selected_package],
    }
    active_lock_bytes = stable_json(active_lock).encode("utf-8")
    active_lock_sha256 = sha256_bytes(active_lock_bytes)
    return {
        "$schema": CONSUMER_REPORT_SCHEMA_ID,
        "reportFormatVersion": 1,
        "runner": {
            "id": CONSUMER_RUNNER_ID,
            "version": CONSUMER_RUNNER_VERSION,
            "scriptBytes": runner_binding["bytes"],
            "scriptSha256": runner_binding["sha256"],
        },
        "status": "passed",
        "input": input_binding,
        "activation": {
            "activeLockBytes": len(active_lock_bytes),
            "activeLockSha256": active_lock_sha256,
            "activeLock": active_lock,
            "generationSha256": active_lock_sha256,
            "packageCount": 1,
            "selectedPackage": selected_package,
        },
        "application": {
            "consumer": "SkillPilot",
            "consumerApiVersion": CONSUMER_API_VERSION,
            "frontendBytes": len(b"self-test frontend artifact"),
            "frontendSha256": sha256_bytes(b"self-test frontend artifact"),
            "backendBytes": len(b"self-test backend artifact"),
            "backendSha256": sha256_bytes(b"self-test backend artifact"),
            "configurationBytes": len(b"self-test configuration artifact"),
            "configurationSha256": sha256_bytes(b"self-test configuration artifact"),
            "assemblyBytes": len(b"self-test final runtime assembly"),
            "assemblySha256": sha256_bytes(b"self-test final runtime assembly"),
        },
        "evidenceBundle": {
            "bytes": len(b"self-test external evidence bundle"),
            "sha256": sha256_bytes(b"self-test external evidence bundle"),
        },
        "isolation": {
            "mechanism": "self-test-isolated-process",
            "hermetic": True,
            "sourceCheckoutAccessible": False,
            "repositoryMountAccessible": False,
            "networkPolicy": "loopback-only",
            "packageStoreReadOnly": True,
            "filesystemTraceBytes": len(b"self-test filesystem trace"),
            "filesystemTraceSha256": sha256_bytes(b"self-test filesystem trace"),
            "poisonSentinels": [
                {"id": sentinel_id, "result": "not-observed"}
                for sentinel_id in POISON_SENTINEL_IDS
            ],
        },
        "functionalChecks": [
            {
                "id": check_id,
                "result": "passed",
                "evidenceSha256": hashlib.sha256(check_id.encode("utf-8")).hexdigest(),
            }
            for check_id in FUNCTIONAL_CHECK_IDS
        ],
        "summary": {
            "required": len(FUNCTIONAL_CHECK_IDS),
            "passed": len(FUNCTIONAL_CHECK_IDS),
            "failed": 0,
            "notRun": 0,
        },
        "diagnostics": [],
    }


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
        if (
            not isinstance(expected_results, dict)
            or list(expected_results) != REQUIRED_CHECK_IDS
        ):
            raise ReadinessError(
                f"Fixture {case_id} must pin every check result in policy order"
            )
        actual_results = {check["id"]: check["result"] for check in report["checks"]}
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
    review_checks = {check["id"]: check for check in review_required_report["checks"]}
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
    forged_policy_hash = copy.deepcopy(target_report)
    forged_policy_hash["policy"]["sha256"] = "0" * 64
    assert_semantic_rejection(
        forged_policy_hash,
        contracts,
        "readiness policy hash binding",
    )
    forged_consumer_schema_hash = copy.deepcopy(target_report)
    forged_consumer_schema_hash["consumerEvidence"]["schemaSha256"] = "0" * 64
    assert_semantic_rejection(
        forged_consumer_schema_hash,
        contracts,
        "consumer-evidence schema hash binding",
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
        raise ReadinessError(
            "Malformed target did not produce structured invalid report"
        )
    print("PASS malformed target produces structured invalid report")

    for label, mutation in (
        (
            "report-schema hash drift",
            lambda policy: policy["reportSchema"].update({"sha256": "0" * 64}),
        ),
        (
            "consumer-report-schema hash drift",
            lambda policy: policy["consumerSmokeReportSchema"].update(
                {"sha256": "0" * 64}
            ),
        ),
        (
            "consumer-runner hash drift",
            lambda policy: policy["consumerSmokeRunner"].update(
                {"sha256": "0" * 64}
            ),
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
        tree_fixture = temp_dir / "tree-digest-fixture"
        (tree_fixture / "nested").mkdir(parents=True)
        (tree_fixture / "a.txt").write_bytes(b"alpha")
        (tree_fixture / "nested/b.txt").write_bytes(b"beta")
        expected_tree_digest = hashlib.sha256()
        for relative, payload in (
            ("a.txt", b"alpha"),
            ("nested/b.txt", b"beta"),
        ):
            expected_tree_digest.update(relative.encode("utf-8"))
            expected_tree_digest.update(b"\0")
            expected_tree_digest.update(str(len(payload)).encode("ascii"))
            expected_tree_digest.update(b"\0")
            expected_tree_digest.update(sha256_bytes(payload).encode("ascii"))
            expected_tree_digest.update(b"\n")
        if digest_consumer_tree(tree_fixture) != (
            9,
            expected_tree_digest.hexdigest(),
        ):
            raise ReadinessError("Canonical consumer tree digest differs")
        print("PASS consumer assembly/evidence tree digest is canonical")

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
        target_checks = {check["id"]: check for check in target_zip_report["checks"]}
        if (
            target_zip_report["decision"]["status"] != "not-ready-incomplete"
            or target_checks["contract.inventory-bytes"]["result"] != "pass"
        ):
            raise ReadinessError(
                "Generated safe target ZIP failed inventory validation"
            )
        print("PASS generated safe target ZIP inventory")

        runner_binding = contracts.policy["consumerSmokeRunner"]
        passing_smoke = passing_consumer_report(target_loaded, runner_binding)
        passing_smoke_path = temp_dir / "package-consumer-smoke-report.json"
        passing_smoke_path.write_text(stable_json(passing_smoke), encoding="utf-8")
        loaded_smoke = load_consumer_report(passing_smoke_path)
        unattested_report = evaluate_loaded_input(
            target_loaded,
            contracts,
            external_consumer_evidence(passing_smoke_path),
        )
        unattested_checks = {
            check["id"]: check for check in unattested_report["checks"]
        }
        if (
            unattested_checks[CONSUMER_CHECK_IDS[0]]["result"] != "not-evaluated"
            or unattested_report["consumerEvidence"]["status"]
            != "external-unattested"
            or unattested_report["evaluator"]["completeForPolicy"]
        ):
            raise ReadinessError("A canned external consumer report became trusted")
        print("PASS canned external consumer report remains unattested")

        fake_store = temp_dir / "fake-consumer-store"
        fake_store.mkdir()

        def fake_runner_binding(path: Path) -> dict[str, Any]:
            return {
                "id": CONSUMER_RUNNER_ID,
                "version": CONSUMER_RUNNER_VERSION,
                "path": "scripts/run_package_consumer_smoke.py",
                "bytes": path.stat().st_size,
                "sha256": sha256_file(path),
            }

        with tempfile.TemporaryDirectory(
            prefix="readiness-workdir-self-test-", dir=REPO_ROOT / "tmp"
        ) as work_parent_name:
            work_parent = Path(work_parent_name)
            valid_retained_work = work_parent / "retained-runner-work"
            existing_directory = work_parent / "existing-directory"
            existing_directory.mkdir()
            non_directory = work_parent / "not-a-directory"
            non_directory.write_bytes(b"not a directory")
            symlink_component = work_parent / "symlink-component"
            symlink_component.symlink_to(existing_directory, target_is_directory=True)

            for label, unsafe_path in (
                ("outside repository tmp", temp_dir / "outside-work"),
                ("repository tmp root", REPO_ROOT / "tmp"),
                ("symlink component", symlink_component / "child"),
                ("non-directory", non_directory),
                ("non-directory parent", non_directory / "child"),
            ):
                try:
                    validate_consumer_work_directory(unsafe_path)
                except ReadinessError:
                    pass
                else:
                    raise ReadinessError(
                        f"Unsafe persistent consumer work directory was accepted: {label}"
                    )
            if validate_consumer_work_directory(
                valid_retained_work
            ) != valid_retained_work.absolute() or validate_consumer_work_directory(
                existing_directory
            ) != existing_directory.absolute():
                raise ReadinessError("Safe persistent consumer work directory changed")
            print("PASS retained consumer work directory path policy fails closed")

            output_victim = work_parent / "output-victim"
            output_victim.mkdir()
            output_link = work_parent / "output-link"
            output_link.symlink_to(output_victim, target_is_directory=True)
            for description, writer, linked_destination in (
                (
                    "consumer report",
                    lambda destination: atomic_persist_consumer_report(
                        passing_smoke_path, destination
                    ),
                    output_link / "consumer-report.json",
                ),
                (
                    "readiness report",
                    lambda destination: atomic_write_output_bytes(
                        destination,
                        b"readiness\n",
                        "Readiness report",
                    ),
                    output_link / "readiness-report.json",
                ),
            ):
                try:
                    writer(linked_destination)
                except ReadinessError:
                    pass
                else:
                    raise ReadinessError(
                        f"{description} followed a symlink parent"
                    )
                if (output_victim / linked_destination.name).exists():
                    raise ReadinessError(
                        f"{description} wrote through a rejected symlink parent"
                    )

            protected_target = output_victim / "protected.json"
            protected_target.write_bytes(b"protected\n")
            for description, writer, symlink_name in (
                (
                    "consumer report",
                    lambda destination: atomic_persist_consumer_report(
                        passing_smoke_path, destination
                    ),
                    "consumer-final-link.json",
                ),
                (
                    "readiness report",
                    lambda destination: atomic_write_output_bytes(
                        destination,
                        b"readiness\n",
                        "Readiness report",
                    ),
                    "readiness-final-link.json",
                ),
            ):
                final_link = work_parent / symlink_name
                final_link.symlink_to(protected_target)
                try:
                    writer(final_link)
                except ReadinessError:
                    pass
                else:
                    raise ReadinessError(
                        f"{description} followed a symlink destination"
                    )
                if protected_target.read_bytes() != b"protected\n":
                    raise ReadinessError(
                        f"{description} changed a symlink destination target"
                    )

            safe_consumer_output = work_parent / "created/consumer/report.json"
            atomic_persist_consumer_report(
                passing_smoke_path,
                safe_consumer_output,
            )
            safe_readiness_output = work_parent / "created/readiness/report.json"
            atomic_write_output_bytes(
                safe_readiness_output,
                b"first\n",
                "Readiness report",
            )
            atomic_write_output_bytes(
                safe_readiness_output,
                b"second\n",
                "Readiness report",
            )
            if (
                safe_consumer_output.read_bytes() != passing_smoke_path.read_bytes()
                or safe_readiness_output.read_bytes() != b"second\n"
                or list((work_parent / "created").rglob("*.tmp"))
            ):
                raise ReadinessError(
                    "Safe atomic report output did not create/replace cleanly"
                )
            print(
                "PASS consumer/readiness outputs reject parent/final symlinks and write atomically"
            )

            fake_store_marker = fake_store / "store-marker"
            fake_store_marker.write_bytes(b"protected store bytes")
            output_zip_alias = work_parent / "output-zip-alias.json"
            output_zip_alias.symlink_to(target_zip)
            output_store_alias = work_parent / "output-store-alias"
            output_store_alias.symlink_to(fake_store, target_is_directory=True)
            target_zip_before = target_zip.read_bytes()
            for description, unsafe_output in (
                ("equal input ZIP", target_zip),
                ("below package store", fake_store / "report.json"),
                ("symlink aliases input ZIP", output_zip_alias),
                ("parent symlink aliases package store", output_store_alias / "report.json"),
            ):
                try:
                    validate_output_disjointness(
                        unsafe_output,
                        "Self-test report",
                        input_zip=target_zip,
                        package_store=fake_store,
                    )
                except ReadinessError:
                    pass
                else:
                    raise ReadinessError(
                        f"Destructive report output was accepted: {description}"
                    )
            if (
                target_zip.read_bytes() != target_zip_before
                or fake_store_marker.read_bytes() != b"protected store bytes"
                or (fake_store / "report.json").exists()
            ):
                raise ReadinessError("Report-output preflight corrupted ZIP/store")
            print(
                "PASS consumer/readiness outputs are disjoint from ZIP/store and aliases"
            )

            observed_work_marker = temp_dir / "observed-runner-work.txt"
            failing_runner = temp_dir / "consumer-runner-failure.py"
            failing_runner.write_text(
                "import pathlib, sys\n"
                "work = pathlib.Path(sys.argv[sys.argv.index('--work-dir') + 1])\n"
                f"pathlib.Path({str(observed_work_marker)!r}).write_text(str(work), encoding='utf-8')\n"
                "(work / 'assembly').mkdir(parents=True, exist_ok=True)\n"
                "(work / 'assembly/runtime.bin').write_bytes(b'assembly')\n"
                "(work / 'evidence-bundle').mkdir(parents=True, exist_ok=True)\n"
                "(work / 'evidence-bundle/evidence.json').write_bytes(b'evidence')\n"
                "raise SystemExit(17)\n",
                encoding="utf-8",
            )
            fake_binding = fake_runner_binding(failing_runner)
            overlap_store = work_parent / "overlap-store"
            overlap_store.mkdir()
            contained_zip = work_parent / "contained-input.zip"
            contained_zip.write_bytes(target_zip.read_bytes())
            for label, guarded_zip, guarded_store, guarded_work, guarded_report in (
                (
                    "work inside package store",
                    target_zip,
                    overlap_store,
                    overlap_store / "runner-work",
                    None,
                ),
                (
                    "work contains package store",
                    target_zip,
                    overlap_store,
                    work_parent,
                    None,
                ),
                (
                    "work contains input ZIP",
                    contained_zip,
                    fake_store,
                    work_parent,
                    None,
                ),
                (
                    "persisted report inside work",
                    target_zip,
                    fake_store,
                    valid_retained_work,
                    valid_retained_work / "consumer-report.json",
                ),
            ):
                try:
                    execute_consumer_runner(
                        guarded_zip,
                        guarded_store,
                        contracts,
                        guarded_report,
                        runner_path=failing_runner,
                        timeout_seconds=2,
                        expected_runner_binding=fake_binding,
                        persistent_work_dir=guarded_work,
                    )
                except ReadinessError:
                    pass
                else:
                    raise ReadinessError(
                        f"Destructive retained-work overlap was accepted: {label}"
                    )
            print("PASS retained consumer work cannot overlap trusted inputs/outputs")

            default_execution = execute_consumer_runner(
                target_zip,
                fake_store,
                contracts,
                None,
                runner_path=failing_runner,
                timeout_seconds=2,
                expected_runner_binding=fake_binding,
            )
            default_work = Path(
                observed_work_marker.read_text(encoding="utf-8")
            )
            if default_work.exists():
                raise ReadinessError("Default private consumer work directory was retained")

            failed_execution = execute_consumer_runner(
                target_zip,
                fake_store,
                contracts,
                None,
                runner_path=failing_runner,
                timeout_seconds=2,
                expected_runner_binding=fake_binding,
                persistent_work_dir=valid_retained_work,
            )
            if (
                Path(observed_work_marker.read_text(encoding="utf-8"))
                != valid_retained_work
                or not (valid_retained_work / "assembly/runtime.bin").is_file()
                or not (
                    valid_retained_work / "evidence-bundle/evidence.json"
                ).is_file()
                or failed_execution.assembly_bytes != len(b"assembly")
                or failed_execution.evidence_bundle_bytes != len(b"evidence")
            ):
                raise ReadinessError(
                    "Explicit consumer work directory was not retained and recomputed"
                )
            print(
                "PASS default consumer work is private/ephemeral and explicit safe work is retained"
            )

        failed_result, _code, _message, _binding = evaluate_consumer_report(
            failed_execution, target_loaded, contracts
        )
        if (
            failed_result != "not-evaluated"
            or failed_execution.runner_exit_code != 17
            or failed_execution.complete_for_policy
        ):
            raise ReadinessError("Runner failure became trusted consumer evidence")
        print("PASS pinned-runner failure remains not evaluated")

        timeout_runner = temp_dir / "consumer-runner-timeout.py"
        timeout_runner.write_text(
            "import time\ntime.sleep(30)\n", encoding="utf-8"
        )
        timed_out_execution = execute_consumer_runner(
            target_zip,
            fake_store,
            contracts,
            None,
            runner_path=timeout_runner,
            timeout_seconds=0.05,
            expected_runner_binding=fake_runner_binding(timeout_runner),
        )
        timed_out_result, _code, _message, _binding = evaluate_consumer_report(
            timed_out_execution, target_loaded, contracts
        )
        if (
            timed_out_result != "not-evaluated"
            or not timed_out_execution.runner_timed_out
            or timed_out_execution.complete_for_policy
        ):
            raise ReadinessError("Runner timeout became trusted consumer evidence")
        print("PASS pinned-runner timeout is bounded and remains not evaluated")

        canned_runner = temp_dir / "consumer-runner-canned-copy.py"
        canned_runner.write_text(
            "import pathlib, shutil, sys\n"
            "destination = pathlib.Path(sys.argv[sys.argv.index('--report') + 1])\n"
            f"shutil.copyfile({str(passing_smoke_path)!r}, destination)\n",
            encoding="utf-8",
        )
        persisted_canned_output = temp_dir / "persisted-consumer-report.json"
        persisted_canned_output.write_bytes(b"pre-existing canned bytes\n")
        canned_execution = execute_consumer_runner(
            target_zip,
            fake_store,
            contracts,
            persisted_canned_output,
            runner_path=canned_runner,
            timeout_seconds=2,
            expected_runner_binding=fake_runner_binding(canned_runner),
        )
        canned_result, _code, _message, canned_binding = evaluate_consumer_report(
            canned_execution, target_loaded, contracts
        )
        if canned_result != "fail" or canned_binding["status"] != "rejected":
            raise ReadinessError("An unpinned runner laundered a canned report")
        if persisted_canned_output.read_bytes() != passing_smoke_path.read_bytes():
            raise ReadinessError("Fresh canonical runner output was not atomically persisted")
        print(
            "PASS unpinned runner cannot launder canned consumer evidence; "
            "fresh output persistence replaces the requested destination"
        )

        self_executed_smoke = ConsumerEvidenceContext(
            provenance="self-executed",
            loaded_report=loaded_smoke,
            runner_script_bytes=runner_binding["bytes"],
            runner_script_sha256=runner_binding["sha256"],
            runner_exit_code=0,
            runner_timed_out=False,
            fresh_report=True,
            assembly_bytes=passing_smoke["application"]["assemblyBytes"],
            assembly_sha256=passing_smoke["application"]["assemblySha256"],
            evidence_bundle_bytes=passing_smoke["evidenceBundle"]["bytes"],
            evidence_bundle_sha256=passing_smoke["evidenceBundle"]["sha256"],
            execution_errors=[],
        )
        smoke_report = evaluate_loaded_input(
            target_loaded, contracts, self_executed_smoke
        )
        smoke_checks = {check["id"]: check for check in smoke_report["checks"]}
        if (
            smoke_checks[CONSUMER_CHECK_IDS[0]]["result"] != "pass"
            or smoke_report["consumerEvidence"]["status"] != "accepted"
            or smoke_report["consumerEvidence"]["sha256"]
            != sha256_file(passing_smoke_path)
            or not smoke_report["evaluator"]["completeForPolicy"]
        ):
            raise ReadinessError(
                "Valid bound package-only consumer evidence did not pass"
            )
        print("PASS bound hermetic package-only consumer evidence")

        review_gated_zip = temp_dir / "review-gated-target-package.zip"
        build_target_zip(review_gated_zip, contracts, review_required=True)
        review_gated_loaded = load_zip_input(review_gated_zip, contracts.profile)
        if review_gated_loaded.errors:
            raise ReadinessError("Review-gated target ZIP failed safe preflight")
        review_gated_smoke_path = temp_dir / "review-gated-consumer-report.json"
        review_gated_smoke_path.write_text(
            stable_json(passing_consumer_report(review_gated_loaded, runner_binding)),
            encoding="utf-8",
        )
        review_gated_report = evaluate_loaded_input(
            review_gated_loaded,
            contracts,
            ConsumerEvidenceContext(
                provenance="self-executed",
                loaded_report=load_consumer_report(review_gated_smoke_path),
                runner_script_bytes=runner_binding["bytes"],
                runner_script_sha256=runner_binding["sha256"],
                runner_exit_code=0,
                runner_timed_out=False,
                fresh_report=True,
                assembly_bytes=passing_smoke["application"]["assemblyBytes"],
                assembly_sha256=passing_smoke["application"]["assemblySha256"],
                evidence_bundle_bytes=passing_smoke["evidenceBundle"]["bytes"],
                evidence_bundle_sha256=passing_smoke["evidenceBundle"]["sha256"],
                execution_errors=[],
            ),
        )
        review_gated_checks = {
            check["id"]: check for check in review_gated_report["checks"]
        }
        if (
            review_gated_checks[CONSUMER_CHECK_IDS[0]]["result"] != "pass"
            or review_gated_checks[PUBLICATION_CHECK_IDS[0]]["result"] != "fail"
            or review_gated_report["decision"]["status"] != "not-ready-incomplete"
            or review_gated_report["decision"]["primaryReasonCode"]
            != "REDISTRIBUTION_REVIEW_REQUIRED"
        ):
            raise ReadinessError(
                "A passing consumer proof overrode an open human publication gate"
            )
        print("PASS consumer gate can pass without overriding open human release gates")

        def rewrite_active_lock(
            value: dict[str, Any],
            field: str,
            replacement: Any,
        ) -> None:
            activation = value["activation"]
            activation["selectedPackage"][field] = replacement
            activation["activeLock"]["packages"][0][field] = replacement
            rewritten = stable_json(activation["activeLock"]).encode("utf-8")
            activation["activeLockBytes"] = len(rewritten)
            activation["activeLockSha256"] = sha256_bytes(rewritten)
            activation["generationSha256"] = sha256_bytes(rewritten)

        def append_second_lock_package(value: dict[str, Any]) -> None:
            activation = value["activation"]
            second = copy.deepcopy(activation["selectedPackage"])
            second["packageId"] = "org.skillpilot.fixture-second"
            second["releaseId"] = f"{second['packageId']}@{second['packageVersion']}"
            activation["activeLock"]["packages"].append(second)
            activation["packageCount"] = 2
            rewritten = stable_json(activation["activeLock"]).encode("utf-8")
            activation["activeLockBytes"] = len(rewritten)
            activation["activeLockSha256"] = sha256_bytes(rewritten)
            activation["generationSha256"] = sha256_bytes(rewritten)

        consumer_mutations: list[tuple[str, Any]] = [
            (
                "outer ZIP substitution",
                lambda value: value["input"].update({"sha256": "9" * 64}),
            ),
            (
                "manifest substitution",
                lambda value: value["input"].update({"manifestSha256": "9" * 64}),
            ),
            (
                "closure substitution",
                lambda value: value["input"].update(
                    {"closureDigest": "sha256:" + "9" * 64}
                ),
            ),
            (
                "definition-index substitution",
                lambda value: value["input"].update(
                    {"definitionIndexDigest": "sha256:" + "9" * 64}
                ),
            ),
            (
                "content-digest substitution",
                lambda value: value["input"].update(
                    {"contentDigest": "sha256:" + "9" * 64}
                ),
            ),
            (
                "generation/lock mismatch",
                lambda value: value["activation"].update(
                    {"generationSha256": "9" * 64}
                ),
            ),
            (
                "active lock hash substitution",
                lambda value: value["activation"].update(
                    {
                        "activeLockSha256": "9" * 64,
                        "generationSha256": "9" * 64,
                    }
                ),
            ),
            (
                "active lock byte-count substitution",
                lambda value: value["activation"].update(
                    {"activeLockBytes": value["activation"]["activeLockBytes"] + 1}
                ),
            ),
            (
                "internally coherent lock package substitution",
                lambda value: rewrite_active_lock(
                    value,
                    "definitionIndexDigest",
                    "sha256:" + "9" * 64,
                ),
            ),
            (
                "multiple-package lock",
                append_second_lock_package,
            ),
            (
                "selected package substitution",
                lambda value: value["activation"]["selectedPackage"].update(
                    {"outerZipSha256": "9" * 64}
                ),
            ),
            (
                "source checkout visibility",
                lambda value: value["isolation"].update(
                    {"sourceCheckoutAccessible": True}
                ),
            ),
            (
                "install-record hash placeholder",
                lambda value: rewrite_active_lock(
                    value,
                    "installRecordSha256",
                    "0" * 64,
                ),
            ),
            (
                "functional failure hidden by pass",
                lambda value: value["functionalChecks"][0].update({"result": "failed"}),
            ),
            (
                "functional check reordering",
                lambda value: value["functionalChecks"].reverse(),
            ),
            (
                "functional check duplication",
                lambda value: value["functionalChecks"][0].update(
                    {"id": value["functionalChecks"][1]["id"]}
                ),
            ),
            (
                "functional evidence placeholder",
                lambda value: value["functionalChecks"][0].update(
                    {"evidenceSha256": "0" * 64}
                ),
            ),
            (
                "poison sentinel observed",
                lambda value: value["isolation"]["poisonSentinels"][0].update(
                    {"result": "observed"}
                ),
            ),
            (
                "poison sentinel reordering",
                lambda value: value["isolation"]["poisonSentinels"].reverse(),
            ),
            (
                "consumer API substitution",
                lambda value: value["application"].update(
                    {"consumerApiVersion": "9.9.9"}
                ),
            ),
            (
                "runner script hash substitution",
                lambda value: value["runner"].update({"scriptSha256": "9" * 64}),
            ),
            (
                "runner script byte-count substitution",
                lambda value: value["runner"].update(
                    {"scriptBytes": value["runner"]["scriptBytes"] + 1}
                ),
            ),
            (
                "application hash placeholder",
                lambda value: value["application"].update({"frontendSha256": "0" * 64}),
            ),
            (
                "application hash collision",
                lambda value: value["application"].update(
                    {
                        "backendSha256": value["application"]["frontendSha256"],
                    }
                ),
            ),
            (
                "final assembly hash substitution",
                lambda value: value["application"].update(
                    {"assemblySha256": "9" * 64}
                ),
            ),
            (
                "final assembly byte-count substitution",
                lambda value: value["application"].update(
                    {"assemblyBytes": value["application"]["assemblyBytes"] + 1}
                ),
            ),
            (
                "evidence bundle hash substitution",
                lambda value: value["evidenceBundle"].update(
                    {"sha256": "9" * 64}
                ),
            ),
            (
                "evidence bundle byte-count substitution",
                lambda value: value["evidenceBundle"].update(
                    {"bytes": value["evidenceBundle"]["bytes"] + 1}
                ),
            ),
            (
                "filesystem trace placeholder",
                lambda value: value["isolation"].update(
                    {"filesystemTraceSha256": "0" * 64}
                ),
            ),
        ]
        for label, mutation in consumer_mutations:
            forged = copy.deepcopy(passing_smoke)
            mutation(forged)
            forged_path = temp_dir / (
                "forged-consumer-"
                + re.sub(r"[^a-z0-9]+", "-", label.lower()).strip("-")
                + ".json"
            )
            forged_path.write_text(stable_json(forged), encoding="utf-8")
            result, _code, _message, binding = evaluate_consumer_report(
                ConsumerEvidenceContext(
                    provenance="self-executed",
                    loaded_report=load_consumer_report(forged_path),
                    runner_script_bytes=runner_binding["bytes"],
                    runner_script_sha256=runner_binding["sha256"],
                    runner_exit_code=0,
                    runner_timed_out=False,
                    fresh_report=True,
                    assembly_bytes=passing_smoke["application"]["assemblyBytes"],
                    assembly_sha256=passing_smoke["application"]["assemblySha256"],
                    evidence_bundle_bytes=passing_smoke["evidenceBundle"]["bytes"],
                    evidence_bundle_sha256=passing_smoke["evidenceBundle"]["sha256"],
                    execution_errors=[],
                ),
                target_loaded,
                contracts,
            )
            if result != "fail" or binding["status"] != "rejected":
                raise ReadinessError(f"Consumer evidence forgery was accepted: {label}")
        print(
            "PASS consumer evidence rejects "
            f"{len(consumer_mutations)} binding/isolation/functional forgeries"
        )
        forged_exit_evidence = copy.copy(self_executed_smoke)
        forged_exit_evidence.runner_exit_code = 1
        forged_exit_result, _code, _message, forged_exit_binding = (
            evaluate_consumer_report(
                forged_exit_evidence,
                target_loaded,
                contracts,
            )
        )
        if (
            forged_exit_result != "fail"
            or forged_exit_binding["status"] != "rejected"
        ):
            raise ReadinessError("Runner exit/report mismatch was accepted")
        print("PASS consumer evidence binds the pinned runner exit status")

        with zipfile.ZipFile(target_zip) as archive:
            replay_entries = {
                info.filename: archive.read(info)
                for info in reversed(archive.infolist())
            }
        replay_zip = temp_dir / "repacked-target-package.zip"
        write_zip(replay_zip, replay_entries)
        replay_loaded = load_zip_input(replay_zip, contracts.profile)
        if replay_loaded.errors or replay_loaded.sha256 == target_loaded.sha256:
            raise ReadinessError("Replay fixture is not a distinct safe target ZIP")
        replay_result, _code, _message, replay_binding = evaluate_consumer_report(
            self_executed_smoke,
            replay_loaded,
            contracts,
        )
        if replay_result != "fail" or replay_binding["status"] != "rejected":
            raise ReadinessError(
                "Consumer evidence replay against a repacked ZIP passed"
            )
        print("PASS consumer evidence replay against a distinct safe ZIP is rejected")

        noncanonical_smoke_path = temp_dir / "noncanonical-consumer-report.json"
        noncanonical_smoke_path.write_text(
            stable_json(passing_smoke, pretty=False),
            encoding="utf-8",
        )
        noncanonical_loaded = load_consumer_report(noncanonical_smoke_path)
        if (
            not noncanonical_loaded.errors
            or noncanonical_loaded.bytes != noncanonical_smoke_path.stat().st_size
            or noncanonical_loaded.sha256 != sha256_file(noncanonical_smoke_path)
        ):
            raise ReadinessError(
                "Noncanonical consumer evidence was accepted or lost its byte binding"
            )
        print("PASS noncanonical consumer evidence is rejected with exact byte binding")

        ambiguous_smoke_path = temp_dir / "ambiguous-consumer-report.json"
        ambiguous_smoke_path.write_bytes(b'{"status":"passed","status":"failed"}\n')
        ambiguous_readiness = evaluate_loaded_input(
            target_loaded,
            contracts,
            ConsumerEvidenceContext(
                provenance="self-executed",
                loaded_report=load_consumer_report(ambiguous_smoke_path),
                runner_script_bytes=runner_binding["bytes"],
                runner_script_sha256=runner_binding["sha256"],
                runner_exit_code=1,
                runner_timed_out=False,
                fresh_report=False,
                assembly_bytes=None,
                assembly_sha256=None,
                evidence_bundle_bytes=None,
                evidence_bundle_sha256=None,
                execution_errors=[],
            ),
        )
        ambiguous_checks = {
            check["id"]: check for check in ambiguous_readiness["checks"]
        }
        if (
            ambiguous_checks[CONSUMER_CHECK_IDS[0]]["result"] != "fail"
            or ambiguous_readiness["consumerEvidence"]["status"] != "rejected"
        ):
            raise ReadinessError(
                "Ambiguous consumer evidence did not fail structurally"
            )
        print("PASS ambiguous consumer evidence yields a structured failed gate")

        validator_report = {
            "reportFormatVersion": FULL_VALIDATOR_REPORT_FORMAT_VERSION,
            "validatorId": FULL_VALIDATOR_ID,
            "status": "invalid",
            "input": {
                "path": str(target_loaded.path.resolve()),
                "bytes": target_loaded.bytes,
                "sha256": target_loaded.sha256,
            },
            "package": expected_full_validator_package_binding(target_loaded),
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
        forged_manifest_binding = copy.deepcopy(validator_report)
        forged_manifest_binding["package"]["manifestSha256"] = "0" * 64
        forged_validator_reports.append(
            ("manifest hash binding", forged_manifest_binding, validator_returncode)
        )
        forged_closure_binding = copy.deepcopy(validator_report)
        forged_closure_binding["package"]["closureDigest"] = "sha256:" + "0" * 64
        forged_validator_reports.append(
            ("closure digest binding", forged_closure_binding, validator_returncode)
        )
        forged_definition_binding = copy.deepcopy(validator_report)
        forged_definition_binding["package"]["definitionIndexDigest"] = (
            "sha256:" + "0" * 64
        )
        forged_validator_reports.append(
            (
                "definition index binding",
                forged_definition_binding,
                validator_returncode,
            )
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
        unexpected_exit_validator.write_text("raise SystemExit(17)\n", encoding="utf-8")
        assert_full_validator_process_not_evaluated(
            target_loaded, unexpected_exit_validator, "unexpected exit code"
        )
        timeout_validator = temp_dir / "validator-timeout.py"
        timeout_validator.write_text("import time\ntime.sleep(30)\n", encoding="utf-8")
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
        if (
            evaluate_loaded_input(
                load_zip_input(reserved_zip, contracts.profile), contracts
            )["decision"]["status"]
            != "invalid"
        ):
            raise ReadinessError("Reserved ZIP path was accepted")
        print("PASS reserved ZIP path rejected")

        prefix_zip = temp_dir / "prefix.zip"
        build_legacy_zip(
            prefix_zip,
            {f"{root}/data/file": b"x", f"{root}/data/file/child": b"y"},
        )
        if (
            evaluate_loaded_input(
                load_zip_input(prefix_zip, contracts.profile), contracts
            )["decision"]["status"]
            != "invalid"
        ):
            raise ReadinessError("ZIP prefix collision was accepted")
        print("PASS ZIP file/directory prefix collision rejected")

        nested_path_zip = temp_dir / "nested-path.zip"
        build_legacy_zip(nested_path_zip, {f"{root}/data/archive.zip": b"not a zip"})
        if (
            evaluate_loaded_input(
                load_zip_input(nested_path_zip, contracts.profile), contracts
            )["decision"]["status"]
            != "invalid"
        ):
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
        if (
            evaluate_loaded_input(
                load_zip_input(ratio_zip, contracts.profile), contracts
            )["decision"]["status"]
            != "invalid"
        ):
            raise ReadinessError("Compression-ratio bomb was accepted")
        print("PASS compression-ratio bomb rejected")

        tiny_limit_profile = copy.deepcopy(contracts.profile)
        tiny_limit_profile["archiveLimits"]["outerZipBytes"] = (
            target_zip.stat().st_size - 1
        )
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
        f"{len(seen_ids)} manifest fixture(s), 6 policy-tamper cases, "
        "7 readiness-report forgeries, 8 validator-report forgeries, "
        f"{len(consumer_mutations)} consumer-report forgeries, "
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
    help_result = subprocess.run(
        [sys.executable, "-B", str(script), "--help"],
        cwd=REPO_ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    normalized_help = " ".join(help_result.stdout.split())
    if (
        help_result.returncode != EXIT_READY
        or "--consumer-smoke-work-dir" not in normalized_help
        or "below repository tmp/" not in normalized_help
    ):
        raise ReadinessError("CLI help does not document retained consumer work")
    print("PASS readiness CLI help documents retained consumer work")
    report_victim = temp_dir / "readiness-report-victim"
    report_victim.mkdir()
    report_parent_link = temp_dir / "readiness-report-parent-link"
    report_parent_link.symlink_to(report_victim, target_is_directory=True)
    protected_manifest = temp_dir / "protected-input.manifest.json"
    protected_manifest.write_bytes((FIXTURE_DIR / "legacy.manifest.json").read_bytes())
    protected_manifest_before = protected_manifest.read_bytes()
    protected_manifest_link = temp_dir / "protected-input-link.json"
    protected_manifest_link.symlink_to(protected_manifest)
    external_consumer_input = temp_dir / "external-consumer-input.json"
    external_consumer_input.write_bytes(b'{"external":"consumer"}\n')
    external_consumer_before = external_consumer_input.read_bytes()
    output_guard_store = temp_dir / "output-guard-store"
    output_guard_store.mkdir()
    output_guard_store_marker = output_guard_store / "marker"
    output_guard_store_marker.write_bytes(b"store marker\n")
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
            [
                "--manifest",
                str(FIXTURE_DIR / "partial-target.manifest.json"),
                "--compact",
            ],
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
        (
            "readiness-report-symlink-parent",
            [
                "--manifest",
                str(FIXTURE_DIR / "legacy.manifest.json"),
                "--report",
                str(report_parent_link / "readiness.json"),
                "--compact",
            ],
            EXIT_INTERNAL_ERROR,
        ),
        (
            "readiness-report-equals-input",
            [
                "--manifest",
                str(protected_manifest),
                "--report",
                str(protected_manifest),
                "--compact",
            ],
            EXIT_INTERNAL_ERROR,
        ),
        (
            "readiness-report-symlink-aliases-input",
            [
                "--manifest",
                str(protected_manifest),
                "--report",
                str(protected_manifest_link),
                "--compact",
            ],
            EXIT_INTERNAL_ERROR,
        ),
        (
            "readiness-report-below-store",
            [
                "--zip",
                str(unsafe_legacy_zip),
                "--consumer-smoke-store",
                str(output_guard_store),
                "--report",
                str(output_guard_store / "readiness.json"),
                "--compact",
            ],
            EXIT_INTERNAL_ERROR,
        ),
        (
            "readiness-report-equals-external-consumer-input",
            [
                "--zip",
                str(unsafe_legacy_zip),
                "--consumer-smoke-report",
                str(external_consumer_input),
                "--report",
                str(external_consumer_input),
                "--compact",
            ],
            EXIT_INTERNAL_ERROR,
        ),
        (
            "consumer-work-without-store",
            [
                "--zip",
                str(unsafe_legacy_zip),
                "--consumer-smoke-work-dir",
                str(REPO_ROOT / "tmp/readiness-cli-work"),
                "--compact",
            ],
            2,
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
    if (report_victim / "readiness.json").exists():
        raise ReadinessError("CLI readiness report wrote through a symlink parent")
    if (
        protected_manifest.read_bytes() != protected_manifest_before
        or external_consumer_input.read_bytes() != external_consumer_before
        or output_guard_store_marker.read_bytes() != b"store marker\n"
        or (output_guard_store / "readiness.json").exists()
    ):
        raise ReadinessError("CLI report preflight corrupted an input/store")
    print(f"PASS readiness exit matrix ({len(cases)} cases)")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    inputs = parser.add_mutually_exclusive_group(required=True)
    inputs.add_argument("--manifest", type=Path, help="Evaluate a manifest JSON file")
    inputs.add_argument(
        "--zip", dest="zip_path", type=Path, help="Evaluate a finished ZIP"
    )
    inputs.add_argument(
        "--self-test", action="store_true", help="Run readiness fixtures"
    )
    parser.add_argument(
        "--report", type=Path, help="Also write the JSON report to this path"
    )
    parser.add_argument(
        "--consumer-smoke-report",
        type=Path,
        help=(
            "Persist the freshly self-executed consumer report here when "
            "--consumer-smoke-store is set; without a store the existing file "
            "is recorded only as external unattested metadata"
        ),
    )
    parser.add_argument(
        "--consumer-smoke-store",
        type=Path,
        help="Provisioned store used by the evaluator's repository-pinned smoke runner",
    )
    parser.add_argument(
        "--consumer-smoke-work-dir",
        type=Path,
        help=(
            "Retain the evaluator-verified runner assembly and evidence trees at "
            "this exact non-symlink directory below repository tmp/; requires "
            "--consumer-smoke-store and --zip"
        ),
    )
    parser.add_argument(
        "--expect-status",
        choices=STATUS_VOCABULARY,
        help="Return success only when the exact status is produced (for CI fixtures)",
    )
    parser.add_argument("--compact", action="store_true", help="Print compact JSON")
    args = parser.parse_args()
    if args.self_test and (
        args.report is not None
        or args.consumer_smoke_report is not None
        or args.consumer_smoke_store is not None
        or args.consumer_smoke_work_dir is not None
        or args.expect_status is not None
        or args.compact
    ):
        parser.error("--self-test cannot be combined with report/status/output options")
    if args.consumer_smoke_report is not None and args.zip_path is None:
        parser.error("--consumer-smoke-report requires --zip")
    if args.consumer_smoke_store is not None and args.zip_path is None:
        parser.error("--consumer-smoke-store requires --zip")
    if (
        args.consumer_smoke_work_dir is not None
        and args.consumer_smoke_store is None
    ):
        parser.error("--consumer-smoke-work-dir requires --consumer-smoke-store")
    return args


def main() -> int:
    args = parse_args()
    try:
        if args.self_test:
            run_fixture_suite()
            return EXIT_READY
        kind = "manifest" if args.manifest is not None else "zip"
        path = (args.manifest or args.zip_path).resolve()
        if args.report is not None:
            other_outputs = (
                (args.consumer_smoke_report,)
                if args.consumer_smoke_report is not None
                else ()
            )
            validate_output_disjointness(
                args.report,
                "Readiness report",
                input_zip=path,
                package_store=args.consumer_smoke_store,
                other_outputs=other_outputs,
            )
        if args.consumer_smoke_work_dir is not None and args.report is not None:
            retained_work = validate_consumer_work_directory(
                args.consumer_smoke_work_dir
            )
            readiness_output = Path(os.path.abspath(os.fspath(args.report)))
            if retained_work == readiness_output or retained_work in readiness_output.parents:
                raise ReadinessError(
                    "Readiness report must be outside the retained runner work directory"
                )
        report = evaluate_path(
            path,
            kind,
            args.consumer_smoke_report,
            args.consumer_smoke_store,
            args.consumer_smoke_work_dir,
        )
        output = stable_json(report, pretty=not args.compact)
        if args.report is not None:
            atomic_write_output_bytes(
                args.report,
                output.encode("utf-8"),
                "Readiness report",
            )
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
