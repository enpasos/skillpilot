**Der Import rettet die Lernergebnisse bei einem fachlich überholten Plan. Zwei Befunde stehen einer uneingeschränkten Freigabe entgegen.** Ein Katalogfehler kann einen lesbaren Plan dauerhaft als veraltet kennzeichnen. Außerdem erwartet ein bestehender Service-Test für ein signiertes Archiv weiterhin eine Ablehnung, obwohl der neue Import genau dieses Archiv annehmen würde.

Geprüft habe ich `05a2b1c8c3` und den Diff `1001aa2c7f..ba1c911e98`. Die Backend-Befunde sind statisch. Für das Cockpit habe ich die echte React-Komponente ohne Build mit zwei ansonsten identischen Eingaben gerendert. Die nativen Service- und Transaktionskontrollen liegen beim Koordinator.

### 1. Leser und Marker

**Der markierte Plan liefert beim direkten Planstart kein Ziel. Die Aussage, jeder Leser vergleiche die gespeicherte Curriculum-ID und ignoriere den Plan anschließend vollständig, ist zu weit.**

| Geprüfte Leser | Befund |
|---|---|
| `getPlans`, `getPlan`, `findPlan`, `getTodayStatus`, `getCoachTodayStatus` | `summarize` prüft die Kompatibilität am gespeicherten Plan. Bei `stale` bleiben nächstes Ziel und Lernumfang leer, `canContinue` ist falsch. Der Tagesstatus zählt einen nicht auswertbaren Plan. Eine Besonderheit hat die Detailberechnung: Für die vorgelagerte Anrechnungsrechnung setzt sie vorübergehend die **gewählte** Curriculum-ID ein. Die abschließende Prüfung verwendet wieder den Originalplan. [Zusammenfassung][summary] · [Detailberechnung][detail] · [Ersatzobjekt][supplied] · [Tagesstatus][today] |
| `planFulfillment`, `completedAssignmentPracticeGoals`, `maybeAutoHandoffToLearningPlan` | Ein markierter Plan eines bekannten Fachs wird aus den Verpflichtungen entfernt. Er begründet weder eigene Anrechnung noch freiwillige Ziele aus einem abgeschlossenen Auftrag noch den automatischen Start nach einem Zielabschluss. Ein weiterer Plan desselben Fachs kann wegen des unvollständigen Umfangs seine Anrechnung verlieren. [Verpflichtungen][oblig] · [Anrechnung desselben Fachs][credit] · [Freiwillige Ziele][practice] · [Anschluss nach Zielabschluss][handoff] |
| `switchPlan`, `continuePlan`, `reconcile`, `resumeExplicitly`, `getManualCoachPlanGoals`, `selectManualCoachPlanGoal`, `focusManualCoachPlanSubject`, `switchPersonalCurriculumSubject` | Direkter Wechsel und direkte Fortsetzung verlangen `requireCurrentBlocks`. Auch die automatische Kandidatensuche überspringt den Plan. Zwei Hilfsmethoden lesen seine Blöcke dennoch ohne diese Prüfung: `hasExamScope` kann einen Prüfungstag weiter bindend machen, `personalCurriculumGoalsForPlanContinuation` kann pausierte Einzelziele weiter ausschließen. Das betrifft ausdrücklich angefordertes Weiterlernen und die Auswahl im Chat. [Direkter Start][current] · [Kandidatensuche][candidate] · [Manuelle Auswahl][manual] · [Persönliche Fortsetzung][personal] · [Prüfungstag][exam] |
| `previewPlans`, `activatePlans`, `upsert`, `editableUnitAssignments`, `setUnitAssignmentActivity`, Backup-Export | Vorschau und Aktivierung prüfen ausgelassene Pläne auf Aktualität. Erneutes Speichern liest den alten Stand als Bearbeitungsgrundlage und schreibt nach erfolgreicher Prüfung die aktuelle Curriculum-ID. Gespeicherte Einheitenaufträge bleiben sichtbar und pausierbar. Ihre Reaktivierung verlangt eine passende Curriculum-ID und Fassung. Der Export liest die gespeicherten Blöcke unabhängig von der Aktualität. [Vorschau und Aktivierung][omitted] · [Speichern][save] · [Auftragsverwaltung][activity] · [Export][export] |

