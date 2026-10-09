# SPDX-License-Identifier: Apache-2.0
"""Seal scoped normal checks and a neutral handoff; genuine followups remain open."""

import copy
import hashlib
import importlib.util
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

import jsonschema

ROOT = Path.cwd()
OUT = Path(__file__).resolve().parent
AUTHOR = OUT.parent / "biologie-evolution-systematics-behavior-eighteen-whole-author-v1"
STAMP = datetime.now(timezone.utc).isoformat()


def read(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def bind(path):
    path = Path(path)
    assert not path.is_symlink()
    raw = path.read_bytes()
    return {"path": path.relative_to(ROOT).as_posix(),
            "sha256": "sha256:" + hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}


def write(name, data):
    path = OUT / name
    assert not path.exists()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    assert read(path) == data
    return path


assert not (OUT / "two-material-successor.author.final.freeze.json").exists()
input_first_path = OUT / "two-material-successor.author-input-FIRST.freeze.json"
input_first = read(input_first_path)
for value in input_first.values():
    if isinstance(value, dict) and {"path", "sha256", "bytes"} <= value.keys():
        assert bind(ROOT / value["path"]) == value
config_path = OUT / "whole18-positive.two-material-successor.config.json"
set_path = OUT / "whole18-positive-profile-candidate-set.two-material-successor.json"
body_path = OUT / "whole18-cases36-two-material-corrections.author-successor.json"
records_path = OUT / "whole18-positive.two-material-successor.review.jsonl"
config = read(config_path)
candidate_set = read(set_path)
body = read(body_path)
records = [json.loads(line) for line in records_path.read_text().splitlines()]
old_records_path = ROOT / input_first["originalP18Records"]["path"]
old_records = [json.loads(line) for line in old_records_path.read_text().splitlines()]
assert len(records) == len(old_records) == len(candidate_set["goals"]) == len(body["entries"]) == 18
assert all(r["status"] == "needs_human_review" and r["reviewAuthority"] == "ai_candidate" and
           r["evidenceLevel"] == "E1" and r["maximumClaimScope"] == "G1" for r in records)
record_schema = read(ROOT / "contracts/goal-evidence/v2/goal-evidence-profile.schema.json")
config_schema = read(ROOT / "contracts/goal-evidence/v2/goal-evidence-review-config.schema.json")
record_validator = jsonschema.Draft202012Validator(record_schema)
config_validator = jsonschema.Draft202012Validator(config_schema)
assert not list(config_validator.iter_errors(config))
assert all(not list(record_validator.iter_errors(record)) for record in records)
changed_profiles = []
for old, new, spec, goal_entry in zip(old_records, records, candidate_set["goals"], body["entries"]):
    assert old["goalId"] == new["goalId"] == spec["goalId"] == goal_entry["goalId"]
    assert new["profile"] == spec["profile"] == goal_entry["wholeProfile"]
    for key in ["goalFingerprint", "reviewInputFingerprint", "reviewCriteriaFingerprint", "goalFingerprintRuleVersion",
                "profileRuleVersion", "landscapeId", "status", "reviewAuthority", "evidenceLevel", "maximumClaimScope"]:
        assert old[key] == new[key]
    if old["profile"] != new["profile"]:
        assert old["profileFingerprint"] != new["profileFingerprint"]
        changed_profiles.append(new["goalId"])
    else:
        assert old["profileFingerprint"] == new["profileFingerprint"]
    masked = copy.deepcopy(new)
    for key in ["reviewId", "reviewedAt", "reviewer", "profile", "profileFingerprint"]:
        masked[key] = old[key]
    assert masked == old
assert changed_profiles == ["0db20819-ee94-54c6-8ecb-aff8c9b7419e", "e3167331-f855-5030-9673-29f55a7b4230"]
terminals = [OUT / "checks" / (name + ".terminal.actual.json")
             for name in ["normal-materialize-P18", "normal-check-P18"]]
for terminal in terminals:
    receipt = read(terminal)
    assert receipt["exitCode"] == 0 and receipt["activeInputsUnchanged"]
    for key in ["stdout", "stderr"]:
        assert bind(ROOT / receipt[key]["path"]) == receipt[key]
stdout = (OUT / "checks/normal-check-P18.stdout.actual.txt").read_text()
assert all(line in stdout for line in ["Configured goals: 18", "Approved: 0", "Needs human review: 18", "Rejected: 0", "Blocking issues: 0"])

loader = importlib.util.spec_from_file_location("normal_validate_schemas", ROOT / "scripts/validate_schemas.py")
schema_module = importlib.util.module_from_spec(loader)
loader.loader.exec_module(schema_module)
symlink_errors = schema_module.curriculum_symlink_errors(ROOT)
assert not symlink_errors, symlink_errors
runtime_schema = read(ROOT / "docs/landscape-runtime.schema.json")
json_artifacts = sorted(OUT.rglob("*.json"))
assert all(schema_module.validate_file(str(path.relative_to(ROOT)), runtime_schema) for path in json_artifacts)
paths = [path.relative_to(ROOT).as_posix() for path in OUT.rglob("*") if path.is_file()]
ignored = subprocess.run(["git", "check-ignore", "--stdin"], input=("\n".join(paths) + "\n").encode(),
                         cwd=ROOT, capture_output=True)
assert ignored.returncode == 1 and not ignored.stdout
references_path = OUT / "bounded-primary-reference-reading-and-two-author-remedies.json"
references = read(references_path)
assert references["remainingBFinding"]["findingId"] == "EVO18B-ATOMICITY-001"
assert len(references["remainingCSourceAndCourseHoldsExact"]) == 7
old_body = read(ROOT / input_first["wholeMaterials18Cases36"]["path"])
assert body["entries"][13] == old_body["entries"][13]
for i, (old_entry, new_entry) in enumerate(zip(old_body["entries"], body["entries"])):
    if i not in [0, 14]:
        assert old_entry == new_entry

summary_path = write("checks/two-material-successor.scoped-normal-check-summary.actual.json", {
    "schemaVersion": 1, "role": "actual technical verification of a substantive author successor",
    "createdAt": STAMP, "normalMaterializer": bind(terminals[0]), "normalP18Check": bind(terminals[1]),
    "normalConfiguredGoals": 18, "normalApproved": 0, "normalNeedsHumanReview": 18, "normalBlockingIssues": 0,
    "completeRecordSchemaChecks": 18, "recordSchemaErrors": 0, "configSchemaErrors": 0,
    "jsonArtifactsNormallyParsedBeforeSeal": len(json_artifacts), "jsonArtifactErrors": 0,
    "normalCurriculumSymlinkErrors": 0, "ignoredPackageFiles": 0,
    "changedProfilesWithActualSubstantiveMaterialChanges": changed_profiles,
    "unchangedProfilesAndFingerprintCount": 16, "all18GoalCriteriaInputFingerprintsUnchanged": True,
    "recordsOnlyAdministrativeFieldsAndTwoActualProfilesChanged": True,
    "wholeGoals": 18, "wholeBilingualCases": 36, "wholeSourceDuties": 35, "wholePartners": 30,
    "unchangedOther16FullMaterialEntries": True, "unchangedAtomarityDisputedOrdinal14FullEntry": True,
    "retainedAtomarityHolds": 1, "retainedSourceCourseHolds": 7,
    "independentTargetedMaterialFollowups": 0, "authorCandidateNotIndependentScienceApproval": True,
    "humanApproval": False, "humanTrial": False, "strictGain": 0, "newScientificClosures": 0,
    "restoredBindings": 0, "activeWrites": [], "fullQAOrBuildRun": False})
payloads = [input_first_path, body_path, set_path, config_path, records_path, references_path,
            OUT / "two-material-corrections.exact-values-and-masked-whole-equality.actual.json", summary_path] + terminals
first_path = write("two-material-successor.author-result-FIRST.freeze.json", {
    "schemaVersion": 1, "role": "author result freeze, not independent FIRST approval",
    "createdAt": STAMP, "author": "Codex evo18_two_material_remediation_author",
    "boundPayloads": [bind(path) for path in payloads], "twoMaterialRemediesAwaitIndependentTargetedFollowups": True,
    "remainingBFindingId": "EVO18B-ATOMICITY-001", "remainingCSourceCourseFindingIds":
        [f["findingId"] for f in references["remainingCSourceAndCourseHoldsExact"]],
    "wholeNativeDAndPApproval": False, "sourceCourseClosure": False,
    "humanApproval": False, "humanTrial": False, "strictGain": 0, "activeWrites": []})
entry_path = write("neutral-whole18-two-material-findings-author-successor.targeted-independent-review.entry.json", {
    "schemaVersion": 1, "role": "neutral whole18/36 unchanged source35/partner30 author successor for two targeted independent material followups",
    "createdAt": STAMP, "selectedWholeGoalIds": config["scope"]["goalIds"],
    "targetFindingIds": ["EVO18B-MATERIAL-001", "EVO18B-MATERIAL-002"],
    "targetWholeGoalIds": changed_profiles, "originalWholeAuthorEntry": input_first["originalWholeAuthorEntry"],
    "authorInputFirst": bind(input_first_path), "authorResultFirst": bind(first_path),
    "wholeSource35Partners30ExactOriginalFrame": input_first["wholeSource35Partners30"],
    "currentWhole479ExactInactiveSnapshot": input_first["frozenWhole479"],
    "wholeKinds394UnchangedCandidate": input_first["unchangedKinds394"],
    "wholeMaterials18Cases36Successor": bind(body_path), "wholePositiveCandidateSet18": bind(set_path),
    "normalP18Config": bind(config_path), "normalP18CandidateRecords": bind(records_path),
    "exactChangedValuesAndMaskedPreservation": bind(OUT / "two-material-corrections.exact-values-and-masked-whole-equality.actual.json"),
    "actualPrimaryReferencesAndAuthorReasoning": bind(references_path), "actualScopedNormalChecks": bind(summary_path),
    "originalIndependentBFIRST": input_first["actualBFIRST"], "originalIndependentCFIRST": input_first["actualCFIRST"],
    "originalIndependentCOperativeSevenHoldAddendum": input_first["actualCSevenHoldsAddendum"],
    "remainingAtomarityFindingExact": references["remainingBFinding"],
    "remainingSourceAndCourseHoldsExact": references["remainingCSourceAndCourseHoldsExact"],
    "preservation": {"wholeGoals": 18, "wholeCases": 36, "sourceDuties": 35, "wholePartners": 30,
                     "wholeCurrentCanonicalNodes": 479, "currentCurricularAtomicDenominator": 394,
                     "removedSourceDuties": 0, "changedUnrelatedFields": 0, "operativeChangedFields": 12},
    "requiredNextQA": ["Two genuine independent targeted bilingual material/profile followups on the actual changed values and full preserved frame.",
                       "Resolve the separately retained semantic atomarity and seven actual source/course findings without weakening their duties.",
                       "Current native/page/context D/P and actual machine V bindings remain separate; this author successor approves none."],
    "reviewAuthority": "ai_candidate", "status": "needs_human_review", "evidenceLevel": "E1", "maximumClaimScope": "G1",
    "independentScientificApproval": False, "wholeSourceApproval": False, "wholeCourseApproval": False,
    "currentNativeDPApproval": False, "currentVApproval": False, "humanApproval": False, "humanTrial": False,
    "actualLearnerPerformance": False, "actualExperimentPerformed": False,
    "newScientificClosures": 0, "restoredBindings": 0, "strictGain": 0, "activeWrites": []})
for path in OUT.rglob("*.json"):
    assert schema_module.validate_file(str(path.relative_to(ROOT)), runtime_schema)
for path in OUT.rglob("*.jsonl"):
    assert all(json.loads(line) for line in path.read_text().splitlines())
files = sorted(path for path in OUT.rglob("*") if path.is_file())
seal_path = write("two-material-successor.author.final.freeze.json", {
    "schemaVersion": 1, "role": "portable complete author package seal, no independent approval",
    "createdAt": STAMP, "neutralEntry": bind(entry_path), "boundFiles": [bind(path) for path in files],
    "fullJSONAndJSONLParse": True, "normalP18CheckExit": 0, "normalCurriculumSymlinkErrors": 0,
    "packageFilesIgnored": 0, "strictGain": 0, "activeWrites": [], "humanApproval": False, "humanTrial": False})
assert schema_module.validate_file(str(seal_path.relative_to(ROOT)), runtime_schema)
print(json.dumps({"neutralEntry": bind(entry_path), "finalSeal": bind(seal_path),
                  "normalP18": "PASS: 18 candidates, 0 approved, 0 blocking", "strictGain": 0,
                  "remainingAtomarityHolds": 1, "remainingSourceCourseHolds": 7}))
