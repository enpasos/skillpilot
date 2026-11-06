# Audit: deterministische Skill-Graph-Regeln und ihre CI-Durchsetzung

**Arbeitsentwurf vom 6. November 2026.** Die technischen Belege stehen; der
abschließende Abgleich jeder normativen Rule-ID mit Astras Inventar folgt in
dieser Datei. Bis dahin ist dies keine Behauptung einer vollständigen Abdeckung
aller harten Konzeptregeln. Das Audit ist lesend; es implementiert kein Gate,
ändert keine Curriculumsdaten und erzeugt keinen neuen QA-Reifegrad.

Das zentrale Ergebnis ist bereits belegt: Die vorhandene CI erzwingt zahlreiche
Daten-, Projektions- und Evidenzregeln, während einige aktive Tests ausdrücklich
abgelöste Restbedarfs- und Fokus-Cut-Regeln sichern. Die neue qualifizierte
Prüfungsanerkennung und rekursive Einheitsabschlüsse sind noch Sollverträge.
Lokale Formalprüfungen und Bestandsinventare ersetzen dafür kein Produkt-CI-Gate.

## Bewertungsmaßstab

| Status | Bedeutung für die jeweilige normative Regel |
| --- | --- |
| H | Ein harter CI-Fehler ist für den gesamten in der Regel geforderten Scope belegt. |
| P | Nur ein Profil, Teilaspekt, anderer Workflow oder eine Teilmenge ist belegt; die konkrete Grenze steht in der Zeile. |
| W | Der relevante Befund ist nur Warnung, Diagnose oder unverbindlicher Bericht. |
| L | Die Prüfung ist nur lokal oder als isolierte Referenz verfügbar; kein entsprechendes hartes Curriculum-CI-Gate ist belegt. |
| N | Eine passende Implementierung oder CI-Durchsetzung ist nicht gefunden. Das ist kein grüner Befund. |
| K | Aktive Implementierung, Test oder normative Aussagen stehen im Konflikt mit dem aktuellen Soll. |

H bezeichnet die belegte technische Bedingung, keine fachliche Richtigkeit,
menschliche Zustimmung, Host-Abnahme oder empirische Wirksamkeit. Bei einer
bedingten Regel muss zuerst ihr fachlich zulässiges Profil aufgelöst werden.
Die vollständige Definition dieses Profils kann deterministisch geprüft werden;
ein bloßes Definitionswort macht eine Invariante nicht unprüfbar.

## Vorrangige Befunde und begrenzte Arbeitspakete

1. **Globale Graphstruktur:** Der allgemeine Validator schneidet Fremdlandschafts-
   kanten aus Zyklusgraphen. Der unqualifizierte Fremd-ID-Fallback erzwingt zudem
   keine Eindeutigkeit. Globale atomare Normalisierung, fehlende und mehrdeutige
   Referenzen, Vererbung, Cluster und fachübergreifende Zyklen brauchen ein
   gemeinsames frühes Strukturgate samt echten Gegenbeispielen.
2. **Transitive Minimalität:** Der neue S0-Prüfer läuft lokal; sein aktueller
   Bestandslauf meldet **1.319 Fehler**. Das ist eine lokale Diagnose und kein
   neues hartes Graph-CI-Gate. Legacy-Befunde müssen fachlich überprüft werden;
   Kanten werden nicht zum Erreichen eines gewünschten Einheitszuschnitts
   automatisch ergänzt oder gelöscht. Referenzbeispiele beweisen keine
   Fehlerfreiheit des echten Curriculums.
3. **Stabile IDs:** Der UUID-CLI-Glob erfasst die kanonische Mathematikdatei
   nicht; das Laufzeitschema fordert dort nur Strings. Entdeckungsumfang und
   Gegenprüfungen müssen kanonische Dateien einschließen. Die vorhandene
   kanonische Eindeutigkeitsprüfung ist ein eigener, engerer Nachweis.
4. **Neue Anerkennung:** Bestehende Tests für offene Verbraucher, gemeisterte
   Zwischenknoten und Karten/Orientierung widersprechen dem neuen C(q)-Vertrag.
   Der erste Runtimepfad braucht Gegenbeispiele an den tatsächlichen Service-,
   Adapter- und Projektionsgrenzen; alte Sollwerte müssen inhaltlich ersetzt
   werden. Historische Q-Bedeutungen und jede erforderliche Prüfungsalternative
   bleiben eigenständige Pflichten.
5. **QA und reale Angebote:** Statusfrische, harte Einzelregeln, geschützte
   Reifegrad-Untergrenzen und vollständige Angebotsabdeckung sind verschiedene
   Prüfungen. Das lokale native Mathematik-/Physikinventar ist vorhanden; seine
   Vollständigkeitschecks sind noch kein allgemeines CI-Gate für neue Einheiten.
6. **Verbindliche Aufrufwege:** Vollständige Paket-/OWL-Läufe sind gegenwärtig
   zeitgesteuert oder manuell; Haupt-PR-CI führt dort auch bloße Selftests aus.
   Für jedes neue Gate müssen Trigger, tatsächlich geprüfte reale Eingaben,
   Ausstiegscode und erforderlicher Scope explizit festgelegt werden.

## Quellen, Grenzen und Nachweisform

Dieser Bericht konsolidiert die 45 statischen Regelgruppen S01–S45 und 41
Laufzeitprädikate M/P/Q/K/U/G aus den zwei lesenden technischen Audits. Die
normative Hauptmatrix wird nach Eingang des unabhängigen Inventars ergänzt.
Die Belegtabellen nennen gelesene Implementierungen, Testkörper und konkrete
CI-Aufrufe; kein Testname allein wurde als fachlicher Beweis gezählt.

Nicht geprüft wurden aktuelle Remote-Laufergebnisse, erforderliche
Branch-Protection-Checks, Produktionsdaten, tatsächliche Hostdarstellung,
menschliche Erprobung und Wirksamkeit. Vorhandene Status-Snapshots bleiben
Nachweise ihres damaligen/implementierten Vertrags; sie bestätigen nicht
rückwirkend das neue Soll. Prüfungsaufgaben und Rubriken benötigen zusätzlich
fachliche Qualifikation. Deterministisch prüfbar bleiben deren Vollständigkeit,
Identität, Fingerprints, Bindungen, Pflichtmengen und formale Bewertungsregeln.

Die Haupt-CI überspringt gewöhnliche reine Dokumentations-/AGENTS-Änderungen;
ein separater Docs-Workflow prüft Verweise und Dokumentationsregeln. Ein
vorhandener npm-Befehl wird nicht automatisch in CI ausgeführt. Andere aktive
Workflows zählen aber mit: insbesondere läuft `test:level-completion` im
Assessment-Workflow tatsächlich bei Zeile 99. Jobfehler sind ohne Prüfung der
Branch-Protection-Konfiguration kein Beleg einer zwingenden Merge-Sperre.

## Normative Hauptmatrix

Noch in Bearbeitung: jede Astra-Rule-ID wird genau einmal zu Konzeptstelle,
technischer Belegkette, Status und verbleibender Scope-/Gegentestlücke aufgelöst.
Keine nicht zugeordnete Regel wird als erfüllt behandelt.

## Technische Belege: statische Struktur und QA

### Classification and invocation boundaries

- **unconditional-fail**: the actual invoked checker exits nonzero for its
  errors. This does not mean every curriculum or every PR invokes it.
- **profile-fail**: failure is limited to authored profiles, selected subjects,
  chosen offerings or protected maturity floors.
- **warn-only**: the finding changes output/status but does not itself fail CI.
- **local-only / inactive**: an implementation or example test exists without
  a corresponding real-curriculum CI invocation, or implementation is absent.

`CI / graph-validation` is `.github/workflows/ci.yml:493`, display name
`Curriculum CI`; commands run from `app` (`:497–499`). The workflow triggers
push/PR to `main` plus dispatch, but excludes ordinary docs/AGENTS/README-only
changes (`:3–27`), with explicit generated-status/legal-inventory exceptions.
`Docs Checks / docs-checks` instead runs documentation checks
(`.github/workflows/docs_checks.yml:107–116`), not graph/curriculum semantics.
No branch-protection required-check configuration was inspected: job failure
and merge prevention are separate claims.

`Optional Package CI` (`.github/workflows/owl-ci.yml:3–17`) runs by weekly
schedule/manual dispatch, **not** as a push/PR workflow. Its failing checks are
real checks in that optional workflow, not universal PR gates. `committed-bindings`
source-PDF mode is explicit in main CI (`ci.yml:680–681`) and optional package
CI (`owl-ci.yml:30–31`); it does not establish live URL/PDF reachability.