In den beiden Services fand ich **keinen Katalogabruf mit `plan.getCurriculumId()`**. Die Fachauflösung verwendet `plan.getLandscapeId()`, die Curriculum-Projektion die Auswahl des Lernenden. Alle 26 IDs im Manifest sind UUIDs. Über die reguläre Auswahl lässt sich `restored-outdated-plan` nicht wählen. Eine allgemeine Datengarantie gibt es allerdings nicht: `selectedCurriculum` ist ein String, und der signierte Import übernimmt ihn ohne die Katalogprüfung der regulären Auswahl. Eine Kollision über die normale Bedienung ist damit nicht belegt. [Manifest][manifest] · [Auswahlprüfung][select] · [Import der Auswahl][importselection] · [Fachauflösung][subjectlookup]

### 2. Formprüfung und frühere Archive

**Ein bei gleichen Daten und gleichem Katalog bisher erfolgreicher Restore bleibt erfolgreich.** Der bisherige Pfad bereinigt, normalisiert, prüft die fachliche Zuordnung und ordnet die Blöcke. Erst wenn dieser Versuch scheitert, läuft `requireWellFormedBlocks`. Ich fand keine vorher erfolgreich restaurierte Form, die allein durch diese Zusatzprüfung jetzt abgewiesen wird. [Regulärer Restore][restore] · [Verzweigung][classify]

**Die Formprüfung erkennt aber nicht exakt die Menge möglicher Speicherergebnisse.** Das kleinste Gegenbeispiel steht im neuen Test selbst: Ein Plan aus **nur einem Prüfungstag**, ohne Lernblock und ohne Einheitenauftrag, besteht die Formprüfung. Beim regulären Speichern scheitert derselbe Plan an der Abschlussbedingung für offene Ziele. Ein zweiter Unterschied betrifft die gespeicherten Werte: Die Prüfung normalisiert etwa Großschreibung und doppelte Ziel-IDs probeweise. Der Auffangpfad verwirft das normalisierte Ergebnis und speichert die ursprünglichen Blöcke. Ein erfolgreicher regulärer Speichervorgang hätte die normalisierte Form geschrieben. [Prüfungstag im Formtest][formtest] · [Normalisierung][norm] · [Abschlussbedingung][open] · [Speicherung der Originalblöcke][outdated]

Für einen echten früheren Speicherstand ist die beabsichtigte Gegenrichtung plausibel: Ein gültig gespeicherter Physik-GK-Plan kann nach dem Wechsel in den LK seinen Abschnitt verlieren. Der alte Import lehnte ihn ab, der neue erhält ihn zusammen mit den Ergebnissen. Der Integrationstest enthält den regulären Speichervorgang und den Kurswechsel. [GK-Plan und Kurswechsel][course]

### 3. Fehlerklassifikation

Der Auffangpfad erhält **jede 4xx-`ResponseStatusException`** aus der gesamten Rekonstruktion sowie jede `IllegalStateException` und `IllegalArgumentException`. Dazu gehören unbekannte Ziele, nicht mehr auflösbare Abschnitte oder Prüfungsthemen, fehlende Fachziele, ein unvollständiges Persönliches Curriculum und Konflikte der Voraussetzungsreihenfolge. Ein leerer oder doppelter Landschaftsschlüssel und ein zu langes Planlabel scheitern schon davor. Ein Formfehler scheitert bei der erneuten Prüfung. Eine unmittelbar ankommende 5xx-Antwort und ein Fehler beim Schreiben der Planzeilen brechen den Import ab. [Importgrenze][classify] · [Planungsumfang][planning] · [Speichern der Planzeilen][replace] · [Serialisierungsfehler][serialization]

**Ein konkreter Serverfehler geht trotzdem als veralteter Plan durch.** Der Fingerabdruck durchläuft den Strukturgraphen auch außerhalb der gespeicherten Blöcke. Ein `contains`-Zyklus in einem anderen Zweig kann dort eine `IllegalStateException` auslösen. `learningPlanFingerprint` übersetzt sie in HTTP 409. An derselben Stelle würde auch eine eintreffende 5xx-`ResponseStatusException` in 409 umgewandelt. Der Import speichert daraufhin den Marker. Nach einer Katalogreparatur bleibt die gespeicherte Curriculum-ID verschieden. Das ist ein statischer Fehlerpfad, kein beobachteter Katalogvorfall. [Durchlauf des Graphen][fingergraph] · [Zykluserkennung][cycle] · [Übersetzung in 409][wrap] · [Speicherung des Markers][outdated]

