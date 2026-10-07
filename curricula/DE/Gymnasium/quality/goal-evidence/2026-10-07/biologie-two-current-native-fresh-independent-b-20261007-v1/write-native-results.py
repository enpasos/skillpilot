from pathlib import Path
import json, shutil, hashlib, datetime, os
base=Path(__file__).resolve().parent
repo=Path.cwd()
author=base.parent/'biologie-three-source-485-ENG-EKG-and-e70-BW-author-20261007-v2'
round_source=author/'native-three/fresh-blind-round-b'
out=base/'native-round-b'
out.mkdir(exist_ok=True)
for file in ['description-review-campaign.json','description-review-input.json','review-bundle-manifest.json','prompt.md','criteria.md']:
 shutil.copy2(round_source/file,out/file)
shutil.copytree(round_source/'batches',out/'batches',dirs_exist_ok=True)
shutil.copytree(round_source/'contracts',out/'contracts',dirs_exist_ok=True)
campaign=json.loads((out/'description-review-campaign.json').read_text())
bundle=json.loads((out/'review-bundle-manifest.json').read_text())
input_data=json.loads((out/'description-review-input.json').read_text())
judgments=json.loads((base/'own.first-pass.judgments.json').read_text())
judge_by_id={r['goalId']:r for r in judgments['goals']}
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
sha=lambda b:'sha256:'+hashlib.sha256(b).hexdigest()
run_id='biology-three-current-fresh-b-description-20261007-v1'
records=[]
for i,g in enumerate(input_data['goals']):
 j=judge_by_id[g['goalId']]
 records.append({'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':f'biology-three-current-fresh-b-description-20261007-v1-{i+1:03d}','runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':bundle['bundleFingerprint'],'bookDigest':bundle['bookModelDigest'],**{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},'decision':j['descriptionDecision'],'understandingEvidence':{k:j[k] for k in ['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn']},'rationale':j['descriptionRationale'],'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'create','recordStatus':'candidate','reviewAuthority':'ai_candidate'})
results=out/'results';results.mkdir(exist_ok=True)
batch=campaign['batches'][0]
record_path=results/(batch['batchId']+'.records.jsonl')
record_path.write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in records))
common={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'bundleFingerprint':bundle['bundleFingerprint'],'bookDigest':bundle['bookModelDigest'],'provider':'OpenAI','model':'GPT-6 Codex; exact runtime version not exposed','role':'subject_reviewer','generationParametersFingerprint':sha(json.dumps({'model':'GPT-6 Codex','samplingParameters':'not exposed','independentAgent':'/root/bio_two_current_fresh_blind_b'},sort_keys=True).encode()),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'startedAt':judgments['startedAt'],'completedAt':now,'status':'completed','toolchainVersion':'native-unchanged-20261007'}
d_run={**common,'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':bundle['promptFingerprint'],'criteriaFingerprint':bundle['criteriaFingerprint'],'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts'] if a['role'] in ['review_prompt','review_criteria','book_pdf','review_input_json']]+[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],'outputDigest':sha(record_path.read_bytes())}
(results/(batch['batchId']+'.run.json')).write_text(json.dumps(d_run,indent=2)+'\n')
# Minimal isolated native P checker fixture: unchanged helpers, exact candidate and three asset bytes.
iso=base/'native-positive';(iso/'app/scripts').mkdir(parents=True,exist_ok=True)
for file in ['positiveGoalEvidenceReview.ts','positiveGoalEvidenceProfileModel.ts','goalEvidenceProfileModel.ts']:
 shutil.copy2(author/'native-isolated-repository/app/scripts'/file,iso/'app/scripts'/file)
for name,target in [('app/node_modules',repo/'app/node_modules'),('app/src',repo/'app/src'),('contracts',repo/'contracts')]:
 dest=iso/name
 if not dest.exists(): dest.symlink_to(os.path.relpath(target,dest.parent),target_is_directory=True)
