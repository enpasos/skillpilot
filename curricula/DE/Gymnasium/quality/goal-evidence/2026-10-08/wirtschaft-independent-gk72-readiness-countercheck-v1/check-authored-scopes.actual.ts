// Apache-2.0. Read-only native QS countercheck; no live source/registry writes.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { convertLearningGoal } from '../../../../../../../app/src/goalTypes'
import { applyCompositionViewProjection } from '../../../../../../../app/src/utils/compositionViewRuntime'
import { normalizeCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { buildDirectChildrenMap, getRenderedChildIds } from '../../../../../../../app/src/utils/treeProjectionRuntime'
import { goalMatchesFilters } from '../../../../../../../app/src/utils/goalFilters'

const canonicalFile = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const bytes = readFileSync(resolve(canonicalFile))
const landscape = JSON.parse(bytes.toString('utf8'))
const entry = {meta: landscape, goals: landscape.goals.map((g:any) => convertLearningGoal(g, {landscapeId: landscape.landscapeId}))}
const sourceIndex = new Map(entry.goals.map((g:any) => [g.id,g]))
const targetId = '72bde56f-a752-5bc7-8472-24272c6075a0'
const closure:string[]=[]
const pending=[...(sourceIndex.get(targetId) as any).requires]
while(pending.length){const id=pending.shift()!;if(closure.includes(id))continue;closure.push(id);pending.push(...((sourceIndex.get(id) as any)?.requires??[]))}
const views=['de-de-gym-economics-gk','de-de-gym-economics-lk','de-de-gym-seki-economics'].map(name=>{
 const viewFile=`curricula/DE/Gymnasium/composition-views/wirtschaft/${name}.view.json`
 const viewBytes=readFileSync(resolve(viewFile));const view=normalizeCompositionView(JSON.parse(viewBytes.toString('utf8')))
 // Deliberately no implicit fallback from absent SekI courseProfile to LK.
 const filters=[view.scope.courseProfile,view.scope.durationModel].filter((x):x is string=>typeof x==='string'&&x.trim().length>0)
 const projected=applyCompositionViewProjection([entry],view)[0]
 const index=new Map(projected.goals.map(g=>[g.id,g]));const childMap=buildDirectChildrenMap(index)
 childMap.forEach((ids,p)=>childMap.set(p,ids.filter(id=>{const g=index.get(id);return !!g&&goalMatchesFilters(g,filters)})))
 const visible=new Set<string>();const stack=projected.goals.filter(g=>g.tags?.includes('root')).map(g=>g.id)
 while(stack.length){const id=stack.pop()!;if(visible.has(id))continue;visible.add(id);stack.push(...getRenderedChildIds(id,index,childMap))}
 const atomic=[...visible].filter(id=>!id.startsWith('composition:')&&(index.get(id)?.contains.length??1)===0)
 const roots=new Map([[landscape.landscapeId,entry.goals.find((g:any)=>g.tags?.includes('root')&&g.contains.length)?.id??'']])
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,sourceIndex as any,roots)
 const included=new Set(atomic)
 // Authored support is counted only if actually specified, never inferred from requires.
 roles.prerequisiteOnlyGoalIds.forEach(id=>{const g=sourceIndex.get(id) as any;if(g&&g.contains.length===0&&goalMatchesFilters(g,filters))included.add(id)})
 return {viewFile,viewSha256:createHash('sha256').update(viewBytes).digest('hex'),actualAuthoredScope:view.scope,actualScopeFilters:filters,targetAtomicCount:atomic.length,includingPrerequisiteOnlyAtomicCount:included.size,goalIsTarget:atomic.includes(targetId),goalIsIncluded:included.has(targetId),closure:closure.map(id=>({goalId:id,title:(sourceIndex.get(id) as any)?.title,target:atomic.includes(id),included:included.has(id)})),missingRequiresForActualTarget:atomic.includes(targetId)?closure.filter(id=>!included.has(id)):[],allTargetIds:atomic.sort()}
})
console.log(JSON.stringify({schemaVersion:1,checkedAt:new Date().toISOString(),agentIdentity:'/root/economics_layer_a',canonicalFile,canonicalSha256:createHash('sha256').update(bytes).digest('hex'),actualNativeMethods:['convertLearningGoal','normalizeCompositionView','applyCompositionViewProjection','buildDirectChildrenMap','getRenderedChildIds','goalMatchesFilters','collectCompositionProjectionRoleGoalIds'],actualViews:views,limitedConclusion:'GK72 is evaluated only where actually an authored visible target. Raw GK/LK tags are not learner projection or missing-readiness proof. No jurisdiction-specific complete coverage/source adjudication or observed runtime/mastery acceptance claimed.',sourceAdjudicationClaimed:false,liveWrites:0,humanApprovalClaimed:false},null,2))
