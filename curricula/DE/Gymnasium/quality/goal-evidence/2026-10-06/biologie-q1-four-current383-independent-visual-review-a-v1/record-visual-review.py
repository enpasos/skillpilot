#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Freeze actual independent image observations; never approve active QA data."""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
BASE = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-three-current383-author-continuation-v2"
CANON = ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json"
REGISTRY = ROOT / "curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json"
INPUT = BASE / "visualization-final-candidate-inputs.json"
TEXT_INPUT = BASE / "proposed-three-goal-objects.candidate.json"
REPLICATION_INPUT = BASE / "replication-preservation-goal.candidate.json"
EXPECTED = {
    "0daa79f6-8f61-5506-98f9-65db83062ba8": "7c272daa9df2a8f048a08d29ff57ac5dbac08751e26fb70602353ea6ecc8db88",
    "475eebb4-4eb0-524f-b1ec-4a672bf856d2": "7f89f7eba0e2c0728e427ca2cca4b46ec524807678bb6a6774a188d2285cc772",
    "ffef97e3-12d6-5090-9816-46ab9e57fae2": "25efc19cf2535fdd33533a575e3cc6ae29d03d0f78c7e980d562c28460e8ec0d",
    "e70d8a85-2dea-5165-919b-200fee9f4db4": "cf296aa3d4d9fb04b087ab7b8bb71e29ce545758cfaa03c5ab39ef34843c6213",
}


