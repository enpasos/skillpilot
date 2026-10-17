"""Guarded private application of two finite independently reviewed successors."""
from pathlib import Path
from datetime import datetime, timezone
import copy
import hashlib
import json
import os
import sys

ROOT = Path('/home/enpasos/projects/skillpilot')
T = ROOT / 'tmp/chemie-m7-resumed-20261016'
L = T / 'chemie-shared640-recycling-native-author-capsule-L6-v1'
C = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
S = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
E = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/'
OLD = E + 'chemie-current438-HE-BY-reviewed-P6-private-L6-technical-20261016-v1/'
NEW = E + 'chemie-current438-paired413-and-fuel-private-L6-technical-20261016-v1/'
H = T / 'HE-LK413-optional-source-and-retained-crossstage-author-successor-v2'
F = T / 'root-fuel-comparison-prior-author-v1'
A = T / 'fuel-comparison-narrow-acquisition-independent-a-v1'
BASE = ROOT / (E + 'chemie-current438-reviewed-inactive-checkpoint-20261016-v1/candidate-delta')

def read(p): return json.loads(p.read_text())
def digest(p): return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def pin(p): return {'path': str(p.relative_to(ROOT)), 'sha256': digest(p)}
def encoded(j): return (json.dumps(j, ensure_ascii=False, indent=2) + '\n').encode()

reviews = [
    (A/'OUTPUTS.one-goal-acquisition-and-P1-independent-a.sealed.selector.json', '0cd9d796904ecebf4f6b543882208b06072d0b81c6818ff34d69daa11f7b1f4b'),
    (T/'root-fuel-comparison-prior-independent-b-v1/HANDOFF.one-fuel-prior-independent-b.KEEP.sealed.json', 'cf4ad6dfa58a9160a655f2f1a84da25cd6f51e6518b5f21322fdca6cd15da94f'),
    (T/'HE-LK413-optional-source-and-retained-target-independent-a-v2/OUTPUTS.exact413v2-source-retained-target-admission-independent-a.sealed.selector.json', 'ab17c5b582c216944a178d31559e9dfe9965456da96fad0f623ba396bc757d75'),
    (T/'HE-413-source-admission-current-independent-b-v1/v2-targeted/HANDOFF.exact413-v2-independent-b.bounded-KEEP.json', '6a4ca4767070d87ed9de4ea8b95c1a6fbf99e284a9c78e650bf9e050b140ed18'),
]
for path, sha in reviews:
    assert digest(path) == 'sha256:' + sha, path
    assert 'KEEP' in read(path)['decision'], path
assert digest(BASE/C) == 'sha256:67174768b375fffa851e4fa23b27d64065aadd7fa7641734896fffe39451ea36'
normal = digest(ROOT/C)
assert normal == 'sha256:9a68501347031f266572dea551e71c3507b66fb5ed94142a1a99f6a282708960'
canonical = read(BASE/C)
before_canonical = copy.deepcopy(canonical)
by = {goal['id']: goal for goal in canonical['goals']}
sem = read(BASE/S)
sem_by = {row['goalId']: row for row in sem['decisions']}
ops = [read(H/'CAS.ONE-WHOLE327.separate-extra413-admission.AUTHOR.inactive.json'),
       *read(F/'CAS.one-whole-comparison-goal.narrow-actual-acquisition.AUTHOR.inactive.json')['operations']]
for op in ops:
    assert by[op['goalId']] == op['before'], op['goalId']
    by[op['goalId']] = op['after']
canonical['goals'] = [by[goal['id']] for goal in canonical['goals']]
changed = {op['goalId'] for op in ops}
assert len(changed) == 2 and len(canonical['goals']) == 640
assert all(by[g['id']] == g for g in before_canonical['goals'] if g['id'] not in changed)
for source in [H/'CAS.ONE-WHOLE-SEM327.source-binding-only.AUTHOR.inactive.json', F/'CAS.one-semantic-source-binding.technical-only.json']:
    for op in read(source)['operations']:
        assert sem_by[op['goalId']] == op['before'], op['goalId']
        sem_by[op['goalId']] = op['after']
sem['decisions'] = [sem_by[row['goalId']] for row in sem['decisions']]
writes = {C: encoded(canonical), S: encoded(sem)}
for source in [H/'CAS.TWO-WHOLE-source-extraction-and-mapping.optional-F03-partial413.AUTHOR.inactive.json', H/'CAS.THREE-WHOLE-HE-views.optional-CrossStage-GK-LK-and-SekII-support.AUTHOR.inactive.json']:
    for op in read(source)['operations']:
        assert read(L/op['path']) in (op['before'], op['after']), op['path']
        writes[op['path']] = encoded(op['after'])

