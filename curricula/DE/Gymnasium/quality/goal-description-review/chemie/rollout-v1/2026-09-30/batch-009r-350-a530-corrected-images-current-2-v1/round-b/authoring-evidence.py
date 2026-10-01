"""Blind independent Round B review of the current corrected B009r pages."""

from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
INPUT = json.loads((HERE / "description-review-input.json").read_text())
CAMPAIGN = json.loads((HERE / "description-review-campaign.json").read_text())
BUNDLE = json.loads((HERE / "review-bundle-manifest.json").read_text())
RUN_ID = "chemie-b009r-corrected-png-two-20260930-blind-b-run-001"
SCHEMA = "https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json"


def evidence(essential_de, essential_en, observable_de, observable_en, transfer_de, transfer_en):
    return dict(zip((
        "essentialUnderstandingDe", "essentialUnderstandingEn",
        "observablePerformanceDe", "observablePerformanceEn",
        "transferExpectationDe", "transferExpectationEn",
    ), (essential_de, essential_en, observable_de, observable_en, transfer_de, transfer_en)))


DECISIONS = {
    "350a394f": {
        "decision": "keep",
        "rationale": "Der aktuelle Kurztext fordert eine Erklärung über unterbrochene Verbrennungsbedingungen, weder eigene Brandbekämpfung noch eine pauschale Löschmittelregel. Das neue gebundene PNG ersetzt den früher fachlich fragwürdigen Löschdeckenhinweis durch eine Fachkraft mit Brandklasse-F-Gerät und zeigt Wasser nur beim Feststoffbrand; die Warnung vor Wasser auf Fett bleibt klar. Die B-Seite bindet dieses Bild als review_candidate, nicht als V- oder menschliche Freigabe. Eigene Evidenz muss an sicheren vorgegebenen Fällen die Wirkung und Grenzen begründen.",
        "understandingEvidence": evidence(
            "Ein einfacher Brand benötigt Brennstoff, Sauerstoff und ausreichende Temperatur. Ein geeignetes Mittel kann eine Bedingung unterbrechen; ob Wasser oder Sauerstoffbegrenzung geeignet ist, hängt vom brennenden Stoff und Risiko ab. Wasser auf heißem Fett ist gefährlich.",
            "A simple fire requires fuel, oxygen and sufficient temperature. A suitable measure can interrupt one condition; whether water or oxygen limitation is appropriate depends on the burning material and risk. Water on hot cooking fat is dangerous.",
            "Die lernende Person erklärt anhand vorgegebener Karten oder Lehrkraftdaten, weshalb Kühlen bei einem gewöhnlichen festen Brennstoff und Luftbegrenzung bei einer geschützten Modellflamme unterschiedlich wirken, und weist Wasser auf Fett begründet zurück. Keine Maßnahme wird ausgeführt.",
            "Using supplied cards or teacher data, the learner explains why cooling an ordinary solid fuel and limiting air to a protected model flame work differently, and rejects water on hot fat with a reason. No action is performed.",
            "Bei neuen Daten mit unverändertem Brennstoff, aber verringertem Sauerstoffangebot entscheidet sie, welche Bedingung nun den Brand begrenzt und weshalb ein Bild eines Speziallöschers allein keine allgemeine Handlungsanweisung liefert.",
            "With fresh data where fuel is unchanged but oxygen availability falls, the learner identifies the limiting condition and explains why an image of a specialist extinguisher alone is not a general action instruction.",
        ),
    },
    "a530ee7d": {
        "decision": "keep",
        "rationale": "Der aktuelle Satz bleibt ein präzises qualitatives Verständnisziel: Spalten kostet Energie, Bindungsbildung setzt Energie frei, der Vergleich auf derselben Reaktionsmenge bestimmt den Nettoeffekt. Das neue gebundene H₂/Cl₂→2 HCl-PNG wahrt die Atombilanz und stellt keine freien Atome mehr als vermeintlichen realen Zwischenschritt dar; die Waage ist eine Energiebilanz, kein Reaktionsmechanismus. B bindet nur review_candidate-Bildstatus und behauptet keine V- oder menschliche Freigabe.",
        "understandingEvidence": evidence(
            "Bindungsbruch benötigt Energie und Bindungsbildung setzt Energie frei. Für dieselbe Reaktionsmenge ergibt der qualitative Vergleich beider Beiträge die Netto-Energierichtung; eine Bilanzkarte zeigt keine zeitliche Folge isolierter Atome und der Nettoeffekt ist vom anfänglichen Aktivierungsbedarf zu trennen.",
            "Breaking bonds requires energy and forming bonds releases energy. For the same reaction amount, a qualitative comparison gives the net energy direction; an accounting card is not a time sequence of isolated atoms, and the net effect differs from an initial activation requirement.",
            "Die lernende Person vergleicht in einem vorgegebenen neuen Bindungsmodell die benötigte und frei werdende Energie auf gemeinsamer Bezugsmenge, begründet exotherm oder endotherm und benennt die Grenze einer schematischen Bilanzdarstellung.",
            "For a fresh supplied bond model, the learner compares energy required and released on a common reaction basis, justifies exothermic or endothermic outcome and states the limit of a schematic balance depiction.",
            "Bei einer zweiten Reaktion, deren Bindungsbildung weniger Energie freisetzt als die Bindungsspaltung benötigt, begründet sie die umgekehrte Netto-Energierichtung ohne Zahlenpflicht und ohne freie Atome als reale Zwischenprodukte zu behaupten.",
            "For a second reaction in which bond formation releases less energy than bond breaking needs, the learner justifies the reversed net direction without a numerical requirement or claiming free atoms as actual intermediates.",
        ),
    },
}


