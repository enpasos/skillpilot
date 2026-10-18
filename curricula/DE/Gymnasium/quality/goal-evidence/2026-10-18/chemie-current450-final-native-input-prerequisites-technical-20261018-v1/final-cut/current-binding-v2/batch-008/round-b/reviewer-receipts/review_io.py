import json,hashlib,sys,subprocess
from pathlib import Path
from datetime import datetime,timezone
BASE=Path('/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-final-native-input-prerequisites-technical-20261018-v1/final-cut/current-binding-v2')
def now():return datetime.now(timezone.utc).isoformat()
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def pp(n):return BASE/f'batch-{n:03d}'/'round-b'
def start(n):
 p=pp(n);check=json.loads((BASE/f'prepare.batch{n}-check.execution.json').read_text());assert check['exitCode']==0
 rr=p/'reviewer-receipts';rr.mkdir(exist_ok=True)
 s=rr/'start.json'
 if not s.exists():s.write_text(json.dumps({'startedAt':now(),'reviewerTask':'blind_b_008_014','providerExposure':'OpenAI via Codex developer identity','exposedModelLabel':'GPT-6 / Codex','backendModelId':'not exposed','generationSettings':'not exposed','peerOutputsRead':False},ensure_ascii=False,indent=2)+'\n')
 print('PREPARE EXIT',check['exitCode'],'START',json.loads(s.read_text())['startedAt'])
def view(n,lo,hi):
 p=pp(n);rs=[json.loads(x) for x in next((p/'batches').glob('*.input.jsonl')).read_text().splitlines()]
 # Current bilingual input is fully parsed and checked against batch serialization.
 inp=json.loads((p/'description-review-input.json').read_text());assert len(inp['goals'])==len(rs)
 for i,r in enumerate(rs):
  if not lo<=i+1<=hi:continue
  g=r['goal'];c=g['canonicalContext'];rc=g['reviewContext'];page=rc['page']
  print('\n',i+1,g['goalId'],g['currentTitleDe'],'/',g['currentTitleEn']);print('DE:',g['currentDescriptionDe']);print('EN:',g['currentDescriptionEn']);print('CONTEXT',json.dumps(c,ensure_ascii=False,separators=(',',':')))
  print('PAGE',json.dumps({k:v for k,v in page.items() if k not in ['visualization','evidenceReview','description','goalFingerprint','pageFingerprint','title','shortKey']},ensure_ascii=False,separators=(',',':')))
  ep=rc.get('evidenceProfile')
  if not ep: print('P: NONE');continue
  prof=ep['profile']; print('P dissent',ep.get('dissent',[]));print('P requirements',prof.get('coverageExpectations'));print('P archetype',prof.get('archetype'))
  for e in prof.get('expectations',[]): print('P expectation',e.get('id'),e.get('essentialUnderstandingDe'),'=>',e.get('observablePerformanceDe'))
  for c in prof.get('applicationCaseBriefs',[]):print('P CASE',c.get('id'),'TASK:',c.get('taskDemandDe'),'EXPECTED:',c.get('expectedPerformanceDe'),'FOCUS:',c.get('understandingFocusDe'))
  print('P variation',json.dumps(prof.get('variationAxes'),ensure_ascii=False,separators=(',',':')))
