"""Materialize the independent blind Round B review of the fixed B009 input."""

from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
INPUT = json.loads((HERE / "description-review-input.json").read_text())
CAMPAIGN = json.loads((HERE / "description-review-campaign.json").read_text())
BUNDLE = json.loads((HERE / "review-bundle-manifest.json").read_text())
RUN_ID = "chemie-b009-global-reactions-20260930-blind-b-run-001"
SCHEMA = "https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json"


def evidence(essential_de, essential_en, observable_de, observable_en, transfer_de, transfer_en):
    return dict(zip((
        "essentialUnderstandingDe", "essentialUnderstandingEn",
        "observablePerformanceDe", "observablePerformanceEn",
        "transferExpectationDe", "transferExpectationEn",
    ), (essential_de, essential_en, observable_de, observable_en, transfer_de, transfer_en)))


DECISIONS = {
    "8d4ef102": {
        "decision": "revise",
        "rationale": "Die Unterscheidung ist ein zusammenhängendes Ziel, doch ‚typische Reaktionsmerkmale‘ lässt Wärme, Farbe oder Blasen als sichere Reaktionsbeweise erscheinen; solche Signale können auch bei physikalischen Vorgängen auftreten. Die lokale Präzisierung benennt neue Stoffe als Kriterium und beobachtbare Veränderungen als Hinweise. Das aktuelle Bild zeigt genau den sachgerechten Eis/Magnesium-Vergleich, ist aber kein Lernnachweis. Externe Quellen-/Projektionsbindungen sind im B-Eingang nicht vollständig belegt.",
        "proposedDescriptionDe": "Die lernende Person kann chemische Reaktionen anhand der Bildung neuer Stoffe von physikalischen Veränderungen unterscheiden und typische Beobachtungen als mögliche Reaktionshinweise einordnen.",
        "proposedDescriptionEn": "The learner can distinguish chemical reactions from physical changes by the formation of new substances and interpret typical observations as possible signs of a reaction.",
        "understandingEvidence": evidence(
            "Bei einem Zustandswechsel bleibt der Stoff erhalten; bei einer chemischen Reaktion entstehen andere Stoffe. Wärme, Farbwechsel oder Gasblasen sind Hinweise, aber für sich kein sicherer Nachweis.",
            "In a change of state the substance remains the same; a chemical reaction forms different substances. Heat, colour change or bubbles are clues but alone do not prove a reaction.",
            "Die lernende Person vergleicht vorgegebene Vorher-/Nachher-Befunde, benennt das Stoffkriterium und begründet, welche Beobachtung noch mehr Prüfung braucht.",
            "The learner compares supplied before-and-after findings, identifies the substance criterion and explains which observation still needs further testing.",
            "Bei einem frischen Fall mit Blasen beim Erwärmen von Wasser und einem Fall mit Gasbildung durch Umsetzung entscheidet sie begründet trotz ähnlichem Signal unterschiedlich.",
            "In a fresh comparison of bubbles from heating water and gas formed by a reaction, the learner reaches different justified conclusions despite a similar sign.",
        ),
    },
    "bcf8b24b": {
        "decision": "revise",
        "rationale": "Die aktuelle Beschreibung lässt offen, anhand welchen fachlichen Modells die gekoppelte Oxidation und Reduktion bei Metall-/Nichtmetallreaktionen gedeutet werden. Die örtliche Präzisierung auf Elektronenabgabe und -aufnahme verhindert, dass ein bloßes ‚Sauerstoff dazu‘ im Magnesiumfall fälschlich als vollständige Reduktionsdeutung gilt. Keine Oxidationszahlen oder komplexe Redoxgleichungen werden verlangt. Das gebundene Mg/O2-Bild ist nur ein Modell und bleibt laut B-Eingang V-Kandidat; seine Ionenanordnung wird nicht freigegeben.",
        "proposedDescriptionDe": "Die lernende Person kann bei einfachen Reaktionen von Metallen mit Nichtmetallen Oxidation als Elektronenabgabe und Reduktion als gekoppelte Elektronenaufnahme deuten.",
        "proposedDescriptionEn": "The learner can interpret oxidation as electron loss and reduction as the coupled electron gain in simple reactions between metals and non-metals.",
        "understandingEvidence": evidence(
            "In einer einfachen Metall-Nichtmetall-Reaktion gibt ein Partner Elektronen ab und der andere nimmt sie auf; beide Teilvorgänge gehören zu derselben Redoxreaktion, Ladung und Atome bleiben erhalten.",
            "In a simple metal-nonmetal reaction one partner loses electrons and the other gains them; both processes belong to the same redox reaction, conserving charge and atoms.",
            "Die lernende Person markiert in einem gegebenen einfachen Teilchenmodell Elektronengeber und -empfänger und erklärt für beide Seiten die passenden Begriffe ohne eine Stoffklasse pauschal als immer oxidiert zu bezeichnen.",
            "The learner identifies electron donor and acceptor in a supplied simple particle model and explains both terms without claiming one substance class is always oxidised.",
            "Bei einem neuen Magnesium/Chlor-Modell statt des gezeigten Magnesium/Sauerstoff-Modells ordnet sie die gekoppelte Elektronenabgabe und -aufnahme samt Ionenladungen neu zu.",
            "In a new magnesium-chlorine model rather than the shown magnesium-oxygen model, the learner reassigns coupled electron loss and gain, including ion charges.",
        ),
    },
    "350a394f": {
        "decision": "keep",
        "rationale": "Die Beschreibung fordert eine erklärende, nicht praktische Löschentscheidung und bindet die Wirkung an das Unterbrechen einer Verbrennungsbedingung. Auswahl und Mechanismus gehören im einfachen Fall zusammen; sie sind kein verdecktes Laborziel. Konkrete Brandfälle müssen in einem späteren Profil als sichere Daten-/Lehrkraftszenarien begrenzt werden; aus dem V-Kandidatenbild folgt keine Handlungsfreigabe.",
        "understandingEvidence": evidence(
            "Eine Verbrennung braucht Brennstoff, Sauerstoff und ausreichende Temperatur. Ein passendes Löschmittel kann eine dieser Bedingungen unterbrechen; seine Eignung hängt vom Brandmaterial und Risiko ab.",
            "Combustion needs fuel, oxygen and sufficient temperature. A suitable extinguishing agent can interrupt one condition; its suitability depends on the burning material and risk.",
            "Die lernende Person erklärt anhand sicher vorgegebener Fälle, welcher Faktor durch Kühlen oder Abdecken entzogen wird, und verwirft ein für den Fall gefährliches Mittel mit Grund.",
            "Using safely supplied cases, the learner explains which factor cooling or smothering removes and rejects a hazardous agent for that case with a reason.",
            "Bei einem neuen Fettbrand statt einem festen Holzbrand überträgt sie die Bedingungslogik, erkennt das Risiko von Wasser und erklärt die Wirkung des Abdeckens, ohne selbst einen Brand zu bekämpfen.",
            "For a fresh cooking-oil fire instead of a solid wood fire, the learner transfers the condition logic, recognises the danger of water and explains smothering without being asked to fight a fire.",
        ),
    },
    "1286f2fe": {
        "decision": "keep",
        "rationale": "Exotherm/endotherm zu unterscheiden und ein Beispiel dem jeweiligen Energiefluss zuzuordnen ist ein einziges klassifizierendes Verständnisziel. Der Text ist bilingual deckungsgleich und lässt Aktivierungsenergie oder detaillierte Thermochemie offen. Das aktuelle Brausetabletten-Bild ist V-Kandidat und darf eine stoff- und systembezogene Prüfung des Endotherm-Beispiels nicht ersetzen.",
        "understandingEvidence": evidence(
            "Exotherme Reaktionen geben unter benannter Systemgrenze Energie an die Umgebung ab, endotherme nehmen Energie auf; die Richtung des Energieflusses ist von einer anfänglich nötigen Aktivierung zu trennen.",
            "Exothermic reactions release energy to the surroundings under a stated system boundary, whereas endothermic reactions absorb it; net energy flow differs from an initial activation requirement.",
            "Die lernende Person ordnet aus vorgegebenen Reaktions-/Umgebungsdaten zwei Vorgänge dem Energiefluss zu und erklärt, weshalb ein anfängliches Erhitzen eine spätere Wärmeabgabe nicht ausschließt.",
            "The learner uses supplied reaction-and-surroundings data to classify two processes by energy flow and explains why initial heating does not rule out later heat release.",
            "Bei einer neuen Reaktion mit dauerhaft zugeführter Energie gegenüber einer nach Zündung weiter Wärme liefernden Reaktion begründet sie die unterschiedliche Einordnung, statt nur Flamme oder Kältebild abzulesen.",
            "For a new reaction requiring continuing energy input versus one releasing heat after ignition, the learner explains the different classification rather than reading a flame or cold icon.",
        ),
    },
    "4dab7d52": {
        "decision": "revise",
        "rationale": "Der aktuelle Satz hängt an den fachlichen Vergleich zweier Kenngrößen zusätzlich die eigenständige Energieträgerbewertung; letztere ist unmittelbar als eigenes Ziel 9198b4cf vorhanden. Eine knappe Streichung dieses Nachsatzes und die Angabe gleicher Bezugsgrößen/Systemgrenzen halten den analytischen Vergleich atomar und verhindern unzulässige Mol-gegen-Energie- oder Produktions-gegen-Nutzungs-Vergleiche. Die gebundene Tabelle legt solche Grenzen nicht zuverlässig fest und ist nur V-Kandidat.",
        "proposedDescriptionDe": "Die lernende Person kann CO₂-Bilanzen und Reaktionswärmen verschiedener Brennstoffe auf einer vergleichbaren Bezugsgröße und innerhalb derselben Systemgrenze gegenüberstellen.",
        "proposedDescriptionEn": "The learner can compare CO₂ balances and heats of reaction for different fuels using a comparable reference basis and the same system boundary.",
        "understandingEvidence": evidence(
            "CO₂-Ausstoß und freigesetzte Reaktionswärme sind verschiedene Kenngrößen. Ein Brennstoffvergleich braucht für beide eine transparente Bezugsgröße und dieselbe Grenze, etwa nur die Verbrennung oder einen ausdrücklich erweiterten Lebensweg.",
            "CO₂ emissions and heat released by reaction are different measures. Comparing fuels requires a transparent reference basis for both and one shared boundary, such as combustion alone or an explicitly wider life cycle.",
            "Die lernende Person stellt vorgegebene Daten zu zwei Brennstoffen auf eine gemeinsame Menge oder nutzbare Energiemenge um, benennt die Grenze und erklärt, welche CO₂-/Wärmeaussage die Daten tatsächlich tragen.",
            "The learner places supplied data for two fuels on a common amount or useful-energy basis, states the boundary and explains which CO₂/heat comparison the data actually support.",
            "Für einen neuen Brennstoff mit CO₂-freier Nutzung, aber gegebenenfalls belasteter Herstellung trennt sie die zwei Grenzen und revidiert den Vergleich, ohne daraus schon ein Gesamturteil abzuleiten.",
            "For a new fuel with CO₂-free use but potentially emission-intensive production, the learner separates the two boundaries and revises the comparison without yet making an overall judgement.",
        ),
    },
    "0503c975": {
        "decision": "revise",
        "rationale": "‚Fossiler CO2-Anstieg‘ benennt nicht klar den atmosphärischen Bestand und lässt offen, weshalb ein Kreislauf trotz Erhaltung der Kohlenstoffatome einen Nettoanstieg haben kann. Die kurze Präzisierung nennt den Transfer aus langfristigen Speichern und unzureichend ausgleichende Senken. Der aktuelle Bildpfeil ist eine grobe Flussskizze, kein quantitativer Beweis; V ist separat offen.",
        "proposedDescriptionDe": "Die lernende Person kann erklären, wie die Verbrennung fossiler Brennstoffe langfristig gespeicherten Kohlenstoff als CO₂ in die Atmosphäre überführt und dort bei unzureichendem Ausgleich durch Senken den CO₂-Gehalt erhöht.",
        "proposedDescriptionEn": "The learner can explain how burning fossil fuels transfers long-stored carbon into the atmosphere as CO₂ and raises atmospheric CO₂ when sinks do not offset that input.",
        "understandingEvidence": evidence(
            "Kohlenstoffatome bleiben erhalten und wechseln zwischen Speichern. Fossile Verbrennung verschiebt Kohlenstoff aus einem langfristigen Speicher schnell in die Atmosphäre; liegt dieser Zufluss über den wirksamen Abflüssen, wächst der atmosphärische CO₂-Bestand.",
            "Carbon atoms are conserved and move among reservoirs. Burning fossil fuels moves carbon quickly from long-term storage to the atmosphere; if that input exceeds effective removals, atmospheric CO₂ stock rises.",
            "Die lernende Person zeichnet oder erläutert aus einer vorgegebenen Flussbilanz Quelle, Atmosphäre und Senken und begründet einen Nettoanstieg ohne Entstehung neuer Kohlenstoffatome.",
            "From a supplied flow balance, the learner diagrams or explains source, atmosphere and sinks and justifies a net rise without creating new carbon atoms.",
            "Bei einer neuen Bilanz mit erhöhtem fossilem Zufluss und zugleich erhöhtem, aber kleinerem Senkenfluss entscheidet sie anhand der Differenz über die Richtung der Bestandsänderung.",
            "With a fresh balance where fossil input and sink removal both rise but removal remains smaller, the learner uses their difference to decide the direction of stock change.",
        ),
    },
    "9198b4cf": {
        "decision": "keep",
        "rationale": "Die mehrkriterielle Bewertung ist eine einzelne begründete Urteilsleistung und folgt sinnvoll auf die separaten Vergleichsziele zu Reaktionswärme, CO₂ und Kreislauf. Der Text gibt die chemische, ökologische und Nutzungsperspektive an, ohne pauschal einen Energieträger zu bevorzugen. Eine Profilprüfung muss Daten, Grenzen, Gewichte und Werturteil trennen. Das Bild mit H₂/Methan/Kohle hat nur Kandidatenstatus und liefert keine gültige Gesamtbewertung.",
        "understandingEvidence": evidence(
            "Ein Energieträger hat chemische Eigenschaften, ökologische Wirkungen und nutzungsbezogene Vor- und Nachteile; ein Gesamturteil braucht passende Daten, Systemgrenze, offen gelegte Kriterien und deren Gewichtung.",
            "An energy carrier has chemical properties, environmental effects and practical trade-offs; an overall judgement needs relevant data, a system boundary, declared criteria and their weighting.",
            "Die lernende Person wertet einen vorgegebenen Datensatz zu zwei Energieträgern aus, trennt gesicherte Befunde von Annahmen und begründet ein bedingtes Urteil mit mindestens je einem chemischen, ökologischen und Nutzungsaspekt.",
            "The learner analyses supplied data on two energy carriers, separates findings from assumptions and justifies a conditional judgement using chemical, environmental and practical aspects.",
            "Für einen neuen Anwendungsfall mit anderer Speicherdauer oder anderer Herkunft der Energie passt sie Gewichtung und Urteil nachvollziehbar an statt eine universelle Rangfolge zu behaupten.",
            "For a fresh application with different storage duration or energy origin, the learner adjusts criteria weights and conclusion rather than asserting a universal ranking.",
        ),
    },
    "a530ee7d": {
        "decision": "keep",
        "rationale": "Der aktuelle Satz benennt die qualitative Energiebilanz beim Spalten und Bilden chemischer Bindungen als eine zusammenhängende Erklärung. Er fordert weder freie Atome als reale Zwischenstufe noch detaillierte Reaktionskinetik. Das vorhandene Bild zeigt freie Atome und bleibt V-Kandidat; daraus darf kein tatsächlicher Mechanismus als freigegeben abgeleitet werden.",
        "understandingEvidence": evidence(
            "Das Trennen chemischer Bindungen benötigt Energie und das Bilden neuer Bindungen setzt Energie frei; die qualitative Differenz beider Beiträge erklärt den Nettoenergiefluss einer Reaktion, nicht allein das Spalten oder Bilden.",
            "Breaking chemical bonds requires energy and forming new bonds releases energy; the qualitative difference between these contributions explains a reaction's net energy flow, not either step alone.",
            "Die lernende Person liest ein vorgegebenes Bindungsänderungsmodell, nennt die aufgewendeten und frei werdenden Beiträge und begründet daraus qualitativ exotherm oder endotherm ohne erfundene Zwischenprodukte.",
            "The learner reads a supplied bond-change model, identifies energy required and released and qualitatively explains exothermic or endothermic outcome without inventing intermediates.",
            "Bei einer neuen Reaktion, in der die Summe der Bindungsbildungsbeiträge kleiner als die zum Trennen benötigte Energie ist, kehrt sie die Energierichtung begründet um.",
            "For a new reaction in which bond formation releases less energy than bond breaking needs, the learner reverses the predicted net energy direction with a reason.",
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
        record = {
            "$schema": SCHEMA,
            "schemaVersion": 1,
            "recordId": f"chemie-b009-b-{index:02d}-{goal['goalId'][:8]}",
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
        }
        records.append(record)
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
    print(f"Materialized {len(records)} blind B009 records and run manifest")


if __name__ == "__main__":
    main()
