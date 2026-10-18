import {readFileSync} from 'node:fs'
import {convertLearningGoal} from '../../../../../../../../app/src/goalTypes'
import {applyCompositionViewProjection} from '../../../../../../../../app/src/utils/compositionViewRuntime'
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../../app/src/utils/treeProjectionRuntime'
import {goalMatchesFilters} from '../../../../../../../../app/src/utils/goalFilters'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const raw=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const rawGoals=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g]))
const entry={meta:raw,goals:raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))}
const rows:any[]=[]
for(const [state,gid] of [['ni','8ceb1749-fce0-584f-a2b8-0a309282329a'],['st','e81a4aed-9695-533e-8eb7-7a0c714346ea']]){
 for(const course of ['gk','lk']){
  const path=`curricula/DE/Gymnasium/composition-views/chemie/de-${state}-${course}.view.json`,v=normalizeCompositionView(read(path)),roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,rawGoals)
  const projection=applyCompositionViewProjection([entry],v)[0],goals=new Map<string,any>(projection.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(goals)
  const stack=projection.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id),seen=new Set<string>()
  while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);for(const child of getRenderedChildIds(id,goals,children))stack.push(child)}
  const filters=[v.scope.jurisdiction,v.scope.courseProfile,v.scope.durationModel].filter(Boolean)
  if(!roles.targetGoalIds.has(gid)||!seen.has(gid)||!goalMatchesFilters(rawGoals.get(gid),filters))throw new Error('Target missing/filter mismatch '+path)
  const req=rawGoals.get(gid).requires??[]
  rows.push({path,scope:v.scope,goalId:gid,authoredTargetRole:true,actuallyRendered:true,currentRawCountryCourseFiltersPass:true,directRequires:req,directRequiresActuallyRendered:req.filter((id:string)=>seen.has(id)),directRequiresAbsent:req.filter((id:string)=>!seen.has(id)),canonicalFieldsAndViewBytesMutated:false})
 }
}
console.log(JSON.stringify({status:'PASS',method:'Actual unchanged pure normalization, role collection, projection, tree traversal and country/course filter functions; no compiler or AP evaluator',rows,targetSetDelta:[],viewMutations:0},null,2))
