// SPDX-License-Identifier: Apache-2.0
import {readFileSync} from 'node:fs'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {convertLearningGoal} from '../../../../../../../../app/src/goalTypes'
import {applyCompositionViewProjection} from '../../../../../../../../app/src/utils/compositionViewRuntime'
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../../app/src/utils/treeProjectionRuntime'
import {goalMatchesFilters} from '../../../../../../../../app/src/utils/goalFilters'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),raw=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),goals=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g])),entry={meta:raw,goals:raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))},results:any[]=[]
for(const [state,gid]of[['sh','4d9defde-d3bc-5c43-83ff-9cf6f2930643'],['sl','6966df95-f125-5ecc-af8e-0442545d9f17']]){
 for(const course of['gk','lk']){const path=`curricula/DE/Gymnasium/composition-views/chemie/de-${state}-${course}.view.json`,bytes=readFileSync(path),v=normalizeCompositionView(JSON.parse(bytes.toString())),roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,goals),projected=applyCompositionViewProjection([entry],v)[0],by=new Map<string,any>(projected.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(by),stack=projected.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id),seen=new Set<string>();while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);for(const c of getRenderedChildIds(id,by,children))stack.push(c)}const target=roles.targetGoalIds.has(gid),rendered=seen.has(gid),filter=goalMatchesFilters(goals.get(gid),[v.scope.jurisdiction,v.scope.courseProfile,v.scope.durationModel].filter(Boolean)),expected=state==='sh'||course==='lk';assert.equal(target&&rendered&&filter,expected);results.push({goalId:gid,viewId:v.viewId,scope:v.scope,view:{path,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length},target,rendered,filter,expected})}
}
console.log(JSON.stringify({status:'PASS',scope:'Only2authorgoals/4actualviews/3targetappearances; no source credit from projection',results,sourceOrViewMutations:0,newPReview:0},null,2))
