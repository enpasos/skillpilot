"""Fresh P-v2 candidate cases for three substantively corrected E goals."""

from datetime import datetime, timezone
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
CANONICAL = ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json"
REVIEW_ID = "biologie-m7-ephase-post-b-three-current-20260930-v3"


def profile(archetype, expectations, axes, cases):
    return {
        "archetype": archetype,
        "expectations": [{
            "id": eid,
            "essentialUnderstandingDe": ede,
            "essentialUnderstandingEn": een,
            "observablePerformanceDe": ode,
            "observablePerformanceEn": oen,
        } for eid, ede, een, ode, oen in expectations],
        "coverageExpectations": {
            "requiredExpectationIds": [row[0] for row in expectations],
            "alternativeExpectationGroups": [],
            "minimumIndependentDemonstrations": 2,
            "freshVariationRequired": True,
            "independentTransferRequired": True,
        },
        "variationAxes": [{"id": key, "textDe": de, "textEn": en} for key, de, en in axes],
        "applicationCaseBriefs": [{
            "id": key,
            "taskDemandDe": task_de,
            "taskDemandEn": task_en,
            "expectedPerformanceDe": expected_de,
            "expectedPerformanceEn": expected_en,
            "understandingFocusDe": focus_de,
            "understandingFocusEn": focus_en,
        } for key, task_de, task_en, expected_de, expected_en, focus_de, focus_en in cases],
    }


