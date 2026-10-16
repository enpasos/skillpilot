// SPDX-License-Identifier: Apache-2.0
// B original independent, bounded, in-memory route inspection; no host writes.
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
const root=path.resolve(process.cwd(),'..')
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-source3-six-contexts-current422-native-fresh-independent-b-20261015-v1'
const prep='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-source3-six-contexts-current422-native-preparation-root-20261015-v1'
const read=(p:string)=>JSON.parse(readFileSync(path.join(root,p),'utf8'))
const map=read(prep+'/checks/REBUILD.prospective422-nine.physical-map.json')
const selector=read(prep+'/NEUTRAL.native-nine-physical-inputs.json')
const landscape=read(selector.wholeCanonical.path)
const ix=new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g]))
const host='tmp/chemie-m7-resumed-20261015/source3-six-native-host'
const stock=await import(pathToFileURL(path.join(root,host,'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const results=[]
for(const name of ['de-hb-lk','de-hb-gk','de-bw-lk','de-bw-gk']){
 const alias='curricula/DE/Gymnasium/composition-views/chemie/'+name+'.view.json'
 const bound=map.aliases.find((a:any)=>a.normalHostAlias===alias).physicalRepositorySource
 const view=read(bound.path)
 const compiled=stock.compileCompositionView(view,landscape)
 const roles=stock.collectCompositionProjectionRoleGoalIds(view.rootNodes,ix)
 const visible=new Set<string>()
 const visit=(nodes:any[])=>{for(const n of nodes){if(n.sourceGoalId)visible.add(n.sourceGoalId);visit(n.children??[])}}
 visit(compiled.compiledRootNodes)
 const reach=(id:string)=>{
  const seen=new Set<string>(); const queue=[...(ix.get(id)?.requires??[])]
  for(let i=0;i<queue.length;i++){
   const p=queue[i]; if(seen.has(p))continue;seen.add(p);const g=ix.get(p);if(!g)continue;
   queue.push(...(g.requires??[]));if(g.type==='cluster'||g.contains?.length)queue.push(...g.contains)
  }
  return [...seen].map(id=>({goalId:id,title:ix.get(id)?.title,kind:ix.get(id)?.type,visible:visible.has(id),target:roles.targetGoalIds.has(id),prerequisiteOnly:roles.prerequisiteOnlyGoalIds.has(id)}))
 }
 results.push({name,source:bound,scope:view.scope,stockCompilerFindings:compiled.findings,compiledGoalCount:visible.size,targetGoalCount:roles.targetGoalIds.size,prerequisiteOnlyGoalCount:roles.prerequisiteOnlyGoalIds.size,selected:selector.goalIds.map((goalId:string)=>({goalId,title:ix.get(goalId).title,visible:visible.has(goalId),target:roles.targetGoalIds.has(goalId),prerequisiteOnly:roles.prerequisiteOnlyGoalIds.has(goalId),expandedRequiredRoute:reach(goalId)}))})
}
const output={schemaVersion:1,executedAtUTC:new Date().toISOString(),role:'B own original mechanical course/route witness, interpreted separately',canonical:selector.wholeCanonical,stockCompilerPath:host+'/app/src/utils/authoring/compositionViewAuthoring.ts',routeSemantics:'Recursively requires and children of required clusters; this is an authored acquisition-route witness, not a runtime frontier simulation or learner mastery assertion.',results}
writeFileSync(path.join(root,own,'read/compiled-four-course-routes.actual.json'),JSON.stringify(output,null,2)+'\n')
console.log(JSON.stringify(results.map(r=>({name:r.name,compiledGoalCount:r.compiledGoalCount,errors:r.stockCompilerFindings.filter((f:any)=>f.severity==='error').length,selected:r.selected.map(g=>({id:g.goalId,visible:g.visible,missingRequired:g.expandedRequiredRoute.filter(p=>!p.visible&&!p.prerequisiteOnly).map(p=>({id:p.goalId,title:p.title,kind:p.kind}))}))})),null,2))
