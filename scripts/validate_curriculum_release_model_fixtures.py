#!/usr/bin/env python3
"""Validate the small DPK-004a release-model contract fixtures.

The real Mathematik conformance run proves the production compiler output.  This
separate harness keeps the illustrative embedded-dependency and migration
fixtures executable: schemas are resolved only from the checked-in contract
set, trust bindings are pinned to the current files, and cross-document
ownership/fixed-point invariants are tested with adversarial mutations.
"""

from __future__ import annotations

import copy
import hashlib
import json
import math
import sys
from collections import defaultdict, deque
from pathlib import Path
from typing import Any, Iterable, Mapping

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource
from referencing.exceptions import NoSuchResource


sys.dont_write_bytecode = True

REPO_ROOT = Path(__file__).resolve().parents[1]
CONTRACT_ROOT = REPO_ROOT / "contracts/curriculum-package/v1"
FIXTURE_ROOT = CONTRACT_ROOT / "fixtures/release-model/valid"
MAX_JSON_BYTES = 32 * 1024 * 1024

SCHEMA_PATHS = {
    "https://skillpilot.com/schemas/curriculum-package/v1/compiled-landscape.schema.json": CONTRACT_ROOT
    / "compiled-landscape.schema.json",
    "https://skillpilot.com/schemas/curriculum-package/v1/dependency-closure.schema.json": CONTRACT_ROOT
    / "dependency-closure.schema.json",
    "https://skillpilot.com/schemas/curriculum-package/v1/embedded-goal-dependency.schema.json": CONTRACT_ROOT
    / "embedded-goal-dependency.schema.json",
    "https://skillpilot.com/schemas/curriculum-package/v1/migration-aliases.schema.json": CONTRACT_ROOT
    / "migration-aliases.schema.json",
}

REGISTRY_PATH = (
    CONTRACT_ROOT / "profiles/skillpilot-fwu-field-semantics-v1.registry.json"
)
DEFINITION_PROFILE_PATH = (
    CONTRACT_ROOT / "profiles/canonical-definition-record-v1.profile.json"
)


class ContractError(RuntimeError):
    """A fixture violates a closed release-model contract invariant."""


def fail(code: str, message: str) -> None:
    raise ContractError(f"{code}: {message}")


def strict_json_loads(raw: bytes, source: str) -> Any:
    if len(raw) > MAX_JSON_BYTES:
        fail("JSON_SIZE", f"JSON exceeds {MAX_JSON_BYTES} bytes: {source}")

    def object_pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
        result: dict[str, Any] = {}
        for key, value in pairs:
            if key in result:
                fail("JSON_DUPLICATE_KEY", f"Duplicate key {key!r} in {source}")
            result[key] = value
        return result

    def reject_constant(value: str) -> Any:
        fail("JSON_NUMBER", f"Non-RFC-8259 number {value!r} in {source}")

    try:
        value = json.loads(
            raw.decode("utf-8"),
            object_pairs_hook=object_pairs,
            parse_constant=reject_constant,
        )
    except ContractError:
        raise
    except (UnicodeError, json.JSONDecodeError) as error:
        fail("JSON_PARSE", f"Cannot parse {source}: {error}")
    validate_scalars(value, source)
    return value


def validate_scalars(value: Any, source: str) -> None:
    if isinstance(value, float) and not math.isfinite(value):
        fail("JSON_NUMBER", f"Non-finite number in {source}")
    if isinstance(value, str):
        for character in value:
            codepoint = ord(character)
            if 0xD800 <= codepoint <= 0xDFFF:
                fail("JSON_UNICODE", f"Unpaired surrogate in {source}")
            if codepoint in {0xFFFE, 0xFFFF}:
                fail("JSON_UNICODE", f"Forbidden noncharacter in {source}")
    elif isinstance(value, dict):
        for key, child in value.items():
            validate_scalars(key, source)
            validate_scalars(child, source)
    elif isinstance(value, list):
        for child in value:
            validate_scalars(child, source)


