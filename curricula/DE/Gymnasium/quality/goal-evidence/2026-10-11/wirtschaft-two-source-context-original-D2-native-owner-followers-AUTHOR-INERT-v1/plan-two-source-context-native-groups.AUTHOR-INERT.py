from pathlib import Path
import datetime, hashlib, json, subprocess

R=Path.cwd();O=Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_text())
sha=lambda b:'sha256:'+hashlib.sha256(b).hexdigest()
def binding(p):
    return {'path':str(p.relative_to(R)),'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size}
def write(p,v):
    p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('x')as f:f.write(json.dumps(v,ensure_ascii=False,indent=2)+'\n')

Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11'
context=Q/'wirtschaft-0d8-596-existing-D2-current-P-and-selected-P12-context-independent-READONLY-v1'
inputpath=context/'actual-whole-two-project-goals-current-P4-original-D2-and-selected-P12.INPUT.READONLY.json'
input=load(inputpath)
sealpath=context/'SEALED-two-existing-project-D2-current-P4-and-selected-P12-context-KEEP.READONLY.json'
seal=load(sealpath)
for a in seal['artifacts']:assert binding(R/a['path'])==a
proofpath=context/'actual-independent-two-whole-project-descriptions-P4-and-selected-P12-context-KEEP.READONLY.receipt.json'
proof=load(proofpath);assert all(x['decision']=='KEEP'for x in proof['individualContextDecisions'])
bookpath='app/scripts/config/goal-books/de-gym-economics-current-canonical.json'
regpath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
book=load(R/bookpath);reg=load(R/regpath);can=load(R/book['landscapePath']);byid={g['id']:g for g in can['goals']}
profiles={json.loads(l)['goalId']:json.loads(l)for p in book['evidenceReviewPaths']for l in(R/p).read_text().splitlines()}
guardpaths={bookpath,regpath,book['landscapePath'],book['compositionViewPath'],book['semanticKindLedgerPath'],book['goalVisualizationQaPath'],*book['evidenceReviewPaths'],str(inputpath.relative_to(R)),str(proofpath.relative_to(R)),str(sealpath.relative_to(R))}
guardpaths.update(x['before']['path']for x in load(context/'actual-project-context-input-before-after.READONLY.json')['inputGuards'])
groups=[]
for n,x in enumerate(input['wholeGoals'],1):
    gid=x['goalId'];assert byid[gid]==x['wholeCurrentGoal']and profiles[gid]==x['wholeCurrentP2']
    pair=x['selectedOriginalPairClaims'];history=(R/pair['index']['path']).parent
    oldbatch=load(history/'batch-manifest.json');oldcfg=load(R/oldbatch['configPath']);oldbundle=load(history/'round-a/review-bundle-manifest.json')
    prompt=next(a for a in oldbundle['artifacts']if a['role']=='review_prompt');criteria=next(a for a in oldbundle['artifacts']if a['role']=='review_criteria')
    promptpath=history/'bundle'/prompt['path'];criteriapath=history/'bundle'/criteria['path']
    assert binding(promptpath)['sha256']==prompt['digest']and binding(criteriapath)['sha256']==criteria['digest']
    suffix=f'{n:02d}';cfg=dict(oldcfg)
    cfg.update({'batchId':f'wirtschaft-current346-two-source-context-owner-20261011-b{suffix}','bookId':f'de-gym-economics-current346-two-source-owner-b{suffix}','title':'Wirtschaftswissenschaften: unveränderte ursprüngliche D2-Wissenschaft, qualifizierter aktueller Projekt-/Quellenkontext','baseGoalBookConfigPath':bookpath,'goalIds':[gid],'outputDirectory':str((O/'native'/f'batch-{suffix}').relative_to(R)),'promptPath':str(promptpath.relative_to(R)),'criteriaPath':str(criteriapath.relative_to(R)),'printDerivativeProfile':'bounded-atlas'})
    cfgpath=O/'configs'/f'batch-{suffix}.INERT.config.json';write(cfgpath,cfg)
    groups.append({'groupNumber':n,'goalIds':[gid],'configPath':str(cfgpath.relative_to(R)),'outputDirectory':cfg['outputDirectory'],'exactWholeScienceHistoryDirectory':str(history.relative_to(R)),'historicalIndex':binding(R/pair['index']['path']),'originalPairs':{gid:pair},'qualifiedCurrentWholeInput':x,'contextQualification':binding(proofpath),'originalPromptBinding':binding(promptpath),'originalCriteriaBinding':binding(criteriapath)})
    guardpaths.update([oldbatch['configPath'],str(promptpath.relative_to(R)),str(criteriapath.relative_to(R))])
    for rd in pair['existingIndependentRounds']:
        guardpaths.update(rd[k]['path']for k in ['reviewInput','actualResults','runManifest','campaign'])
    guardpaths.update(pair[k]['path']for k in ['index','resolution','dualSummary','synthesisManifest'])
    for res in byid[gid].get('resourceLinks',[]):
        if res.get('url','').startswith('/')and(R/('app/public'+res['url'])).is_file():guardpaths.add('app/public'+res['url'])

e2=Q/'wirtschaft-e2ac-existing-D2-current-P-and-qualified-payment-scope-context-independent-READONLY-v1/SEALED-e2ac-existing-D2-current-whole-P-and-qualified-payment-scope-context-KEEP.READONLY.json'
plan={'status':'AUTHOR-INERT-qualified-current-context-original-historical-science-no-new-review','actualUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'HEADAtPreparation':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'requestedGoalIds':[x['goalId']for x in input['wholeGoals']],'requested2':2,'groups':groups,'qualifiedSourceContextSeal':binding(sealpath),'qualifiedSourceContextReceipt':binding(proofpath),'alreadyCurrentE2ContextRetainedNoDuplicateOwner':binding(e2),'explicitOpen6de':[],'Root2Current3ReusedIDs':[],'rootRegistryEpoch':binding(R/regpath),'currentBookConfig':binding(R/bookpath),'currentCanonical':binding(R/book['landscapePath']),'currentCombinedP':[binding(R/p)for p in book['evidenceReviewPaths']],'historicalPParityIsNotAssumedFor0d8':True,'newScientificReviews':0,'newModelCalls':0,'activeWrites':0,'strictClosures':0}
write(O/'actual-current2-native-groups-and-qualified-source-context-plan.INERT.json',plan)
guardpaths.add(str(e2.relative_to(R)))
guardpaths.update(str(p.relative_to(R))for p in(R/'app/scripts').rglob('*.ts')if p.is_file())
for directory in ['contracts/goal-description-review','contracts/goal-book','contracts/goal-evidence']:
    guardpaths.update(str(p.relative_to(R))for p in(R/directory).rglob('*.json')if p.is_file())
write(O/'inputs-before-current2-native-preparation.READONLY.json',{'actualUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'bindings':[binding(R/p)for p in sorted(guardpaths)],'registryBefore':reg,'activeWrites':0,'newReviews':0})
print(json.dumps({'groups':2,'goals':plan['requestedGoalIds'],'guardPaths':len(guardpaths),'e2NoDuplicate':True,'activeWrites':0}))
