import json, hashlib
from pathlib import Path
from datetime import datetime, timezone

HERE = Path(__file__).resolve().parent
rows = []
def row(prefix, decision, reason, u_de, u_en, p_de, p_en, t_de, t_en):
    rows.append(dict(prefix=prefix, decision=decision, rationale=reason,
        understandingEvidence=dict(essentialUnderstandingDe=u_de, essentialUnderstandingEn=u_en,
          observablePerformanceDe=p_de, observablePerformanceEn=p_en,
          transferExpectationDe=t_de, transferExpectationEn=t_en),
        evidenceProfileRecommendation='none'))

row('ecce0306','keep',
 'Die Erläuterung zweier Elektrolytmodelle mit Anwendungsbewertung bildet eine zusammenhängende Brennstoffzellenkompetenz. HE50 nennt beide Elektrolyte ausdrücklich. Die Fälle 01a/b fordern eigene Ladungs- und Stoffbilanzen sowie getrennte lokale und vorgelagerte Emissionsgrenzen; 495 kWh und 198 kg sind reproduziert. Keine pauschale vollständige nationale Quellen- oder Kursfreigabe.',
 'Saurer und alkalischer Elektrolyt schließen den inneren Stromkreis mit verschiedenen Ionen; die Elektronen liefern außen Arbeit. Dieselbe Gesamtreaktion legt weder die Wasserbildungsstelle noch die Umweltbilanz der Bereitstellung fest.',
 'Acidic and alkaline electrolytes close the internal circuit with different ions while electrons deliver external work. The same overall reaction fixes neither the location of water formation nor the upstream environmental balance.',
 'Die lernende Person entwickelt die sauren und alkalischen Teilgleichungen, verfolgt H+, OH− und Elektronen und begründet eine Einsatzentscheidung mit Wasserstoffherkunft und Versorgung statt nur mit dem Wasser am Ausgang.',
 'The learner constructs acidic and alkaline half-reactions, traces H+, OH− and electrons, and justifies an application decision using hydrogen provenance and supply rather than water at the outlet alone.',
 'Bei einem Wechsel von flüssiger KOH zu einer anionenleitenden Membran trennt sie erhaltene Redoxbilanz von neu zu prüfendem Elektrolyt- und Wassermanagement.',
 'When liquid KOH is replaced by an anion-conducting membrane, the learner distinguishes the retained redox balance from electrolyte and water management requiring new evidence.')

row('16b24dc5','keep',
 'Die aktuelle englische Fassung enthält die Einsatzmöglichkeiten ausdrücklich und entspricht DE sowie dem ganzen BY-Operator. Recherche, Funktionsbeschreibung und Quellenurteil dienen derselben Bewertung eines Sekundärzelleneinsatzes. 02a/b und die leeren Eigenprotokolle erhalten die tatsächliche spätere Recherche als Erwerbs-/Bewertungskriterium. Eine ausgefüllte Musterlösung ist keine Lernendenrecherche; bereits absolvierte Versuche werden nicht zur Voraussetzung maschineller Qualität erklärt. V-Kontext und sechs M-Stales bleiben separat offen.',
 'Ein Akkumulator speichert zugeführte Energie durch eine geeignete umkehrbare Redoxanordnung. Ah, Wh und verfügbare Leistung sind verschieden, und ein Einsatzurteil hängt von Messbedingungen und belastbaren Quellen ab.',
 'A rechargeable cell stores supplied energy through a suitable reversible redox arrangement. Ah, Wh and available power differ, and judging a use depends on test conditions and defensible sources.',
 'Die lernende Person erläutert Laden und Entladen eines Lithium- oder Bleisystems, bewertet einen konkreten Energiebedarf und dokumentiert eine selbst gefundene Quelle mit Urheber, Bedingung, gekennzeichnetem Zitat und eigener Paraphrase.',
 'The learner explains charge and discharge in a lithium or lead system, judges a concrete energy requirement, and documents an independently located source with authorship, conditions, a marked quotation and an original paraphrase.',
 'Bei einem Notgerät mit hohem Einschaltstrom prüft sie zusätzlich die Leistungs- und Spannungsgrenze und erklärt, weshalb ausreichende Wh die Eignung nicht allein sichern.',
 'For an emergency device with high startup current, the learner additionally checks power and voltage limits and explains why enough Wh alone does not establish suitability.')

