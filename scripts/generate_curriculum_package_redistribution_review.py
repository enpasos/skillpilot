#!/usr/bin/env python3
"""Generate and verify the DPK-005 Mathematik redistribution review ledger.

The ledger records provenance evidence and redistribution decisions without
turning provider labels into licenses.  The real release-model resource index,
build-input hashes, repository assets, prompt metadata, and root LICENSE are
all verified locally.  No network access is used.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
import re
import sys
import tempfile
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker


REPO_ROOT = Path(__file__).resolve().parents[1]
CONTRACT_ROOT = REPO_ROOT / "contracts/curriculum-package/v1"
DEFAULT_SCHEMA = CONTRACT_ROOT / "package-redistribution-review.schema.json"
DEFAULT_LEDGER = (
    REPO_ROOT
    / "curricula/DE/Gymnasium/quality/package-redistribution"
    / "de-gymnasium-mathematik-v1.review.json"
)
DEFAULT_RELEASE_ROOT = REPO_ROOT / "tmp/curriculum-release-model/mathematik-a"

SCHEMA_ID = (
    "https://skillpilot.com/schemas/curriculum-package/v1/"
    "package-redistribution-review.schema.json"
)
REVIEW_ID = "de-gymnasium-mathematik-v1"
PACKAGE_ID = "org.skillpilot.curriculum.de.gymnasium.mathematik"
PROFILE_ID = "de-gymnasium-mathematik-release-model-v1"
RESOURCE_INDEX_PATH = "data/resources/resource-index.json"
BUILD_INPUTS_PATH = "metadata/build-inputs.json"
CONFORMANCE_PATH = "metadata/release-model-conformance.json"
CONTENT_INDEX_PATH = "metadata/semantic-content-index.json"
ROOT_LICENSE_PATH = "LICENSE"
TARGET_PROFILE_PATH = "contracts/curriculum-package/v1/profiles/full-standalone-v1.profile.json"
TARGET_PROFILE_ID = "full-standalone-v1"
APACHE_LICENSE_ID = "Apache-2.0"
ROOT_APACHE_LICENSE_BYTES = 10089
ROOT_APACHE_LICENSE_SHA256 = (
    "6bbe4ace8a1818f89b96dfdda9f9d4b9a178bc047c3dc2511a3d93d51f86d7ae"
)
LEGACY_IMAGE_LICENSE_NOTE = "AI-generated, SkillPilot-curated"

PATH_CLASSIFICATION_OVERRIDES: tuple[dict[str, str], ...] = (
    {
        "role": "package-documentation",
        "pathPrefix": "data/assessment-sources/",
        "classId": "skillpilot-data",
        "provenanceClass": "skillpilot-authored",
    },
)

USER_PROVIDED_RE = re.compile(r"user-provided", re.IGNORECASE)
PROMPT_PROVIDER_RE = re.compile(r"^- Provider: (.+)$", re.MULTILINE)
SHA256_RE = re.compile(r"^sha256:[a-f0-9]{64}$")

CLASS_SPECS: tuple[dict[str, Any], ...] = (
    {
        "classId": "skillpilot-data",
        "artifactRoles": [
            "canonical-landscape",
            "card-deck",
            "composition-view",
            "mapping",
            "migration-aliases",
        ],
        "provenanceClass": "skillpilot-authored",
    },
    {
        "classId": "official-source-evidence",
        "artifactRoles": ["source-goal-reference-index", "source-index"],
        "provenanceClass": "official-source-metadata",
    },
    {
        "classId": "software-contracts",
        "artifactRoles": [
            "license",
            "release-profile",
            "schema",
            "schema-catalog",
            "semantic-contract",
        ],
        "provenanceClass": "software-contract",
    },
    {
        "classId": "generated-metadata",
        "artifactRoles": [
            "card-index",
            "composition-view-index",
            "dependency-closure",
            "embedded-goal-dependency",
            "package-documentation",
            "provenance-report",
            "quality-evidence",
            "resource-index",
            "runtime-catalog",
            "semantic-content-index",
            "validation-report",
        ],
        "provenanceClass": "generated-metadata",
    },
)

DECISION_FIELDS = (
    "decisionStatus",
    "redistributionStatus",
    "licenseExpression",
    "reviewer",
    "reviewedAt",
    "reviewEvidence",
)


class ReviewError(RuntimeError):
    """The trusted local input cannot support a redistribution review."""


@dataclass(frozen=True, order=True)
class Diagnostic:
    code: str
    path: str
    message: str


@dataclass(frozen=True)
class SourceModel:
    package_id: str
    content_digest: str
    profile_id: str
    release_id: str
    resource_index_sha256: str
    build_inputs_sha256: str
    target_profile_sha256: str
    target_non_binary_roles: tuple[str, ...]
    root_license: dict[str, Any]
    asset_bases: tuple[dict[str, Any], ...]
    asset_set_sha256: str
    external_resource_count: int


def duplicate_safe_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ReviewError(f"Duplicate JSON object key {key!r}")
        result[key] = value
    return result


def reject_nonfinite(value: str) -> None:
    raise ReviewError(f"Non-finite JSON number {value!r} is forbidden")


def read_json(path: Path) -> Any:
    try:
        raw = path.read_text(encoding="utf-8")
    except OSError as error:
        raise ReviewError(f"Cannot read {path}: {error}") from error
    try:
        return json.loads(
            raw,
            object_pairs_hook=duplicate_safe_object,
            parse_constant=reject_nonfinite,
        )
    except (json.JSONDecodeError, ReviewError) as error:
        raise ReviewError(f"Invalid JSON in {path}: {error}") from error


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    try:
        with path.open("rb") as handle:
            for chunk in iter(lambda: handle.read(1024 * 1024), b""):
                digest.update(chunk)
    except OSError as error:
        raise ReviewError(f"Cannot hash {path}: {error}") from error
    return digest.hexdigest()


def digest(value: Any) -> str:
    payload = json.dumps(
        value,
        ensure_ascii=False,
        allow_nan=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return f"sha256:{sha256_bytes(payload)}"


def require_object(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ReviewError(f"{label} must be an object")
    return value


def require_list(value: Any, label: str) -> list[Any]:
    if not isinstance(value, list):
        raise ReviewError(f"{label} must be an array")
    return value


def repo_file(relative_path: str) -> Path:
    if not isinstance(relative_path, str) or not relative_path or "\\" in relative_path:
        raise ReviewError(f"Unsafe repository path {relative_path!r}")
    unresolved = REPO_ROOT / relative_path
    if unresolved.is_symlink():
        raise ReviewError(f"Repository input must not be a symlink: {relative_path}")
    candidate = unresolved.resolve()
    try:
        candidate.relative_to(REPO_ROOT.resolve())
    except ValueError as error:
        raise ReviewError(f"Repository path escapes the checkout: {relative_path!r}") from error
    if not candidate.is_file() or candidate.is_symlink():
        raise ReviewError(f"Repository input must be a regular non-symlink file: {relative_path}")
    return candidate


def release_file(release_root: Path, relative_path: str) -> Path:
    unresolved = release_root / relative_path
    if unresolved.is_symlink():
        raise ReviewError(f"Release-model input must not be a symlink: {relative_path}")
    candidate = unresolved.resolve()
    try:
        candidate.relative_to(release_root.resolve())
    except ValueError as error:
        raise ReviewError(f"Release-model path escapes its root: {relative_path!r}") from error
    if not candidate.is_file() or candidate.is_symlink():
        raise ReviewError(f"Missing regular release-model file: {relative_path}")
    return candidate


def verify_asset_source(source_path: str, expected_bytes: int, expected_sha256: str) -> None:
    path = repo_file(source_path)
    actual_bytes = path.stat().st_size
    if actual_bytes != expected_bytes:
        raise ReviewError(
            f"Asset byte drift for {source_path}: expected {expected_bytes}, got {actual_bytes}"
        )
    actual_sha256 = sha256_file(path)
    if actual_sha256 != expected_sha256:
        raise ReviewError(
            f"Asset hash drift for {source_path}: expected {expected_sha256}, got {actual_sha256}"
        )


def load_source_model(release_root: Path) -> SourceModel:
    if not release_root.is_dir() or release_root.is_symlink():
        raise ReviewError(f"Release-model root must be a regular directory: {release_root}")

    conformance_path = release_file(release_root, CONFORMANCE_PATH)
    content_index_path = release_file(release_root, CONTENT_INDEX_PATH)
    resource_index_path = release_file(release_root, RESOURCE_INDEX_PATH)
    build_inputs_path = release_file(release_root, BUILD_INPUTS_PATH)

    conformance = require_object(read_json(conformance_path), "release conformance")
    content_index = require_object(read_json(content_index_path), "semantic content index")
    resource_index = require_object(read_json(resource_index_path), "resource index")
    build_inputs = require_object(read_json(build_inputs_path), "build inputs")
    target_profile_path = repo_file(TARGET_PROFILE_PATH)
    target_profile = require_object(read_json(target_profile_path), "target release profile")

    if conformance.get("passed") is not True:
        raise ReviewError("Release-model conformance is not passed")
    package_id = conformance.get("packageId")
    content_digest = conformance.get("contentDigest")
    profile_id = conformance.get("profileId")
    release_id = conformance.get("releaseId")
    if package_id != PACKAGE_ID:
        raise ReviewError(f"Unexpected packageId {package_id!r}")
    if profile_id != PROFILE_ID:
        raise ReviewError(f"Unexpected release-model profile {profile_id!r}")
    if not isinstance(content_digest, str) or not SHA256_RE.fullmatch(content_digest):
        raise ReviewError("Release-model contentDigest is malformed")
    if content_index.get("contentDigest") != content_digest:
        raise ReviewError("Semantic content index and conformance contentDigest differ")
    if not isinstance(release_id, str) or not release_id:
        raise ReviewError("Release-model releaseId is missing")
    if target_profile.get("profileId") != TARGET_PROFILE_ID:
        raise ReviewError(
            f"Unexpected target release profile {target_profile.get('profileId')!r}"
        )
    target_role_items = require_list(target_profile.get("roles"), "target release profile roles")
    target_roles: list[str] = []
    for index, value in enumerate(target_role_items):
        item = require_object(value, f"target release profile roles[{index}]")
        role = item.get("role")
        if not isinstance(role, str) or not role:
            raise ReviewError(f"target release profile roles[{index}] has no role")
        target_roles.append(role)
    duplicate_target_roles = sorted(
        role for role, count in Counter(target_roles).items() if count > 1
    )
    if duplicate_target_roles:
        raise ReviewError(f"Duplicate target package roles: {duplicate_target_roles!r}")
    if "binary-asset" not in target_roles:
        raise ReviewError("Target release profile has no binary-asset role")
    target_non_binary_roles = tuple(sorted(set(target_roles) - {"binary-asset"}))

    resources = require_list(resource_index.get("resources"), "resource index resources")
    embedded = [
        item
        for item in resources
        if isinstance(item, dict)
        and item.get("delivery") == "embedded"
        and item.get("resourceKind") == "goal-visualization"
        and item.get("resourceType") == "image"
    ]
    external_count = sum(
        1 for item in resources if isinstance(item, dict) and item.get("delivery") == "external"
    )
    if len(embedded) + external_count != len(resources):
        raise ReviewError("Resource index contains an unsupported resource class")

    build_binary = require_list(build_inputs.get("binaryResources"), "build binary resources")
    build_by_id: dict[str, dict[str, Any]] = {}
    for index, value in enumerate(build_binary):
        item = require_object(value, f"binaryResources[{index}]")
        resource_id = item.get("resourceId")
        if not isinstance(resource_id, str) or not resource_id:
            raise ReviewError(f"binaryResources[{index}] has no resourceId")
        if resource_id in build_by_id:
            raise ReviewError(f"Duplicate build-input resourceId {resource_id!r}")
        build_by_id[resource_id] = item

    resource_ids = [item.get("resourceId") for item in embedded]
    if not all(isinstance(value, str) and value for value in resource_ids):
        raise ReviewError("Embedded image resourceId is missing")
    duplicate_resource_ids = sorted(
        resource_id for resource_id, count in Counter(resource_ids).items() if count > 1
    )
    if duplicate_resource_ids:
        raise ReviewError(f"Duplicate embedded resource IDs: {duplicate_resource_ids[:5]}")
    if set(resource_ids) != set(build_by_id):
        raise ReviewError("Resource index and build-input binary resource sets differ")

    asset_bases: list[dict[str, Any]] = []
    artifact_paths: set[str] = set()
    for item in embedded:
        resource_id = item["resourceId"]
        owner_goal_id = item.get("ownerGoalId")
        artifact_path = item.get("artifactPath")
        media_type = item.get("mediaType")
        byte_count = item.get("bytes")
        asset_sha256 = item.get("sha256")
        provider = item.get("provider")
        legacy_license_note = item.get("license")
        if not all(
            isinstance(value, str) and value
            for value in (
                owner_goal_id,
                artifact_path,
                media_type,
                asset_sha256,
                provider,
                legacy_license_note,
            )
        ) or not isinstance(byte_count, int):
            raise ReviewError(f"Embedded resource {resource_id!r} is incomplete")
        if artifact_path in artifact_paths:
            raise ReviewError(f"Duplicate embedded artifactPath {artifact_path!r}")
        artifact_paths.add(artifact_path)
        if legacy_license_note != LEGACY_IMAGE_LICENSE_NOTE:
            raise ReviewError(
                f"Unexpected legacy image license/provenance note on {resource_id!r}: "
                f"{legacy_license_note!r}"
            )

        build_item = build_by_id[resource_id]
        expected_build = {
            "artifactPath": artifact_path,
            "bytes": byte_count,
            "resourceId": resource_id,
            "sha256": asset_sha256,
        }
        actual_build = {key: build_item.get(key) for key in expected_build}
        if actual_build != expected_build:
            raise ReviewError(
                f"Resource/build-input mismatch for {resource_id!r}: {actual_build!r}"
            )
        source_path = build_item.get("sourcePath")
        if not isinstance(source_path, str):
            raise ReviewError(f"Build input {resource_id!r} has no sourcePath")
        verify_asset_source(source_path, byte_count, asset_sha256)

        prompt_relative = (
            "curricula/DE/Gymnasium/visualizations/mathematik/"
            f"{owner_goal_id}/prompt.de.md"
        )
        prompt_path = repo_file(prompt_relative)
        prompt_text = prompt_path.read_text(encoding="utf-8")
        provider_match = PROMPT_PROVIDER_RE.search(prompt_text)
        if provider_match is None or provider_match.group(1) != provider:
            raise ReviewError(
                f"Prompt provider metadata differs for resource {resource_id!r}"
            )
        prompt_sha256 = sha256_file(prompt_path)
        user_provided = USER_PROVIDED_RE.search(provider) is not None
        provenance_class = (
            "user-provided-generated-claim" if user_provided else "ai-generated-curated"
        )
        provenance_source = (
            "user-provided-generated-claim"
            if user_provided
            else "provider-pipeline-claim"
        )
        base = {
            "resourceId": resource_id,
            "ownerGoalId": owner_goal_id,
            "artifactPath": artifact_path,
            "mediaType": media_type,
            "bytes": byte_count,
            "assetSha256": f"sha256:{asset_sha256}",
            "provider": provider,
            "legacyLicenseNote": legacy_license_note,
            "provenanceClass": provenance_class,
            "provenanceSource": provenance_source,
            "userProvided": user_provided,
            "promptPath": prompt_relative,
            "promptSha256": f"sha256:{prompt_sha256}",
        }
        base["provenanceFingerprint"] = digest(base)
        asset_bases.append(base)

    asset_bases.sort(key=lambda item: item["resourceId"])
    asset_set_sha256 = digest(
        [
            {
                "resourceId": item["resourceId"],
                "assetSha256": item["assetSha256"],
                "provenanceFingerprint": item["provenanceFingerprint"],
            }
            for item in asset_bases
        ]
    )

    root_license_path = repo_file(ROOT_LICENSE_PATH)
    root_license_bytes = root_license_path.stat().st_size
    root_license_sha256 = sha256_file(root_license_path)
    if (
        root_license_bytes != ROOT_APACHE_LICENSE_BYTES
        or root_license_sha256 != ROOT_APACHE_LICENSE_SHA256
    ):
        raise ReviewError(
            "Root LICENSE bytes differ from the reviewed Apache-2.0 trust anchor"
        )
    root_license = {
        "licenseId": APACHE_LICENSE_ID,
        "path": ROOT_LICENSE_PATH,
        "bytes": root_license_bytes,
        "sha256": f"sha256:{root_license_sha256}",
    }
    return SourceModel(
        package_id=package_id,
        content_digest=content_digest,
        profile_id=profile_id,
        release_id=release_id,
        resource_index_sha256=f"sha256:{sha256_file(resource_index_path)}",
        build_inputs_sha256=f"sha256:{sha256_file(build_inputs_path)}",
        target_profile_sha256=f"sha256:{sha256_file(target_profile_path)}",
        target_non_binary_roles=target_non_binary_roles,
        root_license=root_license,
        asset_bases=tuple(asset_bases),
        asset_set_sha256=asset_set_sha256,
        external_resource_count=external_count,
    )


def pending_decision() -> dict[str, Any]:
    return {
        "decisionStatus": "pending-human-review",
        "redistributionStatus": "review-required",
        "licenseExpression": None,
        "reviewer": None,
        "reviewedAt": None,
        "reviewEvidence": [],
    }


def automatic_apache_decision(root_license: dict[str, Any]) -> dict[str, Any]:
    return {
        "decisionStatus": "automatic-allowed",
        "redistributionStatus": "allowed",
        "licenseExpression": APACHE_LICENSE_ID,
        "reviewer": None,
        "reviewedAt": None,
        "reviewEvidence": [
            {
                "kind": "root-license",
                "reference": root_license["path"],
                "sha256": root_license["sha256"],
            }
        ],
    }


def class_base(spec: dict[str, Any], root_license: dict[str, Any]) -> dict[str, Any]:
    result = copy.deepcopy(spec)
    fingerprint_input: dict[str, Any] = {"class": spec}
    if spec["classId"] == "software-contracts":
        fingerprint_input["automaticLicenseEvidence"] = root_license
    result["classFingerprint"] = digest(fingerprint_input)
    return result


def preserve_decision(
    base: dict[str, Any],
    previous: dict[str, Any] | None,
    fingerprint_field: str,
    fallback: dict[str, Any],
) -> dict[str, Any]:
    result = copy.deepcopy(base)
    if previous is not None and previous.get(fingerprint_field) == base[fingerprint_field]:
        if all(field in previous for field in DECISION_FIELDS):
            result.update({field: copy.deepcopy(previous[field]) for field in DECISION_FIELDS})
            return result
    if previous is not None and previous.get("decisionStatus") in {
        "human-approved",
        "prohibited",
    }:
        raise ReviewError(
            "Completed redistribution decision became stale for "
            f"{base.get('classId') or base.get('resourceId')!r}; review the changed evidence"
        )
    result.update(copy.deepcopy(fallback))
    return result


def derive_summary(review: dict[str, Any], external_resource_count: int) -> dict[str, Any]:
    classes = review.get("classDecisions", [])
    assets = review.get("assetDecisions", [])
    class_counts = Counter(
        item.get("decisionStatus") for item in classes if isinstance(item, dict)
    )
    asset_counts = Counter(
        item.get("decisionStatus") for item in assets if isinstance(item, dict)
    )
    pending_classes = class_counts["pending-human-review"]
    pending_assets = asset_counts["pending-human-review"]
    prohibited_classes = class_counts["prohibited"]
    prohibited_assets = asset_counts["prohibited"]
    publication_ready = (
        pending_classes == 0
        and pending_assets == 0
        and prohibited_classes == 0
        and prohibited_assets == 0
        and all(
            isinstance(item, dict) and item.get("redistributionStatus") == "allowed"
            for item in [*classes, *assets]
        )
    )
    return {
        "classDecisionCount": len(classes),
        "automaticAllowedClassCount": class_counts["automatic-allowed"],
        "pendingClassCount": pending_classes,
        "humanApprovedClassCount": class_counts["human-approved"],
        "prohibitedClassCount": prohibited_classes,
        "assetCount": len(assets),
        "externalResourceCount": external_resource_count,
        "userProvidedAssetCount": sum(
            1 for item in assets if isinstance(item, dict) and item.get("userProvided") is True
        ),
        "pendingAssetCount": pending_assets,
        "humanApprovedAssetCount": asset_counts["human-approved"],
        "prohibitedAssetCount": prohibited_assets,
        "humanReviewItemCount": pending_classes + pending_assets,
        "publicationReady": publication_ready,
    }


def build_review(source: SourceModel, previous: Any | None = None) -> dict[str, Any]:
    previous_object = previous if isinstance(previous, dict) else {}
    previous_classes = {
        item.get("classId"): item
        for item in previous_object.get("classDecisions", [])
        if isinstance(item, dict) and isinstance(item.get("classId"), str)
    }
    class_decisions: list[dict[str, Any]] = []
    for spec in CLASS_SPECS:
        base = class_base(spec, source.root_license)
        fallback = (
            automatic_apache_decision(source.root_license)
            if spec["classId"] == "software-contracts"
            else pending_decision()
        )
        class_decisions.append(
            preserve_decision(
                base,
                previous_classes.get(spec["classId"]),
                "classFingerprint",
                fallback,
            )
        )

    previous_assets = {
        item.get("resourceId"): item
        for item in previous_object.get("assetDecisions", [])
        if isinstance(item, dict) and isinstance(item.get("resourceId"), str)
    }
    asset_decisions = [
        preserve_decision(
            base,
            previous_assets.get(base["resourceId"]),
            "provenanceFingerprint",
            pending_decision(),
        )
        for base in source.asset_bases
    ]
    review: dict[str, Any] = {
        "$schema": SCHEMA_ID,
        "reviewFormatVersion": "1.0",
        "reviewId": REVIEW_ID,
        "packageId": source.package_id,
        "contentDigest": source.content_digest,
        "sourceReleaseModel": {
            "profileId": source.profile_id,
            "releaseId": source.release_id,
            "resourceIndexPath": RESOURCE_INDEX_PATH,
            "resourceIndexSha256": source.resource_index_sha256,
            "buildInputsPath": BUILD_INPUTS_PATH,
            "buildInputsSha256": source.build_inputs_sha256,
        },
        "targetReleaseProfile": {
            "profileId": TARGET_PROFILE_ID,
            "path": TARGET_PROFILE_PATH,
            "sha256": source.target_profile_sha256,
            "nonBinaryRoles": list(source.target_non_binary_roles),
        },
        "rootLicenseEvidence": copy.deepcopy(source.root_license),
        "classDecisions": class_decisions,
        "pathClassificationOverrides": [
            copy.deepcopy(item) for item in PATH_CLASSIFICATION_OVERRIDES
        ],
        "assetSetSha256": source.asset_set_sha256,
        "assetDecisions": asset_decisions,
    }
    review["summary"] = derive_summary(review, source.external_resource_count)
    return review


def schema_diagnostics(review: Any, schema: dict[str, Any]) -> list[Diagnostic]:
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    diagnostics: list[Diagnostic] = []
    for error in sorted(
        validator.iter_errors(review),
        key=lambda item: tuple(str(part) for part in item.absolute_path),
    ):
        path = "/" + "/".join(str(part) for part in error.absolute_path)
        diagnostics.append(Diagnostic("SCHEMA", path, error.message))
    return diagnostics


def evidence_kinds(decision: dict[str, Any]) -> set[str]:
    evidence = decision.get("reviewEvidence")
    if not isinstance(evidence, list):
        return set()
    return {
        item.get("kind")
        for item in evidence
        if isinstance(item, dict) and isinstance(item.get("kind"), str)
    }


def validate_decision_policy(
    decision: dict[str, Any],
    path: str,
    *,
    asset: bool,
    root_license: dict[str, Any],
) -> list[Diagnostic]:
    diagnostics: list[Diagnostic] = []
    status = decision.get("decisionStatus")
    redistribution = decision.get("redistributionStatus")
    expression = decision.get("licenseExpression")
    if status == "pending-human-review":
        expected = {
            "redistributionStatus": "review-required",
            "licenseExpression": None,
            "reviewer": None,
            "reviewedAt": None,
            "reviewEvidence": [],
        }
        actual = {key: decision.get(key) for key in expected}
        if actual != expected:
            diagnostics.append(
                Diagnostic(
                    "PENDING_DECISION_NOT_CLOSED",
                    path,
                    "Pending decisions must remain null/unreviewed and review-required",
                )
            )
        return diagnostics

    if status == "automatic-allowed":
        if asset:
            diagnostics.append(
                Diagnostic(
                    "ASSET_AUTOMATIC_ALLOWED_FORBIDDEN",
                    path,
                    "Binary assets can never be allowed from provider metadata automatically",
                )
            )
            return diagnostics
        expected_evidence = [
            {
                "kind": "root-license",
                "reference": root_license["path"],
                "sha256": root_license["sha256"],
            }
        ]
        if (
            decision.get("classId") != "software-contracts"
            or redistribution != "allowed"
            or expression != APACHE_LICENSE_ID
            or decision.get("reviewer") is not None
            or decision.get("reviewedAt") is not None
            or decision.get("reviewEvidence") != expected_evidence
        ):
            diagnostics.append(
                Diagnostic(
                    "CLASS_AUTOMATIC_POLICY_INVALID",
                    path,
                    "Only software contracts may inherit Apache-2.0 from the exact root LICENSE",
                )
            )
        return diagnostics

    if status == "human-approved":
        if redistribution != "allowed":
            diagnostics.append(
                Diagnostic("ALLOWED_STATUS_MISMATCH", path, "Human approval must be allowed")
            )
        if (
            not isinstance(expression, str)
            or not expression.strip()
            or expression in {"NONE", "NOASSERTION", LEGACY_IMAGE_LICENSE_NOTE}
        ):
            diagnostics.append(
                Diagnostic(
                    "ALLOWED_LICENSE_INVALID",
                    f"{path}/licenseExpression",
                    "An allowed decision needs a concrete license expression",
                )
            )
        kinds = evidence_kinds(decision)
        required_kinds: set[str]
        if asset:
            required_kinds = {"project-license-decision", "provider-terms-review"}
            if decision.get("userProvided") is True:
                required_kinds.add("uploader-rights-attestation")
        else:
            class_id = decision.get("classId")
            required_kinds = (
                {"official-work-legal-review", "project-license-decision"}
                if class_id == "official-source-evidence"
                else {"project-license-decision"}
            )
        missing = sorted(required_kinds - kinds)
        if missing:
            diagnostics.append(
                Diagnostic(
                    "ALLOWED_EVIDENCE_INCOMPLETE",
                    f"{path}/reviewEvidence",
                    f"Missing evidence kinds: {missing}",
                )
            )
        return diagnostics

    if status == "prohibited":
        if redistribution != "prohibited":
            diagnostics.append(
                Diagnostic(
                    "PROHIBITED_STATUS_MISMATCH",
                    path,
                    "A prohibited decision must block redistribution",
                )
            )
        return diagnostics

    diagnostics.append(Diagnostic("DECISION_STATUS_UNKNOWN", path, f"Unknown status {status!r}"))
    return diagnostics


def validate_review(
    review: Any,
    source: SourceModel,
    schema: dict[str, Any],
) -> list[Diagnostic]:
    diagnostics = schema_diagnostics(review, schema)
    if not isinstance(review, dict):
        return sorted(diagnostics)

    expected_identity = {
        "$schema": SCHEMA_ID,
        "reviewFormatVersion": "1.0",
        "reviewId": REVIEW_ID,
        "packageId": source.package_id,
        "contentDigest": source.content_digest,
    }
    for field, expected in expected_identity.items():
        if review.get(field) != expected:
            diagnostics.append(
                Diagnostic(
                    "REVIEW_IDENTITY_MISMATCH",
                    f"/{field}",
                    f"Expected {expected!r}",
                )
            )

    expected_release = {
        "profileId": source.profile_id,
        "releaseId": source.release_id,
        "resourceIndexPath": RESOURCE_INDEX_PATH,
        "resourceIndexSha256": source.resource_index_sha256,
        "buildInputsPath": BUILD_INPUTS_PATH,
        "buildInputsSha256": source.build_inputs_sha256,
    }
    if review.get("sourceReleaseModel") != expected_release:
        diagnostics.append(
            Diagnostic(
                "SOURCE_RELEASE_MODEL_DRIFT",
                "/sourceReleaseModel",
                "Release-model IDs or input hashes differ from the current compiled model",
            )
        )
    expected_target_profile = {
        "profileId": TARGET_PROFILE_ID,
        "path": TARGET_PROFILE_PATH,
        "sha256": source.target_profile_sha256,
        "nonBinaryRoles": list(source.target_non_binary_roles),
    }
    if review.get("targetReleaseProfile") != expected_target_profile:
        diagnostics.append(
            Diagnostic(
                "TARGET_RELEASE_PROFILE_DRIFT",
                "/targetReleaseProfile",
                "Target profile hash or declared non-binary role set changed",
            )
        )
    if review.get("pathClassificationOverrides") != list(PATH_CLASSIFICATION_OVERRIDES):
        diagnostics.append(
            Diagnostic(
                "PATH_CLASSIFICATION_OVERRIDE_DRIFT",
                "/pathClassificationOverrides",
                "Assessment-source path classification must remain explicit and exact",
            )
        )
    if review.get("rootLicenseEvidence") != source.root_license:
        diagnostics.append(
            Diagnostic(
                "ROOT_LICENSE_EVIDENCE_DRIFT",
                "/rootLicenseEvidence",
                "Root LICENSE bytes or SHA-256 changed",
            )
        )
    if review.get("assetSetSha256") != source.asset_set_sha256:
        diagnostics.append(
            Diagnostic(
                "ASSET_SET_DIGEST_DRIFT",
                "/assetSetSha256",
                "Asset/provenance set digest differs from current inputs",
            )
        )

    raw_classes = review.get("classDecisions")
    classes = [item for item in raw_classes if isinstance(item, dict)] if isinstance(raw_classes, list) else []
    class_ids = [item.get("classId") for item in classes]
    for class_id, count in sorted(Counter(class_ids).items(), key=lambda item: str(item[0])):
        if count > 1:
            diagnostics.append(
                Diagnostic(
                    "CLASS_DECISION_DUPLICATE",
                    "/classDecisions",
                    f"Duplicate class decision {class_id!r}",
                )
            )
    expected_class_ids = [spec["classId"] for spec in CLASS_SPECS]
    if class_ids != expected_class_ids:
        diagnostics.append(
            Diagnostic(
                "CLASS_DECISION_COVERAGE_DRIFT",
                "/classDecisions",
                f"Expected class order and coverage {expected_class_ids!r}",
            )
        )
    classes_by_id = {item.get("classId"): item for item in classes}
    for index, spec in enumerate(CLASS_SPECS):
        item = classes_by_id.get(spec["classId"])
        if item is None:
            continue
        base = class_base(spec, source.root_license)
        for field, expected in base.items():
            if item.get(field) != expected:
                diagnostics.append(
                    Diagnostic(
                        "CLASS_DEFINITION_DRIFT",
                        f"/classDecisions/{index}/{field}",
                        f"Expected {expected!r}",
                    )
                )
        diagnostics.extend(
            validate_decision_policy(
                item,
                f"/classDecisions/{index}",
                asset=False,
                root_license=source.root_license,
            )
        )

    role_owners: dict[str, list[str]] = {}
    for item in classes:
        class_id = item.get("classId")
        roles = item.get("artifactRoles")
        if not isinstance(class_id, str) or not isinstance(roles, list):
            continue
        for role in roles:
            if isinstance(role, str):
                role_owners.setdefault(role, []).append(class_id)
    expected_role_set = set(source.target_non_binary_roles)
    actual_role_set = set(role_owners)
    missing_roles = sorted(expected_role_set - actual_role_set)
    unknown_roles = sorted(actual_role_set - expected_role_set)
    duplicate_role_owners = {
        role: owners for role, owners in sorted(role_owners.items()) if len(owners) != 1
    }
    if missing_roles or unknown_roles or duplicate_role_owners:
        diagnostics.append(
            Diagnostic(
                "CLASS_ROLE_COVERAGE_DRIFT",
                "/classDecisions",
                "Non-binary target roles must have one default class; "
                f"missing={missing_roles}, unknown={unknown_roles}, "
                f"duplicates={duplicate_role_owners}",
            )
        )

    raw_assets = review.get("assetDecisions")
    assets = [item for item in raw_assets if isinstance(item, dict)] if isinstance(raw_assets, list) else []
    resource_ids = [item.get("resourceId") for item in assets]
    for resource_id, count in sorted(Counter(resource_ids).items(), key=lambda item: str(item[0])):
        if count > 1:
            diagnostics.append(
                Diagnostic(
                    "ASSET_RESOURCE_DUPLICATE",
                    "/assetDecisions",
                    f"Duplicate resourceId {resource_id!r}",
                )
            )
    artifact_paths = [item.get("artifactPath") for item in assets]
    for artifact_path, count in sorted(Counter(artifact_paths).items(), key=lambda item: str(item[0])):
        if count > 1:
            diagnostics.append(
                Diagnostic(
                    "ASSET_PATH_DUPLICATE",
                    "/assetDecisions",
                    f"Duplicate artifactPath {artifact_path!r}",
                )
            )

    expected_by_id = {item["resourceId"]: item for item in source.asset_bases}
    actual_by_id = {
        item["resourceId"]: item
        for item in assets
        if isinstance(item.get("resourceId"), str)
    }
    missing_ids = sorted(set(expected_by_id) - set(actual_by_id))
    obsolete_ids = sorted(set(actual_by_id) - set(expected_by_id))
    if missing_ids:
        diagnostics.append(
            Diagnostic(
                "ASSET_DECISION_MISSING",
                "/assetDecisions",
                f"Missing {len(missing_ids)} current assets; first={missing_ids[:5]!r}",
            )
        )
    if obsolete_ids:
        diagnostics.append(
            Diagnostic(
                "ASSET_DECISION_OBSOLETE",
                "/assetDecisions",
                f"Found {len(obsolete_ids)} obsolete assets; first={obsolete_ids[:5]!r}",
            )
        )
    expected_order = sorted(expected_by_id)
    if resource_ids != expected_order:
        diagnostics.append(
            Diagnostic(
                "ASSET_DECISION_ORDER_DRIFT",
                "/assetDecisions",
                "Asset decisions must be sorted by current resourceId",
            )
        )

    field_codes = {
        "assetSha256": "ASSET_HASH_DRIFT",
        "provider": "ASSET_PROVIDER_DRIFT",
        "provenanceClass": "ASSET_PROVENANCE_DRIFT",
        "provenanceSource": "ASSET_PROVENANCE_DRIFT",
        "userProvided": "ASSET_PROVENANCE_DRIFT",
        "promptSha256": "ASSET_PROVENANCE_DRIFT",
        "provenanceFingerprint": "ASSET_PROVENANCE_DRIFT",
    }
    for resource_id in sorted(set(expected_by_id) & set(actual_by_id)):
        expected = expected_by_id[resource_id]
        actual = actual_by_id[resource_id]
        index = resource_ids.index(resource_id)
        for field, expected_value in expected.items():
            if actual.get(field) != expected_value:
                diagnostics.append(
                    Diagnostic(
                        field_codes.get(field, "ASSET_DEFINITION_DRIFT"),
                        f"/assetDecisions/{index}/{field}",
                        f"Expected current value {expected_value!r}",
                    )
                )
        diagnostics.extend(
            validate_decision_policy(
                actual,
                f"/assetDecisions/{index}",
                asset=True,
                root_license=source.root_license,
            )
        )

    expected_summary = derive_summary(review, source.external_resource_count)
    if review.get("summary") != expected_summary:
        diagnostics.append(
            Diagnostic(
                "SUMMARY_DRIFT",
                "/summary",
                f"Expected derived summary {expected_summary!r}",
            )
        )
    return sorted(set(diagnostics))


def print_summary(review: dict[str, Any]) -> None:
    summary = review["summary"]
    print(
        "Redistribution review: "
        f"{review['packageId']} {review['contentDigest']}"
    )
    print(
        "Classes: "
        f"{summary['classDecisionCount']} total, "
        f"{summary['automaticAllowedClassCount']} automatic Apache-2.0, "
        f"{summary['pendingClassCount']} pending, "
        f"{summary['prohibitedClassCount']} prohibited"
    )
    print(
        "Images: "
        f"{summary['assetCount']} total, "
        f"{summary['pendingAssetCount']} pending, "
        f"{summary['userProvidedAssetCount']} user-provided claims, "
        f"{summary['prohibitedAssetCount']} prohibited"
    )
    print(
        f"External metadata-only resources: {summary['externalResourceCount']}; "
        f"human review items: {summary['humanReviewItemCount']}"
    )
    print(
        "Publication redistribution: "
        + ("READY" if summary["publicationReady"] else "BLOCKED")
    )


def write_json_atomic(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.is_symlink():
        raise ReviewError(f"Refusing to replace symlink ledger {path}")
    payload = (
        json.dumps(
            value,
            ensure_ascii=False,
            allow_nan=False,
            indent=2,
            sort_keys=True,
        )
        + "\n"
    )
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{path.name}.", suffix=".tmp", dir=path.parent
    )
    temporary_path = Path(temporary_name)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary_path, path)
    finally:
        if temporary_path.exists():
            temporary_path.unlink()


def run_self_test(
    review: dict[str, Any], source: SourceModel, schema: dict[str, Any]
) -> None:
    baseline = validate_review(review, source, schema)
    if baseline:
        raise ReviewError(
            "Self-test baseline is invalid: "
            + "; ".join(f"{item.code} {item.path}" for item in baseline[:10])
        )

    cases: list[tuple[str, str, Any]] = []

    def case(name: str, expected_code: str, mutation: Any) -> None:
        cases.append((name, expected_code, mutation))

    case(
        "duplicate-asset",
        "ASSET_RESOURCE_DUPLICATE",
        lambda value: value["assetDecisions"].append(copy.deepcopy(value["assetDecisions"][0])),
    )
    case(
        "missing-asset",
        "ASSET_DECISION_MISSING",
        lambda value: value["assetDecisions"].pop(),
    )

    def obsolete(value: dict[str, Any]) -> None:
        value["assetDecisions"][0]["resourceId"] = "goal-resource:obsolete:0"

    case("obsolete-asset", "ASSET_DECISION_OBSOLETE", obsolete)
    case(
        "asset-hash-drift",
        "ASSET_HASH_DRIFT",
        lambda value: value["assetDecisions"][0].update(
            {"assetSha256": f"sha256:{'0' * 64}"}
        ),
    )
    case(
        "provider-drift",
        "ASSET_PROVIDER_DRIFT",
        lambda value: value["assetDecisions"][0].update({"provider": "unknown provider"}),
    )
    case(
        "prompt-evidence-drift",
        "ASSET_PROVENANCE_DRIFT",
        lambda value: value["assetDecisions"][0].update(
            {"promptSha256": f"sha256:{'0' * 64}"}
        ),
    )
    user_index = next(
        index
        for index, item in enumerate(review["assetDecisions"])
        if item["userProvided"] is True
    )
    case(
        "user-provenance-erased",
        "ASSET_PROVENANCE_DRIFT",
        lambda value: value["assetDecisions"][user_index].update(
            {
                "userProvided": False,
                "provenanceClass": "ai-generated-curated",
                "provenanceSource": "provider-pipeline-claim",
            }
        ),
    )

    def unsupported_allowed(value: dict[str, Any]) -> None:
        item = value["assetDecisions"][0]
        item.update(
            {
                "decisionStatus": "human-approved",
                "redistributionStatus": "allowed",
                "licenseExpression": "Apache-2.0",
                "reviewer": "fixture-reviewer",
                "reviewedAt": "2026-07-11T00:00:00Z",
                "reviewEvidence": [
                    {
                        "kind": "project-license-decision",
                        "reference": "fixture",
                        "sha256": None,
                    }
                ],
            }
        )

    case("allowed-without-provider-review", "ALLOWED_EVIDENCE_INCOMPLETE", unsupported_allowed)

    def automatic_asset(value: dict[str, Any]) -> None:
        item = value["assetDecisions"][0]
        item.update(automatic_apache_decision(source.root_license))

    case("automatic-asset-license", "ASSET_AUTOMATIC_ALLOWED_FORBIDDEN", automatic_asset)
    case(
        "content-digest-drift",
        "REVIEW_IDENTITY_MISMATCH",
        lambda value: value.update({"contentDigest": f"sha256:{'0' * 64}"}),
    )
    case(
        "root-license-drift",
        "ROOT_LICENSE_EVIDENCE_DRIFT",
        lambda value: value["rootLicenseEvidence"].update(
            {"sha256": f"sha256:{'0' * 64}"}
        ),
    )
    case(
        "asset-order-drift",
        "ASSET_DECISION_ORDER_DRIFT",
        lambda value: value["assetDecisions"].__setitem__(
            slice(0, 2), list(reversed(value["assetDecisions"][:2]))
        ),
    )

    def unauthorized_automatic_class(value: dict[str, Any]) -> None:
        item = value["classDecisions"][0]
        item.update(automatic_apache_decision(source.root_license))

    case(
        "unauthorized-automatic-class",
        "CLASS_AUTOMATIC_POLICY_INVALID",
        unauthorized_automatic_class,
    )

    def missing_class_role(value: dict[str, Any]) -> None:
        value["classDecisions"][2]["artifactRoles"].remove("semantic-contract")

    case("missing-class-role", "CLASS_ROLE_COVERAGE_DRIFT", missing_class_role)
    case(
        "target-profile-drift",
        "TARGET_RELEASE_PROFILE_DRIFT",
        lambda value: value["targetReleaseProfile"].update(
            {"sha256": f"sha256:{'0' * 64}"}
        ),
    )
    case(
        "assessment-path-override-removed",
        "PATH_CLASSIFICATION_OVERRIDE_DRIFT",
        lambda value: value["pathClassificationOverrides"].clear(),
    )
    case(
        "summary-overclaim",
        "SUMMARY_DRIFT",
        lambda value: value["summary"].update({"publicationReady": True}),
    )

    stale_completed = copy.deepcopy(review["assetDecisions"][0])
    stale_completed["decisionStatus"] = "human-approved"
    stale_completed["provenanceFingerprint"] = f"sha256:{'0' * 64}"
    try:
        preserve_decision(
            {
                key: value
                for key, value in review["assetDecisions"][0].items()
                if key not in DECISION_FIELDS
            },
            stale_completed,
            "provenanceFingerprint",
            pending_decision(),
        )
    except ReviewError:
        pass
    else:
        raise ReviewError("Self-test failed to reject a stale completed redistribution review")

    for name, expected_code, mutation in cases:
        candidate = copy.deepcopy(review)
        mutation(candidate)
        diagnostics = validate_review(candidate, source, schema)
        codes = {item.code for item in diagnostics}
        if expected_code not in codes:
            raise ReviewError(
                f"Self-test {name!r} missed {expected_code}; got {sorted(codes)}"
            )
    print(
        "Redistribution review self-test passed: "
        f"{len(cases)} fail-closed mutations and stale completed-review guard"
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    action = parser.add_mutually_exclusive_group(required=True)
    action.add_argument("--generate", action="store_true", help="Generate or refresh the ledger")
    action.add_argument("--check", action="store_true", help="Validate the committed ledger")
    action.add_argument("--self-test", action="store_true", help="Run mutation tests")
    parser.add_argument(
        "--release-root",
        type=Path,
        default=DEFAULT_RELEASE_ROOT,
        help="Compiled DPK-004 release-model directory",
    )
    parser.add_argument(
        "--ledger", type=Path, default=DEFAULT_LEDGER, help="Review ledger path"
    )
    parser.add_argument(
        "--schema", type=Path, default=DEFAULT_SCHEMA, help="Trusted review schema"
    )
    args = parser.parse_args()

    try:
        schema = require_object(read_json(args.schema), "redistribution review schema")
        Draft202012Validator.check_schema(schema)
        source = load_source_model(args.release_root)
        if args.generate:
            previous = read_json(args.ledger) if args.ledger.exists() else None
            review = build_review(source, previous)
            diagnostics = validate_review(review, source, schema)
            if diagnostics:
                for item in diagnostics:
                    print(f"[{item.code}] {item.path}: {item.message}", file=sys.stderr)
                raise ReviewError("Refusing to write an invalid redistribution review")
            write_json_atomic(args.ledger, review)
            print(f"Wrote {args.ledger.relative_to(REPO_ROOT)}")
            print_summary(review)
            return 0

        review = require_object(read_json(args.ledger), "redistribution review ledger")
        if args.self_test:
            run_self_test(review, source, schema)
            return 0
        diagnostics = validate_review(review, source, schema)
        if diagnostics:
            for item in diagnostics:
                print(f"[{item.code}] {item.path}: {item.message}", file=sys.stderr)
            return 1
        print_summary(review)
        print("Redistribution review ledger is current and internally consistent.")
        return 0
    except (ReviewError, OSError, ValueError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
