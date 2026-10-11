import {readFileSync,writeFileSync} from 'node:fs'
import {convertLearningGoal} from '../src/goalTypes'
import {normalizeCompositionView} from '../src/utils/authoring/compositionViewAuthoring'
import {applyCompositionViewProjection} from '../src/utils/compositionViewRuntime'
import {goalMatchesFilters} from '../src/utils/goalFilters'
import {buildDirectChildrenMap,getRenderedChildIds} from '../src/utils/treeProjectionRuntime'
import {buildEffectiveRequiresEdges,buildAtomicDirectRequiresEdges,collectRenderedAtomicGoalIdsFromCompositionView,routeProfiles} from './actual-all-route-quality-original-body-export-probe.ts'

const root='/home/enpasos/projects/skillpilot'
const baseRel='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1'
const relative=baseRel+'/seven-explicit-profile-support-and-full-fixedpoint-scope-author-v14'
const base=root+'/'+relative
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const meta=read(base+'/actual-new-CAN407-exact-seven-profile-support-scope-isolate.author.receipt.json')
const v10root=root+'/'+baseRel+'/final-thirteen-released-current311-P311-native-preparation-v10'
const can=read(root+'/'+meta.canonicalWholePath)
const v10=read(v10root+'/whole-current300-plus-Generic11-and-thirteen-root-material-released-terminals.inert.candidate.json')
const profile=routeProfiles.find((p:any)=>p.profileId==='canonical-economics-crossstage')!
const newExams=read(root+'/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-four-real-route-materials-independent-root-v1/whole-four-KEEP-terminal-goals.only-machine-material-status-released.json')
// This traversal calls actual first-party conversion, composition and tree rendering.
// It retains visible canonical cluster IDs, which the native atomic collector intentionally omits.
const visibleCanonicalClusters=(landscape:any,viewPath:string,course:string)=>{
 const entry={meta:landscape,goals:landscape.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:landscape.landscapeId}))}
 const projected=applyCompositionViewProjection([entry],normalizeCompositionView(read(viewPath)))[0]
 if(!projected)throw Error('No projected entry')
 const by=new Map(projected.goals.map(g=>[g.id,g])),children=buildDirectChildrenMap(by)
 children.forEach((ids,parent)=>children.set(parent,ids.filter(id=>{const g=by.get(id);return !!g&&goalMatchesFilters(g,[course])})))
 const q=projected.goals.filter(g=>(g.tags??[]).includes('root')).map(g=>g.id),seen=new Set<string>()
 while(q.length){const id=q.pop()!;if(seen.has(id))continue;seen.add(id);q.push(...getRenderedChildIds(id,by,children))}
 const source=new Map(landscape.goals.map((g:any)=>[g.id,g]))
 return new Set([...seen].filter(id=>!id.startsWith('composition:')&&((source.get(id) as any)?.contains??[]).length>0))
}
const results:any[]=[],examResults:any[]=[]
for(const [label,landscape,iso] of [['V10-original-before-route-remedy',v10,'/tmp/skillpilot-wirtschaft-all-open-routes-author-enhnmop5'],['V14-four-reviewed-endpoints-and-seven-explicit-profile-support',can,meta.physicalIsolate]] as const){
 const by=new Map(landscape.goals.map((g:any)=>[g.id,g]))
 for(const course of ['GK','LK']){
  const view=iso+'/curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-'+course.toLowerCase()+'.view.json'
  const targets=collectRenderedAtomicGoalIdsFromCompositionView(landscape,view,[course],false)
  const atomicVisible=collectRenderedAtomicGoalIdsFromCompositionView(landscape,view,[course],true)
  const clusters=visibleCanonicalClusters(landscape,view,course)
  const allVisible=new Set([...atomicVisible,...clusters])
  for(const [edgeContract,edges] of [['effective-direct-and-inherited',buildEffectiveRequiresEdges(landscape)],['atomic-direct',buildAtomicDirectRequiresEdges(landscape)]] as const){
   const seeds=edgeContract==='atomic-direct'?atomicVisible:allVisible
   const q=[...seeds].map(id=>({id,path:[id]})),seen=new Set<string>(),paths=new Map<string,string[]>()
   while(q.length){const {id,path}=q.shift()!;if(seen.has(id))continue;seen.add(id);paths.set(id,path);for(const next of edges.get(id)??[])q.push({id:next,path:[...path,next]})}
   const missing=[...seen].filter(id=>!allVisible.has(id)).sort().map(id=>({goalId:id,wholeCurrentGoal:by.get(id),firstActualRequiringPath:paths.get(id),sourceKind:((by.get(id) as any)?.contains??[]).length?'canonicalCluster':'atomic'}))
   const terminalIds=new Set<string>(profile.terminalAutonomyClusterIds.flatMap((id:string)=>landscape.goals.find((g:any)=>g.id===id)?.contains??[]))
   results.push({label,courseProfile:course,edgeContract,targetAtomicIds:[...targets].sort(),ordinarySelectedTargetIds:landscape.goals.filter((g:any)=>targets.has(g.id)&&profile.goalSelector(g)).map((g:any)=>g.id).sort(),availableTargetAndSupportAtomicIds:[...atomicVisible].sort(),actualVisibleCanonicalClusterIds:[...clusters].sort(),actualFullFixedpointGoalIds:[...seen].sort(),missingRequiredSupportGoals:missing,missingRequiredByHistoricalTerminalIds:[...new Set(missing.map(r=>r.firstActualRequiringPath[0]).filter(id=>terminalIds.has(id)))].sort(),finiteFixedpointReached:true,depthLimitUsed:false})
   if(label.startsWith('V14'))for(const exam of newExams){
    const q2=[...(edges.get(exam.id)??[])],seen2=new Set<string>()
    while(q2.length){const id=q2.shift()!;if(seen2.has(id))continue;seen2.add(id);q2.push(...(edges.get(id)??[]))}
    examResults.push({courseProfile:course,edgeContract,examGoalId:exam.id,actualWholeTransitivePrerequisiteIds:[...seen2].sort(),missing:[...seen2].filter(id=>!allVisible.has(id)).sort()})
   }
  }
 }
}
const comparisons=results.filter(r=>r.label.startsWith('V14')).map(a=>{const before=results.find(r=>r.label.startsWith('V10')&&r.courseProfile===a.courseProfile&&r.edgeContract===a.edgeContract)!;const oldMissing=new Set(before.missingRequiredSupportGoals.map((r:any)=>r.goalId));return{courseProfile:a.courseProfile,edgeContract:a.edgeContract,allOrdinarySelectedTargetIdsExact:JSON.stringify(before.ordinarySelectedTargetIds)===JSON.stringify(a.ordinarySelectedTargetIds),beforeMissing:before.missingRequiredSupportGoals.length,afterMissing:a.missingRequiredSupportGoals.length,historicalUnchangedMissingIds:a.missingRequiredSupportGoals.filter((r:any)=>oldMissing.has(r.goalId)).map((r:any)=>r.goalId),newMissingIds:a.missingRequiredSupportGoals.filter((r:any)=>!oldMissing.has(r.goalId)).map((r:any)=>r.goalId),resolvedOldMissingIds:before.missingRequiredSupportGoals.filter((r:any)=>!a.missingRequiredSupportGoals.some((n:any)=>n.goalId===r.goalId)).map((r:any)=>r.goalId)}})
if(comparisons.some(c=>!c.allOrdinarySelectedTargetIdsExact)||examResults.some(e=>e.missing.length))throw Error('New ordinary target or new-four-exam prerequisite fault')
const report={schemaVersion:1,kind:'whole-actual-course-target-support-direct-inherited-fixedpoint-historical-delta',results,comparisons,newFourExamClosure:examResults,newFourExamsFullClosureMissing:0,wholeScopeApproval:false,wholeScopeRemainingOpen:comparisons.some(r=>r.afterMissing>0),noBlanketSupportOrRequiresEdits:true,newStrictClosures:0,liveWrites:[]}
writeFileSync(base+'/actual-whole-V10-to-V14-GK-LK-rendered-target-support-fixedpoint-and-four-new-exams.report.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({comparisons:comparisons.map(c=>({course:c.courseProfile,edgeContract:c.edgeContract,beforeMissing:c.beforeMissing,afterMissing:c.afterMissing,newMissing:c.newMissingIds,resolved:c.resolvedOldMissingIds})),newFourExamClosureScopes:examResults.length,newFourExamMissing:0,wholeScopeStillOpen:report.wholeScopeRemainingOpen},null,2))
