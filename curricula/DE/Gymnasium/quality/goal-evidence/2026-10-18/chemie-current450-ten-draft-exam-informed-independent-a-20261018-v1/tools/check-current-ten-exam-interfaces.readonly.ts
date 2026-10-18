// SPDX-License-Identifier: Apache-2.0
import {readFileSync,readdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {convertLearningGoal} from '../../../../../../../../app/src/goalTypes'
import {applyCompositionViewProjection} from '../../../../../../../../app/src/utils/compositionViewRuntime'
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../../app/src/utils/treeProjectionRuntime'
import {goalMatchesFilters} from '../../../../../../../../app/src/utils/goalFilters'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),pin=(p:string)=>{const b=readFileSync(p);return {path:p,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const N='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-ten-draft-exam-neutral-current-inputs-20261018-v1/',input=read(N+'INPUT.ten-whole-current-draft-exam-goals.exact.json')
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',raw=read(canonical),goals=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g])),entry={meta:raw,goals:raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))}
const central=read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'),subject=central.subjects.find((s:any)=>s.subject==='chemie'),ledger=read(subject.semanticKindLedgerPath),atomic=new Set(ledger.decisions.filter((d:any)=>d.decisionStatus==='authoritative'&&d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId))
const base='curricula/DE/Gymnasium/composition-views/chemie/',views:any[]=[]
const parents=new Map<string,string[]>()
for(const g of raw.goals)for(const child of g.contains??[])parents.set(child,[...(parents.get(child)??[]),g.id])
const inherited=(id:string)=>{const seen=new Set<string>(),stack=[...(parents.get(id)??[])],result:string[]=[];while(stack.length){const p=stack.pop()!;if(seen.has(p))continue;seen.add(p);result.push(...(goals.get(p)?.requires??[]));stack.push(...(parents.get(p)??[]))}return result}
function closure(id:string,withParents=false){const seen=new Set<string>(),stack=[...(goals.get(id)?.requires??[]),...(withParents?inherited(id):[])];while(stack.length){const x=stack.pop()!;if(seen.has(x))continue;seen.add(x);stack.push(...(goals.get(x)?.requires??[]),...(goals.get(x)?.contains??[]),...(withParents?inherited(x):[]))}return seen}
for(const file of readdirSync(base).filter((x:string)=>x.endsWith('.view.json'))){
 const path=base+file,v=normalizeCompositionView(read(path));if(!['DE-HE','DE-BY','DE-HB','DE-SH'].includes(v.scope.jurisdiction??''))continue
 const roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,goals),projected=applyCompositionViewProjection([entry],v)[0],byId=new Map<string,any>(projected.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(byId),stack=projected.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id),seen=new Set<string>()
 while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);for(const c of getRenderedChildIds(id,byId,children))stack.push(c)}
 const filters=[v.scope.jurisdiction,v.scope.courseProfile,v.scope.durationModel].filter(Boolean),target=new Set([...roles.targetGoalIds].filter(id=>seen.has(id)&&goalMatchesFilters(goals.get(id),filters)))
 views.push({path,pin:pin(path),viewId:v.viewId,scope:v.scope,roles,seen,filters,target})
}
const records=input.map((g:any)=>{
 assert.deepEqual(goals.get(g.id),g)
 const checks=views.filter(v=>g.applicability.jurisdiction.includes(v.scope.jurisdiction)&&(!v.scope.courseProfile||g.tags.includes(v.scope.courseProfile))).map(v=>({viewId:v.viewId,scope:v.scope,view:v.pin,endpointIsTarget:v.target.has(g.id),endpointPrerequisiteOnly:v.roles.prerequisiteOnlyGoalIds.has(g.id),missingDirectPrerequisiteIds:g.requires.filter((id:string)=>!v.target.has(id)&&!v.roles.prerequisiteOnlyGoalIds.has(id)),coveredIdsNotAvailable:g.examData.coveredGoalIds.filter((id:string)=>!v.target.has(id)&&!v.roles.prerequisiteOnlyGoalIds.has(id))}))
 return {goalId:g.id,wholeCurrentInputEqual:true,directRequires:g.requires,coveredGoalIds:g.examData.coveredGoalIds,maxPoints:g.examData.scoring.maxPoints,passingPoints:g.examData.scoring.passingPoints,scoringStepSum:g.examData.scoring.steps.reduce((n:number,s:any)=>n+s.points,0),currentViews:checks}
})
const admission=[['14577339-9e0c-5b44-8e47-91e1a4947367','GK'],['32705a3a-9b7f-5cc0-ba41-881d13d0c45b','LK']].map(([id,course])=>{
 const g=goals.get(id),v=views.find(v=>v.path===base+'de-he-sekii-'+course.toLowerCase()+'.view.json');assert(v)
 const expected=new Set([...v.target].filter(gid=>atomic.has(gid))),required=new Set<string>(g.requires),prior='805a2f58-29ce-55d0-8a85-42ee486239b3'
 const missing=[...expected].filter(gid=>!required.has(gid)),literal=closure(id),effective=closure(id,true)
 return {goalId:id,course,actualView:v.pin,currentCourseTargetCount:expected.size,directAdmissionCount:required.size,missingCurrentCourseTargetIds:missing,missingEvenInLiteralRequiresContainsClosure:missing.filter(gid=>!literal.has(gid)),missingEvenWithCanonicalAncestorRequires:missing.filter(gid=>!effective.has(gid)),missingTargetCurrentSemantics:missing.map(gid=>{const g=goals.get(gid);return {id:gid,title:g.title,description:g.description,descriptionEn:g.descriptionEn,tags:g.tags,type:g.type,requires:g.requires}}),extraOutsideCurrentCourseTargetIds:[...required].filter(gid=>!expected.has(gid)),retainedPriorLabSafety805:required.has(prior),admissionExactlyCurrentCourseTargetsPlus805:required.size===expected.size+1&&required.has(prior)&&[...expected].every(gid=>required.has(gid)),minimalAdditiveRemedy:{appendOnlyRequiredGoalIds:missing,resultingDirectCount:required.size+missing.length,removeRequiredGoalIds:[],changedTasksSolutionsScoringOrAssessedIds:false,addedLiteralEdgesAcyclic:missing.every(gid=>!closure(gid).has(id))},directlyAssessedCount:g.examData.coveredGoalIds.length,assessedCoverageIsNotAdmissionCoverage:true}
})
console.log(JSON.stringify({status:'ACTUAL_FINITE_DIAGNOSTIC_COMPLETE_NOT_A_RELEASE_DECISION',method:'Actual pure role/projection/rendered-tree/course filter for only ten current exams and two precise HE admission sets; no AP/compiler/global build',canonical:pin(canonical),wholeInput:pin(N+'INPUT.ten-whole-current-draft-exam-goals.exact.json'),semanticKindLedger:pin(subject.semanticKindLedgerPath),records,HEAdmission:admission,normalWrites:0,newScienceFromThisMechanicalCheck:false},null,2))
