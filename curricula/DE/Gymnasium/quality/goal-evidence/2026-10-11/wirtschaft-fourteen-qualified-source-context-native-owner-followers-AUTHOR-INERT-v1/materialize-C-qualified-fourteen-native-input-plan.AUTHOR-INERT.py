from pathlib import Path
import datetime, hashlib, json, subprocess

R=Path.cwd();O=Path(__file__).resolve().parent
C=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-fourteen-existing-D-pair-source-course-prerequisite-current-context-independent-c-READONLY-v1'
load=lambda p:json.loads(p.read_text())
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def b(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def write(p,v):
    p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('x')as f:f.write(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
pending=load(O/'actual14-original-history-registered-owner-and-native-group-plan-PENDING.READONLY.json')
sp=C/'SEALED-fourteen-valid-original-D-pairs-current-P30-source-course-prerequisite-context-KEEP.READONLY.json';seal=load(sp)
assert seal['contextKEEP']==14 and seal['contextOPEN']==0
for a in seal['artifactBindings']:assert b(R/a['path'])==a,('changed C14 artifact',a['path'])
hp=R/seal['nativeHandoff']['path'];handoff=load(hp);qp=R/seal['contextQualification']['path'];qual=load(qp)
keepers={x['goalId']for x in qual['judgments']if x['contextDecision']=='KEEP'};opens={x['goalId']for x in qual['judgments']if x['contextDecision']!='KEEP'}
assert keepers==set(pending['requestedGoalIds'])and not opens
bookpath='app/scripts/config/goal-books/de-gym-economics-current-canonical.json';regpath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';book=load(R/bookpath);reg=load(R/regpath)
assert b(R/regpath)==handoff['actualCurrentEpoch']and b(R/regpath)==pending['actualRegistryPreparationEpoch']
sub=next(x for x in reg['subjects']if x['subject']=='wirtschaftswissenschaften');assert len(sub['resolutionIndexPaths'])==67 and len(sub['resolutionSupersessions'])==161
can=load(R/book['landscapePath']);byid={g['id']:g for g in can['goals']};pp={json.loads(l)['goalId']:json.loads(l)for p in book['evidenceReviewPaths']for l in(R/p).read_text().splitlines()}
assert b(R/bookpath)==handoff['currentStableOtherInputs']['currentBookConfigBinding']and b(R/book['landscapePath'])==handoff['currentStableOtherInputs']['currentCANBinding']
guardpaths={bookpath,regpath,book['landscapePath'],book['compositionViewPath'],book['semanticKindLedgerPath'],book['goalVisualizationQaPath'],*book['evidenceReviewPaths'],str(sp.relative_to(R)),str(hp.relative_to(R)),str(qp.relative_to(R)),str((O/'actual14-original-history-registered-owner-and-native-group-plan-PENDING.READONLY.json').relative_to(R))}
guardpaths.update(a['path']for a in seal['artifactBindings'])
guardpaths.update(x['path']for x in pending['guardsBefore'])
groups=[]
for oldg in pending['groups']:
    ids=[i for i in oldg['goalIds']if i in keepers]
    if not ids:continue
    hist=(R/oldg['selectedOriginalIndex']['path']).parent;oldbatch=load(hist/'batch-manifest.json');oldcfg=load(R/oldbatch['configPath']);bundle=load(hist/'round-a/review-bundle-manifest.json')
    prompt=next(a for a in bundle['artifacts']if a['role']=='review_prompt');criteria=next(a for a in bundle['artifacts']if a['role']=='review_criteria');promptpath=hist/'bundle'/prompt['path'];criteriapath=hist/'bundle'/criteria['path']
    assert sha(promptpath)==prompt['digest']and sha(criteriapath)==criteria['digest']
    n=len(groups)+1;ss=f'{n:02d}';cfg=dict(oldcfg)
    cfg.update({'batchId':f'wirtschaft-current346-C14-qualified-context-owner-20261011-b{ss}','bookId':f'de-gym-economics-current346-C14-owner-b{ss}','title':'Wirtschaftswissenschaften: ursprüngliche D2-Wissenschaft im unabhängig qualifizierten aktuellen Quellen-/Kurs-/Prerequisitekontext','baseGoalBookConfigPath':bookpath,'goalIds':ids,'outputDirectory':str((O/'native'/f'batch-{ss}').relative_to(R)),'promptPath':str(promptpath.relative_to(R)),'criteriaPath':str(criteriapath.relative_to(R)),'printDerivativeProfile':'bounded-atlas'})
    cp=O/'configs'/f'batch-{ss}.INERT.config.json';write(cp,cfg)
    current={};pairs={};ctxnotes=[]
    for gid in ids:
        row=next(x for x in pending['goals']if x['goalId']==gid);x=load(R/row['CWholePendingInput']['path']);assert b(R/row['CWholePendingInput']['path'])==row['CWholePendingInput']
        assert byid[gid]==x['wholeActualCurrentGoal']and pp[gid]==x['wholeActualCurrentPositiveRecord']
        current[gid]={k:x[k]for k in ['goalId','wholeActualCurrentGoal','wholeActualCurrentPositiveRecord','wholeActualCurrentNativePage','wholeActualCurrentCanonicalContext','wholeOriginalBothRounds']}
        pairs[gid]=x['selectedOriginalSciencePair'];q=next(y for y in qual['judgments']if y['goalId']==gid);assert q['contextDecision']=='KEEP'
        ctxnotes.append({'goalId':gid,'CWholeInput':row['CWholePendingInput'],'contextDecision':'KEEP','actualCanonicalDelta':row['actualCanonicalDelta'],'actualPProfilePayloadDelta':row['actualPProfilePayloadDelta'],'oldPAbsent':row['oldPAbsent'],'noOriginalRegisteredOwner':row['noHistoricalRegisteredClaimMeansNoInventedSupersession']})
        for res in byid[gid].get('resourceLinks',[]):
            if res.get('url','').startswith('/')and(R/('app/public'+res['url'])).is_file():guardpaths.add('app/public'+res['url'])
    groups.append({'groupNumber':n,'goalIds':ids,'configPath':str(cp.relative_to(R)),'outputDirectory':cfg['outputDirectory'],'exactWholeScienceHistoryDirectory':str(hist.relative_to(R)),'historicalIndex':oldg['selectedOriginalIndex'],'originalPairs':pairs,'qualifiedCurrentWholeInputs':current,'contextQualification':b(qp),'contextQualificationSeal':b(sp),'contextNotes':ctxnotes,'originalPromptBinding':b(promptpath),'originalCriteriaBinding':b(criteriapath)})
    guardpaths.update([oldbatch['configPath'],str(promptpath.relative_to(R)),str(criteriapath.relative_to(R))])
guardpaths.update(str(p.relative_to(R))for p in(R/'app/scripts').rglob('*.ts')if p.is_file())
for d in ['contracts/goal-description-review','contracts/goal-book','contracts/goal-evidence']:
    guardpaths.update(str(p.relative_to(R))for p in(R/d).rglob('*.json')if p.is_file())
plan={'status':'AUTHOR-INERT-C14-context-qualified-historical-science-native-binding-only','actualUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'HEADAtPreparation':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'requestedGoalIds':[i for g in groups for i in g['goalIds']],'requested14':sum(len(g['goalIds'])for g in groups),'groups':groups,'CContextQualificationSeal':b(sp),'CNativeHandoff':b(hp),'CIndividualContextQualification':b(qp),'COpenGoalIdsExcluded':sorted(opens),'explicitOpen6de':[],'Root2Current3ReusedIDs':[],'rootRegistryEpoch':b(R/regpath),'currentBookConfig':b(R/bookpath),'currentCanonical':b(R/book['landscapePath']),'currentCombinedP':[b(R/p)for p in book['evidenceReviewPaths']],'registeredPrefixPreparationEpoch':{'indices':67,'supersessions':161},'previousPendingPlanEpochPreservedExact':True,'newScientificReviews':0,'newModelCalls':0,'activeWrites':0,'strictClosures':0,'originalWholePAndCanonicalParityNotAssumed':True}
assert len(groups)==9 and len(plan['requestedGoalIds'])==14
write(O/'actual-current-qualified14-native-groups-and-C-source-context-plan.INERT.json',plan)
write(O/'inputs-before-current14-native-preparation.READONLY.json',{'actualUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'bindings':[b(R/p)for p in sorted(guardpaths)],'registryBefore':reg,'CQualifier':b(sp),'activeWrites':0,'newReviews':0})
print(json.dumps({'groups':len(groups),'CQualifiedGoals':len(keepers),'COpenExcluded':len(opens),'nativeWholePCases':30,'guards':len(guardpaths),'activeWrites':0}))
