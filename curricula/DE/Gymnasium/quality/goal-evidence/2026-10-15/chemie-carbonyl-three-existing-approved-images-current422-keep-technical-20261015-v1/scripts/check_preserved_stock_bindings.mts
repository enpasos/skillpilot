import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
const [repo, packet] = process.argv.slice(2)
const load = (name: string) => JSON.parse(readFileSync(resolve(packet,name),'utf8'))
const model=await import(pathToFileURL(resolve(repo,'app/scripts/goalVisualizationQaModel.ts')).href)
const positive=await import(pathToFileURL(resolve(repo,'app/scripts/goalEvidenceProfileModel.ts')).href)
const dg=(p:string)=>`sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`
const originals=load('qa/ORIGINAL.selected-three-records.exact-values.json').records
const physical=load('qa/V3.original-approved.physical-transport.qa.json').records
const aliases=load('qa/V3.original-approved.normal-alias-transport.qa.json').records
const candidate=load('candidate/canonical554.current422.resource-only-three-kept-PNG.exact.json')
const result=physical.map((row:any,index:number)=>{
 const original=originals[index],alias=aliases[index]
 for(const other of [row,alias]){
  for(const key of Object.keys(original).filter(k=>!['landscapePath','canonicalAssetPath','publicAssetPath'].includes(k)))assert.deepEqual(other[key],original[key],`${row.goalId}:${key}`)
 }
 const goal=candidate.goals.find((g:any)=>g.id===row.goalId)
 assert.equal(row.title,goal.title);assert.equal(row.description,goal.description)
 assert.equal(dg(resolve(repo,row.publicAssetPath)),row.assetSha256)
 assert.equal(dg(resolve(repo,row.canonicalAssetPath)),row.assetSha256)
 assert.equal(model.isGoalVisualizationAiApproved(row),true)
 assert.equal(model.normalizeGoalVisualizationAiReview(row,row.assetSha256).aiApproved,'yes')
 return {goalId:row.goalId,normalStockCurrentAssetApproval:true,originalVFieldsAndHumanLegacyFieldsExact:true,originalReviewer:row.aiReviewer,originalReviewedAt:row.aiReviewedAt,assetSha256:row.assetSha256,newVote:false}
})
const P3=load('checks/P3.image-change.binding-probe.input.json').goals.map((g:any)=>{
 const rule=g.goalFingerprintRuleVersion,kind=g.effectiveSemanticKind
 const beforeGoal=positive.fingerprintGoalForEvidence(g.before,rule,kind)
 const afterGoal=positive.fingerprintGoalForEvidence(g.after,rule,kind)
 const beforeInput=positive.fingerprintGoalEvidenceReviewInput(g.before,rule,g.resourceDigestsBefore,kind)
 const afterInput=positive.fingerprintGoalEvidenceReviewInput(g.after,rule,g.resourceDigestsAfter,kind)
 assert.equal(beforeGoal,afterGoal);assert.notEqual(beforeInput,afterInput)
 return {goalId:g.goalId,goalFingerprintUnchanged:beforeGoal,reviewInputFingerprintBefore:beforeInput,reviewInputFingerprintAfter:afterInput,inputBindingChanged:true,existingPRecordOnOldInputWouldBeStale:true,actualExistingPRecordRenewed:false,newPVote:false}
})
console.log(JSON.stringify({schemaVersion:1,role:'Actual stock V model and stock P input fingerprint diagnostic only',checkedAtUTC:new Date().toISOString(),stockModules:['app/scripts/goalVisualizationQaModel.ts','app/src/utils/goalVisualizationQaStatus.ts','app/scripts/goalEvidenceProfileModel.ts'].map(path=>({path,sha256:dg(resolve(repo,path))})),V3:result,P3bindingDiagnostic:P3,allScientificVFieldsPreserved:true,newScientificVotes:0,centralExecuted:false,humanApproval:false,humanTrial:false},null,2))
