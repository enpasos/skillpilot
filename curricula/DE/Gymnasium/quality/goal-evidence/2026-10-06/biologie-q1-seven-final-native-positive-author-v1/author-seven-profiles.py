"""Content authoring from the exact sixteen supplied cases, not learner data."""
import datetime
import hashlib
import json
from pathlib import Path

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-final-native-positive-author-v1')
INPUT_BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-final-native-review-inputs-author-v1')
if (BASE / 'native-positive-author-v1.final.freeze.json').exists():
    raise SystemExit('Frozen author package: use a new continuation.')
inputs = json.loads((INPUT_BASE / 'inputs/positive-review-inputs.native-fingerprints.pending.json').read_text())
input_config = json.loads((INPUT_BASE / 'inputs/positive-evidence.pending.config.json').read_text())
profiles = {}
case_notes = {}


def expectation(identifier, de, en, observed_de, observed_en):
    return dict(id=identifier, essentialUnderstandingDe=de, essentialUnderstandingEn=en,
                observablePerformanceDe=observed_de, observablePerformanceEn=observed_en)


def axis(identifier, de, en):
    return dict(id=identifier, textDe=de, textEn=en)


def case(identifier, demand_de, demand_en, performance_de, performance_en, focus_de, focus_en):
    return dict(id=identifier, taskDemandDe=demand_de, taskDemandEn=demand_en,
                expectedPerformanceDe=performance_de, expectedPerformanceEn=performance_en,
                understandingFocusDe=focus_de, understandingFocusEn=focus_en)


def profile(goal_id, archetype, expectations, axes, cases, scope_note):
    profiles[goal_id] = dict(archetype=archetype, expectations=expectations,
        coverageExpectations=dict(requiredExpectationIds=[e['id'] for e in expectations],
            alternativeExpectationGroups=[], minimumIndependentDemonstrations=2,
            freshVariationRequired=True, independentTransferRequired=True),
        variationAxes=axes, applicationCaseBriefs=cases)
    case_notes[goal_id] = scope_note


profile('ac9e824f-003c-50ac-8751-2b8456004c63', 'concept', [
    expectation('nested-carrier-roles',
        'DNA ist im vorgegebenen einfachen Modell das Material der Erbinformation. Ein Gen ist ein Abschnitt dieser DNA; das Chromosom organisiert und trägt DNA. Die drei Begriffe bezeichnen zusammengehörige Ebenen derselben Darstellung.',
        'In the supplied simple model, DNA is the material of genetic information. A gene is a section of that DNA; the chromosome organises and carries DNA. The three terms describe related levels of the same representation.',
        'Die lernende Person ordnet die drei Ebenen selbst zu und erklärt ihre Teil-Ganzes-Beziehung am Modell, statt Gen und DNA als zusätzliche getrennte Träger neben dem Chromosom zu behandeln.',
        'The learner independently identifies the three levels and explains their part-whole relationship in the model, rather than treating a gene and DNA as additional separate carriers beside a chromosome.'),
    expectation('multiple-sections-one-chromosome',
        'Ein Chromosom kann mehrere Genabschnitte tragen. Eine Chromosomenzahl legt ohne vollständige Abschnittsinformation die Zahl aller Gene nicht fest.',
        'One chromosome can carry several gene sections. Without complete information about its sections, chromosome number does not determine the total number of genes.',
        'Im Vier-Chromosomen-Modell erklärt die lernende Person, weshalb daraus keine Zahl von vier Genen folgt, und benennt die fehlende vollständige Abschnittsliste als Grenze der Aussage.',
        'In the four-chromosome model, the learner explains why four genes do not follow from that count and identifies the absent complete section list as the limit of the conclusion.'),
    expectation('preserved-structure-in-variant-model',
        'Eine im Material vorgegebene veränderte Anleitung an derselben DNA-Stelle bleibt eine Variante eines Genabschnitts auf dem vorhandenen Chromosom. Eine solche Abschnittsvariante ist kein zusätzliches Chromosom.',
        'A changed instruction supplied at the same DNA position remains a variant of a gene section on the existing chromosome. Such a section variant is not an additional chromosome.',
        'Im zweiten Modell verknüpft die lernende Person den auf beiden Homologen bezeichneten Abschnitt G mit deren DNA und Chromosomenstruktur; sie erklärt, weshalb der Austausch g1→g3 allein kein Chromosom hinzufügt.',
        'In the second model, the learner relates section G marked on both homologues to their DNA and chromosome structure, explaining why replacement g1→g3 alone adds no chromosome.'),
], [
    axis('whole-to-section-view', 'Zwischen der Übersicht mehrerer Chromosomen und dem Ausschnitt eines DNA-Fadens wechseln; die Material-/Abschnitts-/Trägerbeziehung bleibt erhalten.', 'Move between the overview of several chromosomes and a DNA-strand detail; preserve the material/section/carrier relationship.'),
    axis('same-position-changed-instruction', 'Vom Genabschnitt auf einem Chromosom zum gleichen Abschnitt auf zwei Homologen mit vorgegebenen unterschiedlichen Anleitungen wechseln, ohne eine zusätzliche Erbgangskompetenz zu verlangen.', 'Move from a gene section on one chromosome to the same section on two homologues with supplied different instructions, without requiring an additional inheritance-pattern competence.'),
], [
    case('classical-carriers-a',
        'Nutze die unveränderte Modellkarte classical-carriers-a mit vier Chromosomen, einem DNA-Faden und Abschnitt G. Erkläre die Beziehung zwischen Chromosom, DNA und Gen; begründe, welche Aussage zur Gesamtzahl der Gene möglich ist.',
        'Use the unchanged classical-carriers-a model card with four chromosomes, one DNA strand and section G. Explain the relationship among chromosome, DNA and gene, and justify what can be said about total gene number.',
        'DNA wird als Material in der organisierten Chromosomenstruktur und G als Teil der DNA verknüpft. Mehrere Gene auf einem Chromosom sind möglich; vier Chromosomen bestimmen nicht vier Gene. Die vollständige Abschnittsliste fehlt.',
        'DNA is related to the organised chromosome structure as its material, and G as part of that DNA. Several genes on one chromosome are possible; four chromosomes do not determine four genes. A complete section list is absent.',
        'Teil-Ganzes-Beziehung und begrenzte Zählaussage am selben vorgegebenen Modell.',
        'Part-whole relationship and bounded counting inference within the same supplied model.'),
    case('classical-carriers-b',
        'Nutze die unveränderte Karte classical-carriers-b: A1/A2 tragen Abschnitt G an derselben Stelle, die vorgegebenen Anleitungen heißen g1/g2; V ersetzt g1 durch g3. Verfolge die Material-/Abschnitts-/Trägerbeziehung und die Chromosomenzahl.',
        'Use unchanged card classical-carriers-b: A1/A2 carry section G at the same position with supplied instructions g1/g2; V replaces g1 with g3. Trace the material/section/carrier relationship and chromosome number.',
        'G bleibt ein DNA-Abschnitt auf beiden vorhandenen Homologen; die Anleitung im Abschnitt ändert sich bei V. Es wird kein weiteres Chromosom hinzugefügt. Die Darstellung liefert keine Genprodukt- oder Merkmalsdaten.',
        'G remains a DNA section on both existing homologues; V changes the instruction within that section. No additional chromosome is added. The representation supplies no gene-product or trait data.',
        'Übertragung der gleichen Strukturbeziehung auf vorgegebene Abschnittsvarianten. Alleldefinition, Erbgang und Genproduktwirkung werden nicht als zusätzliche Pflichtkompetenz verlangt.',
        'Transfer of the same structural relationship to supplied section variants. Allele definitions, inheritance patterns and gene-product effects are not required as additional competencies.'),
], 'Die vollständige Karte b bleibt unverändert. Das P-Profil nutzt deren vorgegebene Anleitungsvarianten nur für die exakte DNA/Gen/Chromosom-Beziehung; seine Pflichtanforderungen erweitern das Ziel nicht auf Allellehre oder Genproduktwirkung.')