row('e64a79df','block',
 'Die chemischen Aussagen und die jetzt vollständige Sprachparität sind vertretbar. Die genaue aktuelle GK/LK-Geltung ist jedoch nicht geklärt: HE50 weist Triglyceridgemisch und Pflanzenölnutzung dem grundlegenden Niveau, Methanol-Umesterung/Biodiesel einem zusätzlichen LK-Bullet zu. Das ganze aktuelle Ziel samt Tags fordert beides. Die Markierung einzelner Fallaufträge als LK löst die kanonische Kursgrenze nicht. Eine verantwortliche Freigabe benötigt eine geprüfte Projektion oder einen gesondert geprüften Zuschnitt; keine stillschweigende Beschreibungsreparatur und kein übernommener Child-Split.',
 'Pflanzenöl ist überwiegend ein Gemisch von Triglyceriden, Biodiesel ein anderes Estergemisch. Umesterung verändert den Alkoholrest; Herkunft, Flächennutzung und Motorfreigabe sind eigenständige Bewertungsbedingungen.',
 'Vegetable oil is predominantly a triglyceride mixture, whereas biodiesel is a different ester mixture. Transesterification changes the alcohol residue; provenance, land use and engine approval are distinct conditions of evaluation.',
 'Die lernende Person unterscheidet Öl und Methylester strukturell, entwickelt das Verhältnis ein Triglycerid zu drei Methanol und diskutiert Rohstofffolgen. Diese Leistung darf für den zusätzlichen Umesterungsteil nicht automatisch als GK-Pflicht gelten.',
 'The learner distinguishes oil and methyl ester structurally, derives one triglyceride to three methanol, and discusses feedstock impacts. Performance on the additional transesterification part must not automatically be treated as a GK obligation.',
 'Bei Altspeiseöl mit freien Fettsäuren erklärt sie Basenverbrauch durch Neutralisation und trennt diese Nebenreaktion von Umesterung sowie von der ungeklärten Herkunftsbilanz.',
 'For used oil containing free fatty acids, the learner explains base consumption by neutralisation and separates this side reaction from transesterification and the unresolved provenance balance.')

row('a76ab487','keep',
 'Die ganze Stoffkette ist in DE und EN vorhanden und entspricht HE50. Glucosestruktur, Hydrolyse, Gärung und Nutzen-Risiko-Urteil bilden hier eine zielgerichtete Prozessbeschreibung; es wird kein fremder Schwesteroperator ergänzt. 04a/b sichern den Unterschied von Hydrolyse, Gärung, Atmung und Isolierungsverlust. Die 66,24 g und 80 % sind unabhängig nachvollzogen. Praktische Partnerpflichten bleiben erhalten.',
 'Stärke wird durch Bindungsspaltung zu Glucose; Gärung setzt diese unter erhaltener Kohlenstoffbilanz zu Ethanol und CO2 um. Molekülstruktur, Prozessausbeute und Kraftstoffbewertung sind verschiedene Informationsebenen derselben Prozesskette.',
 'Bond cleavage converts starch into glucose; fermentation then produces ethanol and CO2 with conserved carbon. Molecular structure, process yield and fuel evaluation are distinct levels of information within the same process chain.',
 'Die lernende Person zeigt eine erkennbare Glucosestruktur, erklärt die Hydrolyse und bilanziert die Gärung. Sie verknüpft zwei Ausbeuten und begründet Nutzen und Risiken unter einer angegebenen Nutzenergiegrenze.',
 'The learner presents a recognisable glucose structure, explains hydrolysis and balances fermentation. They combine two yields and justify benefits and risks at a stated useful-energy boundary.',
 'Wird Stärke bei gleichem Enzym durch Cellulose ersetzt, erklärt sie aus Bindungsstruktur und Substratspezifität, weshalb gleiche Summenformeln keinen gleichen Ethanolgewinn beweisen.',
 'If starch is replaced with cellulose while retaining the enzyme, the learner uses bond structure and substrate specificity to explain why identical molecular formulas do not prove equal ethanol yield.')

row('7a5a8e37','keep',
 'Der Anwendungsbezug grenzt dieses LK-Ziel vom vorgeschalteten allgemeinen Lithium-Ionen-Ziel ab. 05a ist vollständig mit korrektem geladenem FePO4-Zustand gelesen; 05b trennt Kinetik, Energie und bereits enthaltene Alterung. Die bedingten Reichweiten 333 beziehungsweise 200 km stimmen. Die aktuelle Beschreibung verlangt eine Bewertung, keine bloße Reichweitenformel. Sonstige Quellen-, Memory- und Bildgates bleiben eigenständig.',
 'Interkalation, getrennte Ionen- und Elektronenwege und elektrische Isolation ermöglichen den Akku. Fahrzeugreichweite und Sicherheit hängen zusätzlich von nutzbarer Energie, Last, Temperatur und Schutzsystemen ab.',
 'Intercalation, separate ion and electron paths, and electrical isolation enable the battery. Vehicle range and safety additionally depend on usable energy, load, temperature and protection systems.',
 'Die lernende Person begründet Separator- und Schutzfunktionen mit dem Lade-/Entladeprozess und bewertet eine Fahrt aus nutzbarer Packenergie und Verbrauch einschließlich Reserve und Datengrenzen.',
 'The learner justifies separator and protection functions from charge/discharge processes and judges a trip from usable pack energy and consumption, including reserve and data limitations.',
 'Bei winterlicher Leistungsbegrenzung und höherem Heizverbrauch erklärt sie die unveränderte Redoxstöchiometrie und vermeidet einen zweiten Abzug eines bereits im Winterwert enthaltenen Alterungseffekts.',
 'With winter power limits and higher heating consumption, the learner explains unchanged redox stoichiometry and avoids subtracting ageing twice when it is already included in the winter figure.')

