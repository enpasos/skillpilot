# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from collections import Counter,defaultdict
import hashlib,json,subprocess,os
ROOT=Path('/home/enpasos/projects/skillpilot');os.chdir(ROOT)
BASE='9b798d6ef6e715c148e93cae82f6ce7c3f7ec3a4'
OUT=Path('/dev/shm/skillpilot-visualization54-auxclosure-20261107');OUT.mkdir(exist_ok=True)
sha=lambda raw:hashlib.sha256(raw).hexdigest()
env={k:v for k,v in os.environ.items() if k not in ['GIT_DIR','GIT_WORK_TREE','GIT_COMMON_DIR','GIT_INDEX_FILE','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES']};env.update(GIT_NO_REPLACE_OBJECTS='1',GIT_GRAFT_FILE=os.devnull)
def gitbytes(commit,path):return subprocess.check_output(['git','--no-replace-objects','show',commit+':'+path],env=env)
def pin(path):
 b=gitbytes(BASE,path);return {'path':path,'gitCommit':BASE,'sha256':sha(b),'bytes':len(b)}
CP='app/scripts/goalVisualizationReviewedContext.ts';HP='app/scripts/lib/goalVisualizationEconomicsQ3Contexts.ts';SC='contracts/goal-visualization-context/v1/qualification.schema.json'
code=[pin(x) for x in [CP,HP,'app/scripts/lib/authenticatedGitEvidence.ts',SC]]
assert code[0]['sha256']=='45fce11f7708b61bdb4b0f80a08fea0a9d1a018d98b4d24b79ae10fe578c8393'
assert code[1]['sha256']=='57494ea57cf8218d56fba7473e98291e9aea621c4e2b7172986829d01ace4ed4'
censuspaths=['qa-artifacts/ci-contract-audit/2026-11-06/visualization-context-first-two-families/family-census.json','qa-artifacts/ci-contract-audit/2026-11-07/visualization-economics-q3-two-family-reader/family-census.json']
censuses=[json.loads(gitbytes(BASE,p)) for p in censuspaths];assert [len(x['candidateReceipts']) for x in censuses]==[18,36]
selected=[];artifacts={};mirrorByPath=defaultdict(set);roles=Counter();currentInputs={};contexts=[]
currentSourcePaths={'mathematik':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json','wirtschaftswissenschaften':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'}
sourceCaptures={s:Path(p).read_bytes() for s,p in currentSourcePaths.items()};sourceJson={s:json.loads(b) for s,b in sourceCaptures.items()}
for subject,path in currentSourcePaths.items():currentInputs[path]={'role':'CURRENT_GOAL_SOURCE','readBy':'caller: current source object; kernel receives its extracted current context','path':path,'sha256':sha(sourceCaptures[subject]),'bytes':len(sourceCaptures[subject]),'sourceBytesEqualBaseCommit':sourceCaptures[subject]==gitbytes(BASE,path)}
jsonOriginals={}
def add(row,role,binding,currentcopy=True,anchor=''):
 b={k:binding[k] for k in ['path','gitCommit','sha256']};b['sha256']=b['sha256'].removeprefix('sha256:');key=tuple(b[k] for k in ['gitCommit','path','sha256'])
 if key not in artifacts:
  raw=gitbytes(b['gitCommit'],b['path']);assert sha(raw)==b['sha256'],b
  blob=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
  artifacts[key]={**b,'bytes':len(raw),'computedGitBlobOid':blob,'requireCurrentCopy':False,'usedBy':[]}
  if b['path'].endswith('.json'):jsonOriginals[key]=json.loads(raw)
 if currentcopy:
  actual=Path(b['path']).read_bytes();assert sha(actual)==b['sha256'],('physical-original-drift',b)
  artifacts[key]['requireCurrentCopy']=True;mirrorByPath[b['path']].add(b['sha256'])
 event={'role':role,**b,'requireCurrentCopy':currentcopy,'codeAnchor':anchor};row['historicalReads'].append(event);roles[role]+=1
 artifacts[key]['usedBy'].append({'goalId':row['goalId'],'reviewProfile':row['reviewProfile'],'role':role})
 return jsonOriginals.get(key)
