#!/usr/bin/env python3
"""Derive the unpublished common 1.3 contracts without changing older bytes."""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
from pathlib import Path

import curriculum_learning_units as learning_units
import curriculum_package_v13_contracts as contracts

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "contracts/curriculum-package/v1"
UNITS = BASE.parent / "v1.2"
OUTPUT = BASE.parent / "v1.3"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def raw(value: object) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()


def resource_schema() -> dict:
    schema = copy.deepcopy(load(BASE / "resource-index.schema.json"))
    schema["$id"] = contracts.RESOURCE_SCHEMA_ID
    schema["properties"]["$schema"]["const"] = contracts.RESOURCE_SCHEMA_ID
    schema["properties"]["indexFormatVersion"]["const"] = "1.3"
    schema["title"] = "SkillPilot required curriculum resources v1.3"
    schema["description"] = "Closed embedded visualizations and exact assessment stimuli, plus optional external tools."
    image = schema["$defs"]["embeddedImageResource"]
    image["properties"]["publicUrl"]["pattern"] = image["properties"]["publicUrl"]["pattern"].replace("(?:jpg|png)", "(?:jpe?g|png)")
    material = copy.deepcopy(image)
    for field in ("role", "altText", "reviewStatus"):
        material["required"].remove(field)
        material["properties"].pop(field)
    material["properties"]["resourceKind"] = {"const": "assessment-material"}
    material["properties"]["mediaType"] = {"enum": ["image/svg+xml", "image/png"]}
    material["properties"]["publicUrl"]["pattern"] = (
        r"^(?!.*\\)(?!.*(?:^|/)\.\.?(?:/|$))(?!.*//)/assets/assessment-materials/[A-Za-z0-9._/-]+\.(?:svg|png)$")
    material["allOf"] = [{"if": {"properties": {"mediaType": {"const": "image/svg+xml"}}},
                          "then": {"properties": {"bytes": {"maximum": 4 * 1024 * 1024}}}}]
    material["properties"]["description"] = {"anyOf": [{"$ref": "#/$defs/nonBlankText"}, {"type": "null"}]}
    schema["$defs"]["embeddedAssessmentMaterial"] = material
    schema["$defs"]["resource"]["oneOf"].append({"$ref": "#/$defs/embeddedAssessmentMaterial"})
    return schema


def catalog_schema() -> dict:
    schema = copy.deepcopy(load(UNITS / "runtime-catalog.schema.json"))
    base = load(BASE / "runtime-catalog.schema.json")
    schema["$id"] = contracts.CATALOG_SCHEMA_ID
    schema["title"] = "Common runtime catalog 1.3 with learning units and exact assessment media"
    for field, value in (("$schema", contracts.CATALOG_SCHEMA_ID), ("catalogVersion", "1.3"), ("runtimeContractVersion", "1.3")):
        schema["properties"][field] = {"const": value}
    caps = schema["properties"]["capabilities"]
    caps["items"]["enum"].append(contracts.CAPABILITY)
    caps["maxItems"] = len(caps["items"]["enum"])
    caps["allOf"] = [{"contains": {"const": contracts.CAPABILITY}}]
    schema["$defs"] = base["$defs"]
    resource = schema["$defs"]["resource"]
    resource["properties"]["resourceKind"]["enum"].append("assessment-material")
    resource["allOf"].append({
        "if": {"properties": {"resourceKind": {"const": "assessment-material"}}, "required": ["resourceKind"]},
        "then": {"properties": {"delivery": {"const": "embedded"}, "runtimeRequired": {"const": True},
                                "mediaType": {"enum": ["image/svg+xml", "image/png"]},
                                "artifactPath": {"pattern": r"^assets/assessment-materials/[A-Za-z0-9._/-]+\.(?:svg|png)$"}}},
    })
    schema["properties"]["resources"] = copy.deepcopy(base["properties"]["resources"])
    return schema