goal = '0cf2ffe1-a988-5ffb-ab37-0ac7d58b23dd'
p1_source = A/'P1.0cf2-b759-own-informed-current-context.review.jsonl'
writes[NEW+'P1.actual-own-independent-current-context.review.jsonl'] = p1_source.read_bytes()
p1 = read(A/'P1.0cf2-b759.ROOT-FINAL-after-actual-CAS-only.config.json')
p1['reviewCriteriaPath'] = OLD+'P5.original-criteria.byte-exact.md'
p1['reviewPath'] = NEW+'P1.actual-own-independent-current-context.review.jsonl'
p1['scope']['label'] = 'Actual paired0cf2 b759+4928 successor; genuine own informed E1G1 P1, no nativeD/human/whole-course claim'
writes[NEW+'P1.same-own-identity.normal-address.config.json'] = encoded(p1)
p4 = read(L/(OLD+'P5.own-current-context.normal-address.config.json'))
p4['scope']['goalIds'] = [x for x in p4['scope']['goalIds'] if x != goal]
assert len(p4['scope']['goalIds']) == 4
p4['scope']['label'] = 'Four byte-exact retained current independent P rows;0cf2 has its actual additive own successor'
retained_lines = (L/p4['reviewPath']).read_bytes().splitlines(keepends=True)
retained_lines = [line for line in retained_lines if json.loads(line)['goalId'] != goal]
assert len(retained_lines) == 4
writes[NEW+'P4.exact-retained-whole-original-lines.jsonl'] = b''.join(retained_lines)
p4['reviewPath'] = NEW+'P4.exact-retained-whole-original-lines.jsonl'
writes[NEW+'P4.same-original-review-identity.config.json'] = encoded(p4)
central = read(L/(OLD+'central.current438.P6-current-context.D-pending.private.config.json'))
subject = next(s for s in central['subjects'] if s['subject'] == 'chemie')
subject['positiveEvidenceConfigPaths'] = [NEW+'P4.same-original-review-identity.config.json' if p == OLD+'P5.own-current-context.normal-address.config.json' else p for p in subject['positiveEvidenceConfigPaths']]
subject['positiveEvidenceConfigPaths'].append(NEW+'P1.same-own-identity.normal-address.config.json')
assert len(subject['positiveEvidenceConfigPaths']) == 108
writes[NEW+'central.current438.paired413-fuel.D-pending.private.config.json'] = encoded(central)
lines = (L/(OLD+'P438.selected-whole-current-records.for-native-model.jsonl')).read_bytes().splitlines(keepends=True)
assert len(lines) == 438
replacement = p1_source.read_bytes()
assert len(replacement.splitlines()) == 1
writes[NEW+'P438.retained437-plus-current-own-fuel-row.for-native-model.jsonl'] = b''.join(replacement if json.loads(line)['goalId'] == goal else line for line in lines)
receipt = {'role': 'Actual guarded private paired413/fuel integration; no new scientific vote',
           'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'reviews': [pin(p) for p,_ in reviews],
           'beforeCanonical': digest(BASE/C), 'wholeGoalChanges': sorted(changed),
           'otherWholeGoalsExactlyRetained': 638, 'candidateWhole': 640, 'candidateOrdinary': 438,
           'sourceAndViewFiles': 5, 'retainedPWholeLines': 437, 'newOwnPWholeLines': 1,
           'privateCentralConfig': NEW+'central.current438.paired413-fuel.D-pending.private.config.json',
           'PVector': NEW+'P438.retained437-plus-current-own-fuel-row.for-native-model.jsonl',
           'scopeLimit': 'F03 source remainder, current nativeD/jurisdiction/Layer-A/M7 checks remain pending',
           'normalWrites': 0, 'HumanApproval': False, 'M7Claim': False}
if '--apply' not in sys.argv:
    print(json.dumps({'mode':'DRY RUN', 'ownedFiles':len(writes), 'allWholeBeforeGuards':'PASS'})); raise SystemExit()
def own_directory(path):
    if path == L:
        assert path.is_dir() and not path.is_symlink()
        return
    assert path.is_relative_to(L), path
    own_directory(path.parent)
    if path.is_symlink():
        entries = list(path.resolve(strict=True).iterdir())
        path.unlink()
        path.mkdir()
        for entry in entries:
            (path/entry.name).symlink_to(entry.resolve(), target_is_directory=entry.is_dir())
    else:
        path.mkdir(exist_ok=True)
    assert path.resolve().is_relative_to(L.resolve()), path

# Preflight every parent before content writes; replacement never follows leaves.
for relative in writes:
    own_directory((L/relative).parent)
for relative in (C,S):
    assert read(L/relative) in (read(BASE/relative), json.loads(writes[relative])), relative
receipt['recoveredPartialAttempt'] = 'Initial isolation guard stopped at the still-linked HE source leaf after only canonical/SEM writes. Exact committed before copies and computed after objects were checked; all parent ownership is now preflighted before remaining writes. No normal file was written.'
receipt['alreadyExactOwnedFiles'] = [relative for relative,data in writes.items()
                                    if (L/relative).is_file() and (L/relative).read_bytes() == data]
for relative, data in writes.items():
    target = L/relative
    assert target.parent.resolve().is_relative_to(L.resolve()), target
    temporary = target.with_name(target.name+'.paired-write.tmp')
    with temporary.open('xb') as f: f.write(data)
    os.replace(temporary, target)
assert digest(ROOT/C) == normal
receipt['afterCanonical'] = digest(L/C)
receipt['files'] = [{'path':relative,'sha256':digest(L/relative)} for relative in writes]
result = T/'EXECUTION.actual-paired413-and-fuel-private-L6.integration.receipt.json'
with result.open('x') as f: json.dump(receipt,f,ensure_ascii=False,indent=2);f.write('\n')
print(json.dumps({'mode':'APPLIED PRIVATE ONLY','wholeGoals':640,'ordinary':438,'afterCanonical':receipt['afterCanonical'],'files':len(writes),'receipt':str(result.relative_to(ROOT))}))
