#!/usr/bin/env python3
"""Record actual bounded science followup; never integrate active goals."""
# SPDX-License-Identifier: Apache-2.0
import copy
from collections import defaultdict
from datetime import datetime, timezone
from fractions import Fraction
import hashlib
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[6]
AUTHOR = OUT.parent / "biologie-molecular-genetics-twenty-three-whole-author-v1"
TARGETS = ["0eddd781-90aa-5120-a24f-c7e38327162c", "d42c8cf0-9225-5f05-816a-914fc3caa116"]


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def binding(path):
    data = path.read_bytes()
    return {"path": str(path.relative_to(ROOT)), "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}


def write(name, data):
    path = OUT / name
    assert not path.exists(), f"Preserve existing first artifacts: {path}"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return binding(path)


def changes(before, after, prefix=""):
    if isinstance(before, dict) and isinstance(after, dict):
        return [p for key in sorted(before.keys() | after.keys()) for p in changes(before.get(key), after.get(key), f"{prefix}/{key}")]
    if isinstance(before, list) and isinstance(after, list) and len(before) == len(after):
        return [p for index, (old, new) in enumerate(zip(before, after)) for p in changes(old, new, f"{prefix}/{index}")]
    return [] if before == after else [prefix]


original = read(AUTHOR / "twenty-three-whole46-bilingual-cases-and-P.author-candidate.json")
current = read(AUTHOR / "remediation-v2/twenty-three-whole46-bilingual-cases-and-P.v2.author-candidate.json")
rubrics = read(AUTHOR / "remediation-v2/whole21-pair-level-rubric-references.author-candidate.json")
first = read(OUT / "two-remedies-and-pair-rubrics.actual-input.first.freeze.json")
errors = []
for expected in first["actualInputs"]:
    actual = binding(ROOT / expected["path"])
    if actual != expected:
        errors.append({"inputChangedSinceOwnFirst": expected["path"]})

goal_changes, profile_changes, narrative_changes, rubric_rows = [], [], [], []
reference_by_id = {row["goalId"]: row for row in rubrics["entries"]}
for i, (old, new) in enumerate(zip(original["entries"], current["entries"])):
    assert old["goalId"] == new["goalId"]
    if paths := changes(old["wholeCurrentGoal"], new["wholeCurrentGoal"]):
        goal_changes.append({"goalId": new["goalId"], "changedPaths": paths})
    if paths := changes(old["wholeProfile"], new["wholeProfile"]):
        profile_changes.append({"goalId": new["goalId"], "changedPaths": paths})
    if "newAuthoredWholeCases" not in old:
        assert old == new
    for j, (old_case, new_case) in enumerate(zip(old.get("newAuthoredWholeCases", []), new.get("newAuthoredWholeCases", []))):
        old_body, new_body = copy.deepcopy(old_case), copy.deepcopy(new_case)
        for key in ["rubric", "rubricScope", "rubricReference"]:
            old_body.pop(key, None)
            new_body.pop(key, None)
        if paths := changes(old_body, new_body):
            narrative_changes.append({"goalId": new["goalId"], "caseIndex": j, "changedPaths": paths})
        if old_case.get("rubric") != new_case.get("rubric"):
            pointer = f"/entries/{i}/newAuthoredWholeCases"
            ref = reference_by_id[new["goalId"]]
            assert new_case["rubricScope"] == "whole_evidence_pair_reference_not_individual_case_score"
            assert ref["wholePairPointer"] == pointer
            assert ref["caseIds"] == [c["caseId"] for c in new["newAuthoredWholeCases"]]
            assert ref["actualLearnerEvidence"] is False
            assert new_case["rubricReference"]["wholePairPointer"] == pointer
            assert new_case["rubricReference"]["assessmentRuleDe"] == ref["assessmentRuleDe"]
            assert new_case["rubricReference"]["assessmentRuleEn"] == ref["assessmentRuleEn"]
            for old_criterion, new_criterion in zip(old_case["rubric"], new_case["rubric"]):
                a, b = copy.deepcopy(old_criterion), copy.deepcopy(new_criterion)
                for key in ["evidenceLocations", "evidenceScope"]:
                    a.pop(key, None)
                    b.pop(key, None)
                assert a == b
                assert new_criterion["evidenceLocations"] == [pointer]
                assert new_criterion["evidenceScope"] == "whole_evidence_pair_reference"
            assert ref["criteria"] == new_case["rubric"]
            rubric_rows.append({"goalId": new["goalId"], "caseId": new_case["caseId"], "wholePairPointer": pointer, "criterionTextsExact": True, "pairReferenceNotIndividualScore": True})
        else:
            assert old_case == new_case

assert goal_changes == [{"goalId": TARGETS[0], "changedPaths": ["/description", "/descriptionEn"]}]
assert profile_changes == [{"goalId": TARGETS[1], "changedPaths": ["/applicationCaseBriefs/0/taskDemandDe"]}]
assert narrative_changes == [{"goalId": TARGETS[1], "caseIndex": 0, "changedPaths": ["/materialDe"]}]
assert len(rubric_rows) == 42 and len(reference_by_id) == 21
assert rubrics["additionalTaskQuota"] is False and rubrics["actualLearnerEvidence"] is False


def cross(left, right):
    outcomes = defaultdict(Fraction)
    for g1, p1 in left.items():
        for g2, p2 in right.items():
            genotype = "".join("".join(sorted((a, b), key=lambda s: (s.islower(), s))) for a, b in zip(g1, g2))
            outcomes[genotype] += p1 * p2
    assert sum(outcomes.values()) == 1
    return dict(sorted(outcomes.items()))


quarter = Fraction(1, 4)
half = Fraction(1, 2)
equal = {g: quarter for g in ["AB", "Ab", "aB", "ab"]}
mono = cross({"A": half, "a": half}, {"A": half, "a": half})
dihybrid = cross(equal, equal)
testcross = cross(equal, {"ab": Fraction(1)})
linked = cross({"AB": Fraction(45, 100), "ab": Fraction(45, 100), "Ab": Fraction(5, 100), "aB": Fraction(5, 100)}, {"ab": Fraction(1)})
fresh = cross({"Cd": half, "cd": half}, {"cD": half, "cd": half})
assert mono == {"AA": quarter, "Aa": half, "aa": quarter}
assert dihybrid == {"AABB": Fraction(1, 16), "AABb": Fraction(2, 16), "AAbb": Fraction(1, 16), "AaBB": Fraction(2, 16), "AaBb": quarter, "Aabb": Fraction(2, 16), "aaBB": Fraction(1, 16), "aaBb": Fraction(2, 16), "aabb": Fraction(1, 16)}
assert len(testcross) == 4 and set(testcross.values()) == {quarter}
assert linked == {"AaBb": Fraction(45, 100), "Aabb": Fraction(5, 100), "aaBb": Fraction(5, 100), "aabb": Fraction(45, 100)}
assert fresh["ccdd"] == quarter and set(fresh.values()) == {quarter}
phenotypes = defaultdict(Fraction)
for genotype, probability in dihybrid.items():
    phenotypes[("A_" if "A" in genotype[:2] else "aa") + ("B_" if "B" in genotype[2:] else "bb")] += probability
assert dict(phenotypes) == {"A_B_": Fraction(9, 16), "A_bb": Fraction(3, 16), "aaB_": Fraction(3, 16), "aabb": Fraction(1, 16)}

primary = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-next-molecular-genetics-twenty-three-preparation-a-v1/primary-routing-context"
html, text = primary / "BY12-EA.actual-official.html", primary / "BY12-EA.actual-official.full-text.txt"
assert binding(html)["sha256"] == "155103835d15483abf15a91bbc7e1a79103d93cb22303b7f2d393859c52751bd"
assert "die eine Voraussetzung für Selektionsprozesse" in text.read_text()
technical = write("two-fidelity-deltas-pair-rubric-scope-and-independent-crosses.actual-check.json", {
    "schemaVersion": 1, "role": "Actual independent targeted integrity and rational-cross calculations; not whole23 science approval",
    "inputFirst": binding(OUT / "two-remedies-and-pair-rubrics.actual-input.first.freeze.json"),
    "goalChanges": goal_changes, "profileChanges": profile_changes, "caseNarrativeChanges": narrative_changes,
    "wholePairRubricReferences": rubric_rows,
    "independentRationalCrosses": {name: {g: str(p) for g, p in values.items()} for name, values in [("mono", mono), ("dihybrid", dihybrid), ("testcross", testcross), ("linked", linked), ("fresh", fresh), ("dihybridPhenotypes", phenotypes)]},
    "additionalActualReadBindings": [binding(html), binding(text)], "errors": errors,
    "whole23FreshReview": False, "activeWrites": False, "humanApproval": False, "strictGain": 0,
})
assert not errors

verdict = write("two-fidelity-remedies-and-honest-pair-rubrics.independent-root.science-FIRST.json", {
    "schemaVersion": 1, "role": "Independent targeted science followup FIRST; original A findings known, fresh A/B followup judgments unread",
    "reviewer": "/root", "createdAt": datetime.now(timezone.utc).isoformat(),
    "actualInputFirst": binding(OUT / "two-remedies-and-pair-rubrics.actual-input.first.freeze.json"),
    "actualIntegrityAndCalculations": technical,
    "actualScientificReading": {
        "wholeCurrentTargetsRead": TARGETS, "wholeProfilesRead": TARGETS,
        "wholeBilingualCasesRead": [c["caseId"] for row in current["entries"] if row["goalId"] in TARGETS for c in row["newAuthoredWholeCases"]],
        "primaryWholeSections": ["BY12-EA Biologie12 2.1 entire competency and content section", "BY12-EA Biologie12 2.5 entire competency and content section"],
        "sourceDuty": "source-duty-0110 entire original mapping decision, matching edge, source competency, whole B12-EA.2 passage and original whole partner",
        "sourceDutyAndPartnerRewritten": False,
        "rubricScopeChange": "All 42 modified case references checked against the exact original criterion texts and the actual complete pair. The two common DE/EN scope rules were read; this is a reference-scope review, not fresh science approval of 42 cases.",
    },
    "decisions": [
        {"goalId": TARGETS[0], "originalFinding": "BIO23-A-001", "decision": "resolved_for_bounded_current_description_and_existing_whole_pair", "reasonDe": "DE und EN trennen nun den Beitrag alternativen Spleißens zur Proteinvielfalt von einer universellen Evolutionsvoraussetzung. Der Bezug von 'die' im tatsächlichen bayerischen EA-Primärsatz ist Proteinvielfalt. Vererbbarkeit relevanter Variation und unterschiedlicher Fortpflanzungserfolg sind ausdrücklich Bedingungen. Der vollständige Exon-/Rasterfall und der vollständige R/r-Plastizitätsfall passen hierzu; eine temperaturbedingte Isoformänderung allein beweist keine vererbbare gerichtete Selektion. Die E1/E4-Start-/Stoppannahmen sind als konstruierte Regeln gegeben. Vier ausgelassene Nukleotide können den folgenden Rahmen verändern; Funktionsverlust ist deshalb nicht ohne Sequenz-/Funktionsbeleg sicher. Kein reales Experiment und kein Selektionsversuch werden behauptet."},
        {"goalId": TARGETS[1], "originalFinding": "BIO23-A-002", "decision": "resolved_for_bounded_DE_material_and_duplicate_brief", "reasonDe": "Im ganzen deutschen Material und im zugehörigen ganzen P-Brief bildet nun jeder der beiden Elternteile vier mögliche Gametentypen. Es wird nicht mehr behauptet, eine Person habe genau zwei Gameten. Die unveränderte englische Aussage stimmt dazu. Eigene vollständige rationale Kreuzung rechnet 1:2:1, neun Genotypklassen, 9:3:3:1 unter expliziter vollständiger Dominanz, den gleichen Testcross, den 45/45/5/5-Kopplungsfall und die frische Ccdd×ccDd-Kreuzung nach. Kopplungsdaten liefern zunächst Genotypen; Phänotypen brauchen entsprechende Dominanzannahmen. Das ist keine neue Freigabe aller ursprünglichen Quellen-/Kursbindungen."},
    ],
    "pairRubricDecision": "The genuine replacement labels the whole evidence pair honestly. Exact criterion texts remain; pointers resolve to both actual cases and supplied fresh transfers. Individual scoring is explicitly limited to requested/shown subperformance. No new task quota or actual learner evidence is inferred.",
    "remainingHolds": ["Whole-source/course boundaries from original science reviews remain outside this targeted remedy", "Current native descriptions, P page/context bindings, A/M and actual V approvals are not supplied by this artifact", "The unchanged 21 original science results are not rereviewed or approved here"],
    "freshPeerJudgmentsReadBeforeFirst": False, "authorOfTargetsOrRemedies": False,
    "technicalNeutralImageIntakePreviouslyPreparedByReviewer": True,
    "machineCandidateReviewOnly": True, "whole23FreshIndependentReview": False,
    "openTargetedBlockingFindings": [], "actualLearnerPerformance": False,
    "humanApproval": False, "humanTrial": False, "activeWrites": False, "strictGain": 0,
})
seal = write("two-fidelity-remedies-and-pair-rubrics.independent-root.scientific-FIRST.freeze.json", {
    "schemaVersion": 1, "role": "Independent root scientific FIRST immutable output seal before reading fresh peers",
    "createdAt": datetime.now(timezone.utc).isoformat(), "inputs": first["actualInputs"],
    "outputs": [technical, verdict], "peerFollowupJudgmentsRead": False,
    "authorOfBiologyTargets": False, "humanApproval": False, "activeWrites": False,
})
entry = write("neutral-completed-two-fidelity-remedies-independent-root.review.entry.json", {
    "schemaVersion": 1, "role": "Neutral completed independent root targeted followup entry",
    "inputFirst": binding(OUT / "two-remedies-and-pair-rubrics.actual-input.first.freeze.json"),
    "scientificFirst": verdict, "scientificFirstSeal": seal, "actualTechnicalCheck": technical,
    "targetGoalIds": TARGETS, "whole23FreshReviewClaimed": False,
    "nativeOrActiveApproval": False, "humanApproval": False, "strictGain": 0,
})
print(json.dumps({"entry": entry, "scientificFirst": verdict, "scientificFirstSeal": seal}, ensure_ascii=False))
