# SPDX-License-Identifier: Apache-2.0
import copy
import json
import unittest
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
from semantic_kind_ledger_contracts import semantic_kind_ledger_schema_path, LEDGER_V2_SCHEMA_ID

ROOT = Path(__file__).resolve().parents[1]


class SemanticKindLedgerVersionsTest(unittest.TestCase):
    def setUp(self):
        self.original = json.loads((ROOT / "curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json").read_text())
        self.v2 = copy.deepcopy(self.original)
        self.v2["$schema"] = LEDGER_V2_SCHEMA_ID
        self.v2["ledgerFormatVersion"] = 2
        for decision in self.v2["decisions"]:
            decision["directedQuantityArrows"] = {
                "usage": "notRequired", "representationKinds": ["none"],
                "evidence": {"path": "curricula/DE/Gymnasium/quality/fixture/decision.json", "sha256": "sha256:" + "0" * 64, "entryId": decision["goalId"]},
            }

    def errors(self, value):
        schema = json.loads(semantic_kind_ledger_schema_path(ROOT, value).read_text())
        Draft202012Validator.check_schema(schema)
        return list(Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(value))

    def test_v1_remains_closed_and_v2_requires_typed_decisions(self):
        self.assertEqual(self.errors(self.original), [])
        self.assertEqual(self.errors(self.v2), [])
        missing = copy.deepcopy(self.v2)
        del missing["decisions"][0]["directedQuantityArrows"]
        self.assertTrue(self.errors(missing))
        unknown = copy.deepcopy(self.v2)
        unknown["decisions"][0]["directedQuantityArrows"]["usage"] = "inferredFromImage"
        self.assertTrue(self.errors(unknown))

    def test_a_schema_or_version_mismatch_never_silently_selects_v2(self):
        for field, value in [("ledgerFormatVersion", 1), ("ledgerFormatVersion", 3), ("$schema", "https://example.invalid/untrusted.schema.json")]:
            wrong = copy.deepcopy(self.v2)
            wrong[field] = value
            self.assertTrue(self.errors(wrong), field)


if __name__ == "__main__":
    unittest.main()
