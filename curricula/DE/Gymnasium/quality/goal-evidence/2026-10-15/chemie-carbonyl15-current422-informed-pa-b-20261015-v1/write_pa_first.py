import json
from pathlib import Path
from datetime import datetime, timezone

ROOT=Path(__file__).parent
SOURCE=ROOT.parent/'chemie-carbonyl15-current422-native-preparation-technical-20261015-v1'
goals=json.loads((SOURCE/'blind-scientific-inputs/fifteen-whole-current-goals.json').read_text())['goals']
cases=json.loads((SOURCE/'blind-scientific-inputs/thirty-complete-current-bilingual-cases.json').read_text())['cases']
rows=[]

def add(i, profile, case1, case2, transfer, operator, atomicity, dissent=None):
    goal=goals[i-1]
    actual_cases=[c for c in cases if c['goalId']==goal['id']]
    assert len(actual_cases)==2
    rows.append({'ordinal':i,'goalId':goal['id'],'titleDe':goal['title'],'profileDecision':'KEEP',
                 'profileReasonDe':profile,'caseReviews':[{'caseId':actual_cases[0]['caseId'],'decision':'KEEP','reasonDe':case1},
                                                         {'caseId':actual_cases[1]['caseId'],'decision':'KEEP','reasonDe':case2}],
                 'meaningfulTransferDe':transfer,'operatorCoverageDe':operator,
                 'atomicityDecision':'atomic','semanticAtomic':True,'atomicityReasonDe':atomicity,
                 'dissent':dissent or [],'candidateRecommendation':'E1/G1 ai_candidate, needs_human_review; current supplied profile body retained'})

add(1,
 'e1 verbindet Testwahl mit Kandidatenraum, e2 chemische Deutung und Kontrollen, e3 tatsächliche Ausführung. Alle drei sind erforderlich und bilingual gleichwertig. Die Profilbriefe sind vollständige Aufgaben mit begründetem Erwartungshorizont. Die Mindestzahl2 bezeichnet getrennte Nachweisschritte, keine zwei Pflichtfälle.',
 'DNPH-/Cu(II)-Sequenz trennt die drei reinen Kandidaten. Bromwasser als unspezifischer Befund wird ausdrücklich hinterfragt. Die ionische Propanalreaktion erhält Atome und Ladung. Rubriken1/2 prüfen gestellte Papierleistungen, Rubrik3 nur tatsächliche freigegebene Cu(II)-Durchführung mit Wasserblank, Positivvergleich und gleichen Wasserbadbedingungen; kein Papierkredit für e3.',
 'Hydrogencarbonat und Hydrolyse prüfen ein anderes Reaktionsprinzip. Ethanol ist nur innerhalb des begrenzten Kandidatenraums ausgeschlossen identifiziert; der negative Test wird nicht zum universellen OH-Beweis. Säure-/Hydrogencarbonatgleichung und Esterhydrolyse stimmen. Offene Gefäße und reale protokollierte Vergleichsbeobachtungen sind als Ausführungskriterium gestellt.',
 'Carbonyl-Redox zu Säure-/Hydrolysenachweis ändert Selektivität, Störmöglichkeiten und Kandidatenlogik; dies ist chemischer Transfer.',
 'Auswählen, durchführen und deuten bleiben getrennt sichtbar. Der konkrete betreute Laborrahmen ist definiert; ein fehlendes reales Ergebnis ist eine zukünftige Leistungsbedingung, keine Sperre dieser Materialkandidatur.',
 'Die eine Kompetenz ist eine begründete qualitative Identifikation; Auswahl, Durchführung und Schlussfolgerung bilden ihren zusammenhängenden Erkenntnisweg.')

