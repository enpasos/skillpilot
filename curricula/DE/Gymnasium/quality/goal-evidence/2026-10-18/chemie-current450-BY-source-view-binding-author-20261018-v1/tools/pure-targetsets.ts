import {readFileSync} from 'node:fs'
import {convertLearningGoal} from '../../../../../../../../app/src/goalTypes'
import {applyCompositionViewProjection} from '../../../../../../../../app/src/utils/compositionViewRuntime'
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../../app/src/utils/treeProjectionRuntime'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const pkg='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-BY-source-view-binding-author-20261018-v1/'
const raw=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const rawGoals=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g]))
const input=read(pkg+'INPUTS.finite62-whole-sources-current-goals-and-active-DP-bindings.json')
const matrix=read(pkg+'MATRIX.by62-source-target-closure-and-placement.author.json')
const entry={meta:raw,goals:raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))}
const ordered=(s:Iterable<string>)=>[...s].sort()
const isMemory=(g:any)=>g.nodeKind==='memory'||g.tags?.some((t:string)=>t==='memorization'||t.startsWith('srs-deck:'))
function viewSets(view:any){
 const normalized=normalizeCompositionView(view)
 const roles=collectCompositionProjectionRoleGoalIds(normalized.rootNodes,rawGoals)
 const projected=applyCompositionViewProjection([entry],normalized)[0]
 const goals=new Map(projected.goals.map((g:any)=>[g.id,g]))
 const children=buildDirectChildrenMap(goals)
 const pending=projected.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id)
 const visited=new Set<string>()
 while(pending.length){const id=pending.pop()!;if(visited.has(id))continue;visited.add(id);for(const child of getRenderedChildIds(id,goals,children))pending.push(child)}
 const leaves=ordered([...visited].filter(id=>!id.startsWith('composition:')&&goals.has(id)&&!(goals.get(id)?.contains?.length)))
 const canonicalAtoms=leaves.filter(id=>rawGoals.has(id)&&!(rawGoals.get(id).contains?.length))
 const ordinary=canonicalAtoms.filter(id=>!isMemory(rawGoals.get(id)))
 const memory=canonicalAtoms.filter(id=>isMemory(rawGoals.get(id)))
 return {viewId:normalized.viewId,scope:normalized.scope,explicitTargetGoalIds:ordered(roles.targetGoalIds),prerequisiteOnlyGoalIds:ordered(roles.prerequisiteOnlyGoalIds),runtimeRenderedLeafGoalIds:leaves,ordinaryTargetAtomicGoalIds:ordinary,memoryTargetGoalIds:memory,renderedCanonicalTargetGoalIds:ordered([...visited].filter(id=>!id.startsWith('composition:')&&rawGoals.has(id)))}
}
const beforeRaw=read(input.currentView.path),afterRaw=read(pkg+'candidate/de-by-lk.current-pilot.view.json')
const before=viewSets(beforeRaw),after=viewSets(afterRaw)
const delta=(a:string[],b:string[])=>a.filter(x=>!b.includes(x))
const ordinaryAdded=delta(after.ordinaryTargetAtomicGoalIds,before.ordinaryTargetAtomicGoalIds)
const ordinaryRemoved=delta(before.ordinaryTargetAtomicGoalIds,after.ordinaryTargetAtomicGoalIds)
const memoryAdded=delta(after.memoryTargetGoalIds,before.memoryTargetGoalIds)
const memoryRemoved=delta(before.memoryTargetGoalIds,after.memoryTargetGoalIds)
const rowBindings=matrix.rows.map((r:any)=>({sourceGoalId:r.sourceGoalId,sourceTopic:r.sourceTopic,currentAtomicClosureIds:r.currentTargetAtomicClosureIds,beforeIntersections:r.currentTargetAtomicClosureIds.filter((x:string)=>before.runtimeRenderedLeafGoalIds.includes(x)),afterIntersections:r.currentTargetAtomicClosureIds.filter((x:string)=>after.runtimeRenderedLeafGoalIds.includes(x)),afterEntireCurrentTargetClosureVisible:r.currentTargetAtomicClosureIds.every((x:string)=>after.ordinaryTargetAtomicGoalIds.includes(x))}))
const memoryVisibility=input.currentExistingMDecisionsForSourceClosure.filter((r:any)=>r.status==='memory_required').map((r:any)=>({originGoalId:r.goalId,currentReferencedMemoryGoalIds:r.memoryGoalIds,visibleMemoryGoalsAfter:r.memoryGoalIds.filter((id:string)=>after.memoryTargetGoalIds.includes(id))}))
const newRequires=ordinaryAdded.map(id=>({goalId:id,directPrerequisites:rawGoals.get(id).requires??[],directPrerequisitesNotVisibleInCandidate:(rawGoals.get(id).requires??[]).filter((r:string)=>!after.renderedCanonicalTargetGoalIds.includes(r))})).filter(x=>x.directPrerequisitesNotVisibleInCandidate.length)
function atomicClosure(id:string,seen=new Set<string>()):string[]{
 if(seen.has(id))throw new Error('Unexpected contains cycle '+id)
 const g=rawGoals.get(id);if(!g)throw new Error('Missing prerequisite goal '+id)
 if(!g.contains?.length)return[id]
 const next=new Set(seen);next.add(id)
 return ordered(new Set(g.contains.flatMap((c:string)=>atomicClosure(c,next))))
}
const prerequisiteClusterCoverage=ordered(new Set(newRequires.flatMap(x=>x.directPrerequisitesNotVisibleInCandidate))).map(id=>({prerequisiteGoalId:id,title:rawGoals.get(id).title,atomicClosure:atomicClosure(id),targetAtomsAlreadyPresent:atomicClosure(id).filter(x=>after.ordinaryTargetAtomicGoalIds.includes(x)),targetAtomsAbsent:atomicClosure(id).filter(x=>!after.ordinaryTargetAtomicGoalIds.includes(x)),noRoleOrEdgeInferred:true}))
const uniqueNewAtoms=new Set(input.currentExistingDMetadata.map((x:any)=>x.goalId))
const checked=ordinaryAdded.length===38&&ordinaryAdded.every(x=>uniqueNewAtoms.has(x))&&ordinaryRemoved.length===0&&memoryAdded.length===3&&memoryRemoved.length===0&&rowBindings.length===62&&rowBindings.every((r:any)=>r.beforeIntersections.length===0&&r.afterEntireCurrentTargetClosureVisible)&&memoryVisibility.every((r:any)=>r.visibleMemoryGoalsAfter.length>0)&&JSON.stringify(before.scope)===JSON.stringify(after.scope)
console.log(JSON.stringify({artifactRole:'Actual pure runtime targetset difference of one AUTHOR candidate, no compiler or curriculum-quality gate run',method:'Unchanged applyCompositionViewProjection plus getRenderedChildIds root traversal, matching central source-view traversal; collectCompositionProjectionRoleGoalIds also records exact authored roles.',normalViewPath:input.currentView.path,candidateViewPath:pkg+'candidate/de-by-lk.current-pilot.view.json',before,after,counts:{ordinaryBefore:before.ordinaryTargetAtomicGoalIds.length,ordinaryAfter:after.ordinaryTargetAtomicGoalIds.length,ordinaryAdded:ordinaryAdded.length,ordinaryRemoved:ordinaryRemoved.length,memoryBefore:before.memoryTargetGoalIds.length,memoryAfter:after.memoryTargetGoalIds.length,memoryAdded:memoryAdded.length,memoryRemoved:memoryRemoved.length,reverseRowsBeforeWithoutIntersection:rowBindings.filter((x:any)=>x.beforeIntersections.length===0).length,reverseRowsAfterWithoutIntersection:rowBindings.filter((x:any)=>x.afterIntersections.length===0).length},ordinaryAdded,ordinaryRemoved,memoryAdded,memoryRemoved,sourceRowBindings:rowBindings,existingRequiredMemoryVisibility:memoryVisibility,newOrdinaryDirectPrerequisiteNodeVisibilityGaps:newRequires,prerequisiteClusterAtomicCoverage:prerequisiteClusterCoverage,openPrerequisitePlacementHold:{originGoalId:"f4d5a02d-711b-5a6b-a41d-971359c1f64d",prerequisiteClusterId:"8761cfd2-aa1a-56f1-9272-9cf66ef4b271",unresolvedTargetAtomicIds:atomicClosure("8761cfd2-aa1a-56f1-9272-9cf66ef4b271"),status:"HOLD_AUTHOR_PLACEMENT_REVIEW",meaning:"Existing prerequisite is preserved. The three carbohydrate atoms are not targets of this BY pilot; no prerequisite edge, source credit or target/prerequisiteOnly role is inferred. Independent finite review must decide whether this broader interim target has a usable and faithful prerequisite route before integration."},pureExpectedAssertionsPassed:checked,normalWrites:0,newScientificVotes:0,newD_P_A_M_VVotes:0,interpretationBoundary:'Visibility/intersection is a placement fact only. It neither grants whole official source credit nor closes the explicitly retained scientific/course/optional-choice HOLDs.'},null,2))
process.exitCode=checked?0:1