### Graph identity, schema and prerequisites

| Rule / group | Actual implementation | Test / counterexample evidence | CI invocation and enforcement | Concrete limits |
| --- | --- | --- | --- | --- |
| S01  Runtime landscape JSON shape and required fields | `scripts/validate_schemas.py:541–549` discovery, `:591–620` `validate_file`, `:663–678` traversal/exit; `docs/landscape-runtime.schema.json:590–600` goal required fields | Embedded discovery negative corpus `validate_schemas.py:552–588`; personalization schema and semantic negative corpora `:65–537` | `ci.yml:697`: `python scripts/validate_schemas.py`; **unconditional-fail** for discovered runtime documents/JSON parse errors | `quality` is intentionally excluded from runtime schema, though its JSON still parses. Goal schema allows additional properties. A schema description is not a semantic check. |
| S02  Portable curriculum symlinks / no external or ignored source escape | `validate_schemas.py:16–62` `curriculum_symlink_errors`; invoked `:652–656` | `scripts/test_validate_schemas_symlinks.py:35–90`: relocation, absolute, dangling, outside-repository and ignored-target cases | `ci.yml:695` unit suite; `:697` real-tree validation; **unconditional-fail** | Limited to committable curriculum paths selected by Git discovery; not a whole-workspace filesystem policy. |
| S03  UUID shape for stable goal IDs and relations | `scripts/validate_goal_ids_uuid.py:8–12`, `:28–71`, exit `:74–86` | No standalone malformed canonical-UUID regression was identified in the inspected suites | `ci.yml:699`: `python scripts/validate_goal_ids_uuid.py`; **profile-fail by path**, not general canonical coverage | **Gap:** `rglob("json/*.json")` at `:28` misses `canonical/*.json`. Runtime schema `goal.id` `:603–606` and relation items `:660–672` require only strings, no UUID pattern. |
| S04  Duplicate goal IDs within one file; shortKey uniqueness within logical landscape | `app/scripts/validateGraph.ts:585–593` `validateLandscape`; shortKey owner sets `:363–382` | No dedicated CLI malformed-input fixture for duplicate IDs/shortKeys found by searches of app tests. Real-corpus invocation exists | `ci.yml:527`: `npm run validate:graph`; package script `app/package.json:100`; **unconditional-fail** | Same-ID locale serializations are accepted without equivalence comparison at `validateGraph.ts:330–346`. General ID meaning stability is not checked. |
| S05  Global canonical goal-ID uniqueness | `app/scripts/validateCompositionViews.ts:918–930` builds canonical global universe and throws for repeated IDs | No focused cross-landscape duplicate-ID negative test identified | `ci.yml:601`: `npm run validate:composition-views`; **unconditional-fail** within canonical registry | This stronger protection is canonical-DE-Gymnasium composition infrastructure, not global uniqueness for every loaded landscape. |
| S06  `requires`/`contains` referential integrity and self-reference | `validateGraph.ts:723–758` `checkReference`; qualified lookup at `:724–729` | No isolated CLI malformed-reference regression found; schema discovery tests do not test this semantic resolver | `ci.yml:527` `validate:graph`; **unconditional-fail** for reported errors | **Gap:** fallback `:732–738` accepts any global candidate when `length >= 1`, despite the comment saying unique; ambiguity is not rejected there. Fully qualified foreign IDs use the exact composite lookup. |
| S07  Direct `requires` and `contains` DAGs | `validateGraph.ts:765–805` `buildEdgeMap` / `detectCycles`, invoked immediately after; CQR `generateCurriculumQualityStatus.ts:1836–1885` independently checks local direct edges | No generic malformed cross-landscape graph CLI regression identified; formal/example graph tests are separate | `ci.yml:527` real graph checker **unconditional-fail**; CQR report/floors at `:618–621` | **Gap:** `buildEdgeMap:769–771` retains only same-landscape edges. CQR also retains only same-landscape edges (`:1863`, `:1874`). This is not a general cross-subject/global DAG gate. |
| S08  Inherited effective prerequisites and effective DAG | `validateGraph.ts:902–938` `computeEffectiveRequires`, parent inheritance and local effective cycle detection | No targeted generic inherited-cycle CLI counterexample found in inspected test names/references | `ci.yml:527` `validate:graph`; **unconditional-fail** for detected effective cycles | Does not perform full global atomic cluster expansion. Foreign edges are removed at `:934`. **Suspect unreachable self-inheritance guard:** `:917` removes self requirements before `:925` tests for them; ancestor guards may catch some cases, but that is not evidence for this guard. |
| S09  Ancestor/container/child dependency anti-patterns; phase monotonicity | `validateGraph.ts:850–899` GVR-001/003/006; `:940–970` phase rule; severity selector `:145–147` | No generic negative CLI suite found for all of these guards | `ci.yml:527` default **profile-fail**; `VALIDATE_GRAPH_STRICT_RULES=0` changes selected rules to **warn-only** | Direct-child rule is landscape-allowlisted (`:141–144`, `:876`); phase ranks only comparable phase systems. These checks do not prove complete effective atomic acyclicity. |
| S10  Explicit atomic/cluster type agrees with leaf structure; canonical semantic-kind completeness | `validateGraph.ts:684–698` GVR-009; canonical-Math ledger checks `:595–641` | Hard-route negative tests `app/scripts/testHardLearningRouteValidation.ts:39–56,156–175`; those do not exercise every CLI type path | `ci.yml:527`; type rule default **profile-fail** via strict switch; Math ledger checks **unconditional-fail** | Complete authoritative ledger coverage here is Math-specific. Same semantic-kind obligations for all subjects need separate evidence. |
| S11  Numeric/metadata domains and weighted aggregation prerequisites | Phase/leitidee/competency checks `validateGraph.ts:700–719`; `docs/landscape-runtime.schema.json:649–651` weight only `type:number` | No general weight=1 / unique-descendant cluster-weight counterexample located | `ci.yml:527,697`: hard checks for implemented domains; **inactive** for additional weight invariants | No general positivity/integer/atomic-weight=1/cluster-weight=unique-descendants gate identified in these primary validators. These didactic conventions require inventory cross-reference. |
| S12  Transitive minimality | New S0 auditor/test work exists separately; no reference to transitive-minimality scripts in `.github/workflows/*.yml` or `app/package.json` was found at audit time | New synthetic/formal tests do not inspect all real curriculum edges | **local-only / inactive** as real-curriculum CI enforcement | No real-curriculum hard CI gate. Do not count example-graph checker success, schema validity or route reachability as minimality. New auditor rollout and legacy findings still need explicit handling. |

### Routes, projections and authoring structure

