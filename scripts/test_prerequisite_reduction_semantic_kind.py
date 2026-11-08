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
PROFILE = ROOT / "contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-release-model-v1.profile.json"
Q = "bf17cada-3ccd-5d9a-b9e3-42065cfdbb01"
CURRENT = "sha256:" + "a" * 64
BASELINE = "sha256:" + "b" * 64


class SemanticKindReductionTest(unittest.TestCase):
    def setUp(self) -> None:
        scratch = ROOT / "app/node_modules/.tmp"
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

    def test_absent_registry_uses_no_node(self):
        self.registry.unlink()
        with patch.object(bridge.subprocess, "run", side_effect=AssertionError("Node must not run")):
            self.assertIsNone(self.load())

    def test_absent_context_keeps_both_real_tools_strict(self):
        # No artifact is written: each original guard rejects q before output construction.
        with patch.object(compiler, "load_verified_semantic_kind_bindings", return_value=None):
            with self.assertRaisesRegex(compiler.CompilationError, f"Stale semantic-kind decision for goal {Q}"):
                compiler.compile_model(PROFILE, self.root / "compiler-output")
        context = validator.load_trusted_context(PROFILE)
        with patch.object(validator, "load_verified_semantic_kind_bindings", return_value=None):
            with self.assertRaisesRegex(validator.ValidationError, f"Stale semantic-kind decision for goal {Q}"):
                validator.build_expected_model(context, self.root / "validator-output")
        self.assertFalse((self.root / "compiler-output").exists())

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
