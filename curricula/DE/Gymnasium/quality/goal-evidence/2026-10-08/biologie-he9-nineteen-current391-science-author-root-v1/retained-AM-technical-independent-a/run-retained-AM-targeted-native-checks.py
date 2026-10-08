"""Run the standard scoped checkers; persist actual terminal results locally."""
import hashlib
import json
import subprocess
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[8]
OWN = Path(__file__).resolve().parent


def rel(path):
    return str(path.relative_to(ROOT))


def digest(path):
    data = path.read_bytes()
    return {"path": rel(path), "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}


def write_json(path, value):
    assert not path.exists(), f"Preserve existing actual result: {path}"
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def run(name, script, config, extra):
    args = ["app/node_modules/.bin/tsx", script, "--config=" + rel(OWN / config),
            "--mode=check"] + extra
    before = datetime.now(timezone.utc).isoformat()
    result = subprocess.run(args, cwd=ROOT, capture_output=True)
    stdout, stderr = OWN / f"{name}.native.stdout.actual.txt", OWN / f"{name}.native.stderr.actual.txt"
    assert not stdout.exists() and not stderr.exists()
    stdout.write_bytes(result.stdout)
    stderr.write_bytes(result.stderr)
    receipt = {"artifactKind": "actual-targeted-standard-native-check-terminal-receipt",
               "check": name, "argv": args, "cwd": str(ROOT),
               "startedAt": before, "finishedAt": datetime.now(timezone.utc).isoformat(),
               "exitCode": result.returncode, "stdout": digest(stdout), "stderr": digest(stderr),
               "technicalOnly": True, "activeWrites": False, "newScienceReview": False,
               "strictGainClaimed": 0, "humanApprovalClaimed": False}
    write_json(OWN / f"{name}.native.terminal.actual.json", receipt)
    return receipt


observations = json.loads((OWN / "exact-existing-source-observations.technical.json").read_text())
for binding in observations["observations"]:
    observed = digest(ROOT / binding["snapshotPath"])
    assert observed["sha256"] == binding["sha256"] and observed["bytes"] == binding["bytes"]
    if binding["sourcePath"].startswith(("app/public/data/", "app/scripts/")):
        assert digest(ROOT / binding["sourcePath"])["sha256"] == binding["sha256"]

jobs = [
    ("A19", "app/scripts/semanticAtomicityReview.ts", "A19.exact-retained.native.config.json", []),
    ("M25-cards17-views8", "app/scripts/memoryCardReview.ts",
     "M25-cards17-views8.exact-retained.native.config.json", ["--write-report"]),
]
with ThreadPoolExecutor(max_workers=2) as pool:
    receipts = list(pool.map(lambda job: run(*job), jobs))

post_inputs = []
for binding in observations["observations"]:
    observed = digest(ROOT / binding["snapshotPath"])
    assert observed["sha256"] == binding["sha256"] and observed["bytes"] == binding["bytes"]
    if binding["sourcePath"].startswith(("app/public/data/", "app/scripts/")):
        original = digest(ROOT / binding["sourcePath"])
        assert original["sha256"] == binding["sha256"]
        post_inputs.append({**original, "unchangedBeforeAndAfterNativeChecks": True})

bindings = json.loads((OWN / "required-cards-and-whole-origin-goals.retained.technical.json").read_text())
current = json.loads((ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json").read_text())
by_id = {g["id"]: g for g in current["goals"]}
selected_exact = all(by_id[g["id"]] == g for g in bindings["wholeSelectedGoalRows"])
origins_exact = all(by_id[g["id"]] == g for g in bindings["wholeOriginGoalRows"])
assert selected_exact and origins_exact

write_json(OWN / "completed-A19-M25-cards17-views8.technical.actual.json", {
    "artifactKind": "completed-actual-targeted-retained-AM-cards-visibility-technical-checks",
    "recordedAt": datetime.now(timezone.utc).isoformat(), "reviewer": "/root/flora_fauna_independent_a",
    "technicalOnly": True, "terminalChecks": receipts,
    "nativeUnmodifiedDeckAndCheckerInputsBeforeAndAfter": post_inputs,
    "wholeSelected19ExactlyEqualCurrentCanonicalAfterNativeChecks": selected_exact,
    "wholeEightSharedCardOriginGoalsExactlyEqualCurrentCanonicalAfterNativeChecks": origins_exact,
    "retainedA19": {"atomic": 19, "newScienceJudgments": 0},
    "retainedM19": {"no_memory_needed": 17, "memory_required": 2, "newScienceJudgments": 0},
    "nativeMDependencyClosure": {"ordinaryGoals": 25, "memoryNodes": 1,
                                "primaryCards": 17, "directSelectedCards": 7,
                                "otherSharedDeckCards": 10, "additionalOriginGoals": 6,
                                "standardVisibilityScopes": 8},
    "currentNativeTechnicalChecksPassed": all(r["exitCode"] == 0 for r in receipts),
    "historicalScientificDecisionsAndCardReasonsPreserved": True,
    "newScienceReviews": 0, "newScientificClosures": 0, "strictGainClaimed": 0,
    "humanApprovalClaimed": False, "activeWrites": False,
})
print(json.dumps({"terminalExitCodes": {r["check"]: r["exitCode"] for r in receipts},
                  "wholeCurrentGoalBindingsRetained": selected_exact and origins_exact}))
raise SystemExit(0 if all(r["exitCode"] == 0 for r in receipts) else 1)