| Rule / group | Actual implementation | Test / counterexample evidence | CI invocation and enforcement | Concrete limits |
| --- | --- | --- | --- | --- |
| S13  Orientation is atomic/prerequisite-free and contains no exam/memory duties | `app/scripts/lib/hardLearningRouteValidation.ts:53` `validateOrientationMotivationStructure`; `validateGraph.ts:644–654` emits unconditional errors | `testHardLearningRouteValidation.ts:13–56`: valid and malformed orientation including prerequisites, examData, examples and memory | `ci.yml:527` real corpus and `:539` `npm run test:hard-learning-routes`; **unconditional-fail** | Classification comes from authoritative Math ledger or each other goal's semanticKind/tags; incomplete classification outside Math is a scope risk. |
| S14  Hard direct atomic route from motivation to terminal assessment | `hardLearningRouteValidation.ts:166` `validateHardDirectAtomicRoutes`; `validateGraph.ts:1049–1063` emits `error` | `testHardLearningRouteValidation.ts:297–487` good/broken routes and scope counterexamples | `ci.yml:527,539`; **profile-fail**, unconditional severity for selected scope | Profiles `validateGraph.ts:535–552` cover canonical Mathematics Sek I/II. This hard route gate is not a universal all-subject route guarantee. |
| S15  Scoped atomic prerequisites must not point to clusters | `validateGraph.ts:1066–1082` GVR-013; profiles `:554–560` | Route tests exercise atomic route semantics; no general all-subject GVR-013 CLI regression identified | `ci.yml:527`; **profile-fail**, downgradeable by strict switch | Only selected canonical Math non-memory atomic goals; cluster inheritance and other subjects remain compatible elsewhere. |
| S16  Orientation outlook references, stage locality and downstream route | `validateGraph.ts:1212–1236` `validateOrientationOutlooks` | `testHardLearningRouteValidation.ts:156–175`: internal labels, unknown roots, subtree membership, missing route and incorrect anchor kind | `ci.yml:527,539`; **profile-fail** | Invoked only for canonical Math Sek I/II. |
| S17  Exam Markdown table shape | `app/scripts/lib/examMarkdownValidation.ts:49` `findExamMarkdownTableIssues`; `validateGraph.ts:656–672` scans four task/solution language fields | `testExamMarkdownValidation.ts:14–45` malformed delimiters/columns and non-table negatives; `:60–74` real released task rendering | `ci.yml:527,529`: real checker plus `npm run test:exam-markdown`; **unconditional-fail** | Only intended pipe-table blocks, not general mathematical/semantic correctness or grading validity. |
| S18  Composition normalized schema, references, projection roles, no overlap/duplicate visible goal/parent | `app/src/utils/authoring/compositionViewAuthoring.ts:285` `compileCompositionView`; CPV-001/002/004/005/006/007/008/009 at `:296–620`; CLI exit `validateCompositionViews.ts:1127–1139` | `testCompositionProjectionRoles.ts:300–368` specificity/target behavior, `:385–412` unknown role/opaque curricular-area negatives; `testGoalBookModel.ts:561–567` unbound external subtrees fail | `ci.yml:601,603`: `validate:composition-views`, `test:composition-projection-roles`; **unconditional-fail** for CPV errors | Generic labels CPV-101 and phase-like roots CPV-102 are warnings. Static composition uniqueness is not unique acquisition ownership of future learning units. |
| S19  `target` / `prerequisiteOnly` scope and overlap specificity | `compositionViewAuthoring.ts:74` `getCompositionProjectionRole`, `:113` `collectCompositionProjectionRoleGoalIds`; compile and runtime projection consume these | `testCompositionProjectionRoles.ts:192–252,300–368` target exclusion and specificity, including direct overrides | `ci.yml:603`; **unconditional-fail** for test assertions plus authored-role compile errors | Does not prove all future resolved learner states or new learning-unit required-Q choices. Root audit owns runtime mastery/frontier semantics. |
| S20  Applicability evidence, consistency and filtered prerequisites/reachability | `app/scripts/applicabilityCompiler.ts:788` `buildApplicabilityCompilation`; APV-001/002/003/101/102/103/104 emit errors at `:623–1217,1423–1478`; CLI `validateViewFilters.ts:99–147,195` | `sourceCoverageAndApplicabilityRegression.test.ts:187–263` all-of and roles; `:279–341` missing/cyclic/cluster/assessment source routes fail closed | `ci.yml:557`: `validate:view-filters`; source regression is run at `:579` through `app/package.json:139`; **profile-fail** for errors | Default selected set is 21 canonical landscapes (`validateViewFilters.ts:104–126`), unless `APPLICABILITY_VALIDATION_SCOPE=all`. Supported compilation dimension is jurisdiction (`applicabilityCompiler.ts:18`). |
| S21  Applicability overrides, partial mappings and stale compiled applicability | `applicabilityCompiler.ts:1155–1156` APV-201 warning; `:1201–1202` APV-202 diagnostic; `:1396–1397` APV-203 warning; CLI exit only errors | Regression `sourceCoverageAndApplicabilityRegression.test.ts:256–263`; active Memory bindings additionally asserted `:155–161` | `ci.yml:557`; **warn-only / diagnostic** in generic APV invocation | Accepted-warning registry changes active/accepted reporting, not warning-to-error behavior. Source audit and maturity floors can separately fail selected consequences; no universal stale-applicability failure follows from APV-203 alone. |
| S22  Rendered fallback tree single occurrence / one visible parent | `app/scripts/treeProjectionValidator.ts:86` collector, TPV-101/102 `:140–171`, orchestration `:178–202` | No focused TPV malformed-input suite identified | `validateViewFilters.ts:102,138`, `ci.yml:557`; **profile-fail** | Skips landscapes without programUnits or goalPlacements and all landscapes having composition views (`treeProjectionValidator.ts:183–186`). Composition compiler provides a different check for the latter. |
| S23  Offered Mathematics scope has matching composition and only reviewed fallback | `app/scripts/reportCanonicalMathScopeCoverage.ts:253–270` missing/unapproved fallback exit | Subject/scope-specific regressions exist, but no single exhaustive offered-scope negative suite mapped in this pass | `ci.yml:569`: `check:canonical-math-scope-coverage`; **profile-fail** | Math-specific offering resolution. Future all-subject learning-unit scope matrix is not supplied by it. |
| S24  Duration-specific projections / generated offerings / reviewed G8/G9 policies | `reportHeMathDurationProjection.ts:454–469`; `reportGymnasiumDurationModelReadiness.ts:920–948` staleness, required subjects/M6 and policy errors; `generateGymnasiumDurationOfferings.ts:55` check flag | Scope tests exist; exact full negative-test mapping remains unverified in this bounded audit | `ci.yml:561–577`: projection, generated views/readiness and `--require-reviewed-subject=Mathematik` / `--require-reviewed-m6` via package scripts `:211–226`; **profile-fail** | Readiness-only `--check` primarily checks report freshness; stronger reviewed-policy checks depend on flags. Some generated subjects have no main CI command (e.g. politics/economics generator is in package scripts but not in this workflow block). |

### QA evidence, source fidelity and images

