from pathlib import Path
import json,hashlib,datetime,shutil
started=datetime.datetime.now(datetime.timezone.utc).isoformat()
O=Path(__file__).parent
S=Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-remaining-mixed18-preparation-technical-c-v1/SELECTOR.clean-current-native18-reviewer-inputs.sealed.json')
selector=json.loads(S.read_text());N=Path(selector['nativeRoot']);A=N/'round-a'
FP=O/'FIRST.science.free-independent-round-a.sealed.json'
FH='7cf873ab7b79a6e3ce9c7a938e3bbface9ac15b556f300e5600f677b3aeec876'
assert hashlib.sha256(FP.read_bytes()).hexdigest()==FH
first=json.loads(FP.read_text())
assert first['nativeSerializationStarted'] is False
d=json.loads((A/'description-review-input.json').read_text());c=json.loads((A/'description-review-campaign.json').read_text());bundle=json.loads((A/'review-bundle-manifest.json').read_text());batch=c['batches'][0]
assert c['campaignId']=='chemie-current439-remaining-mixed-native18-technical-c-20261017-v1-a'
assert len(batch['goalIds'])==18
native=O/'native';native.mkdir(exist_ok=True)
for fn in ['description-review-input.json','description-review-campaign.json','review-bundle-manifest.json']:shutil.copyfile(A/fn,native/fn)
shutil.copyfile(A/'batches'/(batch['batchId']+'.input.jsonl'),native/'batch-001.input.jsonl')
runId='chemie-current439-mixed18-independent-a-20261017-v1';records=[]
for i,(g,f) in enumerate(zip(d['goals'],first['goals'])):
 assert g['goalId']==f['goalId'];assert g['currentDescriptionDe']==f['currentDescriptionDe'];assert g['currentDescriptionEn']==f['currentDescriptionEn']
 r={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':runId+'.'+f'{i+1:03}','runId':runId,'campaignId':c['campaignId'],'roundId':c['roundId'],'bundleFingerprint':d['bundleFingerprint'],'bookDigest':d['bookDigest'],**{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},'decision':f['scientificDecision'],'understandingEvidence':f['understanding'],'rationale':f['scientificRationale']+' Kontextgrenze: '+f['contextualBoundary'],'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':f['profileRecommendation'],'recordStatus':'candidate','reviewAuthority':'ai_candidate'}
 if r['decision']=='revise':r.update(proposedDescriptionDe=f['proposedCompleteDescriptionDe'],proposedDescriptionEn=f['proposedCompleteDescriptionEn'])
 records.append(r)
assert len(records)==18
rp=native/'description-records.jsonl';rp.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records))
params={'actualModel':first['actualModel'],'temperature':'not exposed','topP':'not exposed','samplingParametersKnown':False,'role':'independent scientific Mixed18 Round A reviewer','otherMixed18ReviewRunResultsRead':False,'freeFIRSTSealedBeforeSerialization':True,'freeFIRST':{'path':str(FP),'sha256':FH},'metadataExposureRecordJsonPointer':'/independence','serializer':'Direct projection of this agent own sealed free FIRST only; exact current goal/page/text bindings copied from frozen Round A input','timingBoundary':'Run timestamps identify actual native serialization; the free scientific phase was sealed earlier.','sourceScope':'Targeted originals and current full cases; no general official curriculum coverage approval.'}
pp=O/'generation-parameters.truthful.json';pp.write_text(json.dumps(params,ensure_ascii=False,indent=2)+'\n')
roles=['book_model','book_pdf','book_pdf_render_manifest','book_html','book_html_render_manifest','review_input_json','review_prompt','review_criteria']
arts=[{k:a[k] for k in ['role','digest']} for a in bundle['artifacts'] if a['role'] in roles]+[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}]
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runId,'campaignId':c['campaignId'],'roundId':c['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':d['bundleFingerprint'],'bookDigest':d['bookDigest'],'provider':'OpenAI','model':first['actualModel'],'role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':c['promptFingerprint'],'criteriaFingerprint':c['criteriaFingerprint'],'generationParametersFingerprint':'sha256:'+hashlib.sha256(pp.read_bytes()).hexdigest(),'independenceGroupId':c['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':arts,'startedAt':started,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'completed','outputDigest':'sha256:'+hashlib.sha256(rp.read_bytes()).hexdigest(),'toolchainVersion':'stock-goal-description-review-v3-preserve-symlinks'}
(native/'run-manifest.json').write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'records':len(records),'runId':runId,'outputDigest':run['outputDigest'],'firstSha256':FH},indent=2))
