// SPDX-License-Identifier: Apache-2.0
// Interface authoring plus finite original-stock projection facts, not independent science approval.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { convertLearningGoal } from '../../../../../../../../app/src/goalTypes'
import { applyCompositionViewProjection } from '../../../../../../../../app/src/utils/compositionViewRuntime'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { buildDirectChildrenMap, getRenderedChildIds } from '../../../../../../../../app/src/utils/treeProjectionRuntime'
import { goalMatchesFilters } from '../../../../../../../../app/src/utils/goalFilters'

const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18'
const out=`${base}/chemie-current450-T2-terminal-exams-interface-author-20261018-v6`
const v5=`${base}/chemie-current450-T2-terminal-exams-author-20261018-v5`
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const write=(p:string,v:any)=>writeFileSync(`${out}/${p}`,JSON.stringify(v,null,2)+'\n')
const pin=(path:string)=>{const raw=readFileSync(path);return {path,sha256:createHash('sha256').update(raw).digest('hex'),bytes:raw.length}}
const graphPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const original=read(graphPath)
const oldById=new Map<string,any>(original.goals.map((g:any)=>[g.id,g]))
const originalGoals=read(`${v5}/AUTHOR.new-goals.full.draft.json`).newGoals
const goals=structuredClone(originalGoals)
const ordinaryAdds=new Set(['0559cec7-330b-57f1-a409-31cf1b4ac9fb','ee78e2c9-45c9-5023-8193-7e9c20bce0a6','4a7dee38-1056-5e27-acec-e6a12f58109f'])
const specialEnds=new Set(['036701ad-a62f-5c91-bb68-9abc00802efb','f08ce862-1448-54cc-928a-ec54040bd63f','e883c5e9-5634-5a46-a013-15d5a684c5cd'])
// Explicit author phase choices, checked against all 24 actual ordinary metadata objects.
const q2=new Set(['04b62be5','036701ad','fbd8d2c6','dab7b908','8c4bd771','990b6704','f08ce862','fc403749','994068b1','02889be3','9fea3d6f','3d5bd844','4cbc2b02'])
const phaseInventory=goals.map((g:any)=>{
 assert(!oldById.has(g.id),'Candidate endpoint already in normal graph')
 const assessed=g.examData.coveredGoalIds.map((id:string)=>{
  const o=oldById.get(id);assert(o);return {goalId:id,title:o.title,phase:o.phase??null,dimensionPhase:o.dimensionTags?.phase??null,excluded:o.extendedData?.applicabilityProjection==='excluded'}
 })
 const choice=q2.has(g.id.slice(0,8))?'Q2':g.id.startsWith('8a281a5b')?'E':'GLOBAL'
 assert(assessed.every((x:any)=>(x.phase??x.dimensionPhase)===choice))
 assert(assessed.every((x:any)=>!x.excluded))
 const before={phase:g.phase,dimensionPhase:g.dimensionTags?.phase}
 g.phase=choice;g.dimensionTags.phase=choice
 if(specialEnds.has(g.id)){
  g.extendedData.terminalRouteCandidate.integrationHolds=['EXACT_NEW_ORDINARY_SOURCE_AND_SCOPE_INTERFACE_PENDING_INDEPENDENT_REVIEW']
  g.extendedData.terminalRouteCandidate.sourceAndScopeInterfaceCandidate={authorPackage:out,officialOptionalityPreserved:true,actualLearnerChoiceClaimed:false,newWholeSourceApprovalClaimed:false,reviewStatus:'author_candidate_pending_independent_scope_phase_role_and_selected_source_interface_review'}
 }
 return {endpointId:g.id,assessedOrdinaryGoals:assessed,beforeEndpointPhase:before,proposedEndpointPhase:{phase:choice,dimensionPhase:choice},rationale:choice==='GLOBAL'?'All assessed ordinary goals have GLOBAL metadata. Retain this cross-phase material exercise scope; it is not an Abitur endpoint.':`Every assessed ordinary goal has the unique phase ${choice}; use this local phase in both endpoint fields and its exercise placement.`,excludedCanonicalOnly:false}
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
function find(nodes:any[],id:string):any{for(const n of nodes){if(n.id===id)return n;const r=find(n.children??[],id);if(r)return r}}
const five=`${base}/chemie-current450-five-terminal-target-placements-author-20261018-v1`
const sparse=read(`${five}/AUTHOR.sparse-view-append-operations.pending.json`).operations.filter((r:any)=>r.sourceScope!=='SN')
const changes:any[]=[],checks:any[]=[]
const expectedByEndpoint=new Map(goals.map((g:any)=>[g.id,[] as string[]]))
for(const path of paths){
 const before=read(path),beforeProjection=project(original,before)
 const proposed=structuredClone(before)
 const sourceOperations=sparse.filter((r:any)=>r.viewPath===path),ordinaryInserted:string[]=[],appliedOperations:any[]=[]
 for(const op of sourceOperations){
  const parent=find(proposed.rootNodes,op.parentStructureId);assert(parent)
  const children=structuredClone(op.appendChildren)
  for(const folder of children)for(const child of folder.children){child.projectionRole='target';if(ordinaryAdds.has(child.goalId)){assert(!beforeProjection.targets.has(child.goalId));ordinaryInserted.push(child.goalId)}}
  parent.children.push(...children);appliedOperations.push({parentStructureId:op.parentStructureId,appendChildren:children,sourceScope:op.sourceScope})
 }
 const afterOrdinary=project(candidate,proposed)
 const chosen=goals.filter((g:any)=>g.requires.every((id:string)=>afterOrdinary.targets.has(id)))
 const generic=chosen.filter((g:any)=>!specialEnds.has(g.id))
 if(generic.length){
  assert.equal(proposed.rootNodes[0].kind,'structure')
  const groupId=`${before.viewId}-t2-material-practice-20261018-v6`
  const phaseOrder=['E','Q2','GLOBAL']
  const children=phaseOrder.flatMap(phase=>{
   const local=generic.filter((g:any)=>g.phase===phase)
   if(!local.length)return []
   return [{kind:'structure',id:`${groupId}-${phase.toLowerCase()}`,label:phase==='GLOBAL'?'Phasenübergreifende Übungen':`Übungen ${phase}`,
    children:local.map((g:any)=>({kind:'goalEntry',goalId:g.id,projectionRole:'target'}))}]
  })
  proposed.rootNodes[0].children.push({kind:'structure',id:groupId,label:'Eigenständige Materialaufgaben',children})
  appliedOperations.push({parentStructureId:proposed.rootNodes[0].id,appendChildren:[proposed.rootNodes[0].children.at(-1)]})
 }
 if(appliedOperations.length)changes.push({path,beforeFilePin:pin(path),operations:appliedOperations,beforeWholeView:before,candidateWholeView:proposed})
 const afterProjection=project(candidate,proposed)
 const oldTargetsAfter=new Set([...afterProjection.targets].filter(id=>oldById.has(id)&&!ordinaryInserted.includes(id)))
 const oldRawTargetsAfter=new Set([...afterProjection.roles.targetGoalIds].filter(id=>oldById.has(id)&&!ordinaryInserted.includes(id)))
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
 const excluded=original.goals.filter((g:any)=>g.extendedData?.applicabilityProjection==='excluded').map((g:any)=>g.id)
 assert(excluded.every((id:string)=>beforeProjection.targets.has(id)===afterProjection.targets.has(id)&&beforeProjection.seen.has(id)===afterProjection.seen.has(id)),'Existing excluded boundaries changed')
 for(const id of actualNew)expectedByEndpoint.get(id)!.push(path)
 const beforeErrors=compileCompositionView(before,original).findings.filter(x=>x.severity==='error')
 const afterErrors=compileCompositionView(proposed,candidate).findings.filter(x=>x.severity==='error')
 assert.equal(afterErrors.length,0)
 checks.push({path,beforeFilePin:pin(path),scope:before.scope,insertedEndpointIds:wanted,
  beforeTargetCount:beforeProjection.targets.size,afterTargetCount:afterProjection.targets.size,
  oldFilteredTargetsEqual:true,oldRawTargetRolesEqual:true,oldPrerequisiteOnlyRolesEqual:true,oldTargetParentsEqual:true,allOldRenderedNodeParentsEqual:true,
  insertedOrdinaryIds:ordinaryInserted,existingExcludedBoundariesUnchanged:true,
  beforeErrors,afterErrors})
}
const endpointContexts=goals.map((g:any)=>{
 const actual=expectedByEndpoint.get(g.id)!
 assert(actual.length>0,'New endpoint has no actual target offer')
 const before=originalGoals.find((x:any)=>x.id===g.id)
 assert.deepEqual(g.examData,before.examData)
 return {endpointId:g.id,requires:g.requires,coveredGoalIds:g.examData.coveredGoalIds,proposedTargetViews:actual,
  exactActualCandidateAllRequiredTargetEligibility:true,originalFrozenViewInventoryUsedAsOracle:false,examDataWholeUnchanged:true,excludedCanonicalOnly:false,sourceInterfacePendingIndependentReview:specialEnds.has(g.id)}
})
const changedWholeGoals=goals.filter((g:any)=>JSON.stringify(g)!==JSON.stringify(originalGoals.find((o:any)=>o.id===g.id))).map((g:any)=>({goalId:g.id,beforeWholeGoal:originalGoals.find((o:any)=>o.id===g.id),candidateWholeGoal:g}))
write('AUTHOR.new-goals.full.draft.json',{artifactRole:'INTERFACE_AUTHOR_V6_PENDING_INDEPENDENT_REVIEW_NOT_RELEASE',sourceV5:pin(`${v5}/AUTHOR.new-goals.full.draft.json`),newCurricularAtomicGoals:0,newGoals:goals})
write('AUTHOR.whole-changed-exam-interface-CAS.json',{sourceV5Seal:pin(`${v5}/FREEZE.author.sha256.json`),records:changedWholeGoals,allNineteenWholeExamDataUnchanged:true})
write('AUTHOR.canonical-contains-parent-whole-CAS.json',{canonicalBeforeFilePin:pin(graphPath),parentGoalId:parentId,beforeWholeGoal:parentBefore,candidateWholeGoal:parentAfter,appendContainsGoalIds:goals.map((g:any)=>g.id),ordinaryGoalMutations:[]})
write('AUTHOR.view-whole-CAS.json',{role:'AUTHOR_ONLY_EXPLICIT_SPARSE_VIEW_APPENDS_PENDING_REVIEW',records:changes})
write('AUTHOR.actual-phase-inventory-and-rationale.json',{records:phaseInventory,ordinaryPhasesUnchanged:true,examDataUnchanged:true,globalAbiturBranchesChanged:false})
write('AUTHOR.endpoint-view-and-excluded-interfaces.json',{records:endpointContexts,existingExcludedGoalChanges:[],newOptInFlow:false,newWholeSourceCoverage:false})
write('CHECK.original-stock-in-memory-projections.json',{role:'FINITE_UNMODIFIED_STOCK_FUNCTION_RESULTS_NOT_INDEPENDENT_REVIEW',canonicalBefore:pin(graphPath),
 stockFunctions:['convertLearningGoal','collectCompositionProjectionRoleGoalIds','applyCompositionViewProjection','getRenderedChildIds','goalMatchesFilters','compileCompositionView'],
 viewCount:checks.length,changedViewCount:changes.length,explicitTargetEntryCount:checks.reduce((n,r)=>n+r.insertedEndpointIds.length,0),records:checks,
 allOldTargetRolesAndPrerequisiteOnlyAndParentsPreserved:true,allNineteenExamDataWholeUnchanged:true,existingExcludedBoundariesPreserved:true,newOrdinaryEntryCount:checks.reduce((n,r)=>n+r.insertedOrdinaryIds.length,0),
 newStrictCompletions:0,normalWrites:0})
write('INPUT.original-stock-functions-and-v5-pins.json',{files:[pin(`${v5}/FREEZE.author.sha256.json`),pin(`${v5}/AUTHOR.new-goals.full.draft.json`),pin(graphPath),
 ...['app/src/goalTypes.ts','app/src/utils/compositionViewRuntime.ts','app/src/utils/authoring/compositionViewAuthoring.ts','app/src/utils/treeProjectionRuntime.ts','app/src/utils/goalFilters.ts','AGENTS.md'].map(pin)]})
console.log(JSON.stringify({authorOnly:true,changedGoals:changedWholeGoals.length,viewCount:checks.length,changedViews:changes.length,explicitEntries:checks.reduce((n,r)=>n+r.insertedEndpointIds.length,0),newCurricularAtomicGoals:0,normalWrites:0,sourceV5:pin(`${v5}/AUTHOR.new-goals.full.draft.json`)},null,2))