| Rule / group | Actual implementation | Test / counterexample evidence | CI invocation and enforcement | Concrete limits |
| --- | --- | --- | --- | --- |
| S25  Source registry files resolve with matching landscape IDs | `app/scripts/checkSourceLandscapeRegistry.ts:116` `checkEntry`, `:159–174` main/exit | No standalone malformed registry negative suite identified | `ci.yml:559`: `check:source-landscape-registry`; **unconditional-fail** for registry entries | Ensures recorded local source references, not completeness/accuracy of original-source extraction. |
| S26  Ordinary source coverage distinct from requires closure/assessment applicability | `app/scripts/sourceCoverageEvidence.ts:38` direct evidence, `:48` reviewed recursive coverage checker; audit `generateCurriculumSourceCoverageAudit.ts:307` `buildAudit`, `:424–458` problems, `:469–476` failure | `sourceCoverageAndApplicabilityRegression.test.ts:266–341`: ordinary recursive evidence succeeds, missing/cycles/clusters/assessment chains fail | `ci.yml:579`: `quality:source-coverage-audit:check` runs tests then actual audit (`app/package.json:139`); **profile-fail** | Actual audit targets Math/Physics only (`generateCurriculumSourceCoverageAudit.ts:22–29`). It does not establish PDF extraction completeness. |
| S27  Full source inventory, version/components and no invented review completion | `generateCurriculumQualityStatus.ts:4355` source inventories, `:4993` missing pipeline, `:5812` ingestion, `:5866` jurisdiction coverage | `testSourceExtractionInventory.ts:18–52,68–105,135–144` component/version/cache cases and explicit incomplete review; `testRepositorySourceAvailability.ts:25–35` ignored/outside paths fail | `ci.yml:613,615` unit/real-input checks; report/floors `:618–621`; **profile-fail** where floor requires CQR-000/003 | Report can honestly record lower maturity for unprotected curricula. Existing source snapshots define the checked universe; missing content in the official source is not automatically detectable. |
| S28  CQR basic integrity and cumulative M0–M7 derivation | `generateCurriculumQualityStatus.ts:1836` graph integrity; `:5988–6022` maturity derivation; `:6244–6264` write/check behavior | `testDeepUnderstandingRollout.ts:143–168` no-scope, mismatch, M7 requires M6, absent routes prevent promotion | `ci.yml:611` tests, `:618` regenerates, `:619` floor checker, `:620–621` tracked/untracked status drift; **profile-fail**, not fail-on-every-CQR-finding | Report generator does not exit nonzero merely for every CQR warn/fail. A newly committed truthful low status can pass unless protected floor or another hard gate fails. |
| S29  Protected maturity cannot regress | `app/scripts/checkCurriculumMaturityFloors.ts:43–61` policy checks, `:83–111` unique identity/minimum and throw; policy `app/scripts/config/curriculum-maturity-floor-policy.json:17–87` | Maturity transition counterexamples `testDeepUnderstandingRollout.ts:165–168`; no standalone malicious-floor-mutation suite identified | `ci.yml:619`: `check:curriculum-maturity-floors`; **profile-fail** | Ten protected curricula. CQR-303 deliberately not floor-binding below M7 (`checkCurriculumMaturityFloors.ts:57–61`). Policy change is not itself technically owner-authenticated by this checker. |
| S30  D/P/A/M/V exact current intersection, no missing/duplicate goal or stale review evidence | `app/scripts/reportDeepUnderstandingRollout.ts:749` unique claim, `:765` gate intersection, `:800` strict completion, `:1878` real report; CQR-303 projection `generateCurriculumQualityStatus.ts:3846–3883` | `testDeepUnderstandingRollout.ts:48–61` incomplete checks rejected, `:86–89` forged deferral rejected, `:187–197` stale P evidence/required approval, `:215–225` gate intersection and duplicate claim | `ci.yml:611` tests plus real CQR report/floors `:618–621`; **profile-fail** | Active review configuration and M7 floors determine enforced content. Historical M7 does not qualify new C(q) application proof. No empirical classroom-effectiveness gate. |
| S31  Description-review task/run/input/criteria/schema fingerprint binding and independent rounds | `app/scripts/validateGoalDescriptionReviewCampaign.ts:177` bundle bindings, `:306` full input fingerprint, `:645` campaign validator, `:736` batch; central rollout consumes current evidence | `testGoalDescriptionReviewCampaign.ts:220–228` stale verified prompt, `:616–625` changed canonical context, `:640–650` stale bundle; `testDeepUnderstandingRollout.ts:86–89` forged deferral | `frontend-ci`, `ci.yml:395`: `test:goal-book-pipeline` includes description contract suites (`app/package.json:86`); real active evidence enforced through central report/floors | Direct `validate:goal-description-*` CLI commands are not all separately invoked in main CI. Test existence alone must not be called a full live-corpus gate; actual integration is central rollout for configured subjects. |
| S32  Positive understanding evidence, valid run artifacts, current goal/criteria/resource fingerprints | `app/scripts/positiveGoalEvidenceReview.ts:189–224` run checks, `:305` `reviewPositiveGoalEvidenceConfig`, `:382–424` schema/ID/scope/run/resource validation | `testPositiveGoalEvidenceReview.ts:272–280` prompt tampering, `:336–353` stale resource/current goal; `testPositiveGoalEvidenceProfileModel.ts:253–294` stale goal/review-input fingerprints | `frontend-ci`, `ci.yml:395` pipeline; `graph-validation:611,618–621` central QA; **profile-fail** | These are normal positive understanding-evidence contracts, not independent application proof of every qualified assessment coverage goal. |
| S33  Semantic atomicity review is current and well-formed | `app/scripts/semanticAtomicityReview.ts:192–203` record semantics, `:230–250` stale fingerprints, `:304` blocking stale records; central report gate A | Strict intersection negatives `testDeepUnderstandingRollout.ts:215–225`; targeted atomicity unit-counterexample mapping not completed | Real central QA report/floors `ci.yml:618–621`; **profile-fail** | Static machine integrity cannot itself determine fachliche atomicity. Direct `quality:semantic-atomicity:check` is a package script, not a separate main workflow invocation found here. |
| S34  Required card content, traceability, current goal/card fingerprints, required-view visibility | `app/scripts/memoryCardReview.ts:512` deck evidence, `:582,634` record validation, `:1151–1154` trace/visibility blockers, `:1184–1185` exit; config runner `runMemoryCardReviewConfigs.ts:61–78` propagates failures | `sourceCoverageAndApplicabilityRegression.test.ts:71–80` invalid active config; `:120–161` actual Memory-origin scope; `testDeepUnderstandingRollout.ts:165–168` M6/M7 dependency | `ci.yml:609` `quality:memory-card-review:check:all`; **profile-fail** for all discovered active configs | Scope is active/configured reviews; empty/missing inventory coverage needs dedicated registry completeness evidence. Recall is not C(q) ordinary proof. |
| S35  Active image bytes/path/copy integrity and immutable historical assets | `scripts/check_goal_visualization_assets.mjs:35` hash, `:39–44` standalone SVG guard, `:65–77` path/realpath containment, `:87–118` history/primary-link checks and final nonzero exit | Image QA model negatives `testGoalVisualizationQaModel.ts:26–62`; asset-checker specific full mutation suite not mapped | `ci.yml:625`: `check:goal-visualization-assets`, after asset preparation; **unconditional-fail** for canonical linked assets | Canonical DE Gymnasium source directory; raster orphan scan intentionally excludes unlinked SVG (`check_goal_visualization_assets.mjs:18–21`). Byte integrity does not prove image correctness or host display. |
| S36  Generated image QA ledger freshness / exact-asset current approval | `generateGoalVisualizationQaLedgers.ts:379–412` check mode and stale files; `checkGoalVisualizationQaApprovalCoverage.ts:26–52` approval + one exact owner pilot, `:62–109` active coverage/exit | `testGoalVisualizationQaModel.ts:36–62` stale/legacy rejection; `testGoalVisualizationQaApprovalCoverage.ts:77–81` pilot subject/hash/NOK boundaries | Real commands `ci.yml:627,629`; model tests `frontend-ci:403–408`; **profile-fail** | Main subject defaults/arguments Math/Physics/Chemistry. Display approval accepts human OR current AI, human NOK wins; strict M7 V is separate and machine-only. Exact rejected owner-pilot exception is display-only. |
| S37  Image rollout coverage and QA parity | `reportGoalVisualizationRolloutStatus.ts:908` `coverageGateFailure`, `:916–954` freshness/required-coverage exit; `checkGoalVisualizationQaCoverageParity.ts:44–105` ID-set/scope checks | `testGoalVisualizationRolloutStatus.ts` via `ci.yml:407`; QA hash/pilot tests above | `ci.yml:632–635` all three subjects and parity; **profile-fail** | `coverageGatePassed` at `reportGoalVisualizationRolloutStatus.ts:637` means regular-unlinked count zero, not automatic resolution of every deferral or empirical content/host acceptance. |

### Build, publication and package boundaries

