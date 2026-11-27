# TypeScript readers of composition roles — VR1

The source contract uses `projectionRole: voluntary` only on an atomic
`goalEntry` in source format 1.3. The shared reader rejects unknown roles and
versions and rejects this value in 1.0, the separate stage-plan format 1.1 and
1.2. Existing authored target/preparation sets keep their meaning. The compiler
additionally exposes disjoint atomic sets, including opaque-group descendants
and implicit, inherited preparation. These are separate measurements, not a
retroactive change of the authored target sets. An explicitly typed empty
cluster is structural and never enters an atomic denominator or the voluntary
set.

## Covered readers

| Reader | VR1 result |
| --- | --- |
| `app/src/utils/authoring/compositionViewAuthoring.ts` | Three roles and strict source-version binding; visible voluntary nodes retain their role. Conflicts, multiple/missing references or places, voluntary acquisition templates and mandatory target paths through voluntary atoms fail. The mandatory closure starts with effective target atoms; canonical inherited requirements apply, and dormant preparation remains optional. Mixed assessments are classified from their covered performances, including implicitly required assessment prerequisites. |
| `app/scripts/generateMathDurationCompositionViews.ts` | Goal-entry type accepts all three values. Retained source views use the strict reader; atomic target collection uses the shared effective role sets. Voluntary children cannot be collapsed into a mandatory prism subtree or silently rewritten as preparation. Compiled voluntary leaves do not enter the target comparison. A generated optional offer carries the 1.3 source header. All 18 current generated outputs pass `--check` unchanged. |
| `app/scripts/memoryCardReview.ts`; `app/scripts/generateCurriculumQualityStatus.ts` (Memory visibility parser) | Existing root-array diagnostics remain. Version/role validation now precedes role collection. Shared regular-target collection already excludes offers; the parser no longer accepts a third role hidden in an older format. No card-release, source, route or maturity rule is changed. |
| `app/scripts/generateCurriculumQualityStatus.ts` (`collectRenderedAtomicGoalIdsFromCompositionView`) | Rendered visibility is kept separate from regular route membership. The shared source-role set removes voluntary IDs from target-only and target-plus-preparation results, stage selection and additional visible anchors. The existing preparation collector and all existing IDs remain unchanged. An offer-only view returns no regular route IDs. This changes no individual route decision or quality policy. |
| `app/scripts/compositionViewSourceCoverage.ts`; its caller `app/scripts/generateCurriculumSourceCoverageAudit.ts` | Source targets require regular role membership as well as the existing rendered/applicability conditions. Visibility of an offer therefore creates no official target. Existing source-evidence rules are unchanged. |
| `app/scripts/lib/stateStageAtomCounts.ts` | Source format 1.3 is accepted through the shared strict reader. The existing exact `target` selector excludes offers and keeps stage/course filters. Current HE G8/G9 and BY stage counts match the actual Physics and Mathematics projection in 18 scopes. |
| `app/scripts/reportPhysicsSemiconductorLearningPath.ts` | Diagnostic parsing uses the shared version/role reader; declared and effective voluntary roles remain explicit, including fully qualified graph keys. No offer becomes `target` or `absent`. This bounded diagnostic remains separate from quality approval. |
| `app/scripts/lib/physicsViewPlacementTypes.ts`; `physicsFinalDiodeViewPlacements.ts`; `physicsFinalGoalBookAtlasTargets.ts` | Preservation types retain the third role. Fixed regular-target protections count only `target`; changing a required child into an offer cannot satisfy their existing floor. All 91 current diode placement paths retain their reviewed positions and unrelated metadata. |
| `app/scripts/lib/unitMaterialOrientationValidation.ts` | The existing first **target** opening obligation cannot be satisfied by a voluntary opening. No unit policy, pilot switch or E.1 assessment choice is migrated. |
| `app/scripts/generateRpPhysicsSourceExtraction.ts` | Preservation type accepts the third role; its existing preparation rewrite rejects a conflicting voluntary entry instead of silently overwriting it. Other view metadata continues to be copied. |
| `app/scripts/generateGermanSekICompositionViews.ts`; `generateHistorySekICompositionViews.ts`; `generatePoliticsEconomicsSekICompositionViews.ts` | These construct views from mapping/source decisions; they do not parse an existing two-role view. No new optional material is authored here. Their current 16/16/13 outputs pass `--check` unchanged. |
| `app/scripts/generateByEconomicsSourceExtraction.ts`; `generateHeMathSekiSourceExtraction.ts`; `generateHeMathSekiiSourceExtraction.ts` | The survey's `targetGoalIds` occurrences are source/mapping goal collections, not composition-role parsing or a fallback from an unknown role. No role conversion is needed. |
| `app/scripts/generateShPhysicsSourceExtraction.ts`; `generateSlPhysicsSourceExtraction.ts`; `generateSnPhysicsSourceExtraction.ts`; Physics placement-preservation helpers | The named historical velocity repair requires an exact `prerequisiteOnly` input and fails if it is changed. Preservation copies other JSON fields and roles. It does not interpret an offer as a regular target. No historical repair is broadened. |
| `app/scripts/goalBookModel.ts`; `goalBookSourceAtlasInputs.ts` | Both use the strict shared view parser and filter official occurrences with the shared regular-target set. Their target counts therefore exclude offers. Voluntary book/atlas presentation and the chapter projection belong to VR3; the chapter adapter is handled separately in VR1. |
| `app/scripts/prepareGoalBookCanonicalNavigationCandidates.ts` | The actual backbone and profile readers reject a compiled voluntary node before either subject candidate is written. This writer emits a fixed, target-only 1.0 navigation contract. Its catch-all supplement uses the published model, which cannot establish a page's current voluntary source role, so silently omitting an offer is also unsafe. Target-only 1.3 inputs remain supported; a role-preserving navigation successor belongs to VR3. The complete current Mathematics/Physics CLI outputs retain their exact prior bytes. |
| `app/scripts/lib/stagePlanCatalog.ts`; `app/src/utils/stagePlan.ts` | The independently bound, retained stage-plan format 1.1 still permits only its original two roles and rejects a third role before its legacy projection. Its contract is not relabeled 1.3 or relaxed. |
| `app/scripts/subjectExportCompositionViews.ts`; `buildSkillpilotExportPackage.ts`; `validateSubjectExportPackages.ts` | Source 1.3 uses the shared compiler for roots, inherited prerequisites, assessed clusters, conflicts and visible places. Registered preparation excerpts are loaded before semantic import checks. Conditional P templates and P subtree mentions may repeat; old formats keep wire validation without the new semantic checks. Missing canonical references fail. No new public field or foreign-graph adjunct is introduced. |
| `app/scripts/reportMathPhysicsNativeInventory.ts`; `MathPhysicsNativeProjectionInventory.java` | The native inventory covers 270 offered configurations (143 Mathematics, 127 Physics), 232 exact membership classes, zero unmatched views and zero seed-scope fallbacks. Bitset integrity and all 18 deck references pass. |
| `CompositionViewService` and `LearnerService.collectCompositionViewGoalReferences` | The repository reader accepts the third role in format 1.3. Until VR2 implements voluntary study, the learner projection refuses a scope containing `voluntary` or an unknown role. An omitted role selects `target`. The public learner-scope case is `LearnerProjectionRoleBoundaryTest.source13OfferIsAcceptedByRepositoryReaderButLearnerScopeRefusesIt`. |
| `scripts/physics_arrow_route_validation.ts`; `physics_arrow_applicability_review.ts` | Actual seed/offer counts use the shared regular target set. The retained A2/W1 proof additionally asserts its specific two-role source decisions; it does not silently approve a voluntary arrow or task as a regular one. Its individual historical decisions are not migrated. |