Die Entscheidung, Lernergebnisse trotz einer nachgewiesenen fachlichen Unverträglichkeit zu retten, halte ich für richtig. Einen technischen Fehler als dauerhafte Eigenschaft des Lernplans zu speichern, widerspricht der festgehaltenen Entscheidung zum Serverfehler. Für diesen Fall sollte der Import wiederholbar fehlschlagen. [Produktentscheidung][decision]

### 4. Transaktion

**Für den konkret behandelten Auflösungsfehler ist `noRollbackFor` richtig.** `resolveLearningPlanGoalIds` liest den Lernenden und die Projektion und liefert Ziel-IDs. Der Aufruf aus `LearnerLearningPlanService` geht über die andere Spring-Bean. Bei einem verschwundenen Prüfungsthema wirft die Auflösung HTTP 400. `hasExamScope` behandelt diesen Fehler und liefert regulär ein Ergebnis. Ohne die Ausnahme von der Rollback-Regel kann die bereits markierte äußere Transaktion erst beim Abschluss mit `UnexpectedRollbackException` scheitern. Die Aufrufe innerhalb von `LearnerService` selbst sind davon zu unterscheiden. [Lesemethode][resolve] · [Fachlicher Fehler][invalidfocus] · [Aufruf über die Bean][proxy] · [Behandlung][exam]

Die Annotation umfasst die **gesamte** Klasse `ResponseStatusException`, also auch 5xx. Eine aus der äußeren Schreibmethode austretende Ausnahme löst deren eigene Rollback-Regel weiterhin aus. Ich fand keinen belegten Schreibpfad, der für seine Atomarität auf die frühere innere Markierung angewiesen wäre. Für keine der sieben zusätzlich genannten Methoden kann ich einen weiteren Fehler am realen Service als reproduziert melden.

### 5. Eigene Negativkontrollen

Die folgenden Kontrollen haben jeweils ein unterscheidbares Ergebnis. **Die Backend-Ergebnisse sind Erwartungen aus dem Code, keine von mir ausgeführten Läufe.**

| Kontrolle | Erwartetes Ergebnis |
|---|---|
| **Restore ohne Auffangpfad.** Gültigen GK-Plan speichern, in den LK wechseln, **erst danach** mit einem bestandenen Ziel exportieren. Beim Empfänger vor dem Import einen anderen Lernstand und einen vorhandenen Plan festhalten. | Ohne Auffangpfad scheitert die Auflösung des GK-Abschnitts. Nach Ende der Transaktion müssen Lernstand **und** Plan des Empfängers ihren Vorwert haben. Mit Auffangpfad muss das bestandene Ziel übernommen und der GK-Plan mit unveränderten Blöcken markiert sein. Der Exportzeitpunkt ist entscheidend, weil der Import auch die Curriculum-Auswahl restauriert. [Kurswechsel][course] · [Importreihenfolge][importorder] · [Abschnittsprüfung][focuscheck] |
| **Auflösung ohne `noRollbackFor`.** Einen gespeicherten Plan mit ausdrücklich gewähltem GK-Prüfungsthema nach dem Wechsel in den LK bei eingeschalteter Planbefolgung über `getPlans` lesen. Dafür ist kein Backup nötig. | Ohne Annotation erwarte ich den Fehler **am Abschluss der äußeren Transaktion**, obwohl der innere 400er behandelt wurde. Mit Annotation muss die Liste regulär zurückkehren und den Plan als veraltet ausweisen. Ein Test, der nur den direkten Aufruf des Resolvers auf HTTP 400 prüft, unterscheidet beide Fassungen nicht. [Transaktionsgrenze der Liste][list] · [Auflösung des Prüfungsthemas][proxy] · [Integrationstest mit Kurswechsel][course] |

### 6. Backup-Vertrag und zweiter Lernender

