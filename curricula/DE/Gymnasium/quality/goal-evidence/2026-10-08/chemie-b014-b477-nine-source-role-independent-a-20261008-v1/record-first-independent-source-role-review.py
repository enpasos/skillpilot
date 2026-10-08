"""Record the reviewer's actual bounded source/case judgment; no active writes."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / "chemie-b014-b477-nine-source-role-continuation-author-v2"
AUTHOR_SEAL_SHA = "ca7fa1072c9a805b5046a8e242d63fcd25dde711477a685dad54e9f4c65dec0e"
B477 = "b4777001-f4ed-5fe9-9d98-02319abdea09"
BRONSTED = "1c1420c2-a8e2-520f-8015-6df637a973bd"
SELECTED_VALID = ["d2ccd1d5-56f7-583f-9724-e97441367f91",
                  "fd309753-4d48-5570-a4ec-09dfeb20ff9c", BRONSTED]
STAMP = datetime.now(timezone.utc).isoformat()


def rel(path):
    return str(path.relative_to(ROOT))


def sha(data):
    return hashlib.sha256(data).hexdigest()


def load(path):
    return json.loads(path.read_bytes())


def obj_sha(obj):
    return sha(json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())


def write(path, value):
    assert not path.exists(), f"Keep the first review immutable: {path}"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


assert (ROOT / "AGENTS.md").exists()
seal_path = AUTHOR / "candidate-freeze.manifest.json"
assert sha(seal_path.read_bytes()) == AUTHOR_SEAL_SHA
author_seal = load(seal_path)
input_observations = []


def snapshot(source):
    target = OWN / "exact-input-snapshots" / rel(source)
    assert not target.exists()
    data = source.read_bytes()
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
    input_observations.append({"observedOriginalPath": rel(source), "snapshotPath": rel(target),
                               "sha256": sha(data), "bytes": len(data)})


for binding in author_seal["entries"]:
    path = ROOT / binding["path"]
    data = path.read_bytes()
    assert sha(data) == binding["sha256"] and len(data) == binding["bytes"]
    snapshot(path)
assert len(author_seal["entries"]) == 15
snapshot(seal_path)
source_rows = load(AUTHOR / "nine-current-whole-original-source-duties-and-partners.json")["entries"]
deltas = load(AUTHOR / "six-limited-operative-source-role-deltas.inactive.json")["entries"]
cases = load(AUTHOR / "four-new-whole-original-operator-source-witness-cases.de-en.author-candidate.json")["cases"]
reuse = load(AUTHOR / "existing-valid-three-whole-positive-records-and-reuse-boundaries.raw.json")
canon_path = ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json"
canon = load(canon_path)
goal_by_id = {g["id"]: g for g in canon["goals"]}
assert all(goal_by_id[g["id"]] == g for g in reuse["wholeCurrentGoals"])
snapshot(canon_path)
for path_str in sorted({e[k] for e in source_rows for k in ("mappingPath", "sourceExtractionPath")}):
    snapshot(ROOT / path_str)

locator = load(AUTHOR / "actual-primary-whole-page-locators-and-operator-boundaries.json")
actual_pages = []
for key, row in locator["readings"].items():
    path = ROOT / row["primaryBinding"]["path"]
    data = path.read_bytes()
    assert sha(data) == row["primaryBinding"]["sha256"] and len(data) == row["primaryBinding"]["bytes"]
    with fitz.open(path) as pdf:
        page = pdf[row["physicalPage"] - 1]
        text = page.get_text()
        page_count = len(pdf)
        words = page.get_text("words")
    actual_pages.append({"readingKey": key, "originalPrimary": row["primaryBinding"],
                         "physicalPage": row["physicalPage"], "printedPage": row["printedPage"],
                         "sourceDocumentPages": page_count, "wholePageActualTextRead": True,
                         "pymupdfWholePageTextSha256": sha(text.encode()), "wordCount": len(words),
                         "newThirdPartyWholePageCopy": False})

for row in source_rows:
    for key in ("mappingBinding", "sourceExtractionBinding"):
        binding = row[key]
        data = (ROOT / binding["path"]).read_bytes()
        assert sha(data) == binding["sha256"] and len(data) == binding["bytes"]
    decision = load(ROOT / row["mappingPath"])["decisions"][row["decisionIndex"]]
    assert decision == row["wholeOriginalDecision"]
    assert all(goal_by_id[g["id"]] == g for g in row["wholeCurrentPartnerGoals"])

source_findings = {
    "BW-basis": "The complete basis page places donor/acceptor description in competency (10). Separate (11) requires the five named ion/group detection applications, and earlier (2)-(9) carry kinetics/equilibrium duties. None is erased or silently transferred by removal of only the B477 edge from (10). The actual locator is physical27/printed25; the old S.24 reference is historical.",
    "BW-advanced": "The complete advanced page places donor/acceptor description in 3.4.3(1). Equilibrium/water species (2), carbonate/ammonium detection (3), and mass-action derivation (4) remain distinct obligations. Removal of only the B477 edge from (1) is supported by the unchanged current Brønsted goal.",
    "HB-E-current2026": "The full E page requires Brønsted explanation, donor/acceptor representation and reaction equations. Current1c and its retained full formal proton-transfer cases supply this role. Pair phrasing in the extraction is derived; the original does not impose a new quantitative-strength/direction or generic model-reflection target. Existing08b cluster and children are retained, without approval of all their wider structural/reversibility obligations.",
    "HE-G9": "The entire physical25/printed24 10.3 table specifies proton donor/acceptor, conjugate pairs and water ampholyte under3.3. All three are explicit in unchanged current1c and its two retained cases. Adjacent3.1/3.2 preparation/properties and3.4 titration applications are not converted into removed obligations.",
    "BB-acid-base": "Full physical44 has detection reactions in the Brønsted GK content column; LK additions are separate. This is contextual acid/base qualitative detection, not universal coverage of3de's organic-family list. An indicator reaction/control interpretation can witness it; color must not identify a solute or prove an ion species absent.",
    "BE-acid-base": "The actual separate BE primary file has the same complete physical44 acid/base table and GK/LK boundary. Its distinct source identity must remain; chemical scope is the same bounded qualitative acid/base detection duty as BB.",
    "HB-Q-current2026": "The entire original Q page requires mass action for reversible protolysis and explanation of different strengths of BOTH acids and bases at particle level. Pure pK sorting or the old E-direction template is insufficient. The quantitative/structural case pair genuinely covers these original operators, while481's complete current review and other bindings remain open.",
}
write(OWN / "actual-whole-primary-reading.independent-a.receipt.json", {
    "artifactKind": "independent-a-actual-whole-primary-page-operator-reading",
    "recordedAt": STAMP, "reviewer": "/root/flora_fauna_independent_a", "actualReadings": actual_pages,
    "substantiveIndependentOperatorFindings": source_findings,
    "HB2026AndRetainedRelevantWholePageTextEqual": all(
        next(p["pymupdfWholePageTextSha256"] for p in actual_pages if p["readingKey"] == f"HB-{phase}-current2026")
        == next(p["pymupdfWholePageTextSha256"] for p in actual_pages if p["readingKey"] == f"HB-{phase}-retained")
        for phase in ("E", "Q")),
    "sourceSciencePassInferredFromHashes": False, "peerBOutputsRead": False,
    "activeWrites": False, "humanApproval": False,
})

reuse_bindings = []
for wrapper in reuse["retainedPositiveRecords"]:
    path = ROOT / wrapper["reviewPath"]
    lines = path.read_bytes().splitlines(keepends=True)
    raw = lines[wrapper["line"] - 1]
    assert json.loads(raw) == wrapper["wholeRecord"]
    reuse_bindings.append({"goalId": wrapper["goalId"], "reviewPath": wrapper["reviewPath"],
                          "line": wrapper["line"], "currentRawLineSha256": sha(raw),
                          "wholeProfileAndStatusByteUnchanged": True,
                          "status": wrapper["wholeRecord"]["status"],
                          "reviewAuthority": wrapper["wholeRecord"]["reviewAuthority"],
                          "repeatedScientificReview": False})

bounded_rows = []
row_by_id = {row["sourceGoalId"]: row for row in source_rows}
for delta in deltas:
    gid = delta["sourceGoalId"]
    row = row_by_id[gid]
    primary_key = ("BW-basis" if "3-3-2" in gid else "BW-advanced" if "3-4-3" in gid
                   else "HB-E-current2026" if gid.startswith("hb-") else "HE-G9")
    assert len(delta["removeOnlyMappingEdges"]) == 1
    assert delta["removeOnlyMappingEdges"][0]["canonicalGoalId"] == B477
    assert delta["fieldDeltas"][0]["afterCandidate"] == [
        g for g in row["wholeOriginalPartnerGoalIds"] if g != B477]
    bounded_rows.append({"sourceGoalId": gid, "status": "PASS_BOUNDED_SOURCE_ROLE_REMOVAL",
                         "reviewedAt": STAMP, "reviewer": "/root/flora_fauna_independent_a",
                         "wholeOriginalSourceGoalSha256": row["wholeOriginalSourceGoalSha256"],
                         "wholeOriginalDecisionSha256": row["wholeOriginalDecisionSha256"],
                         "actualPrimaryReadingKey": primary_key,
                         "actualPrimaryReadingFinding": source_findings[primary_key],
                         "approvedExactBoundedFieldDeltas": delta["fieldDeltas"],
                         "approvedExactBoundedRemovedMappingEdges": delta["removeOnlyMappingEdges"],
                         "exactRetainedPartnerEdges": delta["retainedMappingEdges"],
                         "reusedExistingCurrentGoalId": BRONSTED,
                         "operatorCoverageEvidence": "Existing current1c full description names proton transfer, equations, conjugate pairs and water ampholyte. Retained water-donor/acceptor and phosphate-ampholyte cases explicitly show both roles and balanced equations; used only for this new source-role claim, without re-reviewing their established scientific correctness.",
                         "noOtherOriginalClauseOrPartnerDutyRemoved": True,
                         "wholeB477Approved": False, "activeAdoption": False,
                         "humanApproval": False})

arithmetic = {
    "weak-carboxyl-protolysis-MWG-strength-and-Q-v2": {
        "KaChloroacetateAcid": 10**-2.9, "KaAceticAcid": 10**-4.8,
        "K": 10**(4.8-2.9), "Q": .001*.008/(.0001*.0001),
        "pKbChloroacetate": 14-2.9, "pKbAcetate": 14-4.8,
        "actualCompositionDirection": "reverse because Q>K", "equalActivityTransferDirection": "forward because1<K",
        "stoichiometry": {"leftAtoms": {"C":4,"H":6,"Cl":1,"O":4},
                          "rightAtoms": {"C":4,"H":6,"Cl":1,"O":4}, "leftCharge":-1,"rightCharge":-1}},
    "fresh-inductive-distance-acid-and-base-strength-v2": {
        "K": 10**(4.8-4.0), "Q": .002*.004/(.002*.004),
        "pKb3Chloropropionate": 14-4.0, "pKbAcetate": 14-4.8,
        "actualCompositionDirection": "forward because Q<K", "transferQ":63.1,
        "transferDirection":"reverse because63.1>K",
        "stoichiometry": {"leftAtoms": {"C":5,"H":8,"Cl":1,"O":4},
                          "rightAtoms": {"C":5,"H":8,"Cl":1,"O":4}, "leftCharge":-1,"rightCharge":-1}},
}
case_findings = [
    {"status":"PASS_BOUNDED_WHOLE_SOURCE_WITNESS", "substantiveFinding":
     "Whole supplied trace-indicator model, calibrations, both balanced proton reactions, full DE/EN answers and fresh dilution/intrinsic-color transfer are coherent. Calibrated qualitative acidity/alkalinity, coexistence of both aqueous ion species, lack of exact-pH/solute identity and blank limits are properly distinguished. This witness is an own stipulated model, not a performed learner experiment.", "requiredChanges":[]},
    {"status":"HOLD_MATERIAL_CONDITION_CONTRADICTION", "substantiveFinding":
     "The first DE/EN material line calls the new sample set colorless; the next line explicitly makes Z intrinsically yellow. These supplied conditions contradict each other for Z. The indicator equations, X/Y interpretation, independent-meter inference and color-interference/ion-predominance reasoning are chemically correct; the single material condition must be scoped consistently before whole-case PASS.",
     "findings":[{"findingId":"A-SRC-CASE2-COLORLESS-Z","paths":["/cases/1/material/de/0","/cases/1/material/en/0"],
                  "counterevidencePaths":["/cases/1/material/de/1","/cases/1/material/en/1"],
                  "smallestRequiredCorrection":"Limit the colorless condition expressly to X, Y and references; introduce Z as an additional intrinsically colored interference sample in both languages. Keep the actual probe observations, task, answers and transfer unchanged."}],
     "requiredChanges":["Resolve the colorless-set versus intrinsically-yellow-Z condition in DE and EN."]},
    {"status":"PASS_BOUNDED_WHOLE_SOURCE_WITNESS", "substantiveFinding":
     "Whole DE/EN material bounds temperature, medium, activities, counterions and supplied non-equilibrium composition. The generic HA formula applies to both explicitly named acid/conjugate-base pairs and correctly supplies their Ka expressions. Comparison addresses both acid strength and inverse base strength through electron-withdrawing stabilization. Summed reactions give K≈79.4; actual Q800 favors reverse despite K>1. Fresh equal activities give Q1 and forward preference. No rate or immediate-completion claim follows. Whole original HB Q MWG and both particle-strength operators are witnessed;481 is not approved on its other duties.", "requiredChanges":[],
     "independentArithmeticAndStoichiometry": arithmetic[cases[2]["caseLocalKey"]]},
    {"status":"PASS_BOUNDED_WHOLE_SOURCE_WITNESS", "substantiveFinding":
     "Whole new DE/EN transfer changes inductive distance under fixed stipulated medium/temperature, retains charge distribution over two oxygens, and derives KaKb=Kw. The inverse base order is explicit: acetate>3-chloropropionate>chloroacetate. K≈6.31, Q1 and fresh Q63.1 give opposite thermodynamic directions without changing Ka/Kb or implying speed. Generic HA/A− water equations are valid parameterized equations for the named pairs. Both acid AND base strength and MWG explanation are covered within the supplied series, without claiming universal inductive rankings.", "requiredChanges":[],
     "independentArithmeticAndStoichiometry": arithmetic[cases[3]["caseLocalKey"]]},
]
for case, verdict in zip(cases, case_findings):
    verdict.update(caseLocalKey=case["caseLocalKey"], exactWholeCaseObjectSha256=obj_sha(case),
                   sourceGoalIds=case["sourceGoalIds"], reviewedAt=STAMP,
                   reviewer="/root/flora_fauna_independent_a", bothWholeLanguagesRead=True,
                   wholeMaterialTaskModelAnswerUnderstandingAndTransferRead=True,
                   wholeGoalApproval=False, humanApproval=False, activeAdoption=False)

remaining = []
for row in source_rows:
    gid = row["sourceGoalId"]
    if gid.startswith(("bb-", "be-")):
        remaining.append({"sourceGoalId":gid,"status":"HOLD_CASE2_CONDITION_AND_EXACT_OPERATIVE_REUSE_UNION",
                          "sourceInterpretationStatus":"PASS_BOUNDED_ACID_BASE_DETECTION_OPERATOR",
                          "actualPrimaryReadingKey":"BB-acid-base" if gid.startswith("bb-") else "BE-acid-base",
                          "exactSourceRowObjectSha256":obj_sha(row["wholeOriginalSourceGoal"]),
                          "originalPartnerIds":row["wholeOriginalPartnerGoalIds"],
                          "assessedBoundedReuseUnion":SELECTED_VALID,
                          "independentScopeFinding":"The d2/fd/1c union retains experimental indicator interpretation, particle predominance and the detection proton-reaction model. No new detection atom is required for this bounded duty. The two new source witnesses fit this union; resolve the fresh material condition before adopting them.",
                          "originalPartnerBoundary":"3de's whole organic-family scope is not entailed by this acid/base content row. B477's direction/model-reflection bundle is not required to carry qualitative acid/base detection. An exact versioned operative reassignment to the retained three-goal union must preserve the original source identity/text/GK context; no such active mutation is performed here.",
                          "requiredNextChanges":["Resolve A-SRC-CASE2-COLORLESS-Z in the next immutable author input.",
                                                "Present the exact bounded versioned source-role reassignment to d2/fd/1c, preserving prior history and all actual source clauses."],
                          "wholeB477Approved":False,"humanApproval":False})
    elif gid.startswith("hb-") and "3-3-1-2" in gid:
        remaining.append({"sourceGoalId":gid,"status":"PASS_BOUNDED_WHOLE_ORIGINAL_OPERATOR_WITNESSES_WITH_GOAL_REUSE_HOLD",
                          "actualPrimaryReadingKey":"HB-Q-current2026",
                          "exactSourceRowObjectSha256":obj_sha(row["wholeOriginalSourceGoal"]),
                          "originalPartnerIds":row["wholeOriginalPartnerGoalIds"],
                          "independentScopeFinding":"The two complete new cases genuinely witness MWG and both acid/base particle-strength explanations under Q-stage scope. Extracted pK wording is a derived authoring label, not the complete printed source operator.",
                          "candidateCarrier":"48115ff7-7aca-5d0b-a9e7-7fc6c78434ef",
                          "structuralSupportOnly":"ca216bc6-5205-5b46-abbd-fd5628e4ca5b",
                          "carrierBoundary":"Do not transfer source completion or other current481 obligations from these bounded witnesses. The E-phase B477 direction template cannot replace the quantitative Q operator. Current481 still needs complete independent D/P/A/M/V and all affected bindings before whole-goal completion.",
                          "requiredNextChanges":["Prepare an exact source-preserving carrier/reuse decision and finish current481 whole-goal checks only where actually missing."],
                          "wholeB477Approved":False,"whole481Approved":False,"humanApproval":False})

write(OWN / "live-primary-support-reading.independent-a.actual.json", {
    "artifactKind":"independent-a-live-primary-support-reading-not-new-source-role-adoption",
    "recordedAt":STAMP,"reader":"/root/flora_fauna_independent_a","readingMethod":"web tool actual official primary page reads",
    "sources":[
        {"url":"https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch-ntg",
         "boundedLocator":"C10 Lernbereich1 modelling competence and model-properties content; Lernbereich2 acid/base context",
         "independentFinding":"The official C10 NTG page supports generic assessment of model explanatory power and limitations. A comparison of acid/base models is a legitimate authored application, not a literally stated universal acid/base-specific requirement. Regional scope remains BY10 NTG; no all-country extension follows."},
        {"url":"https://openstax.org/books/chemistry-2e/pages/14-3-relative-strengths-of-acids-and-bases",
         "boundedLocator":"Conjugate acid/base ionization constants",
         "independentFinding":"KaKb=Kw and inverse conjugate strength support the independently checked model arithmetic; supplied rounded constants are own stipulated inputs."},
        {"url":"https://openstax.org/books/chemistry-2e/pages/13-3-shifting-equilibria-le-chateliers-principle",
         "boundedLocator":"Reaction quotient and catalyst effects",
         "independentFinding":"Q relative to K establishes composition-dependent equilibrium shift; speed can change without changing K. The case distinction is correct."}],
    "thirdPartyWholePageOrExerciseCopied":False,"newUniversalCurricularSourceClaim":False,"humanApproval":False,
})
write(OWN / "first-nine-source-role-and-four-whole-case.independent-a.verdicts.json", {
    "artifactKind":"independent-a-first-bounded-source-role-and-whole-source-witness-judgment",
    "recordedAt":STAMP,"reviewer":"/root/flora_fauna_independent_a",
    "authorSeal":{"path":rel(seal_path),"sha256":AUTHOR_SEAL_SHA,"entryCount":15},
    "boundedSourceRoleVerdicts":bounded_rows,"remainingWholeOriginalDutyVerdicts":remaining,
    "fourActualWholeDEENCaseVerdicts":case_findings,
    "currentThreeStrictGoalsRetainedWithoutNewScience":reuse_bindings,
    "modelReflectionAndWholeB477":{
        "status":"HOLD_SCOPE_PRESERVING_ATOMICITY_AND_MODEL_REUSE",
        "wholeCurrentB477ObjectSha256":obj_sha(goal_by_id[B477]),
        "wholeB477CurrentDescription":goal_by_id[B477]["description"],
        "independentPerformancesPreserved":["reaction-direction justification","aqueous acid/base detection","comparison and limitation of model concepts"],
        "genericModelReflectionPrimary":"https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch-ntg",
        "existingReflectionReuseCandidate":"277a3c20-6082-5a95-be08-c1e386efe79b",
        "reason":"The nine source-role corrections do not justify calling this three-performance aggregate atomic or complete. The current277 goal has much wider model/digital/organic/biochemical scope and is not a completed acid/base-model comparison witness. Preserve reflection explicitly; establish exact current stage/source/placement and whole goal evidence or a genuinely scoped reuse/split before adopting any narrower B477 text. No new ID or split is approved here.",
        "wholeB477Approved":False,"whole277Approved":False,"newStableIdsApproved":[],
        "fd309HistoricalPresenceHold":"superseded; current valid predominance text and records preserved without science restart"},
    "summary":{"boundedSourceRoleRemovalPASS":6,"wholeNewSourceCasesPASS":3,
               "wholeNewSourceCasesHOLD":1,"remainingOriginalDuties":3,
               "newWholeGoalScientificClosures":0,"activeBindingRestorations":0,"strictNetIncrease":0},
    "noScientificPassFromHashOrNativeTechnicalCheck":True,"peerBOutputsRead":False,
    "activeWrites":False,"humanApproval":False,"humanTrial":False,
})
write(OWN / "exact-current-author-and-source-inputs.binding.receipt.json", {
    "artifactKind":"independent-a-exact-author-and-current-source-input-snapshot-binding",
    "recordedAt":STAMP,"observations":input_observations,
    "primaryInputsWithoutNewThirdPartyCopy":[r["originalPrimary"] for r in actual_pages],
    "currentNineOriginalDecisionsAndAllPartnerObjectsEqualAuthorInput":True,
    "newScientificGoalReviewOfRetainedValidThree":False,"activeWrites":False,
})
print(json.dumps({"boundedRolePass":len(bounded_rows),"sourceCasesPass":3,"sourceCasesHold":1,
                  "remainingDuties":len(remaining),"inputSnapshots":len(input_observations),"strictNetIncrease":0}))
