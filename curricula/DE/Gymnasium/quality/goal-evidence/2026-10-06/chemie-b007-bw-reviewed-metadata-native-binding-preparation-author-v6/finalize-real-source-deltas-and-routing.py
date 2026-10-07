"""Preserve actual native inputs/outputs and record metadata-only exact routing.

Retained native whole models/indices are the raw source of every pointer below.
No new review, active change, central checker, source closure, or global build.
"""
from pathlib import Path
import hashlib
import json
import datetime

OWN = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[7]
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()

def load(path):
    return json.loads(Path(path).read_text())

def save(name, value):
    (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def bind(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def differences(a, b, pointer=''):
    assert type(a) is type(b), pointer
    if isinstance(a, dict):
        assert a.keys() == b.keys(), pointer
        return sum((differences(a[k], b[k], pointer + '/' + k) for k in a), [])
    if isinstance(a, list):
        assert len(a) == len(b), pointer
        return sum((differences(x, y, pointer + '/' + str(i)) for i, (x, y) in enumerate(zip(a, b))), [])
    return [] if a == b else [{'pointer': pointer, 'before': a, 'after': b}]

summary = load(OWN / 'actual-native-current-future-delta-and-reviewrouting-summary.author.json')
continuity_path = OWN / 'actual-current378-complete-goal-page-context-source-image-continuity.json'
continuity = load(continuity_path)
old_url = 'https://www.bildungsplaene-bw.de/site/bildungsplan-rebrush2024/get/documents/lsbw/export-pdf/depot-pdf/ALLG/BP2016BW_ALLG_GYM_CH.pdf'
new_url = 'https://www.bildungsplaene-bw.de/site/bildungsplan-rebrush2024/get/documents/lsbw/export-pdf/depot-pdf/ALLG/BP2016BW_ALLG_GYM_CH.V2%20(2022-03-25).pdf'
source_goal_deltas = []
compact_rows = []
canon_relative = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
current_canon = load(OWN / 'baseline-current/checkout' / canon_relative)
positions = {g['id']: i for i, g in enumerate(current_canon['goals'])}
before_index = load(OWN / 'baseline-current/native-artifacts/national359.original-sources.json')
after_index = load(OWN / 'future-metadata-only/native-artifacts/national359.original-sources.json')
raw_index_deltas = differences(before_index, after_index)
assert all(r['pointer'] == '/bookDigest' or r['pointer'].endswith('/url') or r['pointer'].endswith('/sourceRef') for r in raw_index_deltas)

for index, row in enumerate(continuity['rows']):
    changed = differences(row['resolvedOriginalSourceAttributionBefore'], row['resolvedOriginalSourceAttributionAfter'])
    for delta in changed:
        if delta['pointer'].endswith('/completeDocument/url'):
            assert delta['before'] == old_url and delta['after'] == new_url
        else:
            assert delta['pointer'].endswith('/sourceRef')
            assert delta['before'].endswith('S. 15.') and delta['after'] == delta['before'].replace('S. 15.', 'S. 16.')
    if changed:
        source_goal_deltas.append({'goalId': row['goalId'], 'protectedCurrent127': row['protectedCurrent127'], 'completeAttributionBefore': {'nativeIndex': 'baseline-current/native-artifacts/national359.original-sources.json', 'goalBindingPointer': '/goals/' + row['goalId'], 'resolveEvidenceAndDocumentIDs': True}, 'completeAttributionAfter': {'nativeIndex': 'future-metadata-only/native-artifacts/national359.original-sources.json', 'goalBindingPointer': '/goals/' + row['goalId'], 'resolveEvidenceAndDocumentIDs': True}, 'actualResolvedMetadataScalarDeltas': changed, 'allOtherScopeSourceIDsOperatorsKindsNearestWitnessAndDocumentTitleFieldsExactlyEqual': True})
    # Store references to the full actual raw native objects instead of repeating
    # resolved shared source-document/evidence objects hundreds of times.
    compact = {k: v for k, v in row.items() if not k.startswith(('wholeGoalBefore', 'wholeGoalAfter', 'completeFullPageBefore', 'completeFullPageAfter', 'completeDInputPartBefore', 'completeDInputPartAfter', 'nativeSourceScopeWitnessesBefore', 'nativeSourceScopeWitnessesAfter', 'resolvedOriginalSourceAttributionBefore', 'resolvedOriginalSourceAttributionAfter'))}
    compact['completeRawBefore'] = {'wholeCanonicalInput': 'baseline-current/checkout/' + canon_relative, 'wholeGoalPointer': '/goals/' + str(positions[row['goalId']]), 'fullModel': 'baseline-current/native-artifacts/current378.full.book-model.json', 'fullPagePointer': '/pages/' + str(index), 'originalSourceIndex': 'baseline-current/native-artifacts/national359.original-sources.json', 'sourceGoalBindingPointer': '/goals/' + row['goalId'], 'sourceScopeWitnessReceipt': 'baseline-current/native-artifacts/source-atlas.receipt.json', 'filterWitnessGoalId': row['goalId']}
    compact['completeRawAfter'] = {'wholeCanonicalInput': 'future-metadata-only/checkout/' + canon_relative, 'wholeGoalPointer': '/goals/' + str(positions[row['goalId']]), 'fullModel': 'future-metadata-only/native-artifacts/current378.full.book-model.json', 'fullPagePointer': '/pages/' + str(index), 'originalSourceIndex': 'future-metadata-only/native-artifacts/national359.original-sources.json', 'sourceGoalBindingPointer': '/goals/' + row['goalId'], 'sourceScopeWitnessReceipt': 'future-metadata-only/native-artifacts/source-atlas.receipt.json', 'filterWitnessGoalId': row['goalId']}
    compact['actualCanonicalDContextBefore'] = row['completeDInputPartBefore']['canonicalContext']
    compact['actualCanonicalDContextAfter'] = row['completeDInputPartAfter']['canonicalContext']
    compact['evidenceProfilePartBothNullInThisFullModelProbe'] = True
    compact['DInputPartTextPartsBoundToActualWholeBilingualGoalsAndFullNativePages'] = True
    compact_rows.append(compact)

assert len(source_goal_deltas) == 186
assert sum(r['protectedCurrent127'] for r in source_goal_deltas) == 68
save('actual-current378-complete-goal-page-context-source-image-continuity.json', {'schemaVersion': 1, 'role': 'Technical complete native before/after measurement, not a new scientific review', 'representation': 'Lossless references to separately retained native whole canonical/model/source indices plus actual complete canonical D contexts and exact equality results; no raw evidence removed from package.', 'rows': compact_rows, 'actualSourceAssetBindings': continuity['actualSourceAssetBindings']})
save('actual-real-original-source-url-locator-scalar-deltas-and-68-protected-routing.json', {'schemaVersion': 1, 'createdAtUTC': NOW, 'role': 'Technical attribution delta candidate; no inherited witness relabelled as direct source coverage', 'actualRawOriginalSourceIndexScalarDeltas': raw_index_deltas, 'actualNormalizedAttributionAffectedGoals': source_goal_deltas, 'affectedAtlasPages': 186, 'affectedProtectedCurrentGoals': 68, 'sourceMetadataOnly': True, 'allNormativeTextsOperatorsSourceScopeMappingAndCoverageFieldsExactlyPreserved': True, 'nativeDAndPScienceInputPartsRemainExact': True, 'reviewRouting': 'Root reviews these actual URL/locator attribution deltas against the two existing independent metadata source audits. No new full D/P/A/M/V science review is implied; native exact unchanged evidence may be reused while changed source attribution is explicitly rebound.', 'sourceHoldsCleared': 0, 'strictCompletionsAdded': 0, 'humanApproval': False})

source_receipt_relative = 'app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas/source-projection.receipt.json'
actual_active_receipt = (ROOT / source_receipt_relative).read_bytes()
native_before_receipt = (OWN / 'baseline-current/checkout' / source_receipt_relative).read_bytes()
native_after_receipt = (OWN / 'future-metadata-only/checkout' / source_receipt_relative).read_bytes()
assert json.loads(actual_active_receipt) == json.loads(native_before_receipt)
save('actual-receipt-serialization-and-before-after-input-binding-deltas.json', {'schemaVersion': 1, 'originalActiveSourceProjectionReceipt': bind(ROOT / source_receipt_relative), 'nativeBaselineReceipt': bind(OWN / 'baseline-current/checkout' / source_receipt_relative), 'nativeFutureReceipt': bind(OWN / 'future-metadata-only/checkout' / source_receipt_relative), 'actualActiveVsNativeBaselineParsedWholeReceiptExactlyEqual': True, 'actualActiveVsNativeBaselineBytesExactlyEqual': actual_active_receipt == native_before_receipt, 'onlyBaselineByteDifferenceMeaning': 'Equivalent JSON serialization; no data, count, scope or witness difference. Actual original bytes are bound separately.', 'nativeBeforeAfterActualReceiptScalarDeltas': differences(json.loads(native_before_receipt), json.loads(native_after_receipt)), 'productDefectClaimFromFormatting': False})

central_config_relative = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
central = load(ROOT / central_config_relative)
subject = next(s for s in central['subjects'] if s['subject'] == 'chemie')
existing_paths = []
for key in ['resolutionIndexPaths', 'positiveEvidenceConfigPaths', 'semanticAtomicityConfigPaths']:
    for path in subject[key]:
        existing_paths.append({'gateField': key, 'existingUnmodifiedBinding': bind(ROOT / path)})
        cfg = load(ROOT / path)
        for subkey in ['reviewPath', 'cardReviewPath', 'reviewRecordsPath', 'reviewRunsPath']:
            if isinstance(cfg.get(subkey), str) and (ROOT / cfg[subkey]).is_file():
                existing_paths.append({'gateField': key + '/' + subkey, 'existingUnmodifiedBinding': bind(ROOT / cfg[subkey])})
for key in ['memoryReviewConfigPath', 'visualizationQaPath']:
    path = subject[key]
    existing_paths.append({'gateField': key, 'existingUnmodifiedBinding': bind(ROOT / path)})
    cfg = load(ROOT / path)
    for subkey in ['reviewPath', 'cardReviewPath']:
        if isinstance(cfg.get(subkey), str) and (ROOT / cfg[subkey]).is_file():
            existing_paths.append({'gateField': key + '/' + subkey, 'existingUnmodifiedBinding': bind(ROOT / cfg[subkey])})

protected = set(original['currentStrictIDs']) if (original := load(OWN / 'current479-127-and-exact-selected-metadata-delta.raw-author.json')) else set()
qa = load(ROOT / subject['visualizationQaPath'])
actual_protected_images = []
for row in qa['records']:
    if row['goalId'] not in protected:
        continue
    asset_rows = []
    if row['visualizationState'] == 'available':
        public = ROOT / row['publicAssetPath']
        backend = ROOT / 'backend/src/main/resources/static' / row['imageUrl'].lstrip('/')
        assert public.read_bytes() == backend.read_bytes(), row['goalId']
        assert 'sha256:' + hashlib.sha256(public.read_bytes()).hexdigest() == row['assetSha256'], row['goalId']
        asset_rows = [bind(public), bind(backend)]
    actual_protected_images.append({'goalId': row['goalId'], 'wholeUnmodifiedCurrentQARecord': row, 'actualPublicAndBackendRasterBindings': asset_rows, 'noNewImageOrHumanAcceptance': True})
assert len(actual_protected_images) == 127
save('actual-current127-existing-five-gate-history-and-raster-reuse-bindings.json', {'schemaVersion': 1, 'createdAtUTC': NOW, 'role': 'Read-only history/source/raster reuse binding snapshot; no new scientific verdict', 'currentCentralConfigBinding': bind(ROOT / central_config_relative), 'existingChemistryGatesNotModified': existing_paths, 'actualProtectedRasterAndCurrentQARecords': actual_protected_images, 'nativeDContextAndPInputEqualityMeasuredSeparately': True, 'semanticAtomicityAndMemoryFingerprintFields': 'Current production fingerprint functions read bilingual texts, shortKey, dimensionTags and nodeKind; these whole field values remain exact. No A/M CLI run or fingerprint update to historical review records performed.', 'reviewRecordsRelabelledOrRehashed': False, 'newSourceAuditRole': 'Two v5 independent source metadata audits are retained as bounded URL/locator evidence, not new D/P/A/M/V science results.', 'sourceHoldsCleared': 0, 'strictCompletionsAdded': 0, 'activeWrites': 0})

selected_file_paths = [row['path'] for row in original['exactScalarDeltas']] + ['curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json']
apply_groups = []
for path in selected_file_paths:
    before = OWN / 'baseline-current/checkout' / path
    after = OWN / 'future-metadata-only/checkout' / path
    changes = differences(load(before), load(after))
    apply_groups.append({'intendedFutureActivePath': path, 'exactCurrentActiveBinding': bind(ROOT / path), 'actualFrozenBefore': bind(before), 'actualFrozenAfter': bind(after), 'exactFieldDeltas': changes, 'reviewerApprovalOrActiveApplicationClaim': False})
assert sum(len(r['exactFieldDeltas']) for r in apply_groups) == 21
helper_inputs = [bind(ROOT / path) for path in ['app/scripts/goalBookModel.ts', 'app/scripts/goalBookSourceAtlasInputs.ts', 'app/scripts/goalBookOriginalSources.ts', 'app/scripts/validateGoalDescriptionReviewCampaign.ts', 'app/scripts/validateGoalDescriptionDualRoundResolution.ts', 'app/scripts/goalEvidenceProfileModel.ts', 'app/scripts/semanticAtomicityReview.ts', 'app/scripts/memoryCardReview.ts', 'contracts/curriculum-package/v1/profiles/semantic-normal-form-v1.profile.json']]
save('exact-selected-five-file-metadata-application-and-native-derivative-candidates.json', {'schemaVersion': 1, 'createdAtUTC': NOW, 'role': 'Inert technical integration preparation, Root reviews/applies separately', 'actual21ScalarOperationsAcrossFiveCurrentFiles': apply_groups, 'requiredDerivedNativeSourceReceipt': {'activePath': source_receipt_relative, 'actualFutureCandidate': 'future-metadata-only/checkout/' + source_receipt_relative}, 'requiredDerivedNationalBookAndOriginalSourcesCandidates': ['future-metadata-only/native-artifacts/national359.book-model.json', 'future-metadata-only/native-artifacts/national359.original-sources.json'], 'nativeFullReviewModelCandidate': 'future-metadata-only/native-artifacts/current378.full.book-model.json', 'allOther48SourceViewsManifestAndNavigationBytesExactlyEqual': True, 'oldV4FullCanonicalNotFutureInput': True, 'unchangedProductionHelperBindings': helper_inputs, 'scienceReviewClaim': False, 'sourceHoldsCleared': 0, 'strictCompletionsAdded': 0, 'activeWrites': 0, 'globalBuilds': 0})
print(json.dumps({'actualProtectedStrict': 127, 'metadataScalarOperations': 21, 'affectedActualSourceAttributionGoals': 186, 'protectedActualSourceAttributionGoals': 68, 'eightParagraphProtectedWitnessReach': len(summary['actualSelectedEightParagraphProtected127ReachIDs']), 'nativeFullPageContextPImageEquality': 378, 'ownContinuityArtifactBytesAfterLosslessReferenceCompaction': continuity_path.stat().st_size, 'sourceHoldsCleared': 0}))
