# S – zweite Bestätigung des manuellen Mischfalls

**PASS auf `fbcb7b092e2f616f6488bdff1d11c576263e35d1`.** Ausgeführt wurde ausschließlich eine Einzelprobe mit Autopilot aus, der bisherigen unveränderten Einrichtung des Mischfalls und dem echten Matheklausurthema `3016ec37-1c2e-47db-83f5-e767923bc97e`. Ein Test, null Fehler/Fehlschläge/Überspringungen, Gradle Exit 0. Keine neue Reviewrunde und keine Aussage über einen anderen Bestätigungsfall.

## Angebot und echter Start bei gültiger Matheklausur

Der Physikplan bleibt veraltet; der Mathematikplan ist auswertbar. Der aktuelle Coach-Kontext veröffentlicht `subject="Physik"`, `canContinue=true`, `current=false`, `evaluable=false`. Globales `resumeAvailable` ist in dieser konkreten Einrichtung weiterhin false; der explizite veröffentlichte Fachwechsel ist verfügbar.

Ohne Planfolgen enthält die Physik-Lernfrontier:

- `65365dce-f33f-49d8-9516-42f75883aa86`
- `71cec9fb-3751-4d61-8b34-c5adbbf6e5f2`
- `a4d4efe1-7d30-526b-ac9c-806113da4363`

Mit Planfolgen und der gültigen Matheklausur wird jetzt ausschließlich das tatsächlich startbare Physikziel `a4d4efe1-7d30-526b-ac9c-806113da4363` angeboten. Die beiden fremden Voraussetzungen außerhalb dieser Matheklausur sind in diesem Zustand keine startbaren Angebote. Die frühere Forderung nach voller Gleichheit mit ausgeschaltetem Planfolgen ist für diesen Zustand gemäß M/09:00 überholt.

Der echte Aufruf **`switch_skillpilot_learning_plan_subject` aus der ClaudeV1-Toolfamilie** kopiert das angebotene `subject="Physik"`, verwendet eine frische UUID, die bestehende Test-Lernsitzung, Sprache `de` und `expectedStateVersion=3`. Die frisch gelesene Kontextrevision und die unmittelbar gelesene native Revision sind beide **3**.

Antwort: **SUCCESS**, `stateVersion=4`. Tatsächlich gespeichert wird:

**`a4d4efe1-7d30-526b-ac9c-806113da4363` – „Bewegungen entdecken: vom Tisch bis zum Boden“.**

Das Ziel liegt im zuvor angebotenen Physik-Frontier und gehört zur Physik-Landschaft `7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a`. Antwortkontext und persistenter aktiver Zielzeiger stimmen exakt überein. Der zuvor auf `096a54ceb1` gemessene Konflikt tritt in dieser Einzelprobe nicht mehr auf.

## Bestehende Kontrolle mit ebenfalls veraltetem Matheplan

Der erfolgreiche erste Start wird zuerst festgehalten. Für eine zweite explizite Auswahl wird anschließend im Test lediglich der aktive Zeiger geparkt; das Testprogramm setzt keine Mastery. Danach erhält der Matheplan wie in der bisherigen Negativkontrolle den veralteten Marker.

Jetzt sind Physik-Lernfrontier mit und ohne Planfolgen wieder exakt gleich und enthalten die oben aufgeführten drei IDs. Die erneut veröffentlichte Physik-Fachwahl mit demselben Tool und frischer UUID besteht ebenfalls: Kontextrevision **4**, native Revision **4**, Antwort **SUCCESS**, neue Revision **5**.

Tatsächlich gespeichertes Kontrollziel ist `71cec9fb-3751-4d61-8b34-c5adbbf6e5f2` – „Warum Mathematik? – Denken, Muster & Zukunft“. Es gehört zur Mathematik-Landschaft `68a8ac50-f5f5-4e24-8aa9-5e408ca01ced` und ist eine echte fremde Voraussetzung aus dem gemessenen Physik-Lernfrontier. Dieser Start ist hier ausdrücklich erwartbar; das Ziel wird nicht als physikeigen bezeichnet.

## Identität, Belege und Grenzen

Die unveränderte Einrichtung stammt aus der ursprünglichen Mischprobe; Matheklausurthema und Schultyp-/Stufen-/Kurswahl wurden nicht ausgetauscht. `inputs.actual.json` bindet Originalmethoden-, Einrichtungs- und Messmethoden-SHA. `verification.actual.json` bestätigt den exakten Produktionsstand und die unveränderten Originaldateien anhand beider früherer Manifeste.

Neue, eigenständige Rohbelege liegen ausschließlich in [raw/confirmation-mixed-2/fbcb7b092e](raw/confirmation-mixed-2/fbcb7b092e/): native Ausgabe und JUnit-XML, Messmethode/-Patch, vollständige sowie kompakte tatsächliche API-Beobachtungen und SHA-Manifest. Die alten Berichte und Rohdaten bleiben unverändert. Kein Schreiben auf den Branch, kein Commit, kein anderer Testfall und kein Autopilot-an-Lauf.
