# SPDX-License-Identifier: Apache-2.0
"""Adopt genuinely read sealed A/B judgments; no new scientific review or active write."""
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
AUTHOR = BASE / 'biologie-he7-ten-final-raster-native-author-root-20261008-v1'
A = BASE / 'biologie-he7-ten-final-raster-native-independent-a-20261008-v1'
B = BASE / 'biologie-he7-ten-final-raster-native-independent-b-20261008-v1'
DECLARED = {}
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def rel(p): return str(p.relative_to(ROOT))
def bind(p):
    b = {'path': rel(p), 'sha256': sha(p), 'bytes': p.stat().st_size}; DECLARED[b['path']] = b; return b
def read(p): bind(p); return json.loads(p.read_text())
def put(name, x):
    p = OWN / name; p.parent.mkdir(parents=True, exist_ok=True)
    data = (json.dumps(x, ensure_ascii=False, indent=2) + '\n').encode()
    if p.exists(): assert p.read_bytes() == data, p
    else: p.write_bytes(data)
    return p

guard = read(OWN / 'checks/current192-neutral-ten-baseline.technical.json')
for b in list(guard['beforeBindings'].values()) + guard['otherProtectedFiles']:
    p = ROOT / b['path']; assert sha(p) == b['sha256'] and p.stat().st_size == b['bytes']; bind(p)
seals = {}
for label, folder, name, expected in [
    ('author', AUTHOR, 'ten-current-raster-native-author-input.first.freeze.json', 'd49f60eaeefc970611d3fb2203fe8f6ac185107f954caaa1fe8a1b33fdcdcfd6'),
    ('A', A, 'completed-native-D10-P10-V10.independent-a.final.freeze.json', 'edcc9a3e6d0b64f6f080a3d753d4bca6f15baf6df255c9f477c52b6078bb8888'),
    ('B', B, 'completed-ten-D-P-V-native-checks-portability.independent-b.final.freeze.json', '3bd9a2b20f0a16739c6bd1cb1310653505dcd2bb85235178365523e5daf52640')]:
    p = folder / name; assert sha(p) == expected; value = read(p)
    rows = value.get('frozenFiles', value.get('ownFiles'))
    for b in rows:
        q = ROOT / b['path']; assert sha(q) == b['sha256'] and q.stat().st_size == b['bytes']; bind(q)
    seals[label] = {'seal': bind(p), 'actualExactFiles': len(rows)}
first = {}
for label, folder, name, expected in [
    ('A', A, 'first-current-ten-D-P-V.independent-a.exact.freeze.json', 'dd4d666689f4e9cc2e5e736f485ecda00fc24be33381a7972eac02ed2232ff7c'),
    ('B', B, 'ten-genuine-current-D-P-V.independent-b.first.freeze.json', '93bbc0a9f2d940e98396de167cf37f6fb029efac3d1b89c825236e93f20cdeec')]:
    p = folder / name; assert sha(p) == expected; first[label] = bind(p)
av = read(A / 'actual-ten-full-PNG-widths-native-pages-V.independent-a.first.verdict.json')
bv = read(B / 'ten-actual-PNG-width-native-page-V.independent-b.first.verdicts.json')
ascience = read(A / 'actual-whole-ten-science-P-source-context-retention.independent-a.receipt.json')
bscience = read(B / 'ten-whole-current-D-P-source-AM-native-page.independent-b.first.verdict.json')
ap = read(A / 'P10.exact-inactive-native-api.independent-a.actual.json')
bp = read(B / 'P10.actual-inactive-schema-semantics-original-PNG.independent-b.receipt.json')
source = AUTHOR / 'native-raster-candidate/P10.actual-raster-author.review.jsonl'; bind(source)
profiles = [json.loads(x) for x in source.read_text().splitlines()]
assert sha(source) == ap['exactPositiveInputDigest']
assert bp['exactPositiveInputPath'] == rel(source)
for r in [ap, bp]:
    assert r['schemaErrors'] == r['semanticErrors'] == r['approved'] == 0
    assert r['configuredGoals'] == r['needsHumanReview'] == 10