def main():
    batch = CAMPAIGN["batches"][0]
    assert INPUT["bundleFingerprint"] == CAMPAIGN["bundleFingerprint"] == BUNDLE["bundleFingerprint"]
    assert [goal["goalId"] for goal in INPUT["goals"]] == batch["goalIds"]
    assert {goal["goalId"][:8] for goal in INPUT["goals"]} == set(DECISIONS)
    records = []
    for index, goal in enumerate(INPUT["goals"], 1):
        decision = DECISIONS[goal["goalId"][:8]]
        records.append({
            "$schema": SCHEMA,
            "schemaVersion": 1,
            "recordId": f"chemie-b009r-b-{index:02d}-{goal['goalId'][:8]}",
            "runId": RUN_ID,
            "campaignId": CAMPAIGN["campaignId"],
            "roundId": CAMPAIGN["roundId"],
            "bundleFingerprint": CAMPAIGN["bundleFingerprint"],
            "bookDigest": CAMPAIGN["bookDigest"],
            "goalId": goal["goalId"],
            "goalFingerprint": goal["goalFingerprint"],
            "pageFingerprint": goal["pageFingerprint"],
            "currentTitleDe": goal["currentTitleDe"],
            "currentTitleEn": goal["currentTitleEn"],
            "currentDescriptionDe": goal["currentDescriptionDe"],
            "currentDescriptionEn": goal["currentDescriptionEn"],
            **decision,
            "evidenceProfileContract": "positive-understanding-evidence-v2",
            "evidenceProfileRecommendation": "create",
            "recordStatus": "candidate",
            "reviewAuthority": "ai_candidate",
        })
    output = ("\n".join(json.dumps(record, ensure_ascii=False, separators=(",", ":")) for record in records) + "\n").encode()
    result_dir = HERE / "results"
    result_dir.mkdir(exist_ok=True)
    (result_dir / f"{batch['batchId']}.records.jsonl").write_bytes(output)
    now = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
    review_input_artifact = next(a for a in BUNDLE["artifacts"] if a["role"] == "review_input_json")
    run = {
        "$schema": "https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json",
        "schemaVersion": 1,
        "runId": RUN_ID,
        "campaignId": CAMPAIGN["campaignId"],
        "roundId": CAMPAIGN["roundId"],
        "batchId": batch["batchId"],
        "batchInputFingerprint": batch["batchInputFingerprint"],
        "bundleFingerprint": CAMPAIGN["bundleFingerprint"],
        "bookDigest": CAMPAIGN["bookDigest"],
        "provider": "OpenAI",
        "model": "gpt-6-astra",
        "role": "subject_reviewer",
        "promptFamilyId": "goal-description-understanding-evidence-review-v2",
        "promptFingerprint": CAMPAIGN["promptFingerprint"],
        "criteriaFingerprint": CAMPAIGN["criteriaFingerprint"],
        "generationParametersFingerprint": "sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a",
        "independenceGroupId": CAMPAIGN["independenceGroupId"],
        "blindToOtherRuns": True,
        "goalIds": batch["goalIds"],
        "inputArtifacts": [
            {"role": "review_input_json", "digest": review_input_artifact["digest"]},
            {"role": "review_prompt", "digest": CAMPAIGN["promptFingerprint"]},
            {"role": "review_criteria", "digest": CAMPAIGN["criteriaFingerprint"]},
            {"role": "description_review_batch_input_jsonl", "digest": batch["batchInputFingerprint"]},
        ],
        "startedAt": now,
        "completedAt": now,
        "status": "completed",
        "outputDigest": "sha256:" + sha256(output).hexdigest(),
        "toolchainVersion": "skillpilot-goal-description-review-v2",
    }
    (result_dir / f"{batch['batchId']}.run.json").write_text(json.dumps(run, ensure_ascii=False, indent=2) + "\n")
    print(f"Materialized {len(records)} blind B009r records and run manifest")


if __name__ == "__main__":
    main()
