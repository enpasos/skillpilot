# SPDX-License-Identifier: Apache-2.0
"""Synthesize already completed independent pixel/metadata decisions, not new reviews."""
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
checked = {}


def read(path):
    return json.loads(path.read_text())


def bind(path):
    raw = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix() if path.is_relative_to(ROOT) else str(path),
            'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def verify(value):
    path = ROOT / value['path']
    actual = checked.get(str(path))
    if actual is None:
        actual = checked[str(path)] = bind(path)
    assert actual['sha256'].removeprefix('sha256:') == value['sha256'].removeprefix('sha256:'), path
    assert 'bytes' not in value or actual['bytes'] == value['bytes'], path
    return path


def verify_tree(value):
    if isinstance(value, dict):
        if isinstance(value.get('path'), str) and isinstance(value.get('sha256'), str):
            verify(value)
        for child in value.values():
            verify_tree(child)
    elif isinstance(value, list):
        for child in value:
            verify_tree(child)


def put(path, value):
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


plan_path = OWN / 'current-twenty-three-ordinary-import-plan-one15.pending-final-independent-pairs.json'
plan = read(plan_path)
ops = {row['goalId']: row for row in plan['imageOperations']}
ordinals = {row['ordinal']: row['goalId'] for row in ops.values()}
assert len(ops) == len(ordinals) == 23

a_sources = [
    ('biology-molecular-genetics-first-seven-independent-v-a-v1/seven-bounded-candidate-V.independent-A.records.jsonl', {1, 2, 3, 4, 6}),
    ('biology-molecular-genetics-two-raster-remedies-independent-v-a-v1/current-five-seven-readable-metadata-only/two-current-readable-metadata-bounded-V-successor.independent-A.records.jsonl', {5, 7}),
    ('biology-molecular-genetics-eight-to-sixteen-independent-v-a-v1/nine-bounded-candidate-V.independent-A.records.jsonl', {8, 9, 13}),
    ('biology-molecular-genetics-six-targeted-phone-population-independent-v-a-v1/six-bounded-current-candidate-V.independent-A.records.jsonl', {10, 11, 12, 14, 16}),
    ('biology-molecular-genetics-one-crossing-over-locus-marker-independent-v-a-v1/one-marker-bounded-current-candidate-V.independent-A.records.jsonl', {15}),
    ('biology-molecular-genetics-last-seven-independent-v-a-v1/last-seven-bounded-candidate-V.independent-A.records.jsonl', set(range(17, 24))),
]
a_rows = {}
for relative, selected in a_sources:
    path = BASE / relative
    for n, line in enumerate(path.read_text().splitlines()):
        row = json.loads(line)
        gid = row['goalId']
        if gid not in {ordinals[x] for x in selected}:
            continue
        assert gid not in a_rows
        assert 'KEEP' in row['decision'] and 'HOLD' not in row['decision'], (gid, row['decision'])
        assert row['reviewAuthority'] == 'ai_candidate' and row['status'] == 'needs_human_review'
        assert row['humanApproval'] is False
        verify_tree(row)
        a_rows[gid] = (path, n, row)
assert set(a_rows) == set(ops)

b_rows = {}
composition_path = BASE / 'biology-molecular-genetics-first-seven-independent-v-b-v1/two-raster-remediation-independent-followup-v1/completed-current-seven-actual-visual-candidate-independent-b.entry.json'
composition = read(composition_path)
verify_tree(composition)
for row in composition['current7ActualCandidateBindings']:
    path = verify(row['ownActualVerdictBinding'])
    index = int(row['ownVerdictJsonPointer'].rsplit('/', 1)[1])
    actual = read(path)['results'][index]
    assert actual['goalId'] == row['goalId']
    b_rows[row['goalId']] = (path, '/results/' + str(index), actual, row['actualRaster'])

b9_path = BASE / 'biology-molecular-genetics-eight-to-sixteen-independent-v-b-v1/nine-actual-original360680.independent-b.visual-first.verdict.json'
for n, row in enumerate(read(b9_path)['results']):
    if row['ordinal'] in {8, 9, 13}:
        b_rows[row['goalId']] = (b9_path, '/results/' + str(n), row, row['actualOriginal'])

b6_path = BASE / 'biology-molecular-genetics-eight-to-sixteen-independent-v-b-v1/six-actual-phone-and-population-successors-independent-followup-v1/six-actual-original360680-successors.independent-b.visual-first.verdict.json'
for n, row in enumerate(read(b6_path)['decisions']):
    if row['ordinal'] in {10, 11, 12, 14, 16}:
        b_rows[row['goalId']] = (b6_path, '/decisions/' + str(n), row, row['actualOriginal'])

