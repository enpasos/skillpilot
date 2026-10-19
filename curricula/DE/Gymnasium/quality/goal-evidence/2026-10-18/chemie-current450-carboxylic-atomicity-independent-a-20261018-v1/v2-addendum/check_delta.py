# SPDX-License-Identifier: Apache-2.0
"""Exact delta check against this reviewer's immutable FIRST; no normal writes."""
import copy,datetime,hashlib,json,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[8]
OUT=pathlib.Path(__file__).resolve().parent
FIRST=OUT.parent
V1=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-carboxylic-atomicity-source-author-20261018-v1'
V2=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-carboxylic-atomicity-source-author-20261018-v2'
OBS='dc146a38-994d-58ec-b6a0-5210118b93ae'
ST='curricula/DE/Gymnasium/mapping/DE-ST/upper-secondary/st_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json'
POINTERS={'/decisions/91','/decisions/236','/decisions/303'}
pins={}
def pin(p):
    p=pathlib.Path(p);raw=p.read_bytes();v={'path':p.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)};pins[v['path']]=v;return v
def read(p):pin(p);return json.loads(pathlib.Path(p).read_text())
def write(name,value):(OUT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
def at(obj,pointer):
    for key in pointer.strip('/').split('/'):
        if key:obj=obj[int(key)] if isinstance(obj,list) else obj[key]
    return obj
def put(obj,pointer,value):
    parts=pointer.strip('/').split('/');parent=obj
    for key in parts[:-1]:parent=parent[int(key)] if isinstance(parent,list) else parent[key]
    key=int(parts[-1]) if isinstance(parent,list) else parts[-1];parent[key]=copy.deepcopy(value)

seal=read(FIRST/'SEAL.informed-independent-FIRST.json')
for item in seal['files']:assert pin(FIRST/item['path'])['sha256']==item['sha256']
oldpins=read(FIRST/'INPUT.exact-independently-read-pins.json')['pins']
for item in oldpins:assert pin(ROOT/item['path'])['sha256']==item['sha256']
v1=read(V1/'operations/direct-mapping-and-decision.exact-CAS.pending.json')
v2=read(V2/'AUTHOR.direct-mapping-and-decision.exact-CAS.pending.json')
scope=read(V2/'AUTHOR.exact-scope-of-three-source-removals.pending.json')
pin(V2/'README.md')
assert pin(ROOT/scope['v1Input']['path'])['sha256']==scope['v1Input']['sha256']
removed=[r for r in v1['wholeDecisionBeforeAfter'] if r['path']==ST and r['jsonPointer'] in POINTERS]
assert len(removed)==3 and scope['removedProposals']==removed
removed_ids={r['before']['sourceGoalId'] for r in removed}
expected=copy.deepcopy(v1)
expected['wholeDecisionBeforeAfter']=[r for r in expected['wholeDecisionBeforeAfter'] if not (r['path']==ST and r['jsonPointer'] in POINTERS)]
for group in expected['addedDirectMappings']:
    group['entries']=[e for e in group['entries'] if e['legacyGoalId'] not in removed_ids]
expected['operations']=[op for op in expected['operations'] if not (op['path']==ST and op['jsonPointer'] in POINTERS)]
for op in expected['operations']:
    if op['operation']=='append_if_array_semantic_sha256_matches':op['afterAppend']=[e for e in op['afterAppend'] if e['legacyGoalId'] not in removed_ids]
assert v2==expected
flat=lambda d:[{'path':g['path'],'entry':e} for g in d['addedDirectMappings'] for e in g['entries']]
old_adds=flat(v1);new_adds=flat(v2)
assert len(old_adds)==9 and len(new_adds)==6
assert new_adds==[r for r in old_adds if r['entry']['legacyGoalId'] not in removed_ids]
assert all(r['entry']['canonicalGoalId']==OBS and r['entry']['matchType']=='partial' for r in new_adds)

# Apply the remaining mapping proposal in memory after checking all guards
# against the same frozen input. The removed ST decisions must stay whole.
before={op['path']:read(ROOT/op['path']) for op in v2['operations']};after=copy.deepcopy(before)
for op in v2['operations']:
    assert pin(ROOT/op['path'])['sha256']==op['fileSHA256']
    value=at(before[op['path']],op['jsonPointer'])
    if op['operation']=='replace_exact_value':assert value==op['before']
    else:
        assert op['operation']=='append_if_array_semantic_sha256_matches'
        assert len(value)==op['beforeLength']
        assert hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()==op['beforeArraySemanticSHA256']
for op in v2['operations']:
    if op['operation']=='replace_exact_value':put(after[op['path']],op['jsonPointer'],op['after'])
    else:at(after[op['path']],op['jsonPointer']).extend(copy.deepcopy(op['afterAppend']))
for row in removed:
    assert at(before[ST],row['jsonPointer'])==row['before']==at(after[ST],row['jsonPointer'])
    sid=row['before']['sourceGoalId']
    assert [m for m in before[ST]['mappings'] if m['legacyGoalId']==sid]==[m for m in after[ST]['mappings'] if m['legacyGoalId']==sid]
    assert not any(m['legacyGoalId']==sid and m['canonicalGoalId']==OBS for m in after[ST]['mappings'])
assert sum(len(after[p]['mappings'])-len(before[p]['mappings']) for p in before)==6

inherited=[]
v1_author_seal=read(V1/'SEAL.author-source-atomicity-candidate.pending-independent-review.json')
for suffix in [
    'candidates/whole-goals.before-after.pending.json',
    'candidates/whole-profiles.before-after.pending.json',
    'candidates/material-bindings.pending.json',
    'materials/carboxyl-supplied-observations.DE-EN.pending.json',
    'inputs/whole-existing-paper-assessment.json',
    'operations/canonical.exact-CAS.pending.json',
    'operations/composition-explicit-role.exact-CAS.pending.json',
]:
    p=V1/suffix;actual=pin(p)
    original=next((x for x in oldpins if x['path']==actual['path']),None)
    if original is None:original=next(x for x in v1_author_seal['artifacts'] if x['path']==actual['path'])
    assert actual['sha256']==original['sha256'];inherited.append(actual)
practical=next(x for x in oldpins if x['path'].endswith('P092.current-owner.review.jsonl'))
assert pin(ROOT/practical['path'])['sha256']==practical['sha256']
write('CHECK.exact-three-removals-six-retained-and-unchanged-inheritance.actual.json',{
    'role':'Actual independent delta check against own immutable FIRST',
    'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'expectedV2AfterExactlyThreeProposalRemovalsEqualsActualWholeV2':True,
    'removedProposalCount':3,'remainingPartialContributionCount':6,
    'remainingEntriesAndSixWholeDecisionProposalsExactV1':True,
    'changedExistingHEMappingProposalExactV1':True,
    'removedSTWholeNormalDecisionsAndAllTheirOldMappingsExact':True,
    'existing3deeP092RawHashExact':True,
    'inheritedCanonicalPTasksMaterialsAnd33ViewCAS':inherited,
    'inMemoryV2MapAddsOnlySixPartialEdges':True,
    'originalFIRSTAndAllIts112ReadInputsUnchanged':True,
    'actualRemovedSourceGoalIds':sorted(removed_ids),
    'wholeRemainingSixProposals':new_adds,
    'normalFilesWritten':False,'newPeerQARead':False,'fullCheckRun':False,
})
write('INPUT.exact-delta-read-pins.json',{'pins':list(pins.values())})
print(json.dumps({'delta':'exactly_three_unsupported_ST_proposals_removed','remainingPartialContributions':6,'remainingObjectsExactV1':True,'normalSTUnionsAnd3deeP092Unchanged':True,'FIRSTUnchanged':True,'normalFilesWritten':False}))
