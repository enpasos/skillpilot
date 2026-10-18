import {readFileSync,readdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {convertLearningGoal} from '../../../../../../../../app/src/goalTypes'
import {applyCompositionViewProjection} from '../../../../../../../../app/src/utils/compositionViewRuntime'
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../../app/src/utils/treeProjectionRuntime'
import {goalMatchesFilters} from '../../../../../../../../app/src/utils/goalFilters'
const A='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-fourteen-method-multistate-source-author-20261018-v1/'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),routing=read(A+'INPUT.routing-only.preserved.json'),pending=new Set(routing.pendingOwnedElsewhere.map((p:any)=>p.goalId+'|'+p.jurisdiction)),rows=routing.scope.flatMap((r:any)=>r.jurisdictions.filter((j:string)=>!pending.has(r.goalId+'|'+j)).map((j:string)=>({goalId:r.goalId,jurisdiction:j})))
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
const endpointChecks:any[]=[]
for(const p of pairs.filter(p=>p.goalId==='9e656697-fc05-5aa9-9aca-871af2e89eb7')){
 for(const c of p.checks.filter((c:any)=>c.isCurrentTarget)){
  const v=view(c.actualCurrentView.path),endpoint='e7c3d20e-4b13-560b-b8ee-c5abca8cc624',g=rawGoals.get(endpoint),hasLiteralRequires=g.requires.includes(p.goalId),endpointTarget=v.roles.targetGoalIds.has(endpoint)&&v.seen.has(endpoint)&&goalMatchesFilters(g,v.filters)
  assert(hasLiteralRequires&&endpointTarget,JSON.stringify({p,c,endpointTarget}))
  endpointChecks.push({jurisdiction:p.jurisdiction,prerequisiteGoalId:p.goalId,endpoint,viewId:v.viewId,hasLiteralRequires,endpointTarget})
 }
}
assert.equal(endpointChecks.length,4)
assert.equal(rows.length,86)
console.log(JSON.stringify({status:pairs.every(p=>p.checks.some((c:any)=>c.isCurrentTarget))?'PASS':'HOLD_VIEW_INTERSECTION',method:'Finite actual unchanged pure roles/projection/tree/country-course filters for exactly14 routed goals/86 actual pairs; no compiler/AP/build',counts:{routingScopePairs:87,actualPendingIntersection:1,checkedPairs:rows.length,views:cache.size,targetAppearances:pairs.reduce((n,p)=>n+p.checks.filter((c:any)=>c.isCurrentTarget).length,0),sourceOrViewMutations:0},concreteExistingAcquisitionEndpointChecks:endpointChecks,pairs},null,2))
