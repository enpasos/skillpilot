// SPDX-License-Identifier: Apache-2.0
// Technical binding check only; no scientific or edge decision.
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { syncBuiltinESMExports } from 'node:module'
const R='/home/enpasos/projects/skillpilot'
const O=process.cwd()
if(O!==R+'/tmp/cross-subject-requires/current92-first20-whole-integration-author-20261016-v1/binding-audit') throw Error('wrong output scope')
const reads=new Set<string>()
const originalRead=fs.readFileSync
fs.readFileSync=function(file:any,...args:any[]){
 const result=(originalRead as any)(file,...args)
 try { const p=path.resolve(file instanceof URL ? file.pathname : String(file)); if(p.startsWith(R+'/')) reads.add(p) } catch {}
 return result
} as any
syncBuiltinESMExports()
const { buildRequiresInventory,readActiveLandscapes,stableJson,fingerprint }=await import(R+'/app/scripts/lib/crossSubjectRequiresInventory.ts')
const { buildCrossLandscapeGraph }=await import(R+'/app/scripts/lib/crossLandscapeGraph.ts')
const { reviewPositiveGoalEvidenceConfig }=await import(R+'/app/scripts/positiveGoalEvidenceReview.ts')
const read=(p:string)=>JSON.parse(fs.readFileSync(path.resolve(R,p),'utf8'))
const write=(n:string,d:any)=>fs.writeFileSync(path.join(O,n),JSON.stringify(d,null,2)+'\n')
const neutralBase='tmp/cross-subject-requires/current92-whole-integration-neutral-reader-root-20261016-v1/'
const first=read(neutralBase+'NEUTRAL-FIRST20-WHOLE-PHYSICS-CONTEXTS.actual.json')
const configPath='curricula/quality/cross-subject-requires/math-physics.config.json'
const inventoryPath='curricula/quality/cross-subject-requires/math-physics.inventory.json'
const config=read(configPath)
const current=buildRequiresInventory(R,config)
const persisted=read(inventoryPath)
const owners=[...new Set<string>(first.map((x:any)=>x.current.positiveEvidenceOwner.configPath))]
const nativeP=owners.map(configPath=>{
 try {
  const result=reviewPositiveGoalEvidenceConfig(configPath)
  return {configPath,reviewPath:result.config.reviewPath,scopeCount:result.config.scope.goalIds.length,counts:result.counts,errors:result.errors,
   requestedRecords:first.filter((x:any)=>x.current.positiveEvidenceOwner.configPath===configPath).map((x:any)=>{
    const records=result.records.filter((r:any)=>r.goalId===x.goalId)
    return {goalId:x.goalId,matchedRecordCount:records.length,wholePExact:records.length===1&&stableJson(records[0])===stableJson(x.current.positiveEvidenceOwner.wholeP)}
   })}
 }catch(e){return {configPath,errors:[String(e)],stack:e instanceof Error?e.stack:null}}
})
const family=current.families.find((x:any)=>x.familyId==='canonical-gymnasium')!
const nativeRows=first.map((x:any)=>{
 const row=family.goals.find((g:any)=>g.goalId===x.goalId)
 const matches=row?.occurrences.filter((o:any)=>o.selected)??[]
 return {goalId:x.goalId,nativeInventoryRow:row??null,selectedOccurrenceCount:matches.length,
  wholeGoalFingerprintMatches:matches.length===1&&matches[0].definitionSha256===fingerprint(x.current.goal),
  semanticKindMatches:matches.length===1&&matches[0].semanticKind===x.current.kind.semanticKind}
})
write('native-binding-check.actual.json',{technicalOnly:true,inventoryExact:stableJson(current)===stableJson(persisted),inventoryConfigPath:configPath,
 inventoryPath,familyCounts:family.counts,globalDiagnostics:current.activeDefinitionConflicts,nativeRows,nativeP})