row('d465d82b','keep',
 'Der Text benennt drei Strukturklassen klar und zweisprachig gleich. Der weitergehende BB/BE-Vierklassenbullet wird nicht auf dieses Ziel reduziert: e874 bleibt als Partner sichtbar; Tensidleistung und tatsächliche Messungen liegen bei weiteren Partnern. 06a/b liefern Stoffdaten für pH-abhängige Zuordnung statt unberechtigter Stoffklassengesetze.',
 'Die Ladung des amphiphilen Teilchens beziehungsweise Kopfes bestimmt die ionische Tensidklasse. Ein neutrales Salz insgesamt, ein polarer ungeladener Kopf und ein zwitterionischer Kopf sind nicht gleichzusetzen.',
 'The charge on the amphiphilic species or head determines the ionic surfactant class. Overall salt neutrality, a polar uncharged head and a zwitterionic head must be distinguished.',
 'Die lernende Person kennzeichnet hydrophile Kopfregion, unpolare Kette und Gegenion und begründet die Einordnung eines Sulfatesters, quartären Ammoniumsalzes und Ethoxylats aus deren Struktur.',
 'The learner marks the hydrophilic head, nonpolar chain and counterion and justifies the classification of a sulfate ester, quaternary ammonium salt and ethoxylate from their structures.',
 'Bei einem protonierbaren Amin fordert sie die pH-Bedingung an und erklärt, warum ein zwitterionischer Stoff trotz Nettoladung null kein nichtionisches Tensid ist.',
 'For a protonatable amine, the learner requests the pH condition and explains why a zwitterionic species with zero net charge is not a nonionic surfactant.')

row('1051c091','keep',
 'Der explizite Redoxzusammenhang entspricht den ganzen BY-Beschreibungen. Lichtabhängige Wasseroxidation und CO2-Reduktion bleiben ein Grundprinzip, ohne vollständige Biochemie zu beanspruchen. 07a/b unterscheiden Tracerbefund, Teilbilanz, Nettobilanz und kurze Dunkelreaktion. NI-Sek-I-Bezüge beweisen keine volle obere Stufenpflicht; diese Quellenbindung bleibt offen.',
 'Der freigesetzte Photosynthese-Sauerstoff stammt aus Wasseroxidation, während CO2 reduziert wird. Lichtenergie und gekoppelte Träger ermöglichen die Speicherung, und eine Nettogleichung legt die Atomherkunft nicht allein offen.',
 'Released photosynthetic oxygen comes from water oxidation while CO2 is reduced. Light energy and coupled carriers enable storage, and a net equation alone does not reveal atom provenance.',
 'Die lernende Person deutet die beiden Isotopenansätze, stellt ladungs- und atomerhaltende Teilbilanzen auf und erklärt CH2O als Kohlenhydratäquivalent sowie die Begrenzung kurz fortgesetzter CO2-Fixierung im Dunkeln.',
 'The learner interprets the two isotope experiments, constructs charge- and atom-balanced partial equations, and explains CH2O as a carbohydrate equivalent and the limit of brief continued dark CO2 fixation.',
 'Nach Ersatz von CO2 durch N2 trennt sie weiter mögliche anfängliche O2-Freisetzung vom unbelegten Aufbau neuen kohlenstoffhaltigen Materials.',
 'After CO2 is replaced by N2, the learner distinguishes possible initial O2 release from the unsupported construction of new carbon-containing material.')

row('ceda84ff','keep',
 'Die Beschreibung verlangt die Anwendung zweier bekannter Konzepte auf Energietechnologien und stimmt mit BY C13-EA.5.3 überein. Die Brennstoffzellen-/Flow-Fälle konkretisieren ohne eine vollständige Technologieinventarliste zu fordern. Stoff- und Ladungsbilanz sowie 31,5 und 7,65 kWh sind schlüssig. Thermometrie in der Voraussetzung wird durch Modellrechnungen nicht als ausgeführt behauptet.',
 'Donator-Akzeptor-Reaktionen koppeln Stoffumwandlung an Speicherung oder Abgabe von Energie. Erzwungenes Laden benötigt Energiezufuhr; Energieinhalt beziehungsweise Kapazität und Leistung charakterisieren unterschiedliche Systemeigenschaften.',
 'Donor-acceptor reactions connect material change with storing or releasing energy. Forced charging requires supplied energy; stored energy or capacity and power describe different system properties.',
 'Die lernende Person entwickelt für Wasserstoffkreislauf und abstrakten Flow-Speicher die Rollen und Teilreaktionen, verfolgt die Energiezufuhr und berechnet eine Kette mit konsistentem Heizwertbezug.',
 'The learner derives roles and half-reactions for a hydrogen cycle and an abstract flow store, traces supplied energy, and calculates a chain using a consistent heating-value basis.',
 'Bei größeren Elektroden und unverändertem Tankvolumen erläutert sie die mögliche Leistungsänderung, ohne daraus automatisch größeren chemischen Stoffvorrat abzuleiten.',
 'With larger electrodes but unchanged tank volume, the learner explains the possible power change without automatically inferring a larger chemical reactant inventory.')

