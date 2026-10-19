// Apache-2.0. Bounded actual production-role check supporting independent science.
import {readFileSync,readdirSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
const R=fileURLToPath(new URL('../../../../../../../',import.meta.url))
const {collectCompositionProjectionRoleGoalIds,normalizeCompositionView}=await import(R+'app/src/utils/authoring/compositionViewAuthoring.ts')
const {goalMatchesFilters}=await import(R+'app/src/utils/goalFilters.ts')
const B='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/',A=B+'chemie-current454-existing-requires-surrogate-author-20261018-v1/',read=(p:string)=>JSON.parse(readFileSync(R+p,'utf8'))
const canonical=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),byId=new Map<string,any>(canonical.goals.map((g:any)=>[g.id,g])),relations=read(A+'AUTHOR.individual-acquisition-relations.pending.json').records,ids=[...new Set<string>(relations.flatMap((r:any)=>[r.goalId,r.requiredByGoalId]))]
const dir='curricula/DE/Gymnasium/composition-views/chemie/',views=readdirSync(R+dir).filter(n=>n.endsWith('.json')).sort().map(n=>{
 const path=dir+n,view=normalizeCompositionView(read(path)),roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,byId)
 return {path,viewId:view.viewId,scope:view.scope,goals:ids.map(goalId=>({goalId,rawTarget:roles.targetGoalIds.has(goalId),target:roles.targetGoalIds.has(goalId)&&goalMatchesFilters(byId.get(goalId),view.scope?.courseProfile),prerequisiteOnly:roles.prerequisiteOnlyGoalIds.has(goalId)}))}
})
const checks=relations.map((r:any)=>{
 const applicable=views.filter(v=>v.scope?.jurisdiction===r.jurisdiction),hasDirectLiteralRequires=byId.get(r.requiredByGoalId).requires.includes(r.goalId)
 return {proposedRegistryIndex:r.proposedRegistryIndex,goalId:r.goalId,jurisdiction:r.jurisdiction,requiredByGoalId:r.requiredByGoalId,hasDirectLiteralRequires,currentRequires:byId.get(r.requiredByGoalId).requires,scopedViews:applicable.map(v=>({viewId:v.viewId,scope:v.scope,predecessor:v.goals.find(g=>g.goalId===r.goalId),carrier:v.goals.find(g=>g.goalId===r.requiredByGoalId)}))}
})
const failed=checks.filter((r:any)=>!r.hasDirectLiteralRequires||!r.scopedViews.length||r.scopedViews.some((v:any)=>v.predecessor.target&&!v.carrier.target))
if(views.length!==41||checks.length!==23||failed.length)throw Error(JSON.stringify({viewCount:views.length,failed}))
console.log(JSON.stringify({role:'Actual current requires and course-filtered production roles for exactly five goals and23 relationships; no whole applicability build or source-coverage-as-science claim',wholeGoalCount:canonical.goals.length,viewCount:views.length,checks,views,failed},null,2))