add(2,
 'Das concept-Profil trennt Dispersions-/Dipol-/H-Brückenbeiträge von Ionen-Dipol und führt die Aussagen an konkreten Paaren zusammen. e1/e2 zeigen die zentrale Unterscheidung; e3 benutzt Eigenschaften zur Prüfung des Erklärungsmodells. Es verlangt keine ganze zusätzliche Stoffeigenschaftslehre. DE/EN bewahren Donator/Akzeptor und Ladungsrichtung.',
 'Ethanol und Dimethylether bei gleicher Molmasse begrenzen den H-Brückenvergleich sinnvoll. Ether akzeptiert Wasser-H-Brücken, ohne im Reinstoff O-H-Donator zu sein. Na+/Cl--Orientierung und Pentan als unpolarer Vergleich sind klar und chemisch richtig. Die drei Rubriken gehören exakt zu den drei Aufgaben.',
 'Aceton/Hexan widerlegt eine permanente-Dipol-Immerregel bei unterschiedlicher Polarisierbarkeit; Methanol/Aceton benötigt eine H-Brücke zwischen verschiedenen Molekülen, Mg2+-Hydratation eine andere Ladungsebene. Keine intramolekulare C=O-Bindung wird als zwischenmolekulare Kraft gewertet.',
 'Neue Größe/Polarisierbarkeit, H-Brückenfähigkeit und Ionenteilchen verlangen erneute Zuordnung statt einer Zahlenvariante.',
 'Erläutern an Beispielen wird über Ursache, Orientierung und eine begründete Gegenprüfung sichtbar. Die Abfrage einer auswendig gelernten Rangliste reicht nicht.',
 'Ein strukturbasiertes Wechselwirkungskonzept wird an mehreren Teilchentypen verglichen; die vier Namen sind keine vier unabhängigen Routinen.')

add(3,
 'Das modeling-Profil nennt Protonenquelle und energiegekoppelte Sekretion, trennt PPI von Neutralisation und verlangt eine begrenzte Schlussfolgerung. Die Modellrechnung in e3 dient der Bilanz dieses Mechanismenvergleichs. Sie begründet keine klinische Kompetenz und ist durch vorhandene Konzentrations-/pH-Voraussetzungen gestützt.',
 'CO2/H2O und getrennte H+/K+- sowie Cl--Wege sind chemisch plausibel vereinfacht. Die NCI-Definition wurde direkt geprüft. 12.0/10.2mmol proLiter geben pH1.921/1.991. Die Rubrik verlangt den tatsächlichen Quellenabschnitt sowie die Erklärung fehlender Puffer/Entleerung/Pharmakokinetik; keine Wirkeintrittsprognose wird bewertet.',
 'Der geänderte Nullzufluss bei Pumpenhemmung gegenüber Verbrauch und anschließendem Zufluss ergibt6.00 gegenüber8.00mmol/L. pH2.222 und2.097 sind korrekt. Die Modellbasis erlaubt ein begrenztes chemisches Urteil und ausdrücklich keine reale Therapieempfehlung.',
 'Vorhandene Säure versus neue Sekretion sowie spätere Nachlieferung ändern den Mechanismusvergleich wesentlich.',
 'Beschreiben und daran erklären werden tatsächlich geprüft; die Quellenbenennung ersetzt nicht die begründete Transporterklärung.',
 'Die chemische Bildung liefert die Ursache, aus der die Pumpenhemmung erklärt wird. Dies ist eine zusammenhängende Wirkprinzip-Kompetenz.')

add(4,
 'Das data-Profil unterscheidet Enzymkatalyse, Grenzflächenwirkung, mikrobielle Substrate und lebende Mikroorganismen. e2 verlangt tatsächlich protokollierte Recherche und getrennte Quellenrollen; e3 eine begrenzte chemische Bewertung. ODS-Einleitung/Identifikation/Mechanismen, NIDDK-Lactaseabschnitt und WindSetlers4.1/5.1 wurden zusätzlich gezielt direkt geprüft und stützen die begrenzten Paraphrasen.',
 'Die Lactose-Nettohydrolyse liefert je8.00mmol Glucose/Galactose,2.00mmol Rest; inaktive Kontrolle ist passend. Die Behauptung jedes Probiotikums als Lactaseersatz wird anhand Substrat und konkreter Quellen bewertet. Der Modellumsatz erhält keinen klinischen Wirksamkeitsstatus.',
 'Vollständige Hydrolyse0.60mmol Fett ergibt0.60mmol Glycerin/1.80mmol Fettsäuren; die unabhängige70%-Schaumabnahme misst etwas anderes. Der Hersteller beschreibt tatsächlich physikalische Entschäumung und gasbezogene Symptomanwendung; die Rubrik trennt diese Labelangabe von einer unabhängigen Studie und vom fiktiven Versuch.',
 'Substratwechsel zu Fett und Wechsel von chemischer Spaltung zu physikalischer Schaumgrenzfläche sind relevante Struktur-/Mechanismusänderungen.',
 'Recherche und Bewertung der Wirkung/des Einsatzes werden explizit gefordert. Quellenprotokoll muss später die wirkliche Recherche belegen; es wird hier nicht erfunden.',
 'Alle Vergleichsgruppen dienen derselben Frage einer chemisch begründeten Hilfsmittelbewertung. Kein additives Sammelziel aus unabhängigen Laborroutinen.')

