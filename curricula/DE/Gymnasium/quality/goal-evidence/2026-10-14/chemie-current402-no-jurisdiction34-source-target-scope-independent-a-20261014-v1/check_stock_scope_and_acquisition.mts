// Apache-2.0. Narrow read-only checks with unmodified stock functions.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { collectAuthoritativeTargetAtomicGoalIds } from '/home/enpasos/projects/skillpilot/app/scripts/compositionViewSourceCoverage.ts'
import { compileCompositionView, normalizeCompositionView } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts'
import { evaluateCourseLevelMappingConsistency } from '/home/enpasos/projects/skillpilot/app/scripts/generateCurriculumQualityStatus.ts'
import { prepareLandscapeEntries } from '/home/enpasos/projects/skillpilot/app/src/hooks/useLandscapes.ts'

const repo = '/home/enpasos/projects/skillpilot'
const author = resolve(repo, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current402-no-jurisdiction34-whole-goal-source-and-target-scope-author-20261014-v1')
const own = resolve(repo, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current402-no-jurisdiction34-source-target-scope-independent-a-20261014-v1')
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const eq = (a: unknown,b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const hash = (p: string) => `sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`
const before = read(resolve(author, 'inputs/canonical.whole.before.json'))
const after = read(resolve(author, 'proposals/canonical.whole.after.NI-sigma-applicability-only.json'))
const viewCas = read(resolve(author, 'CAS.18-current-whole-composition-views.author-proposals.actual.json')).rows
const source = read(resolve(author, 'inputs/NI.source-extraction.whole.before.json'))
const mapCas = read(resolve(author, 'CAS.NI-LK-sigma-source-partial-partner.two-carriers.author-proposals.actual.json')).rows
const mapsBefore = mapCas.map((c: any) => ({ ...read(resolve(repo, c.beforeFrozenWholeFile.path)), file: c.sourceFile.path }))
const mapsAfter = mapCas.map((c: any) => ({ ...read(resolve(repo, c.afterInactiveWholeFile.path)), file: c.sourceFile.path }))
const sourceMap = new Map([[mapsBefore[0].sourceExtractionPath, source]])
const courseBefore = evaluateCourseLevelMappingConsistency(before, mapsBefore, sourceMap)
const courseAfter = evaluateCourseLevelMappingConsistency(after, mapsAfter, sourceMap)
const prepared = prepareLandscapeEntries([after])
const effectiveById = new Map(prepared.flatMap(entry => entry.goals).map(goal => [goal.id, goal]))
const canonicalById = new Map(after.goals.map((g: any) => [g.id,g]))
const sourceRows = read(resolve(author, 'INPUT.exact34-whole-goals-and-original-compiler-evidence.actual.json')).rows
const scoped = viewCas.map((cas: any) => {
 const bv = read(resolve(repo,cas.beforeFrozenWholeFile.path)), av = read(resolve(repo,cas.afterInactiveWholeFile.path))
 const bt = collectAuthoritativeTargetAtomicGoalIds(before,bv), at = collectAuthoritativeTargetAtomicGoalIds(after,av)
 const removed = [...bt].filter(id => !at.has(id)), added = [...at].filter(id => !bt.has(id))
 const direct = after.goals.filter((g: any) => at.has(g.id) && g.requires?.some((id: string) => removed.includes(id)))
 const effectiveRemovedDependencies: any[] = []
 for (const id of at) {
  const seen = new Set<string>(), queue = [...(effectiveById.get(id)?.effectiveRequires ?? [])]
  while (queue.length) {
   const dependency = queue.pop()!
   if (seen.has(dependency)) continue
   seen.add(dependency)
   if (removed.includes(dependency)) effectiveRemovedDependencies.push({target:id,removedDependency:dependency})
   const required: any = canonicalById.get(dependency)
   queue.push(...(effectiveById.get(dependency)?.effectiveRequires ?? []))
   queue.push(...(required?.contains ?? []))
  }
 }
 const bc = compileCompositionView(normalizeCompositionView(bv), before), ac = compileCompositionView(normalizeCompositionView(av), after)
 const newCompileErrors = ac.findings.filter((f: any) => f.severity === 'error' && !bc.findings.some((b: any) => eq(f,b)))
 return {viewId:av.viewId,jurisdiction:av.scope.jurisdiction,courseProfile:av.scope.courseProfile,beforeTargets:[...bt],afterTargets:[...at],removed,added,remainingDirectConsumersOfRemoved:direct.map((g:any)=>({id:g.id,title:g.title,description:g.description,requires:g.requires})),effectiveAndTransitiveRemovedDependenciesWithRequiredClusterExpansion:effectiveRemovedDependencies,baselineCompileFindings:bc.findings,candidateCompileFindings:ac.findings,newCompileErrors,selectedTuples:sourceRows.filter((r:any)=>r.jurisdiction===av.scope.jurisdiction).map((r:any)=>({goalId:r.goalId,wasTarget:bt.has(r.goalId),isTarget:at.has(r.goalId)})),retainedNICorrosionAndNanoPartners:av.scope.jurisdiction==='DE-NI'?['0908b3a2-9937-57de-8bfb-35a6de54aa1f','94a62b39-d4a2-5882-99d1-6886ead07726','dfbccd62-1203-5d1b-927d-65a4ca41bbad','5e2eb826-6e60-5273-91d6-c23f6dfa33b1'].map(id=>({goalId:id,wasTarget:bt.has(id),isTarget:at.has(id)})):[]}
})
const sigma = '3dbd84de-51cb-5ff7-801b-077a54520fed'
const niLk = scoped.find(v=>v.jurisdiction==='DE-NI'&&v.courseProfile==='LK')!, niGk = scoped.find(v=>v.jurisdiction==='DE-NI'&&v.courseProfile==='GK')!
const niSigmaPrerequisites = (canonicalById.get(sigma) as any).requires.map((id:string)=>({goalId:id,wasLKTarget:niLk.beforeTargets.includes(id),isLKTarget:niLk.afterTargets.includes(id),wholeGoal:canonicalById.get(id)}))
const courseNoNewMismatch = courseAfter.status===courseBefore.status && !(courseAfter.details??[]).some((s:string)=>(s.includes('mismatch')||s.includes('missing'))&&!(courseBefore.details??[]).includes(s))
const pass = scoped.length===18 && scoped.every(v=>v.added.length===0&&v.remainingDirectConsumersOfRemoved.length===0&&v.effectiveAndTransitiveRemovedDependenciesWithRequiredClusterExpansion.length===0&&v.newCompileErrors.length===0) && niLk.afterTargets.includes(sigma) && !niGk.afterTargets.includes(sigma) && niSigmaPrerequisites.every((p:any)=>p.isLKTarget) && courseNoNewMismatch
mkdirSync(resolve(own,'checks'),{recursive:true})
writeFileSync(resolve(own,'checks/stock-current18-target-and-full-prerequisite-acquisition.actual.json'),JSON.stringify({schemaVersion:1,stockFunctionsUnmodified:true,stockModules:['app/scripts/compositionViewSourceCoverage.ts','app/src/utils/authoring/compositionViewAuthoring.ts','app/src/hooks/useLandscapes.ts','app/scripts/generateCurriculumQualityStatus.ts'].map(path=>({path,sha256:hash(resolve(repo,path))})),scoped,niSigmaPrerequisites,NI_LK_SigmaRetained:niLk.afterTargets.includes(sigma),NI_GK_SigmaNotAdded:!niGk.afterTargets.includes(sigma),courseBefore,courseAfter,courseNoNewMismatch,baselineSourceAndAcquisitionGapsNotCertifiedClosed:true,pass},null,2)+'\n')
console.log(JSON.stringify({views:scoped.length,removedTargetEntries:scoped.reduce((n,v)=>n+v.removed.length,0),newRemovedPrerequisiteGaps:scoped.reduce((n,v)=>n+v.effectiveAndTransitiveRemovedDependenciesWithRequiredClusterExpansion.length,0),NI_LK_SigmaRetained:niLk.afterTargets.includes(sigma),courseBefore:courseBefore.status,courseAfter:courseAfter.status,pass}))
if(!pass) process.exitCode=1
