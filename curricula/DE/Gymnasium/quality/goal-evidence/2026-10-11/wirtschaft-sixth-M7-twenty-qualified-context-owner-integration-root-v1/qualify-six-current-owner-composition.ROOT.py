import datetime
import hashlib
import json
from pathlib import Path

R = Path(__file__).resolve().parents[7]
Q = R / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11"
O = Path(__file__).resolve().parent
B = Q / "wirtschaft-four-C12-plus-two-source-context-native-owner-composition-INERT-a-v1"
A = Q / "wirtschaft-two-source-native-followers-independent-a-READONLY-v1"


def meta(p):
    b = p.read_bytes()
    return {"path": str(p.relative_to(R)), "sha256": "sha256:" + hashlib.sha256(b).hexdigest(), "bytes": len(b)}


def obj(p):
    return json.loads(p.read_text())


def verify(m):
    assert meta(R / m["path"]) == m, m["path"]


def bindings(v):
    if isinstance(v, dict):
        if {"path", "sha256", "bytes"} <= v.keys():
            verify({k:v[k] for k in ["path", "sha256", "bytes"]})
        for w in v.values():
            bindings(w)
    elif isinstance(v, list):
        for w in v:
            bindings(w)


s = next(B.glob("SEALED*.json"))
j = obj(s)
verify(j["manifest"])
m = obj(R / j["manifest"]["path"])
for x in m["files"]:
    verify(x)
g = obj(B / "actual-combined-six-inputs-original-history-and-current-registry-endguards.READONLY.json")
assert len(g["guards"]) == 871
for x in g["guards"]:
    assert x["wholeBytesExact"] and x["before"] == x["end"]
    verify(x["end"])
a = next(A.glob("SEALED*.json"))
z = obj(a)
for x in z["artifacts"]:
    verify(x)
verify(z["inputsAuthorSeal"])
verify(z["independentMeaningProofConsumed"])
assert (z["originalRecordsWholeScienceExact"], z["originalActualRunsWholeIdentityModelParametersTimeAndBlindnessExact"], z["wholeAcceptedSynthesisScienceExact"], z["nativeStandalonePASS"]) == (4,4,2,2)
verify(j["candidateRegistry"])
verify(j["nativeActualOnceProbe"])
verify(j["beforeRegistry"])
base = obj(R / j["beforeRegistry"]["path"])
candidate = obj(R / j["candidateRegistry"]["path"])
assert {k:v for k,v in base.items() if k != "subjects"} == {k:v for k,v in candidate.items() if k != "subjects"}
assert [v for v in base["subjects"] if v["subject"] != "wirtschaftswissenschaften"] == [v for v in candidate["subjects"] if v["subject"] != "wirtschaftswissenschaften"]
e = next(v for v in base["subjects"] if v["subject"] == "wirtschaftswissenschaften")
c = next(v for v in candidate["subjects"] if v["subject"] == "wirtschaftswissenschaften")
for k in e:
    if k in ["resolutionIndexPaths", "resolutionSupersessions"]:
        assert c[k][:len(e[k])] == e[k] and len(c[k]) - len(e[k]) == 6
    else:
        assert c[k] == e[k], k
ind = obj(B / "actual-five-indirect-gains-existing-qualified-whole-context-and-owner-reuse.READONLY.json")["individualIndirectGains"]
assert len(ind) == 5
for x in ind:
    assert x["wholeCurrentGoalDEENAndPExactToExistingQualifiedOwner"]
    verify(x["currentTerminalOwnerIndex"])
    verify(x["currentResolution"])
    bindings(x["existingScientificAndContextQualificationReused"])
assert j["actualExit"] == 0 and j["inertCandidateD"] == 300 and j["currentQualifiedD"] == 291 and not j["loss"]
value = {
    "recordedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "actualReviewer": "/root; current Codex assistant; exact model revision not exposed",
    "status": "KEEP-qualified-six-native-owners-conditional-nine-gains-currentRegistryUnchanged",
    "combinedSixAuthorSeal": meta(s), "actualCombinedArtifactsVerified": len(m["files"]),
    "actual871CurrentInputAndOriginalHistoryGuardsVerified": True,
    "PlanTwoIndependentTechnicalSeal": meta(a),
    "RootFourIndependentTechnicalReceipt": meta(O / "01-actual-independent-root-four-C12-native-containers-whole-science-preserved-current-context-qualified.receipt.json"),
    "RootTwoProjectCurrentMeaningQualification": meta(Q / "wirtschaft-current267-plus-qualified-contexts-stable-integration-root-v1/03-actual-root-two-project-context-whole-meaning-consumption-not-native-closure.receipt.json"),
    "actualInertMeasurement": j["nativeActualOnceProbe"], "baselineStrict": 291,
    "inertStrictCandidate": 300, "conditionalNetGain": 9,
    "conditionalNewScientificStrictClosures": ["648224f4-cc8f-5f41-9cae-6d783cd1ae77"],
    "conditionalRestoredStrictBindings": sorted(set(j["actualGainedIds"]) - {"648224f4-cc8f-5f41-9cae-6d783cd1ae77"}),
    "fourOtherIndirectContexts": "2a8/995/bd9/c7b unchanged wholeGoal/P/page/neighbors already meaning-qualified in C49 and independently bound ca109; actual retained metadata verified, no historical science review restart",
    "wholeForeignRegistryAndOriginal67Index161SupersessionPrefixesExact": True,
    "remainingTwoSharedIndexBlockers": j["remainingOwnSharedIndexBlockers"],
    "actualIntegratedStrictGain": 0, "newDescriptionReviewExecutions": 0,
    "humanApprovalClaim": False, "activeWrites": 0,
}
p = O / "02-actual-root-six-owner-composition-and-five-qualified-indirect-contexts-current291-conditional300.receipt.json"
assert not p.exists()
p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
assert obj(p) == value
print(json.dumps({"status": "PASS", "conditionalGain": 9, "currentStrictUnchanged": 291, "actual871InputGuards": True}))
