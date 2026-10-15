// SPDX-License-Identifier: Apache-2.0
// Targeted exact-current-asset assertions using unmodified stock V model.
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import path from 'node:path'
import {pathToFileURL} from 'node:url'
const root=path.resolve(process.cwd(),'..')
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-source3-six-contexts-current422-native-fresh-independent-b-20261015-v1'
const read=(p:string)=>JSON.parse(readFileSync(path.join(root,p),'utf8'))
const status=await import(pathToFileURL(path.join(root,'app/src/utils/goalVisualizationQaStatus.ts')).href)
const model=await import(pathToFileURL(path.join(root,'app/scripts/goalVisualizationQaModel.ts')).href)
const q=read(own+'/MV3/visualization-three.qa.json')
const a=read(own+'/MV3/ASSETS.exact-from-canonical-and-neutral-map.json')
const doc=read(own+'/MV3/EXPOSURE-and-actual-MV3-review.json')
assert.equal(q.schemaVersion,1);assert.equal(q.subject,'chemie');assert.equal(q.records.length,3)
assert.equal(doc.peerblindVisualizationAddendum,false);assert.equal(doc.humanApproval,false)
for(const r of q.records){
 const src=a.rows.find((x:any)=>x.goalId===r.goalId);assert.ok(src)
 const goal=read(r.landscapePath).goals.find((x:any)=>x.id===r.goalId)
 for(const [field,value] of Object.entries({title:goal.title,description:goal.description,assetSha256:src.physicalSource.sha256,imageUrl:src.resourceLink.url,canonicalAssetPath:src.physicalSource.path,visualizationState:'available',missingReason:'',humanApproved:'no',humanIssueIdentified:'no',aiApproved:'yes',aiApprovedAssetSha256:src.physicalSource.sha256}))assert.equal(r[field],value,field)
 for(const field of ['title','description','subject','landscapeId','landscapePath','imageUrl','publicAssetPath','canonicalAssetPath','assetSha256','aiReviewer','aiNotes','chatGptReviewer','chatGptNotes'])assert.ok(typeof r[field]==='string'&&r[field].trim(),field)
 assert.equal(r.humanReviewedAt,null);assert.equal(r.humanReviewer,'')
 assert.ok(Number.isFinite(Date.parse(r.aiReviewedAt)))
 assert.equal('sha256:'+createHash('sha256').update(readFileSync(path.join(root,r.canonicalAssetPath))).digest('hex'),r.assetSha256)
 assert.equal(status.aiApprovalStatus(r),'approved')
 assert.equal(status.isAiApprovedForCurrentAsset(r),true)
 assert.equal(model.isGoalVisualizationAiApproved(r),true)
 assert.deepEqual(model.normalizeGoalVisualizationAiReview(r,r.assetSha256),{aiApproved:r.aiApproved,aiApprovedAssetSha256:r.aiApprovedAssetSha256,aiReviewedAt:r.aiReviewedAt,aiReviewer:r.aiReviewer,aiNotes:r.aiNotes})
 assert.equal(status.aiApprovalStatus({...r,assetSha256:'sha256:'+'0'.repeat(64)}),'stale')
}
console.log('Three own informed V records: normal stock exact-asset status/model predicates pass; wrong-asset hash is stale; no human approval. Nine actual native/360/680 views disclosed.')
