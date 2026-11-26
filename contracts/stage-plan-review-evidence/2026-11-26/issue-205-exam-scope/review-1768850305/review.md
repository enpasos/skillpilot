# #205 – Klausurumfang bei einem veralteten Plan

**Übernahme nach Korrektur der zwei blockierten Fortsetzungswege.** Der Patch auf `17688503056e3c48318f1a27b407a2aa8480c8c8` öffnet den gewöhnlichen Lernweg bei allen vier von Claude getesteten Ursachen. Er hat weiterhin zwei Zustände, in denen der Coach das gewünschte Lernen im Fach nicht starten kann, und einen Zustand mit leerer sichtbarer Frontier trotz nutzbarem Fortsetzen. Verglichen wurde ausschließlich mit `a3f6b067dfc56cce400e953accef0f7d6251714b`. Die spätere Energieänderung gehört nicht zu diesem Review.

| Rang | Reproduzierbarer Zustand | Beobachtung und Fundstelle |
|---|---|---|
| P1 | Mathematik hat eine auswertbare Klausur, Physik einen veralteten Klausurplan. | Die betrachtete Physik-Fachfrontier ist leer, obwohl persönliche Physikziele offen sind. Beide unabhängigen Prüfer reproduzierten das mit Autopilot an und aus. Die alleinige Entfernung bzw. Markierung des Matheplans als veraltet öffnet mit denselben Physikdaten zwei bzw. drei Ziele in den jeweiligen Testaufbauten. Der übergebene Fachumfang enthält fremde Voraussetzungen. Deren Landschafts-IDs werden als gewünschte Fächer gewertet. Das zieht die gültige Matheklausur in die Physikauswahl. `LearnerService.java:4528`, `:5246`, zusätzlich fachübergreifende Fortsetzungsauswahl in `LearnerLearningPlanService.java:432`. |
| P1 | Veralteter Klausurplan mit ausschließlich inaktiven gewöhnlichen Lernblöcken. | Der Coach meldet `evaluable=false`, `canContinue=true` und `resumeAvailable=true`. Der tatsächliche Dienstaufruf hat `changed=false` und kein aktives Ziel, der veröffentlichte MCP-Aufruf endet mit HTTP 409. Nach der negativen Klausurprüfung wendet die Fortsetzung weiter die Inaktivität aus dem veralteten Plan an. `LearnerLearningPlanService.java:2006`, `CoachToolFacade.java:310`. |
| P2 | Durch echte Aktivierung gespeicherter Klausurfokus, inzwischen erledigtes einziges Thema, veralteter Plan und kein aktives Ziel. | Drei offene Ziele in der persönlichen Fachfrontier treffen auf null in der gewöhnlichen Frontier. Die implizit gespeicherten Klausuratome wirken als normaler Fokus weiter. AP an und aus. In diesem Aufbau kann das echte veröffentlichte Fortsetzen ein anderes Fachziel starten. `LearnerService.java:5289`, `:5925`, `:8270`. Eine Korrektur muss zwischen freiwillig gewähltem Fokus und dem aus der damaligen Klausuraktivierung stammenden Fokus unterscheiden. |

## 1. Vollständigkeit

Planstatus und Cockpit berichten die gespeicherte Planung weiterhin als veraltet. Vorschau und Aktivierung prüfen den neuen Entwurf. Die Fehler entstehen bei der Produktion von Frontier, Fachwahl, generischem Fortsetzen und dessen veröffentlichter Aktion. Die Bedingung „Plan definiert heute einen Klausurumfang“ stimmt in den neuen Einzelprüfungen. An ihren Aufrufstellen wird jedoch zusätzlich die Fachauswahl oder ein alter Fokus angewendet. Die Aufrufkarte mit Dateizeilen für Status, Aktivierung, Vorschau, prospektiven Fokus und Handoff steht in beiden Fachgutachten. Eine gesonderte Browser-Interaktion mit dem Cockpit wurde hier nicht als Nachweis verwendet. [Aufrufer und Fundstellen A](reviewer-a.md) · [Aufrufer und Fundstellen B](reviewer-b.md)

## 2. Mischzustände

Das Datenmodell erlaubt pro Lernendem und Landschaft höchstens einen gespeicherten Plan. Zwei Datensätze mit identischer Landschaft waren deshalb kein legitimer positiver Test. Verschiedene Landschaften und ein alter automatisch gesetzter Fokus sind reale Zustände. Im eigenen Vergleich über je 20 Klausuratome blieb das laufende Ziel bei beiden Autopilotwerten erhalten. Nach Setzen eines unbekannten Klausurthemas meldete der Status korrekt `stale=true`. Die gespeicherte Auswahl umfasste weiterhin 20 Klausurziele und die Frontier blieb darin. Nach bewusstem Löschen des gespeicherten Fokus erschien ein Fachziel außerhalb der ehemaligen Klausurmenge. Das ergänzt die oben genannten Gegenproben mit bereits abgeschlossenem einzigen Thema. Pausierte Einheiten haben ihren eigenen Vertragszustand. Die Fachprüfung enthält getrennte Kontrollen für pausierte und erfüllte Aufträge. [Eigener Lauf](raw/root/after-sample6/result.actual.json) · [Mischzustände und Auftragskontrollen](reviewer-b.md)

