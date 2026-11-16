#!/usr/bin/env python3
"""Bounded native tests for original required task materials; no large asset copy."""
from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path
from types import SimpleNamespace
import unittest

from jsonschema import Draft202012Validator

from curriculum_assessment_materials import validate_static_assessment_svg
import curriculum_package_v13_contracts as contracts
import validate_curriculum_runtime_catalog_contract as runtime_catalog_contracts
import validate_curriculum_schema_catalog_contract as schema_catalog_contracts
from validate_full_standalone_curriculum_package import (
    DiagnosticCollector, PackageDocuments, REDISTRIBUTION_REVIEW_PATH,
    load_trusted_context, required_assessment_materials,
    validate_deterministic_render_provenance, ValidationFailure,
)

ROOT = Path(__file__).resolve().parents[1]
PROFILE = ROOT / "contracts/curriculum-package/v1.3/profiles/de-gymnasium-mathematik-release-model-v1.3.profile.json"


class AssessmentMaterialsV13(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.profile = json.loads(PROFILE.read_text())
        cls.bindings = cls.profile["resources"]["assessmentMaterials"]
        cls.source = json.loads((ROOT / cls.profile["canonicalLandscape"]["sourcePath"]).read_text())
        cls.uses = contracts.task_material_uses(cls.source["goals"])

    def test_all_original_payloads_and_source_evidence_are_unchanged(self):
        self.assertEqual(len(self.bindings), 28)
        self.assertEqual(len(self.uses), 31)
        self.assertEqual({item["url"] for item in self.bindings}, {use["url"] for use in self.uses})
        for item in self.bindings:
            payload = (ROOT / "app/public" / item["url"].lstrip("/")).read_bytes()
            self.assertEqual(len(payload), item["bytes"])
            self.assertEqual(hashlib.sha256(payload).hexdigest(), item["sha256"])
            self.assertEqual(hashlib.sha256((ROOT / item["sourceArtifactPath"]).read_bytes()).hexdigest(), item["sourceArtifactSha256"])
            if item["mediaType"] == "image/svg+xml":
                validate_static_assessment_svg(payload)
            else:
                self.assertEqual(payload[:8], b"\x89PNG\r\n\x1a\n")

    def test_static_svg_rejects_active_external_and_foreign_payloads(self):
        fragments = [
            '<script>alert(1)</script>', '<foreignObject/>', '<handler/>', '<animate attributeName="href" to="https://evil.test"/>',
            '<rect onload="alert(1)"/>', '<use href="https://evil.test/p.svg#x"/>',
            '<use href="data:image/svg+xml,poison"/>', '<rect style="fill:url(https://evil.test/x)"/>',
            '<rect fill="u\\72l(https://evil.test/x)"/>', '<rect filter="u\\72l(https://evil.test/x)"/>',
            '<style>@import "https://evil.test/x";</style>', '<style>rect {fill:image-set("https://evil.test/x")}</style>',
            '<metadata><meta xmlns="http://www.w3.org/1999/xhtml" http-equiv="refresh" content="0;https://evil.test"/></metadata>',
            '<RDF xmlns="http://www.w3.org/1999/02/22-rdf-syntax-ns#"/>', '<rect xml:base="https://evil.test"/>',
        ]
        for fragment in fragments:
            with self.subTest(fragment=fragment):
                with self.assertRaises(ValueError):
                    validate_static_assessment_svg(('<svg xmlns="http://www.w3.org/2000/svg">' + fragment + '</svg>').encode())
        for payload in [
            b'<!DOCTYPE svg [<!ENTITY p "poison">]><svg xmlns="http://www.w3.org/2000/svg">&p;</svg>',
            b'<?xml-stylesheet href="https://evil.test/s.css"?><svg xmlns="http://www.w3.org/2000/svg"/>',
            b'<svg xmlns="http://www.w3.org/2000/svg"><broken></svg>',
        ]:
            with self.subTest(payload=payload):
                with self.assertRaises(ValueError): validate_static_assessment_svg(payload)

    def test_unresolved_body_images_and_unreleased_task_uses_fail(self):
        goal = {"id": "test-goal", "examData": {"reviewStatus": "released", "taskContent": "Use /assets/assessment-materials/test/unresolved.webp"}}
        with self.assertRaises(ValueError): contracts.task_material_uses([goal])
        goal["examData"].update(reviewStatus="draft", taskContent="Use /assets/assessment-materials/test/image.svg")
        with self.assertRaises(ValueError): contracts.task_material_uses([goal])

    def test_required_media_schema_is_closed_and_legacy_stays_unchanged(self):
        validators = contracts.validators(ROOT)
        records = []
        for item in self.bindings:
            records.append({"resourceId": item["resourceId"], "landscapeId": self.source["landscapeId"],
                "ownerGoalId": item["ownerGoalId"], "order": item["order"], "resourceKind": "assessment-material",
                "resourceType": "image", "delivery": "embedded", "runtimeRequired": True,
                "artifactPath": item["url"][1:], "publicUrl": item["url"], "mediaType": item["mediaType"],
                "bytes": item["bytes"], "sha256": item["sha256"], "title": item["title"], "provider": item["provider"],
                "description": item["description"], "language": item["language"], "license": item["license"]})
        document = {"$schema": contracts.RESOURCE_SCHEMA_ID, "indexFormatVersion": "1.3", "resources": records}
        self.assertFalse(list(validators[contracts.RESOURCE_SCHEMA_ID].iter_errors(document)))
        legacy = json.loads((ROOT / "contracts/curriculum-package/v1/resource-index.schema.json").read_text())
        self.assertTrue(list(Draft202012Validator(legacy).iter_errors(document)))
        for field, value in [("runtimeRequired", False), ("delivery", "external"), ("mediaType", "text/html"),
                             ("publicUrl", "https://evil.test/asset.svg"),
                             ("publicUrl", "/assets/assessment-materials/../a.svg"),
                             ("publicUrl", "/assets/assessment-materials/./a.svg"), ("sha256", "changed")]:
            changed = copy.deepcopy(document)
            changed["resources"][0][field] = value
            with self.subTest(field=field):
                self.assertTrue(list(validators[contracts.RESOURCE_SCHEMA_ID].iter_errors(changed)))

    def test_runtime_material_roots_cannot_legalize_unused_missing_or_forged_assets(self):
        url = "/assets/assessment-materials/test/original.svg"
        goals = {name: {"id": name, "examData": {"reviewStatus": "released", "taskContent": "Use " + url}}
                 for name in ("a-task", "b-shared-task")}
        resource = {"resourceId": "actual-original", "ownerGoalId": "a-task", "publicUrl": url,
                    "artifactPath": url[1:], "resourceKind": "assessment-material", "delivery": "embedded", "runtimeRequired": True}
        self.assertEqual(required_assessment_materials(goals, [resource]), [resource])
        for records in [[], [resource, {**resource, "resourceId": "orphan", "publicUrl": "/assets/assessment-materials/test/unused.svg"}],
                        [{**resource, "ownerGoalId": "not-an-actual-task"}], [{**resource, "artifactPath": "assets/poison.svg"}],
                        [{**resource, "runtimeRequired": False}], [{**resource, "delivery": "external"}]]:
            with self.subTest(records=records):
                with self.assertRaises(ValidationFailure): required_assessment_materials(goals, records)

    def test_runtime_catalog_requires_both_v13_capabilities_and_preserves_legacy(self):
        legacy = json.loads((ROOT / "contracts/curriculum-package/v1/fixtures/runtime-catalog/valid/minimal-mathematik.catalog.json").read_text())
        validators = contracts.validators(ROOT)
        self.assertFalse(runtime_catalog_contracts.validate_catalog(legacy, validators[legacy["$schema"]]))
        current = copy.deepcopy(legacy)
        current.update({"$schema": contracts.CATALOG_SCHEMA_ID, "catalogVersion": "1.3",
                        "runtimeContractVersion": "1.3", "learningUnitReviews": []})
        current["capabilities"].extend(["learningUnitsV1", "assessmentMaterialsV1"])
        self.assertFalse(runtime_catalog_contracts.validate_catalog(current, validators[contracts.CATALOG_SCHEMA_ID]))
        for capability in ("learningUnitsV1", "assessmentMaterialsV1"):
            missing = copy.deepcopy(current)
            missing["capabilities"].remove(capability)
            self.assertTrue(runtime_catalog_contracts.validate_catalog(missing, validators[contracts.CATALOG_SCHEMA_ID]))
            forged_legacy = copy.deepcopy(legacy)
            forged_legacy["capabilities"].append(capability)
            self.assertTrue(runtime_catalog_contracts.validate_catalog(forged_legacy, validators[legacy["$schema"]]))

    def test_schema_catalog_pins_exact_v13_profile_version_and_schema_hash(self):
        trusted = load_trusted_context(ROOT / "contracts/curriculum-package/v1.3")
        entries = [{"id": key, "path": contracts.schema_package_path(key), "bytes": len(raw),
                    "sha256": hashlib.sha256(raw).hexdigest()} for key, raw in trusted.trusted_schema_bytes.items()]
        catalog = {"entries": entries}
        raw = json.dumps(catalog).encode()
        manifest = {"runtimeContractVersion": "1.3", "releaseProfile": contracts.PROFILE_ID,
            "files": [{"role": "schema", "path": entry["path"], "bytes": entry["bytes"], "sha256": entry["sha256"],
                       "mediaType": "application/schema+json", "runtimeRequired": True} for entry in entries],
            "contractBindings": {name: {"id": identifier, "path": contracts.schema_package_path(identifier), "sha256": digest}
                for name, (identifier, digest, _) in trusted.trusted_schema_metadata.items()}}
        manifest["files"].append({"role": "schema-catalog", "path": "schemas/catalog.json", "bytes": len(raw),
            "sha256": hashlib.sha256(raw).hexdigest(), "mediaType": "application/json", "runtimeRequired": True,
            "validationSchemaId": schema_catalog_contracts.CATALOG_SCHEMA_ID})
        self.assertFalse(schema_catalog_contracts.validate_catalog_against_manifest(catalog, raw, manifest, trusted.trusted_schema_bytes))
        for field, value in (("runtimeContractVersion", "1.2"), ("releaseProfile", "full-standalone-v1")):
            forged = copy.deepcopy(manifest)
            forged[field] = value
            self.assertTrue(schema_catalog_contracts.validate_catalog_against_manifest(catalog, raw, forged, trusted.trusted_schema_bytes))
        forged = copy.deepcopy(manifest)
        forged["contractBindings"]["runtimeCatalogSchema"]["sha256"] = "0" * 64
        self.assertTrue(schema_catalog_contracts.validate_catalog_against_manifest(catalog, raw, forged, trusted.trusted_schema_bytes))

    def test_material_manifest_projection_preserves_exact_asset_and_rights_bindings(self):
        binding = self.bindings[0]
        ledger = json.loads((ROOT / "curricula/DE/Gymnasium/quality/package-redistribution/de-gymnasium-mathematik-v1.3.review.json").read_text())
        decision = next(item for item in ledger["assetDecisions"] if item["resourceId"] == binding["resourceId"])
        resource = {**binding, "artifactPath": binding["url"][1:], "publicUrl": binding["url"],
                    "resourceKind": "assessment-material", "delivery": "embedded", "runtimeRequired": True}
        record = {"path": resource["artifactPath"], "bytes": binding["bytes"], "sha256": binding["sha256"],
                  "mediaType": binding["mediaType"], "provenanceClass": "skillpilot-authored",
                  "redistributionStatus": decision["redistributionStatus"], "licenseExpression": decision["licenseExpression"]}
        manifest = {"runtimeContractVersion": "1.3", "releaseProfile": contracts.PROFILE_ID, "contentDigest": ledger["contentDigest"]}

        def check(current_manifest, current_record, current_resource, current_decision):
            collector = DiagnosticCollector()
            documents = PackageDocuments(values={REDISTRIBUTION_REVIEW_PATH: {
                "contentDigest": ledger["contentDigest"], "assetDecisions": [current_decision]}})
            validate_deterministic_render_provenance(SimpleNamespace(manifest=current_manifest), documents,
                {binding["resourceId"]: current_record}, {binding["resourceId"]: current_resource},
                SimpleNamespace(resource_id="other-authorized-render"), collector)
            return collector.diagnostics

        self.assertFalse(check(manifest, record, resource, decision))
        cases = [(0, "runtimeContractVersion", "1.2"), (0, "releaseProfile", "full-standalone-v1"),
                 (2, "resourceKind", "goal-visualization"), (2, "provider", "Other author"),
                 (2, "runtimeRequired", False), (2, "ownerGoalId", "forged-owner"),
                 (2, "publicUrl", "/assets/assessment-materials/other.svg"),
                 (3, "assetSha256", "sha256:" + "0" * 64), (3, "provider", "Other author"),
                 (3, "redistributionStatus", "allowed"), (3, "licenseExpression", "Apache-2.0")]
        for position, field, value in cases:
            changed = copy.deepcopy([manifest, record, resource, decision])
            changed[position][field] = value
            with self.subTest(position=position, field=field):
                self.assertTrue(check(*changed))


if __name__ == "__main__":
    unittest.main(verbosity=2)
