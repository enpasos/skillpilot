"""Real CLI fixtures for the complete runtime-shaped curriculum UUID surface."""
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True
SCRIPT = Path(__file__).with_name("validate_goal_ids_uuid.py")
OWNER = "synthetic_owner_namespace"
GOAL = "abcdef01-2345-4678-9abc-def012345678"
OTHER = "fedcba98-7654-4321-abcd-ef0123456789"


class GoalIdUuidCliTests(unittest.TestCase):
    def setUp(self):
        self.scratch = tempfile.TemporaryDirectory()
        self.addCleanup(self.scratch.cleanup)
        self.root = Path(self.scratch.name)
        (self.root / "scripts").mkdir()
        (self.root / "curricula").mkdir()
        self.script = self.root / "scripts" / SCRIPT.name
        shutil.copyfile(SCRIPT, self.script)

    def write(self, data, relative="curricula/DE/Gymnasium/canonical/test.de.json"):
        p = self.root / relative
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(json.dumps(data), encoding="utf-8")
        return p

    def landscape(self, goal=None, owner=OWNER):
        return {"landscapeId": owner, "goals": [{"id": GOAL} if goal is None else goal]}

    def cli(self):
        return subprocess.run([sys.executable, "-B", str(self.script)], cwd=self.root,
                              text=True, capture_output=True, timeout=20)

    def assert_fails(self):
        result = self.cli()
        self.assertNotEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertIn("ERROR", result.stdout + result.stderr)
        return result

    def test_canonical_bad_id_is_a_real_cli_failure(self):
        self.write(self.landscape({"id": "not-a-uuid"}))
        self.assertIn("not-a-uuid", self.assert_fails().stdout)

    def test_canonical_uppercase_and_absent_relations_pass(self):
        self.write(self.landscape({"id": GOAL.upper()}))
        result = self.cli()
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertIn("1 files, 1 goals", result.stdout)

    def test_exact_symbolic_owner_and_qualified_uppercase_reference_are_allowed(self):
        # The format checker must not invent an owner-UUID or reference-existence policy.
        self.write(self.landscape({"id": GOAL, "contains": ["another_namespace:" + OTHER.upper()], "requires": [OTHER]}))
        self.assertEqual(0, self.cli().returncode)

    def test_metadata_is_not_a_goal_catalog_and_quality_is_pruned(self):
        self.write(self.landscape())
        self.write({"landscapeId": OWNER, "title": "metadata"}, "curricula/metadata.json")
        invalid = self.root / "curricula/DE/Gymnasium/quality/deep/invalid.json"
        invalid.parent.mkdir(parents=True); invalid.write_text("not json")
        self.assertEqual(0, self.cli().returncode)

    def test_malformed_json_outside_quality_fails_even_without_landscape_shape(self):
        self.write(self.landscape())
        (self.root / "curricula/broken.json").write_text("{")
        self.assert_fails()

    def test_uuid_fullmatch_rejects_newline_and_noncanonical_group_widths(self):
        for value in [GOAL + "\n", " " + GOAL, GOAL + " ", GOAL[:-1], "1-2-3-4-5", None, 4, True]:
            with self.subTest(value=value):
                self.write(self.landscape({"id": value})); self.assert_fails()

    def test_null_and_malformed_goal_entries_fail(self):
        for value in [None, "goal", [], 0, True]:
            with self.subTest(value=value):
                self.write({"landscapeId": OWNER, "goals": [value]}); self.assert_fails()

    def test_null_and_nonlist_relations_fail_but_absence_is_valid(self):
        for field in ["contains", "requires"]:
            for value in [None, "value", {}, 1, False]:
                with self.subTest(field=field, value=value):
                    self.write(self.landscape({"id": GOAL, field: value})); self.assert_fails()

    def test_malformed_reference_elements_and_qualification_fail(self):
        values = [None, 1, False, {}, [], ":" + OTHER, OWNER + ":", OWNER + ":extra:" + OTHER,
                  " " + OWNER + ":" + OTHER, OWNER + " :" + OTHER, OWNER + ":" + OTHER + "\n", OWNER + ":bad"]
        for field in ["contains", "requires"]:
            for value in values:
                with self.subTest(field=field, value=value):
                    self.write(self.landscape({"id": GOAL, field: [value]})); self.assert_fails()

    def test_malformed_landscape_owner_or_goal_collection_fails(self):
        for value in [None, 1, False, "", " owner", "owner ", "owner:extra"]:
            with self.subTest(owner=value):
                self.write(self.landscape(owner=value)); self.assert_fails()
        for value in [None, "goals", {}, 1]:
            with self.subTest(goals=value):
                self.write({"landscapeId": OWNER, "goals": value}); self.assert_fails()

    def test_every_runtime_shaped_directory_counts_without_a_fixed_file_floor(self):
        self.write(self.landscape(), "curricula/new/course/definition.json")
        self.write(self.landscape(), "curricula/old/json/other.json")
        result = self.cli()
        self.assertEqual(0, result.returncode, result.stdout)
        self.assertIn("2 files, 2 goals", result.stdout)

    def test_duplicate_valid_serializations_are_left_to_the_existing_graph_gate(self):
        self.write(self.landscape(), "curricula/canonical/de.json")
        self.write(self.landscape(), "curricula/canonical/en.json")
        self.assertEqual(0, self.cli().returncode)

    def test_duplicate_properties_and_nonfinite_json_are_not_silent_passes(self):
        self.write(self.landscape())
        for text in ['{"id":1,"id":2}', '{"metadata":NaN}']:
            with self.subTest(text=text):
                (self.root / "curricula/malformed.json").write_text(text)
                self.assert_fails()

    def test_no_runtime_landscapes_is_a_failed_scope_check(self):
        self.write({"metadata": True}, "curricula/metadata.json")
        self.assert_fails()

    def test_only_empty_landscapes_cannot_pass_without_checking_any_goal_id(self):
        self.write({"landscapeId": OWNER, "goals": []})
        self.assert_fails()


if __name__ == "__main__":
    unittest.main()