Das portable Planformat enthält weiterhin `landscapeId`, `planLabel` und `blocks`. Der Export liest die gespeicherten Blöcke direkt. Weder Marker noch Plan-ID, Planrevision, Speicherzeit oder **Plan**-Fingerabdruck kommen neu hinzu. Eine in einem Block gespeicherte Fassung und ihr Fingerabdruck waren bereits Teil eines Einheitenauftrags. Signiert wird weiterhin das serialisierte Gesamtobjekt mit HMAC-SHA-256. Die Gleichheit der Blöcke bedeutet daher keine Bytegleichheit zweier vollständiger Archive. Insbesondere wird das bestehende Feld `plannedGoals` aus dem wirksamen Fokus ermittelt und kann sich durch den Prüfungstag ändern. [Portables Planformat][portable] · [Blöcke im Export][export] · [Auftragsbindung][unitbinding] · [Signatur][hmac] · [Exportierter Fokus][exportfocus]

Beim Import in einen zweiten Lernenden prüft der Service die Signatur, sperrt den **Empfänger**, übernimmt die archivierte Curriculum-Konfiguration und ordnet die neuen Planzeilen dem Empfänger zu. Er entscheidet erneut, ob die Blöcke heute lesbar sind. Persönliche Prüfungsbelege haben eine eigene Regel und werden nur beim Rückimport in denselben Lernenden restauriert. Der bestehende Test zur Kopie prüft eine neue Plan-ID und Revision 1 für einen lesbaren Plan. Der neue Test zum markierten Plan importiert beide Archive jeweils in dieselbe ID. **Die Kombination aus markiertem Plan und zweitem Lernenden ist damit noch offen.** [Empfänger und Signatur][importstart] · [Eigentümer der Planzeile][outdated] · [Prüfungsbelege][receipts] · [Bestehender Kopiertest][copytest] · [Zweiter Import im neuen Test][roundtrip]

### 7. Issue #205

**Den beschriebenen Effekt bestätige ich für den Ein-Fach-Fall statisch.** Bei eingeschalteter Planbefolgung merkt sich `followedLearningScopeIds` einen aktiven Prüfungstag mit ausdrücklicher Themenliste, bevor es die Curriculum-IDs vergleicht. Beim markierten Plan bleibt so die Menge erlaubter Ziele leer. Der Fachzugriff gibt dann tatsächlich keine erreichbaren Ziele zurück. Ohne Prüfungstag gibt derselbe Zweig die gewöhnliche Fachauswahl frei. Bei ausgeschalteter Planbefolgung werden diese Pläne gar nicht geladen. [Prüfungstag und Marker][followed] · [Leere Fachauswahl][frontier] · [Planbefolgung aus][following]

Die Empfehlung, die Bindung durch einen veralteten Prüfungstag gesondert zu korrigieren, ist begründet. Zwei Grenzen sind wichtig. Erstens kann `hasExamScope` für die fachübergreifende Fortsetzung bereits durch **einen** solchen Plan andere reguläre Plankandidaten unterdrücken. Zweitens können ohne Prüfungstag pausierte Einzelblöcke die ausdrücklich angeforderte Fortsetzung weiterhin einschränken. Der neue Test lässt beim Fall `examTopicUnknown` die entscheidende Assertion zum aktiven Ziel aus. Eine eigenständige numerische Laufzeitmessung lässt sich daraus nicht bestätigen. [Fachübergreifende Auswahl][candidate] · [Pausierte Blöcke][personal] · [Ausgelassene Assertion][skip]

### 8. Fehlende Abdeckung und Cockpit

