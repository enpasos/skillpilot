# Gezielter P-Delta-Review: acht Hold-Reparaturen

Stand: 21.09.2026. Informierter unabhängiger **KI-Kandidatenreview**, keine blinde D-Runde, keine menschliche Freigabe, keine Registrierung. Gelesen wurden die acht aktuellen vollständigen Zielbindungen, ihre DE-/EN-Fassungen und direkten Voraussetzungen, die wirklichen nachstehend bezeichneten P-v2-Erwartungen und alle 16 zugehörigen Anwendungsfälle. Grundlage: vollständige `mathematik-positive-understanding-evidence-profile-criteria-v2.md`.

**Ergebnis:** Die Fallinhalte lassen sich für alle acht Ziele weiterverwenden, bei `01217…` und `a288…` ausdrücklich aus der schon korrigierten V2-Datei. Keine dritte Fassung der unveränderten Fälle nötig. Notwendig sind aktuelle Ziel-/Bild-/Kontextbindungen und wahrheitsgemäße neue Reviewbegründungen; überholte Direktkanten-Befunde dürfen weder unverändert als aktuelle Fakten kopiert noch rückwirkend aus historischen Nachweisen gelöscht werden. Die Punkte unten benennen, was inhaltlich geprüft wurde, statt pauschal Hashes nachzuführen.

## Tatsächlich gelesene Quellen

Die Pfade in der folgenden Tabelle sind relativ zu `curricula/DE/Gymnasium/quality/goal-evidence/`.

| Kürzel | Inhaltliche Quelle | Zu verwendende Ziele |
| --- | --- | --- |
| E | [canonical-math-positive-understanding-evidence-m7-image-context-refresh-14-20260920-v1.review.jsonl](../../../../../goal-evidence/canonical-math-positive-understanding-evidence-m7-image-context-refresh-14-20260920-v1.review.jsonl) | `efc3506a…` |
| P | [canonical-math-positive-understanding-evidence-m7-proof-problem20-20260921-v1.candidates.json](../../../../../goal-evidence/canonical-math-positive-understanding-evidence-m7-proof-problem20-20260921-v1.candidates.json) | `f84ea3d8…`, `1e164a09…` |
| P2 | [canonical-math-positive-understanding-evidence-m7-proof-problem20-20260921-v1.hold-corrections-v2.candidates.json](../../../../../goal-evidence/canonical-math-positive-understanding-evidence-m7-proof-problem20-20260921-v1.hold-corrections-v2.candidates.json) | `01217f4a…`, `a288231e…` |
| S | [m7-statistics-next20-20260921-image-delta-v2/positive-evidence.candidates.json](../../../../../goal-evidence/m7-statistics-next20-20260921-image-delta-v2/positive-evidence.candidates.json) | `f14e1643…`, `78bfbde4…`, `77d607e0…` |

Datei-SHA-256 zum geprüften Stand, keine nativen Profil-Fingerprints:

- E: `9682944cb6d9e201806c9c8ae273f7ba77bbb2e59b99ec3a3d2d66dbf1a3ee26`.
- P: `667cef30ab3f5cf6700f72036e3b77a4921307274eea0b2568a5a3d32a31be28`.
- P2: `4c929b62e0c95a18e1dacfcf0af7de5f5092423bf2fa5a1e73d824961f40d74a`.
- S: `6b67c3ebf114ee5eef1f4694d8f157fcf7228daf3de5fc4041d705ec464f5382`.

Die aktuellen Bilder von E, beiden P2-Zielen und den drei S-Zielen wurden in diesem Delta-Pass tatsächlich mit `view_image` angesehen. Das neue `1e164a09…`-PNG wurde zusätzlich separat fachlich/visuell geprüft; für `f84ea3d8…` wird der eigene zuvor durchgeführte tatsächliche Bildreview mit identischem SHA wiederverwendet. Kein behaupteter erneuter Gesamtbuch-/Runtime-/Handytest. Der bereits geprüfte Ein-Anteil-Quellkontext für `77d607e0…` wird aus dem vorhandenen `confidence-diagram-source-audit.receipt.json` und dem Image-Delta-Receipt übernommen, nicht als neuer blinder Quellenreview ausgegeben.

