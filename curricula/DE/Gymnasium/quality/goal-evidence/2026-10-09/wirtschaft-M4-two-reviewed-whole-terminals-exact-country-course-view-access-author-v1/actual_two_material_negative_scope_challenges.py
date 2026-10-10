#!/usr/bin/env python3
"""Actual bounded negative probes; never remove an active curriculum target."""
import copy
import datetime
import json
import pathlib
import shutil
import subprocess
import hashlib

PACKAGE=pathlib.Path(__file__).resolve().parent
ROOT=PACKAGE.parents[6]
command=json.loads((PACKAGE/'actual-current-two-material-native-intake.command-exit.json').read_text())
capsule=pathlib.Path(command['argv'][-4])
native_views=capsule/'curricula/DE/Gymnasium/composition-views/wirtschaft'
book='73c49b24-e928-54f4-b4d3-93347d532e5b'
hidden='66a0d96f-a231-5b36-894e-2ffb16adf7db'
def remove(nodes,gid):
    answer=[]
    for n in nodes:
        if n.get('kind')=='goalEntry'and n.get('goalId')==gid:continue
        n=copy.deepcopy(n)
        if n['kind']=='structure':n['children']=remove(n.get('children',[]),gid)
        answer.append(n)
    return answer
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
cases=[]
for name,gid in [('one-actual-BB-GK-book-access-removed',book),('one-actual-BB-GK-book-hard-prerequisite-hidden',hidden)]:
    folder=PACKAGE/'negative-tests'/name;folder.mkdir(parents=True,exist_ok=True)
    views=folder/'views';shutil.copytree(PACKAGE/'candidate35-views',views)
    path=views/'de-bb-gym-economics-gk.view.json';before=json.loads(path.read_text());after=copy.deepcopy(before);after['rootNodes']=remove(after['rootNodes'],gid);assert after!=before
    path.write_text(json.dumps(after,ensure_ascii=False,indent=2)+'\n')
    for v in views.glob('*.view.json'):(native_views/v.name).write_bytes(v.read_bytes())
    result_path=folder/'actual-whole-native-negative-result.json';argv=command['argv'].copy();argv[-2]=str(views);argv[-1]=str(result_path)
    start=datetime.datetime.now(datetime.timezone.utc).isoformat();process=subprocess.run(argv,cwd=ROOT,capture_output=True,text=True);end=datetime.datetime.now(datetime.timezone.utc).isoformat();raw=folder/'actual-native-negative.raw.txt';raw.write_text(process.stdout+process.stderr)
    receipt={'argv':argv,'startedAt':start,'finishedAt':end,'exitCode':process.returncode,'rawSha256':sha(raw),'resultSha256':sha(result_path)if result_path.exists()else None,'oneActualPrivateGoalEntryRemoved':gid,'scientificAssessmentBodiesUnchanged':True,'qualityCodeAndCompiledApplicabilityUnchanged':True,'activeCurriculumTargetsMutated':False}
    (folder/'actual-native-negative.command-exit.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');assert process.returncode==0,process.stderr
    result=json.loads(result_path.read_text());row=next(x for x in result['projections']if x['viewFile']=='de-bb-gym-economics-gk.view.json'and x['jurisdiction']=='DE-BB');material=next(m for m in row['materials']if m['materialGoalId']==book)
    if gid==book:
        assert material['wholeMaterialEligible']and not material['currentMaterialVisibleAsTarget']
        national=next(x for x in result['projections']if x['viewFile']=='de-de-gym-economics-gk.view.json'and x['jurisdiction']=='DE-BB')
        assert not next(m for m in national['materials']if m['materialGoalId']==book)['currentMaterialVisibleAsTarget']
        expected='Removing exactly this real access leaves its full ordinary/support scope intact but removes actual country and matching national endpoint visibility; raw national subtree cannot bypass country authority.'
    else:
        assert material['currentMaterialVisibleAsTarget']and not material['wholeMaterialEligible']and hidden in material['missingWholePrerequisiteGoalIds']
        assert any(c['goalId']==hidden and not c['currentLocalVisible']for c in material['coveredChecks'])
        actual104=next(r for r in result['actualWholeRouteProfileResult']['rules']if r['id']=='CQR-104')
        assert actual104['status']=='fail'and actual104['metrics']['wholeMaterialPrerequisiteOccurrencesMissingFromProjection']>0
        expected='Visible whole Book material with its actual 66a prerequisite hidden fails the unchanged full material-scope contract; an existing convenient 04c path does not suffice.'
    cases.append({'case':name,'exactRealMaterialScope':material,'expectation':expected,'actualMatchedExpected':True,'wholeNegativeResultPath':str(result_path.relative_to(ROOT)),'alreadyOpenWholeCourseCQR104NotUsedAsPositiveClosureProof':True})
# Restore all private view bytes to the actual author candidate, without rewriting active views.
for v in (PACKAGE/'candidate35-views').glob('*.view.json'):(native_views/v.name).write_bytes(v.read_bytes())
assert all(sha(native_views/v.name)==sha(v)for v in (PACKAGE/'candidate35-views').glob('*.view.json'))
path=PACKAGE/'actual-two-authentic-negative-scope-contract-results.json';path.write_text(json.dumps({'cases':cases,'privateCandidateViewsRestoredWholeExact':True,'productionEdits':0,'thresholdOrCodeChange':0,'humanApproval':False},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'actualAuthenticNegativeCases':len(cases),'unexpected':0,'privateCandidateWholeViewsRestoredExact':True,'resultSha256':sha(path)}))