(iso/'inputs').mkdir(exist_ok=True);(iso/'outputs').mkdir(exist_ok=True);(iso/'config').mkdir(exist_ok=True)
landscape_rel='inputs/current-candidate.exact.json';semantic_rel='inputs/semantic-kinds.exact.json';criteria_rel='inputs/biology-positive-criteria.exact.md'
shutil.copy2(author/'native-isolated-repository/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',iso/landscape_rel)
shutil.copy2(author/'native-isolated-repository/inputs/semantic-kinds.author.json',iso/semantic_rel)
shutil.copy2(repo/'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md',iso/criteria_rel)
for goal_id in batch['goalIds']:
 target=iso/'app/public/assets/goal-visualizations/biologie'/goal_id/(goal_id+'.png');target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(author/'selected-existing-images'/(goal_id+'.png'),target)
p_input=author/'native-isolated-repository/outputs/positive-three.author.ai-candidates.jsonl'
p_records=[json.loads(line) for line in p_input.read_text().splitlines() if line]
p_run_id='biology-three-current-fresh-b-positive-20261007-v1';p_review_id='biology-three-current-fresh-b-positive-20261007-v1'
for r in p_records:
 r.update({'reviewId':p_review_id,'reviewedAt':now,'reviewer':'/root/bio_two_current_fresh_blind_b; independent AI first pass','reason':judge_by_id[r['goalId']]['positiveEvidenceRationale'],'reviewRunIds':[p_run_id],'dissent':[]})
p_path=iso/'outputs/positive.records.jsonl';p_path.write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in p_records))
p_prompt=base/'positive-review.actual-task-prompt.txt'
p_prompt.write_text('Fresh independent reviewer B. Independently inspect the whole current DE/EN goals and source-bound D contexts, raw primary curriculum sources, full DE/EN P expectations, cases and answers, actual native PDF pages and actual goal PNGs full size and actual360/680. Evaluate semantic atomicity and Memory/card need. Seal own first-pass judgments and exact input/page/image bindings before peer outputs. Current assigned v2 goals:485ef1c3-8997-52b7-91f5-b1ddf179013d,11675f1a-5de2-5926-be78-1e8275f19f5b,e70d8a85-2dea-5165-919b-200fee9f4db4. No active registry/canonical/QA writes; no human approval/trial; no hash-only review.\n')
p_criteria_sha=sha((iso/criteria_rel).read_bytes());p_prompt_sha=sha(p_prompt.read_bytes())
p_run={**common,'runId':p_run_id,'promptFamilyId':'biology-positive-understanding-evidence-v2','promptFingerprint':p_prompt_sha,'criteriaFingerprint':p_criteria_sha,'inputArtifacts':[{'role':'review_prompt','digest':p_prompt_sha},{'role':'review_criteria','digest':p_criteria_sha},{'role':'book_pdf','digest':next(a['digest'] for a in bundle['artifacts'] if a['role']=='book_pdf')},{'role':'review_input_json','digest':sha((base/'reviewed-current-input.exact.json').read_bytes())}],'outputDigest':sha(p_path.read_bytes())}
(iso/'outputs/positive.run.json').write_text(json.dumps(p_run,indent=2)+'\n')
config={'$schema':'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json','schemaVersion':2,'reviewId':p_review_id,'goalFingerprintRuleVersion':'goal-evidence-v1','profileRuleVersion':'positive-understanding-evidence-v2','landscapeId':'08a43a1b-d97e-522c-9dfa-c950a493364e','landscapePath':landscape_rel,'semanticKindLedgerPath':semantic_rel,'reviewCriteriaPath':criteria_rel,'reviewPath':'outputs/positive.records.jsonl','reviewRunManifestPaths':['outputs/positive.run.json'],'reviewedResourceTypes':['goal-visualization'],'requireApproved':False,'scope':{'label':'Independent B sealed current v2 trio positive AI candidate check','goalIds':batch['goalIds']}}
(iso/'config/positive.config.json').write_text(json.dumps(config,indent=2)+'\n')
print(json.dumps({'nativeRound':str(out),'DRecords':len(records),'PRecords':len(p_records),'nativeHelpersChanged':False,'humanApproval':False}))
