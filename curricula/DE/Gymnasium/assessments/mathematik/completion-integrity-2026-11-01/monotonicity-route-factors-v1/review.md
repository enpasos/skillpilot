# Unabhängige maschinelle Fachprüfung: drei Monotonievarianten

Datum: 1. November 2026. **Alle drei exakt gebundenen Inhaltskandidaten erhalten PASS.** Diese Prüfung stammt vom unabhängigen Review-Agenten; die Autorenänderungen an Herkunft und Beweis wurden anschließend erneut gelesen und technisch geprüft. Aufgaben- oder Produktdateien wurden durch den Reviewer nicht geändert.

| Variante | Ziel-ID | Ergebnis | Punkte |
| --- | --- | --- | --- |
| Monotonie und Extrema | `010c133c-dcf1-5530-8305-61bc638017bc` | PASS | 6/6 |
| Monotoniesatz und Nichtumkehrbarkeit | `dcdf1e2d-fb3a-5132-807e-00a0d6f46e33` | PASS | 3/3 |
| Kombination beider Bereiche | `ecc39d0e-5cf8-50ec-8917-41a322b50921` | PASS | 9/9 |

Die Hashes und geprüften Aussagen je Variante sind in `review.receipt.json` festgehalten. **Die Platzierung aller drei Varianten bleibt NOT_REVIEWED.** Kein PASS dieser Datei ist eine menschliche Freigabe, Unterrichts- oder Host-Erprobung, M7-Abnahme oder Veröffentlichungserlaubnis.

## 1. Monotonie und Extrema

Für das Polynom gilt exakt

\[
f'(x)=\tfrac3{10}x^2-\tfrac65x+\tfrac9{10}
     =\tfrac3{10}(x-1)(x-3).
\]

Die einzigen inneren stationären Stellen des Modellbereichs [0;5] sind 1 und 3. Die Ableitung ist auf (0;1) positiv, auf (1;3) negativ und auf (3;5) positiv. Damit ist die Funktion auf den geschlossenen Teilintervallen [0;1], [1;3] und [3;5] entsprechend streng steigend, streng fallend und streng steigend. Die verschwindende Ableitung an den gemeinsamen Endpunkten widerspricht dem nicht: Für zwei verschiedene Punkte eines solchen Teilintervalls liegt die vom Mittelwertsatz verwendete Zwischenstelle im Inneren, wo das passende strikte Vorzeichen gilt. Die Lösung verlangt hierfür keine falsche strikte Vorzeichenbedingung an allen Randpunkten.

Der Wechsel + nach − bei 1 ergibt das innere lokale Maximum mit f(1)=12/5=2,4. Der Wechsel − nach + bei 3 ergibt das innere lokale Minimum mit f(3)=2. Zusammen mit f(0)=2 und f(5)=4 folgt: globales Maximum 4 ausschließlich bei 5; globales Minimum 2 bei 0 und 3. Die doppelte Minimumstelle wird ausdrücklich verlangt und bewertet.

Der geschlossene Modellbereich und die Stetigkeit des Polynoms sichern globale Extremwerte. Da das Polynom überall differenzierbar ist, genügen die inneren stationären Stellen und die beiden Ränder als Kandidaten. Die Aufgabe fragt bei lokalen Extremstellen ausdrücklich nach dem Inneren; sie behauptet nicht, dass Randpunkte unter einer relativen Definition niemals lokale Extremstellen sein könnten. Der Unterschied zwischen lokalem Umfeld und gesamtem Modellbereich ist korrekt beschrieben.

Die drei Zwei-Punkte-Blöcke verlangen Vorzeichenanalyse, beide lokalen Klassifikationen und vollständigen globalen Vergleich. Bei 6/6 kann keiner dieser Blöcke fehlen. Genau diese Aspekte enthält Ziel `2850e8f6-2330-50d3-a577-d519540d9924`; Tangenten, zweite Ableitung oder Krümmung werden nicht als geprüft ausgewiesen. Die nötigen gewöhnlichen Ableitungs- und Rechenkenntnisse bleiben echte Vorbereitung, ohne automatisch als gesonderte Prüfungsabdeckung oder Mastery bescheinigt zu werden.

## 2. Monotoniesatz und Nichtumkehrbarkeit

Die hinreichenden Aussagen sind richtig: Ist eine Funktion auf einem Intervall differenzierbar und ihre Ableitung überall strikt positiv beziehungsweise strikt negativ, so ist sie dort streng steigend beziehungsweise streng fallend. Die Intervalleigenschaft verhindert, dass die Aussage unbemerkt auf einen unzusammenhängenden Definitionsbereich übertragen wird. Differenzierbarkeit und ein für das ganze Intervall geltendes Vorzeichen sind ausdrücklich genannt.

Die strenge Monotonie der beiden Gegenbeispiele wird unabhängig vom zu widerlegenden Umkehrschluss begründet. Für a<b gilt b−a>0 und

\[
a^2+ab+b^2=(a+b/2)^2+3b^2/4>0,
\]

