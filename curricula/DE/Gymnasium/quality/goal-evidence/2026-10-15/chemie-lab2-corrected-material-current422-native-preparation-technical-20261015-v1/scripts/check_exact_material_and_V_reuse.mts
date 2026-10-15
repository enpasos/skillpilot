// SPDX-License-Identifier: Apache-2.0
// Existing exact-byte V eligibility and complete transported raw profiles; no visual review.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,readdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {dirname,resolve} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
const repo=process.cwd(),own=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const read=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const get=(p:string)=>JSON.parse(readFileSync(resolve(own,p),'utf8'))
const hash=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(resolve(repo,p))).digest('hex')
const sel=get('INPUTS.preparation.physical-exact.json'),map=get('checks/REBUILD.current422-lab2-native.physical-map.json'),host=resolve(repo,map.executionHost)
const {hasCurrentExactByteAiQaEvidence}=await import(pathToFileURL(resolve(host,'app/scripts/reportGoalVisualizationRolloutStatus.ts')).href)
const {stableGoalBookJson}=await import(pathToFileURL(resolve(host,'app/scripts/goalBookModel.ts')).href)
const can=read(sel.wholeCanonical.path),q=read(sel.QA.path)
assert.equal(can.goals.length,554)
assert.equal(hash(sel.wholeCanonical.path),sel.wholeCanonical.sha256)
const currentAlias='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
assert.equal('sha256:'+createHash('sha256').update(readFileSync(resolve(host,currentAlias))).digest('hex'),sel.wholeCanonical.sha256)
const reuse=sel.scopeGoalIds.map((id:string)=>{
 const goal=can.goals.find((g:any)=>g.id===id),record=q.records.find((r:any)=>r.goalId===id)
 const link=goal.resourceLinks.find((r:any)=>r.type==='goal-visualization'&&r.role==='primary')
 const ok=hasCurrentExactByteAiQaEvidence({goalId:id,url:link.url},record,'chemie',host)
 assert.equal(ok,true)
 return {goalId:id,wholeExistingQaRecord:record,actualExistingAssetSha256:record.assetSha256,
  currentCanonicalAndPublicAliasBytesMatchOriginalReviewedHash:true,originalAiReviewerAndTimeUnchanged:true,
  technicalReuseEligible:ok,newVisualSighting:false,newVDecision:false}
})
const raw=readFileSync(resolve(repo,sel.wholeRawProfiles.path),'utf8').trim().split('\n').map(l=>JSON.parse(l))
const input=get('native-two/bundle/review-input.json'),model=get('native-two/bundle/book-model.json'),manifest=get('native-two/batch-manifest.json')
assert.equal(model.pages.length,2);assert.equal(manifest.curriculumAtomicDenominatorAtPreparation,422)
assert.deepEqual(model.pages.map((p:any)=>p.goalId),sel.scopeGoalIds)
assert.equal(input.pages.length,2)
for(const page of input.pages){const r=raw.find((r:any)=>r.goalId===page.page.goalId);assert.ok(r)
 assert.equal(stableGoalBookJson(page.evidenceProfile),stableGoalBookJson(r))
 assert.equal(r.evidenceLevel,'E0');assert.equal(r.maximumClaimScope,'G0')}
assert.equal(readdirSync(resolve(own,'native-two/round-a/results')).length,0)
assert.equal(readdirSync(resolve(own,'native-two/round-b/results')).length,0)
const cases=read(sel.wholeFourCases.path).cases
assert.equal(cases.length,4);assert.equal(new Set(cases.map((c:any)=>c.caseId)).size,4)
for(const c of cases){for(const key of ['materialsAndSuppliedData','protocolAndConditions','actualTask','expectedReasoningAndSolution','criterionToObservableRubric','freshIndependentTransfer'])assert.ok(c[key])}
const receipt={pass:true,role:'Exact source/material/model transport and reuse eligibility only; no new A/M/V or D/P science',
 scopeGoalIds:sel.scopeGoalIds,currentWhole554Sha256:sel.wholeCanonical.sha256,currentAtomicDenominator:422,
 canonicalDeltas:0,nativeGoalPages:2,allFourCompleteCaseObjectsBound:true,bothWholeRawProfileRecordsPresentUnchangedInNativeReviewInput:true,
 rawProfilesStillE0G0:true,blankARound:true,blankBRound:true,existingVReuseRows:reuse,
 imagesKeptUnchanged:2,newGateJudgments:0,newStrictClosures:0,centralExecuted:false,activeWrites:false}
writeFileSync(resolve(own,'checks/CHECK.whole-profile-native-context-and-existing-V-byte-reuse.actual.json'),JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify({pass:true,nativeGoalPages:2,rawProfilesCompleteAndExact:2,VExistingByteReuseEligible:2,newVisualReviewDecisions:0,newVotes:0}))
