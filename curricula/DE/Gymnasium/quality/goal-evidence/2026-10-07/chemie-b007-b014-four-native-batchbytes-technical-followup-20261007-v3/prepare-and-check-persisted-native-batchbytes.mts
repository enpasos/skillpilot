// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,mkdirSync,cpSync,existsSync} from 'node:fs'
import {dirname,resolve,relative} from 'node:path'
import {serializeGoalDescriptionReviewBatchInput,validateGoalDescriptionReviewCampaign,loadGoalDescriptionReviewRecordSchemaBytes} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import {verifyGoalBookReviewBundleArtifactBytes} from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign'
const root=resolve('.'),previous=resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-b007-b014-four-current479-native-refresh-author-20261007-v2'),own=resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-b007-b014-four-native-batchbytes-technical-followup-20261007-v3')
assert.ok(!existsSync(resolve(own,'technical.final.freeze.json')))
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const bind=(p:string)=>{const b=readFileSync(p);return{path:relative(root,p),sha256:sha(b),bytes:b.length}}
// Generic Buffer output remains raw bytes; only objects become JSON.
const write=(p:string,v:Buffer|string|object)=>{mkdirSync(dirname(p),{recursive:true});writeFileSync(p,Buffer.isBuffer(v)||typeof v==='string'?v:JSON.stringify(v,null,2)+'\n')}
const oldFreezePath=resolve(previous,'author.final.freeze.json'),oldFreeze=read(oldFreezePath)
for(const row of oldFreeze.payloads){const b=readFileSync(resolve(root,row.path));assert.equal(sha(b),'sha256:'+row.sha256);assert.equal(b.length,row.bytes)}
const bundle=read(resolve(previous,'native/four/bundle/review-bundle-manifest.json'))
await verifyGoalBookReviewBundleArtifactBytes(bundle,resolve(previous,'native/four/bundle'))
const schemaBytes=await loadGoalDescriptionReviewRecordSchemaBytes(),rows=[]
for(const side of ['a','b']){
 const source=resolve(previous,'native/four/round-'+side),target=resolve(own,'native/four/round-'+side)
 cpSync(source,target,{recursive:true})
 const campaign=read(resolve(target,'description-review-campaign.json')),input=read(resolve(target,'description-review-input.json'))
 const campaignCheck=await validateGoalDescriptionReviewCampaign({bundle,input,campaign});assert.deepEqual(campaignCheck.errors,[])
 const persistedSchema=readFileSync(resolve(target,'contracts/goal-description-review-record.schema.json'));assert.equal(sha(persistedSchema),campaign.recordSchemaDigest);assert.deepEqual(persistedSchema,schemaBytes)
 for(const batch of campaign.batches){
  const values={bundleFingerprint:bundle.bundleFingerprint,bookDigest:bundle.bookModelDigest,reviewInputFingerprint:input.reviewInputFingerprint,inputSchemaVersion:input.schemaVersion,recordSchemaDigest:campaign.recordSchemaDigest,batchId:batch.batchId,goalIds:batch.goalIds,goals:input.goals}
  const expected=serializeGoalDescriptionReviewBatchInput(values)
  assert.ok(Buffer.isBuffer(expected))
  const path=resolve(target,'batches',batch.batchId+'.input.jsonl')
  write(path,expected)
  const actual=readFileSync(path);assert.deepEqual(actual,expected);assert.equal(sha(actual),batch.batchInputFingerprint)
  const lines=actual.toString('utf8').trim().split('\n').map(l=>JSON.parse(l));assert.equal(lines.length,batch.goalIds.length)
  assert.deepEqual(lines.map(row=>row.goal.goalId),batch.goalIds)
  for(const row of lines){assert.equal(row.batchId,batch.batchId);assert.equal(row.recordSchemaDigest,campaign.recordSchemaDigest);assert.equal(row.bookDigest,campaign.bookDigest);assert.equal(row.bundleFingerprint,campaign.bundleFingerprint);assert.equal(row.reviewInputFingerprint,campaign.reviewInputFingerprint)}
  rows.push({side,campaign:bind(resolve(target,'description-review-campaign.json')),actualPersistedNativeBatch:bind(path),batchInputFingerprint:batch.batchInputFingerprint,nativeFingerprintMatch:true,actualJSONLRows:lines.length,recordSchemaDigest:sha(persistedSchema),campaignValidationErrors:campaignCheck.errors,nativeInputRecordMatches:true,ownReviewRecords:0,ownRunManifests:0})
 }
}
const oldEntry=read(resolve(previous,'independent-neutral-review-entry.json')),entry:any={}
const forward=(value:any):any=>Array.isArray(value)?value.map(forward):typeof value==='string'&&existsSync(resolve(previous,value))?'../'+relative(dirname(previous),previous)+'/'+value:value
for(const [key,value]of Object.entries(oldEntry))entry[key]=forward(value)
entry.role='Neutral exact v2 scientific inputs with narrowly corrected actual native raw batchbytes; no own or peer verdicts'
entry.roundA='native/four/round-a';entry.roundB='native/four/round-b';entry.currentNativeBatchbytesReceipt='persisted-native-batchbytes.actual.validation.json';entry.priorScientificFreeze=bind(oldFreezePath);entry.strictGain=0
write(resolve(own,'independent-neutral-review-entry.json'),entry)
write(resolve(own,'persisted-native-batchbytes.actual.validation.json'),{role:'Actual native producer bytes and persisted batch/schema/campaign verification; this is no scientific review or new content',createdAt:new Date().toISOString(),originalFault:'Generic author object writer JSON-serialized a native Buffer wrapper; historical v2 remains unchanged.',correctedGenericWriter:'Buffer.isBuffer(v) writes raw bytes, strings write text, objects alone write JSON',previousFreeze:bind(oldFreezePath),previousPayloadsVerified:oldFreeze.payloads.length,scientificBodiesChanged:0,goalContextBindingsChanged:0,campaignIDsOrFingerprintsChanged:0,rows,activeWrites:0,strictGain:0,humanApproval:false,independentApproval:false})
console.log(JSON.stringify({sides:rows.map(r=>({side:r.side,JSONLRows:r.actualJSONLRows,sha256:r.actualPersistedNativeBatch.sha256,fingerprintMatch:r.nativeFingerprintMatch})),oldPayloadsVerified:oldFreeze.payloads.length,scienceChanges:0,strictGain:0}))
