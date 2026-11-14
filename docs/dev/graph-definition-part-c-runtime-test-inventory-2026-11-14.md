# Graph Definition part C: runtime test inventory

Snapshot: 14 November 2026, main `8ebcfbab67`. Follow-up to the
[hard-gate plan](cqr-gvr-hard-gate-plan-2026-11-12.md), section 11.

## Purpose

After the Gymnasium hardening, 28 of the 36 part-C rules in the
[Rule-to-Milestone Matrix](../qa-ci/graph-definition-rule-milestone-matrix.md)
are not `HARD`. Most of them state runtime behaviour: frontier, mastery,
progress, closure and filters. The curriculum gates (`GVR`, `CQR`) cannot reach
these claims. This inventory records which of them existing automated tests
already prove.

It changes no grade. Whether runtime tests become a registered gate family is
an owner decision.

## Method and limits

- For each row, the part of the rule that the register names as ungated (the
  residual) was compared with the existing tests in `backend/src/test` and
  `app/`.
- "Required CI" means backend JUnit in the job `backend-ci` (`./gradlew check`;
  complete tier only, a draft pull request compiles but does not run it), or
  an `app` test invoked from `.github/workflows/ci.yml` or `run_ci.sh`.
- `COVERED`: required CI exercises the whole residual, including a negative
  case. `PARTLY`: tests exist but leave part of the residual open. `NONE`: no
  test. `NOT EXECUTABLE`: nothing a test could check today.
- The inventory was made by reading code and tests. No test was executed for
  it; the cited test methods were checked to exist. The divergences listed
  below are code readings, not reproduced failures.

## Result

| Verdict | Rows | Count |
| --- | --- | ---: |
| `COVERED` | `GD-C10`, `C12`, `C13`, `C18`, `C34`, `C35` | 6 |
| `PARTLY` | `GD-C01`, `C02`, `C03`, `C06`, `C09`, `C14`, `C20`, `C23`, `C24`, `C26`, `C27`, `C28`, `C29`, `C30`, `C31`, `C32`, `C33` | 17 |
| `NONE` | `GD-C04`, `C36` | 2 |
| `NOT EXECUTABLE` | `GD-C25` | 1 |
| No runtime residual | `GD-C21`, `C22` (static route obligation `GVR-012`) | 2 |

Two limits apply to every `COVERED` verdict:

- Global implicit mastery is not implemented (`GD-C25`). The tests prove the
  rules over explicitly stored mastery only.
- `GD-C12` and `GD-C13` hold for the evaluator shared by frontier, completion
  and Personal Curriculum scope (`CompletionProfileCompiler`). The
  learning-plan scheduler in `LearnerService` uses a separate, older derivation
  without closure through goals outside the plan; the closure tests do not
  cover it.

## Rows

Backend tests live under `backend/src/test/java/com/skillpilot/backend/`.