profile('5eb7c923-469d-5934-b1e8-292e1bb40d95', 'representation', [
    expectation('identify-change-level',
        'Die Veränderung einer Sequenz innerhalb eines Gens, eines Chromosomenabschnitts und der Zahl ganzer Chromosomen betrifft jeweils Gen-, Chromosomen- und Genomniveau. Maßgeblich ist die tatsächliche Modelldifferenz.',
        'A sequence change within a gene, a chromosome-segment change and a change in whole-chromosome number concern the gene, chromosome and genome levels respectively. The actual model difference determines the classification.',
        'Die lernende Person vergleicht Referenz und Veränderung aller drei Ebenen und begründet die Zuordnung anhand der betroffenen Sequenz, Abschnittsstruktur oder Chromosomenzahl.',
        'The learner compares the reference and changed models at all three levels and justifies classification using the affected sequence, segment structure or chromosome number.'),
    expectation('given-causes-and-information',
        'Ein vorgegebener Kopierfehler verändert die Gensequenz, Abschnittsverdopplung oder umgekehrtes Wiederverbinden verändert Abschnittsstruktur, Fehlverteilung verändert ganze Informationskopien durch die Chromosomenzahl. Ursache und unmittelbare Informationsfolge sind getrennt zu erklären.',
        'A supplied copying error changes gene sequence; segment duplication or inverted rejoining changes segment structure; missegregation changes whole information copies through chromosome number. Cause and immediate information consequence are explained separately.',
        'Die lernende Person verfolgt die im Material belegte Ursache zur konkreten Änderung und erklärt zusätzliche Genkopien, veränderte Orientierung oder fehlende Chromosomeninformation nur dort, wo die jeweilige Modellkarte diese zeigt.',
        'The learner traces the evidenced cause to the specific change and explains extra gene copies, altered orientation or missing chromosome information only where the relevant model card shows them.'),
    expectation('measured-function-bounded',
        'Unmittelbare Informationsänderung und gemessene Funktionsfolge sind unterschiedliche Befunde. Die Aktivität 50±2→20±2 in levels-a belegt die verringerte Aktivität der gleich gereinigten G-Proteinmenge in genau diesem kontrollierten Test.',
        'Immediate information change and measured functional consequence are different findings. Activity 50±2→20±2 in levels-a evidences reduced activity of the equally purified G-protein amount in that controlled test only.',
        'Die lernende Person ordnet den Aktivitätsbefund ausschließlich dem untersuchten Genfall zu und begrenzt Aussagen zu den anderen Fällen auf deren Informationsänderungen; bestimmte Merkmale oder Krankheiten bleiben ohne weitere Daten offen.',
        'The learner assigns the activity finding only to the assayed gene case and bounds statements about other cases to their information changes; particular traits or diseases remain open without further data.'),
], [
    axis('different-structural-change', 'Abschnittsverdopplung bei unveränderter Chromosomenzahl mit Umkehrung eines wiederverbundenen Abschnitts vergleichen.', 'Compare segment duplication at unchanged chromosome number with inversion of a rejoined segment.'),
    axis('loss-scale', 'Den Verlust einer Base mit dem Fehlen eines ganzen Chromosoms vergleichen und aus dem betroffenen Maßstab begründen.', 'Compare loss of a base with absence of a whole chromosome and justify classification from the affected scale.'),
    axis('functional-evidence-available-or-absent', 'Vom Fall mit einem kontrollierten G-Proteinaktivitätstest zu Fällen ohne Protein- oder Merkmalsmessung wechseln.', 'Move from a case with a controlled G-protein activity assay to cases without protein or trait measurements.'),
], [
    case('levels-a',
        'Nutze levels-a unverändert: ACGT→ATGT nach Kopierfehler; verdoppelter Abschnitt auf A1 mit zwölf Genen bei vier Chromosomen; Fehlverteilung mit fünf statt vier Chromosomen. Ordne die Niveaus zu, erkläre Ursachen/Informationsfolgen und nutze 50±2→20±2 zielgenau.',
        'Use levels-a unchanged: ACGT→ATGT after a copying error; a duplicated twelve-gene segment on A1 with four chromosomes; missegregation yielding five instead of four chromosomes. Classify levels, explain causes/information consequences and use 50±2→20±2 precisely.',
        'Die lokale Sequenzänderung ist Genmutation mit der gegebenen geringeren Testaktivität. Abschnittsverdopplung ist Chromosomenmutation mit zusätzlichen zwölf Genkopien bei unveränderter Anzahl. Das zusätzliche B-Chromosom ist Genommutation mit zusätzlicher ganzer Informationskopie. Untersuchte Funktion und offene Merkmale werden getrennt.',
        'The local sequence change is a gene mutation with the supplied lower assay activity. Segment duplication is a chromosome mutation with twelve extra gene copies at unchanged number. The extra B chromosome is a genome mutation with an additional whole information copy. Assayed function and open trait questions are separated.',
        'Drei Veränderungsmaßstäbe, ihre belegten Ursachen und die Reichweite eines kontrollierten Funktionsbefunds.',
        'Three scales of change, their evidenced causes and the scope of a controlled functional finding.'),
    case('levels-b',
        'Nutze levels-b unverändert: Verlust einer Base im Genabschnitt, umgekehrt wiederverbundener C1-Abschnitt mit acht Genen bei sechs Chromosomen und fehlendes C2 nach Fehlverteilung bei fünf Chromosomen. Begründe Zuordnung und unmittelbare Folgen ohne Protein-/Merkmalsmessung.',
        'Use levels-b unchanged: loss of a base within a gene section, an inverted rejoined eight-gene C1 segment with six chromosomes, and absent C2 after missegregation yielding five chromosomes. Justify classification and immediate consequences without protein/trait measurements.',
        'L verändert die Gensequenz, M die Orientierung des Chromosomenabschnitts bei gleichbleibender Anzahl, N die Chromosomenzahl und vorhandenen Informationskopien. Verlust wird aus seinem Maßstab eingeordnet. Bestimmte Protein- oder Merkmalsfolgen werden mangels Daten nicht behauptet.',
        'L changes gene sequence, M chromosome-segment orientation at unchanged number, and N chromosome number and available information copies. Loss is classified by its scale. Particular protein or trait consequences are not asserted without data.',
        'Sachhaltiger Transfer von Verdopplung/Zugewinn zu Orientierung/Verlust unter veränderter Evidenzlage.',
        'Substantive transfer from duplication/gain to orientation/loss with changed evidence availability.'),
], 'Beide vollständigen levels-Fälle liefern alle Klassifikations-, Ursachen- und unmittelbaren Informationsanforderungen. Einzelfall-Funktionsdaten werden nur im tatsächlich gemessenen Fall verwendet; keine Leseraster-, Krankheits- oder Erbgangspflicht wird ergänzt.')