weil das Verschwinden beider Quadratterme a=b=0 erfordern würde. Folglich ist b³−a³>0, und für −x³ kehrt sich die Differenz um. Die Ableitungen 3x² und −3x² sind bei 0 beide null. Somit besitzen beide Funktionen strenge Monotonie, obwohl das jeweilige überall strikte Ableitungsvorzeichen nicht vorliegt. Das widerlegt die behauptete Notwendigkeit, nicht die hinreichende Bedingung des Monotoniesatzes. Aus einer einzelnen Ableitungsnullstelle wird auch nicht irrtümlich ein Extremum abgeleitet.

Die drei Punkte verlangen beide hinreichenden Aussagen, begründete Monotonie und Ableitungen der Gegenbeispiele sowie die logische Unterscheidung. Unter 3/3 kann keine dieser Leistungen fehlen. Das ist eine passende Prüfung von Ziel `f76d00dc-6b31-59cd-b01a-3610eadc9908`. Das vorhandene Polynom-Extremwertziel wird hierfür weder benötigt noch als geprüft ausgegeben.

## 3. Kombinierter Kandidat

Die Kombination verwendet die geprüften Aufgabenanteile ohne mathematische Änderung. Die beiden Zielverträge werden tatsächlich verlangt; der 6-Punkte-Verlaufsblock und der 3-Punkte-Satzblock ergeben 9 Punkte. Ohne den Verlaufsblock sind höchstens 3, ohne den Satzblock höchstens 6 Punkte erreichbar. Mit 9/9 kann keiner der beiden Kompetenzbereiche entfallen.

Die Einstufung AB2 für die Verlaufsauswertung und AB3 für die explizite Prüfung der behaupteten Umkehrung ist fachlich vertretbar. Die getrennte Aufgabenform ermöglicht, nur den im jeweiligen Angebot tatsächlich vorgesehenen Kompetenzbereich zu prüfen. Daraus folgt noch keine Aussage, welche Variante in welchem Schuljahr oder Landesangebot eingefügt werden darf.

## 4. Herkunft, Metadaten und technische Kontrolle

Die Ursprungsfassung enthält das Schienenpolynom, den Bereich [0;5], die Verlaufsauswertung sowie das Gegenbeispiel x³. Die Herkunftshinweise unterscheiden nun richtig: Die Extremwertvariante übernimmt nur den Verlaufsteil; die Satzvariante übernimmt den Ausgangsgedanken x³ und kennzeichnet explizite Satzformulierung und fallendes Gegenbeispiel als neue Ausarbeitungen; die kombinierte Variante enthält beide Teile. Es wird keine unveränderte Übernahme der neu verfassten Beweise oder eine zusätzliche externe Quellenfreigabe behauptet.

Die aktuellen `requires`- und `coveredGoalIds`-Listen stimmen je Variante mit den tatsächlich verlangten Zielaspekten überein. Diese Gleichheit ist hier sachlich begründet, keine allgemeine Regel, dass Vorbereitung und geprüfte Abdeckung immer identisch wären. Die globale Mastery dieser Voraussetzungen wird durch das Bestehen eines Kandidaten nicht erzeugt.

Task- und Lösungstexte im JSON stimmen exakt mit den jeweiligen Markdown-Abschnitten überein. Die Punktesummen und Bestehensgrenzen 6, 3 und 9 wurden geprüft. Die Polynomwerte und Vorzeichen wurden zusätzlich mit exakten rationalen Zahlen kontrolliert. Alle Formeln der endgültigen eingebetteten Texte wurden unabhängig mit lokalem KaTeX unter `throwOnError: true` und `strict: error` geparst: 22 Formeln für die Extremwert-, 18 für die Satz- und 38 für die kombinierte Variante. Dies ist Syntaxprüfung, keine reale Host-Darstellungsabnahme.

## 5. Offene Platzierung und Freigabegrenzen

Die Autorenanalyse nennt verschiedene tatsächliche Kompetenzsignaturen; ihre Angebotsmatrix wurde in dieser Inhaltsprüfung nicht erneut ausgeführt. Die gemeinsame generische Sek-I-Ansicht kann verschiedene Landesfilter bedienen. Deshalb genügen ein Ansichtsname oder die Kompatibilitätsphase J10 allein nicht für die Auswahl einer Variante. G8-, Sek-II-, BE-, BY- und HH-Zuordnungen benötigen die gesonderte Prüfung ihrer effektiven Zielprojektionen und passenden Jahrgangs- beziehungsweise Stufenordner.

Wo das unveränderte Original bereits ein gültiges Ziel ist, darf diese Faktorisierung nicht nebenbei zusätzliche alternative Pflichtprüfungen erzeugen. Bei einer Ersatzplatzierung muss die tatsächlich passende Einzel- oder Kombinationsvariante gewählt und die Ausschließlichkeit in realen Projektionen geprüft werden. Die Ursprungsaufgabe bleibt unverändert. Diese offenen Integrationsprüfungen werden durch die drei fachlichen PASS-Urteile nicht vorweggenommen.
