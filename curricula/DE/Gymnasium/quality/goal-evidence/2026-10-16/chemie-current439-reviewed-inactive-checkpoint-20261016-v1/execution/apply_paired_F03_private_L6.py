"""Apply exact independently reviewed F03 successor in the private capsule only."""
from pathlib import Path
from datetime import datetime, timezone
import copy
import hashlib
import json
import os
import sys

R = Path('/home/enpasos/projects/skillpilot')
T = R / 'tmp/chemie-m7-resumed-20261016'
L = T / 'chemie-shared640-recycling-native-author-capsule-L6-v1'
A = T / 'HE-G9-F03-current-independent-a-v1'
B = T / 'HE-G9-F03-current-independent-b-v1'
AUTHOR = T / 'HE-G9-F03-one-coherent-solubility-crystallisation-investigation-author-candidate-v1'
E = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/'
OLD = E + 'chemie-current438-paired413-and-fuel-private-L6-technical-20261016-v1/'
OLD_MODEL = E + 'chemie-current438-HE-BY-reviewed-P6-private-L6-technical-20261016-v1/'
NEW = E + 'chemie-current439-paired-F03-private-L6-technical-20261016-v1/'
C = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
S = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
Q = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
M = 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json'
G = '8b2d351e-e44f-5385-9b89-13ef54b5918f'

def read(p): return json.loads(p.read_text())
def sha(p): return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def encoded(obj): return (json.dumps(obj, ensure_ascii=False, indent=2) + '\n').encode()
def pin(p): return {'path': str(p.relative_to(R)), 'sha256': sha(p)}

review_pins = [
    (A/'OUTPUTS.F03-source-A-M-P-and-retained-V-independent-a.sealed.selector.json',
     '077074d6b6f4f15974a349195d83b72bbf3475b9e0d9133f397d002cfc5af3b5'),
    (B/'OUTPUTS.F03-independent-b.inactive-review.selector.json',
     'd9249e14399b04493fdace1535fd2fa48c6d132f06ed02104fb59712e2852a56'),
    (AUTHOR/'OUTPUTS.one-coherent-F03-investigation-whole-goal-P-source-five-views.AUTHOR.selector.json',
     '08f23e15a35f10769803a52d75e5a455c3b5efc03e5dbc9320ae8493ce130414'),
]
for path, digest in review_pins:
    assert sha(path) == 'sha256:' + digest
    doc = read(path)
    if path.parent != AUTHOR:
        assert doc.get('decision', doc.get('boundedDecision')) == 'KEEP'
    for value in doc.get('artifacts', []):
        assert sha(R/value['path']) == value['sha256']

normal = sha(R/C)
assert normal == 'sha256:9a68501347031f266572dea551e71c3507b66fb5ed94142a1a99f6a282708960'
before_pin = sha(L/C)
assert before_pin == 'sha256:dea9c237f18ce47b5d0e5b7bcc6bf35eb966e6e529deeaffae7975fb2d0309c9'
before = read(L/C)
canonical = copy.deepcopy(before)
by = {g['id']:g for g in canonical['goals']}
ops = read(AUTHOR/'CAS.new-WHOLE-goal-and-composable-6b6-parent-append.AUTHOR.inactive.json')['operations']
for op in ops:
    assert by.get(op['goalId']) == op['before']
    by[op['goalId']] = op['after']
assert by[G] == read(AUTHOR/'NEW.WHOLE-goal.8b2d351e.ACTUAL-IMAGE-BOUND.AUTHOR.inactive.json')
canonical['goals'] = [by[g['id']] for g in before['goals']] + [by[G]]
assert len(canonical['goals']) == 641
parent = ops[1]['goalId']
assert all(by[g['id']] == g for g in before['goals'] if g['id'] != parent)
assert sum(g['id'] != parent for g in before['goals']) == 639
writes = {C: encoded(canonical)}
for name in ['CAS.TWO-WHOLE-F03-source-and-mapping.new-partial-partner-against-sealed413v2.AUTHOR.inactive.json',
             'CAS.FIVE-WHOLE-SekI-and-CrossStage-views.new-F03-only.AUTHOR.inactive.json']:
    for op in read(AUTHOR/name)['operations']:
        assert read(L/op['path']) == op['before'], op['path']
        writes[op['path']] = encoded(op['after'])

