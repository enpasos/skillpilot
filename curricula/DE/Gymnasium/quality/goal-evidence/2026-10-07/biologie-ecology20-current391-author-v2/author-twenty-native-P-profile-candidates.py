"""Prepare native positive-understanding-evidence-v2 author candidates, no approvals."""
from pathlib import Path
import json
from datetime import datetime, timezone

D = Path(__file__).resolve().parent
ROOT = D.parents[6]
materials = json.loads((D / 'materials/twenty-whole-goals-forty-complete-DEEN-cases.author.json').read_text())

def p(de, en): return (de, en)
def spec(archetype, concept, performance, transfer, transferPerformance, variation):
    return (archetype, concept, performance, transfer, transferPerformance, variation)

S = [
 spec('concept',
 p('Wald- und Gewässertypen werden durch kennzeichnende Habitatmerkmale unterschieden; Stockwerke oder Wasserzonen gliedern einen Lebensraum räumlich.', 'Forest and water habitat types differ through characteristic habitat features; layers or water zones spatially subdivide a habitat.'),
 p('Typisiert einen unbekannten beschriebenen Wald- und Gewässerstandort mit Merkmalbegründung und ordnet passende Teilbereiche zu.', 'Classifies unfamiliar described woodland and water sites using justified features and assigns appropriate subareas.'),
 p('Räumliche Teilbereiche sind weder einzelne Arten noch automatisch selbstständige Lebensraumtypen; begrenzte Angaben erlauben nur begrenzte Typisierung.', 'Spatial subareas are neither individual species nor automatically independent habitat types; limited information supports limited classification.'),
 p('Überträgt die Gliederung auf Nadelwald und Fließgewässer, erklärt den Wechsel der Merkmale und benennt eine nicht abgesicherte Feintypisierung.', 'Transfers classification to coniferous woodland and running water, explains changing features and identifies unsupported finer classification.'),
 p('Stehendes gegenüber fließendem Wasser; Laub- gegenüber Nadelwald; vertikale Schichten gegenüber Ufer-/Strömungszonen.', 'Standing versus running water; deciduous versus coniferous woodland; vertical layers versus bank/current zones.')),
 spec('procedure',
 p('Bestimmung nutzt überprüfbare sichtbare Merkmale und die Alternativen einer bereitgestellten Bestimmungshilfe statt bloßer Namensvermutung.', 'Identification uses verifiable visible features and alternatives in a supplied key rather than guessing names.'),
 p('Bestimmt typische Pflanzen und Tiergruppen eines Walds mit einer Hilfe, begründet den gewählten Merkmalsweg und dokumentiert verbleibende Unsicherheit.', 'Identifies typical woodland plants and animal groups using a key, justifies the feature pathway and records remaining uncertainty.'),
 p('Ein grobes Gruppenmerkmal genügt nicht zur sicheren Artbestimmung; Pflanzen-/Tiermerkmale und Lebensräume erfordern passende Hilfen.', 'A broad group feature is insufficient for certain species identification; plant/animal traits and habitats require suitable keys.'),
 p('Verwendet eine neue Gewässerhilfe eigenständig, belegt Pflanzen- und Tierzuordnung und beschränkt eine nur gruppenscharfe Tierbestimmung korrekt.', 'Independently uses a new aquatic key, supports plant and animal assignments and correctly limits animal identification to the available group level.'),
 p('Wald-/Gewässerorganismen, Blätter/Früchte gegenüber Blüten/Wuchsform; Art- gegenüber Gruppenauflösung.', 'Woodland/aquatic organisms, leaves/fruits versus flowers/growth form; species versus group resolution.')),
 spec('representation',
 p('Nahrungsketten sind Ausschnitte verzweigter Nahrungsnetze; Pfeile können die Übertragung von Stoffen und Energie von Nahrung zu Verbraucher darstellen.', 'Food chains are parts of branching webs; arrows can show matter and energy transfer from food to consumer.'),
 p('Zeichnet eine neue Kette und ein verzweigtes Netz mit definierter Pfeilkonvention, ordnet Produzenten/Konsumenten/Destruenten ein und beschreibt Räuber-Beute und Parasit-Wirt.', 'Draws a new chain and branching web with a defined arrow convention, assigns producers/consumers/decomposers and describes predation and parasitism.'),
 p('Destruenten nutzen Reste verschiedener Ebenen; Symbiose und Prädation haben andere Partnerwirkungen, und indirekte Netzfolgen sind bedingte Modellhypothesen.', 'Decomposers use remains from different levels; symbiosis and predation affect partners differently, and indirect web effects are conditional model hypotheses.'),
 p('Überträgt Kette/Netz auf ein anderes Ökosystem, erklärt beidseitigen Nutzen einer Symbiose und leitet eine nachvollziehbare indirekte Folge samt Grenze ab.', 'Transfers chain/web representation to another ecosystem, explains mutual benefit in symbiosis and derives a traceable indirect effect with its limits.'),
 p('Wald und Teich; Parasitismus gegenüber Symbiose; direkte Nahrungsbeziehung gegenüber indirekter Netzfolge.', 'Woodland and pond; parasitism versus symbiosis; direct feeding relationships versus indirect web effects.')),
 spec('experiment',
 p('Abiotische Faktoren müssen tatsächlich mit passenden Verfahren, Einheiten/Skalen und vergleichbaren Bedingungen erhoben werden; Messung und biologische Deutung sind getrennt.', 'Abiotic factors must actually be measured with suitable methods, units/scales and comparable conditions; measurement and biological interpretation are distinct.'),
 p('Führt wiederholte eigene Temperatur-/Lichtmessungen durch, protokolliert Ort, Zeit, Gerät und Unsicherheit und erklärt eine fachlich begründete mögliche Wirkung anhand eigener Ergebnisse.', 'Performs repeated personal temperature/light measurements, records site, time, instrument and uncertainty and explains a justified possible effect using personal results.'),
 p('Eine Standortmessung belegt keine vollständige Toleranzkurve oder sichere Ursache einer Bestandsänderung; abiotische Wirkungen hängen von Art und weiteren Faktoren ab.', 'Site measurements establish neither a complete tolerance curve nor a certain cause of population change; abiotic effects depend on species and other factors.'),
 p('Erhebt in einem anderen sicheren Standortkontext tatsächlich einen weiteren abiotischen Faktor, deutet eigene Werte und trennt Beobachtung, begründete Hypothese und fehlenden Kausalnachweis.', 'Actually measures another abiotic factor in a different safe site context, interprets personal readings and separates observation, justified hypothesis and missing causal proof.'),
 p('Waldschatten/Lichtkante gegenüber Wassertiefen; Beleuchtungsstärke gegenüber pH; unterschiedliche Verfahren und Einflussmechanismen.', 'Woodland shade/edge versus water depths; illuminance versus pH; different methods and influence mechanisms.')),
 spec('concept',
 p('Artenvielfalt hängt von unterschiedlichen geeigneten Lebensbedingungen und Beziehungen ab; Biotopschutz erhält Fortpflanzungs-, Nahrungs- und Rückzugsräume.', 'Species diversity depends on varied suitable conditions and relationships; habitat protection retains reproduction, feeding and refuge sites.'),
 p('Begründet in einem unbekannten Waldbeispiel die Bedeutung von Vielfalt und Habitatstrukturen und erklärt den Wirkmechanismus einer geeigneten Schutzmaßnahme.', 'Justifies diversity and habitat structures in an unfamiliar woodland example and explains the mechanism of a suitable conservation measure.'),
 p('Erholungsnutzung, konkrete Sicherheit und Artenschutz brauchen eine begründete Abwägung; Strukturvielfalt allein beweist keine bestimmte Artenzahl.', 'Recreation, specific safety and species protection need reasoned weighing; structural diversity alone establishes no species count.'),
 p('Überträgt die Schutzbegründung auf ein Gewässerufer, vergleicht Alternativen mit Erholungsnutzung und entwirft eine passende Erfolgskontrolle ohne Erfolg zu behaupten.', 'Transfers the conservation rationale to a water margin, compares options including recreation and proposes suitable monitoring without claiming success.'),
 p('Totholz-/Altersstruktur im Wald gegenüber Ufer-/Laichplatzstruktur; Gefahrmanagement gegenüber Zugangsplanung.', 'Dead-wood/age structure versus bank/spawning structure; hazard management versus access planning.')),
 spec('experiment',
 p('Bodenuntersuchung erschließt unbelebte Biotopbedingungen und beobachtbare Biozönose getrennt; tatsächliche Probe, methodische Beobachtung und eigenes Ergebnisprotokoll sind erforderlich.', 'Soil investigation distinguishes non-living biotope conditions from observable biocenosis; an actual sample, methodical observation and a personal results protocol are required.'),
 p('Untersucht tatsächlich eine schonend entnommene kleine Bodenprobe, dokumentiert Methoden, Rohbefunde und Grenzen auch digital und ordnet Merkmale Biotop oder Lebensgemeinschaft zu.', 'Actually investigates a carefully taken small soil sample, documents methods, raw findings and limits digitally and assigns features to biotope or community.'),
 p('Eine kleine Bodenprobe deckt nicht die ganze Gemeinschaft ab; unterschiedliche Proben können Hinweise, aber ohne Vergleichskontrolle keinen eindeutigen Kausalnachweis liefern.', 'A small soil sample does not cover the entire community; different samples provide indications but not an unambiguous causal proof without comparison controls.'),
 p('Führt eine zweite tatsächliche vergleichende Bodenuntersuchung mit gleichen Proben-/Suchbedingungen durch, protokolliert digital und erklärt Unterschiede sowie Störfaktoren.', 'Performs a second actual comparative soil investigation with matched sampling/search conditions, records digitally and explains differences and confounders.'),
 p('Streu/Oberboden gegenüber bewachsenem/betretenem Boden; Struktur, Feuchte, Temperatur und sichtbar bestimmbare Gruppen.', 'Litter/topsoil versus vegetated/trodden soil; structure, moisture, temperature and visible identifiable groups.')),
 spec('representation',
 p('Bodenorganismen setzen organische Substanz um; Humusbildung und Mineralisierung verändern Stoffbindungen über die Zeit, während Energie genutzt und als Wärme entwertet wird.', 'Soil organisms transform organic matter; humus formation and mineralization change matter over time, while energy is used and dissipated as heat.'),
 p('Stellt Stoff- und Energiepfade getrennt dar und erklärt Entstehung, möglichen späteren Abbau von Humus sowie Freisetzung mineralischer Nährstoffe.', 'Represents matter and energy pathways separately and explains humus formation, possible later decomposition and release of mineral nutrients.'),
 p('Umweltbedingungen beeinflussen Umsatzgeschwindigkeit; Humus ist kein unveränderlicher Endpunkt und Energie kein im Boden geschlossener Kreislauf.', 'Environmental conditions affect turnover speed; humus is no immutable endpoint and energy does not cycle in a closed soil system.'),
 p('Deutet unterschiedliche Modellverläufe über die Zeit und verbindet den Nährstoffpfad zur Pflanze mit der nötigen neuen Energiezufuhr, ohne aus mehreren Änderungen eine eindeutige Einzelursache abzuleiten.', 'Interprets different temporal model courses and links nutrient pathways to plants with renewed energy inputs without attributing several simultaneous changes to one certain cause.'),
 p('Organische Streu/Humus/anorganische Nährstoffe; schnelle gegenüber langsamer Umsetzung; Stoffpfad zur Pflanze gegenüber Wärmeabgabe.', 'Organic litter/humus/inorganic nutrients; fast versus slow turnover; matter pathways to plants versus heat release.')),
 spec('representation',
 p('Kohlenstoffatome wechseln zwischen CO₂, organischen Pflanzenstoffen, Bodensubstanz und Organismen; Fotosynthese und Atmung verbinden belebte und unbelebte Materie.', 'Carbon atoms move between CO₂, organic plant matter, soil matter and organisms; photosynthesis and respiration connect living and non-living matter.'),
 p('Verfolgt ein Kohlenstoffatom in einem einfachen Bodenökosystem, beschriftet Übergänge fachlich und trennt Lichtenergie vom Stofftransfer.', 'Tracks one carbon atom in a simple soil ecosystem, labels transfers correctly and distinguishes light energy from matter transfer.'),
 p('Zeitweilige organische Speicher verzögern Rückkehr; Pflanzenkohlenstoff stammt überwiegend aus CO₂, und Atomerhaltung bedeutet keinen Energiekreislauf.', 'Temporary organic stores delay return; plant carbon comes mainly from CO₂ and atom conservation does not imply an energy cycle.'),
 p('Entwirft einen anderen vollständigen Atomweg mit einem Bodenspeicher und erklärt begrenzte Verweilzeiten und die Unterscheidung gegenüber mineralischen Pflanzennährstoffen.', 'Designs another complete atom pathway with a soil store and explains residence times and the distinction from plant mineral nutrients.'),
 p('Blattstreu gegenüber Wurzelresten; unmittelbarer Umsatz gegenüber zeitweiligem Bodenspeicher; CO₂-Aufnahme gegenüber Mineralstoffaufnahme.', 'Leaf litter versus root remains; rapid turnover versus temporary soil storage; CO₂ uptake versus mineral nutrient uptake.')),
 spec('concept',
 p('Boden stellt Wurzelraum, Wasser-/Nährstoffspeicher und Lebensraum bereit; deren Erhalt trägt langfristige Lebensmittelproduktion.', 'Soil supplies rooting space, water/nutrient storage and habitat; maintaining them supports long-term food production.'),
 p('Beurteilt Bodenfunktionen und charakterisiert eine nachvollziehbare Kette menschlicher Eingriffe über Bodenschäden bis zur Lebensmittelversorgung.', 'Assesses soil functions and characterizes a traceable chain of human interventions through soil damage to food provision.'),
 p('Verkettete Wirkungen umfassen Verdichtung, Erosion, Nährstoffverlust und Gewässereintrag; kurzfristige Ertragssteigerung ersetzt keine Nachhaltigkeitsabwägung.', 'Linked effects include compaction, erosion, nutrient loss and water inputs; short-term yield gains do not replace sustainability assessment.'),
 p('Überträgt die Kettenanalyse auf einen anderen Nutzungskontext und begründet eine vorbeugende Maßnahme einschließlich Folgen für Menschen und eines Zielkonflikts.', 'Transfers chain analysis to another land-use context and justifies a preventive measure including human consequences and a trade-off.'),
 p('Nasses Befahren/Verdichtung gegenüber fehlender Bodenbedeckung/Erosion; lokale Bodenfunktion gegenüber Gewässer- und Versorgungsfolgen.', 'Wet-soil traffic/compaction versus missing cover/erosion; local soil functions versus water and supply consequences.')),
 spec('data',
 p('Verbreitungskarten zeigen Nachweise in räumlichem Bezug; Temperatur, Wasser und Licht können zusammen die Eignung eines Lebensraums beeinflussen.', 'Distribution maps show spatially referenced records; temperature, water and light may jointly influence habitat suitability.'),
 p('Deutet eine neue räumliche Verteilung mit mindestens zwei passenden abiotischen Faktoren und belegt die Interpretation an den Kartenzellen.', 'Interprets an unfamiliar distribution with at least two suitable abiotic factors and supports it using map cells.'),
 p('Nichtnachweis und Korrelation beweisen weder Abwesenheit noch Kausalität; biotische Einflüsse, Ausbreitung und Erfassungsgrenzen bleiben möglich.', 'A missing record and correlation establish neither absence nor causation; biotic effects, dispersal and survey limits remain possible.'),
 p('Überträgt die Deutung auf eine andere Art/Faktorkombination, formuliert eine alternative Erklärung und fordert geeignete zusätzliche Daten statt exakte Toleranzgrenzen zu erfinden.', 'Transfers interpretation to another species/factor combination, proposes an alternative explanation and requests suitable additional data instead of inventing exact tolerance limits.'),
 p('Wechselwarme Tiere/Temperatur/Licht gegenüber Pflanze/Feuchte/Temperatur; häufige Nachweise gegenüber Anwesenheitsdaten.', 'Ectothermic animals/temperature/light versus plant/moisture/temperature; frequent records versus presence data.')),
 spec('concept',
 p('Eine ökologische Nische beschreibt das Zusammenwirken abiotischer Ansprüche und biotischer Beziehungen/Ressourcennutzung, nicht nur einen räumlichen Wohnort.', 'An ecological niche describes joint abiotic requirements and biotic relationships/resource use, not merely a spatial home.'),
 p('Beschreibt Konkurrenz, Herbivorie und Symbiose mit Partnerwirkungen und erklärt die Nische eines Lebewesens aus biotischen und abiotischen Faktoren.', 'Describes competition, herbivory and symbiosis with partner effects and explains an organism’s niche through biotic and abiotic factors.'),
 p('Nischenunterschiede können Ressourcenkonkurrenz verringern; Veränderungen des Faktorengefüges beeinflussen Zusammensetzung und Häufigkeiten der Biozönose bedingt.', 'Niche differences can reduce resource competition; changing factor combinations conditionally affect community composition and abundance.'),
 p('Erklärt Konkurrenzvermeidung in einem anderen Beispiel und leitet eine begründete mögliche Gemeinschaftsänderung ab, ohne aus gleichem Habitat gleiche Nischen oder sichere Zahlen zu folgern.', 'Explains competition avoidance in another example and derives a justified possible community change without inferring identical niches or certain counts from shared habitat.'),
 p('Pflanze/Pilz/Fraß gegenüber zeitlich-räumlicher Ressourcenteilung von Vögeln; Begünstigung gegenüber Hemmung.', 'Plant/fungus/herbivory versus temporal-spatial resource partitioning in birds; facilitation versus inhibition.')),
 spec('concept',
 p('Biodiversität umfasst genetische, Arten- und Ökosystemvielfalt; Mutation/Rekombination, Selektion und Isolation tragen zu ihrer evolutionären Entstehung bei.', 'Biodiversity includes genetic, species and ecosystem diversity; mutation/recombination, selection and isolation contribute to its evolutionary origin.'),
 p('Erklärt Ursprung und Ebenen der Vielfalt an einem neuen Beispiel und begründet ihre Bedeutung sowie Schutz und nachhaltige Nutzung.', 'Explains origins and levels of diversity in a new example and justifies its significance, protection and sustainable use.'),
 p('Vielfalt kann Funktionen und Anpassungsmöglichkeiten tragen, garantiert aber keine beliebige Leistung oder vollständige Widerstandsfähigkeit; Nutzung muss Regeneration und Lebensräume berücksichtigen.', 'Diversity can support functions and adaptive options but guarantees neither every service nor complete resilience; use must consider regeneration and habitats.'),
 p('Verknüpft genetische Variation und Vielfalt in einer anderen Anwendung mit begrenztem Risikovorteil und einer nachvollziehbaren Schutz-/Nutzungsentscheidung.', 'Connects genetic variation and diversity in another application with a bounded risk benefit and a traceable conservation/use decision.'),
 p('Natürliche Isolation/Artbildung gegenüber Sortenauswahl; Ebenen der Vielfalt und unterschiedliche Erhaltungs-/Nutzungsziele.', 'Natural isolation/speciation versus cultivar selection; levels of diversity and differing conservation/use goals.')),
 spec('concept',
 p('Biologische Anwendungen müssen nach ökologischen, ökonomischen, politischen und sozialen Folgen beurteilt und wertbezogen bewertet werden.', 'Biological applications require assessment of ecological, economic, political and social consequences and value-based evaluation.'),
 p('Vergleicht mindestens zwei konkrete Optionen aus allen vier Perspektiven, trennt Sachannahmen/Werte und begründet eine Entscheidung mit transparenten Kriterien.', 'Compares at least two options from all four perspectives, separates assumptions/values and justifies a decision with transparent criteria.'),
 p('Abwägung hängt von Datenqualität, Zeithorizont und Wertegewichtung ab; eine einzelne positive Wirkung beweist keine umfassende Nachhaltigkeit.', 'Evaluation depends on data quality, time horizon and value weighting; one positive effect does not establish overall sustainability.'),
 p('Überträgt die vier Perspektiven auf eine andere biologische Anwendung, nennt fehlende Bilanzdaten und erläutert eine bedingte Entscheidung sowie eine vertretbare alternative Gewichtung.', 'Transfers the four perspectives to another biological application, identifies missing balance data and explains a conditional decision and a defensible alternative weighting.'),
 p('Biologischer Pflanzenschutz gegenüber Algen-Biomasse; Nichtzielschutz und Zugang gegenüber Fläche/Wasser/Lebenszyklusbilanz.', 'Biological pest control versus algal biomass; non-target protection/access versus land/water/life-cycle balance.')),
 spec('modeling',
 p('Exponentielles Wachstum setzt konstantes Pro-Kopf-Wachstum voraus; logistisches Wachstum modelliert eine dichteabhängige Begrenzung durch K.', 'Exponential growth assumes constant per-capita growth; logistic growth models density-dependent limitation through K.'),
 p('Modelliert zwei neue Verläufe mit passenden Gleichungen, deutet r und K sowie dichteabhängige Mechanismen und prüft die Passung der Daten.', 'Models two unfamiliar courses with suitable equations, interprets r and K and density-dependent mechanisms and assesses data fit.'),
 p('Umweltkapazität kann sich ändern; äußere Störung/Entnahme sind nicht automatisch identisch mit Dichte-Rückkopplung, und langfristige Extrapolation hat biologische Grenzen.', 'Environmental capacity can change; external disturbance/harvesting is not automatically the same as density feedback, and long-term extrapolation has biological limits.'),
 p('Erweitert ein logistisches Modell mit K(t) und begrenzter Entnahme, deutet Wachstumszeichen und benennt Grenzen bei kleinem Bestand statt negative Tiere vorherzusagen.', 'Extends a logistic model with K(t) and bounded harvesting, interprets growth signs and identifies limits at low abundance rather than predicting negative animals.'),
 p('Unbegrenzte Modellverdopplung gegenüber begrenzter Kapazität; konstante gegenüber veränderliche K und externer Entnahme.', 'Unbounded model doubling versus limited capacity; constant versus varying K and external harvesting.')),
 spec('representation',
 p('Stoffkreisläufe verbinden Reservoirs und biologische/chemische Umwandlungen; Kohlenstoff- und Stickstoffwege sind von gerichtetem Energiefluss zu unterscheiden.', 'Matter cycles connect reservoirs and biological/chemical transformations; carbon and nitrogen pathways differ from directional energy flow.'),
 p('Analysiert Kohlenstoffspeicher/-flüsse, berechnet eine abgegrenzte Nettobilanz und erklärt Produzenten-, Konsumenten- und Destruentenbeiträge sowie eine Störung.', 'Analyzes carbon stores/fluxes, calculates a bounded net balance and explains producer, consumer and decomposer roles and a disturbance.'),
 p('Stickstofffixierung, Ammonifikation, Nitrifikation, Assimilation und Denitrifikation verbinden unterschiedliche N-Formen; zusätzliche Einträge können das System stören.', 'Nitrogen fixation, ammonification, nitrification, assimilation and denitrification connect different nitrogen forms; additional inputs can disturb the system.'),
 p('Ordnet in einem neuen LK-/EA-Stickstofffall die Prozesse richtig zu, erklärt Pflanzennutzung von gebundenem N und leitet eine plausible Folge von Düngereintrag ab.', 'Correctly assigns processes in a new advanced-course nitrogen case, explains plant use of bound nitrogen and derives a plausible fertilizer-input consequence.'),
 p('Kohlenstoffbilanz/Speicherbelüftung gegenüber Stickstoffformen/Eintrag; Kohlenstoff für GK/LK, Stickstoff ausdrücklich LK/EA-Vertiefung.', 'Carbon balance/store aeration versus nitrogen forms/inputs; carbon for basic/advanced courses and nitrogen explicitly advanced-course extension.')),
 spec('concept',
 p('Regionale Klima- und lokale Standortfaktoren wirken gemeinsam auf Lebensbedingungen; Temperaturvorteile können durch Wasserbegrenzung oder weitere Faktoren aufgehoben werden.', 'Regional climate and local site factors jointly affect living conditions; temperature advantages may be cancelled by water limitation or other factors.'),
 p('Bewertet Temperatur, Wasser, Exposition und Boden als Steuergrößen in einem unbekannten Standortvergleich und leitet bedingte unterschiedliche Folgen ab.', 'Evaluates temperature, water, aspect and soil as controls in an unfamiliar site comparison and derives different conditional effects.'),
 p('Wetter, Klima, Standort und artspezifische Reaktion sind zu trennen; ein Überblicksmodell ist kein Ersatz für einen ökologischen-Potenz-Laborversuch.', 'Weather, climate, site and species response are distinct; an overview model does not replace an ecological-potency laboratory experiment.'),
 p('Wägt im neuen Höhenlagen-/Tieflandvergleich gegenläufige Wirkungen ab und benennt erforderliche Daten und Grenzen ohne universelle Prognose oder Versuchsdurchführung zu behaupten.', 'Weighs opposing effects in a new upland/lowland comparison and names needed data and limits without claiming universal predictions or experimental performance.'),
 p('Exposition und Bodenwasser gegenüber Höhenlage/Vegetationszeit; Temperatur- gegenüber Wasserlimitierung.', 'Aspect and soil water versus elevation/growing season; temperature versus water limitation.')),
 spec('concept',
 p('Bei Sukzession verändern vorhandene Arten Bedingungen für spätere Arten; geänderte Bedingungen und Konkurrenz verändern wiederum Vielfalt und Zusammensetzung.', 'During succession existing species alter conditions for later species; changed conditions and competition in turn alter diversity and composition.'),
 p('Erklärt an einer zeitlichen Folge beide Wirkungsrichtungen zwischen Arten und Sukzession und unterscheidet Artenwechsel von nachgewiesener Zunahme der Gesamtartenzahl.', 'Explains both causal directions between species and succession in a temporal sequence and distinguishes turnover from proven increases in total richness.'),
 p('Störung und Management können Sukzession verändern; unterschiedliche Stadien können auf Landschaftsebene ein vielfältiges Mosaik bilden, ohne dass jedes spätere Stadium artenreicher sein muss.', 'Disturbance and management can alter succession; differing stages may form a diverse landscape mosaic without every later stage being richer.'),
 p('Überträgt die Erklärung auf Sturmlichtungen/Offenhaltung, begründet Mosaikvielfalt und benennt Datenbedarf sowie Grenzen einer maximalen-Artenzahl-Bewertung.', 'Transfers the explanation to storm clearings/maintained openness, justifies mosaic diversity and names data needs and limits of assessing solely maximal richness.'),
 p('Ackeraufgabe gegenüber Waldstörung; zeitliche Folge gegenüber räumlichem Mosaik; natürliche Entwicklung gegenüber Offenhaltung.', 'Field abandonment versus woodland disturbance; temporal sequence versus spatial mosaic; natural development versus maintained openness.')),
 spec('concept',
 p('Biodiversität besitzt genetische, Arten- und Ökosystemdimensionen; Schutzstrategien müssen konkrete Gefährdungsursachen und benötigte Lebensbedingungen adressieren.', 'Biodiversity has genetic, species and ecosystem dimensions; strategies must address actual threats and required conditions.'),
 p('Begründet Biodiversitätsschutz, vergleicht Ursachenschutz/Habitatverbund mit einer symptomatischen Maßnahme und erklärt artspezifische Wirkmechanismen.', 'Justifies biodiversity protection, compares causal protection/habitat connectivity with a symptomatic measure and explains species-specific mechanisms.'),
 p('Renaturierung, Erhalt und Belastungsverminderung ergänzen sich; Schutzwert ist nicht gleich maximale Artenzahl und Erfolg braucht überprüfbare aktuelle Befunde.', 'Restoration, conservation and reducing loads complement one another; conservation value is not maximal richness and success requires verifiable current evidence.'),
 p('Entwickelt für einen anderen Gewässerkontext begründete Schutzoptionen mit Erfolgskontrolle, Zielkonflikt und verbleibender Unsicherheit statt Bauabschluss als Erfolg auszugeben.', 'Develops justified options for another water context with monitoring, a trade-off and uncertainty rather than presenting construction completion as success.'),
 p('Artspezifischer Habitatverbund gegenüber Ökosystemrenaturierung; Barrieren gegenüber Stoffeinträgen; Arten- gegenüber Funktionsschutz.', 'Species-specific connectivity versus ecosystem restoration; barriers versus chemical inputs; species versus functional protection.')),
 spec('concept',
 p('Landnutzung, stoffliche Verschmutzung und Klimawandel verändern Habitate, Stoffhaushalte und Standortbedingungen mit möglichen Wechselwirkungen.', 'Land use, chemical pollution and climate change alter habitats, material balances and site conditions with possible interactions.'),
 p('Beschreibt für alle drei Eingriffstypen einen fachlich richtigen Wirkpfad und erklärt eine mögliche Kombination, ohne nicht gemessene Zustände als Befunde auszugeben.', 'Describes a scientifically correct pathway for all three intervention types and explains a possible combination without reporting unmeasured conditions as findings.'),
 p('Mechanismen erlauben bedingte Aussagen; Wirkung hängt von Art, Dosis, Zeit und Umfeld ab, und langfristiger Klimawandel ist von einzelnen Wetterereignissen zu trennen.', 'Mechanisms support conditional statements; effects depend on species, dose, time and surroundings, and long-term climate change differs from individual weather events.'),
 p('Überträgt die drei Wirkpfade auf eine andere Landschaft, erklärt eine Verstärkung und schlägt vergleichbare Daten zur Prüfung vor statt exakte lokale Aussterbezahlen abzuleiten.', 'Transfers the three pathways to another landscape, explains reinforcement and proposes comparable data to test it instead of inferring exact local extinction counts.'),
 p('Gewässereintrag/Uferverlust/Erwärmung gegenüber Landschaftsumwandlung/Pestizidtransport/Trockenheit; lokale gegenüber kombinierte Wirkungen.', 'Water inputs/lost banks/warming versus landscape conversion/pesticide transport/drought; local versus combined effects.')),
 spec('concept',
 p('Nachhaltige Ressourcennutzung erhält langfristige Regeneration, Vorräte und ökologische Funktionen statt allein kurzfristige Entnahme zu maximieren.', 'Sustainable resource use maintains long-term regeneration, stocks and ecological functions instead of maximizing short-term extraction alone.'),
 p('Erläutert Nutzungskonzepte mit Entnahme, Wiederaufbau, Funktionsschutz und zeitlichem Horizont und erklärt, warum Nachpflanzung allein keinen Nachhaltigkeitsnachweis liefert.', 'Explains concepts using extraction, renewal, functional protection and time horizon and why replanting alone does not prove sustainability.'),
 p('Auch erneuerbare Ressourcen sind begrenzt; adaptive Regeln brauchen belastbare Daten, ökologische Mindestbedingungen und begründete Verteilung bei Zielkonflikten.', 'Renewable resources remain limited; adaptive rules need reliable data, ecological minimum conditions and reasoned allocation under trade-offs.'),
 p('Überträgt das Konzept auf Grundwassernutzung, erläutert Rückkopplung und gerechte Grundversorgung und grenzt die eigene Erläuterung von vollständiger Ökosystemleistungs-/Naturwertebewertung ab.', 'Transfers the concept to groundwater, explains feedback and fair basic provision and distinguishes the explanation from complete ecosystem-service/nature-value assessment.'),
 p('Holzbestand/Altersstruktur gegenüber Grundwasserneubildung; Nachpflanzung gegenüber adaptiven Entnahmeregeln und Verteilung.', 'Timber/age structure versus groundwater recharge; replanting versus adaptive extraction rules and allocation.')),
]

