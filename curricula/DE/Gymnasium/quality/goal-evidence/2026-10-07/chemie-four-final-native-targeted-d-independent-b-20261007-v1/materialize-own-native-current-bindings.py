from pathlib import Path
from datetime import datetime, timezone
import json, hashlib, shutil, os, copy
ROOT=Path(__file__).resolve().parents[7]
B=Path(__file__).resolve().parent
BASE=B.parent
A=BASE/'chemie-four-final-images-native-d17-plus-c441-p18-technical-author-20261007-v1'
N=A/'native-root'
O=BASE/'chemie-next17-targeted-independent-d-b-p-binding-20261007-v1'
NAME=B.name
j=lambda p:json.loads(p.read_text())
digest=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
bytes_digest=lambda data:'sha256:'+hashlib.sha256(data).hexdigest()
relative=lambda p:str(p.relative_to(ROOT))
def write_json(p,obj):
 p.parent.mkdir(parents=True,exist_ok=True)
 assert not p.exists(),str(p)
 p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def write_jsonl(p,rows):
 p.parent.mkdir(parents=True,exist_ok=True)
 assert not p.exists(),str(p)
 p.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n'for r in rows))
def copy_exact(source,dest):
 dest.parent.mkdir(parents=True,exist_ok=True)
 assert not dest.exists(),str(dest)
 shutil.copyfile(source,dest)
 assert digest(source)==digest(dest)
 return {'source':relative(source),'copy':relative(dest),'digest':digest(source),'bytes':source.stat().st_size}
first=j(B/'own-four-d-and-c441-p.first-pass.json')
seal=j(B/'first-pass.seal.json')
for row in seal['files']:
 p=ROOT/row['path'];assert hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256']
lineage=j(B/'fourteen-historical-routes.exact-reuse-lineage.actual.json')
assert lineage['ownFirstPassSealDigest']==digest(B/'first-pass.seal.json')
new={r['goalId']:r for r in first['newDDecisions']}
old_prefix='chemie-next17-targeted-description-routing-context-author-v2-20261007-first-pass-b.batch-001'
old_records={r['goalId']:r for r in map(json.loads,(O/f'native-d/results/{old_prefix}.records.jsonl').read_text().splitlines())}
old_inputs={r['goalId']:r for r in j(O/'native-d/input.json')['goals']}
now=datetime.now(timezone.utc).isoformat()
params={'model':'unspecified','modelVersion':'not exposed; not guessed','reviewer':'/root/bio_source_maturity_blind_b','newSubstantiveDGoalIds':list(new),'newSubstantivePGoalIds':['c441d9e8-d9d9-5e55-a189-a37345541321'],'historicalDReuseCount':14,'historicalDReusePolicy':'Exact whole current input and page fingerprint equality only. Existing sealed round-B decisions are retained with lineage; no fourteen-goal new review. No unchanged old whole-bundle claim.','priorRecordsReadOnlyAfterOwnFourFirstPassSeal':True,'currentRootOrPeerDVPJudgmentsRead':False,'otherSeventeenPScienceReviewed':False,'humanApproval':False,'humanTrial':False,'strictGain':0,'bindingAssemblyStartedAt':now}
write_json(B/'actual-generation-and-reuse-parameters.json',params)
routes=[]
for scope in ['seventeen','c441']:
 source=N/f'native-d-{scope}/round-b'
 inp=j(source/'description-review-input.json');campaign=j(source/'description-review-campaign.json');bundle=j(source/'review-bundle-manifest.json');batch=campaign['batches'][0]
 run_id=NAME+('.d17-b-new3-reuse14'if scope=='seventeen'else'.d-c441-b')
 records=[]
 for g in inp['goals']:
  gid=g['goalId']
  if gid in new:
   review=new[gid]
   assert (g['goalFingerprint'],g['pageFingerprint'])==(review['goalFingerprint'],review['pageFingerprint'])
   record={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'decision':review['decision'],'understandingEvidence':review['understandingEvidence'],'rationale':'Fresh independent targeted B review, sealed in own-four-d-and-c441-p.first-pass.json before any current peer judgment. '+review['rationale'],'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':review['evidenceProfileRecommendation'],'recordStatus':'candidate','reviewAuthority':'ai_candidate'}
   origin={'kind':'new-independent-substantive-review','seal':relative(B/'first-pass.seal.json'),'sealDigest':digest(B/'first-pass.seal.json'),'physicalPage':{'0bf26276-2780-506c-ac34-35dd44a29409':5,'a44af1fa-5988-5b7d-b206-691c6bbf7dd4':14,'9751b6d8-cde3-527b-b37c-babb6cee79d2':16,'c441d9e8-d9d9-5e55-a189-a37345541321':3}[gid]}
  else:
   assert scope=='seventeen'and g==old_inputs[gid]
   old=old_records[gid];record=copy.deepcopy(old)
   record['rationale']='Historical sealed B decision retained without new review: exact whole goal input and page fingerprint unchanged. Prior record '+old['recordId']+' in prior run '+old['runId']+'. No continued validity claimed for the old entire bundle. Historical rationale follows: '+old['rationale']
   origin={'kind':'historical-fourteen-route-reuse-no-new-review','priorRecordId':old['recordId'],'priorRunId':old['runId'],'priorRecordsPath':relative(O/f'native-d/results/{old_prefix}.records.jsonl'),'priorRecordsDigest':digest(O/f'native-d/results/{old_prefix}.records.jsonl'),'priorRunPath':relative(O/f'native-d/results/{old_prefix}.run.json'),'priorRunDigest':digest(O/f'native-d/results/{old_prefix}.run.json'),'wholeInputExact':True,'pageFingerprintExact':True,'understandingEvidenceRetainedUnchanged':True,'evidenceProfileRecommendationRetainedUnchanged':True,'oldPReferencesAreHistoricalOnly':True}
  record.update({'recordId':NAME+'.d-b.'+gid,'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest']})
  for key in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:record[key]=g[key]
  records.append(record);routes.append({'goalId':gid,'recordId':record['recordId'],'runId':run_id,'origin':origin})
 output=B/f'native-d-{scope}/results/{batch["batchId"]}.records.jsonl'
 write_jsonl(output,records)
 run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI','model':'unspecified','role':'sequencing_representation_reviewer','promptFamilyId':'goal-description-understanding-evidence-review-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':digest(B/'actual-generation-and-reuse-parameters.json'),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':[{'role':r['role'],'digest':r['digest']}for r in bundle['artifacts']]+[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],'startedAt':now,'completedAt':datetime.now(timezone.utc).isoformat(),'status':'completed','outputDigest':digest(output),'toolchainVersion':'codex-current-native-binding-20261007'}
 write_json(output.with_name(batch['batchId']+'.run.json'),run)