row('4d7554d4','keep',
 'Der gesamte BY-Operator zu beiden Werkstoffgruppen und beiden Quellenarten bleibt erhalten. Die Beschreibung erzwingt kein materialbezogenes Vorurteil. 09a/b bieten gleiche Funktion und offengelegte alternative Lebensdauerallokation; die Grenze bei 22 Nutzungen ist richtig. Recycling-, Korrosions- und weitere nationale Partner werden nicht als durch zwei Fälle vollständig erledigt ausgegeben.',
 'Die Eignung von Kunststoff und Metall ergibt sich aus Struktur und derselben Nutzfunktion. Herstellungsaufwand, Nutzungszahl, Reparatur und realer Rücklauf wirken unter einer offen gelegten Bilanzgrenze auf die Bewertung.',
 'Suitability of plastic and metal follows from structure and the same service function. Production burden, reuse count, repair and actual recovery affect evaluation under a declared accounting boundary.',
 'Die lernende Person verbindet Materialeigenschaften mit dem Einsatz, nutzt analoge und digitale Quellen kritisch und begründet einen Nutzungs- oder Lebensdauervergleich, einschließlich der ausdrücklich verschiedenen Grenzen von 150 und 75 MJ.',
 'The learner connects material properties to use, critiques analogue and digital sources, and justifies a reuse or lifetime comparison, including the explicitly different 150 and 75 MJ boundaries.',
 'Nach Verlust einer Mehrwegflasche vor dem rechnerischen Breakeven revidiert sie das Urteil anhand tatsächlicher Nutzungen und erklärt die weiter offenen Hygiene-, Transport- und Zugangskriterien.',
 'If a reusable bottle is lost before the calculated break-even, the learner revises the judgement using actual reuse and explains remaining hygiene, transport and access criteria.')

row('0cf2ffe1','keep',
 'Die vollständige Vergleichskompetenz und alle drei Perspektiven stimmen mit dem ganzen BY-Operator überein. 10a/b trennen elektrische Redoxarbeit, Wärme-Arbeit-Pfad, Vorkette und genutzte Wärme. Die 1,143 gegen 0,414 kg CO2e sind reproduziert; fehlende Kosten erlauben kein Kostenranking. Das aktuell sichtbare Bild ist D-Kontext, hier ohne neues V-Urteil.',
 'Brennstoffzelle und Wärmekraftwerk nutzen verschiedene Umwandlungswege. Erst gemeinsame elektrische Nutzfunktion und tatsächlich genutzte Wärme erlauben einen begrenzten Vergleich; ökologische, ökonomische und soziale Kriterien können verschiedene Entscheidungen stützen.',
 'Fuel cells and thermal plants use different conversion routes. A common electricity service and actually used heat enable a bounded comparison; ecological, economic and social criteria can support different choices.',
 'Die lernende Person rekonstruiert die Umwandlungsketten, normiert die Klimadaten auf eine Kilowattstunde Ausgangsstrom und begründet eine bedingte Wahl mit Kostenwissen, Wartungszugang und Lieferkettenunsicherheit.',
 'The learner reconstructs conversion chains, normalises carbon data to one kilowatt-hour of delivered electricity, and justifies a conditional choice using cost evidence, maintenance access and supply-chain uncertainty.',
 'Bei neu nutzbarer Wärme in einem Wärmenetz legt sie eine gemeinsame Dienstleistung fest und verhindert, dass dieselbe Wärme zugleich als Nutzen und nochmals als Ersatzgutschrift zählt.',
 'When a heat network can use additional heat, the learner declares a common service and prevents the same heat being counted both as useful output and again as a displacement credit.')

row('a78aacf9','keep',
 'Die eine Funktionsanalyse einer Formulierung ist von den vertieften Zeolith-/Abbauzielen abgrenzbar. HE50 nennt die vier Komponentengruppen ausdrücklich; 11a/b stellen ihre verschiedenen Wirkprinzipien und Materialgrenzen konkret bereit. BW3.4.8(4) ist eine Auswahl weiterer Stoffgruppe und begründet keine zusätzliche universelle Waschmittelpflicht; diese Auswahlbindung bleibt erhalten.',
 'Enthärter, Bleichsystem, Enzym und Hilfsstoff erfüllen verschiedene Funktionen. Härtebindung, Oxidation, substratspezifische Hydrolyse und optische Aufhellung sind keine austauschbaren Erklärungen der Fleckentfernung.',
 'Softeners, bleach systems, enzymes and auxiliaries perform different functions. Hardness binding, oxidation, substrate-specific hydrolysis and optical brightening are not interchangeable explanations of stain removal.',
 'Die lernende Person ordnet kontrolliert veränderte Fleckbefunde den Komponenten zu und begründet für Wolle oder Baumwolle die passende Auswahl anhand von Faser, Fleck und Pflegebedingungen.',
 'The learner assigns controlled stain observations to ingredients and justifies a suitable selection for wool or cotton using fibre, stain and care conditions.',
 'Bei einem Fettfleck statt eines Proteinflecks wählt sie die chemisch passende Enzymfunktion und erklärt, weshalb ein optischer Aufheller die erforderliche Hydrolyse nicht ersetzt.',
 'For a fat stain replacing a protein stain, the learner selects the chemically relevant enzyme function and explains why an optical brightener does not replace the required hydrolysis.')

