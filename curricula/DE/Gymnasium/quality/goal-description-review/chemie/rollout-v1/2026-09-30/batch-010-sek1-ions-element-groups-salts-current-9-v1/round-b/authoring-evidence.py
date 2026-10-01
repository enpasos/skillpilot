"""Materialize independent blind Round B decisions from the fixed B010 input only."""

from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
INPUT = json.loads((HERE / "description-review-input.json").read_text())
CAMPAIGN = json.loads((HERE / "description-review-campaign.json").read_text())
BUNDLE = json.loads((HERE / "review-bundle-manifest.json").read_text())
RUN_ID = "chemie-b010-ions-elements-salts-20260930-blind-b-run-001"
SCHEMA = "https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json"


def evidence(essential_de, essential_en, observable_de, observable_en, transfer_de, transfer_en):
    return dict(zip((
        "essentialUnderstandingDe", "essentialUnderstandingEn",
        "observablePerformanceDe", "observablePerformanceEn",
        "transferExpectationDe", "transferExpectationEn",
    ), (essential_de, essential_en, observable_de, observable_en, transfer_de, transfer_en)))


DECISIONS = {
    "72236f2c": {
        "decision": "split_review",
        "rationale": "Das Rutherford-Streuexperiment als Befund für einen kleinen dichten Atomkern zu deuten ist eine andere überprüfbare Leistung als Protonen, Neutronen und Elektronen im späteren Kern-Hülle-Modell einzuordnen. Insbesondere Neutronen folgen nicht aus dem Rutherford-Befund. Eine bloße Wortkorrektur würde die beiden fachlichen Nachweise verdecken; das Kernmodell und die Elementarteilchen benötigen einen gezielten Atomaritätsentscheid. Das im B-Eingang als approved gebundene Bild ersetzt weder die Streudatendeutung noch die Teilchenzuordnung; externe Quellen-/Projektionsbindungen werden nicht behauptet.",
        "understandingEvidence": evidence(
            "Seltene starke Ablenkung von Alphateilchen stützt einen kleinen positiv geladenen Kern in überwiegend leerem Atomraum. Protonen und Neutronen gehören zum Kern, Elektronen zur Hülle; das Neutron ist kein direkter Rutherford-Befund.",
            "Rare large deflections of alpha particles support a small positively charged nucleus in an atom that is mostly empty space. Protons and neutrons belong to the nucleus and electrons to the shell; the neutron is not a direct Rutherford observation.",
            "Die lernende Person erklärt vorgegebene Streubefunde als Modellargument und ordnet in einer getrennten Atomskizze Proton, Neutron und Elektron samt Ladung und Ort zu, ohne die zweite Aussage aus dem Experiment vorzutäuschen.",
            "The learner explains supplied scattering findings as evidence for a model and separately places proton, neutron and electron with charge and location in an atom sketch without claiming the latter all follow from scattering.",
            "Bei einer neuen Streuverteilung entscheidet sie, welches Kern-Hülle-Merkmal daraus folgt, und kennzeichnet bei einem anderen Atommodell, welche Teilchenangaben zusätzliches Modellwissen benötigen.",
            "With a fresh scattering distribution, the learner decides which core-shell feature follows and marks which particle facts in another atom model require additional knowledge.",
        ),
    },
    "950c73c6": {
        "decision": "revise",
        "rationale": "Der Titel nennt Ionenbindung, doch die aktuelle Beschreibung nennt nur Ionengitter und einen unspezifizierten Struktur-Eigenschafts-Bezug. Die örtliche Präzisierung macht die elektrostatische Anziehung entgegengesetzt geladener Ionen als bindendes Prinzip explizit und hält die Eigenschaftsableitung im selben Verständnisziel. Die Ionenbildung bleibt beim externen Voraussetzungziel; das B-Paket enthält kein aktuelles Lernzielbild.",
        "proposedDescriptionDe": "Die lernende Person kann Ionengitter wie Natriumchlorid durch die regelmäßige Anordnung und elektrostatische Anziehung entgegengesetzt geladener Ionen erklären und daraus einfache Stoffeigenschaften ableiten.",
        "proposedDescriptionEn": "The learner can explain ionic lattices such as sodium chloride through the regular arrangement and electrostatic attraction of oppositely charged ions and derive simple material properties from this structure.",
        "understandingEvidence": evidence(
            "In einem Ionenkristall hält elektrostatische Anziehung Kationen und Anionen in einem regelmäßigen Gitter zusammen; bewegliche Ionen erklären Leitfähigkeit einer Schmelze, während Ionen im festen Gitter nicht frei wandern.",
            "In an ionic crystal, electrostatic attraction holds cations and anions in a regular lattice; mobile ions explain conductivity in the melt, whereas ions in the solid lattice cannot move freely.",
            "Die lernende Person deutet ein NaCl-Gittermodell als Anordnung vieler Ionen statt einzelner NaCl-Moleküle und leitet aus der Beweglichkeit der Ionen einen Eigenschaftsunterschied zwischen fest und geschmolzen ab.",
            "The learner interprets a sodium-chloride lattice as many ions rather than individual NaCl molecules and derives a property difference between solid and molten states from ion mobility.",
            "Für ein neues Kaliumbromid-Gitter erklärt sie mit denselben Ladungs- und Beweglichkeitsprinzipien, warum der feste Kristall und seine Schmelze elektrisch verschieden reagieren.",
            "For a fresh potassium-bromide lattice, the learner uses the same charge and mobility principles to explain why the solid crystal and its melt differ electrically.",
        ),
    },
    "e0e201bd": {
        "decision": "split_review",
        "rationale": "Elementare Alkalimetalle nach Eigenschaften und Verwendung zu charakterisieren ist unabhängig davon prüfbar, typische Alkalimetallverbindungen als chemisch andere Stoffe zu beschreiben. Die aktuelle Formulierung bündelt beide Stoffebenen unter offenem ‚Eigenschaften, Verwendung und typische Verbindungen‘, ohne einen einzigen prüfbaren Zusammenhang festzulegen. Ein Beschreibungsnachsatz würde die getrennten Leistungen nur kaschieren; das vorhandene Bild hat laut B-Eingang formalen approved-Status, aber keine Lernenden-Evidenz.",
        "understandingEvidence": evidence(
            "Alkalimetalle sind elementare Metalle mit ähnlichem Außenelektronenmuster und hoher Reaktivität; Verbindungen wie Natriumchlorid bestehen dagegen aus Ionen und besitzen andere Stoffeigenschaften. Verwendung ist dem tatsächlichen Stoff zuzuordnen.",
            "Alkali metals are elemental metals with a similar outer-electron pattern and high reactivity; compounds such as sodium chloride instead consist of ions and have different material properties. A use must be assigned to the actual substance.",
            "Die lernende Person beschreibt aus sicheren Stoffdaten ein ausgewähltes Alkalimetall und eine seiner Verbindungen getrennt und begründet, weshalb eine Verwendung des Salzes nicht als Verwendung des reaktiven Metalls ausgegeben werden darf.",
            "From safe supplied material data, the learner describes a selected alkali metal and one of its compounds separately and explains why a use of the salt must not be attributed to the reactive metal.",
            "Bei Daten zu Kalium und Kaliumchlorid unterscheidet sie elementaren Stoff und Verbindung erneut und ordnet einen konkreten Einsatz dem passenden Stoff zu, ohne die Reaktion praktisch auszuführen.",
            "With fresh data on potassium and potassium chloride, the learner again distinguishes element from compound and assigns a concrete use to the correct substance without performing a reaction.",
        ),
    },
    "16a80de2": {
        "decision": "revise",
        "rationale": "Die zwei Reaktionsklassen können als ein vergleichendes Verständnisziel zusammenbleiben, wenn ihre unterschiedlichen Produkte und die gemeinsame alkalische Lösung erkennbar verknüpft werden. Die aktuelle Aufzählung ‚beschreiben sowie beschreiben und deuten‘ lässt diese prüfbare Beziehung offen. Die vorgeschlagene knappe Vergleichsformulierung bleibt bei einfachen Alkalimetall- und Oxidreaktionen; gefährliche Metall-Wasser-Versuche werden nur mit Lehrkraftdaten oder Modellen behandelt. Das B-Bild ist review_candidate, keine V-Freigabe.",
        "proposedDescriptionDe": "Die lernende Person kann Reaktionen von Alkalimetallen und ihren Oxiden mit Wasser anhand der unterschiedlichen Produkte vergleichen und die Bildung alkalischer Lösungen erklären.",
        "proposedDescriptionEn": "The learner can compare reactions of alkali metals and their oxides with water by their different products and explain the formation of alkaline solutions.",
        "understandingEvidence": evidence(
            "Ein Alkalimetall bildet mit Wasser ein Hydroxid und Wasserstoff; sein Oxid bildet mit Wasser ein Hydroxid ohne Wasserstoff. Gelöste Hydroxid-Ionen erklären die alkalische Lösung, nicht bloß das Wort ‚Wasserreaktion‘.",
            "An alkali metal reacts with water to form a hydroxide and hydrogen; its oxide forms a hydroxide without hydrogen. Dissolved hydroxide ions explain the alkaline solution, not merely the label 'water reaction'.",
            "Die lernende Person vergleicht gegebene Lehrkraftbeobachtungen oder Reaktionsmodelle zu Natrium und Natriumoxid und ordnet Gasentwicklung und alkalischen Indikatorbefund den passenden Produkten zu.",
            "The learner compares supplied teacher observations or reaction models for sodium and sodium oxide and connects gas production and an alkaline indicator result to the respective products.",
            "Bei neuen sicheren Daten zu Lithium und Lithiumoxid sagt sie voraus, welcher Ansatz Wasserstoff liefern kann und warum beide Lösungen alkalisch werden, ohne einen Versuch selbst durchzuführen.",
            "With fresh safe data on lithium and lithium oxide, the learner predicts which setup can produce hydrogen and why both solutions become alkaline without performing the experiment.",
        ),
    },
    "58486300": {
        "decision": "revise",
        "rationale": "‚Verwendung der Halogene‘ plus ‚Alltagsbezüge‘ lässt elementare Halogene und alltäglich genutzte Halogenverbindungen ineinanderlaufen. Diese Stoffe unterscheiden sich in Reaktivität und Sicherheit grundlegend. Die lokale Formulierung verlangt an ausgewählten Beispielen eine stoffrichtige Zuordnung, ohne eine vollständige Elementgruppe, Gefahrstoffhandhabung oder Umweltbewertung zu fordern. Das B-Bild ist nur review_candidate.",
        "proposedDescriptionDe": "Die lernende Person kann Stoffeigenschaften ausgewählter Halogene beschreiben und Anwendungen der elementaren Stoffe von denen ihrer Verbindungen fachlich unterscheiden.",
        "proposedDescriptionEn": "The learner can describe properties of selected halogens and distinguish uses of the elemental substances from uses of their compounds.",
        "understandingEvidence": evidence(
            "Halogene als elementare Nichtmetalle sind andere Stoffe als Halogenid-Ionen in Verbindungen; die Stoffeigenschaften und Risiken einer Anwendung dürfen nicht vom Element auf ein Salz übertragen werden.",
            "Elemental halogens are different substances from halide ions in compounds; a use, property or hazard of an element cannot simply be transferred to a salt.",
            "Die lernende Person vergleicht vorgegebene Daten zu Chlor als elementarem Stoff und Natriumchlorid als Verbindung, beschreibt je ein zutreffendes Merkmal und ordnet genannte Anwendungen dem richtigen Stoff zu.",
            "The learner compares supplied data for elemental chlorine and sodium chloride, describes one accurate property of each and assigns stated uses to the right substance.",
            "Bei einem frischen Kontrast zwischen elementarem Iod und einem Iodidsalz prüft sie eine Alltagsaussage auf Stoffverwechslung und begründet die Zuordnung ohne Kontakt zu Gefahrstoffen.",
            "In a fresh contrast between elemental iodine and an iodide salt, the learner checks an everyday claim for substance confusion and justifies the assignment without handling hazardous materials.",
        ),
    },
    "b5086548": {
        "decision": "keep",
        "rationale": "Vier genannte Salzklassen werden durch dieselbe eine Zuordnungsregel nach dem Anion unterschieden; das ist eine atomare Klassifikationsleistung und die aktuelle deutsche/englische Beschreibung ist präzise. Eine neue Stoffprobe muss anhand ihrer Ionen eingeordnet werden, nicht nach der bloßen Endung eines Namens. Das Bild hat im B-Eingang review_candidate-Status und begründet keine Freigabe.",
        "understandingEvidence": evidence(
            "Halogenide, Sulfate, Nitrate und Carbonate sind Salze mit unterschiedlichen charakteristischen Anionen; das begleitende Kation allein entscheidet nicht über die Salzklasse, und die Gesamtformel muss ladungsneutral sein.",
            "Halides, sulfates, nitrates and carbonates are salts with different characteristic anions; the accompanying cation alone does not determine the salt class, and the whole formula is charge-neutral.",
            "Die lernende Person liest gegebene Formeln und Ionenlisten, erkennt etwa Cl⁻, SO₄²⁻, NO₃⁻ oder CO₃²⁻ und begründet für jede Probe die passende Klasse und Ladungsbilanz.",
            "The learner reads supplied formulas and ion lists, identifies for example Cl⁻, SO₄²⁻, NO₃⁻ or CO₃²⁻, and justifies the class and charge balance of each sample.",
            "Bei neuen Kaliumbromid- und Calciumcarbonat-Daten ordnet sie trotz anderer Kationen oder Zahlenverhältnisse nach dem jeweiligen Anion ein.",
            "Given fresh potassium-bromide and calcium-carbonate data, the learner classifies by the relevant anion despite changed cations or ion ratios.",
        ),
    },
    "d726e00e": {
        "decision": "keep",
        "rationale": "Die aktuelle Formulierung benennt einen zusammenhängenden Kalkkreislauf und dessen Carbonatbezug; Brennen, Löschen und Abbinden sind aufeinander bezogene Schritte derselben Erklärung, keine beliebige Liste. Die bilinguale Beschreibung ist verständlich genug, während Reaktionsformeln und Modellgrenzen in positive Evidenz gehören. Das aktuelle Bild ist laut B-Eingang V-Kandidat, nicht freigegeben.",
        "understandingEvidence": evidence(
            "Beim Kalkbrennen wird Calciumcarbonat zu Calciumoxid und CO₂, beim Löschen entsteht aus Oxid und Wasser Calciumhydroxid, beim Abbinden entsteht unter CO₂-Aufnahme wieder Calciumcarbonat. Calcium bleibt erhalten; der Kreis ist eine Stoffumwandlungsfolge.",
            "Heating limestone converts calcium carbonate to calcium oxide and CO₂, slaking converts the oxide with water to calcium hydroxide, and setting takes up CO₂ to form calcium carbonate again. Calcium is conserved; the cycle is a sequence of substance changes.",
            "Die lernende Person ordnet gegebene Stoffkarten oder Formeln den drei Schritten zu, nennt Edukte und Produkte und erklärt, wo CO₂ abgegeben bzw. aufgenommen wird.",
            "The learner assigns supplied substances or formulas to the three steps, states reactants and products and explains where CO₂ is released and taken up.",
            "Bei einem neuen Kalkmörtel-Fall ohne Luftzutritt sagt sie begründet voraus, welcher Schritt gehemmt ist und welches Carbonatprodukt dann nicht wie erwartet entsteht.",
            "In a fresh lime-mortar case without air access, the learner predicts which step is impeded and why the expected carbonate product will not form in the same way.",
        ),
    },
    "414489cb": {
        "decision": "revise",
        "rationale": "‚Gips ... als Anwendungsfall von Sulfatbildung und Umwelttechnik beschreiben‘ ist eine Einordnung ohne klaren chemischen Vorgang; der Titel fordert Deuten. Die lokale Präzisierung benennt Schwefeldioxid aus dem Rauchgas, kalkhaltiges Waschmittel und Gips als gebundenen Sulfatstoff, ohne eine technische Anlagensteuerung oder vollständige Schadstoffbilanz einzuführen. Das B-Bild ist review_candidate; weder dessen Pfeile noch eine allgemeine Umweltaussage werden freigegeben.",
        "proposedDescriptionDe": "Die lernende Person kann erklären, wie Schwefeldioxid bei kalkhaltiger Rauchgaswäsche in Gips als Calciumsulfat-Verbindung überführt und so aus dem Rauchgas gebunden wird.",
        "proposedDescriptionEn": "The learner can explain how sulfur dioxide is converted into gypsum, a calcium sulfate compound, during lime-based flue-gas scrubbing and is thereby captured from the flue gas.",
        "understandingEvidence": evidence(
            "Schwefeldioxid aus dem Rauchgas kann im kalkhaltigen Waschprozess unter Oxidation als Sulfat gebunden werden; mit Calcium entsteht Gips. Der Schwefel wird in einem anderen Stoff aufgefangen, nicht vernichtet, und die Anlage entfernt damit nicht automatisch alle Schadstoffe.",
            "Sulfur dioxide in flue gas can be captured as sulfate during lime-based scrubbing with oxidation; calcium then forms gypsum. Sulfur is retained in another substance, not destroyed, and the process does not automatically remove every pollutant.",
            "Die lernende Person liest ein vereinfachtes Verfahrensschema mit SO₂-Zulauf, kalkhaltigem Waschschritt, Sauerstoff und Gipsprodukt und verfolgt Schwefel und Calcium stoffrichtig durch die angegebenen Schritte.",
            "The learner reads a simplified process diagram with SO₂ input, lime-based wash, oxygen and gypsum product and traces sulfur and calcium through the given steps correctly.",
            "Für neue Vorher-/Nachher-Daten mit geringerem SO₂ im Abgas, aber Sulfat im Feststoff erklärt sie, wo der Schwefel verblieben ist, ohne daraus eine unbelegte Aussage über CO₂ oder alle Luftschadstoffe zu machen.",
            "For fresh before-and-after data with less SO₂ in the exhaust but sulfate in the solid, the learner explains where the sulfur went without making an unsupported claim about CO₂ or all air pollutants.",
        ),
    },
    "1f5ee84f": {
        "decision": "revise",
        "rationale": "Chemische Ioneneinordnung und Nutzen-Risiko-Bezug können eine einzige datenbezogene Anwendungsleistung bilden, wenn die zweite Aussage aus Nährstoffbedarf und möglicher Auswaschung begründet statt pauschal angehängt wird. Die aktuelle offene ‚Düngemittel ... und einfache Nutzen-Risiko-Bezüge‘-Formulierung lässt diese Bindung unklar und kann zu blanket environmental claims führen. Die lokale Präzisierung verlangt nur ausgewählte Salze und vorgegebene Anwendungsdaten; das Bild ist V-Kandidat.",
        "proposedDescriptionDe": "Die lernende Person kann ausgewählte Düngesalze anhand ihrer Nährstoff-Ionen einordnen und mit vorgegebenen Angaben zu Bedarf und Auswaschung einen einfachen Nutzen-Risiko-Bezug begründen.",
        "proposedDescriptionEn": "The learner can classify selected fertilizer salts by their nutrient ions and use supplied information on crop demand and leaching to justify a simple benefit-risk relationship.",
        "understandingEvidence": evidence(
            "Düngesalze liefern Nährstoff-Ionen wie Nitrat, Ammonium oder Kalium; ein Nutzen hängt vom Pflanzenbedarf ab, während überschüssige lösliche Ionen unter passenden Bedingungen ausgewaschen werden können. Eine Stoffformel allein beweist weder Nutzen noch Schaden.",
            "Fertilizer salts supply nutrient ions such as nitrate, ammonium or potassium; benefit depends on plant demand, while excess soluble ions can be leached under relevant conditions. A chemical formula alone proves neither benefit nor harm.",
            "Die lernende Person identifiziert in einer gegebenen Düngemittelangabe die Nährstoff-Ionen und begründet mit vorgegebenem Bedarf und Boden-/Wasserdaten einen begrenzten Nutzen und ein mögliches Auswaschungsrisiko.",
            "From a supplied fertilizer label, the learner identifies nutrient ions and uses given crop-demand and soil/water data to justify a bounded benefit and a possible leaching risk.",
            "Bei einem neuen Vergleich mit gleichem Salz, aber anderem Pflanzenbedarf und stärkerem Regen passt sie die Abwägung an, statt das Düngesalz pauschal als gut oder schlecht einzustufen.",
            "In a fresh comparison with the same salt but different crop demand and heavier rain, the learner adjusts the assessment rather than declaring the fertilizer universally good or bad.",
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
            "recordId": f"chemie-b010-b-{index:02d}-{goal['goalId'][:8]}",
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
    print(f"Materialized {len(records)} blind B010 records and run manifest")


if __name__ == "__main__":
    main()
