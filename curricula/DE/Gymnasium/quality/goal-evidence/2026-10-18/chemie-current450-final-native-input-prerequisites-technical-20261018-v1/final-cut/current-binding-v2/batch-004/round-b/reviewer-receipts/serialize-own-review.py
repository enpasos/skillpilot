import pathlib,json,hashlib,datetime
p=pathlib.Path(__file__).resolve().parent.parent
c=json.loads((p/'description-review-campaign.json').read_text());b=c['batches'][0]
lines=[json.loads(s) for s in (p/'batches'/f"{b['batchId']}.input.jsonl").read_text().splitlines() if s.strip()]
rows=json.loads((p/'reviewer-receipts/authored-decisions.json').read_text()); assert len(rows)==len(lines)==c['goalCount']
runid=c['roundId']+'.native-codex-b'
fields=['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn']
records=[]
for i,(line,row) in enumerate(zip(lines,rows),1):
 g=line['goal'];r={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':runid+'.goal-'+str(i).zfill(3),'runId':runid,'campaignId':c['campaignId'],'roundId':c['roundId'],'bundleFingerprint':line['bundleFingerprint'],'bookDigest':line['bookDigest']}
 for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:r[k]=g[k]
 r.update(decision=row[0],evidenceProfileRecommendation=row[1],rationale=row[2],understandingEvidence=dict(zip(fields,row[3:9])),evidenceProfileContract='positive-understanding-evidence-v2',recordStatus='candidate',reviewAuthority='ai_candidate')
 if row[0]=='revise':assert len(row)==11;r.update(proposedDescriptionDe=row[9],proposedDescriptionEn=row[10])
 else:assert len(row)==9
 records.append(r)
result=p/'results';result.mkdir(exist_ok=True)
f=result/f"{b['batchId']}.records.jsonl";f.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records))
h=lambda f:'sha256:'+hashlib.sha256(f.read_bytes()).hexdigest()
meta=json.loads((p/'reviewer-receipts/execution-metadata.json').read_text())
bundle=json.loads((p/'review-bundle-manifest.json').read_text())
print('artifact roles',[(x['role'],x.get('path')) for x in bundle['artifacts']])
arts=[{'role':x['role'],'digest':x['digest']} for x in bundle['artifacts'] if x['role'] in ['review_prompt','review_criteria','review_input_json','book_model','finding_schema','run_manifest_schema']]
arts.append({'role':'description_review_batch_input_jsonl','digest':b['batchInputFingerprint']})
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':c['campaignId'],'roundId':c['roundId'],'batchId':b['batchId'],'batchInputFingerprint':b['batchInputFingerprint'],'bundleFingerprint':c['bundleFingerprint'],'bookDigest':c['bookDigest'],'provider':meta['provider'],'model':meta['model'],'role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-review-v2','promptFingerprint':c['promptFingerprint'],'criteriaFingerprint':c['criteriaFingerprint'],'generationParametersFingerprint':h(p/'reviewer-receipts/generation-parameters-exposure.json'),'independenceGroupId':c['independenceGroupId'],'blindToOtherRuns':True,'goalIds':b['goalIds'],'inputArtifacts':arts,'startedAt':meta['trackedRunStartedAt'],'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'completed','outputDigest':h(f),'toolchainVersion':'native-codex-review-v1'}
(result/f"{b['batchId']}.run.json").write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n')
print('records',len(records),'decisions',{x:sum(r['decision']==x for r in records) for x in ['keep','revise','split_review','block']},'output',h(f))
