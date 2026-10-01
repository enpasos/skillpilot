"""Materialize independent blind Bio E-phase post-correction Round B."""

from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
INPUT = json.loads((HERE / "description-review-input.json").read_text())
CAMPAIGN = json.loads((HERE / "description-review-campaign.json").read_text())
BUNDLE = json.loads((HERE / "review-bundle-manifest.json").read_text())
RUN_ID = "biologie-ephase-post-b-three-20260930-blind-b-run-001"
SCHEMA = "https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json"


def evidence(essential_de, essential_en, observable_de, observable_en, transfer_de, transfer_en):
    return dict(zip((
        "essentialUnderstandingDe", "essentialUnderstandingEn",
        "observablePerformanceDe", "observablePerformanceEn",
        "transferExpectationDe", "transferExpectationEn",
    ), (essential_de, essential_en, observable_de, observable_en, transfer_de, transfer_en)))


DECISIONS = {
    "5c2ce7b1": {
        "decision": "keep",
        "rationale": "Der aktuelle Text verknüpft Kanal/Carrier und energiegekoppelten Transport durch genau einen prüfbaren Vergleich von Richtung zum Gradienten und Energieeinsatz. Er verwechselt passive Transportproteine nicht mit freier Diffusion durch die Lipidschicht und behauptet keinen bestimmten Pumpmechanismus. Die Bildfelder sind laut B-Eingang V-Kandidat und kein Lernnachweis; externe Quellen- oder Länderfreigabe wird daraus nicht abgeleitet.",
        "understandingEvidence": evidence(
            "Bei passivem Transport erleichtern Kanal- oder Carrierproteine die Bewegung eines Stoffes entlang seines geeigneten Konzentrations- bzw. elektrochemischen Gefälles ohne gekoppelten Energieeinsatz; energiegekoppelte Transportproteine können Stoffe gegen ein solches Gefälle bewegen.",
            "In passive transport, channel or carrier proteins facilitate movement along the relevant concentration or electrochemical gradient without coupled energy input; energy-coupled transport proteins can move solutes against such a gradient.",
            "Die lernende Person nutzt vorgegebene Konzentrations- und Energiedaten zu zwei Membranwegen, ordnet den passiven und den aktiven Fall zu und erklärt, welches Merkmal die Einordnung trägt.",
            "The learner uses supplied concentration and energy data for two membrane pathways, identifies the passive and active case and explains which feature supports each classification.",
            "In einem neuen Fall mit umgekehrtem Ionengefälle und ausdrücklich gegebener Energiezufuhr prüft sie die Transportrichtung erneut, statt die Form eines Kanal- oder Pumpensymbols abzulesen.",
            "In a fresh case with a reversed ion gradient and explicit energy supply, the learner reassesses transport direction rather than reading the shape of a channel or pump symbol.",
        ),
    },
    "1984fd66": {
        "decision": "revise",
        "rationale": "Die Substratabhängigkeit und das Sättigungsplateau sind eine atomare Daten-Modell-Erklärung. Die derzeitige Bedingung ‚konstante Enzymmenge‘ lässt jedoch pH, Temperatur oder Messdauer offen; mit veränderten weiteren Bedingungen wäre ein Plateau nicht eindeutig durch endliche Enzymbesetzung erklärbar. Die enge Ergänzung ‚sonst gleiche Bedingungen‘ begrenzt die Kausalaussage ohne neue Methode. Das gebundene Bild bleibt V-Kandidat und ersetzt keine Messdaten.",
        "proposedDescriptionDe": "Die lernende Person kann aus Daten bei konstanter Enzymmenge und sonst gleichen Bedingungen erklären, warum die Enzymaktivität bei steigender Substratkonzentration schließlich ein Sättigungsplateau erreicht.",
        "proposedDescriptionEn": "The learner can use data at a fixed enzyme amount and otherwise equal conditions to explain why enzyme activity eventually reaches a saturation plateau as substrate concentration rises.",
        "understandingEvidence": evidence(
            "Bei gleicher Enzymmenge und sonst gleichen Bedingungen steigt die Reaktionsrate mit verfügbarem Substrat zunächst; bei hoher Substratkonzentration sind die aktiven Zentren weitgehend ausgelastet und mehr Substrat allein erhöht die Rate kaum weiter. Enzyme werden dabei nicht verbraucht.",
            "With a fixed enzyme amount and otherwise equal conditions, reaction rate initially rises as substrate becomes available; at high substrate concentration active sites are largely occupied, so extra substrate alone scarcely raises the rate. Enzymes are not consumed.",
            "Die lernende Person beschreibt aus einer vorgelegten Messreihe Anstieg und Plateau, benennt die kontrollierten Bedingungen und deutet das Plateau als begrenzte Verarbeitungskapazität des vorhandenen Enzyms, nicht als direkte Sicht auf aktive Zentren.",
            "The learner describes the rise and plateau in supplied measurements, names the controlled conditions and interprets the plateau as the limited processing capacity of the available enzyme, not as a direct view of active sites.",
            "Bei einer neuen Messreihe, deren höchste Substratwerte noch steigende Raten zeigen, erklärt sie, warum diese Daten noch kein Plateau belegen, und sagt unter unveränderten Bedingungen den erwarteten späteren Verlauf begründet voraus.",
            "With fresh measurements whose highest substrate values still show rising rates, the learner explains why these data do not yet establish a plateau and predicts the later course under unchanged conditions with a reason.",
        ),
    },
    "01819a6c": {
        "decision": "keep",
        "rationale": "Kompetitive und allosterische Hemmung sind hier zwei zu vergleichende Ausprägungen desselben Hemmungsprinzips; die aktuelle Beschreibung fordert je ein geeignetes Beispiel, aber keine namentlich festgelegten Hemmstoffe oder detaillierte Kinetik. Deutsch und Englisch tragen denselben Anspruch. Das vereinfachte Bild ist nur V-Kandidat; die Erklärung muss aus einem unabhängigen Modell oder Befund erfolgen.",
        "understandingEvidence": evidence(
            "Bei kompetitiver Hemmung konkurriert ein Hemmstoff im einfachen Modell mit dem Substrat um das aktive Zentrum. Ein allosterischer Hemmstoff bindet an anderer Stelle und verändert dadurch die Enzymfunktion; beides mindert die katalysierte Reaktion auf unterschiedliche Weise.",
            "In a simple competitive-inhibition model, an inhibitor competes with the substrate for the active site. An allosteric inhibitor binds elsewhere and thereby changes enzyme function; both reduce catalysis in different ways.",
            "Die lernende Person erklärt anhand zweier neuer vorgegebener Hemmstoffbeispiele Bindungsort und Wirkprinzip und unterscheidet eine beobachtete geringere Reaktionsrate von der modellhaften Erklärung dafür.",
            "For two fresh supplied inhibitor examples, the learner explains binding location and principle and distinguishes a measured lower reaction rate from the model used to explain it.",
            "In einem anderen Enzymmodell bleibt das aktive Zentrum frei, aber eine seitlich gebundene Substanz verändert die Katalyse; die lernende Person ordnet dies begründet allosterisch statt kompetitiv ein.",
            "In another enzyme model, the active site remains free but a substance bound elsewhere changes catalysis; the learner justifies classifying this as allosteric rather than competitive.",
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
            "recordId": f"biologie-e-post-b-{index:02d}-{goal['goalId'][:8]}",
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
    print(f"Materialized {len(records)} blind E-phase post-B records and run manifest")


if __name__ == "__main__":
    main()