b1_base = BASE / 'biology-molecular-genetics-eight-to-sixteen-independent-v-b-v1/six-actual-phone-and-population-successors-independent-followup-v1/one-current-locus-marker-raster-successor-independent-v2'
b1_path = b1_base / 'one-current-marker-raster.independent-b.pixel-first.verdict.json'
b1 = read(b1_path)
verify_tree(b1)
b_rows[b1['goalId']] = (b1_path, '', b1, b1['selectedActualRaster'])

last_pair_path = BASE / 'biologie-molecular-genetics-current-bounded-pairing-root-v2/seven-last-current-raster-pairs-and-open-dissents.actual.json'
last_pair = read(last_pair_path)
verify_tree(last_pair)
root_last_path = verify(last_pair['reviewInputs']['rootFirst'])
root_last = {r['goalId']: r for r in read(root_last_path)['results']}
for row in last_pair['sevenLastPairs']:
    assert row['twoActualOriginal360680Reviews'] and row['currentCaptionAltMatched']
    actual = root_last[row['goalId']]
    b_rows[row['goalId']] = (root_last_path, row['rootPixelFirstPointer'], actual, row['actualAsset'])
assert set(b_rows) == set(ops)

metadata_entries = [
    BASE / 'biology-molecular-genetics-first-seven-independent-v-a-v1/neutral-completed-seven-actual-image-independent-A.review.entry.json',
    BASE / 'biology-molecular-genetics-first-seven-independent-v-b-v1/completed-seven-actual-independent-b.post-provenance.entry.json',
    composition_path,
    BASE / 'biology-molecular-genetics-two-raster-remedies-independent-v-a-v1/current-five-seven-readable-metadata-only/neutral-completed-two-readable-metadata-only.independent-A.review.entry.json',
    BASE / 'biology-molecular-genetics-first-seven-independent-v-b-v1/two-current-caption-alt-metadata-independent-followup-v1/completed-two-current-caption-alt-metadata-independent-b.entry.json',
    BASE / 'biology-molecular-genetics-eight-to-sixteen-independent-v-a-v1/neutral-completed-nine-actual-images8-to16-independent-A.review.entry.json',
    BASE / 'biology-molecular-genetics-eight-to-sixteen-independent-v-b-v1/completed-nine-actual-independent-b.post-provenance.entry.json',
    BASE / 'biology-molecular-genetics-six-targeted-phone-population-independent-v-a-v1/neutral-completed-six-targeted-actual-V-independent-A.review.entry.json',
    BASE / 'biology-molecular-genetics-eight-to-sixteen-independent-v-b-v1/six-actual-phone-and-population-successors-independent-followup-v1/completed-six-actual-successors.independent-b.post-provenance.entry.json',
    BASE / 'biology-molecular-genetics-one-crossing-over-locus-marker-independent-v-a-v1/neutral-completed-one-marker-actual-V-independent-A.review.entry.json',
    BASE / 'biology-molecular-genetics-one-crossing-over-locus-marker-independent-v-a-v1/portable-binding-successor-v2/one-marker-portable-metadata-binding-only.actual-independent-followup.json',
    b1_base / 'completed-one-current-marker-raster-independent-b.post-provenance.entry.json',
    verify(last_pair['reviewInputs']['rootFinal']),
    verify(last_pair['reviewInputs']['aFinal']),
]
for path in metadata_entries:
    verify_tree(read(path))