`nationalStageProjection.ts`, the WebGUI composition/personal-curriculum adapters
and `goalBookChapterProjection.ts` are handled by the coordinating agent.
Full-standalone package readers are handled in the package work stream. The
coordinator handles the separate R0 OWL reader correction; literal role transport
alone does not prove its schema/version roundtrip.

The ordinary export has a concrete foreign-evidence limit. Its registered
preparation excerpts bind the listed atom edges, but do not carry the complete
foreign canonical body and its parent requirements. A new 1.3 learning path
through an unresolved foreign goal, or through such an incomplete excerpt,
fails closed with the full-standalone package as the supported alternative.
The validator does not assume that an unbundled foreign prerequisite is absent.
Legacy foreign declarations retain their previous behavior. This delivery adds
no public evidence field or trust model to the ordinary package format.

## Quality boundary

The subject-specific source, route, card and maturity semantics remain VR4.
For example, `physicsQaStageTargets.ts` explicitly rejects an unsupported role
before its former non-preparation target branch; it cannot silently count an
offer as a target. These fail-closed guards are not relaxed here. The shared
collector's target set stays regular throughout `learningUnitContracts.ts`,
`compositionStageRouteMembership.ts`, semantic-route inventory and the existing
coverage readers. Historical one-time migration scripts are not repurposed as
generators for new voluntary content. No actual view, goal, source witness,
assessment policy or quality pin is migrated by this audit.

The bounded follow-up search covered native non-test TypeScript, Java and Python
`projectionRole` readers/emitters and compared them with this table. It excludes
published snapshots, frozen evidence, one-time authoring migrations and the VR2
native learner-selection work. `hePhysicsQuantumScope.ts` is a fixture helper
with test-only callers. The Math CPV-210/211/214/215 helpers in
`validateCompositionViews.ts` and `canonicalMathSek1ReviewedExamRoutes.ts` still
express their existing **visibility** obligations. Their individual route and
assessment-evidence decisions remain VR4; the shared regular-target denominator
above is corrected independently.