profile('bfb5dfb6-8e35-5452-b581-96e061d8b826', 'representation', [
    expectation('single-base-pair-position',
        'Im vorgegebenen Material bezeichnet Punktmutation eine Änderung an genau einer Basenpaarposition; dargestellt sind Substitutionen. Die Einordnung folgt dem positionsweisen Sequenzvergleich.',
        'In the supplied material, point mutation means a change at exactly one base-pair position; the displayed changes are substitutions. Classification follows a position-by-position sequence comparison.',
        'Die lernende Person lokalisiert bei ACTA→ATTA die zweite Position C→T und bei GCAA→GCTA die dritte Position A→T und begründet die Punktmutationszuordnung im festgelegten Modell.',
        'The learner locates the second-position C→T change in ACTA→ATTA and the third-position A→T change in GCAA→GCTA, justifying point-mutation classification in the defined model.'),
    expectation('whole-chromosome-number',
        'Eine Änderung der Zahl ganzer Chromosomen betrifft das Genomniveau. Sequenzposition und Chromosomenzahl werden unabhängig verglichen.',
        'A change in whole-chromosome number concerns the genome level. Sequence position and chromosome number are compared independently.',
        'Die lernende Person begründet den Zugewinn von B3 als 4→5 und das Fehlen von C2 als 6→5, ordnet beide als Genommutation ein und unterscheidet sie von den lokalen Sequenzänderungen.',
        'The learner justifies addition of B3 as 4→5 and absence of C2 as 6→5, classifies both as genome mutations and distinguishes them from local sequence changes.'),
    expectation('independent-evidence-scales',
        'Eine Chromosomenzählung beantwortet eine andere Frage als ein Sequenzvergleich. Gleichbleibende Anzahl schließt die gezeigte Punktmutation nicht aus; eine geänderte Anzahl liefert keine Messung einer zusätzlichen lokalen Sequenzänderung.',
        'A chromosome count addresses a different question from a sequence comparison. Unchanged number does not exclude the displayed point mutation; changed number supplies no measurement of an additional local sequence change.',
        'Die lernende Person begründet die Grenze der Zähldaten und nennt für Q einen Vergleich eines definierten Genabschnitts als passende zusätzliche Untersuchung auf eine dortige Punktmutation.',
        'The learner explains the limit of count data and identifies comparison of a defined gene section as a suitable additional examination for a point mutation there in Q.'),
], [
    axis('gain-versus-loss-of-whole-chromosome', 'Von einem zusätzlich vorhandenen B-Chromosom zum fehlenden C2 wechseln und die Genomzuordnung an der jeweils vollständigen Zählung prüfen.', 'Move from an additional B chromosome to missing C2 and test genome classification against the complete count in each case.'),
    axis('sequence-known-versus-not-assayed', 'Sequenzgemessene lokale Änderung mit einer Zahländerung ohne gemessene Gensequenz vergleichen; bekannte Befunde und offene Zusatzänderungen trennen.', 'Compare an assayed local sequence change with a number change lacking gene-sequence measurements; distinguish known findings from open additional changes.'),
], [
    case('point-genome-a',
        'Nutze point-genome-a unverändert: ACTA/ATTA und A1,A2,B1,B2 gegenüber A1,A2,B1,B2,B3. Vergleiche beide Datenarten und begründe, was unveränderte Chromosomenzahl über die lokale Änderung aussagt.',
        'Use point-genome-a unchanged: ACTA/ATTA and A1,A2,B1,B2 compared with A1,A2,B1,B2,B3. Compare both data types and justify what unchanged chromosome number says about the local change.',
        'Der Unterschied C→T an Position 2 ist die gezeigte Punktmutation; B3 ändert die Anzahl 4→5 und ist die Genommutation. Die unveränderte Zahl beim Sequenzfall schließt dessen lokale Änderung nicht aus.',
        'The C→T difference at position 2 is the displayed point mutation; B3 changes the number 4→5 and is the genome mutation. Unchanged count in the sequence case does not exclude its local change.',
        'Unabhängiger Sequenz- und Zählvergleich unter der ausdrücklich gegebenen Punktmutationskonvention.',
        'Independent sequence and count comparison under the explicitly supplied point-mutation convention.'),
    case('point-genome-b',
        'Nutze point-genome-b unverändert: P GCAA/GCTA bei Zahl sechs; Q fehlendes C2 bei Zahl fünf und ohne Gensequenzmessung. Ordne beide zu und benenne passende zusätzliche Evidenz für eine mögliche Punktmutation bei Q.',
        'Use point-genome-b unchanged: P GCAA/GCTA with number six; Q missing C2 with number five and no gene-sequence assay. Classify both and identify suitable extra evidence for a possible point mutation in Q.',
        'P hat eine Substitution A→T an Position 3. Q hat eine Genommutation 6→5. Ein Sequenzvergleich im definierten Genabschnitt würde eine dortige weitere Punktmutation prüfen; die Zahlmessung belegt oder widerlegt diese nicht.',
        'P has an A→T substitution at position 3. Q has a genome mutation 6→5. A sequence comparison of the defined gene section would test a further point mutation there; the count finding neither establishes nor excludes it.',
        'Transfer auf Verlust und fehlende Sequenzdaten; Kategorien werden anhand ihres eigenen Messmaßstabs begründet.',
        'Transfer to loss and absent sequence data; categories are justified by their own measurement scale.'),
], 'Das Profil folgt ausschließlich der vorgegebenen Substitutionskonvention und verlangt keine allgemeine Definition aller Punktmutationen, keine Chromosomenstrukturklassifikation und keine Merkmals-/Krankheitsprognose.')

