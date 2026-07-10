#!/usr/bin/env python3
"""Compile a deterministic, unpacked curriculum release model.

DPK-004 deliberately stops before ZIP assembly.  The compiler consumes only
explicit paths and identities from trusted, hash-bound profiles, joins reviewed
runtime and publication evidence, hashes (but does not copy) large image
resources, and writes a closed-schema model below ``tmp/``.  It never derives
semantics from German titles, identifier prefixes, or filesystem ordering.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import math
import os
import re
import secrets
import shutil
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


REPO_ROOT = Path(__file__).resolve().parents[1]
CONTRACT_ROOT = REPO_ROOT / "contracts/curriculum-package/v1"
DEFAULT_PROFILE = CONTRACT_ROOT / "profiles/de-gymnasium-mathematik-release-model-v1.profile.json"

SCHEMA_FILES = {
    "build-profile": CONTRACT_ROOT / "release-model-build-profile.schema.json",
    "ontology-profile": CONTRACT_ROOT / "curriculum-ontology-profile.schema.json",
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
    "definition-digest-profile": CONTRACT_ROOT / "definition-digest-profile.schema.json",
    "field-semantics-registry": CONTRACT_ROOT / "field-semantics-registry.schema.json",
    "semantic-normalization-profile": CONTRACT_ROOT / "semantic-normalization-profile.schema.json",
    "publication-evidence-profile": CONTRACT_ROOT
    / "publication-evidence-projection.schema.json",
    "source-to-canonical-mappings": CONTRACT_ROOT
    / "source-to-canonical-mappings.schema.json",
    "official-source-index": CONTRACT_ROOT / "official-source-index.schema.json",
    "source-goal-reference-index": CONTRACT_ROOT
    / "source-goal-reference-index.schema.json",
    "release-quality-evidence": CONTRACT_ROOT
    / "release-quality-evidence.schema.json",
}

SCHEMA_IDS = {
    name: strict_id
    for name, strict_id in {
        "compiled-landscape": "https://skillpilot.com/schemas/curriculum-package/v1/compiled-landscape.schema.json",
        "composition-view": "https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json",
        "composition-view-index": "https://skillpilot.com/schemas/curriculum-package/v1/composition-view-index.schema.json",
        "card-deck": "https://skillpilot.com/schemas/curriculum-package/v1/card-deck.schema.json",
        "card-index": "https://skillpilot.com/schemas/curriculum-package/v1/card-index.schema.json",
        "resource-index": "https://skillpilot.com/schemas/curriculum-package/v1/resource-index.schema.json",
        "runtime-catalog": "https://skillpilot.com/schemas/curriculum-package/v1/runtime-catalog.schema.json",
        "dependency-closure": "https://skillpilot.com/schemas/curriculum-package/v1/dependency-closure.schema.json",
        "migration-aliases": "https://skillpilot.com/schemas/curriculum-package/v1/migration-aliases.schema.json",
        "semantic-content-index": "https://skillpilot.com/schemas/curriculum-package/v1/semantic-content-index.schema.json",
        "source-to-canonical-mappings": "https://skillpilot.com/schemas/curriculum-package/v1/source-to-canonical-mappings.schema.json",
        "official-source-index": "https://skillpilot.com/schemas/curriculum-package/v1/official-source-index.schema.json",
        "source-goal-reference-index": "https://skillpilot.com/schemas/curriculum-package/v1/source-goal-reference-index.schema.json",
        "release-quality-evidence": "https://skillpilot.com/schemas/curriculum-package/v1/release-quality-evidence.schema.json",
    }.items()
}

ZERO_DIGEST = "sha256:" + "0" * 64


class CompilationError(RuntimeError):
    pass


def validate_json_scalars(value: Any, source: str) -> None:
    if isinstance(value, float) and not math.isfinite(value):
        raise CompilationError(f"Non-finite number in {source}")
    if isinstance(value, str):
        for character in value:
            codepoint = ord(character)
            if 0xD800 <= codepoint <= 0xDFFF:
                raise CompilationError(f"Unpaired surrogate in {source}")
            if codepoint in {0xFFFE, 0xFFFF}:
                raise CompilationError(f"Forbidden Unicode noncharacter in {source}")
            if codepoint < 0x20 and codepoint not in {0x09, 0x0A, 0x0D}:
                raise CompilationError(f"XML/RDF-unsafe control character in {source}")
    elif isinstance(value, dict):
        for key, child in value.items():
            validate_json_scalars(key, source)
            validate_json_scalars(child, source)
    elif isinstance(value, list):
        for child in value:
            validate_json_scalars(child, source)


def strict_json_loads(raw: bytes, source: str) -> Any:
    def object_pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
        result: dict[str, Any] = {}
        for key, value in pairs:
            if key in result:
                raise CompilationError(f"Duplicate JSON key {key!r} in {source}")
            result[key] = value
        return result

    def reject_constant(value: str) -> Any:
        raise CompilationError(f"Non-RFC-8259 number {value!r} in {source}")

    try:
        value = json.loads(
            raw.decode("utf-8"),
            object_pairs_hook=object_pairs,
            parse_constant=reject_constant,
        )
    except CompilationError:
        raise
    except (UnicodeError, json.JSONDecodeError) as error:
        raise CompilationError(f"Cannot parse {source}: {error}") from error
    validate_json_scalars(value, source)
    return value


def load_json(path: Path) -> Any:
    try:
        return strict_json_loads(path.read_bytes(), str(path))
    except OSError as error:
        raise CompilationError(f"Cannot read {path}: {error}") from error


def load_json_lines(path: Path) -> list[Any]:
    try:
        raw_lines = path.read_bytes().splitlines()
    except OSError as error:
        raise CompilationError(f"Cannot read {path}: {error}") from error
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
    normalized_tags = [tag for tag in tags if isinstance(tag, str)] if isinstance(tags, list) else []
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
    normalized_tags = {tag for tag in tags if isinstance(tag, str)} if isinstance(tags, list) else set()
    if normalized_tags & {"Practice", "Assessment", "Motivation", "Orientation"}:
        return False
    if is_memory_goal(goal) or goal.get("examData") is not None:
        return False
    return True


def configured_goal_scope(
    config: Mapping[str, Any], goal_by_id: Mapping[str, Mapping[str, Any]]
) -> set[str]:
    scope = config.get("scope")
    if not isinstance(scope, dict):
        raise CompilationError("Quality review config has no scope")
    explicit = scope.get("leafGoalIds")
    if isinstance(explicit, list) and explicit:
        if any(not isinstance(goal_id, str) for goal_id in explicit):
            raise CompilationError("Quality review leafGoalIds must be strings")
        return set(explicit)
    roots = scope.get("rootGoalIds")
    if not isinstance(roots, list) or not roots or any(not isinstance(goal_id, str) for goal_id in roots):
        raise CompilationError("Quality review config needs rootGoalIds or leafGoalIds")
    visited: set[str] = set()
    pending = list(reversed(roots))
    while pending:
        goal_id = pending.pop()
        if goal_id in visited:
            continue
        goal = goal_by_id.get(goal_id)
        if goal is None:
            raise CompilationError(f"Quality review scope references unknown goal {goal_id}")
        visited.add(goal_id)
        contains = goal.get("contains")
        if isinstance(contains, list):
            for child_id in reversed(contains):
                if not isinstance(child_id, str):
                    raise CompilationError(f"Malformed contains reference on {goal_id}")
                pending.append(child_id)
    return visited


@dataclass(frozen=True)
class PublicationFieldClassification:
    classification_id: str
    input_role: str
    pattern: tuple[str, ...]
    scope: str
    disposition: str
    projection: str


class PublicationInputClassifier:
    def __init__(self, profile: Mapping[str, Any]) -> None:
        raw_entries = profile.get("fieldClassifications")
        if not isinstance(raw_entries, list) or not raw_entries:
            raise CompilationError("Publication-evidence field classifications are missing")
        entries: list[PublicationFieldClassification] = []
        seen_ids: set[str] = set()
        for raw in raw_entries:
            if not isinstance(raw, dict):
                raise CompilationError("Malformed publication-evidence field classification")
            classification_id = raw.get("classificationId")
            if not isinstance(classification_id, str) or classification_id in seen_ids:
                raise CompilationError(
                    f"Duplicate or malformed publication classification ID: {classification_id}"
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
    def matches(entry: PublicationFieldClassification, concrete: tuple[str, ...]) -> bool:
        if entry.scope == "field":
            return match_pattern(entry.pattern, concrete)
        if entry.scope != "subtree":
            raise CompilationError(
                f"Unsupported publication classification scope {entry.scope}"
            )
        for length in range(len(concrete), 0, -1):
            if match_pattern(entry.pattern, concrete[:length]):
                return True
        return False

    def classify(self, input_role: str, path: str) -> PublicationFieldClassification:
        concrete = pointer_segments(path)
        matches = [
            entry
            for entry in self.by_role.get(input_role, [])
            if self.matches(entry, concrete)
        ]
        if not matches:
            raise CompilationError(f"Unclassified authoring input field {input_role}:{path}")
        best = max(pattern_specificity(entry.pattern) for entry in matches)
        selected = [entry for entry in matches if pattern_specificity(entry.pattern) == best]
        if len(selected) != 1:
            raise CompilationError(
                f"Ambiguous authoring input classification for {input_role}:{path}: "
                + ", ".join(entry.classification_id for entry in selected)
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
            entry.classification_id for entry in self.entries if not self.hits[entry.classification_id]
        )
        if unused:
            raise CompilationError(
                f"Unobserved publication-evidence field classifications: {unused[:5]}"
            )


def canonical_float(value: float) -> str:
    """Serialize one IEEE-754 value like ECMAScript JSON.stringify.

    Python and ECMAScript use the same shortest-roundtrip decimal basis, but
    differ in fixed/scientific thresholds, exponent padding, integral `.0`,
    and negative zero.  The profile makes those byte details normative.
    """

    if not math.isfinite(value):
        raise CompilationError("Canonical JSON only permits finite numbers")
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
        return json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":"))
    if isinstance(value, list):
        return "[" + ",".join(canonical_json_text(item) for item in value) + "]"
    if isinstance(value, dict):
        if any(not isinstance(key, str) for key in value):
            raise CompilationError("Canonical JSON object keys must be strings")
        return "{" + ",".join(
            canonical_json_text(key) + ":" + canonical_json_text(value[key])
            for key in sorted(value)
        ) + "}"
    raise CompilationError(f"Unsupported canonical JSON value: {type(value).__name__}")


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
        raise CompilationError(f"Cannot hash {path}: {error}") from error
    return size, digest.hexdigest()


def frame(value: str) -> bytes:
    raw = value.encode("utf-8")
    return len(raw).to_bytes(8, "big") + raw


def framed_digest(values: Iterable[str], prefix: bool = False) -> str:
    digest = hashlib.sha256(b"".join(frame(value) for value in values)).hexdigest()
    return f"sha256:{digest}" if prefix else digest


def resolve_repo_path(value: str, *, must_exist: bool = True) -> Path:
    candidate = (REPO_ROOT / value).resolve()
    try:
        candidate.relative_to(REPO_ROOT)
    except ValueError as error:
        raise CompilationError(f"Repository path escapes checkout: {value}") from error
    if must_exist and not candidate.exists():
        raise CompilationError(f"Missing repository input: {value}")
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
        raise CompilationError(f"Cannot inspect Core checkout {checkout}: {error}") from error
    if result.returncode != 0:
        detail = result.stderr.decode("utf-8", errors="replace").strip()
        raise CompilationError(
            f"Git inspection failed in Core checkout {checkout}: {detail or arguments}"
        )
    return result.stdout


def core_terms(value: Any) -> list[str]:
    result: set[str] = set()

    def visit(node: Any) -> None:
        if isinstance(node, dict):
            for key, child in node.items():
                if key in {"coreClasses", "coreTerms"}:
                    if not isinstance(child, list) or not all(
                        isinstance(term, str) for term in child
                    ):
                        raise CompilationError(f"Malformed ontology-profile {key}")
                    result.update(child)
                else:
                    visit(child)
        elif isinstance(node, list):
            for child in node:
                visit(child)

    visit(value)
    return sorted(result)


def compact_iri_terms(value: Any, prefix: str) -> list[str]:
    """Return every compact IRI value using ``prefix`` from a JSON value.

    Registry mappings are executable semantic instructions.  A Core term used
    there must therefore be part of the ontology profile's closed, pinned term
    set instead of merely sharing its namespace binding.
    """

    result: set[str] = set()
    marker = prefix + ":"

    def visit(node: Any) -> None:
        if isinstance(node, dict):
            for key, child in node.items():
                visit(key)
                visit(child)
        elif isinstance(node, list):
            for child in node:
                visit(child)
        elif isinstance(node, str) and node.startswith(marker):
            if re.fullmatch(rf"{re.escape(prefix)}:[A-Za-z0-9._~-]+", node) is None:
                raise CompilationError(
                    f"Malformed {prefix} compact IRI in field registry: {node}"
                )
            result.add(node)

    visit(value)
    return sorted(result)


def verify_ontology_profile_trust(
    build_profile: Mapping[str, Any],
    ontology_profile: Mapping[str, Any],
    ontology_profile_path: Path,
    registry_value: Mapping[str, Any],
) -> tuple[dict[str, Any], dict[str, Any]]:
    contracts = build_profile["contracts"]
    try:
        ontology_profile_bytes = ontology_profile_path.read_bytes()
    except OSError as error:
        raise CompilationError(f"Cannot read {ontology_profile_path}: {error}") from error
    if strict_json_loads(ontology_profile_bytes, str(ontology_profile_path)) != ontology_profile:
        raise CompilationError("Curriculum ontology profile changed while being bound")
    ontology_profile_sha256 = sha256_bytes(ontology_profile_bytes)
    if ontology_profile_sha256 != contracts["ontologyProfileSha256"]:
        raise CompilationError("Curriculum ontology profile hash does not match build profile")

    namespaces = ontology_profile["namespaceBindings"]
    namespace_sha256 = sha256_bytes(canonical_json_bytes(namespaces))
    if namespace_sha256 != contracts["ontologyNamespaceBindingsSha256"]:
        raise CompilationError("Ontology namespace-binding hash does not match build profile")
    for prefix, iri in registry_value["namespaceBindings"].items():
        if prefix in namespaces and namespaces[prefix] != iri:
            raise CompilationError(
                f"Ontology profile and field registry disagree on namespace {prefix}"
            )
    compatibility = registry_value["compatibility"]
    if (
        namespaces.get("sp") != ontology_profile["applicationVocabulary"]["namespaceIri"]
        or namespaces.get("sp") != compatibility["skillpilotProfileIri"]
    ):
        raise CompilationError("Application-vocabulary namespace binding is inconsistent")

    terms = core_terms(ontology_profile)
    registry_core_terms = compact_iri_terms(registry_value, "lp")
    undeclared_registry_core_terms = sorted(set(registry_core_terms) - set(terms))
    if undeclared_registry_core_terms:
        raise CompilationError(
            "Field registry uses Core terms outside the trusted ontology profile: "
            + ", ".join(undeclared_registry_core_terms[:10])
        )
    expanded_terms: list[str] = []
    for term in terms:
        prefix, separator, local_name = term.partition(":")
        if separator != ":" or prefix not in namespaces or not local_name:
            raise CompilationError(f"Unbound Core compact IRI in ontology profile: {term}")
        expanded_terms.append(namespaces[prefix] + local_name)

    binding = ontology_profile["coreBinding"]
    declared_checkout = REPO_ROOT.joinpath(*Path(binding["checkoutPath"]).parts)
    current = REPO_ROOT
    for segment in Path(binding["checkoutPath"]).parts:
        current = current / segment
        if current.is_symlink():
            raise CompilationError("Symlinks are forbidden in the FWU Core checkout path")
    checkout = resolve_repo_path(binding["checkoutPath"])
    if not checkout.is_dir() or checkout.is_symlink():
        raise CompilationError("FWU Core checkout must be a real repository directory")
    top_level = Path(
        git_bytes(checkout, ["rev-parse", "--show-toplevel"])
        .decode("utf-8", errors="strict")
        .strip()
    ).resolve()
    if top_level != checkout:
        raise CompilationError("FWU Core checkout path is not the Git worktree root")
    remote_urls = (
        git_bytes(checkout, ["remote", "get-url", "--all", "origin"])
        .decode("utf-8", errors="strict")
        .splitlines()
    )
    if remote_urls != [binding["sourceRepository"]]:
        raise CompilationError("FWU Core checkout origin does not match ontology profile")
    head = (
        git_bytes(checkout, ["rev-parse", "--verify", "HEAD^{commit}"])
        .decode("ascii", errors="strict")
        .strip()
    )
    if head != binding["commit"]:
        raise CompilationError("FWU Core checkout HEAD does not match ontology profile")

    source_path = binding["sourcePath"]
    tree_entry = (
        git_bytes(checkout, ["ls-tree", binding["commit"], "--", source_path])
        .decode("utf-8", errors="strict")
        .strip()
    )
    expected_suffix = "\t" + source_path
    if not tree_entry.startswith("100644 blob ") or not tree_entry.endswith(expected_suffix):
        raise CompilationError("FWU Core source is not one regular tracked file at the pinned commit")
    committed_bytes = git_bytes(
        checkout, ["show", f"{binding['commit']}:{source_path}"]
    )
    committed_sha256 = sha256_bytes(committed_bytes)
    if committed_sha256 != binding["fileSha256"]:
        raise CompilationError("Pinned FWU Core Git blob hash does not match ontology profile")

    source_file = checkout.joinpath(*source_path.split("/"))
    current = declared_checkout
    for segment in source_path.split("/"):
        current = current / segment
        if current.is_symlink():
            raise CompilationError("Symlinks are forbidden in the FWU Core source path")
    try:
        resolved_source = source_file.resolve(strict=True)
        resolved_source.relative_to(checkout)
    except (OSError, ValueError) as error:
        raise CompilationError("FWU Core source path escapes or is missing") from error
    if not resolved_source.is_file():
        raise CompilationError("FWU Core source must be a regular file")
    try:
        source_bytes = resolved_source.read_bytes()
    except OSError as error:
        raise CompilationError(f"Cannot read FWU Core source: {error}") from error
    if source_bytes != committed_bytes:
        raise CompilationError("FWU Core working-tree file differs from the pinned Git blob")
    status = git_bytes(
        checkout,
        ["status", "--porcelain=v1", "--untracked-files=no", "--", source_path],
    )
    if status:
        raise CompilationError("FWU Core source has uncommitted worktree changes")
    ontology_marker = f"Ontology(<{binding['ontologyIri']}>".encode("utf-8")
    if ontology_marker not in committed_bytes:
        raise CompilationError("FWU Core file does not declare the bound ontology IRI")
    missing_terms = [
        iri for iri in expanded_terms if b"<" + iri.encode("utf-8") + b">" not in committed_bytes
    ]
    if missing_terms:
        raise CompilationError(
            "Ontology profile references terms absent from pinned FWU Core: "
            + ", ".join(missing_terms[:10])
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


def safe_output_root(value: str) -> Path:
    raw_candidate = Path(value)
    if ".." in raw_candidate.parts:
        raise CompilationError("Release-model output must not contain '..' path segments")
    candidate = raw_candidate if raw_candidate.is_absolute() else REPO_ROOT / raw_candidate
    candidate = Path(os.path.abspath(candidate))
    temporary_root = REPO_ROOT / "tmp"
    try:
        relative = candidate.relative_to(temporary_root)
    except ValueError as error:
        raise CompilationError("Release-model output must stay below repository tmp/") from error
    if relative == Path("."):
        raise CompilationError("Release-model output must be a strict child of repository tmp/")
    reject_output_symlink_components(candidate)
    return candidate


def reject_output_symlink_components(candidate: Path) -> None:
    """Reject symlinks in the existing lexical path below the trusted repo root.

    This deliberately uses ``lstat`` and never ``resolve``.  Resolving an
    attacker-controlled output path before deletion can turn a harmless link
    name into an unrelated directory selected as the recursive-delete target.
    """

    temporary_root = REPO_ROOT / "tmp"
    try:
        relative = candidate.relative_to(temporary_root)
    except ValueError as error:
        raise CompilationError("Release-model output must stay below repository tmp/") from error
    current = temporary_root
    for component in (Path("."), *relative.parts):
        if component != Path("."):
            current /= component
        try:
            metadata = current.lstat()
        except FileNotFoundError:
            return
        except OSError as error:
            raise CompilationError(f"Cannot inspect release-model output path {current}: {error}") from error
        if stat.S_ISLNK(metadata.st_mode):
            raise CompilationError(f"Symlink component is forbidden in release-model output: {current}")
        if current != candidate and not stat.S_ISDIR(metadata.st_mode):
            raise CompilationError(f"Non-directory component in release-model output: {current}")
        if current == candidate and not stat.S_ISDIR(metadata.st_mode):
            raise CompilationError(f"Release-model output exists but is not a directory: {current}")


def prepare_output_parent(output_root: Path) -> None:
    """Create the lexical parent and verify every resulting component."""

    temporary_root = REPO_ROOT / "tmp"
    temporary_root.mkdir(exist_ok=True)
    reject_output_symlink_components(output_root)
    output_root.parent.mkdir(parents=True, exist_ok=True)
    reject_output_symlink_components(output_root)


def remove_owned_tree(path: Path) -> None:
    """Remove only a private staging/backup path created by this process."""

    try:
        metadata = path.lstat()
    except FileNotFoundError:
        return
    if stat.S_ISLNK(metadata.st_mode) or not stat.S_ISDIR(metadata.st_mode):
        path.unlink()
        return
    shutil.rmtree(path)


def promote_staged_output(staging_root: Path, output_root: Path) -> None:
    """Promote a complete sibling build without recursively deleting output_root."""

    reject_output_symlink_components(output_root)
    previous_root: Path | None = None
    if output_root.exists():
        previous_root = output_root.parent / (
            f".{output_root.name}.previous-{secrets.token_hex(12)}"
        )
        try:
            previous_root.lstat()
        except FileNotFoundError:
            pass
        else:
            raise CompilationError(f"Generated backup path unexpectedly exists: {previous_root}")
        try:
            output_root.rename(previous_root)
        except OSError as error:
            raise CompilationError(f"Cannot preserve previous release-model output: {error}") from error
    try:
        staging_root.rename(output_root)
    except OSError as error:
        if previous_root is not None:
            try:
                output_root.lstat()
            except FileNotFoundError:
                previous_root.rename(output_root)
            except OSError:
                pass
        raise CompilationError(f"Cannot promote staged release-model output: {error}") from error
    if previous_root is not None:
        try:
            remove_owned_tree(previous_root)
        except OSError as error:
            raise CompilationError(f"Cannot remove preserved release-model output: {error}") from error


def safe_join(root: Path, relative_path: str) -> Path:
    if relative_path.startswith("/") or "\\" in relative_path:
        raise CompilationError(f"Unsafe package-relative path: {relative_path}")
    parts = relative_path.split("/")
    if any(part in {"", ".", ".."} for part in parts):
        raise CompilationError(f"Unsafe package-relative path: {relative_path}")
    target = (root / Path(*parts)).resolve()
    try:
        target.relative_to(root.resolve())
    except ValueError as error:
        raise CompilationError(f"Package path escapes output: {relative_path}") from error
    return target


def write_bytes(root: Path, relative_path: str, content: bytes) -> None:
    target = safe_join(root, relative_path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(content)


def write_json(root: Path, relative_path: str, value: Any) -> None:
    write_bytes(root, relative_path, pretty_json_bytes(value))


def schema_validator(path: Path) -> Draft202012Validator:
    schema = load_json(path)
    Draft202012Validator.check_schema(schema)
    return Draft202012Validator(schema, format_checker=FormatChecker())


def validate_schema(value: Any, schema_name: str, context: str) -> None:
    validator = schema_validator(SCHEMA_FILES[schema_name])
    errors = sorted(
        validator.iter_errors(value),
        key=lambda item: tuple(str(part) for part in item.absolute_path),
    )
    if errors:
        rendered = []
        for error in errors[:20]:
            location = "/" + "/".join(str(part) for part in error.absolute_path)
            rendered.append(f"{location}: {error.message}")
        extra = "" if len(errors) <= 20 else f" (+{len(errors) - 20} more)"
        raise CompilationError(f"{context} does not satisfy {schema_name}: {'; '.join(rendered)}{extra}")


def escape_pointer_segment(value: str) -> str:
    return value.replace("~", "~0").replace("/", "~1")


def pointer(*segments: object) -> str:
    return "" if not segments else "/" + "/".join(escape_pointer_segment(str(value)) for value in segments)


def pointer_segments(value: str) -> tuple[str, ...]:
    if value == "":
        return ()
    if not value.startswith("/"):
        raise CompilationError(f"Invalid JSON Pointer: {value}")
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
                raise CompilationError(f"Invalid RFC-6901 escape in {value!r}")
            decoded += "~" if raw[index + 1] == "0" else "/"
            index += 2
        result.append(decoded)
    return tuple(result)


def match_pattern(pattern: tuple[str, ...], concrete: tuple[str, ...]) -> bool:
    cache: dict[tuple[int, int], bool] = {}

    def visit(left: int, right: int) -> bool:
        key = (left, right)
        if key in cache:
            return cache[key]
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
        cache[key] = answer
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
            raise CompilationError("Field registry entries are missing")
        self.value = value
        self.entries = [
            RegistryEntry(entry, pointer_segments(str(entry["pathPattern"])))
            for entry in raw_entries
            if isinstance(entry, dict)
        ]
        entry_ids = [entry.entry_id for entry in self.entries]
        duplicate_ids = [entry_id for entry_id, count in Counter(entry_ids).items() if count > 1]
        if duplicate_ids:
            raise CompilationError(f"Duplicate field-registry entry IDs: {duplicate_ids[:3]}")
        self.by_id = {entry.entry_id: entry for entry in self.entries}
        self.by_role: dict[str, list[RegistryEntry]] = defaultdict(list)
        for entry in self.entries:
            self.by_role[entry.role].append(entry)
        if any(
            segment.isdigit()
            for entry in self.entries
            for segment in entry.pattern
            if segment not in {"*", "**"}
        ):
            raise CompilationError(
                "Numeric literal registry path segments are unsupported by index-neutral caching"
            )
        self._direct_cache: dict[
            tuple[str, tuple[str, ...]], RegistryEntry | None
        ] = {}
        self._effective_cache: dict[
            tuple[str, tuple[str, ...]], RegistryEntry
        ] = {}

    @staticmethod
    def cache_key(role: str, path: str) -> tuple[str, tuple[str, ...]]:
        return (
            role,
            tuple("*" if segment.isdigit() else segment for segment in pointer_segments(path)),
        )

    def direct(self, role: str, path: str) -> RegistryEntry | None:
        cache_key = self.cache_key(role, path)
        if cache_key in self._direct_cache:
            return self._direct_cache[cache_key]
        concrete = pointer_segments(path)
        matches = [entry for entry in self.by_role.get(role, []) if match_pattern(entry.pattern, concrete)]
        if not matches:
            self._direct_cache[cache_key] = None
            return None
        best = max(pattern_specificity(entry.pattern) for entry in matches)
        selected = [entry for entry in matches if pattern_specificity(entry.pattern) == best]
        if len(selected) != 1:
            raise CompilationError(
                f"Ambiguous field registry match for {role}:{path}: "
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
            ancestor_path = pointer(*segments[:length])
            ancestor = self.direct(role, ancestor_path)
            if ancestor is None:
                continue
            mapping = ancestor.data.get("rdfMapping")
            if isinstance(mapping, dict) and mapping.get("strategy") == "registered-canonical-json-literal":
                self._effective_cache[cache_key] = ancestor
                return ancestor
        raise CompilationError(f"Unregistered release-model field {role}:{path}")


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
    def __init__(self, registry: FieldRegistry, *, track_coverage: bool = False) -> None:
        self.registry = registry
        self.track_coverage = track_coverage
        self.occurrences: Counter[str] = Counter()
        self.observed_types: dict[str, set[str]] = defaultdict(set)
        self.concrete_paths: dict[str, set[str]] = defaultdict(set)

    def normalize(self, role: str, value: Any, path: str = "") -> Any:
        if isinstance(value, dict):
            result: dict[str, Any] = {}
            for key in sorted(value):
                child_path = f"{path}/{escape_pointer_segment(key)}" if path else f"/{escape_pointer_segment(key)}"
                entry = self.registry.effective(role, child_path)
                if self.track_coverage:
                    self.occurrences[entry.entry_id] += 1
                    self.observed_types[entry.entry_id].add(json_type(value[key]))
                    self.concrete_paths[entry.entry_id].add(child_path)
                if entry.data.get("classification") == "generated-non-semantic":
                    continue
                result[key] = self.normalize(role, value[key], child_path)
            return result
        if isinstance(value, list):
            entry = self.registry.direct(role, path)
            normalized = [self.normalize(role, child, f"{path}/{index}") for index, child in enumerate(value)]
            if entry is not None and entry.data.get("classification") == "set":
                serialized = [canonical_json_bytes(child) for child in normalized]
                if len(set(serialized)) != len(serialized):
                    raise CompilationError(f"Duplicate item in registry-declared set {role}:{path}")
                normalized = [child for _, child in sorted(zip(serialized, normalized), key=lambda item: item[0])]
            return normalized
        return value


def source_fingerprint(goal: Mapping[str, Any], source_contract: Mapping[str, Any]) -> str:
    records: list[dict[str, Any]] = []
    for field_pointer in source_contract["pointers"]:
        key = str(field_pointer)[1:]
        if key not in goal:
            records.append({"path": field_pointer, "state": "missing"})
            continue
        value = copy.deepcopy(goal[key])
        if field_pointer == "/tags":
            if not isinstance(value, list) or any(not isinstance(item, str) for item in value):
                raise CompilationError(f"Goal {goal.get('id')} has invalid tags for semantic-kind fingerprint")
            if len(set(value)) != len(value):
                raise CompilationError(f"Goal {goal.get('id')} has duplicate tags")
            value = sorted(value)
        records.append({"path": field_pointer, "state": "value", "value": value})
    projection = {
        "domain": source_contract["domain"],
        "fields": records,
    }
    return "sha256:" + sha256_bytes(canonical_json_bytes(projection))


def relocate_path(value: str, source_prefix: str, target_prefix: str) -> str:
    if not value.startswith(source_prefix):
        raise CompilationError(f"Path does not match the explicit relocation prefix: {value}")
    suffix = value[len(source_prefix) :]
    if not suffix or suffix.startswith("/") or "\\" in suffix:
        raise CompilationError(f"Unsafe relocation suffix: {value}")
    parts = suffix.split("/")
    if any(part in {"", ".", ".."} for part in parts):
        raise CompilationError(f"Unsafe relocation suffix: {value}")
    return target_prefix.rstrip("/") + "/" + suffix


def media_type_for_image(path: Path) -> str:
    suffix = path.suffix.lower()
    try:
        with path.open("rb") as handle:
            head = handle.read(8)
    except OSError as error:
        raise CompilationError(f"Cannot inspect image payload {path}: {error}") from error
    if suffix == ".jpg" and head.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if suffix == ".png" and head == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    raise CompilationError(f"Unsupported or invalid image payload: {path}")


def entity_key_sort_key(value: Mapping[str, Any]) -> bytes:
    return canonical_json_bytes(value)


def entity_key_id(value: Mapping[str, Any]) -> str:
    return canonical_json_bytes(value).decode("utf-8")


def definition_digest(key: Mapping[str, Any], normalized_body: Any, profile: Mapping[str, Any]) -> str:
    payload = canonical_json_bytes({"body": normalized_body, "key": key}).decode("utf-8")
    domain = str(profile["definitionDigest"]["domain"])
    return framed_digest([domain, payload], prefix=True)


def definition_index_digest(definitions: Sequence[Mapping[str, Any]], profile: Mapping[str, Any]) -> str:
    ordered = sorted(definitions, key=lambda item: entity_key_sort_key(item["key"]))
    values = [str(profile["definitionIndexDigest"]["domain"])]
    for definition in ordered:
        values.extend(
            [
                canonical_json_bytes(definition["key"]).decode("utf-8"),
                str(definition["ownerPackageId"]),
                str(definition["definitionDigest"]),
            ]
        )
    return framed_digest(values, prefix=True)


def generated_document_digest(
    value: Mapping[str, Any],
    role: str,
    normalizer: "Normalizer",
    digest_profile: Mapping[str, Any],
) -> str:
    projection = normalizer.normalize(role, value)
    return framed_digest(
        [
            str(digest_profile["domain"]),
            canonical_json_bytes(projection).decode("utf-8"),
        ],
        prefix=True,
    )


def calculate_logical_record(artifact: Mapping[str, Any], normalization: Mapping[str, Any]) -> str:
    return framed_digest(
        [
            normalization["semanticArtifactDigest"]["domain"],
            str(artifact["role"]),
            str(artifact["logicalId"]),
            str(artifact["mediaType"]),
            str(artifact["normalizedBytes"]),
            str(artifact["normalizedSha256"]),
        ]
    )


def calculate_binary_record(resource: Mapping[str, Any], normalization: Mapping[str, Any]) -> str:
    return framed_digest(
        [
            normalization["binaryAssetDigest"]["domain"],
            str(resource["resourceId"]),
            str(resource["canonicalReference"]),
            str(resource["mediaType"]),
            str(resource["bytes"]),
            str(resource["sha256"]),
        ]
    )


def calculate_content_digest(index: Mapping[str, Any], normalization: Mapping[str, Any]) -> str:
    values: list[str] = [normalization["contentDigest"]["domain"]]
    for key in ("normalizationProfile", "fieldSemanticsRegistry"):
        binding = index[key]
        values.extend([binding["id"], binding["version"], binding["sha256"]])
    values.append("semantic-artifact-records")
    for artifact in sorted(index["logicalArtifacts"], key=lambda item: (item["role"], item["logicalId"])):
        values.append(artifact["recordSha256"])
    values.append("binary-asset-records")
    for resource in sorted(index["binaryResources"], key=lambda item: item["resourceId"]):
        values.append(resource["recordSha256"])
    return framed_digest(values, prefix=True)


def collect_view_references(
    nodes: Sequence[Any], prefix: tuple[object, ...] = ("rootNodes",)
) -> Iterator[tuple[str, str, str, str]]:
    for index, raw in enumerate(nodes):
        if not isinstance(raw, dict):
            continue
        current = (*prefix, index)
        for key, registry_id, target_kind in (
            ("goalId", "view.node-goal-id", "goal"),
            ("landscapeId", "view.node-landscape-id", "landscape"),
        ):
            value = raw.get(key)
            if isinstance(value, str):
                yield pointer(*current, key), registry_id, target_kind, value
        children = raw.get("children")
        if isinstance(children, list):
            yield from collect_view_references(children, (*current, "children"))


def emit_goal_competency_references(
    goal: Mapping[str, Any],
    source_key: Mapping[str, Any],
    competency_keys: Mapping[str, Mapping[str, Any]],
    hard: Callable[[Mapping[str, Any], str, str, Mapping[str, Any]], None],
) -> None:
    """Emit both current and legacy schema-valid competency hard references."""

    for field, registry_id in (
        ("competencyRefs", "goal.competency-refs"),
        ("kompetenzen", "goal.kompetenzen"),
    ):
        for index, target_id in enumerate(goal.get(field, [])):
            if target_id not in competency_keys:
                raise CompilationError(
                    f"Unresolved competency target {target_id} from {goal['id']}"
                )
            hard(
                source_key,
                pointer(field, index),
                registry_id,
                competency_keys[target_id],
            )


def run_dependency_emission_probe() -> dict[str, Any]:
    """Exercise the production emitter with the legacy compatibility field."""

    source_key = {"kind": "goal", "id": "probe-goal"}
    target_key = {
        "kind": "competency-entry",
        "landscapeId": "probe-landscape",
        "id": "PROCESS.K1",
    }
    emitted: list[dict[str, Any]] = []

    def capture(
        source: Mapping[str, Any],
        source_pointer: str,
        registry_entry_id: str,
        target: Mapping[str, Any],
    ) -> None:
        emitted.append(
            {
                "source": dict(source),
                "sourcePointer": source_pointer,
                "registryEntryId": registry_entry_id,
                "strength": "hard",
                "target": dict(target),
                "resolution": "owned",
            }
        )

    emit_goal_competency_references(
        {"id": "probe-goal", "kompetenzen": ["PROCESS.K1"]},
        source_key,
        {"PROCESS.K1": target_key},
        capture,
    )
    expected = [
        {
            "source": source_key,
            "sourcePointer": "/kompetenzen/0",
            "registryEntryId": "goal.kompetenzen",
            "strength": "hard",
            "target": target_key,
            "resolution": "owned",
        }
    ]
    if emitted != expected:
        raise CompilationError(
            "Legacy kompetenzen dependency-emission probe differs from exact closure reference"
        )
    return {
        "probe": "legacy-kompetenzen-hard-reference",
        "referenceCount": len(emitted),
        "passed": True,
    }


def assert_program_unit_hierarchy_acyclic(units: Sequence[Mapping[str, Any]]) -> None:
    parents: dict[str, str | None] = {}
    for unit in units:
        unit_id = str(unit["id"])
        if unit_id in parents:
            raise CompilationError(f"Duplicate program-unit ID: {unit_id}")
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
            raise CompilationError(
                "program-unit parent cycle: "
                + " -> ".join([*stack[start:], unit_id])
            )
        states[unit_id] = 1
        stack.append(unit_id)
        parent_id = parents[unit_id]
        if parent_id is not None:
            if parent_id not in parents:
                raise CompilationError(
                    f"Unknown parent program unit {parent_id} from {unit_id}"
                )
            visit(parent_id)
        stack.pop()
        states[unit_id] = 2

    for unit_id in parents:
        visit(unit_id)


def source_documents_from_extraction(extraction: Mapping[str, Any]) -> list[Mapping[str, Any]]:
    raw_documents = extraction.get("sourceDocuments")
    if isinstance(raw_documents, list) and raw_documents:
        documents = raw_documents
    else:
        single = extraction.get("sourceDocument")
        documents = [single] if isinstance(single, dict) else []
    if not documents or any(not isinstance(document, dict) for document in documents):
        raise CompilationError(
            f"Source extraction {extraction.get('extractionId')} has no source documents"
        )
    return documents


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


def assert_http_url(value: Any, context: str) -> str:
    if not isinstance(value, str) or not re.fullmatch(r"https?://[^\s]+", value):
        raise CompilationError(f"Official source URL must be HTTP(S) in {context}")
    return value


def optional_nonblank(value: Any) -> str | None:
    return value.strip() if isinstance(value, str) and value.strip() else None


def publication_input_record(role: str, path: Path, disposition: str) -> dict[str, Any]:
    size, digest = sha256_file(path)
    return {
        "inputRole": role,
        "sourcePath": str(path.relative_to(REPO_ROOT)).replace("\\", "/"),
        "disposition": disposition,
        "bytes": size,
        "sha256": digest,
    }


def compile_mapping_source_lane(
    raw_binding: Mapping[str, Any],
    landscape_id: str,
    canonical_goal_ids: set[str],
    legacy_membership_by_landscape: Mapping[str, set[str]],
    classifier: PublicationInputClassifier,
    source_document_semantics: Mapping[str, str],
) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any], Counter[str], list[dict[str, Any]]]:
    review_path = resolve_repo_path(str(raw_binding["reviewPath"]))
    extraction_path = resolve_repo_path(str(raw_binding["sourceExtractionPath"]))
    legacy_path = resolve_repo_path(str(raw_binding["legacyMappingPath"]))
    review = load_json(review_path)
    extraction = load_json(extraction_path)
    legacy = load_json(legacy_path)
    if not all(isinstance(value, dict) for value in (review, extraction, legacy)):
        raise CompilationError("Publication mapping inputs must be JSON objects")
    classifier.observe("mapping-review", review)
    classifier.observe("source-extraction", extraction)
    classifier.observe("legacy-mapping", legacy)
    input_files = [
        publication_input_record("mapping-review", review_path, "publication-evidence"),
        publication_input_record("source-extraction", extraction_path, "authoring-only-projected"),
        publication_input_record("legacy-mapping", legacy_path, "authoring-only"),
    ]

    collection_id = extraction.get("extractionId")
    source_landscape_id = extraction.get("sourceLandscapeId")
    if not isinstance(collection_id, str) or not collection_id:
        raise CompilationError(f"Source extraction has no extractionId: {extraction_path}")
    if not isinstance(source_landscape_id, str) or not source_landscape_id:
        raise CompilationError(f"Source extraction has no sourceLandscapeId: {extraction_path}")
    if raw_binding.get("mappingCollectionId") != review.get("reviewId"):
        raise CompilationError(f"Mapping collection ID mismatch in {review_path}")
    if review.get("sourceExtractionPath") != raw_binding.get("sourceExtractionPath"):
        raise CompilationError(f"Review/source-extraction binding mismatch in {review_path}")
    if review.get("sourceLandscapeId") != source_landscape_id:
        raise CompilationError(f"Review/source landscape mismatch in {review_path}")
    if review.get("targetLandscapeId") != landscape_id:
        raise CompilationError(f"Review target landscape mismatch in {review_path}")
    if (
        legacy.get("sourceLandscapeId") != source_landscape_id
        or legacy.get("targetLandscapeId") != landscape_id
    ):
        raise CompilationError(f"Legacy mapping identity mismatch in {legacy_path}")
    legacy_source_membership = legacy_membership_by_landscape.get(source_landscape_id)
    if legacy_source_membership is None:
        raise CompilationError(
            f"Legacy source landscape has no bound membership: {source_landscape_id}"
        )
    jurisdiction = extraction.get("jurisdiction")
    subject = extraction.get("subject")
    stage = extraction.get("stage")
    if (
        not isinstance(jurisdiction, str)
        or not isinstance(subject, str)
        or stage not in {"SekI", "SekII", "SekI+SekII"}
    ):
        raise CompilationError(f"Incomplete source collection identity in {extraction_path}")

    passages_raw = extraction.get("passages")
    passages = passages_raw if isinstance(passages_raw, list) else []
    passage_by_id: dict[str, Mapping[str, Any]] = {}
    for passage in passages:
        if not isinstance(passage, dict) or not isinstance(passage.get("id"), str):
            raise CompilationError(f"Malformed source passage in {extraction_path}")
        if passage["id"] in passage_by_id:
            raise CompilationError(f"Duplicate source passage {passage['id']}")
        passage_by_id[passage["id"]] = passage

    document_by_key: dict[str, dict[str, Any]] = {}
    compiled_documents: list[dict[str, Any]] = []
    duration_models: set[str] = set()
    for document in source_documents_from_extraction(extraction):
        source_key = document.get("key")
        title = document.get("title")
        role = document.get("role")
        if not all(
            isinstance(value, str) and value.strip() for value in (source_key, title, role)
        ):
            raise CompilationError(f"Incomplete official source document in {extraction_path}")
        source_key = source_key.strip()
        title = title.strip()
        role = role.strip()
        semantic_type = source_document_semantics.get(role)
        if semantic_type not in {"curriculum", "supplemental-source"}:
            raise CompilationError(
                f"Official source document role is not classified by the trusted profile: {role}"
            )
        if document.get("official") is not True:
            raise CompilationError(f"Source document {source_key} is not explicitly official")
        if source_key in document_by_key:
            raise CompilationError(f"Duplicate source document key {source_key} in {collection_id}")
        document_id = f"{collection_id}:{source_key}"
        compiled_document = {
            "sourceDocumentId": document_id,
            "sourceKey": source_key,
            "title": title,
            "role": role,
            "semanticType": semantic_type,
            "official": True,
            "url": assert_http_url(document.get("url"), f"source document {source_key}"),
        }
        landing_url = document.get("landingUrl")
        if landing_url is not None:
            compiled_document["landingUrl"] = assert_http_url(
                landing_url, f"source document {source_key} landing page"
            )
        duration_model = document.get("durationModel")
        if "durationModel" in document and (
            not isinstance(duration_model, str)
            or not duration_model
            or duration_model != duration_model.strip()
        ):
            raise CompilationError(
                f"Malformed source-document durationModel for {source_key}"
            )
        if isinstance(duration_model, str):
            compiled_document["durationModel"] = duration_model
            duration_models.add(duration_model)
        document_by_key[source_key] = compiled_document
        compiled_documents.append(compiled_document)
    compiled_documents.sort(key=lambda item: item["sourceDocumentId"])
    if "durationModels" not in extraction:
        if duration_models:
            raise CompilationError(
                f"Source collection {collection_id} derives duration models from documents "
                "but has no top-level durationModels evidence"
            )
    else:
        authored_duration_models = extraction["durationModels"]
        if (
            not isinstance(authored_duration_models, list)
            or not authored_duration_models
            or any(
                not isinstance(duration_model, str)
                or not duration_model
                or duration_model != duration_model.strip()
                for duration_model in authored_duration_models
            )
            or len(authored_duration_models) != len(set(authored_duration_models))
        ):
            raise CompilationError(
                f"Malformed authored durationModels in source collection {collection_id}"
            )
        if set(authored_duration_models) != duration_models:
            raise CompilationError(
                "Authored source-collection durationModels do not exactly match the "
                f"official source documents in {collection_id}"
            )

    source_goals_raw = extraction.get("sourceGoals")
    if not isinstance(source_goals_raw, list) or not source_goals_raw:
        raise CompilationError(f"Source extraction has no source goals: {extraction_path}")
    compiled_source_goals: list[dict[str, Any]] = []
    lineage_groups: defaultdict[str, list[tuple[str, int, int]]] = defaultdict(list)
    source_goal_ids: set[str] = set()
    for source_goal in source_goals_raw:
        if not isinstance(source_goal, dict):
            raise CompilationError(f"Malformed source goal in {extraction_path}")
        source_goal_id = source_goal.get("id")
        passage_id = source_goal.get("passageId")
        if not isinstance(source_goal_id, str) or not isinstance(passage_id, str):
            raise CompilationError(f"Source goal identity is missing in {extraction_path}")
        if source_goal_id in source_goal_ids:
            raise CompilationError(f"Duplicate source goal {source_goal_id} in {collection_id}")
        source_goal_ids.add(source_goal_id)
        passage = passage_by_id.get(passage_id)
        document_key = source_document_key_from_goal(source_goal, passage)
        if document_key is None and len(document_by_key) == 1:
            document_key = next(iter(document_by_key))
        document = document_by_key.get(str(document_key))
        if document is None:
            raise CompilationError(
                f"Source goal {source_goal_id} does not resolve an official source document"
            )
        topic_code = optional_nonblank(source_goal.get("topicCode")) or (
            optional_nonblank(passage.get("topicCode")) if passage is not None else None
        )
        source_ref = optional_nonblank(source_goal.get("sourceRef")) or (
            optional_nonblank(passage.get("sourceRef")) if passage is not None else None
        )
        source_text = optional_nonblank(source_goal.get("sourceText"))
        source_span = optional_nonblank(source_goal.get("sourceSpan"))
        title_value = optional_nonblank(source_goal.get("title"))
        description_value = optional_nonblank(source_goal.get("description"))
        if None in {topic_code, source_ref, source_text, source_span, title_value, description_value}:
            raise CompilationError(f"Incomplete source-goal evidence for {source_goal_id}")
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
            "sourceTextSha256": "sha256:" + sha256_bytes(source_text.encode("utf-8")),
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
            if not (
                isinstance(lineage_values[0], str)
                and bool(lineage_values[0])
                and lineage_values[0] == lineage_values[0].strip()
                and type(lineage_values[1]) is int
                and type(lineage_values[2]) is int
                and lineage_values[1] >= 1
                and lineage_values[2] >= 1
            ):
                raise CompilationError(f"Incomplete split lineage for {source_goal_id}")
            compiled_source_goal["lineage"] = dict(zip(lineage_keys, lineage_values))
            lineage_groups[lineage_values[0]].append(
                (source_goal_id, lineage_values[1], lineage_values[2])
            )
        compiled_source_goals.append(compiled_source_goal)
    compiled_source_goals.sort(key=lambda item: item["sourceGoalId"])

    for split_from_source_goal_id, parts in sorted(lineage_groups.items()):
        part_counts = {part_count for _goal_id, _index, part_count in parts}
        if len(part_counts) != 1:
            raise CompilationError(
                "Split lineage has inconsistent splitPartCount in "
                f"{collection_id}:{split_from_source_goal_id}"
            )
        part_count = next(iter(part_counts))
        indices = [index for _goal_id, index, _part_count in parts]
        if len(indices) != len(set(indices)):
            raise CompilationError(
                "Split lineage has duplicate splitIndex values in "
                f"{collection_id}:{split_from_source_goal_id}"
            )
        if sorted(indices) != list(range(1, part_count + 1)):
            raise CompilationError(
                "Split lineage does not exactly cover indices 1..splitPartCount in "
                f"{collection_id}:{split_from_source_goal_id}"
            )

    diagnostics: Counter[str] = Counter()
    raw_mappings = review.get("mappings")
    if not isinstance(raw_mappings, list):
        raise CompilationError(f"Review has no redundant mappings array: {review_path}")
    raw_pairs: dict[tuple[str, str], str] = {}
    for mapping in raw_mappings:
        if not isinstance(mapping, dict):
            raise CompilationError(f"Malformed redundant mapping in {review_path}")
        source_goal_id = mapping.get("legacyGoalId")
        target_goal_id = mapping.get("canonicalGoalId")
        match_type = mapping.get("matchType")
        if (
            not isinstance(source_goal_id, str)
            or not isinstance(target_goal_id, str)
            or match_type not in {"exact", "partial"}
        ):
            raise CompilationError(f"Malformed redundant mapping row in {review_path}")
        pair = (source_goal_id, target_goal_id)
        if pair in raw_pairs:
            raise CompilationError(f"Duplicate redundant mapping edge {pair}")
        raw_pairs[pair] = match_type

    decisions = review.get("decisions")
    if not isinstance(decisions, list) or not decisions:
        raise CompilationError(f"Mapping review has no authoritative decisions: {review_path}")
    decision_edges: dict[tuple[str, str], str] = {}
    explicit_match_type_pairs: set[tuple[str, str]] = set()
    unresolved_match_type_pairs: list[tuple[str, str]] = []
    for decision in decisions:
        if not isinstance(decision, dict) or decision.get("decision") != "mapped":
            raise CompilationError(f"Unsupported mapping decision in {review_path}")
        source_goal_id = decision.get("sourceGoalId")
        targets = decision.get("canonicalGoalIds")
        if (
            not isinstance(source_goal_id, str)
            or source_goal_id not in source_goal_ids
            or not isinstance(targets, list)
            or not targets
        ):
            raise CompilationError(f"Malformed authoritative decision in {review_path}")
        has_explicit_match_type = "matchType" in decision
        explicit_match_type = decision.get("matchType")
        if has_explicit_match_type and explicit_match_type not in {"exact", "partial"}:
            raise CompilationError(f"Malformed authoritative decision in {review_path}")
        for target in targets:
            if not isinstance(target, str) or target not in canonical_goal_ids:
                raise CompilationError(f"Unknown canonical mapping target {target} in {review_path}")
            pair = (source_goal_id, target)
            if pair in decision_edges:
                raise CompilationError(f"Duplicate authoritative mapping edge {pair} in {review_path}")
            if has_explicit_match_type:
                match_type = str(explicit_match_type)
                explicit_match_type_pairs.add(pair)
            elif pair in raw_pairs:
                match_type = raw_pairs[pair]
                diagnostics["decisionMatchTypesDerivedFromRawMappings"] += 1
            else:
                unresolved_match_type_pairs.append(pair)
                continue
            decision_edges[pair] = match_type
    diagnostics["unresolvedDecisionMatchTypes"] += len(unresolved_match_type_pairs)
    if unresolved_match_type_pairs:
        raise CompilationError(
            "Authoritative mapping edges have neither an explicit decision matchType "
            "nor an edge-specific reviewed mappings fallback: "
            f"{unresolved_match_type_pairs[:3]}"
        )
    if {source for source, _ in decision_edges} != source_goal_ids:
        raise CompilationError(f"Authoritative decisions do not cover every source goal in {review_path}")

    unsupported_raw_pairs = set(raw_pairs) - set(decision_edges)
    if unsupported_raw_pairs:
        raise CompilationError(
            "Redundant mapping is not decision-backed: "
            f"{sorted(unsupported_raw_pairs)[:3]}"
        )
    diagnostics["rawMappingEdges"] += len(raw_pairs)
    diagnostics["decisionEdgesMissingFromRawMappings"] += len(set(decision_edges) - set(raw_pairs))
    diagnostics["decisionRawMatchTypeConflicts"] += sum(
        pair in explicit_match_type_pairs
        and pair in raw_pairs
        and raw_pairs[pair] != match_type
        for pair, match_type in decision_edges.items()
    )

    legacy_rows = legacy.get("mappings")
    if not isinstance(legacy_rows, list):
        raise CompilationError(f"Legacy mapping has no mappings array: {legacy_path}")
    diagnostics["legacyPlainMappingRows"] += len(legacy_rows)
    for mapping in legacy_rows:
        if not isinstance(mapping, dict):
            raise CompilationError(f"Malformed legacy mapping in {legacy_path}")
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
        for (source_goal_id, canonical_goal_id), match_type in sorted(decision_edges.items())
    ]
    mapping_collection = {
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
    source_goal_collection = {
        "sourceCollectionId": collection_id,
        "sourceLandscapeId": source_landscape_id,
        "sourceGoalCount": len(compiled_source_goals),
        "sourceGoals": compiled_source_goals,
    }
    return (
        mapping_collection,
        source_collection,
        source_goal_collection,
        diagnostics,
        input_files,
    )


def compile_release_quality_evidence(
    publication_profile: Mapping[str, Any],
    goal_by_id: Mapping[str, Mapping[str, Any]],
    compiled_decks: Sequence[tuple[str, Mapping[str, Any]]],
    resources: Sequence[Mapping[str, Any]],
    classifier: PublicationInputClassifier,
    schema_id: str,
) -> tuple[dict[str, Any], dict[str, int], list[dict[str, Any]]]:
    landscape_id = str(publication_profile["targetLandscapeId"])
    quality_sources = publication_profile.get("qualitySources")
    if not isinstance(quality_sources, dict):
        raise CompilationError("Publication quality-source bindings are missing")
    input_files: list[dict[str, Any]] = []

    atomic_binding = quality_sources["semanticAtomicity"]
    atomic_config_path = resolve_repo_path(str(atomic_binding["configPath"]))
    atomic_review_path = resolve_repo_path(str(atomic_binding["reviewPath"]))
    atomic_config = load_json(atomic_config_path)
    atomic_records = load_json_lines(atomic_review_path)
    if not isinstance(atomic_config, dict):
        raise CompilationError("Semantic-atomicity config must be an object")
    classifier.observe("semantic-atomicity-config", atomic_config)
    for record in atomic_records:
        classifier.observe("semantic-atomicity-review", record)
    input_files.extend(
        [
            publication_input_record(
                "semantic-atomicity-config", atomic_config_path, "authoring-only-selector"
            ),
            publication_input_record(
                "semantic-atomicity-review", atomic_review_path, "publication-evidence"
            ),
        ]
    )
    if (
        atomic_config.get("reviewId") != atomic_binding.get("reviewId")
        or atomic_config.get("ruleVersion") != atomic_binding.get("ruleVersion")
        or atomic_config.get("landscapeId") != landscape_id
        or atomic_config.get("reviewPath") != atomic_binding.get("reviewPath")
    ):
        raise CompilationError("Semantic-atomicity quality binding mismatch")
    atomic_scope = {
        goal_id
        for goal_id in configured_goal_scope(atomic_config, goal_by_id)
        if is_review_relevant_leaf(goal_by_id[goal_id])
    }
    atomic_by_goal: dict[str, Mapping[str, Any]] = {}
    atomic_decisions: list[dict[str, Any]] = []
    for record in atomic_records:
        if not isinstance(record, dict) or not isinstance(record.get("goalId"), str):
            raise CompilationError("Malformed semantic-atomicity decision")
        goal_id = record["goalId"]
        if goal_id in atomic_by_goal:
            raise CompilationError(f"Duplicate semantic-atomicity decision for {goal_id}")
        atomic_by_goal[goal_id] = record
        if (
            record.get("reviewId") != atomic_binding["reviewId"]
            or record.get("ruleVersion") != atomic_binding["ruleVersion"]
            or record.get("landscapeId") != landscape_id
            or goal_id not in atomic_scope
        ):
            raise CompilationError(f"Semantic-atomicity decision binding mismatch for {goal_id}")
        expected_fingerprint = goal_review_fingerprint(
            goal_by_id[goal_id], str(atomic_binding["ruleVersion"])
        )
        if record.get("fingerprint") != expected_fingerprint:
            raise CompilationError(f"Stale semantic-atomicity fingerprint for {goal_id}")
        status = record.get("status")
        semantic_atomic = record.get("semanticAtomic")
        expected_semantic_atomic = {
            "atomic": True,
            "non_atomic": False,
            "needs_developer_review": None,
        }.get(str(status), "unsupported")
        if semantic_atomic != expected_semantic_atomic:
            raise CompilationError(f"Invalid semantic-atomicity result for {goal_id}")
        atomic_decisions.append(
            {
                "goalId": goal_id,
                "goalFingerprint": expected_fingerprint,
                "status": status,
                "semanticAtomic": semantic_atomic,
            }
        )
    if set(atomic_by_goal) != atomic_scope:
        raise CompilationError("Semantic-atomicity ledger does not cover the exact configured scope")
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
    memory_config_path = resolve_repo_path(str(memory_binding["configPath"]))
    memory_review_path = resolve_repo_path(str(memory_binding["reviewPath"]))
    card_review_path = resolve_repo_path(str(memory_binding["cardReviewPath"]))
    memory_config = load_json(memory_config_path)
    memory_records = load_json_lines(memory_review_path)
    card_records = load_json_lines(card_review_path)
    if not isinstance(memory_config, dict):
        raise CompilationError("Memory-card config must be an object")
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
                "memory-card-review", card_review_path, "publication-evidence-projected"
            ),
        ]
    )
    if (
        memory_config.get("reviewId") != memory_binding.get("reviewId")
        or memory_config.get("ruleVersion") != memory_binding.get("ruleVersion")
        or memory_config.get("landscapeId") != landscape_id
        or memory_config.get("reviewPath") != memory_binding.get("reviewPath")
        or memory_config.get("cardReviewPath") != memory_binding.get("cardReviewPath")
    ):
        raise CompilationError("Memory-card quality binding mismatch")
    memory_scope = {
        goal_id
        for goal_id in configured_goal_scope(memory_config, goal_by_id)
        if is_review_relevant_leaf(goal_by_id[goal_id])
    }
    memory_by_goal: dict[str, Mapping[str, Any]] = {}
    memory_decisions: list[dict[str, Any]] = []
    for record in memory_records:
        if not isinstance(record, dict) or not isinstance(record.get("goalId"), str):
            raise CompilationError("Malformed memory-goal decision")
        goal_id = record["goalId"]
        if goal_id in memory_by_goal:
            raise CompilationError(f"Duplicate memory-goal decision for {goal_id}")
        memory_by_goal[goal_id] = record
        if (
            record.get("reviewId") != memory_binding["reviewId"]
            or record.get("ruleVersion") != memory_binding["ruleVersion"]
            or record.get("landscapeId") != landscape_id
            or goal_id not in memory_scope
        ):
            raise CompilationError(f"Memory-goal decision binding mismatch for {goal_id}")
        expected_fingerprint = goal_review_fingerprint(
            goal_by_id[goal_id], str(memory_binding["ruleVersion"])
        )
        if record.get("fingerprint") != expected_fingerprint:
            raise CompilationError(f"Stale memory-goal fingerprint for {goal_id}")
        status = record.get("status")
        memory_useful = record.get("memoryUseful")
        expected_memory_useful = {
            "no_memory_needed": False,
            "memory_required": True,
            "needs_developer_review": None,
        }.get(str(status), "unsupported")
        if memory_useful != expected_memory_useful:
            raise CompilationError(f"Invalid memory-goal result for {goal_id}")
        decision: dict[str, Any] = {
            "goalId": goal_id,
            "goalFingerprint": expected_fingerprint,
            "status": status,
            "memoryUseful": memory_useful,
        }
        if status == "memory_required":
            memory_goal_ids = record.get("memoryGoalIds")
            deck_ids = record.get("deckIds")
            if (
                not isinstance(memory_goal_ids, list)
                or not memory_goal_ids
                or not isinstance(deck_ids, list)
                or not deck_ids
                or any(
                    not isinstance(memory_goal_id, str)
                    or memory_goal_id not in goal_by_id
                    or not is_memory_goal(goal_by_id[memory_goal_id])
                    for memory_goal_id in memory_goal_ids
                )
            ):
                raise CompilationError(f"Invalid memory support references for {goal_id}")
            decision["memoryGoalIds"] = sorted(set(memory_goal_ids))
            decision["deckIds"] = sorted(set(deck_ids))
        memory_decisions.append(decision)
    if set(memory_by_goal) != memory_scope:
        raise CompilationError("Memory-goal ledger does not cover the exact configured scope")
    memory_decisions.sort(key=lambda item: item["goalId"])

    primary_cards: dict[tuple[str, str], dict[str, Any]] = {}
    for _, deck in compiled_decks:
        if deck.get("language") != "de-DE":
            continue
        deck_id = deck.get("deckId")
        cards = deck.get("cards")
        if not isinstance(deck_id, str) or not isinstance(cards, list):
            raise CompilationError("Malformed primary memory deck")
        for card in cards:
            if not isinstance(card, dict) or not isinstance(card.get("id"), str):
                raise CompilationError(f"Malformed card in primary deck {deck_id}")
            key = (deck_id, card["id"])
            if key in primary_cards:
                raise CompilationError(f"Duplicate primary card identity {key}")
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
        if not isinstance(record, dict):
            raise CompilationError("Malformed memory-card review decision")
        key = (record.get("deckId"), record.get("cardId"))
        if not all(isinstance(value, str) for value in key):
            raise CompilationError("Memory-card review identity is missing")
        typed_key = (str(key[0]), str(key[1]))
        if typed_key in card_record_by_key:
            raise CompilationError(f"Duplicate memory-card review decision {typed_key}")
        card_record_by_key[typed_key] = record
        if record.get("status") == "remove":
            removed_card_count += 1
    active_card_decisions: list[dict[str, Any]] = []
    for key, card in primary_cards.items():
        record = card_record_by_key.get(key)
        if record is None:
            raise CompilationError(f"Missing review for active primary card {key}")
        expected_fingerprint = card_review_fingerprint(
            card, str(memory_binding["ruleVersion"])
        )
        origin_goal_ids = record.get("originGoalIds")
        if (
            record.get("reviewId") != memory_binding["reviewId"]
            or record.get("ruleVersion") != memory_binding["ruleVersion"]
            or record.get("landscapeId") != landscape_id
            or record.get("fingerprint") != expected_fingerprint
            or record.get("status") != "kept"
            or record.get("necessary") is not True
            or not isinstance(origin_goal_ids, list)
            or not origin_goal_ids
        ):
            raise CompilationError(f"Invalid or stale review for active primary card {key}")
        for origin_goal_id in origin_goal_ids:
            goal_record = memory_by_goal.get(str(origin_goal_id))
            if (
                goal_record is None
                or goal_record.get("status") != "memory_required"
                or key[0] not in goal_record.get("deckIds", [])
            ):
                raise CompilationError(f"Untraced memory-card origin {origin_goal_id} for {key}")
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
    inactive_card_records = {
        key: record
        for key, record in card_record_by_key.items()
        if key not in primary_cards
    }
    if any(record.get("status") != "remove" for record in inactive_card_records.values()):
        raise CompilationError(
            "Inactive memory-card review records must be authoring-only removals"
        )
    active_card_decisions.sort(key=lambda item: (item["deckId"], item["cardId"]))
    required_goal_ids = {
        item["goalId"]
        for item in memory_decisions
        if item["status"] == "memory_required"
    }
    active_origin_goal_ids = {
        goal_id
        for item in active_card_decisions
        for goal_id in item["originGoalIds"]
    }
    if active_origin_goal_ids != required_goal_ids:
        raise CompilationError(
            "Active memory-card origins do not exactly cover memory-required goals"
        )
    required_deck_ids = {
        deck_id
        for item in memory_decisions
        if item["status"] == "memory_required"
        for deck_id in item["deckIds"]
    }
    primary_deck_ids = {deck_id for deck_id, _card_id in primary_cards}
    if required_deck_ids != primary_deck_ids:
        raise CompilationError(
            "Memory-required deck references do not match the active primary decks"
        )
    memory_statuses = {item["status"] for item in memory_decisions}
    memory_lane_status = (
        "incomplete" if "needs_developer_review" in memory_statuses else "passed"
    )

    visual_binding = quality_sources["goalVisualizations"]
    visual_qa_path = resolve_repo_path(str(visual_binding["qaPath"]))
    visual_qa = load_json(visual_qa_path)
    if not isinstance(visual_qa, dict):
        raise CompilationError("Goal-visualization QA must be an object")
    classifier.observe("goal-visualization-qa", visual_qa)
    input_files.append(
        publication_input_record(
            "goal-visualization-qa", visual_qa_path, "publication-evidence-projected"
        )
    )
    visual_records = visual_qa.get("records")
    if (
        visual_qa.get("landscapeId") not in {None, landscape_id}
        or not isinstance(visual_records, list)
        or not visual_records
    ):
        raise CompilationError("Goal-visualization QA binding is invalid")
    visual_resources: dict[str, Mapping[str, Any]] = {}
    for resource in resources:
        if resource.get("resourceKind") != "goal-visualization":
            continue
        goal_id = resource.get("ownerGoalId")
        if not isinstance(goal_id, str) or goal_id in visual_resources:
            raise CompilationError(f"Goal visualization ownership is not one-to-one: {goal_id}")
        visual_resources[goal_id] = resource
    missing_visual_goal_ids = sorted(atomic_scope - set(visual_resources))
    visual_decisions: list[dict[str, Any]] = []
    visual_goal_ids: set[str] = set()
    for record in visual_records:
        if not isinstance(record, dict) or not isinstance(record.get("goalId"), str):
            raise CompilationError("Malformed goal-visualization QA decision")
        goal_id = record["goalId"]
        if goal_id in visual_goal_ids:
            raise CompilationError(f"Duplicate goal-visualization QA decision for {goal_id}")
        visual_goal_ids.add(goal_id)
        resource = visual_resources.get(goal_id)
        if resource is None:
            raise CompilationError(f"Goal-visualization QA has no active resource for {goal_id}")
        expected_digest = "sha256:" + str(resource["sha256"])
        if record.get("assetSha256") != expected_digest:
            raise CompilationError(f"Stale goal-visualization QA asset hash for {goal_id}")
        human_approved = record.get("humanApproved")
        human_issue = record.get("humanIssueIdentified")
        if human_approved not in {"yes", "no"} or human_issue not in {"yes", "no"}:
            raise CompilationError(f"Invalid human visualization decision for {goal_id}")
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
    if visual_goal_ids != set(visual_resources):
        raise CompilationError("Goal-visualization QA does not cover the exact active resource set")
    visual_decisions.sort(key=lambda item: item["goalId"])
    approved_count = sum(item["status"] == "human-approved" for item in visual_decisions)
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
    quality_value = {
        "$schema": schema_id,
        "qualityEvidenceFormatVersion": "1.0",
        "landscapeId": landscape_id,
        "publicationStatus": publication_status,
        "qualityDecisionCount": (
            len(atomic_decisions)
            + len(memory_decisions)
            + len(active_card_decisions)
            + len(visual_decisions)
        ),
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
    quality_counts = {
        "semanticAtomicityDecisions": len(atomic_decisions),
        "memoryGoalDecisions": len(memory_decisions),
        "noMemoryNeeded": sum(
            item["status"] == "no_memory_needed" for item in memory_decisions
        ),
        "memoryRequired": sum(item["status"] == "memory_required" for item in memory_decisions),
        "cardLedgerDecisions": len(card_records),
        "activeKeptCardDecisions": len(active_card_decisions),
        "authoringOnlyRemovedCardDecisions": removed_card_count,
        "visualizationDecisions": len(visual_decisions),
        "visualizationScopeGoals": len(atomic_scope),
        "missingGoalVisualizations": len(missing_visual_goal_ids),
        "humanApprovedVisualizations": approved_count,
        "openVisualizations": open_count,
        "publishedQualityDecisions": quality_value["qualityDecisionCount"],
    }
    return quality_value, quality_counts, input_files


def compile_publication_evidence(
    publication_profile: Mapping[str, Any],
    compiled_landscape: Mapping[str, Any],
    compiled_decks: Sequence[tuple[str, Mapping[str, Any]]],
    resources: Sequence[Mapping[str, Any]],
) -> tuple[list[tuple[str, str, str, dict[str, Any]]], dict[str, Any], dict[str, int]]:
    landscape_id = str(compiled_landscape["landscapeId"])
    if publication_profile.get("targetLandscapeId") != landscape_id:
        raise CompilationError("Publication-evidence profile targets another landscape")
    goals = compiled_landscape.get("goals")
    if not isinstance(goals, list):
        raise CompilationError("Compiled landscape goals are missing for publication evidence")
    canonical_goal_ids = {
        goal["id"]
        for goal in goals
        if isinstance(goal, dict) and isinstance(goal.get("id"), str)
    }
    goal_by_id = {
        goal["id"]: goal
        for goal in goals
        if isinstance(goal, dict) and isinstance(goal.get("id"), str)
    }
    if len(canonical_goal_ids) != len(goals):
        raise CompilationError("Canonical goals are malformed or duplicated")

    classifier = PublicationInputClassifier(publication_profile)
    raw_source_document_semantics = publication_profile.get("sourceDocumentSemantics")
    if (
        not isinstance(raw_source_document_semantics, dict)
        or raw_source_document_semantics.get("unknownRolePolicy") != "reject"
        or not isinstance(raw_source_document_semantics.get("roles"), dict)
        or not raw_source_document_semantics["roles"]
    ):
        raise CompilationError("Trusted source-document role semantics are missing")
    source_document_semantics = raw_source_document_semantics["roles"]
    if any(
        not isinstance(role, str)
        or not role
        or semantic_type not in {"curriculum", "supplemental-source"}
        for role, semantic_type in source_document_semantics.items()
    ):
        raise CompilationError("Trusted source-document role semantics are malformed")
    legacy_diagnostics = publication_profile.get("legacyDiagnostics")
    if not isinstance(legacy_diagnostics, dict):
        raise CompilationError("Legacy diagnostic binding is missing")
    legacy_membership_path = resolve_repo_path(
        str(legacy_diagnostics["sourceGoalMembershipRegistryPath"])
    )
    legacy_membership_value = load_json(legacy_membership_path)
    if not isinstance(legacy_membership_value, dict):
        raise CompilationError("Legacy source-goal membership registry must be an object")
    classifier.observe("legacy-membership-registry", legacy_membership_value)
    raw_legacy_memberships = legacy_membership_value.get("landscapes")
    if not isinstance(raw_legacy_memberships, list) or not raw_legacy_memberships:
        raise CompilationError("Legacy source-goal memberships are missing")
    legacy_membership_by_landscape: dict[str, set[str]] = {}
    for membership in raw_legacy_memberships:
        if not isinstance(membership, dict):
            raise CompilationError("Malformed legacy source-goal membership")
        source_landscape_id = membership.get("landscapeId")
        goal_ids = membership.get("goalIds")
        if (
            not isinstance(source_landscape_id, str)
            or not isinstance(goal_ids, list)
            or any(not isinstance(goal_id, str) for goal_id in goal_ids)
            or len(goal_ids) != len(set(goal_ids))
            or source_landscape_id in legacy_membership_by_landscape
        ):
            raise CompilationError("Malformed or duplicate legacy source-goal membership")
        legacy_membership_by_landscape[source_landscape_id] = set(goal_ids)
    raw_bindings = publication_profile.get("mappingCollections")
    if not isinstance(raw_bindings, list) or not raw_bindings:
        raise CompilationError("Publication-evidence mapping bindings are missing")
    mapping_collections: list[dict[str, Any]] = []
    source_collections: list[dict[str, Any]] = []
    source_goal_collections: list[dict[str, Any]] = []
    input_files: list[dict[str, Any]] = [
        publication_input_record(
            "legacy-membership-registry",
            legacy_membership_path,
            "authoring-only-diagnostic",
        )
    ]
    diagnostics: Counter[str] = Counter()
    for raw_binding in raw_bindings:
        if not isinstance(raw_binding, dict):
            raise CompilationError("Malformed publication mapping binding")
        mapping, source, source_goals, lane_diagnostics, lane_inputs = (
            compile_mapping_source_lane(
                raw_binding,
                landscape_id,
                canonical_goal_ids,
                legacy_membership_by_landscape,
                classifier,
                source_document_semantics,
            )
        )
        mapping_collections.append(mapping)
        source_collections.append(source)
        source_goal_collections.append(source_goals)
        diagnostics.update(lane_diagnostics)
        input_files.extend(lane_inputs)
    mapping_collections.sort(key=lambda item: item["mappingCollectionId"])
    source_collections.sort(key=lambda item: item["sourceCollectionId"])
    source_goal_collections.sort(key=lambda item: item["sourceCollectionId"])
    for field, values in (
        ("mappingCollectionId", mapping_collections),
        ("sourceCollectionId", source_collections),
        ("sourceCollectionId", source_goal_collections),
    ):
        identities = [item[field] for item in values]
        if len(identities) != len(set(identities)):
            raise CompilationError(f"Duplicate publication collection identity in {field}")
    document_ids = [
        document["sourceDocumentId"]
        for collection in source_collections
        for document in collection["documents"]
    ]
    if len(document_ids) != len(set(document_ids)):
        raise CompilationError("Duplicate official source document identity")
    observed_source_document_roles = {
        document["role"]
        for collection in source_collections
        for document in collection["documents"]
    }
    if observed_source_document_roles != set(source_document_semantics):
        raise CompilationError(
            "Trusted source-document role semantics do not exactly cover the bound inputs: "
            f"missing={sorted(observed_source_document_roles - set(source_document_semantics))}, "
            f"unused={sorted(set(source_document_semantics) - observed_source_document_roles)}"
        )
    source_goal_ids = [
        goal["sourceGoalId"]
        for collection in source_goal_collections
        for goal in collection["sourceGoals"]
    ]
    if len(source_goal_ids) != len(set(source_goal_ids)):
        raise CompilationError("Source goal IDs must be package-wide unique")
    source_document_references = {
        goal["sourceDocumentId"]
        for collection in source_goal_collections
        for goal in collection["sourceGoals"]
    }
    if not source_document_references <= set(document_ids):
        raise CompilationError("Source-goal reference index has dangling source documents")

    outputs = publication_profile["outputArtifacts"]
    mappings_value = {
        "$schema": outputs["mappings"]["schemaId"],
        "mappingFormatVersion": "1.0",
        "targetLandscapeId": landscape_id,
        "mappingCollectionCount": len(mapping_collections),
        "decisionCount": sum(item["inputDecisionCount"] for item in mapping_collections),
        "mappingEdgeCount": sum(item["mappingEdgeCount"] for item in mapping_collections),
        "collections": mapping_collections,
    }
    source_index_value = {
        "$schema": outputs["sourceIndex"]["schemaId"],
        "sourceIndexFormatVersion": "1.0",
        "targetLandscapeId": landscape_id,
        "sourceCollectionCount": len(source_collections),
        "sourceDocumentCount": len(document_ids),
        "collections": source_collections,
    }
    source_goals_value = {
        "$schema": outputs["sourceGoalReferences"]["schemaId"],
        "sourceGoalReferenceFormatVersion": "1.0",
        "targetLandscapeId": landscape_id,
        "sourceCollectionCount": len(source_goal_collections),
        "sourceGoalCount": len(source_goal_ids),
        "collections": source_goal_collections,
    }
    quality_value, quality_counts, quality_inputs = compile_release_quality_evidence(
        publication_profile,
        goal_by_id,
        compiled_decks,
        resources,
        classifier,
        outputs["qualityEvidence"]["schemaId"],
    )
    input_files.extend(quality_inputs)
    classifier.assert_complete()

    jurisdictions = {item["jurisdiction"] for item in source_collections}
    source_document_semantic_counts = Counter(
        document["semanticType"]
        for collection in source_collections
        for document in collection["documents"]
    )
    counts = {
        "mappingCollections": len(mapping_collections),
        "mappingInputDecisions": mappings_value["decisionCount"],
        "mappingEdges": mappings_value["mappingEdgeCount"],
        "sourceCollections": len(source_collections),
        "sourceDocuments": len(document_ids),
        "curriculumSourceDocuments": source_document_semantic_counts["curriculum"],
        "supplementalSourceDocuments": source_document_semantic_counts[
            "supplemental-source"
        ],
        "sourceGoals": len(source_goal_ids),
        "sourceJurisdictions": len(jurisdictions),
        "decisionMatchTypesDerivedFromRawMappings": diagnostics[
            "decisionMatchTypesDerivedFromRawMappings"
        ],
        "unresolvedDecisionMatchTypes": diagnostics[
            "unresolvedDecisionMatchTypes"
        ],
        **diagnostics,
        **quality_counts,
    }
    expected = publication_profile["expectedCounts"]
    expected_flat = {
        "mappingCollections": expected["mappings"]["collections"],
        "mappingInputDecisions": expected["mappings"]["inputDecisions"],
        "mappingEdges": expected["mappings"]["decisionEdges"],
        "rawMappingEdges": expected["mappings"]["rawMappingEdges"],
        "decisionEdgesMissingFromRawMappings": expected["mappings"][
            "decisionEdgesMissingFromRawMappings"
        ],
        "decisionRawMatchTypeConflicts": expected["mappings"][
            "decisionRawMatchTypeConflicts"
        ],
        "decisionMatchTypesDerivedFromRawMappings": expected["mappings"][
            "decisionMatchTypesDerivedFromRawMappings"
        ],
        "unresolvedDecisionMatchTypes": expected["mappings"][
            "unresolvedDecisionMatchTypes"
        ],
        "legacyPlainMappingRows": expected["mappings"]["legacyPlainMappingRows"],
        "legacyDanglingTargets": expected["mappings"]["legacyDanglingTargets"],
        "legacySourceIdsOutsideMembership": expected["mappings"][
            "legacySourceIdsOutsideMembership"
        ],
        "sourceCollections": expected["sources"]["collections"],
        "sourceDocuments": expected["sources"]["documents"],
        "curriculumSourceDocuments": expected["sources"]["curriculumDocuments"],
        "supplementalSourceDocuments": expected["sources"]["supplementalDocuments"],
        "sourceGoals": expected["sources"]["sourceGoals"],
        "sourceJurisdictions": expected["sources"]["jurisdictions"],
        **expected["quality"],
    }
    differences = {
        key: {"expected": expected_flat.get(key), "actual": counts.get(key)}
        for key in sorted(expected_flat)
        if expected_flat.get(key) != counts.get(key)
    }
    if differences:
        raise CompilationError(f"Publication-evidence conformance counts changed: {differences}")

    logical_documents = [
        (
            outputs["mappings"]["artifactRole"],
            f"{landscape_id}:source-mappings",
            outputs["mappings"]["outputPath"],
            mappings_value,
        ),
        (
            outputs["sourceIndex"]["artifactRole"],
            f"{landscape_id}:official-sources",
            outputs["sourceIndex"]["outputPath"],
            source_index_value,
        ),
        (
            outputs["sourceGoalReferences"]["artifactRole"],
            f"{landscape_id}:source-goal-references",
            outputs["sourceGoalReferences"]["outputPath"],
            source_goals_value,
        ),
        (
            outputs["qualityEvidence"]["artifactRole"],
            f"{landscape_id}:release-quality",
            outputs["qualityEvidence"]["outputPath"],
            quality_value,
        ),
    ]
    build_inputs = {
        "profileId": publication_profile["profileId"],
        "profileVersion": publication_profile["version"],
        "inputFiles": sorted(
            input_files, key=lambda item: (item["inputRole"], item["sourcePath"])
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
    return logical_documents, build_inputs, counts


def compile_model(profile_path: Path, output_root: Path) -> dict[str, Any]:
    profile = load_json(profile_path)
    validate_schema(profile, "build-profile", str(profile_path))
    package = profile["package"]
    expected_release_id = f"{package['packageId']}@{package['packageVersion']}"
    if package["releaseId"] != expected_release_id:
        raise CompilationError(f"releaseId must be {expected_release_id}")

    contract_paths = profile["contracts"]
    registry_path = resolve_repo_path(contract_paths["fieldSemanticsRegistryPath"])
    normalization_path = resolve_repo_path(contract_paths["normalizationProfilePath"])
    ontology_profile_path = resolve_repo_path(contract_paths["ontologyProfilePath"])
    publication_profile_path = resolve_repo_path(
        contract_paths["publicationEvidenceProfilePath"]
    )
    definition_profile_path = CONTRACT_ROOT / "profiles/canonical-definition-record-v1.profile.json"
    registry_value = load_json(registry_path)
    validate_schema(registry_value, "field-semantics-registry", str(registry_path))
    registry = FieldRegistry(registry_value)
    normalizer = Normalizer(registry)
    coverage_normalizer = Normalizer(registry, track_coverage=True)
    normalization = load_json(normalization_path)
    validate_schema(normalization, "semantic-normalization-profile", str(normalization_path))
    registry_compatibility = registry_value["compatibility"]
    normalization_compatibility = normalization["compatibility"]
    expected_normalization = (normalization["profileId"], normalization["version"])
    actual_normalization = (
        registry_compatibility["normalizationProfileId"],
        registry_compatibility["normalizationProfileVersion"],
    )
    if actual_normalization != expected_normalization:
        raise CompilationError(
            "Field registry is not bound to the selected semantic normalization profile"
        )
    if registry_compatibility["releaseModelContractVersion"] != contract_paths["runtimeContractVersion"]:
        raise CompilationError("Field registry/runtime contract version mismatch")
    if normalization_compatibility["releaseModelContractVersion"] != contract_paths["runtimeContractVersion"]:
        raise CompilationError("Normalization/runtime contract version mismatch")
    if normalization_compatibility["fieldRegistryFormatVersion"] != registry_value["registryFormatVersion"]:
        raise CompilationError("Normalization/field-registry format mismatch")
    ontology_profile = load_json(ontology_profile_path)
    ontology_contract_schema = load_json(SCHEMA_FILES["ontology-profile"])
    Draft202012Validator.check_schema(ontology_contract_schema)
    ontology_validator = Draft202012Validator(ontology_contract_schema, format_checker=FormatChecker())
    ontology_errors = list(ontology_validator.iter_errors(ontology_profile))
    if ontology_errors:
        raise CompilationError(f"Invalid ontology profile {ontology_profile_path}: {ontology_errors[0].message}")
    ontology_profile_binding, fwu_core_binding = verify_ontology_profile_trust(
        profile, ontology_profile, ontology_profile_path, registry_value
    )
    try:
        publication_profile_bytes = publication_profile_path.read_bytes()
    except OSError as error:
        raise CompilationError(
            f"Cannot read publication-evidence profile {publication_profile_path}: {error}"
        ) from error
    publication_profile = strict_json_loads(
        publication_profile_bytes, str(publication_profile_path)
    )
    validate_schema(
        publication_profile,
        "publication-evidence-profile",
        str(publication_profile_path),
    )
    if (
        sha256_bytes(publication_profile_bytes)
        != contract_paths["publicationEvidenceProfileSha256"]
    ):
        raise CompilationError(
            "Publication-evidence profile hash does not match build profile"
        )
    if (
        publication_profile["releaseModelContractVersion"]
        != contract_paths["runtimeContractVersion"]
    ):
        raise CompilationError(
            "Publication-evidence profile/runtime contract version mismatch"
        )
    publication_profile_binding = {
        "id": publication_profile["profileId"],
        "version": publication_profile["version"],
        "path": contract_paths["publicationEvidenceProfilePath"],
        "sha256": contract_paths["publicationEvidenceProfileSha256"],
    }
    definition_profile = load_json(definition_profile_path)
    validate_schema(definition_profile, "definition-digest-profile", str(definition_profile_path))
    if definition_profile["canonicalJsonProfile"] != normalization["profileId"]:
        raise CompilationError("Definition digest profile is not bound to semantic normalization")

    source_landscape_path = resolve_repo_path(profile["canonicalLandscape"]["sourcePath"])
    source_landscape = load_json(source_landscape_path)
    if not isinstance(source_landscape, dict):
        raise CompilationError("Canonical landscape must be an object")
    if source_landscape.get("landscapeId") != profile["canonicalLandscape"]["landscapeId"]:
        raise CompilationError("Canonical landscape identity does not match build profile")
    if source_landscape.get("subject") != package["subject"]:
        raise CompilationError("Canonical subject does not match build profile")
    if source_landscape.get("locale") != package["locale"]:
        raise CompilationError("Canonical locale does not match build profile")
    ontology_source = ontology_profile["source"]
    expected_ontology_source = {
        "landscapeId": source_landscape.get("landscapeId"),
        "landscapePath": profile["canonicalLandscape"]["sourcePath"],
        "locale": source_landscape.get("locale"),
        "subject": source_landscape.get("subject"),
        "schoolType": source_landscape.get("schoolType"),
        "country": source_landscape.get("country"),
    }
    if ontology_source != expected_ontology_source:
        raise CompilationError("Ontology profile source binding does not match canonical input")
    if ontology_profile["releaseModelContractVersion"] != contract_paths["runtimeContractVersion"]:
        raise CompilationError("Ontology profile/runtime contract version mismatch")
    if ontology_profile["coreBinding"]["ontologyIri"] != registry_compatibility["fwuCoreOntologyIri"]:
        raise CompilationError("Ontology profile/field-registry Core binding mismatch")
    semantic_decisions = ontology_profile["semanticKindDecisions"]
    fingerprint_contract = semantic_decisions["sourceFingerprint"]
    expected_fingerprint_binding = {
        "id": normalization["profileId"],
        "version": normalization["version"],
        "path": contract_paths["normalizationProfilePath"],
        "sha256": sha256_file(normalization_path)[1],
    }
    actual_fingerprint_binding = {
        "id": fingerprint_contract["canonicalJsonProfile"],
        "version": fingerprint_contract["canonicalJsonProfileVersion"],
        "path": fingerprint_contract["canonicalJsonProfilePath"],
        "sha256": fingerprint_contract["canonicalJsonProfileSha256"],
    }
    if actual_fingerprint_binding != expected_fingerprint_binding:
        raise CompilationError("Semantic-kind fingerprint/normalization binding mismatch")

    ledger_path = resolve_repo_path(profile["canonicalLandscape"]["semanticKindLedgerPath"])
    ledger = load_json(ledger_path)
    ledger_errors = list(ontology_validator.iter_errors(ledger))
    if ledger_errors:
        raise CompilationError(f"Invalid semantic-kind ledger {ledger_path}: {ledger_errors[0].message}")
    if ledger.get("profileId") != ontology_profile.get("profileId"):
        raise CompilationError("Semantic-kind ledger/profile binding mismatch")
    if (
        semantic_decisions["ledgerPath"]
        != profile["canonicalLandscape"]["semanticKindLedgerPath"]
        or semantic_decisions["ledgerId"] != ledger.get("ledgerId")
    ):
        raise CompilationError("Ontology profile does not select the configured semantic-kind ledger")
    source_contract = ontology_profile["semanticKindDecisions"]["sourceFingerprint"]
    decisions = ledger.get("decisions") if isinstance(ledger, dict) else None
    if not isinstance(decisions, list):
        raise CompilationError("Semantic-kind ledger decisions are missing")
    decisions_by_goal: dict[str, Mapping[str, Any]] = {}
    for decision in decisions:
        if not isinstance(decision, dict) or not isinstance(decision.get("goalId"), str):
            raise CompilationError("Malformed semantic-kind decision")
        goal_id = decision["goalId"]
        if goal_id in decisions_by_goal:
            raise CompilationError(f"Duplicate semantic-kind decision: {goal_id}")
        decisions_by_goal[goal_id] = decision

    compiled_landscape = copy.deepcopy(source_landscape)
    compiled_landscape["$schema"] = SCHEMA_IDS["compiled-landscape"]
    compiled_landscape["landscapeFormatVersion"] = "1.0"
    goals = compiled_landscape.get("goals")
    if not isinstance(goals, list):
        raise CompilationError("Canonical landscape goals are missing")
    source_goals = source_landscape.get("goals")
    assert isinstance(source_goals, list)
    source_goal_by_id = {
        goal["id"]: goal
        for goal in source_goals
        if isinstance(goal, dict) and isinstance(goal.get("id"), str)
    }
    compiled_goal_ids = {
        goal.get("id") for goal in goals if isinstance(goal, dict) and isinstance(goal.get("id"), str)
    }
    if compiled_goal_ids != set(decisions_by_goal) or compiled_goal_ids != set(source_goal_by_id):
        raise CompilationError("Semantic-kind ledger must cover exactly every canonical goal")
    if profile["canonicalLandscape"]["rootGoalId"] not in compiled_goal_ids:
        raise CompilationError("Configured canonical root goal does not exist")

    relocation_records: list[dict[str, Any]] = []
    assessment_sources: dict[str, str] = {}
    relocation = profile["pathRelocations"]
    semantic_counts: Counter[str] = Counter()
    for goal in goals:
        if not isinstance(goal, dict) or not isinstance(goal.get("id"), str):
            raise CompilationError("Malformed canonical goal")
        goal_id = goal["id"]
        decision = decisions_by_goal[goal_id]
        actual_fingerprint = source_fingerprint(source_goal_by_id[goal_id], source_contract)
        if decision.get("sourceFingerprint") != actual_fingerprint:
            raise CompilationError(f"Stale semantic-kind decision for goal {goal_id}")
        semantic_kind = decision.get("semanticKind")
        if semantic_kind not in ontology_profile["semanticKinds"]:
            raise CompilationError(f"Unsupported semanticKind for goal {goal_id}: {semantic_kind}")
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
                    {"goalId": goal_id, "field": f"extendedData.{field}", "source": value, "target": rewritten}
                )

        exam_data = goal.get("examData")
        if isinstance(exam_data, dict) and isinstance(exam_data.get("sourceArtifactPath"), str):
            value = exam_data["sourceArtifactPath"]
            rewritten = relocate_path(
                value,
                relocation["assessmentSourcePrefix"],
                relocation["assessmentOutputPrefix"],
            )
            exam_data["sourceArtifactPath"] = rewritten
            assessment_sources[value] = rewritten
            relocation_records.append(
                {"goalId": goal_id, "field": "examData.sourceArtifactPath", "source": value, "target": rewritten}
            )

        source_ref = goal.get("sourceRef")
        if isinstance(source_ref, str) and source_ref.startswith(relocation["assessmentSourcePrefix"]):
            source_path, separator, fragment = source_ref.partition("#")
            rewritten_path = relocate_path(
                source_path,
                relocation["assessmentSourcePrefix"],
                relocation["assessmentOutputPrefix"],
            )
            rewritten = rewritten_path + (separator + fragment if separator else "")
            goal["sourceRef"] = rewritten
            assessment_sources[source_path] = rewritten_path
            relocation_records.append(
                {"goalId": goal_id, "field": "sourceRef", "source": source_ref, "target": rewritten}
            )

    expected_semantic_counts = ledger["counts"]
    for kind, count in semantic_counts.items():
        if expected_semantic_counts.get(kind) != count:
            raise CompilationError(f"Semantic-kind count mismatch for {kind}: {count}")
    if expected_semantic_counts.get("total") != len(goals):
        raise CompilationError("Semantic-kind total does not match goals")

    validate_schema(compiled_landscape, "compiled-landscape", "compiled Mathematik landscape")
    assert_program_unit_hierarchy_acyclic(compiled_landscape.get("programUnits", []))

    output_root.mkdir(parents=True, exist_ok=True)
    landscape_output = profile["canonicalLandscape"]["outputPath"]
    write_json(output_root, landscape_output, compiled_landscape)

    compiled_views: list[tuple[str, dict[str, Any]]] = []
    view_source_directory = resolve_repo_path(profile["compositionViews"]["sourceDirectory"])
    for source_path in sorted(view_source_directory.glob("*.json"), key=lambda item: item.name):
        if source_path.is_symlink():
            raise CompilationError(f"Composition view symlinks are forbidden: {source_path}")
        resolved_view_path = source_path.resolve()
        try:
            resolved_view_path.relative_to(view_source_directory)
        except ValueError as error:
            raise CompilationError(f"Composition view escapes its source directory: {source_path}") from error
        value = load_json(source_path)
        if not isinstance(value, dict):
            raise CompilationError(f"Composition view must be an object: {source_path}")
        compiled = copy.deepcopy(value)
        compiled["$schema"] = SCHEMA_IDS["composition-view"]
        compiled["viewFormatVersion"] = "1.0"
        compiled["language"] = profile["compositionViews"]["locale"]
        validate_schema(compiled, "composition-view", str(source_path))
        output_path = f"{profile['compositionViews']['outputDirectory'].rstrip('/')}/{source_path.name}"
        compiled_views.append((output_path, compiled))
        write_json(output_root, output_path, compiled)
    compiled_views.sort(key=lambda item: item[1]["viewId"])
    view_ids = [value["viewId"] for _, value in compiled_views]
    if len(view_ids) != len(set(view_ids)):
        raise CompilationError("Duplicate composition view ID")
    scope_keys = [canonical_json_bytes(value["scope"]) for _, value in compiled_views]
    if len(scope_keys) != len(set(scope_keys)):
        raise CompilationError("Composition view scopes must be unique")
    if profile["compositionViews"]["defaultViewId"] not in set(view_ids):
        raise CompilationError("Configured default view does not exist")
    view_index_path = "data/views/index.json"
    view_index = {
        "$schema": SCHEMA_IDS["composition-view-index"],
        "indexFormatVersion": "1.0",
        "views": [
            {
                "viewId": value["viewId"],
                "landscapeId": value["landscapeId"],
                "language": value["language"],
                "scope": value["scope"],
                "artifactPath": output_path,
            }
            for output_path, value in compiled_views
        ],
    }
    validate_schema(view_index, "composition-view-index", "composition view index")
    write_json(output_root, view_index_path, view_index)

    compiled_decks: list[tuple[str, dict[str, Any]]] = []
    for deck_config in profile["cardDecks"]:
        source_path = resolve_repo_path(deck_config["sourcePath"])
        value = load_json(source_path)
        if not isinstance(value, dict):
            raise CompilationError(f"Card deck must be an object: {source_path}")
        compiled = copy.deepcopy(value)
        compiled["$schema"] = SCHEMA_IDS["card-deck"]
        compiled["deckFormatVersion"] = "1.0"
        compiled["language"] = deck_config["locale"]
        validate_schema(compiled, "card-deck", str(source_path))
        compiled_decks.append((deck_config["outputPath"], compiled))
        write_json(output_root, deck_config["outputPath"], compiled)
    compiled_decks.sort(key=lambda item: (item[1]["deckId"], item[1]["language"]))
    deck_keys = [(value["deckId"], value["language"]) for _, value in compiled_decks]
    if len(deck_keys) != len(set(deck_keys)):
        raise CompilationError("Duplicate deck ID/language pair")
    card_index_path = "data/cards/card-index.json"
    card_index = {
        "$schema": SCHEMA_IDS["card-index"],
        "indexFormatVersion": "1.0",
        "decks": [
            {
                "deckId": value["deckId"],
                "landscapeId": value["landscapeId"],
                "language": value["language"],
                "title": value["title"],
                "cardCount": len(value["cards"]),
                "artifactPath": output_path,
            }
            for output_path, value in compiled_decks
        ],
    }
    validate_schema(card_index, "card-index", "card index")
    write_json(output_root, card_index_path, card_index)

    resource_index_path = "data/resources/resource-index.json"
    resources: list[dict[str, Any]] = []
    binary_inputs: list[dict[str, Any]] = []
    public_root = resolve_repo_path(profile["resources"]["publicAssetRoot"])
    for goal in goals:
        links = goal.get("resourceLinks")
        if not isinstance(links, list):
            continue
        for order, raw_link in enumerate(links):
            if not isinstance(raw_link, dict):
                raise CompilationError(f"Malformed resource link on goal {goal['id']}")
            resource_id = f"goal-resource:{goal['id']}:{order}"
            common = {
                "resourceId": resource_id,
                "landscapeId": compiled_landscape["landscapeId"],
                "ownerGoalId": goal["id"],
                "order": order,
            }
            if raw_link.get("type") == "goal-visualization":
                url = raw_link.get("url")
                if raw_link.get("resourceType") != "image":
                    raise CompilationError(
                        f"Goal visualization has non-image resourceType on {goal['id']}"
                    )
                if raw_link.get("skillpilotId") != goal["id"]:
                    raise CompilationError(
                        f"Goal visualization owner identity mismatch on {goal['id']}"
                    )
                if raw_link.get("role") != "primary":
                    raise CompilationError(
                        f"Goal visualization must use role=primary on {goal['id']}"
                    )
                if not isinstance(url, str) or not url.startswith("/") or url.startswith("//"):
                    raise CompilationError(f"Invalid embedded resource URL on goal {goal['id']}")
                artifact_path = url[1:]
                filename = artifact_path.rsplit("/", 1)[-1]
                if filename not in {f"{goal['id']}.jpg", f"{goal['id']}.png"}:
                    raise CompilationError(
                        f"Goal visualization filename does not match owner {goal['id']}"
                    )
                embedded_prefix = profile["resources"]["embeddedOutputPrefix"].rstrip("/") + "/"
                if not artifact_path.startswith(embedded_prefix):
                    raise CompilationError(
                        f"Embedded resource is outside configured output prefix: {artifact_path}"
                    )
                source_path = safe_join(public_root, artifact_path)
                if not source_path.is_file():
                    raise CompilationError(f"Missing embedded resource: {source_path}")
                media_type = media_type_for_image(source_path)
                if media_type not in profile["resources"]["supportedImageMediaTypes"]:
                    raise CompilationError(f"Unsupported configured image media type: {media_type}")
                size, digest = sha256_file(source_path)
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
                        "sourcePath": str(source_path.relative_to(REPO_ROOT)).replace("\\", "/"),
                        "artifactPath": artifact_path,
                        "bytes": size,
                        "sha256": digest,
                    }
                )
            else:
                resource = {
                    **common,
                    "resourceKind": "tool",
                    "resourceType": raw_link.get("resourceType"),
                    "delivery": "external",
                    "runtimeRequired": False,
                    "externalUrl": raw_link.get("url"),
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
    resource_index = {
        "$schema": SCHEMA_IDS["resource-index"],
        "indexFormatVersion": "1.0",
        "resources": resources,
    }
    validate_schema(resource_index, "resource-index", "resource index")
    write_json(output_root, resource_index_path, resource_index)

    (
        publication_logical_documents,
        publication_build_inputs,
        publication_counts,
    ) = compile_publication_evidence(
        publication_profile,
        compiled_landscape,
        compiled_decks,
        resources,
    )
    publication_schema_names = {
        "mapping": "source-to-canonical-mappings",
        "source-index": "official-source-index",
        "source-goal-reference-index": "source-goal-reference-index",
        "quality-evidence": "release-quality-evidence",
    }
    publication_normalization_roles = {
        binding["artifactRole"]: binding["normalizationRole"]
        for binding in publication_profile["outputArtifacts"].values()
    }
    if set(publication_normalization_roles) != set(publication_schema_names):
        raise CompilationError("Publication artifact-role binding is incomplete")
    for role, _logical_id, output_path, value in publication_logical_documents:
        schema_name = publication_schema_names.get(role)
        if schema_name is None:
            raise CompilationError(f"Unknown publication artifact role {role}")
        if value.get("$schema") != SCHEMA_IDS[schema_name]:
            raise CompilationError(f"Publication artifact schema mismatch for {role}")
        validate_schema(value, schema_name, f"publication artifact {role}")
        write_json(output_root, output_path, value)

    copied_assessment_sources: list[dict[str, Any]] = []
    for source, target in sorted(assessment_sources.items()):
        source_path = resolve_repo_path(source)
        target_path = safe_join(output_root, target)
        target_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source_path, target_path)
        size, digest = sha256_file(target_path)
        copied_assessment_sources.append(
            {"sourcePath": source, "artifactPath": target, "bytes": size, "sha256": digest}
        )

    package_id = package["packageId"]
    release_id = package["releaseId"]
    landscape_id = compiled_landscape["landscapeId"]
    definitions: list[dict[str, Any]] = []
    definition_sources: list[dict[str, Any]] = []

    def add_definition(
        key: dict[str, Any],
        role: str,
        logical_id: str,
        artifact_path: str,
        json_pointer: str,
        body: Any,
        body_role: str,
        body_path: str,
    ) -> None:
        normalized_body = normalizer.normalize(body_role, body, body_path)
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
                "definitionDigest": definition_digest(key, normalized_body, definition_profile),
            }
        )
        definition_sources.append(
            {
                "key": copy.deepcopy(key),
                "role": body_role,
                "bodyPath": body_path,
                "body": body,
            }
        )

    landscape_key = {"kind": "landscape", "id": landscape_id}
    add_definition(landscape_key, "canonical-landscape", landscape_id, landscape_output, "", compiled_landscape, "canonical-landscape", "")
    goal_keys: dict[str, dict[str, Any]] = {}
    for index, goal in enumerate(goals):
        key = {"kind": "goal", "id": goal["id"]}
        goal_keys[goal["id"]] = key
        add_definition(key, "canonical-landscape", landscape_id, landscape_output, pointer("goals", index), goal, "canonical-landscape", pointer("goals", index))
    unit_keys: dict[str, dict[str, Any]] = {}
    for index, unit in enumerate(compiled_landscape.get("programUnits", [])):
        key = {"kind": "program-unit", "landscapeId": landscape_id, "id": unit["id"]}
        unit_keys[unit["id"]] = key
        add_definition(key, "canonical-landscape", landscape_id, landscape_output, pointer("programUnits", index), unit, "canonical-landscape", pointer("programUnits", index))
    placement_keys: list[dict[str, Any]] = []
    for index, placement in enumerate(compiled_landscape.get("goalPlacements", [])):
        identity_profile = definition_profile["derivedIdentities"]["placement"]
        normalized_placement = normalizer.normalize(
            "canonical-landscape", placement, pointer("goalPlacements", index)
        )
        placement_hash = framed_digest(
            [identity_profile["domain"], canonical_json_bytes(normalized_placement).decode("utf-8")]
        )
        placement_id = (
            identity_profile["outputPrefix"]
            + placement_hash[: identity_profile["hexLength"]]
        )
        key = {"kind": "placement", "landscapeId": landscape_id, "id": placement_id}
        placement_keys.append(key)
        add_definition(key, "canonical-landscape", landscape_id, landscape_output, pointer("goalPlacements", index), placement, "canonical-landscape", pointer("goalPlacements", index))
    competency_keys: dict[str, dict[str, Any]] = {}
    for index, competency in enumerate(compiled_landscape.get("competencyCatalog", [])):
        key = {"kind": "competency-entry", "landscapeId": landscape_id, "id": competency["id"]}
        competency_keys[competency["id"]] = key
        add_definition(key, "canonical-landscape", landscape_id, landscape_output, pointer("competencyCatalog", index), competency, "canonical-landscape", pointer("competencyCatalog", index))
    view_keys: dict[str, dict[str, Any]] = {}
    for output_path, view in compiled_views:
        key = {"kind": "view", "id": view["viewId"]}
        view_keys[view["viewId"]] = key
        add_definition(key, "composition-view", view["viewId"], output_path, "", view, "composition-view", "")
    deck_keys_by_path: dict[str, dict[str, Any]] = {}
    deck_keys_by_id_locale: dict[tuple[str, str], dict[str, Any]] = {}
    card_keys: dict[tuple[str, str, str], dict[str, Any]] = {}
    for output_path, deck in compiled_decks:
        key = {"kind": "deck", "id": deck["deckId"], "locale": deck["language"]}
        deck_keys_by_path[output_path] = key
        deck_keys_by_id_locale[(deck["deckId"], deck["language"])] = key
        add_definition(key, "card-deck", f"{deck['deckId']}@{deck['language']}", output_path, "", deck, "card-deck", "")
        for card_index_number, card in enumerate(deck["cards"]):
            card_key = {
                "kind": "card",
                "deckId": deck["deckId"],
                "locale": deck["language"],
                "id": card["id"],
            }
            card_keys[(deck["deckId"], deck["language"], card["id"])] = card_key
            add_definition(card_key, "card-deck", f"{deck['deckId']}@{deck['language']}", output_path, pointer("cards", card_index_number), card, "card-deck", pointer("cards", card_index_number))
    resource_keys: dict[str, dict[str, Any]] = {}
    for index, resource in enumerate(resources):
        key = {"kind": "resource", "id": resource["resourceId"]}
        resource_keys[resource["resourceId"]] = key
        add_definition(key, "resource-index", f"{landscape_id}:resources", resource_index_path, pointer("resources", index), resource, "resource-index", pointer("resources", index))

    definition_key_strings = [entity_key_id(item["key"]) for item in definitions]
    duplicates = [key for key, count in Counter(definition_key_strings).items() if count > 1]
    if duplicates:
        raise CompilationError(f"Duplicate typed definition keys: {duplicates[:3]}")
    definitions.sort(key=lambda item: entity_key_sort_key(item["key"]))

    references: list[dict[str, Any]] = []
    emitted_dependency_instances: Counter[tuple[str, str, str, str]] = Counter()

    def hard(source: Mapping[str, Any], source_pointer: str, registry_entry_id: str, target: Mapping[str, Any]) -> None:
        entry = registry.by_id.get(registry_entry_id)
        dependency = entry.data.get("dependencySemantics") if entry is not None else None
        if not isinstance(dependency, dict) or dependency.get("mode") != "hard-reference":
            raise CompilationError(
                f"Closure hard reference is not registry-classified: {registry_entry_id}"
            )
        if dependency.get("targetKind") != target.get("kind"):
            raise CompilationError(
                f"Closure target kind contradicts {registry_entry_id}: {target.get('kind')}"
            )
        emitted_dependency_instances[
            (entity_key_id(source), source_pointer, registry_entry_id, "hard-reference")
        ] += 1
        references.append(
            {
                "source": dict(source),
                "sourcePointer": source_pointer,
                "registryEntryId": registry_entry_id,
                "strength": "hard",
                "target": dict(target),
                "resolution": "owned",
            }
        )

    def soft_uri(source: Mapping[str, Any], source_pointer: str, registry_entry_id: str, uri: str, reason: str) -> None:
        entry = registry.by_id.get(registry_entry_id)
        dependency = entry.data.get("dependencySemantics") if entry is not None else None
        if not isinstance(dependency, dict) or dependency.get("mode") != "soft-reference":
            raise CompilationError(
                f"Closure soft reference is not registry-classified: {registry_entry_id}"
            )
        if dependency.get("targetKind") != "external-uri":
            raise CompilationError(f"Closure soft target kind contradicts {registry_entry_id}")
        emitted_dependency_instances[
            (entity_key_id(source), source_pointer, registry_entry_id, "soft-reference")
        ] += 1
        references.append(
            {
                "source": dict(source),
                "sourcePointer": source_pointer,
                "registryEntryId": registry_entry_id,
                "strength": "soft",
                "target": {"kind": "external-uri", "uri": uri},
                "resolution": "not-followed-soft",
                "reason": reason,
            }
        )

    for goal_index, goal in enumerate(goals):
        hard(landscape_key, pointer("goals", goal_index), "landscape.goals", goal_keys[goal["id"]])
    for unit_index, unit in enumerate(compiled_landscape.get("programUnits", [])):
        hard(landscape_key, pointer("programUnits", unit_index), "landscape.program-units", unit_keys[unit["id"]])
        parent_id = unit.get("parentUnitId")
        if isinstance(parent_id, str):
            if parent_id not in unit_keys:
                raise CompilationError(f"Unknown parent program unit {parent_id}")
            hard(unit_keys[unit["id"]], pointer("parentUnitId"), "program-unit.parent", unit_keys[parent_id])
    for placement_index, placement in enumerate(compiled_landscape.get("goalPlacements", [])):
        key = placement_keys[placement_index]
        hard(landscape_key, pointer("goalPlacements", placement_index), "landscape.goal-placements", key)
        if placement["goalId"] not in goal_keys or placement["unitId"] not in unit_keys:
            raise CompilationError("Goal placement contains an unresolved target")
        hard(key, pointer("goalId"), "placement.goal", goal_keys[placement["goalId"]])
        hard(key, pointer("unitId"), "placement.unit", unit_keys[placement["unitId"]])
    for competency_index, competency in enumerate(compiled_landscape.get("competencyCatalog", [])):
        hard(landscape_key, pointer("competencyCatalog", competency_index), "landscape.competency-catalog", competency_keys[competency["id"]])

    resource_id_by_owner_order = {
        (resource["ownerGoalId"], resource["order"]): resource["resourceId"] for resource in resources
    }
    for goal_index, goal in enumerate(goals):
        source_key = goal_keys[goal["id"]]
        for relation, registry_id in (("contains", "goal.contains"), ("requires", "goal.requires")):
            for target_index, target_id in enumerate(goal.get(relation, [])):
                if target_id not in goal_keys:
                    raise CompilationError(f"Unresolved {relation} target {target_id} from {goal['id']}")
                hard(source_key, pointer(relation, target_index), registry_id, goal_keys[target_id])
        emit_goal_competency_references(
            goal,
            source_key,
            competency_keys,
            hard,
        )
        exam_data = goal.get("examData")
        if isinstance(exam_data, dict):
            for target_index, target_id in enumerate(exam_data.get("coveredGoalIds", [])):
                if target_id not in goal_keys:
                    raise CompilationError(f"Unresolved exam coveredGoalId {target_id} from {goal['id']}")
                hard(source_key, pointer("examData", "coveredGoalIds", target_index), "goal.exam-covered-goals", goal_keys[target_id])
        extended = goal.get("extendedData")
        if isinstance(extended, dict):
            for field, registry_id in (
                ("vocabularySource", "goal.vocabulary-source"),
                ("vocabularySourceEn", "goal.vocabulary-source-en"),
            ):
                target_path = extended.get(field)
                if isinstance(target_path, str):
                    target_key = deck_keys_by_path.get(target_path)
                    if target_key is None:
                        raise CompilationError(f"Unresolved deck path {target_path} from {goal['id']}")
                    hard(source_key, pointer("extendedData", field), registry_id, target_key)
        for link_order, link in enumerate(goal.get("resourceLinks", [])):
            resource_id = resource_id_by_owner_order[(goal["id"], link_order)]
            hard(source_key, pointer("resourceLinks", link_order), "goal.resource-links", resource_keys[resource_id])

    for output_path, view in compiled_views:
        view_key = view_keys[view["viewId"]]
        if view["landscapeId"] != landscape_id:
            raise CompilationError(
                f"View {view['viewId']} belongs to unsupported landscape {view['landscapeId']}"
            )
        hard(view_key, pointer("landscapeId"), "view.landscape-id", landscape_key)
        for source_pointer, registry_id, target_kind, target_id in collect_view_references(
            view["rootNodes"]
        ):
            if target_kind == "landscape":
                if target_id != landscape_id:
                    raise CompilationError(
                        f"View {view['viewId']} references unsupported landscape {target_id}"
                    )
                hard(view_key, source_pointer, registry_id, landscape_key)
            else:
                if target_id not in goal_keys:
                    raise CompilationError(f"View {view['viewId']} references unknown goal {target_id}")
                hard(view_key, source_pointer, registry_id, goal_keys[target_id])
    for output_path, deck in compiled_decks:
        deck_key = deck_keys_by_path[output_path]
        if deck["landscapeId"] != landscape_id:
            raise CompilationError(
                f"Deck {deck['deckId']} belongs to unsupported landscape {deck['landscapeId']}"
            )
        hard(deck_key, pointer("landscapeId"), "deck.landscape-id", landscape_key)
        for card_index_number, card in enumerate(deck["cards"]):
            hard(
                deck_key,
                pointer("cards", card_index_number),
                "card-deck.cards",
                card_keys[(deck["deckId"], deck["language"], card["id"])],
            )
    for resource in resources:
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

    expected_dependency_instances: Counter[tuple[str, str, str, str]] = Counter()

    def inventory_dependencies(
        source_key: Mapping[str, Any], role: str, value: Any, global_path: str, source_path: str
    ) -> None:
        if isinstance(value, dict):
            for key, child in value.items():
                escaped = escape_pointer_segment(key)
                child_global_path = f"{global_path}/{escaped}" if global_path else f"/{escaped}"
                child_source_path = f"{source_path}/{escaped}" if source_path else f"/{escaped}"
                entry = registry.direct(role, child_global_path)
                dependency = entry.data.get("dependencySemantics") if entry is not None else None
                mode = dependency.get("mode") if isinstance(dependency, dict) else "none"
                value_mode = dependency.get("valueMode") if isinstance(dependency, dict) else None
                if mode in {"hard-reference", "soft-reference"}:
                    if value_mode in {"list-items", "owner-and-position", "record-membership"}:
                        if not isinstance(child, list):
                            raise CompilationError(
                                f"Registry dependency {entry.entry_id} expects an array"
                            )
                        for index in range(len(child)):
                            expected_dependency_instances[
                                (
                                    entity_key_id(source_key),
                                    f"{child_source_path}/{index}",
                                    entry.entry_id,
                                    mode,
                                )
                            ] += 1
                        continue
                    expected_dependency_instances[
                        (entity_key_id(source_key), child_source_path, entry.entry_id, mode)
                    ] += 1
                    continue
                inventory_dependencies(
                    source_key, role, child, child_global_path, child_source_path
                )
        elif isinstance(value, list):
            for index, child in enumerate(value):
                child_global_path = f"{global_path}/{index}"
                child_source_path = f"{source_path}/{index}" if source_path else f"/{index}"
                inventory_dependencies(
                    source_key, role, child, child_global_path, child_source_path
                )

    for definition_source in definition_sources:
        inventory_dependencies(
            definition_source["key"],
            definition_source["role"],
            definition_source["body"],
            definition_source["bodyPath"],
            "",
        )
    if emitted_dependency_instances != expected_dependency_instances:
        missing = list((expected_dependency_instances - emitted_dependency_instances).elements())
        unexpected = list((emitted_dependency_instances - expected_dependency_instances).elements())
        raise CompilationError(
            "Closure emission does not exactly cover concrete registry dependencies: "
            f"missing={missing[:3]}, unexpected={unexpected[:3]}"
        )

    references.sort(
        key=lambda item: (
            entity_key_sort_key(item["source"]),
            item["sourcePointer"],
            item["registryEntryId"],
            canonical_json_bytes(item["target"]),
        )
    )
    seeds = [landscape_key, *[view_keys[view_id] for view_id in sorted(view_keys)]]
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
    all_definition_keys = set(definition_key_strings)
    unreachable = sorted(all_definition_keys - reachable)
    if unreachable:
        raise CompilationError(f"Runtime definition is outside hard-reference closure: {unreachable[:3]}")

    definition_index = definition_index_digest(definitions, definition_profile)
    definition_profile_binding = {
        "id": definition_profile["profileId"],
        "version": definition_profile["version"],
        "sha256": sha256_file(definition_profile_path)[1],
    }
    registry_binding = {
        "id": registry_value["registryId"],
        "version": registry_value["version"],
        "sha256": sha256_file(registry_path)[1],
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
        "releaseBinding": release_binding,
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
        "seeds": sorted(seeds, key=entity_key_sort_key),
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
        closure, "dependency-closure", normalizer, definition_profile["closureDigest"]
    )
    validate_schema(closure, "dependency-closure", "dependency closure")
    write_json(output_root, closure_path, closure)

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
        migration, "migration-aliases", normalizer, definition_profile["migrationDigest"]
    )
    validate_schema(migration, "migration-aliases", "migration aliases")
    write_json(output_root, migration_path, migration)

    runtime_catalog_path = "data/runtime/catalog.json"
    scope_dimensions: list[dict[str, Any]] = []
    values_by_dimension: dict[str, set[str]] = defaultdict(set)
    for _, view in compiled_views:
        for key, value in view["scope"].items():
            values_by_dimension[key].add(value)
    for dimension in sorted(values_by_dimension):
        scope_dimensions.append({"id": dimension, "values": sorted(values_by_dimension[dimension])})
    default_view_id = profile["compositionViews"]["defaultViewId"]
    default_offering_id = f"offering.{default_view_id}"
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
                "artifactPath": landscape_output,
                "locale": compiled_landscape["locale"],
                "frameworkId": compiled_landscape["frameworkId"],
                "subject": compiled_landscape["subject"],
                "country": compiled_landscape["country"],
                "region": compiled_landscape["region"],
                "schoolForm": compiled_landscape["schoolType"],
                "defaultOfferingId": default_offering_id,
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
            for output_path, view in compiled_views
        ],
        "offeredScopes": [
            {
                "offeringId": f"offering.{view['viewId']}",
                "landscapeId": view["landscapeId"],
                "scope": view["scope"],
                "viewResolution": {"mode": "single", "viewIds": [view["viewId"]]},
            }
            for _, view in compiled_views
        ],
        "decks": [
            {
                "deckId": deck["deckId"],
                "locale": deck["language"],
                "landscapeId": deck["landscapeId"],
                "artifactPath": output_path,
            }
            for output_path, deck in compiled_decks
        ],
        "resources": [
            {
                "resourceId": resource["resourceId"],
                "resourceKind": "goal-visualization" if resource["resourceKind"] == "goal-visualization" else "external-tool",
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
            "compositionViewsPath": view_index_path,
            "cardsPath": card_index_path,
            "resourcesPath": resource_index_path,
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
    validate_schema(runtime_catalog, "runtime-catalog", "runtime catalog")
    write_json(output_root, runtime_catalog_path, runtime_catalog)

    logical_documents: list[tuple[str, str, str, Any]] = [
        ("canonical-landscape", landscape_id, landscape_output, compiled_landscape),
        ("composition-view-index", f"{landscape_id}:views", view_index_path, view_index),
        ("card-index", f"{landscape_id}:cards", card_index_path, card_index),
        ("resource-index", f"{landscape_id}:resources", resource_index_path, resource_index),
        ("dependency-closure", f"{release_id}:closure", closure_path, closure),
        ("migration-aliases", f"{release_id}:migrations", migration_path, migration),
        ("runtime-catalog", f"{release_id}:catalog", runtime_catalog_path, runtime_catalog),
    ]
    logical_documents.extend(
        ("composition-view", view["viewId"], output_path, view) for output_path, view in compiled_views
    )
    logical_documents.extend(
        ("card-deck", f"{deck['deckId']}@{deck['language']}", output_path, deck)
        for output_path, deck in compiled_decks
    )
    logical_documents.extend(publication_logical_documents)
    logical_records: list[dict[str, Any]] = []
    normalized_payloads: dict[tuple[str, str], bytes] = {}
    for role, logical_id, _path, value in logical_documents:
        normalization_role = publication_normalization_roles.get(role, role)
        normalized_value = normalizer.normalize(normalization_role, value)
        payload = canonical_json_bytes(normalized_value)
        record = {
            "role": role,
            "logicalId": logical_id,
            "mediaType": "application/json",
            "normalizedBytes": len(payload),
            "normalizedSha256": sha256_bytes(payload),
            "recordSha256": "",
        }
        record["recordSha256"] = calculate_logical_record(record, normalization)
        logical_records.append(record)
        normalized_payloads[(role, logical_id)] = payload
    logical_records.sort(key=lambda item: (item["role"], item["logicalId"]))
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
        record["recordSha256"] = calculate_binary_record(record, normalization)
        binary_records.append(record)
    binary_records.sort(key=lambda item: item["resourceId"])
    expected_content_counts = publication_profile["expectedCounts"]["contentIndex"]
    if (
        len(publication_logical_documents)
        != expected_content_counts["addedLogicalArtifacts"]
        or len(logical_records) != expected_content_counts["totalLogicalArtifacts"]
        or len(binary_records) != expected_content_counts["binaryResources"]
    ):
        raise CompilationError(
            "Publication artifacts changed semantic-content-index conformance counts"
        )
    content_index_path = "metadata/semantic-content-index.json"
    content_index = {
        "$schema": SCHEMA_IDS["semantic-content-index"],
        "indexFormatVersion": "1.0",
        "normalizationProfile": {
            "id": normalization["profileId"],
            "version": normalization["version"],
            "sha256": sha256_file(normalization_path)[1],
        },
        "fieldSemanticsRegistry": registry_binding,
        "logicalArtifacts": logical_records,
        "binaryResources": binary_records,
        "contentDigest": ZERO_DIGEST,
    }
    content_index["contentDigest"] = calculate_content_digest(content_index, normalization)
    content_digest = content_index["contentDigest"]

    closure["releaseBinding"]["contentDigest"] = content_digest
    migration["currentRelease"]["contentDigest"] = content_digest
    runtime_catalog["releaseBinding"]["contentDigest"] = content_digest
    closure["closureDigest"] = generated_document_digest(
        closure, "dependency-closure", normalizer, definition_profile["closureDigest"]
    )
    migration["migrationDigest"] = generated_document_digest(
        migration, "migration-aliases", normalizer, definition_profile["migrationDigest"]
    )

    final_documents = {
        ("dependency-closure", f"{release_id}:closure"): closure,
        ("migration-aliases", f"{release_id}:migrations"): migration,
        ("runtime-catalog", f"{release_id}:catalog"): runtime_catalog,
    }
    for key, value in final_documents.items():
        payload = canonical_json_bytes(normalizer.normalize(key[0], value))
        if payload != normalized_payloads[key]:
            raise CompilationError(f"Content-digest insertion changed normalized semantic payload for {key}")
    validate_schema(closure, "dependency-closure", "final dependency closure")
    validate_schema(migration, "migration-aliases", "final migration aliases")
    validate_schema(runtime_catalog, "runtime-catalog", "final runtime catalog")
    validate_schema(content_index, "semantic-content-index", "semantic content index")
    write_json(output_root, closure_path, closure)
    write_json(output_root, migration_path, migration)
    write_json(output_root, runtime_catalog_path, runtime_catalog)
    write_json(output_root, content_index_path, content_index)

    for role, _logical_id, _path, value in logical_documents:
        normalization_role = publication_normalization_roles.get(role, role)
        coverage_normalizer.normalize(normalization_role, value)

    expected = profile["expectedCounts"]
    actual_counts = {
        "landscapes": 1,
        "goals": len(goals),
        "programUnits": len(compiled_landscape.get("programUnits", [])),
        "goalPlacements": len(compiled_landscape.get("goalPlacements", [])),
        "competencyEntries": len(compiled_landscape.get("competencyCatalog", [])),
        "views": len(compiled_views),
        "decks": len(compiled_decks),
        "cards": sum(len(deck["cards"]) for _, deck in compiled_decks),
        "resourceLinks": len(resources),
        "embeddedImages": sum(resource["delivery"] == "embedded" for resource in resources),
        "externalResources": sum(resource["delivery"] == "external" for resource in resources),
        "embeddedImageBytes": sum(
            resource["bytes"] for resource in resources if resource["delivery"] == "embedded"
        ),
        "externalRuntimeDependencies": len(closure["externalRuntimeDependencies"]),
    }
    if actual_counts != expected:
        differences = {
            key: {"expected": expected.get(key), "actual": actual_counts.get(key)}
            for key in sorted(set(expected) | set(actual_counts))
            if expected.get(key) != actual_counts.get(key)
        }
        raise CompilationError(f"Real Mathematik conformance counts changed: {differences}")

    coverage_entries = []
    for entry in sorted(registry.entries, key=lambda item: item.entry_id):
        if entry.role not in {
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
        }:
            continue
        coverage_entries.append(
            {
                "entryId": entry.entry_id,
                "artifactRole": entry.role,
                "pathPattern": entry.data["pathPattern"],
                "classification": entry.data["classification"],
                "instanceCount": coverage_normalizer.occurrences[entry.entry_id],
                "observedTypes": sorted(coverage_normalizer.observed_types[entry.entry_id]),
                "concretePathCount": len(coverage_normalizer.concrete_paths[entry.entry_id]),
                "status": "instance-covered" if coverage_normalizer.occurrences[entry.entry_id] else "schema-only",
            }
        )
    coverage_report = {
        "reportFormatVersion": "1.0",
        "releaseId": release_id,
        "coverageScope": "runtime-and-publication-instance-observations",
        "schemaRegistryCoverageGate": "independent-validator-required",
        "fieldSemanticsRegistry": registry_binding,
        "runtimeEntryCount": len(coverage_entries),
        "instanceCoveredEntryCount": sum(item["status"] == "instance-covered" for item in coverage_entries),
        "schemaOnlyEntryCount": sum(item["status"] == "schema-only" for item in coverage_entries),
        "uncoveredFields": [],
        "ambiguousFields": [],
        "entries": coverage_entries,
        "passed": True,
    }
    write_json(output_root, "metadata/field-coverage.json", coverage_report)

    build_inputs = {
        "buildInputFormatVersion": "1.0",
        "curriculumEdition": package["curriculumEdition"],
        "profilePath": str(profile_path.relative_to(REPO_ROOT)).replace("\\", "/"),
        "profileSha256": sha256_file(profile_path)[1],
        "curriculumOntologyProfile": ontology_profile_binding,
        "fwuCoreOntology": fwu_core_binding,
        "publicationEvidence": {
            "profile": publication_profile_binding,
            **publication_build_inputs,
        },
        "semanticKindLedgerPath": str(ledger_path.relative_to(REPO_ROOT)).replace("\\", "/"),
        "semanticKindLedgerSha256": sha256_file(ledger_path)[1],
        "binaryResources": sorted(binary_inputs, key=lambda item: item["resourceId"]),
        "assessmentSources": copied_assessment_sources,
        "pathRelocations": sorted(relocation_records, key=lambda item: (item["goalId"], item["field"])),
    }
    write_json(output_root, "metadata/build-inputs.json", build_inputs)

    summary = {
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
        "counts": actual_counts,
        "publicationEvidenceCounts": publication_counts,
        "publicationStatus": next(
            value["publicationStatus"]
            for role, _logical_id, _path, value in publication_logical_documents
            if role == "quality-evidence"
        ),
        "semanticKindCounts": dict(sorted(semantic_counts.items())),
        "unresolvedHardReferences": 0,
        "externalRuntimeDependencies": 0,
        "definitionConflicts": 0,
        "readyStatus": "conformance-model-only-not-a-package",
        "passed": True,
    }
    write_json(output_root, "metadata/release-model-conformance.json", summary)
    return summary


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--profile", default=str(DEFAULT_PROFILE), help="Trusted release-model build profile")
    operation = parser.add_mutually_exclusive_group(required=True)
    operation.add_argument("--output", help="Output directory below repository tmp/")
    operation.add_argument(
        "--self-test-dependency-emission",
        action="store_true",
        help="Run the lightweight legacy competency hard-reference probe",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)
    if args.self_test_dependency_emission:
        sys.stdout.buffer.write(pretty_json_bytes(run_dependency_emission_probe()))
        return 0
    assert isinstance(args.output, str)
    profile_path = Path(args.profile)
    if not profile_path.is_absolute():
        profile_path = REPO_ROOT / profile_path
    profile_path = profile_path.resolve()
    try:
        profile_path.relative_to(REPO_ROOT)
    except ValueError as error:
        raise CompilationError("Build profile must be inside the repository") from error
    output_root = safe_output_root(args.output)
    prepare_output_parent(output_root)
    staging_root = Path(
        tempfile.mkdtemp(prefix=f".{output_root.name}.staging-", dir=output_root.parent)
    )
    try:
        summary = compile_model(profile_path, staging_root)
        promote_staged_output(staging_root, output_root)
    finally:
        remove_owned_tree(staging_root)
    sys.stdout.buffer.write(pretty_json_bytes(summary))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except CompilationError as error:
        print(f"Release-model compilation failed: {error}", file=sys.stderr)
        raise SystemExit(1)
