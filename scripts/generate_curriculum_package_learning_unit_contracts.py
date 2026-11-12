#!/usr/bin/env python3
"""Generate the curriculum-package 1.2 (``learningUnitsV1``) contract files.

Every 1.2 contract that repeats a published 1.0 contract is derived here from
the byte-identical published file plus an explicit, reviewable list of
additions; published 1.0 and 1.1 files are only read. ``--check`` proves that
the committed 1.2 files equal this derivation.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import sys
from pathlib import Path
from typing import Any

sys.dont_write_bytecode = True

import curriculum_package_learning_unit_contracts as contracts  # noqa: E402

REPO = Path(__file__).resolve().parents[1]
V1 = REPO / "contracts/curriculum-package/v1"
V1_1 = REPO / "contracts/curriculum-package/v1.1"
V1_2 = REPO / "contracts/curriculum-package/v1.2"
V1_SCHEMA = "https://skillpilot.com/schemas/curriculum-package/v1/"
V1_2_SCHEMA = contracts.SCHEMA_PREFIX
V1_2_CONTRACTS = "contracts/curriculum-package/v1.2"

MATH_PROFILE_ID = "de-gymnasium-mathematik-learning-units-release-model-v1"
MATH_PACKAGE_VERSION = "0.1.0-learning-units.1"
REVIEW_LEDGER_ID = "de-gymnasium-mathematik-learning-units-v1"


def load(path: Path) -> Any:
    return json.loads(path.read_bytes())


def dump(value: Any) -> bytes:
    return (json.dumps(value, indent=2, ensure_ascii=False) + "\n").encode("utf-8")


def sha256(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def insert_before(mapping: dict[str, Any], before: str, key: str, value: Any) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for name, item in mapping.items():
        if name == before:
            result[key] = value
        result[name] = item
    if key not in result:
        result[key] = value
    return result


# ------------------------------------------------------------------ JSON schemas

LEARNING_UNIT_REQUIRED = ["id", "kind", "label", "labelEn", "promise", "promiseEn", "revision"]
LEARNING_UNIT_ONLY = ["labelEn", "promise", "promiseEn", "revision", "coverageReviews"]


def compiled_landscape_schema() -> dict[str, Any]:
    """The published 1.0 landscape schema plus exactly the learning-unit additions."""
    schema = copy.deepcopy(load(V1 / "compiled-landscape.schema.json"))
    schema["$id"] = contracts.LANDSCAPE_SCHEMA_ID
    schema["title"] = "SkillPilot compiled curriculum landscape v1.2"
    schema["description"] = (
        schema["description"]
        + " Runtime contract 1.2 adds learning units to the placement layer: programUnits of kind learningUnit,"
        " own goalPlacements, reviewed coverage on the unit (coverageReviews) and the learningUnitCoverage claim."
    )
    properties = schema["properties"]
    properties["$schema"] = {"const": contracts.LANDSCAPE_SCHEMA_ID}
    properties["landscapeFormatVersion"] = {"const": contracts.LANDSCAPE_FORMAT_VERSION}
    schema["properties"] = insert_before(properties, "goals", "learningUnitCoverage", {
        "description": "Absent means no claim and counts as partial. complete asserts that every atomic goal of the landscape has an own placement.",
        "enum": ["partial", "complete"],
    })
    defs = schema["$defs"]
    defs["learningUnitId"] = {
        "type": "string",
        "minLength": 1,
        "maxLength": 300,
        "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
    }
    defs["learningUnitRevision"] = {
        "type": "string",
        "pattern": "^[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])-v[1-9][0-9]*$",
    }
    defs["reviewRevision"] = {"type": "string", "pattern": "^sha256:[a-f0-9]{64}$"}
    unit = defs["programUnit"]
    unit["properties"]["kind"]["enum"] = [*unit["properties"]["kind"]["enum"], "learningUnit"]
    unit["properties"]["labelEn"] = {"$ref": "#/$defs/nonBlankText"}
    unit["properties"]["promise"] = {"$ref": "#/$defs/nonBlankText"}
    unit["properties"]["promiseEn"] = {"$ref": "#/$defs/nonBlankText"}
    unit["properties"]["revision"] = {"$ref": "#/$defs/learningUnitRevision"}
    unit["properties"]["coverageReviews"] = {
        "description": "Reviewed coverage evidence (rule R2) of the unit's own assessments; at most one entry per assessment.",
        "type": "array",
        "minItems": 0,
        "maxItems": 10000,
        "x-skillpilot-listSemantics": "ordered",
        "items": {"$ref": "#/$defs/coverageReview"},
    }
    unit["allOf"] = [{
        "if": {"required": ["kind"], "properties": {"kind": {"const": "learningUnit"}}},
        "then": {
            "required": LEARNING_UNIT_REQUIRED,
            "properties": {"id": {"$ref": "#/$defs/learningUnitId"}, "shortLabel": False},
        },
        "else": {"properties": {name: False for name in LEARNING_UNIT_ONLY}},
    }]
    placement = defs["goalPlacement"]
    placement["properties"]["relation"]["enum"] = [*placement["properties"]["relation"]["enum"], "own"]
    placement["allOf"] = [{
        "if": {"required": ["relation"], "properties": {"relation": {"const": "own"}}},
        "then": {"properties": {"context": False}},
    }]
    defs["coverageReview"] = {
        "type": "object",
        "additionalProperties": False,
        "required": ["assessmentGoalId", "goalIds", "reference", "taskRevision", "rubricRevision"],
        "properties": {
            "assessmentGoalId": {"$ref": "#/$defs/id"},
            "goalIds": {
                "type": "array",
                "minItems": 1,
                "maxItems": 100000,
                "uniqueItems": True,
                "x-skillpilot-listSemantics": "ordered",
                "items": {"$ref": "#/$defs/id"},
            },
            "reference": {"$ref": "#/$defs/packageRelativePath"},
            "taskRevision": {"$ref": "#/$defs/reviewRevision"},
            "rubricRevision": {"$ref": "#/$defs/reviewRevision"},
        },
    }
    return schema


def runtime_catalog_schema() -> dict[str, Any]:
    base = V1_SCHEMA + "runtime-catalog.schema.json"
    v1 = load(V1 / "runtime-catalog.schema.json")
    properties: dict[str, Any] = {
        "$schema": {"const": contracts.CATALOG_SCHEMA_ID},
        "catalogVersion": {"const": contracts.RUNTIME_CONTRACT_VERSION},
        "runtimeContractVersion": {"const": contracts.RUNTIME_CONTRACT_VERSION},
    }
    for name in v1["required"]:
        if name not in properties and name != "capabilities":
            properties[name] = {"$ref": f"{base}#/properties/{name}"}
    enum = [*v1["properties"]["capabilities"]["items"]["enum"], contracts.CAPABILITY]
    properties["capabilities"] = {
        "type": "array",
        "maxItems": len(enum),
        "uniqueItems": True,
        "items": {"enum": enum},
        "contains": {"const": contracts.CAPABILITY},
    }
    properties["learningUnitReviews"] = {
        "description": "Exact package-local discovery of every coverage-review artifact referenced by a learning unit's coverageReviews[].reference.",
        "type": "array",
        "minItems": 0,
        "maxItems": 100000,
        "items": {
            "type": "object",
            "additionalProperties": False,
            "required": ["id", "artifactPath"],
            "properties": {
                "id": {"$ref": f"{base}#/$defs/packageRelativePath"},
                "artifactPath": {"$ref": f"{base}#/$defs/packageRelativePath"},
            },
        },
    }
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": contracts.CATALOG_SCHEMA_ID,
        "title": "Runtime catalog 1.2 with learning units",
        "type": "object",
        "additionalProperties": False,
        "required": [*v1["required"], "learningUnitReviews"],
        "properties": properties,
    }


def review_schema() -> dict[str, Any]:
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": contracts.REVIEW_SCHEMA_ID,
        "title": "Learning-unit coverage review record",
        "description": "Package-local copy of one repository review record referenced by a learning unit's coverageReviews[].reference. The content is the unchanged review text; its UTF-8 bytes are bound by sha256. No learner result is representable.",
        "type": "object",
        "additionalProperties": False,
        "required": ["artifactFormatVersion", "artifactKind", "id", "definition"],
        "properties": {
            "artifactFormatVersion": {"const": 1},
            "artifactKind": {"const": "coverage-review"},
            "id": {
                "type": "string",
                "minLength": 1,
                "maxLength": 240,
                "pattern": "^data/learning-units/reviews/[a-f0-9]{16}\\.json$",
            },
            "definition": {
                "type": "object",
                "additionalProperties": False,
                "required": ["mediaType", "content", "sha256"],
                "properties": {
                    "mediaType": {"enum": ["text/markdown", "application/json"]},
                    # The registered canonical-JSON literal of a review record is capped at 1 MiB.
                    "content": {"type": "string", "minLength": 1, "maxLength": 250000},
                    "sha256": {"type": "string", "pattern": "^[a-f0-9]{64}$"},
                },
            },
        },
    }


def build_profile_schema() -> dict[str, Any]:
    schema = copy.deepcopy(load(V1 / "release-model-build-profile.schema.json"))
    schema["$id"] = contracts.BUILD_PROFILE_SCHEMA_ID
    schema["title"] = "Release model with learning units (runtime contract 1.2)"
    schema["required"] = [*schema["required"], "learningUnits"]
    schema["properties"]["$schema"] = {"const": contracts.BUILD_PROFILE_SCHEMA_ID}
    schema["properties"]["learningUnits"] = {
        "description": "programUnits and goalPlacements in expectedCounts count only the 1.0 placement layer; this section counts the learning-unit layer.",
        "type": "object",
        "additionalProperties": False,
        "required": ["reviewOutputDirectory", "expectedCounts"],
        "properties": {
            "reviewOutputDirectory": {"const": contracts.REVIEW_OUTPUT_DIRECTORY},
            "expectedCounts": {
                "type": "object",
                "additionalProperties": False,
                "required": ["learningUnits", "ownPlacements", "coverageReviews"],
                "properties": {
                    name: {"type": "integer", "minimum": 0}
                    for name in ("learningUnits", "ownPlacements", "coverageReviews")
                },
            },
        },
    }
    return schema


def redistribution_review_schema() -> dict[str, Any]:
    """1.0 ledger schema with the 1.2 profile identities; class decisions stay closed."""
    text = (V1 / "package-redistribution-review.schema.json").read_text(encoding="utf-8")
    replacements = {
        V1_SCHEMA + "package-redistribution-review.schema.json": V1_2_SCHEMA + "package-redistribution-review.schema.json",
        '"de-gymnasium-mathematik-release-model-v1"': f'"{MATH_PROFILE_ID}"',
        '"contracts/curriculum-package/v1/profiles/full-standalone-v1.profile.json"':
            f'"{V1_2_CONTRACTS}/profiles/{contracts.PROFILE_ID}.profile.json"',
        '"full-standalone-v1"': f'"{contracts.PROFILE_ID}"',
        '"de-gymnasium-mathematik-v1"': f'"{REVIEW_LEDGER_ID}"',
    }
    for old, new in replacements.items():
        if old not in text:
            raise SystemExit(f"Redistribution review schema no longer contains {old}")
        text = text.replace(old, new)
    return json.loads(text)


# --------------------------------------------------------------------- profiles

def package_profile(schema_bytes: dict[str, bytes]) -> dict[str, Any]:
    profile = copy.deepcopy(load(V1 / "profiles/full-standalone-v1.profile.json"))
    profile["profileId"] = contracts.PROFILE_ID
    profile["description"] = (
        "Runtime 1.2: the closed V1 package plus learning units in the canonical-landscape placement layer and their "
        "reviewed coverage records; V1 schemas and release contracts remain byte-exact, and the 1.1 completion "
        "artifacts are not part of this contract."
    )
    profile["compatibility"]["runtimeContractVersion"] = contracts.RUNTIME_CONTRACT_VERSION
    for schema_id, _path in contracts.extra_schemas(V1_2):
        profile["trustedContractSchemas"].append({"id": schema_id, "sha256": sha256(schema_bytes[schema_id])})
    for role in profile["roles"]:
        if role["role"] == "runtime-catalog":
            role["validationSchemaIds"] = [contracts.CATALOG_SCHEMA_ID]
        elif role["role"] == "canonical-landscape":
            role["validationSchemaIds"] = [contracts.LANDSCAPE_SCHEMA_ID]
    profile["roles"].append({
        "role": contracts.REVIEW_ROLE,
        "minimum": 0,
        "runtimeRequired": "required",
        "mediaTypes": ["application/json"],
        "semanticBinding": {"kind": "logical-artifact", "allowedNormalizationRoles": [contracts.REVIEW_ROLE]},
        "validationSchemaIds": [contracts.REVIEW_SCHEMA_ID],
    })
    return profile


def math_build_profile() -> dict[str, Any]:
    profile = copy.deepcopy(load(V1 / "profiles/de-gymnasium-mathematik-release-model-v1.profile.json"))
    profile["$schema"] = contracts.BUILD_PROFILE_SCHEMA_ID
    profile["profileId"] = MATH_PROFILE_ID
    profile["profileVersion"] = "1.0.0"
    package = profile["package"]
    package["packageVersion"] = MATH_PACKAGE_VERSION
    package["releaseId"] = f"{package['packageId']}@{MATH_PACKAGE_VERSION}"
    profile["contracts"]["fieldSemanticsRegistryPath"] = f"{V1_2_CONTRACTS}/profiles/{contracts.REGISTRY_ID}.registry.json"
    profile["learningUnits"] = {
        "reviewOutputDirectory": contracts.REVIEW_OUTPUT_DIRECTORY,
        "expectedCounts": {"learningUnits": 0, "ownPlacements": 0, "coverageReviews": 0},
    }
    return profile


# --------------------------------------------------------------------- registry

COMMON_PRESENCE = {"missing": "distinct", "null": "forbidden", "empty": "distinct", "default": {"mode": "none"}}
SCALAR_NORMALIZATION = {
    "objectKeyOrder": "unicode-code-point",
    "arrayOrder": "not-applicable",
    "duplicateItems": "not-applicable",
    "unicode": "preserve-code-points",
    "pathHandling": "not-a-path",
}


def scalar_entry(entry_id: str, pattern: str, predicate: str, presence: str) -> dict[str, Any]:
    return {
        "entryId": entry_id,
        "artifactRole": "canonical-landscape",
        "pathPattern": pattern,
        "classification": "scalar",
        "cardinality": {"presence": presence},
        "dataType": {"jsonTypes": ["string"], "format": "none"},
        "languageSemantics": {"mode": "none"},
        "presenceSemantics": copy.deepcopy(COMMON_PRESENCE),
        "dynamicMapKeys": {"policy": "forbidden", "keyNormalization": "none"},
        "normalization": copy.deepcopy(SCALAR_NORMALIZATION),
        "dependencySemantics": {"mode": "none"},
        "rdfMapping": {
            "strategy": "skillpilot-profile",
            "construction": {"subjectTemplate": "{recordIri}", "predicate": predicate,
                             "objectMapping": "typed-literal", "datatype": "xsd:string"},
        },
        "reverseMapping": {"mode": "scalar-literal", "roundtrip": "exact",
                           "onMissing": "preserve-missing", "onAmbiguous": "error"},
    }


def generated_entry(entry_id: str, pattern: str, json_type: str) -> dict[str, Any]:
    return {
        "entryId": entry_id,
        "artifactRole": "runtime-catalog",
        "pathPattern": pattern,
        "classification": "generated-non-semantic",
        "cardinality": {"presence": "required"},
        "dataType": {"jsonTypes": [json_type], "format": "none"},
        "languageSemantics": {"mode": "none"},
        "presenceSemantics": copy.deepcopy(COMMON_PRESENCE),
        "dynamicMapKeys": {"policy": "forbidden", "keyNormalization": "none"},
        "normalization": copy.deepcopy(SCALAR_NORMALIZATION),
        "dependencySemantics": {"mode": "none"},
        "rdfMapping": {
            "strategy": "excluded-generated",
            "exclusion": {"reason": "Deterministically regenerated contract, digest, or package-location metadata is excluded from curriculum semantics.",
                          "deterministicallyRegenerated": True},
        },
        "reverseMapping": {"mode": "omitted-generated", "roundtrip": "excluded-non-semantic",
                           "onMissing": "regenerate", "onAmbiguous": "error"},
    }


def review_role_entry(field: str) -> dict[str, Any]:
    role = contracts.REVIEW_ROLE
    if field == "definition":
        return {
            "entryId": f"{role}.definition",
            "artifactRole": role,
            "pathPattern": "/definition",
            "classification": "map",
            "cardinality": {"presence": "required"},
            "dataType": {"jsonTypes": ["object"], "format": "none"},
            "languageSemantics": {"mode": "none"},
            "presenceSemantics": copy.deepcopy(COMMON_PRESENCE),
            "dynamicMapKeys": {"policy": "enumerated", "allowedKeys": ["content", "mediaType", "sha256"],
                               "keyNormalization": "unicode-code-point-order"},
            "normalization": copy.deepcopy(SCALAR_NORMALIZATION),
            "dependencySemantics": {"mode": "none"},
            "rdfMapping": {
                "strategy": "registered-canonical-json-literal",
                "canonicalJsonLiteral": {
                    "predicate": "sp:learningUnitCoverageReviewDefinition",
                    "datatype": "xsd:string",
                    "coreGap": "A reviewed coverage record has no FWU Core equivalent. This exact record is accompanied by an explicit review-to-assessment, review-to-goal and content-digest graph, checked on reverse compilation.",
                    "maxBytes": 1048576,
                    "granularity": "single-field-value",
                    "subtreeProjection": "complete-value",
                },
            },
            "reverseMapping": {"mode": "canonical-json-parse", "roundtrip": "exact", "onMissing": "error", "onAmbiguous": "error"},
        }
    json_type = "integer" if field == "artifactFormatVersion" else "string"
    entry = scalar_entry(f"{role}.{field.lower()}", f"/{field}", f"sp:learningUnitCoverageReview{field[0].upper()}{field[1:]}", "required")
    entry["artifactRole"] = role
    entry["dataType"]["jsonTypes"] = [json_type]
    entry["presenceSemantics"]["empty"] = "not-applicable"
    entry["reverseMapping"]["onMissing"] = "error"
    if json_type == "integer":
        entry["rdfMapping"]["construction"]["datatype"] = "xsd:integer"
    return entry


def registry() -> dict[str, Any]:
    value = copy.deepcopy(load(V1 / "profiles/skillpilot-fwu-field-semantics-v1.registry.json"))
    value["registryId"] = contracts.REGISTRY_ID
    value["version"] = contracts.REGISTRY_VERSION
    value["description"] = (
        "Generated closed extension of the unchanged 456-entry V1 field registry for runtime contract 1.2. "
        "Learning-unit fields are registered RDF fields; ownership, the unit hierarchy and coverage reviews have "
        "additional explicit graph assertions validated on reverse compilation."
    )
    def membership(entry_id: str, pattern: str, owner: str, member_class: str, value: str,
                   item_type: str, max_items: int) -> dict[str, Any]:
        """Positioned list, the same representation as goalPlacements and coveredGoalIds."""
        return {
            "entryId": entry_id,
            "artifactRole": "canonical-landscape",
            "pathPattern": pattern,
            "classification": "ordered-list",
            "cardinality": {"presence": "optional" if item_type == "object" else "required", "minItems": 0 if item_type == "object" else 1,
                            "maxItems": max_items},
            "dataType": {"jsonTypes": ["array"], "format": "none", "itemJsonTypes": [item_type]},
            "languageSemantics": {"mode": "none"},
            "presenceSemantics": copy.deepcopy(COMMON_PRESENCE),
            "dynamicMapKeys": {"policy": "forbidden", "keyNormalization": "none"},
            "normalization": {"objectKeyOrder": "unicode-code-point", "arrayOrder": "preserve", "duplicateItems": "preserve",
                              "unicode": "preserve-code-points", "pathHandling": "not-a-path"},
            "dependencySemantics": {"mode": "none"},
            "rdfMapping": {
                "strategy": "skillpilot-profile",
                "construction": {
                    "subjectTemplate": "{recordIri}", "predicate": owner, "objectMapping": "positioned-membership",
                    "membership": {"representation": "positioned-membership", "membershipClass": member_class,
                                   "ownerPredicate": owner, "valuePredicate": value, "positionPredicate": "sp:order",
                                   "positionBase": 0},
                },
            },
            "reverseMapping": {"mode": "ordered-memberships", "roundtrip": "exact",
                               "onMissing": "preserve-missing" if item_type == "object" else "error", "onAmbiguous": "error",
                               "requireUniquePositions": True, "requireContiguousPositions": True},
        }

    def review_field(name: str, predicate: str) -> dict[str, Any]:
        entry_id = "coverage-review." + "".join(f"-{char.lower()}" if char.isupper() else char for char in name)
        entry = scalar_entry(entry_id, f"/programUnits/*/coverageReviews/*/{name}", predicate, "required")
        entry["reverseMapping"]["onMissing"] = "error"
        return entry

    coverage_reviews = [
        membership("program-unit.coverage-reviews", "/programUnits/*/coverageReviews", "sp:hasLearningUnitCoverageReviews",
                   "sp:LearningUnitCoverageReviewsMembership", "sp:learningUnitCoverageReviewsValue", "object", 10000),
        review_field("assessmentGoalId", "sp:coverageReviewAssessmentGoal"),
        membership("coverage-review.goal-ids", "/programUnits/*/coverageReviews/*/goalIds", "sp:hasCoverageReviewGoals",
                   "sp:CoverageReviewGoalsMembership", "sp:coverageReviewGoalsValue", "string", 100000),
        review_field("reference", "sp:coverageReviewReference"),
        review_field("taskRevision", "sp:coverageReviewTaskRevision"),
        review_field("rubricRevision", "sp:coverageReviewRubricRevision"),
    ]
    additions = [
        scalar_entry("landscape.learning-unit-coverage", "/learningUnitCoverage", "sp:learningUnitCoverage", "optional"),
        scalar_entry("program-unit.label-en", "/programUnits/*/labelEn", "sp:programUnitLabelEn", "optional"),
        scalar_entry("program-unit.promise", "/programUnits/*/promise", "sp:learningUnitPromise", "optional"),
        scalar_entry("program-unit.promise-en", "/programUnits/*/promiseEn", "sp:learningUnitPromiseEn", "optional"),
        scalar_entry("program-unit.revision", "/programUnits/*/revision", "sp:learningUnitRevision", "optional"),
        *coverage_reviews,
        generated_entry("runtime.learning-units.learningunitreviews", "/learningUnitReviews", "array"),
        generated_entry("runtime.learning-units.learningunitreviews-item", "/learningUnitReviews/*", "object"),
        generated_entry("runtime.learning-units.learningunitreviews-item.id", "/learningUnitReviews/*/id", "string"),
        generated_entry("runtime.learning-units.learningunitreviews-item.artifactpath", "/learningUnitReviews/*/artifactPath", "string"),
        *(review_role_entry(field) for field in ("artifactFormatVersion", "artifactKind", "id", "definition")),
    ]
    known = {entry["entryId"] for entry in value["entries"]}
    for entry in additions:
        if entry["entryId"] in known:
            raise SystemExit(f"Duplicate registry entry {entry['entryId']}")
        known.add(entry["entryId"])
    value["entries"].extend(additions)
    return value


# ------------------------------------------------------------------- FWU carrier

SP = "https://skillpilot.de/ns/roundtrip#"
FWU_PROFILE_ID = contracts.FWU_PROFILE_ID


def ontology_ttl() -> bytes:
    """The published 1.0 application ontology plus the learning-unit graph vocabulary."""
    text = (V1 / "ontology/skillpilot-fwu-profile-1.0.0.ttl").read_text(encoding="utf-8")
    replacements = {
        "<https://skillpilot.com/ontology/curriculum-package/v1/skillpilot-fwu-profile.owl>": f"<{contracts.FWU_ONTOLOGY_IRI}>",
        "<https://skillpilot.com/ontology/curriculum-package/v1/skillpilot-fwu-profile-1.0.0.owl>": f"<{contracts.FWU_ONTOLOGY_VERSION_IRI}>",
        'owl:versionInfo "1.0.0"': f'owl:versionInfo "{contracts.FWU_PROFILE_VERSION}"',
    }
    for old_text, new_text in replacements.items():
        if text.count(old_text) != 1:
            raise SystemExit(f"Application ontology no longer contains {old_text}")
        text = text.replace(old_text, new_text)
    lines = ["", "# Runtime 1.2 learning units: explicit ownership, hierarchy and coverage-review graph."]
    lines += [f"sp:{name} a owl:Class ." for name in contracts.RDF_CLASSES]
    lines += [f"sp:{name} a owl:ObjectProperty ." for name in contracts.RDF_OBJECT_PROPERTIES]
    lines += [f"sp:{name} a owl:DatatypeProperty ; rdfs:range xsd:string ." for name in contracts.RDF_DATATYPE_PROPERTIES]
    return (text.rstrip("\n") + "\n" + "\n".join(lines) + "\n").encode("utf-8")


def registry_terms(entries: list[dict[str, Any]]) -> dict[str, set[str]]:
    """Compact sp: terms by kind, classified exactly as fwuOwlNTriples.deriveApplicationVocabularyDeclarations does."""
    terms: dict[str, set[str]] = {"classes": set(), "objectProperties": set(), "datatypeProperties": set()}

    def add(kind: str, value: Any) -> None:
        if isinstance(value, str) and value.startswith("sp:"):
            terms[kind].add(value)

    for entry in entries:
        mapping = entry["rdfMapping"]
        for key in ("construction", "fallbackConstruction"):
            construction = mapping.get(key)
            if not construction:
                continue
            add("classes", construction.get("resourceClass"))
            add("classes", construction.get("recordClass"))
            add("objectProperties", construction.get("ownerPredicate"))
            kind = construction["objectMapping"]
            if kind in ("iri-reference", "resource"):
                add("objectProperties", construction["predicate"])
            elif kind in ("typed-literal", "language-literal"):
                add("datatypeProperties", construction["predicate"])
            elif kind in ("positioned-membership", "rdf-list"):
                member = construction["membership"]
                add("objectProperties", construction["predicate"])
                add("classes", member.get("membershipClass"))
                add("objectProperties", member.get("ownerPredicate"))
                add("objectProperties", member.get("valuePredicate"))
                add("datatypeProperties", member.get("positionPredicate"))
                projection = member.get("coreProjection")
                if projection:
                    add("classes", projection.get("resourceClass"))
                    add("objectProperties", projection.get("ownerPredicate"))
                    add("objectProperties", projection.get("valuePredicate"))
            else:
                raise SystemExit(f"Unsupported objectMapping {kind}")
        if mapping.get("canonicalJsonLiteral"):
            add("datatypeProperties", mapping["canonicalJsonLiteral"]["predicate"])
    return terms


def registry_datatype_predicates(registry_value: dict[str, Any]) -> set[str]:
    """Compact sp: predicates introduced by the generated additions (typed or canonical-JSON literals)."""
    result: set[str] = set()
    for entry in registry_value["entries"][456:]:
        mapping = entry["rdfMapping"]
        if mapping["strategy"] == "skillpilot-profile":
            result.add(mapping["construction"]["predicate"])
        elif mapping["strategy"] == "registered-canonical-json-literal":
            result.add(mapping["canonicalJsonLiteral"]["predicate"])
    return result


def fwu_profile(registry_raw: bytes, ttl: bytes, schema_raw: dict[str, bytes], json_profile_raw: bytes) -> dict[str, Any]:
    profile = copy.deepcopy(load(V1 / "profiles/fwu-owl-v1.profile.json"))
    base_text = json.dumps(profile) + (V1 / "profiles/skillpilot-fwu-field-semantics-v1.registry.json").read_text(encoding="utf-8")
    profile["$schema"] = V1_2_SCHEMA + "fwu-owl-package-profile.schema.json"
    profile["profileId"] = FWU_PROFILE_ID
    profile["profileVersion"] = contracts.FWU_PROFILE_VERSION
    profile["description"] = ("FWU-OWL carrier for runtime 1.2 with learning units: explicit, reversible unit, ownership, "
                              "hierarchy and coverage-review assertions in addition to the registered lossless fields.")
    profile["compatibility"]["manifestSchemaId"] = V1_2_SCHEMA + "fwu-owl-package-manifest.schema.json"
    profile["compatibility"]["validationReportSchemaId"] = V1_2_SCHEMA + "fwu-owl-package-validation-report.schema.json"
    declaration = profile["declarationPolicy"]
    registry_entries = json.loads(registry_raw)["entries"]
    existing = registry_terms(registry_entries[:456])
    added = registry_terms(registry_entries[456:])
    added = {kind: {term for term in values if term not in existing[kind]} for kind, values in added.items()}
    added_registry = sorted(SP + term.removeprefix("sp:") for values in added.values() for term in values)
    application = {
        "classes": [SP + name for name in contracts.RDF_CLASSES],
        "objectProperties": [SP + name for name in contracts.RDF_OBJECT_PROPERTIES],
        "datatypeProperties": [SP + name for name in contracts.RDF_DATATYPE_PROPERTIES],
    }
    new_terms = [*added_registry, *(iri for values in application.values() for iri in values)]
    for iri in new_terms:
        if iri.removeprefix(SP) in base_text or len(set(new_terms)) != len(new_terms):
            raise SystemExit(f"Learning-unit RDF term is not new: {iri}")
    registry_vocabulary = declaration["fieldSemanticsRegistryVocabulary"]
    registry_vocabulary["expectedClassCount"] += len(added["classes"])
    registry_vocabulary["expectedObjectPropertyCount"] += len(added["objectProperties"])
    registry_vocabulary["expectedDatatypePropertyCount"] += len(added["datatypeProperties"])
    registry_vocabulary["expectedTermCount"] += len(added_registry)
    ontology = declaration["applicationOntologyVocabulary"]
    for kind, additions in application.items():
        ontology[kind] = sorted([*ontology[kind], *additions])
    ontology["expectedClassCount"] = len(ontology["classes"])
    ontology["expectedObjectPropertyCount"] = len(ontology["objectProperties"])
    ontology["expectedDatatypePropertyCount"] = len(ontology["datatypeProperties"])
    ontology["expectedTermCount"] += len(new_terms) - len(added_registry)
    union = declaration["applicationVocabularyUnion"]
    union["expectedClassCount"] += len(application["classes"]) + len(added["classes"])
    union["expectedObjectPropertyCount"] += len(application["objectProperties"]) + len(added["objectProperties"])
    union["expectedDatatypePropertyCount"] += len(application["datatypeProperties"]) + len(added["datatypeProperties"])
    union["expectedTermCount"] += len(new_terms)
    declaration["expectedDeclarationTripleCount"] += len(new_terms)
    application_policy = profile["applicationProfilePolicy"]
    application_policy.update({
        "ontologyIri": contracts.FWU_ONTOLOGY_IRI,
        "versionIri": contracts.FWU_ONTOLOGY_VERSION_IRI,
        "version": contracts.FWU_PROFILE_VERSION,
        "sourcePath": f"{V1_2_CONTRACTS}/ontology/{contracts.FWU_ONTOLOGY_FILE}",
        "bytes": len(ttl),
        "sha256": sha256(ttl),
    })
    json_profile = json.loads(json_profile_raw)
    json_schema_ids = [binding["id"] for binding in json_profile["trustedContractSchemas"]]
    fwu_schema_ids = [V1_2_SCHEMA + name for name in contracts.FWU_SCHEMA_NAMES]
    catalog = profile["schemaCatalogPolicy"]
    catalog["requiredSchemaIds"] = sorted({*json_schema_ids, *fwu_schema_ids})
    catalog["expectedEntryCount"] = len(catalog["requiredSchemaIds"])
    for binding in profile["contractPolicy"]["trustedBootstrapSchemas"]:
        name = binding["id"].rsplit("/", 1)[-1]
        if name in contracts.FWU_SCHEMA_NAMES:
            binding.update({"id": V1_2_SCHEMA + name, "sourcePath": f"{V1_2_CONTRACTS}/{name}",
                            "packagePath": f"schemas/v1.2/{name}", "bytes": len(schema_raw[name]),
                            "sha256": sha256(schema_raw[name])})
    for binding in profile["contractPolicy"]["trustedGlobalContracts"]:
        if binding["bindingName"] == "fieldSemanticsRegistry":
            name = f"{contracts.REGISTRY_ID}.registry.json"
            binding.update({"id": contracts.REGISTRY_ID, "sourcePath": f"{V1_2_CONTRACTS}/profiles/{name}",
                            "packagePath": f"contracts/{name}", "bytes": len(registry_raw), "sha256": sha256(registry_raw)})
    support = profile["releaseSupportPolicy"]
    support["jsonContractSchemaCount"] = len(json_schema_ids)
    support["trustedJsonReleaseProfile"].update({
        "id": contracts.PROFILE_ID,
        "sourcePath": f"{V1_2_CONTRACTS}/profiles/{contracts.PROFILE_ID}.profile.json",
        "targetPath": f"schemas/profiles/{contracts.PROFILE_ID}.profile.json",
        "packagePath": f"support/json/schemas/profiles/{contracts.PROFILE_ID}.profile.json",
        "bytes": len(json_profile_raw),
        "sha256": sha256(json_profile_raw),
        "trustedSchemaCount": len(json_schema_ids),
    })
    return profile


def set_path(document: dict[str, Any], pointer: str, value: Any) -> None:
    *parents, last = pointer.strip("/").split("/")
    target: Any = document
    for part in parents:
        target = target[int(part)] if isinstance(target, list) else target[part]
    if isinstance(target, list):
        target[int(last)] = value
    else:
        if last not in target and not parents:
            raise SystemExit(f"Unknown schema location {pointer}")
        target[last] = value


def fwu_schemas(ttl: bytes, json_profile_raw: bytes, json_schema_count: int) -> dict[str, dict[str, Any]]:
    """The published 1.0 FWU schemas with the 1.2 identities and bindings, as 1.1 did for its carrier."""
    profile_name = f"{contracts.PROFILE_ID}.profile.json"
    binding = {"bytes": len(json_profile_raw), "id": contracts.PROFILE_ID,
               "path": f"schemas/profiles/{profile_name}", "sha256": sha256(json_profile_raw)}
    manifest = copy.deepcopy(load(V1 / "fwu-owl-package-manifest.schema.json"))
    manifest_id = V1_2_SCHEMA + "fwu-owl-package-manifest.schema.json"
    for pointer, value in {
        "/$id": manifest_id,
        "/properties/$schema/const": manifest_id,
        "/properties/releaseProfile/const": FWU_PROFILE_ID,
        "/properties/runtimeContractVersion/const": contracts.RUNTIME_CONTRACT_VERSION,
        "/$defs/applicationProfile/properties/bytes/const": len(ttl),
        "/$defs/applicationProfile/properties/sha256/const": sha256(ttl),
        "/$defs/applicationProfile/properties/ontologyIri/const": contracts.FWU_ONTOLOGY_IRI,
        "/$defs/applicationProfile/properties/versionIri/const": contracts.FWU_ONTOLOGY_VERSION_IRI,
        "/$defs/applicationProfile/properties/version/const": contracts.FWU_PROFILE_VERSION,
        "/$defs/schemaCatalogDescriptor/properties/entries/const": json_schema_count + len(contracts.FWU_SCHEMA_NAMES),
        "/$defs/sourceJsonPackage/properties/releaseProfile/const": contracts.PROFILE_ID,
        "/$defs/sourceJsonPackage/properties/runtimeContractVersion/const": contracts.RUNTIME_CONTRACT_VERSION,
        **{f"/$defs/sourceJsonPackage/properties/releaseProfileBinding/properties/{key}/const": value
           for key, value in binding.items()},
    }.items():
        set_path(manifest, pointer, value)
    provenance = manifest["$defs"]["fileRecord"]["properties"]["provenanceClass"]["enum"]
    if "ai-assisted-repository-native" not in provenance:
        provenance.append("ai-assisted-repository-native")
    report = copy.deepcopy(load(V1 / "fwu-owl-package-validation-report.schema.json"))
    report_id = V1_2_SCHEMA + "fwu-owl-package-validation-report.schema.json"
    for pointer, value in {
        "/$id": report_id,
        "/properties/$schema/const": report_id,
        "/$defs/sourceJsonPackageEvidence/properties/releaseProfile/const": contracts.PROFILE_ID,
        "/$defs/sourceJsonPackageEvidence/properties/runtimeContractVersion/const": contracts.RUNTIME_CONTRACT_VERSION,
        **{f"/$defs/sourceReleaseProfileBinding/properties/{key}/const": value for key, value in binding.items()},
    }.items():
        set_path(report, pointer, value)
    return {"fwu-owl-package-manifest.schema.json": manifest, "fwu-owl-package-validation-report.schema.json": report}


def fwu_profile_schema(profile: dict[str, Any]) -> dict[str, Any]:
    schema = copy.deepcopy(load(V1 / "fwu-owl-package-profile.schema.json"))
    schema_id = V1_2_SCHEMA + "fwu-owl-package-profile.schema.json"
    for pointer, value in {
        "/$id": schema_id,
        "/properties/$schema/const": schema_id,
        "/properties/profileId/const": FWU_PROFILE_ID,
        "/properties/profileVersion/const": contracts.FWU_PROFILE_VERSION,
        "/$defs/compatibility/properties/manifestSchemaId/const": profile["compatibility"]["manifestSchemaId"],
        "/$defs/compatibility/properties/validationReportSchemaId/const": profile["compatibility"]["validationReportSchemaId"],
    }.items():
        set_path(schema, pointer, value)
    # Version-specific policies are closed constants, exactly as in the 1.1 carrier.
    for name in ("applicationProfilePolicy", "declarationPolicy", "releaseSupportPolicy", "schemaCatalogPolicy"):
        schema["properties"][name] = {"const": profile[name]}
    return schema


# ---------------------------------------------------------------------- outputs

def outputs() -> dict[Path, bytes]:
    schemas = {
        "compiled-landscape.schema.json": compiled_landscape_schema(),
        "runtime-catalog.schema.json": runtime_catalog_schema(),
        "learning-unit-coverage-review.schema.json": review_schema(),
        "release-model-build-profile.schema.json": build_profile_schema(),
        "package-redistribution-review.schema.json": redistribution_review_schema(),
    }
    result = {V1_2 / name: dump(value) for name, value in schemas.items()}
    by_id = {value["$id"]: dump(value) for value in schemas.values()}
    json_profile_raw = dump(package_profile(by_id))
    registry_raw = dump(registry())
    result[V1_2 / "profiles" / f"{contracts.PROFILE_ID}.profile.json"] = json_profile_raw
    result[V1_2 / "profiles" / f"{contracts.REGISTRY_ID}.registry.json"] = registry_raw
    result[V1_2 / "profiles" / f"{MATH_PROFILE_ID}.profile.json"] = dump(math_build_profile())
    # FWU-OWL carrier: ontology first, then the hash-bound schemas, then the profile.
    ttl = ontology_ttl()
    result[V1_2 / "ontology" / contracts.FWU_ONTOLOGY_FILE] = ttl
    json_schema_count = len(json.loads(json_profile_raw)["trustedContractSchemas"])
    schema_raw = {name: dump(value) for name, value in fwu_schemas(ttl, json_profile_raw, json_schema_count).items()}
    # The profile pins all three FWU schemas; the profile schema is closed over the profile's
    # version-specific policies, so it is derived from a profile draft whose own binding is fixed afterwards.
    draft = fwu_profile(registry_raw, ttl, {**schema_raw, "fwu-owl-package-profile.schema.json": b""}, json_profile_raw)
    schema_raw["fwu-owl-package-profile.schema.json"] = dump(fwu_profile_schema(draft))
    profile = fwu_profile(registry_raw, ttl, schema_raw, json_profile_raw)
    if fwu_profile_schema(profile) != json.loads(schema_raw["fwu-owl-package-profile.schema.json"]):
        raise SystemExit("FWU profile schema is not stable under its own binding")
    for name, raw in schema_raw.items():
        result[V1_2 / name] = raw
    result[V1_2 / "profiles" / f"{FWU_PROFILE_ID}.profile.json"] = dump(profile)
    return result


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="fail if a committed 1.2 contract differs")
    args = parser.parse_args(argv)
    stale = []
    for path, raw in outputs().items():
        if args.check:
            if not path.is_file() or path.read_bytes() != raw:
                stale.append(str(path.relative_to(REPO)))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            if not path.is_file() or path.read_bytes() != raw:
                path.write_bytes(raw)
    if stale:
        print("Stale generated 1.2 contracts: " + ", ".join(stale), file=sys.stderr)
        return 1
    print("Curriculum-package 1.2 contracts are " + ("current." if args.check else "written."))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