profile('3a0d6c82-f9f0-5ad1-bb0b-b948e4450d04', 'data', [
    expectation('damage-to-persistent-change',
        'Der im Material belegte mutagene Einfluss kann DNA schädigen. Fehlerhafte oder ausbleibende Korrektur kann bei weiterer Kopie eine bleibende genetische Änderung begünstigen; eine Exposition ist keine Gewissheit einer Mutation oder Krankheit.',
        'The mutagenic influence evidenced in the material can damage DNA. Incorrect or absent correction can favour a persistent genetic change during further copying; exposure does not guarantee mutation or disease.',
        'Die lernende Person erklärt den vorgegebenen Ursachenweg für R/M beziehungsweise UV/PAK-Metaboliten und verbindet die konkreten Daten damit, ohne von Gruppen- oder Expositionswerten auf eine sichere Änderung bei einer Person oder Zelle zu schließen.',
        'The learner explains the supplied causal pathway for R/M or UV/PAH metabolites and relates the specific data to it, without inferring a certain change in one person or cell from group or exposure values.'),
    expectation('material-backed-comparison',
        'Kontrollierte Gruppenhäufigkeiten und relative Exposition sind unterschiedliche Datenarten. Eine Kontrollhäufigkeit größer null lässt Hintergrundänderungen zu; Expositionseinheiten sind keine Mutations- oder Krankheitswahrscheinlichkeiten.',
        'Controlled group frequencies and relative exposure are different data types. A nonzero control frequency allows background changes; exposure units are not mutation or disease probabilities.',
        'Die lernende Person vergleicht die jeweils vorgegebenen Kontroll-/Kontakt- oder Expositionswerte korrekt, erläutert bei R 3/1000,27/1000,6/1000 beziehungsweise bei M 2/1000,18/1000,17/1000 und hält Häufigkeit, Exposition und individuelle Prognose auseinander.',
        'The learner correctly compares the supplied control/contact or exposure values, explains R values 3/1000,27/1000,6/1000 or M values 2/1000,18/1000,17/1000, and distinguishes frequency, exposure and individual prediction.'),
    expectation('criteria-based-risk-and-action',
        'Eine konkrete genetische Alltags-/Umweltgefahr wird anhand des belegten Ursachenwegs und der angegebenen Entscheidungskriterien bewertet. Die Schutzentscheidung legt die vorgegebene Priorität und den verbleibenden organisatorischen oder zeitlichen Nachteil offen.',
        'A concrete genetic everyday/environmental hazard is evaluated using the evidenced causal pathway and stated decision criteria. The protective choice explicitly states the supplied priority and remaining organisational or time cost.',
        'Die lernende Person trennt Datenvergleich und begründetes Handlungsurteil, vergleicht alle Optionen und begründet UV-Variante C bei umstellbarem Zeitplan bzw. PAK-Variante B trotz Zusatzweg anhand der gegebenen Prioritäten und Teilnahme-/Erreichbarkeitsbedingungen.',
        'The learner separates data comparison from the justified action judgement, compares all options and justifies UV option C with an adjustable schedule or PAH option B despite the extra walk using the given priorities and participation/access conditions.'),
    expectation('matching-protection-and-limits',
        'Eine Schutzmaßnahme wird durch passende Expositions-/Wirksamkeitsdaten begründet. Abschirmung muss zum Einfluss passen; bloße Papierabdeckung, Sichtschutz, Wärme oder fehlende Beschwerden messen die betrachtete genetische Gefahr nicht ausreichend.',
        'A protective measure is justified by suitable exposure/effectiveness data. Shielding must match the influence; paper covering, a visual screen, warmth or absent symptoms do not adequately measure the genetic hazard considered.',
        'Die lernende Person wählt die im Material wirksame Expositionsverringerung, formuliert ihre situativen Grenzen und benennt bei neuen Wetterlagen passende erneute Expositions- und Erreichbarkeitsprüfungen. Sie überträgt weder Modellwerte noch Streuungen auf persönliche Krankheitsraten.',
        'The learner selects the exposure reduction shown effective in the material, states its situational limits and identifies suitable renewed exposure and access checks for new weather. Neither model values nor spreads are converted into personal disease rates.'),
], [
    axis('physical-versus-chemical-influence', 'Vorgegebene physikalische Einwirkung R/UV mit chemischem M/PAK vergleichen; den belegten Schadensweg und einen zum Einfluss passenden Schutz erhalten.', 'Compare supplied physical R/UV influence with chemical M/PAHs; preserve the evidenced damage pathway and protection matching the influence.'),
    axis('group-frequency-versus-exposure', 'Von bestätigten Sequenzänderungen in kontrollierten Zellgruppen zu relativen Expositionsdaten einer Alltagssituation wechseln; deren Aussagearten getrennt interpretieren.', 'Move from confirmed sequence changes in controlled cell groups to relative exposure data in an everyday situation; interpret their kinds of claim separately.'),
    axis('conditional-priority-and-evidence', 'Umstellbaren/festen UV-Zeitplan und sichere Bus-Erreichbarkeit/Zusatzweg anhand der vorgegebenen Kriterien abwägen; fehlende Wirksamkeits- oder Wetterdaten als Entscheidungsgrenze berücksichtigen.', 'Weigh adjustable/fixed UV scheduling and safe bus access/extra walking using the given criteria; account for missing effectiveness or weather data as decision limits.'),
], [
    case('mutagen-protection-a',
        'Nutze mutagen-protection-a unverändert: je 1000 sonst gleiche Zelllinien, ohne R drei, mit R 27 und mit geprüfter Abschirmung sechs bestätigte neue Änderungen. Erkläre den Ursachenweg, vergleiche und begründe Schutz samt Grenze.',
        'Use mutagen-protection-a unchanged: 1000 otherwise matched cell lineages each, three confirmed new changes without R,27 with R and six with tested shielding. Explain the causal pathway, compare and justify protection and its limit.',
        'Die Häufigkeiten sind 0,3 %, 2,7 %, 0,6 %; die R-Gruppe hat hier neunmal die Kontrollhäufigkeit. Getestete Abschirmung senkt die beobachtete Häufigkeit, nicht auf null. Der vorgegebene Schadens-/Kopierweg und Hintergrundänderungen werden erklärt; die Zahlen bleiben Gruppendaten.',
        'Frequencies are 0.3%, 2.7%, 0.6%; the R group has nine times the control frequency here. Tested shielding lowers the observed frequency, not to zero. The supplied damage/copying pathway and background changes are explained; the values remain group data.',
        'Materialgestützte Ursache, Kontrolle und begrenzte Wirksamkeit einer passenden Abschirmung.',
        'Material-backed cause, control and bounded effectiveness of suitable shielding.'),
    case('mutagen-protection-b',
        'Nutze mutagen-protection-b unverändert: je 1000 Zelllinien, geschlossene Ersatzanlage ohne M-Kontakt zwei, offene M-Anwendung 18 und ungeprüfte Papierabdeckung 17 Änderungen. Wähle mit Daten und Materialkarte einen begründeten Schutz.',
        'Use mutagen-protection-b unchanged: 1000 cell lineages each, two changes in the closed substitute system without M contact,18 with open M use and 17 with untested paper covering. Choose justified protection using data and the material card.',
        '0,2 % werden mit 1,8 %/1,7 % verglichen. Die geschlossene kontaktvermeidende Ersatzanlage ist unter den gegebenen Bedingungen begründet; Papier hält M laut Karte nicht zurück. Kontakt bedeutet nicht Änderung in jeder Zelle, Kontrolle nicht völlige Änderungsfreiheit.',
        '0.2% is compared with 1.8%/1.7%. The closed contact-avoiding substitute system is justified under the supplied conditions; the card states that paper does not block M. Contact does not mean change in every cell, and control does not mean absence of all changes.',
        'Transfer auf einen chemischen Einfluss und den Unterschied zwischen einem sichtbaren Gegenstand und belegter Schutzwirkung.',
        'Transfer to a chemical influence and the difference between a visible object and evidenced protection.'),
    case('everyday-uv-risk-decision-c',
        'Nutze die unveränderte UV-Sporttagkarte: A 100,B 25,C 10 relative Exposition, gleiche Teilnahme, mögliche Zeitumstellung; Vorrang Exposition senken, danach Organisation. Bewerte alle Varianten, empfehle mit Abwägung und prüfe die Alternative bei festem Zeitplan sowie den Wärme-Werbesatz.',
        'Use the unchanged UV sports-day card: relative exposure A 100,B 25,C 10, equal participation, adjustable schedule; prioritise lowering exposure, then organisation. Evaluate all options, justify a recommendation and tradeoff, and assess the fixed-schedule alternative and warmth advertisement.',
        'UV-Schaden und mögliche bleibende Änderung begründen den genetischen Gefahrenbezug. C minimiert nach der vorgegebenen Priorität die Exposition bei möglicher Umstellung; B wäre bei festem Zeitplan begründbar. Der Organisationsnachteil wird benannt. Wärme belegt UV nicht;100/25/10 ergeben keine persönlichen Mutations-/Krankheitsraten.',
        'UV damage and possible persistent change establish the genetic hazard. Under the stated priority, C minimises exposure with an adjustable schedule; B would be justified with a fixed schedule. The organisational cost is stated. Warmth does not establish UV;100/25/10 yield no personal mutation/disease rates.',
        'Genetische Alltagsgefahr, explizite Kriterien, bedingtes Handlungsurteil und Grenze von Expositionszahlen.',
        'Genetic everyday hazard, explicit criteria, conditional action judgement and limits of exposure values.'),
    case('environment-air-pah-risk-decision-d',
        'Nutze die unveränderte Holzrauch-/Buskarte: täglich A 12±1,B 2±0,5,C 11±1 relative Einheiten, fünf Tage, gleicher Bus und sicherer Zusatzweg bei B; C nur Sichtschutz ohne Filter. Bewerte alle Optionen nach Belastung, Erreichbarkeit und Zeit und benenne Grenzen bei anderen Wetterlagen.',
        'Use the unchanged woodsmoke/bus card: daily relative units A 12±1,B 2±0.5,C 11±1 for five days, same bus and safe extra walk for B; C is only a visual screen without filtering. Evaluate all options by exposure, access and time, and state limits for other weather.',
        'Der gegebene PAK-Metabolit/DNA-Schadensweg wird erklärt. Fünf Zentralwerte ergeben A 60,B 10,C 55; ohne Fehlerannahme wird keine neue Summengenauigkeit behauptet. B ist nach Expositionspriorität trotz sechs Minuten Zusatzweg begründet. C belegt keinen klaren Schutz. Andere Wetterlagen brauchen passende neue Messungen und Erreichbarkeitsprüfung; Sichtbarkeit/Beschwerden beweisen keine genetische Ungefährlichkeit.',
        'The supplied PAH-metabolite/DNA-damage pathway is explained. Five central values sum to A 60,B 10,C 55; no new precision of the sums is asserted without error assumptions. B is justified by the exposure priority despite six extra minutes walking. C evidences no clear protection. Other weather requires suitable new measurements and access checks; visibility/symptoms do not prove genetic safety.',
        'Konkrete Umweltbewertung mit transparentem Zeitkonflikt, Wirksamkeitsbefund, Streuungsgrenze und sachgerechter Übertragungsprüfung.',
        'Concrete environmental evaluation with a transparent time tradeoff, effectiveness evidence, spread limits and an appropriate transfer check.'),
], 'Alle vier vorgegebenen Fälle werden verwendet. Datenvergleich, mechanistische Erklärung und Kriterienurteil bleiben unterscheidbar; keine realen Gesundheitsprognosen, klinischen Grenzwerte, erfundenen Luftmessungen oder durchgeführten Versuche werden behauptet.')