| Rule | Residual | Verdict | Main evidence | Open |
| --- | --- | --- | --- | --- |
| `GD-C01` | Closure over paths of at least one edge, separate inverse, cycle check per relation | `PARTLY` | `AutomaticCompletionTest::everySmallDagAndBinaryAssignmentMatchesIndependentTransitiveReachability`, `CompletionCoreTest::exhaustiveSmallDagsMatchIndependentTransitiveFixedPoint`, `PersonalCurriculumLearningScopeTest::canonicalUnknownReferencesAndRawCyclesUseExistingCompilerFailures` | The frontend inheritance code is tested only indirectly. |
| `GD-C02` | A reversed learning-flow diagram states the inversion | `PARTLY` | `app/scripts/testLearnerMapProjection.ts` (edge direction in the data) | No test that a rendered diagram states it. |
| `GD-C03` | Identity survives language, placement, view, version and migration | `PARTLY` | `CompletionCanonicalGraphResolverTest`, `GoalMappingServiceTest::rejectsConflictingMappingsForSameLegacyGoalId`, `LearnerServiceCanonicalProjectionTest` | Fixed cases only; no generic check that stored learner keys survive a release or a placement change. |
| `GD-C04` | Strictly positive weight; intelligible descriptions below `M7` | `NONE` | – | Nothing rejects a non-positive weight. Description quality is a review matter. |
| `GD-C06` | Semantic limits of `phase`, tags, `level`, `core`, `weight` | `PARTLY` | `LearnerPersonalizationProgressionIntegrationTest::orientationClassificationPrefersSemanticKindAndUsesOnlyExplicitLegacyTagsAsFallback` | Only "tags never replace the goal type", and only for orientation. |
| `GD-C09` | Atomic basis at runtime; several paths count once | `PARTLY` | `AutomaticCompletionTest::inheritedAndClusterRequirementsAreExpandedIntoDirectAtomicEdges`; `app/src/utils/treeCompletionProgress.test.ts` | No backend case with a `contains` diamond; the frontend case is outside required CI. |
| `GD-C10` | All prerequisites must be met; no hidden alternative | `COVERED` | `AutomaticCompletionTest::anAdditionalDirectEdgeKeepsThePrerequisiteNecessary`, `ProjectionRoleLearnerServiceTest::richFrontierRetainsTransitiveDemandAcrossMasteredIntermediate` | – |
| `GD-C12` | Effective requirements are the own ones plus those of every ancestor | `COVERED` | `AutomaticCompletionTest::inheritedAndClusterRequirementsAreExpandedIntoDirectAtomicEdges`, `CompletionCanonicalGraphResolverTest::incomingForeignAncestorsInheritRequirementsWithoutImportingUnrelatedSiblings` | Plan scheduler, see above. |
| `GD-C13` | Expand to atoms, then close; a mastered intermediate never cuts the closure | `COVERED` | `AutomaticCompletionTest::requiredClusterKeepsItsAtomsTransitivePreparationAfterThoseAtomsAreMastered`, `LearnerFrontierInvariantTest::frontierRetainsTransitiveDemandWithMasteredIntermediate` | Plan scheduler, see above. |
| `GD-C14` | The atomic relation is acyclic at runtime | `PARTLY` | `AutomaticCompletionTest::invalidGenerationReferencesAndCyclesStillFailClosed`, `CanonicalRequiredLearningGateTest::currentCatalogLearningScopesRetainEveryCanonicalAcquisitionTarget` | Checked per reachable context, not over every atom of the catalog. |
| `GD-C18` | An unresolved reference never counts as a satisfied prerequisite | `COVERED` | `ProjectionRoleLearnerServiceTest::unknownDirectPrerequisiteInvalidatesAllFrontierPathsInEitherMode`, `::unknownReferenceBehindMasteredOutsideIntermediateFailsClosedInAllFourPaths` | – |
| `GD-C20` | Learnability from a declared entry state is a separate claim | `PARTLY` | Cycle tests; `LearnerFrontierInvariantTest::frontierMatchesReferenceForQ22Scope` | No learnability witness from empty mastery to complete targets. |
| `GD-C23` | Overview edges derive from atomic reachability | `PARTLY` | `app/scripts/testLearnerMapProjection.ts` | No test that frontier and progress ignore summary edges. |
| `GD-C24` | One binary stored state per atom | `PARTLY` | `LearnerGoalCompletionIntegrationTest::fractionalWritesCannotCreateMasteryOrCompletionCredit` | The write path is proven; import and legacy reads are not. |
| `GD-C25` | Global implicit mastery | `NOT EXECUTABLE` | – | Not implemented. |
| `GD-C26` | Cluster satisfaction needs the full atomic basis; no write to children | `PARTLY` | `ProjectionRoleLearnerServiceTest::normalClusterBasisRetainsAnExtensionWhenItsGlobalCoreSiblingIsOutsideFocus`, `::dependentMasteryNeverGrantsOrSuppressesItsUnmasteredPrerequisite` | The plan-blockage text and the rejection of a cluster write are untested. |
| `GD-C27` | Frontier over the full transitive atomic demand | `PARTLY` | `LearnerFrontierInvariantTest::frontierRetainsTransitiveDemandWithMasteredIntermediate`, `::frontierMatchesReferenceForQ22Scope` | Explicit mastery only. |
| `GD-C28` | Separate cluster frontier | `PARTLY` | `LearnerFrontierInvariantTest::stateMachineGoalOptionsRemainAtomicWhenPossible` | No case of a cluster blocked by its own or inherited demand. |
| `GD-C29` | Weighted progress over unique target atoms | `PARTLY` | `app/src/utils/treeCompletionProgress.test.ts`, `app/scripts/testLevelCompletionUi.tsx`, `PersonalCurriculumLearningScopeIntegrationTest::masteredPreparationStaysInTheSameProgressDenominatorWithoutRepetitionOrWrites` | The `app` tests run only in the path-filtered workflow `assessment-completion.yml`. |
| `GD-C30` | Explicit and implicit progress shares | `PARTLY` | Same `app` tests | Outside required CI; the global union is not implemented. |
| `GD-C31` | Applicability filter per dimension | `PARTLY` | `app/src/utils/courseProfileFilters.test.ts`, `CompletionApplicabilityTest::unresolvedAndUnsupportedDimensionsNeverBecomeImplicitPermission` | An explicit empty value set and per-dimension evaluation are untested. |
| `GD-C32` | Runtime evaluates compiled applicability | `PARTLY` | `LandscapeServiceTest::localizedCanonicalPhysicsUnionsRegistryOverridesAndDerivedApplicability` | No comparison of the runtime merge with the applicability compiler. |
| `GD-C33` | Closure before restriction; identity kept | `PARTLY` | `PersonalCurriculumLearningScopeTest::everySmallDagAndNonemptySeedUnionMatchesIndependentTransitiveReachability`, `::missingEmptyOrNonAtomicSeedsFailClosed` | The Personal Curriculum path is proven; an older projection path is not. |
| `GD-C34` | Normal and strict focus | `COVERED` | `ProjectionRoleLearnerServiceTest::strictSelectedTargetPrerequisiteOutsideFocusBlocksUntilStoredMasteryReleasesIt`, `::normalFocusUnionIgnoresValidOutsideRequirementsButPreservesInternalOrderAndMastery` | – |
| `GD-C35` | Mediated transitivity across the focus boundary | `COVERED` | `ProjectionRoleLearnerServiceTest::redundantShortcutPreservesAllFourFrontierPathsAcrossMasteryModesAndFocusBoundaries` | – |
| `GD-C36` | Complete list of missing atoms, split by focus | `NONE` | – | No such diagnostic exists. |

