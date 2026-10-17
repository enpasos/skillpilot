import json,pathlib,hashlib,datetime
O=pathlib.Path('/mnt/e/skillpilot-chemie-L7-20261017/chemie-current439-P13-fresh-independent-a2-v1');S=pathlib.Path('/mnt/e/skillpilot-chemie-L7-20261017/review-scientific-views-root-v1/SELECTOR.P13.scientific-view-for-independent-review.json');s=json.loads(S.read_text());rr=s['rounds'][0];seal=json.loads((O/'FIRST.sealed.selector.json').read_text())
def dig(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
for p in seal['files']:
 assert hashlib.sha256(pathlib.Path(p['path']).read_bytes()).hexdigest()==p['sha256']
for p in rr['inputPins']:
 assert hashlib.sha256(pathlib.Path(p['path']).read_bytes()).hexdigest()==p['sha256']
first=json.loads((O/'FIRST.free-independent.json').read_text());exp=json.loads((O/'FIRST.exposure.json').read_text());ev=json.loads((O/'native-own-evidence.json').read_text())
bundle=json.loads(pathlib.Path(rr['inputPins'][0]['path']).read_text());native_input=json.loads(pathlib.Path(rr['inputPins'][1]['path']).read_text());campaign=json.loads(pathlib.Path(rr['inputPins'][2]['path']).read_text());batch=campaign['batches'][0]
assert [r['goalId'] for r in first['records']]==batch['goalIds']==[r['goalId'] for r in native_input['goals']]
runid='chemie-current439-P13-fresh-independent-a2-20261017-v1';out=O/'native-round-a-results';out.mkdir(exist_ok=True)
rows=[]
for i,(f,g,e) in enumerate(zip(first['records'],native_input['goals'],ev)):
 assert f['goalFingerprint']==g['goalFingerprint'] and f['pageFingerprint']==g['pageFingerprint']
 rationale=' '.join([f['D']['reasonDe'],'Eigene Gegenprobe:',f['ownCounterprobesDe'],'Separate P-Empfehlung:',f['P']['reasonDe'],'Bildbefund:',f['visualization']['reasonDe'],'Keine menschliche Freigabe, keine echten Lernendenversuche. FIRST ist vor nativer Serialisierung versiegelt.'])
 assert len(rationale)<=4000
 row={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':runid+':'+g['goalId'],'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':bundle['bundleFingerprint'],'bookDigest':bundle['bookModelDigest']}
 for key in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:row[key]=g[key]
 row.update({'decision':f['D']['recommendation'],'understandingEvidence':e,'rationale':rationale,'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'});rows.append(row)
rb=('\n'.join(json.dumps(r,ensure_ascii=False,separators=(',',':')) for r in rows)+'\n').encode();recordpath=out/(batch['batchId']+'.records.jsonl');recordpath.write_bytes(rb)
params={'method':'interactive independent scientific review','samplingParameters':'not exposed by host','firstSelectorSha256':hashlib.sha256((O/'FIRST.sealed.selector.json').read_bytes()).hexdigest(),'nativeEvidenceIsOwnPostFirstSemanticSerialization':True};(O/'native-generation-parameters.json').write_text(json.dumps(params,ensure_ascii=False,indent=2)+'\n')
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':bundle['bundleFingerprint'],'bookDigest':bundle['bookModelDigest'],'provider':'OpenAI','model':'GPT-6 (Codex; exact checkpoint not exposed)','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-review-v2','promptFingerprint':bundle['promptFingerprint'],'criteriaFingerprint':bundle['criteriaFingerprint'],'generationParametersFingerprint':dig((O/'native-generation-parameters.json').read_bytes()),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':[{'role':p['role'],'digest':p['digest']} for p in bundle['artifacts'] if p['role'] in ['book_pdf','review_prompt','review_criteria']]+[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],'startedAt':exp['startedAtUTC'],'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'completed','outputDigest':dig(rb),'toolchainVersion':'goal-description-review-v1'}
runpath=out/(batch['batchId']+'.run.json');runpath.write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n')
for line in recordpath.read_text().splitlines():json.loads(line)
print(json.dumps({'recordCount':len(rows),'runPath':str(runpath),'recordsPath':str(recordpath),'recordsSha256':hashlib.sha256(rb).hexdigest(),'runSha256':hashlib.sha256(runpath.read_bytes()).hexdigest()},indent=2))
