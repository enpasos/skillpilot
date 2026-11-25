# Unlesbarer Lernplan im Backup

Prüfstand `05a2b1c8c3`, Implementierung `ba1c911e98`, Basis `1001aa2c7f`. Zwei voneinander unabhängige Leser prüften denselben Stand. Die Koordination ergänzte echte Spring-/H2-Aufrufe, zwei gezielte Negativkontrollen, einen Zweitimport und eine Zählung im Listen-API. Die [erste](reviewer-a.original.md) und [zweite Originalantwort](reviewer-b.original.md) sind unverändert.

**Übernahme nach Klärung.** Der Import erhält die Ergebnisse und die Planblöcke bei einem heute unlesbaren Plan. Die Transaktionskorrektur behebt den beobachteten Fehler. Vor der Übernahme sind der ältere Erwartungstest zum fachfremden Plan, die Sichtbarkeit eines vollständig verschwundenen Fachs und die Abgrenzung technischer Fehler ausdrücklich zu entscheiden. Die Navigationsfolge eines veralteten Prüfungstags gehört zur bereits abgegrenzten #205.

## 1. Leser und gespeicherter Marker

Planliste, Einzelplan, Tages- und Coachstatus, Lernendenzustand, Reconcile, ausdrückliche Wiederaufnahme, Coachkontext und Export wurden tatsächlich aufgerufen. Bei bekanntem Fach bleibt sein Plan veraltet, die direkte Fortsetzung des Plans ist gesperrt. Im Quelltext schützen Kompatibilitätsprüfungen zusätzlich Berechnung der Pflichten, Anrechnung, automatische Fortsetzung, Fachwechsel und Aktivierung von Einheiten. Die Nachschlagewege verwenden das gewählte Curriculum und den Fachschlüssel. Der gespeicherte Wert `restored-outdated-plan` dient zum Vergleich. Die reguläre Curriculum-Auswahl verlangt genau einen veröffentlichten Treffer und kann diesen Marker derzeit nicht liefern.

Eine eigene Prüfung zählte die Zeilen des Listen-API. Bei bekanntem Physikfach mit verschwundenem Abschnitt gab es einen Treffer. Für ein vollständig verschwundenes Fach gab es mit Planbefolgung **0** und ohne Planbefolgung **0** Treffer. Der erhaltene Plan ist per Export nachweisbar. Die vorhandene Listenassertion prüft mit `allSatisfy` auch eine leere Treffermenge erfolgreich. Empfehlung für einen in der Liste reparierbaren Altplan ist ein eindeutiger veralteter Eintrag mit der archivierten Bezeichnung. Die davon getrennte Klausurbeschränkung steht unter Punkt 7.

## 2. Formprüfung

Bei gleichem Katalog durchläuft jeder zuvor erfolgreiche Import zuerst den bisherigen Normalisierungs-, Fokus- und Sortierpfad. Ein korrekt gespeicherter Plan wurde neben dem Altplan als aktuell rekonstruiert. Ein Lernblock ohne Datum verweigerte das gesamte Backup und ließ die bestehenden Daten unberührt.

Die Formprüfung akzeptiert mehr Eingaben, als eine normale Speicherung jemals in dieser Rohform ablegen kann. Die Speicherfunktion normalisiert Kennungen, Schreibung und Listen. Der Auffangpfad verwirft das Normalisierungsergebnis und bewahrt die archivierten Werte. Außerdem lässt er einen Plan zu, dessen einziger Block ein Prüfungstag ist. Eine Neuanlage braucht eine offene Lernaufgabe oder einen Einheitenauftrag. Diese Lockerung erlaubt historisch erschöpfte Pläne. Der Vertrag sollte ausdrücklich Form und ursprüngliche Speicherbarkeit auseinanderhalten. [Zusätzliche fachliche Dienstprobe](raw/extra/)

## 3. Fehlerklassifikation