## Divergences between rule and code

Noted while reading. Each needs its own check before anyone acts on it.

- **Weights (`GD-C04`, `GD-C29`).** `app/src/utils/treeCompletionProgress.ts`
  replaces a non-positive weight with 1 instead of rejecting it. In the
  canonical catalog every atomic goal has a positive weight; 19 clusters have
  weight 0 (18 in Politik und Wirtschaft, 1 in Wirtschaftswissenschaften).
- **Self-dependency (`GD-C14`).** `LearnerService.computeEffectiveRequires`
  drops an inherited self-dependency silently, and
  `LearnerServiceTest::computeEffectiveRequires_dropsSelfDependencyFromInherited`
  asserts that.
- **Binary state (`GD-C24`).** The learner import restores stored values
  without a binary check, and stored legacy values from 0.9 read as mastered.
- **Cluster aggregation (`GD-C26`).** The `core`-biased aggregation is still
  used for the plan-blockage text (`LearnerService.describeLearningPlanBlockage`).
- **Progress (`GD-C29`).** `app/src/hooks/useMasteryCalculation.ts` sums along
  every `contains` path, so a goal with two parents counts twice.
- **Filter (`GD-C31`).** `goalMatchesFilter` in `app/src/utils/goalFilters.ts`
  cannot tell an explicit empty value set from an omitted dimension; both pass.
- **Hidden children (`GD-C33`).** `LearnerService.applyAuthoredAtomicEntries`
  turns a target cluster without visible children into an atom.

## Smallest additions

Test code only; no curriculum data is involved.

1. Run `npm run test:level-completion` in `.github/workflows/ci.yml`. Its
   existing negative cases then count for `GD-C29`, `GD-C30` and the frontend
   part of `GD-C09`.
2. `GD-C14`: in `CanonicalRequiredLearningGateTest`, validate the context of
   every canonical atom, not only the offered scopes.
3. `GD-C09`: one backend case with a `contains` diamond.
4. `GD-C28`: one backend case where a cluster stays out of the frontier until
   its own or inherited atomic demand is mastered.
5. `GD-C26`: a cluster mastery write is rejected; a plan-blockage case with a
   mastered basic-course child and an open advanced-course child. The second
   case is expected to fail today and would expose the divergence above.
6. `GD-C20`: a learnability witness in the catalog gate test, starting from
   empty mastery.
