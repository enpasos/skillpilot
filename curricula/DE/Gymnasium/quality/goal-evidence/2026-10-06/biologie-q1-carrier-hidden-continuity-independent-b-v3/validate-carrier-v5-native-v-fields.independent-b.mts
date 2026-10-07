import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { isGoalVisualizationAiApproved, normalizeGoalVisualizationAiReview } from '/home/enpasos/projects/skillpilot/app/scripts/goalVisualizationQaModel.ts'
import { aiApprovalStatus } from '/home/enpasos/projects/skillpilot/app/src/utils/goalVisualizationQaStatus.ts'
const base='/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-carrier-hidden-continuity-independent-b-v3/'
const candidate='/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-q1-carrier-hidden-continuity-and-length-author-20261006-v3/carrier-v5.candidate.png'
const record=JSON.parse(readFileSync(base+'carrier-v5.native-v-record.independent-b.json','utf8'))
const actualSha=createHash('sha256').update(readFileSync(candidate)).digest('hex')
assert.equal(actualSha,'4e543bef5d79f11dc6866bdd7607f915e1343da5014881f0213b6e7bf8210ede')
assert.equal(record.assetSha256,actualSha)
assert.equal(record.aiApprovedAssetSha256,actualSha)
assert.equal(record.goalId,'ac9e824f-003c-50ac-8751-2b8456004c63')
assert.equal(record.humanApproved,'no')
assert.equal(record.humanIssueIdentified,'no')
assert.equal(record.humanReviewedAt,null)
assert.equal(record.humanReviewer,'')
assert.equal(record.humanIssueDescription,'')
assert.equal(aiApprovalStatus(record),'approved')
assert.equal(isGoalVisualizationAiApproved(record),true)
const normalized=normalizeGoalVisualizationAiReview(record,actualSha)
assert.equal(normalized.aiApproved,'yes')
assert.equal(normalized.aiApprovedAssetSha256,actualSha)
const report={createdAt:new Date().toISOString(),status:'PASS',mode:'actual candidate native AI approval fields',nativeFunctions:['aiApprovalStatus','isGoalVisualizationAiApproved','normalizeGoalVisualizationAiReview'],goalId:record.goalId,actualCandidateSha256:actualSha,approvalStatus:aiApprovalStatus(record),normalizedReview:normalized,humanApproved:'no',humanIssueIdentified:'no',productionAssetInstallationClaimed:false,fullLedgerAssetCheckerClaimed:false}
writeFileSync(base+'carrier-v5.native-v-field-validation.actual.json',JSON.stringify(report,null,2)+'\n')
process.stdout.write(JSON.stringify({status:report.status,approvalStatus:report.approvalStatus,actualCandidateSha256:actualSha})+'\n')
