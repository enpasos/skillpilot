import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { gzipSync, gunzipSync } from 'node:zlib'
import { resolve } from 'node:path'
import { prepareLandscapeEntries } from '../../app/src/hooks/useLandscapes.ts'
import { applyCompositionViewProjection, applyPersonalCurriculumProjection } from '../../app/src/utils/compositionViewRuntime.ts'
import { normalizeLearnerProjectedEntries, collapseLearnerSubjectRoots } from '../../app/src/utils/learnerTreeProjection.ts'
import { buildDirectChildrenMap } from '../../app/src/utils/treeProjectionRuntime.ts'
import { deriveLearnerUnitMapPreview, PROVISIONAL_STAGE_PLAN_UNITS } from '../../app/src/components/learningUnitMap/learnerUnitMapPreview.ts'
import { buildLearnerUnitMapProjection } from '../../app/src/components/learningUnitMap/learnerUnitMapProjection.ts'
import { createLearnerRequirementResolver } from '../../app/src/components/learningUnitMap/learnerMapProjection.ts'
import { collectCompositionProjectionRoleGoalIds } from '../../app/src/utils/authoring/compositionViewAuthoring.ts'

const [directory] = process.argv.slice(2), out=resolve(directory), read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const native=JSON.parse(gunzipSync(readFileSync(out+'/native-views.json.gz')).toString('utf8'))
const catalogs=readdirSync('curricula/DE/Gymnasium/canonical').filter(f=>f.endsWith('.json')).map(f=>read('curricula/DE/Gymnasium/canonical/'+f))
const source=prepareLandscapeEntries(catalogs), canonical=new Map(source.flatMap(e=>e.goals).map(g=>[g.id,g]))
const resolver=createLearnerRequirementResolver(canonical,canonical,()=>{}), goalEvidence=new Map<string,any>(), summaries:any[]=[], reports:any[]=[]
const recordGoal=(id:string)=>{if(!goalEvidence.has(id)){const g=canonical.get(id);goalEvidence.set(id,g?{id,title:g.title,landscapeId:g.landscapeId,description:g.description,requires:g.requires}: {id,unresolved:true})}return id}
const legacyStageIds=new Set(PROVISIONAL_STAGE_PLAN_UNITS.flatMap(x=>x.viewNodeIds))
for(const context of native.contexts){
 if(!context.mathViewKey||!context.physicsViewKey){summaries.push({...context,status:'unavailable',findings:[context.mathError,context.physicsError].filter(Boolean)});continue}
 const math=native.views[context.mathViewKey],physics=native.views[context.physicsViewKey], views=[math,physics]
 const seed=new Set<string>();for(const view of views)for(const id of collectCompositionProjectionRoleGoalIds(view.rootNodes,canonical).targetGoalIds)if(!resolver.isCanonicalCluster(id))seed.add(id)
 const paths=new Map([...seed].sort().map(id=>[id,[id]])),queue=[...paths.keys()];let unresolved:any[]=[]
 for(let i=0;i<queue.length;i++)for(const c of resolver.directRequirementContext(queue[i])){if(c.unresolved)unresolved.push({goalId:queue[i],context:c});for(const id of c.sourceGoalIds)if(!paths.has(id)){paths.set(id,[...paths.get(queue[i])!,id]);queue.push(id)}}
 if(unresolved.length){summaries.push({...context,status:'unresolved-canonical-prerequisite',unresolved});continue}
 const scoped=source.map(e=>({...e,meta:{...e.meta,personalCurriculumProjection:{revision:'atomic-prerequisite-learning-v1',rootLandscapeId:'actual-current-f6-diagnostic',scopeRevision:context.id,seedAtomicGoalIds:[...seed].filter(id=>canonical.get(id)?.landscapeId===e.meta.landscapeId),targetGoalIds:[...paths.keys()].filter(id=>canonical.get(id)?.landscapeId===e.meta.landscapeId),requiredByPaths:Object.fromEntries([...paths].filter(([id,p])=>p.length>1&&canonical.get(id)?.landscapeId===e.meta.landscapeId))}}}))
 let projected=views.reduce((entries,view)=>applyCompositionViewProjection(entries,view),source)
 projected=applyPersonalCurriculumProjection(normalizeLearnerProjectedEntries(projected),scoped as any)
 const index=new Map(projected.flatMap(e=>e.goals).map(g=>[g.id,g])),{childrenByParent}=collapseLearnerSubjectRoots(index,buildDirectChildrenMap(index))
 const roots=[...index.values()].filter(g=>g.tags.includes('root')),visible=new Set<string>();const visit=(id:string)=>{if(visible.has(id))return;visible.add(id);(childrenByParent.get(id)??[]).forEach(visit)};roots.forEach(g=>visit(g.id))
 const input={rootGoals:roots,goalIndexAll:index,canonicalGoalIndexAll:canonical,visibleGoalIds:visible,visibleChildrenByParent:childrenByParent}
 const deepest=deriveLearnerUnitMapPreview(input),steps=[...new Set([1,Math.max(1,deepest.maxStep)])],maps:any[]=[]
 for(const step of steps){
  const preview=deriveLearnerUnitMapPreview(input,step),map=buildLearnerUnitMapProjection({...input,units:preview.units,after:preview.after})
  const units=[...preview.units].map(([id,identity])=>{const g=index.get(id)!,nodeId=String(g.extendedData?.compositionNodeId??'');return {structureGoalId:id,...identity,sourceViewId:g.extendedData?.compositionViewId,sourceNodeId:nodeId,subject:g.landscapeId,title:g.title,kind:identity.key.startsWith('plan:')?'declared-v1.3-plan-unit':legacyStageIds.has(nodeId as any)?'legacy-stage-stand-in':'legacy-container-no-plan-year-acceptance'}})
  const unitEntries=new Set(Object.values(map.unitEntryIds)),outside=[...paths.keys()].filter(id=>!(map.entryPaths?.[id]??[]).some(entry=>unitEntries.has(entry))).sort()
  outside.forEach(recordGoal)
  const boards=Object.entries(map.scopeRelations??{}).map(([boardId,relations])=>{
   const backward=relations.filter(r=>r.backward),causes=new Map<string,any>()
   for(const r of backward)for(const p of r.provenance)for(const prerequisite of p.sourceGoalIds){const key=p.dependentGoalId+'->'+prerequisite;causes.set(key,{dependentGoalId:recordGoal(p.dependentGoalId),requiredGoalId:recordGoal(prerequisite),authoredOnGoalId:p.authoredOnGoalId,inherited:p.inherited,dependentPath:map.entryPaths?.[p.dependentGoalId],requiredPath:map.entryPaths?.[prerequisite],requiredByPath:paths.get(prerequisite)})}
   return {boardId,title:map.entries[boardId]?.title,boardPath:map.entryPaths?.[boardId],kind:boardId===map.rootId?'top-level':'nested-visible-container',backwardSummaryArrowCount:backward.length,atomicBackflowCauses:[...causes.values()]}
  })
  const top=boards.find(b=>b.boardId===map.rootId),nested=boards.filter(b=>b.boardId!==map.rootId)
  maps.push({step:preview.step,maxStep:preview.maxStep,scope:step===1?'top-level-visible-preview':'all-currently-visible-nested-containers',units,after:preview.after,rootChildren:map.entries[map.rootId].children,topLevelBackwardSummaryArrows:top?.backwardSummaryArrowCount??0,topLevelAtomicCauseCount:top?.atomicBackflowCauses.length??0,nestedBackwardSummaryArrows:nested.reduce((n,b)=>n+b.backwardSummaryArrowCount,0),nestedAtomicCauseOccurrences:nested.reduce((n,b)=>n+b.atomicBackflowCauses.length,0),outsideUnitAtomicGoalIds:outside,boards,findings:map.findings})
 }
 const selectedViews=views.map(v=>({viewId:v.viewId,landscapeId:v.landscapeId,actualScope:v.scope,mergedFromViewIds:v.mergedFromViewIds,declaredPlanId:v.stagePlanProjection?.plan?.planId,requestDimensionsNotPinnedByView:Object.keys(context.scope).filter(k=>v.scope[k]===undefined)}))
 reports.push({...context,status:'measured',selectedViews,seedAtomicGoalIds:[...seed].sort(),learningAtomicGoalIds:[...paths.keys()].sort(),maps})
 summaries.push({...context,status:'measured',selectedViews,seeds:seed.size,learning:paths.size,maps:maps.map(({boards,units,after,rootChildren,outsideUnitAtomicGoalIds,findings,...m})=>({...m,unitCount:units.length,outsideUnitAtoms:outsideUnitAtomicGoalIds.length,findings:findings.length}))})
 console.log(context.id+': '+maps.map(m=>`step${m.step} top=${m.topLevelBackwardSummaryArrows}/${m.topLevelAtomicCauseCount} nested=${m.nestedBackwardSummaryArrows}/${m.nestedAtomicCauseOccurrences} outside=${m.outsideUnitAtomicGoalIds.length}`).join('; '))
}
writeFileSync(out+'/actual-maps.json.gz',gzipSync(JSON.stringify({reports,goalEvidence:Object.fromEntries(goalEvidence)}),{level:9}))
writeFileSync(out+'/summary.actual.json',JSON.stringify({at:new Date().toISOString(),realPlansActivated:0,pipeline:'actual CompositionViewService/native merger -> canonical atomic requires closure -> composition adapter -> actual Personal Curriculum adapter -> learner unit map at step1 and deepest currently visible step',limitations:['No official validity is inferred from runtime fallback or duration-neutral selection.','Legacy topic/year-labelled containers are reported as authored containers, never accepted real year/phase plans.','Counts of nested arrows are board-relative; do not add them to top arrows as distinct prerequisite pairs.'],rows:summaries},null,2)+'\n')