profile('9d830422-acc7-5fa8-aee9-4dae4cedbf49', 'modeling', [
    expectation('trace-separated-lineages',
        'Im vorgegebenen Tiermodell wird eine DNA-Änderung an die Tochterzellen der betroffenen Zelle weitergegeben. Nach Trennung von K und G und ohne Zellwechsel bleibt eine Änderung innerhalb der jeweiligen Abstammungslinie.',
        'In the supplied animal model, a DNA change is passed to daughter cells of the affected cell. After separation of K and G, and without cell movement between them, a change remains within its respective lineage.',
        'Die lernende Person verfolgt dieselbe Änderung in K beziehungsweise G und erläutert, welche Zellnachkommen sie im Modell tragen; somatische Änderung wird als Mutation erkannt, obwohl sie hier keine Keimzellen erreicht.',
        'The learner traces the same change in K or G and explains which cellular descendants carry it in the model; a somatic change is recognised as a mutation although it reaches no gametes here.'),
    expectation('time-and-distribution',
        'Der Zeitpunkt relativ zur Zelllinientrennung beeinflusst die Verteilung. Die vorgegebene frühe Zygotenänderung E bleibt in beiden Linien, die späte Körperzelländerung S in ihren späteren somatischen Nachkommen.',
        'Timing relative to lineage separation influences distribution. The supplied early zygote change E persists in both lineages, while late somatic change S persists in its later somatic descendants.',
        'Die lernende Person begründet aus der angegebenen Abstammung und dem Zeitpunkt die unterschiedliche Ausbreitung von E und S, ohne aus dem bloßen Etikett Mutation die Beteiligung sämtlicher Zellen abzuleiten.',
        'The learner justifies the different spread of E and S from the supplied ancestry and timing, without deriving involvement of every cell from the label mutation alone.'),
    expectation('conditional-offspring-transmission',
        'Weitergabe im Zellstammbaum und Weitergabe an Nachkommen sind verschiedene Beziehungen. Im gegebenen Modell gelangt die Änderung nur über eine betroffene tatsächlich beteiligte Keimzelle in den Nachkommen.',
        'Transmission within a cell lineage and transmission to offspring are different relationships. In the supplied model, a change enters offspring only through an affected gamete that actually participates.',
        'Die lernende Person verbindet G mit möglicher geschlechtlicher Weitergabe, nutzt die explizite Nichtbeteiligung der fertigen G-Keimzelle in lineage-b und begründet, weshalb dort keine Übertragung in dieser Befruchtung erfolgt.',
        'The learner connects G with possible sexual transmission, uses the explicit nonparticipation of the mature G gamete in lineage-b and explains why no transmission occurs in that fertilisation.'),
], [
    axis('before-or-after-lineage-separation', 'Von getrennten Körper-/Keimzelllinien zu einer frühen Zygotenänderung vor der Trennung und einer späten Körperzelländerung wechseln.', 'Move from separate somatic/gamete-forming lineages to an early zygote change before separation and a late somatic change.'),
    axis('affected-gamete-participation', 'Mögliche betroffene Keimzellen mit einer ausdrücklich nicht verwendeten fertigen Keimzelle vergleichen; Zellverteilung und konkrete Befruchtung getrennt verfolgen.', 'Compare possibly affected gametes with an explicitly unused mature gamete; trace cellular distribution and the specific fertilisation separately.'),
], [
    case('lineage-a',
        'Nutze lineage-a unverändert: Tiermodell mit bereits getrennter K-/G-Linie, keinem Zellwechsel und Weitergabe an Tochterzellen. Verfolge dieselbe Änderung in beiden Linien und erkläre mögliche Nachkommenweitergabe.',
        'Use lineage-a unchanged: animal model with already separate K/G lineages, no cell exchange and inheritance by daughter cells. Trace the same change in both lineages and explain possible transmission to offspring.',
        'K trägt die Änderung nur in der betroffenen Körperzell-Abstammung; G kann betroffene Keimzellen bilden. Ein Nachkomme erhält die Änderung nur bei tatsächlicher Befruchtungsbeteiligung einer betroffenen Keimzelle. Beide Änderungen betreffen Erbinformation und sind Mutationen.',
        'K carries the change only in the affected somatic lineage; G can form affected gametes. Offspring receive the change only if an affected gamete actually participates in fertilisation. Both changes concern genetic information and are mutations.',
        'Abstammungslinien und zwei verschiedene Bedeutungen von Weitergabe in einem ausdrücklich begrenzten Tiermodell.',
        'Cell lineages and two different meanings of transmission within an explicitly bounded animal model.'),
    case('lineage-b',
        'Nutze lineage-b unverändert: E in der Zygote vor Linientrennung und in beiden Linien erhalten, S spät in einer Körperzelle, G in einer fertigen hier unbenutzten Keimzelle. Vergleiche Ausbreitung und Weitergabe.',
        'Use lineage-b unchanged: E in the zygote before separation and persisting in both lineages, S late in a somatic cell, G in a mature gamete unused here. Compare spread and transmission.',
        'E erreicht im angegebenen Modell beide Linien und kann über beteiligte betroffene Keimzellen weitergegeben werden; S bleibt in späteren somatischen Nachkommen. G wird in der genannten Befruchtung nicht übertragen. Zeitpunkt, Linie und konkrete Beteiligung begründen die Antwort; eine Krankheit wird daraus nicht vorhergesagt.',
        'E reaches both lineages in the supplied model and can pass through participating affected gametes; S remains in later somatic descendants. G is not transmitted in the specified fertilisation. Timing, lineage and actual participation justify the answer; no disease is predicted from them.',
        'Transfer zwischen frühem/spätem Zeitpunkt und möglicher/tatsächlich ausgeschlossener Keimzellbeteiligung.',
        'Transfer between early/late timing and possible/actually excluded gamete participation.'),
], 'Die Aussage bleibt beim ausdrücklich gegebenen Tier-Zelllinienmodell; keine allgemeine Pflanzenregel, Keimzellwahrscheinlichkeit oder Krankheitsbehauptung wird ergänzt.')

