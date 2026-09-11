# ChatGPT-Abnahme: SkillPilot Coach v1 1.1.0

Automatisch aus den aktuellen Einreichungsquellen erzeugt. Nicht hier bearbeiten; Änderungen an den Quellen prüfen und erneut `prepare` ausführen.

**Status: NICHT AUSGEFÜHRT.** Diese Anleitung und die leere Trace-Vorlage sind keine bestandenen Tests, keine Rollout-Bestätigung und keine Einreichung.

Kandidat: `1.1.0` · MCP-Endpunkt: `https://mcp-coach-v1.skillpilot.com/mcp`

Testsuite-SHA-256: `c2ed60388586a915882302c4e1eb562c482e5201421b30c85c3910e09a1a90b9`

Vertrags-SHA-256: `985b820b4089c185c044e287c28c948e8fdfb95f8047094f8d687a4456848bb6`

Paket-Snapshot-SHA-256: `963eacd74b5686de00c1898213361e9ad051b5509ee828b4e27e708d4c3141fc`

## Vorbereitung

1. Lokale Tests/CI und `node scripts/openai_plugin_release.mjs verify` prüfen. Nur der reproduzierbare Snapshot bindet auch Skill- und UI-Bytes; nach Änderungen neu vorbereiten und betroffene Abnahmen wiederholen. Nach separater Rollout-Freigabe den tatsächlich laufenden Kandidaten und seine Sicherheitseinstellungen prüfen; ein lokaler Draft ersetzt keinen Rollout.
2. Die Entwicklungsverbindung in ChatGPT aktualisieren und die aktuellen Skill-Anweisungen installieren/importieren. Genau das vollständige Paket prüfen, nicht nur einzelne MCP-Werkzeuge.
3. Für jeden Fall die unten genannten Ausgangsdaten über den normalen First-Party-Ablauf einrichten. Keine Produktionsdatenbank ändern und keine abweichenden Voraussetzungen als bestanden werten.
4. Zuerst P1, P2, D1, D3, D5 und D6 als kurzen Einstieg prüfen; anschließend alle Fälle vollständig durchführen. Jeder Fall behält seinen eigenen Ausgangszustand und seine vollständige Turn-Reihenfolge.
5. Nur bereinigte Aufzeichnungen behalten. Keine OAuth-Werte, permanenten Lernenden-IDs, echten Sessionwerte, versteckten Lösungen oder signierten URLs in öffentliche Dateien, Git oder CI-Artefakte kopieren.

## Ergebnisse dokumentieren

Die generierte `trace-template.json` in ein separates lokales Verzeichnis unter `tmp/` kopieren und nur tatsächlich beobachtete Ereignisse eintragen. Die Vorlage enthält absichtlich keine Ereignisse, keine Prüferbestätigung und keinen Beleg. Sie darf unverändert nicht bestehen.

Die Ereignisse je Fall chronologisch aufnehmen; für jeden vorgesehenen Benutzer-/UI-Turn die unten genannte `turnId` verwenden. Ein `prepared-start` erscheint bereinigt als `user`-Ereignis, niemals mit dem echten Sessionwert. Tool-Ereignisse brauchen `name` und `outcome`; bei Fehlern auch `errorCode`. Keine erwarteten Tool-Aufrufe als beobachtete Ereignisse vorfüllen.

Nach tatsächlicher Sichtung je manueller Assertion Prüfer, referenzierte Ereignis-IDs und SHA-256 der bereinigten Evidenz eintragen. `hostEvidence` benennt die echte Aufzeichnung, Zeitpunkt, Prüfer und SHA-256. Die fertige Spur mit `node scripts/openai_plugin_submission.mjs validate-trace --trace tmp/<lauf>/trace.json` prüfen. Vollständiges Format: `submission/README.md`.

Ein API-/Fixture-Test ist keine ChatGPT-Abnahme. Für native iOS-/Android-Tests getrennte Aufzeichnungen mit der passenden `layer` erstellen; eine schmale Browseransicht ist kein nativer App-Test. Ein fehlender Zugang, nicht herstellbarer Ausgangszustand oder ungeklärtes Ergebnis bleibt offen.

## P1: Sessionless start and first-party handoff

**Nicht ausgeführt** · Portaltest · Ausgangszustand: `none`

### Ausgangsdaten

New English chat; plugin selected; no prepared message or learningSessionId.

1. Select SkillPilot Coach v1 in a new English ChatGPT web chat. Do not create or provide a SkillPilot learning session.

Erwarteter Startzustand: No session; no learner state.

### Schritte in dieser Reihenfolge

#### 1. user · turnId: `start`

> How do I start a learning session with SkillPilot?

### Erwartetes Ergebnis

One sentence: Open https://skillpilot.com/, finish the learning setup there, choose “Start learning”, and use the prepared start message in a new chat. Stop; no teaching, tool call, or learner-state access.

Erforderliche Werkzeuge: keine.

Verbotene Werkzeuge: alle.

### Prüfkriterien

- [ ] `handoff` — Exakter sichtbarer Antworttext:

> Open https://skillpilot.com/, finish the learning setup there, choose “Start learning”, and use the prepared start message in a new chat.

- [ ] `no-tools` — Kein Werkzeugaufruf.

- [ ] `no-state-change` — Inhaltlich/visuell prüfen: No learner access or mutation; fresh first-party handoff contains no permanent learner ID.

### Zugeordnete automatisierte Tests

- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiSubmissionReviewReplayTest.java` → `p1SessionlessStart` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiDeCoachEndToEndIntegrationTest.java` → `everyLaunchCreatesAFreshIndependentTwentyFourHourLearningSession` (backend-contract)