def load_json(path: Path) -> Any:
    try:
        return strict_json_loads(path.read_bytes(), str(path))
    except OSError as error:
        fail("JSON_READ", f"Cannot read {path}: {error}")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def key_id(value: Mapping[str, Any]) -> str:
    return json.dumps(
        value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")
    )


def pointer_get(value: Any, pointer: str) -> Any:
    current = value
    if pointer == "":
        return current
    for raw_segment in pointer.split("/")[1:]:
        segment = raw_segment.replace("~1", "/").replace("~0", "~")
        try:
            current = current[int(segment)] if isinstance(current, list) else current[segment]
        except (IndexError, KeyError, TypeError, ValueError):
            fail("JSON_POINTER", f"Pointer does not resolve: {pointer}")
    return current


def trusted_binding(path: Path, id_field: str, version_field: str) -> dict[str, str]:
    value = load_json(path)
    return {
        "id": value[id_field],
        "version": value[version_field],
        "sha256": sha256_file(path),
    }


def build_validators() -> dict[str, Draft202012Validator]:
    schemas: dict[str, Any] = {}
    for schema_id, path in SCHEMA_PATHS.items():
        schema = load_json(path)
        Draft202012Validator.check_schema(schema)
        if schema.get("$id") != schema_id:
            fail("SCHEMA_ID", f"Unexpected $id in {path}")
        schemas[schema_id] = schema

    def reject_remote(uri: str) -> Resource[Any]:
        raise NoSuchResource(ref=uri)

    registry: Registry[Any] = Registry(retrieve=reject_remote)
    for schema_id, schema in schemas.items():
        registry = registry.with_resource(schema_id, Resource.from_contents(schema))
    return {
        schema_id: Draft202012Validator(
            schema, registry=registry, format_checker=FormatChecker()
        )
        for schema_id, schema in schemas.items()
    }


def validate_schema(
    value: Any,
    validators: Mapping[str, Draft202012Validator],
    label: str,
) -> None:
    schema_id = value.get("$schema") if isinstance(value, dict) else None
    validator = validators.get(schema_id)
    if validator is None:
        fail("SCHEMA_UNKNOWN", f"Unknown fixture schema for {label}: {schema_id!r}")
    errors = sorted(
        validator.iter_errors(value),
        key=lambda item: tuple(str(part) for part in item.absolute_path),
    )
    if errors:
        error = errors[0]
        location = "/" + "/".join(str(part) for part in error.absolute_path)
        fail("SCHEMA_INVALID", f"{label}{location}: {error.message}")


def require_equal(actual: Any, expected: Any, code: str, message: str) -> None:
    if actual != expected:
        fail(code, f"{message}: expected {expected!r}, got {actual!r}")


def validate_trust_bindings(closure: Mapping[str, Any]) -> None:
    require_equal(
        closure["fieldSemanticsRegistry"],
        trusted_binding(REGISTRY_PATH, "registryId", "version"),
        "TRUST_REGISTRY",
        "Field-semantics registry binding is stale",
    )
    require_equal(
        closure["definitionDigestProfile"],
        trusted_binding(DEFINITION_PROFILE_PATH, "profileId", "version"),
        "TRUST_DEFINITION_PROFILE",
        "Definition-digest profile binding is stale",
    )


