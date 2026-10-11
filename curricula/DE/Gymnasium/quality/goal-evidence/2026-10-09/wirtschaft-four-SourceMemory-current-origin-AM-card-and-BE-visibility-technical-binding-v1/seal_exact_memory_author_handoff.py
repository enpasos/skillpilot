from pathlib import Path
import datetime
import hashlib
import json

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
E = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence'


def binding(path):
    path = Path(path)
    raw = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'wholeBytes': len(raw)}


def write(name, value):
    path = OUT / name
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return binding(path)


def load(name):
    return json.loads((OUT / name).read_text())


now = datetime.datetime.now(datetime.timezone.utc).isoformat()
can = load('whole-CAN485-only-one-new-BB2-memory-node-and-one-source-navigation-child.inert-author-candidate.json')
goals = {g['id']: g for g in can['goals']}
bb_ids = ['f478f85e-87b1-505e-979a-8de1b3141019', '72f45efc-459e-5407-b946-1bb1968135d2']
bb_snapshot = write('two-whole-current-BB2-origin-goals.exact.snapshot.json', {
    'wholeCAN': binding(OUT / 'whole-CAN485-only-one-new-BB2-memory-node-and-one-source-navigation-child.inert-author-candidate.json'),
    'wholeCurrentOrdinaryOrigins': [goals[g] for g in bb_ids],
    'newOrdinaryContractsAuthored': False,
    'newMemoryMetadataIndependentReview': 'pending Root',
})

foreign_specs = [
 ('2026-10-08/wirtschaft-BE18-whole-P36-tax-AM-and-eleven-cards-independent-review-20261009-v1', 'actual-final-independent-whole18-P36-tax-AM-and-eleven-cards.receipt.json', 'Historical independent whole18 AM and cards; valid unchanged science retained.'),
 ('2026-10-08/wirtschaft-BE18-whole-P36-tax-AM-and-eleven-cards-independent-review-20261009-v1', 'eighteen-individual-independent-whole-positive-P36-tax-atomicity-and-current-memory-judgments.json', 'Individual old science dispositions; procedure/ground split uses the later foreign Root successor.'),
 ('2026-10-08/wirtschaft-BE18-whole-P36-tax-AM-and-eleven-cards-independent-review-20261009-v1', 'eleven-individual-independent-whole-card-correctness-comprehensibility-and-necessity-judgments.json', 'Individual necessary KEEP cards and genuine procedural REMOVE; no re-review.'),
 ('2026-10-08/wirtschaft-BE18-whole-P36-tax-AM-and-eleven-cards-independent-review-20261009-v1', 'actual-targeted-card-removal-and-register-memory-rationale-successor-review.json', 'Ten exact retained cards; removed procedural card not reintroduced.'),
 ('2026-10-08/wirtschaft-BE18-whole-P36-tax-AM-and-eleven-cards-independent-review-20261009-v1', 'actual-independent-targeted-current-memory-node-v4-binding-review.json', 'Old three-node deck binding successor, not an actual new operational visibility claim.'),
 ('2026-10-09/wirtschaft-BE21-independent-root-P6-ground-procedure-source125-and-purpose-origin-delta-v1', 'actual-independent-three-P6-atomicity-memory-purpose-origin-and-source125-italic-scope-finding.receipt.json', 'Foreign Root ground/procedure separation and purpose-card origin judgment.'),
 ('2026-10-09/wirtschaft-BE21-independent-root-P6-ground-procedure-source125-and-purpose-origin-delta-v1', 'actual-three-individual-whole-P6-AM-atomicity-and-source-scope-delta-decisions.json', 'Ground none; procedure required with unchanged collective-creditor-purpose card and current2790 origin.'),
 ('2026-10-08/wirtschaft-BE-two-gaps-f0-and-Berlin-BB2-independent-bounded-need-P-AM-M-review-20261009-v1', 'actual-final-independent-two-gaps-f0-BE-BB2-bounded-review.receipt.json', 'Historical foreign product-card and memory judgment.'),
 ('2026-10-08/wirtschaft-BE-two-gaps-f0-and-Berlin-BB2-independent-bounded-need-P-AM-M-review-20261009-v1', 'two-whole-product-card-and-memory-node-independent-minimum-necessity-judgments.json', 'Two whole product DE/EN cards necessary KEEP.'),
 ('2026-10-08/wirtschaft-BB-two-foundations-independent-a-content-source-AM-review-v1', 'actual-independent-whole-two-BB-goals-P4-source-tax-AM-and-V3V4-closure.receipt.json', 'Our earlier independent A actual science KEEP for two DE cards and required decisions; we now author new metadata only, Root must review the new node/deck/origin/placement delta.'),
 ('2026-10-09/wirtschaft-BB2-two-honest-native-positive-and-existing-visual-intake-author-v1', 'actual-final-two-BB2-honest-native-P-v2-current-reviewed-PNG-import-and-bounded-QA315.receipt.json', 'Latest technical successor expressly retains foreign memory_required without new card visibility approval.'),
 ('2026-10-09/wirtschaft-BE-P13-P26-Montan-independent-whole-positive-source-need-atomicity-memory-review-v1', 'actual-new-Montan-individual-whole-Need-AM-tax-minimal-prerequisite-and-memory-review.json', 'Foreign current fab no-memory disposition retained.'),
 ('2026-10-09/wirtschaft-BE-three-source-rests-director-cycle-EU-independent-whole-performance-need-review-v1', 'actual-independent-one-new-director-whole-Need-atomicity-AB2-minimal-requires-and-memory-KEEP.json', 'Foreign current912 no-memory disposition retained.'),
 ('2026-10-09/wirtschaft-by-ten-current311-specific-native-preparation-technical-v1/current300-source35-scope2-contract479-selective-technical-v1', 'actual-final-technical-handoff.receipt.json', 'Previously accepted current11 AM successors; genuine exact record reuse, not fresh approval of stale records.'),
 ('2026-10-09/wirtschaft-by-ten-current311-specific-native-preparation-technical-v1/current300-source35-scope2-contract479-selective-technical-v1', 'memory.review.jsonl', 'Eleven whole valid current records exact; other300 original Root records exact.'),
]
foreign = []
for directory, filename, reason in foreign_specs:
    p = E / directory / filename
    if p.suffix == '.json':
        json.loads(p.read_bytes())
    else:
        for line in p.read_bytes().splitlines():
            if line.strip():
                json.loads(line)
    foreign.append({**binding(p), 'reuseBoundary': reason})

