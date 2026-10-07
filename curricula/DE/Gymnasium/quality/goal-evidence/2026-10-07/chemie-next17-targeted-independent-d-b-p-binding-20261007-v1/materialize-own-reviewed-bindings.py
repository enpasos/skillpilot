"""Apache-2.0. Native candidate records from actual independent judgments only."""
from pathlib import Path
from datetime import datetime, timezone
import copy
import hashlib
import json
import subprocess

ROOT = Path.cwd()
AUTHOR = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-targeted-description-routing-context-author-v2-20261007"
OWN = Path(__file__).resolve().parent
REVIEW_ID = "chemie-next17-targeted-independent-d-b-p-binding-20261007-v1"

def read(path):
    return json.loads(path.read_text())

def digest(path):
    return "sha256:" + hashlib.sha256(path.read_bytes()).hexdigest()

def write(path, value):
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")

def write_jsonl(path, values):
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("".join(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n" for row in values))

def repo_path(path):
    return str(path.relative_to(ROOT))

judgments = read(OWN / "independent-first-pass.judgments.json")
goals = judgments["goals"]
started = read(OWN / "checks/author-freeze.actual-verification.json")["checkedAtUTC"]
completed = datetime.now(timezone.utc).isoformat()
goal_ids = [row["goalId"] for row in goals]
first_pass = {
    "documentType": "Own independent first-pass frozen before peer output access",
    "completedAtUTC": completed,
    "independentPeerOutputsRead": False,
    "judgmentsPath": repo_path(OWN / "independent-first-pass.judgments.json"),
    "judgmentsDigest": digest(OWN / "independent-first-pass.judgments.json"),
    "descriptionKeep": 17,
    "positiveKeep": 16,
    "positiveRevise": 1,
    "humanApproval": False,
    "strictNetGain": 0,
}
write(OWN / "independent-first-pass.actual-seal.json", first_pass)

round_path = AUTHOR / "native-d-seventeen/round-b"
campaign = read(round_path / "description-review-campaign.json")
review_input = read(round_path / "description-review-input.json")
bundle = read(round_path / "review-bundle-manifest.json")
assert [row["goalId"] for row in review_input["goals"]] == goal_ids
write(OWN / "native-d/campaign.json", campaign)
write(OWN / "native-d/input.json", review_input)
write(OWN / "native-d/bundle-manifest.json", bundle)
batch = campaign["batches"][0]
assert len(campaign["batches"]) == 1
d_run_id = REVIEW_ID + ".d-b"
records = []
for judgment, supplied in zip(goals, review_input["goals"]):
    row = {
        "$schema": "https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json",
        "schemaVersion": 1,
        "recordId": REVIEW_ID + "." + judgment["goalId"],
        "runId": d_run_id,
        "campaignId": campaign["campaignId"],
        "roundId": campaign["roundId"],
        "bundleFingerprint": campaign["bundleFingerprint"],
        "bookDigest": campaign["bookDigest"],
        **{key: supplied[key] for key in ["goalId", "goalFingerprint", "pageFingerprint", "currentTitleDe", "currentTitleEn", "currentDescriptionDe", "currentDescriptionEn"]},
        "decision": judgment["descriptionDecision"],
        "understandingEvidence": {
            "essentialUnderstandingDe": judgment["essentialDe"],
            "essentialUnderstandingEn": judgment["essentialEn"],
            "observablePerformanceDe": judgment["performanceDe"],
            "observablePerformanceEn": judgment["performanceEn"],
            "transferExpectationDe": judgment["transferDe"],
            "transferExpectationEn": judgment["transferEn"],
        },
        "rationale": judgment["rationale"],
        "evidenceProfileContract": "positive-understanding-evidence-v2",
        "evidenceProfileRecommendation": "revise" if judgment["positiveMaterialDecision"] == "revise" else "none",
        "recordStatus": "candidate",
        "reviewAuthority": "ai_candidate",
    }
    records.append(row)
d_records_path = OWN / "native-d/results" / (batch["batchId"] + ".records.jsonl")
write_jsonl(d_records_path, records)
params = {
    "actualReviewer": "Codex /root/chem17_targeted_independent_b",
    "samplingParameters": "not exposed by the session",
    "purpose": "Independent targeted D-B/P binding review; no peer outputs read; no approval or strict gain",
    "all17PDFPhysicalPagesActuallyViewed": list(range(3, 20)),
    "all34CompleteBilingualMaterialCasesRead": True,
    "modelVersion": "not exposed by the session",
}
write(OWN / "actual-review-parameters.json", params)
run_base = {
    "$schema": "https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json",
    "schemaVersion": 1,
    "provider": "OpenAI",
    "model": "Codex; exact session model version not exposed",
    "role": "subject_reviewer",
    "generationParametersFingerprint": digest(OWN / "actual-review-parameters.json"),
    "blindToOtherRuns": True,
    "goalIds": goal_ids,
    "startedAt": started,
    "completedAt": completed,
    "status": "completed",
    "toolchainVersion": "codex-native-targeted-review-20261007",
}
d_run = {
    **run_base,
    "runId": d_run_id,
    "campaignId": campaign["campaignId"],
    "roundId": campaign["roundId"],
    "batchId": batch["batchId"],
    "batchInputFingerprint": batch["batchInputFingerprint"],
    "bundleFingerprint": campaign["bundleFingerprint"],
    "bookDigest": campaign["bookDigest"],
    "promptFamilyId": "goal-description-understanding-evidence-review-v2",
    "promptFingerprint": campaign["promptFingerprint"],
    "criteriaFingerprint": campaign["criteriaFingerprint"],
    "independenceGroupId": campaign["independenceGroupId"],
    "inputArtifacts": [{"role": row["role"], "digest": row["digest"]} for row in bundle["artifacts"]] + [{"role": "description_review_batch_input_jsonl", "digest": batch["batchInputFingerprint"]}],
    "outputDigest": digest(d_records_path),
}
write(OWN / "native-d/results" / (batch["batchId"] + ".run.json"), d_run)

p_config = read(AUTHOR / "configs/positive-evidence17.author-candidates.config.json")
p_rows = [json.loads(line) for line in (AUTHOR / "candidate/positive-evidence17.author-candidates.review.jsonl").read_text().splitlines()]
assert [row["goalId"] for row in p_rows] == goal_ids
p_run_id = REVIEW_ID + ".p-b"
for row, judgment in zip(p_rows, goals):
    row["reviewId"] = REVIEW_ID
    row["reviewer"] = "Codex /root/chem17_targeted_independent_b"
    row["reviewedAt"] = completed
    row["reason"] = "Actual independent targeted current binding and complete bilingual case review: " + judgment["rationale"] + " AI candidate E1/G1; no observed learner work, human approval, active writes or strict closure."
    row["reviewRunIds"] = [p_run_id]
    assert row["status"] == "needs_human_review" and row["reviewAuthority"] == "ai_candidate"
    if judgment["positiveMaterialDecision"] == "revise":
        row["dissent"] = ["Independent B REVISE: gas case1 control reference introduces an undocumented damp splint; preserve this finding until exact bilingual material/profile correction is independently reviewed."]
p_records_path = OWN / "native-p/positive17.current-independent-b.review.jsonl"
write_jsonl(p_records_path, p_rows)
prompt_path = OWN / "native-p/review-prompt.md"
assert not prompt_path.exists()
prompt_path.write_text("# Independent targeted Chemistry P binding review\n\nReview the frozen author-v2 whole bilingual goals, complete material/task/reference-response/boundary cases, exact current native pages, source and context routes, and retained positive-understanding-evidence-v2 bodies. Keep unchanged valid scientific decisions; independently assess the changed bindings and actual supplied material limits. Record any concrete unsupported reference inference in dissent. Remain blind to current other reviewers' outputs. All records remain ai_candidate, needs_human_review, E1/G1. No actual learner work, source-superset completion, visualization publication approval, human approval/trial, active writes or strict gain is claimed.\n")
p_criteria = ROOT / p_config["reviewCriteriaPath"]
p_run = {
    **run_base,
    "runId": p_run_id,
    "bundleFingerprint": digest(AUTHOR / "candidate/whole17-reviewer-material.author.json"),
    "bookDigest": digest(AUTHOR / "native-d-seventeen/bundle/book-model.json"),
    "promptFamilyId": "chemistry-targeted-current-positive-binding-independent-b-v1",
    "promptFingerprint": digest(prompt_path),
    "criteriaFingerprint": digest(p_criteria),
    "independenceGroupId": REVIEW_ID + ".independent-b",
    "inputArtifacts": [
        {"role": "review_prompt", "digest": digest(prompt_path)},
        {"role": "review_criteria", "digest": digest(p_criteria)},
        {"role": "review_input_json", "digest": digest(AUTHOR / "candidate/whole17-reviewer-material.author.json")},
        {"role": "review_input_jsonl", "digest": digest(AUTHOR / "candidate/positive-evidence17.author-candidates.review.jsonl")},
        {"role": "book_model", "digest": digest(AUTHOR / "native-d-seventeen/bundle/book-model.json")},
        {"role": "book_pdf", "digest": digest(AUTHOR / "native-d-seventeen/bundle/book.pdf")},
        {"role": "book_pdf_render_manifest", "digest": digest(AUTHOR / "native-d-seventeen/bundle/book.pdf.render-manifest.json")},
        {"role": "book_html", "digest": digest(AUTHOR / "native-d-seventeen/bundle/book.html")},
    ],
    "outputDigest": digest(p_records_path),
}
p_run_path = OWN / "native-p/current-independent-b.run.json"
write(p_run_path, p_run)
p_config["reviewId"] = REVIEW_ID
p_config["reviewPath"] = repo_path(p_records_path)
p_config["reviewRunManifestPaths"] = [repo_path(p_run_path)]
p_config["scope"]["label"] = "Independent B current17 candidate binding; 16 P KEEP plus explicit gas-control REVISE dissent; no human approval or strict gain; three V HOLDs retained"
write(OWN / "native-p/positive17.current-independent-b.config.json", p_config)

current = read(AUTHOR / "inputs/current-canonical.snapshot.json")
candidate = read(AUTHOR / "candidate/canonical.whole-current-plus-targeted-corrections.json")
current_by = {row["id"]: row for row in current["goals"]}
candidate_by = {row["id"]: row for row in candidate["goals"]}
assert current_by.keys() == candidate_by.keys()
changed = [goal_id for goal_id in current_by if current_by[goal_id] != candidate_by[goal_id]]
assert set(changed) == {"fd309753-4d48-5570-a4ec-09dfeb20ff9c", "22133f29-ef02-4408-8f8d-2bbea3275d91", "9751b6d8-cde3-527b-b37c-babb6cee79d2"}
pages = []
for index, (supplied, judgment) in enumerate(zip(review_input["goals"], goals), 3):
    whole = candidate_by[supplied["goalId"]]
    page = supplied["reviewContext"]["page"]
    assert whole["title"] == supplied["currentTitleDe"] == page["title"]
    assert whole["titleEn"] == supplied["currentTitleEn"]
    assert whole["description"] == supplied["currentDescriptionDe"] == page["description"]
    assert whole["descriptionEn"] == supplied["currentDescriptionEn"]
    assert whole["requires"] == current_by[whole["id"]]["requires"]
    assert whole["applicability"] == current_by[whole["id"]]["applicability"]
    assert whole["tags"] == current_by[whole["id"]]["tags"]
    visualization = page.get("visualization")
    if visualization:
        asset = ROOT / ("app/public" + visualization["url"])
        assert digest(asset) == visualization["originalDigest"]
    pages.append({"goalId": whole["id"], "physicalPDFPage": index, "actuallyViewedRaster": repo_path(OWN / "actual-pdf-pages" / f"page-{index:02d}.png"), "rasterDigest": digest(OWN / "actual-pdf-pages" / f"page-{index:02d}.png"), "goalFingerprint": supplied["goalFingerprint"], "pageFingerprint": supplied["pageFingerprint"], "breadcrumbs": page["breadcrumbs"], "visualization": visualization, "descriptionDecision": judgment["descriptionDecision"], "positiveMaterialDecision": judgment["positiveMaterialDecision"]})
write(OWN / "actual-whole-goal-page-context-material-binding.receipt.json", {
    "documentType": "Actual targeted independent B bindings and PDF view receipt",
    "completedAtUTC": completed,
    "authorInputFreezeVerified": True,
    "canonicalWholeGoalCount": len(current_by),
    "changedWholeGoalIds": changed,
    "unchangedWholeGoals": len(current_by) - len(changed),
    "allSelectedRelationsApplicabilityTagsExact": True,
    "selectedGoalCount": 17,
    "completeBilingualCaseCount": 34,
    "descriptionKeep": 17,
    "positiveKeep": 16,
    "positiveRevise": 1,
    "actualPDFPhysicalPagesViewed": list(range(3, 20)),
    "englishPDFClaim": False,
    "englishTextActuallyReadInNativeInputsAndCases": True,
    "pages": pages,
    "humanApproval": False,
    "humanTrial": False,
    "strictNetGain": 0,
    "wholeOriginalSourceClosure": False,
    "wholeLearnerSourceSupersetClosure": False,
})
print("Created native D-B17 KEEP and P17 current bindings with 16 KEEP / 1 explicit REVISE dissent; no approval or strict gain")
