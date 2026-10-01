"""Independent blind Round B on the current corrected 5a page and PNG."""

from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
INPUT = json.loads((HERE / "description-review-input.json").read_text())
CAMPAIGN = json.loads((HERE / "description-review-campaign.json").read_text())
BUNDLE = json.loads((HERE / "review-bundle-manifest.json").read_text())
GOAL = INPUT["goals"][0]
BATCH = CAMPAIGN["batches"][0]
RUN_ID = "chemie-b007s-5a-corrected-png-20260930-blind-b-run-001"

assert GOAL["goalId"] == BATCH["goalIds"][0]
assert GOAL["reviewContext"]["page"]["visualization"]["originalDigest"] == "sha256:bd0c0ee87fa3929a90a9768d59e085536f594792bb2d19cfbd3467a4df0540d1"

RECORD = {
    "$schema": "https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json",
    "schemaVersion": 1,
    "recordId": "chemie-b007s-5a-b-01-5a709938",
    "runId": RUN_ID,
    "campaignId": CAMPAIGN["campaignId"],
    "roundId": CAMPAIGN["roundId"],
    "bundleFingerprint": CAMPAIGN["bundleFingerprint"],
    "bookDigest": CAMPAIGN["bookDigest"],
    "goalId": GOAL["goalId"],
    "goalFingerprint": GOAL["goalFingerprint"],
    "pageFingerprint": GOAL["pageFingerprint"],
    "currentTitleDe": GOAL["currentTitleDe"],
    "currentTitleEn": GOAL["currentTitleEn"],
    "currentDescriptionDe": GOAL["currentDescriptionDe"],
    "currentDescriptionEn": GOAL["currentDescriptionEn"],
    "decision": "keep",
    "rationale": "Die Beschreibung ist eine zusammenhängende Verfahrenskompetenz: Ein Gemisch wird anhand einer für seine Bestandteile trennwirksamen Stoffeigenschaft mit einem passenden Verfahren bearbeitet und die Wahl begründet. Das aktuelle PNG SHA256 bd0c0ee87fa3929a90a9768d59e085536f594792bb2d19cfbd3467a4df0540d1 wurde in Originalgröße sowie bei 680 und 360 Pixeln tatsächlich gesehen: Filterrückstand/Filtrat, verdampftes und kondensiertes Wasser bei zurückbleibendem Salz sowie Teebeutel-Extraktion sind stimmig; der Kühler zeigt unten rechts Kühlwasserzulauf und oben links Ablauf getrennt vom Dampfrohr. Die D-Runde erteilt damit keine Bildfreigabe. Eine Destillation wird nur betreut oder datenbasiert als Nachweis verlangt; Quellen-/Projektionsfreigaben folgen nicht aus den allgemeinen Tags.",
    "understandingEvidence": {
        "essentialUnderstandingDe": "Filtration trennt nach Teilchengröße einen unlöslichen Feststoff von einer Flüssigkeit; Destillation nutzt unterschiedliche Flüchtigkeit und Kondensation; Extraktion löst ausgewählte Bestandteile mit einem geeigneten Lösungsmittel. Die passende Wahl folgt aus den Stoffeigenschaften und dem Trennziel.",
        "essentialUnderstandingEn": "Filtration separates an insoluble solid from a liquid by particle size; distillation uses different volatility and condensation; extraction dissolves selected components in a suitable solvent. A suitable choice follows from material properties and the separation aim.",
        "observablePerformanceDe": "Die lernende Person trennt ein ungefährliches Feststoff-Flüssigkeits-Gemisch betreut, benennt Rückstand und Filtrat und erläutert für vorgegebene Destillations- und Extraktionsdaten, wo die gewünschten Stoffe jeweils verbleiben und warum.",
        "observablePerformanceEn": "The learner separates a harmless solid-liquid mixture under supervision, names residue and filtrate, and uses supplied distillation and extraction data to explain where the desired substances end up and why.",
        "transferExpectationDe": "Bei einem neuen Sand-Salz-Wasser-Gemisch wählt sie eine begründete Abfolge aus Lösen, Filtrieren und betreutem beziehungsweise datenbasiertem Rückgewinnen des Wassers; sie verwechselt Filtrat nicht mit gelöstem Salz als reinem Wasser.",
        "transferExpectationEn": "For a fresh sand-salt-water mixture, the learner justifies a sequence of dissolving, filtering and supervised or data-based water recovery; they do not mistake salt-containing filtrate for pure water.",
    },
    "evidenceProfileContract": "positive-understanding-evidence-v2",
    "evidenceProfileRecommendation": "create",
    "recordStatus": "candidate",
    "reviewAuthority": "ai_candidate",
}


def main():
    results = HERE / "results"
    results.mkdir(exist_ok=True)
    output = (json.dumps(RECORD, ensure_ascii=False, separators=(",", ":")) + "\n").encode()
    (results / f"{BATCH['batchId']}.records.jsonl").write_bytes(output)
    now = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
    review_input_artifact = next(a for a in BUNDLE["artifacts"] if a["role"] == "review_input_json")
    run = {
        "$schema": "https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json",
        "schemaVersion": 1,
        "runId": RUN_ID,
        "campaignId": CAMPAIGN["campaignId"],
        "roundId": CAMPAIGN["roundId"],
        "batchId": BATCH["batchId"],
        "batchInputFingerprint": BATCH["batchInputFingerprint"],
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
        "goalIds": BATCH["goalIds"],
        "inputArtifacts": [
            {"role": "review_input_json", "digest": review_input_artifact["digest"]},
            {"role": "review_prompt", "digest": CAMPAIGN["promptFingerprint"]},
            {"role": "review_criteria", "digest": CAMPAIGN["criteriaFingerprint"]},
            {"role": "description_review_batch_input_jsonl", "digest": BATCH["batchInputFingerprint"]},
        ],
        "startedAt": now,
        "completedAt": now,
        "status": "completed",
        "outputDigest": "sha256:" + sha256(output).hexdigest(),
        "toolchainVersion": "skillpilot-goal-description-review-v2",
    }
    (results / f"{BATCH['batchId']}.run.json").write_text(json.dumps(run, ensure_ascii=False, indent=2) + "\n")
    print("Materialized 1 current blind B007s-5a record and run manifest")


if __name__ == "__main__":
    main()
