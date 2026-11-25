# Lernpläne nach Umgruppierung – unabhängige Gegenprüfung, Runde 3

**REQUEST_CHANGES für `a6a1ea5912`.** Alle drei konkreten Gegenbeispiele der zweiten Runde sind geschlossen. Zwei Korrekturen sind erforderlich. Im gewöhnlichen Plan kann die automatische Übergabe den von der Fortsetzung verlangten Auftakt überspringen. Bei der Klausuraktivierung kann ein bereits begonnenes Ziel nach dem Auftakt verloren gehen.

Gegenstand ist der einzelne Commit `a6a1ea59122b2c2cb6c82540ba20fcc996af1208` auf `fix/alte-lernplaene-nach-umgruppierung`, verglichen mit `4e085e990ba4a05053904ee5cb34f5dd82418358`. Die drei Fragen beziehen sich auf `backend/src`, `AGENTS.md` und `CLAUDE.md`.

## 1. Ursprüngliche Fälle und Weitergabe eines früher gespeicherten Ziels

**Bestätigt.** Der gewöhnliche Mathematikplan übergibt das heute fällige Ziel auch bei einer erst später angesetzten Orientierung. Bei einer Klausuraktivierung mit einem im Klausurumfang gesperrten Mathematikziel gibt es eine zulässige Auswahl ohne den früheren HTTP 409. Eine Bearbeitung kann ein historisches Ziel nicht über die Zwischenstufe `{A} → {A,B} → {B}` in einen fachfremden Abschnitt übertragen. Die 17 Regressionstests des Autors bestehen, einschließlich der Fälle mit und ohne umgruppiertes Ziel. [Handoff-Test](https://github.com/enpasos/skillpilot/blob/a6a1ea59122b2c2cb6c82540ba20fcc996af1208/backend/src/test/java/com/skillpilot/backend/service/LearnerServiceTest.java#L1941) · [Klausurtest](https://github.com/enpasos/skillpilot/blob/a6a1ea59122b2c2cb6c82540ba20fcc996af1208/backend/src/test/java/com/skillpilot/backend/service/LearnerServiceTest.java#L1977) · [Bearbeitungstest](https://github.com/enpasos/skillpilot/blob/a6a1ea59122b2c2cb6c82540ba20fcc996af1208/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java#L1951)

Maßgeblich ist die vollständige Menge der Foki des gespeicherten Blocks. Kommt ein Abschnitt hinzu oder fällt einer weg, muss das Ziel unter den neuen Foki heute zulässig sein. Ein unabhängiger H2-Versuch begann mit einem außerhalb der heutigen Abschnitte J9 und J10 liegenden Ziel. Umbenennen und Umordnen beider Foki gelang. Das Entfernen jedes einzelnen Fokus wurde abgewiesen und ließ die Revision unverändert. Der Wechsel in den tatsächlich zuständigen Fachcluster gelang. [Abgleich beim Speichern](https://github.com/enpasos/skillpilot/blob/a6a1ea59122b2c2cb6c82540ba20fcc996af1208/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#L5095) · [Menge als Schlüssel](https://github.com/enpasos/skillpilot/blob/a6a1ea59122b2c2cb6c82540ba20fcc996af1208/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#L5116) · [H2-Ergebnisse](checks/section-identity-and-exam-preservation.actual.json)

## 2. Automatische Übergabe bei gewöhnlichen Plänen

**Korrektur erforderlich.** Nach dem Fall-Messprotokoll startet die automatische Übergabe das t-v-Diagramm direkt. Die reguläre Fortsetzung desselben Plans eröffnet zuerst E.1 und merkt das Diagramm für die Rückkehr vor. Die unterschiedliche Wahl tritt bei einem regulär gespeicherten Plan ohne Altbestand auf.

Der Kindeinstieg ist bereits bestanden, der Elternauftakt offen. Das Messprotokoll (`e0004439`) gehört zum ersten Block, das Diagramm (`1e459a1b`) zum zweiten. Dieser zweite Block hat die Kindeinheit und das Diagramm selbst als Foki. Unter beiden zusammen ist das Diagramm zulässig. Unter dem tatsächlich gespeicherten Einzelfokus verlangt der Schreibpfad den Elternauftakt. Beide Wege beginnen mit dem gleichen Kindfokus und derselben bestandenen Leistung.

| Revision | Automatische Übergabe nach dem Messprotokoll | Frische reguläre Fortsetzung |
| --- | --- | --- |
| `4e085e990b` | Kein aktives Ziel | Elternauftakt aktiv, Diagramm vorgemerkt |
| `a6a1ea5912` | **Diagramm aktiv, keine Vormerkung** | **Elternauftakt aktiv, Diagramm vorgemerkt** |

Vier H2-Beobachtungen pro Revision vergleichen beide Wege mit ein- und ausgeschaltetem `unitAssessmentPilotEnabled`. Sie prüfen gespeichertes Ziel, Fokus und Vormerkung. Die Anzeige der frischen Fortsetzung nennt auch hier bereits das Diagramm, während die Datenbank den Elternauftakt enthält. [Vergleich beider Revisionen](checks/diagram-handoff-comparison.actual.json)

Ein zweiter gewöhnlicher hessischer Physikplan (G9, Grundkurs) enthält einen Lernblock mit den Abschnitten Magnetfelder und „Freier Fall schwerer Kugeln“. Nach Bestehen von „Feldbilder und Magnetfeldmodelle eigenständig anwenden“ (`b4175564`) ist „Messabweichungen und Fehlerarten unterscheiden“ (`8aff7aac`) fällig. Seine fachlichen Voraussetzungen sind erfüllt. Der E.1-Auftakt `a4d4efe1` und der Kindauftakt `b4e95dce` sind beide offen. Der Plan ist regulär speicherbar und benötigt keinen umgruppierten Altbestand.

| Revision | Automatische Übergabe durch `setMastery` | Frische reguläre Fortsetzung mit gleichem Vorzustand |
| --- | --- | --- |
| `4e085e990b` | Kein aktives Ziel, keine Vormerkung | E.1-Auftakt aktiv, `8aff7aac` vorgemerkt |
| `a6a1ea5912` | **Kindauftakt aktiv**, `8aff7aac` vorgemerkt | **E.1-Auftakt aktiv**, `8aff7aac` vorgemerkt |

Am geprüften Commit speichern beide Wege denselben Einzelfokus `[8aff7aac]`. Die automatische Übergabe prüft den Einstieg unter beiden Blockfoki und übernimmt die Auswahl unmittelbar. Die Fortsetzung prüft die Anforderung beim Schreiben unter dem Einzelfokus erneut. Ihr Rückgabefeld und die Planansicht nennen den Kindauftakt, obwohl in der Datenbank der Elternauftakt steht. Diese Abweichung zwischen Anzeige und Speicherung gab es bereits am Elterncommit. Neu ist, dass die automatische Übergabe hier den Kindauftakt tatsächlich aktiviert. Mit bestandenem Elternauftakt wählen beide Wege den Kindauftakt. Die Ergebnisse gelten jeweils mit ein- und ausgeschaltetem `unitAssessmentPilotEnabled`. [Auswahl unter den Blockfoki](https://github.com/enpasos/skillpilot/blob/a6a1ea59122b2c2cb6c82540ba20fcc996af1208/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java#L2142) · [Einzelfokus bei mehreren Foki](https://github.com/enpasos/skillpilot/blob/a6a1ea59122b2c2cb6c82540ba20fcc996af1208/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java#L2057) · [Auswahl der Übergabe](https://github.com/enpasos/skillpilot/blob/a6a1ea59122b2c2cb6c82540ba20fcc996af1208/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#L10531) · [Direktes Schreiben](https://github.com/enpasos/skillpilot/blob/a6a1ea59122b2c2cb6c82540ba20fcc996af1208/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#L10626) · [Schreiben der Fortsetzung](https://github.com/enpasos/skillpilot/blob/a6a1ea59122b2c2cb6c82540ba20fcc996af1208/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java#L1364)

Für gewöhnliche Pläne müssen Auswahl, Einstiegsprüfung und Speicherung für denselben wirksamen Fokus dieselbe Navigation ergeben. Welche Öffnung zu diesem konkreten Einstieg gehört, folgt aus dem gewählten Fokus und der bestehenden Regel für direkten beziehungsweise geführten Einstieg. Die Klausurübergabe nach `setMastery` verwendet weiterhin eine einzige Frontier für den ganzen Klausurumfang. [Klausurzweig der Übergabe](https://github.com/enpasos/skillpilot/blob/a6a1ea59122b2c2cb6c82540ba20fcc996af1208/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#L10539) · [Prüfung beim Schreiben](https://github.com/enpasos/skillpilot/blob/a6a1ea59122b2c2cb6c82540ba20fcc996af1208/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#L11614)

## 3. Erhaltung eines begonnenen Ziels bei Klausuraktivierung

**Korrektur erforderlich.** Das bereits unter der Kindeinheit begonnene t-v-Diagramm geht als Rückkehrziel verloren. Das Messprotokoll und die Kindöffnung sind bestanden. Der E.1-Auftakt ist offen. Der neue Klausurplan umfasst Auftakt und Diagramm. Der Auftakt ist heute fällig, das Diagramm nächste Woche. Das Diagramm ist vor der Aktivierung tatsächlich aktiv. Für Auftakt und Diagramm liegt keine Anrechnung vor.

| Aufruf | Aktives Ziel nach Aktivierung | Gespeichertes Rückkehrziel | Aktives Ziel nach bestandenem Auftakt |
| --- | --- | --- | --- |
| `activatePlans` auf `4e085e990b` | E.1-Auftakt | t-v-Diagramm | t-v-Diagramm |
| `activatePlans` auf `a6a1ea5912` | E.1-Auftakt | **keines** | **keines** |
| Schreibpfad mit angefordertem Diagramm, auf beiden Revisionen | E.1-Auftakt | t-v-Diagramm | t-v-Diagramm |

Der Klausurumfang ist in allen drei Zeilen gleich. Die neue Abfrage verwirft das begonnene Diagramm, weil nur der Auftakt unmittelbar zulässig ist. Die Ersatzauswahl fordert den Auftakt selbst an. Der Schreibpfad kann jedoch die ursprüngliche Anforderung „Diagramm“ im Klausurumfang annehmen, den Auftakt einschieben und das Diagramm für danach speichern. Vier H2-Fälle pro Revision belegen den Unterschied bis zur tatsächlichen Rückkehr nach `setMastery`. [Erhaltungsprüfung](https://github.com/enpasos/skillpilot/blob/a6a1ea59122b2c2cb6c82540ba20fcc996af1208/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java#L1571) · [Ersatzauswahl](https://github.com/enpasos/skillpilot/blob/a6a1ea59122b2c2cb6c82540ba20fcc996af1208/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java#L1052) · [Einstiegsprüfung](https://github.com/enpasos/skillpilot/blob/a6a1ea59122b2c2cb6c82540ba20fcc996af1208/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#L11616) · [Rückkehrziel speichern](https://github.com/enpasos/skillpilot/blob/a6a1ea59122b2c2cb6c82540ba20fcc996af1208/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#L11674) · [Gemessene Zustände](checks/exam-opening-comparison.actual.json)

Die Korrektur sollte ein begonnenes Ziel auch dann als Anforderung erhalten, wenn der Schreibpfad es im selben Klausurumfang hinter einem erforderlichen, zulässigen Auftakt vormerken kann. Ein tatsächlich gesperrtes Ziel muss weiterhin die zulässige Ersatzauswahl auslösen. Acht zusätzliche Mathematikfälle bestätigen den einfacheren Fall mit zwei unmittelbar zulässigen Zielen. Ist das später eingeplante Ziel schon aktiv, bleibt es aktiv. Ist keines aktiv, startet das frühere. Das gilt sowohl für die heutige als auch für eine frühere Blockzuordnung. [Positiv- und Negativkontrollen](checks/section-identity-and-exam-preservation.actual.json)

## Umfang und unabhängige Urteile

| Native Gradle-/H2-Fälle | Geprüfter Commit | Elterncommit |
| --- | ---: | ---: |
| Bestehende Regressionstests | 17 | – |
| Einzelner Kindauftakt, Mathematikkontrollen zur Erhaltung, exakte Abschnittsmenge | 4 + 8 + 1 | – |
| Gewöhnlicher Übergang, Block mit zwei Fachabschnitten | 16 | 8 |
| Gewöhnlicher Übergang vom Messprotokoll zum Diagramm | 4 | 4 |
| Klausuraktivierung und direkter Schreibpfad mit erforderlichem Auftakt | 4 | 4 |
| **Summe** | **54** | **16** |

Die Testläufe endeten mit null Fehlern, fehlgeschlagenen oder übersprungenen Fällen. Die Vergleichsfälle zeichnen den tatsächlichen Datenbankzustand auf. Gerade diese Ergebnisse belegen die beiden Produktfehler. Die Zahlen beziehen sich auf gezielte Läufe. Für die Roh-XML und Logs enthalten die kompakten Belege SHA-256-Prüfsummen. [Regressionen und Kontrollen](checks/regressions-and-opening-controls.actual.json) · [Vorher-Nachher-Vergleich des Zwei-Abschnitt-Plans](checks/two-section-opening-comparison.actual.json)

Gutachten A empfiehlt die Freigabe. Es erkennt die mögliche Umleitung beim Schreiben, verfolgt aber den Rückkehrzustand beim Bestehen des Auftakts nicht. Gutachten B fordert Korrekturen an Übergabe und Klausuraktivierung. Seine beiden konkreten Gegenbeispiele wurden auf dem geprüften Commit und seinem Elterncommit mit frischen Lernerzuständen nachgestellt. Die gemessenen Zustände entscheiden die Abweichung zwischen den Gutachten. [Original A](reviewer-a.original.md) · [Original B](reviewer-b.original.md) · [Gebundener Gesamtnachweis](independent-review.actual.json)

**Hinweis für ein Folge-Issue.** Die bereits am Elterncommit beobachtete Abweichung zwischen dem gemeldeten und dem gespeicherten Ziel der Planfortsetzung sollte separat sichtbar bleiben. In einer weiteren Kontrollvariante mit bestandenem Kindauftakt und offenem Elternauftakt sagte die Ansicht den Elternauftakt voraus, während beide Wege auf beiden Revisionen ohne aktives Ziel blieben. Die beiden erforderlichen Korrekturen oben sind durch Änderungen zwischen den Revisionen belegt. [Kontrollmatrix](checks/two-section-opening-comparison.actual.json)
