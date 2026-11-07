from pathlib import Path
import json,gzip,hashlib,unicodedata,re
R=Path('/home/enpasos/projects/skillpilot');Q=R/'qa-artifacts/ci-contract-audit/2026-11-06';O=Path('/dev/shm/math3-e4de-binding-analysis');O.mkdir(exist_ok=True)
def sh(b):return hashlib.sha256(b).hexdigest()
def read(p):return json.loads(Path(p).read_bytes())
def ref(p):p=Path(p);return {'path':str(p.relative_to(R)) if p.is_relative_to(R) else str(p),'sha256':sh(p.read_bytes()),'bytes':p.stat().st_size}
def stable(v):return json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def fp(v):return 'sha256:'+sh(stable(v).encode())
def norm(v):return re.sub(r'\s+',' ',unicodedata.normalize('NFKC',str(v if v is not None else ''))).strip()
aRaw=(R/'tmp/math-diagram-recheck-preparer-20261106/candidate.json').read_bytes();bRaw=gzip.decompress((R/'qa-artifacts/ci-contract-audit/2026-11-07/math-inverse-image-native-prepared-candidate-v2/candidate-source.after-native-import.json.gz').read_bytes())
assert sh(aRaw)=='967a9cf8f27c5ee678777401697ba8b69874dbc889f7cfe753267f7c5a05c318';assert sh(bRaw)=='e4de3c3e3a294a1751d7ebcd70fa4e63a457a63e51016996055c0e78f4510a06'
a=read(R/'tmp/math-diagram-recheck-preparer-20261106/candidate.json');b=json.loads(bRaw);A={g['id']:g for g in a['goals']};B={g['id']:g for g in b['goals']};assert A.keys()==B.keys()
changed=[id for id in A if A[id]!=B[id]];assert changed==['ce198bc9-b014-52ba-814f-25cc3e020668'];mid=changed[0]
def sem(g):return {'ruleVersion':'goal-evidence-v1','goalId':g['id'],'shortKey':norm(g.get('shortKey')),'title':norm(g.get('title')),'titleEn':norm(g.get('titleEn')),'description':norm(g.get('description')),'descriptionEn':norm(g.get('descriptionEn')),'semanticKind':'curricularAtomic','semanticAtomic':g.get('semanticAtomic'),'type':norm(g.get('type')),'nodeKind':norm(g.get('nodeKind')),'tags':sorted(norm(t) for t in g.get('tags',[])),'dimensionTags':g.get('dimensionTags')}
def inp(g,criteria,reviewAssets,after):
 v=[]
 for l in g.get('resourceLinks',[]):
  if l.get('type')!='goal-visualization':continue
  digest=None
  if reviewAssets:
   p=R/'app/public'/l['url'].lstrip('/')
   if after and g['id']==mid:p=R/'qa-artifacts/ci-contract-audit/2026-11-07/math-inverse-image-native-prepared-candidate-v2'/f'{mid}.png'
   digest='sha256:'+sh(p.read_bytes())
  v.append({'role':norm(l.get('role')),'url':norm(l.get('url')),'altText':norm(l.get('altText')),'reviewStatus':norm(l.get('reviewStatus')),'digest':digest})
 return {'profileSchemaVersion':2,'profileRuleVersion':'positive-understanding-evidence-v2','reviewCriteriaFingerprint':criteria,'goalInput':{'ruleVersion':'goal-evidence-v1','goalFingerprint':fp(sem(g)),'requires':sorted(g.get('requires',[])),'contains':sorted(g.get('contains',[])),'examples':sorted(norm(e)for e in g.get('examples',[])),'goalVisualizations':sorted(v,key=stable)}}