Clientfehler aus der Wiederherstellung sowie `IllegalStateException` und `IllegalArgumentException` führen zur Formprüfung. Unbekannte Ziele oder Abschnitte, wegfallende Inhalte und das verschwundene Fach wurden tatsächlich geprüft. Falsche Form bleibt ein Importfehler. Ein bereits als 5xx klassifizierter Fehler verlässt den äußeren Handler weiterhin als Fehler.

Die Garantie gilt nicht für jeden ursprünglichen Serverfehler. Schon `learningPlanFingerprint` übersetzt einen Fehler im Strukturgraphen oder eine `ResponseStatusException` in 409. Ein Fehler im Katalog kann damit wie ein veralteter Plan behandelt werden. Das ist ein von beiden Prüfern belegter Codepfad. Im vorliegenden Katalog wurde kein solcher Schaden beobachtet. Empfehlung ist ein typisiertes Ergebnis für veraltete Fachreferenzen und eine eigene Behandlung technischer Fehler. Der Erhalt der Lernergebnisse behält dabei Vorrang. [Implementierung im geprüften Commit](https://github.com/enpasos/skillpilot/blob/ba1c911e98/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java)

## 4. Transaktion

Die reine Leseoperation `resolveLearningPlanGoalIds` benötigt für eine überholte Auswahl eine Fehlerbehandlung, die den aufrufenden Dienst nach seiner fachlich vorgesehenen Behandlung weiterarbeiten lässt. Beim Wechsel GK → LK und bei einem unbekannten Prüfungsthema lief die Planliste mit der Korrektur durch. Ohne den Zusatz trat für beide Fälle mit Planbefolgung eine `UnexpectedRollbackException` auf. Bei ausgeschalteter Planbefolgung liefen beide Fälle durch. Die Annotation erfasst sämtliche `ResponseStatusException`. Ein durchgereichter Fehler kann die äußere Schreibtransaktion weiterhin zurückrollen.

Für die sieben zusätzlich benannten Dienstmethoden ist kein weiterer Transaktionsdefekt nachgewiesen. Die zusätzlichen Prüfungen umfassten Kurs-, Dauer- und Stufenwechsel ohne Prüfungstag sowie je beide Einstellungen der Planbefolgung. 42 Leser-, Fortsetzungs- und Abgleichaufrufe gelangen. Die gespeicherte Revision und die Blockdaten blieben dabei stabil. Eine pauschale Änderung weiterer Transaktionsgrenzen ist durch diese Fälle nicht begründet.

## 5. Negativkontrollen

| Isolierter Dienststand | Fälle | Ergebnis |
|---|---:|---|
| Geprüfter Stand, inklusive Zweitimport | 15 | 15 bestanden |
| Ausschließlich der Auffangpfad entfernt | 10 | 10 Wiederherstellungen scheiterten beim ursprünglichen Lesefehler |
| Ausschließlich `noRollbackFor` entfernt | 4 | 2 mit Planbefolgung scheiterten am Rollback, 2 ohne Planbefolgung bestanden |

Die Tests verwendeten denselben Stand von Katalog und Ressourcen. Ein erster technischer Lauf mit symbolisch verknüpften Ressourcen scheiterte bereits an der Einrichtung des Abschlussprofils. Die Tabelle verwendet ausschließlich den erneut ausgeführten Lauf mit schreibgeschützt eingebundenen Originalverzeichnissen. Die Arbeitskopie des Produktcodes blieb unangetastet. [Laufbelege](raw/bind/)

## 6. Archivvertrag und zweiter Lernender

Beim Export eines markierten Plans enthält sein portabler Eintrag weiter Fachschlüssel, Bezeichnung und Blöcke. Die Archivsignatur wird weiterhin vor dem Import verifiziert. In den zehn Wiederherstellungsfällen wurde das zweite, regulär durch den Dienst signierte Archiv zusätzlich in einen neu angelegten Lernenden importiert. Blöcke, Markierung, Blockfingerabdruck und der geprüfte Lernfortschritt stimmten. Der erneute Export des Empfängers enthielt dieselben Blockwerte. Keines der drei Felder für Curriculum-Markierung, Planfingerabdruck und Speicherzeit erschien neu im portablen Plan. Ein vorhandener Kursbezug in einem Einheitenblock gehört schon zum älteren Vertrag.

## 7. Auswirkung des Prüfungstags (#205)

Bei eingeschalteter Planbefolgung ergab die fachbezogene Messung im selben Aufbau:

| Veralteter Physikplan | Ziele an der Frontier | `resumeAvailable` | `canContinue` für diesen Plan |
|---|---:|---|---|
| Entfernter Abschnitt, ohne Prüfungstag | 1 | true | false |
| Aktiver Prüfungstag mit unauflösbarem Thema | 0 | false | false |

Die Empfehlung wird bestätigt. Ein heute nicht auswertbarer Plan soll keine verbindliche Klausurauswahl für das gewöhnliche Lernen erzeugen. Der gültige Prüfungstag eines anderen aktuellen Plans muss weiter wirksam bleiben.

## 8. Cockpit und bestehende Erwartungen

Der unveränderte Test `LearnerServiceTest.signedPlanImportRejectsAtomicGoalsOutsideThePersonalSubjectScope` scheitert am geprüften Stand. Er erwartet HTTP 400, doch der signierte, formal gültige Fremdfachplan gelangt in den neuen Auffangpfad. Beide Prüfer fanden diesen Widerspruch unabhängig. Die Erwartung sollte für signierte historische Pläne ausdrücklich auf Wiederherstellung als veraltet, unwirksame Pflichten und erhaltene Lernergebnisse umgestellt werden. Falls der bestehende Fachschutz auch für historische, regulär signierte Archive gelten soll, muss der Import einen heute zweifelsfrei fachfremden Inhalt von einer fehlenden oder verschobenen Referenz unterscheiden. Für die aktuelle Neuanlage gilt die strikte Fachprüfung in beiden Varianten. [Ausführung des vorhandenen Tests](raw/compat/)

Die echte Cockpit-Komponente wurde von beiden Fachprüfern mit denselben Beispieldaten und gewechseltem `stale`-Wert gerendert. Der Statushinweis und die Fachzeile bleiben bei einem veralteten Plan sichtbar. Der Filter in `LearnerPlanTodayOverview` entfernt dessen Plandetails und die Wechselaktion. Eine gültige Neufassung kann im realen Dienst mit der aktuellen Revision gespeichert werden. Bis hier ist keine Bedienfolge nachgewiesen, mit der Lernende den verschwundenen oder ausgeblendeten Altplan im Cockpit selbst öffnen und reparieren können.

Die ergänzende Chromium-Prüfung nutzte die tatsächlichen Komponenten für Tagesübersicht, Planverwaltung und Einheitenauftrag mit synthetischen API-Antworten. Der normale Einheitenknopf blieb beim veralteten Plan gesperrt. Eine erkannte alte Fassung eines Einheitenauftrags bot die Auswahl der aktuellen Fassung an. Bei akzeptierter Antwort wurde der Auftrag aktiv. Bei einem zusätzlichen unaufgelösten Altziel blieb dieses im Speicherauftrag enthalten und die simulierte Ablehnung zeigte den allgemeinen Ladefehler. Zusammen mit dem positiven Diensttest belegt das den engen Reparaturweg für Einheitenaufträge. Eine freie Reparatur beliebiger Altpläne im vollständigen Cockpit bleibt offen. [Chromium-Fälle und Grenzen](raw/cockpit/result.actual.json)

Die [Ausführungs- und Dateibindungen](independent-review.actual.json) enthalten beide unveränderten Einzelgutachten und die Prüfdaten.
