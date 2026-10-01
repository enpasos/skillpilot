"""Author seven current, bounded E.2-E.4 positive evidence candidates."""

from datetime import datetime, timezone
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
CANONICAL = ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json"
REVIEW_ID = "biologie-m7-ephase-e2-e4-stable-seven-current-20260930-v2"


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
            {"id": axis_id, "textDe": de, "textEn": en} for axis_id, de, en in axes
        ],
        "applicationCaseBriefs": [{
            "id": case_id,
            "taskDemandDe": demand_de,
            "taskDemandEn": demand_en,
            "expectedPerformanceDe": expected_de,
            "expectedPerformanceEn": expected_en,
            "understandingFocusDe": focus_de,
            "understandingFocusEn": focus_en,
        } for case_id, demand_de, demand_en, expected_de, expected_en, focus_de, focus_en in cases],
    }


PROFILES = {
    "28850d2e": profile("modeling", (
        "peptide-chain-and-four-levels",
        "Peptidbindungen verknüpfen Aminosäuren in einer bestimmten Reihenfolge zur Polypeptidkette (Primärstruktur); lokale Faltungen, Gesamtfaltung einer Kette und Anordnung mehrerer Ketten sind Sekundär-, Tertiär- und gegebenenfalls Quartärstruktur. Nicht jedes Protein hat eine Quartärstruktur.",
        "Peptide bonds join amino acids in a particular order to form a polypeptide (primary structure); local folds, the overall fold of one chain and the arrangement of several chains are secondary, tertiary and, where present, quaternary structure. Not every protein has a quaternary structure.",
        "Die lernende Person baut oder ergänzt ein neues Kettenmodell, markiert Peptidbindungen und ordnet anhand der Zahl der Ketten die vier Strukturebenen mit Modellgrenze zu.",
        "The learner builds or completes a new chain model, marks peptide bonds and assigns the four structure levels using chain count and a model limit.",
    ), [
        ("chain-count", "Eine gefaltete Einzelkette und ein Protein aus mehreren gefalteten Ketten vergleichen.", "Compare one folded chain with a protein made of several folded chains."),
        ("representation", "Baustein- und Faltungsschema mit angegebenen Modellgrenzen lesen.", "Read bead and folding diagrams with stated model limits."),
    ], [
        ("four-residue-single-chain", "Ein neues Modell zeigt vier unterschiedliche Aminosäurebausteine in einer Kette, einen lokalen Helixabschnitt und die gefaltete Einzelkette. Markiere die Bindungen und erläutere, welche Strukturebenen dargestellt sind und welche nicht.", "A new model shows four different amino-acid units in one chain, a local helix segment and the folded single chain. Mark the bonds and explain which structure levels are represented and which are not.", "Drei Peptidbindungen verknüpfen die vier Bausteine; ihre Reihenfolge ist Primärstruktur, die Helix ein Sekundärstrukturbeispiel und die Gesamtfaltung Tertiärstruktur. Die Einzelkette besitzt hier keine Quartärstruktur; das Schema verrät keine exakten Atompositionen.", "Three peptide bonds join the four units; their order is primary structure, the helix illustrates secondary structure and the overall fold is tertiary structure. This single chain has no quaternary structure; the diagram gives no exact atomic positions.", "Bindungszahl und Ebenen werden selbst am neuen Einzelkettenmodell hergeleitet.", "Bond count and levels are derived from a new single-chain model."),
        ("two-chain-protein", "Ein anderes Schema zeigt zwei getrennte, jeweils gefaltete Polypeptidketten A und B, die zusammen ein Protein bilden; in A ist ein kurzer Faltblattabschnitt markiert. Ergänze je ein Bindungsschema für drei aufeinanderfolgende Aminosäuren und ordne alle vier Strukturebenen zu.", "Another diagram shows two separate, individually folded polypeptide chains A and B forming one protein; a short beta-sheet segment is marked in A. Add a bonding diagram for three consecutive amino acids and assign all four structure levels.", "Je drei aufeinanderfolgende Aminosäuren werden durch zwei Peptidbindungen verbunden. Die jeweilige Reihenfolge ist primär, das Faltblatt sekundär, die Faltung jeder Kette tertiär und die gemeinsame Anordnung von A und B quartär; aus dem Schema wird keine genaue Faltung vorhergesagt.", "Two peptide bonds join each set of three consecutive amino acids. Each sequence is primary, the beta sheet secondary, each chain's fold tertiary and the arrangement of A and B quaternary; the diagram does not predict an exact fold.", "Mehrkettenfall verlangt eigene Verknüpfung und echte Quartärstruktur statt Bildwiederholung.", "The multi-chain case requires independent bonding and genuine quaternary structure rather than image recall."),
    ]),
    "0dbe758c": profile("concept", (
        "bounded-enzyme-catalysis",
        "Ein passendes Substrat bindet am aktiven Zentrum eines Enzyms, wird zu Produkten umgesetzt und das Enzym kann danach erneut wirken; ein einfaches Formmodell zeigt den Ablauf, aber keinen direkt beobachteten molekularen Mechanismus.",
        "A suitable substrate binds at an enzyme's active site, is converted into products and the enzyme can act again; a simple shape model shows the sequence but is not a directly observed molecular mechanism.",
        "Die lernende Person ordnet in einem neuen biologischen Beispiel Enzym, Substrat, aktives Zentrum und Produkte zu und erklärt die wiederholte Katalyse mit begrenzter Aussage über Beobachtungsdaten.",
        "The learner identifies enzyme, substrate, active site and products in a new biological example and explains repeated catalysis while limiting what observations alone establish.",
    ), [
        ("reaction", "Lactase-Lactose-Spaltung und Katalase-Peroxid-Zerlegung unterscheiden.", "Distinguish lactase splitting lactose from catalase decomposing peroxide."),
        ("evidence", "Stoffschema und sicher bereitgestellten Vergleich mit Gasblasen getrennt deuten.", "Interpret a substance diagram and a safely supplied bubble comparison separately."),
    ], [
        ("lactase-lactose", "Ein neues Schema zeigt Lactose, die in das aktive Zentrum von Lactase passt, sowie Glucose und Galactose als getrennte Produkte. Erkläre den Ablauf und was nach Freisetzung der Produkte mit Lactase geschieht.", "A new diagram shows lactose fitting the active site of lactase and glucose and galactose as separate products. Explain the sequence and what happens to lactase after product release.", "Lactose ist Substrat, Lactase das katalysierende Enzym, Glucose und Galactose die Produkte. Lactase wird im vereinfachten Modell nicht verbraucht und kann erneut ein passendes Substrat umsetzen; die Zeichnung ist kein atomgenauer Nachweis.", "Lactose is the substrate, lactase the catalytic enzyme, and glucose and galactose the products. Lactase is not consumed in the simplified model and can act again on a suitable substrate; the drawing is not atom-level proof.", "Substrat-Produkt-Zuordnung und Wiederverwendung werden am neuen Spaltungsfall erklärt.", "Substrate-product assignment and reuse are explained in a new cleavage case."),
        ("catalase-supplied-data", "Ein sicher bereitgestellter Vergleich zeigt bei Katalase plus Wasserstoffperoxid viele Gasblasen, bei derselben Lösung ohne aktives Enzym kaum Blasen. Beschreibe den passenden Enzymablauf und eine Grenze der Beobachtung; führe keinen eigenen Peroxidversuch durch.", "A safely supplied comparison shows many bubbles with catalase plus hydrogen peroxide and very few in the same solution without active enzyme. Describe the matching enzyme sequence and one limit of the observation; do not perform a peroxide experiment.", "Wasserstoffperoxid ist Substrat; Katalase erleichtert an ihrem aktiven Zentrum die Zerlegung zu Wasser und Sauerstoff und bleibt als Katalysator verfügbar. Der Vergleich stützt die Aktivität, aber Blasen allein identifizieren das Gas nicht sicher und zeigen keine atomaren Zwischenschritte.", "Hydrogen peroxide is the substrate; catalase facilitates its decomposition to water and oxygen at its active site and remains available as a catalyst. The comparison supports activity, but bubbles alone do not identify the gas with certainty or reveal atomic intermediates.", "Ein anderer Umsatz und ein Vergleichssignal prüfen den Mechanismus unabhängig.", "Another reaction and a comparative signal test the mechanism independently."),
    ]),
    "f539fe51": profile("data", (
        "controlled-temperature-activity",
        "Bei konstanten übrigen Bedingungen kann sich Enzymaktivität mit der Temperatur ändern; ein Maximum gilt nur für die untersuchten Werte. Aktivitätsverlust nach starker Erwärmung kann auf Denaturierung hindeuten, während bloße Kälteaktivität nach Erwärmen zurückkehren kann.",
        "With other conditions controlled, enzyme activity can vary with temperature; an observed maximum applies only to tested values. Loss of activity after strong heating can suggest denaturation, whereas activity slowed by cold may return after warming.",
        "Die lernende Person deutet neue kontrollierte Temperaturdaten, benennt das beobachtete Maximum und prüft anhand eines Erholungsvergleichs, wie stark eine Denaturierungsdeutung gestützt ist.",
        "The learner interprets new controlled temperature data, names the observed maximum and uses a recovery comparison to judge support for a denaturation interpretation.",
    ), [
        ("design", "Aktivitätsreihe bei verschiedenen Messtemperaturen und Vorbehandlung mit anschließender gleicher Messtemperatur unterscheiden.", "Distinguish an activity series at varying assay temperatures from pretreatment followed by one assay temperature."),
        ("inference", "Mögliches Optimum und mögliche bleibende Hitzeschädigung mit ihrer jeweiligen Evidenzgrenze deuten.", "Interpret a possible optimum and lasting heat damage with their different evidence limits."),
    ], [
        ("amylase-temperature-table", "Amylase-Aktivität wird bei 10, 25, 37 und 65 °C unter gleichem pH, gleicher Enzym- und Stärkemenge gemessen: 1, 4, 9, 0,5 Einheiten. Deute den Verlauf und die geringe Aktivität bei 65 °C.", "Amylase activity is measured at 10, 25, 37 and 65 °C with the same pH, enzyme amount and starch amount: 1, 4, 9 and 0.5 units. Interpret the pattern and the low activity at 65 °C.", "Unter den getesteten Temperaturen ist 37 °C am höchsten; 10 °C ist langsamer, 65 °C deutlich schwächer. Starke Hitze kann die Struktur schädigen, doch diese Reihe allein beweist weder irreversible Denaturierung noch ein exaktes Optimum zwischen Messpunkten.", "Among tested temperatures, 37 °C gives the highest activity; 10 °C is slower and 65 °C much lower. High heat can damage structure, but this series alone proves neither irreversible denaturation nor an exact optimum between data points.", "Kontrollierte Temperaturdaten werden ohne universelle Temperaturbehauptung gedeutet.", "Controlled temperature data are interpreted without a universal temperature claim."),
        ("heat-and-cold-recovery", "Ein anderes Enzym wird getrennt bei 5 °C oder 70 °C vorbehandelt und dann jeweils zusammen mit einer unbehandelten Kontrolle bei 25 °C gemessen; pH, Substrat und Enzymmenge sind beim Messen gleich. Aktivitäten: Kontrolle 6, kalt vorbehandelt 5,8, heiß vorbehandelt 0,2 Einheiten. Was stützen die Daten?", "Another enzyme is pretreated separately at 5 °C or 70 °C and then assayed along with an untreated control at 25 °C; pH, substrate and enzyme amount are the same during assay. Activities are 6 for control, 5.8 after cold pretreatment and 0.2 after hot pretreatment. What do the data support?", "Kälte-Vorbehandlung hat dieses Enzym nicht dauerhaft stark geschädigt; über seine Aktivität während der Kälte sagt die spätere Messung nichts Sicheres. Anhaltend geringe Aktivität nach Hitze stützt eine Hitzeschädigung oder Denaturierung, ohne die molekulare Form direkt zu zeigen. Die gemeinsame Messtemperatur trennt Vorbehandlung vom Messeffekt.", "Cold pretreatment has not caused substantial lasting damage to this enzyme; the later assay does not establish its activity during cold exposure. Persistently low activity after heat supports heat damage or denaturation without directly showing molecular shape. The common assay temperature separates pretreatment from the measurement effect.", "Unabhängiger Erholungsvergleich prüft die Denaturierungsdeutung statt bloß Kurvenformen wiederzuerkennen.", "A separate recovery comparison tests denaturation reasoning rather than curve recognition."),
    ]),
    "d06adc48": profile("data", (
        "controlled-ph-optimum",
        "Enzymaktivität kann vom pH-Wert abhängen; ein Maximum wird aus kontrollierten Daten nur für den getesteten pH-Bereich bestimmt und ist nicht für alle Enzyme gleich.",
        "Enzyme activity can depend on pH; a maximum inferred from controlled data applies only to the tested pH range and is not the same for every enzyme.",
        "Die lernende Person beschreibt aus neuen Daten ein Aktivitätsmaximum und Abnahmen bei anderen pH-Werten und grenzt die Aussage auf das untersuchte Enzym und die konstanten Versuchsbedingungen ein.",
        "The learner describes an activity maximum and declines at other pH values from new data, limiting the conclusion to the tested enzyme and controlled conditions.",
    ), [
        ("enzyme", "Ein neutralnahes Enzym und Pepsin im sauren Milieu vergleichen.", "Compare an enzyme with a near-neutral maximum with pepsin in acid."),
        ("representation", "Tabelle und anders skalierte Kurve getrennt auswerten.", "Interpret a table and a differently scaled curve separately."),
    ], [
        ("neutral-range-table", "Bei gleicher Temperatur sowie gleicher Substrat- und Enzymmenge zeigt ein Enzym bei pH 3, 5, 7 und 9 die Aktivitäten 0,5, 4, 8 und 2 Einheiten. Beschreibe die pH-Abhängigkeit und das aus diesen Werten ableitbare Optimum.", "At the same temperature and with equal substrate and enzyme amounts, an enzyme gives activities of 0.5, 4, 8 and 2 units at pH 3, 5, 7 and 9. Describe the pH dependence and the optimum supported by these values.", "pH 7 hat unter den gemessenen Werten die höchste Aktivität, pH 3 und 9 weniger; die genaue Lage zwischen Messpunkten ist offen. Die anderen Bedingungen sind kontrolliert, daher wird die beobachtete Änderung dem variierten pH zugeordnet.", "pH 7 has the highest activity among measured values, while pH 3 and 9 are lower; the exact location between data points remains unknown. Other conditions are controlled, so the observed change is related to varied pH.", "Ein beobachtetes statt behauptetes allgemeines pH-Optimum wird aus Daten bestimmt.", "An observed rather than universal pH optimum is determined from data."),
        ("pepsin-acid-curve", "Eine neue Pepsin-Kurve bei konstantem Substrat, konstanter Temperatur und gleicher Enzymmenge hat bei pH 2 eine Aktivität von 10, bei pH 4 von 4 und bei pH 7 von 0,5 Einheiten. Deute die Kurve und prüfe die Aussage: ‚Alle Enzyme arbeiten bei pH 7 am besten.‘", "A new pepsin curve at fixed substrate, temperature and enzyme amount shows activity 10 at pH 2, 4 at pH 4 and 0.5 at pH 7. Interpret it and assess: 'All enzymes work best at pH 7.'", "Pepsin hat im untersuchten Bereich bei pH 2 die höchste Aktivität; die allgemeine pH-7-Behauptung wird anhand dieses Gegenbeispiels verworfen. Ein exaktes Optimum außerhalb oder zwischen getesteten Werten wird nicht erfunden.", "Pepsin has its highest measured activity at pH 2 in the tested range; this counterexample rejects the universal pH-7 claim. No exact optimum outside or between measured points is invented.", "Anderes Enzym und Gegenbehauptung fordern einen unabhängigen Transfer.", "Another enzyme and a counterclaim require independent transfer."),
    ]),
    "e1484671": profile("concept", (
        "cell-cycle-order-and-replication",
        "Im eukaryotischen Zellzyklus folgen G1, S, G2 und M aufeinander; DNA wird in S vor der Teilung verdoppelt und in M auf Tochterzellen verteilt. DNA-Verdopplung ist nicht gleich Verdopplung der Chromosomenzahl in der Zelle.",
        "In a eukaryotic cell cycle, G1, S, G2 and M occur in order; DNA is replicated in S before division and distributed to daughter cells in M. DNA replication does not itself double the cell's chromosome count.",
        "Die lernende Person ordnet neue Phasenhinweise, verortet die DNA-Verdopplung und erklärt anhand eines zweiten Datenmusters, weshalb beide Tochterzellen nach M wieder die Ausgangsmenge DNA erhalten können.",
        "The learner orders new phase clues, locates DNA replication and uses a second data pattern to explain how both daughter cells can receive the starting DNA amount after M.",
    ), [
        ("representation", "Beschriebene Zellereignisse und DNA-Mengenverlauf wechseln.", "Switch between described cell events and a DNA-content time course."),
        ("direction", "Vorbereitung vor Teilung von Verteilung während Teilung trennen.", "Separate preparation before division from distribution during division."),
    ], [
        ("phase-cards", "Vier ungeordnete Karten beschreiben: Wachstum der Zelle, DNA-Verdopplung, Vorbereitung auf Teilung nach der Verdopplung und Verteilung des Erbmaterials auf zwei Tochterzellen. Ordne sie G1, S, G2, M zu und begründe die Reihenfolge.", "Four shuffled cards describe cell growth, DNA replication, preparation for division after replication and distribution of genetic material into two daughter cells. Match them to G1, S, G2 and M and justify the order.", "Wachstum wird G1, DNA-Verdopplung S, spätere Vorbereitung G2 und Verteilung M zugeordnet. Die DNA muss vor der Teilung kopiert sein; M wird nicht als zweite DNA-Verdopplung bezeichnet.", "Growth is assigned to G1, DNA replication to S, later preparation to G2 and distribution to M. DNA must be copied before division; M is not described as a second replication.", "Ereignisse werden in eigener Phasenfolge erklärt statt Bildetiketten zu kopieren.", "Events are explained in an independently ordered phase sequence rather than copied from image labels."),
        ("dna-content-series", "Bei einer anderen eukaryotischen Zellpopulation misst man pro Zelle nacheinander 2C, einen Übergang von 2C auf 4C, 4C und nach der Zellteilung je Tochterzelle 2C DNA. Ordne den Abschnitten G1, S, G2 und M zu und erkläre die 4C-Phase.", "In another eukaryotic cell population, DNA per cell is measured successively as 2C, a transition from 2C to 4C, 4C and then 2C in each daughter after division. Assign G1, S, G2 and M and explain the 4C stage.", "G1 liegt bei 2C, S umfasst die Zunahme, G2 bleibt bei 4C und M verteilt das zuvor kopierte Material auf zwei Töchter mit je 2C. 4C vor M bedeutet mehr DNA pro Zelle, nicht automatisch doppelt so viele Chromosomen.", "G1 has 2C, S contains the increase, G2 stays at 4C and M distributes the previously copied material to two daughters with 2C each. Pre-M 4C means more DNA per cell, not automatically twice as many chromosomes.", "DNA-Messdaten prüfen den Phasenbegriff unabhängig vom gezeigten Zellcomic.", "DNA measurements test the phase concept independently of the supplied cell cartoon."),
    ]),
    "ec88fc1d": profile("concept", (
        "division-outcomes",
        "Mitose umfasst eine Teilung mit zwei Tochterzellen und bei normaler diploider Ausgangszelle gleichem Chromosomensatz; Meiose umfasst zwei aufeinanderfolgende Teilungen mit vier Zellen halben Chromosomensatzes.",
        "Mitosis has one division and two daughter cells with the same chromosome set for an ordinary diploid starting cell; meiosis has two consecutive divisions and four cells with half the chromosome set.",
        "Die lernende Person stellt Teilungszahl, Tochterzellzahl und Chromosomensatz an neuen Ausgangszellen gegenüber und korrigiert eine falsche Zuordnung eines Teilungsprodukts.",
        "The learner compares division count, daughter-cell count and chromosome set for new starting cells and corrects a false assignment of a division product.",
    ), [
        ("context", "Körperzell-Erneuerung und Gametenbildung kontrastieren.", "Contrast somatic-cell renewal and gamete formation."),
        ("performance", "Vergleichstabelle erstellen und einen fehlerhaften Laborbericht prüfen.", "Build a comparison table and critique a faulty lab report."),
    ], [
        ("diploid-six-cells", "Eine diploide Körperzelle einer Tierart hat 2n=6. Vergleiche den Ausgang nach Mitose mit dem einer diploiden Keimbahnzelle derselben Art nach Meiose in einer eigenen Tabelle: Zahl der Teilungen, Zahl der Zellen und Chromosomensatz.", "A diploid somatic cell of an animal species has 2n=6. In your own table, compare its outcome after mitosis with that of a diploid germline cell of the same species after meiosis: number of divisions, cells and chromosome set.", "Mitose: eine Teilung, zwei Zellen mit je 2n=6. Meiose: zwei Teilungen, vier Zellen mit je n=3; die drei Vergleichsgrößen werden getrennt benannt.", "Mitosis: one division, two cells each with 2n=6. Meiosis: two divisions, four cells each with n=3; all three comparison properties are named separately.", "Alle drei Vergleichsachsen werden selbst an einem neuen 2n-Wert ausgefüllt.", "All three comparison axes are completed independently for a new 2n value."),
        ("faulty-gamete-report", "Ein Bericht behauptet: ‚Bei 2n=8 entstehen durch eine Mitose vier Gameten mit n=4.‘ Prüfe die Aussage und beschreibe den passenden Prozess anhand von Teilungszahl, Zellzahl und Chromosomensatz.", "A report claims: 'At 2n=8, one mitosis produces four gametes with n=4.' Assess the claim and describe the matching process using division count, cell count and chromosome set.", "Eine Mitose ergibt zwei Zellen mit gleichem Satz, nicht vier haploide Gameten. Meiose umfasst zwei Teilungen und ergibt aus einer diploiden Ausgangszelle vier Zellen mit n=4.", "One mitosis yields two cells with the same set, not four haploid gametes. Meiosis has two divisions and yields four cells with n=4 from one diploid starter.", "Fehlerdiagnose verlangt Transfer der drei Vergleichsmerkmale ohne zusätzliche Replikationspflicht.", "Diagnosing the error transfers the three comparison properties without requiring extra replication knowledge."),
    ]),
    "9344c5ce": profile("concept", (
        "model-organism-choice-and-limit",
        "Ein Modellorganismus wird für eine konkrete entwicklungsbiologische Frage nach passenden beobachtbaren Merkmalen und praktischen Forschungsbedingungen ausgewählt; Ergebnisse übertragbarer Prozesse sind kein Beweis für identische menschliche Entwicklung.",
        "A model organism is selected for a specific developmental-biology question using suitable observable features and practical research conditions; findings about potentially shared processes do not prove identical human development.",
        "Die lernende Person wählt für eine neue einfache Frage Drosophila oder C. elegans, begründet die Eignung mit mindestens zwei fallbezogenen Merkmalen und benennt eine konkrete Übertragungsgrenze.",
        "For a new simple question, the learner chooses Drosophila or C. elegans, justifies suitability with at least two case-related features and states a concrete transfer limit.",
    ), [
        ("organism", "Fruchtfliege und Fadenwurm für unterschiedliche Entwicklungsfragen auswählen.", "Select fruit fly and nematode for different developmental questions."),
        ("observation", "Sichtbare Körpermuster und verfolgbares Zellschicksal unterscheiden.", "Distinguish visible body patterns from traceable cell fates."),
    ], [
        ("fly-body-pattern", "Eine Forschungsgruppe fragt, wie eine Veränderung eines Gens das frühe Körpermuster vieler Embryonen beeinflusst. Wähle zwischen Drosophila und C. elegans einen passenden Modellorganismus; begründe mit beobachtbaren Nachkommen und Generationsdauer und nenne eine Grenze für Aussagen über Menschen.", "A research group asks how a gene change affects early body pattern in many embryos. Choose between Drosophila and C. elegans as a suitable model; justify using observable offspring and generation time and state a limit for claims about humans.", "Drosophila ist für den Vergleich vieler Embryonen und Körpermuster gut begründbar: viele Nachkommen, kurze Generationszeit und sichtbare Entwicklungsmerkmale. Ein dort gefundener Zusammenhang darf nicht ohne weitere Prüfung als identischer Ablauf der menschlichen Embryonalentwicklung gelten.", "Drosophila is well justified for comparing many embryos and body patterns: many offspring, a short generation time and visible developmental traits. A relation found there cannot, without further study, be treated as the identical course of human embryonic development.", "Eignung und menschliche Transfergrenze werden an einer konkreten Körpermusterfrage begründet.", "Suitability and limits of human transfer are justified for a specific body-pattern question."),
        ("worm-cell-lineage", "Eine andere Forschungsgruppe will beobachten, welche frühen Zellen eines kleinen Tieres später bestimmte Gewebe bilden. Wähle einen Modellorganismus und erkläre, warum Beobachtbarkeit und Entwicklungsablauf helfen; begrenze die Übertragung auf menschliche Organe.", "Another group wants to observe which early cells of a small animal later form particular tissues. Choose a model organism and explain why visibility and development help; limit transfer to human organs.", "C. elegans ist wegen seines durchsichtigen Körpers, der gut verfolgbaren Zelllinie und kurzen Entwicklung passend. Ein verfolgtes Zellschicksal im Wurm zeigt nicht direkt, wie komplexe menschliche Organe entstehen; dafür braucht es eigene Evidenz.", "C. elegans is suitable because of its transparent body, traceable cell lineage and short development. A tracked cell fate in the worm does not directly show how complex human organs form; that needs separate evidence.", "Anderer Organismus und anderer Beobachtungsgegenstand prüfen die Begründung unabhängig.", "Another organism and observation target test the rationale independently."),
    ]),
}


