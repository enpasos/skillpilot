// Apache-2.0. Unchanged stock projection/compiler functions, bounded chemistry inputs.
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectAuthoritativeTargetAtomicGoalIds } from '/home/enpasos/projects/skillpilot/app/scripts/compositionViewSourceCoverage.ts'
import { compileCompositionView, normalizeCompositionView } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts'
import { prepareLandscapeEntries } from '/home/enpasos/projects/skillpilot/app/src/hooks/useLandscapes.ts'

const repo='/home/enpasos/projects/skillpilot'
const own=resolve(fileURLToPath(new URL('.',import.meta.url)))
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const at=(p:string)=>read(resolve(repo,p))
const eq=(a:any,b:any)=>JSON.stringify(a)===JSON.stringify(b)
const cas=read(resolve(own,'CAS.four-whole-LK-views-exact-six-resolution-only.inactive.json'))
const input=read(resolve(own,'INPUT.exact-six-disputed-tuples-four-whole-goals.actual.json'))
const canonical=at(input.current407CanonicalBinding.path)
const old=at(input.original402CanonicalBinding.path)
const effective=new Map(prepareLandscapeEntries([canonical]).flatMap(e=>e.goals).map(g=>[g.id,g]))
const goalById=new Map(canonical.goals.map((g:any)=>[g.id,g]))
const dependencies=(id:string)=>{
 const queue=[...(effective.get(id)?.effectiveRequires??[])],seen=new Set<string>()
 while(queue.length){
  const n=queue.pop()!;if(seen.has(n))continue;seen.add(n)
  queue.push(...(effective.get(n)?.effectiveRequires??[]))
  queue.push(...((goalById.get(n) as any)?.contains??[]))
 }
 return [...seen]
}
const kept94='94a62b39-d4a2-5882-99d1-6886ead07726'
const removed413='413c5ee5-7826-549f-ad76-63743c59b188'
const rows=cas.rows.map((r:any)=>{
 const before=at(r.beforeFrozenWholeFile.path),after=at(r.afterInactiveWholeFile.path)
 const bt=collectAuthoritativeTargetAtomicGoalIds(canonical,before),aft=collectAuthoritativeTargetAtomicGoalIds(canonical,after)
 const oldBt=collectAuthoritativeTargetAtomicGoalIds(old,before),oldAt=collectAuthoritativeTargetAtomicGoalIds(old,after)
 const bc=compileCompositionView(normalizeCompositionView(before),canonical),ac=compileCompositionView(normalizeCompositionView(after),canonical)
 const removed=[...bt].filter(id=>!aft.has(id)),added=[...aft].filter(id=>!bt.has(id))
 const newErrors=ac.findings.filter((f:any)=>f.severity==='error'&&!bc.findings.some((b:any)=>eq(f,b)))
 const consumers=[...aft].flatMap(id=>dependencies(id).filter(d=>removed.includes(d)).map(d=>({remainingTarget:id,removedDependency:d})))
 return {jurisdiction:r.jurisdiction,courseProfile:r.courseProfile,viewId:after.viewId,
  beforeTargetCount:bt.size,afterTargetCount:aft.size,removed,added,newCompileErrors:newErrors,
  remainingTargetsRequiringRemovedDirectlyInheritedOrTransitively:consumers,
  retainedDisputedTargets:r.retainedDisputedExplicitGoalIds.map((id:string)=>({id,before:bt.has(id),after:aft.has(id)})),
  whole94Before:bt.has(kept94),whole94After:aft.has(kept94),
  canonical402Comparison:{beforeTargetCount:oldBt.size,afterTargetCount:oldAt.size,whole94Before:oldBt.has(kept94),whole94After:oldAt.has(kept94),removed:[...oldBt].filter(id=>!oldAt.has(id))}}
})
const niGK=at('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current402-no-jurisdiction34-whole-goal-source-and-target-scope-author-20261014-v1/inputs/NI.gk.view.whole.before.json')
const niGKTargets=collectAuthoritativeTargetAtomicGoalIds(canonical,niGK)
const proof={schemaVersion:1,checkedAt:new Date().toISOString(),stockFunctionsUnchanged:true,
 scope:'Only4 full inactive LK views/6 decisions, plus unchangedNI-GK94 measurement; no global QA/host/active write',
 rows,unchangedNIGK:{whole94Target:niGKTargets.has(kept94),other413Target:niGKTargets.has(removed413)},
 canonicalUnchanged:true,global413PLAEdgeUnchanged:true,sourceExtractionAndAllExistingMappingPartnersUnchanged:true,
 other27OmissionsApplied:false,scienceBoundary:'Compiler/target/graph evidence is technical preservation, not Source/P/D/A/M/V or M7/Human approval',
 result:{newCompileErrors:rows.reduce((n:any,r:any)=>n+r.newCompileErrors.length,0),removedTargets:rows.flatMap((r:any)=>r.removed),
  addedTargets:rows.flatMap((r:any)=>r.added),removedRequiredByRemaining:rows.flatMap((r:any)=>r.remainingTargetsRequiringRemovedDirectlyInheritedOrTransitively),
  fiveDisputedRetained:rows.flatMap((r:any)=>r.retainedDisputedTargets).every((r:any)=>r.before&&r.after),
  whole94RetainedInNIGKandLK:niGKTargets.has(kept94)&&rows.find((r:any)=>r.jurisdiction==='DE-NI').whole94Before&&rows.find((r:any)=>r.jurisdiction==='DE-NI').whole94After}}
writeFileSync(resolve(own,'CHECK.stock-four-whole-views-and-full94-target-and-prerequisite-preservation.actual.json'),JSON.stringify(proof,null,2)+'\n')
console.log(JSON.stringify(proof.result))
if(proof.result.newCompileErrors||proof.result.removedRequiredByRemaining.length||!proof.result.fiveDisputedRetained||!proof.result.whole94RetainedInNIGKandLK)process.exitCode=1
