#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
import datetime, hashlib, json
from pathlib import Path
ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
OWN = BASE/'chemie-q1-final378-independent-a-native-d-v1'
PREP = BASE/'chemie-q1-current378-routes-native-d-preparation-v1'
def load(p): return json.loads(p.read_text())
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def verify_freeze(p):
    x=load(p); rows=[]
    for f in x['files']:
        target=(ROOT/f['path']) if f['path'].startswith('curricula/') else p.parent/f['path']; actual=digest(target)
        assert actual==f['sha256'].removeprefix('sha256:'),(str(target),actual,f['sha256'])
        rows.append({'path':str(target.relative_to(ROOT)),'sha256':actual,'bytes':target.stat().st_size})
    return {'path':str(p.relative_to(ROOT)),'sha256':digest(p),'verifiedFileCount':len(rows),'files':rows}
author=BASE/'chemie-q1-he-routes-and-machine-task-release-author-v4'
v4freeze=verify_freeze(author/'author-routes-and-machine-task-state.final.freeze.json')
old407=verify_freeze(ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-quantitative-reviewed-integration-candidate-v1/reviewed-integration.final.freeze.json')
av1=verify_freeze(BASE/'chemie-q1-he-quantitative-routes-independent-a-v1/independent-a.final.freeze.json')
av2=verify_freeze(BASE/'chemie-q1-he-quantitative-routes-controls-independent-a-followup-v2/independent-a.followup.final.freeze.json')
REL='proposed-active-tree/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
v2=load(BASE/'chemie-q1-he-quantitative-routes-controls-author-remediation-v2'/REL)
v3=load(BASE/'chemie-q1-he-paraben-use-scope-author-remediation-v3'/REL)
v4=load(author/REL)
def index(x):return {g['id']:g for g in x['goals']}
a,b,c=map(index,[v2,v3,v4]); assert list(a)==list(b)==list(c)
def changes(x,y,p=''):
    if isinstance(x,dict) and isinstance(y,dict):
        return [path for k in sorted(set(x)|set(y)) for path in changes(x.get(k),y.get(k),(p+'.'+k).strip('.'))]
    return [] if x==y else [p]
v3changes=[{'goalId':i,'paths':changes(a[i],b[i])} for i in c if a[i]!=b[i]]
v4changes=[{'goalId':i,'paths':changes(b[i],c[i])} for i in c if b[i]!=c[i]]
use='0d59b62e-d3f9-5969-b961-0c5e26316c04'
assert v3changes==[{'goalId':use,'paths':['extendedData.applicabilityMappingInheritance']}],v3changes
generic=['00139854-e5a7-5c12-ab50-2268c80bf776','c91350bc-7d2e-523c-bd50-0324bccfcf98','bf6c39f0-1e44-53b2-8ff6-025f2e36e125']
terminals=['4cb74d76-99f1-5264-b1e3-448cda47b005','171b47e2-2c53-50f2-a145-a26b896fd73f']
assert set(r['goalId'] for r in v4changes)==set(generic+terminals)
route_rows=[]
for i in generic:
    assert changes(b[i],c[i])==['requires']
    assert c[i]['requires']==[x for x in b[i]['requires'] if x!=use]
    route_rows.append({'goalId':i,'onlyRemovedPrerequisite':use,'beforeCount':len(b[i]['requires']),'afterCount':len(c[i]['requires']),'allOtherFieldsExact':True})
task_rows=[]
for i in terminals:
    old,new=b[i],c[i]
    assert new['examData']['reviewStatus']=='released'
    assert old['examData']['scoring']==new['examData']['scoring']
    assert new['examData']['scoring']['maxPoints']==new['examData']['scoring']['passingPoints']==24
    assert old['examData']['coveredGoalIds']==new['examData']['coveredGoalIds']==new['requires']
    task_rows.append({'goalId':i,'scoringExact':True,'coveredGoalsAndRequiresExact':True,'reviewStatusBefore':old['examData']['reviewStatus'],'reviewStatusAfter':new['examData']['reviewStatus'],'examChangedPaths':changes(old['examData'],new['examData']),'humanApproval':new['extendedData']['terminalRouteCandidate']['humanApproval'],'taskBefore':old['examData']['taskContent'],'taskAfter':new['examData']['taskContent'],'solutionBefore':old['examData']['solutionContent'],'solutionAfter':new['examData']['solutionContent']})
def target_ids(view):
    def walk(nodes):
        for node in nodes:
            if node.get('kind')=='goalEntry' and node.get('projectionRole','target')=='target':yield node['goalId']
            yield from walk(node.get('children',[]))
    return sorted(set(walk(view['rootNodes'])))
preservation=load(PREP/'original376-by-source-view-targets-preservation.actual.json')
by_rows=[]
for reported in preservation['byCourseSourceViews']:
    path=reported['path'];old=ROOT/path;new=PREP/'source-atlas-final-v4'/path
    before_ids=target_ids(load(old));after_ids=target_ids(load(new))
    assert before_ids==reported['originalCurrent376TargetGoalIds']
    assert after_ids==reported['finalV4TargetGoalIds']
    assert before_ids==after_ids
    assert use not in before_ids
    by_rows.append({'viewPath':path,'beforeDigest':digest(old),'afterDigest':digest(new),'original376TargetGoalIds':before_ids,'finalV4TargetGoalIds':after_ids,'originalOfficialSourceTargetsPreserved':True,'targetCount':len(before_ids),'unsupportedNamedParabenUseWasNeverAnOriginalSourceTarget':True})
selection=load(OWN/'prior-a-only-record-selection.candidate.json')['matches']
bindings=load(OWN/'independent-current53-native-bindings.actual.json')
binding_by_id={r['goalId']:r for r in bindings['currentPages']}
reuse=[]
for s in selection:
    i=s['goalId'];r=s['priorRecord'];current=c[i]
    assert r['decision']=='keep'
    assert r['goalFingerprint']==binding_by_id[i]['goalFingerprint']
    for old_key,key in [('currentTitleDe','title'),('currentTitleEn','titleEn'),('currentDescriptionDe','description'),('currentDescriptionEn','descriptionEn')]:assert r[old_key]==current[key]
    reuse.append({'goalId':i,'priorARecordId':r['recordId'],'priorARunId':r['runId'],'priorAPath':s['priorPath'],'priorAFileDigest':digest(ROOT/s['priorPath']),'currentScientificGoalFingerprintExact':True,'currentBilingualTextExact':True,'priorPageFingerprint':r['pageFingerprint'],'currentPageFingerprint':binding_by_id[i]['pageFingerprint'],'freshCurrentContextReviewRequired':True,'newWholeScienceReview':False})
out={'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'v4AuthorFreeze':v4freeze,'ownAReviewFreezesVerified':[av1,av2],'old407ScienceReuseFreezeVerified':old407,'v2toV3Changes':v3changes,'v3toV4Changes':v4changes,'otherV4WholeGoalsExactFromV3':len(c)-len(v4changes),'routeRemoves':route_rows,'machineTaskDelta':task_rows,'originalBYSourceTargetsPreservation':by_rows,'priorA53ScientificReuse':reuse,'currentNativeBindingErrors':bindings['errors'],'activeWrites':False,'newScientificApprovals':False,'humanApproval':False}
(OWN/'independent-v4-delta-and-source-preservation.actual.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'v4FreezeFilesExact':len(v4freeze['files']),'oldScienceReuseFilesExact':old407['verifiedFileCount'],'v4ChangedGoals':len(v4changes),'allOtherGoalsExact':len(c)-len(v4changes),'originalBYSourceTargetCounts':[r['targetCount'] for r in by_rows],'priorAScienceReuse':len(reuse),'errors':bindings['errors']}))
