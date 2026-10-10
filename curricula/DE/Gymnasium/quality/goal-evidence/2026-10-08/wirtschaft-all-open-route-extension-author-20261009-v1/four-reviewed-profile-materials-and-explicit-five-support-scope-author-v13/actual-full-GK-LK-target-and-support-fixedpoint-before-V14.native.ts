import {readFileSync,writeFileSync} from 'node:fs'
import {buildEffectiveRequiresEdges,buildAtomicDirectRequiresEdges,collectRenderedAtomicGoalIdsFromCompositionView} from './actual-all-route-quality-original-body-export-probe.ts'
const root='/home/enpasos/projects/skillpilot'
const relative='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/four-reviewed-profile-materials-and-explicit-five-support-scope-author-v13'
const base=root+'/'+relative
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const meta=read(base+'/actual-own-CAN407-reviewed-material-isolate-and-bounded-five-support-scope.author.receipt.json')
const can=read(base+'/whole-V13-CAN407-four-exact-Root-machine-released-materials.inert.candidate.json')
const goalById=new Map(can.goals.map((g:any)=>[g.id,g]))
const results:any[]=[]
for(const course of ['GK','LK']){
 const view=meta.physicalIsolate+'/curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-'+course.toLowerCase()+'.view.json'
 const targets=collectRenderedAtomicGoalIdsFromCompositionView(can,view,[course],false)
 const visible=collectRenderedAtomicGoalIdsFromCompositionView(can,view,[course],true)
 for(const [kind,edges] of [['actual-effective-direct-and-inherited',buildEffectiveRequiresEdges(can)],['actual-atomic-direct',buildAtomicDirectRequiresEdges(can)]] as const){
  const queue=[...visible].map(id=>({id,path:[id]})),seen=new Set<string>(),firstPaths=new Map<string,string[]>()
  while(queue.length){const {id,path}=queue.shift()!;if(seen.has(id))continue;seen.add(id);firstPaths.set(id,path);for(const next of edges.get(id)??[])queue.push({id:next,path:[...path,next]})}
  const missing=[...seen].filter(id=>!visible.has(id)).sort().map(id=>({goalId:id,title:(goalById.get(id) as any)?.title,wholeCurrentGoal:goalById.get(id),firstActualRequiringPath:firstPaths.get(id)}))
  results.push({courseProfile:course,edgeContract:kind,actualSeedVisibleTargets:targets.size,actualSeedPrerequisiteOnly:visible.size-targets.size,actualFullFixedpointGoalCount:seen.size,actualSeedGoalIds:[...visible].sort(),actualFixedpointGoalIds:[...seen].sort(),missingRequiredSupportGoals:missing,finiteFixedpointReached:true})
 }
}
const missingIds=[...new Set(results.flatMap(r=>r.missingRequiredSupportGoals.map((g:any)=>g.goalId)))].sort()
writeFileSync(base+'/actual-full-V13-GK-LK-target-support-direct-inherited-fixedpoint-closure.diagnostic.json',JSON.stringify({schemaVersion:1,kind:'actual-whole-course-fixedpoint-before-required-support-successor',results,uniqueMissingGoalIds:missingIds,depthLimitUsed:false,noAutomaticLiveRoleInference:true,qualityApproval:false,newStrictClosures:0,liveWrites:[]},null,2)+'\n')
console.log(JSON.stringify({uniqueMissingGoalIds:missingIds,results:results.map(r=>({course:r.courseProfile,edgeContract:r.edgeContract,seeds:r.actualSeedVisibleTargets+r.actualSeedPrerequisiteOnly,fixedpoint:r.actualFullFixedpointGoalCount,missing:r.missingRequiredSupportGoals.map((g:any)=>({goalId:g.goalId,path:g.firstActualRequiringPath}))}))},null,2))