row('a3386a86','keep',
 'Die aktuelle Fassung begrenzt Nernst korrekt auf reversible Spannung und explizite Temperatur-/Aktivitätsbedingungen. Damit verwechselt sie nicht mehr jeden Betriebs-Lastwert mit einer Gleichgewichtsspannung. Die eigenständig nachgerechneten Fälle 12a/b verlangen Q aus Stöchiometrie, Reaktionsskalierung und Referenzdifferenz; 1,189398 V sowie pH14-Werte stimmen. Der ausführliche Begründungsauftrag gehört in das Profil, nicht zwingend vollständig in die kurze Beschreibung. Allgemeine Nernst-/Quellen- und V-Kontextgrenzen bleiben separat.',
 'Die reversible Spannung hängt vom dimensionslosen Reaktionsquotienten und der Elektronenzahl ab. Eine Skalierung der Reaktionsgleichung skaliert beide zusammen; der gemessene Lastabfall ist dadurch nicht vollständig beschrieben.',
 'Reversible voltage depends on the dimensionless reaction quotient and electron count. Rescaling the equation changes both together; this does not fully describe the measured drop under load.',
 'Die lernende Person leitet den Exponenten der Sauerstoffaktivität aus der Gesamtreaktion her, berechnet die reversible Spannung und erklärt, warum die Verdopplung von Gleichung und Elektronenzahl dieselbe Spannung ergibt.',
 'The learner derives the oxygen-activity exponent from the overall reaction, calculates reversible voltage, and explains why doubling the equation and electron count leaves voltage unchanged.',
 'Bei unterschiedlichen Protonenaktivitäten in zwei Kompartimenten erklärt sie, weshalb die vorherige pH-Kürzung nicht ohne Membran- und Referenzbedingungen übernommen werden darf.',
 'For different proton activities in two compartments, the learner explains why the previous pH cancellation cannot be reused without membrane and reference conditions.')

row('3ec31fe1','keep',
 'Berechnen und Vergleichen bezeichnet eine begrenzte anwendungsbezogene Energiekompetenz; ein bloßes Zahlenranking erfüllt den Vergleich nicht. Die vorhandenen vollständigen 13a/b-Fälle operationalisieren Nutzenergie, Wärmebedarf, Kettengrenze und gemeinsame Radarbeit ohne neue Kompetenz. 30/80/50 %, 60/85/70 % und 32,8 % sind korrekt. Die problematische vorgelagerte GK/LK-Bindung von e64 wird dadurch nicht aufgehoben.',
 'Ein Wirkungsgrad ist das Verhältnis des für einen angegebenen Zweck genutzten Energieoutputs zum Input. Teilwirkungsgrad und Gesamtwirkungsgrad sowie abgegebene und tatsächlich genutzte Wärme haben verschiedene Grenzen.',
 'Efficiency is the ratio of energy output used for a stated purpose to input. Partial and overall efficiencies, and available versus actually used heat, have different boundaries.',
 'Die lernende Person bezeichnet Input, Nutzoutput und Einheiten, berechnet elektrische und bedarfsbezogene Wirkungsgrade und normiert unterschiedliche Ketten auf dieselbe Radarbeit, statt 82 % mit einer fremden Primärenergiegrenze gleichzusetzen.',
 'The learner states input, useful output and units, calculates electrical and demand-adjusted efficiencies, and normalises different chains to the same wheel work rather than treating 82% as a primary-energy efficiency.',
 'Bei verändertem Wärmebedarf erklärt sie die geänderte Nutzengröße unter unveränderter Energieerhaltung und begründet, warum daraus kein dauerhafter Technologiesieger folgt.',
 'When heat demand changes, the learner explains the changed useful-output measure with unchanged energy conservation and why this does not establish a permanent technology winner.')

row('e20d205f','keep',
 'Der Text ist bewusst auf vereinfachte Ökobilanzen von Energieträgern begrenzt. 14a/b erläutern Funktionsgrenze, Inventar, biogene Aufnahme, Landnutzung und belegte Ersatzgutschrift. 40/120 gegen 95 g und 0,35/0,30 kg sind reproduziert. Eine Klimateilbilanz wird nicht zur vollständigen Lebenszyklus- oder Quellenabdeckung hochgestuft.',
 'Eine vereinfachte Ökobilanz ordnet Stoff- und Energieflüsse einer funktionalen Einheit und einer Systemgrenze zu. Biogene Aufnahme, Emission und Ersatzgutschrift sind getrennte Flüsse; Annahmen bestimmen die Reichweite des Urteils.',
 'A simplified life-cycle account assigns material and energy flows to a functional unit and system boundary. Biogenic uptake, emissions and displacement credits are distinct flows; assumptions determine the reach of the judgement.',
 'Die lernende Person erstellt aus dem Inventar die Bilanz, führt Aufnahme und Verbrennung ohne doppelte Gutschrift und begründet, warum eine Landnutzungsänderung oder unbelegte Wärmeersetzung das Ergebnis ändern kann.',
 'The learner builds the account from inventory, treats uptake and combustion without double credits, and explains how land-use change or unsupported heat displacement can alter the result.',
 'Wenn dieselbe Radarbeit mehr Bioethanolenergie benötigt, passt sie die funktionale Einheit an und unterscheidet diese Änderung von einer bloßen Änderung des Emissionsfaktors.',
 'If equal wheel work needs more bioethanol energy, the learner adjusts the functional unit and distinguishes this change from merely changing an emission factor.')