- **Ein vorhandener Test widerspricht dem neuen Vertrag.** `signedPlanImportRejectsAtomicGoalsOutsideThePersonalSubjectScope` signiert einen formal gültigen Matheplan mit einer fachfremden Ziel-ID und erwartet HTTP 400 sowie keine Planzeile. Die neue Rekonstruktion fängt genau diesen Fehler ab, die Formprüfung akzeptiert die ID und der Empfänger erhält einen markierten Plan. Das ist ein konkreter Widerspruch im Quellstand. Ein fehlgeschlagener CI-Lauf ist damit nicht behauptet. [Bestehende Assertion][oldassert] · [Prüfung unbekannter Ziele][unknown] · [Neuer Auffangpfad][classify]
- **Die Liste kann im Test leer bleiben.** `filteredOn(...).allSatisfy(...)` besteht auch ohne Treffer. Gerade bei einer verschwundenen Landschaft zählt der Status den Plan als nicht auswertbar. Bei nicht verfügbarer Anrechnung kann `summarize` vor der Ausgabe von `stale` mit 409 abbrechen und `safeSummary` den Eintrag auslassen. Der Test öffnet in diesem Fall ausschließlich den benachbarten lesbaren Plan. Damit ist die Erreichbarkeit des archivierten Plans über Liste und Detail nicht bewiesen. [Listenassertion][listtest] · [Status][today] · [Abbruch vor der Zusammenfassung][detail] · [Auslassen des Eintrags][safesummary]
- **Die Cockpit-Sichtprobe zeigt eine echte Bedienlücke.** Mit `stale=true` waren Hinweis und Fachzeile im gerenderten HTML vorhanden, die Plandetails und die Wechselaktion fehlten. Bei identischer Eingabe mit `stale=false` erschienen die Plandetails. Die Komponente filtert veraltete Pläne ausdrücklich aus. Der neue Backend-Test speichert einen gültigen Ersatzblock direkt per `upsert`. Die Kursplanung kann ebenfalls einen vorbereiteten Ersatz mit der gelesenen Revision senden. Beides belegt keinen Weg, den markierten Plan in der Lernendenansicht zu öffnen, zu korrigieren und erneut zu speichern. [Cockpit-Filter][uifilter] · [Anzeige der Plandetails][uidetails] · [Direktes erneutes Speichern im Test][resave] · [Speichern aus der Kursplanung][teacherwrite]

[summary]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:1871
[detail]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:1854
[supplied]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:296
[today]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:398
[oblig]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:145
[credit]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:235
[practice]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:1295
[handoff]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:10531
[current]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:1640
[candidate]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:1724
[manual]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:1336
[personal]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:1987
[exam]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:2039
[omitted]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:1171
[save]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:1604
[activity]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:835
[export]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:14920
[manifest]: /home/enpasos/projects/skillpilot/curricula/curriculum_manifest.json:2
[select]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:6445
[importselection]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:15001
[subjectlookup]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:719
[restore]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:15096
[classify]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:15061
[formtest]: /home/enpasos/projects/skillpilot/backend/src/test/java/com/skillpilot/backend/service/LearnerLearningPlanServiceTest.java:207
[norm]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:2370
[open]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:2503
[outdated]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:15144
[course]: /home/enpasos/projects/skillpilot/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java:1980
[planning]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:4413
[replace]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:15083
[serialization]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:15166
[fingergraph]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:4828
[cycle]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:4972
[wrap]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:4807
[decision]: /home/enpasos/projects/skillpilot/AGENTS.md:743
[resolve]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:5174
[invalidfocus]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:5910
[proxy]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:2026
[importorder]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:15019
[focuscheck]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:5310
[list]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:803
[portable]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/api/LearnerLearningPlanApi.java:263
[unitbinding]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/api/LearnerLearningPlanApi.java:24
[hmac]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:15249
[exportfocus]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:14705
[importstart]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:14950
[receipts]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/VerifiedExamPassService.java:120
[copytest]: /home/enpasos/projects/skillpilot/backend/src/test/java/com/skillpilot/backend/service/LearnerServiceTest.java:693
[roundtrip]: /home/enpasos/projects/skillpilot/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java:1950
[followed]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:5264
[frontier]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:4543
[following]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:10484
[skip]: /home/enpasos/projects/skillpilot/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java:1935
[oldassert]: /home/enpasos/projects/skillpilot/backend/src/test/java/com/skillpilot/backend/service/LearnerServiceTest.java:745
[unknown]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:2471
[listtest]: /home/enpasos/projects/skillpilot/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java:1905
[safesummary]: /home/enpasos/projects/skillpilot/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:873
[uifilter]: /home/enpasos/projects/skillpilot/app/src/components/LearnerPlanTodayOverview.tsx:142
[uidetails]: /home/enpasos/projects/skillpilot/app/src/components/LearnerPlanTodayOverview.tsx:299
[resave]: /home/enpasos/projects/skillpilot/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java:1960
[teacherwrite]: /home/enpasos/projects/skillpilot/app/src/components/CoursePlanPilotView.tsx:660