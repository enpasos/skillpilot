"""First independent D pass on the repaired, current E.1 pages.

The case notes below are the actual content review; the generated records merely
bind these decisions to the immutable prepared page and source fingerprints.
"""

from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
PACKAGE = HERE.parent
CAMPAIGN = json.loads((HERE / "description-review-campaign.json").read_text())
INPUT_PATH = next((HERE / "batches").glob("*.jsonl"))
INPUT = [json.loads(line) for line in INPUT_PATH.read_text().splitlines() if line]
BATCH = CAMPAIGN["batches"][0]
assert len(INPUT) == 3

# essential DE/EN, observable DE/EN, transfer DE/EN, rationale.
EVIDENCE = {
    "5c2ce7b1": (
        "Passive Kanal- oder Carrierwege folgen in diesem vereinfachten Modell einem geeigneten Gefälle ohne zusätzliche Energie; aktiver Proteintransport ist energiegekoppelt und kann ein Teilchen gegen das Gefälle bewegen. Ein bloßer Kanal ist keine aktive Pumpe.",
        "Passive channel or carrier routes in this simplified model follow a suitable gradient without added energy; active protein transport is energy-coupled and can move a particle against the gradient. A simple channel is not an active pump.",
        "Für zwei neue Membranschemata mit gegebenen Konzentrationsseiten und ATP-Verfügbarkeit begründet die lernende Person, wann ein passiver Kanal/Carrier und wann ein energiegekoppelter Transporter nötig ist.",
        "For two new membrane diagrams with given concentration sides and ATP availability, the learner explains when a passive channel/carrier or an energy-coupled transporter is needed.",
        "Wird die Energieversorgung im Pumpenfall unterbrochen, verneint sie den bisherigen Transport gegen das Gefälle, lässt aber einen geeigneten passiven Weg entlang des Gefälles offen.",
        "When energy supply is interrupted in the pump case, the learner rejects the previous movement against the gradient but keeps a suitable passive route down the gradient possible.",
        "Amtlicher HE-E.1-Membranpunkt und B-REVISE sind jetzt präzise: Kanäle/Carrier werden nicht pauschal als aktiv bezeichnet. Das unveränderte aktive PNG zeigt einen Wasserkanal und getrennt eine ATP-gekoppelte Pumpe; A/M/V-Bindungen wurden nach Textkorrektur gezielt geprüft. DE/EN gleichwertig; AI-Kandidat."),
    "1984fd66": (
        "Bei gleichem Reaktionsvolumen und fester Enzymmenge erhöht mehr Substrat die Konzentration und zunächst die Reaktionsrate; wenn aktive Zentren weitgehend ausgelastet sind, nähert sich die Aktivität einem Plateau.",
        "At equal reaction volume and a fixed enzyme amount, more substrate raises concentration and initially the reaction rate; when active sites are largely occupied, activity approaches a plateau.",
        "Die lernende Person deutet eine neue Reihe mit kontrolliertem Volumen und gleicher Enzymmenge, beschreibt Anstieg und Sättigung ohne fiktive absolute Raten und erklärt die Rolle besetzter aktiver Zentren.",
        "The learner interprets a new series with controlled volume and fixed enzyme amount, describes the rise and saturation without inventing absolute rates, and explains the role of occupied active sites.",
        "In einer zweiten Reihe mit mehr Enzymen erkennt sie, dass die alte Plateauhöhe nicht unverändert vorausgesetzt werden darf; eine genaue neue Höhe wird aus einem bloßen Schema nicht behauptet.",
        "In a second series with more enzyme, the learner recognizes that the old plateau height cannot simply be assumed; an exact new height is not claimed from a schematic diagram.",
        "Amtlicher HE-E.2.3-Punkt nennt Substratkonzentration. Nach B-REVISE sind Zieltext und aktives PNG korrigiert; das neue Bild zeigt gleiche Flüssigkeitsvolumina/je drei Enzyme, rechts mehr Substrat, eine Konzentrationsachse und qualitative Sättigung. Bild ersetzt keine Messreihe. DE/EN gleichwertig; AI-Kandidat."),
    "01819a6c": (
        "Kompetitive Hemmung wirkt durch Konkurrenz am aktiven Zentrum; allosterische Hemmung durch Bindung an anderer Stelle und Änderung der Enzymwirkung. Jede Variante braucht ein eigenes geeignetes Beispiel.",
        "Competitive inhibition involves competition at the active site; allosteric inhibition involves binding elsewhere and changing enzyme action. Each variant needs its own suitable example.",
        "An zwei neuen Beispielen mit jeweils einem Hemmstoff erklärt die lernende Person den Bindungsort und die Folge für Substratbindung oder Katalyse getrennt für kompetitive und allosterische Hemmung.",
        "Using two new examples with one inhibitor each, the learner separately explains the binding site and effect on substrate binding or catalysis for competitive and allosteric inhibition.",
        "Bei veränderten Hemmstoffformen ordnet sie nur aus passenden Struktur-/Bindungsangaben zu und verwechselt einen allosterischen Ort nicht mit einem freien aktiven Zentrum ohne Hemmwirkung.",
        "For changed inhibitor shapes, the learner classifies only from suitable structure/binding information and does not confuse an allosteric site with an unoccupied active site that has no inhibitory effect.",
        "Amtlicher HE-E.2.4-Punkt fordert Hemmungsprinzip, nicht Wirksamkeitsbewertung oder Alltagseinsatz. B-REVISE 'jeweils ein Beispiel' wurde im Kanon umgesetzt. Das aktive Zweifeld-PNG zeigt tatsächlich zwei unterschiedliche Bindestellen und wurde nach Textkorrektur bei 360px erneut geprüft. DE/EN gleichwertig; AI-Kandidat."),
}


