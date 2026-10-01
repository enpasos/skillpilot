"""Independent A content review for the repaired E.2-E.4 pages.

The individual case notes are authored before record materialization. They are
AI candidates, not human approvals or a claim that the paired B review agrees.
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
assert len(INPUT) == 9

# Essential, observable, transfer (DE/EN), then the source/atomicity/image reason.
EVIDENCE = {
    "28850d2e": (
        "Peptidbindungen verknüpfen Aminosäuren zur gerichteten Polypeptidkette; Primär-, Sekundär-, Tertiär- und gegebenenfalls Quartärstruktur beschreiben verschiedene Ebenen desselben Proteinaufbaus.",
        "Peptide bonds link amino acids into a directional polypeptide; primary, secondary, tertiary and, where applicable, quaternary structure describe levels of the same protein architecture.",
        "Die lernende Person baut für eine neue kurze Aminosäurefolge eine Kette, markiert die Bindungen und erklärt anhand einer Faltungsskizze, welche Information jede Strukturebene hinzufügt.",
        "For a new short amino-acid sequence, the learner builds a chain, marks the bonds and explains from a folding diagram what each structural level adds.",
        "Bei einem Protein aus nur einer Kette benennt sie keine zwingende Quartärstruktur und trennt eine Änderung der Sequenz von einer reinen Faltungsänderung.",
        "For a single-chain protein, the learner does not require quaternary structure and distinguishes a sequence change from a folding change.",
        "HE E.2 Proteinbau wird als zusammenhängender Weg von Kette zu Strukturmodell geprüft. Die vier Ebenen sind keine vier unverbundenen Ziele; das vorhandene Bild ist Illustration und keine vollständige Prüfung. AI-Kandidat."),
    "0dbe758c": (
        "Ein Enzym bindet geeignete Substrate, erleichtert eine Reaktion durch eine niedrigere Aktivierungsbarriere und wird dabei nicht als Reaktionsstoff verbraucht.",
        "An enzyme binds suitable substrates, facilitates a reaction by lowering the activation barrier and is not consumed as a reactant.",
        "An einem neuen Schema einer Stärke-spaltenden Reaktion erklärt die lernende Person Substratbindung, Produktbildung und erneute Verfügbarkeit des Enzyms ohne eine selbst erfundene Reaktionsgleichung.",
        "For a new starch-cleavage diagram, the learner explains substrate binding, product formation and reuse of the enzyme without inventing a reaction equation.",
        "Bei einem anderen Substrat erklärt sie, warum die bloße Anwesenheit desselben Enzyms keine Katalyse jeder beliebigen Reaktion belegt.",
        "For another substrate, the learner explains why the enzyme's presence does not imply catalysis of every reaction.",
        "HE E.2.2 verlangt Katalyse an einem geeigneten Beispiel; aktuelle Formulierung grenzt Prinzip von Einflussfaktoren und Hemmung ab. Bild zeigt aktives Zentrum schematisch, nicht reale Molekülgeometrie. AI-Kandidat."),
    "f539fe51": (
        "Enzymaktivität kann mit steigender Temperatur zunächst zunehmen und nach Strukturverlust abfallen; aus Daten wird ein Bereich/Optimum und keine universelle Fixzahl abgeleitet.",
        "Enzyme activity may rise with temperature at first and then fall after structural loss; data justify a range or optimum, not a universal fixed temperature.",
        "Die lernende Person liest aus einer neuen kontrollierten Aktivitätsreihe den Temperaturverlauf, markiert ein beobachtetes Maximum und begründet einen möglichen starken Abfall durch Denaturierung.",
        "The learner interprets a new controlled activity series, locates the observed temperature maximum and explains a possible sharp fall through denaturation.",
        "Bei einem thermophilen Enzym überträgt sie das Deutungsmuster, ohne das Maximum eines menschlichen Enzyms auf diesen Fall zu kopieren.",
        "For a thermophile enzyme, the learner transfers the interpretation without copying a human enzyme's optimum.",
        "HE E.2.3 führt Temperatur als einen Einflussfaktor; nach Split ist pH d06 und Sättigung 198 getrennt. Das Drei-Panel-Bild liefert nur qualitatives Schema, kontrollierte Daten müssen separat gegeben werden. AI-Kandidat."),
    "d06adc48": (
        "Der pH-Wert kann Ladungen und Form des aktiven Zentrums beeinflussen; Aktivitätsdaten zeigen ein enzymspezifisches Optimum statt eines allgemein besten pH-Werts.",
        "pH can affect charges and the active-site shape; activity data reveal an enzyme-specific optimum rather than one universally best pH.",
        "Aus zwei neuen Messreihen mit gleichem Substrat und kontrollierter Temperatur liest die lernende Person unterschiedliche pH-Optima ab und begründet den Vergleich.",
        "From two new measurement series with the same substrate and controlled temperature, the learner reads distinct pH optima and explains the comparison.",
        "Bei einer neuen Reihe mit breitem Plateau spricht sie von einem optimalen Bereich und behauptet keinen exakt bestimmten Einzelwert.",
        "For a new series with a broad plateau, the learner reports an optimum range rather than an exact single value.",
        "HE E.2.3 pH-Wert wurde aus dem Mehrfaktorziel separat atomisiert. Das wiederverwendete Bild zeigt ein qualitatives pH-Panel; Lesart und Geltungsgrenze gehören in den Fall. AI-Kandidat."),
    "1984fd66": (
        "Bei fester Enzymmenge steigen besetzte aktive Zentren mit Substratangebot, bis weitere Substrate die Reaktionsrate kaum erhöhen; ein Plateau bedeutet nicht, dass kein Substrat mehr vorhanden ist.",
        "With a fixed enzyme amount, occupied active sites increase as substrate is added until extra substrate barely increases the rate; a plateau does not mean all substrate is gone.",
        "Die lernende Person deutet eine neue Messreihe bei konstanter Enzymmenge, ordnet Anstieg und Plateau den belegten bzw. ausgelasteten aktiven Zentren zu.",
        "The learner interprets a new series at fixed enzyme amount and relates the rise and plateau to occupied and saturated active sites.",
        "Wenn die Enzymmenge verdoppelt wird, erwartet sie unter passenden Bedingungen ein anderes erreichbares Plateau, ohne eine ungeprüfte exakte Zahl zu behaupten.",
        "When enzyme amount doubles, the learner expects a changed attainable plateau under suitable conditions without asserting an untested exact value.",
        "HE E.2.3 Substratkonzentration ist getrennt von Temperatur/pH; Bild ist qualitatives Modell und keine echte Messreihe. AI-Kandidat."),
    "01819a6c": (
        "Kompetitive Hemmung konkurriert am aktiven Zentrum; allosterische Hemmung verändert die Enzymwirkung durch Bindung an anderer Stelle. Beide werden hier als Prinzip am Beispiel erklärt, nicht bewertet.",
        "Competitive inhibition competes at the active site; allosteric inhibition changes enzyme action through binding elsewhere. Both are explained as principles using an example, not evaluated.",
        "Die lernende Person ordnet zwei neue Hemmstoffskizzen anhand der Bindungsstelle zu und erklärt für jede die Auswirkung auf Substratbindung oder Katalyse.",
        "The learner classifies two new inhibitor diagrams by binding site and explains each effect on substrate binding or catalysis.",
        "Bei einer Skizze mit Substrat und Hemmstoff zugleich am aktiven Zentrum erklärt sie, warum nicht beide dort zur selben Zeit denselben Platz einnehmen können; sie erfindet keine klinische Wirksamkeit.",
        "For a diagram with substrate and inhibitor at the active site, the learner explains why both cannot occupy the same place at once, without inventing clinical effectiveness.",
        "HE E.2.4 nennt das Prinzip der Hemmung. Die frühere unbelegte Bewertungsforderung und der Alltagsexkurs wurden entfernt. Das aktive Bild unterscheidet die zwei Bindungsorte groß genug. AI-Kandidat."),
    "e1484671": (
        "G1, S und G2 gehören zur Interphase; in S wird DNA verdoppelt, bevor in der M-Phase die Zellteilung stattfindet. Der Zyklus ist eine geordnete Folge, kein gleichzeitiges Nebeneinander.",
        "G1, S and G2 form interphase; DNA is replicated in S before cell division in M. The cycle is ordered rather than simultaneous.",
        "In einem neuen Zeitstrahl ordnet die lernende Person G1, S, G2 und M ein, markiert die DNA-Verdopplung vor der Verteilung und begründet die Reihenfolge.",
        "On a new timeline, the learner orders G1, S, G2 and M, marks DNA replication before distribution and explains the sequence.",
        "Bei einer gestörten S-Phase prognostiziert sie, weshalb ein regulärer weiterer Teilungsablauf nicht einfach unverändert angenommen werden kann.",
        "For a disrupted S phase, the learner explains why a normal subsequent division cannot simply be assumed.",
        "HE E.3.1 Zellzyklus wurde von Vergleich der beiden Teilungsarten ec88 getrennt. Das neue, geprüfte PNG zeigt in M Tochterkerne ohne falsch wandernde X-Chromosomen. AI-Kandidat."),
    "ec88fc1d": (
        "Mitose umfasst eine Teilung mit in der Regel zwei genetisch gleichen Tochterzellen und erhaltenem Chromosomensatz; Meiose umfasst zwei Teilungen mit vier haploiden Produkten und Rekombinationsmöglichkeiten.",
        "Mitosis involves one division that normally yields two genetically matching daughter cells with the chromosome set retained; meiosis involves two divisions with four haploid products and possible recombination.",
        "Aus einer neuen Ausgangszelle mit 2n=6 erstellt die lernende Person eine Vergleichstabelle zu Teilungszahl, Tochterzellzahl und Chromosomensatz, ohne eine vollständige Phasenzeichnung zu verlangen.",
        "From a new starting cell with 2n=6, the learner compares division count, daughter-cell count and chromosome sets without being asked for a full phase drawing.",
        "Bei einer haploiden Ausgangszelle erklärt sie, warum das gelernte Standardschema der Keimzellbildung aus diploider Ausgangszelle nicht unverändert passt.",
        "For a haploid starting cell, the learner explains why the standard gamete-formation scheme starting from a diploid cell does not transfer unchanged.",
        "HE E.3.1 Gegenüberstellung der Teilungsformen ist ein kohärenter Vergleich und nicht mehr mit Zellzyklus e148 gebündelt. Das alte Bild zeigt Mitose/Meiose als schematischen Vergleich; kein realer Mikroskopbefund. AI-Kandidat."),
    "9344c5ce": (
        "Ein Modellorganismus wird für eine konkrete Frage aufgrund beobachtbarer Entwicklung, kurzer Generationszeit oder zugänglicher Merkmale gewählt; Befunde lassen sich nicht pauschal auf alle Arten übertragen.",
        "A model organism is chosen for a specific question based on observable development, short generation time or accessible traits; findings do not transfer to all species without qualification.",
        "Für eine neue Frage zur Embryonalentwicklung begründet die lernende Person, ob Drosophila oder C. elegans besser passt, und nennt eine dazugehörige Grenze der Übertragung auf den Menschen.",
        "For a new embryonic-development question, the learner justifies whether Drosophila or C. elegans is more suitable and states a relevant limit on transfer to humans.",
        "Für eine Frage zu blühenden Pflanzen verwirft sie beide Tiermodelle als unmittelbaren Testfall und begründet, welche Art Organismus stattdessen nötig wäre.",
        "For a question about flowering plants, the learner rejects both animal models as direct tests and explains what kind of organism would be needed instead.",
        "HE E.4.1 nennt Entwicklungsbiologie und Modellorganismen; aktueller Text fordert begründete Eignung statt bloßer Namensnennung. Bild illustriert zwei getrennte Tiere mit jeweils eigenem Lebenszyklus. AI-Kandidat."),
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
        essential_de, essential_en, observable_de, observable_en, transfer_de, transfer_en, rationale = EVIDENCE[goal["goalId"][:8]]
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
    print(f"Wrote {len(records)} E.2-E.4 AI candidate D records, current bundle {CAMPAIGN['bundleFingerprint']}")


if __name__ == "__main__":
    main()
