import {readFileSync} from 'node:fs'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {convertLearningGoal} from '../../../../../../../../app/src/goalTypes'
import {applyCompositionViewProjection} from '../../../../../../../../app/src/utils/compositionViewRuntime'
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../../app/src/utils/treeProjectionRuntime'
import {goalMatchesFilters} from '../../../../../../../../app/src/utils/goalFilters'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const A='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-BB-BE-two-foundation-placement-author-successor-20261018-v1/'
const author=read(A+'AUTHOR.two-explicit-foundation-target-placements.pending.json'),input=read(A+'INPUT.whole-current-two-foundations-P-M-and-existing-memory-goals.json')
const raw=read(input.canonical.path),canon=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g]))
const entry={meta:raw,goals:raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))}
const memory=readFileSync(input.memoryDecisionFile.path,'utf8').split('\n').filter(Boolean).map(t=>JSON.parse(t))
const ed='edcfc5f0-900d-5819-830f-3b14af2bc369',pk='48115ff7-7aca-5d0b-a9e7-7fc6c78434ef',dc='dc0470f1-0676-5949-a5cc-02783d478406'
const sort=(s:Iterable<string>)=>[...s].sort()
function leaves(id:string,anc=new Set<string>()):string[]{assert(!anc.has(id));const g=canon.get(id);assert(g);return g.contains?.length?[...new Set<string>(g.contains.flatMap((child:string)=>leaves(child,new Set([...anc,id]))))]:[id]}
function prerequisites(id:string,seen=new Set<string>()):string[]{if(seen.has(id))return [];seen.add(id);return [...new Set<string>((canon.get(id).requires??[]).flatMap((r:string)=>leaves(r).flatMap(atom=>[atom,...prerequisites(atom,seen)])))].sort()}
function project(view:any){
 const v=normalizeCompositionView(view),roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,canon),p=applyCompositionViewProjection([entry],v)[0],byId=new Map<string,any>(p.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(byId)
 const stack=p.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id),seen=new Set<string>()
 while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);for(const c of getRenderedChildIds(id,byId,children))stack.push(c)}
 const filters=[v.scope.jurisdiction,v.scope.courseProfile,v.scope.durationModel].filter(Boolean)
 const targets=sort([...seen].filter(id=>canon.has(id)&&!canon.get(id).contains?.length&&roles.targetGoalIds.has(id)&&goalMatchesFilters(canon.get(id),filters)))
 return {viewId:v.viewId,scope:v.scope,targets,allRenderedIds:seen,roles,filters}
}
const rows=author.candidateViews.map((pair:any)=>{
 const before=project(read(pair.normalBefore.path)),original=project(read(pair.originalCandidate.path)),after=project(read(pair.candidateAfter.path))
 assert.deepEqual(before.scope,after.scope)
 const added=after.targets.filter(id=>!before.targets.includes(id)),removed=before.targets.filter(id=>!after.targets.includes(id)),successorOnly=after.targets.filter(id=>!original.targets.includes(id))
 assert.equal(removed.length,0)
 const expectedAdded=after.scope.jurisdiction==='DE-BW'?(after.scope.courseProfile==='LK'?[dc,'3be2d0b7-c22f-57d4-886a-10fc04a629f5']:['3be2d0b7-c22f-57d4-886a-10fc04a629f5']):[dc,ed]
 assert.deepEqual(added.sort(),expectedAdded.sort())
 assert.deepEqual(successorOnly,after.scope.jurisdiction==='DE-BW'?[]:[ed])
 const requiresChecks=added.map(id=>({goalId:id,directRequires:canon.get(id).requires??[],directPrerequisiteAtoms:[...new Set<string>((canon.get(id).requires??[]).flatMap((r:string)=>leaves(r)))].sort(),missingDirectAtoms:(canon.get(id).requires??[]).flatMap((r:string)=>leaves(r).filter(atom=>!after.targets.includes(atom)))}))
 assert(!requiresChecks.some(r=>r.missingDirectAtoms.length))
 const mm=memory.filter((m:any)=>added.includes(m.goalId)&&m.status==='memory_required').map((m:any)=>({goalId:m.goalId,referencedMemoryGoalIds:m.memoryGoalIds,visibleReferencedMemoryGoalIds:m.memoryGoalIds.filter((id:string)=>after.targets.includes(id))}))
 assert(mm.every((m:any)=>m.visibleReferencedMemoryGoalIds.length>=1))
 let wholeFoundationRoute:any=null
 if(after.scope.jurisdiction!=='DE-BW'){
  const tr=prerequisites(ed);const missing=tr.filter(id=>!after.targets.includes(id));assert.equal(missing.length,0)
  assert(before.targets.includes(pk)&&!before.targets.includes(ed)&&after.targets.includes(ed)&&canon.get(dc).requires.includes(ed)&&canon.get(ed).requires.includes(pk))
  wholeFoundationRoute={dependentGoalId:dc,newFoundationGoalId:ed,alreadyTargetedFoundationGoalId:pk,wholeTransitivePrerequisiteAtomicIds:tr,missingTransitiveAtoms:missing,explicitTargetRole:after.roles.targetGoalIds.has(ed),prerequisiteOnlyRole:after.roles.prerequisiteOnlyGoalIds.has(ed),stateAndCourseFilterPass:goalMatchesFilters(canon.get(ed),after.filters)}
 }
 return {viewId:after.viewId,scope:after.scope,normalBefore:pair.normalBefore,candidateAfter:pair.candidateAfter,beforeTargetCount:before.targets.length,afterTargetCount:after.targets.length,added,removed,successorOnlyDelta:successorOnly,directRequiresChecks:requiresChecks,wholeFoundationRoute,memoryRequiredAddedGoals:mm}
})
assert.equal(rows.reduce((n:any,r:any)=>n+r.added.length,0),7)
console.log(JSON.stringify({status:'PASS',method:'Independent unchanged pure normalization/roles/projection/tree/country-course filters and explicit finite atomic requires closures; no compiler/AP/build',counts:{views:4,totalTargetTuplesAdded:7,successorOnlyAdded:2,removed:0,missingNewDirectPrerequisites:0,missingFoundationTransitivePrerequisites:0},rows},null,2))
