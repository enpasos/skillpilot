// SPDX-License-Identifier: Apache-2.0
import {readFileSync,readdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {convertLearningGoal} from '../../../../../../../../app/src/goalTypes'
import {applyCompositionViewProjection} from '../../../../../../../../app/src/utils/compositionViewRuntime'
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../../app/src/utils/treeProjectionRuntime'
import {goalMatchesFilters} from '../../../../../../../../app/src/utils/goalFilters'
const id='e0d05c36-eaac-4c75-8ead-3fd5bdafefca',countries=new Set(['DE-HH','DE-MV','DE-RP','DE-SH','DE-SN','DE-ST','DE-TH'])
const raw=JSON.parse(readFileSync('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','utf8')),rawGoals=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g])),entry={meta:raw,goals:raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))}
const base='curricula/DE/Gymnasium/composition-views/chemie/',checks:any[]=[]
for(const f of readdirSync(base).filter(x=>x.endsWith('.view.json'))){
 const path=base+f,bytes=readFileSync(path),view=normalizeCompositionView(JSON.parse(bytes.toString()))
 if(!countries.has(view.scope.jurisdiction))continue
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,rawGoals),projected=applyCompositionViewProjection([entry],view)[0],byId=new Map<string,any>(projected.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(byId),stack=projected.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id),seen=new Set<string>()
 while(stack.length){const x=stack.pop()!;if(seen.has(x))continue;seen.add(x);for(const c of getRenderedChildIds(x,byId,children))stack.push(c)}
 const filters=[view.scope.jurisdiction,view.scope.courseProfile,view.scope.durationModel].filter(Boolean),check={viewId:view.viewId,scope:view.scope,view:{path,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length},explicitTarget:roles.targetGoalIds.has(id),prerequisiteOnly:roles.prerequisiteOnlyGoalIds.has(id),actuallyRendered:seen.has(id),countryCourseFilter:goalMatchesFilters(rawGoals.get(id),filters)}
 assert(check.explicitTarget&&check.actuallyRendered&&check.countryCourseFilter&&!check.prerequisiteOnly,view.viewId);checks.push(check)
}
assert.equal(checks.length,14)
console.log(JSON.stringify({status:'PASS',method:'Actual pure projection, authored roles, rendered tree and country/course filter for one current goal in seven source-state scopes; no AP/compiler/build',goalId:id,counts:{goals:1,countryPairs:7,views:14},checks,sourceProofClaimFromProjection:false,newRequires:0,normalWrites:0},null,2))
