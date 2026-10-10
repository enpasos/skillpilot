import pathlib,json,shutil,hashlib,datetime
N=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-biotechnologie-evolution-eight-current353-source-raster-native-technical-preparation-20261010-v1')
B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-bio8-current353-native11-genuine-independent-b-20261010-v1')
R=B/'normal-D11';R.mkdir();(R/'batches').mkdir();(R/'results').mkdir()
source=N/'native/eleven-current-native/round-b'
for p in ['description-review-campaign.json','description-review-input.json','review-bundle-manifest.json','prompt.md','criteria.md']:
 shutil.copyfile(source/p,R/p)
c=json.load(open(R/'description-review-campaign.json'));b=c['batches'][0]
shutil.copyfile(source/'batches'/f"{b['batchId']}.input.jsonl",R/'batches'/f"{b['batchId']}.input.jsonl")
first=json.load(open(B/'FIRST.current353-Bio8-native11.B.substantive.json'))
runId='biologie-bio8-native11-genuine-b-original-neutral-20261010-v1'
rows=[]
for i,g in enumerate(first['goals'],1):
 r={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':f'bio8-native11-independent-b-20261010-v1-{i:02}','runId':runId,'campaignId':c['campaignId'],'roundId':c['roundId'],'bundleFingerprint':c['bundleFingerprint'],'bookDigest':c['bookDigest'],'goalId':g['goalId'],'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],**g['currentText'],'decision':g['D'],'understandingEvidence':g['understandingEvidence'],'rationale':g['why'],'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'revise' if g['D']=='split_review' else 'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'}
 rows.append(r)
out=R/'results'/f"{b['batchId']}.records.jsonl"
with open(out,'x') as f:
 for r in rows:f.write(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n')
def sha(p):return 'sha256:'+hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
bundle=json.load(open(R/'review-bundle-manifest.json'))
art=[{'role':x['role'],'digest':x['digest']} for x in bundle['artifacts'] if x['role'] in ['book_model','book_pdf','book_html','review_input_json','review_prompt','review_criteria']]
art.append({'role':'description_review_batch_input_jsonl','digest':b['batchInputFingerprint']})
params={'execution':'genuinely independent subagent B original neutral pass','provider':'OpenAI','model':'GPT-6','modelIdentifierDetail':'Only GPT-6 agent identity is provided; no specific deployment revision or sampling parameters available.','source':'sealed FIRST before peer/root findings','noHumanApproval':True}
p=R/'observed-execution-parameters.json'
with open(p,'x') as f:json.dump(params,f,ensure_ascii=False,indent=2);f.write('\n')
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runId,'campaignId':c['campaignId'],'roundId':c['roundId'],'batchId':b['batchId'],'batchInputFingerprint':b['batchInputFingerprint'],'bundleFingerprint':c['bundleFingerprint'],'bookDigest':c['bookDigest'],'provider':'OpenAI','model':'GPT-6 (agent identity; exact deployment revision not exposed)','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':c['promptFingerprint'],'criteriaFingerprint':c['criteriaFingerprint'],'generationParametersFingerprint':sha(p),'independenceGroupId':c['independenceGroupId'],'blindToOtherRuns':True,'goalIds':b['goalIds'],'inputArtifacts':art,'startedAt':first['createdAt'],'completedAt':now,'status':'completed','outputDigest':sha(out),'toolchainVersion':'skillpilot-normal-D11-v1'}
with open(R/'results'/f"{b['batchId']}.run.json",'x') as f:json.dump(run,f,ensure_ascii=False,indent=2);f.write('\n')
print(json.dumps({'records':str(out),'sha256':sha(out),'recordsCount':len(rows),'decisions':{k:sum(x['decision']==k for x in rows) for k in ['keep','split_review','revise','block']}},indent=2))