def main():
    canonical = json.loads(CANONICAL.read_text())
    goals = {goal["id"][:8]: goal for goal in canonical["goals"]}
    order = ["28850d2e", "0dbe758c", "f539fe51", "d06adc48", "e1484671", "ec88fc1d", "9344c5ce"]
    assert set(order) == set(PROFILES)
    for key in order:
        assert goals[key]["type"] == "atomic" and not goals[key]["contains"]
        assert goals[key]["resourceLinks"][0]["reviewStatus"] == "ai_candidate"
    now = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    candidates = {
        "schemaVersion": 1,
        "authoringContract": "positive-understanding-evidence-candidates-v1",
        "reviewId": REVIEW_ID,
        "reviewedAt": now,
        "reviewer": "codex-gpt-6-biology-e2e4-independent-profile-author-2026-09-30",
        "goals": [{
            "goalId": goals[key]["id"],
            "reason": "Current HE KCGO 2024 E.2-E.4 goal and active PNG inspected. This newly bounded AI profile asks for two distinct independent bilingual learner performances, respects the post-split goal scope and image model limit; it is not learner evidence or human approval.",
            "evidenceLevel": "E1",
            "maximumClaimScope": "G1",
            "dissent": [],
            "profile": PROFILES[key],
        } for key in order],
    }
    (HERE / "candidates.authoring.json").write_text(json.dumps(candidates, ensure_ascii=False, indent=2) + "\n")
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
        "reviewPath": "curricula/DE/Gymnasium/quality/goal-evidence/2026-09-30/biologie-m7-ephase-e2-e4-stable-seven-v2/positive-evidence.review.jsonl",
        "reviewRunManifestPaths": [],
        "reviewedResourceTypes": ["goal-visualization"],
        "requireApproved": False,
        "scope": {
            "label": "Biologie E.2-E.4: sieben stabile post-split Ziele, AI-Kandidaten",
            "goalIds": [goals[key]["id"] for key in order],
        },
    }
    (HERE / "positive-evidence.config.json").write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n")
    print(f"Authored {len(order)} current E.2-E.4 AI candidate profiles at {now}")


if __name__ == "__main__":
    main()
