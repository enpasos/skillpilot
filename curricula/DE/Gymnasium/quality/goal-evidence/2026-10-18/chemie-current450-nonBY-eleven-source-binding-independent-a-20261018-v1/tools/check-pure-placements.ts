import {readFileSync} from 'node:fs'
import {convertLearningGoal} from '../../../../../../../../app/src/goalTypes'
import {applyCompositionViewProjection} from '../../../../../../../../app/src/utils/compositionViewRuntime'
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../../app/src/utils/treeProjectionRuntime'
import {goalMatchesFilters} from '../../../../../../../../app/src/utils/goalFilters'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const B='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-nonBY-eleven-source-binding-author-20261018-v1/'
const raw=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const rawGoals=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g]))
const entry={meta:raw,goals:raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))}
const sorted=(x:Iterable<string>)=>[...x].sort()
function sets(view:any){
 const v=normalizeCompositionView(view),roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,rawGoals)
 const projected=applyCompositionViewProjection([entry],v)[0],goals=new Map<string,any>(projected.goals.map((g:any)=>[g.id,g]))
 const children=buildDirectChildrenMap(goals),stack=projected.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id),seen=new Set<string>()
 while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);for(const child of getRenderedChildIds(id,goals,children))stack.push(child)}
 const leaves=sorted([...seen].filter(id=>rawGoals.has(id)&&!(rawGoals.get(id).contains?.length)))
 const filters=[v.scope.jurisdiction,v.scope.courseProfile,v.scope.durationModel].filter(Boolean)
 return {viewId:v.viewId,scope:v.scope,explicitTargetIds:sorted(roles.targetGoalIds),prerequisiteOnlyIds:sorted(roles.prerequisiteOnlyGoalIds),renderedCanonicalLeafIds:leaves,rawStateCourseMatchingLeafIds:leaves.filter(id=>goalMatchesFilters(rawGoals.get(id),filters)),renderedCanonicalIds:sorted([...seen].filter(id=>rawGoals.has(id)))}
}
const patch=read(B+'PATCH.four-view-five-target-additions.pending.json'),out:any[]=[]
for(const pair of patch.wholeCandidateViews){
 const before=sets(read(pair.normalBefore.path)),after=sets(read(pair.candidateAfter.path));const added=after.renderedCanonicalLeafIds.filter(id=>!before.renderedCanonicalLeafIds.includes(id)),removed=before.renderedCanonicalLeafIds.filter(id=>!after.renderedCanonicalLeafIds.includes(id));
 const authored=patch.patches.filter((p:any)=>p.viewId===after.viewId).map((p:any)=>p.value.goalId).sort()
 if(JSON.stringify(added)!==JSON.stringify(authored)||removed.length||JSON.stringify(before.scope)!==JSON.stringify(after.scope))throw new Error('Unexpected delta '+after.viewId)
 if(!added.every(id=>after.rawStateCourseMatchingLeafIds.includes(id)))throw new Error('Added target fails raw state/course filters')
 const prerequisiteLeafChecks=added.map(id=>({goalId:id,requires:rawGoals.get(id).requires??[],directPrerequisitesAlreadyRendered:(rawGoals.get(id).requires??[]).filter((r:string)=>after.renderedCanonicalIds.includes(r)),directPrerequisitesNotRendered:(rawGoals.get(id).requires??[]).filter((r:string)=>!after.renderedCanonicalIds.includes(r))}))
 out.push({normalBefore:pair.normalBefore,candidateAfter:pair.candidateAfter,before,after,added,removed,prerequisiteLeafChecks})
}
const existing:any[]=[]
for(const [state,gid]of [['he','0e3f849b-133d-57da-882c-0d67c3eb05b8'],['hh','95dc0ee5-a0af-5682-af32-d66e36fbeb50'],['st','e81a4aed-9695-533e-8eb7-7a0c714346ea']]){
 for(const name of state==='he'?['de-he-gk.view.json','de-he-lk.view.json','de-he-sekii-gk.view.json','de-he-sekii-lk.view.json']:[`de-${state}-gk.view.json`,`de-${state}-lk.view.json`]){
  const p='curricula/DE/Gymnasium/composition-views/chemie/'+name,s=sets(read(p));const target=s.explicitTargetIds.includes(gid),rendered=s.renderedCanonicalLeafIds.includes(gid);const expected=state!=='he'||s.scope.courseProfile==='LK';if(target!==expected||rendered!==expected)throw new Error('Unexpected unchanged placement '+p)
  existing.push({path:p,goalId:gid,scope:s.scope,explicitTargetRole:target,actuallyRenderedByPureProjection:rendered,rawStateCourseFilterPass:s.rawStateCourseMatchingLeafIds.includes(gid),sourceBoundary:state==='he'?'HE-LK only; global GK tag does not create a HE-GK view target':'Existing technical CrossStage GK/LK target, no official SekI course label'})
 }
}
console.log(JSON.stringify({artifactRole:'Independent actual pure runtime and authored placement check, not compiler/AP or new scientific gate',status:'PASS',addedStateCourseTuples:out.reduce((n,r)=>n+r.added.length,0),oldTargetLoss:0,rows:out,unchangedExistingPlacements:existing,normalWrites:0,compilerRuns:0,APRuns:0},null,2))