write_json(B/'native-d-current-record-origin.actual.json',{'schemaVersion':1,'scope':'4 new substantive D judgments plus 14 exact-input historical decisions; native binding assembly only after own first-pass seal','model':'unspecified','runTimeFieldsDescribeBindingAssembly':True,'currentD17BundleIsNew':True,'oldWholeD17BundleStillValidClaim':False,'ownFirstPassSealDigest':digest(B/'first-pass.seal.json'),'historicalFourteenLineageDigest':digest(B/'fourteen-historical-routes.exact-reuse-lineage.actual.json'),'routes':routes,'humanApproval':False,'humanTrial':False,'strictGain':0})
# Own inert P validation root: all validator/schema/source copies remain byte-exact.
P=B/'native-p-root'
copy_receipts=[]
for f in ['positiveGoalEvidenceReview.ts','positiveGoalEvidenceProfileModel.ts','goalEvidenceProfileModel.ts']:
 copy_receipts.append(copy_exact(ROOT/'app/scripts'/f,P/'app/scripts'/f))
for f in ['goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','goal-evidence/v2/goal-evidence-profile.schema.json','goal-evidence/v2/goal-evidence-review-config.schema.json']:
 copy_receipts.append(copy_exact(ROOT/'contracts'/f,P/'contracts'/f))
for f in ['canonical.final-image-candidate.json','semantic-kinds.final-image-candidate.json']:
 copy_receipts.append(copy_exact(N/'candidate'/f,P/'candidate'/f))
