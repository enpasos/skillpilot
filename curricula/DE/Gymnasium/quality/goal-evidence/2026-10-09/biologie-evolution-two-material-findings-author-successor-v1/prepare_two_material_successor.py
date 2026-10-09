# SPDX-License-Identifier: Apache-2.0
"""Prepare only two substantive material fixes; no independent or active approval."""

import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

import jsonschema

ROOT = Path.cwd()
OUT = Path(__file__).resolve().parent
REVIEW_ID = OUT.name
AUTHOR = OUT.parent / "biologie-evolution-systematics-behavior-eighteen-whole-author-v1"
B_REVIEW = OUT.parent / "biologie-evolution-systematics-behavior-eighteen-whole-independent-b-v1"
C_REVIEW = OUT.parent / "biologie-evolution-systematics-behavior-eighteen-whole-independent-c-v1"
STAMP = datetime.now(timezone.utc).isoformat()
GOAL_PLANTS = "0db20819-ee94-54c6-8ecb-aff8c9b7419e"
GOAL_DATING = "e3167331-f855-5030-9673-29f55a7b4230"


def read(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def binding(path):
    path = Path(path)
    assert not path.is_symlink()
    value = path.read_bytes()
    return {"path": path.relative_to(ROOT).as_posix(),
            "sha256": "sha256:" + hashlib.sha256(value).hexdigest(), "bytes": len(value)}


def write(name, value):
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.exists(), "Additive evidence must not overwrite an existing artifact"
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    assert read(path) == value
    return path


def differences(before, after, pointer=""):
    assert type(before) is type(after)
    if isinstance(before, dict):
        assert before.keys() == after.keys()
        result = []
        for key in before:
            escaped = key.replace("~", "~0").replace("/", "~1")
            result.extend(differences(before[key], after[key], pointer + "/" + escaped))
        return result
    if isinstance(before, list):
        assert len(before) == len(after)
        result = []
        for i, (left, right) in enumerate(zip(before, after)):
            result.extend(differences(left, right, pointer + "/" + str(i)))
        return result
    return [] if before == after else [{"pointer": pointer, "before": before, "after": after}]


def assign_pointer(value, pointer, replacement):
    parts = pointer.lstrip("/").split("/")
    for part in parts[:-1]:
        value = value[int(part)] if isinstance(value, list) else value[part]
    key = int(parts[-1]) if isinstance(value, list) else parts[-1]
    value[key] = replacement


assert not (OUT / "two-material-successor.author-input-FIRST.freeze.json").exists()
entry_path = AUTHOR / "neutral-whole18-source35-partners30-P18-cases36.author-independent-review.entry.json"
entry = read(entry_path)
body_path = ROOT / entry["wholeMaterialsP18Cases36"]["path"]
set_path = ROOT / entry["normalCandidateSet"]["path"]
config_path = ROOT / entry["normalP18Config"]["path"]
original_body = read(body_path)
original_set = read(set_path)
original_config = read(config_path)
frame_path = ROOT / entry["inputWholeGoalsSourcePartners"]["path"]
frame = read(frame_path)
b_path = B_REVIEW / "eighteen-whole-science-source-P-A-M.independent-b.first.verdict.json"
c_path = C_REVIEW / "whole18-source35-partners30-P18-cases36.independent-c.scientific-FIRST.verdict.json"
c_addendum_path = C_REVIEW / "seven-source-holds.current-operative-vs-material-scope-and-closure-evidence.actual.json"
b_verdict = read(b_path)
c_verdict = read(c_path)
c_addendum = read(c_addendum_path)
findings = {f["findingId"]: f for f in b_verdict["findings"]}
assert findings["EVO18B-MATERIAL-001"]["goalId"] == GOAL_PLANTS
assert findings["EVO18B-MATERIAL-002"]["goalId"] == GOAL_DATING
assert len(c_verdict["sourceAndOperatorHolds"]) == len(c_addendum["findings"]) == 7
assert len(original_body["entries"]) == len(original_set["goals"]) == 18
assert sum(len(e["newAuthoredWholeCases"]) for e in original_body["entries"]) == 36
assert len(frame["wholeOriginalSourceDutyRows"]) == 35
assert len(frame["wholeOriginalAndCurrentPartnerGoals"]) == 30
current_path = ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json"
current = read(current_path)
snapshot_path = ROOT / original_config["landscapePath"]
assert current == read(snapshot_path)
current_by_id = {g["id"]: g for g in current["goals"]}
assert len(current["goals"]) == 479
assert all(e["wholeCurrentGoal"] == current_by_id[e["goalId"]] for e in original_body["entries"])
for field in ["wholeMaterialsP18Cases36", "normalCandidateSet", "normalP18Config",
              "normalP18Records", "inputWholeGoalsSourcePartners", "currentWhole479InactiveCanonical"]:
    assert binding(ROOT / entry[field]["path"]) == entry[field]

write("two-material-successor.author-input-FIRST.freeze.json", {
    "schemaVersion": 1, "role": "exact author intake before preparing material corrections",
    "createdAt": STAMP, "author": "Codex evo18_two_material_remediation_author",
    "originalWholeAuthorEntry": binding(entry_path), "wholeMaterials18Cases36": binding(body_path),
    "wholeCandidateSet18": binding(set_path), "originalP18Config": binding(config_path),
    "originalP18Records": entry["normalP18Records"], "wholeSource35Partners30": binding(frame_path),
    "currentWhole479": binding(current_path), "frozenWhole479": binding(snapshot_path),
    "unchangedKinds394": binding(ROOT / original_config["semanticKindLedgerPath"]),
    "unchangedCriteria": binding(ROOT / original_config["reviewCriteriaPath"]),
    "actualBFIRST": binding(b_path), "actualCFIRST": binding(c_path),
    "actualCSevenHoldsAddendum": binding(c_addendum_path),
    "targetFindingIds": ["EVO18B-MATERIAL-001", "EVO18B-MATERIAL-002"],
    "authorRemedyIsNotIndependentApproval": True, "strictGain": 0, "activeWrites": []})

body = copy.deepcopy(original_body)
plants = next(e for e in body["entries"] if e["goalId"] == GOAL_PLANTS)
dating = next(e for e in body["entries"] if e["goalId"] == GOAL_DATING)
plant_case = plants["newAuthoredWholeCases"][0]
dating_case = dating["newAuthoredWholeCases"][0]
assert plant_case["caseId"] == "species-plants-key"
assert dating_case["caseId"] == "fossil-ash-bracketing"
plant_case["taskDe"] = plant_case["taskDe"].replace(
    "weshalb Blattform allein für P 1 nicht genügt",
    "weshalb das Merkmal „ungelappt“ allein P 1 nicht eindeutig zuordnet")
plant_case["taskEn"] = plant_case["taskEn"].replace(
    "why shape alone is insufficient for P 1",
    "why the trait ‘unlobed’ alone does not identify P 1 uniquely")
plant_case["workedResponseDe"] = plant_case["workedResponseDe"].replace(
    "Blattstellung und Form werden gemeinsam mit dem Schlüssel verglichen.",
    "Das Merkmal „ungelappt“ allein lässt B und D zu; die zusätzlich beobachtete Herzform unterscheidet in dieser Auswahl B. Blattstellung und Form werden gemeinsam mit dem Schlüssel verglichen.")
plant_case["workedResponseEn"] = plant_case["workedResponseEn"].replace(
    "Arrangement and shape are compared jointly with the key.",
    "The trait ‘unlobed’ alone leaves B and D possible; the additionally observed heart shape distinguishes B within this selection. Arrangement and shape are compared jointly with the key.")
dating_case["workedResponseDe"] = dating_case["workedResponseDe"].replace(
    "C 14 eignet sich nicht für millionenalte vulkanische Asche; organisches Material und kurzer nutzbarer Zeitbereich wären nötig.",
    "C 14 eignet sich nicht für millionenalte vulkanische Asche. Die Methode benötigt geeignetes kohlenstoffhaltiges Material innerhalb ihres viel kürzeren nutzbaren Altersbereichs. Auch bestimmte anorganische Carbonate können unter geeigneten Bedingungen datierbar sein. Anfangsgehalt, Reservoir-Effekte und späterer Kohlenstoffaustausch sind materialabhängig zu prüfen; für Kalenderalter ist eine passende Kalibrierung nötig.")
dating_case["workedResponseEn"] = dating_case["workedResponseEn"].replace(
    "C 14 is unsuitable for million-year-old volcanic ash; it requires appropriate organic material and a much shorter usable interval.",
    "C 14 is unsuitable for million-year-old volcanic ash. The method requires suitable carbon-bearing material within its much shorter usable age range. Certain inorganic carbonates can also be dated under appropriate conditions. Initial content, reservoir effects and later carbon exchange require material-specific assessment; calendar ages require appropriate calibration.")

# Recompose only the two affected whole briefs; every unrelated field stays exact.
for goal_entry in [plants, dating]:
    case = goal_entry["newAuthoredWholeCases"][0]
    brief = goal_entry["wholeProfile"]["applicationCaseBriefs"][0]
    for lang, task_label, transfer_label in [("De", "Auftrag", "Frische Variation"), ("En", "Task", "Fresh variation")]:
        brief["taskDemand" + lang] = (case["material" + lang] + "\n\n" + task_label + ": " +
                                     case["task" + lang] + "\n\n" + transfer_label + ": " +
                                     case["freshTransferTask" + lang])
        brief["expectedPerformance" + lang] = (case["workedResponse" + lang] + "\n\nTransfer: " +
                                              case["workedFreshTransfer" + lang])

actual_diffs = differences(original_body, body)
expected_pointers = {
    "/entries/0/newAuthoredWholeCases/0/taskDe", "/entries/0/newAuthoredWholeCases/0/taskEn",
    "/entries/0/newAuthoredWholeCases/0/workedResponseDe", "/entries/0/newAuthoredWholeCases/0/workedResponseEn",
    "/entries/0/wholeProfile/applicationCaseBriefs/0/taskDemandDe", "/entries/0/wholeProfile/applicationCaseBriefs/0/taskDemandEn",
    "/entries/0/wholeProfile/applicationCaseBriefs/0/expectedPerformanceDe", "/entries/0/wholeProfile/applicationCaseBriefs/0/expectedPerformanceEn",
    "/entries/14/newAuthoredWholeCases/0/workedResponseDe", "/entries/14/newAuthoredWholeCases/0/workedResponseEn",
    "/entries/14/wholeProfile/applicationCaseBriefs/0/expectedPerformanceDe", "/entries/14/wholeProfile/applicationCaseBriefs/0/expectedPerformanceEn"}
assert {d["pointer"] for d in actual_diffs} == expected_pointers
masked = copy.deepcopy(body)
for difference in actual_diffs:
    assign_pointer(masked, difference["pointer"], difference["before"])
assert masked == original_body

profile_schema = read(ROOT / "contracts/goal-evidence/v2/goal-evidence-profile.schema.json")
validator = jsonschema.Draft202012Validator({"$ref": "#/$defs/profile", "$defs": profile_schema["$defs"]})
for goal_entry in body["entries"]:
    assert not list(validator.iter_errors(goal_entry["wholeProfile"]))
    assert goal_entry["status"] == "needs_human_review"
    assert goal_entry["reviewAuthority"] == "ai_candidate"
    assert goal_entry["evidenceLevel"] == "E1" and goal_entry["maximumClaimScope"] == "G1"
    assert not goal_entry["humanApproval"] and not goal_entry["humanTrial"]
    assert not goal_entry["independentScientificApproval"] and not goal_entry["currentNativeApproval"]
    assert not goal_entry["actualExperimentPerformed"] and not goal_entry["actualLearnerPerformance"]
    old_entry = next(e for e in original_body["entries"] if e["goalId"] == goal_entry["goalId"])
    assert goal_entry["wholeCurrentGoal"] == old_entry["wholeCurrentGoal"]
    assert goal_entry["sourceDutyRowIds"] == old_entry["sourceDutyRowIds"]
    assert goal_entry["sourceAndPartnerFrame"] == old_entry["sourceAndPartnerFrame"]

successor_body = write("whole18-cases36-two-material-corrections.author-successor.json", body)
diff_path = write("two-material-corrections.exact-values-and-masked-whole-equality.actual.json", {
    "schemaVersion": 1, "role": "actual complete before/after values, no scientific approval",
    "original": binding(body_path), "successor": binding(successor_body), "actualFieldChanges": actual_diffs,
    "operativeChangedFieldCount": 12, "changedWholeGoalIds": [GOAL_PLANTS, GOAL_DATING],
    "unrelatedFieldsExactlyEqualAfterMasking": True, "wholeCurrent18Preserved": True,
    "wholeSource35Partners30Preserved": True, "wholeCases36Preserved": True,
    "sourceDutiesRemoved": 0, "independentApproval": False, "strictGain": 0})

candidate_set = copy.deepcopy(original_set)
candidate_set["reviewId"] = REVIEW_ID
candidate_set["reviewedAt"] = STAMP
candidate_set["reviewer"] = "Codex evo18_two_material_remediation_author; two material corrections only; independent followups pending; model variant unexposed"
for spec, goal_entry in zip(candidate_set["goals"], body["entries"]):
    assert spec["goalId"] == goal_entry["goalId"]
    spec["profile"] = copy.deepcopy(goal_entry["wholeProfile"])
successor_set = write("whole18-positive-profile-candidate-set.two-material-successor.json", candidate_set)
config = copy.deepcopy(original_config)
config["reviewId"] = REVIEW_ID
config["reviewPath"] = (OUT / "whole18-positive.two-material-successor.review.jsonl").relative_to(ROOT).as_posix()
successor_config = write("whole18-positive.two-material-successor.config.json", config)
write("bounded-primary-reference-reading-and-two-author-remedies.json", {
    "schemaVersion": 1, "role": "own bounded paraphrase of actually accessed primary references; not curriculum approval",
    "licenseForOwnAnnotations": "CC-BY-4.0", "accessedAt": STAMP,
    "references": [
        {"url": "https://www.usgs.gov/publications/radiocarbon-dating-terrestrial-carbonates",
         "title": "Radiocarbon dating of terrestrial carbonates", "author": "Jeffrey S. Pigati", "publicationYear": 2014,
         "doi": "10.1007/978-94-007-6326-5_152-1", "actuallyRead": True,
         "boundedParaphrase": "Some primary and secondary terrestrial carbonate deposits can support radiocarbon dating when conditions permit. Isotopic disequilibrium and open-system behaviour require assessment; being inorganic alone does not exclude a sample.",
         "claimsSupported": ["organic-only universal is false", "carbonate suitability is conditional", "later exchange requires assessment"]},
        {"url": "https://www2.whoi.edu/site/nosams/radiocarbon-data-and-calculations/",
         "title": "Radiocarbon Data and Calculations", "organization": "WHOI NOSAMS", "publishedAt": "2020-05-26",
         "actuallyRead": True, "sectionsRead": ["Process Blanks", "Radiocarbon Age", "Limiting Ages"],
         "boundedParaphrase": "NOSAMS distinguishes radiocarbon ages from calendar calibration and reservoir correction. Practical limits depend on sample, process blanks and measurement uncertainty; both organic and inorganic carbon samples are described. These ranges are far shorter than a million years.",
         "claimsSupported": ["carbon-bearing material is not restricted to organic material", "reservoir and calendar calibration matter", "million-year ash cannot use this method"]}],
    "referenceLimit": "Method references do not repair the seven curricular source/course holds or prove the synthetic observations were performed.",
    "authorRemedies": [
        {"findingId": "EVO18B-MATERIAL-001", "goalId": GOAL_PLANTS,
         "actualFiniteLogic": "B and D are both unlobed; within the four supplied candidates the additional heart-shaped observation distinguishes B. Full key paths and out-of-key caution are retained.",
         "authorDisposition": "corrected_candidate_for_independent_targeted_review"},
        {"findingId": "EVO18B-MATERIAL-002", "goalId": GOAL_DATING,
         "actualFiniteLogic": "1.7–2.5 million-year bracket, million-year volcanic-ash exclusion, reworking variation and daughter-loss direction are unchanged. Only the universal organic-only claim and matching bilingual brief are corrected.",
         "authorDisposition": "corrected_candidate_for_independent_targeted_review"}],
    "remainingBFinding": findings["EVO18B-ATOMICITY-001"],
    "remainingCSourceAndCourseHoldsExact": c_verdict["sourceAndOperatorHolds"],
    "remainingCCurrentOperativeAddendumExact": c_addendum["findings"],
    "independentFollowupsNeeded": 2, "wholeSourceApproval": False, "wholeCourseApproval": False,
    "nativeDPApproval": False, "currentVApproval": False, "humanApproval": False,
    "humanTrial": False, "actualLearnerPerformance": False, "actualExperimentPerformed": False,
    "newScientificClosures": 0, "restoredBindings": 0, "strictGain": 0, "activeWrites": []})
print(json.dumps({"wholeGoals": 18, "wholeCases": 36, "sourceDuties": 35, "wholePartners": 30,
                  "actualCorrectedGoalIds": [GOAL_PLANTS, GOAL_DATING], "operativeFieldChanges": 12,
                  "maskedOtherFieldsExact": True, "profileSchemaErrors": 0,
                  "config": successor_config.relative_to(ROOT).as_posix(), "strictGain": 0}))
