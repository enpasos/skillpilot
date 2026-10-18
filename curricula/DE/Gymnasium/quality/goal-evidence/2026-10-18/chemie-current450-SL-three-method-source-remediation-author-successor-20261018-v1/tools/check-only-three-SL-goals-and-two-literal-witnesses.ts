// SPDX-License-Identifier: Apache-2.0
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {convertLearningGoal} from '../../../../../../../../app/src/goalTypes'
import {applyCompositionViewProjection} from '../../../../../../../../app/src/utils/compositionViewRuntime'
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../../app/src/utils/treeProjectionRuntime'
import {goalMatchesFilters} from '../../../../../../../../app/src/utils/goalFilters'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const ids=read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-SL-three-method-source-remediation-author-successor-20261018-v1/INPUT.three-current-whole-C-P-and-two-whole-literal-endpoints.json').map((x:any)=>x.goalId)
const raw=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),rawGoals=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g]))
const entry={meta:raw,goals:raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))},cache=new Map<string,any>()
function view(path:string){
 if(cache.has(path))return cache.get(path)
 const bytes=readFileSync(path),v=normalizeCompositionView(JSON.parse(bytes.toString())),roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,rawGoals)
 const projected=applyCompositionViewProjection([entry],v)[0],byId=new Map<string,any>(projected.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(byId),stack=projected.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id),seen=new Set<string>()
 while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);for(const child of getRenderedChildIds(id,byId,children))stack.push(child)}
 const filters=[v.scope.jurisdiction,v.scope.courseProfile,v.scope.durationModel].filter(Boolean),r={viewId:v.viewId,scope:v.scope,roles,seen,filters,pin:{path,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length}}
 cache.set(path,r);return r
}
const pairs:any[]=[]
for(const goalId of ids){const checks:any[]=[];for(const path of ['curricula/DE/Gymnasium/composition-views/chemie/de-sl-gk.view.json','curricula/DE/Gymnasium/composition-views/chemie/de-sl-lk.view.json']){const v=view(path),target=v.roles.targetGoalIds.has(goalId),rendered=v.seen.has(goalId),filter=goalMatchesFilters(rawGoals.get(goalId),v.filters);assert(target&&rendered&&filter);checks.push({viewId:v.viewId,scope:v.scope,actualCurrentView:v.pin,explicitTarget:target,actuallyRendered:rendered,countryCourseFilterPass:filter})}pairs.push({goalId,jurisdiction:'DE-SL',checks})}
assert.equal(pairs.length,5);assert.equal(cache.size,2)
console.log(JSON.stringify({status:'PASS',scope:'Only three SL author-scope goals and two literal endpoint witnesses; unchanged actual pure role/projection/tree/filter functions',counts:{authorGoalPairs:3,endpointWitnesses:2,views:2,targetAppearances:10,scopeOrViewMutations:0},pairs},null,2))
