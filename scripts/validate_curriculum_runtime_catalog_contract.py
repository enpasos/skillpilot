#!/usr/bin/env python3
"""Validate the runtime-catalog v1 schema and exact conformance fixtures."""

from __future__ import annotations

import argparse
import copy
import json
import sys
import unicodedata
from collections import Counter, defaultdict
from dataclasses import dataclass
from importlib.metadata import version
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker

sys.dont_write_bytecode = True


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONTRACT_DIR = REPO_ROOT / "contracts" / "curriculum-package" / "v1"
SCHEMA_ID = "https://skillpilot.com/schemas/curriculum-package/v1/runtime-catalog.schema.json"
JSONSCHEMA_VERSION = "4.26.0"
MAX_RAW_JSON_BYTES = 16 * 1024 * 1024
CATALOG_MANIFEST_ROLES = {
    "canonical-landscape",
    "embedded-goal-dependency",
    "composition-view",
    "card-deck",
    "binary-asset",
    "composition-view-index",
    "card-index",
    "resource-index",
    "migration-aliases",
    "dependency-closure",
}


class ContractError(RuntimeError):
    pass


class DuplicateJsonKeyError(ContractError):
    pass


@dataclass(frozen=True, order=True)
class Diagnostic:
    code: str
    location: str
    message: str


def parse_json_bytes(raw: bytes, source: str) -> Any:
    if len(raw) > MAX_RAW_JSON_BYTES:
        raise ContractError(f"Raw JSON exceeds {MAX_RAW_JSON_BYTES} bytes: {source}")

    def strict_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
        result: dict[str, Any] = {}
        for key, value in pairs:
            if key in result:
                raise DuplicateJsonKeyError(f"Duplicate JSON key {key!r} in {source}")
            result[key] = value
        return result

    return json.loads(raw.decode("utf-8"), object_pairs_hook=strict_object)


def load_json(path: Path) -> Any:
    try:
        return parse_json_bytes(path.read_bytes(), str(path))
    except ContractError:
        raise
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise ContractError(f"Cannot read {path}: {error}") from error