add(5,
 'Das Profil berücksichtigt Zusammensetzung, Strukturgruppen, wirkstoffbezogene Anwendungsinformationen und die Messgröße von Konsum. e1 verlangt die begrenzte Anwendungsbewertung, die der direkte Quelloperator und PK5 tragen. Das wird als bestehender Profilinhalt geprüft; keine zukünftige Beschreibungsfassung wird als Input verwendet.',
 'ASS-Säure/Ester, Ibuprofen-Säure und Paracetamol-Phenol/Amid sind korrekt. 600/360/500g gesamte Wirkstoffmassen und1.2/1.8/1.0Tabletten jePerson/30Tage stimmen. RKI-Daten8.0/5.8/5.2% stammen tatsächlich aus DEGS1 und umfassen mehr als OTC. Die Aufgaben fragen Herkunft, Zeitraum und Bedeutung; die Rubrik behauptet keine heutige Prävalenz.',
 'KombinationspräparatX verlangt erneute Struktur- und Anwendungsbewertung. X1.5 gegenüberY2.0Tabletten/Person/30Tage und Gesamtmassen je150g bzw.320g stimmen. RKI10.0 auf12.2% bedeutet2.2Prozentpunkte und22% relativ. Der Originalmethodenteil selbst verwendet BGS98,1998;n7099; der Hintergrund1997–1999. Die Fallkurzbezeichnung1998 ist daher kein Quellenfehler.',
 'Kombination und veränderter Verkaufsnenner verhindern eine bloße Massenrangfolge und prüfen die Aussagegrenze eigenständig.',
 'Echte Rechercheorte, Gruppenbestimmung und explizite begründete Werbeaussagenbewertung sind gestellt. Persönliche Arzneimittelauswahl wird daraus nicht abgeleitet.',
 'Recherche und Strukturinformation sind die Grundlage einer gemeinsamen chemischen Einordnung und begrenzten Anwendungsbewertung, kein notwendiger Split nach jedem Informationskanal.',
 ['Der eigene getrennte D-Befund zum fehlenden expliziten Bewertungsoperator der aktuellen Kurzbeschreibung bleibt offen. Die vorhandene Profilleistung und der tatsächliche BY-Quelloperator tragen diese Bewertung bereits; dieser P-Kandidat akzeptiert keine ungeschriebene Textänderung.'])

add(6,
 'Das modeling-Profil wahrt einen gemeinsamen Acylmechanismuskern und unterscheidet geeignete Bedingungen für O- und N-Nucleophile. Erforderliche e1/e2/e3 prüfen Stoffbilanz, Elektronenpaarbewegung und den Salz-/Amidunterschied. Die aktuelle Beschreibung verlangt keine eigene Syntheseausführung; das Profil macht daraus keinen Laborzwang.',
 'Ethansäure/Ethanol und thermisch aktivierte Ethansäure/Ammoniak-Kondensation sind als Papiermodell begrenzt. Tetraedrisches C mit4Einfachbindungen, O-/N-Ladungen und Wasserabgang sind richtig. NH4+ wird wegen fehlendem freiem Elektronenpaar nicht zum guten Nucleophil gemacht. Aufgaben und Rubriken stimmen überein.',
 'Geänderter Acylrest und Methylamin statt Ammoniak erfordern N-Methylamid und die richtige vierbindige N+-Zwischenstufe. Die Salzbildung im Kalten genügt ausdrücklich nicht. Aktivierung/Entwässerung wird als notwendige Bedingung und nicht als automatisch vorhandener Mechanismusbeweis behandelt.',
 'O- zu N-Angriff sowie veränderte Protonierung und Aktivierung sind fachlich relevante Mechanismustransfers.',
 'Anwenden und Beschreiben werden durch formulierte Bindungs-/Elektronenpaaränderungen sichtbar. Eine Nettoformel allein erfüllt e2/e3 nicht.',
 'O- und N-Fall sind Varianten einer nucleophilen Acylreaktion, deren gemeinsames Muster und Bedingungen gerade die Kompetenz bilden.')

