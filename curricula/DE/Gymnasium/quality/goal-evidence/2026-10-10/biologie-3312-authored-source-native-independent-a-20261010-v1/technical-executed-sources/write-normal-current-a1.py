import json, hashlib, shutil
from pathlib import Path
from datetime import datetime, timezone

BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
B=BASE/'biologie-3312-authored-operationalization-primary-source-author-successor-v3'
A=BASE/'biologie-3312-authored-source-native-independent-a-20261010-v1'
R=B/'native/current3312-source-only-one/round-a'
ID='3312b2bb-bc90-5c0f-a859-4b4f9b8ff117'
now=lambda:datetime.now(timezone.utc).isoformat()
def put(p,j):
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
def digest(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def binding(p):return {'path':str(p),'sha256':digest(p),'bytes':p.stat().st_size}
e=json.loads((B/'neutral-current3312-authored-source-and-native-one.independent-review.entry.json').read_text())
f=json.loads((A/'3312-current-source-native.independent-a.actual-FIRST.json').read_text())
assert digest(A/'3312-current-source-native.independent-a.actual-FIRST.json')=='sha256:56a036fe139a47eb0106bb5b25d3e05cdffd222ac72261653b27a1c3c42d7831'
assert digest(A/'3312-current-source-native.independent-a.pre-records.FIRST.seal.json')=='sha256:0d3f0622726c7190c5cc7ed0ee984d49a6e08caf733c3542cbfc08c4efeea79d'
history=[]
for x in e['onlyAfterOwnIndependentFIRST']['unchangedPriorIndependentRawDAnd3312AMHistory']:
 p=Path(x['path']);assert digest(p)==x['sha256'];assert p.stat().st_size==x['bytes']
 q=A/'history'/p.name;q.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,q)
 assert q.read_bytes()==p.read_bytes();history.append({'original':x,'ownExactCopy':binding(q),'purpose':'unchanged historical evidence; no new review and no relabelled decision'})
put(A/'checks/old-raw-A7-B7-A8-B3312-block-and-AM.exact-preservation.actual.json',{'schemaVersion':1,'checkedAt':now(),'history':history,'newReviewOfUnchangedSeven':False,'oldB3312SourceBlockRetrospectivelyChanged':False,'humanApproval':False})
c=json.loads((R/'description-review-campaign.json').read_text())
i=json.loads((R/'description-review-input.json').read_text())
b=json.loads((R/'review-bundle-manifest.json').read_text())
g=i['goals'][0];assert g['goalId']==ID and len(i['goals'])==1
runId='biologie3312-bounded-source-native-independent-a-20261010-v1-first'
record={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':runId+'-'+ID,'runId':runId,'campaignId':c['campaignId'],'roundId':c['roundId'],'bundleFingerprint':c['bundleFingerprint'],'bookDigest':c['bookDigest'],**{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},'decision':'keep','understandingEvidence':{
 'essentialUnderstandingDe':'Regulatoren vermitteln ein Eingangssignal an die Genaktivität. Ein gebildetes Genprodukt kann den Regulator hemmen; Wirkung, Abbau und Verzögerung bestimmen den zeitlichen Verlauf einer Rückkopplung.',
 'essentialUnderstandingEn':'Regulators connect an input signal to gene activity. A produced gene product can inhibit its regulator; effects, degradation and delay determine the time course of feedback.',
 'observablePerformanceDe':'Die lernende Person beschreibt die Schritte zwischen Signal, Regulator und Genprodukt, erklärt die negative Rückkopplung und deutet jeden Übergang eines vorgegebenen diskreten oder synchronen Modells. Sie unterscheidet aktuelle Produktion von vorhandenem Protein und begründet den verzögerten Verlauf.',
 'observablePerformanceEn':'The learner describes the steps connecting signal, regulator and gene product, explains negative feedback and interprets each transition of a supplied discrete or synchronous model. They distinguish current production from retained protein and justify the delayed time course.',
 'transferExpectationDe':'Die lernende Person sagt für eine frische Störung ohne Rückkopplung oder mit verzögert einsetzender Hemmung einen veränderten Verlauf voraus, begründet ihn am Wirkungsweg und nennt eine Grenze des Modells gegenüber realen biologischen Systemen.',
 'transferExpectationEn':'For a fresh perturbation without feedback or with delayed inhibition, the learner predicts a changed time course, explains it through the pathway and identifies a limitation of the model in relation to real biological systems.'},
 'rationale':'The own primary/source/native FIRST was sealed before historical raw outputs or separate author QA were inspected. The descriptive bilingual title and unchanged body identify one assessable mechanistic description competence. The entire current HTML and PDF page, image and prerequisites were actually inspected; the unchanged two complete synthetic model cases and genuinely changed transfers were checked and recalculated specifically for the changed source contribution. Provided recurrence/Boolean rules support mechanistic explanation and do not impose simulation authoring or coding. The independently fetched current official 49-page HE PDF supports only the bounded LK gene-control principle. Source8229 is explicitly an authored operationalization and its edge to3312 is partial; this is not a literal official simulation duty or complete coverage of developmental stages, organisms, Hox, telomeres or Q1.5. HE mandatory-course and other whole-source obligations remain open. The existing current P-v2 profile remains E1/G1/needs_human_review/ai_candidate; recommendation none does not certify learner work or human approval. The separate own sealed source judgment binds the primary/source bytes; the ordinary D input itself has no dedicated source-operator-scope field.',
 'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'}