const graph=buildCrossLandscapeGraph(readActiveLandscapes(R,{...config,excludedDirectories:['quality']}))
const nominees=['a6469c01-6ca3-5eb2-a82c-94f3d0560b32','a8c42ee9-2898-4247-819f-c235032ac78a','858113c5-e53b-57bb-b01f-ba95c3ddcb6f','325771e1-602d-4bca-a199-a8f39a2d3dee','4eeab7d5-eeb3-579b-845e-1c52ffe9e89f','54541d08-61cc-5a6d-b6d9-d0270a7d1949','b1dcc191-d046-50de-984a-ee5c17157628','54148506-c23f-41b8-959b-068dd194cf15','2231c29b-eb4e-51ae-9cb1-eb033bf16099','af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186','26f668a0-6425-5466-9cf7-6295dd189005','ee48e811-4c9c-5080-9836-8403fc9f0810','80c232f1-8f72-5829-9dbe-5a610ccab3be','11e3cf89-9224-5894-8e4a-ae8ff5af0119','671ef00a-034e-5c2b-85ef-c6fa6eb7f1f6','97b3232d-b89f-48b8-9fa1-7a25a1bdbb3d','0c2ddfcd-1399-41ad-aaed-4f061812602a','596345cd-679e-5c7b-955f-e8cb1ec81e96']
const node=(key:string)=>{const n=graph.nodes.get(key)!;return {key,goalId:n.goal.id,title:n.goal.title,landscapeId:n.landscapeId,path:n.file,goalSha256:fingerprint(n.goal)}}
const containsPath=(ancestor:string,descendant:string)=>{
 const queue=[ancestor],prev=new Map<string,string|null>([[ancestor,null]])
 for(let i=0;i<queue.length;i++)for(const child of graph.contains.get(queue[i])??[]){if(!prev.has(child)){prev.set(child,queue[i]);queue.push(child)}}
 if(!prev.has(descendant))return null
 const out=[];for(let k:string|null=descendant;k!==null;k=prev.get(k)??null)out.push(k);return out.reverse()
}
const edge=(from:string,to:string)=>({from,to,origins:(graph.effectiveOrigins.get(from)??[]).filter(o=>o.prerequisiteKey===to).map(o=>({...o,
 declaredByPath:graph.nodes.get(o.declaredByKey)?.file,declaredByGoalSha256:fingerprint(graph.nodes.get(o.declaredByKey)?.goal),
 containsPathFromDeclaringAncestor:o.inherited?containsPath(o.declaredByKey,from):[from]}))})
const closureRows=first.map((x:any)=>{
 const key=x.current.positiveEvidenceOwner.wholeP.landscapeId+':'+x.goalId
 const queue=[key],prev=new Map<string,string|null>([[key,null]])
 for(let i=0;i<queue.length;i++)for(const target of graph.effectiveRequires.get(queue[i])??[]){if(!prev.has(target)){prev.set(target,queue[i]);queue.push(target)}}
 const closure=queue.filter(k=>k!==key).sort()
 const relevant=new Set(queue)
 const edges=queue.flatMap(from=>(graph.effectiveRequires.get(from)??[]).map(to=>edge(from,to)))
 const paths=nominees.map(goalId=>{
  const matches=closure.filter(k=>graph.nodes.get(k)?.goal.id===goalId)
  const existingPath=matches.length?(()=>{const ks=[];for(let k:string|null=matches[0];k!==null;k=prev.get(k)??null)ks.push(k);ks.reverse();return {keys:ks,edges:ks.slice(0,-1).map((k,i)=>edge(k,ks[i+1]))}})():null
  return {goalId,reachable:matches.length>0,matchingKeys:matches,existingPath}
 })
 const sourceInventoryRow=family.goals.find(g=>g.goalId===x.goalId)!
 const sourceOccurrence=sourceInventoryRow.occurrences.find(o=>o.key===key)!
 const inventoryEffective=(persisted as any).effectivePrerequisiteSets[sourceOccurrence.effectiveRequiresRef]
 return {goalId:x.goalId,key,directRequires:x.current.goal.requires??[],
  immediateEffectiveRequires:graph.effectiveRequires.get(key)??[],inventoryEffectiveRequiresExact:stableJson(inventoryEffective)===stableJson(graph.effectiveRequires.get(key)??[]),
  containsAncestors:[...graph.ancestors(key)].sort().map(node),closureCount:closure.length,closureKeys:closure,
  nodes:queue.map(node),effectiveEdges:edges,nomineeReachability:paths,
  relevantDiagnostics:graph.diagnostics.filter(d=>d.nodeKey&&relevant.has(d.nodeKey))}
})
write('effective-prerequisite-closure.actual.json',{technicalOnly:true,semantics:'Native buildCrossLandscapeGraph: effective requires include direct and contains-inherited requires; closure repeatedly follows these effective edges. No mastery or scientific inference.',nominees,rows:closureRows,globalGraphDiagnosticCount:graph.diagnostics.length})
const hash=(p:string)=>'sha256:'+createHash('sha256').update(originalRead(p)).digest('hex')
for(const p of ['app/scripts/lib/crossSubjectRequiresInventory.ts','app/scripts/lib/crossLandscapeGraph.ts','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceTaskMaterials.ts']) reads.add(path.join(R,p))
write('native-read-dependencies.actual.json',{technicalOnly:true,files:[...reads].sort().map(p=>({path:path.relative(R,p),bytes:fs.statSync(p).size,sha256:hash(p)}))})
console.log(JSON.stringify({inventoryExact:stableJson(current)===stableJson(persisted),wholeGoals:nativeRows.filter(r=>r.wholeGoalFingerprintMatches).length,kinds:nativeRows.filter(r=>r.semanticKindMatches).length,Pconfigs:nativeP.length,PerrorCount:nativeP.reduce((s,r)=>s+r.errors.length,0),Pexact:nativeP.flatMap(r=>(r as any).requestedRecords??[]).filter(r=>r.wholePExact).length,closureRows:closureRows.length,readFiles:reads.size}))
