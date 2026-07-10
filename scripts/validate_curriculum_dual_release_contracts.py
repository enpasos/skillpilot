#!/usr/bin/env python3
"""Validate DPK-003 field semantics, normal form, equivalence, and dual-release contracts."""

from __future__ import annotations

import copy
import hashlib
import json
import math
import sys
from collections import Counter
from dataclasses import dataclass
from importlib.metadata import version as distribution_version
from pathlib import Path
from typing import Any, Callable

from jsonschema import Draft202012Validator, FormatChecker


sys.dont_write_bytecode = True

REPO_ROOT = Path(__file__).resolve().parents[1]
CONTRACT_ROOT = REPO_ROOT / "contracts" / "curriculum-package" / "v1"
FIXTURE_ROOT = CONTRACT_ROOT / "fixtures" / "dual-release" / "valid"
JSONSCHEMA_VERSION = "4.26.0"
MAX_JSON_BYTES = 32 * 1024 * 1024

FILES = {
    "registry_schema": CONTRACT_ROOT / "field-semantics-registry.schema.json",
    "normalization_schema": CONTRACT_ROOT / "semantic-normalization-profile.schema.json",
    "content_index_schema": CONTRACT_ROOT / "semantic-content-index.schema.json",
    "release_schema": CONTRACT_ROOT / "dual-release-index.schema.json",
    "equivalence_schema": CONTRACT_ROOT / "equivalence-report.schema.json",
    "package_manifest_schema": CONTRACT_ROOT / "package-manifest.schema.json",
    "registry": CONTRACT_ROOT / "profiles" / "skillpilot-fwu-field-semantics-v1.registry.json",
    "normalization": CONTRACT_ROOT / "profiles" / "semantic-normal-form-v1.profile.json",
    "content_index": FIXTURE_ROOT / "semantic-content-index.json",
    "release": FIXTURE_ROOT / "release.json",
    "equivalence": FIXTURE_ROOT / "equivalence.json",
}

SCHEMA_IDS = {
    "registry_schema": "https://skillpilot.com/schemas/curriculum-package/v1/field-semantics-registry.schema.json",
    "normalization_schema": "https://skillpilot.com/schemas/curriculum-package/v1/semantic-normalization-profile.schema.json",
    "content_index_schema": "https://skillpilot.com/schemas/curriculum-package/v1/semantic-content-index.schema.json",
    "release_schema": "https://skillpilot.com/schemas/curriculum-package/v1/dual-release-index.schema.json",
    "equivalence_schema": "https://skillpilot.com/schemas/curriculum-package/v1/equivalence-report.schema.json",
    "package_manifest_schema": "https://skillpilot.com/schemas/curriculum-package/v1/package-manifest.schema.json",
}

REGISTRY_BINDING_ID = (
    "https://skillpilot.com/contracts/curriculum-package/v1/"
    "skillpilot-fwu-field-semantics-v1.registry.json"
)
NORMALIZATION_BINDING_ID = (
    "https://skillpilot.com/contracts/curriculum-package/v1/semantic-normal-form-v1.profile.json"
)
REQUIRED_TOOL_ROLES = {
    "json-package-validator",
    "ontology-exporter",
    "ontology-validator",
    "reverse-compiler",
    "semantic-normalizer",
    "equivalence-comparator",
    "consumer-smoke-test",
    "reproducibility-runner",
}
ORDERED_PATHS = {
    ("canonical-landscape", "/goals"),
    ("canonical-landscape", "/goals/*/contains"),
    ("canonical-landscape", "/goals/*/requires"),
    ("canonical-landscape", "/goals/*/resourceLinks"),
    ("canonical-landscape", "/goals/*/examData/scoring/steps"),
    ("composition-view", "/rootNodes"),
    ("composition-view", "/rootNodes/**/children"),
    ("card-deck", "/cards"),
}


class ContractError(RuntimeError):
    """Trusted contract or fixture cannot be read unambiguously."""


@dataclass(frozen=True, order=True)
class Diagnostic:
    code: str
    location: str
    message: str


def strict_json_loads(raw: bytes, source: str) -> Any:
    if len(raw) > MAX_JSON_BYTES:
        raise ContractError(f"JSON exceeds {MAX_JSON_BYTES} bytes: {source}")

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
        validate_json_scalars(value, source)
        return value
    except ContractError:
        raise
    except (UnicodeError, json.JSONDecodeError) as error:
        raise ContractError(f"Cannot parse {source}: {error}") from error


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
                raise ContractError(f"XML/RDF-unsafe control character in {source}")
    elif isinstance(value, dict):
        for key, child in value.items():
            validate_json_scalars(key, source)
            validate_json_scalars(child, source)
    elif isinstance(value, list):
        for child in value:
            validate_json_scalars(child, source)


