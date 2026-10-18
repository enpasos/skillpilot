// SPDX-License-Identifier: Apache-2.0
import {readFileSync,readdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {convertLearningGoal} from '../../../../../../../../app/src/goalTypes'
import {applyCompositionViewProjection} from '../../../../../../../../app/src/utils/compositionViewRuntime'
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../../app/src/utils/treeProjectionRuntime'
import {goalMatchesFilters} from '../../../../../../../../app/src/utils/goalFilters'
const A='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-forty-content-multistate-source-author-20261018-v1/'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),whole=read(A+'INPUT.forty-whole-current-goals-and-positive-profiles.actual.json').records.slice(0,20),ids=new Set<string>(whole.map((w:any)=>w.wholeCurrentGoal.id)),rows=read(A+'AUTHOR.forty-whole-current-content-goals.two-hundred-fourteen-state-pairs.pending.json').records.filter((r:any)=>ids.has(r.goalId)),countries=new Set(rows.map((r:any)=>r.jurisdiction))
const raw=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),rawGoals=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g])),entry={meta:raw,goals:raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))}
const base='curricula/DE/Gymnasium/composition-views/chemie/',cache:any[]=[]
for(const f of readdirSync(base).filter(x=>x.endsWith('.view.json'))){
 const path=base+f,bytes=readFileSync(path),v=normalizeCompositionView(JSON.parse(bytes.toString()))
 if(!countries.has(v.scope.jurisdiction))continue
 const roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,rawGoals),projected=applyCompositionViewProjection([entry],v)[0],byId=new Map<string,any>(projected.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(byId),stack=projected.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id),seen=new Set<string>()
 while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);for(const child of getRenderedChildIds(id,byId,children))stack.push(child)}
 cache.push({viewId:v.viewId,scope:v.scope,roles,seen,filters:[v.scope.jurisdiction,v.scope.courseProfile,v.scope.durationModel].filter(Boolean),pin:{path,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length}})
}
const pairChecks=rows.map((r:any)=>{
 const checks=cache.filter(v=>v.scope.jurisdiction===r.jurisdiction).map(v=>({viewId:v.viewId,scope:v.scope,view:v.pin,explicitTarget:v.roles.targetGoalIds.has(r.goalId),prerequisiteOnly:v.roles.prerequisiteOnlyGoalIds.has(r.goalId),actuallyRendered:v.seen.has(r.goalId),countryCourseFilter:goalMatchesFilters(rawGoals.get(r.goalId),v.filters)}))
 assert(checks.some(v=>v.explicitTarget&&v.actuallyRendered&&v.countryCourseFilter),r.goalId+'/'+r.jurisdiction)
 return {goalId:r.goalId,jurisdiction:r.jurisdiction,actualCurrentViews:checks}
})
const literal=read(A+'candidate/REQUIRES.six-current-literal-source-acquisition-proposals.pending.json').records.map((a:any)=>{
 assert(rawGoals.get(a.requiredByGoalId).requires.includes(a.goalId));const both=cache.filter(v=>v.scope.jurisdiction===a.jurisdiction&&[a.goalId,a.requiredByGoalId].every(gid=>v.roles.targetGoalIds.has(gid)&&v.seen.has(gid)&&goalMatchesFilters(rawGoals.get(gid),v.filters)))
 assert(both.length>0);return {goalId:a.goalId,requiredByGoalId:a.requiredByGoalId,jurisdiction:a.jurisdiction,actualSharedTargetViews:both.map(v=>({viewId:v.viewId,scope:v.scope,view:v.pin})),actualOrdinaryLiteralRequires:true}
})
assert.equal(ids.size,20);assert.equal(rows.length,168);assert.equal(literal.length,6)
console.log(JSON.stringify({status:'PASS',method:'Actual pure role/projection/rendered-tree/country-course filters on only the selected20-goal168-pair roster, plus2literal endpoint witnesses; no AP/compiler/build and no mutation',counts:{wholeGoals:20,statePairs:168,views:cache.length,targetAppearances:pairChecks.reduce((n:number,p:any)=>n+p.actualCurrentViews.filter((c:any)=>c.explicitTarget&&c.actuallyRendered&&c.countryCourseFilter).length,0),literalRelations:6},pairChecks,literal,sourceProofClaimFromProjection:false,normalWrites:0},null,2))
