import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync, lstatSync } from 'node:fs'
import { resolve, relative, basename } from 'node:path'
import { pathToFileURL } from 'node:url'

const [repoArg, capsuleArg, outputArg, expectedCanonicalSHA] = process.argv.slice(2)
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
const lstatSafe=(p:string)=>{try{return lstatSync(p)}catch{return null}}
const canPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const can = json(canPath)
assert.equal(manifest.get(canPath).sha256, expectedCanonicalSHA)
assert.equal(can.goals.length, 494)
const semPath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-current494-qualified-M3-media-20261009-v4/wirtschaftswissenschaften.semantic-kinds.json'
const sem=json(semPath);assert.equal(manifest.get(semPath).sha256,'f042faa95f063ee872c6c9acd4c28c3055a9292a1c3db24ebe5af3a7cedd3374');assert.equal(sem.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').length,336)
read(relative(repo,resolve(process.argv[1])))

const nativePath = 'app/scripts/generateCurriculumQualityStatus.ts'
const nativeBytes = read(nativePath)
assert.equal(manifest.get(nativePath).sha256, '30467748de45b99e5d27cc63ddaace2430359ed4983aaf03964310d93f90f6b0')
const capsuleBytes = readFileSync(resolve(capsule, 'app/scripts/independentA_APV11_RuntimeExports.ts'))
assert(capsuleBytes.subarray(0, nativeBytes.length).equals(nativeBytes), 'whole unchanged production prefix')
assert.equal(capsuleBytes.subarray(nativeBytes.length).toString('utf8'), '\nexport { collectRenderedAtomicGoalIdsFromCompositionView, isProjectedRouteTargetGoal };\n\n')
const native: any = await import(pathToFileURL(resolve(capsule, 'app/scripts/independentA_APV11_RuntimeExports.ts')).href)
const compositionPath = 'app/src/utils/authoring/compositionViewAuthoring.ts'
const filterPath = 'app/src/utils/goalFilters.ts', typePath = 'app/src/goalTypes.ts'
read(compositionPath); read(filterPath); read(typePath);
for(const dependencyPath of ['app/src/goalTypes.ts','app/src/utils/authoring/compositionViewAuthoring.ts','app/src/utils/authoring/canonicalAuthoring.ts','app/src/utils/goalFilters.ts','app/src/utils/durationModel.ts','app/src/utils/jurisdictionMetadata.ts','app/src/utils/compositionViewRuntime.ts','app/src/utils/treeProjectionRuntime.ts']){const bytes=read(dependencyPath);assert(readFileSync(resolve(capsule,dependencyPath)).equals(bytes),'whole native collector dependency '+dependencyPath)}
 read('app/scripts/memoryCardReview.ts'); read('AGENTS.md')
const comp: any = await import(pathToFileURL(resolve(repo, compositionPath)).href)
read('app/src/utils/srsTags.ts'); read('app/src/components/srs/FlashcardDrill.tsx'); read('app/src/hooks/useFlashcardSetStatus.ts'); read('backend/src/main/java/com/skillpilot/backend/service/LearnerService.java')
const srs: any = await import(pathToFileURL(resolve(repo,'app/src/utils/srsTags.ts')).href)
const configPath = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current493-reviewed-20261009-v1/wirtschaftswissenschaften.memory336-preserved-predecessor-visibility-prefix.config.json'
const config = json(configPath), records = jsonl(config.reviewPath), cards = jsonl(config.cardReviewPath)
assert.equal(records.length, 336); assert.equal(cards.length, 66);assert.deepEqual(sorted(records.map((r:any)=>r.goalId)),sorted(sem.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId)))
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
  const srsFilterTags = srs.getSrsFilterTags(g.tags)
  const visibleRuntimeCards = runtime.cards.filter((c: any) => !srsFilterTags.length || c.tags?.some((tag: string) => srsFilterTags.includes(tag)))
  const cardRows = visibleRuntimeCards.map((c: any) => {
    const reviewed = cards.filter((r: any) => r.deckId === runtime.deckId && r.cardId === c.id)
    assert.equal(reviewed.length, 1)
    const cr = reviewed[0]
    assert(cr.originGoalIds?.length)
    assert(cr.originGoalIds.every((id: string) => rb.get(id)?.status === 'memory_required' && rb.get(id).deckIds.includes(runtime.deckId) && rb.get(id).memoryGoalIds.includes(g.id)))
    return { wholeActualCard: c, wholeExistingKeptCardDecision: cr }
  })
  const tracedOrigins = sorted(new Set<string>(cardRows.flatMap((r: any) => r.wholeExistingKeptCardDecision.originGoalIds)))
  return { actualSrsFilterTags: srsFilterTags, actualRuntimeFilteredCardIds: visibleRuntimeCards.map((c:any)=>c.id), wholeCurrentMemoryGoal: g, deckId: runtime.deckId, canonicalPath, runtimePath, wholeCanonicalDeck: canonical, runtimeWholeDeckEqualsCanonical: true, tracedOrigins, cardRows }
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
const historicalPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-M6-current34-memory-runtime-visibility-independent-a-v1/actual34-native-runtime-memory-scope-and-current66-card-traces.independent-a.json'
const historical = json(historicalPath)
assert.deepEqual(required, historical.wholeCurrent65MemoryRequiredDecisions, 'whole65 valid decisions unchanged')
for(const path of [config.reviewPath,config.cardReviewPath])assert.equal(manifest.get(path).sha256,historical.wholeInputManifest.find((m:any)=>m.path===path).sha256,'whole336 decisions/66 card judgments unchanged')
assert.deepEqual(decks.map((d:any)=>d.wholeCanonicalDeck),historical.wholeCurrentTenDecksAndAll66KeptCardTraces.map((d:any)=>d.wholeCanonicalDeck),'all ten whole decks remain exactly the historically reviewed contents')
const runtimeDeltas = views.map((v:any)=>{const old=historical.views.find((x:any)=>x.viewPath===v.viewPath); const a=old.requiredOriginRows.map((r:any)=>r.goalId),b=v.requiredOriginRows.map((r:any)=>r.goalId);return{viewPath:v.viewPath,oldRuntimeRequiredOrigins:a,newRuntimeRequiredOrigins:b,addedMemoryRequiredOriginIds:b.filter((i:string)=>!a.includes(i)),removedMemoryRequiredOriginIds:a.filter((i:string)=>!b.includes(i))}})
const visibleDeckWithoutRequiredOrigin = views.flatMap((v:any)=>v.actualVisibleMemoryGoals.filter((d:any)=>!d.tracedRequiredOriginsVisibleHere.length).map((d:any)=>({viewPath:v.viewPath,...d})))
const allRuntimeOrigins=new Set(views.flatMap((v:any)=>v.requiredOriginRows.map((r:any)=>r.goalId)));assert.equal(allRuntimeOrigins.size,65)
const blocked = views.flatMap((v: any) => v.blockedRequiredOriginRows.map((r: any) => ({ viewPath: v.viewPath, scope: v.scope, ...r })))
const result = { schemaVersion: 1, reviewer: '/root/economics_m2_source_independent_a', subject: 'Wirtschaftswissenschaften only', basis: 'Actual current CAN494 with integrated scientifically qualified M3 requires/material/APV followers and current34 country/course views; whole historical memory decisions/card contents retained, fresh runtime visibility only', status: blocked.length || visibleDeckWithoutRequiredOrigin.length ? 'BLOCK' : 'KEEP', wholeInputManifest: [...manifest.values()].sort((a, b) => a.path.localeCompare(b.path)), wholeConfig: config, wholeCurrentSemanticBinding:manifest.get(semPath), existingValidDecisionCounts: { total: 336, memoryRequired: 65, noMemoryNeeded: 271 }, existingValidCardCounts: { memoryGoals: 10, decks: 10, primaryCards: 66, kept: 66 }, nativeDiagnosticMethod: { productionWholePrefixExact: true, appendedExportsOnly: true, activeProductionChanges: 0, productionSHA256: manifest.get(nativePath).sha256, actualCollector: 'collectRenderedAtomicGoalIdsFromCompositionView', filters: 'each current courseProfile and jurisdiction; whole CrossStage root; no fabricated SekI/SekII labels', crossCheckAgainstSeparateIndependentBActualSets: false, actualSrsCardFiltersFromProductionUtilityApplied: true, historicalMemoryContentWholeEqualityChecked: true }, views, blocked, historicalRequiredOriginScopeDeltas:runtimeDeltas, visibleDeckWithoutRequiredOrigin, summary: { actualRuntimeScopes: 34, actualCountryRuntimeScopes: 32, actualNationalRuntimeScopes: 2, existingConfiguredNationalStructuralScopes: config.visibilityScopes.length, existingOld130StructuralChecksAreNot130RuntimeChecks: true, checkedRuntimeRequiredOriginOccurrences: views.reduce((n: number, v: any) => n + v.checkedMemoryRequiredOrigins, 0), missingRuntimeRequiredMemoryNodeOrKeptCardOccurrences: blocked.length, visibleDeckWithoutRequiredOriginOccurrences:visibleDeckWithoutRequiredOrigin.length, wholeGlobalRequiredOriginsCoveredInCurrent34:allRuntimeOrigins.size }, wholeCurrent65MemoryRequiredDecisions: required, wholeCurrentTenDecksAndAll66KeptCardTraces: decks, reusedUnchangedSemanticGoalCardDecisionsNotFreshFachReview: true, newSubjectClosures: 0, restoredBindingClosures: 0, strictFiveGateNetGain: 0, currentM6ApprovalClaim: false, humanApprovalReleaseTrialOrLearnerPerformanceClaim: false }
for (const m of manifest.values()) { const b = readFileSync(resolve(repo, m.path)); assert.equal(createHash('sha256').update(b).digest('hex'), m.sha256, 'end guard ' + m.path); assert.equal(b.length, m.bytes) }
assert(!lstatSafe(output), "no historical overwrite");
writeFileSync(output, JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ status: result.status, ...result.summary, blocked: blocked.map((r: any) => ({ view: r.viewPath, goalId: r.goalId })) }))
