# SPDX-License-Identifier: Apache-2.0
"""Preserve first author inputs; adopt actual reviewed concurrent integration only."""
from pathlib import Path
from datetime import datetime, timezone
import json, hashlib, shutil, os
R=Path.cwd(); D=Path(__file__).resolve().parent; B=D/'rebase-current'; REQ={}
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
rel=lambda p:str(Path(p).relative_to(R))
def bind(p):
 p=Path(p);v={'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size};REQ[v['path']]=v;return v
def read(p):bind(p);return json.loads(Path(p).read_text())
def put(name,v):
 p=D/name;p.parent.mkdir(parents=True,exist_ok=True);b=(json.dumps(v,ensure_ascii=False,indent=2)+'\n').encode()
 if p.exists():assert p.read_bytes()==b,p;return bind(p)
 t=p.with_suffix(p.suffix+'.tmp');t.write_bytes(b);os.replace(t,p);return bind(p)
def copy(p,name):
 p=Path(p);bind(p);q=D/name;q.parent.mkdir(parents=True,exist_ok=True)
 if q.exists():assert q.read_bytes()==p.read_bytes(),q
 else:shutil.copyfile(p,q)
 return bind(q)
g=read(D/'current24-author-inputs-and-lossless-source-AM.guard.json');ids=g['selected24GoalIds'];root=read(R/g['rootEntry']['path']);old=read(R/g['current476CanonicalSnapshot']['path']);active=R/root['current476Whole392AtomicCanonical']['path'];new=read(active);ob={a['id']:a for a in old['goals']};nb={a['id']:a for a in new['goals']};assert len(ob)==len(nb)==476 and ob.keys()==nb.keys()
changed=[i for i in ob if ob[i]!=nb[i]];assert set(changed)==set(root['separateEvolution18GoalIds']) and not set(ids)&set(changed)
assert sha(active)=='4ba55e4eccaf1892d4f541a0ef20eb0402170b1c6f2543e05ce7b00e30fa30a5'
canon=copy(active,'rebase-current/canonical.current476.exact.json');kinds=copy(R/'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json','rebase-current/semantic-kinds.current476.exact.json')
context=read(D/'selected24.current-whole-goals.context.author.json');newContext={**context,'wholeGoals':[nb[i]for i in ids],'contexts':[{'goalId':i,'wholePrerequisites':[nb[j]for j in nb[i].get('requires',[])],'wholeParents':[v for v in nb.values()if i in v.get('contains',[])],'wholeConsumers':[v for v in nb.values()if i in v.get('requires',[])]}for i in ids]};assert context['wholeGoals']==newContext['wholeGoals']
contextDeltas=[{'ordinal':n+1,'goalId':ids[n],'beforeWholeContext':a,'afterWholeContext':b}for n,(a,b)in enumerate(zip(context['contexts'],newContext['contexts']))if a!=b];assert [d['ordinal']for d in contextDeltas]==[13]
assert contextDeltas[0]['beforeWholeContext']['wholeParents']==contextDeltas[0]['afterWholeContext']['wholeParents']and contextDeltas[0]['beforeWholeContext']['wholePrerequisites']==contextDeltas[0]['afterWholeContext']['wholePrerequisites']
ctx=put('rebase-current/selected24.current-whole-goals.context.exact.json',newContext)
kindOld=read(R/g['current476KindsSnapshot']['path']);kindNew=read(R/kinds['path']);ko={a['goalId']:a for a in kindOld['decisions']};kn={a['goalId']:a for a in kindNew['decisions']};assert ko.keys()==kn.keys()and all(ko[i]==kn[i]for i in ids)
kindDelta=[i for i in ko if ko[i]!=kn[i]];patchIds=['302c6d6d-bf10-5dbc-adda-65e4b5c63e49','35b016d8-ed2c-570c-ab64-ac39f8f962b2'];assert set(kindDelta)==set(patchIds)
am=[]
for lane,folder in [('A','semantic-atomicity'),('M','memory-card-review')]:
 p=R/f'curricula/DE/Gymnasium/quality/{folder}/canonical-biology-full.config.json';cfg=read(p);beforeRows=[json.loads(l)for l in(D/f'AM/{lane}.whole392.current-reviewed.exact.jsonl').read_text().splitlines()];afterPath=R/cfg['reviewPath'];afterRows=[json.loads(l)for l in afterPath.read_text().splitlines()];a={v['goalId']:v for v in beforeRows};b={v['goalId']:v for v in afterRows};assert len(a)==len(b)==392 and a.keys()==b.keys();delta=[i for i in a if a[i]!=b[i]];assert set(delta)==set(patchIds)and all(a[i]==b[i]for i in ids)
 rows=copy(afterPath,f'rebase-current/AM/{lane}.whole392.current-reviewed.exact.jsonl');cfg['landscapePath']=canon['path'];cfg['reviewPath']=rows['path'];cfg['reportPath']=rel(B/f'AM/{lane}.whole392.native-retained.report.actual.md')
 if lane=='M':
  assert(R/cfg['cardReviewPath']).read_bytes()==(D/'AM/M.current.cards.exact.jsonl').read_bytes();cfg['cardReviewPath']=rel(D/'AM/M.current.cards.exact.jsonl')
  for n,v in enumerate(cfg['visibilityScopes']):assert(R/v['viewPath']).read_bytes()==(D/f'AM/visibility-{n:02}.current.view.json').read_bytes();v['viewPath']=rel(D/f'AM/visibility-{n:02}.current.view.json')
 cfgBinding=put(f'rebase-current/AM/{lane}.whole392.exact-retained-current.config.json',cfg);am.append({'lane':lane,'activeConfig':bind(p),'actualActiveReview':bind(afterPath),'currentSnapshot':rows,'config':cfgBinding,'actualChangedOutside24':delta,'unchanged390RowsExact':True,'selected24RowsExact':True,'newScienceApproval':False})
pool=read(D/'source/whole24-all-current-regional-source-duties-all-1n-partners.lossless.json');atlasPath=R/'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json';atlas=read(atlasPath);assert atlas['mappingPaths']==pool['all29CurrentFutureMappingPathsRetained']
for pair in pool['mappingExtractionGuards']:
 for v in pair.values():assert sha(R/v['path'])==v['sha256'];bind(R/v['path'])
atlasSnapshot=copy(atlasPath,'rebase-current/current-active-atlas.inputs.exact.json')
pconfig=read(D/'P14.clear-current-source-only.author.config.json');pconfig['landscapePath']=canon['path'];pconfig['semanticKindLedgerPath']=kinds['path'];pconfig['reviewPath']=copy(R/pconfig['reviewPath'],'rebase-current/P14.source-only.exact-retained.author.review.jsonl')['path'];pconfig['reviewId']='biologie-he-metabolism-ecology-whole24-source-only-current-evolution18-author';pc=put('rebase-current/P14.source-only.current.author.config.json',pconfig)
declared=read(D/'checks/initial-declared-inputs.author.json');drift=[]
allowed={root['current476Whole392AtomicCanonical']['path'],'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json','curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.config.json','curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.config.json'}
for v in declared['files']:
 p=R/v['path']
 if sha(p)!=v['sha256']:assert v['path']in allowed;drift.append({'historicalDeclaredInput':v,'actualConcurrentCurrentInput':bind(p)})
 else:bind(p)
assert len(drift)==4
put('checks/first-sealer-concurrent-active-drift.observed.json',{'observedAt':datetime.now(timezone.utc).isoformat(),'actualFirstSealerExitCode':1,'actualFailure':'AssertionError verifying initial-declared-inputs author canonical SHA; no entry or seal had been written','oldCanonicalSha256':g['current476CanonicalSnapshot']['sha256'],'actualCurrentCanonical':canon,'reason':'Concurrent genuinely reviewed Root Evolution18 active integration, not an author mutation','changedMutableDeclaredInputs':drift,'originalBeforeAndAuthorInputsRetained':True,'scientificReviewClaimed':False})
put('rebase-current/technical-rebase-current-whole24-author.guard.json',{'role':'Actual technical adoption of concurrent reviewed Evolution18 integration before first Bio24 author freeze; not scientific approval','rootSelection':g['rootEntry'],'original204AuthorGuard':bind(D/'current24-author-inputs-and-lossless-source-AM.guard.json'),'actualCurrentCanonical':canon,'actualCurrentKinds':kinds,'actualCurrentSelected24Contexts':ctx,'actualAll24WholeGoalBodiesExact':True,'currentContextDeltas':contextDeltas,'contextBoundary':'Only species-concepts successor Phylogenie-Methoden has the genuine Root-reviewed spelling/English correction and new raster link. This revised whole context is presented to both new independent Bio24 science reviewers; no earlier Bio24 review exists to rebind.','all18CanonicalChangedIds':changed,'all458OtherCanonicalWholeGoalsExact':True,'semanticKindChangedIdsOutside24':kindDelta,'actualCurrentAM':am,'actualCurrentAtlasInputs':atlasSnapshot,'all29MappingPathsAndAll45Duties293PartnersExact':True,'whole144Reviewed18v3ActiveMappingExact':True,'P14SourceOnlyNativeConfig':pc,'P14ProfileRecordsByteExact':True,'nativeCurrentChecksPending':True,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False})
put('rebase-current/actual-current-required-input-bindings.json',{'files':list(REQ.values()),'historicalInputsNotRewritten':True,'activeWrites':0});print(json.dumps({'actualCurrentCanonical':canon,'selected24WholeBodiesExact':True,'currentContextDeltas':len(contextDeltas),'currentAM390OtherRowsExact':True,'source45Duties293PartnersExact':True,'activeWrites':0}))
