# SPDX-License-Identifier: Apache-2.0
"""Record an actual normal prepare/check command, without review generation."""
import json
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

OWN = Path(__file__).resolve().parents[1]
REPO = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip())
REL = OWN.relative_to(REPO).as_posix()
HOST = REPO / "tmp/chemie-resume-20261015/remaining10-native-host"
mode = sys.argv[1]
assert mode in ("prepare", "check")
command = ["node_modules/.bin/tsx", "scripts/materializeGoalDescriptionRolloutBatch.ts", mode, "--config", REL + "/config/native10.current419.normal-prepare-only.config.json"]
started = datetime.now(timezone.utc).isoformat()
start = time.monotonic()
result = subprocess.run(command, cwd=HOST / "app", text=True, capture_output=True)
prefix = OWN / ("receipts/native10." + mode)
Path(str(prefix) + ".stdout.txt").write_text(result.stdout)
Path(str(prefix) + ".stderr.txt").write_text(result.stderr)
receipt = {"schemaVersion": 1, "role": "actual technical stock execution only", "command": command, "cwd": (HOST / "app").relative_to(REPO).as_posix(), "startedAtUTC": started, "finishedAtUTC": datetime.now(timezone.utc).isoformat(), "elapsedSeconds": time.monotonic()-start, "exitCode": result.returncode, "reviewGenerationPerformed": False, "scientificApprovalsCreated": 0, "activeWrites": False}
Path(str(prefix) + ".actual.json").write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(receipt))
print(result.stdout)
if result.stderr:
    print(result.stderr, file=sys.stderr)
sys.exit(result.returncode)