| Rule / group | Actual implementation | Test / counterexample evidence | CI invocation and enforcement | Concrete limits |
| --- | --- | --- | --- | --- |
| S38  Generated goal books bind current source/model/PDF/index/artifacts | `app/scripts/checkGoalBookPublication.ts:348` `verifyPublishedGoalBook`, stale source/model `:408–423`, PDF/model/page/index binding `:454–505`; `buildGoalBookPublications.ts:193` registry build | `testGoalBookPublication.ts:139–153` missing/foreign registered book, `:178–205` relation-URL tampering; unbound subtree negatives `testGoalBookModel.ts:561–567` | `CI / goal-book-publication`, `ci.yml:324–327`: `build:goal-books -- --force`, `check:goal-book-publication`; graph job depends on it `:495`; **profile-fail** over registered publications | Not all conceptual scopes automatically register books; successful generation/publication checks are not host or human effectiveness acceptance. |
| S39  Package trusted schemas, runtime catalog, locks, manifest bindings and adversarial raw fixtures | `scripts/validate_curriculum_package_contracts.py:459,876,950,1005` trusted contracts/manifest; fixture suites `:2157,2261,2508,2600`; main errors `:2865–2877` | Real adversarial fixture suites are called by this CLI, not just documentary examples; package-validator self-tests below | `ci.yml:684–690`: package/catalog/schema contracts plus full-validator/provisioner/consumer self-tests; **unconditional-fail** within their fixture contracts | These self-tests do not validate every real subject package ZIP in the main PR job. |
| S40  Release-model actual input/closure/evidence equivalence and deterministic compilation | `scripts/run_curriculum_release_model_conformance.sh:85–110` compiles, independently validates, checks current source/redistribution evidence, recompiles and byte-diffs; validator `validate_curriculum_release_model.py:3350` expected model, `:1544` acyclicity | Same shell `:49–51` fixture/dependency self-tests; `:65–83` symlink output rejection preserves sentinels | `ci.yml:691–692`: `SKILLPILOT_FULL_PACKAGE_CONFORMANCE=false bash scripts/run_curriculum_release_model_conformance.sh`; **profile-fail** | Explicitly returns at shell `:112–114` before complete package/provision/runtime smoke when full=false. Audits the configured profile, not every canonical pool. |
| S41  Full standalone ZIP closure, asset digest, offline schema trust, runtime catalog | `scripts/validate_full_standalone_curriculum_package.py:878` archive, `:1434` docs/schema, `:2255` content/assets, `:2599` catalog, `:3647` hard closure, `:3803` package | `:3848` `run_self_test`; builder negatives `app/scripts/testFullStandaloneCurriculumPackageBuilder.ts:507,565–641` paths/licenses/metadata | Main CI `ci.yml:637` builder tests and `:688` validator self-test; real full ZIP in `Optional Package CI / package-ci`, `owl-ci.yml:77–89`; **fixture-fail on PR**, real-package **optional-workflow profile-fail** | Full package CI is schedule/manual. Main job does not thereby enforce full ZIP/provision/runtime readiness for every curriculum. |
| S42  Real package backend load and package-only consumer isolation | Real full conformance shell, consumer/provisioner; main builds package-only frontend `ci.yml:641`; full-validator closure above | `run_package_consumer_smoke.py --self-test` at main `ci.yml:690`; optional backend `ProvisionedCurriculumPackageConformanceTest` | `owl-ci.yml:83–89` real provisioned package test in optional workflow; main self-tests/build; **profile-fail / optional** | Real runtime acceptance of every package/host is not proved by self-tests or successful bundle build. Root owns deeper backend isolation mapping. |
| S43  FWU/OWL semantic reconstruction, OWL 2 DL/reasoning and reverse compiler | Optional workflow calls actual semantic roundtrip and reasoning `owl-ci.yml:173–178`, then dedicated contract/self-test scripts `:181–186` | Dedicated FWU/reverse conformance contract self-tests run there; bounded completion-package FWU tests separately in assessment workflow | `Optional Package CI / fwu-owl-ci`, schedule/manual; **optional-workflow profile-fail** | Not a main PR gate. No inference from these semantic/package tests to arbitrary assessment application proofs or transitive minimality. |
| S44  Real subject export release and live source checks | `owl-ci.yml:224–236` invokes `npm run export:subject-release-gate:ci` with explicit URL-audit flags | Export contract tests are available in `app/package.json:236`; exact complete mapping remains outside bounded pass | `Optional Package CI / subject-export-release-gate`; **optional-workflow profile-fail** | Live source audit and strict URL failure flags default false and require dispatch inputs (`owl-ci.yml:6–15,225–227`). Source truth is not automatically refreshed by every PR. |
| S45  Known Physics/Chemistry evidence regressions relative to baseline | `scripts/run_canonical_physics_evidence_watch.sh:15–17` render+delta check; Chemistry script `:15–18` self-test/render/check | Chemistry runs its own self-test; detailed checker conditions were not fully mapped in this bounded pass | `.github/workflows/canonical_physics_evidence_watch.yml:54`, Chemistry `:56`; separate path-filtered push/PR/schedule jobs, **profile-fail** | Baseline/delta regression guard is not a universal source, all-subject graph or new-C(q) qualification gate. |

### New recognition and learning-unit target rules: current negative result

No inspected primary static checker enforces the full new conjunction below:

- qualified immutable atomic C(q), empty for unknown historical Q, rather than
  accepting `coveredGoalIds` or `reviewStatus=released` as proof;
- C(q) contained in fully normalized global atomic prerequisite reachability;
- unique acquisition owner per resolved course plus every permitted
  `RequiredOwnQ(U)` alternative proving all `Own(U) ∩ O`;
- recursive required-child Q/K completeness with no parent proof of protected
  outcomes; parent/foreign ordinary proof valid without exclusive-owner limits;
- historical meaning-equivalent variants, new Q-ID for stronger/uncertain
  claims, no dynamic expansion of old cluster coverage;
- regular normal grading genuinely testing every claimed essential competency,
  including the noncompensation and incidental-error counterexamples;
- feasible whole-unit block order across inherited, cluster, hidden and
  cross-subject prerequisite paths.

Existing CQR assessment readiness (`generateCurriculumQualityStatus.ts:2640–2700`)
and route checks establish weaker structural/task-presence requirements. The
old assessment-completion workflow actively tests its existing completion
profiles and corpus (`.github/workflows/assessment-completion.yml:88–95`),
but that is not evidence that the 6-November replacement contract is already
implemented. The root audit maps runtime-specific consequences separately.

### Most actionable verified gaps

1. Introduce and test a real global atomic prerequisite/minimality gate before
   broad migration; first inventory legacy findings instead of automatically
   adding/removing edges or silently downgrading them.
2. Repair/check the UUID discovery scope; canonical UUID format is presently
   outside the explicit UUID CLI's path glob and unasserted by runtime schema.
3. Give the general graph resolver an explicit ambiguity policy and test the
   cross-landscape missing/ambiguous references and cycle cases. Do not claim
   local graph DAG checks as global graph coverage.
4. Separate generated-status freshness from fachliche error gating in reports:
   source/QA facts currently bind CI via selected hard checks and ten protected
   maturity floors, not a universal reject-any-CQR-finding policy.
5. Keep optional real-package/full-OWL runs distinct from required PR self-tests;
   record which actual offering/profile each acceptance gate covers.

No fixes are authorized or applied by this audit note. No generated QA status
is recomputed. Remaining unmapped normative inventory items and exact negative
test gaps are work items, never implicit passes.

Additional read-only path probe: the UUID glob selected 1,242 paths at audit
time, but neither the canonical Math path nor any path resolving to that Math
file. Thus the discovery gap above is demonstrated by actual current path
enumeration, not inferred solely from the glob's spelling. No validator output
or CI status was fabricated from this probe.

## Technische Belege: Runtime und Zustandsprojektion

### CI-Kette und Leseschlüssel

Alle Dateipfade sind relativ zum Repository. Zeilen beziehen sich auf den
aktuell gelesenen lokalen Stand.

- **B**: `.github/workflows/ci.yml:715`, Job `backend-ci`; Aufruf bei `:773`:
  `python3 -B ../scripts/run_backend_ci.py --manifest "${BACKEND_FAILURE_MANIFEST}"`.
  `scripts/run_backend_ci.py:184` startet gegebenenfalls einen früheren
  Fehlerselektor mit `./gradlew test --fail-fast`; bei dessen Fehler wird bei
  `:190` beendet. Erst danach folgt bei `:198` der ungefilterte Pflichtaufruf
  **`./gradlew check`**, nicht `test build`. `backend/build.gradle.kts:76`
  konfiguriert `tasks.test` mit `useJUnitPlatform()`. Die gelesene Testkonfiguration
  hat keine Ausschlussliste für die unten genannten JUnitklassen. B bedeutet
  *im ungefilterten Backendtestbestand enthalten*, keinen aktuellen grünen Lauf.
- **F**: Job `frontend-ci`, `.github/workflows/ci.yml:347`. Bei `:440` läuft
  `npm run test:learner-learning-plans`; `app/package.json:47` nennt die konkreten
  API-/History-/UI-Tests. Dies ist kein automatischer Aufruf aller npm-Testskripte.
- Testkurzpfade in Tabellen: `service/X.java` bedeutet
  `backend/src/test/java/com/skillpilot/backend/service/X.java`;
  `completion/X.java` entsprechend unter `.../backend/completion/`;
  `claude/X.java` unter `.../backend/connectors/claude/v1/mcp/`.
- Runtimekurzpfade **LS**, **LP**, **CE**, **CP**, **CA**, **LPP** bedeuten
  `backend/src/main/java/com/skillpilot/backend/` plus
  `service/LearnerService.java`, `service/LearnerLearningPlanService.java`,
  `completion/CompletionEvaluator.java`, `completion/CompletionProfileCompiler.java`,
  `completion/CompletionApplicationService.java`,
  `completion/LearningPlanCompletionProjection.java`.
  Weitere Runtimeangaben wie `domain/…`, `openai/…`, `connectors/…` und
  `landscape/…` stehen unter demselben `backend/src/main/java/com/skillpilot/backend/`-Präfix.
- **durchgesetzt** bezeichnet die genannte enge Bedingung; **teilweise** nennt
  ihre Grenze; **Widerspruch** heißt aktive Altsemantik; **S1 offen** heißt kein
  entsprechender neuer Runtime-/CI-Vertrag. Ein Testname allein wird nicht als
  inhaltlicher Beweis benutzt.

### A. Persistenz und binäre explizite Ergebnisse

