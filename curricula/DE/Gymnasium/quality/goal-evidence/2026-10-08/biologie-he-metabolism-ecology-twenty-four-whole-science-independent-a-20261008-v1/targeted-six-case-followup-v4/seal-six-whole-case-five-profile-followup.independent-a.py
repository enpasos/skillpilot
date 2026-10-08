# SPDX-License-Identifier: Apache-2.0
"""Seal independently read scientific conclusions; assertions verify only bindings."""
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import subprocess

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[7]
FIRST = OWN.parent
AUTHOR = FIRST.parent / "biologie-he-metabolism-ecology-six-case-targeted-remediation-author-root-20261008-v4"
BASE = FIRST.parent / "biologie-he-metabolism-ecology-twenty-four-whole-science-author-20261008-v1"


def read(path):
    return json.loads(path.read_text())


def binding(path):
    raw = path.read_bytes()
    return {"path": str(path.relative_to(ROOT)), "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}


def verify(pin):
    path = ROOT / pin["path"]
    assert path.exists() and not path.is_symlink(), pin["path"]
    assert binding(path) == pin, pin["path"]
    return path


def put(name, value):
    with (OWN / name).open("x") as stream:
        stream.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def differences(old, new, prefix=""):
    if old == new:
        return []
    if isinstance(old, dict) and isinstance(new, dict):
        result = []
        for key in sorted(set(old) | set(new)):
            if key not in old or key not in new:
                result.append(prefix + "/" + key)
            else:
                result.extend(differences(old[key], new[key], prefix + "/" + key))
        return result
    if isinstance(old, list) and isinstance(new, list) and len(old) == len(new):
        result = []
        for index, (before, after) in enumerate(zip(old, new)):
            result.extend(differences(before, after, prefix + "/" + str(index)))
        return result
    return [prefix]


timestamp = datetime.now(timezone.utc).isoformat()
original_own_seal = FIRST / "whole24-science-source-P.independent-a.first.freeze.json"
assert binding(original_own_seal)["sha256"] == "56c15bf222e85f5ab92a69c5063d9cfd6f3b9aaa461690f611623dad64b3f58e"
for pin in read(original_own_seal)["ownFiles"]:
    verify(pin)
author_seal = AUTHOR / "six-case-only-remediation.author.first-input.freeze.json"
assert binding(author_seal)["sha256"] == "34ee51b09c7dc6e5959b3921a1a2c045a5a91005de7adb233095bd07ef6370fd"
author_files = [verify(pin) for pin in read(author_seal)["files"]]
entry = read(AUTHOR / "neutral-six-case-only-remediation.author.entry.json")
for key in ["whole48Candidate", "whole24ProfilesCandidate", "actualDelta", "originalAuthorFirstSeal"]:
    verify(entry[key])
delta = read(verify(entry["actualDelta"]))
old_cases_path = verify(delta["originalWhole48"])
old_profiles_path = verify(delta["originalP24"])
old_cases = read(old_cases_path)
new_cases = read(verify(entry["whole48Candidate"]))
old_profiles = read(old_profiles_path)
new_profiles = read(verify(entry["whole24ProfilesCandidate"]))
original_judgments = read(FIRST / "whole24-science-source-class-AM-P.independent-a.first.verdicts.json")
old_by_case = {case["caseId"]: case for case in old_cases["cases"]}
new_by_case = {case["caseId"]: case for case in new_cases["cases"]}
old_by_profile = {goal["goalId"]: goal for goal in old_profiles["goals"]}
new_by_profile = {goal["goalId"]: goal for goal in new_profiles["goals"]}
judgments = {goal["goalId"]: goal for goal in original_judgments["ownJudgments"]}
assert len(old_by_case) == len(new_by_case) == 48
assert len(old_by_profile) == len(new_by_profile) == 24
assert old_cases["wholeCurrentGoalBodies"] == new_cases["wholeCurrentGoalBodies"]
assert old_cases["goalCount"] == new_cases["goalCount"] == 24
assert old_cases["caseCount"] == new_cases["caseCount"] == 48
changed_cases = sorted(case_id for case_id in old_by_case if old_by_case[case_id] != new_by_case[case_id])
assert changed_cases == sorted(entry["changedCaseIds"]) == sorted(delta["changedCaseIds"])
changed_profiles = sorted(goal_id for goal_id in old_by_profile if old_by_profile[goal_id] != new_by_profile[goal_id])
assert changed_profiles == sorted(delta["changedProfileGoalIds"])
assert len(changed_cases) == 6 and len(changed_profiles) == 5
all_goal_bodies = {goal["id"]: goal for goal in new_cases["wholeCurrentGoalBodies"]}
for goal_id, goal in all_goal_bodies.items():
    assert goal == judgments[goal_id]["wholeCurrentGoal"]
for case in new_cases["cases"]:
    assert case["wholeCurrentGoal"] == all_goal_bodies[case["goalId"]]
    assert case["evidence"]["level"] == "E1" and case["evidence"]["maximumClaimScope"] == "G1"
    assert case["evidence"]["status"] == "ai_candidate"
    assert case["evidence"]["humanReviewStatus"] == "needs_human_review"
    assert case["evidence"]["performedExperiment"] is False
    assert case["evidence"]["actualLearnerPerformance"] is False
    assert case["evidence"]["humanTrial"] is False
    assert case["freshTransfer"]["performed"] is False
    assert case["scoring"]["maximumPoints"] == sum(c["points"] for c in case["scoring"]["criteria"]) == 10
    assert len(case["scoring"]["criteria"]) == 5
    assert case["scoring"]["criteria"][-1]["id"] == "fresh-concept-transfer"
    assert case["scoring"]["criteria"][-1]["criterion"] == case["freshTransfer"]["modelResponse"]
    profile = new_by_profile[case["goalId"]]["profile"]
    briefs = [b for b in profile["applicationCaseBriefs"] if b["id"] == case["caseId"]]
    assert len(briefs) == 1
    for lang, suffix in [("de", "De"), ("en", "En")]:
        brief = briefs[0]
        for value in [case["material"][lang], case["task"][lang], case["freshTransfer"]["task"][lang]]:
            assert value in brief["taskDemand" + suffix], case["caseId"]
        for value in [case["modelResponse"][lang], case["freshTransfer"]["modelResponse"][lang]]:
            assert value in brief["expectedPerformance" + suffix], case["caseId"]
        assert all(c["criterion"][lang].strip() for c in case["scoring"]["criteria"])

# These reasons are the reviewer's own scientific readings of the full six cases,
# not conclusions computed from author labels, schema validity, or hash equality.
reasons = {
    "he-metabolism-ecology24-05-case-1": {
        "scientificVerdict": "KEEP_SCIENTIFIC_E1_G1_CANDIDATE",
        "reason": "The C4 model correctly couples mesophyll PEP-carboxylase initial fixation to bundle-sheath Calvin assimilation, CO2 concentration and the extra ATP trade-off. The fresh comparison now itself supplies night fixation, daytime release and the same-cell CAM organization. Spatial C4 versus temporal CAM follows from supplied material, so it no longer requires unstated additional CAM curriculum knowledge. Both languages and the 2-point transfer criterion express the same distinction.",
        "originalOwnFindingResolved": [],
        "scopeBoundary": "This is an independently accepted author improvement, not a fabricated original A finding or a new mandatory CAM source claim.",
    },
    "he-metabolism-ecology24-09-case-1": {
        "scientificVerdict": "KEEP_SCIENTIFIC_E1_G1_CANDIDATE",
        "reason": "The model response explicitly proposes the testable rise in CO2 formation rate between20 and30 degrees at matched glucose/yeast and oxygen-free conditions; it distinguishes manipulated temperature from rate. Criterion c1 now tests that hypothesis rather than mere variable naming. Supplied material, response and c2 independently specify O2 verification and a parallel ethanol assay, so CO2 alone is not mislabeled as alcoholic fermentation. Matched controls/replicates, uncertainty and highest-tested-value rather than universal optimum remain sound. The separate sugar/temperature confounding transfer is unchanged and not circular.",
        "originalOwnFindingResolved": ["A24-P09-HYPOTHESIS", "A24-P09-FERMENTATION-IDENTIFICATION"],
        "scopeBoundary": "A designed synthetic witness with supplied values can support the goal's planning/evaluation claim; it supplies no personally performed experiment, actual learner evidence, or completion of a separate execution operator.",
    },
    "he-metabolism-ecology24-09-case-2": {
        "scientificVerdict": "KEEP_SCIENTIFIC_E1_G1_CANDIDATE",
        "reason": "The supplied sugar comparison now controls oxygen-free conditions and includes a parallel ethanol-rate fall at10percent; equal cells plus O2/ethanol controls are included in the complete design and c2. Comparing strains at matched concentrations with repeats, sugar-free/inactivated blanks, and separating possible osmotic/biochemical causes is scientifically coherent. CO2 is not accepted alone as fermentation. The fresh unequal-cell-density example requires normalization and does not reward an unsupported per-cell strain effect. Both language/scoring profiles retain full10-point coverage.",
        "originalOwnFindingResolved": ["A24-P09-FERMENTATION-IDENTIFICATION"],
        "scopeBoundary": "Measured-in-parallel wording belongs to the explicitly supplied model dataset; the record truthfully reports no experiment execution or real learner performance.",
    },
    "he-metabolism-ecology24-12-case-1": {
        "scientificVerdict": "KEEP_SCIENTIFIC_E1_G1_CANDIDATE",
        "reason": "The explicit external-pool constant colonization model gives expected losses0.4, additions1.2 and next occupancy4.8, while actual realizations remain integer. Repeated independent realizations estimate variation/risk, and one realization of3 does not refute that expectation. The assessed fourth criterion now concerns stochastic reasoning only. The unrelated statement about whether metapopulation is explicitly named by an official curriculum is removed from response and criterion. Both language models remain correctly distinct from the Levins occupancy-dependent colonization model.",
        "originalOwnFindingResolved": [],
        "scopeBoundary": "No named-mandatory metapopulation source approval follows. The original authored-nonmandatory source boundary remains independently preserved outside assessed learner work.",
    },
    "he-metabolism-ecology24-17-case-2": {
        "scientificVerdict": "KEEP_SCIENTIFIC_E1_G1_CANDIDATE",
        "reason": "Patch occupancy, local demographics and directed dispersal are distinct model inputs. Connectivity to a reproductive source can aid recolonization; a declining sink is not automatically an adequate emigrant supply. Habitat quality, distance and species-specific traits properly limit extrapolation. The all-lambda-below-one/no-external-source transfer conserves this distinction: redistribution does not create unlimited net population growth. Removing the official-naming curriculum sentence from model/c4 and the transfer expectation leaves all biological requirements intact and makes scoring concern the model rather than author QA.",
        "originalOwnFindingResolved": [],
        "scopeBoundary": "Scientific model adequacy does not convert the authored source extension into a named compulsory HE/BY topic or approve untouched original source rows.",
    },
    "he-metabolism-ecology24-19-case-1": {
        "scientificVerdict": "KEEP_SCIENTIFIC_E1_G1_CANDIDATE",
        "reason": "The stated linear equation yields95/75/55 and observed-minus-predicted residuals minus1/plus2/minus1 at16/20/24degrees. Separate validation inputs support model checking, not temperature causality. The15to25-degree validity interval explains why a negative40-degree extrapolation is not a negative real population. c4 now assesses causality and range limits; the unrelated official-bioinformatics naming sentence is removed. All numerical, unit, DE/EN and independently presented transfer conclusions remain correct.",
        "originalOwnFindingResolved": [],
        "scopeBoundary": "The existing nonmandatory authored-model source decision remains outside the scored answer and is not upgraded to whole-source curricular approval.",
    },
}
assert sorted(reasons) == changed_cases
case_verdicts = []
for case_id in changed_cases:
    case = new_by_case[case_id]
    prior = judgments[case["goalId"]]
    case_verdicts.append({
        "caseId": case_id,
        "goalId": case["goalId"],
        "ordinal": prior["ordinal"],
        "wholeCorrectedDEENCasePersonallyRead": case,
        "changedFieldsFromOriginal": differences(old_by_case[case_id], case),
        **reasons[case_id],
        "wholeMaterialTaskResponseFiveCriteriaAndFreshTransferRead": True,
        "materialSufficientForAssessedDemand": True,
        "scientificScoringAlignment": "PASS_BY_ACTUAL_WHOLE_READING_NOT_LITERAL_STRING_EQUALITY",
        "bilingualScopeAlignment": "PASS",
        "performedExperiment": False,
        "actualLearnerEvidence": False,
        "nativeD_VReview": "PENDING_NOT_CLAIMED",
    })
profile_verdicts = []
for goal_id in changed_profiles:
    prior = judgments[goal_id]
    profile_verdicts.append({
        "goalId": goal_id,
        "ordinal": prior["ordinal"],
        "wholeCorrectedAuthorProfilePersonallyRead": new_by_profile[goal_id],
        "changedFieldsFromOriginal": differences(old_by_profile[goal_id], new_by_profile[goal_id]),
        "expectationCaseWholeCoverage": "KEEP_SCIENTIFIC_E1_G1_CANDIDATE",
        "positiveWholeGoalScience": "KEEP_SCIENTIFIC_E1_G1_CANDIDATE",
        "sourceVerdictUnchanged": prior["sourceVerdict"],
        "atomicityVerdictUnchanged": prior["semanticAtomicityVerdict"],
        "memoryDecisionUnchanged": prior.get("memoryDecision", "retained no_memory_needed; no new memory run claimed"),
        "reason": "Both complete author cases, expectation edges and genuinely separate fresh transfers remain present. The only changed goal09 whole-P judgment resolves the independently sealed originalA findings; unchanged named-source boundaries are not upgraded by this case/profile remediation.",
        "evidenceLevel": "E1", "maximumClaimScope": "G1",
        "reviewAuthority": "ai_candidate", "status": "needs_human_review",
        "wholeCurrentFinalApproval": False, "rasterReview": "PENDING",
    })

closure_paths = [original_own_seal, author_seal, old_cases_path, old_profiles_path]
closure_paths += author_files
closure_paths += [FIRST / pin["path"].split("/")[-1] for pin in read(original_own_seal)["ownFiles"]]
closure_paths = sorted(set(closure_paths))
relative_paths = [str(path.relative_to(ROOT)) for path in closure_paths]
ignore = subprocess.run(["git", "check-ignore", "--no-index", *relative_paths], cwd=ROOT, capture_output=True, text=True)
assert ignore.returncode == 1 and ignore.stdout.strip() == "", ignore.stdout
assert not any(path.is_symlink() or not path.is_file() for path in closure_paths)
guard = {
    "schemaVersion": 1, "checkedAt": timestamp,
    "originalOwnFirstSealUnchanged": binding(original_own_seal),
    "authorRemediationFirstSeal": binding(author_seal),
    "requiredCommittedInputBindings": [binding(path) for path in closure_paths],
    "gitCheckIgnoreActual": {"exitCode": ignore.returncode, "stdout": ignore.stdout, "stderr": ignore.stderr, "ignoredRequiredInputs": 0},
    "brokenOrSymlinkRequiredInputs": 0,
    "actualChangedCaseIds": changed_cases,
    "actualChangedProfileGoalIds": changed_profiles,
    "unchangedWholeCases": 42, "unchangedWholeProfiles": 19, "unchangedWholeGoalBodies": 24,
    "all48CompleteBriefsMatchMaterialTaskModelFreshTransfer": True,
    "all48ScoringPoints": 10,
    "semanticCriterionModelAlignmentWasPersonallyReviewedNotInferredFromEquality": True,
    "peerCurrentBRead": False, "activeWrites": 0,
}
put("actual-six-case-five-profile-exact-retain-portability.independent-a.json", guard)
verdict = {
    "schemaVersion": 1, "reviewedAt": timestamp,
    "reviewer": "Codex independent A, not Root six-case author; current peerB24 remains unread",
    "originalOwnFirstSeal": binding(original_own_seal),
    "exactAuthorEntry": binding(AUTHOR / "neutral-six-case-only-remediation.author.entry.json"),
    "exactAuthorInputFirstSeal": binding(author_seal),
    "scope": "Six whole corrected bilingual cases and five whole profile edges only; current24 descriptions/source bodies unchanged",
    "genuineWholeCaseVerdicts": case_verdicts,
    "genuineWholeProfileVerdicts": profile_verdicts,
    "ownOriginalFindingsResolved": ["A24-P09-HYPOTHESIS", "A24-P09-FERMENTATION-IDENTIFICATION"],
    "ownOriginalFindingsStillOpen": [f for f in original_judgments["findings"] if f["findingId"] not in ["A24-P09-HYPOTHESIS", "A24-P09-FERMENTATION-IDENTIFICATION"]],
    "remainingSourceCompoundOrAuthoredBoundaryDecisions": [{
        "goalId": j["goalId"], "ordinal": j["ordinal"], "sourceVerdict": j["sourceVerdict"],
        "semanticAtomicityVerdict": j["semanticAtomicityVerdict"],
    } for j in original_judgments["ownJudgments"] if j["sourceVerdict"] != "KEEP_BOUNDED_PRIMARY_PROPOSAL"],
    "held16UnchangedCaseAndAuthorQATriageNotApproved": True,
    "current24WholePScientificCandidateTotals": {"KEEP": 22, "compoundHOLD": 2, "needsHumanReviewAll": True},
    "clearOwnScienceAndBoundedPrimaryNextNativeAuthorOrdinals": [4, 5, 6, 7, 9, 10, 15, 20, 21, 22, 23],
    "clearSubsetIsProposalUntilIndependentPairAndActualNativeD_V": True,
    "namedMandatorySourceApprovalForOptionalRows": False,
    "noNewSourceOperatorExecutionOrWhole1nPartnerApproval": True,
    "nativeD_VOrFinalRasterP": "PENDING_NOT_CLAIMED",
    "machineApproved": 0, "strictGainClaimed": 0, "activeWrites": 0,
    "humanApproval": False, "humanTrial": False, "peerCurrentBReadBeforeFirstFollowupSeal": False,
}
put("whole-six-case-five-profile-genuine-scientific-followup.independent-a.first.verdicts.json", verdict)
review_entry = {
    "schemaVersion": 1, "createdAt": timestamp,
    "kind": "Neutral genuine independentA six-case/five-profile scientific followup, after immutable original24first judgment",
    "originalFirstSeal": binding(original_own_seal), "authorRemediationFirstSeal": binding(author_seal),
    "wholeOwnFollowupVerdict": binding(OWN / "whole-six-case-five-profile-genuine-scientific-followup.independent-a.first.verdicts.json"),
    "actualExactRetainAndPortability": binding(OWN / "actual-six-case-five-profile-exact-retain-portability.independent-a.json"),
    "followupFirstSealPath": str((OWN / "six-whole-case-five-profile-followup.independent-a.first.freeze.json").relative_to(ROOT)),
    "scientificCaseVerdicts": {"wholeCorrectedCases": 6, "KEEP": 6, "newFindings": 0},
    "ownOriginalP9FindingsResolved": 2,
    "nextStep": "Use this exact genuineA followup with a separately sealed independentB result. Root may then prepare eligible actual raster/native D/P/V; source1/2/3, wholecompound8/16, optional-source boundaries and finalraster review remain open.",
    "nativeD_VOrFinalRasterP": "PENDING_NOT_CLAIMED", "currentPeerBRead": False,
    "activeWrites": 0, "strictGainClaimed": 0, "humanApproval": False, "humanTrial": False,
}
put("neutral-six-whole-case-five-profile-scientific-followup.independent-a.first.entry.json", review_entry)
seal = {
    "schemaVersion": 1, "sealedAt": timestamp,
    "kind": "Immutable own genuine six-case/five-profile scientific followup before any current peerB read",
    "ownFiles": [binding(path) for path in sorted(OWN.iterdir()) if path.is_file()],
    "authorInputFirstSeal": binding(author_seal), "originalOwnFirstSealUnchanged": binding(original_own_seal),
    "peerCurrentBReadBeforeSeal": False, "activeWrites": 0,
    "machineApproved": 0, "strictGainClaimed": 0, "humanApproval": False, "humanTrial": False,
}
put("six-whole-case-five-profile-followup.independent-a.first.freeze.json", seal)
print(json.dumps({"genuineSixCaseKEEP": 6, "ownP9FindingsResolved": 2, "sourceAndCompoundHoldsPreserved": True,
    "originalAFirstSealUnchanged": binding(original_own_seal)["sha256"],
    "followupFirstSeal": binding(OWN / "six-whole-case-five-profile-followup.independent-a.first.freeze.json"),
    "neutralEntry": binding(OWN / "neutral-six-whole-case-five-profile-scientific-followup.independent-a.first.entry.json"),
    "peerBRead": False, "strictGain": 0}, ensure_ascii=False))
