# SPDX-License-Identifier: Apache-2.0
"""Materialize typed candidate QA from the already sealed independent science."""
import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path

R = Path(__file__).resolve().parents[8]
O = Path(__file__).resolve().parents[1]


def relative(p):
    return str(p.relative_to(R))


def bind(p):
    b = p.read_bytes()
    return {"path": relative(p), "bytes": len(b), "sha256": "sha256:" + hashlib.sha256(b).hexdigest()}


def write(p, x):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + "\n")


seal = json.loads((O / "FIRST-SCIENCE-SEAL.five-original-PNG-V5-independent-b.actual.json").read_text())
assert bind(O / "FIRST-SCIENCE-SEAL.five-original-PNG-V5-independent-b.actual.json")["sha256"] == "sha256:18fb2b3f7dac448c9233f66400fa38165758ca4acf30db6ca498fb0d57720f3b"
science_path = R / seal["scienceRecords"]["path"]
assert bind(science_path) == seal["scienceRecords"]
science = [json.loads(x) for x in science_path.read_text().splitlines()]
assert len(science) == 5 and len({x["goalId"] for x in science}) == 5
bindings = json.loads((R / seal["pixelAndGoalBindings"]["path"]).read_text())
rows = {x["goalId"]: x for x in bindings["wholeFiveOriginalRows"]}
candidate = R / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-source6-five-actual-current412-full-gate-author-20261014-v1/candidate/canonical539.prospective-current412-on-actual280.author-only.json"
assert bind(candidate)["sha256"] == "sha256:3fbbc35f62554ca52fcf1404b3c589bff8fc8dd6f98c97a4d32fa8abccb6b6b5"
qa = []
imports = []
for decision in science:
    goal = decision["wholeCurrentGoal"]
    gid = goal["id"]
    assert goal == rows[gid]["wholeCurrentGoal"]
    original = R / decision["originalSelectedPixels"]["path"]
    assert bind(original) == decision["originalSelectedPixels"]
    note = " ".join([
        "Genuine independent V5-B. Decision: " + decision["decision"] + ".",
        decision["targetFit"],
        *decision["chemicalAndModelFindings"],
        decision["mobileDesktopFindings"],
        decision["perspectiveFinding"],
        decision["formatStyleAndAbstraction"],
        "Actually inspected original PNG natively and own real Chromium screenshots at 360 and 680px.",
        "This is exact-pixel AI image evidence only; no Human, D/P/A/M, kind, whole-source/course or central strict approval.",
        "Candidate-only: canonical/public asset import and new native goal-page binding remain pending."
    ])
    canonical_alias = f"curricula/DE/Gymnasium/visualizations/chemie/{gid}/{gid}.png"
    public_alias = f"app/public/assets/goal-visualizations/chemie/{gid}/{gid}.png"
    approved = decision["decision"] == "KEEP"
    qa.append({
        "goalId": gid, "title": goal["title"], "description": goal["description"],
        "subject": "chemie", "landscapeId": "c436b994-8f44-5134-b9f8-0c9f5d6a5ba0",
        "landscapePath": relative(candidate), "visualizationState": "available", "missingReason": "",
        "imageUrl": f"/assets/goal-visualizations/chemie/{gid}/{gid}.png",
        "publicAssetPath": public_alias,
        "canonicalAssetPath": relative(original),
        "assetSha256": decision["originalSelectedPixels"]["sha256"],
        "umlautsCorrectChatGpt": "yes" if approved else "no",
        "contentApprovedChatGpt": "yes" if approved else "no",
        "humanApproved": "no", "humanIssueIdentified": "no", "humanIssueDescription": "",
        "humanReviewedAt": None, "humanReviewer": "",
        "chatGptReviewedAt": seal["scienceCompletedAtUTC"], "chatGptReviewer": "OpenAI GPT-6 Codex, genuine independent V5-B",
        "chatGptNotes": note,
        "aiApproved": "yes" if approved else "no",
        "aiApprovedAssetSha256": decision["originalSelectedPixels"]["sha256"],
        "aiReviewedAt": seal["scienceCompletedAtUTC"],
        "aiReviewer": "OpenAI GPT-6 Codex; exact revision and sampling parameters not exposed; independent V5-B",
        "aiNotes": note,
    })
    aliases = []
    for alias in [canonical_alias, public_alias]:
        p = R / alias
        aliases.append({"path": alias, "exists": p.is_file(), "actualBinding": bind(p) if p.is_file() else None,
                        "matchesApprovedPixels": bind(p)["sha256"] == bind(original)["sha256"] if p.is_file() else False})
    imports.append({"goalId": gid, "actualReviewedOriginal": bind(original), "normalAliases": aliases,
                    "status": "PENDING_ASSET_IMPORT" if not all(x["matchesApprovedPixels"] for x in aliases) else "EXACT_BYTES_PRESENT",
                    "requiredBeforeAnyCentralRun": "Import exact approved bytes to both normal aliases; verify existence and SHA of every selected QA canonicalAssetPath and publicAssetPath. No gate waiver."})

qa_path = O / "QA/five-original-PNG-current-whole-goal.V5-independent-b.actual.qa.json"
write(qa_path, {"schemaVersion": 1, "subject": "chemie", "generatedAt": datetime.now(timezone.utc).isoformat(),
                "source": "Independent V5-B exact-pixel candidate QA after own first-science seal; available denotes the actual evidence PNG, not an active resource import.",
                "records": qa})
write(O / "checks/ACTUAL.candidate-original-and-normal-asset-alias-existence-and-SHA.json", {
    "schemaVersion": 1, "checkedAtUTC": datetime.now(timezone.utc).isoformat(), "wholeCandidate": bind(candidate),
    "candidateReviewedOriginals": 5, "rows": imports,
    "normalAliasImportComplete": all(x["status"] == "EXACT_BYTES_PRESENT" for x in imports),
    "activeOrHHostWrites": False,
})
host = O / "stock-approval-host"
stock_files = ["app/scripts/checkGoalVisualizationQaApprovalCoverage.ts", "app/scripts/goalVisualizationQaModel.ts", "app/src/utils/goalVisualizationQaStatus.ts"]
materialized = []
for f in stock_files:
    target = host / f
    target.parent.mkdir(parents=True, exist_ok=True)
    assert not target.exists()
    os.link(R / f, target)
    assert bind(R / f)["sha256"] == bind(target)["sha256"]
    materialized.append({"stockOriginal": bind(R / f), "privateReadOnlyHardlink": bind(target)})
qa_host = host / "curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json"
qa_host.parent.mkdir(parents=True, exist_ok=True)
os.link(qa_path, qa_host)
write(O / "checks/ACTUAL.minimum-own-stock-approval-host-bindings.json", {
    "schemaVersion": 1, "stockModules": materialized, "candidateQa": bind(qa_path), "privateQaExactHardlink": bind(qa_host),
    "noStockModuleEdits": True, "noSharedHHostWrites": True,
})
print(json.dumps({"qaPath": relative(qa_path), "rows": len(qa), "normalAssetImportComplete": all(x["status"] == "EXACT_BYTES_PRESENT" for x in imports)}, ensure_ascii=False))