| ID | Eigenständige Bedingung | Runtime und konkreter Test | CI / Bewertung |
| --- | --- | --- | --- |
| M1 | Neue normale Mastery-Writes sind endlich und genau 0/1. | LS:3265 weist null/NaN/Inf/außerhalb 0–1 ab, :3273 zusätzlich Bruchteile. `service/LearnerGoalCompletionIntegrationTest.java:89` `fractionalWritesCannotCreateMasteryOrCompletionCredit` prüft die Ablehnung. | B; **durchgesetzt im normalen Servicewrite**. |
| M2 | Nicht jeder DB-Wert muss physisch ein Bool sein; Legacy-Grenze ausdrücklich erhalten. | `domain/Mastery.java:34` speichert `double`, Konstruktor :43 und Setter :61 erzwingen kein Bool. `db/changelog/changes/001-initial-schema.yaml:103` verwendet DOUBLE ohne 0/1-Check. | B prüft Serviceverhalten, **kein universeller DB-Binärconstraint**. Das ist eine wichtige Vertragsgrenze, kein Nachweis neuer Teil-Mastery. |
| M3 | Legacy-Lesen verwendet eine klare, endliche Schwelle. | `domain/Mastery.java:19` definiert 0.9, :21 prüft finite Werte. CA:203 verwendet dieselbe Funktion. `completion/CompletionApplicationServiceTest.java:69` `legacyThresholdUsesCurrentProjectedOutcomeAndNeverCreatesPartialMastery` prüft .9/.899/NaN/+Inf. | B; **durchgesetzt**, sagt nichts über C(q). |
| M4 | Signierte Wiederherstellung erhält alte explizite Werte und Zeitpunkte, statt sie still zu neuen Belegen zu machen. | LS:12808 schreibt `entryData.value()` und stellt bei :12819 den alten Timestamp wieder her; normaler Binärwrite wird dabei nicht aufgerufen. `service/LearnerServiceTest.java:529` `importLearnerPreservesCurriculumAndMasteryWhileDiscardingFocusFromIncompletePersonalization`; `service/LearnerGoalCompletionIntegrationTest.java:123` `importingMasteryOrCopyingLearnerNeverImportsCompletionCredit`. | B; **Kompatibilitätsweg vorhanden**. Kein Beweis, dass Import automatisch den strengeren neuen Q-Vertrag qualifiziert. |
| M5 | Ein normaler Coachwrite betrifft das aktive einzelne Ziel; Korrektur kann vorhandene Mastery senken. | LS:3313 lässt ausdrückliche Korrektur außerhalb der Frontier zu, :3351 speichert nur das aufgelöste Ziel. `service/LearnerServiceMasteryCorrectionTest.java:92` `setMastery_allowsExplicitDowngradeOutsideFrontier`; `claude/ClaudeV1MasteryContractTest.java:217` `completionWritesOnlyTheActiveGoalAndLeavesProgressionToTheCanonicalBackend`. | B; **durchgesetzt**, keine globale Rückwärtsschreibung auf Voraussetzungen. |

### B. Voraussetzungen, Projektion und Fokus

| ID | Eigenständige Bedingung | Runtime und konkreter Test | CI / Bewertung |
| --- | --- | --- | --- |
| P1 | Contains-Vererbung wird vor der Fokusauswertung auf dem strukturellen Graphen aufgelöst. | LS:7193, `computeEffectiveRequires` bei :12118 sammelt alle Contains-Eltern (:12137, :12174). `service/ProjectionRoleLearnerServiceTest.java:485` `normalFocusRetainsAnInternalRequirementInheritedFromAnOutsideAncestor`. | B; **durchgesetzt für aufgelöste strukturelle Eingaben**, keine vollständige R⁺-Prüfung daraus ableiten. |
| P2 | Vollständige transitive Hülle vor Fokus schneiden; Rückkehr in F bleibt berücksichtigt. | LS:7231 überspringt eine Anforderung außerhalb F einschließlich ihrer ganzen Kette. `service/ProjectionRoleLearnerServiceTest.java:472` `normalFocusCutsAnOutsideIntermediateBeforeFollowingItsReentryIntoTheFocus` erwartet bei :479 ausdrücklich das zu frühe Angebot des abhängigen Ziels. | B; **Widerspruch zum neuen Soll**. Der Test sichert die alte Cut-Semantik. |
| P3 | Ein direkt gemeisterter Zwischenknoten darf Q→B→A nicht bei B abschneiden. | CE:41 bricht bei `mastered[prerequisite]` ab. `completion/AutomaticCompletionTest.java:20` `masteredIntermediateStopsDemandFromAnOpenAssessment` erwartet :25 fälschlich Erlass von A. LS:7237 beschreibt dieselbe alte Vorbereitungsidee für normale Verfügbarkeit. | B; **Widerspruch**. `completion/CompletionCoreTest.java:160` prüft zwar den Nicht-Cut im separaten Reviewed-Pfad, ersetzt den aktiven Automatic-Pfad nicht. |
| P4 | Normalmodus lässt gültige echte Außenanforderungen unblocking, ohne Mastery zu erfinden. | LS:7190 wählt target∩F; :7231 überspringt Außenanforderungen. `service/ProjectionRoleLearnerServiceTest.java:446` `normalFocusUnionIgnoresValidOutsideRequirementsButPreservesInternalOrderAndMastery` prüft :465–468 keine zusätzlichen Writes. | B; **enge Außenfreigabe durchgesetzt**, jedoch P2/P3 verletzen die vollständige vorgeschaltete Hülle. |
| P5 | Strict behält globale Voraussetzungen. | LS:7190 setzt `prerequisiteScope=null`. `service/ProjectionRoleLearnerServiceTest.java:422` `strictSelectedTargetPrerequisiteOutsideFocusBlocksUntilStoredMasteryReleasesIt`; `service/ExamLearningScopeIntegrationTest.java:149` `strictExamFocusKeepsOutsidePrerequisitesAndAllNineTopicsAndThreeTasks`. | B; **teilweise**: direkte Außenanforderungen getestet; der reguläre Check LS:7206 iteriert eigene/geerbte direkte Requires, nicht allgemein R⁺. P3 bleibt. |
| P6 | Ungültige direkte Referenzen dürfen nicht durch Fokus optimistisch verschwinden. | LS:7212 blockiert fehlende direkte Composition-Referenzen; :7219 blockiert nicht als target/prerequisiteOnly deklarierte direkte Referenzen. `service/ProjectionRoleLearnerServiceTest.java:404` `unknownDirectPrerequisiteBlocksBothFrontiersInEitherMode`. | B; **durchgesetzt für direkte Composition-Referenzen**. LS:7216/7225 toleriert bestimmte alte geerbte Anforderungen; kein universeller Fail-closed-Graphvalidator. |
| P7 | prerequisiteOnly ist strukturelle Unterstützung, kein Progress-/Frontierziel. | LS:7190 verwendet targetGoalIds; `service/ProjectionRoleLearnerServiceTest.java:88` `missingRoleDefaultsToTargetAndPrerequisiteOnlyIsNotTargetOrTransitivelyInferred`, :105 `externalPrerequisiteOnlyGoalEntryHydratesExactlyOneStructuralGoal`. | B; **Rollenunterscheidung vorhanden**; daraus folgt weder Beherrschung noch offizielles Quellenmapping. |
| P8 | Clusteranforderungen berücksichtigen die relevante atomare Basis. | `service/ProjectionRoleLearnerServiceTest.java:500` `normalClusterRequirementAggregatesOnlyItsTargetChildrenInsideTheFocus`; :542 `normalClusterBasisTraversesOutsideClustersToTheirExplicitTargetDescendants`. LS:7710 aggregiert Kinder nach unten ohne Mastery-Writes. | B; **scopebezogene Aggregation getestet**. Vollständige neue atomare Hülle und bestehende Core-Kompatibilitätszweige sind gesondert zu migrieren; kein Beweis der gesamten neuen Graphreferenz. |
| P9 | Leere Frontier allein darf Fokus nicht verbreitern. | LS:8366 verlangt nichtleeren, tatsächlich erledigten Fokus; :8478 verlangt `scopeCompleted`. `service/LearnerServiceTest.java:2638` `blockedIncompleteFocusDoesNotTriggerAutomaticFocusWidening` prüft leere Frontier ohne setScope-Angebot. | B; **Guard durchgesetzt**, aber der Completion-Eingang verwendet noch alte Waivers. |
| P10 | Verbreiterung ist striktes Target-Superset mit mindestens einer offenen Ergänzung, nächster geeigneter Vorfahr zuerst. | LS:9229 prüft Superset, :9233 neue unmastered Ziele. `service/LearnerServiceReproTest.java:408` `getLearnerState_shouldOfferNearestAncestorWhenScopeCompleted`; :494 `completedFocusSkipsAncestorThatAddsOnlyAlreadyMasteredTargets`. | B; **Struktur-/Auswahlregel durchgesetzt**, globales neues C(q) noch nicht berücksichtigt. |
| P11 | Mehrere Wurzeln behalten den unabhängigen Zweig. | LS:9246 publiziert das ganze geordnete Replacement. `service/LearnerServiceTest.java:2759` `multiRootFocusWideningPreservesTheUntouchedPhysicsFocus`. | B; **durchgesetzt für den bestehenden Ablauf**. |
| P12 | Ein Angebot verbreitert nicht ohne ausdrücklichen Auswahlwrite. | LS:9110 veröffentlicht nur `setScope`/goalOptions; LS:9498/9514 ersetzt den Fokus erst im Schreibaufruf. `service/LearnerServiceReproTest.java:408` prüft das read-only Angebot, `service/LearnerServiceTest.java:2759` führt danach ausdrücklich setScope aus. | B; **Backend trennt Lesen und Auswählen**. Das beweist keine reale menschliche Zustimmung in einem Host; diese ist keine deterministische CI-Aussage. |