def build_profile_schema() -> dict:
    schema = copy.deepcopy(load(UNITS / "release-model-build-profile.schema.json"))
    schema["$id"] = contracts.BUILD_PROFILE_SCHEMA_ID
    schema["properties"]["$schema"] = {"const": contracts.BUILD_PROFILE_SCHEMA_ID}
    schema["title"] = "Common 1.3 release model with required assessment material"
    schema["properties"]["resources"]["required"].append("assessmentMaterialOutputPrefix")
    schema["properties"]["resources"]["properties"]["assessmentMaterialOutputPrefix"] = {"const": "assets/assessment-materials"}
    fields = {name: {"type": "string", "minLength": 1} for name in (
        "url", "resourceId", "ownerGoalId", "title", "provider", "language", "license", "sourceArtifactPath", "sourceArtifactSha256", "sha256", "mediaType")}
    fields.update({"description": {"type": ["string", "null"]}, "order": {"type": "integer", "minimum": 0},
                   "bytes": {"type": "integer", "minimum": 1}})
    schema["properties"]["resources"]["required"].append("assessmentMaterials")
    schema["properties"]["resources"]["properties"]["assessmentMaterials"] = {
        "type": "array", "maxItems": 100000, "items": {"type": "object", "additionalProperties": False,
        "required": list(fields), "properties": fields}}
    return schema


def material_bindings(source: dict, value: dict) -> list[dict]:
    by_id = {goal["id"]: goal for goal in source["goals"]}
    uses = contracts.task_material_uses(source["goals"])
    grouped = {}
    declared = {}
    for goal in source["goals"]:
        for order, link in enumerate(goal.get("resourceLinks", [])):
            if link.get("type") == "assessment-material":
                declared.setdefault(link["url"], []).append((goal["id"], order, link))
    for use in uses:
        grouped.setdefault(use["url"], []).append(use)
    result = []
    next_order = {goal["id"]: len(goal.get("resourceLinks", [])) for goal in source["goals"]}
    for url, references in sorted(grouped.items()):
        if url in declared:
            owner_id, order, link = sorted(declared[url], key=lambda item: (item[0], item[1]))[0]
            assert owner_id in {use["goalId"] for use in references}
            resource_id = f"goal-resource:{owner_id}:{order}"
        else:
            owner_id = min(use["goalId"] for use in references)
            order = next_order[owner_id]
            next_order[owner_id] += 1
            link = {}
            resource_id = "task-material:" + hashlib.sha256(url.encode()).hexdigest()
        source_path = by_id[owner_id]["examData"]["sourceArtifactPath"]
        source_bytes = (ROOT / source_path).read_bytes()
        asset = ROOT / value["resources"]["publicAssetRoot"] / url.lstrip("/")
        payload = asset.read_bytes()
        languages = {field for use in references for field in use["taskFields"]}
        result.append({"url": url, "resourceId": resource_id, "ownerGoalId": owner_id, "order": order,
                       "title": link.get("title", by_id[owner_id]["title"]), "provider": link.get("provider", "SkillPilot"),
                       "description": link.get("description"), "language": link.get("lang", "mul" if len(languages) > 1 else "en" if "taskContentEn" in languages else "de"),
                       "license": link.get("license", "CC-BY-4.0"), "sourceArtifactPath": source_path,
                       "sourceArtifactSha256": hashlib.sha256(source_bytes).hexdigest(),
                       "bytes": len(payload), "sha256": hashlib.sha256(payload).hexdigest(),
                       "mediaType": "image/svg+xml" if url.endswith(".svg") else "image/png"})
    assert set(declared).issubset(grouped), "A declared task stimulus has no task-body use"
    return result