## 1. `efc3506a-5f35-4d77-9498-d70a091a470b`

**Baumdiagramme und Pfadregeln für zusammengesetzte Experimente nutzen.** Delta: die beiden fachfremden direkten Voraussetzungen wurden entfernt; Zieltext und aktuelles PNG sind unverändert.

- **Reuse:** E, Erwartungen `tree-encodes-sequence` und `event-from-paths`; Fälle `with-replacement` und `without-replacement` vollständig behalten.
- **Nachgerechnet:** Bei 3 roten und 2 blauen Kugeln mit Zurücklegen haben RB und BR jeweils `(3/5)(2/5)=6/25`, zusammen `12/25=0,48`. Ohne Zurücklegen bei drei Ziehungen: RRB, RBR und BRR jeweils `1/5`, zusammen `3/5`. Der Pfad BBB ist unmöglich; die verbliebenen Anzahlen bestimmen die Zweige. Das ist eine echte Änderung von Abhängigkeit und Baumtiefe, nicht bloß eine Umbenennung des Münzbilds.
- **Bild-Leakage:** Das aktuelle Lehrbild rechnet zwei faire Münzwürfe und „genau einmal Kopf“ vor. Weder die ungleichen Kugelwahrscheinlichkeiten noch die aktualisierten Bestände und drei Ergebnisreihenfolgen des Transferfalls sind daraus ablesbar. Eine selbst konstruierte korrekte Baumstruktur und Begründung bleiben verlangt.
- **Nötige P-Anpassung:** Neue Inhaltsbindung an die tatsächlich verbliebenen `requires`; im **neuen** Reviewtext klarstellen, dass der alte direkte Boxplot-/Sekundärdaten-Dissent erledigt ist. Die weiterhin transitive Erreichbarkeit über das Laplace-Ziel wurde im benachbarten A/M-Review ausdrücklich festgestellt: daher keine Behauptung einer vollständigen Routenbereinigung. Die P-Fälle selbst benötigen diese fachfremden Kompetenzen nicht. Historische E-Zeile unverändert lassen.

## 2. `f84ea3d8-c255-552a-998a-202e42843f56`

**Widerlegung verständlich formulieren.** Delta: DE/EN präzisiert „Voraussetzungen erfüllt, behauptete Folgerung verletzt“; korrigiertes PNG ersetzt die falsch zugeordneten Maße.

- **Reuse:** P, `communicate-refutation`, Fälle `equal-squares-refutation` und `perimeter-refutation` unverändert.
- **Fachlich:** `x=−3` erfüllt `x²=9`, aber nicht `x=3`. Rechtecke `2×8` und `5×5` haben beide Umfang 20, aber Flächen 16 und 25. In beiden Fällen erfüllt das Gegenbeispiel die Voraussetzung und widerlegt die Folgerung; das Profil war bereits präziser als die alte missverständliche Beschreibung und passt nun exakt zur neuen Fassung.
- **Bild-Leakage:** Das Bild zeigt „Alle Rechtecke sind Quadrate“ mit einem `4×2`-Rechteck. Die P-Fälle erfordern andere Voraussetzungen/Folgerungen und eine eigene zusammenhängende Widerlegung; bloßes Kopieren der vier Überschriften oder der Maße genügt nicht. Ein geometrischer Gegenfall und eine algebraische Implikation bilden unterschiedliche Anwendungsstrukturen.
- **Nötige P-Anpassung:** Nur aktueller DE/EN-Text, neue PNG-/Alttext-/Seitenbindung und gezielte neue Reviewbegründung. Bestehende Falltexte und positive Erwartungen nicht neu schreiben.

