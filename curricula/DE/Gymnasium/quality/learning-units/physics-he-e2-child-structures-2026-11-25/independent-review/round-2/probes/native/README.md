# Task D: unabhängige native Nachmessung

Gemessen am Kandidaten `4f963b4b78922d11fea4029e15fa8183e572dd35`. Keine Änderungen an getrackten Dateien und kein neuer vollständiger Checkout. Die private Backend-Kopie stammt aus `git archive`; die curricularen und übrigen Laufzeiteingaben wurden schreibgeschützt aus dem auf genau diesen Commit fixierten bestehenden Worktree eingebunden.

## Ergebnis

20 ausgeführte JUnit-Fälle, 0 Fehler, 0 übersprungen. Drei abgeschlossene Läufe: Kandidat 14, echter Vorgänger 4, produktive UI-Closure 2. `actual.json` enthält Fallnamen, Exitcodes, tatsächliche Resultate und XML-Hashes; vollständige Beobachtungen, XML und Logs liegen unter `../../raw/native/`.

- **Laufendes Gravitationsziel:** GK/LK × Unit-Assessment-Pilot aus/an. E.2 ist alleiniger gespeicherter Fokus, `eb0ffdea` liegt außerhalb seiner aktuellen Auswahl. Mit echten erfüllten Voraussetzungen halten authentifizierter Coach-Kontext, Coach-State und regulärer Learner-State Ziel und Fokus fest. Der tatsächliche authentifizierte MCP-Aufruf `setMastery` schreibt genau einen zusätzlichen Mastery-Eintrag `eb0ffdea=1.0`; alle vorherigen Einträge bleiben identisch. Danach: kein aktives Ziel, `FRONTIER`, gespeicherter Fokus und angezeigte Planliste weiterhin allein E.2, ausgewählte Ziele unverändert (GK 28, LK 27), genau eine Versionsfortschreibung.
- **Gespeicherter Vorgängerplan:** Die unveränderten, zuvor nativ aufgezeichneten datierten Blöcke `captured-{GK,LK}-{false,true}.json` werden direkt einschließlich Fingerprint wieder eingespielt. Zusätzlich werden die acht echten Vorgänger-Views von `19c14af91ec51f184ce14d7e19980b5c96175f7f` über denselben Backendstand gelegt und die Blöcke erneut durch die echte Upsert-API aufgezeichnet. Datierter Block und Fingerprint stimmen mit der ursprünglichen Aufnahme überein. Beide Kurspläne enthalten exakt ihre 32 Vorgängerziele, einschließlich `9c328f68`; sie bleiben aktuell und überstehen Export/Import unverändert. Jeweils jedes der vier GK- beziehungsweise fünf LK-Ziele, das die aktuelle E.2-Auswahl verlassen hat, wird isoliert als nächstes Planziel angeboten und durch die echte Planfortsetzung als tatsächliches aktives Ziel gestartet. Zusammen 36 solche Angebots-/Startkontrollen (18 Vorgänger, 18 Kandidat). Keine dieser Kontrollen schreibt Mastery für das gestartete Ziel.
- **Branch-Regressionsmethoden:** `goalInProgressSurvivesTheCutOfForces` (4 Fälle) und `planStoredForForcesBeforeTheCutKeepsTheGravitationGoals` (2 Fälle) zusätzlich unverändert ausgeführt, alle grün.
- **Projektion:** Die beiden GK-Prüfungen `22561c66` und `72649cf5` stehen im GK jeweils in `getPlanningScope(...).scopeAtomicGoalIds()`, in der E.2-Auswahl und in den PC-Ziel-IDs. Im LK stehen sie in keiner dieser Mengen. `projection-*.json` liefert die vollständigen IDs.
- **Produktive UI-Quelle:** `getLearnerLandscapeClosure` wurde mit der tatsächlich ausgewählten Curriculum-Root `a0e13c56-c25f-4742-9272-3a1a603ee52e` und Sprache `de` ausgeführt, das vollständige Resultat mit dem produktiven ObjectMapper serialisiert. `../../raw/native/ui-closure-{GK,LK}.json` sind für den Frontend-Replay verfügbar. Auch hier sind die zwei GK-Prüfungen nur im GK enthalten. Die Metadaten nennen Root, Landschaften, alle Ziel-IDs und Mitgliedschaft; GK: 832 exportierte Ziele, LK: 887.

Der Pilot in dieser Matrix ist ausdrücklich der Unit-Assessment-Pilot. Autopilot bleibt entsprechend dem ursprünglichen und angefragten Testaufbau aus. Native H2-Prüfungen ersetzen weder Produktions- noch externe Host-Abnahme.

## Belege und Reproduktion

- `run.sh candidate`, `run.sh predecessor`: privater Build, schreibgeschützte Bind-Mounts, unveränderter bestehender Worktree.
- `run-closure.sh`: genau ein inkrementeller Zusatzlauf im vorhandenen privaten Kandidatenbuild mit zwei GK/LK-Fällen.
- `probe.method.java`: zusätzliche unabhängige Testmethoden; vorangestellt wird die native Integrationsfixture mit ihren echten Services, Persistenz und authentifiziertem MCP-Handler.
- `summarize.py`: zieht die tatsächlich ausgeführten Fälle und Beobachtungen aus den aufbewahrten XML-Dateien.

Ein erster Kompilierlauf scheiterte ausschließlich an einer mehrdeutigen AssertJ-Überladung im neuen Probe-Code; ein expliziter JsonNode-Typ korrigierte die Bindung. Beide Erstlogs, Exitdaten, der damalige Quelltext und die damalige Zusammenfassung bleiben unter `../../raw/native/first-attempt-compile/` erhalten. Dabei wurde kein Produkt-Testfall ausgeführt und kein Produkt-Code geändert.

Alle Bind-Mount-/Gradle-Läufe sind beendet; der bestehende Worktree wurde zur Wiederherstellung freigegeben.