def load_json(path: Path) -> Any:
    try:
        return strict_json_loads(path.read_bytes(), str(path))
    except OSError as error:
        raise ContractError(f"Cannot read {path}: {error}") from error


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def canonical_json_bytes(value: Any) -> bytes:
    return json.dumps(
        value,
        ensure_ascii=False,
        allow_nan=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")


def frame(value: str) -> bytes:
    raw = value.encode("utf-8")
    return len(raw).to_bytes(8, "big") + raw


def schema_diagnostics(
    value: Any,
    validator: Draft202012Validator,
    code: str,
) -> list[Diagnostic]:
    diagnostics: list[Diagnostic] = []
    errors = sorted(
        validator.iter_errors(value),
        key=lambda entry: tuple(str(part) for part in entry.absolute_path),
    )
    for error in errors:
        location = "/" + "/".join(str(part) for part in error.absolute_path)
        diagnostics.append(Diagnostic(code, location, error.message))
    return diagnostics


def duplicate_positions(values: list[Any]) -> dict[Any, list[int]]:
    positions: dict[Any, list[int]] = {}
    for index, value in enumerate(values):
        positions.setdefault(value, []).append(index)
    return {value: found for value, found in positions.items() if len(found) > 1}


def compact_iris(value: Any) -> list[str]:
    result: list[str] = []
    if isinstance(value, dict):
        for key, child in value.items():
            if key in {
                "predicate",
                "datatype",
                "resourceClass",
                "membershipClass",
                "ownerPredicate",
                "valuePredicate",
                "positionPredicate",
                "coreProjectionPredicate",
            } and isinstance(child, str) and ":" in child:
                result.append(child)
            result.extend(compact_iris(child))
    elif isinstance(value, list):
        for child in value:
            result.extend(compact_iris(child))
    return result


def pattern_segments(pattern: str) -> tuple[str, ...]:
    segments = pattern.split("/")[1:]
    decoded: list[str] = []
    for segment in segments:
        if "*" in segment and segment not in {"*", "**"}:
            raise ValueError("wildcards must occupy a complete path segment")
        decoded.append(segment.replace("~1", "/").replace("~0", "~"))
    return tuple(decoded)


def pattern_specificity(pattern: tuple[str, ...]) -> tuple[int, int, int]:
    return (
        sum(segment not in {"*", "**"} for segment in pattern),
        -sum(segment == "**" for segment in pattern),
        len(pattern),
    )


def patterns_overlap(left: tuple[str, ...], right: tuple[str, ...]) -> bool:
    memo: dict[tuple[int, int], bool] = {}
    visiting: set[tuple[int, int]] = set()

    def visit(left_index: int, right_index: int) -> bool:
        state = (left_index, right_index)
        if state in memo:
            return memo[state]
        if state in visiting:
            return False
        visiting.add(state)
        if left_index == len(left) and right_index == len(right):
            result = True
        elif left_index < len(left) and left[left_index] == "**":
            result = visit(left_index + 1, right_index)
            if not result and right_index < len(right):
                if right[right_index] == "**":
                    result = visit(left_index, right_index + 1)
                else:
                    result = visit(left_index, right_index + 1)
        elif right_index < len(right) and right[right_index] == "**":
            result = visit(left_index, right_index + 1)
            if not result and left_index < len(left):
                result = visit(left_index + 1, right_index)
        elif left_index == len(left) or right_index == len(right):
            result = False
        else:
            left_segment = left[left_index]
            right_segment = right[right_index]
            compatible = (
                left_segment == "*"
                or right_segment == "*"
                or left_segment == right_segment
            )
            result = compatible and visit(left_index + 1, right_index + 1)
        visiting.remove(state)
        memo[state] = result
        return result

    return visit(0, 0)


def validate_registry(
    registry: Any,
    validator: Draft202012Validator,
    normalization: Any,
) -> list[Diagnostic]:
    diagnostics = schema_diagnostics(registry, validator, "REGISTRY_SCHEMA")
    if not isinstance(registry, dict):
        return sorted(diagnostics)
    entries = [entry for entry in registry.get("entries", []) if isinstance(entry, dict)]
    ids = [entry.get("entryId") for entry in entries]
    keys = [(entry.get("artifactRole"), entry.get("pathPattern")) for entry in entries]
    for value, positions in duplicate_positions(ids).items():
        diagnostics.append(
            Diagnostic("REGISTRY_ENTRY_ID_DUPLICATE", "/entries", f"{value!r} at {positions}")
        )
    for value, positions in duplicate_positions(keys).items():
        diagnostics.append(
            Diagnostic("REGISTRY_PATH_DUPLICATE", "/entries", f"{value!r} at {positions}")
        )
    parsed_patterns: list[tuple[int, str, tuple[str, ...]]] = []
    for index, entry in enumerate(entries):
        role = entry.get("artifactRole")
        path_pattern = entry.get("pathPattern")
        if not isinstance(role, str) or not isinstance(path_pattern, str):
            continue
        try:
            parsed_patterns.append((index, role, pattern_segments(path_pattern)))
        except ValueError as error:
            diagnostics.append(
                Diagnostic("REGISTRY_PATH_PATTERN_INVALID", f"/entries/{index}/pathPattern", str(error))
            )
    for left_position, (left_index, left_role, left_pattern) in enumerate(parsed_patterns):
        for right_index, right_role, right_pattern in parsed_patterns[left_position + 1 :]:
            if left_role != right_role:
                continue
            if (
                pattern_specificity(left_pattern) == pattern_specificity(right_pattern)
                and patterns_overlap(left_pattern, right_pattern)
            ):
                diagnostics.append(
                    Diagnostic(
                        "REGISTRY_PATH_AMBIGUOUS",
                        f"/entries/{left_index}/pathPattern",
                        f"Overlaps equal-specificity pattern at /entries/{right_index}/pathPattern",
                    )
                )
    pattern_by_index = {index: (role, pattern) for index, role, pattern in parsed_patterns}
    for parent_index, parent_entry in enumerate(entries):
        mapping = parent_entry.get("rdfMapping")
        literal = mapping.get("canonicalJsonLiteral") if isinstance(mapping, dict) else None
        if not isinstance(literal, dict):
            continue
        parent_data = pattern_by_index.get(parent_index)
        if parent_data is None:
            continue
        parent_role, parent_pattern = parent_data
        descendant_pattern = (*parent_pattern, "**", "*")
        descendants = [
            child_index
            for child_index, child_role, child_pattern in parsed_patterns
            if child_index != parent_index
            and child_role == parent_role
            and patterns_overlap(descendant_pattern, child_pattern)
        ]
        if descendants and literal.get("subtreeProjection") != "exclude-more-specific-descendants":
            diagnostics.append(
                Diagnostic(
                    "REGISTRY_JSON_LITERAL_DESCENDANT_CONFLICT",
                    f"/entries/{parent_index}/rdfMapping/canonicalJsonLiteral/subtreeProjection",
                    f"Complete JSON subtree overlaps mapped descendants {descendants}",
                )
            )

    compatibility = registry.get("compatibility")
    if isinstance(compatibility, dict) and isinstance(normalization, dict):
        expected = (normalization.get("profileId"), normalization.get("version"))
        actual = (
            compatibility.get("normalizationProfileId"),
            compatibility.get("normalizationProfileVersion"),
        )
        if actual != expected:
            diagnostics.append(
                Diagnostic(
                    "REGISTRY_NORMALIZATION_MISMATCH",
                    "/compatibility",
                    f"Expected normalization profile {expected!r}, found {actual!r}",
                )
            )

    namespaces = registry.get("namespaceBindings")
    known_prefixes = set(namespaces) if isinstance(namespaces, dict) else set()
    for index, entry in enumerate(entries):
        entry_id = entry.get("entryId")
        role_path = (entry.get("artifactRole"), entry.get("pathPattern"))
        classification = entry.get("classification")
        mapping = entry.get("rdfMapping")
        reverse = entry.get("reverseMapping")
        normalization_rules = entry.get("normalization")
        cardinality = entry.get("cardinality")
        presence = entry.get("presenceSemantics")
        location = f"/entries/{index}"

        if role_path in ORDERED_PATHS and classification != "ordered-list":
            diagnostics.append(
                Diagnostic(
                    "REGISTRY_OBSERVABLE_ORDER_LOST",
                    f"{location}/classification",
                    f"{role_path!r} must remain an ordered list",
                )
            )
        if classification == "ordered-list":
            if not isinstance(normalization_rules, dict) or normalization_rules.get("arrayOrder") != "preserve":
                diagnostics.append(
                    Diagnostic("REGISTRY_ORDER_NORMALIZATION", f"{location}/normalization", "Order must be preserved")
                )
            if not isinstance(reverse, dict) or not (
                reverse.get("mode") == "ordered-memberships"
                and
                reverse.get("requireUniquePositions") is True
                and reverse.get("requireContiguousPositions") is True
            ):
                diagnostics.append(
                    Diagnostic("REGISTRY_REVERSE_POSITIONS", f"{location}/reverseMapping", "Positions must be unique and contiguous")
                )
            construction = mapping.get("construction") if isinstance(mapping, dict) else None
            if not isinstance(construction, dict) or construction.get("objectMapping") not in {
                "positioned-membership",
                "rdf-list",
            }:
                diagnostics.append(
                    Diagnostic("REGISTRY_RDF_ORDER_ENCODING", f"{location}/rdfMapping", "RDF must encode list order explicitly")
                )
        if classification == "set":
            if not isinstance(normalization_rules, dict) or not normalization_rules.get("setSortKey"):
                diagnostics.append(
                    Diagnostic("REGISTRY_SET_SORT_KEY", f"{location}/normalization", "Set needs a deterministic sort key")
                )

        if isinstance(cardinality, dict):
            minimum = cardinality.get("minItems")
            maximum = cardinality.get("maxItems")
            if isinstance(minimum, int) and isinstance(maximum, int) and maximum < minimum:
                diagnostics.append(
                    Diagnostic("REGISTRY_CARDINALITY_RANGE", f"{location}/cardinality", "maxItems is smaller than minItems")
                )
        if isinstance(presence, dict):
            missing = presence.get("missing")
            null = presence.get("null")
            default = presence.get("default")
            if (missing == "equivalent-to-null") != (null == "equivalent-to-missing"):
                diagnostics.append(
                    Diagnostic("REGISTRY_PRESENCE_ASYMMETRIC", f"{location}/presenceSemantics", "Missing/null equivalence must be symmetric")
                )
            if (
                missing == "equivalent-to-default"
                or null == "equivalent-to-default"
                or presence.get("empty") == "equivalent-to-default"
            ) and (not isinstance(default, dict) or default.get("mode") != "explicit"):
                diagnostics.append(
                    Diagnostic("REGISTRY_DEFAULT_UNDEFINED", f"{location}/presenceSemantics/default", "Default equivalence needs an explicit value")
                )

        if isinstance(mapping, dict) and mapping.get("strategy") == "registered-canonical-json-literal":
            literal = mapping.get("canonicalJsonLiteral")
            if not isinstance(literal, dict) or not literal.get("coreGap"):
                diagnostics.append(
                    Diagnostic("REGISTRY_JSON_LITERAL_CORE_GAP", f"{location}/rdfMapping", "Canonical JSON needs a concrete Core gap")
                )
            try:
                literal_segments = pattern_segments(str(entry.get("pathPattern")))
            except ValueError:
                literal_segments = ()
            if (
                len(literal_segments) < 3
                or "*" not in literal_segments[:-1]
                or literal_segments[-1] in {"*", "**"}
            ):
                diagnostics.append(
                    Diagnostic("REGISTRY_JSON_LITERAL_TOO_BROAD", f"{location}/pathPattern", "Canonical JSON cannot carry a complete package or landscape")
                )
            if isinstance(literal, dict) and literal.get("subtreeProjection") == "exclude-more-specific-descendants":
                if not isinstance(reverse, dict) or reverse.get("mergePolicy") != "merge-more-specific-descendants-reject-conflicts":
                    diagnostics.append(
                        Diagnostic("REGISTRY_JSON_LITERAL_MERGE_UNSAFE", f"{location}/reverseMapping", "Excluded descendants need a conflict-rejecting merge")
                    )
        if isinstance(mapping, dict) and mapping.get("strategy") != "excluded-generated":
            if not isinstance(reverse, dict) or reverse.get("roundtrip") != "exact":
                diagnostics.append(
                    Diagnostic("REGISTRY_REVERSE_NOT_EXACT", f"{location}/reverseMapping", f"{entry_id!r} is not exactly reversible")
                )

        for compact_iri in compact_iris(mapping):
            prefix = compact_iri.split(":", 1)[0]
            if prefix not in known_prefixes:
                diagnostics.append(
                    Diagnostic("REGISTRY_NAMESPACE_UNKNOWN", f"{location}/rdfMapping", f"Unknown prefix {prefix!r}")
                )

    by_key = {(entry.get("artifactRole"), entry.get("pathPattern")): entry for entry in entries}
    for role_path in sorted(ORDERED_PATHS):
        if role_path not in by_key:
            diagnostics.append(
                Diagnostic("REGISTRY_REQUIRED_FIELD_MISSING", "/entries", f"Missing {role_path!r}")
            )
    for path in ("/goals/*/title", "/goals/*/description"):
        entry = by_key.get(("canonical-landscape", path))
        mapping = entry.get("rdfMapping", {}) if isinstance(entry, dict) else {}
        construction = mapping.get("construction", {}) if isinstance(mapping, dict) else {}
        fallback = mapping.get("fallbackConstruction", {}) if isinstance(mapping, dict) else {}
        expected_owner = "lp:LP_0030056" if path.endswith("title") else "lp:LP_0030051"
        expected_fallback = "rdfs:label" if path.endswith("title") else "dcterms:description"
        if not (
            isinstance(entry, dict)
            and mapping.get("strategy") == "fwu-core"
            and construction.get("condition") == "curricular-goal"
            and construction.get("ownerPredicate") == expected_owner
            and fallback.get("condition") == "non-curricular-or-unscoped-goal"
            and fallback.get("predicate") == expected_fallback
        ):
            diagnostics.append(
                Diagnostic("REGISTRY_CORE_TEXT_NOT_USED", "/entries", f"{path} must use FWU Core text entities")
            )
    requires_entry = by_key.get(("canonical-landscape", "/goals/*/requires"))
    requires_mapping = requires_entry.get("rdfMapping", {}) if isinstance(requires_entry, dict) else {}
    requires_construction = requires_mapping.get("construction", {}) if isinstance(requires_mapping, dict) else {}
    requires_membership = requires_construction.get("membership", {}) if isinstance(requires_construction, dict) else {}
    expected_projection = {
        "mode": "reified-reference",
        "condition": "curricular-source-and-target",
        "ownerPredicate": "lp:LP_0030071",
        "valuePredicate": "lp:LP_0030072",
        "resourceClass": "lp:LP_0000554",
    }
    if not (
        requires_mapping.get("strategy") == "skillpilot-profile"
        and requires_membership.get("valuePredicate") == "sp:requiredGoal"
        and requires_membership.get("coreProjection") == expected_projection
    ):
        diagnostics.append(
            Diagnostic("REGISTRY_CORE_PREREQUISITE_INCOMPLETE", "/entries", "Requires needs a runtime-safe positioned edge and conditional LP_0000554 projection")
        )
    expected_membership_projections = {
        ("canonical-landscape", "/goals"): {
            "mode": "direct-edge",
            "condition": "top-level-curricular-element",
            "ownerPredicate": "bfo:BFO_0000051",
        },
        ("canonical-landscape", "/goals/*/contains"): {
            "mode": "direct-edge",
            "condition": "curricular-parthood-safe",
            "ownerPredicate": "bfo:BFO_0000051",
        },
        ("canonical-landscape", "/goals/*/resourceLinks"): {
            "mode": "reified-reference",
            "condition": "curricular-goal-visualization",
            "ownerPredicate": "lp:LP_0030071",
            "valuePredicate": "lp:LP_0030072",
            "resourceClass": "lp:LP_0030065",
        },
    }
    for role_path, expected_projection in expected_membership_projections.items():
        entry = by_key.get(role_path)
        construction = entry.get("rdfMapping", {}).get("construction", {}) if isinstance(entry, dict) else {}
        membership = construction.get("membership", {}) if isinstance(construction, dict) else {}
        if membership.get("coreProjection") != expected_projection:
            diagnostics.append(
                Diagnostic("REGISTRY_CORE_PROJECTION_MISMATCH", "/entries", f"{role_path!r} has the wrong Core projection")
            )
    return sorted(diagnostics)


def validate_normalization(
    profile: Any,
    validator: Draft202012Validator,
    registry: Any,
) -> list[Diagnostic]:
    diagnostics = schema_diagnostics(profile, validator, "NORMALIZATION_SCHEMA")
    if not isinstance(profile, dict) or not isinstance(registry, dict):
        return sorted(diagnostics)
    compatibility = profile.get("compatibility")
    if isinstance(compatibility, dict) and compatibility.get("fieldRegistryFormatVersion") != registry.get("registryFormatVersion"):
        diagnostics.append(
            Diagnostic("NORMALIZATION_REGISTRY_FORMAT_MISMATCH", "/compatibility/fieldRegistryFormatVersion", "Registry format differs")
        )
    canonical = profile.get("canonicalJson")
    if isinstance(canonical, dict):
        number_policy = canonical.get("numberPolicy")
        if not isinstance(number_policy, dict) or number_policy.get("finiteOnly") is not True:
            diagnostics.append(
                Diagnostic("NORMALIZATION_NONFINITE_ALLOWED", "/canonicalJson/numberPolicy", "Only finite JSON numbers are allowed")
            )
        if canonical.get("missingNullDefault") != "distinct-unless-field-registry-declares-equivalence":
            diagnostics.append(
                Diagnostic("NORMALIZATION_PRESENCE_COLLAPSED", "/canonicalJson/missingNullDefault", "Missing/null/default must not be collapsed globally")
            )
    content = profile.get("contentDigest")
    if isinstance(content, dict) and content.get("variantIndependent") is not True:
        diagnostics.append(
            Diagnostic("NORMALIZATION_VARIANT_DEPENDENT", "/contentDigest/variantIndependent", "Content digest must be variant-independent")
        )
    return sorted(diagnostics)


def expected_contract_bindings() -> dict[str, dict[str, str]]:
    return {
        "packageManifestSchema": {
            "id": SCHEMA_IDS["package_manifest_schema"],
            "sha256": sha256_file(FILES["package_manifest_schema"]),
        },
        "dualReleaseIndexSchema": {
            "id": SCHEMA_IDS["release_schema"],
            "sha256": sha256_file(FILES["release_schema"]),
        },
        "equivalenceReportSchema": {
            "id": SCHEMA_IDS["equivalence_schema"],
            "sha256": sha256_file(FILES["equivalence_schema"]),
        },
        "fieldSemanticsRegistry": {
            "id": REGISTRY_BINDING_ID,
            "sha256": sha256_file(FILES["registry"]),
        },
        "semanticNormalForm": {
            "id": NORMALIZATION_BINDING_ID,
            "sha256": sha256_file(FILES["normalization"]),
        },
        "semanticContentIndexSchema": {
            "id": SCHEMA_IDS["content_index_schema"],
            "sha256": sha256_file(FILES["content_index_schema"]),
        },
    }


def contract_binding_diagnostics(contracts: Any, location: str) -> list[Diagnostic]:
    diagnostics: list[Diagnostic] = []
    if not isinstance(contracts, dict):
        return diagnostics
    for key, expected in expected_contract_bindings().items():
        if contracts.get(key) != expected:
            diagnostics.append(
                Diagnostic(
                    "TRUSTED_CONTRACT_BINDING_MISMATCH",
                    f"{location}/{key}",
                    f"Expected trusted binding {expected!r}",
                )
            )
    return diagnostics


def calculate_content_digest(index: dict[str, Any], profile: dict[str, Any]) -> str:
    values: list[str] = [profile["contentDigest"]["domain"]]
    for key in ("normalizationProfile", "fieldSemanticsRegistry"):
        binding = index[key]
        values.extend([binding["id"], binding["version"], binding["sha256"]])
    values.append("semantic-artifact-records")
    logical = sorted(index["logicalArtifacts"], key=lambda item: (item["role"], item["logicalId"]))
    values.extend(item["recordSha256"] for item in logical)
    values.append("binary-asset-records")
    binary = sorted(index["binaryResources"], key=lambda item: item["resourceId"])
    values.extend(item["recordSha256"] for item in binary)
    digest = hashlib.sha256(b"".join(frame(value) for value in values)).hexdigest()
    return f"sha256:{digest}"


def calculate_binary_record_digest(resource: dict[str, Any], profile: dict[str, Any]) -> str:
    values = [
        profile["binaryAssetDigest"]["domain"],
        resource["resourceId"],
        resource["canonicalReference"],
        resource["mediaType"],
        str(resource["bytes"]),
        resource["sha256"],
    ]
    return hashlib.sha256(b"".join(frame(value) for value in values)).hexdigest()


def calculate_logical_record_digest(artifact: dict[str, Any], profile: dict[str, Any]) -> str:
    values = [
        profile["semanticArtifactDigest"]["domain"],
        artifact["role"],
        artifact["logicalId"],
        artifact["mediaType"],
        str(artifact["normalizedBytes"]),
        artifact["normalizedSha256"],
    ]
    return hashlib.sha256(b"".join(frame(value) for value in values)).hexdigest()


def validate_content_index(
    index: Any,
    validator: Draft202012Validator,
    registry: Any,
    normalization: Any,
) -> list[Diagnostic]:
    diagnostics = schema_diagnostics(index, validator, "CONTENT_INDEX_SCHEMA")
    if not all(isinstance(value, dict) for value in (index, registry, normalization)):
        return sorted(diagnostics)
    expected_bindings = {
        "normalizationProfile": {
            "id": normalization.get("profileId"),
            "version": normalization.get("version"),
            "sha256": sha256_file(FILES["normalization"]),
        },
        "fieldSemanticsRegistry": {
            "id": registry.get("registryId"),
            "version": registry.get("version"),
            "sha256": sha256_file(FILES["registry"]),
        },
    }
    for key, expected in expected_bindings.items():
        if index.get(key) != expected:
            diagnostics.append(
                Diagnostic("CONTENT_INDEX_BINDING_MISMATCH", f"/{key}", f"Expected {expected!r}")
            )
    logical = index.get("logicalArtifacts") if isinstance(index.get("logicalArtifacts"), list) else []
    logical_keys = [
        (item.get("role"), item.get("logicalId"))
        for item in logical
        if isinstance(item, dict)
    ]
    allowed_logical_roles = {
        entry.get("artifactRole")
        for entry in registry.get("entries", [])
        if isinstance(entry, dict) and entry.get("classification") != "generated-non-semantic"
    }
    unknown_logical_roles = sorted(
        {role for role, _logical_id in logical_keys if isinstance(role, str)} - allowed_logical_roles
    )
    if unknown_logical_roles:
        diagnostics.append(
            Diagnostic("CONTENT_INDEX_ROLE_UNKNOWN", "/logicalArtifacts", f"Unknown roles {unknown_logical_roles}")
        )
    if logical_keys != sorted(logical_keys):
        diagnostics.append(
            Diagnostic("CONTENT_INDEX_LOGICAL_ORDER", "/logicalArtifacts", "Logical artifacts are not canonically ordered")
        )
    if duplicate_positions(logical_keys):
        diagnostics.append(
            Diagnostic("CONTENT_INDEX_LOGICAL_DUPLICATE", "/logicalArtifacts", "Logical artifact identities must be unique")
        )
    for index_position, artifact in enumerate(logical):
        if not isinstance(artifact, dict):
            continue
        try:
            expected_record_digest = calculate_logical_record_digest(artifact, normalization)
        except (KeyError, TypeError):
            continue
        if artifact.get("recordSha256") != expected_record_digest:
            diagnostics.append(
                Diagnostic(
                    "CONTENT_INDEX_LOGICAL_RECORD_MISMATCH",
                    f"/logicalArtifacts/{index_position}/recordSha256",
                    f"Expected {expected_record_digest}",
                )
            )
    binary = index.get("binaryResources") if isinstance(index.get("binaryResources"), list) else []
    binary_ids = [item.get("resourceId") for item in binary if isinstance(item, dict)]
    binary_references = [item.get("canonicalReference") for item in binary if isinstance(item, dict)]
    if binary_ids != sorted(binary_ids):
        diagnostics.append(
            Diagnostic("CONTENT_INDEX_BINARY_ORDER", "/binaryResources", "Binary resources are not canonically ordered")
        )
    if duplicate_positions(binary_ids) or duplicate_positions(binary_references):
        diagnostics.append(
            Diagnostic("CONTENT_INDEX_BINARY_DUPLICATE", "/binaryResources", "Binary identities and canonical references must be unique")
        )
    for index_position, resource in enumerate(binary):
        if not isinstance(resource, dict):
            continue
        try:
            expected_record_digest = calculate_binary_record_digest(resource, normalization)
        except (KeyError, TypeError):
            continue
        if resource.get("recordSha256") != expected_record_digest:
            diagnostics.append(
                Diagnostic(
                    "CONTENT_INDEX_BINARY_RECORD_MISMATCH",
                    f"/binaryResources/{index_position}/recordSha256",
                    f"Expected {expected_record_digest}",
                )
            )
    try:
        expected_digest = calculate_content_digest(index, normalization)
    except (KeyError, TypeError):
        expected_digest = None
    if expected_digest is not None and index.get("contentDigest") != expected_digest:
        diagnostics.append(
            Diagnostic("CONTENT_DIGEST_MISMATCH", "/contentDigest", f"Expected {expected_digest}")
        )
    return sorted(diagnostics)


def triplet_equal(value: Any) -> bool:
    return isinstance(value, dict) and set(value) == {"json", "fwuOwl", "reconstructedJson"} and len(set(value.values())) == 1


def comparison_diagnostics(comparisons: Any) -> list[Diagnostic]:
    diagnostics: list[Diagnostic] = []
    if not isinstance(comparisons, dict):
        return diagnostics
    for category, comparison in comparisons.items():
        if not isinstance(comparison, dict):
            continue
        if comparison.get("passed") is not True:
            diagnostics.append(Diagnostic("EQUIVALENCE_COMPARISON_FAILED", f"/comparisons/{category}/passed", "Comparison did not pass"))
        for key, value in comparison.items():
            if key.endswith("Counts") or key in {
                "logicalDigests",
                "assetCounts",
                "totalBytes",
                "logicalIndexDigests",
                "byteDigests",
            }:
                if not triplet_equal(value):
                    diagnostics.append(
                        Diagnostic("EQUIVALENCE_COMPARISON_MISMATCH", f"/comparisons/{category}/{key}", "JSON, ontology, and reconstructed values differ")
                    )
        for key in ("orderPreserved", "mimeTypesMatched"):
            if key in comparison and comparison.get(key) is not True:
                diagnostics.append(
                    Diagnostic("EQUIVALENCE_ORDER_OR_MEDIA_LOST", f"/comparisons/{category}/{key}", "Required order or media metadata was not preserved")
                )
    return diagnostics


def coverage_digest(entries: list[dict[str, Any]]) -> str:
    ordered = sorted(entries, key=lambda entry: str(entry.get("entryId")))
    return hashlib.sha256(canonical_json_bytes(ordered)).hexdigest()


def role_record_digest(domain: str, role: str, record_hashes: list[str]) -> str:
    values = [domain, role, *record_hashes]
    return hashlib.sha256(b"".join(frame(value) for value in values)).hexdigest()


def binary_collection_digest(resources: list[dict[str, Any]], normalization: dict[str, Any]) -> str:
    values = [normalization["binaryCollectionDigest"]["domain"]]
    for resource in sorted(resources, key=lambda entry: entry["resourceId"]):
        values.extend([resource["resourceId"], resource["sha256"]])
    return hashlib.sha256(b"".join(frame(value) for value in values)).hexdigest()


def validate_equivalence(
    report: Any,
    validator: Draft202012Validator,
    registry: Any,
    normalization: Any,
    content_index: Any,
) -> list[Diagnostic]:
    diagnostics = schema_diagnostics(report, validator, "EQUIVALENCE_SCHEMA")
    if not all(isinstance(value, dict) for value in (report, registry, normalization, content_index)):
        return sorted(diagnostics)
    diagnostics.extend(contract_binding_diagnostics(report.get("contracts"), "/contracts"))
    expected_release_id = f"{report.get('packageId')}@{report.get('packageVersion')}"
    if report.get("releaseId") != expected_release_id:
        diagnostics.append(
            Diagnostic("EQUIVALENCE_RELEASE_ID_MISMATCH", "/releaseId", f"Expected {expected_release_id!r}")
        )
    expected_core_iri = registry.get("compatibility", {}).get("fwuCoreOntologyIri")
    if report.get("fwuCore", {}).get("iri") != expected_core_iri:
        diagnostics.append(
            Diagnostic("EQUIVALENCE_CORE_IRI_MISMATCH", "/fwuCore/iri", f"Expected {expected_core_iri!r}")
        )

    tools = [tool for tool in report.get("tools", []) if isinstance(tool, dict)]
    roles = [tool.get("role") for tool in tools]
    if set(roles) != REQUIRED_TOOL_ROLES or duplicate_positions(roles):
        diagnostics.append(
            Diagnostic("EQUIVALENCE_TOOLCHAIN_INCOMPLETE", "/tools", "Every required tool role must occur exactly once")
        )

    role_summaries = [item for item in report.get("roleSummaries", []) if isinstance(item, dict)]
    summary_roles = [item.get("role") for item in role_summaries]
    expected_summary_roles = {
        entry.get("artifactRole")
        for entry in registry.get("entries", [])
        if isinstance(entry, dict) and entry.get("classification") != "generated-non-semantic"
    } | {"binary-asset"}
    if duplicate_positions(summary_roles):
        diagnostics.append(
            Diagnostic("EQUIVALENCE_ROLE_DUPLICATE", "/roleSummaries", "Role summaries must be unique")
        )
    if set(summary_roles) != expected_summary_roles:
        diagnostics.append(
            Diagnostic(
                "EQUIVALENCE_ROLE_SET_INCOMPLETE",
                "/roleSummaries",
                f"Expected semantic roles {sorted(expected_summary_roles)}",
            )
        )
    logical_by_role: dict[str, list[dict[str, Any]]] = {}
    for artifact in content_index.get("logicalArtifacts", []):
        if isinstance(artifact, dict) and isinstance(artifact.get("role"), str):
            logical_by_role.setdefault(artifact["role"], []).append(artifact)
    binary_resources = [
        resource for resource in content_index.get("binaryResources", []) if isinstance(resource, dict)
    ]
    expected_role_counts = Counter({role: len(items) for role, items in logical_by_role.items()})
    expected_role_counts["binary-asset"] = len(binary_resources)
    expected_role_digests: dict[str, str] = {}
    for role in expected_summary_roles:
        if role == "binary-asset":
            hashes = [
                item["recordSha256"]
                for item in sorted(binary_resources, key=lambda entry: entry["resourceId"])
            ]
        else:
            hashes = [
                item["recordSha256"]
                for item in sorted(logical_by_role.get(role, []), key=lambda entry: entry["logicalId"])
            ]
        expected_role_digests[role] = role_record_digest(normalization["roleSummaryDigest"]["domain"], role, hashes)
    for index, item in enumerate(role_summaries):
        role = item.get("role")
        expected_count = expected_role_counts.get(role, 0)
        expected_digest = expected_role_digests.get(role)
        counts = item.get("counts")
        digests = item.get("logicalDigests")
        if (
            item.get("passed") is not True
            or not triplet_equal(counts)
            or not triplet_equal(digests)
            or not isinstance(counts, dict)
            or counts.get("json") != expected_count
            or not isinstance(digests, dict)
            or digests.get("json") != expected_digest
        ):
            diagnostics.append(
                Diagnostic("EQUIVALENCE_ROLE_MISMATCH", f"/roleSummaries/{index}", "Role inventory or digest differs")
            )

    field_coverage = report.get("fieldCoverage")
    registry_entries = [entry for entry in registry.get("entries", []) if isinstance(entry, dict)]
    if isinstance(field_coverage, dict):
        expected_registry_binding = expected_contract_bindings()["fieldSemanticsRegistry"]
        expected_normal_binding = expected_contract_bindings()["semanticNormalForm"]
        if field_coverage.get("registry") != expected_registry_binding or field_coverage.get("normalForm") != expected_normal_binding:
            diagnostics.append(
                Diagnostic("EQUIVALENCE_COVERAGE_BINDING_MISMATCH", "/fieldCoverage", "Coverage uses untrusted registry or normal form")
            )
        coverage_entries = [entry for entry in field_coverage.get("entries", []) if isinstance(entry, dict)]
        coverage_by_id = {entry.get("entryId"): entry for entry in coverage_entries}
        registry_by_id = {entry.get("entryId"): entry for entry in registry_entries}
        if len(coverage_by_id) != len(coverage_entries) or set(coverage_by_id) != set(registry_by_id):
            diagnostics.append(
                Diagnostic("EQUIVALENCE_FIELD_COVERAGE_SET", "/fieldCoverage/entries", "Coverage entries must match the registry exactly")
            )
        for entry_id, expected in registry_by_id.items():
            actual = coverage_by_id.get(entry_id)
            if not isinstance(actual, dict):
                continue
            expected_projection = {
                "schemaPathPattern": expected.get("pathPattern"),
                "semanticClass": expected.get("classification"),
                "rdfStrategy": expected.get("rdfMapping", {}).get("strategy"),
            }
            for key, expected_value in expected_projection.items():
                if actual.get(key) != expected_value:
                    diagnostics.append(
                        Diagnostic("EQUIVALENCE_FIELD_MAPPING_MISMATCH", f"/fieldCoverage/entries/{entry_id}/{key}", f"Expected {expected_value!r}")
                    )
            if not all(actual.get(key) is True for key in ("forwardMapped", "reverseMapped", "tested")):
                diagnostics.append(
                    Diagnostic("EQUIVALENCE_FIELD_UNTESTED", f"/fieldCoverage/entries/{entry_id}", "Field is not fully mapped and tested")
                )
        expected_count = len(registry_entries)
        if (
            field_coverage.get("registeredFieldCount") != expected_count
            or field_coverage.get("coveredFieldCount") != expected_count
            or field_coverage.get("uncoveredFields") != []
            or field_coverage.get("unknownFields") != []
            or field_coverage.get("passed") is not True
        ):
            diagnostics.append(
                Diagnostic("EQUIVALENCE_FIELD_COVERAGE_INCOMPLETE", "/fieldCoverage", "Field coverage is incomplete or failed")
            )
        if field_coverage.get("coverageDigest") != coverage_digest(coverage_entries):
            diagnostics.append(
                Diagnostic("EQUIVALENCE_COVERAGE_DIGEST_MISMATCH", "/fieldCoverage/coverageDigest", "Coverage digest does not bind the entries")
            )

    normal_forms = report.get("normalForms")
    if isinstance(normal_forms, dict):
        results = list(normal_forms.values())
        digests = {result.get("contentDigest") for result in results if isinstance(result, dict)}
        indexes = {result.get("contentIndexSha256") for result in results if isinstance(result, dict)}
        counts = {
            (result.get("logicalArtifactCount"), result.get("binaryResourceCount"))
            for result in results
            if isinstance(result, dict)
        }
        expected_normal_form = {
            "contentIndexSha256": sha256_file(FILES["content_index"]),
            "contentDigest": content_index.get("contentDigest"),
            "logicalArtifactCount": len(content_index.get("logicalArtifacts", [])),
            "binaryResourceCount": len(content_index.get("binaryResources", [])),
            "passed": True,
        }
        if (
            len(results) != 3
            or len(digests) != 1
            or len(indexes) != 1
            or len(counts) != 1
            or report.get("contentDigest") not in digests
            or not all(result.get("passed") is True for result in results if isinstance(result, dict))
            or not all(result == expected_normal_form for result in results)
        ):
            diagnostics.append(
                Diagnostic("EQUIVALENCE_NORMAL_FORM_MISMATCH", "/normalForms", "Normal forms or content digests differ")
            )

    diagnostics.extend(comparison_diagnostics(report.get("comparisons")))
    comparisons = report.get("comparisons", {})
    comparison_role_bindings = {
        "graph": ("canonical-landscape", None),
        "compositionViews": ("composition-view", "viewCounts"),
        "cards": ("card-deck", "deckCounts"),
    }
    for comparison_name, (role, count_field) in comparison_role_bindings.items():
        comparison = comparisons.get(comparison_name) if isinstance(comparisons, dict) else None
        if not isinstance(comparison, dict):
            continue
        expected_digest = expected_role_digests.get(role)
        expected_count = expected_role_counts.get(role, 0)
        digest_matches = comparison.get("logicalDigests") == {
            "json": expected_digest,
            "fwuOwl": expected_digest,
            "reconstructedJson": expected_digest,
        }
        count_matches = count_field is None or comparison.get(count_field) == {
            "json": expected_count,
            "fwuOwl": expected_count,
            "reconstructedJson": expected_count,
        }
        if not digest_matches or not count_matches:
            diagnostics.append(
                Diagnostic("EQUIVALENCE_ROLE_COMPARISON_MISMATCH", f"/comparisons/{comparison_name}", f"Comparison is not bound to role {role!r}")
            )
    binary_comparison = report.get("comparisons", {}).get("binaryAssets")
    if isinstance(binary_comparison, dict):
        expected_asset_count = len(binary_resources)
        expected_total_bytes = sum(
            resource.get("bytes", 0)
            for resource in binary_resources
            if isinstance(resource.get("bytes"), int)
        )
        expected_logical_digest = expected_role_digests.get("binary-asset")
        expected_byte_digest = binary_collection_digest(binary_resources, normalization)
        if not (
            binary_comparison.get("assetCounts") == {
                "json": expected_asset_count,
                "fwuOwl": expected_asset_count,
                "reconstructedJson": expected_asset_count,
            }
            and binary_comparison.get("totalBytes") == {
                "json": expected_total_bytes,
                "fwuOwl": expected_total_bytes,
                "reconstructedJson": expected_total_bytes,
            }
            and binary_comparison.get("logicalIndexDigests") == {
                "json": expected_logical_digest,
                "fwuOwl": expected_logical_digest,
                "reconstructedJson": expected_logical_digest,
            }
            and binary_comparison.get("byteDigests") == {
                "json": expected_byte_digest,
                "fwuOwl": expected_byte_digest,
                "reconstructedJson": expected_byte_digest,
            }
        ):
            diagnostics.append(
                Diagnostic("EQUIVALENCE_BINARY_ASSET_INDEX_MISMATCH", "/comparisons/binaryAssets", "Binary comparison does not match the bound content index")
            )
    ontology = report.get("ontologyValidation")
    ontology_input = report.get("inputs", {}).get("fwu-owl", {})
    if isinstance(ontology, dict):
        components = [ontology.get(key) for key in ("rdfSyntax", "owl2Dl", "shacl", "reasoner")]
        reasoner = ontology.get("reasoner")
        shacl = ontology.get("shacl")
        if (
            ontology.get("passed") is not True
            or ontology.get("packageSha256") != ontology_input.get("sha256")
            or ontology.get("manifestSha256") != ontology_input.get("manifest", {}).get("sha256")
            or ontology.get("coreBindingVerified") is not True
            or not all(isinstance(component, dict) and component.get("passed") is True for component in components)
            or any(isinstance(component, dict) and component.get("errorCount", 0) != 0 for component in components)
            or not isinstance(shacl, dict)
            or shacl.get("violationCount") != 0
            or not isinstance(reasoner, dict)
            or reasoner.get("consistent") is not True
            or reasoner.get("unsatisfiableClassCount") != 0
        ):
            diagnostics.append(
                Diagnostic("EQUIVALENCE_ONTOLOGY_FAILED", "/ontologyValidation", "RDF/OWL/SHACL/reasoner evidence is not clean")
            )

    inputs = report.get("inputs")
    smoke = report.get("consumerSmokeTests")
    outputs = report.get("outputs")
    reconstructed_output = outputs.get("reconstructed-json") if isinstance(outputs, dict) else None
    if isinstance(smoke, dict) and isinstance(inputs, dict) and isinstance(reconstructed_output, dict):
        tests = [smoke.get("jsonPackage"), smoke.get("reconstructedJsonPackage")]
        if smoke.get("passed") is not True or not all(
            isinstance(test, dict)
            and test.get("passed") is True
            and test.get("hermetic") is True
            and test.get("sourceCheckoutAccessible") is False
            for test in tests
        ):
            diagnostics.append(
                Diagnostic("EQUIVALENCE_CONSUMER_NOT_HERMETIC", "/consumerSmokeTests", "Both package-only smoke tests must pass hermetically")
            )
        expected_smoke_hashes = [inputs.get("json", {}).get("sha256"), reconstructed_output.get("sha256")]
        actual_smoke_hashes = [test.get("packageSha256") if isinstance(test, dict) else None for test in tests]
        if actual_smoke_hashes != expected_smoke_hashes:
            diagnostics.append(
                Diagnostic("EQUIVALENCE_CONSUMER_INPUT_MISMATCH", "/consumerSmokeTests", "Smoke tests do not bind the validated package bytes")
            )

    reverse = report.get("reverseCompilation")
    if isinstance(reverse, dict) and isinstance(inputs, dict) and isinstance(reconstructed_output, dict):
        if not (
            reverse.get("passed") is True
            and reverse.get("originalJsonPackageAccessible") is False
            and reverse.get("authoringCheckoutAccessible") is False
            and reverse.get("inputOntologyZipSha256") == inputs.get("fwu-owl", {}).get("sha256")
            and reverse.get("outputJsonZipSha256") == reconstructed_output.get("sha256")
        ):
            diagnostics.append(
                Diagnostic("EQUIVALENCE_REVERSE_NOT_ISOLATED", "/reverseCompilation", "Reverse compiler was not isolated or its bytes are unbound")
            )

    package_validation = report.get("packageValidation")
    if isinstance(package_validation, dict) and isinstance(inputs, dict) and isinstance(reconstructed_output, dict):
        original_validation = package_validation.get("jsonPackage")
        reconstructed_validation = package_validation.get("reconstructedJsonPackage")
        expected_packages = [inputs.get("json"), reconstructed_output]
        validations = [original_validation, reconstructed_validation]
        valid = package_validation.get("passed") is True
        for validation, expected_package in zip(validations, expected_packages):
            valid = valid and (
                isinstance(validation, dict)
                and isinstance(expected_package, dict)
                and validation.get("passed") is True
                and validation.get("errorCount") == 0
                and validation.get("packageSha256") == expected_package.get("sha256")
                and validation.get("manifestSha256") == expected_package.get("manifest", {}).get("sha256")
            )
        if not valid:
            diagnostics.append(
                Diagnostic("EQUIVALENCE_PACKAGE_VALIDATION_FAILED", "/packageValidation", "Original or reconstructed JSON package is invalid or unbound")
            )

    reproducibility = report.get("reproducibility")
    if isinstance(reproducibility, dict) and isinstance(inputs, dict):
        run_a = reproducibility.get("runA")
        run_b = reproducibility.get("runB")
        expected_json = inputs.get("json", {}).get("sha256")
        expected_fwu = inputs.get("fwu-owl", {}).get("sha256")
        if not (
            reproducibility.get("passed") is True
            and reproducibility.get("jsonZipByteIdentical") is True
            and reproducibility.get("fwuOwlZipByteIdentical") is True
            and isinstance(run_a, dict)
            and isinstance(run_b, dict)
            and run_a.get("builderEnvironmentDigest") == run_b.get("builderEnvironmentDigest")
            and run_a.get("jsonZipSha256") == run_b.get("jsonZipSha256") == expected_json
            and run_a.get("fwuOwlZipSha256") == run_b.get("fwuOwlZipSha256") == expected_fwu
        ):
            diagnostics.append(
                Diagnostic("EQUIVALENCE_REPRODUCIBILITY_FAILED", "/reproducibility", "Two pinned builds must be byte-identical")
            )

    if report.get("passed") is True and report.get("differences") != []:
        diagnostics.append(
            Diagnostic("EQUIVALENCE_PASSED_WITH_DIFFERENCES", "/differences", "A passed full-profile report cannot contain differences")
        )
    blocking = [diagnostic for diagnostic in diagnostics if diagnostic.code != "EQUIVALENCE_SCHEMA"]
    if report.get("passed") is True and blocking:
        diagnostics.append(
            Diagnostic("EQUIVALENCE_FALSE_PASS", "/passed", "Report claims passed despite semantic contract failures")
        )
    return sorted(set(diagnostics))


def validate_release(
    release: Any,
    validator: Draft202012Validator,
    equivalence: Any,
    equivalence_path: Path,
) -> list[Diagnostic]:
    diagnostics = schema_diagnostics(release, validator, "RELEASE_SCHEMA")
    if not isinstance(release, dict) or not isinstance(equivalence, dict):
        return sorted(diagnostics)
    diagnostics.extend(contract_binding_diagnostics(release.get("contracts"), "/contracts"))
    expected_release_id = f"{release.get('packageId')}@{release.get('packageVersion')}"
    if release.get("releaseId") != expected_release_id:
        diagnostics.append(
            Diagnostic("RELEASE_ID_MISMATCH", "/releaseId", f"Expected {expected_release_id!r}")
        )
    for key in ("releaseId", "packageId", "packageVersion", "contentDigest"):
        if release.get(key) != equivalence.get(key):
            diagnostics.append(
                Diagnostic("RELEASE_EQUIVALENCE_IDENTITY_MISMATCH", f"/{key}", "Release and equivalence report differ")
            )
    release_contracts = release.get("contracts")
    equivalence_contracts = equivalence.get("contracts")
    if isinstance(release_contracts, dict) and isinstance(equivalence_contracts, dict):
        for key in sorted(set(release_contracts) & set(equivalence_contracts)):
            if release_contracts.get(key) != equivalence_contracts.get(key):
                diagnostics.append(
                    Diagnostic("RELEASE_EQUIVALENCE_CONTRACT_MISMATCH", f"/contracts/{key}", "Release and report bind different contracts")
                )

    variants = release.get("variants")
    inputs = equivalence.get("inputs")
    if isinstance(variants, dict) and isinstance(inputs, dict):
        for key in ("json", "fwu-owl"):
            variant = variants.get(key)
            report_input = inputs.get(key)
            if not isinstance(variant, dict) or not isinstance(report_input, dict):
                continue
            expected = {
                "file": report_input.get("file"),
                "bytes": report_input.get("bytes"),
                "sha256": report_input.get("sha256"),
                "manifestSha256": report_input.get("manifest", {}).get("sha256"),
            }
            actual = {field: variant.get(field) for field in expected}
            if actual != expected:
                diagnostics.append(
                    Diagnostic("RELEASE_VARIANT_BINDING_MISMATCH", f"/variants/{key}", f"Expected {expected!r}")
                )
    report_binding = release.get("equivalence")
    if isinstance(report_binding, dict):
        actual = {"bytes": equivalence_path.stat().st_size, "sha256": sha256_file(equivalence_path)}
        if report_binding.get("bytes") != actual["bytes"] or report_binding.get("sha256") != actual["sha256"]:
            diagnostics.append(
                Diagnostic("RELEASE_EQUIVALENCE_HASH_MISMATCH", "/equivalence", f"Expected {actual!r}")
            )
        json_variant_file = release.get("variants", {}).get("json", {}).get("file")
        expected_report_name = (
            f"{json_variant_file[:-len('.json.zip')]}.equivalence.json"
            if isinstance(json_variant_file, str) and json_variant_file.endswith(".json.zip")
            else None
        )
        if report_binding.get("report") != expected_report_name:
            diagnostics.append(
                Diagnostic("RELEASE_EQUIVALENCE_PATH_MISMATCH", "/equivalence/report", f"Expected {expected_report_name!r}")
            )
        if report_binding.get("status") != "passed" or equivalence.get("passed") is not True:
            diagnostics.append(
                Diagnostic("RELEASE_EQUIVALENCE_NOT_PASSED", "/equivalence/status", "Release needs a passed report")
            )

    authentication = release.get("authentication")
    if isinstance(authentication, dict):
        signature = authentication.get("releaseIndexSignature")
        provenance = authentication.get("provenanceAttestation")
        channel = release.get("channel")
        if isinstance(signature, dict) and signature.get("status") == "verified":
            projection = copy.deepcopy(release)
            projection.get("authentication", {}).pop("releaseIndexSignature", None)
            expected_payload_hash = hashlib.sha256(canonical_json_bytes(projection)).hexdigest()
            if not (
                signature.get("format") in {"sigstore-bundle-v0.3", "detached-signature-v1"}
                and isinstance(signature.get("artifact"), str)
                and isinstance(signature.get("sha256"), str)
                and signature.get("signedPayloadProjection") == "canonical-json-with-release-index-signature-removed-v1"
                and signature.get("signedPayloadSha256") == expected_payload_hash
                and signature.get("trustedIdentityVerified") is True
            ):
                diagnostics.append(
                    Diagnostic("RELEASE_VERIFIED_SIGNATURE_INCONSISTENT", "/authentication/releaseIndexSignature", "Verified signature metadata or signing projection is inconsistent")
                )
            diagnostics.append(
                Diagnostic("RELEASE_SIGNATURE_VERIFICATION_NOT_IMPLEMENTED", "/authentication/releaseIndexSignature/status", "DPK-011 must cryptographically verify every verified signature claim")
            )
        if isinstance(provenance, dict) and provenance.get("status") == "verified" and provenance.get("trustedBuilderIdentityVerified") is not True:
            diagnostics.append(
                Diagnostic("RELEASE_VERIFIED_PROVENANCE_INCONSISTENT", "/authentication/provenanceAttestation", "Verified provenance needs a trusted builder identity")
            )
        if isinstance(provenance, dict) and provenance.get("status") == "verified":
            diagnostics.append(
                Diagnostic("RELEASE_PROVENANCE_VERIFICATION_NOT_IMPLEMENTED", "/authentication/provenanceAttestation/status", "DPK-011 must cryptographically verify every provenance claim")
            )
        if channel == "stable":
            if not (
                isinstance(signature, dict)
                and signature.get("status") == "verified"
                and signature.get("format") != "none"
                and isinstance(signature.get("artifact"), str)
                and isinstance(signature.get("sha256"), str)
                and signature.get("trustedIdentityVerified") is True
                and isinstance(provenance, dict)
                and provenance.get("status") == "verified"
                and provenance.get("trustedBuilderIdentityVerified") is True
            ):
                diagnostics.append(
                    Diagnostic("RELEASE_STABLE_AUTHENTICATION_REQUIRED", "/authentication", "Stable releases require trusted signature and builder identity")
                )
            diagnostics.append(
                Diagnostic("RELEASE_STABLE_VERIFICATION_NOT_IMPLEMENTED", "/channel", "DPK-003 validates the signing projection contract but cannot cryptographically promote stable releases")
            )
        elif isinstance(signature, dict) and signature.get("status") == "unsigned-staging":
            if not (
                signature.get("format") == "none"
                and signature.get("artifact") is None
                and signature.get("sha256") is None
                and signature.get("signedPayloadProjection") == "canonical-json-with-release-index-signature-removed-v1"
                and signature.get("signedPayloadSha256") is None
                and signature.get("trustedIdentityVerified") is False
            ):
                diagnostics.append(
                    Diagnostic("RELEASE_UNSIGNED_STAGING_INCONSISTENT", "/authentication/releaseIndexSignature", "Unsigned staging metadata is inconsistent")
                )
    return sorted(set(diagnostics))


def set_path(value: dict[str, Any], path: tuple[Any, ...], replacement: Any) -> None:
    current: Any = value
    for part in path[:-1]:
        current = current[part]
    current[path[-1]] = replacement


def remove_path(value: dict[str, Any], path: tuple[Any, ...]) -> None:
    current: Any = value
    for part in path[:-1]:
        current = current[part]
    del current[path[-1]]


def registry_entry(value: dict[str, Any], entry_id: str) -> dict[str, Any]:
    matches = [
        entry
        for entry in value.get("entries", [])
        if isinstance(entry, dict) and entry.get("entryId") == entry_id
    ]
    if len(matches) != 1:
        raise AssertionError(f"Expected one registry entry {entry_id!r}, found {len(matches)}")
    return matches[0]


@dataclass(frozen=True)
class MutationCase:
    case_id: str
    target: str
    mutate: Callable[[dict[str, Any]], None]
    expected_code: str


def mutation_cases() -> list[MutationCase]:
    cases: list[MutationCase] = []

    def case(case_id: str, target: str, expected: str, mutate: Callable[[dict[str, Any]], None]) -> None:
        cases.append(MutationCase(case_id, target, mutate, expected))

    case("registry-duplicate-id", "registry", "REGISTRY_ENTRY_ID_DUPLICATE", lambda value: value["entries"].append(copy.deepcopy(value["entries"][0])))
    case("registry-contains-as-set", "registry", "REGISTRY_OBSERVABLE_ORDER_LOST", lambda value: registry_entry(value, "goal.contains").update({"classification": "set"}))
    case("registry-missing-ordered-field", "registry", "REGISTRY_REQUIRED_FIELD_MISSING", lambda value: value["entries"].remove(registry_entry(value, "goal.requires")))
    case("registry-unknown-prefix", "registry", "REGISTRY_NAMESPACE_UNKNOWN", lambda value: registry_entry(value, "goal.id")["rdfMapping"]["construction"].update({"predicate": "bad:value"}))
    case("registry-json-catchall", "registry", "REGISTRY_JSON_LITERAL_TOO_BROAD", lambda value: registry_entry(value, "goal.dimension-tags").update({"pathPattern": "/goals/*"}))
    case("registry-overlapping-paths", "registry", "REGISTRY_PATH_AMBIGUOUS", lambda value: value["entries"].append({**copy.deepcopy(registry_entry(value, "goal.title")), "entryId": "goal.title-overlap", "pathPattern": "/goals/ABC/*"}))
    case("registry-presence-asymmetric", "registry", "REGISTRY_PRESENCE_ASYMMETRIC", lambda value: registry_entry(value, "goal.id")["presenceSemantics"].update({"missing": "equivalent-to-null"}))
    case("registry-ordered-scalar-reverse", "registry", "REGISTRY_REVERSE_POSITIONS", lambda value: registry_entry(value, "goal.contains")["reverseMapping"].update({"mode": "scalar-literal"}))
    case("registry-membership-missing", "registry", "REGISTRY_SCHEMA", lambda value: registry_entry(value, "goal.contains")["rdfMapping"]["construction"].pop("membership"))
    case("registry-requires-core-missing", "registry", "REGISTRY_CORE_PREREQUISITE_INCOMPLETE", lambda value: registry_entry(value, "goal.requires")["rdfMapping"]["construction"]["membership"]["coreProjection"].update({"resourceClass": "lp:LP_0030065"}))
    case("registry-contains-core-mismatch", "registry", "REGISTRY_CORE_PROJECTION_MISMATCH", lambda value: registry_entry(value, "goal.contains")["rdfMapping"]["construction"]["membership"]["coreProjection"].update({"ownerPredicate": "sp:containsGoal"}))
    case(
        "registry-complete-json-with-descendant",
        "registry",
        "REGISTRY_JSON_LITERAL_DESCENDANT_CONFLICT",
        lambda value: registry_entry(value, "goal.extended-data")["rdfMapping"][
            "canonicalJsonLiteral"
        ].update({"subtreeProjection": "complete-value"}),
    )
    case("normalization-nonfinite", "normalization", "NORMALIZATION_SCHEMA", lambda value: set_path(value, ("canonicalJson", "numberPolicy", "finiteOnly"), False))
    case("normalization-collapse-null", "normalization", "NORMALIZATION_SCHEMA", lambda value: set_path(value, ("canonicalJson", "missingNullDefault"), "collapse"))
    case("content-stale-profile", "content_index", "CONTENT_INDEX_BINDING_MISMATCH", lambda value: set_path(value, ("normalizationProfile", "sha256"), "0" * 64))
    case("content-duplicate-logical", "content_index", "CONTENT_INDEX_LOGICAL_DUPLICATE", lambda value: value["logicalArtifacts"].append(copy.deepcopy(value["logicalArtifacts"][0])))
    case("content-reordered", "content_index", "CONTENT_INDEX_LOGICAL_ORDER", lambda value: value["logicalArtifacts"].reverse())
    case("content-forged-digest", "content_index", "CONTENT_DIGEST_MISMATCH", lambda value: set_path(value, ("contentDigest",), "sha256:" + "0" * 64))
    case("content-binary-record", "content_index", "CONTENT_INDEX_BINARY_RECORD_MISMATCH", lambda value: set_path(value, ("binaryResources", 0, "recordSha256"), "0" * 64))
    case("content-logical-record", "content_index", "CONTENT_INDEX_LOGICAL_RECORD_MISMATCH", lambda value: set_path(value, ("logicalArtifacts", 0, "normalizedSha256"), "0" * 64))
    case("content-unknown-role", "content_index", "CONTENT_INDEX_ROLE_UNKNOWN", lambda value: set_path(value, ("logicalArtifacts", 0, "role"), "unknown-role"))
    case("equivalence-release-id", "equivalence", "EQUIVALENCE_RELEASE_ID_MISMATCH", lambda value: set_path(value, ("releaseId",), "org.skillpilot.curriculum.fake@1.0.0"))
    case("equivalence-tool-missing", "equivalence", "EQUIVALENCE_TOOLCHAIN_INCOMPLETE", lambda value: value["tools"].pop())
    case("equivalence-field-missing", "equivalence", "EQUIVALENCE_FIELD_COVERAGE_SET", lambda value: value["fieldCoverage"]["entries"].pop())
    case("equivalence-field-untested", "equivalence", "EQUIVALENCE_FIELD_UNTESTED", lambda value: set_path(value, ("fieldCoverage", "entries", 0, "tested"), False))
    case("equivalence-unknown-field", "equivalence", "EQUIVALENCE_FIELD_COVERAGE_INCOMPLETE", lambda value: value["fieldCoverage"]["unknownFields"].append("/newField"))
    case("equivalence-normal-digest", "equivalence", "EQUIVALENCE_NORMAL_FORM_MISMATCH", lambda value: set_path(value, ("normalForms", "fwu-owl", "contentDigest"), "sha256:" + "0" * 64))
    case("equivalence-all-index-hashes-forged", "equivalence", "EQUIVALENCE_NORMAL_FORM_MISMATCH", lambda value: [entry.update({"contentIndexSha256": "0" * 64, "logicalArtifactCount": 0, "binaryResourceCount": 0}) for entry in value["normalForms"].values()])
    case("equivalence-core-iri", "equivalence", "EQUIVALENCE_CORE_IRI_MISMATCH", lambda value: set_path(value, ("fwuCore", "iri"), "https://attacker.example/core.owl"))
    case("equivalence-role-count", "equivalence", "EQUIVALENCE_ROLE_MISMATCH", lambda value: set_path(value, ("roleSummaries", 0, "counts", "fwuOwl"), 2))
    case("equivalence-graph-count", "equivalence", "EQUIVALENCE_COMPARISON_MISMATCH", lambda value: set_path(value, ("comparisons", "graph", "goalCounts", "reconstructedJson"), 9))
    case("equivalence-view-order", "equivalence", "EQUIVALENCE_ORDER_OR_MEDIA_LOST", lambda value: set_path(value, ("comparisons", "compositionViews", "orderPreserved"), False))
    case("equivalence-all-views-omitted", "equivalence", "EQUIVALENCE_ROLE_COMPARISON_MISMATCH", lambda value: value["comparisons"]["compositionViews"].update({"viewCounts": {"json": 0, "fwuOwl": 0, "reconstructedJson": 0}, "logicalDigests": {"json": "0" * 64, "fwuOwl": "0" * 64, "reconstructedJson": "0" * 64}}))
    case("equivalence-all-decks-omitted", "equivalence", "EQUIVALENCE_ROLE_COMPARISON_MISMATCH", lambda value: value["comparisons"]["cards"].update({"deckCounts": {"json": 0, "fwuOwl": 0, "reconstructedJson": 0}, "logicalDigests": {"json": "0" * 64, "fwuOwl": "0" * 64, "reconstructedJson": "0" * 64}}))
    case("equivalence-image-bytes", "equivalence", "EQUIVALENCE_COMPARISON_MISMATCH", lambda value: set_path(value, ("comparisons", "binaryAssets", "byteDigests", "fwuOwl"), "0" * 64))
    case("equivalence-all-images-omitted", "equivalence", "EQUIVALENCE_BINARY_ASSET_INDEX_MISMATCH", lambda value: value["comparisons"]["binaryAssets"].update({"assetCounts": {"json": 0, "fwuOwl": 0, "reconstructedJson": 0}, "totalBytes": {"json": 0, "fwuOwl": 0, "reconstructedJson": 0}, "logicalIndexDigests": {"json": "0" * 64, "fwuOwl": "0" * 64, "reconstructedJson": "0" * 64}, "byteDigests": {"json": "0" * 64, "fwuOwl": "0" * 64, "reconstructedJson": "0" * 64}}))
    case("equivalence-shacl", "equivalence", "EQUIVALENCE_ONTOLOGY_FAILED", lambda value: set_path(value, ("ontologyValidation", "shacl", "violationCount"), 1))
    case("equivalence-ontology-substitution", "equivalence", "EQUIVALENCE_ONTOLOGY_FAILED", lambda value: set_path(value, ("ontologyValidation", "packageSha256"), "0" * 64))
    case("equivalence-source-visible", "equivalence", "EQUIVALENCE_CONSUMER_NOT_HERMETIC", lambda value: set_path(value, ("consumerSmokeTests", "reconstructedJsonPackage", "sourceCheckoutAccessible"), True))
    case("equivalence-reverse-source-visible", "equivalence", "EQUIVALENCE_REVERSE_NOT_ISOLATED", lambda value: set_path(value, ("reverseCompilation", "originalJsonPackageAccessible"), True))
    case("equivalence-reconstructed-invalid", "equivalence", "EQUIVALENCE_PACKAGE_VALIDATION_FAILED", lambda value: set_path(value, ("packageValidation", "reconstructedJsonPackage", "passed"), False))
    case("equivalence-smoke-substitution", "equivalence", "EQUIVALENCE_CONSUMER_INPUT_MISMATCH", lambda value: set_path(value, ("consumerSmokeTests", "reconstructedJsonPackage", "packageSha256"), "0" * 64))
    case("equivalence-build-env", "equivalence", "EQUIVALENCE_REPRODUCIBILITY_FAILED", lambda value: set_path(value, ("reproducibility", "runB", "builderEnvironmentDigest"), "sha256:" + "0" * 64))
    case("equivalence-difference", "equivalence", "EQUIVALENCE_PASSED_WITH_DIFFERENCES", lambda value: value["differences"].append({"category": "field", "logicalPath": "/goals/0/title", "message": "changed", "jsonValueDigest": None, "reconstructedValueDigest": None, "allowed": False, "justification": None}))
    case("release-release-id", "release", "RELEASE_ID_MISMATCH", lambda value: set_path(value, ("releaseId",), "org.skillpilot.curriculum.fake@1.0.0"))
    case("release-json-hash", "release", "RELEASE_VARIANT_BINDING_MISMATCH", lambda value: set_path(value, ("variants", "json", "sha256"), "0" * 64))
    case("release-report-hash", "release", "RELEASE_EQUIVALENCE_HASH_MISMATCH", lambda value: set_path(value, ("equivalence", "sha256"), "0" * 64))
    case("release-report-path", "release", "RELEASE_EQUIVALENCE_PATH_MISMATCH", lambda value: set_path(value, ("equivalence", "report"), "other.equivalence.json"))
    case("release-contract-hash", "release", "TRUSTED_CONTRACT_BINDING_MISMATCH", lambda value: set_path(value, ("contracts", "fieldSemanticsRegistry", "sha256"), "0" * 64))
    case("release-ontology-profile-mismatch", "release", "RELEASE_EQUIVALENCE_CONTRACT_MISMATCH", lambda value: set_path(value, ("contracts", "ontologyProfile", "sha256"), "0" * 64))
    case("release-stable-unsigned", "release", "RELEASE_STABLE_AUTHENTICATION_REQUIRED", lambda value: set_path(value, ("channel",), "stable"))
    case("release-staging-forged-signature", "release", "RELEASE_UNSIGNED_STAGING_INCONSISTENT", lambda value: set_path(value, ("authentication", "releaseIndexSignature", "format"), "detached-signature-v1"))
    case("release-staging-false-verified", "release", "RELEASE_VERIFIED_SIGNATURE_INCONSISTENT", lambda value: set_path(value, ("authentication", "releaseIndexSignature", "status"), "verified"))
    case("release-missing-variant", "release", "RELEASE_SCHEMA", lambda value: remove_path(value, ("variants", "fwu-owl")))
    return cases


def run_mutation_matrix(
    documents: dict[str, Any],
    validators: dict[str, Draft202012Validator],
) -> tuple[int, list[str]]:
    failures: list[str] = []
    cases = mutation_cases()
    for mutation in cases:
        value = copy.deepcopy(documents[mutation.target])
        mutation.mutate(value)
        if mutation.target == "registry":
            diagnostics = validate_registry(value, validators["registry"], documents["normalization"])
        elif mutation.target == "normalization":
            diagnostics = validate_normalization(value, validators["normalization"], documents["registry"])
        elif mutation.target == "content_index":
            diagnostics = validate_content_index(value, validators["content_index"], documents["registry"], documents["normalization"])
        elif mutation.target == "equivalence":
            diagnostics = validate_equivalence(value, validators["equivalence"], documents["registry"], documents["normalization"], documents["content_index"])
        elif mutation.target == "release":
            diagnostics = validate_release(value, validators["release"], documents["equivalence"], FILES["equivalence"])
        else:
            raise AssertionError(mutation.target)
        codes = {diagnostic.code for diagnostic in diagnostics}
        if mutation.expected_code not in codes:
            failures.append(
                f"{mutation.case_id}: expected {mutation.expected_code}, got {sorted(codes) or 'no diagnostics'}"
            )
    return len(cases), failures


def main() -> int:
    try:
        actual_jsonschema_version = distribution_version("jsonschema")
        if actual_jsonschema_version != JSONSCHEMA_VERSION:
            raise ContractError(
                f"jsonschema {JSONSCHEMA_VERSION} is required, found {actual_jsonschema_version}"
            )
        documents = {key: load_json(path) for key, path in FILES.items()}
        validators: dict[str, Draft202012Validator] = {}
        for key in (
            "registry_schema",
            "normalization_schema",
            "content_index_schema",
            "release_schema",
            "equivalence_schema",
            "package_manifest_schema",
        ):
            schema = documents[key]
            if not isinstance(schema, dict):
                raise ContractError(f"{FILES[key]} must contain a schema object")
            Draft202012Validator.check_schema(schema)
            if schema.get("$id") != SCHEMA_IDS[key]:
                raise ContractError(f"Unexpected $id in {FILES[key]}: {schema.get('$id')!r}")
        validators = {
            "registry": Draft202012Validator(documents["registry_schema"], format_checker=FormatChecker()),
            "normalization": Draft202012Validator(documents["normalization_schema"], format_checker=FormatChecker()),
            "content_index": Draft202012Validator(documents["content_index_schema"], format_checker=FormatChecker()),
            "equivalence": Draft202012Validator(documents["equivalence_schema"], format_checker=FormatChecker()),
            "release": Draft202012Validator(documents["release_schema"], format_checker=FormatChecker()),
        }

        diagnostics: list[Diagnostic] = []
        diagnostics.extend(validate_normalization(documents["normalization"], validators["normalization"], documents["registry"]))
        diagnostics.extend(validate_registry(documents["registry"], validators["registry"], documents["normalization"]))
        diagnostics.extend(validate_content_index(documents["content_index"], validators["content_index"], documents["registry"], documents["normalization"]))
        diagnostics.extend(validate_equivalence(documents["equivalence"], validators["equivalence"], documents["registry"], documents["normalization"], documents["content_index"]))
        diagnostics.extend(validate_release(documents["release"], validators["release"], documents["equivalence"], FILES["equivalence"]))

        raw_failures: list[str] = []
        raw_cases = (
            ("duplicate-key", b'{"a":1,"a":2}'),
            ("nan", b'{"value":NaN}'),
            ("positive-infinity", b'{"value":Infinity}'),
            ("negative-infinity", b'{"value":-Infinity}'),
            ("overflow-to-infinity", b'{"value":1e9999}'),
            ("unpaired-surrogate", b'{"value":"\\ud800"}'),
            ("unsafe-control", b'{"value":"\\u0001"}'),
            ("forbidden-noncharacter", b'{"value":"\\ufffe"}'),
        )
        for case_id, raw in raw_cases:
            try:
                strict_json_loads(raw, case_id)
            except ContractError:
                continue
            raw_failures.append(f"{case_id}: invalid JSON was accepted")

        case_count, mutation_failures = run_mutation_matrix(documents, validators)
        if diagnostics or raw_failures or mutation_failures:
            for diagnostic in sorted(set(diagnostics)):
                print(f"ERROR {diagnostic.code} {diagnostic.location}: {diagnostic.message}", file=sys.stderr)
            for failure in raw_failures + mutation_failures:
                print(f"ERROR SELFTEST: {failure}", file=sys.stderr)
            return 1

        print(
            "Curriculum dual-release contracts passed: "
            f"5 valid documents, {len(documents['registry']['entries'])} registry entries, "
            f"{case_count} semantic mutation cases, {len(raw_cases)} raw-JSON cases."
        )
        return 0
    except (ContractError, KeyError, OSError, ValueError, TypeError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