PROFILES = {
    "5c2ce7b1": profile("concept", [
        ("passive-protein-route", "Kanäle oder Carrier können passende Stoffe passiv entlang eines wirksamen Gefälles transportieren; der Kanal wird dabei nicht durch ATP zur Pumpe.", "Channels or carriers can move suitable substances passively down an effective gradient; ATP does not turn a simple channel into a pump.", "Die lernende Person ordnet in einem neuen Membranschema Kanal- oder Carrierweg als passiv ein und begründet dies mit Richtung und fehlendem Energieeinsatz.", "In a new membrane diagram, the learner classifies a channel or carrier route as passive and explains the direction and lack of energy input."),
        ("active-protein-route", "Aktiver Transport durch ein energiegekoppeltes Transportprotein kann Stoffe gegen ein geeignetes Gefälle bewegen; Proteinart und Energiequelle müssen zum Fall passen.", "Active transport by an energy-coupled transport protein can move substances against a suitable gradient; protein type and energy source must fit the case.", "Die lernende Person erkennt einen Pumpenfall gegen das Gefälle, nennt den nötigen Energieeinsatz und grenzt ihn von einem offenen Kanal ab.", "The learner identifies a pump case against the gradient, names the needed energy input and distinguishes it from an open channel."),
    ], [
        ("gradient", "Die Konzentrationsseiten im zweiten Fall vertauschen.", "Reverse the concentration sides in the second case."),
        ("energy", "ATP-Verfügbarkeit oder Kopplungsangabe verändern.", "Change ATP availability or coupling information."),
    ], [
        ("ion-channel-and-pump", "Zwei neue Ionenbilder zeigen links Durchtritt durch einen offenen Kanal von hoher zu niedriger Konzentration und rechts eine ATP-gekoppelte Pumpe in Gegenrichtung. Erkläre beide Wege.", "Two new ion diagrams show passage through an open channel from high to low concentration and an ATP-coupled pump in the opposite direction. Explain both routes.", "Links wird passiver Kanaltransport, rechts aktiver energiegekoppelter Proteintransport begründet; ein Kanal wird nicht als aktive Pumpe bezeichnet.", "The left route is justified as passive channel transport and the right as active energy-coupled protein transport; the channel is not called an active pump.", "Beide Mechanismen werden getrennt an Gefälle und Energie gebunden.", "Each mechanism is tied separately to gradient and energy."),
        ("pump-energy-stop", "Eine Wurzelzelle hat einen Transporter für Ionen gegen ein Konzentrationsgefälle; ATP-Bereitstellung fällt aus, ein passiver Kanal bleibt offen. Welche Aussagen ändern sich?", "A root cell has a transporter for ions against a concentration gradient; ATP supply stops while a passive channel remains open. Which predictions change?", "Der Transport gegen das Gefälle durch die Pumpe wird nicht weiter vorausgesetzt; ein passiver Ionenweg entlang eines geeigneten Gefälles bleibt möglich, ohne dessen Richtung blind zu behaupten.", "Movement against the gradient by the pump is no longer assumed; a passive ion route down a suitable gradient remains possible without guessing its direction.", "Energieausfall betrifft den gekoppelten Weg, nicht pauschal jeden Kanal.", "Loss of energy affects the coupled route, not every channel as such."),
    ]),
    "1984fd66": profile("data", [
        ("controlled-concentration", "Bei gleichem Reaktionsvolumen und fester Enzymmenge ist steigende Substratkonzentration die veränderte Größe; eine bloße Gesamtmenge bei wechselndem Volumen ist nicht dasselbe.", "With equal reaction volume and fixed enzyme amount, substrate concentration is the varied factor; total amount at changing volume is not equivalent.", "Die lernende Person liest aus einer neuen kontrollierten Reihe Konzentration und Aktivität ab und benennt die konstanten Bedingungen.", "The learner reads concentration and activity from a new controlled series and names the fixed conditions."),
        ("saturation", "Mit zunehmender Besetzung aktiver Zentren flacht die Aktivitätskurve bei fester Enzymmenge ab; das Plateau ist keine Aussage, dass alles Substrat verbraucht wurde.", "As active sites become occupied, the activity curve flattens at fixed enzyme amount; the plateau does not mean all substrate was consumed.", "Die lernende Person erklärt Anstieg und Plateau anhand der Zentren und vermeidet erfundene absolute Messwerte.", "The learner explains the rise and plateau through active sites without inventing absolute measurements."),
    ], [
        ("concentration-range", "Niedrige und hohe Substratkonzentrationen in neuer Messreihe vergleichen.", "Compare low and high substrate concentrations in a new series."),
        ("enzyme-amount", "Eine zweite Versuchsreihe mit mehr Enzym als Kontrollgrenze prüfen.", "Use a second series with more enzyme as a control-boundary test."),
    ], [
        ("fixed-volume-series", "Eine Tabelle gibt Aktivität bei vier Substratkonzentrationen an; Volumen und Enzymmenge sind gleich. Beschreibe den Verlauf und erkläre das Plateau.", "A table gives activity at four substrate concentrations; volume and enzyme amount are equal. Describe the trend and explain the plateau.", "Die lernende Person nennt die Konzentration als variierte Größe, beschreibt zunächst mehr Aktivität und später geringe zusätzliche Zunahme und verknüpft dies mit ausgelasteten aktiven Zentren.", "The learner names concentration as the varied factor, describes an initial rise and later small additional increase, and links this to occupied active sites.", "Kontrollierte Daten tragen die begrenzte Sättigungserklärung.", "Controlled data support the bounded saturation explanation."),
        ("more-enzyme", "Ein zweiter Versuch zeigt gleiche Volumina und Substratkonzentrationen, aber doppelte Enzymmenge. Darf die alte Plateauhöhe ohne Messung übernommen werden?", "A second trial uses the same volumes and substrate concentrations but twice the enzyme amount. Can the old plateau height be carried over without measurement?", "Die lernende Person verneint die unveränderte Plateauannahme, da mehr aktive Zentren verfügbar sein können; sie behauptet ohne Daten keine exakte neue Höhe.", "The learner rejects an unchanged plateau because more active sites may be available; no exact new height is claimed without data.", "Die feste Enzymmenge ist Teil der Geltungsbedingung.", "Fixed enzyme amount is part of the claim's conditions."),
    ]),
    "01819a6c": profile("concept", [
        ("competitive-example", "Ein kompetitiver Hemmstoff konkurriert mit einem passenden Substrat am aktiven Zentrum eines Enzyms.", "A competitive inhibitor competes with a suitable substrate at the enzyme's active site.", "Die lernende Person erläutert an einem eigenen geeigneten Beispiel Bindungsort und Folge für die Substratbindung.", "The learner explains binding site and effect on substrate binding in one suitable example of their own."),
        ("allosteric-example", "Ein allosterischer Hemmstoff bindet an anderer Stelle und verändert die katalytische Wirkung oder das aktive Zentrum; er ist kein Substrat-Platzhalter im Zentrum.", "An allosteric inhibitor binds elsewhere and changes catalytic action or the active site; it is not a substrate substitute at the active site.", "Die lernende Person erläutert ein zweites geeignetes Beispiel mit anderer Bindungsstelle und nachvollziehbarer Wirkungsfolge.", "The learner explains a second suitable example with a different binding site and causal effect."),
    ], [
        ("binding-site", "Aktives Zentrum und entfernte Bindungsstelle in neuen Skizzen variieren.", "Vary active and distant binding sites in new diagrams."),
        ("effect", "Substratbindung und Enzymform getrennt beobachten.", "Observe substrate binding and enzyme shape separately."),
    ], [
        ("competitive-diagram", "Ein neues Enzymschema zeigt einen Hemmstoff am aktiven Zentrum und ein passendes Substrat außerhalb. Erkläre das kompetitive Beispiel und seine unmittelbare Folge.", "A new enzyme diagram shows an inhibitor at the active site and a fitting substrate outside. Explain the competitive example and its immediate effect.", "Die lernende Person benennt Konkurrenz am aktiven Zentrum und die dadurch verhinderte gleichzeitige Substratbindung; eine klinische Wirksamkeit wird nicht erfunden.", "The learner names competition at the active site and the resulting prevention of simultaneous substrate binding; no clinical efficacy is invented.", "Bindungsort und Wirkung sind an ein konkretes Beispiel gebunden.", "Binding site and effect are tied to a concrete example."),
        ("allosteric-diagram", "Eine zweite neue Skizze zeigt einen Hemmstoff seitlich am Enzym und danach ein verändertes aktives Zentrum. Erkläre das allosterische Beispiel unabhängig.", "A second new diagram shows an inhibitor binding to the enzyme's side, followed by a changed active site. Explain the allosteric example independently.", "Die lernende Person benennt den anderen Bindungsort und die Form-/Wirkungsänderung, ohne den Hemmstoff fälschlich im aktiven Zentrum zu platzieren.", "The learner names the other binding site and altered shape/action without mistakenly placing the inhibitor at the active site.", "Das zweite Prinzip wird separat nachgewiesen.", "The second principle is demonstrated separately."),
    ]),
}