sem = read(L/S)
sem_by = {r['goalId']:r for r in sem['decisions']}
assert G not in sem_by
op = read(A/'SEM1.existing-parent-append-source-binding-only.technical.json')
assert sem_by[parent] == op['before']
sem['decisions'] = [op['after'] if r['goalId'] == parent else r for r in sem['decisions']]
sem['decisions'].append(read(A/'SEM1.new-goal-own-classification-proposal.not-full-ledger.json')['after'])
assert len(sem['decisions']) == 641
assert sum(r['semanticKind'] == 'curricularAtomic' for r in sem['decisions']) == 439
writes[S] = encoded(sem)
qa = read(L/Q)
assert len(qa['records']) == 461 and all(r['goalId'] != G for r in qa['records'])
qa_one = read(A/'VQA1.exact-previously-reviewed-native-PNG.byte-exact.json')
assert len(qa_one['records']) == 1
v = qa_one['records'][0]
assert v['goalId'] == G and v['aiApproved'] == 'yes' and v['humanApproved'] == 'no'
for key in ['canonicalAssetPath','publicAssetPath']:
    assert sha(L/v[key]) == v['assetSha256'] == 'sha256:5ab0d74e268f86c8adffe1385fbf20e62f84099bab9877a501f66e29e502adeb'
qa['records'].append(v)
writes[Q] = encoded(qa)

for prefix, original in [('A1','A1.new-F03.actual-independent.atomic.review.jsonl'),
                         ('M1','M1.new-F03.actual-independent.no-memory.review.jsonl'),
                         ('P1','P1.new-F03.actual-independent.E1G1.asset-bound.review.jsonl')]:
    writes[NEW+original] = (A/original).read_bytes()
    config = read(A/(prefix+'.ROOT-FINAL-after-actual-append-only.config.json'))
    config['reviewPath'] = NEW+original
    if prefix == 'M1':
        config['cardReviewPath'] = NEW+'M1.empty-scoped-card-records.jsonl'
        writes[config['cardReviewPath']] = b''
    if prefix == 'P1':
        config['reviewCriteriaPath'] = 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'
        assert sha(L/config['reviewCriteriaPath']) == 'sha256:4ed61d2a8c7eb84dd13315427d46989b4750f58620481e19023b145935025835'
    writes[NEW+prefix+'.same-own-independent-identity.normal-address.config.json'] = encoded(config)

mcfg = read(L/M)
old_m = (L/mcfg['reviewPath']).read_bytes().splitlines(keepends=True)
assert len(old_m) == 438 and all(json.loads(line)['goalId'] != G for line in old_m)
mcfg['reviewPath'] = NEW+'M439.exact438-whole-lines-plus-own-F03.review.jsonl'
writes[mcfg['reviewPath']] = b''.join(old_m) + (A/'M1.new-F03.actual-independent.no-memory.review.jsonl').read_bytes()
writes[M] = encoded(mcfg)
old_p = (L/(OLD+'P438.retained437-plus-current-own-fuel-row.for-native-model.jsonl')).read_bytes().splitlines(keepends=True)
assert len(old_p) == 438 and all(json.loads(line)['goalId'] != G for line in old_p)
writes[NEW+'P439.exact438-whole-lines-plus-own-F03.for-native-model.jsonl'] = b''.join(old_p) + (A/'P1.new-F03.actual-independent.E1G1.asset-bound.review.jsonl').read_bytes()
central = read(L/(OLD+'central.current438.paired413-fuel.D-pending.private.config.json'))
subject = next(s for s in central['subjects'] if s['subject'] == 'chemie')
subject['semanticAtomicityConfigPaths'].append(NEW+'A1.same-own-independent-identity.normal-address.config.json')
subject['positiveEvidenceConfigPaths'].append(NEW+'P1.same-own-independent-identity.normal-address.config.json')
assert len(subject['semanticAtomicityConfigPaths']) == 75 and len(subject['positiveEvidenceConfigPaths']) == 109
writes[NEW+'central.current439.paired-F03.D-pending.private.config.json'] = encoded(central)
view = read(L/(OLD_MODEL+'VIEW.full438.final-native-review-only.json'))
view['viewId'] = 'chemie-current439-full-ordinary-review-only-20261016-v1'
assert parent in json.dumps(view), 'Existing review-only view must expand the supplemented parent'
writes[NEW+'VIEW.full439.final-native-review-only.json'] = encoded(view)
bcfg = read(L/(OLD_MODEL+'base.full438.final-native-inputs.config.json'))
bcfg.update(bookId='chemie-current439-final-native-context-base-20261016-v1',
            compositionViewPath=NEW+'VIEW.full439.final-native-review-only.json',
            evidenceReviewPaths=[NEW+'P439.exact438-whole-lines-plus-own-F03.for-native-model.jsonl'],
            outputPath=NEW+'book-model.full439.actual-final-native-base.json')
