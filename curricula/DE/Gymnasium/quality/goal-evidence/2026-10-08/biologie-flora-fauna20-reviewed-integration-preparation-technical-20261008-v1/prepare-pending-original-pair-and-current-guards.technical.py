# SPDX-License-Identifier: Apache-2.0
"""Prepare only an inactive guarded checkpoint of the actual Flora20 inputs.

This is technical custody/synthesis of real existing judgments, not a science
review or native final approval. Ord14 remains pending until real targeted
current A/B checks exist. No active path is written.
"""
from pathlib import Path
import json, hashlib, copy, datetime

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
OLD = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07'
NEW = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08'
AUTHOR = OLD / 'biologie-flora-fauna20-final-raster-native-author-root-20261007-v1'
IMAGE = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-flora-fauna20-image-author-root-20261007-v1'
A = NEW / 'biologie-flora-fauna20-final-raster-native-independent-a-20261008-v1'
B = NEW / 'biologie-flora-fauna20-final-raster-native-independent-b-20261008-v1'
PENDING_ID = '321ea315-37fe-5f9e-8fa8-dd631bb447c7'
declared = {}


def binding(p):
    p = Path(p); b = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def read(p):
    p = Path(p); declared[str(p)] = binding(p)
    return json.loads(p.read_text())


def rows(p):
    p = Path(p); declared[str(p)] = binding(p)
    return [json.loads(s) for s in p.read_text().splitlines() if s]


