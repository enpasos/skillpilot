# SPDX-License-Identifier: Apache-2.0
"""Read-only bounded checks; selected objects, never whole-file replacement."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path

A = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-eight-constant-composition-general-data-source-author-successor-20261018-v1')
GOAL = 'e0d05c36-eaac-4c75-8ead-3fd5bdafefca'
def read(p):
    return json.loads(Path(p).read_text())
def digest(o):
    return hashlib.sha256(json.dumps(o, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
def pin(p):
    b = Path(p).read_bytes()
    return dict(path=str(p), sha256=hashlib.sha256(b).hexdigest(), bytes=len(b))

seal_path = A / 'SEAL.inactive-eight-general-data-source-author-successor.json'
seal = read(seal_path)
assert pin(seal_path)['sha256'] == '47f2aa9898e1279f5f4184f421839303c9e374962f0e5254012b412fec88d209'
def find_pins(o):
    if isinstance(o, dict):
        if {'path', 'sha256', 'bytes'} <= o.keys():
            yield o
        for v in o.values():
            yield from find_pins(v)
    elif isinstance(o, list):
        for v in o:
            yield from find_pins(v)
verified = []
for p in find_pins(seal):
    assert pin(p['path']) == {k:p[k] for k in ('path','sha256','bytes')}, p['path']
    verified.append(p)

inp = read(A / 'INPUT.one-whole-current-goal-and-whole-positive-native-profile.actual.json')
raw = read(inp['canonical']['path'])
current = next(g for g in raw['goals'] if g['id'] == GOAL)
owner = inp['wholeCurrentPositiveOwner']
record = json.loads(Path(owner['recordFile']['path']).read_text().splitlines()[owner['lineOneBased']-1])
assert current == inp['wholeGoal']
assert record == owner['wholeCurrentRecord']
config = read(owner['config']['path'])
subject = next(s for s in read(inp['central']['path'])['subjects'] if s['subject'] == 'chemie')
assert owner['config']['path'] in subject['positiveEvidenceConfigPaths']
assert config['reviewPath'] == owner['recordFile']['path']
assert GOAL in config['scope']['goalIds']
old = read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-forty-content-multistate-source-author-20261018-v1/INPUT.forty-whole-current-goals-and-positive-profiles.actual.json')['records'][1]
assert old['wholeCurrentGoal'] == current
assert old['currentP']['wholeRecord'] == record

author = read(A / 'AUTHOR.eight-general-data-source-bindings.successor.pending.json')
ops = read(A / 'CAS.seven-source-relations-all-current-aliases.append-only.pending.json')['operations']
source_checks = []
for row in author['records'][:7]:
    s = row['source']; normal = read(s['normalExtractionPath']); whole = s['wholeSource']; passage = s['wholePassage']
    matches = [g for g in normal['sourceGoals'] if g['id'] == whole['id']]
    if row['ordinal'] in (1, 4):
        assert matches == [whole]
        assert [p for p in normal['passages'] if p['id'] == whole['passageId']] == [passage]
    else:
        addition = read(A / ('candidate/extraction-additions/' + row['jurisdiction'][3:] + '.one-complete-general-data-operator.addition.pending.json'))
        assert addition['sourceGoalsToAppend'] == [whole]
        assert addition['passagesToAppend'] == [passage]
        assert matches == [], whole['id']
        assert not any(p['id'] == passage['id'] for p in normal['passages'])
        assert not any(g.get('description') == whole['description'] for g in normal['sourceGoals']), 'Duplicate whole description'
    assert pin(s['primaryPDF']['path']) == s['primaryPDF']
    source_checks.append(dict(jurisdiction=row['jurisdiction'],sourceGoalId=whole['id'],normalExtraction=pin(s['normalExtractionPath']),currentSourceGoalCount=len(normal['sourceGoals']),wholeSourceObjectSHA256=digest(whole),wholePassageObjectSHA256=digest(passage),action='existing-whole-source-and-passage-exact' if matches else 'absent-id-whole-unit-additive-append'))

alias_checks = []
for op in ops:
    file = op['normalFile']['path']; before = read(file); after = copy.deepcopy(before)
    cas = op['selectedDecisionCAS']; sid = op['sourceGoalId']; mapping = op['appendMappingIfPairAbsent']
    assert mapping['canonicalGoalId'] == GOAL and mapping['legacyGoalId'] == sid and mapping['matchType'] == 'partial'
    assert not any(m['legacyGoalId'] == sid and m['canonicalGoalId'] == GOAL for m in before['mappings'])
    if cas['action'] == 'replace-selected-whole-decision-after-exact-CAS':
        idx = int(cas['pointer'].split('/')[-1]); assert before['decisions'][idx] == cas['before']
        assert [d for d in before['decisions'] if d['sourceGoalId'] == sid] == [cas['before']]
        b = cas['before']; a = cas['after']
        assert a['canonicalGoalIds'] == b['canonicalGoalIds'] + [GOAL]
        assert a['rationale'].startswith(b['rationale'] + ' ')
        assert {k:v for k,v in a.items() if k not in ('canonicalGoalIds','rationale')} == {k:v for k,v in b.items() if k not in ('canonicalGoalIds','rationale')}
        after['decisions'][idx] = a
        assert all(d == after['decisions'][i] for i,d in enumerate(before['decisions']) if i != idx)
    else:
        assert cas['action'] == 'append-one-whole-decision-if-sourceGoalId-absent'
        assert not any(d['sourceGoalId'] == sid for d in before.get('decisions', []))
        assert cas['after']['canonicalGoalIds'] == [GOAL]
        after.setdefault('decisions', []).append(cas['after'])
        assert after['decisions'][:-1] == before.get('decisions', [])
    after['mappings'].append(mapping)
    assert after['mappings'][:-1] == before['mappings']
    assert {k:v for k,v in after.items() if k not in ('mappings','decisions')} == {k:v for k,v in before.items() if k not in ('mappings','decisions')}
    assert pin(file)['sha256'] == hashlib.sha256(Path(file).read_bytes()).hexdigest()
    alias_checks.append(dict(normalFile=pin(file),sourceGoalId=sid,decisionAction=cas['action'],selectedBeforeObjectSHA256=digest(cas['before']) if 'before' in cas else None,mappingToAppend=mapping,simulationPreservesAllUnrelatedWholeObjects=True,normalWrites=0))
assert len(alias_checks) == 15 and len(source_checks) == 7

spec = importlib.util.spec_from_file_location('stock', 'scripts/validate_schemas.py')
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
errors = mod.curriculum_symlink_errors('.')
assert not errors, errors
print(json.dumps(dict(status='PASS',scope='One unchanged whole C/P, seven selected source units, fifteen exact current aliases; in-memory additive simulation only',authorSeal=pin(seal_path),authorSealPinsVerified=len(verified),wholeGoalObjectSHA256=digest(current),wholeProfileObjectSHA256=digest(record['profile']),wholeNativeRecordObjectSHA256=digest(record),actualCanonical=pin(inp['canonical']['path']),actualNativeRecordFile=pin(owner['recordFile']['path']),actualNativeOwnerConfig=pin(owner['config']['path']),nativeOwnerConfigStillSelectedInCurrentChemistrySubject=True,wholeCAndPExactlyEqualToOwnPriorC40Read=True,sourceChecks=source_checks,aliasChecks=alias_checks,stockCurriculumSymlinkErrors=errors,normalWrites=0),ensure_ascii=False,indent=2))