qa = {row['goalId']: row for row in read(ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')['records']}
paired_at = datetime.now(timezone.utc).isoformat()
pairs, patch = [], []
for ordinal in range(1, 24):
    gid = ordinals[ordinal]
    op = ops[gid]
    ap, an, ar = a_rows[gid]
    bp, pointer, br, raster = b_rows[gid]
    verify(raster)
    verify(op['actualImage'])
    expected = op['actualImage']['sha256'].removeprefix('sha256:')
    assert ar['assetBinding']['sha256'].removeprefix('sha256:') == raster['sha256'].removeprefix('sha256:') == expected, gid
    decision = br.get('candidateDecision', br.get('decision', br.get('pixelDecision', '')))
    assert 'KEEP' in decision and 'HOLD' not in decision, (gid, decision)
    assert br.get('humanApproval', False) is False
    link = copy.deepcopy(ar['resourceLinkCandidate'])
    link['title'] = op['reviewedResourceLink']['title']
    assert link == op['reviewedResourceLink'], gid
    if ordinal <= 7 or ordinal in {8, 9, 13}:
        assert ar['originalViewed'] and len(ar['actual360680Views']) == 2
    elif ordinal in {10, 11, 12, 14, 16}:
        assert ar['actualViewCount'] == 3
        assert br['actualOriginal360680IndividuallyViewed']
    elif ordinal == 15:
        assert len(b1['actualViews']) == 3 and all(v['actuallyIndividuallyViewed'] for v in b1['actualViews'])
    else:
        assert br['actualOriginalSeen'] and br['actualWidth360Seen'] and br['actualWidth680Seen']
    reason_a = json.dumps(ar['ownConcretePixelNotes'], ensure_ascii=False)
    reason_b = json.dumps({k: br[k] for k in ('scientificCorrectness', 'operativeGoalOrientation', 'phone360', 'desktop680', 'independentActualObservations', 'scientificCorrectnessDecision', 'phone360Decision', 'desktop680Decision', 'science', 'phoneReadability', 'scientificRationale', 'observations', 'style') if k in br}, ensure_ascii=False)
    assert reason_a and reason_b != '{}', (ordinal, gid, list(br))
    pair = {'ordinal': ordinal, 'goalId': gid, 'actualImage': op['actualImage'],
            'firstReviewer': 'Independent A', 'firstReview': bind(ap), 'firstJsonlLine': an + 1,
            'secondReviewer': 'Independent Root' if ordinal >= 17 else 'Independent B',
            'secondReview': bind(bp), 'secondJsonPointer': pointer,
            'actualOriginal360680Inspections': True, 'currentResourceLinkExact': True,
            'reasonA': reason_a, 'reasonBOrRoot': reason_b, 'decision': 'KEEP_CURRENT_EXACT_RASTER_AND_METADATA',
            'nativeDPairRequiredSeparately': True, 'humanApproval': False}
    pairs.append(pair)
    row = copy.deepcopy(qa[gid])
    assert row['visualizationState'] == 'missing'
    row.update(visualizationState='available', missingReason='', description=ar['wholeCurrentGoal']['description'],
               imageUrl=link['url'], publicAssetPath=f'app/public/assets/goal-visualizations/biologie/{gid}/{gid}.png',
               canonicalAssetPath=f'curricula/DE/Gymnasium/visualizations/biologie/{gid}/{gid}.png',
               assetSha256=op['actualImage']['sha256'], aiApproved='yes',
               aiApprovedAssetSha256=op['actualImage']['sha256'], aiReviewedAt=paired_at,
               aiReviewer='Technical pairing of actual sealed independent pixel/metadata reviews, with genuine native D reviewed separately',
               aiNotes=f"{pair['firstReviewer']}: {reason_a} {pair['secondReviewer']}: {reason_b} Exact technical pair: {str((OWN / 'checks/current23-genuine-V-pair.actual.json').relative_to(ROOT))}. Pairing date only; actual review dates stay sealed. No physical-device, learner-performance, human approval or trial is claimed.")
    assert {k: v for k, v in qa[gid].items() if k.startswith('human')} == {k: v for k, v in row.items() if k.startswith('human')}
    patch.append(row)

put(OWN / 'candidate/visualization-qa.twenty-three-actual-paired.future-active.patch.json', {'schemaVersion': 1, 'records': patch})
put(OWN / 'checks/current23-genuine-V-pair.actual.json', {
    'schemaVersion': 1, 'role': 'Technical synthesis of existing independent current pixel and metadata reviews; no new scientific review',
    'plan': bind(plan_path), 'visualPairs': pairs, 'actualMetadataEntries': [bind(p) for p in metadata_entries],
    'actualIndependentBindingsVerified': list(checked.values()),
    'current15ActualMarkerCounterfindingResolvedOnlyForNewExactRaster': True,
    'oldV6AndNativeD15BlockRecordsUnmodified': True,
    'rootLast7PriorOrdinal17AuthorCaptionExposureDisclosedInOwnFirst': True,
    'actualCurrentIndependentNativeDAndPPairsStillRequiredBeforeActiveAdoption': True,
    'other371QARowsAndAll394HumanFieldsToRemainUnchanged': True,
    'activeWrites': 0, 'strictGain': 0, 'newScientificClosures': 0, 'restoredBindings': 0,
    'humanApproval': False, 'humanTrial': False,
})
print(json.dumps({'genuineCurrentVisualPairs': len(pairs), 'activeWrites': 0, 'strictGain': 0}))
