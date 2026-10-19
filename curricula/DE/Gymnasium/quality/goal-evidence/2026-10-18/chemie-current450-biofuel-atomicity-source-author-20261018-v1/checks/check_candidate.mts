// SPDX-License-Identifier: Apache-2.0
// Bounded author checks; no normal-file mutation or independent scientific vote.
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const base = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const root = resolve(base, '../../../../../../../')
const load = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const digest = (p: string) => createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')
const { compileCompositionView, normalizeCompositionView, collectCompositionProjectionRoleGoalIds } = await import(pathToFileURL(resolve(root, 'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const { normalizeCanonicalLandscape } = await import(pathToFileURL(resolve(root, 'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const original = load('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const candidate = JSON.parse(readFileSync(resolve(base,'candidate/landscape.after.INACTIVE.json'),'utf8'))
const originalN = normalizeCanonicalLandscape(original)
const candidateN = normalizeCanonicalLandscape(candidate)
const originalMap = new Map(original.goals.map((g: any)=>[g.id,g]))
const candidateMap = new Map(candidate.goals.map((g: any)=>[g.id,g]))
const mass = 'b732c780-beb8-55f3-8503-edd6b8677a3a'
const route = '223e33a4-5545-5332-ac4e-7d7a6cbc587c'
const exam = '2339b9b1-39c8-59f1-9108-c46966ecf1fd'
const pins = JSON.parse(readFileSync(resolve(base,'inputs/exact-input-pins.json'),'utf8'))
const changedPins = pins.pins.filter((p: any)=>digest(p.path)!==p.sha256)
const viewDir='curricula/DE/Gymnasium/composition-views/chemie'
const rows:any[]=[]
const flat=(nodes:any[],parent='ROOT', result=new Map<string,string>())=>{
  for(const n of nodes){if(n.sourceGoalId)result.set(n.sourceGoalId,parent);flat(n.children??[],n.runtimeId,result)}
  return result
}
for(const name of readdirSync(resolve(root,viewDir)).filter(n=>n.endsWith('.json')).sort()){
  const before=normalizeCompositionView(load(viewDir+'/'+name))
  const afterPath=resolve(base,'candidate/views',name)
  let after:any=before
  try{after=normalizeCompositionView(JSON.parse(readFileSync(afterPath,'utf8')))}catch(e:any){if(e.code!=='ENOENT')throw e}
  const b=compileCompositionView(before,originalN)
  const a=compileCompositionView(after,candidateN)
  const br=collectCompositionProjectionRoleGoalIds(before.rootNodes,originalMap)
  const ar=collectCompositionProjectionRoleGoalIds(after.rootNodes,candidateMap)
  const bf=flat(b.compiledRootNodes),af=flat(a.compiledRootNodes)
  const oldParentChanges=[...bf].filter(([g,p])=>af.get(g)!==p)
  const lostTargets=[...br.targetGoalIds].filter(g=>!ar.targetGoalIds.has(g))
  const lostPrerequisiteOnly=[...br.prerequisiteOnlyGoalIds].filter(g=>!ar.prerequisiteOnlyGoalIds.has(g))
  const addedTargets=[...ar.targetGoalIds].filter(g=>!br.targetGoalIds.has(g))
  const addedPrerequisiteOnly=[...ar.prerequisiteOnlyGoalIds].filter(g=>!br.prerequisiteOnlyGoalIds.has(g))
  const routeVisible=br.targetGoalIds.has(route)
  const newMassExactlyMirrorsRoute=ar.targetGoalIds.has(mass)===routeVisible
  rows.push({name,viewId:before.viewId,scope:before.scope,beforeFindings:b.findings,afterFindings:a.findings,lostTargets,lostPrerequisiteOnly,addedTargets,addedPrerequisiteOnly,oldParentChanges,newMassExactlyMirrorsRoute, massVisibleParent:af.get(mass),routeVisibleParent:af.get(route)})
}
// DAG and reference checks only on the candidate, without production generation.
const graphChecks:any={}
for(const key of ['requires','contains']){
  const visiting=new Set<string>(),done=new Set<string>(),cycles:any[]=[],missing:any[]=[]
  const visit=(id:string,path:string[])=>{
    if(visiting.has(id)){cycles.push([...path,id]);return}
    if(done.has(id))return
    const g:any=candidateMap.get(id)
    if(!g){missing.push(id);return}
    visiting.add(id)
    for(const next of g[key]??[])visit(next,[...path,id])
    visiting.delete(id);done.add(id)
  }
  for(const g of candidate.goals)visit(g.id,[])
  graphChecks[key]={cycles,missing}
}
const failures=rows.filter(r=>r.afterFindings.some((f:any)=>f.severity==='error')||r.lostTargets.length||r.lostPrerequisiteOnly.length||r.addedPrerequisiteOnly.length||r.oldParentChanges.length||!r.newMassExactlyMirrorsRoute||r.addedTargets.some((g:string)=>g!==mass))
const allowedModified=new Set([route,exam,'442c31c5-c561-5c7a-90bb-2335d779175c'])
const unexpectedGoalChanges=original.goals.filter((g:any)=>!allowedModified.has(g.id)&&JSON.stringify(g)!==JSON.stringify(candidateMap.get(g.id))).map((g:any)=>g.id)
const output={role:'Bounded AUTHOR technical checks, no scientific approval',all41Views:rows.length,changedTargetViews:rows.filter(r=>r.addedTargets.includes(mass)).length,changedPins,unexpectedGoalChanges,graphChecks,failures,rows,normalFilesWritten:false,fullCheckRun:false,independentApproval:false}
writeFileSync(resolve(base,'checks/CHECK.native41-views-DAG-inputs.actual.json'),JSON.stringify(output,null,2)+'\n')
if(changedPins.length||unexpectedGoalChanges.length||failures.length||Object.values(graphChecks).some((c:any)=>c.cycles.length||c.missing.length))throw new Error('Bounded author check failed; inspect receipt')
console.log(JSON.stringify({all41Views:rows.length,changedTargetViews:output.changedTargetViews,inputPins: pins.pins.length,failures:0,normalFilesWritten:false,independentApproval:false}))
