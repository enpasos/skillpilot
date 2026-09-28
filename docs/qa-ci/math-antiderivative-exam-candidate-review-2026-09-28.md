# Fachprüfung und maschinelle Freigabe: zwei Stammfunktions-Zeichenprüfungen

Stand: 2026-09-28. Unabhängige AI-Sachprüfung der kanonischen Aufgaben, Musterlösungen, zweisprachigen Quellartefakte und negativen Punktszenarien. Nach der dokumentierten Überarbeitung stehen beide `examData.reviewStatus` auf `released`: Das bedeutet hier **nur maschinelle Inhaltsfreigabe**, keine externe menschliche Prüfung, reale Coach-Host-Erprobung oder M7-Freigabe.

## Befund und Entscheidung

| Prüfung | Fachliche Prüfung | Freigabeentscheidung |
| --- | --- | --- |
| `728fd537-40d3-5fdf-8b08-925cba0b2004` (f-Graph → F-Graph) | Der Streckenzug durch die sieben angegebenen Punkte, die Vorzeichenintervalle, die inneren Extrema von F bei `x=2,4`, die beispielhaften F-Werte und `G=F+1` stimmen. F muss auf den geraden f-Teilstücken gekrümmt sein. Die exakten Zwischenwerte sind bei einer qualitativen Zeichnung nicht Pflicht. | Vorher konnte 9/12 allein über F erreicht werden. Jetzt erzwingen 7+3+2 Punkte und Bestehen ab 11/12 die F-Zeichnung, `F′=f`-Begründung und gezeichnete/erklärte G-Verschiebung. DE/EN-Aufgabe und Lösung entsprechen dem zweisprachigen Assessmentblatt. |
| `22842d80-de9d-5dad-9819-6ae6e9ca61be` (F-Graph → f-Graph) | SVG A zeigt zwei passende, bei `(0|4)` tangential verbundene Parabelbögen. Daraus folgen `f=2x+4` links und `f=4−2x` rechts, gemeinsamer Wert `f(0)=4` und Nullstelle `x=2`. SVG B passt zu `h=2−2x` und den drei angegebenen Werten. Beide SVG-Dateien liegen in `app/public/assets/assessment-materials/.../22842d80.../` bytegleich zu den Kandidaten-Assets. | Vorher genügten 10/12 für die Zeichnungen ohne Begründung. Jetzt erfordern 5+5+2 Punkte und 11/12 beide Zeichnungen sowie die Tangenten-/Vorzeichenbegründung. `sourceArtifactPath` zeigt auf das finale zweisprachige Assessmentblatt. |

Dies sind echte Bestehenslücken: Der Claude-Adapter prüft beim Speichern der Exam-Mastery `earnedPoints >= passingPoints`, nicht Punkt-Minima pro Rubrikschritt (`ClaudeV1McpContractAdapter.applyExamMasteryRules`). Die Rubrikbeschreibung allein ist keine serverseitige Pflichtbedingung. Für andere Hostadapter darf eine zusätzliche Pflichtprüfung nicht ohne Test behauptet werden.

## Integrierter kanonischer Bewertungsstand

- `728...`: `maxPoints: 12`, `passingPoints: 11`; Schritt `antiderivative_graph_sketch` **7**, `antiderivative_graph_reasoning` **3**, `antiderivative_graph_shift` **2**. Bei 11/12 sind mindestens 6/7 für F, 2/3 für eine fachliche `F′=f`-Begründung und 1/2 für G nötig. Für den letzten Schritt gilt 0, falls entweder die zweite Zeichnung **oder** die Erklärung der reinen vertikalen Verschiebung fehlt. DE/EN-Aufgabe und Lösung des Kanons sind an das geprüfte Quellblatt einschließlich gekrümmter Form und waagerechter Tangenten gebunden.
- `228...`: `maxPoints: 12`, `passingPoints: 11`, Zeichnung A **5**, Zeichnung B **5**, Tangentenbegründung **2**. Damit sind mindestens 4/5 für **jede** Zeichnung und 1/2 für die Begründung nötig. Der erste Begründungspunkt erfordert den korrekten Zusammenhang `F′=f` zwischen Tangentensteigung von F und f-Wert; der zweite würdigt den Vorzeichenwechsel bei `x=2` und den Knick von f bei `x=0`. Das finale zweisprachige Quellblatt, die kanonischen Felder und die Rubrik sind synchronisiert.

**Strenge:** 11/12 ist für eine normale Übungsprüfung hoch. Mit dem heutigen, ausschließlich summenbasierten Gate ist es aber die kleinste Änderung an der bestehenden 5+5+2-Verteilung von `228...`, die die Begründung unverzichtbar macht; bei 10/12 bliebe sie optional. Bei `728...` schützt die vorgeschlagene 7+3+2-Verteilung mit 11/12 alle drei Bestandteile. Eine niedrigere, didaktisch angenehmere Gesamtschwelle bei zugleich verpflichtenden Kernleistungen braucht ein serverseitig geprüftes Teilminimum bzw. eine andere verbindliche Bewertungsregel, nicht bloß einen Kommentar im Markdown.

## Nachgewiesene Grenzen und offene Host-Akzeptanz

1. Die zweisprachigen Aufgaben-/Lösungstexte stimmen mit den jeweiligen finalen Quellabschnitten überein; ein gezielter Regressionstest prüft diese Parität und die negativen Punktszenarien. Das ist eine strukturelle und fachliche Inhaltsprüfung, keine tatsächliche Coach-Bewertung einer Einsendung.
2. Beide Prüfungen verlangen Zeichnungen. Cockpit-/Host-Anzeige, Foto- und Digitalabgaben sowie positive und negative Coach-Bewertungen sind mit echten Einsendungen in der laufenden Beta separat zu prüfen. Vorhandene SVG-Quelldateien und lokale Artefakttests beweisen keine reale Host-Anzeige.
3. Das Backend akzeptiert für die Exam-Mastery nur die vom Coach gemeldete Gesamtpunktzahl gegen `passingPoints`. Die schrittbezogenen Nullpunktregeln sind operative Rubrikanweisungen, keine serverseitig erzwungenen Teilminima. Eine niedrigere, lernfreundlichere Schwelle mit denselben Pflichtleistungen benötigt eine separate technische Erweiterung.
4. Weder diese Inhaltsfreigabe noch lokale Graph-/Schema-/Kompositions- oder Coach-Tests sind eine menschliche Abnahme, D-/P-/A-/M-/V-Freigabe oder M7-Abschluss.
