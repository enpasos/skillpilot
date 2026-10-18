// SPDX-License-Identifier: Apache-2.0
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {convertLearningGoal} from '../../../../../../../../app/src/goalTypes'
import {applyCompositionViewProjection} from '../../../../../../../../app/src/utils/compositionViewRuntime'
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../../app/src/utils/treeProjectionRuntime'
import {goalMatchesFilters} from '../../../../../../../../app/src/utils/goalFilters'
const O='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-SN-four-held-process-source-author-successor-20261018-v1/'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),raw=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),inputs=read(O+'INPUT.four-whole-actual-current-C-and-native-P.json')
const rawGoals=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g])),entry={meta:raw,goals:raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))},rows:any[]=[]
for(const course of ['gk','lk']){
 const path=`curricula/DE/Gymnasium/composition-views/chemie/de-sn-${course}.view.json`,bytes=readFileSync(path),v=normalizeCompositionView(JSON.parse(bytes.toString())),roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,rawGoals),projected=applyCompositionViewProjection([entry],v)[0],byId=new Map<string,any>(projected.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(byId),stack=projected.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id),seen=new Set<string>()
 while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);for(const child of getRenderedChildIds(id,byId,children))stack.push(child)}
 for(const w of inputs){
  const id=w.goalId,filters=[v.scope.jurisdiction,v.scope.courseProfile,v.scope.durationModel].filter(Boolean)
  assert(roles.targetGoalIds.has(id)&&seen.has(id)&&goalMatchesFilters(rawGoals.get(id),filters));assert.deepEqual(rawGoals.get(id),w.wholeCurrentGoal)
  rows.push({goalId:id,jurisdiction:'DE-SN',viewId:v.viewId,scope:v.scope,view:{path,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length},authoredTarget:true,actuallyRendered:true,currentCountryCourseFilterPass:true})
 }
}
assert.equal(rows.length,8)
console.log(JSON.stringify({status:'PASS',method:'Actual stock pure normalization/roles/projection/tree/filter functions, exactly4SN pairs in2views; no AP/compiler/build',pairs:4,views:2,targetAppearances:8,rows,scopeOrViewMutations:0,newNativeDPAMVVotes:0,officialStageEndStandardClaim:false},null,2))
