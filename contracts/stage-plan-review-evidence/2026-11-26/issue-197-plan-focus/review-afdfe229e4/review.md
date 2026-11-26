# Aufgabe V · Planfortsetzung unter dem gespeicherten Fokus

**Änderungen vor Übernahme von PR #214 empfohlen.** Der ursprünglich gemeldete Fehler bei Auswahl eines gewöhnlichen Inhaltsziels in zwei Abschnitten ist behoben. Der Kandidat kann jedoch bei der Aktivierung eines gewöhnlichen Lernplans ein schon laufendes Ziel verlieren. Außerdem kann ein Mehrfachabschnittsblock eine gültige Vorbereitungsempfehlung überspringen. Beide Verhaltensänderungen wurden gegen die Basis mit denselben Daten nachgewiesen.

Geprüft am 26. November 2026. Basis `7c921a452caa00636d8bfb8b324d530bbc4a2886`, PR-Commit `afdfe229e4ace47e0f32802cf9a56a761145c2ef`. Im produktiven Java-Code unterscheidet sich allein `LearnerLearningPlanService`. Für die Gegenläufe wurde die Basisversion dieser Klasse vor demselben Test- und Datenbestand geladen. Zwei unabhängige Gutachter haben den Schnitt getrennt beurteilt. Die folgenden Laufbefunde stammen aus echten Backenddiensten mit temporären H2-Lernern. [Originalgutachten A](reviewer-a.md) · [Originalgutachten B](reviewer-b.md) · [Laufnachweise](raw/root/junit.actual.json)

## Befunde nach Schwere

| Priorität | Beobachtung | Einordnung |
|---|---|---|
| Hoch | Aktivierung einer gewöhnlichen Unterrichtsplanung ersetzt ein zulässiges laufendes Diagrammziel durch ein anderes Thema. Das Ziel verschwindet aus Fokus und Rückkehrzustand. | Auf dem Kandidaten neu für den regulär erreichten Fall mit bestandenem Kindauftakt. Vor Übernahme korrigieren. |
| Mittel | Zwei unabhängige Vorbereitungsempfehlungen im selben Block verschwinden bei Auswahl unter den Einzelfokussen. | Regression des unterstützten Materialformats. Die zwei aktuell registrierten Materialien enthalten keine solche Empfehlung. |
| Mittel | Ist der Kindauftakt selbst die einzige fällige Verpflichtung, wechselt die Cockpit-Fortsetzung bei zwei Abschnitten vom Kind- zum Elternauftakt. Die generische Fortsetzung startet bei offenem Elternauftakt gar nichts. | Neuer Unterschied für das Cockpit. Der generische Einstieg konnte den Kindauftakt bereits auf der Basis nicht starten. |
| Mittel | `continuePlan` meldet einen Fokus, hinterlegt beim erforderlichen Auftakt aber zusätzliche Ziele. Coach und generische Fortsetzung behalten den vorgesehenen Fokus. | Bereits auf der Basis nachgewiesen. Bei Aussagen über Gleichheit aller Wege berücksichtigen. |

### 1. Stimmen Anzeige, Coach und Schreibwege überein?

**Für das ursprünglich gemeldete Inhaltsziel stimmen auf dem Kandidaten die aktiven Schritte überein. Der vollständig gespeicherte Fokus und die Behandlung eines laufenden Ziels unterscheiden sich.** Die Tabelle zeigt die hessische G9-GK-Probe mit offenen Auftakten, Magnetismus als bisherigem Fokus und dem geplanten Inhaltsziel `8aff7aac`. „Coach“ bezeichnet die explizite Fortsetzung, „generisch“ den automatischen Abgleich. Der Coach-Tagesstatus meldet Verfügbarkeit und offenen Umfang. Die konkrete Ziel-ID liefern die Ansicht und die manuelle Coach-Auswahl. [Probenquelltext](raw/root/entry-paths.method.java)

