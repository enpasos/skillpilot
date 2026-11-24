from pathlib import Path
import json,hashlib,shutil,sys
root=Path('/home/enpasos/projects/skillpilot-e1-nachweise');name=sys.argv[1];tag=sys.argv[2]
base=root/'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-11-24'/name
h=lambda b:'sha256:'+hashlib.sha256(b).hexdigest()
jwrite=lambda p,v:p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
for letter in ['a','b']:
 p=Path('/tmp/e1-t5')/(tag+'-'+letter);out=base/'actual-execution'/('round-'+letter)
 if out.exists():raise Exception('Immutable archived round exists: '+str(out))
 events=[json.loads(l) for l in (p/'events.jsonl').read_text().splitlines()]
 thread=next(e['thread_id'] for e in events if e['type']=='thread.started')
 if events[-1]['type']!='turn.completed' or (p/'exit-code.txt').read_text().strip()!='0':raise Exception('Not completed')
 sessions=list(Path('/home/enpasos/.codex/sessions').rglob('*'+thread+'*.jsonl'))
 if len(sessions)!=1:raise Exception('Session count '+str(len(sessions)))
 session=sessions[0];rows=[json.loads(l) for l in session.read_text().splitlines()];turns=[r for r in rows if r.get('type')=='turn_context'];turn=turns[0]['payload']
 if any(t['payload']['model']!=turn['model'] or t['payload'].get('effort')!=turn.get('effort') for t in turns):raise Exception('Changed identity')
 response=json.load(open(p/'response.json'));campaign=json.load(open(p/'description-review-campaign.json'));batch=campaign['batches'][0];assigned=batch['goalIds']
 if sorted(r['goalId'] for r in response['descriptionReviews'])!=sorted(assigned):raise Exception('Wrong D set')
 if sorted(r['goalId'] for r in response['profileReviews'])!=sorted(assigned):raise Exception('Wrong P set')
 shutil.copytree(p,out)
 files=[f for f in p.iterdir() if f.is_file() and f.name not in ['response.json','events.jsonl','stderr.log','exit-code.txt']]
 operational={f.name:h(f.read_bytes()) for f in sorted(files)}
 runid=campaign['campaignId']+'-'+thread
 generation={'model':turn['model'],'reasoningEffort':turn.get('effort'),'sandbox':turn.get('sandbox_policy'),'approvalPolicy':turn.get('approval_policy'),'actualOperationalInputFiles':operational,'metadataJoin':'The raw scientific D decision bodies are joined mechanically to frozen native batch metadata after the actual run. Raw P decisions and limitations stay in response.json. No decision body is rewritten.'}
 actual={'schemaVersion':1,'contract':'actual-blind-native-description-and-profile-cli-v1','threadId':thread,'provider':'OpenAI','model':turn['model'],'reasoningEffort':turn.get('effort'),'cwd':turn.get('cwd'),'sandbox':turn.get('sandbox_policy'),'approvalPolicy':turn.get('approval_policy'),'startedAt':rows[0]['timestamp'],'completedAt':rows[-1]['timestamp'],'exitCode':0,'blindToOtherRuns':True,'cliVersion':'0.171.0-alpha.13.2','inputArtifacts':operational,'responseSha256':h((p/'response.json').read_bytes()),'eventsSha256':h((p/'events.jsonl').read_bytes()),'sessionSource':str(session),'sessionRawSha256':h(session.read_bytes()),'turnContext':turn,'metadataJoin':generation['metadataJoin'],'limits':response['limitations']}
 jwrite(out/'execution.actual.json',actual)
 inputs={r['goal']['goalId']:r['goal'] for r in [json.loads(l) for l in (p/'batch.input.jsonl').read_text().splitlines()]}
 records=[]
 for d in response['descriptionReviews']:
  goal=inputs[d['goalId']]
  rec={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':runid+'-'+d['goalId'],'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'goalId':d['goalId'],'goalFingerprint':goal['goalFingerprint'],'pageFingerprint':goal['pageFingerprint'],**{k:goal[k] for k in ['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},**{k:v for k,v in d.items() if k!='goalId' and v is not None},'recordStatus':'candidate','reviewAuthority':'ai_candidate'}
  records.append(rec)
 result=base/('round-'+letter)/'results';result.mkdir(exist_ok=True)
 recordbytes=('\n'.join(json.dumps(r,ensure_ascii=False,separators=(',',':')) for r in records)+'\n').encode();(result/(batch['batchId']+'.records.jsonl')).write_bytes(recordbytes)
 artifacts=[('book_pdf','book.pdf'),('book_model','book-model.json'),('review_prompt','prompt.md'),('review_criteria','criteria.md'),('description_review_batch_input_jsonl','batch.input.jsonl')]
 manifest={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI','model':turn['model'],'role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':h(json.dumps(generation,sort_keys=True,separators=(',',':')).encode()),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':assigned,'inputArtifacts':[{'role':role,'digest':h((p/f).read_bytes())} for role,f in artifacts],'startedAt':actual['startedAt'],'completedAt':actual['completedAt'],'status':'completed','outputDigest':h(recordbytes),'toolchainVersion':'codex-cli-0.171.0-alpha.13.2-native-metadata-join-v1'}
 jwrite(result/(batch['batchId']+'.run.json'),manifest);jwrite(out/'generation-parameters.actual.json',generation)
 print(letter,thread,turn['model'],turn.get('effort'),'D',[r['decision'] for r in response['descriptionReviews']],'P',[r['decision'] for r in response['profileReviews']])