def validate_closure(
    closure: Mapping[str, Any],
    fragment: Mapping[str, Any] | None = None,
) -> None:
    validate_trust_bindings(closure)
    definitions: dict[str, Mapping[str, Any]] = {}
    for definition in closure["definitions"]:
        encoded = key_id(definition["key"])
        if encoded in definitions:
            fail("DEFINITION_DUPLICATE", f"Duplicate definition key {encoded}")
        definitions[encoded] = definition

    references: set[tuple[str, str, str, str]] = set()
    adjacency: dict[str, set[str]] = defaultdict(set)
    for reference in closure["references"]:
        source = key_id(reference["source"])
        target = key_id(reference["target"])
        signature = (
            source,
            reference["sourcePointer"],
            reference["registryEntryId"],
            target,
        )
        if signature in references:
            fail("REFERENCE_DUPLICATE", f"Duplicate reference {signature}")
        references.add(signature)
        if source not in definitions:
            fail("REFERENCE_SOURCE", f"Undefined reference source {source}")
        if reference["strength"] == "hard":
            if target not in definitions:
                fail("REFERENCE_TARGET", f"Undefined hard-reference target {target}")
            expected_resolution = definitions[target]["provision"]
            require_equal(
                reference["resolution"],
                expected_resolution,
                "REFERENCE_RESOLUTION",
                f"Wrong resolution for {target}",
            )
            adjacency[source].add(target)

    seeds = [key_id(seed) for seed in closure["seeds"]]
    if len(seeds) != len(set(seeds)):
        fail("SEED_DUPLICATE", "Closure seeds are not unique")
    for seed in seeds:
        if seed not in definitions:
            fail("SEED_UNDEFINED", f"Undefined seed {seed}")
    reachable: set[str] = set()
    queue = deque(seeds)
    while queue:
        current = queue.popleft()
        if current in reachable:
            continue
        reachable.add(current)
        queue.extend(sorted(adjacency[current]))
    require_equal(
        set(definitions),
        reachable,
        "CLOSURE_FIXED_POINT",
        "Definitions must equal the hard-reference closure of the seeds",
    )

    conflict = closure["conflictCheck"]
    require_equal(
        conflict["candidateDefinitionCount"],
        len(definitions) + conflict["deduplicatedDefinitionCount"],
        "CONFLICT_COUNT",
        "Conflict candidate count is inconsistent",
    )
    require_equal(conflict["conflicts"], [], "CONFLICT_STATE", "Valid fixture has conflicts")
    require_equal(conflict["result"], "compatible", "CONFLICT_STATE", "Valid fixture is incompatible")

    metadata_by_id: dict[str, Mapping[str, Any]] = {}
    for metadata in closure["embeddedFragments"]:
        fragment_id = metadata["fragmentId"]
        if fragment_id in metadata_by_id:
            fail("FRAGMENT_DUPLICATE", f"Duplicate fragment metadata {fragment_id}")
        metadata_by_id[fragment_id] = metadata
        expected_keys = {
            key_id(definition["key"])
            for definition in definitions.values()
            if definition["provision"] == "embedded"
            and definition.get("fragmentId") == fragment_id
        }
        actual_keys = {key_id(key) for key in metadata["definitionKeys"]}
        require_equal(
            actual_keys,
            expected_keys,
            "EMBEDDED_KEYS",
            f"Fragment definition keys differ for {fragment_id}",
        )
        for encoded in expected_keys:
            definition = definitions[encoded]
            for field in (
                "ownerPackageId",
                "sourceReleaseId",
                "sourceContentDigest",
                "fragmentId",
            ):
                require_equal(
                    definition.get(field),
                    metadata.get(field),
                    "EMBEDDED_OWNERSHIP",
                    f"Embedded definition {encoded} differs in {field}",
                )

    embedded_fragment_ids = {
        definition.get("fragmentId")
        for definition in definitions.values()
        if definition["provision"] == "embedded"
    }
    require_equal(
        embedded_fragment_ids,
        set(metadata_by_id),
        "EMBEDDED_METADATA",
        "Embedded definitions and metadata disagree",
    )
    if fragment is None:
        if metadata_by_id:
            fail("FRAGMENT_MISSING", "Embedded closure fixture needs its fragment document")
        return

    fragment_id = fragment["fragmentId"]
    metadata = metadata_by_id.get(fragment_id)
    if metadata is None:
        fail("FRAGMENT_METADATA", f"No closure metadata for {fragment_id}")
    require_equal(
        fragment["hostReleaseBinding"],
        closure["releaseBinding"],
        "HOST_BINDING",
        "Fragment host binding differs from closure",
    )
    for field in (
        "ownerPackageId",
        "sourceReleaseId",
        "sourceContentDigest",
        "fragmentOfLandscapeId",
        "completeness",
        "completeOwnerLandscape",
    ):
        require_equal(
            fragment["ownership"].get(field),
            metadata.get(field),
            "FRAGMENT_OWNERSHIP",
            f"Fragment ownership differs in {field}",
        )
    require_equal(
        fragment["fragmentDigest"],
        metadata["fragmentDigest"],
        "FRAGMENT_DIGEST",
        "Fragment digest differs from closure metadata",
    )
    require_equal(
        fragment["content"]["landscapeId"],
        fragment["ownership"]["fragmentOfLandscapeId"],
        "FRAGMENT_LANDSCAPE",
        "Fragment content has the wrong owner landscape",
    )

    bindings: dict[str, Mapping[str, Any]] = {}
    for binding in fragment["recordBindings"]:
        encoded = key_id(binding["key"])
        if encoded in bindings:
            fail("RECORD_DUPLICATE", f"Duplicate record binding {encoded}")
        record = pointer_get(fragment, binding["jsonPointer"])
        kind = binding["key"].get("kind")
        if kind == "goal":
            pointer_matches = record.get("id") == binding["key"].get("id")
        elif kind == "competency-entry":
            pointer_matches = (
                record.get("id") == binding["key"].get("id")
                and binding["key"].get("landscapeId")
                == fragment["content"]["landscapeId"]
            )
        else:
            pointer_matches = False
        if not pointer_matches:
            fail("RECORD_POINTER", f"Record binding points at the wrong definition: {encoded}")
        definition = definitions.get(encoded)
        if definition is None or definition.get("fragmentId") != fragment_id:
            fail("RECORD_DEFINITION", f"Record binding is not in closure fragment: {encoded}")
        require_equal(
            binding["definitionDigest"],
            definition["definitionDigest"],
            "RECORD_DIGEST",
            f"Record digest differs for {encoded}",
        )
        bindings[encoded] = binding

    content_goals = fragment["content"]["goals"]
    expected_keys = {key_id({"kind": "goal", "id": goal["id"]}) for goal in content_goals}
    expected_keys.update(
        key_id(
            {
                "kind": "competency-entry",
                "landscapeId": fragment["content"]["landscapeId"],
                "id": competency["id"],
            }
        )
        for competency in fragment["content"].get("competencyCatalog", [])
    )
    require_equal(
        set(bindings),
        expected_keys,
        "RECORD_COVERAGE",
        "Record bindings do not cover fragment goals exactly",
    )
    require_equal(
        expected_keys,
        {key_id(key) for key in metadata["definitionKeys"]},
        "FRAGMENT_COVERAGE",
        "Fragment content and closure metadata differ",
    )

    expected_embedded_references: set[tuple[str, str, str, str]] = set()
    for goal_index, goal in enumerate(content_goals):
        source = key_id({"kind": "goal", "id": goal["id"]})
        for field, registry_id in (("contains", "goal.contains"), ("requires", "goal.requires")):
            for target_index, target_id in enumerate(goal[field]):
                target = key_id({"kind": "goal", "id": target_id})
                if target not in expected_keys:
                    fail(
                        "FRAGMENT_FIXED_POINT",
                        f"Fragment omits transitive hard-reference target {target_id}",
                    )
                expected_embedded_references.add(
                    (
                        source,
                        f"/content/goals/{goal_index}/{field}/{target_index}",
                        registry_id,
                        target,
                    )
                )
        for field, registry_id in (
            ("competencyRefs", "goal.competency-refs"),
            ("kompetenzen", "goal.kompetenzen"),
        ):
            for target_index, target_id in enumerate(goal.get(field, [])):
                target = key_id(
                    {
                        "kind": "competency-entry",
                        "landscapeId": fragment["content"]["landscapeId"],
                        "id": target_id,
                    }
                )
                if target not in expected_keys:
                    fail(
                        "FRAGMENT_FIXED_POINT",
                        f"Fragment omits competency hard-reference target {target_id}",
                    )
                expected_embedded_references.add(
                    (
                        source,
                        f"/content/goals/{goal_index}/{field}/{target_index}",
                        registry_id,
                        target,
                    )
                )
    actual_embedded_references = {
        signature for signature in references if signature[0] in expected_keys
    }
    require_equal(
        actual_embedded_references,
        expected_embedded_references,
        "EMBEDDED_REFERENCE_SET",
        "Closure references do not exactly represent embedded hard references",
    )


