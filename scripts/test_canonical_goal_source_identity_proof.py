#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Negative controls for the source/activation boundary, separate from v1."""

import copy
import json
import sys
import unittest
from pathlib import Path

sys.dont_write_bytecode = True
import canonical_goal_source_identity_proof as source


class SourceProofTests(unittest.TestCase):
    def setUp(self):
        self.schema = source.kernel.parse_json((Path(__file__).resolve().parents[1] / source.SOURCE_SCHEMA_PATH).read_bytes())
        self.exclusions = self.schema["properties"]["derivedOutputExclusions"]["const"]
        self.path = next(x["path"] for x in self.exclusions if x["producerId"] == "curriculum-quality-status")
        self.proposal = {
            "status": "blocked",
            "catalog": {"sourceFiles": [{"path": "curricula/canonical.json", "sha256": "original"}]},
            "documents": [
                {"path": "curricula/canonical.json", "classification": "runtime-graph",
                 "handling": "explicit-pointer-projection", "sourceSha256": "source", "hypotheticalCanonicalSha256": "candidate"},
                {"path": "quality/original-review.json", "classification": "immutable-original",
                 "handling": "preserve-exact-bytes", "sourceSha256": "authentic-input"},
                {"path": self.path, "classification": "derived-output", "handling": "requires-review", "sourceSha256": "old-output"},
            ],
            "blockers": [{"path": self.path, "reason": "Needs real regeneration"}],
        }

    def test_exact_known_output_is_not_hashed_into_source_projection(self):
        docs = source.source_inputs(self.proposal, self.exclusions)
        before = source.projection_digest(self.proposal["catalog"]["sourceFiles"], [], docs)
        changed = copy.deepcopy(self.proposal)
        changed["documents"][-1]["sourceSha256"] = "actually-regenerated-output"
        after = source.projection_digest(changed["catalog"]["sourceFiles"], [], source.source_inputs(changed, self.exclusions))
        self.assertEqual(before, after)
        self.assertEqual(len(docs), 2)
        self.assertEqual(self.proposal["status"], "blocked")

    def test_original_review_inputs_are_bound_not_approved(self):
        docs = source.source_inputs(self.proposal, self.exclusions)
        before = source.projection_digest([], [], docs)
        docs[1]["sourceSha256"] = "altered-review"
        self.assertNotEqual(before, source.projection_digest([], [], docs))

    def test_unknown_output_filename_does_not_gain_a_general_directory_exception(self):
        self.proposal["blockers"].append({"path": "docs/qa-ci/status/unclassified-new-output.json", "reason": "Unknown"})
        with self.assertRaisesRegex(source.kernel.ContractError, "Unclassified"):
            source.source_inputs(self.proposal, self.exclusions)

    def test_unready_active_producer_is_not_waived_by_source_capability(self):
        self.proposal["blockers"].append({"path": "app/scripts/currentProducer.ts", "reason": "Unready source producer"})
        with self.assertRaisesRegex(source.kernel.ContractError, "unready"):
            source.source_inputs(self.proposal, self.exclusions)

    def test_unclassified_document_without_an_issue_counter_still_fails(self):
        self.proposal["documents"].append({"path": "extra.json", "classification": "unclassified", "handling": "requires-review"})
        with self.assertRaisesRegex(source.kernel.ContractError, "Unclassified source document"):
            source.source_inputs(self.proposal, self.exclusions)

    def test_catalog_source_cannot_be_hidden_as_an_output(self):
        self.proposal["catalog"]["sourceFiles"][0]["path"] = self.path
        with self.assertRaisesRegex(source.kernel.ContractError, "catalog input"):
            source.source_inputs(self.proposal, self.exclusions)

    def test_proof_digest_binds_unchanged_ids_with_changed_relation_inputs(self):
        docs = source.source_inputs(self.proposal, self.exclusions)
        before = source.projection_digest([], [], docs)
        docs[0]["hypotheticalCanonicalSha256"] = "wrong-requires-even-though-goal-id-is-unchanged"
        self.assertNotEqual(before, source.projection_digest([], [], docs))

    def test_exclusion_schema_has_exact_central_paths_and_no_output_hashes(self):
        self.assertEqual(len(self.exclusions), 11)
        self.assertTrue(all(set(entry) == {"path", "producerId", "kind"} for entry in self.exclusions))
        self.assertNotIn("status", self.schema["properties"])
        self.assertNotIn("blockers", self.schema["properties"])
        self.assertEqual(self.schema["properties"]["runtimeActivationAllowed"]["const"], False)
        self.assertEqual(self.schema["properties"]["qaValidityClaimed"]["const"], False)

    def test_exact_original_fixture_classification_keeps_bytes_in_proof(self):
        original = {"path": "original-negative-fixture.ts", "classification": "immutable-original",
                    "handling": "preserve-exact-bytes", "reason": "Real historical invalid-ID control"}
        self.proposal["documents"].append({"path": original["path"], "classification": "unclassified",
                                          "handling": "requires-review", "sourceSha256": "original-byte-binding"})
        self.proposal["blockers"].append({"path": original["path"], "reason": "Originally unknown"})
        docs = source.source_inputs(self.proposal, self.exclusions, [original])
        found = next(d for d in docs if d["path"] == original["path"])
        self.assertEqual(found["sourceSha256"], "original-byte-binding")
        self.assertEqual(found["classification"], "immutable-original")
        before = source.projection_digest([], [], docs)
        found["sourceSha256"] = "changed-fixture"
        self.assertNotEqual(before, source.projection_digest([], [], docs))

    def test_original_classification_cannot_hide_a_catalog_definition(self):
        original = {"path": "curricula/canonical.json", "classification": "immutable-original",
                    "handling": "preserve-exact-bytes", "reason": "Invalid attempted escape"}
        with self.assertRaisesRegex(source.kernel.ContractError, "catalog bytes"):
            source.source_inputs(self.proposal, self.exclusions, [original])


if __name__ == "__main__":
    unittest.main()
