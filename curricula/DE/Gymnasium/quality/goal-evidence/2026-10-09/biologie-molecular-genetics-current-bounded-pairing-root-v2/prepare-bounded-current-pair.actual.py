# SPDX-License-Identifier: Apache-2.0
"""Pair completed independent readings without promoting pending native gates."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
OWN = Path(__file__).resolve().parent
checked = {}


def read(path):
    return json.loads(path.read_text())


def binding(path):
    raw = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)),
            'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def verify(value):
    path = ROOT / value['path']
    actual = binding(path)
    assert actual['sha256'] == value['sha256'].removeprefix('sha256:'), path
    assert 'bytes' not in value or actual['bytes'] == value['bytes'], path
    checked[actual['path']] = actual


def verify_tree(value):
    if isinstance(value, dict):
        if isinstance(value.get('path'), str) and isinstance(value.get('sha256'), str):
            verify(value)
        for child in value.values():
            verify_tree(child)
    elif isinstance(value, list):
        for child in value:
            verify_tree(child)


root_dir = BASE / 'biologie-molecular-genetics-last-seven-independent-v-root-v1'
a_dir = BASE / 'biology-molecular-genetics-last-seven-independent-v-a-v1'
paths = {
    'rootFirst': root_dir / 'seven-actual-rasters.pixel-FIRST.independent-root.verdict.json',
    'rootMetadata': root_dir / 'last-seven-current-v3-metadata.actual-independent-root.followup.json',
    'rootFinal': root_dir / 'neutral-completed-last-seven-actual-pixels-and-current-v3-metadata.independent-root.review.entry.json',
    'aFirst': a_dir / 'last-seven-actual-rasters.pixel-FIRST.independent-A.verdict.json',
    'aFinal': a_dir / 'neutral-completed-last-seven-actual-images17-to23-independent-A.review.entry.json',
    'selected': BASE / 'biologie-molecular-genetics-twenty-three-whole-author-v1/images-author-v1/all-twenty-three-current-crossing-over-successor-v4/neutral-all23-current-selected-images-with-one-crossing-over-raster-v4.author-review.entry.json',
    'prosaB': BASE / 'biologie-molecular-genetics-twenty-three-whole-independent-b-v1/remediation-v6-three-prosa-independent-followup-v1/three-current-v6-profiles-six-cases.independent-b.prosa-first.verdict.json',
    'v9B': BASE / 'biology-molecular-genetics-eight-to-sixteen-independent-v-b-v1/nine-actual-original360680.independent-b.visual-first.verdict.json',
    'v15B': BASE / 'biology-molecular-genetics-eight-to-sixteen-independent-v-b-v1/one-crossing-over-successor-v5-independent-followup-v1/one-actual-crossing-over-v5.independent-b.post-first-caption-provenance.verdict.json',
}
data = {key: read(path) for key, path in paths.items()}
for key in ['rootFinal', 'aFinal']:
    verify_tree(data[key])
for path in paths.values():
    verify(binding(path))
a_records_path = ROOT / data['aFinal']['candidateVRecords']['path']
a_records = [json.loads(line) for line in a_records_path.read_text().splitlines() if line.strip()]
selected = {row['ordinal']: row for row in data['selected']['entries']}
rfirst = {row['ordinal']: row for row in data['rootFirst']['results']}
rmeta = {row['ordinal']: row for row in data['rootMetadata']['results']}
afirst = {row['ordinal']: row for row in data['aFirst']['rows']}
arecords = {row['ordinal']: row for row in a_records}
assert set(rfirst) == set(rmeta) == set(afirst) == set(arecords) == set(range(17, 24))
pairs = []
for ordinal in range(17, 24):
    r, m, a, record, current = (rfirst[ordinal], rmeta[ordinal], afirst[ordinal],
                              arecords[ordinal], selected[ordinal])
    assert len({row['goalId'] for row in [r, m, a, record, current]}) == 1
    assert r['pixelDecision'].startswith('KEEP') or r['pixelDecision'].startswith('PASS_KEEP')
    assert a['pixelVerdict'] == record['decision'] == 'PASS_KEEP_RASTER_CANDIDATE'
    assert record['resourceLinkCandidate'] == current['resourceLinkCandidate']
    assert m['caption'] == current['descriptionDe'] and m['altText'] == current['altTextDe']
    for candidate in [r['actualAssetBinding'], m['actualAssetBinding'], a['selectedOriginal'],
                      record['assetBinding'], current['assetBinding']]:
        verify(candidate)
        assert candidate['sha256'].removeprefix('sha256:') == current['assetBinding']['sha256'].removeprefix('sha256:')
    pairs.append({'ordinal': ordinal, 'goalId': current['goalId'],
                  'actualAsset': current['assetBinding'], 'resourceLink': current['resourceLinkCandidate'],
                  'rootPixelFirstPointer': f'/results/{ordinal - 17}',
                  'aPixelFirstPointer': f'/rows/{ordinal - 17}',
                  'twoActualOriginal360680Reviews': True,
                  'currentCaptionAltMatched': True,
                  'decision': 'BOUNDED_RASTER_AND_METADATA_PAIR_READY_FOR_NATIVE_BINDING'})
open_v = [row['ordinal'] for row in data['v9B']['results'] if row['candidateDecision'].startswith('HOLD')]
assert open_v == [10, 11, 12, 14, 15, 16]
assert data['v15B']['candidateDecision'].startswith('HOLD')
prosa_holds = [row for row in data['prosaB']['results'] if row['remainingIssues']]
assert len(prosa_holds) == 1 and prosa_holds[0]['ordinal'] == 23
out = OWN / 'seven-last-current-raster-pairs-and-open-dissents.actual.json'
assert not out.exists(), 'Historical pair must not be overwritten'
value = {
    'schemaVersion': 1, 'role': 'technical_pair_of_actual_independent_bounded_reviews',
    'createdAt': datetime.now(timezone.utc).isoformat(),
    'reviewInputs': {key: binding(path) for key, path in paths.items()},
    'sevenLastPairs': pairs,
    'rootPriorAuthorCaptionExposureOrdinal': 17,
    'rootOwnFirstDisclosureRetained': True,
    'openVisualOrdinals': open_v, 'current15SuccessorStillOpen': True,
    'openCurrentKaryogramCaseRubricFinding': prosa_holds[0]['remainingIssues'],
    'actualByteChecks': list(checked.values()), 'bindingErrors': [],
    'nativeDescriptionPositiveOrCurrentVApproval': False,
    'newWholeScientificReviewClaim': False, 'unchangedReviewsRestarted': False,
    'newScientificClosures': 0, 'restoredBindings': 0, 'strictNetGain': 0,
    'activeWrites': False, 'humanApproval': False, 'humanTrial': False,
}
out.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'sevenBoundedPairs': len(pairs), 'openVisualOrdinals': open_v,
                  'openRubricOrdinal': 23, 'actualByteChecks': len(checked),
                  'output': binding(out), 'strictNetGain': 0}))