def validate_migration(value: Mapping[str, Any]) -> None:
    current = value["currentRelease"]
    require_equal(
        current["releaseId"],
        f'{current["packageId"]}@{current["packageVersion"]}',
        "MIGRATION_RELEASE",
        "Current release identity is inconsistent",
    )
    baseline = value["baseline"]
    if baseline["mode"] == "initial":
        require_equal(value["rules"], [], "MIGRATION_INITIAL", "Initial release has rules")
    else:
        require_equal(
            baseline["releaseId"],
            f'{baseline["packageId"]}@{baseline["packageVersion"]}',
            "MIGRATION_BASELINE",
            "Baseline release identity is inconsistent",
        )

    relation_policy = {
        "renamed": (1, 1, "copy-exact", "preserve-original-and-add-alias"),
        "replacedBy": (1, 1, "reassess", "preserve-with-successor-links"),
        "splitInto": (1, None, "reassess", "preserve-with-successor-links"),
        "mergedInto": (None, 1, "reassess", "preserve-with-successor-links"),
        "removed": (1, 0, "retire", "preserve-retired"),
    }
    migration_ids: set[str] = set()
    source_ids: set[str] = set()
    for rule in value["rules"]:
        if rule["migrationId"] in migration_ids:
            fail("MIGRATION_DUPLICATE", f'Duplicate migration {rule["migrationId"]}')
        migration_ids.add(rule["migrationId"])
        source_count, target_count, mastery, history = relation_policy[rule["relation"]]
        if source_count is not None and len(rule["sources"]) != source_count:
            fail("MIGRATION_CARDINALITY", f'Wrong source count for {rule["relation"]}')
        if source_count is None and len(rule["sources"]) < 2:
            fail("MIGRATION_CARDINALITY", f'Wrong source count for {rule["relation"]}')
        if target_count is not None and len(rule["targets"]) != target_count:
            fail("MIGRATION_CARDINALITY", f'Wrong target count for {rule["relation"]}')
        if target_count is None and len(rule["targets"]) < 2:
            fail("MIGRATION_CARDINALITY", f'Wrong target count for {rule["relation"]}')
        require_equal(
            (rule["masteryPolicy"], rule["historyPolicy"]),
            (mastery, history),
            "MIGRATION_POLICY",
            f'Wrong policy for {rule["relation"]}',
        )
        for source in rule["sources"]:
            goal_id = source["goalId"]
            if goal_id in source_ids:
                fail("MIGRATION_SOURCE_REUSE", f"Migration source reused: {goal_id}")
            source_ids.add(goal_id)
        if rule["relation"] == "renamed":
            require_equal(
                rule["sources"][0]["semanticBodyDigest"],
                rule["targets"][0]["semanticBodyDigest"],
                "MIGRATION_RENAME_BODY",
                "Renamed goal changes its semantic body",
            )