for ci,census in enumerate(censuses):
 for e in census['candidateReceipts']:
  raw=gitbytes(BASE,e['path']);assert sha(raw)==e['sha256'];assert Path(e['path']).read_bytes()==raw
  q=json.loads(raw);p=q['reviewProfile'];goal=q['context']['goalId'];row={'goalId':goal,'landscapeId':q['context']['landscapeId'],'reviewProfile':p,'qualificationReceipt':{'path':e['path'],'gitCommit':BASE,'sha256':e['sha256'],'bytes':len(raw)},'historicalReads':[]}
  original=None
  for name in ['originalReview','originalInput','ownerSource','reviewedAsset']:
   r=add(row,name,q[name],name!='ownerSource',CP+':151')
   if name=='originalReview':original=r
  assert original and original['goalId']==goal
  if p=='matrix-candidate-v1':pass
  elif p=='economics-native-v1':pass
  elif p=='diagram-current-b-v1':raise AssertionError('B intentionally excluded from 54')
  elif p=='economics-q3-embedded-v1':
   commit='42095f427223545968e452d494e4f982c196c7e2';assert q['originalReview']['gitCommit']==commit
   base='curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-q3-twenty-three-image-author-20261008-v1/'
   corrected=original.get('correctedCandidateVersion')=='correction-v2';reviewdir=base+'independent-review/'+goal+'/'+('correction-v2/' if corrected else '')
   assert len(original['derivatives'])==2
   for width in [360,680]:
    v=next(v for v in original['derivatives'] if v['width']==width);path=reviewdir+goal+'.width-'+str(width)+'.png';assert v['path']==path
    add(row,'inspection-'+str(width),{'path':path,'gitCommit':commit,'sha256':v['sha256']},True,HP+':68')
   if corrected:
    path=base+'independent-review/'+goal+'/independent-image-review.receipt.json';assert path==original['preservedOriginalIndependentReceiptPath']
    old=add(row,'prior-REJECT-review',{'path':path,'gitCommit':commit,'sha256':original['preservedOriginalReceiptSha256']},True,HP+':78');assert old['decision']=='REJECT'
  elif p=='economics-q3-trade-finance-v1':
   commit='6fe35a6b0fa807e5a97475b34f3715dc16a89c00';assert q['originalReview']['gitCommit']==commit
   base='curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-q3-trade-finance-sixteen-independent-image-review-20261008-v1/';assets='curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-q3-trade-finance-sixteen-image-author-20261008-v1/';inputs='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q3-trade-finance-sixteen-bilingual-positive-author-v1/'
   corrected=q['originalReview']['path']==base+goal+'/correction-v2/independent-corrected-image-review.receipt.json';suffix='correction-v2/' if corrected else '';reviewdir=base+goal+'/'+suffix
   mp=assets+goal+'/correction-v2/fresh-native-preparation/metadata.json' if corrected else inputs+'native-image-preparation/'+goal+'/metadata.json';assert mp==original['nativeMetadataPath']
   add(row,'native-goal-metadata',{'path':mp,'gitCommit':commit,'sha256':original['nativeMetadataSha256']},True,HP+':114')
   wp=inputs+'whole-goals.candidate.json';assert wp==original['wholeGoalCandidatePath'];add(row,'whole-goal-candidate-array',{'path':wp,'gitCommit':commit,'sha256':original['wholeGoalCandidateSha256']},True,HP+':114')
   assert len(original['inspections'])==3
   for kind,width in [('native-corrected' if corrected else 'native-original',None),('uncropped-inspection-360',360),('uncropped-inspection-680',680)]:
    v=next(v for v in original['inspections'] if v['kind']==kind);path=assets+goal+'/'+suffix+goal+'.png' if width is None else reviewdir+'inspection-'+str(width)+'.png';assert path==v['path']
    add(row,'inspection-native' if width is None else 'inspection-'+str(width),{'path':path,'gitCommit':commit,'sha256':v['sha256']},True,HP+':123')
   if corrected:
    path=base+goal+'/independent-original-image-review.receipt.json';assert path==original['priorIndependentReceiptPath'];old=add(row,'prior-REJECT-review',{'path':path,'gitCommit':commit,'sha256':original['priorIndependentReceiptSha256']},True,HP+':136');assert old['decision']=='REJECT'
  else:raise AssertionError(p)
  subject=q['context']['subject'];src=sourceJson[subject];assert src['landscapeId']==q['context']['landscapeId'];goals=[g for g in src['goals'] if g['id']==goal];assert len(goals)==1;g=goals[0];links=[v for v in g['resourceLinks'] if v.get('type')=='goal-visualization' and v.get('role','primary')=='primary'];assert len(links)==1
  url=links[0]['url'];assert url.startswith('/assets/goal-visualizations/');paths=[('CURRENT_PUBLIC_IMAGE','app/public'+url),('CURRENT_CANONICAL_IMAGE','curricula/DE/Gymnasium/visualizations/'+url.removeprefix('/assets/goal-visualizations/'))]
  row['currentInputs']=[currentSourcePaths[subject]]
  for role,path in paths:
   raw=Path(path).read_bytes();assert sha(raw)==q['context']['assetSha256'].removeprefix('sha256:');currentInputs[path]={'role':role,'readBy':'kernel currentBytes after original-context validation','path':path,'sha256':sha(raw),'bytes':len(raw)};row['currentInputs'].append(path)
  row['currentContext']={'landscapeId':src['landscapeId'],'goalId':goal,'subject':subject,'title':g['title'],'description':g['description'],'titleEn':g.get('titleEn'),'descriptionEn':g.get('descriptionEn'),'demandLevel':g.get('dimensionTags',{}).get('demandLevel'),'imageUrl':url,'assetSha256':q['context']['assetSha256']};selected.append(row)
