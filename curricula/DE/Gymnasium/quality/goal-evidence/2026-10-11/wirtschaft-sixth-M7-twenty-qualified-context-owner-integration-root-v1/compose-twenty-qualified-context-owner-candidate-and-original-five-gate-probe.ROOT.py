"""Compose disjoint native owner deltas; probe without activating or claiming closure."""
import copy
import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time

R = Path(__file__).resolve().parents[7]
O = Path(__file__).resolve().parent
Q = R / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11"
REG = R / "curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json"
SIX = Q / "wirtschaft-four-C12-plus-two-source-context-native-owner-composition-INERT-a-v1/registry-current67-161-plus-four-C12-and-two-qualified-source-native-owners.INERT.config.json"
FOURTEEN = Q / "wirtschaft-fourteen-qualified-source-context-native-owner-followers-AUTHOR-INERT-v1/candidate-current14-only-owner-registry.INERT.config.json"


def obj(p):
    return json.loads(p.read_text())


def meta(p):
    b = p.read_bytes()
    return {"path": str(p.relative_to(R)), "sha256": "sha256:" + hashlib.sha256(b).hexdigest(), "bytes": len(b)}


def write(p, v):
    assert not p.exists(), "Preserve candidate and execution history"
    p.write_text(json.dumps(v, ensure_ascii=False, indent=2) + "\n")
    assert obj(p) == v


baseline_meta = meta(REG)
assert baseline_meta["sha256"] == "sha256:66dc158fbade6384af9c36d8c2b943525d53fb6f1856a7be04c8007509e85bf6"
base = obj(REG)
econ = next(s for s in base["subjects"] if s["subject"] == "wirtschaftswissenschaften")
assert (len(econ["resolutionIndexPaths"]), len(econ["resolutionSupersessions"])) == (67, 161)
candidate = copy.deepcopy(base)
target = next(s for s in candidate["subjects"] if s["subject"] == "wirtschaftswissenschaften")
for path, expected in [(SIX, (6,6)), (FOURTEEN, (9,13))]:
    raw = obj(path)
    assert {k:v for k,v in raw.items() if k != "subjects"} == {k:v for k,v in base.items() if k != "subjects"}
    assert [s for s in raw["subjects"] if s["subject"] != "wirtschaftswissenschaften"] == [s for s in base["subjects"] if s["subject"] != "wirtschaftswissenschaften"]
    own = next(s for s in raw["subjects"] if s["subject"] == "wirtschaftswissenschaften")
    for key in econ:
        if key in ["resolutionIndexPaths", "resolutionSupersessions"]:
            assert own[key][:len(econ[key])] == econ[key]
        else:
            assert own[key] == econ[key]
    assert len(own["resolutionIndexPaths"]) - 67 == expected[0]
    assert len(own["resolutionSupersessions"]) - 161 == expected[1]
    target["resolutionIndexPaths"] += own["resolutionIndexPaths"][67:]
    target["resolutionSupersessions"] += own["resolutionSupersessions"][161:]
assert len(set(target["resolutionIndexPaths"])) == 82
assert len(target["resolutionSupersessions"]) == 180
assert len({json.dumps(s, sort_keys=True) for s in target["resolutionSupersessions"]}) == 180
snapshot = O / "registry-before-current291.EXACT.json"
assert not snapshot.exists()
snapshot.write_bytes(REG.read_bytes())
full_path = O / "registry.current291-plus-twenty-qualified-context-owner-followers.INERT.config.json"
write(full_path, candidate)
scope = copy.deepcopy(candidate)
scope["subjects"] = [target]
scope_path = O / "economics-only.exact-twenty-owner-candidate-original-five-gate-scope.INERT.config.json"
write(scope_path, scope)
node = Path("/tmp/skillpilot-checkpoint-native-node-path.txt").read_text().strip()
argv = [node, str(R / "app/node_modules/tsx/dist/cli.mjs"), str(R / "app/scripts/reportDeepUnderstandingRollout.ts"), "--config=" + str(scope_path.relative_to(R)), "--mode=check", "--format=json"]
env = dict(os.environ)
env["PATH"] = str(Path(node).parent) + ":" + env["PATH"]
log = O / "actual-original-native-full-economics-five-gate-twenty-owner-candidate.raw.txt"
assert not log.exists()
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
clock = time.monotonic()
with log.open("wb") as f:
    done = subprocess.run(argv, cwd=R, env=env, stdout=f, stderr=subprocess.STDOUT)
assert meta(REG) == baseline_meta, "Active registry changed during candidate probe"
report = obj(log)
assert len(report["subjects"]) == 1
actual = report["subjects"][0]
before = obj(Q / "wirtschaft-current267-plus-qualified-contexts-stable-integration-root-v1/actual-native-current-five-gate-report.raw.txt")
be = next(s for s in before["subjects"] if s["subject"] == "wirtschaftswissenschaften")
gains = sorted(set(actual["strictCompleteGoalIds"]) - set(be["strictCompleteGoalIds"]))
loss = sorted(set(be["strictCompleteGoalIds"]) - set(actual["strictCompleteGoalIds"]))
ready = done.returncode == 0 and actual["denominator"] == 346 and actual["strictComplete"] == 346 and actual["remaining"] == 0 and actual["strictCompletionReady"] and not report["blockingIssueCount"] and all(c["status"] == "pass" for c in actual["requiredChecks"]) and all(n == 346 for n in actual["gates"].values()) and not loss
value = {"recordedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "startedAt": started,
    "status": "PASS-conditional-original-five-gates-346-independent-binding-qualification-still-required" if ready else "FAIL-conditional-original-five-gates-candidate-remains-open",
    "actualArgv": argv, "exitCode": done.returncode, "elapsedSeconds": round(time.monotonic() - clock,3),
    "actualNativeRawReport": meta(log), "activeRegistryStillExact": baseline_meta,
    "fullTwentyCandidateRegistry": meta(full_path), "exactEconomicsOnlyScope": meta(scope_path),
    "beforeStrict": 291, "candidateStrict": actual["strictComplete"], "candidateRemaining": actual["remaining"],
    "requiredChecks": actual["requiredChecks"], "gates": actual["gates"], "actualNativeCandidateReady": ready,
    "actualCandidateGainedGoalIds": gains, "actualCandidateLostGoalIds": loss,
    "nativeOwnerDelta": {"indices": 15, "supersessions": 19, "qualifiedContexts": 20, "fabHasNoInventedOldOwner": True},
    "activeWrites": 0, "integratedStrictGain": 0, "humanApprovalClaim": False,
    "scientificCurrentContextQualification": [meta(O / "02-actual-root-six-owner-composition-and-five-qualified-indirect-contexts-current291-conditional300.receipt.json"), meta(O / "03-actual-root-fourteen-current-source-course-P30-prerequisite-context-meaning-consumption.receipt.json")],
    "independentFourteenNativeWholeSciencePreservationAndIndirectGainQualification": "Pending actual separate A seal; no activation before qualification",
}
write(O / "04-actual-original-five-gate-current291-plus-twenty-inert-candidate.receipt.json", value)
print(json.dumps({"status": value["status"], "exitCode": done.returncode, "strictCandidate": actual["strictComplete"], "remaining": actual["remaining"], "gain": len(gains), "loss": len(loss), "activeWrites": 0}), flush=True)
raise SystemExit(0 if ready else 1)
