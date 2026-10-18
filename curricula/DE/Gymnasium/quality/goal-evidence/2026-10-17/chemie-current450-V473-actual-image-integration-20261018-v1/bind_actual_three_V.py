"""Bind only the three actual independent image decisions after stock QA refresh."""

import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = next(p for p in HERE.parents if (p / ".git").exists())
N = HERE.parent
qa_path = ROOT / "curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json"
canonical_path = ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json"
review_path = N / "chemie-current450-three-new-visual-informed-independent-b-20261018-v1/V.actual-three-images-native-360-680.informed-independent-b.sealed.json"
review = json.loads(review_path.read_text())
assert hashlib.sha256(review_path.read_bytes()).hexdigest() == "ce26695d5643c903bee53af6a3be746a1d9d353a1160660c58a86bf924c66367"
qa = json.loads(qa_path.read_text())
old = json.loads((HERE / "chemie.qa.before-new-three.snapshot.json").read_text())
assert len(old["records"]) == 470 and len(qa["records"]) == 473
old_rows = {row["goalId"]: row for row in old["records"]}
current = {row["goalId"]: row for row in qa["records"]}
assert all(current[g] == row for g, row in old_rows.items()), "Existing QA changed"
goals = {g["id"]: g for g in json.loads(canonical_path.read_text())["goals"]}
assert len(goals) == 662
for r in review["records"]:
    gid = r["goalId"]
    assert goals[gid] == r["wholeCurrentCandidateGoal"], "Reviewed whole goal context changed"
    assert r["verdict"] == "accept_current_exact_asset_as_AI_visual_candidate" and not r["blockingScientificDefects"]
    row = current[gid]
    expected_sha = "sha256:" + r["actualImage"]["sha256"]
    assert row["assetSha256"] == expected_sha
    assert row["humanApproved"] == "no" and row["contentApprovedChatGpt"] == "no"
    assert not row["humanReviewer"] and not row["chatGptReviewer"]
    row.update({
        "aiApproved": "yes",
        "aiApprovedAssetSha256": expected_sha,
        "aiReviewedAt": review["createdAtUTC"],
        "aiReviewer": "Independent Codex reviewer B; informed current-context image review; exact model revision not exposed",
        "aiNotes": "Actual exact PNG inspected at native 1672x941 and separate 360/680 pixel derivatives. "
        + " ".join(r["concreteInspection"].values())
        + " Independent full review: " + str(review_path.relative_to(ROOT))
        + " sha256:ce26695d5643c903bee53af6a3be746a1d9d353a1160660c58a86bf924c66367. "
        + "Machine visual review only; no human approval, learner execution, or M7 completion claimed.",
    })
qa_path.write_text(json.dumps(qa, ensure_ascii=False, indent=2) + "\n")
data = qa_path.read_bytes()
receipt = {
    "schemaVersion": 1,
    "status": "actual-independent-three-image-decisions-bound",
    "normalQA": {"path": str(qa_path.relative_to(ROOT)), "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)},
    "oldWholeRowsExactlyRetained": 470,
    "newWholeRows": 3,
    "total": 473,
    "newGoalIds": [r["goalId"] for r in review["records"]],
    "humanApproval": False,
    "M7Claim": False,
}
out = HERE / "RECEIPT.actual-V473-three-accepted-new-rows.json"
assert not out.exists()
out.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(receipt))
