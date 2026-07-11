#!/usr/bin/env python3
"""Independently validate the unpacked DPK-004 curriculum release model.

The validator intentionally does not import the release-model compiler.  It
reconstructs the expected Mathematik pilot from the trusted build profile and
source files, validates every closed JSON schema, recomputes semantic and
binary digests, proves the hard-reference fixed point, and checks the complete
output inventory.  Small in-memory adversarial cases exercise the fail-closed
checks without copying the roughly 1.7 GiB visualization corpus.
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
import subprocess
import sys
import tempfile
import unicodedata
from collections import Counter, defaultdict, deque
from dataclasses import dataclass
from decimal import Decimal
from pathlib import Path
from typing import Any, Callable, Iterable, Iterator, Mapping, Sequence

from jsonschema import Draft202012Validator, FormatChecker


sys.dont_write_bytecode = True

REPO_ROOT = Path(__file__).resolve().parents[1]
CONTRACT_ROOT = REPO_ROOT / "contracts/curriculum-package/v1"
DEFAULT_PROFILE = (
    CONTRACT_ROOT
    / "profiles/de-gymnasium-mathematik-release-model-v1.profile.json"
)
MAX_JSON_BYTES = 64 * 1024 * 1024
ZERO_DIGEST = "sha256:" + "0" * 64

SCHEMA_FILES = {
    "build-profile": CONTRACT_ROOT / "release-model-build-profile.schema.json",
    "field-registry": CONTRACT_ROOT / "field-semantics-registry.schema.json",
    "normalization-profile": CONTRACT_ROOT / "semantic-normalization-profile.schema.json",
    "ontology-profile": CONTRACT_ROOT / "curriculum-ontology-profile.schema.json",
    "definition-profile": CONTRACT_ROOT / "definition-digest-profile.schema.json",
    "compiled-landscape": CONTRACT_ROOT / "compiled-landscape.schema.json",
    "composition-view": CONTRACT_ROOT / "composition-view.schema.json",
    "composition-view-index": CONTRACT_ROOT / "composition-view-index.schema.json",
    "card-deck": CONTRACT_ROOT / "card-deck.schema.json",
    "card-index": CONTRACT_ROOT / "card-index.schema.json",
    "resource-index": CONTRACT_ROOT / "resource-index.schema.json",
    "runtime-catalog": CONTRACT_ROOT / "runtime-catalog.schema.json",
    "dependency-closure": CONTRACT_ROOT / "dependency-closure.schema.json",
    "migration-aliases": CONTRACT_ROOT / "migration-aliases.schema.json",
    "semantic-content-index": CONTRACT_ROOT / "semantic-content-index.schema.json",
    "publication-evidence-profile": CONTRACT_ROOT
    / "publication-evidence-projection.schema.json",
    "mapping": CONTRACT_ROOT / "source-to-canonical-mappings.schema.json",
    "source-index": CONTRACT_ROOT / "official-source-index.schema.json",
    "source-goal-reference-index": CONTRACT_ROOT
    / "source-goal-reference-index.schema.json",
    "quality-evidence": CONTRACT_ROOT / "release-quality-evidence.schema.json",
}

ARTIFACT_SCHEMA_NAMES = {
    "canonical-landscape": "compiled-landscape",
    "composition-view": "composition-view",
    "composition-view-index": "composition-view-index",
    "card-deck": "card-deck",
    "card-index": "card-index",
    "resource-index": "resource-index",
    "runtime-catalog": "runtime-catalog",
    "dependency-closure": "dependency-closure",
    "migration-aliases": "migration-aliases",
    "semantic-content-index": "semantic-content-index",
    "mapping": "mapping",
    "source-index": "source-index",
    "source-goal-reference-index": "source-goal-reference-index",
    "quality-evidence": "quality-evidence",
    "source-to-canonical-mappings": "mapping",
    "official-source-index": "source-index",
    "release-quality-evidence": "quality-evidence",
}

SCHEMA_IDS = {
    name: f"https://skillpilot.com/schemas/curriculum-package/v1/{filename.name}"
    for name, filename in SCHEMA_FILES.items()
    if name
    in {
        "compiled-landscape",
        "composition-view",
        "composition-view-index",
        "card-deck",
        "card-index",
        "resource-index",
        "runtime-catalog",
        "dependency-closure",
        "migration-aliases",
        "semantic-content-index",
        "mapping",
        "source-index",
        "source-goal-reference-index",
        "quality-evidence",
    }
}

RUNTIME_REGISTRY_ROLES = {
    "canonical-landscape",
    "composition-view",
    "composition-view-index",
    "card-deck",
    "card-index",
    "resource-index",
    "runtime-catalog",
    "dependency-closure",
    "migration-aliases",
    "source-to-canonical-mappings",
    "official-source-index",
    "source-goal-reference-index",
    "release-quality-evidence",
}

PUBLICATION_ARTIFACT_ROLES = {
    "mapping",
    "source-index",
    "source-goal-reference-index",
    "quality-evidence",
}


class ValidationError(RuntimeError):
    """A trusted input or release-model invariant failed."""


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValidationError(message)


def validate_json_scalars(value: Any, source: str) -> None:
    if isinstance(value, float) and not math.isfinite(value):
        raise ValidationError(f"Non-finite number in {source}")
    if isinstance(value, str):
        for character in value:
            codepoint = ord(character)
            if 0xD800 <= codepoint <= 0xDFFF:
                raise ValidationError(f"Unpaired surrogate in {source}")
            if codepoint in {0xFFFE, 0xFFFF}:
                raise ValidationError(f"Forbidden Unicode noncharacter in {source}")
            if codepoint < 0x20 and codepoint not in {0x09, 0x0A, 0x0D}:
                raise ValidationError(f"XML/RDF-unsafe control character in {source}")
    elif isinstance(value, dict):
        for key, child in value.items():
            validate_json_scalars(key, source)
            validate_json_scalars(child, source)
    elif isinstance(value, list):
        for child in value:
            validate_json_scalars(child, source)


def strict_json_loads(raw: bytes, source: str) -> Any:
    if len(raw) > MAX_JSON_BYTES:
        raise ValidationError(f"JSON exceeds {MAX_JSON_BYTES} bytes: {source}")

    def object_pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
        result: dict[str, Any] = {}
        for key, value in pairs:
            if key in result:
                raise ValidationError(f"Duplicate JSON key {key!r} in {source}")
            result[key] = value
        return result

    def reject_constant(value: str) -> Any:
        raise ValidationError(f"Non-RFC-8259 number {value!r} in {source}")

    try:
        value = json.loads(
            raw.decode("utf-8"),
            object_pairs_hook=object_pairs,
            parse_constant=reject_constant,
        )
    except ValidationError:
        raise
    except (UnicodeError, json.JSONDecodeError) as error:
        raise ValidationError(f"Cannot parse {source}: {error}") from error
    validate_json_scalars(value, source)
    return value


def load_json(path: Path) -> Any:
    try:
        return strict_json_loads(path.read_bytes(), str(path))
    except OSError as error:
        raise ValidationError(f"Cannot read {path}: {error}") from error


def load_json_lines(path: Path) -> list[Any]:
    try:
        raw_lines = path.read_bytes().splitlines()
    except OSError as error:
        raise ValidationError(f"Cannot read {path}: {error}") from error
    result: list[Any] = []
    for line_number, raw_line in enumerate(raw_lines, start=1):
        if not raw_line.strip():
            continue
        result.append(strict_json_loads(raw_line, f"{path}:{line_number}"))
    return result


def normalized_review_text(value: Any) -> str:
    return re.sub(r"\s+", " ", unicodedata.normalize("NFKC", str(value or ""))).strip()


def review_fingerprint(value: Mapping[str, Any]) -> str:
    return "sha256:" + sha256_bytes(canonical_json_bytes(value))


def goal_review_fingerprint(goal: Mapping[str, Any], rule_version: str) -> str:
    dimensions = goal.get("dimensionTags")
    dimension_map = dimensions if isinstance(dimensions, dict) else {}
    return review_fingerprint(
        {
            "ruleVersion": rule_version,
            "goalId": goal.get("id"),
            "shortKey": goal.get("shortKey", ""),
            "title": normalized_review_text(goal.get("title")),
            "titleEn": normalized_review_text(goal.get("titleEn")),
            "description": normalized_review_text(goal.get("description")),
            "descriptionEn": normalized_review_text(goal.get("descriptionEn")),
            "phase": normalized_review_text(dimension_map.get("phase")),
            "area": normalized_review_text(dimension_map.get("area")),
            "topicCode": normalized_review_text(dimension_map.get("topicCode")),
            "nodeKind": normalized_review_text(goal.get("nodeKind")),
        }
    )


def card_review_fingerprint(card: Mapping[str, Any], rule_version: str) -> str:
    tags = card.get("tags")
    normalized_tags = (
        [normalized_review_text(tag) for tag in tags if normalized_review_text(tag)]
        if isinstance(tags, list)
        else []
    )
    return review_fingerprint(
        {
            "ruleVersion": rule_version,
            "deckId": card.get("deckId"),
            "cardId": card.get("cardId"),
            "front": normalized_review_text(card.get("front")),
            "back": normalized_review_text(card.get("back")),
            "category": normalized_review_text(card.get("category")),
            "tags": normalized_tags,
        }
    )


def is_memory_goal(goal: Mapping[str, Any]) -> bool:
    tags = goal.get("tags")
    normalized_tags = (
        [tag for tag in tags if isinstance(tag, str)]
        if isinstance(tags, list)
        else []
    )
    return (
        goal.get("nodeKind") == "memory"
        or "memorization" in normalized_tags
        or any(tag.startswith("srs-deck:") for tag in normalized_tags)
    )


def is_review_relevant_leaf(goal: Mapping[str, Any]) -> bool:
    contains = goal.get("contains")
    if isinstance(contains, list) and contains:
        return False
    tags = goal.get("tags")
    normalized_tags = (
        {tag for tag in tags if isinstance(tag, str)}
        if isinstance(tags, list)
        else set()
    )
    if normalized_tags & {"Practice", "Assessment", "Motivation", "Orientation"}:
        return False
    return not is_memory_goal(goal) and goal.get("examData") is None


def configured_goal_scope(
    config: Mapping[str, Any], goal_by_id: Mapping[str, Mapping[str, Any]]
) -> set[str]:
    scope = config.get("scope")
    require(isinstance(scope, dict), "Quality review config has no scope")
    explicit = scope.get("leafGoalIds")
    if isinstance(explicit, list) and explicit:
        require(
            all(isinstance(goal_id, str) for goal_id in explicit),
            "Quality review leafGoalIds must be strings",
        )
        return set(explicit)
    roots = scope.get("rootGoalIds")
    require(
        isinstance(roots, list)
        and bool(roots)
        and all(isinstance(goal_id, str) for goal_id in roots),
        "Quality review config needs rootGoalIds or leafGoalIds",
    )
    visited: set[str] = set()
    pending = list(reversed(roots))
    while pending:
        goal_id = pending.pop()
        if goal_id in visited:
            continue
        goal = goal_by_id.get(goal_id)
        require(goal is not None, f"Quality review scope references unknown goal {goal_id}")
        visited.add(goal_id)
        contains = goal.get("contains")
        if isinstance(contains, list):
            require(
                all(isinstance(child_id, str) for child_id in contains),
                f"Malformed contains reference on {goal_id}",
            )
            pending.extend(reversed(contains))
    return visited


def canonical_float(value: float) -> str:
    """Render an IEEE-754 value using the profile's ECMAScript thresholds."""

    if not math.isfinite(value):
        raise ValidationError("Canonical JSON only permits finite numbers")
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
    digits_tuple = decimal.copy_abs().as_tuple()
    digits = "".join(str(digit) for digit in digits_tuple.digits)
    exponent = len(digits) + digits_tuple.exponent - 1
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
        return json.dumps(
            value, ensure_ascii=False, allow_nan=False, separators=(",", ":")
        )
    if isinstance(value, list):
        return "[" + ",".join(canonical_json_text(item) for item in value) + "]"
    if isinstance(value, dict):
        require(
            all(isinstance(key, str) for key in value),
            "Canonical JSON object keys must be strings",
        )
        return "{" + ",".join(
            canonical_json_text(key) + ":" + canonical_json_text(value[key])
            for key in sorted(value)
        ) + "}"
    raise ValidationError(f"Unsupported canonical JSON value: {type(value).__name__}")


def canonical_json_bytes(value: Any) -> bytes:
    validate_json_scalars(value, "canonical JSON input")
    return canonical_json_text(value).encode("utf-8")


def pretty_json_bytes(value: Any) -> bytes:
    return (
        json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, indent=2)
        + "\n"
    ).encode("utf-8")


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> tuple[int, str]:
    digest = hashlib.sha256()
    size = 0
    try:
        with path.open("rb") as handle:
            for chunk in iter(lambda: handle.read(4 * 1024 * 1024), b""):
                digest.update(chunk)
                size += len(chunk)
    except OSError as error:
        raise ValidationError(f"Cannot hash {path}: {error}") from error
    return size, digest.hexdigest()


def frame(value: str) -> bytes:
    raw = value.encode("utf-8")
    return len(raw).to_bytes(8, "big") + raw


def framed_digest(values: Iterable[str], *, prefixed: bool = False) -> str:
    result = hashlib.sha256(b"".join(frame(value) for value in values)).hexdigest()
    return f"sha256:{result}" if prefixed else result


def resolve_repo_path(value: str, *, must_exist: bool = True) -> Path:
    candidate = (REPO_ROOT / value).resolve()
    try:
        candidate.relative_to(REPO_ROOT)
    except ValueError as error:
        raise ValidationError(f"Repository path escapes checkout: {value}") from error
    if must_exist and not candidate.exists():
        raise ValidationError(f"Missing repository input: {value}")
    return candidate


def git_bytes(checkout: Path, arguments: Sequence[str]) -> bytes:
    try:
        result = subprocess.run(
            ["git", "-C", str(checkout), *arguments],
            check=False,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=30,
        )
    except (OSError, subprocess.SubprocessError) as error:
        raise ValidationError(f"Cannot inspect Core checkout {checkout}: {error}") from error
    require(
        result.returncode == 0,
        "Git inspection failed in Core checkout "
        + str(checkout)
        + ": "
        + result.stderr.decode("utf-8", errors="replace").strip(),
    )
    return result.stdout


def collect_core_terms(value: Any) -> list[str]:
    result: set[str] = set()

    def visit(node: Any) -> None:
        if isinstance(node, dict):
            for key, child in node.items():
                if key in {"coreClasses", "coreTerms"}:
                    require(
                        isinstance(child, list)
                        and all(isinstance(term, str) for term in child),
                        f"Malformed ontology-profile {key}",
                    )
                    result.update(child)
                else:
                    visit(child)
        elif isinstance(node, list):
            for child in node:
                visit(child)

    visit(value)
    return sorted(result)


def collect_compact_iri_terms(value: Any, prefix: str) -> list[str]:
    result: set[str] = set()
    marker = prefix + ":"

    def visit(node: Any) -> None:
        if isinstance(node, dict):
            for child in node.values():
                visit(child)
        elif isinstance(node, list):
            for child in node:
                visit(child)
        elif isinstance(node, str) and node.startswith(marker):
            require(
                re.fullmatch(rf"{re.escape(prefix)}:[A-Za-z0-9._~-]+", node)
                is not None,
                f"Malformed {prefix} compact IRI in field registry: {node}",
            )
            result.add(node)

    visit(value)
    return sorted(result)


def validate_ontology_registry_order_alignment(
    ontology_profile: Mapping[str, Any], registry_value: Mapping[str, Any]
) -> None:
    """Independently prove profile/registry agreement for ordered RDF lanes."""

    def collect_membership_terms(value: Any) -> set[str]:
        result: set[str] = set()

        def visit(node: Any) -> None:
            if isinstance(node, Mapping):
                for child in node.values():
                    visit(child)
            elif isinstance(node, list):
                for child in node:
                    visit(child)
            elif isinstance(node, str):
                if re.fullmatch(
                    r"[a-z][a-z0-9-]*:[A-Za-z_][A-Za-z0-9._-]*", node
                ):
                    result.add(node)

        visit(value)
        return result

    ordered_lanes: list[dict[str, Any]] = []
    for entry in registry_value.get("entries", []):
        if entry.get("classification") != "ordered-list":
            continue
        membership = (
            entry.get("rdfMapping", {}).get("construction", {}).get("membership")
        )
        require(
            isinstance(membership, dict),
            f"Ordered field-registry lane lacks membership construction: {entry.get('entryId')}",
        )
        lane = {
            "entryId": entry.get("entryId"),
            "pathPattern": entry.get("pathPattern"),
            "membershipClass": membership.get("membershipClass"),
            "ownerPredicate": membership.get("ownerPredicate"),
            "valuePredicate": membership.get("valuePredicate"),
            "positionPredicate": membership.get("positionPredicate"),
        }
        require(
            all(isinstance(value, str) and bool(value) for value in lane.values()),
            f"Malformed ordered field-registry lane: {entry.get('entryId')}",
        )
        lane["terms"] = collect_membership_terms(membership)
        ordered_lanes.append(lane)

    require(ordered_lanes, "Field registry declares no ordered reconstruction lanes")
    lanes_by_id = {lane["entryId"]: lane for lane in ordered_lanes}
    require(
        len(lanes_by_id) == len(ordered_lanes),
        "Field registry has duplicate ordered lane IDs",
    )
    all_position_terms = {lane["positionPredicate"] for lane in ordered_lanes}
    mappings = ontology_profile["mappings"]

    lane_bindings = {
        "contains": ("goal.contains",),
        "requires": ("goal.requires",),
        "visualReferences": ("goal.resource-links",),
        "compositionViews": ("view.root-nodes", "view.children"),
        "memoryCards": ("card-deck.cards",),
        "assessments": ("goal.scoring-steps", "goal.exam-covered-goals"),
        "authoredOrder": (
            "landscape.goals",
            "goal.contains",
            "goal.requires",
            "goal.resource-links",
            "view.root-nodes",
            "view.children",
            "card-deck.cards",
            "goal.scoring-steps",
        ),
    }

    for mapping_name, entry_ids in lane_bindings.items():
        missing_ids = [entry_id for entry_id in entry_ids if entry_id not in lanes_by_id]
        require(
            not missing_ids,
            f"Ontology mapping {mapping_name} references missing ordered registry lanes: "
            + ", ".join(missing_ids),
        )
        matched = [lanes_by_id[entry_id] for entry_id in entry_ids]
        rule = mappings[mapping_name]
        source_paths = set(rule["sourcePaths"])
        uncovered = [
            lane["entryId"]
            for lane in matched
            if not any(
                lane["pathPattern"] == source_path
                or lane["pathPattern"].startswith(source_path.rstrip("/") + "/")
                for source_path in source_paths
            )
        ]
        require(
            not uncovered,
            f"Ontology mapping {mapping_name} does not cover registry lane paths: "
            + ", ".join(uncovered),
        )
        declared = set(rule["coreTerms"]) | set(rule["applicationTerms"])
        expected_positions = {lane["positionPredicate"] for lane in matched}
        declared_positions = declared & all_position_terms
        if mapping_name == "authoredOrder":
            require(
                declared == expected_positions,
                "Ontology mapping authoredOrder must declare exactly the registry's "
                f"lane-specific position predicates; expected {sorted(expected_positions)}, "
                f"found {sorted(declared)}",
            )
            continue
        require(
            declared_positions == expected_positions,
            f"Ontology mapping {mapping_name} position predicates differ from the field registry; "
            f"expected {sorted(expected_positions)}, found {sorted(declared_positions)}",
        )
        if mapping_name in {"contains", "requires", "visualReferences"}:
            required_terms = set().union(*(lane["terms"] for lane in matched))
            missing_terms = sorted(required_terms - declared)
            require(
                not missing_terms,
                f"Ontology mapping {mapping_name} disagrees with field-registry carrier terms: "
                + ", ".join(missing_terms),
            )


def validate_ontology_profile_trust(
    build_profile: Mapping[str, Any],
    ontology_profile: Mapping[str, Any],
    ontology_profile_path: Path,
    registry_value: Mapping[str, Any],
) -> tuple[dict[str, Any], dict[str, Any]]:
    contracts = build_profile["contracts"]
    try:
        ontology_profile_bytes = ontology_profile_path.read_bytes()
    except OSError as error:
        raise ValidationError(f"Cannot read {ontology_profile_path}: {error}") from error
    require(
        strict_json_loads(ontology_profile_bytes, str(ontology_profile_path))
        == ontology_profile,
        "Curriculum ontology profile changed while being bound",
    )
    ontology_profile_sha256 = sha256_bytes(ontology_profile_bytes)
    require(
        ontology_profile_sha256 == contracts["ontologyProfileSha256"],
        "Curriculum ontology profile hash does not match build profile",
    )
    namespaces = ontology_profile["namespaceBindings"]
    namespace_sha256 = sha256_bytes(canonical_json_bytes(namespaces))
    require(
        namespace_sha256 == contracts["ontologyNamespaceBindingsSha256"],
        "Ontology namespace-binding hash does not match build profile",
    )
    for prefix, iri in registry_value["namespaceBindings"].items():
        require(
            prefix not in namespaces or namespaces[prefix] == iri,
            f"Ontology profile and field registry disagree on namespace {prefix}",
        )
    compatibility = registry_value["compatibility"]
    require(
        namespaces.get("sp")
        == ontology_profile["applicationVocabulary"]["namespaceIri"]
        == compatibility["skillpilotProfileIri"],
        "Application-vocabulary namespace binding is inconsistent",
    )

    validate_ontology_registry_order_alignment(ontology_profile, registry_value)

    terms = collect_core_terms(ontology_profile)
    registry_core_terms = collect_compact_iri_terms(registry_value, "lp")
    undeclared_registry_core_terms = sorted(set(registry_core_terms) - set(terms))
    require(
        not undeclared_registry_core_terms,
        "Field registry uses Core terms outside the trusted ontology profile: "
        + ", ".join(undeclared_registry_core_terms[:10]),
    )
    expanded_terms: list[str] = []
    for term in terms:
        prefix, separator, local_name = term.partition(":")
        require(
            separator == ":" and prefix in namespaces and bool(local_name),
            f"Unbound Core compact IRI in ontology profile: {term}",
        )
        expanded_terms.append(namespaces[prefix] + local_name)

    binding = ontology_profile["coreBinding"]
    declared_checkout = REPO_ROOT.joinpath(*Path(binding["checkoutPath"]).parts)
    current = REPO_ROOT
    for segment in Path(binding["checkoutPath"]).parts:
        current = current / segment
        require(
            not current.is_symlink(),
            "Symlinks are forbidden in the FWU Core checkout path",
        )
    checkout = resolve_repo_path(binding["checkoutPath"])
    require(
        checkout.is_dir() and not checkout.is_symlink(),
        "FWU Core checkout must be a real repository directory",
    )
    top_level = Path(
        git_bytes(checkout, ["rev-parse", "--show-toplevel"])
        .decode("utf-8", errors="strict")
        .strip()
    ).resolve()
    require(top_level == checkout, "FWU Core checkout path is not the Git worktree root")
    remote_urls = (
        git_bytes(checkout, ["remote", "get-url", "--all", "origin"])
        .decode("utf-8", errors="strict")
        .splitlines()
    )
    require(
        remote_urls == [binding["sourceRepository"]],
        "FWU Core checkout origin does not match ontology profile",
    )
    head = (
        git_bytes(checkout, ["rev-parse", "--verify", "HEAD^{commit}"])
        .decode("ascii", errors="strict")
        .strip()
    )
    require(head == binding["commit"], "FWU Core checkout HEAD does not match ontology profile")

    source_path = binding["sourcePath"]
    tree_entry = (
        git_bytes(checkout, ["ls-tree", binding["commit"], "--", source_path])
        .decode("utf-8", errors="strict")
        .strip()
    )
    require(
        tree_entry.startswith("100644 blob ") and tree_entry.endswith("\t" + source_path),
        "FWU Core source is not one regular tracked file at the pinned commit",
    )
    committed_bytes = git_bytes(
        checkout, ["show", f"{binding['commit']}:{source_path}"]
    )
    committed_sha256 = sha256_bytes(committed_bytes)
    require(
        committed_sha256 == binding["fileSha256"],
        "Pinned FWU Core Git blob hash does not match ontology profile",
    )
    source_file = checkout.joinpath(*source_path.split("/"))
    current = declared_checkout
    for segment in source_path.split("/"):
        current = current / segment
        require(
            not current.is_symlink(),
            "Symlinks are forbidden in the FWU Core source path",
        )
    try:
        resolved_source = source_file.resolve(strict=True)
        resolved_source.relative_to(checkout)
    except (OSError, ValueError) as error:
        raise ValidationError("FWU Core source path escapes or is missing") from error
    require(resolved_source.is_file(), "FWU Core source must be a regular file")
    try:
        source_bytes = resolved_source.read_bytes()
    except OSError as error:
        raise ValidationError(f"Cannot read FWU Core source: {error}") from error
    require(
        source_bytes == committed_bytes,
        "FWU Core working-tree file differs from the pinned Git blob",
    )
    require(
        not git_bytes(
            checkout,
            ["status", "--porcelain=v1", "--untracked-files=no", "--", source_path],
        ),
        "FWU Core source has uncommitted worktree changes",
    )
    require(
        f"Ontology(<{binding['ontologyIri']}>".encode("utf-8") in committed_bytes,
        "FWU Core file does not declare the bound ontology IRI",
    )
    missing_terms = [
        iri for iri in expanded_terms if b"<" + iri.encode("utf-8") + b">" not in committed_bytes
    ]
    require(
        not missing_terms,
        "Ontology profile references terms absent from pinned FWU Core: "
        + ", ".join(missing_terms[:10]),
    )

    profile_binding = {
        "profileId": ontology_profile["profileId"],
        "profileVersion": ontology_profile["version"],
        "path": str(ontology_profile_path.relative_to(REPO_ROOT)).replace("\\", "/"),
        "sha256": ontology_profile_sha256,
        "namespaceBindings": dict(sorted(namespaces.items())),
        "namespaceBindingsSha256": namespace_sha256,
        "coreTermCount": len(terms),
        "coreTermsSha256": sha256_bytes(canonical_json_bytes(terms)),
    }
    core_binding = {
        "ontologyIri": binding["ontologyIri"],
        "sourceRepository": binding["sourceRepository"],
        "checkoutPath": binding["checkoutPath"],
        "commit": binding["commit"],
        "sourcePath": source_path,
        "bytes": len(committed_bytes),
        "fileSha256": committed_sha256,
    }
    return profile_binding, core_binding


def resolve_release_root(value: str) -> Path:
    candidate = Path(value)
    candidate = (
        (REPO_ROOT / candidate).resolve() if not candidate.is_absolute() else candidate.resolve()
    )
    try:
        candidate.relative_to((REPO_ROOT / "tmp").resolve())
    except ValueError as error:
        raise ValidationError("Release-model root must stay below repository tmp/") from error
    require(candidate.is_dir(), f"Release-model root is not a directory: {candidate}")
    return candidate


