# Coach-Feedback: Produktionsbereinigung vom 12. September 2026

## Entscheidung und Umfang

Der Product Owner verlangte ausdrücklich, dass vom Coach erzeugte Felder
`workFeedback`, `outcomeFeedback` und Recall-`feedback` im Provider-Chat bleiben,
und autorisierte gesondert die Entfernung bereits gespeicherter Kopien aus der
Produktion. Der Coach beurteilt die Arbeit der lernenden Person und formuliert
seine Rückmeldung selbst. Der SkillPilot-Core erhält das autorisierte
strukturierte Ergebnis, keine Gesprächsteile oder Erfolgsmeldungen.

Davon unabhängig ist der gesondert und ausdrücklich autorisierte Posteingang
für Curriculum-Feedback. Seine Einreichungen, Publikationsdaten und
Aufbewahrungsverfahren waren nicht Gegenstand dieser Bereinigung.

Verbindliche Regel:
[providerneutrale Coach-Grenze](../concept/runtime-workflows/provider-neutral-coach-boundary.md).
Dauerhafte Entwicklungsanweisungen: `AGENTS.md` im Repository, Abschnitt 12.1.

## Was tatsächlich gespeichert wurde

- Claudes gewöhnlicher Mastery-Aufruf verlangte unnötigerweise zwei
  Feedbacktexte. Die damalige Implementierung speicherte sie nicht als
  Mastery-Daten; sie gingen aber in Eingabevalidierung und Replay-Hashing ein.
  Ihre Erhebung musste auch ohne Klartextkopie in der Datenbank entfallen.
- OpenAIs gewöhnlicher Mastery-Aufruf gab die Texte in `completionHandoff`
  und im Textergebnis zurück. Diese Antworten konnten in
  `openai_de_idempotency.response_json` und `response_text` gelangen.
- Verified Recall beider Provider verwendete gemeinsame DTOs, die Feedback
  annahmen. `LearnerService` speicherte es als
  `cardId → verifiedRecall → lastFeedback` in
  `learner_client_state.client_state`.
- Anfragen an die frühere Route
  `/api/ai/{locale}/sessions/{token}/verified-recall/result` konnten außerdem
  `requestBody.feedback` in AI-Trace-JSONL-Dateien schreiben.

## Abgeschlossene Produktionsmaßnahme

Am 12. September 2026, vor 10:45 UTC, wurde die vom laufenden
`skillpilot.service` verwendete Datenbank `skillpilot` bearbeitet. Die Zuordnung
wurde über den Anwendungsprozess dieses Dienstes geprüft. Datenbankzugangsdaten
und betroffene Textwerte wurden weder ausgegeben noch exportiert.

| Speicher | Vorher | Maßnahme und Prüfung |
| --- | --- | --- |
| `learner_client_state.client_state` | 90 nicht leere `verifiedRecall.lastFeedback`-Felder in 9 von 53 Zeilen | Alle 90 Felder entfernt; sämtliche anderen geparsten JSON-Werte, Zeilenschlüssel und Zeitstempel unverändert |
| `learner.client_state` | 606 Zeilen; keine betroffenen Feldnamen | Nur lesend geprüft, keine Änderung |
| `claude_v1_session_idempotency.response_payload` | 2 Quittungen; keine betroffenen Feldnamen | Nur lesend geprüft; Quittungen und Replay-Zustand erhalten |
| Frühere `claude_v1_idempotency` | Leer | Keine Änderung |
| `openai_de_idempotency.response_json` und `response_text` | Leer | Keine Änderung |
| AI-Trace-JSONL-Dateien | 18 `requestBody.feedback`-Felder in 2 von 93 Dateien | Alle 18 Felder entfernt; sämtliche anderen JSON-Werte und Datensatzlängen erhalten |
| Aktuelle und rotierte Anwendungslogs | 8 Dateien; keine Treffer für betroffene Feldnamen | Nur lesend geprüft, keine Änderung |

Die Zahlen bezeichnen gespeicherte Felder beziehungsweise Kopien, nicht
unterschiedliche Lernende oder Prüfungsereignisse. Es wurden weder
Lernenden- oder Mastery-Datensätze noch Karten, Wiederholungshistorien,
Sessions, OAuth-Zugangsdaten oder Replay-Quittungen gelöscht.

### Schutzmaßnahmen für die Datenbank

Die lesende Vorprüfung stellte genau neun Zielzeilen und neunzig Felder fest,
alle unter dem bekannten zweistufigen Recall-Pfad. Die Schreibtransaktion
verlangte dieselben Zahlen; bei einer geänderten Anzahl oder unerwarteten
JSON-Position wäre sie abgebrochen worden.

Geändert wurde ausschließlich `learner_client_state.client_state`. Die
Transformation erhält jeden Karten-Wurzeleintrag und entfernt nur
`lastFeedback` aus dessen `verifiedRecall`-Objekt. Das Objekt und seine übrigen
Felder bleiben erhalten. Die Transaktion hält eine kurze
Schreibkonfliktsperre auf der Tabelle, mit zwei Sekunden Lock-Timeout und
zehn Sekunden Statement-Timeout.

