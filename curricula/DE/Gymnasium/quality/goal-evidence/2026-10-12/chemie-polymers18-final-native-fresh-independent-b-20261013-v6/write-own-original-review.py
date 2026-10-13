import json,pathlib,hashlib,datetime
B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12');O=B/'chemie-polymers18-current231-inactive-normal-preparation-technical-20261013-v1';W=B/'chemie-polymers18-final-native-fresh-independent-b-20261013-v6'
now=datetime.datetime.now(datetime.timezone.utc).isoformat(); sha=lambda data:'sha256:'+hashlib.sha256(data).hexdigest()
def put(path,obj):
 path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def jsonl(path,rows):
 path.parent.mkdir(parents=True,exist_ok=True);path.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n'for r in rows));[json.loads(l)for l in path.read_text().splitlines()]
# These are personally authored independent judgments, not author/peer votes.
S={}
def add(short,essentialDe,essentialEn,performanceDe,performanceEn,transferDe,transferEn,facts,atomic,memory):
 S[short]=dict(understandingEvidence=dict(essentialUnderstandingDe=essentialDe,essentialUnderstandingEn=essentialEn,observablePerformanceDe=performanceDe,observablePerformanceEn=performanceEn,transferExpectationDe=transferDe,transferExpectationEn=transferEn),science=facts,atomicityReason=atomic,memoryReason=memory)
