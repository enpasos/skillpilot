"""Author bounded positive-understanding-evidence-v2 candidates for E.1.

Each pair of cases asks for fresh learner work. The older four-goal candidates
remain historical because their pre-split scopes no longer match these goals.
"""

from datetime import datetime, timezone
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
CANONICAL = ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json"
REVIEW_ID = "biologie-m7-ephase-e1-stable-eight-current-20260930-v2"


def profile(archetype, expectation, axes, cases):
    eid, essential_de, essential_en, observable_de, observable_en = expectation
    return {
        "archetype": archetype,
        "expectations": [{
            "id": eid,
            "essentialUnderstandingDe": essential_de,
            "essentialUnderstandingEn": essential_en,
            "observablePerformanceDe": observable_de,
            "observablePerformanceEn": observable_en,
        }],
        "coverageExpectations": {
            "requiredExpectationIds": [eid],
            "alternativeExpectationGroups": [],
            "minimumIndependentDemonstrations": 2,
            "freshVariationRequired": True,
            "independentTransferRequired": True,
        },
        "variationAxes": [
            {"id": aid, "textDe": de, "textEn": en} for aid, de, en in axes
        ],
        "applicationCaseBriefs": [{
            "id": cid,
            "taskDemandDe": task_de,
            "taskDemandEn": task_en,
            "expectedPerformanceDe": expected_de,
            "expectedPerformanceEn": expected_en,
            "understandingFocusDe": focus_de,
            "understandingFocusEn": focus_en,
        } for cid, task_de, task_en, expected_de, expected_en, focus_de, focus_en in cases],
    }


