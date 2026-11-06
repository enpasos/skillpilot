#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Genuine negative controls for the pure identity-proof boundary."""

import copy
import json
import sys
import tempfile
import unittest
import uuid
from pathlib import Path

sys.dont_write_bytecode = True
import canonical_goal_identity_migration as migration

OWNER = "10000000-0000-4000-8000-000000000001"
OTHER = "10000000-0000-4000-8000-000000000002"
THIRD = "10000000-0000-4000-8000-000000000003"
VALID = "20000000-0000-4000-8000-000000000001"
OLD = "stable_symbolic_memory_goal"


class IdentityProofTests(unittest.TestCase):
    def setUp(self):
        self.registry = json.loads((Path(__file__).resolve().parents[1] / migration.REGISTRY_PATH).read_bytes())
        self.source = {"landscapeId": OWNER, "capturedAt": "2026-11-06T08:00:00Z", "goals": [
            {"id": OLD, "description": "Retrieve exactly these cards", "requires": [],
             "extendedData": {"provenance": {"sourceGoalId": OLD}}},
            {"id": VALID, "requires": [OLD], "contains": [], "weight": 1},
        ]}
        self.catalog = {"canonical.json": self.source}

    def projection(self):
        rules = migration.build_bijection(self.catalog)
        owners, keys = migration.identity_index(self.catalog)
        renamed = {(r["landscapeId"], r["sourceGoalId"]): r["targetGoalId"] for r in rules}
        import re
        matcher = re.compile(re.escape(OLD))
        result = migration.transform_document(self.source, "runtime-graph", self.registry,
                                              renamed, owners, keys, matcher)
        return rules, result

    def test_deterministic_uuid_v5_bijection_and_exact_inverse(self):
        rules, (candidate, fields, preserved, blockers, restored_hash) = self.projection()
        self.assertEqual(rules, migration.build_bijection(copy.deepcopy(self.catalog)))
        self.assertEqual(uuid.UUID(rules[0]["targetGoalId"]).version, 5)
        self.assertEqual(len(fields), 2)
        self.assertFalse(blockers)
        self.assertEqual(len(preserved), 1)
        self.assertEqual(candidate["goals"][0]["extendedData"]["provenance"]["sourceGoalId"], OLD)
        self.assertEqual(restored_hash, migration.digest(migration.stable(self.source)))
        self.assertEqual(migration.inverse_proof(self.source, candidate, fields), restored_hash)

    def test_existing_global_target_collision_is_rejected(self):
        target = migration.build_bijection(self.catalog)[0]["targetGoalId"]
        self.catalog["foreign.json"] = {"landscapeId": OTHER, "goals": [{"id": target}]}
        with self.assertRaisesRegex(migration.ContractError, "collision"):
            migration.build_bijection(self.catalog)

    def test_equivalent_uppercase_uuid_collision_is_rejected(self):
        target = migration.build_bijection(self.catalog)[0]["targetGoalId"].upper()
        self.catalog["foreign.json"] = {"landscapeId": OTHER, "goals": [{"id": target}]}
        with self.assertRaisesRegex(migration.ContractError, "collision"):
            migration.build_bijection(self.catalog)

    def test_semantic_mutation_cannot_be_hidden_by_valid_renamed_id(self):
        _, (candidate, fields, _, _, _) = self.projection()
        candidate["goals"][0]["description"] = "A different competency"
        with self.assertRaisesRegex(migration.ContractError, "semantic/source/timestamp"):
            migration.inverse_proof(self.source, candidate, fields)

    def test_source_evidence_mutation_is_rejected(self):
        _, (candidate, fields, _, _, _) = self.projection()
        candidate["goals"][0]["extendedData"]["provenance"]["sourceGoalId"] = "fabricated-source-id"
        with self.assertRaisesRegex(migration.ContractError, "semantic/source/timestamp"):
            migration.inverse_proof(self.source, candidate, fields)

    def test_original_timestamp_mutation_is_rejected(self):
        _, (candidate, fields, _, _, _) = self.projection()
        candidate["capturedAt"] = "2026-11-07T08:00:00Z"
        with self.assertRaisesRegex(migration.ContractError, "semantic/source/timestamp"):
            migration.inverse_proof(self.source, candidate, fields)

    def test_dangling_graph_reference_is_rejected(self):
        self.source["goals"][0]["requires"] = ["not-a-real-endpoint"]
        with self.assertRaisesRegex(migration.ContractError, "Dangling"):
            migration.validate_graph_references(self.catalog)

    def test_ambiguous_foreign_owner_is_rejected(self):
        catalog = {"a": {"landscapeId": OWNER, "goals": [{"id": VALID}]},
                   "b": {"landscapeId": OTHER, "goals": [{"id": VALID}]},
                   "c": {"landscapeId": THIRD, "goals": [{"id": "x", "requires": [VALID]}]}}
        with self.assertRaisesRegex(migration.ContractError, "ambiguous"):
            migration.validate_graph_references(catalog)

    def test_explicit_wrong_owner_never_falls_back(self):
        self.catalog["foreign.json"] = {"landscapeId": OTHER, "goals": [{"id": "foreign"}]}
        self.source["goals"][0]["requires"] = [OTHER + ":" + VALID]
        with self.assertRaisesRegex(migration.ContractError, "Dangling exact"):
            migration.validate_graph_references(self.catalog)

    def test_unknown_explicit_landscape_never_falls_back(self):
        owners, keys = migration.identity_index(self.catalog)
        with self.assertRaisesRegex(migration.ContractError, "Unknown explicit"):
            migration.resolve_reference(VALID, THIRD, owners, keys)

    def test_exact_local_endpoint_wins_over_foreign_duplicate(self):
        self.catalog["foreign.json"] = {"landscapeId": OTHER, "goals": [{"id": VALID}]}
        self.assertEqual(migration.validate_graph_references(self.catalog), 1)

    def test_qualified_endpoint_preserves_owner(self):
        self.source["goals"][1]["requires"] = [OWNER + ":" + OLD]
        rules, (candidate, _, _, blockers, _) = self.projection()
        self.assertFalse(blockers)
        self.assertEqual(candidate["goals"][1]["requires"], [OWNER + ":" + rules[0]["targetGoalId"]])

    def test_empty_qualified_owner_is_not_a_local_alias(self):
        self.source["goals"][1]["requires"] = [":" + OLD]
        with self.assertRaisesRegex(migration.ContractError, "Malformed qualified"):
            migration.validate_graph_references(self.catalog)

    def test_asset_url_is_preserved_while_its_goal_binding_is_projected(self):
        url = "/assets/" + OLD + "/picture.jpg"
        self.source["goals"][0]["resourceLinks"] = [{"url": url, "skillpilotId": OLD}]
        rules, (candidate, _, preserved, blockers, _) = self.projection()
        self.assertFalse(blockers)
        link = candidate["goals"][0]["resourceLinks"][0]
        self.assertEqual(link["url"], url)
        self.assertEqual(link["skillpilotId"], rules[0]["targetGoalId"])
        self.assertTrue(any(row["pointer"].endswith("/url") for row in preserved))

    def test_undeclared_text_hit_blocks_without_string_replacement(self):
        self.source["goals"][1]["description"] = "Historical text mentioning " + OLD
        _, (candidate, _, _, blockers, _) = self.projection()
        self.assertEqual(len(blockers), 1)
        self.assertEqual(candidate["goals"][1]["description"], self.source["goals"][1]["description"])

    def test_mapping_declared_owner_cannot_borrow_foreign_identity(self):
        import re
        owners, keys = migration.identity_index({**self.catalog, "foreign": {
            "landscapeId": OTHER, "goals": [{"id": VALID}]
        }})
        rules = migration.build_bijection(self.catalog)
        renamed = {(r["landscapeId"], r["sourceGoalId"]): r["targetGoalId"] for r in rules}
        document = {"targetLandscapeId": OTHER, "mappings": [{"canonicalGoalId": OLD}]}
        candidate, fields, _, blockers, _ = migration.transform_document(
            document, "mapping", self.registry, renamed, owners, keys, re.compile(re.escape(OLD)))
        self.assertEqual(candidate, document)
        self.assertFalse(fields)
        self.assertEqual(len(blockers), 1)
        self.assertIn("declared canonical document owner", blockers[0]["reason"])

    def test_exact_pointer_guard_rejects_altered_endpoint(self):
        _, (candidate, fields, _, _, _) = self.projection()
        candidate["goals"][0]["id"] = VALID
        with self.assertRaisesRegex(migration.ContractError, "endpoint differs"):
            migration.inverse_proof(self.source, candidate, fields)

    def test_key_rename_and_inverse_do_not_change_source_provenance(self):
        field = {"pointer": "/landscapes/0/goalProvenance/" + OLD, "kind": "key", "before": OLD,
                 "after": VALID, "role": "reference-key", "landscapeId": OWNER}
        before = {"landscapes": [{"landscapeId": OWNER, "goalProvenance": {OLD: {"sourceGoalId": OLD}}}]}
        candidate = copy.deepcopy(before)
        migration.set_field(candidate, field)
        self.assertEqual(candidate["landscapes"][0]["goalProvenance"][VALID]["sourceGoalId"], OLD)
        self.assertEqual(migration.inverse_proof(before, candidate, [field]), migration.digest(migration.stable(before)))

    def test_key_collision_is_rejected(self):
        field = {"pointer": "/" + OLD, "kind": "key", "before": OLD, "after": VALID}
        with self.assertRaisesRegex(migration.ContractError, "collision"):
            migration.set_field({OLD: 1, VALID: 2}, field)

    def test_closed_schema_rejects_unknown_nested_field(self):
        schema = {"type": "object", "additionalProperties": False, "properties": {
            "rule": {"type": "object", "additionalProperties": False, "properties": {"id": {"type": "string"}}, "required": ["id"]}
        }, "required": ["rule"]}
        with self.assertRaisesRegex(migration.ContractError, "Unknown schema"):
            migration.validate_closed_schema({"rule": {"id": "x", "bypass": True}}, schema)

    def test_exact_decimal_unicode_and_string_canonical_vectors(self):
        profile = json.loads((Path(__file__).resolve().parents[1] / migration.CANONICAL_PROFILE_PATH).read_bytes())
        for vector in profile["vectors"]:
            actual = migration.stable(migration.parse_json(vector["inputJson"]))
            self.assertEqual(actual, vector["canonicalJson"].encode("utf-8"))
            self.assertEqual(migration.digest(actual), vector["sha256"])

    def test_duplicate_properties_and_nonfinite_numbers_are_rejected(self):
        for source in ['{"goalId":"a","goalId":"b"}', '{"weight":NaN}', '{"weight":Infinity}']:
            with self.assertRaises(migration.ContractError):
                migration.parse_json(source)

    def test_unpaired_surrogate_is_rejected(self):
        with self.assertRaisesRegex(migration.ContractError, "Unpaired"):
            migration.stable(migration.parse_json('"\\ud800"'))

    def test_historical_nested_composition_copy_is_never_an_active_view(self):
        path = ("curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/retained/"
                "curricula/DE/Gymnasium/composition-views/wirtschaft/de-he.view.json")
        self.assertEqual(migration.document_class(path), (None, None))
        self.assertEqual(migration.document_class("curricula/DE/Gymnasium/composition-views/wirtschaft/de-he.view.json"),
                         ("composition", "active"))

    def test_stale_snapshot_and_self_asserted_acceptance_are_rejected(self):
        raw = b'{"baseCommit":"' + b'a' * 40 + b'"}'
        manifest = migration.parse_json(raw)
        accepted = migration.digest(raw)
        migration.verify_accepted_bindings(manifest, raw, "a" * 40, accepted)
        for base, wanted in [("b" * 40, accepted), ("a" * 40, "0" * 64), (None, accepted), ("a" * 40, None)]:
            with self.assertRaises(migration.ContractError):
                migration.verify_accepted_bindings(manifest, raw, base, wanted)

    def test_unrelated_untouched_catalog_semantic_delta_is_rejected(self):
        original = b'{"description":"Original history semantics"}\n'
        manifest = {"documents": [], "catalog": {"sourceFiles": [{"path": "history.json", "sha256": migration.digest(original)}]}}
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "history.json"
            path.write_bytes(original)
            migration.verify_candidate_catalog_sources(Path(folder), manifest)
            path.write_text('{"description":"Different history semantics"}\n')
            with self.assertRaisesRegex(migration.ContractError, "Untouched catalog source changed"):
                migration.verify_candidate_catalog_sources(Path(folder), manifest)


if __name__ == "__main__":
    unittest.main()
