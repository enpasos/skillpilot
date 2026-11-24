# Physik E.1 · Lokale Nachprüfung der CI von PR #186, 24. November 2026

Die 1.036 beibehaltenen fachfremden Mathematikzuordnungen führen zum selben frühesten Physikverbraucher und behalten ihren Lernort. Im Vergleich zum zuletzt geprüften Stand mussten 59 von 63 Physik-Quellhashes aktualisiert werden. Alle 100 erzeugten Mathematikansichten stimmen bytegenau mit dem vorherigen Stand überein. In Rheinland-Pfalz sinkt die mathematische Vorbereitung für dieselben 143 Physikziele von 88 auf 85 Atome. Die drei ausgeschiedenen Vektorvoraussetzungen gehören dort weiterhin zum regulären Mathematiklehrplan. Der Nachweis bindet den vollständigen Input und jede einzelne Zeugenfolge. [Beleg und Reproducer](../math-foreign-acquisition-current-v2/README.md)

Auf dem PR-Kopf `aa5ac41808` meldete GitHub vier fehlgeschlagene Jobs. Der lokale Lauf verwendet dieselbe Workflowdatei und die PR-Basis `2a70254ca457b0a13e17246fe065a22660c3cf03`. Er führt auch die in GitHub durch frühere Fehler übersprungenen Fachschritte aus. Die ursprünglichen Fehler, lokale Gegenläufe, native Ausgaben und lokale Entsprechungen der Runner-Einrichtung sind schrittweise erfasst. [GitHub-Lauf](https://github.com/enpasos/skillpilot/actions/runs/45350395787) · [179 Workflow-Schritte](workflow-results.actual.json)

| Befund | Ursache und konkrete Änderung |
|---|---|
| Veraltete Mathematik-Quellhashes | Seit der Prüfung vom 23. November änderten sich Physikansichten und das Angebot der historischen Mehrphasenprüfung. Die erneut belegten technischen Quellhashes wurden aktualisiert. Keine Policyzeile änderte sich. |
| Öffentlicher Physik-Quellenindex | Der erzeugte Index führte eine frühere Beschreibung der Anfangsbedingungen beim Fallvergleich. Die Neuerzeugung behält 421 Einträge byteinhaltlich bei, aktualisiert 21 und erfasst fünf bereits auf `f11676dc4f` belegte weitere Zuordnungen. Der historische Grund für deren Auslassung ließ sich aus den Artefakten nicht ermitteln. |
| Explizite fachliche Routen | Der Test erwartete ausschließlich Sachsen für die Zwei-Messreihen-Aufgabe. Die aktivierten unabhängigen Quellen- und Materialbelege führen Hessen und Sachsen. Der Test verlangt beide Kennungen exakt. |
| Optionales Feld im Materialschema | Die drei Negativfälle setzten voraus, dass das echte hessische Material immer Lernempfehlungen enthält. Sie verwenden jetzt eigene Eingangsdaten. Das ausgelieferte Material enthält keine `studyRecommendations`. Beide Wurfaufgaben verlangen das Wurfziel als Voraussetzung. |
| Browserprüfung der Lernkarte | Pflichtteil B öffnet im tatsächlichen vierteiligen E.1-Baum seinen Kindabschnitt. Der Test ging von der Elternebene aus. Der Gegenlauf prüft den sichtbaren Aufstieg, die vier Kinder, die sechs Aufgaben, den Einstieg in Pflichtteil D sowie die unveränderte Kamera und ausbleibende Lernerschreibvorgänge. Die vorherige Anordnung zur Prüfung des Kameraverhaltens hat eine eigene Teststruktur. Der Ereigniszähler erfasst auch eine echte Aktualisierung, wenn vor der nächsten Abfrage bereits ein zweites Ereignis ankommt. |
| Bestehensgrenzen | Vier geänderte Aufgaben verlangten volle Punktzahl. Die Grenzarbeiten, Gegenbeispiele und die Entscheidungen je Kandidatenfassung stehen im Bewertungsnachweis. [Ursprüngliche Fälle](pass-mark-findings.md) |

### Bewertung der vier Aufgaben

Jede der vier freigegebenen Fassungen erhielt zwei unabhängige fachliche Urteile. Beide Gutachter bewerteten je eine Abgabe mit belegtem Kern und kleinem Fehler sowie eine Abgabe mit fehlendem Kernelement. Die Tabelle nennt die Punkte für diese beiden Abgaben. Alle Fassungen mit Änderungsbedarf bleiben samt Gegenbeispielen erhalten. [Urteile, Abgaben und Dateihashes je Runde](rubric-review-results.actual.json)

| Aufgabe | Bestehensgrenze | Punkte der zwei Grenzarbeiten in beiden Runden | Fachliche Entscheidung |
|---|---:|---:|---|
| Beschleunigte Bewegung, D′ | 19/20 | 19,5 und 18,5 | Das Angebot gilt in Sachsen und Sachsen-Anhalt. Die Aufgabe belegt das einzelne Beschleunigungsziel. Das eigene Experiment, die ganze Einheit und ein hessischer Pflichtteil erhalten daraus keine Anrechnung. |
| Geschwindigkeit als Vektor | 15,5/16 | 15,5 und 13 | Die Arbeit muss beide resultierenden Geschwindigkeiten und einen quantitativ bestimmten Auftreffwinkel liefern. |
| Wurf- und Bremsbewegungen | 15,5/16 | 15,5 und 13 | Die Bewertung erfasst die Parabel und die verschiedenen Beziehungen für Reaktions- und Bremsweg bei beiden Geschwindigkeiten. |
| Zwei Bewegungen zugleich | 35,5/36 | 35,5 und 35 | Aufgabe 6 verlangt in beiden Sprachen die Bedingungen, unter denen der Luftwiderstand vernachlässigt werden darf, und die Folgen außerhalb dieser Bedingungen. |

Die erste reine Rubrikänderung für „Zwei Bewegungen zugleich“ fiel in beiden Runden durch. Zwei vor der endgültigen Übergabe dieses ersten Kandidaten abgebrochene Sessions sind von den Urteilen ausgeschlossen. Bei der Vektor- und der Verkehrsaufgabe sind die Wiederholungen mit vollständigem E.1-Kontext auf identischen Kandidatenbytes getrennt von den ersten Runden dokumentiert. [Originale fachliche Befunde](pass-mark-findings.md)

Der reale H2-Gegenversuch mit der veröffentlichten Vorgängerausgabe erklärt die neue Identität. Bei vollständig gelösten Aufgaben 1 bis 5 und leerer Aufgabe 6 erreichte eine Arbeit 30 von 36 Punkten und bestand die alte Grenze von 22 Punkten. Unter derselben ID erschien anschließend auch die neue freiwillige Prüfung als erledigt. Der Nachfolger `bcc56921` bleibt jetzt offen, bis die aktuelle Aufgabe bestanden ist. Alte Belege bleiben unter `6ea3fb3c`. Die beiden Wurfvoraussetzungen bleiben bestehen. In Hessen zählt weiterhin ausschließlich Pflichtteil D für das Beschleunigungsziel. [Versuch und historische Eingaben](../e1-zb-assessment-identity/README.md)

### Überprüfung von Karten, Bestand und Baufolge

Der Vergleich der amtlichen Länder-Seeds bildet die 64 geprüften neuen Angebotsplätze vor dem Vergleich auf ihre jeweils ursprüngliche Prüfungs-ID zurück. Die historischen Mengengrößen und Fingerprints bleiben wirksam. Der Test deckt auch falsche Rollen und zusätzliche Angebote ab. [Einzelvergleich der amtlichen Inputs und Ansichten](retained-stage-seeds.actual.json)

Der Bildrollout zählt 864 Ziele im aktuellen Physikbestand. Für alle 490 Ziele im Visualisierungsumfang liegen freigegebene Bilder vor. Nach dem Wechsel des ersten freiwilligen Ziels bestand der Test des Einführungsbilds zunächst nur für das frühere Gesamtmaterial. Der Nachfolger bindet das vollständig erhaltene frühere Material und prüft den einen geänderten Verweis an der aktuellen Fassung. [Aktuelle Bindung des Elternmaterials](../../../../curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-planning-release-2026-11-24/zb-successor-voluntary-scope-20261124/scope-successor.actual.json)

Beim lokalen Wiederholen habe ich den Bau der Anwendung und das Kopieren der Laufzeit-Assets sieben Sekunden überlappen lassen. Dabei meldete der Biologie-Renderer für ein Bild eine andere Prüfsumme. Die unveränderte PNG-Quelldatei, beide vollständig kopierten PNG-Dateien und beide gebauten Buchmodelle verwenden übereinstimmend `ef4d1c0f…`. Die abschließende Ausführung trennt die beiden Schritte zeitlich. Die historischen Versuche samt Prüfsummen bleiben in den Schrittbelegen sichtbar.

Beim Öffnen des einzigen Pflichtteils eines Kindabschnitts brach die Kameraberechnung zu früh ab. Der Lesbarkeitstest verlangte bereits 170 Pixel. In der hessischen Grundkursansicht bei 1024×900 maß die ausgewählte Karte 166,48 Pixel. Mit dem bestehenden Fokuspfad für eine ausgewählte Prüfung misst sie 216 Pixel. Der neue Kindfall prüft auch den Erhalt des manuell eingestellten Zooms nach einer Fenstergrößenänderung. [Messwerte der realen Karte und des isolierten Tests](assessment-camera.actual.json)

Beim ersten breiten Backendlauf bestanden 209 von 215 Fällen. Genau die sechs neuen Historienfälle verglichen nach der freiwilligen Prüfung den zurückgekehrten persönlichen Gesamtplan mit dem abgeschlossenen E.1-Auftrag. Die tatsächliche Wiederwahl derselben Einheit bestätigt weiterhin vier von vier Pflichtteilen und ausschließlich D→BES. Der finale Lauf besteht alle 42 ausgewählten Fälle, einschließlich der ursprünglichen 24 Freigabefälle und der Sek-I-Seedprüfung. [Einzelne JUnit-Ergebnisse und vorherige Versuche](backend-replay.actual.json) · [Zuordnung zu den geforderten Testfällen](backend-qualified-cases.actual.json)

Im Transparenzinventar hat sich ausschließlich die Zahl der kanonischen Ziele von 6.679 auf 6.680 geändert. Der offizielle Generator wies genau dieses eine Feld aus. Der reguläre Inventarcheck besteht mit den bisherigen Bild-, Herkunfts- und Kartenangaben.

### Endstand der lokalen Prüfungen

Über die sechs angeforderten Jobabschnitte sind 179 Schritte erfasst. 129 Fach- und Installationsschritte bestanden, 50 GitHub-Einrichtungsschritte wurden lokal nachvollzogen; 0 Schritte sind offen. Die Nachweise nennen für jeden Schritt den Befehl oder die lokale Entsprechung.

| Job | Bestanden | Lokale Einrichtung | Fehlgeschlagen |
|---|---:|---:|---:|
| Curriculum CI | 34 | 0 | 0 |
| Skill-graph and assessment proofs | 20 | 9 | 0 |
| Curriculum integrated build | 10 | 10 | 0 |
| Curriculum package contracts | 17 | 13 | 0 |
| Learning-goal book contracts | 3 | 9 | 0 |
| Application frontend CI | 45 | 9 | 0 |

Die Rechnung für alle 1.036 Mathematikzeugen wurde nach den drei Rubrikänderungen und nach dem Wechsel der freiwilligen Prüfungs-ID erneut ausgeführt. Im letzten Vergleich ändern sich 64 Physikansichten und damit 48 der 63 gebundenen Physik-Quellhashes. Die unveränderten Zeilen stellen dieselben fachfremden Atome am selben Lernort bereit. [Vollständige Berechnung am ZB-Endstand](../math-foreign-acquisition-post-zb/recheck-e795626b9d.actual.json)

Auf den 90 aktuellen Physikansichten mit 356 Zoomschritten treten dieselben 10 verschiedenen Rückkanten auf wie bei der letzten vollständigen Messung. [Messung am Kartenadapter](nested-map-comparison.actual.json)

Die Prüfung verwendet die 22 Originaldateien des GitHub-Artefakts 14901327795 aus dem geprüften Lauf. Der GitHub-Runner-spezifische Speicherplatzschritt ist als lokale Entsprechung ausgewiesen. Das lokale Physikbuch wurde wegen der neuen Physik- und Registereingaben und 60 geänderter Quelldigests in den 70 Atlasansichten neu aufgebaut. Die 489 Atlasziele und alle geprüften curricularen Projektionen sind inhaltlich gleich geblieben. Alle fünf lokalen Publikationsartefakte wurden mit dem regulären Verifier geprüft.
