#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Record actual DNA-v3 inspection and exact reuse of the frozen three KEEP images."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
BASE = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-three-current383-author-continuation-v2"
OLD = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-four-current383-independent-visual-review-a-v1"
ID = "0daa79f6-8f61-5506-98f9-65db83062ba8"
NEW_SHA = "1e5a562580b0751014713fbf7c84e112f5e157e82d81018d47ac4201151266e7"


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha(path):
    return "sha256:" + hashlib.sha256(path.read_bytes()).hexdigest()


def bind(path):
    return {"path": str(path.relative_to(ROOT)), "sha256": sha(path), "bytes": path.stat().st_size}


def png(path):
    with Image.open(path) as image:
        assert image.format == "PNG"
        return {**bind(path), "dimensions": list(image.size), "mode": image.mode, "format": image.format}


def goal_text(goal):
    return {k: goal[k] for k in ["id", "title", "titleEn", "description", "descriptionEn"]}


def text_sha(goal):
    raw = json.dumps(goal, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return "sha256:" + hashlib.sha256(raw).hexdigest()


def emit(name, value):
    with (OUT / name).open("x", encoding="utf-8") as handle:
        json.dump(value, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def main():
    now = datetime.now(timezone.utc).isoformat()
    old_inputs = read(OLD / "inputs-and-inspection-bindings.snapshot.json")
    old_rows = {r["goalId"]: r for r in old_inputs["records"]}
    old_manifest_path = BASE / "visualization-final-candidate-inputs.json"
    new_manifest_path = BASE / "visualization-final-candidate-inputs.v3.json"
    old_manifest = {r["goalId"]: r for r in read(old_manifest_path)["records"]}
    new_manifest = {r["goalId"]: r for r in read(new_manifest_path)["records"]}
    assert set(new_manifest) == set(old_manifest) == set(old_rows)
    for gid in set(new_manifest) - {ID}:
        assert new_manifest[gid] == old_manifest[gid]
        assert sha(ROOT / new_manifest[gid]["candidatePath"]) == old_rows[gid]["finalCandidate"]["sha256"]
    current_path = ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json"
    registry_path = ROOT / "curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json"
    text_path = BASE / "proposed-three-goal-objects.candidate.json"
    rep_path = BASE / "replication-preservation-goal.candidate.json"
    actual = {g["id"]: g for g in read(current_path)["goals"]}
    proposed = {g["id"]: g for g in read(text_path)["goals"]}
    rep = read(rep_path)["proposed"]
    proposed[rep["id"]] = rep
    for gid, row in old_rows.items():
        assert text_sha(goal_text(actual[gid])) == row["currentGoalTextSha256"]
        assert text_sha(goal_text(proposed[gid])) == row["proposedGoalTextSha256"]
    old_freeze_path = OLD / "independent-visual-review-a.final.freeze.json"
    old_freeze = read(old_freeze_path)
    for record in old_freeze["files"]:
        path = ROOT / record["path"]
        assert sha(path) == record["sha256"] and path.stat().st_size == record["bytes"]
    candidate_path = ROOT / new_manifest[ID]["candidatePath"]
    assert sha(candidate_path) == new_manifest[ID]["sha256"] == "sha256:" + NEW_SHA
    candidate = png(candidate_path)
    assert candidate["dimensions"] == [1672, 941] and candidate["mode"] == "RGB"
    # Bind all original review files and original author input containers too.
    guarded = sorted(set([current_path, registry_path, text_path, rep_path, old_manifest_path, new_manifest_path, candidate_path, old_freeze_path] + [ROOT / r["path"] for r in old_freeze["files"]] + [ROOT / r["candidatePath"] for r in old_manifest.values()]))
    before = [bind(path) for path in guarded]
    views = [{"kind": "native", "method": "view_image detail original", **candidate}]
    for width, height in [(360, 203), (680, 383)]:
        path = OUT / "inspection-only" / f"0daa79f6.v3.{width}px.inspection.png"
        view = png(path)
        assert view["dimensions"] == [width, height]
        views.append({"kind": f"actual_{width}px", "method": "Pillow LANCZOS full-frame proportional derivative; view_image detail original", "sourceSha256": candidate["sha256"], **view})
    for name, crop in [("middle-pair", [225, 340, 750, 470]), ("bottom-pair", [225, 750, 750, 875])]:
        path = OUT / "inspection-only" / f"0daa79f6.v3.{name}.native-detail.png"
        views.append({"kind": "native_detail", "method": "unscaled native crop; view_image detail original", "nativeCropXYXY": crop, "sourceSha256": candidate["sha256"], **png(path)})
    no_completion = {"activeFilesChanged": False, "historicalReviewArtifactsChanged": False, "activeQaApprovalWritten": False, "newScientificClosures": 0, "restoredBindings": 0, "strictCompletionsAdded": 0, "humanApproval": False, "humanTrial": False}
    emit("inputs-and-inspection-bindings.snapshot.json", {
        "schemaVersion": 1, "artifactKind": "independent_dna_v3_followup_actual_inputs", "status": "actual_targeted_inspection_recorded", "capturedAt": now,
        "reviewer": "/root/duration_report_fix", "independentOfImageAndTextAuthors": True, "authorJudgmentsRead": False, "otherQaOutputsRead": False,
        "inputManifest": bind(new_manifest_path), "preservedV2Manifest": bind(old_manifest_path), "priorIndependentReviewFreeze": bind(old_freeze_path),
        "goalId": ID, "currentGoalText": goal_text(actual[ID]), "currentGoalTextSha256": text_sha(goal_text(actual[ID])), "proposedGoalText": goal_text(proposed[ID]), "proposedGoalTextSha256": text_sha(goal_text(proposed[ID])),
        "goalTextFingerprintContract": old_inputs["goalTextFingerprintContract"],
        "finalCandidate": candidate, "declaredProvider": new_manifest[ID]["provider"], "providerIndependentlyReverified": False,
        "declaredAltText": new_manifest[ID]["altText"], "inspectionViews": views, "actualViewImageCalls": 5,
        "unchangedThreeCandidatesReused": {gid: {"candidateSha256": old_rows[gid]["finalCandidate"]["sha256"], "proposedGoalTextSha256": old_rows[gid]["proposedGoalTextSha256"], "independentReviewFreeze": bind(old_freeze_path), "decision": "KEEP", "recordAndTargetTextAndPngExact": True, "newVisualReviewRequiredByTheseInputs": False} for gid in new_manifest if gid != ID},
        "originalFourReviewUnmodified": True, **no_completion,
    })
    emit("dna-v3-visual-verdict.independent-a.json", {
        "schemaVersion": 1, "artifactKind": "independent_dna_subject_matter_and_actual_visual_followup", "status": "keep_corrected_png_no_active_approval", "reviewedAt": now,
        "reviewer": "/root/duration_report_fix", "independentOfImageAndTextAuthors": True, "authorJudgmentsRead": False, "otherQaOutputsRead": False,
        "goalId": ID, "candidateSha256": candidate["sha256"], "currentGoalTextSha256": text_sha(goal_text(actual[ID])), "reviewedProposedGoalTextSha256": text_sha(goal_text(proposed[ID])),
        "decision": "KEEP", "scienceDecision": "KEEP", "responsiveDecision": "KEEP", "styleDecision": "KEEP",
        "priorFinding": {"findingId": "V-A-DNA-GC-HBONDS", "oldCandidateSha256": old_rows[ID]["finalCandidate"]["sha256"], "oldDecisionPreserved": "REVISE", "resolvedInThisNewPng": True, "oldArtifactModified": False},
        "actualObservationsDe": [
            "G-C in Zeile 2 und C-G in Zeile 4 zeigen jeweils drei getrennte gestrichelte Linien; A-T und T-A behalten jeweils zwei.",
            "Paarungen A-T, G-C, T-A, C-G, Basenbuchstaben, Phosphat-Zucker-Rückgrate und Base am Zucker sind richtig. Eigenständiges Nukleotid zeigt passend zugeordnete Phosphat-/Zucker-/Base-Bestandteile.",
            "AGTC und TCAG rechts bleiben spaltenweise komplementär und ihre Pfeile entgegengesetzt; linker und rechter Leiterpfeil zeigen ebenfalls gegensinnig.",
            "Bei 360x203 bleiben Hauptleiter, große Basenbuchstaben, Nukleotidmotiv, Folge und Richtungspfeile erkennbar ohne notwendige Kleinschrift; bei 680x383 auch Beschriftung und Bindungslinien klar.",
            "Friendly abstract comic-like PNG, native close16:9, clear white space and outlines, no clipping, technical IDs, watermark or actor-perspective conflict.",
        ],
        "blockingFindings": [], "remainingModelLimitsDe": "Entrolltes vereinfachtes Strukturmodell ohne vollständige Helixgeometrie, atomare Bindungswinkel oder explizite chemische 5′/3′-Endgruppen. Pfeile orientieren die Gegenläufigkeit; Farben sind kein universeller chemischer Code. Kein Leistungsnachweis durch das Bild.",
        "altTextFit": "Declared alt text fits the actual simplified structure and complementary sequence motif.",
        "decisionMeaning": "Independent machine KEEP of exact new PNG on exact proposed goal text, not active V registration, integrated D/P/A/M/V completion or human release approval.",
        "nextStep": "Integrate only reviewed exact PNG versions after required native target/page/context/evidence bindings; preserve v2 rejection and the three unchanged KEEP reviews.", **no_completion,
    })
    after = [bind(path) for path in guarded]
    assert before == after
    emit("preservation-and-actual-inspection.receipt.json", {
        "schemaVersion": 1, "artifactKind": "exact_preservation_and_actual_dna_v3_inspection_receipt", "status": "passed_focused_preservation_checks", "checkedAt": now,
        "actualViewImageCalls": 5, "nativeDimensions": [1672, 941], "phoneDimensions": [360, 203], "desktopDimensions": [680, 383],
        "correctedCountedGcConnectionsActuallyViewed": True, "allFourPairsAndNucleotideAndSequenceRechecked": True,
        "oldFrozenReviewFileCount": old_freeze["fileCount"], "oldFrozenReviewAllFilesExact": True, "oldFreezeSha256": sha(old_freeze_path),
        "allFourCurrentAndProposedTextFingerprintsUnchanged": True, "unchangedThreeCandidateRecordsAndPngExact": True,
        "guardedInputsBeforeAndAfterExact": True, "guardedInputs": before, "productionAssetsProgrammaticallyModified": False, "inspectionOnlyDerivativeCount": 4, "fullBuildRun": False, **no_completion,
    })
    files = sorted(path for path in OUT.rglob("*") if path.is_file())
    emit("dna-v3-independent-visual-review-a.final.freeze.json", {"schemaVersion": 1, "artifactKind": "independent_dna_v3_visual_followup_freeze", "status": "keep_corrected_png_frozen_no_active_approval", "frozenAt": now, "files": [bind(path) for path in files], "fileCount": len(files), "decision": "KEEP", "candidateSha256": candidate["sha256"], **no_completion})
    print(json.dumps({"directory": str(OUT.relative_to(ROOT)), "decision": "KEEP", "candidateSha256": candidate["sha256"], "actualViewImageCalls": 5, "oldReviewUnchanged": True, "freezeSha256": sha(OUT / "dna-v3-independent-visual-review-a.final.freeze.json"), **no_completion}, ensure_ascii=False))


if __name__ == "__main__":
    main()
