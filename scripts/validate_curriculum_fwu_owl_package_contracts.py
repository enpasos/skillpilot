#!/usr/bin/env python3
"""Validate the DPK-008a FWU-OWL package contracts and mutation corpus."""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import math
import re
import sys
import unicodedata
from collections import Counter
from dataclasses import dataclass
from importlib.metadata import PackageNotFoundError, version as distribution_version
from pathlib import Path
from typing import Any, Callable

from jsonschema import Draft202012Validator


REPO_ROOT = Path(__file__).resolve().parents[1]
CONTRACT_ROOT = REPO_ROOT / "contracts" / "curriculum-package" / "v1"
FIXTURE_PATH = CONTRACT_ROOT / "fixtures" / "fwu-owl-package" / "valid-contract.json"
PROFILE_PATH = CONTRACT_ROOT / "profiles" / "fwu-owl-v1.profile.json"
APPLICATION_ONTOLOGY_PATH = CONTRACT_ROOT / "ontology" / "skillpilot-fwu-profile-1.0.0.ttl"
SHAPES_PATH = CONTRACT_ROOT / "ontology" / "skillpilot-fwu-shapes-1.0.0.ttl"
ONTOLOGY_CATALOG_PATH = CONTRACT_ROOT / "ontology" / "fwu-owl-catalog-v001.xml"
TRUSTED_JSON_RELEASE_PROFILE_PATH = CONTRACT_ROOT / "profiles" / "full-standalone-v1.profile.json"
SEMANTIC_NORMAL_FORM_PATH = CONTRACT_ROOT / "profiles" / "semantic-normal-form-v1.profile.json"
FIELD_SEMANTICS_REGISTRY_PATH = CONTRACT_ROOT / "profiles" / "skillpilot-fwu-field-semantics-v1.registry.json"
DEFINITION_DIGEST_PROFILE_PATH = CONTRACT_ROOT / "profiles" / "canonical-definition-record-v1.profile.json"
SCHEMAS = {
    "manifest": CONTRACT_ROOT / "fwu-owl-package-manifest.schema.json",
    "profile": CONTRACT_ROOT / "fwu-owl-package-profile.schema.json",
    "validationReport": CONTRACT_ROOT / "fwu-owl-package-validation-report.schema.json",
}
JSONSCHEMA_VERSION = "4.26.0"
SEGMENTS = (
    "declarations",
    "runtime",
    "landscape",
    "views",
    "mappings",
    "sources",
    "cards",
    "assets",
)
GATES = (
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
ROLE_POLICY = {
    "rdf-segment": (8, 8, {"application/n-triples"}, {"normative-rdf-segment"}),
    "rdf-bundle": (1, 1, {"application/n-triples"}, {"generated-rdf-bundle"}),
    "package-profile": (1, 1, {"application/json"}, {"contract"}),
    "contract-schema": (6, 6, {"application/schema+json"}, {"contract"}),
    "schema-catalog": (1, 1, {"application/json"}, {"schema-catalog"}),
    "contract": (5, 5, {"application/json"}, {"contract"}),
    "semantic-content-index": (1, 1, {"application/json"}, {"semantic-content-index"}),
    "ontology-core": (1, 1, {"text/owl-functional"}, {"ontology-core"}),
    "ontology-profile": (1, 1, {"text/turtle"}, {"ontology-profile"}),
    "ontology-shapes": (1, 1, {"text/turtle"}, {"ontology-shapes"}),
    "ontology-catalog": (1, 1, {"application/xml"}, {"ontology-catalog"}),
    "binary-resource": (0, 50000, {"image/jpeg", "image/png"}, {"binary-resource"}),
    "release-support": (26, 1026, {"application/json", "application/schema+json", "text/markdown"}, {"release-support"}),
    "license": (1, 1024, {"text/plain"}, {"license"}),
}
EXPECTED_BINDINGS = (
    "manifestSchema",
    "packageProfileSchema",
    "validationReportSchema",
    "schemaCatalogSchema",
    "semanticContentIndexSchema",
    "definitionDigestProfileSchema",
    "packageProfile",
    "semanticNormalForm",
    "fieldSemanticsRegistry",
    "definitionDigestProfile",
    "curriculumOntologyProfile",
    "publicationEvidenceProfile",
)
EXPECTED_STATIC_BINDING_IDS = {
    "manifestSchema": "https://skillpilot.com/schemas/curriculum-package/v1/fwu-owl-package-manifest.schema.json",
    "packageProfileSchema": "https://skillpilot.com/schemas/curriculum-package/v1/fwu-owl-package-profile.schema.json",
    "validationReportSchema": "https://skillpilot.com/schemas/curriculum-package/v1/fwu-owl-package-validation-report.schema.json",
    "schemaCatalogSchema": "https://skillpilot.com/schemas/curriculum-package/v1/schema-catalog.schema.json",
    "semanticContentIndexSchema": "https://skillpilot.com/schemas/curriculum-package/v1/semantic-content-index.schema.json",
    "definitionDigestProfileSchema": "https://skillpilot.com/schemas/curriculum-package/v1/definition-digest-profile.schema.json",
    "packageProfile": "fwu-owl-v1",
    "semanticNormalForm": "semantic-normal-form-v1",
    "fieldSemanticsRegistry": "skillpilot-fwu-field-semantics-v1",
    "definitionDigestProfile": "canonical-definition-record-v1",
}
EXPECTED_BINDING_FILE_POLICY = {
    "manifestSchema": ("contract-schema", "application/schema+json"),
    "packageProfileSchema": ("contract-schema", "application/schema+json"),
    "validationReportSchema": ("contract-schema", "application/schema+json"),
    "schemaCatalogSchema": ("contract-schema", "application/schema+json"),
    "semanticContentIndexSchema": ("contract-schema", "application/schema+json"),
    "definitionDigestProfileSchema": ("contract-schema", "application/schema+json"),
    "packageProfile": ("package-profile", "application/json"),
    "semanticNormalForm": ("contract", "application/json"),
    "fieldSemanticsRegistry": ("contract", "application/json"),
    "definitionDigestProfile": ("contract", "application/json"),
    "curriculumOntologyProfile": ("contract", "application/json"),
    "publicationEvidenceProfile": ("contract", "application/json"),
}
SOURCE_SEMANTIC_BINDINGS = (
    "semanticNormalForm",
    "fieldSemanticsRegistry",
    "definitionDigestProfile",
    "curriculumOntologyProfile",
    "publicationEvidenceProfile",
)
JSON_CONTRACT_SCHEMA_TARGETS = (
    "schemas/package-manifest.schema.json",
    "schemas/runtime-catalog.schema.json",
    "schemas/schema-catalog.schema.json",
    "schemas/dependency-closure.schema.json",
    "schemas/migration-aliases.schema.json",
    "schemas/compiled-landscape.schema.json",
    "schemas/composition-view-index.schema.json",
    "schemas/composition-view.schema.json",
    "schemas/card-index.schema.json",
    "schemas/card-deck.schema.json",
    "schemas/resource-index.schema.json",
    "schemas/semantic-content-index.schema.json",
    "schemas/embedded-goal-dependency.schema.json",
    "schemas/source-to-canonical-mappings.schema.json",
    "schemas/official-source-index.schema.json",
    "schemas/source-goal-reference-index.schema.json",
    "schemas/release-quality-evidence.schema.json",
    "schemas/semantic-normalization-profile.schema.json",
    "schemas/field-semantics-registry.schema.json",
    "schemas/definition-digest-profile.schema.json",
    "schemas/curriculum-ontology-profile.schema.json",
    "schemas/publication-evidence-projection.schema.json",
)
SINGLETON_RELEASE_SUPPORT = {
    "json-release-profile": ("full-standalone-v1", "schemas/profiles/full-standalone-v1.profile.json", "application/json"),
    "redistribution-review": ("redistribution-review", "metadata/provenance/redistribution-review.json", "application/json"),
    "source-verification-review": ("source-verification-review", "metadata/provenance/source-verification-review.json", "application/json"),
    "source-verification-status": ("source-verification-status", "metadata/provenance/source-verification-status.md", "text/markdown"),
}
TRUSTED_JSON_RELEASE_PROFILE = {
    "id": "full-standalone-v1",
    "sourcePath": "contracts/curriculum-package/v1/profiles/full-standalone-v1.profile.json",
    "targetPath": "schemas/profiles/full-standalone-v1.profile.json",
    "packagePath": "support/json/schemas/profiles/full-standalone-v1.profile.json",
    "mediaType": "application/json",
    "bytes": 16926,
    "sha256": "30675f93fba5a83947512c2471737cd6641cc553143a970652f8ea953b8656aa",
    "schemaTrustField": "trustedContractSchemas",
    "trustedSchemaCount": 22,
}
CORE_POLICY = {
    "canonicalOntologyIri": "https://w3id.org/lehrplan/ontology/lp/components/lehrplan-core.owl",
    "sourceRepository": "https://github.com/FWU-DE/lehrplan-ontologie.git",
    "sourceCommit": "8aa5bce4a5366807d46f18650e31db98f9bfe35d",
    "sourcePath": "src/ontology/components/lehrplan-core.owl",
    "bundledPath": "ontology/lehrplan-core.owl",
    "catalogPath": "catalog-v001.xml",
    "catalogSourcePath": "contracts/curriculum-package/v1/ontology/fwu-owl-catalog-v001.xml",
    "catalogMediaType": "application/xml",
    "catalogBytes": 228,
    "catalogSha256": "d81fe5d836bd5f3081f7ba9136e68a702f8c751c4dca26a626cdaa5d841284b8",
    "catalogResolutionPolicy": "exact-local-core-uri-only-no-dtd-entities-delegates-rewrites-or-next-catalog",
    "mediaType": "text/owl-functional",
    "syntax": "owl-functional",
    "bytes": 195917,
    "sha256": "267838b2dd9625d84b57039028004c4d9fa3edf623336f47d3a922189d4230df",
    "requireCommit": True,
    "requireSourcePath": True,
    "requireByteHash": True,
    "remoteResolutionAllowed": False,
}
APPLICATION_PROFILE_POLICY = {
    "ontologyIri": "https://skillpilot.com/ontology/curriculum-package/v1/skillpilot-fwu-profile.owl",
    "versionIri": "https://skillpilot.com/ontology/curriculum-package/v1/skillpilot-fwu-profile-1.0.0.owl",
    "version": "1.0.0",
    "requiredImports": ["https://w3id.org/lehrplan/ontology/lp/components/lehrplan-core.owl"],
    "sourcePath": "contracts/curriculum-package/v1/ontology/skillpilot-fwu-profile-1.0.0.ttl",
    "packagePath": "skillpilot-curriculum-profile.ttl",
    "mediaType": "text/turtle",
    "bytes": 5427,
    "sha256": "22358a2aa96c16250d0f73fe6683fe6a0bda501b776dd6376a04b1980728e05a",
}
PARSER_BOOTSTRAP_POLICY = {
    "purpose": "declare-non-application-predicates-before-standalone-rdf-to-owl-parsing",
    "verification": "exact-property-kinds-verified-against-pinned-core-or-fixed-external-vocabulary",
    "objectProperties": [
        "http://purl.obolibrary.org/obo/BFO_0000051",
        "https://w3id.org/lehrplan/ontology/LP_0000024",
        "https://w3id.org/lehrplan/ontology/LP_0000026",
        "https://w3id.org/lehrplan/ontology/LP_0000041",
        "https://w3id.org/lehrplan/ontology/LP_0000047",
        "https://w3id.org/lehrplan/ontology/LP_0000537",
        "https://w3id.org/lehrplan/ontology/LP_0000812",
        "https://w3id.org/lehrplan/ontology/LP_0030051",
        "https://w3id.org/lehrplan/ontology/LP_0030056",
        "https://w3id.org/lehrplan/ontology/LP_0030057",
        "https://w3id.org/lehrplan/ontology/LP_0030071",
        "https://w3id.org/lehrplan/ontology/LP_0030072",
    ],
    "datatypeProperties": [
        "https://schema.org/contentUrl",
        "https://w3id.org/lehrplan/ontology/LP_0000344",
        "https://w3id.org/lehrplan/ontology/LP_0000460",
        "https://w3id.org/lehrplan/ontology/LP_0000463",
    ],
    "expectedPropertyCount": 16,
}
SHAPES_POLICY = {
    "shapesIri": "https://skillpilot.com/shapes/curriculum-package/v1/fwu-owl",
    "versionIri": "https://skillpilot.com/shapes/curriculum-package/v1/fwu-owl-1.0.0",
    "version": "1.0.0",
    "sourcePath": "contracts/curriculum-package/v1/ontology/skillpilot-fwu-shapes-1.0.0.ttl",
    "packagePath": "ontology/shapes.ttl",
    "mediaType": "text/turtle",
    "bytes": 6187,
    "sha256": "cd139efa68fc1f127529b271f8cd69b759f214196e674c3ab6e3120cbfda6b15",
    "inference": "none",
    "executableConstraintsAllowed": False,
    "warningPolicy": "fail",
}
BOOTSTRAP_SCHEMA_SPECS = (
    ("manifestSchema", "https://skillpilot.com/schemas/curriculum-package/v1/fwu-owl-package-manifest.schema.json", SCHEMAS["manifest"], "schemas/fwu-owl-package-manifest.schema.json"),
    ("packageProfileSchema", "https://skillpilot.com/schemas/curriculum-package/v1/fwu-owl-package-profile.schema.json", SCHEMAS["profile"], "schemas/fwu-owl-package-profile.schema.json"),
    ("validationReportSchema", "https://skillpilot.com/schemas/curriculum-package/v1/fwu-owl-package-validation-report.schema.json", SCHEMAS["validationReport"], "schemas/fwu-owl-package-validation-report.schema.json"),
    ("schemaCatalogSchema", "https://skillpilot.com/schemas/curriculum-package/v1/schema-catalog.schema.json", CONTRACT_ROOT / "schema-catalog.schema.json", "schemas/schema-catalog.schema.json"),
    ("semanticContentIndexSchema", "https://skillpilot.com/schemas/curriculum-package/v1/semantic-content-index.schema.json", CONTRACT_ROOT / "semantic-content-index.schema.json", "schemas/semantic-content-index.schema.json"),
    ("definitionDigestProfileSchema", "https://skillpilot.com/schemas/curriculum-package/v1/definition-digest-profile.schema.json", CONTRACT_ROOT / "definition-digest-profile.schema.json", "schemas/definition-digest-profile.schema.json"),
)
GLOBAL_CONTRACT_SPECS = (
    ("semanticNormalForm", "semantic-normal-form-v1", SEMANTIC_NORMAL_FORM_PATH, "contracts/semantic-normal-form-v1.profile.json"),
    ("fieldSemanticsRegistry", "skillpilot-fwu-field-semantics-v1", FIELD_SEMANTICS_REGISTRY_PATH, "contracts/skillpilot-fwu-field-semantics-v1.registry.json"),
    ("definitionDigestProfile", "canonical-definition-record-v1", DEFINITION_DIGEST_PROFILE_PATH, "contracts/canonical-definition-record-v1.profile.json"),
)
SOURCE_CONTRACT_NAMES = (
    "semanticNormalForm",
    "fieldSemanticsRegistry",
    "definitionDigestProfile",
    "curriculumOntologyProfile",
    "publicationEvidenceProfile",
)


@dataclass(frozen=True)
class Diagnostic:
    code: str
    path: str
    message: str


def reject_constant(value: str) -> None:
    raise ValueError(f"non-finite JSON number {value!r}")


def reject_duplicate_keys(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate object key {key!r}")
        result[key] = value
    return result


def validate_scalar(value: Any, path: str = "$") -> None:
    if isinstance(value, str):
        for char in value:
            code = ord(char)
            if code < 0x20 and char not in "\t\n\r":
                raise ValueError(f"unsafe control U+{code:04X} at {path}")
            if code in {0xFFFE, 0xFFFF} or 0xD800 <= code <= 0xDFFF:
                raise ValueError(f"unsafe Unicode U+{code:04X} at {path}")
    elif isinstance(value, float) and not math.isfinite(value):
        raise ValueError(f"non-finite number at {path}")
    elif isinstance(value, list):
        for index, item in enumerate(value):
            validate_scalar(item, f"{path}/{index}")
    elif isinstance(value, dict):
        for key, item in value.items():
            validate_scalar(key, f"{path}/<key>")
            validate_scalar(item, f"{path}/{key}")


def loads_strict(text: str) -> Any:
    value = json.loads(
        text,
        object_pairs_hook=reject_duplicate_keys,
        parse_constant=reject_constant,
    )
    validate_scalar(value)
    return value


def load_json(path: Path) -> Any:
    return loads_strict(path.read_text(encoding="utf-8"))


def byte_binding(path: Path) -> tuple[int, str]:
    payload = path.read_bytes()
    return len(payload), hashlib.sha256(payload).hexdigest()


def trusted_binding(
    binding_name: str,
    binding_id: str,
    source_path: Path,
    package_path: str,
) -> dict[str, Any]:
    size, digest = byte_binding(source_path)
    return {
        "bindingName": binding_name,
        "id": binding_id,
        "sourcePath": source_path.relative_to(REPO_ROOT).as_posix(),
        "packagePath": package_path,
        "bytes": size,
        "sha256": digest,
    }


def expected_bootstrap_bindings() -> list[dict[str, Any]]:
    return [trusted_binding(*spec) for spec in BOOTSTRAP_SCHEMA_SPECS]


def expected_global_contract_bindings() -> list[dict[str, Any]]:
    return [trusted_binding(*spec) for spec in GLOBAL_CONTRACT_SPECS]


def canonical_json_bytes(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def expected_schema_catalog(profile: dict[str, Any]) -> tuple[dict[str, Any], bytes]:
    by_id: dict[str, dict[str, Any]] = {}
    for binding in expected_bootstrap_bindings():
        by_id[binding["id"]] = {
            "id": binding["id"],
            "path": binding["packagePath"],
            "dialect": "https://json-schema.org/draft/2020-12/schema",
            "bytes": binding["bytes"],
            "sha256": binding["sha256"],
        }
    json_profile = load_json(TRUSTED_JSON_RELEASE_PROFILE_PATH)
    for binding in json_profile.get("trustedContractSchemas", []):
        schema_id = binding["id"]
        if schema_id in by_id:
            if by_id[schema_id]["sha256"] != binding["sha256"]:
                raise ValueError(f"conflicting trusted schema bytes for {schema_id}")
            continue
        name = schema_id.rsplit("/", 1)[-1]
        source_path = CONTRACT_ROOT / name
        size, digest = byte_binding(source_path)
        if digest != binding["sha256"]:
            raise ValueError(f"trusted JSON schema hash drift for {schema_id}")
        by_id[schema_id] = {
            "id": schema_id,
            "path": f"support/json/schemas/{name}",
            "dialect": "https://json-schema.org/draft/2020-12/schema",
            "bytes": size,
            "sha256": digest,
        }
    required = profile.get("schemaCatalogPolicy", {}).get("requiredSchemaIds", [])
    if set(by_id) != set(required):
        raise ValueError("trusted schema catalog IDs differ from profile")
    catalog = {
        "$schema": "https://skillpilot.com/schemas/curriculum-package/v1/schema-catalog.schema.json",
        "catalogFormatVersion": 1,
        "entries": [by_id[schema_id] for schema_id in sorted(by_id)],
    }
    return catalog, canonical_json_bytes(catalog)


def validate_static_trust_roots() -> list[Diagnostic]:
    diagnostics: list[Diagnostic] = []
    for binding in expected_bootstrap_bindings() + expected_global_contract_bindings():
        source_path = REPO_ROOT / binding["sourcePath"]
        if not source_path.is_file() or source_path.is_symlink():
            diagnostics.append(Diagnostic("TRUST_ROOT_FILE", str(source_path), "Trusted contract file is missing or unsafe"))
            continue
        document = load_json(source_path)
        expected_id = binding["id"]
        actual_id = document.get("$id") if expected_id.startswith("https://skillpilot.com/schemas/") else document.get("profileId", document.get("registryId"))
        if actual_id != expected_id:
            diagnostics.append(Diagnostic("TRUST_ROOT_ID", str(source_path), "Trusted contract identity differs"))
    for name, path, policy in (
        ("application ontology", APPLICATION_ONTOLOGY_PATH, APPLICATION_PROFILE_POLICY),
        ("SHACL shapes", SHAPES_PATH, SHAPES_POLICY),
        (
            "OWL XML catalog",
            ONTOLOGY_CATALOG_PATH,
            {"bytes": CORE_POLICY["catalogBytes"], "sha256": CORE_POLICY["catalogSha256"]},
        ),
        ("JSON release profile", TRUSTED_JSON_RELEASE_PROFILE_PATH, TRUSTED_JSON_RELEASE_PROFILE),
    ):
        if not path.is_file() or path.is_symlink():
            diagnostics.append(Diagnostic("TRUST_ROOT_FILE", str(path), f"Pinned {name} file is missing or unsafe"))
            continue
        if byte_binding(path) != (policy["bytes"], policy["sha256"]):
            diagnostics.append(Diagnostic("TRUST_ROOT_HASH", str(path), f"Pinned {name} byte binding differs"))
    if APPLICATION_ONTOLOGY_PATH.is_file():
        text = APPLICATION_ONTOLOGY_PATH.read_text(encoding="utf-8")
        required = (
            f"<{APPLICATION_PROFILE_POLICY['ontologyIri']}>",
            f"<{APPLICATION_PROFILE_POLICY['versionIri']}>",
            f"<{APPLICATION_PROFILE_POLICY['requiredImports'][0]}>",
            "sp:LearningGoal a owl:Class",
            "sp:RequiresMembership a owl:Class",
            "sp:fieldState a owl:DatatypeProperty",
            "sp:referenceRole a owl:DatatypeProperty",
        )
        if any(token not in text for token in required) or any(token in text for token in ("sp:PackageFile", "sp:textLine", "sp:lineText")):
            diagnostics.append(Diagnostic("TRUST_ROOT_ONTOLOGY", str(APPLICATION_ONTOLOGY_PATH), "Application ontology identity/import/stable vocabulary differs"))
    if SHAPES_PATH.is_file():
        text = SHAPES_PATH.read_text(encoding="utf-8")
        required = (
            f"<{SHAPES_POLICY['shapesIri']}>",
            f"<{SHAPES_POLICY['versionIri']}>",
            "sps:CoreCompetencyShape",
            "sps:DidacticPrerequisiteShape",
            "[ sh:inversePath lp:LP_0030071 ]",
        )
        forbidden = ("sh:sparql", "sh:js", "sh:rule", "sh:SPARQLConstraint", "sh:JSConstraint")
        if any(token not in text for token in required) or any(token in text for token in forbidden):
            diagnostics.append(Diagnostic("TRUST_ROOT_SHAPES", str(SHAPES_PATH), "Shapes identity or non-executable constraint policy differs"))
    if ONTOLOGY_CATALOG_PATH.is_file():
        text = ONTOLOGY_CATALOG_PATH.read_text(encoding="utf-8")
        expected = (
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            '<catalog xmlns="urn:oasis:names:tc:entity:xmlns:xml:catalog">\n'
            '  <uri name="https://w3id.org/lehrplan/ontology/lp/components/lehrplan-core.owl" uri="ontology/lehrplan-core.owl"/>\n'
            '</catalog>\n'
        )
        if text != expected:
            diagnostics.append(Diagnostic("TRUST_ROOT_CATALOG", str(ONTOLOGY_CATALOG_PATH), "OWL catalog is not the exact local Core-only mapping"))
    if TRUSTED_JSON_RELEASE_PROFILE_PATH.is_file():
        release_profile = load_json(TRUSTED_JSON_RELEASE_PROFILE_PATH)
        trusted = release_profile.get("trustedContractSchemas", []) if isinstance(release_profile, dict) else []
        if release_profile.get("profileId") != "full-standalone-v1" or len(trusted) != 22:
            diagnostics.append(Diagnostic("TRUST_ROOT_JSON_PROFILE", str(TRUSTED_JSON_RELEASE_PROFILE_PATH), "JSON release profile identity/schema trust set differs"))
        for index, binding in enumerate(trusted):
            schema_id = binding.get("id") if isinstance(binding, dict) else None
            name = str(schema_id).rsplit("/", 1)[-1]
            path = CONTRACT_ROOT / name
            if not path.is_file():
                diagnostics.append(Diagnostic("TRUST_ROOT_JSON_SCHEMA", f"{TRUSTED_JSON_RELEASE_PROFILE_PATH}/{index}", "Trusted JSON schema is missing"))
                continue
            document = load_json(path)
            if document.get("$id") != schema_id or byte_binding(path)[1] != binding.get("sha256"):
                diagnostics.append(Diagnostic("TRUST_ROOT_JSON_SCHEMA", f"{TRUSTED_JSON_RELEASE_PROFILE_PATH}/{index}", "Trusted JSON schema ID/hash differs"))
    return diagnostics


def pointer(error: Any) -> str:
    parts = [str(part).replace("~", "~0").replace("/", "~1") for part in error.absolute_path]
    return "/" + "/".join(parts) if parts else "/"


def schema_diagnostics(name: str, schema: dict[str, Any], value: Any) -> list[Diagnostic]:
    return [
        Diagnostic(f"{name.upper()}_SCHEMA", pointer(error), error.message)
        for error in sorted(Draft202012Validator(schema).iter_errors(value), key=lambda item: list(item.absolute_path))
    ]


def by_path(files: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    return {record.get("path", ""): record for record in files if isinstance(record, dict)}


def binding_matches(record: dict[str, Any] | None, binding: dict[str, Any], name: str) -> bool:
    if not record:
        return False
    semantic = record.get("semanticBinding", {})
    role, media_type = EXPECTED_BINDING_FILE_POLICY[name]
    return (
        record.get("path") == binding.get("path")
        and record.get("bytes") == binding.get("bytes")
        and record.get("sha256") == binding.get("sha256")
        and record.get("role") == role
        and record.get("mediaType") == media_type
        and semantic.get("kind") == "contract"
        and semantic.get("bindingName") == name
    )


def derive_registry_application_vocabulary() -> dict[str, list[str]]:
    registry = load_json(FIELD_SEMANTICS_REGISTRY_PATH)
    namespace = registry.get("namespaceBindings", {}).get("sp")
    if namespace != "https://skillpilot.de/ns/roundtrip#":
        raise ValueError("field registry application namespace differs")
    classes: set[str] = set()
    object_properties: set[str] = set()
    datatype_properties: set[str] = set()
    observed: set[str] = set()

    def add(target: set[str], value: Any) -> None:
        if isinstance(value, str) and value.startswith("sp:"):
            target.add(namespace + value.removeprefix("sp:"))

    def observe(value: Any) -> None:
        if isinstance(value, str) and value.startswith("sp:"):
            observed.add(namespace + value.removeprefix("sp:"))
        elif isinstance(value, dict):
            for child in value.values():
                observe(child)
        elif isinstance(value, list):
            for child in value:
                observe(child)

    def construction_terms(construction: Any) -> None:
        if construction is None:
            return
        if not isinstance(construction, dict):
            raise ValueError("registry construction is not an object")
        add(classes, construction.get("resourceClass"))
        add(classes, construction.get("recordClass"))
        add(object_properties, construction.get("ownerPredicate"))
        object_mapping = construction.get("objectMapping")
        if object_mapping in {"typed-literal", "language-literal"}:
            add(datatype_properties, construction.get("predicate"))
        elif object_mapping in {"iri-reference", "resource"}:
            add(object_properties, construction.get("predicate"))
        elif object_mapping in {"positioned-membership", "rdf-list"}:
            add(object_properties, construction.get("predicate"))
            membership = construction.get("membership")
            if not isinstance(membership, dict):
                raise ValueError("registry membership construction is missing")
            add(classes, membership.get("membershipClass"))
            add(object_properties, membership.get("ownerPredicate"))
            add(object_properties, membership.get("valuePredicate"))
            add(datatype_properties, membership.get("positionPredicate"))
            projection = membership.get("coreProjection")
            if isinstance(projection, dict):
                add(classes, projection.get("resourceClass"))
                add(object_properties, projection.get("ownerPredicate"))
                add(object_properties, projection.get("valuePredicate"))
        else:
            raise ValueError(f"unsupported registry object mapping {object_mapping!r}")

    for entry in registry.get("entries", []):
        mapping = entry.get("rdfMapping", {}) if isinstance(entry, dict) else {}
        observe(mapping)
        construction_terms(mapping.get("construction"))
        construction_terms(mapping.get("fallbackConstruction"))
        canonical = mapping.get("canonicalJsonLiteral")
        if isinstance(canonical, dict):
            add(datatype_properties, canonical.get("predicate"))
    classified = classes | object_properties | datatype_properties
    if observed != classified:
        raise ValueError("field registry has unclassified application vocabulary")
    if classes & (object_properties | datatype_properties) or object_properties & datatype_properties:
        raise ValueError("field registry application vocabulary has cross-kind punning")
    return {
        "classes": sorted(classes),
        "objectProperties": sorted(object_properties),
        "datatypeProperties": sorted(datatype_properties),
    }


def derive_pinned_application_ontology_vocabulary() -> dict[str, list[str]]:
    text = APPLICATION_ONTOLOGY_PATH.read_text(encoding="utf-8")
    result = {"classes": [], "objectProperties": [], "datatypeProperties": []}
    keys = {
        "Class": "classes",
        "ObjectProperty": "objectProperties",
        "DatatypeProperty": "datatypeProperties",
    }
    pattern = re.compile(
        r"^sp:([A-Za-z][A-Za-z0-9_-]*)\s+a\s+owl:(Class|ObjectProperty|DatatypeProperty)\b",
        re.MULTILINE,
    )
    for local_name, ontology_kind in pattern.findall(text):
        result[keys[ontology_kind]].append(
            "https://skillpilot.de/ns/roundtrip#" + local_name
        )
    for values in result.values():
        values.sort()
        if len(values) != len(set(values)):
            raise ValueError("application ontology has duplicate vocabulary declarations")
    return result


def expected_declaration_policy() -> dict[str, Any]:
    registry = derive_registry_application_vocabulary()
    ontology = derive_pinned_application_ontology_vocabulary()
    registry_policy = {
        "classSources": ["membershipClass", "resourceClass", "recordClass"],
        "objectPropertySources": [
            "iri-object-predicates",
            "owner-predicates",
            "value-predicates-with-iri-object",
        ],
        "datatypePropertySources": [
            "typed-literal-predicates",
            "language-literal-predicates",
            "canonical-json-literal-predicates",
        ],
        "expectedClassCount": len(registry["classes"]),
        "expectedObjectPropertyCount": len(registry["objectProperties"]),
        "expectedDatatypePropertyCount": len(registry["datatypeProperties"]),
        "expectedTermCount": sum(len(values) for values in registry.values()),
    }
    ontology_policy = {
        "sourceBinding": "applicationProfilePolicy",
        "verification": "exact-explicit-lists-equal-pinned-ontology-rdf-type-declarations",
        **ontology,
        "expectedClassCount": len(ontology["classes"]),
        "expectedObjectPropertyCount": len(ontology["objectProperties"]),
        "expectedDatatypePropertyCount": len(ontology["datatypeProperties"]),
        "expectedTermCount": sum(len(values) for values in ontology.values()),
    }
    union = {
        key: set(registry[key]) | set(ontology[key])
        for key in ("classes", "objectProperties", "datatypeProperties")
    }
    if union["classes"] & (union["objectProperties"] | union["datatypeProperties"]) or union["objectProperties"] & union["datatypeProperties"]:
        raise ValueError("application vocabulary union has cross-kind punning")
    union_policy = {
        "sameKindDuplicatesDeduplicated": True,
        "crossKindPunningAllowed": False,
        "expectedClassCount": len(union["classes"]),
        "expectedObjectPropertyCount": len(union["objectProperties"]),
        "expectedDatatypePropertyCount": len(union["datatypeProperties"]),
        "expectedTermCount": sum(len(values) for values in union.values()),
    }
    return {
        "segmentId": "declarations",
        "vocabularySources": [
            "fieldSemanticsRegistry",
            "applicationOntologyProfile",
        ],
        "requireEveryUsedApplicationTermDeclared": True,
        "fieldSemanticsRegistryVocabulary": registry_policy,
        "applicationOntologyVocabulary": ontology_policy,
        "applicationVocabularyUnion": union_policy,
        "parserBootstrapProperties": PARSER_BOOTSTRAP_POLICY,
        "expectedDeclarationTripleCount": union_policy["expectedTermCount"]
        + PARSER_BOOTSTRAP_POLICY["expectedPropertyCount"],
        "undeclaredEntitiesAllowed": False,
        "objectDataPropertyPunningAllowed": False,
        "wholePackageJsonCarrierVocabularyAllowed": False,
    }


def validate_profile(profile: dict[str, Any]) -> list[Diagnostic]:
    diagnostics: list[Diagnostic] = []
    roles = profile.get("roles", [])
    role_names = [rule.get("role") for rule in roles if isinstance(rule, dict)]
    if role_names != list(ROLE_POLICY):
        diagnostics.append(Diagnostic("PROFILE_ROLE_POLICY", "/roles", "Role vocabulary/order must equal fwu-owl-v1"))
    for rule in roles:
        if not isinstance(rule, dict) or rule.get("role") not in ROLE_POLICY:
            continue
        minimum, maximum, media_types, binding_kinds = ROLE_POLICY[rule["role"]]
        actual = (
            rule.get("minimum"),
            rule.get("maximum"),
            set(rule.get("mediaTypes", [])),
            set(rule.get("semanticBindingKinds", [])),
        )
        if actual != (minimum, maximum, media_types, binding_kinds):
            diagnostics.append(Diagnostic("PROFILE_ROLE_POLICY", f"/roles/{rule['role']}", "Role policy drift"))
    if tuple(profile.get("rdfPolicy", {}).get("segmentOrder", [])) != SEGMENTS:
        diagnostics.append(Diagnostic("PROFILE_SEGMENT_ORDER", "/rdfPolicy/segmentOrder", "Normative segment order differs"))
    if tuple(profile.get("validationGates", [])) != GATES:
        diagnostics.append(Diagnostic("PROFILE_GATE_VOCABULARY", "/validationGates", "Validation gate vocabulary/order differs"))
    if profile.get("declarationPolicy") != expected_declaration_policy():
        diagnostics.append(Diagnostic("PROFILE_DECLARATION_POLICY", "/declarationPolicy", "Declaration vocabulary union/bootstrap policy differs from its pinned sources"))
    if tuple(profile.get("contractPolicy", {}).get("requiredBindings", [])) != EXPECTED_BINDINGS:
        diagnostics.append(Diagnostic("PROFILE_CONTRACT_POLICY", "/contractPolicy/requiredBindings", "Required binding order differs"))
    if profile.get("coreBindingPolicy") != CORE_POLICY:
        diagnostics.append(Diagnostic("PROFILE_CORE_POLICY", "/coreBindingPolicy", "Core commit/path/media/bytes are not the pinned trust root"))
    if profile.get("applicationProfilePolicy") != APPLICATION_PROFILE_POLICY:
        diagnostics.append(Diagnostic("PROFILE_APPLICATION_ONTOLOGY_POLICY", "/applicationProfilePolicy", "Application ontology identity/import policy drift"))
    if profile.get("shapesPolicy") != SHAPES_POLICY:
        diagnostics.append(Diagnostic("PROFILE_SHAPES_POLICY", "/shapesPolicy", "SHACL identity/options/bytes policy drift"))
    contract_policy = profile.get("contractPolicy", {})
    if contract_policy.get("trustedBootstrapSchemas") != expected_bootstrap_bindings():
        diagnostics.append(Diagnostic("PROFILE_BOOTSTRAP_TRUST", "/contractPolicy/trustedBootstrapSchemas", "Bootstrap schemas differ from repository trust roots"))
    if contract_policy.get("trustedGlobalContracts") != expected_global_contract_bindings():
        diagnostics.append(Diagnostic("PROFILE_GLOBAL_TRUST", "/contractPolicy/trustedGlobalContracts", "Global semantic contracts differ from repository trust roots"))
    expected_source_policy = {
        "sourcePackageRequiredForValidation": True,
        "validationMode": "independent-full-standalone-v1",
        "packageLocalFallbackAllowed": False,
        "remoteResolutionAllowed": False,
        "compareIdentityFields": [
            "file", "bytes", "sha256", "manifestSha256", "releaseId", "curriculumEdition",
            "contentDigest", "runtimeContractVersion", "releaseProfileBinding", "supportedSkillpilotSoftware",
        ],
        "compareContractBindings": list(SOURCE_CONTRACT_NAMES),
        "compareBindingFields": ["id", "path", "sha256"],
    }
    if profile.get("sourceJsonBindingPolicy") != expected_source_policy:
        diagnostics.append(Diagnostic("PROFILE_SOURCE_JSON_POLICY", "/sourceJsonBindingPolicy", "External source JSON validation policy drift"))
    fallback_policy = profile.get("coreProjectionPolicy", {}).get("unscopedAtomicAreaPolicy")
    if fallback_policy != {
        "strategy": "single-generated-subject-area",
        "iriTemplate": "{landscapeIri}/core-projection/unscoped-curricular-area",
        "areaClass": "https://w3id.org/lehrplan/ontology/LP_0000349",
        "edgePredicate": "http://purl.obolibrary.org/obo/BFO_0000051",
        "selection": "curricularAtomic-without-direct-authored-curricularArea-parent",
        "emitWhenEmpty": False,
        "authoritativeForReverse": False,
    }:
        diagnostics.append(Diagnostic("PROFILE_CORE_PROJECTION", "/coreProjectionPolicy/unscopedAtomicAreaPolicy", "Unscoped atomic Core projection policy drift"))
    schema_policy = profile.get("schemaCatalogPolicy", {})
    if (
        schema_policy.get("construction") != "canonical-json-by-id-from-bootstrap-and-trusted-json-release-profile-v1"
        or schema_policy.get("bootstrapBindingNames") != [binding[0] for binding in BOOTSTRAP_SCHEMA_SPECS]
        or schema_policy.get("expectedEntryCount") != 25
    ):
        diagnostics.append(Diagnostic("PROFILE_SCHEMA_CATALOG_TRUST", "/schemaCatalogPolicy", "Schema catalog construction policy drift"))
    expected_semantic_policy = {
        "indexPath": "metadata/semantic-content-index.json",
        "indexContributesSeparatelyToContentDigest": False,
        "requireLogicalArtifactInventory": True,
        "requireBinaryResourceInventory": True,
        "requireDigestRecomputation": True,
        "requireCompleteRegistryCoverage": True,
    }
    if profile.get("semanticContentPolicy") != expected_semantic_policy:
        diagnostics.append(Diagnostic("PROFILE_SEMANTIC_CONTENT_POLICY", "/semanticContentPolicy", "Semantic content policy drift"))
    expected_support_policy = {
        "jsonContractSchemaCount": len(JSON_CONTRACT_SCHEMA_TARGETS),
        "requiredSingletonTypes": list(SINGLETON_RELEASE_SUPPORT),
        "assessmentSourceMinimum": 0,
        "assessmentSourceMaximum": 1000,
        "logicalJsonPayloadsAllowed": False,
        "targetPathsUnique": True,
        "trustedJsonReleaseProfile": TRUSTED_JSON_RELEASE_PROFILE,
    }
    if profile.get("releaseSupportPolicy") != expected_support_policy:
        diagnostics.append(Diagnostic("PROFILE_RELEASE_SUPPORT_POLICY", "/releaseSupportPolicy", "Reverse-package support policy drift"))
    security = profile.get("securityPolicy", {})
    if security.get("regularFilesOnly") is not True or any(
        security.get(key) is not False for key in security if key != "regularFilesOnly"
    ):
        diagnostics.append(Diagnostic("PROFILE_SECURITY_POLICY", "/securityPolicy", "Archive security must remain fail-closed"))
    return diagnostics


def validate_manifest(
    manifest: dict[str, Any],
    profile: dict[str, Any],
    source_validation: dict[str, Any] | None,
) -> list[Diagnostic]:
    diagnostics: list[Diagnostic] = []
    files = [item for item in manifest.get("files", []) if isinstance(item, dict)]
    paths = [record.get("path") for record in files]
    if len(paths) != len(set(paths)):
        diagnostics.append(Diagnostic("MANIFEST_DUPLICATE_PATH", "/files", "File paths must be unique"))
    normalized = [(unicodedata.normalize("NFC", str(path)).casefold(), path) for path in paths]
    if len({key for key, _path in normalized}) != len(normalized):
        diagnostics.append(Diagnostic("MANIFEST_PORTABLE_PATH_COLLISION", "/files", "Case/NFC path collision"))
    normalized_path_set = {key for key, _path in normalized}
    if any(
        any(other.startswith(path + "/") for other in normalized_path_set)
        for path in normalized_path_set
    ):
        diagnostics.append(Diagnostic("MANIFEST_PORTABLE_PATH_COLLISION", "/files", "Case/NFC file-directory prefix collision"))
    reserved = {"CON", "PRN", "AUX", "NUL", *(f"COM{number}" for number in range(1, 10)), *(f"LPT{number}" for number in range(1, 10))}
    for index, path in enumerate(paths):
        if not isinstance(path, str):
            continue
        segments = path.split("/")
        if any(segment.rstrip(" .").split(".", 1)[0].upper() in reserved for segment in segments):
            diagnostics.append(Diagnostic("MANIFEST_PORTABLE_PATH", f"/files/{index}/path", "Windows-reserved path segment"))
        if len(path.encode("utf-8")) > profile.get("archiveLimits", {}).get("archivePathBytes", 0):
            diagnostics.append(Diagnostic("MANIFEST_SECURITY_LIMIT", f"/files/{index}/path", "UTF-8 archive path exceeds profile"))
    path_set = {path for path in paths if isinstance(path, str)}
    if any(any(other.startswith(path + "/") for other in path_set) for path in path_set):
        diagnostics.append(Diagnostic("MANIFEST_PORTABLE_PATH_COLLISION", "/files", "File/directory prefix collision"))
    archive_root = manifest.get("archiveRoot", "")
    root_base = str(archive_root).rstrip(" .").split(".", 1)[0].upper()
    if root_base in reserved or str(archive_root).endswith((".", " ")):
        diagnostics.append(Diagnostic("MANIFEST_PORTABLE_ROOT", "/archiveRoot", "Archive root is not portable"))
    for index, path in enumerate(paths):
        if isinstance(path, str) and len(f"{archive_root}/{path}".encode("utf-8")) > profile.get("archiveLimits", {}).get("archivePathBytes", 0):
            diagnostics.append(Diagnostic("MANIFEST_SECURITY_LIMIT", f"/files/{index}/path", "Full ZIP entry path exceeds profile"))
    excluded = set(profile.get("inventoryPolicy", {}).get("excludedPaths", []))
    if excluded.intersection(paths):
        diagnostics.append(Diagnostic("MANIFEST_INVENTORY", "/files", "Excluded metadata path was inventoried"))
    normalized_excluded = {
        unicodedata.normalize("NFC", excluded_path).casefold()
        for excluded_path in excluded
    }
    if any(
        normalized_record == normalized_excluded_path
        or normalized_excluded_path.startswith(normalized_record + "/")
        or normalized_record.startswith(normalized_excluded_path + "/")
        for record_path in paths
        if isinstance(record_path, str)
        for normalized_record in [unicodedata.normalize("NFC", record_path).casefold()]
        for normalized_excluded_path in normalized_excluded
    ):
        diagnostics.append(Diagnostic("MANIFEST_PORTABLE_PATH_COLLISION", "/files", "Inventory path collides with excluded metadata paths"))
    path_index = by_path(files)

    if manifest.get("releaseId") != f"{manifest.get('packageId')}@{manifest.get('packageVersion')}":
        diagnostics.append(Diagnostic("MANIFEST_IDENTITY", "/releaseId", "releaseId must bind packageId and packageVersion"))
    source = manifest.get("sourceJsonPackage", {})
    if (
        source.get("releaseId") != manifest.get("releaseId")
        or source.get("curriculumEdition") != manifest.get("curriculumEdition")
        or source.get("contentDigest") != manifest.get("contentDigest")
        or source.get("runtimeContractVersion") != manifest.get("runtimeContractVersion")
        or source.get("supportedSkillpilotSoftware") != manifest.get("supportedSkillpilotSoftware")
        or source.get("releaseProfile") != "full-standalone-v1"
        or source.get("releaseProfileBinding")
        != {
            "id": TRUSTED_JSON_RELEASE_PROFILE["id"],
            "path": TRUSTED_JSON_RELEASE_PROFILE["targetPath"],
            "bytes": TRUSTED_JSON_RELEASE_PROFILE["bytes"],
            "sha256": TRUSTED_JSON_RELEASE_PROFILE["sha256"],
        }
    ):
        diagnostics.append(Diagnostic("MANIFEST_SOURCE_JSON_BINDING", "/sourceJsonPackage", "Source JSON identity/digest differs"))

    external = source_validation if isinstance(source_validation, dict) else {}
    external_input = external.get("input", {}) if isinstance(external.get("input"), dict) else {}
    external_manifest = external.get("manifest", {}) if isinstance(external.get("manifest"), dict) else {}
    external_files = by_path([item for item in external_manifest.get("files", []) if isinstance(item, dict)])
    external_bindings = external_manifest.get("contractBindings", {}) if isinstance(external_manifest.get("contractBindings"), dict) else {}
    projected_contracts: dict[str, Any] = {}
    external_contracts_valid = True
    for name in SOURCE_CONTRACT_NAMES:
        binding = external_bindings.get(name, {})
        record = external_files.get(binding.get("path"))
        if not record or record.get("sha256") != binding.get("sha256"):
            external_contracts_valid = False
        projected_contracts[name] = {key: binding.get(key) for key in ("id", "path", "sha256")}
    release_binding = external_bindings.get("releaseProfile", {})
    release_record = external_files.get(release_binding.get("path"), {})
    release_profile_valid = (
        release_binding.get("id") == TRUSTED_JSON_RELEASE_PROFILE["id"]
        and release_binding.get("path") == TRUSTED_JSON_RELEASE_PROFILE["targetPath"]
        and release_binding.get("sha256") == TRUSTED_JSON_RELEASE_PROFILE["sha256"]
        and release_record.get("bytes") == TRUSTED_JSON_RELEASE_PROFILE["bytes"]
        and release_record.get("sha256") == release_binding.get("sha256")
    )
    expected_source = {
        "file": external_input.get("file"),
        "bytes": external_input.get("bytes"),
        "sha256": external_input.get("sha256"),
        "manifestSha256": external_input.get("manifestSha256"),
        "releaseId": external_manifest.get("releaseId"),
        "curriculumEdition": external_manifest.get("curriculumEdition"),
        "contentDigest": external_manifest.get("contentDigest"),
        "runtimeContractVersion": external_manifest.get("runtimeContractVersion"),
        "releaseProfile": "full-standalone-v1",
        "releaseProfileBinding": {
            "id": release_binding.get("id"),
            "path": release_binding.get("path"),
            "bytes": release_record.get("bytes"),
            "sha256": release_binding.get("sha256"),
        },
        "supportedSkillpilotSoftware": external_manifest.get("supportedSkillpilotSoftware"),
        "semanticContracts": projected_contracts,
    }
    if (
        external.get("status") != "valid"
        or external_input.get("manifestSha256") is None
        or external_manifest.get("manifestSha256", external_input.get("manifestSha256")) != external_input.get("manifestSha256")
        or not external_contracts_valid
        or not release_profile_valid
        or source != expected_source
    ):
        diagnostics.append(Diagnostic("MANIFEST_EXTERNAL_SOURCE_JSON", "/sourceJsonPackage", "Source JSON binding is not derived from one independently validated external package"))

    role_rules = {rule["role"]: rule for rule in profile.get("roles", []) if isinstance(rule, dict) and "role" in rule}
    role_counts = Counter(record.get("role") for record in files)
    for role, rule in role_rules.items():
        count = role_counts.get(role, 0)
        if not (rule.get("minimum", 0) <= count <= rule.get("maximum", -1)):
            diagnostics.append(Diagnostic("MANIFEST_ROLE_CARDINALITY", "/files", f"Role {role} count {count} is outside profile"))
    for index, record in enumerate(files):
        rule = role_rules.get(record.get("role"))
        semantic_kind = record.get("semanticBinding", {}).get("kind")
        if not rule or record.get("mediaType") not in rule.get("mediaTypes", []) or semantic_kind not in rule.get("semanticBindingKinds", []):
            diagnostics.append(Diagnostic("MANIFEST_ROLE_POLICY", f"/files/{index}", "Role/media/semantic binding mismatch"))
        status = record.get("redistributionStatus")
        license_expression = record.get("licenseExpression")
        if (status == "allowed") != isinstance(license_expression, str):
            diagnostics.append(Diagnostic("MANIFEST_LICENSE_POLICY", f"/files/{index}", "Allowed needs a license; open/prohibited needs null"))
        if status == "prohibited":
            diagnostics.append(Diagnostic("MANIFEST_LICENSE_POLICY", f"/files/{index}", "A prohibited file cannot be embedded in a distributable package"))

    limits = profile.get("archiveLimits", {})
    if len(files) > profile.get("manifestLimits", {}).get("fileRecords", 0):
        diagnostics.append(Diagnostic("MANIFEST_SECURITY_LIMIT", "/files", "File-record count exceeds profile"))
    if sum(record.get("bytes", 0) for record in files) > limits.get("totalUncompressedBytes", 0):
        diagnostics.append(Diagnostic("MANIFEST_SECURITY_LIMIT", "/files", "Inventoried uncompressed bytes exceed profile"))
    for index, record in enumerate(files):
        size = record.get("bytes", 0)
        role = record.get("role")
        media_type = record.get("mediaType")
        maximum = limits.get("genericEntryBytes", 0)
        if role == "rdf-segment":
            maximum = limits.get("rdfSegmentBytes", 0)
        elif role == "rdf-bundle":
            maximum = limits.get("rdfBundleBytes", 0)
        elif role == "binary-resource":
            maximum = limits.get("binaryResourceBytes", 0)
        elif media_type in {"application/json", "application/schema+json"}:
            maximum = limits.get("jsonEntryBytes", 0)
        if size > maximum:
            diagnostics.append(Diagnostic("MANIFEST_SECURITY_LIMIT", f"/files/{index}/bytes", "File exceeds its role/media limit"))

    bindings = manifest.get("contractBindings", {})
    for name in EXPECTED_BINDINGS:
        binding = bindings.get(name, {})
        if not binding_matches(path_index.get(binding.get("path")), binding, name):
            diagnostics.append(Diagnostic("MANIFEST_CONTRACT_BINDING", f"/contractBindings/{name}", "Binding is not backed by one exact file record"))
    if bindings.get("fieldSemanticsRegistry", {}).get("id") != "skillpilot-fwu-field-semantics-v1":
        diagnostics.append(Diagnostic("MANIFEST_REGISTRY_BINDING", "/contractBindings/fieldSemanticsRegistry", "Unexpected field registry"))
    for name, expected_id in EXPECTED_STATIC_BINDING_IDS.items():
        if bindings.get(name, {}).get("id") != expected_id:
            diagnostics.append(Diagnostic("MANIFEST_CONTRACT_ID", f"/contractBindings/{name}/id", "Contract identity is not the pinned v1 identity"))
    trusted_contracts = expected_bootstrap_bindings() + expected_global_contract_bindings()
    for trusted in trusted_contracts:
        name = trusted["bindingName"]
        expected_binding = {
            "id": trusted["id"],
            "path": trusted["packagePath"],
            "bytes": trusted["bytes"],
            "sha256": trusted["sha256"],
        }
        if bindings.get(name) != expected_binding:
            diagnostics.append(Diagnostic("MANIFEST_TRUST_ROOT_BINDING", f"/contractBindings/{name}", "Contract differs from its external repository trust root"))
    profile_bytes, profile_sha256 = byte_binding(PROFILE_PATH)
    if bindings.get("packageProfile") != {
        "id": "fwu-owl-v1",
        "path": "profiles/fwu-owl-v1.profile.json",
        "bytes": profile_bytes,
        "sha256": profile_sha256,
    }:
        diagnostics.append(Diagnostic("MANIFEST_PACKAGE_PROFILE_TRUST", "/contractBindings/packageProfile", "Package profile differs from the external validator trust root"))
    source_contracts = source.get("semanticContracts", {})
    for name in SOURCE_SEMANTIC_BINDINGS:
        actual = bindings.get(name, {})
        expected = source_contracts.get(name, {})
        if any(actual.get(key) != expected.get(key) for key in ("id", "sha256")):
            diagnostics.append(Diagnostic("MANIFEST_SEMANTIC_CONTRACT_BINDING", f"/contractBindings/{name}", "Ontology package semantic contract differs from source JSON package"))

    semantic_index = manifest.get("semanticContentIndex", {})
    schema_catalog = manifest.get("schemaCatalog", {})
    schema_catalog_record = path_index.get(schema_catalog.get("path"))
    _expected_catalog, expected_catalog_bytes = expected_schema_catalog(profile)
    expected_catalog_binding = {
        "bytes": len(expected_catalog_bytes),
        "sha256": hashlib.sha256(expected_catalog_bytes).hexdigest(),
    }
    if (
        schema_catalog.get("schemaId") != profile.get("schemaCatalogPolicy", {}).get("schemaId")
        or schema_catalog.get("path") != profile.get("schemaCatalogPolicy", {}).get("path")
        or schema_catalog.get("entries") != len(profile.get("schemaCatalogPolicy", {}).get("requiredSchemaIds", []))
        or schema_catalog.get("bytes") != expected_catalog_binding["bytes"]
        or schema_catalog.get("sha256") != expected_catalog_binding["sha256"]
        or not schema_catalog_record
        or schema_catalog_record.get("role") != "schema-catalog"
        or schema_catalog_record.get("mediaType") != schema_catalog.get("mediaType")
        or schema_catalog_record.get("bytes") != schema_catalog.get("bytes")
        or schema_catalog_record.get("sha256") != schema_catalog.get("sha256")
        or schema_catalog_record.get("semanticBinding") != {"kind": "schema-catalog"}
    ):
        diagnostics.append(Diagnostic("MANIFEST_SCHEMA_CATALOG", "/schemaCatalog", "Schema catalog descriptor/file binding differs from the closed policy"))
    index_record = path_index.get(semantic_index.get("path"))
    if (
        not index_record
        or index_record.get("role") != "semantic-content-index"
        or index_record.get("mediaType") != "application/json"
        or index_record.get("bytes") != semantic_index.get("bytes")
        or index_record.get("sha256") != semantic_index.get("sha256")
        or index_record.get("semanticBinding") != {"kind": "semantic-content-index"}
    ):
        diagnostics.append(Diagnostic("MANIFEST_SEMANTIC_CONTENT_INDEX", "/semanticContentIndex", "Semantic content index is not backed by one exact inventory record"))
    if semantic_index.get("contentDigest") != manifest.get("contentDigest"):
        diagnostics.append(Diagnostic("MANIFEST_CONTENT_DIGEST", "/semanticContentIndex/contentDigest", "Content digest is not bound to the semantic content index"))
    registry_entry_count = len(load_json(CONTRACT_ROOT / "profiles" / "skillpilot-fwu-field-semantics-v1.registry.json").get("entries", []))
    if semantic_index.get("fieldRegistryEntryCount") != registry_entry_count:
        diagnostics.append(Diagnostic("MANIFEST_FIELD_REGISTRY_COVERAGE", "/semanticContentIndex/fieldRegistryEntryCount", "Field registry inventory is incomplete or stale"))

    rdf_segments = manifest.get("rdfSegments", [])
    if tuple(segment.get("segmentId") for segment in rdf_segments if isinstance(segment, dict)) != SEGMENTS or [segment.get("position") for segment in rdf_segments if isinstance(segment, dict)] != list(range(8)):
        diagnostics.append(Diagnostic("MANIFEST_SEGMENT_ORDER", "/rdfSegments", "Segments must have fixed IDs and contiguous positions"))
    for segment in rdf_segments:
        if not isinstance(segment, dict):
            continue
        record = path_index.get(segment.get("path"))
        semantic = (record or {}).get("semanticBinding", {})
        if not record or record.get("role") != "rdf-segment" or any(record.get(key) != segment.get(key) for key in ("mediaType", "bytes", "sha256")) or semantic != {"kind": "normative-rdf-segment", "segmentId": segment.get("segmentId"), "position": segment.get("position")}:
            diagnostics.append(Diagnostic("MANIFEST_SEGMENT_BINDING", f"/rdfSegments/{segment.get('position')}", "Segment does not match its file record"))
    bundle = manifest.get("rdfBundle", {})
    bundle_record = path_index.get(bundle.get("path"))
    segment_paths = {segment.get("path") for segment in rdf_segments if isinstance(segment, dict)}
    if (
        bundle.get("path") in segment_paths
        or not bundle_record
        or bundle_record.get("role") != "rdf-bundle"
        or bundle_record.get("bytes") != bundle.get("bytes")
        or bundle_record.get("sha256") != bundle.get("sha256")
        or bundle.get("bytes") != sum(segment.get("bytes", 0) for segment in rdf_segments if isinstance(segment, dict))
        or bundle.get("triples") != sum(segment.get("triples", 0) for segment in rdf_segments if isinstance(segment, dict))
        or tuple(bundle.get("segmentOrder", [])) != SEGMENTS
    ):
        diagnostics.append(Diagnostic("MANIFEST_BUNDLE_DISTINCTION", "/rdfBundle", "Bundle must be the separate exact ordered segment concatenation"))
    if bundle.get("triples", 0) <= 0:
        diagnostics.append(Diagnostic("MANIFEST_RDF_NONEMPTY", "/rdfBundle/triples", "A release package cannot contain an empty RDF graph"))

    def exact_file(binding: dict[str, Any], role: str, kind: str) -> bool:
        record = path_index.get(binding.get("path"))
        return bool(
            record
            and record.get("role") == role
            and record.get("bytes") == binding.get("bytes")
            and record.get("sha256") == binding.get("sha256")
            and (binding.get("mediaType") is None or record.get("mediaType") == binding.get("mediaType"))
            and record.get("semanticBinding", {}).get("kind") == kind
        )

    core = manifest.get("fwuCore", {})
    core_record = path_index.get(core.get("bundledPath"), {})
    catalog_record = path_index.get(core.get("catalogPath"), {})
    if (
        core
        != {
            "ontologyIri": CORE_POLICY["canonicalOntologyIri"],
            "sourceRepository": CORE_POLICY["sourceRepository"],
            "commit": CORE_POLICY["sourceCommit"],
            "sourcePath": CORE_POLICY["sourcePath"],
            "bundledPath": CORE_POLICY["bundledPath"],
            "catalogPath": CORE_POLICY["catalogPath"],
            "catalogMediaType": CORE_POLICY["catalogMediaType"],
            "catalogBytes": CORE_POLICY["catalogBytes"],
            "catalogSha256": CORE_POLICY["catalogSha256"],
            "mediaType": CORE_POLICY["mediaType"],
            "syntax": CORE_POLICY["syntax"],
            "bytes": CORE_POLICY["bytes"],
            "sha256": CORE_POLICY["sha256"],
        }
        or not exact_file(
            {
                "path": core.get("bundledPath"),
                "mediaType": core.get("mediaType"),
                "bytes": core.get("bytes"),
                "sha256": core.get("sha256"),
            },
            "ontology-core",
            "ontology-core",
        )
        or not exact_file({"path": core.get("catalogPath"), "mediaType": core.get("catalogMediaType"), "bytes": core.get("catalogBytes"), "sha256": core.get("catalogSha256")}, "ontology-catalog", "ontology-catalog")
    ):
        diagnostics.append(Diagnostic("MANIFEST_CORE_BINDING", "/fwuCore", "Core/catalog binding differs from inventory"))
    if (
        core_record.get("provenanceClass") != "fwu-core-pinned-copy"
        or core_record.get("redistributionStatus") != "review-required"
        or core_record.get("licenseExpression") is not None
        or catalog_record.get("provenanceClass") != "skillpilot-authored"
        or catalog_record.get("redistributionStatus") != "allowed"
        or catalog_record.get("licenseExpression") != "Apache-2.0"
    ):
        diagnostics.append(Diagnostic("MANIFEST_CORE_PROVENANCE", "/fwuCore", "Core/catalog provenance and redistribution state must remain truthful"))
    if not exact_file(manifest.get("applicationProfile", {}), "ontology-profile", "ontology-profile"):
        diagnostics.append(Diagnostic("MANIFEST_ONTOLOGY_PROFILE_BINDING", "/applicationProfile", "Application profile binding differs"))
    application = manifest.get("applicationProfile", {})
    application_policy = profile.get("applicationProfilePolicy", {})
    if (
        application.get("ontologyIri") != application_policy.get("ontologyIri")
        or application.get("versionIri") != application_policy.get("versionIri")
        or application.get("version") != application_policy.get("version")
        or application.get("imports") != application_policy.get("requiredImports")
        or application.get("path") != application_policy.get("packagePath")
        or application.get("mediaType") != application_policy.get("mediaType")
        or application.get("bytes") != application_policy.get("bytes")
        or application.get("sha256") != application_policy.get("sha256")
    ):
        diagnostics.append(Diagnostic("MANIFEST_APPLICATION_ONTOLOGY_IDENTITY", "/applicationProfile", "Application ontology identity/version/imports differ from the pinned profile"))
    if not exact_file(manifest.get("shapes", {}), "ontology-shapes", "ontology-shapes"):
        diagnostics.append(Diagnostic("MANIFEST_SHAPES_BINDING", "/shapes", "Shapes binding differs"))
    shapes = manifest.get("shapes", {})
    shapes_policy = profile.get("shapesPolicy", {})
    expected_shapes = {
        "shapesIri": shapes_policy.get("shapesIri"),
        "versionIri": shapes_policy.get("versionIri"),
        "version": shapes_policy.get("version"),
        "path": shapes_policy.get("packagePath"),
        "mediaType": shapes_policy.get("mediaType"),
        "bytes": shapes_policy.get("bytes"),
        "sha256": shapes_policy.get("sha256"),
    }
    if shapes != expected_shapes:
        diagnostics.append(Diagnostic("MANIFEST_SHAPES_IDENTITY", "/shapes", "Shapes identity/version/bytes differ from the pinned profile"))

    resource_ids: list[str] = []
    public_refs: list[str] = []
    binary_bytes = 0
    capabilities = set(profile.get("resourceCapabilities", {}).get("embeddedBinaryMediaTypes", []))
    for index, record in enumerate(files):
        if record.get("role") != "binary-resource":
            continue
        semantic = record.get("semanticBinding", {})
        resource_ids.append(str(semantic.get("resourceId")))
        public_refs.append(str(semantic.get("publicReference")))
        binary_bytes += record.get("bytes", 0)
        if record.get("mediaType") not in capabilities or semantic.get("kind") != "binary-resource":
            diagnostics.append(Diagnostic("MANIFEST_SIDECAR_BINDING", f"/files/{index}", "Unsupported or unbound binary sidecar"))
        if record.get("path") != str(semantic.get("publicReference", "")).removeprefix("/"):
            diagnostics.append(Diagnostic("MANIFEST_SIDECAR_BINDING", f"/files/{index}", "Binary sidecar path must equal its canonical root-relative public reference"))
        if record.get("bytes", 0) > profile.get("archiveLimits", {}).get("binaryResourceBytes", 0):
            diagnostics.append(Diagnostic("MANIFEST_SECURITY_LIMIT", f"/files/{index}/bytes", "Binary sidecar exceeds profile"))
    if len(resource_ids) != len(set(resource_ids)) or len(public_refs) != len(set(public_refs)):
        diagnostics.append(Diagnostic("MANIFEST_SIDECAR_BINDING", "/files", "Binary resource identities/public references must be unique"))
    if binary_bytes > profile.get("archiveLimits", {}).get("binaryLaneBytes", 0):
        diagnostics.append(Diagnostic("MANIFEST_SECURITY_LIMIT", "/files", "Binary lane exceeds profile"))
    if semantic_index.get("binaryResourceCount") != len(resource_ids):
        diagnostics.append(Diagnostic("MANIFEST_SEMANTIC_CONTENT_INDEX", "/semanticContentIndex/binaryResourceCount", "Semantic content index binary inventory differs from package files"))

    release_support = [item for item in manifest.get("releaseSupport", []) if isinstance(item, dict)]
    support_files = [item for item in files if item.get("role") == "release-support"]
    support_keys = [(item.get("supportType"), item.get("supportId"), item.get("targetPath"), item.get("path")) for item in release_support]
    if (
        len(support_keys) != len(set(support_keys))
        or len({item.get("supportId") for item in release_support}) != len(release_support)
        or len({item.get("targetPath") for item in release_support}) != len(release_support)
    ):
        diagnostics.append(Diagnostic("MANIFEST_RELEASE_SUPPORT", "/releaseSupport", "Release-support identities, paths, and targets must be unique"))
    support_by_path = {item.get("path"): item for item in release_support}
    if set(support_by_path) != {item.get("path") for item in support_files}:
        diagnostics.append(Diagnostic("MANIFEST_RELEASE_SUPPORT", "/releaseSupport", "Release-support records and inventory files must form an exact set"))
    for index, support in enumerate(release_support):
        record = path_index.get(support.get("path"))
        semantic = (record or {}).get("semanticBinding", {})
        expected_semantic = {
            "kind": "release-support",
            "supportType": support.get("supportType"),
            "supportId": support.get("supportId"),
            "targetPath": support.get("targetPath"),
        }
        if (
            not record
            or record.get("role") != "release-support"
            or any(record.get(key) != support.get(key) for key in ("mediaType", "bytes", "sha256"))
            or semantic != expected_semantic
        ):
            diagnostics.append(Diagnostic("MANIFEST_RELEASE_SUPPORT", f"/releaseSupport/{index}", "Release-support record is not backed by one exact file record"))
        target = str(support.get("targetPath", ""))
        if target.startswith(("data/canonical/", "data/views/", "data/cards/", "data/runtime/", "data/resources/", "data/mappings/", "data/sources/", "metadata/quality/")) or target == "metadata/semantic-content-index.json":
            diagnostics.append(Diagnostic("MANIFEST_HIDDEN_LOGICAL_JSON", f"/releaseSupport/{index}/targetPath", "Release support must not carry hidden logical JSON content"))
    support_types = Counter(item.get("supportType") for item in release_support)
    schema_targets = {item.get("targetPath") for item in release_support if item.get("supportType") == "json-contract-schema"}
    schema_media = {item.get("mediaType") for item in release_support if item.get("supportType") == "json-contract-schema"}
    if support_types.get("json-contract-schema") != len(JSON_CONTRACT_SCHEMA_TARGETS) or schema_targets != set(JSON_CONTRACT_SCHEMA_TARGETS) or schema_media != {"application/schema+json"}:
        diagnostics.append(Diagnostic("MANIFEST_RELEASE_SUPPORT", "/releaseSupport", "The exact 22-schema JSON reverse-validation set is required"))
    trusted_profile = load_json(TRUSTED_JSON_RELEASE_PROFILE_PATH)
    trusted_by_target: dict[str, dict[str, Any]] = {}
    for binding in trusted_profile.get("trustedContractSchemas", []):
        schema_id = binding.get("id")
        target = "schemas/" + str(schema_id).rsplit("/", 1)[-1]
        local_path = CONTRACT_ROOT / Path(target).name
        trusted_by_target[target] = {
            "sha256": binding.get("sha256"),
            "bytes": local_path.stat().st_size,
        }
    for index, support in enumerate(release_support):
        if support.get("supportType") != "json-contract-schema":
            continue
        expected = trusted_by_target.get(str(support.get("targetPath")))
        expected_support_id = Path(str(support.get("targetPath"))).name.removesuffix(".schema.json")
        if not expected or support.get("supportId") != expected_support_id or support.get("sha256") != expected["sha256"] or support.get("bytes") != expected["bytes"]:
            diagnostics.append(Diagnostic("MANIFEST_RELEASE_SUPPORT_TRUST", f"/releaseSupport/{index}", "Reverse schema differs from the externally trusted JSON release profile"))
    for support_type, expected in SINGLETON_RELEASE_SUPPORT.items():
        matching = [item for item in release_support if item.get("supportType") == support_type]
        if len(matching) != 1 or (matching[0].get("supportId"), matching[0].get("targetPath"), matching[0].get("mediaType")) != expected:
            diagnostics.append(Diagnostic("MANIFEST_RELEASE_SUPPORT", "/releaseSupport", f"Required singleton {support_type} is missing or substituted"))
    release_profiles = [item for item in release_support if item.get("supportType") == "json-release-profile"]
    if len(release_profiles) != 1 or any(release_profiles[0].get(key) != TRUSTED_JSON_RELEASE_PROFILE[policy_key] for key, policy_key in (("supportId", "id"), ("targetPath", "targetPath"), ("path", "packagePath"), ("mediaType", "mediaType"), ("bytes", "bytes"), ("sha256", "sha256"))):
        diagnostics.append(Diagnostic("MANIFEST_RELEASE_SUPPORT_TRUST", "/releaseSupport", "JSON release profile differs from its pinned source binding"))
    assessment = [item for item in release_support if item.get("supportType") == "assessment-source"]
    support_policy = profile.get("releaseSupportPolicy", {})
    if not support_policy.get("assessmentSourceMinimum", 0) <= len(assessment) <= support_policy.get("assessmentSourceMaximum", -1):
        diagnostics.append(Diagnostic("MANIFEST_RELEASE_SUPPORT", "/releaseSupport", "Assessment-source count is outside profile"))
    for item in assessment:
        if not str(item.get("targetPath", "")).startswith("data/assessment-sources/") or not str(item.get("targetPath", "")).endswith(".md") or item.get("mediaType") != "text/markdown":
            diagnostics.append(Diagnostic("MANIFEST_RELEASE_SUPPORT", "/releaseSupport", "Assessment sources must be Markdown under data/assessment-sources"))

    license_files = [record for record in files if record.get("role") == "license"]
    license_documents = [item for item in manifest.get("licenseDocuments", []) if isinstance(item, dict)]
    document_pairs = [(item.get("licenseId"), item.get("path")) for item in license_documents]
    record_pairs = [(item.get("semanticBinding", {}).get("licenseId"), item.get("path")) for item in license_files]
    if len(document_pairs) != len(set(document_pairs)) or len({item[0] for item in document_pairs}) != len(document_pairs) or len({item[1] for item in document_pairs}) != len(document_pairs) or set(document_pairs) != set(record_pairs):
        diagnostics.append(Diagnostic("MANIFEST_LICENSE_POLICY", "/licenseDocuments", "License documents and license file records must resolve one-to-one"))
    resolved_license_ids = {license_id for license_id, _path in document_pairs}
    for index, record in enumerate(files):
        expression = record.get("licenseExpression")
        if isinstance(expression, str) and expression not in resolved_license_ids:
            diagnostics.append(Diagnostic("MANIFEST_LICENSE_POLICY", f"/files/{index}/licenseExpression", "License expression has no bundled license document"))
    return diagnostics


def validate_report(report: dict[str, Any], manifest: dict[str, Any], profile: dict[str, Any]) -> list[Diagnostic]:
    diagnostics: list[Diagnostic] = []
    gate_ids = tuple(gate.get("id") for gate in report.get("gates", []) if isinstance(gate, dict))
    if gate_ids != tuple(profile.get("validationGates", [])) or gate_ids != GATES:
        diagnostics.append(Diagnostic("REPORT_GATE_VOCABULARY", "/gates", "Report gates differ from profile"))
    if report.get("status") == "valid" and any(gate.get("status") != "passed" for gate in report.get("gates", [])):
        diagnostics.append(Diagnostic("REPORT_VALID_GATE", "/gates", "A valid report requires every gate passed"))
    package_value = report.get("package")
    package = package_value if isinstance(package_value, dict) else {}
    if report.get("status") == "valid" and (any(package.get(key) != manifest.get(key) for key in ("releaseId", "packageId", "packageVersion", "contentDigest", "archiveRoot")) or report.get("input", {}).get("manifestSha256") != package.get("manifestSha256")):
        diagnostics.append(Diagnostic("REPORT_PACKAGE_BINDING", "/package", "Report package/manifest identity differs"))
    if report.get("status") == "valid" and package.get("sourceJsonPackage") != manifest.get("sourceJsonPackage"):
        diagnostics.append(Diagnostic("REPORT_SOURCE_JSON_BINDING", "/package/sourceJsonPackage", "Report does not attest the independently opened source JSON package"))

    expected_hash_bindings = {
        "packageProfile": manifest.get("contractBindings", {}).get("packageProfile", {}),
        "schemaCatalog": manifest.get("schemaCatalog", {}),
        "fieldSemanticsRegistry": manifest.get("contractBindings", {}).get("fieldSemanticsRegistry", {}),
        "definitionDigestProfile": manifest.get("contractBindings", {}).get("definitionDigestProfile", {}),
        "semanticContentIndex": manifest.get("semanticContentIndex", {}),
        "applicationProfile": manifest.get("applicationProfile", {}),
        "shapes": manifest.get("shapes", {}),
        "rdfBundle": manifest.get("rdfBundle", {}),
    }
    for name, expected in expected_hash_bindings.items():
        actual = package.get(name, {})
        if report.get("status") == "valid" and any(actual.get(key) != expected.get(key) for key in ("path", "bytes", "sha256")):
            diagnostics.append(Diagnostic("REPORT_ARTIFACT_BINDING", f"/package/{name}", "Report artifact binding differs"))
    core = package.get("fwuCore", {})
    source_core = manifest.get("fwuCore", {})
    source_key = {
        "path": "bundledPath",
        "catalogPath": "catalogPath",
        "catalogBytes": "catalogBytes",
        "catalogSha256": "catalogSha256",
    }
    if report.get("status") == "valid" and any(core.get(key) != source_core.get(source_key.get(key, key)) for key in ("ontologyIri", "commit", "sourcePath", "path", "catalogPath", "catalogBytes", "catalogSha256", "bytes", "sha256")):
        diagnostics.append(Diagnostic("REPORT_CORE_BINDING", "/package/fwuCore", "Report Core binding differs"))

    files = [item for item in manifest.get("files", []) if isinstance(item, dict)]
    binary = [item for item in files if item.get("role") == "binary-resource"]
    expected_counts = {
        "zipEntries": len(files) + 2,
        "manifestFiles": len(files),
        "rdfSegments": 8,
        "rdfTriples": manifest.get("rdfBundle", {}).get("triples"),
        "logicalArtifacts": manifest.get("semanticContentIndex", {}).get("logicalArtifactCount"),
        "fieldRegistryEntries": manifest.get("semanticContentIndex", {}).get("fieldRegistryEntryCount"),
        "logicalArtifacts": manifest.get("semanticContentIndex", {}).get("logicalArtifactCount"),
        "fieldRegistryEntries": manifest.get("semanticContentIndex", {}).get("fieldRegistryEntryCount"),
        "binaryResources": len(binary),
        "binaryBytes": sum(item.get("bytes", 0) for item in binary),
    }
    if report.get("status") == "valid" and report.get("counts") != expected_counts:
        diagnostics.append(Diagnostic("REPORT_COUNTS", "/counts", "Report counts differ from manifest"))

    evidence = report.get("ontologyEvidence", {})
    if report.get("status") == "valid":
        if any(evidence.get(name, {}).get("status") != "passed" or evidence.get(name, {}).get("reportSha256") is None for name in ("rdfSyntax", "shacl", "owl2Dl", "reasoner")):
            diagnostics.append(Diagnostic("REPORT_ONTOLOGY_EVIDENCE", "/ontologyEvidence", "Valid report needs bound passed ontology evidence"))
        if evidence.get("shacl", {}).get("violationCount") != 0 or evidence.get("shacl", {}).get("warningCount") != 0 or evidence.get("reasoner", {}).get("consistent") is not True or evidence.get("reasoner", {}).get("unsatisfiableClassCount") != 0:
            diagnostics.append(Diagnostic("REPORT_ONTOLOGY_EVIDENCE", "/ontologyEvidence", "SHACL/reasoner result is not release-clean"))
        evidence_paths = [evidence.get(name, {}).get("report") for name in ("rdfSyntax", "shacl", "owl2Dl", "reasoner")]
        if any(not isinstance(path, str) for path in evidence_paths) or len(set(evidence_paths)) != 4:
            diagnostics.append(Diagnostic("REPORT_ONTOLOGY_EVIDENCE", "/ontologyEvidence", "Ontology evidence paths must be present and unique"))

    reproducibility = report.get("reproducibility", {})
    run_a = reproducibility.get("runA", {})
    run_b = reproducibility.get("runB", {})
    if report.get("status") == "valid" and (
        reproducibility.get("status") != "passed"
        or reproducibility.get("byteIdentical") is not True
        or run_a != run_b
        or run_a.get("zipSha256") != report.get("input", {}).get("sha256")
        or run_a.get("manifestSha256") != report.get("input", {}).get("manifestSha256")
    ):
        diagnostics.append(Diagnostic("REPORT_REPRODUCIBILITY", "/reproducibility", "Double build is not bound and byte-identical"))
    return diagnostics


def validate_contract(fixture: dict[str, Any], schemas: dict[str, dict[str, Any]]) -> list[Diagnostic]:
    diagnostics: list[Diagnostic] = []
    if not isinstance(fixture.get("sourceJsonValidation"), dict):
        diagnostics.append(Diagnostic("FIXTURE_SHAPE", "/sourceJsonValidation", "Fixture must carry an independent source JSON validation anchor"))
    for key in ("profile", "manifest", "validationReport"):
        value = fixture.get(key)
        if not isinstance(value, dict):
            diagnostics.append(Diagnostic("FIXTURE_SHAPE", f"/{key}", "Fixture member must be an object"))
            continue
        diagnostics.extend(schema_diagnostics(key, schemas[key], value))
    profile = fixture.get("profile", {})
    manifest = fixture.get("manifest", {})
    report = fixture.get("validationReport", {})
    if isinstance(profile, dict):
        diagnostics.extend(validate_profile(profile))
    if isinstance(profile, dict) and isinstance(manifest, dict):
        source_validation = fixture.get("sourceJsonValidation")
        diagnostics.extend(validate_manifest(manifest, profile, source_validation if isinstance(source_validation, dict) else None))
    if isinstance(profile, dict) and isinstance(manifest, dict) and isinstance(report, dict):
        diagnostics.extend(validate_report(report, manifest, profile))
    return diagnostics


def nonvalid_status_fixture(fixture: dict[str, Any], status: str) -> dict[str, Any]:
    candidate = copy.deepcopy(fixture)
    report = candidate["validationReport"]
    report["status"] = status
    report["package"] = None
    report["counts"] = None
    report["input"]["sha256"] = None
    report["input"]["manifestSha256"] = None
    for index, gate in enumerate(report["gates"]):
        gate["status"] = "failed" if status == "invalid" and index == 0 else "not-evaluated"
        gate["summary"] = "Validation failed" if gate["status"] == "failed" else "Not evaluated"
    report["ontologyEvidence"] = {
        "rdfSyntax": {"status": "not-evaluated", "tool": None, "version": None, "report": None, "reportSha256": None},
        "shacl": {"status": "not-evaluated", "tool": None, "version": None, "report": None, "reportSha256": None, "violationCount": None, "warningCount": None},
        "owl2Dl": {"status": "not-evaluated", "tool": None, "version": None, "report": None, "reportSha256": None},
        "reasoner": {"status": "not-evaluated", "tool": None, "version": None, "report": None, "reportSha256": None, "consistent": None, "unsatisfiableClassCount": None},
    }
    report["reproducibility"] = {
        "status": "not-evaluated",
        "sourceDateEpoch": None,
        "locale": "C.UTF-8",
        "timezone": "UTC",
        "runA": None,
        "runB": None,
        "byteIdentical": None,
    }
    report["diagnostics"] = [{
        "code": "PACKAGE_INVALID" if status == "invalid" else "VALIDATOR_ERROR",
        "path": "/",
        "message": "Package validation failed" if status == "invalid" else "Validator could not evaluate the package",
    }]
    report["diagnosticsTruncated"] = False
    return candidate


def run_mutations(fixture: dict[str, Any], schemas: dict[str, dict[str, Any]], verbose: bool) -> int:
    cases: list[tuple[str, str, Callable[[dict[str, Any]], None]]] = []

    def case(name: str, code: str, mutation: Callable[[dict[str, Any]], None]) -> None:
        cases.append((name, code, mutation))

    def file_for(value: dict[str, Any], role: str) -> dict[str, Any]:
        return next(record for record in value["manifest"]["files"] if record.get("role") == role)

    def bind_source_hash_mismatch(value: dict[str, Any]) -> None:
        binding = value["manifest"]["contractBindings"]["definitionDigestProfile"]
        binding["sha256"] = "f" * 64
        next(record for record in value["manifest"]["files"] if record.get("path") == binding["path"])["sha256"] = "f" * 64

    def set_empty_rdf(value: dict[str, Any]) -> None:
        for segment in value["manifest"]["rdfSegments"]:
            segment["triples"] = 0
        value["manifest"]["rdfBundle"]["triples"] = 0

    def forge_content_digest(value: dict[str, Any]) -> None:
        forged = "sha256:" + "0" * 64
        value["manifest"]["contentDigest"] = forged
        value["manifest"]["sourceJsonPackage"]["contentDigest"] = forged

    def remove_release_support(value: dict[str, Any]) -> None:
        removed = value["manifest"]["releaseSupport"].pop()
        value["manifest"]["files"] = [record for record in value["manifest"]["files"] if record.get("path") != removed["path"]]

    def duplicate_support_target(value: dict[str, Any]) -> None:
        support = value["manifest"]["releaseSupport"][1]
        support["targetPath"] = value["manifest"]["releaseSupport"][0]["targetPath"]
        next(record for record in value["manifest"]["files"] if record.get("path") == support["path"])["semanticBinding"]["targetPath"] = support["targetPath"]

    def hide_logical_json(value: dict[str, Any]) -> None:
        support = value["manifest"]["releaseSupport"][0]
        support["targetPath"] = "data/canonical/hidden.json"
        next(record for record in value["manifest"]["files"] if record.get("path") == support["path"])["semanticBinding"]["targetPath"] = support["targetPath"]

    def relabel_core(value: dict[str, Any]) -> None:
        record = file_for(value, "ontology-core")
        record.update({
            "licenseExpression": "Apache-2.0",
            "provenanceClass": "skillpilot-authored",
            "redistributionStatus": "allowed",
        })

    def prohibit_binary(value: dict[str, Any]) -> None:
        file_for(value, "binary-resource").update({
            "licenseExpression": None,
            "redistributionStatus": "prohibited",
        })

    def swap_contract_roles(value: dict[str, Any]) -> None:
        schema_binding = value["manifest"]["contractBindings"]["manifestSchema"]
        contract_binding = value["manifest"]["contractBindings"]["semanticNormalForm"]
        schema_record = next(record for record in value["manifest"]["files"] if record.get("path") == schema_binding["path"])
        contract_record = next(record for record in value["manifest"]["files"] if record.get("path") == contract_binding["path"])
        schema_record.update({"role": "contract", "mediaType": "application/json"})
        contract_record.update({"role": "contract-schema", "mediaType": "application/schema+json"})

    def exceed_total_bytes(value: dict[str, Any]) -> None:
        for number in range(9):
            license_id = f"Fixture-{number}"
            path = f"licenses/fixture-{number}.txt"
            value["manifest"]["licenseDocuments"].append({"licenseId": license_id, "path": path})
            value["manifest"]["files"].append({
                "path": path,
                "role": "license",
                "mediaType": "text/plain",
                "bytes": 1000000000,
                "sha256": f"{number + 1:064x}",
                "semanticBinding": {"kind": "license", "licenseId": license_id},
                "licenseExpression": "Apache-2.0",
                "provenanceClass": "skillpilot-authored",
                "redistributionStatus": "allowed",
            })

    def exceed_json_entry(value: dict[str, Any]) -> None:
        support = next(item for item in value["manifest"]["releaseSupport"] if item.get("supportType") == "redistribution-review")
        support["bytes"] = 67108865
        next(record for record in value["manifest"]["files"] if record.get("path") == support["path"])["bytes"] = 67108865

    def substitute_support_hash(value: dict[str, Any]) -> None:
        support = next(item for item in value["manifest"]["releaseSupport"] if item.get("supportType") == "json-contract-schema")
        support["sha256"] = "f" * 64
        next(record for record in value["manifest"]["files"] if record.get("path") == support["path"])["sha256"] = "f" * 64

    def substitute_support_id(value: dict[str, Any]) -> None:
        support = next(item for item in value["manifest"]["releaseSupport"] if item.get("supportType") == "json-contract-schema")
        support["supportId"] = "attacker-schema"
        next(record for record in value["manifest"]["files"] if record.get("path") == support["path"])["semanticBinding"]["supportId"] = "attacker-schema"

    def exceed_bundle(value: dict[str, Any]) -> None:
        value["manifest"]["rdfBundle"]["bytes"] = 1000000001
        file_for(value, "rdf-bundle")["bytes"] = 1000000001

    def substitute_contract(value: dict[str, Any], name: str, digest: str = "f" * 64) -> None:
        binding = value["manifest"]["contractBindings"][name]
        binding["sha256"] = digest
        next(record for record in value["manifest"]["files"] if record.get("path") == binding["path"])["sha256"] = digest

    def substitute_package_profile(value: dict[str, Any]) -> None:
        substitute_contract(value, "packageProfile")
        value["validationReport"]["package"]["packageProfile"]["sha256"] = "f" * 64

    def substitute_schema_catalog(value: dict[str, Any]) -> None:
        value["manifest"]["schemaCatalog"]["sha256"] = "f" * 64
        file_for(value, "schema-catalog")["sha256"] = "f" * 64
        value["validationReport"]["package"]["schemaCatalog"]["sha256"] = "f" * 64

    def substitute_source_contract(value: dict[str, Any], name: str) -> None:
        substitute_contract(value, name)
        value["manifest"]["sourceJsonPackage"]["semanticContracts"][name]["sha256"] = "f" * 64
        value["validationReport"]["package"]["sourceJsonPackage"]["semanticContracts"][name]["sha256"] = "f" * 64
        if name in {"fieldSemanticsRegistry", "definitionDigestProfile"}:
            value["validationReport"]["package"][name]["sha256"] = "f" * 64

    def substitute_source_archive(value: dict[str, Any]) -> None:
        value["manifest"]["sourceJsonPackage"]["sha256"] = "f" * 64
        value["validationReport"]["package"]["sourceJsonPackage"]["sha256"] = "f" * 64

    def substitute_curriculum_edition(value: dict[str, Any]) -> None:
        value["manifest"]["curriculumEdition"] = "attacker-edition"
        value["manifest"]["sourceJsonPackage"]["curriculumEdition"] = "attacker-edition"
        value["validationReport"]["package"]["sourceJsonPackage"]["curriculumEdition"] = "attacker-edition"

    def substitute_source_release_profile_record(value: dict[str, Any]) -> None:
        record = next(
            item
            for item in value["sourceJsonValidation"]["manifest"]["files"]
            if item.get("path") == "schemas/profiles/full-standalone-v1.profile.json"
        )
        record["sha256"] = "f" * 64

    case("profile-closed", "PROFILE_SCHEMA", lambda value: value["profile"].update({"surprise": True}))
    case("profile-role-order", "PROFILE_ROLE_POLICY", lambda value: value["profile"]["roles"].reverse())
    case("profile-gate-vocabulary", "PROFILE_GATE_VOCABULARY", lambda value: value["profile"]["validationGates"].pop())
    case("profile-zip64", "PROFILE_SCHEMA", lambda value: value["profile"]["securityPolicy"].update({"zip64Allowed": True}))
    case("profile-encryption", "PROFILE_SCHEMA", lambda value: value["profile"]["securityPolicy"].update({"encryptedEntriesAllowed": True}))
    case("profile-extra-fields", "PROFILE_SCHEMA", lambda value: value["profile"]["securityPolicy"].update({"extraFieldsAllowed": True}))
    case("profile-header-mismatch", "PROFILE_SCHEMA", lambda value: value["profile"]["securityPolicy"].update({"localCentralHeaderMismatchAllowed": True}))
    case("profile-json-policy", "PROFILE_SCHEMA", lambda value: value["profile"]["jsonPolicy"].update({"duplicateObjectKeys": "allow"}))
    case("profile-checksum-policy", "PROFILE_SCHEMA", lambda value: value["profile"]["checksumPolicy"].update({"selfEntryAllowed": True}))
    case("profile-declaration-policy", "PROFILE_SCHEMA", lambda value: value["profile"]["declarationPolicy"].update({"undeclaredEntitiesAllowed": True}))
    case("profile-application-vocabulary-substitution", "PROFILE_DECLARATION_POLICY", lambda value: value["profile"]["declarationPolicy"]["applicationOntologyVocabulary"]["classes"].__setitem__(0, "https://skillpilot.de/ns/roundtrip#AttackerClass"))
    case("profile-parser-bootstrap-kind", "PROFILE_SCHEMA", lambda value: value["profile"]["declarationPolicy"]["parserBootstrapProperties"]["objectProperties"].__setitem__(0, "https://w3id.org/lehrplan/ontology/LP_0000344"))
    case("profile-declaration-count", "PROFILE_SCHEMA", lambda value: value["profile"]["declarationPolicy"].update({"expectedDeclarationTripleCount": 524}))
    case("profile-core-projection", "PROFILE_SCHEMA", lambda value: value["profile"]["coreProjectionPolicy"].update({"additionalTitleProjectionAuthoritativeForReverse": True}))
    case("profile-fallback-area", "PROFILE_CORE_PROJECTION", lambda value: value["profile"]["coreProjectionPolicy"]["unscopedAtomicAreaPolicy"].update({"authoritativeForReverse": True}))
    case("profile-schema-catalog", "PROFILE_SCHEMA", lambda value: value["profile"]["schemaCatalogPolicy"].update({"remoteResolutionAllowed": True}))
    case("profile-json-entry-limit", "PROFILE_SCHEMA", lambda value: value["profile"]["archiveLimits"].update({"jsonEntryBytes": 67108865}))
    case("profile-json-depth-limit", "PROFILE_SCHEMA", lambda value: value["profile"]["archiveLimits"].update({"jsonMaxDepth": 129}))
    case("profile-json-node-limit", "PROFILE_SCHEMA", lambda value: value["profile"]["archiveLimits"].update({"jsonMaxNodes": 5000001}))
    case("profile-core-trust-hash", "PROFILE_CORE_POLICY", lambda value: value["profile"]["coreBindingPolicy"].update({"sha256": "f" * 64}))
    case("profile-application-ontology", "PROFILE_APPLICATION_ONTOLOGY_POLICY", lambda value: value["profile"]["applicationProfilePolicy"].update({"ontologyIri": "https://attacker.invalid/profile.owl"}))
    case("profile-application-hash", "PROFILE_APPLICATION_ONTOLOGY_POLICY", lambda value: value["profile"]["applicationProfilePolicy"].update({"sha256": "f" * 64}))
    case("profile-shapes-hash", "PROFILE_SHAPES_POLICY", lambda value: value["profile"]["shapesPolicy"].update({"sha256": "f" * 64}))
    case("profile-semantic-content", "PROFILE_SEMANTIC_CONTENT_POLICY", lambda value: value["profile"]["semanticContentPolicy"].update({"requireDigestRecomputation": False}))
    case("profile-release-support", "PROFILE_RELEASE_SUPPORT_POLICY", lambda value: value["profile"]["releaseSupportPolicy"].update({"jsonContractSchemaCount": 21}))
    case("manifest-closed", "MANIFEST_SCHEMA", lambda value: value["manifest"].update({"surprise": True}))
    case("manifest-duplicate-path", "MANIFEST_DUPLICATE_PATH", lambda value: value["manifest"]["files"].append(copy.deepcopy(value["manifest"]["files"][0])))
    case("manifest-casefold-prefix", "MANIFEST_PORTABLE_PATH_COLLISION", lambda value: (value["manifest"]["files"][0].update({"path": "Foo"}), value["manifest"]["files"][1].update({"path": "foo/bar"})))
    case("manifest-excluded-path", "MANIFEST_INVENTORY", lambda value: value["manifest"]["files"][0].update({"path": "metadata/manifest.json"}))
    case("manifest-excluded-prefix", "MANIFEST_PORTABLE_PATH_COLLISION", lambda value: value["manifest"]["files"][0].update({"path": "metadata"}))
    case("manifest-excluded-casefold", "MANIFEST_PORTABLE_PATH_COLLISION", lambda value: value["manifest"]["files"][0].update({"path": "Metadata/MANIFEST.json"}))
    case("manifest-reserved-root", "MANIFEST_PORTABLE_ROOT", lambda value: (value["manifest"].update({"archiveRoot": "CON"}), value["validationReport"]["package"].update({"archiveRoot": "CON"})))
    case("manifest-full-entry-path", "MANIFEST_SECURITY_LIMIT", lambda value: (value["manifest"].update({"archiveRoot": "a" * 180}), value["validationReport"]["package"].update({"archiveRoot": "a" * 180})))
    case("manifest-segment-order", "MANIFEST_SEGMENT_ORDER", lambda value: value["manifest"]["rdfSegments"].reverse())
    case("manifest-segment-binding", "MANIFEST_SEGMENT_BINDING", lambda value: value["manifest"]["files"][0].update({"sha256": "f" * 64}))
    case("manifest-bundle-distinction", "MANIFEST_BUNDLE_DISTINCTION", lambda value: value["manifest"]["rdfBundle"].update({"bytes": 81}))
    case("manifest-core-binding", "MANIFEST_CORE_BINDING", lambda value: value["manifest"]["fwuCore"].update({"sha256": "f" * 64}))
    case("manifest-core-provenance", "MANIFEST_CORE_PROVENANCE", relabel_core)
    case("manifest-core-media-type", "MANIFEST_SCHEMA", lambda value: value["manifest"]["fwuCore"].update({"mediaType": "application/rdf+xml"}))
    case("manifest-profile-binding", "MANIFEST_ONTOLOGY_PROFILE_BINDING", lambda value: value["manifest"]["applicationProfile"].update({"sha256": "f" * 64}))
    case("manifest-shapes-identity", "MANIFEST_SHAPES_IDENTITY", lambda value: value["manifest"]["shapes"].update({"sha256": "f" * 64}))
    case("manifest-registry-binding", "MANIFEST_REGISTRY_BINDING", lambda value: value["manifest"]["contractBindings"]["fieldSemanticsRegistry"].update({"id": "attacker"}))
    case("manifest-role-policy", "MANIFEST_ROLE_POLICY", lambda value: file_for(value, "binary-resource").update({"mediaType": "application/octet-stream"}))
    case("manifest-contract-role-swap", "MANIFEST_CONTRACT_BINDING", swap_contract_roles)
    case("manifest-sidecar-limit", "MANIFEST_SECURITY_LIMIT", lambda value: file_for(value, "binary-resource").update({"bytes": 67108865}))
    case("manifest-sidecar-reference-mismatch", "MANIFEST_SIDECAR_BINDING", lambda value: file_for(value, "binary-resource")["semanticBinding"].update({"publicReference": "/assets/goal-visualizations/goal-1/other.png"}))
    case("manifest-sidecar-scheme-relative", "MANIFEST_SCHEMA", lambda value: file_for(value, "binary-resource")["semanticBinding"].update({"publicReference": "//evil.example/image.png"}))
    case("manifest-prohibited-file", "MANIFEST_LICENSE_POLICY", prohibit_binary)
    case("manifest-total-size", "MANIFEST_SECURITY_LIMIT", exceed_total_bytes)
    case("manifest-json-entry-size", "MANIFEST_SECURITY_LIMIT", exceed_json_entry)
    case("manifest-bundle-size", "MANIFEST_SECURITY_LIMIT", exceed_bundle)
    case("manifest-source-binding", "MANIFEST_SOURCE_JSON_BINDING", lambda value: value["manifest"]["sourceJsonPackage"].update({"contentDigest": "sha256:" + "0" * 64}))
    case("manifest-source-runtime", "MANIFEST_SOURCE_JSON_BINDING", lambda value: value["manifest"]["sourceJsonPackage"].update({"supportedSkillpilotSoftware": ">=1.1.0 <2.0.0"}))
    case("manifest-source-release-profile", "MANIFEST_SOURCE_JSON_BINDING", lambda value: value["manifest"]["sourceJsonPackage"]["releaseProfileBinding"].update({"sha256": "f" * 64}))
    case("manifest-forged-content-digest", "MANIFEST_CONTENT_DIGEST", forge_content_digest)
    case("manifest-empty-rdf", "MANIFEST_RDF_NONEMPTY", set_empty_rdf)
    case("manifest-application-identity", "MANIFEST_APPLICATION_ONTOLOGY_IDENTITY", lambda value: value["manifest"]["applicationProfile"].update({"ontologyIri": "https://attacker.invalid/profile.owl"}))
    case("manifest-contract-id", "MANIFEST_CONTRACT_ID", lambda value: value["manifest"]["contractBindings"]["manifestSchema"].update({"id": "https://attacker.invalid/schema.json"}))
    case("manifest-bootstrap-schema-substitution", "MANIFEST_TRUST_ROOT_BINDING", lambda value: substitute_contract(value, "manifestSchema"))
    case("manifest-profile-schema-substitution", "MANIFEST_TRUST_ROOT_BINDING", lambda value: substitute_contract(value, "packageProfileSchema"))
    case("manifest-report-schema-substitution", "MANIFEST_TRUST_ROOT_BINDING", lambda value: substitute_contract(value, "validationReportSchema"))
    case("manifest-package-profile-substitution", "MANIFEST_PACKAGE_PROFILE_TRUST", substitute_package_profile)
    case("manifest-schema-catalog-substitution", "MANIFEST_SCHEMA_CATALOG", substitute_schema_catalog)
    case("manifest-global-contract-substitution", "MANIFEST_TRUST_ROOT_BINDING", lambda value: substitute_source_contract(value, "semanticNormalForm"))
    case("manifest-subject-contract-substitution", "MANIFEST_EXTERNAL_SOURCE_JSON", lambda value: substitute_source_contract(value, "curriculumOntologyProfile"))
    case("manifest-external-source-archive-substitution", "MANIFEST_EXTERNAL_SOURCE_JSON", substitute_source_archive)
    case("manifest-curriculum-edition-substitution", "MANIFEST_EXTERNAL_SOURCE_JSON", substitute_curriculum_edition)
    case("manifest-source-release-profile-record-substitution", "MANIFEST_EXTERNAL_SOURCE_JSON", substitute_source_release_profile_record)
    case("manifest-semantic-contract-hash", "MANIFEST_SEMANTIC_CONTRACT_BINDING", bind_source_hash_mismatch)
    case("manifest-semantic-index-record", "MANIFEST_SEMANTIC_CONTENT_INDEX", lambda value: value["manifest"]["semanticContentIndex"].update({"sha256": "f" * 64}))
    case("manifest-field-registry-count", "MANIFEST_FIELD_REGISTRY_COVERAGE", lambda value: value["manifest"]["semanticContentIndex"].update({"fieldRegistryEntryCount": 453}))
    case("manifest-release-support-missing", "MANIFEST_RELEASE_SUPPORT", remove_release_support)
    case("manifest-release-support-duplicate-target", "MANIFEST_RELEASE_SUPPORT", duplicate_support_target)
    case("manifest-release-support-duplicate-id", "MANIFEST_RELEASE_SUPPORT", lambda value: value["manifest"]["releaseSupport"][1].update({"supportId": value["manifest"]["releaseSupport"][0]["supportId"]}))
    case("manifest-release-support-hash-substitution", "MANIFEST_RELEASE_SUPPORT_TRUST", substitute_support_hash)
    case("manifest-release-support-id-substitution", "MANIFEST_RELEASE_SUPPORT_TRUST", substitute_support_id)
    case("manifest-hidden-logical-json", "MANIFEST_HIDDEN_LOGICAL_JSON", hide_logical_json)
    case("manifest-unresolved-license", "MANIFEST_LICENSE_POLICY", lambda value: file_for(value, "binary-resource").update({"licenseExpression": "MIT"}))
    case("manifest-definition-binding-missing", "MANIFEST_SCHEMA", lambda value: value["manifest"]["contractBindings"].pop("definitionDigestProfile"))
    case("report-closed", "VALIDATIONREPORT_SCHEMA", lambda value: value["validationReport"].update({"surprise": True}))
    case("report-gate-vocabulary", "REPORT_GATE_VOCABULARY", lambda value: value["validationReport"]["gates"].reverse())
    case("report-valid-gate", "REPORT_VALID_GATE", lambda value: value["validationReport"]["gates"][0].update({"status": "failed"}))
    case("report-core-binding", "REPORT_CORE_BINDING", lambda value: value["validationReport"]["package"]["fwuCore"].update({"sha256": "f" * 64}))
    case("report-source-json-binding", "REPORT_SOURCE_JSON_BINDING", lambda value: value["validationReport"]["package"]["sourceJsonPackage"].update({"sha256": "f" * 64}))
    case("report-counts", "REPORT_COUNTS", lambda value: value["validationReport"]["counts"].update({"binaryResources": 0}))
    case("report-shacl", "REPORT_ONTOLOGY_EVIDENCE", lambda value: value["validationReport"]["ontologyEvidence"]["shacl"].update({"violationCount": 1}))
    case("report-shacl-warning", "REPORT_ONTOLOGY_EVIDENCE", lambda value: value["validationReport"]["ontologyEvidence"]["shacl"].update({"warningCount": 1}))
    case("report-evidence-path-reuse", "REPORT_ONTOLOGY_EVIDENCE", lambda value: value["validationReport"]["ontologyEvidence"]["shacl"].update({"report": value["validationReport"]["ontologyEvidence"]["rdfSyntax"]["report"]}))
    case("report-reasoner", "REPORT_ONTOLOGY_EVIDENCE", lambda value: value["validationReport"]["ontologyEvidence"]["reasoner"].update({"consistent": False}))
    case("report-reproducibility", "REPORT_REPRODUCIBILITY", lambda value: value["validationReport"]["reproducibility"]["runB"].update({"zipSha256": "f" * 64}))
    case("report-valid-null-package", "VALIDATIONREPORT_SCHEMA", lambda value: value["validationReport"].update({"package": None}))
    case("report-valid-wrong-suffix", "VALIDATIONREPORT_SCHEMA", lambda value: value["validationReport"]["input"].update({"file": "package.zip"}))
    case("report-valid-zero-bytes", "VALIDATIONREPORT_SCHEMA", lambda value: value["validationReport"]["input"].update({"bytes": 0}))
    case("report-valid-null-sha256", "VALIDATIONREPORT_SCHEMA", lambda value: value["validationReport"]["input"].update({"sha256": None}))
    case("report-invalid-without-failure", "VALIDATIONREPORT_SCHEMA", lambda value: value["validationReport"].update({"status": "invalid", "diagnostics": [{"code": "TEST_FAILURE", "path": "/", "message": "Failed validation"}]}))
    case("report-error-without-not-evaluated", "VALIDATIONREPORT_SCHEMA", lambda value: value["validationReport"].update({"status": "error", "diagnostics": [{"code": "TEST_ERROR", "path": "/", "message": "Validator error"}]}))

    for name, expected, mutation in cases:
        candidate = copy.deepcopy(fixture)
        mutation(candidate)
        codes = {diagnostic.code for diagnostic in validate_contract(candidate, schemas)}
        if expected not in codes:
            raise AssertionError(f"{name}: expected {expected}, got {sorted(codes)}")
        if verbose:
            print(f"PASS mutation {name}: {expected}")
    return len(cases)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()
    try:
        installed = distribution_version("jsonschema")
    except PackageNotFoundError as error:
        raise SystemExit("jsonschema is not installed") from error
    if installed != JSONSCHEMA_VERSION:
        raise SystemExit(f"jsonschema=={JSONSCHEMA_VERSION} required, found {installed}")

    schemas = {name: load_json(path) for name, path in SCHEMAS.items()}
    for name, schema in schemas.items():
        Draft202012Validator.check_schema(schema)
        if args.verbose:
            print(f"PASS schema {name}")
    trust_diagnostics = validate_static_trust_roots()
    if trust_diagnostics:
        for diagnostic in trust_diagnostics:
            print(f"FAIL {diagnostic.code} {diagnostic.path}: {diagnostic.message}", file=sys.stderr)
        return 1
    fixture = load_json(FIXTURE_PATH)
    production_profile = load_json(PROFILE_PATH)
    profile_schema_diagnostics = schema_diagnostics(
        "profile", schemas["profile"], production_profile
    )
    if profile_schema_diagnostics:
        for diagnostic in profile_schema_diagnostics:
            print(
                f"FAIL {diagnostic.code} {diagnostic.path}: {diagnostic.message}",
                file=sys.stderr,
            )
        return 1
    if fixture.get("profile") != production_profile:
        print(
            "FAIL PROFILE_FIXTURE_DRIFT /profile: fixture and production profile differ",
            file=sys.stderr,
        )
        return 1
    diagnostics = validate_contract(fixture, schemas)
    if diagnostics:
        for diagnostic in diagnostics:
            print(f"FAIL {diagnostic.code} {diagnostic.path}: {diagnostic.message}", file=sys.stderr)
        return 1
    for status, file_name, input_bytes in (
        ("invalid", "empty.zip", 0),
        ("error", "oversized-input.bin", 3500000001),
    ):
        status_fixture = nonvalid_status_fixture(fixture, status)
        status_fixture["validationReport"]["input"].update({
            "file": file_name,
            "bytes": input_bytes,
        })
        status_diagnostics = validate_contract(status_fixture, schemas)
        if status_diagnostics:
            for diagnostic in status_diagnostics:
                print(f"FAIL {status} receipt {diagnostic.code} {diagnostic.path}: {diagnostic.message}", file=sys.stderr)
            return 1
    print("FWU-OWL package contracts: 1 valid fixture and 2 non-valid status receipts passed")
    mutation_count = run_mutations(fixture, schemas, args.verbose)
    try:
        loads_strict('{"duplicate":1,"duplicate":2}')
        raise AssertionError("duplicate JSON keys were accepted")
    except ValueError:
        pass
    try:
        loads_strict('{"value":NaN}')
        raise AssertionError("non-finite JSON number was accepted")
    except ValueError:
        pass
    print(f"FWU-OWL package contracts: {mutation_count} fail-closed mutations and 2 raw-JSON cases passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
