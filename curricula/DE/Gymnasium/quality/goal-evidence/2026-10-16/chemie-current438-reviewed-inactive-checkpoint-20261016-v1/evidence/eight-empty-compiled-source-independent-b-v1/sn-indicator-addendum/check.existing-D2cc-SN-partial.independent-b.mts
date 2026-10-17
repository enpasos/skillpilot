// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
const T='tmp/chemie-m7-resumed-20261016',O=`${T}/eight-empty-compiled-source-independent-b-v1/sn-indicator-addendum`,A=`${T}/SN-indicator-existing-d2cc-source-carrier-author-addendum-v1`
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const first=`${O}/FIRST.existing-D2cc-SN-partial.independent-b.science.json`;assert.equal(sha(first),'sha256:7759de5260e29f11286c0cbfdea4475ab1cf4f7f0b72e69bf95e58b52489b5d6')
const sp=`${A}/OUTPUTS.SN-existing-indicator-carrier-addendum.AUTHOR.selector.json`;assert.equal(sha(sp),'sha256:a6f1e458bcbfb0a325642d53c768acba48ede223e93e322c66092f24abd4098f')
const s=read(sp),cas=read(s.guardedCAS.path),pairs=read(s.wholeCellPairs.path),input=read(s.actualInputs.path),K=resolve(`${T}/chemie-combined639-two-GK-priors-final-review-capsule-v1`)
const l=read(cas.baselineCanonical.path),by=new Map<string,any>(l.goals.map((g:any)=>[g.id,g]));assert.equal(sha(cas.baselineCanonical.path),cas.baselineCanonical.sha256)
assert.deepEqual(by.get(input.wholeGoal.id),input.wholeGoal);assert.deepEqual(by.get(input.wholeDirectPrerequisite.id),input.wholeDirectPrerequisite)
assert.equal(sha(input.positiveProfileInput.path),input.positiveProfileInput.sha256);assert.deepEqual(JSON.parse(readFileSync(input.positiveProfileInput.path,'utf8').trim()),input.wholePositiveEvidenceProfile)
const source=read(input.SNSourceInput.path);assert.deepEqual(source.sourceGoals.find((x:any)=>x.id===pairs.sourceGoalId),pairs.wholeSourceCell)
const fileChecks=[]
for(const op of cas.fileOperations){
 assert.equal(sha(op.before.path),op.before.sha256);assert.equal(sha(op.after.path),op.after.sha256)
 const b=read(op.before.path),a=read(op.after.path),pair=pairs.pairs.find((p:any)=>p.logicalPath===op.logicalPath),id=op.selectedSourceGoalId
 const bm=b.mappings.filter((r:any)=>r.legacyGoalId===id),am=a.mappings.filter((r:any)=>r.legacyGoalId===id)
 assert.deepEqual(bm,pair.beforeWholeSelectedMappings);assert.deepEqual(am,pair.afterWholeSelectedMappings)
 const added=am.filter((r:any)=>r.canonicalGoalId===input.wholeGoal.id);assert.equal(added.length,1);assert.equal(added[0].matchType,'partial')
 assert.deepEqual(am.filter((r:any)=>r.canonicalGoalId!==input.wholeGoal.id),bm)
 assert.deepEqual(a.mappings.filter((r:any)=>r.legacyGoalId!==id),b.mappings.filter((r:any)=>r.legacyGoalId!==id))
 const e=structuredClone(b);e.mappings=a.mappings
 if(e.decisions){const d=e.decisions.find((r:any)=>r.sourceGoalId===id),ad=a.decisions.find((r:any)=>r.sourceGoalId===id);assert.equal(ad.wholeSourceUnionApproved,false);assert.equal(ad.authorOnly,true);d.canonicalGoalIds=ad.canonicalGoalIds;d.rationale=ad.rationale}
 assert.deepEqual(a,e);fileChecks.push({logicalPath:op.logicalPath,exactOldFivePartnersAndE5:true,oneAdditionalExistingPartialEdge:true,allOtherWholeRowsFieldsExact:true})
}
const {collectCompositionProjectionRoleGoalIds:roles}=await import(`${K}/app/src/utils/authoring/compositionViewAuthoring.ts`)
const {convertLearningGoal}=await import(`${K}/app/src/goalTypes.ts`),{goalMatchesFilters}=await import(`${K}/app/src/utils/goalFilters.ts`)
const viewChecks=[]
for(const name of ['de-sn-gk.view.json','de-sn-lk.view.json']){
 const path=`${K}/curricula/DE/Gymnasium/composition-views/chemie/${name}`,v=read(path),r=roles(v.rootNodes,by)
 assert.ok(r.targetGoalIds.has(input.wholeGoal.id));assert.ok(goalMatchesFilters(convertLearningGoal(input.wholeGoal,{landscapeId:l.landscapeId}),[v.scope.courseProfile,v.scope.jurisdiction]))
 const prerequisiteRole=r.targetGoalIds.has(input.wholeDirectPrerequisite.id)?'target':r.prerequisiteOnlyGoalIds.has(input.wholeDirectPrerequisite.id)?'prerequisiteOnly':'missing';assert.notEqual(prerequisiteRole,'missing')
 viewChecks.push({path,sha256:sha(path),scope:v.scope,D2ccAlreadyActualTarget:true,actualPreparationPrerequisiteRole:prerequisiteRole,viewChange:false})
}
const result={role:'Actual own bounded checks after scientificFIRST; no globalcompiler/P/M/D run',scienceFIRST:{path:first,sha256:sha(first)},fileChecks,viewChecks,wholeD2ccPrerequisitePAndSourceExact:true,counts:{wholeMappingFiles:2,addedExistingPartialEdges:2,newViews:0,newOrdinary:0},decision:'KEEP',wholeExperimentalExecutionApproved:false,wholeCompositeUnionApproved:false,HumanApproval:false,HumanTrial:false,M7Claim:false,authorWrites:false,normalWrites:false}
writeFileSync(`${O}/CHECK.actual-two-SN-files-whole-input-and-existing-two-targets.independent-b.json`,JSON.stringify(result,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({files:2,additionalPartialEdges:2,existingSNTargets:2,viewChanges:0,decision:'KEEP'}))
