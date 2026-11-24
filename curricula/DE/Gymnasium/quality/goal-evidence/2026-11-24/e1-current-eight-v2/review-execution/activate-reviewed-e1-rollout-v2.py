from pathlib import Path
import json,hashlib,sys
root=Path('/home/enpasos/projects/skillpilot-e1-nachweise');name=sys.argv[1];profileconfig=sys.argv[2]
base=root/'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-11-24'/name
indexpath=str((base/'resolution-index.json').relative_to(root));idx=json.load(open(root/indexpath));ids=[r['goalId'] for r in idx['resolutions']]
if not ids or any(not r['strictDescriptionComplete'] for r in idx['resolutions']):raise Exception('Not fully resolved')
pconf=json.load(open(root/profileconfig))
if set(pconf['scope']['goalIds'])!=set(ids):raise Exception('D/P goal-set mismatch')
# Require actual independent exact-body approvals of every final profile. Native AIs stay candidates.
for letter in ['a','b']:
 actual=json.load(open(base/'actual-execution'/('round-'+letter)/'execution.actual.json'));resp=json.load(open(base/'actual-execution'/('round-'+letter)/'response.json'))
 if actual['exitCode']!=0 or not actual['blindToOtherRuns']:raise Exception('No genuine successful blind run')
 approvals={r['goalId']:r['decision'] for r in resp['profileReviews']}
 if any(approvals.get(i)!='keep' for i in ids):raise Exception('Unresolved exact-body P review')
 if letter=='a':first=actual
 else:
  if actual['threadId']==first['threadId'] or actual['model']==first['model']:raise Exception('Expected actual distinct threads/models')
path=root/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';before=path.read_bytes();conf=json.loads(before);sub=next(s for s in conf['subjects'] if s['subject']=='physik')
if indexpath in sub['resolutionIndexPaths'] or profileconfig in sub['positiveEvidenceConfigPaths']:raise Exception('Already active')
oldowners={
 'fbecbd60-5db3-51e8-94be-d66b066ffa06':'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-14/b048-oblique-current-carryover-v1/resolution-index.json',
 'e4b38061-1f28-43ad-8371-a3e7c0e81856':'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-11-15/stage-plan-k3k6-current13-v1/resolution-index.json',
 'ce431132-dfc4-42c2-aff6-bd72035190f8':'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-11-15/stage-plan-k3k6-current13-v1/resolution-index.json',
 '09029573-864f-40ca-bf8a-cee7bf6dcb73':'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-10-17/existing-math-prerequisites-current-v1/resolution-index.json',
 'd6dc0e02-831d-4894-a61a-852bcc74f147':'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-10-17/existing-math-prerequisites-current-v1/resolution-index.json',
 '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2':'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-13/batch-052-d048-current-revised-five-v1/resolution-index.current-subset-v1.json'}
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
 pc=json.load(open(root/old));remove=set(pc['scope']['goalIds'])&set(ids)
 if not remove:newpaths.append(old);continue
 seen|=remove;original=(root/pc['reviewPath']).read_bytes();lines=original.decode().splitlines(True);keep=[l for l in lines if json.loads(l)['goalId'] not in remove];remaining=[i for i in pc['scope']['goalIds'] if i not in remove]
 if sorted(json.loads(l)['goalId'] for l in keep)!=sorted(remaining):raise Exception('Retained exact records do not match scope')
 decision={'priorConfigPath':old,'priorConfigSha256':h((root/old).read_bytes()),'priorReviewPath':pc['reviewPath'],'priorReviewSha256':h(original),'excludedGoalIds':sorted(remove),'retainedGoalIds':remaining}
 if remaining:
  review=retained/f'{n:03}-retained.review.jsonl';review.write_text(''.join(keep));pc['reviewPath']=str(review.relative_to(root));pc['scope']['goalIds']=remaining;pc['scope']['label']=pc['scope'].get('label','')+'; exact retained slice after independent current E.1 activation';cp=retained/f'{n:03}-retained.config.json';cp.write_text(json.dumps(pc,ensure_ascii=False,indent=2)+'\n');newpaths.append(str(cp.relative_to(root)));decision['replacementConfigPath']=str(cp.relative_to(root));decision['retainedReviewSha256']=h(review.read_bytes())
 slices.append(decision)
if seen!=set(ids)&set(oldowners):raise Exception('Unexpected old P owners '+str(seen))
sub['positiveEvidenceConfigPaths']=newpaths+[profileconfig]
after=(json.dumps(conf,ensure_ascii=False,indent=2)+'\n').encode();path.write_bytes(after)
receipt={'schemaVersion':1,'contract':'actual-independent-current-e1-D-P-activation-v1','goalIds':ids,'resolutionIndexPath':indexpath,'resolutionIndexSha256':h((root/indexpath).read_bytes()),'positiveEvidenceConfigPath':profileconfig,'positiveEvidenceConfigSha256':h((root/profileconfig).read_bytes()),'positiveEvidenceReviewSha256':h((root/pconf['reviewPath']).read_bytes()),'priorRolloutConfigSha256':h(before),'currentRolloutConfigSha256':h(after),'retainedPriorProfileSlices':slices,'actualIndependentExecutionPaths':[str((base/'actual-execution'/('round-'+x)/'execution.actual.json').relative_to(root)) for x in ['a','b']],'canonicalEdits':0,'learnerCutEdits':0,'authority':'AI candidates plus informed independent integration; no human approval or learner mastery claimed.'}
(base/'activation.receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print('Activated',len(ids),'D/P goals; retained',len(slices),'prior active P slices')
