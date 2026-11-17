"""Unpublished common runtime 1.3: learning units and required assessment media.

The stage-plan authoring foundation shares this version directory. It does not
activate a plan or imply that every production reader already supports plans.
Published contracts are retained as exact, software-pinned schema components.
"""
from pathlib import Path
import re

try:
    from . import curriculum_package_learning_unit_contracts as learning_units
except ImportError:
    import curriculum_package_learning_unit_contracts as learning_units

PROFILE_ID = "full-standalone-v1.3"
BUILD_PROFILE_ID = "de-gymnasium-mathematik-release-model-v1.3"
RUNTIME_CONTRACT_VERSION = "1.3"
CAPABILITY = "assessmentMaterialsV1"
SCHEMA_PREFIX = "https://skillpilot.com/schemas/curriculum-package/v1.3/"
CATALOG_SCHEMA_ID = SCHEMA_PREFIX + "runtime-catalog.schema.json"
RESOURCE_SCHEMA_ID = SCHEMA_PREFIX + "resource-index.schema.json"
BUILD_PROFILE_SCHEMA_ID = SCHEMA_PREFIX + "release-model-build-profile.schema.json"
SOURCE_VIEW_SCHEMA_ID = "https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json"
SOURCE_VIEW_SCHEMA_PATH = "contracts/composition-view/v1.2/composition-view.schema.json"
VIEW_SCHEMA_ID = SCHEMA_PREFIX + "runtime-composition-view.schema.json"
VIEW_SCHEMA_PATH = "contracts/curriculum-package/v1.3/runtime-composition-view.schema.json"
FIELD_REGISTRY_NAME = "skillpilot-fwu-field-semantics-partial-order-v1.registry.json"
REGISTRY_ID = "skillpilot-fwu-field-semantics-partial-order-v1"
REVIEW_SCHEMA_ID = SCHEMA_PREFIX + "package-redistribution-review.schema.json"
TASK_MATERIAL_URL = re.compile(r"/assets/assessment-materials/[A-Za-z0-9._/-]+\.(?:svg|png)")


def task_material_uses(goals: list[dict]) -> list[dict]:
    uses = []
    for goal in goals:
        exam = goal.get("examData")
        if not isinstance(exam, dict):
            continue
        fields_by_url: dict[str, list[str]] = {}
        for field in ("taskContent", "taskContentEn"):
            body = exam.get(field, "")
            if not isinstance(body, str):
                continue
            for token in re.findall(r"/assets/assessment-materials/[^\s)\"'<>]+", body):
                if not TASK_MATERIAL_URL.fullmatch(token):
                    raise ValueError("Unresolved or unsupported local task-image URL: " + token)
            for url in sorted(set(TASK_MATERIAL_URL.findall(body))):
                if exam.get("reviewStatus") != "released":
                    raise ValueError("Required task media must belong to a released task")
                fields_by_url.setdefault(url, []).append(field)
        for url, fields in sorted(fields_by_url.items()):
            uses.append({"goalId": goal["id"], "url": url, "taskFields": fields})
    return sorted(uses, key=lambda item: (item["url"], item["goalId"]))


def extended_directory(directory: Path) -> bool:
    return (directory / "profiles" / f"{PROFILE_ID}.profile.json").is_file()


def profile_path(directory: Path) -> Path:
    return directory / "profiles" / f"{PROFILE_ID}.profile.json"


def extra_schemas(directory: Path) -> tuple[tuple[str, Path], ...]:
    return (*learning_units.extra_schemas(directory.parent / "v1.2"),
            (RESOURCE_SCHEMA_ID, directory / "resource-index.schema.json"),
            (CATALOG_SCHEMA_ID, directory / "runtime-catalog.schema.json"),
            (VIEW_SCHEMA_ID, directory / "runtime-composition-view.schema.json"))


def schema_package_path(schema_id: str) -> str:
    if schema_id.startswith(SCHEMA_PREFIX):
        return "schemas/v1.3/" + schema_id.rsplit("/", 1)[-1]
    return learning_units.schema_package_path(schema_id)


