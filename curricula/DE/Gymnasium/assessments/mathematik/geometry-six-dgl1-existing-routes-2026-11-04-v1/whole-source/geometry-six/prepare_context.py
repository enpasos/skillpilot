from pathlib import Path
import json,gzip,hashlib,shutil
H=Path(__file__).resolve().parent;R=H.parents[2];G=R/'tmp/approach-review-20261101/statistics-pyramid-existing-route-native-20261104-v1/candidate-data';N=G.parent/'candidate.json.gz';P=R/'tmp/approach-review-20261101/geometry-projection-fixpoints-vectorproduct-four-whole-forms-20261104-v1';B=R/'tmp/approach-review-20261101/cone-complex-four-plus-b2-integration-20261104-v1/check-host'
assert not (H/'review-input-manifest.json').exists()
ids=['bd3576b8-f4e5-542a-a8a2-74524d9cee21','857c1c46-5d94-5dfb-9697-9a9fd04103c3','58f613da-03be-5c6a-90a9-ff0958aa7849','bda6a659-9640-53a5-8be0-24705ab623ef','5f90df42-8a71-534d-b995-b8f7dcaf1661','eb112b6f-4cc4-58af-975a-f1ea61b727f0']
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def put(n,v):
 p=H/n;p.parent.mkdir(exist_ok=True,parents=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def bind(p,base=None):
 base=base or (G if p.is_relative_to(G) else B if p.is_relative_to(B) else R)
 return {'path':str(p.relative_to(base)),'sha256':sha(p),'inputRoot':str(base.relative_to(R)) if base!=R else '.'}
p=G/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json';d=json.loads(p.read_text());by={g['id']:g for g in d['goals']};assert sha(p)=='30c95213b0a6b7debc6b9a470c924c31cc7b733612bc11cf3e559d394dcdc891';assert sha(N)=='e0b466350b58395c0440a8b1af837044ee143c6bbb36d5f8c5a3a6a2f65708ab'
def closure(start,pr=None):
 seen=set();todo=list(start)
 while todo:
  x=todo.pop()
  if x in seen:continue
  seen.add(x);todo.extend((pr or {}).get(x,by[x].get('requires',[])))
 return seen
proposals={
 ids[0]:[x for x in by[ids[0]]['requires'] if x!='fac75b4a-4ec2-5d38-bbce-9b002c8a4904'],
 ids[1]:[x for x in by[ids[1]]['requires'] if x!='bd3576b8-f4e5-542a-a8a2-74524d9cee21'],
 ids[4]:['24174bba-a654-5f81-8de3-ca5bd09d9b6f','bda6a659-9640-53a5-8be0-24705ab623ef','57b11e9a-4acf-5ebe-b2b6-c9f99d2b5bb5'],
 '8d314e15-69e9-5af1-a10a-be820b2f821d':by['8d314e15-69e9-5af1-a10a-be820b2f821d']['requires']+[ids[1]],
}
put('frozen-input.json',{'canonical':bind(p),'wholeGoals':[by[x] for x in ids],'actualNativeG3':bind(N,R),'authoringScope':'Private content/didactic proposals only. No canonical, R, scope, role, source, review-row, policy, ledger, Git or runtime mutation.'})
put('whole-contracts-and-preparation.json',{'canonical':bind(p),'preparationIsNotCoverage':True,'perGoal':[{'goalId':x,'wholeContract':by[x],'originalDirectRequires':by[x].get('requires',[]),'originalRawTransitivePreparationGoalIds':sorted(closure([x])-{x}),'proposedDirectRequires':proposals.get(x,by[x].get('requires',[])),'proposedRawTransitivePreparationGoalIds':sorted(closure([x],proposals)-{x})}for x in ids],'wholeOriginalAndProposedPreparationContracts':[by[x]for x in sorted(closure(ids)|closure(ids,proposals))],'noProposedEdgesActivated':True})
for i in ids:put(i+'/competency-contract.current.json',by[i])
# Serious existing candidates are retained whole, including ordinary total scoring.
related=['e7013f6e-6051-5c88-8b4b-e054dc8db4cc','ec707244-9dde-510c-8c1e-955f23016231','ea664a30-98be-508e-90ac-5304679814ee','8d314e15-69e9-5af1-a10a-be820b2f821d','fd4b7145-5c28-5b33-bf2e-0ca68f29f2fc','3449ecb6-7f5b-5ff2-b058-7eb6ca09ea39','bc244d82-bac0-5b13-8a33-d7b101835480','49bd46a0-818a-5304-8a5d-2e504629cba5','2f8a3a90-717d-5ac1-b54e-facca26e9008','002dae37-e209-531c-b87c-719124b6bb4a','240f7716-7c6f-5705-876e-8046fd8a6720','60dbe2ed-55fb-5352-8829-1ea23fbee024','338135aa-d5bb-5b53-8413-90fa8f1e4fb6','edaf0bb4-e12e-5a6c-b484-91124ba209f3','0c3cd465-ea5e-51e5-bec5-24298bc2a1fa']
put('whole-existing-exams-and-preparation.json',{'wholeExistingExams':[by[x]for x in related],'perExam':[{'examId':x,'originalDirectRequires':by[x].get('requires',[]),'originalRawTransitivePreparationGoalIds':sorted(closure([x])-{x}),'proposedDirectRequires':proposals.get(x,by[x].get('requires',[])),'proposedRawTransitivePreparationGoalIds':sorted(closure([x],proposals)-{x})}for x in related],'wholePreparationContracts':[by[x]for x in sorted(closure(related)|closure(related,proposals))],'currentRawRReachability':[{'goalId':x,'reachedByExamIds':[g['id']for g in d['goals']if g.get('examData') and x in closure(g.get('requires',[]))]}for x in ids],'warning':'Read complete tasks, solutions, scoring and preparation. Titles, coverage and R alone do not certify whole-form sufficiency or prerequisite mastery.'})
# Originals A/M remain historical registrations, with actual current fingerprint checks later.
rows=[];copies=[]
def cp(src,dest,base=None):
 dst=H/dest;dst.parent.mkdir(exist_ok=True,parents=True);shutil.copyfile(src,dst);copies.append({'originalBinding':bind(src,base),'privateCopy':dest})
cp(p,'original/canonical.current.json')
for lane,key in [('semantic-atomicity','A'),('memory-card-review','M')]:
 c=B/f'curricula/DE/Gymnasium/quality/{lane}/canonical-math-full.config.json';cfg=json.loads(c.read_text());rp=B/cfg['reviewPath'];cp(c,f'original/registered-before-{key}.config.json');cp(rp,f'original/registered-before-{key}.review.jsonl')
 for line,raw in enumerate(rp.read_text().splitlines(),1):
  row=json.loads(raw)
  if row['goalId']in ids:rows.append({'lane':lane,'registeredConfig':bind(c),'registeredReview':bind(rp),'line':line,'wholeCurrentRow':row,'rawCurrentRegisteredLine':raw})
assert len(rows)==12
put('current-twelve-registered-am-rows.json',{'status':'ORIGINAL_CURRENT_ROWS_ONLY_NO_NEW_REVIEW_DECISION','rows':rows})
lp=G/'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json';ld=json.loads(lp.read_text());assert ld['counts']['curricularAtomic']==807;cp(lp,'original/semantic-kinds.current.json');put('current-semantic-kind-context.json',{'ledger':bind(lp),'counts':ld['counts'],'wholeRows':[r for r in ld['decisions']if r['goalId']in ids]})
mp=B/'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_source_extraction_to_canonical_math.review.json';m=json.loads(mp.read_text());ep=B/m['sourceExtractionPath'];e=json.loads(ep.read_text());sg={g['id']:g for g in e['sourceGoals']};pg={g['id']:g for g in e['passages']};records=[];cp(mp,'original/original-he-source-mapping.json');cp(ep,'original/original-he-source-extraction.json')
for mr in m['mappings']:
 if mr['canonicalGoalId']not in ids:continue
 s=sg[mr['legacyGoalId']];doc=e['sourceDocuments'][0];physical=B/doc['path'];records.append({'canonicalGoalId':mr['canonicalGoalId'],'wholeMappingRow':mr,'wholeSourceGoal':s,'wholeSourcePassage':pg[s['passageId']],'wholeMappingDecisions':[v for v in m['decisions']if v.get('sourceGoalId')==s['id']],'selectedSourceDocument':doc,'selectedPhysicalDocument':bind(physical)})
cp(B/e['sourceDocuments'][0]['path'],'original/original-HE-KC2024.pdf')
for page in [42,43]:
 for ext in ['png','txt']:
  cp(P/f'source-pages/HE_KC2024-page{page}.{ext}',f'source-pages/HE_KC2024-page{page}.{ext}',R)
put('document-specific-source-context.json',{'status':'ORIGINAL_DOCUMENT_SPECIFIC_SOURCE_CONTEXT_NOT_NEW_CROSS_JURISDICTION_OFFICIAL_SCOPE_CLAIM','mapping':bind(mp),'extraction':bind(ep),'records':records})
# Actual materialized scope rows: target, POnly, R/Need/protected are kept distinct.
n=json.load(gzip.open(N,'rt'));assert len(n['scopes'])==161 and n['actualUnionCount']==46
allrelevant=set(ids+related);matrix=[];allEffective=set()
for sr in n['scopes']:
 T=set(sr['targetGoalIds']);POnly=set(sr['prerequisiteOnlyGoalIds']);C=set(sr['contextGoalIds']);Need=set(sr['neededContextGoalIdsAtM0']);prot=set(sr['selectedProtectedTargetGoalIds']);E=sr['effectiveDirectPrerequisitesByContextGoalId'];facts=[]
 for i in sorted(allrelevant):
  reached=closure([i],E)-{i} if i in C else set();allEffective|=reached
  facts.append({'goalId':i,'target':i in T,'prerequisiteOnly':i in POnly,'context':i in C,'neededAtM0':i in Need,'selectedProtectedTarget':i in prot,'visiblePaths':sr['visibleGoalPaths'].get(i,[]),'actualEffectiveDirectRequires':E.get(i,[]),'wholeEffectivePreparationGoalIds':sorted(reached)})
 matrix.append({'scope':sr['scope'],'scopeDecision':sr['scopeDecision'],'personalCurriculumConfig':sr['personalCurriculumConfig'],'compositionViewIds':sr['compositionViewIds'],'facts':facts,'actualEffectivePrerequisitesForRelevantWholePreparation':{x:E[x]for x in sorted(allrelevant|set().union(*(set(f['wholeEffectivePreparationGoalIds'])for f in facts)))if x in E}})
put('actual-g3-membership-and-effective-preparation.json',{'nativeBinding':bind(N,R),'actualScopeCount':161,'actualUnionCount':46,'actualRuntimeExecutionPerformedByThisAuthor':False,'rows':matrix,'wholeEffectivePreparationContracts':[by[x]for x in sorted(allEffective)],'doNotInfer':'A context/POnly membership does not select a protected obligation. Hypothetical new forms are not protected until an independent later role/scope decision.'})
# Original declared composition view and stage policy inputs actually used.
views=sorted({v for s in n['scopes']for v in s['compositionViewIds']if any(i in s['targetGoalIds']for i in ids)})
viewrows=[]
for vp in sorted((G/'curricula/DE/Gymnasium/composition-views/mathematik').glob('*.json')):
 vd=json.loads(vp.read_text())
 if vd.get('viewId')in views or vd.get('id')in views:
  cp(vp,'original/views/'+vp.name);viewrows.append({'viewId':vd.get('viewId',vd.get('id')),'originalBinding':bind(vp),'privateCopy':'original/views/'+vp.name})
# bind all policies from known current prior-package discovery; no repository-wide private scan.
policyrows=[]
pb=json.loads((P/'actual-membership-view-bindings.json').read_text())
for old in pb.get('policies',[]):
 pp=G/old['originalPath']
 if pp.exists():cp(pp,'original/policies/'+pp.name);policyrows.append({'originalBinding':bind(pp),'privateCopy':'original/policies/'+pp.name})
put('actual-membership-view-bindings.json',{'actualRelevantViewIds':views,'views':viewrows,'policies':policyrows})
put('proposed-preparation-changes.NOT-ACTIVATED.json',{'status':'DIDACTIC_PROPOSAL_PENDING_INDEPENDENT_WHOLE_REVIEW','proposedDirectRequiresByGoalId':proposals,'perChangedGoal':[{'goalId':i,'originalWholeContract':by[i],'originalDirectRequires':by[i].get('requires',[]),'proposedDirectRequires':r,'originalWholeRawPreparationGoalIds':sorted(closure([i])-{i}),'proposedWholeRawPreparationGoalIds':sorted(closure([i],proposals)-{i}),'addedRawContextGoalIds':sorted(closure([i],proposals)-closure([i])),'removedRawContextGoalIds':sorted(closure([i])-closure([i],proposals))}for i,r in proposals.items()],'wholeOriginalAndProposedPreparationContracts':[by[x]for x in sorted(closure(proposals)|closure(proposals,proposals))],'originalRRetainedForReview':True,'activation':False})
put('private-original-copies.json',{'status':'BYTE_EXACT_PRIVATE_INPUT_COPIES','copies':copies})
print(json.dumps({'status':'PREPARED_PRIVATE_WHOLE_CONTEXT','AMrows':len(rows),'scopes':len(matrix),'sourceGoals':len(records),'viewsCopied':len(viewrows),'copies':len(copies)}))