native_source_paths = [ROOT / 'app/scripts/memoryCardReview.ts', ROOT / 'app/scripts/memoryCardReviewConfigDiscovery.ts', ROOT / 'app/scripts/applicabilityCompiler.ts', ROOT / 'app/scripts/generateCurriculumQualityStatus.ts', ROOT / 'backend/src/main/java/com/skillpilot/backend/service/LearnerService.java', ROOT / 'scripts/validate_schemas.py', ROOT / 'docs/landscape-runtime.schema.json', ROOT / 'contracts/curriculum-package/v1/composition-view.schema.json']
native_sources = [binding(p) for p in native_source_paths]
export_path = Path('/tmp/economics-SourceMemory-current-independent-native/app/scripts/quality-production-readonly-export.ts')
quality_raw = (ROOT / 'app/scripts/generateCurriculumQualityStatus.ts').read_bytes()
export_raw = export_path.read_bytes()
assert export_raw.startswith(quality_raw)

before = load('actual-technical-authoring-inputs.before.guard.json')
after = []
changed = []
for original in before['files']:
    actual = binding(ROOT / original['path'])
    after.append(actual)
    if actual != original:
        changed.append({'before': original, 'after': actual})
assert not changed, changed
guard = write('actual-technical-authoring-inputs.after-whole-byte-guard.json', {
    'capturedAt': now,
    'before': binding(OUT / 'actual-technical-authoring-inputs.before.guard.json'),
    'captureTiming': 'After actual native checks and before author handoff sealing; original before guard was captured after historical whole input reads, not before all reading.',
    'frozenInputCount': len(after), 'changedCount': len(changed), 'changes': changed, 'files': after,
})