def main() -> None:
    goals = {g["id"][:8]: g for g in json.loads(CANONICAL.read_text())["goals"]}
    selected = ["5c2ce7b1", "1984fd66", "01819a6c"]
    assert set(selected) == set(PROFILES)
    now = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    candidate_set = {
        "schemaVersion": 1,
        "authoringContract": "positive-understanding-evidence-candidates-v1",
        "reviewId": REVIEW_ID,
        "reviewedAt": now,
        "reviewer": "codex-biology-e-post-b-three-positive-profile-author-2026-09-30",
        "goals": [{
            "goalId": goals[key]["id"],
            "reason": "Fresh substantive AI review after the independent D-B finding and canonical correction: two distinct bilingual cases cover the exact current target and active PNG, including the mechanism or controlled-variable boundary. Human approval and learner achievement are unclaimed.",
            "evidenceLevel": "E1",
            "maximumClaimScope": "G1",
            "dissent": [],
            "profile": PROFILES[key],
        } for key in selected],
    }
    config = {
        "$schema": "https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json",
        "schemaVersion": 2,
        "reviewId": REVIEW_ID,
        "goalFingerprintRuleVersion": "goal-evidence-v1",
        "profileRuleVersion": "positive-understanding-evidence-v2",
        "landscapeId": "08a43a1b-d97e-522c-9dfa-c950a493364e",
        "landscapePath": "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json",
        "semanticKindLedgerPath": "curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json",
        "reviewCriteriaPath": "curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md",
        "reviewPath": "curricula/DE/Gymnasium/quality/goal-evidence/2026-09-30/biologie-m7-ephase-post-b-three-v3/positive-evidence.review.jsonl",
        "reviewRunManifestPaths": [],
        "reviewedResourceTypes": ["goal-visualization"],
        "requireApproved": False,
        "scope": {"label": "Biologie E: drei fachlich nach B korrigierte aktuelle Ziele", "goalIds": [goals[key]["id"] for key in selected]},
    }
    (HERE / "candidates.authoring.json").write_text(json.dumps(candidate_set, ensure_ascii=False, indent=2) + "\n")
    (HERE / "positive-evidence.config.json").write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n")
    print(f"Authored {len(selected)} current E AI candidate profiles at {now}")


if __name__ == "__main__":
    main()
