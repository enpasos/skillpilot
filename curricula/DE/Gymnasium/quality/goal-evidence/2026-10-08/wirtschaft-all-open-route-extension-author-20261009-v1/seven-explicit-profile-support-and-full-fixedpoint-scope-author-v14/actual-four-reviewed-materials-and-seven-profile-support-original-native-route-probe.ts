import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {buildApplicabilityCompilation} from './applicabilityCompiler.ts'
import {evaluateRouteProfile,evaluateGraphIntegrity,evaluateTypeConsistency,routeProfiles,buildAtomicDirectRequiresEdges,collectRenderedAtomicGoalIdsFromCompositionView} from './actual-all-route-quality-original-body-export-probe.ts'

const root='/home/enpasos/projects/skillpilot'
const relative='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/seven-explicit-profile-support-and-full-fixedpoint-scope-author-v14'
const previous='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/seven-unnecessary-historical-exam-prerequisites-author-remedy-v11'
const base=root+'/'+relative
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(b:Buffer)=>createHash('sha256').update(b).digest('hex')
const iso=read(base+'/actual-new-CAN407-exact-seven-profile-support-scope-isolate.author.receipt.json').physicalIsolate
const can=iso+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const after=read(root+'/'+read(base+'/actual-new-CAN407-exact-seven-profile-support-scope-isolate.author.receipt.json').canonicalWholePath)
const before=read(root+'/'+previous+'/whole-V11-CAN403-seven-prerequisites-removed.inert.candidate.json')
const newIds=read(root+'/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/four-real-profile-route-materials-author-candidates-v12/whole-four-profile-route-terminal-DRAFT-goals.author.candidate.json').map((g:any)=>g.id)
const requiredSeven=read(root+'/'+previous+'/selective-exact-seven-requires-removal.author.candidate.json').fieldChanges.flatMap((g:any)=>g.removeExactly)
const profile=routeProfiles.find((p:any)=>p.profileId==='canonical-economics-crossstage')!
const memoryConfig=read(root+'/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-by-ten-current311-specific-native-preparation-technical-v1/current300-source35-scope2-contract479-selective-technical-v1/memory.config.json')
const memoryRecords=readFileSync(root+'/'+memoryConfig.reviewPath,'utf8').split(/\r?\n/u).filter(Boolean).map(l=>JSON.parse(l)).filter((d:any)=>d.decision==='memory_required'||d.status==='memory_required')
const results:any[]=[]
for(const [label,landscape] of [['V11-seven-real-route-gaps',before],['V14-four-Root-material-released-and-explicit-seven-profile-support-endpoints',after]] as const){
 writeFileSync(can,JSON.stringify(landscape,null,2)+'\n')
 const compilation=buildApplicabilityCompilation()
 const graph=evaluateGraphIntegrity(landscape,new Set(landscape.goals.map((g:any)=>g.id)))
 const type=evaluateTypeConsistency(landscape)
 const route=evaluateRouteProfile(landscape,profile,compilation)
 const edges=buildAtomicDirectRequiresEdges(landscape)
 const local:any[]=[]
 for(const course of ['GK','LK']){
  const viewPath=iso+'/curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-'+course.toLowerCase()+'.view.json'
  const targets=collectRenderedAtomicGoalIdsFromCompositionView(landscape,viewPath,[course],false)
  const visible=collectRenderedAtomicGoalIdsFromCompositionView(landscape,viewPath,[course],true)
  const reverse=new Map<string,string[]>()
  for(const [goalId,requires] of edges){if(!targets.has(goalId))continue;for(const req of requires)if(targets.has(req))reverse.set(req,[...(reverse.get(req)??[]),goalId])}
  const terminals=new Set<string>(profile.terminalAutonomyClusterIds.flatMap((id:string)=>landscape.goals.find((g:any)=>g.id===id)?.contains??[]).filter((id:string)=>targets.has(id)))
  const find=(start:string):string[]|null=>{const q:Array<[string,string[]]>=[[start,[start]]],seen=new Set<string>();while(q.length){const [id,path]=q.shift()!;if(seen.has(id))continue;seen.add(id);if(terminals.has(id))return path;for(const next of reverse.get(id)??[])q.push([next,[...path,next]])}return null}
  const selected=landscape.goals.filter((g:any)=>targets.has(g.id)&&profile.goalSelector(g))
  const memoryVisibility=memoryRecords.filter((d:any)=>targets.has(d.goalId)).map((d:any)=>({goalId:d.goalId,memoryGoalIds:d.memoryGoalIds,visibleMemoryGoalIds:(d.memoryGoalIds??[]).filter((id:string)=>targets.has(id)),satisfied:(d.memoryGoalIds??[]).some((id:string)=>targets.has(id))}))
  local.push({courseProfile:course,actualTargetAtomicIds:[...targets].sort(),actualPrerequisiteOnlyIds:[...visible].filter(id=>!targets.has(id)).sort(),selectedOrdinaryGoalIds:selected.map((g:any)=>g.id).sort(),missingVisibleOnlyTerminalRoutes:selected.filter((g:any)=>!find(g.id)).map((g:any)=>({goalId:g.id,title:g.title})),sevenActualOwnerRoutes:requiredSeven.map((id:string)=>({goalId:id,targetVisible:targets.has(id),visibleOnlyTerminalPath:targets.has(id)?find(id):null})),fourNewEndpoints:newIds.map((id:string)=>({goalId:id,targetVisible:targets.has(id),allDirectPrerequisitesVisible:(landscape.goals.find((g:any)=>g.id===id)?.requires??[]).every((r:string)=>visible.has(r)),directPrerequisites:(landscape.goals.find((g:any)=>g.id===id)?.requires??[]).map((r:string)=>({goalId:r,targetVisible:targets.has(r),prerequisiteOnlyVisible:visible.has(r)&&!targets.has(r)}))})),actualRequiredMemoryVisibility:memoryVisibility,viewWholeSHA256:sha(readFileSync(viewPath))})
 }
 results.push({label,wholeCanonicalSHA256:sha(readFileSync(can)),graph,type,route,local})
}
const targetComparison=results[0].local.map((b:any)=>{const a=results[1].local.find((s:any)=>s.courseProfile===b.courseProfile);return{courseProfile:b.courseProfile,allOrdinarySelectedGoalIdsExact:JSON.stringify(a.selectedOrdinaryGoalIds)===JSON.stringify(b.selectedOrdinaryGoalIds),beforeAllTargetAtomicCount:b.actualTargetAtomicIds.length,afterAllTargetAtomicCount:a.actualTargetAtomicIds.length,actualAddedTargetIds:a.actualTargetAtomicIds.filter((id:string)=>!b.actualTargetAtomicIds.includes(id)),actualRemovedTargetIds:b.actualTargetAtomicIds.filter((id:string)=>!a.actualTargetAtomicIds.includes(id)),viewWholeExact:b.viewWholeSHA256===a.viewWholeSHA256,memoryVisibilityWholeExact:JSON.stringify(a.actualRequiredMemoryVisibility)===JSON.stringify(b.actualRequiredMemoryVisibility),memoryChecks:a.actualRequiredMemoryVisibility.length,missingMemory:a.actualRequiredMemoryVisibility.filter((r:any)=>!r.satisfied)}})
if(targetComparison.some((r:any)=>!r.allOrdinarySelectedGoalIdsExact||r.actualRemovedTargetIds.length||!r.memoryVisibilityWholeExact||r.missingMemory.length))throw Error('Unplanned ordinary target, view or memory change')
const report={schemaVersion:1,kind:'actual-original-native-body-Root-material-reviewed-and-author-bounded-support-scope-route-check',qualityApproval:false,newStrictClosures:0,liveWrites:[],noRuleThresholdSelectorOrScopeFlagChanges:true,allFourMaterialBodiesRootIndependentlyMachineReleased:true,noSourceCourseOrDApprovalClaimed:true,results,targetComparison}
writeFileSync(base+'/actual-reviewed407-seven-profile-support-original-native-route-graph-and-memory.report.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({graph:results[1].graph.status,type:results[1].type.status,rules:results[1].route.rules.map((r:any)=>({id:r.id,status:r.status,metrics:r.metrics,details:r.details})),local:results[1].local.map((s:any)=>({course:s.courseProfile,missing:s.missingVisibleOnlyTerminalRoutes,newEndpointScopes:s.fourNewEndpoints})),targetComparison},null,2))

