# SPDX-License-Identifier: Apache-2.0
"""Focused process-binding regressions for the existing semantic-kind family."""

from __future__ import annotations

import copy
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import compile_curriculum_release_model as compiler
import validate_curriculum_release_model as validator
import prerequisite_reduction_semantic_kind as bridge


ROOT = Path(__file__).resolve().parents[1]
SOURCE = "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json"
GERMAN_SOURCE = "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json"
PROFILE = ROOT / "contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-release-model-v1.profile.json"
Q = "bf17cada-3ccd-5d9a-b9e3-42065cfdbb01"
CURRENT = "sha256:" + "a" * 64
BASELINE = "sha256:" + "b" * 64


class SemanticKindReductionTest(unittest.TestCase):
    def setUp(self) -> None:
        scratch = ROOT / "app/node_modules/.tmp/g17-german-first-cluster-prerequisite-20261108/python"
        scratch.mkdir(parents=True, exist_ok=True)
        self.temporary = tempfile.TemporaryDirectory(prefix="semantic-kind-bridge-", dir=scratch)
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.source = self.root / SOURCE
        self.source.parent.mkdir(parents=True)
        self.document = {"landscapeId": "fixture", "goals": [{"id": "q", "examples": ["original"], "resourceLinks": []}]}
        self.source.write_text(json.dumps(self.document))
        self.registry = self.root / bridge.REGISTRY_PATH
        self.registry.parent.mkdir(parents=True)
        self.registry.write_bytes(b"{}\n")
        self.fingerprints = {"q": CURRENT}
        self.receipt = {
            "schemaVersion": 1, "comparisonFamily": bridge.COMPARISON_FAMILY,
            "source": {"path": SOURCE, "landscapeId": "fixture", "sha256": bridge.digest(self.source.read_bytes())},
            "proof": {
                "proofContract": bridge.PROOF_CONTRACT,
                "mode": "current-or-certified-baseline-comparison",
                "auditScope": "origin-source-landscape-closure",
                "registryPath": bridge.REGISTRY_PATH,
                "registryDigest": bridge.digest(self.registry.read_bytes()),
                "affectedGoalIds": ["fixture:q"],
            },
            "goals": [{"goalId": "q", "currentFingerprint": CURRENT, "baselineFingerprint": BASELINE}],
        }

    def completed(self, receipt=None):
        return subprocess.CompletedProcess([], 0, json.dumps(receipt or self.receipt).encode(), b"")

    def load(self):
        return bridge.load_verified_semantic_kind_bindings(self.root, self.source, self.document, self.fingerprints)

    def fingerprint_document(self, document):
        profile = compiler.load_json(PROFILE)
        ontology = compiler.load_json(ROOT / profile["contracts"]["ontologyProfilePath"])
        contract = ontology["semanticKindDecisions"]["sourceFingerprint"]
        result = {goal["id"]: compiler.source_fingerprint(goal, contract) for goal in document["goals"]}
        self.assertEqual(result, {goal["id"]: validator.source_fingerprint(goal, contract) for goal in document["goals"]})
        return result

    def ordered_fixture(self, *, continued=False, non_atomic=False):
        before = {"landscapeId": "fixture", "goals": [
            {"id": "q", "type": "atomic", "contains": [], "requires": ["p", "r"]},
            {"id": "p", "type": "atomic", "contains": [], "requires": ["r"]},
            {"id": "r", "type": "atomic", "contains": [], "requires": []},
            {"id": "k", "type": "cluster", "contains": ["a", "b"], "requires": ["r"]},
            {"id": "a", "type": "atomic", "contains": [], "requires": []},
            {"id": "b", "type": "atomic", "contains": []},
        ]}
        if continued:
            before["goals"][1]["requires"].append("s")
            before["goals"].append({"id": "s", "type": "atomic", "contains": [], "requires": ["r"]})
        if non_atomic:
            before["goals"][1]["requires"].append("k")
        checkpoint = copy.deepcopy(before)
        checkpoint["goals"][0]["requires"] = ["p"]
        history = {
            "schemaVersion": 1, "proofContract": bridge.CLUSTER_PROOF_CONTRACT,
            "auditScope": "origin-source-landscape-closure",
            "catalogSources": [{"path": SOURCE, "landscapeId": "fixture",
                "baselineDocumentDigest": bridge.digest(compiler.canonical_json_bytes(before)),
                "currentDocumentDigest": bridge.digest(compiler.canonical_json_bytes(checkpoint))}],
            "originalRequires": [{"source": "fixture:q", "requires": ["p", "r"]}],
            "removals": [{"source": "fixture:q", "prerequisite": "fixture:r",
                          "witness": ["fixture:q", "fixture:p", "fixture:r"]}],
        }
        registry = {**copy.deepcopy(history), "proofContract": bridge.ORDERED_PROOF_CONTRACT,
            "v2Checkpoint": {"registryDigest": bridge.digest(compiler.canonical_json_bytes(history)),
                "currentDocumentDigests": [{"path": SOURCE,
                    "currentDocumentDigest": history["catalogSources"][0]["currentDocumentDigest"]}]},
            "suffixOriginalRequires": [{"source": "fixture:a", "requires": []},
                                       {"source": "fixture:b", "requires": None},
                                       {"source": "fixture:k", "requires": ["r"]}],
            "suffix": [{"operation": "materialize-atomic", "source": f"fixture:{goal_id}",
                "prerequisite": "fixture:r", "origin": {"source": "fixture:k", "prerequisite": "r",
                    "sourceContainsPath": ["fixture:k", f"fixture:{goal_id}"],
                    "prerequisiteContainsPath": ["fixture:r"]}} for goal_id in ("a", "b")]
                + [{"operation": "remove-cluster", "source": "fixture:k", "prerequisite": "fixture:r",
                    "atomicWitnesses": [["fixture:a", "fixture:r"], ["fixture:b", "fixture:r"]]}],
        }
        self.document = copy.deepcopy(checkpoint)
        self.document["goals"][3]["requires"] = []
        for goal in self.document["goals"][4:]:
            goal["requires"] = ["r"]
        self.save_ordered_fixture(registry)
        return before, checkpoint, history, registry

    def save_ordered_fixture(self, registry):
        registry["catalogSources"][0]["currentDocumentDigest"] = bridge.digest(compiler.canonical_json_bytes(self.document))
        self.source.write_text(json.dumps(self.document))
        self.registry.write_text(json.dumps(registry))
        self.fingerprints = self.fingerprint_document(self.document)

    def continue_registry(self, ordered, *, source="p", tail_originals=None):
        checkpoint = copy.deepcopy(self.document)
        registry = {**copy.deepcopy(ordered), "proofContract": bridge.CONTINUED_PROOF_CONTRACT,
            "v3Checkpoint": {"registryDigest": bridge.digest(compiler.canonical_json_bytes(ordered)),
                "currentDocumentDigests": [{"path": SOURCE,
                    "currentDocumentDigest": ordered["catalogSources"][0]["currentDocumentDigest"]}]},
            "tailOriginalRequires": tail_originals if tail_originals is not None else [
                {"source": f"fixture:{source}", "requires": copy.deepcopy(next(
                    goal["requires"] for goal in checkpoint["goals"] if goal["id"] == source))}],
            "atomicRemovals": [{"source": f"fixture:{source}", "prerequisite": "fixture:r",
                "witness": [f"fixture:{source}", "fixture:s", "fixture:r"]}],
            "witnessContinuations": [{"historicalRemovalIndex": 0, "edgeIndex": 1, "tailRemovalIndex": 0}],
        }
        next(goal for goal in self.document["goals"] if goal["id"] == source)["requires"].remove("r")
        self.save_ordered_fixture(registry)
        return checkpoint, registry

    def continued_fixture(self, *, non_atomic=False):
        before, _, _, ordered = self.ordered_fixture(continued=True, non_atomic=non_atomic)
        checkpoint, registry = self.continue_registry(ordered)
        return before, checkpoint, ordered, registry

    def cluster_target_fixture(self, *, existing_leaves=False, omit_types=False, changed_applicability=False):
        self.source = self.root / SOURCE
        _, _, ordered, parent = self.continued_fixture()
        before = {"landscapeId": "german", "goals": [
            {"id": "z", "type": "atomic", "contains": [], "requires": ["c", "keep"]},
            {"id": "c", "type": "cluster", "contains": ["h", "v"], "requires": []},
            {"id": "h", "type": "cluster", "contains": ["u"], "requires": []},
            {"id": "u", "type": "atomic", "contains": [], "requires": []},
            {"id": "v", "type": "atomic", "contains": [], "requires": []},
            {"id": "keep", "type": "atomic", "contains": [], "requires": []},
        ]}
        if existing_leaves:
            before["goals"][0]["requires"].extend(["u", "v"])
        if omit_types:
            for goal in before["goals"]:
                del goal["type"]
        if changed_applicability:
            before["goals"][0].update(tags=["Assessment"], extendedData={"applicabilityFromRequires": True})
            # Before the cut, c contributes the union {BY, HE}; afterwards
            # all leaf requirements are intersected, so z loses HE.
            for goal in before["goals"][1:]:
                goal["extendedData"] = {"applicabilityOverrides": {
                    "jurisdiction": ["DE-BY" if goal["id"] == "u" else "DE-HE"]}}

        binding = {"path": GERMAN_SOURCE, "landscapeId": "german",
                   "baselineDocumentDigest": bridge.digest(compiler.canonical_json_bytes(before)),
                   "currentDocumentDigest": bridge.digest(compiler.canonical_json_bytes(before))}
        # Keep the separate atomic Math scope and all of its certified operations.
        # Bind the unchanged German document through every historical checkpoint.
        history = {key: copy.deepcopy(ordered[key]) for key in (
            "schemaVersion", "proofContract", "auditScope", "catalogSources", "originalRequires", "removals")}
        history["proofContract"] = bridge.CLUSTER_PROOF_CONTRACT
        history["catalogSources"][0]["currentDocumentDigest"] = (
            ordered["v2Checkpoint"]["currentDocumentDigests"][0]["currentDocumentDigest"])
        history["catalogSources"].append(copy.deepcopy(binding))
        ordered["catalogSources"].append(copy.deepcopy(binding))
        ordered["v2Checkpoint"] = {
            "registryDigest": bridge.digest(compiler.canonical_json_bytes(history)),
            "currentDocumentDigests": [{"path": row["path"], "currentDocumentDigest": row["currentDocumentDigest"]}
                                       for row in history["catalogSources"]],
        }
        parent["catalogSources"].append(copy.deepcopy(binding))
        parent["v2Checkpoint"] = copy.deepcopy(ordered["v2Checkpoint"])
        parent["v3Checkpoint"] = {
            "registryDigest": bridge.digest(compiler.canonical_json_bytes(ordered)),
            "currentDocumentDigests": [{"path": row["path"], "currentDocumentDigest": row["currentDocumentDigest"]}
                                       for row in ordered["catalogSources"]],
        }
        registry = {**copy.deepcopy(parent), "proofContract": bridge.CLUSTER_TARGET_PROOF_CONTRACT,
            "v4Checkpoint": {
                "registryDigest": bridge.digest(compiler.canonical_json_bytes(parent)),
                "currentDocumentDigests": [{"path": row["path"], "currentDocumentDigest": row["currentDocumentDigest"]}
                                           for row in parent["catalogSources"]],
            },
            "clusterTargetOriginalRequires": [{"source": "german:z", "requires": copy.deepcopy(before["goals"][0]["requires"])}],
            "clusterTargetSuffix": ([] if existing_leaves else [
                {"operation": "materialize-atomic", "source": "german:z", "prerequisite": f"german:{leaf}",
                 "origin": {"source": "german:z", "prerequisite": "c", "sourceContainsPath": ["german:z"],
                            "prerequisiteContainsPath": path}}
                for leaf, path in (("u", ["german:c", "german:h", "german:u"]),
                                   ("v", ["german:c", "german:v"]))
            ]) + [{"operation": "remove-cluster-target", "source": "german:z", "prerequisite": "german:c"}],
        }
        self.source = self.root / GERMAN_SOURCE
        self.document = copy.deepcopy(before)
        self.document["goals"][0]["requires"] = ["keep", "u", "v"]
        self.save_cluster_target_fixture(registry)
        return before, parent, registry

    def save_cluster_target_fixture(self, registry):
        binding = next(row for row in registry["catalogSources"] if row["path"] == GERMAN_SOURCE)
        binding["currentDocumentDigest"] = bridge.digest(compiler.canonical_json_bytes(self.document))
        self.source.write_text(json.dumps(self.document))
        self.registry.write_text(json.dumps(registry))
        self.fingerprints = self.fingerprint_document(self.document)

    def rebind_cluster_target_parent(self, registry, parent):
        registry["v4Checkpoint"] = {
            "registryDigest": bridge.digest(compiler.canonical_json_bytes(parent)),
            "currentDocumentDigests": [{"path": row["path"], "currentDocumentDigest": row["currentDocumentDigest"]}
                                       for row in parent["catalogSources"]],
        }

    def test_absent_registry_uses_no_node(self):
        self.registry.unlink()
        with patch.object(bridge.subprocess, "run", side_effect=AssertionError("Node must not run")):
            self.assertIsNone(self.load())

    def test_absent_context_keeps_both_real_tools_strict(self):
        profile = compiler.load_json(PROFILE)
        document = compiler.load_json(ROOT / SOURCE)
        ledger = compiler.load_json(ROOT / profile["canonicalLandscape"]["semanticKindLedgerPath"])
        decisions = {row["goalId"]: row["sourceFingerprint"] for row in ledger["decisions"]}
        fingerprints = self.fingerprint_document(document)
        # Both tools check source order. Additional certified cuts can move the
        # first stale ledger binding before the original first Math example q.
        stale_goals = [goal["id"] for goal in document["goals"]
                       if fingerprints[goal["id"]] != decisions[goal["id"]]]
        self.assertIn(Q, stale_goals, "the original first Math case still needs the verified context")
        expected = f"Stale semantic-kind decision for goal {stale_goals[0]}"
        with patch.object(compiler, "load_verified_semantic_kind_bindings", return_value=None):
            with self.assertRaisesRegex(compiler.CompilationError, expected):
                compiler.compile_model(PROFILE, self.root / "compiler-output")
        context = validator.load_trusted_context(PROFILE)
        with patch.object(validator, "load_verified_semantic_kind_bindings", return_value=None):
            with self.assertRaisesRegex(validator.ValidationError, expected):
                validator.build_expected_model(context, self.root / "validator-output")
        self.assertFalse((self.root / "compiler-output").exists())
        self.assertFalse((self.root / "validator-output").exists())

    def test_live_node_bridge_matches_both_native_fingerprint_functions(self):
        profile = compiler.load_json(PROFILE)
        document = compiler.load_json(ROOT / SOURCE)
        ontology = compiler.load_json(ROOT / profile["contracts"]["ontologyProfilePath"])
        contract = ontology["semanticKindDecisions"]["sourceFingerprint"]
        fingerprints = {goal["id"]: compiler.source_fingerprint(goal, contract) for goal in document["goals"]}
        self.assertEqual(fingerprints, {goal["id"]: validator.source_fingerprint(goal, contract) for goal in document["goals"]})
        verified = bridge.load_verified_semantic_kind_bindings(ROOT, ROOT / SOURCE, document, fingerprints)
        self.assertIsNotNone(verified)
        ledger = compiler.load_json(ROOT / profile["canonicalLandscape"]["semanticKindLedgerPath"])
        historical = next(row["sourceFingerprint"] for row in ledger["decisions"] if row["goalId"] == Q)
        self.assertNotEqual(fingerprints[Q], historical)
        self.assertEqual(verified.baseline_fingerprints[Q], historical)
        self.assertEqual(set(verified.baseline_fingerprints), set(fingerprints))
        self.assertEqual(verified.provenance["canonicalSource"]["sha256"], bridge.digest((ROOT / SOURCE).read_bytes()))

    def test_declared_invalid_registry_never_falls_back_to_current(self):
        # Even perfectly matching current fingerprints cannot skip the real verifier.
        self.receipt["goals"][0]["baselineFingerprint"] = CURRENT
        with self.assertRaisesRegex(bridge.PrerequisiteReductionBindingError, "invalid registry fields"):
            self.load()

    def test_cli_rejects_non_catalog_source_before_reading_or_parsing(self):
        before = {"landscapeId": "fixture", "goals": [
            {"id": "q", "type": "atomic", "contains": [], "requires": ["p", "r"]},
            {"id": "p", "type": "atomic", "contains": [], "requires": ["r"]},
            {"id": "r", "type": "atomic", "contains": [], "requires": []},
        ]}
        after = copy.deepcopy(before)
        after["goals"][0]["requires"] = ["p"]
        self.source.write_text(json.dumps(after))
        self.registry.write_text(json.dumps({
            "schemaVersion": 1, "proofContract": bridge.PROOF_CONTRACT,
            "auditScope": "origin-source-landscape-closure",
            "catalogSources": [{"path": SOURCE, "landscapeId": "fixture",
                "baselineDocumentDigest": bridge.digest(compiler.canonical_json_bytes(before)),
                "currentDocumentDigest": bridge.digest(compiler.canonical_json_bytes(after))}],
            "originalRequires": [{"source": "fixture:q", "requires": ["p", "r"]}],
            "removals": [{"source": "fixture:q", "prerequisite": "fixture:r",
                          "witness": ["fixture:q", "fixture:p", "fixture:r"]}],
        }))
        (self.root / "unregistered-invalid.json").write_bytes(b"not json")
        for path in ("unregistered-invalid.json", "../outside.json"):
            with self.subTest(path=path):
                result = subprocess.run(
                    ["node", "--import", "tsx", "scripts/verifyPrerequisiteReductionSemanticKindBindings.ts",
                     "--canonical-source", path, "--repository-root", str(self.root)],
                    cwd=ROOT / "app", capture_output=True, timeout=30, check=False,
                )
                self.assertEqual(result.returncode, 1)
                self.assertIn(b"canonical source is not in the verified catalog", result.stderr)

    def test_cluster_contract_uses_real_node_verifier(self):
        before = {"landscapeId": "fixture", "goals": [
            {"id": "k", "type": "cluster", "contains": ["a"], "requires": ["r"]},
            {"id": "a", "type": "atomic", "contains": [], "requires": ["p"]},
            {"id": "p", "type": "atomic", "contains": [], "requires": ["r"]},
            {"id": "r", "type": "atomic", "contains": [], "requires": []},
        ]}
        self.document = copy.deepcopy(before)
        self.document["goals"][0]["requires"] = []
        self.source.write_text(json.dumps(self.document))
        registry = {
            "schemaVersion": 1, "proofContract": bridge.CLUSTER_PROOF_CONTRACT,
            "auditScope": "origin-source-landscape-closure",
            "catalogSources": [{"path": SOURCE, "landscapeId": "fixture",
                "baselineDocumentDigest": bridge.digest(compiler.canonical_json_bytes(before)),
                "currentDocumentDigest": bridge.digest(compiler.canonical_json_bytes(self.document))}],
            "originalRequires": [{"source": "fixture:k", "requires": ["r"]}],
            "removals": [{"source": "fixture:k", "prerequisite": "fixture:r",
                          "atomicWitnesses": [["fixture:a", "fixture:p", "fixture:r"]]}],
        }
        self.registry.write_text(json.dumps(registry))
        profile = compiler.load_json(PROFILE)
        ontology = compiler.load_json(ROOT / profile["contracts"]["ontologyProfilePath"])
        contract = ontology["semanticKindDecisions"]["sourceFingerprint"]
        self.fingerprints = {
            goal["id"]: compiler.source_fingerprint(goal, contract) for goal in self.document["goals"]
        }
        verified = self.load()
        self.assertEqual(verified.provenance["proofContract"], bridge.CLUSTER_PROOF_CONTRACT)
        self.assertEqual(verified.baseline_fingerprints["k"], compiler.source_fingerprint(before["goals"][0], contract))
        self.assertNotEqual(verified.baseline_fingerprints["k"], self.fingerprints["k"])
        for invalid, message in ((bridge.PROOF_CONTRACT, "invalid removal fields"),
                                 ("effective-prerequisite-reduction-v2", "unsupported registry contract")):
            registry["proofContract"] = invalid
            self.registry.write_text(json.dumps(registry))
            with self.subTest(contract=invalid):
                with self.assertRaisesRegex(bridge.PrerequisiteReductionBindingError, message):
                    self.load()

    def test_ordered_contract_uses_real_node_and_exact_native_baseline_fingerprints(self):
        before, _, history, registry = self.ordered_fixture()
        baseline = self.fingerprint_document(before)
        verified = self.load()
        self.assertIsNotNone(verified)
        self.assertEqual(verified.provenance["proofContract"], bridge.ORDERED_PROOF_CONTRACT)
        self.assertEqual(verified.provenance["affectedGoalIds"], ["fixture:a", "fixture:b", "fixture:k", "fixture:q"])
        self.assertEqual(verified.baseline_fingerprints, baseline)
        self.assertEqual({goal_id for goal_id in baseline if baseline[goal_id] != self.fingerprints[goal_id]},
                         {"a", "b", "k", "q"})
        self.assertEqual(registry["originalRequires"], history["originalRequires"])
        self.assertEqual(registry["removals"], history["removals"])
        # Both native fingerprint functions distinguish a present [] from an
        # absent field; the real Node receipt must preserve that raw distinction.
        with_empty_requires = copy.deepcopy(before)
        with_empty_requires["goals"][5]["requires"] = []
        self.assertNotEqual(baseline["b"], self.fingerprint_document(with_empty_requires)["b"])

    def test_ordered_contract_rejects_invalid_proof_and_missing_inputs(self):
        cases = ("missing-suffix-original", "bad-checkpoint", "bad-checkpoint-document", "unknown-contract",
                 "missing-checkpoint", "missing-suffix", "missing-source")
        for name in cases:
            with self.subTest(case=name):
                _, _, history, registry = self.ordered_fixture()
                if name == "missing-suffix-original":
                    registry["suffixOriginalRequires"].pop()
                    message = "missing suffix original requires"
                elif name == "bad-checkpoint":
                    registry["v2Checkpoint"]["registryDigest"] = "sha256:" + "0" * 64
                    message = "historical V2 registry digest differs"
                elif name == "bad-checkpoint-document":
                    wrong_digest = "sha256:" + "0" * 64
                    history["catalogSources"][0]["currentDocumentDigest"] = wrong_digest
                    registry["v2Checkpoint"]["currentDocumentDigests"][0]["currentDocumentDigest"] = wrong_digest
                    registry["v2Checkpoint"]["registryDigest"] = bridge.digest(compiler.canonical_json_bytes(history))
                    message = "V2 checkpoint document digest differs"
                elif name == "unknown-contract":
                    registry["proofContract"] = "ordered-atomic-materialization-and-cluster-reduction-v4"
                    message = "invalid registry fields|unsupported registry contract"
                elif name == "missing-checkpoint":
                    del registry["v2Checkpoint"]
                    message = "invalid ordered registry fields"
                elif name == "missing-suffix":
                    del registry["suffix"]
                    message = "invalid ordered registry fields"
                else:
                    message = "binding failed"
                self.registry.write_text(json.dumps(registry))
                if name == "missing-source":
                    self.source.unlink()
                with self.assertRaisesRegex(bridge.PrerequisiteReductionBindingError, message):
                    self.load()

    def invalid_ordered_history_fixture(self, *, with_tail=False):
        before, checkpoint, history, registry = self.ordered_fixture()
        before["goals"][1]["requires"] = ["r", "s", "target"]
        before["goals"].extend([
            {"id": "s", "type": "atomic", "contains": [], "requires": ["r"]},
            {"id": "target", "type": "cluster", "contains": ["r"], "requires": []},
        ])
        if with_tail:
            before["goals"].append({"id": "t", "type": "atomic", "contains": [], "requires": ["r", "s"]})
        checkpoint["goals"] = copy.deepcopy(before["goals"])
        checkpoint["goals"][0]["requires"] = ["p"]
        checkpoint["goals"][1]["requires"] = ["s", "target"]
        history["originalRequires"].append({"source": "fixture:p", "requires": ["r", "s", "target"]})
        history["removals"].append({"source": "fixture:p", "prerequisite": "fixture:r",
                                   "witness": ["fixture:p", "fixture:s", "fixture:r"]})
        history["catalogSources"][0].update(
            baselineDocumentDigest=bridge.digest(compiler.canonical_json_bytes(before)),
            currentDocumentDigest=bridge.digest(compiler.canonical_json_bytes(checkpoint)))
        registry.update(copy.deepcopy(history), proofContract=bridge.ORDERED_PROOF_CONTRACT,
            v2Checkpoint={"registryDigest": bridge.digest(compiler.canonical_json_bytes(history)),
                "currentDocumentDigests": [{"path": SOURCE,
                    "currentDocumentDigest": history["catalogSources"][0]["currentDocumentDigest"]}]},
            suffixOriginalRequires=[], suffix=[{
                "operation": "materialize-atomic", "source": "fixture:p", "prerequisite": "fixture:r",
                "origin": {"source": "fixture:p", "prerequisite": "target",
                    "sourceContainsPath": ["fixture:p"], "prerequisiteContainsPath": ["fixture:target", "fixture:r"]},
            }])
        self.document = copy.deepcopy(checkpoint)
        self.document["goals"][1]["requires"].append("r")
        self.save_ordered_fixture(registry)
        return registry

    def test_ordered_suffix_cannot_heal_an_invalid_historical_witness(self):
        self.invalid_ordered_history_fixture()
        with self.assertRaisesRegex(bridge.PrerequisiteReductionBindingError, "witness edge.*deleted"):
            self.load()

    def test_continued_contract_requires_explicit_matching_historical_witness_continuation(self):
        before, checkpoint, ordered, registry = self.continued_fixture()
        verified = self.load()
        self.assertIsNotNone(verified)
        self.assertEqual(verified.provenance["proofContract"], bridge.CONTINUED_PROOF_CONTRACT)
        self.assertEqual(verified.provenance["affectedGoalIds"], [f"fixture:{key}" for key in ("a", "b", "k", "p", "q")])
        self.assertEqual(verified.baseline_fingerprints, self.fingerprint_document(before))
        self.assertEqual(next(goal["requires"] for goal in checkpoint["goals"] if goal["id"] == "p"), ["r", "s"])
        self.assertEqual(next(goal["requires"] for goal in self.document["goals"] if goal["id"] == "p"), ["s"])
        for field in ("originalRequires", "removals", "v2Checkpoint", "suffixOriginalRequires", "suffix"):
            self.assertEqual(registry[field], ordered[field], field)
        self.assertEqual(registry["v3Checkpoint"]["registryDigest"], bridge.digest(compiler.canonical_json_bytes(ordered)))
        self.assertEqual(registry["witnessContinuations"], [
            {"historicalRemovalIndex": 0, "edgeIndex": 1, "tailRemovalIndex": 0}])
        registry["witnessContinuations"] = []
        self.registry.write_text(json.dumps(registry))
        with self.assertRaisesRegex(bridge.PrerequisiteReductionBindingError, "continuation|witness edge.*deleted"):
            self.load()

    def test_continued_contract_rejects_invalid_tail_and_continuations_without_current_fallback(self):
        cases = ("missing-continuations", "extra-continuation", "mismatched-continuation", "unused-continuation",
                 "bad-checkpoint", "bad-checkpoint-document", "non-atomic-scope", "missing-tail-original",
                 "corrupt-tail-original", "missing-catalog", "missing-current-source", "corrupt-current-snapshot",
                 "missing-current-fingerprint", "corrupt-current-fingerprint")
        for name in cases:
            with self.subTest(case=name):
                _, _, ordered, registry = self.continued_fixture(non_atomic=name == "non-atomic-scope")
                message = "Node prerequisite reduction verification failed"
                if name == "missing-continuations":
                    del registry["witnessContinuations"]
                elif name == "extra-continuation":
                    registry["witnessContinuations"] *= 2
                elif name == "mismatched-continuation":
                    registry["witnessContinuations"][0]["tailRemovalIndex"] = 1
                elif name == "unused-continuation":
                    registry["witnessContinuations"].append(
                        {"historicalRemovalIndex": 0, "edgeIndex": 0, "tailRemovalIndex": 0})
                elif name == "bad-checkpoint":
                    registry["v3Checkpoint"]["registryDigest"] = "sha256:" + "0" * 64
                elif name == "bad-checkpoint-document":
                    wrong_digest = "sha256:" + "0" * 64
                    ordered["catalogSources"][0]["currentDocumentDigest"] = wrong_digest
                    registry["v3Checkpoint"]["currentDocumentDigests"][0]["currentDocumentDigest"] = wrong_digest
                    registry["v3Checkpoint"]["registryDigest"] = bridge.digest(compiler.canonical_json_bytes(ordered))
                elif name == "missing-tail-original":
                    registry["tailOriginalRequires"] = []
                elif name == "corrupt-tail-original":
                    registry["tailOriginalRequires"][0]["requires"] = ["r"]
                elif name == "missing-catalog":
                    (self.source.parent / "unregistered.json").write_text("{}")
                elif name == "missing-current-source":
                    self.source.unlink()
                    message = "binding failed"
                elif name == "corrupt-current-snapshot":
                    self.document["goals"][0]["examples"] = ["undeclared"]
                    message = "Full canonical source differs"
                elif name == "missing-current-fingerprint":
                    del self.fingerprints["p"]
                    message = "fingerprint coverage differs"
                elif name == "corrupt-current-fingerprint":
                    self.fingerprints["p"] = CURRENT
                    message = "Node/Python current fingerprint differs"
                self.registry.write_text(json.dumps(registry))
                try:
                    with self.assertRaisesRegex(bridge.PrerequisiteReductionBindingError, message):
                        self.load()
                finally:
                    (self.source.parent / "unregistered.json").unlink(missing_ok=True)

    def test_continued_contract_verifies_the_entire_parent_before_the_tail(self):
        ordered = self.invalid_ordered_history_fixture(with_tail=True)
        self.continue_registry(ordered, source="t")
        with self.assertRaisesRegex(bridge.PrerequisiteReductionBindingError, "witness edge.*deleted"):
            self.load()

    def test_cluster_target_contract_uses_real_node_and_exact_native_baseline_fingerprints(self):
        for options in ({}, {"omit_types": True}, {"existing_leaves": True}):
            with self.subTest(options=options):
                before, parent, registry = self.cluster_target_fixture(**options)
                baseline = self.fingerprint_document(before)
                verified = self.load()
                self.assertIsNotNone(verified)
                self.assertEqual(verified.provenance["proofContract"], bridge.CLUSTER_TARGET_PROOF_CONTRACT)
                self.assertEqual(verified.provenance["affectedGoalIds"], [
                    "fixture:a", "fixture:b", "fixture:k", "fixture:p", "fixture:q", "german:z"])
                self.assertEqual(verified.baseline_fingerprints, baseline)
                self.assertEqual({key for key in baseline if baseline[key] != self.fingerprints[key]}, {"z"})
                self.assertEqual(verified.provenance["canonicalSource"]["path"], GERMAN_SOURCE)
                self.assertEqual(registry["clusterTargetOriginalRequires"], [
                    {"source": "german:z", "requires": before["goals"][0]["requires"]}])
                self.assertEqual(registry["v4Checkpoint"]["registryDigest"],
                                 bridge.digest(compiler.canonical_json_bytes(parent)))
                for field in ("originalRequires", "removals", "v2Checkpoint", "suffixOriginalRequires", "suffix",
                              "v3Checkpoint", "tailOriginalRequires", "atomicRemovals", "witnessContinuations"):
                    self.assertEqual(registry[field], parent[field], field)

    def test_cluster_target_contract_rejects_bad_checkpoints_snapshots_paths_leaves_and_cuts(self):
        cases = {
            "unknown-contract": "invalid registry fields|unsupported registry contract",
            "missing-checkpoint": "invalid cluster-target registry fields",
            "bad-checkpoint": "historical V4 registry digest differs",
            "bad-checkpoint-document": "current document digest differs",
            "duplicate-checkpoint-path": "V4 checkpoint paths",
            "missing-original": "exactly one original snapshot",
            "extra-original": "exactly one original snapshot",
            "reordered-original": "current document digest differs",
            "null-original": "current document digest differs",
            "bad-source-path": "materialization source or leaf differs",
            "bad-target-path": "canonical contains path edge is not directly authored",
            "changed-origin-literal": "original literal cluster origin",
            "missing-leaf-add": "leaf coverage is incomplete or duplicated",
            "duplicate-leaf-add": "leaf is already directly authored",
            "fabricated-leaf-add": "materialization source or leaf differs",
            "wrong-cut-target": "one unique authored cluster reference",
            "missing-cut": "invalid cluster-target removal fields",
            "early-cut": "invalid cluster-target removal fields",
            "extra-cut": "materializations before its single final cut",
            "undeclared-final-drift": "current document digest differs",
            "reordered-final-requires": "cluster-target replay differs from the current catalog",
        }
        for name, message in cases.items():
            with self.subTest(case=name):
                _, parent, registry = self.cluster_target_fixture()
                steps = registry["clusterTargetSuffix"]
                if name == "unknown-contract":
                    registry["proofContract"] = "atomic-cluster-target-normalization-v6"
                elif name == "missing-checkpoint":
                    del registry["v4Checkpoint"]
                elif name == "bad-checkpoint":
                    registry["v4Checkpoint"]["registryDigest"] = "sha256:" + "0" * 64
                elif name == "bad-checkpoint-document":
                    next(row for row in parent["catalogSources"] if row["path"] == GERMAN_SOURCE)[
                        "currentDocumentDigest"] = "sha256:" + "0" * 64
                    self.rebind_cluster_target_parent(registry, parent)
                elif name == "duplicate-checkpoint-path":
                    registry["v4Checkpoint"]["currentDocumentDigests"].append(
                        copy.deepcopy(registry["v4Checkpoint"]["currentDocumentDigests"][0]))
                elif name == "missing-original":
                    registry["clusterTargetOriginalRequires"] = []
                elif name == "extra-original":
                    registry["clusterTargetOriginalRequires"].append({"source": "german:u", "requires": []})
                elif name == "reordered-original":
                    registry["clusterTargetOriginalRequires"][0]["requires"].reverse()
                elif name == "null-original":
                    registry["clusterTargetOriginalRequires"][0]["requires"] = None
                elif name == "bad-source-path":
                    steps[0]["origin"]["sourceContainsPath"] = ["german:c", "german:z"]
                elif name == "bad-target-path":
                    steps[0]["origin"]["prerequisiteContainsPath"] = ["german:c", "german:u"]
                elif name == "changed-origin-literal":
                    steps[0]["origin"]["prerequisite"] = "german:c"
                elif name == "missing-leaf-add":
                    del steps[1]
                elif name == "duplicate-leaf-add":
                    steps.insert(1, copy.deepcopy(steps[0]))
                elif name == "fabricated-leaf-add":
                    steps[0]["prerequisite"] = "german:keep"
                    steps[0]["origin"]["prerequisiteContainsPath"] = ["german:c", "german:keep"]
                elif name == "wrong-cut-target":
                    steps[-1]["prerequisite"] = "german:h"
                elif name == "missing-cut":
                    steps.pop()
                elif name == "early-cut":
                    steps.insert(0, steps.pop())
                elif name == "extra-cut":
                    steps.append(copy.deepcopy(steps[-1]))
                elif name == "reordered-final-requires":
                    self.document["goals"][0]["requires"].reverse()
                else:
                    self.document["goals"][0]["examples"] = ["undeclared final field"]
                self.save_cluster_target_fixture(registry)
                with self.assertRaisesRegex(bridge.PrerequisiteReductionBindingError, message):
                    self.load()

    def test_cluster_target_contract_verifies_invalid_v4_parent_before_suffix(self):
        _, parent, registry = self.cluster_target_fixture()
        parent["witnessContinuations"] = []
        registry["witnessContinuations"] = []
        self.rebind_cluster_target_parent(registry, parent)
        # The invalid suffix must not mask or repair its invalid V4 parent.
        registry["clusterTargetSuffix"][0]["origin"]["prerequisiteContainsPath"] = ["german:c", "german:u"]
        self.save_cluster_target_fixture(registry)
        with self.assertRaisesRegex(bridge.PrerequisiteReductionBindingError, "missing witness continuation"):
            self.load()

    def test_cluster_target_contract_rejects_final_compiled_applicability_change(self):
        self.cluster_target_fixture(changed_applicability=True)
        with self.assertRaisesRegex(bridge.PrerequisiteReductionBindingError, "compiled applicability changed"):
            self.load()

    def test_nonregular_registry_never_means_absent(self):
        self.registry.unlink()
        for kind in ("directory", "dangling-symlink", "file-symlink"):
            with self.subTest(kind=kind):
                if kind == "directory":
                    self.registry.mkdir()
                else:
                    self.registry.symlink_to(self.source if kind == "file-symlink" else self.root / "missing")
                with patch.object(bridge.subprocess, "run", side_effect=AssertionError("reject before Node")):
                    with self.assertRaisesRegex(bridge.PrerequisiteReductionBindingError, "regular file"):
                        self.load()
                self.registry.rmdir() if kind == "directory" else self.registry.unlink()

    def test_full_snapshot_covers_fields_outside_fingerprint(self):
        for field, value in (("examples", ["changed"]), ("resourceLinks", [{"url": "changed"}])):
            with self.subTest(field=field):
                original = copy.deepcopy(self.document)
                self.document["goals"][0][field] = value
                with patch.object(bridge.subprocess, "run", side_effect=AssertionError("reject before Node")):
                    with self.assertRaisesRegex(bridge.PrerequisiteReductionBindingError, "Full canonical source"):
                        self.load()
                self.document = original

    def test_process_receipt_is_bound_to_exact_inputs_and_native_values(self):
        def at(path, value):
            def mutate(receipt):
                target = receipt
                for key in path[:-1]:
                    target = target[key]
                target[path[-1]] = value
            return mutate

        cases = {
            "source-bytes": at(["source", "sha256"], BASELINE),
            "source-path": at(["source", "path"], "elsewhere.json"),
            "source-owner": at(["source", "landscapeId"], "other"),
            "registry-bytes": at(["proof", "registryDigest"], BASELINE),
            "unknown-proof-contract": at(["proof", "proofContract"], "effective-prerequisite-reduction-v2"),
            "nearby-cluster-target-contract": at(["proof", "proofContract"], "atomic-cluster-target-normalization-v6"),
            "extra-proof-field": at(["proof", "atomicWitnesses"], []),
            "family": at(["comparisonFamily"], "other"),
            "current-fingerprint": at(["goals", 0, "currentFingerprint"], BASELINE),
            "missing-goal": at(["goals"], []),
            "duplicate-goal": at(["goals"], self.receipt["goals"] * 2),
            "unknown-goal": at(["goals", 0, "goalId"], "unknown"),
            "malformed-baseline": at(["goals", 0, "baselineFingerprint"], "invalid"),
            "undeclared-historical-goal": at(["proof", "affectedGoalIds"], ["fixture:other"]),
            "extra-field": at(["unverified"], True),
        }
        for name, mutate in cases.items():
            with self.subTest(name=name):
                receipt = copy.deepcopy(self.receipt)
                mutate(receipt)
                with patch.object(bridge.subprocess, "run", return_value=self.completed(receipt)):
                    with self.assertRaises(bridge.PrerequisiteReductionBindingError):
                        self.load()
        with patch.object(bridge.subprocess, "run", return_value=self.completed()):
            self.assertEqual(self.load().baseline_fingerprints, {"q": BASELINE})
        self.receipt["proof"]["proofContract"] = bridge.CLUSTER_PROOF_CONTRACT
        with patch.object(bridge.subprocess, "run", return_value=self.completed()):
            self.assertEqual(self.load().baseline_fingerprints, {"q": BASELINE})
        self.receipt["proof"]["proofContract"] = bridge.ORDERED_PROOF_CONTRACT
        with patch.object(bridge.subprocess, "run", return_value=self.completed()):
            self.assertEqual(self.load().baseline_fingerprints, {"q": BASELINE})
        self.receipt["proof"]["proofContract"] = bridge.CONTINUED_PROOF_CONTRACT
        with patch.object(bridge.subprocess, "run", return_value=self.completed()):
            self.assertEqual(self.load().baseline_fingerprints, {"q": BASELINE})
        self.receipt["proof"]["proofContract"] = bridge.CLUSTER_TARGET_PROOF_CONTRACT
        with patch.object(bridge.subprocess, "run", return_value=self.completed()):
            self.assertEqual(self.load().baseline_fingerprints, {"q": BASELINE})

    def test_source_and_registry_cannot_change_during_verification(self):
        for target in (self.source, self.registry):
            with self.subTest(target=target.name):
                original = target.read_bytes()

                def mutate(*_args, **_kwargs):
                    target.write_bytes(original + b"\n")
                    return self.completed()

                with patch.object(bridge.subprocess, "run", side_effect=mutate):
                    with self.assertRaisesRegex(bridge.PrerequisiteReductionBindingError, "changed during verification"):
                        self.load()
                target.write_bytes(original)

    def test_process_failure_or_malformed_json_is_hard(self):
        for result in (
            subprocess.CompletedProcess([], 1, b"", b"invalid proof"),
            subprocess.CompletedProcess([], 0, b"not json", b""),
            subprocess.CompletedProcess([], 0, b'{"schemaVersion":1,"schemaVersion":1}', b""),
        ):
            with self.subTest(result=result):
                with patch.object(bridge.subprocess, "run", return_value=result):
                    with self.assertRaises(bridge.PrerequisiteReductionBindingError):
                        self.load()


if __name__ == "__main__":
    unittest.main(verbosity=2)