pRoot=Q/'math-three-current-positive-candidates-2026-11-06';pRows=[]
for n in ['image-two','image-free-one','retained-0','retained-1','retained-2']:
 c=read(pRoot/(n+'.config.json'));rp=R/c['reviewPath'];rows=[json.loads(x)for x in rp.read_text().splitlines()if x.strip()]
 assert [r['goalId']for r in rows]==c['scope']['goalIds']
 for record in rows:
  id=record['goalId'];x=inp(A[id],record['reviewCriteriaFingerprint'],bool(c['reviewedResourceTypes']),False);y=inp(B[id],record['reviewCriteriaFingerprint'],bool(c['reviewedResourceTypes']),True)
  assert fp(sem(A[id]))==record['goalFingerprint'],('goalFP',id,fp(sem(A[id])),record['goalFingerprint'])
  assert fp(x)==record['reviewInputFingerprint'],('inputFP',id,fp(x),record['reviewInputFingerprint'])
  pRows.append({'goalId':id,'config':ref(pRoot/(n+'.config.json')),'recordFile':ref(rp),'reviewedResourceTypes':c['reviewedResourceTypes'],'goalFingerprintBefore':fp(sem(A[id])),'goalFingerprintAfter':fp(sem(B[id])),'reviewInputFingerprintBefore':fp(x),'reviewInputFingerprintAfter':fp(y),'inputEqual':x==y,'profileFingerprint':record['profileFingerprint'],'beforeInput':x if id==mid else None,'afterInput':y if id==mid else None})
assert len(pRows)==31 and sum(not r['inputEqual']for r in pRows)==1
kindKeys=re.findall(r"  '/([^']+)',",(R/'app/scripts/goalBookModel.ts').read_text().split('const SEMANTIC_KIND_SOURCE_FINGERPRINT_POINTERS = [')[1].split('] as const')[0])
def kind(g):return {'domain':'skillpilot:semantic-kind-source-fingerprint:v1','fields':[{'path':'/'+k,'state':'missing'}if k not in g else {'path':'/'+k,'state':'value','value':sorted(g[k])if k=='tags'else g[k]}for k in kindKeys]}
drafts=read(Q/'math-three-description-post-review/fresh-kind-atomicity-memory-drafts.json');kindRows=[]
for row in drafts['semanticKindDrafts']:
 id=row['goalId'];assert fp(kind(A[id]))==row['sourceFingerprint'];assert kind(A[id])==kind(B[id]);kindRows.append({'goalId':id,'before':row['sourceFingerprint'],'after':fp(kind(B[id])),'equal':True})
amKeys=['id','shortKey','title','titleEn','description','descriptionEn','nodeKind']
def am(g,rv):return {'ruleVersion':rv,'goalId':g['id'],'shortKey':g.get('shortKey',''),'title':norm(g.get('title')),'titleEn':norm(g.get('titleEn')),'description':norm(g.get('description')),'descriptionEn':norm(g.get('descriptionEn')),'phase':norm(g.get('dimensionTags',{}).get('phase')),'area':norm(g.get('dimensionTags',{}).get('area')),'topicCode':norm(g.get('dimensionTags',{}).get('topicCode')),'nodeKind':norm(g.get('nodeKind'))}
amRows=[]
for key in ['atomicityRecordDraft','memoryRecordDraft']:
 r=drafts[key];id=r['goalId'];assert fp(am(A[id],r['ruleVersion']))==r['fingerprint'];amRows.append({'recordKey':key,'goalId':id,'before':r['fingerprint'],'after':fp(am(B[id],r['ruleVersion']))})
indices=[Q/'math-three-description-input-2026-11-06/packet',Q/'math-single-description-input-2026-11-06/packet'];dRows=[]
for base in indices:
 index=read(base/'resolution-index.json');inputPath=base/'round-a/description-review-input.json';inputs=read(inputPath);by={x['goalId']:x for x in inputs['goals']}
 for entry in index['resolutions']:
  id=entry['goalId'];x=by[id];oldPage=x['reviewContext']['page'];currentVisual=B[id].get('resourceLinks',[None])[0]
  dRows.append({'goalId':id,'index':ref(base/'resolution-index.json'),'input':ref(inputPath),'originalGoalFingerprint':x['goalFingerprint'],'semanticGoalPayloadUnchanged':sem(A[id])==sem(B[id]),'canonicalContextBoundFieldsUnchanged':{k:v for k,v in A[id].items()if k!='resourceLinks'}=={k:v for k,v in B[id].items()if k!='resourceLinks'},'historicalPageFingerprint':x['pageFingerprint'],'historicalPageVisualization':oldPage['visualization'],'candidateResource':currentVisual if id==mid else None,'sameFullCurrentPageClaimAvailable':id!=mid,'note':'No native validator run. Production canonical binding excludes resourceLinks; historical page is internally pinned but image URL/altText/asset are changed for matrix.'if id==mid else 'Whole goal and its linked asset remain unchanged in this delta.'})
