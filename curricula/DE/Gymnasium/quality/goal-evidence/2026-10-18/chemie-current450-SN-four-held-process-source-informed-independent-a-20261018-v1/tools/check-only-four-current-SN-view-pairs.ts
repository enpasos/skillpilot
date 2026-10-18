// SPDX-License-Identifier: Apache-2.0
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {convertLearningGoal} from '../../../../../../../../app/src/goalTypes'
import {applyCompositionViewProjection} from '../../../../../../../../app/src/utils/compositionViewRuntime'
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../../app/src/utils/treeProjectionRuntime'
import {goalMatchesFilters} from '../../../../../../../../app/src/utils/goalFilters'
const A='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-six-process-remaining-states-direct-source-author-20261018-v1/'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),rows=read(A+'MATRIX.sixty-current-goal-country-direct-source-author.json').filter((r:any)=>r.jurisdiction==='DE-SN'&&['431a0f03-f28a-5e56-a61f-000336d0b410','4aa3a130-b517-5ac5-87b2-147fe432cadd','5b1bb5d9-07b1-5ba9-b320-cc97be917c60','7d9fcc7f-1c20-5d5b-9cf6-05f6b624dab6'].includes(r.goalId))
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
for(const row of rows){
 const checks:any[]=[]
 for(const [list,expected] of [[row.currentTargetViews,true],[row.currentNonTargetViews,false]] as any){
  for(const listed of list){const v=view(listed.view?.path??listed.path);if(listed.scope)assert.deepEqual(v.scope,listed.scope);if(listed.viewId)assert.equal(v.viewId,listed.viewId)
   const target=v.roles.targetGoalIds.has(row.goalId),rendered=v.seen.has(row.goalId),filter=goalMatchesFilters(rawGoals.get(row.goalId),v.filters)
   assert.equal(target&&rendered&&filter,expected,`${row.jurisdiction}/${row.goalId}/${v.viewId}`)
   checks.push({viewId:v.viewId,scope:v.scope,actualCurrentView:v.pin,explicitTarget:target,actuallyRendered:rendered,countryCourseFilterPass:filter,expectedTarget:expected})
  }
 }
 assert(row.currentTargetViews.length>0);pairs.push({goalId:row.goalId,jurisdiction:row.jurisdiction,checks})
}
assert.equal(rows.length,4);assert.equal(cache.size,2);assert.equal(pairs.reduce((n,p)=>n+p.checks.filter((c:any)=>c.expectedTarget).length,0),8)
console.log(JSON.stringify({status:'PASS',method:'Independent unchanged actual pure roles/projection/rendered-tree/country-course-filter checks on exactly four current SN pairs/two views',counts:{pairs:4,views:2,targetAppearances:8,sourceOrViewMutations:0},pairs},null,2))