add(7,
 'Das representation-Profil verlangt Grundbanden, Protonenumgebungen und die gemeinsame Konsistenzprüfung. Es bleibt bei einfachen Strukturen, einfacher Kopplung und ausdrücklich begrenztem Datensatz. DE/EN nennen dieselben Flächen und Umgebungen. Gerätebau und13C werden nicht als erfüllte Ziele mitbehauptet.',
 'Ethylethanoat passt zu Esterband1740cm-1 und3/2/3H mitt/q/s.8H sind vollständig zugeordnet. Methylpropanoat würde ein3H-OCH3-Singulett statt2H-OCH2-Quartett liefern. IR allein entscheidet die Isomere nicht; dies wird in Aufgabe und Rubrik explizit verlangt.',
 'Aldehyd-C-H-Banden und9.8ppm-1H trennen Propanal von Propanon. Das symmetrische Keton besitzt ein6H-Singulett. Die feine CH2-Aufspaltung wird nicht unangekündigt verlangt. Ohne vollständige Daten bleibt die Carbonylband allein mehrdeutig.',
 'Esterisomerie zu Aldehyd/Keton verändert die entscheidenden Strukturinformationen und die verbleibenden Alternativen.',
 'Signal-Struktur-Zuordnung muss begründet werden; bloße Wiederholung der abgebildeten Ethylethanoat-Struktur erfüllt den anderen Fall nicht.',
 'Die eine Kompetenz ist konsistente Zuordnung einfacher Strukturen aus komplementären Signalen, keine zwei isolierten Gerätekompetenzen.',
 ['RP1.5 enthält weitere Geräte-/13C-/UV-VIS-Aspekte, die weder dieser enge P-Kandidat noch ein allgemeiner Datenpartner vollständig nachweist. Keine mappingweite Vollabdeckung wird behauptet.'])

add(8,
 'Das modeling-Profil nennt den Angriff ausdrücklich als nucleophile Addition, die pi-Elektronenverschiebung und getrennte elektronische/sterische Beiträge. e3 verhindert eine unbedingte Klassenrangfolge. Es ist damit fachlich präziser als die knappe aktuelle Beschreibung, bleibt aber auf deren bestehenden Carbonylvergleich beschränkt.',
 'Nu- greift Carbonyl-C an und erzeugt korrekt O--Alkoxid mit tetraedrischem C. Ethanal gegenüber Propanon hat weniger Alkyl-Elektronenschub und Abschirmung.6:1 wird nur als bedingte synthetische Rate verwendet; eine Acylsubstitution ist kein zulässiger Produktweg im gegebenen Modell.',
 'CF3COCH3 mit-I undRate5 kann das AldehydAmitRate4 übertreffen, während AlkylvergleichA/B weiter erklärbar bleibt. Ladungen und Bindungszahl stimmen. Die Frage fordert genau die begrenzte Aussage statt einer universellen Aldehyd-vor-Keton-Regel.',
 'Ein elektronenziehender Substituent verändert die Erklärung und kann die Klassenreihenfolge umkehren; dies ist eigenständiger chemischer Transfer.',
 'Mechanistisch begründen verlangt Elektronenpaarbewegung und begründeten Vergleich, nicht nur Ratenabschreiben. Die Fälle enthalten geeignete Modellbedingungen.',
 'Elektrophilie und sterischer Zugang erklären gemeinsam dieselbe Reaktivität; ihre analytische Trennung führt nicht zu zwei unabhängigen Zielroutinen.',
 ['Die eigene getrennte D-Präzisierung zum Reaktionstyp/vergleichbaren Bedingungen bleibt offen; der P-Kandidat bindet weiterhin die aktuelle unveränderte Beschreibung. Die HE-Zelle belegt nucleophile Addition im Kohlenhydratkontext, keine komplette allgemeine Reaktivitäts- oder Projektionsabdeckung.'])