| Gewählter Block | Planansage, Coach, generisch, Cockpit | Fokus nach Coach/generisch | Tatsächlicher Fokus nach `continuePlan` |
|---|---|---|---|
| Nur Kindabschnitt | Kindauftakt `b4e95dce` | Kindabschnitt | Kindabschnitt und „Warum Physik?“ `5c44b9ba` |
| Kindabschnitt und Magnetismus | Elternauftakt `a4d4efe1` | Inhaltsziel `8aff7aac` | Inhaltsziel, Elternauftakt und „Warum Physik?“ |
| Ohne Abschnitt | Elternauftakt | Inhaltsziel | Inhaltsziel, Elternauftakt und „Warum Physik?“ |
| Durch Umgruppierung aus dem gewählten Abschnitt verschobenes Ziel, Voraussetzungen erfüllt | Die bestehenden Integrationstests bestätigen Ansicht, Fortsetzung, Handoff und Start des verschobenen Atoms. | Verschobenes Atom | Verschobenes Atom in der geprüften Konstellation ohne ausstehenden Auftakt |

Beim Mehrfachabschnittsblock ließen sich auch das manuell angebotene Ziel und eine Neuaktivierung ohne bereits laufendes Ziel starten. Das vorgesehene Inhaltsziel blieb hinter dem Auftakt geparkt. `continuePlan` ruft bei Zeile 1512 `setPlannedGoalsAndGetState` und dann `setActiveGoal` auf. Letzteres kann bei einem erforderlichen Auftakt den gespeicherten Fokus um den Auftakt und bei strengem Lernen um Grundlagen erweitern (`LearnerService` ab Zeile 11623). Der andere Übergang verwendet `resolveLearningPlanEntry` ab Zeile 11799. Die Tabelle beschreibt den Datenbankzustand bei strengem Lernen, einschließlich der zusätzlichen schon beherrschten Grundlage. Keine Probe erteilte für diese Navigation einen zusätzlichen Leistungsnachweis. [Cockpit](raw/root/head/path-many-cockpit.json) · [Coach](raw/root/head/path-many-coach.json) · [Basis-Cockpit](raw/root/base/path-many-cockpit.json)

**Aktivierung mit einem laufenden Ziel.** Die lernende Person hat den Kindauftakt bestanden und `1e459a1b` regulär über den Kindabschnitt gestartet. E.1 ist noch offen. Eine Planaktivierung enthält dieses Diagrammziel und ein früher fälliges Magnetismusziel `b4175564`. Der tatsächliche Übergang akzeptiert das Diagramm unter seinem Einzelfokus über den Elternauftakt. `findPreservedActiveCandidate` prüft gewöhnliche Pläne in Zeilen 1674–1697 nur auf unmittelbare Mitgliedschaft des Diagramms in der Lernfront. Diese enthält den Elternauftakt. Daraufhin gewinnt das frühere Magnetismusziel.

| Zustand beim Aktivieren | Basis | Kandidat |
|---|---|---|
| Kindauftakt bestanden, Elternauftakt offen | Meldet irrtümlich das Diagramm. Speichert den Elternauftakt und hält das Diagramm als Fokus und Rückkehrziel fest. | Meldet und speichert Magnetismus. Das Diagramm ist als Rückkehrziel verloren. |
| Beide Auftakte bestanden | Diagramm bleibt aktiv. | Diagramm bleibt aktiv. |
| Wiederhergestelltes laufendes Diagramm, beide Auftakte offen | Magnetismus gewinnt bereits auf der Basis. | Magnetismus gewinnt weiterhin. |

Empfohlene Korrektur: für das laufende Ziel unter seinem wirklichen Fokus die zulässige Kombination aus erstem Schritt und Rückkehrziel bestimmen. Bei vorgeschaltetem Auftakt muss die Antwort diesen Auftakt nennen und die Speicherung das Diagramm behalten. Prüfen, dass ein echtes fachliches Hindernis weiterhin zum Rückgriff auf ein anderes Ziel führt. [Basis und Kandidat mit identischen Aktivierungen](raw/probes/README.md)

### 2. Erreichbarkeit, Klausuren und Einheitenaufträge

**Eine explizit eingeplante Kindöffnung ist ein eigener Gegenfall.** Der Plan enthält allein `b4e95dce` und nennt Kindabschnitt und Magnetismus. Beide Auftakte sind offen. Unter den beiden Abschnittswurzeln ist der Kindauftakt sichtbar. Unter seinem eigenen Atomfokus fordert der Resolver ausdrücklich den Kindauftakt, während die Lernfront nur den Elternauftakt liefert. `dueEntryGoalId` kann unter diesem Fokus keinen der beiden als Eintritt zu genau dieser Verpflichtung auswählen. Die Ansicht greift auf einen anderen verfügbaren Schritt zurück. [Frontiers und generische Fortsetzung](raw/root/head/opening-many-false.json)

