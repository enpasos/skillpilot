# SPDX-License-Identifier: Apache-2.0
"""The schema gate holds every canonical memory deck to source format 2."""
import copy
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from validate_schemas import MEMORY_DECK_DIR, validate_memory_decks


ROOT = Path(__file__).resolve().parents[1]
SCHEMA = ROOT / "contracts/memory-deck/v2/memory-deck.schema.json"


class MemoryDeckSchemaTests(unittest.TestCase):
    def setUp(self):
        temporary = TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.deck = {
            "schemaVersion": 2,
            "deckId": "fixture_deck",
            "title": "Fixture",
            "cards": [
                {"id": "c1", "front": "Q1", "back": "A1", "originGoalIds": ["goal-a"], "category": "X", "tags": ["GK"]},
                {"id": "c2", "front": "Q2", "back": "A2", "originGoalIds": ["goal-a", "goal-b"],
                 "tags": ["LK", "goal:goal-b", "goal:goal-a"]},
                {"id": "c3", "front": "Q3", "back": "A3", "tags": ["GK"]},
            ],
        }

    def validate(self, deck, variant=None):
        (self.root / "fixture.de.json").write_text(json.dumps(deck))
        if variant is not None:
            (self.root / "fixture.en.json").write_text(json.dumps(variant))
        return validate_memory_decks(self.root, SCHEMA)

    def changed(self, index, **fields):
        deck = copy.deepcopy(self.deck)
        deck["cards"][index].update(fields)
        return deck

    def test_format_two_deck_with_matching_variant_passes(self):
        self.assertEqual([], self.validate(self.deck, copy.deepcopy(self.deck)))

    def test_version_marker_is_required(self):
        for version in (None, 1, "2"):
            with self.subTest(version=version):
                deck = copy.deepcopy(self.deck)
                if version is None:
                    del deck["schemaVersion"]
                else:
                    deck["schemaVersion"] = version
                self.assertTrue(self.validate(deck))

    def test_origin_goal_ids_are_a_nonempty_distinct_id_list(self):
        for bad in ([], ["goal-a", "goal-a"], [""], [7], "goal-a"):
            with self.subTest(bad=bad):
                self.assertTrue(self.validate(self.changed(0, originGoalIds=bad)))
        misspelled = self.changed(0)
        misspelled["cards"][0]["originGoalId"] = misspelled["cards"][0].pop("originGoalIds")
        self.assertTrue(self.validate(misspelled))

    def test_retired_goal_tags_only_mirror_the_field(self):
        drifted = self.changed(1, tags=["LK", "goal:goal-a"])
        self.assertTrue(any("goal: tags must repeat" in error for error in self.validate(drifted)))
        tag_only = self.changed(2, tags=["GK", "goal:goal-c"])
        self.assertTrue(any("goal: tags must repeat" in error for error in self.validate(tag_only)))

    def test_variant_keeps_cards_and_origins(self):
        variant = self.changed(0, originGoalIds=["goal-b"])
        self.assertTrue(any("differ from its German deck" in error for error in self.validate(self.deck, variant)))
        (self.root / "fixture.de.json").unlink()
        (self.root / "orphan.en.json").write_text(json.dumps(self.deck))
        self.assertTrue(any("without a German deck" in error for error in validate_memory_decks(self.root, SCHEMA)))

    def test_duplicate_card_ids_fail(self):
        deck = copy.deepcopy(self.deck)
        deck["cards"].append(copy.deepcopy(deck["cards"][0]))
        self.assertTrue(any("duplicate card id c1" in error for error in self.validate(deck)))

    def test_repository_decks_pass(self):
        self.assertEqual([], validate_memory_decks(ROOT / MEMORY_DECK_DIR, SCHEMA))


if __name__ == "__main__":
    unittest.main()