assert len(S) == len(materials['goals']) == 20
review_id = 'biologie-ecology20-current391-positive-author-v2'
candidates = {'schemaVersion': 1, 'authoringContract': 'positive-understanding-evidence-candidates-v1',
              'reviewId': review_id, 'reviewedAt': datetime.now(timezone.utc).isoformat().replace('+00:00','Z'),
              'reviewer': 'codex-ecology20-author-model-family-gpt-6-exact-serving-revision-unavailable', 'goals': []}
for n,(item,s) in enumerate(zip(materials['goals'],S),1):
    g = item['wholeGoal']
    archetype, concept, performance, transfer, transferPerformance, variation = s
    expectations=[]
    for suffix,understand,observable in [('core',concept,performance),('transfer',transfer,transferPerformance)]:
        expectations.append({'id':f'ecology20-{n:02d}-{suffix}',
            'essentialUnderstandingDe':understand[0], 'essentialUnderstandingEn':understand[1],
            'observablePerformanceDe':observable[0], 'observablePerformanceEn':observable[1]})
    cases=[]
    for c in item['cases']:
        cases.append({'id':c['id'],
           'taskDemandDe':c['material']['de']+' '+c['task']['de'],
           'taskDemandEn':c['material']['en']+' '+c['task']['en'],
           'expectedPerformanceDe':c['modelAnswer']['de'],
           'expectedPerformanceEn':c['modelAnswer']['en'],
           'understandingFocusDe':concept[0]+' '+transfer[0],
           'understandingFocusEn':concept[1]+' '+transfer[1]})
    dissent=['Autorprofil und eigene Modellfälle sind E1/G1-Kandidaten, keine Lernendenbeobachtung, menschliche Prüfung oder Freigabe. Endgültige aktuelle Bild-/Seitenbindung und unabhängige D/P/V-Prüfung stehen aus.']
    if n in (4,6): dissent.append('Spätere tatsächliche Durchführung mit eigenen Ergebnissen ist erforderlich; ein Plan, Modellmaterial oder Mustertext ersetzt die Messung/Bodenuntersuchung nicht.')
    if n<=5: dissent.append('HE 7.3 verlangt zusätzlich eine fachlich vorbereitete Exkursion; diese Fälle behaupten weder Durchführung noch Abschluss der gesamten Unterrichts-/Quellenpflicht.')
    if n==15: dissent.append('HE Q3.1: Kohlenstoff GK/LK; Stickstoff ist LK, BY EA. Das gemeinsame Profil erweitert keine quellenspezifische Grundkursverpflichtung.')
    if n==16: dissent.append('BY sourceGoalId 1d8afbf7-53ac-5e23-9c55-017759c91883 verlangt ökologische Potenz mit Laborversuchen; der Klima-/Standortüberblick liefert nur einen Teil. Laborpflicht und Potenzanalyse bleiben HOLD, keine volle Quellenzulassung.')
    if n==17: dissent.append('HE Q4.2 ist kein allgemein verbindliches Q4-Themenfeld; Artenvielfalt/Sukzession ist LK-Vertiefung. Keine universelle Länder-/GK-Zulassung.')
    if n in (18,20): dissent.append('BY Ökosystemleistungs-Kategorien, systematischer Ökosystemmanagementvergleich und anthropozentrische Werteabwägung gehen über einzelne Schutz-/Nutzungserläuterungen hinaus. Diese Quellenteile bleiben offen; keine ganze Passage ist freigegeben.')
    profile={'archetype':archetype,'expectations':expectations,
      'coverageExpectations':{'requiredExpectationIds':[e['id'] for e in expectations], 'alternativeExpectationGroups':[],
          'minimumIndependentDemonstrations':2,'freshVariationRequired':True,'independentTransferRequired':True},
      'variationAxes':[{'id':f'ecology20-{n:02d}-context-and-mechanism','textDe':variation[0],'textEn':variation[1]}],
      'applicationCaseBriefs':cases}
    candidates['goals'].append({'goalId':g['id'],
      'reason':'Neuer vollständiger zweisprachiger Autor-Kandidat für den unveränderten aktuellen Zieltext. Zwei sachhaltig verschiedene vollständige Anwendungsfälle mit Materialien und Erwartungsantworten prüfen alle Zielaspekte sowie eigenständige Variation; kein Lernenden- oder menschlicher Freigabenachweis. Bildbindung erst nach tatsächlichen finalen Rastern und unabhängiger Prüfung.',
      'evidenceLevel':'E1','maximumClaimScope':'G1','dissent':dissent,'profile':profile})

