# #215 · Ein ausdrücklich gewünschtes Fach bei eingeschaltetem AutoPilot

Prüfstand `6852e07203`, Basis `0c743ce7e3`. Die Änderung beseitigt die beobachtete Sperre beim ersten Fachwunsch. Für die wiederholte Wahl eines angebotenen Fachs bleibt ein reproduzierbarer Schreibkonflikt. Beide unabhängigen Reviewer fanden ihn bei der Quellenprüfung. Die unabhängige Laufzeitprobe bestätigt ihn mit beiden AutoPilot-Einstellungen. [Reviewer A](reviewer-a.md) · [Reviewer B](reviewer-b.md)

## 1 · Fachangebot und Start

Bei einer auswertbaren Mathematikklausur ist Physik mit eingeschaltetem AutoPilot am Prüfstand auch dann auswählbar, wenn gerade kein Mathematikziel starten kann. Der erste ausdrücklich benannte Physikschritt wird tatsächlich gespeichert. Die bestehende Prüfung einer veralteten Physikplanung besteht in beiden AutoPilot-Zuständen. Bei zwei auswertbaren Fachplänen führt der benannte Aufruf zum gewählten Fach. Ein aktiver Physik-Einheitenauftrag ist sichtbar, seine Teilewahl bleibt eine eigene Aktion. Die ausdrückliche Wahl des angebotenen Physikteils „Wann überquert der Wagen die rote Linie?“ startet in beiden AutoPilot-Zuständen genau diesen Teil. Ein laufendes fremdes Ziel kann selbst die erste zulässige Vorbereitung im gewünschten Fach sein. Bei geändertem Fokus wird dieser Übergang angenommen. Die Auswahl eines einzelnen Lernziels durch die Person mit ausgeschaltetem AutoPilot bleibt erhalten. [Erste Aufrufe und gespeicherte Ziele](raw/head-run.actual.json) · [Zwei Pläne, Auftrag und laufendes Ziel](raw/additional/observed.actual.json) · [Echte Teilewahl im Chat](raw/additional/unit-part/direct-part.actual.json)

## 2 · „Weiter“ ohne Fach

Die neue Abfrage in `LearnerLearningPlanService.calculateStatus` ergänzt die dem Coach gemeldeten Fächer. Ein ergänztes Fach erzeugt bei bindender Klausur keinen allgemeinen Fortsetzungskandidaten. Beim direkten Vergleich des alten und des neuen Dienstes ergab sich Folgendes.

| Lage | Ohne AutoPilot | Mit AutoPilot |
|---|---|---|
| Klausur kann starten | Beide Stände starten das Mathematikziel | Beide Stände starten dasselbe Ziel |
| Klausur kann noch keinen Schritt starten | Beide lehnen den generischen Aufruf ab, aktives Ziel bleibt leer | Gleiches Ergebnis |
| Zwei auswertbare Klausurpläne | Beide starten das vorgesehene Mathematikziel | Gleiches Ergebnis |
| Bereits laufendes Ziel | Beide lehnen ein zusätzliches generisches Resume ab und behalten das aktive Ziel | Gleiches Ergebnis |
| Aktiver Physikauftrag und Mathematikklausur | Beide starten den Generalschritt der Mathematikklausur | Gleiches Ergebnis |

Die Autorenänderung betrifft weder den Selektor der automatischen Abstimmung noch die Übergabe nach einem bestandenen Lernziel. Der Quellvergleich bestätigt, dass diese beiden Pfade die zusätzliche Liste ausdrücklicher Fachoptionen nicht auswerten. Der Laufzeitvergleich oben benutzt den öffentlichen generischen Resume-Aufruf. [Basiskontrolle](raw/base-control/base-run.actual.json) · [Prüfstand](raw/head-run.actual.json) · [Vergleich der drei weiteren Lagen](raw/additional/observed.actual.json)

## 3 · Gemeldetes Fach und Schreibweg

**Befund mit mittlerer Priorität.** Physik bietet als ersten Schritt die unter der aktiven Mathematikklausur zulässige Mathematikgrundlage `71cec9fb` an. Der erste Fachwechsel startet genau diese Grundlage. Anschließend meldet der Coach Physik weiterhin mit `canContinue=true` und `current=false`. Ein zweiter ausdrücklich benannter Physikwunsch mit frischem Schreibschlüssel liefert `CONFLICT` und fordert dazu auf, den Kontext neu zu laden. Ziel und Lernzustand bleiben gleich. Der Konflikt tritt mit beiden AutoPilot-Werten auf. Für ausgeschalteten AutoPilot tritt er bereits beim Basisdienst auf. Durch die Änderung erreicht auch der eingeschaltete AutoPilot diesen Fall. [Beide Wiederholungen am Prüfstand](raw/repeat-foreign/observed.actual.json) · [Basiskontrolle bei ausgeschaltetem AutoPilot](raw/repeat-foreign/base/observed.actual.json)

Der Status bestimmt das aktuelle Fach aus dem Eigentümerfach des aktiven Ziels. Der Fachwechsel wählt dieselbe gültige Vorbereitung erneut. Die gemeinsame Fassade wertet eine zustandsneutrale Antwort als Fehler. Eine enge Korrektur kann den bereits laufenden, zum gewünschten Fach passenden Schritt erfolgreich bestätigen. Ein Gegenfall mit tatsächlich verschiedenen oder inzwischen unzulässigen Zielen sollte die bestehenden Ablehnungen weiterhin prüfen. [Statusprüfung und Schreibverhalten im Quellvergleich](reviewer-a.md)

## 4 · OpenAI und Gemini

Beide Adapter beziehen den Status aus der gemeinsamen Fassade. Die Prüfung der Adapter und ihrer Verträge ergab keine Erwartung, nach der AutoPilot während der Klausurvorbereitung andere Fächer ausblendet. OpenAI schützt weiter eine bereits begonnene Prüfungsaufgabe vor Unterbrechung. Dieser Schutz gilt für einen eigenen Laufzeitzustand. [Quellstellen und Providerunterschiede](reviewer-b.md)

## 5 · Tests und Abnahme

Die geänderten Integrationstests gehen durch echte MCP-Handler und prüfen das gespeicherte aktive Ziel. Ergänzend deckt das unabhängige Raster generische und ausdrückliche Aktionen in beiden Klausurlagen und mit beiden AutoPilot-Werten ab. Die Zusatzproben behandeln zwei Pläne, Einheitenauftrag und laufendes Ziel. Für die Regression bei erneutem Fachwunsch fehlt im Pull Request die Kombination aus aktivem fachfremdem Vorwissen, schon gleichem Fokus, sichtbarem Fachangebot und zweitem Schreibaufruf. Der erste erfolgreiche Start allein würde diese Abweichung übersehen.

Der Lauf mit 16 Fällen wurde als Spring-/H2-Integrationstest ausgeführt. Der zusätzliche Zustandsvergleich läuft mit zwölf Fällen je Dienst, ergänzt durch acht Basismessungen zum direkten Aufruf und die gezielten Wiederholungsproben. Der Paketinhaber kann den einzelnen Schreibkonflikt getrennt entscheiden. [Prüfbelege und Dateibindungen](independent-review.actual.json)