assert len(dRows)==3
policy=read(Q/'math-final-three-duration-binding-2026-11-06/candidate-policy.json');assert policy['inputs']['canonical']['sha256']==sh(aRaw)
plan=read(R/'docs/dev/ci-graph-repairs/math-final-three-duration-binding-guarded-plan-2026-11-06.json');guards=plan['requiredGuardsBeforeAnyFutureLivePolicyWrite'];bound=[]
for x in guards['all13BoundOriginalReviewFilesUnchanged']:
 actual=ref(R/x['path']);assert actual['sha256']==x['sha256'];bound.append(actual)
views=[]
for x in guards['all18LiveOutputHashesUnchanged']:
 p=R/'curricula/DE/Gymnasium/composition-views/mathematik'/x['fileName']
 if not p.exists():
  matches=list((R/'curricula/DE/Gymnasium/composition-views').rglob(x['fileName']));p=next(q for q in matches if 'mathematik' in str(q))
 actual=ref(p);assert actual['sha256']==x['liveSha256'];views.append(actual)
code=['app/scripts/goalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/goalBookModel.ts','app/scripts/validateGoalDescriptionReviewCampaign.ts','app/scripts/validateGoalDescriptionDualRoundResolution.ts','app/scripts/reportDeepUnderstandingRollout.ts','app/scripts/generateCurriculumQualityStatus.ts','app/scripts/generateMathDurationCompositionViews.ts','app/scripts/goalVisualizationReviewedContext.ts','contracts/goal-visualization-context/v1/qualification.schema.json','docs/concept/curriculum-quality-and-human-trial.md']
result={'schemaVersion':1,'method':'Read-only raw byte and JSON-field comparison against pinned production functions; Python mirror fingerprints first required to equal all31 existing native P fingerprints and exact3Kind/1A/1M fingerprints. No App/native test or generator executed.','beforeSourceSha256':sh(aRaw),'afterSourceSha256':sh(bRaw),'goals':len(A),'changedGoals':changed,'allGoalFieldsExceptResourceLinksEqual':all({k:v for k,v in A[id].items()if k!='resourceLinks'}=={k:v for k,v in B[id].items()if k!='resourceLinks'}for id in A),'kind':{'productionPointers':kindKeys,'allSourceGoalPayloadsEqual':all(kind(A[id])==kind(B[id])for id in A),'threeDraftRows':kindRows},'atomicityMemory':{'allSourceGoalPayloadsEqual':all(am(A[id],'x')==am(B[id],'x')for id in A),'freshDraftRows':amRows,'cardDataNotChanged':True},'positive':{'count':len(pRows),'unchangedInputs':sum(r['inputEqual']for r in pRows),'changedInputs':sum(not r['inputEqual']for r in pRows),'rows':pRows},'description':dRows,'duration':{'candidate967aPolicy':ref(Q/'math-final-three-duration-binding-2026-11-06/candidate-policy.json'),'canonicalRawHashGuardMismatchesE4de':True,'all13OriginalReviewBytesUnchanged':bound,'all18CurrentOutputBytesStillEqual967aRecordedOutputs':views,'e4deNativeGenerationRun':False,'allNonResourceGoalFieldsUnchanged':True,'policyHashMayNotBeBlindlyRewritten':True},'codePins':[ref(R/p)for p in code]}
(O/'analysis.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'path':str(O/'analysis.json'),'sha256':sh((O/'analysis.json').read_bytes()),'goals':len(A),'p':{'count':len(pRows),'changed':[r['goalId']for r in pRows if not r['inputEqual']]},'kind':kindRows,'durationOriginals':len(bound),'durationOutputs':len(views)},ensure_ascii=False,indent=2))