assert ascience['peerFinalBReadBeforeSeal'] is False and bv['peerAFinalOutputsRead'] is False
assert bscience['D10'] == 'KEEP' and bscience['wholeP10Science'] == 'PASS_SCOPED_E1_G1'
ids = guard['selectedGoalIds']; selected = set(ids)
assert set(x['goalId'] for x in av['records']) == set(x['goalId'] for x in bv['records']) == selected
paired = []
qa = read(OWN / 'candidate/visualization-qa.pending-pair.future-active.json')
oldqa = read(OWN / 'before/qa.json')
for gid in ids:
    a = next(r for r in av['records'] if r['goalId'] == gid)
    b = next(r for r in bv['records'] if r['goalId'] == gid)
    p = next(r for r in profiles if r['goalId'] == gid)
    aa = next(r for r in ap['checked'] if r['goalId'] == gid)
    bb = next(r for r in bp['records'] if r['goalId'] == gid)
    assert a['decision'] == b['decision'] == 'KEEP' and a['fachlich'] == b['fachlich'] == a['visual'] == b['visual'] == 'PASS'
    assert a['actualFullRaster'] == b['actualImage']
    for key in ['path', 'sha256', 'bytes']: assert a['actualNativePage'][key] == b['actualNativePage'][key]
    assert [x['sha256'] for x in a['actualBothWidths']] == [x['sha256'] for x in b['actualWidths']]
    assert all(b[x] for x in ['fullPNGActuallyViewed','actual360And680ActuallyViewed','actualWholeNativePageActuallyViewed'])
    for k in ['goalFingerprint','profileFingerprint','reviewInputFingerprint']: assert p[k] == aa[k] == bb[k]
    assert p['status'] == 'needs_human_review' and p['reviewAuthority'] == 'ai_candidate' and p['evidenceLevel'] == 'E1' and p['maximumClaimScope'] == 'G1'
    assert a['actualFullRaster']['sha256'] == aa['exactActualImageDigest'].removeprefix('sha256:') == bb['actualOriginalRasterSha256']
    row = {'goalId': gid, 'actualA': a, 'actualB': b, 'pairDecision': 'KEEP', 'wholeScience': 'PASS', 'wholePScience': 'PASS_SCOPED_E1_G1', 'newScienceReviewRuns': 0}
    paired.append(row)
    q = next(r for r in qa['records'] if r['goalId'] == gid)
    q.update({'aiApproved': 'yes', 'aiApprovedAssetSha256': q['assetSha256'],
      'aiNotes': 'Genuine independently first-sealed full PNG, 360/680 and whole native-page A/B KEEP. A seal: ' + seals['A']['seal']['path'] + '; B seal: ' + seals['B']['seal']['path'] + '. A: ' + a['substantiveActualObservationsDe'] + ' B: ' + b['actualReasonDe'] + ' Synthetic E1/G1 only; no actual experiment, learner evidence or human approval.'})
    old = next(r for r in oldqa['records'] if r['goalId'] == gid)
    for k in old:
        if k.startswith('human'): assert q[k] == old[k]
assert all(r == next(q for q in qa['records'] if q['goalId'] == r['goalId']) for r in oldqa['records'] if r['goalId'] not in selected)
put('candidate/visualization-qa.future-active.json', qa)
inert = copy.deepcopy(qa)
for q in inert['records']:
    if q['goalId'] in selected:
        a = next(r for r in av['records'] if r['goalId'] == q['goalId'])
        q['publicAssetPath'] = q['canonicalAssetPath'] = a['actualFullRaster']['path']
put('candidate/visualization-qa.inactive-native.json', inert)
put('checks/genuine-ten-pair-current192-ready.technical.json', {**{k:v for k,v in guard.items() if k != 'B'},
    'seals': seals, 'independentFirstSeals': first, 'actualReviewerResults': {'a': rel(A / 'round-a/results'), 'b': rel(B / 'round-b/results')},
    'actualPairedV': paired, 'actualWholeA': ascience, 'actualWholeB': bscience,
    'adoptionScope': 'Actual read genuine ten whole A/B judgments; technical adoption only, no new science review, no historical restart.',
    'actualNativeP10': {'schemaErrors': 0, 'semanticErrors': 0, 'needsHumanReview': 10, 'approved': 0},
    'machineVApprovalsPrepared': 10, 'newScienceReviewRuns': 0, 'actualExperiments': 0, 'humanApproval': False, 'humanTrial': False})
put('checks/genuine-ten-pair-declared-inputs.technical.json', {'files': list(DECLARED.values())})
print(json.dumps({'genuineSealedPair': 10, 'preparedV': 10, 'wholeP': 'E1/G1 needs_human_review', 'activeWrites': 0, 'strictGainClaimed': 0}))
