/** Mechanical metadata join only. All scientific fields come from preserved real reviewer responses. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,join,relative,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base=dirname(fileURLToPath(import.meta.url));
const root=resolve(base,'../../../../../../..');
assert.ok(existsSync(join(root,'app/scripts/materializeGoalDescriptionRolloutBatch.ts')),'Run inside the repository hierarchy');
const load=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const sha=(v:Buffer|string)=>'sha256:'+createHash('sha256').update(v).digest('hex');
const write=(p:string,x:any)=>{const data=JSON.stringify(x,null,2)+'\n';if(existsSync(p))assert.equal(readFileSync(p,'utf8'),data,`Refusing to overwrite immutable artifact ${p}`);else writeFileSync(p,data)};
const plan=load(join(base,process.argv[2]??'description-review-join.current-v4.json'));
const prepared=resolve(base,plan.batchDirectory);
const batch=load(join(prepared,'batch-manifest.json'));
for(const {suffix,responseName,confirmationName,reviewerKey:label} of plan.lanes){ const responsePath=join(base,responseName);const response=load(responsePath);const confirmation=load(join(base,confirmationName));
 assert.equal(confirmation.decision,'accept_current');
 const dir=join(prepared,'round-'+suffix);const campaign=load(join(dir,'description-review-campaign.json'));const input=load(join(dir,'description-review-input.json'));
 assert.equal(confirmation.reviewInputFingerprint,input.reviewInputFingerprint);
 assert.equal(confirmation.bookModelSha256,sha(readFileSync(join(prepared,'bundle/book-model.json'))));
 const cb=campaign.batches[0];const runId=campaign.campaignId+'-'+label;
 const nativeInput=readFileSync(join(dir,'batches',cb.inputPath??`${cb.batchId}.input.jsonl`));
 const nativeGoals=new Map(nativeInput.toString().trim().split('\n').map((line:string)=>{const row=JSON.parse(line);return [row.goal.goalId,row.goal]}));
 const records=cb.goalIds.map((goalId:string)=>{
  const review=response.descriptionReviews.find((r:any)=>r.goalId===goalId);const current:any=nativeGoals.get(goalId);assert.ok(review&&current,goalId);
  assert.equal(review.decision,'keep',`${goalId}: this join has no authority to turn dissent into keep`);
  const fields=['decision','proposedDescriptionDe','proposedDescriptionEn','understandingEvidence','rationale','evidenceProfileContract','evidenceProfileRecommendation'];
  return {$schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',schemaVersion:1,recordId:runId+'-'+goalId,runId,campaignId:campaign.campaignId,roundId:campaign.roundId,bundleFingerprint:input.bundleFingerprint,bookDigest:input.bookDigest,goalId,goalFingerprint:current.goalFingerprint,pageFingerprint:current.pageFingerprint,currentTitleDe:current.currentTitleDe,currentTitleEn:current.currentTitleEn,currentDescriptionDe:current.currentDescriptionDe,currentDescriptionEn:current.currentDescriptionEn,...Object.fromEntries(fields.filter(k=>review[k]!==undefined&&review[k]!==null).map(k=>[k,review[k]])),recordStatus:'candidate',reviewAuthority:'ai_candidate'};
 });
 const bytes=records.map((r:any)=>JSON.stringify(r)).join('\n')+'\n';const resultPath=join(dir,'results',cb.batchId+'.records.jsonl');
 if(existsSync(resultPath))assert.equal(readFileSync(resultPath,'utf8'),bytes);else writeFileSync(resultPath,bytes);
 const generation={interface:'Codex collaboration agent',reviewerTask:response.reviewerTask??label,exactModelIdentifierKnown:!!response.model};
 const run={$schema:'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',schemaVersion:1,runId,campaignId:campaign.campaignId,roundId:campaign.roundId,batchId:cb.batchId,batchInputFingerprint:sha(nativeInput),bundleFingerprint:input.bundleFingerprint,bookDigest:input.bookDigest,provider:'OpenAI',model:response.model??'Codex collaboration agent; exact model identifier unavailable',role:'subject_reviewer',promptFamilyId:'goal-description-understanding-evidence-v2',promptFingerprint:sha(readFileSync(join(dir,'prompt.md'))),criteriaFingerprint:sha(readFileSync(join(dir,'criteria.md'))),generationParametersFingerprint:sha(JSON.stringify(generation)),independenceGroupId:campaign.independenceGroupId,blindToOtherRuns:true,goalIds:cb.goalIds,inputArtifacts:[{role:'book_model',digest:sha(readFileSync(join(prepared,'bundle/book-model.json')))},{role:'review_prompt',digest:sha(readFileSync(join(dir,'prompt.md')))},{role:'review_criteria',digest:sha(readFileSync(join(dir,'criteria.md')))},{role:'description_review_batch_input_jsonl',digest:sha(nativeInput)}],startedAt:response.startedAt,completedAt:confirmation.completedAt,status:'completed',outputDigest:sha(bytes),toolchainVersion:'codex-collaboration-preserved-response-native-metadata-join-v1'};
 write(join(dir,'results',cb.batchId+'.run.json'),run);
 write(join(base,`${plan.receiptPrefix??"description-current-v4"}-${suffix}-metadata-join.actual.json`),{schemaVersion:1,contract:'actual-review-scientific-body-native-metadata-join-v1',response:{path:relative(root,responsePath),sha256:sha(readFileSync(responsePath))},nativeContextConfirmation:{path:relative(root,join(base,confirmationName)),sha256:sha(readFileSync(join(base,confirmationName)))},records:{path:relative(root,resultPath),sha256:sha(bytes)},runManifest:{path:relative(root,join(dir,'results',cb.batchId+'.run.json')),sha256:sha(readFileSync(join(dir,'results',cb.batchId+'.run.json')))},scientificFieldsAuthoredByJoin:false});
}
console.log('Joined two actual, independently authored response bodies without altering scientific content.');