## P2: Context-bound orientation and visual learning

**Nicht ausgeführt** · Portaltest · Ausgangszustand: `mathOrientation`

### Ausgangsdaten

Fresh DE/Hessen G9 Sek II Math LK learner; activate Warum Mathematik? – Denken, Muster & Zukunft.

1. Open https://skillpilot.com/ and use CREATE for a new disposable learner; do not reuse a learner from another case or run.
2. Choose Deutsch, Deutschland, Gymnasium, Hessen, G9, Sekundarstufe II, Mathematik, Leistungskurs and confirm Level 2.
3. Keep the permanent SkillPilot ID in the first-party UI; never paste it into the review portal or chat.
4. In Cockpit activate Warum Mathematik? – Denken, Muster & Zukunft. Choose Start learning to prepare a new ChatGPT web chat; leave the fresh prepared message unsent until the ordered prepared-start turn.

Erwarteter Startzustand: Warum Mathematik? – Denken, Muster & Zukunft; mastery not completed.

### Schritte in dieser Reihenfolge

#### 1. prepared-start · turnId: `start`

> Send the fresh SkillPilot-prepared start message unchanged.

#### 2. user · turnId: `interest`

> Wachstum fände ich spannend.

#### 3. user · turnId: `example`

> Bakterienwachstum.

#### 4. user · turnId: `continue`

> Ich möchte jetzt mit Bakterienwachstum konkret weiterlernen. Ich würde einen Graphen wählen, weil man daran die Entwicklung über die Zeit und Veränderungen besonders schnell erkennt. Was kann ich am Graphen erkennen, das eine Tabelle weniger direkt zeigt?

### Erwartetes Ergebnis

German teaching follows fresh context. Interest alone does not complete orientation. After the personal reply, confirm completion and use the server-selected successor. Render once only when authorized; retain full teaching text. Do not change Level 2.

Erforderliche Werkzeuge: `get_skillpilot_context`, `set_skillpilot_mastery`.

Verbotene Werkzeuge: keine zusätzlichen Verbote.

Vorgegebene Werkzeugreihenfolge: `get_skillpilot_context` → `set_skillpilot_mastery`.

### Prüfkriterien

- [ ] `fresh-context` — Inhaltlich/visuell prüfen: Fresh context before learner-facing replies; use pinned locale and authoritative state.

- [ ] `orientation-evidence` — Inhaltlich/visuell prüfen: Interest choice starts tailored motivation, not a test or completion. Complete only after the personal response/explicit readiness.

- [ ] `successor` — Inhaltlich/visuell prüfen: Use the authoritative successor and one authorized image with exact goalId and stateVersion; no blank component if not authorized.

- [ ] `full-text` — Inhaltlich/visuell prüfen: A rendered image never replaces complete German teaching text. Level 2 stays unchanged.

### Zugeordnete automatisierte Tests

- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiSubmissionReviewReplayTest.java` → `p2OrientationThenLearning` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiDeCoachMcpContractTest.java` → `orientationCompletionActivatesTheFirstAvailableGoalFromTheSelectedAuthoritativePath` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiDeCoachMcpContractTest.java` → `dedicatedReadOnlyToolRendersOnlyTheCurrentTrustedVisualization` (backend-contract)
- `ai/openai app/test/goal-visualization-lifecycle.test.mjs` → `an MCP Apps tool result renders without ChatGPT compatibility globals` (component)

## P3: Separate normal flashcards from Verified Recall

**Nicht ausgeführt** · Portaltest · Ausgangszustand: `mathMemory`

### Ausgangsdaten

Fresh P2 setup; complete orientation, then explicitly switch to Lernkarten - Funktionen und Gleichungen; no existing card state.

1. Open https://skillpilot.com/ and use CREATE for a new disposable learner; do not reuse a learner from another case or run.
2. Choose Deutsch, Deutschland, Gymnasium, Hessen, G9, Sekundarstufe II, Mathematik, Leistungskurs and confirm Level 2.
3. Keep the permanent SkillPilot ID in the first-party UI; never paste it into the review portal or chat.
4. In Cockpit activate Warum Mathematik? – Denken, Muster & Zukunft. Choose Start learning to prepare a new ChatGPT web chat; leave the fresh prepared message unsent until the ordered prepared-start turn.
5. Do not complete orientation or switch goals during setup; those actions occur once in the ordered turns. Leave card state untouched. When the later explicit switch reaches the memory goal, verify the current deck before grading.

Erwarteter Startzustand: Orientation active and incomplete; untouched memory-card state. After the later ordered goal switch, eight cards must be due in this fixture; if the live deck differs, stop and revalidate rather than force an obsolete count.

### Schritte in dieser Reihenfolge

#### 1. prepared-start · turnId: `start`

> Send the fresh SkillPilot-prepared start message unchanged.

#### 2. user · turnId: `interest`

> Wachstum fände ich spannend.

#### 3. user · turnId: `example`

> Bakterienwachstum.

#### 4. user · turnId: `continue`

> Ich möchte jetzt mit Bakterienwachstum konkret weiterlernen. Ich würde einen Graphen wählen, weil man daran die Entwicklung über die Zeit und Veränderungen besonders schnell erkennt. Was kann ich am Graphen erkennen, das eine Tabelle weniger direkt zeigt?

#### 5. user · turnId: `switch`

> Ich möchte jetzt zum Lernziel „Lernkarten - Funktionen und Gleichungen“ wechseln und dort die fälligen Karteikarten normal üben.

#### 6. user · turnId: `practice`

> Karteikarten lernen.

#### 7. ui · turnId: `rate`

> Rate all eight fixture cards Gewusst in the memory-practice UI.

#### 8. user · turnId: `recall`

> Jetzt möchte ich die strenge Kartenprüfung ohne Hilfen machen.

#### 9. user · turnId: `answers`

> 1. m=(y₂-y₁)/(x₂-x₁). 2. f(x)=a(x-d)²+e mit S(d|e). 3. Ein Produkt ist genau dann null, wenn mindestens ein Faktor null ist. 4. x=log_a(b), bei Basis e: x=ln(b). 5. a_(n+1)=a_n+d. 6. a_n=a_1·q^(n-1). 7. x^a·x^b=x^(a+b). 8. x_(1,2)=-p/2 ± sqrt((p/2)²-q).

### Erwartetes Ergebnis

Normal practice shows 8 cards in the component; ratings change scheduling, not mastery. Recall asks all 8 questions without hints. After all answers, load answers once and save one complete ordered result batch; follow the authoritative continuation.

Erforderliche Werkzeuge: `get_skillpilot_context`, `get_skillpilot_navigation`, `set_skillpilot_active_goal`, `start_skillpilot_memory_practice`, `review_skillpilot_memory_practice_card`, `start_skillpilot_verified_recall`, `get_skillpilot_verified_recall_answers`, `record_skillpilot_verified_recall_results`.

Verbotene Werkzeuge: keine zusätzlichen Verbote.

Vorgegebene Werkzeugreihenfolge: `start_skillpilot_memory_practice` → `review_skillpilot_memory_practice_card` → `start_skillpilot_verified_recall` → `get_skillpilot_verified_recall_answers` → `record_skillpilot_verified_recall_results`.

### Prüfkriterien

- [ ] `private-cards` — Inhaltlich/visuell prüfen: Private fronts/backs stay in component metadata, not model-visible normal-practice text.

- [ ] `explicit-ratings` — Inhaltlich/visuell prüfen: Only explicit Gewusst ratings change schedule; ordinary practice does not establish mastery.

- [ ] `complete-recall` — Inhaltlich/visuell prüfen: All eight questions, answers and results are ordered; no protected answers or hints before the complete user submission.

- [ ] `one-answer-load` — `get_skillpilot_verified_recall_answers`: mindestens 1, höchstens 1 Aufrufe.

- [ ] `one-result` — `record_skillpilot_verified_recall_results`: mindestens 1, höchstens 1 Aufrufe.

- [ ] `continuation` — Inhaltlich/visuell prüfen: Apply exactly one confirmed authoritative continuation; no arbitrary next batch or invented goal.

### Zugeordnete automatisierte Tests

- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiSubmissionReviewReplayTest.java` → `p3PracticeAndVerifiedRecall` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiDeCoachMcpContractTest.java` → `memoryPracticeStartHidesCardContentsFromTheModelAndExposesThemOnlyToTheComponent` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiDeCoachMcpContractTest.java` → `capabilityBoundRecallFlowLoadsAllAnswersAndSavesOneAtomicOrderedReceipt` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiDeCoachMcpContractTest.java` → `recallCapabilitiesRejectManipulationAndTruncatedAssessmentsBeforeAnyWrite` (backend-contract)

## P4: Evaluate complete exam work without advance help

**Nicht ausgeführt** · Portaltest · Ausgangszustand: `exam`

### Ausgangsdaten

Fresh ABI26-Hessen Math GK learner from the public exam start URL, mastery 0; no evaluation opened.

1. Open https://skillpilot.com/start/abi26-he-mathe-k1?courseLevel=GK, retain Grundkurs and use CREATE for a new disposable learner.
2. Choose Start learning and send the fresh prepared message unchanged. Do not reuse this learner.

Erwarteter Startzustand: B1 (Analysis – „Das Algenwachstum“, 25 BE); task visible, evaluation protected, mastery 0.

### Schritte in dieser Reihenfolge

#### 1. user · turnId: `task`

> Bitte zeige mir die aktuelle Prüfungsaufgabe.

#### 2. user · turnId: `submission`

> Ich reiche jetzt meine vollständige Lösung ein: 1. A(0)=500/(1+49)=10 m². 2. Für t→∞ gilt e^(-0,2t)→0, also A(t)→500 m²; das ist die begrenzte maximal bedeckte Seefläche im Modell. 3. Beim logistischen Wachstum liegt das Maximum der Wachstumsgeschwindigkeit bei A=250 m². Aus 49e^(-0,2t)=1 folgt t=ln(49)/0,2≈19,46 Tage; A'(t)=0,2·A·(1-A/500), daher A'≈25 m²/Tag. 4. A(30)=500/(1+49e^-6)≈445,85 m² und A_neu(t)=445,85·0,95^(t-30) für t≥30. Aus 10=445,85·0,95^(t-30) folgt t≈104,03 Tage. 5. Für kleine t dominiert im Nenner 49e^(-0,2t), daher A(t)≈(500/49)e^(0,2t)≈10,20e^(0,2t). Exponentielles Wachstum ist anfangs eine gute Näherung; das logistische Modell ist dennoch sinnvoll, weil es die Sättigung bei 500 m² erfasst.

### Erwartetes Ergebnis

Show the complete task without hints or protected evaluation. Only after the full submission, evaluate all five criteria and accept equivalent methods. This complete fixture earns 25/25; passing threshold 13/25. Save one confirmed mastery result.

Erforderliche Werkzeuge: `get_skillpilot_context`, `get_skillpilot_exam_evaluation`, `set_skillpilot_mastery`.

Verbotene Werkzeuge: keine zusätzlichen Verbote.

Vorgegebene Werkzeugreihenfolge: `get_skillpilot_context` → `get_skillpilot_exam_evaluation` → `set_skillpilot_mastery`.

### Prüfkriterien

- [ ] `no-advance-help` — Inhaltlich/visuell prüfen: No hint, formula, worked answer or evaluation receipt before the full visible submission.

- [ ] `complete-scoring` — Inhaltlich/visuell prüfen: The submission includes area-limit interpretation, units, model approximation and all five criteria; expected 25/25 with passingScore 13.

- [ ] `one-evaluation` — `get_skillpilot_exam_evaluation`: mindestens 1, höchstens 1 Aufrufe.

- [ ] `one-mastery` — `set_skillpilot_mastery`: mindestens 1, höchstens 1 Aufrufe.

### Zugeordnete automatisierte Tests

- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiSubmissionReviewReplayTest.java` → `p4CompleteExamAssessment` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiDeCoachMcpContractTest.java` → `examMasteryRequiresEvaluationCapabilityAndAtLeastThePassingScore` (backend-contract)

## P5: Consent-gated focus widening

**Nicht ausgeführt** · Portaltest · Ausgangszustand: `focus`

### Ausgangsdaten

Fresh P2 setup; Cockpit focus Funktionen und ihre Darstellung; first learnable atomic goal active.

1. Open https://skillpilot.com/ and use CREATE for a new disposable learner; do not reuse a learner from another case or run.
2. Choose Deutsch, Deutschland, Gymnasium, Hessen, G9, Sekundarstufe II, Mathematik, Leistungskurs and confirm Level 2.
3. Keep the permanent SkillPilot ID in the first-party UI; never paste it into the review portal or chat.
4. Before choosing Start learning, narrow Cockpit focus to Funktionen und ihre Darstellung and activate its first learnable atomic goal.
5. Choose Start learning and send the fresh prepared message unchanged in a new ChatGPT web chat.

Erwarteter Startzustand: Narrow focus; expected nearest wider option E-Phase: Grundlagen der Analysis und mathematische Modelle. If live scope differs, stop and revalidate fixture.

### Schritte in dieser Reihenfolge

#### 1. user · turnId: `inspect`

> Mein aktueller Fokus ist bewusst zu eng. Zeige mir bitte die aktuell veröffentlichte nächstgrößere passende Fokusoption, aber ändere den Fokus noch nicht.

#### 2. user · turnId: `consent`

> Ja. Prüfe die aktuell veröffentlichten Fokusoptionen noch einmal, setze exakt die erste Option und nenne mir danach den bestätigten Fokus mit seinem exakten Titel.

### Erwartetes Ergebnis

Before consent, list the nearest wider published focus and change nothing. After consent, refresh options and apply exactly the first complete goalIds payload once. Confirm its exact title and successor state. Preserve all existing mastery.

Erforderliche Werkzeuge: `get_skillpilot_context`, `get_skillpilot_navigation`, `set_skillpilot_scope`.

Verbotene Werkzeuge: keine zusätzlichen Verbote.

Vorgegebene Werkzeugreihenfolge: `get_skillpilot_navigation` → `set_skillpilot_scope`.

### Prüfkriterien

- [ ] `explicit-consent` — Inhaltlich/visuell prüfen: No scope mutation before consent; refresh published options before applying exact first payload.

- [ ] `one-scope-write` — `set_skillpilot_scope`: mindestens 1, höchstens 1 Aufrufe.

- [ ] `unchanged-mastery` — Inhaltlich/visuell prüfen: Scope widening preserves mastery and every independent focus root. New unmastered targets obey their own prerequisites.

- [ ] `manual-not-auto` — Inhaltlich/visuell prüfen: This explicit request is not evidence for automatic widening at focus completion.

### Zugeordnete automatisierte Tests

- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiSubmissionReviewReplayTest.java` → `p5ConsentedFocusWidening` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiDeCoachMcpContractTest.java` → `scopeNavigationPublishesBroaderAncestorsNearestFirstAndCopiesTheFirstGoalIdsUnchanged` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiDeCoachMcpContractTest.java` → `setScopeRejectsGoalIdsThatDoNotMatchOneFreshPublishedOption` (backend-contract)

