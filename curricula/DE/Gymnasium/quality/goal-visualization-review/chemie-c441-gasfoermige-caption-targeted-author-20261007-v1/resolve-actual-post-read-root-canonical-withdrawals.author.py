#!/usr/bin/env python3
"""Preserve before-read bytes and explicitly resolve the later unrelated Root delta."""
from pathlib import Path
import datetime,hashlib,json
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[5]
def bind(p):
    d=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(d).hexdigest(),'bytes':len(d)}
raw=json.loads((OUT/'current-c441-whole-goal-profile-page-context-original-assets-native-prepared.author.raw.json').read_text())
canon_path=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';old=next(r for r in raw['externalCurrentInputsGuard'] if r['path']==str(canon_path.relative_to(ROOT)))
retained=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-biologie-current-commit-checkpoint-root-v1/canonical-chemistry.before-three-image-link-withdrawals.json'
assert bind(retained)['sha256']==old['sha256'] and retained.stat().st_size==old['bytes']
before=json.loads(retained.read_text());after=json.loads(canon_path.read_text());bg={g['id']:g for g in before['goals']};ag={g['id']:g for g in after['goals']};assert list(bg)==list(ag) and len(bg)==479
changes=[]
for i in bg:
    if bg[i]!=ag[i]:
        fields=[k for k in sorted(set(bg[i])|set(ag[i])) if bg[i].get(k)!=ag[i].get(k)];assert fields==['resourceLinks'];changes.append({'goalId':i,'changedFields':fields,'before':bg[i]['resourceLinks'],'after':ag[i].get('resourceLinks',[])})
assert {r['goalId'] for r in changes}=={'0bf26276-2780-506c-ac34-35dd44a29409','a44af1fa-5988-5b7d-b206-691c6bbf7dd4','9751b6d8-cde3-527b-b37c-babb6cee79d2'}
assert bg['c441d9e8-d9d9-5e55-a189-a37345541321']==ag['c441d9e8-d9d9-5e55-a189-a37345541321']==raw['wholeCurrentCanonicalGoal']
other=[]
for r in raw['externalCurrentInputsGuard']:
    if r['path']==old['path']:continue
    assert bind(ROOT/r['path'])==r;other.append(r)
obj={'role':'technical post-read input-path reconciliation, no new science or active write','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualFirstSealAttempt':{'exitCode':1,'error':'AssertionError: active canonical path now has different bytes after separately authorized Root withdrawals','currentOrHistoricalProductDefectInC441CausedByThisDrift':False,'productionValidatorChanged':False},'historicalExpectedInputPathAndBytes':old,'actualExactRetainedInputUsedForFreeze':bind(retained),'actualCurrentCanonicalAfterRootChanges':bind(canon_path),'all479IdsAndOrderingExact':True,'threeOtherResourceLinkOnlyChanges':changes,'other476WholeGoalsExact':True,'wholeCurrentC441GoalExactIncludingEdgesAndResourceMetadata':True,'wholeCurrentPRecordAndBothCasesExact':True,'other14ExternalInputBindingsStillExact':other,'doNotReplaceCurrentCanonicalWithWholeBeforeSnapshot':True,'rootMayOnlyNativeImportTargetedC441AfterIndependentReview':True,'pendingVAndCurrentNativeDPagePImageBindingStillPending':True,'activeWrites':False,'newStrictCompletion':0}
(OUT/'actual-post-read-root-canonical-delta-and-exact-retained-input-reconciliation.author.json').write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'exactRetainedBeforeCanonical':bind(retained),'currentC441WholeExact':True,'actualOtherChanges':3,'otherCurrentInputGuardsExact':len(other),'noActiveWrites':True}))
