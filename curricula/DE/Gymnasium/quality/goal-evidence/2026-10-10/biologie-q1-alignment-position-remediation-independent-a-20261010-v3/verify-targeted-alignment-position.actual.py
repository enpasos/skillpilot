"""Independent A: exact retention and supplied alignment/trim arithmetic.

The current author's diagnoses and other current reviewer findings are not read.
"""
import hashlib
import json
import re
from fractions import Fraction
from pathlib import Path

BASE = Path("curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10")
OLD = BASE / "biologie-q1-twelve-two-material-targeted-author-successor-v2"
NEW = BASE / "biologie-q1-twelve-alignment-position-targeted-author-successor-v3"
FIRST = BASE / "biologie-q1-twelve-whole-material-independent-a-20261010-v1"
PRIOR = BASE / "biologie-q1-two-material-remediation-independent-a-20261010-v2"
OUT = Path(__file__).resolve().parent
GOAL = "ed4cf96f-e1c9-5784-97f2-8279ff5a31b1"


def binding(path):
    path = Path(path)
    assert path.is_file() and not path.is_symlink(), path
    data = path.read_bytes()
    return {"path": str(path), "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}


def verify(value):
    actual = binding(value["path"])
    assert actual["sha256"] == value["sha256"].removeprefix("sha256:"), value["path"]
    assert actual["bytes"] == value["bytes"], value["path"]
    return actual


def differences(a, b, path=""):
    assert type(a) == type(b), path
    if isinstance(a, dict):
        assert a.keys() == b.keys(), path
        return [leaf for key in a for leaf in differences(a[key], b[key], f"{path}/{key}")]
    if isinstance(a, list):
        assert len(a) == len(b), path
        return [leaf for index, (x, y) in enumerate(zip(a, b))
                for leaf in differences(x, y, f"{path}/{index}")]
    return [] if a == b else [path]


def match(pattern, text):
    value = re.search(pattern, text)
    assert value is not None, pattern
    return value.groups()


def number(value):
    return {"fraction": str(value), "decimal": float(value)}


author_seal = json.loads((NEW / "author-successor.final.freeze.json").read_text())
author_bindings = [verify(value) for value in author_seal["files"]]
verify(author_seal["neutralEntry"])
entry = json.loads((NEW / "neutral-twelve-whole-material-review.entry.json").read_text())
neutral_bindings = [verify(value) for value in entry["neutralFirstInputs"]]
original_first = FIRST / "twelve-whole-material.independent-a.science-FIRST.actual.json"
original_first_seal = FIRST / "twelve-whole-material.independent-a.science-FIRST.freeze.json"
original_final_seal = FIRST / "twelve-whole-material.independent-a.final.original-input-review.freeze.json"
prior_final_seal = PRIOR / "two-material-remediation.independent-a.final.freeze.json"
assert binding(original_first)["sha256"] == "f2e3f23ad88249e167726ffdc71f9a9da137f19d5f1a1941fd3a8fee0f7f2453"
assert binding(original_first_seal)["sha256"] == "f08129d9dd7f344d8e3206ef945ee973c580b1ef1a586ad19c815f96500f3583"
assert binding(original_final_seal)["sha256"] == "58b6d073874081c893e5ae6c0e4a536ebea466a215d28b69972f9d4495a4e6cc"
assert binding(prior_final_seal)["sha256"] == "42a275d1b941932d347cf44082541bdb355478561a6bf35d1f53cc91e8aecdb2"
preserved_review_bindings = []
for seal_path in [original_final_seal, prior_final_seal]:
    seal = json.loads(seal_path.read_text())
    preserved_review_bindings.extend(verify(value) for value in seal["artifacts"])
old = json.loads((OLD / "candidate/twelve.full-material-and-profile.author.json").read_text())
new = json.loads((NEW / "candidate/twelve.full-material-and-profile.author.json").read_text())
assert [goal["goalId"] for goal in old["goals"]] == [goal["goalId"] for goal in new["goals"]] == entry["goalIds"]
comparisons = []
for before, after in zip(old["goals"], new["goals"]):
    case_fields = differences(before["cases"], after["cases"], "/cases")
    profile_fields = differences(before["profile"], after["profile"], "/profile")
    comparisons.append({"goalId": before["goalId"], "wholeCasesUnchanged": not case_fields,
                        "wholeProfileUnchanged": not profile_fields,
                        "changedMaterialFields": case_fields, "changedProfileFields": profile_fields})
assert [value["goalId"] for value in comparisons if value["changedMaterialFields"]] == [GOAL]
assert [value["goalId"] for value in comparisons if value["changedProfileFields"]] == [GOAL]
goal = next(value for value in new["goals"] if value["goalId"] == GOAL)
before = next(value for value in old["goals"] if value["goalId"] == GOAL)
assert goal["cases"][0] == before["cases"][0]
changed = next(value for value in comparisons if value["goalId"] == GOAL)
assert set(changed["changedMaterialFields"]) == {
    f"/cases/1/{field}{language}" for language in ["De", "En"]
    for field in ["material", "task", "workedSolution", "freshTransfer", "freshTransferSolution"]}
assert set(changed["changedProfileFields"]) == {
    f"/profile/applicationCaseBriefs/1/{field}{language}" for language in ["De", "En"]
    for field in ["taskDemand", "expectedPerformance"]}
old_records = {value["goalId"]: value for value in map(json.loads, (OLD / "candidate/positive.twelve.author.review.jsonl").read_text().splitlines())}
new_records = {value["goalId"]: value for value in map(json.loads, (NEW / "candidate/positive.twelve.author.review.jsonl").read_text().splitlines())}
assert len(old_records) == len(new_records) == 12
for value in new["goals"]:
    record = new_records[value["goalId"]]
    assert record["profile"] == value["profile"]
    assert [record[key] for key in ["status", "reviewAuthority", "evidenceLevel", "maximumClaimScope"]] == ["needs_human_review", "ai_candidate", "E1", "G1"]
    if value["goalId"] != GOAL:
        assert record["profileFingerprint"] == old_records[value["goalId"]]["profileFingerprint"]

case = goal["cases"][1]
profile = goal["profile"]
for language in ["De", "En"]:
    brief = profile["applicationCaseBriefs"][1]
    assert brief[f"taskDemand{language}"] == case[f"task{language}"]
    assert brief[f"expectedPerformance{language}"] == case[f"workedSolution{language}"]
assert {rubric["id"] for rubric in case["rubric"]} == {"alignment", "quality", "transfer"}
assert [value["id"] for value in profile["expectations"]] == ["alignment", "quality", "transfer"]
assert profile["coverageExpectations"] == before["profile"]["coverageExpectations"]

material = case["materialEn"]
query_length = int(match(r"query has (\d+) bases", material)[0])
u_start, u_end, u_count, u_identity, u_e = match(
    r"Hit U aligns only original positions (\d+)–(\d+) without gaps: (\d+) aligned positions, including (\d+) identities, E=([^\s.]+)\.", material)
u_start, u_end, u_count, u_identity = map(int, [u_start, u_end, u_count, u_identity])
r_start, r_end, r_count, r_identity, r_e = match(
    r"Hit R aligns only positions (\d+)–(\d+): (\d+) aligned positions, (\d+) identities, E=([^\s]+) without", material)
r_start, r_end, r_count, r_identity = map(int, [r_start, r_end, r_count, r_identity])
trim_start, trim_end = map(int, match(r"only original positions (\d+)–(\d+) come from", material))
retained_start, retained_end, declared_new_length = map(int, match(
    r"trimmed query comprises original positions (\d+)–(\d+) and has (\d+) bases", material))
old_positions = set(range(1, query_length + 1))
removed_positions = set(range(trim_start, trim_end + 1))
remaining_positions = sorted(old_positions - removed_positions)
u_positions = set(range(u_start, u_end + 1))
assert u_end - u_start + 1 == u_count == len(u_positions)
assert r_end - r_start + 1 == r_count
assert remaining_positions == list(range(retained_start, retained_end + 1))
assert len(remaining_positions) == declared_new_length == 110
u_removed = sorted(u_positions & removed_positions)
assert u_removed == []
renumbering = {position: index + 1 for index, position in enumerate(remaining_positions)}
new_u_start, new_u_end = renumbering[u_start], renumbering[u_end]
assert (new_u_start, new_u_end) == (21, 105)
assert new_u_end - new_u_start + 1 == u_count == 85
ratios = {"R_identity": Fraction(r_identity, r_count), "R_pretrim_coverage": Fraction(r_count, query_length),
          "U_identity": Fraction(u_identity, u_count), "U_pretrim_coverage": Fraction(u_count, query_length),
          "U_posttrim_coverage": Fraction(u_count, len(remaining_positions))}
assert ratios["R_pretrim_coverage"] == Fraction(1, 4)
assert ratios["U_pretrim_coverage"] == Fraction(17, 24)
assert ratios["U_posttrim_coverage"] == Fraction(17, 22)
assert ratios["U_identity"] == Fraction(16, 17)
assert Fraction(u_e) == Fraction(1, 10**12)
assert "original untrimmed 120-base query" in case["freshTransferEn"]
assert "approximately tenfold larger" in case["freshTransferEn"]
assert "unchanged alignment score yields approximately tenfold E-value" in case["freshTransferEn"]
assert "trimming and a filter change are not performed at the same time" in case["freshTransferEn"]
new_e = 10 * Fraction(u_e)
assert new_e == Fraction(1, 10**11)
assert "not an actually recalculated BLAST value" in case["freshTransferSolutionEn"]
assert "new post-trimming E-value is not supplied" in case["materialEn"]

# Read adjacent unchanged case as context; compute its explicitly supplied count
# and gap-score convention without claiming a new BLAST execution.
context = goal["cases"][0]
reference, query = match(r"reference ([ACGT]+); query ([ACGT]+),", context["materialEn"])
mismatches = [index + 1 for index, pair in enumerate(zip(reference, query)) if pair[0] != pair[1]]
assert len(reference) == len(query) == 12 and mismatches == [5]
gap_ref, gap_query = match(r"reference ([ACGT-]+); query ([ACGT-]+)\.", context["freshTransferEn"])
assert len(gap_ref) == len(gap_query) == 13
identity_count = sum(a == b and a != "-" for a, b in zip(gap_ref, gap_query))
gap_count = sum(a == "-" or b == "-" for a, b in zip(gap_ref, gap_query))
mismatch_count = 13 - identity_count - gap_count
assert (identity_count, gap_count, mismatch_count) == (12, 1, 0)
assert 2 * identity_count - mismatch_count - 2 * gap_count == 22

normal_terminals = []
for name in ["P12.materialize", "P12.reproduce", "P12.check"]:
    path = NEW / f"normal/{name}.terminal.actual.json"
    terminal = json.loads(path.read_text())
    assert terminal["exitCode"] == 0
    for stream in ["stdout", "stderr"]:
        assert binding(NEW / f"normal/{name}.{stream}.actual.txt")["sha256"] == terminal[f"{stream}Sha256"].removeprefix("sha256:")
    normal_terminals.append(binding(path))
proof = {"schemaVersion": 1, "role": "Independent supplied-data arithmetic and exact retention; no source/native/human approval",
         "goalId": GOAL, "caseId": case["id"], "actualNeutralInputs": neutral_bindings,
         "actualAuthorSealFilesVerifiedOnlyForIntegrity": author_bindings,
         "originalFirst": binding(original_first), "originalFirstSeal": binding(original_first_seal),
         "originalFinalReviewSeal": binding(original_final_seal), "priorSnpOperonReviewSeal": binding(prior_final_seal),
         "allPriorReviewArtifactBindingsUnchanged": preserved_review_bindings,
         "actualWholeTwelveRetentionComparison": comparisons,
         "elevenWholeMaterialsProfilesAndProfileFingerprintsUnchanged": True,
         "changedProfileBriefExactlyMatchesCurrentCase": True,
         "actualParsedCoordinateInputs": {"queryLength": query_length, "R": [r_start, r_end, r_count, r_identity, r_e],
             "U": [u_start, u_end, u_count, u_identity, u_e], "removedOriginalPositions": sorted(removed_positions),
             "retainedOriginalRange": [retained_start, retained_end], "newQueryLength": len(remaining_positions)},
         "actualIndependentCalculation": {"removedUPositions": u_removed, "newUStart": new_u_start, "newUEnd": new_u_end,
             "retainedUPositions": u_count, "retainedIdentities": u_identity,
             "ratios": {key: number(value) for key, value in ratios.items()},
             "isolatedDatabaseVariationE": number(new_e), "trimOnlyNewEInferred": False,
             "contextMismatchPositions": mismatches, "contextGapIdentity": number(Fraction(identity_count, 13)), "contextGapScore": 22},
         "normalAuthorPreparationTerminalsVerified": normal_terminals,
         "normalPreparationNotScientificApproval": True,
         "currentAuthorDeltaDiagnosisRead": False, "otherCurrentReviewerVerdictsRead": False,
         "strictNetGain": 0, "activeWrites": 0, "humanApproval": False}
path = OUT / "alignment-position-retention-and-recalculation.actual.json"
with path.open("x") as stream:
    json.dump(proof, stream, indent=2, ensure_ascii=False)
    stream.write("\n")
print("PASS: one case body and one profile changed; eleven whole materials/profiles/fingerprints and previous A proofs exact.")
print("PASS: U31–115 survives trim1–10, renumbers21–105, coverage85/120→85/110, identities80/85 unchanged.")
print("PASS: isolated original-query database-only variation gives supplied approximate E1e-12→1e-11; no posttrim E inferred.")
