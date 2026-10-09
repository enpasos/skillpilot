# SPDX-License-Identifier: Apache-2.0
"""Capture the ordinary inactive P18 materializer/checker without wider builds."""

import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OUT = Path(__file__).resolve().parent
REL = OUT.relative_to(ROOT).as_posix()
CONFIG = REL + "/whole18-positive.two-material-successor.config.json"
SET = REL + "/whole18-positive-profile-candidate-set.two-material-successor.json"
ACTIVE_PATHS = [
    "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json",
    "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json",
    "curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json",
    "docs/qa-ci/status/curriculum-quality-status.json",
]


def bind(path):
    path = Path(path)
    raw = path.read_bytes()
    return {"path": path.relative_to(ROOT).as_posix(),
            "sha256": "sha256:" + hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}


baseline = [bind(ROOT / path) for path in ACTIVE_PATHS]
commands = [
    ("normal-materialize-P18", ["app/node_modules/.bin/tsx", "app/scripts/materializePositiveGoalEvidenceCandidates.ts",
                               "--config", CONFIG, "--candidates", SET, "--write"]),
    ("normal-check-P18", ["app/node_modules/.bin/tsx", "app/scripts/positiveGoalEvidenceReview.ts",
                         "--config=" + CONFIG, "--mode=check"]),
]
for label, argv in commands:
    target = OUT / "checks" / (label + ".terminal.actual.json")
    assert not target.exists()
    target.parent.mkdir(parents=True, exist_ok=True)
    started = datetime.now(timezone.utc).isoformat()
    result = subprocess.run(argv, cwd=ROOT, capture_output=True)
    stdout_path = target.parent / (label + ".stdout.actual.txt")
    stderr_path = target.parent / (label + ".stderr.actual.txt")
    stdout_path.write_bytes(result.stdout)
    stderr_path.write_bytes(result.stderr)
    final_active = [bind(ROOT / path) for path in ACTIVE_PATHS]
    receipt = {"schemaVersion": 1, "role": "actual ordinary scoped technical check, not independent science approval",
               "argv": argv, "startedAt": started, "finishedAt": datetime.now(timezone.utc).isoformat(),
               "exitCode": result.returncode, "stdout": bind(stdout_path), "stderr": bind(stderr_path),
               "activeBindingsBefore": baseline, "activeBindingsAfter": final_active,
               "activeInputsUnchanged": baseline == final_active,
               "humanApproval": False, "humanTrial": False, "strictGain": 0, "activeWrites": []}
    target.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    assert json.loads(target.read_text()) == receipt
    print(json.dumps({"check": label, "exitCode": result.returncode, "activeInputsUnchanged": baseline == final_active}))
    assert result.returncode == 0 and baseline == final_active
