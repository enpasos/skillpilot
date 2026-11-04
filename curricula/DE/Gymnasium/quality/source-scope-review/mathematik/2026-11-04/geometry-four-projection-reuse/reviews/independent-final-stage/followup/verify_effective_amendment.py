from pathlib import Path
import json,hashlib,subprocess,difflib
F=Path(__file__).resolve().parent;H=F.parent.parent;R=H.parents[1];G=H/'geometry-four-projection-reuse-integration-20261104-v1';A=H/'geometry-four-required-contract-guard-amendment-20261104-v1';E=H/'geometry-four-source-and-guard-followup-20261104-v1';O=G/'check-host';C=E/'check-host'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
def binding(p):return {'path':str(p.relative_to(R)),'sha256':sha(p)}
assert sha(E/'manifest.effective-source-guard-followup.json')=='183a61e98de85a48ad70931cdb05a4a61ebfda63439a23d78daa862a008cabd0'
assert sha(A/'amendment-manifest.json')=='547983f852d8acb15a5e5c03a2672e150ccb03ce817dfebf62a9bf519f7b55d7'
a={x['path']:x for x in read(G/'manifest.json')['files']};b={x['path']:x for x in read(E/'manifest.effective-source-guard-followup.json')['files']};assert len(a)==298 and len(b)==306
for p,v in b.items():assert sha(C/p)==v['candidateSha256'] and sha(R/v['candidatePath'])==v['candidateSha256']
for p,v in a.items():assert sha(O/p)==v['candidateSha256'] and sha(R/v['candidatePath'])==v['candidateSha256']
for v in read(A/'amendment-manifest.json')['files']:assert sha(R/v['candidatePath'])==v['candidateSha256']
for v in read(A/'amendment-manifest.json')['evidence']:assert sha(A/v['path'])==v['sha256']
changed=[p for p in a if a[p]['candidateSha256']!=b[p]['candidateSha256']];new=sorted(b.keys()-a.keys());pol='app/scripts/config/math-country-seki-stage-policy.json';lay='app/scripts/config/math-duration-split-spanning-tree-policy.json';guard='backend/src/test/java/com/skillpilot/backend/composition/MaterializeMathContextualCombinedViews.java';gen='app/scripts/generateHeMathSekiSourceExtraction.ts';ex='curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_MATHEMATIK_SEKI_KC_G8_G9.source-extraction.json';author='curricula/DE/Gymnasium/quality/source-scope-review/mathematik/2026-11-04/geometry-four-projection-reuse/source-and-required-guard-followup/author-exact-source-and-guard-followup.json'
assert set(changed)=={pol,lay,guard}
assert (C/gen).read_text().replace('    official: true,\n','')==(O/gen).read_text()
old=read(O/ex);end=read(C/ex);historical=subprocess.run(['git','show','8ced88b65d^:'+ex],cwd=R,check=True,capture_output=True).stdout;assert hashlib.sha256(historical).hexdigest()=='3ec1451c515f4bc70d97690331ca66f922d933355c4326e1dc4100a95e3e664c';hist=json.loads(historical);deltas=[]
def diff(a,b,path=''):
 if type(a)!=type(b):deltas.append([path,a,b]);return
 if isinstance(a,dict):
  for k in sorted(a.keys()|b.keys()):
   if k not in a or k not in b:deltas.append([path+'/'+k,a.get(k),b.get(k)])
   elif a[k]!=b[k]:diff(a[k],b[k],path+'/'+k)
 elif isinstance(a,list):
  assert len(a)==len(b),(path,'unexpected list size')
  for i,(x,y) in enumerate(zip(a,b)):
   if x!=y:diff(x,y,path+'/'+str(i))
 elif a!=b:deltas.append([path,a,b])
