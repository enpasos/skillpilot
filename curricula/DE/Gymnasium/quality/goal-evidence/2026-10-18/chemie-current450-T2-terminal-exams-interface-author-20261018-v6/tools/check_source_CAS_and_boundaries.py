# SPDX-License-Identifier: Apache-2.0
"""Replay bounded data operations and check exact conservation; no scientific verdicts."""
from pathlib import Path
import copy,hashlib,json
ROOT=Path(__file__).resolve().parents[8]
OUT=Path(__file__).resolve().parents[1]
def read(p):return json.loads((ROOT/p).read_text())
def digest(v):return hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):
    raw=(ROOT/p).read_bytes();return dict(path=str(p),sha256=hashlib.sha256(raw).hexdigest(),bytes=len(raw))
proposal=read(OUT.relative_to(ROOT)/'AUTHOR.selected-source-mapping-decision-and-registry-CAS.pending.json')
checks=[]
for record in proposal['records']:
    assert pin(record['path'])==record['beforeFilePin']
    original=read(record['path']);assert digest(original)==record['beforeWholeObjectSHA256']
    after=copy.deepcopy(original)
    for op in record['operations']:
        if op['op']=='replaceSelectedMappingRows':
            old=[r for r in after['mappings'] if r['legacyGoalId']==op['sourceGoalId']]
            assert old==op['before'];assert len(old)==len(op['candidate'])
            positions=[i for i,r in enumerate(after['mappings']) if r['legacyGoalId']==op['sourceGoalId']]
            for index,new in zip(positions,op['candidate']):after['mappings'][index]=new
        else:
            keys=op['jsonPointer'].lstrip('/').split('/');parent=after
            for key in keys[:-1]:parent=parent[int(key)] if isinstance(parent,list) else parent[key]
            key=int(keys[-1]) if isinstance(parent,list) else keys[-1]
            if op['op']=='append':parent[key].append(op['candidate'])
            elif op['op']=='add':assert key not in parent;parent[key]=op['candidate']
            elif op['op']=='replace':assert parent[key]==op['before'];parent[key]=op['candidate']
            else:raise AssertionError(op['op'])
    assert digest(after)==record['candidateWholeObjectSHA256'],record['path']
    checks.append(dict(path=record['path'],actualCASMatches=True,exactReplayMatchesCandidateWholeObjectSHA256=True,operationCount=len(record['operations'])))
for row in proposal['sourceExtractionSuccessors']:
    assert pin(row['originalSourcePin']['path'])==row['originalSourcePin']
    assert pin(row['candidateSourcePin']['path'])==row['candidateSourcePin']
    before=read(row['originalSourcePin']['path']);after=read(row['candidateSourcePin']['path']);index=row['selectedRowIndex']
    assert len(before['sourceGoals'])==len(after['sourceGoals'])
    assert all(a==b for i,(a,b) in enumerate(zip(before['sourceGoals'],after['sourceGoals'])) if i!=index)
    assert before['sourceGoals'][index]==row['beforeWholeSourceRow'] and after['sourceGoals'][index]==row['candidateWholeSourceRow']
    if 'passageIndex' in row:
        p=row['passageIndex'];assert all(a==b for i,(a,b) in enumerate(zip(before['passages'],after['passages'])) if i!=p)
        x=copy.deepcopy(before['passages'][p]);x['page']=38;assert x==after['passages'][p]
    else:assert before['passages']==after['passages']
hb=read(OUT.relative_to(ROOT)/'INPUT.HB.actual-optional-cell-and-stale-mixed-legacy-boundary.json')
assert pin(hb['sourceExtractionPin']['path'])==hb['sourceExtractionPin']
assert digest(read(hb['sourceExtractionPin']['path'])['sourceGoals'])==hb['mandatory232SourceGoalsSHA256']
for key in ['currentMappingAlias','currentReviewAlias']:assert pin(hb[key]['path'])==hb[key]
body=read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-T2-terminal-exams-author-20261018-v5/AUTHOR.new-goals.full.draft.json')['newGoals']
candidate=read(OUT.relative_to(ROOT)/'AUTHOR.new-goals.full.draft.json')['newGoals'];assert len(candidate)==len(body)==19
for a,b in zip(body,candidate):
    assert a['id']==b['id'] and a['examData']==b['examData'] and a['requires']==b['requires']
    allowed={'phase','dimensionTags','extendedData'}
    assert all(a.get(k)==b.get(k) for k in (set(a)|set(b))-allowed)
    x=copy.deepcopy(b['dimensionTags']);x['phase']=a['dimensionTags']['phase'];assert x==a['dimensionTags']
    x=copy.deepcopy(b['extendedData']);x['terminalRouteCandidate']=a['extendedData']['terminalRouteCandidate'];assert x==a['extendedData']
report=dict(role='FINITE_CAS_EXACTNESS_FACTS_NOT_INDEPENDENT_REVIEW',selectedAliasAndRegistryRecords=checks,sourceSuccessors=3,allUnselectedSourceRowsExact=True,HB232MandatoryRowsAndAliasesRemainExact=True,allNineteenExamDataAndRequiresWholeExactV5=True,allCurrentOrdinaryAndPUnchanged=True,newIndependentScientificVotes=0,newWholeSourceApprovals=0,normalWrites=0)
(OUT/'CHECK.source-CAS-replay-and-exact-boundaries.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(dict(allCASReplayChecksPass=True,records=len(checks),sourceSuccessors=3,allNineteenWholeExamDataExact=True,normalWrites=0),indent=2))
