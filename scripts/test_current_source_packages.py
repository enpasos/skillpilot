# SPDX-License-Identifier: Apache-2.0
"""Mutation controls for selecting an edition without admitting historical claims."""
import copy
import hashlib
import json
import tempfile
import unittest
from pathlib import Path

from current_source_packages import REGISTRY, checked_file, current_packages, row_hash, validate_edition


class VersionedSourcesTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        self.goal = {"id": "first", "sourceText": "Am Körper messen.", "sourceSpan": "S. 8", "passageId": "p"}
        self.pdf = self.write("official.pdf", b"original fixture")
        self.extraction = {"sourceLandscapeId": "source", "jurisdiction": "DE-NI", "subject": "Physik",
                           "stage": "SekII", "sourceDocument": {"path": self.pdf["path"]},
                           "sourceGoals": [self.goal], "passages": [{"id": "p"}]}
        self.decision = {"sourceGoalId": "first", "decision": "mapped", "sourceSpan": "S. 8",
                         "sourceGoalSha256": row_hash(self.goal), "canonicalGoalIds": ["target"]}
        self.review = {"sourceLandscapeId": "source", "targetLandscapeId": "physics",
                       "decisions": [self.decision], "mappings": [{"legacyGoalId": "first", "canonicalGoalId": "target"}]}
        self.current = self.edition("new", "current")
        self.old = self.edition("old", "historical")
        self.entry = {"landscapeId": "source", "jurisdiction": "DE-NI",
                      "packageScope": {"subject": "Physik", "stage": "SekII", "validity": "2022",
                                       "schoolType": "Gymnasium", "targetLandscapeId": "physics"},
                      "sourcePackages": [self.old, self.current]}

    def write(self, filename, data):
        path = Path("curricula") / filename
        (self.root / path).parent.mkdir(parents=True, exist_ok=True)
        content = data if isinstance(data, bytes) else json.dumps(data).encode()
        (self.root / path).write_bytes(content)
        return {"path": str(path), "sha256": hashlib.sha256(content).hexdigest()}

    def edition(self, name, status):
        extraction = self.write(name + ".json", self.extraction)
        review = self.write(name + "-review.json", {**self.review, "sourceExtractionPath": extraction["path"]})
        return {"id": name, "status": status, "format": "literal-v1", "document": self.pdf,
                "extraction": extraction, "review": review}

    def select(self):
        self.write(str(REGISTRY.relative_to("curricula")), {"version": 1, "entries": [self.entry]})
        return current_packages(self.root)

    def test_selects_one_current_pair(self):
        package, = self.select()
        self.assertEqual(package["review"]["path"], self.current["review"]["path"])
        self.assertEqual(package["extraction"]["path"], self.current["extraction"]["path"])

    def test_two_active_editions(self):
        self.old["status"] = "current"
        with self.assertRaisesRegex(ValueError, "exactly one"):
            self.select()

    def test_zero_current_editions(self):
        self.current["status"] = "draft"
        with self.assertRaisesRegex(ValueError, "exactly one"):
            self.select()

    def test_stale_document_or_component(self):
        for key in ("document", "extraction", "review"):
            with self.subTest(key=key):
                before = copy.deepcopy(self.current[key])
                self.current[key]["sha256"] = "0" * 64
                with self.assertRaisesRegex(ValueError, "Stale"):
                    self.select()
                self.current[key] = before

    def test_orphan_and_missing_decision(self):
        self.decision["sourceGoalId"] = "unknown"
        self.current.update(self.edition("new", "current"))
        with self.assertRaisesRegex(ValueError, "orphaned"):
            self.select()

    def test_incomplete_activation_never_falls_back(self):
        (self.root / self.current["review"]["path"]).unlink()
        with self.assertRaises(FileNotFoundError):
            self.select()

    def test_changed_wording_with_same_id_and_fresh_file_digest(self):
        self.goal["sourceText"] = "Vor dem Körper messen."
        self.current.update(self.edition("new", "current"))
        with self.assertRaisesRegex(ValueError, "Changed reviewed source row"):
            self.select()

    def test_empty_mapped_decision_fails_even_with_consistent_compatibility_rows(self):
        self.decision["canonicalGoalIds"] = []
        self.review["mappings"] = []
        self.current.update(self.edition("new", "current"))
        with self.assertRaisesRegex(ValueError, "Incomplete mapping decision"):
            self.select()

    def test_rebinding_the_extraction_does_not_certify_a_different_page_or_course(self):
        for key, value in (("sourcePage", 92), ("courseLevel", "LK")):
            with self.subTest(key=key):
                self.goal[key] = value
                self.current.update(self.edition("new", "current"))
                with self.assertRaisesRegex(ValueError, "Changed reviewed source row"):
                    self.select()
                del self.goal[key]

    def test_old_decision_span_rejected(self):
        self.decision["sourceSpan"] = "S. 7"
        self.current.update(self.edition("new", "current"))
        with self.assertRaisesRegex(ValueError, "Changed reviewed source row"):
            self.select()


class NiedersachsenConcordanceTest(unittest.TestCase):
    def test_individual_rows_and_links_remain_replayable(self):
        root = Path(__file__).resolve().parents[1]
        evidence = root / "curricula/DE/Gymnasium/quality/source-reextraction/physik/ni-kc2022-20261126-v1"
        record = json.loads((evidence / "concordance.json").read_text())
        historical = json.loads(checked_file(root, record["predecessor"]))
        original_review = json.loads(checked_file(root, record["predecessorReview"]))
        successor = json.loads(checked_file(root, record["successor"]))
        checked_file(root, record["successorReview"])
        by_id = {row["id"]: row for row in historical["sourceGoals"]}
        previous_decisions = {d["sourceGoalId"]: d for d in original_review["decisions"]}
        new_ids = {row["id"] for row in successor["sourceGoals"]}
        previous_pairs = {(m["legacyGoalId"], m["canonicalGoalId"]) for m in original_review["mappings"]}
        transitions = record["decisions"]
        self.assertEqual({row["oldSourceGoalId"] for row in transitions}, set(by_id))
        self.assertEqual(len(transitions), len(by_id))
        actual_pairs = set()
        for transition in transitions:
            key = transition["oldSourceGoalId"]
            self.assertEqual(transition["oldSourceGoalSha256"], row_hash(by_id[key]))
            self.assertEqual(transition["oldMappingDecisionSha256"], row_hash(previous_decisions[key]))
            self.assertTrue(set(transition["successorIds"]) <= new_ids)
            self.assertFalse(transition["contextOrAliasKeys"])
            actual_pairs.update((key, link["goalId"]) for link in transition["priorLinks"])
        self.assertEqual(actual_pairs, previous_pairs)
        registry = json.loads((root / REGISTRY).read_text())
        entry = next(item for item in registry["entries"] if item["landscapeId"] == successor["sourceLandscapeId"])
        edition = next(item for item in entry["sourcePackages"] if item["extraction"] == record["successor"])
        self.assertEqual(edition["review"], record["successorReview"])
        validate_edition(root, entry, edition)


if __name__ == "__main__":
    unittest.main()
