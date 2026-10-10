# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import datetime
import hashlib
import json
import shutil
import jsonschema

R = Path.cwd()
P = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-whole-P26-native-continuation-author-20261010-v1')
T = Path('tmp/m7-resumption-20261010/chemistry-b008-P26-native-author')
C = T / 'isolated-normal-capsule'

def read(file):
    return json.loads((R / file).read_text())

def ref(file):
    file = Path(file)
    assert not file.is_absolute()
    assert (R / file).is_file() and not (R / file).is_symlink(), file
    data = (R / file).read_bytes()
    return {'path': str(file), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def put(file, body):
    file = Path(file)
    assert file.is_relative_to(P)
    (R / file).parent.mkdir(parents=True, exist_ok=True)
    (R / file).write_text(json.dumps(body, ensure_ascii=False, indent=2) + '\n')

def copy_exact(source, dest):
    (R / dest).parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(R / source, R / dest)
    assert ref(source)['sha256'] == ref(dest)['sha256']
    return {'original': ref(source), 'wholeExactCopy': ref(dest)}

def value_digest(value):
    return 'sha256:' + hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

# Preserve actual scripts, earlier rejected contracts and unchanged machinery.
driver_copies = []
for name in ['prepare_materials.py', 'prepare_rasters_and_split.py', 'capture_current_sources.py', 'prepare_capsule.py', 'prepare_current_candidate.py', 'normal_prepare_current_frame.mts', 'execute_native.py', 'normal_render_current26.mts', 'normal_source_atlas_probe.mts']:
    driver_copies.append(copy_exact(T / name, P / 'technical' / name))
helper_copies = []
for name in ['materializeGoalDescriptionRolloutBatch.ts', 'goalBookReviewBundle.ts', 'goalBookModel.ts', 'goalBookSourceAtlasInputs.ts', 'goalDescriptionReviewCampaign.ts', 'goalDescriptionReviewResults.ts', 'goalEvidenceReview.ts', 'goalVisualizationAssets.ts', 'semanticKinds.ts', 'goalBookRenderer.ts', 'goalBookFingerprints.ts']:
    source = C / 'app/scripts' / name
    if (R / source).is_file():
        helper_copies.append(copy_exact(source, P / 'technical/ordinary-helper-sources' / name))
put(P / 'checks/actual-preparation-machinery-and-initial-contract-failures.technical.json', {'schemaVersion': 1, 'role': 'Actual ordinary unchanged helper bytes and transparent isolated execution instrumentation; earlier real failures remain failures', 'actualDrivers': driver_copies, 'wholeOrdinaryHelperSources': helper_copies, 'wholeNormalContractsAlsoInBothBundles': True, 'standaloneMaximumGoalCount': 20, 'finalOrdinaryNativeSplit': [20, 6], 'contractRuleOrSelectorChanges': [], 'initialOver20AttemptsNotClaimedGreen': True, 'initialMissingPortableInputsAndBookLocalPathFailuresPreserved': True, 'activeWrites': []})

# Existing whole21 Bavarian source obligations also remain explicit.
old = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-current-twenty-six-native-preparation-author-v1')
source21 = old / 'input/whole21-BY-source-duties36-edges79-occurrences.exact-neutral-input.json'
if (R / source21).is_file():
    copy_exact(source21, P / 'source/whole21-BY-source-duties36-edges79-occurrences.exact-neutral-input.json')

# Whole literal normal P records must be present, unconverted, in every new input.
original_records = {q['goalId']: q for q in map(json.loads, (R / P / 'inputs/whole26-original-normal-P-records.exact-assembly.jsonl').read_text().splitlines())}
assert len(original_records) == 26
whole_goals = read(P / 'candidate/current-whole511-398-B008.inactive.json')
before_goals = read(P / 'inputs/current-whole-active-canonical.exact.json')
assert len(whole_goals['goals']) == 511 and len(before_goals['goals']) == 487
native_rows = []
campaigns = []
for count in [20, 6]:
    base = P / f'native/current-{count}'
    model = read(base / 'bundle/book-model.json')
    exported = read(base / 'bundle/review-input.json')
    assert len(model['pages']) == len(exported['pages']) == count
    for item in exported['pages']:
        goal_id = item['page']['goalId']
        assert item['evidenceProfile'] == original_records[goal_id], goal_id
        record = item['evidenceProfile']
        assert record['profileRuleVersion'] == 'positive-understanding-evidence-v2'
        assert record['status'] == 'needs_human_review'
        assert record['evidenceLevel'] == 'E1' and record['maximumClaimScope'] == 'G1'
        native_rows.append({'goalId': goal_id, 'nativePackageSize': count, 'goalFingerprint': item['page']['goalFingerprint'], 'pageFingerprint': item['page']['pageFingerprint'], 'normalWholeEvidenceRecordValueDigest': value_digest(record), 'normalPProfileFingerprint': record['profileFingerprint'], 'wholeScientificPRecordUnconvertedValueExact': True})
    for round_ in ['a', 'b']:
        campaign = read(base / f'round-{round_}/description-review-campaign.json')
        input_ = read(base / f'round-{round_}/description-review-input.json')
        assert input_['schemaVersion'] == 3 and input_['goalCount'] == count
        assert campaign['goalCount'] == count and campaign['batchSize'] <= 20
        assert campaign['blindToOtherReviews']
        for goal in input_['goals']:
            assert goal['goalId'] in original_records
        campaigns.append({'wholeOrdinaryCampaign': ref(base / f'round-{round_}/description-review-campaign.json'), 'wholeOrdinaryV3Input': ref(base / f'round-{round_}/description-review-input.json'), 'wholeOrdinaryBundleManifest': ref(base / f'round-{round_}/review-bundle-manifest.json'), 'actualCurrentIndependentRecordsCount': 0, 'normalRoundId': campaign['roundId'], 'normalIndependenceGroupId': campaign['independenceGroupId'], 'goalCount': count, 'wholeBatchInputs': [ref(q.relative_to(R)) for q in sorted((R / base / f'round-{round_}/batches').glob('*.input.jsonl'))]})
assert len(native_rows) == len({r['goalId'] for r in native_rows}) == 26
assert {r['goalId'] for r in native_rows} == set(original_records)
put(P / 'checks/normal-current26-full-P-v2-body-and-four-campaign-bindings.actual.json', {'schemaVersion': 1, 'role': 'Exact technical normal whole26 unconverted E1/G1 P-v2 export and four genuine ordinary blind reviewer inputs; no independent records yet', 'rows': native_rows, 'ordinaryCampaigns': campaigns, 'whole26ScientificProfilesAndRecordsValueExact': True, 'actualCurrentIndependentNativeRecords': 0, 'sourceCourseOrAtlasApproval': False, 'activeWrites': [], 'strictGain': 0, 'humanApproval': False})

# Bind every existing relevant ordinary resolution whole, using actual registry
# supersession rules rather than directory age or guessed historical totals.
registry_path = Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
registry = read(registry_path)
subject = next(x for x in registry['subjects'] if x['subject'] == 'chemie')
copy_exact(registry_path, P / 'protected/current-central-registry.exact-technical-snapshot.json')
deltas = read(P / 'checks/normal-whole381-to398-actual-current-context-and-protected177-deltas.json')
affected = [row for row in deltas['wholeProtected177CurrentComparisons'] if row['targetedCurrentBindingReviewPending']]
assert len(affected) == 12
old_resolutions = {}
suppressed = {(x['goalId'], x['supersededIndexPath']) for x in subject['resolutionSupersessions']}
withdrawn = {(x['goalId'], x.get('indexPath', x.get('withdrawnIndexPath'))) for x in subject.get('resolutionWithdrawals', [])}
for index_path in map(Path, subject['resolutionIndexPaths']):
    index = read(index_path)
    for row in index.get('resolutions', []):
        if row['goalId'] not in {x['goalId'] for x in affected}: continue
        if (row['goalId'], str(index_path)) in suppressed or (row['goalId'], str(index_path)) in withdrawn: continue
        assert row['goalId'] not in old_resolutions, (row['goalId'], index_path)
        resolution_path = index_path.parent / row['resolutionPath']
        assert resolution_path.is_file(), resolution_path
        group = next(g for g in index['groups'] if g['groupId'] == row['groupId'])
        artifact = index_path.parent / group.get('artifactDirectory', '.')
        ordinary = read(resolution_path)
        assert ordinary['goal']['goalId'] == row['goalId']
        copies = []
        ownbase = P / 'protected/whole-existing-resolutions' / row['goalId']
        copies.append(copy_exact(index_path, ownbase / 'whole-active-resolution-index.exact.json'))
        copies.append(copy_exact(resolution_path, ownbase / 'whole-active-resolution.exact.json'))
        summary = artifact / group['dualSummaryPath']
        if summary.is_file(): copies.append(copy_exact(summary, ownbase / 'whole-dual-summary.exact.json'))
        for round_ in ['round-a', 'round-b']:
            for name in ['description-review-campaign.json', 'description-review-input.json', 'review-bundle-manifest.json']:
                path = artifact / round_ / name
                if path.is_file(): copies.append(copy_exact(path, ownbase / round_ / name))
            for folder in ['batches', 'results']:
                path = artifact / round_ / folder
                if path.is_dir():
                    for q in sorted(path.glob('*')):
                        if q.is_file() and q.suffix in ['.json', '.jsonl']:
                            copies.append(copy_exact(q, ownbase / round_ / folder / q.name))
        old_resolutions[row['goalId']] = {'goalId': row['goalId'], 'wholeExactPriorResolutionArtifacts': copies, 'wholeUnmodifiedExistingResolution': ordinary, 'actualWholeCurrentPageDelta': next(x['wholeActualPageDelta'] for x in affected if x['goalId'] == row['goalId']), 'sameSelectedRasterInBeforeAfter': next(x['wholeActualPageDelta'] for x in affected if x['goalId'] == row['goalId'])['wholeBeforePage']['visualization'] == next(x['wholeActualPageDelta'] for x in affected if x['goalId'] == row['goalId'])['wholeInactiveAfterPage']['visualization'], 'actualNewTargetedIndependentNativeContextReviewRequired': True, 'priorReviewIsNotApprovalOfChangedBindings': True}
assert len(old_resolutions) == 12
# Bind complete current P files for affected goals; never resynthesize evidence.
current_p = []
for q in map(Path, subject['positiveEvidenceConfigPaths']):
    config = read(q)
    goal_ids = set(config.get('scope', {}).get('goalIds', []))
    if not goal_ids.intersection(old_resolutions): continue
    files = [q, Path(config['reviewPath'])]
    files += [Path(z) for z in config.get('reviewRunManifestPaths', [])]
    files += [Path(config['reviewCriteriaPath'])]
    current_p.append({'wholeActiveConfigOriginalBinding': ref(q), 'affectedGoalIdsWithinConfig': sorted(goal_ids.intersection(old_resolutions)), 'wholeExactOrdinaryConfigRecordsAndCriteria': [copy_exact(z, P / 'protected/whole-existing-P' / f'{len(current_p) + 1:02d}' / z.name) for z in files]})
put(P / 'protected/whole12-current-goal-page-context-source-image-and-prior-D-P-bindings.actual.json', {'schemaVersion': 1, 'role': 'Twelve actual current protected context deltas with original valid independent records retained whole; no hash-only binding approval', 'activeRegistryOriginal': ref(registry_path), 'wholeCurrentRegistryExactCopy': ref(P / 'protected/current-central-registry.exact-technical-snapshot.json'), 'actualProtectedGoalIdsBefore': 177, 'wholeOriginalProtectedIdSet': ref(P / 'inputs/protected-prior177-current-and-strict-ID-sets.exact.json'), 'actualChangedProtectedContextCount': 12, 'rows': list(old_resolutions.values()), 'wholeCurrentBoundedPInputs': current_p, 'normalComparativeModelsAreCanonicalRootAuthorViewsNotAllNationalPublishedPages': True, 'wholeNationalSourceReviewApproval': False, 'currentTargetedContextReviewPending': True, 'strictGain': 0, 'activeWrites': [], 'humanApproval': False})

# The three genuinely integrated BW bodies/routes are retained exactly.
bodies_before = {q['id']: q for q in before_goals['goals']}
bodies_after = {q['id']: q for q in whole_goals['goals']}
book_before = {q['goalId']: q for q in read(P / 'native/before-whole-normal-book-model.actual.json')['pages']}
book_after = {q['goalId']: q for q in read(P / 'native/after-whole-normal-book-model.actual.json')['pages']}
bw_content = ['d2d735de-bede-5310-8aeb-8bb7562c7b75', 'a0f6ba09-f072-5887-a797-fa369453c62a', '7b39fa19-fec3-575e-9324-a3226b703358']
bw_routes = ['3259bf7f-4af4-58ae-8190-9aec07ec476f', 'e6196381-eab5-5a3e-bb6e-56c6e6e3617f', '563f69ed-562f-5544-ab0c-bf0e481928d8']
skip = {'pageNumber', 'navigationOrder', 'treeOrder', 'ordinal', 'pageFingerprint'}
def substantive(value):
    if isinstance(value, dict): return {k: substantive(v) for k, v in value.items() if k not in skip}
    if isinstance(value, list): return [substantive(v) for v in value]
    return value
bw_rows = []
for goal_id in bw_content + bw_routes:
    assert bodies_before[goal_id] == bodies_after[goal_id]
    item = {'goalId': goal_id, 'wholeOriginalGoalBodyExact': True, 'wholeBodyValueDigest': value_digest(bodies_before[goal_id]), 'assessmentEndpoint': goal_id in bw_routes}
    if goal_id in bw_content:
        item['wholeBeforeNativePage'] = book_before[goal_id]
        item['wholeAfterNativePage'] = book_after[goal_id]
        item['actualChangedSubstantiveFields'] = [k for k in book_before[goal_id] if substantive(book_before[goal_id][k]) != substantive(book_after[goal_id][k]) and k not in skip]
        item['targetedBindingApprovalNeededIfSubstantiveDelta'] = bool(item['actualChangedSubstantiveFields'])
    bw_rows.append(item)
put(P / 'protected/current-adopted-BW-three-content-and-three-routes.exact-body-and-context.actual.json', {'schemaVersion': 1, 'wholeActiveBase487Preserved': ref(P / 'inputs/current-whole-active-canonical.exact.json'), 'rows': bw_rows, 'assessmentTaskReleaseMetadataUnchanged': True, 'humanApproval': False, 'activeWrites': [], 'strictGain': 0})

# Parse all actual new JSON/JSONL and validate the whole runtime candidate via the
# unchanged ordinary schema. Isolated failed-attempt records are retained as logs.
parsed = []
for q in sorted((R / P).rglob('*')):
    assert not q.is_symlink(), q
    if q.is_file() and q.suffix in ['.json', '.jsonl']:
        if q.suffix == '.json': json.loads(q.read_text())
        else:
            for line in q.read_text().splitlines():
                if line.strip(): json.loads(line)
        parsed.append(str(q.relative_to(R)))
jsonschema.validate(whole_goals, read('docs/landscape-runtime.schema.json'))
assert ref(P / 'inputs/current-whole-active-canonical.exact.json')['sha256'] == 'sha256:de99a87c79fa64f30144232223994635f69c76c88547d0cd40ff3b0fb590a44f'
assert ref(P / 'inputs/current-whole-active-semantic-kinds.exact.json')['sha256'] == 'sha256:3d980258bd2440bbdf6db70f6a8d7d2918cf5d9dc1d8f15902bbca518f805867'
assert ref(subject['landscapePath'])['sha256'] == ref(P / 'inputs/current-whole-active-canonical.exact.json')['sha256']
assert ref(subject['semanticKindLedgerPath'])['sha256'] == ref(P / 'inputs/current-whole-active-semantic-kinds.exact.json')['sha256']
put(P / 'checks/scoped-all-candidate-json-regular-file-and-whole-runtime-schema.actual.json', {'schemaVersion': 1, 'actualAllJsonAndJsonlParsePassed': True, 'actualParsedFileCount': len(parsed), 'parsedPaths': parsed, 'normalRuntimeSchema': ref('docs/landscape-runtime.schema.json'), 'actualWhole511RuntimeSchemaPassed': True, 'allOwnFilesAreRegularWithoutSymlinksOrNestedRepos': True, 'wholeActive487CanonicalAnd381KindsStillExactAtCheck': True, 'scopeIsAuthorCandidateOnly': True, 'activeWrites': [], 'strictGain': 0})
print(json.dumps({'actualNormalNativeGoalCount': 26, 'wholeInactiveNodeCount': 511, 'wholeInactiveAtomicCount': 398, 'actualProtectedContextDeltas': 12, 'wholeCurrentPRecordsAndProfilesExact': True, 'actualJsonAndJsonlParseCount': len(parsed), 'actualWholeRuntimeSchemaPassed': True, 'sourceCompilerFailure': read(P / 'checks/normal-current398-whole-source-atlas-candidate.actual.json')['actualError'], 'activeWrites': 0, 'strictGain': 0}, ensure_ascii=False))