def build_profile() -> dict:
    value = copy.deepcopy(load(UNITS / "profiles/de-gymnasium-mathematik-learning-units-release-model-v1.profile.json"))
    value["$schema"] = contracts.BUILD_PROFILE_SCHEMA_ID
    value["profileId"] = contracts.BUILD_PROFILE_ID
    value["package"]["packageVersion"] = "0.1.0-runtime.1"
    value["package"]["releaseId"] = value["package"]["packageId"] + "@" + value["package"]["packageVersion"]
    value["resources"]["assessmentMaterialOutputPrefix"] = "assets/assessment-materials"
    source = load(ROOT / value["canonicalLandscape"]["sourcePath"])
    materials = material_bindings(source, value)
    value["resources"]["assessmentMaterials"] = materials
    base = learning_units.project_out_learning_units(source)
    links = [link for goal in source["goals"] for link in goal.get("resourceLinks", [])]
    visualizations = [link for link in links if link["type"] == "goal-visualization"]
    external = [link for link in links if link["type"] not in {"goal-visualization", "assessment-material"}]
    value["learningUnits"]["expectedCounts"] = learning_units.learning_unit_counts(source)
    value["expectedCounts"] = {
        "landscapes": 1, "goals": len(source["goals"]), "programUnits": len(base.get("programUnits", [])),
        "goalPlacements": len(base.get("goalPlacements", [])), "competencyEntries": len(source.get("competencyCatalog", [])),
        "views": len(list((ROOT / value["compositionViews"]["sourceDirectory"]).glob("*.view.json"))),
        "decks": len(value["cardDecks"]), "cards": sum(len(load(ROOT / deck["sourcePath"])["cards"]) for deck in value["cardDecks"]),
        "resourceLinks": len(visualizations) + len(materials) + len(external), "embeddedImages": len(visualizations) + len(materials), "externalResources": len(external),
        "embeddedImageBytes": sum((ROOT / value["resources"]["publicAssetRoot"] / link["url"].lstrip("/")).stat().st_size for link in visualizations) + sum(item["bytes"] for item in materials),
        "externalRuntimeDependencies": 0,
    }
    return value


