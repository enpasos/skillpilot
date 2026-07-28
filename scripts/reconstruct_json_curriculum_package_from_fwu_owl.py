#!/usr/bin/env python3
"""Reconstruct a standalone SkillPilot JSON package from a released FWU-OWL ZIP.

This compiler deliberately has no dependency on the TypeScript FWU exporter, the
original JSON ZIP, or an authoring checkout.  Its normative inputs are the
validated FWU-OWL carrier and the reverse-support contracts embedded in that
carrier.  Asserted RDF triples, not Core entailments, are inverted through the
closed field-semantics registry.  The package-local semantic-content index is an
exact oracle for every reconstructed normalized logical artifact.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
import re
import shutil
import sqlite3
import stat
import sys
import tempfile
import urllib.parse
import zipfile
from collections import defaultdict
from collections.abc import Iterable, Mapping, Sequence
from dataclasses import dataclass, field
from pathlib import Path, PurePosixPath
from typing import Any, BinaryIO


REVERSE_COMPILER_ID = "skillpilot-fwu-owl-reverse-compiler-v1"
REVERSE_COMPILER_VERSION = "1.0.0"
SUPPORTED_REGISTRY_ID = "skillpilot-fwu-field-semantics-v1"
SUPPORTED_REGISTRY_VERSION = "1.2.0"
SUPPORTED_REGISTRY_SHA256 = "2e536c3f8d63e2acf45690375ace69ec0c6a6e92787bc8a16957b80120c4ca48"
EXPECTED_REGISTRY_ENTRIES = 456

RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
XSD = "http://www.w3.org/2001/XMLSchema#"
LP = "https://w3id.org/lehrplan/ontology/"
SP = "https://skillpilot.de/ns/roundtrip#"
RDF_TYPE = RDF + "type"
LP_VALUE = LP + "LP_0000344"
LP_POSITION = LP + "LP_0000460"
LP_HAS_REFERENCE = LP + "LP_0030071"
SP_FIELD_STATE = SP + "fieldState"

SEGMENT_ORDER = ("runtime", "landscape", "views", "mappings", "sources", "cards", "assets")
FWU_VALIDATION_GATES = (
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
ROLE_ALIASES = {
    "mapping": "source-to-canonical-mappings",
    "quality-evidence": "release-quality-evidence",
    "source-index": "official-source-index",
}
SINGLETON_PATHS = {
    "card-index": "data/cards/card-index.json",
    "composition-view-index": "data/views/index.json",
    "dependency-closure": "data/runtime/dependency-closure.json",
    "source-to-canonical-mappings": "data/mappings/source-to-canonical.json",
    "migration-aliases": "data/runtime/migration-aliases.json",
    "resource-index": "data/resources/resource-index.json",
    "runtime-catalog": "data/runtime/catalog.json",
    "source-goal-reference-index": "data/sources/source-goal-references.json",
    "official-source-index": "data/sources/source-index.json",
    "release-quality-evidence": "metadata/quality/release-quality-evidence.json",
}

NT_IRI = r'<([^<>"{}|^`\\\x00-\x20]+)>'
NT_LITERAL = (
    r'"((?:[^"\\\x00-\x1f]|\\["\\tbnrf]|\\u[0-9A-Fa-f]{4}|\\U[0-9A-Fa-f]{8})*)"'
    r'(?:(@[A-Za-z]+(?:-[A-Za-z0-9]+)*)|\^\^' + NT_IRI + r")?"
)
NT_LINE_RE = re.compile(
    r"^" + NT_IRI + r" " + NT_IRI + r" (?:(" + NT_IRI + r")|(" + NT_LITERAL + r")) \.\n$"
)
SHA256_RE = re.compile(r"^[a-f0-9]{64}$")
CONTENT_DIGEST_RE = re.compile(r"^sha256:[a-f0-9]{64}$")
MISSING = object()


class ReverseCompilerError(Exception):
    """The released input cannot be inverted under the closed v1 contract."""


def fail(message: str) -> None:
    raise ReverseCompilerError(message)


def sha256_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def sha256_file(path: Path) -> tuple[int, str]:
    digest = hashlib.sha256()
    size = 0
    with path.open("rb") as handle:
        while chunk := handle.read(8 * 1024 * 1024):
            size += len(chunk)
            digest.update(chunk)
    return size, digest.hexdigest()


def frame(value: str) -> bytes:
    raw = value.encode("utf-8")
    return len(raw).to_bytes(8, "big") + raw


def framed_digest(values: Iterable[str], *, prefixed: bool = False) -> str:
    result = hashlib.sha256(b"".join(frame(value) for value in values)).hexdigest()
    return f"sha256:{result}" if prefixed else result


def canonical_compact(value: Any) -> bytes:
    return json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
        allow_nan=False,
    ).encode("utf-8")


def canonical_pretty(value: Any) -> bytes:
    return (
        json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2, allow_nan=False) + "\n"
    ).encode("utf-8")


def js_uri_component(value: str) -> str:
    return urllib.parse.quote(value, safe="-_.!~*'()")


def decode_pointer(pointer: str) -> tuple[str, ...]:
    if pointer == "":
        return ()
    if not pointer.startswith("/"):
        fail(f"invalid JSON pointer: {pointer!r}")
    result: list[str] = []
    for raw in pointer[1:].split("/"):
        decoded = ""
        index = 0
        while index < len(raw):
            if raw[index] != "~":
                decoded += raw[index]
                index += 1
                continue
            if index + 1 >= len(raw) or raw[index + 1] not in "01":
                fail(f"invalid JSON pointer escape: {pointer!r}")
            decoded += "~" if raw[index + 1] == "0" else "/"
            index += 2
        result.append(decoded)
    return tuple(result)


def pointer_matches(pattern: Sequence[str], concrete: Sequence[str]) -> bool:
    cache: dict[tuple[int, int], bool] = {}

    def visit(pattern_index: int, concrete_index: int) -> bool:
        key = (pattern_index, concrete_index)
        if key in cache:
            return cache[key]
        if pattern_index == len(pattern):
            answer = concrete_index == len(concrete)
        elif pattern[pattern_index] == "**":
            answer = visit(pattern_index + 1, concrete_index) or (
                concrete_index < len(concrete) and visit(pattern_index, concrete_index + 1)
            )
        elif concrete_index == len(concrete):
            answer = False
        else:
            answer = (
                pattern[pattern_index] == "*"
                or pattern[pattern_index] == concrete[concrete_index]
            ) and visit(pattern_index + 1, concrete_index + 1)
        cache[key] = answer
        return answer

    return visit(0, 0)


def safe_package_path(value: str) -> str:
    path = PurePosixPath(value)
    if (
        not value
        or value.startswith("/")
        or "\\" in value
        or path.as_posix() != value
        or any(part in {"", ".", ".."} for part in path.parts)
        or any(":" in part for part in path.parts)
    ):
        fail(f"unsafe package path: {value!r}")
    return value


def require_object(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        fail(f"{label} must be an object")
    return value


def require_list(value: Any, label: str) -> list[Any]:
    if not isinstance(value, list):
        fail(f"{label} must be an array")
    return value


def require_string(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value:
        fail(f"{label} must be a non-empty string")
    return value


def unescape_nt_literal(value: str) -> str:
    escapes = {"t": "\t", "b": "\b", "n": "\n", "r": "\r", "f": "\f", '"': '"', "\\": "\\"}
    result: list[str] = []
    index = 0
    while index < len(value):
        if value[index] != "\\":
            result.append(value[index])
            index += 1
            continue
        if index + 1 >= len(value):
            fail("truncated N-Triples literal escape")
        marker = value[index + 1]
        if marker in escapes:
            result.append(escapes[marker])
            index += 2
            continue
        width = 4 if marker == "u" else 8 if marker == "U" else 0
        if not width or index + 2 + width > len(value):
            fail("invalid N-Triples literal escape")
        codepoint = int(value[index + 2 : index + 2 + width], 16)
        if codepoint > 0x10FFFF or 0xD800 <= codepoint <= 0xDFFF:
            fail("N-Triples literal escape is not a Unicode scalar")
        result.append(chr(codepoint))
        index += 2 + width
    return "".join(result)


@dataclass(frozen=True)
class Term:
    kind: str
    value: str
    language: str | None = None
    datatype: str | None = None


def parse_nt_line(raw: bytes) -> tuple[str, str, Term]:
    if not raw.endswith(b"\n") or b"\r" in raw or len(raw) > 67_108_864:
        fail("non-canonical or overlong N-Triples line")
    try:
        text = raw.decode("utf-8", "strict")
    except UnicodeError as error:
        raise ReverseCompilerError("N-Triples is not strict UTF-8") from error
    match = NT_LINE_RE.fullmatch(text)
    if match is None:
        fail(f"invalid canonical N-Triples line: {text[:200]!r}")
    subject, predicate = match.group(1), match.group(2)
    object_iri = match.group(4)
    if object_iri is not None:
        return subject, predicate, Term("iri", object_iri)
    lexical = unescape_nt_literal(match.group(6))
    language_raw = match.group(7)
    datatype = match.group(8)
    language = language_raw[1:] if language_raw else None
    return subject, predicate, Term("literal", lexical, language, datatype)


class TripleStore:
    """Disk-backed asserted-triple index with bounded process memory."""

    def __init__(self, path: Path) -> None:
        self.connection = sqlite3.connect(path)
        self.connection.execute("PRAGMA journal_mode=OFF")
        self.connection.execute("PRAGMA synchronous=OFF")
        self.connection.execute("PRAGMA temp_store=FILE")
        self.connection.execute(
            "CREATE TABLE triples (s TEXT NOT NULL, p TEXT NOT NULL, k INTEGER NOT NULL, "
            "o TEXT NOT NULL, lang TEXT NOT NULL, dt TEXT NOT NULL)"
        )
        self.count = 0

    def ingest(self, handle: BinaryIO) -> int:
        previous: bytes | None = None
        batch: list[tuple[str, str, int, str, str, str]] = []
        segment_count = 0
        for raw in handle:
            if previous is not None and raw <= previous:
                fail("N-Triples segment is not strictly sorted and duplicate-free")
            previous = raw
            subject, predicate, term = parse_nt_line(raw)
            batch.append(
                (
                    subject,
                    predicate,
                    1 if term.kind == "iri" else 0,
                    term.value,
                    term.language or "",
                    term.datatype or "",
                )
            )
            segment_count += 1
            if len(batch) >= 10_000:
                self.connection.executemany("INSERT INTO triples VALUES (?,?,?,?,?,?)", batch)
                batch.clear()
        if batch:
            self.connection.executemany("INSERT INTO triples VALUES (?,?,?,?,?,?)", batch)
        self.connection.commit()
        self.count += segment_count
        return segment_count

    def finish(self) -> None:
        self.connection.execute("CREATE INDEX triples_sp ON triples(s,p)")
        self.connection.execute("CREATE INDEX triples_po ON triples(p,o)")
        self.connection.commit()

    def objects(self, subject: str, predicate: str) -> list[Term]:
        rows = self.connection.execute(
            "SELECT k,o,lang,dt FROM triples WHERE s=? AND p=? ORDER BY k,o,lang,dt",
            (subject, predicate),
        )
        return [
            Term("iri" if kind else "literal", value, language or None, datatype or None)
            for kind, value, language, datatype in rows
        ]

    def subjects(self, predicate: str, object_iri: str) -> list[str]:
        return [
            row[0]
            for row in self.connection.execute(
                "SELECT s FROM triples WHERE p=? AND k=1 AND o=? ORDER BY s",
                (predicate, object_iri),
            )
        ]

    def close(self) -> None:
        self.connection.close()


@dataclass(frozen=True)
class RegistryEntry:
    data: dict[str, Any]
    pattern: tuple[str, ...]

    @property
    def entry_id(self) -> str:
        return str(self.data["entryId"])

    @property
    def role(self) -> str:
        return str(self.data["artifactRole"])

    @property
    def strategy(self) -> str:
        return str(self.data["rdfMapping"]["strategy"])

    @property
    def reverse_mode(self) -> str:
        return str(self.data["reverseMapping"]["mode"])


class Registry:
    def __init__(self, raw: bytes) -> None:
        if sha256_bytes(raw) != SUPPORTED_REGISTRY_SHA256:
            fail("embedded field registry is not the compiler-pinned v1 registry")
        try:
            value = require_object(json.loads(raw), "field registry")
        except (UnicodeError, json.JSONDecodeError) as error:
            raise ReverseCompilerError("embedded field registry is not strict JSON") from error
        entries = require_list(value.get("entries"), "field registry entries")
        if (
            value.get("registryId") != SUPPORTED_REGISTRY_ID
            or value.get("version") != SUPPORTED_REGISTRY_VERSION
            or len(entries) != EXPECTED_REGISTRY_ENTRIES
        ):
            fail("embedded field registry identity/count is unsupported")
        self.value = value
        self.namespaces = {
            str(key): require_string(item, f"namespace {key}")
            for key, item in require_object(value.get("namespaceBindings"), "namespace bindings").items()
        }
        self.by_role: dict[str, list[RegistryEntry]] = defaultdict(list)
        ids: set[str] = set()
        for raw_entry in entries:
            data = require_object(raw_entry, "registry entry")
            entry_id = require_string(data.get("entryId"), "registry entry ID")
            if entry_id in ids:
                fail(f"duplicate registry entry ID: {entry_id}")
            ids.add(entry_id)
            entry = RegistryEntry(data, decode_pointer(require_string(data.get("pathPattern"), entry_id)))
            if not entry.pattern or entry.pattern[-1] in {"*", "**"}:
                fail(f"registry entry lacks a literal terminal field: {entry_id}")
            self.by_role[entry.role].append(entry)
        self.generated_ids = frozenset(
            entry.entry_id
            for role_entries in self.by_role.values()
            for entry in role_entries
            if entry.strategy == "excluded-generated"
        )

    def iri(self, compact: str) -> str:
        prefix, separator, local = compact.partition(":")
        if not separator or prefix not in self.namespaces:
            fail(f"unknown compact IRI in field registry: {compact!r}")
        return self.namespaces[prefix] + local

    def children(self, role: str, parent: Sequence[str]) -> list[RegistryEntry]:
        matches = [
            entry
            for entry in self.by_role.get(role, ())
            if pointer_matches(entry.pattern[:-1], parent)
        ]
        # The registry contract rejects equal-specificity overlaps; sorting is
        # deterministic and keeps parent resources ahead of their descendants.
        return sorted(matches, key=lambda entry: (entry.pattern[-1], entry.entry_id))

    def direct(self, role: str, concrete: Sequence[str]) -> RegistryEntry | None:
        matches = [
            entry
            for entry in self.by_role.get(role, ())
            if pointer_matches(entry.pattern, concrete)
        ]
        if not matches:
            return None
        def specificity(item: RegistryEntry) -> tuple[int, int, int]:
            return (
                sum(segment not in {"*", "**"} for segment in item.pattern),
                -sum(segment == "**" for segment in item.pattern),
                len(item.pattern),
            )
        best = max(specificity(item) for item in matches)
        selected = [item for item in matches if specificity(item) == best]
        if len(selected) != 1:
            fail(f"ambiguous registry path for {role}:{'/'.join(concrete)}")
        return selected[0]


@dataclass
class Artifact:
    logical_id: str
    index_role: str
    role: str
    normalized_bytes: int
    normalized_sha256: str
    record_sha256: str
    root_iri: str
    document: dict[str, Any] = field(default_factory=dict)
    subjects: dict[tuple[str, ...], str] = field(default_factory=dict)
    attempted: set[tuple[tuple[str, ...], str]] = field(default_factory=set)


def literal_value(term: Term, entry: RegistryEntry) -> Any:
    if term.kind != "literal":
        fail(f"{entry.entry_id} expected an RDF literal")
    allowed = require_list(entry.data["dataType"].get("jsonTypes"), f"{entry.entry_id} types")
    target_types = set(str(item) for item in allowed)
    if "array" in target_types:
        item_types = set(str(item) for item in entry.data["dataType"].get("itemJsonTypes", []))
        target_types = item_types
    if "boolean" in target_types:
        if term.value not in {"true", "false"}:
            fail(f"{entry.entry_id} has a non-canonical boolean")
        return term.value == "true"
    if "integer" in target_types:
        try:
            value = int(term.value)
        except ValueError as error:
            raise ReverseCompilerError(f"{entry.entry_id} has an invalid integer") from error
        if abs(value) > 9_007_199_254_740_991:
            fail(f"{entry.entry_id} integer exceeds JSON safe range")
        return value
    if "number" in target_types:
        if re.fullmatch(r"-?(?:0|[1-9][0-9]*)", term.value):
            value = int(term.value)
            if abs(value) > 9_007_199_254_740_991:
                fail(f"{entry.entry_id} number exceeds JSON safe integer range")
            return value
        try:
            value = float(term.value)
        except ValueError as error:
            raise ReverseCompilerError(f"{entry.entry_id} has an invalid number") from error
        if not (float("-inf") < value < float("inf")):
            fail(f"{entry.entry_id} has a non-finite number")
        return value
    if "null" in target_types and term.value == "null":
        return None
    return term.value


def set_at(document: dict[str, Any], path: Sequence[str], value: Any) -> None:
    cursor: Any = document
    for segment in path[:-1]:
        if isinstance(cursor, list):
            cursor = cursor[int(segment)]
        elif isinstance(cursor, dict):
            if segment not in cursor:
                cursor[segment] = {}
            cursor = cursor[segment]
        else:
            fail(f"cannot materialize JSON path {'/'.join(path)}")
    final = path[-1]
    if isinstance(cursor, list):
        index = int(final)
        if index >= len(cursor):
            fail(f"array path is outside reconstructed bounds: {'/'.join(path)}")
        cursor[index] = value
    else:
        cursor[final] = value


def value_at(document: Any, path: Sequence[str]) -> Any:
    cursor = document
    for segment in path:
        if isinstance(cursor, list):
            cursor = cursor[int(segment)]
        elif isinstance(cursor, dict) and segment in cursor:
            cursor = cursor[segment]
        else:
            return None
    return cursor


def walk_objects(value: Any, path: tuple[str, ...] = ()) -> Iterable[tuple[tuple[str, ...], dict[str, Any]]]:
    if isinstance(value, dict):
        yield path, value
        for key in sorted(value):
            yield from walk_objects(value[key], (*path, key))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from walk_objects(child, (*path, str(index)))


class ArtifactReconstructor:
    def __init__(self, store: TripleStore, registry: Registry, base_iri: str) -> None:
        self.store = store
        self.registry = registry
        self.base_iri = base_iri

    def _ancestor_subject(
        self,
        artifact: Artifact,
        path: Sequence[str],
        marker: str,
    ) -> str:
        candidates: list[tuple[str, ...]] = []
        if marker in {"goalIri", "examGoalIri"}:
            if len(path) >= 2 and path[0] == "goals":
                candidates.append(("goals", path[1]))
        elif marker == "compositionNodeIri":
            candidates.extend(tuple(path[:length]) for length in range(len(path), 1, -1))
        elif marker == "assetIri":
            if len(path) >= 2 and path[0] == "resources":
                candidates.append(("resources", path[1]))
        elif marker == "sourceCollectionIri":
            if len(path) >= 2 and path[0] == "collections":
                candidates.append(("collections", path[1]))
        elif marker == "sourceDocumentIri":
            if "documents" in path:
                at = path.index("documents")
                candidates.append(tuple(path[: at + 2]))
        elif marker == "sourceGoalIri":
            if "sourceGoals" in path:
                at = path.index("sourceGoals")
                candidates.append(tuple(path[: at + 2]))
            elif "edges" in path:
                edge_path = tuple(path[: path.index("edges") + 2])
                edge = value_at(artifact.document, edge_path)
                if isinstance(edge, dict) and isinstance(edge.get("sourceGoalId"), str):
                    return self.base_iri + "/source-goal/" + js_uri_component(edge["sourceGoalId"])
        elif marker == "mappingEdgeIri":
            if "edges" in path:
                at = path.index("edges")
                candidates.append(tuple(path[: at + 2]))
        for candidate in candidates:
            if candidate in artifact.subjects:
                return artifact.subjects[candidate]
        fail(f"cannot resolve {{{marker}}} for {artifact.role}:{'/'.join(path)}")
        raise AssertionError

    def _record_subject(self, artifact: Artifact, parent: tuple[str, ...]) -> str:
        if parent in artifact.subjects:
            return artifact.subjects[parent]
        if artifact.role == "canonical-landscape" and len(parent) >= 2 and parent[0] == "goals":
            goal = self._ancestor_subject(artifact, parent, "goalIri")
            tail = parent[2:]
            if tail == ("examData",):
                subject = goal + "/assessment"
            elif tail == ("examData", "scoring"):
                subject = goal + "/scoring"
            else:
                pointer = "" if not tail else "/" + "/".join(
                    item.replace("~", "~0").replace("/", "~1") for item in tail
                )
                subject = goal + "/record/" + js_uri_component(pointer or "/")
            artifact.subjects[parent] = subject
            return subject
        if artifact.role not in {"canonical-landscape", "composition-view", "card-deck"}:
            pointer = "" if not parent else "/" + "/".join(
                item.replace("~", "~0").replace("/", "~1") for item in parent
            )
            subject = artifact.root_iri + "/record/" + js_uri_component(pointer or "/")
            artifact.subjects[parent] = subject
            return subject
        fail(f"missing RDF record subject for {artifact.role}:{'/'.join(parent)}")
        raise AssertionError

    def _template(
        self,
        artifact: Artifact,
        parent: tuple[str, ...],
        template: str,
    ) -> str:
        replacements = {
            "{recordIri}": self._record_subject(artifact, parent) if "{recordIri}" in template else "",
            "{landscapeIri}": artifact.root_iri if "{landscapeIri}" in template else "",
            "{viewIri}": artifact.root_iri if "{viewIri}" in template else "",
            "{deckIri}": artifact.root_iri if "{deckIri}" in template else "",
        }
        for marker in (
            "goalIri",
            "examGoalIri",
            "compositionNodeIri",
            "assetIri",
            "sourceCollectionIri",
            "sourceDocumentIri",
            "sourceGoalIri",
            "mappingEdgeIri",
        ):
            token = "{" + marker + "}"
            replacements[token] = self._ancestor_subject(artifact, parent, marker) if token in template else ""
        result = template
        for token, replacement in replacements.items():
            result = result.replace(token, replacement)
        # Language only occurs on Core text resources.  The owner edge is used
        # for inversion, so unresolved language templates are never queried.
        if "{language}" in result:
            fail(f"language-dependent subject must be inverted through its owner edge: {template}")
        if re.search(r"\{[^}]+\}", result):
            fail(f"unsupported registry template: {template}")
        return result

    def _construction(self, entry: RegistryEntry, key: str = "construction") -> dict[str, Any] | None:
        value = entry.data["rdfMapping"].get(key)
        return require_object(value, f"{entry.entry_id}.{key}") if value is not None else None

    def _field_state(self, artifact: Artifact, parent: tuple[str, ...], entry: RegistryEntry) -> bool:
        subject = self._record_subject(artifact, parent)
        for term in self.store.objects(subject, SP_FIELD_STATE):
            if term.kind != "literal":
                fail("sp:fieldState must be a literal")
            try:
                state = json.loads(term.value)
            except json.JSONDecodeError as error:
                raise ReverseCompilerError("sp:fieldState is not canonical JSON") from error
            if (
                isinstance(state, dict)
                and state.get("entryId") == entry.entry_id
                and state.get("field") == entry.pattern[-1]
                and state.get("state") == "present-empty-array"
            ):
                return True
        return False

    def _stable_id(self, iri: str, entry: RegistryEntry) -> str:
        dependency = require_object(entry.data.get("dependencySemantics"), f"{entry.entry_id} dependency")
        target_kind = dependency.get("targetKind")
        marker = {
            "goal": "/goal/",
            "landscape": "/landscape/",
            "competency-entry": "/competency/",
        }.get(target_kind)
        if marker and marker in iri:
            return urllib.parse.unquote(iri.rsplit(marker, 1)[1])
        values = self.store.objects(iri, LP_VALUE)
        if len(values) == 1 and values[0].kind == "literal":
            return values[0].value
        # Stable IDs for mapping edges are encoded in their released IRIs.
        if target_kind == "resource" and "/resource/" in iri:
            return urllib.parse.unquote(iri.rsplit("/resource/", 1)[1])
        fail(f"cannot recover stable ID for {entry.entry_id}: {iri}")
        raise AssertionError

    def _recover_literal(
        self,
        artifact: Artifact,
        parent: tuple[str, ...],
        entry: RegistryEntry,
        construction: dict[str, Any],
    ) -> Any:
        subject = self._template(artifact, parent, require_string(construction.get("subjectTemplate"), entry.entry_id))
        predicate = self.registry.iri(require_string(construction.get("predicate"), entry.entry_id))
        terms = self.store.objects(subject, predicate)
        if not terms:
            return [] if self._field_state(artifact, parent, entry) else MISSING
        values = [literal_value(term, entry) for term in terms]
        json_types = set(str(item) for item in entry.data["dataType"]["jsonTypes"])
        if "array" in json_types:
            if entry.data.get("classification") == "set":
                values.sort(key=canonical_compact)
            return values
        if len(values) != 1:
            fail(f"ambiguous RDF literals for {entry.entry_id}")
        return values[0]

    def _recover_language_resource(
        self,
        artifact: Artifact,
        parent: tuple[str, ...],
        entry: RegistryEntry,
        construction: dict[str, Any],
    ) -> Any:
        predicate = self.registry.iri(require_string(construction.get("predicate"), entry.entry_id))
        if construction.get("resourceClass"):
            owner_template = require_string(construction.get("ownerSubjectTemplate"), entry.entry_id)
            owner = self._template(artifact, parent, owner_template)
            owner_predicate = self.registry.iri(require_string(construction.get("ownerPredicate"), entry.entry_id))
            resources = [term.value for term in self.store.objects(owner, owner_predicate) if term.kind == "iri"]
            values = [term for resource in resources for term in self.store.objects(resource, predicate)]
        else:
            subject = self._template(artifact, parent, require_string(construction.get("subjectTemplate"), entry.entry_id))
            values = self.store.objects(subject, predicate)
        if not values:
            return MISSING
        if len(values) != 1:
            fail(f"ambiguous language resources for {entry.entry_id}")
        return literal_value(values[0], entry)

    def _recover_canonical_json(
        self,
        artifact: Artifact,
        parent: tuple[str, ...],
        entry: RegistryEntry,
    ) -> Any:
        contract = require_object(entry.data["rdfMapping"].get("canonicalJsonLiteral"), entry.entry_id)
        subject = self._record_subject(artifact, parent)
        predicate = self.registry.iri(require_string(contract.get("predicate"), entry.entry_id))
        terms = self.store.objects(subject, predicate)
        if not terms:
            return MISSING
        if len(terms) != 1 or terms[0].kind != "literal":
            fail(f"ambiguous canonical JSON literal for {entry.entry_id}")
        try:
            return json.loads(terms[0].value)
        except json.JSONDecodeError as error:
            raise ReverseCompilerError(f"invalid canonical JSON literal for {entry.entry_id}") from error

    def _recover_memberships(
        self,
        artifact: Artifact,
        parent: tuple[str, ...],
        entry: RegistryEntry,
        construction: dict[str, Any],
    ) -> tuple[Any, list[str | None]] | object:
        membership = require_object(construction.get("membership"), f"{entry.entry_id} membership")
        owner = self._template(artifact, parent, require_string(construction.get("subjectTemplate"), entry.entry_id))
        owner_predicate = self.registry.iri(require_string(membership.get("ownerPredicate"), entry.entry_id))
        position_predicate = self.registry.iri(require_string(membership.get("positionPredicate"), entry.entry_id))
        value_predicate = self.registry.iri(require_string(membership.get("valuePredicate"), entry.entry_id))
        members = [term.value for term in self.store.objects(owner, owner_predicate) if term.kind == "iri"]
        if not members:
            return ([], []) if self._field_state(artifact, parent, entry) else MISSING
        positioned: list[tuple[int, Any, str | None]] = []
        item_types = set(str(item) for item in entry.data["dataType"].get("itemJsonTypes", []))
        separate = require_string(membership.get("membershipClass"), entry.entry_id).endswith("Membership")
        base = int(membership.get("positionBase", 0))
        for member in members:
            positions = self.store.objects(member, position_predicate)
            if len(positions) != 1 or positions[0].kind != "literal":
                fail(f"missing or ambiguous position for {entry.entry_id}")
            try:
                position = int(positions[0].value) - base
            except ValueError as error:
                raise ReverseCompilerError(f"invalid membership position for {entry.entry_id}") from error
            target = member
            if separate:
                targets = self.store.objects(member, value_predicate)
                if len(targets) != 1 or targets[0].kind != "iri":
                    fail(f"missing or ambiguous membership value for {entry.entry_id}")
                target = targets[0].value
            if "object" in item_types:
                positioned.append((position, {}, target))
            else:
                positioned.append((position, self._stable_id(target, entry), None))
        positioned.sort(key=lambda item: item[0])
        if [item[0] for item in positioned] != list(range(len(positioned))):
            fail(f"non-contiguous positions for {entry.entry_id}")
        return [item[1] for item in positioned], [item[2] for item in positioned]

    def _mapping_edges(
        self,
        artifact: Artifact,
        parent: tuple[str, ...],
        entry: RegistryEntry,
        owner_predicate: str,
    ) -> list[str]:
        collection = value_at(artifact.document, parent)
        if not isinstance(collection, dict) or not isinstance(collection.get("sourceCollectionId"), str):
            return []
        collection_iri = self.base_iri + "/source-collection/" + js_uri_component(collection["sourceCollectionId"])
        source_goals = [
            term.value
            for term in self.store.objects(collection_iri, SP + "hasSourceGoal")
            if term.kind == "iri"
        ]
        return sorted(
            {
                term.value
                for source_goal in source_goals
                for term in self.store.objects(source_goal, owner_predicate)
                if term.kind == "iri"
            }
        )

    def _recover_resource(
        self,
        artifact: Artifact,
        parent: tuple[str, ...],
        entry: RegistryEntry,
        construction: dict[str, Any],
    ) -> tuple[Any, list[str | None]] | object:
        owner_template = require_string(
            construction.get("ownerSubjectTemplate") or construction.get("subjectTemplate"),
            entry.entry_id,
        )
        owner_predicate = self.registry.iri(
            require_string(construction.get("ownerPredicate") or construction.get("predicate"), entry.entry_id)
        )
        if entry.entry_id == "source-mapping.edges":
            resources = self._mapping_edges(artifact, parent, entry, owner_predicate)
        else:
            owner = self._template(artifact, parent, owner_template)
            resources = [term.value for term in self.store.objects(owner, owner_predicate) if term.kind == "iri"]
        json_types = set(str(item) for item in entry.data["dataType"]["jsonTypes"])
        if "array" in json_types:
            if not resources:
                return ([], []) if self._field_state(artifact, parent, entry) else MISSING
            return [{} for _ in resources], resources
        if not resources:
            return MISSING
        if len(resources) != 1:
            fail(f"ambiguous resource record for {entry.entry_id}")
        return {}, [resources[0]]

    def _recover_iri_reference(
        self,
        artifact: Artifact,
        parent: tuple[str, ...],
        entry: RegistryEntry,
        construction: dict[str, Any],
    ) -> Any:
        subject = self._template(artifact, parent, require_string(construction.get("subjectTemplate"), entry.entry_id))
        predicate = self.registry.iri(require_string(construction.get("predicate"), entry.entry_id))
        targets = [term.value for term in self.store.objects(subject, predicate) if term.kind == "iri"]
        json_types = set(str(item) for item in entry.data["dataType"]["jsonTypes"])
        if not targets:
            return [] if self._field_state(artifact, parent, entry) else MISSING
        values = [self._stable_id(target, entry) for target in targets]
        if "array" in json_types:
            values.sort(key=canonical_compact)
            return values
        if len(values) != 1:
            fail(f"ambiguous IRI reference for {entry.entry_id}")
        return values[0]

    def _assign_subjects(
        self,
        artifact: Artifact,
        field_path: tuple[str, ...],
        value: Any,
        subjects: list[str | None],
    ) -> None:
        if not subjects:
            return
        if isinstance(value, list):
            if len(value) != len(subjects):
                fail(f"internal subject cardinality mismatch at {'/'.join(field_path)}")
            for index, (item, subject) in enumerate(zip(value, subjects, strict=True)):
                if isinstance(item, dict) and subject is not None:
                    artifact.subjects[(*field_path, str(index))] = subject
        elif isinstance(value, dict) and subjects and subjects[0] is not None:
            artifact.subjects[field_path] = subjects[0]

    def reconstruct(self, artifact: Artifact) -> dict[str, Any]:
        artifact.subjects[()] = artifact.root_iri
        progress = True
        while progress:
            progress = False
            for parent, record in list(walk_objects(artifact.document)):
                for entry in self.registry.children(artifact.role, parent):
                    field_name = entry.pattern[-1]
                    key = (parent, entry.entry_id)
                    if key in artifact.attempted or field_name in record:
                        continue
                    if (
                        entry.entry_id == "source-mapping.edges"
                        and "sourceCollectionId" not in record
                    ):
                        # The Core reference owner is the source-goal resource,
                        # which is selected through this collection identity.
                        continue
                    artifact.attempted.add(key)
                    if entry.strategy == "excluded-generated":
                        continue
                    construction = self._construction(entry)
                    mode = entry.reverse_mode
                    recovered: Any
                    subjects: list[str | None] = []
                    if mode == "canonical-json-parse":
                        recovered = self._recover_canonical_json(artifact, parent, entry)
                    elif mode in {"scalar-literal", "binary-index-join"}:
                        if construction is None:
                            fail(f"{entry.entry_id} lacks an RDF construction")
                        recovered = self._recover_literal(artifact, parent, entry, construction)
                    elif mode == "iri-to-stable-id":
                        if construction is None:
                            fail(f"{entry.entry_id} lacks an RDF construction")
                        recovered = self._recover_iri_reference(artifact, parent, entry, construction)
                    elif mode == "ordered-memberships":
                        if construction is None:
                            fail(f"{entry.entry_id} lacks an RDF construction")
                        result = self._recover_memberships(artifact, parent, entry, construction)
                        if result is MISSING:
                            recovered = MISSING
                        else:
                            assert isinstance(result, tuple)
                            recovered, subjects = result
                    elif mode == "resource-record":
                        if construction is None:
                            fail(f"{entry.entry_id} lacks an RDF construction")
                        if construction.get("objectMapping") == "language-literal":
                            recovered = self._recover_language_resource(artifact, parent, entry, construction)
                            if recovered is MISSING:
                                fallback = self._construction(entry, "fallbackConstruction")
                                if fallback is not None:
                                    recovered = self._recover_language_resource(artifact, parent, entry, fallback)
                        else:
                            result = self._recover_resource(artifact, parent, entry, construction)
                            if result is MISSING:
                                recovered = MISSING
                            else:
                                assert isinstance(result, tuple)
                                recovered, subjects = result
                    elif mode == "omitted-generated":
                        continue
                    else:
                        fail(f"unsupported reverse mode: {mode}")
                    if recovered is MISSING:
                        continue
                    field_path = (*parent, field_name)
                    set_at(artifact.document, field_path, recovered)
                    self._assign_subjects(artifact, field_path, recovered, subjects)
                    # Canonical JSON parents can contain direct RDF descendants
                    # whose record IRIs are deterministic but not linked.
                    if artifact.role == "canonical-landscape":
                        for child_path, _ in walk_objects(recovered, field_path):
                            if child_path not in artifact.subjects and len(child_path) >= 2 and child_path[0] == "goals":
                                try:
                                    self._record_subject(artifact, child_path)
                                except ReverseCompilerError:
                                    pass
                    progress = True

        missing: list[str] = []
        for parent, record in walk_objects(artifact.document):
            for entry in self.registry.children(artifact.role, parent):
                if entry.strategy == "excluded-generated" or entry.pattern[-1] in record:
                    continue
                if entry.data.get("cardinality", {}).get("presence") == "required":
                    missing.append(entry.entry_id + "@/" + "/".join(parent))
        if missing:
            fail(f"required RDF fields are missing in {artifact.logical_id}: {', '.join(missing[:12])}")
        self._sort_sets(artifact.role, artifact.document)
        raw = canonical_compact(artifact.document)
        if len(raw) != artifact.normalized_bytes or sha256_bytes(raw) != artifact.normalized_sha256:
            fail(
                f"normalized semantic oracle mismatch for {artifact.logical_id}: "
                f"got {len(raw)}/{sha256_bytes(raw)}, expected "
                f"{artifact.normalized_bytes}/{artifact.normalized_sha256}"
            )
        return artifact.document

    def _sort_sets(self, role: str, value: Any, path: tuple[str, ...] = ()) -> None:
        if isinstance(value, dict):
            for key in list(value):
                self._sort_sets(role, value[key], (*path, key))
        elif isinstance(value, list):
            for index, child in enumerate(value):
                self._sort_sets(role, child, (*path, str(index)))
            entry = self.registry.direct(role, path)
            if entry is not None and entry.data.get("classification") == "set":
                value.sort(key=canonical_compact)


# Every excluded field in registry 1.2.0 has one explicit compatibility recipe.
# The table is intentionally closed and checked against the hash-pinned registry;
# a new generated field therefore cannot silently receive a guessed default.
GENERATED_FIELD_RECIPES = {
    "report.generated-at": "unused-authoring-report",
    "card-deck.format-version": "format-1.0",
    "card-deck.schema": "schema-card-deck",
    "card-index.artifact-path": "artifact-path-deck",
    "card-index.format-version": "format-1.0",
    "card-index.schema": "schema-card-index",
    "closure.closure-digest": "digest-closure",
    "closure.definition-index-digest": "digest-definition-index",
    "closure.release-content-digest": "content-digest",
    "composition-view-index.format-version": "format-1.0",
    "composition-view-index.schema": "schema-composition-view-index",
    "composition-view.format-version": "format-1.0",
    "composition-view.schema": "schema-composition-view",
    "dependency-closure.format-version": "format-1.0",
    "dependency-closure.schema": "schema-dependency-closure",
    "landscape.format-version": "format-1.0",
    "landscape.schema": "schema-compiled-landscape",
    "migration-aliases.format-version": "format-1.0",
    "migration-aliases.schema": "schema-migration-aliases",
    "migration.current-content-digest": "content-digest",
    "migration.current-definition-index-digest": "digest-definition-index",
    "migration.digest": "digest-migration",
    "resource-index.format-version": "format-1.0",
    "resource-index.schema": "schema-resource-index",
    "resource.artifact-path": "artifact-path-resource",
    "runtime-catalog.catalog-version": "format-1.0",
    "runtime-catalog.schema": "schema-runtime-catalog",
    "runtime.artifact-index-cards-path": "path-card-index",
    "runtime.artifact-index-composition-views-path": "path-view-index",
    "runtime.artifact-index-migration-aliases-path": "path-migration-aliases",
    "runtime.artifact-index-resources-path": "path-resource-index",
    "runtime.content-digest": "content-digest",
    "runtime.deck-artifact-path": "artifact-path-deck",
    "runtime.dependency-closure-path": "path-dependency-closure",
    "runtime.landscape-artifact-path": "artifact-path-landscape",
    "runtime.resource-artifact-path": "artifact-path-resource",
    "runtime.view-artifact-path": "artifact-path-view",
    "view-index.artifact-path": "artifact-path-view",
    "official-source.schema": "schema-official-source-index",
    "official-source.format-version": "format-1.0",
    "official-source.collection-count": "count-collections",
    "official-source.document-count": "count-source-documents",
    "official-source.collection-document-count": "count-documents",
    "source-goal.schema": "schema-source-goal-reference-index",
    "source-goal.format-version": "format-1.0",
    "source-goal.collection-count": "count-collections",
    "source-goal.total-count": "count-source-goals",
    "source-goal.collection-goal-count": "count-source-goals-local",
    "source-goal.lineage-part-count": "count-lineage-parts",
    "source-mapping.schema": "schema-source-to-canonical-mappings",
    "source-mapping.format-version": "format-1.0",
    "source-mapping.collection-count": "count-collections",
    "source-mapping.edge-count": "count-mapping-edges",
    "source-mapping.collection-edge-count": "count-edges",
    "quality.schema": "schema-release-quality-evidence",
    "quality.format-version": "format-1.0",
    "quality.total-decision-count": "count-quality-decisions",
    "quality.semantic-atomicity-decision-count": "count-semantic-decisions",
    "quality.semantic-atomicity-value": "derive-semantic-atomic",
    "quality.memory-cards-goal-decision-count": "count-memory-goals",
    "quality.memory-cards-active-card-decision-count": "count-active-cards",
    "quality.memory-goal-useful": "derive-memory-useful",
    "quality.goal-visualizations-decision-count": "count-visual-decisions",
    "quality.goal-visualizations-missing-goal-count": "count-missing-visual-goals",
    "quality.goal-visualizations-approved-count": "count-approved-visuals",
    "quality.goal-visualizations-open-count": "count-open-visuals",
}

SCHEMA_IDS = {
    name: f"https://skillpilot.com/schemas/curriculum-package/v1/{name}.schema.json"
    for name in (
        "card-deck",
        "card-index",
        "compiled-landscape",
        "composition-view-index",
        "composition-view",
        "dependency-closure",
        "migration-aliases",
        "official-source-index",
        "release-quality-evidence",
        "resource-index",
        "runtime-catalog",
        "source-goal-reference-index",
        "source-to-canonical-mappings",
    )
}


class FwuPackage:
    def __init__(self, path: Path, validation_report: Path | None) -> None:
        self.path = path
        try:
            self.zip = zipfile.ZipFile(path, "r", allowZip64=False)
        except (OSError, zipfile.BadZipFile) as error:
            raise ReverseCompilerError(f"cannot open FWU-OWL ZIP: {error}") from error
        names = self.zip.namelist()
        manifest_names = [name for name in names if name.endswith("/metadata/manifest.json")]
        if len(manifest_names) != 1:
            fail("FWU-OWL ZIP must contain exactly one rooted metadata/manifest.json")
        self.root = manifest_names[0].split("/", 1)[0]
        if not self.root.endswith(".fwu-owl"):
            fail("FWU-OWL archive root has the wrong suffix")
        if len(names) != len(set(names)) or names != sorted(names):
            fail("FWU-OWL ZIP entries must be unique and path-sorted")
        for name in names:
            if not name.startswith(self.root + "/"):
                fail("FWU-OWL ZIP has an entry outside its archive root")
            safe_package_path(name[len(self.root) + 1 :])
        self.zip_bytes, self.zip_sha256 = sha256_file(path)
        self.manifest_raw = self.read("metadata/manifest.json")
        try:
            self.manifest = require_object(json.loads(self.manifest_raw), "FWU-OWL manifest")
        except (UnicodeError, json.JSONDecodeError) as error:
            raise ReverseCompilerError("FWU-OWL manifest is not strict JSON") from error
        if (
            self.manifest.get("variant") != "fwu-owl"
            or self.manifest.get("releaseProfile") != "fwu-owl-v1"
            or self.manifest.get("archiveRoot") != self.root
            or self.manifest.get("releaseId")
            != f"{self.manifest.get('packageId')}@{self.manifest.get('packageVersion')}"
        ):
            fail("FWU-OWL manifest identity is invalid")
        self.manifest_sha256 = sha256_bytes(self.manifest_raw)
        if validation_report is not None:
            self._bind_validation_report(validation_report)

    def _bind_validation_report(self, path: Path) -> None:
        try:
            report = require_object(json.loads(path.read_bytes()), "FWU-OWL validation report")
        except (OSError, UnicodeError, json.JSONDecodeError) as error:
            raise ReverseCompilerError(f"cannot read FWU-OWL validation report: {error}") from error
        input_record = require_object(report.get("input"), "validation report input")
        package_record = require_object(report.get("package"), "validation report package")
        assert_clean_validation_receipt(report)
        if (
            report.get("status") != "valid"
            or report.get("validatorId") != "skillpilot-fwu-owl-package-validator-v1"
            or input_record.get("bytes") != self.zip_bytes
            or input_record.get("sha256") != self.zip_sha256
            or package_record.get("manifestSha256") != self.manifest_sha256
            or package_record.get("releaseId") != self.manifest.get("releaseId")
            or package_record.get("contentDigest") != self.manifest.get("contentDigest")
        ):
            fail("validation report does not bind the exact valid FWU-OWL ZIP")

    def read(self, relative: str) -> bytes:
        safe_package_path(relative)
        try:
            return self.zip.read(self.root + "/" + relative)
        except (KeyError, OSError, zipfile.BadZipFile) as error:
            raise ReverseCompilerError(f"cannot read FWU-OWL entry {relative}: {error}") from error

    def open(self, relative: str) -> BinaryIO:
        safe_package_path(relative)
        try:
            return self.zip.open(self.root + "/" + relative, "r")
        except (KeyError, OSError, zipfile.BadZipFile) as error:
            raise ReverseCompilerError(f"cannot open FWU-OWL entry {relative}: {error}") from error

    def close(self) -> None:
        self.zip.close()


def assert_clean_validation_receipt(report: Mapping[str, Any]) -> None:
    gates = report.get("gates")
    if (
        report.get("reportFormatVersion") != 1
        or report.get("diagnostics") != []
        or not isinstance(gates, list)
        or [item.get("id") if isinstance(item, dict) else None for item in gates]
        != list(FWU_VALIDATION_GATES)
        or any(not isinstance(item, dict) or item.get("status") != "passed" for item in gates)
    ):
        fail("FWU-OWL validation receipt is not the exact clean ordered 18-gate receipt")


@dataclass
class Reconstruction:
    package: FwuPackage
    registry: Registry
    semantic_index_raw: bytes
    semantic_index: dict[str, Any]
    artifacts: list[Artifact]
    normalized_documents: dict[str, dict[str, Any]]
    documents: dict[str, dict[str, Any]]
    artifact_paths: dict[str, str]
    definition_profile: dict[str, Any]


def load_artifacts(package: FwuPackage, semantic_index: dict[str, Any]) -> list[Artifact]:
    records = require_list(semantic_index.get("logicalArtifacts"), "semantic logical artifacts")
    if not records:
        fail("semantic index must contain at least one logical artifact")
    release_id = require_string(package.manifest.get("releaseId"), "releaseId")
    base = "https://skillpilot.de/id/curriculum-package/" + js_uri_component(release_id)
    result: list[Artifact] = []
    ids: set[str] = set()
    for value in records:
        record = require_object(value, "semantic logical artifact")
        logical_id = require_string(record.get("logicalId"), "logicalId")
        index_role = require_string(record.get("role"), "logical artifact role")
        role = ROLE_ALIASES.get(index_role, index_role)
        if logical_id in ids:
            fail(f"duplicate logical ID in semantic index: {logical_id}")
        ids.add(logical_id)
        if role == "canonical-landscape":
            root = base + "/landscape/" + js_uri_component(logical_id)
        elif role == "composition-view":
            root = base + "/view/" + js_uri_component(logical_id)
        elif role == "card-deck":
            root = base + "/deck/" + js_uri_component(logical_id)
        else:
            root = base + "/artifact/" + js_uri_component(role) + "/" + js_uri_component(logical_id)
        normalized_bytes = record.get("normalizedBytes")
        normalized_sha = record.get("normalizedSha256")
        if (
            not isinstance(normalized_bytes, int)
            or normalized_bytes <= 0
            or not isinstance(normalized_sha, str)
            or not SHA256_RE.fullmatch(normalized_sha)
        ):
            fail(f"invalid normalized oracle for {logical_id}")
        result.append(
            Artifact(
                logical_id,
                index_role,
                role,
                normalized_bytes,
                normalized_sha,
                require_string(record.get("recordSha256"), "recordSha256"),
                root,
            )
        )
    return sorted(result, key=lambda item: item.logical_id)


def reconstruct_normalized(
    package: FwuPackage,
    registry: Registry,
    artifacts: list[Artifact],
    temporary: Path,
) -> dict[str, dict[str, Any]]:
    store = TripleStore(temporary / "asserted-rdf.sqlite")
    try:
        segments = require_list(package.manifest.get("rdfSegments"), "RDF segments")
        records = {require_string(item.get("segmentId"), "segment ID"): item for item in map(require_object, segments, ["segment"] * len(segments))}
        for segment_id in SEGMENT_ORDER:
            record = require_object(records.get(segment_id), f"RDF segment {segment_id}")
            path = require_string(record.get("path"), f"RDF segment {segment_id} path")
            digest = hashlib.sha256()

            class DigestingReader:
                def __init__(self, wrapped: BinaryIO) -> None:
                    self.wrapped = wrapped

                def __iter__(self) -> "DigestingReader":
                    return self

                def __next__(self) -> bytes:
                    raw = next(self.wrapped)
                    digest.update(raw)
                    return raw

            with package.open(path) as handle:
                count = store.ingest(DigestingReader(handle))  # type: ignore[arg-type]
            if count != record.get("triples") or digest.hexdigest() != record.get("sha256"):
                fail(f"asserted RDF segment binding differs: {segment_id}")
        store.finish()
        base = "https://skillpilot.de/id/curriculum-package/" + js_uri_component(
            require_string(package.manifest.get("releaseId"), "releaseId")
        )
        compiler = ArtifactReconstructor(store, registry, base)
        result: dict[str, dict[str, Any]] = {}
        # Source-goal membership triples are indexed before mappings are
        # reconstructed; artifact order itself remains deterministic.
        for artifact in artifacts:
            result[artifact.logical_id] = compiler.reconstruct(artifact)
        return result
    finally:
        store.close()


def derive_artifact_paths(
    artifacts: Sequence[Artifact],
    normalized: Mapping[str, dict[str, Any]],
) -> dict[str, str]:
    closure_artifact = next((item for item in artifacts if item.role == "dependency-closure"), None)
    if closure_artifact is None:
        fail("dependency closure artifact is missing")
    closure = normalized[closure_artifact.logical_id]
    paths: dict[str, str] = {}
    for value in require_list(closure.get("definitions"), "closure definitions"):
        binding = require_object(require_object(value, "definition").get("artifactBinding"), "artifact binding")
        logical_id = require_string(binding.get("logicalId"), "artifact binding logicalId")
        path = safe_package_path(require_string(binding.get("path"), "artifact binding path"))
        if logical_id in paths and paths[logical_id] != path:
            fail(f"conflicting artifact paths for {logical_id}")
        paths[logical_id] = path
    artifact_ids = {item.logical_id for item in artifacts}
    expected_closure_ids = {
        item.logical_id for item in artifacts if item.role not in SINGLETON_PATHS
    }
    if not expected_closure_ids.issubset(paths):
        fail("dependency closure does not recover every non-singleton logical artifact path")
    artifacts_by_id = {item.logical_id: item for item in artifacts}
    for logical_id in set(paths) - expected_closure_ids:
        artifact = artifacts_by_id.get(logical_id)
        singleton = None if artifact is None else SINGLETON_PATHS.get(artifact.role)
        if singleton is None or paths[logical_id] != singleton:
            fail("dependency closure contains an invalid singleton logical artifact path")
    for artifact in artifacts:
        if artifact.logical_id in paths:
            continue
        singleton = SINGLETON_PATHS.get(artifact.role)
        if singleton is None:
            fail(f"no released artifact path for {artifact.logical_id}")
        paths[artifact.logical_id] = singleton
    if len(paths) != len(artifacts) or set(paths) != artifact_ids:
        fail("logical artifact path recovery is incomplete")
    if len(set(paths.values())) != len(paths):
        fail("logical artifact paths are not one-to-one")
    return paths


def definition_index_digest(closure: Mapping[str, Any], profile: Mapping[str, Any]) -> str:
    definitions = sorted(
        require_list(closure.get("definitions"), "closure definitions"),
        key=lambda item: canonical_compact(require_object(item, "definition").get("key")),
    )
    values = [require_string(profile["definitionIndexDigest"].get("domain"), "definition index domain")]
    for value in definitions:
        definition = require_object(value, "definition")
        values.extend(
            (
                canonical_compact(require_object(definition.get("key"), "definition key")).decode("utf-8"),
                require_string(definition.get("ownerPackageId"), "definition owner"),
                require_string(definition.get("definitionDigest"), "definition digest"),
            )
        )
    return framed_digest(values, prefixed=True)


def generated_document_digest(
    normalized: Mapping[str, Any], profile: Mapping[str, Any], field_name: str
) -> str:
    domain = require_string(require_object(profile.get(field_name), field_name).get("domain"), field_name)
    return framed_digest([domain, canonical_compact(normalized).decode("utf-8")], prefixed=True)


def artifact_by_role(artifacts: Sequence[Artifact], role: str) -> Artifact:
    matches = [item for item in artifacts if item.role == role]
    if len(matches) != 1:
        fail(f"expected one {role} artifact, found {len(matches)}")
    return matches[0]


def assign_resource_artifact_paths(
    resources: Sequence[Any], binary_by_id: Mapping[str, str], label: str
) -> None:
    for value in resources:
        resource = require_object(value, label)
        resource_id = require_string(resource.get("resourceId"), f"{label} resourceId")
        if resource_id in binary_by_id:
            resource["artifactPath"] = binary_by_id[resource_id]
        elif resource.get("delivery") != "external":
            fail(f"embedded {label} lacks a binary sidecar join: {resource_id}")


def populate_generated_fields(
    package: FwuPackage,
    registry: Registry,
    artifacts: Sequence[Artifact],
    normalized: Mapping[str, dict[str, Any]],
    paths: Mapping[str, str],
    definition_profile: Mapping[str, Any],
) -> dict[str, dict[str, Any]]:
    if registry.generated_ids != frozenset(GENERATED_FIELD_RECIPES):
        fail("generated-field compatibility table does not exactly cover the pinned registry")
    documents = {logical_id: copy.deepcopy(value) for logical_id, value in normalized.items()}
    content_digest = require_string(package.manifest.get("contentDigest"), "content digest")
    if not CONTENT_DIGEST_RE.fullmatch(content_digest):
        fail("FWU-OWL content digest is invalid")
    closure_artifact = artifact_by_role(artifacts, "dependency-closure")
    closure = documents[closure_artifact.logical_id]
    definition_digest = definition_index_digest(closure, definition_profile)
    closure["$schema"] = SCHEMA_IDS["dependency-closure"]
    closure["closureFormatVersion"] = "1.0"
    closure["definitionIndexDigest"] = definition_digest
    require_object(closure.get("releaseBinding"), "closure releaseBinding")["contentDigest"] = content_digest
    closure["closureDigest"] = generated_document_digest(
        normalized[closure_artifact.logical_id], definition_profile, "closureDigest"
    )

    schemas_and_versions = {
        "canonical-landscape": ("$schema", SCHEMA_IDS["compiled-landscape"], "landscapeFormatVersion"),
        "card-deck": ("$schema", SCHEMA_IDS["card-deck"], "deckFormatVersion"),
        "card-index": ("$schema", SCHEMA_IDS["card-index"], "indexFormatVersion"),
        "composition-view": ("$schema", SCHEMA_IDS["composition-view"], "viewFormatVersion"),
        "composition-view-index": ("$schema", SCHEMA_IDS["composition-view-index"], "indexFormatVersion"),
        "migration-aliases": ("$schema", SCHEMA_IDS["migration-aliases"], "migrationFormatVersion"),
        "resource-index": ("$schema", SCHEMA_IDS["resource-index"], "indexFormatVersion"),
        "runtime-catalog": ("$schema", SCHEMA_IDS["runtime-catalog"], "catalogVersion"),
        "official-source-index": ("$schema", SCHEMA_IDS["official-source-index"], "sourceIndexFormatVersion"),
        "source-goal-reference-index": (
            "$schema",
            SCHEMA_IDS["source-goal-reference-index"],
            "sourceGoalReferenceFormatVersion",
        ),
        "source-to-canonical-mappings": (
            "$schema",
            SCHEMA_IDS["source-to-canonical-mappings"],
            "mappingFormatVersion",
        ),
        "release-quality-evidence": (
            "$schema",
            SCHEMA_IDS["release-quality-evidence"],
            "qualityEvidenceFormatVersion",
        ),
    }
    for artifact in artifacts:
        if artifact.role in schemas_and_versions:
            schema_field, schema_id, version_field = schemas_and_versions[artifact.role]
            documents[artifact.logical_id][schema_field] = schema_id
            documents[artifact.logical_id][version_field] = "1.0"

    migration_artifact = artifact_by_role(artifacts, "migration-aliases")
    migration = documents[migration_artifact.logical_id]
    current = require_object(migration.get("currentRelease"), "migration currentRelease")
    current["contentDigest"] = content_digest
    current["definitionIndexDigest"] = definition_digest
    migration["migrationDigest"] = generated_document_digest(
        normalized[migration_artifact.logical_id], definition_profile, "migrationDigest"
    )

    binary_by_id: dict[str, str] = {}
    for value in require_list(package.manifest.get("files"), "FWU manifest files"):
        record = require_object(value, "FWU manifest file")
        binding = record.get("semanticBinding")
        if isinstance(binding, dict) and binding.get("kind") == "binary-resource":
            resource_id = require_string(binding.get("resourceId"), "binary resourceId")
            binary_by_id[resource_id] = safe_package_path(require_string(record.get("path"), "binary path"))
    raw_binary_count = require_object(
        package.manifest.get("semanticContentIndex"), "semantic index binding"
    ).get("binaryResourceCount")
    expected_binary_count = raw_binary_count if isinstance(raw_binary_count, int) else -1
    if expected_binary_count < 0 or len(binary_by_id) != expected_binary_count:
        fail("FWU manifest binary sidecars differ from the semantic index binding")

    resource_artifact = artifact_by_role(artifacts, "resource-index")
    resource_index = documents[resource_artifact.logical_id]
    assign_resource_artifact_paths(
        require_list(resource_index.get("resources"), "resources"),
        binary_by_id,
        "resource index resource",
    )

    deck_path: dict[tuple[str, str], str] = {}
    view_path: dict[str, str] = {}
    landscape_path: dict[str, str] = {}
    for artifact in artifacts:
        document = documents[artifact.logical_id]
        if artifact.role == "card-deck":
            deck_path[(require_string(document.get("deckId"), "deckId"), require_string(document.get("language"), "deck language"))] = paths[artifact.logical_id]
        elif artifact.role == "composition-view":
            view_path[require_string(document.get("viewId"), "viewId")] = paths[artifact.logical_id]
        elif artifact.role == "canonical-landscape":
            landscape_path[require_string(document.get("landscapeId"), "landscapeId")] = paths[artifact.logical_id]

    card_index = documents[artifact_by_role(artifacts, "card-index").logical_id]
    for deck in map(require_object, require_list(card_index.get("decks"), "card index decks"), ["deck"] * len(card_index.get("decks", []))):
        key = (require_string(deck.get("deckId"), "deckId"), require_string(deck.get("language"), "deck language"))
        deck["artifactPath"] = deck_path[key]
    view_index = documents[artifact_by_role(artifacts, "composition-view-index").logical_id]
    for view in map(require_object, require_list(view_index.get("views"), "view index views"), ["view"] * len(view_index.get("views", []))):
        view["artifactPath"] = view_path[require_string(view.get("viewId"), "viewId")]

    runtime = documents[artifact_by_role(artifacts, "runtime-catalog").logical_id]
    require_object(runtime.get("artifactIndexes"), "artifact indexes").update(
        {
            "cardsPath": SINGLETON_PATHS["card-index"],
            "compositionViewsPath": SINGLETON_PATHS["composition-view-index"],
            "migrationAliasesPath": SINGLETON_PATHS["migration-aliases"],
            "resourcesPath": SINGLETON_PATHS["resource-index"],
        }
    )
    require_object(runtime.get("dependencyClosure"), "runtime dependency closure")["path"] = SINGLETON_PATHS[
        "dependency-closure"
    ]
    require_object(runtime.get("releaseBinding"), "runtime release binding")["contentDigest"] = content_digest
    for deck in map(require_object, require_list(runtime.get("decks"), "runtime decks"), ["deck"] * len(runtime.get("decks", []))):
        deck["artifactPath"] = deck_path[(require_string(deck.get("deckId"), "runtime deckId"), require_string(deck.get("locale"), "runtime deck locale"))]
    for landscape in map(require_object, require_list(runtime.get("landscapes"), "runtime landscapes"), ["landscape"] * len(runtime.get("landscapes", []))):
        landscape["artifactPath"] = landscape_path[require_string(landscape.get("landscapeId"), "runtime landscapeId")]
    for view in map(require_object, require_list(runtime.get("views"), "runtime views"), ["view"] * len(runtime.get("views", []))):
        view["artifactPath"] = view_path[require_string(view.get("viewId"), "runtime viewId")]
    assign_resource_artifact_paths(
        require_list(runtime.get("resources"), "runtime resources"),
        binary_by_id,
        "runtime resource",
    )

    official = documents[artifact_by_role(artifacts, "official-source-index").logical_id]
    official_collections = require_list(official.get("collections"), "official collections")
    official["sourceCollectionCount"] = len(official_collections)
    official["sourceDocumentCount"] = sum(len(require_list(require_object(item, "collection").get("documents"), "documents")) for item in official_collections)
    for item in official_collections:
        collection = require_object(item, "official collection")
        collection["documentCount"] = len(require_list(collection.get("documents"), "documents"))

    source_goal = documents[artifact_by_role(artifacts, "source-goal-reference-index").logical_id]
    source_collections = require_list(source_goal.get("collections"), "source collections")
    source_goal["sourceCollectionCount"] = len(source_collections)
    source_goal["sourceGoalCount"] = sum(len(require_list(require_object(item, "collection").get("sourceGoals"), "source goals")) for item in source_collections)
    for item in source_collections:
        collection = require_object(item, "source collection")
        goals = require_list(collection.get("sourceGoals"), "source goals")
        collection["sourceGoalCount"] = len(goals)
        groups: dict[str, int] = defaultdict(int)
        for goal in goals:
            lineage = require_object(goal, "source goal").get("lineage")
            if isinstance(lineage, dict) and isinstance(lineage.get("splitFromSourceGoalId"), str):
                groups[lineage["splitFromSourceGoalId"]] += 1
        for goal in goals:
            lineage = require_object(goal, "source goal").get("lineage")
            if isinstance(lineage, dict) and isinstance(lineage.get("splitFromSourceGoalId"), str):
                lineage["splitPartCount"] = groups[lineage["splitFromSourceGoalId"]]

    mappings = documents[artifact_by_role(artifacts, "source-to-canonical-mappings").logical_id]
    mapping_collections = require_list(mappings.get("collections"), "mapping collections")
    mappings["mappingCollectionCount"] = len(mapping_collections)
    mappings["mappingEdgeCount"] = sum(len(require_list(require_object(item, "collection").get("edges"), "edges")) for item in mapping_collections)
    for item in mapping_collections:
        collection = require_object(item, "mapping collection")
        collection["mappingEdgeCount"] = len(require_list(collection.get("edges"), "edges"))

    quality = documents[artifact_by_role(artifacts, "release-quality-evidence").logical_id]
    lanes = require_object(quality.get("lanes"), "quality lanes")
    semantic_lane = require_object(lanes.get("semanticAtomicity"), "semanticAtomicity")
    semantic_decisions = require_list(semantic_lane.get("decisions"), "semantic decisions")
    semantic_lane["decisionCount"] = len(semantic_decisions)
    for item in semantic_decisions:
        decision = require_object(item, "semantic decision")
        decision["semanticAtomic"] = decision.get("status") == "atomic"
    memory_lane = require_object(lanes.get("memoryCards"), "memoryCards")
    goal_decisions = require_list(memory_lane.get("goalDecisions"), "memory goal decisions")
    active_decisions = require_list(memory_lane.get("activeCardDecisions"), "active card decisions")
    memory_lane["goalDecisionCount"] = len(goal_decisions)
    memory_lane["activeCardDecisionCount"] = len(active_decisions)
    for item in goal_decisions:
        decision = require_object(item, "memory decision")
        decision["memoryUseful"] = decision.get("status") == "memory_required"
    visual_lane = require_object(lanes.get("goalVisualizations"), "goalVisualizations")
    visual_decisions = require_list(visual_lane.get("decisions"), "visual decisions")
    missing_goal_ids = require_list(visual_lane.get("missingGoalIds"), "missing visual goal IDs")
    visual_lane["decisionCount"] = len(visual_decisions)
    visual_lane["missingGoalCount"] = len(missing_goal_ids)
    visual_lane["approvedCount"] = sum(require_object(item, "visual decision").get("status") == "human-approved" for item in visual_decisions)
    visual_lane["openCount"] = sum(require_object(item, "visual decision").get("status") != "human-approved" for item in visual_decisions)
    quality["qualityDecisionCount"] = len(semantic_decisions) + len(goal_decisions) + len(active_decisions) + len(visual_decisions)
    return documents


def reconstruct(package: FwuPackage, temporary: Path) -> Reconstruction:
    registry_binding = require_object(
        require_object(package.manifest.get("contractBindings"), "contract bindings").get("fieldSemanticsRegistry"),
        "field registry binding",
    )
    registry_raw = package.read(require_string(registry_binding.get("path"), "field registry path"))
    if sha256_bytes(registry_raw) != registry_binding.get("sha256"):
        fail("embedded field registry differs from its manifest binding")
    registry = Registry(registry_raw)
    semantic_binding = require_object(package.manifest.get("semanticContentIndex"), "semantic index binding")
    semantic_raw = package.read(require_string(semantic_binding.get("path"), "semantic index path"))
    if len(semantic_raw) != semantic_binding.get("bytes") or sha256_bytes(semantic_raw) != semantic_binding.get("sha256"):
        fail("semantic-content index differs from its manifest binding")
    try:
        semantic_index = require_object(json.loads(semantic_raw), "semantic-content index")
    except (UnicodeError, json.JSONDecodeError) as error:
        raise ReverseCompilerError("semantic-content index is not strict JSON") from error
    if (
        semantic_index.get("contentDigest") != package.manifest.get("contentDigest")
        or semantic_index.get("fieldSemanticsRegistry", {}).get("sha256") != SUPPORTED_REGISTRY_SHA256
        or len(require_list(semantic_index.get("binaryResources"), "binary resources"))
        != package.manifest.get("semanticContentIndex", {}).get("binaryResourceCount")
    ):
        fail("semantic-content index identity/count differs from FWU-OWL manifest")
    artifacts = load_artifacts(package, semantic_index)
    normalized = reconstruct_normalized(package, registry, artifacts, temporary)
    paths = derive_artifact_paths(artifacts, normalized)
    definition_binding = require_object(
        require_object(package.manifest.get("contractBindings"), "contract bindings").get("definitionDigestProfile"),
        "definition profile binding",
    )
    definition_raw = package.read(require_string(definition_binding.get("path"), "definition profile path"))
    if sha256_bytes(definition_raw) != definition_binding.get("sha256"):
        fail("definition-digest profile differs from its manifest binding")
    definition_profile = require_object(json.loads(definition_raw), "definition-digest profile")
    documents = populate_generated_fields(
        package, registry, artifacts, normalized, paths, definition_profile
    )
    return Reconstruction(
        package,
        registry,
        semantic_raw,
        semantic_index,
        artifacts,
        normalized,
        documents,
        paths,
        definition_profile,
    )


LOGICAL_SCHEMA_BY_ROLE = {
    "canonical-landscape": SCHEMA_IDS["compiled-landscape"],
    "card-deck": SCHEMA_IDS["card-deck"],
    "card-index": SCHEMA_IDS["card-index"],
    "composition-view": SCHEMA_IDS["composition-view"],
    "composition-view-index": SCHEMA_IDS["composition-view-index"],
    "dependency-closure": SCHEMA_IDS["dependency-closure"],
    "mapping": SCHEMA_IDS["source-to-canonical-mappings"],
    "migration-aliases": SCHEMA_IDS["migration-aliases"],
    "quality-evidence": SCHEMA_IDS["release-quality-evidence"],
    "resource-index": SCHEMA_IDS["resource-index"],
    "runtime-catalog": SCHEMA_IDS["runtime-catalog"],
    "source-goal-reference-index": SCHEMA_IDS["source-goal-reference-index"],
    "source-index": SCHEMA_IDS["official-source-index"],
}
LOGICAL_PROVENANCE_BY_ROLE = {
    "canonical-landscape": "skillpilot-authored",
    "card-deck": "skillpilot-authored",
    "card-index": "generated-metadata",
    "composition-view": "skillpilot-authored",
    "composition-view-index": "generated-metadata",
    "dependency-closure": "generated-metadata",
    "mapping": "skillpilot-authored",
    "migration-aliases": "skillpilot-authored",
    "quality-evidence": "generated-metadata",
    "resource-index": "generated-metadata",
    "runtime-catalog": "generated-metadata",
    "source-goal-reference-index": "official-source-metadata",
    "source-index": "official-source-metadata",
}
RUNTIME_LOGICAL_ROLES = {
    "canonical-landscape",
    "card-deck",
    "card-index",
    "composition-view",
    "composition-view-index",
    "dependency-closure",
    "migration-aliases",
    "resource-index",
    "runtime-catalog",
}
SEMANTIC_CONTRACT_SCHEMA_IDS = {
    "semanticNormalForm": "https://skillpilot.com/schemas/curriculum-package/v1/semantic-normalization-profile.schema.json",
    "fieldSemanticsRegistry": "https://skillpilot.com/schemas/curriculum-package/v1/field-semantics-registry.schema.json",
    "definitionDigestProfile": "https://skillpilot.com/schemas/curriculum-package/v1/definition-digest-profile.schema.json",
    "curriculumOntologyProfile": "https://skillpilot.com/schemas/curriculum-package/v1/curriculum-ontology-profile.schema.json",
    "publicationEvidenceProfile": "https://skillpilot.com/schemas/curriculum-package/v1/publication-evidence-projection.schema.json",
}


def integrity(raw: bytes) -> dict[str, Any]:
    return {"bytes": len(raw), "sha256": sha256_bytes(raw)}


def excluded_record(
    path: str,
    role: str,
    media_type: str,
    raw: bytes,
    *,
    runtime_required: bool,
    license_expression: str | None,
    provenance: str,
    redistribution: str,
    validation_schema_id: str | None = None,
) -> dict[str, Any]:
    record: dict[str, Any] = {
        "path": path,
        "role": role,
        "mediaType": media_type,
        **integrity(raw),
        "runtimeRequired": runtime_required,
    }
    if validation_schema_id is not None:
        record["validationSchemaId"] = validation_schema_id
    record.update(
        {
            "licenseExpression": license_expression,
            "provenanceClass": provenance,
            "redistributionStatus": redistribution,
            "semanticBinding": {"kind": "excluded-generated"},
        }
    )
    return record


def build_schema_catalog(schema_payloads: Mapping[str, bytes]) -> bytes:
    entries: list[dict[str, Any]] = []
    for path, raw in sorted(schema_payloads.items()):
        try:
            schema = require_object(json.loads(raw), f"schema {path}")
        except (UnicodeError, json.JSONDecodeError) as error:
            raise ReverseCompilerError(f"package-local schema is invalid JSON: {path}") from error
        entries.append(
            {
                "id": require_string(schema.get("$id"), f"schema ID {path}"),
                "path": path,
                "dialect": require_string(schema.get("$schema"), f"schema dialect {path}"),
                **integrity(raw),
            }
        )
    entries.sort(key=lambda item: str(item["id"]))
    return canonical_pretty(
        {
            "$schema": "https://skillpilot.com/schemas/curriculum-package/v1/schema-catalog.schema.json",
            "catalogFormatVersion": 1,
            "entries": entries,
        }
    )


def read_support_payloads(
    reconstruction: Reconstruction,
) -> tuple[dict[str, bytes], list[dict[str, Any]], dict[str, bytes]]:
    package = reconstruction.package
    payloads: dict[str, bytes] = {}
    records: list[dict[str, Any]] = []
    schemas: dict[str, bytes] = {}
    for value in require_list(package.manifest.get("releaseSupport"), "release support"):
        support = require_object(value, "release support record")
        support_type = require_string(support.get("supportType"), "release support type")
        target = safe_package_path(require_string(support.get("targetPath"), "release support target"))
        raw = package.read(require_string(support.get("path"), "release support path"))
        if len(raw) != support.get("bytes") or sha256_bytes(raw) != support.get("sha256"):
            fail(f"release support differs from its FWU binding: {target}")
        if target in payloads:
            fail(f"duplicate release support target: {target}")
        payloads[target] = raw
        if support_type == "json-contract-schema":
            schemas[target] = raw
            record = excluded_record(
                target,
                "schema",
                "application/schema+json",
                raw,
                runtime_required=True,
                license_expression="Apache-2.0",
                provenance="software-contract",
                redistribution="allowed",
            )
        elif support_type == "json-release-profile":
            record = excluded_record(
                target,
                "release-profile",
                "application/json",
                raw,
                runtime_required=True,
                license_expression="Apache-2.0",
                provenance="software-contract",
                redistribution="allowed",
            )
        elif support_type == "assessment-source":
            record = excluded_record(
                target,
                "package-documentation",
                "text/markdown",
                raw,
                runtime_required=False,
                license_expression=None,
                provenance="skillpilot-authored",
                redistribution="review-required",
            )
        elif support_type in {
            "redistribution-review",
            "source-verification-review",
            "source-verification-status",
        }:
            record = excluded_record(
                target,
                "provenance-report",
                require_string(support.get("mediaType"), "review media type"),
                raw,
                runtime_required=False,
                license_expression=None,
                provenance=(
                    "generated-metadata"
                    if support_type == "redistribution-review"
                    else "official-source-metadata"
                ),
                redistribution="review-required",
            )
        else:
            fail(f"unsupported FWU reverse-support type: {support_type}")
        records.append(record)
    return payloads, records, schemas


def build_readme(reconstruction: Reconstruction, support_payloads: Mapping[str, bytes]) -> bytes:
    landscape = reconstruction.documents[
        artifact_by_role(reconstruction.artifacts, "canonical-landscape").logical_id
    ]
    redistribution = require_object(
        json.loads(support_payloads["metadata/provenance/redistribution-review.json"]),
        "redistribution review",
    )
    source_review = require_object(
        json.loads(support_payloads["metadata/provenance/source-verification-review.json"]),
        "source verification review",
    )
    redistribution_summary = require_object(redistribution.get("summary"), "redistribution summary")
    source_summary = require_object(source_review.get("summary"), "source verification summary")
    package = reconstruction.package.manifest
    return (
        f"# SkillPilot curriculum package: {landscape.get('subject')} "
        f"({landscape.get('schoolType')}, {landscape.get('country')})\n\n"
        f"This directory is the JSON runtime variant of `{package['releaseId']}`.\n\n"
        f"- Package ID: `{package['packageId']}`\n"
        f"- Package version: `{package['packageVersion']}`\n"
        f"- Semantic content digest: `{package['contentDigest']}`\n"
        "- Runtime entry point: `data/runtime/catalog.json`\n"
        "- Release profile: `full-standalone-v1`\n"
        f"- Redistribution review ready: `{str(bool(redistribution_summary.get('publicationReady'))).lower()}`\n"
        f"- Open redistribution review items: `{redistribution_summary.get('humanReviewItemCount')}`\n"
        f"- Open source-text verification items: `{source_summary.get('pendingHumanReviewCount')}`\n\n"
        "The package is self-contained at the file level. Consumers must validate "
        "`metadata/manifest.json`, `metadata/SHA256SUMS`, the package-local schema "
        "catalog, and all runtime closure rules before installation. A technically "
        "valid candidate with pending redistribution decisions is not approved for public release.\n"
    ).encode("utf-8")


@dataclass(frozen=True)
class BinaryPayload:
    path: str
    source_path: str
    record: dict[str, Any]


@dataclass
class PackagePlan:
    archive_root: str
    payloads: dict[str, bytes]
    binaries: list[BinaryPayload]
    manifest: dict[str, Any]
    manifest_raw: bytes
    checksums_raw: bytes


def build_package_plan(reconstruction: Reconstruction) -> PackagePlan:
    package = reconstruction.package
    source_binding = require_object(package.manifest.get("sourceJsonPackage"), "source JSON binding")
    source_file = require_string(source_binding.get("file"), "source JSON filename")
    if not source_file.endswith(".json.zip") or "/" in source_file:
        fail("FWU sourceJsonPackage.file is not one portable *.json.zip name")
    archive_root = source_file[:-4]
    payloads, records, schema_payloads = read_support_payloads(reconstruction)

    for artifact in reconstruction.artifacts:
        path = reconstruction.artifact_paths[artifact.logical_id]
        raw = canonical_pretty(reconstruction.documents[artifact.logical_id])
        payloads[path] = raw
        record: dict[str, Any] = {
            "path": path,
            "role": artifact.index_role,
            "mediaType": "application/json",
            **integrity(raw),
            "runtimeRequired": artifact.index_role in RUNTIME_LOGICAL_ROLES,
            "validationSchemaId": LOGICAL_SCHEMA_BY_ROLE[artifact.index_role],
            "licenseExpression": None,
            "provenanceClass": LOGICAL_PROVENANCE_BY_ROLE[artifact.index_role],
            "redistributionStatus": "review-required",
            "semanticBinding": {
                "kind": "logical-artifact",
                "logicalId": artifact.logical_id,
                "normalizationRole": artifact.role,
            },
        }
        records.append(record)

    source_contracts = require_object(source_binding.get("semanticContracts"), "source semantic contracts")
    fwu_bindings = require_object(package.manifest.get("contractBindings"), "FWU contract bindings")
    for name, target_value in sorted(source_contracts.items()):
        target_binding = require_object(target_value, f"source semantic contract {name}")
        target = safe_package_path(require_string(target_binding.get("path"), f"{name} target path"))
        fwu_binding = require_object(fwu_bindings.get(name), f"FWU semantic contract {name}")
        raw = package.read(require_string(fwu_binding.get("path"), f"{name} FWU path"))
        if sha256_bytes(raw) != target_binding.get("sha256") or sha256_bytes(raw) != fwu_binding.get("sha256"):
            fail(f"semantic contract bytes differ: {name}")
        payloads[target] = raw
        records.append(
            excluded_record(
                target,
                "semantic-contract",
                "application/json",
                raw,
                runtime_required=True,
                license_expression="Apache-2.0",
                provenance="software-contract",
                redistribution="allowed",
                validation_schema_id=SEMANTIC_CONTRACT_SCHEMA_IDS[name],
            )
        )

    license_documents = require_list(package.manifest.get("licenseDocuments"), "FWU licenses")
    if len(license_documents) != 1:
        fail("FWU package must expose exactly one root license")
    license_id = require_string(require_object(license_documents[0], "license").get("licenseId"), "license ID")
    fwu_license_bindings = require_list(package.manifest.get("licenseDocuments"), "licenses")
    fwu_license_path = require_string(require_object(fwu_license_bindings[0], "license").get("path"), "license path")
    license_raw = package.read(fwu_license_path)
    payloads["LICENSE"] = license_raw
    records.append(
        excluded_record(
            "LICENSE",
            "license",
            "text/plain",
            license_raw,
            runtime_required=False,
            license_expression=license_id,
            provenance="software-contract",
            redistribution="allowed",
        )
    )

    payloads["metadata/semantic-content-index.json"] = reconstruction.semantic_index_raw
    records.append(
        excluded_record(
            "metadata/semantic-content-index.json",
            "semantic-content-index",
            "application/json",
            reconstruction.semantic_index_raw,
            runtime_required=True,
            license_expression=None,
            provenance="generated-metadata",
            redistribution="review-required",
            validation_schema_id="https://skillpilot.com/schemas/curriculum-package/v1/semantic-content-index.schema.json",
        )
    )
    catalog_raw = build_schema_catalog(schema_payloads)
    payloads["schemas/catalog.json"] = catalog_raw
    records.append(
        excluded_record(
            "schemas/catalog.json",
            "schema-catalog",
            "application/json",
            catalog_raw,
            runtime_required=True,
            license_expression="Apache-2.0",
            provenance="software-contract",
            redistribution="allowed",
            validation_schema_id="https://skillpilot.com/schemas/curriculum-package/v1/schema-catalog.schema.json",
        )
    )
    readme = build_readme(reconstruction, payloads)
    payloads["README.md"] = readme
    records.append(
        excluded_record(
            "README.md",
            "package-documentation",
            "text/markdown",
            readme,
            runtime_required=False,
            license_expression=None,
            provenance="generated-metadata",
            redistribution="review-required",
        )
    )

    binaries: list[BinaryPayload] = []
    for value in require_list(package.manifest.get("files"), "FWU files"):
        fwu_record = require_object(value, "FWU file")
        binding = fwu_record.get("semanticBinding")
        if not isinstance(binding, dict) or binding.get("kind") != "binary-resource":
            continue
        path = safe_package_path(require_string(fwu_record.get("path"), "binary path"))
        record = {
            "path": path,
            "role": "binary-asset",
            "mediaType": require_string(fwu_record.get("mediaType"), "binary media type"),
            "bytes": fwu_record.get("bytes"),
            "sha256": fwu_record.get("sha256"),
            "runtimeRequired": True,
            "licenseExpression": fwu_record.get("licenseExpression"),
            "provenanceClass": fwu_record.get("provenanceClass"),
            "redistributionStatus": fwu_record.get("redistributionStatus"),
            "semanticBinding": {
                "kind": "binary-resource",
                "resourceId": require_string(binding.get("resourceId"), "binary resource ID"),
            },
        }
        records.append(record)
        binaries.append(BinaryPayload(path, path, record))

    contract_bindings: dict[str, dict[str, str]] = {}
    schema_bindings = {
        "manifestSchema": "schemas/package-manifest.schema.json",
        "runtimeCatalogSchema": "schemas/runtime-catalog.schema.json",
        "schemaCatalogSchema": "schemas/schema-catalog.schema.json",
    }
    for name, path in schema_bindings.items():
        schema = require_object(json.loads(payloads[path]), f"bound schema {name}")
        contract_bindings[name] = {
            "id": require_string(schema.get("$id"), f"{name} schema ID"),
            "path": path,
            "sha256": sha256_bytes(payloads[path]),
        }
    release_profile_path = require_string(
        require_object(source_binding.get("releaseProfileBinding"), "source release profile").get("path"),
        "source release profile path",
    )
    contract_bindings["releaseProfile"] = {
        "id": "full-standalone-v1",
        "path": release_profile_path,
        "sha256": sha256_bytes(payloads[release_profile_path]),
    }
    for name, value in source_contracts.items():
        binding = require_object(value, f"semantic contract {name}")
        contract_bindings[name] = {
            "id": require_string(binding.get("id"), f"semantic contract {name} ID"),
            "path": require_string(binding.get("path"), f"semantic contract {name} path"),
            "sha256": require_string(binding.get("sha256"), f"semantic contract {name} SHA"),
        }

    records.sort(key=lambda item: str(item["path"]))
    if len({record["path"] for record in records}) != len(records):
        fail("reconstructed manifest inventory has duplicate paths")
    manifest = {
        "$schema": "https://skillpilot.com/schemas/curriculum-package/v1/package-manifest.schema.json",
        "packageFormatVersion": "1.0",
        "runtimeContractVersion": require_string(package.manifest.get("runtimeContractVersion"), "runtime contract"),
        "releaseProfile": "full-standalone-v1",
        "variant": "json",
        "releaseId": require_string(package.manifest.get("releaseId"), "releaseId"),
        "packageId": require_string(package.manifest.get("packageId"), "packageId"),
        "packageVersion": require_string(package.manifest.get("packageVersion"), "packageVersion"),
        "curriculumEdition": require_string(package.manifest.get("curriculumEdition"), "curriculum edition"),
        "contentDigest": require_string(package.manifest.get("contentDigest"), "content digest"),
        "archiveRoot": archive_root,
        "supportedSkillpilotSoftware": require_string(
            source_binding.get("supportedSkillpilotSoftware"), "supported SkillPilot software"
        ),
        "licenseDocuments": [{"licenseId": license_id, "path": "LICENSE"}],
        "contractBindings": contract_bindings,
        "files": records,
    }
    manifest_raw = canonical_pretty(manifest)
    checksums = {
        **{path: sha256_bytes(raw) for path, raw in payloads.items()},
        **{item.path: require_string(item.record.get("sha256"), "binary SHA") for item in binaries},
        "metadata/manifest.json": sha256_bytes(manifest_raw),
    }
    checksums_raw = "".join(
        f"{digest}  {path}\n" for path, digest in sorted(checksums.items())
    ).encode("utf-8")
    return PackagePlan(archive_root, payloads, binaries, manifest, manifest_raw, checksums_raw)


def zip_info(name: str) -> zipfile.ZipInfo:
    info = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
    info.compress_type = zipfile.ZIP_STORED
    info.create_system = 3
    info.create_version = 20
    info.extract_version = 20
    info.external_attr = (stat.S_IFREG | 0o644) << 16
    return info


def iter_plan_paths(plan: PackagePlan) -> list[str]:
    return sorted(
        {
            *plan.payloads,
            *(item.path for item in plan.binaries),
            "metadata/manifest.json",
            "metadata/SHA256SUMS",
        }
    )


def payload_for(plan: PackagePlan, package: FwuPackage, path: str) -> bytes:
    if path == "metadata/manifest.json":
        return plan.manifest_raw
    if path == "metadata/SHA256SUMS":
        return plan.checksums_raw
    if path in plan.payloads:
        return plan.payloads[path]
    binary = next((item for item in plan.binaries if item.path == path), None)
    if binary is None:
        fail(f"internal package payload is missing: {path}")
    raw = package.read(binary.source_path)
    if len(raw) != binary.record.get("bytes") or sha256_bytes(raw) != binary.record.get("sha256"):
        fail(f"binary sidecar changed while reconstructing: {path}")
    return raw


def write_output_zip(plan: PackagePlan, package: FwuPackage, output: Path) -> None:
    if not output.name.endswith(".reconstructed.json.zip"):
        fail("output ZIP filename must end in .reconstructed.json.zip")
    if output.exists() or output.is_symlink():
        fail(f"refusing to replace existing output ZIP: {output}")
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_name(f".{output.name}.tmp-{os.getpid()}")
    try:
        with zipfile.ZipFile(temporary, "x", compression=zipfile.ZIP_STORED, allowZip64=False) as target:
            for path in iter_plan_paths(plan):
                target.writestr(zip_info(plan.archive_root + "/" + path), payload_for(plan, package, path))
        os.replace(temporary, output)
    finally:
        temporary.unlink(missing_ok=True)


def write_zip_into_output_directory(
    plan: PackagePlan, package: FwuPackage, output_directory: Path
) -> Path:
    if output_directory.exists() or output_directory.is_symlink():
        fail(f"refusing to replace existing output directory: {output_directory}")
    output_directory.parent.mkdir(parents=True, exist_ok=True)
    output_directory.mkdir(mode=0o700)
    package_name = plan.archive_root.removesuffix(".json") + ".reconstructed.json.zip"
    output = output_directory / package_name
    try:
        write_output_zip(plan, package, output)
        return output
    except BaseException:
        shutil.rmtree(output_directory, ignore_errors=True)
        raise


def output_report(
    reconstruction: Reconstruction,
    plan: PackagePlan,
    output: Path,
    *,
    output_is_zip: bool,
) -> dict[str, Any]:
    if output_is_zip:
        output_bytes, output_sha = sha256_file(output)
        zip_entries = len(iter_plan_paths(plan))
    else:
        output_bytes = sum((output / path).stat().st_size for path in iter_plan_paths(plan))
        digest = hashlib.sha256()
        for path in iter_plan_paths(plan):
            digest.update(path.encode("utf-8") + b"\0" + (output / path).read_bytes())
        output_sha = digest.hexdigest()
        zip_entries = len(iter_plan_paths(plan))
    binary_bytes = sum(int(item.record["bytes"]) for item in plan.binaries)
    return {
        "reverseCompilerId": REVERSE_COMPILER_ID,
        "reverseCompilerVersion": REVERSE_COMPILER_VERSION,
        "status": "passed",
        "sourceFwuOwl": {
            "bytes": reconstruction.package.zip_bytes,
            "sha256": reconstruction.package.zip_sha256,
            "manifestSha256": reconstruction.package.manifest_sha256,
            "releaseId": reconstruction.package.manifest["releaseId"],
            "contentDigest": reconstruction.package.manifest["contentDigest"],
        },
        "registry": {
            "id": SUPPORTED_REGISTRY_ID,
            "version": SUPPORTED_REGISTRY_VERSION,
            "sha256": SUPPORTED_REGISTRY_SHA256,
            "entryCount": len(
                require_list(reconstruction.registry.value.get("entries"), "registry entries")
            ),
        },
        "normalizedOracle": {
            "status": "passed",
            "expectedCount": len(reconstruction.artifacts),
            "verifiedCount": len(reconstruction.normalized_documents),
            "mismatchCount": 0,
        },
        "output": {
            "path": str(output),
            "archiveRoot": plan.archive_root,
            "bytes": output_bytes,
            "sha256": output_sha,
            "manifestSha256": sha256_bytes(plan.manifest_raw),
            "contentDigest": plan.manifest["contentDigest"],
            "counts": {
                "zipEntries": zip_entries,
                "manifestFiles": len(plan.manifest["files"]),
                "checksumRows": len(plan.checksums_raw.splitlines()),
                "logicalArtifacts": len(reconstruction.artifacts),
                "binaryResources": len(plan.binaries),
                "binaryBytes": binary_bytes,
            },
        },
    }


def atomic_write(path: Path, raw: bytes) -> None:
    if path.exists() or path.is_symlink():
        fail(f"refusing to replace existing report: {path}")
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.tmp-{os.getpid()}")
    try:
        with temporary.open("xb") as handle:
            handle.write(raw)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def self_test() -> None:
    checks = 0

    def check(condition: bool, message: str) -> None:
        nonlocal checks
        if not condition:
            fail(f"self-test failed: {message}")
        checks += 1

    iri = parse_nt_line(b"<https://example.test/s> <https://example.test/p> <https://example.test/o> .\n")
    check(iri[2] == Term("iri", "https://example.test/o"), "IRI term parsing")
    literal = parse_nt_line(
        b'<https://example.test/s> <https://example.test/p> "Gr\\u00fc\\n"@de .\n'
    )
    check(literal[2].value == "Grü\n" and literal[2].language == "de", "literal unescaping")
    try:
        parse_nt_line(b'<a> <b> "\\uD800" .\n')
    except ReverseCompilerError:
        checks += 1
    else:
        fail("self-test failed: surrogate escape was accepted")
    check(decode_pointer("/a~1b/~0c") == ("a/b", "~c"), "RFC-6901 decoding")
    check(pointer_matches(("root", "**", "id"), ("root", "children", "0", "id")), "recursive match")
    check(not pointer_matches(("root", "*", "id"), ("root", "children", "0", "id")), "bounded wildcard")
    check(js_uri_component("a/b @") == "a%2Fb%20%40", "IRI component encoding")
    check(canonical_compact({"z": 1, "a": [True, None]}) == b'{"a":[true,null],"z":1}', "canonical JSON")
    check(framed_digest(["a"]) == hashlib.sha256((1).to_bytes(8, "big") + b"a").hexdigest(), "length framing")
    check(len(GENERATED_FIELD_RECIPES) == 66, "closed generated-field recipe count")
    check(set(GENERATED_FIELD_RECIPES.values()) - {"TODO"} == set(GENERATED_FIELD_RECIPES.values()), "no placeholder recipe")
    check(
        SINGLETON_PATHS
        == {
            "card-index": "data/cards/card-index.json",
            "composition-view-index": "data/views/index.json",
            "dependency-closure": "data/runtime/dependency-closure.json",
            "source-to-canonical-mappings": "data/mappings/source-to-canonical.json",
            "migration-aliases": "data/runtime/migration-aliases.json",
            "resource-index": "data/resources/resource-index.json",
            "runtime-catalog": "data/runtime/catalog.json",
            "source-goal-reference-index": "data/sources/source-goal-references.json",
            "official-source-index": "data/sources/source-index.json",
            "release-quality-evidence": "metadata/quality/release-quality-evidence.json",
        },
        "complete standardized singleton-path contract",
    )
    fixture_artifacts = [
        Artifact(
            logical_id="fixture:closure",
            index_role="dependency-closure",
            role="dependency-closure",
            normalized_bytes=0,
            normalized_sha256="0" * 64,
            record_sha256="0" * 64,
            root_iri="https://example.test/closure",
        ),
        Artifact(
            logical_id="fixture:deck",
            index_role="card-deck",
            role="card-deck",
            normalized_bytes=0,
            normalized_sha256="0" * 64,
            record_sha256="0" * 64,
            root_iri="https://example.test/deck",
        ),
        Artifact(
            logical_id="fixture:resources",
            index_role="resource-index",
            role="resource-index",
            normalized_bytes=0,
            normalized_sha256="0" * 64,
            record_sha256="0" * 64,
            root_iri="https://example.test/resources",
        ),
    ]
    fixture_closure = {
        "definitions": [
            {
                "artifactBinding": {
                    "logicalId": "fixture:deck",
                    "path": "data/cards/decks/fixture.json",
                }
            },
            {
                "artifactBinding": {
                    "logicalId": "fixture:resources",
                    "path": SINGLETON_PATHS["resource-index"],
                }
            },
        ]
    }
    fixture_paths = derive_artifact_paths(
        fixture_artifacts,
        {"fixture:closure": fixture_closure},
    )
    check(
        fixture_paths
        == {
            "fixture:closure": SINGLETON_PATHS["dependency-closure"],
            "fixture:deck": "data/cards/decks/fixture.json",
            "fixture:resources": SINGLETON_PATHS["resource-index"],
        },
        "closure accepts an exact redundant singleton binding",
    )
    invalid_closure = copy.deepcopy(fixture_closure)
    invalid_closure["definitions"][1]["artifactBinding"]["path"] = "data/resources/wrong.json"
    try:
        derive_artifact_paths(fixture_artifacts, {"fixture:closure": invalid_closure})
    except ReverseCompilerError:
        checks += 1
    else:
        fail("self-test failed: closure accepted a conflicting singleton path")
    for unsafe in ("", "/absolute", "../escape", "a//b", "a\\b", "C:/drive"):
        try:
            safe_package_path(unsafe)
        except ReverseCompilerError:
            checks += 1
        else:
            fail(f"self-test failed: unsafe package path accepted: {unsafe!r}")
    check(safe_package_path("data/runtime/catalog.json") == "data/runtime/catalog.json", "safe path")
    with tempfile.TemporaryDirectory() as temporary:
        database = Path(temporary) / "triples.sqlite"
        store = TripleStore(database)
        try:
            from io import BytesIO

            count = store.ingest(
                BytesIO(
                    b"<https://example.test/s> <https://example.test/p> <https://example.test/o> .\n"
                    b'<https://example.test/s> <https://example.test/q> "7"^^<http://www.w3.org/2001/XMLSchema#integer> .\n'
                )
            )
            store.finish()
            check(count == 2, "triple-store count")
            check(store.objects("https://example.test/s", "https://example.test/p") == [Term("iri", "https://example.test/o")], "triple-store SPO")
            check(store.subjects("https://example.test/p", "https://example.test/o") == ["https://example.test/s"], "triple-store POS")
        finally:
            store.close()
    check(zip_info("root/file").date_time == (1980, 1, 1, 0, 0, 0), "deterministic ZIP timestamp")
    check((zip_info("root/file").external_attr >> 16) & 0o777 == 0o644, "deterministic ZIP mode")
    external = {"resourceId": "external", "delivery": "external"}
    embedded = {"resourceId": "embedded", "delivery": "embedded"}
    assign_resource_artifact_paths([external, embedded], {"embedded": "assets/embedded.png"}, "fixture resource")
    check("artifactPath" not in external, "external resource preserves missing artifactPath")
    check(embedded.get("artifactPath") == "assets/embedded.png", "embedded resource binary join")
    try:
        assign_resource_artifact_paths(
            [{"resourceId": "unbound", "delivery": "embedded"}], {}, "fixture resource"
        )
    except ReverseCompilerError:
        checks += 1
    else:
        fail("self-test failed: unbound embedded resource was accepted")
    clean_receipt = {
        "reportFormatVersion": 1,
        "diagnostics": [],
        "gates": [{"id": gate, "status": "passed"} for gate in FWU_VALIDATION_GATES],
    }
    assert_clean_validation_receipt(clean_receipt)
    checks += 1
    dirty_receipt = copy.deepcopy(clean_receipt)
    dirty_receipt["gates"][7]["status"] = "failed"
    try:
        assert_clean_validation_receipt(dirty_receipt)
    except ReverseCompilerError:
        checks += 1
    else:
        fail("self-test failed: non-passing validation receipt was accepted")
    print(f"FWU-OWL reverse compiler self-test passed ({checks} guarantees).")


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--fwu-owl-zip", type=Path)
    parser.add_argument("--validation-report", type=Path)
    outputs = parser.add_mutually_exclusive_group()
    outputs.add_argument("--output-zip", type=Path)
    outputs.add_argument("--output-dir", type=Path)
    parser.add_argument("--report", type=Path)
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    if args.self_test:
        if any(
            value is not None
            for value in (
                args.fwu_owl_zip,
                args.validation_report,
                args.output_zip,
                args.output_dir,
                args.report,
            )
        ):
            fail("--self-test cannot be combined with production arguments")
        self_test()
        return 0
    if (
        args.fwu_owl_zip is None
        or args.validation_report is None
        or (args.output_zip is None and args.output_dir is None)
        or args.report is None
    ):
        fail(
            "production mode requires --fwu-owl-zip, --validation-report, exactly one "
            "of --output-zip/--output-dir, and --report"
        )
    package = FwuPackage(args.fwu_owl_zip, args.validation_report)
    try:
        with tempfile.TemporaryDirectory(prefix="skillpilot-fwu-reverse-") as temporary:
            reconstruction = reconstruct(package, Path(temporary))
            plan = build_package_plan(reconstruction)
            if args.output_zip is not None:
                output = args.output_zip
                write_output_zip(plan, package, output)
            else:
                output = write_zip_into_output_directory(plan, package, args.output_dir)
            report = output_report(reconstruction, plan, output, output_is_zip=True)
            atomic_write(args.report, canonical_pretty(report))
    finally:
        package.close()
    print(
        f"FWU-OWL reverse compilation passed: {len(reconstruction.artifacts)} logical "
        f"artifacts, {len(plan.binaries)} binary resources, {output}"
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ReverseCompilerError as error:
        print(f"reverse compiler error: {error}", file=sys.stderr)
        raise SystemExit(1) from error
