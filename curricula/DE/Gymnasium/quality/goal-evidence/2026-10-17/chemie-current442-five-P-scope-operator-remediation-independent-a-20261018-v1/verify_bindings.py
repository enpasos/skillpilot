from pathlib import Path
import json, hashlib

AUTHOR = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-five-P-scope-operator-remediation-author-20261018-v1')
OUT = Path(__file__).parent
a = json.loads((AUTHOR / 'AUTHOR.five-current-P-scope-operator-remedies.pending.json').read_text())

def pin(p):
    b = Path(p).read_bytes()
    return {'path': str(p), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def ptr(v, p):
    for k in p.split('/')[1:]:
        k = k.replace('~1', '/').replace('~0', '~')
        v = v[int(k)] if isinstance(v, list) else v[k]
    return v

def differences(x, y, p=''):
    if type(x) is not type(y): return [p]
    if isinstance(x, dict):
        return [z for k in sorted(x.keys() | y.keys()) for z in ([p+'/'+k] if k not in x or k not in y else differences(x[k], y[k], p+'/'+k))]
    if isinstance(x, list):
        return ([p+'/length'] if len(x) != len(y) else []) + [z for i,(u,v) in enumerate(zip(x,y)) for z in differences(u,v,p+'/'+str(i))]
    return [] if x == y else [p]

actual_pins = {k: pin(v['path']) for k,v in a['inputs'].items()}
c = json.loads(Path(a['inputs']['canonical']['path']).read_text())
goals = {g['id']: g for g in c['goals']}
p_rows = {r['goalId']: r for r in map(json.loads,Path(a['inputs']['currentP442WriterInput']['path']).read_text().splitlines())}
s = json.loads(Path(a['inputs']['sourceExtraction']['path']).read_text())
m = json.loads(Path(a['inputs']['sourceMapping']['path']).read_text())
existing=[]
for v in a['existingWholeGoalAndProfileCandidates']:
    before,after=v['wholeCurrentProfile'],v['wholeProposedProfile']
    preserved={k: [z['id'] for z in before[k] if z in after[k]] for k in ['expectations','applicationCaseBriefs','variationAxes']}
    existing.append({'goalId':v['goalId'],'currentWholeGoalExact':ptr(c,v['canonicalPointer'])==v['wholeCurrentGoal'], 'currentWholeProfileExact':p_rows[v['goalId']]['profile']==before,'preservedObjectIds':preserved,'actualChangedPointers':differences(before,after)})
source=[]
for v in a['sourceUnionCandidates']:
    old=ptr(m,v['mappingDecisionPointer'])
    source.append({'ordinal':v['ordinal'],'sourceGoalId':v['wholeCurrentSourceGoal']['id'], 'sourceExact':ptr(s,v['sourceGoalPointer'])==v['wholeCurrentSourceGoal'],'mappingDecisionExact':old==v['currentWholeDecision'],'currentCarrierIdsExact':old['canonicalGoalIds']==v['wholeCurrentCarrierIds'],'proposedCarrierIds':v['wholeProposedPartialCarrierUnion'],'currentCarrierGoalsPinned':all(ptr(c,r['canonicalPointer'])==goals[r['goalId']] for r in v['currentCarrierWholeReferences'])})
new=[]
for v in a['newWholeGoalAndProfileCandidates']:
    g=v['wholeGoalCandidate']
    new.append({'goalId':g['id'],'newIdNotAlreadyCanonical':g['id'] not in goals, 'requiresAllExist':all(r in goals for r in g['requires']), 'requires':g['requires'],'contains':g['contains'],'tags':g['tags'],'jurisdiction':g['applicability']['jurisdiction'],'phase':g['dimensionTags']['phase']})
alt=[{'goalId':v['goalId'],'wholeGoalExact':v['wholeCurrentGoal']==goals[v['goalId']]} for v in a['existingAlternativesActuallyReadAndPreserved']]
check={'artifactType':'independent-informed-P5-readonly-binding-check','excludedAuthorFields':['actualFreshDRecords','fiveIssues'],'actualPins':actual_pins,'authorPinMatches':{k:v==a['inputs'][k] for k,v in actual_pins.items()},'registryDriftBoundary':'Root reported D159-only registration during review; historical author registry pin retained. No current peer verdict or registration receipt read. P/canonical/SEM/source inputs checked independently below.','existingCandidates':existing,'sourceUnionChecks':source,'newCandidateChecks':new,'unchangedAlternativeChecks':alt,'actualSugarTreeTerm':ptr(s,'/mandatoryTermSets/11/terms/6'),'normalWrites':False}
(OUT/'CHECK.actual-input-bindings-and-retention.json').write_text(json.dumps(check,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(check,ensure_ascii=False,indent=2))
