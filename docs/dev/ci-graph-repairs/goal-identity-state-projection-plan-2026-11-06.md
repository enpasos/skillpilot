# Zustandsprojektion und getrennte B-Abnahme

Stand: 6. November 2026. Root hat den folgenden **reinen, unverdrahteten
Backendkern** zur Umsetzung bestätigt. Er ist keine Runtime-Aktivierung,
Datenmigration oder Freigabe eines der zehn B-Verträge. A bleibt eine isolierte
Kandidaten-QA-Projektion; `GoalIdentityProofLoader` bleibt geschlossen.

Die [A-Kernprüfung](goal-identity-ab-core-review-2026-11-06.json) und der
[unabhängige Zweitblick](canonical-identity-proof-independent-review-2026-11-06.md)
betreffen 23 reine Java-Tests. Der hinzugekommene State-Helfer besteht 15 weitere
reine Tests und den [unabhängigen Zweitblick](canonical-identity-state-projection-independent-review-2026-11-06.md).
Diese Nachweise belegen weder echte Zustandskontinuität noch Browser-,
Teacherplan-, Paket- oder Importintegration.

## Enger Implementierungsumfang

`GoalStateProjection` bleibt paketprivat, ohne Spring-Bean und ohne Referenz aus
bestehenden Runtime-Diensten. Er verwendet dieselbe immutable `GoalIdentityMap`
und bindet seine Arbeitsprojektionen an eine festgehaltene Snapshotidentität.
Nur ausdrücklich typisierte Goalfelder werden übersetzt: Mastery-/SRS-Keys,
Fokus, aktives Ziel, die zwei Goalfelder des Completion-Navigationszustands,
Plan-`goalId`/`goalIds`/`atomicGoalIds` und Abschluss-Goal-IDs. Plan-/Block-/Klassen-
und Karten-IDs, Titel, URLs, Quellen-IDs und beliebige Strings bleiben erhalten.

Jede Operation liefert getrennte kanonische Lese- und dauerhafte
Schreibprojektionen. Sie mutiert weder Entitäten noch Eingabedaten. Originale
Plan-/Archivbytes und Capturemetadaten bleiben separat erhalten. Verschiedene
Schlüssel dürfen erst nach Übersetzung der **typisierten Vergleichsfelder**
zusammenfallen: identische Ergebnisse werden in der Arbeitsprojektion einmal
geführt; unterschiedliche Werte, Zeitstempel, Kartenobjekte oder Capturebelege
führen zum Konflikt. Es gibt kein `max`, `latest` oder `passed-wins` für
Aliaswidersprüche. Geordnete Goalarrays behalten Reihenfolge, Leerlisten und
Duplikate; fachliche Planvalidierung bleibt eine zusätzliche Pflicht.

Der Importkern prüft zuerst die heutige HMAC-Semantik über
`objectMapper.writeValueAsString(originalLearnerDataDTO)`. Er übersetzt davor
keinen Schlüssel und ersetzt das Verfahren nicht durch eine Signatur beliebiger
Roharchivbytes. Erst eine authentisierte Kopie darf für alle Schreibmengen
projiziert und validiert werden. Ein Fehler liefert keinen teilweisen
Restoreplan. Das originale DTO/Archiv wird nicht umgeschrieben. SRS-Format,
erhaltene erfolgreiche Karten, Plan-Scope und Berechtigungen müssen die
bestehenden Guards danach weiterhin vollständig prüfen.

## Zehn erforderliche Evidenzgrenzen