def safe_join(root: Path, relative_path: str, *, must_exist: bool = True) -> Path:
    if relative_path.startswith("/") or "\\" in relative_path:
        raise ValidationError(f"Unsafe package-relative path: {relative_path}")
    parts = relative_path.split("/")
    if any(part in {"", ".", ".."} for part in parts):
        raise ValidationError(f"Unsafe package-relative path: {relative_path}")
    target = (root / Path(*parts)).resolve()
    try:
        target.relative_to(root.resolve())
    except ValueError as error:
        raise ValidationError(f"Package path escapes root: {relative_path}") from error
    if must_exist and not target.exists():
        raise ValidationError(f"Missing release-model artifact: {relative_path}")
    return target


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
        raise ValidationError(f"Invalid JSON Pointer: {value}")
    result: list[str] = []
    for raw in value[1:].split("/"):
        decoded = ""
        index = 0
        while index < len(raw):
            if raw[index] != "~":
                decoded += raw[index]
                index += 1
                continue
            if index + 1 >= len(raw) or raw[index + 1] not in {"0", "1"}:
                raise ValidationError(f"Invalid RFC-6901 escape in {value!r}")
            decoded += "~" if raw[index + 1] == "0" else "/"
            index += 2
        result.append(decoded)
    return tuple(result)


def resolve_pointer(value: Any, json_pointer: str) -> Any:
    current = value
    for segment in pointer_segments(json_pointer):
        if isinstance(current, dict):
            if segment not in current:
                raise ValidationError(f"JSON Pointer does not exist: {json_pointer}")
            current = current[segment]
        elif isinstance(current, list):
            if not segment.isdigit() or (segment.startswith("0") and segment != "0"):
                raise ValidationError(f"Invalid array index in JSON Pointer: {json_pointer}")
            index = int(segment)
            if index >= len(current):
                raise ValidationError(f"JSON Pointer index out of bounds: {json_pointer}")
            current = current[index]
        else:
            raise ValidationError(f"JSON Pointer traverses a scalar: {json_pointer}")
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
            answer = pattern[left] in {"*", concrete[right]} and visit(
                left + 1, right + 1
            )
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
class PublicationFieldClassification:
    classification_id: str
    input_role: str
    pattern: tuple[str, ...]
    scope: str
    disposition: str
    projection: str


