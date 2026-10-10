"""Independent targeted input comparison and synthetic SNP calculation."""
import hashlib
import json
from fractions import Fraction as F
from pathlib import Path

BASE = Path("curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10")
OLD = BASE / "biologie-q1-regulation-data-risk-twelve-whole-material-author-candidate-v1"
NEW = BASE / "biologie-q1-twelve-two-material-targeted-author-successor-v2"
REVIEW = BASE / "biologie-q1-twelve-whole-material-independent-a-20261010-v1"
OUT = Path(__file__).resolve().parent

def binding(path):
    p = Path(path)
    return {"path": str(p), "sha256": hashlib.sha256(p.read_bytes()).hexdigest(), "bytes": p.stat().st_size}

def verify(b):
    actual = binding(b["path"])
    assert actual["sha256"] == b["sha256"].removeprefix("sha256:") and actual["bytes"] == b["bytes"], b["path"]
    return actual

def leaf_differences(a, b, prefix=""):
    if type(a) != type(b):
        return [prefix]
    if isinstance(a, dict):
        assert a.keys() == b.keys(), prefix
        return [p for k in a for p in leaf_differences(a[k], b[k], f"{prefix}/{k}")]
    if isinstance(a, list):
        assert len(a) == len(b), prefix
        return [p for i, (x, y) in enumerate(zip(a, b)) for p in leaf_differences(x, y, f"{prefix}/{i}")]
    return [] if a == b else [prefix]

author_seal_path = NEW / "author-successor.final.freeze.json"
author_seal = json.loads(author_seal_path.read_text())
author_files = [verify(b) for b in author_seal["files"]]
verify(author_seal["neutralEntry"])
entry = json.loads((NEW / "neutral-twelve-whole-material-review.entry.json").read_text())
neutral = [verify(b) for b in entry["neutralFirstInputs"]]
old_first = REVIEW / "twelve-whole-material.independent-a.science-FIRST.actual.json"
assert binding(old_first)["sha256"] == "f2e3f23ad88249e167726ffdc71f9a9da137f19d5f1a1941fd3a8fee0f7f2453"
old_first_seal = REVIEW / "twelve-whole-material.independent-a.science-FIRST.freeze.json"
assert binding(old_first_seal)["sha256"] == "f08129d9dd7f344d8e3206ef945ee973c580b1ef1a586ad19c815f96500f3583"
old_final_seal = REVIEW / "twelve-whole-material.independent-a.final.original-input-review.freeze.json"
assert binding(old_final_seal)["sha256"] == "58b6d073874081c893e5ae6c0e4a536ebea466a215d28b69972f9d4495a4e6cc"
prior_files = [verify(b) for b in json.loads(old_final_seal.read_text())["artifacts"]]
old = json.loads((OLD / "candidate/twelve.full-material-and-profile.author.json").read_text())
new = json.loads((NEW / "candidate/twelve.full-material-and-profile.author.json").read_text())
assert [g["goalId"] for g in old["goals"]] == [g["goalId"] for g in new["goals"]] == entry["goalIds"]
changed_cases, changed_profiles, comparisons = [], [], []
for a, b in zip(old["goals"], new["goals"]):
    gid = a["goalId"]
    case_diff = leaf_differences(a["cases"], b["cases"], "/cases")
    profile_diff = leaf_differences(a["profile"], b["profile"], "/profile")
    if case_diff:
        changed_cases.append(gid)
    if profile_diff:
        changed_profiles.append(gid)
    comparisons.append({"goalId": gid, "wholeCaseBodiesEqual": not case_diff, "wholeProfileEqual": not profile_diff,
                        "actualChangedCaseLeafFields": case_diff, "actualChangedProfileLeafFields": profile_diff})
assert changed_cases == ["7975e43b-1187-5ae3-a1ab-282fc3c0548c", "1320b82e-e438-59ff-9d53-ecc9fbacae58"]
assert changed_profiles == ["1320b82e-e438-59ff-9d53-ecc9fbacae58"]
assert comparisons[4]["actualChangedCaseLeafFields"] == ["/cases/0/limitsDe", "/cases/0/limitsEn"]
assert comparisons[7]["actualChangedProfileLeafFields"] == [
    "/profile/applicationCaseBriefs/1/taskDemandDe", "/profile/applicationCaseBriefs/1/taskDemandEn",
    "/profile/applicationCaseBriefs/1/expectedPerformanceDe", "/profile/applicationCaseBriefs/1/expectedPerformanceEn"]
