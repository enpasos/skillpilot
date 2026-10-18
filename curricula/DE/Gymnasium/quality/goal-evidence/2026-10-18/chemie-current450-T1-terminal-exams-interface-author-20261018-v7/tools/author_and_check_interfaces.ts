// SPDX-License-Identifier: Apache-2.0
// Interface authoring plus finite original-stock projection facts, not independent science approval.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
import { convertLearningGoal } from '../../../../../../../../app/src/goalTypes'
import { applyCompositionViewProjection } from '../../../../../../../../app/src/utils/compositionViewRuntime'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { buildDirectChildrenMap, getRenderedChildIds } from '../../../../../../../../app/src/utils/treeProjectionRuntime'
import { goalMatchesFilters } from '../../../../../../../../app/src/utils/goalFilters'

const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18'
const out=`${base}/chemie-current450-T1-terminal-exams-interface-author-20261018-v7`
const v6=`${base}/chemie-current450-T1-terminal-exams-author-20261018-v6`
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const write=(p:string,v:any)=>writeFileSync(`${out}/${p}`,JSON.stringify(v,null,2)+'\n')
const pin=(path:string)=>{const raw=readFileSync(path);return {path,sha256:createHash('sha256').update(raw).digest('hex'),bytes:raw.length}}
const graphPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const original=read(graphPath)
const oldById=new Map<string,any>(original.goals.map((g:any)=>[g.id,g]))
const originalGoals=read(`${v6}/AUTHOR.new-goals.full.draft.json`).newGoals
const goals=structuredClone(originalGoals)
const interfaces=read(`${v6}/AUTHOR.exam-interfaces-and-scope.json`).interfaces
const grignard='d7abdeb3-5b69-5744-b7fd-8149fd92b0d5',ordinaryGrignard='8edee6b6-9ead-515e-93f5-feada64522b2'
const phaseChoice:Record<string,string>={
 '8b7ac0a3-f893-5a7f-bad0-0b299c7fba6a':'Q1',
 '6303e470-a790-542b-ac6a-17142e14ba16':'Q1',
 'd7abdeb3-5b69-5744-b7fd-8149fd92b0d5':'Q1',
 'b0ebce3a-eeed-5bf6-ae5e-e0cba5628e43':'Q2',
 '71ebedcf-e1ef-52cc-957c-0a81bf479a78':'Q1',
}
assert.equal(oldById.get(ordinaryGrignard).extendedData.applicabilityProjection,'excluded')
const phaseInventory=goals.map((g:any)=>{
 assert(!oldById.has(g.id),'Candidate endpoint already in normal graph')
 const assessed=g.examData.coveredGoalIds.map((id:string)=>{
  const o=oldById.get(id);assert(o);return {goalId:id,title:o.title,phase:o.phase??null,dimensionPhase:o.dimensionTags?.phase??null}
 })
 const choice=phaseChoice[g.id]??'GLOBAL'
 assert(assessed.every((x:any)=>(x.phase??x.dimensionPhase)===choice))
 const before={phase:g.phase,dimensionPhase:g.dimensionTags?.phase}
 g.phase=choice;g.dimensionTags.phase=choice
 if(g.id===grignard){
  assert.equal(g.extendedData.applicabilityProjection,undefined)
  g.extendedData.applicabilityProjection='excluded'
  g.extendedData.terminalRouteCandidate.integrationHolds=['EXCLUDED_CANONICAL_SCOPE_INTERFACE_PENDING_INDEPENDENT_REVIEW']
  g.extendedData.terminalRouteCandidate.excludedOfferBoundary={
   role:'own-voluntary-canonical-practice-only',sameExcludedOrdinaryGoalId:ordinaryGrignard,
   noCurrentDefaultTargetOffer:true,noOptInOrPersistedTopicSelectionCreated:true,
   officialSourceCredit:false,ordinarySourceDispositionUnchanged:true,
   authorInterfacePackage:out,reviewStatus:'author_candidate_pending_independent_scope_phase_role_review',
  }
 }
 return {endpointId:g.id,assessedOrdinaryGoals:assessed,beforeEndpointPhase:before,proposedEndpointPhase:{phase:g.phase,dimensionPhase:g.dimensionTags.phase},
  rationale:choice==='GLOBAL'?'All assessed ordinary canonical phase metadata is GLOBAL; no unique E/Q/year assignment is authored. This is a bounded cross-phase or cross-stage process/material task, not an Abitur/global-final-exam replacement.':`Every assessed ordinary goal has the unique phase ${choice}; use that local phase in both endpoint fields and its learner-facing exercise folder.`,
  excludedCanonicalOnly:g.id===grignard}
})
const parentId='5964272f-e835-5a24-b2b1-c162be6b75cb'
const parentBefore=oldById.get(parentId),parentAfter=structuredClone(parentBefore)
for(const g of goals){assert(!parentAfter.contains.includes(g.id));parentAfter.contains.push(g.id)}
const candidate=structuredClone(original)
candidate.goals=candidate.goals.map((g:any)=>g.id===parentId?parentAfter:g)
candidate.goals.push(...goals)
const make=(r:any)=>({meta:r,goals:r.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:r.landscapeId}))})
function project(r:any,v:any){
 const rawById=new Map<string,any>(r.goals.map((g:any)=>[g.id,g]))
 const roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,rawById)
 const p=applyCompositionViewProjection([make(r)],normalizeCompositionView(v))[0]
 const by=new Map<string,any>(p.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(by)
 const stack=p.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id),seen=new Set<string>()
 while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);stack.push(...getRenderedChildIds(id,by,children))}
 const filters=[v.scope.jurisdiction,v.scope.courseProfile,v.scope.durationModel].filter(Boolean)
 const targets=new Set([...roles.targetGoalIds].filter(id=>seen.has(id)&&goalMatchesFilters(rawById.get(id),filters)))
 const parents=new Map<string,string[]>()
 for(const id of seen){for(const child of getRenderedChildIds(id,by,children)){const ids=parents.get(child)??[];ids.push(id);parents.set(child,ids)}}
 return {roles,targets,parents,seen}
}
const dir='curricula/DE/Gymnasium/composition-views/chemie'
const paths=readdirSync(dir).filter(p=>p.endsWith('.view.json')).sort().map(p=>`${dir}/${p}`)
const same=(a:Set<string>,b:Set<string>)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort())
const changes:any[]=[],checks:any[]=[]
const expectedByEndpoint=new Map(goals.map((g:any)=>[g.id,[] as string[]]))
for(const path of paths){
 const before=read(path),beforeProjection=project(original,before)
 const proposed=structuredClone(before)
 const chosen=goals.filter((g:any)=>g.id!==grignard&&g.requires.every((id:string)=>beforeProjection.targets.has(id)))
 if(chosen.length){
  assert.equal(proposed.rootNodes[0].kind,'structure')
  const groupId=`${before.viewId}-t1-material-practice-20261018-v7`
  const phaseOrder=['Q1','Q2','GLOBAL']
  const children=phaseOrder.flatMap(phase=>{
   const local=chosen.filter((g:any)=>g.phase===phase)
   if(!local.length)return []
   return [{kind:'structure',id:`${groupId}-${phase.toLowerCase()}`,label:phase==='GLOBAL'?'Phasenübergreifende Übungen':`Übungen ${phase}`,
    children:local.map((g:any)=>({kind:'goalEntry',goalId:g.id,projectionRole:'target'}))}]
  })
  proposed.rootNodes[0].children.push({kind:'structure',id:groupId,label:'Eigenständige Materialaufgaben',children})
  changes.push({path,beforeFilePin:pin(path),operation:'append_one_own_practice_structure_to_existing_primary_root',
   parentStructureId:proposed.rootNodes[0].id,appendEndpointIds:chosen.map((g:any)=>g.id),beforeWholeView:before,candidateWholeView:proposed})
 }
 const afterProjection=project(candidate,proposed)
 const oldTargetsAfter=new Set([...afterProjection.targets].filter(id=>oldById.has(id)))
 const oldRawTargetsAfter=new Set([...afterProjection.roles.targetGoalIds].filter(id=>oldById.has(id)))
 const oldSupportAfter=new Set([...afterProjection.roles.prerequisiteOnlyGoalIds].filter(id=>oldById.has(id)))
 const parentDrift=[...beforeProjection.targets].filter(id=>JSON.stringify((beforeProjection.parents.get(id)??[]).sort())!==JSON.stringify((afterProjection.parents.get(id)??[]).sort()))
 const allOldRenderedParentDrift=[...beforeProjection.seen].filter(id=>JSON.stringify((beforeProjection.parents.get(id)??[]).sort())!==JSON.stringify((afterProjection.parents.get(id)??[]).sort()))
 const actualNew=goals.filter((g:any)=>afterProjection.targets.has(g.id)).map((g:any)=>g.id)
 const wanted=chosen.map((g:any)=>g.id)
 assert(same(beforeProjection.targets,oldTargetsAfter),'Old filtered targets drift')
 assert(same(beforeProjection.roles.targetGoalIds,oldRawTargetsAfter),'Old target roles drift')
 assert(same(beforeProjection.roles.prerequisiteOnlyGoalIds,oldSupportAfter),'Old prerequisite-only roles drift')
 assert.equal(parentDrift.length,0,'Old target parents drift')
 assert.equal(allOldRenderedParentDrift.length,0,'Old rendered node parents drift')
 assert.deepEqual(actualNew,wanted,'New target offer differs from actual required-target eligibility')
 assert(!afterProjection.roles.targetGoalIds.has(grignard)&&!afterProjection.seen.has(grignard),'Excluded Grignard leaked into view')
 for(const id of actualNew)expectedByEndpoint.get(id)!.push(path)
 const beforeErrors=compileCompositionView(before,original).findings.filter(x=>x.severity==='error')
 const afterErrors=compileCompositionView(proposed,candidate).findings.filter(x=>x.severity==='error')
 assert.equal(afterErrors.length,0)
 checks.push({path,beforeFilePin:pin(path),scope:before.scope,insertedEndpointIds:wanted,
  beforeTargetCount:beforeProjection.targets.size,afterTargetCount:afterProjection.targets.size,
  oldFilteredTargetsEqual:true,oldRawTargetRolesEqual:true,oldPrerequisiteOnlyRolesEqual:true,oldTargetParentsEqual:true,allOldRenderedNodeParentsEqual:true,
  grignardOrdinaryHasNoTargetBefore:!beforeProjection.targets.has(ordinaryGrignard),grignardEndpointHasNoTargetAfter:!afterProjection.targets.has(grignard),
  beforeErrors,afterErrors})
}
const endpointContexts=goals.map((g:any)=>{
 const input=interfaces.find((r:any)=>r.endpointId===g.id)
 const actual=expectedByEndpoint.get(g.id)!
 assert.deepEqual([...actual].sort(),[...input.currentTargetViewsForAllEndGoals].sort())
 const before=originalGoals.find((x:any)=>x.id===g.id)
 assert.deepEqual(g.examData,before.examData)
 return {endpointId:g.id,requires:g.requires,coveredGoalIds:g.examData.coveredGoalIds,proposedTargetViews:actual,
  exactlyOriginalActuallyFilteredEligibility:true,examDataWholeUnchanged:true,excludedCanonicalOnly:g.id===grignard}
})
const changedWholeGoals=goals.filter((g:any)=>JSON.stringify(g)!==JSON.stringify(originalGoals.find((o:any)=>o.id===g.id))).map((g:any)=>({goalId:g.id,beforeWholeGoal:originalGoals.find((o:any)=>o.id===g.id),candidateWholeGoal:g}))
write('AUTHOR.new-goals.full.draft.json',{artifactRole:'INTERFACE_AUTHOR_V7_NOT_REVIEW_OR_RELEASE',sourceV6:pin(`${v6}/AUTHOR.new-goals.full.draft.json`),newCurricularAtomicGoals:0,newGoals:goals})
write('AUTHOR.whole-changed-exam-interface-CAS.json',{sourceV6Seal:pin(`${v6}/FREEZE.author.sha256.json`),records:changedWholeGoals,allTwelveWholeExamDataUnchanged:true})
write('AUTHOR.canonical-contains-parent-whole-CAS.json',{canonicalBeforeFilePin:pin(graphPath),parentGoalId:parentId,beforeWholeGoal:parentBefore,candidateWholeGoal:parentAfter,appendContainsGoalIds:goals.map((g:any)=>g.id),ordinaryGoalMutations:[]})
write('AUTHOR.view-whole-CAS.json',{role:'AUTHOR_ONLY_EXPLICIT_SPARSE_VIEW_APPENDS_PENDING_REVIEW',records:changes})
write('AUTHOR.actual-phase-inventory-and-rationale.json',{records:phaseInventory,ordinaryPhasesUnchanged:true,examDataUnchanged:true,globalAbiturBranchesChanged:false})
write('AUTHOR.endpoint-view-and-excluded-interfaces.json',{records:endpointContexts,grignardOrdinaryBeforeWholeGoal:oldById.get(ordinaryGrignard),newOptInFlow:false,newSourceCoverage:false})
write('CHECK.original-stock-in-memory-projections.json',{role:'FINITE_UNMODIFIED_STOCK_FUNCTION_RESULTS_NOT_INDEPENDENT_REVIEW',canonicalBefore:pin(graphPath),
 stockFunctions:['convertLearningGoal','collectCompositionProjectionRoleGoalIds','applyCompositionViewProjection','getRenderedChildIds','goalMatchesFilters','compileCompositionView'],
 viewCount:checks.length,changedViewCount:changes.length,explicitTargetEntryCount:checks.reduce((n,r)=>n+r.insertedEndpointIds.length,0),records:checks,
 allOldTargetRolesAndPrerequisiteOnlyAndParentsPreserved:true,allTwelveExamDataWholeUnchanged:true,grignardExcludedFromEveryCurrentView:true,
 newStrictCompletions:0,normalWrites:0})
write('INPUT.original-stock-functions-and-v6-pins.json',{files:[pin(`${v6}/FREEZE.author.sha256.json`),pin(`${v6}/AUTHOR.new-goals.full.draft.json`),pin(graphPath),
 ...['app/src/goalTypes.ts','app/src/utils/compositionViewRuntime.ts','app/src/utils/authoring/compositionViewAuthoring.ts','app/src/utils/treeProjectionRuntime.ts','app/src/utils/goalFilters.ts','AGENTS.md'].map(pin)]})
console.log(JSON.stringify({authorOnly:true,changedGoals:changedWholeGoals.length,viewCount:checks.length,changedViews:changes.length,explicitEntries:checks.reduce((n,r)=>n+r.insertedEndpointIds.length,0),newCurricularAtomicGoals:0,normalWrites:0,sourceV6:pin(`${v6}/AUTHOR.new-goals.full.draft.json`)},null,2))