profile('d0c3e6a7-581b-57bd-8027-e940c6b77af8', 'data', [
    expectation('genotype-environment-controls',
        'Im vorgegebenen Modell ist eine Merkmalsänderung bei als unverändert festgelegter genetischer Information und veränderter Umwelt eine Modifikation. Der Kontrolldatenvergleich und die Modellvorgabe begründen diese Zuordnung.',
        'In the supplied model, a trait change with genetic information stipulated unchanged and an altered environment is a modification. Control-data comparison and the model stipulation justify the classification.',
        'Die lernende Person verknüpft bei L/H die unterschiedliche Lichtbedingung mit 12/20 und die gleiche Kontrollbedingung mit 16/16. Sie benennt die stipulierte Informationskonstanz und begrenzt den einzelnen Sequenzbefund auf den untersuchten Abschnitt.',
        'The learner relates different light conditions for L/H to 12/20 and equal control conditions to 16/16. The learner identifies the stipulated information constancy and bounds the individual sequence finding to the assayed section.'),
    expectation('genetic-change-and-appearance',
        'Eine bestätigte bleibende DNA-Änderung ist eine Mutation auch ohne sichtbaren Merkmalsunterschied. Gleicher Blattwert und unterschiedlicher Blattwert allein bestimmen die genetische Ursache nicht.',
        'A confirmed persistent DNA change is a mutation even without a visible trait difference. Neither equal nor different leaf values alone determine the genetic cause.',
        'Die lernende Person begründet M als Mutationsfall trotz Blattwert 16 und erklärt, weshalb der äußerliche Vergleich genetische Daten nicht ersetzt.',
        'The learner justifies M as a mutation case despite leaf value 16 and explains why appearance comparison does not replace genetic data.'),
    expectation('coexisting-contributions-and-causal-limits',
        'Eine bestätigte genetische Variante kann neben einer zusätzlichen Umweltwirkung bestehen. Der zeitweilige Temperaturbeitrag wird im Material von der bleibenden Sequenzvariante getrennt; deren alleinige Verursachung aller Ausgangsunterschiede ist nicht gemessen.',
        'A confirmed genetic variant can coexist with an additional environmental effect. The material separates the temporary temperature contribution from the persistent sequence variant; sole causation of all starting differences by that variant is not measured.',
        'Die lernende Person trennt A/B 8/10 und deren bleibenden Sequenzunterschied von 14/16 bei erhöhter Temperatur sowie der Rückkehr zu 8/10; sie begründet den zusätzlichen Umweltbeitrag ohne der einzelnen Variante jede Differenz kausal zuzuordnen.',
        'The learner separates A/B 8/10 and their persistent sequence difference from 14/16 at higher temperature and return to 8/10, explaining the additional environmental contribution without causally assigning every difference to the single variant.'),
], [
    axis('appearance-and-dna-evidence', 'Unterschiedliche Merkmale bei unverändert festgelegter Erbinformation mit gleicher Erscheinung trotz bestätigter DNA-Änderung vergleichen.', 'Compare different traits with genetic information stipulated unchanged against equal appearance despite a confirmed DNA change.'),
    axis('environmental-effect-on-genetic-variants', 'Vom Lichtvergleich genetisch gleicher Klone zu einem Temperaturwechsel bei bestehenden genetischen Varianten wechseln und beide Beiträge getrennt halten.', 'Move from a light comparison of genetically identical clones to a temperature shift in existing genetic variants and keep the two contributions separate.'),
], [
    case('mutation-modification-a',
        'Nutze mutation-modification-a unverändert: Klone mit im Modell unveränderter Erbinformation, L/H 12/20 bei verschiedenem Licht, neue Stecklinge 16/16 bei gleichem Licht; M mit bestätigter DNA-Änderung ebenfalls 16. Begründe die beiden Arten des Befunds und ihre Grenzen.',
        'Use mutation-modification-a unchanged: clones with genetic information unchanged by model stipulation, L/H 12/20 under different light, new cuttings 16/16 under equal light; M with confirmed DNA change also 16. Justify both kinds of finding and their limits.',
        'L/H werden mit Umwelt- und genetischer Kontrolle als Modifikation begründet; die Gleichlichtkontrolle passt zum angegebenen Umweltzusammenhang. M ist aufgrund bestätigter DNA-Änderung eine Mutation trotz gleichem Blattwert. Der einzelne gemessene Abschnitt ist kein alleiniger Nachweis vollständiger Genomgleichheit außerhalb der Modellvorgabe.',
        'L/H are justified as modifications using environmental and genetic controls; the equal-light control fits the supplied environmental relationship. M is a mutation because of confirmed DNA change despite equal leaf value. The individually assayed region alone does not establish whole-genome equality beyond the model stipulation.',
        'Kontrolldaten statt bloßer Erscheinung und die unterschiedliche Reichweite von Modellvorgabe und Messung.',
        'Control data rather than appearance alone, and the different scope of model stipulation and measurement.'),
    case('mutation-modification-b',
        'Nutze mutation-modification-b unverändert: A/B 8/10 mit bestätigtem DNA-Unterschied,14/16 bei erhöhter Temperatur ohne weitere Sequenzänderung, Rückkehr zu 8/10. Trenne die bestätigte Variante und Umweltwirkung und begründe offene Kausalfragen.',
        'Use mutation-modification-b unchanged: A/B 8/10 with confirmed DNA difference,14/16 at higher temperature without further sequence change, return to 8/10. Separate the confirmed variant and environmental effect and justify open causal questions.',
        'Die genetische Variante bleibt bei beiden Temperaturen bestehen; der zusätzliche Betrag sechs ist im vorgegebenen Modell temperaturabhängige Modifikation. Der eine Sequenzunterschied beweist nicht, dass er allein 8/10 verursacht. Die beobachtete Rückkehr betrifft diesen Fall und begründet keine allgemeine Reversibilitätsregel für jede Modifikation.',
        'The genetic variant persists at both temperatures; the additional six units are temperature-dependent modification in the supplied model. The single sequence difference does not prove that it alone causes 8/10. Observed return concerns this case and establishes no universal reversibility rule for every modification.',
        'Transfer auf gleichzeitig vorhandene genetische Variante und Umweltwirkung mit ausdrücklich begrenzter Ursachenzuschreibung.',
        'Transfer to coexisting genetic variation and environmental effect with explicitly bounded causal attribution.'),
], 'Die Informationskonstanz in Fall a ist eine ausdrücklich vorgegebene Modellbedingung, nicht aus einem einzigen Sequenzabschnitt abgeleitet. Der zeitweilige Fall b wird nicht zur allgemeinen Aussage, alle Modifikationen seien reversibel.')

