import json,hashlib,datetime,sys
from pathlib import Path
BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-normal-integration-20261017-v1')
OWN=BASE/'D-final-native/independent-a-final163'
def roundpath(n): return BASE/f'D-final-native/batch-{n:03d}/round-a'
def read(n,start=0,end=20):
 p=roundpath(n); a=json.loads((p/'description-review-input.json').read_text())
 for i,g in enumerate(a['goals'][start:end],start):
  c=g['canonicalContext']; rc=g['reviewContext']; page=rc['page']; ep=rc.get('evidenceProfile'); prof=ep.get('profile') if ep else None
  seen={}
  def dedup(x):
   if isinstance(x,str) and len(x)>80:
    if x in seen:return '@'+str(seen[x])
    original=x
    for earlier,index in sorted(seen.items(),key=lambda kv:-len(kv[0])):
     if len(earlier)>100:x=x.replace(earlier,'@'+str(index))
    seen[original]=len(seen)+1;return '['+str(seen[original])+']'+x
   if isinstance(x,dict):return {k:dedup(v) for k,v in x.items()}
   if isinstance(x,list):return [dedup(v) for v in x]
   return x
  print(json.dumps(dedup({'i':i,'id':g['goalId'],'de':[g['currentTitleDe'],g['currentDescriptionDe']],'en':[g['currentTitleEn'],g['currentDescriptionEn']],'canonicalContext':c,'relations':{k:page.get(k) for k in ['requires','reverseRequires','externalPrerequisites','externalReverseRequires']},'P':prof}),ensure_ascii=False))
def digest(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def save(n,rows):
 p=roundpath(n); campaign=json.loads((p/'description-review-campaign.json').read_text()); inp=json.loads((p/'description-review-input.json').read_text());batch=campaign['batches'][0]; bid=batch['batchId'];runid=f'codex-reviewer-a-final163-batch{n:03d}-20261018';results=p/'results';results.mkdir(exist_ok=True)
 records=[]
 for i,row in enumerate(rows):
  g=inp['goals'][i];d=dict(zip(['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn'],row[:6]));decision=row[7] if len(row)>7 else 'keep';rec={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':f'{runid}.{i+1:03d}','runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],**{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},'decision':decision,'understandingEvidence':d,'rationale':row[6],'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':row[8] if len(row)>8 else 'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'}
  if decision=='revise':rec.update(proposedDescriptionDe=row[9],proposedDescriptionEn=row[10])
  records.append(rec)
 assert len(records)==len(inp['goals'])
 rb=(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records)).encode();rp=results/f'{bid}.records.jsonl';rp.write_bytes(rb)
 now=datetime.datetime.now(datetime.timezone.utc).isoformat();started=(OWN/f'batch-{n:03d}.started.txt').read_text().strip()
 gen={'execution':'Codex independent reviewer A','model':'GPT-6; exact snapshot and sampling parameters not exposed','method':'manual content review of final stock batch; six fields authored per goal'}
 run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':bid,'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI','model':'GPT-6 (Codex)','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-review-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':digest(json.dumps(gen,sort_keys=True).encode()),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']},{'role':'review_prompt','digest':campaign['promptFingerprint']},{'role':'review_criteria','digest':campaign['criteriaFingerprint']}],'startedAt':started,'completedAt':now,'status':'completed','outputDigest':digest(rb),'toolchainVersion':'codex-native-review-final163-v1'}
 runp=results/f'{bid}.run.json';runp.write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n');(OWN/f'batch-{n:03d}.generation-parameters.json').write_text(json.dumps(gen,indent=2)+'\n')
 def pin(f):b=f.read_bytes();return {'path':str(f),'sha256':digest(b),'bytes':len(b)}
 receipt={'reviewerId':'codex-independent-reviewer-A-final163','reviewMode':'stock_blind_final_input_first_pass','finalInputActuallyRead':True,'peerResultsReadBeforeOwnSeal':False,'nativeRun':pin(runp),'nativeRecords':pin(rp),'sealedAt':now,'goalCount':len(records),'decisionCounts':{d:sum(r['decision']==d for r in records) for d in ['keep','revise','split_review','block']},'reviewAuthority':'ai_candidate','recordStatus':'candidate','limitations':'Machine-only candidate; no human approval, source mapping or learner acceptance claim.'}
 (OWN/f'batch-{n:03d}.receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(json.dumps(receipt,ensure_ascii=False))
def start(n):
 p=OWN/f'batch-{n:03d}.started.txt'
 if not p.exists():p.write_text(datetime.datetime.now(datetime.timezone.utc).isoformat()+'\n')
if __name__=='__main__':
 n=int(sys.argv[1]);start(n);read(n,int(sys.argv[2]) if len(sys.argv)>2 else 0,int(sys.argv[3]) if len(sys.argv)>3 else 20)
