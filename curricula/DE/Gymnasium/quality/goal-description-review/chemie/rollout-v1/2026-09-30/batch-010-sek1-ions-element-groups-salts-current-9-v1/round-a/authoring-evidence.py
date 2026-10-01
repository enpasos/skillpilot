"""Independent, B-blind first-pass review of nine current Chemistry descriptions.

The individual decisions below were reached from this round's bound input and
neutral bundle plus the retained official HE G9 chemistry PDF (9.2, 10.1,
10.3). No Round-B results, chemistry A notes, or synthesis were inspected.
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

# decision, essential DE/EN, observable DE/EN, transfer DE/EN, rationale,
# optionally one complete replacement in both languages.
REVIEWS = {
    "72236f2c": {
        "decision": "keep",
        "e": (
            "Beim Rutherford-Streuversuch passieren die meisten Alphateilchen die Folie, wenige werden stark abgelenkt: Das stützt einen kleinen massereichen positiven Kern und eine ausgedehnte Hülle. Protonen und Neutronen gehören zum Kern, Elektronen zur Hülle; Neutronen werden nicht allein aus diesem Streubefund erschlossen.",
            "In Rutherford scattering most alpha particles pass through the foil and a few are deflected strongly: this supports a small massive positive nucleus and an extended surrounding region. Protons and neutrons belong to the nucleus, electrons to the surrounding region; neutrons are not inferred from this scattering result alone.",
            "Die lernende Person deutet ein neues Streubild, zeichnet ein begrenztes Kern-Hülle-Modell und ordnet Ladung und Ort von Proton, Neutron und Elektron zu, ohne den Modellbefund mit einem direkt gesehenen Atom zu verwechseln.",
            "The learner interprets a new scattering pattern, draws a bounded core-shell model and assigns charge and location to proton, neutron and electron without mistaking the model inference for a directly seen atom.",
            "Bei einem anderen Streumuster mit fast nur geraden Wegen und wenigen großen Ablenkungen erklärt sie, warum ein gleichmäßig verteiltes positives Atommodell schlechter passt, und markiert, was daraus über Neutronen offenbleibt.",
            "For another scattering pattern with mostly straight paths and few large deflections, the learner explains why a uniformly positive atom model fits less well and states what remains unknown about neutrons from that evidence.",
        ),
        "r": "HE-G9 10.1.1 nennt Rutherford-Streuversuch und Atombausteine im Kern-Hülle-Modell. Der aktuelle Text bindet Befund, Modell und Teilchen zu einer erklärbaren Kompetenz und ist DE/EN gleichwertig. Die positive Evidenz trennt ausdrücklich Streubefund von späterer Neutronenkenntnis; ein Bild ist kein Lernnachweis. Keine externe Länder-Mappingfreigabe wird behauptet.",
    },
    "950c73c6": {
        "decision": "revise",
        "e": (
            "Entgegengesetzt geladene Ionen werden in einem räumlichen Gitter durch elektrostatische Anziehung zusammengehalten; ein Ionengitter besteht nicht aus einzelnen NaCl-Molekülen. Bewegliche Ionen erklären Leitfähigkeit einer Schmelze oder Lösung, unbewegliche Ionen die fehlende Leitfähigkeit eines festen Kristalls.",
            "Oppositely charged ions are held together in a three-dimensional lattice by electrostatic attraction; an ionic lattice is not made of separate NaCl molecules. Mobile ions account for conduction in a melt or solution, while fixed ions explain why a solid crystal does not conduct.",
            "Die lernende Person deutet ein neues NaCl-Gittermodell, benennt die Anziehung zwischen Na⁺ und Cl⁻ und begründet eine vorgegebene Leitfähigkeitsbeobachtung im Feststoff und in der Schmelze auf Teilchenebene.",
            "The learner interprets a new NaCl lattice model, identifies attraction between Na⁺ and Cl⁻ and explains supplied conductivity observations for the solid and melt at particle level.",
            "An einem neuen Ionengitter aus anders geladenen Ionen erklärt sie erneut Zusammenhalt und unterscheidet Kristall von Schmelze, ohne aus einer Formel isolierte Molekülpaare abzuleiten oder eine genaue Schmelztemperatur zu erfinden.",
            "For a new ionic lattice with differently charged ions, the learner again explains cohesion and distinguishes crystal from melt without reading isolated molecule pairs from a formula or inventing an exact melting point.",
        ),
        "r": "Der Titel nennt Ionenbindung, die aktuelle Beschreibung aber nur Ionengitter und einen unbestimmten Struktur-Eigenschafts-Bezug. HE-G9 10.1.5 führt Gitter und Eigenschaften. Die lokale DE/EN-Korrektur macht den elektrischen Zusammenhalt und einen daraus begründbaren Bezug ausdrücklich, ohne Koordinationszahl oder andere Quellenteile aufzuzwingen.",
        "de": "Die lernende Person kann den Zusammenhalt entgegengesetzt geladener Ionen in einem Ionengitter wie Natriumchlorid erklären und daraus eine einfache Stoffeigenschaft begründen.",
        "en": "The learner can explain how oppositely charged ions hold together in an ionic lattice such as sodium chloride and use this to justify a simple property of the substance.",
    },
    "e0e201bd": {
        "decision": "split_review",
        "e": (
            "Alkalimetalle als elementare Metalle und ihre ionischen Verbindungen sind chemisch verschiedene Stoffe; Eigenschaften eines reaktiven Metalls werden nicht pauschal auf ein Alkalisalz übertragen. Gruppeneigenschaften, Verwendung und Verbindungstypen können getrennt verstanden werden.",
            "Alkali metals as elemental metals and their ionic compounds are chemically different substances; properties of a reactive metal must not be transferred wholesale to an alkali salt. Group properties, uses and types of compounds can be understood separately.",
            "Die lernende Person müsste an bereitgestellten Beispielen die Metalleigenschaften eines Alkali-Elements erklären und in einer getrennten Begründung Eigenschaften oder Verwendung einer benannten Verbindung auf ihren Stofftyp beziehen.",
            "The learner would need to explain metallic properties of one alkali element using supplied examples and separately relate a named compound's properties or use to its substance type.",
            "Bei einem neuen Paar aus elementarem Kalium und einer Kaliumverbindung unterscheidet sie metallische Reaktivität von Eigenschaften des Salzes, statt die Verwendung oder Gefahr des einen Stoffes auf den anderen zu kopieren.",
            "For a new pair of elemental potassium and a potassium compound, the learner distinguishes metallic reactivity from salt properties rather than copying the use or hazard of one substance to the other.",
        ),
        "r": "HE-G9 9.2.1 nennt Eigenschaften und Verwendung der Metalle und ihrer Verbindungen in einem Unterrichtspunkt; dies erzwingt kein einziges atomisches Lernziel. Die aktuelle Beschreibung bündelt Gruppeneigenschaften, Anwendungen und typische Verbindungen ohne gemeinsamen beobachtbaren Nachweis. Elementares Metall und Salz sind getrennt erwerbbare Begriffe; fachliche Aufteilung samt Quellen-/A-/M-/Bildbindung prüfen.",
    },
    "16a80de2": {
        "decision": "revise",
        "e": (
            "Alkalimetall plus Wasser und Alkalimetalloxid plus Wasser können beide Hydroxid und eine alkalische Lösung liefern; nur beim Metallweg entsteht dabei Wasserstoff. Beobachtete Gasbildung, Indikatorfarbe und Reaktionsgleichung sind verschiedene Evidenzebenen.",
            "Alkali metal plus water and alkali-metal oxide plus water can both produce hydroxide and an alkaline solution; only the metal route produces hydrogen in these reactions. Observed gas, indicator colour and a reaction equation are different evidence levels.",
            "Aus sicher bereitgestellten Beobachtungen zu Natrium/Wasser und Natriumoxid/Wasser vergleicht die lernende Person Produkte und begründet, warum beide Lösungen alkalisch sind, während nur der Metallfall Gas liefert.",
            "From safely supplied observations of sodium/water and sodium oxide/water, the learner compares the products and explains why both solutions are alkaline while only the metal case releases gas.",
            "Bei Kalium und Kaliumoxid in vorgegebenen Reaktionsdaten überträgt sie die Unterscheidung, prüft die Stoff- und Ladungserhaltung und verlangt keinen unbeaufsichtigten Wasser-Versuch mit reaktivem Metall.",
            "For potassium and potassium oxide in supplied reaction data, the learner transfers the distinction, checks conservation of matter and charge and does not require an unsupervised water experiment with a reactive metal.",
        ),
        "r": "HE-G9 9.2.1 nennt die beiden Systeme ausdrücklich. Der aktuelle Text lässt offen, ob zwei getrennte Reaktionslisten oder deren gemeinsamer/verschiedener Mechanismus gemeint ist; zudem steht 'Loesungen' statt kontextgeprüftem 'Lösungen'. Eine knappe DE/EN-Vergleichsformulierung erhält genau beide Systeme als eine prüfbare Beziehung. Reaktive Metalle werden nur mit bereitgestellten Daten behandelt.",
        "de": "Die lernende Person kann die Reaktionen eines Alkalimetalls und seines Oxids mit Wasser vergleichen und erklären, weshalb dabei alkalische Lösungen entstehen.",
        "en": "The learner can compare the reactions of an alkali metal and its oxide with water and explain why alkaline solutions form.",
    },
    "58486300": {
        "decision": "revise",
        "e": (
            "Elementare Halogene und ihre Verbindungen sind unterschiedliche Stoffe; eine Verwendung wird an einer benannten Stoffeigenschaft oder Wirkung begründet und nicht pauschal auf jedes Halogen oder Halogenid übertragen.",
            "Elemental halogens and their compounds are different substances; a use is justified by a named property or effect and is not transferred wholesale to every halogen or halide.",
            "Die lernende Person ordnet in einem vorgegebenen, sicher beschriebenen Beispiel den tatsächlich verwendeten Halogenstoff oder seine Verbindung zu und begründet einen passenden Anwendungsbezug mit einer belegten Eigenschaft.",
            "In a supplied, safely described example the learner identifies the halogen substance actually used or its compound and justifies a fitting application using an evidenced property.",
            "In einem zweiten Fall mit einem anderen Halogen oder Halogenid prüft sie erneut Stoffidentität und Verwendung und weist eine Verwechslung von elementarem Chlor mit Chlorid im Kochsalz zurück.",
            "In a second case with another halogen or halide, the learner again checks substance identity and use and rejects a confusion between elemental chlorine and chloride in table salt.",
        ),
        "r": "HE-G9 9.2.2 nennt Eigenschaften/Verwendung der Halogene und ihrer Verbindungen im Alltag. Das aktuelle 'einfache Alltagsbezüge fachlich beschreiben' macht die Beziehung kaum beobachtbar und kann Element/Verbindung vermischen. Der Ersatz verlangt eine begründete, stoffgenaue Zuordnung an ausgewählten Beispielen; keine gefährliche eigene Handhabung wird verlangt.",
        "de": "Die lernende Person kann an ausgewählten Halogenen und ihren Verbindungen eine Verwendung mit einer passenden Stoffeigenschaft begründen.",
        "en": "The learner can use selected halogens and their compounds to justify a use through a relevant property of the substance.",
    },
    "b5086548": {
        "decision": "keep",
        "e": (
            "Die Klassen Halogenide, Sulfate, Nitrate und Carbonate werden anhand der jeweils charakteristischen Anionen erkannt; Gegenion und Zahlenverhältnis in der Formel ändern den Klassennamen nicht beliebig.",
            "Halides, sulfates, nitrates and carbonates are identified by their characteristic anions; the counterion and formula ratio do not arbitrarily change the class name.",
            "Die lernende Person benennt bei neuen, vorgegebenen Salzformeln das relevante Anion und ordnet die Salze der passenden Klasse zu, ohne die Stoffeigenschaft allein aus dem Klassenwort zu behaupten.",
            "For new supplied salt formulas the learner names the relevant anion and assigns each salt to the correct class without claiming a substance property from the class label alone.",
            "Bei einem unbekannten Beispiel wie Ca(NO₃)₂ und KBr wendet sie die Anionenregel trotz anderer Kationen und Zahlenverhältnisse an und unterscheidet Nitrat von Halogenid.",
            "For unfamiliar examples such as Ca(NO₃)₂ and KBr, the learner applies the anion rule despite different cations and ratios, distinguishing nitrate from halide.",
        ),
        "r": "HE-G9 10.3.4 nennt genau diese ausgewählten Salzklassen; der aktuelle Text beansprucht nur ihre Einordnung nach Ionen und ist DE/EN gleichwertig. Die positive Leistung erfordert Identifikation des Anions in neuen Formeln, nicht bloß Wiederholung der vier Namen. Externe Mapping-Geltung ist hier nicht mitgeprüft.",
    },
    "d726e00e": {
        "decision": "keep",
        "e": (
            "Im vereinfachten Kalkkreislauf werden Calciumcarbonat durch Erhitzen zu Calciumoxid und CO₂, Calciumoxid mit Wasser zu Calciumhydroxid und dieses mit CO₂ wieder zu Carbonat umgesetzt; der Kreislauf ist eine Folge von Reaktionen, kein unveränderter Stoffumlauf.",
            "In the simplified lime cycle, heating converts calcium carbonate to calcium oxide and CO₂, calcium oxide reacts with water to form calcium hydroxide, and that hydroxide reacts with CO₂ to form carbonate again; the cycle is a sequence of reactions, not an unchanged substance circulating.",
            "Die lernende Person ordnet neue, bereitgestellte Kalkbrenn-, Lösch- und Erhärtungsdaten den drei Stoffumwandlungen zu und erklärt die Rückkehr zum Carbonat mit passenden Stoffnamen oder ausgeglichenen Gleichungen.",
            "The learner assigns new supplied calcination, slaking and hardening data to the three substance changes and explains the return to carbonate using correct substance names or balanced equations.",
            "Bei einem anderen Ausgangspunkt innerhalb des Kreislaufs, etwa Calciumoxid vor dem Löschen, sagt sie die nötigen Reaktionspartner und das nächste Produkt voraus und grenzt einen bloßen Phasenwechsel aus.",
            "Starting from another point in the cycle, such as calcium oxide before slaking, the learner predicts the needed reactant and next product and rules out a mere phase change.",
        ),
        "r": "HE-G9 10.3.4 nennt den Kreislauf des Kalks als Salzbildungsanwendung. Titel und DE/EN-Beschreibung sind als ein zusammenhängender Reaktionszyklus klar genug; Details gehören in P-v2. Keine Eigenarbeit mit heißem Kalk wird gefordert.",
    },
    "414489cb": {
        "decision": "revise",
        "e": (
            "Bei der Rauchgasentschwefelung wird Schwefeldioxid nicht unmittelbar zu Gips: In einer geeigneten Waschlösung wird Schwefel(IV) gebunden und durch Sauerstoff zu Sulfat oxidiert, das mit Calcium als Gips (Calciumsulfat-Dihydrat) anfällt. Ein Prozessschema ist Modell, kein direkter Beobachtungsbeweis für jeden Zwischenschritt.",
            "In flue-gas desulfurization, sulfur dioxide does not become gypsum in one direct step: a suitable scrubber binds sulfur(IV), oxygen oxidizes it to sulfate, and calcium yields gypsum (calcium sulfate dihydrate). A process diagram is a model, not direct observational proof of every intermediate.",
            "An einem neuen Waschprozess mit vorgegebenem SO₂-, Calcium- und Sauerstoffeintrag erläutert die lernende Person den Stoffweg bis zum Sulfat im Gips und benennt eine Grenze des vereinfachten Schemas.",
            "For a new scrubbing process with supplied SO₂, calcium and oxygen inputs, the learner explains the route to sulfate in gypsum and states a limit of the simplified diagram.",
            "Bei einem anderen Calciumreagenz, etwa Kalkmilch statt Kalkstein, hält sie Schwefelbindung und nötige Oxidation auseinander und behauptet ohne Prozessdaten weder vollständige Entfernung noch einen festen Ertrag.",
            "With another calcium reagent, such as lime slurry rather than limestone, the learner keeps sulfur capture and necessary oxidation distinct and does not claim complete removal or a fixed yield without process data.",
        ),
        "r": "HE-G9 10.3.4 nennt 'Gips aus der Rauchgaswäsche'. Der Titel fordert Deutung, die aktuelle Beschreibung nur eine vage 'chemische Anwendung von Sulfatbildung und Umwelttechnik'. Der Ersatz bindet SO₂, Calciumverbindung, Oxidation und Gips sachgerecht, ohne eine einstufige SO₂→Sulfat-Behauptung oder allgemeine Umweltbilanz zu erfinden.",
        "de": "Die lernende Person kann an einem vereinfachten Schema der Rauchgaswäsche erklären, wie Schwefeldioxid unter Beteiligung von Calciumverbindungen und Oxidation zu Gips führt.",
        "en": "The learner can use a simplified flue-gas desulfurization diagram to explain how sulfur dioxide leads to gypsum through calcium compounds and oxidation.",
    },
    "1f5ee84f": {
        "decision": "revise",
        "e": (
            "Ausgewählte mineralische Düngemittel liefern Nährstoffionen wie Nitrat, Ammonium oder Kalium; Wirkung und möglicher Schaden hängen von Stoff, Dosis, Boden und Auswaschung ab. Nicht jedes Düngemittel ist selbst ein einfaches Salz.",
            "Selected mineral fertilizers supply nutrient ions such as nitrate, ammonium or potassium; benefit and possible harm depend on substance, dose, soil and leaching. Not every fertilizer is itself a simple salt.",
            "Die lernende Person liest bei einem vorgegebenen mineralischen Düngemittel die relevanten Ionen aus Formel/Etikett, erklärt den Nährstoffnutzen und begründet ein bedingtes Risiko anhand von Menge und Standortdaten.",
            "For a supplied mineral fertilizer, the learner identifies relevant ions from formula or label, explains nutrient benefit and justifies a conditional risk using amount and site data.",
            "Bei einem anderen Düngemittel und anderen Niederschlags-/Bodenbedingungen prüft sie, ob dieselbe Nährstoff- und Auswaschungsaussage noch trägt, statt allen Düngern pauschal denselben Nutzen oder Schaden zuzuschreiben.",
            "For another fertilizer under changed rainfall and soil conditions, the learner checks whether the same nutrient and leaching claims still hold rather than assigning every fertilizer the same benefit or harm.",
        ),
        "r": "HE-G9 10.3.4 nennt Düngemittel, aber nicht alle als reine Salze. Die aktuelle Formulierung 'Düngemittel als Salz- und Ionenquellen' ist für organische/andere Produkte zu pauschal und 'Nutzen-Risiko-Bezüge beschreiben' zu unbestimmt. Der Ersatz begrenzt den Fall auf mineralische Düngemittel und bindet Nutzen/Risiko an konkreten Daten, ohne allgemeine Umwelturteile zu behaupten.",
        "de": "Die lernende Person kann ein ausgewähltes mineralisches Düngemittel als Quelle von Nährstoffionen einordnen und einen bedingten Nutzen-Risiko-Bezug begründen.",
        "en": "The learner can classify a selected mineral fertilizer as a source of nutrient ions and justify a conditional benefit-risk relationship.",
    },
}


def digest(path: Path) -> str:
    return "sha256:" + sha256(path.read_bytes()).hexdigest()


def main() -> None:
    assert {row["goal"]["goalId"][:8] for row in INPUT} == set(REVIEWS)
    now = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    run_id = CAMPAIGN["roundId"] + "-codex-independent-a"
    records = []
    for row in INPUT:
        goal = row["goal"]
        review = REVIEWS[goal["goalId"][:8]]
        essential_de, essential_en, observable_de, observable_en, transfer_de, transfer_en = review["e"]
        record = {
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
            "decision": review["decision"],
            "understandingEvidence": {
                "essentialUnderstandingDe": essential_de,
                "essentialUnderstandingEn": essential_en,
                "observablePerformanceDe": observable_de,
                "observablePerformanceEn": observable_en,
                "transferExpectationDe": transfer_de,
                "transferExpectationEn": transfer_en,
            },
            "rationale": review["r"],
            "evidenceProfileContract": "positive-understanding-evidence-v2",
            "evidenceProfileRecommendation": "create",
            "recordStatus": "candidate",
            "reviewAuthority": "ai_candidate",
        }
        if review["decision"] == "revise":
            record["proposedDescriptionDe"] = review["de"]
            record["proposedDescriptionEn"] = review["en"]
        records.append(record)
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
        "generationParametersFingerprint": "sha256:" + sha256(b"gpt-6-codex-session:manual-blind-subject-review:deployment-parameters-not-exposed").hexdigest(),
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
    print(f"Wrote {len(records)} independent B-blind Chemistry A records")


if __name__ == "__main__":
    main()
