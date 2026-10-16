// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
const [repo,host,own]=process.argv.slice(2)
const read=(p:string)=>JSON.parse(readFileSync(resolve(own,p),'utf8'))
const digest=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const qa=await import(pathToFileURL(resolve(host,'app/scripts/goalVisualizationQaModel.ts')).href)
const centralPredicates=await import(pathToFileURL(resolve(host,'app/scripts/reportDeepUnderstandingRollout.ts')).href)
const status=await import(pathToFileURL(resolve(host,'app/src/utils/goalVisualizationQaStatus.ts')).href)
const book=await import(pathToFileURL(resolve(host,'app/scripts/goalBookModel.ts')).href)
const firstSeal=read('science/FIRST.actual-informed-V1.seal.json')
for(const r of firstSeal.files)assert.equal(digest(resolve(repo,r.path)),r.sha256)
assert.equal(firstSeal.normalNewRecordsAtSeal,0);assert.equal(firstSeal.normalNewFingerprintsAtSeal,0)
const first=read('science/FIRST.actual-informed-V1.original.json')
const binding=read('BINDING.informed-P2-A2-M1-V1.actual.json')
assert.ok(Date.parse(firstSeal.sealedAtUTC)<Date.parse(binding.boundAtUTC))
const context=read('inputs/whole-three-contexts-two-profiles-six-cases.actual.json')
const canonical=JSON.parse(readFileSync(resolve(repo,context.finalCanonical.path),'utf8'))
const semantic=JSON.parse(readFileSync(resolve(repo,context.finalSemantic.path),'utf8'))
const g=canonical.goals.find((g:any)=>g.id===first.decisions[0].goalId)
assert.deepEqual(g,context.wholeContexts.find((c:any)=>c.goal.id===g.id).goal)
const normal=read('qa/V1.rezeptfrei-context.normal-alias.qa.json')
const physical=read('qa/V1.rezeptfrei-context.physical-transport.qa.json')
assert.equal(normal.records.length,1);assert.equal(physical.records.length,1)
const r=normal.records[0],p=physical.records[0]
assert.equal(r.description,g.description);assert.ok(r.description.includes('rezeptfreier'))
assert.equal(r.assetSha256,context.wholePriorF71VRecord.assetSha256)
assert.equal(r.assetSha256,first.decisions[0].actualPNG.sha256)
assert.equal(digest(resolve(repo,first.decisions[0].actualPNG.path)),r.assetSha256)
assert.equal(digest(resolve(host,r.publicAssetPath)),r.assetSha256)
assert.equal(digest(resolve(host,r.canonicalAssetPath)),r.assetSha256)
assert.equal(r.imageUrl,g.resourceLinks.find((l:any)=>l.type==='goal-visualization').url)
for(const key of Object.keys(r).filter(k=>!['landscapePath','canonicalAssetPath','publicAssetPath'].includes(k)))assert.deepEqual(r[key],p[key])
for(const row of [r,p]){
 assert.equal(qa.isGoalVisualizationAiApproved(row),true)
 assert.equal(qa.normalizeGoalVisualizationAiReview(row,row.assetSha256).aiApproved,'yes')
 assert.equal(status.aiApprovalStatus(row),'approved')
 assert.equal(centralPredicates.hasCompletedDeepUnderstandingVisualizationReview(row),true)
 assert.equal(row.humanApproved,'no');assert.equal(row.humanReviewedAt,null)
}
assert.equal(semantic.decisions.find((s:any)=>s.goalId===g.id).sourceFingerprint,book.fingerprintSemanticKindSourceGoal(g))
const baseline=JSON.parse(readFileSync(resolve(repo,context.V438Baseline.path),'utf8'))
const whole=read('qa/QA438.original437-plus-rezeptfrei-context-V1.candidate.json')
assert.equal(baseline.records.length,438);assert.equal(whole.records.length,438)
let exact=0
for(const prior of baseline.records){
 const next=whole.records.find((x:any)=>x.goalId===prior.goalId)
 if(prior.goalId!==g.id){assert.deepEqual(prior,next);exact++}
}
assert.equal(exact,437)
assert.deepEqual(whole.records.find((x:any)=>x.goalId===g.id),r)
assert.equal(digest(resolve(repo,context.V438Baseline.path)),context.V438Baseline.sha256)
for(const row of [first.decisions[0].currentFinalPageActuallySeen,...first.decisions[0].prior316And636ImagesActuallyReopened])assert.equal(digest(resolve(repo,row.path)),row.sha256)
console.log(JSON.stringify({targetedStockHelperExit:0,newContextVotes:1,accepted:1,
 unchangedPNG:true,whole438:438,other437WholeObjectsExact:true,
 prior316636EvidenceHistoricalWording:true,newRenders:0,
 humanApproval:false,sourceCourseApproval:false,centralExecuted:false},null,2))
