// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
const [repo,host,own]=process.argv.slice(2)
const read=(p:string)=>JSON.parse(readFileSync(resolve(own,p),'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const ctx=read('inputs/final-two-image-bound-whole-contexts.actual.json')
const binding=read('BINDING.final-P2-A2-M2-V2.actual.json')
const qa=await import(pathToFileURL(resolve(host,'app/scripts/goalVisualizationQaModel.ts')).href)
const status=await import(pathToFileURL(resolve(host,'app/src/utils/goalVisualizationQaStatus.ts')).href)
const predicates=await import(pathToFileURL(resolve(host,'app/scripts/reportDeepUnderstandingRollout.ts')).href)
const book=await import(pathToFileURL(resolve(host,'app/scripts/goalBookModel.ts')).href)
const normal=read('qa/V2.final-current.normal-alias.qa.json')
const physical=read('qa/V2.final-current.physical-transport.qa.json')
const sem=JSON.parse(readFileSync(resolve(repo,ctx.finalSemantic.path),'utf8'))
assert.equal(normal.records.length,2);assert.equal(physical.records.length,2)
for(const row of ctx.wholeContexts){
 const g=row.goal,r=normal.records.find((r:any)=>r.goalId===g.id),p=physical.records.find((r:any)=>r.goalId===g.id)
 assert.equal(r.title,g.title);assert.equal(r.description,g.description)
 assert.equal(r.assetSha256,row.actualCurrentNativeImage.sha256)
 assert.equal(sha(resolve(repo,row.actualCurrentNativeImage.path)),r.assetSha256)
 assert.equal(sha(resolve(host,r.publicAssetPath)),r.assetSha256)
 assert.equal(sha(resolve(host,r.canonicalAssetPath)),r.assetSha256)
 assert.equal(r.imageUrl,g.resourceLinks.find((l:any)=>l.type==='goal-visualization').url)
 for(const k of Object.keys(r).filter(k=>!['landscapePath','canonicalAssetPath','publicAssetPath'].includes(k)))assert.deepEqual(r[k],p[k])
 for(const x of [r,p]){
  assert.equal(qa.isGoalVisualizationAiApproved(x),true)
  assert.equal(qa.normalizeGoalVisualizationAiReview(x,x.assetSha256).aiApproved,'yes')
  assert.equal(status.aiApprovalStatus(x),'approved')
  assert.equal(predicates.hasCompletedDeepUnderstandingVisualizationReview(x),true)
  assert.equal(x.humanApproved,'no');assert.equal(x.humanReviewedAt,null)
 }
 const v=ctx.selectedVScience.find((s:any)=>s.goalId===g.id)
 const seal=JSON.parse(readFileSync(resolve(repo,v.FIRSTSeal.path),'utf8'))
 for(const f of seal.files)assert.equal(sha(resolve(repo,f.path)),f.sha256)
 assert.equal(seal.normalNewRecordsAtSeal,0)
 assert.ok(Date.parse(seal.sealedAtUTC)<Date.parse(binding.boundAtUTC))
 const first=JSON.parse(readFileSync(resolve(repo,v.FIRST.path),'utf8'))
 if(g.id.startsWith('a8ddb351')){assert.equal(first.decision,'accepted');assert.deepEqual(first.currentWholeGoal,g)}
 else assert.equal(first.decisions.find((d:any)=>d.goalId===g.id).decision,'accepted')
 assert.equal(sem.decisions.find((s:any)=>s.goalId===g.id).sourceFingerprint,book.fingerprintSemanticKindSourceGoal(g))
}
const old=JSON.parse(readFileSync(resolve(repo,ctx.QA438Baseline.path),'utf8'))
const current=read('qa/QA438.original436-plus-current-Kp-Pourbaix-V2.candidate.json')
assert.equal(old.records.length,438);assert.equal(current.records.length,438)
const ids=new Set(normal.records.map((r:any)=>r.goalId));let exact=0
for(const r of old.records){const n=current.records.find((x:any)=>x.goalId===r.goalId);if(!ids.has(r.goalId)){assert.deepEqual(r,n);exact++}}
assert.equal(exact,436)
const oldScience=read('science/FIRST.actual-informed-V2.original.json')
assert.equal(oldScience.decisions.find((d:any)=>d.goalId.startsWith('a8ddb351')).decision,'revise')
assert.equal(sha(resolve(repo,ctx.QA438Baseline.path)),ctx.QA438Baseline.sha256)
console.log(JSON.stringify({targetedStockV2HelperExit:0,uniqueCurrentVotes:2,physicalTransportAddsVotes:0,
 accepted:2,whole438:438,other436WholeObjectsExact:true,oldJPGRevisePreserved:true,
 actualNewPNGAndUnchangedPourbaixCurrentContexts:true,sourceImageCopies:0,
 sourceCourseApproval:false,HumanApproval:false,centralExecuted:false},null,2))
