# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,datetime
P=pathlib.Path(__file__).parent
B=P.parent
V3=B/'chemie-q1-he-paraben-use-scope-independent-b-v3'
V2=B/'chemie-q1-he-quantitative-routes-controls-independent-b-v2'
V1=B/'chemie-q1-he-quantitative-routes-independent-b-v1'
REL='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
read=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def diff(x,y,p=''):
    if isinstance(x,dict) and isinstance(y,dict):return [z for k in sorted(set(x)|set(y)) for z in diff(x.get(k),y.get(k),p+'.'+k if p else k)]
    return [] if x==y else [p]
old={g['id']:g for g in read(V3/'inputs/author-v3/proposed-active-tree'/REL)['goals']}
new={g['id']:g for g in read(P/'inputs/author-v4/proposed-active-tree'/REL)['goals']}
active={g['id']:g for g in read(P/'inputs/frozen-own-predecessors/active376-canonical-at-final-review.json')['goals']}
assert len(old)==len(new)==479 and set(old)==set(new) and len(active)==474
assert sha(pathlib.Path(REL))==sha(P/'inputs/frozen-own-predecessors/active376-canonical-at-final-review.json')
parUse='0d59b62e-d3f9-5969-b961-0c5e26316c04';parTask='4cb74d76-99f1-5264-b1e3-448cda47b005';quantTask='171b47e2-2c53-50f2-a145-a26b896fd73f';quantAND='d3cd250f-5221-589d-aa1c-44a4692d1acb'
exams=['00139854-e5a7-5c12-ab50-2268c80bf776','c91350bc-7d2e-523c-bd50-0324bccfcf98','bf6c39f0-1e44-53b2-8ff6-025f2e36e125']
changed={g:diff(old[g],new[g]) for g in new if old[g]!=new[g]}
assert set(changed)==set(exams+[parTask,quantTask])
assert new[parUse]==old[parUse] and new[parUse]['extendedData']['applicabilityMappingInheritance']=='boundary'
def atom_desc(goals,g):
    return {g} if not goals[g].get('contains') else set().union(*(atom_desc(goals,c) for c in goals[g]['contains']))
cluster='a0893975-1677-5dae-bbfb-675789be4f17'
original_atoms=atom_desc(active,cluster)
route_rows=[]
for g in exams:
    assert changed[g]==['requires']
    assert [x for x in old[g]['requires'] if x!=parUse]==new[g]['requires']
    expected=(set(active[g]['requires'])-{cluster})|original_atoms
    # The former compound quantitative atom is now the HE-only AND cluster.
    # All 64 other original atomic obligations remain direct prerequisites.
    assert expected-set(new[g]['requires'])=={quantAND}
    assert not set(new[g]['requires'])-expected
    assert old[g]['examData']==new[g]['examData']
    route_rows.append({'goalId':g,'removedSinceV3':[parUse],'addedSinceV3':[],'oldActiveExpandedAtomCount':len(original_atoms),'preservedOriginalActiveAtomicPrerequisites':len(original_atoms-{quantAND}),'originalNonClusterPrerequisitesPreserved':True,'onlyMissingFormerActiveAtomicId':quantAND,'formerQuantitativePerformanceRemainsAsHEOnlyANDAndSeparateTerminal':True,'examDataExact':True})
assert len(original_atoms)==65
children=['3d6699ae-ebbd-5a55-8798-b809a9d74f0a','18819a59-2442-530f-a7c3-26755398ec66']
assert new[quantAND]['contains']==children
assert set(new[quantTask]['requires'])==set(new[quantTask]['examData']['coveredGoalIds'])==set(children)
practice=next(g for g in new if g.startswith('4beeb141'))
assert {parTask,quantTask}<=set(new[practice]['contains'])
task_rows=[]
for g in [parTask,quantTask]:
    assert new[g]['examData']['reviewStatus']=='released'
    assert new[g]['extendedData']['terminalRouteCandidate']['machineContentReview']=='passed-independent-machine-content-reviews'
    for k in old[g]['examData']:
        if k not in ['taskContent','solutionContent','reviewStatus']:assert old[g]['examData'][k]==new[g]['examData'][k]
    assert new[g]['examData']['scoring']['maxPoints']==new[g]['examData']['scoring']['passingPoints']==24
    assert sum(s['points'] for s in new[g]['examData']['scoring']['steps'])==24
    old_task=old[g]['examData']['taskContent'];new_task=new[g]['examData']['taskContent']
    old_marker='**Vorläufiger Bewertungsentwurf, keine Freigabe:**' if g==parTask else '**Ungeprüfter Bewertungsentwurf:**'
    assert old_task.split(old_marker)[0]==new_task.split('**Bestehensanforderung:**')[0]
    old_sol=old[g]['examData']['solutionContent'];new_sol=new[g]['examData']['solutionContent']
    if g==parTask:
        assert old_sol.rsplit('\n\n',1)[0]==new_sol.rsplit('\n\n',1)[0]
        assert new_sol.endswith('Die Bestehensgrenze 24/24 verlangt vollständige Leistungen auch zum Löslichkeitskonflikt von P.')
    else:
        assert old_sol.removesuffix(' Bewertungsentwurf needs_review, keine Inhaltsfreigabe oder tatsächliche Lernendenleistung.')==new_sol
        assert '98 bis 102 %' in new_task and '98 bis 102 %' in new_sol
    assert 'needs_review' not in new_task and 'needs_review' not in new_sol
    template=read(P/'inputs/author-v4'/(g+'.practice-assessment.machine-reviewed.template.json'))
    assert template['goalTemplate']==new[g]
    task_rows.append({'goalId':g,'rawVerdict':'KEEP','priorOwnFull24of24ContentVerdict':'KEEP frozen B-v2','coreMaterialsPromptsSolutionAndScoringExact':True,'reviewStatusBefore':old[g]['examData']['reviewStatus'],'reviewStatusAfter':'released','machineStateOnlyNoHumanOrLearnerEvidence':True,'onlyReviewNotesReplacedByUnchangedPassingRequirement':True,'changedPaths':changed[g]})