### C. Prüfungen, Beweisscope und historische Bedeutung

| ID | Eigenständige Bedingung | Runtime und konkreter Test | CI / Bewertung |
| --- | --- | --- | --- |
| Q1 | Ein normales Exam-Passurteil; unter passingPoints kein Masterywrite. | `openai/mcp/de/v1/OpenAiDeV1McpContractAdapter.java:2193`, `connectors/claude/v1/mcp/ClaudeV1McpContractAdapter.java:2077`, `connectors/gemini/v1/mcp/GeminiV1McpContractAdapter.java:1665` prüfen die Gesamtpunktgrenze. `claude/ClaudeV1MasteryContractTest.java:382` `failedExamAttemptDoesNotWriteAndSameExamCanBeEvaluatedAgain`; :444 `passedExamWritesMasteryAndReturnsFeedbackBeforeContinuationInstruction`. | B; **vorhanden**. Kein verstecktes zweites C(q)-Urteil implementiert. Der Backendservice allein nimmt kein earnedPoints-Feld an; Adaptervertrag und allgemeiner Write sind unterschiedliche Grenzen. |
| Q2 | Evaluation-Capability bindet Session, Ziel und Revision. | `claude/ClaudeV1ExamContractTest.java:121` `theEvaluationCapabilityIsBoundToSessionGoalAndRevision`, :132 `anEvaluationCapabilityFromAnotherSessionCannotSaveMastery`, :141 falsches Ziel, :149 Recall-Capability als Exam unzulässig. | B; **durchgesetzt auf diesem Adapterpfad**, keine unveränderliche historische Q-Bedeutung daraus ableiten. |
| Q3 | Freigegebene Rubrik ist formal vollständig und ihre Punkte passen zur Passgrenze. | Claude-Adapter:2434 validiert eindeutige Kriterien/finite positive Punkte/Text; :2450 verlangt Summe ≥ passingPoints und ≤ maxPoints. `claude/ClaudeV1ExamContractTest.java:163` `releasedExamEvaluationRequiresAUsableCriterionRubric`, :190 `releasedRubricMustSupportThePassMarkWithoutExceedingMaxPoints`. | B; **formale Rubrikvalidität vorhanden**; sie beweist nicht, dass fehlendes Kernverständnis rechnerisch nicht kompensierbar ist. |
| Q4 | Wesentliche Fehlvorstellung fällt regulär durch; beiläufiger Rechenfehler kann bestehen. | Die genannten Adapter prüfen Gesamtpunkte und Rubrikstruktur. Kein gelesener Runtime-/Fachtest verbindet alle erlaubten Bestehenswege mit vollständiger gewöhnlicher Zielbedeutung. | **S1/Fachpakete offen**; nicht durch `released` oder Q3 erfüllt. Fachliche Qualifikation bleibt zusätzlich erforderlich. |
| Q5 | C(q) ist ausschließlich qualifizierte unveränderliche gewöhnliche Atomabdeckung; ungeklärtes C(q)=∅. | Suche nach `getCoveredGoalIds()` im Produktionsbackend findet nur `landscape/ExamData.java:38` und Kopien in `ai/CoachStateProjection.java:259`, `ai/LearnerAiController.java:598`, `landscape/LandscapeService.java:669`. CE:54/60 leitet stattdessen aus `no_remaining_demand` ab; CP:51 kompiliert ohne qualifizierte Coverage. | **S1 offen; aktiver Ersatz widerspricht**. Keine CI-Durchsetzung der neuen Qualified-Coverage-Regel. |
| Q6 | Q1 beweist A sofort, obwohl Q2 A braucht und offen bleibt. | `completion/AutomaticCompletionTest.java:59` `sharedPreparationRemainsNecessaryUntilEveryActiveConsumerIsDone` erwartet :61 bei nur Q1 **keinen** Erlass. | B; **direkter Widerspruch**, nicht fehlender Randfall. Neuer unionsbasierter Nachweis fehlt. |
| Q7 | Direkte gewöhnliche Beherrschung, leere Nachfrage, Karten oder Orientierung erzeugen keinen neuen Prüfungsbeweis. | CE:60 erkennt jeden nicht benötigten Knoten an. `completion/AutomaticCompletionTest.java:38` erwartet Karten/Orientierung/ordinary implizit; :50 erwartet eine komplett prüfungsfreie, unbesuchte Scope als fertig. | B; **direkter Widerspruch**. :94 `implicitReasonsNeverInventAssessmentEvidenceForOrdinaryMastery` prüft nur das alte Reason-Format, macht die Anerkennung nicht zulässig. |
| Q8 | Unter gleicher Q-ID darf kein stärkerer/unklarer Anspruch alte binäre Ergebnisse aufwerten. | `domain/Mastery.java:26`/`:34` speichert Zielkey/Wert, keine damalige Q-Vertragsversion. Capability-Revisionsschutz Q2 verhindert nur aktuelle Replayfehler. Kein historischer All-variants-Nachweis oder New-Q-ID-Gate im gelesenen Completion-/Writepfad. | **S1 offen**. Ein heutiger Contenthash oder grüne Capability-Tests erfüllen diesen Quantor nicht. |
| Q9 | C(q)⊆Reach_R⁺(q), ohne Pfad→Coverage-Rückschluss oder dynamische Clustererweiterung. | Der alte CP kompiliert Requires/Contains, liest aber keine Qualified-Coverage. Der neue S0-Minimalitätsauditor prüft §7.3, nicht C(q). | **S1 offen**; keine Runtime-/CI-Abdeckung dieser neuen gerichteten Konsistenz. |

### D. Karten und rekursive Einheiten

