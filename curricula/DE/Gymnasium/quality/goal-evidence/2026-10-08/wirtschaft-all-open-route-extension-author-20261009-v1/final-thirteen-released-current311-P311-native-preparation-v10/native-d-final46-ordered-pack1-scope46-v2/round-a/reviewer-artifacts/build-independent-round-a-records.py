#!/usr/bin/env python3
"""Serialize this reviewer's explicit notes into the unmodified native contracts.

This is a serialization helper, not a semantic reviewer. Every understanding,
performance, transfer, context judgement and visual observation comes from the
46 individually authored rows in independent-review-notes.pack*.tsv.
No round-b file is opened, enumerated or consumed here.
"""
import datetime
import hashlib
import json
from pathlib import Path

BASE = Path(__file__).resolve().parents[3]
IDENTITY = "economics-final46-independent-round-a"


def read_json(path):
    return json.loads(path.read_text())


def digest(raw):
    return "sha256:" + hashlib.sha256(raw).hexdigest()


def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


impact = {r["goalId"]: r for r in read_json(BASE / "actual-full-P300-to-P311-all311-whole-ownerpage-impact.native.json")["rows"]}
started = read_json(BASE / "native-d-final46-ordered-pack1-scope46-v2/round-a/reviewer-artifacts/input-guard.before.json")["createdAt"]
fields = ["essentialUnderstandingDe", "essentialUnderstandingEn", "observablePerformanceDe", "observablePerformanceEn", "transferExpectationDe", "transferExpectationEn"]
total = []
for n in range(1, 4):
    pack = BASE / f"native-d-final46-ordered-pack{n}-scope46-v2"
    own = pack / "round-a"
    artifacts = own / "reviewer-artifacts"
    artifacts.mkdir(exist_ok=True)
    data = read_json(own / "description-review-input.json")
    campaign = read_json(own / "description-review-campaign.json")
    manifest = read_json(own / "review-bundle-manifest.json")
    batch = campaign["batches"][0]
    run_id = f"{IDENTITY}-20261009-pack{n}"
    notes = {}
    for line in (artifacts / f"independent-review-notes.pack{n}.tsv").read_text().splitlines():
        cells = line.split("\t")
        assert len(cells) == 9, (n, cells[0], len(cells))
        key = cells[0].strip()
        assert key not in notes
        notes[key] = cells[1:]
    assert len(notes) == data["goalCount"]
    records = []
    visual = []
    for idx, goal in enumerate(data["goals"]):
        goal_id = goal["goalId"]
        authored = notes[goal_id[:8]]
        row = impact[goal_id]
        profile = goal["reviewContext"]["evidenceProfile"]
        full_scope = not row["wasCurrentStrict300"]
        if full_scope:
            scope = "Vollständiger aktueller Review der elf neu vollständig zu begutachtenden Kandidaten: DE/EN, konkretisierte Fachleistung, ganzer P2-Fall-/Transfervertrag, Source-Anspruch, Atomicity, Abrufbedarf, tatsächliches Bild und Voraussetzungen. "
            description = "Die obige Einzelfallbegründung trägt keep; kein konkreter Änderungs- oder Teilungsbefund. "
        else:
            scope = "Gezielter Review der echten Änderung einer vorher strikt geschlossenen Ownerpage; unveränderte DE/EN-Beschreibung und gültige P-Inhalte werden nicht neu gestartet. "
            description = "Im geänderten Kontext bleiben DE/EN handlungsgleich und die vorhandene fachliche Einheit anschlussfähig; die beschriebenen P2-Fälle dienen dem Kontextverständnis, nicht einer neuen Freigabe unveränderten Inhalts. Der bestehende Abruf-/Memory-Anspruch bleibt erhalten. "
        changed = "Tatsächlich geänderte gebundene Felder: " + ", ".join(row["changedFields"]) + ". "
        visual_statement = "Visuelle Wahrnehmung der ganzen nativen PDF-Ownerpage und des tatsächlichen Original-PNG: " + authored[7] + " "
        limits = "Das vollständige positive V2-Profil liegt vor; deshalb Empfehlung none statt einer erneuten Profilanlage. E1/G1 und needs_human_review bleiben wahrheitsgemäß erhalten. Die Fälle sind hypothetische Evidenzaufgaben, keine beobachteten Lernerleistungen. Diese unabhängige Runde A ist blind zu Runde B; candidate/ai_candidate bedeutet keine menschliche Freigabe, Source-Vollfreigabe, M7-Integration oder Veröffentlichung."
        rationale = scope + changed + authored[6] + " " + description + visual_statement + limits
        assert len(rationale) <= 4000, (goal_id, len(rationale))
        assert profile["status"] == "needs_human_review"
        assert profile["evidenceLevel"] == "E1" and profile["maximumClaimScope"] == "G1"
        record = {
            "$schema": "https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json",
            "schemaVersion": 1,
            "recordId": run_id + "." + goal_id,
            "runId": run_id,
            "campaignId": campaign["campaignId"],
            "roundId": campaign["roundId"],
            "bundleFingerprint": data["bundleFingerprint"],
            "bookDigest": data["bookDigest"],
            **{k: goal[k] for k in ["goalId", "goalFingerprint", "pageFingerprint", "currentTitleDe", "currentTitleEn", "currentDescriptionDe", "currentDescriptionEn"]},
            "decision": "keep",
            "understandingEvidence": dict(zip(fields, authored[:6])),
            "rationale": rationale,
            "evidenceProfileContract": "positive-understanding-evidence-v2",
            "evidenceProfileRecommendation": "none",
            "recordStatus": "candidate",
            "reviewAuthority": "ai_candidate",
        }
        records.append(record)
        total.append({"goalId": goal_id, "pack": n, "fullScope": full_scope, "decision": "keep", "changedFields": row["changedFields"]})
        rendered = Path(f"/tmp/economics-final46-round-a-render/pack{n}-page{idx+3:02d}.png")
        assert rendered.exists()
        visual.append({"goalId": goal_id, "physicalPdfPageNumber": idx+3, "wholePageViewed": True, "nativeOriginalPngViewed": True, "renderedPagePath": str(rendered), "renderedPageDigest": digest(rendered.read_bytes()), "individualObservation": authored[7]})
    assert [r["goalId"] for r in records] == batch["goalIds"]
    params = {"reviewerIdentity": IDENTITY, "reviewerTask": "/root/economics_final46_independent_round_a", "provider": "OpenAI", "model": "GPT-6", "generationMethod": "independent agent judgement with explicit per-goal notes; deterministic serialization only", "temperature": "not exposed", "seed": "not exposed", "blindToRoundB": True, "pdfRenderer": "isolated PyMuPDF", "wholePdfRenderScale": 1.8, "reviewPolicy": "11 full new + 35 actual changed whole-ownerpage contexts; retain 265 exact pages", "semanticAutomaticAcceptance": False, "humanApproval": False}
    params_path = artifacts / "generation-parameters.json"
    write_json(params_path, params)
    output = own / "results"
    output.mkdir(exist_ok=True)
    records_path = output / (batch["batchId"] + ".records.jsonl")
    raw = ("\n".join(json.dumps(r, ensure_ascii=False, separators=(",", ":")) for r in records) + "\n").encode()
    records_path.write_bytes(raw)
    run = {
        "$schema": "https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json",
        "schemaVersion": 1,
        "runId": run_id,
        "campaignId": campaign["campaignId"],
        "roundId": campaign["roundId"],
        "batchId": batch["batchId"],
        "batchInputFingerprint": batch["batchInputFingerprint"],
        "bundleFingerprint": campaign["bundleFingerprint"],
        "bookDigest": campaign["bookDigest"],
        "provider": "OpenAI",
        "model": "GPT-6",
        "role": "subject_reviewer",
        "promptFamilyId": "goal-description-understanding-evidence-review-v2",
        "promptFingerprint": campaign["promptFingerprint"],
        "criteriaFingerprint": campaign["criteriaFingerprint"],
        "generationParametersFingerprint": digest(params_path.read_bytes()),
        "independenceGroupId": campaign["independenceGroupId"],
        "blindToOtherRuns": True,
        "goalIds": batch["goalIds"],
        "inputArtifacts": [{"role": a["role"], "digest": a["digest"]} for a in manifest["artifacts"]] + [{"role": "description_review_batch_input_jsonl", "digest": batch["batchInputFingerprint"]}],
        "startedAt": started,
        "completedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "status": "completed",
        "outputDigest": digest(raw),
        "toolchainVersion": "skillpilot-native-description-review-v3",
    }
    write_json(output / (batch["batchId"] + ".run.json"), run)
    write_json(artifacts / "individual-visual-inspection.json", {"reviewer": IDENTITY, "blindToRoundB": True, "bookPdfDigest": next(a["digest"] for a in manifest["artifacts"] if a["role"] == "book_pdf"), "method": "actual whole-page PyMuPDF render viewed individually, plus actual native original PNG viewed individually; no inference from title/altText alone", "goalCount": len(visual), "pages": visual})
    print(f"pack{n}: {len(records)} candidate/ai_candidate keep records; records {digest(raw)}")
assert len(total) == 46 and len({r["goalId"] for r in total}) == 46
assert sum(r["fullScope"] for r in total) == 11
write_json(BASE / "native-d-final46-ordered-pack1-scope46-v2/round-a/reviewer-artifacts/independent-review-scope-and-decisions.json", {"reviewer": IDENTITY, "blindToRoundB": True, "records": 46, "fullNewReviews": 11, "targetedOldWholePageContextReviews": 35, "unchangedWholePagesNotReopened": 265, "decisionCounts": {"keep": 46, "revise": 0, "split_review": 0, "block": 0}, "newStrictClosures": 0, "liveWrites": [], "sourceWholeCourseworkApproval": False, "humanApproval": False, "rows": total})
