import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { buildApplicabilityCompilation } from './applicabilityCompiler.ts'
import { evaluateRouteProfile, evaluateGraphIntegrity, evaluateTypeConsistency, routeProfiles, buildAtomicDirectRequiresEdges, buildEffectiveRequiresEdges, collectRenderedAtomicGoalIdsFromCompositionView } from './actual-all-route-quality-original-body-export-probe.ts'
import { loadGoalBookBuildInputs, writeGoalBookModel, stableGoalBookJson, parseAndValidateGoalBookModel, fingerprintSemanticKindSourceGoal } from './goalBookModel.ts'
import { convertLearningGoal } from '../src/goalTypes'
import { normalizeCompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import { applyCompositionViewProjection } from '../src/utils/compositionViewRuntime'
import { goalMatchesFilters } from '../src/utils/goalFilters'
import { buildDirectChildrenMap, getRenderedChildIds } from '../src/utils/treeProjectionRuntime'

const root = '/home/enpasos/projects/skillpilot'
const parent = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1'
const relative = parent + '/five-legacy-phase-exams-minimal-material-requires-and-course-author-v17'
const base = root + '/' + relative
const v16 = root + '/' + parent + '/current407-P311-P8-exact-QA-resource-bindings-and-owner-union-author-v16'
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const write = (name: string, value: unknown) => {
 const p = base + '/' + name
 if (existsSync(p)) throw Error('Do not overwrite evidence: ' + p)
 writeFileSync(p, JSON.stringify(value, null, 2) + '\n')
 JSON.parse(readFileSync(p, 'utf8'))
}
const sha = (b: string | Buffer) => createHash('sha256').update(b).digest('hex')
const meta = read(base + '/actual-own-five-legacy-frozen-input-isolate-and-minimal-author-scope.receipt.json')
const iso = meta.physicalIsolate
const canPath = iso + '/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const before = read(root + '/' + meta.original407.path)
const requiresOnly = read(base + '/whole-CAN407-five-legacy-minimal-requires-only.author-candidate.json')
const courseCorrect = read(base + '/whole-CAN407-five-minimal-requires-plus-three-LK-only.author-candidate.json')
const fiveIds = read(base + '/selective-five-legacy-material-minimal-requires.author-candidate.json').changes.map((g: any) => g.goalId) as string[]
const profile = routeProfiles.find((p: any) => p.profileId === 'canonical-economics-crossstage')!
const beforeBook = parseAndValidateGoalBookModel(read(v16 + '/whole-current311-after-reviewed407-plus-independent-P8.P311.book-model.json'))
const configBefore = read(v16 + '/book-config.reviewed407-current311-selective-root-P8-preserved-other303.inert.json')
const beforeSem = read(root + '/' + configBefore.semanticKindLedgerPath)
const memoryConfig = read(root + '/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-by-ten-current311-specific-native-preparation-technical-v1/current300-source35-scope2-contract479-selective-technical-v1/memory.config.json')
const memory = readFileSync(root + '/' + memoryConfig.reviewPath, 'utf8').split(/\r?\n/u).filter(Boolean).map(l => JSON.parse(l)).filter((r: any) => r.decision === 'memory_required' || r.status === 'memory_required')
const visibleClusters = (landscape: any, viewPath: string, course: string) => {
 const entry = { meta: landscape, goals: landscape.goals.map((g: any) => convertLearningGoal(g, { landscapeId: landscape.landscapeId })) }
 const projected = applyCompositionViewProjection([entry], normalizeCompositionView(read(viewPath)))[0]
 if (!projected) throw Error('No projected course entry')
 const by = new Map(projected.goals.map(g => [g.id, g])), children = buildDirectChildrenMap(by)
 children.forEach((ids, parentId) => children.set(parentId, ids.filter(id => { const g = by.get(id); return !!g && goalMatchesFilters(g, [course]) })))
 const q = projected.goals.filter(g => (g.tags ?? []).includes('root')).map(g => g.id), seen = new Set<string>()
 while (q.length) { const id = q.pop()!; if (seen.has(id)) continue; seen.add(id); q.push(...getRenderedChildIds(id, by, children)) }
 const source = new Map(landscape.goals.map((g: any) => [g.id, g]))
 return new Set([...seen].filter(id => !id.startsWith('composition:') && ((source.get(id) as any)?.contains ?? []).length > 0))
}
const results: any[] = []
async function main() {
 for (const [label, landscape, suffix] of [['V16-retained-current407-before-five-remedy', before, null], ['V17-requires-only-three-course-claims-still-open', requiresOnly, 'requires-only'], ['V17-minimal-requires-plus-three-material-LK-only-proposal', courseCorrect, 'requires-and-course']] as const) {
  writeFileSync(canPath, JSON.stringify(landscape, null, 2) + '\n')
  const compilation = buildApplicabilityCompilation()
  const graph = evaluateGraphIntegrity(landscape, new Set(landscape.goals.map((g: any) => g.id)))
  const type = evaluateTypeConsistency(landscape)
  const route = evaluateRouteProfile(landscape, profile, compilation)
  const by = new Map(landscape.goals.map((g: any) => [g.id, g]))
  const directEdges = buildAtomicDirectRequiresEdges(landscape)
  const local: any[] = []
  for (const course of ['GK', 'LK']) {
   const viewPath = iso + '/curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-' + course.toLowerCase() + '.view.json'
   const targets = collectRenderedAtomicGoalIdsFromCompositionView(landscape, viewPath, [course], false)
   const visible = collectRenderedAtomicGoalIdsFromCompositionView(landscape, viewPath, [course], true)
   const clusters = visibleClusters(landscape, viewPath, course)
   const allVisible = new Set([...visible, ...clusters])
   const terminals = new Set<string>(profile.terminalAutonomyClusterIds.flatMap((id: string) => (by.get(id) as any)?.contains ?? []).filter((id: string) => targets.has(id)))
   const reverse = new Map<string, string[]>()
   for (const [id, reqs] of directEdges) { if (!targets.has(id)) continue; for (const req of reqs) if (targets.has(req)) reverse.set(req, [...(reverse.get(req) ?? []), id]) }
   const terminalPath = (start: string): string[] | null => {
    const q: Array<[string, string[]]> = [[start, [start]]], seen = new Set<string>()
    while (q.length) { const [id, path] = q.shift()!; if (seen.has(id)) continue; seen.add(id); if (terminals.has(id)) return path; for (const next of reverse.get(id) ?? []) q.push([next, [...path, next]]) }
    return null
   }
   const selected = landscape.goals.filter((g: any) => targets.has(g.id) && profile.goalSelector(g))
   const missing = selected.filter((g: any) => terminalPath(g.id) === null).map((g: any) => ({ goalId: g.id, title: g.title, wholeCurrentCanonicalGoal: g, genuineNewAssessmentMaterialNeeded: true }))
   const fixed: any[] = []
   for (const [contract, edges] of [['atomic-direct', directEdges], ['effective-direct-and-inherited', buildEffectiveRequiresEdges(landscape)]] as const) {
    const seeds = contract === 'atomic-direct' ? visible : allVisible
    const q = [...seeds].map(id => ({ id, path: [id] })), seen = new Set<string>(), paths = new Map<string, string[]>()
    while (q.length) { const { id, path } = q.shift()!; if (seen.has(id)) continue; seen.add(id); paths.set(id, path); for (const next of edges.get(id) ?? []) q.push({ id: next, path: [...path, next] }) }
    const missingScope = [...seen].filter(id => !allVisible.has(id)).sort().map(id => ({ goalId: id, wholeCurrentGoal: by.get(id), firstRequiringPath: paths.get(id), sourceKind: ((by.get(id) as any)?.contains ?? []).length ? 'canonicalCluster' : 'atomic' }))
    fixed.push({ edgeContract: contract, actualFullFixedpointGoalIds: [...seen].sort(), missingRequiredScopeGoals: missingScope, noDepthLimit: true })
   }
   const memoryVisibility = memory.filter((r: any) => targets.has(r.goalId)).map((r: any) => ({ goalId: r.goalId, memoryGoalIds: r.memoryGoalIds, visibleMemoryGoalIds: (r.memoryGoalIds ?? []).filter((id: string) => targets.has(id)), satisfied: (r.memoryGoalIds ?? []).some((id: string) => targets.has(id)) }))
   local.push({ courseProfile: course, actualTargetAtomicIds: [...targets].sort(), actualPrerequisiteOnlyIds: [...visible].filter(id => !targets.has(id)).sort(), actualVisibleClusterIds: [...clusters].sort(), selectedOrdinaryGoalIds: selected.map((g: any) => g.id).sort(), actualTerminalEndpointIds: [...terminals].sort(), actualSelectedTerminalRoutes: selected.map((g: any) => ({ goalId: g.id, terminalPath: terminalPath(g.id) })), missingVisibleOnlyTerminalRoutes: missing, fixedpointScope: fixed, actualRequiredMemoryVisibility: memoryVisibility, wholeViewSHA256: sha(readFileSync(viewPath)) })
  }
  let book: any = null
  if (suffix) {
   const sem = structuredClone(beforeSem)
   const semanticChanges = sem.decisions.filter((r: any) => fiveIds.includes(r.goalId)).map((r: any) => { const old = r.sourceFingerprint; r.sourceFingerprint = fingerprintSemanticKindSourceGoal(by.get(r.goalId) as any); return { goalId: r.goalId, oldSourceFingerprint: old, currentSourceFingerprint: r.sourceFingerprint, semanticKindRetained: r.semanticKind, otherWholeDecisionFieldsExact: true, refreshedInputBindingIsNotNewRequiresApproval: true } })
   write('candidate-semantic407.' + suffix + '.same-kind-five-source-bindings.inert.json', sem)
   const config = structuredClone(configBefore)
   config.semanticKindLedgerPath = relative + '/candidate-semantic407.' + suffix + '.same-kind-five-source-bindings.inert.json'
   config.outputPath = relative + '/whole-current311-after-five-legacy-' + suffix + '-with-all-P311.book-model.json'
   write('book-config.current311-five-legacy-' + suffix + '-all-unchanged-P311.inert.json', config)
   const built = (await loadGoalBookBuildInputs(relative + '/book-config.current311-five-legacy-' + suffix + '-all-unchanged-P311.inert.json', iso)).model
   await writeGoalBookModel(built, root + '/' + config.outputPath)
   const afterBy = new Map(built.pages.map(p => [p.goalId, p]))
   const pageRows = beforeBook.pages.map(p => { const a = afterBy.get(p.goalId)!; const fields = Object.keys(p).filter(k => stableGoalBookJson((p as any)[k]) !== stableGoalBookJson((a as any)[k])); return { goalId: p.goalId, actualChangedFields: fields, wholeExact: fields.length === 0, beforeWholePageSHA256: sha(stableGoalBookJson(p)), afterWholePageSHA256: sha(stableGoalBookJson(a)) } })
   const oldD46 = parseAndValidateGoalBookModel(read(root + '/' + parent + '/final-thirteen-released-current311-P311-native-preparation-v10/whole-current311-after-final403-with-all-P311.book-model.json'))
   const changedSinceD46 = oldD46.pages.filter(p => stableGoalBookJson(p) !== stableGoalBookJson(afterBy.get(p.goalId)))
   book = { actualNativeBookPath: config.outputPath, actualNativeBookDigest: built.digest, fullP311WholeUnchangedSources: config.evidenceReviewPaths, noPositiveProfileOrStatusChanges: true, semanticSourceBindings: semanticChanges, actualV16OwnerpageComparison: pageRows, actualChangedV16Owners: pageRows.filter(r => !r.wholeExact), actualWholeExactV16Owners: pageRows.filter(r => r.wholeExact).length, actualChangedSinceOriginalD46OwnerIds: changedSinceD46.map(p => p.goalId), finalDPrepareStillNotCreated: true }
  }
  results.push({ label, canonicalSHA256: sha(readFileSync(canPath)), graph, type, originalUnmodifiedRouteQualityBodyResult: route, local, nativeBookAndOwnerImpact: book, newFachlicheApproval: false })
 }
 const baseline = results[0]
 for (const result of results.slice(1)) for (const local of result.local) {
  const old = baseline.local.find((r: any) => r.courseProfile === local.courseProfile)
  if (JSON.stringify(old.selectedOrdinaryGoalIds) !== JSON.stringify(local.selectedOrdinaryGoalIds)) throw Error('Ordinary course target changed')
  if (JSON.stringify(old.actualRequiredMemoryVisibility) !== JSON.stringify(local.actualRequiredMemoryVisibility)) throw Error('Required ordinary memory visibility changed')
  if (local.actualRequiredMemoryVisibility.some((r: any) => !r.satisfied)) throw Error('Required ordinary memory hidden')
 }
 write('actual-three-variants-original-native-route-course-fixedpoint-memory-and-P311-book-impact.author-report.json', { schemaVersion: 1, kind: 'honest-five-legacy-material-minimal-ready-candidate-route-debt-impact', results, allOrdinaryGK201LK280TargetSetsExact: true, allRequiredMemoryVisibilityWholeExact: true, routeQualityCodeThresholdsAndCourseFilterFlagsUnchanged: true, all47WholeExamDataUnchanged: true, fullSourceCourseApproval: false, independentFachlichePrerequisiteOrDescriptionApproval: false, newStrictClosures: 0, liveWrites: [] })
 console.log(JSON.stringify(results.map(r => ({ label: r.label, graph: r.graph.status, type: r.type.status, rules: r.originalUnmodifiedRouteQualityBodyResult.rules.map((s: any) => ({ id: s.id, status: s.status, metrics: s.metrics })), local: r.local.map((s: any) => ({ course: s.courseProfile, ordinary: s.selectedOrdinaryGoalIds.length, missingTerminal: s.missingVisibleOnlyTerminalRoutes.length, missingScope: s.fixedpointScope.map((f: any) => ({ contract: f.edgeContract, count: f.missingRequiredScopeGoals.length })) })), actualChangedV16Owners: r.nativeBookAndOwnerImpact?.actualChangedV16Owners.length, wholeExactV16Owners: r.nativeBookAndOwnerImpact?.actualWholeExactV16Owners, actualChangedSinceD46: r.nativeBookAndOwnerImpact?.actualChangedSinceOriginalD46OwnerIds.length, bookDigest: r.nativeBookAndOwnerImpact?.actualNativeBookDigest })), null, 2))
}
main().catch(e => { console.error(e); process.exitCode = 1 })
