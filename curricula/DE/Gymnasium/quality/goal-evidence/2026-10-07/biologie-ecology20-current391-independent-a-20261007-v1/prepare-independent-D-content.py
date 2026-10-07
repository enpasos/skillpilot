#!/usr/bin/env python3
"""Own reviewed scientific chains, before final native page binding."""
import json
from pathlib import Path

own = Path(__file__).parent
author = own.parent / 'biologie-ecology20-current391-author-v2'
goals = json.loads((author / 'materials/twenty-whole-goals-forty-complete-DEEN-cases.author.json').read_text())['goals']
chains = [
    [
        ['Ein Lebensraumtyp wird durch kennzeichnende Merkmale bestimmt; seine räumlichen Teilbereiche liegen innerhalb dieses Lebensraums.', 'A habitat type is identified through characteristic features; its spatial subareas belong within that habitat.'],
        ['Ordnet unbekannte Wald- und Gewässerbeschreibungen einem begründeten Typ zu und trennt ganze Lebensräume von Kronen-, Boden-, Ufer- oder Wasserzonen.', 'Assigns unfamiliar woodland and water descriptions to justified types and distinguishes entire habitats from canopy, ground, bank or water zones.'],
        ['Typisiert danach einen anders aufgebauten Wald und ein fließendes Gewässer und erklärt, welche feinere Unterscheidung die neuen Angaben nicht sichern.', 'Then classifies a differently structured forest and running water and explains which finer distinction the new information does not establish.'],
    ],
    [
        ['Bestimmung ist ein begründeter Weg durch sichtbare Merkmale einer passenden Hilfe; Gruppenmerkmale sichern noch keine konkrete Art.', 'Identification is a justified pathway through visible traits in an appropriate key; group traits do not establish a particular species.'],
        ['Nutzt eine Waldhilfe zur Pflanzen- und Tierzuordnung und begründet jeden Schritt; acht Beine erlauben im vereinfachten Schlüssel nur die Spinnentiergruppe.', 'Uses a woodland key to assign plants and animals and justifies each step; eight legs support only the arachnid group in the simplified key.'],
        ['Bestimmt in einem neuen Gewässerkontext mit einer anderen Hilfe und kennzeichnet offen die Grenzen der sichtbaren Merkmale.', 'Identifies organisms in a new aquatic context using another key and openly marks the limits of visible traits.'],
    ],
    [
        ['Nahrungsketten sind Ausschnitte vernetzter Stoff- und Energieübertragung; Räuber-Beute, Parasit-Wirt und Symbiose unterscheiden sich in den Partnerwirkungen.', 'Food chains are parts of interconnected matter and energy transfer; predation, parasitism and symbiosis differ in their effects on partners.'],
        ['Konstruiert aus neuen Angaben eine Kette und ein verzweigtes Netz, erklärt die Pfeilrichtung und ordnet Nahrung, Verbraucher und Zersetzung richtig ein.', 'Constructs a chain and branching web from new information, explains arrow direction and correctly assigns food, consumers and decomposition.'],
        ['Überträgt die Beziehungen auf ein anderes Ökosystem und begründet eine indirekte Veränderung einschließlich ihrer Modellgrenze.', 'Transfers the relationships to another ecosystem and justifies an indirect change including its model limit.'],
    ],
    [
        ['Abiotische Faktoren werden tatsächlich mit geeigneten Geräten und vergleichbaren Bedingungen erhoben; ihre mögliche Wirkung ist von Messung und Kausalnachweis zu trennen.', 'Abiotic factors are actually measured with suitable instruments and comparable conditions; possible effects differ from measurement and causal proof.'],
        ['Erhebt selbst wiederholte Temperatur- und Lichtwerte, protokolliert Methode, Ort, Zeit und Unsicherheit und erklärt eine mögliche Wirkung anhand eigener Ergebnisse.', 'Personally collects repeated temperature and light readings, records method, site, time and uncertainty and explains a possible effect from personal results.'],
        ['Misst anschließend tatsächlich einen anderen Faktor in einem neuen sicheren Standortkontext und unterscheidet Wert, biologische Hypothese und fehlenden Ursachenbeleg.', 'Then actually measures another factor in a new safe site context and distinguishes the reading, biological hypothesis and missing causal evidence.'],
    ],
    [
        ['Arten benötigen geeignete Nahrung, Fortpflanzungs- und Rückzugsräume; Biotopschutz erhält solche Bedingungen und ihre Beziehungen.', 'Species need suitable food, reproduction and refuge sites; habitat protection preserves these conditions and relationships.'],
        ['Begründet im neuen Waldbeispiel den Wert von Vielfalt und erklärt, wie eine konkrete Struktur- oder Schutzmaßnahme wirkt.', 'Justifies the value of diversity in a new woodland example and explains how a specific structural or conservation measure works.'],
        ['Wägt am Gewässerufer Schutz und Nutzung ab und nennt eine passende Erfolgskontrolle, ohne Vielfalt aus einem schönen Bild abzuleiten.', 'Weighs protection and use at a water margin and names suitable monitoring without inferring diversity from an attractive image.'],
    ],
    [
        ['Boden besitzt unbelebte Bedingungen und eine Lebensgemeinschaft; tote Streu ist organisches Substrat und kein lebender Biozönosebestandteil.', 'Soil has non-living conditions and a living community; dead litter is organic substrate and not a living biocenosis member.'],
        ['Untersucht eine tatsächliche kleine Probe, erstellt ein eigenes digitales Ergebnisprotokoll und trennt gemessene Bodenmerkmale von wirklich beobachteten Lebewesen.', 'Investigates an actual small sample, creates a personal digital results protocol and separates measured soil traits from actually observed organisms.'],
        ['Führt eine zweite vergleichbare Untersuchung selbst durch und erklärt Unterschiede unter Beachtung der Stichproben- und Methodenbegrenzung.', 'Personally performs another comparable investigation and explains differences while respecting sampling and method limits.'],
    ],
    [
        ['Humusbildung und Mineralisierung verändern organische und anorganische Stoffbindungen über die Zeit; Energie wird dabei umgesetzt und als Wärme abgegeben.', 'Humus formation and mineralization alter organic and inorganic matter over time; energy is transformed and released as heat.'],
        ['Stellt in einem Bodenmodell Stoffpfade und Energiefluss getrennt dar und erläutert die zeitliche Bildung und den möglichen Abbau von Humus.', 'Separately represents matter pathways and energy flow in a soil model and explains temporal humus formation and possible decomposition.'],
        ['Deutet einen veränderten Umwelt- und Zeitverlauf mit anderer Umsatzgeschwindigkeit, ohne einen unveränderlichen Humusendpunkt oder Energiekreislauf zu behaupten.', 'Interprets a changed environmental and temporal course with different turnover speed without claiming an immutable humus endpoint or energy cycle.'],
    ],
    [
        ['Kohlenstoffatome wechseln durch Fotosynthese, Nahrungstransfer, Absterben und Zellatmung zwischen Organismen, Bodenspeichern und unbelebtem CO₂.', 'Carbon atoms move through photosynthesis, feeding, death and respiration between organisms, soil stores and non-living CO₂.'],
        ['Verfolgt ein Atom in einem selbst dargestellten Bodenweg und benennt die Übergänge, ohne Lichtenergie oder mineralische Nährstoffe mit Kohlenstoffaufnahme zu verwechseln.', 'Tracks one atom in a personally drawn soil pathway and names transfers without confusing light energy or mineral nutrients with carbon uptake.'],
        ['Entwirft einen anders verlaufenden Atomweg mit einem zeitweiligen Bodenspeicher und erklärt spätere Freisetzung bei weiterhin erhaltener Atomidentität.', 'Designs another atom pathway with a temporary soil store and explains later release while retaining atom identity.'],
    ],
    [
        ['Lebensmittelproduktion hängt langfristig von Bodenfunktionen ab; menschliche Eingriffe können Wasserhaushalt, Fruchtbarkeit und weitere Ökosysteme verkettet verändern.', 'Long-term food production depends on soil functions; human interventions can alter water balance, fertility and other ecosystems through linked effects.'],
        ['Beurteilt in einem Nutzungsszenario die Bodenleistungen und charakterisiert eine nachvollziehbare Wirkungskette bis zur Lebensmittelversorgung.', 'Assesses soil functions in a land-use scenario and characterizes a traceable effect chain to food provision.'],
        ['Analysiert eine andere Verkettung aus Bodenbedeckung, Erosion und Stoffeintrag und begründet eine vorbeugende Maßnahme mit menschlichen Folgen und Zielkonflikt.', 'Analyzes another chain involving cover, erosion and material inputs and justifies prevention with human consequences and a trade-off.'],
    ],
    [
        ['Verbreitungskarten verbinden räumliche Nachweise und Umweltmerkmale; Nichtnachweis, nicht untersuchte Zellen und Kausalbeweis sind unterschiedliche Aussagen.', 'Distribution maps link spatial records and environmental traits; a missing record, an unsurveyed cell and causal proof are different statements.'],
        ['Liest Orientierung, Legende und räumliches Nachweismuster einer neuen Karte und erklärt es mit mehreren passenden abiotischen Faktoren.', 'Reads orientation, legend and the spatial record pattern of a new map and explains it through several suitable abiotic factors.'],
        ['Deutet eine anders aufgebaute Artenkarte, unterscheidet Vergleichszellen und Datenlücken und fordert geeignete zusätzliche räumliche Erhebungen.', 'Interprets a differently structured species map, distinguishes comparison cells and data gaps and requests suitable additional spatial surveys.'],
    ],
    [
        ['Die ökologische Nische verbindet biotische Beziehungen, Ressourcennutzung und abiotische Ansprüche; sie bezeichnet mehr als den Ort eines Lebewesens.', 'An ecological niche combines biotic relationships, resource use and abiotic requirements; it means more than an organism’s location.'],
        ['Beschreibt konkrete Partnerwirkungen und erklärt an einem neuen Organismusbeispiel, wie das Faktorengefüge die Biozönose mitbestimmt.', 'Describes actual partner effects and explains through a new organism example how the factor combination helps determine the community.'],
        ['Erklärt Ressourcenteilung und eine bedingte Veränderung der Gemeinschaft in einem weiteren Beispiel, ohne gleichen Wohnort mit gleicher Nische gleichzusetzen.', 'Explains resource partitioning and a conditional community change in another example without equating a shared location with an identical niche.'],
    ],
    [
        ['Genetische, Arten- und Ökosystemvielfalt entstehen durch evolutionäre Prozesse und können Funktionen sowie künftige Anpassungsmöglichkeiten unterstützen.', 'Genetic, species and ecosystem diversity arise through evolutionary processes and can support functions and future adaptive options.'],
        ['Erläutert Herkunft und Bedeutung der Vielfalt anhand neuer Angaben und verknüpft diese mit nachvollziehbaren Schutz- und Nutzungsgründen.', 'Explains origins and significance of diversity from new information and connects them to traceable conservation and use reasons.'],
        ['Überträgt die Erklärung auf genetisch unterschiedliche Nutzpflanzen und begründet begrenzte Risikovorteile sowie Schutzmaßnahmen, ohne Unverwundbarkeit zu behaupten.', 'Transfers the explanation to genetically varied crops and justifies bounded risk benefits and protection without claiming invulnerability.'],
    ],
    [
        ['Nachhaltigkeitsurteile über biologische Anwendungen verbinden ökologische, ökonomische, politische und soziale Folgen mit transparenten Werten und Kriterien.', 'Sustainability judgments about biological applications combine ecological, economic, political and social consequences with transparent values and criteria.'],
        ['Beurteilt zwei neue Anwendungsoptionen aus allen vier Perspektiven und begründet nach Trennung von Sachannahmen und Wertgewichtung eine Entscheidung.', 'Assesses two new application options from all four perspectives and justifies a decision after separating factual assumptions and value weighting.'],
        ['Wendet dieselben Perspektiven auf eine andere Anwendung an und erläutert Datenbedarf sowie eine unter anderer vertretbarer Gewichtung mögliche Entscheidung.', 'Applies the same perspectives to another application and explains data needs and a possible decision under another defensible weighting.'],
    ],
    [
        ['Exponentielles Wachstum nutzt eine konstante Pro-Kopf-Rate; logistisches Wachstum berücksichtigt dichteabhängige Rückkopplung und eine Modellkapazität.', 'Exponential growth uses a constant per-capita rate; logistic growth includes density feedback and a model carrying capacity.'],
        ['Modelliert neue Populationsverläufe mit passenden Gleichungen und erklärt Parameter und biologische Dichteeffekte unter den jeweiligen Annahmen.', 'Models new population courses with appropriate equations and explains parameters and biological density effects under the relevant assumptions.'],
        ['Untersucht eine veränderte Kapazität und äußere Entnahme und begrenzt die Modellprognose bei kleinem Bestand, statt negative Tiere vorherzusagen.', 'Investigates a changed capacity and external harvesting and limits predictions at small abundance rather than predicting negative animals.'],
    ],
    [
        ['Stoffkreisläufe verbinden Reservoirs und Umwandlungsprozesse; im gemeinsamen Kohlenstoffkern hängen Nettospeicherung und Freisetzung von allen relevanten Flüssen ab.', 'Matter cycles connect reservoirs and transformation processes; in the common carbon core net storage and release depend on all relevant fluxes.'],
        ['Analysiert einen neuen Kohlenstoffweg einschließlich Produzenten, Konsumenten, Destruenten und Speichern und berechnet eine begrenzte Bilanz.', 'Analyzes a new carbon pathway including producers, consumers, decomposers and stores and calculates a bounded balance.'],
        ['Analysiert einen Gewässer-/Sedimentkreislauf mit Luftaustausch und begründet, welche Daten eine Senkenaussage benötigt; Stickstoff bleibt belegte optionale Kursvertiefung.', 'Analyzes a water/sediment cycle with air exchange and justifies data needed for a sink claim; nitrogen remains an evidenced optional course extension.'],
    ],
    [
        ['Klima und lokale Standortbedingungen wirken gemeinsam; Temperatur, Wasser und weitere Faktoren können sich in ihren Wirkungen begrenzen oder verstärken.', 'Climate and local site conditions act jointly; temperature, water and other factors can limit or reinforce their effects.'],
        ['Bewertet in einem neuen Standortvergleich mehrere Steuergrößen und begründet bedingte Wirkungen auf die Lebensbedingungen statt eine allgemeine Erwärmungsregel zu behaupten.', 'Evaluates several controls in a new site comparison and justifies conditional effects on living conditions rather than claiming a universal warming rule.'],
        ['Wägt in einem veränderten Höhenlagenkontext gegenläufige Einflüsse ab und benennt die erforderlichen Daten; ein Übersichtsschema ersetzt keinen Potenz-Laborversuch.', 'Weighs opposing influences in a changed elevation context and names required data; an overview diagram does not replace a potency laboratory experiment.'],
    ],
    [
        ['Arten verändern bei Sukzession die Bedingungen nachfolgender Arten; Änderungen und Konkurrenz verändern umgekehrt Vielfalt und Zusammensetzung.', 'During succession species alter conditions for later species; change and competition in turn alter diversity and composition.'],
        ['Erläutert an einem zeitlichen Beispiel beide Wirkungsrichtungen und unterscheidet beobachteten Artenwechsel von einem Beleg steigender Gesamtartenzahl.', 'Explains both causal directions in a temporal example and distinguishes observed species turnover from evidence of rising total richness.'],
        ['Erklärt nach einer anderen Störung oder Offenhaltung ein Mosaik unterschiedlicher Stadien und begrenzt Aussagen über dessen Vielfalt anhand benötigter Daten.', 'Explains a mosaic of stages after another disturbance or maintained openness and limits diversity claims using the required data.'],
    ],
    [
        ['Biodiversitätsschutz richtet sich auf konkrete Gefährdungen und die Erhaltung geeigneter genetischer, Arten- und Lebensraumbedingungen.', 'Biodiversity protection addresses actual threats and maintains suitable genetic, species and habitat conditions.'],
        ['Begründet im neuen Gefährdungsbeispiel geeignete Schutzstrategien und erklärt, warum Ursachenschutz oder Habitatverbund eine bloße Symptombehandlung ergänzen.', 'Justifies suitable strategies in a new threat example and explains why causal protection or habitat connectivity complements merely treating symptoms.'],
        ['Vergleicht in einem anderen Ökosystem Erhalt, Renaturierung und Belastungsverminderung mit Erfolgskontrolle und begründet verbleibende Zielkonflikte.', 'Compares conservation, restoration and load reduction with monitoring in another ecosystem and justifies remaining trade-offs.'],
    ],
    [
        ['Landnutzung, Verschmutzung und Klimawandel verändern Lebensräume und Stoffhaushalte über verschiedene, oft zusammenwirkende Mechanismen.', 'Land use, pollution and climate change alter habitats and matter balances through different, often interacting mechanisms.'],
        ['Beschreibt für jeden der drei Eingriffstypen einen fachlich richtigen Wirkpfad in einem neuen Ökosystem und trennt begründete Folgen von Messbefunden.', 'Describes a scientifically correct pathway for each of the three intervention types in a new ecosystem and distinguishes justified consequences from measurements.'],
        ['Überträgt die Analyse auf eine andere Landschaft und begründet eine mögliche Verstärkung samt Vergleichsdaten, ohne exakte lokale Aussterbezahlen zu erfinden.', 'Transfers analysis to another landscape and justifies a possible reinforcement with comparative data without inventing exact local extinction counts.'],
    ],
    [
        ['Nachhaltige Nutzung berücksichtigt Regeneration, Bestände, ökologische Funktionen und Verteilung über einen längeren Zeithorizont.', 'Sustainable use considers regeneration, stocks, ecological functions and allocation over a longer time horizon.'],
        ['Erläutert an einem neuen Nutzungskonzept Entnahme und Wiederaufbau sowie Funktionsschutz und begründet, warum Nachpflanzung allein keinen Nachhaltigkeitsnachweis liefert.', 'Explains extraction, renewal and functional protection in a new use concept and justifies why replanting alone does not prove sustainability.'],
        ['Überträgt das Konzept auf Grundwasser, erläutert datenabhängige Entnahmeregeln und Grundversorgung und grenzt dies von vollständiger Ökosystemleistungsbewertung ab.', 'Transfers the concept to groundwater, explains data-dependent extraction rules and basic provision and distinguishes this from complete ecosystem-service assessment.'],
    ],
]
assert len(chains) == len(goals) == 20
names = ['essentialUnderstanding', 'observablePerformance', 'transferExpectation']
rows = []
for goal, chain in zip(goals, chains):
    rows.append({'goalId': goal['goalId'], 'descriptionScientificDecision': 'keep',
                 'understandingEvidence': {name + suffix: pair[language]
                     for name, pair in zip(names, chain)
                     for language, suffix in [(0, 'De'), (1, 'En')]},
                 'finalNativePageImageReviewPending': True})
p = own / 'independent-a-description-scientific-chains.prebinding.json'
assert not p.exists()
p.write_text(json.dumps({'role': 'Independent A own reviewed scientific description chains before final native page/image binding; not a completed D record',
                         'goalCount': 20, 'machineM7ClosureClaim': False,
                         'humanApproval': False, 'goals': rows}, ensure_ascii=False, indent=2) + '\n')
print(p)