writes[NEW+'base.full439.final-native-inputs.config.json'] = encoded(bcfg)

for rel, data in writes.items():
    if rel.endswith('.json'):
        json.loads(data)
    elif rel.endswith('.jsonl'):
        for line in data.splitlines(): json.loads(line)
receipt = {'role':'Actual private exact paired F03 integration; no newly authored review vote',
           'createdAtUTC':datetime.now(timezone.utc).isoformat(),
           'reviews':[pin(p) for p,_ in review_pins],
           'beforeCanonical':before_pin,'oldWholeGoalsRetainedExactly':639,
           'oldParentChange':'contains append only','wholeGoals':641,'ordinaryCurrent':439,
           'newGoalId':G,'sourceMappingFiles':2,'viewFiles':5,
           'wholeP438AndM438LinesRetained':True,'newIndependentP':'E1/G1 ai_candidate needs_human_review',
           'newIndependentMemory':'no_memory_needed','newIndependentV':'exact PNG; no HumanApproval',
           'nativeDAndFinalJurisdictionPending':True,'strictNewClosuresClaimed':0,
           'normalWrites':0,'HumanApproval':False,'HumanTrial':False,'M7Claim':False}
if '--apply' not in sys.argv:
    print(json.dumps({'mode':'DRY RUN','files':len(writes),'wholeBeforeGuards':'PASS','ordinary':439}));sys.exit()

def own_directory(p):
    if p == L:
        assert p.is_dir() and not p.is_symlink();return
    assert p.is_relative_to(L)
    own_directory(p.parent)
    if p.is_symlink():
        children = list(p.resolve(strict=True).iterdir())
        p.unlink();p.mkdir()
        for child in children:
            (p/child.name).symlink_to(child.resolve(),target_is_directory=child.is_dir())
    else: p.mkdir(exist_ok=True)
    assert p.resolve().is_relative_to(L.resolve())

assert not (T/'EXECUTION.actual-paired-F03-private-L6.integration.receipt.json').exists()
for rel in writes: own_directory((L/rel).parent)
assert sha(L/C) == before_pin
for rel, data in writes.items():
    dest = L/rel
    temp = dest.with_name(dest.name+'.F03-private.tmp')
    with temp.open('xb') as f: f.write(data)
    os.replace(temp,dest)
assert sha(R/C) == normal
receipt['afterCanonical'] = sha(L/C)
receipt['files'] = [{'path':rel,'sha256':sha(L/rel)} for rel in writes]
out = T/'EXECUTION.actual-paired-F03-private-L6.integration.receipt.json'
with out.open('x') as f: json.dump(receipt,f,ensure_ascii=False,indent=2);f.write('\n')
print(json.dumps({'mode':'APPLIED PRIVATE ONLY','whole':641,'ordinary':439,'files':len(writes),'canonical':receipt['afterCanonical'],'receipt':str(out.relative_to(R))}))