| ID | Eigenständige Bedingung | Runtime und konkreter Test | CI / Bewertung |
| --- | --- | --- | --- |
| K1 | Jede erforderliche Karte braucht echten Verified-Recall-Pass. | LS:1401 prüft alle Karten, :1426 verlangt passed plus nichtleeres passedAt. `app/src/hooks/useSrsMastery.ts:185` benutzt alle verifizierten Karten. `service/LearnerServiceTest.java:3283` `verifiedRecallForSekOneFlashcardsStartsAndControlsSrsMastery`; :258 `publicPracticeSyncCannotCreateVerifiedRecall`. | B; **Verifikationsbedingung vorhanden**. Ein Practice-Sync kann sie nicht erfinden. |
| K2 | Aktueller veröffentlichter Node-Type-Vertrag fordert zusätzlich keine fälligen Karten. | `docs/concept/skill-graph/node-types.md:164` verlangt bei :165 keine fälligen Karten. LS:1401–1417 prüft nur Verified-Status, nicht nextReview. Hook:164 zählt due separat und benutzt ihn bei :185 nicht für Mastery. | **offener dokumentierter Widerspruch**. Bestehende Verified-Tests beweisen die No-due-Bedingung nicht. Vor Implementierungsbehauptung fachlich entscheiden/angleichen. |
| K3 | Fehlende/kaputte erforderliche Decks sind unavailable, nicht leere vollständige Mengen. | LS:1246/1256/1263/1272/1277 wirft im strikten Pfad. `service/AssessmentCompletionSrsIntegrationTest.java:99`, :103, :107 prüfen missing/unreadable/empty; :131 prüft valide Decks ohne alten Zustand als unmastered. | B; **strikter Completion-Input fail-closed**. Normalüberlagerung darf beschädigte Einzelziele auslassen und vorhandenen gespeicherten Wert behalten (LS:1385); das ist kein neuer positiver Nachweis. |
| K4 | Kein K-Abschluss durch eine gewöhnliche/Prüfungs-Waiverregel. | CP:48 beschreibt ausdrücklich nur Assessmentschutz; `completion/AutomaticCompletionTest.java:38`/`:46` erlässt cards. SRS-Inputschutz verhindert diesen späteren Waiver nicht. | B; **Widerspruch im Automatic-Pfad**, trotz K1/K3. |
| U1 | Eindeutiger Erwerbsowner, aufgelöste Pflichtvarianten und RequiredOwnQ-Abdeckung jedes eigenen gewöhnlichen Ziels. | `completion/CompletionScopeDefinition.java:6` beschreibt alte Programmscope, nicht rekursive LearningUnit. CE/CP haben keine Own-/RequiredOwnQ-/C(q)-Invariante. | **S1 offen**, kein entsprechender Runtime-/CI-Vertrag. Der neue mathematische Referenzchecker ist keine Produkttestabdeckung. |
| U2 | Rekursiver Abschluss = eigene effektive Ziele und alle Pflichtkinder, ohne neue Unit-Mastery. | CE:74/142 prüft flache Target-/Assessmentmengen; kein Child-Unit-Abschluss. | **S1 offen**; aktuelle Clusteranzeigen sind kein Ersatz für den neuen Einheitsvertrag. |
| U3 | Eltern-/Fremd-Q kann gewöhnliche Kompetenz belegen, ohne eigene Kind-Q/K zu bestehen. | CE:71 übernimmt nur explizite Assessments in passedAssessments; `completion/AutomaticCompletionTest.java:67` schützt eine Kontextprüfung. Aber C(q)-basierte Eltern-/Fremdanerkennung fehlt, und K4 verletzt die Kartenhälfte. | **teilweise alte Q-Sicherheit**, **neue Gesamtregel S1 offen**. |

### E. Globaler IST, Ereignisse, Doppelzählung und Cache

| ID | Eigenständige Bedingung | Runtime und konkreter Test | CI / Bewertung |
| --- | --- | --- | --- |
| G1 | M_eff ist die globale Union qualifizierter explizit bestandener Q und bleibt über Fokus-/Curriculumwechsel verfügbar. | LS:6785 berechnet Waivers aus dem aktuellen vollständigen Personal Curriculum; :6801 delegiert an den alten Evaluator. LPP:31 wählt alten Automatic/Reviewed-Evaluator. Kein historischer globaler C(q)-Registry-/Unionpfad gefunden. | **S1 offen**. Vollständige aktuelle Personal-Curriculum-Nachfrage ist nicht dauerhafte globale Beweisunion. |
| G2 | Gesamt-IST verwendet Vereinigungscredit, ohne explizit und implizit doppelt zu zählen. | LP:2579 zählt einen Set-Eintrag bei explicit **oder** waived. `service/LearningPlanAssessmentCreditTest.java:106` `inclusiveAndExplicitCountingShareOneFixedScheduleAndRealEvents`, :240 `laterExplicitCompletionDoesNotDoubleCountAndRevokedAssessmentReopensRemainingWork`. | B; **Zählmechanik vorhanden**, Quelle waived noch alt; der genannte Test akzeptiert teilweise alte Wiederöffnungssemantik. Keine neue C(q)-Abnahme. |
| G3 | Tages-/Wochenleistung zählt echte datierte explizite Transitions, keine neuen impliziten/Importereignisse. | LS:3353/2123 schreibt echte Transitions; `service/LearnerGoalCompletionService.java:42` prüft Threshold-Crossing, :62/68 liest nur observedTransition. LP:2582 filtert Datum/Plan/explizite aktuelle Mastery. `service/LearningPlanDailyProgressTest.java:47`, :109; `service/LearnerGoalCompletionIntegrationTest.java:123`. | B; **durchgesetzt für bestehende Ereignisrechnung**; Import übernimmt keinen Periodencredit. |
| G4 | Wiederholung ist History, keine zweite Tagescompletion. | `service/LearnerGoalCompletionService.java:43` unterscheidet Practice von Crossing; :55 bindet nur Practice-Evidenz. `service/LearnerGoalCompletionPracticeTest.java:17` `repeatedPracticalCompletionIsEvidenceButNeverDailyProgressCredit`, :38 erster Zeitpunkt unverändert. | B; **durchgesetzt**, gespeicherte Praxisgeschichte ist kein zusätzlicher Mastery-/Qualifikationsstatus. |
| G5 | Überschneidende Blöcke/Platzierungen zählen jedes Atom einmal. | LP:2557 nimmt Set von Plan-IDs; `service/LearningPlanDailyProgressTest.java:92` `overlappingBlocksCountEachGoalOnlyOnce`. `app/src/utils/treeCompletionProgress.ts:49` verwendet Atom-Map, :66 explicit vor implicit; Test `treeCompletionProgress.test.ts:25` enthält mehrfach platzierte shared-Atome. | Backend B **durchgesetzt**. Frontend-Test ist unter `test:level-completion` deklariert und wird tatsächlich in `.github/workflows/assessment-completion.yml:99` aufgerufen; der Browserlauf folgt bei `:108`. F:440 ist ein anderer Befehl. Die Prüfung ist daher nicht CI-inaktiv; ihre Workflow-Pfadfilter begrenzen den Aufruf. |
| G6 | Planmenge, Due-Dates und Periode müssen dieselbe Basis bilden. | LP:2564 weist Mengen-/Datumsfehler ab. `service/LearningPlanDailyProgressTest.java:102` `inconsistentPlanGoalAndScheduleBasisIsRejected`. | B; **durchgesetzt**, unabhängig von neuer Nachweisquelle. |
| G7 | Nur statische Compilation cachen, keine Lernendenergebnisse oder scopefremde Reuse. | CA:203 baut jede aktuelle Mastery-Menge neu; Cachekeys :260 enthalten Revision/Generation/Basis/Semantik. `completion/CompletionApplicationServiceTest.java:16` liest false→true→false und falsche Scope; :30 getrennte kanonische Basen. | B; **statische Cachegrenze getestet**. Die gespeicherte Revision ist noch kein historischer Q-ID-Garant. |
| G8 | Wiederholtes Lesen ändert keine Outcomes und zählt keinen Credit doppelt. | `completion/AutomaticLearningPlanCompletionProjectionTest.java:69` `repeatedReadsNeverCacheLearnerResultsOrDoubleCountExplicitMastery` liest mehrere Mastery-Snapshots. | B; **Caching/Dedup-Aspekt vorhanden**; :73 erwartet bei nur Q1 erneut keine Waiver und ist damit zugleich **Altsemantik-Widerspruch zu Q6**. |

### Was aus einem grünen CI-Lauf folgt und was fehlt

Die Tabellen enthalten 41 getrennte Prädikate mit konkreten Einschränkungen.
Nicht jede als durchgesetzt markierte Einzelbedingung macht ihren gesamten
Ablauf normkonform: Besonders Q1/Capabilityschutz und K1/SRS-Validierung koexistieren
mit dem falschen Automatic-Waiverpfad. Auch die korrekte explizite Ereignisrechnung
kann einen aus falscher Quelle erhöhten Gesamt-IST nicht legitimieren.

S1 braucht neue Gegenbeispiele an den tatsächlichen Service-/Adapter- und
Projektionseinstiegen für C(q), nicht nur Ersatzformeln im isolierten
Referenzchecker. Die ausdrücklich widersprechenden bestehenden Tests müssen
inhaltlich ersetzt werden. Historische ID-Stabilität, vollständige eigene
Prüfungspflichten und die globale Nachweisunion haben derzeit keinen harten
Produkt-CI-Vertrag. Ein manueller Markdown-/PNG-/PDF-Abgleich erfüllt diese
Lücke nicht. Das ist ein erwarteter offener Implementierungsstand, keine hier
vorgenommene Umstellung oder Freigabe.


## Provenienz

Die finale Quellenliste und SHA-256-Bindung der tatsächlich verwendeten Audit-
und Konzeptquellen wird mit dem abgeschlossenen Rule-ID-Abgleich ergänzt.
Diese Bindung beschreibt die gelesene Revision; sie simuliert keinen CI-Lauf.


