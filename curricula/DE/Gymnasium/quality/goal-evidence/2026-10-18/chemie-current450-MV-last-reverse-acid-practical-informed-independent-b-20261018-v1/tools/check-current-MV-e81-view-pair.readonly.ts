// SPDX-License-Identifier: Apache-2.0
// Executed by independent B; finite read-only stock runtime check copied from pinned author tool.
import {readFileSync,readdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {convertLearningGoal} from '../../../../../../../../app/src/goalTypes'
import {applyCompositionViewProjection} from '../../../../../../../../app/src/utils/compositionViewRuntime'
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../../app/src/utils/treeProjectionRuntime'
import {goalMatchesFilters} from '../../../../../../../../app/src/utils/goalFilters'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')), ids=new Set(['e81a4aed-9695-533e-8eb7-7a0c714346ea']), rows=[{goalId:'e81a4aed-9695-533e-8eb7-7a0c714346ea',jurisdiction:'DE-MV'}]
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
const allPaths=readdirSync('curricula/DE/Gymnasium/composition-views/chemie').filter(p=>p.endsWith('.view.json')).map(p=>'curricula/DE/Gymnasium/composition-views/chemie/'+p)
for(const row of rows){
 const checks:any[]=[]
 for(const path of allPaths){const authored=read(path);if(authored.scope.jurisdiction!==row.jurisdiction)continue;const v=view(path)
  const target=v.roles.targetGoalIds.has(row.goalId),rendered=v.seen.has(row.goalId),filter=goalMatchesFilters(rawGoals.get(row.goalId),v.filters)
  checks.push({viewId:v.viewId,scope:v.scope,actualCurrentView:v.pin,explicitTarget:target,actuallyRendered:rendered,countryCourseFilterPass:filter,isCurrentTarget:target&&rendered&&filter})
 }
 pairs.push({...row,checks})
}
assert.equal(rows.length,1)
console.log(JSON.stringify({status:pairs.every(p=>p.checks.some((c:any)=>c.isCurrentTarget))?'PASS':'HOLD_VIEW_INTERSECTION',method:'Actual finite stock pure role/tree/filter check of exactly current MV e81 pair, no compiler/AP/build',counts:{checkedPairs:rows.length,wholeGoals:ids.size,views:cache.size,targetAppearances:pairs.reduce((n,p)=>n+p.checks.filter((c:any)=>c.isCurrentTarget).length,0),normalWrites:0},pairs},null,2))
