from pathlib import Path
from datetime import datetime, timezone
import json, hashlib
R=Path.cwd()
O=Path(__file__).resolve().parents[1]
P=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy-four-final-contexts-native-preparation-technical-20261015-v1'
def read(p): return json.loads(p.read_text())
def digest(p): return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,x):
    assert not p.exists(), p
    p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
    read(p)
first=read(O/'FIRST.SCIENCE.json');fs=read(O/'FIRST.SCIENCE.seal.json')
assert digest(O/'FIRST.SCIENCE.json')==fs['first']['sha256']
started=datetime.now(timezone.utc).isoformat()
a=P/'native-four/round-a';campaign=read(a/'description-review-campaign.json');bundle=read(a/'review-bundle-manifest.json');inp=read(a/'description-review-input.json');batch=campaign['batches'][0]
assert len(campaign['batches'])==1
assert campaign['reviewPass']=='first_pass' and campaign['blindToOtherReviews']
assert [x['goalId'] for x in first['reviews']]==batch['goalIds']==[x['goalId'] for x in inp['goals']]
runid='chemie-energy-four-final-native-fresh-independent-a-20261015-v1'
rows=[]
for i,(science,goal) in enumerate(zip(first['reviews'],inp['goals']),1):
    rows.append({'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':runid+'.'+str(i),'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':bundle['bundleFingerprint'],'bookDigest':bundle['bookModelDigest'],**{k:goal[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},'decision':science['decision'],'understandingEvidence':science['understandingEvidence'],'rationale':science['reasonDe']+' '+science['sourceBoundary'],'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':science['evidenceProfileRecommendedAction'],'recordStatus':'candidate','reviewAuthority':'ai_candidate'})
records=O/'results'/(batch['batchId']+'.records.jsonl');assert not records.exists();records.write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n' for x in rows));assert [json.loads(l) for l in records.read_text().splitlines()]==rows
params={'reviewerAgent':first['reviewerAgent'],'provider':'OpenAI','declaredModel':'GPT-6 (Codex; exact runtime model identifier not exposed)','modelSelection':'inherited; no model override','samplingParameters':'not exposed by agent runtime','scientificFirstSHA256':digest(O/'FIRST.SCIENCE.json'),'inputSelectorSHA256':digest(P/'NEUTRAL.BLIND4.current-four-native-inputs.json'),'scope':'four current whole goals, blind independent first-pass A; D only','reviewReadingStartTime':'not captured; do not infer an invented earlier timestamp','manifestTimeMeaning':'startedAt/completedAt bound the normal record serialization pass after the pre-existing sealed independent scientific FIRST'}
write(O/'generation-parameters.json',params)
artifacts=[{'role':x['role'],'digest':x['digest']} for x in bundle['artifacts']]
artifacts.append({'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']})
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':bundle['bundleFingerprint'],'bookDigest':bundle['bookModelDigest'],'provider':params['provider'],'model':params['declaredModel'],'role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':digest(O/'generation-parameters.json'),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':artifacts,'startedAt':started,'completedAt':datetime.now(timezone.utc).isoformat(),'status':'completed','outputDigest':digest(records),'toolchainVersion':'goal-description-understanding-evidence-v2'}
runpath=O/'results'/(batch['batchId']+'.run.json');write(runpath,run)
selector={'role':'Finite original independent A D-only outputs; all scientific judgments are frozen in FIRST.SCIENCE.json','inputSelector':{'path':str((P/'NEUTRAL.BLIND4.current-four-native-inputs.json').relative_to(R)),'sha256':digest(P/'NEUTRAL.BLIND4.current-four-native-inputs.json')},'inputSeal':{'path':str((P/'FILES.BLIND4.current-four-inputs.seal.json').relative_to(R)),'sha256':digest(P/'FILES.BLIND4.current-four-inputs.seal.json')},'nativeCampaign':str((a/'description-review-campaign.json').relative_to(R)),'nativeInput':str((a/'description-review-input.json').relative_to(R)),'nativeBundle':str((a/'review-bundle-manifest.json').relative_to(R)),'nativeBatches':str((a/'batches').relative_to(R)),'originalFirst':fs['first'],'results':[{'path':str(x.relative_to(R)),'sha256':digest(x)} for x in [records,runpath]],'round':'a','decisions':[x['decision'] for x in rows],'sourceMappingApproval':False,'PAorMVApproval':False,'humanApproval':False,'humanTrial':False,'activeIntegration':False}
write(O/'SELECTOR.independent-a-final.json',selector)
print(json.dumps({'records':4,'recordsSHA256':digest(records),'runManifestSHA256':digest(runpath),'scientificFirstUnchanged':digest(O/'FIRST.SCIENCE.json')==fs['first']['sha256']},indent=2))