class PublicationInputClassifier:
    """Fail closed when an authoring input field lacks one explicit policy."""

    def __init__(self, profile: Mapping[str, Any]) -> None:
        raw_entries = profile.get("fieldClassifications")
        require(
            isinstance(raw_entries, list) and bool(raw_entries),
            "Publication-evidence field classifications are missing",
        )
        entries: list[PublicationFieldClassification] = []
        seen_ids: set[str] = set()
        for raw in raw_entries:
            require(isinstance(raw, dict), "Malformed publication field classification")
            classification_id = raw.get("classificationId")
            require(
                isinstance(classification_id, str)
                and classification_id not in seen_ids,
                f"Duplicate or malformed publication classification ID: {classification_id}",
            )
            seen_ids.add(classification_id)
            entries.append(
                PublicationFieldClassification(
                    classification_id=classification_id,
                    input_role=str(raw["inputRole"]),
                    pattern=pointer_segments(str(raw["pathPattern"])),
                    scope=str(raw["scope"]),
                    disposition=str(raw["disposition"]),
                    projection=str(raw["projection"]),
                )
            )
        self.entries = entries
        self.by_role: dict[str, list[PublicationFieldClassification]] = defaultdict(list)
        for entry in entries:
            self.by_role[entry.input_role].append(entry)
        self.hits: Counter[str] = Counter()

    @staticmethod
    def matches(
        entry: PublicationFieldClassification, concrete: tuple[str, ...]
    ) -> bool:
        if entry.scope == "field":
            return match_pattern(entry.pattern, concrete)
        require(
            entry.scope == "subtree",
            f"Unsupported publication classification scope {entry.scope}",
        )
        return any(
            match_pattern(entry.pattern, concrete[:length])
            for length in range(len(concrete), 0, -1)
        )

    def classify(self, input_role: str, path: str) -> PublicationFieldClassification:
        concrete = pointer_segments(path)
        matches = [
            entry
            for entry in self.by_role.get(input_role, [])
            if self.matches(entry, concrete)
        ]
        require(matches, f"Unclassified authoring input field {input_role}:{path}")
        best = max(pattern_specificity(entry.pattern) for entry in matches)
        selected = [
            entry for entry in matches if pattern_specificity(entry.pattern) == best
        ]
        require(
            len(selected) == 1,
            f"Ambiguous authoring input classification for {input_role}:{path}: "
            + ", ".join(entry.classification_id for entry in selected),
        )
        self.hits[selected[0].classification_id] += 1
        return selected[0]

    def observe(self, input_role: str, value: Any, path: str = "") -> None:
        if isinstance(value, dict):
            for key in sorted(value):
                child_path = (
                    f"{path}/{escape_pointer_segment(key)}"
                    if path
                    else f"/{escape_pointer_segment(key)}"
                )
                self.classify(input_role, child_path)
                self.observe(input_role, value[key], child_path)
        elif isinstance(value, list):
            for index, child in enumerate(value):
                self.observe(input_role, child, f"{path}/{index}")

    def assert_complete(self) -> None:
        unused = sorted(
            entry.classification_id
            for entry in self.entries
            if not self.hits[entry.classification_id]
        )
        require(
            not unused,
            "Unobserved publication-evidence field classifications: "
            + ", ".join(unused[:20]),
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
        entries = value.get("entries")
        require(isinstance(entries, list), "Field registry entries are missing")
        self.value = value
        self.entries: list[RegistryEntry] = []
        self.by_role: dict[str, list[RegistryEntry]] = defaultdict(list)
        self.by_id: dict[str, RegistryEntry] = {}
        self._direct_cache: dict[tuple[str, str], RegistryEntry | None] = {}
        self._effective_cache: dict[tuple[str, str], RegistryEntry] = {}
        for raw in entries:
            require(isinstance(raw, dict), "Malformed field-registry entry")
            entry = RegistryEntry(raw, pointer_segments(str(raw["pathPattern"])))
            require(entry.entry_id not in self.by_id, f"Duplicate registry entryId: {entry.entry_id}")
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
        require(
            not numeric_literals,
            "Index-neutral registry caching is unsafe with literal numeric pattern segments: "
            + ", ".join(numeric_literals),
        )

    @staticmethod
    def cache_key(role: str, path: str) -> tuple[str, str]:
        segments = tuple(
            "*" if segment.isdigit() else segment
            for segment in pointer_segments(path)
        )
        return role, pointer(*segments)

    def direct(self, role: str, path: str) -> RegistryEntry | None:
        cache_key = self.cache_key(role, path)
        if cache_key in self._direct_cache:
            return self._direct_cache[cache_key]
        concrete = pointer_segments(path)
        matches = [
            entry
            for entry in self.by_role.get(role, [])
            if match_pattern(entry.pattern, concrete)
        ]
        if not matches:
            self._direct_cache[cache_key] = None
            return None
        best = max(pattern_specificity(entry.pattern) for entry in matches)
        selected = [
            entry for entry in matches if pattern_specificity(entry.pattern) == best
        ]
        if len(selected) != 1:
            raise ValidationError(
                f"Ambiguous field-registry match for {role}:{path}: "
                + ", ".join(entry.entry_id for entry in selected)
            )
        self._direct_cache[cache_key] = selected[0]
        return selected[0]

    def effective(self, role: str, path: str) -> RegistryEntry:
        cache_key = self.cache_key(role, path)
        cached = self._effective_cache.get(cache_key)
        if cached is not None:
            return cached
        direct = self.direct(role, path)
        if direct is not None:
            self._effective_cache[cache_key] = direct
            return direct
        segments = pointer_segments(path)
        for length in range(len(segments) - 1, 0, -1):
            ancestor = self.direct(role, pointer(*segments[:length]))
            if ancestor is None:
                continue
            mapping = ancestor.data.get("rdfMapping")
            if (
                isinstance(mapping, dict)
                and mapping.get("strategy") == "registered-canonical-json-literal"
            ):
                self._effective_cache[cache_key] = ancestor
                return ancestor
        raise ValidationError(f"Unregistered release-model field {role}:{path}")


def json_type(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "boolean"
    if isinstance(value, int):
        return "integer"
    if isinstance(value, float):
        return "number"
    if isinstance(value, str):
        return "string"
    if isinstance(value, list):
        return "array"
    return "object"


class Normalizer:
    def __init__(self, registry: FieldRegistry, *, track: bool = False) -> None:
        self.registry = registry
        self.track = track
        self.occurrences: Counter[str] = Counter()
        self.observed_types: dict[str, set[str]] = defaultdict(set)
        self.concrete_paths: dict[str, set[str]] = defaultdict(set)

    def normalize(self, role: str, value: Any, path: str = "") -> Any:
        if isinstance(value, dict):
            result: dict[str, Any] = {}
            for key in sorted(value):
                child_path = (
                    f"{path}/{escape_pointer_segment(key)}"
                    if path
                    else f"/{escape_pointer_segment(key)}"
                )
                entry = self.registry.effective(role, child_path)
                if self.track:
                    self.occurrences[entry.entry_id] += 1
                    self.observed_types[entry.entry_id].add(json_type(value[key]))
                    self.concrete_paths[entry.entry_id].add(child_path)
                if entry.data.get("classification") == "generated-non-semantic":
                    continue
                result[key] = self.normalize(role, value[key], child_path)
            return result
        if isinstance(value, list):
            entry = self.registry.direct(role, path)
            normalized = [
                self.normalize(role, child, f"{path}/{index}")
                for index, child in enumerate(value)
            ]
            if entry is not None and entry.data.get("classification") == "set":
                encoded = [canonical_json_bytes(child) for child in normalized]
                if len(encoded) != len(set(encoded)):
                    raise ValidationError(
                        f"Duplicate item in registry-declared set {role}:{path}"
                    )
                normalized = [
                    child
                    for _, child in sorted(
                        zip(encoded, normalized), key=lambda item: item[0]
                    )
                ]
            return normalized
        return value


def validate_schema(
    value: Any,
    validator: Draft202012Validator,
    context: str,
) -> None:
    errors = sorted(
        validator.iter_errors(value),
        key=lambda item: tuple(str(part) for part in item.absolute_path),
    )
    if not errors:
        return
    rendered: list[str] = []
    for error in errors[:20]:
        location = "/" + "/".join(str(part) for part in error.absolute_path)
        rendered.append(f"{location}: {error.message}")
    suffix = "" if len(errors) <= 20 else f" (+{len(errors) - 20} more)"
    raise ValidationError(
        f"{context} violates its closed schema: {'; '.join(rendered)}{suffix}"
    )


def first_difference(left: Any, right: Any, path: str = "") -> str | None:
    if type(left) is not type(right):
        return f"{path or '/'}: type {type(left).__name__} != {type(right).__name__}"
    if isinstance(left, dict):
        left_keys = set(left)
        right_keys = set(right)
        if left_keys != right_keys:
            return (
                f"{path or '/'}: keys differ; missing={sorted(right_keys-left_keys)}, "
                f"extra={sorted(left_keys-right_keys)}"
            )
        for key in sorted(left):
            child = first_difference(
                left[key],
                right[key],
                f"{path}/{escape_pointer_segment(key)}",
            )
            if child is not None:
                return child
        return None
    if isinstance(left, list):
        if len(left) != len(right):
            return f"{path or '/'}: length {len(left)} != {len(right)}"
        for index, (left_child, right_child) in enumerate(zip(left, right)):
            child = first_difference(left_child, right_child, f"{path}/{index}")
            if child is not None:
                return child
        return None
    if left != right:
        return f"{path or '/'}: {left!r} != {right!r}"
    return None


def assert_json_equal(actual: Any, expected: Any, context: str) -> None:
    difference = first_difference(actual, expected)
    if difference is not None:
        raise ValidationError(f"{context} differs from trusted reconstruction at {difference}")


def source_fingerprint(goal: Mapping[str, Any], contract: Mapping[str, Any]) -> str:
    records: list[dict[str, Any]] = []
    for field_pointer in contract["pointers"]:
        require(
            isinstance(field_pointer, str)
            and field_pointer.startswith("/")
            and "/" not in field_pointer[1:],
            f"Unsupported semantic-kind fingerprint pointer: {field_pointer!r}",
        )
        key = field_pointer[1:]
        if key not in goal:
            records.append({"path": field_pointer, "state": "missing"})
            continue
        value = copy.deepcopy(goal[key])
        if field_pointer == "/tags":
            require(
                isinstance(value, list)
                and all(isinstance(item, str) for item in value),
                f"Goal {goal.get('id')} has invalid tags",
            )
            require(
                len(value) == len(set(value)),
                f"Goal {goal.get('id')} has duplicate tags",
            )
            value = sorted(value)
        records.append({"path": field_pointer, "state": "value", "value": value})
    projection = {"domain": contract["domain"], "fields": records}
    return "sha256:" + sha256_bytes(canonical_json_bytes(projection))


def relocate_path(value: str, source_prefix: str, target_prefix: str) -> str:
    require(
        value.startswith(source_prefix),
        f"Path does not match explicit relocation prefix: {value}",
    )
    suffix = value[len(source_prefix) :]
    require(
        bool(suffix) and not suffix.startswith("/") and "\\" not in suffix,
        f"Unsafe relocation suffix: {value}",
    )
    require(
        all(part not in {"", ".", ".."} for part in suffix.split("/")),
        f"Unsafe relocation suffix: {value}",
    )
    return target_prefix.rstrip("/") + "/" + suffix


def image_media_type(path: Path) -> str:
    try:
        with path.open("rb") as handle:
            head = handle.read(8)
    except OSError as error:
        raise ValidationError(f"Cannot inspect image {path}: {error}") from error
    if path.suffix.lower() == ".jpg" and head.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if path.suffix.lower() == ".png" and head == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    raise ValidationError(f"Unsupported or invalid image payload: {path}")


def entity_key_id(value: Mapping[str, Any]) -> str:
    return canonical_json_bytes(value).decode("utf-8")


def definition_digest(
    key: Mapping[str, Any], normalized_body: Any, profile: Mapping[str, Any]
) -> str:
    payload = canonical_json_bytes({"body": normalized_body, "key": key}).decode("utf-8")
    return framed_digest(
        [str(profile["definitionDigest"]["domain"]), payload], prefixed=True
    )


def semantic_body_digest(normalized_body: Any, profile: Mapping[str, Any]) -> str:
    return framed_digest(
        [
            str(profile["semanticBodyDigest"]["domain"]),
            canonical_json_bytes(normalized_body).decode("utf-8"),
        ],
        prefixed=True,
    )


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
    digest_profile: Mapping[str, Any],
) -> str:
    projection = normalizer.normalize(role, value)
    return framed_digest(
        [
            str(digest_profile["domain"]),
            canonical_json_bytes(projection).decode("utf-8"),
        ],
        prefixed=True,
    )


def logical_record_digest(
    artifact: Mapping[str, Any], normalization: Mapping[str, Any]
) -> str:
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


def binary_record_digest(
    resource: Mapping[str, Any], normalization: Mapping[str, Any]
) -> str:
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


def semantic_content_digest(
    index: Mapping[str, Any], normalization: Mapping[str, Any]
) -> str:
    values: list[str] = [str(normalization["contentDigest"]["domain"])]
    for key in ("normalizationProfile", "fieldSemanticsRegistry"):
        binding = index[key]
        values.extend(
            [str(binding["id"]), str(binding["version"]), str(binding["sha256"])]
        )
    values.append("semantic-artifact-records")
    for artifact in sorted(
        index["logicalArtifacts"], key=lambda item: (item["role"], item["logicalId"])
    ):
        values.append(str(artifact["recordSha256"]))
    values.append("binary-asset-records")
    for resource in sorted(index["binaryResources"], key=lambda item: item["resourceId"]):
        values.append(str(resource["recordSha256"]))
    return framed_digest(values, prefixed=True)


def collect_view_goal_references(
    nodes: Sequence[Any], prefix: tuple[object, ...] = ("rootNodes",)
) -> Iterator[tuple[str, str, str]]:
    for index, raw in enumerate(nodes):
        require(isinstance(raw, dict), "Malformed composition-view node")
        current = (*prefix, index)
        for field, registry_id in (
            ("landscapeId", "view.node-landscape-id"),
            ("goalId", "view.node-goal-id"),
            ("rootGoalId", "view.node-root-goal-id"),
        ):
            value = raw.get(field)
            if isinstance(value, str):
                yield pointer(*current, field), registry_id, value
        children = raw.get("children")
        if isinstance(children, list):
            yield from collect_view_goal_references(children, (*current, "children"))


def collect_goal_competency_references(
    goal: Mapping[str, Any],
) -> Iterator[tuple[str, str, str]]:
    """Yield both current and legacy schema-valid competency references."""

    for field, registry_id in (
        ("competencyRefs", "goal.competency-refs"),
        ("kompetenzen", "goal.kompetenzen"),
    ):
        for index, target_id in enumerate(goal.get(field, [])):
            yield pointer(field, index), registry_id, target_id


def assert_acyclic(goals: Sequence[Mapping[str, Any]], relation: str) -> None:
    graph = {str(goal["id"]): list(goal.get(relation, [])) for goal in goals}
    states: dict[str, int] = {}
    stack: list[str] = []

    def visit(goal_id: str) -> None:
        state = states.get(goal_id, 0)
        if state == 2:
            return
        if state == 1:
            start = stack.index(goal_id)
            raise ValidationError(
                f"{relation} cycle: {' -> '.join([*stack[start:], goal_id])}"
            )
        states[goal_id] = 1
        stack.append(goal_id)
        for target in graph[goal_id]:
            require(target in graph, f"Unresolved {relation} target {target} from {goal_id}")
            visit(target)
        stack.pop()
        states[goal_id] = 2

    for goal_id in graph:
        visit(goal_id)


def assert_program_unit_hierarchy_acyclic(units: Sequence[Mapping[str, Any]]) -> None:
    parents: dict[str, str | None] = {}
    for unit in units:
        unit_id = str(unit["id"])
        require(unit_id not in parents, f"Duplicate program-unit ID: {unit_id}")
        parent_id = unit.get("parentUnitId")
        parents[unit_id] = str(parent_id) if isinstance(parent_id, str) else None

    states: dict[str, int] = {}
    stack: list[str] = []

    def visit(unit_id: str) -> None:
        state = states.get(unit_id, 0)
        if state == 2:
            return
        if state == 1:
            start = stack.index(unit_id)
            raise ValidationError(
                "program-unit parent cycle: "
                + " -> ".join([*stack[start:], unit_id])
            )
        states[unit_id] = 1
        stack.append(unit_id)
        parent_id = parents[unit_id]
        if parent_id is not None:
            require(
                parent_id in parents,
                f"Unknown parent program unit {parent_id} from {unit_id}",
            )
            visit(parent_id)
        stack.pop()
        states[unit_id] = 2

    for unit_id in parents:
        visit(unit_id)


def resolve_schema_ref(root: Mapping[str, Any], ref: str) -> Mapping[str, Any]:
    require(ref.startswith("#/"), f"Only local schema references are supported: {ref}")
    current: Any = root
    for raw_segment in ref[2:].split("/"):
        segment = raw_segment.replace("~1", "/").replace("~0", "~")
        require(
            isinstance(current, dict) and segment in current,
            f"Broken local schema reference: {ref}",
        )
        current = current[segment]
    require(isinstance(current, dict), f"Schema reference is not an object: {ref}")
    return current


def schema_field_paths(root: Mapping[str, Any]) -> set[tuple[str, ...]]:
    """Enumerate every reachable named field in one closed artifact schema."""

    result: set[tuple[str, ...]] = set()

    def walk(
        node: Any,
        path: tuple[str, ...],
        ref_depths: Mapping[str, int],
    ) -> None:
        if not isinstance(node, dict):
            return
        ref = node.get("$ref")
        if isinstance(ref, str):
            depth = ref_depths.get(ref, 0)
            # Four recursive node levels are enough to prove all ** registry
            # patterns while bounding composition-view recursion.
            if depth < 4:
                updated = dict(ref_depths)
                updated[ref] = depth + 1
                walk(resolve_schema_ref(root, ref), path, updated)
        properties = node.get("properties")
        if isinstance(properties, dict):
            for name, child in properties.items():
                require(isinstance(name, str), "Schema property name must be a string")
                child_path = (*path, name)
                result.add(child_path)
                walk(child, child_path, ref_depths)
        items = node.get("items")
        if isinstance(items, dict):
            walk(items, (*path, "*"), ref_depths)
        prefix_items = node.get("prefixItems")
        if isinstance(prefix_items, list):
            for child in prefix_items:
                walk(child, (*path, "*"), ref_depths)
        for keyword in ("allOf", "anyOf", "oneOf"):
            branches = node.get(keyword)
            if isinstance(branches, list):
                for branch in branches:
                    walk(branch, path, ref_depths)
        for keyword in ("then", "else"):
            walk(node.get(keyword), path, ref_depths)

    walk(root, (), {})
    return result


def validate_schema_registry_coverage(
    registry: FieldRegistry,
    schemas: Mapping[str, Mapping[str, Any]],
    publication_profile: Mapping[str, Any],
) -> None:
    """Prove schema→registry completeness and reject dead runtime entries."""

    paths_by_role: dict[str, set[tuple[str, ...]]] = {}
    for role, schema_name in ARTIFACT_SCHEMA_NAMES.items():
        if role not in RUNTIME_REGISTRY_ROLES:
            continue
        paths = schema_field_paths(schemas[schema_name])
        require(paths, f"No reachable fields found in {schema_name}")
        paths_by_role[role] = paths
        for segments in sorted(paths):
            concrete = pointer(*segments)
            registry.effective(role, concrete)
    dead_entries: list[str] = []
    for entry in registry.entries:
        if entry.role not in paths_by_role:
            continue
        if not any(
            match_pattern(entry.pattern, schema_path)
            for schema_path in paths_by_role[entry.role]
        ):
            dead_entries.append(f"{entry.entry_id}:{entry.data['pathPattern']}")
    require(
        not dead_entries,
        "Runtime registry entries do not map to reachable schema fields: "
        + ", ".join(sorted(dead_entries)[:20]),
    )

    publication_roles = {
        output["artifactRole"]: output["normalizationRole"]
        for output in publication_profile["outputArtifacts"].values()
    }
    require(
        set(publication_roles) == PUBLICATION_ARTIFACT_ROLES
        and set(publication_roles.values())
        == {
            "source-to-canonical-mappings",
            "official-source-index",
            "source-goal-reference-index",
            "release-quality-evidence",
        },
        "Publication artifact/normalization role binding is incomplete",
    )
    require(
        all(role in registry.by_role for role in publication_roles.values()),
        "Publication normalization role has no field-registry entries",
    )


@dataclass
class TrustedContext:
    profile_path: Path
    profile: dict[str, Any]
    registry_path: Path
    registry_value: dict[str, Any]
    registry: FieldRegistry
    normalization_path: Path
    normalization: dict[str, Any]
    ontology_profile_path: Path
    ontology_profile: dict[str, Any]
    ontology_profile_binding: dict[str, Any]
    fwu_core_binding: dict[str, Any]
    definition_profile_path: Path
    definition_profile: dict[str, Any]
    ledger_path: Path
    ledger: dict[str, Any]
    publication_profile_path: Path
    publication_profile: dict[str, Any]
    schemas: dict[str, dict[str, Any]]
    validators: dict[str, Draft202012Validator]


def load_trusted_context(profile_path: Path) -> TrustedContext:
    try:
        profile_path = profile_path.resolve(strict=True)
        profile_path.relative_to(REPO_ROOT)
    except (OSError, ValueError) as error:
        raise ValidationError("Build profile must be an existing repository file") from error

    schemas: dict[str, dict[str, Any]] = {}
    validators: dict[str, Draft202012Validator] = {}
    for name, path in SCHEMA_FILES.items():
        schema = load_json(path)
        require(isinstance(schema, dict), f"Schema is not an object: {path}")
        try:
            Draft202012Validator.check_schema(schema)
        except Exception as error:  # jsonschema exposes several schema-error subclasses
            raise ValidationError(f"Invalid trusted schema {path}: {error}") from error
        schemas[name] = schema
        validators[name] = Draft202012Validator(
            schema, format_checker=FormatChecker()
        )
    for name, schema_id in SCHEMA_IDS.items():
        require(
            schemas[name].get("$id") == schema_id,
            f"Unexpected $id in trusted {name} schema",
        )

    profile = load_json(profile_path)
    require(isinstance(profile, dict), "Build profile must be an object")
    validate_schema(profile, validators["build-profile"], str(profile_path))

    contracts = profile["contracts"]
    registry_path = resolve_repo_path(contracts["fieldSemanticsRegistryPath"])
    normalization_path = resolve_repo_path(contracts["normalizationProfilePath"])
    ontology_profile_path = resolve_repo_path(contracts["ontologyProfilePath"])
    publication_profile_path = resolve_repo_path(
        contracts["publicationEvidenceProfilePath"]
    )
    definition_profile_path = (
        CONTRACT_ROOT / "profiles/canonical-definition-record-v1.profile.json"
    )
    ledger_path = resolve_repo_path(
        profile["canonicalLandscape"]["semanticKindLedgerPath"]
    )

    registry_value = load_json(registry_path)
    normalization = load_json(normalization_path)
    ontology_profile = load_json(ontology_profile_path)
    definition_profile = load_json(definition_profile_path)
    ledger = load_json(ledger_path)
    publication_profile = load_json(publication_profile_path)
    for value, schema_name, label in (
        (registry_value, "field-registry", "field-semantics registry"),
        (normalization, "normalization-profile", "semantic normalization profile"),
        (ontology_profile, "ontology-profile", "curriculum ontology profile"),
        (definition_profile, "definition-profile", "definition digest profile"),
        (ledger, "ontology-profile", "semantic-kind ledger"),
        (
            publication_profile,
            "publication-evidence-profile",
            "publication-evidence projection profile",
        ),
    ):
        require(isinstance(value, dict), f"{label} must be an object")
        validate_schema(value, validators[schema_name], label)

    ontology_profile_binding, fwu_core_binding = validate_ontology_profile_trust(
        profile, ontology_profile, ontology_profile_path, registry_value
    )
    require(
        sha256_file(publication_profile_path)[1]
        == contracts["publicationEvidenceProfileSha256"],
        "Publication-evidence profile hash does not match build profile",
    )

    registry = FieldRegistry(registry_value)
    validate_schema_registry_coverage(registry, schemas, publication_profile)
    package = profile["package"]
    expected_release_id = f"{package['packageId']}@{package['packageVersion']}"
    require(
        package["releaseId"] == expected_release_id,
        f"releaseId must be {expected_release_id}",
    )
    compatibility = registry_value["compatibility"]
    require(
        compatibility["releaseModelContractVersion"]
        == contracts["runtimeContractVersion"],
        "Field-registry runtime-contract binding mismatch",
    )
    require(
        compatibility["normalizationProfileId"] == normalization["profileId"]
        and compatibility["normalizationProfileVersion"] == normalization["version"],
        "Field-registry normalization binding mismatch",
    )
    require(
        normalization["compatibility"]["fieldRegistryFormatVersion"]
        == registry_value["registryFormatVersion"],
        "Normalization profile rejects the field-registry format",
    )
    require(
        definition_profile["canonicalJsonProfile"] == normalization["profileId"],
        "Definition digest profile uses an untrusted normal form",
    )
    number_policy = normalization["canonicalJson"]["numberPolicy"]
    require(
        number_policy["finiteOnly"] is True
        and number_policy["negativeZero"] == "canonicalize-to-zero"
        and number_policy["serialization"] == "ecmascript-shortest-roundtrip",
        "Validator requires the pinned ECMAScript canonical-number policy",
    )
    require(
        ontology_profile["releaseModelContractVersion"]
        == contracts["runtimeContractVersion"],
        "Ontology profile runtime-contract binding mismatch",
    )
    require(
        publication_profile["releaseModelContractVersion"]
        == contracts["runtimeContractVersion"]
        and publication_profile["targetLandscapeId"]
        == profile["canonicalLandscape"]["landscapeId"],
        "Publication-evidence profile release/landscape binding mismatch",
    )

    source_fingerprint_contract = ontology_profile["semanticKindDecisions"][
        "sourceFingerprint"
    ]
    require(
        source_fingerprint_contract["canonicalJsonProfile"]
        == normalization["profileId"]
        and source_fingerprint_contract["canonicalJsonProfileVersion"]
        == normalization["version"]
        and source_fingerprint_contract["canonicalJsonProfilePath"]
        == str(normalization_path.relative_to(REPO_ROOT)).replace("\\", "/")
        and source_fingerprint_contract["canonicalJsonProfileSha256"]
        == sha256_file(normalization_path)[1],
        "Semantic-kind source fingerprints are not bound to the trusted normal form",
    )
    require(
        ontology_profile["semanticKindDecisions"]["ledgerPath"]
        == str(ledger_path.relative_to(REPO_ROOT)).replace("\\", "/")
        and ontology_profile["semanticKindDecisions"]["ledgerId"]
        == ledger["ledgerId"],
        "Ontology profile does not bind the selected semantic-kind ledger",
    )
    require(
        ledger["profileId"] == ontology_profile["profileId"]
        and ledger["profileVersion"] == ontology_profile["version"],
        "Semantic-kind ledger/profile binding mismatch",
    )
    require(
        ontology_profile["coreBinding"]["ontologyIri"]
        == compatibility["fwuCoreOntologyIri"],
        "Ontology profile and field registry bind different FWU Core IRIs",
    )
    return TrustedContext(
        profile_path=profile_path,
        profile=profile,
        registry_path=registry_path,
        registry_value=registry_value,
        registry=registry,
        normalization_path=normalization_path,
        normalization=normalization,
        ontology_profile_path=ontology_profile_path,
        ontology_profile=ontology_profile,
        ontology_profile_binding=ontology_profile_binding,
        fwu_core_binding=fwu_core_binding,
        definition_profile_path=definition_profile_path,
        definition_profile=definition_profile,
        ledger_path=ledger_path,
        ledger=ledger,
        publication_profile_path=publication_profile_path,
        publication_profile=publication_profile,
        schemas=schemas,
        validators=validators,
    )


def source_documents_from_extraction(
    extraction: Mapping[str, Any],
) -> list[Mapping[str, Any]]:
    raw_documents = extraction.get("sourceDocuments")
    if isinstance(raw_documents, list) and raw_documents:
        documents = raw_documents
    else:
        single = extraction.get("sourceDocument")
        documents = [single] if isinstance(single, dict) else []
    require(
        bool(documents) and all(isinstance(document, dict) for document in documents),
        f"Source extraction {extraction.get('extractionId')} has no source documents",
    )
    return documents  # type: ignore[return-value]


def source_document_key_from_goal(
    goal: Mapping[str, Any], passage: Mapping[str, Any] | None
) -> str | None:
    direct = goal.get("sourceDocumentKey")
    if isinstance(direct, str) and direct:
        return direct
    tags = goal.get("tags")
    if isinstance(tags, list):
        for tag in tags:
            if isinstance(tag, str) and tag.startswith("sourceDocument:"):
                value = tag.removeprefix("sourceDocument:")
                if value:
                    return value
    if passage is not None:
        value = passage.get("sourceDocumentKey")
        if isinstance(value, str) and value:
            return value
    return None


def optional_nonblank(value: Any) -> str | None:
    return value.strip() if isinstance(value, str) and value.strip() else None


def validate_source_extraction_duration_models(
    extraction: Mapping[str, Any],
    documents: Sequence[Mapping[str, Any]],
    context: str,
) -> set[str]:
    derived: set[str] = set()
    for index, document in enumerate(documents):
        if "durationModel" not in document:
            continue
        duration_model = document["durationModel"]
        require(
            isinstance(duration_model, str)
            and bool(duration_model)
            and duration_model == duration_model.strip(),
            f"Malformed source-document durationModel at {context} document {index}",
        )
        derived.add(duration_model)

    if "durationModels" not in extraction:
        require(
            not derived,
            f"Source extraction {context} derives duration models from documents "
            "but has no top-level durationModels evidence",
        )
        return derived

    declared = extraction["durationModels"]
    require(
        isinstance(declared, list)
        and bool(declared)
        and all(
            isinstance(duration_model, str)
            and bool(duration_model)
            and duration_model == duration_model.strip()
            for duration_model in declared
        )
        and len(declared) == len(set(declared)),
        f"Top-level durationModels must be a non-empty unique string list in {context}",
    )
    require(
        set(declared) == derived,
        f"Top-level durationModels differ from source-document evidence in {context}: "
        f"declared={sorted(declared)}, derived={sorted(derived)}",
    )
    return derived


def effective_mapping_match_type(
    decision: Mapping[str, Any],
    pair: tuple[str, str],
    raw_pairs: Mapping[tuple[str, str], str],
    context: str,
) -> tuple[str | None, bool]:
    if "matchType" in decision:
        match_type = decision["matchType"]
        require(
            match_type in {"exact", "partial"},
            f"Malformed explicit decision matchType in {context}: {pair}",
        )
        return str(match_type), False
    match_type = raw_pairs.get(pair)
    return (match_type, True) if match_type is not None else (None, False)


def validated_http_url(value: Any, context: str) -> str:
    require(
        isinstance(value, str) and re.fullmatch(r"https?://[^\s]+", value) is not None,
        f"Official source URL must be HTTP(S) in {context}",
    )
    return value


def publication_input_record(role: str, path: Path, disposition: str) -> dict[str, Any]:
    size, digest = sha256_file(path)
    return {
        "inputRole": role,
        "sourcePath": str(path.relative_to(REPO_ROOT)).replace("\\", "/"),
        "disposition": disposition,
        "bytes": size,
        "sha256": digest,
    }


def normalization_role_for_artifact(
    publication_profile: Mapping[str, Any], artifact_role: str
) -> str:
    matches = [
        output["normalizationRole"]
        for output in publication_profile["outputArtifacts"].values()
        if output["artifactRole"] == artifact_role
    ]
    if artifact_role in PUBLICATION_ARTIFACT_ROLES:
        require(
            len(matches) == 1 and isinstance(matches[0], str),
            f"Publication artifact role lacks one normalization role: {artifact_role}",
        )
        return matches[0]
    require(not matches, f"Unexpected publication normalization role: {artifact_role}")
    return artifact_role


def build_expected_mapping_source_artifacts(
    context: TrustedContext,
    canonical_goal_ids: set[str],
    classifier: PublicationInputClassifier,
) -> dict[str, Any]:
    profile = context.publication_profile
    landscape_id = context.profile["canonicalLandscape"]["landscapeId"]
    mapping_collections: list[dict[str, Any]] = []
    source_collections: list[dict[str, Any]] = []
    source_goal_collections: list[dict[str, Any]] = []
    diagnostics: Counter[str] = Counter()
    raw_source_document_semantics = profile.get("sourceDocumentSemantics")
    require(
        isinstance(raw_source_document_semantics, dict)
        and raw_source_document_semantics.get("unknownRolePolicy") == "reject"
        and isinstance(raw_source_document_semantics.get("roles"), dict)
        and bool(raw_source_document_semantics["roles"]),
        "Trusted source-document role semantics are missing",
    )
    source_document_semantics = raw_source_document_semantics["roles"]
    require(
        all(
            isinstance(role, str)
            and bool(role)
            and semantic_type in {"curriculum", "supplemental-source"}
            for role, semantic_type in source_document_semantics.items()
        ),
        "Trusted source-document role semantics are malformed",
    )
    observed_source_document_roles: set[str] = set()
    legacy_diagnostics = profile.get("legacyDiagnostics")
    require(isinstance(legacy_diagnostics, dict), "Legacy diagnostic binding is missing")
    legacy_membership_path = resolve_repo_path(
        legacy_diagnostics["sourceGoalMembershipRegistryPath"]
    )
    legacy_membership_value = load_json(legacy_membership_path)
    require(
        isinstance(legacy_membership_value, dict),
        "Legacy source-goal membership registry must be an object",
    )
    classifier.observe("legacy-membership-registry", legacy_membership_value)
    raw_legacy_memberships = legacy_membership_value.get("landscapes")
    require(
        isinstance(raw_legacy_memberships, list) and bool(raw_legacy_memberships),
        "Legacy source-goal memberships are missing",
    )
    legacy_membership_by_landscape: dict[str, set[str]] = {}
    for membership in raw_legacy_memberships:
        require(isinstance(membership, dict), "Malformed legacy source membership")
        source_landscape_id = membership.get("landscapeId")
        goal_ids = membership.get("goalIds")
        require(
            isinstance(source_landscape_id, str)
            and isinstance(goal_ids, list)
            and all(isinstance(goal_id, str) for goal_id in goal_ids)
            and len(goal_ids) == len(set(goal_ids))
            and source_landscape_id not in legacy_membership_by_landscape,
            "Malformed or duplicate legacy source-goal membership",
        )
        legacy_membership_by_landscape[source_landscape_id] = set(goal_ids)
    input_files: list[dict[str, Any]] = [
        publication_input_record(
            "legacy-membership-registry",
            legacy_membership_path,
            "authoring-only-diagnostic",
        )
    ]

    for raw_binding in profile["mappingCollections"]:
        review_path = resolve_repo_path(raw_binding["reviewPath"])
        extraction_path = resolve_repo_path(raw_binding["sourceExtractionPath"])
        legacy_path = resolve_repo_path(raw_binding["legacyMappingPath"])
        review = load_json(review_path)
        extraction = load_json(extraction_path)
        legacy = load_json(legacy_path)
        require(
            all(isinstance(value, dict) for value in (review, extraction, legacy)),
            "Publication mapping inputs must be JSON objects",
        )
        classifier.observe("mapping-review", review)
        classifier.observe("source-extraction", extraction)
        classifier.observe("legacy-mapping", legacy)
        input_files.extend(
            [
                publication_input_record(
                    "mapping-review", review_path, "publication-evidence"
                ),
                publication_input_record(
                    "source-extraction", extraction_path, "authoring-only-projected"
                ),
                publication_input_record(
                    "legacy-mapping", legacy_path, "authoring-only"
                ),
            ]
        )

        collection_id = extraction.get("extractionId")
        source_landscape_id = extraction.get("sourceLandscapeId")
        require(
            isinstance(collection_id, str)
            and bool(collection_id)
            and isinstance(source_landscape_id, str)
            and bool(source_landscape_id),
            f"Incomplete source extraction identity: {extraction_path}",
        )
        require(
            raw_binding["mappingCollectionId"] == review.get("reviewId")
            and review.get("sourceExtractionPath")
            == raw_binding["sourceExtractionPath"]
            and review.get("sourceLandscapeId") == source_landscape_id
            and review.get("targetLandscapeId") == landscape_id,
            f"Review/source/target binding mismatch in {review_path}",
        )
        require(
            legacy.get("sourceLandscapeId") == source_landscape_id
            and legacy.get("targetLandscapeId") == landscape_id,
            f"Legacy mapping identity mismatch in {legacy_path}",
        )
        legacy_source_membership = legacy_membership_by_landscape.get(
            source_landscape_id
        )
        require(
            legacy_source_membership is not None,
            f"Legacy source landscape has no bound membership: {source_landscape_id}",
        )
        jurisdiction = extraction.get("jurisdiction")
        subject = extraction.get("subject")
        stage = extraction.get("stage")
        require(
            isinstance(jurisdiction, str)
            and isinstance(subject, str)
            and stage in {"SekI", "SekII", "SekI+SekII"},
            f"Incomplete source collection scope in {extraction_path}",
        )

        passages_raw = extraction.get("passages")
        passages = passages_raw if isinstance(passages_raw, list) else []
        passage_by_id: dict[str, Mapping[str, Any]] = {}
        for passage in passages:
            require(
                isinstance(passage, dict) and isinstance(passage.get("id"), str),
                f"Malformed source passage in {extraction_path}",
            )
            passage_id = passage["id"]
            require(
                passage_id not in passage_by_id,
                f"Duplicate source passage {passage_id} in {extraction_path}",
            )
            passage_by_id[passage_id] = passage

        source_documents = source_documents_from_extraction(extraction)
        duration_models = validate_source_extraction_duration_models(
            extraction, source_documents, str(extraction_path)
        )
        document_by_key: dict[str, dict[str, Any]] = {}
        compiled_documents: list[dict[str, Any]] = []
        for document in source_documents:
            source_key = document.get("key")
            title = document.get("title")
            role = document.get("role")
            require(
                all(
                    isinstance(value, str) and bool(value.strip())
                    for value in (source_key, title, role)
                )
                and document.get("official") is True,
                f"Incomplete or non-official source document in {extraction_path}",
            )
            assert isinstance(source_key, str)
            assert isinstance(title, str)
            assert isinstance(role, str)
            source_key = source_key.strip()
            title = title.strip()
            role = role.strip()
            semantic_type = source_document_semantics.get(role)
            require(
                semantic_type in {"curriculum", "supplemental-source"},
                "Official source document role is not classified by the trusted "
                f"profile: {role}",
            )
            observed_source_document_roles.add(role)
            require(
                source_key not in document_by_key,
                f"Duplicate source document key {source_key} in {collection_id}",
            )
            compiled_document: dict[str, Any] = {
                "sourceDocumentId": f"{collection_id}:{source_key}",
                "sourceKey": source_key,
                "title": title,
                "role": role,
                "semanticType": semantic_type,
                "official": True,
                "url": validated_http_url(
                    document.get("url"), f"source document {source_key}"
                ),
            }
            landing_url = document.get("landingUrl")
            if landing_url is not None:
                compiled_document["landingUrl"] = validated_http_url(
                    landing_url, f"source document {source_key} landing page"
                )
            duration_model = optional_nonblank(document.get("durationModel"))
            if duration_model is not None:
                compiled_document["durationModel"] = duration_model
            document_by_key[source_key] = compiled_document
            compiled_documents.append(compiled_document)
        compiled_documents.sort(key=lambda item: item["sourceDocumentId"])

        source_goals_raw = extraction.get("sourceGoals")
        require(
            isinstance(source_goals_raw, list) and bool(source_goals_raw),
            f"Source extraction has no source goals: {extraction_path}",
        )
        source_goal_ids: set[str] = set()
        compiled_source_goals: list[dict[str, Any]] = []
        lineage_groups: defaultdict[str, list[tuple[str, int, int]]] = defaultdict(
            list
        )
        for source_goal in source_goals_raw:
            require(isinstance(source_goal, dict), "Malformed source goal")
            source_goal_id = source_goal.get("id")
            passage_id = source_goal.get("passageId")
            require(
                isinstance(source_goal_id, str) and isinstance(passage_id, str),
                f"Source goal identity is missing in {extraction_path}",
            )
            require(
                source_goal_id not in source_goal_ids,
                f"Duplicate source goal {source_goal_id} in {collection_id}",
            )
            source_goal_ids.add(source_goal_id)
            passage = passage_by_id.get(passage_id)
            document_key = source_document_key_from_goal(source_goal, passage)
            if document_key is None and len(document_by_key) == 1:
                document_key = next(iter(document_by_key))
            document = document_by_key.get(str(document_key))
            require(
                document is not None,
                f"Source goal {source_goal_id} does not resolve an official document",
            )
            topic_code = optional_nonblank(source_goal.get("topicCode")) or (
                optional_nonblank(passage.get("topicCode"))
                if passage is not None
                else None
            )
            source_ref = optional_nonblank(source_goal.get("sourceRef")) or (
                optional_nonblank(passage.get("sourceRef"))
                if passage is not None
                else None
            )
            source_text = optional_nonblank(source_goal.get("sourceText"))
            source_span = optional_nonblank(source_goal.get("sourceSpan"))
            title_value = optional_nonblank(source_goal.get("title"))
            description_value = optional_nonblank(source_goal.get("description"))
            require(
                None
                not in {
                    topic_code,
                    source_ref,
                    source_text,
                    source_span,
                    title_value,
                    description_value,
                },
                f"Incomplete source-goal evidence for {source_goal_id}",
            )
            assert all(
                isinstance(value, str)
                for value in (
                    topic_code,
                    source_ref,
                    source_text,
                    source_span,
                    title_value,
                    description_value,
                )
            )
            locator: dict[str, Any] = {
                "passageId": passage_id,
                "topicCode": topic_code,
                "sourceSpan": source_span,
                "sourceRef": source_ref,
            }
            source_page = source_goal.get("sourcePage")
            if not isinstance(source_page, int) and passage is not None:
                source_page = passage.get("page")
            if isinstance(source_page, int):
                locator["sourcePage"] = source_page
            source_line = source_goal.get("sourceLine")
            if isinstance(source_line, int):
                locator["sourceLine"] = source_line
            compiled_source_goal: dict[str, Any] = {
                "sourceGoalId": source_goal_id,
                "sourceDocumentId": document["sourceDocumentId"],
                "title": title_value,
                "description": description_value,
                "sourceText": source_text,
                "sourceTextSha256": "sha256:"
                + sha256_bytes(source_text.encode("utf-8")),
                "locator": locator,
            }
            parent_bullet = optional_nonblank(source_goal.get("parentBulletText"))
            if parent_bullet is not None:
                compiled_source_goal["parentBulletText"] = parent_bullet
            classification = {
                key: value
                for key in (
                    "granularity",
                    "category",
                    "stage",
                    "phase",
                    "courseLevel",
                    "grade",
                    "area",
                    "level",
                )
                if (value := optional_nonblank(source_goal.get(key))) is not None
            }
            if classification:
                compiled_source_goal["classification"] = classification
            lineage_keys = ("splitFromSourceGoalId", "splitIndex", "splitPartCount")
            lineage_values = [source_goal.get(key) for key in lineage_keys]
            if any(value is not None for value in lineage_values):
                require(
                    isinstance(lineage_values[0], str)
                    and bool(lineage_values[0])
                    and lineage_values[0] == lineage_values[0].strip()
                    and type(lineage_values[1]) is int
                    and type(lineage_values[2]) is int
                    and lineage_values[1] >= 1
                    and lineage_values[2] >= 1,
                    f"Incomplete split lineage for {source_goal_id}",
                )
                compiled_source_goal["lineage"] = dict(
                    zip(lineage_keys, lineage_values)
                )
                lineage_groups[lineage_values[0]].append(
                    (source_goal_id, lineage_values[1], lineage_values[2])
                )
            compiled_source_goals.append(compiled_source_goal)
        compiled_source_goals.sort(key=lambda item: item["sourceGoalId"])

        for split_from_source_goal_id, parts in sorted(lineage_groups.items()):
            part_counts = {part_count for _goal_id, _index, part_count in parts}
            require(
                len(part_counts) == 1,
                "Split lineage has inconsistent splitPartCount in "
                f"{collection_id}:{split_from_source_goal_id}",
            )
            part_count = next(iter(part_counts))
            indices = [index for _goal_id, index, _part_count in parts]
            require(
                len(indices) == len(set(indices)),
                "Split lineage has duplicate splitIndex values in "
                f"{collection_id}:{split_from_source_goal_id}",
            )
            require(
                sorted(indices) == list(range(1, part_count + 1)),
                "Split lineage does not exactly cover indices 1..splitPartCount in "
                f"{collection_id}:{split_from_source_goal_id}",
            )

        raw_mappings = review.get("mappings")
        require(isinstance(raw_mappings, list), "Review has no redundant mappings")
        raw_pairs: dict[tuple[str, str], str] = {}
        for mapping in raw_mappings:
            require(isinstance(mapping, dict), "Malformed redundant mapping")
            pair = (mapping.get("legacyGoalId"), mapping.get("canonicalGoalId"))
            match_type = mapping.get("matchType")
            require(
                all(isinstance(value, str) for value in pair)
                and match_type in {"exact", "partial"}
                and pair not in raw_pairs,
                f"Invalid redundant mapping edge {pair} in {review_path}",
            )
            raw_pairs[pair] = match_type

        decisions = review.get("decisions")
        require(
            isinstance(decisions, list) and bool(decisions),
            f"Mapping review has no authoritative decisions: {review_path}",
        )
        decision_edges: dict[tuple[str, str], str] = {}
        explicit_match_type_edges: set[tuple[str, str]] = set()
        unresolved_match_type_edges: list[tuple[str, str]] = []
        for decision in decisions:
            require(
                isinstance(decision, dict) and decision.get("decision") == "mapped",
                f"Unsupported mapping decision in {review_path}",
            )
            source_goal_id = decision.get("sourceGoalId")
            targets = decision.get("canonicalGoalIds")
            require(
                isinstance(source_goal_id, str)
                and source_goal_id in source_goal_ids
                and isinstance(targets, list)
                and bool(targets),
                f"Malformed authoritative decision in {review_path}",
            )
            for target in targets:
                require(
                    isinstance(target, str) and target in canonical_goal_ids,
                    f"Unknown canonical mapping target {target} in {review_path}",
                )
                pair = (source_goal_id, target)
                require(
                    pair not in decision_edges,
                    f"Duplicate authoritative mapping edge {pair} in {review_path}",
                )
                match_type, derived_from_raw = effective_mapping_match_type(
                    decision, pair, raw_pairs, str(review_path)
                )
                if match_type is None:
                    unresolved_match_type_edges.append(pair)
                    continue
                if derived_from_raw:
                    diagnostics["decisionMatchTypesDerivedFromRawMappings"] += 1
                else:
                    explicit_match_type_edges.add(pair)
                decision_edges[pair] = match_type
        diagnostics["unresolvedDecisionMatchTypes"] += len(
            unresolved_match_type_edges
        )
        require(
            not unresolved_match_type_edges,
            "Authoritative mapping edges have neither an explicit decision matchType "
            "nor an edge-specific reviewed mappings fallback in "
            f"{review_path}: {unresolved_match_type_edges[:3]}",
        )
        require(
            {source for source, _ in decision_edges} == source_goal_ids,
            f"Authoritative decisions do not cover every source goal in {review_path}",
        )
        require(
            not (set(raw_pairs) - set(decision_edges)),
            f"Redundant mapping is not decision-backed in {review_path}",
        )
        diagnostics["rawMappingEdges"] += len(raw_pairs)
        diagnostics["decisionEdgesMissingFromRawMappings"] += len(
            set(decision_edges) - set(raw_pairs)
        )
        diagnostics["decisionRawMatchTypeConflicts"] += sum(
            pair in explicit_match_type_edges
            and pair in raw_pairs
            and raw_pairs[pair] != match_type
            for pair, match_type in decision_edges.items()
        )

        legacy_rows = legacy.get("mappings")
        require(isinstance(legacy_rows, list), "Legacy mapping has no mappings array")
        diagnostics["legacyPlainMappingRows"] += len(legacy_rows)
        for mapping in legacy_rows:
            require(isinstance(mapping, dict), "Malformed legacy mapping")
            if mapping.get("legacyGoalId") not in legacy_source_membership:
                diagnostics["legacySourceIdsOutsideMembership"] += 1
            if mapping.get("canonicalGoalId") not in canonical_goal_ids:
                diagnostics["legacyDanglingTargets"] += 1

        edges = [
            {
                "sourceGoalId": source_goal_id,
                "canonicalGoalId": canonical_goal_id,
                "matchType": match_type,
            }
            for (source_goal_id, canonical_goal_id), match_type in sorted(
                decision_edges.items()
            )
        ]
        mapping_collections.append(
            {
                "mappingCollectionId": review["reviewId"],
                "sourceCollectionId": collection_id,
                "sourceLandscapeId": source_landscape_id,
                "targetLandscapeId": landscape_id,
                "jurisdiction": jurisdiction,
                "subject": subject,
                "stage": stage,
                "inputDecisionCount": len(decisions),
                "mappingEdgeCount": len(edges),
                "edges": edges,
            }
        )
        source_collection: dict[str, Any] = {
            "sourceCollectionId": collection_id,
            "sourceLandscapeId": source_landscape_id,
            "jurisdiction": jurisdiction,
            "subject": subject,
            "stage": stage,
            "documentCount": len(compiled_documents),
            "documents": compiled_documents,
        }
        if duration_models:
            source_collection["durationModels"] = sorted(duration_models)
        source_collections.append(source_collection)
        source_goal_collections.append(
            {
                "sourceCollectionId": collection_id,
                "sourceLandscapeId": source_landscape_id,
                "sourceGoalCount": len(compiled_source_goals),
                "sourceGoals": compiled_source_goals,
            }
        )

    mapping_collections.sort(key=lambda item: item["mappingCollectionId"])
    source_collections.sort(key=lambda item: item["sourceCollectionId"])
    source_goal_collections.sort(key=lambda item: item["sourceCollectionId"])
    require(
        observed_source_document_roles == set(source_document_semantics),
        "Trusted source-document roles do not exactly cover selected official "
        "documents: "
        f"missing={sorted(set(source_document_semantics)-observed_source_document_roles)}, "
        f"unknown={sorted(observed_source_document_roles-set(source_document_semantics))}",
    )
    expected = profile["expectedCounts"]
    actual_mapping_counts = {
        "collections": len(mapping_collections),
        "inputDecisions": sum(
            item["inputDecisionCount"] for item in mapping_collections
        ),
        "decisionEdges": sum(item["mappingEdgeCount"] for item in mapping_collections),
        **dict(diagnostics),
    }
    assert_json_equal(actual_mapping_counts, expected["mappings"], "mapping drift counts")
    actual_source_counts = {
        "collections": len(source_collections),
        "documents": sum(item["documentCount"] for item in source_collections),
        "curriculumDocuments": sum(
            document["semanticType"] == "curriculum"
            for item in source_collections
            for document in item["documents"]
        ),
        "supplementalDocuments": sum(
            document["semanticType"] == "supplemental-source"
            for item in source_collections
            for document in item["documents"]
        ),
        "sourceGoals": sum(
            item["sourceGoalCount"] for item in source_goal_collections
        ),
        "jurisdictions": len(
            {item["jurisdiction"] for item in source_collections}
        ),
    }
    assert_json_equal(actual_source_counts, expected["sources"], "source drift counts")

    mappings = {
        "$schema": SCHEMA_IDS["mapping"],
        "mappingFormatVersion": "1.0",
        "targetLandscapeId": landscape_id,
        "mappingCollectionCount": len(mapping_collections),
        "decisionCount": actual_mapping_counts["inputDecisions"],
        "mappingEdgeCount": actual_mapping_counts["decisionEdges"],
        "collections": mapping_collections,
    }
    source_index = {
        "$schema": SCHEMA_IDS["source-index"],
        "sourceIndexFormatVersion": "1.0",
        "targetLandscapeId": landscape_id,
        "sourceCollectionCount": len(source_collections),
        "sourceDocumentCount": actual_source_counts["documents"],
        "collections": source_collections,
    }
    source_goal_references = {
        "$schema": SCHEMA_IDS["source-goal-reference-index"],
        "sourceGoalReferenceFormatVersion": "1.0",
        "targetLandscapeId": landscape_id,
        "sourceCollectionCount": len(source_goal_collections),
        "sourceGoalCount": actual_source_counts["sourceGoals"],
        "collections": source_goal_collections,
    }
    return {
        "mappings": mappings,
        "sourceIndex": source_index,
        "sourceGoalReferences": source_goal_references,
        "inputFiles": sorted(
            input_files, key=lambda item: (item["inputRole"], item["sourcePath"])
        ),
        "diagnostics": dict(sorted(diagnostics.items())),
    }


def build_expected_quality_evidence(
    context: TrustedContext,
    goal_by_id: Mapping[str, Mapping[str, Any]],
    compiled_decks: Sequence[tuple[str, Mapping[str, Any]]],
    resources: Sequence[Mapping[str, Any]],
    classifier: PublicationInputClassifier,
) -> dict[str, Any]:
    profile = context.publication_profile
    landscape_id = profile["targetLandscapeId"]
    quality_sources = profile["qualitySources"]
    input_files: list[dict[str, Any]] = []

    atomic_binding = quality_sources["semanticAtomicity"]
    atomic_config_path = resolve_repo_path(atomic_binding["configPath"])
    atomic_review_path = resolve_repo_path(atomic_binding["reviewPath"])
    atomic_config = load_json(atomic_config_path)
    atomic_records = load_json_lines(atomic_review_path)
    require(isinstance(atomic_config, dict), "Atomicity config must be an object")
    classifier.observe("semantic-atomicity-config", atomic_config)
    for record in atomic_records:
        classifier.observe("semantic-atomicity-review", record)
    input_files.extend(
        [
            publication_input_record(
                "semantic-atomicity-config",
                atomic_config_path,
                "authoring-only-selector",
            ),
            publication_input_record(
                "semantic-atomicity-review",
                atomic_review_path,
                "publication-evidence",
            ),
        ]
    )
    require(
        atomic_config.get("reviewId") == atomic_binding["reviewId"]
        and atomic_config.get("ruleVersion") == atomic_binding["ruleVersion"]
        and atomic_config.get("landscapeId") == landscape_id
        and atomic_config.get("reviewPath") == atomic_binding["reviewPath"],
        "Semantic-atomicity quality binding mismatch",
    )
    atomic_scope = {
        goal_id
        for goal_id in configured_goal_scope(atomic_config, goal_by_id)
        if is_review_relevant_leaf(goal_by_id[goal_id])
    }
    atomic_by_goal: dict[str, Mapping[str, Any]] = {}
    atomic_decisions: list[dict[str, Any]] = []
    for record in atomic_records:
        require(
            isinstance(record, dict) and isinstance(record.get("goalId"), str),
            "Malformed semantic-atomicity decision",
        )
        goal_id = record["goalId"]
        require(
            goal_id not in atomic_by_goal,
            f"Duplicate semantic-atomicity decision for {goal_id}",
        )
        atomic_by_goal[goal_id] = record
        require(
            record.get("reviewId") == atomic_binding["reviewId"]
            and record.get("ruleVersion") == atomic_binding["ruleVersion"]
            and record.get("landscapeId") == landscape_id
            and goal_id in atomic_scope,
            f"Semantic-atomicity decision binding mismatch for {goal_id}",
        )
        expected_fingerprint = goal_review_fingerprint(
            goal_by_id[goal_id], atomic_binding["ruleVersion"]
        )
        require(
            record.get("fingerprint") == expected_fingerprint,
            f"Stale semantic-atomicity fingerprint for {goal_id}",
        )
        status = record.get("status")
        semantic_atomic = record.get("semanticAtomic")
        expected_semantic_atomic = {
            "atomic": True,
            "non_atomic": False,
            "needs_developer_review": None,
        }.get(str(status), "unsupported")
        require(
            semantic_atomic == expected_semantic_atomic,
            f"Invalid semantic-atomicity result for {goal_id}",
        )
        atomic_decisions.append(
            {
                "goalId": goal_id,
                "goalFingerprint": expected_fingerprint,
                "status": status,
                "semanticAtomic": semantic_atomic,
            }
        )
    require(
        set(atomic_by_goal) == atomic_scope,
        "Semantic-atomicity ledger does not cover the exact configured scope",
    )
    atomic_decisions.sort(key=lambda item: item["goalId"])
    atomic_statuses = {item["status"] for item in atomic_decisions}
    atomic_lane_status = (
        "failed"
        if "non_atomic" in atomic_statuses
        else "incomplete"
        if "needs_developer_review" in atomic_statuses
        else "passed"
    )

    memory_binding = quality_sources["memoryCards"]
    memory_config_path = resolve_repo_path(memory_binding["configPath"])
    memory_review_path = resolve_repo_path(memory_binding["reviewPath"])
    card_review_path = resolve_repo_path(memory_binding["cardReviewPath"])
    memory_config = load_json(memory_config_path)
    memory_records = load_json_lines(memory_review_path)
    card_records = load_json_lines(card_review_path)
    require(isinstance(memory_config, dict), "Memory-card config must be an object")
    classifier.observe("memory-card-config", memory_config)
    for record in memory_records:
        classifier.observe("memory-goal-review", record)
    for record in card_records:
        classifier.observe("memory-card-review", record)
    input_files.extend(
        [
            publication_input_record(
                "memory-card-config", memory_config_path, "authoring-only-selector"
            ),
            publication_input_record(
                "memory-goal-review", memory_review_path, "publication-evidence"
            ),
            publication_input_record(
                "memory-card-review",
                card_review_path,
                "publication-evidence-projected",
            ),
        ]
    )
    require(
        memory_config.get("reviewId") == memory_binding["reviewId"]
        and memory_config.get("ruleVersion") == memory_binding["ruleVersion"]
        and memory_config.get("landscapeId") == landscape_id
        and memory_config.get("reviewPath") == memory_binding["reviewPath"]
        and memory_config.get("cardReviewPath") == memory_binding["cardReviewPath"],
        "Memory-card quality binding mismatch",
    )
    memory_scope = {
        goal_id
        for goal_id in configured_goal_scope(memory_config, goal_by_id)
        if is_review_relevant_leaf(goal_by_id[goal_id])
    }
    memory_by_goal: dict[str, Mapping[str, Any]] = {}
    memory_decisions: list[dict[str, Any]] = []
    for record in memory_records:
        require(
            isinstance(record, dict) and isinstance(record.get("goalId"), str),
            "Malformed memory-goal decision",
        )
        goal_id = record["goalId"]
        require(
            goal_id not in memory_by_goal,
            f"Duplicate memory-goal decision for {goal_id}",
        )
        memory_by_goal[goal_id] = record
        require(
            record.get("reviewId") == memory_binding["reviewId"]
            and record.get("ruleVersion") == memory_binding["ruleVersion"]
            and record.get("landscapeId") == landscape_id
            and goal_id in memory_scope,
            f"Memory-goal decision binding mismatch for {goal_id}",
        )
        expected_fingerprint = goal_review_fingerprint(
            goal_by_id[goal_id], memory_binding["ruleVersion"]
        )
        require(
            record.get("fingerprint") == expected_fingerprint,
            f"Stale memory-goal fingerprint for {goal_id}",
        )
        status = record.get("status")
        memory_useful = record.get("memoryUseful")
        expected_memory_useful = {
            "no_memory_needed": False,
            "memory_required": True,
            "needs_developer_review": None,
        }.get(str(status), "unsupported")
        require(
            memory_useful == expected_memory_useful,
            f"Invalid memory-goal result for {goal_id}",
        )
        decision: dict[str, Any] = {
            "goalId": goal_id,
            "goalFingerprint": expected_fingerprint,
            "status": status,
            "memoryUseful": memory_useful,
        }
        if status == "memory_required":
            memory_goal_ids = record.get("memoryGoalIds")
            deck_ids = record.get("deckIds")
            require(
                isinstance(memory_goal_ids, list)
                and bool(memory_goal_ids)
                and isinstance(deck_ids, list)
                and bool(deck_ids)
                and all(
                    isinstance(memory_goal_id, str)
                    and memory_goal_id in goal_by_id
                    and is_memory_goal(goal_by_id[memory_goal_id])
                    for memory_goal_id in memory_goal_ids
                ),
                f"Invalid memory support references for {goal_id}",
            )
            decision["memoryGoalIds"] = sorted(set(memory_goal_ids))
            decision["deckIds"] = sorted(set(deck_ids))
        memory_decisions.append(decision)
    require(
        set(memory_by_goal) == memory_scope,
        "Memory-goal ledger does not cover the exact configured scope",
    )
    memory_decisions.sort(key=lambda item: item["goalId"])

    primary_cards: dict[tuple[str, str], dict[str, Any]] = {}
    for _, deck in compiled_decks:
        if deck.get("language") != "de-DE":
            continue
        deck_id = deck.get("deckId")
        cards = deck.get("cards")
        require(
            isinstance(deck_id, str) and isinstance(cards, list),
            "Malformed primary memory deck",
        )
        for card in cards:
            require(
                isinstance(card, dict) and isinstance(card.get("id"), str),
                f"Malformed card in primary deck {deck_id}",
            )
            key = (deck_id, card["id"])
            require(key not in primary_cards, f"Duplicate primary card identity {key}")
            primary_cards[key] = {
                "deckId": deck_id,
                "cardId": card["id"],
                "front": card.get("front"),
                "back": card.get("back"),
                "category": card.get("category"),
                "tags": card.get("tags", []),
            }
    card_record_by_key: dict[tuple[str, str], Mapping[str, Any]] = {}
    removed_card_count = 0
    for record in card_records:
        require(isinstance(record, dict), "Malformed memory-card review decision")
        raw_key = (record.get("deckId"), record.get("cardId"))
        require(
            all(isinstance(value, str) for value in raw_key),
            "Memory-card review identity is missing",
        )
        key = (str(raw_key[0]), str(raw_key[1]))
        require(
            key not in card_record_by_key,
            f"Duplicate memory-card review decision {key}",
        )
        card_record_by_key[key] = record
        removed_card_count += record.get("status") == "remove"
    active_card_decisions: list[dict[str, Any]] = []
    for key, card in primary_cards.items():
        record = card_record_by_key.get(key)
        require(record is not None, f"Missing review for active primary card {key}")
        expected_fingerprint = card_review_fingerprint(
            card, memory_binding["ruleVersion"]
        )
        origin_goal_ids = record.get("originGoalIds")
        require(
            record.get("reviewId") == memory_binding["reviewId"]
            and record.get("ruleVersion") == memory_binding["ruleVersion"]
            and record.get("landscapeId") == landscape_id
            and record.get("fingerprint") == expected_fingerprint
            and record.get("status") == "kept"
            and record.get("necessary") is True
            and isinstance(origin_goal_ids, list)
            and bool(origin_goal_ids),
            f"Invalid or stale review for active primary card {key}",
        )
        for origin_goal_id in origin_goal_ids:
            goal_record = memory_by_goal.get(str(origin_goal_id))
            require(
                goal_record is not None
                and goal_record.get("status") == "memory_required"
                and key[0] in goal_record.get("deckIds", []),
                f"Untraced memory-card origin {origin_goal_id} for {key}",
            )
        active_card_decisions.append(
            {
                "deckId": key[0],
                "cardId": key[1],
                "cardFingerprint": expected_fingerprint,
                "status": "kept",
                "necessary": True,
                "originGoalIds": sorted(set(origin_goal_ids)),
            }
        )
    active_card_decisions.sort(key=lambda item: (item["deckId"], item["cardId"]))
    inactive_card_keys = set(card_record_by_key) - set(primary_cards)
    require(
        all(
            card_record_by_key[key].get("status") == "remove"
            for key in inactive_card_keys
        )
        and len(inactive_card_keys) == removed_card_count,
        "Non-active memory-card decisions must be explicit removal history",
    )
    required_goal_ids = {
        decision["goalId"]
        for decision in memory_decisions
        if decision["status"] == "memory_required"
    }
    active_origin_goal_ids = {
        goal_id
        for decision in active_card_decisions
        for goal_id in decision["originGoalIds"]
    }
    required_deck_ids = {
        deck_id
        for decision in memory_decisions
        if decision["status"] == "memory_required"
        for deck_id in decision["deckIds"]
    }
    primary_deck_ids = {deck_id for deck_id, _card_id in primary_cards}
    require(
        required_goal_ids == active_origin_goal_ids
        and required_deck_ids == primary_deck_ids,
        "Memory-required goals/decks and active kept-card evidence are not exact",
    )
    memory_lane_status = (
        "incomplete"
        if "needs_developer_review"
        in {item["status"] for item in memory_decisions}
        else "passed"
    )

    visual_binding = quality_sources["goalVisualizations"]
    visual_qa_path = resolve_repo_path(visual_binding["qaPath"])
    visual_qa = load_json(visual_qa_path)
    require(isinstance(visual_qa, dict), "Goal-visualization QA must be an object")
    classifier.observe("goal-visualization-qa", visual_qa)
    input_files.append(
        publication_input_record(
            "goal-visualization-qa",
            visual_qa_path,
            "publication-evidence-projected",
        )
    )
    visual_records = visual_qa.get("records")
    require(
        visual_qa.get("landscapeId") in {None, landscape_id}
        and isinstance(visual_records, list)
        and bool(visual_records),
        "Goal-visualization QA binding is invalid",
    )
    visual_resources: dict[str, Mapping[str, Any]] = {}
    for resource in resources:
        if resource.get("resourceKind") != "goal-visualization":
            continue
        goal_id = resource.get("ownerGoalId")
        require(
            isinstance(goal_id, str) and goal_id not in visual_resources,
            f"Goal visualization ownership is not one-to-one: {goal_id}",
        )
        visual_resources[goal_id] = resource
    missing_visual_goal_ids = sorted(atomic_scope - set(visual_resources))
    visual_decisions: list[dict[str, Any]] = []
    visual_goal_ids: set[str] = set()
    for record in visual_records:
        require(
            isinstance(record, dict) and isinstance(record.get("goalId"), str),
            "Malformed goal-visualization QA decision",
        )
        goal_id = record["goalId"]
        require(
            goal_id not in visual_goal_ids,
            f"Duplicate goal-visualization QA decision for {goal_id}",
        )
        visual_goal_ids.add(goal_id)
        resource = visual_resources.get(goal_id)
        require(resource is not None, f"No active visualization resource for {goal_id}")
        expected_digest = "sha256:" + str(resource["sha256"])
        require(
            record.get("assetSha256") == expected_digest,
            f"Stale goal-visualization QA asset hash for {goal_id}",
        )
        human_approved = record.get("humanApproved")
        human_issue = record.get("humanIssueIdentified")
        require(
            human_approved in {"yes", "no"} and human_issue in {"yes", "no"},
            f"Invalid human visualization decision for {goal_id}",
        )
        status = (
            "rejected"
            if human_issue == "yes"
            else "human-approved"
            if human_approved == "yes"
            else "pending-human-review"
        )
        visual_decisions.append(
            {"goalId": goal_id, "assetSha256": expected_digest, "status": status}
        )
    require(
        visual_goal_ids == set(visual_resources),
        "Goal-visualization QA does not cover the exact active resource set",
    )
    visual_decisions.sort(key=lambda item: item["goalId"])
    approved_count = sum(
        item["status"] == "human-approved" for item in visual_decisions
    )
    rejected_count = sum(item["status"] == "rejected" for item in visual_decisions)
    open_count = len(visual_decisions) - approved_count
    visual_lane_status = (
        "failed"
        if rejected_count
        else "incomplete"
        if open_count or missing_visual_goal_ids
        else "passed"
    )
    publication_status = (
        "ready"
        if {atomic_lane_status, memory_lane_status, visual_lane_status} == {"passed"}
        else "not-ready"
    )
    value = {
        "$schema": SCHEMA_IDS["quality-evidence"],
        "qualityEvidenceFormatVersion": "1.0",
        "landscapeId": landscape_id,
        "publicationStatus": publication_status,
        "qualityDecisionCount": len(atomic_decisions)
        + len(memory_decisions)
        + len(active_card_decisions)
        + len(visual_decisions),
        "lanes": {
            "semanticAtomicity": {
                "reviewId": atomic_binding["reviewId"],
                "ruleVersion": atomic_binding["ruleVersion"],
                "status": atomic_lane_status,
                "decisionCount": len(atomic_decisions),
                "decisions": atomic_decisions,
            },
            "memoryCards": {
                "reviewId": memory_binding["reviewId"],
                "ruleVersion": memory_binding["ruleVersion"],
                "status": memory_lane_status,
                "goalDecisionCount": len(memory_decisions),
                "activeCardDecisionCount": len(active_card_decisions),
                "goalDecisions": memory_decisions,
                "activeCardDecisions": active_card_decisions,
            },
            "goalVisualizations": {
                "reviewId": visual_binding["reviewId"],
                "ruleVersion": visual_binding["ruleVersion"],
                "status": visual_lane_status,
                "scopeGoalCount": len(atomic_scope),
                "missingGoalCount": len(missing_visual_goal_ids),
                "missingGoalIds": missing_visual_goal_ids,
                "decisionCount": len(visual_decisions),
                "approvedCount": approved_count,
                "openCount": open_count,
                "decisions": visual_decisions,
            },
        },
    }
    counts = {
        "semanticAtomicityDecisions": len(atomic_decisions),
        "memoryGoalDecisions": len(memory_decisions),
        "noMemoryNeeded": sum(
            item["status"] == "no_memory_needed" for item in memory_decisions
        ),
        "memoryRequired": sum(
            item["status"] == "memory_required" for item in memory_decisions
        ),
        "cardLedgerDecisions": len(card_records),
        "activeKeptCardDecisions": len(active_card_decisions),
        "authoringOnlyRemovedCardDecisions": removed_card_count,
        "visualizationDecisions": len(visual_decisions),
        "visualizationScopeGoals": len(atomic_scope),
        "missingGoalVisualizations": len(missing_visual_goal_ids),
        "humanApprovedVisualizations": approved_count,
        "openVisualizations": open_count,
        "publishedQualityDecisions": value["qualityDecisionCount"],
    }
    assert_json_equal(
        counts,
        profile["expectedCounts"]["quality"],
        "quality-evidence drift counts",
    )
    return {
        "value": value,
        "counts": counts,
        "inputFiles": sorted(
            input_files, key=lambda item: (item["inputRole"], item["sourcePath"])
        ),
    }


def build_expected_publication_evidence(
    context: TrustedContext,
    compiled_landscape: Mapping[str, Any],
    compiled_decks: Sequence[tuple[str, Mapping[str, Any]]],
    resources: Sequence[Mapping[str, Any]],
) -> dict[str, Any]:
    goals = compiled_landscape.get("goals")
    require(isinstance(goals, list), "Compiled goals are missing for publication evidence")
    goal_by_id = {
        goal["id"]: goal
        for goal in goals
        if isinstance(goal, dict) and isinstance(goal.get("id"), str)
    }
    require(
        len(goal_by_id) == len(goals),
        "Canonical goals are malformed or duplicated for publication evidence",
    )
    classifier = PublicationInputClassifier(context.publication_profile)
    source_artifacts = build_expected_mapping_source_artifacts(
        context, set(goal_by_id), classifier
    )
    quality = build_expected_quality_evidence(
        context, goal_by_id, compiled_decks, resources, classifier
    )
    classifier.assert_complete()

    mappings = source_artifacts["mappings"]
    source_index = source_artifacts["sourceIndex"]
    source_goals = source_artifacts["sourceGoalReferences"]
    quality_value = quality["value"]
    document_ids = [
        document["sourceDocumentId"]
        for collection in source_index["collections"]
        for document in collection["documents"]
    ]
    source_goal_ids = [
        goal["sourceGoalId"]
        for collection in source_goals["collections"]
        for goal in collection["sourceGoals"]
    ]
    require(
        len(document_ids) == len(set(document_ids)),
        "Duplicate official source document identity",
    )
    require(
        len(source_goal_ids) == len(set(source_goal_ids)),
        "Source goal IDs must be package-wide unique",
    )
    source_document_references = {
        goal["sourceDocumentId"]
        for collection in source_goals["collections"]
        for goal in collection["sourceGoals"]
    }
    require(
        source_document_references <= set(document_ids),
        "Source-goal reference index has dangling source documents",
    )
    for value, schema_name, label in (
        (mappings, "mapping", "source-to-canonical mappings"),
        (source_index, "source-index", "official source index"),
        (
            source_goals,
            "source-goal-reference-index",
            "source-goal reference index",
        ),
        (quality_value, "quality-evidence", "release quality evidence"),
    ):
        validate_schema(value, context.validators[schema_name], label)

    outputs = context.publication_profile["outputArtifacts"]
    landscape_id = compiled_landscape["landscapeId"]
    logical_documents = [
        (
            outputs["mappings"]["artifactRole"],
            f"{landscape_id}:source-mappings",
            outputs["mappings"]["outputPath"],
            mappings,
        ),
        (
            outputs["sourceIndex"]["artifactRole"],
            f"{landscape_id}:official-sources",
            outputs["sourceIndex"]["outputPath"],
            source_index,
        ),
        (
            outputs["sourceGoalReferences"]["artifactRole"],
            f"{landscape_id}:source-goal-references",
            outputs["sourceGoalReferences"]["outputPath"],
            source_goals,
        ),
        (
            outputs["qualityEvidence"]["artifactRole"],
            f"{landscape_id}:release-quality",
            outputs["qualityEvidence"]["outputPath"],
            quality_value,
        ),
    ]
    diagnostics = source_artifacts["diagnostics"]
    build_inputs = {
        "profileId": context.publication_profile["profileId"],
        "profileVersion": context.publication_profile["version"],
        "inputFiles": sorted(
            source_artifacts["inputFiles"] + quality["inputFiles"],
            key=lambda item: (item["inputRole"], item["sourcePath"]),
        ),
        "authoringOnlyDiagnostics": {
            key: diagnostics[key]
            for key in (
                "rawMappingEdges",
                "decisionEdgesMissingFromRawMappings",
                "decisionRawMatchTypeConflicts",
                "decisionMatchTypesDerivedFromRawMappings",
                "unresolvedDecisionMatchTypes",
                "legacyPlainMappingRows",
                "legacyDanglingTargets",
                "legacySourceIdsOutsideMembership",
            )
        },
    }
    counts = {
        "mappingCollections": mappings["mappingCollectionCount"],
        "mappingInputDecisions": mappings["decisionCount"],
        "mappingEdges": mappings["mappingEdgeCount"],
        "sourceCollections": source_index["sourceCollectionCount"],
        "sourceDocuments": source_index["sourceDocumentCount"],
        "curriculumSourceDocuments": sum(
            document["semanticType"] == "curriculum"
            for collection in source_index["collections"]
            for document in collection["documents"]
        ),
        "supplementalSourceDocuments": sum(
            document["semanticType"] == "supplemental-source"
            for collection in source_index["collections"]
            for document in collection["documents"]
        ),
        "sourceGoals": source_goals["sourceGoalCount"],
        "sourceJurisdictions": len(
            {item["jurisdiction"] for item in source_index["collections"]}
        ),
        **diagnostics,
        **quality["counts"],
    }
    return {
        "logicalDocuments": logical_documents,
        "buildInputs": build_inputs,
        "counts": counts,
        "publicationStatus": quality_value["publicationStatus"],
    }


def build_expected_model(context: TrustedContext, release_root: Path) -> dict[str, Any]:
    profile = context.profile
    package = profile["package"]
    release_id = package["releaseId"]
    package_id = package["packageId"]
    source_path = resolve_repo_path(profile["canonicalLandscape"]["sourcePath"])
    source_landscape = load_json(source_path)
    require(isinstance(source_landscape, dict), "Canonical landscape must be an object")
    require(
        source_landscape.get("landscapeId")
        == profile["canonicalLandscape"]["landscapeId"],
        "Canonical landscape identity does not match the build profile",
    )
    require(
        source_landscape.get("subject") == package["subject"],
        "Canonical landscape subject does not match the package",
    )
    ontology_source = context.ontology_profile["source"]
    require(
        ontology_source["landscapeId"] == source_landscape["landscapeId"]
        and ontology_source["landscapePath"]
        == str(source_path.relative_to(REPO_ROOT)).replace("\\", "/")
        and ontology_source["locale"] == source_landscape["locale"]
        and ontology_source["subject"] == source_landscape["subject"]
        and ontology_source["schoolType"] == source_landscape["schoolType"]
        and ontology_source["country"] == source_landscape["country"],
        "Ontology profile source binding differs from the canonical landscape",
    )
    require(
        context.ledger["sourceLandscapeId"] == source_landscape["landscapeId"]
        and context.ledger["sourceLandscapePath"]
        == str(source_path.relative_to(REPO_ROOT)).replace("\\", "/"),
        "Semantic-kind ledger source binding mismatch",
    )

    source_goals = source_landscape.get("goals")
    require(isinstance(source_goals, list), "Canonical landscape goals are missing")
    source_goal_by_id: dict[str, Mapping[str, Any]] = {}
    for goal in source_goals:
        require(
            isinstance(goal, dict) and isinstance(goal.get("id"), str),
            "Malformed canonical goal",
        )
        goal_id = goal["id"]
        require(goal_id not in source_goal_by_id, f"Duplicate canonical goal ID: {goal_id}")
        source_goal_by_id[goal_id] = goal

    decisions_by_goal: dict[str, Mapping[str, Any]] = {}
    for decision in context.ledger["decisions"]:
        require(
            isinstance(decision, dict) and isinstance(decision.get("goalId"), str),
            "Malformed semantic-kind decision",
        )
        goal_id = decision["goalId"]
        require(
            goal_id not in decisions_by_goal,
            f"Duplicate semantic-kind decision: {goal_id}",
        )
        decisions_by_goal[goal_id] = decision
    require(
        set(source_goal_by_id) == set(decisions_by_goal),
        "Semantic-kind ledger must cover exactly every canonical goal",
    )

    compiled_landscape = copy.deepcopy(source_landscape)
    compiled_landscape["$schema"] = SCHEMA_IDS["compiled-landscape"]
    compiled_landscape["landscapeFormatVersion"] = "1.0"
    goals = compiled_landscape["goals"]
    relocation = profile["pathRelocations"]
    relocation_records: list[dict[str, Any]] = []
    assessment_sources: dict[str, str] = {}
    semantic_counts: Counter[str] = Counter()
    source_contract = context.ontology_profile["semanticKindDecisions"][
        "sourceFingerprint"
    ]
    allowed_semantic_kinds = set(context.ontology_profile["semanticKinds"])
    for goal in goals:
        goal_id = goal["id"]
        decision = decisions_by_goal[goal_id]
        require(
            decision.get("sourceFingerprint")
            == source_fingerprint(source_goal_by_id[goal_id], source_contract),
            f"Stale semantic-kind decision for goal {goal_id}",
        )
        semantic_kind = decision.get("semanticKind")
        require(
            semantic_kind in allowed_semantic_kinds,
            f"Unsupported semanticKind for goal {goal_id}: {semantic_kind}",
        )
        goal["semanticKind"] = semantic_kind
        semantic_counts[str(semantic_kind)] += 1

        extended = goal.get("extendedData")
        if isinstance(extended, dict):
            for field in ("vocabularySource", "vocabularySourceEn"):
                value = extended.get(field)
                if not isinstance(value, str):
                    continue
                rewritten = relocate_path(
                    value,
                    relocation["vocabularySourcePrefix"],
                    relocation["cardOutputPrefix"],
                )
                extended[field] = rewritten
                relocation_records.append(
                    {
                        "goalId": goal_id,
                        "field": f"extendedData.{field}",
                        "source": value,
                        "target": rewritten,
                    }
                )

        exam_data = goal.get("examData")
        if isinstance(exam_data, dict) and isinstance(
            exam_data.get("sourceArtifactPath"), str
        ):
            value = exam_data["sourceArtifactPath"]
            rewritten = relocate_path(
                value,
                relocation["assessmentSourcePrefix"],
                relocation["assessmentOutputPrefix"],
            )
            exam_data["sourceArtifactPath"] = rewritten
            assessment_sources[value] = rewritten
            relocation_records.append(
                {
                    "goalId": goal_id,
                    "field": "examData.sourceArtifactPath",
                    "source": value,
                    "target": rewritten,
                }
            )
        source_ref = goal.get("sourceRef")
        if isinstance(source_ref, str) and source_ref.startswith(
            relocation["assessmentSourcePrefix"]
        ):
            source_part, separator, fragment = source_ref.partition("#")
            rewritten_path = relocate_path(
                source_part,
                relocation["assessmentSourcePrefix"],
                relocation["assessmentOutputPrefix"],
            )
            rewritten = rewritten_path + (separator + fragment if separator else "")
            goal["sourceRef"] = rewritten
            assessment_sources[source_part] = rewritten_path
            relocation_records.append(
                {
                    "goalId": goal_id,
                    "field": "sourceRef",
                    "source": source_ref,
                    "target": rewritten,
                }
            )

    ledger_counts = context.ledger["counts"]
    require(
        ledger_counts.get("total") == len(goals)
        and all(ledger_counts.get(kind) == count for kind, count in semantic_counts.items())
        and set(ledger_counts) == {*semantic_counts, "total"},
        "Semantic-kind counts do not match the reviewed ledger",
    )
    assert_acyclic(goals, "contains")
    assert_acyclic(goals, "requires")
    assert_program_unit_hierarchy_acyclic(compiled_landscape.get("programUnits", []))
    validate_schema(
        compiled_landscape,
        context.validators["compiled-landscape"],
        "compiled canonical landscape",
    )

    landscape_id = compiled_landscape["landscapeId"]
    landscape_output = profile["canonicalLandscape"]["outputPath"]
    compiled_views: list[tuple[str, dict[str, Any]]] = []
    view_source_directory = resolve_repo_path(
        profile["compositionViews"]["sourceDirectory"]
    )
    for source_view_path in sorted(
        view_source_directory.glob("*.json"), key=lambda item: item.name
    ):
        value = load_json(source_view_path)
        require(isinstance(value, dict), f"Composition view is not an object: {source_view_path}")
        compiled = copy.deepcopy(value)
        compiled["$schema"] = SCHEMA_IDS["composition-view"]
        compiled["viewFormatVersion"] = "1.0"
        compiled["language"] = profile["compositionViews"]["locale"]
        validate_schema(
            compiled,
            context.validators["composition-view"],
            str(source_view_path),
        )
        require(
            compiled["landscapeId"] == landscape_id,
            f"Composition view targets another landscape: {source_view_path}",
        )
        output_path = (
            profile["compositionViews"]["outputDirectory"].rstrip("/")
            + "/"
            + source_view_path.name
        )
        compiled_views.append((output_path, compiled))
    compiled_views.sort(key=lambda item: item[1]["viewId"])
    view_ids = [view["viewId"] for _, view in compiled_views]
    require(len(view_ids) == len(set(view_ids)), "Duplicate composition-view ID")
    scopes = [canonical_json_bytes(view["scope"]) for _, view in compiled_views]
    require(len(scopes) == len(set(scopes)), "Composition-view scopes are not unique")
    require(
        profile["compositionViews"]["defaultViewId"] in set(view_ids),
        "Configured default composition view does not exist",
    )
    goal_ids = set(source_goal_by_id)
    for _, view in compiled_views:
        for _, registry_id, target_id in collect_view_goal_references(view["rootNodes"]):
            if registry_id == "view.node-landscape-id":
                require(
                    target_id == landscape_id,
                    f"Standalone view {view['viewId']} contains a foreign landscapeId {target_id}",
                )
            else:
                require(
                    target_id in goal_ids,
                    f"View {view['viewId']} references unknown goal {target_id}",
                )

    view_index_path = "data/views/index.json"
    view_index = {
        "$schema": SCHEMA_IDS["composition-view-index"],
        "indexFormatVersion": "1.0",
        "views": [
            {
                "viewId": view["viewId"],
                "landscapeId": view["landscapeId"],
                "language": view["language"],
                "scope": view["scope"],
                "artifactPath": output_path,
            }
            for output_path, view in compiled_views
        ],
    }
    validate_schema(
        view_index,
        context.validators["composition-view-index"],
        "composition-view index",
    )

    compiled_decks: list[tuple[str, dict[str, Any]]] = []
    for deck_config in profile["cardDecks"]:
        deck_source_path = resolve_repo_path(deck_config["sourcePath"])
        value = load_json(deck_source_path)
        require(isinstance(value, dict), f"Card deck is not an object: {deck_source_path}")
        compiled = copy.deepcopy(value)
        compiled["$schema"] = SCHEMA_IDS["card-deck"]
        compiled["deckFormatVersion"] = "1.0"
        compiled["language"] = deck_config["locale"]
        validate_schema(
            compiled, context.validators["card-deck"], str(deck_source_path)
        )
        require(
            compiled["landscapeId"] == landscape_id,
            f"Card deck targets another landscape: {deck_source_path}",
        )
        card_ids = [card["id"] for card in compiled["cards"]]
        require(
            len(card_ids) == len(set(card_ids)),
            f"Duplicate card ID in {compiled['deckId']}@{compiled['language']}",
        )
        compiled_decks.append((deck_config["outputPath"], compiled))
    compiled_decks.sort(key=lambda item: (item[1]["deckId"], item[1]["language"]))
    deck_identity = [(deck["deckId"], deck["language"]) for _, deck in compiled_decks]
    require(len(deck_identity) == len(set(deck_identity)), "Duplicate deck ID/locale pair")
    card_index_path = "data/cards/card-index.json"
    card_index = {
        "$schema": SCHEMA_IDS["card-index"],
        "indexFormatVersion": "1.0",
        "decks": [
            {
                "deckId": deck["deckId"],
                "landscapeId": deck["landscapeId"],
                "language": deck["language"],
                "title": deck["title"],
                "cardCount": len(deck["cards"]),
                "artifactPath": output_path,
            }
            for output_path, deck in compiled_decks
        ],
    }
    validate_schema(card_index, context.validators["card-index"], "card index")

    resource_index_path = "data/resources/resource-index.json"
    resources: list[dict[str, Any]] = []
    binary_inputs: list[dict[str, Any]] = []
    public_root = resolve_repo_path(profile["resources"]["publicAssetRoot"])
    for goal in goals:
        links = goal.get("resourceLinks")
        if not isinstance(links, list):
            continue
        for order, raw_link in enumerate(links):
            require(
                isinstance(raw_link, dict),
                f"Malformed resource link on goal {goal['id']}",
            )
            resource_id = f"goal-resource:{goal['id']}:{order}"
            common = {
                "resourceId": resource_id,
                "landscapeId": landscape_id,
                "ownerGoalId": goal["id"],
                "order": order,
            }
            if raw_link.get("type") == "goal-visualization":
                url = raw_link.get("url")
                require(
                    isinstance(url, str)
                    and url.startswith("/")
                    and not url.startswith("//"),
                    f"Invalid embedded resource URL on goal {goal['id']}",
                )
                require(
                    raw_link.get("resourceType") == "image"
                    and raw_link.get("skillpilotId") == goal["id"]
                    and raw_link.get("role") == "primary",
                    f"Visualization identity/type/role mismatch on goal {goal['id']}",
                )
                artifact_path = url[1:]
                require(
                    artifact_path.startswith(
                        profile["resources"]["embeddedOutputPrefix"].rstrip("/") + "/"
                    ),
                    f"Visualization leaves configured asset prefix: {url}",
                )
                filename = artifact_path.rsplit("/", 1)[-1]
                require(
                    filename in {f"{goal['id']}.jpg", f"{goal['id']}.png"},
                    f"Visualization filename does not equal its owner goal ID: {url}",
                )
                source_image_path = safe_join(public_root, artifact_path)
                require(source_image_path.is_file(), f"Missing image payload: {source_image_path}")
                media_type = image_media_type(source_image_path)
                require(
                    media_type in profile["resources"]["supportedImageMediaTypes"],
                    f"Unsupported configured image type: {media_type}",
                )
                size, digest = sha256_file(source_image_path)
                resource = {
                    **common,
                    "resourceKind": "goal-visualization",
                    "resourceType": "image",
                    "delivery": "embedded",
                    "runtimeRequired": True,
                    "artifactPath": artifact_path,
                    "publicUrl": url,
                    "mediaType": media_type,
                    "bytes": size,
                    "sha256": digest,
                    "role": raw_link.get("role"),
                    "title": raw_link.get("title"),
                    "provider": raw_link.get("provider"),
                    "description": raw_link.get("description"),
                    "altText": raw_link.get("altText"),
                    "language": raw_link.get("lang"),
                    "license": raw_link.get("license"),
                    "reviewStatus": raw_link.get("reviewStatus"),
                }
                binary_inputs.append(
                    {
                        "resourceId": resource_id,
                        "sourcePath": str(source_image_path.relative_to(REPO_ROOT)).replace(
                            "\\", "/"
                        ),
                        "artifactPath": artifact_path,
                        "bytes": size,
                        "sha256": digest,
                    }
                )
            else:
                external_url = raw_link.get("url")
                require(
                    isinstance(external_url, str) and external_url.startswith("https://"),
                    f"External resource on {goal['id']} must use HTTPS",
                )
                resource = {
                    **common,
                    "resourceKind": "tool",
                    "resourceType": raw_link.get("resourceType"),
                    "delivery": "external",
                    "runtimeRequired": False,
                    "externalUrl": external_url,
                    "mediaType": profile["resources"]["externalToolMediaType"],
                    "bytes": None,
                    "sha256": None,
                    "title": raw_link.get("title"),
                    "provider": raw_link.get("provider"),
                    "description": raw_link.get("description"),
                    "language": raw_link.get("lang"),
                }
                if raw_link.get("license") is not None:
                    resource["license"] = raw_link["license"]
            resources.append(resource)
    resource_ids = [resource["resourceId"] for resource in resources]
    require(len(resource_ids) == len(set(resource_ids)), "Duplicate resource ID")
    embedded_paths = [
        resource["artifactPath"]
        for resource in resources
        if resource["delivery"] == "embedded"
    ]
    require(
        len(embedded_paths) == len(set(embedded_paths)),
        "Multiple visualization resources claim the same embedded artifact path",
    )
    resource_index = {
        "$schema": SCHEMA_IDS["resource-index"],
        "indexFormatVersion": "1.0",
        "resources": resources,
    }
    validate_schema(
        resource_index, context.validators["resource-index"], "resource index"
    )

    copied_assessment_sources: list[dict[str, Any]] = []
    assessment_bytes: dict[str, bytes] = {}
    for source, target in sorted(assessment_sources.items()):
        assessment_source_path = resolve_repo_path(source)
        raw = assessment_source_path.read_bytes()
        assessment_bytes[target] = raw
        copied_assessment_sources.append(
            {
                "sourcePath": source,
                "artifactPath": target,
                "bytes": len(raw),
                "sha256": sha256_bytes(raw),
            }
        )

    publication = build_expected_publication_evidence(
        context, compiled_landscape, compiled_decks, resources
    )

    return {
        "sourceLandscape": source_landscape,
        "sourceGoalById": source_goal_by_id,
        "landscape": compiled_landscape,
        "landscapePath": landscape_output,
        "views": compiled_views,
        "viewIndex": view_index,
        "viewIndexPath": view_index_path,
        "decks": compiled_decks,
        "cardIndex": card_index,
        "cardIndexPath": card_index_path,
        "resources": resources,
        "resourceIndex": resource_index,
        "resourceIndexPath": resource_index_path,
        "binaryInputs": sorted(binary_inputs, key=lambda item: item["resourceId"]),
        "assessmentBytes": assessment_bytes,
        "copiedAssessmentSources": copied_assessment_sources,
        "relocationRecords": sorted(
            relocation_records, key=lambda item: (item["goalId"], item["field"])
        ),
        "semanticCounts": semantic_counts,
        "publication": publication,
        "releaseId": release_id,
        "packageId": package_id,
        "landscapeId": landscape_id,
        "releaseRoot": release_root,
    }


def deduplicate_definition_candidates(
    definitions: Sequence[Mapping[str, Any]],
) -> tuple[list[Mapping[str, Any]], int]:
    """Apply stable-definition-identity-v1 and return unique definitions/eliminations."""

    groups: dict[str, list[Mapping[str, Any]]] = defaultdict(list)
    for definition in definitions:
        groups[entity_key_id(definition["key"])].append(definition)
    unique: list[Mapping[str, Any]] = []
    for key_id, candidates in groups.items():
        owner_digest = {
            (candidate["ownerPackageId"], candidate["definitionDigest"])
            for candidate in candidates
        }
        if len(owner_digest) != 1:
            raise ValidationError(
                f"Conflicting definition candidates for typed entity key {key_id}"
            )
        first = candidates[0]
        for candidate in candidates[1:]:
            require(
                candidate == first,
                "Same-owner/same-digest duplicate has a divergent artifact binding",
            )
        unique.append(first)
    unique.sort(key=lambda item: canonical_json_bytes(item["key"]))
    return unique, len(definitions) - len(unique)


def validate_reference_registry_contract(
    registry: FieldRegistry, reference: Mapping[str, Any]
) -> None:
    entry_id = str(reference["registryEntryId"])
    require(entry_id in registry.by_id, f"Reference uses unknown registry entry {entry_id}")
    dependency = registry.by_id[entry_id].data.get("dependencySemantics")
    require(isinstance(dependency, dict), f"Registry entry {entry_id} lacks dependency semantics")
    strength = reference["strength"]
    expected_mode = "hard-reference" if strength == "hard" else "soft-reference"
    require(
        dependency.get("mode") == expected_mode,
        f"Registry entry {entry_id} is not classified as {expected_mode}",
    )
    target_kind = reference["target"]["kind"]
    require(
        dependency.get("targetKind") == target_kind,
        f"Registry entry {entry_id} expects {dependency.get('targetKind')}, not {target_kind}",
    )


def complete_expected_model(context: TrustedContext, model: dict[str, Any]) -> None:
    profile = context.profile
    package = profile["package"]
    package_id = model["packageId"]
    release_id = model["releaseId"]
    landscape_id = model["landscapeId"]
    landscape = model["landscape"]
    goals = landscape["goals"]
    resources = model["resources"]
    semantic_normalizer = Normalizer(context.registry)
    definitions: list[dict[str, Any]] = []

    def add_definition(
        key: dict[str, Any],
        role: str,
        logical_id: str,
        artifact_path: str,
        json_pointer: str,
        body: Any,
        body_path: str,
    ) -> None:
        normalized_body = semantic_normalizer.normalize(role, body, body_path)
        definitions.append(
            {
                "key": key,
                "provision": "owned",
                "artifactBinding": {
                    "role": role,
                    "logicalId": logical_id,
                    "path": artifact_path,
                    "jsonPointer": json_pointer,
                },
                "ownerPackageId": package_id,
                "definitionDigest": definition_digest(
                    key, normalized_body, context.definition_profile
                ),
            }
        )

    landscape_key = {"kind": "landscape", "id": landscape_id}
    add_definition(
        landscape_key,
        "canonical-landscape",
        landscape_id,
        model["landscapePath"],
        "",
        landscape,
        "",
    )
    goal_keys: dict[str, dict[str, Any]] = {}
    for index, goal in enumerate(goals):
        key = {"kind": "goal", "id": goal["id"]}
        goal_keys[goal["id"]] = key
        add_definition(
            key,
            "canonical-landscape",
            landscape_id,
            model["landscapePath"],
            pointer("goals", index),
            goal,
            pointer("goals", index),
        )

    unit_keys: dict[str, dict[str, Any]] = {}
    for index, unit in enumerate(landscape.get("programUnits", [])):
        require(unit["id"] not in unit_keys, f"Duplicate program-unit ID: {unit['id']}")
        key = {
            "kind": "program-unit",
            "landscapeId": landscape_id,
            "id": unit["id"],
        }
        unit_keys[unit["id"]] = key
        add_definition(
            key,
            "canonical-landscape",
            landscape_id,
            model["landscapePath"],
            pointer("programUnits", index),
            unit,
            pointer("programUnits", index),
        )

    placement_keys: list[dict[str, Any]] = []
    for index, placement in enumerate(landscape.get("goalPlacements", [])):
        derived_identities = context.definition_profile.get("derivedIdentities")
        require(
            isinstance(derived_identities, dict)
            and isinstance(derived_identities.get("placement"), dict),
            "Definition digest profile lacks the pinned placement identity contract",
        )
        identity_profile = derived_identities["placement"]
        normalized_placement = semantic_normalizer.normalize(
            "canonical-landscape", placement, pointer("goalPlacements", index)
        )
        placement_hash = framed_digest(
            [
                identity_profile["domain"],
                canonical_json_bytes(normalized_placement).decode("utf-8"),
            ]
        )
        placement_id = (
            identity_profile["outputPrefix"]
            + placement_hash[: identity_profile["hexLength"]]
        )
        key = {
            "kind": "placement",
            "landscapeId": landscape_id,
            "id": placement_id,
        }
        placement_keys.append(key)
        add_definition(
            key,
            "canonical-landscape",
            landscape_id,
            model["landscapePath"],
            pointer("goalPlacements", index),
            placement,
            pointer("goalPlacements", index),
        )

    competency_keys: dict[str, dict[str, Any]] = {}
    for index, competency in enumerate(landscape.get("competencyCatalog", [])):
        require(
            competency["id"] not in competency_keys,
            f"Duplicate competency-entry ID: {competency['id']}",
        )
        key = {
            "kind": "competency-entry",
            "landscapeId": landscape_id,
            "id": competency["id"],
        }
        competency_keys[competency["id"]] = key
        add_definition(
            key,
            "canonical-landscape",
            landscape_id,
            model["landscapePath"],
            pointer("competencyCatalog", index),
            competency,
            pointer("competencyCatalog", index),
        )

    view_keys: dict[str, dict[str, Any]] = {}
    for output_path, view in model["views"]:
        key = {"kind": "view", "id": view["viewId"]}
        view_keys[view["viewId"]] = key
        add_definition(
            key,
            "composition-view",
            view["viewId"],
            output_path,
            "",
            view,
            "",
        )

    deck_keys_by_path: dict[str, dict[str, Any]] = {}
    card_keys: dict[tuple[str, str, str], dict[str, Any]] = {}
    for output_path, deck in model["decks"]:
        key = {"kind": "deck", "id": deck["deckId"], "locale": deck["language"]}
        deck_keys_by_path[output_path] = key
        add_definition(
            key,
            "card-deck",
            f"{deck['deckId']}@{deck['language']}",
            output_path,
            "",
            deck,
            "",
        )
        for card_index, card in enumerate(deck["cards"]):
            card_key = {
                "kind": "card",
                "deckId": deck["deckId"],
                "locale": deck["language"],
                "id": card["id"],
            }
            card_keys[(deck["deckId"], deck["language"], card["id"])] = card_key
            add_definition(
                card_key,
                "card-deck",
                f"{deck['deckId']}@{deck['language']}",
                output_path,
                pointer("cards", card_index),
                card,
                pointer("cards", card_index),
            )

    resource_keys: dict[str, dict[str, Any]] = {}
    for index, resource in enumerate(resources):
        key = {"kind": "resource", "id": resource["resourceId"]}
        resource_keys[resource["resourceId"]] = key
        add_definition(
            key,
            "resource-index",
            f"{landscape_id}:resources",
            model["resourceIndexPath"],
            pointer("resources", index),
            resource,
            pointer("resources", index),
        )

    definitions.sort(key=lambda item: canonical_json_bytes(item["key"]))
    unique_definitions, eliminated = deduplicate_definition_candidates(definitions)
    require(eliminated == 0, "Trusted reconstruction unexpectedly produced duplicate definitions")
    require(
        len(unique_definitions) == len(definitions),
        "Typed definition keys are not unique",
    )

    references: list[dict[str, Any]] = []
    emitted_dependency_entries: set[str] = set()

    def hard(
        source: Mapping[str, Any],
        source_pointer: str,
        registry_entry_id: str,
        target: Mapping[str, Any],
    ) -> None:
        reference = {
            "source": dict(source),
            "sourcePointer": source_pointer,
            "registryEntryId": registry_entry_id,
            "strength": "hard",
            "target": dict(target),
            "resolution": "owned",
        }
        validate_reference_registry_contract(context.registry, reference)
        emitted_dependency_entries.add(registry_entry_id)
        references.append(reference)

    def soft_uri(
        source: Mapping[str, Any],
        source_pointer: str,
        registry_entry_id: str,
        uri: str,
        reason: str,
    ) -> None:
        reference = {
            "source": dict(source),
            "sourcePointer": source_pointer,
            "registryEntryId": registry_entry_id,
            "strength": "soft",
            "target": {"kind": "external-uri", "uri": uri},
            "resolution": "not-followed-soft",
            "reason": reason,
        }
        validate_reference_registry_contract(context.registry, reference)
        emitted_dependency_entries.add(registry_entry_id)
        references.append(reference)

    for goal_index, goal in enumerate(goals):
        hard(
            landscape_key,
            pointer("goals", goal_index),
            "landscape.goals",
            goal_keys[goal["id"]],
        )
    for unit_index, unit in enumerate(landscape.get("programUnits", [])):
        hard(
            landscape_key,
            pointer("programUnits", unit_index),
            "landscape.program-units",
            unit_keys[unit["id"]],
        )
        parent_id = unit.get("parentUnitId")
        if isinstance(parent_id, str):
            require(parent_id in unit_keys, f"Unknown parent program unit {parent_id}")
            hard(
                unit_keys[unit["id"]],
                pointer("parentUnitId"),
                "program-unit.parent",
                unit_keys[parent_id],
            )
    for placement_index, placement in enumerate(landscape.get("goalPlacements", [])):
        key = placement_keys[placement_index]
        hard(
            landscape_key,
            pointer("goalPlacements", placement_index),
            "landscape.goal-placements",
            key,
        )
        require(
            placement["goalId"] in goal_keys and placement["unitId"] in unit_keys,
            "Goal placement contains an unresolved target",
        )
        hard(key, pointer("goalId"), "placement.goal", goal_keys[placement["goalId"]])
        hard(key, pointer("unitId"), "placement.unit", unit_keys[placement["unitId"]])
    for competency_index, competency in enumerate(landscape.get("competencyCatalog", [])):
        hard(
            landscape_key,
            pointer("competencyCatalog", competency_index),
            "landscape.competency-catalog",
            competency_keys[competency["id"]],
        )

    resource_id_by_owner_order = {
        (resource["ownerGoalId"], resource["order"]): resource["resourceId"]
        for resource in resources
    }
    for goal in goals:
        source_key = goal_keys[goal["id"]]
        for relation, registry_id in (
            ("contains", "goal.contains"),
            ("requires", "goal.requires"),
        ):
            for target_index, target_id in enumerate(goal.get(relation, [])):
                require(
                    target_id in goal_keys,
                    f"Unresolved {relation} target {target_id} from {goal['id']}",
                )
                hard(
                    source_key,
                    pointer(relation, target_index),
                    registry_id,
                    goal_keys[target_id],
                )
        for target_pointer, registry_id, target_id in collect_goal_competency_references(goal):
            require(
                target_id in competency_keys,
                f"Unresolved competency target {target_id} from {goal['id']}",
            )
            hard(
                source_key,
                target_pointer,
                registry_id,
                competency_keys[target_id],
            )
        exam_data = goal.get("examData")
        if isinstance(exam_data, dict):
            for target_index, target_id in enumerate(exam_data.get("coveredGoalIds", [])):
                require(
                    target_id in goal_keys,
                    f"Unresolved exam target {target_id} from {goal['id']}",
                )
                hard(
                    source_key,
                    pointer("examData", "coveredGoalIds", target_index),
                    "goal.exam-covered-goals",
                    goal_keys[target_id],
                )
        extended = goal.get("extendedData")
        if isinstance(extended, dict):
            for field, registry_id in (
                ("vocabularySource", "goal.vocabulary-source"),
                ("vocabularySourceEn", "goal.vocabulary-source-en"),
            ):
                target_path = extended.get(field)
                if isinstance(target_path, str):
                    require(
                        target_path in deck_keys_by_path,
                        f"Unresolved deck path {target_path} from {goal['id']}",
                    )
                    hard(
                        source_key,
                        pointer("extendedData", field),
                        registry_id,
                        deck_keys_by_path[target_path],
                    )
        for link_order, link in enumerate(goal.get("resourceLinks", [])):
            resource_id = resource_id_by_owner_order[(goal["id"], link_order)]
            hard(
                source_key,
                pointer("resourceLinks", link_order),
                "goal.resource-links",
                resource_keys[resource_id],
            )

    for _, view in model["views"]:
        view_key = view_keys[view["viewId"]]
        hard(view_key, pointer("landscapeId"), "view.landscape-id", landscape_key)
        for source_pointer, registry_id, target_id in collect_view_goal_references(
            view["rootNodes"]
        ):
            if registry_id == "view.node-landscape-id":
                require(
                    target_id == landscape_id,
                    f"Standalone view {view['viewId']} contains a foreign landscapeId {target_id}",
                )
                hard(view_key, source_pointer, registry_id, landscape_key)
            else:
                hard(view_key, source_pointer, registry_id, goal_keys[target_id])
    for output_path, deck in model["decks"]:
        deck_key = deck_keys_by_path[output_path]
        hard(deck_key, pointer("landscapeId"), "deck.landscape-id", landscape_key)
        for card_index, card in enumerate(deck["cards"]):
            hard(
                deck_key,
                pointer("cards", card_index),
                "card-deck.cards",
                card_keys[(deck["deckId"], deck["language"], card["id"])],
            )
    for resource in resources:
        require(
            resource["landscapeId"] == landscape_id,
            f"Resource {resource['resourceId']} belongs to another landscape",
        )
        hard(
            resource_keys[resource["resourceId"]],
            pointer("landscapeId"),
            "resource.landscape-id",
            landscape_key,
        )
        hard(
            resource_keys[resource["resourceId"]],
            pointer("ownerGoalId"),
            "resource.owner-goal-id",
            goal_keys[resource["ownerGoalId"]],
        )
        if resource["delivery"] == "external":
            soft_uri(
                resource_keys[resource["resourceId"]],
                pointer("externalUrl"),
                "resource.external-url",
                resource["externalUrl"],
                "External optional resource bytes are intentionally outside standalone runtime closure.",
            )

    references.sort(
        key=lambda item: (
            canonical_json_bytes(item["source"]),
            item["sourcePointer"],
            item["registryEntryId"],
            canonical_json_bytes(item["target"]),
        )
    )
    reference_ids = [canonical_json_bytes(reference) for reference in references]
    require(len(reference_ids) == len(set(reference_ids)), "Duplicate closure reference")

    seeds = [landscape_key, *[view_keys[view_id] for view_id in sorted(view_keys)]]
    adjacency: dict[str, set[str]] = defaultdict(set)
    for reference in references:
        if reference["strength"] == "hard":
            adjacency[entity_key_id(reference["source"])].add(
                entity_key_id(reference["target"])
            )
    reachable: set[str] = set()
    queue = deque(entity_key_id(seed) for seed in seeds)
    while queue:
        current = queue.popleft()
        if current in reachable:
            continue
        reachable.add(current)
        queue.extend(sorted(adjacency.get(current, set())))
    definition_key_ids = {entity_key_id(definition["key"]) for definition in definitions}
    require(
        reachable == definition_key_ids,
        "Trusted reconstruction does not form one complete hard-reference fixed point",
    )

    definition_index = definition_index_digest(definitions, context.definition_profile)
    registry_binding = {
        "id": context.registry_value["registryId"],
        "version": context.registry_value["version"],
        "sha256": sha256_file(context.registry_path)[1],
    }
    definition_profile_binding = {
        "id": context.definition_profile["profileId"],
        "version": context.definition_profile["version"],
        "sha256": sha256_file(context.definition_profile_path)[1],
    }
    release_binding = {
        "releaseId": release_id,
        "packageId": package_id,
        "packageVersion": package["packageVersion"],
        "contentDigest": ZERO_DIGEST,
    }
    closure_path = "data/runtime/dependency-closure.json"
    closure = {
        "$schema": SCHEMA_IDS["dependency-closure"],
        "closureFormatVersion": "1.0",
        "releaseBinding": copy.deepcopy(release_binding),
        "algorithm": "schema-hard-reference-fixed-point-v1",
        "fieldSemanticsRegistry": registry_binding,
        "definitionDigestProfile": definition_profile_binding,
        "conflictPolicy": {
            "policyId": "stable-definition-identity-v1",
            "identityKey": "typed-entity-key",
            "sameKeySameOwnerSameDigest": "deduplicate",
            "sameKeyDifferentOwnerOrDigest": "reject-atomically",
            "installOrderTieBreak": "forbidden",
            "activeLockOnConflict": "unchanged",
        },
        "seeds": sorted(seeds, key=canonical_json_bytes),
        "definitions": definitions,
        "references": references,
        "embeddedFragments": [],
        "externalRuntimeDependencies": [],
        "unresolvedHardReferences": [],
        "definitionIndexDigest": definition_index,
        "closureDigest": ZERO_DIGEST,
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
        semantic_normalizer,
        context.definition_profile["closureDigest"],
    )

    migration_path = "data/runtime/migration-aliases.json"
    migration = {
        "$schema": SCHEMA_IDS["migration-aliases"],
        "migrationFormatVersion": "1.0",
        "currentRelease": {
            **release_binding,
            "definitionIndexDigest": definition_index,
        },
        "baseline": {"mode": "initial"},
        "rules": [],
        "migrationDigest": ZERO_DIGEST,
        "migrationStatus": "complete",
    }
    migration["migrationDigest"] = generated_document_digest(
        migration,
        "migration-aliases",
        semantic_normalizer,
        context.definition_profile["migrationDigest"],
    )

    scope_values: dict[str, set[str]] = defaultdict(set)
    for _, view in model["views"]:
        for dimension, value in view["scope"].items():
            require(isinstance(value, str), "Composition-view scope values must be strings")
            scope_values[dimension].add(value)
    scope_dimensions = [
        {"id": dimension, "values": sorted(scope_values[dimension])}
        for dimension in sorted(scope_values)
    ]
    default_view_id = profile["compositionViews"]["defaultViewId"]
    runtime_catalog_path = "data/runtime/catalog.json"
    runtime_catalog = {
        "$schema": SCHEMA_IDS["runtime-catalog"],
        "catalogVersion": "1.0",
        "runtimeContractVersion": profile["contracts"]["runtimeContractVersion"],
        "releaseBinding": {"releaseId": release_id, "contentDigest": ZERO_DIGEST},
        "rootLandscapeIds": [landscape_id],
        "landscapes": [
            {
                "landscapeId": landscape_id,
                "role": "root",
                "artifactPath": model["landscapePath"],
                "locale": landscape["locale"],
                "frameworkId": landscape["frameworkId"],
                "subject": landscape["subject"],
                "country": landscape["country"],
                "region": landscape["region"],
                "schoolForm": landscape["schoolType"],
                "defaultOfferingId": f"offering.{default_view_id}",
            }
        ],
        "scopeDimensions": scope_dimensions,
        "views": [
            {
                "viewId": view["viewId"],
                "landscapeId": view["landscapeId"],
                "artifactPath": output_path,
                "scope": view["scope"],
            }
            for output_path, view in model["views"]
        ],
        "offeredScopes": [
            {
                "offeringId": f"offering.{view['viewId']}",
                "landscapeId": view["landscapeId"],
                "scope": view["scope"],
                "viewResolution": {"mode": "single", "viewIds": [view["viewId"]]},
            }
            for _, view in model["views"]
        ],
        "decks": [
            {
                "deckId": deck["deckId"],
                "locale": deck["language"],
                "landscapeId": deck["landscapeId"],
                "artifactPath": output_path,
            }
            for output_path, deck in model["decks"]
        ],
        "resources": [
            {
                "resourceId": resource["resourceId"],
                "resourceKind": (
                    "goal-visualization"
                    if resource["resourceKind"] == "goal-visualization"
                    else "external-tool"
                ),
                "landscapeId": resource["landscapeId"],
                "goalId": resource["ownerGoalId"],
                "delivery": resource["delivery"],
                "runtimeRequired": resource["runtimeRequired"],
                "mediaType": resource["mediaType"],
                **(
                    {"artifactPath": resource["artifactPath"]}
                    if resource["delivery"] == "embedded"
                    else {"externalUrl": resource["externalUrl"]}
                ),
            }
            for resource in resources
        ],
        "artifactIndexes": {
            "compositionViewsPath": model["viewIndexPath"],
            "cardsPath": model["cardIndexPath"],
            "resourcesPath": model["resourceIndexPath"],
            "migrationAliasesPath": migration_path,
        },
        "dependencyClosure": {
            "path": closure_path,
            "strategy": "embedded-transitive-v1",
            "externalRuntimeDependencies": [],
        },
        "capabilities": [
            "compositionViews",
            "memoryCards",
            "goalVisualizations",
            "examNodes",
        ],
    }

    logical_documents: list[tuple[str, str, str, Any]] = [
        ("canonical-landscape", landscape_id, model["landscapePath"], landscape),
        (
            "composition-view-index",
            f"{landscape_id}:views",
            model["viewIndexPath"],
            model["viewIndex"],
        ),
        (
            "card-index",
            f"{landscape_id}:cards",
            model["cardIndexPath"],
            model["cardIndex"],
        ),
        (
            "resource-index",
            f"{landscape_id}:resources",
            model["resourceIndexPath"],
            model["resourceIndex"],
        ),
        ("dependency-closure", f"{release_id}:closure", closure_path, closure),
        ("migration-aliases", f"{release_id}:migrations", migration_path, migration),
        (
            "runtime-catalog",
            f"{release_id}:catalog",
            runtime_catalog_path,
            runtime_catalog,
        ),
    ]
    logical_documents.extend(
        ("composition-view", view["viewId"], output_path, view)
        for output_path, view in model["views"]
    )
    logical_documents.extend(
        (
            "card-deck",
            f"{deck['deckId']}@{deck['language']}",
            output_path,
            deck,
        )
        for output_path, deck in model["decks"]
    )
    logical_documents.extend(model["publication"]["logicalDocuments"])

    logical_records: list[dict[str, Any]] = []
    normalized_payloads: dict[tuple[str, str], bytes] = {}
    coverage_tracker = Normalizer(context.registry, track=True)
    for role, logical_id, _, value in logical_documents:
        normalization_role = normalization_role_for_artifact(
            context.publication_profile, role
        )
        payload = canonical_json_bytes(
            coverage_tracker.normalize(normalization_role, value)
        )
        record = {
            "role": role,
            "logicalId": logical_id,
            "mediaType": "application/json",
            "normalizedBytes": len(payload),
            "normalizedSha256": sha256_bytes(payload),
            "recordSha256": "",
        }
        record["recordSha256"] = logical_record_digest(record, context.normalization)
        logical_records.append(record)
        normalized_payloads[(role, logical_id)] = payload
    logical_records.sort(key=lambda item: (item["role"], item["logicalId"]))

    definition_roles = {
        "canonical-landscape",
        "composition-view",
        "card-deck",
        "resource-index",
    }
    active_dependency_entries = {
        entry.entry_id
        for entry in context.registry.entries
        if entry.role in definition_roles
        and coverage_tracker.occurrences[entry.entry_id] > 0
        and entry.data.get("dependencySemantics", {}).get("mode")
        in {"hard-reference", "soft-reference"}
    }
    require(
        emitted_dependency_entries == active_dependency_entries,
        "Closure emission does not exactly cover active registry dependencies: "
        f"missing={sorted(active_dependency_entries-emitted_dependency_entries)}, "
        f"unexpected={sorted(emitted_dependency_entries-active_dependency_entries)}",
    )

    binary_records: list[dict[str, Any]] = []
    for resource in resources:
        if resource["delivery"] != "embedded":
            continue
        record = {
            "resourceId": resource["resourceId"],
            "canonicalReference": resource["publicUrl"],
            "mediaType": resource["mediaType"],
            "bytes": resource["bytes"],
            "sha256": resource["sha256"],
            "recordSha256": "",
        }
        record["recordSha256"] = binary_record_digest(record, context.normalization)
        binary_records.append(record)
    binary_records.sort(key=lambda item: item["resourceId"])

    content_index_path = "metadata/semantic-content-index.json"
    content_index = {
        "$schema": SCHEMA_IDS["semantic-content-index"],
        "indexFormatVersion": "1.0",
        "normalizationProfile": {
            "id": context.normalization["profileId"],
            "version": context.normalization["version"],
            "sha256": sha256_file(context.normalization_path)[1],
        },
        "fieldSemanticsRegistry": registry_binding,
        "logicalArtifacts": logical_records,
        "binaryResources": binary_records,
        "contentDigest": ZERO_DIGEST,
    }
    content_index["contentDigest"] = semantic_content_digest(
        content_index, context.normalization
    )
    publication_content_counts = context.publication_profile["expectedCounts"][
        "contentIndex"
    ]
    require(
        len(model["publication"]["logicalDocuments"])
        == publication_content_counts["addedLogicalArtifacts"]
        and len(logical_records) == publication_content_counts["totalLogicalArtifacts"]
        and len(binary_records) == publication_content_counts["binaryResources"],
        "Publication-evidence content-index counts changed",
    )
    content_digest = content_index["contentDigest"]
    closure["releaseBinding"]["contentDigest"] = content_digest
    migration["currentRelease"]["contentDigest"] = content_digest
    runtime_catalog["releaseBinding"]["contentDigest"] = content_digest
    closure["closureDigest"] = generated_document_digest(
        closure,
        "dependency-closure",
        semantic_normalizer,
        context.definition_profile["closureDigest"],
    )
    migration["migrationDigest"] = generated_document_digest(
        migration,
        "migration-aliases",
        semantic_normalizer,
        context.definition_profile["migrationDigest"],
    )
    for role, logical_id, _, value in (
        ("dependency-closure", f"{release_id}:closure", closure_path, closure),
        ("migration-aliases", f"{release_id}:migrations", migration_path, migration),
        (
            "runtime-catalog",
            f"{release_id}:catalog",
            runtime_catalog_path,
            runtime_catalog,
        ),
    ):
        require(
            canonical_json_bytes(semantic_normalizer.normalize(role, value))
            == normalized_payloads[(role, logical_id)],
            f"Generated content-digest insertion changed semantic payload of {role}",
        )

    for value, schema_name, label in (
        (closure, "dependency-closure", "dependency closure"),
        (migration, "migration-aliases", "migration aliases"),
        (runtime_catalog, "runtime-catalog", "runtime catalog"),
        (content_index, "semantic-content-index", "semantic content index"),
    ):
        validate_schema(value, context.validators[schema_name], label)

    counts = {
        "landscapes": 1,
        "goals": len(goals),
        "programUnits": len(landscape.get("programUnits", [])),
        "goalPlacements": len(landscape.get("goalPlacements", [])),
        "competencyEntries": len(landscape.get("competencyCatalog", [])),
        "views": len(model["views"]),
        "decks": len(model["decks"]),
        "cards": sum(len(deck["cards"]) for _, deck in model["decks"]),
        "resourceLinks": len(resources),
        "embeddedImages": sum(
            resource["delivery"] == "embedded" for resource in resources
        ),
        "externalResources": sum(
            resource["delivery"] == "external" for resource in resources
        ),
        "embeddedImageBytes": sum(
            resource["bytes"]
            for resource in resources
            if resource["delivery"] == "embedded"
        ),
        "externalRuntimeDependencies": len(closure["externalRuntimeDependencies"]),
    }
    assert_json_equal(counts, profile["expectedCounts"], "real Mathematik counts")

    coverage_entries: list[dict[str, Any]] = []
    for entry in sorted(context.registry.entries, key=lambda item: item.entry_id):
        if entry.role not in RUNTIME_REGISTRY_ROLES:
            continue
        coverage_entries.append(
            {
                "entryId": entry.entry_id,
                "artifactRole": entry.role,
                "pathPattern": entry.data["pathPattern"],
                "classification": entry.data["classification"],
                "instanceCount": coverage_tracker.occurrences[entry.entry_id],
                "observedTypes": sorted(coverage_tracker.observed_types[entry.entry_id]),
                "concretePathCount": len(
                    coverage_tracker.concrete_paths[entry.entry_id]
                ),
                "status": (
                    "instance-covered"
                    if coverage_tracker.occurrences[entry.entry_id]
                    else "schema-only"
                ),
            }
        )
    coverage_report = {
        "reportFormatVersion": "1.0",
        "coverageScope": "runtime-and-publication-instance-observations",
        "schemaRegistryCoverageGate": "independent-validator-required",
        "releaseId": release_id,
        "fieldSemanticsRegistry": registry_binding,
        "runtimeEntryCount": len(coverage_entries),
        "instanceCoveredEntryCount": sum(
            entry["status"] == "instance-covered" for entry in coverage_entries
        ),
        "schemaOnlyEntryCount": sum(
            entry["status"] == "schema-only" for entry in coverage_entries
        ),
        "uncoveredFields": [],
        "ambiguousFields": [],
        "entries": coverage_entries,
        "passed": True,
    }
    build_inputs = {
        "buildInputFormatVersion": "1.0",
        "curriculumEdition": package["curriculumEdition"],
        "profilePath": str(context.profile_path.relative_to(REPO_ROOT)).replace("\\", "/"),
        "profileSha256": sha256_file(context.profile_path)[1],
        "curriculumOntologyProfile": context.ontology_profile_binding,
        "fwuCoreOntology": context.fwu_core_binding,
        "semanticKindLedgerPath": str(context.ledger_path.relative_to(REPO_ROOT)).replace(
            "\\", "/"
        ),
        "semanticKindLedgerSha256": sha256_file(context.ledger_path)[1],
        "binaryResources": model["binaryInputs"],
        "assessmentSources": model["copiedAssessmentSources"],
        "pathRelocations": model["relocationRecords"],
        "publicationEvidence": {
            "profile": {
                "id": context.publication_profile["profileId"],
                "version": context.publication_profile["version"],
                "path": str(
                    context.publication_profile_path.relative_to(REPO_ROOT)
                ).replace("\\", "/"),
                "sha256": sha256_file(context.publication_profile_path)[1],
            },
            **model["publication"]["buildInputs"],
        },
    }
    conformance = {
        "reportFormatVersion": "1.0",
        "releaseId": release_id,
        "packageId": package_id,
        "packageVersion": package["packageVersion"],
        "curriculumEdition": package["curriculumEdition"],
        "profileId": profile["profileId"],
        "contentDigest": content_digest,
        "definitionIndexDigest": definition_index,
        "closureDigest": closure["closureDigest"],
        "migrationDigest": migration["migrationDigest"],
        "counts": counts,
        "publicationEvidenceCounts": model["publication"]["counts"],
        "publicationStatus": model["publication"]["publicationStatus"],
        "semanticKindCounts": dict(sorted(model["semanticCounts"].items())),
        "unresolvedHardReferences": 0,
        "externalRuntimeDependencies": 0,
        "definitionConflicts": 0,
        "readyStatus": "conformance-model-only-not-a-package",
        "passed": True,
    }

    model.update(
        {
            "definitions": definitions,
            "references": references,
            "seeds": closure["seeds"],
            "definitionIndexDigest": definition_index,
            "registryBinding": registry_binding,
            "closure": closure,
            "closurePath": closure_path,
            "migration": migration,
            "migrationPath": migration_path,
            "runtimeCatalog": runtime_catalog,
            "runtimeCatalogPath": runtime_catalog_path,
            "logicalDocuments": logical_documents,
            "contentIndex": content_index,
            "contentIndexPath": content_index_path,
            "contentDigest": content_digest,
            "coverage": coverage_report,
            "buildInputs": build_inputs,
            "conformance": conformance,
            "counts": counts,
        }
    )


def expected_json_documents(model: Mapping[str, Any]) -> dict[str, tuple[str | None, Any]]:
    documents: dict[str, tuple[str | None, Any]] = {
        model["landscapePath"]: ("compiled-landscape", model["landscape"]),
        model["viewIndexPath"]: ("composition-view-index", model["viewIndex"]),
        model["cardIndexPath"]: ("card-index", model["cardIndex"]),
        model["resourceIndexPath"]: ("resource-index", model["resourceIndex"]),
        model["closurePath"]: ("dependency-closure", model["closure"]),
        model["migrationPath"]: ("migration-aliases", model["migration"]),
        model["runtimeCatalogPath"]: ("runtime-catalog", model["runtimeCatalog"]),
        model["contentIndexPath"]: (
            "semantic-content-index",
            model["contentIndex"],
        ),
        "metadata/field-coverage.json": (None, model["coverage"]),
        "metadata/build-inputs.json": (None, model["buildInputs"]),
        "metadata/release-model-conformance.json": (None, model["conformance"]),
    }
    for output_path, view in model["views"]:
        require(output_path not in documents, f"Duplicate output path: {output_path}")
        documents[output_path] = ("composition-view", view)
    for output_path, deck in model["decks"]:
        require(output_path not in documents, f"Duplicate output path: {output_path}")
        documents[output_path] = ("card-deck", deck)
    for role, _logical_id, output_path, value in model["publication"][
        "logicalDocuments"
    ]:
        require(output_path not in documents, f"Duplicate output path: {output_path}")
        documents[output_path] = (ARTIFACT_SCHEMA_NAMES[role], value)
    return documents


def inventory_regular_release_files(root: Path) -> set[str]:
    try:
        root_mode = root.lstat().st_mode
    except OSError as error:
        raise ValidationError(f"Cannot inspect release-model root {root}: {error}") from error
    require(
        stat.S_ISDIR(root_mode) and not stat.S_ISLNK(root_mode),
        f"Release-model root must be a real directory: {root}",
    )
    result: set[str] = set()
    for path in root.rglob("*"):
        try:
            mode = path.lstat().st_mode
        except OSError as error:
            raise ValidationError(f"Cannot inspect release-model path {path}: {error}") from error
        if stat.S_ISDIR(mode):
            continue
        if stat.S_ISREG(mode):
            result.add(str(path.relative_to(root)).replace("\\", "/"))
            continue
        raise ValidationError(
            f"Non-regular filesystem node is forbidden in release model: {path}"
        )
    return result


def validate_output_files(
    context: TrustedContext, model: Mapping[str, Any]
) -> dict[str, Any]:
    root = model["releaseRoot"]
    expected_json = expected_json_documents(model)
    expected_files = set(expected_json) | set(model["assessmentBytes"])
    actual_files = inventory_regular_release_files(root)
    require(
        actual_files == expected_files,
        "Release-model inventory differs: "
        f"missing={sorted(expected_files-actual_files)[:20]}, "
        f"extra={sorted(actual_files-expected_files)[:20]}",
    )

    actual_documents: dict[str, Any] = {}
    for relative_path, (schema_name, expected) in sorted(expected_json.items()):
        artifact_path = safe_join(root, relative_path)
        raw = artifact_path.read_bytes()
        actual = strict_json_loads(raw, relative_path)
        require(
            raw == pretty_json_bytes(actual),
            f"JSON artifact is not deterministically serialized: {relative_path}",
        )
        if schema_name is not None:
            validate_schema(
                actual,
                context.validators[schema_name],
                f"release artifact {relative_path}",
            )
        assert_json_equal(actual, expected, f"release artifact {relative_path}")
        actual_documents[relative_path] = actual
    for relative_path, expected in sorted(model["assessmentBytes"].items()):
        actual = safe_join(root, relative_path).read_bytes()
        require(
            actual == expected,
            f"Copied assessment source is not byte-identical: {relative_path}",
        )
    return actual_documents


def actual_logical_documents(
    model: Mapping[str, Any], documents_by_path: Mapping[str, Any]
) -> dict[tuple[str, str], tuple[str, Any]]:
    result: dict[tuple[str, str], tuple[str, Any]] = {}
    for role, logical_id, path, _ in model["logicalDocuments"]:
        key = (role, logical_id)
        require(key not in result, f"Duplicate logical artifact identity: {key}")
        result[key] = (path, documents_by_path[path])
    return result


def validate_closure_integrity(
    closure: Mapping[str, Any],
    context: TrustedContext,
    model: Mapping[str, Any],
    documents_by_path: Mapping[str, Any],
) -> None:
    definitions = closure["definitions"]
    unique_definitions, eliminated = deduplicate_definition_candidates(definitions)
    require(
        eliminated == 0,
        "Published closure definitions must already be policy-deduplicated",
    )
    conflict = closure["conflictCheck"]
    require(
        conflict["candidateDefinitionCount"]
        == len(definitions) + conflict["deduplicatedDefinitionCount"]
        and conflict["conflicts"] == []
        and conflict["result"] == "compatible",
        "Closure conflictCheck does not describe its definition candidates",
    )
    definition_by_key = {
        entity_key_id(definition["key"]): definition
        for definition in unique_definitions
    }
    require(
        len(definition_by_key) == len(unique_definitions),
        "Closure typed-definition keys are not unique after policy deduplication",
    )
    logical = actual_logical_documents(model, documents_by_path)
    digest_normalizer = Normalizer(context.registry)
    for definition in definitions:
        binding = definition["artifactBinding"]
        identity = (binding["role"], binding["logicalId"])
        require(identity in logical, f"Definition binds unknown logical artifact {identity}")
        artifact_path, document = logical[identity]
        require(
            binding["path"] == artifact_path,
            f"Definition binding path mismatch for {definition['key']}",
        )
        body = resolve_pointer(document, binding["jsonPointer"])
        normalized = digest_normalizer.normalize(
            binding["role"], body, binding["jsonPointer"]
        )
        require(
            definition["definitionDigest"]
            == definition_digest(definition["key"], normalized, context.definition_profile),
            f"Stale definition digest for {definition['key']}",
        )
        require(
            definition["ownerPackageId"] == model["packageId"],
            f"Unexpected definition owner for {definition['key']}",
        )

    reference_encodings: set[bytes] = set()
    adjacency: dict[str, set[str]] = defaultdict(set)
    for reference in closure["references"]:
        encoded = canonical_json_bytes(reference)
        require(encoded not in reference_encodings, "Duplicate closure reference")
        reference_encodings.add(encoded)
        validate_reference_registry_contract(context.registry, reference)
        source_id = entity_key_id(reference["source"])
        require(source_id in definition_by_key, "Reference source has no definition")
        source_definition = definition_by_key[source_id]
        source_binding = source_definition["artifactBinding"]
        source_document = logical[(source_binding["role"], source_binding["logicalId"])][1]
        source_body = resolve_pointer(source_document, source_binding["jsonPointer"])
        resolve_pointer(source_body, reference["sourcePointer"])
        if reference["strength"] == "hard":
            target_id = entity_key_id(reference["target"])
            require(target_id in definition_by_key, "Hard reference target has no definition")
            target = definition_by_key[target_id]
            require(
                reference["resolution"] == target["provision"],
                "Hard-reference resolution disagrees with target provision",
            )
            adjacency[source_id].add(target_id)

    seed_ids = [entity_key_id(seed) for seed in closure["seeds"]]
    require(len(seed_ids) == len(set(seed_ids)), "Duplicate closure seed")
    require(
        all(seed in definition_by_key for seed in seed_ids),
        "Closure seed has no definition",
    )
    reachable: set[str] = set()
    queue = deque(seed_ids)
    while queue:
        current = queue.popleft()
        if current in reachable:
            continue
        reachable.add(current)
        queue.extend(sorted(adjacency.get(current, set())))
    require(
        reachable == set(definition_by_key),
        "Definitions are missing from the hard-reference fixed point",
    )
    require(
        closure["externalRuntimeDependencies"] == []
        and closure["unresolvedHardReferences"] == [],
        "Standalone closure contains unresolved runtime dependencies",
    )
    require(
        closure["definitionIndexDigest"]
        == definition_index_digest(unique_definitions, context.definition_profile),
        "Definition-index digest mismatch",
    )
    require(
        closure["closureDigest"]
        == generated_document_digest(
            closure,
            "dependency-closure",
            Normalizer(context.registry),
            context.definition_profile["closureDigest"],
        ),
        "Closure digest mismatch",
    )


def current_goal_migration_digests(
    closure: Mapping[str, Any],
    context: TrustedContext,
    model: Mapping[str, Any],
    documents_by_path: Mapping[str, Any],
) -> dict[str, tuple[str, str]]:
    logical = actual_logical_documents(model, documents_by_path)
    normalizer = Normalizer(context.registry)
    result: dict[str, tuple[str, str]] = {}
    for definition in closure["definitions"]:
        if definition["key"]["kind"] != "goal":
            continue
        binding = definition["artifactBinding"]
        document = logical[(binding["role"], binding["logicalId"])][1]
        body = resolve_pointer(document, binding["jsonPointer"])
        normalized_body = normalizer.normalize(
            binding["role"], body, binding["jsonPointer"]
        )
        result[definition["key"]["id"]] = (
            definition["definitionDigest"],
            semantic_body_digest(normalized_body, context.definition_profile),
        )
    return result


def validate_migration_integrity(
    migration: Mapping[str, Any],
    closure: Mapping[str, Any],
    model: Mapping[str, Any],
    context: TrustedContext,
    documents_by_path: Mapping[str, Any],
) -> None:
    current = migration["currentRelease"]
    release = closure["releaseBinding"]
    require(
        current["releaseId"] == release["releaseId"]
        and current["packageId"] == release["packageId"]
        and current["packageVersion"] == release["packageVersion"]
        and current["contentDigest"] == release["contentDigest"]
        and current["definitionIndexDigest"] == closure["definitionIndexDigest"],
        "Migration current-release binding differs from the dependency closure",
    )
    require(
        migration["migrationDigest"]
        == generated_document_digest(
            migration,
            "migration-aliases",
            Normalizer(context.registry),
            context.definition_profile["migrationDigest"],
        ),
        "Migration digest mismatch",
    )
    if migration["baseline"]["mode"] == "initial":
        require(migration["rules"] == [], "Initial release must not contain migration rules")
    migration_ids = [rule["migrationId"] for rule in migration["rules"]]
    require(len(migration_ids) == len(set(migration_ids)), "Duplicate migration ID")
    current_goal_digests = current_goal_migration_digests(
        closure, context, model, documents_by_path
    )
    source_goal_rules: dict[str, str] = {}
    for rule in migration["rules"]:
        for side in ("sources", "targets"):
            goal_ids = [binding["goalId"] for binding in rule[side]]
            require(
                len(goal_ids) == len(set(goal_ids)),
                f"Migration {rule['migrationId']} repeats a goalId in {side}",
            )
        for source in rule["sources"]:
            previous = source_goal_rules.get(source["goalId"])
            require(
                previous is None,
                f"Source goal {source['goalId']} occurs in both {previous} and {rule['migrationId']}",
            )
            source_goal_rules[source["goalId"]] = rule["migrationId"]
        for target in rule["targets"]:
            require(
                target["goalId"] in current_goal_digests
                and target["definitionDigest"]
                == current_goal_digests[target["goalId"]][0]
                and target["semanticBodyDigest"]
                == current_goal_digests[target["goalId"]][1],
                f"Migration {rule['migrationId']} has a stale current target binding",
            )
        if rule["masteryPolicy"] == "copy-exact":
            require(
                len(rule["sources"]) == 1
                and len(rule["targets"]) == 1
                and rule["sources"][0]["semanticBodyDigest"]
                == rule["targets"][0]["semanticBodyDigest"],
                f"Migration {rule['migrationId']} copies mastery across changed semantics",
            )
    require(
        current["contentDigest"] == model["contentDigest"],
        "Migration is not bound to the validated semantic content",
    )


def validate_semantic_content_integrity(
    index: Mapping[str, Any],
    context: TrustedContext,
    model: Mapping[str, Any],
    documents_by_path: Mapping[str, Any],
) -> None:
    expected_normalization_binding = {
        "id": context.normalization["profileId"],
        "version": context.normalization["version"],
        "sha256": sha256_file(context.normalization_path)[1],
    }
    require(
        index["normalizationProfile"] == expected_normalization_binding
        and index["fieldSemanticsRegistry"] == model["registryBinding"],
        "Semantic content index uses untrusted contract bindings",
    )
    logical = actual_logical_documents(model, documents_by_path)
    records_by_key: dict[tuple[str, str], Mapping[str, Any]] = {}
    for record in index["logicalArtifacts"]:
        key = (record["role"], record["logicalId"])
        require(key not in records_by_key, f"Duplicate logical content record: {key}")
        records_by_key[key] = record
    require(
        set(records_by_key) == set(logical),
        "Semantic content index does not cover exactly all logical artifacts",
    )
    normalizer = Normalizer(context.registry)
    for key, (path, document) in logical.items():
        role, _ = key
        normalization_role = normalization_role_for_artifact(
            context.publication_profile, role
        )
        payload = canonical_json_bytes(
            normalizer.normalize(normalization_role, document)
        )
        record = records_by_key[key]
        require(
            record["mediaType"] == "application/json"
            and record["normalizedBytes"] == len(payload)
            and record["normalizedSha256"] == sha256_bytes(payload)
            and record["recordSha256"]
            == logical_record_digest(record, context.normalization),
            f"Logical semantic record does not match {path}",
        )

    embedded_resources = {
        resource["resourceId"]: resource
        for resource in documents_by_path[model["resourceIndexPath"]]["resources"]
        if resource["delivery"] == "embedded"
    }
    binary_by_id: dict[str, Mapping[str, Any]] = {}
    for record in index["binaryResources"]:
        resource_id = record["resourceId"]
        require(resource_id not in binary_by_id, f"Duplicate binary record {resource_id}")
        binary_by_id[resource_id] = record
    require(
        set(binary_by_id) == set(embedded_resources),
        "Semantic content index does not cover exactly every embedded image",
    )
    for resource_id, resource in embedded_resources.items():
        record = binary_by_id[resource_id]
        require(
            record["canonicalReference"] == resource["publicUrl"]
            and record["mediaType"] == resource["mediaType"]
            and record["bytes"] == resource["bytes"]
            and record["sha256"] == resource["sha256"]
            and record["recordSha256"]
            == binary_record_digest(record, context.normalization),
            f"Binary semantic record does not match resource {resource_id}",
        )
    require(
        index["contentDigest"] == semantic_content_digest(index, context.normalization),
        "Semantic content digest mismatch",
    )


def validate_publication_evidence_integrity(
    context: TrustedContext,
    model: Mapping[str, Any],
    documents_by_path: Mapping[str, Any],
) -> None:
    output_by_role = {
        output["artifactRole"]: output
        for output in context.publication_profile["outputArtifacts"].values()
    }
    values = {
        role: documents_by_path[output["outputPath"]]
        for role, output in output_by_role.items()
    }
    landscape_id = model["landscapeId"]
    mappings = values["mapping"]
    source_index = values["source-index"]
    source_goals = values["source-goal-reference-index"]
    quality = values["quality-evidence"]
    raw_source_document_semantics = context.publication_profile.get(
        "sourceDocumentSemantics"
    )
    require(
        isinstance(raw_source_document_semantics, dict)
        and raw_source_document_semantics.get("unknownRolePolicy") == "reject"
        and isinstance(raw_source_document_semantics.get("roles"), dict)
        and bool(raw_source_document_semantics["roles"]),
        "Trusted source-document semantics are not fail-closed",
    )
    source_document_semantics = raw_source_document_semantics["roles"]
    require(
        mappings["targetLandscapeId"]
        == source_index["targetLandscapeId"]
        == source_goals["targetLandscapeId"]
        == quality["landscapeId"]
        == landscape_id,
        "Publication evidence targets inconsistent landscapes",
    )
    mapping_collections = mappings["collections"]
    source_collections = source_index["collections"]
    source_goal_collections = source_goals["collections"]
    mapping_collection_ids = [
        collection["mappingCollectionId"] for collection in mapping_collections
    ]
    mapping_source_collection_ids = [
        collection["sourceCollectionId"] for collection in mapping_collections
    ]
    source_collection_ids = [
        collection["sourceCollectionId"] for collection in source_collections
    ]
    source_goal_collection_ids = [
        collection["sourceCollectionId"] for collection in source_goal_collections
    ]
    require(
        len(mapping_collections) == mappings["mappingCollectionCount"]
        and len(source_collections) == source_index["sourceCollectionCount"]
        and len(source_goal_collections) == source_goals["sourceCollectionCount"]
        and len(mapping_collection_ids) == len(set(mapping_collection_ids))
        and len(mapping_source_collection_ids)
        == len(set(mapping_source_collection_ids))
        and len(source_collection_ids) == len(set(source_collection_ids))
        and len(source_goal_collection_ids)
        == len(set(source_goal_collection_ids)),
        "Publication collection counts or stable identities are inconsistent",
    )
    mapping_by_source_collection = {
        collection["sourceCollectionId"]: collection
        for collection in mapping_collections
    }
    source_by_collection = {
        collection["sourceCollectionId"]: collection
        for collection in source_collections
    }
    source_goals_by_collection = {
        collection["sourceCollectionId"]: collection
        for collection in source_goal_collections
    }
    require(
        set(mapping_by_source_collection)
        == set(source_by_collection)
        == set(source_goals_by_collection),
        "Publication source collections are not one-to-one across indexes",
    )
    canonical_goal_ids = {goal["id"] for goal in model["landscape"]["goals"]}
    all_document_ids: set[str] = set()
    all_source_goal_ids: set[str] = set()
    observed_document_roles: set[str] = set()
    source_document_semantic_counts: Counter[str] = Counter()
    for collection_id, source_collection in source_by_collection.items():
        source_goal_collection = source_goals_by_collection[collection_id]
        mapping_collection = mapping_by_source_collection[collection_id]
        require(
            source_collection["sourceLandscapeId"]
            == source_goal_collection["sourceLandscapeId"]
            == mapping_collection["sourceLandscapeId"]
            and mapping_collection["targetLandscapeId"]
            == mappings["targetLandscapeId"]
            == landscape_id
            and (
                mapping_collection["jurisdiction"],
                mapping_collection["subject"],
                mapping_collection["stage"],
            )
            == (
                source_collection["jurisdiction"],
                source_collection["subject"],
                source_collection["stage"],
            ),
            f"Source/mapping scope mismatch for {collection_id}",
        )
        documents = source_collection["documents"]
        document_id_values = [
            document["sourceDocumentId"] for document in documents
        ]
        document_ids = set(document_id_values)
        derived_duration_models: set[str] = set()
        for document in documents:
            role = document["role"]
            require(
                role in source_document_semantics
                and document["semanticType"] == source_document_semantics[role],
                f"Source document semanticType overclaim/mismatch for "
                f"{document['sourceDocumentId']}",
            )
            observed_document_roles.add(role)
            source_document_semantic_counts[document["semanticType"]] += 1
            if "durationModel" in document:
                duration_model = document["durationModel"]
                require(
                    isinstance(duration_model, str)
                    and bool(duration_model)
                    and duration_model == duration_model.strip(),
                    f"Malformed output durationModel for "
                    f"{document['sourceDocumentId']}",
                )
                derived_duration_models.add(duration_model)
        require(
            len(document_id_values)
            == len(document_ids)
            == source_collection["documentCount"]
            and not (all_document_ids & document_ids),
            f"Duplicate/count-mismatched source documents in {collection_id}",
        )
        if derived_duration_models:
            require(
                source_collection.get("durationModels")
                == sorted(derived_duration_models),
                f"Output durationModels do not equal the document union in {collection_id}",
            )
        else:
            require(
                "durationModels" not in source_collection,
                f"Output durationModels must be absent without document values in {collection_id}",
            )
        all_document_ids.update(document_ids)
        collection_source_goals = source_goal_collection["sourceGoals"]
        collection_goal_id_values = [
            goal["sourceGoalId"] for goal in collection_source_goals
        ]
        collection_goal_ids = set(collection_goal_id_values)
        require(
            len(collection_goal_id_values)
            == len(collection_goal_ids)
            == source_goal_collection["sourceGoalCount"]
            and not (all_source_goal_ids & collection_goal_ids)
            and all(
                goal["sourceDocumentId"] in document_ids
                and goal["sourceTextSha256"]
                == "sha256:" + sha256_bytes(goal["sourceText"].encode("utf-8"))
                for goal in collection_source_goals
            ),
            f"Source-goal references are incomplete in {collection_id}",
        )
        lineage_groups: defaultdict[str, list[tuple[int, int]]] = defaultdict(list)
        for goal in collection_source_goals:
            lineage = goal.get("lineage")
            if lineage is None:
                continue
            require(
                isinstance(lineage, dict)
                and isinstance(lineage.get("splitFromSourceGoalId"), str)
                and bool(lineage["splitFromSourceGoalId"])
                and type(lineage.get("splitIndex")) is int
                and type(lineage.get("splitPartCount")) is int
                and lineage["splitIndex"] >= 1
                and lineage["splitPartCount"] >= 1,
                f"Malformed split lineage for {goal['sourceGoalId']}",
            )
            lineage_groups[lineage["splitFromSourceGoalId"]].append(
                (lineage["splitIndex"], lineage["splitPartCount"])
            )
        for split_from_source_goal_id, parts in lineage_groups.items():
            part_counts = {part_count for _index, part_count in parts}
            indices = [index for index, _part_count in parts]
            require(
                len(part_counts) == 1
                and len(indices) == len(set(indices))
                and sorted(indices)
                == list(range(1, next(iter(part_counts)) + 1)),
                "Split lineage does not exactly cover 1..N in "
                f"{collection_id}:{split_from_source_goal_id}",
            )
        all_source_goal_ids.update(collection_goal_ids)
        edges = mapping_collection["edges"]
        edge_key_values = [
            (edge["sourceGoalId"], edge["canonicalGoalId"])
            for edge in edges
        ]
        edge_keys = set(edge_key_values)
        require(
            len(edge_key_values)
            == len(edge_keys)
            == mapping_collection["mappingEdgeCount"]
            and {source_id for source_id, _ in edge_keys} == collection_goal_ids
            and all(target_id in canonical_goal_ids for _, target_id in edge_keys)
            and all(edge.get("matchType") in {"exact", "partial"} for edge in edges),
            f"Mapping edges are incomplete or dangling in {collection_id}",
        )
    require(
        len(all_document_ids) == source_index["sourceDocumentCount"]
        and len(all_source_goal_ids) == source_goals["sourceGoalCount"]
        and sum(
            collection["mappingEdgeCount"] for collection in mappings["collections"]
        )
        == mappings["mappingEdgeCount"]
        and sum(
            collection["inputDecisionCount"] for collection in mappings["collections"]
        )
        == mappings["decisionCount"],
        "Publication evidence root counts are inconsistent",
    )
    expected_source_counts = context.publication_profile["expectedCounts"]["sources"]
    require(
        observed_document_roles == set(source_document_semantics)
        and source_document_semantic_counts["curriculum"]
        == expected_source_counts["curriculumDocuments"]
        and source_document_semantic_counts["supplemental-source"]
        == expected_source_counts["supplementalDocuments"],
        "Source-document role coverage or semantic counts changed",
    )

    atomic_lane = quality["lanes"]["semanticAtomicity"]
    memory_lane = quality["lanes"]["memoryCards"]
    visual_lane = quality["lanes"]["goalVisualizations"]
    atomic_decisions = atomic_lane["decisions"]
    memory_goal_decisions = memory_lane["goalDecisions"]
    active_card_decisions = memory_lane["activeCardDecisions"]
    visual_decisions = visual_lane["decisions"]
    missing_visual_goal_ids = visual_lane["missingGoalIds"]
    atomic_goal_id_values = [decision["goalId"] for decision in atomic_decisions]
    memory_goal_id_values = [
        decision["goalId"] for decision in memory_goal_decisions
    ]
    visual_goal_id_values = [decision["goalId"] for decision in visual_decisions]
    require(
        len(atomic_goal_id_values) == len(set(atomic_goal_id_values))
        and len(memory_goal_id_values) == len(set(memory_goal_id_values))
        and len(visual_goal_id_values) == len(set(visual_goal_id_values))
        and len(missing_visual_goal_ids) == len(set(missing_visual_goal_ids)),
        "Quality evidence repeats a stable goal identity",
    )
    atomic_goal_ids = set(atomic_goal_id_values)
    quality_goal_ids = (
        atomic_goal_ids
        | set(memory_goal_id_values)
        | set(visual_goal_id_values)
        | set(missing_visual_goal_ids)
    )
    require(
        quality_goal_ids <= canonical_goal_ids,
        "Quality evidence references an unknown canonical goal",
    )
    primary_card_keys = {
        (deck["deckId"], card["id"])
        for _, deck in model["decks"]
        if deck["language"] == "de-DE"
        for card in deck["cards"]
    }
    quality_card_key_values = [
        (decision["deckId"], decision["cardId"])
        for decision in active_card_decisions
    ]
    quality_card_keys = set(quality_card_key_values)
    require(
        len(quality_card_key_values) == len(quality_card_keys)
        and quality_card_keys == primary_card_keys,
        "Quality evidence does not cover exactly all active primary cards",
    )
    required_memory_goal_ids = {
        decision["goalId"]
        for decision in memory_goal_decisions
        if decision["status"] == "memory_required"
    }
    active_origin_goal_ids = {
        goal_id
        for decision in active_card_decisions
        for goal_id in decision["originGoalIds"]
    }
    required_deck_ids = {
        deck_id
        for decision in memory_goal_decisions
        if decision["status"] == "memory_required"
        for deck_id in decision["deckIds"]
    }
    primary_deck_ids = {deck_id for deck_id, _card_id in primary_card_keys}
    require(
        required_memory_goal_ids == active_origin_goal_ids
        and required_deck_ids == primary_deck_ids,
        "Published memory goals/decks do not equal active kept-card evidence",
    )
    visual_resources = [
        resource
        for resource in model["resources"]
        if resource["resourceKind"] == "goal-visualization"
    ]
    visual_resource_goal_ids = [
        resource["ownerGoalId"] for resource in visual_resources
    ]
    require(
        len(visual_resource_goal_ids) == len(set(visual_resource_goal_ids)),
        "Active visualization resources repeat an owner goal",
    )
    visual_resource_hashes = {
        resource["ownerGoalId"]: "sha256:" + resource["sha256"]
        for resource in visual_resources
    }
    quality_visual_hashes = {
        decision["goalId"]: decision["assetSha256"]
        for decision in visual_decisions
    }
    expected_missing_visual_goal_ids = atomic_goal_ids - set(
        visual_resource_hashes
    )
    require(
        quality_visual_hashes == visual_resource_hashes
        and set(missing_visual_goal_ids) == expected_missing_visual_goal_ids
        and not (set(missing_visual_goal_ids) & set(visual_goal_id_values))
        and visual_lane["scopeGoalCount"] == len(atomic_goal_ids)
        and visual_lane["missingGoalCount"] == len(missing_visual_goal_ids),
        "Quality visualization scope/assets/missing goals are not an exact projection",
    )
    atomic_statuses = {decision["status"] for decision in atomic_decisions}
    memory_statuses = {
        decision["status"] for decision in memory_goal_decisions
    }
    visual_statuses = {decision["status"] for decision in visual_decisions}
    require(
        bool(atomic_decisions)
        and atomic_statuses <= {
            "atomic",
            "needs_developer_review",
            "non_atomic",
        }
        and bool(memory_goal_decisions)
        and memory_statuses <= {
            "no_memory_needed",
            "memory_required",
            "needs_developer_review",
        }
        and bool(visual_decisions)
        and visual_statuses
        <= {
            "human-approved",
            "pending-human-review",
            "rejected",
            "deferred-provider-limitation",
        },
        "Quality evidence contains an unsupported or empty decision set",
    )
    expected_atomic_status = (
        "failed"
        if "non_atomic" in atomic_statuses
        else "incomplete"
        if "needs_developer_review" in atomic_statuses
        else "passed"
    )
    expected_memory_status = (
        "incomplete"
        if "needs_developer_review" in memory_statuses
        else "passed"
    )
    visual_approved = sum(
        decision["status"] == "human-approved"
        for decision in visual_decisions
    )
    visual_rejected = sum(
        decision["status"] == "rejected" for decision in visual_decisions
    )
    visual_open = len(visual_decisions) - visual_approved
    expected_visual_status = (
        "failed"
        if visual_rejected
        else "incomplete"
        if visual_open or missing_visual_goal_ids
        else "passed"
    )
    total_quality_decisions = (
        len(atomic_decisions)
        + len(memory_goal_decisions)
        + len(active_card_decisions)
        + len(visual_decisions)
    )
    require(
        atomic_lane["decisionCount"] == len(atomic_decisions)
        and memory_lane["goalDecisionCount"] == len(memory_goal_decisions)
        and memory_lane["activeCardDecisionCount"]
        == len(active_card_decisions)
        and visual_lane["decisionCount"] == len(visual_decisions)
        and visual_lane["approvedCount"] == visual_approved
        and visual_lane["openCount"] == visual_open
        and quality["qualityDecisionCount"] == total_quality_decisions,
        "Quality-evidence decision counts are inconsistent",
    )
    require(
        atomic_lane["status"] == expected_atomic_status
        and memory_lane["status"] == expected_memory_status
        and visual_lane["status"] == expected_visual_status,
        "Quality lane status is not derived from decisions and missing goals",
    )
    expected_publication_status = (
        "ready"
        if {
            expected_atomic_status,
            expected_memory_status,
            expected_visual_status,
        }
        == {"passed"}
        else "not-ready"
    )
    require(
        quality["publicationStatus"] == expected_publication_status,
        "Quality evidence overclaims publication readiness",
    )
    closure_roles = {
        definition["artifactBinding"]["role"]
        for definition in documents_by_path[model["closurePath"]]["definitions"]
    }
    require(
        closure_roles.isdisjoint(PUBLICATION_ARTIFACT_ROLES),
        "Publication evidence leaked into the runtime dependency closure",
    )


def validate_cross_document_integrity(
    context: TrustedContext,
    model: Mapping[str, Any],
    documents_by_path: Mapping[str, Any],
) -> None:
    closure = documents_by_path[model["closurePath"]]
    migration = documents_by_path[model["migrationPath"]]
    catalog = documents_by_path[model["runtimeCatalogPath"]]
    content_index = documents_by_path[model["contentIndexPath"]]
    validate_closure_integrity(closure, context, model, documents_by_path)
    validate_migration_integrity(
        migration, closure, model, context, documents_by_path
    )
    validate_semantic_content_integrity(content_index, context, model, documents_by_path)
    validate_publication_evidence_integrity(
        context, model, documents_by_path
    )
    release_binding = closure["releaseBinding"]
    require(
        release_binding["releaseId"] == model["releaseId"]
        and release_binding["packageId"] == model["packageId"]
        and release_binding["contentDigest"] == content_index["contentDigest"]
        and catalog["releaseBinding"]["releaseId"] == model["releaseId"]
        and catalog["releaseBinding"]["contentDigest"] == content_index["contentDigest"],
        "Runtime documents disagree on release identity or semantic content digest",
    )
    require(
        closure["fieldSemanticsRegistry"] == model["registryBinding"],
        "Dependency closure uses an untrusted field registry",
    )
    definition_binding = closure["definitionDigestProfile"]
    require(
        definition_binding["id"] == context.definition_profile["profileId"]
        and definition_binding["version"] == context.definition_profile["version"]
        and definition_binding["sha256"]
        == sha256_file(context.definition_profile_path)[1],
        "Dependency closure uses an untrusted definition digest profile",
    )


def run_adversarial_self_tests(
    context: TrustedContext,
    model: Mapping[str, Any],
    documents_by_path: Mapping[str, Any],
) -> list[str]:
    passed: list[str] = []

    numeric_vectors = {
        -0.0: "0",
        1.0: "1",
        0.000001: "0.000001",
        0.0000001: "1e-7",
        1.25: "1.25",
        1e20: "100000000000000000000",
        1e21: "1e+21",
        -1.2e-7: "-1.2e-7",
    }
    require(
        all(canonical_float(value) == expected for value, expected in numeric_vectors.items()),
        "Canonical ECMAScript number vectors failed",
    )
    passed.append("canonical-number-vectors")

    require(
        optional_nonblank("\u2003 Fachtext \u00a0") == "Fachtext"
        and optional_nonblank("\u2003\u00a0") is None,
        "Published text boundary whitespace is not Unicode-trimmed",
    )
    passed.append("publication-unicode-boundary-whitespace")

    def expect_rejection(case_id: str, operation: Callable[[], None]) -> None:
        try:
            operation()
        except ValidationError:
            passed.append(case_id)
            return
        raise ValidationError(f"Adversarial self-test was not rejected: {case_id}")

    wrong_profile_pin = copy.deepcopy(context.profile)
    wrong_profile_pin["contracts"]["ontologyProfileSha256"] = "0" * 64
    expect_rejection(
        "ontology-profile-hash-pin",
        lambda: validate_ontology_profile_trust(
            wrong_profile_pin,
            context.ontology_profile,
            context.ontology_profile_path,
            context.registry_value,
        ),
    )

    wrong_namespace_pin = copy.deepcopy(context.profile)
    wrong_namespace_pin["contracts"]["ontologyNamespaceBindingsSha256"] = "0" * 64
    expect_rejection(
        "ontology-namespace-hash-pin",
        lambda: validate_ontology_profile_trust(
            wrong_namespace_pin,
            context.ontology_profile,
            context.ontology_profile_path,
            context.registry_value,
        ),
    )

    wrong_contains_value = copy.deepcopy(context.ontology_profile)
    contains_terms = wrong_contains_value["mappings"]["contains"]["applicationTerms"]
    contains_terms[contains_terms.index("sp:containsGoal")] = "sp:containedGoal"
    expect_rejection(
        "ontology-profile-contained-goal-predicate",
        lambda: validate_ontology_registry_order_alignment(
            wrong_contains_value, context.registry_value
        ),
    )

    wrong_contains_position = copy.deepcopy(context.registry_value)
    wrong_contains_lane = next(
        entry
        for entry in wrong_contains_position["entries"]
        if entry["entryId"] == "goal.contains"
    )
    wrong_contains_lane["rdfMapping"]["construction"]["membership"][
        "positionPredicate"
    ] = "sp:order"
    expect_rejection(
        "ontology-profile-position-predicate-lane-drift",
        lambda: validate_ontology_registry_order_alignment(
            context.ontology_profile, wrong_contains_position
        ),
    )

    unknown_core_registry = copy.deepcopy(context.registry_value)
    unknown_core_mapping = next(
        mapping
        for entry in unknown_core_registry["entries"]
        for mapping in (
            entry.get("rdfMapping", {}).get("construction"),
            entry.get("rdfMapping", {}).get("fallbackConstruction"),
        )
        if isinstance(mapping, dict)
        and isinstance(mapping.get("resourceClass"), str)
        and mapping["resourceClass"].startswith("lp:")
    )
    unknown_core_mapping["resourceClass"] = "lp:LP_999999999999"
    expect_rejection(
        "registry-unknown-core-term",
        lambda: validate_ontology_profile_trust(
            context.profile,
            context.ontology_profile,
            context.ontology_profile_path,
            unknown_core_registry,
        ),
    )

    wrong_core_build_input = copy.deepcopy(model["buildInputs"])
    wrong_core_build_input["fwuCoreOntology"]["fileSha256"] = "0" * 64
    expect_rejection(
        "fwu-core-build-input-binding",
        lambda: assert_json_equal(
            wrong_core_build_input,
            model["buildInputs"],
            "adversarial FWU Core build-input binding",
        ),
    )

    wrong_publication_pin = copy.deepcopy(context.profile)
    wrong_publication_pin["contracts"]["publicationEvidenceProfileSha256"] = "0" * 64
    expect_rejection(
        "publication-profile-hash-pin",
        lambda: require(
            sha256_file(context.publication_profile_path)[1]
            == wrong_publication_pin["contracts"]["publicationEvidenceProfileSha256"],
            "Mutated publication-evidence profile hash was accepted",
        ),
    )

    wrong_normalization_role = copy.deepcopy(context.publication_profile)
    wrong_normalization_role["outputArtifacts"]["mappings"][
        "normalizationRole"
    ] = "mapping"
    expect_rejection(
        "publication-normalization-role-binding",
        lambda: validate_schema(
            wrong_normalization_role,
            context.validators["publication-evidence-profile"],
            "adversarial publication profile",
        ),
    )

    he_binding = next(
        binding
        for binding in context.publication_profile["mappingCollections"]
        if binding["mappingCollectionId"]
        == "DE-HE-MATHEMATIK-SEKI-KC-G8-G9-MAPPING-3"
    )
    he_extraction_path = resolve_repo_path(he_binding["sourceExtractionPath"])
    mutated_he_extraction = copy.deepcopy(load_json(he_extraction_path))
    require(
        isinstance(mutated_he_extraction, dict)
        and isinstance(mutated_he_extraction.get("durationModels"), list)
        and bool(mutated_he_extraction["durationModels"]),
        "HE duration-model adversarial fixture precondition failed",
    )
    original_duration_models = list(mutated_he_extraction["durationModels"])
    mutated_he_extraction["durationModels"] = [
        *original_duration_models[:-1],
        "adversarial-duration-model",
    ]
    mutated_he_bytes = pretty_json_bytes(mutated_he_extraction)
    original_he_input = next(
        record
        for record in model["buildInputs"]["publicationEvidence"]["inputFiles"]
        if record["inputRole"] == "source-extraction"
        and record["sourcePath"] == he_binding["sourceExtractionPath"]
    )
    rebound_he_input = {
        **original_he_input,
        "bytes": len(mutated_he_bytes),
        "sha256": sha256_bytes(mutated_he_bytes),
    }
    require(
        rebound_he_input["sha256"] == sha256_bytes(mutated_he_bytes)
        and rebound_he_input["bytes"] == len(mutated_he_bytes)
        and rebound_he_input["sha256"] != original_he_input["sha256"],
        "HE duration-model adversarial input was not rebound to its mutation",
    )
    expect_rejection(
        "publication-he-duration-model-drift-with-rebound-input",
        lambda: validate_source_extraction_duration_models(
            mutated_he_extraction,
            source_documents_from_extraction(mutated_he_extraction),
            rebound_he_input["sourcePath"],
        ),
    )

    he_review = load_json(resolve_repo_path(he_binding["reviewPath"]))
    he_raw_pairs = {
        (mapping["legacyGoalId"], mapping["canonicalGoalId"]): mapping["matchType"]
        for mapping in he_review["mappings"]
    }
    raw_derived_decision = next(
        decision
        for decision in he_review["decisions"]
        if "matchType" not in decision
        and any(
            (decision["sourceGoalId"], target) in he_raw_pairs
            for target in decision["canonicalGoalIds"]
        )
    )
    raw_derived_pair = next(
        (raw_derived_decision["sourceGoalId"], target)
        for target in raw_derived_decision["canonicalGoalIds"]
        if (raw_derived_decision["sourceGoalId"], target) in he_raw_pairs
    )
    resolved_match_type, was_raw_derived = effective_mapping_match_type(
        raw_derived_decision,
        raw_derived_pair,
        he_raw_pairs,
        he_binding["reviewPath"],
    )
    require(
        resolved_match_type in {"exact", "partial"} and was_raw_derived,
        "Raw-derived matchType adversarial precondition failed",
    )
    missing_match_type_pairs = dict(he_raw_pairs)
    missing_match_type_pairs.pop(raw_derived_pair)
    expect_rejection(
        "publication-missing-match-type",
        lambda: require(
            effective_mapping_match_type(
                raw_derived_decision,
                raw_derived_pair,
                missing_match_type_pairs,
                he_binding["reviewPath"],
            )[0]
            is not None,
            "Missing decision/raw matchType fallback was accepted",
        ),
    )

    publication_outputs = context.publication_profile["outputArtifacts"]
    mapping_path = publication_outputs["mappings"]["outputPath"]
    source_index_path = publication_outputs["sourceIndex"]["outputPath"]
    source_goal_path = publication_outputs["sourceGoalReferences"]["outputPath"]
    quality_path = publication_outputs["qualityEvidence"]["outputPath"]

    rebound_target_mapping = copy.deepcopy(documents_by_path[mapping_path])
    rebound_target_mapping["targetLandscapeId"] = "adversarial-landscape"
    for collection in rebound_target_mapping["collections"]:
        collection["targetLandscapeId"] = "adversarial-landscape"
    expect_rejection(
        "mapping-rebound-target-landscape",
        lambda: validate_publication_evidence_integrity(
            context,
            model,
            {**documents_by_path, mapping_path: rebound_target_mapping},
        ),
    )

    rebound_jurisdiction_mapping = copy.deepcopy(documents_by_path[mapping_path])
    rebound_jurisdiction_mapping["collections"][0][
        "jurisdiction"
    ] = "DE-ADVERSARIAL"
    expect_rejection(
        "mapping-rebound-jurisdiction",
        lambda: validate_publication_evidence_integrity(
            context,
            model,
            {**documents_by_path, mapping_path: rebound_jurisdiction_mapping},
        ),
    )

    duration_drift_source_index = copy.deepcopy(documents_by_path[source_index_path])
    duration_collection = next(
        collection
        for collection in duration_drift_source_index["collections"]
        if collection.get("durationModels")
    )
    duration_collection["durationModels"] = ["adversarial-duration-model"]
    expect_rejection(
        "publication-output-duration-model-drift",
        lambda: validate_publication_evidence_integrity(
            context,
            model,
            {**documents_by_path, source_index_path: duration_drift_source_index},
        ),
    )

    lineage_gap_source_goals = copy.deepcopy(documents_by_path[source_goal_path])
    lineage_goal = next(
        goal
        for collection in lineage_gap_source_goals["collections"]
        for goal in collection["sourceGoals"]
        if goal.get("lineage", {}).get("splitPartCount", 0) > 1
    )
    lineage_goal["lineage"]["splitIndex"] = (
        lineage_goal["lineage"]["splitPartCount"] + 1
    )
    expect_rejection(
        "publication-source-lineage-gap",
        lambda: validate_publication_evidence_integrity(
            context,
            model,
            {**documents_by_path, source_goal_path: lineage_gap_source_goals},
        ),
    )

    missing_mapping_edge = copy.deepcopy(documents_by_path[mapping_path])
    missing_mapping_edge["collections"][0]["edges"].pop()
    expect_rejection(
        "publication-mapping-edge-loss",
        lambda: validate_publication_evidence_integrity(
            context,
            model,
            {**documents_by_path, mapping_path: missing_mapping_edge},
        ),
    )

    unknown_mapping_target = copy.deepcopy(documents_by_path[mapping_path])
    unknown_mapping_target["collections"][0]["edges"][0][
        "canonicalGoalId"
    ] = "missing-canonical-goal"
    expect_rejection(
        "publication-mapping-dangling-canonical-goal",
        lambda: validate_publication_evidence_integrity(
            context,
            model,
            {**documents_by_path, mapping_path: unknown_mapping_target},
        ),
    )

    stale_source_text = copy.deepcopy(documents_by_path[source_goal_path])
    stale_source_text["collections"][0]["sourceGoals"][0][
        "sourceTextSha256"
    ] = ZERO_DIGEST
    expect_rejection(
        "publication-source-text-hash",
        lambda: validate_publication_evidence_integrity(
            context,
            model,
            {**documents_by_path, source_goal_path: stale_source_text},
        ),
    )

    source_semantic_overclaim = copy.deepcopy(documents_by_path[source_index_path])
    first_source_document = source_semantic_overclaim["collections"][0][
        "documents"
    ][0]
    first_source_document["semanticType"] = (
        "supplemental-source"
        if first_source_document["semanticType"] == "curriculum"
        else "curriculum"
    )
    expect_rejection(
        "publication-source-semantic-type-overclaim",
        lambda: validate_publication_evidence_integrity(
            context,
            model,
            {**documents_by_path, source_index_path: source_semantic_overclaim},
        ),
    )

    quality_overclaim = copy.deepcopy(documents_by_path[quality_path])
    quality_overclaim["publicationStatus"] = "ready"
    expect_rejection(
        "publication-quality-overclaim",
        lambda: validate_publication_evidence_integrity(
            context,
            model,
            {**documents_by_path, quality_path: quality_overclaim},
        ),
    )

    rebound_visual_overclaim = copy.deepcopy(documents_by_path[quality_path])
    rebound_visual_overclaim["lanes"]["goalVisualizations"]["status"] = "passed"
    rebound_visual_overclaim["publicationStatus"] = "ready"
    expect_rejection(
        "quality-rebound-missing-visualization-overclaim",
        lambda: validate_publication_evidence_integrity(
            context,
            model,
            {**documents_by_path, quality_path: rebound_visual_overclaim},
        ),
    )

    duplicate_quality_key = copy.deepcopy(documents_by_path[quality_path])
    duplicate_atomic_lane = duplicate_quality_key["lanes"]["semanticAtomicity"]
    duplicate_atomic_lane["decisions"].append(
        copy.deepcopy(duplicate_atomic_lane["decisions"][0])
    )
    duplicate_atomic_lane["decisionCount"] += 1
    duplicate_quality_key["qualityDecisionCount"] += 1
    expect_rejection(
        "publication-duplicate-quality-key",
        lambda: validate_publication_evidence_integrity(
            context,
            model,
            {**documents_by_path, quality_path: duplicate_quality_key},
        ),
    )

    visual_scope_drift = copy.deepcopy(documents_by_path[quality_path])
    visual_scope_lane = visual_scope_drift["lanes"]["goalVisualizations"]
    visual_decision_ids = {
        decision["goalId"] for decision in visual_scope_lane["decisions"]
    }
    atomic_decision_ids = {
        decision["goalId"]
        for decision in visual_scope_drift["lanes"]["semanticAtomicity"][
            "decisions"
        ]
    }
    visual_scope_lane["missingGoalIds"].append(
        next(iter(sorted(atomic_decision_ids & visual_decision_ids)))
    )
    visual_scope_lane["missingGoalCount"] += 1
    expect_rejection(
        "quality-visual-scope-drift",
        lambda: validate_publication_evidence_integrity(
            context,
            model,
            {**documents_by_path, quality_path: visual_scope_drift},
        ),
    )

    broken_memory_trace = copy.deepcopy(documents_by_path[quality_path])
    broken_memory_trace["lanes"]["memoryCards"]["activeCardDecisions"][0][
        "originGoalIds"
    ] = ["missing-origin-goal"]
    expect_rejection(
        "publication-memory-origin-fixed-point",
        lambda: validate_publication_evidence_integrity(
            context,
            model,
            {**documents_by_path, quality_path: broken_memory_trace},
        ),
    )

    polluted_closure = copy.deepcopy(documents_by_path[model["closurePath"]])
    polluted_closure["definitions"][0]["artifactBinding"]["role"] = "mapping"
    expect_rejection(
        "publication-runtime-closure-pollution",
        lambda: validate_publication_evidence_integrity(
            context,
            model,
            {**documents_by_path, model["closurePath"]: polluted_closure},
        ),
    )

    digest_sensitive_mapping = copy.deepcopy(documents_by_path[mapping_path])
    first_edge = digest_sensitive_mapping["collections"][0]["edges"][0]
    first_edge["matchType"] = (
        "partial" if first_edge["matchType"] == "exact" else "exact"
    )
    expect_rejection(
        "publication-content-digest-sensitivity",
        lambda: validate_semantic_content_integrity(
            documents_by_path[model["contentIndexPath"]],
            context,
            model,
            {**documents_by_path, mapping_path: digest_sensitive_mapping},
        ),
    )

    incomplete_content_index = copy.deepcopy(model["contentIndex"])
    incomplete_content_index["logicalArtifacts"] = [
        record
        for record in incomplete_content_index["logicalArtifacts"]
        if record["role"] != "mapping"
    ]
    expect_rejection(
        "publication-content-index-record-loss",
        lambda: validate_semantic_content_integrity(
            incomplete_content_index, context, model, documents_by_path
        ),
    )

    legacy_competency_references = list(
        collect_goal_competency_references({"kompetenzen": ["PROCESS.K1"]})
    )
    require(
        legacy_competency_references
        == [("/kompetenzen/0", "goal.kompetenzen", "PROCESS.K1")],
        "Legacy kompetenzen references are not emitted as registered hard references",
    )
    passed.append("legacy-kompetenzen-hard-reference")

    expect_rejection(
        "program-unit-parent-cycle",
        lambda: assert_program_unit_hierarchy_acyclic(
            [
                {"id": "program-a", "parentUnitId": "program-b"},
                {"id": "program-b", "parentUnitId": "program-a"},
            ]
        ),
    )

    with tempfile.TemporaryDirectory(
        prefix="release-model-special-node-", dir=REPO_ROOT / "tmp"
    ) as temporary_directory:
        fifo_path = Path(temporary_directory) / "unexpected.fifo"
        os.mkfifo(fifo_path)
        expect_rejection(
            "output-special-filesystem-node",
            lambda: inventory_regular_release_files(Path(temporary_directory)),
        )

    mutated_landscape = copy.deepcopy(model["landscape"])
    mutated_landscape["unexpectedReleaseField"] = True
    expect_rejection(
        "closed-schema-unknown-field",
        lambda: validate_schema(
            mutated_landscape,
            context.validators["compiled-landscape"],
            "adversarial landscape",
        ),
    )

    reordered_landscape = dict(model["landscape"])
    reordered_goals = list(model["landscape"]["goals"])
    reordered_goals[0], reordered_goals[1] = reordered_goals[1], reordered_goals[0]
    reordered_landscape["goals"] = reordered_goals
    expect_rejection(
        "ordered-goal-loss",
        lambda: assert_json_equal(
            reordered_landscape, model["landscape"], "adversarial goal order"
        ),
    )

    unregistered_goal = copy.deepcopy(model["landscape"]["goals"][0])
    unregistered_goal["unregistered"] = "value"
    expect_rejection(
        "registry-unregistered-field",
        lambda: Normalizer(context.registry).normalize(
            "canonical-landscape", {"goals": [unregistered_goal]}
        ),
    )

    missing_registry_value = copy.deepcopy(context.registry_value)
    missing_registry_value["entries"] = [
        entry
        for entry in missing_registry_value["entries"]
        if entry["entryId"] != "resource.landscape-id"
    ]
    expect_rejection(
        "schema-to-registry-missing-field",
        lambda: validate_schema_registry_coverage(
            FieldRegistry(missing_registry_value),
            context.schemas,
            context.publication_profile,
        ),
    )

    dead_registry_value = copy.deepcopy(context.registry_value)
    dead_entry = copy.deepcopy(
        next(
            entry
            for entry in dead_registry_value["entries"]
            if entry["entryId"] == "view.node-goal-id"
        )
    )
    dead_entry["entryId"] = "view.dead-root-goal-id"
    dead_entry["pathPattern"] = "/rootNodes/**/rootGoalId"
    dead_registry_value["entries"].append(dead_entry)
    expect_rejection(
        "registry-to-schema-dead-path",
        lambda: validate_schema_registry_coverage(
            FieldRegistry(dead_registry_value),
            context.schemas,
            context.publication_profile,
        ),
    )

    source_goal = copy.deepcopy(next(iter(model["sourceGoalById"].values())))
    source_goal["title"] = str(source_goal["title"]) + " (tampered)"
    source_contract = context.ontology_profile["semanticKindDecisions"][
        "sourceFingerprint"
    ]
    decision_by_goal = {
        decision["goalId"]: decision for decision in context.ledger["decisions"]
    }
    expect_rejection(
        "stale-semantic-kind-ledger",
        lambda: require(
            source_fingerprint(source_goal, source_contract)
            == decision_by_goal[source_goal["id"]]["sourceFingerprint"],
            "Mutated source goal retained a stale semantic-kind fingerprint",
        ),
    )

    logical_mutation = copy.deepcopy(model["contentIndex"])
    logical_mutation["logicalArtifacts"][0]["normalizedSha256"] = "0" * 64
    expect_rejection(
        "logical-artifact-hash",
        lambda: validate_semantic_content_integrity(
            logical_mutation, context, model, documents_by_path
        ),
    )

    binary_mutation = copy.deepcopy(model["contentIndex"])
    binary_mutation["binaryResources"][0]["sha256"] = "0" * 64
    expect_rejection(
        "binary-asset-hash",
        lambda: validate_semantic_content_integrity(
            binary_mutation, context, model, documents_by_path
        ),
    )

    missing_definition = copy.deepcopy(model["closure"])
    missing_definition["definitions"].pop()
    expect_rejection(
        "closure-missing-definition",
        lambda: validate_closure_integrity(
            missing_definition, context, model, documents_by_path
        ),
    )

    missing_card_edge = copy.deepcopy(model["closure"])
    card_edge_index = next(
        index
        for index, reference in enumerate(missing_card_edge["references"])
        if reference["strength"] == "hard" and reference["target"]["kind"] == "card"
    )
    missing_card_edge["references"].pop(card_edge_index)
    expect_rejection(
        "closure-fixed-point-edge-loss",
        lambda: validate_closure_integrity(
            missing_card_edge, context, model, documents_by_path
        ),
    )

    dangling_target = copy.deepcopy(model["closure"])
    hard_reference = next(
        reference
        for reference in dangling_target["references"]
        if reference["strength"] == "hard" and reference["target"]["kind"] == "goal"
    )
    hard_reference["target"] = {"kind": "goal", "id": "missing-goal"}
    expect_rejection(
        "closure-dangling-hard-target",
        lambda: validate_closure_integrity(
            dangling_target, context, model, documents_by_path
        ),
    )

    stale_closure_digest = copy.deepcopy(model["closure"])
    stale_closure_digest["closureDigest"] = ZERO_DIGEST
    expect_rejection(
        "closure-document-digest",
        lambda: validate_closure_integrity(
            stale_closure_digest, context, model, documents_by_path
        ),
    )

    duplicate = copy.deepcopy(model["definitions"][0])
    unique, eliminated = deduplicate_definition_candidates(
        [copy.deepcopy(duplicate), copy.deepcopy(duplicate)]
    )
    require(
        len(unique) == 1 and eliminated == 1,
        "Identical definition candidates were not deterministically deduplicated",
    )
    passed.append("conflict-policy-identical-dedup")

    conflicting = copy.deepcopy(duplicate)
    conflicting["definitionDigest"] = ZERO_DIGEST
    expect_rejection(
        "conflict-policy-divergent-digest",
        lambda: deduplicate_definition_candidates([duplicate, conflicting]),
    )

    invalid_migration = copy.deepcopy(model["migration"])
    current = invalid_migration["currentRelease"]
    invalid_migration["baseline"] = {
        "mode": "previous-stable",
        "releaseId": current["releaseId"],
        "packageId": current["packageId"],
        "packageVersion": current["packageVersion"],
        "contentDigest": current["contentDigest"],
        "definitionIndexDigest": current["definitionIndexDigest"],
    }
    goal_definition = next(
        definition
        for definition in model["definitions"]
        if definition["key"]["kind"] == "goal"
    )
    migration_digests = current_goal_migration_digests(
        model["closure"], context, model, documents_by_path
    )[goal_definition["key"]["id"]]
    binding = {
        "goalId": goal_definition["key"]["id"],
        "definitionDigest": migration_digests[0],
        "semanticBodyDigest": migration_digests[1],
    }
    invalid_migration["rules"] = [
        {
            "migrationId": "adversarial-renamed",
            "relation": "renamed",
            "sources": [binding],
            "targets": [binding],
            "masteryPolicy": "reassess",
            "historyPolicy": "preserve-original-and-add-alias",
        }
    ]
    expect_rejection(
        "migration-relation-policy",
        lambda: validate_schema(
            invalid_migration,
            context.validators["migration-aliases"],
            "adversarial migration",
        ),
    )

    goal_definitions = [
        definition
        for definition in model["definitions"]
        if definition["key"]["kind"] == "goal"
    ][:2]
    current_digest_map = current_goal_migration_digests(
        model["closure"], context, model, documents_by_path
    )

    def migration_binding(definition: Mapping[str, Any]) -> dict[str, str]:
        definition_value, body_value = current_digest_map[definition["key"]["id"]]
        return {
            "goalId": definition["key"]["id"],
            "definitionDigest": definition_value,
            "semanticBodyDigest": body_value,
        }

    def previous_migration(rules: list[dict[str, Any]]) -> dict[str, Any]:
        value = copy.deepcopy(model["migration"])
        current_release = value["currentRelease"]
        value["baseline"] = {
            "mode": "previous-stable",
            "releaseId": current_release["releaseId"],
            "packageId": current_release["packageId"],
            "packageVersion": current_release["packageVersion"],
            "contentDigest": current_release["contentDigest"],
            "definitionIndexDigest": current_release["definitionIndexDigest"],
        }
        value["rules"] = rules
        value["migrationDigest"] = generated_document_digest(
            value,
            "migration-aliases",
            Normalizer(context.registry),
            context.definition_profile["migrationDigest"],
        )
        return value

    first_binding = migration_binding(goal_definitions[0])
    second_binding = migration_binding(goal_definitions[1])
    divergent_duplicate = copy.deepcopy(first_binding)
    divergent_duplicate["definitionDigest"] = ZERO_DIGEST
    duplicate_goal_migration = previous_migration(
        [
            {
                "migrationId": "duplicate-goal-in-rule",
                "relation": "splitInto",
                "sources": [first_binding],
                "targets": [first_binding, divergent_duplicate],
                "masteryPolicy": "reassess",
                "historyPolicy": "preserve-with-successor-links",
            }
        ]
    )
    expect_rejection(
        "migration-duplicate-goal-in-rule",
        lambda: validate_migration_integrity(
            duplicate_goal_migration,
            model["closure"],
            model,
            context,
            documents_by_path,
        ),
    )

    repeated_source_migration = previous_migration(
        [
            {
                "migrationId": "source-used-first",
                "relation": "replacedBy",
                "sources": [first_binding],
                "targets": [first_binding],
                "masteryPolicy": "reassess",
                "historyPolicy": "preserve-with-successor-links",
            },
            {
                "migrationId": "source-used-again",
                "relation": "replacedBy",
                "sources": [first_binding],
                "targets": [second_binding],
                "masteryPolicy": "reassess",
                "historyPolicy": "preserve-with-successor-links",
            },
        ]
    )
    expect_rejection(
        "migration-source-used-by-multiple-rules",
        lambda: validate_migration_integrity(
            repeated_source_migration,
            model["closure"],
            model,
            context,
            documents_by_path,
        ),
    )

    incomplete_catalog = copy.deepcopy(model["runtimeCatalog"])
    incomplete_catalog["views"].pop()
    expect_rejection(
        "runtime-catalog-view-loss",
        lambda: assert_json_equal(
            incomplete_catalog, model["runtimeCatalog"], "adversarial runtime catalog"
        ),
    )
    require(len(passed) == 49, f"Expected 49 adversarial cases, got {len(passed)}")
    return passed


def validate_release_model(
    profile_path: Path,
    release_root: Path,
    *,
    run_self_tests: bool,
) -> dict[str, Any]:
    context = load_trusted_context(profile_path)
    model = build_expected_model(context, release_root)
    complete_expected_model(context, model)
    documents = validate_output_files(context, model)
    validate_cross_document_integrity(context, model, documents)
    adversarial_cases = (
        run_adversarial_self_tests(context, model, documents) if run_self_tests else []
    )
    return {
        "releaseRoot": str(release_root.relative_to(REPO_ROOT)).replace("\\", "/"),
        "releaseId": model["releaseId"],
        "contentDigest": model["contentDigest"],
        "definitionIndexDigest": model["definitionIndexDigest"],
        "counts": model["counts"],
        "semanticKindCounts": dict(sorted(model["semanticCounts"].items())),
        "logicalArtifactCount": len(model["contentIndex"]["logicalArtifacts"]),
        "binaryResourceCount": len(model["contentIndex"]["binaryResources"]),
        "definitionCount": len(model["definitions"]),
        "referenceCount": len(model["references"]),
        "fieldRegistryEntryCount": len(context.registry.entries),
        "adversarialCaseCount": len(adversarial_cases),
        "adversarialCases": adversarial_cases,
        "passed": True,
    }


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--profile",
        default=str(DEFAULT_PROFILE),
        help="Trusted release-model build profile inside the repository",
    )
    parser.add_argument(
        "--release-root",
        required=True,
        help="Compiled unpacked release-model directory below repository tmp/",
    )
    parser.add_argument(
        "--skip-adversarial-self-tests",
        action="store_true",
        help="Skip the in-memory mutation suite (not recommended for CI)",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)
    profile_path = Path(args.profile)
    if not profile_path.is_absolute():
        profile_path = REPO_ROOT / profile_path
    release_root = resolve_release_root(args.release_root)
    summary = validate_release_model(
        profile_path,
        release_root,
        run_self_tests=not args.skip_adversarial_self_tests,
    )
    sys.stdout.buffer.write(pretty_json_bytes(summary))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ValidationError as error:
        print(f"Release-model validation failed: {error}", file=sys.stderr)
        raise SystemExit(1)
