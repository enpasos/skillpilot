// SPDX-License-Identifier: Apache-2.0
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const out=dirname(fileURLToPath(import.meta.url))
const root=resolve(out,'../../../../../../../')
const author=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-carboxylic-atomicity-source-author-20261018-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const { compileCompositionView,normalizeCompositionView,collectCompositionProjectionRoleGoalIds }=await import(pathToFileURL(resolve(root,'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const { normalizeCanonicalLandscape }=await import(pathToFileURL(resolve(root,'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const ls=read(resolve(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'))
const candidate=structuredClone(ls)
const rows=read(resolve(author,'candidates/whole-goals.before-after.pending.json')).records
for(const row of rows){const ix=candidate.goals.findIndex((g:any)=>g.id===row.goalId);if(ix<0)candidate.goals.push(row.after);else candidate.goals[ix]=row.after}
const beforeN=normalizeCanonicalLandscape(ls),afterN=normalizeCanonicalLandscape(candidate)
const beforeMap=new Map(ls.goals.map((g:any)=>[g.id,g])),afterMap=new Map(candidate.goals.map((g:any)=>[g.id,g]))
const edits=read(resolve(author,'operations/composition-explicit-role.exact-CAS.pending.json')).wholeViewBeforeAfter
const afterViews=new Map(edits.map((r:any)=>[r.path,r.after]))
const struct='a3788e40-b540-5bed-be37-b33053528422',obs='dc146a38-994d-58ec-b6a0-5210118b93ae'
// A rendered path prefix may move when a preceding sibling is inserted. Parent
// identity is the canonical goal or authored structure identity, not its index.
const flatten=(nodes:any[],parent='ROOT',result=new Map<string,string>())=>{for(const n of nodes){if(n.sourceGoalId)result.set(n.sourceGoalId,parent);const identity=n.sourceGoalId?'goal:'+n.sourceGoalId:n.runtimeId.replace(/^[^/]+\//,'');flatten(n.children??[],identity,result)}return result}
const output:any[]=[]
for(const name of readdirSync(resolve(root,'curricula/DE/Gymnasium/composition-views/chemie')).filter(n=>n.endsWith('.json')).sort()){
 const path='curricula/DE/Gymnasium/composition-views/chemie/'+name
 const b=normalizeCompositionView(read(resolve(root,path))),a=normalizeCompositionView(afterViews.get(path)??b)
 const bc=compileCompositionView(b,beforeN),ac=compileCompositionView(a,afterN)
 const bp=collectCompositionProjectionRoleGoalIds(b.rootNodes,beforeMap),ap=collectCompositionProjectionRoleGoalIds(a.rootNodes,afterMap)
 const role=(p:any,id:string)=>p.targetGoalIds.has(id)?'target':p.prerequisiteOnlyGoalIds.has(id)?'prerequisiteOnly':'absent'
 const oldRoleChanges=ls.goals.filter((g:any)=>role(bp,g.id)!==role(ap,g.id)).map((g:any)=>g.id)
 const bf=flatten(bc.compiledRootNodes),af=flatten(ac.compiledRootNodes)
 const oldParentChanges=[...bf].filter(([g,p])=>af.get(g)!==p)
 output.push({path,viewId:b.viewId,scope:b.scope,beforeFindings:bc.findings,afterFindings:ac.findings,oldStructuralRole:role(bp,struct),newObservationRole:role(ap,obs),newRoleEqualsOldStructure:role(bp,struct)===role(ap,obs),oldRoleChanges,oldParentChanges})
}
const graph:any={}
for(const key of ['contains','requires']){
 const active=new Set(),done=new Set(),cycles:any[]=[],missing:any[]=[]
 const visit=(id:string,path:string[])=>{if(active.has(id)){cycles.push([...path,id]);return}if(done.has(id))return;const g:any=afterMap.get(id);if(!g){missing.push(id);return}active.add(id);for(const next of g[key]??[])visit(next,[...path,id]);active.delete(id);done.add(id)}
 for(const g of candidate.goals)visit(g.id,[])
 graph[key]={cycles,missing}
}
const failures=output.filter(r=>r.afterFindings.some((f:any)=>f.severity==='error')||r.oldRoleChanges.length||r.oldParentChanges.length||!r.newRoleEqualsOldStructure)
const receipt={role:'Own bounded native compilation and graph verification; no normal change/full quality run',allChemistryViews:output.length,explicitCASViews:edits.length,oldTargetsRolesAndParentsPreserved:!failures.length,roleCounts:output.reduce((s:any,r:any)=>{s[r.newObservationRole]=(s[r.newObservationRole]??0)+1;return s},{}),graph,failures,views:output,sourceApproval:false,normalFilesWritten:false,fullCheckRun:false}
writeFileSync(resolve(out,'CHECK.native41-views-and-both-DAGs.actual.json'),JSON.stringify(receipt,null,2)+'\n')
if(failures.length||Object.values(graph).some((g:any)=>g.cycles.length||g.missing.length))throw new Error('Bounded native check failed; inspect receipt')
console.log(JSON.stringify({allChemistryViews:output.length,explicitCASViews:edits.length,roles:receipt.roleCounts,failures:0,normalFilesWritten:false}))