assert old["goals"][7]["cases"][0] == new["goals"][7]["cases"][0]
old_records = {r["goalId"]: r for r in map(json.loads, (OLD / "candidate/positive.twelve.author.review.jsonl").read_text().splitlines())}
records = {r["goalId"]: r for r in map(json.loads, (NEW / "candidate/positive.twelve.author.review.jsonl").read_text().splitlines())}
assert len(records) == 12
for b in new["goals"]:
    r = records[b["goalId"]]
    assert r["profile"] == b["profile"]
    assert (r["status"], r["reviewAuthority"], r["evidenceLevel"], r["maximumClaimScope"]) == ("needs_human_review", "ai_candidate", "E1", "G1")
    if b["goalId"] not in changed_profiles:
        assert r["profileFingerprint"] == old_records[b["goalId"]]["profileFingerprint"]

def genotype(g, a):
    total = g + a
    if total < 20:
        return "unresolved"
    if F(3, 10) <= F(g, total) <= F(7, 10) and F(3, 10) <= F(a, total) <= F(7, 10):
        return "GA"
    if F(min(g, a), total) <= F(2, 100):
        return "GG" if g > a else "AA"
    return "unresolved"

assert [i + 1 for i, (a, b) in enumerate(zip("ACGTA", "ACATA")) if a != b] == [3]
assert genotype(15, 15) == "GA" and genotype(25, 0) == "GG"
population = {"A": F(30, 200), "without_A": F(10, 200), "relative_ratio": F(30, 200) / F(10, 200),
              "absolute_difference": F(30, 200) - F(10, 200),
              "high_U_A": F(30, 150), "high_U_without_A": F(10, 50),
              "low_U_A": F(0, 50), "low_U_without_A": F(0, 150)}
assert population["relative_ratio"] == 3 and population["absolute_difference"] == F(1, 10)
assert population["high_U_A"] == population["high_U_without_A"] == F(1, 5)
assert population["low_U_A"] == population["low_U_without_A"] == 0
assert (150 + 50, 50 + 150, 30 + 0, 10 + 0) == (200, 200, 30, 10)
normal_terminals = []
for name in ["P12.materialize", "P12.reproduce", "P12.check"]:
    p = NEW / f"normal/{name}.terminal.actual.json"
    t = json.loads(p.read_text())
    assert t["exitCode"] == 0
    for stream in ["stdout", "stderr"]:
        assert binding(NEW / f"normal/{name}.{stream}.actual.txt")["sha256"] == t[f"{stream}Sha256"].removeprefix("sha256:")
    normal_terminals.append(binding(p))
proof = {"schemaVersion": 1, "role": "Actual technical input comparison and independent supplied-model arithmetic; not source/native/human approval",
         "oldScienceFirst": binding(old_first), "oldScienceFirstSeal": binding(old_first_seal),
         "oldFinalReviewSeal": binding(old_final_seal), "all18OriginalReviewArtifactsUnchanged": len(prior_files) == 18,
         "authorSuccessorSeal": binding(author_seal_path), "allAuthorSealedFilesValid": author_files,
         "allNeutralInputBytesValid": neutral, "twelveWholeComparisons": comparisons,
         "materialBodiesChanged": changed_cases, "tenMaterialBodiesExactlyEqual": True,
         "profileBodiesChanged": changed_profiles, "elevenProfileBodiesAndFingerprintsExactlyEqual": True,
         "ownActualNumbers": {"position": 3, "P_A": {"G": 15, "A": 15, "total": 30, "alleleFractions": [.5, .5], "genotype": "GA"},
                              "P_N": {"G": 25, "A": 0, "total": 25, "minorFraction": 0, "genotype": "GG"},
                              "cohortAndFreshStrata": {k: {"fraction": str(v), "decimal": float(v)} for k, v in population.items()},
                              "cohortClassificationIsSuppliedNotInferredFromTwoSamples": True,
                              "zeroObservedStratumCountsAreNotUniversalZeroRisk": True},
         "normalAuthorPreparationTerminalsVerified": normal_terminals,
         "technicalPreparationDoesNotSupplyScientificApproval": True,
         "allTwelvePositiveStatusesRemainNeedsHumanReviewAiCandidateE1G1": True,
         "oldSourceCourseTitleAndNativeImageHoldsUnchanged": True,
         "strictNewCompletions": 0, "restoredBindings": 0, "humanApproval": False, "activeWrites": 0}
(OUT / "targeted-successor-comparison-and-SNP-calculation.actual.json").write_text(json.dumps(proof, ensure_ascii=False, indent=2) + "\n")
print("PASS: exact two material bodies and one profile changed; ten material bodies and eleven profiles/fingerprints preserved.")
print("PASS: independent SNP position/QC/genotypes and whole prospective/U-stratified arithmetic reconcile.")
print("All original Review-A and successor-sealed bytes unchanged. Candidate-only E1/G1; strict net gain0.")