def read(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def binding(path: Path) -> dict:
    return {"path": str(path.relative_to(ROOT)), "sha256": "sha256:" + sha(path), "bytes": path.stat().st_size}


def png_binding(path: Path) -> dict:
    with Image.open(path) as im:
        assert im.format == "PNG"
        return {**binding(path), "dimensions": list(im.size), "mode": im.mode, "format": im.format}


def text(goal: dict) -> dict:
    return {key: goal[key] for key in ["id", "title", "titleEn", "description", "descriptionEn"]}


def text_sha(payload: dict) -> str:
    encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return "sha256:" + hashlib.sha256(encoded).hexdigest()


def emit(name: str, payload: dict) -> None:
    with (OUT / name).open("x", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


OBSERVATIONS = {
    "0daa79f6-8f61-5506-98f9-65db83062ba8": {
        "decision": "REVISE", "scienceDecision": "REVISE", "responsiveDecision": "KEEP", "styleDecision": "KEEP",
        "observedDe": [
            "Basenpaarbuchstaben links A-T, G-C, T-A, C-G sind komplementär; rechts AGTC über TCAG mit entgegengesetzten Richtungszeichen ist spaltenweise komplementär.",
            "Gelbe Phosphate und blaue pentagonale Zucker bilden die Rückgratspuren; Base ist am Zucker gebunden. Separates Nukleotid enthält Phosphat, Zucker und Base mit passenden Zeigelinien.",
            "Beide G-C/C-G-Paare im Leiterbild haben nur zwei parallele gestrichelte Verbindungslinien, gleich den A-T-Paaren. Native Detailausschnitte bestätigen dies.",
            "Große Basenbuchstaben, Rückgrate und entgegengesetzte Pfeile sind bei 360px sichtbar; Nukleotidteil und Basenfolgenbox bleiben unterscheidbar. Bei 680px ist auch die Beschriftung deutlich.",
        ],
        "blockingFindings": [{
            "findingId": "V-A-DNA-GC-HBONDS", "severity": "fachlich_wrong_or_misleading", "location": "left ladder rows 2 and 4, between G/C and C/G",
            "observationDe": "Zwei gestrichelte Linien stellen in einer zählbaren H-Brückenskizze G-C falsch genauso wie A-T dar; G-C benötigt drei, A-T zwei.",
            "requiredRemedyDe": "Nur G-C/C-G-Verbindungen auf drei klar getrennte Linien korrigieren. Alternativ alle Paarungsverbindungen ausdrücklich neutral und nicht zählbar gestalten. Richtige Basenbuchstaben, Zucker-Phosphat-Base-Aufbau, Komplementfolge, Pfeile, Stil und Formfaktor erhalten; neues tatsächliches PNG unabhängig erneut prüfen.",
            "evidenceDerivatives": ["inspection-only/0daa79f6.middle-pair.native-detail.png", "inspection-only/0daa79f6.bottom-pair.native-detail.png"],
        }],
        "modelLimitsDe": "Vereinfachtes entrolltes Leiter-/Nukleotidmodell ohne vollständige Helixgeometrie, atomare Bindungswinkel oder explizite 5′/3′-Enden. Farben sind kein universeller chemischer Farbcode. Gegenläufige Pfeile sind ein Orientierungsmodell, keine Darstellung aller chemischen Endgruppen.",
        "altTextFit": "Declared alt text describes the main parts but does not disclose the wrong counted G-C connectors; correct prose cannot rescue that drawing.",
    },
    "475eebb4-4eb0-524f-b1ec-4a672bf856d2": {
        "decision": "KEEP", "scienceDecision": "KEEP", "responsiveDecision": "KEEP", "styleDecision": "KEEP",
        "observedDe": [
            "DNA bleibt links im Zellkern. Der Transkriptionspfeil zeigt vom DNA-Motiv zur roten mRNA; dieselbe rote Linie läuft durch die Kernhülle ins Cytoplasma und durch das Ribosom.",
            "Translation zeigt in Informationsflussrichtung zum Ribosom. Die rechts gezeigte tRNA trägt oben eine Aminosäure und unten drei kleine Anticodon-Symbole; ihr Pfeil führt zum Ribosom. Eine mehrgliedrige Polypeptidkette tritt oben aus.",
            "Die Kopplung beider Prozessabschnitte über denselben mRNA-Weg ist erkennbar; keine DNA wandernd ins Cytoplasma und kein Polypeptid direkt aus der DNA dargestellt.",
            "Bei 360px sind DNA, mRNA-Weg, Ribosom, tRNA-Umriss und wachsende Kette ohne Pflichtlektüre der kleinen Zusatzlabels unterscheidbar. Längere Zusatzlabels sind klein, aber keine zentrale Entscheidung hängt vom Entziffern dieser Schrift ab. Bei 680px sind die Bezeichnungen lesbar.",
        ],
        "blockingFindings": [],
        "modelLimitsDe": "Vereinfachter Eukaryotenweg; vollständige RNA-Prozessierung, Enzymmechanik, numerisch prüfbare Codons/Anticodons, genaue Basensequenzübersetzung und 5′/3′-Synthese-/Leserichtung sind nicht gezeigt. Keine dieser fehlenden Einzelheiten darf als durch das Orientierungsbild nachgewiesen gelten. Die Richtungspfeile zeigen Informationsfluss, keine vollständige molekulare Kinetik.",
        "altTextFit": "Declared alt text matches the connected eukaryotic overview and explicitly limits RNA processing.",
    },
    "ffef97e3-12d6-5090-9816-46ab9e57fae2": {
        "decision": "KEEP", "scienceDecision": "KEEP", "responsiveDecision": "KEEP", "styleDecision": "KEEP",
        "observedDe": [
            "Substitution: fünf Ausgangspositionen bleiben fünf, der dritte gelbe Baustein wird lila. Deletion: der markierte dritte Baustein verschwindet, fünf werden vier ohne zusätzliche Umordnung.",
            "Insertion: ein rosa Baustein wird nach dem dritten gelben ergänzt, fünf werden sechs; die übrige Reihenfolge bleibt erhalten.",
            "Duplikation: Ausgang blau-rot-gelb-türkis-lila wird blau-rot-gelb-türkis-gelb-türkis-lila. Der wiederholte Zweierabschnitt ist erkennbar und der gebogene Pfeil verbindet Ausgangsabschnitt und zusätzliche Kopie.",
            "Alle vier großen Titel, Vorher/Nachher-Blöcke, Änderungsmarkierungen und Pfeile bleiben bei 360px unterscheidbar; keine notwendige Kleinschrift. Bei 680px sind auch Details klar.",
        ],
        "blockingFindings": [],
        "modelLimitsDe": "Abstrakte Sequenzpositionen/-abschnitte, kein behauptetes Fünf-/Sechs-Basenalphabet und keine einzelnen Aminosäure-Identitäten. Kein universeller Frameshift, keine zwangsläufige Proteinänderung/Schädlichkeit und keine konkrete Codon- oder Proteinfolgenberechnung behauptet; die Folgen müssen aus dem gegebenen Genkontext erklärt werden.",
        "altTextFit": "Declared alt text matches replacement/removal/addition and two-unit duplication; image remains an orientation overview.",
    },
    "e70d8a85-2dea-5165-919b-200fee9f4db4": {
        "decision": "KEEP", "scienceDecision": "KEEP", "responsiveDecision": "KEEP", "styleDecision": "KEEP",
        "observedDe": [
            "Vorher ein DNA-Modell mit zwei alten blauen Einzelsträngen, nachher zwei Tochtermodelle blau/orange und orange/blau. Legende ordnet Blau alt und Orange neu zu.",
            "Die linke ursprüngliche blaue Seite bleibt links im ersten Tochtermodell, die rechte ursprüngliche blaue Seite rechts im zweiten. Die zugehörigen Basenhälften und ihre Reihenfolge sind erhalten; neue Seiten ergänzen jeweils komplementär, beide Doppelstrangmodelle sind gleich.",
            "Ein einzelner großer Prozesspfeil verbindet Elternmodell und beide Tochtermodelle; kein Ergebnis mit zwei ausschließlich alten oder zwei ausschließlich neuen Strängen.",
            "Bei 360px sind ein Vorhermodell, zwei Nachhermodelle, die Blau/Orange-Aufteilung und Legende erkennbar; bei 680px bleiben sämtliche Hauptdetails und Bezeichnungen klar.",
        ],
        "blockingFindings": [],
        "modelLimitsDe": "Semikonservatives Ergebnis-/Materialmodell. Farbmarkierung des Rückgrats steht für die Herkunft des jeweiligen ganzen Strangs; sie kennzeichnet keine chemische Änderung. Replikationsgabel, Polymerase-Enzyme, 5′/3′-Richtung und Leading/Lagging-Strand-Synthese werden nicht dargestellt oder behauptet.",
        "altTextFit": "Declared alt text matches the one-old/one-new result and the actual process arrow and legend.",
    },
}


def main() -> None:
    now = datetime.now(timezone.utc).isoformat()
    manifest = read(INPUT)
    active = {g["id"]: g for g in read(CANON)["goals"]}
    proposed = {g["id"]: g for g in read(TEXT_INPUT)["goals"]}
    proposed_replication = read(REPLICATION_INPUT)["proposed"]
    proposed[proposed_replication["id"]] = proposed_replication
    assert set(proposed) == set(EXPECTED) == set(OBSERVATIONS)
    assert {r["goalId"] for r in manifest["records"]} == set(EXPECTED)
    guarded = [CANON, REGISTRY, INPUT, TEXT_INPUT, REPLICATION_INPUT] + [ROOT / r["candidatePath"] for r in manifest["records"]]
    before = [binding(path) for path in guarded]
    records = []
    findings = []
    for record in manifest["records"]:
        gid = record["goalId"]
        path = ROOT / record["candidatePath"]
        assert sha(path) == EXPECTED[gid] and record["sha256"] == "sha256:" + EXPECTED[gid]
        native = png_binding(path)
        assert native["dimensions"] == record["dimensions"] == [1672, 941]
        assert native["mode"] == "RGB"
        views = [{"kind": "native", "method": "view_image detail original", **native}]
        for width, height in [(360, 203), (680, 383)]:
            derivative = OUT / "inspection-only" / f"{gid}.{width}px.inspection.png"
            view = png_binding(derivative)
            assert view["dimensions"] == [width, height]
            views.append({"kind": f"actual_{width}px", "method": "Pillow LANCZOS full-frame proportional derivative, view_image detail original", "sourceSha256": native["sha256"], **view})
        if gid.startswith("0daa"):
            for name, crop in [("middle-pair", [225, 340, 750, 470]), ("bottom-pair", [225, 750, 750, 875])]:
                detail = OUT / "inspection-only" / f"0daa79f6.{name}.native-detail.png"
                views.append({"kind": "native_detail", "method": "unscaled native crop, view_image detail original", "sourceSha256": native["sha256"], "nativeCropXYXY": crop, **png_binding(detail)})
        current_text, proposed_text = text(active[gid]), text(proposed[gid])
        records.append({"goalId": gid, "currentGoalText": current_text, "currentGoalTextSha256": text_sha(current_text), "proposedGoalText": proposed_text, "proposedGoalTextSha256": text_sha(proposed_text), "finalCandidate": native, "declaredProvider": record["provider"], "providerIndependentlyReverified": False, "declaredAltText": record["altText"], "inspectionViews": views})
        findings.append({"goalId": gid, "candidateSha256": native["sha256"], "currentGoalTextSha256": text_sha(current_text), "reviewedProposedGoalTextSha256": text_sha(proposed_text), **OBSERVATIONS[gid], "perspectiveCheck": "No people, notebooks, boards or handheld gauges depicted; no actor/viewer orientation conflict.", "visualizationIsOrientationOnly": True, "activeAiApprovalWritten": False, "humanApproval": False, "humanTrial": False})

    no_completion = {"activeFilesChanged": False, "historicalReviewArtifactsChanged": False, "newScientificClosures": 0, "restoredBindings": 0, "strictCompletionsAdded": 0, "humanApproval": False, "humanTrial": False}
    emit("inputs-and-inspection-bindings.snapshot.json", {
        "schemaVersion": 1, "artifactKind": "independent_actual_image_review_inputs", "status": "actual_inspections_recorded", "capturedAt": now,
        "reviewer": "/root/duration_report_fix", "reviewRound": "A", "independentOfImageAndTextAuthors": True,
        "authorJudgmentsRead": False, "otherQaOutputsRead": False, "taskKeepLabelUsedAsApproval": False,
        "inputBoundary": "Only current/proposed four goal texts, final candidate input manifest, actual PNGs and general AGENTS/image policy were used. File hashes bind source containers; no author judgments or other QA findings were used.",
        "inputContainerBindings": [binding(path) for path in [CANON, REGISTRY, INPUT, TEXT_INPUT, REPLICATION_INPUT]],
        "goalTextFingerprintContract": "sha256 UTF-8 JSON of {id,title,titleEn,description,descriptionEn}, ensure_ascii=false, sort_keys=true, separators=(',',':')",
        "records": records, "inspectionDerivativeProductionAsset": False,
        "actualViewImageCalls": 14, "nativeFullImageCount": 4, "actual360pxCount": 4, "actual680pxCount": 4, "nativeDetailCropCount": 2,
        "formatDecision": "1672x941 PNG close to 16:9; main objects fit both full 360px and 680px widths. No aspect-ratio exception needed.", **no_completion,
    })
    emit("visual-verdicts.independent-a.json", {
        "schemaVersion": 1, "artifactKind": "independent_subject_matter_and_actual_visual_review", "status": "three_keep_one_revise_no_active_approval", "reviewedAt": now,
        "reviewer": "/root/duration_report_fix", "reviewRound": "A", "independentOfImageAndTextAuthors": True, "authorJudgmentsRead": False, "otherQaOutputsRead": False,
        "inputSnapshotPath": str((OUT / "inputs-and-inspection-bindings.snapshot.json").relative_to(ROOT)),
        "decisionMeaning": "KEEP is this independent machine review's concrete asset judgment on the proposed text and exact PNG, not active gate-V registration, integration, all-gate closure or human release approval. REVISE blocks approval of the specified current PNG until an actual corrected candidate is independently viewed.",
        "decisionCounts": {"KEEP": 3, "REVISE": 1, "BLOCK": 0}, "records": findings,
        "notRequiredForOrientation": ["full enzyme mechanism", "assessment or solution", "RNA-processing completeness", "mutation-to-protein consequence proof", "complete leading/lagging replication mechanism"],
        "nextStep": "Preserve all reviewed attempts; correct only counted G-C/C-G hydrogen-bond connectors, generate a new PNG version and actually review that new SHA. Retain the three good existing candidates and rebind relevant goal/page/context/evidence only after checked integration.", **no_completion,
    })
    after = [binding(path) for path in guarded]
    assert before == after, "An input changed during recording; do not claim stable input bindings"
    emit("actual-inspection-and-preservation.receipt.json", {
        "schemaVersion": 1, "artifactKind": "actual_image_dimensions_and_unchanged_input_receipt", "status": "passed_exact_input_checks_and_recorded_real_views", "checkedAt": now,
        "candidateCount": 4, "candidateSha256MatchesFinalManifest": True, "allOriginalsAre1672x941RgbPng": True,
        "inspection360Dimensions": [360, 203], "inspection680Dimensions": [680, 383], "allFourAtBothWidthsActuallyViewed": True,
        "nativeOriginalsActuallyViewed": True, "twoNativeDnaDetailCropsActuallyViewed": True,
        "guardedInputsBeforeAndAfterExact": True, "guardedInputs": before,
        "productionAssetsProgrammaticallyModified": False, "inspectionOnlyDerivativeCount": 10,
        "activeQaApprovalWritten": False, "fullBuildRun": False, **no_completion,
    })
    files = sorted(path for path in OUT.rglob("*") if path.is_file())
    emit("independent-visual-review-a.final.freeze.json", {
        "schemaVersion": 1, "artifactKind": "independent_actual_visual_review_round_a_freeze", "status": "three_keep_one_revise_frozen", "frozenAt": now,
        "files": [binding(path) for path in files], "fileCount": len(files), "decisionCounts": {"KEEP": 3, "REVISE": 1, "BLOCK": 0},
        "activeQaApprovalWritten": False, "requiresCorrectedDnaActualReview": True, **no_completion,
    })
    print(json.dumps({"directory": str(OUT.relative_to(ROOT)), "reviewCounts": {"KEEP": 3, "REVISE": 1, "BLOCK": 0}, "actualViewImageCalls": 14, "guardedInputsUnchanged": True, "freezeSha256": sha(OUT / "independent-visual-review-a.final.freeze.json"), **no_completion}, ensure_ascii=False))


if __name__ == "__main__":
    main()
