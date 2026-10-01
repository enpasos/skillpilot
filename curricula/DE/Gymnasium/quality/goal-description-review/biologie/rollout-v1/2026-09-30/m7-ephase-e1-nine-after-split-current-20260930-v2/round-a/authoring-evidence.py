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
assert len(INPUT) == 9

# essential DE/EN, observable DE/EN, transfer DE/EN, rationale.
EVIDENCE = {
    "11e90f71": (
        "Lebenskennzeichen sind mehrere begründbare Eigenschaften lebender Systeme; ein einzelner augenblicklicher Eindruck, etwa Bewegung, reicht nicht als Beweis.",
        "Characteristics of life are several supportable properties of living systems; one momentary impression, such as movement, is insufficient proof.",
        "An einem neuen Keimlingsprotokoll nennt die lernende Person Wachstum, Stoffwechselhinweise und Reaktion auf Licht mit jeweils tatsächlich dokumentierten Befunden und trennt nicht beobachtete Fortpflanzung davon.",
        "Using a new seedling log, the learner identifies growth, metabolic indications and response to light from actual recorded observations, while separating reproduction that was not observed.",
        "Bei einer Hefekultur begründet sie Lebenskennzeichen aus Sprossung und Stoffwechselanzeichen, ohne sichtbare Ortsbewegung zu verlangen.",
        "For a yeast culture, the learner uses budding and metabolic signs without demanding visible locomotion.",
        "HE-KC E.1 trennt nach dem dokumentierten D-Dissent Kennzeichen von der Organisationshierarchie d71; aktueller Text verlangt eine begrenzte beobachtungsbasierte Erklärung. Das Pflanzen-PNG ist Beispielhilfe, kein Leistungsnachweis. DE/EN gleichwertig; AI-Kandidat."),
    "d71e2310": (
        "Bei einem Vielzeller bilden spezialisierte Zellen Gewebe, Gewebe tragen ein Organ, und Organe wirken im Organismus zusammen; die Ebenen sind Teil-Ganzes-Beziehungen.",
        "In a multicellular organism, specialized cells form tissues, tissues contribute to an organ, and organs work in the organism; the levels are part-whole relations.",
        "Für einen neuen Querschnitt eines Pflanzenblatts ordnet die lernende Person Zellen, Palisadengewebe, Blatt und Pflanze mit einer Begründung für jeden Ebenenwechsel ein.",
        "For a new plant-leaf section, the learner places cells, palisade tissue, leaf and plant in order and justifies each change in level.",
        "An einem tierischen Darm erklärt sie entsprechend Epithelzelle, Epithelgewebe, Darmorgan und Tier, statt die Pflanzenformen nur abzuschreiben.",
        "For an animal intestine, the learner analogously explains epithelial cell, epithelial tissue, intestinal organ and animal rather than copying the plant example.",
        "Amtlicher HE-E.1.1-Punkt umfasst Organisationsstufen; D-Split isoliert die Teil-Ganzes-Erklärung von Lebenskennzeichen. Vorhandenes Pflanzenbild zeigt die Hierarchie, weitere Motive sind Zusatzkontext. DE/EN gleichwertig; AI-Kandidat."),
    "7c6bf0cc": (
        "Lichtmikroskopie liefert sichtbare Zellgrenzen, Formen und bei geeigneter Präparation Kerne; Modelle ergänzen unsichtbare Strukturen. Prokaryotisch/eukaryotisch und Pflanze/Tier sind verschiedene Vergleichsachsen.",
        "Light microscopy yields visible cell boundaries, shapes and nuclei when suitably prepared; models add structures that cannot be seen. Prokaryote/eukaryote and plant/animal are different comparison axes.",
        "Die lernende Person vergleicht neue Mikrofotos von Bakterien, Zwiebelepidermis und gefärbten Mundschleimhautzellen, markiert tatsächliche Merkmale und ergänzt erst danach Modellinformationen.",
        "The learner compares new micrographs of bacteria, onion epidermis and stained cheek cells, marks observed features, then adds model information separately.",
        "Bei chloroplastenarmen Wurzelzellen schließt sie aus fehlendem Grün nicht auf eine Tierzelle; aus einem unsichtbaren Bakterienkern macht sie keinen mikroskopischen Negativbeweis.",
        "For root cells with few chloroplasts, the learner does not infer an animal cell from the absence of green; an unseen bacterial nucleus is not treated as negative microscopic proof.",
        "HE-E.1.2 nennt lichtmikroskopische Untersuchungen; der aktuelle Zieltext trennt Befund und ergänzendes Schema ausdrücklich. Das zweireihige PNG benennt beide Darstellungsarten. DE/EN gleichwertig; AI-Kandidat."),
    "fc8c4b02": (
        "Bauhinweise im Zellmodell begründen die Zuordnung von Organellen zu Funktionen, etwa gefaltete innere Membranen bei Mitochondrien und Thylakoidstrukturen bei Chloroplasten.",
        "Structural cues in a cell model support matching organelles to functions, such as folded inner membranes in mitochondria and thylakoids in chloroplasts.",
        "In einem unbekannten Pflanzenzellmodell begründet die lernende Person, welche markierten Strukturen Zellkern, Mitochondrien und Chloroplasten sind und welche Hauptaufgabe jede trägt.",
        "In an unfamiliar plant-cell model, the learner explains which marked structures are nucleus, mitochondria and chloroplasts and states each main function.",
        "Bei einer Wurzelzelle erwartet sie Mitochondrien auch ohne Chloroplasten und trennt deren Funktionen; die evolutive Herkunft erklärt das getrennte Ziel 1042.",
        "In a root cell, the learner expects mitochondria even without chloroplasts and distinguishes their functions; goal 1042 handles evolutionary origin separately.",
        "Amtlicher HE-E.1-Organellenpunkt verlangt Bau/Funktion; die Endosymbiontentheorie wurde nach D-Dissent ausgelagert. Das bestehende PNG zeigt beides, der untere Modellteil erweitert nur den Bildkontext. DE/EN gleichwertig; AI-Kandidat."),
    "1042bb24": (
        "Die Endosymbiontentheorie modelliert die Aufnahme und dauerhafte Integration früherer Bakterien, aus denen Mitochondrien und später Chloroplasten in eukaryotischen Linien hervorgingen; sie erklärt nicht Vielzelligkeit.",
        "Endosymbiotic theory models uptake and lasting integration of former bacteria that gave rise to mitochondria and later chloroplasts in eukaryotic lineages; it does not explain multicellularity.",
        "An einer neuen Bildfolge erklärt die lernende Person Wirt, aufgenommenen Vorläufer und verbleibendes Organell für Mitochondrien oder Chloroplasten und kennzeichnet die Folge als Modell.",
        "In a new diagram sequence, the learner identifies host, engulfed precursor and retained organelle for mitochondria or chloroplasts and labels the sequence as a model.",
        "Bei einem Fall zur Herkunft einer Zellwand verneint sie eine pauschale Endosymbiose-Erklärung und nennt die Theorie nur für die hier betroffenen Organellen.",
        "For a case about cell-wall origin, the learner rejects a blanket endosymbiotic explanation and confines the theory to the relevant organelles.",
        "Amtlicher HE-E.1.6-Punkt nennt Endosymbiontentheorie zur Evolution der Eucyten getrennt von Einzeller/Vielzeller. Wiederverwendetes PNG zeigt Modellaufnahme, aber keine eigenen DNA-/Ribosomenbelege; keine solchen Bildbelege behauptet. DE/EN gleichwertig; AI-Kandidat."),
    "6199e4c7": (
        "Einzeller erledigen Lebensfunktionen in einer Zelle, ein Zellverband verbindet ähnliche Zellen, und ein Vielzeller besitzt einen integrierten Körper mit arbeitsteiligen Zellgruppen; heutige Beispiele sind keine direkte Ahnenreihe.",
        "A unicellular organism performs life functions in one cell, a colony links similar cells, and a multicellular organism has an integrated body with division of labour; living examples are not a direct ancestor chain.",
        "Die lernende Person vergleicht drei unbekannte schematische Organismen nach Zellanordnung und Arbeitsteilung und ordnet Einzeller, Verband und Vielzeller mit sichtbaren Gründen zu.",
        "The learner compares three unfamiliar schematic organisms by cell arrangement and division of labour, assigning unicellular form, colony and multicellular form with visible reasons.",
        "Bei einer losen Algenkolonie erklärt sie, warum viele beieinanderliegende Zellen allein noch keine gegliederten Organe eines Vielzellers belegen.",
        "For a loose algal colony, the learner explains why many adjacent cells alone do not establish differentiated organs of a multicellular organism.",
        "HE-E.1.6 fordert einen evolutionsbiologischen Organisationsüberblick; die alte falsche Endosymbiose-Kausalität wurde entfernt. Das neue PNG stellt Formen ohne Abstammungspfeile gegenüber. DE/EN gleichwertig; AI-Kandidat."),
    "e063b97d": (
        "Ein einfaches Biomembranmodell zeigt eine Lipiddoppelschicht als selektive Zellgrenze und eingelagerte Proteine als mögliche Stoffwege; das Schema ist eine Vereinfachung der realen Membran.",
        "A simple biomembrane model shows a lipid bilayer as a selective cell boundary and embedded proteins as possible routes for solutes; the diagram simplifies a real membrane.",
        "Die lernende Person skizziert zu einem neuen Stoffdurchtritt eine Doppelschicht mit Kanal und Pumpe und erklärt, warum nicht jedes Teilchen denselben Weg durch die Grenze nimmt.",
        "For a new solute-crossing case, the learner sketches a bilayer with channel and pump and explains why not every particle takes the same route across the boundary.",
        "Wenn ein Kanal im Modell fehlt, erläutert sie die geänderte Selektivität, ohne daraus eine vollständige reale Membranarchitektur abzuleiten.",
        "If a channel is absent from the model, the learner explains altered selectivity without claiming the diagram fully represents a real membrane.",
        "Amtlicher HE-E.1-Punkt Biomembran/Modelle unterscheidet sich von Prozessfällen. Das wiederverwendete Transport-PNG zeigt Bilayer und Proteine, benennt aber keine Lipid-Polarität; diese wird nicht als abgebildet behauptet. DE/EN gleichwertig; AI-Kandidat."),
    "e76315b1": (
        "Diffusion beschreibt Nettobewegung entlang eines Konzentrationsgefälles; Osmose ist Wasserbewegung über eine geeignete selektive Membran, abhängig von den gelösten Stoffen auf beiden Seiten.",
        "Diffusion is net movement down a concentration gradient; osmosis is water movement across a suitable selective membrane, depending on solutes on both sides.",
        "Für neue Anfangskonzentrationen sagt die lernende Person die Richtung eines permeablen Farbstoffs und getrennt die Wasserbewegung in einem semipermeablen Beutel voraus und begründet beide.",
        "Given new starting concentrations, the learner predicts the direction of a permeable dye and separately the water movement in a semipermeable bag, justifying both.",
        "Nach Umkehr des gelösten-Stoffe-Gefälles korrigiert sie die Wasserprognose und prüft, ob das betrachtete Teilchen die Membran überhaupt passieren darf.",
        "After the solute gradient is reversed, the learner changes the water prediction and checks whether the particle at issue can cross the membrane at all.",
        "Amtlicher HE-E.1-Punkt Diffusion/Osmose wird als zusammenhängende passive Richtungsentscheidung geprüft; Experiment/Plasmolyse liegt auf 861fbc18. Das bestehende Bild trennt Teilchen- und Wasserweg; ATP-Feld ist nur Kontrast. DE/EN gleichwertig; AI-Kandidat."),
    "5c2ce7b1": (
        "Passiver Transport durch Kanäle oder Carrier folgt einem passenden Gefälle ohne zusätzliche ATP-Energie; aktiver Proteintransport kann Stoffe unter Energieeinsatz gegen ein Gefälle bewegen.",
        "Passive transport through channels or carriers follows a suitable gradient without added ATP energy; active protein transport can move solutes against a gradient using energy.",
        "Für zwei neue Ionentransportfälle mit Konzentrationen und ATP-Verfügbarkeit ordnet die lernende Person passiven Kanalweg oder aktive Pumpe zu und begründet die Wahl.",
        "For two new ion-transport cases with concentrations and ATP availability, the learner assigns passive channel flow or an active pump and explains the choice.",
        "Bei blockierter ATP-Bereitstellung revidiert sie nur die Pumpenprognose und lässt einen möglichen passiven Weg entlang des Gefälles bestehen.",
        "When ATP supply is blocked, the learner revises only the pump prediction while retaining a possible passive route down a gradient.",
        "Amtlicher HE-E.1-Punkt selektive Permeabilität/Carrier-/Tunneltransport ist jetzt eigenständig. Das Bild zeigt passiven Wasserkanal und aktive Pumpe; Diffusion/Osmose werden separat erklärt. DE/EN gleichwertig; AI-Kandidat."),
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
    print(f"Wrote {len(records)} E.1 AI candidate D records, current bundle {CAMPAIGN['bundleFingerprint']}")


if __name__ == "__main__":
    main()