own_names = [
 'four-whole-existing-memory-nodes-and-nine-current-whole-origins.exact.snapshot.json',
 'four-decks-twelve-whole-DEEN-cards-exact-portable-input-and-target-index.json',
 'one-additional-BB2-definitions-memory-node.exact-two-foreign-KEEP-DE-cards.author-candidate.json',
 'two-whole-current-BB2-origin-goals.exact.snapshot.json',
 'memory-deck-drafts/de_gymnasium_economics_science_disciplines_recall.de.json',
 'whole-CAN485-only-one-new-BB2-memory-node-and-one-source-navigation-child.inert-author-candidate.json',
 'five-whole-memory-kinds-deck-SRS-and-origin-author-boundaries.json',
 '108-explicit-BE-course-variant-memory-only-placement-successors.portable-index.json',
 'memory-full336.review.jsonl', 'memory-full-current.cards.review.jsonl',
 'memory-source25-only.review.jsonl', 'memory-source25-only.cards.review.jsonl',
 'twelve-retained-scientific-card-keeps.native-author-envelopes.json',
 'two-BB2-retained-scientific-card-keeps.new-native-deck-author-envelopes.json',
 'memory-full-current-origin-only.native-author.successor-v2.config.json',
 'memory-source25-only.native-author.config.json',
 'actual-author-current-AM-bridge-review-input-and-delta-summary.json',
 'actual-native-current485-goal-card-fingerprints.json',
 'actual-eleven-existing-foreign-KEEP-current485-AM-record-reuse.check.json',
 'actual-native-five-memory-origin-applicability-108-projections-card-only-boundaries-and-national-scope.result.json',
 'actual-native-three-memory-checks-and-full-BE-visibility-diagnostic.receipt.json',
 'actual-native-origin-compiler-and-108-card-course-projections.command.receipt.json',
 'actual-schema-whole-parse-LF-and-required-curriculum-symlink-check.receipt.json',
]
index = write('actual-portable-whole-five-memory-eleven-origin-fourteen-card-and-108-placement-Root-review-index.json', {
    'createdAt': now, 'role': 'Inert technical metadata author handoff requiring independent Root delta judgment',
    'ownWholeReviewInputs': [binding(OUT / n) for n in own_names],
    'validHistoricalScienceBindings': foreign,
    'actualNativeImplementationBindings': native_sources,
    'nativeProductionProjectionExport': {'wholeProductionPrefixExact': True, 'productionSource': binding(ROOT / 'app/scripts/generateCurriculumQualityStatus.ts'), 'additionalExportOnly': 'collectRenderedAtomicGoalIdsFromCompositionView', 'dependencyCapsuleOutsideCurricula': True},
    'freezeGuard': guard,
    'portableReviewInputMechanism': 'All own whole review inputs are regular committed-candidate files or repository-relative references to regular repository candidate inputs. No absolute scratch symlink is a review input. Dependency/PDF caches are outside curricula.',
    'minimalCanonicalCandidateDelta': {'newMemoryGoalId': '1d50c57f-14f2-50f3-8fe7-d102ffcb1099', 'sourceNavigationGoalId': '9658d512-618c-56ab-aecf-14aaec1005f4', 'sourceNavigationContains': 'append exactly the new memory ID', 'other483WholeGoals': 'exact original CAN484V8', 'newOrdinaryGoals': 0, 'sixGlobalGKTagProposals': 'HOLD; unchanged inherited experimental metadata, no approval by this package'},
    'deckPlacementBoundary': 'Four historical whole decks and one new exact-DE-card deck are data/import candidates only; actual runtime installation and operative Source25 national placement belong to Root/source author, no deployment performed.',
    'oldWholeBEVisibilityDebt': {'missingRequiredOriginViewPairs': 1836, 'defaultDiscovery': False, 'wholeBEApproval': False, 'oldWholeFiveDecksBlanketPlacementAuthorized': False},
})

schema = load('actual-schema-whole-parse-LF-and-required-curriculum-symlink-check.receipt.json')
assert all(not schema[k] for k in ['wholeCAN485RuntimeSchemaErrors', 'closedSchema108ViewErrors', 'wholeJSONAndJSONLParseErrors', 'actualLFErrors', 'repositoryCurriculumSymlinkErrors', 'ownEvidenceSymlinks'])
native = load('actual-native-five-memory-origin-applicability-108-projections-card-only-boundaries-and-national-scope.result.json')
assert native['sourceRequiredActualRenderedOriginChecks'] == 972
assert native['compilerErrorsIn108Views'] == 0 and native['newMemoryMissingIn108Views'] == 0
assert all(not row['missingMemory'] and not row['newSourceOrdinaryVisible'] and not row['newMemoryVisible'] for row in native['national'])

