// SPDX-License-Identifier: Apache-2.0
// Actual ordinary inactive models and resource binding checks; no science approval.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {dirname,resolve,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {fingerprintSemanticKindSourceGoal,loadGoalBookBuildInputs,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
const R=resolve('.'),D=dirname(fileURLToPath(import.meta.url)),P=relative(R,D),C=process.argv[process.argv.indexOf('--capsule')+1]
const read=(p:string)=>JSON.parse(readFileSync(resolve(D,p),'utf8'))
const put=(p:string,j:any)=>{mkdirSync(dirname(resolve(D,p)),{recursive:true});writeFileSync(resolve(D,p),JSON.stringify(j,null,2)+'\n')}
const prior=read('inputs/whole479-current-canonical.exact.json'),future=read('candidate/whole479-with-eight-author-raster-links.inactive.json')
const ids=read('inputs/final-eight-author-raster-bindings.exact.json').assets.map((x:any)=>x.goalId)
const pg=new Map<string,any>(prior.goals.map((g:any)=>[g.id,g])),fg=new Map<string,any>(future.goals.map((g:any)=>[g.id,g]))
assert.equal(pg.size,479);assert.equal(fg.size,479)
const changes=[...pg.keys()].filter(id=>stableGoalBookJson(pg.get(id))!==stableGoalBookJson(fg.get(id)))
assert.deepEqual(new Set(changes),new Set(ids))
for(const id of pg.keys()){
 const before=pg.get(id),after=fg.get(id)
 assert.equal(fingerprintSemanticKindSourceGoal(before),fingerprintSemanticKindSourceGoal(after))
 if(ids.includes(id))assert.equal(stableGoalBookJson({...before,resourceLinks:after.resourceLinks}),stableGoalBookJson(after))
}
const before=await loadGoalBookBuildInputs(`${P}/native/before394-current-V3.normal.config.json`,C)
const after=await loadGoalBookBuildInputs(`${P}/native/after394-current-P.normal.config.json`,C)
assert.equal(before.model.pages.length,394);assert.equal(after.model.pages.length,394)
put('native/before394-current-V3.actual-model.json',before.model);put('native/after394-current-P.actual-model.json',after.model)
const bp=new Map<string,any>(before.model.pages.map(p=>[p.goalId,p])),ap=new Map<string,any>(after.model.pages.map(p=>[p.goalId,p]))
const protectedIds=read('inputs/protected-all-five-baseline-current-and-strict-ID-sets.exact.json').subjects.find((s:any)=>s.subject==='biologie').strictCompleteGoalIds
assert.equal(protectedIds.length,315);assert.ok(protectedIds.every((id:string)=>pg.has(id)&&bp.has(id)&&ap.has(id)))
assert.ok(protectedIds.every((id:string)=>stableGoalBookJson(pg.get(id))===stableGoalBookJson(fg.get(id))))
assert.ok(protectedIds.every((id:string)=>stableGoalBookJson(bp.get(id))===stableGoalBookJson(ap.get(id))))
const changedPages=[...bp.keys()].filter(id=>stableGoalBookJson(bp.get(id))!==stableGoalBookJson(ap.get(id)))
assert.deepEqual(new Set(changedPages),new Set(ids))
const rows=(name:string)=>readFileSync(resolve(D,name),'utf8').trim().split('\n').map(s=>JSON.parse(s))
const original=rows('positive/whole12-current-V3-profiles.exact.jsonl'),current=rows('positive/eight-current-P.author.review.jsonl'),four=rows('positive/four-deferred-current-V3-profiles.exact-retained.jsonl')
assert.equal(current.length,8);assert.equal(four.length,4)
const bindings=current.map(r=>{
 const old=original.find(o=>o.goalId===r.goalId),p=ap.get(r.goalId)
 assert.equal(stableGoalBookJson(old.profile),stableGoalBookJson(r.profile))
 assert.equal(old.profileFingerprint,r.profileFingerprint);assert.equal(old.goalFingerprint,r.goalFingerprint)
 assert.notEqual(old.reviewInputFingerprint,r.reviewInputFingerprint)
 assert.equal(r.status,'needs_human_review');assert.equal(r.reviewAuthority,'ai_candidate')
 assert.equal(r.evidenceLevel,'E1');assert.equal(r.maximumClaimScope,'G1');assert.deepEqual(r.reviewRunIds,[])
 assert.equal(p.evidenceReview.reviewInputFingerprint,r.reviewInputFingerprint)
 assert.equal(p.evidenceReview.profileFingerprint,r.profileFingerprint)
 const png=read('inputs/final-eight-author-raster-bindings.exact.json').assets.find((x:any)=>x.goalId===r.goalId).png
 assert.equal(p.visualization.originalDigest,png.sha256)
 return{goalId:r.goalId,goalFingerprint:r.goalFingerprint,profileFingerprint:r.profileFingerprint,oldReviewInputFingerprint:old.reviewInputFingerprint,currentReviewInputFingerprint:r.reviewInputFingerprint,currentPageFingerprint:p.pageFingerprint,actualRasterDigest:p.visualization.originalDigest,status:r.status,reviewAuthority:r.reviewAuthority}
})
assert.ok(four.every(r=>stableGoalBookJson(r)===stableGoalBookJson(original.find(o=>o.goalId===r.goalId))))
const source=read('sources/whole16-duties113-partners41-bodies.exact.json')
assert.equal(source.length,16);assert.equal(source.reduce((n:number,r:any)=>n+r.allOriginalPartnerRows.length,0),113)
assert.equal(new Set(source.flatMap((r:any)=>r.wholeCurrentCanonicalPartners.map((g:any)=>g.id))).size,41)
put('checks/actual-whole394-goal-page-P-and-resource-delta.json',{schemaVersion:1,ordinaryApi:'loadGoalBookBuildInputs + fingerprintSemanticKindSourceGoal + stableGoalBookJson',beforeModelDigest:before.model.digest,afterModelDigest:after.model.digest,beforeAtomicPages:394,afterAtomicPages:394,changedWholeGoalIds:changes,changedExistingWholePageIds:changedPages,all479SemanticFingerprintsUnchanged:true,onlyEightResourceLinksChanged:true,all315ProtectedGoalAndPageBodiesExact:true,whole12ProfileScientificBodiesExact:true,fourDeferredWholeRecordsExact:true,whole16Duties113PartnerEdges41PartnerBodiesRetained:true,currentEightBindings:bindings,currentIndependentNativeReviews:0,currentIndependentVisualApprovals:0,wholeSourceCourseApproval:false,humanApproval:false,activeWrites:0,strictGain:0})
console.log(JSON.stringify({wholeAtomicModels:'394→394',newActualRasterAndPositiveBindings:8,protected315GoalsAndPagesExact:true,changedWholePages:changedPages,all12ProfileBodiesExact:true,wholeSourceFrame:'16/113/41',newScientificApprovals:0,strictGain:0,activeWrites:0}))