PROFILES = {
    "11e90f71": profile("concept", (
        "observed-life-characteristics",
        "Lebenskennzeichen sind mehrere begründbare Eigenschaften; einzelne augenblickliche Bewegung oder deren Fehlen entscheidet nicht über Leben.",
        "Characteristics of life are multiple supportable properties; movement in one instant or its absence does not decide whether something is alive.",
        "Die lernende Person belegt mehrere Lebenskennzeichen an einem neuen dokumentierten Lebewesen, nennt die Beobachtung dazu und markiert nicht überprüfte Kennzeichen.",
        "The learner supports several characteristics of life for a newly documented organism, cites the observations and marks untested characteristics.",
    ), [
        ("organism", "Von einer Keimpflanze zu einer Hefekultur wechseln.", "Move from a germinating plant to a yeast culture."),
        ("evidence", "Ein Zeitprotokoll statt eines Einzelbilds auswerten.", "Interpret a time log rather than a single image."),
    ], [
        ("seedling-log", "Ein dreitägiges Keimlingsprotokoll zeigt Längenänderung und Krümmung zum Licht, aber keine Fortpflanzung. Welche Lebenskennzeichen sind belegt?", "A three-day seedling log shows growth and bending toward light but no reproduction. Which life characteristics have evidence?", "Wachstum und Reaktion auf Reize werden mit den protokollierten Änderungen belegt; Fortpflanzung wird als hier nicht beobachtet markiert, nicht verneint.", "Growth and response to a stimulus are supported by logged changes; reproduction is marked unobserved here, not denied.", "Befund und fehlender Befund werden sauber getrennt.", "Observed and unobserved properties remain distinct."),
        ("yeast-culture", "Ein neues Hefeprotokoll zeigt Sprossung und Gasbildung bei zugegebenem Zucker, aber keine Ortsbewegung. Begründe Kennzeichen des Lebens vorsichtig.", "A new yeast log shows budding and gas production with added sugar but no locomotion. Explain life characteristics cautiously.", "Sprossung stützt Fortpflanzung, Gasbildung ist ein Stoffwechselhinweis; fehlende Ortsbewegung wird nicht als Gegenbeweis verwendet.", "Budding supports reproduction, gas production suggests metabolism; lack of locomotion is not used as disproof.", "Transfer auf einen anders beobachtbaren Organismus.", "Transfer to an organism with different visible behaviour."),
    ]),
    "d71e2310": profile("concept", (
        "organization-levels",
        "Spezialisierte Zellen bilden Gewebe, Gewebe sind Teile von Organen und Organe wirken im Vielzeller zusammen; jede Ebene benennt eine andere Teil-Ganzes-Beziehung.",
        "Specialized cells form tissues, tissues are parts of organs, and organs work together in a multicellular organism; each level describes a different part-whole relation.",
        "Die lernende Person ordnet neue konkrete Bestandteile in die Ebenen ein und erklärt jeden Übergang anhand der tatsächlichen Bestandteile.",
        "The learner places unfamiliar concrete components in the levels and explains each transition using the actual components.",
    ), [
        ("kingdom", "Pflanzenblatt und tierischen Darm vergleichen.", "Compare a plant leaf and an animal intestine."),
        ("representation", "Querschnitt und Funktionsbeschreibung nutzen.", "Use a cross-section and a function description."),
    ], [
        ("leaf-section", "Ein neuer Blattquerschnitt markiert Palisadenzelle, Palisadengewebe, Blatt und Pflanze. Ordne die Ebenen mit Begründung.", "A new leaf section marks palisade cell, palisade tissue, leaf and plant. Order and justify the levels.", "Die Folge Zelle–Gewebe–Organ–Organismus wird an markierten Teilen erklärt; das Blatt wird nicht selbst als Gewebe bezeichnet.", "The cell-tissue-organ-organism sequence is explained from marked parts; the leaf is not itself called a tissue.", "Jeder Ebenenwechsel braucht einen Teil-Ganzes-Grund.", "Each level transition needs a part-whole reason."),
        ("intestine", "Eine Beschreibung nennt Darmepithelzellen, Darmepithel, Darm und Hund. Erkläre die Organisation ohne Pflanzenbegriffe zu kopieren.", "A description names intestinal epithelial cells, intestinal epithelium, intestine and dog. Explain the organization without copying plant terms.", "Epithelzellen bilden ein Gewebe, dieses ist Teil des Darmorgans, das im Organismus wirkt; die Beziehung wird an Funktionen verankert.", "Epithelial cells form a tissue, which is part of the intestine as an organ working in the organism; the relation is tied to function.", "Die Hierarchie wird auf ein Tier übertragen.", "The hierarchy transfers to an animal."),
    ]),
    "fc8c4b02": profile("modeling", (
        "organelle-structure-function",
        "Zellkern, Mitochondrium und Chloroplast erfüllen verschiedene Aufgaben; Bauhinweise im Modell stützen eine Zuordnung, ohne mikroskopische Sichtbarkeit aller Details zu behaupten.",
        "Nucleus, mitochondrion and chloroplast have different roles; structural clues in a model support classification without claiming every detail is visible by light microscopy.",
        "Die lernende Person ordnet neue Organellmodelle nach Bauhinweisen zu und erklärt jeweils eine Hauptfunktion mit einer Modellgrenze.",
        "The learner identifies new organelle models from structural clues and explains a main function for each with a model limit.",
    ), [
        ("cell-type", "Blattzelle und Wurzelzelle unterscheiden.", "Contrast a leaf cell with a root cell."),
        ("clue", "Membranfalten, Thylakoide und Kernhülle in neuen Schemata erkennen.", "Recognize membrane folds, thylakoids and the nuclear envelope in new diagrams."),
    ], [
        ("leaf-cell", "Ein unbeschriftetes Blattzellmodell zeigt Kernhülle, gefaltete innere Membranen und grüne Stapel. Ordne drei Organellen und Aufgaben zu.", "An unlabelled leaf-cell model shows a nuclear envelope, folded inner membranes and green stacks. Identify three organelles and roles.", "Kern, Mitochondrium und Chloroplast werden begründet zugeordnet; Erbinformation, Zellatmung und Fotosynthese werden passend genannt.", "Nucleus, mitochondrion and chloroplast are justified from clues; genetic information, respiration and photosynthesis are matched appropriately.", "Bauhinweis trägt eine begrenzte Funktionszuordnung.", "A structural clue supports a bounded function assignment."),
        ("root-cell", "Eine neue Wurzelzellskizze zeigt Zellkern und Mitochondrien, aber keine Chloroplasten. Erkläre die Organellaufgaben und die fehlende grüne Struktur.", "A new root-cell diagram shows a nucleus and mitochondria but no chloroplasts. Explain the organelle roles and the absent green structure.", "Die lernende Person erwartet Zellatmung durch Mitochondrien auch ohne Chloroplasten und behauptet für diese Zelle keine Fotosynthese aus bloßem Pflanzenstatus.", "The learner expects mitochondrial respiration without chloroplasts and does not infer photosynthesis merely from plant identity.", "Transfer ohne pauschale Organellausstattung jeder Pflanzenzelle.", "Transfer without assuming every plant cell has identical organelles."),
    ]),
    "1042bb24": profile("modeling", (
        "endosymbiosis-model",
        "Die Endosymbiontentheorie erklärt Mitochondrien und Chloroplasten als integrierte Nachfahren aufgenommener Bakterien; sie erklärt nicht jede Zellstruktur oder Vielzelligkeit.",
        "Endosymbiotic theory explains mitochondria and chloroplasts as integrated descendants of engulfed bacteria; it does not explain every cell structure or multicellularity.",
        "Die lernende Person beschreibt für ein neues Schema Wirt, Aufnahme, Integration und heutiges Organell und begrenzt die Modellreichweite.",
        "For a new diagram, the learner describes host, uptake, integration and the modern organelle, and limits the model's reach.",
    ), [
        ("organelle", "Mitochondrium und Chloroplast getrennt bearbeiten.", "Handle mitochondrion and chloroplast separately."),
        ("model-boundary", "Eine nicht durch Endosymbiose erklärte Zellstruktur kontrastieren.", "Contrast a cell structure not explained by endosymbiosis."),
    ], [
        ("mitochondrion-sequence", "Ein neues Evolutionsschema zeigt eine Wirtszelle, ein aufgenommenes aerobes Bakterium und ein Mitochondrium. Erkläre die Pfeile als Theorie.", "A new evolutionary diagram shows a host cell, an engulfed aerobic bacterium and a mitochondrion. Explain the arrows as a theory.", "Die Aufnahme und dauerhafte Integration werden als angenommener Ursprung des Mitochondriums erläutert, nicht als direkt beobachtete historische Szene.", "Uptake and lasting integration are explained as the proposed origin of a mitochondrion, not as a directly observed historical scene.", "Modellschritte und Evidenzstatus bleiben getrennt.", "Model steps and evidential status remain distinct."),
        ("chloroplast-boundary", "Eine andere Skizze fragt nach der Herkunft eines Chloroplasten und einer Zellwand. Welche Erklärung trägt die Endosymbiontentheorie?", "Another diagram asks about the origin of a chloroplast and a cell wall. Which claim does endosymbiosis support?", "Die lernende Person modelliert den Chloroplasten aus einem aufgenommenen fotosynthetischen Bakterium, lehnt aber eine pauschale Zellwandherkunft daraus ab.", "The learner models a chloroplast from an engulfed photosynthetic bacterium but rejects a blanket cell-wall origin from that event.", "Ein plausibles Organellmodell wird nicht überdehnt.", "A plausible organelle model is not overextended."),
    ]),
    "6199e4c7": profile("concept", (
        "cellularity-comparison",
        "Einzeller, Zellkolonie und Vielzeller unterscheiden sich in Zellzahl, dauerhaftem Zusammenhalt und Arbeitsteilung; viele nahe Zellen allein belegen noch keine Organe.",
        "Unicellular organisms, colonies and multicellular organisms differ in cell count, lasting cohesion and division of labour; many nearby cells alone do not establish organs.",
        "Die lernende Person ordnet unbekannte Organismen anhand beschriebener Zellanordnung und Arbeitsteilung mit Gründen zu und benennt Unsicherheit bei lückenhaften Daten.",
        "The learner classifies unfamiliar organisms from described cell arrangement and division of labour with reasons and notes uncertainty when evidence is incomplete.",
    ), [
        ("cohesion", "Lose Gruppe und dauerhafte Kolonie unterscheiden.", "Distinguish a loose group from a lasting colony."),
        ("specialization", "Zusätzliche Angaben zur Arbeitsteilung berücksichtigen.", "Use additional evidence about division of labour."),
    ], [
        ("three-forms", "Drei neue Schemata zeigen eine frei lebende Zelle, einen dauerhaften Zellverband ohne Gewebe und ein Tier mit Organen. Ordne sie ein.", "Three new diagrams show a free-living cell, a lasting cell group without tissues and an animal with organs. Classify them.", "Die freie Zelle ist Einzeller, der Verband Kolonie und das Tier Vielzeller; Zellzahl, Zusammenhang und Differenzierung tragen die Begründung.", "The free cell is unicellular, the group a colony and the animal multicellular; cell number, cohesion and differentiation support the choice.", "Nicht nur die Anzahl gezeichneter Zellen entscheidet.", "The number of drawn cells alone is insufficient."),
        ("algae-uncertain", "Ein Gewässerpräparat zeigt viele beieinanderliegende Algenzellen, aber keine Beobachtung ihres Zusammenhalts oder spezialisierter Gewebe. Was lässt sich schließen?", "A pond specimen shows many algal cells close together but no observation of lasting cohesion or specialized tissues. What follows?", "Eine sichere Kolonie- oder Vielzeller-Zuordnung bleibt offen; insbesondere werden aus Nähe keine gegliederten Organe abgeleitet.", "A firm colony or multicellular classification remains open; proximity does not establish differentiated organs.", "Unsicherheit wird an fehlender Organisationsinformation begründet.", "Uncertainty is tied to missing organization evidence."),
    ]),
    "e063b97d": profile("modeling", (
        "bilayer-selectivity-model",
        "Eine Biomembran hat eine Lipiddoppelschicht mit hydrophilen Außenseiten und hydrophobem Inneren; eingelagerte Proteine können ausgewählten Stoffen Wege eröffnen.",
        "A biomembrane has a lipid bilayer with hydrophilic outer sides and a hydrophobic core; embedded proteins can provide routes for selected substances.",
        "Die lernende Person erstellt ein neues Membranschema, richtet Lipide sinnvoll aus und erklärt daran selektive Durchlässigkeit ohne eine realistische Gesamtstruktur zu behaupten.",
        "The learner makes a new membrane diagram, orients lipids appropriately and explains selective permeability without claiming a complete realistic structure.",
    ), [
        ("orientation", "Einen gedrehten Membranausschnitt richtig lesen.", "Read a rotated membrane section correctly."),
        ("solute", "Wasser und ein größeres polares Teilchen kontrastieren.", "Contrast water with a larger polar particle."),
    ], [
        ("blank-membrane", "Zeichne zu einer neuen Zellgrenze eine Lipiddoppelschicht mit einem Transportprotein und erkläre, weshalb nicht jedes polare Teilchen frei hindurchgeht.", "Draw a lipid bilayer with a transport protein for a new cell boundary and explain why not every polar particle crosses freely.", "Hydrophile Köpfe weisen zu wässrigen Seiten, hydrophobe Schwänze nach innen; Proteinweg und Lipidinneres werden als unterschiedliche Barrieren/Wege erläutert.", "Hydrophilic heads face aqueous sides, hydrophobic tails point inward; the protein route and lipid interior are explained as different barriers or routes.", "Eigene Modellkonstruktion statt Bildkopie.", "An original model rather than copying the supplied image."),
        ("rotated-section", "Ein um 90 Grad gedrehtes Membranschema zeigt einen fehlenden Kanal. Markiere Bereiche und erkläre eine begrenzte Folge für selektive Durchlässigkeit.", "A membrane diagram rotated by 90 degrees lacks a channel. Label regions and explain one bounded effect on selective permeability.", "Die Orientierung der Lipide bleibt trotz Drehung korrekt; für einen passenden Stoff fehlt ein möglicher Proteinweg, ohne dass jede reale Transportmöglichkeit ausgeschlossen wird.", "The lipid orientation remains correct despite rotation; one possible protein route for a suitable solute is absent without ruling out every real transport mechanism.", "Darstellung und Modellgrenze werden übertragen.", "Representation and model limit are transferred."),
    ]),
    "e76315b1": profile("concept", (
        "diffusion-osmosis-direction",
        "Diffusion ist Nettobewegung permeabler Teilchen entlang eines Konzentrationsgefälles; Osmose ist Wasserbewegung durch eine geeignete selektive Membran abhängig von gelösten Stoffen.",
        "Diffusion is net movement of permeable particles down a concentration gradient; osmosis is water movement through a suitable selective membrane depending on solutes.",
        "Die lernende Person sagt für einen neuen Fall getrennt Teilchen- und Wasserbewegung voraus und begründet Richtung und Rolle der Membranpermeabilität.",
        "For a new case, the learner predicts solute and water movement separately and explains directions and membrane permeability.",
    ), [
        ("gradient", "Konzentrationsgefälle für Teilchen und Wasser wechseln.", "Change solute and water gradients."),
        ("permeability", "Permeables Teilchen und nicht permeable gelöste Stoffe unterscheiden.", "Distinguish a permeable particle from impermeable dissolved solutes."),
    ], [
        ("dye-bag", "Ein Farbstoff ist durch eine Membran permeabel und außen konzentrierter; nicht permeable Salze sind dagegen innen konzentrierter als außen. Sage Farbstoff- und Wasserweg getrennt voraus.", "A dye can cross a membrane and is more concentrated outside; impermeable salts, however, are more concentrated inside than outside. Predict dye and water movement separately.", "Farbstoff diffundiert netto nach innen; Wasser bewegt sich wegen der nicht permeablen Salze ebenfalls netto nach innen, aber mit eigener Begründung statt bloßem Kopieren des Farbstoffpfeils.", "Dye diffuses net inward; water also moves net inward because of the impermeable salts, but with its own reason rather than merely copying the dye arrow.", "Zwei unterschiedliche Antriebe werden sauber getrennt.", "Two distinct gradients are kept separate."),
        ("reversed-salt", "Bei einem neuen semipermeablen Beutel werden die Salzkonzentrationen innen und außen gegenüber Fall 1 vertauscht; Salz bleibt undurchlässig. Wohin bewegt sich Wasser netto?", "In a new semipermeable bag, the inside and outside salt concentrations are reversed from case 1; salt remains impermeable. Which way does water move net?", "Die Wasserprognose wechselt zur Seite mit höherer Konzentration nicht permeabler Teilchen; eine Salzbewegung durch die Membran wird nicht erfunden.", "The water prediction reverses toward the side with more impermeable solutes; no salt crossing is invented.", "Richtungsregel wird bei geänderten Anfangsdaten neu angewendet.", "The direction rule is reapplied to changed initial data."),
    ]),
}


