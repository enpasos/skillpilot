#!/usr/bin/env python3
"""Validate the package-local, network-free JSON Schema catalog contract."""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import sys
from collections import Counter
from importlib.metadata import PackageNotFoundError, version as distribution_version
from pathlib import Path
from typing import Any
from urllib.parse import urldefrag, urljoin, urlsplit

sys.dont_write_bytecode = True

from jsonschema import Draft202012Validator
from jsonschema.exceptions import SchemaError
from referencing import Registry, Resource
from referencing.exceptions import NoSuchResource, Unresolvable

from validate_curriculum_package_contracts import (
    JSONSCHEMA_VERSION,
    ContractDefinitionError,
    Diagnostic,
    DuplicateJsonKeyError,
    NonFiniteJsonConstantError,
    NORMATIVE_SCHEMA_FILES,
    TRUSTED_SCHEMA_BINDINGS,
    expect_exact_keys,
    expect_object,
    load_json,
    parse_json_text,
    path_is_safe,
    portable_path_key,
)


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONTRACT_DIR = REPO_ROOT / "contracts" / "curriculum-package" / "v1"
CATALOG_SCHEMA_FILENAME = "schema-catalog.schema.json"
CATALOG_SCHEMA_ID = (
    "https://skillpilot.com/schemas/curriculum-package/v1/schema-catalog.schema.json"
)
DIALECT_ID = "https://json-schema.org/draft/2020-12/schema"
FIXTURE_RELATIVE_DIR = Path("fixtures/schema-catalog")
SCHEMA_CATALOG_PACKAGE_PATH = "schemas/catalog.json"
TRUSTED_SCHEMA_PACKAGE_PATHS = {
    schema_id: f"schemas/{filename}"
    for schema_id, filename in NORMATIVE_SCHEMA_FILES
}

MAX_CATALOG_BYTES = 1024 * 1024
MAX_CATALOG_ENTRIES = 256
MAX_SCHEMA_BYTES = 16 * 1024 * 1024
MAX_TOTAL_SCHEMA_BYTES = 64 * 1024 * 1024
MAX_SCHEMA_DEPTH = 128
MAX_SCHEMA_NODES = 250_000
MAX_SCHEMA_REFERENCES = 10_000
MAX_TOTAL_SCHEMA_NODES = 100_000
MAX_TOTAL_SCHEMA_REFERENCES = 20_000


