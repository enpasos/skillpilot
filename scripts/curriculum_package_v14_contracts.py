"""Unpublished runtime 1.4: versioned voluntary composition offers.

The successor retains the exact 1.3 resource and field-semantics contracts.
Only source-view 1.3 is projected to the new runtime view component; older
views retain their existing component and bytes.
"""
from pathlib import Path

try:
    from . import curriculum_package_v13_contracts as previous
except ImportError:
    import curriculum_package_v13_contracts as previous

PROFILE_ID = "full-standalone-v1.4"
BUILD_PROFILE_ID = "de-gymnasium-mathematik-release-model-v1.4"
RUNTIME_CONTRACT_VERSION = "1.4"
CAPABILITY = previous.CAPABILITY
SCHEMA_PREFIX = "https://skillpilot.com/schemas/curriculum-package/v1.4/"
CATALOG_SCHEMA_ID = SCHEMA_PREFIX + "runtime-catalog.schema.json"
RESOURCE_SCHEMA_ID = previous.RESOURCE_SCHEMA_ID
BUILD_PROFILE_SCHEMA_ID = SCHEMA_PREFIX + "release-model-build-profile.schema.json"
SOURCE_VIEW_SCHEMA_ID = "https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json"
SOURCE_VIEW_SCHEMA_PATH = "contracts/composition-view/v1.3/composition-view.schema.json"
VIEW_SCHEMA_ID = SCHEMA_PREFIX + "runtime-composition-view.schema.json"
VIEW_SCHEMA_PATH = "contracts/curriculum-package/v1.4/runtime-composition-view.schema.json"
FIELD_REGISTRY_NAME = previous.FIELD_REGISTRY_NAME
REGISTRY_ID = previous.REGISTRY_ID
REVIEW_SCHEMA_ID = SCHEMA_PREFIX + "package-redistribution-review.schema.json"
task_material_uses = previous.task_material_uses
validate_child_orders = previous.validate_child_orders


def extended_directory(directory: Path) -> bool:
    return profile_path(directory).is_file()


def profile_path(directory: Path) -> Path:
    return directory / "profiles" / f"{PROFILE_ID}.profile.json"


def extra_schemas(directory: Path) -> tuple[tuple[str, Path], ...]:
    return (*previous.extra_schemas(directory.parent / "v1.3"),
            (CATALOG_SCHEMA_ID, directory / "runtime-catalog.schema.json"),
            (VIEW_SCHEMA_ID, directory / "runtime-composition-view.schema.json"))


def schema_package_path(schema_id: str) -> str:
    if schema_id.startswith(SCHEMA_PREFIX):
        return "schemas/v1.4/" + schema_id.rsplit("/", 1)[-1]
    return previous.schema_package_path(schema_id)


def is_build_profile(value: object) -> bool:
    return isinstance(value, dict) and value.get("$schema") == BUILD_PROFILE_SCHEMA_ID


def validate_acquisition_placements(view: dict, goals: dict) -> None:
    if view.get("$schema") == VIEW_SCHEMA_ID and view.get("viewFormatVersion") == "1.3":
        # The placement rule is unchanged; the predecessor checks its own
        # closed header, so adapt a private copy rather than mutate the view.
        previous.validate_acquisition_placements(
            {**view, "$schema": previous.VIEW_SCHEMA_ID, "viewFormatVersion": "1.2"}, goals)
    else:
        previous.validate_acquisition_placements(view, goals)


def validators(root: Path):
    from jsonschema import Draft202012Validator, FormatChecker
    from referencing import Registry, Resource
    from referencing.exceptions import NoSuchResource
    import json

    def offline(uri: str):
        raise NoSuchResource(ref=uri)

    registry = Registry(retrieve=offline)
    schemas = {}
    for version in ("v1", "v1.2", "v1.3", "v1.4"):
        for path in (root / "contracts/curriculum-package" / version).glob("*.schema.json"):
            schema = json.loads(path.read_text(encoding="utf-8"))
            Draft202012Validator.check_schema(schema)
            schemas[schema["$id"]] = schema
            registry = registry.with_resource(schema["$id"], Resource.from_contents(schema))
    return {identifier: Draft202012Validator(schema, registry=registry, format_checker=FormatChecker())
            for identifier, schema in schemas.items()}