def finish(n):
 p=pp(n);rr=p/'reviewer-receipts';campaign=json.loads((p/'description-review-campaign.json').read_text());batch=campaign['batches'][0];rs=[json.loads(x) for x in next((p/'batches').glob('*.input.jsonl')).read_text().splitlines()];manual=json.loads((rr/'authored.json').read_text());assert len(manual)==len(rs)
 runid=campaign['roundId']+'.codex-subject-review'; records=[]
 for i,(src,a) in enumerate(zip(rs,manual)):
  g=src['goal'];e=a['e'];assert len(e)==6
  rec={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':runid+'.record-'+str(i+1).zfill(3),'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':src['bundleFingerprint'],'bookDigest':src['bookDigest']}
  rec.update({k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']})
  rec.update({'decision':a['d'],'understandingEvidence':dict(zip(['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn'],e)),'rationale':a['r'],'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':a['p'],'recordStatus':'candidate','reviewAuthority':'ai_candidate'})
  if a['d']=='revise':rec.update({'proposedDescriptionDe':a['de'],'proposedDescriptionEn':a['en']})
  records.append(rec)
 out=p/'results';out.mkdir(exist_ok=True);rf=out/(batch['batchId']+'.records.jsonl');rf.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records));bundle=json.loads((p/'review-bundle-manifest.json').read_text());art=[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts'] if a['role'] in ['review_prompt','review_criteria','review_input_json']];art.append({'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']})
 params={'providerExposure':'OpenAI via Codex developer identity','modelExposure':'GPT-6 / Codex developer identity; exact backend model identifier not exposed','generationParameters':'not exposed','reviewerTask':'blind_b_008_014','blindToOtherRuns':True}
 (rr/'model-and-parameter-exposure.json').write_text(json.dumps(params,ensure_ascii=False,indent=2)+'\n');run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI via Codex (developer identity)','model':'GPT-6 / Codex (developer label; exact backend ID not exposed)','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-review-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':sha((rr/'model-and-parameter-exposure.json').read_bytes()),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':art,'startedAt':json.loads((rr/'start.json').read_text())['startedAt'],'completedAt':now(),'status':'completed','outputDigest':sha(rf.read_bytes()),'toolchainVersion':'codex-native-review-v1'}
 runfile=out/(batch['batchId']+'.run.json');runfile.write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n')
 cmd=['/home/enpasos/.nvm/versions/node/v20.20.2/bin/node','--import','/home/enpasos/projects/skillpilot/app/node_modules/tsx/dist/loader.mjs','scripts/validateGoalDescriptionReviewCampaignResults.ts','--bundle',str(p/'review-bundle-manifest.json'),'--input',str(p/'description-review-input.json'),'--campaign',str(p/'description-review-campaign.json'),'--batches-dir',str(p/'batches'),'--results-dir',str(out)]
 began=now();res=subprocess.run(cmd,cwd='/home/enpasos/projects/skillpilot/app',capture_output=True,text=True);receipt={'argv':cmd,'cwd':'/home/enpasos/projects/skillpilot/app','startedAt':began,'completedAt':now(),'exitCode':res.returncode,'stdout':res.stdout,'stderr':res.stderr};(rr/'validation.execution.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(res.stdout,res.stderr);assert res.returncode==0
 seal={'schemaVersion':1,'sealedAt':now(),'reviewerTask':'blind_b_008_014','campaignId':campaign['campaignId'],'peerOutputsReadBeforeSeal':False,'records':{'path':str(rf.relative_to(BASE)),'digest':sha(rf.read_bytes())},'run':{'path':str(runfile.relative_to(BASE)),'digest':sha(runfile.read_bytes())},'validationReceiptDigest':sha((rr/'validation.execution.json').read_bytes()),'decisionCounts':{d:sum(x['decision']==d for x in records) for d in ['keep','revise','split_review','block']},'limitations':['No image inspection','No effective-view or original-source coverage claim','Candidate AI evidence only','Exact backend ID and generation settings not exposed']};sf=rr/'first-seal.json';assert not sf.exists();sf.write_text(json.dumps(seal,ensure_ascii=False,indent=2)+'\n');print('SEALED',sf,sha(sf.read_bytes()),json.dumps(seal['decisionCounts']))
if __name__=='__main__':
 op=sys.argv[1];n=int(sys.argv[2]);assert 8<=n<=14
 if op=='start':start(n)
 elif op=='view':view(n,int(sys.argv[3]),int(sys.argv[4]))
 elif op=='finish':finish(n)