crit=Path('curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md')
copy_receipts.append(copy_exact(ROOT/crit,P/crit))
canonical=j(N/'candidate/canonical.final-image-candidate.json');gid='c441d9e8-d9d9-5e55-a189-a37345541321';goal=next(g for g in canonical['goals']if g['id']==gid)
asset=next(l for l in goal['resourceLinks']if l['type']=='goal-visualization')
asset_relative=Path('app/public')/asset['url'].lstrip('/')
copy_receipts.append(copy_exact(N/asset_relative,P/asset_relative))
(P/'app/node_modules').symlink_to(ROOT/'app/node_modules',target_is_directory=True)
record=copy.deepcopy(first['P_c441']['wholeProfile']);profile_fp=record['profileFingerprint'];review_input_fp=record['reviewInputFingerprint'];review_id=NAME+'.p-c441-current-image';run_id=NAME+'.p-c441-b'
record.update({'reviewId':review_id,'reviewedAt':datetime.now(timezone.utc).isoformat(),'reviewer':'Independent targeted Chemistry P reviewer B (/root/bio_source_maturity_blind_b); model unspecified','reason':'Fresh independent whole DE/EN c441 profile and two-case review with actual native physical PDF page 3, sealed before current peer judgments. '+first['P_c441']['rationale'],'reviewRunIds':[run_id],'dissent':[]})
assert record['profileFingerprint']==profile_fp and record['reviewInputFingerprint']==review_input_fp
write_jsonl(P/'review/c441.current-image.review.jsonl',[record])
current_input={'schemaVersion':1,'scope':'Only c441 whole DE/EN goal, actual current PNG/PDF and complete supplied profile with both full DE/EN cases; other seventeen profiles excluded','goal':goal,'resourceDigests':{asset['url']:digest(N/asset_relative)},'effectiveSemanticKind':'curricularAtomic','criteriaDigest':digest(ROOT/crit),'goalFingerprint':record['goalFingerprint'],'reviewInputFingerprint':review_input_fp,'profileFingerprint':profile_fp,'profile':record['profile'],'nativeC441PhysicalPDFPage':3,'nativeC441BookPDF':{'path':relative(N/'native-d-c441/bundle/book.pdf'),'digest':digest(N/'native-d-c441/bundle/book.pdf')},'firstPassSeal':{'path':relative(B/'first-pass.seal.json'),'digest':digest(B/'first-pass.seal.json')}}
write_json(P/'review/c441.full-current-review-input.json',current_input)
prompt=P/'review/c441.independent-p.prompt.md'
prompt.write_text('# Independent targeted c441 P review B\n\nRead the entire current German and English c441 goal, canonical/prerequisite/source context, all profile fields and both complete bilingual material cases. Inspect the actual new native PDF physical page 3 and its bound PNG. Independently test electron transfer, configurations, atoms and charge, common molar basis, all supplied numerical energy terms, meaningfully fresh Mg/O transfer, and thermodynamic versus kinetic/model limits. Retain a truthful AI candidate record on the exact current image-inclusive native input. Seal first-pass judgments before any current Root or peer D/P/V judgment. Do not re-review the other seventeen P profiles or grant human approval, learner mastery, whole-source approval, generation approval or strict gain.\n')
binding={'schemaVersion':1,'reviewId':review_id,'landscapeId':canonical['landscapeId'],'goalIds':[gid],'goalFingerprint':record['goalFingerprint'],'reviewInputFingerprint':review_input_fp,'profileFingerprint':profile_fp,'resourceDigests':current_input['resourceDigests'],'reviewInputDigest':digest(P/'review/c441.full-current-review-input.json'),'criteriaDigest':digest(ROOT/crit),'promptDigest':digest(prompt),'bookModelDigest':digest(N/'native-d-c441/bundle/book-model.json'),'bookPDFDigest':digest(N/'native-d-c441/bundle/book.pdf'),'model':'unspecified','firstPassSealDigest':digest(B/'first-pass.seal.json'),'humanApproval':False,'humanTrial':False,'strictGain':0}
write_json(P/'review/c441.current-image.binding-bundle.json',binding)
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':run_id,'bundleFingerprint':digest(P/'review/c441.current-image.binding-bundle.json'),'bookDigest':binding['bookModelDigest'],'provider':'OpenAI','model':'unspecified','role':'assessment_adversarial_reviewer','promptFamilyId':'chemistry-positive-understanding-evidence-profile-review-v1','promptFingerprint':digest(prompt),'criteriaFingerprint':digest(ROOT/crit),'generationParametersFingerprint':digest(B/'actual-generation-and-reuse-parameters.json'),'independenceGroupId':NAME+'.p-c441-independent-b','blindToOtherRuns':True,'goalIds':[gid],'inputArtifacts':[{'role':'book_model','digest':binding['bookModelDigest']},{'role':'book_pdf','digest':binding['bookPDFDigest']},{'role':'review_input_json','digest':binding['reviewInputDigest']},{'role':'review_prompt','digest':digest(prompt)},{'role':'review_criteria','digest':digest(ROOT/crit)}],'startedAt':now,'completedAt':datetime.now(timezone.utc).isoformat(),'status':'completed','outputDigest':digest(P/'review/c441.current-image.review.jsonl'),'toolchainVersion':'codex-current-native-binding-20261007'}
write_json(P/'review/c441.current-image.run.json',run)
config=j(N/'configs/positive18.author-candidates.config.json');config.update({'reviewId':review_id,'reviewPath':'review/c441.current-image.review.jsonl','reviewRunManifestPaths':['review/c441.current-image.run.json'],'scope':{'label':'Independent targeted c441 P whole two DE/EN cases, exact current image-inclusive input only; AI candidate E1/G1; Human false; strictgain0','goalIds':[gid]}})
write_json(P/'configs/c441.current-image.config.json',config)
write_json(B/'native-p-byte-exact-inert-copy-receipt.actual.json',{'schemaVersion':1,'purpose':'Run unchanged native positiveGoalEvidenceReview.ts with own c441-only config and actual candidate image; native root isolates resources from active app/public','copies':copy_receipts,'sourceOrToolOrSchemaEdited':False,'activeWrites':False,'humanApproval':False,'humanTrial':False,'strictGain':0})
print(json.dumps({'D17Records':17,'D17FreshReviews':3,'D17HistoricalReuse':14,'Dc441FreshReviews':1,'Pc441ReviewedCases':2,'Pc441ReviewId':review_id,'Pc441RunId':run_id,'PbodyFingerprint':profile_fp,'PcurrentImageInclusiveReviewInputFingerprint':review_input_fp,'inertExactCopies':len(copy_receipts)},indent=2))