def is_build_profile(value: object) -> bool:
    return isinstance(value, dict) and value.get("$schema") == BUILD_PROFILE_SCHEMA_ID


def validate_child_orders(view: dict) -> None:
    """Validate local planning references after the closed view schema passes."""
    seen_structures = set()
    def visit(nodes):
        for node in nodes:
            if node.get("kind") != "structure":
                continue
            if node["id"] in seen_structures:
                raise ValueError("Duplicate composition structure identity")
            seen_structures.add(node["id"])
            children = node["children"]
            child_ids = [child["id"] for child in children if child.get("kind") == "structure"]
            if len(child_ids) != len(set(child_ids)):
                raise ValueError("Duplicate direct structure identity in composition view")
            declaration = node.get("childOrder")
            if declaration is not None:
                predecessors = {identifier: set() for identifier in child_ids}
                for edge in declaration["after"]:
                    unit, previous = edge["unit"], edge["after"]
                    if unit not in predecessors or previous not in predecessors:
                        raise ValueError("childOrder endpoints must name direct structure siblings")
                    if unit == previous or previous in predecessors[unit]:
                        raise ValueError("Self or duplicate childOrder edge")
                    predecessors[unit].add(previous)
                closure = {}
                active = set()
                def ancestors(identifier):
                    if identifier in active:
                        raise ValueError("Cycle in composition childOrder")
                    if identifier not in closure:
                        active.add(identifier)
                        found = set(predecessors[identifier])
                        for previous in predecessors[identifier]:
                            found.update(ancestors(previous))
                        active.remove(identifier)
                        closure[identifier] = found
                    return closure[identifier]
                for identifier in child_ids:
                    ancestors(identifier)
                for unit, previous_nodes in predecessors.items():
                    for previous in previous_nodes:
                        if any(previous in closure[middle] for middle in previous_nodes if middle != previous):
                            raise ValueError("Transitively redundant composition childOrder edge")
            visit(children)
    visit(view["rootNodes"])


def validate_acquisition_placements(view: dict, goals: dict) -> None:
    """An explicit presentation place requires a real canonical atomic goal."""
    pending = [(node, 0) for node in view["rootNodes"]]
    while pending:
        node, depth = pending.pop()
        if "acquisitionPlacement" in node:
            goal = goals.get(node.get("goalId"))
            if not (view.get("$schema") == VIEW_SCHEMA_ID and view.get("viewFormatVersion") == "1.2"
                    and node.get("kind") == "goalEntry" and node.get("projectionRole") == "prerequisiteOnly"
                    and node["acquisitionPlacement"] is True and depth > 0
                    and isinstance(goal, dict) and goal.get("type") == "atomic" and not goal.get("contains")):
                raise ValueError("acquisitionPlacement requires a nested prerequisiteOnly entry of a defined canonical atomic goal")
        pending.extend((child, depth + 1) for child in node.get("children", []))


def validators(root: Path):
    from jsonschema import Draft202012Validator, FormatChecker
    from referencing import Registry, Resource
    from referencing.exceptions import NoSuchResource
    import json

    def offline(uri: str):
        raise NoSuchResource(ref=uri)

    registry = Registry(retrieve=offline)
    schemas = {}
    for version in ("v1", "v1.2", "v1.3"):
        for path in (root / "contracts/curriculum-package" / version).glob("*.schema.json"):
            schema = json.loads(path.read_text(encoding="utf-8"))
            Draft202012Validator.check_schema(schema)
            schemas[schema["$id"]] = schema
            registry = registry.with_resource(schema["$id"], Resource.from_contents(schema))
    schema = json.loads((root / VIEW_SCHEMA_PATH).read_text(encoding="utf-8"))
    Draft202012Validator.check_schema(schema)
    schemas[schema["$id"]] = schema
    registry = registry.with_resource(schema["$id"], Resource.from_contents(schema))
    return {identifier: Draft202012Validator(schema, registry=registry, format_checker=FormatChecker())
            for identifier, schema in schemas.items()}