now=read(P/'results/native-v4.actual.json');act=read(P/'results/native-active376.actual.json');prev=read(P/'inputs/frozen-own-predecessors/native-v3.actual.json');inactive=read(P/'inputs/frozen-own-predecessors/native-scope.actual.json')
sets=lambda r:{g['goalId'] for g in r['allCompiledGoalRows'] if 'DE-BY' in g['compiledApplicability'].get('jurisdiction',[])}
byNow=sets(now);byAct=sets(act);byPrev=sets(prev);byInactive=sets(inactive)
retained=read(P/'inputs/frozen-own-predecessors/native-before-after.actual.json')
byRetained={g['goalId'] for g in retained['before']['goals'] if 'DE-BY' in g['compiledApplicability'].get('jurisdiction',[])}
assert len(byRetained)==477 and not byNow-byRetained
assert byPrev-byNow=={parUse,parTask} and not byNow-byPrev
assert byAct-byNow=={quantAND} and not byNow-byAct
assert byAct-{quantAND}==byNow and len(byNow)==473 and len(byAct)==474
nowRows={g['goalId']:g for g in now['allCompiledGoalRows']};prevRows={g['goalId']:g for g in prev['allCompiledGoalRows']}
assert {g for g in nowRows if nowRows[g]['compiledApplicability']!=prevRows[g]['compiledApplicability']}=={parUse,parTask}
for g in [parUse,parTask,quantAND,quantTask]+children:
    assert nowRows[g]['compiledApplicability']=={'jurisdiction':['DE-HE']}
    assert not any(e['value']=='DE-BY' for e in nowRows[g]['evidence'])
activeAtoms={p['goalId'] for p in read(V1/'inputs/live376.current-strict-binding-input.book-model.json')['pages']}
candidateAtoms={p['goalId'] for p in read(V1/'inputs/full378.after-route-source.author-candidate.book-model.json')['pages']}
assert len(activeAtoms)==376 and len(candidateAtoms)==378
assert (activeAtoms&byAct)-(candidateAtoms&byNow)=={quantAND}
assert not (candidateAtoms&byNow)-(activeAtoms&byAct)
strict=set(read(V1/'inputs/34-current-strict-d-binding-inputs.author-frozen.json')['currentStrictGoalIds'])
assert len(strict)==104 and strict<=byNow and all(new[g]==old[g] for g in strict)
for p in (P/'native-physical-isolate').rglob('*'):
    if p.is_file():
        assert p.stat().st_nlink==1
        rel=p.relative_to(P/'native-physical-isolate')
        assert sha(p)==(sha(P/'inputs/author-v4/proposed-active-tree'/REL) if str(rel)==REL else sha(V3/'native-physical-isolate'/rel))
for ownFreeze in [V1/'independent-b-v1.final.freeze.json',V2/'independent-b-v2.final.freeze.json',V3/'independent-b-v3.final.freeze.json']:
    assert all(sha(pathlib.Path(r['path']))==r['sha256'] for r in read(ownFreeze)['files'])
author=B/'chemie-q1-he-routes-and-machine-task-release-author-v4'
assert all(sha(author/r['path'])==r['sha256'].removeprefix('sha256:') for r in read(P/'inputs/author-routes-and-machine-task-state.final.freeze.json')['files'])
result={'reviewer':'independent-b','checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS targeted v4 delta/core/task-state/actual scope checks','changedWholeGoals':changed,'unchangedWholeGoals':474,'routeRows':route_rows,'taskRows':task_rows,'scopeComparisons':{'active474_BYRawNodes':len(byAct),'retained407_477Node_BYRawNodes':len(byRetained),'inactive479_v1_BYRawNodes':len(byInactive),'inactive479_v3_BYRawNodes':len(byPrev),'v4_BYRawNodes':len(byNow),'retained407ToV4RemovedBYGoalIds':sorted(byRetained-byNow),'v4AddedBYGoalIdsRelativeToRetained407':sorted(byNow-byRetained),'v3ToV4RemovedBYGoalIds':sorted(byPrev-byNow),'activeToV4RemovedBYGoalIds':sorted(byAct-byNow),'v4AddedBYGoalIdsRelativeToActive':sorted(byNow-byAct),'active376_BYRawCurricularAtoms':len(activeAtoms&byAct),'candidate378_BYRawCurricularAtoms':len(candidateAtoms&byNow),'rawCountsAreNotPrimarySourceCoverage':True},'all104StrictWholeGoalsExactAndRetainedBY':True,'allOtherCompiledApplicabilityExactVsV3':True,'noNewBYRootOrRequiresInfluxForSixHEGoals':True,'ownNativePhysicalFileCount':497,'nativeDFreigabe':False,'fullCQRRun':False,'activeWrites':False,'humanApproval':False,'humanTrial':False}
(P/'results/targeted-integrity.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':result['status'],'scopeComparisons':result['scopeComparisons'],'changedWholeGoalCount':len(changed),'unchangedWholeGoals':474,'routeRows':route_rows},ensure_ascii=False))
