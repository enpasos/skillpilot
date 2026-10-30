#!/usr/bin/env python3
"""Focused static completion package contracts, independent of learner results."""
from __future__ import annotations

import copy
import hashlib
import json
import tempfile
import unittest
from pathlib import Path

from jsonschema import ValidationError

import curriculum_completion_artifacts as completion
import curriculum_package_completion_contracts as contracts
import validate_curriculum_runtime_catalog_contract as catalog_contract
import validate_curriculum_schema_catalog_contract as schema_catalog_contract
import provision_curriculum_package as provisioner

REPO = Path(__file__).resolve().parents[1]


class CompletionPackageContractsTest(unittest.TestCase):
    def setUp(self) -> None:
        self.goals = {
            "ordinary": {"id": "ordinary", "contains": [], "requires": [], "title": "Ordinary"},
            "exam": {"id": "exam", "nodeKind": "exam", "contains": [], "requires": ["ordinary"],
                     "examData": {"taskContent": "Solve independently", "solutionContent": "Reviewed solution",
                                  "scoring": {"maxPoints": 10, "passingScore": 10}}},
        }
        self.scope = {"schemaVersion": 1, "id": "pilot", "revision": "1", "title": {"de": "Pilot", "en": "Pilot"},
                      "targetRootIds": ["ordinary", "exam"]}
        self.profile = {"schemaVersion": 1, "id": "pilot", "revision": "1", "title": {"de": "Pilot", "en": "Pilot"},
                        "levelScopeRef": "pilot", "protectedGoalIds": [],
                        "review": {"reference": "data/completion/reviews/pilot.json"},
                        "rules": [{"ruleId": "r1", "assessmentGoalIds": ["exam"], "waivableGoalIds": ["ordinary"],
                                   "rationale": "Reviewed assessment coverage", "reviewRef": "data/completion/reviews/pilot.json"}]}
        self.profile["review"].update(completion.review_bindings(self.profile, self.scope, self.goals))
        review_path = self.profile["review"]["reference"]
        content = "Reviewed static task and rubric."
        review = {"mediaType": "text/markdown", "content": content, "sha256": hashlib.sha256(content.encode()).hexdigest()}
        self.documents = [
            ("completion-profile", "pilot", "data/completion/profiles/pilot.json", self.wrap("profile", "pilot", self.profile)),
            ("completion-scope", "pilot", "data/completion/scopes/pilot.json", self.wrap("scope", "pilot", self.scope)),
            ("completion-rule-review", review_path, review_path, self.wrap("review", review_path, review)),
        ]
        self.validators = completion.validators(REPO)

    @staticmethod
    def wrap(kind: str, identity: str, definition: dict) -> dict:
        return {"artifactFormatVersion": 1, "artifactKind": kind, "id": identity, "definition": definition}

    def test_valid_documents_and_closed_result_free_schema(self) -> None:
        for _role, _identity, _path, wrapper in self.documents:
            self.validators[contracts.ARTIFACT_SCHEMA_ID].validate(wrapper)
        completion.validate_package_documents(self.documents, self.goals)
        for result_field in ["mastery", "passed", "qualifiedEvidence", "waived", "learnerId"]:
            with self.subTest(field=result_field):
                changed = copy.deepcopy(self.documents[0][3])
                changed["definition"][result_field] = True
                with self.assertRaises(ValidationError):
                    self.validators[contracts.ARTIFACT_SCHEMA_ID].validate(changed)

    def test_review_inputs_and_package_local_review_are_bound(self) -> None:
        for mutation in ["target", "task", "rubric"]:
            changed = copy.deepcopy(self.goals)
            if mutation == "target":
                changed["ordinary"]["title"] = "Changed semantics"
            else:
                data = changed["exam"]["examData"]
                if mutation == "task":
                    data["taskContent"] = "Changed task"
                else:
                    data["scoring"]["passingScore"] = 9
            with self.subTest(mutation=mutation), self.assertRaisesRegex(ValueError, "Stale packaged"):
                completion.validate_package_documents(self.documents, changed)
        with self.assertRaisesRegex(ValueError, "review is missing"):
            completion.validate_package_documents(self.documents[:2], self.goals)
        changed_documents = copy.deepcopy(self.documents)
        changed_documents[2][3]["definition"]["content"] += " changed"
        with self.assertRaisesRegex(ValueError, "content digest"):
            completion.validate_package_documents(changed_documents, self.goals)

    def test_scope_and_protected_reference_fail_closed(self) -> None:
        for mutation in ["scope", "assessment", "protected", "duplicate-rule", "waive-exam"]:
            profile, scope = copy.deepcopy(self.profile), copy.deepcopy(self.scope)
            if mutation == "scope":
                scope["targetRootIds"].append("missing")
            elif mutation == "assessment":
                profile["rules"][0]["assessmentGoalIds"] = ["ordinary"]
            elif mutation == "protected":
                profile["protectedGoalIds"] = ["ordinary"]
            elif mutation == "duplicate-rule":
                profile["rules"].append(copy.deepcopy(profile["rules"][0]))
            else:
                profile["rules"][0]["waivableGoalIds"] = ["exam"]
            with self.subTest(mutation=mutation), self.assertRaises(ValueError):
                completion.review_bindings(profile, scope, self.goals)

    def test_unrelated_waivers_and_expanded_prerequisite_cycles_are_rejected(self) -> None:
        unrelated = copy.deepcopy(self.goals)
        unrelated["exam"]["requires"] = []
        with self.assertRaisesRegex(ValueError, "not a strict assessment prerequisite"):
            completion.review_bindings(self.profile, self.scope, unrelated)
        cyclic = copy.deepcopy(self.goals)
        cyclic["ordinary"]["requires"] = ["exam"]
        with self.assertRaisesRegex(ValueError, "Cycle in expanded"):
            completion.review_bindings(self.profile, self.scope, cyclic)
        inherited = copy.deepcopy(self.goals)
        inherited["cluster"] = {"id": "cluster", "contains": ["exam"], "requires": ["ordinary"]}
        inherited["exam"]["requires"] = []
        completion.review_bindings(self.profile, self.scope, inherited)

    def test_normalization_verifies_source_review_before_portable_rebinding(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for relative in [
                "contracts/curriculum-package/v1/runtime-catalog.schema.json",
                "contracts/curriculum-package/v1.1/runtime-catalog.schema.json",
                "contracts/curriculum-package/v1.1/completion-artifact.schema.json",
                "contracts/assessment-completion/v1/profile.schema.json",
                "contracts/assessment-completion/v1/scope.schema.json",
            ]:
                destination = root / relative
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_bytes((REPO / relative).read_bytes())
            profile = copy.deepcopy(self.profile)
            profile["review"]["reference"] = "curricula/review.md"
            profile["rules"][0]["reviewRef"] = "curricula/review.md"
            files = {"curricula/profile.json": profile, "curricula/scope.json": self.scope}
            for relative, value in files.items():
                path = root / relative
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(json.dumps(value))
            (root / "curricula/review.md").write_text("Original curriculum review")
            source = {"goals": list(self.goals.values())}
            exported = copy.deepcopy(source)
            exported["goals"][0]["sourceRef"] = "metadata/provenance/portable.json"
            configuration = {"outputDirectory": "data/completion", "profiles": [
                {"profilePath": "curricula/profile.json", "scopePath": "curricula/scope.json"}]}
            documents, inputs = completion.compile_documents(root, configuration, source, exported)
            completion.validate_package_documents(documents, {g["id"]: g for g in exported["goals"]})
            self.assertEqual(3, len(inputs))
            portable = next(d[3]["definition"] for d in documents if d[0] == "completion-profile")
            self.assertNotEqual(profile["review"]["scopeRevision"], portable["review"]["scopeRevision"])
            review = next(d[3]["definition"]["content"] for d in documents if d[0] == "completion-rule-review")
            self.assertIn(profile["review"]["scopeRevision"], review)
            self.assertIn(portable["review"]["scopeRevision"], review)
            source["goals"][0]["title"] = "Unreviewed author change"
            with self.assertRaisesRegex(ValueError, "Stale source"):
                completion.compile_documents(root, configuration, source, exported)

    def test_completion_schemas_use_the_existing_canonical_namespace(self) -> None:
        for schema_id in [contracts.PROFILE_SCHEMA_ID, contracts.SCOPE_SCHEMA_ID]:
            self.assertTrue(schema_catalog_contract.schema_id_is_canonical(schema_id))
            for untrusted in [schema_id + "?query", schema_id + "#fragment", schema_id.replace("https://", "http://")]:
                self.assertFalse(schema_catalog_contract.schema_id_is_canonical(untrusted))
        arbitrary = "https://skillpilot.com/contracts/assessment-completion/v1/profile.schema.json"
        self.assertFalse(schema_catalog_contract.schema_id_is_canonical(arbitrary))

    def test_provisioner_contract_selection_is_explicit_and_software_pinned(self) -> None:
        self.assertEqual("full-standalone-v1", provisioner.load_profile()["profileId"])
        completion_root = REPO / "contracts/curriculum-package/v1.1"
        self.assertEqual(contracts.PROFILE_ID, provisioner.load_profile(completion_root)["profileId"])
        args = provisioner.parse_args(["install", "--store", "/tmp/unused-store", "--zip", "/tmp/unused.zip", "--contracts-dir", str(completion_root)])
        self.assertEqual(completion_root, args.contracts_dir)
        with tempfile.TemporaryDirectory() as temporary, self.assertRaisesRegex(provisioner.TrustFailure, "software-pinned"):
            provisioner.load_profile(Path(temporary))

    def test_portable_target_sets_are_canonical_without_mutating_authoring_or_ordered_arrays(self) -> None:
        import validate_curriculum_release_model as release_validator
        registry = release_validator.FieldRegistry(json.loads((REPO / "contracts/curriculum-package/v1.1/profiles/skillpilot-fwu-field-semantics-completion-v1.registry.json").read_bytes()))
        normalizer = release_validator.Normalizer(registry)
        source = {"goals": copy.deepcopy(list(self.goals.values()))}
        source["goals"][0]["tags"] = ["z", "a"]
        source["goals"][1]["tags"] = ["b", "a"]
        source["goals"][1]["examData"]["scoring"]["steps"] = [
            {"id": "second", "points": 5, "description": "Second"},
            {"id": "first", "points": 5, "description": "First"}]
        source["goals"].append({"id": "outside", "contains": [], "requires": [], "tags": ["z", "a"]})
        exported = copy.deepcopy(source)
        exported["goals"][0]["sourceRef"] = "metadata/provenance/portable.json"
        original_source, original_export = copy.deepcopy(source), copy.deepcopy(exported)
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "curricula").mkdir()
            entries = []
            for suffix in ["one", "two"]:
                profile, scope = copy.deepcopy(self.profile), copy.deepcopy(self.scope)
                profile["id"] = suffix
                profile["levelScopeRef"] = scope["id"] = suffix
                profile["review"].update(completion.review_bindings(profile, scope, {g["id"]: g for g in source["goals"]}))
                for name, value in [("profile", profile), ("scope", scope)]:
                    (root / "curricula" / f"{name}-{suffix}.json").write_text(json.dumps(value))
                entries.append({"profilePath": f"curricula/profile-{suffix}.json", "scopePath": f"curricula/scope-{suffix}.json"})
            configuration = {"profiles": entries, "outputDirectory": "data/completion"}
            normalized = completion.canonicalize_exported_target_sets(root, configuration, source, exported,
                    normalizer, release_validator.canonical_json_bytes)
            self.assertEqual(["a", "z"], normalized["goals"][0]["tags"])
            self.assertEqual(["a", "b"], normalized["goals"][1]["tags"])
            self.assertEqual(original_export["goals"][1]["examData"]["scoring"]["steps"], normalized["goals"][1]["examData"]["scoring"]["steps"])
            self.assertEqual(original_export["goals"][0]["sourceRef"], normalized["goals"][0]["sourceRef"])
            self.assertEqual(original_export["goals"][2], normalized["goals"][2])
            self.assertEqual(original_source, source)
            self.assertEqual(original_export, exported)
            self.assertEqual(normalized, completion.canonicalize_exported_target_sets(root, configuration, source,
                    normalized, normalizer, release_validator.canonical_json_bytes))
            source["goals"][0]["title"] = "Unreviewed source modification"
            with self.assertRaisesRegex(ValueError, "Stale source"):
                completion.canonicalize_exported_target_sets(root, configuration, source, exported,
                        normalizer, release_validator.canonical_json_bytes)

    def test_runtime_discovery_and_manifest_inventory_match_exactly(self) -> None:
        base = json.loads((REPO / "contracts/curriculum-package/v1/fixtures/runtime-catalog/valid/minimal-mathematik.catalog.json").read_bytes())
        base.update({"$schema": contracts.CATALOG_SCHEMA_ID, "catalogVersion": "1.1", "runtimeContractVersion": "1.1"})
        base["capabilities"].append(contracts.CAPABILITY)
        base["completionArtifacts"] = [{"id": identity, "kind": wrapper["artifactKind"], "artifactPath": path}
                                      for _role, identity, path, wrapper in self.documents]
        self.validators[contracts.CATALOG_SCHEMA_ID].validate(base)
        manifest = {"runtimeContractVersion": "1.1", **base["releaseBinding"], "files": []}
        baseline_diagnostics = catalog_contract.validate_catalog_against_manifest(base, manifest)
        missing_completion_roles = {d.location for d in baseline_diagnostics if d.code == "MANIFEST_ROLE_PATH_MISMATCH"}
        self.assertTrue({"/files/completion-profile", "/files/completion-scope", "/files/completion-rule-review"}.issubset(missing_completion_roles))
        manifest["files"] = [{"role": role, "path": path} for role, _identity, path, _wrapper in self.documents]
        diagnostics = catalog_contract.validate_catalog_against_manifest(base, manifest)
        self.assertFalse(any(d.location.startswith("/files/completion-") for d in diagnostics))
        changed = copy.deepcopy(base)
        changed["completionArtifacts"].append(copy.deepcopy(changed["completionArtifacts"][0]))
        self.assertTrue(any(d.code == "DUPLICATE_COMPLETION_ID" for d in catalog_contract.validate_catalog(changed, self.validators[contracts.CATALOG_SCHEMA_ID])))


if __name__ == "__main__":
    unittest.main()
