"""Seal this inert native-input package without inventing review decisions."""
import datetime
import hashlib
import json
from pathlib import Path

REPO = Path.cwd()
BASE = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-final-native-review-inputs-author-v1'
FREEZE = BASE / 'final-native-review-inputs.author-v1.freeze.json'
if FREEZE.exists():
    raise SystemExit('Frozen package: use a new continuation; never overwrite this freeze.')


def read(path):
    return json.loads(Path(path).read_text())


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def bind(path):
    path = Path(path)
    return {'path': str(path.relative_to(REPO)), 'sha256': sha(path), 'bytes': path.stat().st_size}


def verify(binding):
    path = REPO / binding['path']
    assert sha(path) == binding['sha256'].removeprefix('sha256:'), binding['path']


preservation = read(BASE / 'qa-artifacts/native-input-and-preservation-verification.actual.json')
bundle = read(BASE / 'bundle/manifest.json')
render = read(BASE / 'qa-artifacts/render/seven.book.pdf.render-manifest.json')
native = read(BASE / 'qa-artifacts/native-targeted-seven-render-bundle-campaigns.actual.json')
pending_p = read(BASE / 'inputs/positive-review-inputs.native-fingerprints.pending.json')
p_hold = read(BASE / 'qa-artifacts/native-positive-check.pending-profiles.actual.json')
kind = read(BASE / 'inputs/semantic-kinds-390.candidate.json')
candidate = read(BASE / 'inputs/canonical-390.de.candidate.json')
current = read(REPO / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
candidate_by_id = {g['id']: g for g in candidate['goals']}
assert len(current['goals']) == 464 and len(candidate['goals']) == 472
old_deltas = []
for goal in current['goals']:
    next_goal = candidate_by_id[goal['id']]
    fields = sorted(k for k in set(goal) | set(next_goal) if goal.get(k) != next_goal.get(k))
    if fields:
        old_deltas.append({'goalId': goal['id'], 'fields': fields})
assert len(old_deltas) == 1 and old_deltas[0]['fields'] == ['contains']
assert len(preservation['old383Rows']) == 383
assert len(preservation['protected67Rows']) == 67
assert all(r['wholeGoalExact'] and r['goalFingerprintExact'] and r['pageFingerprintExact'] for r in preservation['old383Rows'])
assert bundle['selectedGoalCount'] == 7 and render['goalPageCount'] == 7
assert render['frontMatterPageCount'] == 2 and render['physicalPageCount'] == 9
assert len(render['assets']) == 7
assert p_hold['result'] == 'HOLD' and p_hold['profilesActuallyPresent'] == 0
assert len(p_hold['returnedErrors']) == 7
assert (BASE / 'inputs/positive-evidence.pending.review.jsonl').read_bytes() == b''

input_bindings = {}


def include(binding):
    verify(binding)
    normalized = dict(binding)
    normalized['sha256'] = normalized['sha256'].removeprefix('sha256:')
    input_bindings[normalized['path']] = normalized


for binding in preservation['original19InputsBefore']:
    include(binding)
for binding in native['original19InputsAfter']:
    include(binding)
assert len(preservation['original19InputsBefore']) == 19
for frozen_input in preservation['inputFreezes']:
    include(frozen_input)
    path = REPO / frozen_input['path']
    frozen = read(path)
    for own in frozen.get('files', frozen.get('ownFiles')):
        actual = own['path'] if own['path'].startswith('curricula/') else str((path.parent / own['path']).relative_to(REPO))
        include({**own, 'path': actual})
for row in preservation['readonlySymlinkBindings']:
    include(row['actualInput'])
for binding in preservation['productionHelpers']:
    include(binding)
for row in preservation['sourceBindings']:
    include(row['sourceEnvelope'])
for row in preservation['exactSevenCurrentGoalAndImageBindings']:
    for key in ['selectedImage', 'actualPublic', 'actualCanonical', 'actualBackend', 'independentVFreeze']:
        include(row[key])
    expected = row['assetSha256']
    matching_render = next(asset for asset in render['assets'] if asset['publicPath'] == row['imageUrl'])
    assert matching_render['sourceSha256'] == expected

cases_snapshot = read(REPO / pending_p['sevenGoalSixteenCaseSourceSnapshot']['path'])
source_material = read(REPO / pending_p['sourceMaterial']['path'])
case_count = 0
for row in pending_p['rows']:
    original = next(r for r in cases_snapshot['rows'] if r['goalId'] == row['goalId'])
    assert row['currentSourceCaseBodies'] == original['cases']
    assert row['wholeCurrentCandidateGoal'] == candidate_by_id[row['goalId']]
    for case in row['currentSourceCaseBodies']:
        value = source_material
        for token in case['JSONPointer'].split('/')[1:]:
            value = value[int(token)] if isinstance(value, list) else value[token]
        assert value == case['caseBody']
        case_count += 1
assert case_count == 16
for key in ['subjectCriteria', 'authoringPrompt', 'outputSchema', 'sourceMaterial', 'sevenGoalSixteenCaseSourceSnapshot', 'nativeFingerprintHelpers']:
    include(pending_p[key])
am = read(BASE / 'inputs/atomicity-memory-native-review-inputs.pending.json')
for key in ['config', 'review']:
    include(am['existingFullAtomicity'][key])
for key in ['config', 'review', 'cards']:
    include(am['existingFullMemory'][key])
for row in am['existingFullMemory']['visibilityScopes']:
    include(row['input'])
include(am['priorScientificMemoryOpinionReference'])
policy = read(BASE / 'qa-artifacts/current-agents-policy-input-and-unrelated-delta.actual.json')
include(policy['currentAGENTS'])
for item in bundle['artifacts']:
    path = BASE / 'bundle' / item['path']
    assert sha(path) == item['digest'].removeprefix('sha256:')
campaign_rows = []
for round_name in ['a', 'b']:
    campaign = read(BASE / f'round-{round_name}/description-review-campaign.json')
    assert campaign['goalCount'] == 7 and campaign['blindToOtherReviews'] is True
    assert campaign['bundleFingerprint'] == bundle['bundleFingerprint']
    assert campaign['bookDigest'] == bundle['bookModelDigest']
    assert campaign['reviewInputFingerprint'] == 'sha256:3875cdc1f10dc8750ff088ec683a5db40349edbda17ba3433362166c9d22019f'
    campaign_rows.append({'round': round_name, 'inputFingerprint': campaign['reviewInputFingerprint'], 'independenceGroupId': campaign['independenceGroupId'], 'verdictRecordsCreated': 0})

parsed_json = 0
parsed_jsonl = 0
for path in BASE.rglob('*'):
    if path.suffix == '.json':
        read(path)
        parsed_json += 1
    elif path.suffix == '.jsonl':
        for line in path.read_text().splitlines():
            if line.strip():
                json.loads(line)
                parsed_jsonl += 1
checks = {
    'schemaVersion': 1, 'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'targeted author preservation and artifact-byte verification; no independent D/P/A/M verdict',
    'parsedJSONFiles': parsed_json, 'parsedJSONLLines': parsed_jsonl,
    'nativeModelBundleCampaignPreparation': 'PASS', 'nativePositiveProfileGate': 'HOLD',
    'unchangedOldCanonicalIDs': 464, 'candidateCanonicalIDs': 472, 'oldCanonicalWholeGoalDeltas': old_deltas,
    'old383WholeGoalsAndPagesExact': True, 'protected67WholeGoalsAndPagesExact': True,
    'currentSource16CaseBodiesExact': True, 'reviewBundleArtifactBytesExact': True,
    'selectedRenderSourceImageDigestsExact': True, 'productionHelpersUnchanged': True,
    'original19ActiveInputsExact': True, 'historicalFreezeOwnedBytesExact': True,
    'currentAGENTSBoundSeparatelyFromHistoricalAGENTS': True,
    'newD_P_A_MVerdicts': 0, 'activeVIntegration': False, 'activeWrites': False, 'strictNetGain': 0,
    'humanApproval': False, 'humanTrial': False,
}
(BASE / 'qa-artifacts/targeted-final-input-and-artifact-checks.actual.json').write_text(json.dumps(checks, indent=2) + '\n')
own_files = []
for path in sorted(BASE.rglob('*')):
    if path.is_file():
        assert not path.is_symlink(), str(path)
        own_files.append({'path': str(path.relative_to(BASE)), 'sha256': sha(path), 'bytes': path.stat().st_size})
freeze = {
    'schemaVersion': 1, 'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'frozen inert final-seven native author review input package; independent reviews pending',
    'files': own_files, 'ownFileCount': len(own_files), 'ownBytes': sum(f['bytes'] for f in own_files),
    'inputBindings': sorted(input_bindings.values(), key=lambda b: b['path']),
    'currentCandidateAtomicGoalCount': 390, 'selectedReviewGoalCount': 7,
    'nativeBookModelDigest': preservation['fullBookModelDigest'], 'nativeSubsetBookModelDigest': bundle['bookModelDigest'],
    'bundleFingerprint': bundle['bundleFingerprint'], 'nativeDescriptionReviewRounds': campaign_rows,
    'sourceCorrectionBasis': 'v7 except exact six-field MV heading-location v8 correction',
    'retainedIndependentActualVFreeze': '6320646059702bb78de426ea84a14238fc463a060b664e7e5e5639aa12d685cb',
    'nativeDReviewsComplete': False, 'positiveProfilesPresent': 0, 'nativePCheck': 'HOLD',
    'newNativeA_MDecisions': 0, 'newGUIVisibilitySupersetsIntegrated': False,
    'original19InputsUnchanged': True, 'old383WholeGoalsAndPagesExact': True, 'protected67WholeGoalsAndPagesExact': True,
    'currentBiologyStrict': '67/383', 'currentChemistryStrict': '112/378',
    'protectedMathematicsM7': '807/807', 'protectedPhysicsM7': '478/478',
    'activeWrites': False, 'newScientificCompletions': 0, 'restoredActiveBindings': 0, 'strictNetGain': 0,
    'humanApproval': False, 'humanTrial': False, 'publicationOrDeployment': False, 'integrableNow': False,
}
FREEZE.write_text(json.dumps(freeze, indent=2) + '\n')
print(json.dumps({'freeze': str(FREEZE.relative_to(REPO)), 'sha256': sha(FREEZE), 'ownFileCount': len(own_files), 'ownBytes': freeze['ownBytes'], 'nativeSevenBundle': 'PASS', 'nativeD_P_A_MCompletion': False, 'strictGain': 0}))
