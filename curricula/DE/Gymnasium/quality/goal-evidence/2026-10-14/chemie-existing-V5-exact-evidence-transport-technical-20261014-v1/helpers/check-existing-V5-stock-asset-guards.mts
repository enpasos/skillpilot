import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
let repo=root
while(!existsSync(resolve(repo,'AGENTS.md'))){const next=dirname(repo);assert.notEqual(next,repo);repo=next}
const model=await import(pathToFileURL(resolve(repo,'app/scripts/goalVisualizationQaModel.ts')).href)
const status=await import(pathToFileURL(resolve(repo,'app/src/utils/goalVisualizationQaStatus.ts')).href)
const ledger=JSON.parse(readFileSync(resolve(root,'candidate.QA5.exact-sealed-existing-native-records.json'),'utf8'))
const delta=JSON.parse(readFileSync(resolve(root,'QA5.delta-only-exact-existing-native-five-field-selection.inactive.json'),'utf8'))
const fields=['aiApproved','aiApprovedAssetSha256','aiReviewedAt','aiReviewer','aiNotes']
assert.equal(ledger.records.length,5);assert.equal(delta.operations.length,5)
const records=ledger.records.map((record:any)=>{
 const expected=Object.fromEntries(fields.map(k=>[k,record[k]]))
 assert.deepEqual(model.normalizeGoalVisualizationAiReview(record,record.assetSha256),expected)
 assert.equal(status.aiApprovalStatus(record),'approved')
 assert.equal(status.isAiApprovedForCurrentAsset(record),true)
 assert.equal(model.isGoalVisualizationAiApproved(record),true)
 assert.equal(record.visualizationState,'available');assert.equal(record.missingReason,'')
 assert.equal(record.humanApproved,'no')
 const op=delta.operations.find((o:any)=>o.goalId===record.goalId)
 assert.deepEqual(op.copyOnlyExactExistingNativeFields,expected)
 return {goalId:record.goalId,stockAssetApprovalStatus:'approved',normalizationLeavesExactFiveFieldsUnchanged:true,originalReviewedAt:record.aiReviewedAt,currentAssetSha256:record.assetSha256,humanApproval:false}
})
console.log(JSON.stringify({status:'PASS',scope:'Five existing exact-image V fields through unmodified stock asset guards; no new V/D/source/strict approval',records,newVVotes:0,activeWrites:false}))
