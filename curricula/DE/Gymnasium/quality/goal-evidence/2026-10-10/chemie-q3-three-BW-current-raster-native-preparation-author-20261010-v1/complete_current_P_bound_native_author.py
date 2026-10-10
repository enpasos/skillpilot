# SPDX-License-Identifier: Apache-2.0
"""Complete operative actual P-bound native pages without changing first artifacts."""
from pathlib import Path
import datetime
import hashlib
import json
import shutil
import subprocess
import sys

ROOT = Path.cwd()
DIR = Path(__file__).resolve().parent
PREFIX = DIR.relative_to(ROOT).as_posix()
assert not (DIR / "author.final.freeze.json").exists()
capsule = Path(json.loads((DIR / "checks/completed-normal-current-native-preparation.actual.json").read_text())["temporaryCapsuleDiagnosticOnly"])
tsx = str((ROOT / "app/node_modules/.bin/tsx").resolve())
def bind(path):
    return {"path": path.relative_to(ROOT).as_posix(), "sha256": "sha256:" + hashlib.sha256(path.read_bytes()).hexdigest(), "bytes": path.stat().st_size}
terminals = []
def run(label, argv, cwd):
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    result = subprocess.run(argv, cwd=cwd, capture_output=True, text=True)
    stdout = DIR / f"terminal/{label}.stdout.actual.txt"
    stderr = DIR / f"terminal/{label}.stderr.actual.txt"
    assert not stdout.exists() and not stderr.exists()
    stdout.write_text(result.stdout)
    stderr.write_text(result.stderr)
    row = {"label": label, "argv": argv, "executionCwdDiagnosticOnly": str(cwd), "startedAt": started, "completedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "actualExitCode": result.returncode, "stdout": bind(stdout), "stderr": bind(stderr)}
    terminals.append(row)
    (DIR / f"terminal/{label}.terminal.actual.json").write_text(json.dumps(row, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"label": label, "actualExitCode": result.returncode, "stdoutTail": result.stdout[-2300:], "stderrTail": result.stderr[-1000:]}, ensure_ascii=False), flush=True)
    assert result.returncode == 0, f"Actual failure: {label}"
resume = "--resume-after-contract-fix" in sys.argv
if resume:
    prior = json.loads((DIR / "terminal/normal-current-P-and-portable-BW-contexts.terminal.actual.json").read_text())
    assert prior["actualExitCode"] == 0
    terminals.append(prior)
    before = capsule / "app/scripts/exportGoalBookReviewBundle.ts"
    source_archive = DIR / "checks/normal-tool-sources.before-v2-contract/exportGoalBookReviewBundle.ts"
    source_archive.parent.mkdir(parents=True, exist_ok=True)
    assert not source_archive.exists()
    shutil.copy2(before, source_archive)
    for name in ("app/scripts", "app/src", "contracts"):
        shutil.copytree(ROOT / name, capsule / name, dirs_exist_ok=True, ignore=shutil.ignore_patterns("node_modules", "dist", "__pycache__"))
    tool_paths = ["app/scripts/exportGoalBookReviewBundle.ts", "app/scripts/materializeGoalDescriptionRolloutBatch.ts", "app/scripts/validateGoalDescriptionReviewCampaign.ts", "app/scripts/validateGoalDescriptionReviewCampaignResults.ts", "contracts/goal-description-review/v3/goal-description-review-input.schema.json"]
    rows = []
    for name in tool_paths:
        p = capsule / name
        assert p.read_bytes() == (ROOT / name).read_bytes()
        archive = DIR / "checks/normal-tool-sources.after-v2-contract" / name
        archive.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(p, archive)
        rows.append({"normalToolPath": name, "actualRootAndCopiedCapsuleBytesEqual": True, "actualSourceArchive": bind(archive)})
    (DIR / "checks/actual-copied-normal-v2-export-contract-tool-bindings.actual.json").write_text(json.dumps({"schemaVersion": 1, "beforeActualExporterSource": bind(source_archive), "currentActualNormalToolSources": rows, "positiveProfilesConverted": 0, "actualP3AndPNGBytesChanged": 0, "authorChangedNormalTools": False, "activeWrites": 0}, ensure_ascii=False, indent=2) + "\n")
else:
    run("normal-current-P-and-portable-BW-contexts", [tsx, f"{PREFIX}/prepare_current_P_and_portable_source_contexts.author.mts", "--capsule", str(capsule)], ROOT)
shutil.copytree(DIR, capsule / PREFIX, dirs_exist_ok=True)
config = f"{PREFIX}/native/three.current-P.batch.config.json"
suffix = "-after-generic-v2-contract-fix" if resume else ""
run("normal-native3-current-P-prepare" + suffix, [tsx, "app/scripts/materializeGoalDescriptionRolloutBatch.ts", "prepare", "--config", config], capsule)
run("normal-native3-current-P-check" + suffix, [tsx, "app/scripts/materializeGoalDescriptionRolloutBatch.ts", "check", "--config", config], capsule)
shutil.copytree(capsule / PREFIX / "native/three-current-P", DIR / "native/three-current-P")
(DIR / "checks/completed-normal-current-P-bound-native.actual.json").write_text(json.dumps({"schemaVersion": 1, "terminals": terminals, "actualNativePages": 3, "fullCurrentModelPages": 381, "actualPBoundPages": 3, "actualPortableBWSourceModels": [185, 189], "firstSuccessfulNativeIntermediatePreserved": True, "currentIndependentNativeReviews": 0, "newScientificClosures": 0, "restoredActiveBindings": 0, "strictGain": 0, "activeWrites": 0, "humanApproval": False}, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"completedNormalTerminals": len(terminals), "operativeNativePages": 3, "strictGain": 0, "activeWrites": 0}))
