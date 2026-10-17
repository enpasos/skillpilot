import json, pathlib, hashlib, datetime

BASE=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17')
OUT=BASE/'chemie-current439-HB-remaining162-term27-binding-independent-a-20261017-v2'
INPUT=BASE/'chemie-current439-HB-remaining162-term27-clean-input-20261017-v2/INPUT.remaining162-term27.neutral.json'
J=json.loads(INPUT.read_text())
G={g['id']:g for g in json.loads(pathlib.Path(J['centralInputs']['C54']['path']).read_text())['goals']}
P={r['goalId']:r for r in map(json.loads,pathlib.Path(J['centralInputs']['P439']['path']).read_text().splitlines())}
IX={x['goalId']:x for x in J['wholeBodyIndex']}
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def objsha(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def put(name,x):
 p=OUT/name;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
def gid(pre):return next(x for x in G if x.startswith(pre))

# These are reviewer-written scientific source-binding conclusions, not generated
# from lexical matches or an author's proposed ACCEPT/HOLD classification.
NOTES={
71:'72236f2c erklärt Kern/Hülle und Teilchen mit Streubefund; f5efab9d ergänzt Energiestufen und ihre Modellgrenze. Passendes Modell, keine Pflicht zu einer zusätzlichen Atomtheorie.',
72:'e9d74940 begründet Ordnungszahl, Gruppe, Periode und Valenzelektronen; 72236f2c ergänzt A/Z, Neutronen und Ladung. Zusammen werden Ordnungsprinzipien und ausgewählte Atome beschrieben.',
73:'448815cc unterscheidet die Bindungsarten, 747c5777 leitet Bindungspolarität aus EN und Molekülpolarität zusätzlich aus Geometrie ab. EN wird nicht als universelle scharfe Grenzzahl behandelt.',
74:'eb7537dd verlangt Entstehung/Deutung intermolekularer Kräfte; 91cd4728 fordert permanente Dipole und H-Brücken ausdrücklich getrennt. Reine Stoffnamen reichen nicht.',
75:'5abc5961 beschreibt Gittertrennung und orientierte Hydratation; 7a36f2a2 erklärt O-Seite zu Kation, H-Seiten zu Anion und Ion-Dipol-Kontakte. Eine zusätzliche reale Löseausführung steht hier nicht im Quellenverb.',
76:'1dc15fa2 benennt gezählte Teilchen und mol, e45c0022 benutzt N=n·NA, 8a2ad724 m=n·M, f1ed86f0 Stoffmenge/Volumen und Verdünnung. Damit ist die verlangte Verknüpfung quantitativ vorhanden.',
77:'72236f2c verbindet Rutherford-Streuung mit konzentriertem Kern; f5efab9d interpretiert Ionisierungsenergie-Sprünge als Energiestufenbefund. Die Rolle ausgewählter Experimente wird beschrieben, keine eigene Durchführung des historischen Versuchs gefordert.',
78:'a44af1fa deutet vorgegebene Fällungs-/Natrium-/pH-Befunde. Der vollständige erste Fall sagt ausdrücklich keine Durchführung verlangt; der zweite bleibt fiktive Etikettauswertung. Die praktische Ionen-Nachweisleistung sowie Farbreaktion/Gasentwicklung als prüfbare Nachweiswege sind nicht verbindlich belegt.',
79:'72236f2c/f5efab9d tragen Kern/Hülle und Elektronenverteilung; e74f5301 fordert eigene korrekte Orbital-/Lewis-Valenznotation samt Ionenladung. Eine schematische Atomdarstellung ist konkret prüfbar.',
80:'e74f5301 bilanziert Valenzelektronen von Atomen/Ionen; 23533087 fordert Lewis-/Valenzstrichdarstellungen und Grenzen. Atom- und Molekülschreibweise werden nicht gleichgesetzt.',
81:'72236f2c bewertet die Reichweite von Streubefund und Skizze; 86d34f1f verlangt begründete Modellwahl und Modellkritik. Der Unionbeitrag ist das Bewerten konkreter Atom-/Bindungsdarstellungen, keine pauschale Modellkompetenzgutschrift.',
82:'dd58c029 prüft homologe Kohlenwasserstoffreihen und Isomerie; 536b48b2 Alkanolnamen, e9b61d96 Alkanolisomerie. Die homologe Reihe der Alkohole wird in den vollständigen Alkanolaufträgen nicht beschrieben oder begründet; nur Alkannamenswissen wird dafür nicht übertragen.',
83:'dd58c029 benennt Kohlenwasserstoffe; 536b48b2 und e14abd24 begründen Stammkette, Position und funktionelle Endung bei ausgewählten organischen Verbindungen. Keine vollständige IUPAC-Systematik wird zusätzlich verlangt.',
84:'67cd332f zählt Elektronenbereiche, leitet räumliche Gestalten ab und enthält den Methan-Transfer. Damit wird EPA auf einen ausgewählten Alkanfall angewendet, ohne jedes Alkan als eigenes Aufgabenpensum zu verlangen.',
85:'3d3231f9 verlangt eine positive Schmelzerklärung über Packung/Fusionsdaten und eine Siedeerklärung; 5a30273a ergänzt Struktur-/Lösemittelwahl. Alkane, Alkoholketten und Isomere werden mit ihren jeweiligen Grenzen verglichen.',
86:'7990387d erkennt funktionelle Gruppen und Mehrfunktionalität; 91cd4728 und 5a30273a erklären strukturabhängige Wasserkontakte/Löslichkeit. Gruppenbenennung allein erhält keinen Löslichkeitskredit.',
87:'3d3231f9 und 91cd4728 verbinden Molekülgröße, Form, London-, Dipol- und H-Brückenanteile mit Eigenschaften; die jeweilige Vergleichsbasis und Packungsgrenze bleiben erhalten.',
88:'e5aefd51 fordert die radikalische Kette, 3fb7dea4 den ionischen elektrophilen Additionsweg samt geänderten Bedingungen. Ein Mechanismus wird nicht durch die bloße Produktformel ersetzt.',
89:'Die vollständigen Fälle von 3d3231f9/5a30273a erklären Strukturtrends und gegebene Fusionsdaten; sie beschreiben keine Untersuchungsverfahren zur Löslichkeit sowie zu Schmelz-/Siedetemperaturen. Es fehlt die Beschreibung der Untersuchung, nicht ein zusätzlich erfundener eigener Laborversuch.',
90:'3de28598-e3 verlangt reale beaufsichtigte qualitative Probe mit Kontrollen und eigenen Beobachtungen; 973c12d9 ergänzt kontrollierte Aldehyd/Keton-Probe. Damit ist Prüfen funktioneller Gruppen tatsächlich als Leistung gebunden.',
91:'dd58c029 und 345fdca9 fordern eigene Struktur-/Skelettdarstellung; 92c99237 überführt Struktur-/Lewis-/Summenformeln und begründet die Wahl. Die Mehrdeutigkeit bloßer Summenformeln bleibt sichtbar.',
92:'0503c975 erklärt den fossilen Kohlenstoffzufluss; a0e8f0f2 verlangt eigene Rohstoffrecherche und nachhaltiges Urteil; 8b98d8ba quellenbelegte Maßnahmen. Die Union bindet Beschreibung und kritische Bewertung der fossilen Nutzungsfolgen zusammen.',
93:'ebfa2c18 verlangt begründete Green-Chemistry-Massenbilanzen und ihre Grenzen; c21a611c Herkunft/Entsorgung und 1df17884 transparente Kriterien/Zielkonflikte. Ausgewählte Nachhaltigkeitskonzepte sind erklärt; gedruckte Beispiele begründen keine zusätzliche Konzeptquote.',
94:'6eb14e47 leitet Polymerketten aus Vinylmonomeren ab; 9b942490 beschreibt wiederholte bifunktionelle Verknüpfung mit Bilanz/Endgruppen. Der Übergang Monomer–Makromolekül ist eine geforderte Leistung.',
95:'6eb14e47 erklärt radikalische Polymerisation, 9b942490 Polyester/Polyamide, 0278a515 die beiden PLA-Herstellungsmodelle. Ausgewählte Kunststoffherstellung wird erläutert; eine reale Synthese ist hier kein zusätzliches Quellenverb.',
96:'c21a611c-e1 trennt fossile/biobasierte Herkunft von Abbau und Recycling; 0278a515 wendet dies auf PLA an. Herkunft wird nicht als Umwelt- oder Abbaugarantie behandelt.',
97:'0278a515 fordert PLA-Struktur-/Synthesemodell und gegebene Eigenschaftsdaten; c21a611c bewertet gegebene Rohstoffbilanzen. Keiner der vollständigen Aufträge verlangt eigene experimentelle Untersuchung eines Kunststoffs aus nachwachsenden Rohstoffen.',
98:'a0e8f0f2 fordert eigene überprüfbare Recherche, 8b98d8ba enthält den tatsächlichen frischen Kunststoff-Herstellerclaim und Quellen-/Argumentprüfung, 38e30bb9 eigene Präsentation. Nur diese konkret instanziierte Kunststoffrecherche samt Zusammenfassung und Präsentation trägt die Union.',
99:'2652caef vergleicht reale vorgegebene Struktur-/Eigenschaftsprofile und technische Nutzungen; c21a611c/2cf86c25 ergänzen begründete Nachhaltigkeits-/Gesellschaftsurteile mit Kriterien und Datenlücken.',
100:'c21a611c unterscheidet fossile und biobasierte Rohstoffe auf gleicher Nutzungsbasis; a0e8f0f2/8b98d8ba verlangen quellenbelegte Vor-/Nachteile und begrenzte Alternativen. Alltag/Technik werden nicht allein aus dem Wort bio bewertet.',
101:'1c1420c2 verlangt Protonendonator/-akzeptor und korrespondierende Paare an konkreten Reaktionen. Das trägt die Brønsted-Erklärung, nicht nur eine Säureliste.',
102:'fd309753 beschreibt das relative Überwiegen beider Ionenarten; c224281a und 07879ea2 verknüpfen pH/pOH/Kw einschließlich Temperatur- und Verdünnungsgrenzen quantitativ.',
103:'d2ccd1d5 verlangt eigene Indikatorbeobachtung mit tatsächlicher Produktskala und grobem pH-Bereich; e0944fbb ergänzt reale kalibrierte pH-Messung. Das gedruckte oder verlangt keine kumulierte zusätzliche Gerätemethode.',
104:'1c1420c2 beschreibt Protonenübergabe und Donator/Akzeptor; 88ee181f formuliert die Neutralisations- und Antazidumgleichungen mit Teilchen-/Mengenbilanz.',
105:'0bf26276 bewertet pH-Wirkung systemabhängig, e5d6de7e ordnet saure Alltagslösungen und Umgang zu; das aktuelle ebaae4f5-P5 ergänzt den eigenen begründeten fiktiven Haushalts-Risikofall. Gefahr und Exposition bleiben getrennt; keine echte Produktfreigabe.',
106:'04fa0ba1 erklärt gekoppelte Elektronenabgabe/-aufnahme und Mittelrollen; 22133f29 trägt die passenden Teil-/Gesamtgleichungen. Kein Sauerstoffheuristik-Ersatz.',
107:'16da6a4d leitet eine verkürzte Redoxreihe aus Beobachtungen ab; 8be14f15 erklärt relative Reduktionspotenziale und die freiwillige Richtung unter benannten Bedingungen.',
108:'f0939f88 erklärt getrennte Ladungswege; efa24b77 Entladen/Laden; c8844ac6 Primärzellen, 6b82f80e und 27e4fe9b Sekundärzellen. Das Grundprinzip von Batterie und Akku ist vollständig im Verb beschreiben enthalten.',
109:'16da6a4d verlangt Interpretation kontrollierter Metallabscheidungen und Zellmessungen samt Begrenzung. Beschreiben/auswerten benötigt hier keine neu ergänzte eigene Durchführung.',
110:'22133f29 und 4961130b entwickeln und prüfen Teil-/Gesamtgleichungen mit Elektronen-, Atom- und Ladungsbilanz. Oxidationszahlen werden nicht mit wirklichen Ionenladungen verwechselt.',
111:'f0939f88 verlangt vollständige verbale Reaktions-/Ladungswegerklärung; beide ganzen Fälle geben den Aufbau bereits vor und fordern keine eigene schematische Darstellung des galvanischen Elements. Dieser ausdrückliche Darstellungsanteil bleibt offen.',
112:'6b82f80e erklärt Li-Ionen-Speicherung; 16b24dc5 recherchiert und bewertet Sekundärzellen; 1873eb42 bewertet Elektromobilität mit Energie-/Kosten-/CO2-Grenzen. Speicherung wird nicht als Primärenergiequelle behandelt.',
113:'81373fb7 fordert reversible Hin-/Rückreaktionen und dynamischen Restbestand; 7a05a1ce ergänzt die Reaktionskonzepte. Der unvollständige Umsatz wird kausal mit Reversibilität verbunden.',
114:'81373fb7 erklärt konstante makroskopische Größen bei weiterlaufendem Teilchenaustausch; keine Behauptung stillstehender Reaktion oder notwendig gleicher Konzentrationen.',
115:'5a24dae0 erklärt Änderungen von Q und Einstellungsrichtung unter verschiedenen Bedingungen, getrennt von einer Änderung von K durch Temperatur.',
116:'20f92ba0 verlangt MWG und Gas-/Lösungskontexte; 545a2e56 rechnet Stoffbilanz, zulässige Wurzel und neue Gleichgewichtszusammensetzung. Rein qualitative Le-Chatelier-Argumente reichen nicht.',
117:'c0463225 erklärt Reaktionsbilanz, Druck/Temperatur/Kinetik/Recycling; 882630ba bindet technische, ökonomische und ökologische Bedeutung samt Quellenkritik. Der allgemeine HB-Inhalt wird nicht wegen des im Titel historischen LK-Hinweises auf LK umgedeutet.',
118:'8721d943 erklärt materialgerechte Kreisläufe und Verluste, ebfa2c18 Masseneffizienz, 545a2e56 technische Prozessoptimierung. Ausgewählte Nachhaltigkeitsprinzipien werden beschrieben; Beispiele werden nicht in eine starre Liste zusätzlicher Versuche umgewandelt.',
119:'ac1bcf34 berechnet stöchiometrische KL-Bezüge, Löslichkeiten und Gleichionwirkung und erklärt das dynamische Gleichgewicht. Der Quelleneintrag bleibt LK.',
120:'d2d735de fordert reale kontrollierte Konzentrationsvariation am homogenen Gleichgewicht samt Referenz/Blindwerten; 42391b16 trägt eigenes Planen und Ausführen. Ein synthetisches Kontrollblatt ersetzt die Durchführung nicht.',
121:'503dedcb verlangt prüfbare theoriebezogene Hypothesen und Diskussion; 81373fb7 stellt den konkreten unvollständigen reversiblen Umsatz mit Daten/Modellgrenzen bereit. Die Bindung verlangt eine entsprechende Umsatzhypothese, keine allgemeine Forschungsfrage.',
122:'882630ba enthält Ammoniak/Düngemittel und technische, ökonomische sowie ökologische Folgen; 9f892457 und 1df17884 ergänzen gesellschaftliche Perspektive, Kriterien und Zielkonflikte. Das Urteil muss alle genannten Perspektiven sichtbar verbinden.',
123:'1c1420c2 und d8bdf486 erklären korrespondierende Paare und reversible Gegenwechsel; d8 trennt hypothetischen Beobachtungsbericht und reale Untersuchung. Erklären verlangt hier keine eigene Akquisition.',
124:'48115ff7-g1 stellt Säure- und Basen-MWG mit Wasser-Konvention auf und deutet Ka/Kb/pK. Damit liegt die Anwendung auf Protolysegleichgewichte vor.',
125:'48115ff7-g2 verlangt Teilchenverteilung bei gleichem Gehalt für Säuren und Basen; 597ac03c strukturelle Eignung, ca216bc6/4b9810b0 Stabilisierung/Elektronenpaarverfügbarkeit. Bloße pK-Rangfolge genügt nicht.',
126:'c224281a verbindet vollständige Dissoziation, Formelstöchiometrie und pH/pOH; Wassergrenze und Temperatur bleiben ausdrücklich erhalten.',
127:'02634fdd fordert reale Titration und stöchiometrische Gehaltsbestimmung; e0944fbb liefert eigene pH-Kurve und begründeten Äquivalenzbereich. Die Union trägt pH-titrimetrische Mengen-/Konzentrationsbestimmung ohne zusätzliche Messmethode.',
128:'28c90c6a interpretiert bereitgestellte Kurven, Stärkehinweise, Äquivalenz-/Halbäquivalenz-/Pufferbereiche und begrenzt Stoffidentifikation. Kein praktisches Verb wird hinzugefügt.',
129:'a449e874 leitet die Aktivitätsbeziehung her, bilanziert Zugaben vor HH und prüft Reserve, Verdünnung, Erschöpfung und Stoffaustausch. LK-Geltung bleibt erhalten.',
130:'acdfc7d7 und edcfc5f0 leiten unvollständige Säure-/Basenprotolyse aus MWG und Stoffbilanz ab, berechnen pH und prüfen Näherungen/Wasserbeitrag. Das ist der zusätzliche LK-Teil.',
131:'28c90c6a und dc0470f1 deuten mehrprotonige Kurven, Spezies, Äquivalente und Stufenüberlappung. Eine sichtbare Stufenzahl allein wird nicht zur eindeutigen Identität erklärt.',
132:'7c0b944d-e1/e3 interpretiert Leitfähigkeitsverlauf, beteiligte Ionen, Äquivalenz und Matrixgrenze. Der vorliegende Fällungstitrationskontext trägt das wörtliche Interpretieren konduktometrischer Kurven; keine ungedruckte zusätzliche Neutralisationsversuchsquote wird erfunden.',
133:'363c5740 erklärt Cu(II)-Tartrat-Koordination in Fehling-Lösung; 48115ff7 allgemeine Protolyse/Stärke. Es fehlt die kausale saure Reaktion eines hydratisierten Metallkations über Bindung/Polarisierung des koordinierten Wassers und Protonenabgabe. Beide isolierten Konzepte ersetzen diesen Zusammenhang nicht.',
134:'f79f15c0/02634fdd/e0944fbb tragen eigene Planung/Durchführung und quantitative Säure-Base-Auswertung. 9e3fae29 fordert echte digitale Dateien, jedoch für Photometrie und synthetische Kinetik. Eine verbindliche digitale Auswertung gerade einer Titrationskurve ist im gelesenen aktuellen P nicht nachgewiesen; Zeichnen erlaubt auch analog. Der bezeichnete volle PRACTICAL-PH-CURVES-P1-Materialalias konnte über den Main-Manifestnamen nicht eindeutig aufgelöst werden. Daher begrenzter Binding-HOLD, keine Behauptung, jedes historische Vollmaterial enthalte diese Leistung nicht.',
135:'0bf26276 liefert alltagsbezogene Säure-/Basenrelevanz; ac8b6c0f verlangt tatsächliche analoge und digitale Recherche mit Quellenbelegen, 38e30bb9 persönliche Präsentation. Die Union gilt nur als gemeinsamer Säure-/Basenauftrag mit beiden Rechercheformaten und Präsentation.',
136:'882630ba enthält den anthropogenen Carbonat-/Ozeankontext; 5a58126e erklärt die gekoppelte offene CO2/Carbonat-Gleichgewichtsfolge, 0503c975 den Zusatzfluss und 8b98d8ba begründete Maßnahmen. Ökologische Beurteilung und Handlungsoptionen bleiben erforderlich.',
137:'56bc6377 definiert Rate und wertet Konzentrations-Zeit-Daten quantitativ aus. Der Quellenoperator berechnen fügt keinen eigenen realen Messversuch hinzu.',
138:'3ce81f96 liefert Stoß-/Teilchenerklärung der Bedingungen, 536030f8 kontrollierte Bedingungsvariation, 56115f9d quantitative Temperaturreihe, 13838147 Konzentrations-/Geschwindigkeitsgesetz. Qualitative und quantitative Beiträge sind vorhanden; daraus entsteht keine ungedruckte Versuchszahl pro Faktor.',
139:'945d69d5 erklärt Aktivierungsbarriere/anderen Weg; d9cce642 unterscheidet Einstellung und Endgleichgewicht, 00c647e8 technische Katalyse. Geschwindigkeit und Bedeutung werden erklärt.',
140:'Der vollständige digitale Kinetikfall von 9e3fae29 verlangt eigene ln(c/c0)-Regression, Residuen und eine begründete Aussage zur ersten Ordnung; 13838147 ergänzt Ordnungen/Mechanismengrenzen. Damit wird Ordnung aus c(t) ermittelt, nicht aus bloßer Bildform geraten.',
141:'a4bac92b und cdd4ee76 verlangen SN1/SN2 mit Zwischenstufe/Übergangszustand, Kinetik, Substrat und Lösungsmittel. LK bleibt erhalten.',
142:'56115f9d verlangt eigene Temperatur-/Gasvolumen-Zeit-Rohdaten; 9e3fae29 eine tatsächlich eigene digitale Auswertung ausdrücklich synthetischer c(t)-Daten. Die Union bindet keine digitale Aufnahme eines experimentellen Konzentrations-Zeit-Verlaufs. Es fehlt der c(t)-Daten-/Aufnahmezusammenhang, nicht zwingend eine zusätzliche eigene physische Messung oder ein besonderer Sensor/Automatikmodus.',
143:'56bc6377 wertet zeitliche Verläufe aus; 536030f8/56115f9d vergleichen kontrollierte Bedingungen und dokumentieren echte Rohverläufe; 3ce81f96 liefert die Teilchendeutung. Ergebnisdarstellung und bedingungsbezogene Interpretation werden verbunden.',
144:'00c647e8 verlangt funktionsgleichen technischen Ökovergleich mit Energie, Stoffumsetzung, Lebensdauer, Giftigkeit und Rohstoffen; d9cce642 erhält die Kinetik-/Gleichgewichtsgrenze. Nachhaltigkeitsurteil statt bloß geringerer Barriere.',
145:'1051c091 trägt Bildung durch Photosynthese, 684ffe86 Klassen/Eigenschaften, 127e2fc9 Alltag/Ernährung. Die Bedeutung von Kohlenhydraten als Rohstoffe industrieller Produkte ist dadurch nicht konkret verlangt; Ernährungs-/Portionsbewertung ersetzt sie nicht.',
146:'684ffe86 unterscheidet Mono-/Di-/Polysaccharide über Bausteine/Verknüpfung und Eigenschaften; 68292f39 Reduktionsverhalten, 7b477c2b Glykosidbindung/Hydrolyse. Die Klassen werden erklärt und verglichen.',
147:'Exakte Wiederverwendung des eigenen eingefrorenen informed-A-Urteils: f4d5a02d fordert die kausale Gerätefunktion über festen Polarisator, optisch aktive Probe, Analysator/Detektion, Blank und Winkelvergleich; erforderliche IDs polarimeter-components-and-angle und carbohydrate-concentration-inversion. Topic 2.1 bleibt amtliches Wahlthema, keine universelle GK-Pflicht.',
148:'dfaef897 bestimmt D/L aus der tatsächlich gegebenen Kohlenhydratstruktur, Ringschluss/Anomerie; b92bfa45 und 9decc36b ergänzen Zentren und Stereoarten. Ausgewählte Stereochemie ist konkret auf Zucker angewendet.',
149:'Exakte Wiederverwendung des eigenen informed-A-Urteils: f4d5a02d verlangt inverse Kohlenhydrat-c aus Drehwinkel mit Blank, dm, konsistentem spezifischem Drehwinkel, Vorzeichen und Referenzbedingungen samt neuem Fructose-/Mischungsfall. Diese Zusatzpflicht bleibt LK innerhalb des Wahlthemas 2.1; keine Lernendenwahl wird behauptet.',
150:'85342c52 unterscheidet Konformation an Butan/Butanolen; dfaef897 verlangt Fischer/Haworth und Ringschluss. Keiner der vollen Aufträge stellt ein Kohlenhydrat in Konformationsschreibweise dar. Der Wortanteil Konformation genügt nicht.',
151:'68292f39 erklärt alkalische Ketose-Umlagerung; 1d2e7b80 fordert in der tatsächlich tautomerieverlangenden Kursroute Fructose über Enediol/Aldoseform. HB-LK ist genau eine solche Route; die HE-Beispielnennung beschränkt die konditionale Pflicht nicht auf HE.',
152:'1d2e7b80 verlangt reale kontrollierte reduzierende Kohlenhydratprobe und Strukturdeutung, eigene Rohdaten getrennt von Erwartungen. Optionale Beispielverfahren der Quelle werden nicht alle kumulativ verlangt.',
153:'dfaef897 fordert Fischer/Haworth-Zucker, 92c99237 allgemeine Formelüberführung, 707998c1 eigene digitale Aliphatenmodelle. Die verbindliche Kohlenhydrat-Überführung Fischer↔Keilstrich mithilfe Molekülbaukasten UND digitaler 3D-Darstellung ist damit nicht konkret gebunden. Keine Pflicht zum eigenen Programmieren wird hinzugefügt.',
154:'dfaef897 verlangt explizit α-/β-D-Glucose-Ringschluss aus Fischer, Elektronenpaarangriff und eigene korrekte Haworthlage. Keine Wasserabspaltung beim Halbacetalringschluss.',
155:'127e2fc9 bewertet Zuckerportionen, Struktur/Funktion und Ernährung; 9f892457 allgemeine historische/aktuelle Nachhaltigkeitsurteile. Es fehlt die konkret industrielle Zuckergewinnung und ihre ökologische, ökonomische und soziale Folgenabwägung. Allgemeine Nachhaltigkeit ist kein Themenersatz.',
156:'Die Fischer-/Haworth-Darstellung von dfaef897 und allgemeine Rotationsunterscheidung von 85342c52 enthalten keine eigene Konformationsschreibweise der Glucoseringe. Das explizite zusätzliche LK-Darstellen bleibt offen.',
157:'b47d542d/e9d34f34 erklären proteinogene AA über Restgruppen, Protonierung und Eigenschaften; 197bc2c5/065d764c/058dca74 Peptid-/Proteinstruktur und Eigenschaften. Keine allgemeine Unlöslichkeit aus unpolarem Rest.',
158:'d8eeed29 verlangt räumliche AA→Fischer-Überführung, D/L, Chiralität und Enantiomerie mit Projektionskonventionen. R/S oder Drehvorzeichen werden nicht aus D/L abgeleitet.',
159:'d1244f5d erklärt Elektrophorese über Nettoladung/pH/pI und Migration; e9d34f34 liefert Protonierung, 5fdc4fb2 stationäre/mobile Wechselwirkung der DC. Beide Verfahren werden begründet erläutert, eigene Ausführung hier nicht zusätzlich gefordert.',
160:'5fdc4fb2 verlangt dimensionsloses Rf aus Start-/Frontstrecken desselben Laufs und bedingungsgleichen Referenzvergleich samt Identitätsgrenze.',
161:'d8eeed29 fordert AA-D/L ausdrücklich ohne zusätzliche CIP-Pflicht; b92bfa45 Zentren ohne R/S; 85342c52 enthält R/S am Butan-2-ol mit vorgegebenen Prioritäten. Die Zuordnung konkreter AA-Chiralitätszentren nach CIP ist nicht verpflichtender AA-Transfer. D/L-Kredit wird nicht automatisch als R/S übertragen.',
162:'5c8f0bbb und cf270aaf verlangen wirkliche beaufsichtigte Ninhydrin-/Biuret-Nachweise, Rohprotokoll, Kontrollen und Selektivitäts-/Beobachtungsdeutung. Synthetische Tabellen geben keinen Durchführungskredit.',
163:'058dca74 verlangt ausdrücklich Erklärung/Ableitung aus vorgegebenen Denaturierungsbefunden, keine universelle reale Laborausführung; 065d764c erklärt Faltung/Kontakte. Der eigene experimentelle Auftrag unter den genannten Einflüssen und deren Organismenbewertung ist nicht gebunden. Die fehlende Pflicht ist der gedruckte Prozesszusammenhang, keine neue frei erfundene Versuchsquote.',
164:'197bc2c5 formuliert Kondensation mit Strukturverknüpfung, Peptidbindung, Wasserbilanz und Termini. Eine spontane wässrige Peptidsynthese wird nicht behauptet.',
165:'197bc2c5 beschreibt Primärstruktur und planare lokale Peptidgruppe; 065d764c ordnet räumliche Sekundär-/Tertiär-/Quartärkontakte passenden Ebenen zu. Die Ebenen werden nicht aus bloßen Namenslisten bewertet.',
166:'2f3cdec5 fordert Glyceringerüst, genau drei Estergruppen und Fettsäurereste sowie Gemischgrenze. Ein Triacylglycerid wird nicht als Polyesterkettenmotiv behandelt.',
167:'0959eef2 behandelt Pflanzenölstruktur/-nutzung und Herkunft, 5a709938 allgemeine Extraktion anhand Löslichkeit sowie eigene Sandfiltration. Es fehlt die konkrete Beschreibung von Methoden der Fettgewinnung; Pflanzenöl-Nutzung und beliebige Stofftrennung liefern den Verfahrensteil nicht automatisch.',
168:'2f3cdec5 erklärt Konsistenz über Packung/cis-trans/Sättigung und Wasser-/unpolare-Lösemittelkontakte. Fette werden als hydrophob/lipophil mit Bedingungen erklärt.',
169:'2f3cdec5 beschreibt Struktur/Eigenschaften, 7371c82e nutzt konkrete Oxidations-/Nutzungsdaten. Es fehlen die Fach-Kennzahlen (insbesondere Iod-/Verseifungszahl) und ihr expliziter Zusammenhang mit Fettstruktur.',
170:'2f3cdec5 erklärt vorhandene cis/trans-/Sättigungsunterschiede; 3fb7dea4 behandelt ionische HBr-Addition an Alkene. Fetthärtung durch H2-Hydrierung wird nicht dargestellt; sie darf nicht als derselbe elektrophile HBr-Mechanismus gutgeschrieben werden.',
171:'Der ganze aktuelle 2f3cdec5-Vertrag erklärt gegebene Fett-/Lösemittelmodelle und Konsistenz. Eine eigene experimentelle Löslichkeitsuntersuchung von Fetten/Ölen samt Auswertung ist nicht verlangt.',
172:'7371c82e bewertet gegebene Zusammensetzungs-/Oxidations- und Gebrauchsdaten, benutzt aber keine Iod-/Verseifungs- oder andere fachlich ausgewiesene Fettkennzahl für Zusammensetzung/Haltbarkeit. Solche Schlussfolgerungen aus Kennzahlen bleiben offen.',
173:'70b34ae7 und 98ae3f8e fordern eigene Ester-Strukturverknüpfung und ausgeglichene Kondensationsgleichungen; Mechanismus- und Stoffbilanz werden unterschieden.',
174:'7371c82e ergänzt die Ernährung als Energielieferant und materialgestützte Speise-/Seifenwahl; 2f3cdec5 grenzt sich ausdrücklich von Ernährungsbewertung ab. Die unterschiedliche Bedeutung gesättigter und ungesättigter Fettsäuren als Nahrungsbestandteile wird nicht konkret bewertet. Keine klinische Gesundheitsrangfolge oder Omega-3-Detailpflicht wird zusätzlich verlangt.',
175:'4928d5d1 trennt U/H und Systemgrenzen, 3e433dae Bindungs-/Reaktionsenergie, 4a08f31f Zustands-/Hess- und Kalorimetriebezüge. Gesetzmäßigkeiten von Enthalpieänderungen werden kausal erklärt.',
176:'4663fd80 berechnet Produkte minus Edukte mit stöchiometrischer Gewichtung, Standard-Referenzzustand, Phasen und Vorzeichendeutung. Geschwindigkeit folgt nicht allein aus ΔH.',
177:'801790f9 verlangt offene/geschlossene/isolierte Grenzen, qualitative Arbeit/Wärme und Energieerhaltung; 4928d5d1 ergänzt U/H. Der erste Hauptsatz wird mit Konsequenzen dargestellt.',
178:'4a08f31f verlangt Umkehr/Addieren des konkreten Hess-Zyklus, gleiche Zustände, molare/nichtmolare Basis und Begründung durch Energieerhaltung.',
179:'dc5173e8 erklärt zyklische Wärme-Arbeit-Grenze und Gesamtentropie statt Energievernichtung; 5169bb6b lokale und Gesamtentropie. Der zweite Hauptsatz bleibt LK.',
180:'5169bb6b verbindet System/Umgebung und ΔG=ΔH−TΔS; dcbad4e4 berechnet Einheiten, Grenztemperatur, aktuelle Zusammensetzung und Standard-/Aktualgrenzen. Kein Spontanitäts-/Geschwindigkeitsersatz.',
181:'4a08f31f fordert tatsächlich geplante und ausgeführte freigegebene einfache Kalorimetrie mit eigenen Rohdaten und Auswertung. Modellwerte ersetzen die Untersuchung nicht.',
182:'Der vollständig gelesene Fall salt-calorimetry-execution von 4a08f31f nennt Digitaltemperatursensor und eigene T(t)-Werte/Protokoll/Auswertung. Das trägt digitales Messen; automatische Aufnahme oder spezielle Synchronisation ist keine zusätzliche Quellenpflicht.',
183:'801790f9 fordert Konsequenzen der Energieerhaltung auch bei geänderter Gesamtgrenze; dc5173e8 trennt Erhaltung von begrenzter Nutzbarkeit. Energieverlust wird nicht als Vernichtung gedeutet.',
184:'0cf2ffe1-e1/e2/e3 vergleicht Umwandlungspfade bei gleicher Nutzfunktion und verlangt ökologische, ökonomische und soziale Perspektiven mit offengelegten Grenzen.',
185:'f0939f88 und fd7977bf erklären verbale Mechanismen und vorgegebene Schemata beider Zellarten. Die vollen Fälle verlangen keine selbst erzeugte schematische Darstellung beider Zellaufbauten/-funktionen. Dieser ausdrückliche Quellenteil ist ungebunden; keine eigene Elektrolyseausführung wird erfunden.',
186:'8be14f15/b781745a erklären relative Potenzialmessung und Referenz; 7b39fa19 verlangt echten Zellaufbau, hochohmige Messung, Polung und Rohprotokoll. Beschreiben und Anwenden werden verbunden, keine absolute Einzelpotenzialmessung behauptet.',
187:'8be14f15 verlangt Standard-Zellspannung als Differenz korrekt orientierter Reduktionspotenziale, konsistente Referenz und Skalierungsgrenze.',
188:'c8844ac6/27e4fe9b/6b82f80e erklären Alkali-Mangan-, Blei- und Li-Ionen-Prozesse anhand bereitgestellter Modelle; 16b24dc5 ergänzt Recherche/Energetik. Der ausdrücklich eigene schematische Darstellungsanteil für Aufbau UND Reaktionen der genannten Zellen ist nicht verbindlich verlangt. Für eine unbenannte Li-Ionen-Chemie wird keine frei erfundene genaue Summengleichung gefordert.',
189:'0908b3a2 und 9f0d6d4c erklären Korrosion/Lokalelement und Ladungswege; 94a62b39 Barriere/Schutzfilm/Opferanode und Defektgrenzen. Schutz wird kausal erklärt.',
190:'b7521ac7 erklärt Nernst, Aktivität/Quotient, Konzentrationszelle und Nichtstandardspannung mit Grenzen. Effektive LK-Geltung bleibt erhalten.',
191:'2fdd759f-operation verlangt tatsächliche freigegebene Redoxtitration mit Rohprotokoll; redox/quantification begründen Teilgleichungen, Bedingungen und Gehalt. Kein Ausführungskredit aus Rechnung.',
192:'b8c8f70f verknüpft Q=It, Elektronenstoffmenge, z und Stoffumsatz sowie inverse Größe/Stromausbeute mit Einheiten. Gedruckte Faraday-Pflicht ist quantitativ vorhanden.',
193:'3eada74b erklärt Überspannung und Entladungsreihenfolge in zwei Elektrolyse-Papierfällen. Keiner der ganzen Fälle/Erwartungen erklärt Überspannung beim Akkumulator; dieser zweite ausdrücklich genannte Anwendungszusammenhang bleibt offen.',
194:'7b39fa19 verlangt echte kontrollierte Leerlaufmessung an passenden Halbzellen; 8be14f15 ordnet daraus relative Potenziale/Richtungen ein. Damit lässt sich eine begrenzte experimentelle Spannungsreihen-Untersuchung binden. Keine universelle Anzahl Metallpaare oder volle Standardreihe wird hinzugefügt.',
195:'16b24dc5 bewertet recherchierte Sekundärzellen nach Funktion/Energiegrenze; ceda84ff erklärt Speicherung und Bereitstellung statt Primärenergieerzeugung. Diskussion wird fachlich begründet.',
196:'f54b2c33 bewertet Rohstoffgewinnung; c8844ac6/16b24dc5 Nutzung/Bedarf und Quellen; f9e6d689 kontrollierte Entsorgung/Rückgewinnung und Umweltfolgen. Herstellungs-/Nutzungsaufwand und Umweltaspekte sind verschiedene Beiträge der Union.',
197:'1051c091 erklärt Lichtreaktion/Wasseroxidation/CO2-Reduktion und Speicherung; a76ab487 die Glucose-/Biomassekette, a0e8f0f2 die nachwachsende Rohstoffrolle. Es geht um grundlegende Funktion und Bedeutung, nicht eine zusätzliche Enzymzyklusquote.',
198:'c0f1bf09 verfolgt Kohlenstoffkreisläufe, 0503c975 den fossilen Zusatzfluss und bedingte Bestandsänderung. Kreislauf bedeutet keinen automatischen Ausgleich.',
199:'0503c975 erklärt fossilen CO2-Zufluss und Bilanz, 4dab7d52 direkte CO2-/Wärmevergleichsgrenzen. Die Strahlungs-/Energieflussfunktion des natürlichen Treibhauseffekts wird in diesen Verträgen nicht erklärt. Emissionsbilanz ist kein vollständiger Treibhauseffekt.',
200:'a76ab487 erklärt stärke-/saftbasierte Bioethanolwege, 0959eef2 direkte Pflanzenölnutzung, 4d9defde Biodiesel-Umesterung. Unterschiede und ausgewählte Herstellungswege sind erläutert; BTL ist der separate LK-Eintrag 201.',
201:'Die vorgeschlagene Union ist leer. Kein aktueller konkreter Vertrag zur BTL-Herstellung mittels Fischer-Tropsch-Verfahren ist in dieser Klausel gebunden. Die LK-Pflicht bleibt sichtbar offen.',
202:'8b98d8ba verlangt allgemeine quellenbelegte Verkehrs-/Rohstoffmaßnahmen, 9f892457 allgemeine gesellschaftliche Nachhaltigkeitsbewertung. Keiner der gelesenen Aufträge bezieht die eigene Lebensweise der lernenden Person ausdrücklich auf globale Probleme. Eine allgemeine Verkehrsempfehlung ist kein Nachweis dieses persönlichen Zusammenhangs.',
203:'0503c975 deckt fossilen Kohlenstoffzufluss, 8b98d8ba Maßnahmen und 9f892457 allgemeine gesellschaftliche Nachhaltigkeit. Konkrete Auswirkungen des Klimawandels und deren Darstellung/Kommunikation sind dadurch nicht verbindlich belegt.',
204:'9198b4cf vergleicht zwei konkrete Brennstoffangebote auf gleicher Wärmenutzungsbasis mit Bereitstellung/Transport/CO2 und begründeter ökonomischer Datenlücke; 0959eef2/4d9defde/a76ab487 konkretisieren Biofuelpfade und Nutzung. Ökologische und ökonomische Urteile können bedingt sein; fehlende reale Kosten dürfen als Grenze benannt werden. Kein Rechenzwang zu einem ungedruckten Break-even.',
205:'a0e8f0f2/8b98d8ba verlangen tatsächlich recherchierte Rohstoff-/Klimafolgenbelege mit Interessenprüfung; ac8b6c0f explizit analoge UND digitale Recherche/Quellenkritik. Nur der entsprechend thematisch instanziierte Informationsvergleich trägt die Union.',
206:'3e9eb5d0 fordert begründete Zuordnung aus Ketten-/Netzstruktur und thermischen/mechanischen Eigenschaften; Modell- und Anwendungslimits sind enthalten.',
207:'6eb14e47, 03e12e4f und 9b942490 fordern konkrete Polymerisations-, Polyadditions- und Polykondensationsverknüpfung samt Struktur/Bilanz. Die drei Mechanismustypen werden nicht als austauschbar behandelt.',
208:'8721d943 und 459724db erklären werkstoffliche, rohstoffliche und hydrolytische Wege, Qualität und Bilanz. Energetische Kunststoffverwertung (chemische Umsetzung zu Nutzenergie statt stofflicher Rückgewinnung) ist kein verbindlicher Erklärgegenstand dieser ganzen Fälle.',
209:'6eb14e47 fordert radikalischen Start/Wachstum/Abbruch, 98ae3f8e Ester-Addition/Eliminierung mit Protonenübertragungen und Valenzen. Die formulierten Mechanismen sind konkrete LK-Leistungen.',
210:'6413429b erklärt nanoskalige Silikon-Oberflächen und dfbccd62 Größen-/Benetzungs-/Freisetzungseffekte. Nanopartikelverstärkung eines Kunststoffs und die daraus resultierende Eigenschaftsänderung werden in den ganzen aktuellen Aufträgen nicht beschrieben. Ein Nanofilter/Oberflächenbeispiel wird nicht automatisch zum Polymerkomposit.',
211:'3e9eb5d0 vergleicht Struktur/Klassifizierung/Anwendung, 2652caef konkrete PE/PA-/Netz-Profile und Bedingungen. Ausgewählte Kriterien sind vorhanden, keine universelle vollständige Materialmatrix nötig.',
212:'8721d943/459724db verlangen begründete Vor-/Nachteile mehrerer stofflicher Recyclingwege bei gleicher Nutzfunktion, Qualität und Energie/Kosten. Der Wortlaut verschiedene erfordert hier keine zusätzliche ungedruckte Recyclingmethodenquote; energetische Verwertung bleibt separat in 208 offen.',
213:'2652caef bewertet Monomer-/Ketten-/Vernetzungsprofile, nicht Additiventscheidungen. Es fehlt der begründete Einsatz von Weichmachern, Farb-/Füllstoffen, Flammschutzmitteln und Antistatika; ein offener Hinweis auf fehlendes Brandverhalten ersetzt keine solche Bewertung.',
214:'2cf86c25 verbindet technische Funktion, wirtschaftliche/ökologische/soziale Perspektiven und Betroffene; c21a611c/0278a515 konkretisieren Biokunststoffherkunft, Nutzung und Entsorgung. Nachhaltigkeit bleibt bedingte Abwägung.',
215:'54bc6ca0 unterscheidet Absorption/Emission und Restlicht; 87d8cc68 erklärt elektronische Anregung mit Energieabstand, c8f51eac Reflexion und Beleuchtung. Farbigkeit wird aus Strahlung–Materie-Wechselwirkung erklärt.',
216:'d72cbb62 verlangt Strukturklassifikation Azo plus weitere konkrete Klassen; 87d8cc68 verknüpft Delokalisierung und Absorption. Molekülstrukturen und Zuordnung werden begründet, nicht bloß Farbnamen memoriert.',
217:'981242bb/53db04a0 erklären synthetische Farbstoffherstellung, d72cbb62 Klassen/Herkunft/Verwendung, 63e0d92b Küpenfärbung. Ein konkreter natürlicher Farbstoff mit Vorkommen und Isolierung ist damit nicht erläutert. Faserfärbung ist keine Isolierung aus Naturmaterial.',
218:'1051c091-e1/e3 und der bereits selbst vollständig gelesene energy20-07-b erklären Lichtreaktion, Wasseroxidation, gekoppelte Träger und Verbindung zur CO2-Reduktion. Grundzüge sind enthalten; Nettoformel allein wäre nicht genug.',
219:'f0ba30a8 fordert Absorptionsmaxima/Banden, Stärke und bedingungsgleichen Spektrenvergleich. Interpretieren enthält hier keine zusätzlich erfundene eigene Spektrometerbedienung.',
220:'1051c091 trennt Lichtreaktion und CO2-Reduktion; 7dc80ee2 erklärt photokatalytischen/elektrochemischen Pfad und die ausdrücklich partielle Photosyntheseanalogie. Nachahmung wird mit ihrer Grenze beschrieben.',
221:'61da9d34 verlangt echte Quellenrecherche sowie Nutzen-/Gesundheits-/Expositionsvergleich natürlicher und synthetischer Farbmittel bei gleicher Anwendung. Unvollständige Dossiers begründen ein begrenztes Urteil, keine Herkunftsgarantie.',
222:'7dc80ee2 bewertet solare Wasserstoffpfade mit Katalysator/Ressourcen/Energiegrenze; 1051c091 natürliche Photosynthese, a0e8f0f2 Rohstoff-/Flächen-/gesellschaftliche Nachhaltigkeitsgrenzen. Die Union verbindet natürliche und künstliche Potenziale statt einen Teilweg als vollständige Pflanzenphotosynthese auszugeben.',
223:'b8d3b453 vergleicht Alkenaddition und aromatische Substitution über Erhalt/Wiederherstellung der Delokalisierung; 4bdbdf32 erklärt Aromatenstabilität. Effektiv nur LK-Thema 4.3.',
224:'4bdbdf32/b44f460b fordern gleichwertige Bindungen, zulässige Grenzstrukturen und ein delokalisiertes Molekül. Die beiden Formeln sind keine wechselnden Spezies; 4.3 bleibt LK.',
225:'b98f89e2 verlangt Halogenierung/Nitrierung samt Elektrophilbildung, Bedingungen und Ring-/Seitenkettengrenze. Die Quelle fordert hier Beschreiben/Nennen, keine reale Benzolreaktion.',
226:'40f2db27 verlangt Wirkstoffrolle, Gemisch/Extrakt/Fraktion, selektive physikalische Isolierung und unveränderte Molekülidentität. Keine klinische Eignung aus Naturherkunft; effektive Geltung LK-Thema 4.3.',
227:'93a7ce4d verbindet Analyse, Synthese und Modelling an derselben Forschungsfrage mit Rückkopplung und Evidenzgrenzen; die Beiträge sind konkret statt bloßer Methodenetiketten. 4.3 bleibt LK.',
228:'f0f67a7a fordert planaren σ-Rahmen, sechs p-Orbitale/π-Elektronen und Modell-/Energiegrenze am Benzol. Orbitalmodell ist der zusätzliche LK-Abschnitt innerhalb des ohnehin LK-geltenden Themas.',
229:'4bdbdf32 und b44f460b verlangen gültige Grenzformeln, Bindungsgleichwertigkeit und Kritik einer wörtlichen Lewis-/Kekulé-Lesart. Diskutierte Modellgrenze statt nur Zeichnen; effektiv LK.',
230:'707998c1 fordert eigene digitale Eingabe/Rotation für Ethan und Propen, f0f67a7a/4bdbdf32 erklären Aromaten auf Modellebene. Eine tatsächlich eigene digitale Darstellung einer aromatischen Struktur ist dadurch nicht verbindlich gefordert. Allgemeines Modelling erhält keinen automatischen Aromatenkredit; keine bestimmte Software oder Eigenprogrammierung wird verlangt.',
231:'e96771d3 enthält den konkreten IARC-Benzol-Gefährdungsbeleg, industriellen Nutzen, Expositionswege und Alternativen sowie die Grenze einer Stoffklassenverallgemeinerung. Nutzen/Risiko wird erörtert, keine echte Betriebsfreigabe.',
232:'f71a2c0a recherchiert Arzneistruktur, Anwendung und historische RKI-Konsumdaten; 93a7ce4d/3eb2a06c erklären Forschungs-/Produktions-/Vermarktungsentscheidungen. Die gesellschaftlichen Auswirkungen der Entwicklung neuer Medikamente in historischen UND aktuellen Zusammenhängen werden damit nicht konkret bewertet. Historische Erhebungsbedingungen sind kein historischer Entwicklungsfolgenvergleich; bestimmte optionale Medikamentenbeispiele werden nicht vorgeschrieben.'
}
HOLDS={78,82,89,97,133,134,145,150,153,155,156,161,163,167,169,170,171,172,185,188,193,199,201,202,203,208,210,213,217,230,232}

# Final literal-source checks remove stronger-method readings before FIRST seal.
# p20 does not say schematisch (p31 does); p24 does not demand an experiment;
# the actual new fat-nutrition transfer already evaluates both fat categories.
NOTES[111]='f0939f88 stellt die konkrete galvanische Zelle durch Teil-/Gesamtreaktionen, Polung, Elektronen-/Brückenionenwege und einen geänderten Aufbau zusammenhängend dar und erklärt die Funktion. Die tatsächliche Quelle p20 sagt darstellen, nicht schematisch darstellen. Eine zusätzlich verlangte eigene Zeichnung wäre hier eine stärkere Methodenpräferenz; die ausdrückliche schematische Pflicht von p31 bleibt in 185 getrennt.'
NOTES[142]='9e3fae29 fordert eine wirklich eigene digitale Datei mit unveränderten ursprünglichen c(t)-Daten, eigener neuer Datenversion, Diagramm/Linearisierung, Regression und Residuen. Damit werden c(t)-Werte tatsächlich digital aufgenommen, dargestellt und ausgewertet; 56115f9d ergänzt bedingungskontrollierte Zeitverläufe. Die Originalquelle p24 verlangt bei dieser Klausel digitale Werkzeugnutzung, aber keinen ausdrücklich eigenen physischen Versuch. Die synthetischen Eingangsdaten werden deshalb nur als Aufgaben-/Modelldaten gewertet, niemals als beobachtete experimentelle Messung oder eigene physische Leistung. Keine Sensor-/Automatikpflicht wird hinzugefügt.'
NOTES[174]='Der vollständige aktuelle neue Fall fat-composition-structure-nutrition-energy-transfer von 7371c82e vergleicht ausdrücklich einen gesättigten und einen cis-ungesättigten lebensmitteltauglichen Triacylglyceridstoff, erklärt beider Ernährungsfunktion über Esterbausteine/Verdauung/Energiebereitstellung und bewertet die Nahrungsverwendung samt Flüssig-ist-energielos/gesünder-Fehlschluss. Zusammen mit 2f3cdec5-Struktur/Eigenschaften ist die wörtliche Bewertung beider Kategorien als Nahrungsbestandteile vorhanden. Klinische Rangfolge oder Omega-3-Detailpensum wird nicht erfunden; der Begriff essenzielle Fettsäuren bleibt separat in Termset16 offen.'
NOTES[134]='f79f15c0/02634fdd/e0944fbb tragen reale Planung/Durchführung und quantitative Säure-Base-Auswertung. Der über den aktuellen ganzen C-Körper bezeichnete Ursprung aufgelöste ganze Fall PRACTICAL-PH-CURVES-P1 (NINE.complete-additional-cases-and-practical-rubrics.author.json, SHA256 86069f0847c0c8f8658e7a9e80bd362fb722fb1ef24b1e587da2ef8e3e9128e2) fordert eigene pH-Messpaare, Zeichnen und ΔpH/ΔV, lässt aber analoge Auswertung zu. 9e3fae29 fordert tatsächliche digitale Dateien für Photometrie und synthetische Kinetik, keine verbindlich digitale Titrationskurve. Der digitale Auswertungsteil gerade der Titration ist daher als Quellenpflicht noch nicht nachgewiesen; ein pH-Meter allein erfüllt den digitalen Auswertungsoperator nicht. Kein weiterer eigener physischer Versuch oder bestimmter Sensor/Automatikmodus wird verlangt.'

assert set(NOTES)==set(range(71,233))

rows=[]
for r in J['sourceClauses']:
 n=r['ordinal']; witnesses=[]
 for x in r['proposedUnionCarrierIds']:
  pr=P[x]['profile'];witnesses.append({'goalId':x,'goalTitle':G[x]['title'],'goalFingerprint':P[x]['goalFingerprint'],'profileFingerprint':P[x]['profileFingerprint'],'wholeGoalBodySHA256':objsha(G[x]),'wholeProfileBodySHA256':objsha(pr),'requiredExpectationIds':pr['coverageExpectations']['requiredExpectationIds'],'caseIds':[c['id'] for c in pr['applicationCaseBriefs']]})
 rows.append({'ordinal':n,'sourceGoalId':r['originalSourceGoal']['id'],'sourceClauseIds':r['originalSourceClauseIds'],'sourceGoalBodySHA256':objsha(r['originalSourceGoal']),'sourceDuty':r['originalSourceGoal']['description'],'requiredOperators':r['originalRequiredOperators'],'originalCourseLevel':r['originalCourseLevel'],'sourceScope':r['originalSourceScope'],'effectiveCourseScope':'LK only: p37 topic 4.3' if r['originalSourceGoal']['topicCode'] in ['4.3','3.3-4-3-AROMATEN'] else r['originalCourseLevel'],'decision':'HOLD' if n in HOLDS else 'ACCEPT','coverage':'partial' if n in HOLDS and witnesses else 'unbound' if n in HOLDS else 'source duty covered by concrete union','rationaleDe':NOTES[n],'carrierWitnesses':witnesses,'originalExamplesPolicy':'Thin-frame examples remain optional; no added method, experiment, software or task quota.','independentJudgment':True,'historicalSelfReuse':n in [147,149]})

FIRST={'role':'Independent reviewer A FIRST for finite HB source-binding remainder; not a fresh P/D science approval','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'inputPin':{'path':str(INPUT),'sha256':sha(INPUT),'bytes':INPUT.stat().st_size},'selectorPin':{'path':str(INPUT.parent/'SELECTOR.HB-remaining162-term27.clean-input.sealed.json'),'sha256':sha(INPUT.parent/'SELECTOR.HB-remaining162-term27.clean-input.sealed.json')},'centralPins':J['centralInputs'],'sourceInventoryPin':J['sourceInventoryPin'],'originalPrimaryPin':J['originalPrimaryPin'],'sourceRules':J['originalScopeRules'],'counts':{'sourceClauses':len(rows),'ACCEPT':sum(r['decision']=='ACCEPT' for r in rows),'HOLD':sum(r['decision']=='HOLD' for r in rows)},'judgmentBoundary':'Concrete source operators, context and course scope only. Existing P/material science judgments remain valid inputs. Unchanged previous FIRSTs are not overwritten. No author classification or other reviewer remainder judgment was read.','readingBoundary':'All 207 whole-body pins independently verified. Actual binding reading: all goal descriptions and all German essential/observable expectation bodies with required/alternative coverage; prior own exact reads reused for 34 profiles, full operative German cases additionally read where context/operator questions required them. This is not a claim to have freshly reread every bilingual case/material of all 207 goals.','sourceClauses':rows,'normalActivation':False,'globalM7Claim':False,'HumanApproval':False,'HumanTrial':False,'learnerPerformanceObserved':False}

TERM_MISSING={
 (9,'koordinative Bindung bei hydratisierten Metallkationen'):'Kein zugeordneter hydratisierter Metallkation-Vertrag. Cu(II)-Tartrat-Koordination und allgemeine Protolyse erklären den Wasserliganden-/Metallkation-Zusammenhang nicht; vgl. Quellenklausel 133.',
 (12,'Zuckerstammbaum'):'Kein aktueller konkreter Pflichtpunkt für den Aufbau/Begriffsgebrauch des Zuckerstammbaums; einzelne Glucose-/Fructose-Projektionen sind keine solche Einordnung.',
 (12,'Mutarotation'):'α/β-Ringschluss und optische Drehung sind getrennt vorhanden; zeitabhängige Änderung der Drehung durch α/β-Gleichgewichtseinstellung ist kein verbindlicher Deutungsgegenstand.',
 (13,'Konformationsschreibweise'):'Allgemeine Einfachbindungsrotation und Fischer/Haworth ersetzen die konkrete Konformationsdarstellung von Kohlenhydraten nicht; 150/156 bleiben HOLD.',
 (14,'beta-Faltblatt'):'Die ganzen 065d764c-Fälle verwenden Helices und Kontakte zwischen gefalteten Untereinheiten; 197bc2c5 erklärt lokale Peptidplanarität, e9d34f34 AA-Protolyse. Ein β-Faltblatt mit seiner Rückgrat-Anordnung ist nicht konkret prüfbar gebunden.',
 (14,'Xanthoprotein-Reaktion'):'Ninhydrin/Biuret sind echte gebundene Verfahren, Xanthoprotein ist kein verbindlicher Begriffs-/Reaktionsgegenstand. Es fehlt Begriff/Reaktionsprinzip, nicht eine neue Pflicht, jedes optionale Nachweisexperiment auszuführen.',
 (16,'Fetthärtung'):'Keine gebundene Darstellung von H2-Hydrierung bei Fetten; HBr-Elektrophiladdition ist kein Ersatz.',
 (16,'Kennzahlen von Fetten'):'Konkrete Oxidations-/Gebrauchsdaten werden genutzt, fachlich ausgewiesene Fettkennzahlen und ihre Strukturbezüge fehlen.',
 (16,'Verseifungszahl'):'Die Hydrolyse wird erklärt, ein KOH-Massenbezug pro Fettmasse und dessen strukturbezogene Bedeutung nicht.',
 (16,'Iodzahl'):'Ungesättigtheit wird erklärt, die Iodaufnahme je Fettmasse als Kennzahl und ihre Interpretation nicht.',
 (16,'essenzielle Fettsäuren'):'Energielieferung durch Fett und Sättigungs-/Packungseffekte ersetzen die Bedeutung essenziell als notwendige, nicht ausreichend selbst synthetisierte Nahrungsfettsäure nicht.',
 (21,'Energiehaushalt der Erde'):'Die vorliegenden Verbrennungs-/CO2- und Kohlenstoffflussbilanzen behandeln keine irdische Strahlungs-/Energiebilanz.',
 (21,'Treibhauseffekt'):'Kein konkreter Vertrag erklärt kurz-/langwellige Strahlung und atmosphärische Energiewirkung; siehe 199.',
 (21,'anthropogener Treibhauseffekt'):'Fossiler CO2-Zusatzfluss ist gebunden, dessen zusätzliche Wirkung im Treibhauseffekt nicht. Emissionsanstieg allein erfüllt den Begriff nicht.',
 (21,'Treibstoffe der 1. und 2. Generation'):'Einzelne Bioethanol-/Biodiesel-/Pflanzenölwege sind erklärt, das Unterscheidungskriterium der ersten/zweiten Generation ist kein verbindlicher prüfbarer Begriff.',
 (22,'BTL-Treibstoff'):'Leere Bindung, kein konkreter BTL-/Fischer-Tropsch-Vertrag im endlichen Carrierblock. Quelle 201 bleibt LK-HOLD.',
 (23,'Mikroplastik'):'Keine konkrete prüfbare Größen-/Entstehungs-/Umweltkontextleistung zum Begriff im aktuellen Carrierblock.',
 (23,'Additiv'):'PLA nennt Additive als offene Einflussgröße, fordert aber keine Erklärung ihrer Rolle als zugesetzter Funktions-/Eigenschaftskomponente. 2652caef untersucht Monomer/Vernetzung; Quelle 213 bleibt offen.',
 (25,'Polyene'):'d72cbb62 fordert Azo-, Triarylmethan- und Anthocyaninfarbstoffe; ein Polyen als Kettenstruktur/Farbmittelklasse ist weder dadurch noch durch eine einzelne CH=CH-Brücke erklärt.'
}

# Term-specific positive witnesses. Shared notes describe a tested relationship,
# never credit from the mere appearance of a substring.
TERM_OVERRIDES={
 (5,'Oxidationszahl'):('22133f29','Die ganzen Redoxgleichungsfälle verlangen ausdrücklich Oxidationszahländerungen und Elektronenbilanz.'),
 (9,'Puffersysteme'):('a449e874','Korrespondierendes Paar, Stoffmengenbilanz, HH-Rechnung und endliche Reserve werden eigenständig erklärt.'),
 (12,'Aldosen'):('dfaef897','Die Person unterscheidet Glucose C1-Aldehyd und Fructose C2-Keton am ausdrücklich gegebenen Zuckerbau.'),
 (12,'Ketosen'):('dfaef897','Die Person bestimmt die Ketose Fructose, ihr Carbonyl-C2 und das neue anomere Zentrum nach Ringschluss.'),
 (12,'Keilstrich-Schreibweise'):('85342c52','Der ganze Keilstrich-R/S-Fall verlangt Tiefenbedeutung H nach hinten und begründete Konfigurationslesart. Dies ist Begriffsgebrauch der Schreibweise, keine Deckung der speziellen Kohlenhydrat-/Baukasten-/Digitalpflicht 153 und keine neue HB-GK-R/S-Pflicht.'),
 (12,'Polarimeter'):('f4d5a02d','Aktuelle required expectation polarimeter-components-and-angle verlangt kausale Gerätefunktion und Winkel-/Blankbezug; die leere Autor-Termvorschlagsliste ist damit sachlich durch einen aktuellen exakten Carrier korrigierbar.'),
 (14,'Proteine'):('065d764c','Strukturebenen, Rückgrat-/Seitenkettenkontakte und Funktion werden am Protein konkret erklärt.'),
 (14,'Primär-, Sekundär-, Tertiär- und Quartärstruktur'):('065d764c','Kontaktarten werden den räumlichen Ebenen und Untereinheiten zugeordnet; 197bc2c5 ergänzt Primärfolge/Peptidverknüpfung.'),
 (14,'alpha-Helix'):('065d764c','Der ganze Tetramerfall verlangt H-Brücken des Peptidrückgrats zur Helixstabilisierung.'),
 (14,'Kondensationsreaktion'):('197bc2c5','Eigenes Glycin/Alanin-Peptidmotiv, Wasserabgabe und verbleibende Termini werden bilanziert; leere Autor-Termliste bedeutet hier keine tatsächliche Konzeptlücke.'),
 (14,'isoelektrischer Punkt'):('d1244f5d','pH relativ pI wird zur begründeten Nettoladung und Wanderungsrichtung verwendet, nicht zur eindeutigen Identität oder Strecke.'),
 (14,'Zwitterion'):('e9d34f34','Intern geladene Glycinform und Nettoladung werden über Protonierung bilanziert.'),
 (14,'optische Aktivität'):('f4d5a02d','Tatsächliche optische Drehung wird mit optisch aktiver Probe, Referenzbedingungen und Modellgrenze erklärt; daraus folgt kein D/L-Drehvorzeichen oder eigener AA-Versuch.'),
 (14,'Ninhydrin-Nachweis'):('5c8f0bbb','Eigene kontrollierte Ninhydrinprobe, Aminogruppen-Reaktionsprinzip, Prolin-Grenze und echte Beobachtung sind gebunden.'),
 (15,'R- und S-Konfiguration'):('85342c52','Die erforderliche R/S-Erwartung und der ganze neue Keilstrichfall bestimmen R/S aus Prioritäten/Blickrichtung. Dies schließt die fehlende AA-CIP-Anwendung von Quelle 161 nicht automatisch.'),
 (16,'Hydrolyse'):('7371c82e','Die alkalische Esterhydrolyse zu Glycerin und Fettsäuresalzen wird chemisch erklärt; keine universelle zusätzliche Seifenherstellungs-Ausführungsquote.'),
 (18,'2. Hauptsatz der Thermodynamik'):('5169bb6b','System- und Umgebungsentropie werden zur Gesamtbilanz verbunden; lokale Entropieabnahme allein ist kein Widerspruch.'),
 (19,'Halbzelle'):('f0939f88','Gekoppelte Elektroden-/Elektrolytreaktionsräume und innerer/äußerer Ladungsweg werden kausal erklärt.'),
 (19,'galvanische Zelle'):('f0939f88','Freiwillige getrennte Redoxreaktionen, Polung und kontinuierlicher Ladungsausgleich sind verpflichtende Erklärung.'),
 (19,'Elektrolysezelle'):('fd7977bf','Erzwungene Stoffumsetzung, externe Energie, Elektroden und Ionenwanderung werden erklärt.'),
 (19,'Normalwasserstoffelektrode'):('b781745a','Aufbau/Standardbedingungen und relative Nullkonvention der Standard-Wasserstoff-Halbzelle sind konkret erklärt; Normal-/Standard-Schulterminologie wird nicht als absolute Einzelpotenzialmessung missverstanden.'),
 (23,'Monomer'):('2652caef','Aus vollständigen Ethen-/Diamin-/Disäureformeln werden eigene Repetiermotive und Verknüpfungen abgeleitet.'),
 (23,'Polyaddition'):('03e12e4f','Hydroxy-/Isocyanatgruppen, Protonenrelay, fortsetzbare Kette und keine kleine-Molekül-Abspaltung werden ausdrücklich erklärt.'),
 (23,'Polykondensation'):('9b942490','Wiederholte Acylverknüpfung, Endgruppen und Abgangsmolekül werden chemisch bilanziert.'),
 (25,'Elektromagnetisches Spektrum'):('87d8cc68','Sichtbarer Bereich und UV werden aus berechneter Wellenlänge/Photonenergie getrennt; keine ungedruckte Vollständigkeitsquote sämtlicher Spektralbereiche.'),
 (25,'Farbmischung'):('c8f51eac','Der ganze Reflexionsfall vergleicht Rot allein mit Rot plus Grün und begründet gelblichere Mischfarbe sowie Beleuchtungsgrenze.'),
 (25,'Komplementärfarbe'):('54bc6ca0','Der ganze Fall erklärt Entzug von Blau aus Weiß und näherungsweise gelbe Durchsicht; Absorptions- und sichtbare Restfarbe werden getrennt.'),
 (25,'Chromophor'):('87d8cc68','Der absorbierende delokalisierte Molekülteil, Energieabstand und Verlust sichtbarer Bande bei Konjugationsunterbrechung werden tatsächlich begründet. Das Fachwort Chromophor wird im P nicht ausdrücklich als Benennungsantwort gefordert; Begriffsinhalt ist prüfbar, Terminologielabel gesondert nachzubinden.'),
 (25,'Auxochrom'):('64b03eff','Freies Amino-Elektronenpaar als +M-Donor und dessen Ausschaltung durch Protonierung werden konkret erklärt. Inhalt ist geprüft; der Name Auxochrom ist kein ausdrücklicher Antwortbestandteil des P.'),
 (25,'Antiauxochrom'):('64b03eff','Nitrogruppe als mesomerer Akzeptor im Donor-π-Akzeptor-System wird konkret erklärt. Inhalt ist geprüft; der Name Antiauxochrom ist kein ausdrücklicher Antwortbestandteil des P.'),
 (25,'Ladungstransfer'):('1051c091','Wasseroxidation, Elektronen-/Protonenbilanz und gekoppelte Lichtreaktions-Träger werden zur CO2-Reduktion in Beziehung gesetzt.'),
}

SET_NOTES={
 1:'Atombausteine/Periodenordnung, Ionen-/Elektronenbilanz und bindungsabhängige Struktur-/Hydratationsmodelle werden eigenständig angewendet.',
 2:'Struktur, Namen, CH2-Homologie/Isomerie, funktionelle Gruppen und Mechanismusschritte werden tatsächlich gezeichnet bzw. begründet.',
 3:'Monomer-/Polymerverknüpfung und biobasierte Herkunft, Abbaubedingung sowie Bilanz-/Systemgrenzen werden getrennt erklärt.',
 4:'Protonenübertragung, Ionenverhältnis, pH sowie kontrollierte indikatorbezogene Beobachtungsdeutung werden konkret begründet.',
 5:'Elektronenübergang, Teilgleichungen, Rollen, Zelle und Speicher-/Wandlerfunktion werden am jeweiligen Beispiel erklärt.',
 6:'Hin-/Rückreaktion, Dynamik, c(t), MWG, Bedingungsänderung und technische/sustainable Prozessgrenzen werden geprüft.',
 7:'KL, Sättigung, dynamischer Austausch, Stöchiometrie und Gleichionwirkung sind berechenbare/begründbare Pflichtpunkte.',
 8:'Korrespondierende Paare, Protolyse-MWG, Wasserprodukt und Titrationsbegriffe werden zur konkreten Spezies-/Kurvenauswertung genutzt.',
 9:'Pufferrechnung/Reserve und Leitfähigkeitskurve sind konkrete Pflichtleistungen; hydratisierte Metallkationen bleiben getrennt offen.',
 10:'Rate/Zeitableitung, Bedingungen/Stöße, Energiebarriere und Verteilung werden kausal und quantitativ mit passenden Grenzen interpretiert.',
 11:'Ordnungen werden aus Raten/c(t) bestimmt, SN1/SN2 über Reaktionsweg, kinetisches Gesetz und Bedingungen unterschieden.',
 12:'Zuckerklassen/-Verknüpfungen, Projektionen, Ringschluss, Stereochemie, Reduktionsnachweis und optische Drehung werden konkret angewendet; offene Begriffe sind ausdrücklich separat gelistet.',
 13:'Spezifischer Drehwinkel und Ketose-Umlagerung haben aktuelle konkrete Pflichten; Kohlenhydratkonformation fehlt.',
 14:'AA-Protonierung, Peptid-/Proteinstruktur, selektive Nachweise und Trenn-/Rf-Deutung sind geprüft; einzelne nicht gebundene Begriffe werden nicht versteckt.',
 15:'R/S ist als Prioritäts-/Blickrichtungsentscheidung gebunden; das ersetzt keine konkrete AA-CIP-Pflicht.',
 16:'Triacylglycerid, Sättigung, Ester und Hydrolyse werden chemisch verwendet; Hydrierung, Kennzahlen und essenzielle Fettsäuren bleiben offen.',
 17:'Energie-/Systemgrenzen, Reaktions-/Bildungs-/Bindungsenthalpien und Hess werden mit gleicher Zustands-/Umsatzbasis begründet.',
 18:'Entropie, Gesamtbilanz, ΔG-Vorzeichen und Gibbs-Helmholtz werden berechnet und von Kinetik/Standardbedingungen getrennt.',
 19:'Zellen, relative Potenziale/Referenz, konkrete Batterietypen und Korrosion werden über chemische Ladungswege erklärt.',
 20:'Nernst-/Faraday-Rechnung, Konzentrationszelle, tatsächliche Redoxtitration und elektrolytische Überspannung sind konkrete Pflichten.',
 21:'Photosynthese/Kohlenstofffluss und einzelne Biofuelwege sind gebunden; Strahlungshaushalt, Treibhauseffekt und Generationenbegriff bleiben eigenständige Lücken.',
 22:'Kein BTL-Begriffs-/Prozesscarrier im endlichen Vorschlag gebunden.',
 23:'Ketten-/Netzstruktur, Verknüpfungstypen, thermisches Verhalten und materialgerechte Kreisläufe werden erklärt; Mikroplastik/Additivfunktion bleiben offen.',
 24:'Nanodimension, Oberflächenwirkung, Benetzung und Exposition werden an kontrollierten konkreten Materialdaten beurteilt. Dies ist keine Deckung der fehlenden Nanopartikelverstärkung eines Polymers in 210.',
 25:'Wellenlänge/Photonenergie, Restlicht, Strukturklasse, gekoppelte π-Systeme, Donor/Akzeptor, Spektrenauswertung und Photosynthese-Träger werden kausal angewendet; Polyene und benannte Terminologielabel bleiben gesondert.',
 26:'Benzolmodelle/Substitution, Wirkstoff-Isolierung und Forschungs-Rückkopplung sowie Positions-/Dirigierungsbegriffe werden konkret gebraucht. Effektiver Quellenkurs ist LK-Thema 4.3, unabhängig vom unmarkierten Tabellenblock.',
 27:'Hybridisierung, σ-Rahmen und π-p-Orbitale werden räumlich konsistent am konkreten organischen/aromatischen Modell dargestellt; LK bleibt erhalten.'
}

def terms():
 results=[]
 for t in J['mandatoryTermSets']:
  n=t['termSetOrdinal'];termrows=[]
  for a in t['unreviewedTermBindingProposals']:
   term=a['term'];key=(n,term);missing=TERM_MISSING.get(key);pre_note=TERM_OVERRIDES.get(key);chosen=[gid(pre_note[0])] if pre_note else a['proposedCarrierIds']
   # The source table uses the spelled-out Greek name in the sealed input.
   if n==14 and term=='beta-Faltblatt':assert missing
   ws=[]
   if not missing:
    for x in chosen:
     pr=P[x]['profile'];ws.append({'goalId':x,'goalTitle':G[x]['title'],'wholeGoalBodySHA256':objsha(G[x]),'wholeProfileBodySHA256':objsha(pr),'requiredExpectationIds':pr['coverageExpectations']['requiredExpectationIds'],'assessablePerformanceWitnessesDe':[e['observablePerformanceDe'] for e in pr['expectations'] if e['id'] in pr['coverageExpectations']['requiredExpectationIds']]})
   termrows.append({'term':term,'decision':'HOLD' if missing else 'ACCEPT','actualConceptUse':not bool(missing),'rationaleDe':missing or (pre_note[1] if pre_note else SET_NOTES[n]),'proposedCarrierIds':a['proposedCarrierIds'],'actualWitnessCarrierIds':[] if missing else chosen,'authorProposalCorrectedByActualCurrentWitness':not missing and chosen!=a['proposedCarrierIds'],'terminologyLabelQualification':('The conceptual role is assessable, but this exact curriculum label is not an explicit named answer in the current P; bind the label transparently without adding an experiment.' if n==25 and term in ['Chromophor','Auxochrom','Antiauxochrom'] else None),'carrierWitnesses':ws})
  scope=t['originalSourceTermSet'];results.append({'termSetOrdinal':n,'termSetId':scope['termSetId'],'physicalPage':scope['physicalPage'],'topic':scope['topic'],'sourceBodySHA256':objsha(scope),'originalCourseQualifier':scope['originalCourseQualifier'],'effectiveCourseScope':'LK only: p37 topic 4.3' if n in [26,27] else scope['courseLevel'],'officialTopicStatus':scope['officialTopicStatus'],'selectionRule':scope['selectionRule'],'selectedByLearner':None,'decision':'HOLD' if any(x['decision']=='HOLD' for x in termrows) else 'ACCEPT','rationaleDe':SET_NOTES[n],'terms':termrows,'missingTerms':[x['term'] for x in termrows if x['decision']=='HOLD'],'noExtraExperimentOrTaskQuota':True})
 return results

TERMS=terms()
TERM_FIRST={'role':'Independent reviewer A FIRST: all 27 mandatory terminology sets, actual conceptual use separated from missing terms','atUTC':FIRST['atUTC'],'inputPin':FIRST['inputPin'],'centralPins':J['centralInputs'],'sourceRules':J['originalScopeRules'],'counts':{'termSets':len(TERMS),'terms':sum(len(t['terms']) for t in TERMS),'acceptedSets':sum(t['decision']=='ACCEPT' for t in TERMS),'heldSets':sum(t['decision']=='HOLD' for t in TERMS),'acceptedTerms':sum(x['decision']=='ACCEPT' for t in TERMS for x in t['terms']),'heldTerms':sum(x['decision']=='HOLD' for t in TERMS for x in t['terms'])},'interpretation':'Term acceptance credits the concrete assessable concept use shown, not mere substring presence. Mandatory vocabulary adds no unprinted laboratory command, clinical detail or trial quota. Explicit terminology-name qualifications are not hidden. Source-specific stronger context/operator gaps remain in the separate 162-clause FIRST.','termSets':TERMS,'normalActivation':False,'globalM7Claim':False,'HumanApproval':False,'HumanTrial':False}
for t in TERMS:
 t['universalOfficialRequirement']=J['mandatoryTermSets'][t['termSetOrdinal']-1]['originalSourceTermSet']['universalOfficialRequirement']
for x in [FIRST,TERM_FIRST]:
 x['licenseForOwnReviewContent']='CC-BY-4.0'
 x['normalApplicabilityOrCompilerApprovalClaimed']=False
 x['sourceBindingScope']='Review of the concrete proposed source duty/carrier union. A source mapping credits only the witnessed source duty and course role, never every stronger field or task of the whole carrier as an official source requirement. Existing historical native course tags, raw jurisdiction lists, phase, own-acquisition extensions and author flags are not new HB source authority. Actual application/compilation remains separate.'

if __name__=='__main__':
 print(put('FIRST.independent-A.HB-remaining162.source-bindings.json',FIRST));print(FIRST['counts'])
 print(put('FIRST.independent-A.HB-term27.actual-concept-bindings.json',TERM_FIRST));print(TERM_FIRST['counts'])
