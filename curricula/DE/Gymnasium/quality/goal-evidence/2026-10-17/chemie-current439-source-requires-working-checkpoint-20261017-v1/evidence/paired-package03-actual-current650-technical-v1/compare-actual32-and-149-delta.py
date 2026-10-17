from pathlib import Path
import json,hashlib,datetime
O=Path(__file__).resolve().parent;E=O.parent
read=lambda p:json.loads(Path(p).read_text())
def pin(p):p=Path(p);return {'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
oldPath=E/'actual650-paired-twenty-foundations-and-coordinate-stock-applicability-root-v1/MEASUREMENT.actual650-compiled-course-jurisdiction-duration-frontend-targets.not-backend-acceptance.json';newPath=O/'MEASUREMENT.actual650-compiled-course-jurisdiction-duration-frontend-targets.not-backend-acceptance.json'
before=read(oldPath);after=read(newPath);clean=read(E/'surfactants-softeners-retained-target-scope-author-v1/REVIEW-INPUT.clean-package03-whole-content.json');baseStockPath=E/'actual650-paired-twenty-foundations-and-coordinate-stock-applicability-root-v1/STOCK.actual650-paired-twenty-foundations-and-coordinate-applicability.json';stockPath=O/'STOCK.actual650-C20-plus-paired-package03-applicability.json';baseStock=read(baseStockPath);stock=read(stockPath)
chem=lambda s:next(x for x in s['reports'] if x['landscapeId']=='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0')
bc=chem(baseStock);ac=chem(stock);ag={g['goalId']:g for g in ac['goals']}
oldRows={(r['viewId'],r['goalId']):r for r in before['excludedTargetRows']};newRows={(r['viewId'],r['goalId']):r for r in after['excludedTargetRows']};restored=sorted(set(oldRows)-set(newRows));newlyExcluded=sorted(set(newRows)-set(oldRows))
ids=[g['goalId'] for g in clean['compilerSemantics']['currentStockInventoryBindings']];expected={(v['viewId'],i) for v in clean['wholeEightUnchangedViews'] for i in ids};assert len(expected)==32
rows=[]
for viewId,goalId in sorted(expected):
 b=before['views'][viewId];a=after['views'][viewId];rows.append({'viewId':viewId,'goalId':goalId,'beforeExcluded':(viewId,goalId) in oldRows,'afterExcluded':(viewId,goalId) in newRows,'afterEligible':goalId in a['eligibleTargetGoalIds'],'stockFilters':a['stockFilters'],'compiledApplicability':ag[goalId]['compiledApplicability']})
changedAPV=[]
for a,b in zip(ac['goals'],bc['goals']):
 assert a['goalId']==b['goalId']
 if a['compiledApplicability']!=b['compiledApplicability']:changedAPV.append({'goalId':a['goalId'],'before':b['compiledApplicability'],'after':a['compiledApplicability']})
warningKey=lambda f:json.dumps({k:v for k,v in f.items() if k!='title'},ensure_ascii=False,sort_keys=True)
bw={warningKey(f):f for f in bc['findings'] if f['severity']=='warning'};aw={warningKey(f):f for f in ac['findings'] if f['severity']=='warning'}
introducedWarnings=[aw[k] for k in sorted(set(aw)-set(bw))];removedWarnings=[bw[k] for k in sorted(set(bw)-set(aw))]
# Record exact diagnostics first, then fail closed if any intended pair remains unavailable or another target is lost.
result={'role':'Actual stock after-compiler and frontend delta; no backend learner-state or M7 acceptance','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'inputs':[pin(p) for p in [oldPath,newPath,baseStockPath,stockPath]],'beforeExcludedTargetRows':len(oldRows),'afterExcludedTargetRows':len(newRows),'restoredTargetPairs':[{'viewId':v,'goalId':g} for v,g in restored],'newlyExcludedTargetPairs':[{'viewId':v,'goalId':g} for v,g in newlyExcluded],'expected32Rows':rows,'expected32AllActuallyRestored':all(r['beforeExcluded'] and not r['afterExcluded'] and r['afterEligible'] for r in rows),'unexpectedRestoredPairs':[{'viewId':v,'goalId':g} for v,g in sorted(set(restored)-expected)],'expectedPairsNotRestored':[{'viewId':v,'goalId':g} for v,g in sorted(expected-set(restored))],'compiledApplicabilityChangedRows':changedAPV,'chemistryBeforeSummary':bc['summary'],'chemistryAfterSummary':ac['summary'],'warningDelta':{'before':len(bw),'after':len(aw),'introduced':introducedWarnings,'removed':removedWarnings,'disposition':'Introduced warnings remain explicit diagnostics; author-own jurisdiction extensions do not become official whole-source credit or waived full-gate approval.'},'remainingExclusionsExplicitlyOpen':len(newRows),'noTargetsDeletedOrDemoted':True,'newIndependentVotes':0,'M7':False,'HumanApproval':False}
p=O/'CHECK.actual-expected32-restored-and-current149-delta.json';p.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
assert len(oldRows)==149,len(oldRows);assert result['expected32AllActuallyRestored'];assert not newlyExcluded,newlyExcluded;assert set(restored)==expected,result['unexpectedRestoredPairs'];assert len(newRows)==117,len(newRows);assert ac['summary']['errors']==0;assert len(introducedWarnings)==2 and all(f['code']=='APV-201' and f['goalId'] in clean['compilerSemantics']['predictedBoundedEffectNotActualCompilerAcceptance']['ordinaryOverrideGoals'] for f in introducedWarnings),introducedWarnings;assert not removedWarnings,removedWarnings
print(json.dumps({'check':pin(p),'before':len(oldRows),'after':len(newRows),'actualRestored':len(restored),'newExclusions':len(newlyExcluded),'expected32AllRestored':True,'chemistry':ac['summary'],'actualAPVChangedGoalCount':len(changedAPV)},ensure_ascii=False,indent=2))