def main() -> None:
    goals = {goal["id"][:8]: goal for goal in json.loads(CANONICAL.read_text())["goals"]}
    old_profiles = json.loads((HERE.parent / "biologie-m7-ephase-e1-cells-four-v1/profiles.authoring.json").read_text())
    # The microscopy profile remains substantively suitable after the precise
    # observation/model repair, and its two fresh cases were checked again.
    microscopy = next(profile for goal_id, profile in old_profiles.items() if goal_id.startswith("7c6bf0cc"))
    selected = ["11e90f71", "d71e2310", "7c6bf0cc", "fc8c4b02", "1042bb24", "6199e4c7", "e063b97d", "e76315b1"]
    assert set(selected) == set(PROFILES) | {"7c6bf0cc"}
    now = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    candidate_set = {
        "schemaVersion": 1,
        "authoringContract": "positive-understanding-evidence-candidates-v1",
        "reviewId": REVIEW_ID,
        "reviewedAt": now,
        "reviewer": "codex-biology-e1-post-split-current-positive-profile-author-2026-09-30",
        "goals": [{
            "goalId": goals[key]["id"],
            "reason": "Substantive AI candidate review of the current E.1 target: two distinct bilingual application cases require independent learner work, preserve the post-split boundary and bind the active image bytes. This profile is needs_human_review, not learner or human-release evidence.",
            "evidenceLevel": "E1",
            "maximumClaimScope": "G1",
            "dissent": [],
            "profile": microscopy if key == "7c6bf0cc" else PROFILES[key],
        } for key in selected],
    }
    (HERE / "candidates.authoring.json").write_text(json.dumps(candidate_set, ensure_ascii=False, indent=2) + "\n")
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
        "reviewPath": "curricula/DE/Gymnasium/quality/goal-evidence/2026-09-30/biologie-m7-ephase-e1-stable-eight-v2/positive-evidence.review.jsonl",
        "reviewRunManifestPaths": [],
        "reviewedResourceTypes": ["goal-visualization"],
        "requireApproved": False,
        "scope": {"label": "Biologie E.1: acht stabile post-split Ziele, AI-Kandidaten", "goalIds": [goals[key]["id"] for key in selected]},
    }
    (HERE / "positive-evidence.config.json").write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n")
    print(f"Authored {len(selected)} current E.1 AI candidate profiles at {now}")


if __name__ == "__main__":
    main()