## 3. `01217f4a-5221-5df9-b379-7b241fccf809`

**Beweisstrategien vergleichen und wählen (LK).** Delta: keine Pflichtkante mehr zur Berechnung bedingter Wahrscheinlichkeiten.

- **Reuse:** Ausschließlich P2 für dieses Ziel; `choose-proof-strategy`, `parity-choice` und der schon ersetzte `geometric-sum-strategy`-Fall. Nicht den alten arithmetischen Summenfall zurückholen.
- **Fachlich:** Die Kontraposition von „`n²` ungerade ⇒ `n` ungerade“ ist „`n` gerade ⇒ `n²` gerade“; mit `n=2k` ergibt sich `n²=4k²`. Die geometrische Summe `S_n=Σ(k=0…n−1)2^k` erfüllt `S_1=1` und `S_{n+1}=S_n+2^n`; ebenso ergibt die direkte Subtraktion `2S_n−S_n=2^n−1`. Beide Ansätze sind gültig. Vergleich von Aufwand und Struktur, begründete Wahl und entscheidender Ansatz sind erforderlich; die Bezeichnung einer Methode allein reicht nicht.
- **Bild-Leakage:** Das unveränderte Bild markiert Induktion für `1+2+…+n=n(n+1)/2`. P2 verlangt hingegen Vergleich bei Paritätsimplikation bzw. geometrischer Summe und lässt den kürzeren direkten Weg ausdrücklich gleichberechtigt zu. Der abgeänderte zweite Fall beseitigt die konkrete alte Bildüberlappung; der vorgegebene Vergleichsansatz `2S_n−S_n` spendet noch keine Begründung der Wahl oder Ausführung der Kürzung.
- **Nötige P-Anpassung:** Aktuelle `requires` binden und im neuen `reason` die nun entfernte direkte Wahrscheinlichkeitskante als erledigt beschreiben. Die Formulierung „bestehende Kontextkante bleibt separate D-Aufgabe“ aus dem alten P2-`reason` nicht ungeprüft fortschreiben. Fallinhalt bereits korrigiert und weiterverwendbar.

## 4. `a288231e-e4bb-5c65-b018-b79a51ca87d8`

**Gegebenes und Gesuchtes bestimmen.** Delta: allgemeine Problemerfassung erfordert nicht mehr direkt die kombinatorische Produktregel.

- **Reuse:** P2, `givens-unknowns-constraints`, Fälle `fence-data` und `ticket-data`.
- **Fachlich:** Durch die ausdrücklich vollständige Verwendung der 24 m Zaun folgt `2x+y=24` statt lediglich einer Budgetungleichung; `x,y>0` und `0<x<12` sind korrekt. Das Identifizieren des Optimierungsziels ist nicht das Lösen der Optimierung. Im zweiten Fall: `n∈Z`, `n≥0`, `60+8n≤180`, ohne den Maximalwert zu verlangen. Kontinuierliche Seitenlängen mit Gleichheitsbedingung wechseln zu ganzzahliger Anzahl mit Budgetgrenze.
- **Bild-Leakage:** Das Bild gibt ein vollständig umzäuntes Rechteck mit Umfang 20 vor. Im P-Fall ändern die Mauer und nur drei Zaunseiten die Nebenbedingung; das bloße Kopieren von `2a+2b=20` wäre falsch. Der Busfall verlangt zusätzlich eine neue diskrete Modellstruktur.
- **Nötige P-Anpassung:** Die schon in P2 enthaltene vollständige Zaunverwendung erhalten; keine zusätzliche Optimierungs- oder Kombinatorikleistung einführen. Aktuelle Kontextbindung und `reason` an die entfernte Direktkante anpassen; historischen Vermerk „bestehende Zählprinzipien-Pflichtkante“ nicht als aktuell weiterführen.

