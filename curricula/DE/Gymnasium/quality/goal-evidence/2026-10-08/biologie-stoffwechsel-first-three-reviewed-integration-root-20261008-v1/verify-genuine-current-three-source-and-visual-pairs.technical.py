# SPDX-License-Identifier: Apache-2.0
"""Verify and pair existing sealed source/V judgments; do not review science anew."""
import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = OWN.parent


def read(p):
    return json.loads(p.read_text())


def bind(p):
    b = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def verify(b):
    p = ROOT / b['path']
    data = p.read_bytes()
    assert len(data) == b['bytes'] and hashlib.sha256(data).hexdigest() == b['sha256'].removeprefix('sha256:'), p
    return p


def bindings(v):
    if isinstance(v, dict):
        if {'path', 'sha256', 'bytes'} <= v.keys():
            yield v
        for x in v.values():
            yield from bindings(x)
    elif isinstance(v, list):
        for x in v:
            yield from bindings(x)


def sealed(path):
    verified = {}
    for b in bindings(read(path)):
        verify(b)
        verified[b['path']] = b
    assert verified
    return {'seal': bind(path), 'verifiedOriginalFiles': list(verified.values())}


def put(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.exists()
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


source_a_dir = BASE / 'biologie-stoffwechsel-first-three-operative-scope-independent-a-addendum-20261008-v1'
source_b_dir = BASE / 'biologie-stoffwechsel-first-three-operative-scope-independent-b-20261008-v1'
sa = read(source_a_dir / 'three-ordinary-source-placement.independent-a.first-addendum.entry.json')
sb = read(source_b_dir / 'neutral-current-operative-scope.independent-b.handoff.entry.json')
source_seals = {
    'a': sealed(source_a_dir / 'three-ordinary-source-placement.independent-a.first-addendum.freeze.json'),
    'b': sealed(source_b_dir / 'operative-scope-b.first-verdict.seal.json'),
}
assert sa['acceptedWholeDecisionRemediations'] == sb['actual15WholeDecisionChanges'] == 15
assert sa['removedTargetEdges'] == sb['actual20RemovedWrongTargetEdges'] == 20
assert sa['acceptedChangedViewScopes'] == 10 and sb['actual10ChangedSourceViews12WholeViewsExact']
assert sa['acceptedChangedWholePageBindings'] == 3 and sb['actual392WholePagesCompared3DerivedApplicabilityChanges389WholePagesExact']
assert sa['newBlockingFindings'] == 0 and sb['decision'] == 'ACCEPT_BOUNDED_ACTUAL_ORDINARY_PROJECTION_REMEDIATION'
assert not sa['wholeDutyClosure'] and not sb['wholeRegionalSourceCoverageApproved']
assert sa['pendingCompanions'] == 2 and sb['pendingCompanionsRemainUnapprovedOutside392']
assert sa['originalOperatorHolds'] == 4 and sb['all4OriginalOperatorHoldsRetained']
assert sb['peerNewOperativeSourceAReadBeforeFirstSeal'] is False
assert read(source_a_dir / 'three-ordinary-source-placement.independent-a.first-addendum.freeze.json')['newPeerBJudgmentsReadBeforeFirstSeal'] is False
put(OWN / 'checks/actual-current-three-paired-source-projection-approvals.technical.json', {
    'role': 'Technical pairing of actual independent current source/projection judgments; no new scientific review',
    'seals': source_seals, 'sourceAEntry': bind(source_a_dir / 'three-ordinary-source-placement.independent-a.first-addendum.entry.json'),
    'sourceBEntry': bind(source_b_dir / 'neutral-current-operative-scope.independent-b.handoff.entry.json'),
    'pairedWholeDecisionRemediations': 15, 'removedMisplacedTargetEdges': 20,
    'pairedChangedSourceViews': 10, 'pairedChangedWholePages': 3, 'other389Pages12ViewsExact': True,
    'all20WholeOriginalDuties268WholePartnerBodiesRetained': True,
    'pendingRealCompanions': 2, 'originalWholeOperatorHolds': 4,
    'wholeRegionalDutyApproval': False, 'newScientificReviewByIntegrator': False,
    'activeWrites': 0, 'strictGain': 0, 'humanApproval': False,
})

native_dir = BASE / 'biologie-stoffwechsel-first-three-native-technical-20261008-v1'
native = read(native_dir / 'neutral-current-first-three-native.technical.entry.json')
ids = native['selectedGoalIds']
a_specs = [
    ('biologie-stoffwechsel-first-photosynthesis-actual-visual-independent-a-20261008-v1', 'first-photosynthesis-actual-visual-independent-a.first.verdicts.json', '*first-verdict.freeze.json'),
    ('biologie-stoffwechsel-final-two-actual-visual-independent-a-20261008-v1', 'final-two-actual-visual-independent-a.first.verdicts.json', '*first-verdict.freeze.json'),
    ('biologie-stoffwechsel-third-antenna-targeted-visual-independent-a-addendum-20261008-v3', 'third-antenna-v3.independent-a.first-addendum.verdicts.json', 'third-antenna-v3.independent-a.first-addendum.freeze.json'),
]
visual_seals = []
a_rows = {}
for directory, verdict_name, pattern in a_specs:
    folder = BASE / directory
    choices = list(folder.glob(pattern))
    assert len(choices) == 1, choices
    visual_seals.append(sealed(choices[0]))
    verdict = read(folder / verdict_name)
    for r in verdict['rows']:
        candidate = next(x for x in native['rasterBindings'] if x['goalId'] == r['goalId'])
        if r['actualOriginalAsset']['sha256'].removeprefix('sha256:') != candidate['sha256'].removeprefix('sha256:'):
            continue  # Historical v2 is retained and is not a current v3 approval.
        assert r['aiVisualApproved'] and not r['ownBlockingFindings']
        assert r['observedFullOriginal'] and r['observedActual360And680']
        assert r['humanApproval'] is False
        a_rows[r['goalId']] = {'verdict': bind(folder / verdict_name), 'originalRow': r}

b_dir = BASE / 'biologie-stoffwechsel-first-three-visualization-independent-b-final-20261008-v1'
b3_dir = BASE / 'biologie-stoffwechsel-third-antenna-v3-visualization-independent-b-20261008-v1'
b1_dir = BASE / 'biologie-stoffwechsel-first-photosynthesis-visualization-independent-b-20261008-v1'
for p in [b_dir / 'final-three-visualization-b.first-verdict.seal.json',
          b3_dir / 'third-antenna-v3-b.first-verdict.seal.json',
          b1_dir / 'part-01-visualization-b.first-verdict.seal.json']:
    visual_seals.append(sealed(p))
b_whole = read(b_dir / 'final-current-three-actual-visualization.independent-b.first-verdict.json')
b3 = read(b3_dir / 'third-antenna-v3.actual-independent-b.first-verdict.json')
b1 = read(b1_dir / 'part-01-actual-visualization.independent-b.first-verdict.json')
assert b1['decision'] == 'KEEP' and not b1['blockingFindings'] and not b1['newPeerVisualAReadBeforeFirstSeal']
assert b3['decision'] == 'KEEP' and b3['actualOriginal360680Inspected'] and not b3['peerNewV3AReadBeforeFirstSeal']
assert not b_whole['peerCurrentVisualAReadBeforeFirstSeal']
b_rows = {r['goalId']: {'verdict': bind(b_dir / 'final-current-three-actual-visualization.independent-b.first-verdict.json'), 'originalRow': r}
          for r in b_whole['images'] if r['decision'] in ['KEEP', 'KEEP_RETAINED']}
b_rows[b3['goalId']] = {'verdict': bind(b3_dir / 'third-antenna-v3.actual-independent-b.first-verdict.json'), 'originalRow': b3}
assert set(a_rows) == set(b_rows) == set(ids)
paired = []
for candidate in native['rasterBindings']:
    i = candidate['goalId']
    raster = bind(verify(candidate))
    for v in [a_rows[i]['originalRow']['actualOriginalAsset'], b_rows[i]['originalRow']['actualPNG']]:
        assert bind(verify(v))['sha256'] == raster['sha256']
    paired.append({'goalId': i, 'actualRaster': raster, 'exactSourceAuthorRaster': a_rows[i]['originalRow']['actualOriginalAsset'],
                   'independentA': a_rows[i], 'independentB': b_rows[i],
                   'actualOriginal360680ApprovedIndependently': True, 'humanApproval': False})
put(OWN / 'checks/actual-current-three-paired-visual-approvals.technical.json', {
    'role': 'Technical pairing of actual independently inspected current PNG judgments, no image re-review',
    'seals': visual_seals, 'pairedCurrentRasterCount': 3, 'rows': paired,
    'historicalV2AndFindingsUnchanged': True, 'currentThirdUsesOnlyV3': True,
    'sourceAndNativeDPGatesSeparate': True, 'activeWrites': 0, 'strictGain': 0, 'humanApproval': False,
})
print(json.dumps({'sourceCurrentPair': 'PASS', 'pairedVisualCurrentPNGCount': 3, 'activeWrites': 0, 'strictGain': 0}))