add(9,
 'Das data-Profil enthält drei notwendige Teile derselben begründeten Bewertung: Stoffmengenprinzip, echte Zusammensetzungs-/Nebenwirkungsrecherche und Vergleich chemischer Eingriffspunkte. e2 fordert eine berichtete Möglichkeit und erfindet keine Häufigkeit. Die zusätzlich direkt gelesenen Rennie-Abschnitte2/4.8/5.1 bestätigen diese Grenze und die Produktidentität.',
 'CaCO3/Mg(OH)2-Gleichungen erhalten Atome/Ladung; Kapazitäten9.991/10.288mmol undCO2 4.996mmol stimmen. Wirkstoff des echten Rennie-Labels ist Magnesiumcarbonat, das Modell enthält bewusst Magnesiumhydroxid. Quellenbericht, Gasmodell und nicht bestimmte Nebenwirkungsrate sind in der Aufgabenstellung getrennt.',
 'NaHCO3 verbraucht1mmol, Mg(OH)2 2mmol; Rest4/3mmol in0.1000L liefert pH1.398/1.523. Die Aufgaben prüfen no-CO2-does-not-mean-safe sowie die endliche Kapazität bei Nachfluss. Der Algorithmus darf diese Rechnungen nicht zu einer individuellen Behandlungsempfehlung machen; die Rubrik tut dies nicht.',
 'Carbonat/Hydroxid, aktive Prinzipien und fortgesetzter Säurezufluss ändern chemische Bewertung und Aussagegrenzen.',
 'Recherchieren, Beschreiben und Bewerten bleiben ausdrücklich gestellt. Die Differenzierung von Herstellerberichten und Modellchemie ist eine tatsächliche fachliche Leistung.',
 'Reaktionsdaten und Quellenangaben sind Gründe einer einzigen chemischen Optionsbewertung. Die mehreren Kriterien bilden kein unverbundenes Sammelziel.')

add(10,
 'Das modeling-Profil verbindet Disconnection, vollständige Bausteine und Vorwärtsprüfung. e3 beschreibt Plausibilitätsgrenzen, nicht die Durchführung einer zusätzlichen Wirkstoffsynthese. O-/N-Acylierung sind konkrete sinnvolle Variationsachsen. Die Fälle gehen ohne Bildvorlage.',
 'ASS-Disconnection trifft die phenolische Acyl-C-O-Bindung; Salicylsäure und Anhydrid geben die richtige Vorwärtsbilanz samt Ethansäure. Benzoesäure/Ethanol erklärt das falsche Gerüst. Die formale Säurealternative wird nur mit Aktivierungs-/Gleichgewichtsvorbehalt behandelt.',
 'Paracetamol erfordert4-Aminophenol und N-Acylierung. C10/H13/N1/O4 beidseitig stimmt. O-Acylierung liefert ein anderes Produkt mit freier Aminogruppe; die Aufgaben fragen genau Chemoselektivität und die Grenze einer Rückwärtsidee.',
 'Phenolester zu aromatischem Amid ändert Bindungstrennung und selektiven Angriffsort, nicht nur Molekülnamen.',
 'Ableiten von Edukten und Reaktionstyp wird sichtbar durch Zeichnung/Benennung, Vorwärtsbilanz und begründete Zurückweisung einer falschen Route.',
 'Rückwärtszerlegung und Vorwärtskontrolle sind Teile derselben synthetischen Schlussfolgerung.')

add(11,
 'Das experiment-Profil verlangt explizit Planen, Kontrollbedingungen und referenzbezogenen Vergleich, aber kein erfundenes eigenes Laborexperiment. e3 unterscheidet Rückgewinnung, Identität und Reinheit. Die quantitative Planungsabschätzung unterstützt die Trennentscheidung und wird nicht mit Reinheit gleichgesetzt.',
 '50mL Mindestvolumen und484mg/96.8% maximal rückgewinnbarer ASS stimmen unter den ausdrücklich idealisierten Löslichkeitsdaten. Filtration vor Einengen ist begründet; identische Heizrate/TLC-Bedingungen und Referenzen sind gestellt. Gleiche Befunde sind Hinweise und keine absolute Reinheitsgarantie.',
 'Heißes NaOH verändert die Esteridentität. Die2OH--Bilanz mit protoniertem Phenol als Nettokonvention ist korrekt. Rf0.62/0.30 und erniedrigter breiter Schmelzbereich machen die280mg-Gesamtmasse als reine ASS-Ausbeute unzulässig. Selektive quantitative Bestimmung wird als fehlender Beleg benannt.',
 'Veränderte basische Aufarbeitung prüft den Übergang von physikalischer Trennung zu chemischer Umwandlung.',
 'Der reale Quelloperator Planen/Vergleichen bleibt gewahrt. Die Planung kann aus echten oder bereitgestellten Vergleichsdaten beurteilt werden; tatsächliche Herstellung wird nicht behauptet.',
 'Eine identitätserhaltende Extraktion und die Prüfung ihrer Vergleichbarkeit bilden einen zusammenhängenden Untersuchungsplan.')