def sha256_bytes(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


def stable_json_bytes(value: Any) -> bytes:
    return (
        json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        + "\n"
    ).encode("utf-8")


def pointer_location(path: str, pointer: str = "") -> str:
    return f"/{path}{pointer}"


def decode_pointer_token(token: str) -> str:
    return token.replace("~1", "/").replace("~0", "~")


def pointer_parent(document: Any, pointer: str) -> tuple[Any, str]:
    if not pointer.startswith("/"):
        raise ContractDefinitionError(f"Fixture JSON pointer must start with '/': {pointer!r}")
    tokens = [decode_pointer_token(token) for token in pointer[1:].split("/")]
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


def set_pointer(document: Any, pointer: str, value: Any) -> None:
    parent, token = pointer_parent(document, pointer)
    if isinstance(parent, list):
        parent[int(token)] = copy.deepcopy(value)
    else:
        parent[token] = copy.deepcopy(value)


def schema_id_is_canonical(schema_id: str) -> bool:
    try:
        parsed = urlsplit(schema_id)
        port = parsed.port
    except ValueError:
        return False
    path_segments = parsed.path.split("/")
    return (
        parsed.scheme == "https"
        and parsed.netloc == "skillpilot.com"
        and parsed.hostname == "skillpilot.com"
        and port is None
        and parsed.username is None
        and parsed.password is None
        and not parsed.query
        and not parsed.fragment
        and parsed.path.startswith("/schemas/")
        and parsed.path.endswith(".schema.json")
        and parsed.path == parsed.path.lower()
        and all(segment not in {"", ".", ".."} for segment in path_segments[1:])
        and "%" not in schema_id
    )


def resolve_schema_reference(base_id: str, reference: str) -> str | None:
    """Resolve only RFC-3986 forms with unambiguous cross-runtime semantics."""

    try:
        parsed = urlsplit(reference)
    except ValueError:
        return None
    if "?" in reference.split("#", 1)[0]:
        return None
    if parsed.scheme:
        if parsed.scheme != "https" or not reference.startswith("https://"):
            return None
        return reference
    if parsed.netloc or reference.startswith("//"):
        return None
    return urljoin(base_id, reference)


def measure_json(value: Any) -> tuple[int, int, int]:
    nodes = 0
    max_depth = 0
    references = 0
    stack: list[tuple[Any, int]] = [(value, 1)]
    while stack:
        current, depth = stack.pop()
        nodes += 1
        max_depth = max(max_depth, depth)
        if isinstance(current, dict):
            references += sum(key in {"$ref", "$dynamicRef"} for key in current)
            stack.extend((child, depth + 1) for child in current.values())
        elif isinstance(current, list):
            stack.extend((child, depth + 1) for child in current)
    return nodes, max_depth, references


def walk_schema_objects(value: Any, pointer: str = "") -> list[tuple[dict[str, Any], str]]:
    result: list[tuple[dict[str, Any], str]] = []
    stack: list[tuple[Any, str]] = [(value, pointer)]
    while stack:
        current, current_pointer = stack.pop()
        if isinstance(current, dict):
            result.append((current, current_pointer))
            for key, child in reversed(list(current.items())):
                escaped = key.replace("~", "~0").replace("/", "~1")
                stack.append((child, f"{current_pointer}/{escaped}"))
        elif isinstance(current, list):
            for index in range(len(current) - 1, -1, -1):
                stack.append((current[index], f"{current_pointer}/{index}"))
    return result


def schema_error_location(error: Any, package_path: str) -> str:
    pointer = "/" + "/".join(str(part) for part in error.absolute_path)
    return pointer_location(package_path, pointer if pointer != "/" else "")


def load_fixture_package_files(
    fixture_valid_dir: Path,
    trusted_schema_paths: dict[str, Path],
) -> dict[str, bytes]:
    files_root = fixture_valid_dir / "files"
    package_files: dict[str, bytes] = {}
    for schema_id, trusted_path in trusted_schema_paths.items():
        package_path = TRUSTED_SCHEMA_PACKAGE_PATHS[schema_id]
        package_files[package_path] = trusted_path.read_bytes()
    for path in sorted(files_root.rglob("*")):
        if path.is_symlink():
            raise ContractDefinitionError(f"Fixture package file must not be a symlink: {path}")
        if not path.is_file():
            continue
        package_path = path.relative_to(files_root).as_posix()
        if not path_is_safe(package_path):
            raise ContractDefinitionError(f"Unsafe fixture package path: {package_path}")
        if package_path in package_files:
            raise ContractDefinitionError(f"Duplicate fixture package path: {package_path}")
        package_files[package_path] = path.read_bytes()
    return package_files


def validate_catalog(
    catalog: Any,
    catalog_bytes: bytes,
    package_files: dict[str, bytes],
    catalog_schema_validator: Draft202012Validator,
    trusted_schema_bytes: dict[str, bytes],
) -> list[Diagnostic]:
    diagnostics: list[Diagnostic] = []
    if len(catalog_bytes) > MAX_CATALOG_BYTES:
        return [
            Diagnostic(
                "CATALOG_BYTES_LIMIT",
                "/",
                f"Schema catalog exceeds {MAX_CATALOG_BYTES} bytes",
            )
        ]

    if isinstance(catalog, dict):
        raw_entries = catalog.get("entries")
        if isinstance(raw_entries, list) and len(raw_entries) > MAX_CATALOG_ENTRIES:
            return [
                Diagnostic(
                    "CATALOG_ENTRY_COUNT_LIMIT",
                    "/entries",
                    f"Schema catalog contains more than {MAX_CATALOG_ENTRIES} entries",
                )
            ]
        if isinstance(raw_entries, list):
            declared_sizes = [
                entry.get("bytes")
                for entry in raw_entries
                if isinstance(entry, dict)
                and isinstance(entry.get("bytes"), int)
                and not isinstance(entry.get("bytes"), bool)
                and entry.get("bytes") >= 0
            ]
            oversized_locations = [
                index
                for index, entry in enumerate(raw_entries)
                if isinstance(entry, dict)
                and isinstance(entry.get("bytes"), int)
                and not isinstance(entry.get("bytes"), bool)
                and entry.get("bytes") > MAX_SCHEMA_BYTES
            ]
            if oversized_locations:
                return [
                    Diagnostic(
                        "SCHEMA_BYTES_LIMIT",
                        f"/entries/{index}/bytes",
                        f"Schema entry exceeds {MAX_SCHEMA_BYTES} bytes",
                    )
                    for index in oversized_locations
                ]
            if sum(declared_sizes) > MAX_TOTAL_SCHEMA_BYTES:
                return [
                    Diagnostic(
                        "SCHEMA_TOTAL_BYTES_LIMIT",
                        "/entries",
                        f"Declared schema lane exceeds {MAX_TOTAL_SCHEMA_BYTES} bytes",
                    )
                ]

    for error in sorted(
        catalog_schema_validator.iter_errors(catalog),
        key=lambda item: tuple(str(part) for part in item.absolute_path),
    ):
        location = "/" + "/".join(str(part) for part in error.absolute_path)
        diagnostics.append(Diagnostic("CATALOG_SCHEMA", location, error.message))
    if not isinstance(catalog, dict):
        return sorted(diagnostics)

    entries_value = catalog.get("entries")
    entries = (
        [entry for entry in entries_value if isinstance(entry, dict)]
        if isinstance(entries_value, list)
        else []
    )
    ids = [entry.get("id") for entry in entries if isinstance(entry.get("id"), str)]
    paths = [entry.get("path") for entry in entries if isinstance(entry.get("path"), str)]

    if ids != sorted(ids):
        diagnostics.append(
            Diagnostic("CATALOG_ORDER", "/entries", "Catalog entries must be ordered by schema ID")
        )
    for schema_id, count in sorted(Counter(ids).items()):
        if count > 1:
            diagnostics.append(
                Diagnostic("CATALOG_ID_DUPLICATE", "/entries", f"Duplicate schema ID {schema_id!r}")
            )
    for package_path, count in sorted(Counter(paths).items()):
        if count > 1:
            diagnostics.append(
                Diagnostic(
                    "CATALOG_PATH_DUPLICATE",
                    "/entries",
                    f"Duplicate schema path {package_path!r}",
                )
            )

    portable_paths: dict[str, set[str]] = {}
    for index, entry in enumerate(entries):
        schema_id = entry.get("id")
        package_path = entry.get("path")
        if isinstance(schema_id, str) and not schema_id_is_canonical(schema_id):
            diagnostics.append(
                Diagnostic(
                    "CATALOG_ID_NONCANONICAL",
                    f"/entries/{index}/id",
                    f"Schema ID is not a canonical SkillPilot HTTPS identifier: {schema_id!r}",
                )
            )
        if isinstance(package_path, str):
            if not path_is_safe(package_path):
                diagnostics.append(
                    Diagnostic(
                        "CATALOG_PATH_UNSAFE",
                        f"/entries/{index}/path",
                        f"Unsafe package-relative schema path {package_path!r}",
                    )
                )
            portable_paths.setdefault(portable_path_key(package_path), set()).add(package_path)
    for colliding in portable_paths.values():
        if len(colliding) > 1:
            diagnostics.append(
                Diagnostic(
                    "CATALOG_PATH_PORTABLE_COLLISION",
                    "/entries",
                    f"Portable schema path collision: {sorted(colliding)}",
                )
            )
    portable_keys = set(portable_paths)
    for key in sorted(portable_keys):
        segments = key.split("/")
        for length in range(1, len(segments)):
            parent = "/".join(segments[:length])
            if parent in portable_keys:
                diagnostics.append(
                    Diagnostic(
                        "CATALOG_PATH_PREFIX_COLLISION",
                        "/entries",
                        f"Schema path {parent!r} is an ancestor of {key!r}",
                    )
                )

    catalog_paths = set(paths)
    package_paths = set(package_files)
    for missing in sorted(catalog_paths - package_paths):
        diagnostics.append(
            Diagnostic(
                "SCHEMA_FILE_MISSING",
                f"/files/{missing}",
                "Catalog path has no package-local schema file",
            )
        )

    for trusted_schema_id, trusted_bytes in sorted(trusted_schema_bytes.items()):
        trusted_entries = [entry for entry in entries if entry.get("id") == trusted_schema_id]
        if len(trusted_entries) != 1:
            diagnostics.append(
                Diagnostic(
                    "CATALOG_TRUSTED_SCHEMA_MISSING",
                    "/entries",
                    f"Catalog must contain exactly one entry for {trusted_schema_id!r}",
                )
            )
            continue
        trusted_entry = trusted_entries[0]
        trusted_path = trusted_entry.get("path")
        packaged_trusted_schema = (
            package_files.get(trusted_path) if isinstance(trusted_path, str) else None
        )
        if packaged_trusted_schema is not None and (
            packaged_trusted_schema != trusted_bytes
            or trusted_entry.get("sha256") != sha256_bytes(trusted_bytes)
            or trusted_entry.get("bytes") != len(trusted_bytes)
        ):
            diagnostics.append(
                Diagnostic(
                    "CATALOG_TRUSTED_SCHEMA_BINDING_MISMATCH",
                    f"/entries/{entries.index(trusted_entry)}",
                    f"Package-local schema {trusted_schema_id!r} differs from trusted bytes",
                )
            )
    for unlisted in sorted(package_paths - catalog_paths):
        diagnostics.append(
            Diagnostic(
                "SCHEMA_FILE_UNLISTED",
                f"/files/{unlisted}",
                "Package-local schema file is absent from the catalog",
            )
        )

    parsed_schemas: dict[str, tuple[dict[str, Any], str]] = {}
    actual_total_bytes = 0
    actual_total_nodes = 0
    actual_total_references = 0
    for index, entry in enumerate(entries):
        schema_id = entry.get("id")
        package_path = entry.get("path")
        if not isinstance(schema_id, str) or not isinstance(package_path, str):
            continue
        content = package_files.get(package_path)
        if content is None:
            continue
        actual_total_bytes += len(content)
        if len(content) > MAX_SCHEMA_BYTES:
            diagnostics.append(
                Diagnostic(
                    "SCHEMA_ACTUAL_BYTES_LIMIT",
                    f"/files/{package_path}",
                    f"Schema file exceeds {MAX_SCHEMA_BYTES} bytes",
                )
            )
            continue
        if entry.get("bytes") != len(content):
            diagnostics.append(
                Diagnostic(
                    "SCHEMA_FILE_BYTES_MISMATCH",
                    f"/entries/{index}/bytes",
                    f"Catalog declares {entry.get('bytes')!r}, actual file has {len(content)} bytes",
                )
            )
        actual_hash = sha256_bytes(content)
        if entry.get("sha256") != actual_hash:
            diagnostics.append(
                Diagnostic(
                    "SCHEMA_FILE_HASH_MISMATCH",
                    f"/entries/{index}/sha256",
                    "Catalog SHA-256 differs from the package-local schema bytes",
                )
            )
        try:
            parsed = parse_json_text(content.decode("utf-8"))
        except DuplicateJsonKeyError as error:
            diagnostics.append(
                Diagnostic(
                    "SCHEMA_JSON_DUPLICATE_KEY",
                    f"/files/{package_path}",
                    f"Schema contains duplicate JSON object key {error.key!r}",
                )
            )
            continue
        except NonFiniteJsonConstantError as error:
            diagnostics.append(
                Diagnostic(
                    "SCHEMA_JSON_NONFINITE_CONSTANT",
                    f"/files/{package_path}",
                    f"Schema contains non-JSON constant {error.constant!r}",
                )
            )
            continue
        except (UnicodeError, json.JSONDecodeError) as error:
            diagnostics.append(
                Diagnostic(
                    "SCHEMA_JSON_INVALID",
                    f"/files/{package_path}",
                    f"Schema is not strict UTF-8 JSON: {error}",
                )
            )
            continue
        if not isinstance(parsed, dict):
            diagnostics.append(
                Diagnostic(
                    "SCHEMA_DOCUMENT_NOT_OBJECT",
                    f"/files/{package_path}",
                    "JSON Schema document must be an object",
                )
            )
            continue
        nodes, depth, reference_count = measure_json(parsed)
        actual_total_nodes += nodes
        if actual_total_nodes > MAX_TOTAL_SCHEMA_NODES:
            diagnostics.append(
                Diagnostic(
                    "SCHEMA_TOTAL_NODE_LIMIT",
                    "/files",
                    f"Schema catalog exceeds {MAX_TOTAL_SCHEMA_NODES} aggregate JSON nodes",
                )
            )
            return sorted(diagnostics)
        actual_total_references += reference_count
        if actual_total_references > MAX_TOTAL_SCHEMA_REFERENCES:
            diagnostics.append(
                Diagnostic(
                    "SCHEMA_TOTAL_REFERENCE_LIMIT",
                    "/files",
                    f"Schema catalog exceeds {MAX_TOTAL_SCHEMA_REFERENCES} aggregate references",
                )
            )
            return sorted(diagnostics)
        limit_failed = False
        if depth > MAX_SCHEMA_DEPTH:
            diagnostics.append(
                Diagnostic(
                    "SCHEMA_DEPTH_LIMIT",
                    f"/files/{package_path}",
                    f"Schema nesting depth {depth} exceeds {MAX_SCHEMA_DEPTH}",
                )
            )
            limit_failed = True
        if nodes > MAX_SCHEMA_NODES:
            diagnostics.append(
                Diagnostic(
                    "SCHEMA_NODE_LIMIT",
                    f"/files/{package_path}",
                    f"Schema node count {nodes} exceeds {MAX_SCHEMA_NODES}",
                )
            )
            limit_failed = True
        if reference_count > MAX_SCHEMA_REFERENCES:
            diagnostics.append(
                Diagnostic(
                    "SCHEMA_REFERENCE_COUNT_LIMIT",
                    f"/files/{package_path}",
                    f"Schema reference count {reference_count} exceeds {MAX_SCHEMA_REFERENCES}",
                )
            )
            limit_failed = True
        if limit_failed:
            continue
        if parsed.get("$id") != schema_id:
            diagnostics.append(
                Diagnostic(
                    "SCHEMA_ID_MISMATCH",
                    f"/files/{package_path}/$id",
                    f"Schema $id must equal catalog ID {schema_id!r}",
                )
            )
        if parsed.get("$schema") != DIALECT_ID or entry.get("dialect") != DIALECT_ID:
            diagnostics.append(
                Diagnostic(
                    "SCHEMA_DIALECT_MISMATCH",
                    f"/files/{package_path}/$schema",
                    f"Schema and catalog entry must use {DIALECT_ID!r}",
                )
            )
        for child, child_pointer in walk_schema_objects(parsed):
            if child_pointer and "$id" in child:
                diagnostics.append(
                    Diagnostic(
                        "SCHEMA_NESTED_ID_FORBIDDEN",
                        pointer_location(package_path, f"{child_pointer}/$id"),
                        "Package-format v1 forbids nested JSON Schema resolution bases",
                    )
                )
        if parsed.get("$schema") == DIALECT_ID:
            try:
                Draft202012Validator.check_schema(parsed)
            except SchemaError as error:
                diagnostics.append(
                    Diagnostic(
                        "SCHEMA_META_INVALID",
                        schema_error_location(error, package_path),
                        error.message,
                    )
                )
        parsed_schemas[schema_id] = (parsed, package_path)

    if actual_total_bytes > MAX_TOTAL_SCHEMA_BYTES:
        diagnostics.append(
            Diagnostic(
                "SCHEMA_ACTUAL_TOTAL_BYTES_LIMIT",
                "/files",
                f"Actual schema lane exceeds {MAX_TOTAL_SCHEMA_BYTES} bytes",
            )
        )

    duplicate_ids = {schema_id for schema_id, count in Counter(ids).items() if count > 1}
    retrieval_attempts: list[str] = []

    def reject_retrieval(uri: str) -> Resource[Any]:
        retrieval_attempts.append(uri)
        raise NoSuchResource(ref=uri)

    registry: Registry[Any] = Registry(retrieve=reject_retrieval)
    for schema_id, (schema, _path) in sorted(parsed_schemas.items()):
        if schema_id in duplicate_ids or schema.get("$id") != schema_id:
            continue
        if schema.get("$schema") != DIALECT_ID:
            continue
        try:
            registry = registry.with_resource(schema_id, Resource.from_contents(schema))
        except Exception as error:
            diagnostics.append(
                Diagnostic(
                    "SCHEMA_RESOURCE_INVALID",
                    f"/schemas/{schema_id}",
                    f"Cannot register schema resource: {error}",
                )
            )

    catalog_id_set = set(ids) - duplicate_ids
    for schema_id, (schema, package_path) in sorted(parsed_schemas.items()):
        if (
            schema_id in duplicate_ids
            or schema.get("$id") != schema_id
            or schema.get("$schema") != DIALECT_ID
        ):
            continue
        for child, child_pointer in walk_schema_objects(schema):
            for keyword in ("$ref", "$dynamicRef"):
                reference = child.get(keyword)
                if not isinstance(reference, str):
                    continue
                resolved = resolve_schema_reference(schema_id, reference)
                location = pointer_location(package_path, f"{child_pointer}/{keyword}")
                if resolved is None:
                    diagnostics.append(
                        Diagnostic(
                            "SCHEMA_REF_FORBIDDEN",
                            location,
                            f"Reference is not an unambiguous canonical or relative URI: {reference!r}",
                        )
                    )
                    continue
                base_id, _fragment = urldefrag(resolved)
                if not schema_id_is_canonical(base_id):
                    diagnostics.append(
                        Diagnostic(
                            "SCHEMA_REF_FORBIDDEN",
                            location,
                            f"Reference resolves outside the canonical offline schema namespace: {resolved!r}",
                        )
                    )
                    continue
                if base_id not in catalog_id_set:
                    diagnostics.append(
                        Diagnostic(
                            "SCHEMA_REF_UNRESOLVED",
                            location,
                            f"Reference base is absent from the offline catalog: {base_id!r}",
                        )
                    )
                    continue
                try:
                    registry.resolver(base_uri=schema_id).lookup(resolved)
                except Unresolvable:
                    diagnostics.append(
                        Diagnostic(
                            "SCHEMA_REF_FRAGMENT_UNRESOLVED",
                            location,
                            f"Reference target cannot be resolved in memory: {resolved!r}",
                        )
                    )

    if retrieval_attempts:
        diagnostics.append(
            Diagnostic(
                "SCHEMA_REMOTE_RETRIEVAL_ATTEMPT",
                "/entries",
                f"Resolver attempted external retrieval: {sorted(retrieval_attempts)!r}",
            )
        )
    return sorted(diagnostics)


def validate_catalog_against_manifest(
    catalog: Any,
    catalog_bytes: bytes,
    manifest: Any,
    trusted_schema_bytes: dict[str, bytes],
    catalog_path: str = SCHEMA_CATALOG_PACKAGE_PATH,
) -> list[Diagnostic]:
    """Bind resolver data to the manifest inventory and external bootstrap trust root."""

    diagnostics: list[Diagnostic] = []
    if not isinstance(catalog, dict) or not isinstance(manifest, dict):
        return [
            Diagnostic(
                "CATALOG_MANIFEST_DOCUMENT_INVALID",
                "/",
                "Catalog and manifest must both be JSON objects",
            )
        ]
    entries_value = catalog.get("entries")
    entries = (
        [(index, entry) for index, entry in enumerate(entries_value) if isinstance(entry, dict)]
        if isinstance(entries_value, list)
        else []
    )
    files_value = manifest.get("files")
    files = (
        [(index, record) for index, record in enumerate(files_value) if isinstance(record, dict)]
        if isinstance(files_value, list)
        else []
    )

    catalog_records = [(index, record) for index, record in files if record.get("role") == "schema-catalog"]
    if len(catalog_records) != 1:
        diagnostics.append(
            Diagnostic(
                "MANIFEST_SCHEMA_CATALOG_SINGLETON",
                "/manifest/files",
                f"Expected exactly one schema-catalog record, found {len(catalog_records)}",
            )
        )
    else:
        index, record = catalog_records[0]
        expected_catalog_hash = sha256_bytes(catalog_bytes)
        for field, expected, code in (
            ("path", catalog_path, "MANIFEST_SCHEMA_CATALOG_PATH_MISMATCH"),
            ("bytes", len(catalog_bytes), "MANIFEST_SCHEMA_CATALOG_BYTES_MISMATCH"),
            ("sha256", expected_catalog_hash, "MANIFEST_SCHEMA_CATALOG_HASH_MISMATCH"),
            ("mediaType", "application/json", "MANIFEST_SCHEMA_CATALOG_MEDIA_MISMATCH"),
            ("runtimeRequired", True, "MANIFEST_SCHEMA_CATALOG_RUNTIME_MISMATCH"),
            (
                "validationSchemaId",
                CATALOG_SCHEMA_ID,
                "MANIFEST_SCHEMA_CATALOG_VALIDATION_ID_MISMATCH",
            ),
        ):
            if record.get(field) != expected:
                diagnostics.append(
                    Diagnostic(
                        code,
                        f"/manifest/files/{index}/{field}",
                        f"Expected {expected!r}, found {record.get(field)!r}",
                    )
                )

    entries_by_path: dict[str, list[tuple[int, dict[str, Any]]]] = {}
    entries_by_id: dict[str, list[tuple[int, dict[str, Any]]]] = {}
    for index, entry in entries:
        path = entry.get("path")
        schema_id = entry.get("id")
        if isinstance(path, str):
            entries_by_path.setdefault(path, []).append((index, entry))
        if isinstance(schema_id, str):
            entries_by_id.setdefault(schema_id, []).append((index, entry))

    schema_records = [(index, record) for index, record in files if record.get("role") == "schema"]
    records_by_path: dict[str, list[tuple[int, dict[str, Any]]]] = {}
    for index, record in schema_records:
        path = record.get("path")
        if isinstance(path, str):
            records_by_path.setdefault(path, []).append((index, record))

    for entry_index, entry in entries:
        path = entry.get("path")
        matching = records_by_path.get(path, []) if isinstance(path, str) else []
        if len(matching) != 1:
            diagnostics.append(
                Diagnostic(
                    "CATALOG_ENTRY_MANIFEST_SCHEMA_MISSING",
                    f"/entries/{entry_index}/path",
                    f"Catalog entry must resolve to one schema record, found {len(matching)}",
                )
            )
            continue
        record_index, record = matching[0]
        for field, expected, code in (
            ("bytes", entry.get("bytes"), "CATALOG_MANIFEST_SCHEMA_BYTES_MISMATCH"),
            ("sha256", entry.get("sha256"), "CATALOG_MANIFEST_SCHEMA_HASH_MISMATCH"),
            ("mediaType", "application/schema+json", "CATALOG_MANIFEST_SCHEMA_MEDIA_MISMATCH"),
            ("runtimeRequired", True, "CATALOG_MANIFEST_SCHEMA_RUNTIME_MISMATCH"),
        ):
            if record.get(field) != expected:
                diagnostics.append(
                    Diagnostic(
                        code,
                        f"/manifest/files/{record_index}/{field}",
                        f"Schema record differs from catalog entry {path!r}",
                    )
                )

    for record_index, record in schema_records:
        path = record.get("path")
        matching = entries_by_path.get(path, []) if isinstance(path, str) else []
        if len(matching) != 1:
            diagnostics.append(
                Diagnostic(
                    "MANIFEST_SCHEMA_CATALOG_ENTRY_MISSING",
                    f"/manifest/files/{record_index}/path",
                    f"Schema record must resolve to one catalog entry, found {len(matching)}",
                )
            )

    for file_index, record in files:
        validation_schema_id = record.get("validationSchemaId")
        if isinstance(validation_schema_id, str) and len(entries_by_id.get(validation_schema_id, [])) != 1:
            diagnostics.append(
                Diagnostic(
                    "VALIDATION_SCHEMA_ID_UNRESOLVED",
                    f"/manifest/files/{file_index}/validationSchemaId",
                    f"Validation schema {validation_schema_id!r} is absent or ambiguous",
                )
            )

    bindings = manifest.get("contractBindings")
    bindings = bindings if isinstance(bindings, dict) else {}
    for binding_name, (trusted_schema_id, _filename) in TRUSTED_SCHEMA_BINDINGS.items():
        trusted_bytes = trusted_schema_bytes[trusted_schema_id]
        matching = entries_by_id.get(trusted_schema_id, [])
        binding = bindings.get(binding_name)
        if len(matching) != 1 or not isinstance(binding, dict):
            diagnostics.append(
                Diagnostic(
                    "TRUSTED_CONTRACT_CATALOG_BINDING_MISSING",
                    f"/manifest/contractBindings/{binding_name}",
                    "Trusted schema must be bound by both manifest and catalog",
                )
            )
            continue
        _entry_index, entry = matching[0]
        expected = {
            "id": trusted_schema_id,
            "path": entry.get("path"),
            "sha256": sha256_bytes(trusted_bytes),
        }
        if binding != expected:
            diagnostics.append(
                Diagnostic(
                    "TRUSTED_CONTRACT_CATALOG_BINDING_MISMATCH",
                    f"/manifest/contractBindings/{binding_name}",
                    f"Expected trusted catalog binding {expected!r}",
                )
            )
    return sorted(diagnostics)


def entry_by_id(catalog: dict[str, Any], schema_id: str) -> dict[str, Any]:
    entries = catalog.get("entries")
    if not isinstance(entries, list):
        raise ContractDefinitionError("Fixture catalog has no entries array")
    matches = [entry for entry in entries if isinstance(entry, dict) and entry.get("id") == schema_id]
    if len(matches) != 1:
        raise ContractDefinitionError(f"Fixture mutation expected one entry for {schema_id!r}")
    return matches[0]


def sync_schema_entry(
    catalog: dict[str, Any],
    package_files: dict[str, bytes],
    schema_id: str,
    document: Any,
) -> None:
    entry = entry_by_id(catalog, schema_id)
    content = stable_json_bytes(document)
    package_files[entry["path"]] = content
    entry["bytes"] = len(content)
    entry["sha256"] = sha256_bytes(content)


def apply_mutation(
    catalog: dict[str, Any],
    package_files: dict[str, bytes],
    mutation: Any,
) -> None:
    data = expect_object(mutation, "schema-catalog fixture mutation")
    operation = data.get("operation")
    if operation == "set-catalog-pointer":
        pointer = data.get("pointer")
        if not isinstance(pointer, str):
            raise ContractDefinitionError("set-catalog-pointer requires a string pointer")
        set_pointer(catalog, pointer, data.get("value"))
        return
    if operation == "set-entry-field":
        schema_id = data.get("schemaId")
        field = data.get("field")
        if not isinstance(schema_id, str) or not isinstance(field, str):
            raise ContractDefinitionError("set-entry-field requires schemaId and field")
        entry_by_id(catalog, schema_id)[field] = copy.deepcopy(data.get("value"))
        return
    if operation == "set-schema-pointer":
        schema_id = data.get("schemaId")
        pointer = data.get("pointer")
        if not isinstance(schema_id, str) or not isinstance(pointer, str):
            raise ContractDefinitionError("set-schema-pointer requires schemaId and pointer")
        entry = entry_by_id(catalog, schema_id)
        document = parse_json_text(package_files[entry["path"]].decode("utf-8"))
        set_pointer(document, pointer, data.get("value"))
        sync_schema_entry(catalog, package_files, schema_id, document)
        return
    if operation == "add-schema-field":
        schema_id = data.get("schemaId")
        field = data.get("field")
        if not isinstance(schema_id, str) or not isinstance(field, str):
            raise ContractDefinitionError("add-schema-field requires schemaId and field")
        entry = entry_by_id(catalog, schema_id)
        document = expect_object(
            parse_json_text(package_files[entry["path"]].decode("utf-8")),
            "schema fixture document",
        )
        document[field] = copy.deepcopy(data.get("value"))
        sync_schema_entry(catalog, package_files, schema_id, document)
        return
    if operation == "add-nested-id":
        schema_id = data.get("schemaId")
        entry = entry_by_id(catalog, schema_id)
        document = expect_object(
            parse_json_text(package_files[entry["path"]].decode("utf-8")),
            "schema fixture document",
        )
        document.setdefault("$defs", {})["nestedIdFixture"] = {
            "$id": "https://skillpilot.com/schemas/fixtures/v1/nested.schema.json",
            "type": "string",
        }
        sync_schema_entry(catalog, package_files, schema_id, document)
        return
    if operation == "remove-schema-file":
        package_path = data.get("path")
        if not isinstance(package_path, str) or package_path not in package_files:
            raise ContractDefinitionError("remove-schema-file requires an existing path")
        del package_files[package_path]
        return
    if operation == "add-unlisted-schema-file":
        package_path = data.get("path")
        schema_id = data.get("schemaId")
        if not isinstance(package_path, str) or not isinstance(schema_id, str):
            raise ContractDefinitionError("add-unlisted-schema-file requires path and schemaId")
        package_files[package_path] = stable_json_bytes(
            {"$schema": DIALECT_ID, "$id": schema_id, "type": "null"}
        )
        return
    if operation == "duplicate-entry-id":
        from_id = data.get("fromSchemaId")
        to_id = data.get("toSchemaId")
        if not isinstance(from_id, str) or not isinstance(to_id, str):
            raise ContractDefinitionError("duplicate-entry-id requires fromSchemaId and toSchemaId")
        source_id = entry_by_id(catalog, from_id)["id"]
        target_entry = entry_by_id(catalog, to_id)
        target_path = target_entry["path"]
        target_document = expect_object(
            parse_json_text(package_files[target_path].decode("utf-8")),
            "duplicate ID schema",
        )
        target_document["$id"] = source_id
        content = stable_json_bytes(target_document)
        package_files[target_path] = content
        target_entry["id"] = source_id
        target_entry["bytes"] = len(content)
        target_entry["sha256"] = sha256_bytes(content)
        return
    if operation == "append-numbered-entries":
        count = data.get("count")
        source_id = data.get("sourceSchemaId")
        if not isinstance(count, int) or isinstance(count, bool) or not isinstance(source_id, str):
            raise ContractDefinitionError("append-numbered-entries requires count and sourceSchemaId")
        source_entry = entry_by_id(catalog, source_id)
        source_document = expect_object(
            parse_json_text(package_files[source_entry["path"]].decode("utf-8")),
            "numbered schema source",
        )
        for index in range(count):
            schema_id = f"https://skillpilot.com/schemas/fixtures/v1/generated-{index:04d}.schema.json"
            package_path = f"schemas/generated-{index:04d}.schema.json"
            document = copy.deepcopy(source_document)
            document["$id"] = schema_id
            content = stable_json_bytes(document)
            package_files[package_path] = content
            catalog["entries"].append(
                {
                    "id": schema_id,
                    "path": package_path,
                    "dialect": DIALECT_ID,
                    "bytes": len(content),
                    "sha256": sha256_bytes(content),
                }
            )
        catalog["entries"].sort(key=lambda entry: entry["id"])
        return
    if operation == "catalog-padding":
        count = data.get("bytes")
        if not isinstance(count, int) or isinstance(count, bool) or count < 1:
            raise ContractDefinitionError("catalog-padding requires a positive byte count")
        catalog["padding"] = "x" * count
        return
    if operation == "schema-padding":
        schema_id = data.get("schemaId")
        count = data.get("bytes")
        if not isinstance(schema_id, str) or not isinstance(count, int) or count < 1:
            raise ContractDefinitionError("schema-padding requires schemaId and bytes")
        entry = entry_by_id(catalog, schema_id)
        document = expect_object(
            parse_json_text(package_files[entry["path"]].decode("utf-8")),
            "schema padding source",
        )
        document["description"] = "x" * count
        sync_schema_entry(catalog, package_files, schema_id, document)
        return
    if operation == "declared-total-over-limit":
        for index in range(4):
            catalog["entries"].append(
                {
                    "id": f"https://skillpilot.com/schemas/fixtures/v1/large-{index}.schema.json",
                    "path": f"schemas/large-{index}.schema.json",
                    "dialect": DIALECT_ID,
                    "bytes": MAX_SCHEMA_BYTES,
                    "sha256": f"{index + 1:064x}",
                }
            )
        catalog["entries"].sort(key=lambda entry: entry["id"])
        return
    if operation == "deep-schema":
        schema_id = data.get("schemaId")
        if not isinstance(schema_id, str):
            raise ContractDefinitionError("deep-schema requires schemaId")
        document: dict[str, Any] = {"type": "string"}
        for _index in range(MAX_SCHEMA_DEPTH + 1):
            document = {"allOf": [document]}
        document["$schema"] = DIALECT_ID
        document["$id"] = schema_id
        sync_schema_entry(catalog, package_files, schema_id, document)
        return
    if operation == "aggregate-node-budget-exceeded":
        schema_id = "https://skillpilot.com/schemas/fixtures/v1/aggregate-node-budget.schema.json"
        package_path = "schemas/aggregate-node-budget.schema.json"
        document = {
            "$schema": DIALECT_ID,
            "$id": schema_id,
            "allOf": [{} for _index in range(MAX_TOTAL_SCHEMA_NODES)],
        }
        content = stable_json_bytes(document)
        package_files[package_path] = content
        catalog["entries"].append(
            {
                "id": schema_id,
                "path": package_path,
                "dialect": DIALECT_ID,
                "bytes": len(content),
                "sha256": sha256_bytes(content),
            }
        )
        catalog["entries"].sort(key=lambda entry: entry["id"])
        return
    if operation == "aggregate-reference-budget-exceeded":
        references_per_schema = (MAX_TOTAL_SCHEMA_REFERENCES // 3) + 1
        for index in range(3):
            schema_id = (
                "https://skillpilot.com/schemas/fixtures/v1/"
                f"aggregate-reference-budget-{index}.schema.json"
            )
            package_path = f"schemas/aggregate-reference-budget-{index}.schema.json"
            document = {
                "$schema": DIALECT_ID,
                "$id": schema_id,
                "allOf": [{"$ref": "#"} for _reference in range(references_per_schema)],
            }
            content = stable_json_bytes(document)
            package_files[package_path] = content
            catalog["entries"].append(
                {
                    "id": schema_id,
                    "path": package_path,
                    "dialect": DIALECT_ID,
                    "bytes": len(content),
                    "sha256": sha256_bytes(content),
                }
            )
        catalog["entries"].sort(key=lambda entry: entry["id"])
        return
    raise ContractDefinitionError(f"Unknown schema-catalog fixture mutation: {operation!r}")


def validate_mutation_fixtures(
    fixture_dir: Path,
    base_catalog: dict[str, Any],
    base_package_files: dict[str, bytes],
    catalog_schema_validator: Draft202012Validator,
    trusted_schema_bytes: dict[str, bytes],
    verbose: bool,
) -> tuple[int, list[str]]:
    suite_path = fixture_dir / "invalid/catalog-cases.json"
    suite = expect_object(load_json(suite_path), str(suite_path))
    expect_exact_keys(suite, {"fixtureFormatVersion", "cases"}, str(suite_path))
    cases = suite.get("cases")
    if suite.get("fixtureFormatVersion") != 1 or not isinstance(cases, list) or not cases:
        raise ContractDefinitionError("Schema-catalog mutation suite is malformed")
    failures: list[str] = []
    passed = 0
    seen_ids: set[str] = set()
    for index, raw_case in enumerate(cases):
        case = expect_object(raw_case, f"{suite_path}.cases[{index}]")
        expect_exact_keys(
            case,
            {"id", "mutations", "expectedDiagnostics"},
            f"{suite_path}.cases[{index}]",
        )
        case_id = case.get("id")
        mutations = case.get("mutations")
        expected = case.get("expectedDiagnostics")
        if (
            not isinstance(case_id, str)
            or not case_id
            or case_id in seen_ids
            or not isinstance(mutations, list)
            or not mutations
            or not isinstance(expected, list)
            or not expected
            or not all(
                isinstance(item, dict)
                and set(item) == {"code", "location"}
                and isinstance(item.get("code"), str)
                and isinstance(item.get("location"), str)
                for item in expected
            )
        ):
            raise ContractDefinitionError(f"Malformed schema-catalog case at index {index}")
        seen_ids.add(case_id)
        catalog = copy.deepcopy(base_catalog)
        package_files = dict(base_package_files)
        for mutation in mutations:
            apply_mutation(catalog, package_files, mutation)
        candidate_bytes = stable_json_bytes(catalog)
        diagnostics = validate_catalog(
            catalog,
            candidate_bytes,
            package_files,
            catalog_schema_validator,
            trusted_schema_bytes,
        )
        actual_pairs = [(item.code, item.location) for item in diagnostics]
        expected_pairs = sorted((item["code"], item["location"]) for item in expected)
        if actual_pairs != expected_pairs:
            failures.append(
                f"Invalid fixture {case_id!r} expected {expected_pairs}, got {actual_pairs}: "
                + "; ".join(
                    f"{item.code} {item.location}: {item.message}" for item in diagnostics
                )
            )
        else:
            passed += 1
            if verbose:
                print(f"PASS invalid {case_id}: {', '.join(code for code, _ in actual_pairs)}")
    return passed, failures


def validate_raw_fixtures(fixture_dir: Path, verbose: bool) -> tuple[int, list[str]]:
    raw_dir = fixture_dir / "invalid/raw"
    expectations_path = raw_dir / "expectations.json"
    expectations = expect_object(load_json(expectations_path), str(expectations_path))
    expect_exact_keys(expectations, {"fixtureFormatVersion", "cases"}, str(expectations_path))
    cases = expectations.get("cases")
    if expectations.get("fixtureFormatVersion") != 1 or not isinstance(cases, list) or not cases:
        raise ContractDefinitionError("Raw schema-catalog fixture suite is malformed")
    failures: list[str] = []
    passed = 0
    referenced: set[Path] = set()
    seen_ids: set[str] = set()
    for index, raw_case in enumerate(cases):
        case = expect_object(raw_case, f"{expectations_path}.cases[{index}]")
        case_id = case.get("id")
        relative_path = case.get("path")
        expected_code = case.get("expectedErrorCode")
        if expected_code == "JSON_DUPLICATE_KEY":
            expect_exact_keys(
                case,
                {"id", "path", "expectedErrorCode", "expectedDuplicateKey"},
                f"{expectations_path}.cases[{index}]",
            )
            expected_value = case.get("expectedDuplicateKey")
        elif expected_code == "JSON_NONFINITE_CONSTANT":
            expect_exact_keys(
                case,
                {"id", "path", "expectedErrorCode", "expectedConstant"},
                f"{expectations_path}.cases[{index}]",
            )
            expected_value = case.get("expectedConstant")
        else:
            raise ContractDefinitionError(
                f"Unsupported raw schema-catalog error code at index {index}: {expected_code!r}"
            )
        if (
            not isinstance(case_id, str)
            or not case_id
            or case_id in seen_ids
            or not isinstance(relative_path, str)
            or not path_is_safe(relative_path)
            or "/" in relative_path
            or not isinstance(expected_value, str)
            or not expected_value
        ):
            raise ContractDefinitionError(f"Malformed raw schema-catalog case at index {index}")
        seen_ids.add(case_id)
        path = (raw_dir / relative_path).resolve()
        if path.parent != raw_dir.resolve():
            raise ContractDefinitionError(f"Raw fixture escapes its directory: {relative_path!r}")
        referenced.add(path)
        try:
            parse_json_text(path.read_text(encoding="utf-8"))
        except DuplicateJsonKeyError as error:
            actual_code = "JSON_DUPLICATE_KEY"
            actual_value = error.key
        except NonFiniteJsonConstantError as error:
            actual_code = "JSON_NONFINITE_CONSTANT"
            actual_value = error.constant
        except (OSError, UnicodeError, json.JSONDecodeError) as error:
            failures.append(f"Raw fixture {case_id!r} failed unexpectedly: {error}")
            continue
        else:
            failures.append(f"Raw fixture {case_id!r} unexpectedly parsed successfully")
            continue
        if actual_code != expected_code or actual_value != expected_value:
            failures.append(
                f"Raw fixture {case_id!r} expected {expected_code} for {expected_value!r}, "
                f"got {actual_code} for {actual_value!r}"
            )
        else:
            passed += 1
            if verbose:
                print(f"PASS invalid {case_id}: {actual_code} ({actual_value})")
    actual = {
        path.resolve()
        for path in raw_dir.iterdir()
        if path.is_file() and path.name != expectations_path.name
    }
    if actual != referenced:
        failures.append(
            "Raw schema-catalog inventory differs from expectations: "
            f"unreferenced={sorted(path.name for path in actual - referenced)}, "
            f"missing={sorted(path.name for path in referenced - actual)}"
        )
    return passed, failures


def apply_binding_mutation(document: dict[str, Any], mutation: Any) -> None:
    data = expect_object(mutation, "schema-catalog binding mutation")
    operation = data.get("operation")
    if operation in {"set", "remove"}:
        expected_keys = {"operation", "pointer"}
        if operation == "set":
            expected_keys.add("value")
        expect_exact_keys(
            data,
            expected_keys,
            "schema-catalog binding mutation",
        )
        pointer = data.get("pointer")
        if not isinstance(pointer, str):
            raise ContractDefinitionError("Binding set/remove mutation requires a JSON pointer")
        parent, token = pointer_parent(document, pointer)
        if operation == "set":
            if isinstance(parent, list):
                parent[int(token)] = copy.deepcopy(data.get("value"))
            else:
                parent[token] = copy.deepcopy(data.get("value"))
        elif isinstance(parent, list):
            del parent[int(token)]
        else:
            del parent[token]
        return
    if operation == "append":
        expect_exact_keys(data, {"operation", "pointer", "value"}, "binding append mutation")
        pointer = data.get("pointer")
        if not isinstance(pointer, str):
            raise ContractDefinitionError("Binding append mutation requires a JSON pointer")
        parent, token = pointer_parent(document, pointer)
        target = parent[int(token)] if isinstance(parent, list) else parent[token]
        if not isinstance(target, list):
            raise ContractDefinitionError("Binding append target must be an array")
        target.append(copy.deepcopy(data.get("value")))
        return
    raise ContractDefinitionError(f"Unknown schema-catalog binding mutation {operation!r}")


def validate_manifest_binding_fixtures(
    fixture_dir: Path,
    trusted_schema_bytes: dict[str, bytes],
    verbose: bool,
) -> tuple[int, list[str]]:
    suite_path = fixture_dir / "binding/binding-cases.json"
    suite = expect_object(load_json(suite_path), str(suite_path))
    expect_exact_keys(
        suite,
        {"fixtureFormatVersion", "baseCatalog", "baseManifest", "cases"},
        str(suite_path),
    )
    if suite.get("fixtureFormatVersion") != 1:
        raise ContractDefinitionError("Unsupported schema-catalog binding fixture version")
    base_catalog_path = (suite_path.parent / str(suite.get("baseCatalog"))).resolve()
    base_manifest_path = (suite_path.parent / str(suite.get("baseManifest"))).resolve()
    base_catalog_bytes = base_catalog_path.read_bytes()
    base_catalog = expect_object(
        parse_json_text(base_catalog_bytes.decode("utf-8")), str(base_catalog_path)
    )
    base_manifest = expect_object(load_json(base_manifest_path), str(base_manifest_path))
    cases = suite.get("cases")
    if not isinstance(cases, list) or not cases:
        raise ContractDefinitionError("Schema-catalog binding fixtures require cases")
    failures: list[str] = []
    passed = 0
    seen_ids: set[str] = set()
    for index, raw_case in enumerate(cases):
        case = expect_object(raw_case, f"{suite_path}.cases[{index}]")
        expect_exact_keys(
            case,
            {"id", "catalogMutations", "manifestMutations", "expectedDiagnostics"},
            f"{suite_path}.cases[{index}]",
        )
        case_id = case.get("id")
        catalog_mutations = case.get("catalogMutations")
        manifest_mutations = case.get("manifestMutations")
        expected = case.get("expectedDiagnostics")
        if (
            not isinstance(case_id, str)
            or not case_id
            or case_id in seen_ids
            or not isinstance(catalog_mutations, list)
            or not isinstance(manifest_mutations, list)
            or not isinstance(expected, list)
            or not all(
                isinstance(item, dict)
                and set(item) == {"code", "location"}
                and isinstance(item.get("code"), str)
                and isinstance(item.get("location"), str)
                for item in expected
            )
            or (case_id != "valid-binding" and not expected)
        ):
            raise ContractDefinitionError(f"Malformed binding case at index {index}")
        seen_ids.add(case_id)
        catalog = copy.deepcopy(base_catalog)
        manifest = copy.deepcopy(base_manifest)
        for mutation in catalog_mutations:
            apply_binding_mutation(catalog, mutation)
        for mutation in manifest_mutations:
            apply_binding_mutation(manifest, mutation)
        catalog_bytes = base_catalog_bytes if not catalog_mutations else stable_json_bytes(catalog)
        diagnostics = validate_catalog_against_manifest(
            catalog,
            catalog_bytes,
            manifest,
            trusted_schema_bytes,
        )
        actual_pairs = Counter((item.code, item.location) for item in diagnostics)
        expected_pairs = Counter((item["code"], item["location"]) for item in expected)
        if actual_pairs != expected_pairs:
            failures.append(
                f"Binding fixture {case_id!r} expected {sorted(expected_pairs.elements())}, "
                f"got {sorted(actual_pairs.elements())}: "
                + "; ".join(
                    f"{item.code} {item.location}: {item.message}" for item in diagnostics
                )
            )
        else:
            passed += 1
            if verbose:
                print(
                    f"PASS binding {case_id}: "
                    + (", ".join(code for code, _location in sorted(actual_pairs.elements())) or "valid")
                )
    return passed, failures


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
    catalog_schema_path = contract_dir / CATALOG_SCHEMA_FILENAME
    fixture_dir = contract_dir / FIXTURE_RELATIVE_DIR
    valid_dir = fixture_dir / "valid"
    catalog_path = valid_dir / "catalog.json"
    trusted_schema_paths = {
        schema_id: contract_dir / filename
        for schema_id, filename in NORMATIVE_SCHEMA_FILES
    }
    try:
        try:
            installed_jsonschema_version = distribution_version("jsonschema")
        except PackageNotFoundError as error:
            raise ContractDefinitionError("Pinned jsonschema dependency is not installed") from error
        if installed_jsonschema_version != JSONSCHEMA_VERSION:
            raise ContractDefinitionError(
                f"Expected jsonschema {JSONSCHEMA_VERSION}, found {installed_jsonschema_version}"
            )
        catalog_schema_bytes = catalog_schema_path.read_bytes()
        catalog_schema = expect_object(
            parse_json_text(catalog_schema_bytes.decode("utf-8")),
            str(catalog_schema_path),
        )
        Draft202012Validator.check_schema(catalog_schema)
        if catalog_schema.get("$id") != CATALOG_SCHEMA_ID:
            raise ContractDefinitionError("Unexpected offline schema-catalog $id")
        catalog_schema_validator = Draft202012Validator(catalog_schema)
        catalog_bytes = catalog_path.read_bytes()
        if len(catalog_bytes) > MAX_CATALOG_BYTES:
            raise ContractDefinitionError("Valid schema-catalog fixture exceeds its byte limit")
        catalog = expect_object(
            parse_json_text(catalog_bytes.decode("utf-8")),
            str(catalog_path),
        )
        trusted_schema_bytes = {
            schema_id: path.read_bytes() for schema_id, path in trusted_schema_paths.items()
        }
        package_files = load_fixture_package_files(valid_dir, trusted_schema_paths)
        valid_diagnostics = validate_catalog(
            catalog,
            catalog_bytes,
            package_files,
            catalog_schema_validator,
            trusted_schema_bytes,
        )
        failures: list[str] = []
        valid_count = 0
        if valid_diagnostics:
            failures.append(
                "Valid schema catalog failed: "
                + "; ".join(
                    f"{item.code} {item.location}: {item.message}"
                    for item in valid_diagnostics
                )
            )
        else:
            valid_count = 1
            if args.verbose:
                print(f"PASS valid {catalog_path.relative_to(contract_dir)}")
        invalid_count, mutation_failures = validate_mutation_fixtures(
            fixture_dir,
            catalog,
            package_files,
            catalog_schema_validator,
            trusted_schema_bytes,
            args.verbose,
        )
        raw_count, raw_failures = validate_raw_fixtures(fixture_dir, args.verbose)
        binding_count, binding_failures = validate_manifest_binding_fixtures(
            fixture_dir,
            trusted_schema_bytes,
            args.verbose,
        )
        failures.extend(mutation_failures)
        failures.extend(raw_failures)
        failures.extend(binding_failures)
    except ContractDefinitionError as error:
        print(f"FAIL curriculum schema-catalog contract definition: {error}", file=sys.stderr)
        return 1
    except Exception as error:
        print(f"FAIL curriculum schema-catalog validator: {error}", file=sys.stderr)
        return 1

    if failures:
        for failure in failures:
            print(f"FAIL {failure}", file=sys.stderr)
        print(
            f"Curriculum schema-catalog validation failed: {len(failures)} issue(s).",
            file=sys.stderr,
        )
        return 1
    print(
        "Curriculum schema-catalog validation passed: "
        f"trusted catalog schema, {valid_count} valid fixture, "
        f"{invalid_count + raw_count} exact invalid fixture case(s), "
        f"{binding_count} exact manifest-binding case(s), zero remote fetches."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