## 5. `f14e1643-ad8d-5235-a832-97987fa18489`

**Null- und Alternativhypothesen formulieren.** Delta: direkte Ableitungs-Voraussetzung entfernt; Beschreibung, Bild und passende P-Fälle bleiben gleich.

- **Reuse:** S, `hypothesis-direction`, Fälle `directed-claims` und `two-sided-and-recoding`.
- **Fachlich:** Keimung `H0:p≤0,80`, `H1:p>0,80`; Defekte `H0:p≥0,04`, `H1:p<0,04`; Münze `H0:p=0,5`, `H1:p≠0,5`. Die Umcodierung `q=1−p` macht aus der Keimverbesserung `H0:q≥0,20`, `H1:q<0,20`. Der Parameter bleibt ein Populationsanteil, nicht die beobachtete relative Häufigkeit. Keine Testgrenzen oder Ableitungen verlangt.
- **Bild-Leakage:** Das Bild erklärt die drei Testseiten anhand anderer Ereignisse. Der zweite P-Fall wechselt die Zielrichtung und verlangt eine Umcodierung des Trefferereignisses; die richtige Ungleichung kann nicht allein aus einer Bildüberschrift kopiert werden.
- **Nötige P-Anpassung:** Nur neue `requires`-/Inputbindung und transparente Delta-Begründung. Hypothesenpaare, Fälle und DE/EN-Erwartungen unverändert geeignet.

## 6. `78bfbde4-8e16-529e-bd53-4e29d960b2b2`

**Fehlerwahrscheinlichkeiten berechnen.** Delta: DE/EN macht den wahren Alternativparameter für β ausdrücklich notwendig; der Alttext konkretisiert das vorhandene Bild.

- **Reuse:** S, `conditional-error-probabilities`, Fälle `right-error` und `left-error` unverändert. Beide enthielten die nun auch im Ziel expliziten Verteilungen bereits.
- **Unabhängig nachgerechnet:** Rechts: `X~B(10,0,5)`, Verwerfung ab 8, `α=56/1024=0,0546875`; unter `p=0,8` ist `β=P(X≤7)=0,3222004736`. Links: `X~B(12,0,75)`, Verwerfung bis 6, `α≈0,0544022321701`; unter `p=0,4` ist `β=P(X≥7)=1−P(X≤6)≈0,158212292608`. Die angegebenen zehnstelligen Dezimalwerte im zweiten Fall sind korrekt gerundet. Der Grenzwert gehört jeweils genau einem der komplementären Ereignisse an.
- **Bild-Leakage:** Das Lehrbild nutzt `n=20`, Verwerfung ab 5, Nullparameter 0,10 und Alternativparameter 0,25. Die P-Fälle nutzen eigene Summen und wechseln zusätzlich die Testseite. Nichtverwerfung liegt beim linksseitigen Fall rechts; das fordert mehr als Übertragen einer Farbe oder eines Bildwerts.
- **Nötige P-Anpassung:** Aktuelle DE/EN- und Alttextbindung, keine neue Fallrechnung oder Erwartung. Im neuen Review hervorheben: β ist parameterabhängig, kein konstanter Kennwert bloß aus dem Namen H1; die Fälle verwenden bewusst vorgegebene Punktparameter für die Berechnung.

## 7. `77d607e0-0244-55ca-ba0f-214baa94b8de`

**Konfidenzdiagramme deuten (LK).** Delta dieses Reparaturschritts: EN „how informative“ statt „significance“; der zuvor fachlich korrigierte p-h-Bildkontext bleibt unverändert.

