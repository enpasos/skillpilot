# Bestätigung E · Laufendes Ziel nach einer Umgruppierung

**Freigabe für `fc7cab9ca1` im vereinbarten Umfang.** Wer Straßenverkehr oder Bezugssysteme vor der Umgruppierung begonnen hat, kann das Ziel unter dem gewählten E.1-Fokus im Coach fortsetzen und bestehen. Cockpit, Navigation, Abschlussangebote und Sicherung behandeln weiterhin allein E.1 als Auswahl. Beide unabhängigen Gutachter bestätigen die Korrektur. Die 18 gezielten H2-Testfälle bestanden. [Gutachten A](reviewer-a.md) · [Gutachten B](reviewer-b.md) · [Prüfnachweis](independent-review.actual.json)

Der Vergleich umfasst die Basis `53fd44c88b`, den ersten Fix `1431a79dbe` und die Korrektur `fc7cab9ca1` auf `fix/laufendes-ziel-nach-umgruppierung`. Für die ersten beiden Spalten sind alle 59 Dateien des Nachweises der ersten Runde anhand ihrer Prüfsummen verifiziert. Die dritte Spalte stammt aus neuen Läufen. Die fachlichen Ergebnisse stimmen bei ein- und ausgeschaltetem Einheitenpilot überein. [Erste Runde](../independent-review.actual.json) · [Dreiervergleich mit vollständigen IDs](comparison.actual.json)

## Unterricht, Cockpit und Prüfungszeiger

| Beobachtung | Basis · `53fd44c88b` | Erster Fix · `1431a79dbe` | Korrektur · `fc7cab9ca1` |
| --- | --- | --- | --- |
| Bereits laufende Ziele Straßenverkehr (`4a2bf015`) und Bezugssysteme (`68c90ba6`), anschließend regulärer Cockpit-Abruf und Coach-Abschluss | Beide fallen auf `FRONTIER` zurück. Beide Buchungen werden abgewiesen. | Beide bleiben in `TEACHING`. Jeweils Mastery 1,0. | Beide bleiben in `TEACHING`. Jeweils Mastery 1,0. Nach dem Bestehen ist der Zeiger leer. |
| Frischer Start derselben zwei Ziele aus E.1 nach dem Zuschnitt | Beide abgewiesen | Beide abgewiesen | Beide abgewiesen |
| Ausgewählter Fokus im Cockpit und über `getPlannedGoals` bei laufendem Verkehrsziel | E.1 | E.1 und Verkehrsziel | E.1 |
| Erneuter Klick auf das bereits ausgewählte E.1, geprüft mit der produktiven Auswahlfunktion und den gemessenen Zuständen | Rückkehr vor dem PUT | PUT-Pfad wird erreicht | Rückkehr vor dem PUT |
| Globaler Prüfungszeiger `26c1e946` außerhalb von E.1, ohne ausdrückliche Angebotswahl oder gültige Direktbindung | Coach zeigt die Prüfung nicht an. Zustandsabruf löscht den Zeiger. | Coach zeigt die Prüfung in `TEACHING`. Zustandsabruf behält den Zeiger. | Coach zeigt die Prüfung nicht an. Zustandsabruf löscht den Zeiger. |
| Gültige Direktprüfung `ee7d5f3d` außerhalb des gewählten Kindabschnitts | Eigene Sitzung behält die Prüfung. Fremdsitzung erhält keine Bewertung. | Gleiches Verhalten | Gleiches Verhalten. Nach Verlassen des Profils ist der Zeiger leer. |

