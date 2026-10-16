// SPDX-License-Identifier: Apache-2.0
import {readFileSync,readdirSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
const R=resolve('.')
const E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
const O=`${E}/chemie-current639-extra-exam-route-boundary-readonly-b-20261016-v1`
const K=resolve('tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>`sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`
const canonical=`${K}/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json`
const landscape=read(canonical)
const by=new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g]))
const diagnosticPath=`${E}/chemie-current437-nine-targeted-native-pages-combined639-technical-20261016-v1/CHECK.actual-combined639-stock82-and39views.before-Fruit-practical-placement.json`
const diagnostic=read(diagnosticPath)
const applicability=new Map<string,any>(diagnostic.stockChemistryReport.goals.map((g:any)=>[g.goalId,g.compiledApplicability]))
const {collectCompositionProjectionRoleGoalIds}=await import(`${K}/app/src/utils/authoring/compositionViewAuthoring.ts`)
const {convertLearningGoal}=await import(`${K}/app/src/goalTypes.ts`)
const {goalMatchesFilters}=await import(`${K}/app/src/utils/goalFilters.ts`)
const parent=new Map<string,string[]>()
for(const g of by.values())for(const id of g.contains??[])parent.set(id,[...(parent.get(id)??[]),g.id])
const core=(g:any)=>!g.tags?.length||g.tags.includes('GK')
function coreLeaves(id:string,path:string[]=[],seen=new Set<string>()):any[]{
 if(seen.has(id))return [];const g=by.get(id);if(!g)return []
 if(!g.contains?.length)return [{goalId:id,title:g.title,path:[...path,id]}]
 let children=g.contains.filter((id:string)=>by.has(id));if(children.some((id:string)=>core(by.get(id))))children=children.filter((id:string)=>core(by.get(id)))
 return children.flatMap((c:string)=>coreLeaves(c,[...path,id],new Set([...seen,id])))
}
function inheritedRequires(id:string,seen=new Set<string>()):string[]{
 if(seen.has(id))return [];seen.add(id)
 return [...new Set([...(by.get(id)?.requires??[]),...(parent.get(id)??[]).flatMap(p=>inheritedRequires(p,seen))])].filter(x=>x!==id)
}
function ancestors(id:string,seen=new Set<string>()):string[]{
 if(seen.has(id))return [];seen.add(id);return [...new Set([...(parent.get(id)??[]),...(parent.get(id)??[]).flatMap(p=>ancestors(p,seen))])]
}
const sourceRoles=[]
const views=[]
for(const d of diagnostic.views){
 const p=`${K}/curricula/DE/Gymnasium/composition-views/chemie/${d.file}`
 const view=read(p)
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,by)
 const filters=[view.scope.courseProfile,view.scope.jurisdiction].filter(Boolean)
 const target=new Set<string>([...roles.targetGoalIds].filter(id=>by.has(id)&&goalMatchesFilters(convertLearningGoal({...by.get(id),applicability:{...by.get(id).applicability,...applicability.get(id)}},{landscapeId:landscape.landscapeId}),filters)))
 const support=new Set<string>(roles.prerequisiteOnlyGoalIds)
 const permitted=(id:string)=>target.has(id)||support.has(id)
 function obligations(id:string,seen=new Set<string>()):any[]{
  if(seen.has(id))return [];seen.add(id)
  const g=by.get(id);if(!g)return []
  const out=[]
  for(const req of inheritedRequires(id)){
   const direct=(g.requires??[]).includes(req)
   if(!by.has(req)){out.push({kind:'unknownReference',from:id,to:req,direct});continue}
   if(!permitted(req)){
    if(direct)out.push({kind:'directRequirementOutsideTargetAndSupport',from:id,to:req,title:by.get(req).title})
    // Backend ignores only inherited legacy requirements that are outside both authored roles.
    continue
   }
   const leaves=coreLeaves(req)
   for(const leaf of leaves)if(!permitted(leaf.goalId))out.push({kind:'globalCoreClusterMasteryDependsOnOutsideLeaf',from:id,cluster:req,leaf:leaf.goalId,title:leaf.title,path:leaf.path})
   for(const leaf of leaves)if(permitted(leaf.goalId))out.push(...obligations(leaf.goalId,seen))
  }
  return out
 }
 const terms=d.terminals.map((t:any)=>{
  const g=by.get(t.goalId);const e=g.examData
  const globalOfferAncestors=ancestors(g.id).filter(id=>by.get(id).release?.kind==='offer')
  const direct=(g.requires??[]).map((id:string)=>({goalId:id,title:by.get(id)?.title,isCluster:!!by.get(id)?.contains?.length,inTarget:target.has(id),inPrerequisiteOnly:support.has(id),globalCoreOutsideLeaves:coreLeaves(id).filter(x=>!permitted(x.goalId))}))
  const directMissing=direct.filter((x:any)=>!x.inTarget&&!x.inPrerequisiteOnly&&by.has(x.goalId))
  const clusterMissing=direct.filter((x:any)=>x.isCluster&&(x.inTarget||x.inPrerequisiteOnly)&&x.globalCoreOutsideLeaves.length)
  const rawCount=(t.outsideOrdinaryPrerequisites??[]).length
  const closure=obligations(g.id)
  const unique=[...new Map(closure.map(x=>[JSON.stringify(x),x])).values()]
  return {goalId:g.id,title:g.title,nodeKind:g.nodeKind??null,tags:g.tags,canonicalContains:g.contains??[],canonicalParentIds:parent.get(g.id)??[],examReviewStatus:e?.reviewStatus??null,taskPresent:!!e?.taskContent,solutionPresent:!!e?.solutionContent,scoring:e?.scoring??null,globalOfferAncestors,authoredTarget:target.has(g.id),prerequisiteOnly:support.has(g.id),includedInAtomicPlanningCount:target.has(g.id)&&g.type!=='cluster',directRequirements:direct,directMissingIds:directMissing.map((x:any)=>x.goalId),directClusterCoreOutsideWitnesses:clusterMissing.map((x:any)=>({cluster:x.goalId,leaves:x.globalCoreOutsideLeaves})),sourceBasedReachabilityWitnesses:unique,rawOutsideOrdinaryCount:rawCount,rawDiagnosticNotEquivalentToRuntime:true,immediateRouteBoundary:(directMissing.length||clusterMissing.length)?'real_direct_or_global_cluster_boundary':'no_immediate_boundary_from_raw_list',statusGate:e&&e.reviewStatus&&e.reviewStatus!=='released'?'not_released_hard_check_unavailable':'no_review_status_block',notExecutedBackendSession:true}
 })
 views.push({file:d.file,scope:view.scope,currentViewSha256:sha(p),rawDiagnosticViewSha256:d.viewSHA256,currentViewEqualsDiagnostic:sha(p)===d.viewSHA256,targetGoalIds:[...target].sort(),prerequisiteOnlyGoalIds:[...support].sort(),terminals:terms})
}
const result={role:'Read-only independent B source-based semantic classification; actual current files/stock role and tag functions, not an executed Java learner session',canonicalSha256:sha(canonical),diagnosticInput:{path:diagnosticPath,sha256:sha(diagnosticPath)},views,ruleSources:{directVsInherited:'backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:6083',globalCoreMastery:'backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:6723',examStatus:'backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:8520',offerOptIn:'backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:8556',planningCount:'backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:2670'},HumanApproval:false,HumanTrial:false,M7Claim:false}
writeFileSync(`${R}/${O}/TRACE.current39-route-boundaries.source-based.independent-b.json`,JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({views:views.length,terminalViewOccurrences:views.flatMap(v=>v.terminals).length,rawOutsideOccurrences:views.flatMap(v=>v.terminals).filter(t=>t.rawOutsideOrdinaryCount).length,immediateRealBoundaries:views.flatMap(v=>v.terminals).filter(t=>t.immediateRouteBoundary==='real_direct_or_global_cluster_boundary').length}))