def generated() -> dict[Path, bytes]:
    schemas = {"resource-index.schema.json": resource_schema(), "runtime-catalog.schema.json": catalog_schema(),
               "release-model-build-profile.schema.json": build_profile_schema()}
    profile = copy.deepcopy(load(UNITS / "profiles/full-standalone-learning-units-v1.profile.json"))
    profile["profileId"] = contracts.PROFILE_ID
    profile["description"] = "Unpublished common 1.3 runtime: pinned learning-unit definitions and required, byte-exact assessment stimuli; stage-plan activation remains separately gated."
    profile["compatibility"]["runtimeContractVersion"] = "1.3"
    for name in ("resource-index.schema.json", "runtime-catalog.schema.json"):
        profile["trustedContractSchemas"].append({"id": schemas[name]["$id"], "sha256": hashlib.sha256(raw(schemas[name])).hexdigest()})
    for role in profile["roles"]:
        if role["role"] == "runtime-catalog": role["validationSchemaIds"] = [contracts.CATALOG_SCHEMA_ID]
        if role["role"] == "resource-index": role["validationSchemaIds"] = [contracts.RESOURCE_SCHEMA_ID]
        if role["role"] == "binary-asset": role["mediaTypes"].append("image/svg+xml")
    review = copy.deepcopy(load(UNITS / "package-redistribution-review.schema.json"))
    review = json.loads(json.dumps(review).replace("https://skillpilot.com/schemas/curriculum-package/v1.2/package-redistribution-review.schema.json", contracts.REVIEW_SCHEMA_ID)
                        .replace("full-standalone-learning-units-v1", contracts.PROFILE_ID)
                        .replace("de-gymnasium-mathematik-learning-units-release-model-v1", contracts.BUILD_PROFILE_ID)
                        .replace("de-gymnasium-mathematik-learning-units-v1", "de-gymnasium-mathematik-v1.3")
                        .replace("contracts/curriculum-package/v1.2/profiles/" + contracts.PROFILE_ID, "contracts/curriculum-package/v1.3/profiles/" + contracts.PROFILE_ID))
    # The historical JSON task source is provenance content, never software.
    # Its exact file path is a separate, current-contract-only classification.
    original_override = copy.deepcopy(review["$defs"]["pathClassificationOverride"])
    structured_override = copy.deepcopy(original_override)
    structured_override["properties"]["role"] = {"const": "provenance-report"}
    structured_override["properties"]["pathPrefix"] = {
        "const": "data/assessment-sources/stage-plan-direct-evidence-20261115-v7/reviewed-assessments.json"}
    task64_override = copy.deepcopy(structured_override)
    task64_override["properties"]["pathPrefix"] = {
        "const": "data/assessment-sources/task64-digital-correction-20261115-v1/reviewed-assessment.json"}
    review["$defs"]["pathClassificationOverride"] = {"oneOf": [original_override, structured_override, task64_override]}
    # Existing image classes retain their exact prompt/render evidence gates.
    # Assessment materials have real task sources, never fabricated prompts.
    image_decision = review["$defs"]["assetDecision"]
    material_decision = copy.deepcopy(image_decision)
    material_decision["allOf"] = material_decision["allOf"][:2]
    material_fields = material_decision["allOf"][1]
    for name in ("promptPath", "promptSha256"):
        material_fields["required"].remove(name)
    for name in ("promptPath", "promptSha256", "deterministicRenderEvidence", "userProvidedImportEvidence"):
        material_fields["properties"].pop(name, None)
    material_fields["required"].append("assessmentMaterialEvidence")
    material_fields["properties"].update({
        "provenanceClass": {"const": "skillpilot-authored-assessment-material"},
        "provenanceSource": {"const": "hash-bound-assessment-source"}, "userProvided": {"const": False},
        "mediaType": {"enum": ["image/svg+xml", "image/png"]},
        "assessmentMaterialEvidence": {"type": "object", "additionalProperties": False,
            "required": ["declarationPath", "declarationSha256", "sources", "useGoalIds"],
            "properties": {
                "declarationPath": {"$ref": "#/$defs/repositoryPath"},
                "declarationSha256": {"$ref": "#/$defs/sha256Digest"},
                "sources": {"type": "array", "minItems": 1, "maxItems": 1000, "uniqueItems": True,
                    "items": {"type": "object", "additionalProperties": False, "required": ["path", "sha256"],
                        "properties": {"path": {"$ref": "#/$defs/repositoryPath"}, "sha256": {"$ref": "#/$defs/sha256Digest"}}}},
                "useGoalIds": {"type": "array", "minItems": 1, "maxItems": 1000, "uniqueItems": True,
                               "items": {"$ref": "#/$defs/goalId"}},
            }},
    })
    review["$defs"]["imageAssetDecision"] = image_decision
    review["$defs"]["assessmentMaterialDecision"] = material_decision
    review["$defs"]["assetDecision"] = {"oneOf": [{"$ref": "#/$defs/imageAssetDecision"}, {"$ref": "#/$defs/assessmentMaterialDecision"}]}
    result = {OUTPUT / name: raw(value) for name, value in schemas.items()}
    result[OUTPUT / "profiles" / f"{contracts.PROFILE_ID}.profile.json"] = raw(profile)
    result[OUTPUT / "profiles" / f"{contracts.BUILD_PROFILE_ID}.profile.json"] = raw(build_profile())
    result[OUTPUT / "package-redistribution-review.schema.json"] = raw(review)
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    errors = []
    for path, content in generated().items():
        if args.check:
            if not path.is_file() or path.read_bytes() != content: errors.append(str(path.relative_to(ROOT)))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(content)
    if errors: raise SystemExit("Stale 1.3 contracts: " + ", ".join(errors))
    print("Common 1.3 contract derivation verified." if args.check else "Generated common 1.3 contract candidate.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