def digest(path: Path) -> str:
    return "sha256:" + sha256(path.read_bytes()).hexdigest()


def main() -> None:
    assert {row["goal"]["goalId"][:8] for row in INPUT} == set(EVIDENCE)
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    run_id = CAMPAIGN["roundId"] + "-codex-biology-e-repair-independent-a"
    records = []
    for row in INPUT:
        goal = row["goal"]
        key = goal["goalId"][:8]
        essential_de, essential_en, observable_de, observable_en, transfer_de, transfer_en, rationale = EVIDENCE[key]
        records.append({
            "$schema": "https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json",
            "schemaVersion": 1,
            "recordId": run_id + "." + goal["goalId"],
            "runId": run_id,
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
            "decision": "keep",
            "understandingEvidence": {
                "essentialUnderstandingDe": essential_de,
                "essentialUnderstandingEn": essential_en,
                "observablePerformanceDe": observable_de,
                "observablePerformanceEn": observable_en,
                "transferExpectationDe": transfer_de,
                "transferExpectationEn": transfer_en,
            },
            "rationale": rationale,
            "evidenceProfileContract": "positive-understanding-evidence-v2",
            "evidenceProfileRecommendation": "create",
            "recordStatus": "candidate",
            "reviewAuthority": "ai_candidate",
        })
    result_dir = HERE / "results"
    result_dir.mkdir(exist_ok=True)
    records_path = result_dir / (BATCH["batchId"] + ".records.jsonl")
    result_bytes = ("".join(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n" for record in records)).encode()
    records_path.write_bytes(result_bytes)
    assets = [
        ("book_model", PACKAGE / "bundle/book-model.json"),
        ("book_pdf", PACKAGE / "bundle/book.pdf"),
        ("review_prompt", HERE / "prompt.md"),
        ("review_criteria", HERE / "criteria.md"),
        ("description_review_batch_input_jsonl", INPUT_PATH),
    ]
    run = {
        "$schema": "https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json",
        "schemaVersion": 1,
        "runId": run_id,
        "campaignId": CAMPAIGN["campaignId"],
        "roundId": CAMPAIGN["roundId"],
        "batchId": BATCH["batchId"],
        "batchInputFingerprint": BATCH["batchInputFingerprint"],
        "bundleFingerprint": CAMPAIGN["bundleFingerprint"],
        "bookDigest": CAMPAIGN["bookDigest"],
        "provider": "OpenAI",
        "model": "GPT-6 Codex session (exact deployment identifier not exposed)",
        "role": "subject_reviewer",
        "promptFamilyId": "goal-description-understanding-evidence-review-v2",
        "promptFingerprint": CAMPAIGN["promptFingerprint"],
        "criteriaFingerprint": CAMPAIGN["criteriaFingerprint"],
        "generationParametersFingerprint": "sha256:" + sha256(b"gpt-6-codex-session:manual-subject-review:deployment-parameters-not-exposed").hexdigest(),
        "independenceGroupId": CAMPAIGN["independenceGroupId"],
        "blindToOtherRuns": True,
        "goalIds": [row["goal"]["goalId"] for row in INPUT],
        "inputArtifacts": [{"role": role, "digest": digest(path)} for role, path in assets],
        "startedAt": now,
        "completedAt": now,
        "status": "completed",
        "outputDigest": "sha256:" + sha256(result_bytes).hexdigest(),
        "toolchainVersion": "codex-cli-current-session",
    }
    (result_dir / (BATCH["batchId"] + ".run.json")).write_text(json.dumps(run, ensure_ascii=False, indent=2) + "\n")
    print(f"Wrote {len(records)} post-B corrected E AI candidate D records, current bundle {CAMPAIGN['bundleFingerprint']}")


if __name__ == "__main__":
    main()
