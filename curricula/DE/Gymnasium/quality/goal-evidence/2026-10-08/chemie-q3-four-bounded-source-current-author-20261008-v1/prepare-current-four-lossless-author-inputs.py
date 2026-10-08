# SPDX-License-Identifier: Apache-2.0
"""Freeze bounded, lossless source-role inputs; author preparation is not approval."""
from pathlib import Path
from datetime import datetime, timezone
import copy, hashlib, json, os, re, shutil, subprocess

R = Path.cwd()
D = Path(__file__).resolve().parent
O = D.parent / 'chemie-q3-twenty-whole-science-source-author-20261008-v1'
IDS = ['d9cce642-4f89-57f8-832a-abeb62586195', '3eada74b-25b8-55dc-811a-acb473196f53',
       '0908b3a2-9937-57de-8bfb-35a6de54aa1f', '94a62b39-d4a2-5882-99d1-6886ead07726']
REQ = {}
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def rel(p): return str(Path(p).relative_to(R))
def bind(p):
    p = Path(p); v = {'path': rel(p), 'sha256': sha(p), 'bytes': p.stat().st_size}
    REQ[v['path']] = v
    return v
def load(p): return json.loads(Path(p).read_text())
def put(name, value):
    p = D / name; p.parent.mkdir(parents=True, exist_ok=True)
    b = (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()
    if p.exists(): assert p.read_bytes() == b, p
    else:
        t = p.with_suffix(p.suffix + '.tmp'); t.write_bytes(b); os.replace(t, p)
    return bind(p)
def cp(p, name):
    p = Path(p); q = D / name; q.parent.mkdir(parents=True, exist_ok=True)
    if q.exists(): assert p.read_bytes() == q.read_bytes(), q
    else: shutil.copyfile(p, q)
    return bind(q)

before = {}
for k, p in [
    ('canonical', 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),
    ('kinds', 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'),
    ('qa', 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'),
    ('registry', 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'),
    ('floors', 'app/scripts/config/curriculum-maturity-floor-policy.json'),
    ('atlasConfig', 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json'),
    ('atlasInputs', 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')]:
    before[k] = {'originalLocator': p, 'originalDigestAtSnapshot': sha(R / p), 'snapshot': cp(R / p, f'before/{k}.exact.json')}
assert before['canonical']['originalDigestAtSnapshot'] == '94663b2a3eb0a88ba1b54efc7ba8d0db4ff2a80878708023436500a7c0cef99b'
canon = load(R / before['canonical']['snapshot']['path']); goals = {g['id']: g for g in canon['goals']}
assert len(goals) == 480
kinds = load(R / before['kinds']['snapshot']['path'])
assert sum(x['semanticKind'] == 'curricularAtomic' for x in kinds['decisions']) == 378
original = {g['id']: g for g in load(O / 'frozen-inputs/01.DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')['goals']}
for i in IDS: assert goals[i] == original[i], i
put('scope-four.current480.whole-goals.exact.json', {'goalIds': IDS, 'originalOrdinals': [6, 8, 14, 17], 'wholeCurrentGoals': [goals[i] for i in IDS]})

whole = load(O / 'source/whole-all-current-source-goals-and-1n-partners.lossless.json')
edges = load(O / 'whole20.original-source-duties.all-current-partners.json')
assert len(edges) == whole['matchedEdges'] == 1602 and whole['uniqueSourceDuties'] == 929
assert sum(len(x['allPartnerRows']) for x in whole['sourceGoals']) == 5459
selected = [e for e in edges if e['mappingRow']['canonicalGoalId'].split(':')[-1] in IDS]
keys = {e['mappingPath'] + '#' + e['sourceGoal']['id'] for e in selected}
duties = [d for d in whole['sourceGoals'] if d['sourceKey'] in keys]
assert len(selected) == 155 and len(duties) == 106 and sum(len(d['allPartnerRows']) for d in duties) == 528
assert [sum(e['mappingRow']['canonicalGoalId'].split(':')[-1] == i for e in selected) for i in IDS] == [26, 23, 53, 53]
cp(O / 'source/whole-all-current-source-goals-and-1n-partners.lossless.json', 'source/whole929-duties-1602-edges-5459-partners.exact-retained.json')
cp(O / 'whole20.original-source-duties.all-current-partners.json', 'source/whole1602-original-edges.exact-retained.json')
put('source/selected155-original-source-edges.exact-retained.json', selected)
put('source/selected106-whole-duties-and528-all-partners.exact-retained.json', duties)
source_files = []
for n, p in enumerate(sorted({e[k] for e in edges for k in ['mappingPath', 'sourceExtractionPath']})):
    current = load(R / p)
    frozen = None
    # All source bytes stay exactly current; frozen author rows are checked against
    # actual current mappings/extractions rather than assumed from old counts.
    selected_rows = [e for e in edges if e['mappingPath'] == p or e['sourceExtractionPath'] == p]
    if 'mappingPath' in selected_rows[0] and selected_rows[0]['mappingPath'] == p:
        rs = current['mappings']
        for e in selected_rows: assert e['mappingRow'] in rs, (p, e['mappingRow'])
    else:
        gs = {g['id']: g for g in current['sourceGoals']}
        for e in selected_rows: assert gs[e['sourceGoal']['id']] == e['sourceGoal'], (p, e['sourceGoal']['id'])
    source_files.append({'originalLocator': p, 'originalDigestAtSnapshot': sha(R / p), 'snapshot': cp(R / p, f'source/full-current-files/{n:02d}.{Path(p).name}')})
partner_inputs = []
for d in duties:
    ps = []
    for row in d['allPartnerRows']:
        i = row['canonicalGoalId'].split(':')[-1]
        assert i in goals, (d['sourceKey'], i)
        ps.append({'originalPartnerRow': row, 'wholeCurrentCanonicalPartner': goals[i], 'inThisFourGoalScope': i in IDS,
                   'newWholePartnerApprovalClaim': False})
    partner_inputs.append({'sourceKey': d['sourceKey'], 'wholeOriginalDuty': d, 'wholeCurrentCanonicalPartners': ps})
put('source/selected106-whole-duty-current528-partner-body-contexts.json', partner_inputs)

material = load(O / 'whole40.material-task-model-scoring-fresh-transfer.de-en.author-candidate.json')
cs = [c for c in material['cases'] if c['goalId'] in IDS]
assert len(cs) == 8 and all(c['wholeCurrentGoal'] == goals[c['goalId']] for c in cs)
cp(O / 'whole40.material-task-model-scoring-fresh-transfer.de-en.author-candidate.json', 'science/whole40-original-immutable-material.exact-retained.json')
put('science/whole8-material-task-model-ten-point-scoring-fresh-transfer.de-en.exact-retained.json', {
    'schemaVersion': material['schemaVersion'], 'contentLicense': material['contentLicense'], 'caseCount': 8, 'goalCount': 4,
    'cases': cs, 'status': 'original-genuine-pair-science-KEEP-source-followup-pending',
    'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'humanTrial': False, 'performedExperiment': False, 'actualLearnerPerformance': False})
prs = [json.loads(l) for l in (O / 'native/p20.author-candidate.review.jsonl').read_text().splitlines()]
put('science/original-four-closed-v2-P-whole-records.exact-retained.json', [p for p in prs if p['goalId'] in IDS])
cp(O / 'native/p20.native-materializer.candidates.json', 'science/whole20-original-P-materializer.exact-retained.json')
science = []
for side, name, key in [
    ('a', 'whole20-science-source-A-P.independent-a.first.verdicts.json', 'rows'),
    ('b', 'whole20-whole40-science-source-atomicity.independent-b.first.verdict.json', 'verdicts')]:
    folder = D.parent / f'chemie-q3-twenty-whole-science-source-independent-{side}-20261008-v1'
    src = folder / name; data = load(src)
    rows = [x for x in data[key] if x['goalId'] in IDS]
    assert len(rows) == 4
    evidence = {'side': side, 'originalVerdictLocator': rel(src), 'originalVerdictDigest': sha(src),
                'wholeSelectedOriginalIndependentRows': rows, 'copy': cp(src, f'genuine-original-pair/{side}.{name}')}
    for p in folder.glob('*first.freeze.json'):
        evidence.setdefault('originalFirstSeals', []).append({'originalLocator': rel(p), 'originalDigest': sha(p), 'copy': cp(p, f'genuine-original-pair/{side}.{p.name}')})
    science.append(evidence)
put('genuine-original-pair/four-whole-science-KEEP-and-unresolved-source-role.truthful.json', {
    'originalIndependentRows': science,
    'sourceAPosition': 'BOUNDED_RETAIN_FULL_ROLE_CHECK_PENDING', 'sourceBPosition': 'PASS_bounded_original_source_role_only',
    'twoIndependentSourceClearancesClaimed': False, 'newScientificVerdictByTechnicalAuthor': False,
    'nativeDApproved': False, 'nativeVApproved': False, 'strictGain': 0, 'humanApproval': False})

reg = load(R / before['registry']['snapshot']['path']); chem = next(x for x in reg['subjects'] if x['subject'] == 'chemie')
mp = R / chem['memoryReviewConfigPath']; mc = load(mp)
cp(mp, 'memory/original-current-active.config.exact.json')
mr = cp(R / mc['reviewPath'], 'memory/current378.exact-retained.jsonl')
cr = cp(R / mc['cardReviewPath'], 'memory/current-cards.exact-retained.jsonl')
assert len((R / mr['path']).read_text().splitlines()) == 378
vs = []
for n, v in enumerate(mc['visibilityScopes']):
    vs.append({**v, 'viewPath': cp(R / v['viewPath'], f'memory/current-view-{n:02}.exact.json')['path']})
put('memory/current378-exact-retained.inactive.config.json', {**mc, 'landscapePath': before['canonical']['snapshot']['path'],
    'reviewPath': mr['path'], 'cardReviewPath': cr['path'], 'visibilityScopes': vs,
    'reportPath': rel(D / 'checks/retained378-M.actual.md')})

root_manifest = R / 'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-q3-three-specific-image-corrections-author-root-20261008-v1/selected-three-specific-image-corrections.author.json'
root_images = load(root_manifest); im = next(x for x in root_images['selected'] if x['goalId'] == IDS[0])
assert im['selectedVersion'] == 2
png = R / im['png']['path']; assert sha(png) == '4b4445b163514281a2acbc1f589d660bf7343156d695f9dc19efc4e2b60031d2'
cp(png, f'selected-images/{IDS[0]}.png')
for field, suffix in [('prompt', 'prompt.md'), ('exactRequest', 'exact-imagegen-request.json'), ('provenance', 'provenance.json')]:
    x = im[field]; p = R / x['path']; assert sha(p) == x['sha256']; cp(p, f'selected-images/{IDS[0]}.{suffix}')
images = [{**im, 'ownImage': bind(D / f'selected-images/{IDS[0]}.png'), 'decision': 'corrected-v2-author-candidate-independent-source-and-native-V-pending'}]
candidate = copy.deepcopy(canon)
for g in candidate['goals']:
    if g['id'] == IDS[0]:
        old = next(l for l in g['resourceLinks'] if l['type'] == 'goal-visualization' and l.get('role') == 'primary')
        old.update({'url': f'/assets/goal-visualizations/chemie/{IDS[0]}/{IDS[0]}.png',
                    'provider': 'OpenAI / ChatGPT-Codex image generation', 'license': 'CC-BY-4.0',
                    'reviewStatus': 'pilot', 'resourceType': 'image', 'skillpilotId': IDS[0], 'lang': 'de'})
for i in IDS[1:]:
    l = next(l for l in goals[i]['resourceLinks'] if l['type'] == 'goal-visualization' and l.get('role') == 'primary')
    assert l['url'].endswith('.jpg')
    img = cp(R / ('app/public' + l['url']), f'selected-images/{i}.jpg')
    images.append({'goalId': i, 'originalWholeVisualizationLink': l, 'ownImage': img, 'decision': 'KEEP-original-JPEG-no-fresh-independent-V-claim'})
cc = put('candidate/current480-only-goal6-corrected-v2-resource-link.inactive.json', candidate)
cb = {g['id']: g for g in candidate['goals']}; assert [i for i in goals if goals[i] != cb[i]] == [IDS[0]]
for i in goals:
    a, b = copy.deepcopy(goals[i]), copy.deepcopy(cb[i]); a.pop('resourceLinks', None); b.pop('resourceLinks', None); assert a == b
put('selected-images/four-author-image-decisions-and-complete-guide-link.json', {
    'rootOriginalManifestLocator': rel(root_manifest), 'rootOriginalManifestDigest': sha(root_manifest), 'images': images,
    'authorActuallySawGoal6OriginalScaleRaster': True, 'generatorIsNotApproval': True,
    'independentV': 'pending', 'sourceClearance': 'pending', 'activeCandidateInstallation': False})

docs = {}
for d in duties:
    for doc in [d.get('sourceDocument'), *(d.get('sourceDocuments') or [])]:
        if isinstance(doc, dict): docs[doc['path']] = doc
primary = []
for n, (p, doc) in enumerate(docs.items()):
    raw = R / p; assert raw.is_file(), raw
    name = f'{n:02}.{doc["key"]}'
    if raw.suffix == '.pdf':
        out = D / 'primary' / f'{name}.whole-original-portable.txt'; out.parent.mkdir(parents=True, exist_ok=True)
        s = subprocess.run(['pdftotext', '-layout', str(raw), '-'], check=True, capture_output=True).stdout
        if out.exists(): assert out.read_bytes() == s
        else:
            t = out.with_suffix('.tmp'); t.write_bytes(s); os.replace(t, out)
        portable = bind(out); fmt = 'pdftotext-layout-entire-original-PDF-physical-pages-preserved-by-form-feed'
    else:
        portable = cp(raw, f'primary/{name}.whole-original.json'); fmt = 'whole-original-authored-import-not-literal-official-HTML'
    primary.append({'originalSourceDocument': doc, 'actualOriginalLocalBytesDigest': sha(raw),
        'actualOriginalBytes': raw.stat().st_size, 'originalRawLocalPath': p, 'rawLocalCacheRequiredForPortableReview': False,
        'wholePortablePrimaryInput': portable, 'representation': fmt,
        'readAllPagesClaimByAuthor': False, 'currentLiveByteIdentityClaim': False})
put('primary/full-original-official-cached-inputs.portable-index.json', primary)
put('before/current-four-source-science-memory-image.guard.json', {
    'createdAt': datetime.now(timezone.utc).isoformat(), 'before': before, 'goalIds': IDS, 'currentWholeCanonicalGoals': 480,
    'currentCurricularAtomicGoals': 378, 'selectedDirectEdges': 155, 'selectedWholeSourceDuties': 106,
    'selectedAllPartnerRows': 528, 'allSourceEdges': 1602, 'allSourceDuties': 929, 'allSourcePartnerRows': 5459,
    'allActualCurrentSourceFiles': source_files, 'allOther479CanonicalGoalsInCandidateExact': True,
    'allWholeCurrentGoalBodiesExact': True, 'eightWholeOriginalDEENCasesExact': True,
    'candidateCanonical': cc, 'all378MemoryRowsCardsAndSevenViewsExact': True,
    'sourceRoleAPendingBPartialPASS': True, 'independentSourcePairCompleted': False,
    'nativeDFinalApproved': False, 'nativeVFinalApproved': False, 'nativeRasterCandidateInstallation': False,
    'activeWrites': 0, 'newStrictClosures': 0, 'humanApproval': False})
put('checks/prepared-own-required-portable-inputs.actual.json', {'files': list(REQ.values()), 'activeWrites': 0})
print(json.dumps({'wholeCanonical': 480, 'currentAtoms': 378, 'selectedEdges': 155, 'wholeDuties': 106,
                  'wholePartners': 528, 'originalCases': 8, 'primaryInputs': len(primary), 'activeWrites': 0}))
