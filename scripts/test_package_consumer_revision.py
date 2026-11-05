#!/usr/bin/env python3
"""Focused protocol and history checks for the shared consumer revision."""
import hashlib
import importlib.util
import json
from pathlib import Path
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("consumer_http", ROOT / "scripts/package_consumer_smoke_http.py")
http = importlib.util.module_from_spec(spec)
spec.loader.exec_module(http)


class ConsumerRevisionTest(unittest.TestCase):
    def test_historical_sources_and_policies_remain_exact(self):
        archive = ROOT / "contracts/curriculum-package/consumer-history/1.0.0"
        manifest = json.loads((archive / "source-manifest.json").read_bytes())
        self.assertEqual(len(manifest["files"]), 7)
        for entry in manifest["files"]:
            raw = (archive / entry["sourcePath"]).read_bytes()
            self.assertEqual(len(raw), entry["bytes"])
            self.assertEqual(hashlib.sha256(raw).hexdigest(), entry["sha256"])
        self.assertEqual(manifest["files"][0]["sha256"],
                         "d0b8721c3830d1e616f9ee7c6053baecc18f67b52f404af4fad93e82bfec3dff")
        old = ROOT / "contracts/curriculum-package/v1/package-consumer-smoke-report.schema.json"
        self.assertEqual(hashlib.sha256(old.read_bytes()).hexdigest(),
                         "948060cb5fb9128edc81d9b2a3554325ebb840a19f537638cf0a30488b74987d")

    def test_choice_uses_current_actions_and_explicit_stage(self):
        first = {"optionId": "first", "kind": "VALUE", "scopeKey": "stage", "scopeValue": "SekI"}
        cross = first | {"optionId": "cross", "scopeValue": "CrossStage"}
        plan = {"stage": "SELECTION", "options": [first, cross],
                "displayOptions": [{"optionId": "never-submit", "kind": "COMPLETE_GROUP"}]}
        self.assertEqual(http.select_personalization_option(plan), cross)
        done = {"optionId": "done", "kind": "COMPLETE_GROUP"}
        self.assertEqual(http.select_personalization_option(plan | {"options": [cross, done]}), done)
        for options in ([], [{"optionId": "bad", "kind": "UNKNOWN"}], [{"kind": "VALUE"}]):
            with self.assertRaises(http.CheckFailure):
                http.select_personalization_option(plan | {"options": options})

    def setup_replies(self, *, initial_count=0, stage="CrossStage", action_status=200):
        def reply(value, status=200):
            return status, value, http.canonical_json(value)
        action = {"optionId": "opaque-action", "kind": "VALUE", "scopeKey": "stage", "scopeValue": "CrossStage"}
        config = {"root": {"stage": stage, "filterId": "DE-HE", "durationModel": "G9"}}
        return [reply({"goals": {"personalized": {"total_atomic": initial_count}}}),
                reply({"goals": []}), reply({"stage": "SELECTION", "options": [action]}),
                reply({"stage": "COMPLETE"}, action_status), reply({"stage": "COMPLETE"}),
                reply({"personalCurriculum": json.dumps(config)}),
                reply({"goals": {"personalized": {"total_atomic": 7}},
                       "learningUnits": {"offerBinding": {"status": "valid"}}})]

    def test_setup_posts_only_the_published_opaque_option(self):
        with patch.object(http, "json_response", side_effect=self.setup_replies()) as requests:
            evidence = http.configure_authored_personalization("learner", {"landscapeId": "root", "personalizationFlow": {"version": "1"}})
        self.assertEqual(evidence["explicitStage"], "CrossStage")
        self.assertEqual(evidence["targetCount"], 7)
        posts = [call for call in requests.call_args_list if call.kwargs.get("method") == "POST"]
        self.assertEqual(len(posts), 1)
        self.assertEqual(posts[0].kwargs["json_body"], {"optionId": "opaque-action"})
        self.assertNotIn("optionId", evidence["choices"][0])

    def test_setup_rejects_unconfigured_targets_missing_stage_and_stale_action(self):
        for kwargs in ({"initial_count": 1}, {"stage": None}, {"action_status": 409}):
            with self.subTest(kwargs=kwargs), patch.object(http, "json_response", side_effect=self.setup_replies(**kwargs)):
                with self.assertRaises(http.CheckFailure):
                    http.configure_authored_personalization("learner", {"landscapeId": "root", "personalizationFlow": {"version": "1"}})

    def test_legacy_base_does_not_get_invented_stage(self):
        with patch.object(http, "json_response") as requests:
            self.assertEqual(http.configure_authored_personalization("learner", {"landscapeId": "root"}),
                             {"setup": "legacy-base-without-authored-flow"})
            requests.assert_not_called()

    def test_recall_fixture_uses_real_transitive_goals(self):
        closure = [{"goals": [{"id": "entry", "type": "cluster"}]}, {"goals": [
            {"id": "orientation", "type": "atomic", "semanticKind": "orientation", "requires": []},
            {"id": "memory", "type": "atomic", "nodeKind": "memory", "requires": ["orientation"], "tags": ["srs-deck:deck"]}]}]
        with self.assertRaises(http.CheckFailure):
            http.select_verified_recall_fixture_pair(closure[0]["goals"], {"deck"})
        goals = [goal for landscape in closure for goal in landscape["goals"]]
        orientation, memory = http.select_verified_recall_fixture_pair(goals, {"deck"})
        self.assertEqual((orientation["id"], memory["id"]), ("orientation", "memory"))
        with self.assertRaises(http.CheckFailure):
            http.select_verified_recall_fixture_pair(goals, {"other-deck"})


if __name__ == "__main__":
    unittest.main()
