import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const [repoArg, capsuleArg, outputArg] = process.argv.slice(2)
const repo=resolve(repoArg), capsule=resolve(capsuleArg), output=resolve(outputArg)
const root='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M5-twelve-current-source-and-reviewed-requires-applicability-bindings-root-author-v1'
const ni='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-seven-nonuniversal-prerequisite-bounded-author-v1/three-NI-source-claims-after-real-requires-cut-author-v2'
const manifests: any[]=[]
const json=(p: string)=>{ const b=readFileSync(resolve(repo,p)); manifests.push({path:p,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length});return JSON.parse(b.toString('utf8')) }
const sorted=(s: Iterable<string>)=>[...s].sort()
const handoff=json(root+'/actual-twelve-bound-APV203-source-sequence-successor.author-handoff.INERT.json')
const baseline=json(handoff.wholeInputs[0].path), candidate=json(handoff.candidate.path)
assert.equal(manifests.at(-1).sha256,'8acc6d0af4457437021e4713ff4d35571fe8b0e41fb2a0947d16d08b66b16bcc')
const prod=readFileSync(resolve(repo,'app/scripts/generateCurriculumQualityStatus.ts'))
const cap=readFileSync(resolve(capsule,'app/scripts/generateCurriculumQualityStatus.ts'))
assert(cap.subarray(0,prod.length).equals(prod))
const native:any=await import(pathToFileURL(resolve(capsule,'app/scripts/generateCurriculumQualityStatus.ts')).href)
const comp:any=await import(pathToFileURL(resolve(repo,'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const niindex=json(ni+'/two-whole-NI-GK-LK-views-six-explicit-source-role-deltas.author.index.json')
const niPaths=new Map(niindex.views.map((v:any)=>[v.activePath,v.candidatePath]))
const rows:any[]=[]
const gb=new Map(candidate.goals.map((g:any)=>[g.id,g]))
for(const f of readdirSync(resolve(repo,'curricula/DE/Gymnasium/composition-views/wirtschaft')).filter(f=>f.endsWith('.json')).sort()) {
 const activePath='curricula/DE/Gymnasium/composition-views/wirtschaft/'+f
 const actualSelectedViewPath:string=(niPaths.get(activePath)??activePath) as string
 const v=comp.normalizeCompositionView(json(actualSelectedViewPath))
 if(v.scope.stage!=='CrossStage') continue
 const filters=[v.scope.courseProfile,v.scope.jurisdiction].filter(Boolean)
 const a:Set<string>=native.collectRenderedAtomicGoalIdsFromCompositionView(baseline,resolve(repo,actualSelectedViewPath),filters)
 const b:Set<string>=native.collectRenderedAtomicGoalIdsFromCompositionView(candidate,resolve(repo,actualSelectedViewPath),filters)
 const sa:Set<string>=native.collectRenderedAtomicGoalIdsFromCompositionView(baseline,resolve(repo,actualSelectedViewPath),filters,true)
 const sb:Set<string>=native.collectRenderedAtomicGoalIdsFromCompositionView(candidate,resolve(repo,actualSelectedViewPath),filters,true)
 const roles=comp.collectCompositionProjectionRoleGoalIds(v.rootNodes,gb)
 const oa=sorted(a).filter(id=>native.isProjectedRouteTargetGoal(gb.get(id))),ob=sorted(b).filter(id=>native.isProjectedRouteTargetGoal(gb.get(id)))
 const added=ob.filter(id=>!oa.includes(id)),removed=oa.filter(id=>!ob.includes(id))
 rows.push({activeViewPath:activePath,actualSelectedViewPath,scope:v.scope,scopeFilters:filters,NIReviewedSixSourceRoleFollowerUsed:niPaths.has(activePath),ordinaryTargetsBefore:oa,ordinaryTargetsAfter:ob,addedOrdinaryTargets:added,removedOrdinaryTargets:removed,addedVisibleAllLeafTargets:sorted(b).filter(id=>!a.has(id)),removedVisibleAllLeafTargets:sorted(a).filter(id=>!b.has(id)),addedActualScopedExplicitSupport:sorted(sb).filter(id=>!sa.has(id)),removedActualScopedExplicitSupport:sorted(sa).filter(id=>!sb.has(id)),actualRawPrerequisiteOnlyIds:sorted(roles.prerequisiteOnlyGoalIds),wholeFinalScopeSupport:sorted(sb)})
}
assert.equal(rows.length,34)
const result={status:'ACTUAL_NATIVE_READONLY_INTAKE_NOT_SCIENTIFIC_APPROVAL',wholeInputManifest:manifests,wholeCANInputHashes:{before:handoff.wholeInputs[0].sha256,after:handoff.candidate.sha256},unchangedNativeProductionSHA256:createHash('sha256').update(prod).digest('hex'),nativeExactPrefixWithDiagnosticExportsOnly:true,actualViews:rows,summary:{views:34,countryViews:32,nationalViews:2,ordinaryTargetOccurrencesBefore:rows.reduce((n,r)=>n+r.ordinaryTargetsBefore.length,0),ordinaryTargetOccurrencesAfter:rows.reduce((n,r)=>n+r.ordinaryTargetsAfter.length,0),addedOrdinaryTargetOccurrences:rows.reduce((n,r)=>n+r.addedOrdinaryTargets.length,0),removedOrdinaryTargetOccurrences:rows.reduce((n,r)=>n+r.removedOrdinaryTargets.length,0),addedSupportOccurrences:rows.reduce((n,r)=>n+r.addedActualScopedExplicitSupport.length,0),removedSupportOccurrences:rows.reduce((n,r)=>n+r.removedActualScopedExplicitSupport.length,0)},sourceScienceThresholdHumanReleaseOrM5M6Claim:false,activeWrites:0}
for(const m of manifests){const b=readFileSync(resolve(repo,m.path));assert.equal(createHash('sha256').update(b).digest('hex'),m.sha256);assert.equal(b.length,m.bytes)}
writeFileSync(output,JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify(result.summary))
console.log(JSON.stringify(rows.filter(r=>r.addedOrdinaryTargets.length||r.removedOrdinaryTargets.length||r.addedActualScopedExplicitSupport.length||r.removedActualScopedExplicitSupport.length).map(r=>({scope:r.scope,added:r.addedOrdinaryTargets,removed:r.removedOrdinaryTargets,addedSupport:r.addedActualScopedExplicitSupport,removedSupport:r.removedActualScopedExplicitSupport}))))
