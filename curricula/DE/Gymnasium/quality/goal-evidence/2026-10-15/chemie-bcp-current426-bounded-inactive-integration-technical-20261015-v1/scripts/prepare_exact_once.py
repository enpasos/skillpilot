# SPDX-License-Identifier: Apache-2.0
"""Prepare normal-address aliases only; no D pairing or central run before FIRSTs."""
import copy
import hashlib
import json
from pathlib import Path

REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]
E = OWN.parent
NORMAL_CANONICAL = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
NORMAL_SEMANTIC = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
NORMAL_QA = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'


def load(p):
    return json.loads(p.read_text())


def ref(p):
    b = p.read_bytes()
    return {'path': p.relative_to(REPO).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def verify(r):
    p = REPO / r['path']
    a = ref(p)
    assert a['sha256'] == r['sha256'] and a['bytes'] == r['bytes'], p
    return p


def put(p, obj):
    assert not p.exists(), p
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')


assert not (OWN / 'preparation/PREPARED.awaiting-two-fresh-D-FIRSTs.json').exists()
old = E / 'chemie-source4-current422-bounded-inactive-integration-technical-20261015-v1'
base = old / 'phase2/config/central.current422.source4.original-A-B-C.inactive.final.config.json'
assert ref(base)['sha256'] == 'sha256:66fa3787c92918c398a449829e5d9c7200cde2acd961c77b20a4bb4c6825747a'
cfg = load(base)
subject = cfg['subjects'][0]
pam_root = E / 'chemie-bcp-current426-normal-PAM-preparation-technical-20261015-v1'
pam_selector = pam_root / 'NEUTRAL.finite-normal-PAM-preparation.selector.json'
assert ref(pam_selector)['sha256'] == 'sha256:ac4c9592da2f46d3747fb8183398f7af36a3a5f2e5284ea91c765ed6db7d3fe3'
pam = load(pam_selector)
recipe = load(verify(pam['integrationRecipe']))
vsel = E / 'chemie-bcp-context-withdrawal-current-V-normal-bindings-technical-20261015-v1/OUTPUTS.finite-current-QA443-original-V10-and-cfaV6.global-HOLD.selector.json'
assert ref(vsel)['sha256'] == 'sha256:5425f14e46af09d97423e137174061f192643cb5c05cbdcbec1add3d4854f6a1'
v = load(vsel)
canonical = verify(v['canonical'])
semantic_original = verify(v['semantic'])
qa = verify(v['visualizationQA'])
original_sem = load(semantic_original)
normal_sem = copy.deepcopy(original_sem)
normal_sem['sourceLandscapePath'] = NORMAL_CANONICAL
sem_path = OWN / 'preparation/semantic570.current426.normal-address-only.json'
put(sem_path, normal_sem)
restored = copy.deepcopy(normal_sem)
restored['sourceLandscapePath'] = original_sem['sourceLandscapePath']
assert restored == original_sem

converted = {}
address_changes = []
for key, r in pam['normalConfigs'].items():
    src = verify(r)
    c = load(src)
    before = copy.deepcopy(c)
    c['landscapePath'] = NORMAL_CANONICAL
    if 'semanticKindLedgerPath' in c:
        c['semanticKindLedgerPath'] = NORMAL_SEMANTIC
    dst = OWN / 'preparation/config' / src.name
    put(dst, c)
    check = copy.deepcopy(c)
    check['landscapePath'] = before['landscapePath']
    if 'semanticKindLedgerPath' in c:
        check['semanticKindLedgerPath'] = before['semanticKindLedgerPath']
    assert check == before
    assert (REPO / c['reviewPath']).read_bytes() == (REPO / before['reviewPath']).read_bytes()
    converted[src.relative_to(REPO).as_posix()] = dst.relative_to(REPO).as_posix()
    address_changes.append({'original': r, 'normalAddressOnlyConfig': ref(dst), 'wholeRecordsUnchanged': True})

for field, replacements, additions in [
    ('positiveEvidenceConfigPaths', 'positiveConfigReplacements', 'positiveConfigAdditions'),
    ('semanticAtomicityConfigPaths', 'atomicityConfigReplacements', 'atomicityConfigAdditions'),
]:
    paths = subject[field].copy()
    for op in recipe[replacements]:
        verify(op['from'])
        verify(op['to'])
        assert paths.count(op['from']['path']) == 1
        paths[paths.index(op['from']['path'])] = converted[op['to']['path']]
    paths += [converted[op['path']] for op in recipe[additions]]
    assert len(paths) == len(set(paths))
    subject[field] = paths
subject['memoryReviewConfigPath'] = converted[recipe['memoryReviewConfigReplacement']['path']]
assert subject['resolutionIndexPaths'] == load(base)['subjects'][0]['resolutionIndexPaths']
assert subject['resolutionSupersessions'] == load(base)['subjects'][0]['resolutionSupersessions']
assert subject['resolutionWithdrawals'] == load(base)['subjects'][0]['resolutionWithdrawals']

atoms = {r['goalId'] for r in normal_sem['decisions'] if r['semanticKind'] == 'curricularAtomic'}
assert len(atoms) == 426
scope_inventory = {}
for field, scope_key in [('positiveEvidenceConfigPaths', 'goalIds'), ('semanticAtomicityConfigPaths', 'leafGoalIds')]:
    owners = {}
    for p in subject[field]:
        c = load(REPO / p)
        assert c['landscapePath'] == NORMAL_CANONICAL
        if field == 'positiveEvidenceConfigPaths':
            assert c['semanticKindLedgerPath'] == NORMAL_SEMANTIC
        for gid in c['scope'].get(scope_key, []):
            assert gid in atoms and gid not in owners, (field, gid, p)
            owners[gid] = p
    scope_inventory[field] = {'configs': len(subject[field]), 'explicitCurrentUniqueGoalIds': len(owners)}

mp = load(old / 'phase2/REBUILD.final-inactive-source4.reference-only-assets.physical-map.json')
mp['executionHost'] = 'tmp/chemie-m7-resumed-20261015/bcp-current426-inactive-integration-own-host-v1'
mp['role'] = 'New inactive current426 exact normal data addresses only; no renderer or central authorization'
sources = {NORMAL_CANONICAL: ref(canonical), NORMAL_SEMANTIC: ref(sem_path), NORMAL_QA: ref(qa)}
for row in mp['aliases']:
    if row['normalHostAlias'] in sources:
        row['physicalRepositorySource'] = sources[row['normalHostAlias']]
mp['canonical'] = ref(canonical)
mp['semantic'] = ref(sem_path)
mp['finalQA'] = ref(qa)
mp['finalMemory422Config'] = ref(REPO / subject['memoryReviewConfigPath'])
mp['finalMemory422Records'] = ref(REPO / load(REPO / subject['memoryReviewConfigPath'])['reviewPath'])
images = load(E / 'chemie-bcp-full426-single-placement-qs-view-pure-context-author-20261015-v1/inputs/TEN-actual-child-image-links-and-physical-source-map.author.json')
for r in images['rows']:
    verify(r['physicalRepositorySource'])
    url = r['imageUrl']
    mp['selectedCurrentAssetRows'] = [x for x in mp['selectedCurrentAssetRows'] if x['goalId'] != r['goalId']]
    mp['selectedCurrentAssetRows'].append({
        'goalId': r['goalId'], 'physicalRepositorySource': r['physicalRepositorySource'],
        'normalCanonicalDestination': 'curricula/DE/Gymnasium/visualizations/chemie/' + url.split('/chemie/')[1],
        'normalPublicDestination': 'app/public' + url,
        'publicMustBePhysicalWithinHostPublicRoot': False,
        'publicMaterialization': 'Read-only source reference in non-rendering integration host',
    })
mp['ROOTREADY'] = False
mp['centralAllowed'] = False
mp['actualCentralRuns'] = 0
mp['allowedAdditionalCentralRuns'] = 0
for key in ['finalCentralConfig', 'actualCentralReceipt', 'actualCentralRequiredChecks', 'newD4ResolutionIndex']:
    mp.pop(key, None)
map_path = OWN / 'preparation/REBUILD.current426.normal-address-only.physical-map.json'
put(map_path, mp)
fragment = OWN / 'preparation/subject.current426.PAM-only.awaiting-fresh-D.json'
put(fragment, subject)
put(OWN / 'preparation/PREPARED.awaiting-two-fresh-D-FIRSTs.json', {
    'role': 'Finite technical preparation only; not a runnable final Central config',
    'baseCentralConfig': ref(base), 'genuinePAMSelector': ref(pam_selector), 'genuineVSelector': ref(vsel),
    'canonical': ref(canonical), 'semanticHeaderAddressOnly': ref(sem_path), 'QA443': ref(qa),
    'normalConfigAddressChanges': address_changes, 'scopeInventory': scope_inventory,
    'subjectFragment': ref(fragment), 'privateHostRebuildMap': ref(map_path),
    'old88DIndexesAnd183SupersessionsAndFiveWithdrawalsUnchanged': True,
    'allOriginalScientificRecordsAndSemanticDecisionsUnchanged': True,
    'pending': ['Both genuine fresh independent D FIRSTs on actual15+9 Native pages', 'Successful original pairing and current bindings', 'Nine linear supersession append edges'],
    'globalApprovalCoverage': 'Existing four curricularArea image holds remain open, finalM7 blocked; no scoped BcP approval inferred for those images',
    'newScientificVotes': 0, 'newStrict': 0, 'centralRuns': 0, 'activeChanges': False,
    'ROOTREADY': False,
})
print(json.dumps({'prepared': ref(OWN / 'preparation/PREPARED.awaiting-two-fresh-D-FIRSTs.json'), 'scopes': scope_inventory, 'centralRuns': 0}))