## Verification

- `testCompositionProjectionRoles.ts` includes the focused voluntary compiler
  controls, `testGoalBookCanonicalNavigationRoles.ts` and existing
  projection/Memory regressions; preparation placements,
  child order and stage-plan/nested-plan contracts also pass.
- `testMemoryVisibilityStatusParity.ts` checks accepted 1.3 offers, unchanged
  regular Memory duty, older-format rejection and unknown-version rejection in
  both raw Memory parsers.
- `testPhysicsSemiconductorLearningPathReport.ts` passes five cases, including
  voluntary goal/task roles and qualified graph references.
- `testStateStageAtomCounts.ts`, `sourceCoverageAndApplicabilityRegression.test.ts`
  (25 tests), `testPhysicsSemiconductorSourceRepair.ts` (91 placement paths) and
  `testUnitMaterialOrientations.ts` (14 negative probes) pass. A voluntary atlas
  child also has an explicit negative control in `testPhysicsGoalBookInputs.ts`.
- `testSubjectExportVoluntaryTransport.ts` exercises 24 hostile variants,
  ordinary source export, exact regular/preparation membership through all 387
  existing view exports, conditional P templates, old-format specificity and
  missing/incomplete foreign evidence. Subject-export script type checking passes.
  The complete `test:subject-export-package-contracts` suite passes. The retained
  ordinary 1.3 ZIP passes all 67 import checks with the corrected validator; its
  original outer hash remains unchanged.
- `measure-composition-role-parity.ts` compares all 387 real views against
  `7fea24d7c5`, with all 21 canonical subject roots in the graph universe:
  90 Physics, 100 Mathematics and 197 other views. Authored targets/preparations,
  compiled previews and findings are compared separately from the new induced
  atomic sets. Raw per-view data is retained outside the repository and bound
  by the main dossier.
- `testDirectAtomicRouteCoverage.ts` passes nine tests, including actual rendered
  route IDs with an offer, preparation, implicit preparation, stage selection,
  additional anchors, offer-only input and older-format rejection.
- `measure-reader-parity.ts` compares all 387 current views in 3,096 rendered-ID
  cases (default/SekI/SekII/CrossStage, target-only/with preparation), with zero
  differences. Default membership totals remain 133,167 target IDs and 253,117
  target-plus-preparation IDs. All 577 navigation tree/profile comparisons match
  the takeover writer, including the current published Math/Physics memberships.
  `measure-navigation-candidates.ts` invokes both complete CLI writers with
  external output paths: both current candidate files match the takeover bytes,
  target-only 1.3 works, and a Physics offer rejects before either candidate is
  written. Raw reports are retained outside the repository.
- Supplemental strict checking of the QA/navigation import graph has the same
  44 pre-existing diagnostics before and after these two reader fixes, with zero
  introduced diagnostics. This ad hoc comparison is not a green repository type
  check; the configured subject-export script type check above remains separate.

## CI wiring

- Main `ci.yml` runs `test:composition-projection-roles`, which imports the
  voluntary compiler and navigation fixtures, and `test:graph-gate-contracts`,
  which runs the rendered-route fixture.
- Main `ci.yml` runs `test:full-standalone-package-builder`, including Python
  `test_composition_view_package_boundary.py` and its source-1.3/runtime-1.4
  roundtrip and hostile cases. Backend tests run through the normal Gradle suite.
- The ordinary source/RDF controls belong to
  `test:subject-export-package-contracts`; the optional OWL workflow's subject
  release gate invokes that suite and its configured type check. They are not a
  direct step in the main PR aggregate. The semantic OWL job separately invokes
  its roundtrip tests.
- The Python package-boundary test already checked generator freshness in the
  standalone builder suite. That positive check was missing from the first reader survey.
  The main CI's `curriculum-integrated-build` runs
  `test:full-standalone-package-builder`. The suite executes
  `generate_curriculum_package_v14_contracts.py --check` before building.
  Its regression control changes a generated file in a private copy and checks
  that the generator rejects it.

These are automated software checks and reproducible measurements. They are no
learner assessment, independent content review, production deployment or host
acceptance.

The coordinator renewed the W1 successor binding for final QA source SHA-256
`2dca68028defa2de43b2a08c38fa54c13a5e0a9976b75fe2a146f3662cf7e363`
and reran the complete Physics goal-book input check successfully; the retained
log is `checks/w1-readers-route-filter.log` in the external VR1 review directory.
The original W1 evidence and its check remain intact.