profile('aab2a358-b2ee-57a5-a957-8fb9845506b1', 'modeling', [
    expectation('template-based-correction',
        'Im vorgegebenen einfachen Modell sind die intakte alte Vorlage und der neue Strang markiert. Die Regel A–T/C–G ermöglicht die Kontrolle der Paarungen und die Wiederherstellung des neuen Bausteins anhand der intakten Vorlage.',
        'In the supplied simple model, the intact old template and new strand are marked. The A–T/C–G rule permits checking pairings and restoring the new unit using the intact template.',
        'Die lernende Person lokalisiert die Fehlpaarung jeweils an Position 3 und begründet anhand der angegebenen Orientierung und Vorlage die richtige neue Kopie 5′–ATGC–3′ beziehungsweise 5′–CATG–3′.',
        'The learner locates each mispairing at position 3 and uses the supplied orientation and template to justify the correct new copy 5′–ATGC–3′ or 5′–CATG–3′.'),
    expectation('checking-repair-information',
        'Kontrolle erkennt eine Fehlpaarung; Reparatur entfernt und ersetzt im Modell den falschen neuen Baustein. Erst die Korrektur stellt die vorgesehene Information wieder her; Erkennen allein bewirkt diese Wiederherstellung nicht.',
        'Checking identifies a mispairing; repair removes and replaces the wrong new unit in the model. Correction restores the intended information; detection alone does not bring about that restoration.',
        'Die lernende Person erklärt den unterschiedlichen Verlauf bei R und N und verfolgt, wie eine unkorrigierte Kopie im vorgegebenen weiteren Verdopplungsmodell auch dauerhaft geänderte Tochter-Duplexe hervorbringen kann.',
        'The learner explains the different outcomes with R and N and traces how an uncorrected copy can also produce persistently changed daughter duplexes in the supplied further-copying model.'),
    expectation('mismatch-not-yet-fixed-mutation',
        'Eine zunächst fehlerhafte Paarung ist nicht automatisch eine bleibende Mutation. Korrektur kann eine Fixierung verhindern; die nicht korrigierten Fehler und der weitere Kopierverlauf begrenzen den Schutz.',
        'An initial mispairing is not automatically a persistent mutation. Correction can prevent fixation; uncorrected errors and subsequent copying limit the protection.' ,
        'Bei 30 gefundenen und 24 korrigierten Fehlpaarungen nennt die lernende Person sechs zunächst unkorrigierte Paarungen und erklärt, weshalb daraus weder 30 noch automatisch sechs dauerhafte Mutationen oder ein universeller realer Reparaturwirkungsgrad folgen.',
        'With 30 detected and 24 corrected mispairings, the learner identifies six initially uncorrected pairings and explains why these imply neither 30 nor automatically six persistent mutations or a universal real-world repair efficiency.'),
], [
    axis('different-intact-template-and-mispair', 'Zwischen den beiden vorgegebenen alten Vorlagen und neuen Fehlpaarungen wechseln; Orientierung, komplementäre Regel und markierten neuen Strang jeweils selbst nutzen.', 'Move between the two supplied old templates and new mispairings, independently using orientation, the complementary rule and the marked new strand in each.'),
    axis('repair-versus-detection-only', 'Von Kontrolle mit Korrektur zu Kontrolle ohne Korrektur wechseln und die gegebenen weiteren Kopierfolgen verfolgen.', 'Move from checking with correction to checking without correction and trace the supplied subsequent copying consequences.'),
    axis('count-versus-persistence', 'Zahlen gefundener/korrigierter Fehlpaarungen von einem Befund bleibender Tochter-Duplex-Änderung unterscheiden.', 'Distinguish counts of detected/corrected mispairings from evidence of persistent change in daughter duplexes.'),
], [
    case('repair-a',
        'Nutze repair-a unverändert: alte Vorlage 3′–TACG–5′, markierter neuer Strang 5′–ATAC–3′, Regel A–T/C–G,30 Fehlpaarungen unter 10000 Positionen und 24 Korrekturen. Lokalisiere/korrigiere und erkläre den Beitrag zur Informationserhaltung samt Grenze.',
        'Use repair-a unchanged: old template 3′–TACG–5′, marked new strand 5′–ATAC–3′, A–T/C–G rule,30 mispairings among 10000 positions and 24 corrections. Locate/correct and explain the contribution to information preservation and its limit.',
        'An Position 3 steht C–A statt C–G; der neue Strang muss 5′–ATGC–3′ lauten. Kontrolle findet die Fehlpaarung, Reparatur ersetzt den neuen Baustein nach der intakten Vorlage. Sechs bleiben zunächst unkorrigiert; der weitere Verlauf entscheidet über bleibende Änderung.30 Fehlpaarungen sind keine 30 dauerhaften Mutationen.',
        'Position 3 is C–A instead of C–G; the new strand must be5′–ATGC–3′. Checking detects the mispairing and repair replaces the new unit according to the intact template. Six initially remain uncorrected; subsequent events determine persistent change.30 mispairings are not 30 persistent mutations.',
        'Komplementäre Modellkorrektur, Informationskonstanz und Unterschied zwischen Fehlpaarungszählung und Fixierung.',
        'Complementary model correction, information constancy and the distinction between counting mispairings and fixation.'),
    case('repair-b',
        'Nutze repair-b unverändert: alte Vorlage 3′–GTAC–5′, neue Kopie 5′–CAGG–3′; R korrigiert, N erkennt nur. Nach weiterer Verdopplung liefert die unkorrigierte Kopie auch dauerhaft geänderte Tochter-Duplexe. Bestimme die richtige Kopie und begründe den Unterschied.',
        'Use repair-b unchanged: old template 3′–GTAC–5′, new copy 5′–CAGG–3′; R corrects while N only detects. After further copying, the uncorrected copy also yields persistently changed daughter duplexes. Determine the correct copy and justify the difference.',
        'Position 3 braucht T statt G gegenüber A; richtig ist 5′–CATG–3′. R entfernt/ersetzt den falschen neuen Baustein anhand der Vorlage, N lässt ihn bestehen. Die gegebene Folgekopie erklärt mögliche Fixierung; Erkennen allein sichert die Information nicht, und das Einzelfallmodell misst keine universelle reale Fehler- oder Reparaturrate.',
        'Position 3 requires T instead of G opposite A; the correct copy is 5′–CATG–3′. R removes/replaces the wrong new unit using the template while N leaves it. The supplied further copying explains possible fixation; detection alone does not preserve information, and the single-case model measures no universal real error or repair rate.',
        'Sachhaltiger Transfer auf eine andere Vorlage und Erkennung ohne Reparatur unter derselben ausdrücklich intakten Vorlagenbedingung.',
        'Substantive transfer to another template and detection without repair under the same explicit intact-template condition.'),
], 'Die Korrektur folgt der ausdrücklich markierten intakten alten Vorlage und benötigt keine Kenntnis spezifischer Reparaturenzyme. Sechs unkorrigierte Paarungen werden nicht als sechs nachgewiesene bleibende Mutationen ausgegeben.')

