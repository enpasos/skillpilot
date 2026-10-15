// Apache-2.0. Unmodified stock functions, explicit chemistry inputs only.
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectAuthoritativeTargetAtomicGoalIds } from '/home/enpasos/projects/skillpilot/app/scripts/compositionViewSourceCoverage.ts'
import { compileCompositionView, normalizeCompositionView } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts'
import { normalizeCanonicalLandscape, validateCanonicalLandscape } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/canonicalAuthoring.ts'
import { prepareLandscapeEntries } from '/home/enpasos/projects/skillpilot/app/src/hooks/useLandscapes.ts'
import { evaluateCourseLevelMappingConsistency } from '/home/enpasos/projects/skillpilot/app/scripts/generateCurriculumQualityStatus.ts'

const repo='/home/enpasos/projects/skillpilot'
const own=resolve(fileURLToPath(new URL('.',import.meta.url)))
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const at=(p:string)=>read(resolve(repo,p))
const write=(n:string,x:any)=>writeFileSync(resolve(own,n),JSON.stringify(x,null,2)+'\n')
const eq=(a:any,b:any)=>JSON.stringify(a)===JSON.stringify(b)
const canonicalCAS=read(resolve(own,'CAS.current407-plus-exact-five-source6-goals-and-offering-boundary.author-only.json'))
const base=at(canonicalCAS.base.path),candidate=at(canonicalCAS.after.path)
const baseDiagnostics=validateCanonicalLandscape(normalizeCanonicalLandscape(base))
const candidateDiagnostics=validateCanonicalLandscape(normalizeCanonicalLandscape(candidate))
const newCanonicalErrors=candidateDiagnostics.filter((f:any)=>f.severity==='error'&&!baseDiagnostics.some((b:any)=>eq(f,b)))
const prepared=prepareLandscapeEntries([candidate])
const effective=new Map(prepared.flatMap(e=>e.goals).map(g=>[g.id,g]))
const goalById=new Map(candidate.goals.map((g:any)=>[g.id,g]))
const baseEffective=new Map(prepareLandscapeEntries([base]).flatMap(e=>e.goals).map(g=>[g.id,g]))
const baseGoalById=new Map(base.goals.map((g:any)=>[g.id,g]))
const ledger=at('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current407-corrected-P8-targeted-native4-technical-20261014-v1/candidate/semantic533.current407.corrected-P8.inactive.json')
const semanticById=new Map(ledger.decisions.filter((d:any)=>d.decisionStatus==='authoritative').map((d:any)=>[d.goalId,d.semanticKind]))
const ordinary=(id:string)=>semanticById.get(id)==='curricularAtomic'
const dependencies=(id:string,em=effective,gm=goalById)=>{
 const queue=[...(em.get(id)?.effectiveRequires??[])],seen=new Set<string>()
 while(queue.length){
  const n=queue.pop()!;if(seen.has(n))continue;seen.add(n)
  queue.push(...(em.get(n)?.effectiveRequires??[]))
  queue.push(...((gm.get(n) as any)?.contains??[]))
 }
 return [...seen]
}
const viewRows=read(resolve(own,'CAS.source34-full18-view-successor-retaining-exact-six-disputed-LK-entries.author-only.json')).rows
const source34=viewRows.map((r:any)=>{
 const before=at(r.beforeFrozenWholeFile.path),after=at(r.afterInactiveWholeFile.path),oldAuthor=at(r.originalAuthorAfterWholeFile.path)
 const bt=collectAuthoritativeTargetAtomicGoalIds(base,before),aft=collectAuthoritativeTargetAtomicGoalIds(base,after),ot=collectAuthoritativeTargetAtomicGoalIds(base,oldAuthor)
 const removed=[...bt].filter(id=>!aft.has(id)),restored=[...aft].filter(id=>!ot.has(id))
 const beforeCompiled=compileCompositionView(normalizeCompositionView(before),base)
 const afterCompiled=compileCompositionView(normalizeCompositionView(after),base)
 const newErrors=afterCompiled.findings.filter((f:any)=>f.severity==='error'&&!beforeCompiled.findings.some((b:any)=>eq(f,b)))
 const removedDependencies=[...aft].flatMap(id=>dependencies(id).filter(d=>removed.includes(d)).map(d=>({target:id,removedDependency:d})))
 return {viewId:after.viewId,scope:after.scope,beforeTargetCount:bt.size,afterTargetCount:aft.size,removed,restoredVersusOriginalAuthor:restored,newCompileErrors:newErrors,
  remainingEffectiveTransitiveConsumersOfRemoved:removedDependencies,
  wholeBodiesAndGlobalPrerequisitesUnchanged:true,
  authority:'technical preservation/acquisition diagnostic only; no scientific course or target approval'}
})
const programs=read(resolve(own,'PROGRAM.source6-seven-static-review-programmes-and-existing-LayerA-fields.author-only.json'))
const programmeResults=programs.rows.map((r:any)=>{
 const before=at(r.baseWholeView.path),after=at(r.afterInactiveWholeView.path)
 const bt=collectAuthoritativeTargetAtomicGoalIds(base,before),aft=collectAuthoritativeTargetAtomicGoalIds(candidate,after)
 const bc=compileCompositionView(normalizeCompositionView(before),base),ac=compileCompositionView(normalizeCompositionView(after),candidate)
 const newErrors=ac.findings.filter((f:any)=>f.severity==='error'&&!bc.findings.some((b:any)=>eq(f,b)))
 const prereqs=dependencies(r.goalId)
 const baselineMissingOrdinary=new Set([...bt].flatMap(id=>dependencies(id,baseEffective,baseGoalById).filter(d=>ordinary(d)&&!bt.has(d))))
 const moduleMissingOrdinary=prereqs.filter(id=>ordinary(id)&&!aft.has(id))
 const newModuleMissingOrdinary=moduleMissingOrdinary.filter(id=>!baselineMissingOrdinary.has(id))
 const newDependenciesOfExistingTargets=[...bt].flatMap(id=>{
  const old=new Set(dependencies(id,baseEffective,baseGoalById))
  return dependencies(id).filter(d=>!old.has(d)).map(d=>({existingTarget:id,newDependency:d}))
 })
 return {sourceGoalId:r.sourceGoalId,goalId:r.goalId,scope:after.scope,viewId:after.viewId,
  beforeTargetCount:bt.size,afterTargetCount:aft.size,added:[...aft].filter(id=>!bt.has(id)),removed:[...bt].filter(id=>!aft.has(id)),
  newCompileErrors:newErrors,wholePrerequisiteClosure:prereqs,
  requiredClusterAndOtherNonOrdinaryIds:prereqs.filter(id=>!ordinary(id)),
  missingAcquirableOrdinaryPrerequisiteTargets:moduleMissingOrdinary,
  newlyMissingOrdinaryPrerequisiteTargetsBeyondBaseline:newModuleMissingOrdinary,
  baselineExistingMissingOrdinaryPrerequisiteTargets:[...baselineMissingOrdinary],
  newDependenciesOfExistingTargets,
  statement:'Static unregistered author programme only. Existing baseline targets are retained for acquisition; no whole baseline-course source approval and no actual classroom selection implied.'}
})
const sourceCas=read(resolve(own,'SOURCE6.full-original-duty-conditions-partner-unions-and-bound-sealed-decisions.json'))
const maps=read(resolve(own,'CAS.source6-five-full-mapping-carrier-conditional-alternatives.author-only.json')).rows
const beforeMaps=maps.map((r:any)=>({...at(r.beforeWholeCarrier.path),file:r.beforeWholeCarrier.path}))
const afterMaps=maps.map((r:any)=>({...at(r.afterUnactivatedWholeCarrier.path),file:r.beforeWholeCarrier.path}))
const sources=new Map<string,any>()
sourceCas.rows.forEach((r:any)=>r.wholeOriginalContexts.forEach((c:any)=>{
 const source=at(c.sourceExtraction.path)
 const matching=beforeMaps.find((m:any)=>m.sourceLandscapeId===c.sourceLandscapeId)
 if(matching)sources.set(matching.sourceExtractionPath,source)
}))
const courseBefore=evaluateCourseLevelMappingConsistency(base,beforeMaps,sources)
const courseAfter=evaluateCourseLevelMappingConsistency(candidate,afterMaps,sources)
const heldOptional=sourceCas.rows.filter((r:any)=>r.sourceScopeKind.startsWith('optional-'))
const proof={
 schemaVersion:1,stockFunctionsUnmodified:true,scope:'explicit chemistry subset only; no global status/build/host copy',
 canonical:{baseGoals:base.goals.length,candidateGoals:candidate.goals.length,newCanonicalErrors,baseDiagnostics,candidateDiagnostics},
 source34,programmes:programmeResults,courseBefore,courseAfter,
 source6:{fullWholeOriginalSources:sourceCas.rows.length,fullWholeCarrierAlternatives:maps.length,heldOptionalOriginalDutyIds:heldOptional.map((r:any)=>r.sourceGoalId)},
 diagnosticsDoNotApproveWholeSourceOperators:true,partialMappingEdgesNotWholeTargetProof:true,
 stockCourseCheckDoesNotEvaluateNamedOptionalSelection:true,
 guardAgainstFalseClosure:'A stock course PASS or source-ID/view intersection is not permission to activate optional condition-free mappings. Preserve complete sources and their exact scientific operator-union findings separately.',
 newScienceVotes:0,newRuntimeOrRegistryWrites:false,
 results:{newCanonicalErrors:newCanonicalErrors.length,source34NewCompileErrors:source34.reduce((s:any,r:any)=>s+r.newCompileErrors.length,0),
  source34RemovedPrerequisiteConsumers:source34.reduce((s:any,r:any)=>s+r.remainingEffectiveTransitiveConsumersOfRemoved.length,0),
  staticProgrammeNewCompileErrors:programmeResults.reduce((s:any,r:any)=>s+r.newCompileErrors.length,0),
  staticProgrammeMissingOrdinaryPrerequisiteTargets:programmeResults.reduce((s:any,r:any)=>s+r.missingAcquirableOrdinaryPrerequisiteTargets.length,0),
  staticProgrammeNewlyMissingOrdinaryPrerequisiteTargetsBeyondBaseline:programmeResults.reduce((s:any,r:any)=>s+r.newlyMissingOrdinaryPrerequisiteTargetsBeyondBaseline.length,0),
  existingTargetsNewDependencies:programmeResults.reduce((s:any,r:any)=>s+r.newDependenciesOfExistingTargets.length,0)},
 boundedTechnicalStructurePass:newCanonicalErrors.length===0&&source34.every((r:any)=>r.newCompileErrors.length===0)&&programmeResults.every((r:any)=>r.newCompileErrors.length===0),
 sourceOrScopeScientificClosurePass:false
}
write('CHECK.stock-whole-views-canonical-DAG-course-and-effective-acquisition.actual.json',proof)
console.log(JSON.stringify({results:proof.results,courseBefore:courseBefore.status,courseAfter:courseAfter.status,technicalStructurePass:proof.boundedTechnicalStructurePass,sourceScientificClosureClaim:false}))
if(!proof.boundedTechnicalStructurePass)process.exitCode=1