| Weg in diesem Zustand | Basis | Kandidat |
|---|---|---|
| Planansicht | Kindauftakt | Elternauftakt |
| Generischer Abgleich | HTTP 409 | Keine Änderung, kein aktives Ziel |
| Explizites Fortsetzen im Coach | HTTP 409 | Elternauftakt startet |
| Auswahl des in der Ansicht genannten Schritts im manuellen Coach | HTTP 409 | Elternauftakt startet |
| Cockpit `continuePlan` | Kindauftakt startet | Elternauftakt startet |

Bei bereits bestandenem Elternauftakt erreicht der Mehrfachabschnittsplan den Kindauftakt. Bei einem einzigen Kindabschnitt startet der Kindauftakt sofort. Es gibt somit einen verlorenen direkten Einstieg, keinen Nachweis einer dauerhaften Unerreichbarkeit. Der Tagesstatus meldet hier `resumeAvailable=true` für die explizite Fortsetzung und `automaticResumeAvailable=false` für den automatischen Abgleich. Wenn der explizit gestartete Elternauftakt bestätigt wird, ist kein Rückkehrziel geparkt. Es startet kein Kindauftakt automatisch. Die Planansicht bietet ihn inzwischen als nächsten Schritt an. [Basis-Cockpit](raw/root/base/opening-many-false-cockpit.json) · [Kandidat-Cockpit](raw/root/head/opening-many-false-cockpit.json) · [Explizite Coach-Fortsetzung](raw/root/head/opening-many-false-coach.json)

Für Klausurpläne binden die Frontieranfragen weiterhin den ganzen Klausurumfang. Die Klausuraktivierung verwendet `learningPlanTransitionAccepts`; der Zweig wurde im Diff nicht geändert. Die Tests zur Aktivierung hinter einem vorgeschalteten Auftakt, einschließlich eines nicht zulässigen Ziels, bestanden. Einheitenaufträge folgen ihrer versionierten Auswahl, und `dueEntryGoalId` fügt ihnen keinen freien Unterrichtsauftakt hinzu. Geprüft wurden unter anderem der dedizierte Prüfauftakt, das Fortsetzen eines gewählten Einheitenauftrags mit separat fälligem Auftrag und die direkten bzw. geführten Einstiege in verschachtelte Einheiten. [Einzelergebnisse](raw/root/junit.actual.json)

### 3. Elternauftakt vor Kindauftakt

**Die Differenz braucht eine ausdrückliche Produktentscheidung, wenn die Auswahl des Kindabschnitts auch in einem Mehrfachabschnittsblock als Direkteinstieg gelten soll.** Der Beschluss vom 22. November unterscheidet den Abstieg aus einem Elternabschnitt vom direkten Einstieg ins Kind. Ein daneben gewählter Magnetismusabschnitt belegt für sich keinen Abstieg aus E.1. Der Kandidat kann seine Reihenfolge technisch erklären: Ein explizit eingeplantes Atom läuft unter seinem Einzelfokus. Die aktuelle Implementierung öffnet dort den äußersten noch offenen Abschnitt zuerst.