- **Reuse:** S, `read-confidence-diagram`, Fälle `sample-size-slices` und `confidence-and-location`; Ein-Anteil-Quellenbeleg aus dem vorhandenen Quellreview weiterverwenden. Keine Rückkehr zu einem Zwei-Parameter-/Kovarianzkonzept.
- **Fachlich:** Für `a=c²/n` liefern horizontale Schnitte der Region `(h−p)²≤a·p(1−p)` die Grenzen `(h+a/2±√(a·h·(1−h)+a²/4))/(1+a)`. Die nachgerechneten Grenzen stehen unten. Größeres n verengt bei gleichem Niveau und h; höheres nominelles Konfidenzniveau verbreitert bei gleichem n und h. Das Intervall bei `h=0,60` enthält `p=0,50` tatsächlich nicht.
- **Bild-Leakage:** Das aktuelle Bild zeigt schematische horizontale/vertikale Schnitte und allgemeine Breitenregeln, aber keine Zahlenlösung der beiden P-Fälle. Bei der konkreten Darbietung müssen beschriftete Diagramme bzw. Schnitte zur Anwendung kommen; bloß die im Brief mitgelieferten Intervallzahlen zu wiederholen ist nicht die geforderte Darstellungskompetenz. Notwendig bleiben Achsen-/Schnittrichtungsbegründung, Vergleich und Verträglichkeitsurteil.
- **Nötige P-Anpassung:** Neue EN-/Inputbindung; keine neue Fallserie. Die bisher richtige Interpretation als Präzision/Informationsgehalt beibehalten, keine Signifikanztest-Kompetenz ergänzen. Nominelle Normalapproximation, keine exakte endliche Überdeckung und keine frequentistische Wahrscheinlichkeit für das feste unbekannte p behaupten. `c=1,96` bzw. `2,58` bleibt die verwendete Näherung.

| h | n | c | p-Untergrenze | p-Obergrenze | tatsächliche Breite |
| --- | --- | --- | --- | --- | --- |
| 0,50 | 100 | 1,96 | 0,4038298286 | 0,5961701714 | 0,1923403428 |
| 0,50 | 400 | 1,96 | 0,4512336166 | 0,5487663834 | 0,0975327668 |
| 0,50 | 100 | 2,58 | 0,3750902757 | 0,6249097243 | 0,2498194487 |
| 0,60 | 100 | 1,96 | 0,5020007846 | 0,6906002539 | 0,1885994693 |

Die vorhandenen Falltexte rechnen die ausdrücklich ungefähren Breiten aus gerundeten Grenzen (`0,192`, `0,098`, `0,250`); kein Widerspruch zu den ungerundeten Werten.

## 8. `1e164a09-0a2b-55ab-b927-08a4a278f72b`

**Plausibilität mit Beispielen testen.** Delta: erste aktive Bildressource ergänzt; Zieltext und Voraussetzungen unverändert.

- **Reuse:** P, `diagnostic-examples`, Fälle `square-test` und `fixed-perimeter`.
- **Fachlich:** Für `x²≥x` über R prüfen `−1,0,1/2,1,2` unterschiedliche Bereiche; `1/4<1/2` widerlegt die Allaussage. Beim Umfang-20-Vergleich haben `(5,5)`, `(3,7)` und `(0,1;9,9)` die Flächen 25, 21 und 0,99. Diese passenden Beispiele liefern noch keinen Maximumsbeweis. Weder Ableitung noch vollständige Optimierung sind verlangt.
- **Bild-Leakage:** Das neue tatsächlich geprüfte PNG behandelt stattdessen die wahre Ganzzahligkeits-/Paritätsvermutung `n(n+1)` und `n=−2,0,1,5`. Es verrät weder den reellen Gegenfall `x=1/2` noch die geometrischen Seiten-/Flächenwerte. Die P-Fälle verlangen begründete Auswahl und Reichweite des Tests; die allgemeine Schlussregel aus dem Bild allein ist keine unabhängige Demonstration.
- **Nötige P-Anpassung:** Neue Bild-, Alttext-, Ressourcen- und Seitenbindung. Falltexte unverändert behalten. Der eigenständige Bildreview liegt unter `math-m7-proof-holds-20260921-v1/1e164a09-0a2b-55ab-b927-08a4a278f72b/independent-review.{json,md}`; das ist keine P- oder Runtime-Abnahme.

