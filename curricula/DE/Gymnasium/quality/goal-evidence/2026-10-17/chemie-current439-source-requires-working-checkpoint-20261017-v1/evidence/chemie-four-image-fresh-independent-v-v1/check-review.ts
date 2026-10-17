import assert from 'node:assert/strict'
import fs from 'node:fs'
import crypto from 'node:crypto'
import path from 'node:path'
import { aiApprovalStatus, isAiApprovedForCurrentAsset } from '/home/enpasos/projects/skillpilot/app/src/utils/goalVisualizationQaStatus.ts'
import { normalizeGoalVisualizationAiReview } from '/home/enpasos/projects/skillpilot/app/scripts/goalVisualizationQaModel.ts'

const root='/mnt/e/skillpilot-chemie-L7-20261017/chemie-four-image-fresh-independent-v-v1'
const sha=(bytes:Buffer)=>crypto.createHash('sha256').update(bytes).digest('hex')
const read=(file:string)=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'))
const first=read('FIRST.independent-scientific-observations.json')
const seal=read('FIRST.seal.json')
assert.equal(sha(fs.readFileSync(seal.path)),seal.sha256)
assert.equal(first.records.length,4)
assert.equal(first.humanApproval,false)
assert.equal(first.independence.peerReviewResultsRead,false)
assert.equal(first.independence.stockQASchemaReadBeforeFirst,false)
const delta=read('V.review-records.stock-ai-delta.json')
assert.equal(delta.records.length,4)
assert.ok(new Date(delta.serializedAtUTC)>new Date(seal.sealedAtUTC))
const preview=read('TECHNICAL.real-browser-preview-manifest.json')
assert.equal(preview.images.length,16)
assert.deepEqual(preview.rendering.requestedWidths,[360,680])
assert.equal(preview.rendering.maxHeight,448)
const checked=[]
for(const record of first.records){
 assert.equal(sha(fs.readFileSync(record.candidatePath)),record.candidateSha256)
 assert.equal(sha(fs.readFileSync(record.originalPath)),record.originalSha256)
 assert.equal(sha(fs.readFileSync(record.scientificContext.path)),record.scientificContext.sha256)
 assert.equal(record.screenshots.length,4)
 for(const screenshot of record.screenshots){assert.equal(sha(fs.readFileSync(screenshot.path)),screenshot.sha256)}
 const qa=delta.records.find((item:any)=>item.goalId===record.goalId)
 assert.equal(qa.assetSha256,'sha256:'+record.candidateSha256)
 assert.equal(qa.aiApprovedAssetSha256,qa.assetSha256)
 assert.equal(aiApprovalStatus(qa),'approved')
 assert.equal(isAiApprovedForCurrentAsset(qa),true)
 assert.equal(normalizeGoalVisualizationAiReview(qa,qa.assetSha256).aiApproved,'yes')
 assert.ok(!('humanApproved' in qa))
 checked.push({goalId:record.goalId,decision:record.decision,candidateSha256:record.candidateSha256,stockAiApprovalStatus:aiApprovalStatus(qa),screenshots:4})
}
for(const image of preview.images){
 assert.equal(image.geometry.complete,true)
 assert.equal(image.geometry.computedObjectFit,'contain')
 assert.equal(image.geometry.computedMaxHeight,'448px')
 assert.ok(image.geometry.boxHeight<=448)
 assert.equal(image.geometry.boxWidth,image.width)
 assert.deepEqual(image.pageErrors,[])
}
const check={role:'Actual pin and unmodified stock AI predicate check of this four-candidate review delta only',passed:true,checkedAtUTC:new Date().toISOString(),firstSha256:seal.sha256,sourceSelectorSha256:sha(fs.readFileSync(first.inputSelector.path)),canonicalViews:read('CHECK.current-canonical-vs-scientific-views.json'),checked,sourceMutations:false,humanApproval:false}
fs.writeFileSync(path.join(root,'CHECK.pins-and-stock-ai-predicate.json'),JSON.stringify(check,null,2)+'\n')
console.log(JSON.stringify({passed:true,records:checked.length,screenshots:preview.images.length,stockAiStatuses:checked.map(x=>x.stockAiApprovalStatus),firstSha256:seal.sha256},null,2))