row('7dc80ee2','keep',
 'Die lange Beschreibung bewahrt den ganzen BY-Operator: beide Spaltungswege, beide Speicherklassen, künstliche Photosynthese sowie Ressourcen- und Bewertungsperspektiven. Der Vergleich dient einer gemeinsamen energietechnischen Entscheidung und ist kein zufälliges Bündel. 15a/b bieten gleiche Solargrenze und getrennte Wärme-/Massenränder; 1,19/0,68 kWh und 31,635/59,94 kWh stimmen. Es wird weder eine vollständige CO2-Reduktion durch bloße Wasserspaltung noch ein reales Sicherheitsranking behauptet.',
 'Wasserspaltung speichert zugeführte Energie über elektrische oder direkte photochemische Wege. Physikalische H2-Speicherung und chemische Bindung unterscheiden sich in Masse, Freisetzung und Wärmebedarf; dies bildet nur einen Teil natürlicher Photosynthese nach.',
 'Water splitting stores supplied energy through electrical or direct photochemical routes. Physical hydrogen storage and chemical binding differ in mass, release and heat demand; this imitates only part of natural photosynthesis.',
 'Die lernende Person vergleicht beide Spaltungswege auf gleicher Solarenergie, bilanziert Wasser und Wasserstoff und begründet eine stationäre oder mobile Speicherwahl mit nutzbarer H2-Energie, Systemmasse und Freisetzungswärme.',
 'The learner compares both splitting routes on equal solar input, balances water and hydrogen, and justifies stationary or mobile storage using recovered H2 energy, system mass and release heat.',
 'Bei verfügbarer Abwärme geeigneter Temperatur prüft sie die geänderte Speicherbewertung, während sie unveränderte Massenanteile und offene Lebensdauer-/Rohstoffdaten ausdrücklich beibehält.',
 'When waste heat at a suitable temperature becomes available, the learner reassesses storage while retaining unchanged mass fractions and explicitly unresolved lifetime and resource data.')

row('1873eb42','keep',
 'Die vollständige BY-Kompetenz enthält technische Effizienz, wirtschaftliche und ökologische Bewertung sowie Quellenvalidität. 16a/b machen unterschiedliche Messgrenzen und gegenläufige Klima-/Kostenfolgen überprüfbar. 53 333 und 111 111 km sind bedingte Modellwerte; im zweiten Fall existiert kein positiver CO2-Breakeven. Keine aktuelle Kauf- oder Produktbehauptung folgt daraus.',
 'Ein Mobilitätsurteil benötigt gleiche Fahrleistung, passende Verbrauchsgrenze und belastbare Herkunft der Daten. Betrieb, zusätzliche Herstellung und Geldkosten können verschiedene Richtungen und verschiedene Breakevens haben.',
 'A mobility judgement needs equal travel service, an appropriate consumption boundary and defensible data provenance. Operation, additional manufacturing and financial costs can point in different directions and have different break-evens.',
 'Die lernende Person prüft Steckdosen- gegen Motorwerte und Winter- gegen Sommerbedingungen, berechnet bedingte Klima- und Kostenfolgen und begründet das Urteil mit offen gelegten fehlenden Fahrzeuglasten.',
 'The learner checks socket versus motor values and winter versus summer conditions, calculates conditional carbon and cost consequences, and justifies the judgement while declaring missing vehicle burdens.',
 'Bei einem Stromvertrag mit Herkunftslabel fordert sie eine zur bilanzierten Nutzung passende Erzeugungs- und Zuordnungsgrundlage, bevor sie einen neuen Klimavorteil berechnet.',
 'For a power contract carrying an origin label, the learner requests generation and allocation evidence matching the accounted use before calculating a new climate advantage.')

row('551d81a7','keep',
 'Die drei Perspektiven sind klar und entsprechen dem HE51-Nachhaltigkeitskontext. 17a/b übersetzen Reflektieren in eine begründete Entscheidung mit gleichem Waschergebnis und fehlenden Nachweisen. Die vollständige korrigierte 17b-Lösung begrenzt den positiven Abbaubefund ausdrücklich: aquatische Wirkung und Exposition fehlen für beide Produkte. Damit darf keine aquatische Unbedenklichkeit aus Mineralisierung allein entstehen; 0,17/0,34 kg stimmen.',
 'Waschmittelauswahl verbindet gleiche Waschleistung mit Verbrauch, Rohstoff- und Lieferkettenfolgen. Abbauverhalten, aquatische Wirkung und Exposition sind getrennt zu belegen; eine Kostenpriorität ist ein Werturteil.',
 'Detergent selection links equal cleaning performance with consumption, feedstock and supply-chain consequences. Degradation, aquatic effects and exposure need separate evidence; prioritising cost is a value judgement.',
 'Die lernende Person vergleicht den gleichen Waschgang, berechnet die erfassten Klimabeiträge und begründet eine Priorität mit mindestens einem belegten Vorteil jeder Option sowie gezielten offenen Umwelt- und Sozialnachweisen.',
 'The learner compares the same cleaning service, calculates the included carbon contributions, and justifies a priority using at least one evidenced advantage of each option and specific unresolved environmental and social evidence.',
 'Benötigt eine Option in hartem Wasser zwei Waschgänge, passt sie die Nutzfunktion an und erklärt, weshalb ein günstiger Wert je Einzelgang die frühere Entscheidung nicht unverändert trägt.',
 'If an option needs two cycles in hard water, the learner adjusts the service function and explains why a favourable figure per single cycle no longer supports the earlier choice unchanged.')