def obj(value: Any, location: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ContractError(f"{location} must be an object")
    return value


def items(value: Any) -> list[dict[str, Any]]:
    return [item for item in value if isinstance(item, dict)] if isinstance(value, list) else []


def scope_key(scope: Any) -> tuple[tuple[str, str], ...]:
    if not isinstance(scope, dict):
        return ()
    return tuple(sorted((key, value) for key, value in scope.items() if isinstance(value, str)))


def duplicate_values(values: list[Any]) -> set[Any]:
    return {value for value, count in Counter(values).items() if count > 1}


def add_duplicates(
    diagnostics: list[Diagnostic],
    code: str,
    location: str,
    values: list[Any],
) -> None:
    positions: dict[Any, list[int]] = defaultdict(list)
    for index, value in enumerate(values):
        positions[value].append(index)
    for value in sorted(duplicate_values(values), key=str):
        diagnostics.append(Diagnostic(code, f"{location}[{','.join(map(str, positions[value]))}]", f"Duplicate identity {value!r}"))


def validate_scope(
    scope: Any,
    location: str,
    dimensions: dict[str, set[str]],
    diagnostics: list[Diagnostic],
) -> None:
    if not isinstance(scope, dict):
        return
    for key, value in scope.items():
        if key not in dimensions:
            diagnostics.append(
                Diagnostic("SCOPE_DIMENSION_UNKNOWN", f"{location}/{key}", f"Unknown scope dimension {key!r}")
            )
        elif value not in dimensions[key]:
            diagnostics.append(
                Diagnostic("SCOPE_VALUE_UNKNOWN", f"{location}/{key}", f"Unknown value {value!r} for {key!r}")
            )


def validate_catalog(catalog: Any, validator: Draft202012Validator) -> list[Diagnostic]:
    diagnostics: list[Diagnostic] = []
    for error in sorted(
        validator.iter_errors(catalog),
        key=lambda entry: tuple(str(part) for part in entry.absolute_path),
    ):
        location = "/" + "/".join(str(part) for part in error.absolute_path)
        diagnostics.append(Diagnostic("CATALOG_SCHEMA", location, error.message))
    if not isinstance(catalog, dict):
        return sorted(diagnostics)

    landscapes = items(catalog.get("landscapes"))
    views = items(catalog.get("views"))
    offerings = items(catalog.get("offeredScopes"))
    decks = items(catalog.get("decks"))
    resources = items(catalog.get("resources"))
    dimensions_raw = items(catalog.get("scopeDimensions"))

    landscape_ids = [entry.get("landscapeId") for entry in landscapes if isinstance(entry.get("landscapeId"), str)]
    view_ids = [entry.get("viewId") for entry in views if isinstance(entry.get("viewId"), str)]
    offering_ids = [entry.get("offeringId") for entry in offerings if isinstance(entry.get("offeringId"), str)]
    resource_ids = [entry.get("resourceId") for entry in resources if isinstance(entry.get("resourceId"), str)]
    deck_keys = [
        (entry.get("deckId"), entry.get("locale"))
        for entry in decks
        if isinstance(entry.get("deckId"), str) and isinstance(entry.get("locale"), str)
    ]
    add_duplicates(diagnostics, "DUPLICATE_LANDSCAPE_ID", "/landscapes", landscape_ids)
    add_duplicates(diagnostics, "DUPLICATE_VIEW_ID", "/views", view_ids)
    add_duplicates(diagnostics, "DUPLICATE_OFFERING_ID", "/offeredScopes", offering_ids)
    add_duplicates(diagnostics, "DUPLICATE_DECK_KEY", "/decks", deck_keys)
    add_duplicates(diagnostics, "DUPLICATE_RESOURCE_ID", "/resources", resource_ids)

    landscape_by_id = {entry.get("landscapeId"): entry for entry in landscapes if isinstance(entry.get("landscapeId"), str)}
    view_by_id = {entry.get("viewId"): entry for entry in views if isinstance(entry.get("viewId"), str)}
    offering_by_id = {entry.get("offeringId"): entry for entry in offerings if isinstance(entry.get("offeringId"), str)}

    root_ids = catalog.get("rootLandscapeIds") if isinstance(catalog.get("rootLandscapeIds"), list) else []
    for index, root_id in enumerate(root_ids):
        landscape = landscape_by_id.get(root_id)
        if landscape is None:
            diagnostics.append(Diagnostic("ROOT_LANDSCAPE_UNKNOWN", f"/rootLandscapeIds/{index}", f"Unknown root {root_id!r}"))
        elif landscape.get("role") != "root":
            diagnostics.append(Diagnostic("ROOT_LANDSCAPE_ROLE", f"/rootLandscapeIds/{index}", "Root ID must reference role 'root'"))
    declared_roots = {entry.get("landscapeId") for entry in landscapes if entry.get("role") == "root"}
    if set(root_ids) != declared_roots:
        diagnostics.append(Diagnostic("ROOT_LANDSCAPE_SET_MISMATCH", "/rootLandscapeIds", "Root list and root landscape roles differ"))

    for index, landscape in enumerate(landscapes):
        role = landscape.get("role")
        if role == "root" and not isinstance(landscape.get("defaultOfferingId"), str):
            diagnostics.append(Diagnostic("ROOT_DEFAULT_OFFERING_REQUIRED", f"/landscapes/{index}", "Every root needs a default offering"))
        if role == "embedded-fragment":
            ownership = landscape.get("ownership")
            fragment_of = ownership.get("fragmentOfLandscapeId") if isinstance(ownership, dict) else None
            if isinstance(fragment_of, str) and fragment_of not in landscape_by_id:
                diagnostics.append(Diagnostic("FRAGMENT_LANDSCAPE_UNKNOWN", f"/landscapes/{index}/ownership/fragmentOfLandscapeId", "Fragment owner landscape must be catalogued"))

    module_outcomes: dict[str, str] = {}
    visit_state: dict[str, int] = {}
    for landscape in landscapes:
        if landscape.get("role") != "module":
            continue
        start_id = landscape.get("landscapeId")
        if not isinstance(start_id, str) or visit_state.get(start_id) == 2:
            continue
        path: list[str] = []
        path_positions: dict[str, int] = {}
        current_id = start_id
        outcome: str
        while True:
            if visit_state.get(current_id) == 2:
                outcome = module_outcomes[current_id]
                break
            if current_id in path_positions:
                outcome = "cycle"
                break
            current = landscape_by_id.get(current_id)
            if current is None:
                outcome = "unknown"
                break
            role = current.get("role")
            if role == "root":
                outcome = "root"
                break
            if role != "module":
                outcome = "non-root"
                break
            path_positions[current_id] = len(path)
            path.append(current_id)
            visit_state[current_id] = 1
            parent_id = current.get("parentLandscapeId")
            if not isinstance(parent_id, str):
                outcome = "unknown"
                break
            current_id = parent_id
        for module_id in reversed(path):
            module_outcomes[module_id] = outcome
            visit_state[module_id] = 2

    for index, landscape in enumerate(landscapes):
        if landscape.get("role") != "module":
            continue
        outcome = module_outcomes.get(landscape.get("landscapeId"), "unknown")
        if outcome == "cycle":
            diagnostics.append(Diagnostic("MODULE_PARENT_CYCLE", f"/landscapes/{index}/parentLandscapeId", "Module parent chain is cyclic"))
        elif outcome == "unknown":
            diagnostics.append(Diagnostic("MODULE_PARENT_UNKNOWN", f"/landscapes/{index}/parentLandscapeId", "Module parent is unknown"))
        elif outcome == "non-root":
            diagnostics.append(Diagnostic("MODULE_NOT_ROOT_REACHABLE", f"/landscapes/{index}/parentLandscapeId", "Module parent chain must end at a root"))

    dimension_ids = [entry.get("id") for entry in dimensions_raw if isinstance(entry.get("id"), str)]
    add_duplicates(diagnostics, "DUPLICATE_SCOPE_DIMENSION", "/scopeDimensions", dimension_ids)
    dimensions: dict[str, set[str]] = {}
    composites: dict[tuple[str, str], list[str]] = {}
    for dimension_index, dimension in enumerate(dimensions_raw):
        dimension_id = dimension.get("id")
        values = dimension.get("values")
        if not isinstance(dimension_id, str) or not isinstance(values, list):
            continue
        dimensions[dimension_id] = {value for value in values if isinstance(value, str)}
        seen_composites: set[str] = set()
        for composite_index, composite in enumerate(items(dimension.get("composites"))):
            value = composite.get("value")
            members = composite.get("members")
            location = f"/scopeDimensions/{dimension_index}/composites/{composite_index}"
            if not isinstance(value, str) or not isinstance(members, list):
                continue
            if value in seen_composites or value not in dimensions[dimension_id] or any(
                member not in dimensions[dimension_id] or member == value for member in members
            ):
                diagnostics.append(Diagnostic("SCOPE_COMPOSITE_INVALID", location, "Composite and members must be distinct declared values"))
            seen_composites.add(value)
            composites[(dimension_id, value)] = [member for member in members if isinstance(member, str)]

    view_scope_identities: list[tuple[Any, tuple[tuple[str, str], ...]]] = []
    for index, view in enumerate(views):
        landscape_id = view.get("landscapeId")
        if landscape_id not in landscape_by_id:
            diagnostics.append(Diagnostic("VIEW_LANDSCAPE_UNKNOWN", f"/views/{index}/landscapeId", f"Unknown landscape {landscape_id!r}"))
        validate_scope(view.get("scope"), f"/views/{index}/scope", dimensions, diagnostics)
        view_scope_identities.append((landscape_id, scope_key(view.get("scope"))))
    add_duplicates(diagnostics, "DUPLICATE_VIEW_SCOPE", "/views", view_scope_identities)

    offered_scope_identities: list[tuple[Any, tuple[tuple[str, str], ...]]] = []
    referenced_view_ids: set[str] = set()
    for index, offering in enumerate(offerings):
        landscape_id = offering.get("landscapeId")
        if landscape_id not in landscape_by_id:
            diagnostics.append(Diagnostic("OFFERING_LANDSCAPE_UNKNOWN", f"/offeredScopes/{index}/landscapeId", f"Unknown landscape {landscape_id!r}"))
        scope = offering.get("scope")
        validate_scope(scope, f"/offeredScopes/{index}/scope", dimensions, diagnostics)
        offered_scope_identities.append((landscape_id, scope_key(scope)))
        resolution = offering.get("viewResolution")
        if not isinstance(resolution, dict):
            continue
        resolution_view_ids = resolution.get("viewIds") if isinstance(resolution.get("viewIds"), list) else []
        resolved_views: list[dict[str, Any]] = []
        for view_id in resolution_view_ids:
            if isinstance(view_id, str):
                referenced_view_ids.add(view_id)
            view = view_by_id.get(view_id)
            if view is None:
                diagnostics.append(Diagnostic("OFFERING_VIEW_UNKNOWN", f"/offeredScopes/{index}/viewResolution/viewIds", f"Unknown view {view_id!r}"))
                continue
            resolved_views.append(view)
            if view.get("landscapeId") != landscape_id:
                diagnostics.append(Diagnostic("OFFERING_VIEW_LANDSCAPE_MISMATCH", f"/offeredScopes/{index}/viewResolution", "Resolved view belongs to another landscape"))
        mode = resolution.get("mode")
        if mode == "single" and len(resolved_views) == 1 and scope_key(resolved_views[0].get("scope")) != scope_key(scope):
            diagnostics.append(Diagnostic("SINGLE_VIEW_SCOPE_MISMATCH", f"/offeredScopes/{index}/viewResolution", "Single resolution requires an exact authored scope"))
        if mode == "merge" and resolved_views:
            merge_dimension = resolution.get("mergeDimension")
            offered_scope = scope if isinstance(scope, dict) else {}
            composite_members = composites.get((merge_dimension, offered_scope.get(merge_dimension)))
            if composite_members is None:
                diagnostics.append(Diagnostic("MERGE_DIMENSION_INVALID", f"/offeredScopes/{index}/viewResolution/mergeDimension", "Merge dimension must name a declared composite value"))
            else:
                actual_members: list[Any] = []
                mismatch = False
                for view in resolved_views:
                    view_scope = view.get("scope") if isinstance(view.get("scope"), dict) else {}
                    if set(view_scope) != set(offered_scope):
                        mismatch = True
                    for key, value in offered_scope.items():
                        if key != merge_dimension and view_scope.get(key) != value:
                            mismatch = True
                    actual_members.append(view_scope.get(merge_dimension))
                if mismatch:
                    diagnostics.append(Diagnostic("MERGE_VIEW_SCOPE_MISMATCH", f"/offeredScopes/{index}/viewResolution", "Merged views must match every non-merge scope dimension exactly"))
                if actual_members != composite_members:
                    diagnostics.append(Diagnostic("MERGE_MEMBER_MISMATCH", f"/offeredScopes/{index}/viewResolution/viewIds", f"Expected ordered composite members {composite_members!r}"))
    add_duplicates(diagnostics, "DUPLICATE_OFFERED_SCOPE", "/offeredScopes", offered_scope_identities)

    for index, view in enumerate(views):
        if view.get("viewId") not in referenced_view_ids:
            diagnostics.append(Diagnostic("VIEW_UNOFFERED", f"/views/{index}/viewId", "Every registered view needs an explicit offered-scope resolution"))
    for index, landscape in enumerate(landscapes):
        default_id = landscape.get("defaultOfferingId")
        if not isinstance(default_id, str):
            continue
        offering = offering_by_id.get(default_id)
        if offering is None:
            diagnostics.append(Diagnostic("DEFAULT_OFFERING_UNKNOWN", f"/landscapes/{index}/defaultOfferingId", f"Unknown offering {default_id!r}"))
        elif offering.get("landscapeId") != landscape.get("landscapeId"):
            diagnostics.append(Diagnostic("DEFAULT_OFFERING_LANDSCAPE_MISMATCH", f"/landscapes/{index}/defaultOfferingId", "Default offering belongs to another landscape"))
        else:
            resolution = offering.get("viewResolution")
            resolved_default_views = [
                view_by_id.get(view_id)
                for view_id in (resolution.get("viewIds", []) if isinstance(resolution, dict) else [])
            ]
            if not resolved_default_views or any(
                view is None or view.get("landscapeId") != landscape.get("landscapeId")
                for view in resolved_default_views
            ):
                diagnostics.append(Diagnostic("ROOT_DEFAULT_VIEW_REQUIRED", f"/landscapes/{index}/defaultOfferingId", "Default offering must resolve an explicit view"))

    for index, deck in enumerate(decks):
        if deck.get("landscapeId") not in landscape_by_id:
            diagnostics.append(Diagnostic("DECK_LANDSCAPE_UNKNOWN", f"/decks/{index}/landscapeId", "Deck owner landscape is unknown"))
    for index, resource in enumerate(resources):
        if resource.get("landscapeId") not in landscape_by_id:
            diagnostics.append(Diagnostic("RESOURCE_LANDSCAPE_UNKNOWN", f"/resources/{index}/landscapeId", "Resource owner landscape is unknown"))

    artifact_paths: list[str] = []
    for collection in (landscapes, views, decks, resources):
        artifact_paths.extend(
            entry["artifactPath"]
            for entry in collection
            if isinstance(entry.get("artifactPath"), str)
        )
    indexes = catalog.get("artifactIndexes")
    if isinstance(indexes, dict):
        artifact_paths.extend(value for value in indexes.values() if isinstance(value, str))
    closure = catalog.get("dependencyClosure")
    if isinstance(closure, dict) and isinstance(closure.get("path"), str):
        artifact_paths.append(closure["path"])
    add_duplicates(diagnostics, "DUPLICATE_ARTIFACT_PATH", "/", artifact_paths)
    portable_paths: dict[str, set[str]] = {}
    for path in artifact_paths:
        portable_paths.setdefault(unicodedata.normalize("NFC", path).casefold(), set()).add(path)
    for colliding in portable_paths.values():
        if len(colliding) > 1:
            diagnostics.append(Diagnostic("PORTABLE_ARTIFACT_PATH_COLLISION", "/", f"Portable path collision: {sorted(colliding)}"))

    capabilities = set(catalog.get("capabilities")) if isinstance(catalog.get("capabilities"), list) else set()
    if "examNodes" in capabilities:
        diagnostics.append(Diagnostic("EXAM_NODES_UNVERIFIED", "/capabilities", "examNodes is forbidden until landscape payload validation exists"))
    expected_capabilities = {
        "compositionViews": bool(views or offerings),
        "memoryCards": bool(decks),
        "goalVisualizations": any(resource.get("resourceKind") == "goal-visualization" for resource in resources),
        "embeddedDependencies": any(landscape.get("role") == "embedded-fragment" for landscape in landscapes),
    }
    for capability, expected in expected_capabilities.items():
        if (capability in capabilities) != expected:
            diagnostics.append(Diagnostic("CAPABILITY_MISMATCH", "/capabilities", f"Capability {capability!r} must be {expected}"))
    return sorted(diagnostics)


def validate_catalog_against_manifest(
    catalog: dict[str, Any],
    manifest: dict[str, Any],
    catalog_path: str = "data/runtime/catalog.json",
) -> list[Diagnostic]:
    diagnostics: list[Diagnostic] = []
    binding = catalog.get("releaseBinding") if isinstance(catalog.get("releaseBinding"), dict) else {}
    for catalog_field, manifest_field in (("releaseId", "releaseId"), ("contentDigest", "contentDigest")):
        if binding.get(catalog_field) != manifest.get(manifest_field):
            diagnostics.append(Diagnostic("MANIFEST_RELEASE_BINDING_MISMATCH", f"/releaseBinding/{catalog_field}", f"Must equal manifest.{manifest_field}"))
    if catalog.get("runtimeContractVersion") != manifest.get("runtimeContractVersion"):
        diagnostics.append(Diagnostic("MANIFEST_RUNTIME_CONTRACT_MISMATCH", "/runtimeContractVersion", "Must equal manifest runtimeContractVersion"))

    manifest_files = items(manifest.get("files"))
    by_path: dict[str, list[dict[str, Any]]] = defaultdict(list)
    by_role: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in manifest_files:
        if isinstance(record.get("path"), str):
            by_path[record["path"]].append(record)
        if isinstance(record.get("role"), str):
            by_role[record["role"]].append(record)
    runtime_catalog_records = by_role.get("runtime-catalog", [])
    if len(runtime_catalog_records) != 1 or runtime_catalog_records[0].get("path") != catalog_path:
        diagnostics.append(Diagnostic("MANIFEST_RUNTIME_CATALOG_SINGLETON", "/files", "Manifest must bind exactly one runtime-catalog at the validated path"))

    expected: dict[str, set[str]] = defaultdict(set)
    for landscape in items(catalog.get("landscapes")):
        role = "embedded-goal-dependency" if landscape.get("role") == "embedded-fragment" else "canonical-landscape"
        if isinstance(landscape.get("artifactPath"), str):
            expected[role].add(landscape["artifactPath"])
    for view in items(catalog.get("views")):
        if isinstance(view.get("artifactPath"), str): expected["composition-view"].add(view["artifactPath"])
    for deck in items(catalog.get("decks")):
        if isinstance(deck.get("artifactPath"), str): expected["card-deck"].add(deck["artifactPath"])
    for resource in items(catalog.get("resources")):
        if resource.get("delivery") == "embedded" and isinstance(resource.get("artifactPath"), str):
            expected["binary-asset"].add(resource["artifactPath"])
    indexes = catalog.get("artifactIndexes") if isinstance(catalog.get("artifactIndexes"), dict) else {}
    index_roles = {
        "compositionViewsPath": "composition-view-index",
        "cardsPath": "card-index",
        "resourcesPath": "resource-index",
        "migrationAliasesPath": "migration-aliases",
    }
    for key, role in index_roles.items():
        if isinstance(indexes.get(key), str): expected[role].add(indexes[key])
    closure = catalog.get("dependencyClosure") if isinstance(catalog.get("dependencyClosure"), dict) else {}
    if isinstance(closure.get("path"), str): expected["dependency-closure"].add(closure["path"])

    for role in sorted(CATALOG_MANIFEST_ROLES):
        paths = expected.get(role, set())
        actual = {record.get("path") for record in by_role.get(role, []) if isinstance(record.get("path"), str)}
        if actual != paths:
            diagnostics.append(Diagnostic("MANIFEST_ROLE_PATH_MISMATCH", f"/files/{role}", f"Expected {sorted(paths)}, found {sorted(actual)}"))
        for path in paths:
            records = by_path.get(path, [])
            if len(records) != 1 or records[0].get("role") != role:
                diagnostics.append(Diagnostic("MANIFEST_ARTIFACT_BINDING_MISMATCH", f"/{role}/{path}", "Catalog path must resolve to exactly one manifest record with the expected role"))

    archive_root = manifest.get("archiveRoot")
    if isinstance(archive_root, str):
        all_catalog_paths = {catalog_path, *(path for paths in expected.values() for path in paths)}
        for path in all_catalog_paths:
            if path == archive_root or path.startswith(f"{archive_root}/"):
                diagnostics.append(Diagnostic("CATALOG_PATH_ARCHIVE_ROOT_PREFIX", "/", f"Catalog path repeats archive root: {path}"))
    return sorted(diagnostics)


def pointer_parent(document: Any, pointer: str) -> tuple[Any, str]:
    if not pointer.startswith("/"):
        raise ContractError(f"Invalid JSON pointer {pointer!r}")
    tokens = [token.replace("~1", "/").replace("~0", "~") for token in pointer[1:].split("/")]
    current = document
    for token in tokens[:-1]:
        current = current[int(token)] if isinstance(current, list) else current[token]
    return current, tokens[-1]


def mutate(document: dict[str, Any], mutation: Any) -> None:
    mutation = obj(mutation, "mutation")
    operation = mutation.get("operation")
    pointer = mutation.get("pointer")
    if operation in {"set", "remove"} and isinstance(pointer, str):
        parent, token = pointer_parent(document, pointer)
        if operation == "set":
            if isinstance(parent, list):
                parent[int(token)] = copy.deepcopy(mutation.get("value"))
            else:
                parent[token] = copy.deepcopy(mutation.get("value"))
        elif isinstance(parent, list):
            del parent[int(token)]
        else:
            del parent[token]
        return
    if operation == "append" and isinstance(pointer, str):
        parent, token = pointer_parent(document, pointer)
        target = parent[int(token)] if isinstance(parent, list) else parent[token]
        target.append(copy.deepcopy(mutation.get("value")))
        return
    if operation == "copy-item" and isinstance(pointer, str):
        parent, token = pointer_parent(document, pointer)
        target = parent[int(token)] if isinstance(parent, list) else parent[token]
        target.append(copy.deepcopy(target[int(mutation.get("index", 0))]))
        return
    raise ContractError(f"Unsupported mutation {mutation!r}")


def exact_keys(value: dict[str, Any], expected: set[str], location: str) -> None:
    if set(value) != expected:
        raise ContractError(f"{location} keys must be exactly {sorted(expected)}, found {sorted(value)}")


def validate_fixtures(contract_dir: Path, validator: Draft202012Validator, verbose: bool) -> tuple[int, int, list[str]]:
    fixture_root = contract_dir / "fixtures" / "runtime-catalog"
    valid_paths = sorted((fixture_root / "valid").glob("*.json"))
    suite_paths = sorted((fixture_root / "invalid").glob("*.json"))
    if not valid_paths or not suite_paths:
        raise ContractError("Runtime catalog fixtures are incomplete")
    failures: list[str] = []
    valid_docs: dict[Path, dict[str, Any]] = {}
    valid_count = 0
    invalid_count = 0
    for path in valid_paths:
        document = obj(load_json(path), str(path))
        diagnostics = validate_catalog(document, validator)
        if diagnostics:
            failures.append(f"valid {path.name}: " + "; ".join(f"{d.code} {d.location}" for d in diagnostics))
        else:
            valid_count += 1
            valid_docs[path.resolve()] = document
            if verbose:
                print(f"PASS valid {path.name}")
    for suite_path in suite_paths:
        suite = obj(load_json(suite_path), str(suite_path))
        exact_keys(
            suite,
            {"fixtureFormatVersion", "baseCatalog", "cases", "expectedLocationsByCase"},
            str(suite_path),
        )
        expected_locations_by_case = suite.get("expectedLocationsByCase")
        if (
            suite.get("fixtureFormatVersion") != 1
            or not isinstance(suite.get("cases"), list)
            or not isinstance(expected_locations_by_case, dict)
        ):
            raise ContractError(f"Malformed fixture suite {suite_path}")
        base_path = (suite_path.parent / suite["baseCatalog"]).resolve()
        base = valid_docs.get(base_path) or obj(load_json(base_path), str(base_path))
        seen_ids: set[str] = set()
        for case in suite.get("cases", []):
            case = obj(case, "case")
            exact_keys(case, {"id", "mutations", "expectedErrorCodes"}, "fixture case")
            if not isinstance(case.get("id"), str) or case["id"] in seen_ids or not isinstance(case.get("mutations"), list) or not isinstance(case.get("expectedErrorCodes"), list):
                raise ContractError("Malformed or duplicate fixture case")
            seen_ids.add(case["id"])
            expected_codes = case["expectedErrorCodes"]
            expected_locations = expected_locations_by_case.get(case["id"])
            if (
                not expected_codes
                or not all(isinstance(code, str) for code in expected_codes)
                or not isinstance(expected_locations, list)
                or len(expected_locations) != len(expected_codes)
                or not all(isinstance(location, str) for location in expected_locations)
            ):
                raise ContractError(f"Fixture {case['id']!r} has malformed exact diagnostics")
            candidate = copy.deepcopy(base)
            for mutation in case.get("mutations", []):
                mutate(candidate, mutation)
            diagnostics = validate_catalog(candidate, validator)
            actual = Counter((diagnostic.code, diagnostic.location) for diagnostic in diagnostics)
            expected = Counter(zip(expected_codes, expected_locations))
            if actual != expected:
                failures.append(
                    f"invalid {case.get('id')}: expected {sorted(expected.elements())}, "
                    f"got {sorted(actual.elements())}"
                )
            else:
                invalid_count += 1
                if verbose:
                    print(
                        f"PASS invalid {case.get('id')}: "
                        + ", ".join(code for code, _location in sorted(actual.elements()))
                    )
        if set(expected_locations_by_case) != seen_ids:
            raise ContractError("Fixture exact-location inventory differs from case IDs")
    raw_paths = sorted((fixture_root / "raw-invalid").glob("*.json"))
    if not raw_paths:
        raise ContractError("Missing raw invalid fixture")
    for raw_path in raw_paths:
        try:
            load_json(raw_path)
            failures.append(f"raw invalid {raw_path.name}: parser unexpectedly accepted input")
        except DuplicateJsonKeyError:
            invalid_count += 1
            if verbose:
                print(f"PASS raw invalid {raw_path.name}: DUPLICATE_JSON_KEY")
    try:
        parse_json_bytes(b" " * (MAX_RAW_JSON_BYTES + 1), "generated-oversized-raw-fixture")
        failures.append("raw invalid generated-oversized-raw-fixture: size guard unexpectedly accepted input")
    except ContractError as error:
        if "Raw JSON exceeds" not in str(error):
            failures.append(f"raw invalid generated-oversized-raw-fixture: wrong failure {error}")
        else:
            invalid_count += 1
            if verbose:
                print("PASS raw invalid generated-oversized-raw-fixture: RAW_JSON_TOO_LARGE")
    return valid_count, invalid_count, failures


def validate_binding_fixtures(contract_dir: Path, verbose: bool) -> tuple[int, list[str]]:
    binding_paths = sorted((contract_dir / "fixtures" / "runtime-catalog" / "binding").glob("*.json"))
    failures: list[str] = []
    count = 0
    if not binding_paths:
        raise ContractError("Missing catalog/manifest binding fixture")
    for path in binding_paths:
        suite = obj(load_json(path), str(path))
        exact_keys(
            suite,
            {
                "fixtureFormatVersion",
                "baseCatalog",
                "baseManifest",
                "catalogPath",
                "cases",
                "expectedLocationsByCase",
            },
            str(path),
        )
        expected_locations_by_case = suite.get("expectedLocationsByCase")
        if (
            suite.get("fixtureFormatVersion") != 1
            or not isinstance(suite.get("cases"), list)
            or not isinstance(expected_locations_by_case, dict)
        ):
            raise ContractError("Malformed binding fixture suite")
        catalog = obj(load_json((path.parent / suite["baseCatalog"]).resolve()), "binding base catalog")
        manifest = obj(load_json((path.parent / suite["baseManifest"]).resolve()), "binding base manifest")
        seen: set[str] = set()
        for raw_case in suite["cases"]:
            case = obj(raw_case, "binding case")
            allowed = {"id", "catalogMutations", "manifestMutations", "expectedErrorCodes", "catalogPath"}
            if set(case) - allowed or {"id", "catalogMutations", "manifestMutations", "expectedErrorCodes"} - set(case):
                raise ContractError("Malformed binding fixture case")
            case_id = case["id"]
            if not isinstance(case_id, str) or case_id in seen:
                raise ContractError("Duplicate binding fixture ID")
            if not all(isinstance(case.get(key), list) for key in ("catalogMutations", "manifestMutations", "expectedErrorCodes")) or not all(isinstance(code, str) for code in case["expectedErrorCodes"]):
                raise ContractError("Binding fixture arrays are malformed")
            expected_locations = expected_locations_by_case.get(case_id)
            if (
                not isinstance(expected_locations, list)
                or len(expected_locations) != len(case["expectedErrorCodes"])
                or not all(isinstance(location, str) for location in expected_locations)
            ):
                raise ContractError(f"Binding fixture {case_id!r} has malformed exact locations")
            seen.add(case_id)
            candidate_catalog = copy.deepcopy(catalog)
            candidate_manifest = copy.deepcopy(manifest)
            for mutation in case["catalogMutations"]: mutate(candidate_catalog, mutation)
            for mutation in case["manifestMutations"]: mutate(candidate_manifest, mutation)
            diagnostics = validate_catalog_against_manifest(candidate_catalog, candidate_manifest, case.get("catalogPath", suite["catalogPath"]))
            actual = Counter((diagnostic.code, diagnostic.location) for diagnostic in diagnostics)
            expected = Counter(zip(case["expectedErrorCodes"], expected_locations))
            if actual != expected:
                failures.append(
                    f"binding {case_id}: expected {sorted(expected.elements())}, "
                    f"got {sorted(actual.elements())}"
                )
            else:
                count += 1
                if verbose:
                    print(
                        f"PASS binding {case_id}: "
                        + (", ".join(code for code, _location in sorted(actual.elements())) or "valid")
                    )
        if set(expected_locations_by_case) != seen:
            raise ContractError("Binding exact-location inventory differs from case IDs")
    return count, failures


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--contracts-dir", type=Path, default=DEFAULT_CONTRACT_DIR)
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()
    try:
        installed_jsonschema = version("jsonschema")
        if installed_jsonschema != JSONSCHEMA_VERSION:
            raise ContractError(f"jsonschema {JSONSCHEMA_VERSION} required, found {installed_jsonschema}")
        contract_dir = args.contracts_dir.resolve()
        schema = obj(load_json(contract_dir / "runtime-catalog.schema.json"), "runtime catalog schema")
        Draft202012Validator.check_schema(schema)
        if schema.get("$id") != SCHEMA_ID:
            raise ContractError(f"Unexpected schema ID {schema.get('$id')!r}")
        validator = Draft202012Validator(schema, format_checker=FormatChecker())
        valid_count, invalid_count, failures = validate_fixtures(contract_dir, validator, args.verbose)
        binding_count, binding_failures = validate_binding_fixtures(contract_dir, args.verbose)
        failures.extend(binding_failures)
    except (ContractError, KeyError, IndexError, TypeError, ValueError) as error:
        print(f"FAIL runtime catalog contract definition: {error}", file=sys.stderr)
        return 1
    if failures:
        for failure in failures:
            print(f"FAIL {failure}", file=sys.stderr)
        return 1
    print(f"Runtime catalog contract validation passed: {valid_count} valid fixture(s), {invalid_count} invalid fixture case(s), {binding_count} binding case(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