Vor dem Commit wurde die gesamte resultierende Kartenstatustabelle mit der
erwarteten bereinigten Darstellung verglichen, einschließlich aller
unbeteiligten Spalten und Zeilen. Die vollständige Mastery-Tabelle blieb im
Vorher-nachher-Vergleich unverändert. Die Transaktion wurde erfolgreich
committet. Ein gesonderter lesender Prüflauf fand keine betroffenen Feldnamen
mehr in den untersuchten Datenbankspeichern.

### Schutzmaßnahmen für Trace-Dateien

Der Trace-Lauf parste das JSON, prüfte die exakte Recall-Ergebnisroute und
bearbeitete ausschließlich `requestBody.feedback`. Das Entfernungsverfahren
wurde zuvor an 25 synthetischen Fällen geprüft, darunter Unicode,
maskierte Anführungszeichen, Zeilenumbrüche, unterschiedliche Feldpositionen
und Werte anderer Datentypen.

Jedes vorhandene Feld samt angrenzendem JSON-Trennzeichen wurde an Ort und
Stelle mit gleich langen Leerzeichen überschrieben. Keine ganze Logdatei
wurde ersetzt, gekürzt oder gelöscht; die fortlaufende Protokollierung konnte
ohne Verlust neuer Datensätze weiterlaufen. Dateiidentität und ursprüngliche
Bytes wurden vor jedem Schreibvorgang geprüft. Das resultierende JSON wurde
mit dem ursprünglichen Objekt ohne genau dieses Feld verglichen. Der
anschließende Scan aller 93 Trace-Dateien fand keinen der vier früheren
Feldnamen. Es wurde keine Klartext-Sicherung der entfernten Daten angelegt.

## Zugehöriger Mastery-Vorfall

Für den gemeldeten Claude-Mastery-Aufruf lag eine gespeicherte Erfolgsquittung
mit `savedMastery = 1.0` vor; Zustandsversion von Quittung und Nutzdaten war
jeweils 98. Der zugehörige Mastery-Datensatz enthielt nach der Bereinigung
ebenfalls `1.0`. Die fehlerhafte Toolanzeige im Client belegte daher **keine
fehlende Mastery-Speicherung**. Die genaue Ursache der fehlerhaften
Clientantwort ist weiterhin nicht nachgewiesen. Ein Timeout oder eine verlorene
Antwort dürfen ohne Beleg nicht als feststehende Ursache ausgegeben werden.

Zur Untersuchung oder Korrektur dieses Anzeigeproblems wurde keine produktive
Bewertung wiederholt und keine Mastery verändert. Dieses Dokument enthält
bewusst weder Lernendenkennung, Sessiontoken noch private Antworten oder
Bewertungstexte.

## Rollout- und Löschgrenzen

Die Datenbereinigung ist abgeschlossen; sie ist **kein Deployment**. Das zum
damaligen Zeitpunkt laufende alte Backend konnte die entfernten Felder weiter
annehmen und erneut erzeugen, bis korrigiertes Backend und Provider-Verträge
gemeinsam ausgerollt wurden. Der korrigierte Quellstand entfernt beide
Mastery-Texteingaben und deren Rückgabe, macht Recall-DTOs feedbackfrei,
beendet die Speicherung von `lastFeedback` und unterbindet das Protokollieren
der Bewertungsanfragekörper. Regressionstests prüfen Schemata, verbotene
Eingaben, gespeicherten Zustand und Logging. Dieses historische Protokoll ist
kein Nachweis für den Zustand eines späteren Deployments.

Alte gecachte Provider-Schemata oder Anweisungen können die inzwischen
verbotenen Felder weiterhin senden. Das neue Backend weist sie zurück, statt
den alten Vertrag stillschweigend anzunehmen. Nachfolgepaket und aktualisierter
Toolkatalog müssen daher mit der Backend-Aktivierung abgestimmt werden.
Veröffentlichte Claude-1.1.3-Artefakte und die abgelehnte OpenAI-1.0.0-Historie
bleiben unverändert; lokale Nachfolgevorbereitung ist weder
Marketplace-Veröffentlichung noch Provider-Abnahme.

PostgreSQL-Updates bewirken eine logische Löschung. Sie garantieren keine
physische Entfernung aus WAL, alten Datenträgerseiten, Speichersnapshots oder
externen Backups. Keine Backup-Aufbewahrungsregel und kein externer Snapshot
wurde verändert. Vor der Freigabe wiederhergestellter Lerndaten muss ein
Restore diese gezielte Entfernung erneut anwenden. Providerseitige
Chatverläufe und von Lernenden verwahrte Screenshots liegen außerhalb dieser
Serverbereinigung.
