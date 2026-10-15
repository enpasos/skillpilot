// SPDX-License-Identifier: Apache-2.0
// Actual one-image positive V evidence, unmodified production helpers, no full host.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
const repo=process.cwd(),own=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const read=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const get=(p:string)=>JSON.parse(readFileSync(resolve(own,p),'utf8'))
const hash=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(resolve(repo,p))).digest('hex')
const modules=['app/scripts/goalVisualizationQaModel.ts','app/src/utils/goalVisualizationQaStatus.ts',
 'app/scripts/checkGoalVisualizationQaApprovalCoverage.ts','app/scripts/reportGoalVisualizationRolloutStatus.ts',
 'app/scripts/reportDeepUnderstandingRollout.ts','scripts/goal_visualization_scope.mjs']
const [model,status,coverage,rollout,deep,scope]=await Promise.all(modules.map(p=>import(pathToFileURL(resolve(repo,p)).href)))
const sel=get('INPUTS.one-image-readable-V1.physical-exact-selector.json'),ledger=get('review/QA.one-image.new-readable-PNG.machine-V1.json')
assert.equal(ledger.schemaVersion,1);assert.equal(ledger.subject,'chemie');assert.equal(ledger.records.length,1)
const row=ledger.records[0],context=read(row.landscapePath),goal=context.goals[0]
assert.equal(context.goals.length,1);assert.equal(goal.id,sel.goalId);assert.equal(row.goalId,sel.goalId)
assert.equal(row.title,goal.title);assert.equal(row.description,goal.description)
assert.equal(scope.isOrdinaryAtomicGoalForVisualization(goal),true)
const link=goal.resourceLinks.find((r:any)=>r.type==='goal-visualization'&&r.role==='primary')
assert.equal(link.url,row.imageUrl);assert.equal(link.skillpilotId,row.goalId)
assert.equal(row.publicAssetPath,'app/public'+row.imageUrl)
assert.match(row.assetSha256,/^sha256:[0-9a-f]{64}$/u)
assert.equal(row.assetSha256,sel.reviewedImage.sha256);assert.equal(hash(sel.reviewedImage.path),row.assetSha256)
assert.notEqual(row.assetSha256,sel.originalImage.sha256);assert.notEqual(row.assetSha256,sel.firstRejectedPng.sha256)
const aliases=sel.sparseAssetAliases.map((a:any)=>({path:a.path,actualSha256:hash(a.path),expectedSha256:row.assetSha256}))
assert.equal(aliases.length,2);assert.ok(aliases.every((a:any)=>a.actualSha256===a.expectedSha256))
assert.equal(row.aiApproved,'yes');assert.equal(row.aiApprovedAssetSha256,row.assetSha256);assert.ok(row.aiReviewedAt)
assert.equal(row.humanApproved,'no');assert.equal(row.humanIssueIdentified,'no');assert.equal(row.humanReviewedAt,null);assert.equal(row.humanReviewer,'')
const normalized=model.normalizeGoalVisualizationAiReview(row,row.assetSha256)
assert.equal(normalized.aiApproved,'yes');assert.equal(normalized.aiApprovedAssetSha256,row.assetSha256);assert.equal(normalized.aiReviewedAt,row.aiReviewedAt)
for(const oldHash of [sel.originalImage.sha256,sel.firstRejectedPng.sha256]){
 assert.deepEqual(model.normalizeGoalVisualizationAiReview(row,oldHash),model.emptyGoalVisualizationAiReview())
 assert.equal(status.aiApprovalStatus({...row,assetSha256:oldHash}),'stale')
}
const decision=status.aiApprovalStatus(row),approved=model.isGoalVisualizationAiApproved(row)
const completedV=deep.hasCompletedDeepUnderstandingVisualizationReview(row)
const ordinaryCoverage=coverage.hasCurrentGoalVisualizationApproval(row)
const unapproved=coverage.unapprovedActiveGoalVisualizations([row])
const exactApproved=rollout.hasCurrentExactByteAiQaEvidence({goalId:row.goalId,url:row.imageUrl},row,'chemie',resolve(own,'sparse'))
assert.equal(decision,'approved');assert.equal(approved,true);assert.equal(completedV,true)
assert.equal(ordinaryCoverage,true);assert.equal(unapproved.length,0);assert.equal(exactApproved,true)
const oldReview='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-lab15-analysis-image-safety-visual-review-20261015-v1/review/QA.one-image.V1.machine-rejected.json'
const oldQa=read(oldReview).records[0]
assert.equal(status.aiApprovalStatus(oldQa),'rejected');assert.equal(deep.hasCompletedDeepUnderstandingVisualizationReview(oldQa),false)
assert.notEqual(oldQa.aiReviewedAt,row.aiReviewedAt)
const originalGoal=read(sel.wholeBefore.path),candidateGoal=read(sel.wholeAfter.path)
const nonResource=(g:any)=>Object.fromEntries(Object.entries(g).filter(([k])=>k!=='resourceLinks'))
assert.deepEqual(nonResource(originalGoal),nonResource(candidateGoal))
const result={schemaVersion:1,technicalPass:true,scope:'One exact inactive new-image QA component; no full-subject coverage, source/atomicity verdict or generated build',
 productionHelpers:modules.map(path=>({path,sha256:hash(path)})),goalId:row.goalId,reviewedPng:sel.reviewedImage,
 actualSparseAliasByteChecks:aliases,wholeBeforeAfterNonResourceFieldsExact:true,
 productionNormalizationRetainsExactNewDecision:true,productionNormalizationDropsBothEarlierImageBindings:true,
 productionAiApprovalStatus:decision,isGoalVisualizationAiApproved:approved,
 hasCompletedDeepUnderstandingVisualizationReview:completedV,ordinaryApprovalPredicate:ordinaryCoverage,
 ordinaryUnapprovedOneRowCount:unapproved.length,hasCurrentExactByteAiQaEvidence:exactApproved,
 exactBytePredicateActuallyReadBothNormalProductionAssetPaths:true,
 oldRejectedFirstDecisionStillRejected:true,newHumanApproval:false,newMachineVDecisions:1,newMachineVApprovals:1,
 newD:0,newP:0,newA:0,newM:0,newStrictClosures:0,restoredBindings:0,activeIntegration:false,M7:false}
writeFileSync(resolve(own,'checks/CHECK.production-QA-model-and-exact-bytes.actual.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({technicalPass:true,productionAiApprovalStatus:decision,machineV:completedV,newMachineVApprovals:1,
 exactBytePredicate:exactApproved,oldRejectedFirstStillRejected:true,byteExactSparseAliases:aliases.length,newStrictClosures:0}))