add(12,
 'Das modeling-Profil trennt sensorische Sensibilisierung, COX-bezogene Mediatorbildung und menschliche Schmerzverarbeitung. Der FDA-Mechanismusabschnitt wurde gezielt direkt geprüft. e1/e2/e3 haben dieselbe begrenzte Modellbedeutung in DE/EN; Paracetamol wird nicht fälschlich zum vollständig geklärten peripheren NSAID.',
 'COX100auf25Einheiten zeigt75% weniger Modellprodukt, nicht75% weniger Schmerz. Inaktivkontrolle0 prüft Enzymabhängigkeit. Die explizit geforderte Kette von Gewebeereignis bis Verarbeitung hält Substrat, Enzym und Mediator auseinander.',
 'Externer Mediator bringt39nahe40 zurück und umgeht den Syntheseschritt. Die Aufgaben verlangen den Unterschied zwischen diesem fiktiven Positionsversuch und klinischer Schmerzfreiheit sowie die Grenze auf das untersuchte Modell.',
 'Direkte Mediatorzugabe verändert den kausalen Eingriffspunkt und prüft die Einordnung des Hemmorts.',
 'Stark vereinfachtes Beschreiben und Erläutern sind konkret beobachtbar, ohne eine komplette Neurowissenschafts- oder Wirksamkeitsprüfung einzuführen.',
 'Die Schmerzmodellkette ist der zusammenhängende Erklärungskontext für den COX-Eingriff, kein zusätzliches unabhängiges Lernziel.')

add(13,
 'Das data-Profil trennt Freisetzung von resultierender Konzentration, verlangt einen definierten Wirkungsschwellwert und begrenzt Schlussfolgerungen bei Matrix-/pH-Wechsel. Die beiden Zeitgrößen werden im selben Wirkungskriterium verglichen. Keine Form erhält eine universelle Rangordnung.',
 'Lineare Interpolation ergibt L0.5–3h, I1–4h undR2–4h mit Dauern2.5/3/2h. Die Retardbezeichnung erzwingt bei dieser Schwelle nicht die längste Dauer. Alle Größen sind Modell-Plasmakonzentrationen, keine Freisetzungsanteile.',
 'Enterische Verzögerung, Retardfreisetzung und zerstörte Modellmatrix sind verschieden.50%-Zeiten3/2.667/0.556h stimmen. Ohne Elimination/Abfallkriterium gibt das ausdrücklich verlustfreie Modell keine endliche Dauer; die Rubrik fragt genau diese Grenze statt eine erfundene Dauer.',
 'Wechsel von Konzentrationskurve zu In-vitro-Freisetzung und pH-/Matrixänderung verhindert mechanisches Übertragen der ersten Schwellenzeit.',
 'Vergleichen und Beurteilen von Eintritt/Dauer wird durch ein gemeinsam definiertes Kriterium und die begründete Nichtbestimmbarkeit im zweiten Modell geprüft.',
 'Beginn und Dauer sind Merkmale derselben Formulierungsbewertung; ihre gemeinsame Betrachtung ist fachlich kohärent.')