diff(old,end)
assert {x[0] for x in deltas}=={'/sourceDocument/official'}|{'/sourceDocuments/'+str(i)+'/official' for i in range(4)}
assert all(x[1] is None and x[2] is True for x in deltas)
assert len(end['sourceGoals'])==602
for doc in end['sourceDocuments']:assert next(x for x in hist['sourceDocuments']if x['key']==doc['key'])['official'] is True
p=read(C/pol);po=read(O/pol);assert len(p['sourceBindings'])==len(po['sourceBindings']);pins=[]
for x,y in zip(po['sourceBindings'],p['sourceBindings']):
 if x!=y:
  assert x['path']==y['path'] and x['path'] in {gen,ex,guard};z=dict(x);z['sha256']=sha(C/y['path']);assert z==y;pins.append({'path':x['path'],'beforeSha256':x['sha256'],'afterSha256':y['sha256']})
assert len(pins)==3;assert p['stageDecisionBindings']==po['stageDecisionBindings']+[{'path':author,'sha256':sha(C/author)}]
for k in p:
 if k not in {'sourceBindings','stageDecisionBindings'}:assert p[k]==po[k],k
l=read(C/lay);lo=read(O/lay);assert l['inputs']['sourceScopeDecisions']==lo['inputs']['sourceScopeDecisions']+[{'path':author,'sha256':sha(C/author)}]
l['inputs']['sourceScopeDecisions']=lo['inputs']['sourceScopeDecisions'];assert l==lo
au=read(C/author)
for x in au['exactFinalProducerInputs']:assert sha(C/x['path'])==x['sha256']
for k in ['guardAmendment','sourceMetadataRestoration','unchangedOriginalSourceRegression']:assert sha(C/au[k]['path'])==au[k]['sha256']
for x in p['sourceBindings']+p['stageDecisionBindings']:assert sha(C/x['path'])==x['sha256'],x['path']
for x in lo['inputs']['sourceScopeDecisions']:assert sha(C/x['path'])==x['sha256']
for path in [x['path'] for x in read(F.parent/'all-view-roles.actual.json')['rows']]:assert sha(C/path)==sha(O/path)
java=list((C/'backend/src/main/java').rglob('*.java'));assert len(java)==482
for x in java:assert sha(x)==sha(O/x.relative_to(C))==sha(R/x.relative_to(C))
result={'status':'PASS_INDEPENDENT_FINITE_SOURCE_GUARD_AND_EFFECTIVE_PRODUCER_BINDINGS','effectiveManifest':binding(E/'manifest.effective-source-guard-followup.json'),'originalManifest':binding(G/'manifest.json'),'guardAmendmentManifest':binding(A/'amendment-manifest.json'),'effectiveLeaves':306,'original298Unchanged':True,'originalLeafReplacementsInSuccessor':changed,'additionalSuccessorPaths':new,'sourceGeneratorOnlyFourOfficialFlags':True,'sourceExtractionExactFiveFields':deltas,'all602SourceGoalsAndPassagesUrlsPdfsAuditFieldsOtherwiseUnchanged':True,'historicalFourFlagsVerifiedByGitObjectSha256':hashlib.sha256(historical).hexdigest(),'sourceProducerPins':pins,'policy':binding(C/pol),'layout':binding(C/lay),'author':binding(C/author),'whole147ViewsUnchangedFromOriginalG4':True,'productionMainSourcesUnchanged':482,'noAdditionalT_R_Task_CoverageChange':True,'sourceMetadataImplication':'Official provenance flags restore existing citation rendering; they do not alter source coverage or make legacy sequencing documents compulsory current curriculum.','codeDecision':'Exact G4 identity recursively as key/value in canonical/plan/bindings requires the placement contract before any output. Genuine G3 remains passively compatible. No production role algorithm, reflection, or Main change.','independent29GuardNegatives':binding(F/'guard-negatives.actual.json'),'independentGenuineG3Positive':binding(F/'genuine-g3-positive.actual.json'),'stageApproval':False}
(F/'effective-source-guard-independent.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(result['status'])