## 3. Wirkung der früheren Regel

Die Regel aus `0b3452675c` schützte die gewählte fachliche Arbeitsauswahl bei einem ausdrücklich ungültigen Klausurthema. Die beiden Änderungen entscheiden darüber, welche Lernziele als nächstes ausgewählt werden dürfen. Die Prüfungsbewertung, Bewertungsberechtigung, Anrechnung, Erfüllungs- und Mastery-Schreibwege sind davon getrennt. In den eigenen Vorher-/Nachher-Läufen blieb die Mastery beim Lesen und Fortsetzen gleich. Die gültige Klausur bindet in den vier Autorentests weiterhin die sichtbaren Ziele. Prüfungs- und Auftragsgrenzen sollen bei einer Korrektur als negative Kontrollen erhalten bleiben. [Eigener Vorherlauf](raw/root/before-sample6/result.actual.json) · [Nachherlauf](raw/root/after-sample6/result.actual.json)

## 4. Transaktionen

Der fremde Aufruf über den Spring-Proxy und der interne Aufruf im Frontier-Service sind verschiedene Wege. Der untersuchte Clientfehler wird in der Kompatibilitätsprüfung in ein negatives Ergebnis übersetzt. Die bereits geltende Ausnahme für die extern aufrufbare Auflösung bleibt wirksam. In einer wirklichen äußeren Transaktion ergab das unbekannte Thema `false`, der Transaktionsstatus blieb `rollbackOnly=false`. Prüfer B las danach noch den Coach-Kontext, schrieb innerhalb derselben Transaktion und bestätigte die Änderung nach dem Commit durch erneutes Laden. Damit ist für diesen Clientfehler die aus #206 bekannte Falle nicht reproduzierbar. Der Befund trifft keine Aussage zu beliebigen Serverfehlern. [Transaktionsprobe B](reviewer-b.md) · [Eigene Transaktionsbeobachtung](raw/root/after-sample6/result.actual.json)

## 5. Kosten

Je Messung wurde der öffentliche Kontext einmal aufgewärmt. Jeder Schreibversuch verwendet einen frischen Lernenden, eine veröffentlichte Fortsetzungsoption und die aktuelle Revision. Die Zeiterfassung umfasst serverseitige Threads und zählt ausschließlich den Inhalt von `isLearningPlanCompatible`. Die Zeiten sind lokale Beobachtungen aus zwei Wiederholungen pro Autopilotwert.

| Öffentlicher Aufruf | Autopilot | Aufrufe vorher → nachher | Zeit im Kompatibilitätstest vorher → nachher |
|---|---|---|---|
| Coach-Kontext | aus | 4 → 18 | 37–49 → 144 ms |
| Coach-Kontext | an | 4 → 17 | 28–29 → 91–104 ms |
| MCP-Fortsetzen einschließlich Antwortkontext | aus | 12 → 56 | 106–115 → 415–420 ms |
| MCP-Fortsetzen einschließlich Antwortkontext | an | 12 → 53 | 95–102 → 307–318 ms |

Eine Wiederverwendung innerhalb desselben Aufrufs ist angesichts der wiederholten vollständigen Prüfung desselben Plans sinnvoll. Bei einer Änderung von Plan, Personalauswahl oder maßgeblicher Eingabe muss der Wert neu ermittelt werden. Aus den wenigen lokalen Gesamtlatenzen unter paralleler Last lässt sich kein allgemeines Zeitbudget ableiten. Die beiden Gutachter fanden dieselben Aufrufzahlen. [Eigene Messung vorher](raw/root/before-sample7/result.actual.json) · [Nachher](raw/root/after-sample7/result.actual.json)

## 6. Teststärke

Die vier Originalfälle liefen im eigenen Nachherlauf erfolgreich. Der positive Kontrollteil prüft eine tatsächlich begrenzende gültige Klausur. Die spätere Aussage „Frontier ist nicht leer“ unterscheidet jedoch nicht zwischen innerhalb und außerhalb des veralteten Klausurumfangs. Ein aktives Ziel aus dem Personal Curriculum könnte zugleich eines der alten Klausurziele sein. Die ergänzenden Fälle sollten deshalb den bewussten Wechsel außerhalb der alten Menge, einen wirklichen erfolgreichen veröffentlichten Schreibaufruf, den vollständig abgearbeiteten Aktivierungsfokus und zwei tatsächlich gespeicherte Fachpläne prüfen. Die gültige Klausur im anderen Fach muss dabei weiter binden. Ein zusätzlicher Fall braucht ausschließlich inaktive gewöhnliche Lernblöcke im veralteten Plan. Keiner dieser Befunde setzt eine Änderung an Bewertungs- oder Masteryregeln voraus.

Die Rohdaten trennen erfolgreiche Endläufe und frühere Einrichtungsversuche. Die ersten Versuche betrafen die Materialpfadprüfung des isolierten Teststands, die Obergrenze der Testkonfiguration und die gemeinsame Gradle-Berichtsausgabe. Die erste auf den Testthread begrenzte Zählung erfasste den MCP-Thread nicht. Für die Kostenwerte oben wurden ausschließlich erfolgreich ausgeführte öffentliche Operationen mit pro Prüflauf isolierter Ausgabe und prozessweiter Zählung verwendet.