BASE.mkdir(parents=True, exist_ok=True)
ordered = []
scope_rows = []
for row in inputs['rows']:
    goal_id = row['goalId']
    body = profiles[goal_id]
    material_ids = [c['caseBody'].get('caseId', c['caseBody'].get('caseKey')) for c in row['currentSourceCaseBodies']]
    assert [case['id'] for case in body['applicationCaseBriefs']] == material_ids
    ordered.append(dict(goalId=goal_id,
        reason='Zielbezogenes Autorenprofil aus den unveränderten vollständigen Materialien '+', '.join(material_ids)+'. '+case_notes[goal_id]+' KI-Kandidat E1/G1; keine Lernendenleistung, keine unabhängige P-Freigabe und keine menschliche Freigabe.',
        evidenceLevel='E1', maximumClaimScope='G1', dissent=[], profile=body))
    scope_rows.append(dict(goalId=goal_id, title=row['wholeCurrentCandidateGoal']['title'],
        caseKeys=material_ids, currentGoalFingerprint=row['goalFingerprint'], currentReviewInputFingerprint=row['reviewInputFingerprint'],
        caseBriefsAreSummariesOfExactlyBoundOriginalCases=True, sourceCaseBodiesChanged=False,
        scopeAndBoundaryRationale=case_notes[goal_id], independentPApproval=False))
candidate_set=dict(schemaVersion=1, authoringContract='positive-understanding-evidence-candidates-v1',
    reviewId=input_config['reviewId'], reviewedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),
    reviewer='Codex Biology final seven P-v2 profile author /root/biology_q1_seven_visuals_independent_v; separate independent P reviews pending', goals=ordered)
(BASE/'seven-positive-profile-specifications.author-candidate.json').write_text(json.dumps(candidate_set,ensure_ascii=False,indent=2)+'\n')
(BASE/'seven-profile-scope-case-and-boundary-rationales.author.json').write_text(json.dumps(dict(schemaVersion=1,role='author content choices, not independent review',rows=scope_rows,profilesCreated=7,sourceCasesUsed=16,sourceCasesInvented=0,humanApproval=False,learnerEvidence=False),ensure_ascii=False,indent=2)+'\n')
print(json.dumps(dict(authorProfiles=len(ordered),caseBriefs=sum(len(g['profile']['applicationCaseBriefs']) for g in ordered),newSourceCases=0,status='ai_candidate / needs_human_review')))
