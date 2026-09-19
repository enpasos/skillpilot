# Issue 48: Abnahme des einheitlichen Lernplanstatus

Verbindliche Grundlage: [Issue 48](https://github.com/enpasos/skillpilot/issues/48)
und das [Gesamtkonzept](../concept/didactic/unified-learning-plan-status.md),
im Issue gebunden an Commit `2bc9a43e5baff371e4948f3886dc0c1e79185fbb`.

**Status: Lokale Umsetzung und gezielte Abnahme bestanden; Claude-Rollout
vorbereitet, echte Host-Abnahme steht aus.** Diese Matrix ist kein Abnahmebeleg
für einen veröffentlichten Stand. Lokale Tests, API-Dialoge und echte
Host-Abnahme sind getrennte Nachweise. Es wurde durch diese Arbeit nichts
veröffentlicht oder bereitgestellt.

Der Product Owner hat am 19. September 2026 die Reihenfolge konkretisiert:
Er übernimmt das Produktionsdeployment; Codex veröffentlicht anschließend den
Claude-Kandidaten im bestehenden Marketplace, sobald der Deploy bestätigt ist.
Dieser Rollout betrifft Claude. Die spätere ChatGPT-Abnahme gehört nicht zu
diesem Veröffentlichungsschritt. Ein separater Testserver ist nicht erforderlich.

Die echte Claude-Abnahme folgt auf diesen Rollout in Produktion. Die aktuell
42 offenen Exact-Client-Prüfungen sind kein vorgeschaltetes Hindernis für die
ausdrücklich autorisierte Marketplace-Veröffentlichung; sie bleiben bis zum
tatsächlichen Nachweis `pending`. Die Veröffentlichung allein belegt keine
erfolgreiche Installation, Synchronisierung oder Coach-Sitzung.

## Anforderungen und Nachweise

`Lokal bestanden` bezeichnet ausschließlich die unten dokumentierten Tests
und Reviews. `Host offen` bedeutet, dass die tatsächlich erzeugte Coach-Ausgabe
noch nicht abgenommen ist. Fehlende externe Evidenz wird nicht durch lokale
Vertragsprüfungen ersetzt. Die Tests prüfen die im Konzept unterstützten Fälle; eine
95-Prozent-Lösung erlaubt keine falschen Ergebnisse innerhalb dieses Umfangs.

| ID | Anforderung | Erforderlicher Nachweis | Stand |
| --- | --- | --- | --- |
| P01 | DAY als Standard; DAY/WEEK pro SkillPilot-ID gespeichert | Präferenz-API, erneutes Laden und Isolation zweier Lernender | Lokal bestanden |
| P02 | Berlin-Tag bzw. Montag bis Sonntag; angebrochene Perioden und Zeitumstellung | Feste Clock-Fälle für beide Grenzen und DST | Lokal bestanden |
| P03 | Wochenziele schon am Wochenbeginn zugänglich; aktives zulässiges Ziel erhalten | Serviceintegration von Auswahl, Reconcile und automatischer Übergabe | Lokal bestanden |
| G01 | G schließt Vorwissen aus und behält spätere Abschlüsse | Planerstellung, späteres Lesen, Mastery-Import und ausdrückliche Planänderung | Lokal bestanden |
| G02 | Je Fach deduplizierte Ziele mit frühestem gültigem Termin | Mehrere Pläne desselben Fachs, überlappende Ziele, Wiederholungsblöcke | Lokal bestanden |
| G03 | Keine Verrechnung, Gesamtbilanz oder Gesamtampel über Fächer | Unterschiedliche Fachbilanzen plus serialisierte Verträge und UI | Lokal bestanden |
| G04 | Alle Referenzrechnungen und Grenzen; Fortschritt verschlechtert die Bilanz nicht | Rechenkern mit Referenzwerten und Invarianten | Lokal bestanden |
| G05 | H zählt belegte Abschlüsse einmal; Import/Replay kein neuer Abschluss | Ledgerintegration; Rücknahme; fehlender Zeitstempel; fehlgeschlagener Read | Lokal bestanden |
| G06 | Aktive Pläne bleiben nach Planende in der Bilanz | Servicefall mit überzogenem Planende und offenen Zielen | Lokal bestanden |
| G07 | Unklare/fehlerhafte Teilpläne entwerten die Fachbilanz, andere Fächer bleiben sichtbar | Teilfehler, unbekanntes Fach, kein Plan und Datenladefehler | Lokal bestanden |
| S01 | Ein gemeinsamer, konsistenter Datenstand | Bestehender Lernenden-Lock; konkurrierende Mastery-/Plan-/Präferenzänderungen | Lokal bestanden |
| S02 | Statuslesen ändert weder Fokus noch Mastery, Plan oder Version | Vorher/Nachher-Vergleich der persistierten Daten | Lokal bestanden |
| T01 | Feste DE/EN-Texte, stabile Fachreihenfolge und Backendhinweise | Formatterfälle und gleiche Service-/Provider-/UI-Ausgabe | Lokal bestanden |
| T02 | Aktives Lernziel separat und genau einmal beim Unterrichtseinstieg | Tatsächliche Toolantworten und überprüfbare Coach-Dialoge | Lokal bestanden; Hostverhalten offen (H01/H02) |
| T03 | Keine alten Zählfelder/Rechenregeln in Chat einschließlich Folgeantworten | Schema, strukturierte und textuelle MCP-Ausgaben sowie aktive Instruktionen | Lokal bestanden |
| U01 | Cockpit zeigt Backendtexte und meldet Ausfälle sichtbar | Browserprüfung mit DE/EN, Teilfehler und Status-/Collection-GET-Ausfall | Lokal bestanden |
| U02 | Fach-/Planverknüpfung nutzt stabile IDs | Namenskollision und Sprachwechsel ohne falsche Aktionen | Lokal bestanden |
| U03 | Lernendenbezogene Vorschau verwendet denselben Rechenkern und Zeitraum | Identischer Plan/Mastery/Zeitraum in Vorschau und aktivem Status; keine lokalen Bilanzen | Lokal bestanden |
| U04 | Alte Berechnungen, Pace und konkurrierende normale Anzeigen entfernt | Quellcode-/Vertragssuche und Prüfung aller Verbraucher | Lokal bestanden |
| L01 | Anzeige und automatische Fortsetzung verwenden dasselbe Fachpensum | Erfülltes Pensum durch Vorarbeit, Rückstand und mehrere Fachpläne | Lokal bestanden |
| L02 | Früher geplante zugängliche Ziele zuerst; Voraussetzungen und Personal Curriculum bleiben gültig | Überlappende Blöcke und Fach-/Fokusgrenzen | Lokal bestanden |
| L03 | Pause/Stopp, Prüfungsmodus und Fachwechsel bleiben autorisiert | Bestehende Guard-Regressionen plus Statusfrage ohne Mutation | Lokal bestanden; Hostverhalten offen (H01/H02) |
| V01 | Unabhängige Prüfung und relevante Regressionen bestanden | Reviewbefunde geschlossen; geprüfte lokale Logs mit Befehlen | Lokal bestanden |
| H01 | Claude übernimmt Status tatsächlich wortgetreu im vollständigen Lernfluss | Reale Host-Dialoge des konkreten Kandidaten mit Toolausgaben | Nach bestätigtem Produktionsdeploy und Marketplace-Veröffentlichung prüfen |
| H02 | Fokussierte ChatGPT-Integration nach stabiler Claude-Basis | Eigene Host-Evidenz; Claude-Pass ersetzt diesen Nachweis nicht | Spätere Abnahme nach stabiler Claude-Beta; nicht Teil des aktuellen Rollouts |

## Bewusste Grenzen

- Es wird keine neue historische Rekonstruktion oder allgemeine
  Statusversionierung eingeführt. Eine Entwurfsvorschau hält den beobachteten
  Lernstand fest und erfindet keine künftigen Abschlüsse.
- Die vorhandene Provider-Sitzung liefert ihre gespeicherte Lernsprache
  ausdrücklich an den Statusdienst. Diese Sprache wird beim Start in der
  First-Party-Oberfläche gewählt; ein Modellargument ersetzt sie nicht.
  Das Cockpit übergibt die gewählte
  Oberflächensprache. Ohne Sprachangabe und ohne hinterlegte Lernsprache gilt
  Deutsch. Dafür entsteht keine zusätzliche Spracheinstellung.
- Unterrichtsabdeckung, konkrete Prüfungsvoraussetzungen und Plandetails
  bleiben eigene Informationen. Sie werden nicht aus der Mengenbilanz abgeleitet.
- Das frühere abgelehnte OpenAI-1.0.0-Paket, veröffentlichte Claude-Artefakte und
  bereits beworbene inhaltsadressierte Ressourcen bleiben historische Belege.

## Zuordnung zu den Tests

Die folgenden Klassen liegen unter `backend/src/test/java/com/skillpilot/backend/`.
Die Methodennamen sind unmittelbar suchbare Nachweise; ein vorhandener Testname
allein ist noch kein bestandener Lauf.

| Kürzel | Testdatei |
| --- | --- |
| PlanIT | `service/LearnerLearningPlanServiceIntegrationTest.java` |
| LearnerIT | `service/LearnerServiceTest.java` |
| LedgerIT | `service/LearnerGoalCompletionIntegrationTest.java` |
| DailyTest | `service/LearningPlanDailyProgressTest.java` |
| Calculator | `service/learningplan/UnifiedLearningPlanStatusCalculatorTest.java` |
| Formatter | `service/learningplan/UnifiedLearningPlanStatusFormatterTest.java` |
| Claude | `connectors/claude/v1/mcp/ClaudeV1LearningPlanContractTest.java` |
| OpenAI | `openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java` |

| Anforderungen | Entscheidende Fälle |
| --- | --- |
| P01 | LearnerIT: `periodPreferencePersistsPerLearnerWithoutChangingPlansOrMastery`; Browser: Einstellung speichern und frische Seite laden |
| P02 | PlanIT: `todayStatusAlwaysUsesTheEuropeBerlinCalendarDate`, `weekBoundariesFollowLocalCalendarDatesAcrossBothDaylightSavingTransitions`; LedgerIT: `BerlinMidnightSeparatesDaysEvenBeforeUtcMidnight` |
| P03 | PlanIT: `mondayWeeklyReconcileCanStartFridaysGoalAndBasisChangesKeepThatActiveGoal`; LearnerIT: `automaticHandoffUsesTheConfiguredPeriodForGoalsScheduledLaterThisWeek` |
| G01 | PlanIT: `goalsMasteredBeforePlanCreationStayOutOfTheWholeBalance`, `explicitPlanEditRetainsPostCreationMasteryInTheCapturedGoalSet`; LearnerIT: `signedExportAndImportCarryOnlyTheLearnerOwnedPortablePlans` |
| G02 | PlanIT: `overlappingGoalsAcrossSubjectPlansCountOnceAtTheirEarliestScheduledDate`, `createMaterializesOnlyOpenAtomsAndDeduplicatesInChronologicalBlockOrder`; DailyTest: `overlappingBlocksCountEachGoalOnlyOnce` |
| G03–G04 | OpenAI: `zeroPeriodTargetIsStatedHonestlyAndAdvanceWorkNeverCoversAnotherSubject`; Calculator: `matchesSection55ReferenceCases`, `anAdditionalValidCompletionNeverWorsensTheBalanceAndInvariantsHold`, `testInputValidation` |
| G05 | LedgerIT: `partialWorkCompletionReplayAndResetKeepOneImmutableEvent`, `importingMasteryOrCopyingLearnerNeverImportsCompletionCredit`, `transactionRollbackRemovesMasteryAndCompletionTogether`; PlanIT: `withdrawnMasteryStopsCountingAsCompletedWorkInTheSamePeriod`, `unreadableCompletionEventsNeverBecomeAZeroCompletionBalance`; DailyTest: `missingOrOutOfPeriodTimestampsDoNotTurnKnownMasteryIntoPeriodCompletions` |
| G06–G07 | LearnerIT: `planPackageActivationWithoutTodaysQuotaLeavesBacklogForExplicitContinuation`; PlanIT: `unidentifiablePlanCannotMakeTheRemainingCollectionAppearFullyEvaluable`, `todayStatusNamesStaleAndMalformedPlansAsUnevaluableInsteadOfFakingABalance`, `noStoredPlanHasAnHonestNoticeAndIndependentVoluntaryContinuation` |
| S01–S02 | LearnerIT: `statusWaitsForConcurrentPeriodAndMasteryUpdateThenReadsOneCommittedState`; PlanIT: `compatibleLegacyPlanSurvivesScopeAdditionsWithoutReadOrPreviewRewritingStoredState`, `draftPreviewUsesTheSharedStatusWithoutChangingExistingPlansOrLearnerState`; Claude: `coachContextReadsDailyPlanStatusWithoutReconcilingOrAdvancingState` |
| T01 | Formatter: DE/EN, DAY/WEEK, Singular/Plural und Auswertungshinweise; PlanIT: `todayStatusAddsValidSubjectPlansAndLocalizesTheirLabels`, `weeklyDraftUsesTheSamePeriodAndTextsAsLiveStatusAcrossTheWeekBoundary` |
| T02–T03 | PlanIT: `statusTextNeverAnnouncesTheActiveGoalWhoseLocalizedAnnouncementStaysSeparate`; Claude: `serializedContextPreservesBackendStatusAndSeparateAnnouncement`; OpenAI: `actualContextPayloadPreservesBackendStatusAndSeparateAnnouncement`; `LearningPlanWireAssertions` prüft echte strukturierte und textuelle MCP-Antworten einschließlich Folgeantworten auf verbotene Felder |
| U01–U02 | `app/scripts/testLearnerViewMobilePlanChromeUi.ts`: Fehler, fehlender Status, sichtbarer alter Stand, defekte Plandetails, Reload; `testLearnerPlanTodayCardUi.tsx`: DE/EN/WEEK, Teilfehler, umbenanntes Fach, zusammengeführte Pläne; API-Zuordnung nach stabilen IDs |
| U03–U04 | PlanIT: `weeklyDraftUsesTheSamePeriodAndTextsAsLiveStatusAcrossTheWeekBoundary`, `futurePreviewUsesDailyQuotaWithoutInventingFutureCompletions`; UI: identischer Backendtext und genau eine Anzeige je Vorschauperiode; `LearnerLearningPlanControllerHttpTest`: kein `metrics`, `pace` oder Gesamt-Richtungsfeld |
| L01 | PlanIT: `mergedSubjectAdvanceWorkPreventsAutomaticExtraWorkFromAnIncompletePartPlan`, `completedQuotaStopsAutomaticReconcileButExplicitResumeAllowsExtraWork`; LearnerIT: `earlierWorkOnFutureGoalsCoversQuotaAndStopsAutomaticExtraWork`, `fulfilledMathQuotaHandsOffToIncompletePhysicsEvenWithEligibleMathBacklog` |
| L02 | PlanIT: `explicitContinuationPrioritizesOlderOpenGoalsAcrossSubjectsEvenWhenTheirQuotaIsCovered`, `continueRequiresOptInCurrentCompatibilityRevisionAndFrontierEligibility`; LearnerIT: fachliche Fokusgrenzen und voraussetzungstreue Blockreihenfolge |
| L03 | OpenAI: `activeExamCannotBeInterruptedByResumeOrSubjectSwitch`, `realCoordinatorMakesSubjectSwitchIdempotentAndRejectsStaleConflictingOrUnauthorisedWrites`, `currentInstructionsPrioritizeStatusPauseAndSubjectIntentBeforeRendering`; `CoachToolFacadeLearningPlanTest`: Schreibautorisierung vor Fachauflösung |

Der Paralleltest für S01 enthält eine echte konkurrierende Präferenz-/Mastery-
Transaktion. Planänderungen verwenden denselben Lernenden-Lock; ihre
Revisionskonflikte und atomare Aktivierung werden zusätzlich geprüft. Er ist
kein Lasttest aller möglichen gleichzeitigen Schreiboperationen.

## Lokale Prüfungen und Kandidaten

Prüfdatum: **19. September 2026**. Lokale Logs und Screenshots liegen unter
`tmp/issue48/`; sie sind Arbeitsartefakte und werden nicht als öffentliche oder
dauerhafte Host-Evidenz ausgegeben.

- Backend: **414 Tests bestanden, 0 Fehler, 0 übersprungen** im abschließenden
  gemeinsamen Lauf (`backend-acceptance.log`, Exit 0, 5 min 27 s).
  Die XML-Ergebnisse und Summen sind in `backend-acceptance-results/` gesichert.
  Dieser Lauf umfasst die unten benannten relevanten Suites, nicht die gesamte
  Backend-Releaseprüfung.
- Frontend: `npm run test:learner-learning-plans`, die Startup-, Trainer-
  Aktivierungs- und Trainer-Planungs-Browserprüfungen, Aktivierungs-Unitprüfung,
  Typecheck und gezielte Lintprüfung sind bestanden. Nach dem letzten mobilen
  Zeilenumbruch wurden der betroffene Browsertest, Typecheck und `vite build`
  erneut erfolgreich ausgeführt. Die Browserfälle verwenden kontrollierte
  API-Antworten; sie sind keine Prüfung eines bereitgestellten Backends.
- Die mobile Wochenansicht und die Planungsvorschau wurden visuell geprüft.
  `cockpit-week-mobile.png` zeigt die vollständige aktive Lernzielankündigung
  ohne Abschneiden; `planning-preview.png` die unveränderten Backend-Fachzeilen.
- Für die spätere Hostprüfung wurde zusätzlich die operative gemeinsame
  MCP-Variante gebaut: `VITE_SKILLPILOT_COACH_VARIANT=openai-mcp
  ./node_modules/.bin/vite build`. Varianten- und Shell-Prüfer sind bestanden.
  Der frühere Standardbuild mit `visible-session` wird dafür nicht verwendet.
  Aktuelle Frontend-Buildkennung:
  `7958d35708e4-2026-09-19T19:10:45.101Z`, `dirty: true`.
  Die Backendressourcen wurden anschließend mit `./gradlew classes`
  synchronisiert. Es wurde kein Server gestartet oder bereitgestellt.
- Claude: 172 lokale Paket-/Release-/Marketplace-Tests bestanden. Connector
  und Plugin melden `STRUCTURAL_PASS`; ihre externen Release-Gates bleiben
  `pending`. Lokale Kandidaten- und Marketplace-Vorbereitung/-Verifikation
  sind bestanden.
- Unveröffentlichter Claude-Kandidat **1.1.7**: 34.586 Bytes, SHA-256
  `a7bb73da48087f44aeb1155b848768efc79efa71c55c9a2278c8e0cc4901d26b`.
  Paket: `tmp/claude-direct-install-beta/skillpilot-coach-v1/1.1.7/sha256-a7bb73da48087f44aeb1155b848768efc79efa71c55c9a2278c8e0cc4901d26b/skillpilot-coach-v1-1.1.7.plugin`.
  Die vorhandene Veröffentlichung wurde lesend als **1.1.6** verifiziert;
  deren Akzeptanz belegt nicht den neuen Kandidaten.
- OpenAI: `prepare` und `verify` des internen **1.1.0-SNAPSHOT** bestanden;
  aktuelle Quellen entsprechen dem lokalen Entwurf. Der Checker der
  Reviewhistorie bestätigt unveränderte historische 1.0.0-Evidenz und die
  aufgehobene Entwicklungssperre. Keine Einreichung oder Veröffentlichung.

Ein vorheriger Lauf enthielt zwei EN-Testfehler durch die auf Deutsch
persistierte Standard-Testsession; die korrigierten Fälle prüfen jetzt die
gewählte Sitzungssprache. Außerdem überschritt ein unveränderter paralleler
Scope-Test einmal H2s 2-Sekunden-Lockwartezeit. Er bestand im abschließenden
Gesamtlauf unverändert in 0,718 s. Der Befund wurde als einseitiges Warten auf
die Lernendenzeile geprüft; ein zyklischer Deadlock wurde nicht nachgewiesen.
Es wurde keine Timeoutgrenze erhöht und keine Assertion abgeschwächt.

`tmp/issue48/local-candidate-manifest.json` hält den Git-Basiscommit, die
Hashwerte sämtlicher lokaler Quelländerungen, die gebauten Java-Klassen,
Frontenddateien und die geprüften Providerpakete fest. Der Git-Basiscommit
allein bezeichnet diesen noch nicht eingecheckten Kandidaten nicht eindeutig.
Ein alter JAR-Build unter `backend/build/libs/` stammt vom 27. August und ist
ausdrücklich kein Artefakt dieser Abnahme. Vor einer tatsächlichen
Bereitstellung sind ein eindeutig festgelegter Quellstand und die bestehenden
Deployment-Prüfungen erforderlich. Der Product Owner übernimmt diesen Schritt.

Vor dem Marketplace-PR muss dessen CI auf den tatsächlichen neuen
SkillPilot-Quellcommit gebunden werden. Der bisherige Pin `5fd275a3062f1ded3782c33f137d40c32562071c`
bezeichnet noch ein anderes 1.1.7-Archiv. Deshalb werden nach dem Quellcommit
der Pin in Vorlage, Exporter und zugehörigem Test aktualisiert und der Export
erneut erzeugt. Erst nach Deploy-Bestätigung, bestandener Marketplace-CI und
Prüfung des konkreten PR-Stands wird veröffentlicht.

Unabhängige Reviews haben insbesondere die Priorität des tatsächlichen
Solltermins, die Zusammenführung innerhalb eines Fachs, die Vorrangregeln für
Status/Pause vor Rendering und sichtbare Fehlerzustände geprüft. Gefundene
Reihenfolgefehler und fehlende Nachweise für Planedit, doppelte Ziel-IDs und
Montagsfortsetzung wurden korrigiert bzw. mit gezielten Fällen ergänzt.

### Wiederholbare lokale Befehle

Der abschließende Backendbefehl wurde aus `backend/` ausgeführt:

```bash
./gradlew test --console=plain \
  --tests '*UnifiedLearningPlanStatus*' \
  --tests '*LearningPlanDailyProgressTest' \
  --tests '*LearnerLearningPlanServiceTest' \
  --tests '*LearnerLearningPlanServiceIntegrationTest' \
  --tests '*LearnerLearningPlanControllerHttpTest' \
  --tests '*LearnerGoalCompletionIntegrationTest' \
  --tests '*LearnerLearningPlanMigrationTest' \
  --tests '*LearnerGoalCompletionMigrationTest' \
  --tests '*LearnerServiceTest' \
  --tests '*CoachToolFacadeLearningPlanTest' \
  --tests '*ClaudeV1LearningPlanContractTest' \
  --tests '*ClaudeV1VerifiedRecallLearningPlanContractTest' \
  --tests '*ClaudeV1CoachContextProjectorTest' \
  --tests '*OpenAiDeV11DailyPlanContractTest' \
  --tests '*OpenAiDeCoachMcpContractTest'
```

Die Paketprüfungen wurden aus dem Repository-Root ausgeführt:

```bash
node --test \
  ai/claude/plugin/skillpilot-coach-v1/build-package.test.mjs \
  ai/claude/plugin/skillpilot-coach-v1/check-package.test.mjs \
  scripts/check_claude_connector_v1_release.test.mjs \
  scripts/check_claude_plugin_v1_release.test.mjs \
  scripts/claude_marketplace_release.test.mjs
node scripts/check_claude_connector_v1_release.mjs
node scripts/check_claude_plugin_v1_release.mjs
node scripts/claude_direct_install_beta_release.mjs verify-candidate
node scripts/claude_marketplace_release.mjs verify tmp/issue48/skillpilot-claude-marketplace
node scripts/openai_plugin_release.mjs verify
node scripts/check_skillpilot_coach_plugin.mjs
node scripts/check_openai_plugin_review_freeze.mjs
```

`verify-candidate`, Marketplace-`verify` und OpenAI-`verify` beziehen sich auf
die zuvor lokal erzeugten Kandidaten (`prepare-candidate` bzw. `prepare`).
`STRUCTURAL_PASS` ersetzt die weiterhin offenen Veröffentlichungs-Gates nicht.

## Ablauf der echten Host-Abnahme

Die [Claude-beta-/ChatGPT-Strategie](../deploy/claude-beta-chatgpt-release-strategy.md)
bleibt maßgeblich. An einem stabilen, identifizierten Kandidaten zunächst in
Claude und danach fokussiert im ChatGPT-Adapter prüfen:

Voraussetzungen sind ein ausdrücklich freigegebener Testzugang und ein Backend,
das den geprüften Stand verwendet. Eine bisher veröffentlichte Pluginversion
mit älterem Backend genügt dafür nicht. Für die Fälle werden Testlernende mit
Mathematik- und Physikplan sowie bekannten Sollterminen verwendet; regulärer
Lernfortschritt wird nicht zu Testzwecken verändert. DE und EN werden über die
explizite First-Party-Sprachwahl in getrennten Sitzungen gestartet.

1. Sitzung verbinden bzw. fortsetzen; die geladenen Instruktionen und die
   tatsächlich verwendeten Toolantworten festhalten.
2. Mit zwei Fachplänen einen reinen Status abfragen: exakte Backend-Fachzeilen,
   keine neue Aufgabe, keine Fokus-/Masteryänderung, keine Gesamtampel.
3. Tagesziel mit verbleibendem Rückstand erfüllen: Abschlussfeedback,
   aktualisierter Status einmal, keine ungefragte zusätzliche Arbeit.
4. Im Wochenmodus zu Wochenbeginn ein später geplantes zugängliches Ziel
   lernen und fortsetzen; nach Reload bleibt die Einstellung gespeichert.
5. Freiwillig weiterlernen, Pause anfordern, Fach wechseln und eine Sitzung
   wiederaufnehmen. Nur erlaubte Zustandsänderungen dürfen stattfinden.
6. Dieselben Statusfälle auf Deutsch und Englisch prüfen, einschließlich
   separater neutraler Lernzielankündigung und nicht auswertbarem Fachplan.

| Prüfanstoß | Sichtbare Abnahmebedingung |
| --- | --- |
| „Wie ist mein Lernplanstatus? Bitte nur den Status.“ / “What is my learning plan status? Only the status, please.” | Alle Fachzeilen und Hinweise genau wie im letzten Toolergebnis; keine Aufgabe, Zielankündigung, Visualisierung oder Schreiboperation |
| „Weiterlernen.“ / “Continue learning.” bei offenem Pensum | Autorisierter nächster Zustand; Status höchstens einmal; die getrennte Backend-Zielankündigung einmal vor dem Unterricht |
| Eine tatsächliche Aufgabe abschließen | Zuerst Abschlussfeedback, danach der endgültige Status; nur bei noch offenem Pensum zulässige automatische Fortsetzung |
| „Ich möchte trotzdem weiterlernen.“ / “I would like to keep learning.” nach erfülltem Pensum | Freiwillige Fortsetzung bleibt möglich; früher geplante zugängliche Ziele werden berücksichtigt |
| „Für heute Pause.“ / “Let's stop for today.” | Kein weiterer Unterricht, keine automatische Zielauswahl; vorhandene Pause-/Stopp-Regeln bleiben wirksam |
| „Ich möchte jetzt Physik lernen.“ / “I'd like to study Physics now.” | Nur der erlaubte Fachwechsel; kein Rendern des alten Mathematikziels vor dem Wechsel; anschließende Sitzung lässt sich fortsetzen |

Im Wochenfall wird der Testzeitpunkt auf einen Montag gelegt und mindestens ein
zugängliches Ziel ist erst für Freitag geplant. Nach dessen Beginn wird im
Cockpit die Periodenbasis gewechselt: Plantermine und Lernfortschritt bleiben
gleich, das weiterhin zulässige aktive Ziel bleibt erhalten. Vor einem nächsten
Statusvergleich wird ein neuer Toolzustand gelesen.

Der Nachweis muss Kandidat/Build, Host und Oberfläche, Sprache, Zeitbezug,
Testfall, tatsächlich angezeigten Text und öffentliche Toolantworten verbinden.
Private SkillPilot-IDs, Sitzungstoken oder Geheimnisse gehören nicht in das
Protokoll. Ein Testprogramm, eine synthetische Browserroute oder ein API-Modelllauf
beweist nicht die Wiedergabe im echten Host. Fehlende Host-Evidenz bleibt offen.
