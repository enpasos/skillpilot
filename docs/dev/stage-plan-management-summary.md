# Management Summary zu Lernfluss und Stufenplänen

Ziel ist die vollständige Umsetzung von **K1–K13 und F1–F7** aus
[PR #156](https://github.com/enpasos/skillpilot/pull/156), integriert auf
`main` mit frischer erfolgreicher CI. Die Agenten verantworten Recherche,
Entscheidungen und Umsetzung; der Product Owner kontrolliert die Ergebnisse.
Der verbindliche Umfang steht in der [Übergabe](stage-plan-units-handover-2026-11-15.md).

Jedes Paket erhält einen datierten Eintrag mit Uhrzeit und Zeitzone, Fortschritt,
Ergebnis und Entscheidungen, Kontrollstellen, Nachweisen, Integrationsstand
und nächstem Schritt. Die Fortschrittszahlen zählen vollständig abgeschlossene
Arbeiten, keine gewichteten Prozentwerte. Entwürfe und Teilreparaturen bleiben
offen. Der neueste Paketeintrag steht oben; sein Zeitstempel wird bis zum
Abschluss aktualisiert. Frühere Abschlüsse bleiben erhalten.

Offene Einträge verweisen auf den PR. Erst der Abschluss nennt den geprüften
Implementierungscommit und den erfolgreichen Main-CI-Lauf. Dessen Jobzahl
wird getrennt von zusätzlichen oder zeitgesteuerten Commit-Checks angegeben.
Ein kleiner Doku-Abschlusscommit oder kurzlebiger Doku-PR ist danach erlaubt;
er erhält die Dokumentationschecks. Die große CI schließt `docs/dev/**` und
`AGENTS.md` bei reinen Änderungen dieser Pfade derzeit aus. Der dokumentierte
CI-Nachweis gilt weiterhin für den benannten Implementierungscommit.

## 25. November 2026, 16:20 MEZ – Sicherung mit nicht lesbarem Lernplan

Eine Sicherung stellt die Lernergebnisse jetzt auch dann wieder her, wenn ein darin enthaltener Lernplan heute nicht mehr lesbar ist. Bisher wies ein solcher Plan die ganze Sicherung ab. Der Plan wird so übernommen, wie die Sicherung ihn enthält, und als veraltet gespeichert; neu gespeichert ist er wieder ein gewöhnlicher Plan. Der Product Owner hat das am 25. November entschieden. Geändert ist nur das Backend. K 0/13 und F 0/7 zusätzlich abgeschlossen, 0 Stufenpläne aktiviert.

**Entscheidungen.** Nicht lesbar ist ein Plan, wenn sich ein Abschnitt oder Klausurthema nicht mehr auflösen lässt, wenn er ein Lernziel nennt, das der Umfang der Lernperson nicht kennt, wenn nichts von ihm übrig ist oder wenn es seine Landschaft im Katalog nicht mehr gibt. Als veraltet gilt er über einen festen Marker anstelle der Curriculum-Kennung, denn die Sicherung enthält nicht, für welches Curriculum der Plan gespeichert wurde. Jede Stelle, die Pläne liest, vergleicht diese Kennung schon heute mit dem gewählten Curriculum; der Plan verhält sich deshalb überall wie jeder veraltete Plan. Ein formal fehlerhafter Plan (fehlende Kennungen, unbekannte Blockarten, fehlende Daten, überschrittene Grenzen) und ein Serverfehler weisen die Sicherung weiter ab, ohne etwas zu ändern. Der Plan eines abgewählten Fachs gehört nicht dazu; er wird wie bisher wiederhergestellt. `AGENTS.md` und `CLAUDE.md` halten außerdem zwei weitere Entscheidungen des Product Owners vom 25. November fest: Die Obergrenze von 85 Prozent für Bestehensgrenzen ist bestätigt, und in Hessen sind die schiefe Ebene mit Trigonometrie und der Reibungskoeffizient eine freiwillige Vertiefung von E.2.

**Zur Sichtung.** Beim Testen zeigte sich ein Fehler, der schon auf `main` besteht und ohne jede Sicherung auftritt: Folgt eine Lernperson Plänen und enthält ihr Plan einen Klausurtag, dessen Thema sich nicht mehr auflösen lässt, endeten die Planliste im Cockpit, der Planstatus, die Fortsetzung und der Coach-Kontext in einem Serverfehler. Dorthin führt zum Beispiel ein Kurswechsel von Grundkurs zu Leistungskurs. Die lesenden Stellen fangen den Fehler der Zielauflösung zwar ab, er hatte ihre Transaktion aber schon als gescheitert markiert. Das ist behoben. Offen bleibt eine Sackgasse, die der Serverfehler bisher verdeckt hat: Mit einem veralteten Plan samt Klausurtag bietet der Coach im Fach kein Lernziel an, solange Plänen gefolgt wird; ohne Klausurtag bleibt gewöhnliches Lernen möglich. [Issue #205](https://github.com/enpasos/skillpilot/issues/205)

**Nachweise.** Zehn Testfälle decken fünf Arten nicht lesbarer Pläne und einen Plan einer unbekannten Landschaft neben einem lesbaren ab, mit und ohne „Plänen folgen“: Das Lernergebnis ist wiederhergestellt, der Plan steht unverändert und als veraltet im Speicher, Planliste, Planstatus, Fortsetzung und Coach-Kontext antworten, eine zweite Sicherung enthält dieselben Blöcke, und neu gespeichert gilt der Plan wieder. Ein weiterer Fall zeigt, dass ein formal fehlerhafter Plan die Sicherung abweist und nichts ändert. Vier Fälle prüfen den Fehler mit dem Klausurtag (Kurswechsel und unbekanntes Thema); ohne die Korrektur scheitern die beiden Fälle mit „Plänen folgen“ an der gescheiterten Transaktion. Lokal bestanden diese 15 Fälle und 125 weitere Tests der fünf betroffenen Testklassen. Die vollständige Backend-Suite und die unabhängige Gegenprüfung stehen noch aus. [Testfälle](https://github.com/enpasos/skillpilot/blob/fix/sicherung-mit-unlesbarem-plan/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java) · [Regel in AGENTS.md](https://github.com/enpasos/skillpilot/blob/fix/sicherung-mit-unlesbarem-plan/AGENTS.md)

**Integration offen.** Die frische erfolgreiche CI auf `main` steht für dieses Paket noch aus. [PR #206](https://github.com/enpasos/skillpilot/pull/206)

## 25. November 2026, 12:36 MEZ – Bestehensgrenze für zwei eigene Fallmessreihen

Die freiwillige Prüfung „Freien Fall in zwei eigenen Messreihen untersuchen“ hat ein neues Bewertungsraster mit der Bestehensgrenze 22 von 26 Punkten (84,6 %) statt 23 von 24. Sie war die letzte der sieben strengen E.1-Prüfungen aus der Vorgabe des Product Owners vom 24. November. Jede der beiden Untersuchungen zählt 13 Punkte: eigene Daten 3, eigene grafische Bestimmung von g 3, Bewegungsgesetz mit dem eigenen Wert 2,5, angegebene Anfangsbedingungen mit Loslassprüfung 2,5, Grenzen der Aussage 2. Im Katalog ist genau diese eine Prüfung geändert; der deutsche Aufgabentext bleibt, der englische nennt jetzt ebenfalls die Absperrung des Fallbereichs. Zusätzlich abgeschlossen sind 0 von 13 K-Zielen und 0 von 7 F-Zielen, es ist kein weiterer Stufenplan aktiviert. [Aufgabenbewertung und Ergebnisse](https://github.com/enpasos/skillpilot/blob/feat/e1-ffx-raster/curricula/DE/Gymnasium/quality/assessment-review/physik/e1-ffx-zwei-messreihen-20261125-v2/README.md)

**Entscheidungen.** Drei Fassungen mit 24 Punkten und der Grenze 20 hatten beide Prüfer zurückgegeben, zuletzt bei völlig gleicher Benotung: Ohne nachgewiesene Anfangsbedingungen in beiden Reihen blieben 21 Punkte erreichbar. Claude hat daraufhin festgelegt, was Bestehen zeigen muss: mindestens einmal die ganze Kette aus eigenen Daten, eigenem g, einem Bewegungsgesetz mit dem eigenen Wert und ausdrücklich angegebenen Anfangsbedingungen mit Loslassprüfung, jedes Glied durch sein Gewicht geschützt. Ein trotz Hinweis als eigenes Ergebnis ausgegebener Literaturwert kostet in der betroffenen Reihe 5,5 Punkte statt der ganzen Reihe. Autor der Rasterfassungen war ein Claude-Modell, benotet haben zwei getrennte GPT-Modelle, jeweils blind. [Gebundene Entscheidung](https://github.com/enpasos/skillpilot/blob/feat/e1-ffx-raster/curricula/DE/Gymnasium/quality/assessment-review/physik/e1-ffx-zwei-messreihen-20261125-v2/accepted.actual.json) · [Geparkter Vorversuch](https://github.com/enpasos/skillpilot/blob/feat/e1-ffx-raster/curricula/DE/Gymnasium/quality/assessment-review/physik/e1-ffx-zwei-messreihen-20261125-v1/README.md)

**Zur Sichtung.** Vier kleine Formfehler ergeben 24 Punkte, fehlende Anfangsbedingungen in einer Reihe 23,5, beides bestanden. Fehlen sie in beiden Reihen, sind es 21, mit zwei fremden Zahlenwerten im Gesetz ebenfalls 21, mit einem beibehaltenen Literaturwert 20,5, jeweils nicht bestanden. Zwei Häufungen scheitern knapp und gewollt: ein fremder Zahlenwert zusammen mit vier Formfehlern (21,5) und fehlende Anfangsbedingungen in einer Reihe zusammen mit einem abweichenden Gesetz in der anderen (21). Hessen E und Sachsen J9 führen die Aufgabe weiter freiwillig in beiden Kursprofilen, ohne hessische E.1-Plananrechnung.

**Nachweise.** Fassung 5 haben beide Prüfer angenommen; 190 von 190 Einzelwerten und 19 von 19 Bestehensentscheidungen stimmen überein. Claude hat den Zweig geprüft: Im Katalog ist genau eine Prüfung geändert, alle zehn Bewertungstexte liegen unter 2.000 Zeichen, die freigegebenen Texte enthalten keine internen Prozessbegriffe, Codex' Prüfprogramme bestätigen beide Nachweisordner, und die Bestehensgrenzen-Regel besteht. Lokal bestanden 21 von 21 Schritten der Prüfkette (Reifegrade Physik M7 und beide Stufen M4, Generatoren, Buch-Eingaben, Prüfungsprojektion, Lernkarten-Tests, Lint, Dokumentation) und die vollständige Backend-Suite mit 3.194 Tests. Die Messung vor und nach der Änderung ergibt in 90 Physiksichten und 356 Lernschritten jeweils dieselben zehn rückwärts gerichteten Beziehungen mit 32 Vorkommen.

**Integration offen.** Die frische erfolgreiche CI auf `main` steht für dieses Paket noch aus. [PR #202](https://github.com/enpasos/skillpilot/pull/202)

## 25. November 2026, 11:11 MEZ – Hessen Physik E.2 in sechs Unterstrukturen

Der hessische Abschnitt „E.2 Newton'sche Axiome und Erhaltungssätze“ ist in sechs Unterstrukturen in Lernreihenfolge gegliedert: Trägheit; Kraft, Masse und Beschleunigung; Kraft und Gegenkraft; mehrere Kräfte zugleich; Energie; Impuls und Stöße. Der Product Owner hat den Zuschnitt am 24. November angenommen. Dies ist der erste von vier Schritten: Er gruppiert nur die vorhandenen Lernziele in den acht hessischen Sichten mit Einführungsphase. Die drei Gravitationsziele und das Leistungskursziel zur Energieerhaltung, das das Potential braucht, liegen jetzt bei E.5. Am Katalog ändert sich nichts. K 0/13 und F 0/7 zusätzlich abgeschlossen, 0 Stufenpläne aktiviert.

**Entscheidungen.** Die Unterstrukturen sind Gliederungen der Sicht, noch keine erklärten Lerneinheiten; Auftaktziele, Abschlusskontrollen und Material folgen in den Schritten 3 und 4. Die vier gemischten E.2-Prüfungen bleiben auf der Ebene von E.2 hinter den Unterstrukturen. Zwei Abweichungen vom angenommenen Zuschnitt: Die beiden Vertiefungen des Leistungskurses bleiben vorerst in der Einführungsphase, weil die Leistungskursprüfung von E.5 beide voraussetzt; ihre Verlegung in die Qualifikationsphase gehört zur Durchsicht von E.5. „Elastische Stöße im Schwerpunktsystem analysieren“ bleibt, bis die gemischten Prüfungen, die es voraussetzen, Nachfolger haben. [Begründung und Beleg](https://github.com/enpasos/skillpilot/blob/feat/e2-zuschnitt/curricula/DE/Gymnasium/quality/learning-units/physics-he-e2-child-structures-2026-11-25/README.md)

**Zur Sichtung.** Unter E.2 stehen sechs Unterstrukturen und vier Prüfungen; in der persönlichen Sicht (G9, Sek II) sieht der Grundkurs alle vier Prüfungen, der Leistungskurs zwei. Für das Timing mit der Mathematik: In den vier Leistungskurs-Sichten liegen sechs Mathematik-Vorbereitungen (Vektoren im Raum, Skalarprodukt, Kettenregel) nicht mehr im gemeinsamen Vorbereitungsbereich der Einführungsphase, sondern bei E.5, dem einzigen Abschnitt der Phase, der sie braucht. Ein vor dem Zuschnitt gespeicherter E.2-Plan bleibt gültig und bietet die verschobenen Ziele an; ein dort laufendes Ziel bleibt in Arbeit.

**Nachweise.** In allen acht geänderten Sichten sind Lernziele, Voraussetzungsziele und Lernmenge identisch zum Ausgangsstand; die übrigen 82 Physiksichten sind bytegleich. Jedes der sechs Ordnungspaare zwischen den Unterstrukturen hat eine direkte Voraussetzung als Zeugen. Alle 1.036 Bedarfsnachweise der Mathematiksichten sind unverändert; sechs gemerkte Prüfsummen hessischer Physiksichten sind erneuert. Zwei unabhängige Prüfmodelle lasen den Zuschnitt und maßen ihn mit eigenen Skripten nach; Codex fuhr den vollständigen Frontend-Job (54 von 54 Schritten). Die Gegenprüfung bestätigte Zuschnitt, Reihenfolge und Lernmengen und fand zwei Dinge: den Verlust eines laufenden Ziels (behoben im Paket darüber) und neun verschobene Lernorte von Voraussetzungen mit 30 Verschiebungen, die mein Beleg nicht nannte (jetzt gemessen und aufgeführt). Der Bestätigungslauf bestand mit 23 von 23 gezielten Läufen, darunter der echte Vorgängerplan mit 32 Zielen. [Gemessene Werte](https://github.com/enpasos/skillpilot/blob/feat/e2-zuschnitt/curricula/DE/Gymnasium/quality/learning-units/physics-he-e2-child-structures-2026-11-25/regrouping.actual.json) · [Unabhängige Gegenprüfung](https://github.com/enpasos/skillpilot/blob/feat/e2-zuschnitt/curricula/DE/Gymnasium/quality/learning-units/physics-he-e2-child-structures-2026-11-25/independent-review/review.md) · [Bestätigungslauf](https://github.com/enpasos/skillpilot/blob/feat/e2-zuschnitt/curricula/DE/Gymnasium/quality/learning-units/physics-he-e2-child-structures-2026-11-25/independent-review/round-2/review.md)

**Integration offen.** Der Zweig setzt auf dem Stand von PR #199 auf. Die frische erfolgreiche CI auf `main` steht für dieses Paket noch aus. [PR #201](https://github.com/enpasos/skillpilot/pull/201)


## 25. November 2026, 10:51 MEZ – Laufendes Ziel nach einer Umgruppierung

Wer gerade an einem Lernziel arbeitet, behält seinen Platz, wenn ein neuer Zuschnitt dieses Ziel aus dem fokussierten Abschnitt verschiebt. Die unabhängige Gegenprüfung des E.2-Zuschnitts fand den Fehler: Mit E.2 als Fokus und einem der nach E.5 verschobenen Gravitationsziele in Arbeit zeigte der Coach die Lernfront statt des laufenden Ziels, und der nächste Abruf des Lernstands löschte den Zeiger. Dasselbe besteht seit dem E.1-Zuschnitt vom 23. November auf `main` für „Physik im Straßenverkehr“ und die Bezugssysteme. Lernergebnisse gingen dabei nicht verloren. Geändert ist nur das Backend. K 0/13 und F 0/7 zusätzlich abgeschlossen, 0 Stufenpläne aktiviert.

**Entscheidungen.** Ein laufendes gewöhnliches Lernziel bleibt erhalten, solange es ein Lernziel des Personal Curriculum im Fach des Fokus ist: Der Coach unterrichtet es weiter und kann es als bestanden buchen. Der gewählte Fokus bleibt, was die Lernperson gewählt hat; Cockpit, gespeicherter Fokus, Navigations- und Abschlussangebote und die Sicherung nehmen das Ziel nicht auf, und es wird nichts geschrieben. Ein Fokuswechsel durch die Lernperson beendet die Arbeit an einem Ziel außerhalb des neuen Fokus wie bisher, und ein neues Ziel lässt sich nur innerhalb des Fokus beginnen. Prüfungen und Kartenstapel sind ausgenommen; für eine Prüfung außerhalb des Fokus gilt weiter ihre eigene Bindung oder die ausdrückliche Wahl ihres Angebots. Der E.2-Zuschnitt setzt auf dieser Korrektur auf, damit beim Ausrollen niemand seinen Arbeitsstand verliert.

**Zur Sichtung.** Mit E.1 als Fokus und „Physik im Straßenverkehr“ in Arbeit zeigt der Coach weiter dieses Ziel, und das Cockpit zeigt weiter nur E.1 als Fokus. Nach dem Bestehen ist E.1 wieder der einzige Bezug. Bewusst nicht abgedeckt ist eine regulär begonnene Prüfung, die ein Zuschnitt später verschiebt; der E.2-Zuschnitt verschiebt keine Prüfung.

**Nachweise.** Zwei unabhängige Prüfmodelle lasen die Änderung in zwei Runden; Codex maß das Verhalten mit eigenen Läufen am echten Dienst. Die erste Fassung nahm das laufende Ziel in den wirksamen Fokus auf. Das stellte die Fortsetzung her, veränderte aber auch den im Cockpit gemeldeten Fokus, die Sicherung, die Navigations- und Abschlussangebote und die Bereinigung eines Prüfungszeigers. Die zweite Fassung erhält das Ziel nur dort, wo es unterrichtet und abgeschlossen wird; der Vergleich der drei Stände zeigt alle übrigen Stellen wieder wie auf `main`, und beide Prüfmodelle geben sie frei (18 von 18 gezielten Läufen, 2.304 Zeitmessungen ohne reproduzierbaren Anstieg). Lokal bestand die vollständige Backend-Suite auf dem Stand mit `main` einschließlich #196 mit 3.195 von 3.196 Tests bei 20 übersprungenen; der eine Test hielt das alte Verhalten fest und ist an die neue Regel angepasst. [Befunde, Korrekturen und Prüfberichte](https://github.com/enpasos/skillpilot/blob/fix/laufendes-ziel-nach-umgruppierung/contracts/stage-plan-review-evidence/2026-11-25/goal-in-progress-after-regrouping/README.md) · [Testfall](https://github.com/enpasos/skillpilot/blob/fix/laufendes-ziel-nach-umgruppierung/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java)

**Integration offen.** Die frische erfolgreiche CI auf `main` steht für dieses Paket noch aus. [PR #199](https://github.com/enpasos/skillpilot/pull/199)

## 25. November 2026, 07:25 MEZ – Alte Lernpläne nach einer Umgruppierung

Ein Lernplan, der vor einem neuen Zuschnitt gespeichert wurde, bleibt gültig, wenn der Zuschnitt Lernziele in einen anderen Abschnitt verschoben hat. Grundlage ist die Entscheidung des Product Owners vom 24. November: Alte Lernpläne bleiben gültig, solange sie noch funktionieren. Die Lücken fielen bei der Vorarbeit zu E.2 auf und bestanden schon auf `main`. Ein vor dem 23. November gespeicherter E.1-Plan galt als veraltet, weil Straßenverkehr und Bezugssysteme seither in E.2 und E.3 liegen. Seine Sicherung ließ sich nicht wiederherstellen, ebenso wenig die Sicherung eines Plans, der neben anderen Zielen eine herausgenommene Prüfung nennt. Geändert ist nur das Backend. K 0/13 und F 0/7 zusätzlich abgeschlossen, 0 Stufenpläne aktiviert.

**Entscheidungen.** Ein bestehender Plan behält ein erfasstes Ziel, solange es ein Lernziel des Fachs im Umfang der Lernperson ist und sein Block dieselben Abschnitte nennt wie der Block, in dem es erfasst wurde. Das gilt beim Lesen, beim Wiederherstellen einer Sicherung und beim Bearbeiten. Ein Block mit einem Abschnitt mehr oder weniger ist eine neue Auswahl und wird wie bisher geprüft. Das verschobene Ziel bleibt planmäßige Arbeit: Das Backend bietet es an seinem Platz im Zeitplan unter seinem eigenen Fokus an, in der Planansicht, beim automatischen und ausdrücklichen Fortsetzen und bei der Übergabe nach einem bestandenen Ziel. Die Übergabe eines gewöhnlichen Plans bewertet jedes Ziel jetzt unter dem Fokus, unter dem es laufen wird, und speichert denselben Einstieg wie das Fortsetzen. Eine Sicherung wird gelesen wie ein gespeicherter Plan: Herausgenommene Ziele entfallen, verschobene bleiben in ihrem Block.

**Zur Sichtung.** Ein E.1-Abschnittsplan von vor dem Zuschnitt erscheint als aktuell mit allen erfassten Zielen. Ist alles andere erledigt, nennt er „Physik im Straßenverkehr“ als nächstes Ziel, und Fortsetzen startet genau dieses Ziel. Nebenbei behoben ist ein Fehler, der auch Pläne ohne Umgruppierung betraf: Stand im Plan eine erst für die Folgewoche geplante Orientierung, übergab das Backend nach einem bestandenen Ziel nicht an das heute fällige nächste Ziel. Offen ist eine Frage an den Product Owner: Eine Sicherung, deren Plan auch heute nicht lesbar ist, wird weiterhin als Ganzes abgelehnt, einschließlich der Lernergebnisse. Zwei schon vorher bestehende Abweichungen zwischen angekündigtem und gespeichertem nächsten Schritt stehen in [Issue #197](https://github.com/enpasos/skillpilot/issues/197).

**Nachweise.** Zwei unabhängige Prüfmodelle lasen die Änderung in drei Runden und einem Bestätigungslauf; Codex maß das Verhalten jeweils mit eigenen Läufen am echten Dienst. Die erste Runde fand, dass der Plan als aktuell galt, sein einziges offenes Ziel aber übergangen wurde und Fortsetzen ein fachfremdes Ziel startete. Die zweite fand, dass sich der Bestandsschutz in zwei Bearbeitungen auf einen fremden Abschnitt übertragen ließ, dazu den Übergabefehler und einen Fehler 409 beim Aktivieren eines Klausurplans. Die dritte fand zwei Folgefehler der Korrektur: einen übersprungenen Einheitenauftakt bei der Übergabe und ein verlorenes Rückkehrziel beim Klausurplan. Alle Befunde sind behoben und mit Tests belegt, die ohne die jeweilige Korrektur mit dem gemessenen Fehlbild fehlschlagen. Im Bestätigungslauf bestanden 58 von 58 gezielten Läufen, und beide Prüfmodelle nehmen den Endstand an. Lokal bestanden die 121 Tests der betroffenen Klassen auf dem Endstand und die vollständige Backend-Suite mit 3.175 Tests auf dem Stand vor der letzten Korrektur. [Befunde, Korrekturen und Prüfberichte](https://github.com/enpasos/skillpilot/blob/main/contracts/stage-plan-review-evidence/2026-11-25/learning-plan-regrouping/README.md) · [Planfälle in Physik](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java) · [Planfälle in Mathematik](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/service/LearnerServiceTest.java)

**Integration abgeschlossen.** [PR #198](https://github.com/enpasos/skillpilot/pull/198) kam am 25. November 2026 um 09:28 MEZ über den Merge-Commit `53fd44c88b` auf `main`; sein Inhalt ist identisch mit dem geprüften Stand `948f2a419d`. Der Push-Lauf auf diesem Commit wurde um 09:42 MEZ abgebrochen, als [PR #196](https://github.com/enpasos/skillpilot/pull/196) folgte. Der frische Lauf auf dem Main-Commit `f63898e9d0`, der beide enthält, endete um 11:05 MEZ mit 14 von 14 erfolgreichen Jobs. [Main-CI](https://github.com/enpasos/skillpilot/actions/runs/45578571852)

## 25. November 2026, 04:54 MEZ – Eigene Fallmessreihen in Physik E.1

Für Lernende gelten weiterhin 23 von 24 Punkten. Beide Einzelurteile zur dritten und letzten Fassung sind dokumentiert. Die vorgeschlagenen 20 Punkte sind nicht freigegeben. Pro Untersuchung sind die eigenen Daten und die Bestimmung von g mit je drei Punkten vorgesehen, das Gesetz mit vier und die Aussagegrenzen mit zwei Punkten. Beide Prüfer benoteten zwölf Abgaben in der ersten sowie je vierzehn in den beiden folgenden Runden. Die unabhängig nachgerechneten Zeitgrenzen des ersten freien Bildes liegen der letzten Runde zugrunde. [Fassungen und Einzelbewertungen](https://github.com/enpasos/skillpilot/blob/feat/e1-ffx-raster/curricula/DE/Gymnasium/quality/assessment-review/physik/e1-ffx-zwei-messreihen-20261125-v1/README.md)

Zur Kontrolle eignen sich die beiden abweichenden Gesetzeskoeffizienten (19 und 19 Punkte), ein abweichender Koeffizient (21,5 und 21,5) und vier kleine Formfehler (22 und 22). Der freiwillige Versuch in Hessen E und Sachsen J9 erhält keine E.1-Plananrechnung. Zusätzlich abgeschlossen sind 0 von 13 K- und 0 von 7 F-Zielen. Es ist kein weiterer Stufenplan aktiviert. [Entscheidungsnachweis](https://github.com/enpasos/skillpilot/blob/feat/e1-ffx-raster/curricula/DE/Gymnasium/quality/assessment-review/physik/e1-ffx-zwei-messreihen-20261125-v1/parked.actual.json)

**Integration.** Der geparkte Vorversuch kommt zusammen mit der angenommenen Fassung auf `main`; siehe den Eintrag vom 25. November 2026, 12:36 MEZ.


## 25. November 2026, 03:25 MEZ – Gemischte E.1-Prüfung „Bewegungsanalyse und freier Fall“ herausgenommen

Die Prüfung, die auf der Lernkarte von E.1 als einzelne Prüfung erschien, ist in allen Ländern herausgenommen. Der Product Owner hatte am 24. November gefragt, ob sie gebraucht wird und in ihren Kontext passt. Sie gab den Fallversuch, den Straßenverkehr und die Tabellenkalkulation als geprüft an, verlangte aber weder einen Versuch noch eine Tabellenkalkulation, und jede ihrer vier Teilaufgaben ließ sich bei 15 von 25 Punkten ganz auslassen. Aufgabe, Lösung und Raster bleiben als Historie im Katalog. K 0/13 und F 0/7 zusätzlich abgeschlossen, 0 Stufenpläne aktiviert.

**Entscheidungen.** Die Prüfung liegt bei den erhaltenen gemischten Prüfungsaufgaben und erscheint in keiner Sicht mehr. Das E.1-Material nennt keine einzelne Abschlussprüfung; die Teile A bis D bleiben, als Einheitenauftrag mit eingeschaltetem Pilot und sonst als gewöhnliche Prüfungen der Untereinheiten. Ein gespeichertes Bestehen bleibt bei der Prüfung und wird nirgends angerechnet. Gespeicherte Lernpläne mit weiteren Zielen laufen ohne diesen Eintrag weiter; ein Plan nur aus dieser Prüfung gilt wie bisher als veraltet. Wer die Prüfung als aktives Ziel gespeichert hat, gilt im Coach als ohne aktives Ziel und erhält die Angebote seiner Einheit; ein Fehler an dieser Stelle ist behoben. Die vier gleich gebauten Prüfungen der Einführungsphase bleiben, bis die Durchsicht von E.2 bis E.4 ihren Lernzielen eigene Prüfungen gegeben hat. [Begründung und Beleg](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/assessment-review/physik/e1-mixed-exam-retirement-20261125-v1/README.md)

**Zur Sichtung.** Die Lernkarte von E.1 zeigt sechs Bereiche: den Einstieg, die vier Untereinheiten und die Lernkarten. Im Coach bietet E.1 die Lernkarten der Einheit an, die Untereinheit „Freier Fall schwerer Kugeln“ weiterhin ihre eigene Prüfung. Sichtbar wird eine Lücke, die schon vorher bestand: Die eigene Prüfung zum Fallversuch gibt es in 13 von 68 Sichten (Hessen, Sachsen, bundesweite Gesamtsicht). In 52 Sichten war die herausgenommene Aufgabe die einzige, die den Fallversuch voraussetzte, ohne je einen Versuch zu verlangen. Für den Straßenverkehr bleibt in 58 von 70 Sichten nur eine gleich gebaute gemischte Prüfung; die eigene Prüfung dazu gibt es in 12 Sichten.

**Nachweise.** In allen 64 betroffenen Physiksichten verlässt nur diese Prüfung die Lernmenge; kein anderes Ziel, auch keines der Mathematik, fällt weg oder kommt hinzu. Die übrigen 26 Sichten sind bytegleich. Alle 1.036 Bedarfsnachweise der Mathematiksichten sind unverändert. Physik bleibt bei M7, beide Schulstufen bei M4, kein Regelstatus hat sich geändert; die Zahl der aktiven Abschlussprüfungen der Oberstufe sinkt von 111 auf 110. Zwei unabhängige Prüfmodelle haben die Änderung am Commit gelesen und mit eigenen Skripten nachgemessen; beide stimmen dem Endstand zu. Die Gegenprüfung und die lokalen Läufe fanden einen Fehler im Coach sowie veraltete Bindungen in den Mathematiksichten und in vier Tests; alles ist behoben. [Gemessene Nebenwirkungen](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/assessment-review/physik/e1-mixed-exam-retirement-20261125-v1/follow-up-checks.actual.json) · [Unabhängige Gegenprüfung](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/assessment-review/physik/e1-mixed-exam-retirement-20261125-v1/independent-review/review.md)

**Integration abgeschlossen.** [PR #194](https://github.com/enpasos/skillpilot/pull/194) kam am 25. November 2026 um 04:55 MEZ über den Merge-Commit `7669426fee` auf `main`; der geprüfte Stand `ae04d42ef9` ist darin unverändert enthalten. Der Push-Lauf auf diesem Commit endete um 06:10 MEZ mit 14 von 14 erfolgreichen Jobs. [Main-CI](https://github.com/enpasos/skillpilot/actions/runs/45543287653)

## 24. November 2026, 22:18 MEZ – Erreichbare Bestehensgrenzen in Physik E.1

Sechs der sieben strengen E.1-Prüfungen haben neue Bewertungsraster. Die Grenzen betragen 17/20 im Beschleunigungsprotokoll D′, 13,5/16 beim Geschwindigkeitspfeil, 12/16 bei Wurf und Bremsweg, 30,5/36 beim freiwilligen Wurf, 11,5/14 beim Fallprotokoll und 20/24 beim außerhessischen Teil C. Zwei unabhängige Fachprüfer benoteten je 36 ausformulierte Schülerarbeiten. In allen sechs neu bewerteten Prüfungen bestanden Arbeiten mit vier kleinen Fehlern sowie Arbeiten mit einer fehlenden Facette. Die Auslassung einer ganzen tragenden Leistung oder eine ausdrücklich beibehaltene Fehlvorstellung führte jeweils unter die Grenze. [Einzelbewertungen und Schülerarbeiten](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/assessment-review/physik/e1-coach-scoring-steps-20261124-v1/README.md)

Für die Sichtung eignen sich die D′-Arbeit mit vier Formfehlern (18/20), die Gewichtung der Modellkritik beim freiwilligen Wurf (19/36) und der offene Herkunftsnachweis beim eigenen Fallversuch. Dessen bisherige Fassung bleibt bei 23/24. Bei der letzten zulässigen Gegenprüfung war uneindeutig, wann eine gleichlautende Zahl im Bewegungsgesetz als Verwendung des eigenen Fitwerts zählt. Claude klärt den Zuschnitt in PR C. Sämtliche Fachaufträge und Kompetenzzuordnungen sind erhalten. [Eigene Fallmessreihen](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/assessment-review/physik/e1-achievable-pass-marks-20261124-v1/f41e4e30-794e-5ce4-ba5e-cc72712cd691/parked.actual.json)

Zwölf zunächst zu lange Bewertungszeilen wurden in den fünf betroffenen Rastern gekürzt und erneut blind benotet. Die automatischen Prüfungen bestätigen Physik M7 und beide Schulstufen M4. Alle 27 Backendtests zur Material- und Ergebnishistorie bestanden. Die 90 Physiksichten und die 1.036 Mathematik-Bedarfsnachweise stimmen mit dem Ausgangsstand überein. Auf 356 Kartenebenen stehen weiter zehn rückwärts gerichtete Kanten mit 32 Vorkommen. Zusätzlich abgeschlossen sind 0 von 13 K- und 0 von 7 F-Zielen. Es sind 0 weitere Stufenpläne aktiviert. [Technische Prüfungen](https://github.com/enpasos/skillpilot/blob/main/contracts/stage-plan-review-evidence/2026-11-24/e1-achievable-pass-marks/README.md)

Bei D′, dem Geschwindigkeitspfeil und der freiwilligen Wurfprüfung sehen Coaches die freigegebene Bewertung jetzt unter neutralen deutschen und englischen Überschriften. Beide Reviewer bestätigten den reinen Bezeichnungswechsel. Der Providerabruf, die gebundenen Buchinputs, die Einheitenprüfung und die Bestehensregel bestanden auf dieser Textfassung. [Sechs Textänderungen und Prüfbelege](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/assessment-review/physik/e1-released-marking-headings-20261124-v1/checks.actual.json)

**Zum Arbeitszweig.** Der Nachtrag zu #186 bildet den ersten Commit auf dem Arbeitszweig. Die Regel aus #190 und der folgende Main-Stand aus #191 sind integriert. Claude hat den Zweig geprüft: Im Katalog sind genau sechs Prüfungen geändert, keine Bewertungszeile überschreitet 2.000 Zeichen, und die Hashbindungen der Nachweise stimmen mit dem Stand überein.

**Integration abgeschlossen.** [PR #193](https://github.com/enpasos/skillpilot/pull/193) kam am 25. November 2026 um 04:01 MEZ über den Merge-Commit `b784ed837a` auf `main`; sein Inhalt ist identisch mit dem geprüften Stand `3e6af47aec`. Der Push-Lauf auf diesem Commit wurde um 04:11 MEZ abgebrochen, als [PR #195](https://github.com/enpasos/skillpilot/pull/195) folgte, und dessen Lauf um 04:56 MEZ, als [PR #194](https://github.com/enpasos/skillpilot/pull/194) folgte. Der frische Lauf auf dem Main-Commit `7669426fee`, der alle drei Pakete enthält, endete um 06:10 MEZ mit 14 von 14 erfolgreichen Jobs. [Main-CI](https://github.com/enpasos/skillpilot/actions/runs/45543287653)

## 24. November 2026, 16:58 MEZ – Alte Lernpläne bleiben gültig, erreichbare Bestehensgrenzen

Nach dem Merge von PR #186 hat der Product Owner zwei Punkte entschieden. Ein gespeicherter Lernplan, der ein zurückgezogenes Ziel nennt, bleibt gültig, solange sein übriger Inhalt funktioniert. Bestehensgrenzen müssen für Lernende erreichbar sein, die alles verstanden haben und gelegentlich kleine formale Fehler machen. Das Paket ändert die Planauswertung im Backend und die Prüfregel für neue und überarbeitete Prüfungen. Lernziele, Prüfungsaufgaben, Sichten und Stufenpläne bleiben unverändert. K 0/13 und F 0/7 zusätzlich abgeschlossen, 0 Stufenpläne aktiviert.

**Entscheidungen.** Das Backend liest einen gespeicherten Plan ohne Ziele, die der Katalog nur noch als Historie führt. Ein Abschnittsblock läuft mit seinen übrigen Zielen weiter, ein Block allein für die zurückgezogene Prüfung wird nicht mehr angezeigt. Gespeicherte Blöcke, Belege und Einzelergebnisse bleiben unverändert. Bleibt von einem Plan nichts übrig, ist er wie bisher veraltet. Für neue und überarbeitete Prüfungen mit Teilpunkten gilt eine Bestehensgrenze von höchstens 85 Prozent der Punkte. Unverzichtbare Leistungen schützt ihr Gewicht im Raster. Die Zahl ist aus den abgenommenen hessischen Teilen A bis D abgeleitet und steht bis zur Bestätigung durch den Product Owner unter Vorbehalt. [Regel in der Graph-Definition](../concept/skill-graph/context-and-views.de.md#sec-exams)

**Zur Sichtung.** Ein älterer E.1-Plan mit der früheren Wurfprüfung zeigt im Cockpit denselben nächsten Schritt wie ein neu angelegter Plan. Die Curriculum-CI nennt 233 Bestandsprüfungen über 85 Prozent, davon 134 mit voller Punktzahl (Chemie 93, Mathematik 84, Physik 56). Sie gelten weiter und werden erst bei einer Überarbeitung blockiert.

**Nachweise.** Lokal bestanden 114 von 114 Fällen der Abschlussrouten, darunter drei Fälle zu gespeicherten Plänen in Grund- und Leistungskurs, 688 von 688 Fällen in 47 planbezogenen Backendklassen aller drei Anbieterspuren und 18 von 18 Fällen der Plandienstklasse. Die Prüfregel besteht ihre drei Tests und den Lauf gegen `main`. [Planfälle](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java) · [Prüfregel](https://github.com/enpasos/skillpilot/blob/main/scripts/check_exam_pass_marks.py)

**Integration abgeschlossen.** [PR #190](https://github.com/enpasos/skillpilot/pull/190) kam am 24. November 2026 um 18:47 MEZ über den Merge-Commit `5653985c13` auf `main`. Der Push-Lauf auf diesem Commit wurde um 19:28 MEZ abgebrochen, als [PR #191](https://github.com/enpasos/skillpilot/pull/191) folgte. Der frische Lauf auf dem nächsten Main-Commit `3d10e3ed60`, der beide Pakete enthält, endete um 20:56 MEZ mit 14 von 14 erfolgreichen Jobs. Die überarbeiteten Raster von sechs der sieben strengen E.1-Prüfungen stehen im Eintrag vom 24. November 2026, 22:18 MEZ. [Main-CI](https://github.com/enpasos/skillpilot/actions/runs/45459841788)

## 24. November 2026, 13:03 MEZ – Physik E.1, Nachprüfung der Fremdfachzeugen und der CI

Alle 1.036 Mathematik-Zuordnungen behalten ihren belegten Ort und frühesten Physikverbraucher. 59 der 63 Physikansichten erhielten neue Quellhashes. In Rheinland-Pfalz entfallen drei Mathematikatome aus der Vorbereitung auf dieselben 143 Physikziele der Sekundarstufe I. Alle drei sind weiterhin reguläre Mathematikziele. Der Abgleich erfasst auch die 24 ausgeschiedenen Plätze der archivierten Mehrphasenprüfung. K 0/13 und F 0/7 zusätzlich abgeschlossen, 0 weitere Stufenpläne aktiviert. Die neue freiwillige Prüfung ersetzt ihre Vorgängerin in denselben 64 Physikansichten. Der aktuelle Kartenvergleich zeigt über 90 Physikansichten und 356 Zoomschritte dieselben zehn Rückkanten. [Vollständiger Zeugenabgleich](https://github.com/enpasos/skillpilot/blob/main/contracts/stage-plan-review-evidence/2026-11-24/math-foreign-acquisition-current-v2/README.md)

**Prüfpunkte.** Der öffentliche Quellenindex zeigt beim Fallvergleich die geprüften Anfangsbedingungen. Die Zwei-Messreihen-Aufgabe ist für Hessen und Sachsen durch das jeweilige Angebot belegt. Auf der hessischen Lernkarte führt Pflichtteil B in „Zwei Bewegungen zugleich“. Über „Eine Ebene auftauchen“ gelangt man zur Übersicht mit vier Kindabschnitten. [Freigabe der Zwei-Messreihen-Aufgabe](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/assessment-review/physik/e1-current-assessments-20261124-v1/ffx-current-applicability.actual.json)

Alle vier geänderten Bewertungsfassungen bestanden zwei unabhängige fachliche Prüfungen. Die beiden Grenzarbeiten der freiwilligen Wurfprüfung erreichen 35,5 und 35 von 36 Punkten. Alte Leistungen bleiben auf der historischen Prüfungs-ID. Das Material behält die vier Pflichtteile und die Planungsanrechnung D→BES. Lokal bestanden 129 von 129 ausgeführten Fach- und Installationsschritten; 50 Runner-Einrichtungsschritte sind als lokale Entsprechungen belegt. Physik erreicht M7, die Sekundarstufen erreichen M4. [Fachurteile und CI-Schritte](https://github.com/enpasos/skillpilot/blob/main/contracts/stage-plan-review-evidence/2026-11-24/e1-curriculum-ci-followup/README.md)

**Integration.** Der Nachweisbranch ist am 24. November 2026 um 13:35 MEZ in PR #186 übernommen. Im zusammengeführten Stand bestanden 595 von 595 Backendfällen in 14 Klassen. Ein gespeicherter Lernplan, der eine abgelöste Prüfungsfassung nennt, gilt als veraltet und wird von der lernenden Person erneuert; gespeicherte Blöcke, Belege und Einzelergebnisse bleiben unverändert. Drei zusätzliche, ebenfalls bestandene Backendfälle halten dieses Verhalten für die frühere Wurfprüfung und die Mehrphasenprüfung fest. **Integration abgeschlossen.** [PR #186](https://github.com/enpasos/skillpilot/pull/186) kam am 24. November 2026 um 16:09 MEZ über den Merge-Commit `29fe0659d9` auf `main`. Die vollständige PR-CI bestand zuvor mit 24 von 24 Jobs. Der frische Push-Lauf auf dem Merge-Commit endete um 17:27 MEZ mit 14 von 14 erfolgreichen Jobs. Seit dem 24. November 2026 bleibt ein gespeicherter Lernplan mit einer abgelösten Prüfungsfassung nach Entscheidung des Product Owners gültig; siehe den Eintrag von 16:58 MEZ. [Main-CI](https://github.com/enpasos/skillpilot/actions/runs/45422164827)

## 24. November 2026, 07:42 MEZ – Physik E.1, unabhängige Nachweise und zurückgestellte LK-Prüfung

Für 490 von 490 gewöhnlichen Physikzielen sind Beschreibungen, Verständnisprofile, Atomarität, Lernkarten und Bilder aktuell geprüft. Die Beschreibungen und Profile der neun betroffenen E.1-Ziele und des schiefen Wurfs erhielten je zwei voneinander unabhängige Prüfungen. Sieben bepunktete Aufgaben wurden fachlich oder sprachlich korrigiert. Der hessische E.1-Auftrag enthält weiterhin vier Pflichtteile. Der Erfolg in Teil D trägt das Ziel zur konstanten Beschleunigung für die Planung. Die übrigen elf Inhaltsziele haben aus diesem Auftrag keine Planungsgutschrift. K 0/13 und F 0/7 zusätzlich abgeschlossen, 0 zusätzliche Stufenpläne aktiviert. [Nachweise und vollständige Anrechnungstabelle](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-11-24/e1-cut-review-report/README.md)

**Prüfpunkte.** Auf der Kindkarte „Freier Fall schwerer Kugeln“ stehen Auftakt und Inhaltsziele jetzt auf derselben sichtbaren Karte. Die hessischen Übungen erklären, was die Lernenden selbst messen und wann sie ein gekennzeichnetes fremdes Messprotokoll auswerten dürfen. Für eine spätere fachlich angenommene Mehrphasenprüfung ist der freiwillige LK-Platz hinter den vier Kindabschnitten vorgesehen. Die alte 18/30-Aufgabe liegt im historischen Container. Beide unabhängigen Urteile zur neuen Aufgabe verlangen eine Überarbeitung der Musterlösung und ihrer Bewertungsregeln. [Materialnachweis](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-materials-2026-11-24/mp-retirement-policy-20261124-v1/no_successor/review.md) · [Aufgaben und Rubriken](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/assessment-review/physik/e1-current-assessments-20261124-v1/README.md)

Physik erreicht M7, die Sekundarstufen I und II erreichen M4. Alle 106 ausgewerteten Sek-I-Kontexte aus 56 Ansichten bestehen CQR-104. Für sämtliche 111 aktiven Abschlussprüfungen ist die vollständige Freigabe und fachliche Abdeckung belegt. Die Physikkarten zeigen in 90 Ansichten und 356 Zoomschritten dieselben zehn Rückkanten wie im vorherigen Stand. Der Goal-Book-Test bestätigt alle 490 gewöhnlichen Ziele und 489 Ziele im nationalen Atlas. Im isolierten Backend-Lauf auf `571769b53a` bestehen 486 von 486 Tests, darunter alle 24 Freigabefälle, der neu berechnete Sek-I-Seed und die sechs Fälle zum Einheitenauftakt. Die eigenständige Prüfung der Untergrenzen für 21 Curricula und zwölf Teilbereiche besteht. [Zählervergleich](https://github.com/enpasos/skillpilot/blob/3896c015af/curricula/DE/Gymnasium/quality/goal-evidence/2026-11-24/e1-cut-review-report/goal-book-route-occurrences.actual.json)

**Integration.** Der Direkteinstieg aus [PR #187](https://github.com/enpasos/skillpilot/pull/187) ist in `main` und im geprüften E.1-Stand enthalten. Die Nachweise und fachlichen Änderungen liegen für Claudes Integration in [Entwurf #186](https://github.com/enpasos/skillpilot/pull/186) bereit. Beides ist seit dem 24. November 2026, 17:27 MEZ abgeschlossen; siehe den Eintrag von 13:03 MEZ. [Qualitätsregeln und Reifegrade](../qa-ci/status/curriculum-quality-status.de.md)

## 24. November 2026, 05:21 MEZ – Direkter Einstieg in eine Untereinheit: Wiederaufnahme korrigiert

Nach der Bestätigung des eigenen Auftakts nimmt ein bewusst aus dem Mathematikfokus gewähltes Physikziel die gewählte Arbeit wieder auf. Die Wiederaufnahme berücksichtigt den echten Voraussetzungenpfad und unterdrückt nur zusätzlich abgeleitete übergeordnete Auftakte außerhalb der gewählten Einheit. Der geführte Weg über Eltern- und Kindauftakt sowie echte offene Voraussetzungen bleiben erhalten. Das Paket ergänzt null Lernziele, Prüfungsaufgaben und Stufenpläne. K 0/13 und F 0/7 sind im Gesamtauftrag vollständig abgeschlossen; dieses Paket wird noch nicht als integriert gezählt. Curriculum und Platzierungen erhalten keine Änderung; eine neue Rücklaufwirkung wird nicht beansprucht.

Zur Sichtung:

- Aus Mathematik direkt eine Physikuntereinheit wählen, ihren Auftakt bestätigen und das ursprünglich gewählte Ziel wiedersehen; Autopilot an und aus vergleichen.
- Dieselbe Arbeit aus der Elterneinheit beginnen: zuerst Eltern-, danach Kindauftakt erhalten.
- Bei einer offenen echten Voraussetzung deren Bearbeitung fortsetzen; der Kindauftakt bestätigt keinen Elternabschluss.

**Automatisierte Nachweise:** 306 Tests in elf Backendklassen bestanden, einschließlich der sechs Fälle im [Einstiegsreview](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/service/UnitIntroductionForeignFocusReviewTest.java) und der 14 [Planungsfälle](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/service/LearnerPlanningScopeServiceTest.java). Die unveränderte ursprüngliche E.1-Regressionsfixture bestand zusätzlich alle drei Fälle mit den Eingabebytes von `bf34d99e7f`. Diese Laufzeitprüfungen sind von fachlichen Aufgabenreviews und persönlichen Lernendenleistungen getrennt.

**Integration abgeschlossen.** [PR #187](https://github.com/enpasos/skillpilot/pull/187) kam am 24. November 2026 um 07:13 MEZ über den Merge-Commit `2a70254ca4` auf `main`. Der frische Push-Lauf auf dem Merge-Commit endete um 08:31 MEZ mit 14 von 14 erfolgreichen Jobs. Der E.1-Schnitt folgte mit PR #186. [Main-CI](https://github.com/enpasos/skillpilot/actions/runs/45338906616)

## 24. November 2026, 04:58 MEZ – E.1-Quellen und Nachweise der Sekundarstufe I

Sechs Befunde des E.1-Schnitts sind unabhängig gegen amtliche Lehrpläne geprüft. Sachsen bestätigt die neue Voraussetzung der Beschleunigungsaufgabe und verortet die eigene Freifallprüfung in Klasse 9. Sachsen-Anhalt kann die vorhandene Beschleunigungsaufgabe anbieten. In Hamburg fehlt ein passender Nachweis. Thüringen führt die Bewegungsgesetze in E10. Mecklenburg-Vorpommern behält in Klasse 9 den Teilbezug zum v(t)-Diagramm. Zwei sächsische Fallvergleichszuordnungen und eine bayerische Zuordnung zu Modellgrenzen sind entfallen. K 0/13 und F 0/7 zusätzlich abgeschlossen, null neu aktivierte Stufenpläne, null neu geschriebene Prüfungsaufgaben. Der Vergleich der 90 aktuellen Physiksichten über alle 356 Vorschau-Schritte zeigt vorher und nachher dieselben zehn rückwärts gerichteten Beziehungen. [Fachprüfungen und Quelldateien](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/assessment-review/physik/stage-source-route-repair-20261117-v1/e1-stage-20261124/README.md) · [Kartenvergleich](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/assessment-review/physik/stage-source-route-repair-20261117-v1/e1-stage-20261124/nested-map-comparison.actual.json)

Zur Sichtung eignen sich die J9-Freifallprüfung in Sachsen, der Unterschied zwischen dem sachsen-anhaltischen und dem Hamburger Übungsangebot sowie das weiter sichtbare bayerische Modellziel in Ph10.3 nach Entfernen seiner letzten dortigen Quellenroute. Der Qualitätslauf weist zwölf offene Physik-Sek-I-Kontexte in Hamburg und Sachsen aus. Physik steht bei M3, die Sekundarstufe I bei M2. **Integration abgeschlossen.** Der Nachweisbranch ist mit [PR #186](https://github.com/enpasos/skillpilot/pull/186) in `main` integriert; siehe den Eintrag von 13:03 MEZ. Die fachlichen Prüfungen für den E.1-Schnitt und die Planungsgutschriften sind darin enthalten. [Qualitätsbericht](../qa-ci/status/curriculum-quality-status.de.md)

## 23. November 2026, 12:14 MEZ – Prüfungen im regulären Lernweg nach dem Wurfthema

Das hessische E.1-Material empfiehlt „Waagerechter Wurf analysieren“ vor Pflichtteil B und vor der freiwilligen Aufgabe zur gemeinsamen Flugzeit. Beide Empfehlungen sind einzeln hinterlegt. Die fachlichen Voraussetzungen, Aufgabenfassungen und Nachweise behalten ihre bisherige Bedeutung. Das Paket ergänzt zwei Empfehlungen und aktiviert null zusätzliche Stufenpläne. K 0/13 und F 0/7 vollständig abgeschlossen. [Material](https://github.com/enpasos/skillpilot/blob/df75a44967e914afcfba5471e21387f1e20b1323/curricula/DE/Gymnasium/materials/physics/he-e1-motion-practice.json)

Zur Sichtung im Zielbaum und in der Lernkarte vom Wurfziel zu beiden Aufgaben gehen. Im Coach bei offenem Wurfthema „weiter“ wählen und zum Vergleich B ausdrücklich direkt versuchen. Der Materialcheck prüft beide Endpunkte in acht hessischen Sichten. Die Projektionsprüfung vergleicht den Baum und beide Leserichtungen der Karte für G8 und G9 in GK und LK. [Lokale Einstiege](hessen-physik-e1-vorschau.md#die-reihenfolge-beim-waagerechten-wurf-ansehen) · [Prüfung der Lernkartenprojektion](https://github.com/enpasos/skillpilot/blob/df75a44967e914afcfba5471e21387f1e20b1323/app/scripts/testHessePhysicsFlashcardActions.ts)

**Integration offen.** [PR #184](https://github.com/enpasos/skillpilot/pull/184) baut auf dem Merge von [PR #183](https://github.com/enpasos/skillpilot/pull/183) auf. Chromium bestätigt die Reihenfolge und den Kartenwechsel bei 1024 × 650 Pixeln für alle vier Profile. Der lokale Claude-Integrationstest bestätigt die ausdrückliche Prüfwahl bei offener Vorbereitung und die automatische Fortsetzung in G8/GK und G9/LK. Nach dem Nachladen eines Kartenstapels misst die Lernkarte die Pfeilanschlüsse erneut. Drei frische Chromium-Sitzungen im G9-LK zeigten die zwei Verbindungen auch nach der Auswahl des Wurfziels. Die fünf lokal ausgeführten Backend-Testklassen bestanden mit 216 Fällen. Die vollständige GitHub-CI und die fachliche Sichtung stehen aus.

## 23. November 2026, 07:52 MEZ – Vom Fallversuch über das Modell zur Prüfung

Für das Ziel „Freier Fall experimentell untersuchen“ kann jedes Profil über das Zahnrad das Paket „Physik mit SimuFísica“ aktivieren. Chromium bestätigte Auswahl, Speichern, Linkanzeige und Abwahl in G8/GK und G9/LK. Der lokale Claude-Adapter liefert die deutsche oder englische Simulation beim aktiven Versuchsziel. Die Messreihe im Chat bleibt verfügbar. [Material und Versuchsanleitung](https://github.com/enpasos/skillpilot/blob/10f9d21bac0fc925960d28f28269f313c84076dc/content/enpasos-simufisica/1.0.0/README.md) · [Vorschau für die persönliche Prüfung](hessen-physik-e1-vorschau.md#die-optionale-simulation-zum-freien-fall-ausprobieren)

Der reguläre Weg beginnt mit dem fallenden Ball. Die Person erstellt ein Höhen-Zeit-Protokoll aus ihrem Versuch oder aus realen Labormessungen, entwickelt das Beschleunigungsmodell und überprüft ihre Vorhersage an einem zurückgehaltenen Messpunkt. Prüfung D verlangt den Transfer auf einen Wagen. Diese vierte Teilprüfung behält ihre Fassung. Der reguläre Weg funktioniert im Coach mit und ohne Autopilot. Im Cockpit und in der Karte stehen die sichtbaren Geschwister in derselben Lernreihenfolge. Das neue Messprotokoll ist ein hessisches Fachziel. Ein zusätzlicher, individuell wählbarer Fachnachweis prüft die Übertragung auf andere Aufzeichnungen. K 0/13 und F 0/7 vollständig abgeschlossen, ein neues reguläres Fachziel, eine zusätzliche Einzelprüfung, null zusätzliche A–D-Teile und null neu aktivierte Stufenpläne. [Fachprüfung zum Messprotokoll](https://github.com/enpasos/skillpilot/blob/10f9d21bac0fc925960d28f28269f313c84076dc/curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-measurement-entry-2026-11-23/fachreview-v2.md) · [Fachprüfung der Modellbrücke](https://github.com/enpasos/skillpilot/blob/10f9d21bac0fc925960d28f28269f313c84076dc/curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-free-fall-2026-11-23/modellbruecke.json)

Zur Sichtung den Zweig „Beschleunigte Bewegung und freier Fall“ im Baum und auf der Lernkarte öffnen, im Coach den Weg mit bereitgestellten Daten erarbeiten und im Lehrplanfenster eine Lerneinstellung bei noch offener Fächerwahl speichern. X und Escape verwerfen dort die ungespeicherten Lerneinstellungen. Im ausgewählten Zusatzmaterialpaket bietet der Coach beim experimentellen Freifallziel das virtuelle Labor in der jeweiligen Sprache an. Die vier Vorher-Nachher-Paare der geöffneten hessischen Physikprofile umfassen auch die verschachtelten Tafeln. Im GK stieg die Zahl der Ziele von 621 auf 623 bei 608 Beziehungen, im LK von 668 auf 670 bei 636 Beziehungen. Die Mathematikvergleiche ergaben je 679 Ziele und 613 Beziehungen. Sämtliche sechs Messpaare hatten vorher und nachher null Stufenrückläufe. Das einzelne Kompetenzurteil, die Browserprüfungen und die persönliche Teilabnahme werden getrennt geführt. [Abnahmeeinstiege](hessen-physik-e1-vorschau.md) · [Fachprüfung des zusätzlichen Nachweises](https://github.com/enpasos/skillpilot/blob/10f9d21bac0fc925960d28f28269f313c84076dc/curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-measurement-entry-2026-11-23/individual-assessment-review-v2.json)

**Integration offen.** [PR #183](https://github.com/enpasos/skillpilot/pull/183) bündelt die Änderung. Die sichtbare Reihenfolge ist in G8 und G9 für GK und LK mit dem Browser geprüft. Die Bildprüfungen bestätigen alle 486 atomaren und 31 aktiven Clusterbilder im Physik-Rollout. Der erneute Vergleich der Mathematik-Voraussetzungen bestätigt 1.036 unveränderte Nachweise in 63 Physiksichten. Im fachweiten Lernweg bleibt die zusätzliche Einzelprüfung freiwillig. Die Materialisierung des aktuellen Qualitätsberichts ergibt für Physik M7. Die automatisierten Nachweise und unabhängigen Fachreviews sind im PR aufgeführt. Der technische Abschluss benötigt die zusammengeführte Fassung und deren vollständige Main-CI. Die fachliche E.1-Teilabnahme liegt beim Product Owner.

## 22. November 2026, 20:57 MEZ – Das Motivationsziel eröffnet die grafische Lernfolge

In E.1 stand „Bewegungen entdecken: vom Tisch bis zum Boden“ neben dem Lernkartenstapel. Bei horizontaler Leserichtung begann das erste Fachziel 270 Layoutpixel weiter links. In der Untereinheit lagen Einstieg und erstes Fachziel auf derselben Höhe in Leserichtung. Die Karte verwendet jetzt das im Material benannte eigene Motivationsziel als ersten Knoten. Vom Knoten „Einstieg“ führen die üblichen durchgezogenen Pfeile zu den ersten Fachschritten. In den Verbindungsdetails ist ihre Bedeutung als geführter Lernweg benannt. Der Prüfungsdirekteinstieg bleibt verfügbar. [Fachkonzept](../concept/skill-graph/learning-unit-motivation-concept-2026-11-17.md)

Zur Sichtung in E.1 die Wege zu den beiden ersten Fachzielen verfolgen und dann „Beschleunigte Bewegung und freier Fall“ betreten. Dort führt „Einen fallenden Ball entdecken“ zum Beschleunigungsziel. Beim Wechsel der Leserichtung steht der Beginn oben. Auf dem Smartphone zeigt der erste Ausschnitt beim Betreten der Einheit den Einstieg. Eine bereits verschobene Karte kehrt zum gewählten Ausschnitt zurück. Der automatisierte Browsertest prüft beide Einheiten in G8 und G9, die tatsächlichen Knotenpositionen und die eingezeichneten Verbindungen. Ein zusätzlicher Test verwendet eine fachunabhängige Karte. K 0/13 und F 0/7 vollständig abgeschlossen. Dieses Paket aktiviert null neue Stufenpläne und ändert keine fachlichen Voraussetzungen, Prüfungsaufgaben oder Lernnachweise. [Vorschauprofile](hessen-physik-e1-vorschau.md) · [Layouttest](https://github.com/enpasos/skillpilot/blob/8771fb34056a061f2e256278d23862f246539527/app/src/components/learningUnitMap/learningScopeLayoutCore.test.mjs)

**Technischer Abschluss.** In der echten Vorschau für G8 und G9 beginnt der geführte Weg in E.1 und ihrer Untereinheit jeweils beim eigenen Einstieg. Horizontal steht er vor den anderen Knoten, vertikal oberhalb. Der Test prüft auch den ersten Ausschnitt auf dem Smartphone und die gezielte Navigation aus Prüfungszielen. Die beiden vollständigen Vorschauprüfungen der Kursarten GK und LK bestanden. [PR #181](https://github.com/enpasos/skillpilot/pull/181) ist mit [Commit 8771fb3405](https://github.com/enpasos/skillpilot/commit/8771fb34056a061f2e256278d23862f246539527) auf `main` integriert. Alle 14 Jobs der [frischen Main-CI](https://github.com/enpasos/skillpilot/actions/runs/45056321154) waren erfolgreich. Die persönliche fachliche Teilabnahme steht aus.

## 22. November 2026, 20:57 MEZ – In der Einheit lernen oder direkt zur Prüfung gehen

**Lernen starten** und **Direkt zur Prüfung** stehen nebeneinander. Beim Einheiteneinstieg stehen sie unter dem Motivationsbild, bei ausgewähltem Fachziel oben im Cockpit. Die Prüfungsteile erscheinen nach dem Öffnen der Prüfungsauswahl. In der grafischen Lernkarte steht der gesamte Platz unter der Kopfzeile für den Graphen zur Verfügung. Bei eingeschaltetem **Nach Plan lernen** ist die Verwaltung der Einheitenaufträge im Lernplan erreichbar. Wer das Cockpit schließt oder ein Gespräch mit dem Coach unterbricht, kann später am gespeicherten Stand weiterarbeiten. Das bewusste Verlassen eines Prüfungsversuchs und das Pausieren eines gespeicherten Einheitenauftrags haben weiterhin ihren jeweils eigenen Zweck. [Lernplanvertrag](../concept/didactic/unified-learning-plan-status.md)

**Zur Sichtung.** In E.1 und der Untereinheit den Coach-Einstieg und die Prüfungsauswahl öffnen. Ein Profil mit zwei bestandenen Teilen verlassen und erneut öffnen. Einen Einheitenauftrag im Lernplan pausieren und reaktivieren. Die Tests vergleichen das aktive Ziel, den Prüfungsstand und die gespeicherte Revision. Der Claude-Test prüft die angebotenen Aktionen auf Deutsch und Englisch. K 0/13 und F 0/7 vollständig abgeschlossen. Dieses Paket ändert die Navigation. Es führt null neue Stufenpläne, Lernziele oder Prüfungsaufgaben ein. Der Browsertest prüft auf Desktop und Mobilgerät, dass die Zeichenfläche direkt an die Kopfzeile und unten an die Kartensteuerung grenzt. Im E.1-Leistungskurs zeigt die Karte bei 1024 Pixeln Breite die Wurfprüfung mit ihren benachbarten Pflichtteilen, auch wenn eine freiwillige Prüfung weiter entfernt liegt. Die zuletzt gemessenen Stufenrückläufe sind im Eintrag vom 22. November um 14:04 MEZ dokumentiert. [Vorschauprofile](hessen-physik-e1-vorschau.md) · [Browsertest](https://github.com/enpasos/skillpilot/blob/af727a6aeaeb13eea4a823cc27670251a2172bfb/app/scripts/testLevelCompletionBackendBrowser.ts)

**Technischer Abschluss.** Alle 57 Servicefälle, vier Spring-Browsertests und 13 Tests der Claude-Projektion bestanden lokal. Die vollständigen Browsertests der echten Vorschau bestanden für G8 und G9 in beiden Kursarten. Die Karte einschließlich ihrer eigenen Zoomsteuerung füllte auf Desktop (1440 × 900) und Mobilgerät (390 × 844) den Raum zwischen Kopfzeile und Fensterrand. [PR #180](https://github.com/enpasos/skillpilot/pull/180) ist mit [Commit af727a6aea](https://github.com/enpasos/skillpilot/commit/af727a6aeaeb13eea4a823cc27670251a2172bfb) auf `main` integriert. Alle 14 Jobs der [frischen Main-CI](https://github.com/enpasos/skillpilot/actions/runs/45046429973) waren erfolgreich. Die persönliche fachliche Teilabnahme steht aus.

## 22. November 2026, 14:04 MEZ – Eigener Auftakt für E.1 und den freien Fall

Die geführte Arbeit in einer Einheit beginnt mit ihrem eigenen atomaren Motivationsziel. Ein Bild, die Leitfrage, die Themen und das Lernversprechen gehören zum Einstieg. Die Person kann eine Vermutung äußern oder nach dem Rückblick den Abschluss wählen. Der direkte Prüfungsversuch bleibt verfügbar. Persönlicher Abschluss und fassungsgebundene Anrechnung werden getrennt ausgewertet. Die vier Prüfungen des Einheitenauftrags behalten ihre Aufgaben- und Rasterfassungen. [Entscheidung und Lernwege](../concept/skill-graph/learning-unit-motivation-concept-2026-11-17.md)

**Zur Sichtung.** E.1 an der Tischkante beginnen, direkt in den freien Fall wechseln und anschließend ein Profil mit bestätigtem Einstieg öffnen. Die zwei Motive und ihre Texte sind unabhängig für den motivierenden Einstieg freigegeben. Der Vergleich mit Prüfungsteil B und dem Kerncurriculum ist im Fachentscheid dokumentiert. K 0/13 und F 0/7 vollständig abgeschlossen, zwei neue Orientierungsziele, null zusätzliche Stufenpläne. In den tatsächlich geöffneten G8- und G9-Karten kamen genau die beiden Motivationsziele hinzu. Der GK stieg von 619 auf 621 Ziele bei 608 Beziehungen. Der LK stieg von 666 auf 668 bei 636 Beziehungen. Die Mathematikvergleichskarte behielt 679 Ziele und 613 Beziehungen. In allen sechs Messpaaren einschließlich der verschachtelten Einheiten gab es vorher und nachher null Stufenrückläufe. Die hessische Bindung der beiden eigenen didaktischen Auftakte ist geprüft. Der kanonische Physikstatus bleibt M7, die zwölf geschützten Routen erfüllen ihre Qualitätsgrenzen. [Fachentscheid](https://github.com/enpasos/skillpilot/blob/48f63d2f9a/curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-guided-entry-2026-11-22/fachreview.md) · [Vorschauprofile](hessen-physik-e1-vorschau.md)

**Technische Prüfung.** 97 Lernplantests bestanden, darunter die unveränderte Terminzuordnung bestehender Einzelpläne. 29 gezielte Material-, Freigabe- und Coach-Vertragstests bestanden. Die vollständige Claude-Vertragstestsuite für die Abschlusswege bestand alle 76 Fälle einschließlich direktem Prüfungsstart, Rückkehr und freiwilligem Einzelweg mit offenen Voraussetzungen. Im Browser blieb ein bewusst gewähltes Physikziel bei zwei Neuladungen im selben Tab bis zum Coach-Start erhalten. Der Wechsel zu einem anderen Ziel oder Profil verwarf die alte Wahl. G8 und G9 bestanden diese Prüfung jeweils im GK und LK. Ein fachfremdes Informatikbeispiel prüft die allgemeine Anordnung neuer Auftakte mit 13 Negativfällen. Ein weiteres Beispiel prüft die mögliche fassungsgebundene Anrechnung eines Motivationsziels. Für die beiden hessischen Einstiege ist keine solche Freigabe hinterlegt.

Auf dem Handy konnte die Karte nach dem Öffnen des freien Falls selbsttätig zu E.1 zurückspringen. Der noch ausstehende Kartenbefehl für Prüfung B wurde nach der ausdrücklichen Wahl der Untereinheit erneut ausgeführt. Mit der Korrektur blieb der freie Fall in 36 von 36 Wiederholungen bei 390 Pixeln in G9/LK geöffnet, bis die Person selbst wieder zu E.1 wechselte.

Die beiden englischen Originalprompts liegen unter den kanonischen Dateinamen des Bildkatalogs. Die Bildprüfung bestätigt 2.577 Verweise in 21 Landschaften. Sechs hessische Physikansichten erhielten durch den Einstieg neue Datei-Fingerabdrücke. Für die Mathematikplanung wurden alle 1.036 Nachweise, welches Physikziel eine mathematische Vorbereitung benötigt, aus den aktuellen Ansichten erneut hergeleitet. Sie ergeben dieselben 47 Mathematikziele und dieselben Zuordnungen. Die beiden neuen Orientierungsziele gehören zu den acht vorgesehenen Hessen-Ansichten. Der Vergleich mit den historisch gebundenen Zielmengen berücksichtigt die beiden Ergänzungen ausdrücklich und prüft die bisherigen Lernziele und Vorbereitungen weiterhin gegen ihre Belege.

Wer eine Klausurvorbereitung mit zwölf selbst gewählten Zielen fortsetzt, erhält bei Bedarf den zum Ziel gehörenden Auftakt. Danach folgt das gewählte Ziel oder die noch benötigte fachliche Vorbereitung. Die zwölf ursprünglichen Ziele, ihre Termine und die Tagesquote bestimmen weiterhin den Auftrag. Ein separat fälliger Auftrag bleibt beim Pausieren des Einheitenauftrags erreichbar. Im kanonischen Physik-Curriculum ohne Hessen-Ansicht und in der bayerischen Ansicht bleibt die Diagrammarbeit mit den zugehörigen Vorkenntnissen erreichbar. Die 16 Klausurvorbereitungsfälle prüfen unter anderem die Auswahl bei überlappenden Terminen und die Rückkehr nach dem Eltern- und Kindauftakt. Der gebündelte lokale Backendtest auf dieser Fassung bestand alle 535 Fälle in 14 Testklassen. Der Vergleich der gespeicherten Einzelwerte prüft die genauen Zielkennungen und Werte unabhängig von der Reihenfolge, in der die Datenbank sie zurückgibt. Die beiden vollständigen Browserläufe für G8 und G9 im GK und LK bestanden erneut.

**Technischer Abschluss am 22. November 2026, 14:04 MEZ.** Die vollständigen Browserläufe bestanden für G8 und G9 jeweils im Grund- und Leistungskurs. Sie prüften den Einstieg in E.1 und den freien Fall, die Rückkehr zum gewählten Fachziel, den Lernplan, die Häkchen und den direkten Prüfungsversuch. Der Nachbarzielwechsel gelang auch bei 1024 Pixeln. Die PR-CI auf `ae1dca0021` bestand alle 14 Jobs. Nach der Integration bestanden alle 14 Jobs der frischen Main-CI auf `57ad76a099`. Die beiden dauerhaften Vorschauen stehen für die persönliche E.1-Teilabnahme bereit. Die Erprobung in einem gehosteten Claude-Chat und die persönliche Teilabnahme stehen aus. Anschließend folgen die weiteren Einheiten der E-Phase und Q1–Q4. [PR #179](https://github.com/enpasos/skillpilot/pull/179) · [PR-CI](https://github.com/enpasos/skillpilot/actions/runs/45012285134) · [Integrierter Commit](https://github.com/enpasos/skillpilot/commit/57ad76a09918dcaa1c5618903eca3982129cc20a) · [Main-CI](https://github.com/enpasos/skillpilot/actions/runs/45018113633)

## 22. November 2026, 03:24 MEZ – Übungsziel während des Nachladens der Lernkarte

Die mobile Kartenprüfung sucht das Wurfziel, während die angeforderten Lernkarten noch ausstehen. Sie prüft die eigene Übung vor der Antwort und nach der Neuanordnung. Beim Nachladen konnte die Zeichenfläche kurz leer sein. Mit den regulären Schriftdateien war die Schaltfläche danach über 120 Bildschirmaktualisierungen vollständig erreichbar und 48 × 44 Pixel groß. Zur Sichtprüfung kann man bei 390 Pixeln das Wurfziel suchen, die eigene Übung per Tastatur öffnen und die Selbstkontrolle aufrufen. [Ursprünglicher Fehljob aus #177](https://github.com/enpasos/skillpilot/actions/runs/44959612753/job/137021395037) · [Korrigierter Browsertest](https://github.com/enpasos/skillpilot/blob/2778ea14621dc8ef6514025de4c1d33e1792cea2/app/scripts/testHessePhysicsMemoryUi.ts)

Zwei getrennte Negativproben ließen den korrigierten Test wie erwartet scheitern. Eine zusätzlich auf der Teilkarte gezeigte fremde Übung ergab zwei statt einer. Bei entfernter eigener Übung konnte der Test die erforderliche Schaltfläche nicht erreichen. Der vollständige lokale Lernkartentest, TypeScript und ESLint bestanden. Die Änderung betrifft ausschließlich den Browsertest. K 0/13 und F 0/7 vollständig abgeschlossen, 0 zusätzliche Stufenpläne. Die letzte Messung der Stufenrückläufe steht bei #177. Die persönliche E.1-Teilabnahme bleibt der nächste fachliche Schritt.

**Technischer Abschluss am 22. November 2026, 03:24 MEZ.** [PR #178](https://github.com/enpasos/skillpilot/pull/178) bestand auf `2778ea1462` die [vollständige PR-CI](https://github.com/enpasos/skillpilot/actions/runs/44963885351) mit 14/14 Jobs. Der [Main-Commit `e958f089c4`](https://github.com/enpasos/skillpilot/commit/e958f089c4ae8662043011502273ab7cd3944560) bestand die [frische Main-CI](https://github.com/enpasos/skillpilot/actions/runs/44969487129) mit 14/14 Jobs.

## 21. November 2026, 20:59 MEZ – Fachwahl, Auftragspause und freiwillige Wege nach E.1

Die Fachwahl im Coach folgt den ausdrücklich gewählten Fächern. Eine mathematische Grundlage kann innerhalb des Physikwegs drankommen. Zum Wechsel in einen eigenständigen Mathematikplan muss Mathematik im persönlichen Curriculum gewählt sein. Eine Pause löst die Bindung an den E.1-Auftrag. Bei 2/4 bleiben C und D erhalten. Nach 4/4 bleiben alle elf Einzelwege wählbar. Ein weiterer fälliger Auftrag behält Vorrang. Claude kann die verfügbaren Wege auch bei mehreren abgeschlossenen Aufträgen seitenweise lesen und eine Wahl anhand von Titel, Seite und aktuellem Lernstand ausführen.

**Kontrollstellen für die persönliche Teilabnahme.** Im 2/4-Profil den Auftrag pausieren und in Physik weiterlernen. Im 4/4-Profil den Versuch zum freien Fall als Einzelweg wählen. Bei 1024 × 650 Pixeln die beiden Zielkarten zum senkrechten und waagerechten Wurf unten rechts anwählen. Die bedienbare Übersicht steht unter der Zeichenfläche. [G8 im Grundkurs](http://localhost:5231/auftraege/G8) · [G9 im Leistungskurs](http://localhost:5233/auftraege/G9) · [Prüfanleitung](hessen-physik-e1-vorschau.md)

**Fachliche und technische Nachweise.** Im unabhängigen Review des Ausgangsstands ließen sich alle 44 freiwilligen Wahlen ausführen, elf je G8-/G9-Kursprofil. Bei den zwei eigenen Versuchen beurteilt der Coach die Messung anhand von je vier Kriterien. Das vorhandene Fachreview bindet Aufgaben und Kriterien in beiden Sprachen. Das neue Materialschema prüft die Form der fünf Übungen. Der Vertragscheck vergleicht in allen sechs Vertragsansichten die tatsächlich angebotenen Prüfungen abzüglich der freiwilligen mit den vier Pflichtteilen. In drei LK-Ansichten erkennt ein Negativtest die fälschlich verpflichtende Mehrphasenprüfung. Die datierte Pilotregel erhält auch bei älteren Abschnittsplänen eine eigens einzeln ausgewählte Zusatzprüfung. [Materialvertrag](https://github.com/enpasos/skillpilot/blob/8e228a22a5/contracts/unit-learning-material/v1/README.md) · [Gebundenes Fachreview der Versuche](https://github.com/enpasos/skillpilot/blob/289a53e091619013e0261a47669eb54b1250c1fd/curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-individual-experiments-2026-11-21/fachreview.md) · [Qualitätsstand](../qa-ci/status/curriculum-quality-status.de.md)

K 0/13 und F 0/7 vollständig abgeschlossen. Dieses Paket aktiviert 0 zusätzliche Stufenpläne. Der nächste fachliche Schritt ist die persönliche E.1-Teilabnahme in G8 und G9. **Technischer Abschluss am 22. November 2026, 01:44 MEZ.** Die [PR-CI](https://github.com/enpasos/skillpilot/actions/runs/44952333602) auf `1045eb1ce8` bestand alle 14 Jobs. Die [frische Main-CI](https://github.com/enpasos/skillpilot/actions/runs/44959612753) des [integrierten Commits `6627d717a2`](https://github.com/enpasos/skillpilot/commit/6627d717a237c3f9bd7e15d0353f3008edc6f25f) schloss im zweiten Versuch mit 14/14 erfolgreichen Jobs ab. Beim ersten Versuch standen 13/14 Jobs auf Grün. Der [Frontendjob](https://github.com/enpasos/skillpilot/actions/runs/44959612753/job/137021395037) hatte die Wurfübung gefunden und beim Nachladen des Kartenstapels auf der kurz leeren Zeichenfläche null Übungen gezählt. Die [einmalige Wiederholung desselben Jobs](https://github.com/enpasos/skillpilot/actions/runs/44959612753/job/137034452230) bestand auf unverändertem Commit. Eine getrennte physische Browserprobe hielt den Zeitpunkt des Deckladens fest und erreichte anschließend dieselbe 48 × 44 Pixel große Schaltfläche. [#178](https://github.com/enpasos/skillpilot/pull/178) prüft die eigene Übung und ihre Trefferfläche vor und nach diesem Übergang getrennt. Die beiden lokalen Chromium-Läufe auf `1045eb1ce8` bestätigten im Grundkurs 54 und im Leistungskurs 56 G8/G9-Szenarien sowie je eine Mathematikkontrolle. Für die 38 temporären Profile wurden 64 synthetische Prüfungsbelege regulär bewertet. Drei Backend-Testklassen bestanden 104 Prüfungen zu Lernplan, Lernbasis und Anrechnung. [Browserprüfer auf dem getesteten Stand](https://github.com/enpasos/skillpilot/blob/1045eb1ce8b766ce78247a4199e938b83b849f6a/app/scripts/checkHesseE1Preview.mjs)

Die unabhängige Gegenprobe mit Microsoft Edge unter Windows 11 umfasste sechs frühere und zwölf neue Bildschirmaufnahmen. Bei 1024 × 650 Pixeln waren beide zuvor verdeckten Ziele in G8/G9 und GK/LK anklickbar. Das Mausrad funktionierte auf allen geprüften Breiten. Die Mathematikkarte startete bei 100 % und zeigte nach dem Einpassen alle 18 Knoten bei 69 %. Im Strukturvergleich von `4db7f10264` zum produktgleichen Kartenstand `b1a26b6ed9` blieben einschließlich der Untereinheiten je G8-/G9-Projektion 619 Ziele, 72 Einheiten und 608 Beziehungen im GK sowie 666/72/636 im LK erhalten. Für Mathematik waren es 679/62/613. In jeder Projektion gab es vorher und nachher null Rückläufe.

Beim isolierten Start des Mathematikpakets mit dem Vertrag v1.3 bestanden alle 15 Funktionstests und die Browserprüfung. Der historische v1.0-Browserprüfer verlangte beim Seitenaufruf zusätzlich die öffentliche Closure-URL. Mit demselben v1.0-Paket meldete er am vorigen Hauptstand `fa395657f8` und auf `1045eb1ce8` den Gesamtstatus `failed`. An beiden Ständen bestanden die 15 Funktionstests, und die öffentliche sowie die lernergebundene Closure-Anfrage lieferten HTTP 200. [Integrations-PR #177](https://github.com/enpasos/skillpilot/pull/177)

## 21. November 2026, 14:38 MEZ – Eigene Messungen an den beiden praktischen E.1-Lernzielen

Im regulären Cockpit zeigte die Vorlage auf `fb97963d26` nach A–D in allen vier hessischen G8-/G9-Kursprofilen zwei individuell offene Versuchsziele. Die im Fachtext zitierte Geschwindigkeitsprüfung ist ein Entwurf zur Diagrammauswertung. Die Prüfung mit zwei eigenen Fallmessreihen ist für Sachsen freigegeben. Der in Hessen angebotene Videoanalyseversuch bewertet eigene Bewegungsaufnahmen an anderen Ziel-IDs. Der Product Owner hat festgelegt, dass A–D den E.1-Auftrag anhand bereitgestellter Daten abschließen. Für die eigenständige Versuchsdurchführung gibt es jetzt zwei fakultative Arbeitsaufträge an den vorhandenen atomaren Zielen.

**Fachliche Sichtung.** Beim fahrenden Wagen eine Messung für die Kontrolle zurückhalten und prüfen, ob die Vorhersage mit dieser Messung vereinbar ist. Beim Fallversuch aus einem selbst aufgenommenen Video oder einer Sensormessung die Fallbeschleunigung bestimmen. Danach an Achsen, Anfangsbedingungen und Messgenauigkeit erklären, warum der Wert von 9,81 m/s² abweichen kann. Die Karten und der lokale Claude-Coach beziehen Aufgaben und Kriterien aus derselben Materialfassung. [Prüfanleitung für die beiden Versuche](hessen-physik-e1-vorschau.md#zwei-eigene-versuche)

**Fachreview und Prüfnachweise.** Ein unabhängiger KI-Fachreviewer hat beide deutsch-englischen Aufgaben mit den atomaren Zieltexten und der hessischen Originalquelle abgeglichen und je eine erfüllende und eine unzureichende Beispielabgabe durchgerechnet. Der Fachentscheid bindet beide Aufgaben einschließlich Kriterien separat per SHA-256. Vier lokale Integrationstests prüfen in den konkreten G8- und G9-Profilen für GK und LK die tatsächlich publizierten Kriterien an beiden aktiven Zielen. Hierfür wurden synthetische Lernprofile und der reguläre Claude-MCP-Handler mit simulierter Anmeldung verwendet. [Fachentscheid und durchgerechnete Abgaben](https://github.com/enpasos/skillpilot/blob/289a53e091619013e0261a47669eb54b1250c1fd/curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-individual-experiments-2026-11-21/fachreview.md)

**Einzelweg nach A–D.** Der Lernplan bietet elf individuell offene Fachziele zur Wahl. Beim vorigen Stand erforderte der Start der beiden praktischen Ziele zwei weitere Schritte im Baum und auf der Zielkarte. In den vier G8-/G9-Profilen von GK und LK ließen sich nun beide Versuche vom Lernplan aus lesen und die zugehörigen Ziele direkt beginnen. Im strikten Modus führte der Klick zur tatsächlich angebotenen Voraussetzung. Das Öffnen der Arbeitsblätter und der Start ließen die vier bestehenden Belege und die Einzelmastery unverändert. Am lokalen Claude-Adapter deckte die Gegenprobe eine zweite Einschränkung auf. Von elf ausführbaren Einzelwegen veröffentlichte er acht. In der Liste fehlten die Bezugssysteme, die Analyse des waagerechten Wurfs und die Sicherheitsabstände im Straßenverkehr. Der korrigierte Adapter veröffentlicht alle elf Auftragsziele innerhalb seiner bestehenden Obergrenze von 24 Wahlmöglichkeiten. Der reguläre Claude-Handler startete im G8-GK den freien Fall und im G9-GK die Geschwindigkeitsmessung. Im strikten G9-Fall startete der Coach die angekündigte Voraussetzung. Zudem blieben in jedem der vier öffentlichen Abnahmeprofile sämtliche elf serverseitigen Einzelaktionen erreichbar. [Geprüfte Implementierung](https://github.com/enpasos/skillpilot/commit/a490f8a9080426207c21fb5cda74b5e74a16f22e)

**Wurf- und Wagenprüfung auf der Karte.** In Windows Edge konnte man bei 1024 × 650 Pixeln auf die Wagenprüfung klicken. Die über der Grafik schwebende Zoomleiste verdeckte jedoch 49 × 4,5 Pixel in der zweiten Titelzeile „rote Linie?“. Auf dem Desktop teilen sich Zoomleiste und Kartenhinweis jetzt eine eigene Zeile unter der Zeichenfläche. Bei 1024 × 650, 1024 × 900 und 1440 × 900 Pixeln blieben in G8 und G9, jeweils für GK und LK, der Titel und die Typangabe von A, B und dem Verweis auf C frei. Ein direkter Klick auf A öffnete den Wagenversuch. Die Mathematiktafel Q1.3 startet weiter bei 100 % mit acht gerenderten Knoten. Beim ausdrücklichen Einpassen stehen alle 18 Knoten bei 71 % auf dem Bildschirm. Die mobile Suche führte bei 390 Pixeln Breite zur Wagenprüfung. [Karten selbst vergleichen](hessen-physik-e1-vorschau.md#zwei-karten-vergleichen)

**Häkchen am eigenen Versuch.** Ein gesondertes G8/GK-Testprofil hat beide Versuche nacheinander durchlaufen. Die simulierte fachliche Bewertung zweier Messprotokolle verwendete den gewöhnlichen Claude-Schreibweg. Vor der Bewertung trug jedes gewählte Ziel das Aktivsymbol. Nach dem ersten eigenen Ergebnis wurde der freie Fall grün, nach dem zweiten auch die gleichförmige Bewegung. Die Zahl der einzeln offenen Fachziele sank von elf auf zehn und neun. Die beiden grauen Anrechnungen und die vier fassungsgebundenen Prüfungsbelege blieben bei beiden Schritten erhalten.

**Technische Prüfung.** Auf dem Kartenstand `4db7f10264` liefen beide vollständigen Browserprüfungen erfolgreich durch. Sie bestätigten im GK 55 und im LK 57 Szenarien, darunter den Wechsel zur Wagenaufgabe, die freiwilligen Einzelwege und das Pausieren eines Auftrags. Daneben bestanden alle 13 ergänzenden Prüfungen für Code, Materialien, Qualitätsstand und Dokumentation. In 16 zusätzlichen regulären Starts für beide Versuche, Bildungsgänge, Kursprofile und beide Voraussetzungenmodi erreichte das gewählte Ziel oder die angekündigte Grundlage den Zustand `TEACHING`. Die Profilübergabe an den lokalen Claude-Adapter gelang. Der Stand `a490f8a908` ergänzt die Korrektur der Claude-Auswahlliste. In acht Arbeitsblattaufrufen auf diesem Stand blieben Lernstand, vier Belege und aktives Ziel gleich. Auf diesem Stand bestanden 328 gezielte Backendtests ohne Auslassung, darunter die echten MCP-Auswahlen und die vollständige Projektion der lokalisierten Aufgaben. Die Qualitätsprüfung für 21 Curricula und zwölf Teilbereiche, das Transparenzinventar und die Prüfungen der lokalen Plugin-Entwürfe bestanden ebenfalls. [Abnahmeprofile](hessen-physik-e1-vorschau.md#zwei-eigene-versuche)

K 0/13 und F 0/7 vollständig abgeschlossen. Das Paket aktiviert 0 zusätzliche Stufenpläne. Der aktuelle Kartenvergleich vor der Ergänzung umfasst in G8 und G9 jeweils 619 Ziele und 608 Beziehungen im GK sowie 666 Ziele und 636 Beziehungen im LK. Die Mathematikkarte G9 hat 679 Ziele und 613 Beziehungen. Alle fünf Projektionen hatten einschließlich der Untereinheiten null rückwärts gerichtete Beziehungen. Auch der Browservergleich vor und nach der Änderung an der Zoomleiste bestätigte auf `4db7f10264` dieselben Ziel-IDs, verschachtelten Einheiten und Beziehungen. Er fand in jeder Projektion null Rückläufe.

**Technischer Abschluss am 21. November 2026, 17:02 MEZ.** Die technische Integration ist abgeschlossen. Die [PR-CI](https://github.com/enpasos/skillpilot/actions/runs/44910637721) auf `30292ba653` und die [frische Main-CI](https://github.com/enpasos/skillpilot/actions/runs/44916780957) auf dem [integrierten Commit `fa395657f8`](https://github.com/enpasos/skillpilot/commit/fa395657f8a8a8aef240af098a2ce7da93933dfd) bestanden jeweils alle 14 Jobs. Auf dem geprüften Stand `ca24f62541` wurde das Mathematik-Referenzpaket `0.1.0-runtime.1` in einen leeren lokalen Store installiert. Es bestand alle 15 HTTP- und Browserprüfungen sowie den Java-Ladetest. Die Hessen-Vorschau lädt E.1 aus dem Repository-Katalog. Der registrierte lokale Claude-MCP-Handler speicherte auf `4db7f10264` bei allen 44 freiwilligen Wahlen (je elf in G8/GK, G8/LK, G9/GK und G9/LK) das gewählte Fachziel als aktives Ziel und in vier strikten Gegenproben die angekündigte Grundlage, jeweils bei unveränderten A–D-Belegen und unveränderten gespeicherten Einzelwerten samt Zeitstempeln. Bei 24 Wechseln zwischen A und B auf derselben Tafel in acht Chromium-Fällen (1024 und 1440 Pixel, G8/G9 jeweils GK/LK) blieben Testdaten und sichtbare Knotenpositionen stabil, ohne erneute Ladeanzeige oder `aria-busy`-Phase. Die persönliche E.1-Teilabnahme ist auf den getrennten dauerhaften GK- und LK-Vorschauen möglich. Die weiteren Themenfelder bis Q4 folgen nach dieser Teilabnahme. [Integrations-PR #176](https://github.com/enpasos/skillpilot/pull/176)

## 21. November 2026, 10:54 MEZ – Einen Einheitenauftrag fortsetzen und das Fach ausdrücklich wechseln

Ein allgemeines „weiter“ folgt einem verfügbaren, ausdrücklich gewählten Einheitenauftrag und zusätzlich fälliger Arbeit. Wer stattdessen Mathematik wählt, kann dort auch ohne Mathematikplan lernen oder ein erreichbares Ziel eines späteren Mathematikplans vorziehen. Eine unverfügbare Fassung bleibt als solche sichtbar. Passen zwei zugängliche Landschaften zum ausdrücklich gewünschten Fachnamen, wechselt der Coach erst nach eindeutiger Auswahl. Im regulären E.1-Vergleich ergeben sich bei der Abschnittswahl im Einzelzielplan 16 Positionen. Die zusätzliche Wurfprüfung zählt bei eigener Wahl. Bei alten Plänen mit einem getrennten Auftrag für diese Prüfung wird die ursprüngliche Auswahl auch nach der früheren blockübergreifenden Deduplizierung berücksichtigt. Der Einheitenauftrag selbst hat vier Pflichtteile. Der Quellenhinweis „Waagerechter Wurf und Superposition (aus E.3)“ erscheint an den beiden eingebundenen Lernzielen in Baum und Karte.

**Prüfstand.** Sieben neue lokale Zweifachtests rufen mit simulierter Anmeldung die echten Claude-MCP-Handler auf. Sie prüfen am gespeicherten aktiven Ziel, ob der Wechsel zum Mathematikplan oder die persönliche Mathematikwahl tatsächlich ausgeführt wurde. Die zwölf G8-/G9-Fälle für das allgemeine Fortsetzen umfassen 0, 2 und 4 bestandene Teile, jeweils mit und ohne zusätzlich fälligen Auftrag. In beiden Bildungsgängen ließ sich das freiwillig gewählte Ziel „Modellierung und Idealisierung von Bewegungen“ nach Bestätigung des angebotenen Abschlussvertrags direkt im lokalen Coach starten. Die vier Belege und die Einzelmastery blieben erhalten. An separaten lokalen Profilen ließ sich der Einzelversuch A vor der Abgabe verlassen. Der Status blieb bei C und D mit je 17/20 Punkten und 2/4 erfüllten Teilen. Die bisherigen datierten Fachentscheide gelten für dieselben Aufgaben und Bewertungsraster.

**Auftragspause.** Acht Browserfälle haben in G8 und G9 einen teilweise erfüllten, einen abgeschlossenen und einen gemischten Auftrag sowie die Abwahl von Physik geprüft. Beim Pausieren und Reaktivieren änderte sich jeweils der gewählte Block. Die übrigen Aufträge, datierten Belege und individuellen Lernstände blieben erhalten. Die Qualitätsgrenzen für 21 Curricula und zwölf Teilbereiche sind erfüllt.

**Zusätzlicher Kursprofilvergleich.** Auf dem Kandidaten `31e6dad1d5` wählten zwei neue Profile über den regulären Personalisierungsdialog ausdrücklich Physik-LK für G8 beziehungsweise G9. Nach A–D war der Einheitenauftrag mit vier datierten Belegen abgeschlossen. Der Abschnitt zeigte 4/5 und verlangte zusätzlich „Mehrphasenbewegung und Modellprüfung“. Die freiwillige Wurfprüfung, die elf individuell offenen Inhaltsziele und die beiden Anrechnungen nach C+D waren in beiden Profilen korrekt. Laut hessischem Kerncurriculum gilt E.1 als gemeinsames Themenfeld der Einführungsphase. Der LK bietet die Mehrphasenprüfung jetzt als freiwillige Vertiefung an. Auf dem korrigierten Stand bestand bei beiden Bildungsgängen nach A–D auch der Abschnitt mit 4/4. Der G8-Lernende absolvierte C und D zuerst und erreichte die zwei Anrechnungen nach dem zweiten Beleg. Der G9-Lernende absolvierte sie zuletzt und erreichte die Anrechnungen nach dem vierten Beleg. Alle elf individuellen Fachziele blieben in beiden Profilen offen. [Kursprofile und fachliche Zuordnung](hessen-physik-e1-vorschau.md#grundkurs--und-leistungskursprofil-vergleichen)

**Pausieren während einer Aktualisierung.** In G9 traf der erste Klick auf **Einheitenauftrag pausieren** gelegentlich genau dann ein, wenn das Cockpit den Lernplan im Hintergrund neu lud. Der Knopf wurde zwischen Drücken und Loslassen deaktiviert. Der Server erhielt keinen Änderungsauftrag. Mit der Korrektur blieb der Knopf im bestätigten Lernplan während desselben Lesevorgangs bedienbar. Ein Klick pausierte den gewählten Block, ein weiterer aktivierte ihn wieder. Der Server bestätigte jeweils die erwartete Planrevision.

**Kartenwechsel im Leistungskurs.** Bei 1024 Pixeln Breite waren im LK nach dem Öffnen der Wurfaufgabe nur 29 Pixel der Wagenprüfung sichtbar. Die Kamera kann jetzt die sichtbaren Teile des zugehörigen Einheitenauftrags gemeinsam zeigen, wenn weiter entfernte Prüfungen keine lesbare Übersicht zulassen. In echten G8- und G9-Profilen sind A, B und der Verweis auf C bei 1024 × 650 und 1024 × 900 Pixeln vollständig sichtbar. Die Wagenkarte ist jeweils 189 Pixel breit. In 24 Browserfällen über beide Kurse und Bildungsgänge gelang der Wechsel B→A. Auf der großen Mathematiktafel öffnet die Grafik weiterhin bei 100 Prozent. Manuelles Einpassen zeigt alle 18 Einträge. [Kartenvergleich](hessen-physik-e1-vorschau.md#zwei-karten-vergleichen)

**Zur Sichtung.** Den abgeschlossenen E.1-Auftrag mit dem Einzelzielplan vergleichen, eines der elf Fachziele freiwillig beginnen und den Einheitenauftrag im Lernplan pausieren. Die Hauptlinie und der Kandidat verwenden eigene Profile. [Vergleich auf der Hauptlinie](http://localhost:5177/auftraege/G8) · [GK-Vergleich im Kandidaten](http://localhost:5189/auftraege/G8) · [LK-Vergleich im Kandidaten](http://localhost:5201/auftraege/G9) · [Prüfanleitung](hessen-physik-e1-vorschau.md)

K 0/13 und F 0/7 vollständig abgeschlossen. Das Paket aktiviert 0 zusätzliche Stufenpläne. **Technischer Abschluss am 21. November 2026, 13:18 MEZ.** Die technische Integration ist abgeschlossen. Der [PR-Lauf auf `fb97963d26`](https://github.com/enpasos/skillpilot/actions/runs/44892049304) und die [frische Main-CI](https://github.com/enpasos/skillpilot/actions/runs/44897828249) auf dem [integrierten Commit `1507df0a9c`](https://github.com/enpasos/skillpilot/commit/1507df0a9ce172d798bb0a7409a88f20f1a63b0f) bestanden jeweils alle 14 Jobs. Als Nächstes steht die persönliche E.1-Teilabnahme an. Auf der Ausgangsfassung zählte die G8- und G9-Karte je 619 Ziele und 608 Beziehungen. Die Mathematikkarte umfasste 679 Ziele und 613 Beziehungen. Die ergänzende Vorhermessung im LK ergab für G8 und G9 je 666 Ziele, 72 Einheiten und 636 Beziehungen. In sämtlichen gemessenen Projektionen gab es null rückwärts gerichtete Beziehungen. Auf `8880ffd02d` und `fb97963d26` enthielten die persönlichen Karten dieselben Ziel-IDs. In Physik zeigten G8 und G9 auf der GK-Vorschau (5189) jeweils 619 Ziele, 72 Einheiten, 61 verschachtelte Ebenen mit Beziehungen und 608 Beziehungen, auf der LK-Vorschau (5201) jeweils 666 Ziele, 72 Einheiten, 60 verschachtelte Ebenen mit Beziehungen und 636 Beziehungen. Mathematik G9 zeigte 679 Ziele, 62 Einheiten, 50 verschachtelte Ebenen mit Beziehungen und 613 Beziehungen. Vor und nach der Änderung verliefen in allen Projektionen null Beziehungen rückwärts. Im lokalen Backend bestanden 252 Tests in 9 Klassen, darunter 64 über die Claude-Abschlussroute und 14 am Lernplan-HTTP-Controller. Kein Test wurde übersprungen. In Chromium bestanden 55 Prüfschritte im GK und 57 im LK. In beiden Bildungsgängen waren alle 18 GK- und alle 19 LK-Elternpfade erreichbar. Das persönliche 2/4-Profil startete die freiwillige LK-Mehrphasenprüfung über die Zielkarte und verließ sie vor Abgabe. C/D und Einzelmastery blieben dabei erhalten. [Folge-PR #175](https://github.com/enpasos/skillpilot/pull/175)

## 21. November 2026, 08:35 MEZ – Direkte Lernziele in der hessischen Lernkarte und im Cockpit

In E.1 steht „Bewegungen mit Weg-Zeit-Diagrammen beschreiben“ unmittelbar unter dem Themenfeld. „Notwendige Grundlagen“ bleibt am Ziel als Herkunft lesbar. Die Wagenprüfung liegt ebenfalls direkt unter E.1. „Gleichmäßig beschleunigte Bewegung und Beschleunigung“ hat in Baum und Karte dieselbe Untereinheit. Die übergeordneten Navigationswurzeln von Baum und Karte unterscheiden sich weiterhin. Die Regel für reine Darstellungsgruppen gilt fachübergreifend. Sie erhält Prüfungsziele, fachliche Voraussetzungen und ausgewiesene Reihenfolgen.

**Wirkung in echten persönlichen Lehrplänen.** Chromium hat die vollständige Projektion der geöffneten Lernkarte vor und nach der Änderung einschließlich der Untereinheiten ausgewertet. In den beiden hessischen Physikprofilen G8 und G9 blieben je 619 Ziel-IDs, 61 Ebenen mit Beziehungen und 608 Beziehungen erhalten. Darstellungseinheiten gingen jeweils von 109 auf 72 zurück. Im hessischen G9-Mathematikvergleich blieben 679 Ziel-IDs, 50 Ebenen mit Beziehungen und 613 Beziehungen erhalten. Darstellungseinheiten gingen von 71 auf 62 zurück. In allen drei persönlichen Projektionen gab es vorher und nachher 0 rückwärts markierte Beziehungen. K 0/13 und F 0/7 vollständig abgeschlossen, 0 zusätzliche Stufenpläne aktiviert. [E.1 in G8](http://localhost:5177/nativ/G8/E1) · [E.1 in G9](http://localhost:5177/nativ/G9/E1) · [Mathematikvergleich](http://localhost:5177/vergleich/mathematik)

**Prüfungen und fachliche Sichtung.** Zwölf lokale Fälle mit Spring und dem Claude-MCP-Handler prüfen in beiden Bildungsgängen einen Einheitenauftrag allein und zusammen mit einem fälligen Einzelauftrag, jeweils bei 0, 2 und 4 bestandenen Teilen. In G8 und G9 prüfte Chromium bei drei Zielen den unmittelbaren Elternknoten in beiden Ansichten. Der Klick auf das Weg-Zeit-Ziel und ein gespeicherter Link zum früheren Grundlagenordner öffneten jeweils die Zielkarte. Die Belege blieben gleich. Auf dem Stand `59f5e3def6` starteten zwei isolierte lokale Spring-/H2-Profile (G8 und G9) nach bestandenen Teilen C und D mit je 17/20 BE den Teil A. Beide verließen A vor der Abgabe über die Bestätigung im Cockpit. A und B blieben offen. Die Belege für C und D behielten ihre Zeitstempel und Fassungsbindungen, der Einheitennachweis blieb bei 2/4 und die Einzelmastery unverändert. Für den Test war die Coach-Anmeldung simuliert. Die Qualitätsgrenzen bestehen für 21 Curricula und zwölf Teilbereiche. Die fassungsgebundenen Aufgaben, Raster und unabhängigen Fachentscheide sind in diesem Paket unverändert. Für die persönliche Teilabnahme eignen sich die Elternpfade in Baum und Karte, der Wechsel von der Wurf- zur Wagenprüfung sowie die Auswahl nach vier bestandenen Teilen. [Vorschau und Prüfschritte](hessen-physik-e1-vorschau.md) · [Physik-Qualitätsstand](../qa-ci/status/curriculum-quality-status.de.md)

**Technischer Abschluss am 21. November 2026, 11:04 MEZ.** Die technische Integration ist abgeschlossen. Die CI auf dem PR-Kopf `59f5e3def6` und auf dem integrierten Commit `d5c45c3830` bestand jeweils alle 14 Jobs. Auf der Basis `98b61309ac` hatte der Frontendtest nach der E.1-Lernkartenübung die fertige Karte der E-Phase innerhalb von 30 Sekunden nicht gefunden. Für die persönliche E.1-Teilabnahme stehen die getesteten G8- und G9-Profile bereit. Die weitere fachliche Ausarbeitung folgt anschließend Einheit für Einheit bis Q4. [Integrations-PR #174](https://github.com/enpasos/skillpilot/pull/174) · [PR-CI](https://github.com/enpasos/skillpilot/actions/runs/44880942724) · [Frontendfehler der Basis](https://github.com/enpasos/skillpilot/actions/runs/44878177547/job/136774171872) · [Implementierungscommit](https://github.com/enpasos/skillpilot/commit/d5c45c3830b374500fbfffb35e52dcc3797ccb55) · [Frische Main-CI](https://github.com/enpasos/skillpilot/actions/runs/44886698380)

## 21. November 2026, 08:32 MEZ – E.1-Auftrag, Prüfungswahl und grafische Lernkarte

Die Lernkarte öffnet für alle Bildschirmbreiten direkt die Grafik. Der Umschalter zur Zielliste entfällt. Ein grünes Häkchen bedeutet eigener erfolgreicher Nachweis, dieselbe Form in Grau bedeutet belegte fachliche Anrechnung. Ein reiner Wegfall der Vorbereitung erhält ein Minus. Ein abgeschlossener Abschnitt ist im Cockpit eigens gekennzeichnet. Wer nur den Abschnitt nachweist, kann die einzeln offenen Ziele weiterhin sehen und bearbeiten.

**Kontrollstellen für die fachliche Sichtung.** Vom waagerechten Wurf zur Wagenaufgabe wechseln, nach C+D die verbliebenen Pflichtteile ansehen und nach A–D zwischen freiwilliger Vertiefung und einem zusätzlich gewählten Einzelauftrag unterscheiden. Die weitere Aufgabe zum waagerechten Wurf bleibt als freiwillige Zusatzprüfung mit eigenem Ergebnis erreichbar. [Einstieg in G8](http://localhost:5177/nativ/G8/B) · [Aufträge in G9](http://localhost:5177/auftraege/G9) · [Prüfabläufe](hessen-physik-e1-vorschau.md)

**Automatisierte Prüfungen und Reichweite.** In der laufenden Vorschau gelang der Wechsel B→A für G8 und G9 bei 390, 761, 1024 und 1440 Pixeln. Die lokalen OpenAI-/Gemini-Prüfungen umfassten 100 erfolgreiche Tests. Sie verwenden registrierte MCP-Handler mit kontrolliertem Backendstatus. Acht weitere Fälle im echten Claude-Handler prüften für G8 und G9 die hessischen Aufträge bei 0/4, 2/4 und 4/4 sowie einen zusätzlichen fälligen Einzelauftrag. Die fassungsgebundenen Aufgaben, Raster und unabhängigen Fachentscheide A–D behalten ihre bestehende Geltung. Eine persönliche Teilabnahme oder Erprobung im gehosteten Coach ist gesondert zu belegen.

**Integration und Rollout.** Der Product Owner hat [PR #173](https://github.com/enpasos/skillpilot/pull/173) um 07:52 MEZ in [`5a63a1f3bc`](https://github.com/enpasos/skillpilot/commit/5a63a1f3bce8aeb4c7ebab8b350e641522d9a8c4) integriert. Der Deployment-Check erkannte einen veralteten internen OpenAI-Entwurf. Nach Aktualisierung der erzeugten Entwurfsdateien auf [`98b61309ac`](https://github.com/enpasos/skillpilot/commit/98b61309acc16c32a00f1bf05151163c2f2ef617) meldete der Product Owner den erfolgreichen Produktionseinsatz. Der [CI-Lauf auf dem Merge-Commit](https://github.com/enpasos/skillpilot/actions/runs/44877576545) wurde durch den neueren Push abgelöst. Auf dem ausgelieferten Commit bestanden 13 von 14 Jobs, darunter die Backendtests. Die Frontend-CI erreichte beim Öffnen der E-Phasen-Tafel das Zeitlimit. [Main-CI zum ausgelieferten Stand](https://github.com/enpasos/skillpilot/actions/runs/44878177547)

K 0/13 und F 0/7 vollständig abgeschlossen. Dieses Paket aktiviert 0 zusätzliche Stufenpläne. Fachliche Voraussetzungen und Stufenplatzierungen blieben gleich. Für dieses Paket wurde kein neuer Rücklaufeffekt gemessen. Die persönliche E.1-Teilabnahme steht aus. [Umfang und fachliche Tiefe](hessen-physik-sekii-uebergabe.md)

## 20. November 2026, 16:37 MEZ (UTC+01:00) – Hessen Physik E.1 in G8 und G9

**Zur fachlichen Durchsicht.** Die Ballfrage eröffnet E.1. Drei Übungen und neun Themenkarten führen zu den vier Prüfungen. Wagen A verlangt 14/17, waagerechter Wurf B 15/18, senkrechter Wurf C und Beschleunigungsprotokoll D jeweils 17/20 Punkte. Vom Wurf aus lässt sich bei 1024 Pixeln die Wagenaufgabe wählen. Die Vergleichsprofile zeigen das Cockpit vor den Prüfungen, nach C+D und nach A–D. [Anleitung für G8 und G9](hessen-physik-e1-vorschau.md) · [Fachentscheid A/B](https://github.com/enpasos/skillpilot/blob/bea9d4329942a183424d2ff5615f10cdda7bdd8e/curricula/DE/Gymnasium/quality/release-model/physics-he-e1-partial-credit-review-2026-11-20.md) · [Fachentscheid C/D und kanonische Zuordnung](https://github.com/enpasos/skillpilot/blob/2c2505fecef3a3a8a561b472b52ba1f04a5a4cdb/curricula/DE/Gymnasium/quality/learning-units/physics-constant-acceleration-2026-11-20-v3.md)

**Wirkung.** Nach C+D decken zwei fachlich begründete Anrechnungen zusammen mit den zwei Prüfungserfolgen vier Planpositionen. Nach A–D sind es sechs. Die Einheit ist dann bestanden und der Abschnitt zeigt vier von fünf Prüfungen. Ohne eigenen Nachweis bleiben alle elf Fachziele individuell offen. Im atomaren Plan mit 17 gewählten Zielen bleibt der nächste Vorschlag in allen drei Vergleichsprofilen „Bewegungen mit Weg-Zeit-Diagrammen beschreiben“. Für den ausdrücklich gewählten Einheitenauftrag entschied der Product Owner am 20. November, dass A–D die Pflichtarbeit beenden. Nur ein gesonderter Auftrag kann weitere Pflichtarbeit begründen. Ein eigener Nachweis erhält ein grünes Häkchen, eine fachlich begründete Anrechnung ein Schild mit Häkchen. Ein freiwillig gewordenes Ziel erhält allein deshalb kein Häkchen. Chromium zeigte in G8 und G9 über E.1 und die Kindeinheit genau A–D als eigene Erfolge und die beiden freigegebenen Fachziele mit Schild. Das reale Vergleichsprofil mit einem zusätzlichen Einzelauftrag bietet weiterhin „Bewegungen mit Weg-Zeit-Diagrammen beschreiben“ an. Für den reinen Einheitenauftrag zeigt es nach 4/4 keinen weiteren Pflichtvorschlag. Das lokale Backend berechnete die Ergebnisse aus synthetischen Bewertungen im regulären MCP-Bewertungsweg. Die Vorschau aktiviert den standardmäßig ausgeschalteten Piloten. Echte Schülerantworten im Claude-Client und die persönliche Teilabnahme stehen aus. [Abnahmestand und Vertragsgrenzen](hessen-physik-sekii-uebergabe.md)

**Qualität.** Physik erreicht M7 mit 854 Zielen und 485/485 fachlichen Atomen je Qualitätsdimension. In acht hessischen Ansichten mit 367 Tafeln je Prüfstand hatte E.1 vor und nach der Änderung null Rückgriffe. Der bestehende Rückgriff Q2→Q1 liegt außerhalb von E.1. Die reguläre R1-Prüfung findet in allen neun einschlägigen hessischen Konfigurationen die eigenen C/D-Prüfungen der Unit-Revision 2026-11-20-v3. Zwölf Konfigurationen in BW/BY hatten bereits auf der Hauptlinie einen offenen R1-Befund. Für die Mathematik-Platzierung ergaben 1.036 geprüfte Bedarfsbeziehungen dieselben Ziele, Verbraucher und Zeitgrenzen. Bei verzögertem Laden des Kartenstapels wartet die Grafik mit der Bereitschaftsanzeige bis zur gesetzten Kamera. Auf der bereits sichtbaren Liste verursachten Material- und Fortschrittsaktualisierung bei 1024 Pixeln in zwei echten Projektionen keine grafische Neuanordnung. Der isolierte Paketstart bestand auf dem gemeinsamen Stand `f8f9a3805c` 15/15 lokale Prüfungen und der Backendtest lud das frisch aktivierte Mathematikpaket. [Physik-Qualitätsstand](../qa-ci/status/curriculum-quality-status.de.md) · [Originalbericht zum lokalen Paketlauf](https://github.com/enpasos/skillpilot/blob/2c2505fecef3a3a8a561b472b52ba1f04a5a4cdb/contracts/stage-plan-review-evidence/2026-11-20/hessen-e1-package-start/f8f9a3805c-smoke.actual.json)

Die reguläre Lernkarte und der Cockpit-Prototyp verwenden dieselbe Auswertung. Im separaten Prototypfall beendet ein direkter Prüfungsnachweis die Vorbereitung auf ein weiteres Ziel. Der Abschnitt ist damit abgeschlossen. Für das Fach ist ein Ziel von 55 nachgewiesen und im ausdrücklich gewählten Einzelzielplan eines von zwei. Der Browser prüft das neutrale Minus am entfallenen Ziel und das grüne Häkchen am Prüfungsziel.

Im Backendlauf auf `02ed9a8919` schlugen zehn Tests aus drei Klassen fehl. Sie erwarteten noch die frühere hessische Wurffassung oder einen alten internen Konstruktor für die Voraussetzungenprüfung. Die aktualisierten Tests prüfen die hessische Fassung C im ausdrücklich gewählten Klausurplan, A bis D auf den jeweiligen Lernkarten und die tatsächlich verwendete Berechnung der Lernfront. Alle 84 Tests der drei Klassen bestanden lokal. Die vollständige lokale Backendprüfung auf `7f6a701126` verwendete die sechs Buchdateien aus dem zugehörigen PR-Lauf. Von 2.924 Tests bestanden 2.905 und 19 wurden bedingt übersprungen. Die Klausur behält ihre neun fachlichen Ziele und drei gewählten Aufgaben. [Protokoll des vorherigen Backendlaufs](https://github.com/enpasos/skillpilot/actions/runs/44729930523/job/136278763709)

**Integration.** K 0/13 und F 0/7 vollständig abgeschlossen, 0 neue Stufenpläne aktiviert. Die dauerhafte Vorschau auf Port 5177 wurde am Implementierungsstand `a45ff1b502` im regulären Cockpit geprüft. Windows Edge zeigte in beiden Bildungsgängen den abgeschlossenen Auftrag im regulären Cockpit und den zusätzlichen offenen Einzelauftrag im Vergleich. Der vollständige lokale G8/G9-Browserlauf bestand einschließlich der vier Erststarts, des aktiven Einzelziels im gemischten Auftrag und des freiwilligen Einzelwegs. Der Quellstand der laufenden Vorschau und der Merge-Commit sind für die E.1-Anwendung, die Lernmaterialien und die Startlogik bytegleich. Als Nächstes prüft der Product Owner E.1 fachlich. Nach dieser Teilabnahme folgt die nächste Oberstufeneinheit. Die Gesamtfreigabe für Hessen erteilt er gesondert. [Vorschau und Prüfpunkte](hessen-physik-e1-vorschau.md)

PR #171 wurde um 15:29 MEZ mit dem geprüften Git-Baum in die Hauptlinie integriert. Die PR-CI auf `7f6a701126` bestand alle 14 Jobs. Auf dem integrierten Commit `dd71aebc55` endete die frische Main-CI um 16:36:49 MEZ mit 14 von 14 erfolgreichen Jobs. Damit ist die technische Integration abgeschlossen. [Hessen-PR #171](https://github.com/enpasos/skillpilot/pull/171) · [PR-CI](https://github.com/enpasos/skillpilot/actions/runs/44740035632) · [Implementierungscommit](https://github.com/enpasos/skillpilot/commit/dd71aebc552725eb2ca3f8fc72028b66d486904d) · [Main-CI](https://github.com/enpasos/skillpilot/actions/runs/44753951163)

Der frische Paketstart auf dem PR-Stand bestand 15 von 15 isolierten HTTP- und Browserprüfungen. Der Java-Test lud das aktivierte Paket. Im separaten Fachexport waren alle zehn Pakete reproduzierbar. Der optionale OWL-Roundtrip scheiterte am bereits bekannten Verlust der Schemaangabe in der Brandenburger Mathematikansicht. [Paketprüfung](https://github.com/enpasos/skillpilot/actions/runs/44740780037/job/136303601398) · [Fachexport](https://github.com/enpasos/skillpilot/actions/runs/44740780037/job/136303601033) · [OWL-Befund](https://github.com/enpasos/skillpilot/actions/runs/44740780037/job/136303602857#step:16:1)

## 20. November 2026, 13:04 MEZ (UTC+01:00) – Zwei offene Cockpit-Tabs

Die Registrierung eines Cockpit-Streams gibt die Datenbankverbindung frei, sobald das Profil unter der Transaktionssperre geprüft ist. Mit einer einzigen verfügbaren Verbindung lieferte ein paralleler Lernstandabruf vor der Korrektur HTTP 500 und danach HTTP 200. Zwei offene Tabs belegten danach zusammen null Poolverbindungen. Im HTTP-Test empfing der erste Tab weiterhin das Aktualisierungsereignis. Der Eingriff betrifft die Streamregistrierung. K 0/13 und F 0/7 vollständig abgeschlossen, 0 neue Stufenpläne und 0 geänderte Lernkartentafeln. Die Prüfpunkte sind der Lernstandabruf im zweiten Tab und die Aktualisierung im ersten Tab. [Implementierung und automatisierte Regression in PR #172](https://github.com/enpasos/skillpilot/pull/172)

**Integration abgeschlossen.** Der geprüfte PR-Stand `ea083c2b46` kam um 11:46 MEZ über den Merge-Commit `ca9e6831c4` auf `main`. Die vollständige PR-CI bestand mit 14 von 14 Jobs. Der frische Push-Lauf auf dem Merge-Commit endete um 13:03 MEZ ebenfalls mit 14 von 14 erfolgreichen Jobs. [PR-CI](https://github.com/enpasos/skillpilot/actions/runs/44710664415) · [Implementierung auf main](https://github.com/enpasos/skillpilot/commit/ca9e6831c47b329b8de095783a80e1d54318654c) · [Main-CI](https://github.com/enpasos/skillpilot/actions/runs/44722117370)

## 20. November 2026, 08:56 MEZ (UTC+01:00) – Prüfungen auf Verständnis bewerten

Im kanonischen Gymnasium-Katalog verlangen am Ausgangsstand 137 von 1.049 bepunkteten Prüfungen volle Punktzahl. In der Einheit „Natürliche Zahlen“ prüften die beiden Aufgaben bisher mit 13/13 und 17/17. Die neue Fassung erlaubt in beiden Fällen einen hinreichenden Nachweis mit 10/12. Für die übrigen 135 Fälle steht das fachliche Review noch aus. K1–K13 und F1–F7 erhalten durch dieses Paket keinen zusätzlichen Abschluss. Neu aktiviert wurden 0 Stufenpläne. Der Katalogvergleich ergibt unveränderte Kanten und Platzierungen.

**Für die fachliche Durchsicht** eignen sich die beiden [Aufgaben und ihre Grenzabgaben](https://github.com/enpasos/skillpilot/blob/6a04a80ee38d7788681c840edfeed9c24218ecac/curricula/DE/Gymnasium/quality/learning-units/math-natural-numbers-2026-11-20-v2.md). Beim Spendenlauf zählt eine richtig geschriebene Zahlenkette als Nachweis der darin gezeigten Vergleiche. Bei der Konzertkasse ist zu prüfen, warum zwei richtige Nachfolger allein die allgemeine Aussage über die natürlichen Zahlen offenlassen. Die gemeinsame [Coachanweisung](https://github.com/enpasos/skillpilot/blob/6a04a80ee38d7788681c840edfeed9c24218ecac/backend/src/main/java/com/skillpilot/backend/ai/ExamGradingGuidance.java) bewertet jedes Kriterium anhand der gesamten Abgabe und berücksichtigt Widersprüche dort, wo sie den Nachweis betreffen.

**Nachweise und Integration.** Das fachliche Gegenlesen anhand synthetischer Lösungen und der technische Grenzversuch sind getrennt dokumentiert. Im lokalen Claude-MCP mit Spring und H2 wurde bei beiden Prüfungszielen die Eingabe von 9 Punkten abgewiesen und die von 10 Punkten als bestandene Prüfung gespeichert. Die zusätzlichen Lernziele erhielten jeweils keinen Masteryeintrag. Das [katalogweite Prüfskript](https://github.com/enpasos/skillpilot/blob/6a04a80ee38d7788681c840edfeed9c24218ecac/scripts/check_exam_pass_marks.py) vergleicht neue und geänderte Materialien mit dem CI-Basiscommit. Der [PR #170](https://github.com/enpasos/skillpilot/pull/170) führt zur Integration. Nach erfolgreicher Main-CI folgen die Erprobung im Coach und die Überprüfung weiterer Vollpunktprüfungen nach Fach und Einheit.

Die G8/G9-Generierung prüft die Fassung des Mathematikkatalogs gegen zwei genehmigte Pläne für die Platzierung der Lernziele. Der Abgleich mit dem Basiscommit ergab bei 1.310 identischen Ziel-IDs ausschließlich neue Prüfungsdaten und Quellenverweise an den beiden überarbeiteten Aufgaben. Die beiden aktiven Bindungen verwenden nun den geprüften Kataloghash `cb40d5be…`. Alle 18 daraus erzeugten Daueransichten entsprechen den eingecheckten Dateien. [Fehlgeschlagener CI-Schritt und Ausgangsstand](https://github.com/enpasos/skillpilot/actions/runs/44682822375/job/136121439655)

Das Mathematikpaket enthält jetzt für jede der beiden Prüfungen eine eigene Aufgabenquelle. Das vollständige ZIP umfasst 1.121 Einträge mit 1.119 Manifestdateien, darunter dieselben 864 Medien. Der aktualisierte Prüfnachweis bindet den Paketinhalt `e9458739…` und die Eingabedateien des Release-Modells. Alle bisherigen Rechteentscheidungen sind erhalten. Für eine Veröffentlichung sind weiterhin 867 Prüfpositionen offen. [Paketprüfung des vorherigen Stands](https://github.com/enpasos/skillpilot/actions/runs/44689137269/job/136142403934)

## 20. November 2026, 02:05 MEZ (UTC+01:00) – Prüfungsbelege in Hessen Physik E.1

Ein bestandener, mit Claude bewerteter Prüfungsversuch erhält einen Beleg für die damalige Aufgabe und ihr Bewertungsraster. Das Cockpit zeigt Datum, Punktzahl und Bestehensgrenze am Prüfungsziel. Beim Besprechen einer angebotenen Prüfung sieht Claude den jüngsten gespeicherten Beleg für genau dieses Ziel. Die Anrechnung auf den Abschluss der gesamten Einheit ist ein eigener, noch offener Schritt.

**Zur Durchsicht.** In der lokalen Hessen-Ansicht die Aufgabe „Waagerechter Wurf: Zwei Bewegungen, eine gemeinsame Zeit“ öffnen. Für zwei synthetische Profile hat der echte MCP-Prüfpfad 24 von 36 Punkten (G8) und 30 von 36 Punkten (G9) gespeichert. Unter „Deine Prüfungsnachweise“ erscheint in beiden Profilen die damalige Bestehensgrenze von 22 Punkten. Auf der Lernkarte lässt sich anschließend prüfen, dass die übrigen fachlichen Lernziele ihren bisherigen Stand haben.

**Prüfung und Stand.** Der [MCP-Integrationstest](https://github.com/enpasos/skillpilot/blob/5d2cb489dc9fafcdc30b289ec6c48384eebb738a/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CanonicalExamIntegrationTest.java) prüft den Weg vom Bewertungsraster bis zum gespeicherten Beleg. Der [Materialvergleich](https://github.com/enpasos/skillpilot/blob/5d2cb489dc9fafcdc30b289ec6c48384eebb738a/backend/src/test/java/com/skillpilot/backend/completion/AssessmentMaterialRevisionTest.java) prüft beide Aufgaben der Untereinheit gegen ihre fachlich geprüften Fassungen. Die [Tests zur persönlichen Sicherung](https://github.com/enpasos/skillpilot/blob/5d2cb489dc9fafcdc30b289ec6c48384eebb738a/backend/src/test/java/com/skillpilot/backend/service/VerifiedExamPassBackupIntegrationTest.java) behandeln Wiederherstellung, Altdaten und Fremdkopien. Alle 134 lokalen Backendtests aus den 14 ausgewählten Testklassen bestanden. Die Browserdurchsicht umfasste das deutsche Desktop- und Mobil-Cockpit sowie die englische Desktopansicht. Die Lernendenaufgabe ist bereits veröffentlicht. Diese Technikrunde enthält keine neue fachliche Aufgabenfreigabe oder Erprobung in Claude Web oder Android.

**Integration abgeschlossen am 20. November 2026 um 06:53 MEZ.** Alle 14 Jobs der frischen Main-CI für die Prüfungsbelege waren erfolgreich. K 0/13 und F 0/7 sind vollständig abgeschlossen, 0 neue reale Stufenpläne wurden aktiviert. Als Nächstes ist für E.1 zu prüfen, welche Kombination aus Teilnachweisen den Abschluss der Einheit trägt und was Lernkarte, Cockpit und Coach danach als offen ausweisen. [PR #169](https://github.com/enpasos/skillpilot/pull/169) · [Implementierungscommit `649d7ba0c1`](https://github.com/enpasos/skillpilot/commit/649d7ba0c15d0c436e736c2aa77bf1b15858456b) · [Main-CI mit 14 erfolgreichen Jobs](https://github.com/enpasos/skillpilot/actions/runs/44675318290)

## 19. November 2026, 21:41 MEZ (UTC+01:00) – Einstieg, Lernkarte und Coach-Kontext in Hessen Physik E.1

**Lokale Prüfrunde für G8 und G9.** „Ein Ball rollt vom Tisch. Wo landet er?“ eröffnet die Einheit. Die Lernenden nutzen vorgegebene Bewegungsdaten, um eine Vorhersage zu begründen. Drei Übungen schließen an die Ziele zu Modellierung, Sicherheitsabstand und waagerechtem Wurf an. Bei jeder Aufgabe lassen sich ein Hinweis und die Musterlösung getrennt öffnen. Die Übungen dienen der Selbstkontrolle. Die zweisprachigen Aufgaben stehen im Arbeitsbaum unter `curricula/DE/Gymnasium/materials/physics/he-e1-motion-practice.json`.

**Zur Durchsicht.** Vom waagerechten Wurf die Lernkarte öffnen, „Lernkarten zu E.1“ wählen und anschließend die Phasenprüfung „Bewegungsanalyse und freier Fall“ ansehen. Beide verweisen auf die vorhandenen Lernziele. Der Themenstapel umfasst neun der 87 Phasenkarten. Drei Übungen öffnen sich direkt am jeweiligen Fachziel, auch in der mobilen Zielliste. Der Vergleich im echten Cockpit für G8 und G9 ergab in E.1 vorher 12 Knoten und 12 Pfeile, anschließend 14 Knoten und 14 Pfeile. Beide zusätzlichen Pfeile führen aus tatsächlich benötigten Themen zur Prüfung. In beiden Karten gab es vor und nach der Änderung null Rückgriffe. Vier Browserdurchläufe auf Desktop und Smartphone prüften den Einstieg, die drei Übungen, beide Ressourcen und den gespeicherten Lernstand. Die drei Modellrechnungen wurden separat fachlich gesichtet. [Browsertest](https://github.com/enpasos/skillpilot/blob/main/app/scripts/testHessePhysicsMemoryUi.ts) · [Prüfung der Projektionen](https://github.com/enpasos/skillpilot/blob/main/app/scripts/testHessePhysicsFlashcardActions.ts)

**Stufenübersicht im lokalen Cockpit.** Bei gemeinsamer Auswahl von Grund- und Leistungskurs lieferte der lokale Entwicklungsserver nur die Leistungskurssicht. Acht Grundkursaufgaben aus den beiden Abitur-Beispielklausuren erschienen dadurch auf der Stufenübersicht als „Vorbereitung“. Der Entwicklungsserver fragt bei konfiguriertem lokalem Backend nun dessen gemeinsame Kurssicht ab. Die Browserprüfung in Hessen G8 und G9 mit Mathematik und Physik im persönlichen Curriculum und nur Physik auf der Karte ergab jeweils vorher zehn Knoten und neun Pfeile, danach die beiden Schulstufen mit einem Pfeil. Unter Sekundarstufe II → Abiturprüfung liegen die acht Grundkurs- und acht Leistungskursaufgaben. Die Karten der Stufenübersicht, der Oberstufe und der Abiturprüfung zeigten nach der Änderung jeweils null Rückgriffe. Die gespeicherten Einzelnachweise blieben in allen vier Vorher- und Nachher-Durchläufen identisch. Die Screenshots und Messwerte stehen lokal unter `tmp/hessen-physik-e-lokal/pruefung-wurzel-20261119/testnotiz.md`.

**Im Gespräch.** Das Backend ordnet das bestätigte Lernziel in die persönliche Sicht ein. Zum Wurf gehören die Voraussetzungen „Bezugssysteme und Geschwindigkeitsüberlagerung“ und „Modellierung und Idealisierung von Bewegungen“. Der Coach sieht, für welche Voraussetzungen ein Einzelbeleg vorliegt. Ein bestätigter Erlass ist mit seinem Grund und dem geltenden Abschnitt gekennzeichnet. Auf Wunsch erhält der Lernende im Gespräch dieselbe Aufgabenstellung wie am Fachziel in der Karte. Die neun Karten lassen sich direkt im Gespräch in der Sitzungssprache üben. Das Öffnen der Karte setzt kein Lernziel, das Üben eines Teilstapels bescheinigt keinen Einheitenabschluss. Ein Erstversuch der Phasenprüfung ist im Gespräch möglich, wenn das Backend ihn anbietet. 128 automatisierte Backendtests in zwölf Testklassen bestanden, darunter die hessischen G8- und G9-Sichten, der englische Kartenstart, die Trennung von Einzelbeleg und Erlass und der Wechsel in eine Prüfung. Ein Gespräch im Claude-Client steht noch aus. [Coach-Kontext](../concept/skill-graph/knowledge-context.de.md)

**Abschlussfrage.** Das Lernversprechen und die Fachunterlage halten die Entscheidung zu vorgegebenen Messdaten fest. Ein eigenes Messprotokoll ist im Lernweg freiwillig. Der Abgleich der verlinkten Phasenprüfung mit ihrem Raster zeigt, dass selbst ohne die gesamte Fallaufgabe 19 Punkte bei einer Bestehensgrenze von 15 Punkten möglich sind. Dieser Befund gehört in die Diskussion über den Einheitenabschluss. [Abgrenzung der bestehenden Prüfung](../concept/skill-graph/unit-assessment-discussion-2026-11-19.de.md#was-geschieht-mit-den-vorhandenen-prüfungen)

**Prüfung und Weiterlernen.** Direkte Versuche beginnen mit der ausdrücklichen Wahl einer angebotenen Prüfung. Ein früheres Opt-out im Profil sperrt sie nicht mehr. In G8 und G9 führte die Phasenprüfung aus E.1 bis zur Claude-Auswahl. Die reguläre Stufenansicht und der Einstellungsdialog wurden in beiden Bildungsgängen im lokalen Browser geprüft. Unter „Angerechnete Lernziele weiter einplanen“ wählen Lernende, ob der Plan auch individuell noch offene angerechnete Ziele zum Weiterlernen vorschlägt. Ein freiwilliges Fachziel können sie unabhängig davon wählen. Der Prüfungsnachweis bleibt dabei bestehen.

**Claude.** Der lokale 1.1.15-Kandidat hat 47.454 Bytes. Zwei separate Builds waren byteidentisch. Für die Verpackung und Anweisungen bestanden 188 automatisierte Tests, für die Release-Verträge und den Direktdownload weitere 64. Die eigenständige Marketplace-Prüfung erfasste 33 Fälle und der Support-Test 18. Zwei strikte CLI-Validierungen und eine isolierte lokale Installation bestanden. Die Prüfläufe belegen das Paket und die lokalen Zugänge. Die Erprobung im tatsächlichen Claude-Chat steht aus. [Releaseprotokoll](../deploy/claude-personal-marketplace-release.md)

**Integration abgeschlossen.** [PR #167](https://github.com/enpasos/skillpilot/pull/167) ist auf `main` integriert. Die [PR-CI](https://github.com/enpasos/skillpilot/actions/runs/44583827202) bestand mit 14 von 14 Jobs. Der [Merge-Commit `afcfc111ea`](https://github.com/enpasos/skillpilot/commit/afcfc111ea7ca990c665f446c558b23f5dd6f7eb) enthält denselben Git-Baum. Seine [frische Main-CI](https://github.com/enpasos/skillpilot/actions/runs/44599563115) endete am 19. November 2026 um 21:40 MEZ mit 14 von 14 erfolgreichen Jobs. Der Nachweis gilt für diesen Implementierungscommit. K 0/13 und F 0/7 sind vollständig abgeschlossen, 0 zusätzliche Stufenpläne wurden aktiviert. Die nächste fachliche Durchsicht betrifft die drei Übungsabschlüsse und den Entwurf für einen vollständigen E.1-Nachweis. Die Freigabe der Hessen-Vorlage durch den Product Owner steht aus.

## 19. November 2026, 09:55 MEZ (UTC+01:00) – Verstehenslernziele im Claude-Coach

Der Claude-Coach **1.1.14** und die zugehörigen Backend-Anweisungen greifen die Rückmeldung eines Schülers aus der Claude-Beta auf. Bei „Weiß ich noch nicht“ erklärt der Coach einen neuen Begriff an einem Beispiel. Wer eine Vorstellung mitbringt, kann sie besprechen. Eine Rückfrage kann auch nach einer Aufgabe direkt ins Gespräch führen. Zur Durchsicht eignen sich der Einstieg am Fahrradtacho und die Frage, warum bei der Beschleunigung die Sekunde zweimal in der Einheit steht. Ein selbstständiger Nachweis ist weiterhin erforderlich, bevor der Coach ein Fachziel als erreicht speichert. [Beispielgespräche und Fragen für die Erprobung](../concept/didactic/claude-beta-erklaeren-2026-11-19.de.md)

182 automatisierte Paketprüfungen und 78 Backend-Vertragstests bestanden lokal. Die Erprobung im tatsächlichen Claude-Chat mit dem Schüler steht aus. [PR #164](https://github.com/enpasos/skillpilot/pull/164) ist auf `main` integriert. Der Product Owner übernimmt das Produktionsdeployment. Der persönliche Marketplace liefert 1.1.14 aus. Die öffentliche Neuinstallation und das Update einer bestehenden Claude-Code-Installation von 1.1.13 wurden an allen sieben Dateien geprüft. [Marketplace-Veröffentlichung](https://github.com/enpasos/skillpilot-claude-marketplace/pull/17) · [Marketplace-CI](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/44491443543) Für K1–K13/F1–F7 kommt damit kein weiterer Abschluss hinzu. Es wurden 0 reale Stufenpläne aktiviert und keine curricularen Kanten geändert. [Claude-Skill](https://github.com/enpasos/skillpilot/blob/main/ai/claude/plugin/skillpilot-coach-v1/skills/skillpilot-coach-v1/SKILL.md#coaching-and-completion) · [Backend-Vertragstests](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1LearningPlanContractTest.java)

## 19. November 2026, 15:24 MEZ (UTC+01:00) – Hessen, Physik in der Einführungsphase

**Stand der gemeinsamen Erprobung.** Die Platzierungen für G8 und G9 sind auf `main` integriert. Die fachliche Abnahme durch den Product Owner steht aus. K 0/13 und F 0/7 sind vollständig abgeschlossen, 0 zusätzliche reale StagePlans sind aktiviert. Der Product Owner hat [PR #164](https://github.com/enpasos/skillpilot/pull/164) als `039a7c39d9499a77694652959cb153c01cd6918c` integriert. Die [Main-CI](https://github.com/enpasos/skillpilot/actions/runs/44491281472) und die [PR-CI](https://github.com/enpasos/skillpilot/actions/runs/44482845166) endeten jeweils mit 13 von 14 erfolgreichen Jobs. Von 2.844 Backend-Tests scheiterte auf `main` einer. Er erwartete den bisherigen Prüfungsordner in der E-Phase. [PR #165](https://github.com/enpasos/skillpilot/pull/165) prüft die einzelnen Platzierungen in G8 und G9. Im [ersten vollständigen Reparaturlauf](https://github.com/enpasos/skillpilot/actions/runs/44493719219) bestand das Backend. Der Frontend-Test fand ein ungültiges Format im Veröffentlichungsnachweis für Claude 1.1.14. Der Nachweis verwendet jetzt das für PR, beide CI-Läufe und Verifikation festgelegte Format. Nach der Korrektur scheiterte die Installation von Ubuntu-Paketen für Chromium auf mehreren Runnern, auch beim zweiten Versuch. Die CI kann die signierten Ubuntu-Pakete jetzt zusätzlich über den Spiegel der UC Davis beziehen. Die 13 in den Fehlermeldungen genannten Pakete waren dort per HTTPS erreichbar. [Gemini-Wiederholung](https://github.com/enpasos/skillpilot/actions/runs/44522712716/job/135559580647) · [Assessment-Completion-Job](https://github.com/enpasos/skillpilot/actions/runs/44522712653/job/135555182372)

**Abschluss der CI-Reparatur.** Auf Wunsch des Product Owners wurde [PR #165](https://github.com/enpasos/skillpilot/pull/165) während des laufenden PR-Checks in `main` integriert. Der [PR-Lauf auf `107db96596`](https://github.com/enpasos/skillpilot/actions/runs/44525665807) endete mit 14 von 14 erfolgreichen Jobs. Der [Implementierungscommit `9d8bc8492a`](https://github.com/enpasos/skillpilot/commit/9d8bc8492aa82475ad7e6ee72741b2fe247a76b6) enthält denselben Git-Baum. Seine [frische Main-CI](https://github.com/enpasos/skillpilot/actions/runs/44531180934) endete am 19. November 2026 um 15:23 MEZ mit 14 von 14 erfolgreichen Jobs. Der Regressionstest prüft 18 Prüfungsplatzierungen für G8 und G9 mit GK, LK und der gemeinsamen Auswahl GK+LK. Beim simulierten Ausfall der beiden bisherigen Quellen lud APT das Paket über den Ersatzspiegel und prüfte es anhand des signierten Paketindexes.

**Ergebnis.** In acht hessischen Physikansichten liegen 17 der 21 zuvor in vier Sammlungen geführten Prüfungen direkt beim Thema oder bei den Methoden. Vier Prüfungen haben einen gemeinsamen Platz auf Phasenebene. Davon öffnet sich „Bewegungsanalyse und freier Fall“ auch direkt aus E.1. Die bestehenden kanonischen Angaben verlangen für diese Aufgabe Tabellenkalkulation, obwohl die Aufgabe rechnerisch gelöst wird. Ob die Aufgabe die hinterlegten Kompetenzen vollständig nachweist, bleibt eine eigene fachliche Frage. Die qualitative Reibung liegt jetzt bei den Kräftebilanzen in E.2. Die beiden Zugänge zum Lernkartenstapel bieten wahlweise die E-Phase oder die zum Thema gehörigen Karten an. Die fünf Ordnungspfeile der Oberstufe bleiben bei der Auswahl einer Einheit lesbar.

**Zur Durchsicht im Cockpit.** In der Einführungsphase den Gesamtstapel öffnen, in E.1 die thematische Kartenauswahl und die Prüfung zum freien Fall ausprobieren und auf der Ebene darüber bei ausgewähltem Q2 die übrigen Pfeile betrachten. Die vorhandenen Prüfungsaufgaben und ihre Bewertungsraster wurden für die Platzierung unabhängig inhaltlich gesichtet. Bei allen acht geänderten Sichten ergab die Messung der verschachtelten Einheiten jeweils null Rückgriffe vor und nach der Änderung. Im G9-Grundkurs verringerte sich die Zahl der sichtbaren Verbindungen auf der Phasenkarte von 15 auf 10. Im echten lokalen Cockpit ließen sich die Originalprüfung und die neun Themenkarten in G8 und G9 mit Grundkurs öffnen. Die eigenständigen Browsertests prüfen auch, dass die letzte Bewertung eines Themenstapels gespeichert wird und den Gesamtstapel offen lässt, solange weitere Karten ausstehen. Die vollständige lokale Physikprüfung bestand für alle 90 Ansichten. Zusätzlich bestanden alle acht Tests zur Einordnung der Methoden. Die übergreifende Strukturprüfung erfasste 387 Ansichten aus 21 kanonischen Landschaften und meldete 0 Fehler und 2.576 Warnungen. Für die nächste Runde hat der Product Owner einen motivierenden Einstieg und einen sichtbaren Übungsabschluss in E.1 angesprochen. [Generatortests](https://github.com/enpasos/skillpilot/blob/main/scripts/test_generate_hessen_physics_stage_views.py) · [Tests der realen Kartenprojektionen](https://github.com/enpasos/skillpilot/blob/main/app/scripts/testHessePhysicsFlashcardActions.ts) · [Browserprüfung der Pfeile](https://github.com/enpasos/skillpilot/blob/main/app/scripts/testNativeLearnerMapUi.ts)

<!-- composition-partial-order-20261117:start -->
## 17. November 2026, 13:53 MEZ (UTC+01:00) — Fachliche Teilordnungen in allen Länderansichten

**Aktueller Integrationsstand:** [PR #160](https://github.com/enpasos/skillpilot/pull/160)
ist am 17. November integriert. Der vollständige
[PR-CI-Lauf 44062503114](https://github.com/enpasos/skillpilot/actions/runs/44062503114)
auf `f62482036186a5c3afc9e58059509922d64f0e8a` ist mit **14 erfolgreichen Jobs**
abgeschlossen. Der integrierte Implementierungscommit
`05eabe5a43d0b07e3845189b5d14d82326f76ce8` hat exakt denselben Git-Baum.
Seine frische [Main-CI 44075738245](https://github.com/enpasos/skillpilot/actions/runs/44075738245)
ist am 17. November um **13:51:57 MEZ mit 14 von 14 erfolgreichen Jobs**
abgeschlossen. **Diese begrenzte Länderlieferung ist damit abgeschlossen.**
Die Jobzahl gehört ausschließlich zu diesem CI-Lauf. Der kleine spätere
Dokumentationsabschluss erhält eigene Dokumentationschecks; der vollständige
Implementierungsnachweis gilt für den hier genannten Commit.
Weiterhin sind **K 0/13 und F 0/7 vollständig abgeschlossen** und **0 neue
reale StagePlans aktiviert**. Die unten dokumentierten Inhaltsreviews,
Lernendenaufgaben, Kartenmessungen und automatisierten Prüfungen bleiben
voneinander getrennte Nachweise. Die folgenden CI-Zwischenstände sind
Historie; ihre damaligen offenen Integrationsschritte gelten nicht als
Beschreibung des jetzigen Merge-Status.

**Historischer Zwischenstand vor den folgenden CI-Korrekturen:** [PR #160](https://github.com/enpasos/skillpilot/pull/160)
ist offen. Der vollständige [PR-CI-Lauf 44025354365](https://github.com/enpasos/skillpilot/actions/runs/44025354365)
endet auf `2c20e11117c130f898b42d929078cd673094590f` mit **10 erfolgreichen
und 4 fehlgeschlagenen Jobs**. Die frühere Aussage um 06:31, sämtliche lokalen
Prüfungen seien abgeschlossen, war zu weitgehend: Zwei generierte Mathematik-
Ausschnitte, der Physik-Visualisierungsstatus und mehrere an die alte Gliederung
gebundene Testannahmen waren nicht aktuell. Die Korrekturen sind jetzt lokal
unabhängig geprüft: **240/240 Tests der vier betroffenen Backendklassen**
bestehen. Die exakten 52 Controller-Fixtures binden Auswahl und unbeschnittene
Lernbasis; reine Dauer-Kompatibilitätsfälle sind keine amtlichen Angebote.
Mathematik und Physik
bleiben im erneut ausgeführten Qualitätsstatus global M7; die geschützten
Untergrenzen bestehen. Merge und frische erfolgreiche Main-CI stehen aus.
Dieser Eintrag aktualisiert den Lieferstand der darunter erhaltenen früheren
Berichte; deren Zahlen und geprüfte Commitbindungen bleiben historische Belege.

**Zweiter CI-Nachtrag:** Der anschließende vollständige
[Lauf 44037739517](https://github.com/enpasos/skillpilot/actions/runs/44037739517)
auf `bce7769b25b5c4f37dc68dace3484d21b590b5d6` endet mit **11 erfolgreichen
und 3 fehlgeschlagenen Jobs**. Ursachen sind ein veralteter G8/G9-Bericht,
alte Navigationsannahmen im Lernzielauswahltest und fehlende Python-
Abhängigkeiten im integrierten Paketbau. Alle 16 Paketgrenztests bestehen
nach der Abhängigkeitskorrektur in einer frischen Python-Umgebung.

**Zusätzlich behobener Fokusfehler:** Die unabhängige Gegenprüfung der
Navigation fand einen echten Laufzeitfehler: In der kanonischen Ansicht
blieben beim Fokus auf Mathematik J8 nur 28 der 40 kanonischen Atome erhalten.
Der Fokus liest jetzt bei kanonischen Wurzeln deren kanonische Unterziele;
synthetische Einheiten behalten ihre tatsächlichen sichtbaren Kinder. Die
sichtbaren Fokusmarkierungen erfassen genau die ausgewählten Blätter. Der
unabhängige Review besteht für alle sechs Fälle aus kanonischer bzw.
bayerischer Ansicht und drei direkten Routen: jeweils **40/40 Fokusatome**,
vollständig erhaltene Lernbasis, 831 Gleichheitsprüfungen synthetischer
Gruppen und 30 exakte Markierungsfälle. Die ursprüngliche Gegenprobe mit
0/40 Atomen bei direkter Route hatte die App-Reihenfolge ohne vorhandene
Scope-Metadaten nachgebildet; sie ist ausdrücklich kein bestätigter
Laufzeitfehler. Die korrigierte Gegenprobe und der anschließende Review sind
getrennt erhalten.

Die Auswahlprüfung bewahrt den exakten kanonischen J8-Umfang mit 48 Knoten
und 40 Atomen. Die Prisma-Prüfung verwendet ein tatsächlich ausgewähltes
Kursziel und dessen 34 atomare Lernziele mit 33 kanonischen
Voraussetzungspfaden. Die Quellverdrahtung von App über useAppCore bis zum
Fokusmemo ist geprüft. Dies sind UI-Logik- und Quellenprüfungen, keine
zusätzliche Browser-/HTTP-Abnahme. Der neue Fünfdateistand samt separatem Workflow-Reihenfolgenachtrag ist
unabhängig freigegeben. Der Vite-Produktionsbau, Typecheck, Lint der geänderten
TypeScript-Dateien, neun CI-Strukturtests und 42 nachfolgende lokale
Prüfschritte bestehen; weitere unveränderte Frontend-Prüfungen laufen. Erfolgreiche vollständige
PR-CI, Merge und frische Main-CI stehen weiterhin aus.

**Dritter CI-Nachtrag:** Im [Lauf 44050515021](https://github.com/enpasos/skillpilot/actions/runs/44050515021)
auf `a5f0dceeb2bb99aa5b13bbbf3e214b72349f8418` sind abschließend **13 von 14
Jobs erfolgreich**, einschließlich des Backends. Der Frontendjob scheitert nach erfolgreichen
UI-Prüfungen und Anwendungsbau ausschließlich am veralteten Zielzähler im
Transparenzinventar: 6.657 statt 6.666. Die neun neuen Physikprüfungen erklären
die Differenz. Der korrigierte Zähler ist unabhängig über alle 21 Kanonmodelle
nachgerechnet; sämtliche anderen Inventurangaben bleiben bytegleich.
Vollständiger lokaler Inventurcheck und bestehende Negativregressionen bestehen.
Die [separaten Belege](https://github.com/enpasos/skillpilot/blob/main/contracts/stage-plan-review-evidence/2026-11-17/partial-order-ci-followup-v3/README.md)
enthalten keine neue inhaltliche oder rechtliche Freigabe. Die zunächst
protokollierte Beobachtung mit noch laufendem Backend bleibt als Zeitpunktbeleg
erhalten. Die korrigierte Lieferung benötigt einen neuen vollständigen
PR-CI-Lauf; Merge und Main-CI bleiben offen.

- **Fortschritt:** weiterhin **K 0/13 und F 0/7 vollständig abgeschlossen**,
  **0 neue reale StagePlans aktiviert**. Geliefert werden 100 Mathematik- und
  90 Physik-Composition-Views für alle 16 Länder und die kanonische Sicht,
  einschließlich der anwendbaren G8-/G9- und Einzelstufenvarianten. Die Länder-
  und Quellenprüfung verbessert K12/K13 sowie F1–F6, schließt deren gesamten
  Auftrag aber nicht allein ab.
- **Modellentscheidung:** explizite fachliche `after`-Teilordnungen ersetzen
  unbegründete Gesamtabfolgen. Atomare Voraussetzungen bleiben erhalten;
  erforderliche Grundlagen erhalten einen belegten Erwerbsplatz. Hessen E.1
  → E.2 → E.3 bleibt geordnet, E.4–E.7 bilden keine gegenseitige Kette.
  Spezielle Relativitätstheorie erhält keine künstlichen Q4-Vorgänger.
  Quellenmitgliedschaft, amtliche Zeitgranularität und Lernplatz bleiben getrennt.
- **Gemessene Kartenwirkung:** 216 native Kontexte, **708 Stufen- und 36.051
  verschachtelte Bretter**, **0 Rückpfeile, 0 Kreise, 0 fehlende erklärte
  `after`-Beziehungen**. Der kontrollierte Vergleich derselben aktuellen
  Messlogik mit eingefrorenen alten Ansichten erfasst 1.148 problematische
  Bretter mit insgesamt 1.432 Rückpfeil-, 884 Kreis- und 1.666 fehlenden
  Ordnungsbefunden; Mehrfachvorkommen sind keine eindeutigen Kanten. Dies ist
  kein erneuter Lauf einer alten Runtime. Exakte native S/L-Vergleiche:
  133 unverändert, 63 quellenbegründete neue Sek-I-Auswahlen, 20 ausschließlich
  durch geprüfte Aufgaben ergänzte Kontexte, 0 unerwartete Umfangsänderungen.
- **Grenze der bisherigen Messung:** Die 216 Kontexte verwenden gleiche
  Kursprofile für Mathematik und Physik. Die zusätzliche Hessen-Prüfung mit
  54 gemischten Kurs-/Stufen-/Dauerkontexten zeigt acht bislang fehlende
  `after`-Erklärungen beim Erwerb der Produktregel. Diese Fälle gehören zum
  laufenden Folgepaket; die obigen Nullwerte gelten nicht pauschal für alle
  Kombinationen. Zusätzlich sind 36 Hessen-Kontexte mit nur einem gewählten
  Fach nativ erfasst; ihre sichtbaren Karten sind noch nicht abgenommen.
- **Neu gefundene Folgearbeit:** Die getrennte unabhängige Kinematikprüfung
  beanstandet die Vollabdeckungsangaben von fünf älteren Aufgaben. Ein sichtbarer
  kanonischer Physik-Vorbereitungsordner trägt außerdem einen irreführenden
  GK-Abiturtitel. Beide Befunde sind im aktiven Folgeauftrag erfasst. Die oben
  genannte M7-Angabe beschreibt den generierten Qualitätsstatus des Bestands;
  dieser CI-Nachtrag ist keine erneute inhaltliche Vollfreigabe aller Aufgaben.
- **Aufgaben und Review:** neun neue eigene Physikaufgaben schließen echte
  Prüfungsendpunktlücken in vorhandenen Kompetenzen. Unabhängige inhaltliche
  Agentenreviews prüfen beide Sprachfassungen, Kompetenzabdeckung und Rubriken.
  Drei Aufgaben erhalten zusätzlich die fachlich geprüfte fehlende
  Inhaltszuordnung zur Bewegung. Aufgabeninhalte und atomare Voraussetzungen
  werden dadurch nicht verändert. Das sind keine menschlichen Lernversuche
  und keine nachgewiesene Lernwirksamkeit.
- **Automatisierte Nachweise:** tatsächlicher HTTP-Vergleich aller 432
  Antwortinhalte, 160 Länder-Browserbretter und 60 zusätzliche Hessenbretter
  bestanden; Typechecks, Lint, Schemas, Graph- und Quellenprüfungen sind
  separat protokolliert. Die vollständige Qualitätsgenerierung, ihr aktueller Statusvergleich
  und die geschützten Untergrenzen bestehen. Beide Mathematik-Modellexporte
  sind in allen 213 Dateien bytegleich; reproduzierbare ZIP und sechs
  Offlinegates bestehen. Der CI-Nachtrag reproduziert nach der MV-/SL-Korrektur
  ebenfalls alle 213 Modelldateien bytegleich und besteht alle sechs Offlinegates
  mit dem neuen Digest `c2df283bfd35…`. Sechs betroffene native Kontexte behalten
  exakt S/L und zwölf bytegleiche Kartenfixtures; 18 Stufen- und 822 Innenbretter
  wurden erneut gemessen. Alle Belege sind dauerhaft gebunden.
- **Kontrollstellen für den Owner:** Hessen G8 und G9 → Physik → E-Phase
  (Wurf bei E.1, verzweigende E.4–E.7); Hessen → Q4 (unabhängige SRT);
  Mathematik/Physik in einem anderen Land → Sek I und Sek II mit den
  quellenbelegten Jahres-/Phasenbändern und vorhandenen Abiturangeboten.
- **Belege:** [Modell und Laufzeit](composition-view-partial-orders-2026-11-16.md),
  [Mathematikquellen](mathematics-stage-view-source-units-2026-11-17.md),
  [Physikquellen](physics-stage-view-source-units-2026-11-17.md),
  [unabhängige Reviews und aktuelle Kartenmessung](https://github.com/enpasos/skillpilot/blob/main/contracts/stage-plan-review-evidence/2026-11-16/composition-partial-order-v1/README.md).
  Zusätzlich: [unabhängige CI-Reparaturreviews, 240 Backendtests und Paketneubau](https://github.com/enpasos/skillpilot/blob/main/contracts/stage-plan-review-evidence/2026-11-17/partial-order-ci-repair-v1/README.md).
  Der [zweite CI-Nachtrag mit unabhängigem Fokusreview](https://github.com/enpasos/skillpilot/blob/main/contracts/stage-plan-review-evidence/2026-11-17/partial-order-ci-followup-v2/README.md)
  bindet die aktuelle Korrektur und bewahrt die früheren Gegenbefunde.
  Die Paket-Redistributionsfreigabe bleibt dort, wo menschliche Freigaben
  ausstehen, ausdrücklich offen. Keine Produktionsbereitstellung.
- **Nächster Schritt:** die Mathematik-Physik-Verzahnung mit den realen
  Hessen-Plänen für G8/G9 und unabhängig gewählten Kursprofilen zusammenführen,
  fachliche Voraussetzungen und eigene Aufgaben prüfen sowie die tatsächlichen
  verschachtelten Karten erneut messen. Dieser getrennte aktive Folgeumfang
  und die vollständigen K1–K13-/F1–F7-Aufträge sind noch nicht abgeschlossen.
<!-- composition-partial-order-20261117:end -->

## 17. November 2026, 06:31 MEZ (UTC+01:00) — Nachtrag zum Abschluss von PR #159

Die beim damaligen Bericht noch laufende Main-CI ist inzwischen abgeschlossen.
Der zum Merge von [PR #159](https://github.com/enpasos/skillpilot/pull/159)
ausgelöste [CI-Lauf 43832099252](https://github.com/enpasos/skillpilot/actions/runs/43832099252)
bindet den Implementierungscommit
`9975a142f7a26f1c4ff31c46a70e149d82a3fce5` und ist vollständig erfolgreich:
**14 von 14 Jobs dieses konkreten Laufs**. Status und einzelne Jobs wurden
am 17. November erneut abgerufen; es wird kein neuer CI-Lauf an diesem Tag
behauptet. Die technische Integrationsbedingung dieses Pakets ist damit erfüllt.
Zusätzliche K-/F-Gesamtabschlüsse folgen daraus ohne erneute Inhaltsprüfung
nicht. Der nachfolgende Bericht bleibt als damaliger Zwischenstand erhalten.
Die noch laufende Lieferung in PR #160 braucht ihre eigene vollständige
PR-CI und anschließend ihre eigene frische Main-CI.

## Historischer Gesamtstand vom 16. November 2026, 09:40 MEZ

**Stand: 16. November 2026, 09:40 MEZ (UTC+01:00).**

**Integration:** [PR #159](https://github.com/enpasos/skillpilot/pull/159) ist
nach einer vollständigen erfolgreichen PR-CI mit **14/14 Jobs** auf `main`
integriert, Commit `9975a142f7`. Die frische Main-CI läuft. Bis zu ihrem
vollständigen Erfolg bleibt das Umsetzungspaket offen; die folgenden Zahlen
sind keine Deployment- oder Unterrichtsabnahme.

**Fortschritt: K 0/13 und F 0/7 vollständig abgeschlossen · 0 reale Landespläne
aktiviert.** K4, K6, K8 und F7 sind eng abgegrenzte Abschlusskandidaten. Ihre
aktuellen Eingangsbindungen werden vor dem Abschluss noch einmal gegen den
integrierten Stand geprüft; laufende CI und Teilumsetzungen werden nicht gezählt.

**Wirkung der integrierten Kartenreparatur:** Die tatsächlich exportierten
kanonischen Karten haben oben **0 Rückpfeile und 0 freistehende eigene
Fachziele** in GK, LK und GK+LK. Zwölf ergänzende Fachkartenfälle sichern
Mathematik und Physik getrennt ab. Notwendige Fremdfachvorbereitung bleibt
Teil der Lernbasis. Innen verbleiben **8/9/9 Pfeile mit 20/23/25 atomaren
Ursachen**; die sieben zusätzlich vom früheren Kandidaten erzeugten Ursachen
sind entfernt. Im getrennten kanonischen Sek-I-Ausschnitt bleiben sieben
innere Pfeile und ein Außenatom offen.

**Länderbreite:** Der letzte vollständige regionale Vergleich vom
15. November, 23:49 MEZ, enthält **57 zulässige regionale Kontexte, davon 39
mit obersten Rückgriffen**. Die gesamte 72er-Matrix enthält zusätzlich drei
kanonische und zwölf widersprüchliche Dauerkontexte. 35/60 zulässige
Gesamtkontexte haben Außenatome. Diese ältere Messung ist kein frischer
Gesamtreplay des integrierten Standes und deckt keine unabhängig gemischten
Fachprofile ab. Die engeren aktuellen Nachmessungen ersetzen sie nicht.

| Umfang | Geliefert und noch offen |
| --- | --- |
| K1, K2 | Elementarer Halbleiterpfad und echte Diagrammaufgaben geliefert. Materialklassifikation, weitere Physikanschlüsse und vollständige Länder-/Jahrgangszuordnung bleiben offen. |
| K4, K6, K8 | Die ursprünglichen begrenzten Stufen-/Voraussetzungsbefunde sind unabhängig geprüft. Abschluss erst nach aktueller Eingangsbindung und frischer grüner Main-CI; weitere innere Rückgriffe bleiben getrennt offen. |
| K3, K5, K7, K9–K11 | Aufgaben, Quellenrollen und Platzierungen teilweise repariert; weitere Länderfälle und Außenatome bleiben offen. Die historische Freifallaufgabe behauptet weiterhin eigene Versuchs-/Tabellenleistungen, die ihr Text nicht verlangt. |
| K12, K13 | Physik-Erwerbsrouten und einzelne Stufensichten korrigiert; die vollständige Prüfungsvoraussetzungsbereinigung und Ableitung aller Stufensichten fehlen. |
| F1, F2 | Gemeinsamer Vertrag 1.3 und verschachtelte Jahre/E-/Q-Phasen vorbereitet. Vollständige Paket-/Laufzeitanbindung und reale Landesplanaktivierung fehlen. Der HE-Pilot umfasst weiterhin G8 und G9. |
| F3, F4, F6 | Kanonische oberste Karten bereinigt; Diagnose berücksichtigt jetzt echte Fach-/Kurskombinationen. Reale Plankarten, Vorbereitung am ersten Bedarf und gemessene innere Wirkung bleiben offen. Die Berichtgrenze von 1.024 Kombinationen ist ausdrücklich keine Abnahme für 20 Fächer. |
| F5 | Der vollständige fachliche Befundbestand bleibt offen; einzelne unabhängige Fachreviews ersetzen diesen Abschluss nicht. |
| F7 | Zweisprachige Zielnorm und Abgrenzung vom Laufzeitbestand sind mit #159 integriert. Abschluss wartet auf frische Main-CI. |

**Nächstes lokales Paket:** HE-Planquellen sowie Paket- und Laufzeitleser liegen
getrennt auf `feat/stage-plan-he-runtime-20261116`. 69 gezielte Java-Tests
bestehen; ein echter Mathematik-Quellenfragment-Replay besteht ebenfalls.
Das ist noch kein vollständiger aktivierter Landesplan oder erfolgreicher
vollständiger Paketexport. Echte Hessen-Messungen zeigen, dass Stufenumfang
nicht aus dem Lernzeitpunkt abgeleitet werden darf. Deshalb erhält die volle
Autorität ausdrückliche Stufenmitgliedschaften; Jahrgangs-/Phasenplätze bleiben
eine separate, eindeutige Zuordnung. Die neue Auswahl ist bislang nur im
Schema und TypeScript-Materialisierer umgesetzt. Sie ist nicht aktiviert.

Die [Übergabe](stage-plan-units-handover-2026-11-15.md) bleibt die vollständige
Auftragsliste. Die [unabhängige Restauftragsprüfung](https://github.com/enpasos/skillpilot/blob/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-16/current-scope-review-v1/README.md)
und der [spätere K8-Nachreview](https://github.com/enpasos/skillpilot/blob/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-16/k8-current-delta-independent-v1/README.md)
behalten ihre ausdrücklich benannten Prüfstände; sie werden nicht stillschweigend
zu neuen Gesamtabnahmen erklärt. Frühere Zwischenzahlen und Fehlversuche
bleiben in der Git-Historie und den unveränderten Belegen erhalten.

## 16. November 2026, 09:40 MEZ — Reviewbefunde und gebündelte CI-Korrekturen

**Stand: [PR #159](https://github.com/enpasos/skillpilot/pull/159) ist nach
14/14 erfolgreichen Jobs seiner vollständigen PR-CI auf `main` integriert
(`9975a142f7`). Die frische Main-CI läuft; das Paket ist noch nicht abgeschlossen.
Frühere Paket-, Browser- und Fachnachweise behalten ihren jeweils gebundenen
Implementierungsstand.**

- **Fortschritt:** K 0/13, F 0/7 abgeschlossen, 0 reale Landespläne aktiviert.
  Kanonisch oben: 0 Rückpfeile und 0 freistehende eigene Fachziele, auch in den
  zwölf getrennten Fachkartenfällen. Regional bleiben 39/57 Fälle mit obersten
  Rückgriffen; 35/60 zulässige Gesamtkontexte haben Außenatome. Der gepushte Stand
  `b81b585d0` erreicht innen frisch gemessen wieder 8/9/9 Pfeile
  statt 11/12/12 am vorherigen Kopf. Diese verbleibenden Pfeile bleiben eine Restaufgabe.
- **Ergebnis:** Skalar- und Vektorprodukt liegen gültig in Sek II; frühe
  Messgrundlagen und notwendige Fremdfachvorbereitung bleiben erreichbar.
  Gegenüber main enthält das Paket 57 neue Physik- und 44 Mathematikaufgaben.
  Aufgabeninhalt, Rubriken, Quellenrollen und Platzierungen wurden getrennt
  geprüft. Die Jahrgangs-/Phasenstruktur ist im gemeinsamen Planvertrag
  vorbereitet; damit ist noch kein realer Landesplan aktiviert.
- **Entscheidungen im CI-Nachtrag:** Drei echte Rechenvoraussetzungen ergänzen
  ausschließlich die Spektrumsaufgabe. 58 fehlende Astronomie-Aufgabenplätze
  werden ergänzt; eine vorhandene Stoßaufgabe kommt in vier HE-Sichten hinzu.
  In allen zwölf HE-Kontexten wächst die atomare Lernbasis nur um diese Aufgabe.
  Mathematik erhält 16 ausdrückliche Quellenbindungen für materialisierte
  Aufgabengruppen; der Generator reproduziert 18 Sichten. Die SH-Quelle zu
  einfachen Ungleichungen ist korrigiert, ohne eine offizielle Jahrgangsstufe
  zu erfinden. Vertrag 1.3 transportiert 28 vorhandene Aufgabenbilder bei
  31 Aufgaben-Bild-Zuordnungen; Bilddateien und Aufgaben bleiben unverändert.
  Die beiden historischen JSON-Autorenquellen erhalten genau begrenzte
  Herkunftsnachweise im Paket; eigene Aufgaben bleiben als Inhalt klassifiziert.
  Die Abschlussautomatik muss offene Lernkarten bis zum bestätigten Abruf
  erforderlich halten; sie werden dadurch nicht zu Prüfungsaufgaben umdeklariert.
  Der getrennt versionierte Browsernachweis bindet die genaue lernerspezifische
  Datenroute; historische Runner und sämtliche Schutzprüfungen bleiben erhalten.
  Die Deployment-Abfrage bei unverändertem GitHub-Stand ist bereits seit
  #157 auf main; sie ist keine neue Lieferung von #159.
  Der jüngste Nachlauf aktualisiert sieben öffentliche Physikbeschreibungen
  und den erzeugten Bildstatusbericht. Der Browser-Test prüft beide gültigen
  Übersichtsformen mit ihren Vorbereitungszweigen; die Produktionsnavigation
  bleibt dabei unverändert. Bildabdeckung wird weiterhin getrennt von einer
  inhaltlichen Bildfreigabe ausgewiesen.
  Zwei weitere Statusberichte werden ausschließlich mit aktuellen Messwerten
  abgeglichen; 53 fehlende öffentliche Mathematik-Quellenbegründungen bleiben
  sichtbar. Die Physik-Tests sichern die aktuellen Erwerbsrouten statt alter
  zurückgenommener Aufgaben. Ein genau begrenzter Generator-Nachtrag erhält
  die bereits dokumentierte Transistor-Versuchszuordnung auch bei Neuerzeugung;
  die historischen K1-Belege und alle übrigen Zuordnungen bleiben unverändert.
- **Drei Kontrollstellen:** [Frische Kartenwirkung und Nachweise des Nachtrags](https://github.com/enpasos/skillpilot/blob/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-16/external-review-followup-v1/README.md),
  [neue Daten- und Browserkorrekturen mit unabhängigen Reviews](https://github.com/enpasos/skillpilot/blob/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-16/ci-metadata-and-browser-followup-v1/README.md),
  [Gesamtauftrag mit Zielzustand und offenen Befunden](stage-plan-units-handover-2026-11-15.md).
- **Nachweise:** Lokal bestehen 354 Ansichtskontrollen, alle 21 Katalog- und
  zwölf Routen-Mindeststände (Mathematik/Physik M7), Schema- und JSON-Kontrollen
  über 120.706 Dateien,
  TypeScript und Lint. [Alle 17 ursprünglichen Backend-Testfehler](https://github.com/enpasos/skillpilot/blob/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-16/backend-ci-test-repair-v1/README.md)
  bestehen im gemeinsamen Nachlauf. Hinzu kommen 60 Java-Pakettests sowie
  unabhängige Modell-, Quellen- und Sicherheitsreviews. Die
  [Lernkartenkorrektur](https://github.com/enpasos/skillpilot/blob/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-16/memory-explicit-completion-v1/README.md)
  hat 136 bestandene Completion-Tests und 13 unabhängige Gegenprüfungen.
  Der [tatsächliche Paketnachweis](https://github.com/enpasos/skillpilot/blob/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-16/package-assessment-materials-pipeline-v1/README.md)
  bindet die reproduzierbare ZIP-Datei und den frischen vollständigen Anwendungstest;
  frühere Fehlversuche bleiben getrennt erhalten. Der vorherige Remote-Lauf
  hatte acht erfolgreiche und sechs fehlgeschlagene Jobs. Der anschließende
  Lauf endete mit zehn erfolgreichen und vier fehlgeschlagenen Jobs. Dessen
  vier Reparaturen bestehen im anschließenden Lauf mit elf erfolgreichen und
  drei fehlgeschlagenen Jobs. Dessen drei Fehlerstellen und die vier zusätzlichen
  lokalen Befunde sind nun korrigiert und mit Originalfehlern, normalen Nachtests
  und unabhängigen Reviews dokumentiert. Der vollständige lokale Nachlauf
  bestätigt alle 21 Katalog- und zwölf Routen-Mindeststände. Automatisierte
  Checks und Agentenreviews belegen keine Unterrichtswirkung und ersetzen keine
  frische Main-CI.
- **Nächster Schritt:** Die frische Main-CI bis zum Abschluss prüfen und danach
  Implementierungscommit und terminalen Lauf im Abschlussvermerk binden.
  Reale HE-Pläne und weitere Fachreparaturen bleiben im getrennten nächsten
  Umsetzungspaket Teil des unverkleinerten Gesamtauftrags.

## 15. November 2026, 22:51 MEZ — Zielnorm und Bestandsaufnahme abgeglichen

**Stand: Abgeschlossener Dokumentationsreview im Lieferumfang von
[PR #159](https://github.com/enpasos/skillpilot/pull/159); Dokumentchecks
bestanden. Keine neue Laufzeitfunktion oder Integration behauptet.**

- **Fortschritt:** K 0/13 und F 0/7 vollständig abgeschlossen; 0 reale
  Landespläne aktiviert. Dieses Paket präzisiert F7 und die weiterführende
  Zielnorm; es verändert selbst keine Rückgriffe oder Qualitätsgrade.
- **Ergebnis und Entscheidungen:** Das Konzept bleibt verbindlicher
  Zielzustand. Der Implementierungsanhang beschreibt getrennt, was tatsächlich
  besteht. Eine offene Prüfung gilt weiterhin als offen; ein Revieweintrag
  allein erteilt keine Anerkennung. Die Reihenfolge ganzer Einheiten muss
  widerspruchsfrei sein. Die behauptete Unterbrechung der Traversierung an
  gemeisterten Zwischenzielen war veraltet: der Fix ist bereits auf main.
  Globale revisionsgebundene Anerkennung und vollständige Durchsetzung der
  Einheitenverträge bleiben offene Implementierungsaufträge.
- **Kontrollstellen:** [Bewertung der beigefügten Kritik](graph-definition-documentation-review-2026-11-15.md),
  [Einheitenfolge und Lernweise](../concept/skill-graph/learning-unit-progression.de.md),
  [datierter Implementierungsstand](../concept/skill-graph/compendium-appendix.de.md).
- **Nachweise:** Unabhängiger bilingualer Agentenreview mit 21 geprüften
  Kapitelpaaren und drei gezielten Modellgegenbeispielen; 62 tatsächlich
  ausgeführte lokale Backendtests bestehen ohne Fehler oder Auslassungen.
  Alle zehn DE-/EN-PDFs und 80 Webausgaben sind neu gebaut. Quellen-,
  Ausgabe-, Terminologie-, Link- und Indexchecks sowie MkDocs strict bestehen.
  Dies sind weder Prüfungsaufgaben für Lernende noch eine Main-Abnahme.
  [Erhaltene Review- und Testbelege](https://github.com/enpasos/skillpilot/tree/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-15/documentation-critique-review-v1).
- **Nächster Schritt:** Die präzisierte Norm mit dem geprüften Fachpaket
  integrieren. Umsetzungsdefizite bleiben bis zu
  ihrem eigenen Nachweis sichtbar; die Norm wird nicht auf den Bestand verkürzt.

## 15. November 2026, 15:38 MEZ — Abnahme an den tatsächlichen Lernkarten konkretisiert

**Stand: Diagnose und Umsetzung laufen lokal; noch kein Folge-PR. #157 ist
integriert und seine frische Main-CI erfolgreich. Dieses Folgepaket ist offen.**

- **Fortschritt:** K1–K13/F1–F7 bleiben der Gesamtauftrag; **K 0/13, F 0/7
  abgeschlossen, 0 reale Landespläne aktiviert**. Die aktuelle Messung hat
  einen tatsächlichen Rückschritt sichtbar gemacht, keinen Abschluss belegt.
- **Ergebnis und Entscheidungen:** Auf den obersten Physik- und
  Mathematiktafeln sollen die roten Rückgriffe durch fachliche Bereinigung
  entfallen. Die freistehenden Vorbereitungsknoten zu Skalar- und Vektorprodukt
  entstehen durch zwei getrennte Oberstufeneinheiten bei der tatsächlichen
  GK+LK-Zusammenführung. Deren gemeinsame Identität wird korrigiert;
  benötigte Kompetenzen und Lernnachweise bleiben erhalten. Die echten
  Rückgriffsbeziehungen brauchen daneben fachliche Bereinigung. Insbesondere
  müssen irrtümlich in Sekundarstufe I aufgenommene Oberstufenaufgaben an
  ihrem eigentlichen Lernplatz stehen; bloßes Verschieben ihrer notwendigen
  Vorbereitung würde den Fehler verdecken.
  Sekundarstufe I erhält Jahrgangsstufen als Untereinheiten; Sekundarstufe II
  erhält E-Phase und Q1–Q4 beziehungsweise die zutreffenden Landesbezeichnungen.
  Dies wird im gemeinsamen Planvertrag umgesetzt und auch innerhalb der
  Untereinheiten auf Rückgriffe geprüft. Die bisherige reine Stufengrundlage
  erfüllt diese Abnahme noch nicht.
- **Kontrollstellen:** Die vom Product Owner gezeigten Tafeln mit Physik
  204/418 und Mathematik 334/616 Zielen; die Ursachenpfade im entstehenden
  Vergleichsbericht; die aufgeklappten Jahrgangs- und Phaseneinheiten.
- **Nachweise:** Ein unabhängiger Agent hat die tatsächliche Kompositions-,
  persönliche Curriculum- und Lernkartenprojektion auf Ausgangsstand,
  integriertem #157 und aktuellem Kandidaten ausgeführt. Die ursprünglichen
  Screenshots stimmen einschließlich beider Vorbereitungsknoten exakt.
  In der zusammengeführten Sicht sind 41 direkte Rückgriffsbeziehungen erfasst;
  nach Fachfilter bleiben 28 in Physik und sechs in Mathematik. Diese Zählung
  ist von den 43 Beziehungen der getrennten bundesweiten Kursansicht zu
  unterscheiden. Die tatsächliche fachliche Reparatur ist noch nicht abgenommen.
- **Nächster Schritt:** Fachliche Reparaturen umsetzen und die echten Sichten vor und
  nach dem nächsten Fachpaket vergleichen. Ein früherer Statusvergleich oder
  eine grüne CI ersetzt diesen Wirkungsnachweis nicht.

## 15. November 2026, 15:59 MEZ — Lernbilder an die vorhandene Bildsprache anpassen

**Stand: Neun ruhige Endfassungen lokal importiert und durch den ausführenden
Agenten fachlich und visuell geprüft; noch nicht auf main. Kein abgeschlossener
Lieferumfang und keine menschliche Freigabe.**

- **Fortschritt:** Neun neue aktive Physik-Lernbilder identifiziert: vier aus
  #157 und fünf im folgenden lokalen Paket. Alle neun Ersatzbilder sind über
  die bestehende Produktionspipeline importiert (zusammen rund 2,25 MB).
  Zwölf ältere Rasterdateien sind bytegleich erhalten, darunter beide zugleich
  als Aufgabenmaterial verwendeten PNGs. Deren Aufgabenverweise bleiben gleich.
- **Ergebnis und Entscheidungen:** Die vorhandene Produktionspipeline mit
  explizitem Provider, tatsächlichem Prompt, Import und Bildprüfung wird
  verwendet. Nach dem aktuellen Owner-Feedback gilt eine ruhige, locker
  gezeichnete Gestaltung ohne dekorative Strahlen, Glitzer und flächendeckende
  Hervorhebungen. Zwei bisherige PNGs dienen zugleich als Aufgabenmaterial;
  ihre exakten Bytes und Aufgabenverweise werden erhalten.
- **Kontrollstellen:** Materialvergleich, Dotierung und Bewegungsdiagramme;
  Darstellung in 360 und 680 Pixel Breite; unveränderte Aufgabenmaterialien
  der beiden eigenen Transistorversuche. Der konkrete Prüf- und Importbericht
  liegt unter
  `curricula/DE/Gymnasium/quality/goal-visualization-review/physics-stage-flow-quiet-20261115-v1/`.
- **Nachweise:** Die unabhängige Bestandsaufnahme hat tatsächliche Bildlinks,
  Verbraucher und Stilreferenzen geprüft. Die bisherigen Bildentwürfe wurden
  tatsächlich angesehen. Der ausführende Agent hat anschließend alle neun
  Endfassungen in beiden genannten Breiten gelesen und fachlich geprüft.
  Asset-Check (2.575 Bildlinks), Physik-Bild-QA und Transparenzinventar bestehen
  lokal; Quell-, Frontend- und Backend-JPEGs sind bytegleich. Dies ist eine
  tatsächliche Eigenprüfung der Bilder, keine unabhängige Inhaltsfreigabe.
- **Nächster Schritt:** Die betroffenen Lernzielbuch-Seiten und aktuellen
  Fachreview-Bindungen validieren und das gesamte Paket durch die CI bringen.
  Die Gesamtverantwortung bleibt beim ausführenden Agenten; eine externe
  Gemini-Übernahme ist derzeit nicht nötig.

## 15. November 2026, 15:18 MEZ — Modellnorm für Stufenpläne vereinheitlicht

**Stand: lokal umgesetzt und unabhängig geprüft; noch kein Folge-PR.
[#157](https://github.com/enpasos/skillpilot/pull/157) ist nach erfolgreicher
PR-CI integriert. Integration und frische Main-CI dieses separaten Normpakets
stehen aus.**

- **Fortschritt:** F7 als lokale Normlieferung vorbereitet.
  **K 0/13, F 0/7 abgeschlossen; 0 reale Landespläne aktiviert.**
  Rückgriffe werden durch diese Normkorrektur noch nicht praktisch abgebaut.
- **Ergebnis und Entscheidungen:** Ein gemeinsamer Plan je Land und
  Dauermodell bestimmt die Stufen über die Fächer hinweg. Offizielle Zuordnung
  und geeigneter Lernplatz bleiben unterscheidbar. Die Reihenfolge von
  Einheiten erzeugt keine zusätzlichen Voraussetzungen oder Lernnachweise.
  Notwendige Vorbereitung gehört an ihren frühesten tatsächlichen Bedarf;
  bereits später eingeordnete Ziele werden nicht stillschweigend verschoben.
  Die bestehende Laufzeit bleibt ausdrücklich vom Zielmodell getrennt.
- **Kontrollstellen:** [Einheiten und Grenzfälle](../concept/skill-graph/learning-unit-design-and-examples.de.md),
  [Zuordnung und Lernplatz](../concept/skill-graph/view-projection-and-goal-placement.de.md)
  sowie [Begriffe und Abgrenzungen](../concept/glossary.de.md).
- **Nachweise:** Das unabhängige erste Review verlangte vier Normkorrekturen
  und drei Konsistenzkorrekturen; die zweite Fassung ist angenommen.
  26 geänderte Quellen und 26 Registerzeilen sind abgeglichen, sieben
  Gegenbeispiele geprüft. Der native Build erzeugt 44 Markdownseiten und
  sechs PDFs aus denselben deutschen und englischen Quellen; alle sechs
  PDF-Builds bestehen. Der erste Versuch scheiterte an einer fehlenden lokalen
  TeX-Abhängigkeit und bleibt dokumentiert. Dies sind Agentenreviews und
  automatisierte Dokumentchecks, keine implementierte neue Lernlaufzeit.
- **Nächster Schritt:** Das Normpaket zusammen mit den nächsten geprüften Fachreparaturen liefern.
  Bei diesen prüfen wir insbesondere, dass frühere Papieraufgaben keine
  tatsächlich nicht ausgeführten Versuche nachweisen.


## 15. November 2026, 15:38 MEZ — Rollout bei unverändertem Git-Stand

**Stand: Mit [PR #157](https://github.com/enpasos/skillpilot/pull/157) um
14:25 MEZ auf main integriert und nach erfolgreicher frischer Main-CI um
15:36 MEZ abgeschlossen. Kein Produktionsrollout durchgeführt.**

- **Fortschritt:** Zusatzauftrag des Product Owners; K 0/13 und F 0/7
  abgeschlossen, 0 reale Landespläne aktiviert. Der Zusatzauftrag ändert
  keine curricularen Rückgriffe.
- **Ergebnis und Entscheidung:** `./deploy_skillpilot.sh` bietet bei
  unverändertem Commit Abbruch oder erneuten Rollout an. `j` setzt fort;
  `n`, Enter oder Eingabeende brechen vor Build und Service-Neustart ab.
  Neue Commits und der ausdrücklich gewählte Git-Übersprung behalten ihren Ablauf.
- **Kontrollstellen:** [Betriebsanleitung](../deploy/deployment.de.md),
  [Auswahl im Deployment-Skript](https://github.com/enpasos/skillpilot/blob/a7f0fa82afee1f74b4689ed02db98246d72377b0/scripts/deploy.sh),
  [automatisierte Verhaltenstests](https://github.com/enpasos/skillpilot/blob/a7f0fa82afee1f74b4689ed02db98246d72377b0/scripts/test_deploy_no_changes.py).
- **Nachweise:** Shell-Syntaxprüfung erfolgreich; sechs neue Verhaltenstests
  bestehen einschließlich Wiederholung, Abbruch, fehlerhaftem Git-Pull und
  Neustart der aktualisierten Engine. Die neun bestehenden Backup-Tests und
  neun CI-Aufteilungstests bestehen ebenfalls. Die neuen Verhaltenstests sind
  in den vorhandenen CI-Job aufgenommen; die lokalen Tests führen keinen echten
  Rollout aus.
- **Integration:** [Implementierungscommit a44c157b53](https://github.com/enpasos/skillpilot/commit/a44c157b536680985dca30737b560b10c7633a04),
  [Main-CI 43718928027](https://github.com/enpasos/skillpilot/actions/runs/43718928027):
  **14/14 Jobs erfolgreich**, einschließlich des Deployment-Verhaltenstests.
- **Nächster Schritt:** Kein weiterer Umsetzungsschritt für diese Auswahl.
  Ein tatsächlicher Produktionsrollout ist eine getrennte Betriebsaktion.

## 15. November 2026, 15:38 MEZ — Halbleiterpfad, Diagrammaufgaben und Stufenplangrundlage

**Umsetzungspaket #157 abgeschlossen: auf main integriert, frische Main-CI
um 15:36 MEZ erfolgreich. K1/K2 und F1/F2/F6 bleiben teilweise offen.**

- **Fortschritt:** **K 0/13 und F 0/7 vollständig abgeschlossen; 0 reale
  Landespläne aktiviert.** Die reale Wirkung ist jetzt gemessen: Bayern
  9 → 10, bundesweite feste Kursansicht 39 → 43 Rückgriffsbeziehungen.
  Die bestandene technische Lieferung ist deshalb keine fachliche Gesamtabnahme.
- **Ergebnis und Entscheidungen:** Drei neue Physikkompetenzen und drei Aufgaben
  trennen einfaches Dotierungsmodell, Diodenkennlinien und einen eigenen
  Transistor-Schaltversuch; 33 Quellenzuordnungen sind korrigiert. Vier
  Diagrammaufgaben ersetzen eine unbelegte Algebra-Abdeckung. Tabellenaufbau,
  Tabellenlesen und elementares Diagrammlesen erhalten passende Aufgaben und
  bereinigte Voraussetzungen. Planvertrag v1.3 und Diagnosekern bilden die
  Grundlage für reale Pläne; sie aktivieren noch keine neue Planlaufzeit.
  Die CI-Reparaturen berichtigen veraltete Bindungen und einen fehlerhaften
  Token-Texttest, ohne Qualitätsgrenzen zu senken.
- **Kontrollstellen:**
  [Physik: Kompetenzen und Bewertungsraster](https://github.com/enpasos/skillpilot/blob/a44c157b536680985dca30737b560b10c7633a04/curricula/DE/Gymnasium/quality/goal-model-review/physics-semiconductor-learning-path-20261115/post-corrected-independent-review-v3/README.md),
  [Mathematik: Tabellenkompetenz und Inhaltsreviews](https://github.com/enpasos/skillpilot/blob/a44c157b536680985dca30737b560b10c7633a04/curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/k2-table-task-boundary-current-v2/README.md),
  [tatsächliche Rückgriffe und Screenshot-Ursachen](stage-plan-real-view-backflows-2026-11-15.md).
- **Nachweis und Integration:** [PR #157](https://github.com/enpasos/skillpilot/pull/157)
  ist nach 14/14 erfolgreichen PR-CI-Jobs um 14:25 MEZ gemergt.
  Die frische [Main-CI 43718928027](https://github.com/enpasos/skillpilot/actions/runs/43718928027)
  am [Implementierungscommit a44c157b53](https://github.com/enpasos/skillpilot/commit/a44c157b536680985dca30737b560b10c7633a04)
  besteht mit **14/14 Jobs**. Alle 21 Kataloge behalten ihre Reifegrade,
  insbesondere Mathematik und Physik M7. Zusätzliche Workflows für
  Assessment-Abschluss, Gemini, OAuth und Dokumentation sind separat erfolgreich;
  sie werden nicht zur Jobzahl dieses Laufs addiert. Inhaltsreviews und
  automatisierte Nachweise belegen keine bereits beobachtete Lernwirkung.
- **Nächster Schritt:** Die gemessenen Rückgriffe fachlich beseitigen,
  eigene Versuche und weitere Kompetenznachweise vervollständigen, Jahrgänge
  und E-/Q-Phasen einbinden und reale Landespläne aktivieren. Die neue Lieferung
  wird erneut an tatsächlichen Lernkarten und vollständiger CI gemessen.

## 15. November 2026, 09:09 MEZ — Offene Ausgangslieferungen integriert

**Abgeschlossen; rückblickender Eintrag, CI-Zählung am angegebenen Zeitpunkt korrigiert.**

- **Fortschritt:** Zwei Ausgangs-PRs integriert; K 0/13 und F 0/7 abgeschlossen,
  0 reale Landespläne aktiviert, keine gemessene Gesamtwirkung auf Rückgriffe.
- **Ergebnis und Entscheidungen:**
  [#156 Übergabe](https://github.com/enpasos/skillpilot/pull/156) und
  [#153 Lernkartenvorschau](https://github.com/enpasos/skillpilot/pull/153)
  nach erfolgreichen PR-Checks integriert. Beide bilden die Arbeitsgrundlage;
  sie beheben noch keinen der übernommenen Fachbefunde.
- **Kontrollstellen:** [Auftragsumfang und Abnahmebedingungen](stage-plan-units-handover-2026-11-15.md#7-lieferstand-des-delegierten-auftrags)
  sowie die [Vorschau in #153](https://github.com/enpasos/skillpilot/pull/153).
- **Nachweis und Integration:** Die frische
  [Main-CI 43674399591](https://github.com/enpasos/skillpilot/actions/runs/43674399591)
  für [Commit a7c7e9ceb2](https://github.com/enpasos/skillpilot/commit/a7c7e9ceb26f06194e25f29e32941d4e4cb17c32)
  endete am 15. November 2026 um 05:54 MEZ erfolgreich: **14/14 Jobs bestanden**.
  Die früher genannten 25 erfolgreichen und zwei übersprungenen Checks waren
  eine zeitgebundene Summe mehrerer Workflows am Commit, nicht die Jobzahl
  dieses Laufs.
- **Nächster Schritt:** K1–K13 und F1–F7 in zusammenhängenden Lieferungen umsetzen.