add('3e9',
'Dauerhafte Netzpunkte, Kettenbeweglichkeit und reversible Rückstellung verbinden im gegebenen konventionellen Modell Struktur, Kunststoffklasse und Verwendung; Verzweigung allein ist keine Vernetzung.',
'Permanent network points, chain mobility and reversible recovery connect structure, plastic class and use in the supplied conventional model; branching alone is not crosslinking.',
'Ordnet gegebene Ketten- und Netzmodelle mit Wärme- und Dehnungsdaten zu und begründet geeignete Anwendungen sowie Grenzen einer uneindeutigen Zuordnung.',
'Classifies supplied chain and network models using thermal and strain data and justifies suitable uses and limits of an ambiguous classification.',
'Beurteilt ein nachträglich vernetztes Material und trennt geringe Restdehnung von einem Nachweis für Elastizität oder ein dichtes Duroplastnetz.',
'Evaluates a subsequently crosslinked material and separates low residual strain from evidence of elasticity or a dense thermoset network.',
'A/B/C-classification follows supplied flow/recovery/network evidence. X/Y case correctly refuses to infer a thermoset from 5% residual strain. Linear chains in the retained image are an example, not an exhaustive thermoplastic definition; branched chains and physical TPE networks are explicitly bounded in the profile.',
'Die Leistung besteht in einer begründeten Klassifikation über Struktur und Prüfverhalten. Drei Klassen liefern Gegenfälle derselben Entscheidungsregel, keine drei getrennten Routinen.',
'Begriffe werden an Strukturen und Prüfverhalten erschlossen. Ein weiteres Kartenziel würde Klassennamen abfragen, während die geforderte Leistung eine Begründung bleibt.')
add('6eb',
'Initiatorzerfall, Kettenstart, radikalisches Wachstum und Abbruch bilden einen Kettenmechanismus; Vinylsubstituenten bleiben in der abgeleiteten Polymereinheit erhalten.',
'Initiator cleavage, initiation, radical propagation and termination form one chain mechanism; vinyl substituents remain in the derived polymer repeat unit.',
'Formuliert endständige Radikale und valenzrichtige Repetiereinheiten für gegebene Alkene und erklärt Abbruch durch Kombination.',
'Writes terminal radicals and valence-correct repeat units for supplied alkenes and explains termination by combination.',
'Überträgt den Mechanismus auf ein substituiertes Monomer und interpretiert einen Radikalfängerbefund ohne unbelegte Kettenlängen- oder Sicherheitsfolgerung.',
'Transfers the mechanism to a substituted monomer and interprets radical-trap evidence without unsupported chain-length or safety conclusions.',
'RO–OR→2RO•; terminal radical survives propagation and disappears at combination. PE, styrene and PVC repeat units retain substituents. 60% versus 5% conversion with the supplied trap model supports radical involvement, not chain length or safe execution.',
'Radikalpunkt, Kettenfortpflanzung und monomerabhängige Wiederholungseinheit sind die zusammenhängende Mechanismuskonstruktion; Anwendung ist deren Transfer.',
'Initiator und Monomerformeln sind gegeben; die neue Leistung ist ihre mechanistische Verknüpfung. Kein zusätzliches Gedächtnisdeck ist für diesen Umfang erforderlich.')
add('9b9',
'Nukleophile O- oder N-Zentren verknüpfen sich wiederholt mit elektrophilen Acylzentren; Endgruppen und abgespaltene Moleküle müssen zur tatsächlich formulierten Kette passen.',
'Nucleophilic O or N centres repeatedly link to electrophilic acyl centres; terminal groups and eliminated molecules must match the chain actually written.',
'Leitet Ester- oder Amidverknüpfungen aus vollständigen Monomeren ab und bilanziert eine endliche Kette mit ihren Endgruppen.',
'Derives ester or amide links from complete monomers and balances a finite chain including terminal groups.',
'Wechselt vom Diol/Diacid-System zum Diamin/Diacidchlorid-System und begründet HCl statt H₂O sowie den Vorbehalt der tatsächlichen Reaktionsbedingungen.',
'Switches from diol/diacid to diamine/diacid chloride and justifies HCl rather than H₂O with the caveat of actual reaction conditions.',
'Four-monomer linear chains contain three formed links: three H₂O for the ester case and three HCl for the acid chloride case, with end groups retained. An acid route to amide needs its actual activation/conditions; a symbolic equation does not establish laboratory feasibility.',
'Eine wiederholte Acylverknüpfung wird in Formel, Angriffsstelle und Stoffbilanz erklärt. Ester und Amid sind strukturverwandte Beispiele derselben Kompetenz.',
'Monomere und Endgruppen sind vorgegeben. Die Bilanz und Struktur werden abgeleitet; ein neues isoliertes Namen- oder Bindungskartenziel ist nicht notwendig.')
add('872',
'Recyclingwege unterscheiden erhaltene Polymerketten, chemische Depolymerisation und Rohstoffprodukte; Ausbeute, Qualität, Energie und Systemgrenze bestimmen den Vergleich.',
'Recycling routes differ in retained polymer chains, chemical depolymerisation and feedstock products; yield, quality, energy and system boundary determine comparison.',
'Erklärt die gegebenen Verfahren, berechnet Aufwand je verwendbarem Produkt und begründet ein ökologisch-wirtschaftliches Urteil mit Quellen- und Unsicherheitsprüfung.',
'Explains supplied processes, calculates effort per usable product and justifies an environmental and economic judgement with source and uncertainty checks.',
'Bewertet einen veränderten Mischabfall und dessen Qualitätsanforderung, ohne Rückgewinnungsmasse oder Pyrolyserohstoff mit fertigem PET gleichzusetzen.',
'Evaluates changed mixed waste and its quality requirement without equating recovered mass or pyrolysis feedstock with finished PET.',
'40/80=.50 and 100/75=1.33 kWh/kg on stated output bases. Sorted PET 28 kg plus PE 45 kg gives 73 kg recovered/27 kg loss. Mixed board 70 kg has a different functional service. Missing price, quality and total-system data remain uncertainty; no unconditional process winner.',
'Verfahrensbeschreibung, Stoffkreis und Quellenkritik begründen eine gemeinsame Recyclingentscheidung. Die drei Wege sind konkurrierende Optionen dieses Urteils.',
'Daten und Prozessinformationen werden bereitgestellt. Die geforderte Abwägung kann nicht durch Abruf von Recyclingnamen ersetzt werden; kein zusätzliches Recall-Ziel.')
add('afa',
'Silbernanopartikel verbinden Nanogröße und Oberflächenwirkung mit einer bestimmten Polymeranwendung; Wirksamkeit, Freisetzung und Exposition sind getrennte Nachweise.',
'Silver nanoparticles connect nanoscale size and surface effects to a specific polymer application; efficacy, release and exposure require separate evidence.',
'Interpretiert gegebene Wirksamkeits- und Migrationsdaten und erklärt einen material- und anwendungsspezifischen Nutzen-Risiko-Bezug.',
'Interprets supplied efficacy and migration data and explains a material- and application-specific benefit-risk relationship.',
'Überträgt den Vergleich auf geänderte Freisetzungs- oder Expositionsbedingungen und benennt fehlende Kontrollen vor einer Sicherheitsbehauptung.',
'Transfers the comparison to changed release or exposure conditions and identifies missing controls before claiming safety.',
'Whole profile/cases/rubrics are byte-equivalent in body to my personally read V6 inputs. Final image marks possible effect and separate safety/efficacy checks; packaging illustration supplies no food-contact authorisation. Supplied illustrative data do not establish a real product health claim.',
'Eine konkrete Materialanwendung wird aus Partikeleigenschaft, beobachteter Wirkung und Exposition eingeordnet. Dies fordert keine getrennte regulatorische Toxikologiekompetenz.',
'Die Wirkung ist fallbezogen aus Messdaten zu beurteilen. Eine Vorteile-/Risiken-Liste im Deck wäre kein notwendiger zusätzlicher Erinnerungskern.')
add('f947',
'Alkohol und Isocyanat bilden Urethangruppen ohne kleines Nebenprodukt in der trockenen Hauptreaktion; Gruppenäquivalente, Funktionalität und Wasser beeinflussen den Reaktionsverlauf.',
'Alcohol and isocyanate form urethane links without a small byproduct in the dry main reaction; group equivalents, functionality and water affect the reaction path.',
'Leitet das Urethanmotiv und die Wiederholungseinheit ab, zählt OH/NCO-Äquivalente und erklärt lineare oder netzfähige Produkte unter Umsatzvorbehalt.',
'Derives the urethane linkage and repeat unit, counts OH/NCO equivalents and explains linear or network-capable products subject to conversion.',
'Bilanziert im gegebenen Wasser-Nebenreaktionsmodell CO₂ und den zusätzlichen NCO-Verbrauch und trennt Blasenbildung von erfolgreicher trockener Polyaddition.',
'Balances CO₂ and additional NCO consumption in the supplied water side-reaction model and separates bubbles from successful dry polyaddition.',
'Chemical formulas and amounts are correct: L 200/200 OH/NCO, N 210/210; 2 mmol water yields 2 mmol CO₂ and consumes 4 mmol NCO through the given two-step urea path, leaving at most 96 mmol NCO for OH. HOLD P: case1 asks only R–N=C=O+HO–R′ plus counts/network tendency, but e1 full-credit and whole e1 require a complete urethane repeat motif. Neither printed task explicitly requests that polymer repeat unit. The model answer supplying it does not repair the task/rubric gap.',
'Funktionalität, Äquivalentbilanz und Nebenreaktion erläutern gemeinsam die Steuerung einer Polyurethanbildung. Die P-Aufgabenlücke ist kein Beleg für zwei Ziele.',
'Reaktive Stellen, Mengen und Nebenreaktion sind gegeben. Die Ableitung und Kontrolle benötigt kein zusätzliches Faktenkartenziel; vorhandene M-Entscheidung kann unverändert bleiben.')
add('3ae',
'Glasübergang betrifft die Beweglichkeit amorpher Bereiche, Kristallschmelzen kristalline Bereiche; dauerhafte Netze verhindern freien Schmelzfluss, nicht universell jeden kristallinen Übergang.',
'Glass transition concerns mobility of amorphous regions and melting concerns crystalline regions; permanent networks prevent free melt flow, not universally every crystalline transition.',
'Deutet Wärme- und Belastungsdaten aus Morphologie, Wechselwirkungen und Netzstruktur und unterscheidet Tg, Tm und Zersetzung.',
'Interprets thermal and load data using morphology, interactions and network structure and distinguishes Tg, Tm and decomposition.',
'Erklärt geänderte Kristallinität oder Vernetzung bei gleicher Polymerchemie und sagt Zustand sowie Verarbeitungsgrenzen bedingt voraus.',
'Explains changed crystallinity or crosslinking with unchanged polymer chemistry and conditionally predicts state and processing limits.',
'Final d208 image was positively reviewed by me at original/316/360/680 and now actually viewed in native page9. The corrected caption is no melt flow/decomposition, not no Tm for every network. Current two-case body exactly matches my personally read thermal inputs; morphological versus thermal transitions stay distinct.',
'Tg, Tm und Zersetzung sind unterscheidbare Zustandsänderungen innerhalb einer einzigen Struktur-Zustandsdeutung. Sie benötigen keine künstliche Aufspaltung in drei Abrufziele.',
'Übergangsdaten stehen bereit und werden erklärt. Materialabhängige Temperaturwerte sind keine notwendigen neuen Gedächtniskarten.')
add('265',
'Monomerreste und Verknüpfungen bestimmen Packung, zwischenmolekulare Kräfte und kovalente Netzpunkte; Materialeigenschaften folgen zusätzlich Morphologie und Einsatzbedingungen.',
'Monomer residues and links govern packing, intermolecular forces and covalent network points; properties also depend on morphology and service conditions.',
'Leitet gegebene Wiederholungseinheiten ab und erklärt Messunterschiede bei PE, Polyamid oder vernetztem Material mit passenden Strukturaspekten.',
'Derives supplied repeat units and explains measured differences in PE, polyamide or networked material using relevant structural features.',
'Beurteilt Feuchtigkeit oder ein mehrfunktionelles Comonomer und grenzt eine mögliche Netzwerkbildung von einer allein aus dem Rezept garantierten Eigenschaft ab.',
'Evaluates moisture or a multifunctional comonomer and separates possible network formation from a property guaranteed solely by the recipe.',
'P/Q PE crystallinity 60/35% and modulus900/250 MPa are case data. PA hydrogen bonding and moist strength70→45 are interpreted without a universal PA>PE ranking. Styrene/divinylbenzene bridging needs both vinyl groups to connect different chains; sparse network is given, not guaranteed by feed composition.',
'Monomer und Verknüpfung werden zu einem Eigenschaftsprofil für den Einsatz erklärt. PE, PA und Netze sind Vergleichsfälle derselben Struktur-Eigenschaftsrelation.',
'Gegebene Strukturen und Testwerte erlauben Herleitung. Ein Materialnamen- oder Eigenschaftstabellendeck ist für diese Kompetenz nicht erforderlich.')
add('e47',
'Hydrolyse oder enzymatische Spaltung verkürzt Ketten; Mineralisierung setzt weitere Umsetzungen voraus. Bindungstyp und Umgebungsbedingungen begrenzen Abbauaussagen.',
'Hydrolysis or enzymatic cleavage shortens chains; mineralisation requires further conversion. Linkage type and environmental conditions limit degradation claims.',
'Unterscheidet Molmassenabnahme, lösliche Produkte und polymerbezogenes CO₂ und erklärt die passenden Ester- oder glycosidischen Spaltungswege.',
'Distinguishes molar-mass loss, soluble products and polymer-derived CO₂ and explains the relevant ester or glycosidic cleavage routes.',
'Entwirft einen kontrollierten Kaltwasser- oder Enzymvergleich und fordert eine Kohlenstoffbilanz statt vollständigen Abbau aus unsichtbaren Fragmenten abzuleiten.',
'Designs a controlled cold-water or enzyme comparison and requires a carbon balance rather than inferring complete degradation from invisible fragments.',
'Sterile PLA molar mass100→20 kg/mol shows chain cleavage; 60% polymer-C as CO₂ is partial mineralisation. Dry90 versus wet20 supports water effect, not isolated temperature causality. Cellulose E65% versus5% sugars and sterile0% CO₂ separate glycosidic cleavage from mineralisation. Biomass/dissolved/residual C and O₂/organism/temperature remain part of an honest balance.',
'Eine Abbauanalyse verbindet Bindungsspaltung mit Umweltbedingungen und Befunddeutung. PLA und Cellulose ändern den Bindungstyp als Transfer, statt unabhängige Ziele zu addieren.',
'Bindungen und Enzymfunktion werden vorgegeben. Notwendig ist ihre Deutung in Daten; eine isolierte Abbauartenliste braucht kein neues Deck.')
add('c21',
'Rohstoffherkunft, Polymerchemie und Entsorgung sind unabhängige Achsen; faire Nachhaltigkeitsvergleiche benötigen gleichen Nutzen, Bilanzgrenzen und Kriterien.',
'Feedstock origin, polymer chemistry and disposal are independent axes; fair sustainability comparisons require equal service, system boundaries and criteria.',
'Berechnet Material- und Emissionswerte je funktionaler Einheit und begründet unterschiedliche Entscheidungen bei Klima-, Flächen- oder Wasserpriorität.',
'Calculates material and emission values per functional unit and justifies different decisions under climate, land or water priorities.',
'Prüft einen geänderten Strommix oder eine kürzere Wiederverwendung und trennt Sammlung, Recyclingausbeute und einen Rohstoffclaim von nachgewiesener Neutralität.',
'Examines a changed electricity mix or shorter reuse and separates collection, recycling yield and a feedstock claim from demonstrated neutrality.',
'Per bag20g PE; fossil30g CO₂e/.1L versus bio20g/.5L/.04m²-year. Emissions are explicitly not energy. Reuse20cycles: X20g/Y12g;5cycles50/42g. Break-even X20, Y12 whole uses. Chemically identical bio-PE is not automatically biodegradable;90% collection is not90% yield.',
'Der gemeinsame Rohstoffvergleich bleibt an derselben Dienstleistung gebunden. Ökologie und Entsorgung bilden Kriterien eines Urteils und keine separate Meinungsroutine.',
'Bilanzwerte werden gegeben und normalisiert. Neue Footprint-Zahlenkarten würden fallabhängige Werte fälschlich verallgemeinern; kein zusätzlicher Recall nötig.')
add('2cf',
'Makromolekulare Eigenschaften ermöglichen konkrete Funktionen; ihre gesellschaftliche Bedeutung verlangt eine chemisch begründete Abwägung von Nutzen, Kosten, Ressourcen und Betroffenen.',
'Macromolecular properties enable concrete functions; societal significance requires a chemically reasoned balance of service, cost, resources and affected groups.',
'Verknüpft Produktfunktion mit Struktur, berechnet bereitgestellte Kosten- oder Materialdaten und begründet ein bedingtes Urteil mit transparenten Maßstäben.',
'Connects product function to structure, calculates supplied cost or material data and justifies a conditional judgement with transparent criteria.',
'Ändert das Urteil bei kürzerer Nutzung oder anderer Rückgewinnung und benennt offene Lieferketten- oder Gesamtbilanzfragen.',
'Changes the judgement under shorter service life or different recovery and identifies unresolved supply-chain or total-system questions.',
'PP reuse20cycles:50boxes5kg€90 versus20kg€100 single-use;10cycles10kg€140. Purchased material is not waste. Composite production+3kgCO₂e and use saving.1kg/h gives30h break-even, net7kg saved at100h/net2extra at10h. Pilot recovery.8kg versus4kg is not overall superiority. Structure explanations connect melt shaping and matrix/fibre load transfer.',
'Alltag, Technik, Wirtschaft und Gesellschaft sind Perspektiven einer materialbezogenen Beurteilung. Die Aufgabe verlangt ein zusammenhängendes begründetes Urteil, keine vier unabhängigen Faktenroutinen.',
'Strukturkontext und Vergleichsdaten werden bereitgestellt. Kriterien müssen begründet werden; zusätzliche Pro-/Contra-Karten sind für die Zielerfüllung nicht notwendig.')
add('e560',
'Silikone besitzen ein Si–O-Gerüst mit organischen Resten; Kondensationsverknüpfung, freie Ketten und Netze erklären unterschiedliche Eigenschaften einschließlich Beschichtungsbenetzung.',
'Silicones have an Si–O backbone with organic residues; condensation links, free chains and networks explain differing properties including coating wetting.',
'Bilanziert ein endgruppenrichtiges Siloxanmodell und vergleicht gegebenes Öl und Elastomer anhand von Kettenbewegung, Netzpunkten und Oberflächenbedingungen.',
'Balances a siloxane model with correct terminal groups and compares supplied oil and elastomer using chain mobility, network points and surface conditions.',
'Überträgt den Strukturvergleich auf eine nanostrukturierte Beschichtung und trennt Oberflächenchemie von Rauigkeit sowie eine Modellkondensation von universeller industrieller Herstellung.',
'Transfers the structural comparison to a nanostructured coating and separates surface chemistry from roughness and model condensation from universal industrial production.',
'Final image balances2 dimethylsilanediols→end-correct disiloxane+H₂O. My V6 actual original/mobile/desktop reading is bound to exact f5f6 bytes; current whole cases/profile bodies equal those personally read. Oil/network contrast and Chemistry+Structure are legible essential concepts, not all nanosurfaces hydrophobic.',
'Herstellung und Vergleich sind Erklärungsschritte derselben Silikon-Strukturkompetenz; Nanobeschichtung ist deren materialbezogener Transfer. Es wird keine separate praktische Durchführung behauptet.',
'Die gegebenen reaktiven Stellen und Modelle erlauben Ableitung. Ein neues Silikon-Faktenkartenziel würde die geforderte Strukturbegründung nicht unterstützen müssen.')
add('6eb a', '', '', '', '', '', '', '', '', '') if False else None
add('6eba',
'Verformungsverfahren benötigen einen passenden Materialzustand und Ausgangskörper; Schmelzfluss, Warmdehnung, Vernetzung und Zersetzung begrenzen die Wahl.',
'Forming processes require a suitable material state and starting form; melt flow, warm stretching, crosslinking and decomposition constrain selection.',
'Beschreibt Spritzgießen, Tiefziehen, Kalandrieren und Extrudieren und begründet eine Wahl aus Form, Ausgangsmaterial und Temperaturfenster.',
'Describes injection moulding, thermoforming, calendering and extrusion and justifies selection using shape, feedstock form and temperature window.',
'Beurteilt ein dauerhaft vernetztes Material gegenüber einem später vernetzbaren Vorläufer und erklärt, weshalb gleiche Temperaturen oder fehlende Folie keine universelle Verfahrensfreigabe ergeben.',
'Evaluates a permanent network against a later-crosslinkable precursor and explains why equal temperatures or absent sheet do not universally authorise a process.',
'Cap injection, cup thermoforming from sheet, broad sheet calendering and pipe annular-die extrusion match demands. Melt180–210°C, stretch100–130°C and decomposition250°C are separate windows. Permanent network no flow230/decomposition240 cannot remelt; precursor190 can be extruded before conditional cure. No film excludes the specified thermoforming route.',
'Vier Verfahren werden als Alternativen einer materialgebundenen Verfahrensbeschreibung und Wahl verglichen. Keine unabhängigen Maschinenbedienungsprüfungen werden zusammengelegt.',
'Verfahrensinformationen und Materialfenster werden im Lernfall gegeben. Die begründete Auswahl erfordert kein zusätzliches Abrufdeck mit Maschinennamen.')
add('dfb',
'Nanodimension verändert das Verhältnis von Oberfläche und Volumen; Oberflächenchemie und Struktur wirken gemeinsam auf Benetzung und anwendungsbezogene Eigenschaften.',
'Nanoscale dimension changes surface-area-to-volume ratio; surface chemistry and structure jointly affect wetting and application-specific properties.',
'Erklärt gegebene Partikel- und Oberflächendaten und begründet die Aussagegrenzen von Kontaktwinkel, Abrollverhalten und Risikobefunden.',
'Explains supplied particle and surface data and justifies limits of contact-angle, roll-off and risk evidence.',
'Prüft eine chemisch hydrophile raue Oberfläche oder eine veränderte Partikelgröße und fordert geeignete Kontrollen vor einer universellen Selbstreinigungs- oder Sicherheitsbehauptung.',
'Examines a rough chemically hydrophilic surface or changed particle size and requires suitable controls before universal self-cleaning or safety claims.',
'Current whole two-case profile/rubric bodies exactly equal my personally read V6 inputs. Actual final image separately shows smooth hydrophobic, rough hydrophobic and spreading rough hydrophilic droplets. Chemistry and structure are both explicit. Contact angle alone does not prove low adhesion/self-cleaning; risk icons are questions, not safety data.',
'Partikel und nanostrukturierte Oberfläche operationalisieren eine Nanodimension–Eigenschafts–Anwendungsdeutung. Die Bewertung bleibt an dieselbe Erklärung gebunden.',
'Größe, Formelbezug und Vergleichsdaten sind vorgegeben. Eine zusätzliche Definitionenliste würde die kontrollierte Modellinterpretation nicht ersetzen und ist nicht nötig.')
add('73c',
'Konjugation ermöglicht delokalisierte elektronische Zustände; leitfähiger Transport benötigt verfügbare bewegliche Ladungsträger und Wege entlang sowie zwischen Ketten.',
'Conjugation enables delocalised electronic states; conduction requires available mobile charge carriers and paths along and between chains.',
'Unterscheidet Konjugation von Dotierung und erklärt im gegebenen Modell Oxidations-/Reduktionsdotierung sowie entgegengesetzte Trägerbewegung im selben Feld.',
'Distinguishes conjugation from doping and explains oxidation/reduction doping and opposite carrier drift in the same field within the supplied model.',
'Deutet geänderte Dotierung oder Kettenverknüpfung und begrenzt aus Konjugation allein abgeleitete metallische Leitfähigkeit.',
'Interprets changed doping or chain connections and limits metallic-conductivity inferences made solely from conjugation.',
'Current body equals my whole V6 reading. Final actual image shows neutral conjugated system with few mobile carriers, oxidation holes, reduction electrons, common E right, holes right/electrons left and battery plus left. This is a simplified carrier model, not universal metal-like conductivity or complete band theory.',
'Eine elektronische Struktur-Transporterklärung enthält Konjugation und Trägerbildung als kausale Bestandteile. Technische Einsatzabwägung bleibt im separaten 14f-Ziel.',
'Strukturen und Dotierungsmodell werden gegeben. Verständnis der Trägerbewegung wird erklärt; kein neues Definitionskartenziel ist notwendig.')
add('14f',
'Leitfähigkeit, Geometrie, Masse, Flexibilität und Alterung begrenzen, ob ein leitfähiges Polymer eine metallische Lösung für denselben Dienst ersetzt.',
'Conductivity, geometry, mass, flexibility and ageing limit whether a conducting polymer can replace a metallic solution for the same service.',
'Berechnet Widerstände aus gegebenen Daten und begründet Materialentscheidungen mit elektrischen und mechanischen Anforderungen sowie Unsicherheit.',
'Calculates resistance from supplied data and justifies material decisions using electrical and mechanical requirements and uncertainty.',
'Ändert die Auswahl für Hochstrom statt Sensorbetrieb oder nach Feucht-/Biegebelastung und schlägt Kontrollen vor, die Ursachen trennen.',
'Changes the choice for high-current rather than sensor operation or after humidity/bending exposure and proposes controls that separate causes.',
'R=L/(σA) gives polymer100Ω/.10g versus metal.002Ω/.80g. Sensor≤150Ω permits polymer subject to mechanics; power≤.01Ω only metal. Both aged sheet resistances2e6/1e7 exceed≤1e6 criterion. Dry/wet × bent/unbent factorial controls distinguish ageing effects. Image advantages are conditional comparisons, not all metals corrode or all polymers resist heat.',
'Die Leistung ist eine anforderungsbezogene Werkstoffauswahl. Anwendungen konkretisieren diese Entscheidung; die elektronische Erklärung ist vorausgesetzt und wird nicht erneut als zweites Ziel geprüft.',
'Formel und Werkstoffdaten werden gegeben. Eine Anwendungsnamenliste ist keine zusätzliche notwendige Erinnerungsbasis für die Entscheidung.')
add('027',
'PLA-Struktur folgt aus Milchsäure beziehungsweise Lactid; Esterbindung, Morphologie und Umgebung bestimmen Nutzungs- und Abbaugrenzen unabhängig von biobasierter Herkunft.',
'PLA structure derives from lactic acid or lactide; ester links, morphology and environment determine use and degradation limits independently of biobased origin.',
'Leitet PLA-Motiv und eine endliche Kondensationsbilanz ab, grenzt Ringöffnung ab und begründet eine Verwendung mit thermischen und Abbaudaten.',
'Derives the PLA motif and finite condensation balance, distinguishes ring opening and justifies use with thermal and degradation evidence.',
'Beurteilt eine heiße belastete Anwendung oder eine dickere mehrteilige Probe, ohne die gegebenen dünnen Kompostdaten auf jedes PLA-Produkt zu übertragen.',
'Evaluates a hot loaded application or a thicker multipart sample without transferring supplied thin-sample compost evidence to every PLA product.',
'3 lactic-acid monomers form trimer+2H₂O with correct PLA motif; lactide ring opening does not eliminate water per ring. Tg58°C distinguishes cold tray from loaded75°C use; semicrystalline support at80°C is provided separately. Thin A compost result does not prove degradation of all B components or in home/water conditions.',
'PLA-Synthese, Eigenschaft und Einsatzfeld bilden eine Stoff-Struktur-Verwendungsrelation. Breite Rohstoffnachhaltigkeit wird durch c21 getrennt abgedeckt.',
'Monomer und Prüfdaten werden gegeben. Es ist kein neues PLA-Namen-/Temperaturdeck nötig; Einsatz wird aus dem Modell hergeleitet.')
add('7f8',
'Ein Copolymer enthält verschiedene Monomereinheiten in einer gemeinsamen Architektur; Sequenz und Verknüpfung unterscheiden es von einem bloßen Gemisch und beeinflussen mögliche Eigenschaften.',
'A copolymer contains different monomer units within one architecture; sequence and linkage distinguish it from a mere mixture and influence possible properties.',
'Beschreibt oder konstruiert statistische, Block- oder Pfropfmodelle aus gegebenen Einheiten und verbindet sie begründet mit den jeweiligen Prüfdaten.',
'Describes or constructs statistical, block or graft models from supplied units and connects them with the relevant test data using reasons.',
'Vergleicht bei gleicher Zusammensetzung eine geänderte Architektur und begrenzt mögliche Vorteile auf die gemessene Eigenschaft und Einsatzanforderung.',
'Compares a changed architecture at equal composition and limits possible advantages to the measured property and service requirement.',
'Final image and current two-case bodies are exactly my independently read V6 inputs. Statistical and block chain panels each4A4B; graft sketch has B branches without a false exact chain-length label. Combination is marked possible and properties require testing; no guaranteed superiority over every homopolymer.',
'Eine Architektur-Eigenschaftserklärung wird über kontrastierende Copolymersequenzen geprüft. Die verschiedenen Architekturbeispiele sind keine unabhängigen Lernroutinen.',
'Sequenzen und Testwerte werden bereitgestellt. Ableitung und Vergleich leisten mehr als Namensabruf; kein zusätzliches Copolymer-Begriffsdeck nötig.')

