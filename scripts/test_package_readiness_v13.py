#!/usr/bin/env python3
"""Readiness version selection must preserve every original acceptance gate."""
from __future__ import annotations

import copy
import subprocess
import unittest
from pathlib import Path
from unittest.mock import patch

import evaluate_curriculum_package_readiness as readiness
import generate_curriculum_package_v13_readiness as generated


class ReadinessV13Test(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.base = readiness.trusted_contracts()
        cls.current = readiness.trusted_contracts(generated.TARGET)

    def test_reproducible_policy_keeps_all_original_gates(self):
        for path, expected in generated.generated_documents().items():
            self.assertEqual(path.read_bytes(), expected)
        self.assertEqual(self.current.policy["requiredChecks"], self.base.policy["requiredChecks"])
        self.assertEqual(self.base.policy["consumerSmokeRunner"]["path"], "scripts/run_package_consumer_smoke.py")
        self.assertEqual(self.base.policy["consumerSmokeRunner"]["version"], "1.0.0")
        self.assertEqual(self.current.policy["consumerSmokeRunner"]["path"], "scripts/run_package_consumer_smoke_v13.py")
        self.assertEqual(self.current.policy["consumerSmokeRunner"]["version"], "1.1.0")
        # Only proof identity changes; no assertion, schema restriction or check disappears.
        normalized = copy.deepcopy(self.current.consumer_report_schema)
        normalized["$id"] = self.base.consumer_report_schema["$id"]
        normalized["properties"]["$schema"]["const"] = self.base.consumer_report_schema["$id"]
        normalized["properties"]["runner"]["properties"]["version"]["const"] = "1.0.0"
        self.assertEqual(normalized, self.base.consumer_report_schema)
        self.assertEqual(self.current.policy["target"]["runtimeContractVersion"], "1.3")
        self.assertNotEqual(self.current.policy_path, self.base.policy_path)

    def test_no_arbitrary_or_implicit_extension_selection(self):
        self.assertEqual(readiness.trusted_contracts().profile["profileId"], "full-standalone-v1")
        for directory in (generated.TARGET.parent / "v1.1", generated.TARGET.parent / "v1.2", Path("/tmp/untrusted-readiness")):
            with self.subTest(directory=directory), self.assertRaisesRegex(readiness.ReadinessError, "Unsupported readiness"):
                readiness.trusted_contracts(directory)

    def test_policy_rejects_weakened_or_stale_acceptance(self):
        mutations = {
            "missing human redistribution gate": lambda p: p["requiredChecks"].remove(next(x for x in p["requiredChecks"] if x["id"] == "publication.redistribution-cleared")),
            "nonblocking consumer": lambda p: p["requiredChecks"][-1].update(blocking=False),
            "stale profile hash": lambda p: p["target"]["releaseProfileContract"].update(sha256="0" * 64),
            "false runtime version": lambda p: p["target"].update(runtimeContractVersion="1.0"),
            "different runner": lambda p: p["consumerSmokeRunner"].update(sha256="0" * 64),
            "legacy runner": lambda p: p.update(consumerSmokeRunner=copy.deepcopy(self.base.policy["consumerSmokeRunner"])),
            "arbitrary runner path": lambda p: p["consumerSmokeRunner"].update(path="/tmp/untrusted-runner.py"),
            "legacy consumer schema": lambda p: p.update(consumerSmokeReportSchema=copy.deepcopy(self.base.policy["consumerSmokeReportSchema"])),
        }
        for label, mutate in mutations.items():
            with self.subTest(label=label):
                policy = copy.deepcopy(self.current.policy)
                mutate(policy)
                readiness.assert_policy_rejection(self.current, policy, label)

    def test_legacy_manifest_does_not_become_current_runtime(self):
        report = readiness.evaluate_path(readiness.FIXTURE_DIR / "target-contract-only.manifest.json", "manifest", contracts_dir=generated.TARGET)
        self.assertFalse(report["decision"]["standaloneProfileReady"])
        self.assertNotEqual(report["decision"]["status"], "ready")
        self.assertEqual(report["scope"], "json-full-standalone-v1.3")
        forged = copy.deepcopy(report)
        forged["policy"]["sha256"] = "0" * 64
        with self.assertRaises(readiness.ReadinessError):
            readiness.validate_report_semantics(forged, self.current)

    def test_child_validator_receives_selected_contract(self):
        loaded = readiness.LoadedInput(kind="zip", name="fixture.zip", path=Path("/tmp/fixture.zip"), bytes=1, sha256="0" * 64,
                                       manifest={}, manifest_bytes=b"{}", archive_root="fixture", errors=[])
        with patch.object(readiness.subprocess, "run", side_effect=subprocess.TimeoutExpired("validator", 1)) as run:
            with self.assertRaises(readiness.FullValidatorProcessError):
                readiness.run_full_validator_process(loaded, contracts_dir=generated.TARGET)
        argv = run.call_args.args[0]
        self.assertEqual(argv[argv.index("--contracts-dir") + 1], str(generated.TARGET))


if __name__ == "__main__":
    unittest.main()