def expect_failure(name: str, code: str, action: Any) -> None:
    try:
        action()
    except ContractError as error:
        if not str(error).startswith(code + ":"):
            fail("SELF_TEST_CODE", f"{name} failed with {error}, expected {code}")
        return
    fail("SELF_TEST_ACCEPTED", f"Adversarial case was accepted: {name}")


def main() -> int:
    validators = build_validators()
    fixtures = {path.name: load_json(path) for path in sorted(FIXTURE_ROOT.glob("*.json"))}
    expected_names = {
        "all-relations.migration-aliases.json",
        "embedded-fixed-point.dependency-closure.json",
        "embedded-fixed-point.embedded-goal-dependency.json",
        "local-initial.dependency-closure.json",
        "local-initial.migration-aliases.json",
    }
    require_equal(set(fixtures), expected_names, "FIXTURE_INVENTORY", "Fixture inventory differs")
    for name, value in fixtures.items():
        validate_schema(value, validators, name)

    local_closure = fixtures["local-initial.dependency-closure.json"]
    embedded_closure = fixtures["embedded-fixed-point.dependency-closure.json"]
    embedded_fragment = fixtures["embedded-fixed-point.embedded-goal-dependency.json"]
    initial_migration = fixtures["local-initial.migration-aliases.json"]
    relation_migration = fixtures["all-relations.migration-aliases.json"]
    validate_closure(local_closure)
    validate_closure(embedded_closure, embedded_fragment)
    validate_migration(initial_migration)
    validate_migration(relation_migration)

    cases: list[tuple[str, str, Any]] = []

    stale_registry = copy.deepcopy(local_closure)
    stale_registry["fieldSemanticsRegistry"]["sha256"] = "0" * 64
    cases.append(("stale-registry", "TRUST_REGISTRY", lambda: validate_closure(stale_registry)))

    missing_definition = copy.deepcopy(embedded_closure)
    missing_definition["definitions"].pop()
    cases.append(
        (
            "embedded-definition-loss",
            "REFERENCE_TARGET",
            lambda: validate_closure(missing_definition, embedded_fragment),
        )
    )

    missing_edge = copy.deepcopy(embedded_closure)
    missing_edge["references"].pop()
    cases.append(
        (
            "embedded-fixed-point-edge-loss",
            "CLOSURE_FIXED_POINT",
            lambda: validate_closure(missing_edge, embedded_fragment),
        )
    )

    wrong_owner = copy.deepcopy(embedded_fragment)
    wrong_owner["ownership"]["sourceContentDigest"] = "sha256:" + "9" * 64
    cases.append(
        (
            "fragment-owner-drift",
            "FRAGMENT_OWNERSHIP",
            lambda: validate_closure(embedded_closure, wrong_owner),
        )
    )

    wrong_record = copy.deepcopy(embedded_fragment)
    wrong_record["recordBindings"][0]["definitionDigest"] = "sha256:" + "9" * 64
    cases.append(
        (
            "fragment-record-digest",
            "RECORD_DIGEST",
            lambda: validate_closure(embedded_closure, wrong_record),
        )
    )

    missing_fragment_target = copy.deepcopy(embedded_fragment)
    missing_fragment_target["content"]["goals"].pop()
    missing_fragment_target["recordBindings"] = [
        binding
        for binding in missing_fragment_target["recordBindings"]
        if binding["key"].get("id") != "math-coordinate-system"
    ]
    cases.append(
        (
            "fragment-transitive-target-loss",
            "FRAGMENT_COVERAGE",
            lambda: validate_closure(embedded_closure, missing_fragment_target),
        )
    )

    wrong_policy = copy.deepcopy(relation_migration)
    wrong_policy["rules"][0]["masteryPolicy"] = "reassess"
    cases.append(
        (
            "migration-policy-drift",
            "MIGRATION_POLICY",
            lambda: validate_migration(wrong_policy),
        )
    )

    unknown_field = copy.deepcopy(embedded_fragment)
    unknown_field["unexpected"] = True
    cases.append(
        (
            "closed-schema-unknown-field",
            "SCHEMA_INVALID",
            lambda: validate_schema(unknown_field, validators, "mutated fragment"),
        )
    )

    for name, code, action in cases:
        expect_failure(name, code, action)

    print(
        "Curriculum release-model fixture contracts passed: "
        f"{len(fixtures)} valid documents, {len(cases)} adversarial cases, zero remote fetches."
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ContractError as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1)
