// SPDX-License-Identifier: Apache-2.0
// Read-only normal scope computation and exact-ID preservation; no review grant.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,renameSync} from 'node:fs'
import {resolve} from 'node:path'
import {buildGoalBookSourceAtlasInputs} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import {stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
const P='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-q1-four-risk-ethics-current-native-technical-author-20261010-v1'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const a=read(`${P}/sources/current-operative-atlas-config.exact.json`),b=read(`${P}/sources/whole394-current-candidate-operative-atlas.normal.config.json`)
const before=buildGoalBookSourceAtlasInputs(a,resolve('.')),after=buildGoalBookSourceAtlasInputs(b,resolve('.'))
assert.deepEqual(before.receipt.counts,after.receipt.counts)
assert.deepEqual(before.receipt.scopes.map((s:any)=>[s.key,s.goalIds,s.witnesses]),after.receipt.scopes.map((s:any)=>[s.key,s.goalIds,s.witnesses]))
const ids=read(`${P}/inputs/current323-exact-strict-ID-gain-and-protected-subjects.exact.json`).subjects.find((s:any)=>s.subject==='biologie').strictCompleteGoalIds
assert.equal(ids.length,323)
const old=read(`${P}/checks/actual-whole394-four-resource-P-and-protected315-plus-eight-delta.json`)
assert.deepEqual([...old.protectedComparisonUnion323IDs].sort(),[...ids].sort())
assert.ok(!ids.some((id:string)=>old.changedWholePageIds.includes(id)||old.goalDeltaIds.includes(id)))
const goalsBefore=read(`${P}/inputs/whole479-title-methyl-eight-current.exact.json`),goalsAfter=read(`${P}/candidate/whole479-current-twelve-raster-links.inactive.json`)
const pagesBefore=read(`${P}/native/before394-current-four.normal-model.json`),pagesAfter=read(`${P}/native/after394-current-four.normal-model.json`)
for(const id of ids){
 assert.equal(stableGoalBookJson(goalsBefore.goals.find((g:any)=>g.id===id)),stableGoalBookJson(goalsAfter.goals.find((g:any)=>g.id===id)))
 assert.equal(stableGoalBookJson(pagesBefore.pages.find((g:any)=>g.goalId===id)),stableGoalBookJson(pagesAfter.pages.find((g:any)=>g.goalId===id)))
}
const ownGoals=read(`${P}/inputs/final-four-raster-bindings.exact.json`).goalIds
const fourScopes=after.receipt.scopes.map((s:any)=>({...s,goalIds:s.goalIds.filter((id:string)=>ownGoals.includes(id)),witnesses:s.witnesses.filter((w:any)=>ownGoals.includes(w.goalId))})).filter((s:any)=>s.goalIds.length)
const proof={schemaVersion:1,checkedAt:new Date().toISOString(),normalAPIs:['buildGoalBookSourceAtlasInputs','stableGoalBookJson'],ordinarySourceScopeComputationsInMemoryOnly:2,activeWhole394AndCandidateWhole394SourceCountsExact:before.receipt.counts,allCurrentScopeGoalSetsAndScientificWitnessesExact:true,all323CurrentStrictWholeGoalAndPageBodiesExact:true,protected323CurrentStrictIds:ids,changedCurrentStrictGoalOrPageIds:[],currentFourWholeEffectiveSourceScopes:fourScopes,currentHE144Source8229IsOnlyBoundedAuthoredPartialContribution:true,whole16OriginalSourceDutyFrameRetainedAsExactHistory:true,sourceLegalAndCourseHoldsClosedByThisAuthor:false,newScientificReviewClaim:false,wholeSourceApproval:false,humanApproval:false,strictGain:0,activeWrites:false}
const scratch='tmp/m7-resumption-20261010/biologie-four-native-technical/323-protection-proof.atomic-stage.json'
writeFileSync(scratch,JSON.stringify(proof,null,2)+'\n');renameSync(scratch,`${P}/checks/actual-current-source-scope-and-protected323.normal.json`)
console.log(JSON.stringify({actual323WholeGoalsAndPagesExact:true,actualCurrentWhole394SourceScopesExact:true,fourSourceScopeCount:fourScopes.length,counts:before.receipt.counts,strictGain:0},null,2))
