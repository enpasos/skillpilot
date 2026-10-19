import {readFileSync,readdirSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
const R=fileURLToPath(new URL('../../../../../../../',import.meta.url))
const {collectCompositionProjectionRoleGoalIds,normalizeCompositionView}=await import(R+'app/src/utils/authoring/compositionViewAuthoring.ts')
const {getSrsFilterTags}=await import(R+'app/src/utils/srsTags.ts')
const {goalMatchesFilters}=await import(R+'app/src/utils/goalFilters.ts')
const B='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/',J=B+'chemie-current454-joint-integration-candidate-technical-20261018-v2/'
const read=(p:string)=>JSON.parse(readFileSync(R+p,'utf8'))
const old=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),next=read(J+'candidate/landscape.with-four-images.INACTIVE.json')
const oldMap=new Map<string,any>(old.goals.map((g:any)=>[g.id,g])),newMap=new Map<string,any>(next.goals.map((g:any)=>[g.id,g]))
const input=read(B+'chemie-current454-targeted-AM-components-independent-a-20261018-v1/INPUTS.whole42-goals-current-AM-and-whole-P.json')
const required=input.records.filter((r:any)=>r.wholeCurrentMOwner?.wholeRecord.status==='memory_required').map((r:any)=>({goalId:r.goalId,...r.wholeCurrentMOwner.wholeRecord}))
const memoryNodes=old.goals.filter((g:any)=>g.nodeKind==='memory'||g.tags?.includes('memorization'))
const changedMemoryNodes=memoryNodes.filter((g:any)=>JSON.stringify(g)!==JSON.stringify(newMap.get(g.id))).map((g:any)=>g.id)
const nodeIds=[...new Set<string>(required.flatMap((r:any)=>r.memoryGoalIds))]
const nodeSelections=nodeIds.map(id=>{
 const goal=newMap.get(id),source=goal.extendedData.vocabularySource,path=source.startsWith('/data/')?'curricula/DE/Gymnasium/memory-decks/'+source.substring(6):source,deck=read(path)
 const cards=deck.cards??deck.entries??deck,filters=getSrsFilterTags(goal.tags),selected=cards.filter((c:any)=>filters.length===0||c.tags?.some((t:string)=>filters.includes(t)))
 return {memoryGoalId:id,wholeUnchangedMemoryGoal:goal,deckPath:path,filterTags:filters,selectedCardIds:selected.map((c:any)=>c.id),selectedCards:selected}
})
const previousPaths=readdirSync(R+'curricula/DE/Gymnasium/composition-views/chemie/').filter(n=>n.endsWith('.json')).map(n=>'curricula/DE/Gymnasium/composition-views/chemie/'+n)
const candidatePaths=readdirSync(R+J+'candidate/views/').filter(n=>n.endsWith('.json')).map(n=>J+'candidate/views/'+n)
const previousById=new Map(previousPaths.map(p=>{const v=normalizeCompositionView(read(p));return[v.viewId,{path:p,view:v}]}))
const viewRows=candidatePaths.sort().map(path=>{
 const view=normalizeCompositionView(read(path)),prev=previousById.get(view.viewId)!,before=collectCompositionProjectionRoleGoalIds(prev.view.rootNodes,oldMap),after=collectCompositionProjectionRoleGoalIds(view.rootNodes,newMap)
 return {viewId:view.viewId,currentViewPath:prev.path,candidateViewPath:path,requirements:required.map((r:any)=>{
  const beforeVisible=r.memoryGoalIds.filter((id:string)=>before.targetGoalIds.has(id)&&goalMatchesFilters(oldMap.get(id),prev.view.scope?.courseProfile)),afterVisible=r.memoryGoalIds.filter((id:string)=>after.targetGoalIds.has(id)&&goalMatchesFilters(newMap.get(id),view.scope?.courseProfile))
  const beforeOrdinaryTarget=before.targetGoalIds.has(r.goalId)&&goalMatchesFilters(oldMap.get(r.goalId),prev.view.scope?.courseProfile),afterOrdinaryTarget=after.targetGoalIds.has(r.goalId)&&goalMatchesFilters(newMap.get(r.goalId),view.scope?.courseProfile)
  return {goalId:r.goalId,rawBeforeTargetRole:before.targetGoalIds.has(r.goalId),rawAfterTargetRole:after.targetGoalIds.has(r.goalId),courseProfile:view.scope?.courseProfile,beforeOrdinaryTarget,afterOrdinaryTarget,beforeTargetMemoryIds:beforeVisible,afterTargetMemoryIds:afterVisible,removedPreviouslyTargetMemoryIds:beforeVisible.filter((id:string)=>!afterVisible.includes(id)),satisfied:!afterOrdinaryTarget||afterVisible.length>0}
 })}
})
const result={role:'bounded preservation and actual card-selection check for four existing memory_required owners; no full454, new native M or CQR claim',memoryNodeCount:memoryNodes.length,changedMemoryNodes,requiredOwners:required,nodeSelections,viewCount:viewRows.length,viewRows,failedRequirements:viewRows.flatMap(v=>v.requirements.filter((r:any)=>!r.satisfied||r.removedPreviouslyTargetMemoryIds.length).map((r:any)=>({viewId:v.viewId,...r})))}
if(changedMemoryNodes.length||viewRows.length!==41||result.failedRequirements.length)throw Error(JSON.stringify({changedMemoryNodes,viewCount:viewRows.length,failedRequirements:result.failedRequirements}))
console.log(JSON.stringify(result,null,2))