## Bindungen und Integrationsgrenze

Für den Integrator: Die SHA-Werte in der folgenden Tabelle binden die tatsächlich geprüften **einzelnen aktuellen Canonical-Objekte** (`SHA256(JSON.stringify(goal))`) und aktuellen öffentlichen Raster. Es sind Diagnosebindungen; native `goalFingerprint`, `reviewInputFingerprint` und `profileFingerprint` anschließend mit dem bestehenden P-Verfahren erzeugen, nicht durch diese Werte ersetzen.

| Zielpräfix | aktuelles Goal-Objekt SHA-256 | aktuelles Bild SHA-256 |
| --- | --- | --- |
| `efc3506a` | `699eb1565a3485cb3b735d3b0368ad60d3e6adbde897e23865476163027bba28` | `3a650a3c3d331d873ca393e0dd2d7bab7ef19a5f85cb2f4feef2e52a50fe080b` |
| `f84ea3d8` | `8d575768e9e7a40305e3b9caf5ffe038ecbe3ff50d6ff74fa504b8679d0fa93c` | `1be92555033fa983dfd07cec527142f6618e98d9d635393bae076f0d81e1866c` |
| `01217f4a` | `3407eb66528d3061b9a2a1c6fea684314b1dc7bb15bf7c1b7acaaa6163d7ba70` | `aacb77f75615e1e9ae07702f281a53387e76517db191a363456c888ef31b9aa5` |
| `a288231e` | `34697f7a0dc892160c72ddfe70e9f9db269457ff0295ed4e91ef6fd296fd9d5a` | `765583a07bb5e28dd0ae50e4a7b48e5e4688bd8e2ba9e179a6a9bce332d802f7` |
| `f14e1643` | `5a262305cd3810eb33c2bca62bf088359ccd2e07ccffbe17ff08cdd2f8b57f2a` | `3ee6a3d8cf5ad67dceeade83327f6e0efd285d3c7c7d083a141cde423588c753` |
| `78bfbde4` | `c60c4314459a689807b4ec64d8c36702c9fd964d701b95086f124343d1d0283c` | `b045632a4ba8a64e5365f54c3e97844fb83ddd8f62f6c7028d5758bcf906779e` |
| `77d607e0` | `1930933d60476cb248181e05e585be6769133862ec1e61d23896c6de5c3644db` | `12821408336806b663dcc9c1143c0416dbd69e36ab9fb6d42ee2cfcd585dfdcb` |
| `1e164a09` | `fe9bc219301fdbcc38e393e95e75fb1bab6264ebdd1749cc63e4314308b45e93` | `2438afe2cc49365310dde78cd39a3a13bbe1360b4dc9a994ff00e88792b8bb2e` |

Zwei inhaltlich verschiedene Fälle pro Ziel und alle jeweiligen positiven Erwartungen bleiben bestehen. Alle acht DE-/EN-Profile sind in Aussagen, Quantoren, Ereignissen und Bedingungen äquivalent; keine zusätzliche Schwesterkompetenz oder höhere Kursebene wurde zur Reparatur eingeführt. Der Quellenreview und alte validierte Fallarbeit werden nicht als neue fachliche Abschlüsse gezählt.

Dieser Pass schreibt nur diese Notiz und den gesonderten Bildreview. Es wurden keine P-Dateien materialisiert, keine historischen Records geändert, keine Registry aktualisiert und keine neuen Lernendenleistungen behauptet. Neue KI-Profile bleiben `needs_human_review` / `ai_candidate`, `E1` / `G1`; das ist keine vorgespielte menschliche Freigabe. D-Auflösung, native P-Validierung und zentrale Abschlusszählung erfolgen separat an den endgültigen Bindungen.
