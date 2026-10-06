"""Run one native prospective integration step in the bounded physical isolate."""
from datetime import datetime, timezone
from pathlib import Path
import json
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
REL = OUT.relative_to(ROOT)
ISO = ROOT / "tmp/biologie-q1-tf-methylation-current-source-consumer-native-isolated-20261005-v3"
assert (ISO / REL).resolve() == ISO / REL
assert (ISO / "app/scripts").resolve() == ISO / "app/scripts"
commands = {
    "prepare": ["app/node_modules/.bin/tsx", "app/scripts/materializeGoalDescriptionRolloutBatch.ts", "prepare", "--config", str(REL / "batch.config.json")],
    "check": ["app/node_modules/.bin/tsx", "app/scripts/materializeGoalDescriptionRolloutBatch.ts", "check", "--config", str(REL / "batch.config.json")],
    "summarize": ["app/node_modules/.bin/tsx", "app/scripts/materializeGoalDescriptionRolloutBatch.ts", "summarize", "--config", str(REL / "batch.config.json"), "--write"],
    "synthesis": ["app/node_modules/.bin/tsx", "app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts", "--config", str(REL / "batch.config.json"), "--authoring", str(REL / "native-finalbook/synthesis-authoring.json"), "--write"],
    "resolutions": ["app/node_modules/.bin/tsx", "app/scripts/materializeGoalDescriptionRolloutResolutions.ts", "--config", str(REL / "batch.config.json"), "--synthesis-manifest", str(REL / "native-finalbook/synthesis-decisions.json"), "--write"],
    "finalize": ["app/node_modules/.bin/tsx", "app/scripts/materializeGoalDescriptionRolloutBatch.ts", "finalize", "--config", str(REL / "batch.config.json"), "--write"],
    "finalize-check": ["app/node_modules/.bin/tsx", "app/scripts/materializeGoalDescriptionRolloutBatch.ts", "finalize", "--config", str(REL / "batch.config.json")],
    "future-biology": ["app/node_modules/.bin/tsx", "app/scripts/reportDeepUnderstandingRollout.ts", "--config=" + str(REL / "future-biology-only.config.json"), "--mode=check", "--format=json"],
}
stage = sys.argv[1]
command = commands[stage]
receipt_path = OUT / ("native-" + stage + ".actual.receipt.json")
assert not receipt_path.exists(), "Keep prior actual run evidence; use a separate continuation stage if needed."
start = datetime.now(timezone.utc).isoformat()
result = subprocess.run(command, cwd=ISO, capture_output=True, text=True)
(OUT / ("native-" + stage + ".stdout.txt")).write_text(result.stdout)
(OUT / ("native-" + stage + ".stderr.txt")).write_text(result.stderr)
receipt = {
    "command": command,
    "cwd": str(ISO),
    "startedAt": start,
    "completedAt": datetime.now(timezone.utc).isoformat(),
    "exitCode": result.returncode,
    "onlyPhysicalInactiveIsolateWrites": True,
    "frozenAuthorAndIndependentInputsWritten": False,
    "validationWaivers": False,
    "humanApproval": False,
    "activeWrites": 0,
    "newStrictClosures": 0,
}
receipt_path.write_text(json.dumps(receipt, indent=2) + "\n")
print(result.stdout[:5000], result.stderr[:5000])
print(json.dumps(receipt))
raise SystemExit(result.returncode)