row('c21d430b','split_review',
 'Zeolith-Ionenaustausch und mikrobieller Tensidabbau sind unabhängig prüfbare chemische Gegenstände. HE51 enthält zwei getrennte LK-Bullets; die aktuellen vier vollständigen Fälle 18a/c beziehungsweise 18b/d liefern ausdrücklich getrennte Beobachtungsprodukte. Ein Erfolg bei Gerüstladung oder Regeneration belegt keine Endgruppenoxidation, β-Oxidation oder Mineralisierung und umgekehrt. Gemeinsamer Waschmittelkontext genügt nicht zur Atomarität. Weder Gesamt-KEEP noch Löschen eines Operators oder ungeprüfte Übernahme vorgeschlagener Kinder ist verantwortlich.',
 'Beim Zeolith bleibt die feste Gerüstladung beim Austausch mobiler Gegenionen erhalten. Beim Tensidabbau ändern Hydrolyse und Oxidationsschritte Moleküle; Ausgangsstoffentfernung, Mineralisierung und Schadwirkung sind getrennte Aussagen.',
 'In zeolite exchange, fixed framework charge persists while mobile counterions change. In surfactant degradation, hydrolysis and oxidation transform molecules; parent removal, mineralisation and harmful effects are distinct claims.',
 'Die lernende Person müsste einerseits Ca2+/Na+-Austausch und Kapazität strukturell erklären und andererseits einen stoffabhängigen Abbauweg mit Kohlenstoffverbleib beschreiben. Diese beiden unabhängigen Arbeitsprodukte dürfen nicht gegenseitig als Nachweis gezählt werden.',
 'The learner would separately need to explain Ca2+/Na+ exchange and capacity structurally and describe a substance-dependent degradation route with carbon fate. These independent products must not count as evidence for one another.',
 'Ein Mg2+-Konkurrent prüft die Ionenaustauschkompetenz; ein verzweigter Alkylrest oder sorbiertes Zwischenprodukt prüft dagegen Abbauannahmen. Beide Veränderungen benötigen getrennte Prüfung nach einem geklärten Zuschnitt.',
 'Competing Mg2+ tests ion-exchange understanding, whereas a branched tail or sorbed intermediate tests degradation assumptions. Both variations require separate assessment after scope has been resolved.')

row('0773a104','keep',
 'Die aktuelle Beschreibung ist als eigene begrenzte Konkretisierung hinreichend klar: ausgewählte Strukturen, vorgegebene Bedingungen/Ziele und begründete Wahl. Sie fordert keine freie industrielle Synthese oder universelles Umweltoptimum. 19a/b decken Dosis, Temperatur, Härte, Trübung und Schaum mit bereitgestellten Modellwerten ab. Keine Quelle beweist dadurch eine zusätzliche allgemeine Pflicht; der Quellenhold und die fehlende Visualisierung bleiben offen. Eine optional geplante praktische Prüfung ist nicht bereits durchgeführt.',
 'Tensidstruktur wirkt über Kopfhydratation, unpolare Kette und temperatur-/konzentrationsabhängiges Verhalten auf eine konkrete Formulierung. Optimierung bedeutet Wahl unter Zielen und Nebenbedingungen, nicht pauschal mehr Schaum oder mehr Micellen.',
 'Surfactant structure affects a concrete formulation through head hydration, nonpolar tails and temperature- or concentration-dependent behaviour. Optimisation means choice under objectives and constraints, not simply more foam or micelles.',
 'Die lernende Person prüft jede gegebene Struktur gegen Dosis, Härte und Temperatur, begründet eine Wahl aus Struktur und Daten und benennt eine kontrollierte Überprüfung mit gleicher Schmutzlast, Blank und Wiederholung.',
 'The learner checks each supplied structure against dose, hardness and temperature, justifies a choice from structure and data, and specifies a controlled check with equal soil load, a blank and replication.',
 'Wird die Waschtemperatur über den Trübungspunkt angehoben, beurteilt sie die frühere Wahl neu und fordert passende Stoffdaten für Alternativen statt eine allgemeine Überlegenheit höherer Ethoxylierung zu behaupten.',
 'When washing temperature rises above the cloud point, the learner reconsiders the earlier choice and requests suitable substance data for alternatives rather than claiming universal superiority of higher ethoxylation.')