manifest_files = [binding(p) for p in sorted(OUT.rglob('*')) if p.is_file()]
manifest = write('actual-frozen-author-output-whole-byte-manifest.json', {'at': now, 'count': len(manifest_files), 'files': manifest_files, 'boundary': 'Exact immutable author outputs preceding this manifest and final handoff receipt. No independent metadata approval, live write, registry change or M7 closure.'})
receipt = write('actual-final-five-memory-origin-native-card-and-conditional-BE-visibility-author-handoff.receipt.json', {
    'at': now, 'reviewRole': 'Technical metadata author; historical scientific judgments retained, independent new metadata review pending Root',
    'wholeReviewIndex': index, 'wholeOutputManifest': manifest, 'wholeInputBeforeAfterGuard': guard,
    'scienceRetained': {'fourWholeExistingMemoryNodes': 4, 'nineWholeExistingOrdinaryOrigins': 9, 'twelveWholeDEENCards': 12, 'newNarrowScienceMemoryNode': 1, 'twoAdditionalBB2OrdinaryOrigins': 2, 'twoHistoricalDEOnlyCards': 2, 'newENCardApprovalClaimed': False, 'ordinaryContractsChanged': 0, 'newScientificReviewClosures': 0, 'priorBB2IndependentARoleDisclosed': True},
    'nativeAMBridge': {'currentOrdinaryRecords': 336, 'required': 65, 'none': 271, 'currentMemoryGoals': 10, 'allTraced': 10, 'allCards': 66, 'kept': 66, 'originalRootWholeRecordsExact': 300, 'previouslyReviewedCurrentWholeRecordsExactReused': 11, 'Source25AddedRecords': 25, 'Source25Required': 11, 'Source25None': 14, 'actualCurrentOriginOnlyNativeExit': 0, 'missingOrStaleRecords': 0, 'conditionalTwoNationalViewChecks': 100, 'conditionalMissingMemory': 0, 'boundary': 'Existing operative national views do not yet target Source25 or these five new memory nodes. This is current origin binding plus conditional existing-national visibility, not complete new Source25 operative visibility.'},
    'source25StandaloneVisibility': {'ordinaryScope': 25, 'memoryScope': 5, 'required': 11, 'none': 14, 'actualNativeExit': 0, 'explicitUnpublishedReviewViews': 108, 'actualRequiredOriginViewChecks': 972, 'missing': 0, 'ordinaryTargetAndPrerequisiteRolesUnchanged': True, 'GKMemoryTargetsPerView': 3, 'GKCards': 7, 'LKMemoryTargetsPerView': 5, 'LKCards': 14, 'LKOnlyProcedureOrProductCardsInGK': 0, 'allFiveMemoryRequires': [], 'wholeCourseApproval': False, 'actualLearnerElectiveSelectionClaimed': False},
    'actualOriginApplicability': native['fiveCurrentMemoryApplicability'],
    'eightActualNationalCourseJurisdictionProbes': native['national'],
    'actualFailedDiagnosticRetained': {'config': binding(OUT / 'memory-full-current.native-author.config.json'), 'actualExitCode': 1, 'oldRequiredOriginViewMissing': 1836, 'oldGoalAbsentAllViews': 1, 'approval': False, 'reason': 'Unpublished BE catalog targets older ordinary required goals without their old five memory nodes. Source25-only placements do not resolve this existing debt. Initial diagnostic added a stricter coverage flag and108 extra views; later compatibility config preserves original Root requirements, not an approved floor reduction.'},
    'oldVisibilityExamples': [{'viewId': 'de-be-gym-economics-gk-y1-finance-competition-y2-growth-foreign-authored-review', 'ordinaryTargetGoalId': 'e7fbbb64-9f10-5d5d-8946-710aedc6794a', 'requiredMemoryGoalId': 'mem_de_gym_economics_accounting_business_finance', 'finding': 'Actual targeted balance-sheet goal has a required memory decision; old memory node absent from this author catalog view.'}, {'viewId': 'de-be-gym-economics-gk-y1-finance-competition-y2-growth-foreign-authored-review', 'ordinaryTargetGoalId': '1da809f7-ef85-5a2d-babf-b7639e605653', 'requiredMemoryGoalId': 'mem_de_gym_economics_market_order_policy', 'finding': 'Actual targeted social-market-economy goal has a required memory decision; old memory node absent from this author catalog view.'}],
    'actualNativeCardSelectionBoundary': {'memoryCheckRoleSubsetting': 'memoryCardReview.ts skips prerequisiteOnly at287ff; old missing pairs concern actual targets.', 'backendCardLoader': 'LearnerService.java loadSrsDeckCards reads id/front/back/category/tags, not originGoalIds.', 'backendSelection': 'getSrsFilterTags uses explicit select tags when present, otherwise goal tags; filterSrsCards retains ANY intersecting card tags and does not apply originTarget/personalCourse filtering.', 'runtimeChange': False, 'blanketOldDeckPlacementApproved': False},
    'technicalChecks': schema, 'historicalBytesChanged': 0, 'liveSharedWrites': 0, 'protectedMathPhysicsChanges': 0,
    'strictProgress': {'newStrictClosures': 0, 'netStrictGain': 0, 'technicalCandidateFourExistingOriginBindingsRestored': 4, 'oneNecessaryNewMemoryMetadataCandidate': 1},
    'remainingIndependentGates': ['Root new five-node/deck/origin/AM/placement metadata delta judgment', 'Source author exact operative national SourceNav/memory placement plus actual full Memory visibility', 'Whole BE catalog existing old memory visibility debt remains open; catalog is not operative default discovery', 'Source125 whole course/mapping and six global GK integration roles remain separate', 'D/source/image/human/publication approvals not supplied by this author package'],
    'humanReview': 'pending separate release gates', 'wholeM7OrBEApproval': False,
})
print(json.dumps({'receipt': receipt, 'index': index, 'manifest': manifest, 'frozenInputsExact': len(after), 'nativeResult': binding(OUT / 'actual-native-five-memory-origin-applicability-108-projections-card-only-boundaries-and-national-scope.result.json')}, ensure_ascii=False, indent=2))