def write(p, value):
    p = OWN / p; p.parent.mkdir(parents=True, exist_ok=True)
    b = value if isinstance(value, bytes) else (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()
    if p.exists():
        assert p.read_bytes() == b, 'Do not silently rewrite an existing technical checkpoint: ' + str(p)
    else:
        with p.open('xb') as f: f.write(b)
    return binding(p)


def original_seal(path, expected, lists):
    actual = binding(path); assert actual['sha256'] == expected
    seal = read(path); verified = []
    for field in lists:
        for e in seal[field]:
            p = ROOT / e['path']; actual_entry = binding(p)
            assert actual_entry['sha256'] == e['sha256'].removeprefix('sha256:'), e['path']
            if 'bytes' in e: assert actual_entry['bytes'] == e['bytes']
            declared[str(p)] = actual_entry; verified.append(actual_entry)
    return {'seal': actual, 'verifiedOriginalEntries': len(verified), 'exactActualEntries': verified}


if (OWN / 'pending-preparation.first.freeze.json').exists():
    raise RuntimeError('The pending checkpoint is sealed; final reviewed preparation requires separate outputs')

stamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
seals = {
    'Author194': original_seal(IMAGE / 'final-flora-fauna20-raster-native-author-input.freeze.json', 'a0e466c3ecb503ee73188c39a1545fd4a91e3adc7a321081f040b7a233b1f180', ['files']),
    'ACompletedOriginal20': original_seal(A / 'completed-native-D20-P20.independent-a.final.freeze.json', '9ffe99c7896a78c6d5c5aa595e28ab03845126c2ccfabba85556311dc02e5d31', ['frozenFiles']),
    'BOriginal20': original_seal(B / 'independent-b.completed-flora-fauna20.exact-input-output.first.freeze.json', '793f049c0a0e3539204e4b67c333afb0f658c31f955e61ffceba48865de308b2', ['inputFiles', 'ownOutputFiles']),
}

source_plan = read(AUTHOR / 'candidate/twenty-image-only-field-patches.guarded-plan.json')
selected = [r['goalId'] for r in source_plan['rows']]
assert len(selected) == 20 and len(set(selected)) == 20 and selected[13] == PENDING_ID
selected_set = set(selected)
before_paths = {
    'canonical': source_plan['sourceLandscapePath'],
    'kinds': 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',
    'qa': 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json',
    'registry': 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
    'ledger': 'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json',
    'floors': 'app/scripts/config/curriculum-maturity-floor-policy.json',
}
if not (ROOT / before_paths['floors']).exists():
    registry = read(ROOT / before_paths['registry'])
    raise RuntimeError('Locate the actual protected maturity-floor path before preparing guards')
before = {k: binding(ROOT / p) for k, p in before_paths.items()}
for k, p in before_paths.items(): write('before/' + k + '.json', (ROOT / p).read_bytes())
canonical = read(ROOT / before_paths['canonical'])
old_goals = {g['id']: g for g in canonical['goals']}
original_before = read(AUTHOR / 'candidate/canonical.before-twenty-links.exact.json')
original_candidate = read(AUTHOR / 'candidate/canonical.current474-twenty-new-raster-author.json')
assert canonical == original_before, 'Rebase on current canonical before applying this source plan'
assert binding(ROOT / before_paths['canonical'])['sha256'] == source_plan['actualSourceLandscapeSha256']
new_goals = {g['id']: g for g in original_candidate['goals']}
assert len(old_goals) == len(new_goals) == 474
assert {k for k in old_goals if old_goals[k] != new_goals[k]} == selected_set
for gid in selected:
    c = copy.deepcopy(new_goals[gid]); c.pop('resourceLinks', None)
    o = copy.deepcopy(old_goals[gid]); o.pop('resourceLinks', None)
    assert c == o

baseline_path = OLD / 'biologie-human20-reviewed-active-integration-root-v1/active-after-human20-central.actual.json'
baseline = read(baseline_path)
by_subject = {s['subject']: s for s in baseline['subjects']}
bio = by_subject['biologie']
assert bio['denominator'] == 391 and bio['strictComplete'] == 154
assert len(bio['strictCompleteGoalIds']) == 154 and not set(bio['strictCompleteGoalIds']) & selected_set
assert by_subject['mathematik']['strictComplete'] == by_subject['mathematik']['denominator'] == 807
assert by_subject['physik']['strictComplete'] == by_subject['physik']['denominator'] == 478
ledger = read(ROOT / before_paths['ledger'])
assert len(ledger['activeBatchConfigPaths']) == 7
registry = read(ROOT / before_paths['registry'])
registry_bio = next(s for s in registry['subjects'] if s['subject'] == 'biologie')
prior_selected = []
for path in registry_bio['resolutionIndexPaths']:
    d = read(ROOT / path)
    overlap = selected_set & (set(d.get('batchGoalIds', [])) | {r['goalId'] for r in d.get('resolutions', [])})
    if overlap: prior_selected.append({'path': path, 'overlap': sorted(overlap)})
assert not prior_selected, 'Existing D route needs explicit current supersession analysis'

a_v = {r['goalId']: r for r in read(A / 'actual-twenty-V-first-independent-a.verdicts.json')['records']}
b_v = {r['goalId']: r for r in read(B / 'V20.actual-image-width-native-page.independent-b.json')['verdicts']}
a_binding = read(A / 'P20.exact-final-author-input.binding.json')
assert binding(ROOT / a_binding['path'])['sha256'] == a_binding['sha256'].removeprefix('sha256:')
author_p = rows(ROOT / a_binding['path'])
b_p = {r['goalId']: r for r in rows(B / 'P20.current-raster-independent-b.review.jsonl')}
assert len(author_p) == len(b_p) == 20
paired = []
for a in author_p:
    gid = a['goalId']; b = b_p[gid]
    for k in ['profile', 'profileFingerprint', 'goalFingerprint', 'reviewInputFingerprint', 'reviewCriteriaFingerprint', 'evidenceLevel', 'maximumClaimScope', 'status', 'reviewAuthority']:
        assert a[k] == b[k], (gid, k)
    assert a['status'] == 'needs_human_review' and a['reviewAuthority'] == 'ai_candidate'
    assert a['evidenceLevel'] == 'E1' and a['maximumClaimScope'] == 'G1'
    assert b['dissent'][:len(a['dissent'])] == a['dissent']
    av = a_v[gid]; bv = b_v[gid]
    same_raster = av['actualObservedFullRaster']['sha256'] == bv['actualFullImage']['sha256']
    assert same_raster
    if gid != PENDING_ID:
        assert av['scientificAndVisualVerdict'] == bv['status'] == 'PASS'
        assert av['machineCandidateDecision'] == bv['decision'] == 'KEEP'
    else:
        assert bv['decision'] == 'HOLD' and bv['status'] == 'OPEN_LABEL_ALLOCATION'
    paired.append({'goalId': gid, 'ordinal': selected.index(gid) + 1, 'originalWholePBodyAndBindingsExact': True,
        'nativePositiveStatusRetained': 'needs_human_review / ai_candidate / E1 / G1',
        'sourceScientificDissentRetained': a['dissent'], 'extraIndependentBDissentRetained': b['dissent'][len(a['dissent']):],
        'originalAVisualVerdict': av['scientificAndVisualVerdict'], 'originalBVisualVerdict': bv['status'],
        'originalActualRaster': av['actualObservedFullRaster'], 'originalAVerbatimObservation': av,
        'originalBVerbatimObservation': bv,
        'currentApprovalState': 'approval_pending' if gid == PENDING_ID else 'genuine_original_pair_PASS_pending_final_package_bindings',
        'newScientificReviewOrRun': False, 'humanApproval': False})

native = AUTHOR / 'native-raster-candidate/twenty'
input_a = read(native / 'round-a/description-review-input.json')
input_b = read(native / 'round-b/description-review-input.json')
assert input_a == input_b
campaigns = {r: read(native / ('round-' + r) / 'description-review-campaign.json') for r in ['a', 'b']}
assert campaigns['a']['independenceGroupId'] != campaigns['b']['independenceGroupId']
assert campaigns['a']['blindToOtherReviews'] and campaigns['b']['blindToOtherReviews']
d_original = {}
for letter, source in [('a', A), ('b', B)]:
    bid = campaigns[letter]['batches'][0]['batchId']
    run_path = source / ('round-' + letter) / 'results' / (bid + '.run.json')
    record_path = source / ('round-' + letter) / 'results' / (bid + '.records.jsonl')
    run = read(run_path); recs = rows(record_path)
    assert run['blindToOtherRuns'] and run['independenceGroupId'] == campaigns[letter]['independenceGroupId']
    assert len(recs) == 20 and {r['goalId'] for r in recs} == selected_set
    assert all(r['decision'] == 'keep' for r in recs)
    d_original[letter] = {'originalCampaign': binding(native / ('round-' + letter) / 'description-review-campaign.json'),
        'originalWholeInput': binding(native / ('round-' + letter) / 'description-review-input.json'),
        'originalRun': binding(run_path), 'originalRecords': binding(record_path), 'records': 20,
        'independenceGroupId': run['independenceGroupId'], 'noRunManifestRecreated': True}

am = read(AUTHOR / 'current-twenty-retained-AM.exact-binding.author.receipt.json')
for retained in am['retained']:
    assert binding(ROOT / retained['originalPath'])['sha256'] == retained['originalSha256']
    assert binding(ROOT / retained['exactRowsPath'])['sha256'] == retained['exactRowsSha256']
memory_closure = read(OLD / 'biologie-flora-fauna20-current391-author-v1/retained-current-AM/existing-flower-memory-shared-deck-closure.actual.receipt.json')
am_b = read(B / 'whole-goal-case-profile-retained-AM-bindings.independent-b.actual.json')
assert am_b['errors'] == [] and am_b['retainedOriginalARows'] == am_b['retainedOriginalMRows'] == 20
assert am_b['retainedFlowerCardRows'] == 3

models = {k: read(AUTHOR / ('native-raster-candidate/' + name)) for k, name in [
    ('before', 'full391.before-twenty-links.pure.book-model.json'), ('original20', 'full391.book-model.json')]}
assert len(models['before']['pages']) == len(models['original20']['pages']) == 391
before_page = {p['goalId']: p for p in models['before']['pages']}
assert {p['goalId'] for p in models['original20']['pages'] if p['pageFingerprint'] != before_page[p['goalId']]['pageFingerprint']} == selected_set

write('pending/pair-original20-current-guard.plan.json', {
    'artifactKind': 'inactive-pending-Flora20-original-pair-current-guard', 'recordedAt': stamp,
    'selectedGoalIds': selected, 'approvalPendingGoalIds': [PENDING_ID], 'beforeBindings': before,
    'seals': {k: v['seal'] for k, v in seals.items()}, 'originalDWholePair': d_original,
    'baselineStrictReport': binding(baseline_path), 'protected154StrictGoalIds': bio['strictCompleteGoalIds'],
    'currentWhole474GoalsGuard': binding(ROOT / before_paths['canonical']),
    'current391GoalDenominator': 391, 'exactOther454WholeGoals': True, 'originalExactOther371PageFingerprints': True,
    'protectedMath807AndPhys478': True, 'existingSevenChemistryLedgerPathsRetain': ledger['activeBatchConfigPaths'],
    'noPriorDForSelected20': True, 'goalTextChanges': 0, 'prerequisiteChanges': 0, 'applicabilityChanges': 0,
    'memoryCardVisibilityAndDeckChange': 0, 'nativeFinalPairedSynthesisComplete': False,
    'finalRegistryPatchPrepared': False, 'activeApplyPermittedByThisPendingPlan': False,
    'nextRequiredInputs': ['Actual selected Ord14 v4+ native/page/resource bindings', 'Actual independent A/B targeted Ord14 current verdict seals', 'Native current D/P paired synthesis and whole391 compatibility checks'],
    'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False,
})
write('pending/original-paired-20-D-P-and-nineteen-V.technical.json', {
    'artifactKind': 'custody-of-actual-paired-science-not-new-review', 'recordedAt': stamp,
    'originalWholeDPKEEP': 20, 'actualPairedOriginalVKEEP': 19,
    'approvalPendingGoalIds': [PENDING_ID], 'records': paired,
    'noNewReviewerRuns': True, 'noNewScientificJudgments': True, 'activeWrites': 0, 'strictGainClaimed': 0,
})
write('pending/retained-current-AM-and-memory-card-scope.technical.json', {
    'artifactKind': 'retained-valid-AM-and-real-shared-deck-traces', 'recordedAt': stamp,
    'authorExactBindingReceipt': binding(AUTHOR / 'current-twenty-retained-AM.exact-binding.author.receipt.json'),
    'wholeRetainedReceipt': am, 'existingActualSharedDeckClosure': memory_closure,
    'independentBCurrentBindingsReceipt': binding(B / 'whole-goal-case-profile-retained-AM-bindings.independent-b.actual.json'),
    'retainedCurrentA20': True, 'retainedCurrentM20': True, 'retainedThreeFlowerCards': True,
    'scopeRule': 'Preserve actual existing linked memorization node and seven additional existing shared-deck origin goals for native full-deck tracing; do not invent new scientific reviews for them.',
    'newScienceOrDeckOrVisibilityDecision': False, 'ownNativeChecksRerun': False, 'activeWrites': 0,
})
write('pending/original-seal-verification.actual.json', {'recordedAt': stamp, 'seals': seals, 'mismatches': [], 'scientificReviewClaimedFromHashes': False})
write('pending/declared-actual-inputs.technical.json', {'recordedAt': stamp, 'files': list(declared.values()), 'liveReferencedInputsOnlyRead': True})
print(json.dumps({'stage': 'approval_pending14', 'original194InputsExact': True, 'wholeDP20Pair': True,
    'original19VPair': True, 'retainedAM20AndThreeFlowerCards': True, 'baseline154': True,
    'unselected454BodiesAnd371OriginalPages': True, 'activeWrites': 0, 'strictGain': 0}))
