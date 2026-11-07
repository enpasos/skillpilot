import sys,json,copy,hashlib,subprocess
from pathlib import Path
sys.dont_write_bytecode=True
ROOT=Path('/home/enpasos/projects/skillpilot');OUT=Path('/dev/shm/powi-first-bounded-minimality-review-20261107')
sys.path.insert(0,str(ROOT/'docs/dev/ci-graph-repairs'));import verify_german_minimality_review as g
H=lambda b:hashlib.sha256(b).hexdigest()
J=lambda x:(json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()
source='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_POLITIKWIRTSCHAFT.de.json';raw=(ROOT/source).read_bytes();doc=json.loads(raw);owner=doc['landscapeId'];intro='b76a024a-55a6-5c77-85cd-b37ef10e5197';base='a2bd27fa-8e31-59ff-ab34-66fac86c0bb5'
ids=['041b4a11-d7a3-5557-b5d0-2c365faccc5b','bf0f8cac-3fb9-5c50-ad93-bbb6e2241aee','022c620f-fdb3-5814-a9b7-f18614130793','b2d76b0d-cdb3-5f35-893f-896903d673db'];hold='f5fae603-b076-5ccb-8c76-c05fa91f78c3'
paths=sorted((ROOT/'curricula/DE/Gymnasium/canonical').glob('*.de.json'));docs=[json.loads(p.read_bytes()) for p in paths];pins=[{'path':str(p.relative_to(ROOT)),'sha256':H(p.read_bytes()),'landscapeId':d['landscapeId']} for p,d in zip(paths,docs)];c=g.Catalog(copy.deepcopy(docs));eff,_=c.effective();bg,bcy=g.closure(c.keys,eff);ba,bacy=g.closure(c.atom_keys,c.atomic(eff));gh=g.digest_relation(c.keys,bg,'goal');ah=g.digest_relation(c.atom_keys,ba,'atomic');states=[];ops=[]
for i,id in enumerate(ids):
 index=next(i for i,x in enumerate(doc['goals']) if x['id']==id);x=doc['goals'][index];assert len(x['requires'])==2 and intro in x['requires'] and not x.get('contains')
 ops.append({'caseId':f'POWI-J8-INTRO-{i+1:02}','op':'replace','file':source,'path':f'/goals/{index}/requires','guardGoalId':id,'guardGoalCanonicalSha256':H(g.stable(x)),'guardRequiresBefore':x['requires'],'value':[r for r in x['requires'] if r!=intro]})
 c.remove_origin(owner+':'+id,owner+':'+intro);e,o=c.effective();v,cy=g.closure(c.keys,e);a,acy=g.closure(c.atom_keys,c.atomic(e));assert v==bg and a==ba
 path=g.witness(e,owner+':'+id,owner+':'+intro);assert path
 states.append({'caseId':ops[-1]['caseId'],'goalClosureEqual':True,'atomicClosureEqual':True,'goalClosureSha256':g.digest_relation(c.keys,v,'goal'),'atomicClosureSha256':g.digest_relation(c.atom_keys,a,'atomic'),'witnessKeys':path,'origins':[{'fromKey':u,'toKey':v,'authoredOriginKey':o[u][v],'mode':'direct' if u==o[u][v] else'inherited'}for u,v in zip(path,path[1:])]})
e,o=c.effective();final=[]
for op in ops:
 path=g.witness(e,owner+':'+op['guardGoalId'],owner+':'+intro);assert path;final.append({'caseId':op['caseId'],'witnessKeys':path,'origins':[{'fromKey':u,'toKey':v,'authoredOriginKey':o[u][v],'mode':'direct' if u==o[u][v] else'inherited'}for u,v in zip(path,path[1:])]})
candidate=copy.deepcopy(doc)
for op in ops:candidate['goals'][int(op['path'].split('/')[2])]['requires']=op['value']
(OUT/'candidate.json').write_bytes(J(candidate))
# Complete endpoint and all incoming contains ancestor payloads, not selected-tree-only parents.
keys={owner+':'+x for x in ids+[hold,base,intro]};todo=list(keys)
while todo:
 key=todo.pop()
 for p in c.parents[key]:
  if p not in keys:keys.add(p);todo.append(p)
original=g.Catalog(copy.deepcopy(docs));contexts=[{'key':k,'goal':original.nodes[k][1],'parents':original.parents[k],'kind':'atomic' if not original.contains[k] else'cluster'}for k in sorted(keys)]
mp='curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_politics_and_society_source_extraction_to_canonical_politics_economics.review.json';m=json.loads((ROOT/mp).read_bytes());ep=m['sourceExtractionPath'];ex=json.loads((ROOT/ep).read_bytes());maps=[x for x in m['mappings']if x.get('canonicalGoalId')in ids+[hold,base]];sg=[x for x in ex['sourceGoals']if x['id']in{r['legacyGoalId']for r in maps}];pg=[x for x in ex['passages']if x['id']in{s['passageId']for s in sg}];dec=m['decisions'];dr=[x for x in dec if str(x.get('sourceGoalId',x.get('legacyGoalId',x.get('id',''))))in{r['legacyGoalId']for r in maps}]
# only exact cited source goal excerpts; full PuG8.4 passage is common context, PuG8.6.6 separate.
ctx={'source':{'path':source,'sha256':H(raw),'landscapeId':owner},'goalsAndAllAncestors':contexts,'mapping':{'path':mp,'sha256':H((ROOT/mp).read_bytes()),'status':m['status'],'rows':maps,'decisions':dr},'extraction':{'path':ep,'sha256':H((ROOT/ep).read_bytes()),'sourceDocument':ex['sourceDocument'],'goals':sg,'mainPassage':next(x for x in pg if x['topicCode']=='PuG8.4')},'officialCapture':{'path':ex['sourceDocument']['path'],'sha256':H((ROOT/ex['sourceDocument']['path']).read_bytes())}}
(OUT/'context.json').write_bytes(J(ctx));p={'status':'draft-not-applied-not-QA-approved','baseCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'source':ctx['source'],'catalogSources':pins,'operations':ops,'heldCase':{'caseId':'POWI-J8-INTRO-05','goalId':hold,'directPrerequisiteToRetain':intro,'questionedCarrier':'bf0f8cac-3fb9-5c50-ad93-bbb6e2241aee'},'candidateSourceSha256':H(J(candidate)),'formalProof':{'catalogs':len(docs),'goalKeys':len(c.keys),'atomicKeys':len(c.atom_keys),'baselineGoalClosureSha256':gh,'baselineAtomicClosureSha256':ah,'baselineGoalCyclicComponents':bcy,'baselineAtomicCyclicComponents':bacy,'steps':states,'finalWitnesses':final,'allGlobalDemandEqual':True,'focusRuntimeApprovalClaimed':False},'context':{'path':'context.json','sha256':H(J(ctx))}}
(OUT/'proposal.json').write_bytes(J(p));print(json.dumps({'operations':len(ops),'contexts':len(contexts),'mappedSourceGoals':len(sg),'goalKeys':len(c.keys),'atomicKeys':len(c.atom_keys),'cycles':[bcy,bacy],'candidate':p['candidateSourceSha256'],'proposalSha256':H(J(p))}))