Für die beiden curricular verschobenen Ziele bilden gespeicherte Zeiger und erfüllte Voraussetzungen die Situation unmittelbar nach einem Zuschnitt nach. Der globale Altzeiger ist ebenfalls gezielt in der Testdatenbank gesetzt. Die gültige Direktprüfung wurde dagegen über ein tatsächlich verfügbares Abschlussangebot und eine neue gebundene Sitzung gestartet. Der Cockpit-Klick ist ein Funktionswiederlauf mit dem Rückkehrkriterium von `LearnerView.tsx:2462–2465`. [Native Coach- und Zustandsmessungen](runtime.actual.json) · [Klick auf die gemessenen Fokuslisten](ui-replay.actual.json) · [Produktiver Klickpfad](https://github.com/enpasos/skillpilot/blob/fc7cab9ca1/app/src/views/LearnerView.tsx#L2462)

## Signierte Sicherung und Wiederherstellung

Jede Sicherung wurde exportiert, serialisiert, wieder eingelesen und in einen frischen Lernenden importiert. Die Tabelleneinträge geben **Export → dauerhaft gespeicherte Fokusauswahl nach Import** wieder.

| Ausgangszustand | Basis | Erster Fix | Korrektur |
| --- | --- | --- | --- |
| Laufender Straßenverkehr bei gespeichertem Fokus E.1 | E.1 → E.1 | E.1 + Verkehrsziel → beide | E.1 → E.1 |
| Gültige Direktprüfung bei gespeichertem Fokus auf dem Kind „Freier Fall schwerer Kugeln“ | Kind → Kind | Kind + Prüfung → beide | Kind → Kind |

Alle drei Stände haben vor dem Export jeweils nur den ausdrücklich gewählten Abschnitt in der Quell-Datenbank. Auf dem frischen Lernenden war nach dem Prüfungsimport keine Prüfung aktiv. Beim Verkehrsfall lieferte der erste reguläre Zustandsabruf nach Import den E.1-Auftakt `a4d4efe1`. Das vor der Sicherung laufende Verkehrsziel war auf dem ursprünglichen Lernenden weiter bearbeitbar. [Gemessene Quell-, Export- und Restore-Werte](comparison.actual.json)

## Navigation, Abschluss und Karten

| Messung mit laufendem Verkehrsziel | Basis | Erster Fix | Korrektur |
| --- | --- | --- | --- |
| Navigationsziele im Cockpit | 4 | 5, zusätzlich E.2 | 4, dieselben IDs in derselben Reihenfolge wie auf der Basis |
| Wählbare Abschlussprofile | 6 | 7, zusätzlich E.2 | 6, dieselben IDs in derselben Reihenfolge wie auf der Basis |
| Prüfungen in der geordneten Abschlussliste | 95 | Gleiche 95 in gleicher Reihenfolge | Gleiche 95 in gleicher Reihenfolge |
| Ziel- und Prüfungszahlen | 627 Ziele, 500 ausstehend, 94 Pflichtprüfungen | Gleich | Gleich |
| Karten dieser Testperson, geforderte zusätzliche Einleitung, Planungsanrechnung | 0 in der Box, 0 fällig, keine Check-Empfehlung, keine zusätzliche Einleitung, leere Anrechnungsliste | Gleich | Gleich |

Beim Kontrollfall **ohne** aktives Ziel stimmt die gesamte erfasste Oberfläche zwischen allen drei Revisionen überein. Die 95 Prüfungen sind beim Wechsel zwischen den beiden Kontrollzuständen unterschiedlich sortiert. Diese zustandsabhängige Reihenfolge besteht bereits auf der Basis und ist für jeden Zustand über alle drei Revisionen identisch. [Oberflächenmessungen](surfaces.actual.json) · [Basis und erster Fix](../surfaces.actual.json)

## Grenzen der Zusage

- **Ausdrückliche Neufestlegung des Fokus.** Ein regulärer Zustandsabruf behält das Verkehrsziel und ändert die Zustandsversion um 0. Sendet der Lernende ausdrücklich `setPlannedGoals([E.1])`, löscht der Schreibpfad den Zeiger sofort. Der Folgeabruf liefert `FRONTIER`, die Version steigt um 1 und alle 72 bestehenden Mastery-Einträge bleiben gleich. Der gewöhnliche erneute Cockpit-Klick erreicht diesen Schreibpfad bei der korrigierten Einzelwahl nicht. Diese Unterscheidung entspricht der vorgegebenen Entscheidung. [Zusatzprobe mit beiden Pilotstellungen](raw/explicit-write/actual.json) · [Cockpit-Wiederlauf](ui-replay.actual.json)
- **Prüfungen und Kartenstapel.** Die ausdrückliche Begrenzung auf gewöhnliche Lernziele ist für diese Freigabe vertretbar. Eine regulär begonnene lokale Prüfung, die später aus dem Abschnitt verschoben wird, kann ohne eine gültige eigene Ausnahme ihren Zeiger verlieren. Dies folgt aus dem Prüfungsfilter und der Zustandsprüfung. Ein historischer Zuschnitt während einer tatsächlich laufenden lokalen Prüfung war kein Laufzeitszenario dieser Runde. Nach Ablauf zweier tatsächlich gestarteter Direktprüfungen (lokal und global) zeigten Coach und Zustand `FRONTIER`. Ein zusätzlich gesetzter Q1-Deckzeiger außerhalb von E.1 wurde beim Abruf entfernt, die Mastery-Einträge blieben gleich. [Prüfungs- und Deckfilter](https://github.com/enpasos/skillpilot/blob/fc7cab9ca1/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#L5954) · [Ablaufproben](raw/native-a/fresh48-summary.json) · [Deckkontrolle](raw/explicit-write/actual.json)
- **Wortlaut.** Beide Gutachter sehen keinen weiteren Implementierungsblocker. In `AGENTS.md:754–755` würde „new ordinary goal“ die Direktprüfungsregel präzisieren. Bei „focus change“ ließe sich die ausdrückliche Neufestlegung derselben Auswahl mitbenennen. Der Helfer erkennt den heutigen Zustand des Ziels und des Fokus. Er zeichnet keine historische Ursache der Verschiebung auf. [Regeltext](https://github.com/enpasos/skillpilot/blob/fc7cab9ca1/AGENTS.md#L745)

## Prüfumfang

Die Gutachter lasen unabhängig voneinander ausschließlich den beauftragten Korrekturdiff und zum Abgleich den Gesamtdiff zur Basis, jeweils beschränkt auf `backend/src/main` und `AGENTS.md`. Die Messungen liefen getrennt davon. Der gewählte Fokusauflöser ist im Methodenrumpf identisch mit der Basis. Vier Aufrufer verwenden den erweiterten Laufzeitfokus (einfaches und detailliertes Frontier, notwendige Einleitung, Kontext des aktiven Coach-Ziels). Der allgemeine Zustandsabruf prüft beim Aufräumen des Zeigers gezielt die Erhaltungsregel. [Aufrufer mit Zeilennummern](callers.actual.json)

Die 18 H2-Testfälle setzen sich aus acht Coach-/Cockpit-/Sicherungsfällen, zwei Oberflächenfällen, zwei parametrisierten Lesezeitmessungen, zwei Ablaufprüfungen, zwei Durchläufen des erweiterten Regressionstests und zwei zusätzlichen Fokus-Schreibtests zusammen. Es gab keine Fehler und keine übersprungenen Fälle. Der erste Aufruf des Zusatzrunners endete vor der Kompilierung. Der vollständige Wiederholungslauf ist im Nachweis gezählt. Die gesamte Backend-Suite und eine Browser-End-to-End-Prüfung waren nicht Teil dieses Bestätigungslaufs. [Gradle- und XML-Nachweise](raw/)

Die Zeitmessung wiederholte vier Ausgangszustände × zwei Leser × zwei Pilotstellungen. Auf 256 Aufwärmabrufe folgten 768 gewertete Abrufe. Die 16 Zellmediane lagen zwischen 143,24 und 187,96 ms. Gegenüber dem letzten historischen Lauf von `1431a79dbe` reichten die Differenzen von −27,85 bis +11,44 ms. Auf dem gemeinsam genutzten Rechner gab es für diese Runde keinen zeitgleich wiederholten Basislauf. Aus diesen Differenzen lässt sich keine durch den Fix verursachte Latenzänderung ableiten. [Zellmediane, Quartile und Vergleichswerte](raw/native-a/fresh48-summary.json)
