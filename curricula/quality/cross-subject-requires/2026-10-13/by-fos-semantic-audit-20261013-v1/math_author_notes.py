# SPDX-License-Identifier: Apache-2.0
# The following index decisions are manually authored after full-text reading.
# They are author candidates, not a semantic registry or independent verdict.
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path('tmp/cross-subject-requires/by-fos-semantic-audit-20261013-v1')
ROOT.mkdir(parents=True, exist_ok=True)
PATH = Path('curricula/DE/BY/Fachoberschule/Mathematik.json')
data = json.loads(PATH.read_text())
goals = data['goals']
fp = lambda x: 'sha256:' + hashlib.sha256(json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
sha = lambda p: 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()
roles = {'A':'assessable_narrow_atomic_candidate','B':'broad_outcome_requires_split','F':'admin_content_fragment'}
notes = '''
2|A|Aussagenverknüpfungen vereinfachen und deren Wahrheit beurteilen ist ein zusammenhängendes logisches Verfahren.
3|B|Zahlenmengen-Zugehörigkeit und Mengenoperationen sind getrennt nachweisbare Inhalte.
4|B|Begriffsabgrenzung, vier Grundrechenarten, Potenzgesetze und Betragsauflösung bilden mehrere Routinen.
5|B|Wurzelgesetze, teilweises Radizieren, Nenner-Rationalisierung und Näherungsschätzung verlangen unterschiedliche Verfahren.
6|B|Bruchtermrechnung und die verschiedenen algebraischen Umformungsroutinen sind als breite Vereinigung formuliert.
8|B|Lineare Gleichungen und Ungleichungen einschließlich Parameterfällen brauchen getrennte Leistungsgrenzen.
9|B|Quadratische Lösbarkeit, verschiedene Lösungsverfahren und Parameterabhängigkeit sind mehrere Aspekte.
10|A|Bruchgleichungen auf lineare/quadratische Gleichungen zurückführen und die Definitionsmenge beachten bildet eine Solverkompetenz.
12|B|Lineare Modell-Darstellungen und ein umfangreicher Katalog von Funktionsbegriffen sind zwei eigenständige Zielgruppen.
13|A|Zwischen linearem Graphen und passender Gleichung wechseln ist ein kohärenter Darstellungswechsel.
14|A|Quadratische Zusammenhänge mit Tabelle, Graph und zweckmäßiger Termform darstellen bildet eine zusammenhängende Repräsentationskompetenz.
15|A|Aus einem quadratischen Graphen den passenden Term gewinnen und äquivalente Termformen verwenden gehört zur selben inversen Rekonstruktion.
16|B|Wertemenge, Symmetrie, Vorzeichenlage und verschiedene Schnittpunkte sind unabhängige Untersuchungsziele.
17|A|Lineare/quadratische Ungleichungen grafisch lösen und die erhaltene Menge notieren ist eine begrenzte Lösungsroute.
18|B|Parameter-Eigenschaften, gemeinsame Scharpunkte und gegenseitige Graphenlage bilden mehrere Untersuchungen.
20|A|Ein zweidimensionales lineares Gleichungssystem grafisch lösen ist ein konkretes Verfahren; Fahrzeuge sind Anwendungsbeispiel.
21|B|Einsetzverfahren, Additionsverfahren und Gauß-Algorithmus sind mehrere unabhängig beherrschbare Verfahren.
23|A|Dreiecke anhand vorliegender Informationen klassifizieren ist ein begrenztes geometrisches Urteil.
24|B|Innenwinkelsumme, Pythagoras und drei trigonometrische Funktionen sind als kumulatives Methodenbündel formuliert.
26|A|Mit dem Strahlensatz unbekannte geometrische Längen ermitteln ist eine bestimmte mathematische Anwendung.
27|B|Umfang, Flächen verschiedener Figuren und Kreisbogenlänge sind eigenständige Größen und Rechenziele.
28|B|Oberfläche, Volumen und inverse Abmessungsbestimmung an zahlreichen Körpertypen bilden ein breites Bündel.
30|B|Zufallsexperiment-Erkennung, Ergebnisraum, Ereignisalgebra und Venn-Darstellung sind mehrere Lernaspekte.
31|A|Absolute und relative Häufigkeiten aus endlich vielen Wiederholungen bestimmen bildet eine gemeinsame Datenkompetenz.
32|B|Laplace-Wahrscheinlichkeit, mehrstufige Pfadregeln und Vierfeldertafeln sind unterschiedliche Modelle/Routen.
34|A|Exponentielle Zunahme/Abnahme charakterisieren und von linearem Wachstum unterscheiden ist eine modellbezogene Begriffsentscheidung.
35|B|Parameterabhängiger Exponentialgraph verbindet Wertemenge, Achsenschnitt, Asymptotik und Monotonie.
36|A|Einfache Exponentialgleichungen mit Logarithmusgesetzen lösen ist eine abgegrenzte Gleichungsroutine.
37|A|Aus Kenngrößen einen Wachstums-/Zerfallsterm zur Vorhersage gewinnen ist eine zusammenhängende Modellrekonstruktion.
39|A|Zahlen den natürlichen, ganzen, rationalen und reellen Mengen zuordnen ist eine konkrete Klassifikation.
40|B|Begriffsabgrenzung, Ganzzahl-/Bruchrechnung und Potenzgesetze umfassen mehrere Inhalte.
41|B|Produkte addieren, Summen multiplizieren, ausklammern und binomische Formeln bilden ein Umformungsbündel.
43|B|Lineare Darstellungen plus Funktions-, Argument-, Nullstellen- und Mengenbegriffe benötigen differenzierte Zielgrenzen.
46|B|Graphenschnitte, Achsenschnitte, Vorzeichenintervalle und Gleichungslösung werden zusammengefasst.
49|B|Lineare und quadratische Graphen werden durch Nullstellen, Steigung, Achsenabschnitt, Scheitel und Öffnung gemeinsam untersucht.
50|A|Wertemengen einer ganzrationalen Funktion unter ihrer Definitionsmenge ermitteln ist ein begrenztes Ziel.
51|B|Mehrere Nullstellenverfahren, Vielfachheit, Faktorisierung, Vorzeichenverhalten und Graphenschnitte sind ein breites Bündel.
52|B|Randverhalten und zwei Symmetriekriterien sind getrennt prüfbare Eigenschaften.
53|A|Einen ganzrationalen Graphen aus bekannten Eigenschaften für eine Ungleichungsentscheidung skizzieren ist eine kohärente grafische Route.
54|B|Geeignete Aussagen zu beliebigen ganzrational modellierbaren Vorgängen haben keinen begrenzten beobachtbaren Inhaltskern.
55|A|Den ganzrationalen Funktionsterm aus genügend Informationen rekonstruieren ist eine bestimmte inverse Modellaufgabe.
57|A|Differenzenquotient als Sekantensteigung und mittlere Sachrate berechnen/deuten bildet denselben Begriff.
58|A|Differenzialquotient als Tangentensteigung und lokale Rate auch grafisch ermitteln/deuten bildet einen zusammenhängenden Begriff.
59|A|Den propädeutischen Funktionsgrenzwert an endlichen und unendlichen Stellen anschaulich erklären ist eine Begriffskompetenz.
60|A|Lokale Differenzierbarkeit anhand von Graphen einschließlich Gegenbeispielen erklären ist ein konkreter Begriffsentscheid.
61|B|Ableitungsrechnung, Monotonie, Krümmung, Extrema und Wendepunkte bilden eine ganze Kurvendiskussion.
63|B|Zufallsexperiment erkennen, dokumentieren sowie Ergebnisraum und Mächtigkeit bilden mehrere Modellierungsschritte.
64|A|Ein reales Zufallsexperiment mit einem Urnenmodell simulieren ist ein konkreter Modelltransfer.
65|B|Ereignisbegriffe, Mengenverknüpfungen, zahlreiche Ereignisrelationen und de Morgan sind gemeinsam gebündelt.
67|A|Absolute/relative Häufigkeiten einschließlich zusammengesetzter Ereignisse aus Wiederholungen ermitteln ist eine Datenkompetenz.
68|A|Ereignishäufigkeiten aus einer Vierfeldertafel gewinnen ist eine bestimmte Darstellungsauswertung.
69|A|Relative Häufigkeit durch das empirische Gesetz großer Zahlen als Wahrscheinlichkeitsschätzung begründen ist ein konkreter Modellschluss.
70|A|Die Laplace-Annahme prüfen und auf ihr Ereigniswahrscheinlichkeiten berechnen ist eine gemeinsame Modellkompetenz.
71|A|Mehrstufige Ereigniswahrscheinlichkeiten mit Baum und Pfadregeln berechnen/deuten ist eine begrenzte Wahrscheinlichkeitstechnik.
72|A|Bedingte Wahrscheinlichkeit in zweistufigen Experimenten bestimmen und sachlich interpretieren bildet einen Zielkern.
73|A|Stochastische Abhängigkeit/Unabhängigkeit zweier Ereignisse prüfen und begründen ist ein konkreter Begriffsentscheid.
75|A|Belegungen von k-Tupeln mit dem allgemeinen Zählprinzip zählen ist eine bestimmte kombinatorische Struktur.
76|B|Auswahlen ohne Reihenfolge und Buchstabenpermutationen sind unterschiedliche kombinatorische Modelle.
92|B|Geometrische Vektoraddition, Subtraktion und skalare Multiplikation sind mehrere Operationsaspekte; das Kraftbeispiel ist Anwendung.
93|B|Spaltenrepräsentation, Linearkombinationen und spezielle Ortsvektor-Konstruktionen sind mehrere Inhalte.
94|B|Lineare Abhängigkeit und Basischarakterisierung verlangen getrennte Kriterien.
95|A|Lineare Systeme begrenzter Größe mit dem Gauß-Verfahren lösen ist ein konkretes Verfahren.
97|A|Das Skalarprodukt zum Winkel-/Orthogonalitätsentscheid verwenden verbindet Rechnung und geometrische Bedeutung desselben Produkts.
98|B|Vektorproduktrechnung, gemeinsamer Normalenvektor und Flächenmaß sind getrennte Verwendungsziele.
101|A|Globale und Randextrema zur Wertemengenentscheidung bestimmen ist ein zusammenhängendes Bereichsproblem.
102|B|Eine Änderungsrate berechnen und deren stärkstes Wachstum/Abnahme lokalisieren sind verschiedene Ableitungsebenen.
103|B|Rekonstruktion aus Ableitungsinformationen, Gleichungssystemlösung und weitere Grapheneigenschaften sind zusammengeführt.
104|A|Ein Optimierungsproblem mit zulässigem Bereich und Randextrema lösen ist ein kohärenter Modellierungsauftrag.
105|B|Funktions-, Ableitungs- und Stammfunktionsgraphen in beide Richtungen verknüpfen umfasst mehrere graphische Beziehungen.
106|A|Aus einem Funktionsterm zugehörige Stammfunktionsterme gewinnen ist eine bestimmte Integrationsroutine im Themenkontext.
108|B|Mehrere grundlegende Eigenschaften transformierter Exponentialfunktionen werden gemeinsam behauptet.
109|B|Parameterwirkungen erklären und einen Term aus dem Graphen rekonstruieren sind eigenständige Richtungen.
110|A|Einen exponentiellen Zusammenhang anwendungsbezogen modellieren und auswerten ist ein konkret benanntes Modellziel.
111|A|Das Erreichen eines gegebenen Exponentialwertes mit Logarithmen berechnen ist eine bestimmte inverse Fragestellung.
113|B|Produkt-/Kettenregel, vollständige Eigenschaftsdiskussion und Graphzeichnen bilden mehrere Lernziele.
114|B|Unbestimmte Anwendungsprobleme mit der breiten Klasse f·exp(g)+Konstante benötigen eigene begrenzte Zieldefinitionen.
116|A|Durch Ableiten nachweisen, dass eine gegebene F eine Stammfunktion von f ist, ist eine bestimmte Verifikationsleistung.
117|B|Stammfunktionen ganzrationaler und transformierter Exponentialfunktionen werden als unterschiedliche Routinen gebündelt.
118|B|Integralwerte, orientierte Bilanz, geometrischer Flächeninhalt und Sachargumentation werden gemeinsam verlangt.
120|A|Bernoulli-Experiment/Kette erkennen und n,p zuordnen ist eine begrenzte Modellklassifikation.
121|A|Ereigniswahrscheinlichkeiten einer Bernoulli-Kette berechnen ist eine konkrete Anwendung.
123|A|Diskrete Zufallsgröße als Ergebnis-Wert-Zuordnung erläutern und tabellieren beschreibt einen einheitlichen Begriff.
124|A|Eine diskrete Wahrscheinlichkeitsverteilung berechnen und darstellen ist eine zusammenhängende Repräsentationsleistung.
125|B|Erwartungswert, Varianz, Standardabweichung sowie Fairness-/Verteilungsvergleich sind mehrere Statistikziele.
126|B|Binomialmodell erkennen und mehrere Momentgrößen bestimmen sind unterschiedliche Inhaltsaspekte.
127|A|Diskrete/binomiale Wahrscheinlichkeiten verschiedener Intervallereignisse bestimmen ist eine begrenzte Ereignisauswertung.
129|A|Hypothesenentscheidung aus einer Stichprobe und begründeter Entscheidungsregel erklären ist ein zusammenhängendes Testkonzept.
130|B|Testgröße, Annahme-/Ablehnungsbereiche und Einfluss auf Fehlentscheidungen sind mehrere Aspekte des Testdesigns.
131|B|Signifikanzbereich sowie Fehler erster/zweiter Art einschließlich beider Risiken bilden ein breites Testbündel.
145|B|Zusätzliche Verkettung h(exp(x)), Produkt-/Kettenregel, Eigenschaftsdiskussion und Graphen erweitern das Kurvendiskussionsbündel.
149|B|Polynomial-, transformierte Exponential- und h(exp(x))-Stammfunktionen vereinen verschiedene Integrationsroutinen.
152|A|Das Spatprodukt als orientiertes Volumenmaß für Körper nutzen ist ein kohärenter Produkt-Anwendungsbegriff.
154|B|Geraden-/Ebenenparameterform, Koordinatenform und Achsenabschnittsform sind unterschiedliche Darstellungsziele.
155|B|Lageentscheid, Abstand, Schnittmenge und Schnittwinkel für mehrere Objekttypen umfassen viele geometrische Routinen.
156|B|Spurpunkte von Geraden, Achsenschnittpunkte und Spurgeraden von Ebenen bilden mehrere Schnittaufgaben.
157|B|Spezielle Lage aus Gleichungen erschließen, verbalisieren und im Schrägbild darstellen benötigen getrennte Nachweise.
159|A|Rechtwinklige Seitenverhältnisse trigonometrisch deuten und für fehlende Längen verwenden ist ein konkreter Dreiecksbegriff.
160|A|Sinus/Kosinus/Tangens am Einheitskreis und deren elementare Beziehungen erklären ist ein zusammenhängender Definitionstransfer.
161|A|Goniometrische Gleichungen mit einer Winkelfunktion lösen ist eine abgegrenzte Gleichungsklasse.
162|A|Parameter einer Sinusfunktion für einen modellierenden Graphen anpassen ist eine konkret begrenzte Transformation.
164|A|Ein begrenztes lineares System mit erweiterten Matrizen durch Gauß lösen ist ein konkretes Verfahren.
165|A|Die Lösungsanzahl eines parametrisierten linearen Systems entscheiden und seine Menge angeben ist ein begrenzter Systementscheid.
169|B|Lineare Abhängigkeit prüfen und einen Vektor aus gegebenen Vektoren rekonstruieren sind verschiedene Nachweise.
171|B|Explizite/rekursive Folgen auswerten und umgekehrt ein Bildungsgesetz rekonstruieren sind unterschiedliche Zielrichtungen.
172|B|Monotonie, Beschränktheit, Konvergenz und Grenzwertbestimmung von Folgen werden gemeinsam gebündelt.
173|B|Arithmetische/geometrische Partialsummen und geometrische/harmonische Reihenkonvergenz sind mehrere Inhalte.
175|B|Definitionsmenge, Lückenarten, Symmetrie, Achsenschnitte, Asymptoten und Graphzeichnen sind eine breite Funktionsdiskussion.
176|A|Asymptoten und Annäherungsseite einer rationalen Funktion aus Rand-/Lückenverhalten bestimmen ist eine kohärente Grenzwertanwendung.
177|A|Einen rationalen Funktionsterm aus genügend Angaben rekonstruieren ist eine bestimmte inverse Modellleistung.
179|A|Stichprobentyp und Repräsentativität einer Erhebung beurteilen ist ein konkreter methodischer Entscheid.
180|A|Für Häufigkeitsdaten eine zweckmäßige Tabellen-/Diagrammdarstellung wählen und erstellen ist eine Repräsentationskompetenz.
181|A|Korrelation mit Streudiagramm, linearer Regression und Korrelationskoeffizient beurteilen ist eine zusammenhängende Datenanalyse.
183|B|Intervallhalbierung, Regula Falsi, Sekanten- und Newtonverfahren sind mehrere unabhängig erlernbare Algorithmen.
184|B|Iterationsvorschriften für mehrere nicht einzeln begrenzte Näherungsverfahren plus Softwareauswertung verlangen eine Aufteilung.
185|A|Abbruchkriterien eines konkreten Iterationsverfahrens begründen ist eine abgegrenzte Algorithmusbewertung.
187|B|Projektziele/Probleme formulieren und Informationen beschaffen/verarbeiten sind mehrere Prozesse ohne benannten mathematischen Gegenstand.
188|A|Projektteam und Ablaufplan organisieren ist eine konkrete Prozessleistung; ein fachlicher Gegenstand fehlt.
189|B|Durchführung, Fachrichtigkeit, Dokumentation und Soll-Ist-Auswertung sind verschiedene Projektleistungen ohne benanntes Mathematikobjekt.
190|A|Projektergebnisse adressatengerecht präsentieren ist eine konkrete Kommunikationsleistung ohne eigenen mathematischen Zielgegenstand.
191|B|Selbst-/Fremdeinschätzung und fachliche/methodische/soziale Transferfolgerungen bilden ein breites Reflexionsziel ohne Mathematikobjekt.
193|A|Reale Sprungzusammenhänge abschnittsweise modellieren ist ein konkret benanntes Funktionsmodell.
194|A|Übergänge an Nahtstellen als unstetig/stetig/differenzierbar klassifizieren und deuten ist ein zusammenhängender Anschlussentscheid.
196|B|Trigonometrische Eigenschaften, Parametertransformationen, Modellierung und Problemlösung werden gemeinsam vereint.
197|B|Eine/zwei Winkelfunktionen und verschiedene Argumente erfordern mehrere goniometrische Lösungsrouten.
198|B|Trigonometrische Kurvendiskussion und physikalische Deutung beider Ableitungen bilden mehrere Inhalte.
199|A|Eine transformierte Winkelfunktion aus ihrem Graphen rekonstruieren ist eine konkrete inverse Darstellung.
201|B|Definitionslücken, Symmetrie, Achsenschnitte und rationales Graphzeichnen bilden eine breite Eigenschaftsgruppe.
202|A|Asymptoten einschließlich Annäherungsart aus Lücken-/Randverhalten bestimmen ist eine konkrete Grenzwertanwendung.
203|B|Quotienten-/Ketten-/Produktregel und mehrere Kurveneigenschaften sowie Optimierungsanwendung bilden eine breite Leistung.
204|A|Grenzwerte einfacher rationaler Funktionen am Definitionsrand mit Termumformungen bestimmen/deuten ist ein begrenztes Verfahren.
205|A|Einen rationalen Term aus Angaben rekonstruieren ist eine konkrete inverse Modellaufgabe.
206|A|Einen rationalen Graphen samt Asymptoten aus vorliegenden Informationen skizzieren ist eine begrenzte Darstellungsleistung.
213|A|Rationalen Funktionsterm aus hinreichenden Informationen rekonstruieren ist eine inverse Modellaufgabe.
214|B|Affin-negative-Potenz-Stammfunktionen bestimmen und gegebene F durch Ableiten verifizieren sind verschiedene Routinen.
215|A|Uneigentliche Integrale als gegebenenfalls existierende Flächenmaße ermitteln ist ein begrenztes Integralziel, keine allgemeine Orientierung.
218|B|Mehrere Eigenschaften parameterabhängiger ln-Funktionen und inverse Graph-Term-Rekonstruktion sind gebündelt.
219|A|Die Variable einer exponentiellen Zielwertfrage mithilfe der ln-Umkehrfunktion bestimmen ist eine konkrete inverse Gleichungsaufgabe.
220|A|Einen logarithmischen Zusammenhang modellieren und seine Basisdarstellung mit ln koordinieren ist ein benanntes Modellziel.
222|B|Mischfunktionen vereinen Definitions-/Rand-/Nullstellen-, Symmetrie-, Asymptoten-, Extrema- und Krümmungsziele.
223|B|Exponentialprimitive und logarithmischer f′/f-Typ sind verschiedene Integralstrukturen.
224|A|Produkt-Stammfunktionen durch partielle Integration bestimmen ist ein konkretes Integrationsverfahren.
225|A|Wachstums-/Zerfallsterme aus Kenngrößen zur Vorhersage rekonstruieren ist ein benannter Modellauftrag.
241|B|Umkehrbarkeit, Umkehrterm mehrerer Funktionstypen und weitere Eigenschaften werden als breites Paket verlangt.
242|B|Inverse Graphensteigung und neue Ableitungsregeln für Wurzel/ln sind mehrere Aspekte des Umkehrsatzes.
243|B|Arcustangens-Eigenschaften und Ableitungsrechnung aus der Tangensumkehrung benötigen getrennte Nachweise.
245|A|Fläche über enger werdende Ober-/Untersummen exakt begründen ist ein kohärenter Integraldefinitionsprozess.
246|B|Null-, Extrem-, Wendestellen und nichtintegralfreie Argumentation von Integralfunktionen bilden mehrere Untersuchungsziele.
248|B|Partielle Integration, Substitution und Partialbruchzerlegung sind unabhängig erlernbare Integrationsverfahren.
249|F|Die drei genannten Integralformen fehlen vollständig ('der Form , und sowie'); der Integrandenbereich ist nicht rekonstruierbar.
250|A|Uneigentliche Integrale erster/zweiter Art als unbegrenzte Flächenmaße berechnen ist ein benannter Integralprozess.
252|A|Volumen durch Rotationsintegral bestimmen ist ein zusammenhängendes geometrisches Integralziel; Achsen sind Variationen.
253|B|Sehr viele Funktionsklassen, Kurveneigenschaften, Integralflächen und Modellprobleme bilden ein unüberschaubares Leistungsbündel.
254|A|Aus ermittelten Eigenschaften den zugehörigen Graphen im gegebenen Bereich zeichnen ist eine begrenzte Darstellungsleistung.
256|B|Differenzialgleichungsordnung klassifizieren und Funktionslösungen verifizieren sind zwei verschiedene Nachweise.
257|A|Eine separierbare gewöhnliche Gleichung erster Ordnung durch Variablentrennung lösen ist ein konkretes Verfahren.
258|A|Aus allgemeiner Lösung ein Anfangs-/Randwertproblem spezifizieren ist eine benannte Parameterfestlegung.
288|B|Algebraische/Polar-/Exponentialform und vier komplexe Rechenoperationen sind mehrere Inhalte.
289|B|Gaußebenen-Darstellung und Visualisierung vier komplexer Operationen vereinen mehrere Aspekte.
290|A|Gleichfrequente harmonische Schwingungen mit Zeigern überlagern hat einen konkreten mathematisch-physikalischen Gegenstand.
292|A|Elementargeometrische Sätze auf bekannten Eigenschaften beweisen ist eine konkrete mathematische Beweisleistung, keine K1-Achse.
293|A|Voraussetzung, Schlussfolgerung und Konklusion in einem direkten Beweis verwenden ist ein beobachtbares Verfahren.
294|A|Eine Behauptung indirekt über Widerspruch beweisen ist ein bestimmtes Verfahren.
295|A|Aussageformen über natürliche Zahlen mit vollständiger Induktion nachweisen ist ein bestimmtes Beweisverfahren.
297|A|Empirische Daten auf Normalverteilungs-Plausibilität anhand ihres Graphen beurteilen ist ein konkreter Modellentscheid.
298|A|μ- und σ-Einfluss am Dichtegraphen veranschaulichen ist eine benannte Parameterdeutung.
299|A|Einen Chi-Quadrat-Unabhängigkeitstest im Sachkontext auswerten ist ein konkretes Testverfahren.
300|B|t-Tests für unabhängige und verbundene Stichproben sind unterschiedliche Designs, die eigene Zielgrenzen brauchen.
301|A|Mit dem Zwei-Stichproben-F-Test eine Varianzdifferenz beurteilen ist ein konkretes Verfahren.
303|A|Ein System durch Gauß-Zeilenumformungen in Matrizenform lösen ist eine bestimmte algebraische Methode; Stoffgemenge sind Beispiel.
304|B|Vier Determinantenverfahren und axiomatische Funktionseigenschaften sind mehrere Lernziele.
305|B|Lösungsanzahl und eindeutige Lösung mittels Determinante/Cramer vereinen Entscheidung und Berechnung unter verschiedenen Bedingungen.
307|A|Kartesische und Kugelkoordinaten eines Punkts ineinander umrechnen ist ein konkreter Darstellungswechsel.
308|B|Viele sphärische Objekttypen und deren Lokalisation bilden einen breiten Begriffs-/Darstellungskatalog.
309|B|Euler-Dreiecke klassifizieren und Scheitel-/Neben-/Gegendreiecke zuordnen sind mehrere geometrische Beziehungen.
310|B|Sphärische Abstände, Winkel, Flächen sowie diametrale/polare Zuordnungen vereinen zahlreiche unabhängige Ziele.
312|A|Lokale lineare/quadratische Approximation samt passendem Term aufstellen ist ein konkret begrenztes Näherungsziel.
313|B|Taylorpolynom konstruieren, Lagrange-Restglied abschätzen und Intervallgüte untersuchen sind mehrere Aufgaben.
314|A|Konvergenz einer Folge von Taylorgraphen softwaregestützt deuten ist eine konkrete Repräsentationsauswertung.
315|A|Näherungswerte mit einer geeigneten Taylorformel berechnen ist eine begrenzte Anwendung.
317|A|Boole-Ausdrücke mit Rechengesetzen vereinfachen ist ein bestimmter logischer Umformungsprozess.
318|A|Digitale Gatter in einer einfachen Schaltung realisieren verbindet logische und technische Konstruktion.
319|A|Mit Karnaugh-Veitch eine begrenzte digitale Schaltung logisch vereinfachen ist ein konkret benanntes Verfahren.
321|A|Eine geeignete ebene Kurvenparametrisierung mit gültigem Parameterbereich gewinnen ist ein bestimmter Modellauftrag.
322|A|Eine vorgelegte zweidimensionale Parametrisierung in eine Kurve überführen ist ein begrenzter Darstellungswechsel.
323|A|Entscheiden, wann eine parametrisierte Kurve Funktionsgraph ist, und ihren Term gewinnen ist ein zusammenhängender Repräsentationsentscheid.
324|B|Allgemeine Tangentengleichung und Orte achsenparalleler Tangenten sind verschiedene Ziele.
'''
annotations = {}
for line in notes.strip().splitlines():
    idx, role, reason = line.split('|', 2)
    annotations[int(idx)] = {'role': role, 'reason': reason, 'actualSubject': 'Math'}
# Explicitly authored semantic correspondences after individually rereading both
# full descriptions; slight typography differences are preserved in bound goals.
aliases = {
44:13,45:14,78:49,79:50,80:51,81:52,82:53,83:54,84:55,86:57,87:58,88:59,89:60,90:61,
133:101,134:102,135:103,136:104,137:105,138:106,140:108,141:109,142:110,143:111,146:114,148:116,150:118,
167:92,168:93,209:175,210:202,212:203,216:206,227:92,228:93,229:94,230:95,232:97,233:98,234:152,236:154,237:155,238:156,239:157,
260:63,261:64,262:65,264:67,265:68,266:69,267:70,268:71,269:72,270:73,272:75,273:76,275:120,276:121,278:123,279:124,280:125,281:126,282:127,284:129,285:130,286:131,
326:187,327:188,328:189,329:190,330:191,
}
for idx, origin in aliases.items():
    assert idx not in annotations and origin in annotations
    annotations[idx] = dict(annotations[origin], comparisonIndex=origin)
for idx in [187,188,189,190,191,326,327,328,329,330]:
    annotations[idx]['actualSubject'] = 'unresolved'
for idx in [290,318,319]:
    annotations[idx]['actualSubject'] = 'interdisciplinary'

year_indices = {47,99,207,331}
root_index = 332
cluster_indices = [0,7,11,19,22,25,29,33,38,42,48,56,62,66,74,77,85,91,96,100,107,112,115,119,122,128,132,139,144,147,151,153,158,163,166,170,174,178,182,186,192,195,200,208,211,217,221,226,231,235,240,244,247,251,255,259,263,271,274,277,283,287,291,296,302,306,311,316,320,325]
entries = []
for idx, goal in enumerate(goals):
    if idx == 1:
        subject, role = 'Math','orientation'
        reason = 'Der tatsächliche Text motiviert Relevanz für Alltag, Teilhabe, Studium und Beruf; er wird als motivationaler Einstieg vorgeschlagen, nicht als Mathematik-Wissensprüfung.'
    elif idx in year_indices:
        subject, role = 'structural','program'
        reason = 'Der leere Beschreibungstext und die vollständige Jahrgangsüberschrift ordnen Themen in die ausdrücklich benannte Jahrgangsstufe ein; dies ist keine Leistungskompetenz.'
    elif idx in cluster_indices or idx == root_index:
        subject, role = 'structural','cluster'
        reason = 'Die vollständige Überschrift ' + repr(goal['title']) + ' und ihre enthält-Liste bilden eine fachliche Navigationsgruppe; die Beschreibung ist leer und behauptet keine eigenständig assessierbare Gesamtleistung.'
    else:
        assert idx in annotations, ('Missing individual author judgment', idx, goal['description'])
        a = annotations[idx]
        subject, role = a['actualSubject'], roles[a['role']]
        reason = a['reason']
    entries.append({
        'index': idx,'goalId': goal['id'],'actualSubject': subject,'semanticRole': role,
        'classificationReason': reason,
        'potentialIndependentAssessmentAspects': annotations.get(idx,{}).get('reason', reason),
        'explicitCrossDescriptionComparisonIndex': annotations.get(idx,{}).get('comparisonIndex'),
        'descriptionSha256': fp({'description':goal.get('description'),'descriptionEn':goal.get('descriptionEn')}),
        'fullGoalSha256': fp(goal),
        'fullReadWitness': {'authorAgent':'/root/physics_pending5_revision','language':'de plus existing en','readExtent':'Every full description personally read, including blank descriptions and complete container headings; both actual English orientation descriptions read.','descriptionFieldWasEmpty': not bool(goal.get('description'))},
        'status':'author_candidate_pending_different_agent_review',
        'semanticRegistryWritten':False,'requiresDecisionMade':False,
    })
assert len(entries)==333
assert {g['id']for g in goals}=={e['goalId']for e in entries}
out={'schemaVersion':1,'status':'inert_math_author_classifications_not_authoritative','authorAgent':'/root/physics_pending5_revision','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':{'path':str(PATH),'sha256':sha(PATH)},'goalCount':333,'readCount':333,'entries':entries,'authorityBoundary':'Full-text individual author judgments only; no registry, new goal, native gate, human approval or requires edge is created.','license':'CC-BY-4.0','attribution':'SkillPilot contributors'}
p=ROOT/'math-author-classifications.json';p.open('x').write(json.dumps(out,ensure_ascii=True,indent=2)+'\n')
print(p,sha(p))
