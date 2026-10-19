// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { syncBuiltinESMExports } from 'node:module'
import { fileURLToPath } from 'node:url'
import { compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import { createReviewedRequiresClosureCoverageChecker, sourceCoverageSurrogateKey } from '../../../../../../../../app/scripts/sourceCoverageEvidence.ts'

const repo=process.cwd(), own=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const author=path.resolve(own,'../chemie-current454-b732-physical-mass-source-author-20261018-v1')
const read=(p:string)=>JSON.parse(fs.readFileSync(path.resolve(repo,p),'utf8'))
const before=read(path.join(author,'before/landscape.current741.whole-before.json'))
const after=read(path.join(author,'candidate/landscape.current741.after.INACTIVE.json'))
const mapBefore=new Map<string,any>(before.goals.map((g:any)=>[g.id,g])), mapAfter=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]))
const b=after.goals.find((g:any)=>g.id.startsWith('b732')), e7=after.goals.find((g:any)=>g.id.startsWith('e7c3d20e'))
const viewCas=read(path.join(author,'operations/two-whole-goals-and-one-BY-view.CAS.pending.json')).view
const oldTargets:string[]=[],newTargets:string[]=[],e7Targets:string[]=[],viewResults:any[]=[]
const parents=(nodes:any[],parent:string|null=null,out=new Map<string,string|null>())=>{
  for(const n of nodes){const key=n.kind==='goal'?n.sourceGoalId:n.runtimeId;if(n.kind==='goal')out.set(n.sourceGoalId,parent);parents(n.children??[],key??parent,out)}return out
}
const viewDir='curricula/DE/Gymnasium/composition-views/chemie'
for(const name of fs.readdirSync(viewDir).filter(p=>p.endsWith('.view.json')).sort()){
  const p=path.join(viewDir,name),vb=read(p),va=p===viewCas.input.path?read(viewCas.afterPath):vb
  const pb=compileCompositionView(vb,before),pa=compileCompositionView(va,after)
  assert(!pb.findings.some(f=>f.severity==='error'));assert(!pa.findings.some(f=>f.severity==='error'))
  const rb=collectCompositionProjectionRoleGoalIds(vb.rootNodes,mapBefore),ra=collectCompositionProjectionRoleGoalIds(va.rootNodes,mapAfter)
  for(const id of rb.targetGoalIds)assert(ra.targetGoalIds.has(id),`Old target lost: ${vb.viewId}/${id}`)
  for(const id of rb.prerequisiteOnlyGoalIds)assert(ra.prerequisiteOnlyGoalIds.has(id),`Old prerequisiteOnly lost: ${vb.viewId}/${id}`)
  const bp=parents(pb.compiledRootNodes),ap=parents(pa.compiledRootNodes)
  for(const [id,parent]of bp)assert.equal(ap.get(id),parent,`Old visible parent changed: ${vb.viewId}/${id}`)
  const added=[...ra.targetGoalIds].filter(id=>!rb.targetGoalIds.has(id))
  assert.deepEqual(added,p===viewCas.input.path?[b.id]:[])
  if(rb.targetGoalIds.has(b.id))oldTargets.push(vb.viewId)
  if(ra.targetGoalIds.has(b.id))newTargets.push(va.viewId)
  if(ra.targetGoalIds.has(e7.id))e7Targets.push(va.viewId)
  viewResults.push({viewId:va.viewId,oldTargetsAndParentsExact:true,addedTargets:added})
}
assert.equal(viewResults.length,41);assert.equal(oldTargets.length,32);assert.equal(newTargets.length,33);assert.equal(e7Targets.length,5)
const sourceCas=read(path.join(author,'operations/nine-current-whole-source-union-CAS.pending.json'))
const replacements=new Map<string,string>(sourceCas.operations.map((o:any)=>[path.resolve(repo,o.mappingPath),path.resolve(repo,o.afterPath)]))
const mappingPaths:string[]=[]
const walk=(p:string)=>{for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isDirectory())walk(f);else if(e.name.endsWith('.json')&&read(f).targetLandscapeId===after.landscapeId)mappingPaths.push(f)}}
walk('curricula/DE/Gymnasium/mapping')
assert.equal(mappingPaths.length,82)
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const allowed=[canonical,...mappingPaths].map(p=>path.resolve(repo,p)), realRead=fs.readFileSync,realReaddir=fs.readdirSync
;(fs as any).readdirSync=(p:any,options:any)=>{
  const abs=path.resolve(String(p)),entries:any=realReaddir(p,options)
  if(!abs.startsWith(path.resolve(repo,'curricula'))||abs.includes('/quality/'))return entries
  return entries.filter((e:any)=>{const c=path.join(abs,typeof e==='string'?e:e.name);return allowed.some(a=>a===c||a.startsWith(c+path.sep))})
}
;(fs as any).readFileSync=(p:any,options:any)=>{
  const abs=path.resolve(String(p));return realRead(abs===path.resolve(repo,canonical)?path.join(author,'candidate/landscape.current741.after.INACTIVE.json'):replacements.get(abs)??p,options)
}
syncBuiltinESMExports()
const {buildApplicabilityCompilation}=await import('../../../../../../../../app/scripts/applicabilityCompiler.ts')
const compiled=buildApplicabilityCompilation()
;(fs as any).readdirSync=realReaddir;(fs as any).readFileSync=realRead;syncBuiltinESMExports()
assert.equal(compiled.reports.length,1)
const report=compiled.reports[0],goal=report.goals.find(g=>g.goalId===b.id)!
const proposed=read(path.join(author,'candidate/surrogate.four-jurisdiction-plan.NOT-ACCEPTED.json')).entries.filter((e:any)=>['DE-BY','DE-SH'].includes(e.jurisdiction)).map((e:any)=>({...e,status:'accepted'}))
const entries=new Map<string,any[]>(proposed.map((e:any)=>[sourceCoverageSurrogateKey(after.landscapeId,b.id,e.jurisdiction),[e]]))
const coverage:any[]=[]
for(const jurisdiction of b.applicability.jurisdiction){
  const checker=createReviewedRequiresClosureCoverageChecker({landscapeId:after.landscapeId,jurisdiction,goals:report.goals,canonicalGoalById:mapAfter,surrogateEntriesByKey:entries,isEligibleCanonicalGoal:g=>Boolean(g)&&!g.examData&&!(g.tags??[]).some((t:string)=>['Practice','Assessment','Motivation','Orientation','memorization'].includes(t)||t.startsWith('srs-deck:'))})
  const covered=checker.hasCoverageBackedJurisdictionEvidence(goal)
  assert.equal(covered,!['DE-SL','DE-SN'].includes(jurisdiction))
  coverage.push({jurisdiction,prospectiveCovered:covered,directSourceEvidence:goal.evidence.filter(e=>e.value===jurisdiction&&['mapping','provenance'].includes(e.kind)),newE7RequiresClosureEvidence:goal.evidence.filter(e=>e.value===jurisdiction&&e.kind==='requires-closure'&&e.source===`required by ${e7.id}`)})
}
const output={role:'INDEPENDENT_BOUNDED_NATIVE_CHECK_ONLY',normalWrites:0,productionFunctionsChanged:false,viewCount:41,oldB732TargetViews:oldTargets,newB732TargetViews:newTargets,e7TargetViews:e7Targets,oldRolesAndParentsAllExact:true,newTargetOnlyBYLK:true,nativeApplicability:{landscapes:1,mappingLocators:82,sourceOverlayFiles:9},coverageWithOnlyTwoExplicitReviewedAcquisitionRoutes:coverage,SL_SNNotClosed:true,fullCQRRun:false,nativeAMRelease:false,M7Claim:false,views:viewResults}
fs.writeFileSync(path.join(own,'CHECK.actual41-views-and-bounded-native-sourceCoverage.json'),JSON.stringify(output,null,2)+'\n')
console.log(JSON.stringify({views:41,bTargetsBefore:32,bTargetsAfter:33,e7Targets:5,sourceComponents:9,acquisitionRoutes:2,heldJurisdictions:['DE-SL','DE-SN'],normalWrites:0}))
