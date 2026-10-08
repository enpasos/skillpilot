"""Build inert, individually authored Economics E2 translation/P-v2 candidates.

Software: Apache-2.0; own curriculum/evidence text: CC-BY-4.0.
This authoring helper never writes an active curriculum or QA registry.
"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import copy

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
SOURCE = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
REVIEW_ID = 'canonical-economics-e2-twenty-positive-author-20261008-v1'
REVIEWER = 'codex-economics-e2-author-candidate-20261008-v1'
ENTRIES = []


def add(title_en, description_en, archetype, expectation, cases, axes):
    # All bilingual tuples below are content authoring, not generated verdicts.
    ENTRIES.append(dict(titleEn=title_en, descriptionEn=description_en,
                        archetype=archetype, expectation=expectation,
                        cases=cases, axes=axes))


add('Measure growth and quality of life',
    'The learner can compare indicators of growth and quality of life.', 'data',
    ('Ein Wachstumsindikator misst eine bestimmte wirtschaftliche Veränderung; Lebensqualität umfasst weitere Dimensionen. Vergleichbare Bezugsgrößen, reale statt nur nominale Veränderungen und die Auswahl der Dimensionen bestimmen, welche Aussage ein Indikator trägt.',
     'A growth indicator measures a particular economic change; quality of life includes further dimensions. Comparable reference quantities, real rather than merely nominal changes, and the selected dimensions determine what an indicator can establish.',
     'Die Person vergleicht gegebene Wachstums- und Lebensqualitätsdaten, benennt Einheit und Bezugsgröße, erklärt eine abweichende Rangfolge und begründet, welche zusätzliche Information für die konkrete Frage benötigt wird.',
     'The learner compares supplied growth and quality-of-life data, identifies units and reference quantities, explains a conflicting ranking, and justifies what further information the specific question requires.'),
    [('real-growth', 'Für eine Volkswirtschaft werden nominales Wachstum von 5 %, reales Wachstum von 2 % und ein Bevölkerungsanstieg genannt. Beurteile die Behauptung, jede Person könne nun 5 % mehr Güter konsumieren.',
      'For an economy, nominal growth of 5%, real growth of 2%, and population growth are supplied. Assess the claim that every person can now consume 5% more goods.',
      'Die Person trennt Preis- und Mengenänderung, Gesamt- und Pro-Kopf-Größe sowie gesamtwirtschaftlichen Durchschnitt und individuelle Verteilung; die Behauptung ist durch die Daten nicht gedeckt.',
      'The learner distinguishes price from quantity changes, aggregate from per-capita measures, and an economy-wide average from individual distribution; the data do not support the claim.',
      'Bezugsgröße und Reichweite eines Wachstumsindikators.', 'Reference quantity and scope of a growth indicator.'),
     ('quality-divergence', 'Region A hat stärkeres reales Pro-Kopf-Wachstum, Region B kürzere Pendelzeiten und bessere Luft. Vergleiche die Lebensqualität für eine Person, die Gesundheit und freie Zeit hoch gewichtet.',
      'Region A has stronger real per-capita growth; region B has shorter commutes and better air. Compare quality of life for someone who places high weight on health and free time.',
      'Die Person benennt die jeweils gemessenen Dimensionen und begründet das Urteil mit der offen gelegten Gewichtung; sie leitet keine universelle Rangfolge allein aus dem Wachstum ab.',
      'The learner identifies the measured dimensions and justifies the judgement using the explicit weighting; growth alone does not establish a universal ranking.',
      'Indikatorauswahl und begründete Gewichtung.', 'Indicator selection and justified weighting.')],
    [('reference-quantity', 'Gesamtwert, Pro-Kopf-Wert sowie nominale oder reale Veränderung.', 'Aggregate, per-capita, nominal, or real change.'),
     ('quality-dimension', 'Materielle Möglichkeiten, Gesundheit, Umwelt oder verfügbare Zeit.', 'Material opportunities, health, environment, or available time.')])

add('Assess business concentration',
    'The learner can explain opportunities and risks of business concentration.', 'concept',
    ('Zusammenschlüsse können Größen- und Verbundvorteile eröffnen und gleichzeitig Wettbewerbsdruck verringern. Folgen hängen unter anderem von Kostenstruktur, Alternativen der Nachfrager und Markteintrittsmöglichkeiten ab; Konzentration allein beweist weder Schaden noch Vorteil.',
     'Mergers can create economies of scale and scope while reducing competitive pressure. Effects depend on cost structures, buyers\' alternatives, and opportunities for entry; concentration alone proves neither harm nor benefit.',
     'Die Person erläutert für einen neuen Konzentrationsfall eine mögliche Effizienzwirkung und ein konkretes Wettbewerbsrisiko, verbindet beide mit Fallangaben und formuliert ein bedingtes Urteil.',
     'For a new concentration case, the learner explains a possible efficiency effect and a specific competition risk, connects both to the supplied facts, and gives a conditional judgement.'),
    [('shared-production', 'Zwei Hersteller könnten nach einer Fusion eine teure Produktionsanlage gemeinsam nutzen. Kunden könnten weiterhin zu mehreren Lieferanten wechseln. Erläutere Chancen und Risiken.',
      'Two producers could share an expensive production facility after merging. Customers would still be able to switch to several suppliers. Explain opportunities and risks.',
      'Die Person erklärt mögliche niedrigere Stückkosten durch bessere Anlagenauslastung, trennt Kostensenkung von sicherer Preisweitergabe und berücksichtigt die verbliebenen Wechselmöglichkeiten.',
      'The learner explains potentially lower unit costs through better capacity use, separates cost savings from guaranteed pass-through to prices, and considers the remaining switching options.',
      'Effizienzmechanismus und Wettbewerbsbedingungen.', 'Efficiency mechanism and competitive conditions.'),
     ('local-last-suppliers', 'Die einzigen zwei Busanbieter einer Region wollen fusionieren; ein Markteintritt wäre teuer. Gemeinsame Disposition könnte Leerfahrten senken. Erläutere die Ambivalenz.',
      'The only two bus operators in a region want to merge; entry would be expensive. Shared scheduling could reduce empty trips. Explain the ambiguity.',
      'Die Person verbindet das mögliche Einsparpotenzial mit Disposition und erklärt zugleich den Verlust einer Ausweichoption sowie Preis- und Qualitätsrisiken bei erschwertem Eintritt.',
      'The learner connects possible savings to scheduling while explaining the lost alternative and risks to prices and quality when entry is difficult.',
      'Effizienzvorteil ist kein automatischer Nachweis wirksamen Wettbewerbs.', 'An efficiency benefit does not automatically establish effective competition.')],
    [('entry-options', 'Leichter oder erschwerter Markteintritt und viele oder wenige Ausweichanbieter.', 'Easy or difficult entry and many or few alternative suppliers.'),
     ('cost-structure', 'Hohe Fixkosten, Verbundvorteile oder kaum belegte Synergien.', 'High fixed costs, economies of scope, or weakly supported synergies.')])

add('Describe ecological challenges',
    'The learner can outline ecological problems in market-based economic systems.', 'concept',
    ('Umweltprobleme können entstehen, wenn private Entscheidungen Belastungen Dritter oder knapper Naturressourcen nicht hinreichend berücksichtigen. Ursachen, betroffene Umweltmedien und räumliche Reichweite müssen am konkreten Problem unterschieden werden.',
     'Environmental problems can arise when private decisions insufficiently account for burdens on others or scarce natural resources. Causes, affected environmental media, and geographic reach must be distinguished for the specific problem.',
     'Die Person skizziert vom wirtschaftlichen Handeln über eine konkrete Belastung bis zu Betroffenen eine plausible Wirkungskette und ordnet Reichweite sowie Anreizproblem anhand gegebener Angaben ein.',
     'The learner outlines a plausible chain from economic activity through a specific environmental burden to affected parties and identifies its reach and incentive problem using supplied facts.'),
    [('river-pollution', 'Ein Betrieb spart Reinigungskosten und leitet Schadstoffe in einen Fluss; flussabwärts entstehen Aufbereitungskosten. Skizziere das Umweltproblem und die Anreize.',
      'A firm saves treatment costs and discharges pollutants into a river; downstream users incur water-treatment costs. Outline the environmental problem and incentives.',
      'Die Person verknüpft private Kostenersparnis, Wasserbelastung und Kosten Dritter; sie beschreibt ein regionales Problem und erklärt, weshalb die private Kalkulation den Schaden nicht vollständig erfasst.',
      'The learner links private cost savings, water pollution, and costs to others, describes a regional problem, and explains why private calculations do not fully account for the harm.',
      'Wirtschaftlicher Anreiz und Umweltwirkung.', 'Economic incentive and environmental effect.'),
     ('shared-fish-stock', 'Mehrere Betriebe fischen aus einem gemeinsam zugänglichen Bestand. Jeder zusätzliche Fang bringt privaten Erlös, während der Bestand langfristig sinkt. Skizziere den Konflikt.',
      'Several businesses fish from a commonly accessible stock. Each additional catch brings private revenue while the stock declines in the long run. Outline the conflict.',
      'Die Person beschreibt rivalisierende Nutzung einer gemeinsamen erneuerbaren Ressource und die Übernutzung, wenn individuelle Fangvorteile von Bestandsfolgen für alle getrennt sind.',
      'The learner describes rival use of a shared renewable resource and overuse when individual gains from catches are separated from stock effects on everyone.',
      'Inputproblem und zeitliche Bestandswirkung.', 'Resource-use problem and effects on the stock over time.')],
    [('environmental-medium', 'Wasser, Luft oder gemeinsam genutzter Ressourcenbestand.', 'Water, air, or a commonly used resource stock.'),
     ('spatial-time-scale', 'Lokale oder überregionale Wirkung und kurzfristiger Nutzen oder langfristige Belastung.', 'Local or wider effects and short-term gain or long-term burden.')])

add('Explain environmental policy in a multilevel system',
    'The learner can describe environmental-policy instruments and conflicts.', 'concept',
    ('Umweltpolitische Instrumente verändern Handlungsanreize oder zulässige Handlungen. Im Mehrebenensystem können gemeinsame Ziele und dezentrale Durchführung verbunden sein; Zuständigkeit, räumliche Wirkung und Verteilung von Kosten beeinflussen Konflikte.',
     'Environmental-policy instruments change incentives or permissible actions. A multilevel system can combine shared goals with decentralised implementation; authority, geographic effects, and cost distribution influence conflicts.',
     'Die Person beschreibt für einen gegebenen Fall die Wirkung eines Instruments, die im Material genannten politischen Ebenen und einen begründeten Konflikt zwischen Zuständigkeit, Wirkung oder Kosten.',
     'For a supplied case, the learner describes an instrument\'s mechanism, the policy levels specified in the materials, and a justified conflict involving authority, effects, or costs.'),
    [('shared-target-local-measures', 'Im Planspiel setzt die gemeinsame europäische Ebene ein Emissionsziel; der Bund legt Rahmenregeln fest, ein Land setzt Genehmigungen um. Beschreibe die Rollen und einen möglichen Konflikt.',
      'In a simulation, the joint European level sets an emissions target, the federal level establishes framework rules, and a state implements permits. Describe the roles and a possible conflict.',
      'Die Person trennt Zielsetzung, Rahmenregeln und Umsetzung gemäß den vorgegebenen Zuständigkeiten und erklärt beispielsweise, wie lokale Belastungen mit einem gemeinsamen Ziel kollidieren können.',
      'The learner distinguishes target setting, framework rules, and implementation under the stipulated responsibilities and explains, for example, how local burdens can conflict with a shared target.',
      'Koordination zwischen Ebenen anhand ausgewiesener Zuständigkeiten.', 'Coordination among levels using explicit responsibilities.'),
     ('border-river', 'Zwei Regionen teilen einen Fluss. Eine erwägt ein Einleitungsverbot, die andere eine Abgabe. Beschreibe die Instrumente und warum Abstimmung nötig sein kann.',
      'Two regions share a river. One considers a discharge ban, the other a charge. Describe the instruments and why coordination may be needed.',
      'Die Person unterscheidet rechtliche Begrenzung und finanziellen Anreiz und erläutert grenzüberschreitende Wasserwirkungen sowie mögliche Verlagerung von Belastungen.',
      'The learner distinguishes a legal restriction from a financial incentive and explains cross-border water effects and possible displacement of burdens.',
      'Reichweite eines Problems und Reichweite einer Maßnahme.', 'Reach of a problem and reach of a measure.')],
    [('instrument', 'Verbot, Abgabe, Subvention oder handelbare Berechtigung.', 'Ban, charge, subsidy, or tradable permit.'),
     ('responsibility', 'Im Fall ausdrücklich angegebene gemeinsame, nationale oder regionale Zuständigkeit.', 'Joint, national, or regional authority explicitly supplied in the case.')])

add('Analyse environmental-policy debates',
    'The learner can analyse political conflicts over environmental policy.', 'concept',
    ('Ein umweltpolitischer Konflikt verbindet unterschiedliche Interessen, Wertmaßstäbe und Behauptungen über Wirkungen. Sachbehauptungen sind mit Material zu prüfen; normative Gewichtungen und Verteilungsfragen erklären, warum Akteure trotz gemeinsamer Umweltziele widersprechen.',
     'An environmental-policy conflict combines different interests, value criteria, and claims about effects. Factual claims must be assessed against evidence; normative weights and distributional questions explain disagreement despite shared environmental aims.',
     'Die Person rekonstruiert aus kurzen Positionen die Interessen und Maßstäbe mehrerer Akteure, prüft eine Sachbehauptung anhand gegebener Daten und erläutert den konkreten Konflikt ohne Personenstereotype.',
     'Using short position statements, the learner reconstructs several actors\' interests and criteria, assesses a factual claim against supplied data, and explains the specific conflict without stereotyping people.'),
    [('traffic-restriction', 'Anwohner fordern eine Verkehrsbeschränkung wegen Luftbelastung; Lieferbetriebe befürchten zusätzliche Kosten. Messdaten und zwei Stellungnahmen liegen vor. Analysiere den Konflikt.',
      'Residents demand a traffic restriction because of air pollution; delivery firms fear additional costs. Measurements and two statements are supplied. Analyse the conflict.',
      'Die Person trennt die belegte Luftbelastung von offenen Kostenschätzungen und erklärt Gesundheitsschutz, Lieferzugang sowie unterschiedliche Lasten als konkrete Konfliktlinien.',
      'The learner separates measured air pollution from uncertain cost estimates and explains health protection, delivery access, and differing burdens as specific lines of conflict.',
      'Evidenzprüfung und Interessengegensatz.', 'Assessment of evidence and conflicting interests.'),
     ('renewable-site', 'Eine Gemeinde diskutiert eine Windanlage; Positionen betreffen Klimaschutz, Landschaft, Lärm und lokale Einnahmen. Ordne Sach- und Wertargumente und erläutere einen Kompromisskonflikt.',
      'A municipality debates a wind installation; positions concern climate protection, landscape, noise, and local revenue. Distinguish factual and value arguments and explain a conflict surrounding compromise.',
      'Die Person benennt prüfbare Wirkungsbehauptungen und normative Gewichtungen, erläutert betroffene Gruppen anhand der Positionen und zeigt, welche Interessen ein Kompromiss berücksichtigt oder offenlässt.',
      'The learner identifies testable effect claims and normative weights, explains the affected groups using their statements, and shows which interests a compromise addresses or leaves unresolved.',
      'Politische Abwägung bleibt nachvollziehbar begründet.', 'Political weighing remains transparently justified.')],
    [('conflict-object', 'Mobilität, Energie oder lokale Umweltbelastung.', 'Mobility, energy, or local environmental burdens.'),
     ('argument-type', 'Messbare Wirkung, unsichere Prognose, Interesse oder Wertmaßstab.', 'Measured effect, uncertain prediction, interest, or value criterion.')])

add('Understand consumer behaviour',
    'The learner can discuss patterns in consumers\' decisions.', 'concept',
    ('Konsumentscheidungen stehen unter Budget-, Informations- und Zeitrestriktionen und spiegeln Präferenzen sowie soziale und ökologische Verantwortung. Unterschiedliche Entscheidungen können nachvollziehbare Gründe haben; beobachtetes Verhalten allein beweist keine bestimmte Motivation.',
     'Consumption decisions are constrained by budget, information, and time and reflect preferences alongside social and environmental responsibility. Different decisions can have understandable reasons; behaviour alone does not prove a particular motivation.',
     'Die Person erläutert in einem neuen Fall das Zusammenspiel von Budget, Bedürfnissen, verfügbaren Informationen und Verantwortung und vergleicht nachvollziehbare Entscheidungsmuster ohne eine einzig richtige Präferenz zu unterstellen.',
     'For a new case, the learner explains the interaction of budget, needs, available information, and responsibility and compares understandable decision patterns without presuming one correct preference.'),
    [('budget-choice', 'Zwei Jugendliche haben verschieden große Budgets und unterschiedliche Wege zur Schule. Beide wählen zwischen Fahrradreparatur, Monatskarte und Freizeitkauf. Diskutiere Entscheidungsmuster.',
      'Two young people have different budgets and different school commutes. Both choose among bicycle repair, a monthly travel pass, and a leisure purchase. Discuss decision patterns.',
      'Die Person verbindet Auswahl mit Budget und konkreten Bedürfnissen und erklärt Opportunitätskosten; sie folgert aus unterschiedlichen Käufen nicht automatisch Irrationalität.',
      'The learner connects choices to budgets and specific needs and explains opportunity costs; different purchases do not automatically imply irrationality.',
      'Präferenzen und Restriktionen gemeinsam erklären die Auswahl.', 'Preferences and constraints jointly explain the choice.'),
     ('private-and-social', 'Ein billiges Einwegprodukt und eine langlebige Alternative unterscheiden sich in Anschaffungspreis, Lebensdauer und Umweltfolgen. Diskutiere mögliche Konsumentscheidungen.',
      'A cheap disposable product and a durable alternative differ in purchase price, lifetime, and environmental effects. Discuss possible consumer choices.',
      'Die Person berücksichtigt Anfangsbudget, erwartete Gesamtkosten, Nutzungsbedarf und Umweltverantwortung; sie kennzeichnet fehlende Informationen und begründet verschiedene zulässige Gewichtungen.',
      'The learner considers the initial budget, expected total costs, use requirements, and environmental responsibility, flags missing information, and justifies different defensible weightings.',
      'Eigeninteresse und gesellschaftliche Folgen können auseinanderfallen.', 'Private interests and social effects can diverge.')],
    [('budget-information', 'Veränderung des verfügbaren Budgets oder der Kosten- und Qualitätsinformation.', 'Changes in available budget or cost and quality information.'),
     ('preference-responsibility', 'Unterschiedlicher Nutzungsbedarf und unterschiedliche Gewichtung sozialer oder ökologischer Folgen.', 'Different use needs and weights on social or environmental effects.')])

add('Explain business financing',
    'The learner can explain financing and liability issues for businesses.', 'concept',
    ('Eigenkapital und Fremdkapital unterscheiden sich in Rückzahlungsanspruch, Vergütung, Risiko und Einfluss. Wer persönlich für Schulden haftet, folgt der im Fall angegebenen Unternehmensform und etwaigen Sicherheiten; die Herkunft des Geldes allein legt dies nicht fest.',
     'Equity and debt differ in repayment claims, remuneration, risk, and influence. Personal liability for debts follows the business form and any security stipulated in the case; the source of funds alone does not determine it.',
     'Die Person erklärt an einem konkreten Finanzierungsvorhaben die Rolle von Eigen- und Fremdkapital und ordnet Haftung anhand ausdrücklich gegebener Rechtsform- und Vertragsbedingungen zu.',
     'For a specific financing project, the learner explains the role of equity and debt and identifies liability using explicit business-form and contractual conditions.'),
    [('loan-and-equity', 'Ein Unternehmen benötigt 60.000 Euro: 20.000 Euro werden als Beteiligung eingebracht, 40.000 Euro als verzinslicher Kredit mit festem Rückzahlungsplan. Erläutere Unterschiede.',
      'A business needs EUR 60,000: EUR 20,000 is contributed as equity and EUR 40,000 as an interest-bearing loan with a fixed repayment schedule. Explain the differences.',
      'Die Person unterscheidet Beteiligung und Rückzahlungsanspruch, nennt die Liquiditätsbelastung des Kredits und beschreibt die vereinbarten Mitwirkungsrechte der Beteiligung, soweit Angaben vorliegen.',
      'The learner distinguishes ownership participation from a repayment claim, identifies the loan\'s cash-flow burden, and describes agreed participation rights where supplied.',
      'Kapitalbereitstellung erzeugt verschiedene Ansprüche.', 'Providing capital creates different claims.'),
     ('liability-conditions', 'Fall A nennt persönliche Haftung einer Unternehmerin. Fall B nennt eine Gesellschaft mit grundsätzlich begrenzter Gesellschafterhaftung, deren Eigentümer aber eine persönliche Kreditbürgschaft übernimmt. Erläutere das Risiko.',
      'Case A specifies an entrepreneur\'s personal liability. Case B specifies a company with generally limited shareholder liability whose owner nevertheless gives a personal guarantee for a loan. Explain the risk.',
      'Die Person ordnet die persönliche Haftung in A der vorgegebenen Form und das zusätzliche persönliche Risiko in B der Bürgschaft zu; begrenzte Haftung bedeutet weder risikolose Beteiligung noch Schutz vor jeder eigenen Verpflichtung.',
      'The learner attributes personal liability in A to the stipulated form and additional personal exposure in B to the guarantee; limited liability does not mean risk-free equity or protection from every personal obligation.',
      'Rechtsform und zusätzliche Sicherung werden getrennt geprüft.', 'Business form and additional security are examined separately.')],
    [('capital-form', 'Beteiligung oder Kredit mit unterschiedlichen Zahlungsansprüchen.', 'Equity participation or loans with different payment claims.'),
     ('liability-security', 'Ausdrücklich vorgegebene persönliche Haftung, begrenzte Haftung oder zusätzliche Bürgschaft.', 'Explicitly stipulated personal liability, limited liability, or an additional guarantee.')])

add('Measure prosperity using different dimensions',
    'The learner can distinguish and interpret GDP, the HDI, and ecological indicators.', 'data',
    ('BIP beschreibt die wirtschaftliche Produktion innerhalb eines Gebiets, der HDI bündelt Gesundheit, Bildung und materiellen Lebensstandard; ökologische Indikatoren erfassen ausgewählte Umweltwirkungen. Die Maßzahlen beantworten unterschiedliche Fragen und begründen nicht allein eine vollständige Wohlstandsbewertung.',
     'GDP describes economic production within a territory; the HDI combines health, education, and material living standards; ecological indicators capture selected environmental effects. These measures answer different questions and do not alone establish a complete prosperity assessment.',
     'Die Person liest bereitgestellte BIP-, HDI- und Umweltdaten, erklärt unterschiedliche Ergebnisse aus den gemessenen Dimensionen und benennt eine für das Urteil relevante nicht erfasste Dimension.',
     'The learner reads supplied GDP, HDI, and environmental data, explains different results through their measured dimensions, and identifies a relevant dimension not captured by the measures.'),
    [('three-indicators', 'A hat höheres BIP pro Kopf, B höheren HDI und geringere Pro-Kopf-Emissionen. Erläutere, was jede Angabe zeigt und warum kein Widerspruch vorliegt.',
      'A has higher GDP per capita; B has a higher HDI and lower per-capita emissions. Explain what each value shows and why there is no contradiction.',
      'Die Person trennt Produktion, kombinierte menschliche Entwicklung und Umweltbelastung und erklärt, dass Bildung/Gesundheit sowie Umweltwirkungen bei ähnlicher oder geringerer Produktion anders ausfallen können.',
      'The learner distinguishes production, combined human development, and environmental burdens and explains that education, health, and environmental effects can differ despite similar or lower production.',
      'Verschiedene Dimensionen tragen unterschiedliche Urteile.', 'Different dimensions support different judgements.'),
     ('income-distribution-gap', 'Ein Land weist hohe durchschnittliche Produktion und hohen HDI auf; eine Tabelle zeigt zugleich große Einkommensunterschiede. Beurteile die Aussage, alle Haushalte hätten hohen Wohlstand.',
      'A country has high average production and a high HDI; a table also shows large income differences. Assess the claim that all households enjoy high prosperity.',
      'Die Person erklärt die Grenze durchschnittlicher Aggregate, nutzt die Verteilungsdaten und benennt, dass der HDI nicht jede Verteilungs- oder Umweltfrage abbildet.',
      'The learner explains the limits of aggregate averages, uses the distribution data, and identifies that the HDI does not capture every distributional or environmental question.',
      'Durchschnittliche Entwicklung ist keine Aussage über jeden Haushalt.', 'Average development is not a statement about every household.')],
    [('indicator-dimension', 'Produktion, Gesundheit/Bildung/Lebensstandard oder Umweltbelastung.', 'Production, health/education/living standards, or environmental burdens.'),
     ('aggregation', 'Gesamtwert, Pro-Kopf-Durchschnitt oder ausgewiesene Verteilung.', 'Aggregate, per-capita average, or explicit distribution.')])

add('Assess competition-policy measures',
    'The learner can assess instruments addressing business concentration.', 'concept',
    ('Wettbewerbspolitische Maßnahmen müssen an einem belegten Wettbewerbsproblem ansetzen und Folgen für Ausweichmöglichkeiten, Markteintritt und Effizienz berücksichtigen. Größe oder Konzentration allein genügt nicht als fachliche Begründung einer beliebigen Maßnahme.',
     'Competition-policy measures must address an evidenced competition problem and consider effects on alternatives, entry, and efficiency. Size or concentration alone does not scientifically justify an arbitrary measure.',
     'Die Person vergleicht im gegebenen Konzentrationsfall mehrere Maßnahmen, erklärt ihren Wirkungsweg und bewertet Eignung sowie mögliche Nebenfolgen mit ausdrücklich genannten Wettbewerbskriterien.',
     'For a supplied concentration case, the learner compares several measures, explains their mechanism, and assesses suitability and possible side effects using explicit competition criteria.'),
    [('divestiture-or-ban', 'Nach einer geplanten Fusion bliebe örtlich nur ein Anbieter. Vorgeschlagen sind Untersagung oder Veräußerung eines Geschäftsbereichs an einen unabhängigen Wettbewerber. Vergleiche.',
      'A proposed merger would leave only one local supplier. The options are prohibition or selling a business unit to an independent competitor. Compare them.',
      'Die Person erläutert, wie die Optionen eine Ausweichmöglichkeit erhalten können, prüft die tatsächliche Unabhängigkeit des Erwerbers und wägt erhaltene Effizienzvorteile gegen Umsetzungsrisiken ab.',
      'The learner explains how the options can preserve an alternative, considers the buyer\'s actual independence, and weighs retained efficiencies against implementation risks.',
      'Passung einer Maßnahme zum konkreten Wettbewerbsproblem.', 'Fit of a measure to the specific competition problem.'),
     ('entry-barrier', 'Ein großer Anbieter beherrscht eine nötige Schnittstelle und erschwert neuen Anbietern den Zugang. Vorgeschlagen sind transparenter Zugang oder bloß eine Werbekampagne für kleinere Firmen. Bewerte.',
      'A large supplier controls a necessary interface and obstructs new suppliers\' access. The options are transparent access or merely advertising smaller firms. Assess them.',
      'Die Person verknüpft transparenten Zugang mit der konkret genannten Eintrittshürde und erklärt, weshalb Werbung allein die technische Zugangssperre nicht behebt; Aufsicht und Zugangskonditionen bleiben relevant.',
      'The learner links transparent access to the specified entry barrier and explains why advertising alone does not remove the technical blockage; oversight and access terms remain relevant.',
      'Ursachenbezogene Eignung statt bloßer Maßnahmenliste.', 'Cause-based suitability rather than a mere list of measures.')],
    [('competition-problem', 'Verlust einer Ausweichoption oder konkrete Markteintrittshürde.', 'Loss of an alternative or a specific entry barrier.'),
     ('measure-tradeoff', 'Untersagung, strukturelle Auflage oder Zugangsregel unter verschiedenen Effizienz- und Vollzugsbedingungen.', 'Prohibition, structural remedy, or access rule under different efficiency and enforcement conditions.')])

add('Explain behavioural aspects of consumption',
    'The learner can explain typical consumption decisions and biases.', 'concept',
    ('Konsumentscheidungen können durch begrenzte Aufmerksamkeit, Referenzpunkte und Darstellung systematisch beeinflusst werden. Eine Bias-Erklärung benötigt ein passendes Vergleichsmuster; abweichende Präferenzen oder ein hoher Preis allein beweisen keinen Bias.',
     'Consumption decisions can be systematically influenced by limited attention, reference points, and presentation. Explaining a bias requires a suitable comparison pattern; differing preferences or a high price alone do not establish one.',
     'Die Person erklärt anhand vergleichbarer Entscheidungssituationen einen konkreten Verhaltenseffekt, benennt den veränderten Einflussfaktor und grenzt alternative Erklärungen durch unterschiedliche Leistungen oder Präferenzen ab.',
     'Using comparable decision situations, the learner explains a specific behavioural effect, identifies the changed influence, and distinguishes alternative explanations based on different services or preferences.'),
    [('default-renewal', 'Ein Abo verlängert sich standardmäßig; ein sonst gleiches Angebot erfordert aktive Verlängerung. In einer fiktiven Vergleichsgruppe wird die Standardoption häufiger beibehalten. Erkläre.',
      'One subscription renews by default; an otherwise identical offer requires active renewal. In a fictional comparison group, the default is retained more frequently. Explain.',
      'Die Person erläutert den Einfluss von Standardoption, Wechselaufwand oder begrenzter Aufmerksamkeit und kennzeichnet, dass einzelne Verlängerungen dennoch bewusste Präferenzen ausdrücken können.',
      'The learner explains the influence of defaults, switching effort, or limited attention while noting that individual renewals may still reflect deliberate preferences.',
      'Systematischer Vergleich stützt die Verhaltenserklärung.', 'A systematic comparison supports the behavioural explanation.'),
     ('reference-price', 'Dasselbe Produkt kostet in zwei Anzeigen 40 Euro; nur eine nennt daneben einen hohen angeblichen früheren Preis. Beschreibe einen möglichen Wirkungspfad und seine Prüfgrenze.',
      'The same product costs EUR 40 in two advertisements; only one also lists a high alleged former price. Describe a possible effect and its evidential limit.',
      'Die Person erklärt den Referenzpreis als möglichen Anker der Preisbewertung, hält Produkte und Endpreise gleich und unterscheidet eine plausible Hypothese von bewiesenem individuellen Verhalten.',
      'The learner explains the reference price as a possible anchor for price evaluation, holds products and final prices constant, and distinguishes a plausible hypothesis from proven individual behaviour.',
      'Referenzwirkung ohne unbelegte Psychologisierung.', 'Reference effects without unsupported psychological attribution.')],
    [('presentation-default', 'Gleiche Leistung mit geändertem Bezugspreis oder geänderter Standardoption.', 'The same service with a changed reference price or default.'),
     ('information-attention', 'Vollständig sichtbare Gesamtkosten oder hohe Informations- und Aufmerksamkeitsanforderungen.', 'Fully visible total costs or demanding information and attention requirements.')])

add('Compare environmental-policy instruments',
    'The learner can assess taxes, permits, and requirements or bans at different policy levels (EU, federal, and state).', 'modeling',
    ('Eine Umweltsteuer setzt einen Preis für Belastung, ein handelbares Zertifikatesystem eine im Modell feste Gesamtmenge, eine Vorgabe eine zulässige Handlung oder Grenze. Wirkung, Kostenverteilung, Kontrolle und politisch gegebene Zuständigkeit müssen getrennt verglichen werden.',
     'An environmental tax sets a price on a burden; a tradable-permit scheme sets an aggregate quantity in the model; a requirement specifies a permissible action or limit. Effects, cost distribution, enforcement, and stipulated policy authority must be compared separately.',
     'Die Person vergleicht Steuer, Zertifikate und Vorgaben an einem gemeinsamen Umweltproblem und begründet ein Urteil anhand des Zieles, unterschiedlicher Vermeidungskosten, Unsicherheit und der im Fall benannten Ebenen.',
     'The learner compares a tax, permits, and requirements for the same environmental problem and justifies a judgement using the target, different abatement costs, uncertainty, and the policy levels specified in the case.'),
    [('different-abatement-costs', 'Zwei Betriebe können Emissionen unterschiedlich teuer vermeiden. Vergleiche eine gleiche Grenzvorgabe, eine gemeinsame Steuer und handelbare Zertifikate bei gegebenem Gesamtziel.',
      'Two firms face different emissions-abatement costs. Compare an equal limit, a common tax, and tradable permits under a supplied aggregate target.',
      'Die Person erklärt Einsparanreize und mögliche kostengünstige Verlagerung von Vermeidung bei Steuer/Handel, unterscheidet Preis- und Mengensteuerung und berücksichtigt Überwachung statt automatische Zielerfüllung zu behaupten.',
      'The learner explains abatement incentives and potentially lower-cost allocation under taxes or trading, distinguishes price from quantity control, and considers monitoring instead of claiming automatic compliance.',
      'Instrumentmechanismen und Vermeidungskosten.', 'Instrument mechanisms and abatement costs.'),
     ('uncertainty-and-authority', 'Ein Planspiel gibt ein gemeinsames europäisches Mengenlimit und regionalen Vollzug vor. Ein alternatives Modell verwendet eine nationale Abgabe bei unbekannter Emissionsreaktion. Bewerte Mengen- und Kostenunsicherheit.',
      'A simulation specifies a joint European quantity cap with regional enforcement. An alternative uses a national charge with an unknown emissions response. Assess quantity and cost uncertainty.',
      'Die Person erklärt die feste zugelassene Menge im Cap-Modell und den unsicheren Preis, bei der Abgabe den vorgegebenen Preis und die unsichere Menge; sie beachtet die ausdrücklich zugewiesenen Zuständigkeiten und Vollzugsbedingungen.',
      'The learner explains the fixed permitted quantity and uncertain price in the cap model, versus the stated price and uncertain quantity under a charge, and observes the explicitly assigned authorities and enforcement conditions.',
      'Politische Ebene ist keine pauschale Wirkungszusage.', 'A policy level is not a blanket guarantee of effectiveness.')],
    [('cost-and-uncertainty', 'Unterschiedliche Vermeidungskosten sowie sichere oder unsichere Emissionsreaktion.', 'Different abatement costs and certain or uncertain emissions responses.'),
     ('policy-level', 'Im Material festgelegte EU-, Bundes- oder Landeszuständigkeit.', 'EU, federal, or state authority stipulated in the materials.')])

add('Explain circular economy and sustainability',
    'The learner can explain concepts of circular economy and sustainable production.', 'concept',
    ('Kreislaufwirtschaft verlängert Nutzungsdauer und führt Materialien zurück; Vermeidung, Wiederverwendung und Recycling betreffen verschiedene Stufen. Nachhaltige Produktion berücksichtigt Ressourcen, Energie und weitere Wirkungen über den Lebensweg; ein Kreislaufetikett allein beweist keine geringere Gesamtbelastung.',
     'A circular economy extends service life and returns materials; prevention, reuse, and recycling concern different stages. Sustainable production considers resources, energy, and other life-cycle effects; a circular label alone does not prove a lower total burden.',
     'Die Person erläutert an einem Produkt die Stufen von Nutzung und Rückführung, ordnet konkrete Maßnahmen zu und erklärt mit Fallinformationen, wann Ressourcen geschont werden und welche Belastungen zusätzlich geprüft werden müssen.',
     'For a product, the learner explains stages of use and material return, identifies specific measures, and uses case information to explain when resources are conserved and which further burdens require assessment.'),
    [('repair-and-recycle', 'Ein Gerät kann repariert, weiterverkauft oder nach kurzer Nutzung recycelt werden. Erläutere die Unterschiede und die mögliche Wirkung auf Rohstoffbedarf.',
      'A device can be repaired, resold, or recycled after a short service life. Explain the differences and possible effects on demand for raw materials.',
      'Die Person beschreibt Reparatur/Wiederverwendung als Erhalt von Funktion bzw. Produkt und Recycling als Materialrückführung, berücksichtigt die ersetzte Neuanschaffung sowie Verluste und Energieaufwand.',
      'The learner describes repair and reuse as retaining function or product, and recycling as material recovery, considering avoided replacement purchases alongside losses and energy use.',
      'Produktnutzung und Materialrückführung sind verschieden.', 'Product use and material recovery are different.'),
     ('returnable-packaging', 'Mehrwegverpackungen benötigen Transport und Reinigung, Einwegverpackungen neue Materialien. Gegebene Daten variieren Rücklaufquote und Transportdistanz. Erläutere Nachhaltigkeitsbedingungen.',
      'Returnable packaging requires transport and cleaning; disposable packaging requires new materials. Supplied data vary return rates and transport distance. Explain conditions for sustainability.',
      'Die Person verbindet hohe Wiederverwendungszahlen mit weniger Neubedarf und prüft Transport-/Reinigungsaufwand; sie begründet ein bedingtes Urteil aus dem Lebensweg statt einer pauschalen Mehrweg-Behauptung.',
      'The learner connects repeated reuse to less demand for new packaging and considers transport and cleaning, giving a conditional life-cycle judgement rather than a blanket claim about returnable packaging.',
      'Lebenswegvergleich statt bloßer Symbolzuordnung.', 'Life-cycle comparison rather than mere label assignment.')],
    [('product-stage', 'Vermeidung, Reparatur, Wiederverwendung oder Materialrecycling.', 'Prevention, repair, reuse, or material recycling.'),
     ('life-cycle', 'Nutzungsdauer, Materialverluste, Transportdistanz und Reinigungsenergie.', 'Service life, material losses, transport distance, and cleaning energy.')])

add('Critically examine financing and liability arrangements',
    'The learner can critically discuss financing routes (equity and debt) and liability scenarios in greater depth.', 'modeling',
    ('Die Eignung einer Finanzierung hängt von Zahlungsströmen, Risiko, Einflussrechten und Haftungsbedingungen ab. Fremdkapital kann Eigentumsanteile schonen, erzeugt aber vereinbarte Zahlungsverpflichtungen; Eigenkapital trägt Verlust- und Einflussfragen. Ein Urteil muss auch einen schlechteren Verlauf prüfen.',
     'Financing suitability depends on cash flows, risk, control rights, and liability conditions. Debt can preserve ownership shares but creates agreed payment obligations; equity involves loss and control issues. A judgement must also examine a less favourable outcome.',
     'Die Person wägt eine Eigen-/Fremdkapitalentscheidung im Normal- und Belastungsfall ab, trennt Unternehmensverlust von persönlicher Haftung und begründet die Wahl mit angegebenen Zahlungs- und Vertragsbedingungen.',
     'The learner weighs an equity/debt decision in baseline and stress scenarios, separates business losses from personal liability, and justifies the choice using supplied payment and contractual conditions.'),
    [('cash-flow-stress', 'Eine junge Firma kann neues Eigenkapital aufnehmen oder einen Kredit mit jährlich 12.000 Euro Schuldendienst. Freier Zahlungsüberschuss ist im Plan 20.000 Euro, im schwachen Szenario 8.000 Euro. Diskutiere.',
      'A young firm can raise equity or take a loan with annual debt service of EUR 12,000. Planned free cash flow is EUR 20,000 but only EUR 8,000 in the weak scenario. Discuss.',
      'Die Person erkennt Deckung im Plan und eine Lücke von 4.000 Euro im Belastungsfall, diskutiert Reserve/Anpassung sowie Mitspracherechte bei Eigenkapital und behauptet keine allgemein beste Finanzierungsform.',
      'The learner identifies coverage in the plan and a EUR 4,000 shortfall under stress, discusses reserves or adaptation and equity participation rights, and does not claim one universally best financing form.',
      'Liquidität und Einflussrechte in einer bedingten Entscheidung.', 'Liquidity and control rights in a conditional decision.'),
     ('guarantee-risk', 'Zwei gleiche Kredite unterscheiden sich nur dadurch, dass bei einem die Gesellschafterin persönlich bürgt. Die Gesellschaft hat im Fall grundsätzlich begrenzte Gesellschafterhaftung. Diskutiere den Unterschied bei Zahlungsausfall.',
      'Two identical loans differ only in that a shareholder personally guarantees one. The stipulated company otherwise has generally limited shareholder liability. Discuss the difference in default.',
      'Die Person erklärt, dass die eigene Bürgschaft zusätzliches persönliches Risiko schafft, trennt dies vom Verlust der Beteiligung und benennt Umfang sowie Bedingungen der Bürgschaft als weitere Prüfangaben.',
      'The learner explains that the personal guarantee creates additional exposure, distinguishes it from losing the equity investment, and identifies the guarantee\'s scope and terms as further information to examine.',
      'Zusätzliche vertragliche Haftung verändert das Risiko.', 'Additional contractual liability changes risk.')],
    [('business-outcome', 'Stabiler Zahlungsüberschuss oder schwacher Verlauf mit Liquiditätslücke.', 'Stable cash flows or a weak outcome with a liquidity shortfall.'),
     ('control-security', 'Neue Beteiligungsrechte, Sicherheiten oder persönliche Bürgschaften.', 'New participation rights, security, or personal guarantees.')])

add('Explain consumer protection and market regulation',
    'The learner can explain consumer-protection instruments and the regulation of markets.', 'concept',
    ('Verbraucherschutz kann Informations-, Sicherheits- oder Durchsetzungsprobleme bearbeiten. Instrumente wie transparente Information, Qualitätsanforderungen und wirksame Beschwerdewege haben unterschiedliche Wirkungsmechanismen und Vollzugsvoraussetzungen; eine Vorschrift allein beseitigt das Problem nicht.',
     'Consumer protection can address information, safety, or enforcement problems. Transparent information, quality requirements, and effective complaint channels work through different mechanisms and enforcement conditions; a rule alone does not eliminate the problem.',
     'Die Person erläutert im neuen Verbraucherfall das konkrete Problem und den passenden Wirkungsweg eines Schutzinstruments, unterscheidet Information von Durchsetzung und benennt verbleibende Grenzen.',
     'For a new consumer case, the learner explains the specific problem and an appropriate protection mechanism, distinguishes information from enforcement, and identifies remaining limits.'),
    [('hidden-total-price', 'Zwei Angebote wirken gleich teuer, aber eines zeigt verpflichtende Zusatzkosten erst am Ende. Im Fall wird eine Pflicht zur frühzeitigen Gesamtkostenangabe vorgeschlagen. Erläutere Wirkung und Grenze.',
      'Two offers appear equally priced, but one reveals mandatory additional costs only at the end. The case proposes requiring early disclosure of total costs. Explain its effect and limit.',
      'Die Person verbindet Transparenz mit Vergleichbarkeit und weniger Informationsnachteil, erklärt verständliche Darstellung und Kontrolle als Voraussetzung und behauptet nicht, dass jede informierte Wahl automatisch optimal wird.',
      'The learner connects transparency to comparability and reduced information disadvantage, explains understandable presentation and oversight as conditions, and does not assume every informed choice becomes optimal.',
      'Informationsinstrument trifft einen konkreten Informationsnachteil.', 'An information instrument addresses a specific information disadvantage.'),
     ('complaint-enforcement', 'Ein Händler ignoriert begründete Reklamationen. Das fiktive Schutzkonzept kombiniert Qualitätsanforderungen, unabhängige Prüfung und einen zugänglichen Beschwerdeweg. Erläutere die verschiedenen Funktionen.',
      'A seller ignores justified complaints. A fictional protection scheme combines quality requirements, independent inspection, and an accessible complaint channel. Explain the different functions.',
      'Die Person trennt vorbeugende Qualitätsregeln, Kontrolle und nachträgliche Durchsetzung, berücksichtigt Kosten/Zugänglichkeit und nennt tatsächliche Reaktion des Händlers bzw. Vollzug als offene Bedingung.',
      'The learner distinguishes preventive quality rules, monitoring, and subsequent enforcement, considers cost and accessibility, and identifies actual seller response or enforcement as an unresolved condition.',
      'Schutzmechanismus und praktische Durchsetzung.', 'Protection mechanism and practical enforcement.')],
    [('consumer-problem', 'Verborgene Kosten, unsichere Qualität oder erschwerte Reklamation.', 'Hidden costs, uncertain quality, or obstructed complaints.'),
     ('instrument-enforcement', 'Information, Qualitätsregel und Beschwerdeverfahren bei unterschiedlicher Kontrolle.', 'Information, quality requirements, and complaint procedures under differing oversight.')])

add('Interpret environmental and quality-of-life indicators',
    'The learner can interpret environmental and quality-of-life indicators.', 'data',
    ('Die Bedeutung eines Umwelt- oder Lebensqualitätsindikators folgt Messgröße, Bezugsmenge, Richtung und Erhebungsweise. Relative Verbesserung kann mit größerer Gesamtbelastung zusammenfallen; ein einzelner Wert bildet nicht alle Lebensbedingungen oder Gruppen ab.',
     'An environmental or quality-of-life indicator derives its meaning from the measured quantity, denominator, direction, and collection method. A relative improvement can coexist with a greater total burden; one value does not capture all living conditions or groups.',
     'Die Person interpretiert Einheiten, Bezugsgrößen und Veränderungen gegebener Indikatoren, erklärt eine scheinbar widersprüchliche Entwicklung und kennzeichnet die Grenze der daraus gezogenen Aussage.',
     'The learner interprets units, reference quantities, and changes in supplied indicators, explains an apparently conflicting trend, and identifies the limits of the resulting claim.'),
    [('intensity-and-total', 'Die Emissionen pro produzierter Einheit sinken von 10 auf 8 kg; die Produktion steigt von 100 auf 150 Einheiten. Interpretiere die Entwicklung.',
      'Emissions per unit of output fall from 10 to 8 kg; output rises from 100 to 150 units. Interpret the development.',
      'Die Person berechnet 1.000 gegenüber 1.200 kg Gesamtemissionen und erklärt, dass bessere Emissionsintensität hier mit 20 % höherer Gesamtbelastung zusammenfällt.',
      'The learner calculates total emissions of 1,000 versus 1,200 kg and explains that improved emissions intensity here coincides with a 20% higher total burden.',
      'Bezugsgröße verhindert Verwechslung relativer und absoluter Verbesserung.', 'The denominator prevents confusion between relative and absolute improvement.'),
     ('survey-average', 'Eine Befragung weist höhere durchschnittliche Lebenszufriedenheit aus; eine Gruppe meldet gleichzeitig schlechtere Wohnbedingungen. Interpretiere beide Angaben bei gegebenen Gruppengrößen.',
      'A survey reports higher average life satisfaction while one group reports worse housing conditions. Interpret both statements using supplied group sizes.',
      'Die Person erklärt mögliche Verteilung hinter dem Durchschnitt, trennt subjektive Befragungsangabe und Wohnindikator und prüft Vergleichbarkeit von Stichprobe/Skala statt alle Gruppen für besser gestellt zu erklären.',
      'The learner explains possible distribution behind the average, separates subjective survey responses from the housing indicator, and checks comparability of samples and scales instead of declaring every group better off.',
      'Messdimension, Erhebung und Verteilung.', 'Measured dimension, data collection, and distribution.')],
    [('denominator', 'Absolute Menge, Pro-Kopf-Wert oder Belastung pro Produktionseinheit.', 'Absolute quantity, per-capita value, or burden per unit of output.'),
     ('collection-distribution', 'Objektive Messung oder Befragung sowie Durchschnitt oder Gruppenwerte.', 'Objective measurement or survey, and averages or group values.')])

add('Explain competition-policy interventions',
    'The learner can justify antitrust measures and merger control.', 'concept',
    ('Kartellbekämpfung und Fusionskontrolle bearbeiten unterschiedliche Auslöser: wettbewerbsbeschränkende Abstimmung bestehender Anbieter oder Strukturänderung durch Zusammenschluss. Eine fachliche Begründung bezieht sich auf verlorenen Wettbewerbsdruck und Fallinformationen, nicht allein auf Unternehmensgröße.',
     'Action against cartels and merger control address different triggers: restrictive coordination among existing suppliers or a structural change through a merger. A scientific justification concerns lost competitive pressure and case information rather than firm size alone.',
     'Die Person unterscheidet im Fall Absprache und Zusammenschluss, begründet den jeweiligen Wettbewerbsbezug und erklärt die Funktion einer passenden Prüfung oder Maßnahme unter den ausdrücklich gegebenen Regeln.',
     'The learner distinguishes coordination from a merger in a case, justifies the competition concern, and explains an appropriate examination or measure under the explicitly supplied rules.'),
    [('price-agreement', 'Drei unabhängige Anbieter vereinbaren Mindestpreise, obwohl sie vorher um Kunden konkurrierten. Im Fall ist die Absprache untersagt. Begründe die Aufdeckung und Beendigung.',
      'Three independent suppliers agree minimum prices although they previously competed for customers. The case stipulates that the agreement is prohibited. Justify its detection and termination.',
      'Die Person erläutert die ausgeschaltete selbstständige Preisentscheidung und den verminderten Wettbewerb, trennt Absprache von bloß zufällig gleichen Preisen und begründet Durchsetzung der gegebenen Regel.',
      'The learner explains the loss of independent pricing and reduced competition, distinguishes coordination from coincidentally equal prices, and justifies enforcing the stipulated rule.',
      'Wettbewerbsbeschränkende Abstimmung als eigener Auslöser.', 'Restrictive coordination as a distinct trigger.'),
     ('merger-anticipation', 'Zwei wichtige konkurrierende Anbieter wollen sich zusammenschließen. Gegeben sind Alternativen, Eintrittshürden und mögliche Kostenvorteile. Begründe eine Prüfung vor dem Zusammenschluss.',
      'Two important competing suppliers want to merge. Alternatives, entry barriers, and possible cost benefits are supplied. Justify an examination before the merger.',
      'Die Person erklärt die vorausschauende Prüfung einer Marktstrukturänderung und nutzt Alternativen/Eintritt sowie Effizienzangaben; sie erklärt keinen Zusammenschluss allein wegen Größe automatisch für unzulässig.',
      'The learner explains prospective scrutiny of a market-structure change and uses alternatives, entry, and efficiency information, without declaring a merger automatically impermissible solely because of size.',
      'Strukturprüfung und konkrete Wettbewerbswirkungen.', 'Structural scrutiny and specific competitive effects.')],
    [('trigger', 'Nachgewiesene Abstimmung bestehender Anbieter oder geplanter Zusammenschluss.', 'Established coordination among current suppliers or a proposed merger.'),
     ('competition-data', 'Ausweichangebote, Eintrittshürden und überprüfbare Effizienzangaben.', 'Alternative offers, entry barriers, and verifiable efficiency information.')])

add('Apply decision biases to consumption',
    'The learner can apply biases such as status quo, framing, or anchoring to consumption decisions.', 'concept',
    ('Status-quo-Effekte betreffen das Beibehalten einer Ausgangsoption, Framing die Darstellung vergleichbarer Sachverhalte und Anchoring den Einfluss eines Bezugspunktes. Eine Zuordnung benötigt den konkreten veränderten Faktor und einen geeigneten Vergleich; die Begriffe erklären nicht beliebige Käufe.',
     'Status-quo effects concern retaining an initial option, framing concerns presentation of comparable facts, and anchoring concerns a reference point\'s influence. Classification requires the specific changed factor and a suitable comparison; the terms do not explain arbitrary purchases.',
     'Die Person ordnet neue vergleichbare Fälle begründet zu, benennt Ausgangsoption, Darstellungswechsel oder Anker und entwirft einen Vergleich, der den vermuteten Einfluss von tatsächlichen Leistungsunterschieden trennt.',
     'The learner justifiably classifies new comparable cases, identifies the initial option, framing change, or anchor, and designs a comparison separating the hypothesised effect from actual service differences.'),
    [('default-and-frame', 'A: Ein bisheriger Tarif bleibt voreingestellt. B: Derselbe Preis wird als 1 Euro pro Tag oder 30 Euro für ausdrücklich 30 Tage gezeigt. Ordne die möglichen Einflüsse getrennt zu.',
      'A: An existing plan remains the default. B: The same price is shown as EUR 1 per day or EUR 30 for explicitly 30 days. Identify the possible influences separately.',
      'Die Person erkennt Status quo in A und Framing in B, erklärt den jeweils relevanten Faktor und prüft ausdrücklich gleichen Zeitraum und Leistungsumfang, bevor sie Gleichwertigkeit annimmt.',
      'The learner identifies status quo in A and framing in B, explains each relevant factor, and explicitly checks equal duration and service before assuming equivalence.',
      'Zwei Mechanismen werden aus ihren Fallmerkmalen getrennt.', 'Two mechanisms are distinguished using their case features.'),
     ('anchor-control', 'Dasselbe Produkt wird zu 50 Euro angeboten; nur eine Anzeige nennt zuerst einen hohen Vergleichspreis. Beschreibe Anchoring und einen kontrollierten Vergleich.',
      'The same product is offered for EUR 50; only one advertisement first gives a high comparison price. Describe anchoring and a controlled comparison.',
      'Die Person erläutert den möglichen Bezugspunkteffekt und vergleicht sonst gleiche Anzeigen/Produkte ohne Anker; sie unterscheidet eine zu prüfende Wirkung von einem bewiesenen individuellen Motiv.',
      'The learner explains the possible reference-point effect and compares otherwise identical advertisements and products without an anchor, distinguishing a testable effect from an established individual motive.',
      'Ankerwirkung durch passende Variation prüfen.', 'Examine anchoring through suitable variation.')],
    [('bias-mechanism', 'Standardoption, äquivalente Darstellung oder vorangestellter Vergleichspreis.', 'Default option, equivalent presentation, or a preceding comparison price.'),
     ('control-comparison', 'Leistung und tatsächliche Kosten bleiben gleich, nur der behauptete Einflussfaktor ändert sich.', 'Service and actual costs remain fixed while only the hypothesised influence changes.')])

add('Describe capital providers and liability',
    'The learner can describe capital providers\' rights and duties and liability risks.', 'concept',
    ('Die Position eines Kapitalgebers ergibt sich aus Beteiligung oder Kredit und den gegebenen Vertrags-/Rechtsformbedingungen. Zahlungs-, Mitwirkungs- und Rückzahlungsrechte sind von Verlust- und persönlichem Haftungsrisiko zu unterscheiden; Kapitalbereitstellung verleiht nicht immer gleiche Rechte.',
     'A capital provider\'s position follows from equity or debt and the stipulated contractual and business-form conditions. Payment, participation, and repayment rights must be distinguished from investment losses and personal liability; providing funds does not always grant identical rights.',
     'Die Person beschreibt im Fall die Rechte und Pflichten verschiedener Kapitalgeber anhand vorgelegter Bedingungen und trennt Forderungsausfall, Beteiligungsverlust und gegebenes persönliches Haftungsrisiko.',
     'The learner describes different capital providers\' rights and duties using supplied conditions and distinguishes default on a claim, loss of equity, and any stipulated personal liability.'),
    [('contracts-compared', 'Ein Beteiligungsvertrag nennt Stimmrecht und variable Ausschüttung; ein Kreditvertrag nennt festen Zins und Rückzahlung ohne Stimmrecht. Beschreibe beide Kapitalgeberpositionen.',
      'An equity agreement specifies voting rights and variable distributions; a loan agreement specifies fixed interest and repayment without voting rights. Describe both providers\' positions.',
      'Die Person ordnet die konkret vereinbarten Ansprüche richtig zu, benennt vereinbarte Einlage bzw. Kreditzahlung als Pflichten und erklärt, dass nicht allein die Höhe des Betrags über Mitwirkung entscheidet.',
      'The learner correctly assigns the stated claims, identifies the agreed equity contribution or loan advance as duties, and explains that the amount alone does not determine participation rights.',
      'Rechte folgen der Kapital- und Vertragsposition.', 'Rights follow the capital and contractual position.'),
     ('loss-and-liability', 'Bei Zahlungsproblemen droht der Bank ein Kreditausfall und der Gesellschafterin ein Beteiligungsverlust. Zusätzlich hat sie in diesem Fall persönlich gebürgt. Beschreibe die drei Risiken.',
      'Financial distress threatens a loan loss for the bank and an equity loss for the shareholder. In this case the shareholder has additionally given a personal guarantee. Describe the three risks.',
      'Die Person trennt Ausfall der Bankforderung, Wertverlust der Beteiligung und zusätzliche Verpflichtung aus der Bürgschaft und verwechselt begrenzte Beteiligungshaftung nicht mit Risikofreiheit.',
      'The learner separates default on the bank\'s claim, loss of equity value, and the additional guarantee obligation, without confusing limited shareholder liability with absence of risk.',
      'Verlust und persönliche Haftung sind verschiedene Folgen.', 'Investment loss and personal liability are different effects.')],
    [('provider-position', 'Eigenkapitalgeber oder Fremdkapitalgeber mit vorgelegten Vereinbarungen.', 'Equity or debt providers under supplied agreements.'),
     ('risk-form', 'Beteiligungsverlust, Forderungsausfall oder zusätzliche persönliche Verpflichtung.', 'Equity loss, default on a claim, or an additional personal obligation.')])

add('Analyse external effects',
    'The learner can identify external costs and benefits and explain measures to internalise them.', 'concept',
    ('Externe Effekte betreffen Kosten oder Nutzen für nicht vollständig in der Entscheidung berücksichtigte Dritte. Internalisierung verbindet diese Folgen mit dem Anreiz der verursachenden Entscheidung; negativ und positiv erfordern unterschiedliche Begründungen, und eine Preisänderung allein ist nicht notwendig ein externer Effekt.',
     'External effects concern costs or benefits to others that are not fully accounted for in a decision. Internalisation connects those effects to the decision-maker\'s incentives; negative and positive effects require different justifications, and a price change alone is not necessarily an external effect.',
     'Die Person identifiziert Verursacher, Dritte und konkrete nicht abgegoltene Wirkung und erklärt anhand des Falls den Wirkungsweg einer passenden Maßnahme sowie eine erforderliche Bedingung.',
     'The learner identifies the decision-maker, affected others, and a specific uncompensated effect and explains the mechanism of an appropriate measure together with a required condition.'),
    [('pollution-charge', 'Ein Betrieb verschmutzt Luft, Anwohner tragen Gesundheitsbelastungen ohne Ausgleich. Eine Abgabe je Schadstoffeinheit wird vorgeschlagen. Analysiere externen Effekt und Anreiz.',
      'A firm pollutes the air; residents experience uncompensated health burdens. A charge per unit of pollutant is proposed. Analyse the external effect and incentive.',
      'Die Person ordnet negative externe Kosten zu und erklärt, wie eine messbare Schadstoffabgabe private Kosten der Emission erhöht und Vermeidung attraktiver machen kann; Höhe, Messung und Vollzug bleiben Bedingungen.',
      'The learner identifies negative external costs and explains how a measurable emissions charge increases private emission costs and can make abatement more attractive; rate, measurement, and enforcement remain conditions.',
      'Drittwirkung wird mit privatem Handlungsanreiz verbunden.', 'Effects on others are connected to private incentives.'),
     ('positive-learning-benefit', 'Ein Betrieb finanziert Ausbildung, von deren Kenntnissen später auch andere Betriebe ohne Gegenleistung profitieren können. Erläutere einen möglichen positiven externen Effekt und eine Förderung.',
      'A firm funds training whose knowledge may later benefit other firms without payment. Explain a possible positive external effect and a subsidy.',
      'Die Person trennt den betriebseigenen Ausbildungsnutzen vom möglichen unvergüteten Nutzen Dritter und erklärt eine gezielte Förderung als Anreiz zu zusätzlicher Ausbildung; sie prüft tatsächliche Zusatzwirkung statt jeden Lohn als externen Nutzen zu zählen.',
      'The learner separates the firm\'s own training benefit from possible uncompensated benefits to others and explains targeted support as an incentive for additional training, examining additional effects rather than counting every wage as an external benefit.',
      'Positive Drittwirkung und begründete Förderung.', 'Positive effects on others and justified support.')],
    [('effect-sign', 'Negative Belastung oder positiver nicht abgegoltener Nutzen Dritter.', 'A negative burden or positive uncompensated benefit to others.'),
     ('internalisation-route', 'Abgabe, gezielte Förderung oder eine fallbezogen begründete Regelung mit Mess- und Vollzugsbedingungen.', 'Charge, targeted support, or a case-justified rule with measurement and enforcement conditions.')])

add('Explain forms of market failure',
    'The learner can explain information asymmetries, public goods, and monopolies as forms of market failure.', 'concept',
    ('Informationsasymmetrie, öffentliche Güter und Marktmacht können unterschiedliche Abweichungen von einer effizienten Marktlösung verursachen. Der konkrete Mechanismus folgt ungleich verteiltem Wissen, fehlender Rivalität/Ausschließbarkeit oder eingeschränktem Wettbewerb; nicht jeder ungleiche Wissensstand und nicht jede große Firma beweist bereits Marktversagen.',
     'Information asymmetry, public goods, and market power can cause different departures from an efficient market outcome. The mechanism follows unequal knowledge, non-rivalry/non-excludability, or restricted competition; neither unequal knowledge nor a large firm alone establishes market failure.',
     'Die Person unterscheidet neue Fälle anhand des ursächlichen Mechanismus, erklärt Informations-, Bereitstellungs- oder Marktmachtproblem und benennt die entscheidenden Fallbedingungen statt nur Etiketten zu vergeben.',
     'The learner distinguishes new cases using their causal mechanism, explains information, provision, or market-power problems, and identifies the decisive conditions rather than merely assigning labels.'),
    [('hidden-quality', 'Käufer können gute und schlechte Gebrauchtgeräte vor dem Kauf nicht unterscheiden; Verkäufer kennen die Qualität. Die Zahlungsbereitschaft orientiert sich am Durchschnitt. Erläutere ein mögliches Marktproblem.',
      'Buyers cannot distinguish good from poor used devices before purchase; sellers know their quality. Willingness to pay reflects average quality. Explain a possible market problem.',
      'Die Person erklärt die Informationsasymmetrie und den möglichen Rückzug hochwertiger Angebote bei zu niedrigen Durchschnittspreisen; sie begründet den Mechanismus aus den gegebenen Annahmen.',
      'The learner explains the information asymmetry and possible withdrawal of high-quality offers when average prices are too low, deriving the mechanism from the supplied assumptions.',
      'Ungleiches Wissen wirkt über Auswahl und Anreize.', 'Unequal information operates through selection and incentives.'),
     ('public-good', 'Ein lokales Hochwasserwarnsignal kann nach Bereitstellung zusätzlich genutzt werden, ohne anderen die Nutzung zu nehmen; Nichtzahlende können im Modell nicht ausgeschlossen werden. Erkläre ein Finanzierungsproblem.',
      'Once provided, a local flood-warning signal can be used by additional people without reducing others\' use; the model cannot exclude non-payers. Explain a funding problem.',
      'Die Person ordnet Nicht-Rivalität und Nicht-Ausschließbarkeit zu und erläutert Trittbrettfahrer sowie mögliche Unterbereitstellung bei freiwilliger einzelner Finanzierung; sie verwechselt das Signal nicht mit rivalisierendem Wasserverbrauch.',
      'The learner identifies non-rivalry and non-excludability and explains free-riding and possible underprovision under voluntary individual funding, without confusing the signal with rival water consumption.',
      'Gütereigenschaften erklären das Bereitstellungsproblem.', 'Goods\' characteristics explain the provision problem.'),
     ('monopoly-entry', 'Ein einziger Anbieter verfügt im Modell über Marktmacht; neue Anbieter können nicht eintreten. Vergleiche Preis-/Mengenanreize mit wirksamer Konkurrenz.',
      'In the model, a sole supplier has market power and new suppliers cannot enter. Compare price and quantity incentives with effective competition.',
      'Die Person erklärt, wie fehlender Wettbewerbsdruck Spielraum für höheren Preis und geringere Menge eröffnen kann und verbindet die mögliche Ineffizienz mit Marktmacht und Eintrittshürde, nicht bloß der Zahl der Firmen.',
      'The learner explains how absent competitive pressure can create scope for a higher price and lower quantity and links possible inefficiency to market power and the entry barrier rather than merely the number of firms.',
      'Marktmachtmechanismus bleibt von Informations- und Güterproblemen getrennt.', 'Market-power mechanisms remain distinct from information and public-goods problems.')],
    [('failure-mechanism', 'Verborgene Qualität, öffentliches Gut oder Marktmacht mit Eintrittshürde.', 'Hidden quality, a public good, or market power with an entry barrier.'),
     ('decisive-assumption', 'Information, Ausschließbarkeit/Rivalität oder tatsächliche Ausweich- und Eintrittsmöglichkeiten.', 'Information, excludability/rivalry, or actual alternatives and entry opportunities.')])


def write_json(name, data):
    (OUT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


def main():
    originals = json.loads((OUT / 'whole-goals.original.json').read_text())
    if len(originals) != len(ENTRIES):
        raise ValueError((len(originals), len(ENTRIES)))
    translated, candidates, translations = [], [], []
    for goal, entry in zip(originals, ENTRIES):
        final = copy.deepcopy(goal)
        final['titleEn'], final['descriptionEn'] = entry['titleEn'], entry['descriptionEn']
        translated.append(final)
        translations.append({k: final[k] for k in ['id', 'title', 'titleEn', 'description', 'descriptionEn']})
        de, en, obs_de, obs_en = entry['expectation']
        expectation_id = 'content-specific-understanding'
        cases = [dict(zip(['id', 'taskDemandDe', 'taskDemandEn', 'expectedPerformanceDe',
                           'expectedPerformanceEn', 'understandingFocusDe', 'understandingFocusEn'], case))
                 for case in entry['cases']]
        axes = [dict(zip(['id', 'textDe', 'textEn'], axis)) for axis in entry['axes']]
        profile = {
            'archetype': entry['archetype'],
            'expectations': [{
                'id': expectation_id,
                'essentialUnderstandingDe': de, 'essentialUnderstandingEn': en,
                'observablePerformanceDe': obs_de, 'observablePerformanceEn': obs_en,
            }],
            'coverageExpectations': {
                'requiredExpectationIds': [expectation_id], 'alternativeExpectationGroups': [],
                'minimumIndependentDemonstrations': 2,
                'freshVariationRequired': True, 'independentTransferRequired': True,
            },
            'variationAxes': axes, 'applicationCaseBriefs': cases,
        }
        candidates.append({
            'goalId': goal['id'],
            'reason': 'DE: Eigener inaktiver Profilentwurf aus dem ganzen aktuellen Ziel und der echten EN-Übersetzung. Inhaltliche Kernunterscheidung: ' + de +
                      ' Die konkreten Fälle sind didaktische Erwartungen, keine beobachtete Lernendenleistung, unabhängige Prüfung oder menschliche Freigabe. EN: Own inert profile draft based on the whole current goal and its actual English translation. Core distinction: ' + en +
                      ' The specific cases are didactic expectations, not observed learner performance, independent review, or human approval.',
            'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'dissent': [], 'profile': profile,
        })
    now = datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
    write_json('description-translations.candidate.json', translations)
    write_json('whole-goals.candidate.json', translated)
    write_json('positive.candidates.json', {
        'schemaVersion': 1, 'authoringContract': 'positive-understanding-evidence-candidates-v1',
        'reviewId': REVIEW_ID, 'reviewedAt': now,
        'reviewer': REVIEWER, 'goals': candidates,
    })
    current = json.loads(SOURCE.read_text())
    current_by = {g['id']: g for g in current['goals']}
    if any(current_by[g['id']] != g for g in originals):
        raise ValueError('An original whole goal changed during authoring; no live adoption is authorised here.')
    changed_fields = {}
    for old, new in zip(originals, translated):
        keys = set(old) | set(new)
        fields = sorted(k for k in keys if old.get(k) != new.get(k))
        if fields != ['descriptionEn', 'titleEn']:
            raise ValueError((old['id'], fields))
        changed_fields[old['id']] = fields
    write_json('authoring.actual.receipt.json', {
        'role': 'author', 'authority': 'ai_candidate', 'status': 'inert_candidate',
        'createdAt': now, 'currentWholeGoalCount': len(originals), 'changedFields': changed_fields,
        'unchangedGermanFieldsAndGraph': True,
        'sourceLandscapeSha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        'positiveProfileCount': len(candidates),
        'applicationCaseCount': sum(len(c['profile']['applicationCaseBriefs']) for c in candidates),
        'independentDescriptionReviews': 0, 'visualizationApprovals': 0,
        'newStrictClosures': 0, 'restoredBindings': 0,
        'scope': [g['id'] for g in originals],
        'limits': ['No active canonical/registry/ledger writes.',
                   'A/M semantic parity and current bindings still require targeted review.',
                   'D preparation waits for final image/context selection.',
                   'Source passage rereading informs authoring, not a new whole-source mapping decision.'],
    })
    print(f'{len(translated)} whole bilingual candidates; {len(candidates)} P-v2 drafts; '
          f'{sum(len(c["profile"]["applicationCaseBriefs"]) for c in candidates)} concrete bilingual cases; strict growth 0.')


if __name__ == '__main__':
    main()
