from pathlib import Path
import json,hashlib,sys
root=Path('/home/enpasos/projects/skillpilot-e1-nachweise');name=sys.argv[1];profileconfig=sys.argv[2]
base=root/'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-11-24'/name
indexpath=str((base/'resolution-index.json').relative_to(root));idx=json.load(open(root/indexpath));ids=[r['goalId'] for r in idx['resolutions']]
if not ids or any(not r['strictDescriptionComplete'] for r in idx['resolutions']):raise Exception('Not fully resolved')
pconf=json.load(open(root/profileconfig))
pids=pconf['scope']['goalIds']
if not set(pids)<=set(ids):raise Exception('P set outside exact reviewed D set')
# Require actual independent exact-body approvals of every final profile. Native AIs stay candidates.
for letter in ['a','b']:
 actual=json.load(open(base/'actual-execution'/('round-'+letter)/'execution.actual.json'));resp=json.load(open(base/'actual-execution'/('round-'+letter)/'response.json'))
 if actual['exitCode']!=0 or not actual['blindToOtherRuns']:raise Exception('No genuine successful blind run')
 approvals={r['goalId']:r['decision'] for r in resp['profileReviews']}
 if any(approvals.get(i)!='keep' for i in pids):raise Exception('Unresolved exact-body P review')
 if letter=='a':first=actual
 else:
  if actual['threadId']==first['threadId'] or actual['model']==first['model']:raise Exception('Expected actual distinct threads/models')
path=root/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';before=path.read_bytes();conf=json.loads(before);sub=next(s for s in conf['subjects'] if s['subject']=='physik')
if indexpath in sub['resolutionIndexPaths'] or profileconfig in sub['positiveEvidenceConfigPaths']:raise Exception('Already active')
oldowners={}
for i in ids:
 owners={p for p in sub['resolutionIndexPaths'] if any(r.get('goalId')==i for r in json.load(open(root/p)).get('resolutions',[]))}
 superseded={e['supersededIndexPath'] for e in sub.get('resolutionSupersessions',[]) if e['goalId']==i}
 current=owners-superseded
 if len(current)>1:raise Exception('Multiple current D owners '+i+str(current))
 if current:oldowners[i]=next(iter(current))
expectedPriorP={i for cp in sub['positiveEvidenceConfigPaths'] for i in json.load(open(root/cp))['scope']['goalIds'] if i in pids}

for i in ids:
 if i in oldowners:
  owner=oldowners[i]
  if owner not in sub['resolutionIndexPaths']:raise Exception('Prior owner not active')
  sub['resolutionSupersessions'].append({'goalId':i,'supersededIndexPath':owner,'replacementIndexPath':indexpath})
sub['resolutionIndexPaths'].append(indexpath)
retained=root/profileconfig;retained=retained.parent/'retained-prior-active';retained.mkdir(exist_ok=False)
newpaths=[];slices=[];seen=set()
h=lambda b:'sha256:'+hashlib.sha256(b).hexdigest()
for n,old in enumerate(sub['positiveEvidenceConfigPaths']):
 pc=json.load(open(root/old));remove=set(pc['scope']['goalIds'])&set(pids)
 if not remove:newpaths.append(old);continue
 seen|=remove;original=(root/pc['reviewPath']).read_bytes();lines=original.decode().splitlines(True);keep=[l for l in lines if json.loads(l)['goalId'] not in remove];remaining=[i for i in pc['scope']['goalIds'] if i not in remove]
 if sorted(json.loads(l)['goalId'] for l in keep)!=sorted(remaining):raise Exception('Retained exact records do not match scope')
 decision={'priorConfigPath':old,'priorConfigSha256':h((root/old).read_bytes()),'priorReviewPath':pc['reviewPath'],'priorReviewSha256':h(original),'excludedGoalIds':sorted(remove),'retainedGoalIds':remaining}
 if remaining:
  review=retained/f'{n:03}-retained.review.jsonl';review.write_text(''.join(keep));pc['reviewPath']=str(review.relative_to(root));pc['scope']['goalIds']=remaining;pc['scope']['label']=pc['scope'].get('label','')+'; exact retained slice after independent current E.1 activation';cp=retained/f'{n:03}-retained.config.json';cp.write_text(json.dumps(pc,ensure_ascii=False,indent=2)+'\n');newpaths.append(str(cp.relative_to(root)));decision['replacementConfigPath']=str(cp.relative_to(root));decision['retainedReviewSha256']=h(review.read_bytes())
 slices.append(decision)
if seen!=expectedPriorP:raise Exception('Unexpected old P owners '+str(seen))
sub['positiveEvidenceConfigPaths']=newpaths+[profileconfig]
after=(json.dumps(conf,ensure_ascii=False,indent=2)+'\n').encode();path.write_bytes(after)
receipt={'schemaVersion':1,'contract':'actual-independent-current-e1-D-P-activation-v1','descriptionGoalIds':ids,'positiveEvidenceGoalIds':pids,'positiveEvidenceStillOpenGoalIds':sorted(set(ids)-set(pids)),'resolutionIndexPath':indexpath,'resolutionIndexSha256':h((root/indexpath).read_bytes()),'positiveEvidenceConfigPath':profileconfig,'positiveEvidenceConfigSha256':h((root/profileconfig).read_bytes()),'positiveEvidenceReviewSha256':h((root/pconf['reviewPath']).read_bytes()),'priorRolloutConfigSha256':h(before),'currentRolloutConfigSha256':h(after),'retainedPriorProfileSlices':slices,'actualIndependentExecutionPaths':[str((base/'actual-execution'/('round-'+x)/'execution.actual.json').relative_to(root)) for x in ['a','b']],'canonicalEdits':0,'learnerCutEdits':0,'authority':'AI candidates plus informed independent integration; no human approval or learner mastery claimed.'}
(base/'activation.receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print('Activated',len(ids),'D goals and',len(pids),'dual-kept P profiles; retained',len(slices),'prior active P slices')
