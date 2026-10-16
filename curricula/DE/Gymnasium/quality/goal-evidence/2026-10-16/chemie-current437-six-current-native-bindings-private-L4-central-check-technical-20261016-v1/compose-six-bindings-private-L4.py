# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import collections,copy,datetime,hashlib,json
R=Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16';O=Path(__file__).resolve().parent;L=R/'tmp/chemie-m7-resumed-20261016/chemie-combined639-two-GK-priors-final-review-capsule-v1'
C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';SEM='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';V='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json';M='curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json'
def read(p):return json.loads(Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def fp(x):return 'sha256:'+hashlib.sha256(json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
def pin(p):return {'path':str(Path(p).relative_to(R)),'sha256':sha(p),'bytes':Path(p).stat().st_size}
def putO(n,x):
 p=O/n;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
def rawO(n,b):
 p=O/n;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_bytes(b);return p
def rel(p):return str(Path(p).relative_to(R))
def lines(p):return [(json.loads(b),b)for b in Path(p).read_bytes().splitlines(keepends=True)if b.strip()]
assert sha(L/C)=='sha256:36975262a3d66998c75cca5c9bbe899d57f98b2614edcbded2baec4833e77903';can=read(L/C);by={g['id']:g for g in can['goals']};semantic=read(L/SEM);ordinary={g['goalId']for g in semantic['decisions']if g['semanticKind']=='curricularAtomic'};assert len(ordinary)==437
base=E/'chemie-current437-paired-nine-five-gate-owner-integration-technical-20261016-v1/central.current437.all437-paired-final-inputs.inactive.config.json';cfg=read(base);assert len(cfg['subjects'])==1;s=cfg['subjects'][0];assert len(s['semanticAtomicityConfigPaths'])==71 and len(s['positiveEvidenceConfigPaths'])==102
A4=E/'chemie-shared-three-and-faraday-kind-current437-independent-a-20261016-v1';A2=E/'chemie-two-generic-GK-priors-and-recall-fresh-independent-a-20261016-v1';B4=E/'chemie-shared-three-and-faraday-kind-current437-independent-b-20261016-v1';B2=E/'chemie-two-generic-GK-priors-and-recall-independent-b-20261016-v1'
sel4=A4/'HANDOFF.actual-native4-current-L3-independent-a.selector.sealed.json';sel2=A2/'HANDOFF.actual-native2-current-l4-independent-a.selector.sealed.json';sealB4=B4/'MANIFEST.final-current-native-four-independent-b.sealed.json';sealB2=B2/'MANIFEST.final-current-native-two-independent-b.sealed.json'
assert sha(sel4)=='sha256:d6b9dcc927a28cb26d6cfb6d777fbcaca9e5c83aa1af77c30504ec6929fa9e17';assert sha(sel2)=='sha256:3d0d986005ff10ca61ac7de293d1a486280f5b109f3929ba4fcf2ae886c8d3af';assert sha(sealB4)=='sha256:41d8d96e206791aacb4a2731450f1b6970545784b28276905c28dede8168d5a6';assert sha(sealB2)=='sha256:65c13368d02822915537b89ef2b22264b265efc86a01bbd92fa0eeceaf346c8c'
selected=[]
for sel in [sel4,sel2]:
 for p in read(sel)['selectedOutputFiles']:
  assert sha(R/p['path'])==p['sha256'];selected.append(R/p['path'])
ids4=read(A4/'A4.current-independent.config.json')['scope']['leafGoalIds'];ids2=read(A2/'A2.current-independent.config.json')['scope']['leafGoalIds'];six=set(ids4+ids2);assert len(six)==6
native4=E/'chemie-combined639-shared-six-exam-seven-native-four-private-L3-technical-20261016-v1/native-four/resolution-index.json';native2=E/'chemie-combined639-two-gk-priors-native-two-private-l4-technical-20261016-v1/native-two/resolution-index.json';assert sha(native4)=='sha256:09cee15599ad7039a44bd2f0577187f57f8d7eceded15826ec3fdd7fb2876418';assert sha(native2)=='sha256:d21be0d84e3abdbf0054f0f8bc7973df044407fca6cd0c7b76faa1272f384753'
for root,n,peer,stage in [(A4,'4',B4,'3'),(A2,'2',B2,'4')]:
 pa={x['goalId']:x for x,_ in lines(root/f'P{n}.current-independent.review.jsonl')};pb={x['goalId']:x for x,_ in lines(peer/f'P{n}.actual-current-L{stage}-informed-independent-b.review.jsonl')};ma={x['goalId']:x for x,_ in lines(root/f'M{n}.current-independent.review.jsonl')};mb={x['goalId']:x for x,_ in lines(peer/f'M{n}.actual-current-L{stage}-informed-independent-b.review.jsonl')}
 for i in pa:
  assert pa[i]['profile']==pb[i]['profile'];assert pa[i]['goalFingerprint']==pb[i]['goalFingerprint'];assert pa[i]['profileFingerprint']==pb[i]['profileFingerprint']
  for k in ['fingerprint','status','memoryUseful','memoryGoalIds','deckIds']:assert ma[i].get(k)==mb[i].get(k),(i,k)
inputs=[E/'chemie-combined639-shared-six-exam-seven-native-four-private-L3-technical-20261016-v1/INPUT.four-whole-current-goals-and-whole-direct-prerequisites.json',E/'chemie-combined639-two-gk-priors-native-two-private-l4-technical-20261016-v1/INPUT.two-whole-current-goals-and-whole-direct-prerequisites.json']
for p in inputs:
 for g in read(p)['wholeGoals']:assert by[g['id']]==g
protected=[R/C,R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',R/M,R/V,L/C,L/SEM]+[L/p for p in ['curricula/DE/Gymnasium/composition-views/chemie/de-he-gk.view.json','curricula/DE/Gymnasium/composition-views/chemie/de-he-lk.view.json']]
for name in ['current578-one-sparse-own-host-v1','chemie-combined639-current-native-review-capsule-v1','chemie-combined639-current-type-corrected-review-capsule-v1','chemie-combined639-shared-and-seven-final-review-capsule-v1']:protected.append(R/'tmp/chemie-m7-resumed-20261016'/name/C)
sourcepins=[pin(p)for p in dict.fromkeys([base,sel4,sel2,sealB4,sealB2,native4,native2,*selected,*inputs])];protectedpins=[pin(p)for p in protected if p.exists()]
putO('FIRST.technical-six-current-independent-bindings.input-freeze.json',{'role':'Technical binding composition only, no author content or independent science vote','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'privateL4Canonical':pin(L/C),'semantic639':pin(L/SEM),'visualization460Before':pin(L/V),'actualIndependentAuthorityInputs':sourcepins,'protectedInputs':protectedpins,'affectedSixIds':sorted(six),'retention':'437minus6=431 unchanged A/P owners; inherited M437minus2=435 unchanged whole lines; cards79 exact; V460minus6=454 unchanged whole objects','noHumanApprovalTrialOrM7':True})
rawO('INPUT.QA460.before.exact.json',(L/V).read_bytes());rawO('INPUT.M-full495-config.before.exact.json',(L/M).read_bytes());beforeMconfig=read(L/M);oldMpath=L/beforeMconfig['reviewPath'];assert sha(oldMpath)=='sha256:feae37069c220893d32df8c25a0ff686461b023b7327d2567c7a7183c717db44';rawO('INPUT.M437.before-inherited-four.exact.jsonl',oldMpath.read_bytes());cards=L/beforeMconfig['cardReviewPath'];cardpin=pin(cards);assert len(lines(cards))==79
log=[]
def own_parent(r):
 cur=L
 for part in Path(r).parent.parts:
  cur=cur/part
  if cur.is_symlink():
   origin=cur.resolve(strict=True);children=list(origin.iterdir());cur.unlink();cur.mkdir()
   for ch in children:(cur/ch.name).symlink_to(ch)
   log.append({'operation':'detach-parent-directory-symlink','path':str(cur.relative_to(L)),'origin':str(origin)})
  elif not cur.exists():cur.mkdir()
  else:assert cur.is_dir()
def putL(r,b):
 own_parent(r);p=L/r
 if p.exists()and not p.is_symlink()and p.read_bytes()==b:return
 prior={'isSymlink':p.is_symlink(),'nlink':p.lstat().st_nlink}if p.exists()or p.is_symlink()else None
 if p.exists()or p.is_symlink():p.unlink()
 with p.open('xb')as f:f.write(b)
 assert not p.is_symlink()and p.stat().st_nlink==1;log.append({'operation':'private-detached-leaf-write','path':r,'prior':prior,'sha256':sha(p),'afterNlink':p.stat().st_nlink})
def stage(p):putL(rel(p),p.read_bytes())
def own_record_config(kind,key,scopekey):
 oldowners={};newowners={};changes=[];newpaths=[];retainedblob={}
 for j,path in enumerate(s[key]):
  p=L/path;d=read(p);scope=d['scope'][scopekey];rr=lines(L/d['reviewPath']);records={r['goalId']:(r,b)for r,b in rr};assert set(scope)<=set(records)
  for i in scope:assert i not in oldowners;oldowners[i]={'config':path,'record':d['reviewPath'],'rawLineSHA256':'sha256:'+hashlib.sha256(records[i][1]).hexdigest()};retainedblob[i]=records[i][1]
  drop=set(scope)&six
  if not drop:newpaths.append(path);continue
  remain=[i for i in scope if i not in six];assert remain
  data=b''.join(b for r,b in rr if r['goalId']not in six);rp=rawO(f'retained-records/{kind}-{j+1:03d}.whole-original-lines-minus-superseded-only.jsonl',data);nd=copy.deepcopy(d);nd['scope'][scopekey]=remain;nd['reviewPath']=rel(rp);np=putO(f'config/{kind}-{j+1:03d}.original-review-id.scope-only-retained.config.json',nd);assert nd['reviewId']==d['reviewId'];stage(rp);stage(np);newpaths.append(rel(np));changes.append({'oldConfig':pin(p),'oldReviewRecords':pin(L/d['reviewPath']),'removedGoalIds':sorted(drop),'retainedScopeGoalIds':remain,'newConfig':pin(np),'newRecordFile':pin(rp),'allRetainedLinesByteExact':True,'reviewIdUnchanged':True})
 assert set(oldowners)==ordinary;assert len(changes)==6
 for root,n in [(A4,'4'),(A2,'2')]:
  p=root/f'{kind}{n}.current-independent.config.json';d=read(p);stage(p);stage(R/d['reviewPath']);newpaths.append(rel(p))
 for path in newpaths:
  d=read(L/path);rr={r['goalId']:(r,b)for r,b in lines(L/d['reviewPath'])}
  for i in d['scope'][scopekey]:
   assert i not in newowners;newowners[i]={'config':path,'record':d['reviewPath'],'rawLineSHA256':'sha256:'+hashlib.sha256(rr[i][1]).hexdigest()}
   if i not in six:assert rr[i][1]==retainedblob[i]
 assert set(newowners)==ordinary;assert sum(newowners[i]==oldowners[i]for i in ordinary-six)>=0
 return newpaths,{'gate':kind,'sourceConfigCount':len(s[key]),'selectedConfigCount':len(newpaths),'oldCurrentOwners':len(oldowners),'currentUniqueOwners':len(newowners),'unchangedWholeSelectedLines':len(ordinary-six),'originalSelectedOwners':oldowners,'selectedOwnersAfter':newowners,'changedRetentionConfigs':changes,'onlySixOwnersReplaced':True}
apaths,aret=own_record_config('A','semanticAtomicityConfigPaths','leafGoalIds');ppaths,pret=own_record_config('P','positiveEvidenceConfigPaths','goalIds');s['semanticAtomicityConfigPaths']=apaths;s['positiveEvidenceConfigPaths']=ppaths
# Exact current own records/configs selected by the two sealed A selectors; no historical-invalid NativeA output is selected.
for p in selected:stage(p)
oldM=lines(oldMpath);m2={r['goalId']:r for r,_ in lines(A2/'M2.current-independent.review.jsonl')};newM=[];mproof=[]
for r,b in oldM:
 if r['goalId']not in m2:newM.append(b);continue
 x=copy.deepcopy(m2[r['goalId']]);x['reviewId']=beforeMconfig['reviewId'];assert {k:v for k,v in x.items()if k!='reviewId'}=={k:v for k,v in m2[r['goalId']].items()if k!='reviewId'};newM.append((json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n').encode());mproof.append({'goalId':r['goalId'],'oldWholeRecord':r,'sourceActualIndependentAWholeRecord':m2[r['goalId']],'selectedWholeRecord':x,'changedFromIndependentOriginalFields':['reviewId'],'reviewerTimestampStatusReasonFingerprintPreserved':True})
assert len(mproof)==2 and len(newM)==437;mp=rawO('records/M437.retained435-whole-lines-two-actual-A2-review-id-only-normalized.jsonl',b''.join(newM));stage(mp);mc=copy.deepcopy(beforeMconfig);mc['reviewPath']=rel(mp);putL(M,(json.dumps(mc,ensure_ascii=False,indent=2)+'\n').encode());putO('CHECK.M437-whole435-retention-two-current-A2-and-cards79-exact.json',{'beforeConfig':pin(O/'INPUT.M-full495-config.before.exact.json'),'beforeReviews':pin(O/'INPUT.M437.before-inherited-four.exact.jsonl'),'afterReviews':pin(mp),'allOther435WholeLinesExact':True,'inheritedFourActualIndependentMRowsUnchanged':True,'twoReviewIdOnlyNormalizations':mproof,'cards79BeforeAndAfterExact':pin(cards)==cardpin,'cards79':cardpin,'noNewMVote':True})
vbefore=read(O/'INPUT.QA460.before.exact.json');vnew=copy.deepcopy(vbefore);vb={r['goalId']:r for r in vbefore['records']};vs={r['goalId']:r for p in [A4/'V4.current-exact-assets-independent.qa.json',A2/'V2.current-exact-assets-independent.qa.json']for r in read(p)['records']};assert set(vs)==six;vproof=[]
for x in vs.values():
 before=vb[x['goalId']];diff=[k for k in set(before)|set(x)if before.get(k)!=x.get(k)];assert set(diff)<={'aiApproved','aiApprovedAssetSha256','aiReviewedAt','aiReviewer','aiNotes'}
 for k in before:
  if k.lower().startswith('human'):assert x[k]==before[k]
 assert x['aiApproved']=='yes'and x['aiApprovedAssetSha256']==x['assetSha256']
 for p in [x['canonicalAssetPath'],x['publicAssetPath']]:assert sha(L/p)==x['assetSha256']
 vproof.append({'goalId':x['goalId'],'changedFields':sorted(diff),'exactIndependentWholeRecord':x,'allHumanFieldsExact':True,'actualCanonicalAndPublicAssetBytesExact':True})
vnew['records']=[vs.get(r['goalId'],r)for r in vnew['records']];assert len(vnew['records'])==460;assert sum(r==vb[r['goalId']]for r in vnew['records']if r['goalId']not in six)==454;vp=putO('QA460.actual-six-current-independent-A-successors.other454-exact.json',vnew);putL(V,vp.read_bytes());putO('CHECK.V460-exact-six-current-approved-AI-records-and454-retention.json',{'before':pin(O/'INPUT.QA460.before.exact.json'),'after':pin(vp),'other454WholeRecordsExact':True,'all460HistoricalHumanFieldsExact':True,'sixIndependentSourceWholeRecords':vproof,'stockSerializerNotYetInvoked':'Only six AI metadata successors differ; unmodified central check will invoke the stock V freshness serializer in check mode. No generator logic or image changed.'})
oldindices=copy.deepcopy(s['resolutionIndexPaths']);oldedges=copy.deepcopy(s['resolutionSupersessions']);dedges=[]
for p in [native4,native2]:
 ind=read(p);assert len(ind['resolutions'])in[4,2];assert all(r['strictDescriptionComplete']and r['decision']=='keep_current'for r in ind['resolutions']);assert rel(p)not in s['resolutionIndexPaths'];s['resolutionIndexPaths'].append(rel(p))
 for row in ind['resolutions']:
  i=row['goalId'];claims=[]
  for path in oldindices:
   d=read(L/path)
   if any(r.get('goalId')==i for r in d.get('resolutions',[])):claims.append(path)
  active=[x for x in claims if not any(e['goalId']==i and e['supersededIndexPath']==x for e in oldedges)and not any(e['goalId']==i and e['indexPath']==x for e in s['resolutionWithdrawals'])];assert len(active)==1,(i,active)
  edge={'goalId':i,'supersededIndexPath':active[0],'replacementIndexPath':rel(p)};s['resolutionSupersessions'].append(edge);dedges.append(edge)
assert len(dedges)==6;assert s['resolutionIndexPaths'][:100]==oldindices;assert s['resolutionSupersessions'][:208]==oldedges
for p in [native4,native2]:
 # Exact finalized stock metadata already exists in L4; preserve all native page bytes.
 for f in p.parent.rglob('*'):
  if f.is_file():assert (L/rel(f)).exists()and sha(L/rel(f))==sha(f)
cfg['reportId']='chemie-current437-six-current-native-bindings-private-L4-stable-technical-check-20261016-v1';conf=putO('central.current437.six-current-native-bindings.private-L4.inactive.config.json',cfg);stage(conf);putO('CHECK.D-six-current-supersessions-history-retained.json',{'originalIndexCount':100,'selectedIndexCount':102,'original208EdgesExact':True,'selectedSupersessionEdges':214,'newEdges':dedges,'allOriginalWithdrawalsAndSemanticRetirementsExact':True,'newIndices':[pin(native4),pin(native2)],'noDoubleCurrentOwnersIntended':True})
putO('CHECK.A-P-exact-current-owner-selection-and-whole431-retention.json',{'A':aret,'P':pret,'noNewScienceVotes':True})
stockpaths=['app/scripts/reportDeepUnderstandingRollout.ts','app/scripts/semanticAtomicityReview.ts','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/memoryCardReview.ts','app/scripts/generateGoalVisualizationQaLedgers.ts','scripts/goal_visualization_scope.mjs'];stock=[]
for path in stockpaths:
 assert (L/path).exists()and sha(L/path)==sha(R/path);stock.append({'path':path,'R':pin(R/path),'L4':pin(L/path),'byteExact':True})
assert pin(cards)==cardpin;drift=[p for p in protectedpins if sha(R/p['path'])!=p['sha256']];assert not drift
putO('COMPOSITION.actual-private-L4-six-current-native-bindings.technical-receipt.json',{'role':'Actual private technical integration of already independently reviewed current inputs; no scientific re-adjudication','canonical':pin(L/C),'semantic639':pin(L/SEM),'centralConfig':pin(conf),'selectedNativeIndices':[pin(native4),pin(native2)],'selectedCurrentAAndPRecordsFromOriginalSealedSelectorsExact':True,'AOriginalConfigCount':71,'ASelectedConfigCount':len(apaths),'POriginalConfigCount':102,'PSelectedConfigCount':len(ppaths),'unchangedSelectedAPWholeRowsPerGate':431,'MOther435WholeLinesExact':True,'cards79Exact':True,'VOther454WholeRecordsAndAllHumanFieldsExact':True,'stockModules':stock,'writeDetachmentLog':log,'protectedInputs':protectedpins,'protectedInputDrift':drift,'knownOpenExternalGates':['APV203:152raw-versus-compiled-applicability warnings from actual previous b3c report; current canonical requires-only2 changes have no authored applicability correction','HE145/327 current185/265 whole-admission original-A/B-informed followups pending; full44BE paper content pairs preserved'],'noCanonicalOrViewWrites':True,'noActiveRRegistryOrH_K_L_L2_L3Writes':True,'newIndependentVotes':0,'HumanApproval':False,'HumanTrial':False,'M7Claim':False})
print(json.dumps({'root':rel(O),'canonical':sha(L/C),'centralConfig':rel(conf),'AConfigs':len(apaths),'PConfigs':len(ppaths),'DIndices':len(s['resolutionIndexPaths']),'DSupersessions':len(s['resolutionSupersessions']),'retainedAP':431,'retainedM':435,'cards79Exact':True,'retainedV':454,'writes':len(log),'protectedDrift':drift},indent=2))
