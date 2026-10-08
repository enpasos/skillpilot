# SPDX-License-Identifier: Apache-2.0
"""Inactive current192 rebase; genuine final B and paired approvals still pending."""
from pathlib import Path
import copy
import hashlib
import json

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
AUTHOR = BASE / 'biologie-he7-ten-final-raster-native-author-root-20261008-v1'
A = BASE / 'biologie-he7-ten-final-raster-native-independent-a-20261008-v1'
IMAGE = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-he7-ten-image-author-root-20261008-v1'
DECLARED = {}
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def rel(p): return str(p.relative_to(ROOT))
def bind(p):
    b = {'path': rel(p), 'sha256': sha(p), 'bytes': p.stat().st_size}; DECLARED[b['path']] = b; return b
def read(p): bind(p); return json.loads(p.read_text())
def put(name, value):
    p = OWN / name; p.parent.mkdir(parents=True, exist_ok=True)
    data = value if isinstance(value, bytes) else (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()
    if p.exists(): assert p.read_bytes() == data, p
    else: p.write_bytes(data)
    return p
seals = {}
for label, folder, name, expected in [
    ('author', AUTHOR, 'ten-current-raster-native-author-input.first.freeze.json', 'd49f60eaeefc970611d3fb2203fe8f6ac185107f954caaa1fe8a1b33fdcdcfd6'),
    ('A', A, 'completed-native-D10-P10-V10.independent-a.final.freeze.json', 'edcc9a3e6d0b64f6f080a3d753d4bca6f15baf6df255c9f477c52b6078bb8888')]:
    p = folder / name; assert sha(p) == expected
    value = read(p); rows = value.get('frozenFiles', value.get('ownFiles'))
    for b in rows:
        q = ROOT / b['path']; assert sha(q) == b['sha256'] and q.stat().st_size == b['bytes']; bind(q)
    seals[label] = {'seal': bind(p), 'actualExactFiles': len(rows)}
paths = {
    'canonical': 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',
    'kinds': 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',
    'qa': 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json',
    'atomicityConfig': 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.config.json',
    'memoryConfig': 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.config.json',
    'registry': 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
    'ledger': 'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json',
    'floors': 'app/scripts/config/curriculum-maturity-floor-policy.json',
}
before = {}
for k, path in paths.items():
    p = ROOT / path; before[k] = bind(p); put('before/' + k + '.json', p.read_bytes())
assert before['canonical']['sha256'] == 'e73e217a363ef52da6bcb4063767279daca28054412593da7571f6a6ac59492e'
root_review = BASE / 'biologie-he9-one-reviewed-active-integration-root-v1'
central_path = root_review / 'active-after-one-central.actual.json'; central = read(central_path)
terminal = read(root_review / 'active-after-one-central.exit.actual.json')
delta = read(root_review / 'exact-current-strict-plus-one-delta.actual.json')
assert terminal['exitCode'] == 0 and delta['afterStrict'] == 192 and central['blockingIssueCount'] == 0
subjects = {s['subject']: s for s in central['subjects']}
assert subjects['biologie']['strictComplete'] == 192 and subjects['biologie']['denominator'] == 391
assert subjects['chemie']['strictComplete'] == 173 and subjects['chemie']['denominator'] == 378
assert subjects['mathematik']['strictComplete'] == subjects['mathematik']['denominator'] == 807
assert subjects['physik']['strictComplete'] == subjects['physik']['denominator'] == 478
put('before/current192-central.actual.json', central_path.read_bytes())
canon = read(ROOT / paths['canonical']); whole = read(AUTHOR / 'current10-whole-DEEN-goals.actual.json')['goals']
ids = [g['id'] for g in whole]; selected = set(ids)
assert len(ids) == 10 and len(canon['goals']) == 474
assert not selected.intersection(subjects['biologie']['strictCompleteGoalIds'])
original = copy.deepcopy(canon); by = {g['id']: g for g in canon['goals']}
reviewed = {g['id']: g for g in read(AUTHOR / 'candidate/canonical.current474-ten-new-raster-author.json')['goals']}
for g in whole:
    assert by[g['id']] == g
    next_goal = reviewed[g['id']]
    modified = copy.deepcopy(g); modified['resourceLinks'] = next_goal['resourceLinks']
    assert modified == next_goal
    by[g['id']]['resourceLinks'] = copy.deepcopy(next_goal['resourceLinks'])
assert all(g == by[g['id']] for g in original['goals'] if g['id'] not in selected)
candidate = put('candidate/canonical.ten-current192-future-active.json', canon)
put('candidate/semantic-kinds.future-active.json', (ROOT / paths['kinds']).read_bytes())
kind = read(ROOT / paths['kinds']); kind['sourceLandscapePath'] = rel(candidate)
put('candidate/semantic-kinds.inactive-native.json', kind)
images = read(IMAGE / 'selected-ten-author-images.exact.json')['images']; copies = []
qa = read(ROOT / paths['qa']); qa_before = copy.deepcopy(qa)
for im in images:
    gid = im['goalId']; assert gid in selected and sha(ROOT / im['path']) == im['sha256']
    for destination in [f'curricula/DE/Gymnasium/visualizations/biologie/{gid}/{gid}.png', f'app/public/assets/goal-visualizations/biologie/{gid}/{gid}.png', f'backend/src/main/resources/static/assets/goal-visualizations/biologie/{gid}/{gid}.png']:
        assert not (ROOT / destination).exists()
        copies.append({'source': bind(ROOT / im['path']), 'target': destination, 'expectedBefore': 'missing'})
    for src, name in [(im['promptPath'], 'prompt.de.md'), (im['toolProvenancePath'], 'generation.actual.provenance.json')]:
        destination = f'curricula/DE/Gymnasium/visualizations/biologie/{gid}/{name}'; assert not (ROOT / destination).exists()
        copies.append({'source': bind(ROOT / src), 'target': destination, 'expectedBefore': 'missing'})
    q = next(r for r in qa['records'] if r['goalId'] == gid)
    assert q['visualizationState'] == 'missing'
    q.update({'visualizationState': 'available', 'missingReason': '', 'imageUrl': reviewed[gid]['resourceLinks'][0]['url'],
        'publicAssetPath': f'app/public/assets/goal-visualizations/biologie/{gid}/{gid}.png',
        'canonicalAssetPath': f'curricula/DE/Gymnasium/visualizations/biologie/{gid}/{gid}.png', 'assetSha256': 'sha256:' + im['sha256'],
        'aiApproved': 'no', 'aiApprovedAssetSha256': '', 'aiNotes': 'Technical pending placeholder: genuine final A sealed; final B and paired current native/raster approval pending. No machine approval from generation.'})
assert len(copies) == 50
assert all(q == next(r for r in qa['records'] if r['goalId'] == q['goalId']) for q in qa_before['records'] if q['goalId'] not in selected)
put('candidate/visualization-qa.pending-pair.future-active.json', qa)
inert = copy.deepcopy(qa)
for q in inert['records']:
    if q['goalId'] in selected:
        im = next(i for i in images if i['goalId'] == q['goalId']); q['canonicalAssetPath'] = q['publicAssetPath'] = im['path']
put('candidate/visualization-qa.pending-pair.inactive-native.json', inert)
guards = []
for subject in ['MATHEMATIK', 'PHYSIK', 'CHEMIE']:
    guards.append(bind(ROOT / f'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_{subject}.de.json'))
am = {}
for label in ['atomicityConfig', 'memoryConfig']:
    c = read(ROOT / paths[label]); am[label] = {'config': before[label], 'currentReview': bind(ROOT / c['reviewPath'])}; guards.append(am[label]['currentReview'])
    for field in ['cardReviewPath']:
        if field in c: guards.append(bind(ROOT / c[field]))
    for scope in c.get('visibilityScopes', []): guards.append(bind(ROOT / scope['viewPath']))
for path in ['curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.review.jsonl', 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.review.jsonl', 'app/public/data/de_gymnasium_biology_flashcards_core.de.json', 'app/public/data/de_gymnasium_biology_flashcards_core.en.json']:
    guards.append(bind(ROOT / path))
ledger = read(ROOT / paths['ledger']); assert len(ledger['activeBatchConfigPaths']) == 7
for path in ledger['activeBatchConfigPaths']: guards.append(bind(ROOT / path))
put('checks/current192-neutral-ten-baseline.technical.json', {'seals': seals, 'B': 'pending final first seal; no B files read, no paired synthesis or machine approval yet',
    'beforeBindings': before, 'selectedGoalIds': ids, 'wholeOtherGoalBodiesExact': 464, 'changedGoalFields': ['resourceLinks'], 'copies': copies,
    'baselineStrictActual': {'biology': 192, 'denominator': 391, 'terminalExit': 0, 'central': bind(central_path)},
    'currentActualAMPathsProtected': am, 'otherProtectedFiles': guards, 'allSevenChemistryClaimsExact': ledger['activeBatchConfigPaths'],
    'classifierAndAMWritesPlanned': 0, 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False})
put('checks/initial-declared-inputs.technical.json', {'files': list(DECLARED.values())})
print(json.dumps({'baselineActual': '192/391', 'candidateTenLinkChanges': 10, 'exactOtherWholeGoals': 464, 'assetCopiesPlanned': 50, 'AReviewed': True, 'BFinal': 'pending', 'activeAMConfigsRetained': True, 'activeWrites': 0, 'strictGainClaimed': 0}))