Die Namen folgen exakt dem [B-Schema im Repository](https://github.com/enpasos/skillpilot/blob/feat/skill-graph-ci-contracts/contracts/canonical-goal-identity/v1/activation-receipt.schema.json).
Jede Zeile ist weiterhin **Integration offen**; reine Kerntests ersetzen ihre
nachstehenden echten Nachweise nicht.

| B-Vertrag | Tatsächliche Integrationsflächen | Erforderlicher Gegenbeleg vor B |
| --- | --- | --- |
| `mastery-and-timestamps` | `LearnerService.getMastery`, `getMasteryWithTimestamps`, `getMasteryProjectedToGoalIds`; zusätzliche direkte Reads in Completion; Writes bei `persistVerifiedRecallMastery` und regulärem Masteryupdate | Alter DB-Key wird kanonisch gelesen, expliziter neuer Write trifft denselben dauerhaften Key; Wert und Originalzeit bleiben erhalten. Keine Readwrites, kein zweites Resultat, keine neue Anerkennungsregel. |
| `srs-verified-recall-and-card-state` | `loadSrsStateStrict`, `resolveSrsGoalSnapshots` einschließlich Batchquery, `getClientState`, `upsertClientState`, `persistVerifiedRecallBatchClientState` | Vollständiges tatsächliches Deck/Kartenzustand unter altem Goal-Key; neue API-ID liest/schreibt denselben Zustand. Karten-IDs, Erfolge und Zeitstempel unverändert; bestehende Stale-/Passed-/Serverbatch-Guards greifen weiterhin. |
| `planned-goals-and-active-navigation` | `ensurePersistedDefaultProjectedFocus`, `getStoredPlannedGoals`, `setPlannedGoals`, aktive Lernzielvalidierung und `CompletionWorkflowState.currentGoalId/directAssessment.goalId` | Aliasauflösung vor Invaliditätslöschung, Defaultwahl und Setvergleichen. Read führt weder zu Fokusverlust noch neuer Revision; Navigation, Sessionbindung, Ablaufzeit und Autorisierung bleiben wirksam. |
| `learning-plan-original-capture` | `LearnerLearningPlanService.readBlocks`/`normalizeBlocks`; `LearnerService.isLearningPlanCompatible`; Upsert/Aktivierung/Import/Export | Arbeitskopie normalisiert alle drei Goalfelder vor Scopeprüfung. Gespeicherte `blocks_json`, Revision, `capturedAt`, `scopeFingerprint` und Reihenfolge bleiben original. Explizites `goalIds: []`, inaktive Abschnitte und echte fachliche Staleness bleiben unterscheidbar. |
| `completion-history-and-statistics` | `LearnerGoalCompletionService.recordTransition`; LS `getHistory`/Tages-/Periodenabschlüsse; `CurriculaService.refreshMetrics` liest Mastery direkt | Originalereignis und Berlin-Datum unverändert, heutige Mengenvergleiche kanonisch. Keine neuen Abschlüsse durch Übersetzung/Import, keine doppelte Tages-/Gesamtzählung durch Aliaspaare. |
| `signed-import-before-projection` | `exportLearner`, `calculateSignature`, `importLearner`, portable Mastery/SRS/Fokus/Pläne | Echtes altes signiertes DTO wird unverändert authentisiert; manipuliertes Archiv scheitert vor Projektion. Jede Schreibmenge einschließlich Plan- und Aliasfehler wird vor erster Mutation geprüft. Derzeit findet ein Teil der Planprüfung erst nach vorherigen Mutationen innerhalb derselben Transaktion statt; das muss vor Verdrahtung ausdrücklich vorbereitet werden. |
| `conflicting-alias-state-rejection` | Gemeinsamer Projektor vor jeder Lese-/Schreib-/Importgruppe | Gleiche normalisierte Payload darf zusammenfallen; andere Werte, Zeiten oder Kartenerfolge unter old/new scheitern. Keine pauschale Zusammenführung nach Schlüsselreihenfolge. |
| `repository-snapshot-isolation` | Noch zu bauender tatsächlicher Repositoryadapter für A und spätere B-Fabrik; gleiche Generation für Graph, Identitäten und Stateprojektion | Physische vollständige Inputs statt selbst behaupteter Inventarliste; stale/fehlender A-/B-Pin und Generationwechsel während Erfassung scheitern. Kein gemischter Read, kein Fallback zu einer anderen Quelle. |
| `package-snapshot-isolation` | `JsonCurriculumPackageLoader`, `CurriculumRuntimeSnapshot`/Provider; derzeit nur aufbewahrtes `migrationAliasesJsonByPackageId` | Tatsächliche Manifest-/Lock-/Alias-/A-/B-Artefakte aus derselben gehaltenen Paketgeneration. Paketfehler darf keine Repositorydateien verwenden. Bestehende veröffentlichte Paketbytes werden nicht verändert. |
| `browser-plan-and-deep-links` | `App.tsx` Routen `/learner/:goalId?`, `/trainer/:goalId?`, `/explorer/:goalId?`; `LearnerView`; `localTeacherCoursePlan`, `teacherLearningPlanActivation`, `learnerCoursePlanPublication`, `learnerLearningPlanNavigation`; `useSrsMastery` und lokale SRS-Keys | Echter Browser mit altem Link, lokalem Teacherplan samt Baseline/Revision/Coverage sowie SRS-Lokalzustand. Kanonische Arbeitsansicht vor Lookup/Publikation, Original-Capture bleibt erhalten; keine automatische lokale Speicherumbenennung. Falscher Owner oder fremder Scope bleibt abgewiesen. Eine Java-Suite oder allein der Lernendenplan belegt diese gesamte Zeile nicht. |

## Reihenfolge nach dem reinen Kern

Vor einer Verdrahtung muss der echte Adapter außerdem bisher unbekannte
historische Originalzeilen getrennt bewahren und tatsächliche Persistkeys
erfassen: Eine authored Original-ID allein belegt nicht, dass ein vorhandener
qualifizierter oder UUID-casevarianter DB-Key getroffen wird. Die vier
reproduzierten Grenzfälle und die nötigen echten Read-/Write-/Export-/Importtests
stehen im unabhängigen State-Review. Weder pauschaler API-Passthrough noch
stilles Umbenennen oder Erzeugen einer zweiten Speicherzeile ist dadurch erlaubt.

1. Kern mit positiven/negativen Kontrollen und unabhängigem Zweitblick einfrieren.
2. Tatsächliche Repository-/Paketadapter und vollständige aktuelle A-Quelle
   prüfen; Root erzeugt separat die realen Kandidaten-QA-/Reportoutputs.
3. Backendaufrufe in einem gesonderten Scope verdrahten; sperrende
   Zustandskonflikte vor jedem Write prüfen. Bestehende Snapshot-/Session-/Scope-
   und SRS-Guards bleiben zusätzlich erforderlich.
4. Frontend/Teacherplan/Deep-Link-Vertrag konkret festlegen und im echten
   Browser prüfen. Der reine Java-Kern liefert hierfür keine neue API und keine
   lokale Aliasbehauptung.
5. Erst der reale B-Verifier prüft alle zehn Evidenztypen sowie **alle sieben**
   in A exakt als `current-generated-output` bezeichneten Outputs, deren
   Produzenten und Prüfquittungen. `minItems: 1` im formalen B-Schema ist keine
   inhaltliche Vollständigkeitsfreigabe. A-/B-eigene Outputdateien werden nicht
   zyklisch als Eingaben akzeptiert. Externe B-/A-/Schema-/Verifierpins und
   Source-/Kandidatengeneration müssen tatsächlich zusammenpassen.

Bis diese Schritte abgeschlossen und getrennt freigegeben sind, gibt es keine
Runtime-B-Capability und keine Aktivierung. Auch ein gültiger B-Datenumschlag
oder das Bestehen der reinen Stateprojektion kann diese Grenze nicht öffnen.
