import json,hashlib
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path('/home/enpasos/projects/skillpilot');BASE=Path(__file__).resolve().parent
AUTHOR=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-current-twenty-six-native-preparation-author-v1/seven-operative-native-preparation-v2'
def read(p):return json.loads(Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,v):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f:f.write(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def jsonl(p,rs):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f:
  for r in rs:f.write(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n')
def relative(p):return str(p.relative_to(ROOT))
verdict=read(BASE/'current-seven-whole-native.independent-b.first-verdict.immutable.json')
inp=read(AUTHOR/'native-seven/round-b/description-review-input.json');campaign=read(AUTHOR/'native-seven/round-b/description-review-campaign.json');bundle=read(AUTHOR/'native-seven/bundle/review-bundle-manifest.json')
completed=datetime.now(timezone.utc).isoformat();started=read(BASE/'neutral-current-seven-native.input.first.freeze.json')['frozenAt'];batch=campaign['batches'][0];runid=batch['batchId']+'.independent-b-native-review'
rs=[]
for g,v in zip(inp['goals'],verdict['judgments']):
 r={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':runid+':'+g['goalId'],'runId':runid,**{k:campaign[k] for k in ['campaignId','roundId','bundleFingerprint','bookDigest']},**{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},'decision':v['descriptionDecision'],'understandingEvidence':v['understandingEvidence'],'rationale':v['scientificRationaleEn']+' Actual full DE PDF and bilingual campaign input were independently read; whole source/course approval and learner performance remain separate. The campaign currently supplies evidenceProfile=null, hence create refers to its absent current approved profile; the bound operative P7 candidates are reviewed separately.','evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'create','recordStatus':'candidate','reviewAuthority':'ai_candidate'}
 rs.append(r)
recordpath=BASE/'normal-D7-results'/f"{batch['batchId']}.records.jsonl";jsonl(recordpath,rs)
common={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI Codex agent session','model':'Codex; exact provider model identifier not exposed','role':'subject_reviewer','generationParametersFingerprint':'sha256:'+hashlib.sha256(b'Codex independent reasoning; provider sampling parameters not exposed').hexdigest(),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'startedAt':started,'completedAt':completed,'status':'completed','toolchainVersion':'codex-independent-review-v1'}
drun={**common,'runId':runid,**{k:campaign[k] for k in ['campaignId','roundId','promptFingerprint','criteriaFingerprint']},'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'promptFamilyId':'goal-description-understanding-evidence-v2','inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts']]+[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],'outputDigest':sha(recordpath)}
write(BASE/'normal-D7-results'/f"{batch['batchId']}.run.json",drun)
cfg=read(AUTHOR/'P7.actual-current-raster.ordinary-author-candidate.config.json');profileid='chemie-b008-seven-current-native-v2-independent-b-whole-profile';prunid=profileid+'.whole-profile-review';prpath=BASE/'normal-P7/profiles.independent-b.jsonl';pconfigpath=BASE/'normal-P7/profiles.independent-b.config.json';prunpath=BASE/'normal-P7/profiles.independent-b.run.json'
prs=[json.loads(l) for l in (AUTHOR/'P7.actual-current-raster.ordinary-author-candidate.review.jsonl').read_text().splitlines() if l.strip()]
for r,v in zip(prs,verdict['judgments']):
 assert r['goalId']==v['goalId']
 r.update(reviewId=profileid,reviewedAt=completed,reviewer='Independent Codex B; own first whole7 semantic verdict and actual current Native7 reading',reason=v['scientificRationaleEn'],reviewRunIds=[prunid],dissent=['Whole Source19, SourceAtlas354/395 and all course/stage/target/prerequisiteOnly gates remain HOLD.','Eight protected177 substantive context deltas and ordinary Source/A/M integration remain separate; no actual learner, physical experiment, digital acquisition, human approval or trial is claimed.'])
jsonl(prpath,prs)
criteria=ROOT/cfg['reviewCriteriaPath'];criteriafp=sha(criteria)
prun={**common,'runId':prunid,'promptFamilyId':'chemistry-positive-understanding-evidence-profile-v1','promptFingerprint':criteriafp,'criteriaFingerprint':criteriafp,'inputArtifacts':[{'role':'book_model','digest':campaign['bookDigest']},{'role':'book_pdf','digest':sha(AUTHOR/'native-seven/bundle/book.pdf')},{'role':'book_html','digest':sha(AUTHOR/'native-seven/bundle/book.html')},{'role':'review_input_json','digest':sha(AUTHOR/'current-seven-fourteen-operative-cases-and-whole-profiles.neutral-input.json')},{'role':'review_prompt','digest':criteriafp},{'role':'review_criteria','digest':criteriafp}],'outputDigest':sha(prpath)}
write(prunpath,prun)
cfg.update(reviewId=profileid,reviewPath=relative(prpath),reviewRunManifestPaths=[relative(prunpath)])
cfg['scope']['label']='Exact independent B actual Native7 current whole profiles with ordinary raster bindings; candidate-only, separate source/course/context gates'
write(pconfigpath,cfg)
print(json.dumps({'normalDResultsDirectory':relative(recordpath.parent),'normalPConfig':relative(pconfigpath),'normalPRecords':relative(prpath),'normalPRun':relative(prunpath)},ensure_ascii=False))