(D/'P20.current-text-preimage.author.candidates.json').write_text(json.dumps(candidates,ensure_ascii=False,indent=2)+'\n')
prefix=str(D.relative_to(ROOT))
config={'$schema':'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
  'schemaVersion':2,'reviewId':review_id,'goalFingerprintRuleVersion':'goal-evidence-v1',
  'profileRuleVersion':'positive-understanding-evidence-v2','landscapeId':'08a43a1b-d97e-522c-9dfa-c950a493364e',
  'landscapePath':prefix+'/input-snapshots/01-DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',
  'semanticKindLedgerPath':prefix+'/input-snapshots/02-biologie.semantic-kinds.json',
  'reviewCriteriaPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md',
  'reviewPath':prefix+'/P20.current-text-preimage.author.review.jsonl','reviewRunManifestPaths':[],
  'reviewedResourceTypes':['goal-visualization'],'requireApproved':False,
  'scope':{'label':'20 unchanged current ecology author profiles; before new raster bindings, not strict closure',
          'goalIds':[i['goalId'] for i in materials['goals']]}}
(D/'P20.current-text-preimage.author.config.json').write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'profiles':20,'completeCasePairs':40,'schemaVersion':2,'reviewAuthority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1','reviewRunIds':[],'finalRasterBindingPending':True,'activeWrites':False},indent=2))
