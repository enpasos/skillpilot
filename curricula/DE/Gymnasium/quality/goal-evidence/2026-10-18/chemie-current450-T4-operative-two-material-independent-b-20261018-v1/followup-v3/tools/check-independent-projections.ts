// SPDX-License-Identifier: Apache-2.0
// Read-only finite independent replay with unmodified production functions; no scientific verdict generation.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { convertLearningGoal } from '../../../../../../../../../app/src/goalTypes'
import { applyCompositionViewProjection } from '../../../../../../../../../app/src/utils/compositionViewRuntime'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { buildDirectChildrenMap, getRenderedChildIds } from '../../../../../../../../../app/src/utils/treeProjectionRuntime'
import { goalMatchesFilters } from '../../../../../../../../../app/src/utils/goalFilters'


const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18'
const author=`${base}/chemie-current450-T4-operative-two-material-author-20261018-v3`
const out=`${base}/chemie-current450-T4-operative-two-material-independent-b-20261018-v1/followup-v3`
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const pin=(path:string)=>{const raw=readFileSync(path);return {path,sha256:createHash('sha256').update(raw).digest('hex'),bytes:raw.length}}
const graphPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const original=read(graphPath),goals=read(`${author}/AUTHOR.two-new-complete-exam-goals.pending.json`).goals
const candidate=structuredClone(original),oldById=new Map<string,any>(original.goals.map((g:any)=>[g.id,g]))
assert(goals.every((g:any)=>!oldById.has(g.id)))
candidate.goals.push(...goals)
candidate.goals.find((g:any)=>g.id==='5964272f-e835-5a24-b2b1-c162be6b75cb').contains.push(...goals.map((g:any)=>g.id))
const make=(r:any)=>({meta:r,goals:r.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:r.landscapeId}))})
function project(r:any,v:any){
 const rawById=new Map<string,any>(r.goals.map((g:any)=>[g.id,g]))
 const roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,rawById)
 const p=applyCompositionViewProjection([make(r)],normalizeCompositionView(v))[0]
 const by=new Map<string,any>(p.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(by)
 const stack=p.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id),seen=new Set<string>()
 while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);stack.push(...getRenderedChildIds(id,by,children))}
 const filters=[v.scope.jurisdiction,v.scope.courseProfile,v.scope.durationModel].filter(Boolean)
 const targets=new Set([...roles.targetGoalIds].filter(id=>seen.has(id)&&goalMatchesFilters(rawById.get(id),filters)))
 const parents=new Map<string,string[]>()
 for(const id of seen){for(const child of getRenderedChildIds(id,by,children)){const ids=parents.get(child)??[];ids.push(id);parents.set(child,ids)}}
 return {roles,targets,parents,seen}
}

const operations=read(`${author}/PROPOSAL.exact-two-endpoint-view-child-array-CAS.pending.json`).operations
function find(nodes:any[],id:string):any{for(const n of nodes){if(n.id===id)return n;const r=find(n.children??[],id);if(r)return r}}
const dir='curricula/DE/Gymnasium/composition-views/chemie',rows:any[]=[]
const eligibility=new Map<string,string[]>(goals.map((g:any)=>[g.id,[]]))
for(const file of readdirSync(dir).filter(x=>x.endsWith('.view.json')).sort()){
 const path=`${dir}/${file}`,before=read(path),after=structuredClone(before),bp=project(original,before)
 for(const op of operations.filter((r:any)=>r.normalView.path===path)){
  const parent=find(after.rootNodes,op.stableStructureIdPath.at(-1));assert(parent)
  assert.deepEqual(parent.children,op.beforeChildren)
  parent.children=op.afterChildren
 }
 const ap=project(candidate,after),wanted=goals.filter((g:any)=>g.requires.every((id:string)=>bp.targets.has(id))).map((g:any)=>g.id),actual=goals.filter((g:any)=>ap.targets.has(g.id)).map((g:any)=>g.id)
 assert.deepEqual(actual,wanted)
 for(const id of actual)eligibility.get(id)!.push(path)
 assert.deepEqual([...bp.targets].sort(),[...ap.targets].filter(id=>oldById.has(id)).sort())
 assert.deepEqual([...bp.roles.targetGoalIds].sort(),[...ap.roles.targetGoalIds].filter(id=>oldById.has(id)).sort())
 assert.deepEqual([...bp.roles.prerequisiteOnlyGoalIds].sort(),[...ap.roles.prerequisiteOnlyGoalIds].filter(id=>oldById.has(id)).sort())
 assert([...bp.seen].every(id=>JSON.stringify(bp.parents.get(id)??[])===JSON.stringify(ap.parents.get(id)??[])))
 assert.equal(compileCompositionView(after,candidate).findings.filter(x=>x.severity==='error').length,0)
 rows.push({path,currentInputPin:pin(path),newEndpointIds:actual,oldTargetsRolesAndParentsPreserved:true,actualAllRequiredTargetEligibilityMatched:true})
}
const endpoints=goals.map((g:any)=>({endpointId:g.id,proposedViews:eligibility.get(g.id),ordinaryGoalId:g.requires[0],ordinaryPhase:oldById.get(g.requires[0]).phase??oldById.get(g.requires[0]).dimensionTags?.phase,endpointPhase:g.phase,endpointDimensionPhase:g.dimensionTags.phase}))
writeFileSync(`${out}/CHECK.independent41-current-runtime-and-phase-facts.json`,JSON.stringify({role:'FINITE_FACTS_NOT_SCIENTIFIC_VERDICT',canonicalInput:pin(graphPath),viewCount:rows.length,records:rows,endpoints,normalWrites:0},null,2)+'\n')
console.log(JSON.stringify({views:rows.length,appearances:rows.reduce((n,r)=>n+r.newEndpointIds.length,0),endpoints},null,2))