add(14,
 'Die vorhandenen Modell-/Ausführungserwartungen sind als chemisches Leistungsdesign tragfähig. e1/e2 behandeln C-C-Aufbau und erst spätere Protonierung, e3 verlangt wirklich beobachteten beaufsichtigten Reagenzeinsatz. Alle verlangten Laborvoraussetzungen werden ausdrücklich genannt; das Profil behauptet keinen heutigen Laborvollzug. Die separate curriculare Quellen-/Scopefrage bleibt im D-Kanal offen.',
 'Ethanal plusEthylrest liefert Butan-2-ol. Nach1mmol Wasser bleiben34mmolReagenz,30mmolCarbonyl limitiert. Protonierungsnebenreaktion und Alkoxidfolge stimmen. Rubrik3 verlangt tatsächliche geprüfte Reagenzidentität, trockene/inert vorbereitete Bedingungen, dokumentierte Dosierung und getrennten Fachpersonal-Quench; die Papierlösung erhält dafür0.',
 'Propanon führt zum tertiären2-Methylbutan-2-ol.6mmolEthanol verbraucht Reagenz irreversibel zuEthan/Alkoxid;19mmolProdukt bzw.95%Carbonylumsatz ist korrekt. Der Störfall wird nicht absichtlich unsicher praktisch ausgeführt. Die echte Einsatzrubrik bleibt auf beobachtete freigegebene Handlung begrenzt.',
 'Aldehyd/Keton, Alkoholklasse und protischer Nebenverbrauch ändern die geeignete Synthese und limitierende Stoffmenge.',
 'Einsetzen bleibt als reale Leistung modelliert; ein Papiermechanismus wird nicht zum Handlungsnachweis gemacht. Eine fehlende tatsächliche Schülerleistung ist kein zusätzliches Hindernis dieser AI-Materialkandidatur.',
 'Addition und spätere Alkoxidprotonierung ergeben gemeinsam einen Alkohol-Synthesevorgang; Bedingungen und Störverbrauch erklären dessen Gelingen.',
 ['Die curriculare Zuordnung des unveränderten Grignard-Ziels und seines praktischen Einsatzumfangs ist in den direkt gebundenen Quellen nicht belegt; der eigene D-Blocker bleibt unverändert. Dieses E1/G1-Profil bewertet nur die wissenschaftliche Plausibilität des vorhandenen Leistungsdesigns und erteilt keine Lehrplan- oder Hostfreigabe.'])

add(15,
 'Das data-Profil verbindet Identifikationssignal, stoffmengen-/kalibrationsbezogene Quantifizierung und Selektivitätsbewertung. Alle Erwartungen sind in beiden Fällen explizit gestellt und sprachlich äquivalent. Es bleibt beim Auswerten bereitgestellter Experimente.',
 'ASS-TLC-Signal allein ist keine absolute Reinheit.2OH-/ASS und selektiver nachbehandelter Endpunkt sind klar definierte Modellbedingungen. Blinddifferenzen2.775/1.943mmolOH- ergeben1.3875/0.9715mmolASS und249.972/175.025mg. Eine zusätzliche titrierbare Säure würde als ASS fehlgerechnet; die Rubrik prüft diese Grenze.',
 'Analytspezifische Kalibrationen ergebenA50/25undB25/50mg/L; Verdünnung100und0.1000L führen zu500/250bzw.250/500mg. Gleiche750mgGesamtmasse mit2:1gegen1:2ist keine gleiche Zusammensetzung. Koelution ist als Signal-/Selektivitätsproblem explizit gefragt.',
 'Rücktitration zu getrennt kalibrierter Chromatographie ändert Messprinzip, Blindwertbehandlung und Selektivitätsrisiken.',
 'Qualitatives und quantitatives Auswerten sowie Zusammensetzungsvergleich sind echte Aufgabenleistungen; Durchführung und klinische Wirkung werden nicht aus Lösungen erfunden.',
 'Identität und Menge sind komplementäre Bestandteile derselben prüfbaren Zusammensetzungsanalyse, kein notwendiger Split in zwei isolierte Ziele.')

payload={'role':'independent informed targeted P/A; same agent after own sealed D review, no other reviewer outputs read',
         'createdAtUTC':datetime.now(timezone.utc).isoformat(),
         'scope':'15 current unchanged goals/profiles and30 full bilingual cases,90 explicit rubric criteria; A means semantic atomicity.',
         'criteria':'chemistry-positive-understanding-evidence-profile-criteria-v1 and positive-understanding-evidence-profile-authoring-v2, with no mandatory task-count interpretation.',
         'judgments':rows,
         'boundary':'Each KEEP follows the individual reasoning, not technical eligibility. E1/G1 is a local machine candidate based on the supplied design. No observed learner, lab, clinical, human-trial, authoritative mapping, active registry or strict/M7 completion claim.'}
(ROOT/'PA.FIRST.independent-informed-science.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n')
print('Wrote',len(rows),'P and A FIRST judgments and',sum(len(r['caseReviews']) for r in rows),'case reviews')