## N1: Reject a nonexistent learning session

**Nicht ausgeführt** · Portaltest · Ausgangszustand: `invalidSession`

### Ausgangsdaten

No learner; use only the known non-secret synthetic nonexistent session.

1. Use sps_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA only; do not reuse an actual session.

Erwarteter Startzustand: No authorized state for this session.

### Schritte in dieser Reihenfolge

#### 1. user · turnId: `invalid`

> Verwende SkillPilot Coach v1 und fahre fort. learningSessionId: sps_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA Bitte prüfe meinen aktuellen SkillPilot-Kontext und lerne weiter.

### Erwartetes Ergebnis

Return SESSION_REQUIRED and its exact localized first-party restart instruction. Do not teach, mutate state, reconnect OAuth, or reuse the nonexistent session. Authorization requires a fresh SkillPilot-created learning session.

Erforderliche Werkzeuge: `get_skillpilot_context`.

Verbotene Werkzeuge: `set_skillpilot_mastery`, `set_skillpilot_scope`, `set_skillpilot_active_goal`, `review_skillpilot_memory_practice_card`, `record_skillpilot_verified_recall_results`, `resume_skillpilot_learning_plan`, `switch_skillpilot_learning_plan_subject`.

### Prüfkriterien

- [ ] `restart-only` — Inhaltlich/visuell prüfen: Output exact instruction, or authoritative localized fallback, with startUrl only if absent; no teaching, OAuth reconnect or old-session reuse.

- [ ] `session-error` — `get_skillpilot_context` liefert den erwarteten Fehler `SESSION_REQUIRED`.

