import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync, lstatSync } from 'node:fs'
import { resolve, relative, basename } from 'node:path'
import { pathToFileURL } from 'node:url'

const [repoArg, capsuleArg, outputArg] = process.argv.slice(2)
const repo = resolve(repoArg), capsule = resolve(capsuleArg), output = resolve(outputArg)
const manifest = new Map<string, any>()
const read = (p: string) => {
  const abs = resolve(repo, p), bytes = readFileSync(abs)
  assert(!lstatSync(abs).isSymbolicLink(), p)
  manifest.set(relative(repo, abs), { path: relative(repo, abs), sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length })
  return bytes
}
const json = (p: string) => JSON.parse(read(p).toString('utf8'))
const jsonl = (p: string) => read(p).toString('utf8').split(/\r?\n/).filter(Boolean).map(s => JSON.parse(s))
const sorted = (s: Iterable<string>) => [...s].sort()
const canPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const can = json(canPath)
assert.equal(manifest.get(canPath).sha256, 'c45874840ce8e35ca2db9d747c3876c8e54779ed97ab33a24d7ae11ba0810e13')
assert.equal(can.goals.length, 493)
const nativePath = 'app/scripts/generateCurriculumQualityStatus.ts'
const nativeBytes = read(nativePath)
assert.equal(manifest.get(nativePath).sha256, '44992052fe9610afdf6ab25979659fa26978c313efb9068b7878d711e831e062')
const capsuleBytes = readFileSync(resolve(capsule, nativePath))
assert(capsuleBytes.subarray(0, nativeBytes.length).equals(nativeBytes), 'whole unchanged production prefix')
assert.equal(capsuleBytes.subarray(nativeBytes.length).toString('utf8'), '\nexport { routeProfiles, evaluateRouteProfile, collectRenderedAtomicGoalIdsFromCompositionView, buildAtomicDirectRequiresEdges, buildEffectiveRequiresEdges, createPathChecker, isProjectedRouteTargetGoal };\n')
const native: any = await import(pathToFileURL(resolve(capsule, nativePath)).href)
const compositionPath = 'app/src/utils/authoring/compositionViewAuthoring.ts'
const filterPath = 'app/src/utils/goalFilters.ts', typePath = 'app/src/goalTypes.ts'
read(compositionPath); read(filterPath); read(typePath); read('app/scripts/memoryCardReview.ts'); read('AGENTS.md')
const comp: any = await import(pathToFileURL(resolve(repo, compositionPath)).href)
const configPath = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current493-reviewed-20261009-v1/wirtschaftswissenschaften.memory336-preserved-predecessor-visibility-prefix.config.json'
const config = json(configPath), records = jsonl(config.reviewPath), cards = jsonl(config.cardReviewPath)
assert.equal(records.length, 336); assert.equal(cards.length, 66)
const required = records.filter((r: any) => r.status === 'memory_required')
assert.equal(required.length, 65)
assert.equal(records.filter((r: any) => r.status === 'no_memory_needed').length, 271)
assert(cards.every((r: any) => r.status === 'kept' && r.necessary === true))
const gb = new Map<string, any>(can.goals.map((g: any) => [g.id, g]))
const rb = new Map<string, any>(records.map((r: any) => [r.goalId, r]))
const memoryGoals = can.goals.filter((g: any) => g.nodeKind === 'memory' || g.tags?.includes('memorization') || g.tags?.some((t: string) => t.startsWith('srs-deck:')))
assert.equal(memoryGoals.length, 10)
const decks = memoryGoals.map((g: any) => {
  const source = g.extendedData.vocabularySource
  assert.equal(typeof source, 'string')
  const runtimePath = 'app/public' + source
  const canonicalPath = 'curricula/DE/Gymnasium/memory-decks/' + basename(source)
  const runtime = json(runtimePath), canonical = json(canonicalPath)
  assert.deepEqual(runtime, canonical, 'whole runtime/canonical deck equality')
  assert.deepEqual(g.tags.filter((t: string) => t.startsWith('srs-deck:')).map((t: string) => t.slice(9)), [runtime.deckId])
  const cardRows = runtime.cards.map((c: any) => {
    const reviewed = cards.filter((r: any) => r.deckId === runtime.deckId && r.cardId === c.id)
    assert.equal(reviewed.length, 1)
    const cr = reviewed[0]
    assert(cr.originGoalIds?.length)
    assert(cr.originGoalIds.every((id: string) => rb.get(id)?.status === 'memory_required' && rb.get(id).deckIds.includes(runtime.deckId) && rb.get(id).memoryGoalIds.includes(g.id)))
    return { wholeActualCard: c, wholeExistingKeptCardDecision: cr }
  })
  const tracedOrigins = sorted(new Set<string>(cardRows.flatMap((r: any) => r.wholeExistingKeptCardDecision.originGoalIds)))
  return { wholeCurrentMemoryGoal: g, deckId: runtime.deckId, canonicalPath, runtimePath, wholeCanonicalDeck: canonical, runtimeWholeDeckEqualsCanonical: true, tracedOrigins, cardRows }
})
assert.equal(decks.reduce((n: number, d: any) => n + d.cardRows.length, 0), 66)
const deckByGoal = new Map(decks.map((d: any) => [d.wholeCurrentMemoryGoal.id, d]))
const viewDir = 'curricula/DE/Gymnasium/composition-views/wirtschaft'
const views = readdirSync(resolve(repo, viewDir)).filter(f => f.endsWith('.json')).sort().map(f => {
  const path = `${viewDir}/${f}`, v = comp.normalizeCompositionView(json(path))
  if (v.scope.stage !== 'CrossStage') return undefined
  const filters = [v.scope.courseProfile, v.scope.jurisdiction].filter(Boolean)
  const visible: Set<string> = native.collectRenderedAtomicGoalIdsFromCompositionView(can, resolve(repo, path), filters)
  const unfiltered: Set<string> = native.collectRenderedAtomicGoalIdsFromCompositionView(can, resolve(repo, path))
  const rows = required.filter((r: any) => visible.has(r.goalId)).map((r: any) => {
    const visibleMemoryIds = r.memoryGoalIds.filter((id: string) => visible.has(id))
    const visibleKeptCardKeys = visibleMemoryIds.flatMap((id: string) => deckByGoal.get(id).cardRows.filter((c: any) => c.wholeExistingKeptCardDecision.originGoalIds.includes(r.goalId)).map((c: any) => `${c.wholeExistingKeptCardDecision.deckId}::${c.wholeExistingKeptCardDecision.cardId}`))
    return { goalId: r.goalId, referencedMemoryGoalIds: r.memoryGoalIds, deckIds: r.deckIds, actualVisibleReferencedMemoryGoalIds: visibleMemoryIds, actualVisibleKeptRequiredCardKeys: visibleKeptCardKeys, decision: visibleMemoryIds.length && visibleKeptCardKeys.length ? 'KEEP' : 'BLOCK' }
  })
  const visibleMemory = memoryGoals.filter((g: any) => visible.has(g.id)).map((g: any) => ({ goalId: g.id, deckId: deckByGoal.get(g.id).deckId, tracedRequiredOriginsVisibleHere: deckByGoal.get(g.id).tracedOrigins.filter((id: string) => visible.has(id)), validGlobalCardTraceReused: true }))
  return { viewPath: path, wholeInputSHA256: manifest.get(path).sha256, scope: v.scope, actualScopeFilters: filters, actualVisibleAllLeafTargetIds: sorted(visible), actualVisibleMemoryGoals: visibleMemory, rawMemoryNodesExcludedByActualRuntimeFilters: memoryGoals.filter((g: any) => unfiltered.has(g.id) && !visible.has(g.id)).map((g: any) => g.id), requiredOriginRows: rows, checkedMemoryRequiredOrigins: rows.length, blockedRequiredOriginRows: rows.filter((r: any) => r.decision === 'BLOCK') }
}).filter(Boolean)
assert.equal(views.length, 34)
const bPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-M4-current34-country-terminal-and-route-intake-independent-b-v1/actual-whole90-by34-view-native-route-and-source-binding-intake.json'
const independentlyProducedB = json(bPath)
assert(views.every((v: any) => JSON.stringify(v.actualVisibleAllLeafTargetIds) === JSON.stringify(independentlyProducedB.viewRows.find((x: any) => x.viewPath === v.viewPath).actualVisibleAllLeafTargetIds)), 'independently executed actual sets agree with B')
const blocked = views.flatMap((v: any) => v.blockedRequiredOriginRows.map((r: any) => ({ viewPath: v.viewPath, scope: v.scope, ...r })))
const result = { schemaVersion: 1, reviewer: '/root/economics_m2_source_independent_a', subject: 'Wirtschaftswissenschaften only', basis: 'Active integrated M2 CAN493 and actual34 CrossStage views; seven-requires M3 candidate remains inert and is not this runtime input', status: blocked.length ? 'BLOCK' : 'KEEP', wholeInputManifest: [...manifest.values()].sort((a, b) => a.path.localeCompare(b.path)), wholeConfig: config, existingValidDecisionCounts: { total: 336, memoryRequired: 65, noMemoryNeeded: 271 }, existingValidCardCounts: { memoryGoals: 10, decks: 10, primaryCards: 66, kept: 66 }, nativeDiagnosticMethod: { productionWholePrefixExact: true, appendedExportsOnly: true, activeProductionChanges: 0, productionSHA256: manifest.get(nativePath).sha256, actualCollector: 'collectRenderedAtomicGoalIdsFromCompositionView', filters: 'each current courseProfile and jurisdiction; whole CrossStage root; no fabricated SekI/SekII labels', crossCheckAgainstSeparateIndependentBActualSets: true }, views, blocked, summary: { actualRuntimeScopes: 34, actualCountryRuntimeScopes: 32, actualNationalRuntimeScopes: 2, existingConfiguredNationalStructuralScopes: config.visibilityScopes.length, existingOld130StructuralChecksAreNot130RuntimeChecks: true, checkedRuntimeRequiredOriginOccurrences: views.reduce((n: number, v: any) => n + v.checkedMemoryRequiredOrigins, 0), missingRuntimeRequiredMemoryNodeOrKeptCardOccurrences: blocked.length }, wholeCurrent65MemoryRequiredDecisions: required, wholeCurrentTenDecksAndAll66KeptCardTraces: decks, reusedUnchangedSemanticGoalCardDecisionsNotFreshFachReview: true, newSubjectClosures: 0, restoredBindingClosures: 0, strictFiveGateNetGain: 0, currentM6ApprovalClaim: false, humanApprovalReleaseTrialOrLearnerPerformanceClaim: false }
for (const m of manifest.values()) { const b = readFileSync(resolve(repo, m.path)); assert.equal(createHash('sha256').update(b).digest('hex'), m.sha256, 'end guard ' + m.path); assert.equal(b.length, m.bytes) }
writeFileSync(output, JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ status: result.status, ...result.summary, blocked: blocked.map((r: any) => ({ view: r.viewPath, goalId: r.goalId })) }))