row('ebfa2c18','keep',
 'Die Beschreibung ordnet Atomökonomie korrekt einer bilanzierten Komponentensynthese zu und erlaubt PMI/E nur mit erklärtem Prozess- oder Formulierungsrand. 20a/b sind vollständig und bilanziert; 92,5/87,40 %, Ausbeute sowie beide Wassergrenzen sind eigenständig nachvollzogen. Die Kennzahlen bilden eine zusammenhängende Unterscheidung von idealer Stöchiometrie und realem Massenprozess. Breite partielle Nachhaltigkeitsmappings bleiben keine exakte amtliche Metrikpflicht; das alte Bild/Alttext ist kein neues V-Urteil.',
 'Atomökonomie beschreibt die ideale Verteilung der Reaktandenatome auf ein Zielprodukt einer Reaktion. Ausbeute beschreibt real isoliertes Produkt; PMI und E-Faktor beschreiben deklarierte Stoffströme pro Produktmasse.',
 'Atom economy describes the ideal allocation of reactant atoms to a target product in a reaction. Yield describes actually isolated product; PMI and E-factor describe declared material flows per mass of product.',
 'Die lernende Person leitet die drei Kennzahlen aus Reaktionsgleichung beziehungsweise vollständigem Masseninventar her, behandelt Prozess- und Reaktionswasser korrekt und begründet PMI=E+1 nur unter der angegebenen Massenbilanz.',
 'The learner derives the metrics from the reaction equation or complete mass inventory, treats process and reaction water correctly, and justifies PMI=E+1 only under the stated mass balance.',
 'Geht beim nichtreaktiven Formulieren ausschließlich Wasser verloren, erklärt sie die geänderte Produktkonzentration und weshalb gleiche Masse oder PMI nahe eins keine gleiche Waschfunktion oder Umweltverträglichkeit beweist.',
 'If only water is lost during nonreactive formulation, the learner explains the changed product concentration and why equal mass or PMI near one proves neither equivalent cleaning service nor environmental safety.')

inp=json.loads((HERE/'assigned-round-b/description-review-input.json').read_text())
assert len(rows)==20
for r,g in zip(rows,inp['goals']):
    assert g['goalId'].startswith(r.pop('prefix'))
    r['goalId']=g['goalId']
    for k in ['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:
        r[k]=g[k]
stamp=datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00','Z')
first=dict(schemaVersion=1, role='Genuine independent B scientific FIRST after actual final native whole-book reading; no stock fingerprint computation or P/A/M/V votes',
    reviewerIdentity='Codex independent reviewer B, /root/chemie_energy20_successor_native_fresh_independent_b_20261015',
    nativeReviewStartedAt='2026-10-15T11:43:41Z', firstWrittenAt=stamp,
    exactParentSelectorSHA256='sha256:3fc56369f7afc7160f06b0eacad4d441b56130ba82f86ae91d3b63c707215fde',
    actualNativeRead=dict(pdfPhysicalPages=list(range(1,23)), frontPages=2, targetPages=20, visualInspection='all22 independently viewed page rasters plus full PDF text',
       html='complete DOM read against actual book model, all20 goal anchors and description sections',
       modelAndReviewInput='all20 complete current page contexts checked equal to assigned round-b and exact current20 profiles; bilingual current text and canonical context read'),
    scientificRead=dict(wholeGoalCount=20,wholeDEENCases=42,observableRubrics=126,rawAuthorProfiles=20,profileStatus='E0/G0',transitivePrerequisiteBodies=69,sourceLanes=22,directSourceCells=151,uniquePartnerBodies=106,
       primaryRead='HE49-51,BB22-25,HB19/28/31/32/34,BW26/30/40-43 and complete related BY structured units/children; additional supplied nonempty raw passages read',
       rawTextEmptyPassages=56,emptyRawTextIsFullPrimaryRead=False,
       acquisitionBoundary='future real independent research/practical performance must be observed for its operator; supplied fictional data are not learner executions; already performed human/lab trials are not prerequisites for machine M7'),
    blindToOtherReviews=True,peerResultsRead=False,historicalDOrPJudgmentsRead=False,
    authorSuccessorBoundary='only whole scientific corrected goals/cases/CAS and raw profiles used; no referenced A-FIRST or A judgments opened',
    preservedHolds=['e64 course/scope','c21 atomicity','0773 source/optional scope and absent image','all broad/partial national mappings and selection boundaries','six M text stales','16b/a338 independent V context freshness','no full source closure'],
    newP=0,newA=0,newM=0,newV=0,newStrict=0,centralExecuted=False,activeIntegration=False,humanApproval=False,humanTrial=False,M7=False,
    perGoalScientificFirst=rows)
out=HERE/'FIRST20.genuine-independent-b.scientific.json'
assert not out.exists()
out.write_text(json.dumps(first,ensure_ascii=False,indent=2)+'\n')
seal=dict(schemaVersion=1,sealedAt=stamp,files=[dict(path=str(p.relative_to(HERE)),sha256='sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),bytes=p.stat().st_size) for p in [out,Path(__file__)]],scope='FIRST20 scientific conclusions fixed before stock serialization')
(HERE/'FIRST20.scientific.seal.json').write_text(json.dumps(seal,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(dict(first=str(out),firstSHA256='sha256:'+hashlib.sha256(out.read_bytes()).hexdigest(),writtenAt=stamp,counts={x:sum(r['decision']==x for r in rows) for x in ['keep','revise','split_review','block']}),indent=2))