assert len(selected)==54 and len({(r['landscapeId'],r['goalId']) for r in selected})==54
for subject,path in currentSourcePaths.items():assert Path(path).read_bytes()==sourceCaptures[subject]
for x in currentInputs.values():assert sha(Path(x['path']).read_bytes())==x['sha256']
unique=list(artifacts.values());bysha={v['sha256']:v['bytes'] for v in unique};mirrors=[v for v in unique if v['requireCurrentCopy']];conflicts={p:sorted(hs) for p,hs in mirrorByPath.items() if len(hs)>1};assert not conflicts
profiles=Counter(r['reviewProfile'] for r in selected)
result={'schemaVersion':1,'kind':'independent-finite-original-artifact-closure-inventory','codeAndCandidateCommit':BASE,'codePins':code,'selectedCensuses':[pin(p) for p in censuspaths],'acceptedHistoricalCommitAnchors':sorted(set(c['acceptedRepositoryCommit'] for c in censuses)),'supportedReaderProfiles':json.loads(gitbytes(BASE,SC))['properties']['reviewProfile']['enum'],'actualProfileCounts':dict(profiles),'excluded':['diagram-current-b-v1: no receipt in this fixed54','new 2026-11-07 matrix correction: not among selected54','all other 945-family census rows','free recursive JSON reference discovery'],'summary':{'candidateReceipts':54,'historicalRoleReadCalls':sum(roles.values()),'historicalCallsByRole':dict(roles),'uniqueHistoricalCommitPathHashArtifacts':len(unique),'uniqueHistoricalPathCount':len({v['path'] for v in unique}),'uniqueHistoricalContentSha256Count':len(bysha),'bytesPerUniqueHistoricalArtifact':sum(v['bytes'] for v in unique),'bytesPerUniqueHistoricalContent':sum(bysha.values()),'historicalPhysicalMirrorArtifacts':len(mirrors),'historicalPhysicalMirrorBytes':sum(v['bytes'] for v in mirrors),'historicalOwnerSourceGitOnlyArtifacts':len([v for v in unique if not v['requireCurrentCopy']]),'historicalPhysicalPathHashConflicts':conflicts,'currentInputs':len(currentInputs),'currentInputsByRole':dict(Counter(v['role'] for v in currentInputs.values())),'currentInputBytes':sum(v['bytes'] for v in currentInputs.values()),'localQualificationReceiptBytes':sum(r['qualificationReceipt']['bytes'] for r in selected)},'receipts':selected,'uniqueHistoricalArtifacts':sorted(unique,key=lambda v:(v['gitCommit'],v['path'],v['sha256'])),'currentInputs':sorted(currentInputs.values(),key=lambda v:(v['role'],v['path'])),'readRules':{'commonHistorical':['originalReview','originalInput','ownerSource (Git-only; no local historical-source mirror required)','reviewedAsset'],'matrix-candidate-v1':'No auxiliary artifact() call beyond common four.','economics-native-v1':'No auxiliary artifact() call beyond common four; originalInput is the actual native metadata. Linked generation/derivative/prompt paths are not recursively read.','diagram-current-b-v1':'Implemented but zero selected receipts; its candidateRow read contributes zero here.','economics-q3-embedded-v1':'Exactly two bound derivative image reads; correction-v2 additionally reads exactly the bound prior REJECT JSON. No recursive read of that prior receipt\'s image/derivatives.','economics-q3-trade-finance-v1':'Exactly native metadata, whole-goal array, native plus360/680 inspection image reads; corrected additionally prior REJECT JSON. Native image duplicates a common reviewedAsset read.','qualificationReceipts':'54 local reference+SHA inputs, distinct from historical original artifacts; selected here from the frozen9b candidate tree. An accepted index remains a separate external authority.','technicalSchema':'The factory reads its code-local closed schema; it is a software input, not a historical goal source.','currentSource':'The kernel receives current context from its caller. The current canonical source captured here is the actual native-test caller source; never populate it from historical ownerSource.','currentAssets':'Actual public and canonical image copies remain current-context inputs, even when their bytes equal historical reviewedAsset.'},'uncollectedLinkedArtifacts':['generation records and prompts','pre-generation summaries unless an explicit fixed read above selects them','derivatives mentioned by economics-native-v1 but not read by its code','original REJECT images and derivatives behind a prior-REJECT-review JSON','external URLs and other free-form locators'],'proofBoundary':'This inventories and hashes the exact declared file reads, including duplicates and physical-mirror requirements. It does not claim complete Git commit/tree/blob transport closure, capsule authentication, new image review, native V acceptance or M7. Git object/path authentication remains the native authenticated reader and capsule verifier responsibility.','runtimeComparison':'pending Runtime closure file'}
p=OUT/'closure.json';p.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'output':str(p),'sha256':sha(p.read_bytes()),'summary':result['summary']},indent=2))
