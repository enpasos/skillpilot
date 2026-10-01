"""Bind substantive AI synthesis to both exact current E-post review rounds."""

from datetime import datetime, timedelta
from hashlib import sha256
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[8]
SCHEMA = "https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json"
CONFIG = json.loads((HERE.parent / f"{HERE.name}.config.json").read_text())
BATCH_BYTES = (HERE / "batch-manifest.json").read_bytes()
BATCH = json.loads(BATCH_BYTES)
SUMMARY_BYTES = (HERE / "dual-summary.json").read_bytes()
SUMMARY = json.loads(SUMMARY_BYTES)


def digest(value):
    return "sha256:" + sha256(value).hexdigest()


def stable(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def load_round(label):
    directory = HERE / f"round-{label}"
    campaign = json.loads((directory / "description-review-campaign.json").read_text())
    review_input = json.loads((directory / "description-review-input.json").read_text())
    batch = campaign["batches"][0]
    run = json.loads((directory / "results" / f"{batch['batchId']}.run.json").read_text())
    records_bytes = (directory / "results" / f"{batch['batchId']}.records.jsonl").read_bytes()
    records = {}
    for line in records_bytes.splitlines():
        if line.strip():
            record = json.loads(line)
            records[record["goalId"]] = (record, digest(line))
    binding = {
        "campaignId": campaign["campaignId"],
        "campaignDigest": digest(stable(campaign)),
        "roundId": campaign["roundId"],
        "independenceGroupId": campaign["independenceGroupId"],
        "reviewInputFingerprint": review_input["reviewInputFingerprint"],
        "batchId": batch["batchId"],
        "batchInputFingerprint": batch["batchInputFingerprint"],
        "runId": run["runId"],
        "runManifestDigest": digest(stable(run)),
        "resultsDigest": digest(records_bytes),
    }
    return review_input, binding, run, records


FIRST_INPUT, FIRST_BINDING, FIRST_RUN, FIRST_RECORDS = load_round("a")
SECOND_INPUT, SECOND_BINDING, SECOND_RUN, SECOND_RECORDS = load_round("b")
assert FIRST_INPUT["reviewInputFingerprint"] == SECOND_INPUT["reviewInputFingerprint"]
assert [g["goalId"] for g in FIRST_INPUT["goals"]] == BATCH["goalIds"]
assert [g["goalId"] for g in SECOND_INPUT["goals"]] == BATCH["goalIds"]

RATIONALes = {
    "5c2ce7b1": (
        "Beide aktuellen unabhängigen Runden halten die präzisierte Unterscheidung zwischen passivem Kanal-/Carriertransport und energiegekoppeltem aktivem Proteintransport. Die A-Runde prüft den Ausfall der Pumpenenergie; B verlangt eine erneute Entscheidung bei umgekehrtem Ionengefälle. Das Bild liefert nur Anschauung. Die Synthese ist maschinell und keine menschliche Freigabe.",
        "Both current independent rounds retain the clarified distinction between passive channel/carrier transport and energy-coupled active protein transport. Round A tests loss of pump energy; round B requires a fresh decision under a reversed ion gradient. The image only illustrates the idea. This is machine synthesis, not human approval.",
    ),
    "01819a6c": (
        "Beide aktuellen unabhängigen Runden halten die zwei Hemmungsprinzipien als eine Vergleichskompetenz: Konkurrenz am aktiven Zentrum gegenüber Wirkung nach Bindung an anderer Stelle. A begrenzt Beispiele auf geeignete Strukturangaben; B trennt Messbefund und Modell und fordert keinen benannten Hemmstoff. Das Bild ist kein Lernnachweis. Nur maschinelle D-Synthese.",
        "Both current independent rounds retain the two inhibition principles as one comparison: competition at the active site versus an effect after binding elsewhere. A limits examples to suitable structural information; B separates measured findings from the model and requires no named inhibitor. The image is not learner evidence. Machine D synthesis only.",
    ),
}


def main():
    source_path = ROOT / BATCH["source"]["landscapePath"]
    batch = {
        "batchId": BATCH["batchId"],
        "batchManifestDigest": digest(BATCH_BYTES),
        "configDigest": BATCH["configDigest"],
        "bundleFingerprint": BATCH["artifacts"]["bundleFingerprint"],
        "bookDigest": FIRST_INPUT["bookDigest"],
        "reviewInputFingerprint": FIRST_INPUT["reviewInputFingerprint"],
        "dualSummaryDigest": digest(SUMMARY_BYTES),
        "canonicalLandscapeDigest": digest(source_path.read_bytes()),
    }
    completed = max(datetime.fromisoformat(r["completedAt"].replace("Z", "+00:00")) for r in (FIRST_RUN, SECOND_RUN))
    synthesized_at = (completed + timedelta(seconds=1)).isoformat(timespec="milliseconds").replace("+00:00", "Z")
    decisions = []
    for goal in FIRST_INPUT["goals"]:
        goal_id = goal["goalId"]
        if goal_id[:8] not in RATIONALes:
            continue
        first, first_digest = FIRST_RECORDS[goal_id]
        second, second_digest = SECOND_RECORDS[goal_id]
        assert first["decision"] == second["decision"] == "keep"
        rationale_de, rationale_en = RATIONALes[goal_id[:8]]
        decisions.append({
            "decisionId": f"{BATCH['batchId']}-synthesis-decision-{len(decisions)+1:03d}",
            "goalId": goal_id,
            "effectiveSemanticKind": "curricularAtomic",
            "goalFingerprint": goal["goalFingerprint"],
            "pageFingerprint": goal["pageFingerprint"],
            "goalReviewContextFingerprint": digest(stable({"contract": "goal-description-review-context-v1", "goal": goal})),
            "finalText": {
                "titleDe": goal["currentTitleDe"],
                "titleEn": goal["currentTitleEn"],
                "descriptionDe": goal["currentDescriptionDe"],
                "descriptionEn": goal["currentDescriptionEn"],
            },
            "resolutionDecision": "keep_current",
            "evidenceRound": "second",
            "records": {
                "first": {"recordId": first["recordId"], "recordDigest": first_digest},
                "second": {"recordId": second["recordId"], "recordDigest": second_digest},
            },
            "rationaleDe": rationale_de,
            "rationaleEn": rationale_en,
        })
    deferred_id = "1984fd66-c117-5c29-87b3-1c1626e4ba81"
    deferred = {
        "goalId": deferred_id,
        "firstDecision": FIRST_RECORDS[deferred_id][0]["decision"],
        "secondDecision": SECOND_RECORDS[deferred_id][0]["decision"],
        "rationaleDe": "Runde B belegt eine verbliebene Kausallücke: Konstante Enzymmenge allein hält pH, Temperatur und weitere Messbedingungen nicht fest. Der vorgeschlagene Zusatz ‚und sonst gleichen Bedingungen‘ ist fachlich nötig; die A-KEEP-Entscheidung reicht deshalb nicht zur Zurückweisung dieser Revision. Aktuellen Kanontext gezielt korrigieren und nur betroffene D-/Seiten-/Bild-/P-Bindungen erneut prüfen; bis dahin kein strenger D-Abschluss.",
        "rationaleEn": "Round B identifies a remaining causal gap: a fixed enzyme amount alone does not hold pH, temperature and other measurement conditions constant. Its proposed addition 'and otherwise equal conditions' is scientifically needed, so the A keep record does not justify rejecting it. Revise the current canonical wording and recheck only affected D/page/image/P bindings; no strict D closure meanwhile.",
    }
    payload = {
        "$schema": SCHEMA,
        "schemaVersion": 1,
        "synthesisContract": "goal-description-rollout-synthesis-decision-v1",
        "manifestId": f"{BATCH['batchId']}-synthesis",
        "authority": "ai_synthesis",
        "synthesizedBy": "OpenAI Codex QA agent; explicit synthesis of two current AI candidate reviews; no human approval",
        "synthesizedAt": synthesized_at,
        "batch": batch,
        "rounds": {"first": FIRST_BINDING, "second": SECOND_BINDING},
        "decisions": decisions,
        "deferredGoals": [deferred],
    }
    payload["manifestFingerprint"] = digest(stable(payload))
    (HERE / "synthesis-decisions.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
    print(f"Synthesis manifest: strict candidates {len(decisions)}/{len(BATCH['goalIds'])}; deferred 1")


if __name__ == "__main__":
    main()
