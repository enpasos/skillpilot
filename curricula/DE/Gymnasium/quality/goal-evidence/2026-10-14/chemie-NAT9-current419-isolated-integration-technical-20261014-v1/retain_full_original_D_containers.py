# SPDX-License-Identifier: Apache-2.0
"""Retain original full29/23 actual runs; no current-page claim or new votes."""
from pathlib import Path
import json,hashlib,shutil,os,datetime,subprocess,concurrent.futures
R=Path('/home/enpasos/projects/skillpilot');B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14');O=B/'chemie-NAT9-current419-isolated-integration-technical-20261014-v1';E=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12');H=R/'tmp/chemie-resume-20261014/NAT9-host';v2=E/'chemie-q2-naturstoffe-current402-author-20261012-v2';v3=E/'chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3/later-stage-source6';a2=E/'chemie-q2-naturstoffe-current407-fresh-independent-a-20261012-v2';b2=E/'chemie-q2-naturstoffe-current407-independent-b-20261012-v2';a3=E/'chemie-q2-current407-remediation24-fresh-independent-a-20261012-v3';b3=E/'chemie-q2-current407-remediation24-fresh-independent-b-20261012-v3'
def read(p):return json.loads((R/p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256((R/p).read_bytes()).hexdigest()
def dump(p,j):p=R/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
def stable(j):return json.dumps(j,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def cp(src,dst):
 src=R/src;dst=R/dst
 if not dst.exists():shutil.copytree(src,dst,symlinks=True)
specs=[('D15-v2-batch1',v2/'native/batch-1',v2/'native/full407.actual.config.json',v2/'native/full407.actual.book-model.json',a2/'native/batch-1/round-a',b2/'D29-batch-1-round-b'),('D14-v2-batch2',v2/'native/batch-2',v2/'native/full407.actual.config.json',v2/'native/full407.actual.book-model.json',a2/'native/batch-2/round-a',b2/'D29-batch-2-round-b'),('D12-v3-batch1',v3/'native/targeted-batch-1',v3/'native/full407.current.actual.config.json',v3/'native/full407.current.actual.book-model.json',a3/'batch-1',b3/'native-batch-1')]
prepared=[]
for name,src,base,full,ar,br in specs:
 dst=O/'history'/name;cp(src,dst)
 for side,rr in [('a',ar),('b',br)]:
  rr=R/rr;out=R/dst/f'round-{side}'
  for f in rr.rglob('*'):
   if f.is_file():
    t=out/f.relative_to(rr);t.parent.mkdir(exist_ok=True,parents=True)
    if t.exists(): assert t.read_bytes()==f.read_bytes(),('actual review input differs',t,f)
    else:shutil.copy2(f,t)
 model=read(dst/'bundle/book-model.json');bundle=read(dst/'bundle/manifest.json');inp=read(dst/'round-a/description-review-input.json');ca=read(dst/'round-a/description-review-campaign.json');cb=read(dst/'round-b/description-review-campaign.json');ids=[p['goalId'] for p in model['pages']]
 cfg={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json','schemaVersion':1,'batchId':'chemie-NAT9-full-original-'+name.lower()+'-historical-retention-20261014-v1','subject':'chemie','subjectLabel':'Chemie','bookId':model['book']['id'],'title':'Complete original native history '+name+'; no current D grant','baseGoalBookConfigPath':str(base),'goalIds':ids,'outputDirectory':str(dst),'feedbackBaseUrl':bundle['feedbackBaseUrl'],'promptPath':str(dst/'bundle/prompt.md'),'criteriaPath':str(dst/'bundle/criteria.md'),'printDerivativeProfile':'bounded-atlas'};cf=O/'config'/(name+'.whole-original.historical-only.batch.config.json');dump(cf,cfg)
 def rnd(side,c):return {'directory':'round-'+side,'campaignId':c['campaignId'],'campaignDigest':'sha256:'+hashlib.sha256(stable(c).encode()).hexdigest(),'roundId':c['roundId'],'independenceGroupId':c['independenceGroupId'],'batchId':c['batches'][0]['batchId'],'batchInputFingerprint':c['batches'][0]['batchInputFingerprint']}
 manifest={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-manifest.schema.json','schemaVersion':1,'validationContract':'goal-description-rollout-batch-v1','batchId':cfg['batchId'],'subject':'chemie','subjectLabel':'Chemie','configPath':str(cf),'configDigest':sha(cf),'goalIds':ids,'curriculumAtomicDenominatorAtPreparation':407,'source':{'baseGoalBookConfigPath':str(base),'landscapePath':model['source']['landscapePath'],'landscapeId':model['book']['landscapeId'],'baseBookDigest':read(full)['digest']},'artifacts':{'bundleDirectory':'bundle','bookModelPath':'bundle/book-model.json','bookModelDigest':model['digest'],'bundleManifestPath':'bundle/manifest.json','bundleFingerprint':bundle['bundleFingerprint'],'reviewInputFingerprint':inp['reviewInputFingerprint'],'rounds':{'first':rnd('a',ca),'second':rnd('b',cb)}},'reviewPolicy':{'oneBatchPerRound':True,'blindIndependentFirstPass':True,'aiRecordsAreCandidatesOnly':True,'automaticAcceptance':False}};dump(dst/'batch-manifest.json',manifest)
 aa=[json.loads(x) for x in next((R/dst/'round-a/results').glob('*.records.jsonl')).read_text().splitlines()];bb=[json.loads(x) for x in next((R/dst/'round-b/results').glob('*.records.jsonl')).read_text().splitlines()];am={x['goalId']:x for x in aa};bm={x['goalId']:x for x in bb};assert set(am)==set(bm)==set(ids)
 deferred=[i for i in ids if am[i]['decision']!='keep' or bm[i]['decision']!='keep']
 auth={'schemaVersion':1,'manifestId':cfg['batchId']+'-technical-original-synthesis','synthesizedBy':'Codex technical integrator of complete sealed original A/B history; no new scientific vote','decisions':[{'goalId':i,'resolutionDecision':'keep_current','evidenceRound':'first','rationaleDe':'Beide tatsächlichen ursprünglichen Beschreibungsurteile sind KEEP im unveränderten ganzen damaligen Input. Alte gegebenenfalls revise-P-Profilbefunde bleiben im Vollstream erhalten und werden durch diese historische D-Bindung nicht freigegeben. Kein aktueller419-Seitenclaim, keine neue Fachstimme, keine Quellen-/Humanfreigabe.','rationaleEn':'Both actual original description decisions are KEEP in the unchanged complete historical input. Any original revise-profile findings remain in the full stream and are not approved by this historical D binding. No current419 page claim, new scientific vote, source or human approval.'} for i in ids if i not in deferred],'deferredGoals':[{'goalId':i,'rationaleDe':'Tatsächlicher ursprünglicher BLOCK oder revise-Beschreibungsbefund bleibt unresolved erhalten. Keine erfundene KEEP-Entscheidung.','rationaleEn':'Preserve actual original BLOCK or revise description finding as unresolved. No invented KEEP decision.'} for i in deferred]};dump(dst/'synthesis-authoring.whole-original.no-new-science.json',auth)
 prepared.append({'name':name,'config':str(cf),'directory':str(dst),'wholeCount':len(ids),'deferredActualDecisionGoalIds':deferred,'originalPRecommendationReviseGoalIds':[i for i in ids if am[i]['evidenceProfileRecommendation']!='none' or bm[i]['evidenceProfileRecommendation']!='none']})
dump(O/'checks/D.original-full-three-new-and-one-existing-containers.prepared.actual.json',{'technicalOnly':True,'newScienceVotes':0,'pairs':prepared,'fourthOriginalD11AlreadyNormalRetained':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-f7-475-original-D11-D15-whole-container-current-selection-retention-technical-20261014-v1/D11','originalRecordStreamsSliced':False,'currentDClaim':False})
for stage in ['summary','synthesis','resolutions','finalize']:
 def run(row):
  name=row['name'];cfg=row['config'];d=row['directory'];argv=['node',str(R/'app/node_modules/tsx/dist/cli.mjs')]
  if stage=='summary':argv+=['app/scripts/materializeGoalDescriptionRolloutBatch.ts','summarize','--config',cfg,'--write']
  elif stage=='synthesis':argv+=['app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts','--config',cfg,'--authoring',d+'/synthesis-authoring.whole-original.no-new-science.json','--write']
  elif stage=='resolutions':argv+=['app/scripts/materializeGoalDescriptionRolloutResolutions.ts','--config',cfg,'--synthesis-manifest',d+'/synthesis-decisions.json','--write']
  else:argv+=['app/scripts/materializeGoalDescriptionRolloutBatch.ts','finalize','--config',cfg,'--write']
  start=datetime.datetime.now(datetime.timezone.utc).isoformat();res=subprocess.run(argv,cwd=H,capture_output=True,text=True);stem='HISTORY.'+name+'.'+stage
  for k in ['stdout','stderr']:(R/O/'receipts'/(stem+'.'+k+'.actual.txt')).write_text(getattr(res,k))
  dump(O/'receipts'/(stem+'.completed-run.actual.json'),{'argv':argv,'cwd':str(H),'startedAtUTC':start,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':res.returncode,'stdout':res.stdout,'stderr':res.stderr});return name,res.returncode,res.stdout[-900:],res.stderr[-1600:]
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:results=list(pool.map(run,prepared))
 print(stage,results,flush=True)
 assert all(x[1]==0 for x in results),(stage,results)
print('ALL HISTORICAL THREE NORMAL CONTAINERS PASS; FOURTH D11 REUSED')
