#!/usr/bin/env python3
"""Transport source-view 1.2 through evolving DPK 1.3; older formats reject it."""
from __future__ import annotations

import copy
import json
from pathlib import Path
import subprocess
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

from jsonschema import Draft202012Validator

from legacy_composition_view import assert_supported_composition_view

import generate_physics_partial_orders as physics_orders
import normalize_mathematics_stage_views as math_views
import compile_curriculum_release_model as compiler
import validate_curriculum_release_model as independent
import curriculum_package_v13_contracts as v13
import generate_curriculum_package_v13_contracts as generator
import reconstruct_json_curriculum_package_from_fwu_owl as reverse
import validate_full_standalone_curriculum_package as offline

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = json.loads((ROOT / "contracts/curriculum-package/v1/composition-view.schema.json").read_text())
VIEW_SCHEMA_12 = "https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json"


class CompositionViewPackageBoundary(unittest.TestCase):
    def setUp(self):
        self.old = {
            "viewId": "test-view", "landscapeId": "test-landscape", "scope": {"schoolForm": "Gymnasium"},
            "rootNodes": [{"kind": "structure", "id": "parent", "label": "Parent", "children": [
                {"kind": "structure", "id": "a", "label": "A", "children": [{"kind": "goalEntry", "goalId": "atom-a"}]},
                {"kind": "structure", "id": "b", "label": "B", "children": [{"kind": "goalEntry", "goalId": "atom-b"}]},
            ]}],
        }
        self.validator = Draft202012Validator(SCHEMA)
        self.partial_validator = Draft202012Validator(json.loads((ROOT / v13.VIEW_SCHEMA_PATH).read_text()))
        self.source_validator = Draft202012Validator(json.loads((ROOT / v13.SOURCE_VIEW_SCHEMA_PATH).read_text()))

    def both(self, value, *, partial=False):
        return (compiler.compile_composition_view(value, "de", "test-view", allow_partial_order=partial),
                independent.expected_composition_view(value, "de", self.validator, "test-view",
                    partial_order_validator=self.partial_validator if partial else None))

    def assert_rejected(self, value, pattern):
        with self.assertRaisesRegex(compiler.CompilationError, pattern):
            compiler.compile_composition_view(value, "de", "test-view")
        with self.assertRaisesRegex(independent.ValidationError, pattern):
            independent.expected_composition_view(value, "de", self.validator, "test-view")

    def test_legacy_authoring_refuses_extension_inputs_and_existing_outputs(self):
        path = ROOT / "contracts/composition-view/v1.3/examples/extensions/neutral.view.json"
        extension = json.loads(path.read_text())
        downgraded = copy.deepcopy(extension)
        for field in ("$schema", "electionGroups", "viewFormatVersion"):
            del downgraded[field]
        with self.assertRaisesRegex(ValueError, "composition view format 1.3 is unsupported"):
            assert_supported_composition_view(downgraded)
        with self.assertRaisesRegex(ValueError, "composition view format 1.3 is unsupported"):
            assert_supported_composition_view({**downgraded, "viewFormatVersion": "1.2"})
        flow = json.loads((path.parent / "root.json").read_text())
        self.assertTrue(reverse.has_unsupported_personalization_flow(flow))
        flow["personalizationFlow"]["version"] = "1"
        self.assertTrue(reverse.has_unsupported_personalization_flow(flow))
        self.assertFalse(reverse.has_unsupported_personalization_flow({"personalizationFlow": {"version": "1"}}))
        legacy = {**self.old, "$schema": VIEW_SCHEMA_12, "viewFormatVersion": "1.2"}
        self.assertEqual(physics_orders.contextual_targets(
            legacy, {}, set(), lambda _: set(), None, None), (set(), set(), []))
        with self.assertRaisesRegex(ValueError, "composition view format 1.3 is unsupported"):
            physics_orders.contextual_targets(extension, {}, set(), None, None, None)
        with self.assertRaisesRegex(ValueError, "composition view format 1.3 is unsupported"):
            physics_orders.acquisition_placements(extension, {}, set(), None, None)

        with tempfile.TemporaryDirectory() as scratch:
            inputs, outputs = (Path(scratch) / name for name in ("inputs", "outputs"))
            inputs.mkdir()
            outputs.mkdir()
            source, destination = (directory / "neutral.view.json" for directory in (inputs, outputs))
            argv = ["normalize", "--write", "--input-dir", str(inputs), "--output-dir", str(outputs)]
            normalizer = SimpleNamespace(full_view_inputs={}, normalize=lambda view: view,
                                         learning_window_conflicts=[], order_conflicts=[])
            with patch.object(sys, "argv", argv), patch.object(math_views, "Normalizer", return_value=normalizer):
                for extension_file in (source, destination):
                    with self.subTest(extension_file=extension_file):
                        source.write_text(json.dumps(legacy))
                        destination.write_text(json.dumps(legacy))
                        extension_file.write_bytes(path.read_bytes())
                        original = destination.read_bytes()
                        with self.assertRaisesRegex(ValueError, "composition view format 1.3 is unsupported"):
                            math_views.main()
                        self.assertEqual(destination.read_bytes(), original)
                source.write_text(json.dumps(legacy))
                destination.unlink()
                math_views.main()
                self.assertEqual(json.loads(destination.read_text()), legacy)

    def test_extension_view_is_rejected_by_unchanged_package_profiles(self):
        extension_dir = ROOT / "contracts/composition-view/v1.3"
        source = json.loads((extension_dir / "examples/extensions/neutral.view.json").read_text())
        schema = json.loads((extension_dir / "composition-view.schema.json").read_text())
        Draft202012Validator(schema).validate(source)
        for allow_partial in (False, True):
            with self.subTest(allow_partial=allow_partial):
                with self.assertRaisesRegex(compiler.CompilationError, "unsupported composition view format"):
                    compiler.compile_composition_view(source, "de", "extension view", allow_partial_order=allow_partial)
                with self.assertRaisesRegex(independent.ValidationError, "unsupported composition view format"):
                    independent.expected_composition_view(source, "de", self.validator, "extension view",
                        partial_order_validator=self.partial_validator if allow_partial else None)
        with self.assertRaisesRegex(offline.ValidationFailure, "composition view format 1.3 is unsupported"):
            offline.validate_runtime_composition_view(source, {})

    def test_reverse_compiler_refuses_rdf_1_3_instead_of_restoring_1_0_headers(self):
        artifact = reverse.Artifact("neutral", "composition-view", "composition-view", 0, "", "", "https://example.org/view")
        with tempfile.TemporaryDirectory() as temporary:
            store = reverse.TripleStore(Path(temporary) / "asserted.sqlite")
            try:
                store.ingest(iter([f'<{artifact.root_iri}> <{reverse.SP}compositionViewFormatVersion> "1.3" .\n'.encode()]))
                store.finish()
                reconstructor = reverse.ArtifactReconstructor(store, None, "https://example.org")
                with self.assertRaisesRegex(reverse.ReverseCompilerError, "composition view format 1.3 is unsupported"):
                    reconstructor.reconstruct(artifact)
            finally:
                store.close()

    def test_extension_flow_is_outside_pinned_compiled_landscape_contracts(self):
        root = json.loads((ROOT / "contracts/composition-view/v1.3/examples/extensions/root.json").read_text())
        for profile in ("v1", "v1.2"):
            schema = json.loads((ROOT / f"contracts/curriculum-package/{profile}/compiled-landscape.schema.json").read_text())
            self.assertTrue(any(list(error.absolute_path) == ["personalizationFlow", "version"]
                                for error in Draft202012Validator(schema).iter_errors(root)))

    def test_source_schema_validates_both_profiles_and_the_official_rule(self):
        directory = ROOT / "contracts/composition-view/v1.3"
        validator = Draft202012Validator(json.loads((directory / "composition-view.schema.json").read_text()))
        for filename in ("neutral.view.json", "neutral-lk.view.json"):
            view = json.loads((directory / "examples/extensions" / filename).read_text())
            validator.validate(view)
        groups = view["electionGroups"]
        official = next(group for group in groups if group["origin"] == "official")
        rule = official.pop("rule")
        self.assertFalse(validator.is_valid(view))
        official["rule"] = rule
        own = next(group for group in groups if group["origin"] == "skillpilot")
        own["minSelections"] = 1
        self.assertFalse(validator.is_valid(view))
        own["minSelections"] = 0
        official["maxSelections"] = 1
        self.assertFalse(validator.is_valid(view))

    def test_runtime_schema_reserves_the_dynamic_stage_only_in_flow_two(self):
        root = json.loads((ROOT / "contracts/composition-view/v1.3/examples/extensions/root.json").read_text())
        validator = Draft202012Validator(json.loads((ROOT / "docs/landscape-runtime.schema.json").read_text()))
        flow = root["personalizationFlow"]
        stages = flow["stages"]
        dynamic = stages.pop()
        validator.validate(root)  # No extension question was declared.
        stages.append(dynamic)
        validator.validate(root)
        stages.append(dynamic)
        self.assertFalse(validator.is_valid(root))
        stages.pop()
        dynamic["groupSource"]["selectedLandscapesFromGroupId"] = "unknown"
        self.assertFalse(validator.is_valid(root))
        dynamic["groupSource"]["selectedLandscapesFromGroupId"] = "subject"
        flow["version"] = "1"
        self.assertFalse(validator.is_valid(root))
        stages[-1] = {**stages[0], "id": "extensions"}
        validator.validate(root)  # Ordinary stage IDs in historical flows are unrestricted.
        flow["version"] = "2"
        self.assertFalse(validator.is_valid(root))

    def test_legacy_source_compiles_without_mutation(self):
        original = copy.deepcopy(self.old)
        expected = {**self.old, "$schema": SCHEMA["$id"], "viewFormatVersion": "1.0", "language": "de"}
        for compiled in self.both(self.old):
            self.assertEqual(compiled, expected)
        self.assertEqual(self.old, original)

    def test_versioned_partial_order_is_never_downgraded(self):
        value = {**copy.deepcopy(self.old), "$schema": VIEW_SCHEMA_12, "viewFormatVersion": "1.2", "language": "de"}
        value["rootNodes"][0]["childOrder"] = {"after": [{"unit": "b", "after": "a"}]}
        self.assert_rejected(value, "unsupported composition view format.*refusing downgrade")

    def test_new_version_without_order_still_cannot_be_relabelled(self):
        for header in ({"$schema": VIEW_SCHEMA_12}, {"viewFormatVersion": "1.2"},
                       {"$schema": SCHEMA["$id"], "viewFormatVersion": "9.0"}):
            with self.subTest(header=header):
                self.assert_rejected({**self.old, **header}, "refusing downgrade")

    def test_missing_or_old_header_cannot_discard_nested_or_empty_order(self):
        for versioned in (False, True):
            for order in ([], [{"unit": "b", "after": "a"}]):
                value = copy.deepcopy(self.old)
                if versioned:
                    value.update({"$schema": SCHEMA["$id"], "viewFormatVersion": "1.0"})
                value["rootNodes"][0]["children"][0]["childOrder"] = {"after": order}
                with self.subTest(versioned=versioned, order=order):
                    self.assert_rejected(value, "childOrder.*refusing order loss")

    def test_all_existing_dpk_routes_keep_the_current_mathematics_views(self):
        paths = sorted((ROOT / "contracts/curriculum-package").glob("*/profiles/*release-model*.profile.json"))
        self.assertEqual(len(paths), 4)
        directories = set()
        for path in paths:
            profile = json.loads(path.read_text())
            self.assertEqual(profile["canonicalLandscape"]["sourcePath"],
                             "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json")
            directories.add(profile["compositionViews"]["sourceDirectory"])
        self.assertEqual(directories, {"curricula/DE/Gymnasium/composition-views/mathematik"})
        views = sorted((ROOT / next(iter(directories))).glob("*.json"))
        current_profile = generator.build_profile()
        self.assertEqual(len(views), current_profile["expectedCounts"]["views"])
        historical_profile = json.loads((ROOT / "contracts/curriculum-package/v1.2/profiles/de-gymnasium-mathematik-learning-units-release-model-v1.profile.json").read_text())
        self.assertEqual(current_profile["compositionViews"]["publicationBaseViewCount"], historical_profile["expectedCounts"]["views"])
        for path in views:
            with self.subTest(view=path.name):
                source = json.loads(path.read_text())
                original = copy.deepcopy(source)
                partial = source.get("$schema") == VIEW_SCHEMA_12
                if partial:
                    self.assert_rejected(source, "refusing downgrade")
                compiled, expected = self.both(source, partial=partial)
                self.assertEqual(compiled, expected)
                # V1 already omits exactly these authored rationale fields.
                def runtime_nodes(nodes):
                    return [{key: runtime_nodes(value) if key == "children" else value
                             for key, value in node.items()
                             if (node.get("kind") != "structure" or key not in {
                                 "canonicalSourceGoalId", "canonicalSourceNode", "canonicalSourcePhase",
                                 "placementEvidence", "labelEn", "originalCanonicalSubtree"})
                             and (node.get("kind") != "goalEntry" or key != "placementEvidence")}
                            for node in nodes]
                self.assertEqual(compiled["rootNodes"], runtime_nodes(source["rootNodes"]))
                self.assertEqual(source, original)

    def test_eight_actual_new_physics_views_fail_explicitly_only_at_dpk_boundary(self):
        views = [json.loads(p.read_text()) for p in (ROOT / "curricula/DE/Gymnasium/composition-views/physik").glob("*.json")]
        selected = [v for v in views if v.get("$schema") == VIEW_SCHEMA_12]
        self.assertGreaterEqual(len(selected), 8)
        for value in selected:
            with self.subTest(view=value["viewId"]):
                self.assert_rejected(value, "refusing downgrade")

    def test_common_v13_transports_empty_and_partial_order_without_downgrade(self):
        for pairs in ([], [{"unit": "b", "after": "a"}]):
            source = {**copy.deepcopy(self.old), "$schema": VIEW_SCHEMA_12, "viewFormatVersion": "1.2", "language": "de"}
            source["rootNodes"][0]["childOrder"] = {"after": pairs}
            original = copy.deepcopy(source)
            compiled, reconstructed = self.both(source, partial=True)
            self.assertEqual(compiled, reconstructed)
            self.assertEqual(compiled["$schema"], v13.VIEW_SCHEMA_ID)
            self.assertEqual(compiled["viewFormatVersion"], "1.2")
            self.assertEqual(compiled["rootNodes"], source["rootNodes"])
            self.assertEqual(source, original)

    def test_current_candidate_cannot_overwrite_historical_redistribution_ledger(self):
        ledger = ROOT / "curricula/DE/Gymnasium/quality/package-redistribution/de-gymnasium-mathematik-v1.3.review.json"
        before = ledger.read_bytes()
        cases = [
            ["--runtime-v13-candidate"],
            ["--runtime-v13-candidate", "--ledger", str(ledger)],
            ["--ledger", str(ledger)],
            ["--learning-unit-candidate", "--ledger", str(ledger)],
            ["--completion-candidate", "--ledger", str(ledger)],
        ]
        for selection in cases:
            result = subprocess.run([sys.executable, "-B", str(ROOT / "scripts/generate_curriculum_package_redistribution_review.py"),
                "--generate", "--release-root", str(ROOT / "tmp/nonexistent-partial-order-boundary-fixture"),
                *selection], cwd=ROOT, capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("historical runtime 1.3 ledger is retained", result.stderr)
            self.assertEqual(ledger.read_bytes(), before)

    def test_explicit_acquisition_placement_is_preserved_without_inference(self):
        source = {**copy.deepcopy(self.old), "$schema": VIEW_SCHEMA_12, "viewFormatVersion": "1.2", "language": "de"}
        entry = source["rootNodes"][0]["children"][0]["children"][0]
        entry.update({"projectionRole": "prerequisiteOnly", "acquisitionPlacement": True})
        self.source_validator.validate(source)
        produced, reconstructed = self.both(source, partial=True)
        self.assertEqual(produced, reconstructed)
        self.assertTrue(produced["rootNodes"][0]["children"][0]["children"][0]["acquisitionPlacement"])
        normalizer = compiler.Normalizer(compiler.FieldRegistry(generator.field_registry()))
        marked = normalizer.normalize("composition-view", produced)
        entry.pop("acquisitionPlacement")
        entry["placementEvidence"] = {"role": "reviewedPreparation"}
        unmarked = self.both(source, partial=True)[0]
        self.assertNotIn("acquisitionPlacement", unmarked["rootNodes"][0]["children"][0]["children"][0])
        self.assertNotEqual(marked, normalizer.normalize("composition-view", unmarked))
        for role, flag in ((None, True), ("target", True), ("prerequisiteOnly", False), ("prerequisiteOnly", "true")):
            value = copy.deepcopy(source)
            node = value["rootNodes"][0]["children"][0]["children"][0]
            node.pop("placementEvidence")
            node["acquisitionPlacement"] = flag
            if role is None:
                node.pop("projectionRole")
            else:
                node["projectionRole"] = role
            with self.subTest(role=role, flag=flag):
                self.assertTrue(list(self.source_validator.iter_errors(value)))
                with self.assertRaises(compiler.CompilationError):
                    compiler.compile_composition_view(value, "de", "test", allow_partial_order=True)
                with self.assertRaises(independent.ValidationError):
                    independent.expected_composition_view(value, "de", self.validator, "test", partial_order_validator=self.partial_validator)
        legacy = copy.deepcopy(self.old)
        legacy["rootNodes"][0]["children"][0]["children"][0].update({
            "projectionRole": "prerequisiteOnly", "acquisitionPlacement": True,
        })
        with self.assertRaises(compiler.CompilationError):
            compiler.compile_composition_view(legacy, "de", "test", allow_partial_order=True)
        with self.assertRaises(independent.ValidationError):
            independent.expected_composition_view(legacy, "de", self.validator, "test", partial_order_validator=self.partial_validator)
        invalid_kind = copy.deepcopy(source)
        invalid_kind["rootNodes"][0]["acquisitionPlacement"] = True
        for action, error in ((lambda: compiler.compile_composition_view(invalid_kind, "de", "test", allow_partial_order=True), compiler.CompilationError),
                              (lambda: independent.expected_composition_view(invalid_kind, "de", self.validator, "test", partial_order_validator=self.partial_validator), independent.ValidationError)):
            with self.assertRaises(error):
                action()

    def test_all_validators_bind_acquisition_placement_to_actual_atomic_definitions(self):
        source = {**copy.deepcopy(self.old), "$schema": VIEW_SCHEMA_12, "viewFormatVersion": "1.2", "language": "de"}
        source["rootNodes"][0]["children"][0]["children"][0].update({
            "projectionRole": "prerequisiteOnly", "acquisitionPlacement": True,
        })
        runtime = self.both(source, partial=True)[0]
        atom = {"atom-a": {"id": "atom-a", "type": "atomic", "contains": []}}
        checks = [(v13.validate_acquisition_placements, ValueError),
                  (independent.validate_acquisition_placements, independent.ValidationError),
                  (offline.validate_runtime_composition_view, offline.ValidationFailure)]
        for check, error in checks:
            check(runtime, atom)
            for definitions in ({}, {"atom-a": {"type": "cluster", "contains": ["atom-b"]}},
                                {"atom-a": {"type": "cluster", "contains": []}},
                                {"atom-a": {"contains": []}}):
                with self.subTest(validator=check.__module__, goals=definitions):
                    with self.assertRaises(error):
                        check(runtime, definitions)
            root_entry = {**runtime, "rootNodes": [runtime["rootNodes"][0]["children"][0]["children"][0]]}
            with self.assertRaises(error):
                check(root_entry, atom)

    def test_offline_package_validator_checks_local_order_without_producer(self):
        runtime = {**copy.deepcopy(self.old), "$schema": v13.VIEW_SCHEMA_ID, "viewFormatVersion": "1.2", "language": "de"}
        parent = runtime["rootNodes"][0]
        parent["children"].append({"kind": "structure", "id": "c", "label": "C", "children": []})
        for pairs in ([], [{"unit": "b", "after": "a"}]):
            parent["childOrder"] = {"after": pairs}
            offline.validate_runtime_composition_view(runtime, {})
        for pairs in ([{"unit": "missing", "after": "a"}], [{"unit": "a", "after": "a"}],
                      [{"unit": "b", "after": "a"}, {"unit": "b", "after": "a"}],
                      [{"unit": "b", "after": "a"}, {"unit": "a", "after": "b"}],
                      [{"unit": "b", "after": "a"}, {"unit": "c", "after": "b"}, {"unit": "c", "after": "a"}]):
            parent["childOrder"] = {"after": pairs}
            with self.subTest(pairs=pairs), self.assertRaises(offline.ValidationFailure):
                offline.validate_runtime_composition_view(runtime, {})
        parent.pop("childOrder")
        parent["children"][-1]["id"] = "parent"
        with self.assertRaises(offline.ValidationFailure):
            offline.validate_runtime_composition_view(runtime, {})

    def test_independent_output_validation_dispatches_each_runtime_view_schema(self):
        source = {**copy.deepcopy(self.old), "$schema": VIEW_SCHEMA_12, "viewFormatVersion": "1.2", "language": "de"}
        source["rootNodes"][0]["childOrder"] = {"after": [{"unit": "b", "after": "a"}]}
        source["rootNodes"][0]["children"][0]["children"][0].update({
            "projectionRole": "prerequisiteOnly", "acquisitionPlacement": True,
        })
        runtime = self.both(source, partial=True)[0]
        validators = {name: Draft202012Validator({}) for name in independent.ARTIFACT_SCHEMA_NAMES.values()}
        validators.update({"composition-view": self.validator, "composition-view-partial-order": self.partial_validator})
        context = SimpleNamespace(validators=validators)
        with tempfile.TemporaryDirectory(prefix="view-schema-dispatch-", dir=ROOT / "tmp") as scratch:
            release = Path(scratch)
            model = {"releaseRoot": release, "views": [("data/views/test.json", runtime)], "decks": [],
                     "publication": {"logicalDocuments": []}, "assessmentBytes": {},
                     "coverage": {}, "buildInputs": {}, "conformance": {}}
            for field in ("landscape", "viewIndex", "cardIndex", "resourceIndex", "closure", "migration", "runtimeCatalog", "contentIndex"):
                model[field] = {}
                model[field + "Path"] = "data/" + field + ".json"
            for path, (_, value) in independent.expected_json_documents(model).items():
                target = release / path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(independent.pretty_json_bytes(value))
            self.assertEqual(independent.validate_output_files(context, model)["data/views/test.json"], runtime)
            for mutation in ({"$schema": SCHEMA["$id"], "viewFormatVersion": "1.0"}, {"unregistered": True}):
                target = release / "data/views/test.json"
                target.write_bytes(independent.pretty_json_bytes({**runtime, **mutation}))
                with self.subTest(mutation=mutation), self.assertRaises(independent.ValidationError):
                    independent.validate_output_files(context, model)

    def test_common_v13_rejects_semantically_invalid_local_order_independently(self):
        cases = [
            [{"unit": "missing", "after": "a"}],
            [{"unit": "parent", "after": "a"}],
            [{"unit": "a", "after": "a"}],
            [{"unit": "b", "after": "a"}, {"unit": "b", "after": "a"}],
            [{"unit": "b", "after": "a"}, {"unit": "a", "after": "b"}],
        ]
        for pairs in cases:
            source = {**copy.deepcopy(self.old), "$schema": VIEW_SCHEMA_12, "viewFormatVersion": "1.2", "language": "de"}
            source["rootNodes"][0]["childOrder"] = {"after": pairs}
            with self.subTest(pairs=pairs):
                with self.assertRaises(compiler.CompilationError):
                    compiler.compile_composition_view(source, "de", "test", allow_partial_order=True)
                with self.assertRaises(independent.ValidationError):
                    independent.expected_composition_view(source, "de", self.validator, "test", partial_order_validator=self.partial_validator)

    def test_common_v13_keeps_authoring_evidence_out_of_closed_runtime_payload(self):
        source = {**copy.deepcopy(self.old), "$schema": VIEW_SCHEMA_12, "viewFormatVersion": "1.2", "language": "de"}
        parent = source["rootNodes"][0]
        parent["childOrder"] = {"after": [{"unit": "b", "after": "a"}]}
        parent["canonicalSourceGoalId"] = "original-cluster"
        parent["originalCanonicalSubtree"] = {"kind": "canonicalSubtree", "goalId": "original-cluster"}
        parent["children"][0]["children"][0]["placementEvidence"] = {"reviewNote": "Source-bound rationale"}
        original = copy.deepcopy(source)
        produced, reconstructed = self.both(source, partial=True)
        self.assertEqual(produced, reconstructed)
        actual = produced["rootNodes"][0]
        self.assertEqual(actual["childOrder"], parent["childOrder"])
        self.assertNotIn("canonicalSourceGoalId", actual)
        self.assertNotIn("originalCanonicalSubtree", actual)
        self.assertNotIn("placementEvidence", actual["children"][0]["children"][0])
        self.assertEqual(source, original)

    def test_common_v13_rejects_redundant_edges_and_global_duplicate_structure_ids(self):
        source = {**copy.deepcopy(self.old), "$schema": VIEW_SCHEMA_12, "viewFormatVersion": "1.2", "language": "de"}
        source["rootNodes"][0]["children"].append({"kind": "structure", "id": "c", "label": "C", "children": []})
        source["rootNodes"][0]["childOrder"] = {"after": [{"unit": "b", "after": "a"}, {"unit": "c", "after": "b"}, {"unit": "c", "after": "a"}]}
        for action, error in ((lambda: compiler.compile_composition_view(source, "de", "test", allow_partial_order=True), compiler.CompilationError),
                              (lambda: independent.expected_composition_view(source, "de", self.validator, "test", partial_order_validator=self.partial_validator), independent.ValidationError)):
            with self.assertRaisesRegex(error, "redundant"):
                action()
        source["rootNodes"][0].pop("childOrder")
        source["rootNodes"][0]["children"][-1]["id"] = "parent"
        for action, error in ((lambda: compiler.compile_composition_view(source, "de", "test", allow_partial_order=True), compiler.CompilationError),
                              (lambda: independent.expected_composition_view(source, "de", self.validator, "test", partial_order_validator=self.partial_validator), independent.ValidationError)):
            with self.assertRaisesRegex(error, "[Dd]uplicate"):
                action()

    def test_common_v13_registers_order_as_semantic_set_with_distinct_presence(self):
        registry = generator.field_registry()
        original = json.loads((ROOT / "contracts/curriculum-package/v1.2/profiles/skillpilot-fwu-field-semantics-learning-units-v1.registry.json").read_text())
        self.assertEqual(registry["entries"][:len(original["entries"])], original["entries"])
        normalizer = compiler.Normalizer(compiler.FieldRegistry(registry))
        source = {**copy.deepcopy(self.old), "$schema": VIEW_SCHEMA_12, "viewFormatVersion": "1.2", "language": "de"}
        source["rootNodes"][0]["children"].append({"kind": "structure", "id": "c", "label": "C", "children": []})
        source["rootNodes"][0]["childOrder"] = {"after": [{"unit": "b", "after": "a"}, {"unit": "c", "after": "a"}]}
        compiled = self.both(source, partial=True)[0]
        normalized = normalizer.normalize("composition-view", compiled)
        reordered = copy.deepcopy(compiled)
        reordered["rootNodes"][0]["childOrder"]["after"].reverse()
        self.assertEqual(normalized, normalizer.normalize("composition-view", reordered))
        changed = copy.deepcopy(compiled)
        changed["rootNodes"][0]["childOrder"]["after"].pop()
        self.assertNotEqual(normalized, normalizer.normalize("composition-view", changed))
        empty = copy.deepcopy(compiled)
        empty["rootNodes"][0]["childOrder"] = {"after": []}
        missing = copy.deepcopy(empty)
        missing["rootNodes"][0].pop("childOrder")
        self.assertNotEqual(normalizer.normalize("composition-view", empty), normalizer.normalize("composition-view", missing))


if __name__ == "__main__":
    unittest.main()