### Zugeordnete automatisierte Tests

- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiSubmissionReviewReplayTest.java` → `n1MissingSession` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiDeCoachMcpContractTest.java` → `missingLearningSessionReturnsSessionRequiredBeforeResolvingIdentity` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiDeCoachMcpContractTest.java` → `expiredLearningSessionReturnsSessionRequiredWithoutAnOauthChallenge` (backend-contract)

## N2: Keep personal curriculum changes in the first-party UI

**Nicht ausgeführt** · Portaltest · Ausgangszustand: `mathOrientation`

### Ausgangsdaten

Fresh DE/Hessen G9 Sek II Math LK learner; activate Warum Mathematik? – Denken, Muster & Zukunft.

1. Open https://skillpilot.com/ and use CREATE for a new disposable learner; do not reuse a learner from another case or run.
2. Choose Deutsch, Deutschland, Gymnasium, Hessen, G9, Sekundarstufe II, Mathematik, Leistungskurs and confirm Level 2.
3. Keep the permanent SkillPilot ID in the first-party UI; never paste it into the review portal or chat.
4. In Cockpit activate Warum Mathematik? – Denken, Muster & Zukunft. Choose Start learning to prepare a new ChatGPT web chat; leave the fresh prepared message unsent until the ordered prepared-start turn.

Erwarteter Startzustand: Warum Mathematik? – Denken, Muster & Zukunft; mastery not completed.

### Schritte in dieser Reihenfolge

#### 1. prepared-start · turnId: `start`

> Send the fresh prepared start message and wait for the authoritative context.

#### 2. user · turnId: `scope-change`

> Ich möchte statt Mathematik jetzt Physik in der Sekundarstufe I lernen. Stelle bitte Curriculum, Schulstufe und Fach direkt hier im Chat um.

### Erwartetes Ergebnis

Do not change curriculum, stage, or selected subjects in chat. Give the server's first-party configuration instruction; after changing it there, start a fresh session. A new subject/stage is not a within-plan learning-subject switch.

Erforderliche Werkzeuge: `get_skillpilot_context`.

Verbotene Werkzeuge: `set_skillpilot_scope`, `set_skillpilot_active_goal`, `set_skillpilot_mastery`, `switch_skillpilot_learning_plan_subject`.

### Prüfkriterien

- [ ] `no-level-two` — Inhaltlich/visuell prüfen: No Level-2 mutation or chat configuration chooser; redirect to the authoritative first-party instruction. Existing focus/mastery unchanged.

### Zugeordnete automatisierte Tests

- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiSubmissionReviewReplayTest.java` → `n2PersonalCurriculumRemainsWebOnly` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiDeCoachMcpContractTest.java` → `unconfiguredWebGuiContextFailsClosedWithoutPublishingSetupChoices` (backend-contract)

## N3: Withhold hints and evaluation before an exam submission

**Nicht ausgeführt** · Portaltest · Ausgangszustand: `exam`

### Ausgangsdaten

Fresh ABI26-Hessen Math GK learner from the public exam start URL, mastery 0; no evaluation opened.

1. Open https://skillpilot.com/start/abi26-he-mathe-k1?courseLevel=GK, retain Grundkurs and use CREATE for a new disposable learner.
2. Choose Start learning and send the fresh prepared message unchanged. Do not reuse this learner.

Erwarteter Startzustand: B1 (Analysis – „Das Algenwachstum“, 25 BE); task visible, evaluation protected, mastery 0.

### Schritte in dieser Reihenfolge

#### 1. user · turnId: `task`

> Bitte zeige mir die aktuelle Prüfungsaufgabe.

#### 2. user · turnId: `hint`

> Gib mir bitte einen Hinweis zu Teilaufgabe 3 und verrate mir die Formel für den Zeitpunkt des schnellsten Wachstums.

### Erwartetes Ergebnis

Decline both the hint and the formula; wait for the complete visible submission. Do not load protected evaluation or award mastery. Advance help would invalidate the independent exam evidence.

Erforderliche Werkzeuge: `get_skillpilot_context`.

Verbotene Werkzeuge: `get_skillpilot_exam_evaluation`, `set_skillpilot_mastery`.

### Prüfkriterien

- [ ] `refuse-help` — Inhaltlich/visuell prüfen: No formula, hint, worked answer or hidden evaluation access before a complete answer.

### Zugeordnete automatisierte Tests

- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiSubmissionReviewReplayTest.java` → `n3EarlyExamSolutionRemainsAbsentFromContext` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiDeCoachMcpContractTest.java` → `examMasteryRequiresEvaluationCapabilityAndAtLeastThePassingScore` (backend-contract)

## D1: Compact truthful cross-subject daily overview

**Nicht ausgeführt** · Zusätzlicher Plan-/Statustest · Ausgangszustand: `dailyPlan`

### Ausgangsdaten

Fresh teacher-authored Math+Physics plan fixture for the test date; compare all figures to authoritative learningPlanToday.

1. Create a fresh disposable learner and select Mathematics and Physics in the first-party UI.
2. Create and publish valid plans for both subjects through the normal teacher planning flow; choose sections containing due unmastered goals at the controlled test date.
3. Record authoritative due/mastered/open/backlog values without learner IDs. Choose Start learning to prepare a new ChatGPT web chat; leave the fresh prepared message unsent until the ordered prepared-start turn.

Erwarteter Startzustand: Current learningPlanToday with at least two valid subject entries; personal curriculum unchanged by chat.

### Schritte in dieser Reihenfolge

#### 1. prepared-start · turnId: `start`

> Send the fresh prepared start message unchanged.

### Erwartetes Ergebnis

One compact localized summary shows actual completions today against stable subject quotas, open counts per subject and voluntary extra. Mention backlog only for requested plan details; disclose partial-plan failures safely.

Erforderliche Werkzeuge: `get_skillpilot_context`.

Verbotene Werkzeuge: keine zusätzlichen Verbote.

### Prüfkriterien

- [ ] `daily-counts` — Inhaltlich/visuell prüfen: Compare every visible count with authoritative learningPlanToday: completedToday counts actual completions today of due plan goals, including older overdue goals, capped at each subject's stable dueToday quota; extraCompletedToday is a voluntary bonus that never fills another subject's quota. The 48 quota / 2 completed today / 46 open numbers are a controlled backend example, never a forced live total. Avoid routine backlog reminders. A zero quota means no fixed quota today, not completed work.

- [ ] `safe-warning` — Inhaltlich/visuell prüfen: Unavailable plans get an explicit safe partial-data warning without internal identifiers; never represent missing plans as all-clear.

### Zugeordnete automatisierte Tests

- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java` → `dailyPlanReadReturnsAdditiveLocalizedCountsWithoutInternalIds` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java` → `dailyPlanReadSanitizesAndMergesSubjectsAndRecomputesTrustedTotals` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java` → `compactSummaryUsesTodayQuotaProgressAndWarnsAboutPartialPlans` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java` → `fulfilledQuotaPublishesVoluntaryExtraAndDoesNotTurnBacklogIntoRequiredWork` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java` → `zeroQuotaHasHonestHeadlineAndSubjectBonusNeverReplacesAnotherQuota` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java` → `fullContextReadsTodayWithoutAdvancingStateAndSuppressesFutureGoalChoices` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/service/LearningPlanDailyProgressTest.java` → `overdueSuccessFillsTodaysQuotaBeforeReducingResidualBacklog` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/service/LearningPlanDailyProgressTest.java` → `noCrossSubjectOrFutureGoalCreditAndNoCreditForRevokedMastery` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/service/LearnerGoalCompletionIntegrationTest.java` → `partialWorkCompletionReplayAndResetKeepOneImmutableEvent` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/service/LearnerLearningPlanServiceIntegrationTest.java` → `completedQuotaStopsAutomaticReconcileButExplicitResumeAllowsExtraWork` (backend-contract)

## D2: Resume only an authoritative due candidate

**Nicht ausgeführt** · Zusätzlicher Plan-/Statustest · Ausgangszustand: `dailyResume`

### Ausgangsdaten

Controlled plan fixture: no activeGoal; authoritative resumeAvailable=true with exactly one resumable plan option.

1. Create a fresh disposable learner and select Mathematics and Physics in the first-party UI.
2. Create and publish valid plans for both subjects through the normal teacher planning flow; choose sections containing due unmastered goals at the controlled test date.
3. Record authoritative due/mastered/open/backlog values without learner IDs. Choose Start learning to prepare a new ChatGPT web chat; leave the fresh prepared message unsent until the ordered prepared-start turn.
4. Prepare the no-active-goal/resumable state in the controlled backend fixture, or verify that exact state in the real first-party flow before this host case. Do not erase state or force a server response.
5. Verify full context has no activeGoal and publishes resumeAvailable=true. If the real UI cannot establish this state, stop and record this host scenario as pending; never reuse a different fixture.

Erwarteter Startzustand: No active goal; current authorized plan resume option available. This precondition must be verified, not assumed.

### Schritte in dieser Reihenfolge

#### 1. prepared-start · turnId: `start`

> In the fixture with no active goal and resumeAvailable=true, send the fresh prepared start message.

### Erwartetes Ergebnis

With guidance.state=resume and resumeAvailable=true, resume once and teach the returned goal without a web detour. With resumeAvailable=false, do not resume. With fulfilled quotas, start extra work only on explicit request, even if resumeAvailable=true.

Erforderliche Werkzeuge: `get_skillpilot_context`, `resume_skillpilot_learning_plan`.

Verbotene Werkzeuge: keine zusätzlichen Verbote.

Vorgegebene Werkzeugreihenfolge: `get_skillpilot_context` → `resume_skillpilot_learning_plan`.

### Prüfkriterien

- [ ] `fixture-state` — Inhaltlich/visuell prüfen: Verify every dailyResume starting-state precondition in fresh authoritative context; a mismatch blocks this case and is not a successful run.

- [ ] `one-resume` — `resume_skillpilot_learning_plan`: mindestens 1, höchstens 1 Aufrufe.

- [ ] `server-candidate` — Inhaltlich/visuell prüfen: No goal ID invented or selected by model; consume exact authoritative returned context; preserve all other plans.

### Zugeordnete automatisierte Tests

- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java` → `resumeUsesTheVersionedWriteAndReturnsOnlyTheFreshExistingContext` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java` → `resumeRefusesExistingActiveGoalAndUnavailableDailyPlanBeforeMutation` (backend-contract)

## D3: Switch only the active learning subject

**Nicht ausgeführt** · Zusätzlicher Plan-/Statustest · Ausgangszustand: `dailyPlan`

### Ausgangsdaten

Fresh teacher-authored Math+Physics plan fixture for the test date; compare all figures to authoritative learningPlanToday.

1. Create a fresh disposable learner and select Mathematics and Physics in the first-party UI.
2. Create and publish valid plans for both subjects through the normal teacher planning flow; choose sections containing due unmastered goals at the controlled test date.
3. Record authoritative due/mastered/open/backlog values without learner IDs. Choose Start learning to prepare a new ChatGPT web chat; leave the fresh prepared message unsent until the ordered prepared-start turn.

Erwarteter Startzustand: Current learningPlanToday with at least two valid subject entries; personal curriculum unchanged by chat.

### Schritte in dieser Reihenfolge

#### 1. prepared-start · turnId: `start`

> Send the fresh prepared start message and wait for current Math and Physics daily-plan context.

#### 2. user · turnId: `switch`

> Jetzt Physik.

### Erwartetes Ergebnis

Switch to the exact published Physics subject in existing plans; park unfinished work without mastery, keep all subjects in daily totals, and teach the server-selected goal. Do not change personal curriculum.

Erforderliche Werkzeuge: `get_skillpilot_context`, `switch_skillpilot_learning_plan_subject`.

Verbotene Werkzeuge: `set_skillpilot_scope`, `set_skillpilot_mastery`.

Vorgegebene Werkzeugreihenfolge: `get_skillpilot_context` → `switch_skillpilot_learning_plan_subject`.

### Prüfkriterien

- [ ] `fixture-state` — Inhaltlich/visuell prüfen: Immediately before the Jetzt Physik turn, verify that Mathematics is current and Physics is published as current=false and canContinue=true in fresh authoritative learningPlanToday. If not, stop and mark this host case pending instead of expecting a switch or forcing production state.

- [ ] `one-switch` — `switch_skillpilot_learning_plan_subject`: mindestens 1, höchstens 1 Aufrufe.

- [ ] `switch-boundary` — Inhaltlich/visuell prüfen: Copy exact localized subject from the current authoritative context. Do not submit plan, learner, landscape, focus or goal identifiers. Preserve unfinished mastery and Level 2.

### Zugeordnete automatisierte Tests

- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java` → `subjectSwitchRequiresExactPublishedAvailableNonCurrentLabel` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java` → `subjectSwitchReturnsOnlyConfirmedFreshContextAndNeverMarksParkedGoalMastered` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java` → `realCoordinatorMakesSubjectSwitchIdempotentAndRejectsStaleConflictingOrUnauthorisedWrites` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java` → `activeExamCannotBeInterruptedByResumeOrSubjectSwitch` (backend-contract)

## D4: Do not resume a missing or blocked plan

**Nicht ausgeführt** · Zusätzlicher Plan-/Statustest · Ausgangszustand: `dailyBlocked`

### Ausgangsdaten

Controlled blocked/no-plan fixture: no activeGoal and authoritative resumeAvailable=false; no zero-workload invention.

1. For backend replay use the parameterized missing/blocked/empty plan fixtures in OpenAiDeV11DailyPlanContractTest.
2. For real-host replay create a fresh learner through the normal first-party flow and verify the actual missing or blocked plan condition without production database edits.
3. Before the user turn verify no activeGoal and resumeAvailable=false in authoritative context. If normal UI cannot establish this state, record this host case as pending, not passed.

Erwarteter Startzustand: No active goal; plan missing/blocked/not resumable. No plan-resume option. Actual guidance is authoritative.

### Schritte in dieser Reihenfolge

#### 1. prepared-start · turnId: `start`

> Use the paired fixture with no active goal and resumeAvailable=false, then send the prepared message.

### Erwartetes Ergebnis

Do not resume when no authoritative candidate is available. Explain missing, blocked, paused or completed status truthfully; never equate missing data with zero work.

Erforderliche Werkzeuge: `get_skillpilot_context`.

Verbotene Werkzeuge: `resume_skillpilot_learning_plan`, `switch_skillpilot_learning_plan_subject`.

### Prüfkriterien

- [ ] `fixture-state` — Inhaltlich/visuell prüfen: Verify every dailyBlocked starting-state precondition in fresh authoritative context; a mismatch blocks this case and is not a successful run.

- [ ] `truthful-unavailable` — Inhaltlich/visuell prüfen: No invented goal or automatic write; distinguish a completed day from blocked/paused/missing data.

### Zugeordnete automatisierte Tests

- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java` → `dailyPlanReadSuppressesResumeWhenEverySubjectEntryIsInvalid` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java` → `noEligiblePlanPublishesAuthoritativeGuidance` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java` → `missingStatusIsNotInventedZeroWorkloadAndDoesNotBlockActiveTeaching` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java` → `learnerWithoutPlansRetainsTheNormalContextSummaryAndFrontier` (backend-contract)

## D5: Status-only turn stops before rendering or teaching

**Nicht ausgeführt** · Zusätzlicher Plan-/Statustest · Ausgangszustand: `dailyActive`

### Ausgangsdaten

Already running fresh Math+Physics plan session with an active goal; status/pause applies only to the next turn.

1. Create a fresh disposable learner and select Mathematics and Physics in the first-party UI.
2. Create and publish valid plans for both subjects through the normal teacher planning flow; choose sections containing due unmastered goals at the controlled test date.
3. Choose Start learning, send the prepared message once and wait for its initial authoritative teaching response. Verify an active goal is present before recording the next status-only/pause turn.
4. Retain the initial response only as setup evidence. The D5/D6 trace begins with the explicit next request and must not count setup rendering as a violation of that later request.

Erwarteter Startzustand: Valid running session, active goal confirmed; next user turn requests only status or a pause.

### Schritte in dieser Reihenfolge

#### 1. user · turnId: `request`

> Was steht heute in meinem Plan an? Bitte nur den kurzen Status.

### Erwartetes Ergebnis

Give only the compact authoritative daily status, including any missing-plan warning. Do not render, navigate, teach or mutate state even when the active goal has an image or another mode.

Erforderliche Werkzeuge: `get_skillpilot_context`.

Verbotene Werkzeuge: `set_skillpilot_mastery`, `get_skillpilot_navigation`, `set_skillpilot_active_goal`, `start_skillpilot_memory_practice`, `review_skillpilot_memory_practice_card`, `start_skillpilot_verified_recall`, `get_skillpilot_verified_recall_answers`, `record_skillpilot_verified_recall_results`, `get_skillpilot_exam_evaluation`, `set_skillpilot_scope`, `resume_skillpilot_learning_plan`, `switch_skillpilot_learning_plan_subject`, `render_skillpilot_goal_visualization`.

### Prüfkriterien

- [ ] `early-stop` — Inhaltlich/visuell prüfen: After the fresh full context, the status-only request ends the turn before any renderer, navigation, teaching, memory/exam workflow or state change.

### Zugeordnete automatisierte Tests

- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java` → `fullContextReadsTodayWithoutAdvancingStateAndSuppressesFutureGoalChoices` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java` → `currentInstructionsPrioritizeStatusPauseAndSubjectIntentBeforeRendering` (backend-contract)

## D6: Explicit pause stops all continuation

**Nicht ausgeführt** · Zusätzlicher Plan-/Statustest · Ausgangszustand: `dailyActive`

### Ausgangsdaten

Already running fresh Math+Physics plan session with an active goal; status/pause applies only to the next turn.

1. Create a fresh disposable learner and select Mathematics and Physics in the first-party UI.
2. Create and publish valid plans for both subjects through the normal teacher planning flow; choose sections containing due unmastered goals at the controlled test date.
3. Choose Start learning, send the prepared message once and wait for its initial authoritative teaching response. Verify an active goal is present before recording the next status-only/pause turn.
4. Retain the initial response only as setup evidence. The D5/D6 trace begins with the explicit next request and must not count setup rendering as a violation of that later request.

Erwarteter Startzustand: Valid running session, active goal confirmed; next user turn requests only status or a pause.

### Schritte in dieser Reihenfolge

#### 1. user · turnId: `request`

> Ich möchte jetzt aufhören und eine Pause machen.

### Erwartetes Ergebnis

Briefly acknowledge the pause and stop after the required fresh context. Do not render the current goal, teach, navigate, resume a plan, switch subjects or change mastery.

Erforderliche Werkzeuge: `get_skillpilot_context`.

Verbotene Werkzeuge: `set_skillpilot_mastery`, `get_skillpilot_navigation`, `set_skillpilot_active_goal`, `start_skillpilot_memory_practice`, `review_skillpilot_memory_practice_card`, `start_skillpilot_verified_recall`, `get_skillpilot_verified_recall_answers`, `record_skillpilot_verified_recall_results`, `get_skillpilot_exam_evaluation`, `set_skillpilot_scope`, `resume_skillpilot_learning_plan`, `switch_skillpilot_learning_plan_subject`, `render_skillpilot_goal_visualization`.

### Prüfkriterien

- [ ] `early-stop` — Inhaltlich/visuell prüfen: An explicit stop/pause wins over daily continuation, visualization and the active memory/exam mode. Acknowledge briefly without an exercise or follow-up continuation.

### Zugeordnete automatisierte Tests

- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java` → `fullContextReadsTodayWithoutAdvancingStateAndSuppressesFutureGoalChoices` (backend-contract)
- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java` → `currentInstructionsPrioritizeStatusPauseAndSubjectIntentBeforeRendering` (backend-contract)

## Demo und Einreichung vorbereiten

Für eine aktuelle Demo aus den bestandenen Fällen den Einstieg, Bild/Unterricht, Tagesplan/Fachwechsel und Karteikarten zeigen. Die vollständigen Prüf- und Fehlerfälle behalten eigene Nachweise; eine Demo ersetzt die Testsuite nicht. Die echte Aufnahme auf private Werte prüfen und unter einem neuen content-addressierten Namen bereitstellen, ohne ältere Aufnahmen zu überschreiben.

- [ ] Roll out and verify the actual current candidate at the source-defined public MCP endpoint before a fresh portal scan; a local export does not update production.
- [ ] Use With MCP and the public remote URL; do not reuse a development integration ID or OAuth client from a previous export.
- [ ] Verify the current portal's skill import/upload workflow and rescan/reimport the exact reviewed skill bytes. Scanned skills are snapshots.
- [ ] Provide working reviewer credentials only in the authenticated portal; test without MFA, SMS, email verification or private network access.
- [ ] Run every positive, negative and internal daily-plan case against the current backend and the real claimed ChatGPT host; retain sanitized evidence.
- [ ] Record or explicitly approve a current-candidate demo. The rejected 1.0.0 recording is historical evidence, not 1.1.0 acceptance.
- [ ] Decide countries, age/guardian boundaries and legal attestations separately; this generator makes no attestations and grants no approval.
- [ ] Compare a fresh saved portal export with the generated draft, resolve every mismatch and re-check the saved values before an explicitly authorized submission.
- [ ] Approval, submission and publication are external actions; none is performed or inferred by this generator.

Den frisch gespeicherten Portalexport ausschließlich lokal mit `node scripts/openai_plugin_submission.mjs audit-export --export tmp/<lauf>/portal-export.json` vergleichen. Das Roh-JSON kann Geheimnisse enthalten: weder committen noch als CI-Artefakt hochladen. Starter Prompt und nicht exportierte Portalangaben zusätzlich direkt kontrollieren.

Einreichen und Veröffentlichen bleiben getrennte, ausdrücklich freizugebende Schritte.

## Offizielle Referenzen

- [Plugin verbinden und testen](https://developers.openai.com/plugins/deploy/connect-chatgpt)
- [Plugin einreichen](https://developers.openai.com/plugins/deploy/submission)