out=A/'ordinary-A1/results';out.mkdir(parents=True,exist_ok=True)
batch=c['batches'][0];records=out/(batch['batchId']+'.records.jsonl')
records.write_text(json.dumps(record,ensure_ascii=False,separators=(',',':'))+'\n')
params={'schemaVersion':1,'provider':'OpenAI via Codex','model':'GPT-6-based Codex agent; exact deployed model/version not exposed','modelVersion':None,'temperature':None,'topP':None,'seed':None,'reasoningEffort':None,'unknownParametersAreNotInvented':True,'reviewerAgent':'/root/d_context_adoption','sourceAuthor':False,'bioTitleImageAuthor':False,'generationMechanism':'actual independent analysis and authored schema serialization in this agent turn','blindFirstAt':f['reviewedAt'],'readOrder':'whole current primary/material/native and own FIRST first; historical byte preservation and normal result serialization afterward; no current peer verdict read'}
put(A/'ordinary-A1/actual-parameters-and-independence.json',params)
roles=[{'role':x['role'],'digest':x['digest']} for x in b['artifacts']]
roles.append({'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']})
dl=json.loads((A/'primary/HE-current-official-whole.actual-download-receipt.json').read_text())
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runId,'campaignId':c['campaignId'],'roundId':c['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':c['bundleFingerprint'],'bookDigest':c['bookDigest'],'provider':'OpenAI via Codex','model':params['model'],'role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':c['promptFingerprint'],'criteriaFingerprint':c['criteriaFingerprint'],'generationParametersFingerprint':digest(A/'ordinary-A1/actual-parameters-and-independence.json'),'independenceGroupId':c['independenceGroupId'],'blindToOtherRuns':True,'goalIds':[ID],'inputArtifacts':roles,'startedAt':dl['startedAt'],'completedAt':now(),'status':'completed','outputDigest':digest(records),'toolchainVersion':'codex-native-review-node20.20.2-normal-contract-v1'}
put(out/(batch['batchId']+'.run.json'),run)
put(A/'ordinary-A1/source-primary-FIRST-and-normal-record.binding.json',{'schemaVersion':1,'normalRecord':binding(records),'normalRun':binding(out/(batch['batchId']+'.run.json')),'parameters':binding(A/'ordinary-A1/actual-parameters-and-independence.json'),'sourceJudgmentFIRST':binding(A/'3312-current-source-native.independent-a.actual-FIRST.json'),'sourceJudgmentSeal':binding(A/'3312-current-source-native.independent-a.pre-records.FIRST.seal.json'),'actualIndependentPrimary':binding(A/'primary/HE-current-official-whole.actual-independent-download.pdf'),'ordinaryDContractContainsDedicatedSourceOperatorScope':False,'boundedSourceJudgmentReadWithNormalRecord':True,'normalValidationIsNotScientificApproval':True,'strictGain':0,'humanApproval':False})
print(json.dumps({'record':str(records),'recordSHA':digest(records),'run':str(out/(batch['batchId']+'.run.json')),'preservedHistoryFiles':len(history),'FIRSTUnchanged':True},indent=2))