campaign=json.loads((O/'native-D18/round-b/description-review-campaign.json').read_text());batch=campaign['batches'][0];inp=json.loads((O/'native-D18/round-b/description-review-input.json').read_text());goals=inp['goals'];runId='chemie-polymers18-final-native-independent-b-20261013-v6';reviewId='chemie-polymers18-current231-independent-b-20261013-v6';reviewer='Codex independent B /root/bio_0beb_underside_single_fresh_independent_b'
lookup={g['goalId']:S[max((k for k in S if g['goalId'].startswith(k)),key=len)]for g in goals}
records=[];findings=[];A=[]
for g in goals:
 gid=g['goalId'];s=lookup[gid];hold=gid.startswith('f947')
 rationale=('Die zweisprachige Beschreibung benennt eine klare einzelne Kompetenz im tatsächlichen Quellen- und Voraussetzungenkontext. '+s['atomicityReason']+' '+s['science'])
 records.append({'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':runId+':'+gid,'runId':runId,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],**{k:g[k]for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},'decision':'keep','understandingEvidence':s['understandingEvidence'],'rationale':rationale,'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'revise' if hold else 'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'})
 findings.append({'goalId':gid,'titleDe':g['currentTitleDe'],'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],'nativePhysicalPage':g['reviewContext']['page']['pageNumber']+2,'Ddecision':'keep','Pdecision':'hold_revision_required'if hold else'positive_current_tuple_ai_candidate','PRecommendation':'revise'if hold else'none','scienceFinding':s['science'],'semanticAtomic':True,'atomicityReasonDe':s['atomicityReason'],'memoryAdditionalRequired':False,'memoryReasonDe':s['memoryReason'],'memoryAction':'retain exact current valid M402 record; no new M vote','sourceScope':'Own conceptual clause only; no complete shared-source/partner discharge and no practical execution evidence','humanApproval':False,'humanTrial':False})
 A.append({'schemaVersion':1,'reviewId':reviewId+'-atomicity','ruleVersion':'semantic-atomicity-v1','landscapeId':'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0','goalId':gid,'fingerprint':'','status':'atomic','semanticAtomic':True,'reviewedAt':now,'reviewer':reviewer,'reason':s['atomicityReason']})
jsonl(W/'results'/ (batch['batchId']+'.records.jsonl'),records)
put(W/'SCIENCE.whole18-independent-b.actual-findings.json',{'schemaVersion':1,'reviewer':reviewer,'reviewedAt':now,'neutralSelector':{'path':str(O/'REVIEW_INPUTS.final18.current231.neutral.json'),'sha256':sha((O/'REVIEW_INPUTS.final18.current231.neutral.json').read_bytes())},'fullActualNativePagesSeen':20,'wholeSelectedGoalsRead':18,'wholeBilingualCasesRead':36,'caseSpecificRubricCriteriaRead':108,'allCurrentImagesActuallySeen':18,'legacyAuthorQAFlagsExcludedFromGrounds':True,'noOtherReviewerResultsRead':True,'evidenceLevel':'E1','maximumClaimScope':'G1','heldExcludedGoalIds':['413c5ee5-7826-549f-ad76-63743c59b188','9d942907-a59b-5898-9ce0-347fbea7d883'],'findings':findings})
params={'execution':'actual Codex inherited GPT-6 manual independent reasoning and local normal validators','exactModelRevisionExposed':False,'apiSamplingParametersExposed':False,'temperatureOrSeedInvented':False,'blindToOtherRuns':True,'runStartedAtBasis':'own input receipt before current full18 reading; unchanged asset-only prior readings reused only with exact body/byte proofs'};put(W/'execution/generation-parameters.actual.json',params)
manifest=json.loads((O/'native-D18/bundle/manifest.json').read_text());start=json.loads((W/'INPUT.current231-frozen-own-read-binding.receipt.json').read_text())['createdAt']
drun={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runId,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI','model':'GPT-6 (Codex inherited runtime; exact revision not exposed)','role':'subject_reviewer','promptFamilyId':'skillpilot-goal-description-understanding-evidence-review-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':sha((W/'execution/generation-parameters.actual.json').read_bytes()),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':[{'role':a['role'],'digest':a['digest']}for a in manifest['artifacts']]+[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],'startedAt':start,'completedAt':now,'status':'completed','outputDigest':sha((W/'results'/(batch['batchId']+'.records.jsonl')).read_bytes()),'toolchainVersion':'skillpilot-native-description-v2-codex-manual'}
put(W/'results'/(batch['batchId']+'.run.json'),drun)
# Exact profile payloads and their already current tuple are retained; only independent review metadata changes.
ps=[json.loads(l)for l in (O/'positive/P18.author.one-thermal-v4.raw17-exact.jsonl').read_text().splitlines()];prunId=reviewId+'-positive-profile-run'
for r in ps:
 s=lookup[r['goalId']];hold=r['goalId'].startswith('f947');r.update(reviewId=reviewId,reviewedAt=now,reviewer=reviewer,reason=('HOLD: bounded printed-task/rubric alignment gap. 'if hold else'Positive independent current-tuple machine candidate judgment. ')+s['science'],reviewRunIds=[prunId],dissent=['Case1 requires a valence-correct polyurethane repeat motif for full credit and e1 requires repeat-unit derivation, but neither printed whole case task explicitly requests the complete polymer repeat unit. Add the explicit DE/EN request and aligned brief; do not change source, goal or image merely to suppress this finding.']if hold else[])
jsonl(W/'positive/P18.current-tuple-independent-b.jsonl',ps)
pc=json.loads((O/'configs/P18.author.inactive.config.json').read_text());pc.update(reviewId=reviewId,reviewPath=str(W/'positive/P18.current-tuple-independent-b.jsonl'),reviewRunManifestPaths=[str(W/'positive/P18.independent-b.run.json')]);pc['scope']['label']='Actual final18 independent B;17 positive AI candidates, f947 truthful P hold';put(W/'configs/P18.independent-b.config.json',pc)
pp='Independent current-tuple Chemistry P review: personally inspect whole goal, full bilingual profile, both whole cases/data/model answers/rubrics, bounded source obligations and actual native page/images. Preserve exact profile body; record genuine scientific dissent without human or laboratory attestation. Use normal positive-understanding-evidence-v2 criteria. Author or peer metadata is not approval.\n';(W/'positive/P18.independent-b.prompt.txt').write_text(pp)
prun={k:v for k,v in drun.items()if k not in ['campaignId','roundId','batchId','batchInputFingerprint']};prun.update(runId=prunId,promptFamilyId='skillpilot-independent-positive-understanding-evidence-v2',promptFingerprint=sha(pp.encode()),criteriaFingerprint=sha(pathlib.Path(pc['reviewCriteriaPath']).read_bytes()),goalIds=[r['goalId']for r in ps],inputArtifacts=[{'role':'book_pdf','digest':sha((O/'native-D18/bundle/book.pdf').read_bytes())},{'role':'review_input_jsonl','digest':sha((O/'positive/P18.author.one-thermal-v4.raw17-exact.jsonl').read_bytes())},{'role':'review_prompt','digest':sha(pp.encode())},{'role':'review_criteria','digest':sha(pathlib.Path(pc['reviewCriteriaPath']).read_bytes())}],outputDigest=sha((W/'positive/P18.current-tuple-independent-b.jsonl').read_bytes()),toolchainVersion='skillpilot-positive-evidence-v2-codex-independent')
put(W/'positive/P18.independent-b.run.json',prun)
jsonl(W/'atomicity/A18.independent-b.jsonl',A);ac=json.loads((O/'configs/A18.author.inactive.config.json').read_text());ac.update(reviewId=reviewId+'-atomicity',reviewPath=str(W/'atomicity/A18.independent-b.jsonl'));ac['scope']['label']='Personally reviewed current18 semantic atomicity, independent B';put(W/'configs/A18.independent-b.config.json',ac)
# Capture actual sight facts after the full pages have been presented to this reviewer.
put(W/'NATIVE.full20-pages-personally-viewed.receipt.json',{'schemaVersion':1,'bookPdf':{'path':str(O/'native-D18/bundle/book.pdf'),'sha256':sha((O/'native-D18/bundle/book.pdf').read_bytes())},'renderMethod':'pdftoppm -scale-to 1650 -png; actual PDF physical pages, all personally viewed with view_image','pages':[{'path':str(p),'sha256':sha(p.read_bytes()),'physicalPage':int(p.stem.split('-')[-1]),'personallyViewed':True}for p in sorted((W/'native-previews').glob('page-*.png'))],'goalPagesComplete':18,'frontmatterPages':2,'noObservedClipping':True,'nativePageQAReviewCandidateFalsePublicationFlagsAreNotVoteGrounds':True})
print(json.dumps({'Drecords':len(records),'Ppositive':17,'Phold':1,'AindependentAtomic':len(A),'currentRun':runId,'reviewStartedAt':start,'completedAt':now}))