Ein direkter Einstieg bei mehreren Abschnitten müsste den zum Ziel gehörenden ausgewählten Kindabschnitt für die Wahl des Auftakts und für die Rückkehr behalten. Zugleich muss die ausdrücklich eingeplante Einzelaufgabe startbar bleiben, wenn die gewöhnliche Unterrichtsreihenfolge des Abschnitts sie zurückstellen würde. Erforderlich sind Fälle für mehrere passende Abschnitte, ein verschobenes Ziel und die ausdrückliche Wahl der Kindöffnung. Die bestehenden Regeln bieten bereits die Gegenproben für echten Elternabstieg und direkten Kindstart. [Beschluss und beide Diagnosen in Issue #197](https://github.com/enpasos/skillpilot/issues/197) · [Eigenständige Einstiegsprüfungen](raw/root/junit.actual.json)

### 4. Vorbereitungskette und Reihenfolge

**Bei einem einzelnen Abschnitt funktioniert die getestete Kette. Bei mehreren Abschnitten geht sie auf dem Kandidaten verloren.** Zwei zulässige Empfehlungen wurden in eine temporäre Kopie des hessischen Materials eingetragen. Drei voneinander unabhängige Ziele lagen im selben fälligen Block, alle nötigen Auftakte waren bestanden. Geplant war zuerst `d9a6ea85`; dessen empfohlene Vorbereitung `89a8cf15` verweist ihrerseits auf `e0004439`. Im Test eines echten Materials und einer echten Lernfront muss die Kette also bei `e0004439` beginnen.

| Anordnung | Basis, Anzeige und Speicherung | Kandidat, Anzeige und Speicherung |
|---|---|---|
| Ein Abschnitt | `e0004439` | `e0004439` |
| Derselbe Block mit zweitem Abschnitt | `e0004439` | `d9a6ea85` |

`unitStudyGuidance` prüft, ob die Vorbereitung im betrachteten Umfang liegt (`LearnerService` ab Zeile 8699). In der Lernfront des einzelnen Zieles fehlt die unabhängige Vorbereitung. Der Callback ab Zeile 1954 in `LearnerLearningPlanService` erhält daher schon leere Metadaten. Der nachfolgende Kettendurchlauf ab Zeile 2322 kann sie nicht rekonstruieren. Empfehlung: die Reihenfolge aus dem Blockkontext ermitteln, beide Kandidaten weiterhin unter ihrem tatsächlichen Ausführungsfokus prüfen und nur eine fällige, offene und startbare Vorbereitung desselben Blocks vorziehen. [Reale Materialprobe](raw/probes/TaskVProbe.methods.java) · [Lauf auf dem Kandidaten](raw/probes/head.junit.actual.json)

### 5. Aussagekraft der Tests

**169 von 169 ausgewählten Repository-Tests bestanden auf dem Kandidaten.** Darunter waren alle sechs neuen Fälle. Mit derselben Testsuite und dem produktiven Basis-Service scheiterten wie erwartet genau vier der sechs Fälle. Der neue Test deckt den Handoff nach bestandenem Ziel, `reconcile`, den gespeicherten Fokus und die Folge bis zum geplanten Ziel ab. Sein Pilotparameter schaltet `unitAssessmentPilotEnabled`. AutoPilot bleibt in diesem Test ausgeschaltet. Die übrigen 163 grünen Fälle sind keine zusätzliche Prüfung jeder denkbaren Kombination von Block und Einstieg. [Ausgeführte Klassen und Fälle](raw/root/junit.actual.json)

Die eigenen Vergleichsläufe protokollieren auf beiden Ständen je **18 Einstiegs- und Fortsetzungsfälle**. Zusätzlich gab es pro Stand **fünf Prüfungen** mit ausdrücklich formuliertem Soll für Planaktivierung und Vorbereitung. Auf der Basis bestanden drei davon, auf dem Kandidaten zwei. Die Unterschiede und die schon auf der Basis fehlschlagenden Erwartungen stehen oben. Die 18 protokollierenden Fälle gelten als erfolgreich ausgeführte Messungen; die ausgelesenen Zustände enthalten die beschriebenen Produktabweichungen. [Aufrufe und Messwerte](raw/root/) · [Fünf gezielte Sollprüfungen](raw/probes/README.md)

Für einen Nachfolger sollten vier Fälle als Produktverträge hinzukommen: laufendes Ziel hinter einem Auftakt mit früherem Konkurrenzziel, die Kindöffnung selbst als Planverpflichtung, vollständiger persistierter Fokus aller Fortsetzungswege und eine vom echten Callback gelieferte Vorbereitungskette. Bei letzterer auch eine noch nicht fällige Vorbereitung und eine Vorbereitung in einem anderen Block ausschließen. Die pädagogische Entscheidung aus Frage 3 bleibt getrennt von diesen technischen Korrekturen. Beide unabhängigen Gutachten sind in ihrer abgegebenen Fassung beigefügt. Die Prüfung umfasste die benannten Dienste und Tests; es gab keine Browser- oder vollständige CI-Abnahme.
